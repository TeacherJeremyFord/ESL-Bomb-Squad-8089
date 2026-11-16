(async () => { try {
  const ID = new URLSearchParams(location.search).get("m"), T = EXTRA_MODULES.find(m => m.id === ID)._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  for (let c = 1000; c <= 9999; c++) { const r = T.makeRound(c);
    if (r.seq.length !== T.LENGTH) errs.push("length");
    if (!r.seq.some(n => T.TEENS.includes(n))) errs.push("no teen");
    if (!r.seq.some(n => T.TYS.includes(n))) errs.push("no ty");
    if (new Set(r.seq).size !== r.seq.length) errs.push("repeat");
    if (r.keys.length !== 15 || new Set(r.keys).size !== 15) errs.push("keypad");
    if (r.twins !== (c % 2 === 1)) errs.push("tier");
    if (r.twins && !T.TEENS.some(n => r.seq.includes(n) && r.seq.includes(T.twinOf(n)))) errs.push("no twin pair"); }
  for (let i = 0; i < 2000; i++) { const a = T.newCode(false), b = T.newCode(true);
    if (a % 2 || !(b % 2) || a < 1000 || b > 9999) errs.push("newCode"); }
  const a = T.makeRound(4242), b = T.makeRound(4242); if (a.seq.join() !== b.seq.join() || a.keys.join() !== b.keys.join()) errs.push("not deterministic");
  HLOG(`9000 rounds: ${errs.length} errors ${[...new Set(errs)]}`);
  await sleep(300);
  const D = document.getElementById("d"), r = T.round, key = (n) => [...D.querySelectorAll(".tc-key")].find(x => x.textContent === String(n));
  const lcd = () => [...D.querySelectorAll(".tc-lcd span")].map(s => s.textContent).join(" ");
  HLOG(`${ID} lock ${r.code} (${r.twins ? "Twins" : "A2"}): code ${r.seq.join(", ")}; title ${D.querySelector("h3").textContent}`);
  if (r.twins !== (ID === "teenCodeTwins")) HLOG("TIER MISMATCH");
  key(r.seq[0]).click(); await sleep(30); key(r.seq[1]).click(); await sleep(30);
  HLOG(`two right: ${lcd()}`);
  const twin = (n) => n < 20 ? (n - 10) * 10 : n === 20 ? 13 : n / 10 + 10;
  key(twin(r.seq[2])).click(); await sleep(30);
  HLOG(`twin of ${r.seq[2]} pressed: strikes ${STRIKES}, lcd ${lcd()}`);
  for (const n of r.seq) { key(n).click(); await sleep(30); }
  HLOG(`full code: won=${WON}, strikes ${STRIKES}, lcd ${lcd()}`);
  const M = document.getElementById("m"), inp = M.querySelector("input"), set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  set.call(inp, String(r.code)); inp.dispatchEvent(new Event("input", { bubbles: true })); await sleep(30); [...M.querySelectorAll("button")].find(x => x.textContent === "SHOW").click(); await sleep(60);
  const words = [...M.querySelectorAll(".tc-code li")].map(l => l.textContent);
  HLOG(`expert: ${words.join(", ")}; matches ${words.join() === r.seq.map(n => T.WORD[n]).join()}; digits on expert list ${/\d/.test(words.join())}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
