# flower

- **Module:** `m10-gift-shop`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m10-gift-shop/flower.png`
- **Placeholder until done:** 🌸
- **Source spec:** [`M10_build.md`](../../M10_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
One red flower with a long green stem and two leaves. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

From the module's build spec:

> Price tags and the THANK YOU words are code. The recipients reuse M01's family sprites.
> The toys are shared with M08 (generate once). The flower is one stem, because quantities are
> shown by adding more.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m10-gift-shop/flower.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m10-gift-shop/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "flower", "kind": "image", "path": "flower.png", "placeholder": "🌸"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
