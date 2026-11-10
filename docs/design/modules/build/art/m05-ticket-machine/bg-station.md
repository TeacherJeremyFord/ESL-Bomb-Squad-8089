# bg-station

- **Module:** `m05-ticket-machine`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m05-ticket-machine/bg-station.png`
- **Source spec:** [`M05_build.md`](../../M05_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cartoon train-station wall seen from the front: light gray tiles, a blue stripe, a big empty space in the middle for a ticket machine. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> The red X, the lights' frames, the printer and the whole Expert map are code. The weather chip
> reuses M03's `sun`, `wx-rainy` and `wx-windy`. Each place picture must say its place without a
> sign or writing: the bank is a building with a big gold coin, the bookstore shows books in the
> window, the library shows tall shelves.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m05-ticket-machine/bg-station.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m05-ticket-machine/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-station", "kind": "image", "path": "bg-station.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
