# Modules M01–M19

Each file here is one bomb module from `docs/design/modules/` (design + build spec). The build specs
were written for the old multi-device Python server; these are their single-page versions for the live
game (`web/index.html`).

## Adding a module

1. Write `modules/mXX-name.jsx`, wrapped in `(() => { … })();` so its names don't clash with the game's.
2. Push `{ id, name, type, difficulty, puzzle, Component, Manual }` onto `window.EXTRA_MODULES`.
   - `difficulty` is the **English** level (A0–B2); `puzzle` is the **puzzle** level (1–4, see `PUZZLE_LEVEL` in
     `index.html`). They are separate: the same words can come as an easy or a hard puzzle. Leave `puzzle` out to
     use the `PUZZLE_LEVEL` table. One file can register several puzzle versions of one module (Time Lock does).
   - `Component({ serialNumber, bomb, onSuccess, onStrike })` is the Defuser's screen.
     `bomb` is `{ color, batteries, sticker: { name, kind } }`: what the bomb looks like (see BOMB FEATURES in
     `index.html`). A rule can read it instead of the serial; give `bomb` a default, since the test harness doesn't pass one.
   - `Manual()` is its section in the Expert manual.
3. Add `<script type="text/babel" src="modules/mXX-name.jsx">` to `index.html` (and any new `sprites/*.js`).

The game picks it up automatically: mission setup, the module list and the manual.

## Sync codes

The two players' devices don't talk to each other. When a module's Expert information changes every
round, the bomb shows a 4-digit number and the Expert types it into the manual; both sides build the
same round from a seeded RNG.

| Module | Code | What the Expert gets |
|---|---|---|
| M02 Lunch Rush | ORDER NUMBER | the order tickets (both press START together) |
| M07 Midnight Snack | HOUSE NUMBER | the floor plan |
| M08 Mystery Guest | PARTY NUMBER + ANSWER CODE per question | witness notes; the bomb's answers |
| M09 Mood Plugs | PLUG NUMBER | the sentences |
| M10 Gift Shop | SHOP NUMBER | the wallet |
| M12 Animal Race Day | RACE NUMBER | the entry list |
| M13 Teen Code | LOCK NUMBER | the five-number code, as words |

M01, M03, M04, M05, M06 and M11 have fixed manuals (M06 and M11 also read the bomb's serial).

Sync numbers come from a small **codebook** (`manual-kit.js`): the bomb only ever shows one of the
`CODEBOOK_SIZE` numbers of the current `CYCLE`, and the printed manual lists the round for each of them.
Use `MANUAL.pick("<module id>")` for a new sync number, never `Math.random()`.

## Printed manual

EXPERT MANUAL → **🖨 PRINT / SAVE PDF** prints what the filter shows (ALL, one mission, or THIS BOMB).
Each `Manual()` must work on paper: read `React.useContext(MANUAL.Print)` and, when it is true, show
every page/tab and the codebook instead of type-in boxes.

Every printed page carries the **version** (`MANUAL.VERSION`, bump by hand on release) and the
**MANUAL CODE**, a hash of the whole paper manual's text. The game shows the same code on the menu and
on the bomb, so a printout that doesn't match is easy to spot. The code changes by itself when any rule,
table or codebook changes; change `CYCLE` in `manual-kit.js` for new rounds (and then reprint).

## Tiers built

M01 A2 · M02 A2 · M03 A2+ (one weather change) · M04 A2 · M05 B1 · M06 A2 · M07 B1 · M08 B1 · M09 B1 ·
M10 A2 · M11 B1 · M12 B1 (gate 2.0 s instead of 1.5 s) · M13 A2 + B1 "Twins" (400-list numbers; the lock number's parity picks the tier).
M14 Time Lock A1 in three puzzle versions: One Clock 🧩1, Two Clocks 🧩3, Time Lock 🧩4 (fixed manuals).
M15 Day Order A1 🧩1: put the six parts of the day in order. Defuser only (the manual says so, and gives no answer).
M16 Busy Week A2 🧩3, two versions on the same three fixed week planners (GRANDPA, MOM, SISTER): Busy Week (drag events into MORNING…MIDNIGHT) and Busy Week: When? (drag parts of the day next to shuffled events). Evening/night = the order of the two late events.
M18 Greeting Door A1: a clock on a door, press GOOD MORNING/AFTERNOON/EVENING/NIGHT. 1 door 🧩1, Three Doors 🧩2, Five Doors 🧩3 (`makeModule(n)`). Practice module: the Defuser can do it alone; the manual has the full rule.
M19 Meet Up A2 🧩3: the bomb shows YOUR DAY (six times + things); one is the same thing at the same time as the person's Busy Week planner; press that part of the day. Needs M16 loaded first (`window.BUSY_WEEK`). Each file's header says what differs from the spec.
M17 World Tour, the 7 continents and the 7 oceans (North/South Pacific, North/South Atlantic, Indian, Arctic, Southern) on a world map you can touch. The plane's color picks one of 8 fixed lists of four places; touch them in order. World Tour A1 🧩1 (names on the map) and World Tour: Blank Map A2 🧩2 (no names; the Expert's manual has the named map and "next to / between / north of" phrases). The lists come from `MANUAL.CYCLE`. The map is SVG: pinch/spread or + − ⟲ to zoom (up to 5×), drag to move; a drag is never a tap.

## Tests

`web/_harness.html?m=<id>` renders one module and its manual and runs `web/_tests/<id>.js`: the
generator invariants from the build spec, then a scripted play through the real UI. Add `&shot=1` for
a screenshot without the script. `web/_mission.html` starts a real mission with several modules.
