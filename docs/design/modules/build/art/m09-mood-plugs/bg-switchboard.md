# bg-switchboard

- **Module:** `m09-mood-plugs`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m09-mood-plugs/bg-switchboard.png`
- **Source spec:** [`M09_build.md`](../../M09_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cartoon old-fashioned telephone switchboard panel seen from the front, warm wood frame, dark panel on the left, a big empty light-colored board on the right. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

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

1. Resize to **1024×768**.
2. Save as `webclient/art/m09-mood-plugs/bg-switchboard.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m09-mood-plugs/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-switchboard", "kind": "image", "path": "bg-switchboard.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
