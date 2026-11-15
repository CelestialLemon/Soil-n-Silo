# brush3d's API for the game

What Soil n Silo hands the renderer, and what it gets back. Designed for CelestialLemon/Soil-n-Silo#199, part of the
epic that brings brush3d into the game (CelestialLemon/Soil-n-Silo#212, whose Decisions are binding here). The
developer delegated the approval of this design to the agents (2026-11-14); it was reviewed with Sol.

Every call is marked with where it stands:

- **today**: exists now, under this name.
- **#2xx**: added (or changed to this shape) by that task of the epic, in Soil-n-Silo: #201 first light, #202 the land,
  #203 the models, #204 a world that changes in play, #205 moving parts and building states, #206 the game's tools,
  #207 the weather from the game, #208 one wind and one cloud field, #209 settings, #210 speed, #213 crops and trees.

The shapes marked with a task are this design's proposal. That task may change the details when it meets the real
maps, and records why in its PR and here.

## The rule: the renderer only draws

The game owns the world and its rules: the map, the buildings, the crops, the weather, the water, the wind, lightning.
The renderer draws what it's given and never changes the game's state. What the game reads back is only what the
picture knows: what's under the pointer, where a point of the world is on the screen, and the day's light as drawn.

Two things are shared between the rules and the picture, so they can't disagree: the **wind simulation** (the wind the
turbines feel is the wind in the grass) and the **cloud recipe** (a cloud shadow on a solar panel cuts its power). Both are
plain code with no drawing in them, so the game's rules and tests can use them without a screen.

## One door in

Everything the game uses comes from one file, `src/index.ts` (in the game's repo, since the move, #200:
`brush3d/src/index.ts`). The demo is just another user of it: it imports nothing else. One part of it also stands on
its own: `src/shared.ts`, the wind simulation, the cloud recipe and the land's data and smooth fit (below), which loads in Node with no bundler, for the
rules' tests and bots (the rest needs Vite, for the models and the wind's worker). Anything not exported there is
the renderer's own business and can change without notice: its shaders, materials, passes, uniforms and maps.

```ts
// in the game's src/world/, which keeps the .ts in its imports (tsconfig.json)
import { BrushRenderer, TILE, type Weather } from '../../brush3d/src/index.ts';
```

## Units: metres, and a tile is 4 m

- The renderer works in **metres**, y up. **One game tile is 4 m** (`TILE`, today), as the epic decided: the models, the
  brushes and the speed budget were all made at that size. The rules keep counting in tiles; only the game's world
  layer (`src/world/`) converts.
- **Tile (x, y) on the map is the square of ground from (4x, 4y) to (4x + 4, 4y + 4)**: the map's columns run along x,
  its rows along z, its corner at the origin. So a building of n × n tiles at (x, y) stands at the middle of its
  footprint, (4x + 2n, 4y + 2n). Heights are metres too; how tall one of the game's terrain levels stands at 4 m a tile
  is the developer's look choice, put to them on #201's look PR; until they pick, the game's world layer works at 1 m a
  level (`LEVEL` in `src/world/brush/scale.ts`), the rules' levels as they are, so the land keeps the proportions the
  pixel world gave it.
- **Turns** are radians. A thing's `yaw` turns it about the vertical; the wind's `direction` is where it blows towards,
  from +x towards +z. Which yaw the game's four facings (`Dir` 0..3) map to is the world layer's.
- **Colours** in calls are sRGB hex numbers (`0xcfd6d8`), as a designer would pick them.
- **Two clocks.** `render(seconds)` takes the screen's clock: ripples, swaying, the looks easing. Anything the rules care
  about runs on the game's clock and reaches the renderer as values: the hour, the weather, the wind's ticks, the clouds'
  drift. Paused, the game stops sending changes and stops the clouds (it sends their drift with no speed, `vx` and `vz`
  0, since the renderer carries the clouds on at the speed it was last given); the picture stays alive (water ripples,
  trees settle).

## A frame

```ts
const r = new BrushRenderer(canvas, { shadowFollow: true });      // once (today)
r.setSeason({ season: 'winter', character: 'hard' });             // once per level (today)
// ...build the level: the land, the water, the things (see below)...

function frame(now: number) {
  game.step(dt);
  if (wind.cur) r.setWind(wind.prev!, wind.cur, wind.alpha);      // every frame, once the wind is up (today)
  r.setWeather(weatherFromGame(game));                            // when it changes (today; #207 maps the game's)
  r.setGround(groundFromGame(game));                              // when it changes (today; #207)
  r.setWater(waterFromGame(game));                                // when it changes (today; #202, #207)
  world.sync(game);                                               // things added, moved, swapped, removed (#204)
  r.view.place(camera.now());                                     // (today, #201)
  r.setHour(game.hour);                                           // (today)
  r.render(now / 1000);                                           // (today)
}
```

