# M13: Teen Code

**Target vocab (400-list, 15):** thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety
**Off-list words needed:** press, code, lock, wrong, again, strong, start, end
**Difficulty:** A2 (Teen Code) and B1 (Teen Code: Twins), 400-list numbers · **Time:** 30–60 s · **Route:** puzzle-first (pronunciation drill)
**Status:** Built (`web/modules/m13-teen-code.jsx`, test `web/_tests/teenCode.js`)

This doc lives in `400/` because the 260-word tracker only accepts 260-list words.

## The hook

A pronunciation drill for **-teen vs. -ty** (*thirteen* vs. *thirty*). The Expert reads a
five-number code. The Defuser presses it on a keypad where **every -teen's -ty twin is always
present**. If the stress is wrong, the Defuser hears the wrong number and presses its twin.

## Defuser view

- **LOCK NUMBER** plate (the sync code).
- A display with five slots, filled in as the code is entered (`17 40 -- -- --`). The Defuser
  can read back what they pressed, which is speaking practice for them too.
- **A keypad with 15 buttons, digits only:** 13–19, 20, 30–90, every round. The layout is
  shuffled per round (seeded by the lock number).

## Expert manual

- Type in the lock number, then press SHOW.
- The code appears as **English words only**, numbered 1–5: *seventeen, forty, twenty, fourteen,
  thirteen*.
- Rules: say the numbers in order; one wrong number restarts the code; the stress tip:
  *-teen: say the end strong (thir-TEEN); -ty: say the start strong (THIR-ty).*

## Rules the game enforces

- Every code has **at least one -teen and at least one -ty** number. There are five numbers
  with no repeats, drawn from the 15 above.
- **Wrong press:** strike, and the display clears. The code starts again from number 1, so
  the Expert says the whole code again, which means more repetitions of the hard words.
- Five right presses in order: solved.

## Tiers

| Tier | Module id | Code rule |
|---|---|---|
| A2 | `teenCode` | at least one -teen and one -ty |
| B1 | `teenCodeTwins` | also at least one **full twin pair**: a -teen *and* its own -ty (e.g. 16 and 60) in the same code |

The lock number also carries the tier: even = A2, odd = Twins. Both tiers share one manual
page, so an Expert who opens the other tier's section still gets the right code.

## English lock

- The Expert sees **no digits** in the code. The Defuser sees **no words** on the keypad. The
  number has to cross by voice.
- This is a deliberate exception to the A1–A2 rule "put English words on the Defuser's
  buttons". Words there would let the Defuser match letters ("t-h-i-r-t-y") instead of
  hearing the stress.
- **Known bypass:** the Expert can say digits ("one, three"). That still needs the Expert to
  *read and understand* the English word, so it meets the minimum bar. Reading the word out
  loud is the easiest path, so most pairs will do that. The restart rule makes slow
  workarounds expensive.

## Variety check

| Opening move | Core action | Expert's job | Pressure | Serial |
|---|---|---|---|---|
| Expert reads the first number | press a dictated code | pronounce -teen/-ty stress | listening accuracy, restart on a wrong press | — |

Closest neighbor: the original **Number Keypad** (1–12; the Expert does a lookup and says two
numbers). Here there is no lookup. The whole module is the minimal pair.

## Decisions

- **No reverse phase.** Players swap Defuser and Expert between rounds, so everyone gets the
  speaking side.
- **Campaign:** A2 tier is in mission 4 "Number Day" (before the Big Button finale; timer raised
  from 5 to 7 minutes for the fourth module). The Twins tier is in free play only.
