# Build Platform for M01–M12

Shared spec that every module build spec (`Mxx_build.md`) relies on. **Build this first.**
It's written against the code as it stands on 2026-10-28 (commit `bd83abf`). Re-check the
file references before implementing.

## Target

- **Devices:** Chromebooks and iPads, in a **web browser**. Touch and mouse must both work.
  Design for landscape first: 1024×768 (iPad) and 1366×768 (Chromebook).
- **Hosting:** the existing one-process server (`src/quiz_system/web_client_server.py`
  serves `webclient/` plus the API) on the user's PC now, and a classroom computer later. No
  new services, no build step, no external CDNs (classrooms may be offline). Plain HTML, CSS
  and JS files under `webclient/`.
- **Timing:** client-side timers are allowed (user decision). The server trusts reported
  times within sanity bounds.

## What already exists (verified)

| Piece | Where | Notes |
|---|---|---|
| Plugin contract | `src/quiz_system/game_plugins.py` | `BaseGameMod` with `on_session_start`, `on_answer`, `on_tick`, `get_student_screen`, `claim_student_screen`… |
| Per-player screen | `get_student_screen(player_id)` → `payload.overlay` in `GET /api/sessions/{id}/snapshots/students/{playerId}` | Already per-player, so Defuser and Expert never see each other's data |
| Answer path | `POST /api/sessions/{id}/game/submit/{playerId}` | Graded by the core **against fixed quiz items**. `on_answer` only receives `correct: bool`, never the raw answer |
| Ticks | `on_tick` | **Never called by the HTTP server.** Time-based logic must run when a request comes in (as `ScreenLeaseManager` already does) |
| Roles | player-id prefix `expert*` | `docs/contracts/screen-lease-v1.md` |
| Static files | `webclient/` | Served by `StaticAndApiApp` |
| Asset manifest | `docs/contracts/asset-manifest-v1.md` | `assetId`, `kind`, `path`, `placeholder`, `tags` |

## Gaps and the decisions taken

### P1. A way for modules to receive raw input *(core change, needs sign-off)*

The new modules generate a fresh board every round, so the right answer isn't a fixed quiz
item. They need the raw input ("touched eye 3", "walked through the red door").

**Add one route and one optional hook:**

```
POST /api/sessions/{sessionId}/game/action/{playerId}
{ "action": "touch", "data": { "target": "h1-eye2" }, "elapsedMs": 41250 }

→ 200 { "ok": true, "screen": <that player's overlay, freshly computed> }
```

- `http_api.py`: route the request (next to `game/submit`) to `GameSessionServer.handle_mod_action(player_id, action, data)`.
- `runtime.py`/`game_runtime.py`: forward it to `game_mod.on_player_action(player_id, action, data) -> list[GameAction]`, consume the returned actions as usual, log the action, and return `get_student_screen(player_id)`.
- **`on_player_action` is optional.** Look it up with `getattr`, and do **not** add it to `REQUIRED_GAME_MOD_METHODS`. The six existing mods are unaffected. If a mod doesn't have it, return `400`.
- Returning the fresh screen in the response means the acting player sees the result
  immediately. The partner sees it on their next poll (≤ 1.2 s), which is fine for these
  designs.

⚠ **Flag:** this breaks the "no core server changes" convention the bomb mods have followed
since IMA-37. It's the smallest change that makes generated puzzles possible. Get it
approved before building.

### P2. Many pairs in one session, and role swapping

A class is about 15 pairs in **one** session.

- **Player ids** are `p{team}-{seat}`, for example `p7-a` and `p7-b`. The `team` key groups a pair.
  - The legacy `defuser-1` / `expert-1` ids map to team `1`, seats `a`/`b`.
  - A team of 3 (odd class size) gets seat `c`. Each round has one Defuser and two Experts,
    who both see the Expert screen.
- **Roles live in the module, not in the id.** Each team's `Board` holds
  `roles: {player_id: "defuser" | "expert"}`.
  - Seat `a` starts as Defuser.
  - Roles **swap automatically every round**. In a pair, the Defuser and Expert trade places.
    In a team of 3, the Defuser seat rotates a → b → c. That's how every student does both
    jobs.
  - The screen shows a "YOU ARE THE DEFUSER / EXPERT NOW" banner for 3 s after each swap.
- One `Board` per team. Teams never affect each other. The big screen shows each team's status.
- The screen lease (`screen-lease-v1.md`) still applies per team and seat, so two devices
  can't share one seat.

⚠ **Flag:** the join flow (how a student gets told "you are `p7-a`") isn't specced here. For
now, the web client's join screen takes a team number and a seat letter. A QR or
teacher-console flow is future work.

### P3. Module packages and difficulty

Session creation requires a `quizPath`, but board modules don't use quiz items.

- Each module ships tier packages: `kwizzits/<module-id>-<tier>/quiz.kzt`. Each contains
  **one `slide` item** (the quiz schema needs at least one item), whose body is the
  teacher-facing description.
- **Parameters go in quiz tags:** `tier:A2`, `rounds:3`, `maxStrikes:3`, `seed:1234`
  (optional). The module reads them in `on_session_start(quiz, …)` from `quiz.tags`.
  Unknown tags are ignored.
