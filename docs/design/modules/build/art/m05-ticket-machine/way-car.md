# way-car

- **Module:** `m05-ticket-machine`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m05-ticket-machine/way-car.png`
- **Placeholder until done:** 🚗
- **Source spec:** [`M05_build.md`](../../M05_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A small red family car seen from the side. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

From the module's build spec:

> The red X, the lights' frames, the printer and the whole Expert map are code. The weather chip
> reuses M03's `sun`, `wx-rainy` and `wx-windy`. Each place picture must say its place without a
> sign or writing: the bank is a building with a big gold coin, the bookstore shows books in the
> window, the library shows tall shelves.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m05-ticket-machine/way-car.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m05-ticket-machine/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "way-car", "kind": "image", "path": "way-car.png", "placeholder": "🚗"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
