# M10 Gift Shop: Build Spec

**Design doc:** [`../M10_gift_shop.md`](../M10_gift_shop.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m10-gift-shop`

## Files

```
game_mods/m10-gift-shop/{gamemod.json, main.py, board.py, manual.py, guide.py}
kwizzits/m10-gift-shop-{a1,a2,b1}/quiz.kzt     ← tags tier:A1|A2|B1 rounds:3 maxStrikes:3
webclient/modules/m10-gift-shop.js
webclient/art/m10-gift-shop/manifest.json
tests/test_m10_gift_shop.py
```

`guide.py` holds the recipients and their guide lines as data (teacher-editable, design build
note), with each line's text *and* its machine form.

## Gift guide (`guide.py`)

Each recipient's guide line is a **recipe**: a list of parts, each part a choice of items and
a quantity range.

| Recipient | Tiers | Text (Expert) | Recipe |
|---|---|---|---|
| grandmother | A1 | For grandmother: a flower and a heart card. | flower ×1; heart card ×1 |
| grandmother | A2–B1 | For grandmother: flowers (one, two or three) and a heart card. Put it in a box or a bag. | flower ×1–3; heart card ×1; (box \| bag) ×1 |
| sister | A2–B1 | For my sister: she wants a doll or a kite. Put it in a bag. | (doll \| kite) ×1; bag ×1 |
| teacher | all | For the teacher: the THANK YOU card, and one more thing. No box, no bag. | thank-you card ×1; (yo-yo \| doll \| kite \| ball \| flower) ×1 |
| father | B1 | For my father: balls, as many as you want, and a star card. | ball ×1–12; star card ×1 |
| friend | B1 | For my friend: a yo-yo, and a box or a bag. | yo-yo ×1; (box \| bag) ×1 |

- At B1, "kite" means either kite (big or small), as the design says.
- The design's Defuser view mentions *brother*, but the guide has no brother line, so there's
  no brother recipient (🚩).

## Board (`board.py`)

```python
class Board:
    recipient: str
    wallet: int                    # 3–12 (A1 ≤ 6)
    prices: dict[str, int]         # item id → price; ids: yo-yo doll kite kite-big kite-small ball flower
                                   #   card-heart card-star card-thanks box bag
    basket: dict[str, int]         # item id → count
    answer: dict[str, int]         # the one combination
```

**Generation** (design build note):

1. Pick the recipient for the tier.
2. Pick prices: A1 1–5 (single digit), A2–B1 1–9. At B1, two kites with **different** prices.
3. **Enumerate every combination** the recipe allows, sum each one.
4. Pick a wallet (3–12, A1 3–6) that **exactly one** combination hits. If no wallet works,
   reroll prices.
5. **After a wrong PAY**, reshuffle prices and repeat 3–4 with the **same wallet and
   recipient** (design: the shelf reshuffles, so trying every combination doesn't work).

**Invariants:**

- Exactly one combination equals the wallet.
- Every price and the wallet are 1–12, so each is a list number word.
- A1: the answer uses one of each part. B1: the answer uses a quantity > 1 in at least half of
  the rounds (two-step combinations, design scaling).

## Tiers

| Tier | Recipients | Parts | Quantities | Wallet | Prices | Same-type twins |
|---|---|---|---|---|---|---|
| A1 | grandmother, teacher | 2 | 1 | ≤ 6 | 1–5 | no |
| A2 | grandmother, sister, teacher | 2–3 | 1–3 flowers | ≤ 12 | 1–9 | no |
| B1 | + father, friend | 2–3 | unlimited balls | ≤ 12 | 1–9 | big and small kite |

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `add` | `{"item": "flower"}` | `basket[item] += 1` (max 12). No check. |
| `remove` | `{"item": "flower"}` | `basket[item] -= 1`. |
| `pay` | `{}` | `basket == answer` → round won. Otherwise **strike**, the basket empties, and prices reshuffle. |

PAY checks the exact basket, not just the total: a different combination that happens to
sum to the wallet can't exist (invariant), and paying the right total with items not in the
guide is wrong.

## Screens

**Defuser:**

```json
{ "for": "grandmother",
  "shelf": [ {"item": "flower", "price": "two dollars"}, {"item": "kite-big", "price": "seven dollars"} ],
  "cards": [ {"item": "card-heart", "price": "one dollar"}, {"item": "card-thanks", "price": "three dollars"} ],
  "wrap": [ {"item": "box", "price": "three dollars"}, {"item": "bag", "price": "two dollars"} ],
  "basket": {"flower": 3, "card-heart": 1},
  "labels": true }
```

Prices are **English words** (`one dollar`, `seven dollars`), never digits (English lock).
The view never includes the wallet, guide or answer.

**Expert:**

```json
{ "wallet": "The bomb has nine dollars.",
  "guide": [ "For grandmother: flowers (one, two or three) and a heart card. Put it in a box or a bag.", "..." ],
  "rules": [ "Spend all the money. Not more, not less.", "There is only one good gift. Find it!" ] }
```

`guide` lists every recipient of the tier (so the Expert has to ask who it's for). The
Expert never sees prices.

## Renderer

**Defuser:**
- Top left: the **wish bubble**, a thought cloud holding the recipient's picture (reused from
  M01: grandmother `oldwoman-1`, sister `girl-1`, teacher `woman-1`, father `man-1`, friend
  `boy-2`).
- Center: the **shelf** with the five toys/flower, each with a code-drawn **price tag** in
  words (≥ 20 px). At B1 the big kite is drawn at 1.0 scale and the small kite at 0.6.
- Right: the **card rack** (heart, star, THANK YOU: the THANK YOU words are code-drawn on the
  card) and the **wrap station** (box, bag).
- Tap an item to add one. The **basket** shows each item with a digit count badge (the
  Defuser's own check, design English lock); tap a basket item to remove one.
- **PAY** button. A wrong PAY plays a "no" sound and the tags flip to new prices.
- `labels` (A1–A2): the item's English word under each picture (the price tag is words already).

**Expert:** the wallet line big at the top (≥ 32 px), the gift guide lines, the rules. No
scratch pad (🚩).

**Placeholder mode:** 🪀🪆🪁⚽🌸, cards 💌⭐🙏, 🎁 box, 🛍️ bag, wish bubble 💭 + the M01
placeholder emoji.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

Price tags and the THANK YOU words are code. The recipients reuse M01's family sprites.
The toys are shared with M08 (generate once). The flower is one stem, because quantities are
shown by adding more.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-shop` | — | A cheerful cartoon gift shop seen from the front: warm pink wall, two empty wooden shelves on the left, an empty counter on the right, a big empty space in the middle. {SCENE_STYLE} |
| `toy-kite` | 🪁 | A colorful diamond-shaped kite with a ribbon tail. {STYLE} |
| `toy-ball` | ⚽ | A red and white rubber play ball. {STYLE} |
| `toy-yo-yo` | 🪀 | A bright blue yo-yo with its string. {STYLE} |
| `toy-doll` | 🪆 | A soft cloth doll with yellow yarn hair and a green dress. {STYLE} |
| `flower` | 🌸 | One red flower with a long green stem and two leaves. {STYLE} |
| `card-heart` | 💌 | A folded greeting card standing up, white, with a big red heart on the front, no writing. {STYLE} |
| `card-star` | ⭐ | A folded greeting card standing up, white, with a big yellow star on the front, no writing. {STYLE} |
| `card-thanks` | 🙏 | A folded greeting card standing up, light green, with small flowers in the corners and a big empty white space in the middle of the front, no writing. {STYLE} |
| `gift-box` | 🎁 | A square gift box wrapped in blue paper with a red ribbon and bow. {STYLE} |
| `gift-bag` | 🛍️ | A pink paper gift bag with rope handles and tissue paper on top. {STYLE} |
| `basket` | 🧺 | An empty woven shopping basket with a handle. {STYLE} |

## Tests

- **Enumeration:** for each recipe, the combination count and the sums on a fixed price set.
- **Invariants:** 1000 boards per tier, seeded, including after 3 reshuffles each.
- **Solver:** add the answer, PAY. Round won, 0 strikes.
- **Strikes:** a wrong basket → 1 strike, empty basket, new prices, same wallet; the new board
  still has exactly one answer.
- **English lock:** no digit appears in any price or wallet string in either view.
- **Words:** guide, wallet and rules use list words, connectives, number words, and the
  allow-list *buy, pay, price, coin, more, put, spend, all, money, less, only, good, find,
  as many as, my, it, no*.
- **HTTP harness:** a scripted B1 run, and one wrong PAY.

## Acceptance

- Playable with placeholder emoji.
- Every price reads as words on both devices; nothing on either screen is a digit except the
  basket badges.
- The big and small kite are clearly different sizes on the shelf.

## Flags (decided, change if needed)

- 🚩 **No scratch pad** for the Expert (design doc open question): saying the running total
  aloud is the exercise. A1's small numbers keep it manageable.
- 🚩 **400-list tier** (bigger prices) is out of scope here; it can be a new package later.
- 🚩 **No brother recipient**: the design lists brother in the wish bubble, but the gift guide
  has no brother line.
- 🚩 PAY checks the exact basket, not only the total.
