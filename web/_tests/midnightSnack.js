(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "midnightSnack")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const errs = []; let lens = [];
  for (let c = 1000; c < 1300; c++) { const h = T.makeHouse(c);
    for (const r of h.rooms) { const cs = T.doorsOf(h, r.rid).map(d => d.color); if (new Set(cs).size !== cs.length) errs.push("dup door color"); }
    if (h.rooms.filter(r => r.kind === "kitchen").length !== 1) errs.push("kitchens"); if (h.rooms.filter(r => r.you).length !== 1) errs.push("you");
    if (T.makeHouse(c).doors.map(d => d.color).join() !== h.doors.map(d => d.color).join()) errs.push("not deterministic");
    lens.push(h.shortest); }
  HLOG(`invariants: 300 houses, ${errs.length} errors ${[...new Set(errs)]}; shortest routes ${Math.min(...lens)}-${Math.max(...lens)}`);
  await sleep(300);
  const D = document.getElementById("d"), h = T.house;
  // Route with colors: BFS like solve(), keeping the path.
  const guards = h.rooms.filter(r => r.sleepers.some(s => ["dog","cat","father","mother"].includes(s))).map(r => r.rid);
  const bit = (rid) => 1 << guards.indexOf(rid), q = [[h.start, false, guards.includes(h.start) ? bit(h.start) : 0, []]], seen = new Set(); let route = null;
  while (q.length) { const [rid, c0, mask, path] = q.shift(); const cake = c0 || T.room(h, rid).kind === "kitchen";
    if (cake && T.room(h, rid).you) { route = path; break; } const k = rid + "|" + cake + "|" + mask; if (seen.has(k)) continue; seen.add(k);
    for (const { to, color } of T.doorsOf(h, rid)) { const x = T.room(h, to); if (x.sleepers.includes("baby")) continue; if (guards.includes(to) && mask & bit(to)) continue;
      q.push([to, cake, guards.includes(to) ? mask | bit(to) : mask, [...path, [color, to]]]); } }
  HLOG(`house ${h.code}: start room ${h.start} (${T.room(h, h.start).kind}), route ${route.map(([c, to]) => c + "->" + to).join(" ")}`);
  const door = (c) => [...D.querySelectorAll(".ms-door")].find(b => b.textContent === c);
  const btn = (t) => [...D.querySelectorAll("button")].find(b => b.textContent === t);
  // Try the baby's room if it is next door: strike, and you stay.
  const babyDoor = T.doorsOf(h, h.start).find(d => T.room(h, d.to).sleepers.includes("baby"));
  if (babyDoor) { door(babyDoor.color).click(); await sleep(50); HLOG(`walked into the baby: strikes ${STRIKES}, still in room ${T.at}`); }
  for (const [c, to] of route) { door(c).click(); await sleep(40); if (T.room(h, T.at).kind === "kitchen" && btn("TAKE THE CAKE")) { btn("TAKE THE CAKE").click(); await sleep(40); } }
  HLOG(`at room ${T.at}, you=${T.room(h, T.at).you}`); btn("GO TO BED").click(); await sleep(50);
  HLOG(`bed: won=${WON}, strikes ${STRIKES}`);
  // Expert side shows the same plan.
  const M = document.getElementById("m"), inp = M.querySelector("input"), set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  set.call(inp, String(h.code)); inp.dispatchEvent(new Event("input", { bubbles: true })); await sleep(50); [...M.querySelectorAll("button")].find(b => b.textContent === "SHOW").click(); await sleep(100);
  HLOG(`expert plan boxes: ${M.querySelectorAll(".ms-box").length} (house has ${h.rooms.length})`); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
