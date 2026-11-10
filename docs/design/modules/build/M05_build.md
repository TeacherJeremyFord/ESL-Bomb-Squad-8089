# M05 Ticket Machine: Build Spec

**Design doc:** [`../M05_ticket_machine.md`](../M05_ticket_machine.md)
**Depends on:** [`PLATFORM.md`](PLATFORM.md). Copy the team/round plumbing from M11.
**Module id:** `m05-ticket-machine`

## Files

```
game_mods/m05-ticket-machine/{gamemod.json, main.py, board.py, manual.py, citymap.py}
kwizzits/m05-ticket-machine-{a1,a2,b1,b2}/quiz.kzt   ← tags tier:A1|A2|B1|B2 rounds:3 maxStrikes:3
webclient/modules/m05-ticket-machine.js
webclient/art/m05-ticket-machine/manifest.json
tests/test_m05_ticket_machine.py
```

`citymap.py` is the map as data (places, box positions for the Expert's drawing, lines and
their ways). A teacher can swap in a real neighborhood (design build note).

## Map data (`citymap.py`)

The design doc's table, both directions:

| Line | Ways |
|---|---|
| home – school | bus, bike, on foot |
| home – bank | car, taxi |
| school – library | MRT |
| school – park | bus |
| library – bookstore | on foot |
| library – zoo | MRT |
| bank – park | MRT |
| park – zoo | bike, bus |
| zoo – farm | bus, taxi |
| farm – lake | boat |
| farm – sea | train |
| sea – the island *(B2)* | ship, plane |

`FAST = {"MRT", "train"}`. Rainy removes `bike` and `on foot`. Windy (B2) removes `ship`.

## Board (`board.py`)

```python
class Board:
    origin: str; dest: str
    closed: set[str]            # ways closed today
    weather: str | None         # None | "sunny" | "rainy" | "windy"
    route: list[str]            # the one right path of places, origin → dest
    legs: list[tuple[str, str]] # printed so far: (way, stop)
    at: str                     # current place (end of the last printed leg)
    late_close: tuple[int, str] | None   # B2: (after leg k, way) closes mid-ticket
```

**Open graph:** the map minus closed ways and weather-banned ways. A line with no open way
is gone.

**The right route** (`best_route(at, dest)`), from the manual:

1. Fewest legs (BFS on the open graph).
2. Among those, the most legs that can go by MRT or train.
3. If two routes still tie, the board is rejected (the generator rerolls).

**Generation:**

1. Pick origin and dest (dest is `the island` on B2 far-trip rounds, 1 in 3 of B2 rounds).
2. Pick 0 (A1), 1 (A2) or 2 (B1–B2) closed ways, at least one of which touches the
   shortest route on the full map (so the closure matters).
3. Weather: none at A1–A2. B1: sunny or rainy. B2: sunny, rainy or windy.
4. B2 non-far rounds: 50% get a `late_close`: after leg 1, one way on the rest of the
   route closes.
5. Reroll until every invariant holds.

**Invariants (tests check all of them):**

- `best_route` exists and is unique (rules 1–2 decide it).
- Its length is within the tier's leg range: A1 exactly 1, A2 exactly 2, B1 2–3, B2 2–4.
- At least one closure or the weather **changes** the route compared with the full map, at
  A2+ (re-planning out loud is the point).
- With `late_close`, a unique best route still exists from the place where it happens.

## Tiers

| Tier | Legs | Closures | Weather | Far trip | Mid-ticket closure |
|---|---|---|---|---|---|
| A1 | 1 | 0 | no | no | no |
| A2 | 2 | 1 | no | no | no |
| B1 | 2–3 | 2 | sunny / rainy | no | no |
| B2 | 2–4 | 2 | + windy | 1 in 3 rounds | 50% of other rounds |

## Actions (Defuser only)

| Action | Data | Result |
|---|---|---|
| `leg` | `{"way": "MRT", "stop": "park"}` | `stop` is the next place on `best_route(at, dest)`, and `way` is an open way on that line → print the leg, `at = stop`. Reaching `dest` wins the round. Otherwise **strike**; nothing prints. |

- Any open way on the right line is accepted (home → school by bus, bike or on foot all print).
  The manual only ranks *routes*, not ways on one line.
- After a printed leg, if `late_close` fires, the way closes, the closed board updates, and
  `best_route` is recomputed from `at`. The bomb beeps; it doesn't say what closed.

## Screens

**Defuser:**

```json
{ "from": "bank", "to": "zoo",
  "ways": ["car", "bike", "bus", "train", "taxi", "on foot", "MRT", "plane", "ship", "boat"],
  "stops": ["home", "school", "bank", "library", "zoo", "farm", "bookstore", "park", "lake", "sea"],
  "closed": ["taxi"],
  "weather": "rainy",
  "legs": [ {"way": "MRT", "stop": "park"} ],
  "beep": false,
  "labels": true }
```

`stops` adds `the island` on B2. The view never includes the map or the route.

**Expert:**

```json
{ "map": { "boxes": [ {"place": "home", "x": 0, "y": 1}, "..." ],
           "lines": [ {"a": "home", "b": "school"}, "..." ] },
  "lineTable": [ ["home – school", "bus, bike, on foot"], "..." ],
  "rules": [ "Ask: Where do you go from? Where do you go to?", "Find the way on the map. Use the way with the fewest stops.", "..." ],
  "farTrip": null,
  "legsPrinted": 1 }
```

- `rules` are the design doc's six rules word for word. Rule 5 (rainy) appears from B1.
- `farTrip` (B2 only) holds the two Taiwan-page lines.
- `legsPrinted` lets the Expert follow along without seeing which legs.

