# Module Design Docs: 260-Word Coverage

The goal of this folder is a set of bomb modules that, together, put **every word on the
Touhu Elementary School 260-word list** (`260 Words for Elementary School (1).pdf`, pages 1–14)
into play. Each word has to be *load-bearing*: the team can't defuse the module unless someone
says, hears, reads or understands that word.

- **[VOCAB_TRACKER.md](VOCAB_TRACKER.md)** is the running list of words used and words still needed. It is generated, so don't edit it by hand.
- **`vocab_260.tsv`** is the master word list (id, word, aliases, 中文, category).
- **`vocab_tracker.py`** rebuilds the tracker. Run it after adding or changing a module doc:

  ```bash
  python docs/design/modules/vocab_tracker.py          # rewrite VOCAB_TRACKER.md
  python docs/design/modules/vocab_tracker.py --check  # fail if stale or a word is off-list
  ```

The same PDF also has 400-, 600- and 800-word lists (pages 15–40). They are out of scope here.
They can get their own tracker later by adding a `vocab_400.tsv` file.

## Modules

| # | Module | Mechanic | Main word groups |
|---|---|---|---|
| M01 | [Family Photo](M01_family_photo.md) | Spot the impostor in a photo | Family, People & Occupation, Appearances |
| M02 | [Lunch Rush](M02_lunch_rush.md) | Overlapping shouted orders across two screens | Food, Fruits, Drinks, meals, a/an |
| M03 | [Weather Wardrobe](M03_weather_wardrobe.md) | Dress for the sky, then re-dress when it changes | Weather, Seasons, Clothing, sky |
| M04 | [School Bell](M04_school_bell.md) | Ring each bell on the hour as a fast clock runs | Days, Subjects, Daily Routines |
| M05 | [Ticket Machine](M05_ticket_machine.md) | Buy a multi-leg route ticket | Transportation, Places, from/to/by |
| M06 | [Messy Desk](M06_messy_desk.md) | Drag items to their right places | School objects, Colors, Prepositions |
| M07 | [Midnight Snack](M07_midnight_snack.md) | Sneak through a dark house (blind maze) | House rooms, night, sleep, there |
| M08 | [Mystery Guest](M08_mystery_guest.md) | Yes/no questions to find one guest | Ability & Talent, can/do/did, yes/no |
| M09 | [Mood Plugs](M09_mood_plugs.md) | Plug sentences into the right faces | Pronouns, this/that, Feelings |
| M10 | [Gift Shop](M10_gift_shop.md) | Spend the wallet exactly: Defuser has prices, Expert has money | Toys, Holidays, Numbers, dollar |
| M11 | [Monster Clinic](M11_monster_clinic.md) | Count body parts, touch them in order | Health & Body Parts |
| M12 | [Animal Race Day](M12_animal_race_day.md) | Timed presses as animals cross the line | Animals, Sports, can/not |

**Build specs** (how to implement, in [`build/`](build/)):
[`PLATFORM.md`](build/PLATFORM.md) (shared plumbing, one core change to approve) · [`ART_GUIDE.md`](build/ART_GUIDE.md) (Gemini / Nano Banana prompts and style) · [`art/`](build/art/README.md) (one task file per image) · [M01](build/M01_build.md) · [M02](build/M02_build.md) · [M03](build/M03_build.md) · [M04](build/M04_build.md) · [M05](build/M05_build.md) · [M06](build/M06_build.md) · [M07](build/M07_build.md) · [M08](build/M08_build.md) · [M09](build/M09_build.md) · [M10](build/M10_build.md) · [M11](build/M11_build.md) · [M12](build/M12_build.md). Each spec ends with a 🚩 Flags list of decisions to review.

These are new designs. They are separate from the 12 modules in the frozen prototype doc
(`reference/esl-bomb-squad-prototype/esl_bomb_squad_clean.md`) and from the built `game_mods/`
(Color Wires, Number Keypad, etc.). The tracker only counts docs in this folder.

## The goal: English can't be bypassed

The point of every module is to **make students speak English to each other**. At the very
least, the reader has to **read and understand English** before they can pass it on, even if
they pass it on in Chinese. Roles swap every round, so every student does both jobs.

