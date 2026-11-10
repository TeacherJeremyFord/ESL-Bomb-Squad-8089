# an-lion

- **Module:** `m12-animal-race-day`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m12-animal-race-day/an-lion.png`
- **Placeholder until done:** 🦁
- **Source spec:** [`M12_build.md`](../../M12_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cartoon lion with a big mane walking to the right, side view. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

After the picture is final, set its `badge:x,y` tag in the manifest to a point on the animal's chest (pixels in the 512×512 image). Code pins the team badge there.

From the module's build spec:

> The team badge colors and the NOT light are code. **The action pictures are the riskiest art**
> (design build note): make them first and check that walk, jog and run are told apart at a
> glance. Animals are drawn walking to the right, side view, all at a similar size, with no
> clothes (the team badge is pinned on by code). The fish walks in a small bowl on little legs
> (design: "fish in a bowl"). Set each animal's `badge:x,y` tag to a point on its chest after
> the picture is final.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m12-animal-race-day/an-lion.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m12-animal-race-day/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "an-lion", "kind": "image", "path": "an-lion.png", "placeholder": "🦁", "tags": ["badge:TODO"]}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
