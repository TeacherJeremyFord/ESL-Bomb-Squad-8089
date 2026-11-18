// Time Lock screenshot: set clock 1 and stop on clock 2 (the first round clock).
setTimeout(async () => { const T = EXTRA_MODULES.find(m => m.id === "timeLock")._test, D = document.getElementById("d"), b = () => [...D.querySelectorAll(".tl-btn")];
  const t = T.round.clocks[0].target; let c = T.time; for (let i = 0; i < ((t.h - c.h) % 12 + 12) % 12; i++) { b()[1].click(); await new Promise(r => setTimeout(r, 5)); }
  for (let i = 0; i < ((t.m - c.m) / 5 % 12 + 12) % 12; i++) { b()[3].click(); await new Promise(r => setTimeout(r, 5)); }
  D.querySelector(".tl-set").click(); }, 300);
