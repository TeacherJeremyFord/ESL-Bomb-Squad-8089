(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "animalRace")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  for (let c = 1000; c < 1500; c++) { const e = T.makeEntries(c);
    for (const k in e) { const race = k.split("|")[0]; if (T.NATURAL[race].includes(e[k].animal) || T.NATURAL[race].includes(e[k].other)) errs.push("natural pair"); }
    for (const team of ["zoo", "farm"]) { const col = Object.keys(e).filter(k => k.endsWith(team)).flatMap(k => [e[k].animal, e[k].other]); if (new Set(col).size !== 12) errs.push("repeat in column"); }
    if (JSON.stringify(T.makeEntries(c)) !== JSON.stringify(e)) errs.push("not deterministic");
    for (const race of [{ race: "swim", team: "zoo", not: false }, { race: "fly", team: "farm", not: true }]) {
      const p = T.makeParade(e, race), t = T.target(e, race), hits = p.map((x, i) => x.animal === t.animal && x.team === t.team ? i : -1).filter(i => i >= 0);
      if (hits.length !== 2 || hits[0] > 7) errs.push("target passes " + hits);
      if (!p.slice(0, hits[0]).some(x => x.animal === t.animal && x.team !== t.team)) errs.push("no wrong-team decoy");
      if (race.not && !p.slice(0, hits[0]).some(x => x.animal === e[race.race + "|" + race.team].animal && x.team === race.team)) errs.push("no NOT decoy"); } }
  HLOG(`500 entry lists + parades: ${errs.length} errors ${[...new Set(errs)]}`);
  await sleep(300);
  const D = document.getElementById("d"), btn = (t) => [...D.querySelectorAll("button")].find(b => b.textContent.startsWith(t));
  btn("START").click(); await sleep(100);
  for (let r = 0; r < 3; r++) {
    const race = T.races[T.no], t = T.target(T.entries, race), p = T.parade, i = p.findIndex(x => x.animal === t.animal && x.team === t.team);
    HLOG(`race ${r + 1}: ${race.race}, ${race.team}${race.not ? ", NOT light" : ""} -> ${t.animal}; first pass at ${i}`);
    if (r === 0) { const w = p.findIndex(x => !(x.animal === t.animal && x.team === t.team)); await sleep(Math.max(0, T.t0 + w * T.GATE_MS + 900 - Date.now())); btn("GO").click(); await sleep(50); HLOG(`  GO on the wrong animal: strikes ${STRIKES}`); }
    await sleep(Math.max(0, T.t0 + i * T.GATE_MS + 900 - Date.now())); btn("GO").click(); await sleep(2100);
  }
  HLOG(`three races: won=${WON}, strikes ${STRIKES}`);
  const M = document.getElementById("m"), inp = M.querySelector("input"), set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  set.call(inp, String(T.code)); inp.dispatchEvent(new Event("input", { bubbles: true })); await sleep(30); [...M.querySelectorAll("button")].find(b => b.textContent === "SHOW").click(); await sleep(60);
  HLOG("expert row: " + M.querySelector(".rd-table tbody tr").textContent); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
