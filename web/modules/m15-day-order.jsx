/* ===== M15 DAY ORDER (A1: parts of the day, in order) =====
 * Six word cards, shuffled: MORNING, NOON, AFTERNOON, EVENING, NIGHT, MIDNIGHT. Put them in the six slots,
 * top to bottom, and press CHECK. Right: defused. Wrong: STRIKE, and every card goes back, shuffled again.
 * Drag a card to a slot (a full slot swaps), drag it back to the tray to take it out, or tap a card and
 * then tap a slot. Words only, no pictures: the word is the clue.
 * The Defuser does this alone. The manual says so and does not give the answer.
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};
  const DAY = ["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT", "MIDNIGHT"];
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  // never deal the cards already in the right order
  const deal = () => { let d; do d = shuffle(DAY); while (d.every((w, i) => w === DAY[i])); return d; };
  const isRight = (slots) => slots.every((w, i) => w === DAY[i]);

  const chime = (ok) => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [660, 880, 1320] : [180]).forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; o.type = ok ? "sine" : "square";
      o.connect(g); g.connect(a.destination); g.gain.value = 0.06; o.start(a.currentTime + i * 0.1); o.stop(a.currentTime + i * 0.1 + 0.18); }); } catch (e) {} };

  const Component = ({ onSuccess, onStrike }) => {
    const [tray, setTray] = useState(deal);                 // cards not placed, in tray order
    const [slots, setSlots] = useState(() => DAY.map(() => null));
    const [held, setHeld] = useState(null);                 // tapped card (tap mode)
    const [drag, setDrag] = useState(null);                 // { word, x, y } while dragging
    const [phase, setPhase] = useState("play");             // play | shake | won
    const start = useRef(null), timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    Object.assign(TEST, { tray, slots, held, phase });
    const busy = phase !== "play";

    // Put `word` into slot `i` (or back in the tray when i is null). A full slot gives its card to where `word` came from.
    const move = (word, i) => {
      const from = slots.indexOf(word);
      const s = [...slots]; let t = tray.filter((w) => w !== word);
      if (i == null) { if (from < 0) return; s[from] = null; t = [...t, word]; }
      else {
        const old = s[i];
        if (from >= 0) s[from] = old; else if (old) t = tray.map((w) => (w === word ? old : w)); // swap into the tray spot
        s[i] = word;
      }
      setSlots(s); setTray(t); setHeld(null);
    };

    const down = (e, word) => {
      if (busy) return;
      start.current = { word, x: e.clientX, y: e.clientY, moved: false };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const over = (e) => {
      const s = start.current; if (!s) return;
      if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 6) return;
      s.moved = true; setDrag({ word: s.word, x: e.clientX, y: e.clientY });
    };
    const up = (e) => {
      const s = start.current; start.current = null; setDrag(null);
      if (!s || busy) return;
      if (!s.moved) { // a tap
        if (held && held !== s.word && slots.includes(s.word)) { move(held, slots.indexOf(s.word)); return; } // tap a placed card: swap
        setHeld(held === s.word ? null : s.word); return;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slot = el && el.closest("[data-do-slot]"), back = el && el.closest("[data-do-tray]");
      if (slot) move(s.word, +slot.dataset.doSlot); else if (back) move(s.word, null);
    };
    const tapSlot = (i) => { if (!busy && held) move(held, i); };
    const tapTray = () => { if (!busy && held && slots.includes(held)) move(held, null); };

    const check = () => {
      if (busy || slots.includes(null)) return;
      if (isRight(slots)) { chime(true); setPhase("won"); onSuccess(); return; }
      chime(false); onStrike(); setPhase("shake");
      timer.current = setTimeout(() => { setSlots(DAY.map(() => null)); setTray(deal()); setHeld(null); setPhase("play"); }, 900);
    };

    const card = (word) => (
      <div key={word} className={`do-card ${held === word ? "held" : ""} ${drag && drag.word === word ? "ghosted" : ""}`}
        onPointerDown={(e) => down(e, word)} onPointerMove={over} onPointerUp={up} onPointerCancel={() => { start.current = null; setDrag(null); }}>
        {word}</div>);

    return (<div className="module-content do"><h3>🌅 DAY ORDER</h3>
      <p className="do-hint">FIRST ⬇ LAST</p>
      <div className={`do-board do-${phase}`}>
        <div className="do-slots">
          {slots.map((w, i) => (
            <div key={i} className={`do-slot ${w ? "full" : ""}`} data-do-slot={i} onClick={() => !w && tapSlot(i)}>
              <span className="do-num">{i + 1}</span>{w ? card(w) : <span className="do-empty" />}
            </div>))}
        </div>
        <div className="do-tray" data-do-tray="1" onClick={(e) => e.target === e.currentTarget && tapTray()}>
          {tray.map(card)}
        </div>
        {phase === "shake" && <div className="do-flash">✖ TRY AGAIN</div>}
        {phase === "won" && <div className="do-flash do-good">✔ RIGHT</div>}
      </div>
      <button className={`submit-btn do-check ${phase === "won" ? "correct" : ""}`} onClick={check} disabled={busy || slots.includes(null)}>
        {phase === "won" ? "✓ DEFUSED" : "CHECK"}</button>
      {drag && <div className="do-card do-drag" style={{ left: drag.x, top: drag.y }}>{drag.word}</div>}
    </div>);
  };

  const Manual = () => (<div className="do-manual">
    <p>The Defuser does this one. <strong>No help from the manual!</strong></p>
    <p>There are six cards: parts of the day. Put them in order, first to last. Then press CHECK.</p>
    <p>Wrong: <strong>STRIKE!</strong> The cards go back. Try again.</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .do-hint{text-align:center;font-family:'Orbitron',sans-serif;font-size:0.7rem;color:#888;margin:0 0 6px;}
    .do-board{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#0a1520;border:3px solid #333;border-radius:8px;padding:8px;}
    .do-board.do-shake{animation:do-shake 0.4s;}
    @keyframes do-shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);}}
    .do-slots,.do-tray{display:flex;flex-direction:column;gap:6px;}
    .do-tray{border:2px dashed #2a3a4a;border-radius:6px;padding:4px;min-height:100%;box-sizing:border-box;}
    .do-slot{display:flex;align-items:center;gap:4px;min-height:44px;}
    .do-num{width:20px;font-family:'Orbitron',sans-serif;font-size:0.8rem;color:#ffcc00;text-align:right;flex:none;}
    .do-empty{flex:1;height:40px;border:2px dashed #445;border-radius:6px;}
    .do-slot:not(.full){cursor:pointer;}
    .do-card{flex:1;min-height:40px;display:flex;align-items:center;justify-content:center;background:#f6f1e1;color:#1b1424;border:2px solid #1b1424;
      border-radius:6px;box-shadow:0 3px 0 #8a7a5a;font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.72rem;letter-spacing:0.5px;
      touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;}
    .do-tray .do-card{flex:none;height:40px;margin-top:2px;}
    .do-card.held{background:#ffe14a;box-shadow:0 0 10px #ffe14a;}
    .do-card.ghosted{opacity:0.3;}
    .do-drag{position:fixed;z-index:1000;transform:translate(-50%,-50%) rotate(-3deg);width:130px;pointer-events:none;cursor:grabbing;box-shadow:0 8px 16px rgba(0,0,0,0.5);}
    .do-flash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(160,20,20,0.55);color:#fff;
      font-family:'Orbitron',sans-serif;font-size:1.3rem;font-weight:900;border-radius:6px;}
    .do-flash.do-good{background:rgba(20,140,60,0.5);}
    .do-check{width:100%;margin-top:8px;min-height:48px;}
  `;
  document.head.appendChild(css);

  const _test = Object.assign(TEST, { DAY, deal, isRight });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "dayOrder", name: "🌅 Day Order", type: "dayOrder", difficulty: "A1", puzzle: 1, Component, Manual, _test });
})();
