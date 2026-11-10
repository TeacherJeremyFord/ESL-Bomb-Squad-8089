# girl-happy: girl, happy (base of the set)

- **Module:** `m09-mood-plugs`
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/m09-mood-plugs/girl-happy.png`
- **Placeholder until done:** 👧
- **Source spec:** [`M09_build.md`](../../M09_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cartoon Taiwanese girl, about 10 years old, black hair in two ponytails, plain yellow T-shirt, shown from the waist up, facing forward, with a big open happy smile, hands down. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated colors. Plain pure white background, subject centered with empty white space around it. No text, no letters, no numbers, no shadow on the ground. Square image.
```

## Notes

Base of the `girl` feeling set. The other five feelings are edits of this picture, so it must be final first.

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
3. Save as `webclient/art/m09-mood-plugs/girl-happy.png`.
4. If there is any stray lettering, regenerate or edit it out.
5. Add or update this entry in `webclient/art/m09-mood-plugs/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "girl-happy", "kind": "image", "path": "girl-happy.png", "placeholder": "👧", "tags": ["who:girl", "feeling:happy"]}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
