# Defuse to Learn
### A Cooperative ESL Bomb-Defusal Game — Game Design Document
Version 0.1 (Draft) — July 11, 2026

---

## 1. Vision Statement

Defuse to Learn is a two-player (expandable to small-group), cooperative, real-time party game built for ESL classrooms. It borrows its central mechanic wholesale from *Keep Talking and Nobody Explodes*: one player (the **Defuser**) sits in front of a 3D bomb they cannot fully understand, and one or more other players (the **Expert(s)**) hold a manual that explains how to defuse each module — but only the Defuser can see the bomb, and only the Expert can see the manual. The two must communicate entirely in spoken English to survive.

What makes this a *teaching* tool rather than just a re-skin is that every module is authored against a declared, finite vocabulary list tagged to CEFR levels A0–A2, and a module's difficulty is not arbitrary — it is a direct function of how much vocabulary it demands and how much of that vocabulary it shares with other modules already in play. A module that only needs color words is easy. A module that needs color words *and* body-part words *and* number words, layered together, is hard — exactly the way KTANE's "Simple Wires" gives way to "Complicated Wires" and eventually modules that require knowledge from three other modules at once.

The game must be trivially extensible by non-programmers (teachers), run in a browser on almost anything (iPad, Chromebook, Android tablet, PC), tolerate missing or broken content without crashing, work with zero network connection when needed, and produce reports a teacher can actually use to see who struggled with what.

---

## 2. Pedagogical Foundation

**Target learners:** CEFR A0 (pre-A1 / true beginner) through A2 (elementary). A0 students may not reliably read; some modules must be playable through color, shape, and icon recognition alone, with vocabulary reinforcement happening verbally between players rather than through reading.

**Core teaching mechanism:** forced, purposeful, time-pressured spoken output. The Defuser must describe what they see; the Expert must ask clarifying questions and give instructions. This is a task-based language learning design — the "task" (defuse the bomb) is the excuse; the actual product is negotiated meaning in English under mild stress, which is one of the more effective conditions for language acquisition (comprehensible input plus pushed output).

**Difficulty = vocabulary load, not puzzle complexity.** This is the design's central conceit and needs to be a first-class, explicit, computed property of every module — not a vibe the module author guesses at. See Section 4.

**Voice, not text chat, is the communication channel.** The game does not need to transmit language between players — it assumes they are speaking to each other, either in person or over a call the game does not manage. This actually simplifies the networking requirements considerably (see Section 8) and is the reason a "no live connection, just matching versions" mode is not only acceptable but often the *default* classroom mode.

---

## 3. Core Gameplay Loop

The loop is a direct descendant of KTANE and should not be reinvented:

1. **Session setup.** A teacher or the Expert configures the bomb: mission time (or no timer), strike limit, module pool, difficulty ceiling, language of UI. A **Session Sync Code** is generated (Section 7) and displayed on the bomb screen.
2. **Manual check.** The Expert opens the digital manual (or is handed a printed one) and confirms its Sync Code matches the bomb's. If it doesn't, a reconciliation flow runs (Section 7.3).
3. **Defusal phase.** The Defuser looks at the 3D bomb, describes what they see, and the Expert reads the relevant module page and gives instructions. Solving a module disarms it. Failing a module step triggers a **strike**. Strikes accumulate toward a limit; hitting the limit detonates the bomb. A visible timer counts down (optional, see 6.3).
4. **Needy modules** (optional, toggleable) periodically demand attention independent of the main modules — e.g., a recurring "listen and repeat" or "answer the question" widget that must be addressed within a short window or it also contributes a strike. These are ideal for reinforcing high-frequency vocabulary through repetition.
5. **End state.** All modules defused (win), timer expires (loss), or strike limit reached (loss). A results/report screen follows immediately, before any report is filed (Section 10).

Everything downstream of this loop — module content, vocabulary, difficulty, manual pagination — is what this document spends most of its time on, because that's the part that doesn't exist in KTANE and has to be designed from scratch.

