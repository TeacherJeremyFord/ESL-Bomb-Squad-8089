/* ===== TOYS, GIFTS & ABILITY PROPS (16×16, outlined) — M08 Mystery Guest, M10 Gift Shop =====
 * PX.toy(name): kite ball yo-yo doll card gift flower · PX.prop(name): dance sing read write draw
 */
(function () {
  const pad = (rows) => { while (rows.length < 16) rows.push("................"); return rows; };
  const TOYS = {
    kite: pad(["................", ".......r........", "......rry.......", ".....rrryy......", "....rrrryyy.....", "...rrrrryyyy....",
      "....bbbbbgggg...".slice(0, 16), ".....bbbbggg....", "......bbbgg.....", ".......bbg......", "........n.......", ".........n......",
      "........r.n.....", "...........n....", "..........r.....", "................"]),
    ball: pad(["................", "................", ".....rrrrrr.....", "....rrWWrrrr....", "...rrWrrrrrrR...", "...WWWWWWWWWWW..".slice(0, 16),
      "...WWWWWWWWWWW..", "...bbbbbbbbbbb..", "...bbbbbbbbbbB..", "....bbbbbbbbB...", ".....bbbbbbB....", "......BBBB......"]),
    "yo-yo": pad(["................", ".......n........", ".......n........", ".......n........", ".......n........", ".......n........",
      ".....pppppp.....", "....ppWpppppP...".slice(0, 16), "....ppppppppP...", "....yyyyyyyyy...", "....ppppppppP...", "....ppppppppP...",
      ".....PPPPPP....."]),
    doll: pad(["................", ".....yyyyy......", "....yysssyy.....", "....ysKsKsy.....", "....ysssssy.....", ".....sshss......",
      "......sss.......", "....hhhhhhh.....", "...shhhhhhhs....", "....hhhhhhh.....", "...hhhhhhhhh....", "..hhhhhhhhhhh...",
      "....ss...ss.....", "....ss...ss....."]),
    card: pad(["................", "................", "..WWWWWWWWWWWW..", "..WhhhhhhhhhhW..", "..WhhWhhhhhhhW..".slice(0, 16), "..WhhhhrrhrrhW..",
      "..WhhhrrrrrrhW..", "..WhhhhrrrrhhW..", "..WhhhhhrrhhhW..", "..WhhhhhhhhhhW..", "..WWWWWWWWWWWW.."]),
    "star card": pad(["................", "................", "..WWWWWWWWWWWW..", "..WccccccccccW..", "..WcccccyccccW..", "..WccccyyycccW..",
      "..WcyyyyyyyycW..", "..WccyyyyyyccW..", "..WcccyyyyccccW.".slice(0, 16), "..WccyyccyycccW.".slice(0, 16), "..WWWWWWWWWWWW.."]),
    gift: pad(["................", "....rr....rr....", ".....rr..rr.....", "......rrrr......", "..bbbbbrrbbbbb..", "..bbbbbrrbbbbB..",
      "..rrrrrrrrrrrr..", "..bbbbbrrbbbbB..", "..bbbbbrrbbbbB..", "..bbbbbrrbbbbB..", "..bbbbbrrbbbbB..", "..BBBBBrrBBBBB.."]),
    flower: pad(["................", ".....hh.hh......", "....hhhhhhh.....", ".....hhyhh......", "....hhhhhhh.....", ".....hh.hh......",
      ".......v........", ".......v..vv....", "...vv..v.vv.....", "....vv.vv.......", "......vv........", ".......v........",
      ".......v........"]),
  };
  const PROPS = {
    dance: pad(["................", "................", "................", "................", "..h........h....", "..h.........h...",
      "..hh........hh..", "..hhh.......hhh.", "...hhhh......hhh", "....hhhhh...hhhh", ".....hhhhh..hhhh".slice(0, 16), "......hhhh...hhh"]),
    sing: pad(["................", "....KKK.........", "...KgWgK........", "...KggggK.......", "...KgggggK......".slice(0, 16), "....KggggK......",
      ".....KKKKK......", "......KKK.......", ".......KKK......", "........KKK.....", ".........KKK....", "..........KK...."]),
    read: pad(["................", "................", "................", "................", ".rrrrrrKKbbbbbb.", ".rWWWWrKKbWWWWb.",
      ".rWggWrKKbWggWb.", ".rWWWWrKKbWWWWb.", ".rWggWrKKbWggWb.", ".rWWWWrKKbWWWWb.", ".rrrrrrKKbbbbbb."]),
    write: pad(["................", "..WWWWWWWWW.....", "..WgggggggW.....", "..WWWWWWWWW..y..", "..WgggggggW.yy..", "..WWWWWWWWWyy...",
      "..WgggggggyyW...", "..WWWWWWWyyWW...", "..WggggggKgW....", "..WWWWWWWWWW....", "................"]),
    draw: pad(["................", "............rr..", "...........rrr..", "..........rrr...", ".........nnn....", "........nnn.....",
      ".......nnn......", "......nnn.......", ".....nnn........", "....nnn.........", "...nn...........", "..n.............",
      ".bbb.vvv.rrr....", "..b...v...r....."]),
  };
  const mk = (pre, set) => Object.fromEntries(Object.entries(set).map(([k, r]) => [k, PX.sprite(pre + k, r)]));
  const T = mk("toy-", TOYS), P = mk("prop-", PROPS);
  PX.toy = (n) => PX.render(16, 16, [{ sprite: T[n] }]);
  PX.prop = (n) => PX.render(16, 16, [{ sprite: P[n] }]);
})();
