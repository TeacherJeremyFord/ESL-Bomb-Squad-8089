# sleep-mother: sleeping mother

- **Module:** `m07-midnight-snack`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m07-midnight-snack/sleep-mother.png`
- **Placeholder until done:** 😴
- **Source spec:** [`M07_build.md`](../../M07_build.md#art-gemini)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cartoon Taiwanese mother sleeping peacefully on her side under a blanket, eyes closed, a few small round bubbles above her head. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

Sleep bubbles stand in for "Zzz", because images must have no letters. Code places this sprite on top of a room background, so it must read clearly against a dim night room. Father and mother are always shown together in one room, so make them look like a pair (same blanket style).

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m07-midnight-snack/sleep-mother.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m07-midnight-snack/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "sleep-mother", "kind": "image", "path": "sleep-mother.png", "placeholder": "😴"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
