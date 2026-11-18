/* ===== M14 TIME LOCK (A1: telling time, digital and analogue, three clocks in a row) =====
 * Three clocks behind three doors. Set each one and press SET; a right time opens the door and the next
 * clock slides up. A wrong time is a strike and the whole module starts again at clock 1 with new times.
 *   Clock 1 (digital): starts at a time. The Expert works out a new time from the CLOCK color (how many
 *            hours), the NUMBER color (how many minutes) and the bomb's BATTERIES (later or earlier).
 *   Clock 2 (round):   the FRAME color is the hour word, the HANDS color is the minutes word, the NUMBERS
 *            color is "past" or "to". Together they make one English time: "twenty to eight" = 7:40.
 *   Clock 3 (round):   no colors. The hour of clock 1 and the minutes of clock 2. Clocks 1 and 2 are gone
 *            by now, so somebody has to remember them or write them down.
 * Times are 12-hour, minutes in fives. The minute and hour buttons are separate (minutes do not carry).
 * Fixed manual (no sync number): every rule is on paper.
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const wrapH = (h) => ((((h - 1) % 12) + 12) % 12) + 1;
  const fmt = ({ h, m }) => `${h}:${String(m).padStart(2, "0")}`;
  const same = (a, b) => a.h === b.h && a.m === b.m;
  // Add minutes to a time, carrying into the hour (used for the rules, not the buttons).
  const addMin = ({ h, m }, d) => { const t = (((h % 12) * 60 + m + d) % 720 + 720) % 720; return { h: wrapH(Math.floor(t / 60)), m: t % 60 }; };
  const randTime = () => ({ h: 1 + Math.floor(Math.random() * 12), m: 5 * Math.floor(Math.random() * 12) });
  const randOther = (not) => { let t; do t = randTime(); while (same(t, not)); return t; };

  /* --- the rules (the manual prints these same tables) --- */
  const CASE = { red: 1, blue: 2, green: 3, purple: 4 };                 // clock color -> hours
  const DIGITS = { white: 5, yellow: 10, pink: 15, orange: 30 };          // number color -> minutes
  const LATER = (batteries) => batteries % 2 === 1;                       // 1 or 3 later, 2 or 4 earlier
  const FRAME = { red: 2, orange: 4, yellow: 5, green: 7, blue: 8, purple: 11 };   // frame color -> hour
  const HANDS = { black: 10, red: 15, blue: 20, green: 30 };              // hands color -> minutes
  const NUMS = { black: "past", red: "to" };                              // numbers color -> past / to
  const HOUR_WORD = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const MIN_WORD = { 10: "ten", 15: "quarter", 20: "twenty", 30: "half" };
  const HOURS_TEXT = { 1: "one hour", 2: "two hours", 3: "three hours", 4: "four hours" };
  const MINS_TEXT = { 5: "five minutes", 10: "ten minutes", 15: "fifteen minutes", 30: "thirty minutes" };

  const HEX = { red: "#d23a3a", blue: "#3466d6", green: "#2f9a45", purple: "#8e44c9", orange: "#f08a1c", yellow: "#f5d330",
    white: "#ffffff", pink: "#ff7ad9", black: "#1b1424", digYellow: "#ffe14a", digOrange: "#ff8c1a" };
  const digitHex = (c) => (c === "yellow" ? HEX.digYellow : c === "orange" ? HEX.digOrange : HEX[c]);

  const clock1Target = (start, caseColor, digitColor, batteries) =>
    addMin(start, (LATER(batteries) ? 1 : -1) * (CASE[caseColor] * 60 + DIGITS[digitColor]));
  const clock2Target = (frame, hands, nums) => NUMS[nums] === "past"
    ? { h: FRAME[frame], m: HANDS[hands] } : { h: wrapH(FRAME[frame] - 1), m: 60 - HANDS[hands] };
  const clock3Target = (t1, t2) => ({ h: t1.h, m: t2.m });

  const makeRound = (batteries) => {
    const start = randTime(), caseColor = pick(Object.keys(CASE)), digitColor = pick(Object.keys(DIGITS));
    const t1 = clock1Target(start, caseColor, digitColor, batteries);
    const frame = pick(Object.keys(FRAME)), hands = pick(Object.keys(HANDS));
    const nums = HANDS[hands] === 30 ? "black" : pick(Object.keys(NUMS)); // never "half to"
    const t2 = clock2Target(frame, hands, nums), t3 = clock3Target(t1, t2);
    return {
      batteries,
      clocks: [
        { kind: "digital", start, caseColor, digitColor, target: t1 },
        { kind: "round", start: randOther(t2), frame, hands, nums, target: t2,
          say: `${MIN_WORD[HANDS[hands]]} ${NUMS[nums]} ${HOUR_WORD[FRAME[frame]]}` },
        { kind: "round", start: randOther(t3), frame: "plain", hands: "black", nums: "black", target: t3 },
      ],
    };
  };

  const chime = (ok) => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [880, 1320] : [180]).forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; o.type = ok ? "sine" : "square";
      o.connect(g); g.connect(a.destination); g.gain.value = 0.06; o.start(a.currentTime + i * 0.12); o.stop(a.currentTime + i * 0.12 + 0.2); }); } catch (e) {} };

  /* --- the clocks --- */
  const Digital = ({ clock, time }) => (
    <div className="tl-digital" style={{ background: HEX[clock.caseColor] }}>
      <div className="tl-lcd" style={{ color: digitHex(clock.digitColor), textShadow: `0 0 8px ${digitHex(clock.digitColor)}` }}>
        <span>{String(time.h).padStart(2, " ")}</span><span className="tl-colon">:</span><span>{String(time.m).padStart(2, "0")}</span>
      </div>
    </div>);

  const Round = ({ clock, time }) => {
    const plain = clock.frame === "plain";
    const frame = plain ? "#8a8a8a" : HEX[clock.frame], hands = HEX[clock.hands], nums = HEX[clock.nums];
    const hAng = ((time.h % 12) + time.m / 60) * 30, mAng = time.m * 6;
    const hand = (ang, len, w) => <line x1="50" y1="50" x2={50 + len * Math.sin((ang * Math.PI) / 180)} y2={50 - len * Math.cos((ang * Math.PI) / 180)} stroke={hands} strokeWidth={w} strokeLinecap="round" />;
    return (<svg viewBox="0 0 100 100" className="tl-round">
      <circle cx="50" cy="50" r="46" fill="#f6f1e1" stroke={frame} strokeWidth="7" />
      {Array.from({ length: 60 }, (_, i) => { const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0;
        return <line key={i} x1={50 + 40.5 * Math.sin(a)} y1={50 - 40.5 * Math.cos(a)} x2={50 + (big ? 37 : 39) * Math.sin(a)} y2={50 - (big ? 37 : 39) * Math.cos(a)} stroke="#555" strokeWidth={big ? 1.2 : 0.5} />; })}
      {Array.from({ length: 12 }, (_, i) => { const n = i + 1, a = (n * 30 * Math.PI) / 180;
        return <text key={n} x={50 + 30 * Math.sin(a)} y={50 - 30 * Math.cos(a) + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill={nums} fontFamily="Orbitron, sans-serif">{n}</text>; })}
      {hand(hAng, 19, 5)}{hand(mAng, 32, 2.8)}<circle cx="50" cy="50" r="3.5" fill={hands} />
    </svg>);
  };

  /* --- Defuser --- */
  const TimeLockModule = ({ bomb = { batteries: 1 }, onSuccess, onStrike }) => {
    const [round, setRound] = useState(() => makeRound(bomb.batteries));
    const [stage, setStage] = useState(0);
    const [time, setTime] = useState(() => round.clocks[0].start);
    const [phase, setPhase] = useState("in"); // in | open | shake | won
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    Object.assign(TEST, { round, stage, time, phase });
    const clock = round.clocks[stage], busy = phase === "open" || phase === "shake" || phase === "won";

    const nudge = (dh, dm) => { if (busy) return; setTime((t) => ({ h: wrapH(t.h + dh), m: (t.m + dm + 60) % 60 })); };
    const set = () => {
      if (busy) return;
      if (same(time, clock.target)) {
        chime(true);
        if (stage === 2) { setPhase("won"); onSuccess(); return; }
        setPhase("open");
        timer.current = setTimeout(() => { setStage(stage + 1); setTime(round.clocks[stage + 1].start); setPhase("in"); }, 700);
      } else {
        chime(false); onStrike(); setPhase("shake");
        timer.current = setTimeout(() => { const r = makeRound(bomb.batteries); setRound(r); setStage(0); setTime(r.clocks[0].start); setPhase("in"); }, 900);
      }
    };

    return (<div className="module-content tl"><h3>⏰ TIME LOCK</h3>
      <div className="tl-lamps">{[0, 1, 2].map((i) => <span key={i} className={i < stage || phase === "won" ? "on" : i === stage ? "now" : ""}>{i + 1}</span>)}</div>
      <div className="tl-window">
        <div key={`${stage}-${round.clocks[0].start.h}-${round.clocks[0].start.m}-${round.clocks[0].caseColor}`} className={`tl-door tl-${phase}`}>
          {clock.kind === "digital" ? <Digital clock={clock} time={time} /> : <Round clock={clock} time={time} />}
          {stage === 0 && <div className="tl-was">START {fmt(clock.start)}</div>}
        </div>
        {phase === "shake" && <div className="tl-flash">✖ START AGAIN</div>}
        {phase === "won" && <div className="tl-flash tl-good">✔ OPEN</div>}
      </div>
      <div className="tl-controls">
        <div className="tl-ctl"><span>HOUR</span><button className="tl-btn" onClick={() => nudge(-1, 0)} disabled={busy}>◀</button><button className="tl-btn" onClick={() => nudge(1, 0)} disabled={busy}>▶</button></div>
        <div className="tl-ctl"><span>MINUTE</span><button className="tl-btn" onClick={() => nudge(0, -5)} disabled={busy}>◀</button><button className="tl-btn" onClick={() => nudge(0, 5)} disabled={busy}>▶</button></div>
      </div>
      <button className={`submit-btn tl-set ${phase === "won" ? "correct" : ""}`} onClick={set} disabled={busy}>{phase === "won" ? "✓ OPEN" : "SET"}</button>
    </div>);
  };

  /* --- Expert --- */
  const Swatch = ({ c }) => <span className="tl-sw" style={{ background: HEX[c] }} />;
  const Row = ({ c, children }) => <tr><td style={{ textAlign: "left" }}><Swatch c={c} />{c}</td><td style={{ textAlign: "left" }}>{children}</td></tr>;
  const TimeLockManual = () => (<div className="tl-manual">
    <p>There are <strong>three clocks</strong>. Set a clock and press SET. Right: the next clock opens.</p>
    <p><strong>Wrong: STRIKE!</strong> All the clocks change. Start again at clock 1.</p>

    <h4>Clock 1: the digital clock</h4>
    <p><strong>Ask:</strong> "What time is it? What color is the clock? What color are the numbers? How many batteries are there?"</p>
    <table className="manual-table"><thead><tr><th>Color of the clock</th><th>Hours</th></tr></thead><tbody>
      {Object.keys(CASE).map((c) => <Row key={c} c={c}>{HOURS_TEXT[CASE[c]]}</Row>)}</tbody></table>
    <table className="manual-table"><thead><tr><th>Color of the numbers</th><th>Minutes</th></tr></thead><tbody>
      {Object.keys(DIGITS).map((c) => <Row key={c} c={c}>{MINS_TEXT[DIGITS[c]]}</Row>)}</tbody></table>
    <table className="manual-table"><thead><tr><th>Batteries</th><th></th></tr></thead><tbody>
      <tr><td>1 or 3</td><td style={{ textAlign: "left" }}><strong>later</strong></td></tr>
      <tr><td>2 or 4</td><td style={{ textAlign: "left" }}><strong>earlier</strong></td></tr></tbody></table>
    <p className="tl-eg">It is 4:50. The clock is blue, the numbers are pink, and there are 3 batteries: two hours and fifteen minutes later. Set it to <strong>7:05</strong>.</p>

    <h4>Clock 2: the first round clock</h4>
    <p><strong>Ask:</strong> "What color is the frame? What color are the hands? What color are the numbers?"</p>
    <table className="manual-table"><thead><tr><th>Color of the frame</th><th>Hour</th></tr></thead><tbody>
      {Object.keys(FRAME).map((c) => <Row key={c} c={c}>{HOUR_WORD[FRAME[c]]}</Row>)}</tbody></table>
    <table className="manual-table"><thead><tr><th>Color of the hands</th><th>Minutes</th></tr></thead><tbody>
      {Object.keys(HANDS).map((c) => <Row key={c} c={c}>{MIN_WORD[HANDS[c]]}</Row>)}</tbody></table>
    <table className="manual-table"><thead><tr><th>Color of the numbers</th><th></th></tr></thead><tbody>
      {Object.keys(NUMS).map((c) => <Row key={c} c={c}><strong>{NUMS[c]}</strong></Row>)}</tbody></table>
    <p className="tl-eg">Blue frame, blue hands, red numbers: <strong>twenty to eight</strong>. Set it to 7:40.</p>

    <h4>Clock 3: the second round clock</h4>
    <p>No colors! Remember clock 1 and clock 2. Write them down!</p>
    <p>The <strong>hour</strong> of clock 1, and the <strong>minutes</strong> of clock 2.</p>
    <p className="tl-eg">Clock 1 was 3:05. Clock 2 was quarter past eleven (11:15). Hour 3, minutes 15: set it to <strong>3:15</strong>, quarter past three.</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .tl-lamps{display:flex;justify-content:center;gap:8px;margin-bottom:6px;}
    .tl-lamps span{width:26px;height:26px;border-radius:50%;background:#222;border:2px solid #555;color:#888;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-size:0.75rem;}
    .tl-lamps span.now{border-color:#ffcc00;color:#ffcc00;} .tl-lamps span.on{background:#3bff6a;border-color:#3bff6a;color:#0a1520;box-shadow:0 0 10px #3bff6a;}
    .tl-window{position:relative;height:200px;overflow:hidden;background:#0a1520;border:3px solid #333;border-radius:8px;display:flex;align-items:center;justify-content:center;}
    .tl-door{display:flex;flex-direction:column;align-items:center;gap:6px;animation:tl-up 0.5s ease-out;}
    .tl-door.tl-open{transform:translateY(-120%);opacity:0;transition:transform 0.6s ease-in,opacity 0.6s ease-in;}
    .tl-door.tl-shake{animation:tl-shake 0.4s;}
    @keyframes tl-up{from{transform:translateY(110%);}to{transform:translateY(0);}}
    @keyframes tl-shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);}}
    .tl-digital{padding:14px 16px;border-radius:12px;border:3px solid #1b1424;box-shadow:inset 0 -6px 0 rgba(0,0,0,0.25);}
    .tl-lcd{background:#10141a;border:3px solid #1b1424;border-radius:6px;padding:6px 14px;font-family:'Orbitron',sans-serif;font-size:2.6rem;font-weight:900;letter-spacing:2px;}
    .tl-colon{animation:tl-blink 1s steps(1) infinite;} @keyframes tl-blink{50%{opacity:0.2;}}
    .tl-was{font-family:'Orbitron',sans-serif;font-size:0.7rem;color:#888;}
    .tl-round{width:170px;height:170px;}
    .tl-flash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(160,20,20,0.55);color:#fff;font-family:'Orbitron',sans-serif;font-size:1.3rem;font-weight:900;}
    .tl-flash.tl-good{background:rgba(20,140,60,0.5);}
    .tl-controls{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;}
    .tl-ctl{display:flex;align-items:center;gap:4px;background:#0a1520;border-radius:6px;padding:4px 6px;}
    .tl-ctl span{flex:1;font-family:'Orbitron',sans-serif;font-size:0.7rem;color:#aaa;}
    .tl-btn{min-width:44px;min-height:44px;font-size:1.1rem;background:#1a1a2e;border:2px solid #444;color:#0ff;border-radius:6px;cursor:pointer;}
    .tl-btn:disabled{opacity:0.4;}
    .tl-set{width:100%;margin-top:8px;min-height:48px;}
    .tl-manual h4{color:#ffcc00;margin:14px 0 4px;} .tl-manual .manual-table{margin:4px 0;}
    .tl-sw{display:inline-block;width:14px;height:14px;border:1px solid #888;border-radius:3px;margin-right:6px;vertical-align:-2px;}
    .tl-eg{font-size:0.9rem;opacity:0.85;font-style:italic;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "timeLock", name: "⏰ Time Lock", type: "timeLock", difficulty: "A1",
    Component: TimeLockModule, Manual: TimeLockManual,
    _test: Object.assign(TEST, { makeRound, clock1Target, clock2Target, clock3Target, addMin, CASE, DIGITS, FRAME, HANDS, NUMS, same }),
  });
})();
