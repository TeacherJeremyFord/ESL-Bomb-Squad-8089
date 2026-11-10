/* ===== M05 TICKET MACHINE (B1 tier: 2-3 legs, two closed ways, sunny or rainy) =====
 * Design: docs/design/modules/M05_ticket_machine.md · Build spec: docs/design/modules/build/M05_build.md
 * The Defuser has FROM / TO, the closed board and the weather. The Expert has the city map and the rules.
 * Each leg is "way, then stop"; a wrong leg is a strike and doesn't print.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const PLACES = ["home", "school", "bank", "library", "zoo", "farm", "bookstore", "park", "lake", "sea"];
  const WAYS = ["car", "bike", "bus", "train", "taxi", "on foot", "MRT", "plane", "ship", "boat"];
  // The map, from the design doc. Lines go both ways. A teacher could swap in a real neighborhood.
  const LINES = [
    ["home", "school", ["bus", "bike", "on foot"]], ["home", "bank", ["car", "taxi"]], ["school", "library", ["MRT"]],
    ["school", "park", ["bus"]], ["library", "bookstore", ["on foot"]], ["library", "zoo", ["MRT"]], ["bank", "park", ["MRT"]],
    ["park", "zoo", ["bike", "bus"]], ["zoo", "farm", ["bus", "taxi"]], ["farm", "lake", ["boat"]], ["farm", "sea", ["train"]],
  ];
  const BOX = { bookstore: [2, 0], home: [0, 1], school: [1, 1], library: [2, 1], lake: [3, 1], bank: [0, 2], park: [1, 2], zoo: [2, 2], farm: [3, 2], sea: [3, 3] };
  const FAST = ["MRT", "train"], RAIN_BANS = ["bike", "on foot"];
  const USED = [...new Set(LINES.flatMap((l) => l[2]))];

  const openWays = (a, b, closed, weather) => {
    const line = LINES.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
    return line ? line[2].filter((w) => !closed.includes(w) && !(weather === "rainy" && RAIN_BANS.includes(w))) : [];
  };
  // Rules 2-3: fewest stops, then the most MRT / train legs. Returns null if no route or a tie.
  const bestRoute = (from, to, closed, weather) => {
    const paths = [], seen = { [from]: 0 }, queue = [[from]];
    while (queue.length) {
      const path = queue.shift(), at = path[path.length - 1];
      if (paths.length && path.length > paths[0].length) break;
      if (at === to) { paths.push(path); continue; }
      for (const p of PLACES) if (openWays(at, p, closed, weather).length && !path.includes(p) && (seen[p] === undefined || seen[p] >= path.length)) { seen[p] = path.length; queue.push([...path, p]); }
    }
    if (!paths.length) return null;
    const fast = (p) => p.slice(1).filter((x, i) => openWays(p[i], x, closed, weather).some((w) => FAST.includes(w))).length;
    const top = Math.max(...paths.map(fast)), best = paths.filter((p) => fast(p) === top);
    return best.length === 1 ? best[0] : null;
  };

  const makeBoard = () => {
    for (;;) {
      const from = pick(PLACES), to = pick(PLACES.filter((p) => p !== from));
      const closed = []; while (closed.length < 2) { const w = pick(USED); if (!closed.includes(w)) closed.push(w); }
      const weather = pick(["sunny", "rainy"]);
      const route = bestRoute(from, to, closed, weather), plain = bestRoute(from, to, [], "sunny");
      if (!route || route.length - 1 < 2 || route.length - 1 > 3) continue;
      if (!plain || plain.join() === route.join()) continue; // the closures or the weather must change the route
      return { from, to, closed, weather };
    }
  };

  const Pic = ({ kind, name, size = 40 }) => <img className="pixel-art" src={kind === "way" ? PX.way(name) : PX.place(name)} alt={name} width={size} height={size} />;

  /* --- Defuser --- */
  const TicketMachineModule = ({ onSuccess, onStrike }) => {
    const [b] = useState(makeBoard);
    const [legs, setLegs] = useState([]);
    const [way, setWay] = useState(null);
    const [msg, setMsg] = useState(null);
    TEST.board = b;
    const at = legs.length ? legs[legs.length - 1].stop : b.from, done = at === b.to;
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1600); };
    const stop = (p) => {
      if (done) return;
      if (!way) return flash("Press a way first.");
      const route = bestRoute(at, b.to, b.closed, b.weather);
      if (route && route[1] === p && openWays(at, p, b.closed, b.weather).includes(way)) {
        const next = [...legs, { way, stop: p }]; setLegs(next); setWay(null);
        if (p === b.to) { flash("TICKET!"); onSuccess(); }
      } else { onStrike(); setWay(null); flash("No! Try again."); }
    };
    return (<div className="module-content tm"><h3>🎫 TICKET MACHINE</h3>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className="tm-lights">
        <div className="tm-light"><span>FROM</span><Pic kind="place" name={b.from} size={64} /></div>
        <div className="tm-arrow">➜</div>
        <div className="tm-light"><span>TO</span><Pic kind="place" name={b.to} size={64} /></div>
      </div>
      <div className="tm-info">
        <div className="tm-board"><span>CLOSED TODAY</span><div>{b.closed.map((w) => <span key={w} className="tm-x"><Pic kind="way" name={w} size={40} /></span>)}</div></div>
        <div className="tm-board"><span>WEATHER</span><img className="pixel-art" alt={b.weather} width={40} height={40} src={b.weather === "rainy" ? PX.rainChip() : PX.food("lunch")} /></div>
      </div>
      <div className="tm-ticket"><span>TICKET:</span>{legs.length ? legs.map((l, i) => (
        <span key={i} className="tm-leg"><Pic kind="way" name={l.way} size={24} />➜<Pic kind="place" name={l.stop} size={24} /></span>)) : <i>—</i>}
      </div>
      <div className="lr-label">1. HOW? (press a way)</div>
      <div className="tm-grid">{WAYS.map((w) => (
        <button key={w} className={`lr-item ${way === w ? "tm-on" : ""}`} onClick={() => setWay(w)} disabled={done}><Pic kind="way" name={w} /><span>{w}</span></button>))}</div>
      <div className="lr-label">2. WHERE? (press a stop)</div>
      <div className="tm-grid">{PLACES.map((p) => (
        <button key={p} className="lr-item" onClick={() => stop(p)} disabled={done}><Pic kind="place" name={p} /><span>{p}</span></button>))}</div>
    </div>);
  };

  /* --- Expert --- */
  const MapDrawing = () => {
    const X = (p) => 8 + BOX[p][0] * 100, Y = (p) => 8 + BOX[p][1] * 56;
    return (<svg viewBox="0 0 396 208" className="tm-map">
      {LINES.map(([a, b2, ways]) => (<g key={a + b2}>
        <line x1={X(a) + 40} y1={Y(a) + 16} x2={X(b2) + 40} y2={Y(b2) + 16} stroke="#888" strokeWidth="3" />
      </g>))}
      {PLACES.map((p) => (<g key={p}><rect x={X(p)} y={Y(p)} width="80" height="32" rx="4" fill="#f4ecd8" stroke="#1b1424" strokeWidth="2" />
        <text x={X(p) + 40} y={Y(p) + 21} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1b1424">{p}</text></g>))}
    </svg>);
  };
  const TicketMachineManual = () => (<div>
    <MapDrawing />
    <table className="manual-table"><thead><tr><th>Line</th><th>Go by</th></tr></thead>
      <tbody>{LINES.map(([a, b, w]) => <tr key={a + b}><td>{a} – {b}</td><td>{w.join(", ")}</td></tr>)}</tbody></table>
    <p>1. Ask: "Where do you go from? Where do you go to?"</p>
    <p>2. Find the way on the map. Use the way with <strong>the fewest stops</strong>.</p>
    <p>3. If two ways have the same stops, go by MRT or train first. They are fast.</p>
    <p>4. Ask: "What is closed today?" Do not go by that.</p>
    <p>5. If it is <strong>rainy</strong>, do not go by bike, and do not walk (no "on foot").</p>
    <p>6. Tell the Defuser <strong>how</strong> to go: "From the bank, go to the park by MRT."</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .tm-lights{display:flex;align-items:center;justify-content:center;gap:10px;background:#0a1520;border:1px solid #333;border-radius:6px;padding:8px;}
    .tm-light{display:flex;flex-direction:column;align-items:center;background:#1b2b1b;border:3px solid #3bff6a;border-radius:8px;padding:4px 8px;box-shadow:0 0 12px #3bff6a55;}
    .tm-light span{font-family:'Orbitron',sans-serif;font-size:0.7rem;color:#3bff6a;} .tm-light img{background:#f4ecd8;border-radius:4px;}
    .tm-arrow{font-size:1.6rem;color:#ffcc00;}
    .tm-info{display:flex;gap:6px;margin:6px 0;} .tm-board{flex:1;background:#1a1a2e;border:1px solid #444;border-radius:6px;padding:4px;text-align:center;}
    .tm-board>span{display:block;font-family:'Orbitron',sans-serif;font-size:0.6rem;color:#888;margin-bottom:2px;}
    .tm-board>div{display:flex;justify-content:center;gap:4px;} .tm-board img{background:#f4ecd8;border-radius:4px;}
    .tm-x{position:relative;display:inline-block;} .tm-x::after{content:'';position:absolute;inset:0;background:linear-gradient(45deg,transparent 44%,#ff2a2a 44% 56%,transparent 56%),linear-gradient(-45deg,transparent 44%,#ff2a2a 44% 56%,transparent 56%);}
    .tm-ticket{background:#fffbe8;color:#2a2018;border-radius:4px;padding:4px 6px;min-height:36px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:0.75rem;}
    .tm-leg{display:inline-flex;align-items:center;gap:2px;border-right:1px dashed #998;padding-right:6px;}
    .tm-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;}
    .tm-on{border-color:#ffcc00 !important;box-shadow:0 0 0 2px #ffcc00;background:#fff3c0 !important;}
    .tm-map{width:100%;background:#12121f;border:1px solid #333;border-radius:6px;margin-bottom:6px;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "ticketMachine", name: "🎫 Ticket Machine", type: "ticketMachine", difficulty: "B1",
    Component: TicketMachineModule, Manual: TicketMachineManual,
    _test: Object.assign(TEST, { makeBoard, bestRoute, openWays }),
  });
})();
