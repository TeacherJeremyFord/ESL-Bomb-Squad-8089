# ESL Bomb Squad - TODO List

**Last Updated:** January 7, 2026

---

## 🔥 Immediate / In Progress

- [x] Sound effects: Web Audio synthesis in `web/index.html` (`window.SFX`), with a mute button (2026-11-10)
- [ ] Guess Who: Get AI-generated face images for agents

---

## 📋 Short Term (Next Session)

- [ ] Update Design Doc to match current implementation
- [ ] Add more Guess Who traits (glasses, hat, facial hair, age)
- [ ] Consider difficulty levels for existing modules
- [ ] Test all modules on mobile devices

---

## 🧊 Back Burner (gameplay ideas, 2026-11-10)

- [ ] **Earlier modules feed later ones.** A finale module asks about things from modules already
  solved (and gone from the screen), so teams keep a paper log. Parked: the design is complex.
- [ ] **Paper-and-pencil Expert work, via information arriving in pieces** (the preferred method).
  The Defuser reports things one at a time and the answer needs all of them, so most Experts take
  notes. Never an honor-system rule. Keep manual reading light: reading is already hard for ESL students.
- [x] Results screen: stars, per-module breakdown, best score, "swap roles" button (2026-11-10)
- [x] Locked finale module, so a mission builds to an end (2026-11-10)
- [x] Campaign of 12 named missions, `MISSIONS` in `web/index.html`; groupings are a first draft to review (2026-11-10)
- [ ] Class leaderboard across devices: needs a server, the devices are not linked today
- [ ] Mission locks (unlock in order): left open for now, since progress is saved per device and partners swap devices
- [x] Manual can show only one mission's modules (2026-11-10)
- [x] Audit the 16 original modules against the English-lock and information-gap rules (2026-11-10).
  Fixed: Vending Machine and Word Buttons rejected some right answers; Big Button rule order did not match
  the manual; Switchboard and Combo Lock could be solved by trial and error with no penalty.
  Also: "mod 4" / "mod 40" taken out of the Monster Lab and Combo Lock manuals (same rules, plain words);
  Big Button moved to pointer events so one wrong tap on a touch screen is one strike, not two.
- [x] Audit findings redesigned (2026-11-11):
  - **Crack the Code**: each guess gets a 4-digit clue number that only the manual can read; the Expert
    types it in, gets the clue in English, and keeps notes of the guesses on paper.
  - **Memory**: four stages with a rule table; later stages point back ("same place as Stage 1",
    "same word as Stage 2"), so the Expert writes down every press. Words now really move each stage.
  - **Sliders**: a light picks a row of the table ("two more", "one less", "the same") applied to each
    slider's start number. No serial.
  - **Number Keypad**: the Defuser says three numbers (1–12); the Expert taps the number words in the manual
    and gets two number words to say back. No serial; the Expert is needed every round.
  - **Symbol Keypad**: colored pictures ("red star", "blue moon"); the manual's lists are words, not pictures.
  - **Symbol Panel**: one plant, one animal, one food, one other thing from pools with no overlap (no fish).
    Still one small fixed rule (serial digit picks the group), so it can be learned; left as is for now.
- [x] Bomb features (color, batteries, sticker) shown as pictures; read by Vending Machine, Big Button
  and Word Buttons instead of the serial number. Serial now used by 7 of 28 modules (2026-11-11)
- [x] Fun mode (alarm clock, lights out, bomb quiz), off by default and never saved (2026-11-10)

## 🎯 Medium Term

- [ ] QR code configuration system
- [ ] Teacher mode with password
- [ ] Vocabulary folder system for customizable word lists
- [ ] More modules from design doc (Maze Navigator, Morse Code, etc.)

---

## 💡 Ideas / Backlog

- [ ] Leaderboard / high scores
- [ ] Multiple language support for manual
- [ ] Print-friendly manual export
- [ ] Classroom mode (teacher controls all bombs)
- [ ] Custom module creator

---

## ✅ Recently Completed

- [x] Countdown system (3-2-1-GO!) with module ready tracking
- [x] Abort/Pause with bilingual confirmation
- [x] Guess Who module (15 agents, eye+hair colors)
- [x] Combination Lock overhaul (4 formula sets, UNLOCK button)
- [x] Big Button overhaul (2-stage, color+word chart, bomb timer)
- [x] Play Again preserves previous settings
- [x] Report filename includes Agent ID
- [x] Mobile touch fixes

---

## 🐛 Known Bugs

*None currently tracked*

---

## Notes

- Design Doc: `/home/claude/esl_bomb_squad_design.md` (vision/roadmap)
- Implementation Doc: `/home/claude/esl_bomb_squad_implementation.md` (current state)
- Main App: `/home/claude/esl-bomb-squad.jsx`
