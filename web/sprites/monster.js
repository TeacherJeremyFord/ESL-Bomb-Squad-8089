/* ===== MONSTER LAB SPRITES — a "Mister Potato Head" parts kit =====
 * A monster is a recipe of interchangeable parts, stacked back to front:
 *   horns -> arms -> legs -> body -> head -> nose -> mouth -> eyes
 * Bodies declare where the head, shoulders and hips go; heads declare where the face parts go.
 * So any head fits any body, and any eyes / mouth / nose / horns fit any head.
 *
 * PX.monster({ head, body, legs, arms, eyes, eyeStyle, mouth, nose, horns, color }) -> data URL
 *   eyes: 1-4 (count, placed by code so it is always exact)
 *   PX.monster.PARTS lists the choices for every slot.
 */
(function () {
  const W = 72, H = 66, CX = 36;

  // 4-tone ramps: 3 highlight, 1 base, 2 shade, 4 deep shade.
  const RAMPS = {
    purple: { 3: "#dcaaf4", 1: "#a65bd6", 2: "#773aa6", 4: "#4c2170" },
    green:  { 3: "#bdee90", 1: "#6cc24a", 2: "#3f8f3a", 4: "#265c29" },
    orange: { 3: "#ffd28c", 1: "#f39a2b", 2: "#c26816", 4: "#83420d" },
    metal:  { 3: "#eef0f4", 1: "#a9afba", 2: "#737a88", 4: "#454b58" },
  };

  /* --- silhouette drawing --- */
  const grid = () => Array.from({ length: H }, () => Array(W).fill(false));
  const set = (g, x, y) => { x = Math.round(x); if (g[y] && x >= 0 && x < W) g[y][x] = true; };
  const disc = (g, cx, cy, r) => {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) set(g, x, y);
  };
  const ellipse = (g, cx, cy, rx, ry) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(g, x, y);
  };
  const rect = (g, x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(g, x, y); };
  const roundRect = (g, x0, y0, w, h, r) => {
    rect(g, x0 + r, y0, w - 2 * r, h); rect(g, x0, y0 + r, w, h - 2 * r);
    [[x0 + r, y0 + r], [x0 + w - 1 - r, y0 + r], [x0 + r, y0 + h - 1 - r], [x0 + w - 1 - r, y0 + h - 1 - r]].forEach(([x, y]) => disc(g, x, y, r));
  };
  // A thick stroke through points [x, y, r], interpolated so it reads as one smooth limb.
  const stroke = (g, pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0, r0] = pts[i], [x1, y1, r1] = pts[i + 1];
      for (let t = 0; t <= 1; t += 0.1) disc(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r0 + (r1 - r0) * t);
    }
  };
  const mirrorGrid = (g) => g.map((row) => row.slice().reverse());

  // Light from the upper left: deep shade on the lower-right rim, dithered shade band, 1px highlight rim.
  const light = (g) => {
    const filled = (x, y) => g[y] && g[y][x];
    const run = (x, y, dx, dy) => { let n = 0; while (filled(x + dx * (n + 1), y + dy * (n + 1)) && n < 8) n++; return n; };
    return g.map((row, y) => row.map((f, x) => {
      if (!f) return ".";
      const d = Math.min(run(x, y, 0, 1), run(x, y, 1, 0) + 1);
      const u = Math.min(run(x, y, 0, -1), run(x, y, -1, 0));
      if (d === 0) return "4";
      if (d <= 2) return "2";
      if (d === 3) return (x + y) % 2 ? "2" : "1";
      if (u === 0) return "3";
      return "1";
    }).join(""));
  };

  // Overlay sprite from a list of [x, y, key] pixels, drawn on both sides (mirrored).
  const dots = (name, pts) => {
    const rows = Array.from({ length: H }, () => Array(W).fill("."));
    pts.forEach(([x, y, k]) => { if (rows[y]) { rows[y][x] = k; rows[y][W - 1 - x] = k; } });
    return PX.sprite(name, rows.map((r) => r.join("")));
  };
  const both = (s, x, y) => [{ sprite: s, x, y }, { sprite: PX.mirror(s), x: W - x - s.w, y }];

  /* --- BODIES (torso; the head covers the neck) --- */
  // shoulder: left shoulder joint; hip: left hip. Right side is mirrored.
  const BODIES = {
    blob:   { draw: (g) => ellipse(g, CX, 42, 14, 11),          shoulder: [24, 37], hip: [30, 51], sheen: [30, 37] },
    tall:   { draw: (g) => roundRect(g, 25, 31, 23, 22, 6),     shoulder: [26, 37], hip: [30, 51], sheen: [30, 36] },
    chubby: { draw: (g) => ellipse(g, CX, 43, 17.5, 10),        shoulder: [21, 39], hip: [29, 51], sheen: [27, 38] },
  };

  /* --- HEADS --- */
  // eyeY: eye-line center; nose / mouth: [x, y] centers; horn: left horn base; sheen: highlight center.
  const HEADS = {
    round: { draw: (g) => ellipse(g, CX, 22, 18, 13),          eyeY: 20, nose: [CX, 26], mouth: [CX, 31], horn: [27, 11], sheen: [27, 14] },
    box:   { draw: (g) => roundRect(g, 18, 10, 37, 25, 7),     eyeY: 19, nose: [CX, 25], mouth: [CX, 30], horn: [25, 11], sheen: [25, 14] },
    bean:  { draw: (g) => ellipse(g, CX, 23, 20, 11.5),        eyeY: 21, nose: [CX, 26], mouth: [CX, 31], horn: [26, 13], sheen: [25, 17] },
  };

  /* --- LEGS (drawn at the left hip, mirrored for the right) --- */
  const LEGS = {
    stubby:  (g, [x, y]) => disc(g, x, y + 2, 4.5),
    long:    (g, [x, y]) => { rect(g, x - 2, y, 4, 8); ellipse(g, x - 1.5, y + 9, 4, 2.5); },
    bigfeet: (g, [x, y]) => { rect(g, x - 2, y, 4, 3); ellipse(g, x - 1.5, y + 5, 5.5, 3); },
  };

  // Light a silhouette and add a soft dithered sheen.
  const shaded = (name, g, [sx, sy]) => {
    const s = PX.sprite(name, light(g));
    s.rows = s.rows.map((row, y) => [...row].map((k, x) => {
      const d = ((x - sx) / 4) ** 2 + ((y - sy) / 2.5) ** 2;
      if ((k === "1" || k === "3") && d < 1) return "3";
      if (k === "1" && d < 1.6 && (x + y) % 2 === 0) return "3";
      return k;
    }).join(""));
    return s;
  };
  const headSprite = (key) => { const g = grid(); HEADS[key].draw(g); return shaded("head-" + key, g, HEADS[key].sheen); };
  const bodySprite = (key) => { const g = grid(); BODIES[key].draw(g); return shaded("body-" + key, g, BODIES[key].sheen); };
  const legSprites = (type, body) => {
    const g = grid();
    LEGS[type](g, BODIES[body].hip);
    return [PX.sprite(`legs-${type}-${body}-l`, light(g)), PX.sprite(`legs-${type}-${body}-r`, light(mirrorGrid(g)))];
  };

  /* --- ARMS (drawn for a shoulder at [20, 28], shifted to the body's shoulder anchor) --- */
  const TENTACLE = [[20, 28, 4], [15, 30, 3.6], [11, 34, 3.2], [8.5, 38.5, 2.8], [8, 43, 2.4], [10, 46, 2], [13, 46.5, 1.6], [14.5, 44.5, 1.2]];
  const FURRY = [[20, 27, 4.5], [15, 29, 4.2], [11, 33, 4], [9, 38, 3.8], [9, 42, 3.5]];
  const shift = (pts, ox, oy) => pts.map(([x, y, r]) => [x + ox, y + oy, r]);

  const ARMS = {
    tentacles: {
      draw: (g, ox, oy) => stroke(g, shift(TENTACLE, ox, oy)),
      detail: (ox, oy) => [[13, 33], [14, 33], [9, 38], [10, 38], [9, 43], [10, 43], [11, 46], [12, 46]].map(([x, y]) => [x + ox, y + oy, "h"]),
    },
    furry: {
      draw: (g, ox, oy) => {
        stroke(g, shift(FURRY, ox, oy));
        // Shaggy edge: deterministic spikes, 1-3px long, pointing away from the limb.
        const base = g.map((r) => r.slice());
        const edge = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !(base[y + dy] && base[y + dy][x + dx]));
        base.forEach((row, y) => row.forEach((on, x) => {
          if (!on || !edge(x, y) || (x * 5 + y * 3) % 3) return;
          const len = 1 + ((x * 11 + y * 7) % 3);
          const sx = Math.sign(x - (12 + ox)) || 1, sy = y > 36 + oy ? 1 : (y < 28 + oy ? -1 : 0);
          for (let i = 1; i <= len; i++) set(g, x + sx * i - (sy && i > 1 ? sx : 0), y + sy * i);
        }));
      },
      // Dark fur streaks + white claws.
      detail: (ox, oy) => [
        ...[[16, 27], [12, 30], [13, 34], [10, 36], [11, 40], [8, 41]].flatMap(([x, y]) => [[x, y, "4"], [x - 1, y + 1, "4"], [x - 1, y + 2, "2"]]),
        ...[[6, 46], [9, 47], [12, 46]].flatMap(([x, y]) => [[x, y, "W"], [x, y + 1, "W"]]),
      ].map(([x, y, k]) => [x + ox, y + oy, k]),
    },
    robot: {
      metal: true,
      draw: (g, ox, oy) => {
        disc(g, 19 + ox, 29 + oy, 3.2);   // shoulder joint
        rect(g, 10 + ox, 27 + oy, 9, 5);  // upper arm
        disc(g, 10 + ox, 29.5 + oy, 3.2); // elbow
        rect(g, 8 + ox, 31 + oy, 5, 9);   // forearm
        rect(g, 5 + ox, 40 + oy, 11, 3);  // claw base
        rect(g, 5 + ox, 43 + oy, 3, 4); rect(g, 13 + ox, 43 + oy, 3, 4); // pincers
      },
      detail: (ox, oy) => [[19 + ox, 29 + oy, "K"], [10 + ox, 29 + oy, "K"]],
    },
  };

  const armSprites = (type, body) => {
    const [sx, sy] = BODIES[body].shoulder, ox = sx - 20, oy = sy - 28;
    const g = grid();
    ARMS[type].draw(g, ox, oy);
    return {
      left: PX.sprite(`arm-${type}-${body}-l`, light(g)),
      right: PX.sprite(`arm-${type}-${body}-r`, light(mirrorGrid(g))),
      detail: dots(`arm-${type}-${body}-detail`, ARMS[type].detail(ox, oy)),
    };
  };

  /* --- FACE PARTS (fixed pixel sprites; "2" = the monster's own skin shade) --- */
  const EYES = {
    round: PX.sprite("eye-round", [
      "..KKKKK..", ".KWWWWWK.", "KWWWWWWWK", "KWWWKKWWK", "KWWKKKWWK", "KWWKKKWWK", "KgWWWWWgK", ".KgggggK.", "..KKKKK..",
    ]),
    sleepy: PX.sprite("eye-sleepy", [
      "..KKKKK..", ".K22222K.", "K2222222K", "KKKKKKKKK", "KWWKKKWWK", "KWWKKKWWK", "KgWWWWWgK", ".KgggggK.", "..KKKKK..",
    ]),
    lookup: PX.sprite("eye-lookup", [
      "..KKKKK..", ".KWKKKWK.", "KWWKKKWWK", "KWWKKKWWK", "KWWWWWWWK", "KWWWWWWWK", "KgWWWWWgK", ".KgggggK.", "..KKKKK..",
    ]),
  };

  const MOUTHS = {
    smile: PX.sprite("mouth-smile", ["KKKKKKKKKKKK", "KWWKKKKKKWWK", ".KKKhhhhKKK.", "...KKKKKK..."]),
    fangs: PX.sprite("mouth-fangs", [".KKKKKKKKKK.", "KKhhhhhhhhKK", ".KWKKKKKKWK.", "..W......W.."]),
    oh:    PX.sprite("mouth-oh",    ["....KKKK....", "...KKhhKK...", "...KhhhhK...", "...KKhhKK...", "....KKKK...."]),
    grin:  PX.sprite("mouth-grin",  ["KKKKKKKKKKKK", "KWKWWKWWKWWK", "KKWKKWKKWKKK", ".KKKKKKKKKK."]),
  };

  const NOSES = {
    none: null,
    dots: PX.sprite("nose-dots", ["K.K"]),
    snout: PX.sprite("nose-snout", [".2222.", "222222", "2K22K2", ".2222."]),
    button: PX.sprite("nose-button", [".hh.", "hhhh", ".hh."]),
  };

  const HORNS = {
    none: null,
    horns: PX.sprite("horn", ["....W", "...WW", "..WWg", ".WWg.", ".Wgg.", "WWgg.", "Wggg."]),
    antennae: PX.sprite("antenna", [".yy.", "yyyy", "yyyY", ".YY.", "..2.", "..2.", "..2.", "..2.", "..2."]),
  };

  // Eye centers: one row, spaced so even 4 eyes never touch; outer eyes sit lower on the curve.
  const eyeSpots = (n, eyeY) => Array.from({ length: n }, (_, i) => {
    const off = (i - (n - 1) / 2) * 8;
    return [Math.round(CX + off), Math.round(eyeY + (off / 8) ** 2 * 1.2)];
  });

  const cached = {};
  const part = (key, make) => (cached[key] = cached[key] || make());
  const at = (s, [x, y]) => ({ sprite: s, x: Math.round(x - s.w / 2), y: Math.round(y - s.h / 2) });

  const DEFAULTS = { head: "round", body: "blob", legs: "stubby", arms: "tentacles", eyes: 2, eyeStyle: "round", mouth: "smile", nose: "none", horns: "none", color: "purple" };

  PX.monster = (recipe) => {
    const r = { ...DEFAULTS, ...recipe };
    const head = HEADS[r.head], skin = RAMPS[r.color];
    const arms = part(`arms-${r.arms}-${r.body}`, () => armSprites(r.arms, r.body));
    const legs = part(`legs-${r.legs}-${r.body}`, () => legSprites(r.legs, r.body));
    const limb = ARMS[r.arms].metal ? RAMPS.metal : skin;
    const horn = HORNS[r.horns], nose = NOSES[r.nose];

    // Back to front. ring: the part gets its own outline over whatever is behind it.
    const layers = [];
    if (horn) both(horn, head.horn[0] - 2, head.horn[1] - horn.h + (r.horns === "antennae" ? 1 : 3)).forEach((l) => layers.push({ ...l, remap: skin }));
    layers.push({ sprite: arms.left, remap: limb }, { sprite: arms.right, remap: limb });
    legs.forEach((l) => layers.push({ sprite: l, remap: skin, ring: true }));
    layers.push({ sprite: part("body-" + r.body, () => bodySprite(r.body)), remap: skin, ring: true });
    layers.push({ sprite: arms.detail, remap: limb });
    layers.push({ sprite: part("head-" + r.head, () => headSprite(r.head)), remap: skin, ring: true });
    if (nose) layers.push({ ...at(nose, head.nose), remap: skin });
    layers.push(at(MOUTHS[r.mouth], head.mouth));
    eyeSpots(r.eyes, head.eyeY).forEach((c) => layers.push({ ...at(EYES[r.eyeStyle], c), remap: skin }));
    return PX.render(W, H, layers);
  };

  PX.monster.size = { w: W, h: H };
  PX.monster.PARTS = {
    head: Object.keys(HEADS), body: Object.keys(BODIES), legs: Object.keys(LEGS), eyeStyle: Object.keys(EYES), mouth: Object.keys(MOUTHS),
    nose: Object.keys(NOSES), horns: Object.keys(HORNS), arms: Object.keys(ARMS), color: ["purple", "green", "orange"],
  };
})();
