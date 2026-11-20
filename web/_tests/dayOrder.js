(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "dayOrder")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  for (let i = 0; i < 5000; i++) { const d = T.deal(); if (d.length !== 6 || new Set(d).size !== 6 || T.isRight(d)) errs.push("deal"); }
  HLOG(`5000 deals: ${errs.length} errors`);
  await sleep(300);
  const D = document.getElementById("d");
  const cardEl = (w) => [...D.querySelectorAll(".do-card")].find(c => c.textContent === w);
  const ptr = (el, type, x, y) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1 }));
  const tap = async (w) => { const r = cardEl(w).getBoundingClientRect(), x = r.x + 5, y = r.y + 5; ptr(cardEl(w), "pointerdown", x, y); ptr(cardEl(w), "pointerup", x, y); await sleep(20); };
  const tapSlot = async (i) => { D.querySelectorAll(".do-slot")[i].click(); await sleep(20); };
  const drag = async (w, target) => { const el = cardEl(w), r = el.getBoundingClientRect(), t = target.getBoundingClientRect();
    ptr(el, "pointerdown", r.x + 5, r.y + 5); await sleep(10); ptr(el, "pointermove", r.x + 30, r.y + 30); await sleep(20);
    ptr(cardEl(w), "pointermove", t.x + t.width / 2, t.y + t.height / 2); await sleep(20); ptr(cardEl(w), "pointerup", t.x + t.width / 2, t.y + t.height / 2); await sleep(30); };
  const check = async () => { D.querySelector(".do-check").click(); await sleep(50); };

  HLOG(`title "${D.querySelector("h3").textContent}", slots ${D.querySelectorAll(".do-slot").length}, tray ${T.tray.length}, CHECK disabled ${D.querySelector(".do-check").disabled}`);
  // wrong: reverse order, by tapping
  for (let i = 0; i < 6; i++) { await tap(T.DAY[5 - i]); await tapSlot(i); }
  HLOG(`placed by tap: ${T.slots.join(",")}`); await check(); await sleep(1100);
  HLOG(`wrong CHECK: strikes ${STRIKES}, slots empty ${T.slots.every(s => !s)}, tray ${T.tray.length}`);
  // drag: MORNING to slot 2, then NOON onto slot 2 (swap: MORNING goes back to the tray), then MORNING to slot 1
  const slot = (i) => D.querySelectorAll(".do-slot")[i];
  await drag("MORNING", slot(1)); HLOG(`drag to slot 2: ${T.slots[1]}`);
  await drag("NOON", slot(1)); HLOG(`drag onto full slot: slot2 ${T.slots[1]}, MORNING in tray ${T.tray.includes("MORNING")}`);
  await drag("MORNING", slot(0)); await drag("NOON", D.querySelector(".do-tray")); HLOG(`drag back to tray: NOON in tray ${T.tray.includes("NOON")}`);
  // tap-swap two placed cards
  await tap("NIGHT"); await tapSlot(1); await tap("NOON"); await tap("NIGHT"); HLOG(`tap swap: slot2 ${T.slots[1]}, NIGHT in tray ${T.tray.includes("NIGHT")}`);
  for (let i = 2; i < 6; i++) { await tap(T.DAY[i]); await tapSlot(i); }
  HLOG(`final: ${T.slots.join(",")}`); await check(); await sleep(100);
  HLOG(`end: won=${WON}, strikes ${STRIKES}`);
  const m = document.getElementById("m").textContent;
  HLOG(`manual: no answer ${!/afternoon|midnight/i.test(m)}`);
  HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack || "").split("\n")[1]); } })();
