# M07: Midnight Snack

**Target vocab (25):** home, kitchen, bathroom, bedroom, living room, door, window, night, sleep, go to bed, walk, go, there, where, at, baby, dog, cat, cake, father, mother, red, blue, green, yellow
**Off-list words needed:** through, wake up, back, room, quiet
**Difficulty:** A2–B1 · **Time:** 90–150 s · **Route:** puzzle-first (blind maze), then words fitted to it
**Status:** Draft

## The hook

It's night at home. The bomb wants **cake** from the kitchen, and you have to sneak there and
back to bed **without waking anyone up**. The Defuser only sees the room they are in. The
Expert has the floor plan and knows who is sleeping where, but can't see where the Defuser is.
The first problem is working out where you are at all.

## Inspiration

Blind-navigation co-op (one player sees the map, the other only their surroundings) crossed
with stealth. It's a maze, but you don't start out knowing where you are, so the first job is
*localization by description*. No left/right/up/down: those words are off-list, so movement
is by **colored doors**.

## Defuser view

- A **first-person room picture**: furniture shows the room type (bed = bedroom, bath =
  bathroom, sofa and TV = living room, fridge and stove = kitchen). There are several
  bedrooms and bathrooms, so the room type alone doesn't say *which* room.
- **Window:** there or not there; moon visible or not.
- **Sleepers** (sometimes): father, mother, the baby, the dog, the cat, curled up with a
  "Zzz".
- **Doors:** 1–3 doors, each a different **color** (red, blue, green, yellow). Tapping a door
  walks through it.
- **Noise meter:** fills when you walk past or into a sleeper. Full = a strike, and the meter
  resets.
- In the kitchen, a **cake** to tap. Once you're carrying it, a cake icon shows at the bottom.
- In your own bedroom, a **GO TO BED** button (only works while carrying the cake).

## Expert manual

**The floor plan** (shown directly on the Expert's screen, a new house every round) is a
picture of 7–9 rooms. Each room has a name and a
number, with door colors marked on the walls between rooms. **Everything on the plan is an
English word, with no furniture or people icons.** The Expert has to read *bathroom* and
*baby* to know what is where, while the Defuser sees only pictures:

```
 [1 Bedroom — YOU]   red   [2 Bathroom]   blue  [3 Bedroom — father, mother]
        green                  yellow                    green
 [4 Living room — dog]  blue  [5 Kitchen — CAKE]  red  [6 Bathroom, window]
        yellow                                          blue
 [7 Bedroom — baby, window]   red   [8 Living room — cat]
```

**Rules:**
> 1. At night, everyone is sleeping. Do not walk **into** a room where the baby is sleeping.
> 2. You can walk into a room with the dog or the cat **one** time. Two times, and it wakes up.
> 3. You can walk into a room with father or mother, but not two times.
> 4. Take the cake. Then go back to your bedroom and go to bed.

**Where am I?** At the start, the Defuser is *not* always in room 1. Ask:
> *Where are you? What is in the room? Is there a window? What color are the doors?*

## Solving it

1. **Localize:** D: *"Bathroom. There is a window. Two doors, red and blue."* → E: *"Room 6."*
2. **Plan:** E traces a path to the kitchen that avoids the baby and doesn't revisit pets or
   parents. Then a path back to the YOU bedroom.
3. **Navigate:** E: *"Walk through the red door."* D: *"Kitchen! There is a cake."*
4. **Confirm each step:** a careful Expert asks *"What room is it?"* after every door, and
   catches mistakes before they cost strikes.

The plan has to cover **both ways**. The easy way to the kitchen might pass the dog, and then
the way back can't.

## Example round

> **E:** Where are you?
> **D:** A bedroom. There is a baby. Sleeping. And a window.
> **E:** Room seven! Very bad. Go out. What color are the doors?
> **D:** Yellow and red.
> **E:** Red door. Go.
> **D:** A cat. Sleeping. Living room.
> **E:** Room eight. One time is OK. Do not come back here. What color are the doors?
> **D:** Red… and blue.
> **E:** Blue door.
> **D:** A bathroom. There is a window.
> **E:** Room six. Now the red door. The kitchen!
> **D:** Kitchen! There is a cake. I have it.
> **E:** Now go back… not red, not the cat two times. Walk through the yellow door.
> **D:** A bathroom. No window.
> **E:** Room two. Red door. Your bedroom!
> **D:** Go to bed!

*(The way back avoids room 8, because a second visit wakes the cat. That's the "plan both
ways" lesson.)*

## Information gap

✅ **Hidden map + position dependency.** The Defuser can't see the plan. The Expert can't see
the room. Every move needs both halves.

## Difficulty scaling

- **A2:** 5 rooms, start in room 1, one sleeper (the dog), no return trip (the cake defuses
  it).
- **B1:** 7–9 rooms, random start (localization needed), baby and pets, return trip required.
- **B1+:** two rooms that look identical (same type, window and door colors), so the Defuser
  has to try a door and describe the next room to tell them apart.

## Build notes

- Generate the house as a graph with colored edges. Ensure each room's door colors are
  unique *within that room*, so "the red door" is never ambiguous.
- Validate solvability with search over state (room, has_cake, visit counts). Reject boards
  with no solution, and reject boards where the shortest solution is trivial.
- Audio sells it: footsteps, a creaky door, a snore that changes as the noise meter fills.
  Cheap to add, and big for tension.

## Open questions

- Should B1 boards *guarantee* at least one dead end, to force planning, or is that
  frustrating?
- Starting the Defuser inside the baby's room (as in the example) is allowed, because rule 1
  only forbids walking *into* it. Is that clear enough to students?
