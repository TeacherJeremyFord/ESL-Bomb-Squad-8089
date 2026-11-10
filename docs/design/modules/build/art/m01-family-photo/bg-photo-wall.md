# bg-photo-wall: living-room wall with the empty photo frame

- **Module:** `m01-family-photo`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m01-family-photo/bg-photo-wall.png`
- **Placeholder until done:** —
- **Source spec:** [`M01_build.md`](../../M01_build.md#art-gemini)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A warm cartoon living-room wall with soft cream wallpaper and a wide, empty wooden picture frame hanging in the middle (the inside of the frame is plain light blue and empty), a small plant on each side. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

The family sprites are placed inside the frame by code, up to 7 in a row, so keep the inside of the frame wide, plain and empty. The caption's brass plate and the frame numbers are drawn by code; don't add them.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m01-family-photo/bg-photo-wall.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m01-family-photo/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-photo-wall", "kind": "image", "path": "bg-photo-wall.png", "placeholder": "—"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
