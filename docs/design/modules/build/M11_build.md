# M11 Monster Clinic: Build Spec

**Design doc:** [`../M11_monster_clinic.md`](../M11_monster_clinic.md). Read it first for the
why. This spec is the *how*.
**Depends on:** [`PLATFORM.md`](PLATFORM.md) (P1 action route, P2 teams/roles, P5 web
client, P6 screen shape).
**Module id:** `m11-monster-clinic`
**Build first.** It's the reference module whose team/round plumbing the others copy.

## Files

```
game_mods/m11-monster-clinic/gamemod.json
game_mods/m11-monster-clinic/main.py      ← plugin: teams, roles, rounds, strikes (PLATFORM P2/P6/P7)
game_mods/m11-monster-clinic/board.py     ← generate(), solution(), apply()
game_mods/m11-monster-clinic/manual.py    ← Doctor Book text for a tier
kwizzits/m11-monster-clinic-a1/quiz.kzt   ← tags: tier:A1 rounds:3 maxStrikes:3
kwizzits/m11-monster-clinic-a2/quiz.kzt   ← tags: tier:A2 rounds:3 maxStrikes:3
kwizzits/m11-monster-clinic-b1/quiz.kzt   ← tags: tier:B1 rounds:3 maxStrikes:3
webclient/modules/m11-monster-clinic.js   ← renderer (both roles)
webclient/art/m11-monster-clinic/manifest.json
tests/test_m11_monster_clinic.py
```

`gamemod.json`: `name` "Monster Clinic", `minPlayers` 2, `maxPlayers` 40,
`supportsTeams` true.

## Data model (`board.py`)

```python
class Head:            # plain class, no @dataclass (see PLATFORM P7)
    index: int         # 1-based
    eyes: int          # 1–5
    ears: int          # 0–3
    noses: int         # 1, or 2 (B1 only)
    hair: str | None   # a color word: "black" "brown" "red" "purple" "yellow", or None

class Monster:
    sick: bool
    skin: str          # "green-spots" if sick, else one of "blue" "pink" "purple" "yellow"
    temp: str          # "hot" | "cold" | "normal"
    heads: list[Head]  # 1–3
    hands: int         # 2–4
    legs: int          # 2–6

class Board:
    monster: Monster
    serial: str        # 5 chars, letters (no I or O) and digits, e.g. "K42P9"
    steps: list[Step]  # the solution, from solution(monster, tier, serial)
    pos: int           # index of the current step
    touched: set[str]  # for touch-all steps
```

**Target ids** (the strings the client sends):

| Part | Id | Notes |
|---|---|---|
| eye | `h{n}-eye{k}` | k = 1…eyes |
| ear | `h{n}-ear{k}` | k = 1…ears |
| nose | `h{n}-nose{k}` | |
| mouth | `h{n}-mouth` | |
| hair | `h{n}-hair` | only exists if hair is not None |
| head | `h{n}-head` | the top of the head (under the hair, if any) |
| face | `h{n}-face` | the face plate, where it isn't covered by a feature |
| hand | `hand{k}` | |
| leg | `leg{k}` | |

**Tools:** `cold-pack`, `hot-bag`. **Button:** `ok`.

## Solution (`solution()`)

A list of steps. Each step is one of:

- `{"kind": "ok"}`
- `{"kind": "tool", "tool": T, "targets": {ids}}`: any one target in the set
- `{"kind": "touch", "targets": {ids}}`: any one target in the set
- `{"kind": "touch-all", "targets": {ids}}`: every id once, in any order

Rules, from the design doc's Doctor Book:

1. **Not sick:** the whole solution is `[ok]`.
2. **Step 1:**
   - `hot` → `tool cold-pack` on the head with the most eyes (targets: its `head` and its `hair`).
   - `cold` → `tool hot-bag` on any `leg*`.
   - `normal` → no step.
3. **Step 2, by number of heads:**
   - 1 head: `touch h1-nose*` → `touch h1-mouth` → `touch hand*`
   - 2 heads: `touch any ear` → `touch any ear` → `touch leg*`
   - 3 heads: `touch hX-face` (X = the head with no ears) → `touch hX-nose*` → `touch hX-mouth`
4. **Step 3 (B1 only):** N = total eyes. If the digit N appears in `serial`, then
   `touch-all` every eye. Otherwise, if any head has hair, `touch any hair`; if no head has
   hair, `touch any head` twice (two `touch` steps).

