(async () => { try {
  const T = EXTRA_MODULES.find(m => m.id === "mysteryGuest")._test, sleep = (ms) => new Promise(r => setTimeout(r, ms)), S = T.SENTENCES;
  const ben = { boy: true, can: "dance", has: "kite", likes: "ball" }, errs = [];
  const cases = [[["Can","he","dance","—"],"Yes, he can."], [["Can","he","sing","—"],"No, he can not."], [["Does","he","have","a kite"],"Yes, he does."],
    [["Does","he","like","a doll"],"No, he does not."], [["Does","he","dance","—"],"That is not a good question."], [["Can","he","have","a kite"],"That is not a good question."],
    [["What","he","like","—"],"Ask a yes or no question."], [["Can","she","dance","—"],"No. He is a boy."], [["Does","he","play","a ball"],"That is not a good question."], [["Can","he","play","—"],"Yes, he can."]];
  for (const [t, want] of cases) if (S[T.answer(t, ben)] !== want) errs.push(`${t.join(" ")} -> ${S[T.answer(t, ben)]}`);
  for (let c = 1000; c < 2000; c++) { const p = T.makeParty(c);
    if (new Set(p.guests.map(g => g.name)).size !== 8) errs.push("names");
    for (let q = 1; q <= 5; q++) for (let sid = 0; sid < S.length; sid++) { const d = T.decode(c, T.encode(c, q, sid)); if (!d || d.text !== S[sid] || d.q !== q) errs.push("code"); } }
  HLOG(`grammar ${cases.length} cases + 1000 parties + codes: ${errs.length} errors ${[...new Set(errs)].slice(0,5)}`);
  await sleep(300);
  const D = document.getElementById("d"), M = document.getElementById("m"), p = T.party, target = p.guests.find(g => g.name === p.target);
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set, type = (inp, v) => { set.call(inp, v); inp.dispatchEvent(new Event("input", { bubbles: true })); };
  const tile = (row, t) => [...D.querySelectorAll(".mg-row")][row].querySelectorAll(".mg-tile"), btn = (root, t) => [...root.querySelectorAll("button")].find(b => b.textContent === t);
  // Expert: party number -> notes.
  type(M.querySelectorAll("input")[0], String(p.code)); await sleep(30); btn(M, "SHOW").click(); await sleep(60);
  HLOG("notes: " + [...M.querySelectorAll(".mg-note")].map(e => e.textContent).join(" "));
  // Defuser: ask "Can he/she <target.can>?" then the Expert reads the code.
  const pro = target.boy ? "he" : "she";
  for (const [row, t] of [[0, "Can"], [1, pro], [2, target.can], [3, "—"]]) { [...tile(row)].find(b => b.textContent === t).click(); await sleep(20); }
  HLOG("defuser preview: " + D.querySelector(".mg-preview").textContent); btn(D, "SEND").click(); await sleep(60);
  const code = D.querySelector(".mg-log b").textContent.replace("ANSWER CODE: ", ""); HLOG("answer code shown to defuser: " + code + " (defuser screen has no answer text: " + !/Yes,|No,/.test(D.textContent) + ")");
  type(M.querySelectorAll("input")[1], code); await sleep(30); btn(M, "READ").click(); await sleep(60);
  HLOG("expert reads: " + M.querySelector(".mg-feed").textContent);
  // Wrong accuse, then the right one.
  const wrong = p.guests.find(g => g.name !== p.target);
  btn(D, "ACCUSE").click(); await sleep(30); [...D.querySelectorAll(".mg-guest")].find(b => b.textContent.includes(wrong.name)).click(); await sleep(60);
  HLOG(`wrong accuse: strikes ${STRIKES}, budget ${D.querySelector(".mg-budget span").textContent}`);
  btn(D, "ACCUSE").click(); await sleep(30); [...D.querySelectorAll(".mg-guest")].find(b => b.textContent.includes(p.target)).click(); await sleep(60);
  HLOG(`right accuse: won=${WON}`); HLOG("DONE");
} catch (e) { HLOG("TEST ERROR " + e.message + " " + (e.stack||"").split("\n")[1]); } })();
