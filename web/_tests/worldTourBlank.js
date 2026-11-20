(async () => { try { const sleep = (ms) => new Promise(r => setTimeout(r, ms)); await sleep(400);
  const T = EXTRA_MODULES.find(m => m.id === "worldTourBlank")._test, D = document.getElementById("d"), M = document.getElementById("m");
  HLOG(`title "${D.querySelector("h3").textContent}", names on defuser map ${D.querySelectorAll(".wt-name").length}, names on manual map ${M.querySelectorAll(".wt-name").length}`);
  for (const id of T.list) { D.querySelector(`g[data-place="${id}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); await sleep(30); }
  HLOG(`end: won=${WON}, strikes ${STRIKES}`); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message); } })();
