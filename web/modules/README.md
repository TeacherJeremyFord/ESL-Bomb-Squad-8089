# Modules M01–M12

Each file here is one bomb module from `docs/design/modules/` (design + build spec). The build specs
were written for the old multi-device Python server; these are their single-page versions for the live
game (`web/index.html`).

## Adding a module

1. Write `modules/mXX-name.jsx`, wrapped in `(() => { … })();` so its names don't clash with the game's.
2. Push `{ id, name, type, difficulty, Component, Manual }` onto `window.EXTRA_MODULES`.
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

M01, M03, M04, M05, M06 and M11 have fixed manuals (M06 and M11 also read the bomb's serial).

## Tiers built

M01 A2 · M02 A2 · M03 A2+ (one weather change) · M04 A2 · M05 B1 · M06 A2 · M07 B1 · M08 B1 · M09 B1 ·
M10 A2 · M11 B1 · M12 B1 (gate 2.0 s instead of 1.5 s). Each file's header says what differs from the spec.

## Tests

`web/_harness.html?m=<id>` renders one module and its manual and runs `web/_tests/<id>.js`: the
generator invariants from the build spec, then a scripted play through the real UI. Add `&shot=1` for
a screenshot without the script. `web/_mission.html` starts a real mission with several modules.
