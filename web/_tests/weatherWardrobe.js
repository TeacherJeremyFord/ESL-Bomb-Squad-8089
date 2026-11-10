(async () => {
  const T = EXTRA_MODULES.find(m => m.id === "weatherWardrobe")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const errs = [];
  const BOTTOMS = ["jeans", "pants", "shorts", "skirt"];
  for (const s in T.TABLE) for (const w in T.TABLE[s]) { const o = T.TABLE[s][w], b = o.filter(x => BOTTOMS.includes(x)).length;
    if (b > 1 || (o.includes("dress") && b > 0) || (!o.includes("dress") && b === 0)) errs.push(`unwearable ${s}/${w}`); }
  for (let i = 0; i < 1000; i++) { const [a, b] = T.makeSkies(); if (T.key(T.answer(a)) === T.key(T.answer(b))) errs.push("same answer"); if (a.season !== b.season) errs.push("season changed"); }
  HLOG(`invariants: table + 1000 rounds, ${errs.length} errors ${[...new Set(errs)]}`);
  await sleep(300);
  const D = document.getElementById("d"), btn = (t) => [...D.querySelectorAll("button")].find(b => b.textContent.trim() === t || b.textContent.startsWith(t));
  const dress = async (sky) => {
    const a = T.answer(sky);
    for (const b of D.querySelectorAll(".ww-closet .lr-item")) { const item = b.querySelector("span").textContent, on = b.classList.contains("worn"); if (on !== a.outfit.includes(item)) b.click(); await sleep(20); }
    const wb = btn("WINDOW"); if (wb.classList.contains("on") !== a.window) wb.click(); await sleep(20);
    const fb = [...D.querySelectorAll(".ww-switch")][1]; if (fb.classList.contains("on") !== a.fan) fb.click(); await sleep(50);
  };
  let sky = T.skies[0]; HLOG(`sky 1: ${JSON.stringify(sky)} -> ${JSON.stringify(T.answer(sky))}`);
  btn("DONE").click(); await sleep(100); HLOG(`empty DONE: strikes ${STRIKES}`);
  await dress(sky); btn("DONE").click(); await sleep(100); HLOG(`dressed DONE: strikes ${STRIKES}, waiting=${!!btn("WAIT")}`);
  await sleep(8500);
  sky = T.skies[1]; HLOG(`sky 2: ${JSON.stringify(sky)} -> ${JSON.stringify(T.answer(sky))}`);
  await dress(sky); btn("DONE").click(); await sleep(200); HLOG(`second DONE: won=${WON}, strikes ${STRIKES}`);
  HLOG("DONE");
})();
