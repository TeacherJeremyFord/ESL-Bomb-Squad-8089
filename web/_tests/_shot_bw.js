// Busy Week screenshot: three cards placed, one held.
setTimeout(async () => { const ID = new URLSearchParams(location.search).get("m"), T = EXTRA_MODULES.find(m => m.id === ID)._test, D = document.getElementById("d"), g = T.game;
  const tap = async (w) => { const el = [...D.querySelectorAll(".bw-card")].find(c => c.textContent === w); for (const t of ["pointerdown", "pointerup"]) el.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 1 })); await new Promise(r => setTimeout(r, 30)); };
  for (const i of [0, 1, 3]) { await tap(g.answer[i]); D.querySelectorAll(".bw-slot")[i].click(); await new Promise(r => setTimeout(r, 30)); }
  await tap(g.answer[2]); }, 300);
