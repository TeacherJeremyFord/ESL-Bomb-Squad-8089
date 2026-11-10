# M01: Family Photo

**Target vocab (32):** grandfather, grandmother, father, mother, brother, sister, boy, girl, baby, friend, teacher, student, singer, farmer, doctor, nurse, tall, short, big, small, old, new, thin, fat, hair, who, other, not, he is, she is, name, have/has
**Off-list words needed:** press, photo, family (on the 400 list), man, woman (on the 400 list)
**Difficulty:** A1–B1 · **Time:** 60–120 s · **Route:** vocab-first (Family + People + Appearances)
**Status:** Draft

## The hook

The bomb has a framed family photo, and one person in it **is not family**. They sneaked in.
Find them. The Expert has the family's own book ("My grandfather is old and thin. He is a
farmer…"), but no picture. The Defuser has the picture, but no book.

## Inspiration

Spot-the-difference and "find the impostor" deduction, played as a manual-expert module. The
Expert checks the Defuser's spoken descriptions against written ones, so the descriptions have
to be accurate.

## Defuser view

- A photo with **5–7 cartoon people** in numbered frames (1–7). Each person has a mix of:
  - **Age look:** baby, boy, girl, man/woman, old man/old woman
  - **Height:** tall / short. **Build:** thin / fat. Both are always available: they are
    list words students need to know, so there is no toggle to remove them.
  - **Hair:** a color (black, brown, gray, white…) and long or short
  - **Job prop:** stethoscope (doctor), nurse cap (nurse), book and chalk (teacher), bookbag
    (student), microphone (singer), straw hat (farmer), or nothing
  - **One object** that is visibly *new* (shiny, with a tag) or *old* (patched): hat, bookbag, ball…
  - Some people hold a *big* or *small* thing (big dog / small dog, big ball / small ball)
- A **caption** under the photo: `THE LIN FAMILY` (the name changes per bomb).
- Buttons: **[1] … [7]** to press the impostor.
- **Stage 2** buttons: a row of role words: GRANDFATHER, GRANDMOTHER, FATHER, MOTHER,
  BROTHER, SISTER, BABY, FRIEND.

## Expert manual

The Expert's book has one page per family name, so the first question is always
*"What is the name on the photo?"* Each page has 5–6 sentences, one per real family member:

> **THE LIN FAMILY**
> My grandfather is old and thin. He is a farmer. He has white hair.
> My grandmother is short. She is a singer. She has a new hat.
> My father is tall and fat. He is a doctor.
> My mother is tall and thin. She is a teacher. She has black hair.
> My sister is a student. She is small. She has an old bookbag.
> The baby has a big ball.

> **Rule 1:** One person in the photo is not in this book. He or she is a friend, not family.
> Press the friend.
>
> **Rule 2:** Then the bomb asks WHO. Press who he or she is in the family.

Stage 2 table (the bomb highlights one frame):

| The bomb says | Press |
|---|---|
| WHO IS NUMBER (n)? | The family word for that person: FATHER, SISTER… |
| WHO IS THE OTHER (job)? | Two people have the same job prop. Press the one that is **not** in the book |

## Solving it

1. Defuser reads the caption, and the Expert turns to that page.
2. Defuser describes each person: *"Number 2 is a tall man. He is fat. He is a doctor."*
3. Expert ticks off matches. The person with **no match** is the impostor.
4. Defuser presses that frame (a wrong press is a strike).
5. Stage 2: the bomb highlights a frame and asks WHO. The Expert matches it and says the role.
   The Defuser presses the role word.

**Building in near-misses is the point.** The impostor always shares 2–3 traits with a real
member, for example a tall *thin* doctor when the book says the father is tall and *fat*. A
team that skims ("a doctor, OK, that's the father") gets a strike, so every adjective matters.

## Example round

> **E:** What is the name on the photo?
> **D:** The… Lin family.
> **E:** OK. Number one?
> **D:** Old man. White hair. A hat… a farmer.
> **E:** Grandfather, yes. Is he thin?
> **D:** Yes, thin.
> **E:** Good. Number two?
> **D:** A tall man, he is a doctor. He is… thin.
> **E:** Thin? The father is tall and *fat*. Hmm. Number three?
> **D:** A tall man, fat, doctor.
> **E:** That is the father! Number two is not family. Press two.

## Information gap

✅ **Hidden lookup table + near-miss conditional.** Without the book, the Defuser has no idea
who belongs. Two tall men with doctor props look equally plausible.

## Difficulty scaling

- **A1:** 4 people, impostor differs in an obvious way (a baby when the book has no baby).
  Stage 2 off.
- **A2:** 5 people, impostor differs by **one** adjective (tall/short, old/new).
- **B1:** 6–7 people, impostor differs by one adjective, and a second near-miss shares the
  same job. Stage 2 is on and uses "the other (job)".

## Build notes

- Generate a family (5–6 members, random trait sets), then clone one member and flip 1–2
  traits to make the impostor. Reject boards where two people end up identical, or where the
  impostor accidentally matches the book.
- Family names should be short and easy to read aloud (LIN, WANG, CHEN, LEE, KO), and teachers
  should be able to replace them.
- Stage 2 fits the existing quiz-item pipeline as a plain multiple-choice item.

## Open questions

- *man/woman* are on the 400 list. The manual avoids them, but Defusers will say them. Accept
  as off-list?
