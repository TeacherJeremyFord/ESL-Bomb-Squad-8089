/* ===== ROOMS & SLEEPERS — M07 Midnight Snack =====
 * PX.room({ kind, window }) -> 64×40 night scene (kind: bedroom | bathroom | living room | kitchen)
 * PX.sleeper(who) -> 16×16 (father | mother | baby | dog | cat), eyes closed.
 */
(function () {
  const W = 64, H = 40;
  const WALL = { bedroom: ["#5d6f99", "#53648c"], bathroom: ["#4f8a83", "#467b75"], "living room": ["#8a7458", "#7d684f"], kitchen: ["#8f8a55", "#827d4c"] };
  PX.room = ({ kind, window: win }) => PX.paint(W, H, (set) => {
    const rect = (x0, y0, w, h, c) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, c); };
    const [w1, w2] = WALL[kind];
    for (let y = 0; y < 30; y++) for (let x = 0; x < W; x++) set(x, y, (x >> 2) % 2 ? w1 : w2); // striped wallpaper, dim for night
    const tiles = kind === "bathroom" || kind === "kitchen";
    for (let y = 30; y < H; y++) for (let x = 0; x < W; x++) set(x, y, tiles ? (((x >> 2) + (y >> 2)) % 2 ? "#b9bcc4" : "#8f939c") : (y % 3 === 0 ? "#5a3a1c" : "#7a5230"));
    rect(0, 29, W, 1, "#2a1c10");
    if (win) { rect(4, 3, 16, 12, "#d8d4c8"); rect(5, 4, 14, 10, "#141c48"); rect(11, 4, 1, 10, "#d8d4c8"); rect(5, 8, 14, 1, "#d8d4c8"); rect(14, 5, 3, 2, "#f4f0c8"); set(7, 6, "#ffffff"); set(17, 11, "#ffffff"); }
    if (kind === "bedroom") { rect(34, 18, 3, 13, "#5a3618"); rect(37, 24, 24, 6, "#eef0f4"); rect(37, 23, 6, 3, "#ffffff"); rect(43, 22, 18, 6, "#6a8fd8"); rect(43, 27, 18, 2, "#4a6fb8"); rect(60, 22, 2, 9, "#5a3618"); }
    if (kind === "bathroom") { rect(34, 22, 26, 8, "#f2f4f7"); rect(35, 22, 24, 2, "#7cc8f0"); rect(36, 30, 2, 2, "#9aa3b0"); rect(56, 30, 2, 2, "#9aa3b0"); rect(25, 22, 6, 8, "#f2f4f7"); rect(24, 19, 8, 3, "#e2e6ec"); rect(25, 15, 6, 4, "#f2f4f7"); }
    if (kind === "living room") {
      rect(30, 18, 30, 6, "#a04a6a"); rect(28, 22, 34, 8, "#b85a7a"); rect(28, 22, 3, 8, "#8a3a5a"); rect(59, 22, 3, 8, "#8a3a5a"); rect(30, 30, 2, 2, "#3a2010"); rect(58, 30, 2, 2, "#3a2010");
      rect(4, 17, 16, 10, "#1b1424"); rect(5, 18, 14, 8, "#2a3a5a"); rect(11, 27, 2, 3, "#1b1424"); rect(8, 29, 8, 1, "#1b1424");
    }
    if (kind === "kitchen") {
      rect(23, 8, 10, 22, "#eef0f4"); rect(23, 16, 10, 1, "#9aa3b0"); rect(31, 11, 1, 3, "#9aa3b0"); rect(31, 19, 1, 4, "#9aa3b0");
      rect(4, 20, 14, 10, "#9aa3b0"); rect(4, 19, 14, 2, "#5d6372"); rect(6, 19, 3, 1, "#ff6a3a"); rect(12, 19, 3, 1, "#ff6a3a"); rect(6, 23, 10, 5, "#474b57");
      rect(38, 23, 22, 2, "#8b5a2b"); rect(40, 25, 2, 6, "#5a3618"); rect(56, 25, 2, 6, "#5a3618");
    }
  });
  PX.room.size = { w: W, h: H };

  const pad = (rows) => { while (rows.length < 16) rows.push("................"); return rows; };
  const SLEEPERS = {
    father: pad(["................", "................", "................", "................", "....KKKKK.......", "...KKssssKW.....",
      "...KssssssWW....", "...sKKsKKsWW....", "...ssssssssWW...", "bbbbbbbbbbbbbbbb", "bbbbbbbbbbbbbbbb", "BBBBBBBBBBBBBBBB"]),
    mother: pad(["................", "................", "................", "................", "...nnnnnn.......", "..nnsssssnW.....",
      "..nssssssnWW....", "..nsKKsKKnWW....", "..nssssssnnWW...", "hhhhhhhhhhhhhhhh", "hhhhhhhhhhhhhhhh", "RRRRRRRRRRRRRRRR"]),
    baby: pad(["................", "................", "................", "n..n..n..n..n..n", "n..n..n..n..n..n", "n..n.ssss.n..n.n",
      "n..nssssssn..n.n", "n..nsKKsKKs..n.n".slice(0, 16), "n..nssssss.n.n.n".slice(0, 16), "nhhhhhhhhhhhhhhn", "nhhhhhhhhhhhhhhn", "nnnnnnnnnnnnnnnn"]),
    dog: pad(["................", "................", "................", "................", "................", "................",
      "...NN...........", "..NssssNN.......", "..sKsssssssss...", ".sssssssssssss..", ".ssssssssssssss.", "..SSSSSSSSSSSSs.".slice(0, 16)]),
    cat: pad(["................", "................", "................", "................", "................", "................",
      "..g.g...........", "..ggggg.........", "..gKgKgggggg....", "..ggggggggggggg.", ".gggggggggggggGg", "..GGGGGGGGGGGGg."]),
  };
  const S = Object.fromEntries(Object.entries(SLEEPERS).map(([k, r]) => [k, PX.sprite("sleeper-" + k, r)]));
  PX.sleeper = (who) => PX.render(16, 16, [{ sprite: S[who] }]);
})();
