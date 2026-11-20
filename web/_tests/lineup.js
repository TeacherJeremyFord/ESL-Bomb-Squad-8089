(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "lineup")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  if (new Set(T.AGENTS.map(a => a.p)).size !== T.AGENTS.length) errs.push("dup agent pattern");
  const pc = (x) => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };
  for (let i = 0; i < 3000; i++) { const r = T.makeRound();
    if (r.people.length !== 6 || T.fits(r, 31).length !== 1 || T.fits(r, 31)[0] !== r.answer) errs.push("unique");
    for (let m = 0; m < 32; m++) if (pc(m) <= 2 && T.fits(r, m).length < 2) errs.push("2 things enough");
    for (let t = 0; t < 5; t++) { const n = r.people.filter(x => (x.p >> t) & 1).length; if (n < 2 || n > 4) errs.push("balance"); } }
  HLOG(`${T.SHAPES.length} shapes; 3000 rounds: ${errs.length} errors ${[...new Set(errs)].slice(0, 5)}`);
  await sleep(300);
  const D = document.getElementById("d"), P = () => D.querySelectorAll(".lu-p"), A = () => D.querySelector(".lu-arrest");
  let r = T.round; HLOG(`${r.agent}: ${[0,1,2,3,4].map(i => T.value(T.AGENTS.find(a => a.name === r.agent).p, i)).join(" ")} -> #${r.answer + 1}`);
  P()[(r.answer + 1) % 6].click(); await sleep(50); A().click(); await sleep(1100);
  HLOG(`wrong: strikes ${STRIKES}, new round ${T.round !== r}`);
  r = T.round; P()[r.answer].click(); await sleep(50); HLOG(A().textContent); A().click(); await sleep(100);
  HLOG(`end: won=${WON}, strikes ${STRIKES}, rows in manual ${document.querySelectorAll("#m tbody tr").length}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
