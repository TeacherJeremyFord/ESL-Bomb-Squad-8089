/* ===== SYMBOLS (16×16, outlined) — Symbol Keypad, Symbol Panel =====
 * PX.glyph(name): one-color keypad marks — copyright star empty-star diamonds phone flower
 * PX.symbol(name): Symbol Panel pictures — tree fish fire fox cactus gem star, plus apple pizza hamburger (food),
 *   cat (animals) and flower (toys)
 */
(function () {
  const N = 16;
  // Rows from a predicate, for the round shapes.
  const fill = (on) => Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => (on(x, y) ? "W" : ".")).join(""));
  const STAR = [
    ".......WW.......", ".......WW.......", "......WWWW......", "......WWWW......", ".WWWWWWWWWWWWWW.", "..WWWWWWWWWWWW..",
    "...WWWWWWWWWW...", "....WWWWWWWW....", "....WWWWWWWW....", "...WWWWWWWWWW...", "...WWWW..WWWW...", "..WWW......WWW..",
    "..WW........WW..", "................", "................", "................"];
  const at = (rows, x, y) => rows[y] && rows[y][x] === "W";
  const GLYPHS = {
    copyright: [
      "................", ".....WWWWWW.....", "...WWWWWWWWWW...", "..WWW......WWW..", ".WWW..WWWW..WWW.", ".WW..WWWWWW..WW.",
      ".WW..WW......WW.", ".WW..WW......WW.", ".WW..WW......WW.", ".WW..WWWWWW..WW.", ".WWW..WWWW..WWW.", "..WWW......WWW..",
      "...WWWWWWWWWW...", ".....WWWWWW.....", "................", "................"],
    star: STAR,
    // The star's edge only, 1-2px thick.
    "empty-star": fill((x, y) => at(STAR, x, y) && [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => !at(STAR, x + dx, y + dy)))),
    diamonds: [
      ".......WW.......", "......WWWW......", ".....WWWWWW.....", ".....WWWWWW.....", "......WWWW......", "..WW...WW...WW..",
      ".WWWW......WWWW.", "WWWWWW....WWWWWW", "WWWWWW....WWWWWW", ".WWWW......WWWW.", "..WW...WW...WW..", "......WWWW......",
      ".....WWWWWW.....", ".....WWWWWW.....", "......WWWW......", ".......WW......."],
    phone: [
      "................", "..WWWWWWWWWWWW..", ".WWWWWWWWWWWWWW.", ".WWW........WWW.", ".WW..........WW.", "....WW....WW....",
      "...WWWWWWWWWW...", "..WWWWWWWWWWWW..", "..WWW.W..W.WWW..", "..WWWWWWWWWWWW..", ".WWWW.W..W.WWWW.", ".WWWWWWWWWWWWWW.",
      ".WWWWWWWWWWWWWW.", "................", "................", "................"],
    // Five round petals around a hole.
    flower: fill((x, y) => {
      const dx = x - 7.5, dy = y - 7.5;
      if (dx * dx + dy * dy < 3.5) return false;
      return dx * dx + dy * dy < 9 || [0, 1, 2, 3, 4].some((i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return (dx - 4.9 * Math.cos(a)) ** 2 + (dy - 4.9 * Math.sin(a)) ** 2 <= 6.5; });
    }),
  };
  // Glyphs are drawn in W; light gray on the lower edge so they read as raised keys.
  const G = Object.fromEntries(Object.entries(GLYPHS).map(([k, rows]) => [k, PX.sprite("glyph-" + k, rows.map((r, y) => [...r].map((ch, x) => (ch === "W" && !at(rows, x, y + 1) ? "g" : ch)).join("")))]));
  PX.glyph = (name) => PX.render(N, N, [{ sprite: G[name] }]);
  PX.glyph.names = Object.keys(GLYPHS);

  const ART = {
    tree: [
      "................", ".....vvvvv......", "...vvlllvvv.....", "..vlllllvvvvv...", ".vllllvvvvvvvV..", ".vlllvvvvvvvvV..",
      ".vvvvvvvvvvvVV..", "..vvvvvvvvvVVV..", "...vVVvvvVVVV...", ".....VVnNVV.....", "......nnN.......", "......nnN.......",
      "......nnN.......", ".....nnnNN......", "................", "................"],
    fish: [
      "................", "................", "................", "................", "......cccc......", "....cccccccc..cc",
      "..ccKcccccccCcC.", ".ccccccccccCCCC.", ".cWcccccccCCcCC.", "..ccccccccCC.cC.", "....cCCCCCC...CC", "......CCCC......",
      "................", "................", "................", "................"],
    fire: [
      "................", ".......r........", "......rr........", "......rro.......", ".....rrroo..r...", "..r..rrooo..rr..",
      "..rr.rroooo.rrr.", ".rrrrroooooorrr.", ".rrroooyyoooorr.", ".rrooyyyyyyoorr.", ".rrooyyWWyyyorr.", "..rooyyWWyyoor..",
      "...rooyyyyoor...", ".....rrrrrr.....", "................", "................"],
    fox: [
      "................", "..K..........K..", "..OO........OO..", "..ooo......ooo..", "..oooooooooooo..", ".oooooooooooooo.",
      ".ooKooooooooKoo.", ".WWooooooooooWW.", "..WWWooooooWWW..", "...WWWWKKWWWW...", ".....WWWWWW.....", ".......WW.......",
      "................", "................", "................", "................"],
    cactus: [
      "......vv........", ".....vlvv.......", ".....vlvv.......", ".v...vlvv.......", "vlv..vlvv..vv...", "vlv..vlvv.vlvv..",
      "vlvvvvlvv.vlvv..", ".vvvvvlvvvvlvV..", ".....vlvvvvvV...", ".....vlvvV......", ".....vlvvV......", "...OOOOOOOOO....",
      "...oooooooOO....", "....ooooooO.....", "....OOOOOOO.....", "................"],
    gem: [
      "................", "................", "....cccccccc....", "...cWWcccWccc...", "..cccccccccccc..", ".CCCCCCCCCCCCCC.",
      "..cccWcccccCcC..", "...cccWcccCcC...", "....cccWcCcC....", ".....cccCcC.....", "......ccCC......", ".......cC.......",
      "................", "................", "................", "................"],
  };
  const A = Object.fromEntries(Object.entries(ART).map(([k, r]) => [k, PX.sprite("symbol-" + k, r)]));
  PX.symbol = (name) => {
    if (A[name]) return PX.render(N, N, [{ sprite: A[name] }]);
    if (name === "star") return PX.render(N, N, [{ sprite: G.star, remap: { W: "#f7d843", g: "#c99a1f" } }]);
    if (name === "cat") return PX.animal(name);
    if (name === "flower") return PX.toy(name);
    return PX.food(name);
  };
})();
