# Soil n Silo

A solarpunk automation game, build-only and point-and-click: each commission is a seeded valley where you lay out fields,
machines, power and the routes your trucks drive until the farm delivers what a nearby settlement asked for. Soil wears out and comes back,
byproducts have to go somewhere, and the sun sets every few minutes. The current experimental renderer draws a full-resolution,
vertex-coloured 3D valley in the direction of Terra Nil's lush landscape presentation.

- Design: [`docs/DESIGN.md`](docs/DESIGN.md)
- Plan: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- How to work here: [`AGENTS.md`](AGENTS.md)
- Models: [`docs/ASSET_BRIEF.md`](docs/ASSET_BRIEF.md)
- UI revamp (designed, not built yet): [`docs/ui-revamp/`](docs/ui-revamp/README.md), with the design system in
  [`src/ui/clearday/`](src/ui/clearday/README.md)

![Earlier pixel-art rendering of Morning Bread; the experimental renderer can be previewed locally below](docs/screenshot.png)

```sh
npm install
npm run dev          # http://127.0.0.1:5190
npm test             # the game rules (src/game/), in Node
npm run sim -- c2     # a bot plays a commission on the real rules (c1, c2, c2:next, c4), to check it can be cleared and how fast
npm run typecheck
npm run build        # typecheck, then the game into dist/
```

To preview the experimental renderer on the Morning Bread map, run `npm run dev` and open
[`http://127.0.0.1:5190/?play=c2`](http://127.0.0.1:5190/?play=c2). The introduction opens first; choose **Start** to see the valley.

Needs Node 22.18 or later.

**Playing.** Pick a commission (or the sandbox) in the level select. Pick a building in the bar at the bottom, then click or
drag to place a row; click a building to inspect and configure it (crop, recipe, the routes that stop there); select a garage to
buy trucks and give them routes, and click buildings to add them as stops; X removes (refunds), right click or Esc cancels. Drag (or right-drag, arrows) pans, Q/E turn the camera,
the wheel, a trackpad pinch, +/− or Z zooms towards the pointer, Space pauses, 1/2/3 set the speed, V cycles overlays (soil, power,
roads, water, bees), O lists every route (rename, add trucks, copy, edit), Tab shows production stats, and G opens the guide (every building: what it does, how to use it, its numbers). The game saves the commission in progress in the browser every 30 s and when the page is hidden; `?menu` opens the level
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
  world/        the static farm, models, and view that mirrors game state into render objects
  renderer/     the in-repo Three.js renderer and its render-object adapter
  ui/           the HTML HUD and menus over the canvas, and the item icons
    clearday/   the new design system (tokens, components, icons), not wired in yet (docs/ui-revamp/)
assets/         Blender build scripts for the models (the source of truth), exported to public/models/
tools/          the commission bot (npm run sim) and its layouts
  clearday/     generators for the Clearday tokens and icons (Python 3)
test/           unit tests (Node's test runner)
docs/           design, roadmap, asset brief, the UI revamp
```

## Renderer

`src/renderer/verdantRenderer.ts` owns the Three.js scene, lighting, shadows, fog, camera projection and picking. Game views
submit ordinary geometry through a small adapter; game rules and interaction remain outside the renderer. The old pixel renderer
dependency has been removed. This renderer is an early visual experiment, so its direction and performance still need playtesting.

The main render path uses full-resolution WebGL, vertex-coloured meshes and local shader effects for water and simple vegetation or
machine motion. Blender-authored models remain in `assets/` and are loaded as GLB through Three.js. See
[`docs/research/terra-nil-visual-study/`](docs/research/terra-nil-visual-study/) for the visual reference pack and source notes.
