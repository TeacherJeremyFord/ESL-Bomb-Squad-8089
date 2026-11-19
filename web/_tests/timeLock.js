(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "timeLock")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  const ok = (t) => t.h >= 1 && t.h <= 12 && t.m >= 0 && t.m < 60 && t.m % 5 === 0;
  const H = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"], M = { ten: 10, quarter: 15, twenty: 20, half: 30 };
  // Read "twenty to eight" back into a time, independently of the module's own maths.
  const parse = (s) => { const [mw, dir, hw] = s.split(" "), h = H.indexOf(hw), m = M[mw]; return dir === "past" ? { h, m } : { h: h === 1 ? 12 : h - 1, m: 60 - m }; };
  for (let b = 1; b <= 4; b++) for (let i = 0; i < 3000; i++) {
    const r = T.makeRound(b), [c1, c2, c3] = r.clocks;
    if (![c1.start, c1.target, c2.start, c2.target, c3.start, c3.target].every(ok)) errs.push("bad time");
    if (T.same(c1.start, c1.target) || T.same(c2.start, c2.target) || T.same(c3.start, c3.target)) errs.push("already set");
    const mins = ((((c1.target.h % 12) * 60 + c1.target.m) - ((c1.start.h % 12) * 60 + c1.start.m)) % 720 + 720) % 720;
    const want = T.CASE[c1.caseColor] * 60 + T.DIGITS[c1.digitColor];
    if (mins !== (b % 2 ? want : 720 - want)) errs.push("clock 1 rule");
    if (/half to/.test(c2.say)) errs.push("half to");
    if (!T.same(parse(c2.say), c2.target)) errs.push("clock 2 words " + c2.say);
    if (c3.target.h !== c1.target.h || c3.target.m !== c2.target.m) errs.push("clock 3 rule");
  }
  // The manual's worked examples.
  if (!T.same(T.clock1Target({ h: 4, m: 50 }, "blue", "pink", 3), { h: 7, m: 5 })) errs.push("example 1");
  if (!T.same(T.clock2Target("blue", "blue", "red"), { h: 7, m: 40 })) errs.push("example 2");
  if (!T.same(T.clock1Target({ h: 12, m: 10 }, "red", "orange", 2), { h: 10, m: 40 })) errs.push("wrap back past 12");
  HLOG(`12000 rounds: ${errs.length} errors ${[...new Set(errs)].slice(0, 5)}`);

  await sleep(300);
  const D = document.getElementById("d"), btns = () => [...D.querySelectorAll(".tl-btn")];
  const setTo = async (t) => { const cur = T.time;
    const dh = ((t.h - cur.h) % 12 + 12) % 12, dm = ((t.m - cur.m) / 5 % 12 + 12) % 12;
    for (let i = 0; i < dh; i++) { btns()[1].click(); await sleep(5); }
    for (let i = 0; i < dm; i++) { btns()[3].click(); await sleep(5); } };
  const press = () => D.querySelector(".tl-set").click();
  const lamps = () => [...D.querySelectorAll(".tl-lamps span")].map(s => s.className || "-").join(" ");

  let r = T.round, c1 = r.clocks[0];
  HLOG(`clock 1: start ${c1.start.h}:${c1.start.m}, ${c1.caseColor} clock, ${c1.digitColor} numbers, ${r.batteries} battery -> ${c1.target.h}:${c1.target.m}`);
  HLOG(`shows "${D.querySelector(".tl-lcd").textContent.trim()}" / "${D.querySelector(".tl-was").textContent}"`);
  // Right clock 1, then a wrong clock 2: strike, and everything starts again.
  await setTo(c1.target); press(); await sleep(900);
  HLOG(`clock 1 set: stage ${T.stage}, lamps ${lamps()}, round svg ${!!D.querySelector(".tl-round")}`);
  btns()[1].click(); await sleep(20);
  if (!T.same(T.time, r.clocks[1].target)) { press(); await sleep(1200); }
  HLOG(`wrong clock 2: strikes ${STRIKES}, stage ${T.stage}, new round ${T.round !== r}, digital again ${!!D.querySelector(".tl-lcd")}`);

  r = T.round;
  for (let s = 0; s < 3; s++) { const c = r.clocks[s];
    await setTo(c.target); HLOG(`clock ${s + 1}: set ${T.time.h}:${String(T.time.m).padStart(2, "0")}${c.say ? ` (${c.say}, ${c.frame} frame, ${c.hands} hands, ${c.nums} numbers)` : ""}`);
    press(); await sleep(900); }
  HLOG(`end: won=${WON}, strikes ${STRIKES}, lamps ${lamps()}, buttons disabled ${btns().every(b => b.disabled)}`);
  const m = document.getElementById("m").textContent;
  HLOG(`manual: has 3 clocks ${/Clock 1/.test(m) && /Clock 2/.test(m) && /Clock 3/.test(m)}, has "before" ${/before/.test(m)}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