## Generator invariants (`generate(tier, rng)`)

Reroll until all of these hold. The tests check every one.

- Per head: eyes 1–5, ears 0–3. Total eyes ≤ 12. **At B1, total eyes ≤ 9**, so N is always a single serial digit (🚩 decided).
- `temp == "hot"` and 2+ heads → exactly **one** head has the most eyes.
- 3 heads → exactly **one** head has 0 ears.
- 2 heads → at least 1 ear in total.
- B1: pick the step-3 outcome first (50/50), then build `serial` to include or exclude N. The serial always has at least 2 digits and 2 letters.
- Not-sick trap boards: A2+ only, about 1 in 6 rounds, never two in a row in one run. Trap monsters still get random temperatures and body counts, as decoys.
- Temperature mix at A2+: hot 35%, cold 35%, normal 30%. A1: thermometer hidden, temp is `normal`.

| Tier | Heads | Thermometer | Trap | Step 3 | 2 noses | Part labels on Defuser screen |
|---|---|---|---|---|---|---|
| A1 | 1 | no | no | no | no | yes |
| A2 | 1–2 | yes | yes | no | no | no |
| B1 | 1–3 | yes | yes | yes | sometimes | no |

🚩 **Decided:** A1 shows small English labels on the monster's parts (`nose`, `eye`…),
following the "English under the picture at A1–A2" rule. A2 drops them, because at A2 knowing
the body words *is* the exercise. Easy to change in one tier flag.

## Actions (`apply(board, role, action, data)`)

Only the **Defuser** can act. Expert actions are rejected with `ok: false` and no strike.

| Action | Data | Result |
|---|---|---|
| `touch` | `{"target": id}` | Matches the current `touch` step → advance. For a `touch-all` step: a new matching eye is marked, and the step is done when all are marked; an eye already touched is **ignored**, no strike (🚩 decided). Anything else is a **strike** and the step stays the same. |
| `tool` | `{"tool": T, "target": id}` | Matches the current `tool` step → advance. Otherwise a strike. |
| `ok` | `{}` | Current step is `ok` → round won. Otherwise a strike. |

