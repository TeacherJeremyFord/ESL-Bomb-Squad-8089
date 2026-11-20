// Day Order screenshot: two cards placed, one held.
setTimeout(async () => { const T = EXTRA_MODULES.find(m => m.id === "dayOrder")._test, D = document.getElementById("d");
  const tap = async (w) => { const el = [...D.querySelectorAll(".do-card")].find(c => c.textContent === w); for (const t of ["pointerdown", "pointerup"]) el.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 1 })); await new Promise(r => setTimeout(r, 30)); };
  await tap("MORNING"); D.querySelectorAll(".do-slot")[0].click(); await new Promise(r => setTimeout(r, 30));
  await tap("NOON"); D.querySelectorAll(".do-slot")[1].click(); await new Promise(r => setTimeout(r, 30)); await tap("EVENING"); }, 300);
