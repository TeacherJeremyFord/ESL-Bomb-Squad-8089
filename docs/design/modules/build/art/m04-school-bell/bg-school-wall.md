# bg-school-wall

- **Module:** `m04-school-bell`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m04-school-bell/bg-school-wall.png`
- **Source spec:** [`M04_build.md`](../../M04_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cartoon school hallway wall seen from the front: cream wall, a green stripe, a small bell on the wall top right, a large empty space in the middle. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> The clock, its digits, and the **math (1+2), Chinese (中) and English (ABC) buttons are drawn
> by code** (they are text, ART_GUIDE rule 2). Draw *do my homework* (a notebook at home under a
> lamp) clearly different from *study* (an open book on a school desk).

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m04-school-bell/bg-school-wall.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m04-school-bell/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-school-wall", "kind": "image", "path": "bg-school-wall.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
