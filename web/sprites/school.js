/* ===== SCHOOL & ROUTINE ICONS (16×16, outlined) — M04 School Bell =====
 * PX.school(name) -> data URL. math (1+2), Chinese (中) and English (ABC) are text, so the module draws them in CSS.
 */
(function () {
  const ART = {
    science: [
      "................", ".....gggggg.....", "......WWWW......", "......WWWW......", "......WWWW......", ".....WWWWWW.....",
      "....WWWWWWWW....", "...WWllllllWW...", "..WWlllWllllWW..", "..WllllllllllW..", ".WllllWllllllvW.", ".WlllllllllvvvW.",
      ".WWvvvvvvvvvvWW.", "..WWWWWWWWWWWW..", "................", "................"],
    PE: [
      "................", "................", "................", "................", "................", "................",
      ".........rrr....", "........rrWr....", ".......rrrrrr...", "..rrrrrrrWrrrr..", ".rrWWrrrrrrrrrr.", ".rrrrrrrrrrrrrr.",
      ".WWWWWWWWWWWWWW.", "................", "................", "................"],
    music: [
      "................", "......BBBBBBBB..", "......BBBBBBBB..", "......B......B..", "......B......B..", "......B......B..",
      "......B......B..", "......B......B..", "......B......B..", "...BBBB...BBBB..", "..BBBBB..BBBBB..", "..BBBBB..BBBBB..",
      "...BBB....BBB...", "................", "................", "................"],
    art: [
      "................", "................", "................", "....nnnnnnn.....", "..nnnnnnnnnnn...", ".nnrrnnnyynnnn..",
      ".nnrrnnnyynnnnn.", "nnnnnnnnnnnnbbn.", "nnvvnnnnn..nbbn.", "nnvvnnnn....nnn.", ".nnnnnnn...nnn..", ".nnnnhhnnnnnn...",
      "..nnnhhnnnnn....", "....nnnnnn......", "................", "................"],
    "get up": [
      "................", "..rr........rr..", ".rrr.rrrrrr.rrr.", ".rrrrWWWWWWrrrr.", "...rWWWWKWWWr...", "..rWWWWWKWWWWr..",
      "..rWWWWWKWWWWr..", "..rWWWWWKKKWWr..", "..rWWWWWWWWWWr..", "..rWWWWWWWWWWr..", "...rWWWWWWWWr...", "....rrrrrrrr....",
      "...rr......rr...", "................", "................", "................"],
    "go to school": [
      "................", "................", "................", "................", ".yyyyyyyyyyyyyy.", ".yccyccyccyccyy.",
      ".yccyccyccyccyy.", ".yyyyyyyyyyyyyy.", ".yyyKKKKKKyyyyy.", ".YYYYYYYYYYYYYY.", "..KK.......KK...", "..KK.......KK...",
      "................", "................", "................", "................"],
    "go home": [
      "................", ".......rr.......", "......rrrr......", ".....rrrrrr.....", "....rrrrrrrr....", "...rrrrrrrrrr...",
      "..rrrrrrrrrrrr..", "...ssssssssss...", "...sccssssccs...", "...sccssssccs...", "...sssnnsssss...", "...sssnnsssss...",
      "...sssnnsssss...", "...SSSSSSSSSS...", "................", "................"],
    "do my homework": [
      "................", "............oo..", "...........yyo..", "..........yyY...", "..WWWWWWWyyYW...", "..KWWWWWyyYWW...",
      "..WWgggyyYggW...", "..KWWWWnYWWWW...", "..WWggggggggW...", "..KWWWWWWWWWW...", "..WWggggggggW...", "..KWWWWWWWWWW...",
      "..WWggggggggW...", "..WWWWWWWWWWW...", "................", "................"],
    study: [
      "................", "................", "................", "................", "................", ".WWWWWWKKWWWWWW.",
      ".WggggWKKWggggW.", ".WWWWWWKKWWWWWW.", ".WggggWKKWggggW.", ".WWWWWWKKWWWWWW.", ".bbbbbbbbbbbbbb.", "..nnnnnnnnnnnn..",
      "..n..........n..", "..n..........n..", "................", "................"],
    "go to bed": [
      "................", "................", "................", "................", "................", "nn..............",
      "nnWWW...........", "nnWWWbbbbbbbbbb.", "nnbbbbbbbbbbbbb.", "nnbbbbbbbbbbbbbn", "nnBBBBBBBBBBBBBn", "n..............n",
      "................", "................", "................", "................"],
  };
  const sprites = Object.fromEntries(Object.entries(ART).map(([k, rows]) => [k, PX.sprite("school-" + k, rows)]));
  PX.school = (name) => (sprites[name] ? PX.render(16, 16, [{ sprite: sprites[name] }]) : null);
})();
