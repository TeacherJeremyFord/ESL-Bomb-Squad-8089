/* ===== M19 MEET UP (A2: parts of the day, telling time, days of the week) =====
 * Uses the M16 Busy Week planners (GRANDPA, MOM, SISTER), so it needs m16-busy-week.jsx loaded first.
 * The bomb says who you meet and the day, and shows YOUR DAY: six times and six things, one for each part of
 * the day, in time order (so the evening row is always before the night row).
 * Exactly one row is the same thing at the same time as in that person's planner: that is when you meet.
 * Press that part of the day. The other rows are things the person does at another time that day, or other
 * things at a time when the person is busy with something else, so both players have to read their side.
 * The Defuser sees only times, never part-of-day words, so naming the part is still their job.
 * Wrong: STRIKE, new person, day and plan. Fixed manual (no sync number).
 * Off-list word: meet.
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};
  const BW = window.BUSY_WEEK;
  if (!BW) { console.warn("Meet Up needs m16-busy-week.jsx loaded first; skipped."); return; }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const between = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  const covering = (day, h) => day.find((e) => e.start <= h && h < e.end);
  const ALL_CARDS = [...new Set(BW.PEOPLE.flatMap((p) => BW.PLAN[p].flatMap((day) => day.filter(BW.isCard).map((e) => e.name))))];

  const makeRound = () => {
    for (;;) {
      const person = pick(BW.PEOPLE), d = Math.floor(Math.random() * 7), day = BW.PLAN[person][d];
      const A = pick(day.filter(BW.isCard));
      const fits = BW.PARTS.map((p, i) => i).filter((i) => A.start >= BW.HOURS[BW.PARTS[i]][0] && A.start <= BW.HOURS[BW.PARTS[i]][1]);
      const answer = pick(fits);
      // one hour for each part, the answer's hour fixed, all in time order
      let hours = null;
      for (let k = 0; k < 60 && !hours; k++) {
        const h = BW.PARTS.map((p, i) => (i === answer ? A.start : between(...BW.HOURS[p])));
        if (h.every((x, i) => i === 0 || x > h[i - 1])) hours = h;
      }
      if (!hours) continue;
      const mine = day.filter(BW.isCard).map((e) => e.name), used = new Set([A.name]);
      const rows = hours.map((h, i) => {
        if (i === answer) return { h, name: A.name };
        const busy = covering(day, h).name;
        const ok = (n) => !used.has(n) && n !== busy;
        const pool = (Math.random() < 0.6 && mine.filter(ok).length ? mine : ALL_CARDS).filter(ok);
        const name = pick(pool); used.add(name); return { h, name };
      });
      return { person, day: d, rows, answer };
    }
  };
  const matches = (r) => r.rows.map((x, i) => i).filter((i) => covering(BW.PLAN[r.person][r.day], r.rows[i].h).name === r.rows[i].name);

  const chime = (ok) => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [660, 880, 1320] : [180]).forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; o.type = ok ? "sine" : "square";
      o.connect(g); g.connect(a.destination); g.gain.value = 0.06; o.start(a.currentTime + i * 0.1); o.stop(a.currentTime + i * 0.1 + 0.18); }); } catch (e) {} };

  /* --- Defuser --- */
  const Component = ({ onSuccess, onStrike }) => {
    const [round, setRound] = useState(makeRound);
    const [phase, setPhase] = useState("play"); // play | shake | won
    const [chosen, setChosen] = useState(null);
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    Object.assign(TEST, { round, phase });
    const busy = phase !== "play";
    const press = (i) => {
      if (busy) return;
      setChosen(i);
      if (i === round.answer) { chime(true); setPhase("won"); onSuccess(); return; }
      chime(false); onStrike(); setPhase("shake");
      timer.current = setTimeout(() => { setRound(makeRound()); setChosen(null); setPhase("play"); }, 900);
    };
    return (<div className="module-content mu"><h3>📞 MEET UP</h3>
      <div className="bw-head">
        <div className="bw-whose">MEET {round.person}</div>
        <div className="bw-page"><span className="bw-rings" /><b>{BW.DAYS[round.day]}</b></div>
      </div>
      <div className={`mu-note mu-${phase}`}>
        <div className="mu-title">YOUR DAY</div>
        {round.rows.map((r, i) => (<div key={i} className={`mu-row ${phase === "won" && i === round.answer ? "hit" : ""}`}>
          <span className="mu-time">{BW.hourText(r.h)}</span><span className="mu-what">{r.name}</span></div>))}
        {phase === "shake" && <div className="bw-flash">✖ TRY AGAIN</div>}
      </div>
      <div className="mu-q">WHEN DO YOU MEET?</div>
      <div className="mu-btns">{BW.PARTS.map((p, i) => (
        <button key={p} className={`mu-btn ${phase === "won" && i === chosen ? "right" : ""} ${phase === "shake" && i === chosen ? "wrong" : ""}`}
          onClick={() => press(i)} disabled={busy}>{p}</button>))}</div>
    </div>);
  };

  /* --- Expert --- */
  const Rules = () => (<>
    <p><strong>Ask:</strong> "Who do you meet? What day is it?" Find the week, then find the day.</p>
    <p>The Defuser has a plan for the day: six times and six things to do. Read the planner together.
      <strong> One</strong> is the same thing at the same time. That is when you meet!</p>
    <p className="mu-eg">The Defuser has "3 PM COFFEE" and Mom has COFFEE at 3 PM: meet in the <strong>afternoon</strong>!<br />
      The Defuser has "9 AM SWIM" and Mom has SWIM at 12 PM: no, not the same time.</p>
    <p>Then tell the Defuser: morning, noon, afternoon, evening, night or midnight.</p>
    <table className="manual-table bw-key"><tbody>
      <tr><td>5 AM – 11 AM</td><td><strong>morning</strong></td></tr>
      <tr><td>12 PM</td><td><strong>noon</strong></td></tr>
      <tr><td>1 PM – 4 PM</td><td><strong>afternoon</strong></td></tr>
      <tr><td rowSpan={2}>5 PM – 11 PM</td><td><strong>evening</strong>: the first one</td></tr>
      <tr><td><strong>night</strong>: the second one</td></tr>
      <tr><td>12 AM</td><td><strong>midnight</strong></td></tr>
    </tbody></table>
    <p>Wrong: <strong>STRIKE!</strong> New person, new day, new plan.</p>
  </>);
  // On paper, the planners are printed once: in the Busy Week section when that is in the same printout.
  const Manual = ({ only }) => {
    const print = React.useContext(MANUAL.Print);
    const [who, setWho] = useState(BW.PEOPLE[0]);
    if (print) return (<div className="bw-manual"><Rules />{!only || BW.IDS.some((id) => only.includes(id))
      ? <p><strong>The planners (GRANDPA, MOM, SISTER) are in the 📅 Busy Week section.</strong></p> : <BW.Planners />}</div>);
    return (<div className="bw-manual"><Rules />
      <div className="bw-tabs">{BW.PEOPLE.map((p) => <button key={p} className={who === p ? "on" : ""} onClick={() => setWho(p)}>{p}</button>)}</div>
      <div className="bw-scroll"><BW.Planner person={who} /></div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .mu-note{position:relative;background:#fbf8ee;color:#1b1424;border:3px solid #1b1424;border-radius:6px;padding:6px 10px 8px;
      background-image:repeating-linear-gradient(#fbf8ee 0 29px,#b9d3f0 29px 30px);background-position:0 30px;}
    .mu-note.mu-shake{animation:bw-shake 0.4s;}
    .mu-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.8rem;color:#d23a3a;text-align:center;height:24px;line-height:24px;}
    .mu-row{display:grid;grid-template-columns:62px 1fr;gap:8px;height:30px;align-items:center;}
    .mu-row.hit{background:rgba(59,255,106,0.35);border-radius:4px;}
    .mu-time{font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.72rem;text-align:right;color:#3466d6;}
    .mu-what{font-family:'Orbitron',sans-serif;font-weight:700;font-size:0.72rem;}
    .mu-q{text-align:center;font-family:'Orbitron',sans-serif;font-size:0.7rem;color:#aaa;margin:8px 0 4px;}
    .mu-btns{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
    .mu-btn{min-height:46px;background:#1a1a2e;border:2px solid #444;color:#0ff;border-radius:8px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.62rem;cursor:pointer;}
    .mu-btn:disabled{opacity:0.5;} .mu-btn.right{background:#3bff6a;color:#0a1520;opacity:1;} .mu-btn.wrong{background:#d23a3a;color:#fff;opacity:1;}
    .mu-eg{font-size:0.9rem;opacity:0.85;font-style:italic;}
  `;
  document.head.appendChild(css);

  const _test = Object.assign(TEST, { makeRound, matches, covering, ALL_CARDS });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "meetUp", name: "📞 Meet Up", type: "meetUp", difficulty: "A2", puzzle: 3, Component, Manual, _test });
})();
