/* ===== M01 FAMILY PHOTO =====
 * Design: docs/design/modules/M01_family_photo.md
 * The photo shows 4 members of one family plus one friend who is a near-twin of a member (one trait different).
 * The Expert's book has every family's page; the caption says which page is real.
 * Stage 1: press the friend. Stage 2: the bomb asks WHO IS NUMBER n? Press the family word.
 */
(() => {
  const { useState } = React;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

  const ROLES = ["grandfather", "grandmother", "father", "mother", "brother", "sister", "baby"];
  const LOOK = { grandfather: "old-man", grandmother: "old-woman", father: "man", mother: "woman", brother: "boy", sister: "girl", baby: "baby" };
  const ADULT = ["grandfather", "grandmother", "father", "mother"];
  const JOBS = ["doctor", "nurse", "teacher", "student", "singer", "farmer", "none"];

  // m(role, tall/short or big/small, build, hair, job, item, outfit, which traits the book says)
  const m = (role, hs, build, hair, job, item, outfit, says) => ({
    role, look: LOOK[role], ...(ADULT.includes(role) ? { height: hs } : { size: hs }), build, hair, job, item, outfit, says,
  });

  // The Expert's book. Every page is fixed, so the manual is the same on every device.
  const FAMILIES = {
    LIN: [
      m("grandfather", "tall", "thin", "white", "farmer", "none", 0, ["build", "job", "hair"]),
      m("grandmother", "short", "fat", "gray", "singer", "new-hat", 1, ["hs", "job", "item"]),
      m("father", "tall", "fat", "black", "doctor", "none", 2, ["hs", "build", "job"]),
      m("mother", "tall", "thin", "black", "teacher", "none", 3, ["job", "hair"]),
      m("sister", "small", "thin", "brown", "student", "old-bookbag", 0, ["hs", "job", "item"]),
    ],
    WANG: [
      m("grandmother", "tall", "thin", "white", "none", "old-hat", 2, ["hs", "item"]),
      m("father", "short", "thin", "brown", "farmer", "none", 0, ["hs", "build", "job"]),
      m("mother", "short", "fat", "black", "nurse", "none", 1, ["build", "job"]),
      m("brother", "big", "fat", "black", "none", "big-ball", 3, ["hs", "build", "item"]),
      m("baby", "small", null, null, "none", "new-hat", 0, ["hs", "item"]),
    ],
    CHEN: [
      m("grandfather", "short", "fat", "gray", "none", "new-hat", 3, ["build", "item"]),
      m("father", "tall", "thin", "black", "teacher", "none", 1, ["hs", "job", "hair"]),
      m("mother", "tall", "fat", "brown", "doctor", "none", 0, ["hs", "build", "job"]),
      m("brother", "small", "thin", "brown", "student", "new-bookbag", 2, ["hs", "item"]),
      m("sister", "big", "fat", "black", "none", "small-dog", 1, ["build", "item"]),
    ],
    LEE: [
      m("grandmother", "short", "thin", "gray", "nurse", "none", 0, ["hs", "job"]),
      m("father", "tall", "fat", "brown", "singer", "none", 2, ["build", "job", "hair"]),
      m("mother", "short", "thin", "black", "none", "big-dog", 3, ["hs", "item"]),
      m("brother", "big", "thin", "black", "none", "small-ball", 1, ["hs", "build", "item"]),
      m("baby", "big", null, null, "none", "big-ball", 0, ["hs", "item"]),
    ],
    KO: [
      m("grandfather", "tall", "fat", "white", "doctor", "none", 1, ["hs", "build", "job"]),
      m("grandmother", "tall", "thin", "white", "farmer", "none", 0, ["build", "job"]),
      m("mother", "tall", "thin", "brown", "singer", "new-hat", 2, ["hs", "item"]),
      m("sister", "small", "fat", "brown", "student", "old-bookbag", 3, ["hs", "build", "item"]),
      m("baby", "small", null, null, "none", "old-hat", 0, ["hs", "item"]),
    ],
    WU: [
      m("grandfather", "short", "thin", "gray", "singer", "old-hat", 3, ["hs", "job", "item"]),
      m("father", "short", "fat", "black", "nurse", "none", 0, ["hs", "build", "job"]),
      m("mother", "tall", "fat", "black", "farmer", "none", 1, ["build", "job", "hair"]),
      m("brother", "big", "thin", "brown", "none", "big-dog", 2, ["hs", "item"]),
      m("sister", "big", "thin", "black", "student", "new-bookbag", 3, ["job", "item"]),
    ],
    HO: [
      m("grandmother", "tall", "fat", "gray", "teacher", "none", 1, ["hs", "build", "job"]),
      m("father", "tall", "thin", "brown", "none", "old-hat", 3, ["hs", "build", "item"]),
      m("mother", "short", "fat", "brown", "doctor", "none", 2, ["hs", "job", "hair"]),
      m("brother", "small", "fat", "black", "student", "old-bookbag", 0, ["hs", "build"]),
      m("baby", "big", null, null, "none", "small-ball", 0, ["hs", "item"]),
    ],
    TSAI: [
      m("grandfather", "tall", "thin", "gray", "teacher", "none", 2, ["build", "job", "hair"]),
      m("grandmother", "short", "fat", "white", "none", "small-dog", 0, ["hs", "build", "item"]),
      m("father", "short", "thin", "black", "doctor", "new-hat", 1, ["hs", "job", "item"]),
      m("mother", "tall", "thin", "brown", "nurse", "none", 3, ["hs", "build"]),
      m("sister", "small", "thin", "black", "none", "big-ball", 2, ["hs", "item"]),
    ],
  };

  /* --- the book's sentences --- */
  const SHE = ["grandmother", "mother", "sister"];
  const ITEM = {
    "new-hat": "a new hat", "old-hat": "an old hat", "new-bookbag": "a new bookbag", "old-bookbag": "an old bookbag",
    "big-ball": "a big ball", "small-ball": "a small ball", "big-dog": "a big dog", "small-dog": "a small dog",
  };
  const sentences = (p) => {
    const baby = p.role === "baby";
    let subject = baby ? "The baby" : `My ${p.role}`;
    const next = () => { const s = subject; subject = baby ? "The baby" : SHE.includes(p.role) ? "She" : "He"; return s; };
    const out = [], adj = [];
    if (p.says.includes("hs")) adj.push(p.height || p.size);
    if (p.says.includes("build")) adj.push(p.build);
    if (adj.length) out.push(`${next()} is ${adj.join(" and ")}.`);
    if (p.says.includes("job")) out.push(`${next()} is a ${p.job}.`);
    if (p.says.includes("hair")) out.push(`${next()} has ${p.hair} hair.`);
    if (p.says.includes("item")) out.push(`${next()} has ${ITEM[p.item]}.`);
    return out.join(" ");
  };

  /* --- the board --- */
  const val = (p, k) => (k === "hs" ? p.height || p.size : p[k]);
  const matches = (p, entry) => p.look === entry.look && entry.says.every((k) => val(p, k) === val(entry, k));
  const FLIP = {
    hs: (p) => (p.height ? { height: p.height === "tall" ? "short" : "tall" } : { size: p.size === "big" ? "small" : "big" }),
    build: (p) => ({ build: p.build === "thin" ? "fat" : "thin" }),
    hair: (p) => ({ hair: { black: "brown", brown: "black", gray: "white", white: "gray" }[p.hair] }),
    job: (p) => ({ job: pick(JOBS.filter((j) => j !== p.job)) }),
    item: (p) => ({ item: { "new-hat": "old-hat", "old-hat": "new-hat", "new-bookbag": "old-bookbag", "old-bookbag": "new-bookbag",
      "big-ball": "small-ball", "small-ball": "big-ball", "big-dog": "small-dog", "small-dog": "big-dog" }[p.item] }),
  };
  // Combinations the sprites can't draw clearly (two props in one hand, a hat on a straw hat).
  const drawable = (p) => !(p.job === "farmer" && /hat/.test(p.item)) && !(/^old/.test(p.look) && /ball/.test(p.item)) && !(["teacher", "singer"].includes(p.job) && /dog/.test(p.item));

  const makeBoard = () => {
    const name = pick(Object.keys(FAMILIES)), family = FAMILIES[name];
    for (;;) {
      // The friend is a near-twin of member x: same look, one of the book's traits flipped.
      const x = pick(family);
      const friend = { ...x, ...FLIP[pick(x.says)](x), role: "friend" };
      if (!drawable(friend) || family.some((e) => matches(friend, e))) continue;
      const people = shuffle([x, friend, ...shuffle(family.filter((e) => e !== x)).slice(0, 3)]).map((p, i) => ({ ...p, frame: i + 1 }));
      return { name, people, friend: people.find((p) => p.role === "friend").frame, ask: pick(people.filter((p) => p.role !== "friend")) };
    }
  };
  const sprite = (p) => PX.person({ look: p.look, height: p.height, size: p.size, build: p.build, hair: p.hair, job: p.job, item: p.item, outfit: p.outfit });

  /* --- Defuser --- */
  const FamilyPhotoModule = ({ onSuccess, onStrike }) => {
    const [b] = useState(makeBoard);
    const [stage, setStage] = useState(1);
    const [solved, setSolved] = useState(false);
    const pressFrame = (f) => { if (stage !== 1) return; if (f === b.friend) setStage(2); else onStrike(); };
    const pressRole = (r) => { if (stage !== 2 || solved) return; if (r === b.ask.role) { setSolved(true); onSuccess(); } else onStrike(); };
    return (<div className="module-content"><h3>👪 FAMILY PHOTO</h3>
      <p className="fp-prompt">{stage === 1 ? "PRESS THE FRIEND" : `WHO IS NUMBER ${b.ask.frame}?`}</p>
      <div className="fp-photo">
        <div className="fp-people">{b.people.map((p) => (
          <button key={p.frame} onClick={() => pressFrame(p.frame)} disabled={stage !== 1}
            className={`fp-person ${stage === 2 && p.frame === b.ask.frame ? "ask" : ""} ${stage === 2 && p.frame === b.friend ? "out" : ""}`}>
            <img className="pixel-art" src={sprite(p)} alt={`number ${p.frame}`} /><span className="fp-num">{p.frame}</span>
          </button>))}</div>
        <div className="fp-plate">THE {b.name} FAMILY</div>
      </div>
      {stage === 2 && <div className="fp-roles">{[...ROLES, "friend"].map((r) => (
        <button key={r} onClick={() => pressRole(r)} disabled={solved} className={`option-btn ${solved && r === b.ask.role ? "correct" : ""}`}>{r.toUpperCase()}</button>))}</div>}
    </div>);
  };

  /* --- Expert --- */
  const FamilyPhotoManual = () => {
    const [tab, setTab] = useState("LIN");
    return (<div>
      <p><strong>Ask:</strong> "What is the name on the photo?"</p>
      <p><strong>Rule 1:</strong> One person in the photo is not in this book. He or she is a friend, not family. Press the friend.</p>
      <p><strong>Rule 2:</strong> Then the bomb asks WHO. Press who he or she is in the family.</p>
      <div className="fp-tabs">{Object.keys(FAMILIES).map((n) => (
        <button key={n} onClick={() => setTab(n)} className={`fp-tab ${n === tab ? "active" : ""}`}>{n}</button>))}</div>
      <div className="fp-page"><h4>THE {tab} FAMILY</h4>{FAMILIES[tab].map((p) => <p key={p.role}>{sentences(p)}</p>)}</div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .fp-prompt{font-family:'Orbitron',sans-serif;color:#fff;font-size:1rem;text-align:center;margin-bottom:0.6rem;letter-spacing:1px;}
    .fp-photo{background:#7a5532;padding:8px;border-radius:6px;box-shadow:inset 0 0 0 3px #3e2a17,0 0 0 2px #2a1c0f;}
    .fp-people{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;}
    .fp-person{position:relative;min-height:56px;padding:4px 0 0;border:3px solid transparent;border-radius:4px;cursor:pointer;
      background:linear-gradient(#d8ecf7 0 86%,#c9a678 86%);}
    .fp-person:disabled{cursor:default;}
    .fp-person img{width:100%;max-width:104px;display:block;margin:0 auto;}
    .fp-num{position:absolute;top:3px;left:3px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.1rem;color:#fff;background:#1b1424;border-radius:4px;padding:0 6px;}
    .fp-person.ask{border-color:#ffcc00;animation:fpPulse 0.9s ease-in-out infinite;}
    .fp-person.out{opacity:0.3;}
    @keyframes fpPulse{50%{box-shadow:0 0 12px 3px #ffcc00;}}
    .fp-plate{margin:8px auto 0;width:max-content;max-width:100%;background:linear-gradient(#f0d27a,#b8892f);color:#3a2a0a;font-family:'Orbitron',sans-serif;font-weight:700;font-size:0.85rem;padding:4px 14px;border-radius:3px;letter-spacing:2px;box-shadow:0 1px 0 #5a3d10;}
    .fp-roles{display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin-top:0.7rem;}
    .fp-roles .option-btn{min-height:44px;font-size:0.85rem;}
    .fp-tabs{display:flex;flex-wrap:wrap;gap:4px;margin:0.6rem 0;}
    .fp-tab{padding:0.4rem 0.7rem;background:#1a1a2e;border:1px solid #444;color:#ccc;border-radius:4px;cursor:pointer;font-family:inherit;font-size:0.9rem;}
    .fp-tab.active{background:#ffcc00;color:#000;border-color:#ffcc00;}
    .fp-page{background:#f4ecd8;color:#2a2018;border-radius:4px;padding:0.8rem 1rem;}
    .fp-page h4{font-family:'Orbitron',sans-serif;margin-bottom:0.4rem;}
    .fp-page p{font-size:1.15rem;line-height:1.5;margin-bottom:0.3rem;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "familyPhoto", name: "👪 Family Photo", type: "familyPhoto", difficulty: "A2",
    Component: FamilyPhotoModule, Manual: FamilyPhotoManual,
    // exposed for tests
    _test: { FAMILIES, makeBoard, matches, sentences },
  });
})();
