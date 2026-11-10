# M11: Monster Clinic

**Target vocab (17):** sick, fever, ear, eye, mouth, nose, leg, head, hair, hand, face, doctor, nurse, hot, cold, how many, have/has
**Off-list words needed:** touch, count, more than, ice pack, hot water bag, then
**Difficulty:** A1–B1 · **Time:** 60–90 s · **Route:** vocab-first (Health & Body Parts)
**Status:** Draft

## The hook

The bomb's mascot, a fuzzy little monster, is **sick**. The Defuser is the **nurse**, who can
see and touch the patient. The Expert is the **doctor**, who has the Doctor Book but no
patient. The monster has a weird number of eyes, ears and heads, so counting comes first.
Touch the right body parts in the right order, and it feels better.

## Inspiration

Silly-anatomy puzzles crossed with ordered-press modules. Monsters with random body plans
make "how many eyes?" a real question with surprising answers ("…five?"). That drills body
words and counting in one go.

## Defuser view

- **The monster:** procedurally assembled from parts:
  - **heads:** 1–3. Each head has a **face** with 1–5 **eyes**, 0–3 **ears**, 1 **nose**
    (sometimes 2), 1 **mouth**
  - **hair:** none, or a color
  - **hands:** 2–4. **Legs:** 2–6
- **Thermometer** in its mouth: a red top with sweat drops means **hot (fever)**, a blue top
  with shivering means **cold**, green means normal.
- **Tool tray:** 🧊 cold pack, ♨ hot water bag.
- Every body part is tappable. Tools are dragged onto a part.
- **Face color:** green with spots = sick. Any other color = not sick (a trap board).
- **OK** button: "I think this monster is not sick."
- A **heart meter** fills with each right step. A wrong touch is a strike.
- The screens are titled **NURSE** (Defuser) and **DOCTOR** (Expert).

## Expert manual

**Doctor Book**

> **Step 0. Is it sick?**
> A sick monster has a green face with spots. If the face is not green, it is **not sick**.
> Do not touch it! Press OK. *(1 in 6 boards is a not-sick trap.)*

> **Step 1. Is it hot or cold?**
> If it is hot, it has a fever. Put the cold pack on its head. *(If it has two heads, the
> head with more eyes.)*
> If it is cold, put the hot water bag on its legs. *(Any leg.)*
> If it is not hot and not cold, go to Step 2.

> **Step 2. How many heads does it have?**

| Heads | Touch, in this order |
|---|---|
| 1 | nose → mouth → a hand |
| 2 | an ear → an ear → a leg |
| 3 | the face with no ears → its nose → its mouth |

> **Step 3 (B1). How many eyes does it have?** *(all heads)*
> Now look at the bomb's serial number. Is that number in the serial?
> **Yes:** touch every eye one time.
> **No:** touch the hair. If it has no hair, touch its head two times.

## Solving it

0. Ask "Is it sick?" An eager nurse who starts touching a healthy monster gets a strike.
1. Ask the thermometer, then do the hot or cold treatment (or skip it).
2. Ask "how many heads?" and read the touch order.
3. At B1, ask "how many eyes?", then check whether that number appears in the serial. This
   is the module's only serial check, and it **compares a count on the monster with the
   serial's digits**, which no other module asks for.

The fun is in the **descriptions**. "The head with more eyes", "the face with no ears", and
"touch every eye" all need careful counting and clear words between the two players. The
monster's oddness ("it has four hands!") makes students laugh while it drills the words.

## Example round

> **E:** Is it hot or cold?
> **D:** Red… water on the face. Hot.
> **E:** A fever. The cold pack on the head. How many heads?
> **D:** Two heads.
> **E:** The head with more eyes.
> **D:** This head has three eyes, this head… one eye. Three. *(cold pack)*
> **E:** Two heads: an ear, an ear, a leg.
> **D:** Ear… ear… leg.
> **E:** How many eyes? All.
> **D:** Four.
> **E:** What is the serial?
> **D:** K, 4, 2, P, 9.
> **E:** Four is there! Touch every eye.

## Information gap

✅ **Hidden lookup + counting conditionals.** The Defuser sees the monster but has no idea
what treatment it needs. The Expert has the treatment but can't see the counts.

## Difficulty scaling

- **A1:** 1 head, no thermometer, 3-touch order only.
- **A2:** 1–2 heads, thermometer on.
- **B1:** 1–3 heads, the eye/serial rule on, "the face with no ears" style references.

## Build notes

- Monster parts are a sprite kit (heads, eye clusters, ears, limbs). It's cheap to make lots
  of variety from few assets.
- Make sure every reference resolves to one thing: "the head with more eyes" must never tie,
  and "the face with no ears" must be unique on 3-head monsters. Reroll boards that don't.
- "Touch an ear → an ear" means two *different* ears? Decide this (the proposal: any ear,
  repeats allowed), and make the manual say it.

## Open questions

- Would a "sneeze" event (the nurse must cover the monster's mouth in time) add fun pressure,
  or is it just noise?
