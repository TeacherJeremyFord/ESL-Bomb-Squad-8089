# Art Guide: Generating Module Art with Gemini (Nano Banana)

How to make the pictures for M01–M12 with Gemini's image model ("Nano Banana") so they look
like **one game**. Each module's build spec lists its assets and gives a prompt for each.
This file holds the shared rules and the shared style text those prompts refer to.

## Two hard rules

1. **Never rely on a generated image for an exact count or for text.** Image models often get
   "exactly four eyes" or a written word slightly wrong, and these puzzles depend on counts
   and words being exact. Anything that is **counted** (eyes, legs, stars), **written**
   (labels, prices, name tags), or **colored as information** (door colors, wire colors) is
   drawn by code on top of the art, or drawn entirely by code. The build specs say which.
2. **No text in any image.** Every prompt includes "no text, no letters, no numbers". If a
   generated image has stray lettering, regenerate or edit it out.

## The style anchor (make this first)

Generate this once, pick the best result, and save it as `webclient/art/_style/anchor.png`.
**Attach it as a reference image to every later prompt.**

> A cheerful cartoon illustration for a children's classroom game: a friendly little round
> robot holding a red wire, standing on a plain white background. Flat colors with soft
> simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated
> but not neon colors, big expressive eyes. Centered, full body visible, lots of empty white
> space around it. No text, no letters, no numbers, no background scenery, no shadow on the
> ground. Square image.

## The shared style block

Every asset prompt in the build specs ends with `{STYLE}`. Paste this text in its place:

> In the same art style as the attached reference image: flat colors with soft simple
> shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated
> colors. Plain pure white background, subject centered with empty white space around it.
> No text, no letters, no numbers, no shadow on the ground. Square image.

For **scene backgrounds** (rooms, a clinic wall), use `{SCENE_STYLE}` instead:

> In the same art style as the attached reference image: flat colors with soft simple
> shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm colors
> so characters placed on top stand out. No people, no animals, no text, no letters, no
> numbers. Wide 4:3 image.

## Near-twins and variants: use editing, not new prompts

Several modules need **the same thing with one change** (the same man, but thin instead of
fat). Don't write a new prompt, because the face and clothes would come out different.
Instead, attach the finished image and ask Gemini to edit it:

> Edit the attached image. Change only this: **{the one change}**. Keep everything else
> exactly the same: same character, same face, same clothes, same pose, same colors, same
> style, same white background.

Check the result side by side with the original. If anything besides the requested change
moved, try again.

## After generating

1. **Remove the white background** with any background-removal tool, and save as a
   transparent PNG. Don't count on the model producing transparency itself.
2. **Size:** characters and objects 512×512, scene backgrounds 1024×768.
3. **Name** the file exactly as the build spec's asset id: `webclient/art/<module-id>/<assetId>.png`.
4. **Check at small size.** View it at 96×96 on an iPad. A student must recognize it
   instantly (is it beef or pork?). If not, regenerate with a more exaggerated, simpler
   design.
5. Add it to that module's `manifest.json` (asset-manifest-v1). Until an image exists, the
   game shows the manifest's `placeholder` emoji, so art never blocks building.

## Review checklist (per asset)

- [ ] Same outline color, line weight and shading as the anchor
- [ ] Recognizable at 96 px
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that a module counts (unless the spec says the count is fixed in the art)
- [ ] Looks right for a Taiwanese elementary classroom (food, transport, school things as students there know them)
- [ ] Transparent background (except scene backgrounds)
