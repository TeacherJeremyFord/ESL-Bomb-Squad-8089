# M02 Lunch Rush: Build Spec

**Design doc:** [`../M02_lunch_rush.md`](../M02_lunch_rush.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m02-lunch-rush`

## Files

```
game_mods/m02-lunch-rush/{gamemod.json, main.py, board.py, manual.py, menu.py}
kwizzits/m02-lunch-rush-{a1,a2,b1}/quiz.kzt     ← tags tier:A1|A2|B1 rounds:2 maxStrikes:3
webclient/modules/m02-lunch-rush.js
webclient/art/m02-lunch-rush/manifest.json
tests/test_m02_lunch_rush.py
```

`menu.py` holds the food list (word, `an` flag, `cook` flag, kind) as data, so a teacher can
edit it (IMA-42 "data, not code"). `rounds:2` by default, because one round is three served
tickets and takes about as long as an M11 run.

## Food data (`menu.py`)

| Word | Says AN | Must cook | Kind |
|---|---|---|---|
| cake, sandwich, hot dog, pizza, hamburger, bread | no | no | food |
| pork, beef, chicken, rice | no | yes | food |
| egg | **yes** | yes | food |
| apple, orange | **yes** | no | fruit |
| banana | no | no | fruit |
| ice cream | **yes** | no | food |
| milk, juice, water, tea, coffee | — | no | drink (always "a cup of …") |

## Board (`board.py`)

```python
class Line:          word: str; qty: int                      # qty 1–3; drinks count cups
class Ticket:        tid: int; meal: str; lines: list[Line]   # meal: breakfast | lunch | dinner
                     opened_ms: int; due_ms: int; done: bool
class StoveSlot:     word: str | None; placed_ms: int | None  # 3 burners
class Board:
    tickets: list[Ticket]        # the round's whole queue, opened on a schedule
    light_plan: list[tuple[int, str]]   # (ms, "off"|"red"|"green"|"purple"), first entry at 0
    pantry: list[str]            # 6 (A1) or 12 (A2+) words shown on the shelf
    trays: dict[str, list[Item]] # meal → items on that tray; Item = word + state
    stove: list[StoveSlot]
    held: Item | None            # the item the Defuser has picked up (tap, then tap)
    served: int                  # 3 → round won
```

**Item state** is computed, never stored as a timer: `raw` → `cooked` at 3 s on the stove →
`burned` at 8 s. Things that don't need cooking are always `ok`. An item keeps the state it had
when it left the stove.

**What a ticket needs right now** (`need(ticket, light)`), applied to the ticket's lines in
order:

- **off:** the lines as written.
- **red:** every `beef` or `pork` line becomes `chicken` with the same quantity, and lines are merged.
- **green:** add one `ice cream`, unless the ticket already has one.
- **purple:** drop every food line whose word doesn't take AN. Drinks stay.

`need()` uses the light **at the moment SERVE is pressed**. The Expert's ticket text never
changes; working out the change is the puzzle.

**Generation:**

1. The round's queue has `served_goal + 3` tickets (spares replace missed ones).
2. Each ticket: a meal, 2 lines (A1), 2–3 lines (A2) or 3–4 lines (B1). At most one drink line.
   Quantities are 1 at A1–A2 and 1–3 at B1. Every ticket has at least one food that needs
   cooking at A2+ (so the stove matters).
3. **Opening schedule:** tickets open so that at most 1 (A1), 2 (A2) or 3 (B1) are open at
   once. A new ticket opens 2 s after a slot frees. Open tickets always have **different
   meals**, so each one has its own tray.
4. **Time per ticket:** A1 70 s, A2 55 s, B1 50 s. Override with the tag `ticketSeconds:N`.
5. **Light plan:** A1 always `off`. A2 picks `off`, `red` or `green` for the round. B1 starts
   with one of the four and changes once, at a random time 25–45 s into the round.
6. **Pantry:** every food any ticket can need under any light in the plan (so chicken is
   there whenever red is possible), plus decoys up to 6 or 12. Drinks are always all five.

**Invariants (tests check all of them):**

- Under every light the round can show, `need()` of every ticket is non-empty (purple never
  empties a ticket: each B1 ticket has a drink or an AN food).
- Open tickets never share a meal.
- Every needed word is in the pantry or the drink machine.
- A1 tickets need no cooking (there's no stove at A1).

## Tiers

| Tier | Open tickets | Stove | Lights | Quantities | Pantry | Light changes |
|---|---|---|---|---|---|---|
| A1 | 1 | no (cooked food comes ready) | off | 1 | 6 | — |
| A2 | 2 | yes | off / red / green | 1 | 12 | — |
| B1 | 3 | yes | all four | 1–3 | 12 | once |

A round is won after **3 served tickets**.

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `pick` | `{"word": "beef"}` or `{"from": "stove", "slot": 1}` or `{"from": "tray", "meal": "lunch", "index": 0}` | Picks up a new pantry item, a stove item, or an item back off a tray. Rejected (no strike) if already holding something. |
| `pour` | `{"drink": "tea"}` | Holding becomes one cup of that drink. |
| `put` | `{"to": "stove", "slot": 2}` or `{"to": "tray", "meal": "dinner"}` | Places the held item. Stove only takes cook foods. |
| `bin` | `{}` | Throws the held item away. |
| `serve` | `{"meal": "dinner"}` | No open ticket for that meal → **strike** (wrong tray). Tray matches `need()` exactly (same words and counts, every cook food `cooked`) → ticket done, tray cleared, `served += 1`. Otherwise **strike**, and the tray keeps its items so the team can fix it. |

**Missed tickets** are checked on every request: an open ticket past `due_ms` is a **strike**,
it closes, and its tray is cleared. The next ticket opens on schedule.

## Screens

**Defuser:**

```json
{ "trays": [ { "meal": "breakfast", "items": [ {"word": "egg", "state": "cooked"} ] },
             { "meal": "lunch", "items": [] }, { "meal": "dinner", "items": [] } ],
  "pantry": ["hamburger", "apple", "beef", "pork", "..."],
  "drinks": ["milk", "juice", "water", "tea", "coffee"],
  "stove": [ {"word": "beef", "placedMs": 41200}, {"word": null}, {"word": null} ],
  "held": {"word": "tea", "state": "ok"},
  "light": "purple",
  "labels": true,
  "served": 1, "goal": 3 }
```

The Defuser view never includes tickets, meals that are open, or due times.

**Expert:**

```json
{ "tickets": [ { "tid": 4, "meal": "LUNCH", "text": "a hamburger, two apples, a cup of tea",
                 "openedMs": 30000, "dueMs": 85000 } ],
  "rules": [ "Red light: The bomb does not like beef or pork. Give chicken.",
             "Green light: The bomb wants ice cream, too.",
             "Purple light: The bomb only eats food you say with AN: an egg, an apple, an orange, an ice cream. Drinks are OK." ],
  "served": 1, "goal": 3 }
```

- `rules` lists only the lights the tier can show. A1 has none.
- `text` uses a/an and number words from `menu.py`: *a hamburger*, *an egg*, *two apples*,
  *bread* (no article for bread and rice), *a cup of tea*, *two cups of milk*.
- The Expert never sees the light or the trays.

## Renderer

**Defuser:**
- Left: the pantry shelf as a grid of food pictures (≥ 72 px each). The drink machine is five
  big taps with a cup under each.
- Middle: the stove, three burners. A food on a burner shows a ring timer drawn by code, and
  turns brown (cooked) and then black with smoke (burned) using a CSS filter on the same
  picture.
- Right: three trays with their meal pictures (sunrise, high sun, moon) and a **SERVE** button
  each. Tray items are drawn as small pictures; tap one to pick it back up.
- The **diet light** is a big round lamp on the bomb face, drawn by code in the palette color.
- `held` follows the last tap point as a lifted picture. A `bin` button sits under the stove.
- `labels`: English word under each pantry picture at A1–A2, pictures only at B1.

**Expert:** a column of ticket cards, most urgent at the top. Each card has the meal word in
caps, the order text in ≥ 24 px, and a shrinking time bar (green → yellow → red, drawn from
`dueMs`). The light rules sit in a box underneath.

**Placeholder mode:** food emoji (🍰🥪🌭🍕🍔🥩🍚🍞🍗🍦🥚🍎🍌🍊, pork 🥓), drink emoji (🥛🧃💧🍵☕), 🌅☀️🌙
for the trays.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

The diet light, stove timer rings, and burned look are code. Everything else is a picture.
Milk and water must look very different (carton vs glass), and **beef and pork must be
told apart at 96 px**: beef is a dark-red steak, pork is a pale-pink chop with a white fat rim
and a bone.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-kitchen` | — | A bright cartoon restaurant kitchen seen from the front: pale yellow tiled wall, a long wooden counter along the bottom, empty shelves on the left, an empty space in the middle and on the right. {SCENE_STYLE} |
| `meal-breakfast` | 🌅 | A small round picture of the sun rising over a green hill, soft orange morning sky. {STYLE} |
| `meal-lunch` | ☀️ | A small round picture of a bright yellow sun high in a clear blue sky. {STYLE} |
| `meal-dinner` | 🌙 | A small round picture of a yellow crescent moon in a dark blue night sky. {STYLE} |
| `tray` | — | An empty plain light-brown cafeteria tray seen from slightly above. {STYLE} |
| `stove` | — | A simple cartoon kitchen stove top seen from the front, with three round black burners in a row, off. {STYLE} |
| `food-cake` | 🍰 | A slice of strawberry cake with white cream. {STYLE} |
| `food-sandwich` | 🥪 | A sandwich cut in a triangle, with lettuce, cheese and ham. {STYLE} |
| `food-hot-dog` | 🌭 | A hot dog in a bun with a line of yellow mustard. {STYLE} |
| `food-pizza` | 🍕 | One slice of pizza with red sauce, cheese and pepperoni. {STYLE} |
| `food-hamburger` | 🍔 | A hamburger with a sesame bun, lettuce, tomato and cheese. {STYLE} |
| `food-bread` | 🍞 | A loaf of white bread with one slice cut off. {STYLE} |
| `food-banana` | 🍌 | One yellow banana. {STYLE} |
| `food-apple` | 🍎 | One shiny red apple with a green leaf. {STYLE} |
| `food-orange` | 🍊 | One round orange with a small green leaf. {STYLE} |
| `food-ice-cream` | 🍦 | A vanilla ice cream cone with one round scoop. {STYLE} |
| `food-pork-raw` | 🥓 | A raw pale-pink pork chop with a wide white fat rim and a small bone. {STYLE} |
| `food-pork` | 🥓 | **Edit `food-pork-raw`:** "Make the pork chop cooked: golden brown on top, with grill lines. Keep the shape, the fat rim and the bone." |
| `food-beef-raw` | 🥩 | A raw dark-red beef steak, thick, with thin white marbling and no bone. {STYLE} |
| `food-beef` | 🥩 | **Edit `food-beef-raw`:** "Make the steak cooked: dark brown, with grill lines. Keep the shape." |
| `food-chicken-raw` | 🍗 | A raw pale-pink chicken leg (drumstick). {STYLE} |
| `food-chicken` | 🍗 | **Edit `food-chicken-raw`:** "Make the chicken leg cooked: golden brown and crispy. Keep the shape." |
| `food-egg-raw` | 🥚 | A cracked raw egg in a small black pan, clear white and a bright yellow yolk. {STYLE} |
| `food-egg` | 🍳 | **Edit `food-egg-raw`:** "Make it a cooked fried egg: firm white, slightly golden edges. Keep the pan." |
| `food-rice-raw` | 🍚 | A small pot of uncooked white rice grains in water. {STYLE} |
| `food-rice` | 🍚 | A bowl of fluffy cooked white rice. {STYLE} |
| `drink-milk` | 🥛 | A small white-and-blue milk carton with a picture of a cow on it (no writing). {STYLE} |
| `drink-juice` | 🧃 | A tall glass of bright orange juice with a straw. {STYLE} |
| `drink-water` | 💧 | A clear glass of water with a few ice cubes, light blue tint. {STYLE} |
| `drink-tea` | 🍵 | A small green tea cup with light brown tea and a little steam. {STYLE} |
| `drink-coffee` | ☕ | A white coffee mug with dark brown coffee and steam. {STYLE} |

## Tests

- **Invariants:** 1000 rounds per tier, seeded, asserting every invariant above.
- **`need()`:** table tests for each light (red merges two beef lines into chicken; purple
  keeps *an egg* and drinks; green doesn't add a second ice cream).
- **Solver:** for each round, serve every ticket correctly using fake times (cook 4 s). Round
  won, 0 strikes.
- **Strikes:** serving raw, burned, a missing item, an extra item, or on a tray with no open
  ticket → 1 strike, tray kept. A ticket past its due time → 1 strike on the next request.
- **Light timing:** a tray that matched before a B1 light change and is served after it is
  judged by the new light.
- **Words:** ticket text and rules use list words, connectives, and the allow-list *give,
  light, red, green, purple, only, cup, of, too, food, you, say, with, does, not, OK, drinks*.
- **HTTP harness:** a scripted A2 run, and one run that lets a ticket expire.

## Acceptance

- Playable with placeholder emoji.
- At B1 a pair can't win without the Expert asking about the light: the light is only on the
  Defuser's screen, the tickets only on the Expert's.
- Beef/pork and milk/water are distinguishable at pantry size on an iPad.

## Flags (decided, change if needed)

- 🚩 **"an ice cream" stays on the purple list** (design doc open question). Remove it in
  `menu.py` if teachers object; nothing else changes.
- 🚩 A wrong SERVE keeps the tray's items, so the team can fix it instead of starting over,
  matching the forgiving retry in the other modules.
- 🚩 A1 has no stove, so cook foods come out of the pantry already cooked.
- 🚩 *bread* and *rice* are written with no article on tickets (*rice, chicken*), as in the
  design doc's example.
- 🚩 Rice uses a different picture when cooked (bowl vs pot) instead of an edit, because a pot
  turning into a bowl reads better than a pot changing color.