- This keeps teachers in "data, not code" territory (IMA-42): a new difficulty is a new
  package with different tags.

### P4. Time

- The server uses `time.monotonic()` whenever an action or poll arrives. There is no tick.
- Animations and countdowns run on the client. The client sends `elapsedMs` (time since
  the round started on that device) with every action. The server accepts it if it's within
  ±3 s of its own clock, and otherwise uses its own.

### P5. Web client structure

`webclient/index.html` is currently written for Color Wires only.

⚠ **It has uncommitted local edits.** Merge with them, don't overwrite.

Add:

```
webclient/
  index.html               ← join screen (module, team, seat) + poll loop + dispatch
  board/
    kit.js                 ← shared UI: buttons, banner, strike lamps, timer bar, feedback toast
    kit.css
  modules/
    m11-monster-clinic.js  ← one renderer per module
    m01-family-photo.js
    …
  art/
    <module-id>/manifest.json   ← asset-manifest-v1
    <module-id>/*.png
```

Each renderer exports **one function**:

```js
export function render(root, screen, sendAction) { … }
// root:       an empty <div> the renderer owns
// screen:     the overlay from the server (shape below)
// sendAction: (action, data) => Promise<screen>  // POSTs to /game/action, returns the fresh screen
```

- The poll loop calls `render` on every poll and every action response. Renderers must be
  **idempotent** (they rebuild from `screen`) and keep only purely visual local state, like
  an animation in progress.
- Load renderers with `import()` by module id.

**UI rules (all modules):**
- Touch targets are at least **56 px**. Use pointer events (`pointerdown`), not mouse-only or touch-only events. No hover-dependent UI.
- No drag-and-drop on small targets. Prefer **tap a thing, then tap where it goes** (it works on every device).
- Expert screens use large readable text (≥ 20 px). **English text only, no icons that carry the answer** (see "English lock" in `../README.md`).
- Defuser buttons at A1–A2 show the English word under the picture. At B1+ they show the picture only.
- If an image is missing, render the manifest's `placeholder` (an emoji) at the same size. Modules must be fully playable **before any art exists**.

### P6. Standard screen shape

Every board module's `get_student_screen` returns:

```json
{
  "type": "board",
  "module": "m11-monster-clinic",
  "team": "7",
  "role": "defuser",
  "roleBanner": true,
  "round": 2, "rounds": 3,
  "strikes": 1, "maxStrikes": 3,
  "status": "active",
  "feedback": { "kind": "strike", "text": "Wrong part!" },
  "view": { "...module-specific, see each build spec...": true }
}
```

- `status` is one of `active`, `round-won`, `defused`, `exploded`, `waiting-for-partner`.
- `feedback` is shown once. The client hides it after 2 s, and the server clears it after one read by that player.
- `role-claim-pending` from the lease spec still overrides everything.
- **Strikes:** `maxStrikes` strikes means the bomb explodes. The team sees the result and the teacher can restart. Strikes are per team per module run.
- **Feedback text** uses list words plus approved game words (press, put, give, touch).

`get_bigscreen_state()` returns `{ "teams": [ { "team": "7", "round": 2, "strikes": 1, "status": "active" } ] }`.

### P7. Code layout per module

```
game_mods/<module-id>/
  gamemod.json
  main.py          ← plugin class: routing, teams, roles, rounds, strikes (thin)
  board.py         ← pure logic: generate(tier, rng) -> Board, apply(board, role, action, data) -> Result
  manual.py        ← builds the Expert's English text from a Board
```

- **Import note:** mods are loaded with `spec_from_file_location`, so `main.py` must import its siblings with `importlib` from its own folder path. Avoid `@dataclass` with forward references (see the comment in `bomb-defusal-multi-switch/main.py`). Use plain classes.
- `board.py` and `manual.py` must be importable from tests without the server.

**Shared code:** P2, P5 and P6 are the same for all twelve modules. Copy the team/role/round
plumbing from the first module built (M11) into each new mod, the same "copy per module" rule
the existing mods follow for `ScreenLeaseManager`. If three or more mods end up with
identical copies, propose a shared helper in core as a separate change.

### P8. Testing

1. **Unit tests** (`tests/test_<module>.py`):
   - Generate 1000 boards per tier with fixed seeds, and assert the generator's invariants (each build spec lists them).
   - Solve each board with a reference solver and assert it's solvable.
   - Assert every `manual.py` output uses only list words plus approved game words and allowed connectives. Use `docs/design/modules/vocab_260.tsv` plus an allow-list.
2. **HTTP harness:** extend the IMA-43 scripted play tester. One scripted pair plays a full module run, once winning and once with three strikes.
3. **Device smoke test:** one real iPad and one Chromebook, both roles, 3 rounds. Check tap targets, text size, and no horizontal scroll.

## Build order

1. P1 (core route, after sign-off), P2/P5/P6 plumbing, M11 end-to-end with placeholder emoji.
2. M01, M07.
3. The remaining modules, from their build specs.
4. Art, from `ART_GUIDE.md`. It can run in parallel from day one.
