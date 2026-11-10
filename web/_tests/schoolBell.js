(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "schoolBell")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const errs = []; for (const d in T.BELLS) if (Object.keys(T.BELLS[d]).length < 3) errs.push("few bells " + d);
  HLOG(`invariants: ${errs.length} errors ${errs}`);
  await sleep(300);
  const D = document.getElementById("d"), btn = (t) => [...D.querySelectorAll("button")].find(b => b.textContent.trim().startsWith(t));
  const day = T.day, bells = T.BELLS[day]; HLOG(`day ${day}: ${JSON.stringify(bells)}`);
  btn("START").click(); const t0 = Date.now();
  // Ring a no-bell hour once (strike), skip nothing else; ring every bell mid-hour.
  let trapDone = false;
  for (let i = 0; i < T.HOURS.length; i++) {
    const h = T.HOURS[i]; const mid = t0 + i * T.SEC_PER_HOUR + T.SEC_PER_HOUR / 2; await sleep(Math.max(0, mid - Date.now()));
    if (bells[h]) [...D.querySelectorAll(".sb-btn")].find(b => b.querySelector("span:last-child").textContent === bells[h]).click();
    else if (!trapDone) { trapDone = true; [...D.querySelectorAll(".sb-btn")][0].click(); HLOG(`rang in a no-bell hour (${h}): strikes ${STRIKES}`); }
  }
  await sleep(T.SEC_PER_HOUR);
  HLOG(`end of day: won=${WON}, strikes ${STRIKES}`); HLOG("DONE"); } catch (e) { HLOG("TEST ERROR " + e.message + " " + e.stack.split("\n")[1]); }
})();
