/* ===== M16 BUSY WEEK (A2: parts of the day, days of the week, whose) =====
 * The Expert has three week planners (GRANDPA, MOM, SISTER), Monday to Sunday, 5 AM to 12 AM, every hour full.
 * The bomb shows whose week it is and the day. Six events of that day are in play, one for each part of the day.
 *   Busy Week       : six slots MORNING ... MIDNIGHT. Drag the six EVENT cards into them.
 *   Busy Week: When?: six events, in a random order. Drag the six PART OF THE DAY cards next to them.
 * Evening and night have no fixed line, so the rule is the order: of the two late events, the first one is
 * evening and the second one is night. The game only deals: morning 5-11 AM, noon 12 PM, afternoon 1-4 PM,
 * evening 5-8 PM, night 7-11 PM (always after the evening one), midnight 12 AM.
 * Cards are only one-hour events that are not everyday routine (FILLER), so common sense can't place them.
 * The same events come back on other days and in the other planners at other times, so "whose" and "what day"
 * matter. Fixed manual (no sync number). Wrong CHECK: strike, and a new week, day and cards.
 * Off-list words: feed, the, with, MRT (on list), pigs/cows/chickens (plurals).
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  /* --- the planners: "start hour NAME", each event lasts until the next one starts. 24 = 12 AM (midnight). --- */
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const WEEKS = {
    GRANDPA: [
      "5 GET UP|6 BREAKFAST|7 FARM|11 FEED THE PIGS|12 TEA WITH GRANDMA|13 LUNCH|14 FEED THE COWS|15 READ A BOOK|16 FARM|18 DINNER|19 WALK THE DOG|20 SING|21 FEED THE CAT|22 GO TO BED|23 SLEEP|24 MILK AND CAKE",
      "5 GET UP|6 JOG|7 BREAKFAST|8 FARM|12 FISH AT THE LAKE|13 LUNCH|14 DOCTOR|15 FEED THE PIGS|16 FARM|18 DINNER|19 SING|20 READ A BOOK|21 WALK THE DOG|22 GO TO BED|23 SLEEP|24 FEED THE CAT",
      "5 GET UP|6 BREAKFAST|7 FEED THE CHICKENS|8 FARM|12 READ A BOOK|13 LUNCH|14 BANK|15 FARM|18 DINNER|19 TEA WITH GRANDMA|20 WALK THE DOG|21 DRAW|22 GO TO BED|23 SLEEP|24 SING",
      "5 GET UP|6 WALK THE DOG|7 BREAKFAST|8 FARM|11 FEED THE COWS|12 PARK|13 LUNCH|14 FARM|16 FEED THE CHICKENS|17 DINNER|18 MUSIC|19 FEED THE CAT|20 TEA|21 GO TO BED|22 SLEEP|24 READ A BOOK",
      "5 GET UP|6 BREAKFAST|7 FARM|10 BOOKSTORE|11 FEED THE COWS|12 FEED THE PIGS|13 LUNCH|14 FISH AT THE LAKE|15 FARM|18 DINNER|19 DANCE WITH GRANDMA|20 COFFEE|21 WALK THE DOG|22 GO TO BED|23 SLEEP|24 MILK AND CAKE",
      "5 SLEEP|7 GET UP|8 BREAKFAST|9 PARK|10 FEED THE CAT|11 COOK|12 PIZZA WITH FRIENDS|13 FISH AT THE LAKE|14 WATER THE FLOWERS|15 ZOO|17 DINNER|18 READ A BOOK|19 SING|20 DRAW|21 GO TO BED|22 SLEEP|24 TEA WITH GRANDMA",
      "5 SLEEP|8 GET UP|9 BREAKFAST|10 PARK|11 SING|12 COOK|13 LUNCH|14 FEED THE PIGS|15 BIKE TO THE PARK|16 READ A BOOK|17 DINNER|18 WALK THE DOG|19 MUSIC|20 FEED THE COWS|21 GO TO BED|22 SLEEP|24 FEED THE CAT",
    ],
    MOM: [
      "5 SLEEP|6 GET UP|7 JOG|8 BREAKFAST|9 BANK|12 PIZZA WITH DAD|13 BANK|15 COFFEE|16 BANK|18 COOK|19 DINNER|20 READ A BOOK|21 TEA|22 GO TO BED|23 SLEEP|24 FEED THE FISH",
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 MRT TO THE BANK|9 BANK|12 SWIM|13 BANK|15 TEA|16 BANK|18 COOK|19 DINNER|20 DANCE|21 WALK THE DOG|22 GO TO BED|23 SLEEP|24 READ A BOOK",
      "5 GET UP|6 JOG|7 BREAKFAST|8 MRT TO THE BANK|9 BANK|12 LIBRARY|13 BANK|15 COFFEE|16 BANK|18 WALK THE DOG|19 DINNER|20 SING|21 COMPUTER|22 GO TO BED|23 SLEEP|24 TEA",
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 BUS TO THE BANK|9 BANK|12 COFFEE WITH A FRIEND|13 DOCTOR|14 BANK|18 COOK|19 DINNER|20 DRAW WITH SISTER|21 READ A BOOK|22 GO TO BED|23 SLEEP|24 ICE CREAM",
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 MRT TO THE BANK|9 BANK|12 SWIM|13 BANK|15 TEA WITH GRANDMA|16 BANK|18 PIZZA|19 DANCE|20 COFFEE WITH A FRIEND|22 GO TO BED|23 SLEEP|24 WALK THE DOG",
      "5 SLEEP|8 GET UP|9 BREAKFAST|10 BOOKSTORE|11 SWIM|12 PARK|13 LUNCH|14 FLY A KITE|15 ZOO|17 COOK|18 DINNER|19 SING|20 DANCE|21 TEA|22 GO TO BED|23 SLEEP|24 CAKE",
      "5 SLEEP|9 GET UP|10 BREAKFAST|11 WATER THE FLOWERS|12 TEA WITH GRANDMA|13 LUNCH|14 BIKE TO THE PARK|15 BOAT ON THE LAKE|17 COOK|18 DINNER|19 COMPUTER|20 READ A BOOK|21 MUSIC|22 GO TO BED|23 SLEEP|24 FEED THE FISH",
    ],
    SISTER: [
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 MATH|9 ENGLISH|10 PE|11 LUNCH|12 MUSIC|13 SCIENCE|14 ART|15 GO HOME|16 PLAY BALL|17 DINNER|18 DO HOMEWORK|19 DANCE|20 COMPUTER|21 GO TO BED|22 SLEEP|24 ICE CREAM",
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 CHINESE|9 MATH|10 SCIENCE|11 LUNCH|12 LIBRARY|13 ENGLISH|14 PE|15 GO HOME|16 SWIM|17 DO HOMEWORK|18 DINNER|19 DRAW|20 READ A BOOK|21 GO TO BED|22 SLEEP|24 MILK AND CAKE",
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 ENGLISH|9 ART|10 MATH|11 LUNCH|12 PE|13 GO HOME|14 PLAY YO-YO|15 DO HOMEWORK|17 DINNER|18 SING|19 FEED THE CAT|20 COMPUTER|21 GO TO BED|22 SLEEP|24 PIZZA",
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 SCIENCE|9 MUSIC|10 CHINESE|11 LUNCH|12 ART|13 MATH|14 ENGLISH|15 GO HOME|16 FLY A KITE|17 DO HOMEWORK|18 DINNER|19 PLAY YO-YO|20 DANCE|21 GO TO BED|22 SLEEP|24 ICE CREAM",
      "5 SLEEP|6 GET UP|7 BREAKFAST|8 PE|9 CHINESE|10 ENGLISH|11 LUNCH|12 SCIENCE|13 MUSIC|14 MATH|15 GO HOME|16 PARK WITH FRIENDS|17 DINNER|18 COMPUTER|19 SING|20 DRAW|21 GO TO BED|22 SLEEP|24 READ A BOOK",
      "5 SLEEP|9 GET UP|10 BREAKFAST|11 DRAW|12 HOT DOGS WITH DAD|13 ZOO|15 SWIM|16 ICE CREAM|17 DINNER|18 DANCE|19 COMPUTER|20 SING|21 GO TO BED|22 SLEEP|24 CAKE",
      "5 SLEEP|8 GET UP|9 BREAKFAST|10 TEA WITH GRANDMA|11 PLAY BALL|12 PIZZA WITH DAD|13 BOOKSTORE|14 LIBRARY|15 DO HOMEWORK|17 DINNER|18 FEED THE FISH|19 READ A BOOK|20 MUSIC|21 GO TO BED|22 SLEEP|24 MILK AND CAKE",
    ],
  };
  const PEOPLE = Object.keys(WEEKS);
  // everyday routine: never a card, so nobody can place it without the planner
  const FILLER = new Set(["GET UP", "BREAKFAST", "LUNCH", "DINNER", "GO HOME", "DO HOMEWORK", "GO TO BED", "SLEEP"]);
  const parse = (s) => {
    const e = s.split("|").map((x) => { const m = x.match(/^(\d+) (.+)$/); return { start: +m[1], name: m[2] }; });
    return e.map((x, i) => ({ ...x, end: i + 1 < e.length ? e[i + 1].start : 25 }));
  };
  const PLAN = Object.fromEntries(PEOPLE.map((p) => [p, WEEKS[p].map(parse)]));

  const PARTS = ["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT", "MIDNIGHT"];
  const HOURS = { MORNING: [5, 11], NOON: [12, 12], AFTERNOON: [13, 16], EVENING: [17, 20], NIGHT: [19, 23], MIDNIGHT: [24, 24] };
  const hourText = (h) => (h === 24 ? "12 AM" : h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`);
  const isCard = (e) => e.end - e.start === 1 && !FILLER.has(e.name);
  const candidates = (person, day) => {
    const ev = PLAN[person][day].filter(isCard);
    return Object.fromEntries(PARTS.map((p) => [p, ev.filter((e) => e.start >= HOURS[p][0] && e.start <= HOURS[p][1])]));
  };
  // one event for each part of the day, in time order (index = part)
  const makeRound = () => {
    const person = pick(PEOPLE), day = Math.floor(Math.random() * 7), c = candidates(person, day);
    const late = c.EVENING.flatMap((e) => c.NIGHT.filter((n) => n.start > e.start).map((n) => [e, n]));
    const [ev, ni] = pick(late);
    const events = [pick(c.MORNING), pick(c.NOON), pick(c.AFTERNOON), ev, ni, pick(c.MIDNIGHT)];
    return { person, day, events: events.map((e, i) => ({ name: e.name, start: e.start, part: PARTS[i] })) };
  };

  const chime = (ok) => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [660, 880, 1320] : [180]).forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; o.type = ok ? "sine" : "square";
      o.connect(g); g.connect(a.destination); g.gain.value = 0.06; o.start(a.currentTime + i * 0.1); o.stop(a.currentTime + i * 0.1 + 0.18); }); } catch (e) {} };

  /* --- Defuser: rows with a label and a drop zone, and a tray of cards (drag, or tap a card then a zone) --- */
  // mode "events": labels are the parts of the day, cards are the events.
  // mode "parts":  labels are the events (shuffled), cards are the parts of the day.
  const setup = (mode) => {
    const r = makeRound();
    if (mode === "events") return { r, labels: PARTS, answer: r.events.map((e) => e.name), tray: shuffle(r.events.map((e) => e.name)) };
    const rows = shuffle(r.events);
    return { r, labels: rows.map((e) => e.name), answer: rows.map((e) => e.part), tray: shuffle(PARTS) };
  };

  const makeModule = (mode) => ({ onSuccess, onStrike }) => {
    const [game, setGame] = useState(() => setup(mode));
    const [tray, setTray] = useState(game.tray);
    const [slots, setSlots] = useState(() => game.labels.map(() => null));
    const [held, setHeld] = useState(null);
    const [drag, setDrag] = useState(null);
    const [phase, setPhase] = useState("play"); // play | shake | won
    const start = useRef(null), timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    Object.assign(TEST, { game, tray, slots, held, phase });
    const busy = phase !== "play";

    const move = (word, i) => {
      const from = slots.indexOf(word);
      const s = [...slots]; let t = tray.filter((w) => w !== word);
      if (i == null) { if (from < 0) return; s[from] = null; t = [...t, word]; }
      else { const old = s[i]; if (from >= 0) s[from] = old; else if (old) t = tray.map((w) => (w === word ? old : w)); s[i] = word; }
      setSlots(s); setTray(t); setHeld(null);
    };
    const down = (e, word) => { if (busy) return; start.current = { word, x: e.clientX, y: e.clientY, moved: false }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} };
    const over = (e) => { const s = start.current; if (!s) return; if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 6) return; s.moved = true; setDrag({ word: s.word, x: e.clientX, y: e.clientY }); };
    const up = (e) => {
      const s = start.current; start.current = null; setDrag(null);
      if (!s || busy) return;
      if (!s.moved) { if (held && held !== s.word && slots.includes(s.word)) { move(held, slots.indexOf(s.word)); return; } setHeld(held === s.word ? null : s.word); return; }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slot = el && el.closest("[data-bw-slot]"), back = el && el.closest("[data-bw-tray]");
      if (slot) move(s.word, +slot.dataset.bwSlot); else if (back) move(s.word, null);
    };
    const check = () => {
      if (busy || slots.includes(null)) return;
      if (slots.every((w, i) => w === game.answer[i])) { chime(true); setPhase("won"); onSuccess(); return; }
      chime(false); onStrike(); setPhase("shake");
      timer.current = setTimeout(() => { const g = setup(mode); setGame(g); setTray(g.tray); setSlots(g.labels.map(() => null)); setHeld(null); setPhase("play"); }, 900);
    };
    const card = (word) => (
      <div key={word} className={`bw-card ${held === word ? "held" : ""} ${drag && drag.word === word ? "ghosted" : ""}`}
        onPointerDown={(e) => down(e, word)} onPointerMove={over} onPointerUp={up} onPointerCancel={() => { start.current = null; setDrag(null); }}>{word}</div>);

    return (<div className={`module-content bw bw-${mode}`}><h3>📅 BUSY WEEK{mode === "parts" ? ": WHEN?" : ""}</h3>
      <div className="bw-head">
        <div className="bw-whose">{game.r.person}'S WEEK</div>
        <div className="bw-page"><span className="bw-rings" /><b>{DAYS[game.r.day]}</b></div>
      </div>
      <div className={`bw-board bw-${phase}`}>
        {game.labels.map((label, i) => (
          <div key={i} className="bw-row">
            <div className="bw-label">{label}</div>
            <div className={`bw-slot ${slots[i] ? "full" : ""}`} data-bw-slot={i} onClick={() => !busy && held && !slots[i] && move(held, i)}>
              {slots[i] ? card(slots[i]) : <span className="bw-empty" />}</div>
          </div>))}
        {phase === "shake" && <div className="bw-flash">✖ TRY AGAIN</div>}
        {phase === "won" && <div className="bw-flash bw-good">✔ RIGHT</div>}
      </div>
      <div className="bw-tray" data-bw-tray="1" onClick={(e) => e.target === e.currentTarget && !busy && held && slots.includes(held) && move(held, null)}>
        {tray.map(card)}{tray.length === 0 && <span className="bw-tray-empty">✔</span>}
      </div>
      <button className={`submit-btn bw-check ${phase === "won" ? "correct" : ""}`} onClick={check} disabled={busy || slots.includes(null)}>{phase === "won" ? "✓ DEFUSED" : "CHECK"}</button>
      {drag && <div className="bw-card bw-drag" style={{ left: drag.x, top: drag.y }}>{drag.word}</div>}
    </div>);
  };

  /* --- Expert: the rules and the three planners --- */
  const ROWS = Array.from({ length: 20 }, (_, i) => i + 5); // 5 AM ... 12 AM (24)
  const Planner = ({ person }) => (
    <div className="bw-plan-wrap"><h4 className="bw-plan-title">{person}'S WEEK</h4>
      <div className={`bw-plan bw-p-${person.toLowerCase()}`}>
        <div className="bw-corner" />
        {DAYS.map((d, c) => <div key={d} className="bw-day" style={{ gridColumn: c + 2 }}>{d}</div>)}
        {ROWS.map((h, r) => <div key={h} className="bw-hour" style={{ gridRow: r + 2 }}>{hourText(h)}</div>)}
        {PLAN[person].flatMap((day, c) => day.map((e) => (
          <div key={c + "-" + e.start} className={`bw-ev ${FILLER.has(e.name) ? "routine" : ""}`}
            style={{ gridColumn: c + 2, gridRow: `${e.start - 3} / ${e.end - 3}` }}>{e.name}</div>)))}
      </div></div>);

  // one manual for both versions, so the paper manual prints the planners once
  const Rules = () => (<>
    <p><strong>Ask:</strong> "Whose week is it? What day is it?" Find the week, then find the day.</p>
    <p>The Defuser has six things to do. Ask: "What are they?" Find them on that day. Tell the Defuser: morning, noon, afternoon, evening, night or midnight.</p>
    <table className="manual-table bw-key"><tbody>
      <tr><td>5 AM – 11 AM</td><td><strong>morning</strong></td></tr>
      <tr><td>12 PM</td><td><strong>noon</strong></td></tr>
      <tr><td>1 PM – 4 PM</td><td><strong>afternoon</strong></td></tr>
      <tr><td rowSpan={2}>5 PM – 11 PM<br /><small>(two cards)</small></td><td>the first one: <strong>evening</strong></td></tr>
      <tr><td>the second one: <strong>night</strong></td></tr>
      <tr><td>12 AM</td><td><strong>midnight</strong></td></tr>
    </tbody></table>
    <p className="bw-eg">Evening is <strong>before</strong> night. SWIM is at 7 PM and DRAW is at 8 PM: swim is evening, draw is night.</p>
    <p>Wrong: <strong>STRIKE!</strong> New week, new day, new cards.</p>
  </>);
  const Planners = () => <>{PEOPLE.map((p) => <div key={p} className="bw-print-page"><Planner person={p} /></div>)}</>;
  const Manual = () => {
    const print = React.useContext(MANUAL.Print);
    const [who, setWho] = useState(PEOPLE[0]);
    if (print) return (<div className="bw-manual"><Rules /><Planners /></div>);
    return (<div className="bw-manual"><Rules />
      <div className="bw-tabs">{PEOPLE.map((p) => <button key={p} className={who === p ? "on" : ""} onClick={() => setWho(p)}>{p}</button>)}</div>
      <div className="bw-scroll"><Planner person={who} /></div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .bw-head{display:flex;gap:8px;align-items:stretch;margin-bottom:8px;}
    .bw-whose{flex:1;display:flex;align-items:center;justify-content:center;background:#f6f1e1;color:#1b1424;border:3px solid #1b1424;border-radius:6px;
      font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.85rem;letter-spacing:1px;text-align:center;padding:6px;}
    .bw-page{position:relative;width:46%;background:#fff;border:3px solid #1b1424;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;}
    .bw-rings{display:block;height:12px;background:#d23a3a;border-bottom:2px solid #1b1424;}
    .bw-page b{flex:1;display:flex;align-items:center;justify-content:center;color:#1b1424;font-family:'Orbitron',sans-serif;font-size:0.8rem;padding:6px 2px;}
    .bw-board{position:relative;display:flex;flex-direction:column;gap:5px;background:#0a1520;border:3px solid #333;border-radius:8px;padding:6px;}
    .bw-board.bw-shake{animation:bw-shake 0.4s;}
    @keyframes bw-shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);}}
    .bw-row{display:grid;grid-template-columns:96px 1fr;gap:6px;align-items:center;min-height:44px;}
    .bw-parts .bw-row{grid-template-columns:1fr 112px;}
    .bw-label{font-family:'Orbitron',sans-serif;font-size:0.68rem;font-weight:900;color:#ffcc00;text-align:right;}
    .bw-parts .bw-label{color:#e8f0ff;text-align:left;background:#16243a;border:2px solid #2c4060;border-radius:6px;padding:6px;min-height:28px;display:flex;align-items:center;}
    .bw-slot{min-height:42px;display:flex;cursor:pointer;} .bw-slot.full{cursor:default;}
    .bw-empty{flex:1;border:2px dashed #445;border-radius:6px;}
    .bw-tray{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;padding:6px;border:2px dashed #2a3a4a;border-radius:8px;min-height:50px;}
    .bw-parts .bw-tray{grid-template-columns:1fr 1fr 1fr;}
    .bw-tray-empty{grid-column:1/-1;text-align:center;color:#3bff6a;align-self:center;}
    .bw-card{flex:1;min-height:40px;display:flex;align-items:center;justify-content:center;text-align:center;padding:2px 4px;background:#f6f1e1;color:#1b1424;
      border:2px solid #1b1424;border-radius:6px;box-shadow:0 3px 0 #8a7a5a;font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.62rem;line-height:1.2;
      touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;box-sizing:border-box;}
    .bw-card.held{background:#ffe14a;box-shadow:0 0 10px #ffe14a;} .bw-card.ghosted{opacity:0.3;}
    .bw-drag{position:fixed;z-index:1000;transform:translate(-50%,-50%) rotate(-3deg);width:140px;pointer-events:none;box-shadow:0 8px 16px rgba(0,0,0,0.5);}
    .bw-flash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(160,20,20,0.55);color:#fff;font-family:'Orbitron',sans-serif;font-size:1.3rem;font-weight:900;border-radius:6px;}
    .bw-flash.bw-good{background:rgba(20,140,60,0.5);}
    .bw-check{width:100%;margin-top:8px;min-height:48px;}
    .bw-key{margin:6px 0;} .bw-key td{text-align:left;}
    .bw-eg{font-size:0.9rem;opacity:0.85;font-style:italic;}
    .bw-tabs{display:flex;gap:6px;margin:10px 0 6px;}
    .bw-tabs button{flex:1;padding:8px;background:#1a1a2e;border:2px solid #444;color:#aaa;border-radius:6px;font-family:'Orbitron',sans-serif;font-size:0.75rem;cursor:pointer;}
    .bw-tabs button.on{background:#f1c40f;border-color:#f1c40f;color:#000;font-weight:900;}
    .bw-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
    .bw-plan-title{margin:6px 0 4px;color:#ffcc00;font-family:'Orbitron',sans-serif;}
    .bw-plan{display:grid;grid-template-columns:44px repeat(7,minmax(80px,1fr));grid-template-rows:auto repeat(20,30px);gap:1px;min-width:620px;
      background:#c9c2b2;border:1px solid #c9c2b2;font-family:Arial,sans-serif;color:#1b1424;}
    .bw-corner,.bw-day,.bw-hour{background:#f6f1e1;}
    .bw-day{grid-row:1;text-align:center;font-weight:bold;font-size:0.62rem;padding:4px 1px;}
    .bw-hour{grid-column:1;font-size:0.58rem;padding:2px 3px;text-align:right;color:#555;}
    .bw-ev{margin:1px;border-radius:3px;padding:2px 3px;font-size:0.6rem;font-weight:bold;line-height:1.15;overflow:hidden;background:#cfe0ff;border-left:3px solid #3466d6;}
    .bw-p-mom .bw-ev{background:#ffd9ec;border-left-color:#d6348a;}
    .bw-p-sister .bw-ev{background:#d8f5d0;border-left-color:#2f9a45;}
    .bw-ev.routine{background:#eee!important;border-left-color:#aaa!important;color:#666;font-weight:normal;}
    @media print{
      .bw-print-page{break-inside:avoid;page-break-inside:avoid;margin-top:4mm;}
      .bw-plan{min-width:0;grid-template-columns:13mm repeat(7,1fr);grid-template-rows:auto repeat(20,9.6mm);}
      .bw-plan-title{color:#000;font-size:14pt;}
      .bw-ev{font-size:7.5pt;} .bw-day{font-size:7.5pt;} .bw-hour{font-size:7pt;}
    }
  `;
  document.head.appendChild(css);

  // shared with M19 Meet Up (same planners, same paper)
  window.BUSY_WEEK = { PLAN, PEOPLE, DAYS, PARTS, HOURS, FILLER, isCard, hourText, Planner, Planners, IDS: ["busyWeek", "busyWeekWhen"] };
  const _test = Object.assign(TEST, { WEEKS, PLAN, PARTS, HOURS, FILLER, DAYS, candidates, makeRound, setup, isCard });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "busyWeek", name: "📅 Busy Week", type: "busyWeek", difficulty: "A2", puzzle: 3, Component: makeModule("events"), Manual, _test },
    { id: "busyWeekWhen", name: "📅 Busy Week: When?", type: "busyWeekWhen", difficulty: "A2", puzzle: 3, Component: makeModule("parts"), Manual, _test },
  );
})();
