/* ===== M04 SCHOOL BELL (A2 tier: any day, 7 a.m.–9 p.m., 5 s per hour, the Expert can't see the clock) =====
 * Design: docs/design/modules/M04_school_bell.md · Build spec: docs/design/modules/build/M04_build.md
 * The bomb runs one school day fast. Ring the right bell while its hour is on the clock.
 * The Expert has the week's timetable; the Defuser has the day and the clock and must say the hours out loud.
 */
(() => {
  const { useState, useEffect, useRef } = React;
  const TEST = {};

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]; // 24 h internally
  const SUBJECTS = ["science", "math", "PE", "music", "art", "Chinese", "English"];
  const ROUTINES = ["get up", "go to school", "go home", "do my homework", "study", "go to bed"];
  const WEEKDAY = (s9, s10, s11, homework = true) => ({ 7: "get up", 8: "go to school", 9: s9, 10: s10, 11: s11, 16: "go home", ...(homework ? { 19: "do my homework" } : {}), 21: "go to bed" });
  const WEEKEND = { 8: "get up", 10: "study", 21: "go to bed" };
  // The week, from the design doc. A teacher can replace it with the class's real timetable.
  const BELLS = {
    Monday: WEEKDAY("English", "math", "PE"), Tuesday: WEEKDAY("science", "Chinese", "music"), Wednesday: WEEKDAY("math", "art", "English"),
    Thursday: WEEKDAY("Chinese", "PE", "science"), Friday: WEEKDAY("music", "English", "art", false), Saturday: WEEKEND, Sunday: WEEKEND,
  };
  const ROWS = [[7, "7"], [8, "8"], [9, "9"], [10, "10"], [11, "11"], [16, "4"], [19, "7 (night)"], [21, "9 (night)"]];
  const SEC_PER_HOUR = 5000, GRACE = 400;
  const TEXT_ICON = { math: "1+2", Chinese: "中", English: "ABC" };
  const say = (b) => (b === "study" ? "study English" : b);
  const ding = (ok) => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = ok ? 1320 : 180; o.type = ok ? "sine" : "square"; o.connect(g); g.connect(a.destination); g.gain.value = 0.07; o.start(); o.stop(a.currentTime + (ok ? 0.25 : 0.3)); } catch (e) {} };

  const Icon = ({ name, size = 40 }) => TEXT_ICON[name]
    ? <span className="sb-text" style={{ width: size, height: size, fontSize: name === "Chinese" ? size * 0.7 : size * 0.38 }}>{TEXT_ICON[name]}</span>
    : <img className="pixel-art" src={PX.school(name)} alt={name} width={size} height={size} />;

  const Clock = ({ hour, frac }) => {
    const h12 = hour % 12 || 12, hAng = ((hour % 12) + frac) * 30, mAng = frac * 360, night = hour >= 18;
    const hand = (ang, len, w, c) => <line x1="50" y1="50" x2={50 + len * Math.sin((ang * Math.PI) / 180)} y2={50 - len * Math.cos((ang * Math.PI) / 180)} stroke={c} strokeWidth={w} strokeLinecap="round" />;
    return (<div className="sb-clockwrap">
      <img className="pixel-art sb-sky" src={PX.food(night ? "dinner" : "lunch")} alt={night ? "night" : "day"} />
      <svg viewBox="0 0 100 100" className="sb-clock">
        <circle cx="50" cy="50" r="46" fill="#f6f1e1" stroke="#1b1424" strokeWidth="4" />
        {Array.from({ length: 12 }, (_, i) => { const n = i + 1, a = (n * 30 * Math.PI) / 180, on = n === h12;
          return <g key={n}>{on && <circle cx={50 + 35 * Math.sin(a)} cy={50 - 35 * Math.cos(a)} r="9" fill="#ffcc00" />}
            <text x={50 + 35 * Math.sin(a)} y={50 - 35 * Math.cos(a) + 4.5} textAnchor="middle" fontSize={on ? 14 : 12} fontWeight="900" fill="#1b1424" fontFamily="Orbitron, sans-serif">{n}</text></g>; })}
        {hand(hAng, 22, 5, "#1b1424")}{hand(mAng, 34, 2.5, "#c43636")}<circle cx="50" cy="50" r="3.5" fill="#1b1424" />
      </svg>
    </div>);
  };

  /* --- Defuser --- */
  const SchoolBellModule = ({ onSuccess, onStrike }) => {
    const [day] = useState(() => DAYS[Math.floor(Math.random() * 7)]);
    const [t0, setT0] = useState(null);
    const [now, setNow] = useState(() => Date.now());
    const [rung, setRung] = useState({});
    const [judged, setJudged] = useState({});
    const [lamp, setLamp] = useState(null);
    const won = useRef(false);
    TEST.day = day;
    useEffect(() => { if (t0 === null) return; const id = setInterval(() => setNow(Date.now()), 100); return () => clearInterval(id); }, [t0]);
    const el = t0 === null ? 0 : now - t0;
    const idx = Math.min(HOURS.length - 1, Math.floor(el / SEC_PER_HOUR)), hour = HOURS[idx], frac = Math.min(1, (el % SEC_PER_HOUR) / SEC_PER_HOUR);
    const over = t0 !== null && el >= HOURS.length * SEC_PER_HOUR;
    const blink = (c) => { setLamp(c); ding(c === "green"); setTimeout(() => setLamp((l) => (l === c ? null : l)), 600); };

    // A bell that ended without a ring is a strike (once), after the grace period.
    useEffect(() => {
      if (t0 === null) return;
      const late = HOURS.filter((h, i) => BELLS[day][h] && !rung[h] && !judged[h] && el >= (i + 1) * SEC_PER_HOUR + GRACE);
      if (late.length) { setJudged((j) => ({ ...j, ...Object.fromEntries(late.map((h) => [h, true])) })); late.forEach(() => onStrike()); blink("red"); }
      if (el >= HOURS.length * SEC_PER_HOUR + GRACE + 100 && !won.current && !late.length) { won.current = true; onSuccess(); }
    }, [now]);

    const ring = (button) => {
      if (t0 === null || over) return;
      const prev = HOURS[idx - 1];
      if (idx > 0 && el % SEC_PER_HOUR < GRACE && BELLS[day][prev] === button && !rung[prev] && !judged[prev]) { setRung((r) => ({ ...r, [prev]: true })); return blink("green"); }
      if (BELLS[day][hour] === button && !rung[hour]) { setRung((r) => ({ ...r, [hour]: true })); return blink("green"); }
      if (BELLS[day][hour] && rung[hour] && BELLS[day][hour] === button) return; // already rung
      onStrike(); blink("red");
    };

    return (<div className="module-content sb"><h3>🔔 SCHOOL BELL</h3>
      <div className="sb-today">TODAY: <b>{day.toUpperCase()}</b></div>
      <div className="sb-face">
        <Clock hour={hour} frac={t0 === null ? 0 : frac} />
        <div className={`sb-lamp ${lamp || ""}`}>🔔</div>
      </div>
      {t0 === null
        ? <button className="submit-btn sb-start" onClick={() => { setT0(Date.now()); setNow(Date.now()); }}>START THE DAY</button>
        : over ? <div className="sb-end">THE END OF THE DAY</div> : null}
      <div className="sb-buttons">{[...SUBJECTS, ...ROUTINES].map((b) => (
        <button key={b} className="lr-item sb-btn" onClick={() => ring(b)} disabled={t0 === null || over}><Icon name={b} /><span>{b}</span></button>))}</div>
    </div>);
  };

  /* --- Expert --- */
  const SchoolBellManual = () => (<div>
    <p><strong>Ask:</strong> "What day is it today?" Then ask: "What time is it?" The Defuser has the clock. You do not!</p>
    <p>Ring the bell <strong>at</strong> that time, not before. A "—" means no bell. Do not ring!</p>
    <p>Friday night has no homework. It is the end of the week!</p>
    <div className="sb-tablewrap"><table className="manual-table sb-table">
      <thead><tr><th>Time</th>{DAYS.slice(0, 5).map((d) => <th key={d}>{d}</th>)}<th>Saturday / Sunday</th></tr></thead>
      <tbody>{ROWS.map(([h, label]) => (<tr key={h}><th>{label}</th>
        {[...DAYS.slice(0, 5), "Saturday"].map((d) => <td key={d}>{BELLS[d][h] ? say(BELLS[d][h]) : "—"}</td>)}</tr>))}</tbody>
    </table></div>
    <p>The other times (12, 1, 2, 3, 5, 6, 8) have no bell.</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .sb-today{text-align:center;font-family:'Orbitron',sans-serif;color:#aaa;font-size:0.8rem;margin-bottom:6px;} .sb-today b{color:#fff;font-size:1.3rem;letter-spacing:2px;}
    .sb-face{display:flex;align-items:center;justify-content:center;gap:12px;}
    .sb-clockwrap{position:relative;width:170px;height:170px;}
    .sb-sky{position:absolute;top:-6px;right:-14px;width:56px;height:56px;}
    .sb-clock{width:170px;height:170px;position:relative;}
    .sb-lamp{width:52px;height:52px;border-radius:50%;background:#222;border:3px solid #555;display:flex;align-items:center;justify-content:center;font-size:1.5rem;transition:background 0.1s;}
    .sb-lamp.green{background:#3bff6a;box-shadow:0 0 18px #3bff6a;} .sb-lamp.red{background:#ff3b3b;box-shadow:0 0 18px #ff3b3b;}
    .sb-start{width:100%;margin:8px 0;min-height:48px;}
    .sb-end{text-align:center;font-family:'Orbitron',sans-serif;color:#3bff6a;margin:8px 0;}
    .sb-buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:6px;}
    .sb-btn{min-height:72px;justify-content:center;} .sb-btn:disabled{opacity:0.5;}
    .sb-text{display:inline-flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-weight:900;color:#fff;background:#2a3f8f;border:2px solid #1b1424;border-radius:4px;}
    .sb-tablewrap{overflow-x:auto;} .sb-table td,.sb-table th{font-size:0.9rem;white-space:nowrap;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "schoolBell", name: "🔔 School Bell", type: "schoolBell", difficulty: "A2",
    Component: SchoolBellModule, Manual: SchoolBellManual,
    _test: Object.assign(TEST, { BELLS, HOURS, SEC_PER_HOUR }),
  });
})();
