# bg-kitchen

- **Module:** `m02-lunch-rush`
- **Type:** scene background, 1024×768 PNG
- **Save to:** `webclient/art/m02-lunch-rush/bg-kitchen.png`
- **Source spec:** [`M02_build.md`](../../M02_build.md#art-gemini-see-art_guidemd)

## Attach as reference image(s)

1. `webclient/art/_style/anchor.png` (the style anchor)

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A bright cartoon restaurant kitchen seen from the front: pale yellow tiled wall, a long wooden counter along the bottom, empty shelves on the left, an empty space in the middle and on the right. In the same art style as the attached reference image: flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors so characters placed on top stand out. No people, no animals, no text, no letters, no numbers. Wide 4:3 image.
```

## Notes

From the module's build spec:

> The diet light, stove timer rings, and burned look are code. Everything else is a picture.
> Milk and water must look very different (carton vs glass), and **beef and pork must be
> told apart at 96 px**: beef is a dark-red steak, pork is a pale-pink chop with a white fat rim
> and a bone.

## After generating

1. Resize to **1024×768**.
2. Save as `webclient/art/m02-lunch-rush/bg-kitchen.png`.
3. If there is any stray lettering, regenerate or edit it out.
4. Add or update this entry in `webclient/art/m02-lunch-rush/manifest.json` (asset-manifest-v1):

   ```json
   {"assetId": "bg-kitchen", "kind": "image", "path": "bg-kitchen.png", "placeholder": ""}
   ```

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)
