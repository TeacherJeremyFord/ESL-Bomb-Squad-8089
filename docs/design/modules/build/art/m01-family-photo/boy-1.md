# boy-1: boy, student, item new-bookbag

- **Module:** `m01-family-photo`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m01-family-photo/boy-1.png`
- **Placeholder until done:** 👦
- **Source spec:** [`M01_build.md`](../../M01_build.md#art-gemini)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A full-body cartoon of a Taiwanese boy, about 10 years old, standing and smiling, facing forward, arms relaxed. He is clearly slim and thin. He has short black hair. He is wearing a simple school uniform. He is wearing a shiny, bright, brand-new bookbag on the back. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

Base sprite. Traits: look `boy`, build `thin`, hair `black`, job `student`, item `new-bookbag`.

Its near-twin `boy-1t` is made by **editing this image**, so the face, clothes and pose must be final before you make the twin.

Hair length (short) isn't a game trait; it was chosen here. Hair **color** is a trait and must be unmistakable.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m01-family-photo/boy-1.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m01-family-photo/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "boy-1", "kind": "image", "path": "boy-1.png", "placeholder": "👦", "tags": ["look:boy", "build:thin", "hair:black", "job:student", "item:new-bookbag", "twin:boy-1t"]}
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
