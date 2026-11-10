"""Generate one art-task .md per asset into build/art/, from the build specs + ART_GUIDE.

M01, M07 and M11 assets are listed in this script; the other modules are parsed from the
"## Art" tables of their Mxx_build.md. Run from anywhere:

    python docs/design/modules/build/gen_art_tasks.py
"""
import json
import shutil
from pathlib import Path

OUT = Path(__file__).resolve().parent / "art"
if OUT.exists():
    shutil.rmtree(OUT)

STYLE = ("In the same art style as the attached reference image: flat colors with soft simple "
         "shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated "
         "colors. Plain pure white background, subject centered with empty white space around it. "
         "No text, no letters, no numbers, no shadow on the ground. Square image.")
SCENE_STYLE = ("In the same art style as the attached reference image: flat colors with soft simple "
               "shading, thick clean dark-brown outlines, rounded friendly shapes, bright but calm "
               "colors so characters placed on top stand out. No people, no animals, no text, no "
               "letters, no numbers. Wide 4:3 image.")
EDIT = ("Edit the attached image. Change only this: {change} Keep everything else exactly the "
        "same: same character, same face, {clothes}same pose, same colors, same style, same "
        "white background.")
SCENE_EDIT = ("Edit the attached image. Change only this: {change} Keep everything else exactly "
              "the same: same room, same furniture, same viewpoint, same colors, same style.")

ANCHOR_PROMPT = (
    "A cheerful cartoon illustration for a children's classroom game: a friendly little round "
    "robot holding a red wire, standing on a plain white background. Flat colors with soft "
    "simple shading, thick clean dark-brown outlines, rounded friendly shapes, bright saturated "
    "but not neon colors, big expressive eyes. Centered, full body visible, lots of empty white "
    "space around it. No text, no letters, no numbers, no background scenery, no shadow on the "
    "ground. Square image.")

CHECKLIST_SPRITE = """- [ ] Same outline color, line weight and shading as the style anchor
- [ ] Recognizable at 96×96 px (view it that small on an iPad-sized screen)
- [ ] No text, letters or numbers anywhere
- [ ] Nothing in the image that the module counts
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Transparent background (white removed cleanly, no white halo around the outline)"""
CHECKLIST_SCENE = """- [ ] Same outline color, line weight and shading as the style anchor
- [ ] No people, no animals, no text, letters or numbers anywhere
- [ ] Looks right for a Taiwanese elementary classroom
- [ ] Keeps the empty area the spec asks for (characters or code-drawn parts go there)
- [ ] Opaque background (scenes are NOT made transparent)"""


def task(module, asset_id, *, title, kind, placeholder, prompt, notes="", refs=None,
         depends=None, tags=None, extra_checks="", spec=None):
    """Write one asset task file."""
    scene = kind == "scene"
    size = "1024×768" if scene else "512×512"
    refs = refs or ["`webclient/art/_style/anchor.png` (the style anchor)"]
    out_path = f"webclient/art/{module}/{asset_id}.png" if module else "webclient/art/_style/anchor.png"
    lines = [f"# {asset_id}" + (f": {title}" if title != asset_id else ""), ""]
    lines += [
        f"- **Module:** `{module}`" if module else "- **Module:** shared (all modules)",
        f"- **Type:** {'scene background' if scene else 'sprite / object'}, {size} PNG"
        + ("" if scene else ", transparent background"),
        f"- **Save to:** `{out_path}`",
    ]
    if placeholder:
        lines.append(f"- **Placeholder until done:** {placeholder}")
    if spec:
        lines.append(f"- **Source spec:** {spec}")
    if depends:
        lines.append(f"- **Make first:** {depends}")
    lines += ["", "## Attach as reference image(s)", ""]
    lines += [f"{i}. {r}" for i, r in enumerate(refs, 1)]
    lines += ["", "## Prompt", "", "Send this to Gemini (Nano Banana) exactly as written:", "",
              "```text", prompt, "```", ""]
    if notes:
        lines += ["## Notes", "", notes.strip(), ""]
    lines += ["## After generating", ""]
    steps = []
    if not scene:
        steps.append("Remove the white background with a background-removal tool and save as a "
                     "transparent PNG. Don't rely on the model to produce transparency.")
    steps.append(f"Resize to **{size}**.")
    steps.append(f"Save as `{out_path}`.")
    steps.append("If there is any stray lettering, regenerate or edit it out.")
    if tags is not None:
        entry = {"assetId": asset_id, "kind": "image", "path": f"{asset_id}.png",
                 "placeholder": placeholder or ""}
        if tags:
            entry["tags"] = tags
        steps.append(f"Add or update this entry in `webclient/art/{module}/manifest.json` "
                     "(asset-manifest-v1):\n\n   ```json\n   " + json.dumps(entry, ensure_ascii=False)
                     + "\n   ```")
    lines += [f"{i}. {s}" for i, s in enumerate(steps, 1)]
    lines += ["", "## Review checklist", "", CHECKLIST_SCENE if scene else CHECKLIST_SPRITE]
    if extra_checks:
        lines.append(extra_checks.strip())
    lines.append("")
    folder = OUT / (module or "_style")
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{asset_id}.md").write_text("\n".join(lines))
    return asset_id


