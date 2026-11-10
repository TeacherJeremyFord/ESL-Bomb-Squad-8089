(async () => {
  const {makeGame, need, ticketText} = EXTRA_MODULES.find(m=>m.id==="lunchRush")._test;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  // Invariants over 1000 order numbers.
  let errs = [];
  for (let c = 1000; c < 2000; c++) { const g = makeGame(c);
    g.tickets.forEach((t, i) => { const nx = g.tickets[i+1]; if (nx && nx.openMs < t.dueMs + 8000 && nx.meal === t.meal) errs.push("meal clash");
      if (!need(t, g.light).length) errs.push("empty"); if (!t.lines.some(w=>["pork","beef","chicken","rice","egg"].includes(w))) errs.push("no cook"); });
    if (makeGame(c).tickets.map(ticketText).join() !== g.tickets.map(ticketText).join()) errs.push("not deterministic"); }
  HLOG(`invariants: 1000 games, ${errs.length} errors ${[...new Set(errs)]}`);
  const g0 = makeGame(1234); HLOG("sample (1234, light " + g0.light + "): " + g0.tickets.slice(0,3).map(t => t.meal + ": " + ticketText(t) + " -> needs " + need(t, g0.light).join("+")).join(" | "));
  // Play the first ticket through the real UI.
  await sleep(300);
  const D = document.getElementById("d");
  [...D.querySelectorAll("button")].find(b => b.textContent.startsWith("START")).click(); await sleep(100);
  const code = +D.querySelector(".lr-plate b").textContent, g = makeGame(code), t = g.tickets[0];
  const btn = (sel, text) => [...D.querySelectorAll(sel)].find(b => b.textContent.trim() === text);
  const wants = need(t, g.light); HLOG(`play: code ${code}, light ${g.light}, ${t.meal}: ${ticketText(t)} -> ${wants.join(", ")}`);
  const trayBtn = () => [...D.querySelectorAll(".lr-traytop")].find(b => b.textContent.includes(t.meal));
  const COOK = ["pork","beef","chicken","rice","egg"]; let burner = 0;
  for (const w of wants.filter(w => COOK.includes(w))) { btn(".lr-item", w).click(); await sleep(50); D.querySelectorAll(".lr-burner")[burner++].click(); await sleep(50); }
  for (const w of wants.filter(w => !COOK.includes(w))) { btn(".lr-item", w).click(); await sleep(50); trayBtn().click(); await sleep(50); }
  // Serving raw food first must be a strike.
  await sleep(4000);
  for (let i = 0; i < burner; i++) { D.querySelectorAll(".lr-burner")[i].click(); await sleep(50); trayBtn().click(); await sleep(50); }
  const serveBtn = trayBtn().parentElement.querySelector(".lr-serve"); serveBtn.click(); await sleep(300);
  HLOG(`after serve: ${D.querySelector(".lr-served b").textContent}, strikes ${STRIKES}`);
  // Wrong tray (no order) -> strike.
  const other = ["breakfast","lunch","dinner"].find(m => m !== t.meal && m !== g.tickets[1].meal);
  [...D.querySelectorAll(".lr-traytop")].find(b => b.textContent.includes(other)).parentElement.querySelector(".lr-serve").click(); await sleep(200);
  HLOG(`wrong tray: strikes ${STRIKES}`);
  // Expert side: enter the code, see the same ticket.
  const M = document.getElementById("m"); const inp = M.querySelector("input");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(inp, String(code)); inp.dispatchEvent(new Event("input", {bubbles:true}));
  await sleep(100); [...M.querySelectorAll("button")].find(b => b.textContent === "START").click(); await sleep(400);
  HLOG("expert sees: " + [...M.querySelectorAll(".lr-ticket")].map(e => e.querySelector(".lr-tmeal").textContent + ": " + e.querySelector(".lr-ttext").textContent).join(" | "));
  HLOG("DONE");
})();
