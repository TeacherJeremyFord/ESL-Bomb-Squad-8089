# food-beef

- **Module:** `m02-lunch-rush`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m02-lunch-rush/food-beef.png`
- **Placeholder until done:** 🥩
- **Source spec:** [`M02_build.md`](../../M02_build.md#art-gemini-see-art_guidemd)
- **Make first:** [`food-beef-raw.md`](food-beef-raw.md)

## Attach as reference image(s)

1. `webclient/art/m02-lunch-rush/food-beef-raw.png` (the finished `food-beef-raw`)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
Edit the attached image. Change only this: Make the steak cooked: dark brown, with grill lines. Keep the shape. Keep everything else exactly the same: same object, same size, same angle, same style, same white background.
```

## Notes

This is an **edit** of `food-beef-raw`. Compare side by side: only the requested change may differ.

From the module's build spec:

> The diet light, stove timer rings, and burned look are code. Everything else is a picture.
> Milk and water must look very different (carton vs glass), and **beef and pork must be
> told apart at 96 px**: beef is a dark-red steak, pork is a pale-pink chop with a white fat rim
> and a bone.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m02-lunch-rush/food-beef.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m02-lunch-rush/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "food-beef", "kind": "image", "path": "food-beef.png", "placeholder": "🥩"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