---

## 4. The Vocabulary-Driven Difficulty System

### 4.1 Vocabulary Sets

All game vocabulary lives in a shared, versioned **Master Vocabulary Taxonomy** — a flat registry of vocabulary *sets* (not individual words in isolation), each with a stable ID, a CEFR tag, and its member terms. Examples:

| Set ID | CEFR | Example terms |
|---|---|---|
| `colors.basic` | A0 | red, blue, yellow, green, orange, purple, black, white |
| `numbers.1-10` | A0 | one, two, three... ten |
| `body.face` | A1 | hair, eyes, nose, mouth, ears, chin |
| `body.face.color-desc` | A1 | (uses `colors.basic` + `body.face` together) |
| `family` | A1 | mother, father, sister, brother, grandmother |
| `clothing.basic` | A1 | shirt, pants, shoes, hat, jacket |
| `directions.spatial` | A2 | left, right, up, down, next to, between |
| `time.clock` | A2 | o'clock, half past, quarter to |
| `shapes.basic` | A0 | circle, square, triangle, star |

A module's manifest declares which vocabulary set(s) it draws from. The taxonomy is itself just a versioned, shared content module (Section 5.6) so it can be extended without touching engine code, and every module manifest references sets by ID and version rather than embedding word lists — this is what lets the difficulty engine reason about *reuse* across modules authored independently by different teachers.

### 4.2 Difficulty Score

A module's computed difficulty score is:

```
difficulty = base_cefr_weight(highest CEFR set used)
           + vocab_breadth_weight(number of distinct vocab sets used)
           + reuse_bonus(sets shared with other currently-enabled modules)
           + interaction_complexity(author-declared: simple/sequential/conditional)
```

- `base_cefr_weight`: A0 = 1, A1 = 2, A2 = 3.
- `vocab_breadth_weight`: +1 per distinct vocabulary set the module actively requires (a module using only `colors.basic` scores lower than one using `colors.basic` + `body.face`).
- `reuse_bonus`: +0.5 for each *other enabled module* that shares one or more of this module's vocab sets. This is the mechanic the user specifically asked for — a module becomes harder in context because the player now has to distinguish it from something vocabulary-adjacent they already learned, not because the puzzle logic changed.
- `interaction_complexity`: a small author-set multiplier (1.0 simple one-shot / 1.25 multi-step / 1.5 conditional-on-other-modules) for cases where two modules with identical vocabulary still differ in mechanical difficulty (e.g., "point at the correct color" vs. "cut the wire whose color was mentioned earlier and doesn't repeat").

The engine buckets the resulting score into **Difficulty Tier 1–5**, which is what teachers actually see and filter on in the configuration menu (Section 6). The raw formula and its weights should live in a single config file so it can be tuned after playtesting without a code change.

### 4.3 Worked Examples (also the launch content set)

**Tier 1 — "Rainbow Wires."** Six wires, each a solid color from `colors.basic`. The manual gives a one-line rule ("If there are two red wires, cut the second one; otherwise cut the blue wire"). One vocab set, no reuse, simple interaction. This is the direct analogue of KTANE's Simple Wires and should be the very first module every new class sees.

**Tier 2 — "Describe the Suspect."** A face appears on the bomb; the Defuser must describe hair color, eye color, and one facial feature aloud, and the Expert looks up the matching entry in a small table to find the correct button to press. Vocab sets: `colors.basic` + `body.face`. Because `colors.basic` is shared with Rainbow Wires, this module gets a reuse bonus even though, taken alone, it isn't mechanically harder than Tier 1 — which is exactly the point: the player is now required to combine two vocabularies they've each seen separately.

**Tier 4 — "Simon Says, Numbered."** A needy-style module: a sequence of colored, numbered buttons flashes and must be repeated back in the order the Expert calculates from a rule involving both color and number. Vocab sets: `colors.basic` + `numbers.1-10` + `directions.spatial` (first/last/middle). Three sets, one of them (`colors.basic`) shared with two other currently-enabled modules, interaction complexity "conditional." This lands solidly in Tier 4 and should only be enabled once a class has had separate practice with all three component sets.

