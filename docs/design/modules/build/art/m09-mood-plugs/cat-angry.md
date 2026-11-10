# cat-angry: cat, angry

- **Module:** `m09-mood-plugs`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m09-mood-plugs/cat-angry.png`
- **Placeholder until done:** 🐱
- **Source spec:** [`M09_build.md`](../../M09_build.md#art-gemini-see-art_guidemd)
- **Make first:** [`cat-happy.md`](cat-happy.md)

## Attach as reference image(s)

1. `webclient/art/m09-mood-plugs/cat-happy.png` (the finished happy base)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
Edit the attached image. Change only this: Make the face angry: red face, frowning angry eyes, a little steam puffing from the head. No smile. Hands down. Keep everything else exactly the same: same character, same hair, same clothes, same body position, same colors, same style, same white background.
```

## Notes

Feeling edit of `cat-happy`. Only the face (and the hand, for fine/good/great) may change.

From the module's build spec:

> Every face is a **set of six** made by editing one base, so the character stays identical
> and only the feeling changes. Make the `happy` version first, then edit it into the other
> five. Feelings must match the Face Guide exactly, because the Defuser describes what they see
> and the Expert matches it: **angry** = red face, angry eyes, steam; **sad** = a tear; **fine**
> = a small flat smile with an OK hand sign; **good** = one thumbs up, normal eyes; **great** =
> star eyes *and* a thumbs up; **happy** = a big open smile, no hands. Good vs great is the
> riskiest pair (design build note): make the star eyes big.
>
> Subjects: `boy`, `girl`, `dog`, `cat`. Avatars (picked at join, used in portraits): `kid-1`
> … `kid-4`. That's 8 characters × 6 feelings = 48 pictures, named `<who>-<feeling>`.
>
> **Base prompts** (the happy version):
>
> **Feeling edits** (attach the `-happy` picture, use the ART_GUIDE edit prompt with this
> change):

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/m09-mood-plugs/cat-angry.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m09-mood-plugs/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "cat-angry", "kind": "image", "path": "cat-angry.png", "placeholder": "🐱", "tags": ["who:cat", "feeling:angry"]}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
- [ ] Matches the Face Guide description for this feeling, and is clearly different from the other five in the set
