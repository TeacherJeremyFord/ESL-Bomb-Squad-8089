# Pixel Art Guide

All new art is **SVGA-flavored pixel art**, drawn by code (`web/pixel.js`) — no image-generation model.
Older emoji/CSS art in other modules gets converted to this style later.

## Style

- **Look:** late-90s / early-2000s SVGA. Sprites ~48–72px, shown at 4x with `image-rendering: pixelated`.
- **Shading:** 4-tone ramps per color (highlight `3`, base `1`, shade `2`, deep shade `4`), light from the
  upper left, a dithered band between base and shade, a small dithered sheen.
- **Outline:** 1px dark (`K` = `#1b1424`). Parts drawn with `ring: true` get their own outline so they read as
  sitting in front of what's behind them.
- **Palette:** `PX.PALETTE` in `web/pixel.js`. Add colors there, not inline.

## Rules

1. **Gameplay features are placed by code, exactly.** Anything counted (eyes), colored as information (skin),
   or named in the manual (arm type) comes from the module's state, never from a fixed picture.
2. **No text in sprites.** Words stay in the UI, in English.
3. **Parts kits over one-off pictures.** Build characters from interchangeable parts with anchor points
   (Mister Potato Head style), stacked back to front, so parts are reused across every variant.
4. Every part a rule depends on must be readable at a glance at classroom distance on a Chromebook/iPad.

## Monster Lab (`web/sprites/monster.js`)

Layer order, back to front: horns → arms → legs → body → head → nose → mouth → eyes.

| Slot | Options | Decides the answer? |
|---|---|---|
| eyes (count) | 1–4 | yes |
| arms | tentacles, robot, furry | yes |
| color | purple, green, orange | yes |
| head | round, box, bean | no (decoration) |
| body | blob, tall, chubby | no |
| legs | stubby, long, bigfeet | no |
| eyeStyle | round, sleepy, lookup | no |
| mouth | smile, fangs, oh, grin | no |
| nose | none, dots, snout, button | no |
| horns | none, horns, antennae | no |

Bodies declare `shoulder` and `hip` anchors; heads declare `eyeY`, `nose`, `mouth`, `horn`. Adding a part means
adding one entry to its table — it then works with every other part. Preview every combination slot by slot at
`web/art-preview.html`.

## Color Wires (`web/sprites/wires.js`)

`PX.wire({ color, shape, ends, tone, cut, cutAt, gap, cutStyle })`. Only `color` decides the answer, and each color
has its own fixed 4-tone ramp (`tone` only nudges it lighter or darker). Everything else is picked at random per wire
so no two wires look the same: 10 bend shapes (`PX.wire.SHAPES`), 3 terminals (screw, nut, plug), and when cut, where
the cut is (`cutAt` 0.25–0.75), how wide it opens (`gap` 5–10) and how the ends look (snip, frayed, droop, curl).

## Symbols (`web/sprites/symbols.js`)

`PX.glyph(name)` — one-color Symbol Keypad marks (the manual's column table draws the same glyphs).
`PX.symbol(name)` — Symbol Panel pictures; reuses food, animal and toy sprites where they exist.