index = {}

# ---------------------------------------------------------------- style anchor
task(None, "anchor", title="Style anchor (make this before anything else)", kind="sprite",
     placeholder=None, prompt=ANCHOR_PROMPT, refs=["None. This is the image every other asset uses as its reference."],
     spec="[`ART_GUIDE.md`](../../ART_GUIDE.md#the-style-anchor-make-this-first)",
     notes="Generate several, pick the best one, and keep the white background in a copy as well "
           "(`anchor-white.png`). **Every other art task attaches this image**, so get it approved "
           "before starting the module art.")
index["_style"] = ["anchor"]

# ---------------------------------------------------------------- M01
M01 = "m01-family-photo"
M01_SPEC = "[`M01_build.md`](../../M01_build.md#art-gemini)"
LOOK = {
    "old-man": ("a kind Taiwanese grandfather with a wrinkled smiling face", "He", "👴"),
    "old-woman": ("a kind Taiwanese grandmother", "She", "👵"),
    "man": ("a Taiwanese father, about 40 years old", "He", "👨"),
    "woman": ("a Taiwanese mother, about 40 years old", "She", "👩"),
    "boy": ("a Taiwanese boy, about 10 years old", "He", "👦"),
    "girl": ("a Taiwanese girl, about 10 years old", "She", "👧"),
    "baby": ("a happy Taiwanese baby sitting up", "The baby", "👶"),
}
HAIR_LEN = {"old-man": "short", "old-woman": "short", "man": "short", "woman": "long",
            "boy": "short", "girl": "long"}
