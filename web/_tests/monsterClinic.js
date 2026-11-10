(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "monsterClinic")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), errs = [];
  let traps = 0;
  for (let i = 0; i < 1000; i++) { const m = T.makeMonster(), e = m.heads.map(h => h.eyes);
    if (e.reduce((a, b) => a + b) > 9) errs.push("eyes>9"); if (m.temp === "hot" && e.length > 1 && e.filter(x => x === Math.max(...e)).length !== 1) errs.push("tie");
    if (e.length === 3 && m.heads.filter(h => !h.ears).length !== 1) errs.push("no-ear face"); if (!m.sick) traps++;
    const pic = PX.patient(m), ids = new Set(pic.parts.map(p => p.id));
    for (const s of T.solution(m, "AB123-C4D56")) for (const t of s.targets) if (!ids.has(t) && !t.endsWith("-hair")) errs.push("missing part " + t); }
  HLOG(`1000 monsters: ${errs.length} errors ${[...new Set(errs)].slice(0,4)}; ${traps} not-sick traps`);
  await sleep(300);
  const D = document.getElementById("d"), hit = (id) => D.querySelector(`[aria-label="${id}"]`), m = T.monster;
  HLOG(`monster: ${m.sick ? "sick" : "NOT sick"}, ${m.temp}, heads ${JSON.stringify(m.heads.map(h => [h.eyes, h.ears, h.hair]))}; steps: ${T.steps.map(s => s.say).join(" -> ")}`);
  // A wrong touch first: a strike, no progress lost.
  const wrongId = [...D.querySelectorAll(".mc-hit")].map(b => b.getAttribute("aria-label")).find(id => !T.steps[0].targets.includes(id));
  hit(wrongId).click(); await sleep(40); HLOG(`wrong touch (${wrongId}): strikes ${STRIKES}, step ${T.pos}`);
  for (const s of T.steps) {
    if (s.kind === "ok") { [...D.querySelectorAll("button")].find(b => b.textContent === "OK").click(); await sleep(40); continue; }
    if (s.kind === "tool") { [...D.querySelectorAll(".mc-tools .lr-item")][s.tool === "cold-pack" ? 0 : 1].click(); await sleep(20); hit(s.targets[0]).click(); await sleep(40); continue; }
    if (s.kind === "touch-all") { hit(s.targets[0]).click(); await sleep(20); hit(s.targets[0]).click(); await sleep(20); for (const t of s.targets.slice(1)) { hit(t).click(); await sleep(20); } continue; }
    hit(s.targets.find(t => hit(t))).click(); await sleep(40);
  }
  HLOG(`treated: won=${WON}, strikes ${STRIKES}`); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
