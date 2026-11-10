# M01 Family Photo: Build Spec

**Design doc:** [`../M01_family_photo.md`](../M01_family_photo.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m01-family-photo`

## Files

```
game_mods/m01-family-photo/{gamemod.json, main.py, board.py, manual.py, cast.py}
kwizzits/m01-family-photo-{a1,a2,b1}/quiz.kzt      ← tags tier:A1|A2|B1 rounds:3 maxStrikes:3
webclient/modules/m01-family-photo.js
webclient/art/m01-family-photo/manifest.json      ← sprite traits live here (see Cast)
tests/test_m01_family_photo.py
```

## Cast: art and logic share one source of truth

People are a fixed **cast** of sprites. Each sprite's **traits are stored as tags in the art
manifest**, and `cast.py` loads them, so the puzzle logic always matches what is drawn.

**Art traits** (drawn in the image): `look`, `build`, `hair`, `job`, `item`.
**Code traits** (applied by the renderer, so no extra art is needed):
- `height`: `tall` / `short`, for adults and old people. Drawn by scaling to 1.0 or 0.85.
- `size`: `big` / `small`, for boy, girl and baby. Drawn by scaling.

| Trait | Values |
|---|---|
| look → family role | `old-man` → grandfather · `old-woman` → grandmother · `man` → father · `woman` → mother · `boy` → brother · `girl` → sister · `baby` → baby |
| build | `thin`, `fat` (not for baby) |
| hair | `black`, `brown`, `gray`, `white` (not for baby) |
| job | `doctor`, `nurse`, `teacher`, `student`, `singer`, `farmer`, `none` |
| item | `none`, `new-hat`, `old-hat`, `new-bookbag`, `old-bookbag`, `big-ball`, `small-ball`, `big-dog`, `small-dog` |

**Starter cast: 14 base sprites plus 14 near-twins.** Each twin differs in exactly **one**
art trait.

| Base id | Look | Build | Hair | Job | Item | Twin id: the one change |
|---|---|---|---|---|---|---|
| `man-1` | man | fat | black | doctor | none | `man-1t`: build → thin |
| `man-2` | man | thin | brown | farmer | none | `man-2t`: hair → black |
| `woman-1` | woman | thin | black | teacher | none | `woman-1t`: hair → brown |
| `woman-2` | woman | fat | brown | singer | none | `woman-2t`: job → nurse |
| `oldman-1` | old-man | thin | white | farmer | none | `oldman-1t`: hair → gray |
| `oldman-2` | old-man | fat | gray | none | old-hat | `oldman-2t`: item → new-hat |
| `oldwoman-1` | old-woman | thin | white | singer | new-hat | `oldwoman-1t`: item → old-hat |
| `oldwoman-2` | old-woman | fat | gray | none | none | `oldwoman-2t`: build → thin |
| `boy-1` | boy | thin | black | student | new-bookbag | `boy-1t`: item → old-bookbag |
| `boy-2` | boy | fat | brown | none | big-ball | `boy-2t`: item → small-ball |
| `girl-1` | girl | thin | black | student | old-bookbag | `girl-1t`: item → new-bookbag |
| `girl-2` | girl | thin | brown | none | small-dog | `girl-2t`: item → big-dog |
| `baby-1` | baby | — | — | none | big-ball | `baby-1t`: item → small-ball |
| `baby-2` | baby | — | — | none | new-hat | `baby-2t`: item → old-hat |

Manifest entry example (asset-manifest-v1):

```json
{ "assetId": "man-1", "kind": "image", "path": "man-1.png", "placeholder": "👨",
  "tags": ["look:man", "build:fat", "hair:black", "job:doctor", "item:none", "twin:man-1t"] }
```

The cast can grow later just by adding sprites with tags. No code changes.

## Board (`board.py`)

```python
class Person:        sprite: str; frame: int; height: str | None; size: str | None
class FamilyPage:    name: str; members: list[Member]   # Member = role + Person + mentioned traits
class Board:
    caption_name: str           # e.g. "LIN"
    pages: list[FamilyPage]     # the real family + decoy families, in shuffled order
    people: list[Person]        # what is in the photo: family members + the impostor
    impostor_frame: int
    stage2: list[Question]      # Question = (kind "number"|"other", highlight_frame, answer_role)
    stage: int; q_index: int
```

**Family names** come from a teacher-editable list. Default: `LIN, WANG, CHEN, LEE, KO, WU,
HO, TSAI`.

**Generation:**

1. Family size by tier (table below). Pick that many **distinct roles**, then a sprite of
   the matching look for each, plus random code traits.
2. Pick a member X to be copied. The impostor is X's **twin sprite**. At A2+ about 30% of
   the time it's instead **X's own sprite with the height/size flipped**, which gives free
   variety with no extra art.
3. **Mentioned traits.** Each member's book entry mentions 2–3 of their traits. X's entry
   **must** mention the trait where the impostor differs.
4. **Sentences** come from templates (below). Height and build are joined when both are
   mentioned: *"My father is tall and fat."*
5. **Two decoy family pages,** generated the same way with different names. They are
   never shown in the photo.
6. Shuffle the frames. Build the stage-2 questions.

**Invariants (tests check all of them):**

- Each family member **matches exactly one** entry on the real page (their own). "Matches" means the same look **and** every mentioned trait is equal.
- The impostor **matches no** entry.
- No sprite appears twice in a photo. The impostor's look is the same as X's, so the photo shows two people of that look.
- **A1:** the impostor's look is one the family **doesn't have** (an obvious extra person), and no twin is needed.
- **B1:** at least one other member shares the impostor's `job` (a second near-miss).
- Stage-2 answers are unique (guaranteed by the first invariant).

**Sentence templates.** Use *He/She* by look, and *The baby* for the baby. `{role}` is
the family word.

| Trait | Sentence |
|---|---|
| intro | `My {role} …` (first sentence of each entry) |
| height / size | `… is tall.` / `… is short.` / `… is big.` / `… is small.` |
| build | `… is thin.` / `… is fat.` |
| job | `{He/She} is a {job}.` |
| hair | `{He/She} has {color} hair.` |
| item | `{He/She} has a new hat.` · `… an old bookbag.` · `… a big dog.` · `… a small ball.` |

Rule lines shown above every page (from the design doc):

> One person in the photo is not in this book. He or she is a friend, not family. Press
> the friend.
> Then the bomb asks WHO. Press who he or she is in the family.

## Tiers

| Tier | People | Impostor | Stage 2 | Pages |
|---|---|---|---|---|
| A1 | 4 | look not in the family | off | 2 |
| A2 | 5 | twin (one trait) | 1 question: `WHO IS NUMBER n?` | 3 |
| B1 | 6–7 | twin + a second near-miss sharing the job | 2 questions, one is `WHO IS THE OTHER {JOB}?` when two members share a job | 3 |

**`WHO IS THE OTHER {JOB}?`** One of two same-job members is highlighted. The answer is the
role of the **non-highlighted** one. The Defuser has to describe the other person, and the
Expert matches the description. That makes *other* load-bearing.

## Actions

| Action | Data | Who | Result |
|---|---|---|---|
| `press-frame` | `{"frame": n}` | Defuser | Stage 1: `n == impostor_frame` → stage 2 (or round won). Otherwise a strike. |
| `press-role` | `{"role": "father"}` | Defuser | Stage 2: correct role → next question, or round won. Otherwise a strike. |

The Expert has no server actions. Switching family tabs on the Expert's screen is local only.

## Screens

**Defuser:**

```json
{ "caption": "THE LIN FAMILY",
  "people": [ { "frame": 1, "sprite": "oldman-1", "height": "tall" },
              { "frame": 2, "sprite": "man-1t",  "height": "tall" } ],
  "stage": 2,
  "prompt": "WHO IS NUMBER 3?",
  "highlight": 3,
  "roleButtons": ["GRANDFATHER", "GRANDMOTHER", "FATHER", "MOTHER", "BROTHER", "SISTER", "BABY", "FRIEND"] }
```

`prompt` and `highlight` are `null` in stage 1. Role buttons appear only in stage 2. The view
never includes traits, pages or the answer.

**Expert:**

```json
{ "rules": ["One person in the photo is not in this book. …", "…"],
  "pages": [ { "name": "WANG", "sentences": ["My grandfather is old and thin. …"] },
             { "name": "LIN",  "sentences": ["…"] },
             { "name": "CHEN", "sentences": ["…"] } ] }
```

## Renderer

- **Defuser:**
  - A framed group photo on a living-room wall (`bg-photo-wall`).
  - People stand on a shared floor line, scaled by height or size, each in a numbered frame
    slot. Up to 7 people fit in one row at 1024 px; otherwise use two rows.
  - Frame numbers are large digits. Tapping a person presses their frame.
  - The caption sits on a brass plate under the photo.
  - Stage 2: highlight a frame with a pulsing outline, show `prompt` in large text, and show
    role buttons as a 4×2 grid of English words.
- **Expert:** family-name tabs across the top (`WANG | LIN | CHEN`). The selected page's
  sentences are in large text, one per line, with the rules boxed above.
- **Placeholder mode (before art exists):**
  - Draw each person as their look emoji (👴👵👨👩👦👧👶), scaled by height/size and
    stretched horizontally 1.25× for `fat`.
  - Add a colored hair band, a job emoji badge (🩺 doctor, 💉 nurse, 📚 teacher, 🎒 student,
    🎤 singer, 👒 farmer), and an item emoji with a small `NEW`/`OLD` tag.
  - Clunky but fully playable.

## Art (Gemini)

Make the **base** sprites with the prompt below, then make each **twin** with the ART_GUIDE
edit prompt, using its one change. All are full-body, standing, facing forward, so they line
up in the photo.

**Base sprite prompt** (fill in from the cast table):

> A full-body cartoon of {LOOK}, standing and smiling, facing forward, arms relaxed. {BUILD}.
> {HAIR}. {JOB}. {ITEM}. {STYLE}

| Slot | Values |
|---|---|
| LOOK | old-man: *a kind Taiwanese grandfather with a wrinkled smiling face* · old-woman: *a kind Taiwanese grandmother* · man: *a Taiwanese father, about 40 years old* · woman: *a Taiwanese mother, about 40 years old* · boy: *a Taiwanese boy, about 10 years old* · girl: *a Taiwanese girl, about 10 years old* · baby: *a happy Taiwanese baby sitting up* |
| BUILD | thin: *He/She is clearly slim and thin* · fat: *He/She is clearly round and fat, with a big round belly* |
| HAIR | *He/She has short/long {color} hair* (white and gray for the old people) |
| JOB | doctor: *wearing a white doctor's coat with a stethoscope around the neck* · nurse: *wearing light-blue nurse clothes and a white nurse's cap with a small red heart* · teacher: *holding a book in one hand and a piece of white chalk in the other* · student: *wearing a simple school uniform* · singer: *holding a microphone* · farmer: *wearing a wide straw hat and work clothes, holding a small garden hoe* · none: *wearing everyday clothes* |
| ITEM | new-hat: *wearing a shiny, bright, brand-new hat* · old-hat: *wearing an old, faded hat with a patch on it* · new-bookbag / old-bookbag: same idea, a bookbag on the back · big-ball / small-ball: *holding a very big ball* / *holding a very small ball* · big-dog / small-dog: *with a big dog / a tiny dog sitting beside them* |

Conflicts to watch:
- A farmer's straw hat counts as the job prop, so a farmer never gets a `new-hat` /
  `old-hat` item (the cast table already follows this).
- Student sprites with a bookbag item wear the bookbag on the back.

**Twin edit example** (`man-1` → `man-1t`):

> Edit the attached image. Change only this: **make him clearly slim and thin instead of
> fat.** Keep everything else exactly the same: same character, same face, same clothes,
> same pose, same colors, same style, same white background.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-photo-wall` | — | A warm cartoon living-room wall with soft cream wallpaper and a wide, empty wooden picture frame hanging in the middle (the inside of the frame is plain light blue and empty), a small plant on each side. {SCENE_STYLE} |

## Tests

- **Invariants:** 1000 boards per tier, seeded, asserting every generation invariant.
- **Solver:** press the impostor frame, then the right roles. Round won, 0 strikes.
- **Strikes:** wrong frame → 1 strike, stage unchanged. Wrong role → 1 strike, question
  unchanged.
- **Cast:** every manifest sprite has all trait tags. Every `twin:` points to a sprite of the
  same look that differs in exactly one art trait.
- **Words:** sentences and rules use list words, connectives, and the allow-list *photo,
  book, family, friend, press, then, asks, person, one*. (*family* is on the 400 list; it's
  allowed as a game word.)
- **HTTP harness:** a scripted B1 run.

## Acceptance

- Playable with placeholder emoji only.
- On the iPad, every person is tappable, and the twins' difference is visible at the photo's
  size (check with real art, and fix the art if not).
- The Expert sees three pages and has to ask for the caption name to know which one is real.

## Flags (decided, change if needed)

- 🚩 The Expert gets **three** family pages, so the opening question "What is the name on the
  photo?" still matters.
- 🚩 Height and size are drawn by scaling only. If students find "tall" hard to judge in the
  photo, add a height-ruler wall behind the people.