JOB = {
    "doctor": "wearing a white doctor's coat with a stethoscope around the neck",
    "nurse": "wearing light-blue nurse clothes and a white nurse's cap with a small red heart",
    "teacher": "holding a book in one hand and a piece of white chalk in the other",
    "student": "wearing a simple school uniform",
    "singer": "holding a microphone",
    "farmer": "wearing a wide straw hat and work clothes, holding a small garden hoe",
    "none": "wearing everyday clothes",
}
ITEM = {
    "none": None,
    "new-hat": "wearing a shiny, bright, brand-new hat",
    "old-hat": "wearing an old, faded hat with a patch on it",
    "new-bookbag": "wearing a shiny, bright, brand-new bookbag on the back",
    "old-bookbag": "wearing an old, faded bookbag with a patch on it on the back",
    "big-ball": "holding a very big ball",
    "small-ball": "holding a very small ball",
    "big-dog": "with a big dog sitting beside {them}",
    "small-dog": "with a tiny dog sitting beside {them}",
}
# base id, look, build, hair, job, item, twin id, twin trait, twin value, edit wording
CAST = [
    ("man-1", "man", "fat", "black", "doctor", "none", "man-1t", "build", "thin",
     "make him clearly slim and thin instead of fat."),
    ("man-2", "man", "thin", "brown", "farmer", "none", "man-2t", "hair", "black",
     "change his brown hair to black hair."),
    ("woman-1", "woman", "thin", "black", "teacher", "none", "woman-1t", "hair", "brown",
     "change her black hair to brown hair."),
    ("woman-2", "woman", "fat", "brown", "singer", "none", "woman-2t", "job", "nurse",
     "make her a nurse instead of a singer: remove the microphone, dress her in light-blue nurse "
     "clothes and a white nurse's cap with a small red heart on the front."),
    ("oldman-1", "old-man", "thin", "white", "farmer", "none", "oldman-1t", "hair", "gray",
     "change his white hair to gray hair."),
    ("oldman-2", "old-man", "fat", "gray", "none", "old-hat", "oldman-2t", "item", "new-hat",
     "change his old, faded, patched hat into a shiny, bright, brand-new hat of the same shape."),
    ("oldwoman-1", "old-woman", "thin", "white", "singer", "new-hat", "oldwoman-1t", "item", "old-hat",
     "change her shiny brand-new hat into an old, faded hat with a patch on it, same shape."),
    ("oldwoman-2", "old-woman", "fat", "gray", "none", "none", "oldwoman-2t", "build", "thin",
     "make her clearly slim and thin instead of fat."),
    ("boy-1", "boy", "thin", "black", "student", "new-bookbag", "boy-1t", "item", "old-bookbag",
     "change his shiny brand-new bookbag into an old, faded bookbag with a patch on it, same shape."),
    ("boy-2", "boy", "fat", "brown", "none", "big-ball", "boy-2t", "item", "small-ball",
     "change the very big ball he holds into a very small ball of the same color."),
    ("girl-1", "girl", "thin", "black", "student", "old-bookbag", "girl-1t", "item", "new-bookbag",
     "change her old, faded, patched bookbag into a shiny, bright, brand-new bookbag, same shape."),
    ("girl-2", "girl", "thin", "brown", "none", "small-dog", "girl-2t", "item", "big-dog",
     "change the tiny dog beside her into a big dog of the same breed and color."),
    ("baby-1", "baby", None, None, "none", "big-ball", "baby-1t", "item", "small-ball",
     "change the very big ball the baby holds into a very small ball of the same color."),
    ("baby-2", "baby", None, None, "none", "new-hat", "baby-2t", "item", "old-hat",
     "change the baby's shiny brand-new hat into an old, faded hat with a patch on it, same shape."),
]


def m01_tags(look, build, hair, job, item, twin):
    t = [f"look:{look}"]
    if build:
        t.append(f"build:{build}")
    if hair:
        t.append(f"hair:{hair}")
    t += [f"job:{job}", f"item:{item}", f"twin:{twin}"]
    return t


M01_CHECKS = """- [ ] Full body visible, standing (baby: sitting up), facing forward, arms relaxed, so all sprites line up on one floor line
- [ ] Traits read clearly at photo size: build (thin/fat), hair color, job prop, and item (new vs old, big vs small)
- [ ] Do NOT make the person tall or short: height is drawn by code scaling, so keep the figure filling the frame the same way as the other sprites"""

index[M01] = []
for base, look, build, hair, job, item, twin, ttrait, tval, change in CAST:
    desc, pron, emoji = LOOK[look]
    them = {"He": "him", "She": "her"}.get(pron, "it")
    parts = [f"A full-body cartoon of {desc}, standing and smiling, facing forward, arms relaxed."]
    if look == "baby":
        parts[0] = f"A full-body cartoon of {desc}, smiling, facing forward, arms relaxed."
    if build:
        parts.append(f"{pron} is clearly slim and thin." if build == "thin"
                     else f"{pron} is clearly round and fat, with a big round belly.")
    if hair:
        parts.append(f"{pron} has {HAIR_LEN[look]} {hair} hair.")
    parts.append(f"{pron} is {JOB[job]}.")
    if ITEM[item]:
        s = ITEM[item].format(them=them)
        if s.startswith("with "):
            dog = s[len("with "):].replace(" sitting beside", " sits beside")
            parts.append(dog[0].upper() + dog[1:] + ".")
        else:
            parts.append(f"{pron} is {s}.")
    prompt = " ".join(parts) + " " + STYLE
    traits = f"look `{look}`, build `{build or '—'}`, hair `{hair or '—'}`, job `{job}`, item `{item}`"
    notes = (f"Base sprite. Traits: {traits}.\n\n"
             f"Its near-twin `{twin}` is made by **editing this image**, so the face, clothes and pose "
             f"must be final before you make the twin.")
    if hair:
        notes += f"\n\nHair length ({HAIR_LEN[look]}) isn't a game trait; it was chosen here. Hair **color** is a trait and must be unmistakable."
    if look == "baby":
        notes += "\n\nBabies have no build or hair trait in the game, so those tags are left out of the manifest."
    index[M01].append(task(M01, base, title=f"{look}, {job}, item {item}", kind="sprite",
                           placeholder=emoji, prompt=prompt, notes=notes, spec=M01_SPEC,
                           tags=m01_tags(look, build, hair, job, item, twin), extra_checks=M01_CHECKS))
    tb, th, tj, ti = build, hair, job, item
    if ttrait == "build": tb = tval
    if ttrait == "hair": th = tval
    if ttrait == "job": tj = tval
    if ttrait == "item": ti = tval
    tnotes = (f"Near-twin of `{base}`. It must differ in **exactly one** trait: {ttrait} → `{tval}`. "
              f"The puzzle depends on students spotting this one difference, and the game's test "
              f"checks that twins differ in exactly one trait.\n\n"
              f"Put the result side by side with `{base}.png`. If anything besides the requested change "
              f"moved (face, clothes, pose, colors), try again.")
    index[M01].append(task(M01, twin, title=f"twin of {base} ({ttrait} → {tval})", kind="sprite",
                           placeholder=emoji, prompt=EDIT.format(change=change[0].upper() + change[1:],
                                              clothes="" if ttrait == "job" else "same clothes, "),
                           refs=[f"`webclient/art/{M01}/{base}.png` (the finished base sprite, white-background version if you kept one)"],
                           depends=f"[`{base}.md`]({base}.md)", notes=tnotes, spec=M01_SPEC,
                           tags=m01_tags(look, tb, th, tj, ti, base),
                           extra_checks=M01_CHECKS + f"\n- [ ] Only the {ttrait} differs from `{base}`; the difference is visible at photo size"))

