# bg-clinic: doctor's room background

- **Module:** `m11-monster-clinic`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m11-monster-clinic/bg-clinic.png`
- **Placeholder until done:** —
- **Source spec:** [`M11_build.md`](../../M11_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cozy cartoon doctor's room seen from the front: a pale mint-green wall, a white medicine cabinet on the left, a small window with yellow curtains on the right, an empty space in the middle where a patient will stand, a light wooden floor. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

Code draws the monster in the empty middle space, so keep it clear. The monster and the thermometer are drawn by code (their counts and numbers must be exact), so they are not art tasks.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m11-monster-clinic/bg-clinic.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m11-monster-clinic/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-clinic", "kind": "image", "path": "bg-clinic.png", "placeholder": "—"}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
