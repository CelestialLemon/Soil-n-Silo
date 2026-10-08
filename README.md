# Soil n Silo

A solarpunk automation game, build-only and point-and-click: each commission is a seeded valley where you lay out fields, belts,
drones, machines and power until the farm delivers what a nearby settlement asked for. Soil wears out and comes back,
byproducts have to go somewhere, and the sun sets every few minutes. A 3D world drawn as pixel art by
[pixel3d-renderer](https://github.com/CelestialLemon/pixel3d-renderer), for the web.

- Design: [`docs/DESIGN.md`](docs/DESIGN.md)
- Plan: [`docs/ROADMAP.md`](docs/ROADMAP.md), including the renderer gaps
- How to work here: [`AGENTS.md`](AGENTS.md)
- Models: [`docs/ASSET_BRIEF.md`](docs/ASSET_BRIEF.md)

![Morning Bread at noon: wheat and bean fields, a mill, coop, digester and bakery, solar panels and batteries](docs/screenshot.png)

```sh
npm install
npm run dev          # http://127.0.0.1:5190
npm test             # the game rules (src/game/), in Node
npm run sim -- c2     # a bot plays a commission on the real rules (c1, c2), to check it can be cleared and how fast
npm run typecheck
npm run build        # typecheck, then the game into dist/
```

Needs Node 22.18 or later (the tests run TypeScript directly, and installing the renderer from git builds it).

**Playing.** Pick a commission (or the sandbox) in the level select. Pick a building in the bar at the bottom, then click or
drag to place it (belts follow the drag, R turns them); click a building to inspect and configure it (crop, recipe, sorter
filter, drone link); X removes (refunds), right click or Esc cancels. Drag (or right-drag, arrows) pans, Q/E turn the camera,
the wheel or Z zooms, Space pauses, 1/2/3 set the speed, V cycles overlays (soil, power, water, bees), Tab shows production
stats. The game saves the commission in progress in the browser every 30 s and when the page is hidden; `?menu` opens the level
select and `?play=<id>` (`c1`…`c8`, `sandbox`, `r<seed>-<1..3>`) starts a commission directly.

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
tools/          the commission bot (npm run sim) and its layouts
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
