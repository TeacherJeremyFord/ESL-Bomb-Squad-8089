# Play-tester (internal testing only)

Not part of the game. Nothing in `web/` loads it, and the live page does not serve this folder.
It changes no game files.

Three copies of a local model test ESL Bomb Squad through the real game page:

- the **Defuser** is shown only the bomb,
- the **Expert** is shown only the manual,
- they can only talk to each other in English,
- the **Referee** sees both screens and the right manual page. After every strike it rules on the
  cause: a player's mistake, an unclear manual, or a possible fault in the game.

## Run it overnight

```
node tools/playtest/playtest.mjs start --all      # every module, one bomb each, in the background
node tools/playtest/playtest.mjs status           # how far it has got
node tools/playtest/playtest.mjs log              # watch the talk (Ctrl-C stops watching only)
node tools/playtest/playtest.mjs stop             # stop it
node tools/playtest/playtest.mjs resume           # carry on the stopped run
```

`start` keeps running after the terminal is closed. `stop` throws away only the bomb being played.
`resume` keeps every finished bomb and starts the interrupted one again from its beginning. It also
carries on a run that died by itself (model server down, power cut). If the model cannot be reached,
the run stops by itself and waits for `resume`.

Other things to test:

```
node tools/playtest/playtest.mjs --list                       # module and mission names
node tools/playtest/playtest.mjs start --modules sliders,memory
node tools/playtest/playtest.mjs start --all --repeat 2       # every module twice
node tools/playtest/playtest.mjs start --missions             # the whole campaign
node tools/playtest/playtest.mjs start --mission 1,2
node tools/playtest/playtest.mjs start --bomb "sliders,memory,word buttons"
node tools/playtest/playtest.mjs --modules sliders            # run here in this terminal
node tools/playtest/playtest.mjs --modules sliders --peek     # print what each player sees, no model
node tools/playtest/playtest.mjs --help
```

Needs Node 22 or newer and `google-chrome`. No npm packages.

The model is `wd-thinking` on llamaForge through the local proxy at `http://localhost:1234/v1`
(the same address Hermes Agent uses). Change it with `--model` / `--api`, or the environment
variables `PLAYTEST_MODEL` / `PLAYTEST_API`. With `wd-thinking` one module takes about 20 to 40
minutes, so `--all` is an overnight job.

## What you get

`tools/playtest/reports/<date_time>/` (ignored by git):

- `report.md`, rewritten after every bomb:
  - **Look at these first**: page errors, and every strike the referee blamed on the game or the manual.
  - a table of every bomb: defused / exploded / gave up, strikes, the referee's rulings.
  - details: what each player said was confusing.
- one folder per bomb: `transcript.md` (written as play happens, with the referee's rulings in place),
  `first-screen-defuser.txt`, `result.json`, `end.png`.
- `state.json`: what `resume` reads.

`tools/playtest/reports/run.log` is the output of background runs.

## How the players see the game

- **Text.** The model cannot read screenshots, so each screen is turned into text. Buttons, text
  boxes and sliders are numbered so the model can use them.
- **Pictures.** Every picture in the game is drawn from a recipe (a monster's eyes, arms and color;
  a person's hair and build). The tester records each recipe and gives it as the picture's
  description, so the players are told exactly what was drawn. No hand-written descriptions to go stale.
- **Colors** of buttons, lights and the bomb's case are named from the page's real colors.
- **Sounds.** The game's sound effects are given by name ("an alarm clock ringing"), and any other
  beep from a module as "a beep from a module".
- **Things that move.** While the players talk or wait, the tester looks at the bomb once per game
  second and tells the Defuser what appeared or went.
- **The clock is game time.** The page's clock stands still while the model thinks. Each thing a
  player says costs `--talk` seconds (default 5); a press costs under a second.

## How far to trust it

- **DEFUSED** shows that module can be solved from the manual by talk alone, for that one random bomb.
  Each bomb is different, so use `--repeat` for more cover.
- **A strike is not a bug.** Models make mistakes like children do. The referee's ruling says where
  to look; it is a model too, so read the transcript before changing the game.
- **A recipe is not eyesight.** The players are told what was drawn, so the tester cannot find a
  picture that is drawn badly or is too small to make out. That still needs human eyes.
- **A model is not a child.** It reads the manual better than an A2 student. This checks that the
  rules and the manual agree and can be followed, not that the reading level is right.
- Page errors (JavaScript exceptions) during a bomb are always listed.

The script sets each bomb up itself (Free Play pool, mission pick); only the play is done by the
model. It uses the game's `?test` mode but hides the TEST buttons and the in-bomb manual from the players.
