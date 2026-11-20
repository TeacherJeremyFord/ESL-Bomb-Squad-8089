(async () => { try {
  const ID = "greetingDoor", N = 1, T = EXTRA_MODULES.find(m => m.id === ID)._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  // every dealt time follows the rule, is in fives, and is 30+ minutes from a line; no two doors in a row want the same greeting
  const lines = [300, 720, 1020, 1260], away = (t) => lines.every(l => Math.min(Math.abs(t - l), 1440 - Math.abs(t - l)) >= 30);
  for (let i = 0; i < 4000; i++) { const d = T.makeDoors(N);
    if (d.length !== N) errs.push("count");
    d.forEach((x, j) => { if (T.greetingAt(x.time) !== x.greeting) errs.push("rule " + T.fmt(x.time)); if (x.time % 5) errs.push("fives");
      if (!away(x.time)) errs.push("near a line " + T.fmt(x.time)); if (j && d[j - 1].greeting === x.greeting) errs.push("same twice"); }); }
  const seen = {}; for (let i = 0; i < 4000; i++) T.makeDoors(1).forEach(x => seen[x.greeting] = (seen[x.greeting] || 0) + 1);
  HLOG(`4000 deals: ${errs.length} errors ${[...new Set(errs)].slice(0, 5)} | spread ${JSON.stringify(seen)}`);
  HLOG(`rule spot checks: ${[[300,"GOOD MORNING"],[719,"GOOD MORNING"],[720,"GOOD AFTERNOON"],[1019,"GOOD AFTERNOON"],[1020,"GOOD EVENING"],[1259,"GOOD EVENING"],[1260,"GOOD NIGHT"],[0,"GOOD NIGHT"],[299,"GOOD NIGHT"]].every(([t,g]) => T.greetingAt(t) === g)}`);
  await sleep(300);
  const D = document.getElementById("d"), btn = (g) => [...D.querySelectorAll(".gd-btn")].find(b => b.textContent === g);
  HLOG(`title "${D.querySelector("h3").textContent}", lamps ${D.querySelectorAll(".gd-lamps span").length}, clock "${D.querySelector(".gd-clock").textContent}"`);
  const d0 = T.doors[0]; btn(T.GREETINGS.find(g => g !== d0.greeting)).click(); await sleep(1100);
  HLOG(`wrong: strikes ${STRIKES}, stage ${T.stage}, new time ${T.doors[0] !== d0}`);
  for (let i = 0; i < N; i++) { const d = T.doors[T.stage]; HLOG(`door ${i + 1}: ${d.kind} ${T.fmt(d.time)} -> ${d.greeting}`); btn(d.greeting).click(); await sleep(1100); }
  HLOG(`end: won=${WON}, strikes ${STRIKES}, phase ${T.phase}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
