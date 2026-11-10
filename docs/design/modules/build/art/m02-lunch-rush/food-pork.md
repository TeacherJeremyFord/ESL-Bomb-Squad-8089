# food-pork

- **Module:** `m02-lunch-rush`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m02-lunch-rush/food-pork.png`
- **Placeholder until done:** 🥓
- **Source spec:** [`M02_build.md`](../../M02_build.md#art-gemini-see-art_guidemd)
- **Make first:** [`food-pork-raw.md`](food-pork-raw.md)

## Attach as reference image(s)

1. `webclient/art/m02-lunch-rush/food-pork-raw.png` (the finished `food-pork-raw`)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
Edit the attached image. Change only this: Make the pork chop cooked: golden brown on top, with grill lines. Keep the shape, the fat rim and the bone. Keep everything else exactly the same: same object, same size, same angle, same style, same white background.
```

## Notes

This is an **edit** of `food-pork-raw`. Compare side by side: only the requested change may differ.

From the module's build spec:

> The diet light, stove timer rings, and burned look are code. Everything else is a picture.
> Milk and water must look very different (carton vs glass), and **beef and pork must be
> told apart at 96 px**: beef is a dark-red steak, pork is a pale-pink chop with a white fat rim
> and a bone.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m02-lunch-rush/food-pork.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m02-lunch-rush/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "food-pork", "kind": "image", "path": "food-pork.png", "placeholder": "🥓"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
