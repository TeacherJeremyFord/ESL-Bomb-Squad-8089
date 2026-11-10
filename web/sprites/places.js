/* ===== PLACES & TRANSPORT (16×16, outlined) — M05 Ticket Machine =====
 * PX.place(name) / PX.way(name) -> data URL. No words in the pictures (the bank has a gold coin, the library tall shelves…).
 */
(function () {
  const PLACES = {
    home: [
      "................", ".......rr.......", "......rrrr......", ".....rrrrrr.....", "....rrrrrrrr....", "...rrrrrrrrrr...",
      "..rrrrrrrrrrrr..", "...ssssssssss...", "...sccssssccs...", "...sccssssccs...", "...sssnnsssss...", "...sssnnsssss...",
      "...sssnnsssss...", "...SSSSSSSSSS...", "lllllllllllllvvv", "................"],
    school: [
      ".......r........", ".......rrr......", ".......K........", "......yyy.......", ".....yyyyy......", "..oooooooooooo..",
      "..oWcWWcWWcWWo..", "..oWcWWcWWcWWo..", "..oooooooooooo..", "..oWcWWnnWWcWo..", "..oWcWWnnWWcWo..", "..oooooonooooo..".slice(0, 16),
      "..OOOOOOOOOOOO..", "lllllllllllllvvv", "................", "................"],
    bank: [
      "................", ".......gg.......", ".....gggggg.....", "...gggggggggg...", "..GGGGGGGGGGGG..", "..WWWWWWWWWWWW..",
      "..WgWWgWWgWWgW..", "..WgWyyyyWWgWW..".slice(0, 16), "..WgyyYYyyWgWW..".slice(0, 16), "..WgyyYYyyWgWW..".slice(0, 16), "..WgWyyyyWWgWW..".slice(0, 16), "..WgWWgWWgWWgW..",
      "..GGGGGGGGGGGG..", ".GGGGGGGGGGGGGG.", "................", "................"],
    library: [
      "................", "...nnnnnnnnnn...", "...nrbyvrbpyvn..", "...nrbyvrbpyvn..", "...nnnnnnnnnnn..", "...nvpybrvybrn..",
      "...nvpybrvybrn..", "...nnnnnnnnnnn..", "...nbrvpybrvpn..", "...nbrvpybrvpn..", "...nnnnnnnnnnn..", "...nyrbvpyrbvn..",
      "...nyrbvpyrbvn..", "...NNNNNNNNNNN..", "................", "................"],
    bookstore: [
      "................", "..rrWrrWrrWrrW..", "..rrWrrWrrWrrW..", "..ssssssssssss..", "..sKKKKKKKKKss..", "..sKrbyvpbrKss..",
      "..sKrbyvpbrKss..", "..sKKKKKKKKKss..", "..ssssssssssss..", "..sssssnnsssss..", "..sssssnnsssss..", "..sssssnnsssss..",
      "..SSSSSSSSSSSS..", "................", "................", "................"],
    zoo: [
      "................", ".K.K.K.K.K.K.K..", ".K.K.K.K.K.K.K..", ".KoooooooooooK..", ".KoWoooooooWoK..".slice(0, 16), ".KooKooooKoooK..",
      ".KoooooooooooK..", ".KoooWWWWoooK...".slice(0, 16), ".KooWWKKWWooK...".slice(0, 16), ".KoooWWWWoooK...".slice(0, 16), ".KoooooooooooK..", ".K.K.K.K.K.K.K..",
      ".KKKKKKKKKKKKK..", "lllllllllllllvvv", "................", "................"],
    farm: [
      "................", "......rrrr......", ".....rrrrrr.....", "....rrrrrrrr....", "...rrrrrrrrrr...", "..RRRRRRRRRRRR..",
      "..rrrWWWWWWrrr..", "..rrrWrWWrWrrr..", "..rrrWWrrWWrrr..", "..rrrWrWWrWrrr..", "..rrrWWWWWWrrr..", "..rrrrrrrrrrrr..",
      "..RRRRRRRRRRRR..", "yyyyllllllllyyyy", "................", "................"],
    park: [
      "................", ".....vvvvv......", "...vvlllvvv.....", "..vlllllllvv....", "..vllllllllv....", "..vvllllllvv....",
      "...vvvvvvvv.....", "......nn........", "......nn...nnnnn", "......nn...n...n", "......nn...nnnnn", "......nn...n...n",
      "lllllllllllllvvv", "lvllllvllllllvll", "................", "................"],
    lake: [
      "................", "................", ".v..........v...", ".v.v......v.v...", ".vvv..cccc.vvv..", "..cccccWWcccccc.",
      ".ccWWccccccccWcc", ".cccccccccWWcccc", "..cccWWcccccccc.", "...cccccccccc...", ".....cccccc.....", "................",
      "................", "................", "................", "................"],
    sea: [
      "................", "................", "....y...........", "...yyy..........", "....y...........", "................",
      "..W.....W.....W.", ".WcW...WcW...WcW", "WcccW.WcccW.Wccc", "cccccccccccccccc", "CccccccCcccccccC", "cccccccccccccccc",
      "CCCCCCCCCCCCCCCC", "................", "................", "................"],
  };
  const WAYS = {
    car: [
      "................", "................", "................", "................", "....rrrrrr......", "...rrccrccr.....",
      "..rrrccrccrr....", ".rrrrrrrrrrrrr..", ".rWrrrrrrrrrWrr.", ".rrrrrrrrrrrrrr.", "..KKK.....KKK...", "..KgK.....KgK...",
      "..KKK.....KKK...", "................", "................", "................"],
    taxi: [
      "................", "................", "......rKr.......", "......yyy.......", "....yyyyyy......", "...yyccyccy.....",
      "..yyyccyccyy....", ".yyyyyyyyyyyyy..", ".yKyKyKyKyKyKyy.", ".yyyyyyyyyyyyyy.", "..KKK.....KKK...", "..KgK.....KgK...",
      "..KKK.....KKK...", "................", "................", "................"],
    bike: [
      "................", "................", "................", "................", ".......rrr......", "......r..r......",
      ".....rrrrrr.KK..", "..KKKr...r.KKK..", ".K...r...rK...K.", "K....K...K.....K", "K...KrrrrrK....K", "K....K...K.....K",
      ".K...K..K.K...K.", "..KKK.....KKK...", "................", "................"],
    bus: [
      "................", "................", "................", "................", ".yyyyyyyyyyyyyy.", ".yccyccyccyccyy.",
      ".yccyccyccyccyy.", ".yyyyyyyyyyyyyy.", ".yyyKKKKKKyyyyy.", ".YYYYYYYYYYYYYY.", "..KK.......KK...", "..KK.......KK...",
      "................", "................", "................", "................"],
    train: [
      "................", "..KK............", "..KK............", ".rrrr.rrrrrrrrr.", ".rrrr.rccrccrcr.", ".rrrrrrccrccrcr.",
      ".rrrrrrrrrrrrrr.", ".rrrrrrrrrrrrrr.", ".RRRRRRRRRRRRRR.", "..KK.KK...KK.KK.", "..KK.KK...KK.KK.", "gggggggggggggggg",
      "................", "................", "................", "................"],
    MRT: [
      "................", "................", "....bbbbbbbbbbb.", "...bbcccbcccbcb.", "..bbbcccbcccbcb.", ".bbbbbbbbbbbbbb.",
      ".bWWWWWWWWWWWWb.", ".bbbbbbbbbbbbbb.", ".BBBBBBBBBBBBBB.", "...KK......KK...", "gggggggggggggggg", "................",
      "................", "................", "................", "................"],
    "on foot": [
      "................", "..nnn...........", ".nnnnn..........", ".nnnnn..........", ".nnnnn.....nnn..", "..nnn.....nnnnn.",
      "..........nnnnn.", "..nnn.....nnnnn.", "..nnn......nnn..", "...............".padEnd(16, "."), "...........nnn..", "...........nnn..",
      "................", "................", "................", "................"],
    plane: [
      "................", ".......W........", "......WWW.......", "......WWW.......", ".....WWbWW......", "..WWWWWbWWWWW...",
      ".WWWWWWbWWWWWW..", "......WbW.......", "......WbW.......", ".....WWWWW......", "......WWW.......", "................",
      "................", "................", "................", "................"],
    ship: [
      "................", "......rr........", "......gg..rr....", "......gg..gg....", "....WWWWWWWWW...", "...WWcWcWcWcWW..",
      "...WWWWWWWWWWW..", ".rrrrrrrrrrrrrr.", "..rrrrrrrrrrrr..", "...RRRRRRRRRR...", "cccccccccccccccc", "CccccCccccCccccC",
      "................", "................", "................", "................"],
    boat: [
      "................", "................", ".......n........", ".......nW.......", ".......nWW......", ".......nWWW.....",
      ".......nWWWW....", ".......nWWWWW...", ".......n........", "...nnnnnnnnnn...", "....nnnnnnnn....", "cccccccccccccccc",
      "CccccCccccCccccC", "................", "................", "................"],
  };
  const RAIN = [
    "................", "......gggg......", "....gggggggg....", "...gggggggggg...", "..gggggggggggg..", "..GGGGGGGGGGGG..",
    "................", "...c...c...c....", "..c...c...c.....", "................", "....c...c...c...", "...c...c...c....",
    "................", "................", "................", "................"];
  const mk = (pre, set) => Object.fromEntries(Object.entries(set).map(([k, r]) => [k, PX.sprite(pre + k, r)]));
  const P = mk("place-", PLACES), Wy = mk("way-", WAYS), R = PX.sprite("wx-rain", RAIN);
  const one = (s) => PX.render(16, 16, [{ sprite: s }]);
  PX.place = (n) => one(P[n]);
  PX.way = (n) => one(Wy[n]);
  PX.rainChip = () => one(R);
})();
