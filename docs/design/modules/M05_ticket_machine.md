# M05: Ticket Machine

**Target vocab (28):** car, bike, bus, train, taxi, on foot, MRT, plane, ship, boat, bank, library, zoo, farm, bookstore, park, home, school, lake, sea, Taiwan, from, to, by, go, walk, where, how
**Off-list words needed:** ticket, map, press, then, island, closed
**Difficulty:** A1–B2 · **Time:** 60–150 s · **Route:** vocab-first (Transportation + Places)
**Status:** Draft

## The hook

The bomb's timer is a **ticket machine**, and it only stops when someone buys a ticket for
the right route. The Defuser has the machine with its FROM and TO lights. The Expert has the
city map and its rules, but no machine. Routes can have two or three legs, and some ways of
getting around are closed today.

## Inspiration

Route-planning and navigation co-op, where one player holds the map and the other enters
commands, combined with transit-ticket UIs. A ticket is built leg by leg, so the Expert has to
narrate a journey in full sentences: *"From the bank, go to the library by MRT."*

## Defuser view

- **FROM light** and **TO light:** each shows a **place picture** (no words): home, school,
  bank, library, zoo, farm, bookstore, park, lake, sea, airport (B2), or a Taiwan-shaped icon
  (B2).
- **Transport buttons (10 icons):** car, bike, bus, train, taxi, on foot (footprints), MRT,
  plane, ship, boat.
- **Stop buttons:** the same place pictures as the lights, used for the end of each leg.
- **Closed board:** 0–2 transport icons with a red X today.
- **Weather chip** (reuses M03 art): sunny or rainy, plus windy at B2.
- The ticket printer shows the legs entered so far; an **X** button undoes the last leg.

## Expert manual

**The city map** is drawn as boxes and lines **labeled with English words only**: no
pictures of buildings or vehicles, so the Expert has to read *bank*, *library*, *MRT*.
Underneath it is this list of every line between two places and the ways you can travel it
(both directions):

| Line | Go by |
|---|---|
| home – school | bus, bike, on foot |
| home – bank | car, taxi |
| school – library | MRT |
| school – park | bus |
| library – bookstore | on foot |
| library – zoo | MRT |
| bank – park | MRT |
| park – zoo | bike, bus |
| zoo – farm | bus, taxi |
| farm – lake | boat |
| farm – sea | train |
| sea – the island *(B2)* | ship, plane |

**Rules:**
> 1. Ask: *Where do you go from? Where do you go to?*
> 2. Find the way on the map. Use the way with **the fewest stops**.
> 3. If two ways have the same stops, go by MRT or train first. They are fast.
> 4. Ask: *What is closed today?* Do not go by that.
> 5. If it is **rainy**, do not go by bike, and do not walk (no "on foot").
> 6. Tell the Defuser **how** to go: *"From the bank, go to the park by MRT."*

**B2 far trips (Taiwan page):**
> To go from Taiwan to the island, go by plane or by ship.
> If the weather chip is windy, the ship can not go. Go by plane.

## Solving it

1. D reads the lights as pictures: *"From… money building. To… animals, the zoo."*
2. E names them (*"Bank! The zoo."*) and finds the path: bank → park by MRT → zoo by bike.
3. E checks the closed board and the weather. If it's rainy, the bike is out, so the
   park → zoo leg goes by bus instead. If the bus is closed too, E has to find another route
   through the library.
4. E narrates each leg. D presses transport, then stop, and the printer shows the leg.
5. When the last leg ends at the TO place, the ticket prints. A wrong leg is a strike, and
   the leg is undone.

The closed board and the weather force **re-planning out loud**. That is where the most
English is produced: *"No bike. How do we go? By bus from school."*

## Example round

> **E:** Where do you go from?
> **D:** From… money. A money building.
> **E:** The bank! Where do you go to?
> **D:** Animals… the zoo.
> **E:** Bank, zoo. What is closed today?
> **D:** The taxi. And it is rainy.
> **E:** OK. From the bank, go to the park by MRT.
> **D:** MRT… park. *(prints)*
> **E:** From the park to the zoo… bike, no, it is rainy. Go by bus.
> **D:** Bus, zoo. Ticket!

## Information gap

✅ **Hidden map + conditional closures.** The Defuser has no idea how places connect. The
closures and the weather mean that even a memorized map isn't enough.

## Difficulty scaling

- **A1:** One leg, no closures. "From the park, go to the zoo by bike."
- **A2:** Two legs, one closure.
- **B1:** Up to three legs, weather on, two closures.
- **B2:** Far-trip page (Taiwan, plane, ship, the sea) and windy-day rule. A line can close
  **while the ticket is half-printed** ("The MRT is closed now!"), so the team re-plans from
  wherever they are.

## Build notes

- **The generator must never create an impossible route.** For example, closing the bus cuts
  the farm and the lake off completely, since zoo – farm is bus or taxi only and the taxi may
  also be closed. After applying closures and weather, run BFS on the remaining graph, and
  reroll if there is no path or the shortest path is longer than the tier's leg limit.
- The "fewest stops, then MRT/train" tie-break must give exactly one answer. Validate with
  the same BFS and reject boards that tie.
- The map is data. A teacher could swap in a real neighborhood map, such as the MRT around the
  school.

## Open questions

- "the island" and "airport" are off-list. Would "the other side of the sea" read better for
  the far-trip destination?
