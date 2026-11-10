# M08 Mystery Guest: Build Spec

**Design doc:** [`../M08_mystery_guest.md`](../M08_mystery_guest.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m08-mystery-guest`

## Files

```
game_mods/m08-mystery-guest/{gamemod.json, main.py, board.py, manual.py, grammar.py}
kwizzits/m08-mystery-guest-{a2,b1,b2}/quiz.kzt   ← tags tier:A2|B1|B2 rounds:3 maxStrikes:3
webclient/modules/m08-mystery-guest.js
webclient/art/m08-mystery-guest/manifest.json
tests/test_m08_mystery_guest.py
```

`grammar.py` is the bomb's answer engine (design build note): which tiles make a good
question, and the full-sentence answer for each.

## Board (`board.py`)

```python
class Guest:
    name: str            # AMY BEN TOM MAY LEO EVA KAI SUE
    boy: bool            # BEN TOM LEO KAI are boys; AMY MAY EVA SUE are girls
    can: str             # dance | sing | read | write | draw
    has: str | None      # kite | ball | yo-yo | doll | None
    likes: str           # kite | ball | yo-yo | doll
    did: str | None      # draw | write | None   (today)
    avatar: str          # which picture

class Board:
    guests: list[Guest]      # 6 (A2) or 8
    target: str              # the bomb maker's name
    notes: list[Note]        # witness notes; Note = text + true/false + the fact it states
    serial: str | None       # B2 only
    budget: int              # questions left
    feed: list[tuple[str, str]]   # (question text, answer text), newest last
    grayed: set[str]         # Defuser's own marks (not secret; just shown back)
```

**The question builder** has four rows; row 4 may be blank.

| Row | Tiles |
|---|---|
| 1 | `Can` `Does` `Did` `Is` `What` `Who` |
| 2 | `he` `she` |
| 3 | `dance` `sing` `read` `write` `draw` `play` `have` `like` |
| 4 | `a kite` `a ball` `a yo-yo` `a doll` `today` *(blank)* |

**`grammar.py`, good questions** and their answers (about the target, using its pronoun):

| Pattern | Asks about | Answer |
|---|---|---|
| `Can he/she` + dance/sing/read/write/draw + *blank* | `can` | *Yes, he can.* / *No, he can not.* |
| `Can he/she play` + *blank* | — (everyone can play) | *Yes, he can.* |
| `Does he/she have` + a toy | `has` | *Yes, he does.* / *No, he does not.* |
| `Does he/she like` + a toy | `likes` | same |
| `Did he/she` + draw/write + `today` or *blank* | `did` | *Yes, he did.* / *No, he did not.* |

Everything else is rejected, **and still uses a question**:

- `What` or `Who` in row 1 → *Ask a yes or no question.*
- Any other combination (*Does he can dance*, *Can he have a kite*, *Is he dance*, *Does he
  play a ball*, *Can he dance a kite*) → *That is not a good question.*
- **Wrong pronoun** (`she` when the target is a boy) → *No. He is a boy.* (a good question,
  so the answer is true, but it only tells you the pronoun, 🚩).

**Generation:**

1. Make the guests: A2 uses 6 of the 8 names. Every guest gets a `can`, a `likes`, and maybe a
   `has` and a `did`.
2. Pick the target. Write the notes:
   - **name note** (B1+): *His name is BEN, KAI or LEO.* (the target plus two others of the
     same pronoun);
   - **can-not note** (B1+): *He can not sing.* (an ability the target doesn't have, and
     at least one other name in the name note does).
3. **B2 serial:** 50% of rounds the serial has a 7. Then the can-not note is **false**: the
   target *can* do that thing. Otherwise the serial has no 7 and both notes are true.
4. **Solvability check** (design build note): with the tier's tiles, a best question strategy
   must find the target, among the guests that fit the true notes, in at most `budget`
   questions. Compute it with a minimax search over the good questions (the board is small).
   Reroll if it can't.
5. **Not too easy:** at least 2 guests fit the true notes before any question.

**Invariants:** the solvability and not-too-easy checks above; every name is unique; A2 notes
are empty; at B2 a false note is always the can-not note.

## Tiers

| Tier | Guests | Live tiles | Questions | Notes | Serial |
|---|---|---|---|---|---|
| A2 | 6 | `Can` + dance/sing/read/write/draw (others grayed) | 6 | none | no |
| B1 | 8 | + `Does` with have/like/play, toys | 5 | name + can-not | no |
| B2 | 8 | + `Did` and `today` (all tiles) | 4 | name + can-not | yes: "has a 7" rule |

Grayed tiles can't be tapped, so an A2 question can't fail on a tile it doesn't know yet.

## Actions

| Action | Who | Data | Result |
|---|---|---|---|
| `ask` | Defuser | `{"tiles": ["Does", "he", "have", "a kite"]}` | `budget > 0` → `budget -= 1`, append (question, answer) to `feed`. `budget == 0` → rejected, no strike. |
| `gray` | Defuser | `{"name": "KAI"}` | Toggles the mark. No strike. |
| `accuse` | Defuser | `{"name": "BEN"}` | Target → round won. Otherwise **strike** and `budget -= 1` (if any left), and that guest is grayed. |

ACCUSE is allowed at 0 questions (🚩).

## Screens

**Defuser:**

```json
{ "guests": [ { "name": "AMY", "avatar": "girl-2", "can": "draw", "has": "kite", "likes": "ball", "did": "draw", "grayed": false } ],
  "rows": [ ["Can", "Does", "Did", "Is", "What", "Who"], ["he", "she"], ["dance", "..."], ["a kite", "...", "today"] ],
  "live": ["Can", "he", "she", "dance", "sing", "read", "write", "draw"],
  "budget": 5,
  "serial": "B7KQ2" }
```

The Defuser view **never** includes `feed`, notes, or the target.

**Expert:**

```json
{ "notes": ["His name is BEN, KAI or LEO.", "He can not sing."],
  "serialRule": "If the serial has a 7, one note is not true. It is the note with \"can not\".",
  "feed": [ {"q": "Does he have a kite?", "a": "Yes, he does."} ],
  "budget": 4 }
```

`serialRule` only at B2. The Expert never sees the guests or the target.

## Renderer

**Defuser:**
- The party scene (`bg-party`) with 6 or 8 **guest cards** in two rows. Each card:
  the guest picture; a big **name tag** drawn by code (high-contrast capitals, design build
  note); and four fixed spots around the picture: the **can** prop by the feet, the **has**
  toy in the hand spot, a **heart bubble** (code-drawn heart) over the head holding the
  **likes** toy, and the **did** picture (a drawing or a letter) pinned on the wall behind.
- Tap a card to gray it.
- **Question builder** at the bottom: four tile rows, one tile lit per row, a preview of the
  sentence, **SEND**. Grayed (not live) tiles are dimmed.
- **Question counter** as big ❓ icons. **ACCUSE**: tap it, then a guest.

**Expert:** the notes in a box (≥ 24 px), the serial rule under them at B2, and the **answer
feed** as a chat log, newest at the bottom, question then answer in bold.

**Placeholder mode:** guests as 👦👧 with code name tags; props 👟🎤📖✏️🖌️; toys 🪁⚽🪀🪆;
❤️ bubble; did 🖼️ (drawing) or ✉️ (letter).

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

Name tags and the heart bubble are code. Guests are plain kids in party clothes, all the
same size and pose, with **empty hands** (the toy is placed by code in the hand spot). The toys
are shared with M10: generate them once.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-party` | — | A cheerful cartoon party room seen from the front: pale purple wall with colorful paper garlands and balloons along the top, wooden floor, a big empty space in the middle. {SCENE_STYLE} |
| `guest-boy-1` | 👦 | A full-body cartoon Taiwanese boy, about 10 years old, short black hair, wearing a green party shirt, standing, facing forward, empty open hands. {STYLE} |
| `guest-boy-2` | 👦 | A full-body cartoon Taiwanese boy, about 10 years old, short brown spiky hair and glasses, wearing an orange striped shirt, standing, facing forward, empty open hands. {STYLE} |
| `guest-boy-3` | 👦 | A full-body cartoon Taiwanese boy, about 10 years old, very short black hair, wearing a blue shirt with a bow tie, standing, facing forward, empty open hands. {STYLE} |
| `guest-boy-4` | 👦 | A full-body cartoon Taiwanese boy, about 10 years old, black hair with a red cap, wearing a yellow hoodie, standing, facing forward, empty open hands. {STYLE} |
| `guest-girl-1` | 👧 | A full-body cartoon Taiwanese girl, about 10 years old, long black hair, wearing a pink party dress, standing, facing forward, empty open hands. {STYLE} |
| `guest-girl-2` | 👧 | A full-body cartoon Taiwanese girl, about 10 years old, two short black ponytails, wearing a light-blue dress, standing, facing forward, empty open hands. {STYLE} |
| `guest-girl-3` | 👧 | A full-body cartoon Taiwanese girl, about 10 years old, short brown bob hair with a yellow hairband, wearing a purple shirt and skirt, standing, facing forward, empty open hands. {STYLE} |
| `guest-girl-4` | 👧 | A full-body cartoon Taiwanese girl, about 10 years old, long braided black hair, wearing a red and white dress, standing, facing forward, empty open hands. {STYLE} |
| `can-dance` | 👟 | A pair of shiny red dancing shoes with small sparkles. {STYLE} |
| `can-sing` | 🎤 | A silver microphone with small music notes around it. {STYLE} |
| `can-read` | 📖 | An open book with a small reading lamp glow, no writing on the pages. {STYLE} |
| `can-write` | ✏️ | A pen lying on a sheet of paper with wavy lines (no real letters). {STYLE} |
| `can-draw` | 🖌️ | A paintbrush with a drop of blue paint and a small drawing pad. {STYLE} |
| `did-drawing` | 🖼️ | A child's finished crayon drawing of a house and a sun, pinned to the wall with a red pin, slightly tilted. {STYLE} |
| `did-letter` | ✉️ | A handwritten letter on paper with wavy lines (no real letters) and an open envelope beside it. {STYLE} |
| `toy-kite` | 🪁 | **Shared with M10** (same prompt and file as `m10-gift-shop/toy-kite`). A colorful diamond-shaped kite with a ribbon tail. {STYLE} |
| `toy-ball` | ⚽ | **Shared with M10.** A red and white rubber play ball. {STYLE} |
| `toy-yo-yo` | 🪀 | **Shared with M10.** A bright blue yo-yo with its string. {STYLE} |
| `toy-doll` | 🪆 | **Shared with M10.** A soft cloth doll with yellow yarn hair and a green dress. {STYLE} |

## Tests

- **Grammar table:** every row-1 × row-3 × row-4 combination maps to the expected answer kind
  (good / not good / yes-or-no / wrong pronoun). *Does he can dance?* and *Can he have a kite?*
  are explicit cases.
- **Truth:** for every good question on every board, the answer matches the target's facts.
- **Invariants:** 1000 boards per tier, seeded, asserting solvability within the budget and
  the not-too-easy check.
- **Solver:** follow the minimax strategy, then accuse. Round won, 0 strikes.
- **Strikes:** a wrong accuse → 1 strike and 1 question. A rejected question uses a question
  but is never a strike.
- **Leak check:** the Defuser view never contains `feed`, notes or `target`; the Expert view
  never contains guests.
- **Words:** notes, answers and rules use list words, connectives, and the allow-list *ask,
  question, true, notes, note, serial, his, her, good, one, bomb*.
- **HTTP harness:** a scripted B1 run, and a B2 run with a false note.

## Acceptance

- Playable with placeholder emoji and code name tags.
- On an iPad, a guest's four facts are readable at card size, and the heart bubble clearly
  belongs to its guest.
- A pair can't win at B1 without the Expert reading answers aloud: the Defuser never sees them.

## Flags (decided, change if needed)

- 🚩 **A rejected question costs a question at every tier** (design doc open question). A2
  is protected differently: tiles it doesn't use are grayed out, so most bad questions can't be
  built.
- 🚩 **`play` and `Is` are decoy tiles.** *Does he play a ball?* isn't good English, so the
  bomb rejects it, and no fact is an *is* question. *Can he play?* is a good question, answered
  *Yes* for everyone, which wastes the question but is true.
- 🚩 A **wrong pronoun** gets *No. He is a boy.* instead of a rejection: the question is
  grammatical, and the true answer only gives away the pronoun.
- 🚩 ACCUSE stays available at 0 questions, so a team that runs out can still guess.
- 🚩 Guest facts are shown as **props in fixed spots on the card**, not drawn into each guest
  picture, so 8 guest pictures cover every combination.
