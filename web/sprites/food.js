/* ===== FOOD & DRINK SPRITES (16×16, outlined) — M02 Lunch Rush, M10 Gift Shop, Vending Machine, ... =====
 * PX.food(word) -> data URL. Cooked / burned looks are CSS filters on the same picture.
 */
(function () {
  const S = (rows) => rows;
  const ART = {
    apple: S([
      "................", ".......n........", ".......nvv......", "......n.vvv.....", "...rrrrnrrrr....", "..rrWrrrrrrrr...",
      ".rrWrrrrrrrrrR..", ".rrrrrrrrrrrrR..", ".rrrrrrrrrrrRR..", ".rrrrrrrrrrrRR..", ".rrrrrrrrrrRRR..", "..rrrrrrrrRRR...",
      "..rrrrrrrRRRR...", "...rrrRRRRRR....", "....rRR..RRR....", "................"]),
    banana: S([
      "................", ".............N..", "............yN..", "...........yyY..", "..........yyyY..", ".........yyyyY..",
      "........yyyyYY..", ".......yyyyyY...", "......yyyyyYY...", "....yyyyyyYY....", "..yyyyyyyYY.....", ".NyyyyyYYY......",
      "..YYYYYYY.......", "................", "................", "................"]),
    orange: S([
      "................", ".......vv.......", ".......nvv......", "....oooonooo....", "...ooWoooooooo..", "..ooWooooooooOO.",
      "..oooooooooooOO.", "..ooooooooooOOO.", "..ooooooooooOOO.", "..oooooooooOOOO.", "...ooooooooOOO..", "...ooooooOOOOO..",
      "....ooooOOOOO...", "......OOOOO.....", "................", "................"]),
    egg: S([
      "................", "......WWWW......", ".....WWWWWW.....", "....WWWWWWWW....", "....WWWWWWWg....", "...WWWWWWWWWg...",
      "...WWWWWWWWWg...", "...WWWWWWWWgg...", "...WWWWWWWWgg...", "...WWWWWWWggg...", "....WWWWWggg....", "....WWWWgggg....",
      ".....Wggggg.....", "................", "................", "................"]),
    beef: S([
      "................", "................", "....RRRRRR......", "...RrrrrrrRR....", "..RrrrWrrrrrR...", "..RrrrrrrrrrrR..",
      ".RrrrrrrrWrrrR..", ".RrrWrrrrrrrrrR.", ".RrrrrrrrrrrrrR.", ".RrrrrrrrrrWrrR.", "..RrrrrrWrrrrR..", "..RRrrrrrrrrRR..",
      "....RRRRrrRR....", "........RR......", "................", "................"]),
    pork: S([
      "................", "................", ".....WWWWWW.....", "...WWhhhhhhWW...", "..WhhhhhhhhhhW..", "..WhhhhhhhhhhW..",
      ".WhhhhhhhhhhhW..", ".WhhhhhhhhhhW...", ".WhhhhhhhhhW....", "..WhhhhhhhW.....", "...WWhhhhW......", ".....WWWgW......",
      ".......WgWW.....", ".......WWgW.....", "........WW......", "................"]),
    chicken: S([
      "................", ".....ssss.......", "...sssssss......", "..ssssssssS.....", "..sssssssSS.....", "..ssssssSSS.....",
      "..sssssSSS......", "...ssSSSS.......", "....SSSSW.......", ".......WW.......", "........WW......", ".......WWWW.....",
      ".......WW.WW....", "........W.......", "................", "................"]),
    rice: S([
      "................", "................", "................", ".....WWWWWW.....", "...WWWWWWWWWW...", "..WWWWWWWWWWWg..",
      ".bbbbbbbbbbbbbb.", ".bccccccccccccb.", "..bccccccccccb..", "..bbccccccccbb..", "...bbbbbbbbbb...", ".....bbbbbb.....",
      "....BBBBBBBB....", "................", "................", "................"]),
    bread: S([
      "................", "................", "................", "....SSSSSSSS....", "..SSSsSSSSsSSS..", ".SSSSSSSSSSSSSS.",
      ".SssssssssssssS.", ".SssssssssssssS.", ".SssssssssssssS.", ".SssssssssssssS.", ".SsssssssssssSS.", ".SSSSSSSSSSSSSS.",
      "................", "................", "................", "................"]),
    cake: S([
      "................", ".......r........", ".......y........", ".......W........", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..",
      "..hWhhhhhhhhhh..", "..ssssssssssss..", "..hhhhhhhhhhhh..", "..ssssssssssss..", "..ssssssssssss..", "..SSSSSSSSSSSS..",
      ".gggggggggggggg.", "................", "................", "................"]),
    sandwich: S([
      "................", "................", "................", "..WWWWWWWWWWWW..", ".WWWWWWWWWWWWWg.", ".ssssssssssssss.",
      ".llvllvllvllvll.", ".rrrrrrrrrrrrrr.", ".yyyyyyyyyyyyyy.", ".WWWWWWWWWWWWWW.", ".WWWWWWWWWWWWWg.", "..ssssssssssss..",
      "................", "................", "................", "................"]),
    hamburger: S([
      "................", "................", ".....oooooo.....", "...oooWoooWoo...", "..ooWoooooooWoo.", "..ooooooooooooo.",
      ".lllvlllvlllvll.", ".yyyyyyyyyyyyyy.", ".NNNNNNNNNNNNNN.", ".NnNNNNnNNNNnNN.", "..oooooooooooo..", "..OOOOOOOOOOOO..",
      "................", "................", "................", "................"]),
    "hot dog": S([
      "................", "................", "................", "................", "...rrrrrrrrrr...", "..rRyrryrryrrR..",
      ".oooooooooooooo.", ".ooOoooooooooOo.", "..OOOOOOOOOOOO..", "................", "................", "................",
      "................", "................", "................", "................"]),
    pizza: S([
      "................", ".SSSSSSSSSSSSSS.", ".SSyyyyyyyyyySS.", "..yyryyyyyyry...", "..yyyyyyyyyyyy..", "...yyyyrryyyy...",
      "...yyyyrryyyy...", "....yyyyyyyy....", "....yryyyyyy....", ".....yyyyyy.....", ".....yyyyry.....", "......yyyy......",
      "......yyyy......", ".......yy.......", ".......yy.......", "................"]),
    "ice cream": S([
      "................", ".....hhhhh......", "....hhWhhhh.....", "...hhWhhhhhh....", "...hhhhhhhhh....", "..hhhhhhhhhhh...",
      "..hhhhhhhhhhh...", "..ooOooOooOoo...", "...oOooOooOo....", "...ooOooOooo....", "....oOooOoo.....", "....ooOooo......",
      ".....oOoo.......", ".....ooo........", "......o.........", "................"]),
    milk: S([
      "................", ".......gg.......", "......WWWW......", ".....WWWWWW.....", "....WWWWWWWW....", "....gggggggg....",
      "....WWWWWWWW....", "....WbbbbbbW....", "....WbWWWWbW....", "....WbbbbbbW....", "....WWWWWWWW....", "....WWWWWWWW....",
      "....WWWWWWWW....", "....gggggggg....", "................", "................"]),
    juice: S([
      "..........W.....", ".........W......", ".........W......", ".....ooooWoo....", ".....oooooooO...", ".....oyyyyyoO...",
      ".....oyvvvyoO...", ".....oyvvvyoO...", ".....oyyyyyoO...", ".....oooooooO...", ".....oooooooO...", ".....oooooooO...",
      ".....OOOOOOOO...", "................", "................", "................"]),
    water: S([
      "................", "................", "....WWWWWWWW....", "....WWWWWWWW....", "....WccccccW....", "....WcWcccCW....",
      "....WcWcccCW....", "....WccccccW....", ".....WccccW.....", ".....WccccW.....", ".....WccCCW.....", ".....WWWWWW.....",
      "................", "................", "................", "................"]),
    tea: S([
      "................", "................", "................", "................", "...WWWWWWWWW....", "...WOOOOOOOWWW..",
      "...WWWWWWWWW.W..", "...WWWWWWWWW.W..", "...WWWWWWWWWWW..", "....WWWWWWW.....", ".....WWWWW......", "..ggggggggggg...",
      "................", "................", "................", "................"]),
    coffee: S([
      "................", "................", "................", "...bbbbbbbbb....", "...bNNNNNNNbbb..", "...bbbbbbbbb.b..",
      "...bbbbbbbbb.b..", "...bbbbbbbbb.b..", "...bbbbbbbbbbb..", "...bbbbbbbbb....", "...bbbbbbbbb....", "....BBBBBBB.....",
      "................", "................", "................", "................"]),
    // Meal pictures for the trays.
    breakfast: S([
      "................", "................", ".......y........", "...y...y...y....", "....y.....y.....", "................",
      "......yyy.......", ".....yyyyy......", ".y..yyyyyyy..y..", "....yyyyyyy.....", "bbbbbbbbbbbbbbbb", "BBBBBBBBBBBBBBBB",
      "................", "................", "................", "................"]),
    lunch: S([
      ".......y........", "..y....y....y...", "...y.......y....", "......yyy.......", ".....yyyyy......", "....yyyyyyy.....",
      "yy..yyyyyyY..yy.", "....yyyyyYY.....", ".....yyyYY......", "......yYY.......", "...y.......y....", "..y....y....y...",
      ".......y........", "................", "................", "................"]),
    dinner: S([
      "................", "...........W....", "..W.....yyy.....", ".......yyy......", "......yyy.......", ".....yyyy...W...",
      ".....yyyy.......", ".....yyyy.......", "......yyy.......", ".......yyy......", "...W....yyy.....", "................",
      "................", "................", "................", "................"]),
    // Vending Machine snacks
    cookie: S([
      "................", ".....ooooo......", "...ooooooooo....", "..ooNoooooooO...", "..oooooooNooO...", ".oooooooooooOO..",
      ".ooooNoooooooO..", ".oooooooooNooO..", ".ooNooooooooOO..", "..oooooNoooOO...", "..OooooooooOO...", "...OOOoooOOO....",
      ".....OOOOO......", "................", "................", "................"]),
    chips: S([
      "................", "...rrrrrrrrrr...", "...RrRrRrRrRr...", "...yyyyyyyyyY...", "...yWyyyyyyyY...", "...yyyoooOyyY...",
      "...yyooooOOyY...", "...yyooooOOyY...", "...yyyoooOyyY...", "...yyyyyyyyyY...", "...rrrrrrrrrR...", "...RrRrRrRrRR...",
      "................", "................", "................", "................"]),
    soda: S([
      "................", ".....gggggg.....", "....gWgggggG....", "....rrrrrrrR....", "....rWrrrrrR....", "....rWrrrrRR....",
      "....WWWWWWWg....", "....rWrrrrRR....", "....rWrrrrrR....", "....rrrrrrrR....", "....rrrrrrRR....", "....gggggggG....",
      ".....GGGGGG.....", "................", "................", "................"]),
    carrot: S([
      "..........v.v...", "..........vvv.v.", ".........ovvvv..", "........oooVv...", ".......oooooO...", "......oWoooO....",
      ".....ooooOoO....", "....oWoooOO.....", "...oooOooO......", "...ooooOO.......", "..ooOoO.........", "..ooO...........",
      ".oO.............", "................", "................", "................"]),
    candy: S([
      "................", "................", "................", "................", "................", "..p..........p..",
      "..pp..hhhhh..pp.", "..ppphWhhhhhppp.", "..pppWhhhhhRppp.", "..ppphhhhhRRppp.", "..pp..hhRRR..pp.", "..p..........p..",
      "................", "................", "................", "................"]),
  };

  const sprites = Object.fromEntries(Object.entries(ART).map(([k, rows]) => [k, PX.sprite("food-" + k, rows)]));
  PX.food = (word) => PX.render(16, 16, [{ sprite: sprites[word] }]);
  PX.food.words = Object.keys(ART);
})();
