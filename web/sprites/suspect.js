/* ===== SUSPECT SPRITES — M21 Lineup =====
 * PX.suspect({ height, hair, hairLen, build, eye, outfit }) -> data URL (40×80, feet on the bottom row)
 *   height:  "tall" | "short"                      (drawn, not scaled: tall is ~16px taller)
 *   hair:    "white" | "blond" | "lightbrown" | "black"   (the first three are LIGHT hair, black is DARK)
 *   hairLen: "long" | "short"                      (long hangs past the shoulders)
 *   build:   "fat" | "thin"
 *   eye:     "blue" | "brown"                      (big eyes so the color reads at a glance)
 *   outfit:  0-3, shirt color (decoration only)
 */
(function () {
  const W = 40, H = 80, CX = 19.5, FLOOR = 78;
  const S = PX.shapes(W, H);
  const RAMP = {
    skin:       { 3: "#ffe2c6", 1: "#f4c49a", 2: "#d9996b", 4: "#a96a43" },
    black:      { 3: "#4a4a5e", 1: "#24242f", 2: "#1a1a22", 4: "#0e0e14" },
    white:      { 3: "#ffffff", 1: "#eef0f3", 2: "#cfd4db", 4: "#a9b0ba" },
    blond:      { 3: "#fff3a8", 1: "#f2d45c", 2: "#d1ad35", 4: "#9c7d1e" },
    lightbrown: { 3: "#f0cf9c", 1: "#d6a86a", 2: "#b8874c", 4: "#8a6232" },
    pants:      { 3: "#8a8f9c", 1: "#5f6472", 2: "#474b57", 4: "#30333c" },
    shoe:       { 3: "#6a5040", 1: "#3e2c22", 2: "#2c1f18", 4: "#1b130e" },
  };
  const OUTFITS = [
    { 3: "#ff9d9d", 1: "#e85a5a", 2: "#bb3e46", 4: "#842a33" },
    { 3: "#9fe8dc", 1: "#3fb8a6", 2: "#2a8c7e", 4: "#1a5f55" },
    { 3: "#ffd08f", 1: "#f39a3a", 2: "#c26f22", 4: "#874a14" },
    { 3: "#d1a8f0", 1: "#a46ad6", 2: "#7d48a8", 4: "#552e75" },
  ];
  const IRIS = { blue: "#2f7cf0", brown: "#7a4a22" };

  const dots = (name, pts, remap) => {
    const rows = Array.from({ length: H }, () => Array(W).fill("."));
    pts.forEach(([x, y, k]) => { x = Math.round(x); y = Math.round(y); if (rows[y] && x >= 0 && x < W) rows[y][x] = k; });
    return { sprite: PX.sprite(name, rows.map((r) => r.join(""))), remap };
  };

  const cache = new Map();
  PX.suspect = (t) => {
    const key = JSON.stringify(t);
    if (cache.has(key)) return cache.get(key);
    const id = "sus" + cache.size, layers = [];
    const L = (name, draw, ramp, opts = {}) => { const g = S.grid(); draw(g); layers.push({ sprite: S.lit(`${id}-${name}`, g, opts), remap: ramp, ring: opts.ring }); };
    const tall = t.height === "tall", fat = t.build === "fat", long = t.hairLen === "long";
    const hairRamp = RAMP[t.hair] || RAMP.black, shirt = OUTFITS[(t.outfit || 0) % 4];
    const legH = tall ? 28 : 18, bodyH = tall ? 20 : 16, hr = 8;
    const bodyW = fat ? 30 : 12, legW = fat ? 7 : 4;
    const legsTop = FLOOR + 1 - legH, bodyTop = legsTop - bodyH, hy = bodyTop - hr + 2, headTop = Math.round(hy - hr);
    const x0 = Math.round(CX - bodyW / 2), x1 = x0 + bodyW - 1;

    // Long hair hangs behind the head, down past the shoulders.
    if (long) L("hairback", (q) => S.roundRect(q, Math.round(CX - hr - 3), headTop - 1, Math.round(hr * 2 + 7), Math.round(hr * 2 + bodyH + 2), 4), hairRamp);
    const legL = Math.round(CX - 1 - legW), legR = Math.round(CX + 1);
    L("legs", (q) => { S.rect(q, legL, legsTop, legW, legH - 2); S.rect(q, legR, legsTop, legW, legH - 2); }, RAMP.pants, { soft: true });
    L("shoes", (q) => { S.rect(q, legL - 1, FLOOR - 1, legW + 1, 2); S.rect(q, legR, FLOOR - 1, legW + 1, 2); }, RAMP.shoe, { soft: true });
    L("body", (q) => S.roundRect(q, x0, bodyTop, bodyW, bodyH + 1, fat ? 6 : 3), shirt, { ring: true });
    const armLen = bodyH - 2, ax0 = x0 - 3, ax1 = x1 + 1;
    L("arms", (q) => { S.roundRect(q, ax0, bodyTop + 2, 3, armLen, 1); S.roundRect(q, ax1, bodyTop + 2, 3, armLen, 1); }, shirt, { ring: true, soft: true });
    L("hands", (q) => { S.disc(q, ax0 + 1, bodyTop + armLen + 2, 1.6); S.disc(q, ax1 + 1, bodyTop + armLen + 2, 1.6); }, RAMP.skin, { soft: true });
    L("head", (q) => S.disc(q, CX, hy, hr), RAMP.skin, { ring: true });

    // Eyes: 3×3 white with a 2×2 iris in the eye color and a pupil, so blue / brown reads even small.
    const iris = "5";
    const eye = (cx) => [
      [cx - 1, hy, "W"], [cx, hy, iris], [cx + 1, hy, iris],
      [cx - 1, hy + 1, "W"], [cx, hy + 1, iris], [cx + 1, hy + 1, "K"],
      [cx - 1, hy - 1, "K"], [cx, hy - 1, "K"], [cx + 1, hy - 1, "K"],
    ];
    layers.push(dots(`${id}-face`, [...eye(CX - 4), ...eye(CX + 3),
      [CX, hy + 3, "S"], [CX - 2, hy + 5, "R"], [CX - 1, hy + 5, "R"], [CX, hy + 5, "R"], [CX + 1, hy + 5, "R"]], { 5: IRIS[t.eye] }));

    // Hair on top: a cap with sideburns; long hair also falls in front of the shoulders.
    L("hair", (q) => {
      for (let y = headTop - 1; y <= hy - 3; y++) for (let x = CX - hr - 1; x <= CX + hr + 1; x++)
        if ((x - CX) ** 2 + (y - hy) ** 2 <= (hr + 1) ** 2) S.set(q, x, y);
      if (long) { S.rect(q, Math.round(CX - hr - 2), hy - 3, 3, hr + bodyH - 2); S.rect(q, Math.round(CX + hr), hy - 3, 3, hr + bodyH - 2); }
      else { S.rect(q, Math.round(CX - hr - 1), hy - 3, 2, 3); S.rect(q, Math.round(CX + hr), hy - 3, 2, 3); }
    }, hairRamp, { ring: true });

    const url = PX.render(W, H, layers);
    cache.set(key, url);
    return url;
  };
  PX.suspect.size = { w: W, h: H };
})();
