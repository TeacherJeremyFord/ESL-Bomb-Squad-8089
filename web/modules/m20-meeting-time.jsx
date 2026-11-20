/* ===== M20 MEETING TIME (A2: days of the week, telling time, "Are you free on … at …?") =====
 * Like M19 Meet Up, but the two players look for FREE time instead of the same event.
 * The Expert has three fixed week calendars (DAD, BROTHER, TEACHER), Monday to Sunday, 8 AM to 9 PM, one box an hour.
 * A box with a word is busy; an empty box is free.
 * The bomb says who you meet and shows YOUR CALENDAR: three days (in week order), six times each.
 * On each day, four times are FREE (buttons) and two are busy (a thing to do, not a button).
 * Of the twelve FREE times, exactly one is free in that person's calendar too: press it.
 * The other eleven are busy for the person. Where it can, the Defuser's two busy times on a day are times when the
 * person is free, so "I'm free at 10 AM!" "No, I'm busy." happens in both directions.
 * Wrong: STRIKE, new person, days and times. Fixed manual (no sync number). Independent of M16/M19.
 * Off-list words: meet, free, busy, calendar.
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  /* --- the calendars: "hour THING" for each busy hour; hours not listed are free. --- */
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM ... 9 PM
  const WEEKS = {
    DAD: [
      "8 JOG|9 BREAKFAST|11 BANK|12 LUNCH|13 COMPUTER|15 COFFEE|16 SWIM|18 DINNER|19 WALK THE DOG|21 READ A BOOK",
      "9 BREAKFAST|10 DOCTOR|11 COMPUTER|12 LUNCH|14 BANK|15 PLAY BALL|17 COOK|18 DINNER|20 MUSIC",
      "8 BREAKFAST|10 BOOKSTORE|11 COMPUTER|13 LUNCH|14 TEA|16 FISH AT THE LAKE|17 COOK|19 DINNER|20 SING|21 FEED THE CAT",
      "8 JOG|9 BREAKFAST|10 BANK|12 PIZZA WITH FRIENDS|13 COMPUTER|15 DOCTOR|16 COFFEE|18 DINNER|19 DANCE|20 READ A BOOK",
      "9 BREAKFAST|10 COMPUTER|11 BANK|13 LUNCH|14 SWIM|15 LIBRARY|17 COOK|18 DINNER|19 WALK THE DOG|21 MUSIC",
      "8 SLEEP|10 BREAKFAST|11 PARK|12 LUNCH|14 FLY A KITE|15 ZOO|16 ICE CREAM|18 DINNER|20 DRAW",
      "8 SLEEP|9 BREAKFAST|11 WATER THE FLOWERS|12 LUNCH|13 BIKE TO THE PARK|15 BOAT ON THE LAKE|16 TEA WITH GRANDMA|17 COOK|19 DINNER|20 COMPUTER",
    ],
    BROTHER: [
      "8 MATH|9 ENGLISH|10 PE|11 SCIENCE|12 LUNCH|13 ART|14 MUSIC|16 PLAY BALL|18 DINNER|20 DO HOMEWORK",
      "8 CHINESE|9 MATH|10 SCIENCE|11 ENGLISH|12 LUNCH|13 PE|15 SWIM|17 DO HOMEWORK|18 DINNER|21 COMPUTER",
      "8 ENGLISH|9 ART|10 MATH|11 MUSIC|12 LUNCH|14 PLAY YO-YO|16 LIBRARY|17 DINNER|19 DO HOMEWORK|20 SING",
      "9 SCIENCE|10 CHINESE|11 PE|12 LUNCH|13 MATH|15 FLY A KITE|16 DO HOMEWORK|18 DINNER|19 DANCE|21 READ A BOOK",
      "8 PE|9 CHINESE|10 ENGLISH|11 MATH|12 LUNCH|14 SCIENCE|15 ART|17 PARK WITH FRIENDS|19 DINNER|20 COMPUTER",
      "8 SLEEP|10 BREAKFAST|12 HOT DOGS WITH DAD|13 ZOO|15 SWIM|16 ICE CREAM|18 DINNER|19 DRAW|21 SING",
      "8 SLEEP|9 BREAKFAST|11 PLAY BALL|12 PIZZA WITH DAD|14 BOOKSTORE|15 DO HOMEWORK|16 FEED THE FISH|18 DINNER|20 MUSIC|21 READ A BOOK",
    ],
    TEACHER: [
      "8 ENGLISH|10 ENGLISH|11 ENGLISH|12 LUNCH|14 ENGLISH|15 COMPUTER|17 JOG|18 DINNER|19 READ A BOOK|21 TEA",
      "9 ENGLISH|10 ENGLISH|12 LUNCH|13 ENGLISH|14 ENGLISH|16 DOCTOR|17 SWIM|18 DINNER|20 DANCE",
      "8 ENGLISH|9 ENGLISH|11 ENGLISH|12 COFFEE WITH A FRIEND|13 ENGLISH|15 COMPUTER|16 LIBRARY|18 DINNER|19 SING|20 DRAW",
      "8 ENGLISH|10 ENGLISH|11 ENGLISH|13 LUNCH|14 ENGLISH|15 ENGLISH|17 BANK|19 DINNER|20 MUSIC|21 READ A BOOK",
      "9 ENGLISH|10 ENGLISH|11 ENGLISH|12 LUNCH|14 ENGLISH|16 COFFEE|17 PIZZA WITH FRIENDS|18 DANCE|19 DINNER|21 COMPUTER",
      "8 JOG|10 BREAKFAST|11 BOOKSTORE|13 LUNCH|14 PARK|15 FLY A KITE|17 COOK|18 DINNER|20 WALK THE DOG",
      "8 SLEEP|10 BREAKFAST|12 TEA WITH GRANDMA|13 LUNCH|14 BIKE TO THE PARK|16 WATER THE FLOWERS|17 COOK|19 DINNER|20 READ A BOOK|21 FEED THE CAT",
    ],
  };
  const PEOPLE = Object.keys(WEEKS);
  // CAL[person][day][hour] = the thing, or undefined when free
  const CAL = Object.fromEntries(PEOPLE.map((p) => [p, WEEKS[p].map((s) =>
    Object.fromEntries(s.split("|").map((x) => { const m = x.match(/^(\d+) (.+)$/); return [+m[1], m[2]]; })))]));
  const isFree = (person, d, h) => !CAL[person][d][h];
  const hourText = (h) => (h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`);
  // the Defuser's own busy things
  const MINE = ["SWIM", "JOG", "DANCE", "SING", "DRAW", "MUSIC", "PARK", "ZOO", "LIBRARY", "COMPUTER", "PLAY BALL", "READ A BOOK",
    "FLY A KITE", "WALK THE DOG", "DOCTOR", "COOK", "ART", "MATH", "ENGLISH", "PE"];

  const FREE_PER_DAY = 4, BUSY_PER_DAY = 2;
  // round = { person, days: [{ d, slots: [{ h, free, what }] }] }, slots in time order; answer = { day index, h }
  const makeRound = () => {
    for (;;) {
      const person = pick(PEOPLE);
      const ds = shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b);
      const ansDay = Math.floor(Math.random() * 3);
      const days = [], used = new Set();
      let ok = true, answer = null;
      for (let k = 0; k < 3 && ok; k++) {
        const d = ds[k];
        const pFree = shuffle(HOURS.filter((h) => isFree(person, d, h))), pBusy = shuffle(HOURS.filter((h) => !isFree(person, d, h)));
        const freeHours = [];
        if (k === ansDay) { answer = { day: k, h: pFree.pop() }; freeHours.push(answer.h); }
        while (freeHours.length < FREE_PER_DAY && pBusy.length) freeHours.push(pBusy.pop());
        if (freeHours.length < FREE_PER_DAY) { ok = false; break; }
        // the Defuser is busy when the person is free, if there are such hours left; else at another busy hour
        const busyHours = [];
        while (busyHours.length < BUSY_PER_DAY && (pFree.length || pBusy.length)) busyHours.push((pFree.length ? pFree : pBusy).pop());
        if (busyHours.length < BUSY_PER_DAY) { ok = false; break; }
        const slots = [...freeHours.map((h) => ({ h, free: true })), ...busyHours.map((h) => {
          const what = pick(MINE.filter((w) => !used.has(w))); used.add(what); return { h, free: false, what }; })];
        days.push({ d, slots: slots.sort((a, b) => a.h - b.h) });
      }
      if (ok) return { person, days, answer };
    }
  };
  // every slot that is free for both (should be exactly the answer)
  const bothFree = (r) => r.days.flatMap((day, k) => day.slots.filter((s) => s.free && isFree(r.person, day.d, s.h)).map((s) => ({ day: k, h: s.h })));

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
    const press = (k, h) => {
      if (busy) return;
      setChosen({ day: k, h });
      if (k === round.answer.day && h === round.answer.h) { chime(true); setPhase("won"); onSuccess(); return; }
      chime(false); onStrike(); setPhase("shake");
      timer.current = setTimeout(() => { setRound(makeRound()); setChosen(null); setPhase("play"); }, 900);
    };
    const is = (c, k, h) => c && c.day === k && c.h === h;
    return (<div className="module-content mt"><h3>📆 MEETING TIME</h3>
      <div className="mt-who">MEET {round.person}</div>
      <div className={`mt-cal mt-${phase}`}>
        <div className="mt-title">YOUR CALENDAR</div>
        <div className="mt-days">{round.days.map((day, k) => (
          <div key={day.d} className="mt-day">
            <div className="mt-dname">{DAYS[day.d]}</div>
            {day.slots.map((s) => s.free
              ? <button key={s.h} className={`mt-slot mt-free ${phase === "won" && is(chosen, k, s.h) ? "right" : ""} ${phase === "shake" && is(chosen, k, s.h) ? "wrong" : ""}`}
                  onClick={() => press(k, s.h)} disabled={busy}><span className="mt-time">{hourText(s.h)}</span><span className="mt-what">FREE</span></button>
              : <div key={s.h} className="mt-slot mt-busy"><span className="mt-time">{hourText(s.h)}</span><span className="mt-what">{s.what}</span></div>)}
          </div>))}</div>
        {phase === "shake" && <div className="mt-flash">✖ TRY AGAIN</div>}
      </div>
      <div className="mt-q">WHEN ARE YOU BOTH FREE?</div>
    </div>);
  };

  /* --- Expert --- */
  const Calendar = ({ person }) => (
    <div className="mt-plan-wrap"><h4 className="mt-plan-title">{person}'S WEEK</h4>
      <table className={`mt-plan mt-p-${person.toLowerCase()}`}><thead><tr><th />{DAYS.map((d) => <th key={d}>{d}</th>)}</tr></thead>
        <tbody>{HOURS.map((h) => (<tr key={h}><th>{hourText(h)}</th>
          {DAYS.map((d, c) => { const w = CAL[person][c][h]; return <td key={d} className={w ? "busy" : "free"}>{w || ""}</td>; })}</tr>))}</tbody>
      </table></div>);
  const Rules = () => (<>
    <p><strong>Ask:</strong> "Who do you meet?" Find that person's week. You are that person!</p>
    <p>The Defuser has a calendar with three days. On each day, four times are <strong>free</strong>.
      In your calendar, an <strong>empty box</strong> is free. A box with words is <strong>busy</strong>.</p>
    <p>Only <strong>one</strong> time is free for you <strong>and</strong> the Defuser. Find it! Then the Defuser presses it.</p>
    <p className="mt-eg">"Are you free on Monday at 10 AM?" — "No, sorry. I'm busy. I have ENGLISH."<br />
      "Are you free on Friday at 4 PM?" — "Yes, I'm free!" — "Great! Let's meet on Friday at 4 PM."</p>
    <p>Wrong: <strong>STRIKE!</strong> New person, new days, new times.</p>
  </>);
  const Manual = () => {
    const print = React.useContext(MANUAL.Print);
    const [who, setWho] = useState(PEOPLE[0]);
    if (print) return (<div className="mt-manual"><Rules />{PEOPLE.map((p) => <div key={p} className="mt-print-page"><Calendar person={p} /></div>)}</div>);
    return (<div className="mt-manual"><Rules />
      <div className="mt-tabs">{PEOPLE.map((p) => <button key={p} className={who === p ? "on" : ""} onClick={() => setWho(p)}>{p}</button>)}</div>
      <div className="mt-scroll"><Calendar person={who} /></div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .mt-who{background:#f6f1e1;color:#1b1424;border:3px solid #1b1424;border-radius:6px;margin-bottom:8px;padding:6px;text-align:center;
      font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.85rem;letter-spacing:1px;}
    .mt-cal{position:relative;background:#fbf8ee;color:#1b1424;border:3px solid #1b1424;border-radius:6px;padding:0 6px 6px;}
    .mt-cal.mt-shake{animation:mt-shake 0.4s;}
    @keyframes mt-shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);}}
    .mt-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.8rem;color:#fff;background:#d23a3a;margin:0 -6px 6px;padding:4px;text-align:center;
      border-bottom:2px solid #1b1424;border-radius:2px 2px 0 0;}
    .mt-days{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;}
    .mt-day{display:flex;flex-direction:column;gap:4px;min-width:0;}
    .mt-dname{font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.56rem;text-align:center;color:#3466d6;padding:2px 0;border-bottom:2px solid #b9d3f0;
      overflow-wrap:anywhere;}
    .mt-slot{min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:6px;padding:2px;box-sizing:border-box;
      font-family:'Orbitron',sans-serif;text-align:center;}
    .mt-time{font-weight:900;font-size:0.68rem;}
    .mt-what{font-size:0.5rem;font-weight:700;line-height:1.15;overflow-wrap:anywhere;}
    .mt-free{background:#1a1a2e;border:2px solid #0ff;color:#0ff;cursor:pointer;box-shadow:0 3px 0 #077;}
    .mt-free .mt-what{color:#3bff6a;}
    .mt-free:disabled{opacity:0.5;cursor:default;}
    .mt-free.right{background:#3bff6a;border-color:#1b1424;color:#0a1520;opacity:1;} .mt-free.right .mt-what{color:#0a1520;}
    .mt-free.wrong{background:#d23a3a;border-color:#1b1424;color:#fff;opacity:1;} .mt-free.wrong .mt-what{color:#fff;}
    .mt-busy{background:repeating-linear-gradient(135deg,#e4ddcb 0 6px,#d8d0bb 6px 12px);border:2px solid #b8ae96;color:#5a5040;}
    .mt-flash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(160,20,20,0.55);color:#fff;
      font-family:'Orbitron',sans-serif;font-size:1.3rem;font-weight:900;border-radius:4px;}
    .mt-q{text-align:center;font-family:'Orbitron',sans-serif;font-size:0.7rem;color:#aaa;margin:8px 0 2px;}
    .mt-eg{font-size:0.9rem;opacity:0.85;font-style:italic;}
    .mt-tabs{display:flex;gap:6px;margin:10px 0 6px;}
    .mt-tabs button{flex:1;padding:8px;background:#1a1a2e;border:2px solid #444;color:#aaa;border-radius:6px;font-family:'Orbitron',sans-serif;font-size:0.75rem;cursor:pointer;}
    .mt-tabs button.on{background:#f1c40f;border-color:#f1c40f;color:#000;font-weight:900;}
    .mt-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
    .mt-plan-title{margin:6px 0 4px;color:#ffcc00;font-family:'Orbitron',sans-serif;}
    .mt-plan{border-collapse:collapse;min-width:620px;width:100%;table-layout:fixed;background:#fff;color:#1b1424;font-family:Arial,sans-serif;}
    .mt-plan th,.mt-plan td{border:1px solid #c9c2b2;height:28px;padding:1px 3px;font-size:0.6rem;line-height:1.15;text-align:center;}
    .mt-plan thead th{background:#f6f1e1;font-size:0.6rem;} .mt-plan thead th:first-child{width:44px;}
    .mt-plan tbody th{background:#f6f1e1;color:#555;font-weight:normal;text-align:right;white-space:nowrap;}
    .mt-plan td.busy{background:#cfe0ff;font-weight:bold;}
    .mt-p-brother td.busy{background:#d8f5d0;} .mt-p-teacher td.busy{background:#ffd9ec;}
    .mt-plan td.free{background:#fff;}
    @media print{
      .mt-print-page{break-inside:avoid;page-break-inside:avoid;margin-top:4mm;}
      .mt-plan{min-width:0;} .mt-plan-title{color:#000;font-size:14pt;}
      .mt-plan th,.mt-plan td{height:9mm;font-size:7.5pt;}
      .mt-plan td.busy{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    }
  `;
  document.head.appendChild(css);

  const _test = Object.assign(TEST, { WEEKS, CAL, PEOPLE, DAYS, HOURS, isFree, hourText, makeRound, bothFree });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "meetingTime", name: "📆 Meeting Time", type: "meetingTime", difficulty: "A2", puzzle: 3, Component, Manual, _test });
})();
