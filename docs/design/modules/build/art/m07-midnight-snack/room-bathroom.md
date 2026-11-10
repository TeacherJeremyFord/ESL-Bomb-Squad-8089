# room-bathroom: bathroom at night, no window

- **Module:** `m07-midnight-snack`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m07-midnight-snack/room-bathroom.png`
- **Placeholder until done:** 🛁
- **Source spec:** [`M07_build.md`](../../M07_build.md#art-gemini)
- **Make first:** [`room-bathroom-window.md`](room-bathroom-window.md)

## Attach as reference image(s)

1. `webclient/art/m07-midnight-snack/room-bathroom-window.png` (the finished window version)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
Edit the attached image. Change only this: Remove the window and fill that part with plain wall that matches the rest. Change nothing else. Keep everything else exactly the same: same room, same furniture, same viewpoint, same colors, same style.
```

## Notes

All room backgrounds share one viewpoint: the back wall seen straight on. **Code draws the doors** (in exact palette colors) along the wide empty strip at the bottom-middle of the back wall, so that strip must stay plain. Don't draw any doors. Sleepers are drawn on top by code.

Window and no-window rooms must match exactly apart from the window: the window is one of the clues players use to tell rooms apart. Compare side by side.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m07-midnight-snack/room-bathroom.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m07-midnight-snack/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "room-bathroom", "kind": "image", "path": "room-bathroom.png", "placeholder": "🛁"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
