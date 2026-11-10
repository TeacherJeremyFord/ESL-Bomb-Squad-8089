/* ===== ANIMAL HEAD SPRITES (16×16, outlined) — Guess Who agents, M12 Animal Race Day, ... =====
 * PX.animal(name) -> data URL
 */
(function () {
  const ART = {
    turtle: [
      "................", "................", "................", "................", ".....vvvvvv.....", "....vVvvVvvv....",
      "...vvvVvvvVvv...", "..vvVvvvVvvvVv..", "..vvvvvvvvvvvvll", "..VVVVVVVVVVVVlK", "...ll......ll.ll", "...ll......ll...",
      "................", "................", "................", "................"],
    cat: [
      "................", "..o..........o..", "..oo........oo..", "..ooo......ooo..", "..oooooooooooo..", ".oooooooooooooo.",
      ".ooKooooooooKoo.", ".oooooooooooooo.", ".oooooohhoooooo.", "W.ooooKKKKoooo.W", ".W.oooooooooo.W.", "....oooooooo....",
      "................", "................", "................", "................"],
    frog: [
      "................", "................", "...WWW....WWW...", "..WWKWW..WWKWW..", "..lWWWllllWWWl..", ".llllllllllllll.",
      ".llllllllllllll.", ".lllllllllllll l".replace(" ", "l"), ".lKKKKKKKKKKKKl.", "..llllllllllll..", "...vvvvvvvvvv...", "................",
      "................", "................", "................", "................"],
    bird: [
      "................", "................", ".....bbbbb......", "....bbbbbbb.....", "...bbWKbbbbb....", "...bbbbbbbbbyy..",
      "...bbbbbbbbbyyy.", "...bbbbbbbbbyy..", "..bbbcccbbbb....", ".bbbbcccbbbb....", "bbbbbbbbbbb.....", "...bbbbbbb......",
      "....y...y.......", "...yy..yy.......", "................", "................"],
    fish: [
      "................", "...WWWWWWWWWW...", "..W..........W..", ".W..ccccccc...W.", ".W.cccooooccc.W.", ".Wccoooooooocc W".replace(" ", "W").slice(0, 16), ".WccoKooooooo.W.".replace("o.W", "o.W"),
      ".Wcccooooooocc.W".slice(0, 16), ".W.ccccoooocc.W.", ".W..cccccccc..W.", "..W..........W..", "...WWWWWWWWWW...", "....nn....nn....",
      "....nn....nn....", "................", "................"],
    lion: [
      "................", "....OOOOOOOO....", "..OOOOOOOOOOOO..", ".OOOyyyyyyyyOOO.", ".OOyyyyyyyyyyOO.", "OOyyKyyyyyyKyyOO",
      "OOyyyyyyyyyyyyOO", "OOyyyyyNNyyyyyOO", ".OOyyyyyyyyyyOO.", ".OOOyyKKKKyyOOO.", "..OOOyyyyyyOOO..", "....OOOOOOOO....",
      "................", "................", "................", "................"],
    bear: [
      "................", "..nnn......nnn..", ".nnNnn....nnNnn.", ".nnnnnnnnnnnnnn.", "..nnnnnnnnnnnn..", "..nnKnnnnnnKnn..",
      "..nnnnnnnnnnnn..", "..nnnnssssnnnn..", "..nnnssKKssnnn..", "...nnnssssnnn...", "....nnnnnnnn....", "................",
      "................", "................", "................", "................"],
    cow: [
      "................", ".WW..........WW.", "..W.WWWWWWWW.W..", "....WWKKWWWWW...", "...WKKKWWWWKWW..", "...WWKWWWWWWWW..",
      "...WWKWWWWKWWW..", "...WWWWWWWWWWW..", "...hhhhhhhhhhh..", "...hKhhhhhhhKh..", "...hhhhhhhhhhh..", "....hhhhhhhhh...",
      "................", "................", "................", "................"],
    rat: [
      "................", "..ggg......ggg..", ".ghhhg....ghhhg.", ".ghhhgggggghhhg.", "..gggggggggggg..", "..gggggggggggg..",
      "..ggKggggggKgg..", "..gggggggggggg..", "...gggggggggg...", "...gggWWWWggg...", "....ggWhhWgg....", ".....gWWWWg.....",
      "......gggg......", "................", "................", "................"],
    ox: [
      "................", ".WW..........WW.", ".WWW........WWW.", "..WWnnnnnnnnWW..", "...nnnnnnnnnn...", "..nnnnnnnnnnnn..",
      "..nnKnnnnnnKnn..", "..nnnnnnnnnnnn..", "...nnnnnnnnnn...", "...nhhhhhhhhn...", "...hhKhhhhKhh...", "...hhhhhhhhhh...",
      "....hhhhhhhh....", "................", "................", "................"],
    tiger: [
      "................", "..oo........oo..", ".oWoo......ooWo.", ".oooooooooooooo.", ".oKooKooooKooKo.", "..oooooooooooo..",
      "..ooKooooooKoo..", ".Kooooooooooooo K".slice(0, 15) + "K", "..ooWWWWWWWWoo..", "..oWWWWKKWWWWo..", "..KoWWWWWWWWoK..", "...ooWWWWWWoo...",
      "....oooooooo....", "................", "................", "................"],
    rabbit: [
      "....WW....WW....", "...WhW....WhW...", "...WhW....WhW...", "...WhW....WhW...", "...WhW....WhW...", "..WWWWWWWWWWWW..",
      ".WWWWWWWWWWWWWW.", ".WWWKWWWWWWKWWW.", ".WWWWWWWWWWWWWW.", ".WWWWWWhhWWWWWW.", "..WWWWWWWWWWWW..", "..WWWWWKKWWWWW..",
      "...WWWWWWWWWW...", ".....WWWWWW.....", "................", "................"],
    dragon: [
      "..y..........y..", "..yy........yy..", "...vv......vv...", "..vvvvvvvvvvvv..", ".vvvvvvvvvvvvvv.", ".vvyKvvvvvvyKvv.",
      ".vvvvvvvvvvvvvv.", ".vlvlvlvlvlvlvv.", "..vvvvvvvvvvvv..", "..llllllllllll..", "..lKllllllllKl..", "..llllllllllll..",
      "...WlWlWlWlWl...", "....rrrr........", "................", "................"],
    snake: [
      "................", ".....vvvvv......", "....vvvvvvv.....", "...vvKvvvKvv....", "...vvvvvvvvv....", "....vvvvvvv.....",
      ".....vvvvv......", "......rr........", ".....r..r.......", "..vvvvvvvvvvv...", ".vvlvvlvvlvvvv..", ".vvvvvvvvvvvvvv.",
      "..vvvvvvvvvvvv..", "...vvlvvlvvlv...", "....vvvvvvvv....", "................"],
    horse: [
      "................", "....n......n....", "....nn....nn....", "....nnNNNNnn....", "....nnNNNNnn....", "...nnnnNNnnnn...",
      "...nKnnnnnnKn...", "...nnnnnnnnnn...", "....nnnnnnnn....", "....nnnnnnnn....", "....nnnnnnnn....", "....ssssssss....",
      "....sKssssKs....", ".....ssssss.....", "................", "................"],
    goat: [
      "..gg........gg..", "...gg......gg...", "....gg....gg....", "..WWWWWWWWWWWW..", ".WWWWWWWWWWWWWW.", "..WWKWWWWWWKWW..",
      "..WWWWWWWWWWWW..", "...WWWWWWWWWW...", "....WWWWWWWW....", "....WWWhhWWW....", ".....WWWWWW.....", "......gggg......",
      "......gggg......", ".......gg.......", "................", "................"],
    monkey: [
      "................", "....nnnnnnnn....", "...nnnnnnnnnn...", ".ssnnnnnnnnnnss.", ".ssnssssssssnss.", ".snsssssssssssn.",
      "..nssKssssKssn..", "..nssssssssssn..", "...ssssssssss...", "...sssKssKsss...", "...ssssssssss...", "....sRRRRRRs....",
      ".....ssssss.....", "................", "................", "................"],
    rooster: [
      ".....r.r.r......", ".....rrrrr......", "....WWWWWWW.....", "...WWWWWWWWW....", "...WWKWWWWWW....", "...WWWWWWWyyy...",
      "...WWWWWWWyyyy..", "...WWWWWWWyy....", "...WWWWWWrr.....", "...WWWWWWrr.....", "..WWWWWWWWW.....", "..WWWWWWWWW.....",
      "...WWWWWWW......", "................", "................", "................"],
    dog: [
      "................", "..NN........NN..", ".NNN.ssssss.NNN.", ".NNssssssssssNN.", ".NNssssssssssNN.", ".NNsKssssssKsNN.",
      ".NNssssssssssNN.", "..NssssssssssN..", "...ssssKKsssss..".slice(0, 16), "...sssssssssss..".slice(0, 16), "....ssshhsss....", ".....ssssss.....",
      "................", "................", "................", "................"],
    pig: [
      "................", "..hh........hh..", "..hhh......hhh..", "..hhhhhhhhhhhh..", ".hhhhhhhhhhhhhh.", ".hhhKhhhhhhKhhh.",
      ".hhhhhhhhhhhhhh.", ".hhhhhRRRRhhhhh.", ".hhhhRhhhhRhhhh.", ".hhhhRKhhKRhhhh.", ".hhhhhRRRRhhhhh.", "..hhhhhhhhhhhh..",
      "...hhhhhhhhhh...", "................", "................", "................"],
    panda: [
      "................", "..KK........KK..", ".KKKK......KKKK.", "..KWWWWWWWWWWK..", ".WWWWWWWWWWWWWW.", ".WWKKKWWWWKKKWW.",
      ".WKKWKWWWWKWKKW.", ".WWKKKWWWWKKKWW.", ".WWWWWWWWWWWWWW.", ".WWWWWWKKWWWWWW.", "..WWWWWWWWWWWW..", "..WWWWKKKKWWWW..",
      "...WWWWWWWWWW...", ".....WWWWWW.....", "................", "................"],
    hippo: [
      "................", "...pp......pp...", "..pPPp....pPPp..", "..pppppppppppp..", "..ppKppppppKpp..", "..pppppppppppp..",
      ".pppppppppppppp.", "pppppppppppppppp", "ppPPppppppppPPpp", "pppppppppppppppp", "pppWppppppppWppp", ".pppppppppppppp.",
      "..pppppppppppp..", "................", "................", "................"],
    giraffe: [
      "...n......n.....", "...y......y.....", "...yyyyyyyy.....", "..yyyyyyyyyy....", "..yyKyyyyKyy....", "..yyyyNyyyyy....",
      "..yyyyyyyyyy....", "...yyyyyyyy.....", "...yNyyyyNy.....", "...ssssssss.....", "...sKssssKs.....", "....ssssss......",
      ".....yyyy.......", ".....yNyy.......", ".....yyyy.......", ".....yyNy......."],
  };
  const sprites = Object.fromEntries(Object.entries(ART).map(([k, rows]) => [k, PX.sprite("animal-" + k, rows)]));
  PX.animal = (name) => PX.render(16, 16, [{ sprite: sprites[name] }]);
  PX.animal.names = Object.keys(ART);
})();