These three examples should be the actual bundled starter content, both because they prove the design and because they give module authors a concrete template to copy.

### 4.4 Session Curriculum Presets

Because difficulty is now a computed, comparable number, the configuration menu can offer teachers **presets** rather than requiring them to hand-pick modules: "Week 1: Colors only (Tier 1)," "Week 4: Colors + Family (Tier 1–2)," "Review: everything up to A1." A preset is just a saved filter (max tier, allowed vocab sets, allowed CEFR ceiling) plus a target module count. This is a low-cost, high-value addition and should be in the MVP.

---

## 5. Module Architecture ("Drop and Go")

This is the section that most needs to survive contact with a non-programmer teacher unzipping a folder, so it gets the most detail.

### 5.1 The tension, stated plainly

Godot (the recommended engine, see Section 12) normally ships content *compiled into* an exported build. That's the opposite of "drop a folder in and it works." The design below resolves this by splitting modules into two tiers so the vast majority of classroom content never requires compiling anything.

### 5.2 Tier A — Data-Driven Modules (the default, no-code path)

Most vocabulary modules don't need custom game logic — they need one of a handful of proven interaction *templates* (a wire panel, a keypad, a matching-pairs grid, a multiple-choice picture board, a dial, a sequence-repeat panel, a "point at the right label" board) driven entirely by data. The game engine ships with these templates built in. A Tier A module is nothing but:

```
/modules/face-description-a1/
    manifest.json
    module.log            (created by the game, empty until an error occurs)
    /content/
        instructions_en.md
        rules_table.json
        /images/
            hair_blonde.png
            eyes_blue.png
            ...
        /audio/
            hair.mp3
            eyes.mp3
```

`manifest.json` (schema, abbreviated):

```json
{
  "module_id": "face-description-a1",
  "manifest_version": 1,
  "display_name": "Describe the Suspect",
  "module_code": "FD",
  "content_version": "1.0.0",
  "min_game_version": "1.0.0",
  "template": "matching-table",
  "vocab_sets": ["colors.basic@1", "body.face@1"],
  "cefr_ceiling": "A1",
  "interaction_complexity": "simple",
  "is_needy": false,
  "time_estimate_seconds": 90,
  "assets": { "instructions": "content/instructions_en.md", "rules": "content/rules_table.json" }
}
```

Because `template: "matching-table"` refers to a built-in engine template, the game never executes any code shipped inside the module folder — it only ever reads data. That single decision is what makes "unzip and it just works, safely, every time" achievable, and it also closes off almost the entire malicious-content/crash surface described in Section 5.4. A teacher, or a curriculum team producing content for teachers, needs nothing but a text editor and a folder of images to build a Tier A module.

### 5.3 Tier B — Code Modules (advanced/developer path)

For a module whose mechanic genuinely can't be expressed by a template (custom animation, novel input pattern, a wire-cutting simulation with physical routing, etc.), the game supports **Godot PCK modules**: a module folder containing the same `manifest.json` (with `"template": "custom"` and a `"pck": "module.pck"` field) plus a `.pck` resource pack built from a provided **Module SDK** (a companion Godot project template with a documented scene/script interface: `ModuleBase` with `on_mount()`, `on_strike()`, `on_solve()`, `get_vocab_sets()`, etc.). The main game loads the pack at runtime with Godot's `ProjectSettings.load_resource_pack()`, instantiates the module's root scene inside a sandboxed viewport, and talks to it only through the `ModuleBase` interface. This tier is for developers/volunteers building content on behalf of teachers, not for teachers themselves, and should be clearly labeled as such in the SDK docs.

### 5.4 Load-Time Validation and Fault Isolation

On startup (and on demand from an in-game "Rescan Modules" button), the game scans `/modules/*` and, for each folder:

