(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "meetingTime")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  // calendars: every day has 9-10 busy hours, 4-5 free, all hours in range
  T.PEOPLE.forEach(p => T.CAL[p].forEach((day, d) => { const busy = Object.keys(day).map(Number);
    if (busy.some(h => !T.HOURS.includes(h))) errs.push(`${p} ${d} hour out of range`);
    const free = T.HOURS.length - busy.length; if (free < 4 || free > 5) errs.push(`${p} ${T.DAYS[d]} free ${free}`); }));
  let decoy = 0, busyRows = 0; const ansDays = {};
  for (let i = 0; i < 5000; i++) { const r = T.makeRound(), b = T.bothFree(r);
    if (b.length !== 1 || b[0].day !== r.answer.day || b[0].h !== r.answer.h) errs.push("bothFree " + JSON.stringify(b));
    if (r.days.length !== 3 || r.days.some((x, k) => k && x.d <= r.days[k - 1].d)) errs.push("days");
    r.days.forEach(day => { const f = day.slots.filter(s => s.free).length;
      if (day.slots.length !== 6 || f !== 4) errs.push("slots");
      if (day.slots.some((s, j) => j && s.h <= day.slots[j - 1].h)) errs.push("order");
      day.slots.filter(s => !s.free).forEach(s => { busyRows++; if (T.isFree(r.person, day.d, s.h)) decoy++; }); });
    const names = r.days.flatMap(d => d.slots.filter(s => !s.free).map(s => s.what)); if (new Set(names).size !== names.length) errs.push("dup what");
    ansDays[T.DAYS[r.days[r.answer.day].d]] = (ansDays[T.DAYS[r.days[r.answer.day].d]] || 0) + 1; }
  HLOG(`5000 rounds: ${errs.length} errors ${[...new Set(errs)].slice(0, 5)}`);
  HLOG(`Defuser busy rows when the person is free: ${Math.round(100 * decoy / busyRows)}% | answer days ${JSON.stringify(ansDays)}`);
  await sleep(300);
  const D = document.getElementById("d");
  const btn = (k, h) => D.querySelectorAll(".mt-day")[k].querySelectorAll(".mt-slot")[T.round.days[k].slots.findIndex(s => s.h === h)];
  HLOG(`"${D.querySelector(".mt-who").textContent}" ${[...D.querySelectorAll(".mt-day")].map(d => d.textContent).join(" | ")}`);
  let r = T.round; const wrong = r.days.flatMap((d, k) => d.slots.filter(s => s.free && !(k === r.answer.day && s.h === r.answer.h)).map(s => [k, s.h]))[0];
  btn(...wrong).click(); await sleep(1100);
  HLOG(`wrong: strikes ${STRIKES}, new round ${T.round !== r}`);
  r = T.round; HLOG(`${r.person}: meet ${T.DAYS[r.days[r.answer.day].d]} ${T.hourText(r.answer.h)}`);
  btn(r.answer.day, r.answer.h).click(); await sleep(100);
  HLOG(`end: won=${WON}, strikes ${STRIKES}, buttons disabled ${[...D.querySelectorAll(".mt-free")].every(b => b.disabled)}`);
  HLOG(`manual: tabs ${document.querySelectorAll("#m .mt-tabs button").length}, busy boxes ${document.querySelectorAll("#m td.busy").length}, free ${document.querySelectorAll("#m td.free").length}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
