# M09 Mood Plugs: Build Spec

**Design doc:** [`../M09_mood_plugs.md`](../M09_mood_plugs.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m09-mood-plugs`

## Files

```
game_mods/m09-mood-plugs/{gamemod.json, main.py, board.py, manual.py, grammar.py}
kwizzits/m09-mood-plugs-{a2,b1,b1plus}/quiz.kzt   ← tags tier:A2|B1  bare:on (b1plus)  rounds:3 maxStrikes:3
webclient/modules/m09-mood-plugs.js
webclient/art/m09-mood-plugs/manifest.json
tests/test_m09_mood_plugs.py
```

`grammar.py` holds `matches(sentence, tile)`, the checker the design build note says **is**
the spec.

## Board (`board.py`)

```python
class Tile:
    tid: str
    who: str        # boy | girl | dog | cat | EXPERT | DEFUSER | US
    count: int      # 1 or 2 (portraits: 1; US counts as "we")
    row: str | None # "front" | "back" | None (A2 has no rows; portraits are at the side)
    feeling: str    # happy | angry | sad | fine | good | great

class Sentence:
    socket: str     # "A".."F"
    subject: str    # "That girl", "These cats", "I", "It", "They", "These" …
    feeling: str
    extra: str | None   # "It is in the back." (a second sentence that adds the row)

class Board:
    tiles: list[Tile]          # picture tiles + portraits
    sentences: list[Sentence]
    plugs: dict[str, str]      # socket → tid
    held: str | None           # socket picked, waiting for a tile
```

**`matches(sentence, tile)`**, from the manual's "How to read it":

| Subject word | Tile must be |
|---|---|
| this / these + noun | front row; noun = `who`; *this* → count 1, *these* → count 2 |
| that / those + noun | back row; same |
| These / Those alone (B1+) | that row, count 2, any picture tile |
| he | a boy, count 1 |
| she | a girl, count 1 |
| it | a dog or a cat, count 1 |
| they | count 2, any picture tile |
| I | EXPERT |
| you | DEFUSER |
| we | US |

…and the tile's `feeling` equals the sentence's feeling. An `extra` sentence ("It is in the
back.") adds its row.

**Generation:**

1. Make the sentences first: A2 4, B1 5–6. Pick subjects for the tier (table below). B1 always
   has one portrait sentence.
2. Make one answer tile per sentence.
3. Add **decoys that differ by one feature** (design "Solving it"): for each sentence, at
   least one tile that matches all but one of row / count / who / feeling. B1 always includes
   the *this* vs *that* twin, the *it* vs *they* twin, and the two portraits both looking
   positive (*good* and *great*).
4. Fill to 8 (A2) or 10 (B1) picture tiles. Portraits: EXPERT, DEFUSER and US are always
   present at B1, with feelings chosen so exactly one sentence (or none) points at each.

**Invariants:**

- **Each sentence matches exactly one tile** (design build note), and no two sentences match
  the same tile.
- Every decoy rule above holds.
- A2 uses only he / she / it / they (no rows, no portraits).

## Tiers

| Tier | Sockets | Subjects | Rows | Portraits | Bare *these/those* |
|---|---|---|---|---|---|
| A2 | 4 | he, she, it, they (+ noun: *the girl*, *the cats*) | no | no | no |
| B1 | 5–6 | + this/that/these/those + noun, I, you, we | yes | yes | no |
| B1+ | 5–6 | B1 + *These are angry.* | yes | yes | yes |

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `plug` | `{"socket": "A", "tid": "t4"}` | Connects (replacing that socket's old cable). A tile can only take one cable: plugging a used tile moves the cable. |
| `unplug` | `{"socket": "A"}` | Removes it. |
| `check` | `{}` | All sockets plugged and every plug matches → round won. Otherwise **strike**; cables stay. |

## Screens

**Defuser:**

```json
{ "sockets": ["A", "B", "C", "D", "E", "F"],
  "tiles": [ {"tid": "t1", "who": "girl", "count": 1, "row": "back", "feeling": "happy"},
             {"tid": "p1", "who": "EXPERT", "avatar": "kid-3", "feeling": "great"} ],
  "plugs": {"A": "t1"},
  "rows": true }
```

The Defuser never sees the sentences. `avatar` is the picture the partner picked at join
(PLATFORM P2 join screen gets an avatar choice; 🚩).

**Expert:**

```json
{ "sentences": [ {"socket": "A", "text": "That girl is happy."},
                 {"socket": "D", "text": "It is sad. It is in the back."} ],
  "faceGuide": [ ["red face / angry eyes", "angry"], ["water from the eye", "sad"],
                 ["a small smile / OK hand", "fine"], ["thumbs up", "good"],
                 ["star eyes and thumbs up", "great"], ["a big smile", "happy"] ],
  "howToRead": [ "This and these are in the front. That and those are in the back.",
                 "I is you, the Expert. You is the Defuser. We is the two of you.",
                 "He is a boy. She is a girl. It is an animal. They are two or more." ],
  "plugged": 3 }
```

`howToRead` leaves out lines the tier doesn't use. The Expert never sees tiles.

## Renderer

**Defuser:**
- Left: a column of **sockets** A–F, big round jacks with the letters.
- Right: the tile board. With rows: the **front row** at the bottom with big tiles, the
  **back row** at the top with smaller tiles behind a rail (depth). A2: one row.
- Pairs (count 2) are **the same picture drawn twice**, side by side, in one tile (code
  composes them; ART_GUIDE rule 1).
- Portraits at the far right, each in a frame labeled **EXPERT**, **DEFUSER** or **US**
  (English labels; US shows both avatars).
- **Tap a socket, then a tile** draws a cable (code, a curved SVG line in the socket's color).
  Tap a plugged socket to unplug.
- **Feelings are never written** on tiles (design: they're drawn). No `labels` on tiles at
  any tier (🚩).
- **CHECK** button.

**Expert:** the sentences, one per socket letter, ≥ 28 px. The Face Guide table and the "How
to read it" box beside them.

**Placeholder mode:** the who as 👦👧🐶🐱 with a feeling emoji badge: 😡 angry, 😢 sad, 👌 fine,
👍 good, 🤩 great, 😄 happy. Portraits: the avatar emoji with the same badge.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

Every face is a **set of six** made by editing one base, so the character stays identical
and only the feeling changes. Make the `happy` version first, then edit it into the other
five. Feelings must match the Face Guide exactly, because the Defuser describes what they see
and the Expert matches it: **angry** = red face, angry eyes, steam; **sad** = a tear; **fine**
= a small flat smile with an OK hand sign; **good** = one thumbs up, normal eyes; **great** =
star eyes *and* a thumbs up; **happy** = a big open smile, no hands. Good vs great is the
riskiest pair (design build note): make the star eyes big.

Subjects: `boy`, `girl`, `dog`, `cat`. Avatars (picked at join, used in portraits): `kid-1`
… `kid-4`. That's 8 characters × 6 feelings = 48 pictures, named `<who>-<feeling>`.

**Base prompts** (the happy version):

| Base | Prompt |
|---|---|
| `boy-happy` | A cartoon Taiwanese boy, about 10 years old, short black hair, plain red T-shirt, shown from the waist up, facing forward, with a big open happy smile, hands down. {STYLE} |
| `girl-happy` | A cartoon Taiwanese girl, about 10 years old, black hair in two ponytails, plain yellow T-shirt, shown from the waist up, facing forward, with a big open happy smile, hands down. {STYLE} |
| `dog-happy` | A cartoon brown puppy sitting, facing forward, with a big open happy smile, paws down. {STYLE} |
| `cat-happy` | A cartoon gray cat sitting, facing forward, with a big open happy smile, paws down. {STYLE} |
| `kid-1-happy` | A cartoon child's face and shoulders in a round bomb-squad helmet with a small light on top, short black hair, green suit, facing forward, big open happy smile, hands down. {STYLE} |
| `kid-2-happy` | Same idea: a cartoon child in a round bomb-squad helmet, long black hair, orange suit, facing forward, big open happy smile, hands down. {STYLE} |
| `kid-3-happy` | Same idea: a cartoon child in a round bomb-squad helmet, glasses, blue suit, facing forward, big open happy smile, hands down. {STYLE} |
| `kid-4-happy` | Same idea: a cartoon child in a round bomb-squad helmet, curly brown hair, purple suit, facing forward, big open happy smile, hands down. {STYLE} |

**Feeling edits** (attach the `-happy` picture, use the ART_GUIDE edit prompt with this
change):

| Feeling | The one change |
|---|---|
| `angry` | Make the face angry: red face, frowning angry eyes, a little steam puffing from the head. No smile. Hands down. |
| `sad` | Make the face sad: down-turned mouth and one big tear on the cheek. Hands down. |
| `fine` | Make the face calm with a small flat smile, and raise one hand (or paw) making an OK sign. |
| `good` | Make the face pleased with a normal smile and normal eyes, and raise one hand (or paw) giving a thumbs up. |
| `great` | Make the eyes into big shining yellow stars, with a wide smile, and raise one hand (or paw) giving a thumbs up. |

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-switchboard` | — | A cartoon old-fashioned telephone switchboard panel seen from the front, warm wood frame, dark panel on the left, a big empty light-colored board on the right. {SCENE_STYLE} |

## Tests

- **`matches`:** table tests for every subject word, including *it* vs *they*, *this* vs
  *these*, *I* = EXPERT, *you* = DEFUSER, bare *These*.
- **Invariants:** 1000 boards per tier, seeded: each sentence matches exactly one tile; decoy
  rules hold.
- **Solver:** plug each sentence's match, CHECK. Round won, 0 strikes.
- **Strikes:** one wrong plug → 1 strike, cables stay. CHECK with an empty socket → strike.
- **Leak check:** no sentences in the Defuser view; no tiles in the Expert view.
- **Words:** sentences, Face Guide and rules use list words, connectives, and the allow-list
  *plug, front, back, row, face, Expert, Defuser, red, eyes, water, eye, small, smile, OK,
  hand, thumbs up, star, big, two, more, animal, in the*.
- **HTTP harness:** a scripted B1 run.

## Acceptance

- Playable with placeholder emoji.
- Students can tell **good** from **great**, and **fine** from **happy**, at tile size on an
  iPad (check with real art first, design build note).
- The I/you flip works: a scripted pair that plugs "I am great" to DEFUSER gets a strike.

## Flags (decided, change if needed)

- 🚩 **"fine" is the OK hand with a small flat smile** (design doc open question). If teachers
  read it as neutral, that's what the Face Guide already says ("a small smile").
- 🚩 Avatars are **picked from 4 cartoon kids at join**, never photos (design build note on
  privacy). The join screen (PLATFORM P2) needs an avatar choice; until then, seat `a` gets
  `kid-1`, seat `b` gets `kid-2`.
- 🚩 In a **team of 3** (two Experts), "I" and "we" are ambiguous, so the generator leaves out
  I / we sentences for those teams.
- 🚩 **No English labels on tiles**, even at A2. The A1–A2 label rule would print feelings,
  which the design forbids, and the who (boy, dog) is never in doubt.
- 🚩 Cables are made by tapping a socket, then a tile (PLATFORM P5), not by dragging.
