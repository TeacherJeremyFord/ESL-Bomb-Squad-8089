# Art Tasks

One file per image. Each file is a self-contained brief for an agent (or a person) using
Gemini's image model (Nano Banana): the full prompt with the style text already filled in,
which reference image to attach, where to save the result, the manifest entry, and a review
checklist. The shared rules behind them are in [`../ART_GUIDE.md`](../ART_GUIDE.md).

## Order

1. **[`_style/anchor.md`](_style/anchor.md)** first. Every other task attaches the anchor image,
   so get it approved before anything else.
2. Then any module. Inside a module, follow its README order: some assets are **edits** of
   another asset (M01 twins, M07 no-window rooms, M09 feelings, cooked foods) and list it under "Make first".

## Modules

| Module | Assets |
|---|---|
| [M01 Family Photo](m01-family-photo/README.md) | 29 |
| [M02 Lunch Rush](m02-lunch-rush/README.md) | 31 |
| [M03 Weather Wardrobe](m03-weather-wardrobe/README.md) | 32 |
| [M04 School Bell](m04-school-bell/README.md) | 13 |
| [M05 Ticket Machine](m05-ticket-machine/README.md) | 22 |
| [M06 Messy Desk](m06-messy-desk/README.md) | 9 |
| [M07 Midnight Snack](m07-midnight-snack/README.md) | 14 |
| [M08 Mystery Guest](m08-mystery-guest/README.md) | 20 |
| [M09 Mood Plugs](m09-mood-plugs/README.md) | 49 |
| [M10 Gift Shop](m10-gift-shop/README.md) | 12 |
| [M11 Monster Clinic](m11-monster-clinic/README.md) | 6 |
| [M12 Animal Race Day](m12-animal-race-day/README.md) | 23 |

**Total: 261 images** (including the anchor).

## Regenerating

These files are generated, so don't edit them by hand. M02–M06, M08–M10 and M12 come from the
Art tables in their build specs (`../Mxx_build.md`); M01, M07 and M11 are listed in the
script. After changing a spec's art, run:

```bash
python docs/design/modules/build/gen_art_tasks.py
```

## Two hard rules (from ART_GUIDE)

1. Never rely on a generated image for an exact **count**, any **text**, or a color that
   carries **information**. Those are drawn by code. That's why the M11 monster, M07 doors, M06 small things,
   M01 frame numbers, M03 stars and M04 clock have no art tasks.
2. **No text in any image.** Regenerate or edit out stray lettering.
