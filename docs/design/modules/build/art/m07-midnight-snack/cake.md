# cake: the midnight-snack cake

- **Module:** `m07-midnight-snack`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m07-midnight-snack/cake.png`
- **Placeholder until done:** 🍰
- **Source spec:** [`M07_build.md`](../../M07_build.md#art-gemini)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A round chocolate cake with white cream on top, on a white plate. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

Shown on the kitchen table (tap to take it) and as a small badge in the corner while carried, so it must also read at badge size (about 48 px).

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m07-midnight-snack/cake.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m07-midnight-snack/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "cake", "kind": "image", "path": "cake.png", "placeholder": "🍰"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
