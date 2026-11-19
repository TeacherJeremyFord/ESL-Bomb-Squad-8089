(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "timeLockTwo")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  for (let b = 1; b <= 4; b++) for (let i = 0; i < 2000; i++) { const r = T.makeRound(b, "two");
    if (r.clocks.length !== 2 || r.clocks[0].simple) errs.push("clocks");
    if (!T.same(r.clocks[0].target, T.clock1Target(r.clocks[0].start, r.clocks[0].caseColor, r.clocks[0].digitColor, b))) errs.push("clock 1 rule"); }
  HLOG(`8000 rounds: ${errs.length} errors ${[...new Set(errs)]}`);
  await sleep(300);
  const D = document.getElementById("d"), btns = () => [...D.querySelectorAll(".tl-btn")], press = () => D.querySelector(".tl-set").click();
  const setTo = async (t) => { const c = T.time; for (let i = 0; i < ((t.h - c.h) % 12 + 12) % 12; i++) { btns()[1].click(); await sleep(5); }
    for (let i = 0; i < ((t.m - c.m) / 5 % 12 + 12) % 12; i++) { btns()[3].click(); await sleep(5); } };
  HLOG(`title "${D.querySelector("h3").textContent}", lamps ${D.querySelectorAll(".tl-lamps span").length}`);
  await setTo(T.round.clocks[0].target); press(); await sleep(900);
  const c1 = T.round.clocks[0], c2 = T.round.clocks[1];
  HLOG(`clock 1 set: stage ${T.stage}`);
  btns()[1].click(); await sleep(20); if (!T.same(T.time, c2.target)) { press(); await sleep(1200); }
  HLOG(`wrong clock 2: strikes ${STRIKES}, stage ${T.stage} (stays 2nd), clock 1 kept ${T.round.clocks[0] === c1}, clock 2 changed ${T.round.clocks[1] !== c2}`);
  const n = T.round.clocks[1]; await setTo(n.target); HLOG(`clock 2: ${n.say} -> ${T.time.h}:${T.time.m}`); press(); await sleep(300);
  HLOG(`end: won=${WON}, strikes ${STRIKES}`);
  const m = document.getElementById("m").textContent;
  HLOG(`manual: two clocks ${/two clocks/.test(m)}, no clock 3 ${!/Clock 3/.test(m)}, "That clock changes" ${/That clock changes/.test(m)}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
