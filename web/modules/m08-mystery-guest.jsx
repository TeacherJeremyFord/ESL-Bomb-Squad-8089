/* ===== M08 MYSTERY GUEST (B1 tier: 8 guests, Can / Does questions, name + can-not notes, 5 questions) =====
 * Design: docs/design/modules/M08_mystery_guest.md · Build spec: docs/design/modules/build/M08_build.md
 * The Defuser builds yes/no questions from tiles; only the Expert can read the bomb's answers.
 * Sync: the bomb shows a PARTY NUMBER (the Expert enters it once for the witness notes), and after each
 * question an ANSWER CODE like "2-KD". Each question number has its own secret code table, so only the
 * Expert's manual can turn a code into the answer.
 */
(() => {
  const { useState } = React;
  const TEST = {};
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const NAMES = ["AMY", "BEN", "TOM", "MAY", "LEO", "EVA", "KAI", "SUE"], BOYS = ["BEN", "TOM", "LEO", "KAI"];
  const CAN = ["dance", "sing", "read", "write", "draw"], TOYS = ["kite", "ball", "yo-yo", "doll"];
  const ROWS = [["Can", "Does", "Did", "Is", "What", "Who"], ["he", "she"], ["dance", "sing", "read", "write", "draw", "play", "have", "like"], ["a kite", "a ball", "a yo-yo", "a doll", "today", "—"]];
  const OFF = ["Did", "today"]; // B1: "Did … today" questions come at B2
  const BUDGET = 5;
  const SENTENCES = ["Yes, he can.", "No, he can not.", "Yes, she can.", "No, she can not.", "Yes, he does.", "No, he does not.", "Yes, she does.", "No, she does not.",
    "Yes, he did.", "No, he did not.", "Yes, she did.", "No, she did not.", "That is not a good question.", "Ask a yes or no question.", "No. He is a boy.", "No. She is a girl."];
  const S = (t) => SENTENCES.indexOf(t);

  /* --- the party --- */
  const makeParty = (code) => {
    const r = rng(code), pick = (a) => a[Math.floor(r() * a.length)], shuffle = (a) => a.map((v) => [r(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    for (;;) {
      const guests = NAMES.map((name) => ({ name, boy: BOYS.includes(name), can: pick(CAN), has: pick([...TOYS, null]), likes: pick(TOYS), hair: pick(["black", "brown"]), outfit: Math.floor(r() * 4), build: pick(["thin", "fat"]) }));
      const target = pick(guests), same = shuffle(guests.filter((g) => g.boy === target.boy && g !== target)).slice(0, 2);
      // The can-not note: the target can't do X; one other name in the note can, the other can't (so 2 guests fit the notes).
      const x = target.can === same[0].can ? null : CAN.find((c) => c !== target.can && c === same[0].can);
      if (!x || same[1].can === x) continue;
      const fit = [target, same[1]];
      const differ = fit[0].can !== fit[1].can || fit[0].has !== fit[1].has || fit[0].likes !== fit[1].likes;
      if (!differ) continue;
      const names = shuffle([target, ...same].map((g) => g.name));
      const he = target.boy ? "He" : "She", his = target.boy ? "His" : "Her";
      return { code, guests: shuffle(guests), target: target.name, notes: [`${his} name is ${names[0]}, ${names[1]} or ${names[2]}.`, `${he} can not ${x}.`] };
    }
  };

  /* --- the bomb's answer engine --- */
  const answer = (tiles, t) => {
    const [aux, pro, verb, obj] = tiles, he = t.boy ? "he" : "she";
    if (aux === "What" || aux === "Who") return S("Ask a yes or no question.");
    let fact = null;
    if (aux === "Can" && CAN.includes(verb) && obj === "—") fact = ["can", t.can === verb];
    else if (aux === "Can" && verb === "play" && obj === "—") fact = ["can", true];
    else if (aux === "Does" && (verb === "have" || verb === "like") && obj.startsWith("a ") && obj !== "a —") {
      const toy = obj.slice(2); fact = ["does", verb === "have" ? t.has === toy : t.likes === toy];
    } else if (aux === "Did" && (verb === "draw" || verb === "write") && (obj === "today" || obj === "—")) fact = ["did", false];
    if (!fact) return S("That is not a good question.");
    if (pro !== he) return S(t.boy ? "No. He is a boy." : "No. She is a girl.");
    const [a, yes] = fact, neg = { can: "can not", does: "does not", did: "did not" }[a];
    return S(yes ? `Yes, ${he} ${a}.` : `No, ${he} ${neg}.`);
  };
  // Question q's secret table: sentence -> two letters.
  const codeTable = (party, q) => {
    const r = rng(party * 31 + q), L = "ABCDEFGHJKLMNPRSTUVWXYZ", codes = new Set();
    while (codes.size < SENTENCES.length) codes.add(L[Math.floor(r() * L.length)] + L[Math.floor(r() * L.length)]);
    return [...codes];
  };
  const encode = (party, q, sid) => `${q}-${codeTable(party, q)[sid]}`;
  const decode = (party, text) => {
    const m = text.toUpperCase().replace(/[^0-9A-Z]/g, "").match(/^(\d)([A-Z]{2})$/);
    if (!m) return null;
    const sid = codeTable(party, +m[1]).indexOf(m[2]);
    return sid < 0 ? null : { q: +m[1], text: SENTENCES[sid] };
  };

  /* --- Defuser --- */
  const Guest = ({ g, gray, onTap, accusing }) => (<button className={`mg-guest ${gray ? "gray" : ""} ${accusing ? "accusing" : ""}`} onClick={onTap}>
    <span className="mg-heart"><img className="pixel-art" src={PX.toy(g.likes)} alt={`likes ${g.likes}`} width={22} height={22} /></span>
    <img className="pixel-art mg-kid" src={PX.person({ look: g.boy ? "boy" : "girl", size: "big", build: g.build, hair: g.hair, job: "none", item: "none", outfit: g.outfit })} alt="" />
    <img className="pixel-art mg-can" src={PX.prop(g.can)} alt={g.can} width={26} height={26} />
    {g.has && <img className="pixel-art mg-has" src={PX.toy(g.has)} alt={`has ${g.has}`} width={24} height={24} />}
    <span className="mg-tag">{g.name}</span>
  </button>);

  const MysteryGuestModule = ({ onSuccess, onStrike }) => {
    const [code] = useState(() => MANUAL.pick("mysteryGuest"));
    const [p] = useState(() => makeParty(code));
    const [sel, setSel] = useState([null, null, null, null]);
    const [asked, setAsked] = useState([]);
    const [budget, setBudget] = useState(BUDGET);
    const [gray, setGray] = useState({});
    const [accusing, setAccusing] = useState(false);
    const [won, setWon] = useState(false);
    const [msg, setMsg] = useState(null);
    TEST.party = p;
    const target = p.guests.find((g) => g.name === p.target);
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1800); };
    const question = sel.every((x) => x) ? `${sel[0]} ${sel[1]} ${sel[2]}${sel[3] === "—" ? "" : " " + sel[3]}?` : null;
    const send = () => {
      if (!question || won) return;
      if (budget <= 0) return flash("No questions left. ACCUSE!");
      const q = asked.length + 1;
      setAsked([...asked, { text: question, code: encode(code, q, answer(sel, target)) }]);
      setBudget(budget - 1); setSel([null, null, null, null]);
    };
    const tapGuest = (g) => {
      if (won) return;
      if (!accusing) return setGray((x) => ({ ...x, [g.name]: !x[g.name] }));
      setAccusing(false);
      if (g.name === p.target) { setWon(true); flash("You found the bomb maker!"); onSuccess(); }
      else { onStrike(); setBudget((b) => Math.max(0, b - 1)); setGray((x) => ({ ...x, [g.name]: true })); flash("Not that guest!"); }
    };

    return (<div className="module-content mg"><h3>🎉 MYSTERY GUEST</h3>
      <div className="ms-top"><div className="lr-plate">PARTY NUMBER<b>{code}</b></div><div className="mg-budget">{"❓".repeat(budget)}<span>{budget} left</span></div></div>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className="mg-party">{p.guests.map((g) => <Guest key={g.name} g={g} gray={gray[g.name]} accusing={accusing} onTap={() => tapGuest(g)} />)}</div>
      <div className="mg-builder">{ROWS.map((row, i) => (<div key={i} className="mg-row">{row.map((t) => (
        <button key={t} disabled={OFF.includes(t)} className={`mg-tile ${sel[i] === t ? "on" : ""}`} onClick={() => setSel((s) => s.map((x, j) => (j === i ? t : x)))}>{t}</button>))}</div>))}</div>
      <div className="mg-preview">{question || "Press one word in every row."}</div>
      <div className="mg-actions">
        <button className="submit-btn" onClick={send} disabled={!question || won}>SEND</button>
        <button className={`submit-btn mg-accuse ${accusing ? "on" : ""}`} onClick={() => setAccusing(!accusing)} disabled={won}>{accusing ? "PRESS A GUEST" : "ACCUSE"}</button>
      </div>
      {asked.length > 0 && <div className="mg-log">{asked.map((a, i) => <div key={i}>{i + 1}. {a.text} <b>ANSWER CODE: {a.code}</b></div>)}</div>}
    </div>);
  };

  /* --- Expert --- */
  const MysteryGuestManual = () => {
    if (React.useContext(MANUAL.Print)) return (<div>
      <p>The bomb maker is at the party. The Defuser asks the bomb yes or no questions. Only you can read the answers!</p>
      <p><strong>Ask:</strong> "What is the party number?" Find the party below and read the witness notes.</p>
      <p><strong>After each question, ask:</strong> "What is the answer code?" A code like <strong>2-KD</strong> means question 2, letters KD. Find the letters in the column for that question. Tell the Defuser the answer.</p>
      {MANUAL.codebook("mysteryGuest").map((n) => (<div key={n} className="mk-entry"><h4>PARTY NUMBER {n}</h4>
        <p><strong>Witness notes:</strong> {makeParty(n).notes.join(" ")}</p>
        <table className="manual-table"><thead><tr><th>Answer</th>{Array.from({ length: BUDGET }, (_, q) => <th key={q}>Q{q + 1}</th>)}</tr></thead>
          <tbody>{SENTENCES.map((s, sid) => <tr key={sid}><td style={{ textAlign: "left" }}>{s}</td>{Array.from({ length: BUDGET }, (_, q) => <td key={q}>{codeTable(n, q + 1)[sid]}</td>)}</tr>)}</tbody></table></div>))}
    </div>);
    const [entry, setEntry] = useState(""), [party, setParty] = useState(null);
    const [codeIn, setCodeIn] = useState(""), [feed, setFeed] = useState([]), [err, setErr] = useState(null);
    const notes = party ? makeParty(party).notes : null;
    const show = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) { setParty(n); setFeed([]); } };
    const read = () => { const d = party && decode(party, codeIn); if (!d) return setErr("Check the code."); setErr(null); setFeed((f) => [...f.filter((x) => x.q !== d.q), d].sort((a, b) => a.q - b.q)); setCodeIn(""); };
    return (<div>
      <p><strong>Ask:</strong> "What is the party number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={show}>SHOW</button></div>
      {notes && <div className="lr-rules"><p><strong>Witness notes:</strong></p>{notes.map((n) => <p key={n} className="mg-note">{n}</p>)}</div>}
      <p>The bomb maker is at the party. The Defuser asks the bomb yes or no questions. Only you can read the answers!</p>
      <p><strong>Ask:</strong> "What is the answer code?" Write it here and press READ. Then tell the Defuser the answer.</p>
      <div className="lr-start"><input value={codeIn} maxLength={5} onChange={(e) => setCodeIn(e.target.value.toUpperCase())} placeholder="1-AB" disabled={!party} /><button onClick={read} disabled={!party}>READ</button></div>
      {err && <p style={{ color: "#ff6a6a" }}>{err}</p>}
      <div className="mg-feed">{feed.map((f) => <p key={f.q}>Question {f.q}: <b>{f.text}</b></p>)}</div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .mg-budget{font-size:1.1rem;display:flex;flex-direction:column;align-items:flex-end;} .mg-budget span{font-size:0.65rem;color:#aaa;}
    .mg-party{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;background:linear-gradient(#3a2a5a,#5a3a6a);border-radius:6px;padding:6px;}
    .mg-guest{position:relative;background:#f4ecd8;border:2px solid #7a5532;border-radius:6px;padding:20px 0 22px;cursor:pointer;min-height:56px;}
    .mg-guest.gray{filter:grayscale(1) brightness(0.55);} .mg-guest.accusing{border-color:#ff3b3b;box-shadow:0 0 8px #ff3b3b;}
    .mg-kid{width:100%;max-width:64px;display:block;margin:0 auto;}
    .mg-heart{position:absolute;top:2px;left:50%;transform:translateX(-50%);background:#fff;border:2px solid #e04848;border-radius:50% 50% 50% 50%;width:30px;height:24px;display:flex;align-items:center;justify-content:center;}
    .mg-heart::before{content:'♥';position:absolute;left:-9px;top:-7px;color:#e04848;font-size:14px;}
    .mg-can{position:absolute;bottom:20px;left:2px;} .mg-has{position:absolute;bottom:36px;right:2px;}
    .mg-tag{position:absolute;bottom:2px;left:4px;right:4px;background:#fff;color:#000;border:2px solid #1b1424;border-radius:3px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.8rem;letter-spacing:1px;}
    .mg-builder{margin-top:6px;display:flex;flex-direction:column;gap:3px;}
    .mg-row{display:flex;flex-wrap:wrap;gap:3px;}
    .mg-tile{flex:1 0 auto;min-height:36px;background:#1a1a2e;border:1px solid #555;color:#0ff;border-radius:4px;font-family:inherit;font-size:0.8rem;cursor:pointer;padding:0 6px;}
    .mg-tile.on{background:#ffcc00;color:#000;border-color:#ffcc00;} .mg-tile:disabled{opacity:0.25;cursor:default;}
    .mg-preview{text-align:center;font-size:1.05rem;color:#fff;margin:6px 0;min-height:1.4em;}
    .mg-actions{display:flex;gap:6px;} .mg-actions button{flex:1;min-height:44px;}
    .mg-accuse{background:#5a1a1a !important;color:#fbb !important;} .mg-accuse.on{background:#ff3b3b !important;color:#fff !important;}
    .mg-log{margin-top:6px;font-size:0.75rem;background:#0a1520;border-radius:4px;padding:4px 6px;} .mg-log b{color:#ffcc00;font-family:'Orbitron',sans-serif;}
    .mg-note{font-size:1.3rem !important;} .mg-feed p{font-size:1.2rem;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "mysteryGuest", name: "🎉 Mystery Guest", type: "mysteryGuest", difficulty: "B1",
    Component: MysteryGuestModule, Manual: MysteryGuestManual,
    _test: Object.assign(TEST, { makeParty, answer, encode, decode, SENTENCES }),
  });
})();
