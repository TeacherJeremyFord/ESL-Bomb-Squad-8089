# M04 School Bell: Build Spec

**Design doc:** [`../M04_school_bell.md`](../M04_school_bell.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m04-school-bell`

## Files

```
game_mods/m04-school-bell/{gamemod.json, main.py, board.py, manual.py, timetable.py}
kwizzits/m04-school-bell-{a1,a2,b1}/quiz.kzt     ← tags tier:A1|A2|B1 rounds:2 maxStrikes:3 secPerHour:N (optional)
webclient/modules/m04-school-bell.js
webclient/art/m04-school-bell/manifest.json
tests/test_m04_school_bell.py
```

`timetable.py` holds the design doc's week as data. A teacher can replace it with the class's
real timetable (design build note). `rounds:2` by default, because one round is one whole day.

## Timetable data (`timetable.py`)

```python
HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]   # 24 h internally
BELLS = { "Monday": {7: "get up", 8: "go to school", 9: "English", 10: "math", 11: "PE",
                     16: "go home", 19: "do my homework", 21: "go to bed"}, ... }
```

- Bell values are one of the 13 **buttons**: the 7 subjects (`science`, `math`, `PE`,
  `music`, `art`, `Chinese`, `English`) and 6 routines (`get up`, `go to school`,
  `go home`, `do my homework`, `study`, `go to bed`).
- The design doc's Saturday/Sunday "study English" is the **`study`** button (🚩).
- Hours not in a day's dict are "—" (no bell).
- The Expert sees hours as the doc writes them: `7`, `8` … `11`, `4`, `7 (night)`, `9 (night)`.

## Board (`board.py`)

```python
class Board:
    day: str                    # "Wednesday"
    hours: list[int]            # the hours this round runs, in order
    sec_per_hour: float
    start_ms: int               # round start (client elapsedMs base)
    jump_after: int | None      # B1: the clock skips the hour after this one
    rung: set[int]              # bell hours rung correctly
    missed_checked: int         # last hour already judged for a missed bell
    phase: int                  # 1 = the day, 2 = WHEN?
    when_subject: str | None    # B1 phase 2
```

**The clock** is pure arithmetic: hour `i` in `hours` is on screen from
`start_ms + i * sec_per_hour` to the next. Both the client (animation) and the server
(judging, PLATFORM P4) compute it from `elapsedMs`. A jump removes one hour from `hours`.

**Generation:**

1. **Day:** A1 Monday–Friday. A2+ any of the seven days.
2. **Hours:** A1 runs 7–11. A2+ runs 7–21 (7 a.m. to 9 p.m.).
3. **Speed:** A1 8 s/hour, A2 5 s/hour, B1 4 s/hour. The `secPerHour` tag overrides it (the
   teacher slider from the design doc).
4. **B1 jump:** once per day, the clock skips an hour that has **no bell on this day**, and that
   isn't the first or last hour (🚩). The jump hour is chosen at generation.
5. **B1 phase 2:** pick a subject that appears somewhere in the week.

**Invariants:**

- At least 3 bell hours in the round. (The doc's Saturday and Sunday have exactly 3; a
  teacher's timetable with fewer is rejected when loaded.)
- The jumped hour is a no-bell hour, and the hour after it exists.
- Phase 2's subject is in the timetable at least once.

## Tiers

| Tier | Days | Hours | s/hour | Expert sees clock | Jump | Phase 2 |
|---|---|---|---|---|---|---|
| A1 | weekdays | 7–11 | 8 | yes | no | no |
| A2 | all | 7–21 | 5 | no | no | no |
| B1 | all | 7–21 | 4 | no | once | yes |

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `ring` | `{"button": "math", "elapsedMs": 41250}` | Find the hour on the clock at `elapsedMs`. If that hour has a bell, it's not rung yet, and `button` matches → `rung.add`, green lamp. A bell hour already rung → ignored. Wrong button, or any press in a **no-bell** hour → **strike**, red lamp. |
| `set-when` | `{"day": "Tuesday", "hour": 11}` | Phase 2 only. The subject is at that day and hour in the timetable → round won. Otherwise a strike. |

- **Grace:** a press within the first 400 ms of an hour that matches the *previous* hour's
  unrung bell counts for the previous hour (network lag, per the design build note).
- **Missed bells:** on every request, each bell hour that ended before now and isn't in
  `rung` is a **strike** (once each), with a red lamp.
- **End of the day:** when the last hour ends, phase 1 is over. Below B1 the round is won if
  the team is still alive. At B1, phase 2 starts.

## Screens

**Defuser:**

```json
{ "today": "WEDNESDAY",
  "clock": { "startMs": 0, "secPerHour": 4, "hours": [7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21] },
  "buttons": { "subjects": ["science", "math", "PE", "music", "art", "Chinese", "English"],
               "routines": ["get up", "go to school", "go home", "do my homework", "study", "go to bed"] },
  "lamp": "green",
  "phase": 1,
  "when": null,
  "labels": true }
```

- The clock's `hours` already have the jumped hour removed, so the hand visibly leaps.
- `when` at phase 2: `{ "subject": "art", "days": ["Monday", "..."], "hours": [7, 8, 9, 10, 11, 4, 7, 9] }`.

**Expert:**

```json
{ "timetable": { "cols": ["Monday", "...", "Saturday / Sunday"],
                 "rows": [ {"time": "7", "cells": ["get up", "get up", "get up", "get up", "get up", "—"]}, "..." ] },
  "rules": [ "Ask: What day is it today?", "Ring the bell at that time, not before.",
             "A \"—\" means no bell. Do not ring!", "Friday night has no homework. It is the end of the week!" ],
  "clock": null,
  "phase": 1,
  "when": null }
