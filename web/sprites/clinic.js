/* ===== MONSTER CLINIC PATIENT — M11 =====
 * PX.patient(m) -> { url, w, h, parts: [{ id, x, y, w, h }] }   (parts in canvas pixels, smallest last)
 *   m = { skin: "green-spots"|"blue"|"pink"|"purple"|"yellow", heads: [{ eyes, ears, noses, hair }], hands, legs }
 * Every counted part is placed by code from the data, so the counts are always exact.
 * Part ids follow the build spec: h{n}-eye{k}, h{n}-ear{k}, h{n}-nose{k}, h{n}-mouth, h{n}-hair, h{n}-head, h{n}-face, hand{k}, leg{k}.
 */
(function () {
  const RAMP = {
    "green-spots": { 3: "#bdee90", 1: "#6cc24a", 2: "#3f8f3a", 4: "#265c29" }, blue: { 3: "#a8d8ff", 1: "#5aa0e8", 2: "#3a72b8", 4: "#24497c" },
    pink: { 3: "#ffd0e4", 1: "#f59ab8", 2: "#c96d8d", 4: "#8a4560" }, purple: { 3: "#dcaaf4", 1: "#a65bd6", 2: "#773aa6", 4: "#4c2170" },
    yellow: { 3: "#fff3a8", 1: "#f2d45c", 2: "#c9a52f", 4: "#8a6e1a" },
  };
  const HAIR = { black: { 3: "#5a5a70", 1: "#2d2d3a", 2: "#1f1f29", 4: "#121218" }, brown: { 3: "#b47c4a", 1: "#8b5a2b", 2: "#6a4220", 4: "#4a2c14" },
    red: { 3: "#ff9a6a", 1: "#d9532c", 2: "#a83c1d", 4: "#702612" }, purple: { 3: "#e8b8ff", 1: "#b06ae0", 2: "#8048b0", 4: "#552e75" }, yellow: { 3: "#fff3a8", 1: "#f2d45c", 2: "#d1ad35", 4: "#9c7d1e" } };
  const cache = new Map();

  PX.patient = (m) => {
    const key = JSON.stringify(m);
    if (cache.has(key)) return cache.get(key);
    const n = m.heads.length, W = Math.max(n * 50 + 10, 84), H = 100, S = PX.shapes(W, H), MID = W / 2;
    const skin = RAMP[m.skin], face = { 3: "#ffffff", 1: skin[3], 2: skin[1], 4: skin[2] };
    const layers = [], parts = [], id = "pt" + cache.size;
    const L = (name, draw, ramp, opts = {}) => { const g = S.grid(); draw(g); layers.push({ sprite: S.lit(`${id}-${name}`, g, opts), remap: ramp, ring: opts.ring }); };
    const D = (name, pts) => { const rows = Array.from({ length: H }, () => Array(W).fill(".")); pts.forEach(([x, y, k]) => { x = Math.round(x); y = Math.round(y); if (rows[y] && x >= 0 && x < W) rows[y][x] = k; }); layers.push({ sprite: PX.sprite(`${id}-${name}`, rows.map((r) => r.join(""))) }); };
    const P = (pid, x, y, w, h) => parts.push({ id: pid, x: x - w / 2, y: y - h / 2, w, h });

    const heads = m.heads.map((hd, i) => ({ ...hd, i: i + 1, cx: MID + (i - (n - 1) / 2) * 50, cy: 26 }));
    const bodyRx = Math.max(22, n * 17), bodyY = 64;

    // Legs and arms (behind the body).
    const legX = (k) => MID + (k - (m.legs - 1) / 2) * Math.min(10, (bodyRx * 1.6) / m.legs);
    L("legs", (g) => { for (let k = 0; k < m.legs; k++) { S.rect(g, Math.round(legX(k) - 2), bodyY + 12, 5, 14); S.ellipse(g, legX(k), bodyY + 26, 4, 2); } }, skin, { ring: true });
    const handPos = Array.from({ length: m.hands }, (_, k) => { const left = k % 2 === 0, row = Math.floor(k / 2); return [left ? MID - bodyRx - 9 : MID + bodyRx + 9, bodyY - 6 + row * 13, left]; });
    L("arms", (g) => handPos.forEach(([x, y, left]) => { S.stroke(g, [[left ? x + 9 : x - 9, y + 2, 2.6], [x, y, 2.4]]); S.disc(g, x, y, 4); }), skin, { ring: true });
    L("body", (g) => S.ellipse(g, MID, bodyY, bodyRx, 19), skin, { ring: true });
    // Ears behind each head: left, right, top-left.
    const earPos = (h) => [[h.cx - 19, h.cy + 1], [h.cx + 19, h.cy + 1], [h.cx - 13, h.cy - 15]].slice(0, h.ears);
    L("ears", (g) => heads.forEach((h) => earPos(h).forEach(([x, y]) => S.disc(g, x, y, 4.5))), skin, { ring: true });
    L("heads", (g) => heads.forEach((h) => S.disc(g, h.cx, h.cy, 18)), skin, { ring: true });
    L("faces", (g) => heads.forEach((h) => S.ellipse(g, h.cx, h.cy + 4, 13, 11)), face, { soft: true });
    // Spots: a sick monster has a green face with spots.
    if (m.skin === "green-spots") D("spots", heads.flatMap((h) => [[-9, 0], [8, 9], [-6, 11], [10, -1], [-12, -8], [12, -9], [0, -14]].map(([dx, dy]) => [h.cx + dx, h.cy + dy, "V"]))
      .concat([[-12, 0], [8, 4], [-3, 9], [14, -6], [-16, 8], [3, -10]].flatMap(([dx, dy]) => [[MID + dx, bodyY + dy, "V"], [MID + dx + 1, bodyY + dy, "V"]])));
    // Hair: a tuft on top of the head.
    heads.forEach((h) => { if (h.hair) L("hair" + h.i, (g) => [[-6, -17, 4], [0, -19, 4.5], [6, -17, 4]].forEach(([dx, dy, r]) => S.disc(g, h.cx + dx, h.cy + dy, r)), HAIR[h.hair], { ring: true }); });
    // Eyes (5×5, up to two rows), noses, mouths.
    const pts = [];
    heads.forEach((h) => {
      const row1 = Math.min(3, h.eyes), row2 = h.eyes - row1;
      const eyes = [...Array(row1)].map((_, k) => [h.cx + (k - (row1 - 1) / 2) * 7, h.cy - (row2 ? 3 : 0)]).concat([...Array(row2)].map((_, k) => [h.cx + (k - (row2 - 1) / 2) * 7, h.cy + 3]));
      h.eyePos = eyes;
      eyes.forEach(([x, y]) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { if (Math.abs(dx) === 2 && Math.abs(dy) === 2) continue; const edge = Math.abs(dx) === 2 || Math.abs(dy) === 2; pts.push([x + dx, y + dy, edge ? "K" : Math.abs(dx) + Math.abs(dy) <= 1 && dx >= 0 ? "K" : "W"]); } pts.push([x - 1, y - 1, "W"]); });
      h.nosePos = h.noses === 2 ? [[h.cx - 3, h.cy + 8], [h.cx + 3, h.cy + 8]] : [[h.cx, h.cy + 8]];
      h.nosePos.forEach(([x, y]) => [[-1, 0], [0, 0], [1, 0], [0, 1]].forEach(([dx, dy]) => pts.push([x + dx, y + dy, "N"])));
      for (let dx = -4; dx <= 4; dx++) pts.push([h.cx + dx, h.cy + 12 + (Math.abs(dx) === 4 ? -1 : 0), "R"]);
      for (let dx = -2; dx <= 2; dx++) pts.push([h.cx + dx, h.cy + 13, "h"]);
    });
    D("features", pts);

    // Tap targets, biggest first so the smallest part wins where they overlap.
    m.legs && [...Array(m.legs)].forEach((_, k) => P(`leg${k + 1}`, legX(k), bodyY + 20, 9, 16));
    handPos.forEach(([x, y], k) => P(`hand${k + 1}`, x, y, 11, 11));
    heads.forEach((h) => P(`h${h.i}-head`, h.cx, h.cy - 4, 36, 30));
    heads.forEach((h) => P(`h${h.i}-face`, h.cx, h.cy + 4, 26, 22));
    heads.forEach((h) => { if (h.hair) P(`h${h.i}-hair`, h.cx, h.cy - 19, 20, 9); });
    heads.forEach((h) => earPos(h).forEach(([x, y], k) => P(`h${h.i}-ear${k + 1}`, x, y, 10, 10)));
    heads.forEach((h) => { P(`h${h.i}-mouth`, h.cx, h.cy + 12.5, 11, 5); h.nosePos.forEach(([x, y], k) => P(`h${h.i}-nose${k + 1}`, x, y + 0.5, 6, 5)); h.eyePos.forEach(([x, y], k) => P(`h${h.i}-eye${k + 1}`, x, y, 7, 6.5)); });

    const out = { url: PX.render(W, H, layers), w: W, h: H, parts };
    cache.set(key, out);
    return out;
  };

  const pad = (rows) => { while (rows.length < 16) rows.push("................"); return rows; };
  const TOOLS = {
    "cold-pack": pad(["................", "................", "...cccccccccc...", "..ccWcccccWccc..", "..cccWcccWcccC..", "..ccccWcWccccC..",
      "..cWWWWWWWWWcC..", "..ccccWcWccccC..", "..cccWcccWcccC..", "..ccWcccccWccC..", "...CCCCCCCCCC..."]),
    "hot-bag": pad(["....W...W.......", ".....W...W......", "....W...W.......", "......nnn.......", ".....rrrrr......", "....rrrrrrr.....",
      "...rrrWrrrrrR...", "...rrrrrrrrrR...", "...rrrrrrrrrR...", "...rrrrrrrrRR...", "....rrrrrrRR....", ".....RRRRRR....."]),
  };
  const TS = Object.fromEntries(Object.entries(TOOLS).map(([k, r]) => [k, PX.sprite("tool-" + k, r)]));
  PX.tool = (name) => PX.render(16, 16, [{ sprite: TS[name] }]);
})();