Students will use Chinese whenever it's easier (see "No honor system" below), so the design
has to make English unavoidable:

1. **The Expert's side is English words, never icons.** Manuals, sentences, maps, plans,
   orders, prices: all text. If the Expert could solve it from pictures, the module teaches
   nothing. This is the minimum bar, and every module must meet it. **Where the number
   itself is what gets passed across** (M10's prices and wallet), write it as a word
   (`seven dollars`), or the exchange needs no English at all. Numbers that are just labels
   or indexes next to English text (the M04 timetable hours, M01 frame numbers) stay as
   digits.
2. **At A1–A2, put the English word under the picture on the Defuser's buttons too.** When
   both screens show `hamburger`, saying "hamburger" is quicker than translating it into
   Chinese and back. English becomes the easiest way to talk, which is how we get students
   *speaking* it. At B1+, the Defuser goes back to pictures only, so they have to understand
   the word, not just match its letters.
3. **Add rules about the English word itself** where they fit naturally: a/an, number words,
   he/she/it (spoken Chinese uses *tā* for all three), this/that. These can't be solved
   through translation at all.

| # | English lock |
|---|---|
| M01 | The Expert reads English descriptions (tall/thin, jobs). The Stage 2 role buttons are English words, so the Defuser reads too. |
| M02 | Orders are English text. The purple-light **a/an** rule only works in English. |
| M03 | The outfit tables are English. The clothing near-pairs (shirt/T-shirt, jeans/pants) have to be read exactly. |
| M04 | The timetable is English. `TODAY: WEDNESDAY` on the Defuser's side is English, so both read. |
| M05 | The map is labeled in words only, with no building or vehicle icons. |
| M06 | The rules are English, and they depend on prepositions (in/on/under/next to/by). |
| M07 | The floor plan is words only (*bathroom*, *baby*), and the Defuser sees pictures. |
| M08 | The strongest lock: the Defuser **builds English questions** from tiles, and the bomb checks the grammar. |
| M09 | The Expert has to resolve **he/she/it** and **this/that/these/those** from English. Spoken Chinese loses these distinctions. |
| M10 | All numbers are **English words** on both sides (`seven dollars`). No digits anywhere. |
| M11 | The Doctor Book is English (body parts, *how many*, *more than*). |
| M12 | The entry list is English (*tiger*, *swim*) and read under time pressure. |
| M13 | The code is English number words only; the keypad is digits only. The Defuser has to *hear* -teen vs. -ty. (400-list; doc in [`400/`](400/M13_teen_code.md).) |

**Future option:** speech recognition (the bomb only accepts a *spoken* English word) would
force speaking directly. It's unreliable in a noisy classroom and raises privacy questions,
so nothing depends on it yet.

## Design rules (from the prototype doc; they still apply)

1. **Information gap.** The Defuser must never be able to solve a module alone. Each design
   says which gap technique it uses: serial-number dependency, hidden lookup table, conditional
   logic, or position/order dependency. Real-world knowledge must not leak the answer. For
   example, "the bird can fly" is guessable, so M12 uses a race-entry list instead of real
   animal abilities.
2. **260-word manual text.** Expert manual lines and panel labels use list words plus free
   connectives (*a, the, and, but, is, are, if, then*…). Longer and plainer beats shorter with an
   off-list word.
3. **Off-list words are declared.** Some game-action verbs are not on the list (*press, put,
   give, touch, open*). Each doc lists the off-list words it needs, so they can be checked
   against the IMA-17 UI-chrome word list.
4. **No honor system.** Every rule must be enforced by what each screen shows or accepts:
   a hidden answer, a counter that goes down on its own, input the game checks. Never write
   "the Expert must not say…" or "press this each time you…". Most of the class won't follow
   it. Saying more than needed is always allowed. If saying it would break the puzzle, the
   puzzle is broken.
5. **Pictures on the Defuser side, words on the Expert side** wherever possible. The Defuser
   then has to *produce* the English word ("I see a… hot dog?"), and the Expert has to
   *understand* it. Vocabulary goes both ways.

## Choosing a design route

Both routes from the brief are fine, and the doc should say which one was used:

- **Vocab first:** take a word group nobody has covered yet (see "Still needed" in the
  tracker) and ask what physical action those words naturally ask for. Clothing asks to be
  *dressed*, transport asks for a *ticket*, prepositions ask to *put things somewhere*.
- **Puzzle first:** start from a fun mechanic (a blind maze, timed presses, deduction), then
  see which uncovered words can carry its information.

Most of M01–M12 went vocab-first, because the hardest list words to cover are grammar words
(pronouns, articles, wh-words). Those modules (M08, M09) were built around the grammar so the
words can't be skipped.

## Variety rules (no repeated steps)

Doing the same steps in every module is boring, whatever the steps are. Every new or revised
module must pass this check against the table below:

1. **Serial number in at most 1/3 of modules**, and each one has to look for something
   *different* in the serial (last digit, contains a 7, matches a count…). Never use the
   serial just to pick a page. The Expert's screen can show this round's content directly.
2. **No two modules share an opening move.** The first question asked should differ every
   time.
3. **No two modules share a core action *and* an Expert job.** If the loop is "Defuser
   describes, Expert looks it up, Defuser enters", the module needs a twist that changes the
   loop (a live change, a two-way split, a clock), not just a different table.
4. **Mix the pressure types** across a bomb: accuracy, juggling, rhythm, reaction, planning,
   search.

| # | Opening move | Core action | Expert's job | Pressure | Serial |
|---|---|---|---|---|---|
| M01 | "What is the name on the photo?" | spot the impostor | compare descriptions | accuracy | — |
| M02 | Expert shouts the most urgent order | juggle overlapping orders | dispatch and prioritize | parallel timers | — |
| M03 | "Day or night?" | dress, then re-dress after a change | look up, then work out what changed | live change | — |
| M04 | "What day is it?" | ring on the hour | call ahead | clock rhythm | — |
| M05 | "Where from? Where to?" | build a multi-leg ticket | route planning | re-plan after closures | — |
| M06 | "What is the serial's last digit?" | fix misplaced items | check rules | one-shot CHECK | last digit → rule page |
| M07 | "Where are you?" | sneak through a blind maze | locate, then navigate | noise meter | — |
| M08 | Expert reads the witness notes | Defuser builds yes/no questions from tiles | read the bomb's answers aloud | question budget, grammar check | B2: contains a 7? |
| M09 | Expert reads a sentence | plug sentences into faces | read faces, check grammar | grammar decoys | — |
| M10 | "Who is the gift for?" | find the exact-money combination | mental arithmetic | search | — |
| M11 | "Is it sick?" | count, then touch in order | treatment steps | counting | B1: eye count in serial? |
| M12 | Defuser calls the race | press at the right moment | instant lookup | reaction speed | — |
| M13 | Expert reads the first number | press a dictated code | pronounce -teen/-ty stress | listening accuracy, reset on a wrong press | — |

## Inspiration (researched 2026-10-28)

What each game in the pool actually does, and what these designs take from it. The public
pages describe features, not individual puzzles, so the borrowing is at the **mechanic**
level. No module copies a specific puzzle from any of these games.

| Game | What it does differently | Used in |
|---|---|---|
| **Keep Talking and Nobody Explodes** | The original setup: one player has the bomb, the others have the manual. Bomb-wide clues (serial etc.) are only used by *some* modules, each in its own way. | Whole set; the variety rule on serial use |
| **Them Bombs** | KTANE-style: one "hero" handles the bomb while an expert team reads the manual. Several Experts at once; harder levels mean more modules and less time. | Multi-Expert play (future) |
| **Spaceteam** *(general knowledge, not re-researched)* | The instruction appears on one player's screen, but the control is on another's, and everyone shouts at once. | M02 Lunch Rush |
| **BOMBANANA!** | Three players, each missing a sense (one can't see, one can't hear, one can't speak). Teams invent their own signals. Hazards like power cuts and loud noises. | Mishaps idea below (nag layer, later) |
| **Boom Bureau** | Defuser and operator on either side of a pane of glass. The bomb *interferes with communication* (fogged glass, dead intercom, a silly voice). A tangle of cords to put back in place, an on-site farm bomb across several locations, and players can build bombs to send to friends. | M03 live changes; Mishaps idea; M07 multi-room; teacher bomb-builder (IMA-42) |
| **Solve it or BOOM!** | Defuser and Guide. A planned "Divide and Defuse" mode gives each player part of the bomb *and* incomplete instructions, so both have to swap information. | M10 two-way split |
| **Defuse or Lose** | Random module pools per level. **Hazards change modules** (a storm affects the signal module, fallout affects the memory module). Battery, serial, allowed mistakes and timer all feed into the puzzles. | M03 weather change; M05 mid-ticket closures |
| **MAYDAY** (itch.io) | Random roles each game; "describe, dig, shout". Every bomb is random, and short rounds. | Random role swap between rounds |

**Not yet used, worth a module or a bomb-wide layer:**

### Nag layer (optional, OFF by default; deferred, educational modules come first)

Interruptions that pull attention away from the main module: KTANE's alarm clock and its
"needy" modules, and the Mishaps below. They are fun, but they get in the way of learning, so
they are a **host toggle**:

- **Class mode (default):** nag layer off. Students spend their attention on the English.
- **Fun mode:** nag layer on, for higher-level classes, game days, or play outside class.

Nag ideas must still use list words, and must still follow the no-honor-system rule. For
example: an alarm clock rings, and the Defuser must tap the right **day** to stop it
(recycles M04). A needy "hungry pet" asks for food or a drink every 30 s (recycles M02). The
existing Color Wires mod's needy-quiz on-ramp is a candidate to move into this layer too.
Changes *inside* a module (M03's weather, M02's diet light, M05's closures) are part of the
puzzle, **not** nags, and stay on in Class mode.

- **Mishaps** (Boom Bureau, BOMBANANA!): short bomb-wide events that break communication for
  a few seconds. They must change **what the screens show or accept**, never ask players to
  hold back. *Fog*: the Defuser's pictures blur for 10 s, so they have to ask instead of look.
  *Blackout*: the Expert's screen goes dark for 10 s, so they work from memory. *Spell it*:
  the next answer must be typed on a letter keypad instead of tapped. They force listening,
  memory and spelling without adding another lookup.
- **Two bombs at once** for groups of 3–4 (Boom Bureau): two Defusers share one Expert,
  which is a natural fit for classroom groups.

Sources: [Them Bombs (App Store)](https://apps.apple.com/app/id1170423721) ·
[Them Bombs (Google Play)](https://play.google.com/store/apps/details?id=com.yellowdot.ThemBombsGP) ·
[BOMBANANA! (Steam)](https://store.steampowered.com/app/4656000/BOMBANANA/) ·
[Boom Bureau (itch.io)](https://lee-courgette.itch.io/boom-bureau-demo2) ·
[Boom Bureau full release devlog](https://lee-courgette.itch.io/boom-bureau-demo2/devlog/1720905/the-full-game-is-out-free) ·
[Solve it or BOOM! (itch.io)](https://marginalmoonsgames.itch.io/solve-it-or-boom) ·
[Solve it or BOOM! multiplayer devlog](https://marginalmoonsgames.itch.io/solve-it-or-boom/devlog/864709/solve-it-or-boom-multiplayer-v1-is-here) ·
[Defuse or Lose (GitHub)](https://github.com/radekdevjasinski/defuse-or-lose) ·
[MAYDAY (itch.io)](https://maydaythegame.itch.io/mayday) ·
[itch.io bomb-defusal tag](https://itch.io/games/tag-bomb-defusal)

## Doc template

Copy this for a new module. The `**Target vocab (N):**` line is parsed by the tracker. Keep it
on one line, comma-separated, using the canonical word or an alias from `vocab_260.tsv`.

```markdown
# M13: Module Name

**Target vocab (N):** word, word, word
**Off-list words needed:** press, …
**Difficulty:** A1–B1 · **Time:** 60–90 s · **Route:** vocab-first | puzzle-first
**Status:** Draft

## The hook
## Inspiration
## Defuser view
## Expert manual
## Solving it
## Example round
## Information gap
## Difficulty scaling
## Build notes
## Open questions
```
