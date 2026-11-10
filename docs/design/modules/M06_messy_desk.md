# M06: Messy Desk

**Target vocab (32):** book, ruler, marker, eraser, chair, pencil, desk, pen, notebook, computer, table, bookbag, key, box, bag, cup, in, on, under, next to, by, color, red, blue, yellow, green, black, white, pink, purple, brown, gray
**Off-list words needed:** move, put, wrong, right (= correct), must
**Difficulty:** A1–B1 · **Time:** 60–120 s · **Route:** vocab-first (School objects + Prepositions + Colors)
**Status:** Draft

## The hook

The bomb belongs to a very tidy owner. If anything on the desk is in the wrong place, it goes
off. The Defuser sees a messy desk scene. The Expert has the owner's **Clean Desk Rules**.
Together they find what's wrong and move it, without moving anything that was already right.

## Inspiration

Arrangement and placement puzzles (put X in the right state), mixed with
describe-the-scene info gaps. Each step is short (describe, check, move), so it rewards
precise language over speed.

## Defuser view

A drag-and-drop scene:

- **Furniture and holders (fixed):** desk, chair, table, computer, box, bag, bookbag, cup.
- **Small things (movable), 5–8 of them:** pens, pencils, markers, rulers, erasers, a book, a
  notebook, a key. **Each has a color** from the 10-color palette (red, blue, yellow, green,
  black, white, pink, purple, brown, gray).
- Each small thing sits **in** / **on** / **under** / **next to** a holder or a piece of furniture.
- A **CHECK** button. Pressing it with any rule unmet is a strike, so the team should only
  check when they're sure.

## Expert manual

The serial's **last digit** picks a page. Each page has 5–6 rules:

> **Page 3 (serial ends in 3 or 8)**
> 1. The red pen is in the cup.
> 2. The key is under the book.
> 3. All the markers are in the box.
> 4. The notebook is on the desk, next to the computer.
> 5. Nothing is on the chair.
> 6. The gray eraser is by the pink pencil.

> **How to read the rules**
> *By* and *next to* are the same.
> If the rule says *all*, look for every thing of that kind and every color.
> If a thing is not in the rules, it can be in any place. Do not move it.

## Solving it

The Defuser has to **report locations accurately**, and the Expert has to **check them
against the rules**:

> **D:** The red pen is on the table.
> **E:** No! The red pen is *in the cup*. Move it.

Built-in traps:

- **Color twins:** a red pen *and* a pink pen, or a purple and a blue marker. Moving the wrong
  twin breaks another rule.
- **"All" rules:** three markers in three colors, so "all the markers in the box" means three
  moves.
- **"Don't touch" items:** things not in the rules. A nervous Defuser may tidy them anyway.
  That isn't a strike, but it costs time, and it can block another rule ("nothing is on the
  chair").
- **Synonym check:** "by" and "next to" mean the same thing, and both appear on purpose.

## Example round

> **E:** Tell me the key. Where is the key?
> **D:** The key is… next to the bag.
> **E:** It must be under the book. Where is the book?
> **D:** On the chair.
> **E:** On the chair? Nothing is on the chair! Move the book to the desk, then the key under it.
> **D:** OK… book on desk… key under book.
> **E:** The gray eraser?
> **D:** There are two erasers. Gray and… white. Gray is in the bookbag.
> **E:** Gray eraser by the pink pencil.

## Information gap

✅ **Serial-picked hidden rules.** The scene doesn't hint at which arrangement is "right".
The Defuser could tidy it in a hundred ways, and only one passes.

## Difficulty scaling

- **A1:** 3 small things, 2 rules, only *in* and *on*, 4 colors.
- **A2:** 5 things, 4 rules, add *under* and *next to*, color twins on.
- **B1:** 8 things, 6 rules, *by* = *next to*, "all" rules, "nothing is on" rules, full
  10-color palette.

## Build notes

- Represent the scene as `(item, color, relation, anchor)` tuples. Rules use the same shape,
  so CHECK is a simple set comparison.
- The scene generator starts from a solved state and applies 2–4 "messes". This keeps
  solutions short and always reachable.
- Drop zones need clear hit areas for *under* (below the furniture) and *next to* (beside
  it), especially on small phones.

## Open questions

- Should a Defuser be able to *ask* the Expert about the whole page? Making the Expert read
  everything aloud is good reading practice, but slow. At B1 it may be better to have the
  Expert drive item by item.
