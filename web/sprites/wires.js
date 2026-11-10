/* ===== WIRES (100×24, outlined) — Color Wires =====
 * PX.wire({ color, shape, ends, tone, cut, cutAt, cutStyle }) -> data URL
 *   color: red | blue | yellow | green | white | black — the answer, so each has its own 4-tone ramp
 *   shape: PX.wire.SHAPES (bends and squiggles) · ends: screw | nut | plug · tone: -1..1 (small shade shift)
 *   cut: true shows a gap with copper strands · cutAt: 0.25-0.75 along the wire · gap: 5 (narrow) - 10 (wide), half the opening
 *   cutStyle: snip | frayed | droop | curl
 * Everything but color is decoration, so two wires of one color still look different.
 */
(function () {
  const W = 100, H = 24, CY = 12, X0 = 4, X1 = W - 5, R = 2.4, S = PX.shapes(W, H);
  const RAMP = {
    red: { 3: "#ff8a7a", 1: "#e04848", 2: "#a8303a", 4: "#6e1e28" },
    blue: { 3: "#8ab4ff", 1: "#3f6fd8", 2: "#2a4aa8", 4: "#1c2f70" },
    yellow: { 3: "#fff3a8", 1: "#f7d843", 2: "#c99a1f", 4: "#8a6a12" },
    green: { 3: "#a6ec86", 1: "#3fae4a", 2: "#2a7a36", 4: "#1a5024" },
    white: { 3: "#ffffff", 1: "#e8e6e0", 2: "#b8bac2", 4: "#84889a" },
    black: { 3: "#7a7e90", 1: "#3a3c50", 2: "#26283a", 4: "#17171f" },
  };
  const mix = (a, b, t) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
  };
  const shade = (ramp, tone) => Object.fromEntries(Object.entries(ramp).map(([k, c]) => [k, mix(c, tone > 0 ? "#ffffff" : "#000000", Math.abs(tone) * 0.12)]));

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const SHAPES = {
    straight: () => 0,
    sag: (t) => 6 * Math.sin(Math.PI * t),
    arch: (t) => -6 * Math.sin(Math.PI * t),
    wave: (t) => 4.5 * Math.sin(3 * Math.PI * t),
    squiggle: (t) => 2.2 * Math.sin(9 * Math.PI * t),
    "s-curve": (t) => 5 * Math.sin(2 * Math.PI * t),
    dip: (t) => 6.5 * Math.sin(Math.PI * t ** 0.6),
    hump: (t) => -6.5 * Math.sin(Math.PI * t ** 1.6),
    zigzag: (t) => 3.5 * (2 * Math.abs(((4 * t + 0.5) % 2) - 1) - 1) * Math.sin(Math.PI * t),
    kink: (t) => 4 * clamp((t - 0.22) / 0.08) - 8 * clamp((t - 0.55) / 0.08) + 4 * clamp((t - 0.84) / 0.06),
  };

  // Terminals sit on top of the wire ends (drawn with ring), so the wire looks plugged in. Left side; the right is mirrored.
  const ENDS = {
    screw: [".gggggg.", "gWggggGG", "ggWWWWGG", "gWKKKKgG", "ggWWWWGG", "gggggggG", "gggggggG", "gGGGGGGG", "gggggggG", "gggggggG", "gGGGGGGG", ".GGGGGG."],
    nut: ["..yyyy..", ".yWyyyY.", "yWyyyyYY", "yyyKKyYY", "yyKYYKYY", "yyKYYKYY", "yyyKKyYY", "yyyyyyYY", ".yyyyYY.", "..YYYY..", "..yyyY..", "..YYYY.."],
    plug: ["GGGGGGG.", "GgggggGG", "GgWWggGG", "GgggggGG", "GgggggGG", "GgggggGG", "GgggggGG", "GgggggGG", "GgggggGG", "GgWWggGG", "GgggggGG", "GGGGGGG."],
  };
  const END = Object.fromEntries(Object.entries(ENDS).map(([k, r]) => { const s = PX.sprite("wire-end-" + k, r); return [k, [s, PX.mirror(s)]]; }));

  PX.wire = ({ color, shape = "straight", ends = "screw", tone = 0, cut = false, cutAt = 0.5, gap = 5, cutStyle = "snip" }) => {
    const f = SHAPES[shape], c = X0 + cutAt * (X1 - X0);
    const id = `wire-${shape}-${cut ? cutStyle + Math.round(cutAt * 100) + "g" + gap : "whole"}`;
    // A cut end bends away from the gap: droop hangs both ends down, curl springs them apart.
    const bend = (x, side) => {
      if (!cut) return 0;
      const k = Math.max(0, 1 - Math.abs(x - c) / (12 + gap)) ** 2;
      return cutStyle === "droop" ? 4 * k : cutStyle === "curl" ? 4 * k * side : 0;
    };
    const pt = (x, side) => [x, Math.max(4, Math.min(20, CY + f((x - X0) / (X1 - X0)) + bend(x, side))), R];
    const xs = (a, b) => { const out = []; for (let x = a; x < b; x += 2) out.push(x); out.push(b); return out; };
    const pieces = cut ? [xs(X0, c - gap).map((x) => pt(x, -1)), xs(c + gap, X1).map((x) => pt(x, 1))] : [xs(X0, X1).map((x) => pt(x, 0))];

    const g = S.grid();
    pieces.forEach((p) => S.stroke(g, p));
    const layers = [];

    if (cut) {
      // Copper strands stick out of each cut end, along the wire toward the gap.
      const rows = Array.from({ length: H }, () => Array(W).fill("."));
      const dot = (x, y, k) => { x = Math.round(x); y = Math.round(y); if (rows[y] && x >= 0 && x < W) rows[y][x] = k; };
      const spread = cutStyle === "frayed" ? [[-1.5, "y", 0.5], [0, "o", 0], [1.5, "O", -0.5]] : [[-1, "y", 0], [0, "o", 0], [1, "O", 0]];
      const len = Math.max(1, Math.min(cutStyle === "frayed" ? 3 : 2, gap - 4));
      [[pieces[0], 1], [pieces[1], -1]].forEach(([p, dir]) => {
        const [x1, y1] = dir > 0 ? p[p.length - 1] : p[0], [x0, y0] = dir > 0 ? p[p.length - 2] : p[1];
        const L = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / L, uy = (y1 - y0) / L;
        spread.forEach(([off, k, fan]) => { for (let i = 1; i <= len; i++) dot(x1 + ux * (R + i) - uy * off, y1 + uy * (R + i) + ux * off - fan * i * 0.6 * dir, k); });
      });
      layers.push({ sprite: PX.sprite(id + "-copper", rows.map((r) => r.join(""))) });
    }
    layers.push({ sprite: S.lit(id, g, { soft: true }), remap: shade(RAMP[color], tone) });
    const [l, r] = END[ends];
    layers.push({ sprite: l, x: 0, y: CY - 6, ring: true }, { sprite: r, x: W - 8, y: CY - 6, ring: true });
    return PX.render(W, H, layers);
  };
  PX.wire.size = { w: W, h: H };
  PX.wire.SHAPES = Object.keys(SHAPES);
  PX.wire.ENDS = Object.keys(ENDS);
  PX.wire.CUTS = ["snip", "frayed", "droop", "curl"];
})();
