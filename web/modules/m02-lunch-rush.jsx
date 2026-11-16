/* ===== M02 LUNCH RUSH (A2 tier) =====
 * Design: docs/design/modules/M02_lunch_rush.md · Build spec: docs/design/modules/build/M02_build.md
 * Orders are only on the Expert's side, food / stove / diet light only on the Defuser's side.
 * Sync code: the bomb shows an ORDER NUMBER; the Expert types it into the manual and both sides
 * generate the same tickets from it (see the GDD's "Sync Code System").
 */
(() => {
  const { useState, useEffect, useRef } = React;

  /* --- menu (data, teacher-editable) --- */
  const COOK = ["pork", "beef", "chicken", "rice", "egg"];
  const AN = ["egg", "apple", "orange", "ice cream"];
  const NO_ARTICLE = ["bread", "rice", "pork", "beef", "chicken"];
  const FOODS = ["cake", "sandwich", "hot dog", "pizza", "hamburger", "bread", "pork", "beef", "chicken", "rice", "egg", "apple", "orange", "banana", "ice cream"];
  const DRINKS = ["milk", "juice", "water", "tea", "coffee"];
  const MEALS = ["breakfast", "lunch", "dinner"];

  const OPEN_GAP = 30000, TICKET_MS = 55000, GRACE = 8000, TICKETS = 8, GOAL = 3;
  const COOKED_AT = 3000, BURNED_AT = 8000;

  // Seeded RNG so both screens build the same round from the order number.
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const makeGame = (code) => {
    const r = rng(code), pick = (a) => a[Math.floor(r() * a.length)];
    const shuffle = (a) => a.map((v) => [r(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    const rotation = shuffle(MEALS);
    const tickets = Array.from({ length: TICKETS }, (_, i) => {
      // 2-3 lines: at least one food to cook, at most one drink.
      const lines = [pick(COOK)];
      const n = 2 + Math.floor(r() * 2), withDrink = r() < 0.6;
      while (lines.length < n - (withDrink ? 1 : 0)) { const f = pick(FOODS); if (!lines.includes(f)) lines.push(f); }
      if (withDrink) lines.push(pick(DRINKS));
      return { tid: i, meal: rotation[i % 3], lines: shuffle(lines), openMs: i * OPEN_GAP, dueMs: i * OPEN_GAP + TICKET_MS };
    });
    return { tickets, light: pick(["off", "red", "green"]) };
  };

  // What the bomb really wants, under the diet light.
  const need = (ticket, light) => {
    let words = ticket.lines.slice();
    if (light === "red") words = [...new Set(words.map((w) => (w === "beef" || w === "pork" ? "chicken" : w)))];
    if (light === "green" && !words.includes("ice cream")) words.push("ice cream");
    return words;
  };

  const say = (w) => (DRINKS.includes(w) ? `a cup of ${w}` : NO_ARTICLE.includes(w) ? w : `${AN.includes(w) ? "an" : "a"} ${w}`);
  const ticketText = (t) => t.lines.map(say).join(", ");

  const RULES = [
    ["red", "Red light: The bomb does not like beef or pork. Give chicken."],
    ["green", "Green light: The bomb wants ice cream, too."],
  ];
  const LIGHT = { off: "#2a2a2a", red: "#ff3b3b", green: "#3bff6a" };

  const Icon = ({ word, state, size = 40 }) => (
    <img className={`pixel-art lr-${state || "ok"}`} src={PX.food(word)} alt={word} width={size} height={size} />
  );

  /* --- Defuser --- */
  const LunchRushModule = ({ onSuccess, onStrike }) => {
    const [code] = useState(() => MANUAL.pick("lunchRush"));
    const [game] = useState(() => makeGame(code));
    const [t0, setT0] = useState(null); // the round starts when the Defuser presses START
    const [now, setNow] = useState(() => Date.now());
    const [held, setHeld] = useState(null);                 // { word, state }
    const [stove, setStove] = useState([null, null, null]); // { word, at }
    const [trays, setTrays] = useState({ breakfast: [], lunch: [], dinner: [] });
    const [closed, setClosed] = useState({});               // tid -> "served" | "missed"
    const [served, setServed] = useState(0);
    const [msg, setMsg] = useState(null);
    const won = useRef(false);

    useEffect(() => { if (t0 === null) return; const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id); }, [t0]);
    const el = t0 === null ? -1 : now - t0;
    const open = t0 === null ? [] : game.tickets.filter((t) => !closed[t.tid] && el >= t.openMs && el < t.dueMs + GRACE);
    const flash = (text) => { setMsg(text); setTimeout(() => setMsg((m) => (m === text ? null : m)), 1800); };

    // A ticket past its time is a strike, and its tray is cleared.
    useEffect(() => {
      if (t0 === null) return;
      const missed = game.tickets.filter((t) => !closed[t.tid] && el >= t.dueMs + GRACE);
      if (!missed.length) return;
      setClosed((c) => ({ ...c, ...Object.fromEntries(missed.map((t) => [t.tid, "missed"])) }));
      setTrays((tr) => { const n = { ...tr }; missed.forEach((t) => (n[t.meal] = [])); return n; });
      missed.forEach(() => onStrike());
      flash("Too slow!");
    }, [now]);

    const stateOn = (slot) => { const d = el - slot.at; return d < COOKED_AT ? "raw" : d < BURNED_AT ? "cooked" : "burned"; };
    const handsFull = () => { flash("Put it down first."); return true; };

    const takeFood = (w) => { if (held && handsFull()) return; setHeld({ word: w, state: COOK.includes(w) ? "raw" : "ok" }); };
    const pour = (w) => { if (held && handsFull()) return; setHeld({ word: w, state: "ok" }); };
    const tapStove = (i) => {
      const slot = stove[i];
      if (held) {
        if (slot) return handsFull();
        if (!COOK.includes(held.word)) return flash("Do not cook that.");
        setStove((s) => s.map((x, j) => (j === i ? { word: held.word, at: el - (held.state === "cooked" ? COOKED_AT : held.state === "burned" ? BURNED_AT : 0) } : x)));
        setHeld(null);
      } else if (slot) {
        setHeld({ word: slot.word, state: stateOn(slot) });
        setStove((s) => s.map((x, j) => (j === i ? null : x)));
      }
    };
    const tapTray = (meal) => { if (!held) return; setTrays((t) => ({ ...t, [meal]: [...t[meal], held] })); setHeld(null); };
    const takeBack = (meal, i) => {
      if (held) return handsFull();
      setHeld(trays[meal][i]);
      setTrays((t) => ({ ...t, [meal]: t[meal].filter((_, j) => j !== i) }));
    };
    const serve = (meal) => {
      const ticket = open.find((t) => t.meal === meal);
      if (!ticket) { onStrike(); return flash("No order for this tray!"); }
      const want = need(ticket, game.light).slice().sort(), got = trays[meal].map((x) => x.word).sort();
      const sameFood = want.length === got.length && want.every((w, i) => w === got[i]);
      const cooked = trays[meal].every((x) => !COOK.includes(x.word) || x.state === "cooked");
      if (!sameFood || !cooked) { onStrike(); return flash(!cooked && sameFood ? "Raw or burned food!" : "Wrong food!"); }
      setClosed((c) => ({ ...c, [ticket.tid]: "served" }));
      setTrays((t) => ({ ...t, [meal]: [] }));
      const n = served + 1; setServed(n); flash("Yum! Good job!");
      if (n >= GOAL && !won.current) { won.current = true; onSuccess(); }
    };

    return (<div className="module-content lr"><h3>🍔 LUNCH RUSH</h3>
      <div className="lr-face">
        <div className="lr-plate">ORDER NUMBER<b>{code}</b></div>
        <div className="lr-lamp" style={{ background: LIGHT[game.light], boxShadow: game.light === "off" ? "none" : `0 0 14px 4px ${LIGHT[game.light]}` }} title="light" />
        <div className="lr-served">SERVED<b>{served}/{GOAL}</b></div>
      </div>
      {msg && <div className="lr-msg">{msg}</div>}
      {t0 === null && <button className="submit-btn sb-start" onClick={() => { setT0(Date.now()); setNow(Date.now()); }}>START (when the Expert presses START)</button>}

      <div className="lr-label">FOOD</div>
      <div className="lr-pantry">{FOODS.map((w) => (
        <button key={w} className="lr-item" onClick={() => takeFood(w)}><Icon word={w} /><span>{w}</span></button>))}</div>
      <div className="lr-label">DRINKS</div>
      <div className="lr-drinks">{DRINKS.map((w) => (
        <button key={w} className="lr-item" onClick={() => pour(w)}><Icon word={w} /><span>{w}</span></button>))}</div>

      <div className="lr-hand">
        <span>IN YOUR HAND:</span>
        {held ? <><Icon word={held.word} state={held.state} size={32} /><b>{held.word}</b></> : <i>nothing</i>}
        <button className="lr-bin" onClick={() => setHeld(null)} disabled={!held}>🗑 BIN</button>
      </div>

      <div className="lr-label">STOVE</div>
      <div className="lr-stove">{stove.map((slot, i) => {
        const st = slot && stateOn(slot), p = slot ? Math.min(1, (el - slot.at) / BURNED_AT) : 0;
        return (<button key={i} className="lr-burner" onClick={() => tapStove(i)}
          style={{ background: slot ? `conic-gradient(${st === "raw" ? "#ffcc00" : st === "cooked" ? "#3bff6a" : "#ff3b3b"} ${p * 360}deg, #333 0)` : "#333" }}>
          <span className="lr-pan">{slot ? <Icon word={slot.word} state={st} size={36} /> : null}</span>
          {st === "burned" && <span className="lr-smoke">💨</span>}
        </button>);
      })}</div>

      <div className="lr-label">TRAYS</div>
      <div className="lr-trays">{MEALS.map((meal) => (
        <div key={meal} className="lr-tray">
          <button className="lr-traytop" onClick={() => tapTray(meal)}>
            <Icon word={meal} size={32} /><span>{meal}</span>
            <div className="lr-onTray">{trays[meal].map((x, i) => (
              <span key={i} onClick={(e) => { e.stopPropagation(); takeBack(meal, i); }}><Icon word={x.word} state={x.state} size={26} /></span>))}</div>
          </button>
          <button className="lr-serve" onClick={() => serve(meal)}>SERVE</button>
        </div>))}</div>
    </div>);
  };

  /* --- Expert --- */
  const clock = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
  const LunchRushManual = () => {
    if (React.useContext(MANUAL.Print)) return (<div>
      <p><strong>You need a watch or a clock with seconds.</strong></p>
      <p><strong>Ask:</strong> "What is the order number?" Find it in the order book. Then say "Ready… go!" The Defuser presses START. Start your clock at the same time.</p>
      <p><strong>Ask:</strong> "What color is the light?"</p>
      <div className="lr-rules">{RULES.map(([k, text]) => <p key={k}>{text}</p>)}
        <p>Cook pork, beef, chicken, rice and an egg on the stove. Brown is good. Black is bad.</p>
        <p>Say the meal: BREAKFAST, LUNCH or DINNER. Press SERVE on that tray.</p>
      </div>
      <p>Read each order at its <strong>start</strong> time. It must be on the tray before its <strong>end</strong> time. Tick it when it is served.</p>
      <h3 className="mk-book-title">Order book</h3>
      {MANUAL.codebook("lunchRush").map((n) => (<div key={n} className="mk-entry"><h4>ORDER NUMBER {n}</h4>
        <table className="manual-table"><thead><tr><th>Start</th><th>End</th><th>Meal</th><th>Order</th><th>✓</th></tr></thead>
          <tbody>{makeGame(n).tickets.map((t) => <tr key={t.tid}><td>{clock(t.openMs)}</td><td>{clock(t.dueMs)}</td><td>{t.meal.toUpperCase()}</td><td style={{ textAlign: "left" }}>{ticketText(t)}</td><td></td></tr>)}</tbody></table></div>))}
    </div>);
    const [entry, setEntry] = useState("");
    const [game, setGame] = useState(null);
    const [t0, setT0] = useState(0);
    const [now, setNow] = useState(() => Date.now());
    const [done, setDone] = useState({});
    useEffect(() => { if (!game) return; const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id); }, [game]);
    const start = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) { setGame(makeGame(n)); setT0(Date.now()); setDone({}); } };
    const el = now - t0;
    const open = game ? game.tickets.filter((t) => !done[t.tid] && el >= t.openMs && el < t.dueMs).sort((a, b) => a.dueMs - b.dueMs) : [];
    return (<div>
      <p><strong>Ask:</strong> "What is the order number?" Write it here. Then say "Ready… go!" and press START at the same time.</p>
      <div className="lr-start">
        <input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" />
        <button onClick={start}>START</button>
      </div>
      <p><strong>Ask:</strong> "What color is the light?"</p>
      <div className="lr-rules">{RULES.map(([k, text]) => <p key={k}>{text}</p>)}
        <p>Cook pork, beef, chicken, rice and an egg on the stove. Brown is good. Black is bad.</p>
        <p>Say the meal: BREAKFAST, LUNCH or DINNER. Press SERVE on that tray.</p>
      </div>
      {game && <div className="lr-tickets">
        {open.length === 0 && <p className="lr-wait">Wait for the next order…</p>}
        {open.map((t) => {
          const left = Math.max(0, (t.dueMs - el) / TICKET_MS);
          return (<div key={t.tid} className="lr-ticket">
            <div className="lr-tmeal">{t.meal.toUpperCase()}</div>
            <div className="lr-ttext">{ticketText(t)}</div>
            <div className="lr-bar"><div style={{ width: `${left * 100}%`, background: left > 0.5 ? "#3bff6a" : left > 0.25 ? "#ffcc00" : "#ff3b3b" }} /></div>
            <button className="lr-done" onClick={() => setDone((d) => ({ ...d, [t.tid]: true }))}>SERVED ✓</button>
          </div>);
        })}
      </div>}
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .lr-face{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#0a1520;border:1px solid #333;border-radius:6px;padding:8px;margin-bottom:6px;}
    .lr-plate,.lr-served{font-size:0.65rem;color:#aaa;display:flex;flex-direction:column;}
    .lr-plate b,.lr-served b{font-family:'Orbitron',sans-serif;font-size:1.3rem;color:#ffcc00;letter-spacing:2px;}
    .lr-lamp{width:44px;height:44px;border-radius:50%;border:3px solid #555;}
    .lr-msg{background:#ffcc00;color:#000;text-align:center;font-weight:bold;border-radius:4px;padding:4px;margin-bottom:6px;}
    .lr-label{font-family:'Orbitron',sans-serif;font-size:0.65rem;color:#888;margin:6px 0 3px;letter-spacing:2px;}
    .lr-pantry,.lr-drinks{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;}
    .lr-item{background:#f4ecd8;border:2px solid #7a5532;border-radius:4px;padding:2px 0;cursor:pointer;display:flex;flex-direction:column;align-items:center;min-height:56px;}
    .lr-item span{font-size:0.6rem;color:#2a2018;font-weight:bold;line-height:1.1;}
    .lr-hand{display:flex;align-items:center;gap:6px;background:#1a1a2e;border:1px dashed #555;border-radius:4px;padding:4px 6px;margin-top:6px;min-height:44px;font-size:0.75rem;}
    .lr-hand b{color:#0ff;} .lr-hand i{color:#666;}
    .lr-bin{margin-left:auto;background:#3a1a1a;border:1px solid #844;color:#fbb;border-radius:4px;padding:6px 8px;cursor:pointer;}
    .lr-stove{display:flex;justify-content:space-around;}
    .lr-burner{width:68px;height:68px;border-radius:50%;border:3px solid #555;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;}
    .lr-pan{width:52px;height:52px;border-radius:50%;background:#1b1b1b;display:flex;align-items:center;justify-content:center;}
    .lr-smoke{position:absolute;top:-6px;right:-4px;font-size:1.2rem;}
    .lr-trays{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;}
    .lr-tray{display:flex;flex-direction:column;gap:3px;}
    .lr-traytop{background:#d9c39a;border:2px solid #7a5532;border-radius:6px;min-height:96px;cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:3px;}
    .lr-traytop>span{font-size:0.65rem;font-weight:bold;color:#2a2018;}
    .lr-onTray{display:flex;flex-wrap:wrap;justify-content:center;gap:1px;margin-top:2px;}
    .lr-serve{background:#1f6b2a;border:1px solid #3bff6a;color:#fff;font-family:'Orbitron',sans-serif;font-size:0.7rem;padding:8px 0;border-radius:4px;cursor:pointer;}
    .lr-raw{} .lr-cooked{filter:sepia(1) saturate(2.5) hue-rotate(-15deg) brightness(0.8);} .lr-burned{filter:brightness(0.25) saturate(0);}
    .lr-start{display:flex;gap:6px;margin:6px 0;}
    .lr-start input{width:110px;font-size:1.4rem;font-family:'Orbitron',sans-serif;padding:4px 8px;background:#0a1520;color:#ffcc00;border:1px solid #555;border-radius:4px;letter-spacing:3px;}
    .lr-start button,.lr-done{background:#ffcc00;color:#000;border:none;border-radius:4px;padding:6px 12px;font-weight:bold;cursor:pointer;}
    .lr-rules{background:#20202f;border:1px solid #444;border-radius:4px;padding:6px 10px;margin:6px 0;}
    .lr-rules p{font-size:1rem;margin:4px 0;}
    .lr-ticket{background:#f4ecd8;color:#2a2018;border-radius:6px;padding:8px 10px;margin:8px 0;}
    .lr-tmeal{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.1rem;}
    .lr-ttext{font-size:1.4rem;line-height:1.35;margin:4px 0;}
    .lr-bar{height:10px;background:#ccc;border-radius:5px;overflow:hidden;margin:4px 0 6px;} .lr-bar div{height:100%;}
    .lr-wait{color:#888;font-style:italic;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "lunchRush", name: "🍔 Lunch Rush", type: "lunchRush", difficulty: "A2",
    Component: LunchRushModule, Manual: LunchRushManual,
    _test: { makeGame, need, ticketText },
  });
})();
