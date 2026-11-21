/* ===== M10 GIFT SHOP (A2: grandmother / sister / teacher, Taiwan-style prices in tens, wallet 100-500) =====
 * Design: docs/design/modules/M10_gift_shop.md
 * The Defuser sees the prices; the Expert sees the wallet and the wish lists. Buy only things the person
 * wants, any number of each, and spend exactly all the money. Any basket that does that is a good gift.
 * Sync: the bomb shows a SHOP NUMBER. It fixes the recipient and the wallet; each wrong PAY reshuffles the
 * prices (same wallet). Every board has 1-4 good gifts, each made of 2-6 things.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const words = (n) => n >= 100 ? `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? " " + words(n % 100) : ""}`
    : n >= 20 ? TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "") : ONES[n];
  const dollars = (n) => `${words(n)} dollar${n === 1 ? "" : "s"}`;

  const SHELF = ["yo-yo", "doll", "kite", "ball", "flower"], CARDS = ["heart card", "THANK YOU card"], WRAP = ["box", "bag"];
  const ITEMS = [...SHELF, ...CARDS, ...WRAP];
  // Taiwan-style prices (NT dollars, no cents): round numbers that A2 students can add aloud.
  const PRICES = [10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200];
  const MAX_EACH = 5; // the generator counts baskets with up to this many of each thing
  // Wish lists (teacher-editable data). Anything not on the list is a bad gift, even if the total is right.
  const GUIDE = {
    grandmother: { wants: ["flower", "heart card", "box"], text: "Grandmother wants flowers, heart cards and boxes." },
    sister: { wants: ["doll", "kite", "yo-yo", "bag"], text: "My sister wants dolls, kites, yo-yos and bags." },
    teacher: { wants: ["THANK YOU card", "flower", "ball"], text: "The teacher wants THANK YOU cards, flowers and balls." },
  };
  // Shown to the Defuser as a word (the pixel portraits were too hard to tell apart). Matches the guide wording.
  const LABEL = { grandmother: "grandmother", sister: "my sister", teacher: "the teacher" };

  const cost = (b, prices) => Object.entries(b).reduce((s, [it, n]) => s + prices[it] * n, 0);
  const size = (b) => Object.values(b).reduce((s, n) => s + n, 0);
  // The rule PAY uses: not empty, only wanted things, exactly the wallet.
  const good = (b, who, wallet, prices) => size(b) > 0 && Object.keys(b).every((it) => GUIDE[who].wants.includes(it)) && cost(b, prices) === wallet;
  // Every good gift on this board (wanted things, 0..MAX_EACH of each, total = wallet).
  const solutions = (who, wallet, prices) => {
    const wants = GUIDE[who].wants, out = [];
    const go = (i, b, sum) => {
      if (sum > wallet) return;
      if (i === wants.length) { if (sum === wallet && size(b)) out.push({ ...b }); return; }
      for (let n = 0; n <= MAX_EACH; n++) { const nb = n ? { ...b, [wants[i]]: n } : b; go(i + 1, nb, sum + n * prices[wants[i]]); }
    };
    go(0, {}, 0); return out;
  };

  const makeShop = (code) => {
    const r = rng(code), who = Object.keys(GUIDE)[Math.floor(r() * 3)];
    for (;;) { // a wallet that some price set can make into a fair puzzle
      const wallet = 100 + 10 * Math.floor(r() * 41); // 100..500
      if (pricesFor({ code, who, wallet }, 0, 300)) return { code, who, wallet };
    }
  };
  // Prices for attempt k: 1-4 good gifts, each 2-6 things (so the team has to add, but not too much).
  const pricesFor = (shop, k, tries = 5000) => {
    const r = rng(shop.code * 97 + k * 7919 + 1);
    for (let i = 0; i < tries; i++) {
      const prices = Object.fromEntries(ITEMS.map((it) => [it, PRICES[Math.floor(r() * PRICES.length)]]));
      const sols = solutions(shop.who, shop.wallet, prices);
      if (sols.length >= 1 && sols.length <= 4 && sols.every((b) => size(b) >= 2 && size(b) <= 6)) return { prices, answers: sols };
    }
    return null;
  };

  const SRC = { box: () => PX.toy("gift"), bag: () => PX.holder("bag"), "heart card": () => PX.toy("card"),
    cake: () => PX.food("cake"), candy: () => PX.food("candy"), cookie: () => PX.food("cookie"), tea: () => PX.food("tea"), coffee: () => PX.food("coffee"),
    pen: () => PX.thing("pen", "blue"), book: () => PX.thing("book", "red"), "T-shirt": () => PX.clothes("T-shirt") };
  const Pic = ({ it, size = 40 }) => it === "THANK YOU card" ? <span className="gs-thanks" style={{ width: size, height: size * 0.8 }}>THANK YOU</span>
    : <img className="pixel-art" src={(SRC[it] || (() => PX.toy(it)))()} alt={it} width={size} height={size} />;

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
      if (good(basket, shop.who, shop.wallet, board.prices)) { setWon(true); flash("Thank you!"); return onSuccess(); }
      onStrike(); setBasket({}); setAttempt((a) => a + 1); flash("No! New prices!");
    };
    const Item = ({ it }) => (<button className="lr-item gs-item" onClick={() => add(it)} disabled={won}><Pic it={it} /><span>{it}</span><b className="gs-tag">{dollars(board.prices[it])}</b></button>);
    return (<div className="module-content gs"><h3>🎁 GIFT SHOP</h3>
      <div className="ms-top"><div className="lr-plate">SHOP NUMBER<b>{code}</b></div>
        <div className="gs-wish"><span>THE GIFT IS FOR:</span><b className="gs-who">{LABEL[shop.who]}</b></div></div>
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
      <p><strong>Ask:</strong> "What is the shop number?" Find it in the wallet list. That is how much money you have.</p>
      <table className="manual-table"><thead><tr><th>Shop number</th><th>You have…</th><th>Shop number</th><th>You have…</th></tr></thead><tbody>
        {(() => { const b = MANUAL.codebook("giftShop"), h = Math.ceil(b.length / 2); return b.slice(0, h).map((n, i) => <tr key={n}><td>{n}</td><td>{dollars(makeShop(n).wallet)}</td>{b[i + h] ? <><td>{b[i + h]}</td><td>{dollars(makeShop(b[i + h]).wallet)}</td></> : <><td /><td /></>}</tr>); })()}
      </tbody></table>
      <p><strong>Ask:</strong> "Who is the gift for?" Then ask: "How much is it?"</p>
      <div className="fp-page">{Object.values(GUIDE).map((g) => <p key={g.text}>{g.text}</p>)}</div>
      <div className="lr-rules"><p>Buy <strong>only</strong> things the person wants. You can buy one, two or more of a thing.</p><p>Spend <strong>all</strong> the money. Not more, not less.</p><p>If you pay and it is not good, the prices change. Ask again!</p></div>
    </div>);
    const [entry, setEntry] = useState(""), [shop, setShop] = useState(null);
    const show = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) setShop(makeShop(n)); };
    return (<div>
      <p><strong>Ask:</strong> "What is the shop number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={show}>SHOW</button></div>
      {shop && <p className="gs-wallet">You have {dollars(shop.wallet)}.</p>}
      <p><strong>Ask:</strong> "Who is the gift for?" Then ask: "How much is it?"</p>
      <div className="fp-page">{Object.values(GUIDE).map((g) => <p key={g.text}>{g.text}</p>)}</div>
      <div className="lr-rules"><p>Buy <strong>only</strong> things the person wants. You can buy one, two or more of a thing.</p><p>Spend <strong>all</strong> the money. Not more, not less.</p><p>If you pay and it is not good, the prices change. Ask again!</p></div>
    </div>);
  };

  /* ===== GIFT SHOP: PRICE LIST (B1) =====
   * The Defuser sees who the gift is for, the money ("You have ... dollars") and the 8 things in stock, with
   * no prices. The Expert has the wish lists and a big price list of every thing the shops can sell (18),
   * found by the SHOP NUMBER. So the Defuser must say what is in stock and how much money there is, and the
   * Expert must say the prices. A wrong PAY is a strike and the bomb moves to a new shop number.
   * Every shop: 2-4 wanted things in stock, 2+ wanted things NOT in stock (and ignoring stock gives more
   * "answers", so the team has to check), 1-4 good gifts of 2-6 things, each with at least two DIFFERENT things.
   */
  const CATALOG = ["yo-yo", "doll", "kite", "ball", "flower", "heart card", "star card", "THANK YOU card", "box", "bag",
    "cake", "candy", "cookie", "tea", "coffee", "pen", "book", "T-shirt"];
  const PL_GUIDE = {
    grandmother: { wants: ["flower", "tea", "cake", "heart card", "book", "box"], text: "Grandmother wants flowers, tea, cake, heart cards, books and boxes." },
    sister: { wants: ["doll", "kite", "yo-yo", "candy", "T-shirt", "bag"], text: "My sister wants dolls, kites, yo-yos, candy, T-shirts and bags." },
    teacher: { wants: ["THANK YOU card", "flower", "pen", "book", "coffee", "cookie"], text: "The teacher wants THANK YOU cards, flowers, pens, books, coffee and cookies." },
    brother: { wants: ["ball", "kite", "cookie", "star card", "T-shirt", "candy"], text: "My brother wants balls, kites, cookies, star cards, T-shirts and candy." },
  };
  const PL_LABEL = { ...LABEL, brother: "my brother" };
  const STOCK = 8;
  // All good gifts from `items` (0..MAX_EACH of each, total = wallet).
  const solve = (items, wallet, prices) => {
    const out = [];
    const go = (i, b, sum) => {
      if (sum > wallet) return;
      if (i === items.length) { if (sum === wallet && size(b)) out.push({ ...b }); return; }
      for (let n = 0; n <= MAX_EACH; n++) go(i + 1, n ? { ...b, [items[i]]: n } : b, sum + n * prices[items[i]]);
    };
    go(0, {}, 0); return out;
  };
  const listShops = {};
  const listShop = (code) => {
    if (listShops[code]) return listShops[code];
    const r = rng(code * 31 + 7), pickN = (arr, n) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
    const who = Object.keys(PL_GUIDE)[Math.floor(r() * 4)], wants = PL_GUIDE[who].wants;
    for (;;) {
      const prices = Object.fromEntries(CATALOG.map((it) => [it, PRICES[Math.floor(r() * PRICES.length)]]));
      for (let t = 0; t < 300; t++) {
        const stock = pickN(CATALOG, STOCK), inStock = wants.filter((it) => stock.includes(it));
        if (inStock.length < 2 || inStock.length > 4) continue;
        const wallet = 100 + 10 * Math.floor(r() * 41);
        const sols = solve(inStock, wallet, prices);
        if (sols.length < 1 || sols.length > 4 || !sols.every((b) => Object.keys(b).length >= 2 && size(b) <= 6)) continue; // 2+ different things
        if (solve(wants, wallet, prices).length <= sols.length) continue; // out-of-stock things must matter
        return (listShops[code] = { code, who, prices, stock: CATALOG.filter((it) => stock.includes(it)), wallet, answers: sols });
      }
    }
  };
  const plGood = (b, shop) => size(b) > 0 && Object.keys(b).every((it) => PL_GUIDE[shop.who].wants.includes(it) && shop.stock.includes(it)) && cost(b, shop.prices) === shop.wallet;

  const PriceListModule = ({ onSuccess, onStrike }) => {
    const [code, setCode] = useState(() => MANUAL.pick("giftShopList"));
    const [basket, setBasket] = useState({});
    const [won, setWon] = useState(false);
    const [msg, setMsg] = useState(null);
    const shop = listShop(code);
    TEST.plShop = shop;
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1800); };
    const add = (it) => !won && setBasket((b) => ({ ...b, [it]: Math.min(12, (b[it] || 0) + 1) }));
    const remove = (it) => !won && setBasket((b) => { const n = { ...b, [it]: b[it] - 1 }; if (!n[it]) delete n[it]; return n; });
    const pay = () => {
      if (won) return;
      if (plGood(basket, shop)) { setWon(true); flash("Thank you!"); return onSuccess(); }
      onStrike(); setBasket({}); setCode((c) => MANUAL.pick("giftShopList", (n) => n !== c)); flash("No! New shop!");
    };
    return (<div className="module-content gs"><h3>🎁 GIFT SHOP: PRICE LIST</h3>
      <div className="ms-top"><div className="lr-plate">SHOP NUMBER<b>{code}</b></div>
        <div className="gs-wish"><span>THE GIFT IS FOR:</span><b className="gs-who">{PL_LABEL[shop.who]}</b></div></div>
      <div className="gs-money">You have {dollars(shop.wallet)}.</div>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className="lr-label">IN THE SHOP</div>
      <div className="gs-grid gs-grid4">{shop.stock.map((it) => (<button key={it} className="lr-item gs-item" onClick={() => add(it)} disabled={won}><Pic it={it} /><span>{it}</span></button>))}</div>
      <div className="lr-label">BASKET (press to take one out)</div>
      <div className="gs-basket">{Object.keys(basket).length ? Object.entries(basket).map(([it, n]) => (
        <button key={it} className="gs-bitem" onClick={() => remove(it)}><Pic it={it} size={30} /><b>{n}</b></button>)) : <i>empty</i>}</div>
      <button className="submit-btn ww-done" onClick={pay} disabled={won}>{won ? "✓ PAID" : "PAY"}</button>
    </div>);
  };

  const PL_RULES = (<div className="lr-rules"><p>Buy <strong>only</strong> things the person wants, and only things the shop has. You can buy one, two or more of a thing.</p>
    <p>Spend <strong>all</strong> the money. Not more, not less.</p><p>If you pay and it is not good, you go to a <strong>new shop</strong>. Ask for the new shop number!</p></div>);
  const PL_ASK = <p><strong>Ask:</strong> "Who is the gift for?" "How much money do you have?" "What does the shop have?" <strong>Say:</strong> "The kite is sixty dollars."</p>;
  const PriceListManual = () => {
    if (React.useContext(MANUAL.Print)) {
      const book = MANUAL.codebook("giftShopList"), halves = [book.slice(0, 5), book.slice(5)];
      return (<div>
        <p><strong>Ask:</strong> "What is the shop number?" Find that column in the price list. All prices are in dollars.</p>
        {halves.map((h, i) => (<table key={i} className="manual-table gs-ptable"><thead><tr><th>Shop number →</th>{h.map((n) => <th key={n}>{n}</th>)}</tr></thead><tbody>
          {CATALOG.map((it) => <tr key={it}><td><b>{it}</b></td>{h.map((n) => <td key={n}>{words(listShop(n).prices[it])}</td>)}</tr>)}
        </tbody></table>))}
        {PL_ASK}
        <div className="fp-page">{Object.values(PL_GUIDE).map((g) => <p key={g.text}>{g.text}</p>)}</div>
        {PL_RULES}
      </div>);
    }
    const [entry, setEntry] = useState(""), [shop, setShop] = useState(null);
    const show = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) setShop(listShop(n)); };
    return (<div>
      <p><strong>Ask:</strong> "What is the shop number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={show}>SHOW</button></div>
      {shop && <div className="gs-plist"><div className="gs-plist-h">PRICE LIST · shop {shop.code}</div>
        {CATALOG.map((it) => <div key={it} className="gs-prow"><span>{it}</span><b>{dollars(shop.prices[it])}</b></div>)}</div>}
      {PL_ASK}
      <div className="fp-page">{Object.values(PL_GUIDE).map((g) => <p key={g.text}>{g.text}</p>)}</div>
      {PL_RULES}
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .gs-wish{display:flex;align-items:center;gap:4px;background:#fff;border-radius:40px;padding:2px 10px;font-size:0.55rem;color:#333;font-weight:bold;}
    .gs-wish span{max-width:52px;} .gs-wish .gs-who{font-size:1rem;color:#c43636;padding:4px 2px;white-space:nowrap;}
    .gs-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;} .gs-grid:nth-of-type(2){grid-template-columns:repeat(4,1fr);}
    .gs-item{padding-bottom:4px;}
    .gs-tag{display:block;margin-top:2px;background:#fffbe8;border:1px solid #c9a65a;color:#5a3a10;font-size:0.6rem;line-height:1.1;border-radius:3px;padding:1px 2px;}
    .gs-thanks{display:inline-flex;align-items:center;justify-content:center;background:#fff;border:2px solid #1b1424;border-radius:3px;font-size:0.5rem;font-weight:900;color:#c43636;line-height:1;text-align:center;}
    .gs-basket{display:flex;flex-wrap:wrap;gap:4px;background:#d9c39a;border:2px solid #7a5532;border-radius:6px;min-height:46px;padding:4px;align-items:center;} .gs-basket i{color:#7a5532;}
    .gs-bitem{position:relative;background:#f4ecd8;border:1px solid #7a5532;border-radius:4px;padding:2px;cursor:pointer;}
    .gs-bitem b{position:absolute;top:-6px;right:-6px;background:#e04848;color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.7rem;display:flex;align-items:center;justify-content:center;}
    .gs-wallet{font-size:1.8rem;font-weight:bold;color:#ffcc00;margin:8px 0;}
    .gs-grid.gs-grid4{grid-template-columns:repeat(4,1fr);}
    .gs-money{margin:6px 0 2px;background:#fffbe8;border:2px solid #c9a65a;color:#5a3a10;border-radius:6px;padding:4px 8px;font-weight:bold;text-align:center;}
    .gs-plist{background:#fffbe8;color:#3a2a10;border-radius:6px;padding:6px 10px;margin:8px 0;font-size:0.85rem;}
    .gs-plist-h{font-weight:bold;color:#7a5532;margin-bottom:4px;}
    .gs-prow{display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted #c9a65a;padding:1px 0;} .gs-prow span{white-space:nowrap;} .gs-prow b{text-align:right;}
    .gs-ptable td,.gs-ptable th{font-size:0.75rem;padding:2px 4px;}
  `;
  document.head.appendChild(css);

  Object.assign(TEST, { makeShop, pricesFor, solutions, good, cost, dollars, words, GUIDE, listShop, solve, plGood, PL_GUIDE, CATALOG });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "giftShop", name: "🎁 Gift Shop", type: "giftShop", difficulty: "A2", Component: GiftShopModule, Manual: GiftShopManual, _test: TEST },
    { id: "giftShopList", name: "🎁 Gift Shop: Price List", type: "giftShopList", difficulty: "B1", Component: PriceListModule, Manual: PriceListManual, _test: TEST },
  );
})();
