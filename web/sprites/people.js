/* ===== PEOPLE SPRITES — a parts kit for M01 Family Photo (and later people modules) =====
 * PX.person({ look, height, size, build, hair, job, item, outfit }) -> data URL (52×64, feet on the bottom row)
 *   look:   "old-man" | "old-woman" | "man" | "woman" | "boy" | "girl" | "baby"
 *   height: "tall" | "short"   (old-man, old-woman, man, woman)
 *   size:   "big" | "small"    (boy, girl, baby)
 *   build:  "thin" | "fat"     (not baby)
 *   hair:   "black" | "brown" | "gray" | "white"   (not baby)
 *   job:    "doctor" | "nurse" | "teacher" | "student" | "singer" | "farmer" | "none"
 *   item:   "none" | "new-hat" | "old-hat" | "new-bookbag" | "old-bookbag" | "big-ball" | "small-ball" | "big-dog" | "small-dog"
 *   outfit: 0-3, casual clothes color when the job has no uniform (decoration only)
 * Stacked back to front: hair (back) -> bookbag -> legs -> body -> arms -> head -> face -> hair -> hat -> props -> dog.
 */
(function () {
  const W = 52, H = 64, CX = 20, FLOOR = 62;
  const S = PX.shapes(W, H);

  const RAMP = {
    skin:   { 3: "#ffe2c6", 1: "#f4c49a", 2: "#d9996b", 4: "#a96a43" },
    black:  { 3: "#5a5a70", 1: "#2d2d3a", 2: "#1f1f29", 4: "#121218" },
    brown:  { 3: "#b47c4a", 1: "#8b5a2b", 2: "#6a4220", 4: "#4a2c14" },
    gray:   { 3: "#cfd2d8", 1: "#a2a7af", 2: "#80858e", 4: "#5f646d" },
    white:  { 3: "#ffffff", 1: "#eef0f3", 2: "#cfd4db", 4: "#a9b0ba" },
    coat:   { 3: "#ffffff", 1: "#f2f4f7", 2: "#cdd3dc", 4: "#9aa3b0" },
    nurse:  { 3: "#d6f0ff", 1: "#9fd6f5", 2: "#6fb2dc", 4: "#4a86b0" },
    navy:   { 3: "#5a6fb0", 1: "#34457e", 2: "#26345f", 4: "#182240" },
    farm:   { 3: "#a7d77e", 1: "#6f9f45", 2: "#4f7a30", 4: "#355420" },
    denim:  { 3: "#7b9fd6", 1: "#4c6fae", 2: "#38548a", 4: "#253a62" },
    slacks: { 3: "#8a8f9c", 1: "#5f6472", 2: "#474b57", 4: "#30333c" },
    shoe:   { 3: "#6a5040", 1: "#3e2c22", 2: "#2c1f18", 4: "#1b130e" },
    straw:  { 3: "#fff0a8", 1: "#f2d266", 2: "#cfa83f", 4: "#9a7a26" },
    newHat: { 3: "#ff9a9a", 1: "#e83b3b", 2: "#b8262e", 4: "#7e1620" },
    oldHat: { 3: "#b9a68c", 1: "#8f7c62", 2: "#6f5f4a", 4: "#4e4334" },
    newBag: { 3: "#8fd0ff", 1: "#2e8fe6", 2: "#1f6cb4", 4: "#14497c" },
    oldBag: { 3: "#a99a82", 1: "#7f705a", 2: "#625646", 4: "#443b30" },
    dog:    { 3: "#e8c08a", 1: "#c48a4c", 2: "#9a6634", 4: "#6a4220" },
    ball:   { 3: "#ffffff", 1: "#f04f4f", 2: "#c43636", 4: "#8a2222" },
    cane:   { 3: "#b07a4a", 1: "#7a4f28", 2: "#5a3818", 4: "#3a240e" },
    baby:   { 3: "#fff4fb", 1: "#ffd3ea", 2: "#f0a9cd", 4: "#c97aa3" },
  };
  const OUTFITS = [
    { 3: "#ff9d9d", 1: "#e85a5a", 2: "#bb3e46", 4: "#842a33" },
    { 3: "#d1a8f0", 1: "#a46ad6", 2: "#7d48a8", 4: "#552e75" },
    { 3: "#ffd08f", 1: "#f39a3a", 2: "#c26f22", 4: "#874a14" },
    { 3: "#9fe8dc", 1: "#3fb8a6", 2: "#2a8c7e", 4: "#1a5f55" },
  ];

  const ADULT = ["old-man", "old-woman", "man", "woman"];
  const isOld = (l) => l === "old-man" || l === "old-woman";
  const isFemale = (l) => l === "woman" || l === "old-woman" || l === "girl";

  // Body measurements from the code traits, so tall/short and big/small are drawn, not scaled.
  const geom = (t) => {
    const adult = ADULT.includes(t.look);
    const tall = adult ? t.height === "tall" : t.size === "big";
    const legH = adult ? (tall ? 20 : 13) : (tall ? 11 : 7);
    const bodyH = adult ? (tall ? 16 : 14) : (tall ? 11 : 9);
    const headR = adult ? 6 : (tall ? 5.5 : 5);
    const bodyW = adult ? (t.build === "fat" ? 20 : 12) : (t.build === "fat" ? 15 : 10);
    const legW = adult ? (t.build === "fat" ? 6 : 4) : (t.build === "fat" ? 5 : 3);
    const legsTop = FLOOR + 1 - legH, bodyTop = legsTop - bodyH, headCy = bodyTop - headR + 1;
    const x0 = Math.round(CX - bodyW / 2), x1 = x0 + bodyW - 1;
    return { adult, legH, bodyH, headR, bodyW, legW, legsTop, bodyTop, headCy, x0, x1 };
  };

  const dots = (name, pts) => {
    const rows = Array.from({ length: H }, () => Array(W).fill("."));
    pts.forEach(([x, y, k]) => { x = Math.round(x); y = Math.round(y); if (rows[y] && x >= 0 && x < W) rows[y][x] = k; });
    return PX.sprite(name, rows.map((r) => r.join("")));
  };
  const sparkle = (x, y) => [[x, y, "W"], [x - 1, y, "W"], [x + 1, y, "W"], [x, y - 1, "W"], [x, y + 1, "W"]];

  const build = (t, id) => {
    const g = geom(t), layers = [];
    const L = (name, draw, ramp, opts = {}) => {
      const grid = S.grid(); draw(grid);
      layers.push({ sprite: S.lit(`${id}-${name}`, grid, opts), remap: ramp, ring: opts.ring });
    };
    const D = (name, pts) => layers.push({ sprite: dots(`${id}-${name}`, pts) });
    const hairRamp = RAMP[t.hair] || RAMP.black;
    const clothes = { doctor: RAMP.coat, nurse: RAMP.nurse, student: RAMP.navy, farmer: RAMP.farm }[t.job] || OUTFITS[(t.outfit || 0) % 4];
    const female = isFemale(t.look), old = isOld(t.look);
    const hy = g.headCy, hr = g.headR, headTop = Math.round(hy - hr);

    if (t.look === "baby") return buildBaby(t, id, L, D);

    // Hair (back): long hair for women and girls, hanging to the shoulders.
    if (female && t.look !== "old-woman") L("hairback", (q) => S.roundRect(q, Math.round(CX - hr - 1.5), headTop, Math.round(hr * 2 + 3), Math.round(hr * 2 + 4), 3), hairRamp);

    // Bookbag sticks out on both sides behind the body.
    if (t.item === "new-bookbag" || t.item === "old-bookbag")
      L("bag", (q) => S.roundRect(q, g.x0 - 4, g.bodyTop - 4, g.bodyW + 8, g.bodyH + 3, 3), t.item === "new-bookbag" ? RAMP.newBag : RAMP.oldBag, { ring: true });

    // Legs: trousers for men and boys (skin legs under a dress for women and girls), shoes on the bottom.
    const legL = Math.round(CX - 1 - g.legW), legR = Math.round(CX + 1);
    L("legs", (q) => { S.rect(q, legL, g.legsTop, g.legW, g.legH - 2); S.rect(q, legR, g.legsTop, g.legW, g.legH - 2); },
      female ? RAMP.skin : (t.job === "doctor" ? RAMP.slacks : RAMP.denim), { soft: true });
    L("shoes", (q) => { S.rect(q, legL - 1, FLOOR - 1, g.legW + 1, 2); S.rect(q, legR, FLOOR - 1, g.legW + 1, 2); }, RAMP.shoe, { soft: true });

    // Body: a shirt, or a flared dress for women and girls.
    L("body", (q) => {
      S.roundRect(q, g.x0, g.bodyTop, g.bodyW, g.bodyH + 1, g.adult ? 3 : 2);
      if (female) for (let y = 0; y < Math.round(g.legH * 0.45); y++) S.rect(q, g.x0 - Math.floor(y / 2), g.legsTop + y, g.bodyW + 2 * Math.floor(y / 2), 1);
      if (t.job === "doctor") S.rect(q, g.x0, g.legsTop, g.bodyW, 3); // coat tail
    }, clothes, { ring: true });

    // Arms: sleeves at the sides, hands at the ends.
    const armLen = g.bodyH - 2, ax0 = g.x0 - 3, ax1 = g.x1 + 1;
    L("arms", (q) => { S.roundRect(q, ax0, g.bodyTop + 1, 3, armLen, 1); S.roundRect(q, ax1, g.bodyTop + 1, 3, armLen, 1); }, clothes, { ring: true, soft: true });
    const handY = g.bodyTop + armLen + 1, handL = [ax0 + 1, handY], handR = [ax1 + 1, handY];
    L("hands", (q) => { S.disc(q, handL[0], handL[1], 1.6); S.disc(q, handR[0], handR[1], 1.6); }, RAMP.skin, { soft: true });

    // Head and face.
    L("head", (q) => S.disc(q, CX, hy, hr), RAMP.skin, { ring: true });
    const face = [[CX - 2.5, hy, "K"], [CX + 2, hy, "K"], [CX - 1, hy + 3, "R"], [CX, hy + 3, "R"], [CX + 1, hy + 3, "R"], [CX - 2, hy + 2, "R"], [CX + 2, hy + 2, "R"]];
    if (old) face.push([CX - 4, hy - 1, "S"], [CX + 4, hy - 1, "S"], [CX - 4, hy + 1, "S"], [CX + 4, hy + 1, "S"]); // wrinkles
    if (t.look === "old-man") face.push([CX - 2, hy + 2, "g"], [CX - 1, hy + 2, "g"], [CX, hy + 2, "g"], [CX + 1, hy + 2, "g"]); // moustache
    D("face", face);

    // Hair (front): a cap over the top of the head; old women get a bun.
    L("hair", (q) => {
      for (let y = headTop - 1; y <= hy - 2; y++) for (let x = CX - hr - 1; x <= CX + hr + 1; x++)
        if ((x - CX) ** 2 + (y - hy) ** 2 <= (hr + 0.8) ** 2) S.set(q, x, y);
      S.rect(q, Math.round(CX - hr - 0.5), hy - 2, 2, 3); S.rect(q, Math.round(CX + hr - 1), hy - 2, 2, 3); // sideburns
      if (t.look === "old-woman") S.disc(q, CX, headTop - 2, 3);
    }, hairRamp, { ring: true });

    // Hats: farmer's straw hat (job), or a new / old cap (item).
    if (t.job === "farmer") L("straw", (q) => { S.ellipse(q, CX, headTop + 1, hr + 5, 1.6); S.roundRect(q, Math.round(CX - hr + 1), headTop - 4, Math.round(hr * 2 - 1), 5, 2); }, RAMP.straw, { ring: true });
    if (t.item === "new-hat" || t.item === "old-hat") {
      const isNew = t.item === "new-hat";
      L("hat", (q) => { S.roundRect(q, Math.round(CX - hr), headTop - 3, Math.round(hr * 2 + 1), 5, 2); S.rect(q, Math.round(CX - 1), headTop + 1, Math.round(hr + 5), 2); }, isNew ? RAMP.newHat : RAMP.oldHat, { ring: true });
      D("hat-mark", isNew
        ? [...sparkle(CX - hr - 3, headTop - 3), ...sparkle(CX + hr + 3, headTop - 5), [CX + hr + 4, headTop + 3, "y"], [CX + hr + 4, headTop + 4, "y"], [CX + hr + 5, headTop + 4, "y"], [CX + hr + 4, headTop + 2, "K"]]
        : [[CX - 3, headTop - 2, "y"], [CX - 2, headTop - 2, "y"], [CX - 3, headTop - 1, "y"], [CX - 2, headTop - 1, "Y"], [CX - 1, headTop, "K"], [CX - 4, headTop - 3, "K"], [CX + 2, headTop - 2, "K"], [CX + 3, headTop - 1, "K"], [CX + 4, headTop - 2, "K"]]);
    }
    if (t.job === "nurse") {
      L("cap", (q) => S.rect(q, Math.round(CX - 3), headTop - 3, 7, 3), RAMP.coat, { ring: true });
      D("cross", [[CX, headTop - 3, "r"], [CX, headTop - 2, "r"], [CX, headTop - 1, "r"], [CX - 1, headTop - 2, "r"], [CX + 1, headTop - 2, "r"]]);
    }

    // Job props.
    if (t.job === "doctor") D("steth", [
      ...[...Array(5)].map((_, i) => [CX - 3, g.bodyTop + i, "K"]), ...[...Array(5)].map((_, i) => [CX + 3, g.bodyTop + i, "K"]),
      [CX - 2, g.bodyTop + 5, "K"], [CX + 2, g.bodyTop + 5, "K"], [CX - 1, g.bodyTop + 6, "K"], [CX, g.bodyTop + 6, "K"], [CX + 1, g.bodyTop + 6, "K"],
      [CX, g.bodyTop + 7, "g"], [CX - 1, g.bodyTop + 8, "g"], [CX, g.bodyTop + 8, "G"], [CX + 1, g.bodyTop + 8, "g"],
    ]);
    if (t.job === "student") D("collar", [[CX - 2, g.bodyTop, "W"], [CX - 1, g.bodyTop + 1, "W"], [CX + 2, g.bodyTop, "W"], [CX + 1, g.bodyTop + 1, "W"], [CX, g.bodyTop + 2, "r"], [CX, g.bodyTop + 3, "r"]]);
    if (t.job === "teacher") {
      L("book", (q) => S.rect(q, handR[0], handR[1] - 6, 6, 7), RAMP.newHat, { ring: true });
      D("pages", [...[...Array(5)].map((_, i) => [handR[0] + 5, handR[1] - 5 + i, "W"]), [handL[0], handL[1] + 2, "W"], [handL[0], handL[1] + 3, "W"], [handL[0], handL[1] + 4, "W"]]);
    }
    if (t.job === "singer") {
      L("mic", (q) => { S.rect(q, handR[0], handR[1] - 5, 2, 6); S.disc(q, handR[0] + 0.5, handR[1] - 8, 3); }, RAMP.black, { ring: true });
      D("mic-shine", [[handR[0] - 1, handR[1] - 9, "W"], [handR[0], handR[1] - 10, "W"], [handR[0] - 1, handR[1] - 8, "g"], [handR[0] + 1, handR[1] - 9, "g"], [handR[0], handR[1] - 7, "g"], [handR[0] + 2, handR[1] - 8, "g"]]);
    }
    if (t.item === "new-bookbag" || t.item === "old-bookbag") {
      const straps = [...Array(g.bodyH - 2)].flatMap((_, i) => [[g.x0 + 2, g.bodyTop + 1 + i, "K"], [g.x1 - 2, g.bodyTop + 1 + i, "K"]]);
      D("straps", t.item === "new-bookbag"
        ? [...straps, ...sparkle(g.x0 - 5, g.bodyTop - 1), [g.x1 + 4, g.bodyTop + 3, "y"], [g.x1 + 4, g.bodyTop + 4, "y"]]
        : [...straps, ...[[g.x0 - 3, g.bodyTop - 2], [g.x1 + 1, g.bodyTop + 2]].flatMap(([x, y]) => [[x, y, "y"], [x + 1, y, "y"], [x, y + 1, "y"], [x + 1, y + 1, "Y"], [x + 2, y + 2, "K"], [x - 1, y - 1, "K"]])]);
    }

    // Old people walk with a cane in the left hand.
    if (old) L("cane", (q) => { S.rect(q, handL[0] - 2, handL[1] - 1, 2, FLOOR - handL[1] + 1); S.rect(q, handL[0] - 2, handL[1] - 2, 4, 2); }, RAMP.cane, { ring: true, soft: true });

    // Balls sit on the floor on the left; dogs sit on the right.
    if (t.item === "big-ball") { L("ball", (q) => S.disc(q, 6, FLOOR - 5, 5.5), RAMP.ball, { ring: true }); D("stripe", [...Array(9)].map((_, i) => [2 + i, FLOOR - 5, "W"])); }
    if (t.item === "small-ball") L("ball", (q) => S.disc(q, 7, FLOOR - 2, 2.2), RAMP.ball, { ring: true });
    if (t.item === "big-dog" || t.item === "small-dog") dog(t.item === "big-dog", L, D);
    return layers;
  };

  const dog = (big, L, D) => {
    const k = big ? 1 : 0.5, bx = big ? 41 : 39, by = FLOOR - Math.round(8 * k) - 2;
    L("dog", (q) => {
      S.ellipse(q, bx, by, 8 * k, 5 * k);                                     // body
      S.disc(q, bx - 8 * k, by - 5 * k, 4.5 * k);                             // head
      S.rect(q, Math.round(bx - 6 * k), by, Math.max(2, Math.round(2 * k)), FLOOR - by + 1); // front leg
      S.rect(q, Math.round(bx + 4 * k), by, Math.max(2, Math.round(2 * k)), FLOOR - by + 1); // back leg
      S.stroke(q, [[bx + 7 * k, by - 1, 1.2 * k + 0.4], [bx + 10 * k, by - 5 * k, 1 * k + 0.4]]); // tail
    }, RAMP.dog, { ring: true });
    D("dog-face", [[bx - 9 * k, by - 6 * k, "K"], [bx - 12 * k, by - 4 * k, "K"], [bx - 6 * k, by - 8 * k, "N"], [bx - 6 * k, by - 7 * k, "N"]]);
  };

  // Babies sit on the floor: a round onesie, a big head, a curl of hair.
  const buildBaby = (t, id, L, D) => {
    const big = t.size === "big", rx = big ? 8 : 6, ry = big ? 6 : 4.5, hr = big ? 7 : 6;
    const by = FLOOR - ry, hy = Math.round(by - ry - hr + 3);
    L("onesie", (q) => { S.ellipse(q, CX, by, rx, ry); S.disc(q, CX - rx + 1, FLOOR - 1, 2); S.disc(q, CX + rx - 1, FLOOR - 1, 2); }, RAMP.baby, { ring: true });
    L("hands", (q) => { S.disc(q, CX - rx, by - 2, 1.8); S.disc(q, CX + rx, by - 2, 1.8); }, RAMP.skin, { soft: true });
    L("head", (q) => S.disc(q, CX, hy, hr), RAMP.skin, { ring: true });
    D("face", [[CX - 2.5, hy, "K"], [CX + 2.5, hy, "K"], [CX - 1, hy + 3, "R"], [CX, hy + 3, "R"], [CX + 1, hy + 3, "R"], [CX - 4, hy + 2, "h"], [CX + 4, hy + 2, "h"],
      [CX, hy - hr, "N"], [CX + 1, hy - hr - 1, "N"], [CX + 2, hy - hr - 1, "N"]]);
    const headTop = Math.round(hy - hr);
    if (t.item === "new-hat" || t.item === "old-hat") {
      const isNew = t.item === "new-hat";
      L("hat", (q) => { S.roundRect(q, Math.round(CX - hr + 1), headTop - 2, Math.round(hr * 2 - 1), 5, 2); }, isNew ? RAMP.newHat : RAMP.oldHat, { ring: true });
      D("hat-mark", isNew ? [...sparkle(CX - hr - 2, headTop - 2), ...sparkle(CX + hr + 2, headTop - 4)] : [[CX - 2, headTop - 1, "o"], [CX - 1, headTop - 1, "o"], [CX - 2, headTop, "o"], [CX - 1, headTop, "K"], [CX + 3, headTop, "K"]]);
    }
    if (t.item === "big-ball") L("ball", (q) => S.disc(q, 6, FLOOR - 5, 5.5), RAMP.ball, { ring: true });
    if (t.item === "small-ball") L("ball", (q) => S.disc(q, 7, FLOOR - 2, 2.2), RAMP.ball, { ring: true });
    return [];
  };

  const cache = new Map();
  PX.person = (t) => {
    const key = JSON.stringify(t);
    if (!cache.has(key)) {
      const id = "p" + cache.size;
      const layers = [];
      const L = (name, draw, ramp, opts = {}) => { const grid = S.grid(); draw(grid); layers.push({ sprite: S.lit(`${id}-${name}`, grid, opts), remap: ramp, ring: opts.ring }); };
      const D = (name, pts) => layers.push({ sprite: dots(`${id}-${name}`, pts) });
      const built = t.look === "baby" ? (buildBaby(t, id, L, D), layers) : build(t, id);
      cache.set(key, PX.render(W, H, built));
    }
    return cache.get(key);
  };
  PX.person.size = { w: W, h: H };

  /* ===== FACE PORTRAITS (40×40) — Guess Who =====
   * PX.face({ gender, hair, eye, style, shirt }) -> data URL
   *   gender: "boy" | "girl"                                    (decides the answer, so it reads at a glance:
   *                                                              girls have long hair or a bun, a pink bow and lashes)
   *   hair:   "black" | "brown" | "blonde" | "red" | "gray"     (decides the answer, so drawn exactly)
   *   eye:    "brown" | "blue" | "green"                        (big eyes so the color reads at a glance)
   *   style:  boy "short" | "spiky", girl "long" | "bun" · shirt: 0-3   (decoration only)
   */
  const FW = 40, FH = 40, FX = 19.5, F = PX.shapes(FW, FH);
  const FACE_HAIR = { ...RAMP, blonde: { 3: "#fff3a8", 1: "#f2d45c", 2: "#d1ad35", 4: "#9c7d1e" }, red: { 3: "#ff9a6a", 1: "#d9532c", 2: "#a83c1d", 4: "#702612" } };
  const IRIS = { brown: "#7a4a22", blue: "#3f7fe8", green: "#35a84a" };
  const fcache = new Map();
  PX.face = (t) => {
    const key = JSON.stringify(t);
    if (fcache.has(key)) return fcache.get(key);
    const id = "f" + fcache.size, layers = [];
    const L = (name, draw, ramp, opts = {}) => { const g = F.grid(); draw(g); layers.push({ sprite: F.lit(`${id}-${name}`, g, opts), remap: ramp, ring: opts.ring }); };
    const D = (name, pts, remap) => {
      const rows = Array.from({ length: FH }, () => Array(FW).fill("."));
      pts.forEach(([x, y, k]) => { if (rows[y]) rows[y][Math.round(x)] = k; });
      layers.push({ sprite: PX.sprite(`${id}-${name}`, rows.map((r) => r.join(""))), remap });
    };
    const hair = FACE_HAIR[t.hair], hy = 17, hr = 10, girl = t.gender === "girl";
    const style = girl ? (t.style === "bun" ? "bun" : "long") : t.style === "spiky" ? "spiky" : "short";
    if (style === "long") L("hairback", (g) => F.roundRect(g, 7, 6, 26, 26, 6), hair);
    L("shirt", (g) => F.roundRect(g, 6, 31, 28, 12, 5), OUTFITS[(t.shirt || 0) % 4], { ring: true });
    L("neck", (g) => F.rect(g, 16, 26, 8, 6), RAMP.skin, { soft: true });
    L("head", (g) => { F.ellipse(g, FX, hy, hr, hr + 1); F.disc(g, FX - hr, hy + 1, 2); F.disc(g, FX + hr, hy + 1, 2); }, RAMP.skin, { ring: true });
    // Hair on top: a cap, with a fringe. Girls: side hair down to the cheeks, a bun maybe. Boys: short, maybe spiky.
    L("hair", (g) => {
      for (let y = 4; y <= hy - 5; y++) for (let x = 7; x <= 32; x++) if ((x - FX) ** 2 + (y - hy) ** 2 <= (hr + 1.2) ** 2) F.set(g, x, y);
      if (girl) { F.rect(g, 8, hy - 6, 3, 12); F.rect(g, 29, hy - 6, 3, 12); } else { F.rect(g, 9, hy - 6, 3, 5); F.rect(g, 28, hy - 6, 3, 5); }
      if (style === "bun") F.disc(g, FX, 4, 4);
      if (style === "spiky") [[11, 5], [16, 3], [21, 2], [26, 4]].forEach(([x, y]) => { for (let i = 0; i < 4; i++) F.rect(g, x - 2 + Math.ceil(i / 2), y + i, 5 - Math.ceil(i / 2) * 2 + 1, 1); });
    }, hair, { ring: true });
    if (girl) L("bow", (g) => { F.disc(g, 27, 6, 3); F.disc(g, 33, 6, 3); F.disc(g, 30, 6, 1.6); }, { 3: "#ffd0e4", 1: "#f57aa8", 2: "#d24a80", 4: "#9a2a5a" }, { ring: true });
    // Eyes: white, a 2×2 iris in the eye color, a pupil, a glint. Brows in the hair color.
    const iris = "5", brow = "6"; // slots, remapped to the eye color and the hair's darkest tone
    const eye = (cx) => [
      [cx - 2, hy, "W"], [cx - 1, hy, "W"], [cx, hy, "W"], [cx + 1, hy, "W"], [cx + 2, hy, "W"],
      [cx - 2, hy + 1, "W"], [cx - 1, hy + 1, iris], [cx, hy + 1, iris], [cx + 1, hy + 1, iris], [cx + 2, hy + 1, "W"],
      [cx - 2, hy + 2, "W"], [cx - 1, hy + 2, iris], [cx, hy + 2, "K"], [cx + 1, hy + 2, iris], [cx + 2, hy + 2, "W"],
      [cx - 1, hy + 3, "W"], [cx, hy + 3, iris], [cx + 1, hy + 3, "W"],
      [cx - 1, hy + 1, "W"], // glint
      [cx - 3, hy, "K"], [cx + 3, hy, "K"], [cx - 3, hy + 1, "K"], [cx + 3, hy + 1, "K"], [cx - 3, hy + 2, "K"], [cx + 3, hy + 2, "K"],
      [cx - 2, hy - 1, "K"], [cx - 1, hy - 1, "K"], [cx, hy - 1, "K"], [cx + 1, hy - 1, "K"], [cx + 2, hy - 1, "K"],
      [cx - 2, hy + 3, "K"], [cx + 2, hy + 3, "K"], [cx - 1, hy + 4, "K"], [cx, hy + 4, "K"], [cx + 1, hy + 4, "K"],
      [cx - 2, hy - 3, brow], [cx - 1, hy - 3, brow], [cx, hy - 3, brow], [cx + 1, hy - 3, brow], [cx + 2, hy - 3, brow],
    ];
    D("face", [...eye(15), ...eye(24),
      [FX, hy + 5, "S"], [FX + 0.5, hy + 6, "S"],                                         // nose
      ...[16, 17, 18, 19, 20, 21, 22, 23].map((x) => [x, hy + 8, girl ? "r" : "R"]),           // flat mouth (😐)
      ...(girl ? [[11, hy - 1, "K"], [12, hy - 2, "K"], [28, hy - 1, "K"], [27, hy - 2, "K"]] : []), // lashes
    ], { 5: IRIS[t.eye], 6: hair[4] });
    const url = PX.render(FW, FH, layers);
    fcache.set(key, url);
    return url;
  };
  PX.face.size = { w: FW, h: FH };
})();
