# brush3d

A painterly 3D renderer for three.js games: **painted worlds, inked things**. Made for Soil n Silo, the solarpunk farming game
whose repo this is, to find out whether it can look like the reference below instead of pixel art. It is now the game's
renderer: it replaced the pixel-art one, [pixel3d-renderer](https://github.com/CelestialLemon/pixel3d-renderer), in epic #212
(the swap, #211).

It began as its own repo, [brush3d-renderer](https://github.com/CelestialLemon/brush3d-renderer) (archived), and moved here
with its history in #200; it is worked on here, in this folder. **Issue numbers in this folder:** a bare `#1` to `#68` is one of
brush3d-renderer's (`#36` is CelestialLemon/brush3d-renderer#36), written there; `#199` and up are this repo's. New text names an
old one in full (`brush3d-renderer#36`), and a bare number it writes is this repo's.

The look is taken from [*Dear Alice*](https://www.youtube.com/watch?v=z-Ng5ZvrDm4) (The Line, 2021; the aerial shot of the farm at
0:37 is almost exactly the game's camera): the land is painted (no outlines, brushy, colour drifting across every
surface, teal and violet shadows, gold rim light, blue distance), and the things people made are inked (clean coloured lines,
crisp cel bands). In a builder that split does real work: everything the player placed or that moves stands out from the land.
`docs/DIRECTION.md` has the rules.

**Try it:** the demo sits beside the game in every build on GitHub Pages, in its `brush3d/` folder:
[as on `dev`](https://celestiallemon.github.io/Soil-n-Silo/dev/brush3d/) and
[on `main`](https://celestiallemon.github.io/Soil-n-Silo/main/brush3d/). Every open pull request has its own preview of both
at `.../pr-<number>/` and `.../pr-<number>/brush3d/`, linked in a comment on it and removed when it closes
(`.github/workflows/pages.yml` at the repo's root).

From the repo's root (one `package.json` for the game and the renderer; the renderer's scripts are `render:*`):

```sh
npm install
npm run dev                  # the game at http://127.0.0.1:5190/, the demo at http://127.0.0.1:5190/brush3d/:
                             # drag to pan, wheel to zoom, Q/E to turn, 1-5 for the hour, L for lines
npm run typecheck            # the game and the renderer, their tests and tools, and that the demo uses only the API
npm test                     # the game's tests, the renderer's own (brush3d/test/), and its wind, water, view and land checks (brush3d/tools/wind.ts, water.ts, view.ts, land.ts)
npm run render:test:clouds   # the cloud recipe against its GLSL twin, in a browser (needs the dev server)
npm run render:shot -- out "hour=12" "hour=17.5&view=2"   # headless frames as PNGs (needs the dev server)
npm run render:motion -- out "zoom=40"                    # how steady the picture is under sub-pixel pans
npm run render:video -- out pan turn wind                 # moves recorded as mp4 (needs ffmpeg)
npm run render:video -- out wind-ramp                     # the wind rising from calm to a hurricane and dying down again
npm run render:video -- out weather-ramp timeline         # clear to overcast and back; the demo's scripted weather
npm run render:pops -- out "wind=storm"                   # swatch pops in the wind: patches that change colour all at once
npm run render:profile -- out                             # what a frame costs, pass by pass, on the GPU (docs/PERFORMANCE.md)
npm run render:flash                                      # the lightning against the flash limits (about 10 minutes)
npm run render:build:wind                                 # rebuild the wind's engine after a change to src/wind/sim.c
```

The tools draw the demo from the dev server at `http://127.0.0.1:5190/brush3d`; `DEMO_URL` points them at another (one
started on its own port, `DEMO_URL=http://127.0.0.1:5300/brush3d`). `node brush3d/tools/<tool>.ts` runs any of them directly.

The demo's URL takes `scene` (`farm`, the default, or `meadow`), `view` (0-3), `zoom` (screen px per metre, 16-192), `hour`, `x`/`z` (the camera's target), `t` (freeze
the clock), `lines=0`, `shadows=0`, `still` (hide the buttons), and the wind: `wind` (m/s, or `calm`, `breeze`,
`gale`, `storm`, `hurricane`), `windDir` (degrees it blows towards) and `gust` (0-1). The weather: `weather` (a preset:
`clear`, `scattered`, `overcast`, `soft-rain`, `storm`, `fog`, `dust`, `heat-wave`, `snow`, `blizzard`), then any value
over it, `cloud`, `rain`, `snow`, `heat`, `haze` (0-1), `hazeColor` (hex), `hazeTop` and `hazeBase` (metres) and `hazeKind`
(`fog` or `dust`); `timeline` plays a scripted spell standing in for the game (`timeline=3` at 3× its speed; `spell` a
`shower`, a morning `fog` or a `dust` storm), and `falling=0` leaves out the things in the air
(rain, snow, the wind's leaves) for the stability tools. `samples` (MSAA) and `shadowMap`
(texels) try quality settings, `prepass=0`, `scissor=0` and `equal=0` turn off speed-ups (for comparing), `ground=live`,
`grass=live` and `crop=live` work that kind's brush out in every pixel rather than reading it from the textures baked
at load, and `profile` times
the frame on whatever machine opens it.

The game owns the wind: it simulates it over the world (`src/wind`, `docs/WIND.md`) and gives the renderer each frame's
`renderer.setWind(prev, cur, alpha)`, its last two ticks and how far between them, drawn exactly as given (a scene with no
game wind gives `steadyWind(speed, direction)`). Each blade and crown reads the wind where it stands. Trees lean into
the gusts and rock to a stop on their own springs, each kind its own, bending from the foot; leaves flutter, gusts roll over the grass and through the wheat, the water chops, and from a gale up
leaves show their pale undersides and blow through the air. `src/renderer/wind.ts` has the scale and the curves.

The game sets the weather with `renderer.setWeather({ cloud, rain, snow, heat, haze: { amount, color, top, base, kind } })`,
the same over the whole valley, beside `setWind`. A haze lies on the land up to its `top` (from its `base`, if it has one:
low cloud); a `fog` (the default) lingers and the wind thins it, `dust` is carried by the wind and turns the light orange.
`heat` is the heat wave's hot, bleached light. The cloud cover is drawn exactly as given (gameplay reads it: cloud shadows cut
solar panels' power); the looks ease over about a second and a half, hiding the steps between the game's updates, and
`setWeather(weather, true)` skips the ease (a level loading). `src/renderer/weather.ts` has the presets.

The renderer is only the presentation layer: the game owns the state and the logic of the wind, the water and the weather, and
anything they cause, and the renderer draws what it's given. Weather was an epic, #3 (done).

The farm's buildings and props are a set of 28 solarpunk models made for the game by Blender scripts
([docs/MODELS.md](docs/MODELS.md)). Step through them with the ◀ ▶ buttons in the demo's controls, open one with
`?focus=<name>` (say `?focus=bakery`), or see them all side by side in the gallery (`?scene=gallery`).

## How it draws

- **One G-buffer pass** at the screen's resolution, 4× MSAA: colour, plus view normal, view depth and an ink flag. Its
  silhouettes are drawn first, depth only, so each pixel is painted once, by the surface that shows.
- **Painted materials** (ground, grass, foliage, water, crops) shade in OKLab: three bands (shade, half-tone, lit) whose edges
  are broken by brush dabs and strokes keyed to world positions, so the paint stays put as the camera moves. Shade leans to the
  hour's hue (teal at noon, violet at dusk), the colour drifts in hue and value across a surface, and foliage is clumps of leafy
  dabs whose normals are the crown's.
- **Inked materials** shade in crisp cel bands; the post pass draws their lines in a darker shade of their own colour, only on
  their side of an edge, thinner as the camera zooms out.
- **Post**: lines, distance haze, grade, sRGB.

## Layout

Paths here are inside `brush3d/`. The game (and the demo) use the renderer through one door, `src/index.ts`
(`brush3d/src/index.ts` from the game; `src/shared.ts` for what the game's rules read in Node: the wind, the cloud
recipe and the land's smooth fit); [docs/API.md](docs/API.md) has the API, in the game's terms, and what later tasks add to it.

- `src/index.ts`: the API. The demo imports nothing else.
- `src/renderer/`: the renderer (`renderer.ts`), its materials and GLSL, the camera, the time-of-day looks, and the tiles big
  meshes are cut into so each pass draws only what it sees (`tiles.ts`), and the shared buffers the meshes are drawn from,
  many to a draw call (`pools.ts`).
- `src/land/`: the land painted from the game's map: what the game sends (`map.ts`), the smooth fit (`surface.ts`) and
  the painting and earthworks (`paint.ts`) (`docs/LAND.md`).
- `src/wind/`: the living wind's simulation, which the game's rules read too (`docs/WIND.md`).
- `src/kit/`: the painting kit the scenes are built with: `MeshBuilder` and `addDab` (`builder.ts`), the pieces (`kit.ts`:
  trees, stones, grass, reeds, lines on the map, water), the trees' season dress (`seasonTrees.ts`), the game's crops and
  species (`plants.ts`), the far woods' crowns (`farWoods.ts`, loads in Node) and the models' importer (`model.ts`).
- `src/models/`: the models, `*.glb`, listed by `catalog.ts` (`docs/MODELS.md`).
- `src/demo/`: the demo viewer, the scripted weather standing in for the game (`timeline.ts`), and its scenes in
  `scenes/`: `farm.ts` (the *Dear Alice* aerial, rebuilt and grown into a valley), `meadow.ts` (the first slice),
  `waterPatch.ts` (the water's test patch) and `gallery.ts` (every model on its own plot).
- `index.html`: the demo's page (the game's Vite build makes it `dist/brush3d/`).
- `tools/`: headless capture (`shot.ts`), motion measurement (`motion.ts`), pops in the wind (`pops.ts`), videos
  (`video.ts`), the frame's cost (`profile.ts`) and the lightning's flash check (`flash.ts`), on `browser.ts`; the wind's,
  water's, clouds' and land's checks (`wind.ts`, `water.ts`, `clouds.ts`, `land.ts`), the wind engine's build (`wind-build.ts`), and the check
  that the demo imports only the API (`demo-imports.ts`).
- `tools/blender/`: the scripts that make the models (`build.py`, the shared `kit.py`, one script a model in `models/`).
- `test/`: the renderer's unit tests, run in Node by `npm test` (`farWoods.test.ts`: the far woods' crowns; `tuft.test.ts`,
  `flower.test.ts`: how far a grass tuft and a wildflower reach).
- `docs/`: the look's rules (`DIRECTION.md`), the renderer's roadmap (`ROADMAP.md`), the API, and the notes on models,
  performance, wind, water, ground and the land.
- `reference/`: how to pull frames from the reference film (kept out of git: they're copyrighted).
