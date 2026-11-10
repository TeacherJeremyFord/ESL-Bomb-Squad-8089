(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "messyDesk")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const errs = [];
  // A solved desk exists for every page: apply the rules in order on a scrambled desk, then all must hold.
  const byBookFirst = (rules) => [...rules].sort((a, b) => (a.t === "under") - (b.t === "under"));
  const solve = (s, rules) => { for (const r of byBookFirst(rules)) { if (T.holds(r, s)) continue; T.remove(s, r.thing);
    if (r.t === "under") s.under = r.thing;
    else if (r.t === "place") { const [rel, of] = r.place.split(":"); if (rel === "in") s.inside[of].push(r.thing); else s.rows[r.place].push(r.thing); }
    else { const b = T.locate(s, r.to); s.rows[b.row].splice(b.i + 1, 0, r.thing); } } return s; };
  T.PAGES.forEach((pg, i) => { for (let k = 0; k < 200; k++) { const s = solve(T.makeDesk(i), pg); if (T.failing(s, i)) { errs.push("page " + i + " unsolvable"); break; } } });
  for (let i = 0; i < 1000; i++) { const p = i % 5, f = T.failing(T.makeDesk(p), p); if (f < 2 || f > 3) errs.push("mess " + f); }
  HLOG(`invariants: 5 pages solvable + 1000 desks, ${errs.length} errors ${[...new Set(errs)]}`);
  T.PAGES.forEach((pg, i) => HLOG(`page ${i}: ` + pg.map(T.text).join(" ")));
  await sleep(300);
  const D = document.getElementById("d"), page = T.page; HLOG(`serial page ${page}; failing ${T.failing(T.desk, page)}`);
  const click = async (el) => { el.click(); await sleep(60); };
  const check = () => [...D.querySelectorAll("button")].find(b => b.textContent === "CHECK");
  await click(check()); HLOG(`messy CHECK: strikes ${STRIKES}`);
  const thingEl = (id) => [...D.querySelectorAll("img")].find(i => i.alt === ({redpen:"the red pen",pinkpen:"the pink pen",key:"the key",book:"the book",eraser:"the eraser",marker:"the marker"})[id]);
  const ORDER = ["on:desk","under:desk","on:table","under:table","on:chair","under:chair"];
  const gap = (row, k) => D.querySelectorAll(".md-row")[ORDER.indexOf(row)].querySelectorAll(".md-gap")[k];
  for (const r of byBookFirst(T.PAGES[page])) {
    if (T.holds(r, T.desk)) continue;
    HLOG(`  fix: ${T.text(r)}`);
    await click(thingEl(r.thing).closest(".md-thing") ? thingEl(r.thing) : thingEl(r.thing));
    if (r.t === "under") await click(thingEl("book"));
    else if (r.t === "place") { const [rel, of] = r.place.split(":");
      if (rel === "in") await click([...D.querySelectorAll(".md-holder")].find(h => h.querySelector("img").alt === of));
      else await click(gap(r.place, T.desk.rows[r.place].length)); }
    else { const b = T.locate(T.desk, r.to); await click(gap(b.row, b.i + 1)); }
  }
  HLOG(`after tidy: failing ${T.failing(T.desk, page)} ` + T.PAGES[page].filter(r => !T.holds(r, T.desk)).map(T.text).join(" ") + " | rows " + JSON.stringify(T.desk.rows) + " in " + JSON.stringify(T.desk.inside) + " under " + T.desk.under);
  await click(check()); HLOG(`CHECK: won=${WON}, strikes ${STRIKES}`); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
