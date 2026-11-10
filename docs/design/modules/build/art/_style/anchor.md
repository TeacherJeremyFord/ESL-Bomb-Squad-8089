# anchor: Style anchor (make this before anything else)

- **Module:** shared (all modules)
- **Type:** sprite / object, 512×512 PNG, transparent background
- **Save to:** `webclient/art/_style/anchor.png`
- **Source spec:** [`ART_GUIDE.md`](../../ART_GUIDE.md#the-style-anchor-make-this-first)

## Attach as reference image(s)

1. None. This is the image every other asset uses as its reference.

## Prompt

Send this to Gemini (Nano Banana) exactly as written:

```text
A cheerful cartoon illustration for a children's classroom game: a friendly little round robot holding a red wire, standing on a plain white background. Flat colors with soft simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated but not neon colors, big expressive eyes. Centered, full body visible, lots of empty white space around it. No text, no letters, no numbers, no background scenery, no shadow on the ground. Square image.
```

## Notes

Generate several, pick the best one, and keep the white background in a copy as well (`anchor-white.png`). **Every other art task attaches this image**, so get it approved before starting the module art.

## After generating

1. Remove the white background with a background-removal tool and save as a transparent PNG. Don't rely on the model to produce transparency.
2. Resize to **512×512**.
3. Save as `webclient/art/_style/anchor.png`.
4. If there is any stray lettering, regenerate or edit it out.

## Review checklist

- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)