```

- `clock` is the same object as the Defuser's at A1, and `null` at A2+ (the Defuser has to call
  the hours).
- At phase 2, `when` is `{"rule": "The bomb asks WHEN. Ask what the subject is. Find the day and the time."}`.
  The subject itself is only on the Defuser's screen.
- The Expert never sees `today`.

## Renderer

**Defuser:**
- Top: `TODAY: WEDNESDAY` in big letters.
- Center: a big **analog clock drawn by code** (SVG), hour digits 1–12, one hand that moves
  smoothly from `startMs` and `secPerHour`. The current hour's digit glows. A sun or moon
  picture sits behind the clock (sun 7–17, moon 18–21).
- Below: 13 buttons in two rows, subjects on top and routines below, each ≥ 80 px. `labels`
  (A1–A2) adds the English words under the pictures.
- The bell lamp flashes green or red. A ding sound plays on a correct ring.
- Phase 2: a big card with the subject picture and **WHEN?**, then two dials (day, hour) with
  arrows, and a **SET** button.

**Expert:** the timetable grid, large (≥ 20 px), today's column **not** highlighted (the
Expert has to ask). Rules boxed above. At A1, a small copy of the clock in the corner.

**Placeholder mode:** 🧪 science, 1+2 math (code text), 👟 PE, 🎵 music, 🎨 art, 中 Chinese
(code text), ABC English (code text), ⏰ get up, 🚌 go to school, 🏠 go home, 📓 do my
homework, 📖 study, 🛏️ go to bed, ☀️🌙 behind the clock.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

The clock, its digits, and the **math (1+2), Chinese (中) and English (ABC) buttons are drawn
by code** (they are text, ART_GUIDE rule 2). Draw *do my homework* (a notebook at home under a
lamp) clearly different from *study* (an open book on a school desk).

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-school-wall` | — | A cartoon school hallway wall seen from the front: cream wall, a green stripe, a small bell on the wall top right, a large empty space in the middle. {SCENE_STYLE} |
| `sun` | ☀️ | A round bright yellow cartoon sun with short rays. {STYLE} |
| `moon` | 🌙 | A pale yellow crescent moon with two small stars beside it. {STYLE} |
| `subj-science` | 🧪 | A round glass science flask with green liquid and small bubbles. {STYLE} |
| `subj-pe` | 👟 | A red running shoe with white laces, in motion, with small speed lines. {STYLE} |
| `subj-music` | 🎵 | A big black music note with a smaller note beside it. {STYLE} |
| `subj-art` | 🎨 | A wooden paint palette with red, blue, yellow and green paint spots and a brush. {STYLE} |
| `rt-get-up` | ⏰ | A red alarm clock with two bells on top, ringing with small shake lines; the face has no numbers, only two hands. {STYLE} |
| `rt-go-to-school` | 🚌 | A yellow school bus seen from the side. {STYLE} |
| `rt-go-home` | 🏠 | A small house with a red roof, a door and two windows. {STYLE} |
| `rt-homework` | 📓 | An open notebook and a pencil on a small table at home, under a warm yellow lamp. {STYLE} |
| `rt-study` | 📖 | An open book on a wooden school desk, with a pencil case beside it. {STYLE} |
| `rt-go-to-bed` | 🛏️ | A small bed with a blue blanket and a white pillow. {STYLE} |

## Tests

- **Clock math:** hour at elapsed time, with and without a jump, at every speed.
- **Invariants:** 1000 days per tier, seeded.
- **Solver:** ring every bell at the middle of its hour (and phase 2 at B1). Round won, 0
  strikes.
- **Strikes:** ring in a no-bell hour; ring the wrong button; skip a bell (strike appears on
  the next request after its hour ends). Grace: a press 300 ms into the next hour counts.
- **Leak check:** the Expert view has no `today` and (A2+) no clock. Phase 2's subject is only
  in the Defuser view.
- **Words:** timetable and rules use list words, connectives, and the allow-list *ring, bell,
  ask, means, no, end, of, the bomb, asks, subject, find*.
- **HTTP harness:** a scripted A2 day, and one with a missed bell.

## Acceptance

- Playable with placeholder emoji.
- At 4 s/hour on a Chromebook over Wi-Fi, a ring pressed when the hour digit lights is never
  judged late.
- *Do my homework* and *study* are distinguishable at button size.

## Flags (decided, change if needed)

- 🚩 **4–5 s/hour** stays as designed, with `secPerHour` as the teacher slider (design doc
  open question). Playtest A2 at 5 and 6.
- 🚩 The weekend "study English" bell uses a **`study`** routine button. The design doc's
  Defuser view listed five routines; this makes six.
- 🚩 **Phase 2 accepts any slot** where the subject is. Every subject is on the timetable twice
  in the doc's week, and a teacher's own timetable can repeat subjects anywhere, so "the one
  right answer" can't be guaranteed.
- 🚩 The B1 jump only skips **no-bell** hours, so it can't eat a bell. The Defuser still has
  to say so, because the Expert is counting hours to call the next bell.
- 🚩 A press in a no-bell hour is a strike, as in the design ("Do not ring!").
