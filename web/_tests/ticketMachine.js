(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "ticketMachine")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const errs = [];
  // Rule tests: fewest stops; MRT tie-break; rain bans bike.
  const r1 = T.bestRoute("bank", "zoo", [], "sunny"); if (r1.join() !== "bank,park,zoo") errs.push("bank-zoo " + r1);
  if (T.openWays("park", "zoo", [], "rainy").join() !== "bus") errs.push("rain");
  for (let i = 0; i < 1000; i++) { const b = T.makeBoard(), r = T.bestRoute(b.from, b.to, b.closed, b.weather);
    if (!r || r.length < 3 || r.length > 4) errs.push("len"); if (b.closed.length !== 2) errs.push("closed"); }
  HLOG(`invariants: rules + 1000 boards, ${errs.length} errors ${[...new Set(errs)]}`);
  await sleep(300);
  const D = document.getElementById("d"), b = T.board, route = T.bestRoute(b.from, b.to, b.closed, b.weather);
  HLOG(`board: ${b.from} -> ${b.to}, closed ${b.closed}, ${b.weather}; route ${route.join(" -> ")}`);
  const press = (label) => [...D.querySelectorAll(".lr-item")].filter(x => x.querySelector("span").textContent === label);
  // A wrong stop first: strike.
  const wrong = ["home","school","bank","library","zoo","farm","bookstore","park","lake","sea"].find(p => p !== route[1] && p !== b.from);
  press(T.openWays(route[0], route[1], b.closed, b.weather)[0])[0].click(); await sleep(30); press(wrong)[1] ? press(wrong)[1].click() : press(wrong)[0].click(); await sleep(50);
  HLOG(`wrong stop: strikes ${STRIKES}`);
  for (let i = 1; i < route.length; i++) { const w = T.openWays(route[i-1], route[i], b.closed, b.weather)[0];
    press(w)[0].click(); await sleep(30); const s = press(route[i]); (s[1] || s[0]).click(); await sleep(50); }
  HLOG(`ticket: won=${WON}, strikes ${STRIKES}`); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message); } })();