## Renderer

**Defuser:**
- Top: the machine's **FROM** and **TO** lights, each a lit window with a place picture.
- Middle: **10 way buttons** in two rows, then the **stop buttons** (the place pictures).
  Tap a way (it stays lit), then a stop → `sendAction("leg", …)`.
- Left: the **closed board**, the closed ways' pictures with a big red X drawn by code.
  Below it the **weather chip** (the M03 weather icon).
- Right: the **ticket printer**, a paper strip that grows one line per leg (way picture → stop
  picture).
- `labels` (A1–A2): English words under ways and stops.

**Expert:** the map drawn by code, **boxes with English words only** and plain lines between
them (no pictures, per the English lock). The line table and the rules underneath, ≥ 20 px.

**Placeholder mode:** 🚗🚲🚌🚆🚕👣🚇✈️🚢⛵ for ways; 🏠🏫🏦📚🦁🐄📕🌳🏞️🌊🏝️ for places;
weather ☀️🌧️🍃.

## Art (Gemini, see [`ART_GUIDE.md`](ART_GUIDE.md))

The red X, the lights' frames, the printer and the whole Expert map are code. The weather chip
reuses M03's `sun`, `wx-rainy` and `wx-windy`. Each place picture must say its place without a
sign or writing: the bank is a building with a big gold coin, the bookstore shows books in the
window, the library shows tall shelves.

| assetId | Placeholder | Prompt |
|---|---|---|
| `bg-station` | — | A cartoon train-station wall seen from the front: light gray tiles, a blue stripe, a big empty space in the middle for a ticket machine. {SCENE_STYLE} |
| `way-car` | 🚗 | A small red family car seen from the side. {STYLE} |
| `way-bike` | 🚲 | A green bicycle seen from the side. {STYLE} |
| `way-bus` | 🚌 | A blue city bus seen from the side. {STYLE} |
| `way-train` | 🚆 | A long-distance train engine with two cars, seen from the side, red and white. {STYLE} |
| `way-taxi` | 🚕 | A yellow taxi seen from the side with a taxi light on the roof (no writing). {STYLE} |
| `way-on-foot` | 👣 | Two bare footprints walking, dark gray. {STYLE} |
| `way-mrt` | 🚇 | A modern city metro train (MRT) with rounded front, white with a blue stripe, coming out of a tunnel. {STYLE} |
| `way-plane` | ✈️ | A white passenger plane flying, seen from the side. {STYLE} |
| `way-ship` | 🚢 | A big white passenger ship with two decks on blue water. {STYLE} |
| `way-boat` | ⛵ | A small wooden rowboat with two oars on blue water. {STYLE} |
| `pl-home` | 🏠 | A small house with a red roof, a door and two windows. {STYLE} |
| `pl-school` | 🏫 | A Taiwanese elementary school building with a flagpole and a big clock face with no numbers. {STYLE} |
| `pl-bank` | 🏦 | A bank building with columns at the front and a big gold coin on the roof (no writing). {STYLE} |
| `pl-library` | 📚 | A library building with large windows showing tall bookshelves full of books inside. {STYLE} |
| `pl-zoo` | 🦁 | A zoo gate with a lion's head on top and a giraffe looking over the fence. {STYLE} |
| `pl-farm` | 🐄 | A red barn with a cow standing beside it and green fields. {STYLE} |
| `pl-bookstore` | 📕 | A small shop with a striped awning and a front window with books standing on display. {STYLE} |
| `pl-park` | 🌳 | A small park with green trees, a bench and a path. {STYLE} |
| `pl-lake` | 🏞️ | A calm blue lake surrounded by green hills and trees. {STYLE} |
| `pl-sea` | 🌊 | A sandy beach with blue sea waves and a small pier. {STYLE} |
| `pl-island` | 🏝️ | A small green island with palm trees in the middle of the sea. {STYLE} |

## Tests

- **Route rules:** table tests for `best_route` (fewest legs; MRT/train tie-break; rainy drops
  bike and on foot; windy drops ship).
- **Invariants:** 1000 boards per tier, seeded, asserting every invariant above.
- **Solver:** print `best_route` leg by leg (recomputing after a late close). Round won, 0
  strikes.
- **Strikes:** a stop off the route, a closed way, a weather-banned way → 1 strike, nothing
  printed.
- **Leak check:** the Defuser view has no map or route; the Expert view has no from/to, closed
  ways or weather.
- **Words:** rules and map use list words, connectives, and the allow-list *ticket, map,
  press, then, island, closed, ask, find, use, fewest, stops, same, first, fast, tell, the
  way, line, weather, windy, can not*.
- **HTTP harness:** a scripted B1 run, and a B2 run with a late closure.

## Acceptance

- Playable with placeholder emoji.
- Every place picture is recognizable at 96 px without writing (bank vs library vs bookstore
  is the risk; check with students).
- A pair can't print a ticket at A2+ without the Defuser reading the closed board aloud.

## Flags (decided, change if needed)

- 🚩 **"the island" stays** (design doc open question). It's one off-list word, used only on
  B2 far trips, and the picture carries it. **"airport" is dropped**: no map line uses it.
- 🚩 Far trips start at a city place and end at `the island`; the sea – island line is the last
  leg. On a non-windy day **plane and ship are both accepted**, since the Taiwan page allows
  either.
- 🚩 Each leg is checked when it's entered, so a wrong leg never prints. That makes the
  design's **X (undo) button unnecessary**, and it's dropped.
- 🚩 Any open way on the right line is accepted. The manual's tie-break only picks between
  routes.
