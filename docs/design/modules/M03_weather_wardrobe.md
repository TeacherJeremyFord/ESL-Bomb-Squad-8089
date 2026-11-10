# M03: Weather Wardrobe

**Target vocab (32):** hot, cold, warm, cool, rainy, sunny, cloudy, windy, spring, summer, fall, winter, sun, moon, star, day, night, jacket, coat, shirt, T-shirt, jeans, dress, shorts, skirt, pants, shoes, socks, wear, fan, window, may
**Off-list words needed:** put on, take off, open, close, tree, radio
**Difficulty:** A1–B1 · **Time:** 60–120 s · **Route:** vocab-first (Weather + Seasons + Clothing)
**Status:** Draft (rev 2: the weather changes mid-round; serial table removed)

## The hook

The bomb has a little mannequin by a window, and it only stops ticking when the mannequin is
**dressed right for the weather outside**. The Defuser can see the sky but doesn't know the
dress code. The Expert has the dress code but is stuck indoors with no window.

## Inspiration

"Dress-up for conditions" puzzles, plus the **hazard** idea from Defuse or Lose (a storm or
fallout changes how a module behaves) and Boom Bureau's mishaps. Here **the weather itself
changes while you are working**. The first outfit is only half the puzzle. The real test is
noticing the change and working out what to swap.

## Defuser view

- **Window:** a sky scene. It is either **day** (the sun is out or behind clouds) or **night**
  (the moon, with 0–5 stars). Weather overlays: sunny, cloudy, rainy, windy (blowing leaves).
- **Tree outside:** shows the **season**: flowers (spring), full green (summer), orange and
  brown leaves (fall), snow (winter).
- **Thermometer:** a picture scale with a face: sweating (hot), smiling (warm), neutral (cool),
  shivering (cold). No numbers at A1–A2.
- **Little radio** (B1 only): either silent, or shows a cloud with a "?" on it (the "may rain"
  forecast).
- **Closet:** 11 clothing pictures (jacket, coat, shirt, T-shirt, jeans, dress, shorts, skirt,
  pants, shoes, socks). Drag them onto the mannequin, and tap to take one off.
- **Fan switch** and **window switch** (open/closed).
- **DONE** button.

## Expert manual

**Step 1. Ask: Is it day or night?**
At night, go to Step 4.

**Step 2. Ask: What season is it? What is the weather?**

| | Sunny | Cloudy | Rainy | Windy |
|---|---|---|---|---|
| **Spring** | shirt, skirt, shoes | shirt, jeans, shoes | jacket, jeans, shoes | jacket, pants, socks, shoes |
| **Summer** | T-shirt, shorts | T-shirt, skirt | T-shirt, shorts, shoes | dress, shoes |
| **Fall** | shirt, jeans, socks, shoes | jacket, pants, shoes | coat, jeans, shoes | jacket, jeans, socks, shoes |
| **Winter** | coat, pants, socks, shoes | coat, jeans, socks, shoes | coat, pants, socks, shoes | coat, jacket, pants, socks, shoes |

**Step 3. Ask: Is it hot or cold?**
> If it is **hot**, open the window and turn on the fan.
> If it is **warm**, open the window. Do not turn on the fan.
> If it is **cool** or **cold**, the window and the fan are off.

**Step 4. Night rules.**
> At night, count the stars.
> If you can see **more than three stars**, it is not cold. Wear a T-shirt and shorts.
> If you can see **one, two or three stars, or no stars**, wear pants, socks and a jacket.
> At night, the fan is always off.

**Step 5 (B1). The radio.**
> If the radio says it **may** be rainy, wear a jacket, too.

## Solving it

The Defuser describes the scene. The Expert walks the steps and reads out the outfit, and
then the switch settings. The Defuser dresses the mannequin and presses DONE. A missing piece,
an extra piece, or a wrong switch is a strike. Strikes don't undress the mannequin, so a team
can fix things one piece at a time.

**Then the sky changes.** A few seconds after the first DONE, the weather shifts: clouds
roll in, rain starts, the sun goes down. The bomb chirps, but it does **not** say what
changed. The Defuser has to notice and describe the change, and the Expert works out the
**difference**: *"Take off the shorts. Put on the jeans and a jacket."* Re-dressing from
scratch works, but it's slow. Swapping only what changed is the fast, skilled way. The
module is defused after the second DONE.

The fun part is the **clothing near-pairs**: shirt vs T-shirt, jeans vs pants, shorts vs
skirt, jacket vs coat. The Defuser has to name exactly which one ("the long one, blue… jeans")
and the Expert has to insist on the right word.

## Example round

> **E:** Day or night?
> **D:** Day. The sun is… there are clouds.
> **E:** Cloudy. The tree?
> **D:** Orange and brown.
> **E:** Fall. Fall and cloudy: jacket, pants, shoes. Is it hot or cold?
> **D:** The face is… OK face.
> **E:** Hmm. Cool? Window off, fan off.
> **D:** Jacket… this is a coat or a jacket?
> **E:** Is it short or long?
> **D:** Short.
> **E:** Jacket.

## Information gap

✅ **Hidden lookup table + multi-condition (season × weather × temperature × day/night).**
Common sense ("it's cold, wear a coat") is deliberately not enough. The table has
non-obvious picks, like a dress when it's windy in summer, and the night rule ignores the
weather altogether.

## Difficulty scaling

- **A1:** Day only, season fixed to summer or winter, no thermometer step. 6 closet items.
- **A2:** All seasons and weather, thermometer step on, all 11 items.
- **A2+:** One mid-round weather change.
- **B1:** Night rules and the radio "may" rule on. Two changes, and one of them can be
  day → night, which switches to the star rule.

## Build notes

- Every outfit must be wearable on one mannequin (no shorts *and* pants), so validate the
  table data.
- The outfit is a set, not a sequence, so check it order-free.
- The sky renderer gets reused by M07 (night windows) and M12 (outdoor track).

## Open questions

- Should "may" stay this light? It is load-bearing (it changes the outfit), but only at B1.
  An alternative is a whole "forecast" stage that asks about tomorrow ("tomorrow" is
  off-list, though).
