(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "timeLockOne")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  for (let b = 1; b <= 4; b++) for (let i = 0; i < 2000; i++) { const r = T.makeRound(b, "one"), c = r.clocks[0];
    if (r.clocks.length !== 1) errs.push("clocks");
    if (!c.simple || c.digitColor !== "white") errs.push("not simple");
    const later = ((((c.target.h % 12) * 60 + c.target.m) - ((c.start.h % 12) * 60 + c.start.m)) % 720 + 720) % 720;
    if (later !== T.CASE[c.caseColor] * 60) errs.push("rule: hours later, batteries ignored"); }
  HLOG(`8000 rounds: ${errs.length} errors ${[...new Set(errs)]}`);
  await sleep(300);
  const D = document.getElementById("d"), btns = () => [...D.querySelectorAll(".tl-btn")], press = () => D.querySelector(".tl-set").click();
  const setTo = async (t) => { const c = T.time; for (let i = 0; i < ((t.h - c.h) % 12 + 12) % 12; i++) { btns()[1].click(); await sleep(5); }
    for (let i = 0; i < ((t.m - c.m) / 5 % 12 + 12) % 12; i++) { btns()[3].click(); await sleep(5); } };
  HLOG(`title "${D.querySelector("h3").textContent}", lamps ${D.querySelectorAll(".tl-lamps span").length}`);
  const c0 = T.round.clocks[0]; btns()[3].click(); /* the answer keeps the start minutes, so +5 min is always wrong */ await sleep(20); press(); await sleep(1200);
  HLOG(`wrong SET: strikes ${STRIKES}, stage ${T.stage}, clock changed ${T.round.clocks[0] !== c0}`);
  const c = T.round.clocks[0]; await setTo(c.target);
  HLOG(`${c.caseColor} clock, ${c.start.h}:${c.start.m} -> ${T.time.h}:${T.time.m}`); press(); await sleep(300);
  HLOG(`end: won=${WON}, strikes ${STRIKES}`);
  const m = document.getElementById("m").textContent;
  HLOG(`manual: one clock ${/one clock/.test(m)}, no batteries ${!/batter/i.test(m)}, no round clock ${!/round clock/.test(m)}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
