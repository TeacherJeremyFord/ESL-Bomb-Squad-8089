(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "meetUp")._test, BW = window.BUSY_WEEK, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  let otherTime = 0, n = 0; const parts = {};
  for (let i = 0; i < 5000; i++) { const r = T.makeRound(), day = BW.PLAN[r.person][r.day];
    const m = T.matches(r); if (m.length !== 1 || m[0] !== r.answer) errs.push("matches " + m);
    if (r.rows.length !== 6 || new Set(r.rows.map(x => x.name)).size !== 6) errs.push("rows");
    r.rows.forEach((x, j) => { const [a, b] = BW.HOURS[BW.PARTS[j]]; if (x.h < a || x.h > b) errs.push("band"); if (j && x.h <= r.rows[j - 1].h) errs.push("order");
      if (j !== r.answer) { n++; if (day.some(e => e.name === x.name)) otherTime++; } });
    parts[BW.PARTS[r.answer]] = (parts[BW.PARTS[r.answer]] || 0) + 1; }
  HLOG(`5000 rounds: ${errs.length} errors ${[...new Set(errs)].slice(0, 5)}`);
  HLOG(`decoys that the person does at another time: ${Math.round(100 * otherTime / n)}% | answers ${JSON.stringify(parts)}`);
  await sleep(300);
  const D = document.getElementById("d"), btn = (p) => [...D.querySelectorAll(".mu-btn")].find(b => b.textContent === p);
  HLOG(`"${D.querySelector(".bw-whose").textContent}" ${D.querySelector(".bw-page").textContent}: ${[...D.querySelectorAll(".mu-row")].map(r => r.textContent).join(" | ")}`);
  let r = T.round; btn(BW.PARTS[(r.answer + 1) % 6]).click(); await sleep(1100);
  HLOG(`wrong: strikes ${STRIKES}, new round ${T.round !== r}`);
  r = T.round; const a = r.rows[r.answer];
  HLOG(`${r.person} ${BW.DAYS[r.day]}: meet at ${BW.hourText(a.h)} ${a.name} -> ${BW.PARTS[r.answer]}`);
  btn(BW.PARTS[r.answer]).click(); await sleep(100);
  HLOG(`end: won=${WON}, strikes ${STRIKES}`);
  HLOG(`manual: tabs ${document.querySelectorAll("#m .bw-tabs button").length}, planner events ${document.querySelectorAll("#m .bw-ev").length}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
