/* ===== DESK THINGS & HOLDERS (16×16, outlined) — M06 Messy Desk =====
 * PX.thing(kind, color) -> data URL. Slot 1 = the thing's color, 2 = its shade, so color is exact.
 * PX.holder(name) -> data URL (neutral colors, so the 10 thing colors never get lost against them).
 */
(function () {
  const COLORS = {
    red: ["#e04848", "#9a2b3a"], blue: ["#3f6fd8", "#2a3f8f"], yellow: ["#f7d843", "#c99a1f"], green: ["#3f9e45", "#25663a"],
    black: ["#2d2d3a", "#121218"], white: ["#f6f4ef", "#bfc3c9"], pink: ["#f59ab8", "#c96d8d"], purple: ["#a65bd6", "#6a3399"],
    brown: ["#8b5a2b", "#5a3618"], gray: ["#a3a8b2", "#5d6372"],
  };
  const pad = (rows) => { while (rows.length < 16) rows.push("................"); return rows; };
  const THINGS = {
    pen: pad(["................", "................", "................", "................", "................", "....1...........",
      "..11111111111g..", ".1111111111111gK", "..22222222222g.."]),
    marker: pad(["................", "................", "................", "................", "................", "................",
      ".2221111111111..", ".22211111111111K", ".22211111111111K", ".2221111111111.."]),
    eraser: pad(["................", "................", "................", "................", "................", "................",
      "....11111WWW....", "...111111WWWW...", "...111111WWWW...", "...222222gggg..."]),
    book: pad(["................", "................", "................", "..111111111111..", "..1111111111112.", "..11WWWWWW11112.",
      "..1111111111112.", "..1111111111112.", "..WWWWWWWWWWWW2.", "..222222222222.."]),
    key: pad(["................", "................", "................", "................", "................", "..111...........",
      ".1...1111111111.", ".1...1111111111.", "..111......1.1.."]),
  };
  const HOLDERS = {
    computer: pad(["................", ".gggggggggggggg.", ".gccccccccccccg.", ".gcWccccccccccg.", ".gccccccccccccg.", ".gccccccccccccg.",
      ".gccccccccccccg.", ".gggggggggggggg.", "......gggg......", "....GGGGGGGG...."]),
    box: pad(["................", "................", "................", "................", ".SS..........SS.", ".SSSSSSSSSSSSSS.",
      ".SssssssnssssssS", ".SssssssnssssssS".slice(0, 16), ".SssssssnsssssS.", ".SsssssssssssssS".slice(0, 16), ".SSSSSSSSSSSSSS."]),
    bag: pad(["................", "................", ".....nnnnnn.....", "....n......n....", "....n......n....", "..ssssssssssss..",
      ".ssssssssssssss.", ".ssssssnnsssssS.", ".sssssssssssssS.", ".ssssssssssssSS.", "..SSSSSSSSSSSS.."]),
    bookbag: pad(["................", "......gggg......", ".....g....g.....", "...gggggggggg...", "..gggggggggggG..", "..ggGGGGGGGGgG..",
      "..ggGggggggGgG..", "..ggGGGGGGGGgG..", "..gggggggggggG..", "..gggggggggggG..", "...GGGGGGGGGG..."]),
    cup: pad(["................", "................", "................", "....WWWWWWWW....", "....gggggggg....", "....gWggggggG...",
      "....gWggggggG...", "....gggggggg G..".replace(" ", "g").slice(0, 16), "....ggggggggG...".slice(0, 16), "....GGGGGGGG...."]),
  };
  const mk = (pre, set) => Object.fromEntries(Object.entries(set).map(([k, r]) => [k, PX.sprite(pre + k, r)]));
  const T = mk("thing-", THINGS), Hd = mk("holder-", HOLDERS);
  PX.thing = (kind, color) => PX.render(16, 16, [{ sprite: T[kind], remap: { 1: COLORS[color][0], 2: COLORS[color][1] } }]);
  PX.holder = (name) => PX.render(16, 16, [{ sprite: Hd[name] }]);
})();
