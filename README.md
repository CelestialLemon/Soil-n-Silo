# Soil n Silo

A grid-free, build-and-watch solarpunk homestead game (v0.2, the cozy homestead pivot): each round is an intimate, painted
pocket valley in a single season, where you settle a homestead, paint organic fields, dig gravity irrigation channels, draw
curving tracks and plank bridges, and keep the little farm in balance through living, unpredictable weather. No timer, no route
tables, one of each workshop and one capped, fully refundable pool of Supplies. A 3D world painted for the web by brush3d, the
game's own renderer, in [`brush3d/`](brush3d/README.md) ("painted world, inked things").

- Design: [`docs/DESIGN.md`](docs/DESIGN.md)
- Plan: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- How to work here: [`AGENTS.md`](AGENTS.md)
- The renderer, its demo, its tools and its models: [`brush3d/`](brush3d/README.md) (the models: [`brush3d/docs/MODELS.md`](brush3d/docs/MODELS.md))

v0.1 (the timed grid-automation game on 4 m tiles) is gone from the tree and kept in git history. The game is being rebuilt
from a clean skeleton, milestone by milestone ([`docs/ROADMAP.md`](docs/ROADMAP.md)); for now the game's page is a placeholder
and brush3d's demo shows what the valley will look like.

```sh
npm install
npm run dev          # http://127.0.0.1:5190 (and brush3d's demo at /brush3d/)
npm test             # the game rules (src/game/) and brush3d's own checks (wind, water, view, land, parts), in Node
npm run typecheck    # the game, its tests, the renderer and its tools, and that the demo uses only brush3d's API
npm run lint         # ESLint; every rule is an error
npm run build        # typecheck, then the game into dist/ and brush3d's demo into dist/brush3d/
npm run render:shot -- out "hour=12"   # brush3d's tools are render:*; see brush3d/README.md
```

Needs Node 22.18 or later (the tests run TypeScript directly).

**Builds online.** Every push to `main` or `dev` is built and deployed to GitHub Pages (`.github/workflows/pages.yml`):
[`/main/`](https://celestiallemon.github.io/Soil-n-Silo/main/) and [`/dev/`](https://celestiallemon.github.io/Soil-n-Silo/dev/),
each with brush3d's demo in its `brush3d/` folder. Every open PR from this repo gets a preview of both at `/pr-<number>/`,
linked in a comment on it and removed when it closes. The site's root redirects to `/main/`. New work is merged into `dev` and
moves to `main` in a PR from `dev`. Every PR to either, and every push to them, runs lint, the tests and the build on Node 22.18
and the deploy's Node, and brush3d's cloud check in a browser (`.github/workflows/ci.yml`).

## Layout

```
index.html      the game's page: the canvas brush3d draws on and the UI root over it
src/
  main.ts       the game's entry: mounts the app shell (the loop, world and input join it in Milestone 1)
  game/         game rules and state as pure TypeScript (no DOM, no three.js, no renderer), unit-tested in Node; index.ts
                is its barrel, result.ts the Result type expected failures return
  world/        the bridge from the game's state to brush3d, through brush3d/src/index.ts only
  ui/           the HTML over the canvas: tool strip, valley brief, sky strip, building ring
test/           unit tests (Node's test runner); brush3d.test.ts runs the renderer's own Node checks
docs/           design, roadmap
brush3d/        the painterly renderer: its code (src/), demo (index.html, src/demo/), tools (tools/, tools/blender/) and docs
```

## The renderer

The game is drawn by brush3d, which lives in this repo in `brush3d/` and is changed here like the rest of the game: how it
draws, its layout, its tools and its demo are in [`brush3d/README.md`](brush3d/README.md), its API for the game in
[`brush3d/docs/API.md`](brush3d/docs/API.md). The game uses it only through `brush3d/src/index.ts` (and its rules and tests
through `brush3d/src/shared.ts`). A gap in brush3d is fixed in brush3d, never worked around in the game.
