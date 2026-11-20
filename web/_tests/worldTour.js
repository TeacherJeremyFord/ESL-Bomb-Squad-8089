(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "worldTour")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  for (const v of ["names", "blank"]) { const L = T.LISTS[v], lists = Object.values(L);
    if (lists.length !== 8) errs.push(v + " count");
    for (const l of lists) { if (l.length !== T.STOPS || new Set(l).size !== l.length) errs.push(v + " repeat");
      if (!l.some(id => T.BY_ID[id].kind === "land") || !l.some(id => T.BY_ID[id].kind === "sea")) errs.push(v + " mix"); }
    if (new Set(lists.map(l => l[0])).size !== 8) errs.push(v + " firsts");
    if (new Set(lists.flat()).size !== 14) errs.push(v + " coverage");
    if (JSON.stringify(T.makeLists(v)) !== JSON.stringify(L)) errs.push(v + " not stable"); }
  if (JSON.stringify(T.LISTS.names) === JSON.stringify(T.LISTS.blank)) errs.push("versions same");
  HLOG(`lists: ${errs.length} errors ${errs}`);
  // Every place's label point must hit its own shape (geometry sanity): use the real DOM.
  await sleep(400);
  const D = document.getElementById("d"), svg = D.querySelector(".wt-map");
  const hit = (lon, lat) => { const m = svg.getScreenCTM(), p = new DOMPoint(T.X(lon), T.Y(lat)).matrixTransform(m);
    const els = document.elementsFromPoint(p.x, p.y); const g = els[0] && els[0].closest("[data-place]"); return g && g.dataset.place; };
  const probes = { NA: [[-100, 45], [-75, 45], [-45, 72]], SA: [[-60, -10], [-68, -40]], EU: [[10, 50], [30, 58], [-2, 52.5]], AF: [[20, 0], [25, -25]],
    AS: [[100, 40], [78, 20], [45, 25], [138, 36]], AU: [[134, -25], [172, -42]], AN: [[0, -78]],
    NP: [[-150, 30], [160, 30], [-120, 10]], SP: [[-120, -30], [170, -20]], NAt: [[-40, 30], [-90, 25], [-30, 60]], SAt: [[-15, -25], [-45, -45]],
    IN: [[75, -20], [65, 15], [100, -35]], AR: [[10, 80], [-150, 75]], SO: [[-100, -62], [100, -60]] };
  const bad = []; for (const [id, pts] of Object.entries(probes)) for (const [lon, lat] of pts) { const h = hit(lon, lat); if (h !== id) bad.push(`${lon},${lat}=${h}!=${id}`); }
  HLOG(`map probes: ${bad.length ? bad.join(" ") : "all OK"}`);
  // --- zoom ---
  const vb = () => svg.getAttribute("viewBox").split(" ").map(Number);
  const pe = (el, type, id, x, y) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, clientX: x, clientY: y, isPrimary: id === 1 }));
  const R = svg.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2;
  pe(svg, "pointerdown", 1, cx - 20, cy); pe(svg, "pointerdown", 2, cx + 20, cy); await sleep(20);
  for (let i = 1; i <= 5; i++) { pe(svg, "pointermove", 1, cx - 20 - i * 10, cy); pe(svg, "pointermove", 2, cx + 20 + i * 10, cy); await sleep(20); }
  pe(svg, "pointerup", 1, cx - 70, cy); pe(svg, "pointerup", 2, cx + 70, cy); await sleep(30);
  HLOG(`spread: zoom x${(360 / vb()[2]).toFixed(2)} (want 3.5), zoomed class ${svg.classList.contains("wt-zoomed")}`);
  const before = vb()[0]; const g0 = document.elementsFromPoint(cx, cy)[0];
  pe(g0, "pointerdown", 1, cx, cy); await sleep(10); pe(g0, "pointermove", 1, cx - 60, cy); await sleep(20); pe(g0, "pointerup", 1, cx - 60, cy);
  g0.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: cx - 60, clientY: cy })); await sleep(30);
  HLOG(`drag: map moved ${vb()[0] > before}, counted as a tap ${T.route.length > 0 || STRIKES > 0}`);
  // a real tap on the zoomed map, in the middle: it must pick the place that is there
  const mid = document.elementFromPoint(cx, cy), pid = mid.closest("[data-place]").dataset.place, st0 = STRIKES;
  pe(mid, "pointerdown", 1, cx, cy); pe(mid, "pointerup", 1, cx, cy); mid.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: cx, clientY: cy })); await sleep(30);
  HLOG(`tap on zoomed map at ${pid}: ${pid === T.list[0] ? "pin " + T.route.length : "strike " + (STRIKES - st0)}`); await sleep(1000);
  const zb = [...D.querySelectorAll(".wt-zoom button")]; zb[2].click(); await sleep(30);
  HLOG(`reset: viewBox ${vb().join(" ")}; + then -: `); zb[0].click(); await sleep(30); const z1 = vb()[2]; zb[1].click(); await sleep(30); HLOG(`  ${z1.toFixed(0)} -> ${vb()[2]}`);
  T.route.length && (await (async () => { /* undo the zoom-tap pick so the play test starts clean */ })());
  const tap = async (id) => { D.querySelector(`g[data-place="${id}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); await sleep(30); };
  const list = T.list; HLOG(`plane ${T.plane}: ${list.join(",")}`);
  if (!T.route.length) await tap(list[0]); await tap(list[1]); HLOG(`two right: route ${T.route.length}, pins ${D.querySelectorAll(".wt-pin").length}`);
  const wrong = T.PLACES.map(p => p.id).find(id => id !== list[2]); await tap(wrong); await sleep(1000);
  HLOG(`wrong: strikes ${STRIKES}, route ${T.route.length}`);
  const lab = D.querySelector(`text[data-place="${list[0]}"]`); lab.dispatchEvent(new MouseEvent("click", { bubbles: true })); await sleep(30);
  HLOG(`tap on label: route ${T.route.length}`);
  for (const id of list.slice(1)) await tap(id);
  HLOG(`end: won=${WON}, strikes ${STRIKES}, labels on map ${D.querySelectorAll(".wt-name").length}`);
  const m = document.getElementById("m").textContent;
  HLOG(`manual: all colors ${Object.keys(T.PLANES).every(c => m.includes(c))}, this list ${list.every(id => m.includes(T.BY_ID[id].name.replace(" Ocean", "")))}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