index[M01].append(task(M01, "bg-photo-wall", title="living-room wall with the empty photo frame", kind="scene",
                       placeholder="—", spec=M01_SPEC, tags=[],
                       prompt="A warm cartoon living-room wall with soft cream wallpaper and a wide, empty wooden picture "
                              "frame hanging in the middle (the inside of the frame is plain light blue and empty), a "
                              "small plant on each side. " + SCENE_STYLE,
                       notes="The family sprites are placed inside the frame by code, up to 7 in a row, so keep the "
                             "inside of the frame wide, plain and empty. The caption's brass plate and the frame "
                             "numbers are drawn by code; don't add them."))

# ---------------------------------------------------------------- M07
M07 = "m07-midnight-snack"
M07_SPEC = "[`M07_build.md`](../../M07_build.md#art-gemini)"
ROOMS = [
    ("bedroom", "🛏️", "A cozy cartoon child's bedroom at night, seen straight on from the doorway: the back wall with a bed on the left side, a small lamp, and a window on the upper right showing a dark blue night sky and a moon. The lower middle of the back wall is a wide empty plain wall area. Dim, calm night colors."),
    ("bathroom", "🛁", "A cartoon bathroom at night, seen straight on: the back wall with a white bathtub on the left, a sink and mirror on the right, and a small window up high showing the night sky. The lower middle of the back wall is a wide empty plain tiled area. Dim, calm night colors."),
    ("living", "🛋️", "A cartoon living room at night, seen straight on: the back wall with a sofa on the left and a television on a low cabinet on the right, a window up high showing the night sky. The lower middle of the back wall is a wide empty plain wall area. Dim, calm night colors."),
    ("kitchen", "🍳", "A cartoon kitchen at night, seen straight on: the back wall with a fridge on the left and a stove on the right, a small table in the front middle with an empty plate on it, and a window up high showing the night sky. The lower middle of the back wall is a wide empty plain wall area. Dim, calm night colors."),
]
ROOM_NOTE = ("All room backgrounds share one viewpoint: the back wall seen straight on. **Code draws the "
             "doors** (in exact palette colors) along the wide empty strip at the bottom-middle of the back "
             "wall, so that strip must stay plain. Don't draw any doors. Sleepers are drawn on top by code.")
