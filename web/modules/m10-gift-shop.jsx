/* ===== M10 GIFT SHOP (A2 tier: grandmother / sister / teacher, 1-3 flowers, wallet up to twelve) =====
 * Design: docs/design/modules/M10_gift_shop.md · Build spec: docs/design/modules/build/M10_build.md
 * The Defuser sees the prices; the Expert sees the wallet and the gift guide. Spend exactly all the money.
 * Sync: the bomb shows a SHOP NUMBER. It fixes the recipient and the wallet; each wrong PAY reshuffles the
 * prices (same wallet), and exactly one gift always fits.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const dollars = (n) => `${WORDS[n]} dollar${n === 1 ? "" : "s"}`;

  const SHELF = ["yo-yo", "doll", "kite", "ball", "flower"], CARDS = ["heart card", "THANK YOU card"], WRAP = ["box", "bag"];
  const ITEMS = [...SHELF, ...CARDS, ...WRAP];
  // The gift guide: each part is a choice of items and how many (teacher-editable data).
  const GUIDE = {
    grandmother: { text: "For grandmother: flowers (one, two or three) and a heart card. Put it in a box or a bag.", parts: [[["flower"], 1, 3], [["heart card"], 1, 1], [["box", "bag"], 1, 1]] },
    sister: { text: "For my sister: she wants a doll or a kite. Put it in a bag.", parts: [[["doll", "kite"], 1, 1], [["bag"], 1, 1]] },
    teacher: { text: "For the teacher: the THANK YOU card, and one more thing. No box, no bag.", parts: [[["THANK YOU card"], 1, 1], [["yo-yo", "doll", "kite", "ball", "flower"], 1, 1]] },
  };
  const LOOK = { grandmother: { look: "old-woman", height: "short", build: "thin", hair: "white", job: "none", item: "none", outfit: 1 },
    sister: { look: "girl", size: "big", build: "thin", hair: "black", job: "none", item: "none", outfit: 0 },
    teacher: { look: "woman", height: "tall", build: "thin", hair: "brown", job: "teacher", item: "none", outfit: 3 } };

  // Every basket the guide allows, as { item: count }.
  const combos = (who) => GUIDE[who].parts.reduce((acc, [choices, lo, hi]) => acc.flatMap((b) => choices.flatMap((it) => Array.from({ length: hi - lo + 1 }, (_, i) => ({ ...b, [it]: (b[it] || 0) + lo + i })))), [{}]);
  const cost = (b, prices) => Object.entries(b).reduce((s, [it, n]) => s + prices[it] * n, 0);

  const makeShop = (code) => {
    const r = rng(code), who = Object.keys(GUIDE)[Math.floor(r() * 3)];
    const all = combos(who);
    for (;;) { // a wallet that some price set can make unique
      const wallet = 3 + Math.floor(r() * 10);
      if (pricesFor({ code, who, wallet }, 0, 200)) return { code, who, wallet };
    }
  };
  // Prices for attempt k: exactly one allowed basket costs the wallet.
  const pricesFor = (shop, k, tries = 5000) => {
    const r = rng(shop.code * 97 + k * 7919 + 1), all = combos(shop.who);
    for (let i = 0; i < tries; i++) {
      const prices = Object.fromEntries(ITEMS.map((it) => [it, 1 + Math.floor(r() * 9)]));
      const hits = all.filter((b) => cost(b, prices) === shop.wallet);
      if (hits.length === 1) return { prices, answer: hits[0] };
    }
    return null;
  };

  const Pic = ({ it, size = 40 }) => it === "THANK YOU card" ? <span className="gs-thanks" style={{ width: size, height: size * 0.8 }}>THANK YOU</span>
    : <img className="pixel-art" src={it === "box" ? PX.toy("gift") : it === "bag" ? PX.holder("bag") : it === "heart card" ? PX.toy("card") : PX.toy(it)} alt={it} width={size} height={size} />;

  /* --- Defuser --- */
  const GiftShopModule = ({ onSuccess, onStrike }) => {
    const [code] = useState(() => MANUAL.pick("giftShop"));
    const [shop] = useState(() => makeShop(code));
    const [attempt, setAttempt] = useState(0);
    const [basket, setBasket] = useState({});
    const [won, setWon] = useState(false);
    const [msg, setMsg] = useState(null);
    const board = pricesFor(shop, attempt);
    TEST.shop = shop; TEST.board = board;
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1800); };
    const add = (it) => !won && setBasket((b) => ({ ...b, [it]: Math.min(12, (b[it] || 0) + 1) }));
    const remove = (it) => !won && setBasket((b) => { const n = { ...b, [it]: b[it] - 1 }; if (!n[it]) delete n[it]; return n; });
    const pay = () => {
      if (won) return;
      const want = board.answer, same = Object.keys({ ...want, ...basket }).every((it) => (want[it] || 0) === (basket[it] || 0));
      if (same) { setWon(true); flash("Thank you!"); return onSuccess(); }
      onStrike(); setBasket({}); setAttempt((a) => a + 1); flash("No! New prices!");
    };
    const Item = ({ it }) => (<button className="lr-item gs-item" onClick={() => add(it)} disabled={won}><Pic it={it} /><span>{it}</span><b className="gs-tag">{dollars(board.prices[it])}</b></button>);
    return (<div className="module-content gs"><h3>🎁 GIFT SHOP</h3>
      <div className="ms-top"><div className="lr-plate">SHOP NUMBER<b>{code}</b></div>
        <div className="gs-wish"><span>THE GIFT IS FOR:</span><img className="pixel-art" src={PX.person(LOOK[shop.who])} alt="" width={52} height={64} /></div></div>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className="lr-label">SHELF</div><div className="gs-grid">{SHELF.map((it) => <Item key={it} it={it} />)}</div>
      <div className="lr-label">CARDS AND WRAP</div><div className="gs-grid">{[...CARDS, ...WRAP].map((it) => <Item key={it} it={it} />)}</div>
      <div className="lr-label">BASKET (press to take one out)</div>
      <div className="gs-basket">{Object.keys(basket).length ? Object.entries(basket).map(([it, n]) => (
        <button key={it} className="gs-bitem" onClick={() => remove(it)}><Pic it={it} size={30} /><b>{n}</b></button>)) : <i>empty</i>}</div>
      <button className="submit-btn ww-done" onClick={pay} disabled={won}>{won ? "✓ PAID" : "PAY"}</button>
    </div>);
  };

  /* --- Expert --- */
  const GiftShopManual = () => {
    if (React.useContext(MANUAL.Print)) return (<div>
      <p><strong>Ask:</strong> "What is the shop number?" Find it in the wallet list. That is how much money the bomb has.</p>
      <table className="manual-table"><thead><tr><th>Shop number</th><th>The bomb has…</th><th>Shop number</th><th>The bomb has…</th></tr></thead><tbody>
        {(() => { const b = MANUAL.codebook("giftShop"), h = Math.ceil(b.length / 2); return b.slice(0, h).map((n, i) => <tr key={n}><td>{n}</td><td>{dollars(makeShop(n).wallet)}</td>{b[i + h] ? <><td>{b[i + h]}</td><td>{dollars(makeShop(b[i + h]).wallet)}</td></> : <><td /><td /></>}</tr>); })()}
      </tbody></table>
      <p><strong>Ask:</strong> "Who is the gift for?" Then ask: "How much is it?"</p>
      <div className="fp-page">{Object.values(GUIDE).map((g) => <p key={g.text}>{g.text}</p>)}</div>
      <div className="lr-rules"><p>Spend <strong>all</strong> the money. Not more, not less.</p><p>There is only <strong>one</strong> good gift. Find it!</p><p>If you pay and it is not good, the prices change. Ask again!</p></div>
    </div>);
    const [entry, setEntry] = useState(""), [shop, setShop] = useState(null);
    const show = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) setShop(makeShop(n)); };
    return (<div>
      <p><strong>Ask:</strong> "What is the shop number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={show}>SHOW</button></div>
      {shop && <p className="gs-wallet">The bomb has {dollars(shop.wallet)}.</p>}
      <p><strong>Ask:</strong> "Who is the gift for?" Then ask: "How much is it?"</p>
      <div className="fp-page">{Object.values(GUIDE).map((g) => <p key={g.text}>{g.text}</p>)}</div>
      <div className="lr-rules"><p>Spend <strong>all</strong> the money. Not more, not less.</p><p>There is only <strong>one</strong> good gift. Find it!</p><p>If you pay and it is not good, the prices change. Ask again!</p></div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .gs-wish{display:flex;align-items:center;gap:4px;background:#fff;border-radius:40px;padding:2px 10px;font-size:0.55rem;color:#333;font-weight:bold;}
    .gs-wish span{max-width:52px;}
    .gs-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;} .gs-grid:nth-of-type(2){grid-template-columns:repeat(4,1fr);}
    .gs-item{padding-bottom:4px;}
    .gs-tag{display:block;margin-top:2px;background:#fffbe8;border:1px solid #c9a65a;color:#5a3a10;font-size:0.6rem;line-height:1.1;border-radius:3px;padding:1px 2px;}
    .gs-thanks{display:inline-flex;align-items:center;justify-content:center;background:#fff;border:2px solid #1b1424;border-radius:3px;font-size:0.5rem;font-weight:900;color:#c43636;line-height:1;text-align:center;}
    .gs-basket{display:flex;flex-wrap:wrap;gap:4px;background:#d9c39a;border:2px solid #7a5532;border-radius:6px;min-height:46px;padding:4px;align-items:center;} .gs-basket i{color:#7a5532;}
    .gs-bitem{position:relative;background:#f4ecd8;border:1px solid #7a5532;border-radius:4px;padding:2px;cursor:pointer;}
    .gs-bitem b{position:absolute;top:-6px;right:-6px;background:#e04848;color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.7rem;display:flex;align-items:center;justify-content:center;}
    .gs-wallet{font-size:1.8rem;font-weight:bold;color:#ffcc00;margin:8px 0;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "giftShop", name: "🎁 Gift Shop", type: "giftShop", difficulty: "A2",
    Component: GiftShopModule, Manual: GiftShopManual,
    _test: Object.assign(TEST, { makeShop, pricesFor, combos, cost, dollars }),
  });
})();
