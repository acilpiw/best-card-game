# DUEL 21

![make.fun bounty](https://make.fun/badge/best-card-game-20261122-1826.svg)
![DUEL 21 rank](https://make.fun/badge/best-card-game-20261122-1826/acilpiw/best-card-game/rank.svg)
![DUEL 21 reward](https://make.fun/badge/best-card-game-20261122-1826/acilpiw/best-card-game/reward.svg)

An original blackjack card duel against the house dealer, played on a green
felt table in the browser — no build step, no network, just static files. Beat the dealer's hand without going over 21:
every round is a 20-chip bet, the dealer stands on all 17s, and emptying the
other side's chips costs them one of three hearts. Take all three dealer
hearts to win the match — lose yours and the house wins.

Entry for the make.fun bounty [Make the best card game](https://make.fun/bounty/best-card-game-20261122-1826).

## Play

- **Deal / restart:** Space, Enter, or click
- **Hit:** H key or the HIT button
- **Stand:** S key or the STAND button

## Score

Both sides start with 100 chips and 3 hearts. A won round pays 20 chips, a
lost round costs 20, a push pays nobody. At zero chips a side loses a heart
and rebuys at 100; at zero hearts the match ends.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `game/` is plain static files (canvas 2D, ES
modules, WebAudio synth for sound). The grader runs `main.ts`, which copies
`game/` and `screenshots/` to the output and writes `dossier.json`.

## Shots

`shots.json` stages four deterministic scenes from the real rules
(`?shot=title|table|win|lose&seed=7`): the title screen, the table mid-duel
with both hands and both totals, the victory screen, and the defeat screen.

## Files

- `game/src/deck.js` — the deck: building, shuffling, hand values
- `game/src/game.js` — the match rules: rounds, bets, hearts, the dealer
- `game/src/render.js` — all drawing: felt table, cards, chips, panels
- `game/src/shots.js` — the deterministic screenshot scenes
- `game/src/audio.js`, `game/src/random.js`, `game/src/main.js` — sound, the seeded rng, input and the loop
- `main.ts` — entrypoint the grader runs; `serve.ts` — local static server
