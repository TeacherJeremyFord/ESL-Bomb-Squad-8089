/* ===== M11 MONSTER CLINIC (B1 tier: 1-3 heads, thermometer, not-sick trap, eye / serial rule) =====
 * Design: docs/design/modules/M11_monster_clinic.md · Build spec: docs/design/modules/build/M11_build.md
 * The Defuser is the NURSE (sees and touches the monster); the Expert is the DOCTOR (has the Doctor Book).
 * Touch the right parts in the right order. Strikes never reset progress.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)], int = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const HAIRS = ["black", "brown", "red", "purple", "yellow"];

  const makeMonster = () => {
    for (;;) {
      const n = int(1, 3), sick = Math.random() >= 1 / 6;
      const heads = Array.from({ length: n }, () => ({ eyes: int(1, 5), ears: int(0, 3), noses: Math.random() < 0.2 ? 2 : 1, hair: Math.random() < 0.5 ? pick(HAIRS) : null }));
      const r = Math.random(), temp = r < 0.35 ? "hot" : r < 0.7 ? "cold" : "normal";
      const eyes = heads.map((h) => h.eyes), total = eyes.reduce((a, b) => a + b, 0);
      if (total > 9) continue;                                                                  // N is one serial digit
      if (temp === "hot" && n >= 2 && eyes.filter((e) => e === Math.max(...eyes)).length !== 1) continue; // "the head with more eyes" never ties
      if (n === 3 && heads.filter((h) => h.ears === 0).length !== 1) continue;                    // "the face with no ears" is unique
      if (n === 2 && heads.every((h) => h.ears === 0)) continue;                                  // two heads need an ear to touch
      return { sick, skin: sick ? "green-spots" : pick(["blue", "pink", "purple", "yellow"]), temp, heads, hands: int(2, 4), legs: int(2, 6) };
    }
  };

  // The Doctor Book, as steps. Each step: { kind: ok | tool | touch | touch-all, tool?, targets: [ids], say }
  const solution = (m, serial) => {
    if (!m.sick) return [{ kind: "ok", targets: [], say: "OK" }];
    const steps = [], H = m.heads.map((h, i) => ({ ...h, i: i + 1 }));
    const ids = (h, part, k) => Array.from({ length: k }, (_, j) => `h${h.i}-${part}${j + 1}`);
    const legs = Array.from({ length: m.legs }, (_, k) => `leg${k + 1}`), hands = Array.from({ length: m.hands }, (_, k) => `hand${k + 1}`);
    if (m.temp === "hot") { const h = H.reduce((a, b) => (b.eyes > a.eyes ? b : a)); steps.push({ kind: "tool", tool: "cold-pack", targets: [`h${h.i}-head`, `h${h.i}-hair`], say: "cold pack on the head" }); }
    if (m.temp === "cold") steps.push({ kind: "tool", tool: "hot-bag", targets: legs, say: "hot water bag on a leg" });
    if (H.length === 1) steps.push({ kind: "touch", targets: ids(H[0], "nose", H[0].noses), say: "the nose" }, { kind: "touch", targets: ["h1-mouth"], say: "the mouth" }, { kind: "touch", targets: hands, say: "a hand" });
    if (H.length === 2) { const ears = H.flatMap((h) => ids(h, "ear", h.ears)); steps.push({ kind: "touch", targets: ears, say: "an ear" }, { kind: "touch", targets: ears, say: "an ear" }, { kind: "touch", targets: legs, say: "a leg" }); }
    if (H.length === 3) { const h = H.find((x) => x.ears === 0); steps.push({ kind: "touch", targets: [`h${h.i}-face`], say: "the face with no ears" }, { kind: "touch", targets: ids(h, "nose", h.noses), say: "its nose" }, { kind: "touch", targets: [`h${h.i}-mouth`], say: "its mouth" }); }
    const N = H.reduce((s, h) => s + h.eyes, 0);
    if (String(serial).replace(/\D/g, "").includes(String(N))) steps.push({ kind: "touch-all", targets: H.flatMap((h) => ids(h, "eye", h.eyes)), say: "every eye" });
    else if (H.some((h) => h.hair)) steps.push({ kind: "touch", targets: H.filter((h) => h.hair).map((h) => `h${h.i}-hair`), say: "the hair" });
    else steps.push({ kind: "touch", targets: H.map((h) => `h${h.i}-head`), say: "its head" }, { kind: "touch", targets: H.map((h) => `h${h.i}-head`), say: "its head" });
    return steps;
  };

  const THERMO = { hot: ["#ff3b3b", "💧"], cold: ["#3f7fe8", "❄"], normal: ["#3bff6a", ""] };

  /* --- Defuser (NURSE) --- */
  const MonsterClinicModule = ({ serialNumber, onSuccess, onStrike }) => {
    const [m] = useState(makeMonster);
    const [steps] = useState(() => solution(m, serialNumber));
    const [pos, setPos] = useState(0);
    const [touched, setTouched] = useState([]);
    const [tool, setTool] = useState(null);
    const [flashOn, setFlash] = useState(false);
    const [won, setWon] = useState(false);
    TEST.monster = m; TEST.steps = steps; TEST.pos = pos;
    const pic = PX.patient(m), step = steps[pos];
    const strike = () => { onStrike(); setFlash(true); setTimeout(() => setFlash(false), 400); };
    const advance = () => { const p = pos + 1; setPos(p); setTouched([]); if (p >= steps.length) { setWon(true); onSuccess(); } };

    const tap = (id) => {
      if (won) return;
      if (tool) { const t = tool; setTool(null); return step.kind === "tool" && step.tool === t && step.targets.includes(id) ? advance() : strike(); }
      if (step.kind === "touch" && step.targets.includes(id)) return advance();
      if (step.kind === "touch-all" && step.targets.includes(id)) {
        if (touched.includes(id)) return; // an eye you already touched: no strike
        const t = [...touched, id]; setTouched(t); if (t.length === step.targets.length) advance(); return;
      }
      strike();
    };
    const ok = () => { if (won) return; if (step.kind === "ok") advance(); else strike(); };

    return (<div className={`module-content mc ${flashOn ? "mc-strike" : ""}`}><h3>🩺 MONSTER CLINIC — NURSE</h3>
      <div className="mc-heart"><span>❤</span><div><i style={{ width: `${(pos / steps.length) * 100}%` }} /></div></div>
      <div className="mc-stage">
        <div className="mc-patient" style={{ aspectRatio: `${pic.w} / ${pic.h}` }}>
          <img className="pixel-art" src={pic.url} alt="monster" />
          {pic.parts.map((p) => (<button key={p.id} className={`mc-hit ${touched.includes(p.id) ? "done" : ""} ${tool ? "tooling" : ""}`} onClick={() => tap(p.id)}
            style={{ left: `${(p.x / pic.w) * 100}%`, top: `${(p.y / pic.h) * 100}%`, width: `${(p.w / pic.w) * 100}%`, height: `${(p.h / pic.h) * 100}%` }} aria-label={p.id} />))}
        </div>
        <div className="mc-thermo" style={{ "--t": THERMO[m.temp][0] }}><div className="mc-bulb" /><span>{THERMO[m.temp][1]}</span></div>
      </div>
      <div className="mc-tools">
        {["cold-pack", "hot-bag"].map((t) => (<button key={t} className={`lr-item ${tool === t ? "tm-on" : ""}`} onClick={() => setTool(tool === t ? null : t)} disabled={won}>
          <img className="pixel-art" src={PX.tool(t)} alt={t} width={40} height={40} /><span>{t === "cold-pack" ? "cold pack" : "hot water bag"}</span></button>))}
        <button className="submit-btn mc-ok" onClick={ok} disabled={won}>OK</button>
      </div>
      <p className="module-hint">{tool ? "Now press a part of the monster." : "Press a part to touch it. Press a tool, then a part, to use it."}</p>
    </div>);
  };

  /* --- Expert (DOCTOR) --- */
  const MonsterClinicManual = () => (<div>
    <h4>DOCTOR BOOK</h4>
    <p><strong>Step 0. Is it sick?</strong> A sick monster has a green face with spots. If the face is not green, it is <strong>not sick</strong>. Do not touch it! Press OK.</p>
    <p><strong>Step 1. Is it hot or cold?</strong></p>
    <p>If it is hot, it has a fever. Put the cold pack on its head. (If it has two or three heads: the head with more eyes.)</p>
    <p>If it is cold, put the hot water bag on its legs. (Any leg.)</p>
    <p>If it is not hot and not cold, go to Step 2.</p>
    <p><strong>Step 2. How many heads does it have?</strong></p>
    <table className="manual-table"><thead><tr><th>Heads</th><th>Touch, in this order</th></tr></thead><tbody>
      <tr><td>1</td><td>nose → mouth → a hand</td></tr><tr><td>2</td><td>an ear → an ear (any ear, the same ear is OK) → a leg</td></tr><tr><td>3</td><td>the face with no ears → its nose → its mouth</td></tr>
    </tbody></table>
    <p><strong>Step 3. How many eyes does it have?</strong> (all heads)</p>
    <p>Now look at the bomb's serial number. Is that number in the serial?</p>
    <p><strong>Yes:</strong> touch every eye one time.</p>
    <p><strong>No:</strong> touch the hair. If it has no hair, touch its head two times.</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .mc-strike{box-shadow:inset 0 0 0 4px #ff3b3b;}
    .mc-heart{display:flex;align-items:center;gap:6px;margin-bottom:6px;} .mc-heart span{color:#ff5a7a;font-size:1.2rem;}
    .mc-heart div{flex:1;height:10px;background:#333;border-radius:5px;overflow:hidden;} .mc-heart i{display:block;height:100%;background:#ff5a7a;transition:width 0.3s;}
    .mc-stage{display:flex;gap:6px;align-items:center;background:#d8ecf7;border-radius:6px;padding:4px;}
    .mc-patient{position:relative;flex:1;max-width:330px;margin:0 auto;}
    .mc-patient>img{width:100%;height:100%;display:block;}
    .mc-hit{position:absolute;background:transparent;border:none;padding:0;cursor:pointer;border-radius:30%;}
    .mc-hit:active{background:#ffffff55;} .mc-hit.done{box-shadow:0 0 0 2px #ffcc00;background:#ffcc0033;} .mc-hit.tooling:hover{background:#ffffff33;}
    .mc-thermo{width:22px;height:110px;border:3px solid #1b1424;border-radius:11px;background:linear-gradient(to top,var(--t) 0 72%,#fff 72%);position:relative;flex:none;}
    .mc-bulb{position:absolute;bottom:-12px;left:-6px;width:28px;height:28px;border-radius:50%;background:var(--t);border:3px solid #1b1424;}
    .mc-thermo span{position:absolute;top:-4px;left:26px;font-size:1.1rem;}
    .mc-tools{display:flex;gap:6px;margin-top:8px;} .mc-tools .lr-item{flex:1;} .mc-ok{flex:1;min-height:56px;font-size:1.2rem;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "monsterClinic", name: "🩺 Monster Clinic", type: "monsterClinic", difficulty: "B1",
    Component: MonsterClinicModule, Manual: MonsterClinicManual,
    _test: Object.assign(TEST, { makeMonster, solution }),
  });
})();