- **Strikes never reset progress** (🚩 decided, matching the existing mods' forgiving retry).
- When `pos == len(steps)`, the round is won. Show `round-won` for 3 s.
- On the next poll after that, the server starts the next round, swaps roles (PLATFORM P2),
  and sets `roleBanner`.
- After `rounds` rounds won, the status is `defused`. At `maxStrikes` strikes, it's `exploded`.

## Screens (`view` inside the PLATFORM P6 envelope)

**Defuser:**

```json
{
  "monster": {
    "skin": "green-spots",
    "heads": [ { "index": 1, "eyes": 3, "ears": 1, "noses": 1, "hair": "purple" },
               { "index": 2, "eyes": 1, "ears": 2, "noses": 1, "hair": null } ],
    "hands": 4, "legs": 2
  },
  "thermometer": "hot",
  "tools": ["cold-pack", "hot-bag"],
  "serial": "K42P9",
  "labels": false,
  "touched": ["h1-eye2"],
  "progress": 0.4
}
```

`thermometer` is `null` at A1, and `tools` is empty at A1. `progress` drives the heart meter.
The view **never** includes `sick`, `steps` or `pos`.

**Expert:**

```json
{
  "title": "DOCTOR BOOK",
  "sections": [
    { "heading": "Step 0. Is it sick?", "lines": ["A sick monster has a green face with spots.", "..."] },
    { "heading": "Step 1. Is it hot or cold?", "lines": ["..."] },
    { "heading": "Step 2. How many heads does it have?", "table": [["1", "nose → mouth → a hand"], ["2", "an ear → an ear → a leg"], ["3", "the face with no ears → its nose → its mouth"]] },
    { "heading": "Step 3. How many eyes does it have?", "lines": ["..."] }
  ],
  "history": ["cold pack on the head", "an ear", "an ear"]
}
```

- `manual.py` builds `sections` for the tier. The text matches the design doc's Doctor
  Book, word for word, and leaves out steps the tier doesn't use.
- `history` lists the Defuser's last 6 **correct** actions as English words. It isn't a
  bypass: the Expert reads English to follow progress. Wrong actions appear only as the
  strike lamp.

## Renderer (`webclient/modules/m11-monster-clinic.js`)

**Defuser:** the monster is drawn **entirely in SVG by code**. Never use a generated image
for it, because the counts must be exact (ART_GUIDE rule 1).

- **Layout:** heads side by side across the top, on a round body. Hands spread along the
  sides of the body, legs along the bottom.
- **Each head:**
  - a circle, with a lighter **face plate** in the middle
  - eyes in up to two rows in the upper face
  - ears on the outline (left, right, top-left)
  - nose(s) in the center, mouth in the lower face
  - hair as a colored tuft over the top of the head
- **Skin:** green plus darker spots when `skin == "green-spots"`, otherwise a flat color with no spots.
- **Hit areas:** every part is a `<g data-target="…">`, with an invisible hit circle of at
  least **56 px** on screen, even when the drawn part is smaller.
  - Scale the whole monster so that holds at 1024×768: about 260 px per head with 3 heads.
  - When hit areas overlap, the smaller part wins (an eye inside the face plate wins over the face).
- **Thermometer:** code-drawn. A red top with sweat drops (hot), blue with frost (cold),
  green (normal).
- **Tools:** tap a tool (it lifts and glows), then tap a part → `sendAction("tool", …)`.
  Tapping the tool again cancels.
- **OK button:** labeled `OK`, bottom right.
- **Serial:** shown on a metal plate on the bomb casing, top right, in large monospace.
- **Feedback:** the heart meter fills by `progress`. A strike flashes the screen edge red.

**Expert:** the Doctor Book as large text (≥ 20 px). The current tier's sections are in
order, and the `history` list sits in a side column. No pictures.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

The monster and thermometer are code-drawn, so very little art is needed:

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-clinic` | — | A cozy cartoon doctor's room seen from the front: a pale mint-green wall, a white medicine cabinet on the left, a small window with yellow curtains on the right, an empty space in the middle where a patient will stand, a light wooden floor. {SCENE_STYLE} |
| `tool-cold-pack` | 🧊 | A soft light-blue cold pack: a squishy rectangular gel bag with a few small ice cubes drawn on it and tiny frosty sparkles around it. {STYLE} |
| `tool-hot-bag` | ♨️ | A red rubber hot water bag with a round white cap, little wavy lines of steam rising from it. {STYLE} |
| `icon-nurse` | 👩‍⚕️ | A white nurse's cap with a small red heart on the front. {STYLE} |
| `icon-doctor` | 📕 | A thick green book with a doctor's stethoscope lying across the cover. {STYLE} |
| `title-monster` | 👾 | A cute fuzzy little round monster sitting on a doctor's bed, looking sick and sad, with a thermometer in its mouth. Decorative title picture. {STYLE} |

The nurse cap uses a heart, not a red cross. The Red Cross emblem is legally protected and
shouldn't appear in games. `title-monster` is decorative only, so its eye count doesn't
matter.

## Tests (`tests/test_m11_monster_clinic.py`)

- **Invariants:** generate 1000 boards per tier, seeded, and assert every invariant above.
- **Solver:** for each board, play `steps` as actions through `apply` and assert the round
  is won with 0 strikes.
- **Strikes:** for each board, send one wrong target and assert one strike with `pos`
  unchanged. Send an already-touched eye during `touch-all` and assert no strike.
- **Trap:** on a not-sick board, any `touch` is a strike, and `ok` wins.
- **Roles:** after a round is won, the Defuser and Expert player ids swap, and the Expert
  can't act.
- **Words:** every word in `manual.py` output is in `vocab_260.tsv`, an allowed connective,
  or this allow-list: *monster, spots, step, touch, press, put, OK, cold pack, hot water
  bag, more, than, every, time, times, serial, number, look, any, all, then, done*.
- **HTTP harness:** a scripted pair finishes a B1 run, and a second script reaches 3 strikes
  and sees `exploded`.

## Acceptance

- Playable start to finish on an iPad and a Chromebook with **placeholder emoji only**.
- Every part on the busiest legal monster (3 heads, 12 eyes, 5 on one head, 6 legs) can be
  tapped accurately with a finger on an iPad.
- The Expert's screen contains no pictures and no information beyond the Doctor Book and
  the progress history.
- Roles swap each round. Both partners see the banner.