1. Parses `manifest.json`. Missing/unparsable → log and skip.
2. Validates required fields, checks `min_game_version` compatibility, checks that every referenced `vocab_sets` ID resolves against the installed Master Vocabulary Taxonomy version, checks that every file referenced in `assets` actually exists.
3. For Tier A: confirms `template` matches a template the engine actually has, and does a schema-validate pass on `rules_table.json`/equivalent content file against that template's expected shape.
4. For Tier B: confirms the `.pck` loads and exposes a valid `ModuleBase`-derived root node, within a timeout.

Any failure at any step means: write a timestamped, human-readable entry to `/modules/<id>/module.log`, write a one-line summary entry to the game's central `/logs/game.log`, and **exclude that module from the pool for this session** — the rest of the game boots and runs completely normally. No dialog interrupts the teacher; a small, dismissible "2 modules failed to load — see Advanced > Module Status" notice is the only visible sign, and the Advanced menu's module list (Section 6.2) shows failed modules with a red icon and a one-line reason pulled from the log. This satisfies the "silent to the player, loud in the log" requirement directly.

### 5.5 Distribution Format

A module is authored as a plain folder, then zipped for distribution (`face-description-a1_v1.0.0.zip`). "Installing" a module is: unzip into `/modules/`. No installer, no build step, no restart requirement beyond the rescan. This should be the literal instruction in teacher-facing docs: *unzip into the modules folder, click Rescan (or just relaunch), done.*

### 5.6 The Vocabulary Taxonomy as a Module

The Master Vocabulary Taxonomy itself ships as a special always-loaded content module (`/modules/_core-vocab/`) using the same manifest/versioning mechanism, so schools can receive taxonomy updates (new vocab sets) the same way they receive new content modules, and so third-party modules can depend on a specific taxonomy version without the engine needing special-case logic for it.

---

## 6. Configuration & Advanced Options

### 6.1 Session Settings (Expert or teacher-facing, pre-game)

Mission time (any duration, or **No Timer** — a distinct mode, not just a very long timer, which also disables time-based strike pressure and needy-module escalation, for true-beginner practice sessions), strike limit (1–99, or unlimited/practice mode), needy-module frequency and whether needy modules are enabled at all, difficulty ceiling (Tier 1–5), CEFR ceiling, UI language (English/繁體中文), controller/input mode, and whether this is a **graded session** (feeds the report pipeline more granularly) or a free-play session.

### 6.2 Advanced Options — Module Manager

A scrollable list of every installed module (including ones that failed to load, shown disabled with their error reason) with: a toggle switch (on/off for this session), its computed difficulty tier, its vocab sets, and its module code. This is the manual matching tool described in Section 7 — a teacher can hand-select exactly the modules that correspond to whatever printed manuals are on hand, independent of the sync-code system, for cases where a teacher deliberately wants to override.

### 6.3 No-Timer Mode, elaborated

Because the user specifically flagged this for very young/very A0 learners: No-Timer mode removes the countdown display entirely, disables strike-triggered detonation (strikes still log for reporting purposes but don't end the session), and disables needy-module time pressure (needy prompts still appear but don't penalize slow responses). Effectively this converts the game into an untimed, unlimited-attempts vocabulary walkthrough while keeping the two-player information-asymmetry mechanic intact — which is the actual pedagogical value even without any pressure.

---

## 7. The Sync Code System

This is the mechanism that answers: *how do a bomb and a manual (electronic or printed) know they agree on which modules exist?*

### 7.1 What the code encodes

A session's module set is a sorted list of `(module_code, content_version)` pairs plus a small set of session-config flags (timer on/off, strike limit) — collectively the **Session Manifest**. Two representations of it are shown to players:

