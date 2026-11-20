(async () => { try {
  const ID = "busyWeek", T = EXTRA_MODULES.find(m => m.id === ID)._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  // the planners: every hour 5 AM-12 AM covered, names unique in a day, every day can deal all six parts
  for (const p of Object.keys(T.PLAN)) T.PLAN[p].forEach((day, d) => {
    const where = p + " " + T.DAYS[d];
    if (T.PLAN[p].length !== 7) errs.push(p + " days");
    if (day[0].start !== 5 || day[day.length - 1].start !== 24) errs.push(where + " 5..24");
    day.forEach((e, i) => { if (e.end <= e.start) errs.push(where + " order " + e.name); });
    day.filter(T.isCard).forEach(e => { if (day.filter(x => x.name === e.name).length > 1) errs.push(where + " card name twice: " + e.name); });
    const c = T.candidates(p, d);
    for (const part of T.PARTS) if (!c[part].length) errs.push(where + " no " + part);
    if (!c.EVENING.some(e => c.NIGHT.some(n => n.start > e.start))) errs.push(where + " no evening<night");
  });
  for (let i = 0; i < 3000; i++) { const r = T.makeRound(), ev = r.events;
    if (ev.some((e, j) => j && e.start <= ev[j - 1].start)) errs.push("round not in time order");
    if (new Set(ev.map(e => e.name)).size !== 6) errs.push("round repeats");
    if (ev.some(e => T.FILLER.has(e.name))) errs.push("routine card"); }
  HLOG(`planners + 3000 rounds: ${errs.length} errors ${[...new Set(errs)].slice(0, 8)}`);
  // decoys: how many card events also appear at another time (other day or other person)
  const at = {}; for (const p of Object.keys(T.PLAN)) T.PLAN[p].forEach((day) => day.filter(T.isCard).forEach(e => (at[e.name] = at[e.name] || new Set()).add(e.start)));
  HLOG(`card events: ${Object.keys(at).length}, with more than one time: ${Object.values(at).filter(s => s.size > 1).length}`);
  await sleep(300);
  const D = document.getElementById("d");
  const cardEl = (w) => [...D.querySelectorAll(".bw-card")].find(c => c.textContent === w);
  const tap = async (w) => { const el = cardEl(w); for (const t of ["pointerdown", "pointerup"]) el.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 1 })); await sleep(20); };
  const fill = async (order) => { for (let i = 0; i < order.length; i++) { await tap(order[i]); D.querySelectorAll(".bw-slot")[i].click(); await sleep(20); } };
  const ptr = (el, type, x, y) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1 }));
  HLOG(`title "${D.querySelector("h3").textContent}", "${D.querySelector(".bw-whose").textContent}" ${D.querySelector(".bw-page").textContent}, rows: ${[...D.querySelectorAll(".bw-label")].map(l => l.textContent).join(" / ")}`);
  let g = T.game; await fill([...g.answer].reverse()); D.querySelector(".bw-check").click(); await sleep(1100);
  HLOG(`wrong CHECK: strikes ${STRIKES}, new round ${T.game !== g}, slots empty ${T.slots.every(s => !s)}`);
  g = T.game;
  // one real drag, then tap the rest
  const el = cardEl(g.answer[0]), r = el.getBoundingClientRect(), t = D.querySelectorAll(".bw-slot")[0].getBoundingClientRect();
  ptr(el, "pointerdown", r.x + 5, r.y + 5); ptr(el, "pointermove", r.x + 40, r.y + 40); await sleep(20);
  ptr(cardEl(g.answer[0]), "pointermove", t.x + 20, t.y + 15); await sleep(20); ptr(cardEl(g.answer[0]), "pointerup", t.x + 20, t.y + 15); await sleep(30);
  HLOG(`drag: slot 1 = ${T.slots[0]}`);
  for (let i = 1; i < 6; i++) { await tap(g.answer[i]); D.querySelectorAll(".bw-slot")[i].click(); await sleep(20); }
  HLOG(`${g.r.person} ${T.DAYS[g.r.day]}: ${g.r.events.map(e => e.name + "@" + e.start + "=" + e.part).join(", ")}`);
  D.querySelector(".bw-check").click(); await sleep(100);
  HLOG(`end: won=${WON}, strikes ${STRIKES}`);
  const M = document.getElementById("m");
  HLOG(`manual: tabs ${M.querySelectorAll(".bw-tabs button").length}, events shown ${M.querySelectorAll(".bw-ev").length}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
