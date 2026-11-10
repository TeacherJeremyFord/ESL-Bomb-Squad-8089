# room-bedroom-window: bedroom at night, with window

- **Module:** `m07-midnight-snack`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m07-midnight-snack/room-bedroom-window.png`
- **Placeholder until done:** 🛏️
- **Source spec:** [`M07_build.md`](../../M07_build.md#art-gemini)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cozy cartoon child's bedroom at night, seen straight on from the doorway: the back wall with a bed on the left side, a small lamp, and a window on the upper right showing a dark blue night sky and a moon. The lower middle of the back wall is a wide empty plain wall area. Dim, calm night colors. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

All room backgrounds share one viewpoint: the back wall seen straight on. **Code draws the doors** (in exact palette colors) along the wide empty strip at the bottom-middle of the back wall, so that strip must stay plain. Don't draw any doors. Sleepers are drawn on top by code.

Make this one **before** `room-bedroom`, which is an edit of it.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m07-midnight-snack/room-bedroom-window.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m07-midnight-snack/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "room-bedroom-window", "kind": "image", "path": "room-bedroom-window.png", "placeholder": "🛏️"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
