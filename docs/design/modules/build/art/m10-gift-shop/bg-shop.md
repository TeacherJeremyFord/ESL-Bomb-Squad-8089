# bg-shop

- **Module:** `m10-gift-shop`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m10-gift-shop/bg-shop.png`
- **Source spec:** [`M10_build.md`](../../M10_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cheerful cartoon gift shop seen from the front: warm pink wall, two empty wooden shelves on the left, an empty counter on the right, a big empty space in the middle. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> Price tags and the THANK YOU words are code. The recipients reuse M01's family sprites.
> The toys are shared with M08 (generate once). The flower is one stem, because quantities are
> shown by adding more.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m10-gift-shop/bg-shop.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m10-gift-shop/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-shop", "kind": "image", "path": "bg-shop.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
