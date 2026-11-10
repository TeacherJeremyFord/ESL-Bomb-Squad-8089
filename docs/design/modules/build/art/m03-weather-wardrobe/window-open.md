# window-open

- **Module:** `m03-weather-wardrobe`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m03-weather-wardrobe/window-open.png`
- **Placeholder until done:** 🪟
- **Source spec:** [`M03_build.md`](../../M03_build.md#art-gemini-see-art_guidemd)
- **Make first:** [`window-closed.md`](window-closed.md)

## Attach as reference image(s)

1. `webclient/art/m03-weather-wardrobe/window-closed.png` (the finished `window-closed`)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
Edit the attached image. Change only this: Swing both window panes open outward. Keep the frame the same. Keep everything else exactly the same: same object, same size, same angle, same style, same white background.
```

## Notes

This is an **edit** of `window-closed`. Compare side by side: only the requested change may differ.

From the module's build spec:

> Stars are code-drawn. The skies are scene backgrounds without sun or moon; code places those.
> The weather icons double as M05's weather chip.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m03-weather-wardrobe/window-open.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m03-weather-wardrobe/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "window-open", "kind": "image", "path": "window-open.png", "placeholder": "🪟"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
