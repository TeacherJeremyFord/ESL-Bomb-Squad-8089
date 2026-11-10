# baby-2: baby, none, item new-hat

- **Module:** `m01-family-photo`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m01-family-photo/baby-2.png`
- **Placeholder until done:** 👶
- **Source spec:** [`M01_build.md`](../../M01_build.md#art-gemini)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A full-body cartoon of a happy Taiwanese baby sitting up, smiling, facing forward, arms relaxed. The baby is wearing everyday clothes. The baby is wearing a shiny, bright, brand-new hat. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

Base sprite. Traits: look `baby`, build `—`, hair `—`, job `none`, item `new-hat`.

Its near-twin `baby-2t` is made by **editing this image**, so the face, clothes and pose must be final before you make the twin.

Babies have no build or hair trait in the game, so those tags are left out of the manifest.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m01-family-photo/baby-2.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m01-family-photo/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "baby-2", "kind": "image", "path": "baby-2.png", "placeholder": "👶", "tags": ["look:baby", "job:none", "item:new-hat", "twin:baby-2t"]}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
- [ ] Full body visible, standing (baby: sitting up), facing forward, arms relaxed, so all sprites line up on one floor line
- [ ] Traits read clearly at photo size: build (thin/fat), hair color, job prop, and item (new vs old, big vs small)
- [ ] Do NOT make the person tall or short: height is drawn by code scaling, so keep the figure filling the frame the same way as the other sprites