- **Sync Code** — a short, eyeballable string, e.g. `T5S3 · CW1-FD2-KP1-...`, built by concatenating the config flags with each enabled module's 2–3 letter `module_code` and a single version digit, sorted alphabetically. This is what's compared at a glance: if the Defuser's bomb and the Expert's manual show the same string, they match. It is deliberately not a cryptographic hash — it needs to be human-parseable and, critically, **reversible**, because it doubles as the reconciliation input in 7.3.
- **Manifest QR code** — the same data, encoded as a QR code, shown next to the text string on both the bomb's startup screen and the manual's index page / footer, for fast camera-based reconciliation instead of manual typing when both devices have a camera.

Every page of the digital manual (and every page of a printed manual, per the print stylesheet) carries the Sync Code in a running footer, so a manual page found loose or out of order can still be checked against a live bomb.

### 7.2 When they match

Normal case. No action needed; play proceeds.

### 7.3 When they don't match

The Defuser (bomb side) has a "Sync to Manual" option that accepts a typed Sync Code or a scanned QR code. The bomb parses the requested module list and, for each requested module: if installed and enabled-eligible, enable it; if installed but a different content version, use it if the manifest declares that version range compatible, otherwise skip it and flag it; if not installed at all, skip it and flag it. The bomb then recomputes and displays its *actual* resulting Sync Code, distinct from the requested one if anything had to be dropped, along with a plain-language list of what was dropped ("Manual asked for 'Simon Says (SS2)' — not installed, skipped"). This is the "use what it has that matches" behavior requested — degrade gracefully to the largest common subset rather than refusing to play.

### 7.4 Directionality and paper manuals

The **electronic manual** can resync itself off the bomb's actual manifest just as easily as the reverse (a "Sync to Bomb" button that prunes/adds pages to match whatever the bomb reports) — useful when the Expert's device has an older module pack than the bomb. A **printed manual** obviously cannot re-paginate itself, so the rule is one-directional and explicit in the UI copy: if a paper manual is in use, the bomb should be the side that syncs down to the paper manual's code, not the other way around, and the game should say so plainly when a paper-manual flow is selected at session start (a simple "Using a printed manual?" toggle at setup that biases the reconciliation direction and copy accordingly).

### 7.5 Practical note on code length

With module codes capped at 2–3 characters and realistic session sizes (roughly 5–15 modules), the plain-text Sync Code stays well within "read aloud or type over a phone call" length, which matters for the internet-without-video classroom scenarios described in Section 8.

---

## 8. Networking Model

The user's own framing is the right one and should be taken literally: **most classroom pairs will be in the same room but on a network that won't let their devices see each other**, and since the players are talking out loud anyway, the game's job is less "be a multiplayer engine" and more "make sure both screens agree with each other," with live sync as a nice-to-have rather than a requirement.

### 8.1 Mode 1 — Standalone / Unlinked (default, most robust)

Both devices run the game with no connection to each other at all. Session config (module set, difficulty, timer) is set independently on each device — most simply, the Expert's manual and the Defuser's bomb are configured with the *same preset* or the same explicit module toggles, and the Sync Code (Section 7) is how the two players verbally confirm they're actually looking at compatible content before they start. This mode has zero networking failure modes, works with a printed manual, works with no internet or LAN at all, and should be treated as the primary supported classroom experience, not a fallback.

### 8.2 Mode 2 — Teacher-Hosted Relay (LAN or internet)

For classrooms that want live sync (e.g., the manual automatically shows which module the Defuser is currently stuck on, or a shared timer/strike display for the whole room on a projector), a small lightweight relay server — literally an executable the teacher runs on their own laptop, exactly as the user suggested — accepts WebSocket connections from paired devices on the same LAN or, if the teacher's machine is reachable, over the internet via a simple room-code join. This avoids relying on classroom WiFi client isolation being off (a real, common restriction in schools) by making the teacher's own computer the meeting point devices explicitly dial into, rather than expecting device discovery to work.

### 8.3 Mode 3 — Public Relay / Internet Play

For remote pairs (e.g., a student practicing with a partner at home), an optional hosted relay (small, cheap WebSocket relay service) plus a room code allows pairing over the open internet without either party running anything locally. This is architecturally the same client as Mode 2, pointed at a different relay address, and should share code.

