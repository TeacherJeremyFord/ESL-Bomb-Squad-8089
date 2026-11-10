# bg-track

- **Module:** `m12-animal-race-day`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m12-animal-race-day/bg-track.png`
- **Source spec:** [`M12_build.md`](../../M12_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cartoon sports track on a sunny day, seen from the side: a red running track across the bottom, green grass, a low white fence, blue sky, and an empty space in the middle of the track. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> The team badge colors and the NOT light are code. **The action pictures are the riskiest art**
> (design build note): make them first and check that walk, jog and run are told apart at a
> glance. Animals are drawn walking to the right, side view, all at a similar size, with no
> clothes (the team badge is pinned on by code). The fish walks in a small bowl on little legs
> (design: "fish in a bowl"). Set each animal's `badge:x,y` tag to a point on its chest after
> the picture is final.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m12-animal-race-day/bg-track.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m12-animal-race-day/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-track", "kind": "image", "path": "bg-track.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