Send a map only when it has changed (compare with what was last sent): `setWater` lays its whole grid out again (about 9
to 20 ms for a 250 by 250 grid, `docs/WATER.md`), and `setWater` and `setGround` start a fresh ease each time. `setWeather`
is cheap: its looks ease towards whatever was asked last.

## Starting up, quality and the canvas

| What the game does | Call | Stands |
|---|---|---|
| Make the renderer on a canvas | `new BrushRenderer(canvas, options)` | today |
| Pick the quality at start: multisampling, shadow detail, the shelter map's size | `options.samples`, `shadowMapSize`, `shelterSize` (or `r.setQuality` before the first frame) | today |
| Let the shadow follow the view over a big map (the game always wants this) | `options.shadowFollow: true` | today |
| Draw fewer pixels than a high-DPI screen has (the MacBook) | `r.maxPixels = 1920 * 1080` (before `resize`) | today |
| Follow the window | `r.resize(cssWidth, cssHeight)` | today |
| Change the quality from the settings panel without a reload | `r.setQuality(QUALITY.medium)`: presets `high`, `medium` and `low` for the three machines (`docs/PERFORMANCE.md`); `r.quality` is the one drawn | today (#209) |
| Leave a level (free the GPU's memory, or clear for the next commission) | `r.dispose()` | not needed: the game reloads the page for each commission (#201) |

The canvas is the renderer's: it draws every pixel at the screen's resolution. The HUD sits over it in HTML, as now.

## The level

### The land (today, #202)

The game hands over its map, and the renderer paints it (`docs/LAND.md` has how):

```ts
r.setLand({
  width, height,                 // the land in tiles: the map and the country the game draws round it in tiles too
  tile, level,                   // a tile's width and one of the rules' levels' height (metres)
  x0, z0,                        // where the land's north-west corner is (metres)
  // Each tile's own four corners (metres, each a whole number of levels; north-west, north-east, south-east, south-west,
  // tile by tile along a row, rows in order: 4 × width × height values). Where two neighbours' corners along their side
  // meet, the land runs on smoothly; where they don't, the side is a cliff face from one to the other.
  corners: Float32Array,
  // The tiles drawn exactly at their corners' level, flat (width × height, 1 or 0): worked ground, a building's pad, the
  // water's tiles. Elsewhere the land is drawn smoothed (below).
  worked: Uint8Array,
  // What covers each tile (LAND_COVER: grass, bare, track, rock, woods, water) and what ground it is (LAND_GROUND: loam,
  // silt, clay, sand, stony; a subtle tint), width × height each.
  cover: Uint8Array, ground: Uint8Array,
  map: { x, y, width, height },  // the map the player builds on, in the land's tiles; the country round it is drawn duller
  // The country past the tiles, so the camera never sees the end of the world: a coarse grid of heights (metres), a
  // corner at (x0, z0), nx by nz points `cell` metres apart, x fastest. Drawn as distant woods' floor.
  beyond: { nx, nz, cell, x0, z0, height: Float32Array },
}, look?);                        // LandLook: how strong the ground kinds' tint, how dull the country (LAND_LOOK until picked)
r.updateLand({ x, y, width, height }, { corners, worked, cover, ground });   // an earthwork: the new values for just these tiles
```

- The game's world layer gives its levels, cliffs and banks as the corners (`src/world/brush/landMap.ts` in the game).
- Both copy what they're given, and check it: a corner that isn't a whole number of levels, or an array of the wrong
  size, throws (a bug, not the player's doing).
- `updateLand` returns how many tiles really changed (0 when nothing did), and paints the change over the next few frames,
  about 3 ms a frame (5 at most once warm), then swaps it in all at once: the land never shows half an earthwork and no
  frame waits for all of one. Only the ground round the change is painted again.
- **Two surfaces.** The rules keep their own heights (the game's `relief.ts`: two triangles a tile), unchanged. The land
  as drawn is the smooth reading of them the game had (`src/land/surface.ts`, exported from `shared.ts` so the game's
  `Lie` fits the same tiles: within half a level of the rules' height, exactly level on worked tiles and at the water,
  sharp at cliffs), so the hills are the same shape. Under the water's tiles the land sinks into a bed; the game lays its
  water (below) a little under the tiles' level, over it.
- **The drawn surface is the game's to query**, so a truck, a dropped good and the tile cursor sit on what the player
  sees: `r.landAt(x, z)` gives the land's height there (metres), and `r.landHit(ray)` where a line of sight (from
  `r.view.rayAt`) first meets it, or null, on the CPU with no wait for the GPU. The rules go on asking `relief.ts`.
- Not yet: grass tufts where the cover says grass, and the cuts models need where they stand (the water wheel's race in
  its bank, `wheelRace` in the catalogue).

### Water (today; the game's river in #202, floods, ice and mud in #207)

```ts
r.setWater({ nx, nz, cell, x0, z0, level, flowX, flowZ, mud, ice }, ease?);
```

A grid over the land, sent again whenever it changes: per cell the water's surface (metres; `NaN` where dry), its flow
(m/s along x and z), how muddy (0 clear to 1 brown) and how frozen (0 open, 0.3 a skin and shore ice, 1 frozen over). A
change eases in over a moment (`ease` seconds; `0` at once, for a level loading), so a rising flood creeps. The river, its
falls and the ponds are just water in this map, with its flow. `docs/WATER.md` has the detail.

## Things: buildings, vehicles, props and goods (#203, #204, #205, #206)

Anything people made or that moves is a **thing**: inked, standing out from the painted land. The game adds one, moves it,
changes how it looks, and takes it away. The renderer draws its model.

```ts
const models = await loadModels();                       // the solarpunk set (#203; the catalogue is today's MODELS)
const mill = r.addThing(models.mill, { x, z, yaw }, { tag: building.id });
mill.place({ x, z, yaw });                               // moved: a truck every frame, cheaply
truck.place({ x, y, z, yaw, pitch, scale });             // a truck tipped up a ramp; a good shrunk to fit a bed
mill.show({ running: true });                            // its `running_*` look; also `charge` (0..4), `stage`, `variant`
mill.spin(0.4);                                          // its `move_spin_*` parts, turns a second (#205)
mill.status = 'working';                                 // 'working' | 'idle' | 'unpowered' | 'weather' | 'building' (#205)
mill.highlight = true;                                   // under the pointer, or selected (#206)
mill.tint = { color: 0x90ff90, strength: 0.45 };         // or null (#206)
mill.visible = false;
mill.remove();
```

- **Models.** `MODELS` (today) is the catalogue of the 28 solarpunk models: each one's name, footprint in tiles, size
  and named parts (`docs/MODELS.md`). The 22 buildings and vehicles are built on the game's own footprints, so a model
  stands on its building's tiles with no fitting. `loadModels()` (#203) loads them all, once per game.
- **The game's id goes with it** (`tag`): picking a thing gives the tag back, so the game never has to keep its own map
  from renderer objects to buildings (as it does with pixel3d today).
- **Placed on the land.** Leave `y` out and the thing stands on the land under its middle; give it for a thing on a
  bridge or a truck's bed. `pitch` tips it nose up (radians, after the yaw; a truck on a ramp), `scale` sizes it (1 by
  default; the goods the game fits into a bed).
- **States** (#205), each telling the player something without a click: working, idle, no power, stopped by the
  weather, under construction. How each looks is the developer's pick; the call is just the state.
- **Who owns what.** Three calls, each with its own job, so none overrides another: `spin` alone turns the moving parts
  (0 holds them still), `show` alone switches the running looks and the charge, and `status` only decorates (its tint,
  its lights dimmed, its scaffold). So the game says each: a mill with no power gets `spin(0)`, `show({ running: false })`
  and `status = 'unpowered'`; an anemometer turns in the wind whatever its power, because the game keeps its spin.
- **Markers.** A building with a problem also gets a small marker over it, to spot from afar. The marker is the game's
  HUD (HTML, as now); the renderer says where it goes: `thing.anchor` is the point over the thing's model, in metres
  (#206), which `r.view.toScreen` puts on the page.
- **Spinning parts** turn at the rate the game gives (it knows the wind at a turbine, the river's flow at the wheel); the
  renderer turns the part, its ink and its shadow smoothly.
- **Goods** in a truck's bed are things too, placed by the game as the truck moves (a call per good per frame is cheap).
- **Today** the models load with `loadModel(url)` and go into one merged mesh per scene with `ModelSet`, at load:
  nothing moves or changes after. `r.add(geometry, kind)` / `r.remove(mesh)` add and remove whole meshes. #204 builds
  the per-thing handles over them, with no hitch when one changes.

## What grows: crops, trees and rocks (#204, #213)

What grows is **painted**, not modelled, so the renderer makes it from a few words rather than from a model:

```ts
const crop = r.addCrop({ x, z, crop: 'wheat', stage: 1 }, { tag: field.id });   // one tile of a field
crop.set({ stage: 2 });                                                        // grows, ripens, is harvested, is sown
const oak = r.addTree({ x, z, species: 'oak', size: 0.3, seed }, { tag });     // a sapling growing: size 0..1
oak.set({ size: 1 });
const rock = r.addRock({ x, z, size, seed }, { tag });
crop.remove(); oak.remove(); rock.remove();
```

- **Plants are handled as things are**: each has `highlight`, `tint`, `visible` and `preview` (a crop or a sapling
  being planted, see-through, never picked), and picking one gives its tag. A field's tiles share the field's tag, so
  the game highlights or tints a whole field by setting each of its tiles.
- **Crops**: the game's five (wheat, beans, tomato, sunflower, flax), each at its four stages, readable at a glance, a
  flowering field showing its flowers (#213). One call per tile, centred on it. The field's bed and frame are inked: a
  thing (#203).
- **Trees**: the game's six species (oak, birch, pine, willow, poplar, apple), each in its season's look (the season is
  set once per level, so the game never says it again), with its own spring in the wind.
- Crowns keep some rain and snow off what's under them and everything casts its shadow, as the renderer sees fit. What
  stops the wind is the game's to say: it gives the wind simulation its obstacles (hedges, crowns, buildings; below).
- **Today** the painting kit grows them: `growTree` and `Grove` (trees with their season's dress), `addStone`,
  `addTuft`, `addMound`, `addFlowers`, the demo's wheat, and the plant kit below (#213's groundwork). They are baked
  into meshes the caller keeps, takes out with `r.remove` and makes anew when something changes (the game's wild.ts
  does this per field, per sapling and per 8 × 8 tiles of trees); the handles above replace that (#204).

## The camera

The camera stays as it is in the game (the epic's decision): the same 30° pitch, the same four turns, the same zoom range
and the same number of tiles on screen. The game keeps its own camera controller (its easing, its zoom towards the
pointer, keeping the view over the map) and tells the renderer where it is each frame.

| What the game does | Call | Stands |
|---|---|---|
| Where the camera is: the ground point in the middle of the screen, which way it looks from, how close (zoom in CSS pixels a metre, as the game's) | `r.view.place({ x, y, z, heading, zoom })` | today (#201) |
| (The demo's own camera: target, `view` 0..3, `zoom`, `turn`, `pan`, `update`) | `r.view` (`ViewCamera`) | today |
| Where a point of the world is on the page (for the HUD's markers, labels and the cursor), as `{ x, y }` | `r.view.toScreen(x, y, z)` | today (#201) |
| The line of sight under the pointer (to find the tile under it: `r.landHit(ray)`, above), into a ray if given | `r.view.rayAt(clientX, clientY, into?)` | today (#201) |
| The pitch, and the zoom range the demo uses | `PITCH`, `MIN_ZOOM`, `MAX_ZOOM` | today |

- `heading` is where the camera looks from, radians: 45° + 90° × the view at rest, eased by the game in between.
- `zoom` in `place` is **CSS pixels per metre**, as the game counts it, so a high-DPI screen (the MacBook) shows the same
  tiles as any other. (`r.view.zoom` counts the screen's device pixels; `place` converts, and `toScreen` and `rayAt` take
  and give CSS pixels, as pointer events do.) Place the view each frame before asking `toScreen` or `rayAt`, and don't
  call `r.view.update` (the demo's own controller) with it.
- The camera sits back from its target as far as the view needs (`r.view.distance`): at the game's widest zoom the view
  is hundreds of metres tall, so it sits back far enough to see the land's top (`r.view.landTop`, which the renderer keeps
  from the ground it's given) and what stands on it at the bottom of the screen, and sees far enough past the land at the
  top. At the demo's zooms it stays where it was (120 m).
- **At 4 m a tile the game's zoom range becomes 4 to 24 px per metre** (16 to 96 px per tile, starting at 8), well below
  the 16 to 192 brush3d was tuned at (the demo's views are 22 to 40). So the game's
  widest view shows much more land than brush3d has drawn, with smaller brush marks and thinner lines on screen. #201
  checks how the paint holds there (the brush marks' size on screen, shimmer under a pan, the lines), and #210 what the
  extra land costs; anything that changes the look comes to the developer as options.
  **What #201 found** (the game's first light on the RX 570, stills and a slow pan at 4 px a metre): the paint holds. The
  ground's brush marks shrink to a soft colour wash (two strokes a metre is two pixels a stroke) rather than shimmering;
  outlines and shadows stay put under a pan, with slightly stepped edges on the shadows; the clouds' shadows read as
  big soft patches across the whole map. Nothing there needs a fix before the real land (#202) and models (#203).

## Picking: what's under the pointer (#206)

```ts
const hit = r.pick(clientX, clientY);              // at once (waits for the GPU): for a click
r.requestPick(clientX, clientY).then((hit) => {});  // a frame or two later, never stalling: for hovering
// hit: { tag, what: 'thing' | 'plant' | 'land' | 'water', point: { x, y, z } } | null
```

- `tag` is the game's id given with the thing or plant (null for the land and the water); `point` is where the pointer
  meets what's drawn there, so the game finds the tile from it (`Math.floor(point.x / TILE)`).
- A build preview is never picked: the pick sees through it, to what's behind.
- Like pixel3d's `pick` and `requestPick`, so the game's hover logic carries over.

## The game's tools on the picture (#206)

Each of these is the developer's pick of a few looks, readable in any weather and at any hour; the calls are just what
the game wants shown.

| What the game shows | Call |
|---|---|
| A thing or plant under the pointer or selected | `thing.highlight = true` (a field: each of its tiles) |
| A thing or plant tinted for what's in focus (a truck's stops, the buildings next door that would trade) | `thing.tint = { color, strength }` |
| The building being placed, see-through, green where it fits or red where it doesn't (never picked, casts no shadow) | `r.addThing(model, place, { preview: 'fits' })`, then `thing.preview = 'blocked'` |
| A colour per tile washed over the land: fertility, ground, height, water, power, roads, bees | `r.setOverlay({ width, height, color: Uint32Array, strength })` (a colour per tile, sRGB; `NONE` leaves the tile clear) or `null` |
| Routes on the ground, the power networks' wires between pylon tops (sagging), a range's dashed ring | `r.setLines([{ points: [{ x, y?, z }, ...], color, style: 'route' \| 'wire' \| 'dashed' }])`: a point with no `y` lies on the land |
| The tile grid and the contour lines while building or doing earthworks | `r.setGrid(true)` |
| The tile cursor and the marks of an earthwork | the game's own canvas over the view, as now, placed with `r.view.toScreen` |
| The HUD's markers, labels and tags | HTML, as now, placed with `r.view.toScreen` (a marker at `thing.anchor`) |

## The hour and the season (today)

```ts
r.setSeason({ season, character, sunrise, sunset });   // once per level: the game's season, its twist, its day
r.setHour(hour);                                       // every frame, the game's clock hour (0..24)
r.day;                                                 // the day as drawn: sunrise, noon, sunset
```

The season turns the land's colours, the trees' dress and the sun's path; the hour lights the picture by the season's day
(the game's sunrise and sunset, which its solar power follows). `docs/DIRECTION.md` has why.

## The weather (today; the game's weather mapped onto it in #207)

```ts
r.setWeather({ cloud, drift, cloudSeed, sunUnder, storm, rain, snow, heat, haze: { amount, color, top, base, kind } });
r.strike({ x, z, strength, seed });    // a lightning strike, now, where the game says
r.flicker({ strength, bearing });      // distant lightning, now
r.setDustSource({ nx, nz, cell, x0, z0, lift, ground });   // where a dust storm can lift dust off bare, dry ground
```

- The **cloud cover is drawn exactly as given**, because the game reads it (a cloud shadow cuts a panel's power); the
  looks (the light, rain, snow, the heat, the haze) ease over a second and a half to hide the steps between the game's
  updates. `setWeather(w, true)` skips the ease (a level loading).
- Rain and snow are separate, so sleet is both. A blizzard is heavy snow in a strong wind; a storm darkens before its
  rain and lifts before it stops. Lightning is the game's: it picks where and when (seeded, so a save replays the same),
  and the renderer keeps every flash within the flash-safety limits whatever it asks.
- `WEATHER_PRESETS` are shorthands for the demo and the tools; the game sends its own values.

## The ground's state (today; per-tile maps from the game in #207)

```ts
r.setGround({ nx, nz, cell, x0, z0, snow, frost, wet, mud }, ease?);
```

How deep the snow lies, how much frost, how wet and how muddy, per cell (0..1 each), on a grid like the water's. A map
of one cell covers the whole land, so the game can start with one value for the valley (as it has today) and send
per-tile maps when #207 adds them. None settles under a roof, and less under a crown: that's the renderer's, from what
it draws. `docs/GROUND.md` has the detail.

## The wind, for the rules and the picture (today; the game's turbines since #208)

The game owns the wind. Its rules step the **gusts** (`WindRecipe`) on their own clock, one of the wind's ticks a game step,
and read them at each turbine; the picture steps the **air under them** (`WindSim`, in a worker) from the same gusts and
draws it. `docs/WIND.md` has the contract.

```ts
// The rules (the game's src/game/overhead.ts): the gusts alone, a tick a step, saved with the game as plain data.
const gusts = new WindRecipe({ nx, nz, cell, x0, z0 }, goal, { seed });   // or { state: saved } to carry on
gusts.setGoal(goal); gusts.step();  // each game step (TICK, 0.1 s)
gusts.gustAt(x, z);                 // the free air's speed there, as a share of the wind's (1 on average): a turbine's
gusts.state;                        // plain data for the save
// The picture: the air under the same gusts, in a worker.
const wind = startWind({ nx, nz, cell, x0, z0 }, obstacles, goal, { state: gusts.state });   // starts on the rules' gusts
// Its first snapshot comes from the worker a moment later: wind.cur is null until then (wait with `await wind.idle()`,
// or draw a steadyWind meanwhile).
wind.setGoal(goal);                 // what the weather wants; eases there over a few seconds
wind.advance(gameSeconds);          // each frame, by game time (nothing while paused)
// or, as the game does, each frame: the rules' ticks since the last, each with its goal, then how far into the next
// for (each tick) { wind.setGoal(goalThen); wind.advance(TICK); }  wind.lead(carry / TICK);
// if (wind.pending > 30) wind.setState(gusts.state);   // too far behind (a slow machine, 16×): jump to the rules' gusts
wind.setObstacles(obstacles);       // a building put up, a tree felled: the air flows round them from the next tick
wind.at(x, z, height);              // between the last two ticks, as the frame sees it: for the picture only
if (wind.cur) r.setWind(wind.prev!, wind.cur, wind.alpha);
r.restartWind();                    // a new wind, not a continuation (a level loading): the trees and dust start at rest
```

| Piece | Stands |
|---|---|
| `WindRecipe`: the gusts without the air, stepped by the rules; `gustAt`, `freeAt` (the free air, bit for bit the engine's); its `state` plain data | today (#208) |
| `WindWorker` (the simulation in a worker; today the caller makes the worker from `wind/worker.ts`) | today |
| `startWind(...)`: the same, making its own worker, so the game never names the worker's file | today |
| `options.state`: a wind (`WindSim`, the worker) or gusts started from a `WindRecipe`'s or a save's state, the air steady under it | today (#208) |
| `wind.onTick(f)`, `snap.tick`, `windAt(snap, ...)`: each tick of the air, in order | today |
| `WindSim` and `windAt(snapshot, x, z, height)`: the same simulation with no worker, for tests and tools | today |
| Obstacles: a circle, a strip or a turned box in metres, `solid` with a height (a building) or with a `drag` (`DRAG.hedge`, `DRAG.crown`) | today |
| `WindSim.setObstacles(list)` and `setState(state)`: the obstacles change in play, the gusts jump to the rules'; a save (version 3) keeps the obstacles | today (#208) |
| The same through the worker, `wind.setObstacles(list)` and `wind.setState(state)`, queued against the ticks (a `setState` drops the ticks not yet stepped) | today (#208) |
| `wind.lead(fraction)` and `wind.pending`: a game that gives the worker whole ticks puts its clock into the next, and sees how far behind the worker is | today (#208) |
| `steadyWind(speed, direction)`: one even wind, for a scene with no simulation | today |
| `r.restartWind()` | today |
| The game's turbines reading the gusts (and the panels the clouds' shadows, below) | today (#208) |

- **Why the rules need only the gusts.** By the height rule (`docs/WIND.md`), from 8 m up the wind is the free air alone,
  the gusts' own, and a turbine's rotor stands 14.4 m up. So the rules step `WindRecipe`, a few microseconds a step, with
  no worker, no WebAssembly and no 960 KB of air in the save, and every machine gets the same power for the same step,
  however slow its worker. The air under the gusts is what the grass, the trees and the dust show; the shelter a turbine
  gets is still the rules' own number (what stands round it), which the placement card shows.
- **One clock.** The gusts step once a game step, so the wind's tick is the game's step: a save keeps them exactly
  (nothing of a tick is lost), and the picture's worker is fed the same goals, tick for tick, from the same state.
- **Both sides lay the gusts from the grid's centre** (`x0 + nx·cell/2`), not from its cells, so the rules and the picture
  must share the centre; the cell size can differ (the rules never step the air at all).

The simulation covers up to 256 by 256 cells; the game uses 2 m cells, so its world reaches past a commission's map by
about 32 m (the game's `windGrid`).

## The clouds, for the rules and the picture (today; the panels since #208 and CelestialLemon/Soil-n-Silo#198)

```ts
const shade = cloudShade(x, z, { cover, x: drift.x, z: drift.z, seed });   // 0 in the sun .. 1 in full cloud shadow
const speed = cloudDriftSpeed(windAloft);                                   // how fast the game carries the drift
```

`CLOUD_SHAPE` is the clouds' look, fixed for the game (the developer's pick). The game carries the clouds' drift on at
`cloudDriftSpeed` and sends it with `setWeather({ cloud, drift: { x, z, vx, vz }, cloudSeed })`: the position exactly, and
the speed the renderer carries them on at between updates, so each panel sees the clouds exactly where they're drawn
(paused, the speed is 0). The shaded share of the land matches the cover on average, so the solar balance holds.

The game's rule (#198): a panel under a cloud's shadow loses the share of its sun the valley's cloud takes, one in the sun
loses none, `(1 − 0.65·cloud·shade/cover) / (1 − 0.65·cloud)` of the valley's sun (the game's `lightOver`), so across the
land and over the days it makes the valley's power. The rules sample the shade at the middle of a panel's footprint.

## Settings (today; in the game's settings panel since #209)

| Setting | Call | Stands |
|---|---|---|
| Ink lines on or off | `r.settings.lines` | today |
| Sun shadows on or off | `r.settings.shadows` | today |
| How much rain and snow falls (1 full, about a third reduced) | `r.settings.fallingShare` | today |
| Lightning flashes: full, gentle or off | `r.lightning.setting` (it stays there: #209) | today |
| Graphics quality presets for the three machines | `r.setQuality(QUALITY.medium)` (`high`, `medium`, `low`) | today |

Each takes effect on the next frame. The game saves them with its own settings (`src/world/brush/settings.ts`): the
quality (high by default), rain and snow (all, or `fallingShare` 0.33) and the lightning flashes (full by default, which
keeps within the flash-safety limits; gentle and off soften it further).

## Tools, for measuring and comparing (today)

Not for the game's players, but kept public for the tools that judge renderer work (`shot`, `video`, `profile`,
`motion`, `pops`, `flash`) and the game's `bench`:

- `r.timer = new PassTimer(...)`: the cost of each pass of a frame, on the GPU and the CPU (`docs/PERFORMANCE.md`).
- `r.output`: draw the frame into a target rather than the canvas (profiling).
- `r.setVisible(kind, on)`: show or hide a kind (`'ground'`, `'ink'`, `'foliage'`, `'rain'`...), for A/B comparisons.
- `r.settings.falling` (leave out what's in the air), `prepass`, `waterScissor`, `equalDepth`, `shelterDebug`, `grain`.
- `r.setTime(seconds)`: set the renderer's clock without drawing, so a map sent next starts its ease from
  there.
- `r.lightning.clock`: the lightning's clock (real seconds by default), held still to time or film a flash at its height.
- `r.gl`: the WebGL renderer, for the GPU's name and the like.

## The painting kit: the level below (today)

Until the calls above exist, the demo (and the game's first light, #201) build their worlds with the kit the demo scenes
are made of. It's exported too, but it's the level below the game's API: when #202, #203, #204 and #213 add the calls
above, the game stops using it and it becomes the renderer's own.

- `r.add(geometry, kind, options)` and `r.remove(mesh)`: a mesh of one kind (`'ground'`, `'grass'`, `'crop'`,
  `'foliage'`, `'paint'`, `'ink'`, `'water'`), with how it casts shadows, shelters, reflects and turns with the season.
  `remove` frees the tiles it cut a mesh into (`tile`); a geometry the caller gave stays the caller's to dispose.
  Give the ground its square (`fields`) even when its brush isn't baked: the clouds' map is laid over it, and without it
  covers only 128 m round the origin, the clouds' shadows smeared in streaks past it (#201).
  `r.setFields(kind, size)` bakes a kind's brush once the scene is built; `r.shelter.changed()` after moving cover.
- `MeshBuilder` and `Paint`: geometry in the renderer's format (colours, normals, the brush per vertex, tree ids).
- `growTree`, `Grove`, `dressFor`, `addStone`, `addTuft`, `addReeds`, `addMound`, `addFlowers`, `groundOf`, `MapLine`:
  the demo's pieces. `Grove.addTo(r, options)` adds its meshes with the given options and returns them. A `Tree`'s
  `stroke` (broader, fewer strokes) and `fill` (the share of a crown's outer strokes) thin it for a crowd; 1 is the demo's.
- The plant kit (`kit/plants.ts`, #213): `CropPatch` (a field's crop, one `CropTile` a tile with which neighbours it
  joins, at its stage 0–3; `addTo(r)` returns its meshes), `speciesTree(species, x, z, size, seed)` and `speciesHeight`
  (a `Tree` for each of `SPECIES`: the game's six and its bush), `addCanopy` (a far wood's crown, a few broad strokes in
  the species' colour for the season), `CROP_NAMES`. The groundwork paints every crop as the demo's wheat and pine,
  willow and poplar on the kit's shapes; #213's look work gives each its own.
- `loadModel` and `ModelSet`: the models, merged into the inked and planted meshes; `MODELS`, `TILE`, `blocksWind`,
  `wheelRace` from the catalogue.

## What the game stops doing

The game's pixel3d calls and what replaces each:

| The game today (pixel3d) | brush3d |
|---|---|
| `new PixelRenderer(canvas, bakedScene)`, `quantizePalette` | `new BrushRenderer(canvas, options)`, `setLand`: no palette, no baked scene |
| `addObject(geometry)`, `setTransform`, `visible`, `remove()` | `addThing(model, place)`, `place`, `visible`, `remove()` |
| The idle / running / turbine speed / battery level geometries swapped | `thing.show({ running, charge })`, `thing.spin(rate)` |
| `highlight`, `tint`, `tintStrength`, `opacity` (the build preview) | `highlight`, `tint`, `preview` |
| `pick`, `requestPick` returning an object to look up | `pick`, `requestPick` returning the game's `tag` |
| `placeCamera(target, azimuth, elevation, viewHeight)`, `camera` | `r.view.place({ x, y, z, heading, zoom })`, `r.view.toScreen` |
| `setLook(greyLook(lookAt(hour), weather))` | `setHour(hour)` and `setWeather(...)`: the renderer greys the day itself |
| `setWeather({ precipitation, intensity, cloudCover, wind, gusts, haze... })` | `setWeather({ cloud, rain, snow, haze... })`, `setWind(...)` |
| The game's own snow, rime, flood and ice views, `greyLook` | `setGround`, `setWater`, `setWeather`: gone from the game (#207, #211) |
| Overlays, routes and power lines as objects on the ground | `setOverlay`, `setLines` (#206) |
| `renderGeometry(time)`, `renderStyle(time)` | `render(seconds)` |
| Art pixel size, supersampling, the palette size | gone: the picture is drawn at the screen's resolution |

## Where the code is

| Folder | What | Whose |
|---|---|---|
| `src/index.ts` | The API: everything above that exists | the game's door in |
| `src/shared.ts` | The wind simulation, its gusts (`WindRecipe`), the cloud recipe, the land's data and smooth fit, and `TILE`, loadable in Node on their own (the index exports them too) | shared with the rules |
| `src/renderer/` | The renderer: its passes, materials, shaders and looks | the renderer's own |
| `src/land/` | The land painted from the game's map: what the game sends (`map.ts`), the smooth fit (`surface.ts`), the painting and earthworks (`paint.ts`) | the renderer's own (`map.ts` and `surface.ts` shared with the rules) |
| `src/wind/` | The wind simulation (no drawing; a worker host) | shared with the rules |
| `src/kit/` | The painting kit: `MeshBuilder`, trees, stones, tufts, the models' loader | below the API (see above) |
| `src/models/` | The solarpunk models (`*.glb`, written by `tools/blender/`) and their catalogue | the game's models |
| `src/demo/` | The demo viewer and its scenes (farm, meadow, water patch, gallery), the scripted weather | one user of the API |
| `tools/` | Stills, videos, profiles, the shimmer, pop and flash checks, the wind, cloud, water and land tests | the renderer's tests |

The tools are tests of the renderer's insides, so they may reach past the API (the cloud test reads the cloud map back,
the flash check watches the flash limiter); the demo may not (`npm run typecheck` fails if it does).
