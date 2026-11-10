# M04: School Bell

**Target vocab (28):** Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, today, week, day, time, science, math, PE, music, art, Chinese, English, school, get up, go to school, go home, do one's homework, go to bed, study, at, when, what
**Off-list words needed:** press, clock, now, next, ready
**Difficulty:** A1–B1 · **Time:** 60–90 s (one fast day) · **Route:** vocab-first (Days + Subjects + Daily Routines)
**Status:** Draft (rev 2: rebuilt around a live clock so it isn't another lookup module)

## The hook

The bomb runs a **whole school day in one minute**. Its clock races forward, about 5 seconds
per hour. Every hour, the bell has to ring for the right thing (*get up*, *math*, *go
home*…), and it has to ring **while that hour is on the clock**. Too early or too late is a
strike. The Expert has the day's timetable and has to call each bell **before** it happens.

## Inspiration

Rhythm and countdown games, where you know what's coming and have to hit it on time, played
as a two-person relay. Compared with M12 Animal Race Day (react to something random), this is
the opposite skill: **anticipate something known**. The Expert's job is to stay one step
ahead: *"Next is ten o'clock: art. Ready… now!"*

## Defuser view

- **Day display:** `TODAY: WEDNESDAY`.
- **The clock:** a big analog clock with a sun or moon behind it. The hand moves steadily and
  the hour number glows as each hour starts.
- **Subject buttons (7 icons, no words):** flask (science), 1+2 (math), running shoe (PE),
  music note (music), paint palette (art), 中 (Chinese), ABC (English).
- **Routine buttons (5 icons):** alarm clock (get up), bus (go to school), house (go home),
  notebook and pencil (do one's homework), bed (go to bed).
- A **bell lamp** flashes green for a right ring, or red for a wrong or late one.
- At the end: a **WHEN?** card (see Phase 2).

## Expert manual

The Expert's screen shows **this week's timetable**, a grid with days across and times down.
It isn't hidden behind a page lookup. The work is in *timing*, not finding.

| Time | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday / Sunday |
|---|---|---|---|---|---|---|
| 7 | get up | get up | get up | get up | get up | — |
| 8 | go to school | go to school | go to school | go to school | go to school | get up |
| 9 | English | science | math | Chinese | music | — |
| 10 | math | Chinese | art | PE | English | study English |
| 11 | PE | music | English | science | art | — |
| 4 | go home | go home | go home | go home | go home | — |
| 7 (night) | do my homework | do my homework | do my homework | do my homework | — | — |
| 9 (night) | go to bed | go to bed | go to bed | go to bed | go to bed | go to bed |

> **Rules:**
> Ask: *What day is it today?*
> Ring the bell **at** that time, not before.
> A "—" means no bell. Do not ring!
> Friday night has no homework. It is the end of the week!

**Phase 2: When?** At the end of the day, the bomb shows one subject card and asks *WHEN?*
The Defuser says what the subject is. The Expert answers with the **day and time**:
*"Tuesday at eleven."* The Defuser turns two dials (day and hour) to match.

## Solving it

- The first question is the day. After that it's all rhythm.
- The Expert reads ahead, the Defuser finds the icon early, finger over the button, and
  presses when the hour lands. The clock **doesn't stop** for a slow lookup. That pressure is
  the module.
- **"—" hours are traps.** On Saturday the clock still passes 7, but there's no bell. The
  Expert has to say *"No bell! Not now!"*
- Phase 2 reverses the flow, as a breather after the rush: the Defuser describes, the Expert
  searches, and the Defuser sets the dials.

## Example round

> **E:** What day is it today?
> **D:** Wednesday!
> **E:** Seven: get up. The alarm clock. Ready…
> **D:** *(clock hits 7)* Now?
> **E:** Now! Next, eight: go to school, the bus.
> **D:** *(ding)* Next?
> **E:** Nine: math. One plus two. Then ten: art.
> **D:** *(ding)* … *(ding)*
> **E:** Eleven: English. Then… four: go home. Twelve, one, two, three, no bell!
> **D:** No bell… no bell… *(ding at 4)*

## Information gap

✅ **Hidden schedule + real-time position.** The Defuser can't know what each hour needs. The
Expert can't see the clock, so the Defuser has to call the hours out at higher difficulty.

## Difficulty scaling

- **A1:** Slow clock (8 s/hour), weekdays only, morning only (7–11), and the Expert *can*
  see the clock.
- **A2:** Full day, weekends on, and the Expert **can't see the clock**. The Defuser has to
  say the time out loud: *"It is ten… now eleven."*
- **B1:** Fast clock (4 s/hour), Phase 2 on. The clock may skip ahead an hour once ("the
  clock jumps!"), and the Defuser has to say so.

## Build notes

- The ring window is the whole displayed hour, with a short grace period at the start, to be
  fair to network lag. A late press counts as a strike only after the next hour starts.
- The timetable is data. A teacher can paste the class's **real** timetable, which is a
  strong classroom hook.
- Draw "do one's homework" (notebook at home, with a lamp) so it's clearly different from
  "study" (a book at a desk).

## Open questions

- Is 4–5 s per hour fun-fast or panic-fast for A2? Playtest with a teacher slider.
