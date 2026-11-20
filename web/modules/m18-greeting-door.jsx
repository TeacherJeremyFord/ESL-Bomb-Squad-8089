/* ===== M18 GREETING DOOR (A1: good morning / afternoon / evening / night, telling time with AM and PM) =====
 * A door with a clock on it. Press the greeting that fits the time. Right: the door opens and the next door
 * slides in. Wrong: STRIKE, and the same door shows a new time (doors already open stay open).
 * The clock is round (with an AM/PM plate) or digital, at random. Times are in fives.
 * The rule (also in the manual, so the Expert can help or check):
 *   5:00 AM - 11:59 AM  good morning      12:00 PM - 4:59 PM  good afternoon
 *   5:00 PM - 8:59 PM   good evening      9:00 PM - 4:59 AM   good night
 * The game only deals times at least 30 minutes inside a band, so no time sits on a line.
 * Two doors in a row never want the same greeting.
 * Versions (same English, more doors): 1 door (puzzle 1), 3 doors (puzzle 2), 5 doors (puzzle 3).
 * This one is for practice: the Defuser can do it without the manual.
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const GREETINGS = ["GOOD MORNING", "GOOD AFTERNOON", "GOOD EVENING", "GOOD NIGHT"];
  // minutes after midnight that the game deals for each greeting (30 minutes inside each band)
  const DEAL = { "GOOD MORNING": [[330, 690]], "GOOD AFTERNOON": [[750, 990]], "GOOD EVENING": [[1050, 1230]], "GOOD NIGHT": [[1290, 1435], [0, 270]] };
  // the rule itself, for any time
  const greetingAt = (t) => (t >= 300 && t < 720 ? "GOOD MORNING" : t >= 720 && t < 1020 ? "GOOD AFTERNOON" : t >= 1020 && t < 1260 ? "GOOD EVENING" : "GOOD NIGHT");
  const timeFor = (g) => {
    const spans = DEAL[g], all = spans.flatMap(([a, b]) => Array.from({ length: (b - a) / 5 + 1 }, (_, i) => a + 5 * i));
    return pick(all);
  };
  const clock = (t) => ({ h: ((Math.floor(t / 60) + 11) % 12) + 1, m: t % 60, pm: t >= 720 });
  const fmt = (t) => { const c = clock(t); return `${c.h}:${String(c.m).padStart(2, "0")} ${c.pm ? "PM" : "AM"}`; };

  const COLORS = [["#c0392b", "#8e2a1f", "#e8735f"], ["#3466d6", "#244a9c", "#6d94ea"], ["#2f9a45", "#21703a", "#62c272"],
    ["#8e44c9", "#64308f", "#b47be0"], ["#e0952b", "#a8681a", "#f5bd62"], ["#2f8db0", "#20647e", "#62cbe9"]];
  const makeDoor = (not, notColor) => {
    const g = pick(GREETINGS.filter((x) => x !== not));
    return { greeting: g, time: timeFor(g), kind: Math.random() < 0.5 ? "round" : "digital", color: pick(COLORS.filter((c) => c !== notColor)) };
  };
  const makeDoors = (n) => { const d = []; for (let i = 0; i < n; i++) d.push(makeDoor(d[i - 1] && d[i - 1].greeting, d[i - 1] && d[i - 1].color)); return d; };

  /* --- the door: pixel art, 36x56 --- */
  const doorArt = {};
  const doorImg = ([body, shade, light]) => doorArt[body] || (doorArt[body] = PX.paint(36, 56, (set) => {
    const rect = (x0, y0, w, h, c) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, c); };
    rect(0, 0, 36, 56, "#5a3618"); rect(1, 1, 34, 55, "#8b5a2b"); rect(0, 0, 36, 1, "#3a2010");       // frame
    rect(3, 3, 30, 53, body); rect(3, 3, 30, 1, light); rect(3, 3, 1, 53, light); rect(31, 3, 2, 53, shade); // door
    for (const x of [6, 20]) { rect(x, 32, 10, 19, shade); rect(x + 1, 33, 8, 17, body); rect(x + 1, 33, 8, 1, light); } // two panels
    rect(6, 6, 24, 23, shade); rect(7, 7, 22, 21, light);                                                // clock plate
    rect(27, 27, 3, 3, "#f7d843"); rect(28, 29, 2, 1, "#c99a1f"); set(27, 27, "#fff6c0");                 // knob
    for (const y of [8, 46]) rect(3, y, 1, 3, "#1b1424");                                                // hinges
    rect(0, 55, 36, 1, "#3a2010");
  }));

  const Round = ({ t }) => {
    const c = clock(t), hAng = (c.h % 12 + c.m / 60) * 30, mAng = c.m * 6;
    const hand = (ang, len, w) => <line x1="50" y1="50" x2={50 + len * Math.sin(ang * Math.PI / 180)} y2={50 - len * Math.cos(ang * Math.PI / 180)} stroke="#1b1424" strokeWidth={w} strokeLinecap="round" />;
    return (<div className="gd-roundwrap"><svg viewBox="0 0 100 100" className="gd-round">
      <circle cx="50" cy="50" r="46" fill="#fbf8ee" stroke="#1b1424" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => { const n = i + 1, a = n * 30 * Math.PI / 180;
        return <text key={n} x={50 + 33 * Math.sin(a)} y={50 - 33 * Math.cos(a) + 4.5} textAnchor="middle" fontSize="13" fontWeight="900" fill="#1b1424" fontFamily="Orbitron, sans-serif">{n}</text>; })}
      {hand(hAng, 20, 6)}{hand(mAng, 33, 3.5)}<circle cx="50" cy="50" r="4" fill="#d23a3a" />
    </svg><div className="gd-ampm">{c.pm ? "PM" : "AM"}</div></div>);
  };
  const Digital = ({ t }) => { const c = clock(t);
    return <div className="gd-lcd"><span>{c.h}<i>:</i>{String(c.m).padStart(2, "0")}</span><small>{c.pm ? "PM" : "AM"}</small></div>; };

  const chime = (ok) => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [523, 659, 784] : [180]).forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; o.type = ok ? "triangle" : "square";
      o.connect(g); g.connect(a.destination); g.gain.value = 0.07; o.start(a.currentTime + i * 0.09); o.stop(a.currentTime + i * 0.09 + 0.2); }); } catch (e) {} };

  /* --- Defuser --- */
  const makeModule = (n) => ({ onSuccess, onStrike }) => {
    const [doors, setDoors] = useState(() => makeDoors(n));
    const [stage, setStage] = useState(0);
    const [phase, setPhase] = useState("in"); // in | open | shake | won
    const [tries, setTries] = useState(0);
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    Object.assign(TEST, { doors, stage, phase });
    const door = doors[stage], busy = phase !== "in";

    const press = (g) => {
      if (busy) return;
      if (g === door.greeting) {
        chime(true); setPhase(stage === n - 1 ? "won" : "open");
        if (stage === n - 1) { onSuccess(); return; }
        timer.current = setTimeout(() => { setStage(stage + 1); setPhase("in"); }, 900);
      } else {
        chime(false); onStrike(); setPhase("shake");
        timer.current = setTimeout(() => {
          const prev = doors[stage - 1], fresh = makeDoor(prev && prev.greeting, door.color);
          const next = doors[stage + 1];
          if (next && next.greeting === fresh.greeting) { setDoors((d) => d.map((x, i) => (i === stage ? { ...fresh, color: door.color } : i === stage + 1 ? makeDoor(fresh.greeting, x.color) : x))); }
          else setDoors((d) => d.map((x, i) => (i === stage ? { ...fresh, color: door.color } : x)));
          setTries((k) => k + 1); setPhase("in");
        }, 900);
      }
    };

    return (<div className="module-content gd"><h3>🚪 GREETING DOOR{n > 1 ? `: ${["", "", "TWO", "THREE", "FOUR", "FIVE"][n]} DOORS` : ""}</h3>
      {n > 1 && <div className="gd-lamps">{doors.map((_, i) => <span key={i} className={i < stage || phase === "won" ? "on" : i === stage ? "now" : ""}>{i + 1}</span>)}</div>}
      <div className="gd-hall">
        <div className="gd-dark" />
        <div key={`${stage}-${tries}`} className={`gd-door gd-${phase}`}>
          <img className="pixel-art gd-img" src={doorImg(door.color)} alt="door" draggable="false" />
          <div className="gd-clock">{door.kind === "round" ? <Round t={door.time} /> : <Digital t={door.time} />}</div>
        </div>
        {phase === "shake" && <div className="gd-flash">✖ TRY AGAIN</div>}
      </div>
      <div className="gd-btns">{GREETINGS.map((g) => <button key={g} className="gd-btn" onClick={() => press(g)} disabled={busy}>{g}</button>)}</div>
    </div>);
  };

  /* --- Expert --- */
  const Manual = () => (<div className="gd-manual">
    <p>There is a door with a clock. Ask: <strong>"What time is it? Is it AM or PM?"</strong></p>
    <p>Then tell the Defuser what to say to the door.</p>
    <table className="manual-table"><thead><tr><th>Time</th><th>Say</th></tr></thead><tbody>
      <tr><td>5:00 AM – 11:59 AM</td><td><strong>Good morning</strong></td></tr>
      <tr><td>12:00 PM – 4:59 PM</td><td><strong>Good afternoon</strong></td></tr>
      <tr><td>5:00 PM – 8:59 PM</td><td><strong>Good evening</strong></td></tr>
      <tr><td>9:00 PM – 4:59 AM</td><td><strong>Good night</strong></td></tr>
    </tbody></table>
    <p className="gd-eg">The clock says 7:15 PM: <strong>good evening</strong>. The clock says 11:40 AM: <strong>good morning</strong>.</p>
    <p>AM: midnight to noon. PM: noon to midnight.</p>
    <p>Right: the door opens. Sometimes there is <strong>another door</strong>! Wrong: <strong>STRIKE!</strong> The clock changes. Try again.</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .gd-lamps{display:flex;justify-content:center;gap:8px;margin-bottom:6px;}
    .gd-lamps span{width:26px;height:26px;border-radius:50%;background:#222;border:2px solid #555;color:#888;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-size:0.75rem;}
    .gd-lamps span.now{border-color:#ffcc00;color:#ffcc00;} .gd-lamps span.on{background:#3bff6a;border-color:#3bff6a;color:#0a1520;box-shadow:0 0 10px #3bff6a;}
    .gd-hall{position:relative;height:250px;overflow:hidden;border:3px solid #333;border-radius:8px;display:flex;align-items:flex-end;justify-content:center;
      background:repeating-linear-gradient(90deg,#4a3b5c 0 12px,#433553 12px 24px);perspective:700px;}
    .gd-hall::after{content:"";position:absolute;left:0;right:0;bottom:0;height:14px;background:repeating-linear-gradient(90deg,#6b4423 0 18px,#5a3618 18px 20px);}
    .gd-dark{position:absolute;bottom:14px;width:144px;height:220px;background:radial-gradient(ellipse at 50% 70%,#fff3b0 0%,#f2c14e 35%,#1b1424 80%);}
    .gd-door{position:relative;z-index:1;width:144px;height:224px;margin-bottom:14px;transform-origin:left center;animation:gd-in 0.5s ease-out;}
    .gd-img{width:144px;height:224px;display:block;image-rendering:pixelated;}
    .gd-clock{position:absolute;left:16.7%;top:10.7%;width:66.6%;height:37.5%;display:flex;align-items:center;justify-content:center;}
    .gd-door.gd-open,.gd-door.gd-won{transform:rotateY(-105deg);transition:transform 0.8s ease-in;}
    .gd-door.gd-shake{animation:gd-shake 0.4s;}
    @keyframes gd-in{from{transform:translateX(120%);}to{transform:translateX(0);}}
    @keyframes gd-shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);}}
    .gd-roundwrap{display:flex;flex-direction:column;align-items:center;}
    .gd-round{width:68px;height:68px;}
    .gd-ampm{margin-top:-2px;background:#1b1424;color:#ffe14a;font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.7rem;padding:1px 8px;border-radius:3px;}
    .gd-lcd{background:#10141a;border:3px solid #1b1424;border-radius:5px;padding:5px 6px;color:#ff8c1a;text-shadow:0 0 6px #ff8c1a;font-family:'Orbitron',sans-serif;font-weight:900;
      display:flex;align-items:baseline;gap:3px;}
    .gd-lcd span{font-size:1.25rem;} .gd-lcd i{font-style:normal;animation:gd-blink 1s steps(1) infinite;} .gd-lcd small{font-size:0.65rem;}
    @keyframes gd-blink{50%{opacity:0.2;}}
    .gd-flash{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;background:rgba(160,20,20,0.55);color:#fff;font-family:'Orbitron',sans-serif;font-size:1.3rem;font-weight:900;}
    .gd-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;}
    .gd-btn{min-height:52px;background:#1a1a2e;border:2px solid #444;color:#0ff;border-radius:8px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.72rem;cursor:pointer;}
    .gd-btn:active:not(:disabled){background:#0ff;color:#0a1520;} .gd-btn:disabled{opacity:0.45;}
    .gd-eg{font-size:0.9rem;opacity:0.85;font-style:italic;}
  `;
  document.head.appendChild(css);

  const _test = Object.assign(TEST, { GREETINGS, DEAL, greetingAt, timeFor, makeDoors, fmt, clock });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "greetingDoor", name: "🚪 Greeting Door", type: "greetingDoor", difficulty: "A1", puzzle: 1, Component: makeModule(1), Manual, _test },
    { id: "greetingDoor3", name: "🚪 Greeting Door: Three Doors", type: "greetingDoor3", difficulty: "A1", puzzle: 2, Component: makeModule(3), Manual, _test },
    { id: "greetingDoor5", name: "🚪 Greeting Door: Five Doors", type: "greetingDoor5", difficulty: "A1", puzzle: 3, Component: makeModule(5), Manual, _test },
  );
})();
