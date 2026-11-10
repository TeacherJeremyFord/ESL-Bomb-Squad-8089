/* ===== RACE PICTURES (16×16, outlined) — M12 Animal Race Day =====
 * PX.race(name): swim run jump jog fly walk. Walk / jog / run must be told apart at a glance:
 * walk = footprints, jog = an upright runner with a red sweatband and a drop of sweat, run = a sprinter with speed lines.
 */
(function () {
  const pad = (rows) => { while (rows.length < 16) rows.push("................"); return rows.map((r) => r.padEnd(16, ".").slice(0, 16)); };
  const ART = {
    swim: pad(["", "", "......ss", ".....ssss..s", ".....ssss.ss", "......ss.ss", "cccc.cccccccccc.", "cWcccWcccWcccWcc", "cccccccccccccccc", "CccccCccccCccccC"]),
    run: pad(["", ".........KK", ".........KK", ".WWW....KKKK", "......KKK.K", ".WWWWW...KK.KK", ".........KK", "..WWW...KK.KK", "........K....K", ".......KK.....K"]),
    jog: pad(["", ".......KKK", "......rrrrr.c", ".......KKK..c", "........K", "......KKKKK", "........K", "........K", ".......K.K", "......K...K", ".....KK...KK"]),
    jump: pad(["...KK", "...KK", ".KKKKKK", "...KK", "..K..K..W", ".K....K...W", "...........W", "............W", "", ".rrWWrrWWrrWWrr", ".n............n", ".n............n", ".n............n"]),
    fly: pad(["", "WW............WW", ".WgW........WgW.", "..WgWW....WWgW..", "...WWWgWWgWWW...", "....WWWWWWWW....", ".....WW..WW....."]),
  };
  const sprites = Object.fromEntries(Object.entries(ART).map(([k, r]) => [k, PX.sprite("race-" + k, r)]));
  PX.race = (name) => (name === "walk" ? PX.way("on foot") : PX.render(16, 16, [{ sprite: sprites[name] }]));
})();
