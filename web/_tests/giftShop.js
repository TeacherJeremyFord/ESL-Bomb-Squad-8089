(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "giftShop")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  if (T.words(150) !== "one hundred fifty" || T.words(45) !== "forty-five" || T.words(200) !== "two hundred") errs.push("words");
  let maxSols = 0; const t0 = performance.now();
  for (let c = 1000; c < 1600; c++) { const s = T.makeShop(c); if (s.wallet < 100 || s.wallet > 500 || s.wallet % 10) errs.push("wallet");
    for (let k = 0; k < 3; k++) { const b = T.pricesFor(s, k); if (!b) { errs.push("no prices"); continue; }
      const sols = T.solutions(s.who, s.wallet, b.prices); maxSols = Math.max(maxSols, sols.length);
      if (sols.length < 1 || sols.length > 4) errs.push("solution count");
      if (sols.some(x => Object.values(x).reduce((a, n) => a + n, 0) < 2 || Object.values(x).reduce((a, n) => a + n, 0) > 6)) errs.push("gift size");
      if (!sols.every(x => T.good(x, s.who, s.wallet, b.prices))) errs.push("rule mismatch");
      if (Object.values(b.prices).some(p => /\d/.test(T.dollars(p)))) errs.push("digit"); } }
  HLOG(`600 shops x 3 reshuffles: ${errs.length} errors ${[...new Set(errs)]}; max good gifts ${maxSols}; ${Math.round(performance.now() - t0)} ms`);
  await sleep(300);
  const D = document.getElementById("d"), s = T.shop; let b = T.board;
  HLOG(`shop ${s.code}: for ${s.who}, wallet ${T.dollars(s.wallet)}; good gifts ${JSON.stringify(b.answers)}`);
  const btn = (it) => [...D.querySelectorAll(".gs-item")].find(x => x.querySelector("span:not(.gs-thanks)").textContent === it);
  const add = async (it, n) => { for (let i = 0; i < n; i++) { btn(it).click(); await sleep(20); } };
  const pay = async () => { [...D.querySelectorAll("button")].find(x => x.textContent === "PAY").click(); await sleep(60); };
  // Right total but one unwanted thing: swap one unit of a good gift for an unwanted item with the same price, if any; else add any unwanted item.
  const unwanted = Object.keys(b.prices).filter(it => !T.GUIDE[s.who].wants.includes(it));
  const g = b.answers[0], swapFrom = Object.keys(g).find(it => unwanted.some(u => b.prices[u] === b.prices[it]));
  if (swapFrom) { const u = unwanted.find(u => b.prices[u] === b.prices[swapFrom]); for (const [it, n] of Object.entries(g)) await add(it, it === swapFrom ? n - 1 : n); await add(u, 1); HLOG(`unwanted ${u} in place of ${swapFrom} (same total)`); }
  else { for (const [it, n] of Object.entries(g)) await add(it, n); await add(unwanted[0], 1); HLOG(`good gift + unwanted ${unwanted[0]}`); }
  const before = btn("doll").querySelector(".gs-tag").textContent; await pay();
  HLOG(`unwanted basket: strikes ${STRIKES}, doll price ${before} -> ${btn("doll").querySelector(".gs-tag").textContent}, basket empty ${D.querySelector(".gs-basket i") !== null}`);
  b = T.board; const last = b.answers[b.answers.length - 1]; for (const [it, n] of Object.entries(last)) await add(it, n); await pay();
  HLOG(`good gift #${b.answers.length} of ${b.answers.length}: won=${WON}, strikes ${STRIKES}`);
  const M = document.getElementById("m"), inp = M.querySelector("input"), set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  set.call(inp, String(s.code)); inp.dispatchEvent(new Event("input", { bubbles: true })); await sleep(30); [...M.querySelectorAll("button")].find(x => x.textContent === "SHOW").click(); await sleep(60);
  HLOG("expert: " + M.querySelector(".gs-wallet").textContent); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
