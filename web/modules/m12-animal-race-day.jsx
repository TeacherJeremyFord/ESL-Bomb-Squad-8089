/* ===== M12 ANIMAL RACE DAY (B1 rules: 14 animals, Zoo / Farm teams, NOT light; gate time 2.0 s) =====
 * Design: docs/design/modules/M12_animal_race_day.md · Build spec: docs/design/modules/build/M12_build.md
 * Animals parade through the gate. Press GO while the right animal, on the right team, is in the gate.
 * Sync: the bomb shows a RACE NUMBER; the Expert enters it to see today's (silly) entry list.
 */
(() => {
  const { useState, useEffect, useRef } = React;
  const TEST = {};
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ANIMALS = ["turtle", "dog", "cat", "monkey", "rabbit", "frog", "bird", "fish", "lion", "bear", "tiger", "pig", "cow", "horse"];
  const RACES = ["swim", "run", "jump", "jog", "fly", "walk"], TEAMS = ["zoo", "farm"];
  const NATURAL = { swim: ["fish"], fly: ["bird"], jump: ["frog", "rabbit", "monkey"], run: ["horse", "dog"], walk: ["turtle"], jog: [] };
  const GATE_MS = 2000, GRACE = 200, RACES_PER_ROUND = 3, TEAM_HEX = { zoo: "#f39a2b", farm: "#3f9e45" };

  // Today's entry list: a different (silly) animal and "other" animal for every race and team.
  const makeEntries = (code) => {
    const r = rng(code), shuffle = (a) => a.map((v) => [r(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    const entries = {};
    for (const team of TEAMS) for (;;) {
      const pool = shuffle(ANIMALS), col = RACES.map((race, i) => ({ race, animal: pool[i * 2], other: pool[i * 2 + 1] }));
      if (col.some((e) => NATURAL[e.race].includes(e.animal) || NATURAL[e.race].includes(e.other))) continue;
      col.forEach((e) => (entries[e.race + "|" + team] = { animal: e.animal, other: e.other }));
      break;
    }
    return entries;
  };
  const target = (entries, race) => { const e = entries[race.race + "|" + race.team]; return { animal: race.not ? e.other : e.animal, team: race.team }; };

  const makeParade = (entries, race) => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)], t = target(entries, race), e = entries[race.race + "|" + race.team];
    for (;;) {
      const t1 = 2 + Math.floor(Math.random() * 6), t2 = t1 + 4 + Math.floor(Math.random() * 5), n = t2 + 3;
      const slots = Array(n).fill(null);
      slots[t1] = slots[t2] = t;
      const before = [...Array(t1).keys()].sort(() => Math.random() - 0.5);
      slots[before[0]] = { animal: t.animal, team: t.team === "zoo" ? "farm" : "zoo" };                 // the classic trap: right animal, wrong team
      if (race.not && before.length > 1) slots[before[1]] = { animal: e.animal, team: t.team };       // the NOT light: the first animal can not race
      for (let i = 0; i < n; i++) if (!slots[i]) slots[i] = { animal: pick(ANIMALS.filter((a) => a !== t.animal)), team: pick(TEAMS) };
      const same = (a, b) => a && b && a.animal === b.animal;
      if (slots.some((s, i) => same(s, slots[i + 1]))) continue;
      if (slots.filter((s) => s.animal === t.animal && s.team === t.team).length !== 2) continue;
      return slots;
    }
  };
  const makeRaces = () => {
    const words = [...RACES].sort(() => Math.random() - 0.5).slice(0, RACES_PER_ROUND);
    return words.map((w) => ({ race: w, team: TEAMS[Math.floor(Math.random() * 2)], not: Math.random() < 0.4 }));
  };

  /* --- Defuser --- */
  const AnimalRaceModule = ({ onSuccess, onStrike }) => {
    const [code] = useState(() => 1000 + Math.floor(Math.random() * 9000));
    const [entries] = useState(() => makeEntries(code));
    const [races] = useState(makeRaces);
    const [no, setNo] = useState(0);
    const [parade, setParade] = useState(() => makeParade(entries, races[0]));
    const [t0, setT0] = useState(null);
    const [now, setNow] = useState(() => Date.now());
    const [cheer, setCheer] = useState(false);
    const [won, setWon] = useState(false);
    const [msg, setMsg] = useState(null);
    const done = useRef(false);
    const race = races[no], tgt = target(entries, race);
    TEST.code = code; TEST.entries = entries; TEST.races = races; TEST.no = no; TEST.parade = parade; TEST.t0 = t0;
    useEffect(() => { if (t0 === null || won) return; const id = setInterval(() => setNow(Date.now()), 100); return () => clearInterval(id); }, [t0, won]);
    const el = t0 === null ? -1 : now - t0, idx = Math.floor(el / GATE_MS), pass = !cheer && idx >= 0 && idx < parade.length ? parade[idx] : null;
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1500); };
    const isTarget = (p) => p && p.animal === tgt.animal && p.team === tgt.team;
    const restart = () => { setParade(makeParade(entries, race)); setT0(Date.now()); setNow(Date.now()); };

    // Letting the right animal pass two times is a strike, and the race starts again.
    useEffect(() => {
      if (t0 === null || cheer || won) return;
      const last = parade.map(isTarget).lastIndexOf(true);
      if (el > (last + 1) * GATE_MS + GRACE) { onStrike(); flash("Too late! Again!"); restart(); }
    }, [now]);

    const go = () => {
      if (t0 === null || cheer || won) return;
      const prev = el % GATE_MS < GRACE ? parade[idx - 1] : null;
      if (isTarget(pass) || isTarget(prev)) {
        setCheer(true); flash("GO GO GO! You win the race!");
        setTimeout(() => {
          setCheer(false);
          if (no + 1 >= RACES_PER_ROUND) { if (!done.current) { done.current = true; setWon(true); onSuccess(); } return; }
          setNo(no + 1); setParade(makeParade(entries, races[no + 1])); setT0(Date.now()); setNow(Date.now());
        }, 1800);
      } else { onStrike(); flash(pass ? "Not that animal!" : "The gate is empty!"); }
    };

    return (<div className="module-content rd"><h3>🏁 ANIMAL RACE DAY</h3>
      <div className="ms-top"><div className="lr-plate">RACE NUMBER<b>{code}</b></div><div className="rd-count">race <b>{Math.min(no + 1, 3)}</b> of 3</div></div>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className="rd-event">
        <div className="rd-card"><img className="pixel-art" src={PX.race(race.race)} alt={race.race} width={56} height={56} /><span>{race.race}</span></div>
        <div className="rd-card rd-flag" style={{ background: TEAM_HEX[race.team] }}><img className="pixel-art" src={race.team === "zoo" ? PX.animal("lion") : PX.place("farm")} alt="" width={40} height={40} /><b>{race.team.toUpperCase()}</b></div>
        <div className={`rd-not ${race.not ? "on" : ""}`}>✖<span>NOT</span></div>
      </div>
      <div className="rd-track">
        <div className="rd-gate">{pass && <div key={idx} className="rd-runner">
          <img className="pixel-art" src={PX.animal(pass.animal)} alt={pass.animal} width={88} height={88} />
          <span className="rd-badge" style={{ background: TEAM_HEX[pass.team] }}><img className="pixel-art" src={pass.team === "zoo" ? PX.animal("lion") : PX.place("farm")} alt={pass.team} width={18} height={18} /></span>
        </div>}{cheer && <div className="rd-cheer">🏆</div>}</div>
      </div>
      {t0 === null ? <button className="submit-btn sb-start" onClick={() => { setT0(Date.now()); setNow(Date.now()); }}>START (when the Expert is ready)</button>
        : <button className="rd-go" onClick={go} disabled={won || cheer}>GO!</button>}
    </div>);
  };

  /* --- Expert --- */
  const AnimalRaceManual = () => {
    const [entry, setEntry] = useState(""), [entries, setEntries] = useState(null);
    const show = () => { const n = parseInt(entry, 10); if (n >= 1000 && n <= 9999) setEntries(makeEntries(n)); };
    return (<div>
      <p><strong>Ask:</strong> "What is the race number?" Write it here and press SHOW.</p>
      <div className="lr-start"><input inputMode="numeric" maxLength={4} value={entry} onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))} placeholder="0000" /><button onClick={show}>SHOW</button></div>
      {entries && <table className="manual-table rd-table"><thead><tr><th>Race</th><th>Zoo team</th><th>Farm team</th></tr></thead>
        <tbody>{RACES.map((r) => <tr key={r}><th>{r}</th>{TEAMS.map((t) => { const e = entries[r + "|" + t]; return <td key={t}>{e.animal} (other: {e.other})</td>; })}</tr>)}</tbody></table>}
      <div className="lr-rules">
        <p>1. Ask: "What is the race? What is the team?"</p>
        <p>2. Find the animal. Tell the Defuser: "The tiger! Zoo team!"</p>
        <p>3. Press GO when that animal is in the gate.</p>
        <p>4. If the NOT light is on, the first animal can <strong>not</strong> race. Press GO for the <strong>other</strong> animal.</p>
      </div>
    </div>);
  };

  const css = document.createElement("style");
  css.textContent = `
    .rd-count{font-size:0.75rem;color:#aaa;} .rd-count b{color:#fff;font-size:1.1rem;}
    .rd-event{display:flex;gap:6px;align-items:stretch;}
    .rd-card{flex:1;background:#f4ecd8;border:2px solid #7a5532;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px;}
    .rd-card span{font-weight:bold;color:#2a2018;}
    .rd-flag b{color:#fff;font-family:'Orbitron',sans-serif;text-shadow:0 1px 0 #000;}
    .rd-not{width:64px;border-radius:50%;background:#2a1010;color:#4a2020;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.6rem;border:3px solid #555;aspect-ratio:1;}
    .rd-not span{font-size:0.6rem;font-family:'Orbitron',sans-serif;}
    .rd-not.on{background:#ff2a2a;color:#fff;box-shadow:0 0 18px #ff2a2a;}
    .rd-track{margin:8px 0;height:130px;border-radius:6px;background:linear-gradient(#9fd6f5 0 55%,#5fb04a 55% 70%,#c9844a 70%);position:relative;overflow:hidden;}
    .rd-gate{position:absolute;left:50%;top:6px;transform:translateX(-50%);width:130px;height:118px;border:8px solid #f4f4f4;border-bottom:none;border-radius:60px 60px 0 0;box-shadow:inset 0 0 0 2px #1b1424;}
    .rd-runner{position:absolute;left:12px;bottom:0;animation:rdIn 0.35s ease-out;}
    @keyframes rdIn{from{transform:translateX(-140px);}to{transform:none;}}
    .rd-badge{position:absolute;right:-4px;bottom:6px;width:28px;height:28px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #1b1424;}
    .rd-cheer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;}
    .rd-go{width:100%;min-height:96px;font-size:2.4rem;font-family:'Orbitron',sans-serif;font-weight:900;background:#1f9e3a;color:#fff;border:4px solid #3bff6a;border-radius:12px;cursor:pointer;}
    .rd-go:disabled{opacity:0.5;}
    .rd-table td,.rd-table th{font-size:1rem;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "animalRace", name: "🏁 Animal Race Day", type: "animalRace", difficulty: "B1",
    Component: AnimalRaceModule, Manual: AnimalRaceManual,
    _test: Object.assign(TEST, { makeEntries, makeParade, target, NATURAL, GATE_MS }),
  });
})();
