# bg-party

- **Module:** `m08-mystery-guest`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m08-mystery-guest/bg-party.png`
- **Source spec:** [`M08_build.md`](../../M08_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cheerful cartoon party room seen from the front: pale purple wall with colorful paper garlands and balloons along the top, wooden floor, a big empty space in the middle. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> Name tags and the heart bubble are code. Guests are plain kids in party clothes, all the
> same size and pose, with **empty hands** (the toy is placed by code in the hand spot). The toys
> are shared with M10: generate them once.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m08-mystery-guest/bg-party.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m08-mystery-guest/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-party", "kind": "image", "path": "bg-party.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