index[M07] = []
for kind, emoji, desc in ROOMS:
    extra = ""
    if kind == "kitchen":
        extra = "\n\nThe plate on the table stays empty: the cake is a separate sprite (`cake`) that code places on it."
    index[M07].append(task(M07, f"room-{kind}-window", title=f"{kind} at night, with window", kind="scene",
                           placeholder=emoji, prompt=desc + " " + SCENE_STYLE, spec=M07_SPEC, tags=[],
                           notes=ROOM_NOTE + f"\n\nMake this one **before** `room-{kind}`, which is an edit of it." + extra))
    index[M07].append(task(M07, f"room-{kind}", title=f"{kind} at night, no window", kind="scene",
                           placeholder=emoji, spec=M07_SPEC, tags=[],
                           prompt=SCENE_EDIT.format(change="Remove the window and fill that part with plain wall that matches the rest. Change nothing else."),
                           refs=[f"`webclient/art/{M07}/room-{kind}-window.png` (the finished window version)"],
                           depends=f"[`room-{kind}-window.md`](room-{kind}-window.md)",
                           notes=ROOM_NOTE + "\n\nWindow and no-window rooms must match exactly apart from the window: "
                                 "the window is one of the clues players use to tell rooms apart. Compare side by side."))
SLEEP_NOTE = ("Sleep bubbles stand in for \"Zzz\", because images must have no letters. Code places this "
              "sprite on top of a room background, so it must read clearly against a dim night room.")
SLEEPERS = [
    ("sleep-father", "😴", "A cartoon Taiwanese father sleeping peacefully on his side under a blanket, eyes closed, a few small round bubbles floating above his head."),
    ("sleep-mother", "😴", "A cartoon Taiwanese mother sleeping peacefully on her side under a blanket, eyes closed, a few small round bubbles above her head."),
    ("sleep-baby", "👶", "A cartoon baby sleeping in a small wooden crib, eyes closed, hugging a toy, a few small round bubbles above."),
    ("sleep-dog", "🐕", "A cartoon dog curled up asleep on a small round cushion, eyes closed, a few small round bubbles above."),
    ("sleep-cat", "🐈", "A cartoon cat curled up asleep in a ball, eyes closed, a few small round bubbles above."),
]
for aid, emoji, desc in SLEEPERS:
    n = SLEEP_NOTE
    if aid in ("sleep-father", "sleep-mother"):
        n += " Father and mother are always shown together in one room, so make them look like a pair (same blanket style)."
    index[M07].append(task(M07, aid, title=aid.replace("sleep-", "sleeping "), kind="sprite", placeholder=emoji,
                           prompt=desc + " " + STYLE, notes=n, spec=M07_SPEC, tags=[]))
index[M07].append(task(M07, "cake", title="the midnight-snack cake", kind="sprite", placeholder="🍰",
                       prompt="A round chocolate cake with white cream on top, on a white plate. " + STYLE,
                       notes="Shown on the kitchen table (tap to take it) and as a small badge in the corner while carried, "
                             "so it must also read at badge size (about 48 px).", spec=M07_SPEC, tags=[]))

# ---------------------------------------------------------------- M11
M11 = "m11-monster-clinic"
M11_SPEC = "[`M11_build.md`](../../M11_build.md#art-gemini-see-art_guidemd)"
CODE_NOTE = "The monster and the thermometer are drawn by code (their counts and numbers must be exact), so they are not art tasks."
M11_ASSETS = [
    ("bg-clinic", "scene", "—", "doctor's room background",
     "A cozy cartoon doctor's room seen from the front: a pale mint-green wall, a white medicine cabinet on the left, a small window with yellow curtains on the right, an empty space in the middle where a patient will stand, a light wooden floor.",
     "Code draws the monster in the empty middle space, so keep it clear. " + CODE_NOTE),
    ("tool-cold-pack", "sprite", "🧊", "cold pack",
     "A soft light-blue cold pack: a squishy rectangular gel bag with a few small ice cubes drawn on it and tiny frosty sparkles around it.", ""),
    ("tool-hot-bag", "sprite", "♨️", "hot water bag",
     "A red rubber hot water bag with a round white cap, little wavy lines of steam rising from it.", ""),
    ("icon-nurse", "sprite", "👩‍⚕️", "nurse role icon",
     "A white nurse's cap with a small red heart on the front.",
     "Use a **heart, not a red cross**. The Red Cross emblem is legally protected and shouldn't appear in games. Regenerate if a cross appears."),
    ("icon-doctor", "sprite", "📕", "doctor role icon (the Doctor Book)",
     "A thick green book with a doctor's stethoscope lying across the cover.",
     "No title or writing on the book cover."),
    ("title-monster", "sprite", "👾", "decorative title monster",
     "A cute fuzzy little round monster sitting on a doctor's bed, looking sick and sad, with a thermometer in its mouth. Decorative title picture.",
     "Decorative only, so its eye count doesn't matter. The gameplay monster is drawn by code. "
     "The thermometer must have no readable numbers."),
]
index[M11] = []
for aid, kind, emoji, title, desc, note in M11_ASSETS:
    index[M11].append(task(M11, aid, title=title, kind=kind, placeholder=emoji,
                           prompt=desc + " " + (SCENE_STYLE if kind == "scene" else STYLE),
                           notes=note, spec=M11_SPEC, tags=[]))

