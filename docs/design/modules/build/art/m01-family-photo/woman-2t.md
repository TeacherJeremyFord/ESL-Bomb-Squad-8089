# woman-2t: twin of woman-2 (job → nurse)

- **Module:** `m01-family-photo`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m01-family-photo/woman-2t.png`
- **Placeholder until done:** 👩
- **Source spec:** [`M01_build.md`](../../M01_build.md#art-gemini)
- **Make first:** [`woman-2.md`](woman-2.md)

## Attach as reference image(s)

1. `webclient/art/m01-family-photo/woman-2.png` (the finished base sprite, white-background version if you kept one)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
Edit the attached image. Change only this: Make her a nurse instead of a singer: remove the microphone, dress her in light-blue nurse clothes and a white nurse's cap with a small red heart on the front. Keep everything else exactly the same: same character, same face, same pose, same colors, same style, same white background.
```

## Notes

Near-twin of `woman-2`. It must differ in **exactly one** trait: job → `nurse`. The puzzle depends on students spotting this one difference, and the game's test checks that twins differ in exactly one trait.

Put the result side by side with `woman-2.png`. If anything besides the requested change moved (face, clothes, pose, colors), try again.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m01-family-photo/woman-2t.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m01-family-photo/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "woman-2t", "kind": "image", "path": "woman-2t.png", "placeholder": "👩", "tags": ["look:woman", "build:fat", "hair:brown", "job:nurse", "item:none", "twin:woman-2"]}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
- [ ] Full body visible, standing (baby: sitting up), facing forward, arms relaxed, so all sprites line up on one floor line
- [ ] Traits read clearly at photo size: build (thin/fat), hair color, job prop, and item (new vs old, big vs small)
- [ ] Do NOT make the person tall or short: height is drawn by code scaling, so keep the figure filling the frame the same way as the other sprites
- [ ] Only the job differs from `woman-2`; the difference is visible at photo size
