(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "moodPlugs")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  const girlB = { who: "girl", count: 1, row: "back", feeling: "happy" }, cats2F = { who: "cat", count: 2, row: "front", feeling: "angry" }, cat1 = { who: "cat", count: 1, row: "front", feeling: "angry" }, ex = { who: "expert", feeling: "great" }, df = { who: "defuser", feeling: "great" };
  const t = (s, tile, want) => { if (T.matches(s, tile) !== want) errs.push(T.text(s) + " vs " + JSON.stringify(tile)); };
  t({ kind: "demo", row: "back", who: "girl", count: 1, feeling: "happy" }, girlB, true); t({ kind: "demo", row: "front", who: "girl", count: 1, feeling: "happy" }, girlB, false);
  t({ kind: "demo", row: "front", who: "cat", count: 2, feeling: "angry" }, cats2F, true); t({ kind: "pron", pron: "it", count: 1, feeling: "angry" }, cats2F, false);
  t({ kind: "pron", pron: "it", count: 1, feeling: "angry" }, cat1, true); t({ kind: "pron", pron: "they", count: 2, feeling: "angry" }, cats2F, true);
  t({ kind: "me", who: "expert", feeling: "great" }, ex, true); t({ kind: "me", who: "expert", feeling: "great" }, df, false);
  for (let c = 1000; c < 1500; c++) { const b = T.makeBoard(c);
    for (const k of T.SOCKETS) if (b.tiles.filter(x => T.matches(b.sentences[k], x)).length !== 1) errs.push("not unique");
    if (!Object.values(b.sentences).some(s => s.kind === "me" && s.who === "expert")) errs.push("no I"); }
  HLOG(`grammar + 500 boards: ${errs.length} errors ${[...new Set(errs)].slice(0, 4)}`);
  const b0 = T.makeBoard(4242); HLOG("sample sentences: " + T.SOCKETS.map(k => k + ": " + T.text(b0.sentences[k])).join(" "));
  await sleep(300);
  const D = document.getElementById("d"), b = T.board, tiles = [...D.querySelectorAll(".mp-tile")], sock = (k) => [...D.querySelectorAll(".mp-socket")].find(x => x.textContent === k);
  // DOM tiles are rendered back row, then front row, then portraits; map them.
  const order = [...b.tiles.filter(x => x.row === "back"), ...b.tiles.filter(x => x.row === "front"), ...b.tiles.filter(x => !x.row)];
  const el = (tid) => tiles[order.findIndex(x => x.tid === tid)];
  // The I/you flip: plug "I am ..." to DEFUSER -> strike.
  const iSock = T.SOCKETS.find(k => b.sentences[k].kind === "me" && b.sentences[k].who === "expert");
  for (const k of T.SOCKETS) { const target = k === iSock ? b.tiles.find(x => x.who === "defuser") : b.tiles.find(x => T.matches(b.sentences[k], x)); sock(k).click(); await sleep(20); el(target.tid).click(); await sleep(20); }
  [...D.querySelectorAll("button")].find(x => x.textContent === "CHECK").click(); await sleep(50); HLOG(`"I" plugged to DEFUSER: strikes ${STRIKES}`);
  sock(iSock).click(); await sleep(20); sock(iSock).click(); await sleep(20); el(b.tiles.find(x => x.who === "expert").tid).click(); await sleep(20);
  [...D.querySelectorAll("button")].find(x => x.textContent === "CHECK").click(); await sleep(50); HLOG(`fixed: won=${WON}, strikes ${STRIKES}`); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