NAMES = {M01: "M01 Family Photo", M07: "M07 Midnight Snack", M11: "M11 Monster Clinic", "_style": "Style anchor"}
# ---------------------------------------------------------------- M02–M06, M08–M10, M12: parsed from their build specs
import re

FEEL_EDIT = ("Edit the attached image. Change only this: {change} Keep everything else exactly the "
             "same: same character, same hair, same clothes, same body position, same colors, same style, "
             "same white background.")
OBJ_EDIT = ("Edit the attached image. Change only this: {change} Keep everything else exactly the "
            "same: same object, same size, same angle, same style, same white background.")
SPECS = OUT.parent
PARSED = {
    "m02-lunch-rush": ("M02 Lunch Rush", "M02_build.md"),
    "m03-weather-wardrobe": ("M03 Weather Wardrobe", "M03_build.md"),
    "m04-school-bell": ("M04 School Bell", "M04_build.md"),
    "m05-ticket-machine": ("M05 Ticket Machine", "M05_build.md"),
    "m06-messy-desk": ("M06 Messy Desk", "M06_build.md"),
    "m08-mystery-guest": ("M08 Mystery Guest", "M08_build.md"),
    "m09-mood-plugs": ("M09 Mood Plugs", "M09_build.md"),
    "m10-gift-shop": ("M10 Gift Shop", "M10_build.md"),
    "m12-animal-race-day": ("M12 Animal Race Day", "M12_build.md"),
}


def art_section(md):
    m = re.search(r"^## Art.*?$(.*?)^## ", md, re.S | re.M)
    return m.group(1)


def tables(section):
    """Yield (header cells, rows) for each markdown table in the section."""
    lines = section.splitlines()
    i = 0
    while i < len(lines):
        if lines[i].startswith("|") and i + 1 < len(lines) and lines[i + 1].startswith("|---"):
            head = [c.strip() for c in lines[i].strip("|").split("|")]
            rows, i = [], i + 2
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in re.split(r"(?<!\\)\|", lines[i].strip().strip("|"))])
                i += 1
            yield head, rows
        else:
            i += 1


def intro(section):
    """The section's prose (everything that isn't a table), used as module notes."""
    keep = [l for l in section.strip().splitlines() if not l.startswith("|")]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(keep)).strip()


def unbt(s):
    return s.strip().strip("`")


def fill(p):
    return p.replace("{SCENE_STYLE}", SCENE_STYLE).replace("{STYLE}", STYLE)


