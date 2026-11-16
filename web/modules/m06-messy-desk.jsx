/* ===== M06 MESSY DESK (A2 tier: 6 things, 4 rules, in / on / under / next to, color twins) =====
 * Design: docs/design/modules/M06_messy_desk.md · Build spec: docs/design/modules/build/M06_build.md
 * The serial's last digit picks the Expert's page. The Defuser moves things (tap a thing, then tap where it goes)
 * until every rule on that page is true, then presses CHECK.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const THINGS = {
    redpen: { kind: "pen", color: "red" }, pinkpen: { kind: "pen", color: "pink" }, key: { kind: "key", color: "yellow" },
    book: { kind: "book", color: "blue" }, eraser: { kind: "eraser", color: "white" }, marker: { kind: "marker", color: "purple" },
  };
  const HOLDERS = ["computer", "cup", "box", "bookbag", "bag"];
  const ROWS = ["on:desk", "on:table", "on:chair", "under:desk", "under:table", "under:chair"];
  const INSIDE = ["box", "bag", "bookbag", "cup"]; // the computer holds nothing
  const START_ROWS = { "on:desk": ["computer", "cup"], "on:table": ["box"], "on:chair": [], "under:desk": ["bookbag"], "under:table": [], "under:chair": ["bag"] };

  // A thing is named by color + kind when two things share a kind, otherwise by kind alone.
  const name = (id) => { if (!THINGS[id]) return `the ${id}`; const t = THINGS[id], twin = Object.values(THINGS).filter((x) => x.kind === t.kind).length > 1; return `the ${twin ? t.color + " " : ""}${t.kind}`; };
  const where = (place) => { const [rel, of] = place.split(":"); return `${rel} the ${of}`; };
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  // The five pages. Every page's rules can all be true at once (the tests build a solved desk for each).
  const R = {
    place: (thing, place) => ({ t: "place", thing, place }), under: (thing) => ({ t: "under", thing }),
    next: (thing, to) => ({ t: "next", thing, to }), placeNext: (thing, place, to) => ({ t: "placeNext", thing, place, to }),
  };
  const PAGES = [
    [R.place("redpen", "in:cup"), R.under("key"), R.place("book", "on:table"), R.place("pinkpen", "under:chair")],
    [R.place("pinkpen", "in:box"), R.placeNext("book", "on:desk", "computer"), R.next("eraser", "bag"), R.place("redpen", "in:bookbag")],
    [R.place("key", "in:bag"), R.place("marker", "on:chair"), R.next("redpen", "cup"), R.place("book", "under:desk")],
    [R.place("eraser", "in:cup"), R.under("pinkpen"), R.place("book", "on:chair"), R.next("key", "box")],
    [R.place("marker", "in:box"), R.place("key", "under:table"), R.placeNext("pinkpen", "on:desk", "computer"), R.place("redpen", "on:table")],
  ];
  const text = (r) => {
    const n = cap(name(r.thing));
    if (r.t === "place") return `${n} is ${where(r.place)}.`;
    if (r.t === "under") return `${n} is under the book.`;
    if (r.t === "next") return `${n} is next to ${name(r.to)}.`;
    return `${n} is ${where(r.place)}, next to ${name(r.to)}.`;
  };

  /* --- the desk --- */
  const clone = (s) => ({ rows: Object.fromEntries(ROWS.map((r) => [r, s.rows[r].slice()])), inside: Object.fromEntries(INSIDE.map((h) => [h, s.inside[h].slice()])), under: s.under });
  const locate = (s, id) => {
    if (s.under === id) return { place: "under:book" };
    for (const r of ROWS) { const i = s.rows[r].indexOf(id); if (i >= 0) return { place: r, row: r, i }; }
    for (const h of INSIDE) if (s.inside[h].includes(id)) return { place: "in:" + h };
    return null;
  };
  const remove = (s, id) => {
    if (s.under === id) { s.under = null; return; }
    for (const r of ROWS) { const i = s.rows[r].indexOf(id); if (i >= 0) {
      // Lifting the book leaves what was under it in the book's place.
      if (id === "book" && s.under) { s.rows[r][i] = s.under; s.under = null; } else s.rows[r].splice(i, 1); return; } }
    for (const h of INSIDE) { const i = s.inside[h].indexOf(id); if (i >= 0) { if (id === "book" && s.under) { s.inside[h][i] = s.under; s.under = null; } else s.inside[h].splice(i, 1); return; } }
  };
  const holds = (r, s) => {
    const a = locate(s, r.thing);
    const near = () => { const b = locate(s, r.to); return a && b && a.row && a.row === b.row && Math.abs(a.i - b.i) === 1; };
    if (r.t === "place") return !!a && a.place === r.place;
    if (r.t === "under") return s.under === r.thing;
    if (r.t === "next") return near();
    return !!a && a.place === r.place && near();
  };
  const failing = (s, page) => PAGES[page].filter((r) => !holds(r, s)).length;

  const makeDesk = (page) => {
    for (;;) {
      const s = { rows: Object.fromEntries(ROWS.map((r) => [r, START_ROWS[r].slice()])), inside: Object.fromEntries(INSIDE.map((h) => [h, []])), under: null };
      for (const id of Object.keys(THINGS)) {
        const roll = Math.random();
        if (roll < 0.15 && id !== "book" && !s.under) s.under = id;
        else if (roll < 0.4) s.inside[pick(INSIDE)].push(id);
        else { const r = s.rows[pick(ROWS)]; r.splice(Math.floor(Math.random() * (r.length + 1)), 0, id); }
      }
      const f = failing(s, page);
      if (f >= 2 && f <= 3) return s;
    }
  };

  const Thing = ({ id, size = 34 }) => <img className="pixel-art" src={PX.thing(THINGS[id].kind, THINGS[id].color)} alt={name(id)} width={size} height={size} />;

  /* --- Defuser --- */
  const MessyDeskModule = ({ serialNumber, onSuccess, onStrike }) => {
    const page = (parseInt(String(serialNumber).replace(/\D/g, "").slice(-1), 10) || 0) % 5;
    const [desk, setDesk] = useState(() => makeDesk(page));
    const [held, setHeld] = useState(null);
    const [solved, setSolved] = useState(false);
    const [msg, setMsg] = useState(null);
    TEST.page = page; TEST.desk = desk;
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1600); };
    const update = (fn) => { const s = clone(desk); fn(s); setDesk(s); };

    const take = (id) => { if (solved) return; if (held) { if (id === "book") return putUnderBook(); return flash("Put it down first."); } update((s) => remove(s, id)); setHeld(id); };
    const putRow = (row, i) => { if (!held) return; update((s) => s.rows[row].splice(i, 0, held)); setHeld(null); };
    const putIn = (h) => { if (!held) return; if (h === "computer") return flash("Not in the computer!"); update((s) => s.inside[h].push(held)); setHeld(null); };
    const putUnderBook = () => { if (!held || held === "book") return; if (desk.under) return flash("Something is under the book."); if (!locate(desk, "book")) return; update((s) => (s.under = held)); setHeld(null); };
    const check = () => { if (solved) return; if (held) return flash("Put it down first."); if (failing(desk, page) === 0) { setSolved(true); onSuccess(); } else { onStrike(); flash("Not tidy!"); } };

    const Item = ({ id }) => {
      if (HOLDERS.includes(id)) return (<div className="md-holder" onClick={(e) => { e.stopPropagation(); putIn(id); }}>
        <img className="pixel-art" src={PX.holder(id)} alt={id} width={38} height={38} /><span>{id}</span>
        {id !== "computer" && <div className="md-inside">{desk.inside[id].map((t) => <span key={t} onClick={(e) => { e.stopPropagation(); take(t); }}><Thing id={t} size={22} /></span>)}</div>}
      </div>);
      return (<div className={`md-thing ${id === "book" && held && held !== "book" ? "md-target" : ""}`} onClick={(e) => { e.stopPropagation(); take(id); }}>
        <Thing id={id} /><span>{THINGS[id].color} {THINGS[id].kind}</span>
        {id === "book" && desk.under && <div className="md-under" onClick={(e) => { e.stopPropagation(); take(desk.under); }}>under: <Thing id={desk.under} size={20} /></div>}
      </div>);
    };
    const Row = ({ row }) => (<div className={`md-row ${held ? "holding" : ""}`} onClick={() => putRow(row, desk.rows[row].length)}>
      {desk.rows[row].map((id, i) => <React.Fragment key={id}>{held && <button className="md-gap" onClick={(e) => { e.stopPropagation(); putRow(row, i); }}>+</button>}<Item id={id} /></React.Fragment>)}
      {held && <button className="md-gap" onClick={(e) => { e.stopPropagation(); putRow(row, desk.rows[row].length); }}>+</button>}
    </div>);

    return (<div className="module-content md"><h3>🗂 MESSY DESK</h3>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className="lr-hand"><span>IN YOUR HAND:</span>{held ? <><Thing id={held} size={28} /><b>{THINGS[held].color} {THINGS[held].kind}</b></> : <i>nothing — press a thing</i>}</div>
      <div className="md-room">{["desk", "table", "chair"].map((f) => (
        <div key={f} className="md-col">
          <div className="md-label">ON THE {f.toUpperCase()}</div><Row row={"on:" + f} />
          <div className={`md-furn ${f}`}>{f}</div>
          <div className="md-label">UNDER THE {f.toUpperCase()}</div><Row row={"under:" + f} />
        </div>))}</div>
      <button className="submit-btn ww-done" onClick={check} disabled={solved}>{solved ? "✓ TIDY" : "CHECK"}</button>
    </div>);
  };

  /* --- Expert --- */
  const MessyDeskManual = () => {
    const [p, setP] = useState(0);
    const print = React.useContext(MANUAL.Print);
    return (<div>
      <p><strong>Ask:</strong> "What is the last number of the serial?" Then find the page.</p>
      <div className="lr-rules">
        <p>Next to = right by it, on the left or the right, in the same place.</p>
        <p>If a thing is not in the rules, it can be in any place. Do not move it.</p>
        <p>When every rule is true, press CHECK.</p>
      </div>
      {print ? PAGES.map((pg, j) => <div key={j} className="fp-page mk-entry"><h4>PAGE {j} (serial ends in {j} or {j + 5})</h4>{pg.map((r, i) => <p key={i}>{i + 1}. {text(r)}</p>)}</div>) : <>
      <div className="fp-tabs">{PAGES.map((_, i) => <button key={i} onClick={() => setP(i)} className={`fp-tab ${p === i ? "active" : ""}`}>Page {i} ({i} or {i + 5})</button>)}</div>
      <div className="fp-page"><h4>PAGE {p} (serial ends in {p} or {p + 5})</h4>{PAGES[p].map((r, i) => <p key={i}>{i + 1}. {text(r)}</p>)}</div></>}
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .md-room{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:6px;}
    .md-col{display:flex;flex-direction:column;gap:2px;}
    .md-label{font-family:'Orbitron',sans-serif;font-size:0.5rem;color:#888;text-align:center;}
    .md-row{min-height:64px;background:#f0e6cf;border:2px dashed #c9b58a;border-radius:4px;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:center;gap:1px;padding:2px;cursor:pointer;}
    .md-row.holding{border-color:#ffcc00;background:#fff6d8;}
    .md-furn{height:26px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.7rem;color:#3a2a10;background:linear-gradient(#d8b27a,#b08550);border:2px solid #6a4a22;}
    .md-furn.chair{width:70%;margin:0 auto;}
    .md-thing,.md-holder{display:flex;flex-direction:column;align-items:center;cursor:pointer;min-width:34px;}
    .md-thing span,.md-holder>span{font-size:0.5rem;color:#2a2018;font-weight:bold;line-height:1;text-align:center;}
    .md-inside{display:flex;flex-wrap:wrap;justify-content:center;max-width:48px;background:#e2d6b8;border-radius:3px;min-height:6px;}
    .md-under{font-size:0.5rem;color:#2a2018;display:flex;align-items:center;background:#e2d6b8;border-radius:3px;padding:0 2px;}
    .md-target img{outline:2px solid #ffcc00;}
    .md-gap{width:16px;min-height:40px;border:none;background:#ffcc0055;color:#7a5a00;font-weight:bold;border-radius:3px;cursor:pointer;padding:0;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "messyDesk", name: "🗂 Messy Desk", type: "messyDesk", difficulty: "A2",
    Component: MessyDeskModule, Manual: MessyDeskManual,
    _test: Object.assign(TEST, { PAGES, holds, failing, locate, remove, clone, makeDesk, text, START_ROWS, ROWS, INSIDE }),
  });
})();
