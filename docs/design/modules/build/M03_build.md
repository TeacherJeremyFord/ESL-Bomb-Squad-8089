# M03 Weather Wardrobe: Build Spec

**Design doc:** [`../M03_weather_wardrobe.md`](../M03_weather_wardrobe.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m03-weather-wardrobe`

## Files

```
game_mods/m03-weather-wardrobe/{gamemod.json, main.py, board.py, manual.py, outfits.py}
kwizzits/m03-weather-wardrobe-{a1,a2,a2plus,b1}/quiz.kzt   ← tags tier:A1|A2|B1 changes:0|1|2 rounds:3 maxStrikes:3
webclient/modules/m03-weather-wardrobe.js
webclient/art/m03-weather-wardrobe/manifest.json
tests/test_m03_weather_wardrobe.py
```

`a2plus` is the A2 tier with `changes:1`. `outfits.py` holds the season × weather table from
the design doc as data.

## Board (`board.py`)

```python
class Sky:
    day: bool
    season: str          # spring | summer | fall | winter
    weather: str         # sunny | cloudy | rainy | windy   (day only; night shows no weather)
    temp: str | None     # hot | warm | cool | cold, None when the thermometer is hidden
    stars: int           # 0–5, night only
    radio_may_rain: bool # B1 only

class Board:
    skies: list[Sky]     # the first sky plus one per change (1, 2 or 3 entries)
    stage: int           # index into skies
    closet: list[str]    # clothes shown this round
    worn: set[str]
    window_open: bool; fan_on: bool
    change_at_ms: int | None   # set after a correct DONE when another sky is waiting
```

**The answer** (`answer(sky, tier) -> (outfit set, window, fan)`), straight from the manual:

1. **Night:** stars > 3 → `{T-shirt, shorts}`; otherwise `{pants, socks, jacket}`. Fan off.
   **The window isn't checked at night** (🚩).
2. **Day:** outfit = `TABLE[season][weather]`.
3. **Window and fan (day, when the thermometer is shown):** hot → window open, fan on;
   warm → window open, fan off; cool / cold → both off. When the thermometer is hidden (A1),
   switches aren't checked.
4. **B1 radio:** `radio_may_rain` → add `jacket` (a set, so no duplicate).

**Generation:**

1. First sky: day only at A1–A2. A1 seasons are summer or winter, weather sunny or cloudy
   (so a 6-item closet can hold every answer, 🚩). B1: 30% night.
2. **Temperature** fits the season most of the time (summer hot/warm, winter cool/cold), but
   20% of A2+ skies pick a neighbor (a warm winter day) so players have to ask.
3. Each **change** keeps the season and changes one or two of: weather, temperature,
   day → night (B1 only, at most once), radio. Reroll until the answer is **different** from
   the previous stage's answer.
4. **Closet:** A1 shows the answer's clothes plus near-pair decoys up to 6 (shirt/T-shirt,
   jeans/pants, shorts/skirt, jacket/coat). A2+ shows all 11.

**Invariants (tests check all of them):**

- Every table cell, night outfit and radio extra is **wearable**: at most one of jeans / pants
  / shorts / skirt, and a dress has none of them.
- Each change makes the answer different.
- At A1 the closet contains the answer.
- Night skies have no weather overlay and no thermometer, so nothing contradicts the star rule.

## Tiers

| Tier | Day/night | Seasons / weather | Thermometer + switches | Radio | Closet | Changes |
|---|---|---|---|---|---|---|
| A1 | day | summer, winter / sunny, cloudy | no | no | 6 | 0 |
| A2 | day | all / all | yes | no | 11 | 0 |
| A2+ | day | all / all | yes | no | 11 | 1 |
| B1 | day and night | all / all | yes (day) | yes | 11 | 2, one may be day → night |

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `wear` | `{"item": "jeans"}` | Toggles the item on or off the mannequin. No strike, no check. |
| `switch` | `{"name": "window" \| "fan"}` | Toggles it. Hidden switches are rejected. |
| `done` | `{}` | Compares `worn`, window and fan with `answer(skies[stage])`. Match → if more skies remain, set `change_at_ms = now + rand(4–8 s)` and show a "good" chirp; otherwise the round is won. No match → **strike**; nothing is taken off. |

- `done` while `change_at_ms` is set and not reached yet → rejected, no strike (the bomb
  isn't asking yet).
- On any request after `change_at_ms`: `stage += 1`, clear `change_at_ms`, set `chirp`. The
  mannequin keeps what it wears, so swapping only what changed is fastest.

## Screens

**Defuser:**

```json
{ "sky": { "day": true, "weather": "cloudy", "stars": 0 },
  "season": "fall",
  "thermometer": "cool",
  "radio": "may-rain",
  "closet": ["jacket", "coat", "shirt", "T-shirt", "jeans", "dress", "shorts", "skirt", "pants", "shoes", "socks"],
  "worn": ["jacket", "pants"],
  "window": false, "fan": false,
  "switches": true,
  "chirp": false,
  "labels": true }
```

- `thermometer` is `null` at A1 and at night. `radio` is `null` below B1, otherwise
  `"silent"` or `"may-rain"`.
- The view never says what changed. `chirp` is true once after a change.

**Expert:**

```json
{ "steps": [ { "heading": "Step 1. Ask: Is it day or night?", "lines": ["At night, go to Step 4."] },
             { "heading": "Step 2. Ask: What season is it? What is the weather?", "table": { "rows": ["Spring", "..."], "cols": ["Sunny", "..."], "cells": [["shirt, skirt, shoes", "..."]] } },
             { "heading": "Step 3. Ask: Is it hot or cold?", "lines": ["..."] },
             { "heading": "Step 4. Night rules.", "lines": ["..."] },
             { "heading": "Step 5. The radio.", "lines": ["If the radio says it may be rainy, wear a jacket, too."] } ],
  "progress": "1 of 3",
  "chirp": true }
```

- `manual.py` copies the design doc's manual word for word, and leaves out the steps the tier
  doesn't use. At A1 the table shows only summer and winter rows and sunny and cloudy columns.
- `progress` counts correct DONEs ("1 of 3"), and `chirp` matches the Defuser's. The Expert
  learns *that* the sky changed, never *how*.

## Renderer

**Defuser:**
- **Window** (left half): a framed window showing the sky. Day: `sky-day` with the sun, plus
  the weather overlay (clouds, rain, blowing leaves). Night: `sky-night` with the moon and
  **stars drawn by code** (the count matters, ART_GUIDE rule 1). The season tree stands
  outside. The window frame shows `window-open` or `window-closed`.
- **Thermometer** beside the window: the face picture for the temperature.
- **Radio** on the sill (B1): silent, or with a code-drawn speech cloud holding a big "?".
- **Mannequin** (right half): worn clothes are drawn as their closet pictures pinned to body
  zones: outer (jacket, coat), top (shirt, T-shirt, dress), bottom (jeans, pants, shorts,
  skirt), feet (socks, shoes). Two outer pieces sit side by side.
- **Closet** strip along the bottom: 11 big tiles. Tapping toggles worn (tap, not drag,
  per PLATFORM P5). Worn tiles are dimmed.
- **Switches:** two big toggles, WINDOW and FAN, with a fan picture that spins (CSS) when on.
- **DONE** button, bottom right. A `chirp` plays a two-note sound and shakes the window.
- `labels`: English words under the closet tiles at A1–A2.

**Expert:** the steps as large text, the season × weather table as a real table (≥ 20 px),
`progress` in the corner, and a "The bomb is not happy. Ask again!" banner when `chirp` is set.

**Placeholder mode:** sky as a CSS gradient, ☀️🌙⭐ and ☁️🌧️🍃 overlays, 🌸🌳🍂☃️ trees,
🥵🙂😐🥶 thermometer faces, 📻, clothes 🧥🧥👔👕👖👗🩳🩱👖👟🧦 (coat 🧥 with a "long" badge, skirt 🩱),
mannequin 🧍.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

Stars are code-drawn. The skies are scene backgrounds without sun or moon; code places those.
The weather icons double as M05's weather chip.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-room` | — | A plain cozy cartoon bedroom wall seen from the front: soft light-green wall, wooden floor, an empty space on the left for a window and an empty space on the right for a person. {SCENE_STYLE} |
| `sky-day` | — | An empty clear blue daytime sky over a low green hill, no sun, no clouds. {SCENE_STYLE} |
| `sky-night` | — | An empty dark navy night sky over a low dark-green hill, no moon, no stars. {SCENE_STYLE} |
| `sun` | ☀️ | A round bright yellow cartoon sun with short rays. {STYLE} |
| `moon` | 🌙 | A pale yellow crescent moon. {STYLE} |
| `wx-cloudy` | ☁️ | Three fluffy gray-white cartoon clouds in a loose row. {STYLE} |
| `wx-rainy` | 🌧️ | A dark gray rain cloud with many blue raindrops falling. {STYLE} |
| `wx-windy` | 🍃 | Swirling white wind lines with a few green and orange leaves blowing sideways. {STYLE} |
| `tree-spring` | 🌸 | A round tree covered in pink flowers, with a few small green leaves. {STYLE} |
| `tree-summer` | 🌳 | A round tree full of thick bright green leaves. {STYLE} |
| `tree-fall` | 🍂 | A round tree with orange and brown leaves, a few leaves falling. {STYLE} |
| `tree-winter` | ☃️ | A bare tree with snow on its branches and a little snow on the ground. {STYLE} |
| `temp-hot` | 🥵 | A round cartoon face, red cheeks, sweating with big sweat drops, tongue out. {STYLE} |
| `temp-warm` | 🙂 | A round cartoon face with a calm happy smile, pink cheeks. {STYLE} |
| `temp-cool` | 😐 | A round cartoon face with a flat straight mouth, calm, neutral. {STYLE} |
| `temp-cold` | 🥶 | A round light-blue cartoon face shivering, teeth chattering, a little frost on top. {STYLE} |
| `radio` | 📻 | A small old-style red radio with a round speaker and an antenna. {STYLE} |
| `window-closed` | 🪟 | A wooden window frame with two closed glass panes; the glass is completely empty and see-through, no reflections. {STYLE} |
| `window-open` | 🪟 | **Edit `window-closed`:** "Swing both window panes open outward. Keep the frame the same." |
| `fan` | 🌀 | A small white electric desk fan seen from the front, round guard, light-blue blades. {STYLE} |
| `mannequin` | 🧍 | A friendly plain light-wood dress-form mannequin with a round head, arms down, standing on a stand, wearing nothing. {STYLE} |
| `cl-jacket` | 🧥 | A short red zip-up jacket, waist length. {STYLE} |
| `cl-coat` | 🧥 | A long brown winter coat down to the knees, with big buttons. {STYLE} |
| `cl-shirt` | 👔 | A light-blue long-sleeve button shirt with a collar. {STYLE} |
| `cl-t-shirt` | 👕 | A plain yellow short-sleeve T-shirt with no collar. {STYLE} |
| `cl-jeans` | 👖 | A pair of blue denim jeans with visible stitching and pockets. {STYLE} |
| `cl-pants` | 👖 | A pair of plain gray long pants, smooth cloth, no denim look. {STYLE} |
| `cl-shorts` | 🩳 | A pair of green short pants. {STYLE} |
| `cl-skirt` | 🩱 | A short pink pleated skirt. {STYLE} |
| `cl-dress` | 👗 | A purple dress with short sleeves, knee length. {STYLE} |
| `cl-shoes` | 👟 | A pair of white sneakers. {STYLE} |
| `cl-socks` | 🧦 | A pair of striped red and white socks. {STYLE} |

## Tests

- **Table:** every cell, night outfit and radio extra passes the wearable check.
- **Invariants:** 1000 rounds per tier, seeded, asserting every invariant above.
- **Solver:** for each round, toggle to `answer()` and press DONE per stage, faking the clock
  past `change_at_ms`. Round won, 0 strikes.
- **Strikes:** one missing item, one extra item, a wrong switch → 1 strike, worn unchanged.
  DONE before the change → rejected, no strike.
- **Leak check:** neither view says what changed; the Expert view has no sky data.
- **Words:** manual text uses list words, connectives, and the allow-list *put on, take off,
  open, close, radio, ask, go to, step, rules, count, see, more than, always, off, too*.
- **HTTP harness:** a scripted B1 run with two changes.

## Acceptance

- Playable with placeholder emoji.
- Shirt vs T-shirt, jeans vs pants, jacket vs coat, shorts vs skirt are distinguishable at
  closet-tile size on an iPad.
- After a change, swapping only the changed pieces works; nothing undresses on its own.

## Flags (decided, change if needed)

- 🚩 **"may" stays a single B1 rule** (design doc open question). A forecast stage would need
  *tomorrow*, which is off-list.
- 🚩 At night the window isn't checked, and the thermometer is hidden. The manual's night rules
  only talk about clothes and the fan, and a shown thermometer could contradict the star rule.
- 🚩 A1 limits weather to sunny and cloudy, so the 6-item closet always holds the answer.
- 🚩 The mannequin shows clothes as pinned pictures by body zone, not layered dressing. Real
  layered sprites are a later art upgrade.
- 🚩 Clothes are toggled by tapping, not dragged (PLATFORM P5).
