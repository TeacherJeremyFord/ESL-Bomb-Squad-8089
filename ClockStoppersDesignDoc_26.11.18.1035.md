# Clock Stoppers: Game Design Document

*Draft v0.1, 2026-11-18*

## 1. Overview

**Clock Stoppers** is a cooperative, two-player web game for English learners, inspired by *Keep Talking and Nobody Explodes*. One player sees a screen full of unusual clocks. The other holds a static rulebook. Neither can finish the job alone, so they must communicate in spoken English to set every clock to the correct time before the round timer runs out.

**Goal:** Give students real, repeatable practice telling and describing time in English (o'clock, half past, quarter to, ten past, an hour later, and so on) along with descriptive vocabulary (colors, patterns, objects).

## 2. Target Audience

- Seventh and eighth graders
- English levels A0 to B1 (a wide range, so the game must scale)
- Played in class on school computers or phones, in pairs, either side by side or on separate devices

## 3. Platform and Technical Notes

- **Web game**, no install, runs in a browser on computers and phones.
- **Print option:** The teacher can only print in black and white, so a printable version of the Rulebook (and optionally clock cards) must work without color. Colors are replaced by patterns and pictures (striped, dotted, cat, star, and so on).
- The master clock reads the player's **local time** using the browser's built-in clock.

## 4. Roles

| Role | Sees | Does |
|---|---|---|
| **Clock Keeper** | The clocks and the master clock | Describes the clocks aloud, asks questions, sets the clocks by clicking hands or digits |
| **Time Master** | The Rulebook only (never the clocks) | Reads the rules, works out target times from the master clock, tells the Keeper what to do |

The information gap is the heart of the game: the two players must talk to each other in English.

## 5. Core Loop (One Round)

1. A round starts with 3 to 4 clocks on screen, each with a distinct look (color, pattern, picture, analog or digital).
2. The Keeper describes a clock: *"There's a blue clock with orange hands."*
3. The Time Master finds the matching rule in the Rulebook, for example *"Blue clock: master time plus one hour."*
4. The Time Master works out the target using the master clock and says it aloud: *"It's quarter to seven."*
5. The Keeper sets that clock and repeats the time aloud.
6. If correct, the clock **locks** (click sound, checkmark, stops ticking). If wrong, a small time penalty applies.
7. The round is won when every clock is locked before the countdown ends.

## 6. The Clocks

Each clock has randomized appearance attributes each round:

- **Type:** analog (face with hands) or digital
- **Color scheme:** for example black clock with red digits, blue clock with orange hands, purple numbers
- **Picture or pattern on the face:** cat, star, stripes, dots, and so on (these also serve as the black-and-white print alternative)

Because the appearance is randomized, a rule like "blue clock" will point to a different clock each round, so students cannot memorize positions or answers.

## 7. The Rulebook (Static)

The Rulebook never changes. It contains **rules**, not answers. Each rule links an appearance to a formula based on the master clock.

Example rules (to be refined):

- "Blue clock: set it to the master time plus one hour."
- "Cat clock: set it half an hour behind the digital clock."
- "Striped clock: copy the master time."
- "Green clock: set it to the master time minus ten minutes."

The rules stay fixed, but the master clock and the appearance of the clocks change, so the actual answers are different every round. Memorizing the book gives no shortcut.

## 8. The Master Clock

A large, plain clock showing the player's **real local time**, live. Every target time is derived from it.

### Difficulty by time precision

| Tier | Level | Rules use | Notes |
|---|---|---|---|
| **Easy** | A0 to A1 | **Hour only** | Targets stay valid for a whole hour. Only o'clock and half past. |
| **Medium** | A2 | **Hours and minutes** | Adds quarter past, quarter to, five-minute steps. |
| **Hard** | B1 | **Seconds** | Adds *twenty-five to*, *in ten minutes*, *an hour ago*, and mixed analog and digital puzzles. |

### Second-hand clocks (Hard tier)

Seconds change too fast to chase. So for these clocks:

1. The student sets the clock to the target in advance.
2. The clock **locks automatically** when the master clock reaches the matching second.
3. It becomes a timing challenge, not a speed challenge.

*Example:* "Set the green clock to the master time at the moment the master seconds reach zero." The student sets it and waits. When the master clock rolls over, the green clock clicks and checks itself off.

**Optional bonus:** The Time Master counts down aloud in English ("ten seconds to go, five, four..."). Nice to have, not required.

## 9. Win, Lose, and Pressure

- **Win:** All clocks are locked before the countdown ends.
- **Lose:** The countdown reaches zero first.
- **Penalty:** Each wrong attempt costs a few seconds.
- **Locked clocks stay locked.** Once a clock is correct it is checked off and no longer affected by the master clock.

*(Open: exact timer lengths per tier, penalty size, and whether to add a star rating.)*

## 10. Language Targets by Level

| Level | Time language | Description language |
|---|---|---|
| A0 to A1 | o'clock, half past | colors, simple objects: "the red clock," "the cat clock" |
| A2 | quarter past, quarter to, five-minute steps | colors plus patterns, "with orange hands," "with stripes" |
| B1 | twenty-five to, in ten minutes, an hour ago, an hour later | full descriptive phrases, asking clarifying questions |

**Mixed-level pairing:** A stronger student can be the Clock Keeper (more describing) while a weaker student is the Time Master on an easier tier, or the other way around.

## 11. Replayability

- Random clock appearances each round
- Live local time as the master clock, so no two rounds are the same
- Static rulebook plus changing inputs means memorization does not help
- Optional: rulebook variants (several rule sets) to keep repeat play fresh

## 12. Print Version (Black and White)

- Printable Rulebook page and optional clock-card sheet
- Colors replaced by patterns and pictures
- Teacher can run a paper version with a shared "master time" written on the board or announced

## 13. Open Questions

1. Should the Time Master ever see the clocks, or is the information gap the whole point? (Current plan: never.)
2. Exact rule sets for each tier, and how many rules per Rulebook.
3. Timer length and penalty values per tier.
4. Same-room play versus two-device remote play (or both).
5. Scoring, stars, or progression between rounds.
6. Sound design (ticking, lock click, success and failure cues).

## 14. Suggested Next Steps

1. Write the Easy-tier rulebook (hour only) with 6 to 8 rules.
2. Build a minimal playable prototype: one master clock, three clocks, one locked-in rule set.
3. Playtest with a few students and watch what language they actually use.
4. Add Medium and Hard tiers, then the print version.
