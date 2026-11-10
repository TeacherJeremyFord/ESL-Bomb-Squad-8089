# bg-room

- **Module:** `m03-weather-wardrobe`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m03-weather-wardrobe/bg-room.png`
- **Source spec:** [`M03_build.md`](../../M03_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A plain cozy cartoon bedroom wall seen from the front: soft light-green wall, wooden floor, an empty space on the left for a window and an empty space on the right for a person. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> Stars are code-drawn. The skies are scene backgrounds without sun or moon; code places those.
> The weather icons double as M05's weather chip.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m03-weather-wardrobe/bg-room.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m03-weather-wardrobe/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-room", "kind": "image", "path": "bg-room.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
