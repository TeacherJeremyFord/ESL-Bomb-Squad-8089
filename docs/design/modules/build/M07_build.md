# M07 Midnight Snack: Build Spec

**Design doc:** [`../M07_midnight_snack.md`](../M07_midnight_snack.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m07-midnight-snack`

## Files

```
game_mods/m07-midnight-snack/{gamemod.json, main.py, board.py, manual.py}
kwizzits/m07-midnight-snack-{a2,b1,b1plus}/quiz.kzt   ← tags tier:A2|B1  twins:on (b1plus)  rounds:2 maxStrikes:3
webclient/modules/m07-midnight-snack.js
webclient/art/m07-midnight-snack/manifest.json
tests/test_m07_midnight_snack.py
```

`rounds:2` by default, because one house takes longer than one monster.

## Board (`board.py`)

```python
class Room:
    rid: int                 # 1..n, the number shown on the Expert's plan ONLY
    cell: tuple[int, int]    # position in a 3x3 grid
    kind: str                # "bedroom" | "bathroom" | "living room" | "kitchen"
    window: bool
    sleepers: list[str]      # any of "father", "mother", "baby", "dog", "cat"
    is_you: bool             # the player's own bedroom (the destination)

class Board:
    rooms: dict[int, Room]
    doors: dict[frozenset[int], str]   # edge between two grid-neighbor rooms → "red" | "blue" | "green" | "yellow"
    start: int
    need_return: bool                  # False at A2: taking the cake wins
    # live state
    at: int; prev: int | None; has_cake: bool; entries: dict[int, int]
```

**Generation:**

1. Choose 5 rooms (A2) or 7–9 (B1) as a connected set of cells in a 3×3 grid.
2. Room kinds:
   - exactly 1 kitchen
   - at least 2 bedrooms, one of them `is_you`
   - at least 1 bathroom and at least 1 living room
   - windows at random (about 40%)
3. **Doors** go on a random spanning tree plus 1–3 extra edges (loops make planning
   interesting). Give each door a color so that **no room has two doors of the same color**.
   With 4 colors and at most 4 neighbors, that's always possible, so assign greedily and
   retry on conflict.
4. **Sleepers:**
   - B1: the baby in one non-YOU bedroom; father and mother **together** in another non-YOU bedroom; the dog in one room and the cat in another (not the kitchen).
   - A2: the dog only.
5. **Start:** A2 starts in the YOU bedroom. B1 starts in a random room that isn't the
   kitchen, which is allowed to be the baby's room (🚩 see flags).

**Invariants:**

- **Solvable without strikes.** Run BFS over the state `(at, has_cake, entries capped at 2
  for sleeper rooms)`:
  - Goal: reach the kitchen and take the cake. With `need_return`, also get back to the YOU bedroom.
  - The path never enters the baby's room and never enters a pet or parents' room a second time.
- **Not trivial.** At B1 the shortest strike-free path is at least **5 moves**. At A2 it's
  at least 2 moves. Keep it at most 12.
- **Localizable.** At B1 without `twins`, the start room's **appearance** (kind, window,
  sorted door colors, sleepers) is **unique** in the house. With `twins:on`, exactly one
  other room has an identical appearance, and it's also reachable. One move tells them
  apart.
- At B1, at least one route that **looks** shortest passes a pet room on the way there, so
  the team has to plan the trip back too.

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `walk` | `{"door": "red"}` | No red door here → rejected, no strike (the client never offers it). Otherwise move. Then check the rules below. |
| `take-cake` | `{}` | In the kitchen → `has_cake = true`. At A2 this **wins the round**. |
| `go-to-bed` | `{}` | In a bedroom with the cake: the YOU bedroom → round won; any other bedroom → **strike**. Without the cake → rejected, no strike. |

**Rules checked after each `walk`** (these mirror the design doc's manual):

- **Entering the baby's room** → strike, and the baby cries, so you **run back**: `at = prev` (🚩 decided).
- **Entering a dog, cat or parents' room** when `entries[room] >= 1` already → strike. The
  start room counts as entered once.
- Otherwise, `entries[room] += 1`.

## Screens

**Defuser.** It must **never** include `rid`, `cell` or anything else that identifies the
room. Otherwise the "where are you?" puzzle disappears.

```json
{ "kind": "bathroom",
  "window": true,
  "doors": ["red", "blue"],
  "sleepers": [],
  "cake": false,
  "hasCake": true,
  "canGoToBed": false,
  "labels": true }
```

- `doors` are shuffled once per room per round, then kept stable.
- `cake`: the cake is here (kitchen, not taken yet).
- `canGoToBed` is true in **any** bedroom while carrying the cake. The Defuser can't tell which bedroom is theirs, so the Expert has to confirm.
- `labels` is true at A2. Door color words are then printed under each door.

**Expert.** The whole plan as **English words only** (the English lock), with no live
position:

```json
{ "grid": [[ {"rid": 1, "kind": "bedroom", "window": false, "sleepers": [], "you": true},
             {"rid": 2, "kind": "bathroom", "window": false, "sleepers": []},
             null ]],
  "walls": [ {"between": [1, 2], "color": "red"} ],
  "cake": 5,
  "rules": [
    "At night, everyone is sleeping. Do not walk into a room where the baby is sleeping.",
    "You can walk into a room with the dog or the cat one time. Two times, and it wakes up.",
    "You can walk into a room with father or mother, but not two times.",
    "Take the cake. Then go back to your bedroom and go to bed."
  ] }
```

- At A2 the last rule is `"Take the cake."`.
- The Expert's screen **never shows the Defuser's position**. Working that out from
  descriptions is the puzzle.

## Renderer

**Defuser:**
- A first-person room picture (`room-<kind>[-window]`), with the room's sleepers drawn on
  top. Pets sit on the floor, people and the baby in a bed or crib area.
- Below it, **doors drawn in SVG by code**: a tall rounded door in the exact palette color,
  spaced evenly. Each one is a big tap target (≥ 90 px wide), with the color word underneath
  at A2.
- The cake is on the kitchen table; tap it to take it. While carrying it, a cake badge shows
  in the corner.
- **GO TO BED** is a large English button in bedrooms when `canGoToBed`.
- A strike shows a "wake-up" shake plus a red lamp.
- Sound (optional, nice): footsteps on walk, a creak on strike, and a snore that plays while
  sleepers are present.

**Expert:**
- The plan as a grid of large boxes. Each box shows the room number and kind, `window` if it
  has one, sleeper words, **YOU** on the YOU bedroom, and **CAKE** in the kitchen.
- Each wall with a door shows the **color as a word**, like `red` (not a colored line, per
  the English lock).
- Rules are listed underneath.

## Art (Gemini)

The room backgrounds share one viewpoint: the back wall of the room seen straight on, with a
**wide empty strip along the bottom-middle of the wall** where code draws the doors. Make the
`-window` version first, then use the ART_GUIDE **edit** prompt ("remove the window, fill
that part with plain wall") for the no-window version, so the pair matches.

| assetId | Placeholder | Prompt |
|---|---|---|
| `room-bedroom-window` | 🛏️ | A cozy cartoon child's bedroom at night, seen straight on from the doorway: the back wall with a bed on the left side, a small lamp, and a window on the upper right showing a dark blue night sky and a moon. The lower middle of the back wall is a wide empty plain wall area. Dim, calm night colors. {SCENE_STYLE} |
| `room-bathroom-window` | 🛁 | A cartoon bathroom at night, seen straight on: the back wall with a white bathtub on the left, a sink and mirror on the right, and a small window up high showing the night sky. The lower middle of the back wall is a wide empty plain tiled area. Dim, calm night colors. {SCENE_STYLE} |
| `room-living-window` | 🛋️ | A cartoon living room at night, seen straight on: the back wall with a sofa on the left and a television on a low cabinet on the right, a window up high showing the night sky. The lower middle of the back wall is a wide empty plain wall area. Dim, calm night colors. {SCENE_STYLE} |
| `room-kitchen-window` | 🍳 | A cartoon kitchen at night, seen straight on: the back wall with a fridge on the left and a stove on the right, a small table in the front middle with an empty plate on it, and a window up high showing the night sky. The lower middle of the back wall is a wide empty plain wall area. Dim, calm night colors. {SCENE_STYLE} |
| `room-*` (no window) | same | **Edit** each of the four above: "Remove the window and fill that part with plain wall that matches the rest. Change nothing else." |
| `sleep-father` | 😴 | A cartoon Taiwanese father sleeping peacefully on his side under a blanket, eyes closed, a few small round bubbles floating above his head. {STYLE} |
| `sleep-mother` | 😴 | A cartoon Taiwanese mother sleeping peacefully on her side under a blanket, eyes closed, a few small round bubbles above her head. {STYLE} |
| `sleep-baby` | 👶 | A cartoon baby sleeping in a small wooden crib, eyes closed, hugging a toy, a few small round bubbles above. {STYLE} |
| `sleep-dog` | 🐕 | A cartoon dog curled up asleep on a small round cushion, eyes closed, a few small round bubbles above. {STYLE} |
| `sleep-cat` | 🐈 | A cartoon cat curled up asleep in a ball, eyes closed, a few small round bubbles above. {STYLE} |
| `cake` | 🍰 | A round chocolate cake with white cream on top, on a white plate. {STYLE} |

Sleep bubbles stand in for "Zzz", because the images must have no letters (ART_GUIDE rule 2).

## Tests

- **Invariants:** 1000 houses per tier, seeded:
  - unique door colors per room
  - solvable strike-free with path length in range
  - localizable (unique start appearance, or exactly one twin with `twins:on`)
  - room-kind counts correct
- **Solver:** follow the BFS path through `apply`. Round won, 0 strikes.
- **Rules:** entering the baby's room → strike and returned to `prev`. Second entry into the
  cat's room → strike. Going to bed in the wrong bedroom with the cake → strike.
- **Leak check:** the Defuser view never contains the keys `rid`, `cell` or `you`. Neither
  view contains the other's data.
- **Words:** the Expert's rules use list words, connectives, and the allow-list *walk into,
  room, wakes up, take, one time, two times*. (*walk*, *go to bed*, *sleep* and *night* are
  list words.)
- **HTTP harness:** a scripted B1 run, plus one run that walks into the baby's room.

## Acceptance

- Playable with placeholder emoji and code-drawn doors.
- A pair who doesn't talk can't win at B1 except by luck: the Defuser alone can't know the
  plan, and the Expert alone can't know the position.
- Door colors are distinguishable on both devices. Use the shared palette, and check with a
  color-blind simulator. The A2 color-word labels help here too.

## Flags (decided, change if needed)

- 🚩 Walking into the baby's room causes a strike **and** sends the Defuser back to the
  previous room. The design doc didn't say what happens after the strike.
- 🚩 The noise meter from the design doc is **merged with the strike lamps**. A separate meter
  measuring the same thing would only confuse students.
- 🚩 A B1 round may start inside the baby's room (rule 1 only forbids walking *into* it). If
  playtests show this confuses students, exclude that start.
- 🚩 Two rounds per run instead of three, for time. Change it with the `rounds:` tag.
