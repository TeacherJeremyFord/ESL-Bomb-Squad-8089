/* ===== PIXEL ART ENGINE =====
 * Sprites are arrays of equal-length strings; each character is a palette key, "." is empty.
 * Keys "1"-"4" are slots filled per draw (a remap), so one sprite covers every color variant.
 * See docs/art/PIXEL_ART_GUIDE.md for the style rules.
 */
(function () {
  const PALETTE = {
    K: "#1b1424", // outline / pupils
    W: "#f6f4ef", g: "#a3a8b2", G: "#5d6372",
    s: "#f4cba3", S: "#d6996c",
    r: "#e04848", R: "#9a2b3a", h: "#f59ab8",
    o: "#f39a2b", O: "#b5621b",
    y: "#f7d843", Y: "#c99a1f",
    l: "#86d65c", v: "#3f9e45", V: "#25663a",
    c: "#62cbe9", C: "#2f8db0", b: "#3f6fd8", B: "#2a3f8f",
    p: "#a65bd6", P: "#6a3399",
    n: "#8b5a2b", N: "#5a3618",
  };

  const sprite = (name, rows) => {
    const w = rows[0].length;
    rows.forEach((r, i) => { if (r.length !== w) throw new Error(`sprite ${name}: row ${i} is ${r.length} wide, expected ${w}`); });
    return { name, w, h: rows.length, rows };
  };

  const mirror = (s) => ({ ...s, name: s.name + "-mirror", rows: s.rows.map((r) => [...r].reverse().join("")) });

  // Stamp a sprite into a pixel buffer (2D array of color strings or null).
  const stamp = (buf, s, x, y, remap = {}) => {
    s.rows.forEach((row, j) => [...row].forEach((k, i) => {
      if (k === ".") return;
      const color = remap[k] || PALETTE[k] || k;
      const yy = y + j, xx = x + i;
      if (buf[yy] && xx >= 0 && xx < buf[yy].length) buf[yy][xx] = color;
    }));
  };

  // Every filled pixel gets a 1px dark outline on its empty 4-neighbours.
  const outline = (buf, color = PALETTE.K) => {
    const h = buf.length, w = buf[0].length;
    const out = buf.map((r) => r.slice());
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (buf[y][x]) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => buf[y + dy] && buf[y + dy][x + dx]);
      if (n) out[y][x] = color;
    }
    return out;
  };

  const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill(null));

  // Filled ellipse in slot colors: "1" body, "2" shade (lower right), "3" highlight (upper left).
  const blob = (w, h) => {
    const rows = [];
    const cx = (w - 1) / 2, cy = (h - 1) / 2, rx = w / 2, ry = h / 2;
    for (let y = 0; y < h; y++) {
      let row = "";
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy;
        if (d > 1) row += ".";
        else if (d > 0.62 && dx + dy > 0.35) row += "2";
        else if ((dx + 0.45) ** 2 + (dy + 0.5) ** 2 < 0.03) row += "3";
        else row += "1";
      }
      rows.push(row);
    }
    return sprite(`blob${w}x${h}`, rows);
  };

  // A part drawn with ring: true gets its own dark outline, so it reads as sitting in front of what's behind it.
  const ring = (buf, s, x, y, color = PALETTE.K) => {
    const on = (i, j) => s.rows[j] && s.rows[j][i] && s.rows[j][i] !== ".";
    for (let j = -1; j <= s.h; j++) for (let i = -1; i <= s.w; i++) {
      if (on(i, j)) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => on(i + dx, j + dy)) && buf[y + j] && x + i >= 0 && x + i < buf[0].length) buf[y + j][x + i] = color;
    }
  };

  // layers: [{sprite, x, y, remap, ring}] -> data URL. A final outline is applied over the whole image.
  const cache = new Map();
  const render = (w, h, layers, { outlined = true } = {}) => {
    const key = JSON.stringify([w, h, outlined, layers.map((l) => [l.sprite.name, l.x, l.y, l.remap, l.ring])]);
    if (cache.has(key)) return cache.get(key);
    let buf = blank(w, h);
    layers.forEach((l) => { if (l.ring) ring(buf, l.sprite, l.x || 0, l.y || 0); stamp(buf, l.sprite, l.x || 0, l.y || 0, l.remap); });
    if (outlined) buf = outline(buf);
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    buf.forEach((row, y) => row.forEach((c, x) => { if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } }));
    const url = cv.toDataURL();
    cache.set(key, url);
    return url;
  };

  // Shape kit for procedurally drawn parts on a w×h canvas: draw silhouettes, then light() them into slot keys 1-4.
  const shapes = (W, H) => {
    const grid = () => Array.from({ length: H }, () => Array(W).fill(false));
    const set = (g, x, y) => { x = Math.round(x); y = Math.round(y); if (g[y] && x >= 0 && x < W) g[y][x] = true; };
    const disc = (g, cx, cy, r) => {
      for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) set(g, x, y);
    };
    const ellipse = (g, cx, cy, rx, ry) => {
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(g, x, y);
    };
    const rect = (g, x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(g, x, y); };
    const roundRect = (g, x0, y0, w, h, r) => {
      rect(g, x0 + r, y0, w - 2 * r, h); rect(g, x0, y0 + r, w, h - 2 * r);
      [[x0 + r, y0 + r], [x0 + w - 1 - r, y0 + r], [x0 + r, y0 + h - 1 - r], [x0 + w - 1 - r, y0 + h - 1 - r]].forEach(([x, y]) => disc(g, x, y, r));
    };
    const stroke = (g, pts) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0, r0] = pts[i], [x1, y1, r1] = pts[i + 1];
        for (let t = 0; t <= 1; t += 0.1) disc(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r0 + (r1 - r0) * t);
      }
    };
    // Light from the upper left: deep shade on the lower-right rim, dithered shade band, 1px highlight rim.
    const light = (g, { soft = false } = {}) => {
      const filled = (x, y) => g[y] && g[y][x];
      const run = (x, y, dx, dy) => { let n = 0; while (filled(x + dx * (n + 1), y + dy * (n + 1)) && n < 8) n++; return n; };
      return g.map((row, y) => row.map((f, x) => {
        if (!f) return ".";
        const d = Math.min(run(x, y, 0, 1), run(x, y, 1, 0) + 1);
        const u = Math.min(run(x, y, 0, -1), run(x, y, -1, 0));
        if (d === 0) return soft ? "2" : "4";
        if (d <= (soft ? 1 : 2)) return "2";
        if (d === (soft ? 2 : 3)) return (x + y) % 2 ? "2" : "1";
        if (u === 0) return "3";
        return "1";
      }).join(""));
    };
    const lit = (name, g, opts) => sprite(name, light(g, opts));
    return { grid, set, disc, ellipse, rect, roundRect, stroke, light, lit };
  };

  // Free painting for scenes: paint(w, h, (set) => { set(x, y, "#hex" or palette key) }) -> data URL.
  const paint = (w, h, draw) => {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    draw((x, y, c) => { if (x < 0 || y < 0 || x >= w || y >= h) return; ctx.fillStyle = PALETTE[c] || c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); });
    return cv.toDataURL();
  };

  window.PX = { PALETTE, sprite, mirror, blob, render, shapes, paint, SPRITES: {} };
})();
