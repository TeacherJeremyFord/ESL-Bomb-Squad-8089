# M09: Mood Plugs

**Target vocab (19):** I am, you are, he is, she is, it is, we are, they are, this/these, that/those, happy, angry, sad, fine, good, great, boy, girl, dog, cat
**Off-list words needed:** plug, front, back, row, face
**Difficulty:** A2–B1 · **Time:** 60–120 s · **Route:** vocab-first (Pronouns + Articles + Feelings)
**Status:** Draft

## The hook

A switchboard of **feeling sentences** has to be plugged into the right **faces**. The Expert
reads sentences like *"Those cats are sad"* and *"I am great"*. The Defuser sees a board of
faces and has to work out **who "I" is** (it's the Expert!), whether *those* means the front
row or the back row, and whether *they* means one cat or two.

## Inspiration

Plug-board and patch-cable modules, rewired so the **grammar is the wiring diagram**. Every
sentence needs its pronoun or demonstrative to pick out exactly one tile. Feelings carry the
rest. This is how pronouns, this/that and these/those become load-bearing, not decoration.

## Defuser view

- **Sockets A–D** on the left (or A–F at B1).
- **Picture tiles** on the right, in two rows with depth:
  - **Front row** (big, close, at the bottom) is *this* / *these*
  - **Back row** (small, far, at the top) is *that* / *those*
  - Tiles show a boy, a girl, a dog, a cat, or **groups of two** (two girls, two cats…).
    Each has a feeling face.
- Three special **portrait tiles** at the side:
  - 🎧 **EXPERT**: your teammate's face (the "I" when the Expert speaks)
  - 🙋 **DEFUSER**: your own face (the "you" when the Expert speaks)
  - 👥 **US**: both together ("we")
- **Feelings are drawn, never written:** angry (red face, steam), sad (tear), fine (OK hand,
  flat smile), good (thumbs up), great (star eyes and a thumbs up), happy (big open smile).
- Drag a cable from a socket to a tile. **CHECK** when all sockets are plugged.

## Expert manual

The Expert's screen shows this round's sentences directly (generated to fit the board, with
no page lookup):
> **A:** That girl is happy.
> **B:** These cats are angry.
> **C:** I am great.
> **D:** It is sad. It is in the back.
> **E:** They are fine. *(two boys)*
> **F:** You are good.

**The Face Guide.** The Defuser will tell you what the faces look like. Say the feeling word:

| The Defuser says… | It is… |
|---|---|
| red face / angry eyes | angry |
| water from the eye | sad |
| a small smile / OK hand | fine |
| thumbs up | good |
| star eyes and thumbs up | great |
| a big smile | happy |

**How to read it:**
> *This* and *these* are in the **front**. *That* and *those* are in the **back**.
> *I* is you, the Expert. *You* is the Defuser. *We* is the two of you.
> *He* is a boy. *She* is a girl. *It* is an animal. *They* are two or more.

## Solving it

The board always contains **decoys that differ by one grammar feature**:

- a happy girl in the *front* and in the *back* (*this* vs *that*)
- one angry cat and *two* angry cats (*it* vs *they* / *these*)
- EXPERT and DEFUSER portraits that both look positive (one *great*, one *good*). The
  sentence "I am great" only fits if the Defuser remembers that "I" is the *Expert*.

So the Expert reads a sentence, the Defuser hunts for candidates and describes their faces,
the Expert uses the Face Guide to confirm the feeling, and grammar breaks the tie.

## Example round

> **E:** A: That girl is happy.
> **D:** Girls… there is a girl in the front, big smile. And a girl in the back, big smile.
> **E:** *That* is the back. Plug A to the back girl.
> **D:** OK. B?
> **E:** B: These cats are angry.
> **D:** In the front there is a cat, red face. In the back, two cats, red face.
> **E:** *These*: two, in the front. Are there two cats in the front?
> **D:** Ah… yes! Two cats in the front, too. Red face. *(plugs)*
> **E:** C: I am great.
> **D:** I… me? My picture has star eyes.
> **E:** No, *I* is me, the Expert! My picture?
> **D:** Your picture… star eyes and thumbs up. Great. *(plugs C to EXPERT)*

*(The I/you flip trips up nearly everyone the first time. It's the module's signature
moment.)*

## English lock

Even if the team talks in Chinese, this module can't be solved without reading the English.
Spoken Chinese says *tā* for he, she and it alike, so the he/she/it distinction disappears in
translation. The Expert has to resolve it from the English sentence. The same goes for
*this/that* and *these/those*. The Expert's sentences are always English words, never
pictures.

## Information gap

✅ **Hidden sentences + face-reading split.** The Defuser can't know which sentences exist.
The Expert can't see the board. The Face Guide also makes the **Expert** produce the feeling
words, so both sides use them.

## Difficulty scaling

- **A2:** 4 sockets. *He / she / it / they* plus feelings only. No front/back rows.
- **B1:** 5–6 sockets. Front/back rows on (*this/that/these/those*), the portrait tiles on
  (*I / you / we*).
- **B1+:** sentences without a pronoun cue: "B: These are angry." The Defuser has to use
  plural and front row only.

## Build notes

- Generate the board, then the sentences, and check that **each sentence matches exactly one
  tile** under the grammar rules. The checker is the spec: implement `matches(sentence, tile)`
  from the "How to read it" rules and assert the solution is unique.
- Portraits should be avatar faces picked at join time, with feelings drawn on, not student
  photos. Check against the platform's student-privacy requirements before adding any camera
  option.
- Thumbs up vs star eyes: make *good* and *great* very distinct. Playtest this first.

## Open questions

- Is "fine" readable as a face? Some teachers treat "I'm fine" as neutral, not positive. The
  OK hand is the current proposal.
