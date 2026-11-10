(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "giftShop")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  if (T.combos("grandmother").length !== 6) errs.push("grandmother combos " + T.combos("grandmother").length);
  if (T.combos("teacher").length !== 5) errs.push("teacher combos");
  for (let c = 1000; c < 1600; c++) { const s = T.makeShop(c); if (s.wallet < 3 || s.wallet > 12) errs.push("wallet");
    for (let k = 0; k < 3; k++) { const b = T.pricesFor(s, k); if (!b) { errs.push("no prices"); continue; }
      const hits = T.combos(s.who).filter(x => T.cost(x, b.prices) === s.wallet); if (hits.length !== 1) errs.push("not unique");
      if (/\d/.test(T.dollars(b.prices.kite))) errs.push("digit"); } }
  HLOG(`combos + 600 shops x 3 reshuffles: ${errs.length} errors ${[...new Set(errs)]}`);
  await sleep(300);
  const D = document.getElementById("d"), s = T.shop; let b = T.board;
  HLOG(`shop ${s.code}: for ${s.who}, wallet ${s.wallet}; answer ${JSON.stringify(b.answer)}`);
  const add = async (it, n) => { for (let i = 0; i < n; i++) { [...D.querySelectorAll(".gs-item")].find(x => x.querySelector("span:not(.gs-thanks)").textContent === it).click(); await sleep(20); } };
  const pay = async () => { [...D.querySelectorAll("button")].find(x => x.textContent === "PAY").click(); await sleep(60); };
  const tagOf = (it) => [...D.querySelectorAll(".gs-item")].find(x => x.querySelector("span:not(.gs-thanks)").textContent === it).querySelector(".gs-tag").textContent;
  const before = tagOf("doll"); await add("doll", 1); await pay();
  HLOG(`wrong basket: strikes ${STRIKES}, doll price ${before} -> ${tagOf("doll")}, basket empty ${D.querySelector(".gs-basket i") !== null}`);
  b = T.board; for (const [it, n] of Object.entries(b.answer)) await add(it, n); await pay();
  HLOG(`right basket: won=${WON}, strikes ${STRIKES}`);
  const M = document.getElementById("m"), inp = M.querySelector("input"), set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  set.call(inp, String(s.code)); inp.dispatchEvent(new Event("input", { bubbles: true })); await sleep(30); [...M.querySelectorAll("button")].find(x => x.textContent === "SHOW").click(); await sleep(60);
  HLOG("expert: " + M.querySelector(".gs-wallet").textContent); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
