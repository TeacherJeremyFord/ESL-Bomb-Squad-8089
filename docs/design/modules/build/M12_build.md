# M12 Animal Race Day: Build Spec

**Design doc:** [`../M12_animal_race_day.md`](../M12_animal_race_day.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m12-animal-race-day`

## Files

```
game_mods/m12-animal-race-day/{gamemod.json, main.py, board.py, manual.py}
kwizzits/m12-animal-race-day-{a1,a2,b1}/quiz.kzt   ← tags tier:A1|A2|B1 rounds:2 maxStrikes:3 speed:1.0 (optional)
webclient/modules/m12-animal-race-day.js
webclient/art/m12-animal-race-day/manifest.json
tests/test_m12_animal_race_day.py
```

**One round = three races** (the design's "race 1 of 3"). Roles swap between rounds, not
between races, so `rounds:2` by default (🚩).

## Board (`board.py`)

```python
ANIMALS = ["turtle", "dog", "cat", "monkey", "rabbit", "frog", "bird", "fish",
           "lion", "bear", "tiger", "pig", "cow", "horse"]
RACES = ["swim", "run", "jump", "jog", "fly", "walk"]

class Entry:  animal: str; other: str            # "tiger (other: monkey)"
class Pass:   animal: str; team: str | None; at_ms: int   # enters the gate at at_ms
class Race:
    race: str; team: str | None   # None when teams are off (A1)
    not_light: bool
    parade: list[Pass]
    start_ms: int

class Board:
    entries: dict[tuple[str, str | None], Entry]   # (race, team) → entry, new every round
    races: list[Race]              # 3 per round
    index: int                     # current race
    gate_ms: int                   # how long each animal is in the gate
```

**The right animal** for a race: `entries[(race, team)].animal`, or `.other` when the NOT
light is on. It must pass **on the right team**.

**Natural pairs** (never used as an entry, design: "real-world knowledge is a trap"):
fish/swim, bird/fly, frog/jump, rabbit/jump, horse/run, dog/run, turtle/walk, monkey/jump.

**Generation:**

1. **Entry list** (new each round): for each race and team, an animal and an "other" animal,
   all different within a team's column, none from the natural pairs.
2. **Races:** 3, different race words. Team at random (A2+). NOT light on ~40% of races at B1.
3. **Parade:** a list of passes, one every `gate_ms`, from the tier's animal pool:
   - the target (right animal, right team) appears **within the first 8 passes**, and again
     once, 4–8 passes later (it "comes back once");
   - B1: at least one **same animal on the other team** before the first target pass (the
     classic trap), and when the NOT light is on, the entry's first animal also passes (on the
     right team) before the target;
   - no animal passes twice in a row.

**Invariants:** the target appears exactly twice; the natural pairs never appear in the entry
list; the B1 decoy rules hold; every parade animal is in the tier's pool.

## Tiers

| Tier | Animals | Teams | NOT light | Gate time | Labels |
|---|---|---|---|---|---|
| A1 | 6 | off (one shirt) | no | 2.5 s | yes |
| A2 | 10 | on | no | 2.0 s | yes |
| B1 | 14 | on | yes | 1.5 s | no |

The `speed` tag multiplies every gate time (1.5 = slower): the teacher slider the design
says this module needs most.

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `go` | `{"elapsedMs": 41250}` | Find the pass in the gate at that time. It's the target → race won; after a 2 s cheer, the next race starts (or the round is won after race 3). Anything else (wrong animal, wrong team, empty gate) → **strike**, the race goes on. |

- **Let it pass twice:** on any request after the target's **second** pass has left the gate,
  it's a **strike** and the race restarts with a fresh parade (same race, team and light).
- Time is judged from `elapsedMs` (PLATFORM P4). A 200 ms grace at each end of a pass's gate
  window counts for that pass.

## Screens

**Defuser:**

```json
{ "race": "swim", "team": "farm", "notLight": false,
  "parade": [ {"animal": "dog", "team": "zoo", "atMs": 1500}, {"animal": "horse", "team": "farm", "atMs": 3000} ],
  "gateMs": 1500,
  "raceNo": 1, "races": 3,
  "labels": false }
```

- The whole parade is sent at race start, so the client can animate it smoothly; it doesn't
  say which pass is the target.
- `team` is `null` at A1.

**Expert:**

```json
{ "entries": { "cols": ["Zoo team", "Farm team"],
               "rows": [ {"race": "swim", "cells": ["tiger (other: monkey)", "horse (other: pig)"]}, "..." ] },
  "rules": [ "Ask: What is the race? What is the team?",
             "Find the animal. Tell the Defuser: \"The tiger! Zoo team!\"",
             "Press GO when that animal is in the gate.",
             "If the NOT light is on, the first animal can not race. Press GO for the other animal." ],
  "raceNo": 1, "races": 3 }
```

- A1 has one column and no "(other: …)" and no NOT rule. A2 has no NOT rule.
- The Expert never sees the race, team, light or parade.

## Renderer

**Defuser:**
- Top: the **event board**: the race's action picture, the **team flag** (ZOO or FARM, the flag
  emblem picture with the word drawn by code), and the **NOT light**, a big red lamp with a ✖
  drawn by code.
- Middle: the track (`bg-track`). Animals walk in from the left, stop in the **gate** (a
  code-drawn arch, center) for `gateMs`, and walk out right. Each animal wears a **team badge**
  drawn by code: a round badge in the team color with the team emblem, pinned at the
  animal's `badge` anchor from the manifest tags (`badge:x,y`). A1 has no badge.
- Bottom: a huge **GO** button (≥ 160 px) and `race 1 of 3`.
- `labels` (A1–A2): the animal's English word under it while it's in the gate, and the race word
  under the action picture.

**Expert:** the entry table as large text (≥ 24 px), rules underneath, `race 1 of 3`.

**Placeholder mode:** 🐢🐕🐈🐒🐇🐸🐦🐟🦁🐻🐯🐷🐄🐎; race pictures 🌊 swim, 💨 run, 🚧 jump,
🏃 jog, 🪽 fly, 👣 walk; flags 🦁 zoo and 🛖 farm.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

The team badge colors and the NOT light are code. **The action pictures are the riskiest art**
(design build note): make them first and check that walk, jog and run are told apart at a
glance. Animals are drawn walking to the right, side view, all at a similar size, with no
clothes (the team badge is pinned on by code). The fish walks in a small bowl on little legs
(design: "fish in a bowl"). Set each animal's `badge:x,y` tag to a point on its chest after
the picture is final.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-track` | — | A cartoon sports track on a sunny day, seen from the side: a red running track across the bottom, green grass, a low white fence, blue sky, and an empty space in the middle of the track. {SCENE_STYLE} |
| `race-swim` | 🌊 | A simple sports-event sign picture: blue water waves with splash drops. {STYLE} |
| `race-run` | 💨 | A simple sports-event sign picture: a stick figure sprinting very fast with long speed lines behind. {STYLE} |
| `race-jump` | 🚧 | A simple sports-event sign picture: a stick figure jumping high over a red and white hurdle. {STYLE} |
| `race-jog` | 🏃 | A simple sports-event sign picture: a relaxed stick figure jogging slowly, wearing a sweatband, with a calm smile and no speed lines. {STYLE} |
| `race-fly` | 🪽 | A simple sports-event sign picture: a pair of white feathered wings, spread. {STYLE} |
| `race-walk` | 👣 | A simple sports-event sign picture: a line of footprints walking. {STYLE} |
| `flag-zoo` | 🦁 | A small square flag on a pole with a lion's face on it, no writing. {STYLE} |
| `flag-farm` | 🛖 | A small square flag on a pole with a red barn on it, no writing. {STYLE} |
| `an-turtle` | 🐢 | A cartoon green turtle walking to the right, side view. {STYLE} |
| `an-dog` | 🐕 | A cartoon brown dog walking to the right, side view. {STYLE} |
| `an-cat` | 🐈 | A cartoon orange cat walking to the right, side view. {STYLE} |
| `an-monkey` | 🐒 | A cartoon brown monkey walking to the right on two legs, side view. {STYLE} |
| `an-rabbit` | 🐇 | A cartoon white rabbit walking to the right, side view, long ears. {STYLE} |
| `an-frog` | 🐸 | A cartoon green frog walking to the right on its back legs, side view. {STYLE} |
| `an-bird` | 🐦 | A cartoon small blue bird walking to the right on the ground, wings folded, side view. {STYLE} |
| `an-fish` | 🐟 | A cartoon orange fish inside a small round water bowl that has two little legs, walking to the right, side view. {STYLE} |
| `an-lion` | 🦁 | A cartoon lion with a big mane walking to the right, side view. {STYLE} |
| `an-bear` | 🐻 | A cartoon brown bear walking to the right on four legs, side view. {STYLE} |
| `an-tiger` | 🐯 | A cartoon orange tiger with black stripes walking to the right, side view. {STYLE} |
| `an-pig` | 🐷 | A cartoon pink pig walking to the right, side view. {STYLE} |
| `an-cow` | 🐄 | A cartoon black and white cow walking to the right, side view. {STYLE} |
| `an-horse` | 🐎 | A cartoon brown horse walking to the right, side view. {STYLE} |

## Tests

- **Invariants:** 1000 rounds per tier, seeded: the target appears exactly twice, within the
  first 8 passes; natural pairs never in the entry list; B1 decoys present.
- **Gate math:** the pass in the gate at a given `elapsedMs`, with grace, at every speed.
- **Solver:** press GO in the middle of the target's first pass, for each race. Round won, 0
  strikes.
- **Strikes:** GO on a same-animal wrong-team decoy; GO on the entry's first animal while the
  NOT light is on; GO with the gate empty; letting the target pass twice (strike on the next
  request, fresh parade).
- **Leak check:** the Expert view has no race/team/light/parade; the Defuser view has no
  entry list.
- **Words:** rules and entry list use list words, connectives, and the allow-list *race,
  team, gate, press, now, first, GO, ask, find, tell, light, on, other, the Defuser, can not*.
- **HTTP harness:** a scripted B1 round, and one where the target passes twice.

## Acceptance

- Playable with placeholder emoji.
- Walk, jog and run pictures are told apart instantly by students who haven't seen them before.
- At gate time 1.5 s on a Chromebook over Wi-Fi, a GO pressed while the target is visibly in
  the gate is never judged wrong.

## Flags (decided, change if needed)

- 🚩 **"can" stays in the NOT rule only** (design doc open question): *the first animal can
  not race*. A second "can" rule would add a lookup to the module that is meant to be the
  fastest.
- 🚩 One round is three races, and roles swap between rounds. Swapping every race (every
  ~10 s) would be chaos.
- 🚩 The design's "team shirts" are **code-drawn team badges**: the team color carries the
  answer (ART_GUIDE rule 1), and 14 animal shapes can't share one shirt picture.
- 🚩 Letting the target pass twice restarts that race with a new parade, so the team isn't
  left waiting.