### 8.4 Bluetooth and ad hoc networking

Flagging this honestly: browser-based Bluetooth (Web Bluetooth API) is Chrome/Android-only and unavailable on iOS Safari and most Chromebook-managed browser policies, so it cannot be a depended-upon path for a cross-platform "iPad or Android or PC" requirement. It's reasonable to support it opportunistically where available (same transport abstraction as 8.2, just a different pipe) but the manual/teacher-facing docs should not promise it as reliable. Ad hoc WiFi Direct networks have the same story — supportable where the OS/browser allows it, not guaranteed.

### 8.5 Recommendation

Ship Mode 1 in the MVP as the fully-supported path (it's also the simplest to build and the hardest to break), and treat Modes 2/3 as a fast-follow built on the same relay-based transport, since a teacher-run relay executable directly matches what the user described wanting.

---

## 9. The Digital Manual

### 9.1 Presentation

A skeuomorphic ring-binder rendered in-app: a spine of colored tabs down the side, one tab per installed/enabled module (icon + module code), a persistent **Index page** (page one) listing every module in the current manifest with its tab color and a jump link, and page-flip animation when a tab is clicked. This should be built as its own self-contained UI scene so it can be reused, at low effort, as a standalone "manual-only" build for the Expert device (a lighter download that never needs to load 3D bomb assets at all — useful for older tablets acting purely as the Expert's book).

### 9.2 Content and Language Rule

The manual's *instructional content* — the actual defusal instructions — is **always English**, regardless of UI language, because that content is graded ESL material, not app chrome. The surrounding **app UI** (menus, "How to Play," settings, tab labels' tooltips) follows the selected UI language (English or Traditional Chinese). Each module page carries a small footer reference number linking its English vocabulary terms to an **Appendix: English–Traditional Chinese Glossary** at the back of the manual, auto-generated from the vocab sets actually in use in this manifest (so the appendix, like the manual itself, prunes/grows with the module set rather than being a static, ever-growing wordlist).

### 9.3 Print Stylesheet

A dedicated print CSS/print-mode render: black-and-white only, line-art/high-contrast versions of any module images (colors modules need a special case here — see 9.4), KTANE-style dense technical-manual typesetting, module pages in a fixed order matching the Index, Sync Code and QR code in the footer of every page, and the glossary appendix at the back. Printing should be a single "Print Manual" button that opens the browser print dialog against this stylesheet — no separate export step.

### 9.4 A Note on Color Modules in Black-and-White Print

Since several core modules are explicitly built around color vocabulary, a pure B/W printed manual can't lose the color information without breaking the module. The recommended solution: color-vocabulary modules include a text-label fallback (the printed rules table says "RED" not just a red swatch) as their primary printed representation, with the on-screen digital version showing both the swatch and the label. This also happens to be good ESL design independent of printing — reinforcing the written word alongside the color.

---

## 10. Reporting

### 10.1 What's Captured

Per session, per module: attempts, strikes incurred, time spent, whether solved or left unsolved, and — where the module template supports it — which specific vocabulary items were involved in each interaction (e.g., which color/body-part combination was asked about, and whether the Defuser's/Expert's action matched it). Needy-module response rate is captured as a rough participation signal. None of this requires speech recognition or transcription — it's derived entirely from in-game actions (button presses, wire cuts, dial turns) already flowing through the module interface, matched against the manifest's declared vocab sets for that interaction.

### 10.2 Report Output

A structured JSON report and a human-readable summary (Markdown/HTML, printable) are always written locally to `/reports/` on the device, unconditionally, as the first thing that happens at session end — this must not depend on network availability. From there, three optional delivery paths, all configurable in Advanced Options and all able to coexist:

- **Push to teacher server** — a configurable HTTPS endpoint the report POSTs to, for teachers or schools running their own dashboard.
- **Email to teacher** — since a browser client can't send SMTP directly, this requires a small companion mail-relay endpoint (the same lightweight service that could host the WebSocket relay in Mode 2/3 is a natural place to add a `/report-email` route); configured with the teacher's address in Advanced Options.
- **In-app report viewer** — a simple built-in screen listing past local sessions with per-module breakdowns, for the "network's down, check it on the device" fallback, plus the raw files remain on disk for a teacher to pull manually.

### 10.3 What Makes a Report Pedagogically Useful

Beyond raw pass/fail, the report should surface: modules where strikes clustered on a specific vocab set (signals a genuine gap vs. modules where strikes were spread thin, which signals a mechanical mix-up rather than a vocabulary one), needy-module non-response (signals disengagement, not necessarily lack of vocabulary), and time-per-module relative to that module's `time_estimate_seconds`, which flags modules that took far longer than expected. A "which player" attribution is soft at best (the game generally can't know who's speaking), so reports should be framed at the **pair/session** level, not claim to isolate one student's performance — this should be stated plainly in the report UI so teachers don't over-read the data.

---

## 11. Accessibility, Input, and Quality-of-Life

Input: mouse+keyboard, touch, and gamepad all supported out of the box via Godot's unified Input Map, with a remapping screen in Settings for all three. Touch targets sized for tablet use (this matters more here than in most games, given the target hardware). Colorblind-safe palettes plus always-paired text labels for color content (also serves the print requirement above). Adjustable UI text scale. Subtitle/caption option for sound-effect cues (ticking pace change, strike buzzer, needy-module alarm) for hearing-impaired players or noisy classrooms. A practice/sandbox toggle independent of No-Timer mode that allows retrying a single module without resetting the whole bomb, useful for teacher-led demonstrations. A "How to Play" walkthrough, localized per Section 12, separate from the in-fiction Manual.

---

## 12. Localization

Two shipped languages at launch: English and Traditional Chinese (zh-Hant), covering all app UI, menus, and the "How to Play" tutorial — implemented as standard external string-table files (Godot's translation CSV/PO pipeline) so a third language is a translation-file addition, not a code change. The in-fiction Manual's instructional text is English-only by design (Section 9.2) with the auto-generated English–Traditional Chinese glossary appendix as the only bilingual manual content. The vocabulary taxonomy (Section 5.6) should carry a `zh_hant` translation field per term specifically to drive that glossary, decoupled from the UI string-table system since it's content data, not app chrome.

---

## 13. Audio and Presentation

Standard KTANE-adjacent audio palette: ambient tension bed, ticking that quickens as time runs low (skipped entirely in No-Timer mode), a distinct strike buzzer, a distinct needy-module alarm, solve/defuse and detonation stings. One clear addition worth making given the audience: **per-vocab-item pronunciation audio** (short recorded or TTS clips) attachable to any vocab set entry and playable from both the bomb module (tap a word to hear it) and the manual — cheap to add given the data-driven module format already carries an `/audio/` folder per module, and directly useful for A0 learners who may not yet reliably decode written English.

Visually: clean, high-contrast, low-detail-clutter 3D presentation — the bomb itself should read clearly at a glance (this is explicitly requested and also just good UX for the age/level group); avoid KTANE's sometimes-cluttered real-prop aesthetic in favor of a slightly more graphic, high-contrast "friendly tech" look that keeps color and iconography legible on small tablet screens.

---

## 14. Recommended Technical Stack

**Engine:** Godot 4.x, exported to Web (HTML5/WASM). Chosen per the design constraints above specifically because of its strong native input-map system (mouse/touch/gamepad remapping largely for free) and because the Tier A/Tier B module split (Section 5) resolves the "compiled export vs. drop-in folder" tension without giving up Godot's tooling.

**Module content delivery:** Tier A modules are pure JSON/asset folders read by the engine at runtime (no Godot-specific packaging at all — could in principle be authored by a teacher with no Godot installed); Tier B modules are Godot `.pck` resource packs loaded via `load_resource_pack()` at runtime, built from a published Module SDK template project.

**Networking:** custom lightweight WebSocket relay (small Node.js or Godot-headless service), distributable as a single teacher-run executable for Mode 2, with an optional hosted instance for Mode 3; Mode 1 (Section 8.1) requires no networking code path to be exercised at all beyond the Sync Code comparison, and should be the primary target for reliability testing.

**Local storage/reports:** browser `IndexedDB`/`OPFS` (Origin Private File System) for the web build's local report storage and module cache, since `localStorage` is unsuitable for structured report data and asset caching at this scale; a companion lightweight desktop/Electron-style wrapper is worth considering post-MVP specifically to get real filesystem access to `/modules/` and `/reports/` folders for teachers who prefer literal drag-and-drop over a browser file-picker upload flow.

**Vocabulary/manifest data:** plain JSON throughout, versioned, human-editable, git-friendly — deliberately avoiding a database or build step anywhere in the authoring pipeline, in service of the "unzip and go" requirement.

---

## 15. Additional Recommendations Beyond the Original Brief

- **Per-vocab pronunciation audio** (Section 13) — low cost, high value for true beginners.
- **Text-label-plus-swatch redundancy for all color content** (Section 9.4) — serves both accessibility and printing, should be a hard rule in the module authoring guide, not optional.
- **Curriculum presets** (Section 4.4) so teachers aren't hand-picking modules from a flat list every session.
- **Session-pair framing for reports** (Section 10.3) — avoid overclaiming individual-student attribution the game can't actually measure.
- **Manual-only lightweight build** (Section 9.1) for Expert-side tablets, separate from the full 3D bomb client, to reduce load on older classroom hardware.
- **Module Status panel surfacing failed-load reasons in plain language** (Section 5.4) rather than requiring a teacher to go find and read a log file — the log file should still exist for anyone who wants it, but shouldn't be the *only* way to see what happened.
- **A "Using a printed manual?" setup toggle** (Section 7.4) that biases sync direction and changes on-screen copy accordingly, so the one-directional paper constraint doesn't have to be something a teacher discovers by trial and error.
- Consider, post-MVP, an opt-in **class-level vocabulary tracking** (which sets a given class has been exposed to across sessions) to power smarter curriculum-preset suggestions over a semester — explicitly scoped as a later phase, not MVP.

---

## 16. Phased Build Plan

**Phase 0 — Core loop proof.** 3D bomb shell, one hardcoded module (Rainbow Wires), timer, strikes, win/lose states, single device only, no manual UI yet.

**Phase 1 — Module system MVP.** Tier A data-driven module loader with 2–3 templates (wire panel, matching-table, keypad), manifest validation and fault isolation, the three worked-example modules (Section 4.3) as real content, Advanced Options module manager, difficulty scoring engine.

**Phase 2 — Manual and Sync Code.** Digital ring-binder manual UI, Index page, print stylesheet, Sync Code generation and comparison, one-way reconciliation flow.

**Phase 3 — Session config, No-Timer/practice modes, curriculum presets, reporting (local file output + in-app viewer).**

**Phase 4 — Networking.** Mode 1 hardening first and foremost, then the teacher-run relay (Mode 2) and hosted relay (Mode 3), plus report push/email delivery.

**Phase 5 — Localization pass (Traditional Chinese), accessibility pass (colorblind palettes, remapping UI, captions), audio pass (pronunciation clips, full SFX set), Tier B Module SDK and documentation for developer-authored modules.

Each phase should end with the module-authoring documentation updated, since "a teacher can drop in a folder with no headaches" is only true if the authoring guide is kept current alongside the manifest schema.

---

## 17. Open Questions for Playtesting

Exact difficulty-formula weights (Section 4.2) are a starting hypothesis, not a tuned result, and should be adjusted after watching real A0–A2 pairs play. Ideal default mission time and strike count for each difficulty tier need classroom data. Whether needy modules help or simply add stress for the youngest learners should be evaluated with No-Timer-mode classes specifically before deciding whether needy modules default on or off for that population.
