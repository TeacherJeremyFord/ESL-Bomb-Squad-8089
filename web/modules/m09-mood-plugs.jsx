/* ===== M09 MOOD PLUGS (B1 tier: 6 sockets, front/back rows, I / you / we portraits) =====
 * Design: docs/design/modules/M09_mood_plugs.md · Build spec: docs/design/modules/build/M09_build.md
 * The Expert reads feeling sentences; the Defuser plugs each socket into the one face it means.
 * Sync: the bomb shows a PLUG NUMBER; the Expert enters it and sees that board's sentences.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const FEELINGS = ["angry", "sad", "fine", "good", "great", "happy"], WHO = ["boy", "girl", "dog", "cat"];
  const SOCKETS = ["A", "B", "C", "D", "E", "F"], CABLE = { A: "#e04848", B: "#3f6fd8", C: "#3f9e45", D: "#f7d843", E: "#a65bd6", F: "#f39a2b" };

  /* --- grammar: the checker is the spec --- */
  // A sentence: { kind: "demo" | "pron" | "me", row, who, count, feeling, pron }
  const matches = (s, t) => {
    if (s.feeling !== t.feeling) return false;
    if (s.kind === "me") return t.who === s.who;                       // I = EXPERT, you = DEFUSER, we = US
    if (t.who === "expert" || t.who === "defuser" || t.who === "us") return false;
    if (s.kind === "demo") return t.row === s.row && t.who === s.who && t.count === s.count;
    if (s.row && t.row !== s.row) return false;                          // "It is in the back."
    if (s.pron === "they") return t.count === 2;
    if (t.count !== 1) return false;
    return s.pron === "he" ? t.who === "boy" : s.pron === "she" ? t.who === "girl" : t.who === "dog" || t.who === "cat";
  };
  const NOUN = (who, n) => (n === 2 ? who + "s" : who);
  const text = (s) => {
    const be = (subj) => (subj === "I" ? "am" : ["You", "We", "They"].includes(subj) || s.count === 2 ? "are" : "is");
    if (s.kind === "me") { const subj = { expert: "I", defuser: "You", us: "We" }[s.who]; return `${subj} ${be(subj)} ${s.feeling}.`; }
    if (s.kind === "demo") { const det = s.row === "front" ? (s.count === 2 ? "These" : "This") : s.count === 2 ? "Those" : "That"; return `${det} ${NOUN(s.who, s.count)} ${be(det)} ${s.feeling}.`; }
    const subj = { he: "He", she: "She", it: "It", they: "They" }[s.pron];
    return `${subj} ${be(subj)} ${s.feeling}.` + (s.row ? ` ${subj} ${be(subj)} in the ${s.row}.` : "");
  };
  // Every sentence that could point at tile t (the board decides which ones are unique).
  const sentencesFor = (t) => {
    if (["expert", "defuser", "us"].includes(t.who)) return [{ kind: "me", who: t.who, feeling: t.feeling }];
    const pron = t.count === 2 ? "they" : t.who === "boy" ? "he" : t.who === "girl" ? "she" : "it";
    return [{ kind: "demo", row: t.row, who: t.who, count: t.count, feeling: t.feeling }, { kind: "pron", pron, count: t.count, feeling: t.feeling }, { kind: "pron", pron, count: t.count, feeling: t.feeling, row: t.row }];
  };

  const makeBoard = (code) => {
    const r = rng(code), pick = (a) => a[Math.floor(r() * a.length)], shuffle = (a) => a.map((v) => [r(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    for (;;) {
      const tiles = [], add = (t) => tiles.push({ tid: "t" + tiles.length, ...t });
      // Decoy 1: the same picture in the front and the back (this vs that).
      const d1 = { who: pick(WHO), count: pick([1, 2]), feeling: pick(FEELINGS) };
      add({ ...d1, row: "front" }); add({ ...d1, row: "back" });
      // Decoy 2: one animal and two of the same animal with the same face (it vs they).
      const d2 = { who: pick(["dog", "cat"]), feeling: pick(FEELINGS) };
      add({ ...d2, count: 1, row: pick(["front", "back"]) }); add({ ...d2, count: 2, row: pick(["front", "back"]) });
      while (tiles.length < 10) add({ who: pick(WHO), count: pick([1, 2]), feeling: pick(FEELINGS), row: null });
      const rows = shuffle(["front", "back", "front", "back", "front", "back"]);
      tiles.slice(4).forEach((t, i) => (t.row = rows[i]));
      if (tiles.filter((t) => t.row === "front").length !== 5) continue;
      // Decoy 3: both portraits look positive, one good and one great.
      const [ef, df] = shuffle(["good", "great"]);
      add({ who: "expert", count: 1, feeling: ef, row: null }); add({ who: "defuser", count: 1, feeling: df, row: null }); add({ who: "us", count: 1, feeling: pick(FEELINGS), row: null });
      const unique = (s) => tiles.filter((t) => matches(s, t)).length === 1;
      const pickFor = (t, pref) => { const c = sentencesFor(t).filter(unique); return c.find(pref) || c[0]; };
      const chosen = [];
      const s1 = pickFor(tiles[r() < 0.5 ? 0 : 1], (s) => s.kind === "demo");          // this vs that
      const s2 = pickFor(tiles[2], (s) => s.kind === "pron" && !s.row);                  // it vs they
      const s3 = { kind: "me", who: "expert", feeling: ef };                              // I = the Expert
      if (!s1 || s1.kind !== "demo" || !s2) continue;
      chosen.push(s1, s2, s3);
      for (const t of shuffle(tiles.slice(4))) {
        if (chosen.length === 6) break;
        if (chosen.some((s) => matches(s, t))) continue;
        const s = pickFor(t, () => r() < 0.5); if (s) chosen.push(s);
      }
      if (chosen.length < 6 || !chosen.every(unique)) continue;
      const targets = chosen.map((s) => tiles.find((t) => matches(s, t)).tid);
      if (new Set(targets).size !== 6) continue;
      const order = shuffle(chosen);
      return { code, tiles, sentences: Object.fromEntries(SOCKETS.map((k, i) => [k, order[i]])) };
    }
  };

  /* --- Defuser --- */
  const Tile = ({ t, size, plugged, onTap }) => (<button className={`mp-tile ${t.row || "side"}`} onClick={onTap}>
    <span className="mp-pics">{["expert", "defuser", "us"].includes(t.who)
      ? (t.who === "us" ? ["expert", "defuser"] : [t.who]).map((w, i) => <img key={i} className="pixel-art" src={PX.feel(w, t.feeling)} alt="" width={size} height={size} />)
      : Array.from({ length: t.count }, (_, i) => <img key={i} className="pixel-art" src={PX.feel(t.who, t.feeling)} alt="" width={size} height={size} />)}</span>
    {["expert", "defuser", "us"].includes(t.who) && <span className="mp-frame">{t.who.toUpperCase()}</span>}
    {plugged && <span className="mp-plug" style={{ background: CABLE[plugged] }}>{plugged}</span>}
  </button>);

  const MoodPlugsModule = ({ onSuccess, onStrike }) => {
    const [code] = useState(() => MANUAL.pick("moodPlugs"));
    const [b] = useState(() => makeBoard(code));
    const [plugs, setPlugs] = useState({});
    const [held, setHeld] = useState(null);
    const [won, setWon] = useState(false);
    const [msg, setMsg] = useState(null);
    TEST.board = b; TEST.plugs = plugs;
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1600); };
    const socketOf = (tid) => Object.keys(plugs).find((k) => plugs[k] === tid);
    const tapSocket = (k) => { if (won) return; if (plugs[k] && held !== k) { const n = { ...plugs }; delete n[k]; setPlugs(n); return; } setHeld(held === k ? null : k); };
    const tapTile = (t) => { if (!held || won) return; const n = { ...plugs }; const old = socketOf(t.tid); if (old) delete n[old]; n[held] = t.tid; setPlugs(n); setHeld(null); };
    const check = () => {
      if (won) return;
      const ok = SOCKETS.every((k) => plugs[k] && matches(b.sentences[k], b.tiles.find((t) => t.tid === plugs[k])));
      if (ok) { setWon(true); onSuccess(); } else { onStrike(); flash(SOCKETS.every((k) => plugs[k]) ? "Wrong plug!" : "Plug every socket!"); }
    };
    const row = (r) => b.tiles.filter((t) => t.row === r);
    return (<div className="module-content mp"><h3>🔌 MOOD PLUGS</h3>
      <div className="ms-top"><div className="lr-plate">PLUG NUMBER<b>{code}</b></div></div>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className="mp-board">
        <div className="mp-sockets">{SOCKETS.map((k) => (
          <button key={k} className={`mp-socket ${held === k ? "held" : ""}`} style={{ borderColor: CABLE[k], background: plugs[k] ? CABLE[k] : "#111" }} onClick={() => tapSocket(k)}>{k}</button>))}</div>
        <div className="mp-rows">
          <div className="mp-label">BACK</div><div className="mp-row back">{row("back").map((t) => <Tile key={t.tid} t={t} size={32} plugged={socketOf(t.tid)} onTap={() => tapTile(t)} />)}</div>
          <div className="mp-label">FRONT</div><div className="mp-row front">{row("front").map((t) => <Tile key={t.tid} t={t} size={42} plugged={socketOf(t.tid)} onTap={() => tapTile(t)} />)}</div>
          <div className="mp-row side">{b.tiles.filter((t) => !t.row).map((t) => <Tile key={t.tid} t={t} size={34} plugged={socketOf(t.tid)} onTap={() => tapTile(t)} />)}</div>
        </div>
      </div>
      <p className="module-hint">Press a socket, then a face. Press a plugged socket to take the plug out.</p>
      <button className="submit-btn ww-done" onClick={check} disabled={won}>{won ? "✓ DONE" : "CHECK"}</button>
    </div>);
  };

  /* --- Expert --- */
  const MoodPlugsManual = () => {
    const print = React.useContext(MANUAL.Print);
    const [entry, setEntry] = useState(""), [b, setB] = useState(null);
    const show = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) setB(makeBoard(n)); };
    return (<div>
      {print ? <p><strong>Ask:</strong> "What is the plug number?" Find it in the plug book at the end of this section.</p> : <>
      <p><strong>Ask:</strong> "What is the plug number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={show}>SHOW</button></div>
      {b && <div className="mp-sentences">{SOCKETS.map((k) => <p key={k}><b style={{ color: CABLE[k] }}>{k}:</b> {text(b.sentences[k])}</p>)}</div>}</>}
      <div className="lr-rules">
        <p><strong>How to read it:</strong></p>
        <p><em>This</em> and <em>these</em> are in the <strong>front</strong>. <em>That</em> and <em>those</em> are in the <strong>back</strong>.</p>
        <p><em>I</em> is you, the Expert. <em>You</em> is the Defuser. <em>We</em> is the two of you.</p>
        <p><em>He</em> is a boy. <em>She</em> is a girl. <em>It</em> is an animal. <em>They</em> are two or more.</p>
      </div>
      <p><strong>The Face Guide.</strong> The Defuser will tell you what the faces look like. Say the feeling word:</p>
      <table className="manual-table"><thead><tr><th>The Defuser says…</th><th>It is…</th></tr></thead><tbody>
        {[["red face / angry eyes", "angry"], ["water from the eye", "sad"], ["a small smile / OK hand", "fine"], ["thumbs up", "good"], ["star eyes and thumbs up", "great"], ["a big smile", "happy"]].map(([a, f]) => <tr key={f}><td>{a}</td><td><strong>{f}</strong></td></tr>)}
      </tbody></table>
      {print && <><h3 className="mk-book-title">Plug book</h3>
        {MANUAL.codebook("moodPlugs").map((n) => { const bb = makeBoard(n); return (<div key={n} className="mk-entry"><h4>PLUG NUMBER {n}</h4>
          {SOCKETS.filter((k) => bb.sentences[k]).map((k) => <p key={k}><b style={{ color: CABLE[k] }}>{k}:</b> {text(bb.sentences[k])}</p>)}</div>); })}</>}
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .mp-board{display:flex;gap:6px;}
    .mp-sockets{display:flex;flex-direction:column;gap:5px;}
    .mp-socket{width:46px;height:46px;border-radius:50%;border:4px solid;color:#fff;font-family:'Orbitron',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;text-shadow:0 0 3px #000;}
    .mp-socket.held{box-shadow:0 0 0 3px #fff;}
    .mp-rows{flex:1;display:flex;flex-direction:column;gap:2px;}
    .mp-label{font-family:'Orbitron',sans-serif;font-size:0.55rem;color:#888;}
    .mp-row{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;}
    .mp-row.back{background:#2a3a5a;border-radius:4px;padding:3px;border-bottom:4px solid #7a5532;}
    .mp-row.front{background:#3a4a6a;border-radius:4px;padding:3px;}
    .mp-row.side{margin-top:4px;}
    .mp-tile{position:relative;background:#f4ecd8;border:2px solid #7a5532;border-radius:6px;padding:2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;min-height:44px;justify-content:center;}
    .mp-tile.back{transform:scale(0.95);}
    .mp-pics{display:flex;}
    .mp-frame{font-size:0.55rem;font-weight:900;color:#1b1424;font-family:'Orbitron',sans-serif;}
    .mp-plug{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;border:2px solid #fff;text-shadow:0 0 2px #000;}
    .mp-sentences p{font-size:1.5rem;margin:4px 0;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "moodPlugs", name: "🔌 Mood Plugs", type: "moodPlugs", difficulty: "B1",
    Component: MoodPlugsModule, Manual: MoodPlugsManual,
    _test: Object.assign(TEST, { makeBoard, matches, text, SOCKETS }),
  });
})();
