# M02: Lunch Rush

**Target vocab (30):** breakfast, lunch, dinner, cake, sandwich, hot dog, pizza, hamburger, pork, rice, bread, chicken, ice cream, beef, egg, apple, banana, orange, milk, juice, water, tea, coffee, cup, eat, want, cook, a/an, how many, like
**Off-list words needed:** give, tray, order, light, press, first, hurry
**Difficulty:** A1–B1 · **Time:** 90–150 s · **Route:** vocab-first (Food + Fruits + Drinks)
**Status:** Draft (rev 2: rebuilt as overlapping shouted orders instead of a menu lookup)

## The hook

Three hungry bomb-robots are ordering at once. **The orders appear on the Expert's screen in
words.** The kitchen, with its food pictures and stove, is on the Defuser's side. The Expert
has to shout orders across, decide which customer is about to explode first, and keep an eye
on the stove through the Defuser. It's a kitchen in a panic.

## Inspiration

The Spaceteam family: instructions show up on *one* player's screen, but the controls that
carry them out are on the *other* player's screen, under steady time pressure. There's no
manual table to search. The skill is **juggling a stream** of short commands and choosing
what to do first.

## Defuser view

- **Three trays** with meal **pictures, no words:** sunrise (breakfast), high sun (lunch),
  moon (dinner).
- **Pantry:** 12 food **pictures, no labels** (from: cake, sandwich, hot dog, pizza,
  hamburger, pork, rice, bread, chicken, ice cream, beef, egg, apple, banana, orange).
- **Drink machine:** 5 picture taps (milk, juice, water, tea, coffee). One press pours one cup.
- **Stove:** raw pork, beef, chicken, egg and rice must be cooked. Each turns brown after 3 s
  and black (burned) after 8 s. Serving raw or burned food is a strike.
- **Bomb face:** shows a **diet light** (off / red / green / purple) that can change mid-round.
- A **SERVE** button on each tray.

## Expert screen

**The order queue:** up to three tickets, each with a shrinking time bar:

> 🟩 **LUNCH:** a hamburger, two apples, a cup of tea
> 🟨 **BREAKFAST:** an egg, bread, a cup of milk
> 🟥 **DINNER:** rice, chicken, a cup of water ← *almost out of time!*

**Diet rules** (short, always on screen). The Expert has to *ask* about the light, since only
the Defuser can see it:

> **Red light:** The bomb does not like beef or pork. Give chicken.
> **Green light:** The bomb wants ice cream, too.
> **Purple light:** The bomb only eats food you say with **AN**: an egg, an apple, an orange,
> an ice cream. Drinks are OK.

## Solving it

- The Expert picks which ticket to call first. **Red tickets first** is the obvious rule, but
  a ticket that needs cooking should be *started* early, even if it's not the most urgent.
- The Expert has to say the **meal word** so the Defuser picks the right tray: *"Dinner!
  The moon tray!"*
- The Defuser has to say what they're holding (*"Is this beef or pork?"*) and check counts
  (*"How many cups?"*).
- When the diet light changes mid-round, every unfinished ticket changes too. Someone has to
  notice and say so.
- A missed ticket (the time bar runs out) is a strike, and so is a wrong tray. Three served
  tickets defuse the module.

## Example round

> **E:** Dinner is red, hurry! Rice and chicken, cook them. A cup of water. The moon tray.
> **D:** Rice on the stove… chicken… this is chicken? The leg?
> **E:** Yes! What color is the bomb light?
> **D:** Purple!
> **E:** Oh no. Purple… only AN. Rice is not AN. Chicken is not AN. Dinner… a cup of water only?
> **D:** Water, moon tray, serve!
> **E:** Lunch: apples and a cup of tea. Not the hamburger.
> **D:** How many apples?
> **E:** Two apples. The sun tray.

## Information gap

✅ **Split across screens.** Orders are only on the Expert's side. Food, stove and diet light
are only on the Defuser's side. Neither can serve a ticket alone.

## Difficulty scaling

- **A1:** One ticket at a time, no stove, no diet light, 6 pantry items.
- **A2:** Two overlapping tickets, stove on, red/green lights.
- **B1:** Three overlapping tickets, purple light (a/an), quantities ("two cups"), and the
  light changes once mid-round.

## Build notes

- Draw milk and water with very different containers (a carton vs a glass), and let the
  Defuser describe them by color too.
- Tickets are generated from a teacher-editable food list. It fits the IMA-42 "data, not
  code" boundary.
- Tune ticket timers per tier. The fun is in nearly-too-much, not too-much.

## Open questions

- "an ice cream" is natural, but some teachers treat "ice cream" as uncountable. Drop it from
  the purple list if that causes arguments.
