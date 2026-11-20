/* ===== M21 LINEUP (A1: tall/short, light/dark hair, long/short hair, fat/thin, blue/brown eyes) =====
 * The bomb shows a CODENAME and six people in front of a height wall. The Expert finds the codename in a fixed
 * table and reads out five things about that person. The Defuser presses the person, then ARREST.
 * Every thing is two-way (tall/short …), and the lineup is built so that:
 *   - no two things are ever enough to find the person (someone else always matches both),
 *   - most sets of three are not enough either (at least 8 of the 10), so the players need 4-5 things,
 *   - every thing has at least two people on each side (no lone "short" person),
 *   - the person is never the one who looks most like everyone else (no guessing from the lineup alone).
 * LIGHT hair is drawn white, blond or light brown (random); DARK hair is black.
 * Wrong: STRIKE, new codename and new lineup. Fixed manual (no sync number).
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const bits = (x) => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };

  /* --- the five things: bit i of a pattern picks value [0] or [1] --- */
  const TRAITS = [
    { col: "TALL / SHORT", vals: ["TALL", "SHORT"] },
    { col: "HAIR COLOR", vals: ["LIGHT", "DARK"] },
    { col: "LONG / SHORT HAIR", vals: ["LONG", "SHORT"] },
    { col: "FAT / THIN", vals: ["FAT", "THIN"] },
    { col: "EYES", vals: ["BLUE", "BROWN"] },
  ];
  // Codename -> pattern (5 bits, in TRAITS order). All twelve are different.
  const AGENTS = [
    ["FOX", 0b00000], ["OWL", 0b11111], ["BEAR", 0b01010], ["WOLF", 0b10101], ["LION", 0b00111], ["TIGER", 0b11000],
    ["SHARK", 0b01101], ["EAGLE", 0b10010], ["SNAKE", 0b00011], ["PANDA", 0b11100], ["CAT", 0b10110], ["BAT", 0b01001],
  ].map(([name, p]) => ({ name, p }));
  const value = (p, i) => TRAITS[i].vals[(p >> i) & 1];

  /* --- every good lineup shape: five decoy masks (XOR with the culprit's pattern) --- */
  const SHAPES = (() => {
    const pairs = [], triples = [], out = [];
    for (let m = 0; m < 32; m++) { if (bits(m) === 2) pairs.push(m); if (bits(m) === 3) triples.push(m); }
    const covers = (d, S) => d.some((x) => (x & S) === 0); // someone else matches the culprit on every thing in S
    const go = (s, d) => {
      if (d.length === 5) {
        if (!pairs.every((S) => covers(d, S))) return;
        if (triples.filter((S) => covers(d, S)).length < 8) return;
        for (let i = 0; i < 5; i++) { const n = d.filter((x) => (x >> i) & 1).length; if (n < 2 || n > 4) return; }
        const all = [0, ...d], tot = all.map((a) => all.reduce((s2, b) => s2 + bits(a ^ b), 0));
        if (!tot.slice(1).some((t) => t <= tot[0])) return;
        out.push(d); return;
      }
      for (let m = s; m < 32; m++) go(m + 1, [...d, m]);
    };
    go(1, []);
    return out;
  })();

  const HAIR = (dark) => (dark ? "black" : pick(["white", "blond", "lightbrown"]));
  const person = (p) => ({
    p, height: (p & 1) ? "short" : "tall", hair: HAIR((p >> 1) & 1), hairLen: (p >> 2) & 1 ? "short" : "long",
    build: (p >> 3) & 1 ? "thin" : "fat", eye: (p >> 4) & 1 ? "brown" : "blue", outfit: Math.floor(Math.random() * 4),
  });
  const makeRound = (avoid) => {
    const agent = pick(AGENTS.filter((a) => a.name !== avoid));
    const shape = pick(SHAPES);
    const people = shuffle([agent.p, ...shape.map((m) => agent.p ^ m)].map(person));
    return { agent: agent.name, people, answer: people.findIndex((x) => x.p === agent.p) };
  };
  // Who fits the things in `mask` (bit i = thing i is known)?
  const fits = (round, mask) => {
    const target = AGENTS.find((a) => a.name === round.agent).p;
    return round.people.map((x, k) => (((x.p ^ target) & mask) === 0 ? k : -1)).filter((k) => k >= 0);
  };

  const chime = (ok) => { try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
    o.frequency.value = ok ? 880 : 140; o.type = ok ? "sine" : "square"; g.gain.value = 0.08; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + (ok ? 0.25 : 0.4)); } catch (e) {} };

  /* --- Defuser --- */
  const Component = ({ onSuccess, onStrike }) => {
    const [round, setRound] = useState(() => makeRound());
    const [sel, setSel] = useState(null);
    const [phase, setPhase] = useState("play"); // play | shake | won
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    Object.assign(TEST, { round, phase, sel });
    const busy = phase !== "play";
    const arrest = () => {
      if (busy || sel === null) return;
      if (sel === round.answer) { chime(true); setPhase("won"); onSuccess(); return; }
      chime(false); onStrike(); setPhase("shake");
      timer.current = setTimeout(() => { setRound((r) => makeRound(r.agent)); setSel(null); setPhase("play"); }, 900);
    };
    return (<div className="module-content lu"><h3>🕵️ LINEUP</h3>
      <div className="lu-code">CODENAME<b>{round.agent}</b></div>
      <div className={`lu-wall lu-${phase}`}>
        <div className="lu-lines" />
        <div className="lu-row">{round.people.map((x, k) => (
          <button key={k} className={`lu-p ${sel === k ? "sel" : ""} ${phase === "won" && k === round.answer ? "right" : ""}`} disabled={busy} onClick={() => setSel(k)}>
            <img className="pixel-art" src={PX.suspect(x)} alt="" />
            <span className="lu-num">{k + 1}</span>
          </button>))}</div>
        {phase === "shake" && <div className="lu-flash">✖ WRONG PERSON</div>}
        {phase === "won" && <div className="lu-flash lu-ok">✔ ARRESTED!</div>}
      </div>
      <button className="submit-btn lu-arrest" onClick={arrest} disabled={busy || sel === null}>{sel === null ? "PRESS A PERSON" : `ARREST NUMBER ${sel + 1}`}</button>
    </div>);
  };

  /* --- Expert --- */
  const Swatch = ({ c }) => <span className="lu-sw" style={{ background: c }} />;
  const Manual = () => (<div className="lu-manual">
    <p>The bomb shows a <strong>lineup</strong>: six people. One of them is the person with the codename.</p>
    <p><strong>Ask:</strong> "What is the codename?" Find it in the table. Tell the Defuser about that person:</p>
    <p className="lu-eg">"FOX is tall. FOX has light hair. It is long. FOX is fat. FOX has blue eyes."</p>
    <p>The Defuser presses the person, then <strong>ARREST</strong>. Use <strong>all five</strong> things! Two or three things are not enough.</p>
    <table className="manual-table lu-table"><thead><tr><th>CODENAME</th>{TRAITS.map((t) => <th key={t.col}>{t.col}</th>)}</tr></thead>
      <tbody>{AGENTS.map((a) => <tr key={a.name}><td><b>{a.name}</b></td>{TRAITS.map((t, i) => <td key={i}>{value(a.p, i)}</td>)}</tr>)}</tbody></table>
    <p><strong>LIGHT</strong> hair: white <Swatch c="#eef0f3" /> blond <Swatch c="#f2d45c" /> light brown <Swatch c="#d6a86a" />
      &nbsp; <strong>DARK</strong> hair: black <Swatch c="#24242f" /></p>
    <p>Wrong: <strong>STRIKE!</strong> New codename, new lineup.</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .lu-code{display:flex;justify-content:center;align-items:baseline;gap:10px;background:#f6f1e1;color:#1b1424;border:3px solid #1b1424;border-radius:6px;
      margin-bottom:8px;padding:6px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.7rem;letter-spacing:1px;}
    .lu-code b{font-size:1.3rem;color:#c0262e;letter-spacing:3px;}
    .lu-wall{position:relative;background:#c9cdd4;border:3px solid #1b1424;border-radius:6px;padding:8px 4px 4px;overflow:hidden;}
    .lu-wall.lu-shake{animation:lu-shake 0.4s;}
    @keyframes lu-shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);}}
    .lu-lines{position:absolute;inset:0 0 34px;background:repeating-linear-gradient(to top,#c9cdd4 0 11px,#3a3f4a 11px 13px);opacity:0.55;}
    .lu-row{position:relative;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;align-items:end;}
    .lu-p{position:relative;background:none;border:2px solid transparent;border-radius:6px;padding:0 0 22px;cursor:pointer;}
    .lu-p img{width:100%;display:block;image-rendering:pixelated;}
    .lu-p.sel{border-color:#ffcc00;background:rgba(255,204,0,0.25);}
    .lu-p.right{border-color:#3bff6a;background:rgba(59,255,106,0.3);}
    .lu-num{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);background:#1b1424;color:#fff;font-family:'Orbitron',sans-serif;font-weight:900;
      font-size:0.75rem;min-width:20px;padding:1px 3px;border-radius:3px;}
    .lu-p.sel .lu-num{background:#ffcc00;color:#000;}
    .lu-flash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(160,20,20,0.55);color:#fff;
      font-family:'Orbitron',sans-serif;font-size:1.2rem;font-weight:900;}
    .lu-flash.lu-ok{background:rgba(20,120,40,0.35);align-items:flex-start;padding-top:6px;}
    .lu-arrest{width:100%;min-height:46px;margin-top:8px;}
    .lu-eg{font-size:0.9rem;opacity:0.85;font-style:italic;}
    .lu-table td,.lu-table th{font-size:0.75rem;text-align:center;padding:4px 3px;}
    .lu-sw{display:inline-block;width:14px;height:14px;border:2px solid #1b1424;border-radius:3px;vertical-align:middle;margin:0 2px;}
    @media print{.lu-sw{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  `;
  document.head.appendChild(css);

  const _test = Object.assign(TEST, { TRAITS, AGENTS, SHAPES, makeRound, fits, value });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "lineup", name: "🕵️ Lineup", type: "lineup", difficulty: "A1", puzzle: 2, Component, Manual, _test });
})();
