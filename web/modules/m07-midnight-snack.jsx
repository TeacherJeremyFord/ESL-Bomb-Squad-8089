/* ===== M07 MIDNIGHT SNACK (B1 tier: 7-9 rooms, random start, baby + parents + pets, trip back to bed) =====
 * Design: docs/design/modules/M07_midnight_snack.md · Build spec: docs/design/modules/build/M07_build.md
 * The Defuser sees only the room they are in; the Expert has the floor plan but not the Defuser's position.
 * Sync code: the bomb shows a HOUSE NUMBER; the Expert types it in and both sides build the same house.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const COLORS = ["red", "blue", "green", "yellow"];
  const DOOR_HEX = { red: "#e04848", blue: "#3f6fd8", green: "#3f9e45", yellow: "#f7d843" };
  const PETS_AND_PARENTS = ["dog", "cat", "father", "mother"];

  /* --- the house --- */
  const makeHouse = (code) => {
    const r = rng(code), pick = (a) => a[Math.floor(r() * a.length)], shuffle = (a) => a.map((v) => [r(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    for (let tries = 0; ; tries++) {
      // 1. A connected set of 7-9 cells in a 3×3 grid.
      const n = 7 + Math.floor(r() * 3), cells = [[Math.floor(r() * 3), Math.floor(r() * 3)]];
      const key = ([x, y]) => x + "," + y, has = (c) => cells.some((d) => key(d) === key(c));
      const nb = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < 3 && b < 3);
      while (cells.length < n) { const c = pick(cells.flatMap(nb).filter((c) => !has(c))); cells.push(c); }
      cells.sort((a, b) => a[1] - b[1] || a[0] - b[0]); // room numbers in reading order
      // 2. Kinds: one kitchen, three bedrooms (YOU, the baby, the parents), a bathroom, a living room, the rest random.
      const kinds = shuffle(["kitchen", "bedroom", "bedroom", "bedroom", "bathroom", "living room", ...Array.from({ length: n - 6 }, () => pick(["bedroom", "bathroom", "living room"]))]);
      const rooms = cells.map((cell, i) => ({ rid: i + 1, cell, kind: kinds[i], window: r() < 0.4, sleepers: [], you: false }));
      const bedrooms = shuffle(rooms.filter((x) => x.kind === "bedroom"));
      bedrooms[0].you = true; bedrooms[1].sleepers.push("baby"); bedrooms[2].sleepers.push("father", "mother");
      const petRooms = shuffle(rooms.filter((x) => x.kind !== "kitchen" && !x.sleepers.length));
      petRooms[0].sleepers.push("dog"); petRooms[1].sleepers.push("cat");
      // 3. Doors: a random spanning tree plus 1-3 extra doors; no room has two doors of one color.
      const at = (c) => rooms.find((x) => key(x.cell) === key(c));
      const edges = [], inTree = new Set([rooms[0].rid]);
      while (inTree.size < rooms.length) {
        const cand = rooms.filter((x) => inTree.has(x.rid)).flatMap((x) => nb(x.cell).filter(has).map((c) => [x.rid, at(c).rid])).filter(([, b]) => !inTree.has(b));
        const e = pick(cand); edges.push(e); inTree.add(e[1]);
      }
      const extra = rooms.flatMap((x) => nb(x.cell).filter(has).map((c) => [x.rid, at(c).rid])).filter(([a, b]) => a < b && !edges.some(([p, q]) => (p === a && q === b) || (p === b && q === a)));
      shuffle(extra).slice(0, 1 + Math.floor(r() * 3)).forEach((e) => edges.push(e));
      const doors = [], used = {};
      let ok = true;
      for (const [a, b] of edges) {
        const free = COLORS.filter((c) => !(used[a] || []).includes(c) && !(used[b] || []).includes(c));
        if (!free.length) { ok = false; break; }
        const c = pick(free); doors.push({ a, b, color: c }); (used[a] = used[a] || []).push(c); (used[b] = used[b] || []).push(c);
      }
      if (!ok) continue;
      const kitchen = rooms.find((x) => x.kind === "kitchen");
      const start = pick(rooms.filter((x) => x !== kitchen)).rid;
      const house = { code, rooms, doors, start };
      // 4. Solvable without strikes, not trivial, and the start room looks like no other room.
      const len = solve(house);
      if (len === null || len < 5 || len > 12) continue;
      const look = (rid) => { const x = room(house, rid); return [x.kind, x.window, doorsOf(house, rid).map((d) => d.color).sort().join(), [...x.sleepers].sort().join()].join("|"); };
      if (rooms.filter((x) => look(x.rid) === look(start)).length !== 1) continue;
      house.shortest = len;
      return house;
    }
  };
  const room = (h, rid) => h.rooms.find((x) => x.rid === rid);
  const doorsOf = (h, rid) => h.doors.filter((d) => d.a === rid || d.b === rid).map((d) => ({ color: d.color, to: d.a === rid ? d.b : d.a }));
  const guarded = (x) => x.sleepers.some((s) => PETS_AND_PARENTS.includes(s));

  // BFS over (room, has cake, which pet / parent rooms were entered). Returns the fewest moves, or null.
  const solve = (h) => {
    const guards = h.rooms.filter(guarded).map((x) => x.rid);
    const bit = (rid) => 1 << guards.indexOf(rid);
    const startMask = guards.includes(h.start) ? bit(h.start) : 0;
    const seen = new Set(), q = [[h.start, false, startMask, 0]];
    while (q.length) {
      const [rid, cake0, mask, d] = q.shift();
      const cake = cake0 || room(h, rid).kind === "kitchen";
      if (cake && room(h, rid).you) return d;
      const k = `${rid}|${cake}|${mask}`; if (seen.has(k)) continue; seen.add(k);
      for (const { to } of doorsOf(h, rid)) {
        const x = room(h, to);
        if (x.sleepers.includes("baby")) continue;
        if (guards.includes(to) && mask & bit(to)) continue;
        q.push([to, cake, guards.includes(to) ? mask | bit(to) : mask, d + 1]);
      }
    }
    return null;
  };

  /* --- Defuser --- */
  const RoomView = ({ x, cake }) => (<div className="ms-room">
    <img className="pixel-art" src={PX.room({ kind: x.kind, window: x.window })} alt={x.kind} />
    {x.sleepers.map((s, i) => (<span key={s} className={`ms-sleeper ${s}`} style={["dog", "cat"].includes(s) ? { left: `${18 + i * 14}%` } : { left: `${56 + i * 14}%` }}>
      <img className="pixel-art" src={PX.sleeper(s)} alt={s} /><i>z</i></span>))}
    {cake && <img className="pixel-art ms-cake" src={PX.food("cake")} alt="cake" />}
  </div>);

  const MidnightSnackModule = ({ onSuccess, onStrike }) => {
    const [code] = useState(() => 1000 + Math.floor(Math.random() * 9000));
    const [h] = useState(() => makeHouse(code));
    const [at, setAt] = useState(h.start);
    const [entries, setEntries] = useState({ [h.start]: 1 });
    const [hasCake, setHasCake] = useState(false);
    const [shake, setShake] = useState(false);
    const [msg, setMsg] = useState(null);
    const [won, setWon] = useState(false);
    TEST.house = h; TEST.at = at;
    const x = room(h, at);
    const [order] = useState(() => Object.fromEntries(h.rooms.map((r) => [r.rid, doorsOf(h, r.rid).map((d) => d.color).sort(() => Math.random() - 0.5)])));
    const strike = (t) => { onStrike(); setShake(true); setTimeout(() => setShake(false), 500); setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1800); };

    const walk = (color) => {
      if (won) return;
      const to = doorsOf(h, at).find((d) => d.color === color).to, y = room(h, to);
      if (y.sleepers.includes("baby")) return strike("WAAAH! The baby! Go back!"); // you run back to this room
      if (guarded(y) && entries[to] >= 1) { setAt(to); setEntries((e) => ({ ...e, [to]: e[to] + 1 })); return strike("Oh no! It wakes up!"); }
      setAt(to); setEntries((e) => ({ ...e, [to]: (e[to] || 0) + 1 }));
    };
    const toBed = () => {
      if (!hasCake || x.kind !== "bedroom" || won) return;
      if (x.you) { setWon(true); onSuccess(); } else strike("This is not your bed!");
    };

    return (<div className="module-content ms"><h3>🍰 MIDNIGHT SNACK</h3>
      <div className="ms-top"><div className="lr-plate">HOUSE NUMBER<b>{code}</b></div>{hasCake && <div className="ms-badge"><img className="pixel-art" src={PX.food("cake")} alt="cake" width={28} height={28} />CAKE</div>}</div>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className={shake ? "ww-window shake" : ""}><RoomView x={x} cake={x.kind === "kitchen" && !hasCake} /></div>
      <div className="ms-doors">{order[at].map((c) => (
        <button key={c} className="ms-door" style={{ background: DOOR_HEX[c] }} onClick={() => walk(c)} disabled={won}><span className="ms-knob" /><b>{c}</b></button>))}</div>
      {x.kind === "kitchen" && !hasCake && <button className="submit-btn ww-done" onClick={() => setHasCake(true)}>TAKE THE CAKE</button>}
      {hasCake && x.kind === "bedroom" && <button className="submit-btn ww-done" onClick={toBed} disabled={won}>GO TO BED</button>}
    </div>);
  };

  /* --- Expert --- */
  const Plan = ({ h }) => {
    const cell = (x, y) => h.rooms.find((r) => r.cell[0] === x && r.cell[1] === y);
    const door = (a, b) => a && b && h.doors.find((d) => (d.a === a.rid && d.b === b.rid) || (d.a === b.rid && d.b === a.rid));
    const items = [];
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) {
      const x = gx >> 1, y = gy >> 1;
      if (gx % 2 === 0 && gy % 2 === 0) { const r = cell(x, y); items.push(r ? <div key={gx + "," + gy} className="ms-box">
        <b>{r.rid} {r.kind}</b>{r.window && <span>window</span>}{r.sleepers.length > 0 && <span>{r.sleepers.join(", ")}</span>}{r.you && <em>YOU</em>}{r.kind === "kitchen" && <em>CAKE</em>}</div> : <div key={gx + "," + gy} />); }
      else if (gx % 2 === 1 && gy % 2 === 0) { const d = door(cell(x, y), cell(x + 1, y)); items.push(<div key={gx + "," + gy} className="ms-wall v">{d ? d.color : ""}</div>); }
      else if (gx % 2 === 0 && gy % 2 === 1) { const d = door(cell(x, y), cell(x, y + 1)); items.push(<div key={gx + "," + gy} className="ms-wall h">{d ? d.color : ""}</div>); }
      else items.push(<div key={gx + "," + gy} />);
    }
    return <div className="ms-plan">{items}</div>;
  };
  const MidnightSnackManual = () => {
    const [entry, setEntry] = useState("");
    const [h, setH] = useState(null);
    const start = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) setH(makeHouse(n)); };
    return (<div>
      <p><strong>Ask:</strong> "What is the house number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={start}>SHOW</button></div>
      {h && <Plan h={h} />}
      <p><strong>Where are you?</strong> At the start, the Defuser is not always in their bedroom. Ask: "Where are you? What is in the room? Is there a window? What color are the doors?"</p>
      <div className="lr-rules">
        <p>1. At night, everyone is sleeping. Do not walk <strong>into</strong> a room where the baby is sleeping.</p>
        <p>2. You can walk into a room with the dog or the cat <strong>one</strong> time. Two times, and it wakes up.</p>
        <p>3. You can walk into a room with father or mother, but not two times.</p>
        <p>4. Take the cake. Then go back to your bedroom and go to bed.</p>
      </div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .ms-top{display:flex;justify-content:space-between;align-items:center;background:#0a1520;border:1px solid #333;border-radius:6px;padding:6px 8px;margin-bottom:6px;}
    .ms-badge{display:flex;align-items:center;gap:4px;font-family:'Orbitron',sans-serif;font-size:0.7rem;color:#ffcc00;}
    .ms-room{position:relative;border:4px solid #2a1c10;border-radius:4px;overflow:hidden;}
    .ms-room>img{width:100%;display:block;}
    .ms-sleeper{position:absolute;bottom:22%;width:22%;} .ms-sleeper img{width:100%;display:block;}
    .ms-sleeper.dog,.ms-sleeper.cat{bottom:4%;width:20%;}
    .ms-sleeper i{position:absolute;top:-18%;right:0;width:22px;height:22px;border-radius:50%;background:#fff;color:transparent;box-shadow:8px -8px 0 -4px #fff,14px -16px 0 -7px #fff;animation:msZzz 2s ease-in-out infinite;}
    @keyframes msZzz{50%{transform:translateY(-4px);opacity:0.7;}}
    .ms-cake{position:absolute;left:66%;bottom:36%;width:16%;}
    .ms-doors{display:flex;justify-content:center;gap:10px;margin-top:8px;}
    .ms-door{width:84px;height:120px;border-radius:40px 40px 4px 4px;border:4px solid #2a1c10;cursor:pointer;position:relative;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;box-shadow:inset -6px 0 0 #0003;}
    .ms-door b{background:#fffc;color:#1b1424;border-radius:3px;padding:1px 6px;font-size:0.8rem;}
    .ms-knob{position:absolute;right:12px;top:58px;width:10px;height:10px;border-radius:50%;background:#f7d843;border:2px solid #1b1424;}
    .ms-plan{display:grid;grid-template-columns:1fr 34px 1fr 34px 1fr;grid-template-rows:auto 22px auto 22px auto;margin:6px 0;}
    .ms-box{background:#f4ecd8;color:#2a2018;border:2px solid #1b1424;border-radius:4px;padding:4px;min-height:64px;display:flex;flex-direction:column;font-size:0.8rem;}
    .ms-box b{font-size:0.85rem;} .ms-box em{font-style:normal;font-weight:900;color:#a02020;}
    .ms-wall{display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:bold;color:#ffcc00;}
    .ms-wall.v{writing-mode:vertical-rl;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "midnightSnack", name: "🍰 Midnight Snack", type: "midnightSnack", difficulty: "B1",
    Component: MidnightSnackModule, Manual: MidnightSnackManual,
    _test: Object.assign(TEST, { makeHouse, solve, doorsOf, room }),
  });
})();