for mod, (name, fname) in PARSED.items():
    NAME_SPEC = f"[`{fname}`](../../{fname}#art-gemini-see-art_guidemd)"
    sec = art_section((SPECS / fname).read_text())
    mod_notes = "From the module's build spec:\n\n" + "\n".join("> " + l if l else ">" for l in intro(sec).splitlines())
    index[mod] = []
    NAMES[mod] = name
    for head, rows in tables(sec):
        if head[:3] == ["assetId", "Placeholder", "Prompt"]:
            for aid, ph, prompt in rows:
                aid, ph = unbt(aid), (None if ph in ("—", "") else ph)
                scene = "{SCENE_STYLE}" in prompt or aid.startswith("bg-") or aid.startswith("sky-")
                kind = "scene" if scene else "sprite"
                notes, refs, depends = mod_notes, None, None
                edit = re.match(r"\*\*Edit `([^`]+)`:\*\*\s*\"(.*)\"\s*$", prompt)
                shared = re.match(r"\*\*Shared with (M\d+)\.?\*\*(?: \([^)]*\))?\.?\s*(.*)$", prompt)
                if edit:
                    parent, change = edit.groups()
                    prompt = (SCENE_EDIT if scene else OBJ_EDIT).format(change=change)
                    refs = [f"`webclient/art/{mod}/{parent}.png` (the finished `{parent}`)"]
                    depends = f"[`{parent}.md`]({parent}.md)"
                    notes = f"This is an **edit** of `{parent}`. Compare side by side: only the requested change may differ.\n\n" + mod_notes
                else:
                    if shared:
                        other = {"M10": "m10-gift-shop", "M08": "m08-mystery-guest"}[shared.group(1)]
                        prompt = shared.group(2)
                        notes = (f"**Shared asset.** If `webclient/art/{other}/{aid}.png` already exists, copy it here "
                                 f"instead of generating a new one, so both modules show the same picture.\n\n" + mod_notes)
                    prompt = fill(prompt)
                    if mod == "m12-animal-race-day" and aid.startswith("an-"):
                        notes = ("After the picture is final, set its `badge:x,y` tag in the manifest to a point on the "
                                 "animal's chest (pixels in the 512×512 image). Code pins the team badge there.\n\n" + mod_notes)
                index[mod].append(task(mod, aid, title=aid, kind=kind, placeholder=ph, prompt=prompt,
                                       notes=notes, refs=refs, depends=depends, spec=NAME_SPEC,
                                       tags=["badge:TODO"] if aid.startswith("an-") else []))
    if mod == "m09-mood-plugs":
        tabs = list(tables(sec))
        bases = next(r for h, r in tabs if h[:2] == ["Base", "Prompt"])
        edits = next(r for h, r in tabs if h[:2] == ["Feeling", "The one change"])
        for base, prompt in bases:
            base = unbt(base)
            who = base.rsplit("-happy", 1)[0]
            refs = ["`webclient/art/_style/anchor.png` (the style anchor)"]
            if who.startswith("kid-") and who != "kid-1":
                refs.append("`webclient/art/m09-mood-plugs/kid-1-happy.png` (so all four avatars match)")
            ph = {"boy": "👦", "girl": "👧", "dog": "🐶", "cat": "🐱"}.get(who, "🧑")
            index[mod].append(task(mod, base, title=f"{who}, happy (base of the set)", kind="sprite",
                                   placeholder=ph, prompt=fill(prompt).replace("Same idea: a", "A"),
                                   refs=refs, notes=f"Base of the `{who}` feeling set. The other five feelings are edits of this picture, so it must be final first.\n\n" + mod_notes,
                                   spec=NAME_SPEC, tags=[f"who:{who}", "feeling:happy"]))
            for feeling, change in edits:
                feeling = unbt(feeling)
                fid = f"{who}-{feeling}"
                index[mod].append(task(mod, fid, title=f"{who}, {feeling}", kind="sprite", placeholder=ph,
                                       prompt=FEEL_EDIT.format(change=change),
                                       refs=[f"`webclient/art/{mod}/{base}.png` (the finished happy base)"],
                                       depends=f"[`{base}.md`]({base}.md)",
                                       notes=f"Feeling edit of `{base}`. Only the face (and the hand, for fine/good/great) may change.\n\n" + mod_notes,
                                       spec=NAME_SPEC, tags=[f"who:{who}", f"feeling:{feeling}"],
                                       extra_checks="- [ ] Matches the Face Guide description for this feeling, and is clearly different from the other five in the set"))


# ---------------------------------------------------------------- per-module index + top README
for mod, ids in index.items():
    if mod == "_style":
        continue
    rows = "\n".join(f"| {i + 1} | [`{a}`]({a}.md) | `webclient/art/{mod}/{a}.png` |" for i, a in enumerate(ids))
    (OUT / mod / "README.md").write_text(
        f"# {NAMES[mod]}: art tasks\n\n{len(ids)} assets. Do them in this order: an asset that is an "
        f"**edit** of another one comes right after it.\n\n| # | Task | Output |\n|---|---|---|\n{rows}\n")

total = sum(len(v) for v in index.values())
mods = "\n".join(f"| [{NAMES[m]}]({m}/README.md) | {len(v)} |" for m, v in sorted(index.items()) if m != "_style")
(OUT / "README.md").write_text(f"""# Art Tasks

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
{mods}

**Total: {total} images** (including the anchor).

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
""")
print(total, "tasks")
