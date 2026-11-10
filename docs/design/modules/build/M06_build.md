# M06 Messy Desk: Build Spec

**Design doc:** [`../M06_messy_desk.md`](../M06_messy_desk.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m06-messy-desk`

## Files

```
game_mods/m06-messy-desk/{gamemod.json, main.py, board.py, manual.py}
kwizzits/m06-messy-desk-{a1,a2,b1}/quiz.kzt     ← tags tier:A1|A2|B1 rounds:3 maxStrikes:3
webclient/modules/m06-messy-desk.js
webclient/art/m06-messy-desk/manifest.json
tests/test_m06_messy_desk.py
```

## Scene model (`board.py`)

The design build note says to model the scene as `(item, color, relation, anchor)`. To make
*next to* and *under the book* exact, places are **rows**:

| Place id | Means | Holds |
|---|---|---|
| `on:desk`, `on:table`, `on:chair` | on top of it | a left-to-right row of things |
| `under:desk`, `under:table`, `under:chair` | on the floor below it | a row |
| `in:box`, `in:bag`, `in:bookbag`, `in:cup` | inside it | an unordered set |
| `under:<item>` | covered by a book or notebook | at most one small thing |

- **Holders are fixed** but sit in rows too: the computer is always in `on:desk`; the box,
  bag, bookbag and cup each start in some row, so *next to the computer* or *by the cup* work.
- **next to X / by X** = the immediate left or right neighbor in the same row. In `in:` places,
  nothing is next to anything.

```python
class Thing:   tid: str; kind: str; color: str      # kind: pen pencil marker ruler eraser book notebook key
class Board:
    things: dict[str, Thing]
    rows: dict[str, list[str]]   # place id → tids (and holder ids) in order
    serial: str                  # 6 chars, last char a digit
    pages: list[Page]            # 5 pages: last digit 0/5, 1/6, 2/7, 3/8, 4/9
    held: str | None
```

**Rules** (a `Page` has 2–6), each with an exact check:

| Kind | Text | True when |
|---|---|---|
| `place` | The red pen is in the cup. | that thing is in that place |
| `under-thing` | The key is under the book. | the key is in `under:<that book>` |
| `place+next` | The notebook is on the desk, next to the computer. | both |
| `next` | The gray eraser is by the pink pencil. | neighbors in a row |
| `all` | All the markers are in the box. | every marker, every color |
| `nothing-on` | Nothing is on the chair. | `on:chair` has no small things |

A thing is named by **color + kind** when two things share a kind, otherwise by kind alone
("the key").

**Generation** (from the design build note):

1. Lay out holders and the computer. Place the things in a **solved** state that meets the
   real page's rules.
2. Write the real page from the solved state: pick rule kinds for the tier, about 1 in 3 rules
   about a *color twin*.
3. Apply 2 (A1), 3 (A2) or 4 (B1) **messes**: move a ruled thing somewhere wrong, or put an
   unruled thing where it breaks a `nothing-on` rule. At least one mess per round breaks a rule.
4. Write the 4 decoy pages from 4 other solved states of the same things.
5. Pick the serial so its last digit selects the real page.

**Invariants:**

- The real page's rules are all satisfiable **at once** (the solved state proves it).
- The messy scene fails at least 2 real rules (A2+), 1 at A1.
- No real rule names a thing ambiguously (two red pens never both exist).
- **Color twins** at A2+: at least one pair of the same kind in confusable colors (red/pink,
  blue/purple, gray/white, brown/black, yellow/green), and at least one real rule names one
  of them.
- B1: at least one `all` rule over 2–3 things of different colors, and one `nothing-on` rule.
- The tier's palette and prepositions are respected (table below).

## Tiers

| Tier | Things | Rules | Relations | Colors | Twins | `all` / `nothing-on` |
|---|---|---|---|---|---|---|
| A1 | 3 | 2 | in, on | red, blue, yellow, green | no | no |
| A2 | 5 | 4 | + under, next to | + black, white, pink, purple | yes | no |
| B1 | 8 | 6 | + by (= next to) | all 10 | yes | yes |

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `pick` | `{"tid": "t3"}` | Holds that small thing. Holders, furniture and the computer can't be picked. |
| `drop` | `{"place": "on:desk", "index": 2}` or `{"place": "under:t5"}` | Puts the held thing there (`index` = position in the row). `under:` a thing works only for a book or notebook with nothing under it yet. |
| `check` | `{}` | Every real rule true → round won. Otherwise **strike**; nothing moves. |

Moving a thing that isn't in the rules is allowed and never a strike (design: it only costs
time).

## Screens

**Defuser:**

```json
{ "serial": "KT4P73",
  "furniture": ["desk", "table", "chair"],
  "rows": { "on:desk": ["computer", "t2", "cup"], "on:chair": ["t5"], "in:cup": ["t1"], "under:t5": ["t4"] },
  "things": { "t1": {"kind": "pen", "color": "red"}, "t5": {"kind": "book", "color": "blue"} },
  "held": null,
  "labels": true }
```

The Defuser never sees any page.

**Expert:**

```json
{ "pages": [ { "title": "Page 3 (serial ends in 3 or 8)",
               "rules": ["The red pen is in the cup.", "The key is under the book.", "..."] }, "..." ],
  "howToRead": [ "By and next to are the same.",
                 "If the rule says all, look for every thing of that kind and every color.",
                 "If a thing is not in the rules, it can be in any place. Do not move it." ] }
```

`howToRead` only includes lines the tier uses (A1 has just the last one).

## Renderer

**Defuser:**
- A classroom scene (`bg-classroom`) with the **desk** (computer on top), the **table** and the
  **chair**, side by side, each with an "on" shelf zone above and an "under" floor zone below.
- **Small things are drawn by code** (SVG), each in its exact palette color with the art
  style's dark-brown outline. Color is information (ART_GUIDE rule 1).
- **Tap a thing, then tap where it goes** (PLATFORM P5, no drag):
  - in a row zone, tapping between two things inserts there (gap markers appear while
    holding);
  - tapping a holder (box, bag, bookbag, cup) puts it inside; their contents show as a fanned
    stack poking out the top;
  - tapping the bottom edge of a book or notebook puts the thing under it (it peeks out).
- Every drop target is ≥ 56 px, including the *under* strips (design build note).
- The **serial** is on a sticker on the computer screen.
- `labels` (A1–A2): the color and kind as small English words under each thing.
- **CHECK** button, bottom right.

**Expert:** five page cards as tabs (`Page 0/5 … Page 4/9`), the selected page's rules large,
and the "How to read the rules" box above.

**Placeholder mode:** holders and furniture as emoji (🖥️ 🪑 📦 👜 🎒 🥤, desk and table as code
rectangles); small things are code-drawn already.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

Only furniture, holders and the room are pictures. They hold or stand under colored things,
so keep them in **neutral colors** (light wood, gray, beige) that none of the 10 palette
colors get lost against.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-classroom` | — | A quiet cartoon classroom corner seen from the front: pale beige wall, light wooden floor, a window with sky on the far left, a large empty space across the middle. {SCENE_STYLE} |
| `desk` | — | A simple light-wood student desk seen from the front, flat empty top, four legs, open space under it. {STYLE} |
| `table` | — | A low, wide light-wood table seen from the front, flat empty top, four legs, open space under it. {STYLE} |
| `chair` | 🪑 | A simple light-wood classroom chair seen from the front, flat empty seat. {STYLE} |
| `computer` | 🖥️ | A small light-gray desktop computer monitor with a keyboard in front, the screen plain light blue and empty. {STYLE} |
| `box` | 📦 | An open cardboard box seen from slightly above, light brown, empty. {STYLE} |
| `bag` | 👜 | An open beige cloth tote bag with two handles, empty. {STYLE} |
| `bookbag` | 🎒 | A gray school backpack with the top open. {STYLE} |
| `cup` | 🥤 | A plain white pencil cup, empty, seen from the front. {STYLE} |

## Tests

- **Rule checks:** table tests for each rule kind, including *by* = *next to*, ends of rows,
  `in:` places having no neighbors, and `under:<book>`.
- **Invariants:** 1000 boards per tier, seeded, asserting every invariant above.
- **Solver:** move every thing to its solved place, then CHECK. Round won, 0 strikes.
- **Strikes:** CHECK with one rule unmet → 1 strike, nothing moves. Moving an unruled thing →
  no strike.
- **Leak check:** the Defuser view has no pages; the Expert view has no rows or serial.
- **Words:** rules and "how to read" use list words, connectives, and the allow-list *move,
  put, must, nothing, page, serial, ends, rules, rule, says, look for, every, thing, kind,
  of, same, any, place, all, do not*.
- **HTTP harness:** a scripted B1 run.

## Acceptance

- Playable with code-drawn things and placeholder holders.
- Every palette color is distinguishable on both devices (color-blind simulator check, same
  as M07's doors). Twins are told apart by the color *word* on the Expert's side.
- *Under* and *next to* drop zones work with a finger on an iPad.

## Flags (decided, change if needed)

- 🚩 **The serial picks the page**, as the design does. The README's variety rule 1 says
  "never use the serial just to pick a page", so this module conflicts with its own index.
  It's kept because M06 is the set's only serial-opening module ("What is the serial's last
  digit?"). If you want it gone, give the Expert one page and open with "Where is the key?".
- 🚩 Small things are **code-drawn**, because their colors carry the answer.
- 🚩 Only books and notebooks can have something under them.
- 🚩 The Defuser can't ask the bomb about a whole page (design doc open question): the Expert
  reads it, rule by rule, at every tier.
