/* ===== M03 WEATHER WARDROBE (A2+ tier: all seasons and weather, thermometer + switches, one change) =====
 * Design: docs/design/modules/M03_weather_wardrobe.md · Build spec: docs/design/modules/build/M03_build.md
 * The Defuser sees the window, tree and thermometer; the Expert has the dress code. Dress the mannequin,
 * set the window and fan, press DONE. Then the sky changes once: notice it, swap what changed, DONE again.
 */
(() => {
  const { useState, useEffect, useRef } = React;
  const TEST = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const SEASONS = ["spring", "summer", "fall", "winter"], WEATHERS = ["sunny", "cloudy", "rainy", "windy"];
  const TEMPS = ["hot", "warm", "cool", "cold"];
  const CLOSET = ["jacket", "coat", "shirt", "T-shirt", "jeans", "dress", "shorts", "skirt", "pants", "shoes", "socks"];
  const L = (s) => s.split(", ");
  // The dress code, word for word from the design doc.
  const TABLE = {
    spring: { sunny: L("shirt, skirt, shoes"), cloudy: L("shirt, jeans, shoes"), rainy: L("jacket, jeans, shoes"), windy: L("jacket, pants, socks, shoes") },
    summer: { sunny: L("T-shirt, shorts"), cloudy: L("T-shirt, skirt"), rainy: L("T-shirt, shorts, shoes"), windy: L("dress, shoes") },
    fall: { sunny: L("shirt, jeans, socks, shoes"), cloudy: L("jacket, pants, shoes"), rainy: L("coat, jeans, shoes"), windy: L("jacket, jeans, socks, shoes") },
    winter: { sunny: L("coat, pants, socks, shoes"), cloudy: L("coat, jeans, socks, shoes"), rainy: L("coat, pants, socks, shoes"), windy: L("coat, jacket, pants, socks, shoes") },
  };
  const FITS = { spring: ["warm", "cool"], summer: ["hot", "warm"], fall: ["cool", "warm"], winter: ["cold", "cool"] };

  const answer = (sky) => ({ outfit: TABLE[sky.season][sky.weather], window: sky.temp === "hot" || sky.temp === "warm", fan: sky.temp === "hot" });
  const key = (a) => [...a.outfit].sort().join() + `|${a.window}|${a.fan}`;

  const makeTemp = (season) => {
    if (Math.random() < 0.8) return pick(FITS[season]);
    const i = TEMPS.indexOf(pick(FITS[season])); return TEMPS[Math.max(0, Math.min(3, i + pick([-1, 1])))]; // a warm winter day, etc.
  };
  const makeSkies = () => {
    const season = pick(SEASONS), first = { season, weather: pick(WEATHERS), temp: makeTemp(season) };
    for (;;) { // the change keeps the season and changes the weather, the temperature, or both
      const what = pick(["weather", "temp", "both"]);
      const next = { ...first, ...(what !== "temp" ? { weather: pick(WEATHERS) } : {}), ...(what !== "weather" ? { temp: makeTemp(season) } : {}) };
      if (key(answer(next)) !== key(answer(first))) return [first, next];
    }
  };

  const ZONE = { jacket: "outer", coat: "outer", shirt: "top", "T-shirt": "top", dress: "top", jeans: "bottom", pants: "bottom", shorts: "bottom", skirt: "bottom", socks: "feet", shoes: "feet" };
  const beep = () => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)(); [0, 0.18].forEach((t, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = i ? 660 : 880; o.connect(g); g.connect(a.destination); g.gain.value = 0.08; o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.12); }); } catch (e) {} };

  /* --- Defuser --- */
  const WeatherWardrobeModule = ({ onSuccess, onStrike }) => {
    const [skies] = useState(makeSkies);
    const [stage, setStage] = useState(0);
    const [worn, setWorn] = useState([]);
    const [win, setWin] = useState(false);
    const [fan, setFan] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [chirp, setChirp] = useState(false);
    const [msg, setMsg] = useState(null);
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    const sky = skies[stage];
    TEST.skies = skies; // read by the test page
    const flash = (t) => { setMsg(t); setTimeout(() => setMsg((m) => (m === t ? null : m)), 1800); };

    const toggle = (item) => setWorn((w) => (w.includes(item) ? w.filter((x) => x !== item) : [...w, item]));
    const done = () => {
      if (waiting) return;
      const a = answer(sky);
      const ok = key(a) === key({ outfit: worn, window: win, fan });
      if (!ok) { onStrike(); return flash("Not right!"); }
      if (stage === skies.length - 1) { flash("Good job!"); return onSuccess(); }
      flash("Good! Wait…");
      setWaiting(true);
      // The sky changes a few seconds later. The bomb beeps but does not say what changed.
      timer.current = setTimeout(() => { setStage((s) => s + 1); setWaiting(false); setChirp(true); beep(); setTimeout(() => setChirp(false), 2500); }, 4000 + Math.random() * 4000);
    };

    const pinned = (zone) => worn.filter((i) => ZONE[i] === zone);
    return (<div className="module-content ww"><h3>🧥 WEATHER WARDROBE</h3>
      {msg && <div className="lr-msg">{msg}</div>}
      <div className={`ww-window ${chirp ? "shake" : ""}`}>
        <img className="pixel-art" src={PX.sky({ season: sky.season, weather: sky.weather })} alt="window" />
        <div className={`ww-pane l ${win ? "open" : ""}`} /><div className={`ww-pane r ${win ? "open" : ""}`} />
        {chirp && <div className="ww-beep">BEEP! BEEP!</div>}
      </div>
      <div className="ww-row">
        <div className="ww-thermo"><img className="pixel-art" src={PX.thermo(sky.temp)} alt="face" width={56} height={56} /><span>🌡</span></div>
        <button className={`ww-switch ${win ? "on" : ""}`} onClick={() => setWin(!win)}>WINDOW<b>{win ? "OPEN" : "CLOSED"}</b></button>
        <button className={`ww-switch ${fan ? "on" : ""}`} onClick={() => setFan(!fan)}><span className={`ww-fan ${fan ? "spin" : ""}`} />FAN<b>{fan ? "ON" : "OFF"}</b></button>
      </div>
      <div className="ww-dress">
        <div className="ww-mannequin">
          <img className="pixel-art" src={PX.mannequin()} alt="mannequin" width={96} height={168} />
          {[["outer", 34], ["top", 50], ["bottom", 92], ["feet", 138]].map(([z, top]) => (
            <div key={z} className={`ww-zone ${z}`} style={{ top }}>{pinned(z).map((i) => (
              <img key={i} className="pixel-art" src={PX.clothes(i)} alt={i} width={z === "outer" ? 40 : 44} height={z === "outer" ? 40 : 44} onClick={() => toggle(i)} />))}</div>))}
        </div>
        <div className="ww-closet">{CLOSET.map((i) => (
          <button key={i} className={`lr-item ${worn.includes(i) ? "worn" : ""}`} onClick={() => toggle(i)}>
            <img className="pixel-art" src={PX.clothes(i)} alt={i} width={40} height={40} /><span>{i}</span></button>))}</div>
      </div>
      <button className="submit-btn ww-done" onClick={done} disabled={waiting}>{waiting ? "WAIT…" : "DONE"}</button>
    </div>);
  };

  /* --- Expert --- */
  const WeatherWardrobeManual = () => (<div>
    <p><strong>Step 1. Ask:</strong> "What season is it? What is the weather?" (Look at the tree and the sky.)</p>
    <table className="manual-table ww-table"><thead><tr><th></th>{WEATHERS.map((w) => <th key={w}>{w[0].toUpperCase() + w.slice(1)}</th>)}</tr></thead>
      <tbody>{SEASONS.map((s) => (<tr key={s}><th>{s[0].toUpperCase() + s.slice(1)}</th>{WEATHERS.map((w) => <td key={w}>{TABLE[s][w].join(", ")}</td>)}</tr>))}</tbody></table>
    <p><strong>Step 2. Ask:</strong> "Is it hot or cold?" (Look at the face.)</p>
    <p>If it is <strong>hot</strong>, open the window and turn on the fan.</p>
    <p>If it is <strong>warm</strong>, open the window. Do not turn on the fan.</p>
    <p>If it is <strong>cool</strong> or <strong>cold</strong>, the window and the fan are off.</p>
    <p><strong>Step 3.</strong> Press DONE. Then the bomb says BEEP: the weather is new. Ask again! Put on and take off clothes. Press DONE again.</p>
  </div>);

  const css = document.createElement("style");
  css.textContent = `
    .ww-window{position:relative;border:6px solid #7a5532;border-radius:4px;overflow:hidden;perspective:300px;background:#000;}
    .ww-window>img{width:100%;display:block;}
    .ww-pane{position:absolute;top:0;bottom:0;width:50%;border:3px solid #9a6b3e;background:rgba(200,230,255,0.18);transition:transform 0.5s;}
    .ww-pane.l{left:0;transform-origin:left;} .ww-pane.r{right:0;transform-origin:right;}
    .ww-pane.l.open{transform:rotateY(70deg);} .ww-pane.r.open{transform:rotateY(-70deg);}
    .ww-window.shake{animation:wwShake 0.4s 3;}
    @keyframes wwShake{25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}
    .ww-beep{position:absolute;inset:auto 0 6px;text-align:center;font-family:'Orbitron',sans-serif;font-weight:900;color:#ff3b3b;text-shadow:0 0 6px #000;}
    .ww-row{display:flex;gap:6px;align-items:stretch;margin:6px 0;}
    .ww-thermo{background:#f4ecd8;border:2px solid #7a5532;border-radius:6px;display:flex;align-items:center;padding:2px 4px;}
    .ww-switch{flex:1;min-height:56px;background:#1a1a2e;border:2px solid #444;border-radius:6px;color:#ccc;font-family:'Orbitron',sans-serif;font-size:0.65rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;}
    .ww-switch b{font-size:0.8rem;color:#888;} .ww-switch.on{border-color:#3bff6a;} .ww-switch.on b{color:#3bff6a;}
    .ww-fan{width:22px;height:22px;border-radius:50%;background:conic-gradient(#9ab 0 60deg,transparent 0 120deg,#9ab 0 180deg,transparent 0 240deg,#9ab 0 300deg,transparent 0);}
    .ww-fan.spin{animation:wwSpin 0.4s linear infinite;} @keyframes wwSpin{to{transform:rotate(360deg);}}
    .ww-dress{display:flex;gap:6px;}
    .ww-mannequin{position:relative;width:104px;flex:none;background:#d8ecf7;border-radius:6px;padding:4px;}
    .ww-mannequin>img{display:block;margin:0 auto;}
    .ww-zone{position:absolute;left:0;right:0;display:flex;justify-content:center;}
    .ww-zone img{cursor:pointer;filter:drop-shadow(0 1px 0 #0006);}
    .ww-zone.outer{justify-content:space-between;padding:0 0;}
    .ww-closet{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:3px;}
    .ww-closet .worn{opacity:0.35;}
    .ww-done{width:100%;margin-top:8px;min-height:48px;}
    .ww-table td,.ww-table th{font-size:0.95rem;}
  `;
  document.head.appendChild(css);

  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push({
    id: "weatherWardrobe", name: "🧥 Weather Wardrobe", type: "weatherWardrobe", difficulty: "A2",
    Component: WeatherWardrobeModule, Manual: WeatherWardrobeManual,
    _test: Object.assign(TEST, { TABLE, answer, key, makeSkies }),
  });
})();
