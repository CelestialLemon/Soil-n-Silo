# Soil n Silo

A cozy point-and-click farming and production game: one 28-day season to earn 20,000g by growing crops, raising chickens and turning both into
bread and pumpkin pie. The depth is in soil fertility, animals and processing chains rather than relationships. A 3D world drawn as
pixel art by [pixel3d-renderer](https://github.com/CelestialLemon/pixel3d-renderer), for the web.

- Design: [`docs/DESIGN.md`](docs/DESIGN.md) (the MVP design doc)
- Plan: [`docs/ROADMAP.md`](docs/ROADMAP.md), including the renderer gaps to confirm
- How to work here: [`AGENTS.md`](AGENTS.md)
- Models: [`docs/ASSET_BRIEF.md`](docs/ASSET_BRIEF.md)

![Day 12 on the farm: the coop and its run, a mill and an oven at work, and the field in every stage of growth](docs/screenshot.png)

```sh
npm install
npm run dev          # http://127.0.0.1:5190
npm test             # the game rules (src/game/), in Node
npm run sim          # a scripted season on the real rules, to check the economy
npm run typecheck
npm run build        # typecheck, then the game into dist/
```

Needs Node 22.18 or later (the tests run TypeScript directly, and installing the renderer from git builds it).

**Playing.** Click a field tile to use what is in hand (hoe, watering can, seeds, manure); a ripe crop is harvested with any click.
Drag across the field to do the same on every tile in the rectangle (a playtesting shortcut for now; Esc cancels).
Click things to use them: the shop, the shipping bin, the coop and its door, the trough, chickens (pet), eggs and manure (collect),
machines, and the farmhouse (sleep). Drag off the field (or right-drag or Shift-drag anywhere) to pan, Q/E or the buttons turn the camera between its 4 views, the mouse wheel or Z
zooms (1x/2x/3x), 1-0 pick a hotbar slot, B opens the backpack, T skips an hour, Esc opens the menu. The game saves in the
browser (one slot) every morning and when the page is hidden.

**Builds online.** Every push to `main` or `dev` is built and deployed to GitHub Pages (`.github/workflows/deploy.yml`):
[`/main/`](https://celestiallemon.github.io/Soil-n-Silo/main/) and [`/dev/`](https://celestiallemon.github.io/Soil-n-Silo/dev/).
The site's root redirects to `/main/`. Each build keeps its own save. New work is merged into `dev` and moves to `main` in a
PR from `dev`.

## Layout

```
src/
  main.ts       the game: loop, input, camera, picking and clicking
  game/         game rules and state as pure TypeScript (no DOM, no renderer), unit-tested in test/
  world/        what the renderer draws: the static farm, the models, and the view that mirrors the state into objects
  ui/           the HTML HUD and menus over the canvas, and the item icons
assets/         Blender build scripts for the models (the source of truth), exported to public/models/
tools/          the economy sim
test/           unit tests (Node's test runner)
docs/           design, roadmap, asset brief
```

## The renderer

The game installs the renderer from git, pinned to a release tag, `v0.2.0` (see its `CHANGELOG.md` before moving to a newer
one). three.js 0.180 sits beside it. Its public API is what its `src/renderer/index.ts` exports; its README explains how a game uses it.

npm builds the renderer when it installs it from git, which needs the install script approved. The approval in `package.json`
(`allowScripts`) names the exact commit, so after changing the tag run:

```sh
npm install github:CelestialLemon/pixel3d-renderer#v0.2.0
npm install-scripts approve pixel3d-renderer
```

**Changing the renderer and the game together.** Point the game at the local checkout while you work, then go back to a tag once
the renderer change is released:

```sh
npm install ../pixel3d-renderer     # then `npm run build:lib` in the renderer after each change
```

Never commit the game pointing at a local path. Renderer bugs and missing features are issues in the renderer repo, labelled
`soil-n-silo` (see `AGENTS.md`, "Renderer issues").
