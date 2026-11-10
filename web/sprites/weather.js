/* ===== WEATHER, SEASONS & CLOTHES — M03 Weather Wardrobe (sky reused by M07, M12) =====
 * PX.sky({ day, season, weather, stars }) -> 64×40 window scene
 *   season: spring | summer | fall | winter · weather: sunny | cloudy | rainy | windy (day) · stars: 0-5 (night, drawn exactly)
 * PX.thermo(temp) -> 16×16 face: hot | warm | cool | cold
 * PX.clothes(item) -> 16×16: jacket coat shirt T-shirt jeans dress shorts skirt pants shoes socks
 */
(function () {
  const SW = 64, SH = 40;
  const mix = (a, b, t) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
  };
  // Ordered dither between two colors, so gradients look like 256-color SVGA.
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const dither = (x, y, t) => t * 16 > BAYER[y % 4][x % 4] + 0.5;

  PX.sky = ({ day = true, season, weather, stars = 0 }) => PX.paint(SW, SH, (set) => {
    const top = !day ? "#0b1238" : weather === "rainy" ? "#5d6b7b" : weather === "cloudy" ? "#8da3ba" : "#3f9cf0";
    const bot = !day ? "#2a2f6a" : weather === "rainy" ? "#94a1ae" : weather === "cloudy" ? "#cdd7e1" : "#bfe6ff";
    const ground = SH - 7;
    for (let y = 0; y < ground; y++) for (let x = 0; x < SW; x++) {
      const t = y / ground, steps = 4, band = Math.floor(t * steps);
      set(x, y, dither(x, y, t * steps - band) ? mix(top, bot, (band + 1) / steps) : mix(top, bot, band / steps));
    }
    const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) set(cx + x, cy + y, c); };
    const cloud = (cx, cy, s, c, sh) => { [[0, 0, 4], [-4, 1, 3], [4, 1, 3], [-7, 2, 2], [7, 2, 2]].forEach(([dx, dy, r]) => disc(cx + dx * s, cy + dy * s, Math.round(r * s), c)); for (let x = -8 * s; x <= 8 * s; x++) set(cx + x, cy + 2 * s + 1, sh); };

    if (day) {
      if (weather === "sunny" || weather === "windy") {
        disc(12, 10, 5, "#ffd23a"); disc(11, 9, 2, "#fff3a0");
        for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; for (let r = 7; r <= 9; r++) set(12 + Math.cos(a) * r, 10 + Math.sin(a) * r, "#ffd23a"); }
      }
      if (weather === "cloudy") { disc(13, 10, 5, "#ffd23a"); cloud(17, 12, 1, "#ffffff", "#b8c4d0"); cloud(42, 8, 1.3, "#f2f5f8", "#aab6c2"); cloud(30, 18, 0.9, "#e8edf2", "#a0acb8"); }
      if (weather === "rainy") {
        cloud(16, 7, 1.2, "#7b8794", "#5b6672"); cloud(40, 6, 1.4, "#87939f", "#606b77");
        for (let i = 0; i < 46; i++) { const x = (i * 37) % SW, y = 14 + ((i * 53) % (ground - 16)); set(x, y, "#9fd0ff"); set(x - 1, y + 1, "#6aa8e8"); }
      }
      if (weather === "windy") {
        [[6, 22], [20, 16], [34, 24], [48, 14], [26, 28]].forEach(([x, y]) => { for (let i = 0; i < 9; i++) set(x + i, y + Math.round(Math.sin(i / 2)), "#ffffff"); });
        [[14, 20, "#f39a2b"], [30, 13, "#6cc24a"], [40, 21, "#c26816"], [24, 25, "#6cc24a"], [52, 26, "#f39a2b"]].forEach(([x, y, c]) => { set(x, y, c); set(x + 1, y, c); set(x, y + 1, c); });
      }
    } else {
      disc(12, 9, 5, "#f4f0c8"); disc(14, 7, 4, mix(top, bot, 0.15)); // crescent moon
      // Stars are counted by the players, so they are drawn exactly and far apart.
      [[24, 5], [33, 10], [20, 17], [30, 21], [38, 27]].slice(0, stars) /* all clear of the moon and the tree */.forEach(([x, y]) => { set(x, y, "#ffffff"); set(x - 1, y, "#fff6a0"); set(x + 1, y, "#fff6a0"); set(x, y - 1, "#fff6a0"); set(x, y + 1, "#fff6a0"); });
    }

    // Ground: grass, or snow in winter.
    const g1 = season === "winter" ? "#f4f8ff" : season === "fall" ? "#8fa850" : "#5fb04a", g2 = season === "winter" ? "#c9d6ea" : season === "fall" ? "#6f8a3a" : "#3f8f3a";
    for (let y = ground; y < SH; y++) for (let x = 0; x < SW; x++) set(x, y, dither(x, y, (y - ground) / 7) ? g2 : g1);

    // The season tree.
    const tx = 50;
    for (let y = 18; y < ground + 2; y++) for (let x = tx - 2; x <= tx + 1; x++) set(x, y, x === tx + 1 ? "#5a3618" : "#8b5a2b");
    if (season === "winter") {
      [[[tx, 20], [tx - 6, 13]], [[tx, 18], [tx + 6, 11]], [[tx, 22], [tx - 8, 18]], [[tx, 21], [tx + 8, 16]], [[tx, 18], [tx, 10]]].forEach(([[x0, y0], [x1, y1]]) => {
        for (let t = 0; t <= 1; t += 0.08) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; set(x, y, "#6a4220"); set(x, y - 1, "#ffffff"); }
      });
    } else {
      const crown = { spring: ["#7fd35a", "#4f9e3a"], summer: ["#3fa23a", "#26702a"], fall: ["#f0902a", "#b8561a"] }[season];
      const leaves = (cx, cy, r) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) set(cx + x, cy + y, x + y > r * 0.4 ? crown[1] : crown[0]); };
      leaves(tx, 12, 8); leaves(tx - 6, 15, 5); leaves(tx + 6, 15, 5);
      if (season === "spring") [[tx - 4, 9], [tx + 3, 7], [tx + 5, 13], [tx - 7, 14], [tx, 15], [tx - 2, 5], [tx + 8, 17]].forEach(([x, y]) => { set(x, y, "#ff9ac8"); set(x + 1, y, "#ffffff"); });
      if (season === "fall") [[tx - 9, ground - 1], [tx + 7, ground], [tx - 3, ground + 1], [tx + 10, ground - 2]].forEach(([x, y]) => { set(x, y, "#c26816"); set(x + 1, y, "#f0902a"); });
    }
  });
  PX.sky.size = { w: SW, h: SH };

  const sp = (name, rows) => PX.sprite(name, rows);
  const one = (s) => PX.render(16, 16, [{ sprite: s }]);

  const THERMO = {
    hot: sp("t-hot", [
      "................", "....rrrrrrr...c.", "...rrrrrrrrr.ccc", "..rrrrrrrrrrrccc", "..rrKKrrrKKrr.c.", "..rrrrrrrrrrrr..",
      "..rrrrrrrrrrrr..", "..rrrRRRRRRrrr..", "..rrrRhhhhRrrr..", "..rrrrRRRRrrrr..", "...rrrrrrrrrr...", "....rrrrrrrr....",
      "................", "................", "................", "................"]),
    warm: sp("t-warm", [
      "................", ".....oooooo.....", "...oooooooooo...", "..oooooooooooo..", "..oooKooooKooo..", "..oooooooooooo..",
      "..oooooooooooo..", "..ooKooooooKoo..", "..oooKKKKKKooo..", "..oooooooooooo..", "...oooooooooo...", ".....oooooo.....",
      "................", "................", "................", "................"]),
    cool: sp("t-cool", [
      "................", ".....cccccc.....", "...cccccccccc...", "..cccccccccccc..", "..cccKccccKccc..", "..cccccccccccc..",
      "..cccccccccccc..", "..cccccccccccc..", "..cccKKKKKKccc..", "..cccccccccccc..", "...cccccccccc...", ".....cccccc.....",
      "................", "................", "................", "................"]),
    cold: sp("t-cold", [
      "................", "W....bbbbbb....W", ".W.bbbbbbbbbb.W.", "..bbbbbbbbbbbb..", "W.bbKbbbbbbKbb.W", ".WbbbbbbbbbbbbW.",
      "..bbbbbbbbbbbb..", "..bbbKKKKKKbbb..", "..bbbKWKWKWbbb..", "..bbbKKKKKKbbb..", "W..bbbbbbbbbb..W", ".W...bbbbbb...W.",
      "................", "................", "................", "................"]),
  };
  PX.thermo = (temp) => one(THERMO[temp]);

  const CLOTHES = {
    "T-shirt": sp("c-tshirt", [
      "................", "................", "...rrrr..rrrr...", "..rrrrrrrrrrrr..", ".rrrrrrRRrrrrrr.", ".rrrrrrrrrrrrrr.",
      "..RRrrrrrrrrRR..", "....rrrrrrrr....", "....rrrrrrrr....", "....rrrrrrrr....", "....rrrrrrrr....", "....rrrrrrrR....",
      "....RRRRRRRR....", "................", "................", "................"]),
    shirt: sp("c-shirt", [
      "................", "....WWW..WWW....", "..ccccWWWWcccc..", ".cccccccKcccccc.", "cc.cccccccccc.cc", "cc.ccccKccccc.cc",
      "cc.cccccccccc.cc", "cc.ccccKccccc.cc", "cc.cccccccccc.cc", "cc.ccccKccccc.cc", "WW.cccccccccC.WW", "...CCCCCCCCCC...",
      "................", "................", "................", "................"]),
    jacket: sp("c-jacket", [
      "................", "....vvv..vvv....", "..vvvvvvvvvvvv..", ".vvvvvvyvvvvvvv.", "vv.vvvvyvvvvv.vv", "vv.vvvvyvvvvv.vv",
      "vv.vVvvyvvvVv.vv", "vv.vvvvyvvvvv.vv", "VV.VVVVVVVVVV.VV", "................", "................", "................",
      "................", "................", "................", "................"]),
    coat: sp("c-coat", [
      "................", "....nnn..nnn....", "..nnnnNNNNnnnn..", ".nnnnnnnnnnnnnn.", "nn.nnnnnynnnn.nn", "nn.nnnnnnnnnn.nn",
      "nn.nnnnnynnnn.nn", "nn.nnnnnnnnnn.nn", "nn.nnnnnynnnn.nn", "NN.nnnnnnnnnn.NN", "...nnnnnnnnnn...", "...nnnnnnnnnn...",
      "...nnnnnNnnnn...", "...NNNNNNNNNN...", "................", "................"]),
    jeans: sp("c-jeans", [
      "................", "....bbbbbbbb....", "....bybbbbyb....", "....bbbbbbbb....", "....bbbbbbbb....", "....bbb..bbb....",
      "....byb..byb....", "....bbb..bbb....", "....bbb..bbb....", "....byb..byb....", "....bbb..bbb....", "....bbb..bbb....",
      "....byb..byb....", "....BBB..BBB....", "................", "................"]),
    pants: sp("c-pants", [
      "................", "....KKKKKKKK....", "....ggggyggg....", "....gggggggg....", "....gggggggg....", "....ggg..ggg....",
      "....ggg..ggg....", "....ggg..ggg....", "....ggg..ggg....", "....ggg..ggg....", "....ggg..ggg....", "....ggg..ggg....",
      "....ggG..ggG....", "....GGG..GGG....", "................", "................"]),
    shorts: sp("c-shorts", [
      "................", "................", "................", "....oooooooo....", "....oooooooo....", "....oooooooo....",
      "...ooooo.oooo...", "...oooo..oooo...", "...OOOO..OOOO...", "................", "................", "................",
      "................", "................", "................", "................"]),
    skirt: sp("c-skirt", [
      "................", "................", "................", ".....pppppp.....", ".....pppppp.....", "....pppPpppp....",
      "....pppPpppp....", "...ppppPppppp...", "...ppppPppppp...", "..pppppPpppppp..", "..PPPPPPPPPPPP..", "................",
      "................", "................", "................", "................"]),
    dress: sp("c-dress", [
      "................", ".....h....h.....", ".....h....h.....", ".....hhhhhh.....", ".....hhWWhh.....", ".....hhhhhh.....",
      ".....hhhhhh.....", "....hhhhhhhh....", "....hhhhhhhh....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..",
      "..hhhhhhhhhhhh..", "..RRRRRRRRRRRR..", "................", "................"]),
    shoes: sp("c-shoes", [
      "................", "................", "................", "................", "................", "................",
      "..rrr.....rrr...", "..rrrr....rrrr..", "..rWrrr...rWrrr.", "..rrrrrr..rrrrrr", "..WWWWWW..WWWWWW", "................",
      "................", "................", "................", "................"]),
    socks: sp("c-socks", [
      "................", "...WWW....WWW...", "...rrr....rrr...", "...WWW....WWW...", "...WWW....WWW...", "...rrr....rrr...",
      "...WWW....WWW...", "...WWW....WWW...", "...WWWW...WWWW..", "...WWWWW..WWWWW.", "...WWWWW..WWWWW.", "................",
      "................", "................", "................", "................"]),
  };
  PX.clothes = (item) => one(CLOTHES[item]);
  // A plain gray dress-up mannequin (32×56) for the clothes to be pinned on.
  PX.mannequin = () => {
    const M = PX.shapes(32, 56), g = M.grid();
    M.disc(g, 15.5, 7, 5.5); M.rect(g, 14, 12, 4, 3); M.roundRect(g, 8, 14, 16, 18, 4);
    M.rect(g, 5, 15, 3, 14); M.rect(g, 24, 15, 3, 14); M.rect(g, 10, 31, 5, 20); M.rect(g, 17, 31, 5, 20); M.rect(g, 13, 51, 6, 4);
    return PX.render(32, 56, [{ sprite: M.lit("mannequin", g), remap: { 3: "#e6e8ec", 1: "#c3c7cf", 2: "#9ca1ab", 4: "#767b86" } }]);
  };
  PX.clothes.items = Object.keys(CLOTHES);
})();
