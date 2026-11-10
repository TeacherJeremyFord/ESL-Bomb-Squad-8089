# guest-girl-3

- **Module:** `m08-mystery-guest`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m08-mystery-guest/guest-girl-3.png`
- **Placeholder until done:** 👧
- **Source spec:** [`M08_build.md`](../../M08_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A full-body cartoon Taiwanese girl, about 10 years old, short brown bob hair with a yellow hairband, wearing a purple shirt and skirt, standing, facing forward, empty open hands. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

From the module's build spec:

> Name tags and the heart bubble are code. Guests are plain kids in party clothes, all the
> same size and pose, with **empty hands** (the toy is placed by code in the hand spot). The toys
> are shared with M10: generate them once.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m08-mystery-guest/guest-girl-3.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m08-mystery-guest/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "guest-girl-3", "kind": "image", "path": "guest-girl-3.png", "placeholder": "👧"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
