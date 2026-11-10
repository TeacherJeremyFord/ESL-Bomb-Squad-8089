/* ===== FEELING FACES (32×32) — M09 Mood Plugs =====
 * PX.feel(who, feeling) -> data URL
 *   who: boy | girl | dog | cat | expert | defuser
 *   feeling: angry (red face, steam) | sad (a tear) | fine (small flat smile + OK hand) |
 *            good (smile + thumbs up) | great (big star eyes + thumbs up) | happy (big open smile)
 * One base per character; only the feeling changes, so the Face Guide always matches.
 */
(function () {
  const W = 32, H = 32, S = PX.shapes(W, H), CX = 14, CY = 16;
  const SKIN = { 3: "#ffe2c6", 1: "#f4c49a", 2: "#d9996b", 4: "#a96a43" }, RED = { 3: "#ff9a8a", 1: "#f05a4a", 2: "#c43a3a", 4: "#8a2222" };
  const FUR = { dog: { 3: "#e8c08a", 1: "#c48a4c", 2: "#9a6634", 4: "#6a4220" }, cat: { 3: "#d4d7dd", 1: "#a3a8b2", 2: "#7d828c", 4: "#5d6372" } };
  const HAIR = { boy: { 3: "#5a5a70", 1: "#2d2d3a", 2: "#1f1f29", 4: "#121218" }, girl: { 3: "#b47c4a", 1: "#8b5a2b", 2: "#6a4220", 4: "#4a2c14" },
    expert: { 3: "#fff3a8", 1: "#f2d45c", 2: "#d1ad35", 4: "#9c7d1e" }, defuser: { 3: "#ff9a6a", 1: "#d9532c", 2: "#a83c1d", 4: "#702612" } };
  const cache = new Map();

  PX.feel = (who, feeling) => {
    const key = who + "|" + feeling;
    if (cache.has(key)) return cache.get(key);
    const animal = who === "dog" || who === "cat", layers = [], id = "feel-" + key;
    const L = (name, draw, ramp, opts = {}) => { const g = S.grid(); draw(g); layers.push({ sprite: S.lit(`${id}-${name}`, g, opts), remap: ramp, ring: opts.ring }); };
    const D = (name, pts) => { const rows = Array.from({ length: H }, () => Array(W).fill(".")); pts.forEach(([x, y, k]) => { if (rows[y] && x >= 0 && x < W) rows[y][Math.round(x)] = k; }); layers.push({ sprite: PX.sprite(`${id}-${name}`, rows.map((r) => r.join(""))) }); };
    const face = feeling === "angry" ? RED : animal ? FUR[who] : SKIN;

    if (who === "girl" || who === "expert") L("hairback", (g) => S.roundRect(g, CX - 11, CY - 10, 23, 22, 6), HAIR[who]);
    if (who === "dog") L("ears", (g) => { S.ellipse(g, CX - 10, CY + 1, 3, 6); S.ellipse(g, CX + 10, CY + 1, 3, 6); }, FUR.dog.length ? FUR.dog : { 3: "#6a4220", 1: "#5a3618", 2: "#4a2c14", 4: "#3a200c" }, { ring: true });
    if (who === "cat") L("ears", (g) => { for (let i = 0; i < 6; i++) { S.rect(g, CX - 9 + Math.floor(i / 2), CY - 13 + i, 6 - i, 1); S.rect(g, CX + 4 + Math.ceil(i / 2), CY - 13 + i, 6 - i, 1); } }, face, { ring: true });
    L("head", (g) => S.ellipse(g, CX, CY, 10, 10), face, { ring: true });
    if (!animal) L("hair", (g) => { for (let y = CY - 11; y <= CY - 5; y++) for (let x = CX - 11; x <= CX + 11; x++) if ((x - CX) ** 2 + (y - CY) ** 2 <= 121) S.set(g, x, y); if (who === "girl") S.disc(g, CX + 8, CY - 9, 2.5); }, HAIR[who], { ring: true });
    if (who === "expert") D("headset", [...Array(9)].map((_, i) => [CX - 4 + i, CY - 12, "K"]).concat([[CX - 11, CY - 1, "K"], [CX - 11, CY, "K"], [CX - 12, CY, "K"], [CX - 11, CY + 1, "K"], [CX - 10, CY + 4, "K"], [CX - 9, CY + 5, "K"], [CX - 8, CY + 5, "r"]]));

    // Eyes and brows.
    const ex = [CX - 4, CX + 4], ey = CY - 1, pts = [];
    if (feeling === "great") ex.forEach((x) => [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [-1, 2], [1, 2]].forEach(([dx, dy]) => pts.push([x + dx, ey + dy, "y"])));
    else ex.forEach((x) => { pts.push([x, ey, "K"], [x, ey + 1, "K"], [x - 1, ey, "K"], [x - 1, ey + 1, "K"]); if (feeling !== "angry") pts.push([x - 1, ey, "W"]); });
    if (feeling === "angry") pts.push([CX - 7, ey - 3, "K"], [CX - 6, ey - 3, "K"], [CX - 5, ey - 2, "K"], [CX - 4, ey - 2, "K"], [CX + 3, ey - 2, "K"], [CX + 4, ey - 2, "K"], [CX + 5, ey - 3, "K"], [CX + 6, ey - 3, "K"]);
    if (feeling === "sad") pts.push([CX - 6, ey - 2, "K"], [CX - 5, ey - 3, "K"], [CX + 4, ey - 3, "K"], [CX + 5, ey - 2, "K"], [CX + 4, ey + 3, "c"], [CX + 4, ey + 4, "c"], [CX + 5, ey + 4, "c"], [CX + 4, ey + 5, "C"], [CX + 5, ey + 5, "c"]);
    if (animal) pts.push([CX - 1, CY + 2, "K"], [CX, CY + 2, "K"], [CX + 1, CY + 2, "K"], [CX, CY + 3, "K"]);
    // Mouths.
    const my = CY + 5;
    const M = {
      happy: [[-4, 0], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [-4, 1], [4, 1], [-3, 2], [3, 2], [-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3]].map(([x, y]) => [CX + x, my + y, "K"])
        .concat([[-3, 1], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2]].map(([x, y]) => [CX + x, my + y, y === 1 ? "W" : "h"])),
      great: [[-4, 0], [-3, 1], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [4, 0]].map(([x, y]) => [CX + x, my + y, "K"]),
      good: [[-3, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 0]].map(([x, y]) => [CX + x, my + y, "K"]),
      fine: [[-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1]].map(([x, y]) => [CX + x, my + y, "K"]),
      sad: [[-3, 2], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 2]].map(([x, y]) => [CX + x, my + y, "K"]),
      angry: [[-3, 2], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 2]].map(([x, y]) => [CX + x, my + y, "K"]),
    };
    D("face", pts.concat(M[feeling]));
    if (feeling === "angry") D("steam", [[CX - 8, 3], [CX - 9, 2], [CX - 7, 1], [CX + 8, 3], [CX + 9, 2], [CX + 7, 1], [CX, 2], [CX - 1, 1], [CX + 1, 0]].map(([x, y]) => [x, y, "W"]));
    // Hands: thumbs up (good, great) or OK (fine), at the lower right.
    const hand = animal ? FUR[who] : SKIN;
    if (feeling === "good" || feeling === "great") L("thumb", (g) => { S.roundRect(g, 24, 22, 6, 6, 1); S.rect(g, 25, 17, 3, 6); }, hand, { ring: true });
    if (feeling === "fine") { L("ok", (g) => { S.disc(g, 26, 25, 3.5); S.rect(g, 28, 17, 2, 7); S.rect(g, 26, 18, 2, 5); S.rect(g, 30, 19, 2, 5); }, hand, { ring: true }); D("ok-hole", [[25, 24, "W"], [26, 24, "W"], [25, 25, "W"], [26, 25, "W"], [24, 24, "K"], [27, 24, "K"], [24, 25, "K"], [27, 25, "K"], [25, 23, "K"], [26, 23, "K"], [25, 26, "K"], [26, 26, "K"]]); }
    const url = PX.render(W, H, layers);
    cache.set(key, url);
    return url;
  };
})();
