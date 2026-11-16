/* ===== M13 TEEN CODE (400-list numbers: thirteen–nineteen vs. twenty–ninety) =====
 * Design: docs/design/modules/400/M13_teen_code.md
 * Pronunciation drill for -teen vs. -ty (13 vs. 30). The Expert's manual shows a five-number code as
 * English words only; the Defuser's keypad shows digits only (13–19, 20, 30–90, all fifteen every round,
 * so every -teen's -ty twin is always on the keypad). Every code has at least one -teen and one -ty.
 * A wrong press is a strike and the code starts again from the first number.
 * Two tiers: Teen Code (A2) and Teen Code: Twins (B1), where every code also has at least one full twin pair
 * (e.g. 16 AND 60). Sync: the bomb shows a LOCK NUMBER. It fixes the code, the keypad layout and the tier
 * (even = A2, odd = Twins), so both manual sections work for either tier.
 * Deliberate exception to "English words on the Defuser's buttons at A2": words there would let the
 * Defuser match letters instead of hearing the stress, so the keypad is digits only.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const shuffle = (a, r) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const TEENS = [13, 14, 15, 16, 17, 18, 19], TYS = [20, 30, 40, 50, 60, 70, 80, 90], ALL = [...TEENS, ...TYS];
  const WORD = { 13: "thirteen", 14: "fourteen", 15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen",
    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety" };
  const LENGTH = 5;

  const twinOf = (teen) => (teen - 10) * 10; // 13 -> 30 … 19 -> 90 (20 has no twin)
  const isTwins = (code) => code % 2 === 1;
  // One -teen and one -ty guaranteed (Twins: a -teen and its own -ty), the rest from the whole pool,
  // no repeats, then shuffled.
  const makeRound = (code) => {
    const r = rng(code);
    const teen = TEENS[Math.floor(r() * TEENS.length)];
    const ty = isTwins(code) ? twinOf(teen) : TYS[Math.floor(r() * TYS.length)];
    const rest = shuffle(ALL.filter((n) => n !== teen && n !== ty), r).slice(0, LENGTH - 2);
    return { code, twins: isTwins(code), seq: shuffle([teen, ty, ...rest], r), keys: shuffle(ALL, rng(code * 31 + 7)) };
  };
  // From the printed codebook (manual-kit.js); odd lock numbers are Twins.
  const newCode = (twins) => MANUAL.pick("teenCode", (n) => isTwins(n) === twins);

  /* --- Defuser --- */
  const makeModule = (twins) => ({ onSuccess, onStrike }) => {
    const [code] = useState(() => newCode(twins));
    const [round] = useState(() => makeRound(code));
    const [done, setDone] = useState([]);
    const [won, setWon] = useState(false);
    const [msg, setMsg] = useState(null);
    TEST.round = round;
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1800); };
    const press = (n) => {
      if (won) return;
      if (n !== round.seq[done.length]) { onStrike(); setDone([]); flash("WRONG! Start again."); return; }
      const next = [...done, n]; setDone(next);
      if (next.length === LENGTH) { setWon(true); flash("OPEN!"); onSuccess(); }
    };
    return (<div className="module-content tc"><h3>🔐 TEEN CODE{twins ? ": TWINS" : ""}</h3>
      <div className="lr-plate">LOCK NUMBER<b>{code}</b></div>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className={`tc-lcd ${won ? "tc-open" : ""}`}>{Array.from({ length: LENGTH }, (_, i) => <span key={i}>{done[i] ?? "--"}</span>)}</div>
      <div className="tc-keys">{round.keys.map((n) => <button key={n} className="keypad-btn tc-key" onClick={() => press(n)} disabled={won}>{n}</button>)}</div>
    </div>);
  };

  /* --- Expert (one manual for both tiers: the lock number says which) --- */
  const TeenCodeManual = () => {
    if (React.useContext(MANUAL.Print)) return (<div>
      <p><strong>Ask:</strong> "What is the lock number?" Find it in the list. Say the numbers. The Defuser presses them in order.</p>
      <table className="manual-table"><thead><tr><th>Lock number</th><th>The code</th></tr></thead><tbody>
        {MANUAL.codebook("teenCode").map((n) => <tr key={n}><td>{n}</td><td style={{ textAlign: "left" }}>{makeRound(n).seq.map((x) => WORD[x]).join(", ")}</td></tr>)}
      </tbody></table>
      <div className="lr-rules">
        <p>One wrong number: the code starts again from number 1.</p>
        <p>-teen: say the end strong. thir-<strong>TEEN</strong></p>
        <p>-ty: say the start strong. <strong>THIR</strong>-ty</p>
      </div>
    </div>);
    const [entry, setEntry] = useState(""), [round, setRound] = useState(null);
    const show = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) setRound(makeRound(n)); };
    return (<div>
      <p><strong>Ask:</strong> "What is the lock number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={show}>SHOW</button></div>
      {round && <ol className="tc-code">{round.seq.map((n) => <li key={n}>{WORD[n]}</li>)}</ol>}
      <div className="lr-rules">
        <p>Say the numbers. The Defuser presses them in order.</p>
        <p>One wrong number: the code starts again from number 1.</p>
        <p>-teen: say the end strong. thir-<strong>TEEN</strong></p>
        <p>-ty: say the start strong. <strong>THIR</strong>-ty</p>
      </div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .tc-lcd{display:flex;justify-content:center;gap:6px;background:#0a1520;border:2px solid #333;border-radius:6px;padding:8px;margin:8px 0;}
    .tc-lcd span{min-width:2.4rem;text-align:center;font-family:'Orbitron',sans-serif;font-size:1.2rem;color:#0f0;}
    .tc-lcd.tc-open{border-color:#4caf50;}
    .tc-keys{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;}
    .tc-key{font-family:'Orbitron',sans-serif;font-size:1.15rem;padding:0.7rem 0;}
    .tc-code{font-size:1.6rem;font-weight:bold;color:#ffcc00;margin:8px 0;padding-left:0;list-style-position:inside;}
    .tc-code li{margin:2px 0;}
  `;
  document.head.appendChild(css);

  const _test = Object.assign(TEST, { makeRound, newCode, twinOf, TEENS, TYS, WORD, LENGTH });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "teenCode", name: "🔐 Teen Code", type: "teenCode", difficulty: "A2", Component: makeModule(false), Manual: TeenCodeManual, _test },
    { id: "teenCodeTwins", name: "🔐 Teen Code: Twins", type: "teenCodeTwins", difficulty: "B1", Component: makeModule(true), Manual: TeenCodeManual, _test },
  );
})();
