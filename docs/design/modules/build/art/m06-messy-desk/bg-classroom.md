# bg-classroom

- **Module:** `m06-messy-desk`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m06-messy-desk/bg-classroom.png`
- **Source spec:** [`M06_build.md`](../../M06_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A quiet cartoon classroom corner seen from the front: pale beige wall, light wooden floor, a window with sky on the far left, a large empty space across the middle. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> Only furniture, holders and the room are pictures. They hold or stand under colored things,
> so keep them in **neutral colors** (light wood, gray, beige) that none of the 10 palette
> colors get lost against.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m06-messy-desk/bg-classroom.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m06-messy-desk/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-classroom", "kind": "image", "path": "bg-classroom.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
