# Roadmap

Goal: the game in [`DESIGN.md`](DESIGN.md), a build-only solarpunk automation game played in seeded commissions of 30–60 minutes.
The game is drawn by brush3d, the painterly renderer, which lives in this repo in [`brush3d/`](../brush3d/README.md) (its
own roadmap is [`brush3d/docs/ROADMAP.md`](../brush3d/docs/ROADMAP.md)). See `AGENTS.md`, "The renderer (brush3d)".

Items are roughly in priority order within each section.

## History

- **2026-10-06/07: the season MVP.** A Stardew-like point-and-click farm (one 28-day season, 20,000g target, hand tools,
  chickens, mill and oven). Built and playable (milestones 0–5), then replaced; see git history before the pivot.
- **2026-10-09: the pivot.** The only player is the designer, so unlocking content isn't a reward loop; an automation game's
  loop (build, find the bottleneck, fix it) is. Short seeded levels are also quicker to test. Solarpunk setting chosen over
  low-magic medieval because power (sun, wind, storage) and closed loops are mechanics, not just looks.

## Renderer

brush3d (`brush3d/`), in this repo since #200. The game owns the loop, state, input, UI, audio and save; the renderer
draws, and answers "what is under the pointer" (`pick`). The game's side of it is `src/world/brush/`, behind the `Scene` in
`src/world/scene.ts`; what the game still wants from it is in `brush3d/docs/ROADMAP.md`. Until 2026-11-16 the game was drawn
with pixel3d-renderer; its needs and workarounds are in git history (#211).

## v0.1: the pivot (2026-10-09)

- Game rules in `src/game/`: goods, crops, buildings and recipes as data (`data.ts`); seeded maps (`map.ts`); commissions
  (`scenarios.ts`); the fixed-step simulation (`src/game/sim/`): belts, splitters, sorters, crossings, drone pads (replaced by silos, below), fields with
  fertility, water and pollination, machines with strict byproducts, pylon power networks with batteries, goals and medals;
  building and configuring (`build.ts`); saves (`save.ts`). Unit tests in `test/`.
- `npm run sim`: a bot builds a fixed layout as credits allow and plays a commission on the real rules (layouts for First
  Light, Morning Bread and Linen for the Looms so far, `tools/layouts.ts`). `npm test` plays every layout and checks it clears
  its commission within the target time.
- The world (`src/world/`): the static terrain per map, every building/crop/good as a Blender model or an in-code stand-in,
  status markers, goods on belts, drones in flight, overlays.
- The HUD (`src/ui/`): commission clock and medal pace, credits, power and weather, goals, build bar, inspector, stats, intro,
  pause and results screens, and the level select (campaign, random commission from a seed, sandbox).
- Models: 27 solarpunk Blender models (`assets/`, gone since the swap to brush3d, #211), built by a Codex agent from
  `docs/ASSET_BRIEF.md` (also gone; brush3d's models are listed in `brush3d/docs/MODELS.md`).

## Silos instead of belts (2026-10-10)

Belt mazes were the least fun part: plumbing the same lines over and over, and they didn't fit the clean solarpunk look.
Belts, splitters, sorters, crossings and drone pads were removed. A **silo** serves every building within 6 tiles; its 3
drones collect, feed, fetch from other silos and sell at the depot, charging from the pylon network before each flight. The
depot's sell list (spare or half per good) and a per-input toggle on each building decide who gets what. Saves from before
are refused (save version 2). Rules in `DESIGN.md`, "Logistics".

## Power, redrawn (2026-10-11)

The power buildings looked bulky and pylons crowded the view, and the power overlay showed only one of a pylon's two
ranges and not which pylon powers what. New models for the solar panel (sleek, low), wind turbine (a real rotor), battery
(cells whose rings light up as it charges) and pylon (short and quiet), and a model for the silo. Power is drawn only while
you work with it: each network in its own colour, with its reach, wires between its pylons, a line to each building it
powers and a label with its numbers; a focused or placed pylon shows its reach and its link range; a drag lays a line of
pylons. Rules unchanged. Details in `DESIGN.md`, "Readability rules".

## Trucks instead of drones (2026-10-12)

Silos and their drones did two jobs in one building: more carrying meant more storage, each silo held whatever its drones had
grabbed (so processors were fed badly), and drones each chose their own job, so several did the same one while others sat
idle. Storage and transport are now separate, and you set how goods move: a **garage** buys trucks, each truck runs a
**route** you give it (a loop of stops, each dropping and picking up goods), over the open ground between buildings (no roads
to build, `src/game/roads.ts`), queuing only at the building it loads at. Silos only store. The depot's sell list and the
per-input toggles are gone: routes decide where every good goes. Saves from before are refused (save version 3). Trucks and
the garage are stand-ins drawn in code until their models are built. Drones come back later, as automatic helpers, once
trucks have been played. Rules in `DESIGN.md`, "Logistics".

## Next door and the routes panel (2026-10-12)

Playing trucks: every level needed many trucks, most of them on routes doing one short hop (fields to the mill), and
managing their routes got cumbersome. Buildings that share an edge now trade directly: a machine takes its inputs from the
fields, hives and machines next door, a field takes compost (silos and the depot still trade only with trucks), shown by
goods hopping over the shared edge and by tinting the neighbours a building trades with. A **routes panel** (O) lists
every route with its stops, goods, trucks, goods a minute and problems: rename a route in place, add or send home trucks,
copy a route, point at one to see it on the map. The route editor names the route, lists what each of its trucks is doing,
and copies it; a truck can dump its cargo. Rules in `DESIGN.md`, "Logistics" ("Next door").

## Building history (2026-10-12)

Managing a growing farm, a mill could run at half speed for minutes before anyone noticed, and by then its marker only said
what was wrong at that moment. Each building now keeps its last ten minutes (`src/game/history.ts`, in memory, not saved), and
its inspector shows them over 1, 5 or 10 minutes: a strip of its statuses, the share of time in each, the goods it made a
minute against full speed; generators and batteries chart their watts or charge. Rules in `DESIGN.md`, "Readability rules".

## The UI revamp: Clearday (2026-10-14)

The proof-of-concept HUD and menus are replaced by the Clearday design (`src/ui/clearday/`, principles in `DESIGN.md`, "The
interface"): a commission card with goals as gauges, readouts and a dial, a dock, a view bar, markers with shapes, a placement
card with facts about the tile; the inspector and the routes as side cards (the routes with observed loop times and gaps
between trucks); a ledger, a new Power panel, a guide with production chains, a level select with each commission's
conditions, a briefing letter per commission, and results with the run's milestones and what made the difference. The
numbers behind them are pure modules in `src/game/` (`flows.ts`, `fleet.ts`, `powerlog.ts`, `runlog.ts`, `forecast.ts`,
`chain.ts`); the run log is saved with the game.

## Running water and the country around the map (2026-10-16)

Rivers looked like still ponds, and each map was a square of grass ringed by trees with nothing beyond. The river now has a
current (along its course, faster where it narrows), drops over falls onto rock ledges (now 3 levels each, at relief 0.55
and 0.85) and breaks round the odd boulder; ponds and lakes stay still. The generator carries the map's noise past the edge (`generateLand` in `map.ts`, drawn
only, never saved, the map itself unchanged): the river runs on out of sight, a track leads off from the depot, the woods
thicken and the ground rises into wooded hills, with an apron of distant woods beyond them. Everything past the edge is a
shade duller, so where you can build still reads at a glance. Height on the map itself followed on 2026-10-17, below.

## One renderer: the swap to brush3d (2026-11-16)

brush3d is now the game's only renderer (#211, the last task of epic #212): it's the default, with no `?renderer=` flag
and no fallback. The pixel renderer went for good: its world (`pixelScene.ts` and the files only it used), its Blender
models and their exports (`assets/`, `public/`), the pixel-size setting, its benchmark (`npm run bench` and its CI job) and
the `pixel3d-renderer` dependency. The camera, the HUD's look (its restyle is #215) and every rule are unchanged: the bots
give the same results and saves at version 20 still load. Graphics default to High, with Medium for integrated graphics.
The frame-rate report (`npm run framerate`, report version 2) counts the renderer's time as one part. Still open: the
developer's checks on the laptop and the MacBook (#210), and the river's falls (#241).
Since, for #210: brush3d draws the water's bed and reflection only where the water can show (#249), the same picture
for 1.5–3 ms less GPU a frame on c4 and c8; and it draws many meshes to a draw call (#250, done 2026-11-18): the same
picture, about 70–95 draws a frame on c4 and c8 rather than 1,200–2,400, and half to two thirds less of three.js's time.
And the sun's shadow is drawn with noon's detail at most (#251, done 2026-11-19), so a low sun costs no more than
noon: on c8 at golden hour and before dawn, about 4.6–5.5 ms less GPU a frame at High, 2.7–3 at Medium and 2.8–3 at Low,
noon as before; Medium and Low also draw the water's reflection at half size. Shadows come up a touch shorter at a low sun
(the developer approved it on the sheets, 2026-11-19).

## The farm at work: moving parts, states, lights and smoke (2026-11-16)

In brush3d, the models' moving parts do what the game says (#205; #235 the groundwork, #236
and #240 the looks). Turbines and the weather station's cups turn with the wind, the water wheel with the stream, a machine's drum or
stone while it works (slower on part of its power), and a battery's rings light by its charge. A building's state reads in its own parts and nothing laid over it (the developer's
pick on #236): working, it turns, glows and smokes; idle, it stands still with its running look off; with no power, it's
still and dark; held by the weather, it stops or slows. "Under construction" is left out until the game has a build time.
A problem's marker stands on a pin down to its building's roof, so it reads as that building's in a crowded yard. At night
a working building's lamps, fires and round sea-glass windows glow warm and throw soft pools of light around them, and
smoke rises in puffs from a working bakery, cannery, digester and farmhouse (the developer's picks on #240, "for now").
The puffs cost nothing measurable, and the pools about 0.15 ms a frame at night (#210). Still open: the turbine's head
doesn't turn into the wind (the model has no part for it), every truck's wheels share one shape, and the smoke keeps
rising while the game is paused, as the rain does.

## The crops and trees in paint (2026-11-16)

In brush3d, the game's fields and trees are painted (#213; #225 the groundwork, #227 the
look). Each of the five crops has its own colours, height, flowers and fruit at each of its four stages, from bare sown soil
to ripe, laid as one soft blanket over its bed. The map's trees are the game's species: oak, birch, apple and the bushes
are brush3d's trees, and the pine, willow and poplar have shapes of their own, the pine a soft cone, the willow weeping and
the poplar a column. Saplings are small trees, and every tree changes with the season. These are the developer's picks
on #227, "for now": the crops' lay and the pine may be revisited. The candidates not picked (crops in rows of soil, a
tiered or a Scots pine, a pollarded willow) are in #227's history. The demo shows them all at `?scene=plants`.

The far woods (the country's woods past the map, a crown of a few strokes for each 2 × 2 tiles, brush3d's `addCanopy`) in
winter (#268, epic #265, in review): they were dark chocolate and near-black balls on the snow, beside the lacy near trees.
Two looks are up for the developer's pick on the PR, behind the HUD's **Far woods** button and `?farwoods=`: `frosted` (the
default; bare woods a fan of thin taupe twig strokes with the ground between them, pines spruce cones) and `misty` (bare
woods soft pale-grey masses). Both face the strokes mostly up, so they're lit as the ground is and take the snow and frost
as the near trees do, and in the other seasons shape the pines as cones and the poplars as columns and lift the crowns'
dark undersides. `off` is the look before. The same draws and no more to fill, though frosted's bare woods have three
times the strokes (on c5, about 51,000 to 27,000); the GPU's frame on c4 and c5, near and widest, clear, storm, blizzard
and golden hour, measured the same or 0.1–0.5 ms less.

## The tools in the painted look (2026-11-16)

In brush3d, the game's tools work on the painted world (#206; #232 the groundwork, #233 the
looks). Pointing and clicking find the building, truck, tree, field or tile you see under the pointer, on the real land
and the models' real shapes. A building being placed is a blueprint: a faint ghost in green where it fits or red where it
doesn't, with level lines across it and brackets at its footprint's corners, so it never reads as a building already there.
It and its brackets show in full through a field's crops; buildings, trees and hills in front still hide them.
The highlight and the overlays are the player's to choose in the Settings panel: the highlight a cream outline, a soft halo
(the default) or a bold gold line; the overlays a wash in the land's own light, bold even colour (the default) or a light
wash with strong borders (the developer's picks on #233). Night and weather still fall on the tools, so they keep the
picture's mood.

## The land drawn from the map (2026-11-16)

In brush3d, brush3d now paints the land itself from the game's map (#202; #226 the groundwork,
#228 the look). Each tile's corners, cover and ground kind make one smooth surface, the game's own fit, so the hills keep
their shape. Cliffs are sharp where tiles don't meet, and their faces show strata. The ground kinds show as a subtle tint.
The river and ponds sit in beds under their tiles, with the water 0.48 m under the level, so the banks stand over it. The
country past the edge is clearly duller, so where you can build reads at a glance, and distant woods run to the horizon
(the developer's picks on #228). An earthwork repaints only the chunks round it, spread over frames and swapped in at once,
so the land never shows half a change. Still open: the river's falls are a plain chute for now and don't read as a
waterfall (#241); grass tufts on the land, and the water wheel's race cut into its bank (`brush3d/docs/LAND.md`); the game
and brush3d each fit the ground after an earthwork, about 10 ms twice (#210).

## The buildings and trucks as models, with their goods (2026-11-16)

In brush3d, every building the game places is now its solarpunk model, and every truck is the
truck model (#203; #221 the models, #222 the goods). Each building sits on its footprint, faces the way the game turns it and
stands level at the height the game sets. A truck faces the way it drives and leans with the ground on a ramp. Which model
draws which building is in `src/world/brush/catalog.ts`, and a test checks each one against the models' list and the
building's size. The set has no goods, so they're made in the game, as tokens: the pixel game's goods as they were, one shape
and one strong colour each, grown to the 4 m tile (the developer's pick on #222, over goods in sacks, crates and jars). A
truck's cargo rides in its bed, two across and three along. Goods handed to a building next door hop over the edge between
them. A click on a truck's cargo picks the truck (#206). Still open: the greenhouse's glass is opaque, so the crops under it
can't be seen. Fields and saplings are painted, not models (#213).

## A world that changes without a hitch (2026-11-15)

In brush3d, the world changes while you play without the picture stuttering (#204, #234).
Placing a building used to stall a frame by about 90 ms, because every change redrew the whole shelter map (what each
spot of land has standing over it), the ground's hollows and every tree on the map. Now only the patch around the
change is redrawn. That brings it down to about 12 ms. Clearing a tree drops from 30 ms to 3; saplings, fields, removing
a building and trucks to 2–3. Three changes do the work:
- a cleared tree is folded away inside the grove it was painted in, and its wind spring is freed;
- a tree whose ground moves is shifted, not repainted;
- a new one is painted alone.
The water only re-reads its levels when the ground under it changes, and every truck of a kind shares one shape.
`npm run hitches` measures it: it makes each kind of change in a busy commission and reports the frame and the game's own
work (`brush3d/docs/PERFORMANCE.md` has the table). The picture is unchanged. Still open: the first building placed in a
session costs about 45 ms once (the land's first refit, warming up; #210).

## One wind and one cloud field for the rules and the picture (2026-11-15)

A turbine now makes its power times the gust passing over it, and a solar panel under a cloud's shadow loses the share of
its sun the valley's cloud takes, while one in the sun keeps it all (#208, #198; #229 the rules, #231 the picture). The
valley's wind and cloud stay what they were (the forecasts, the planning numbers, every day's and season's average), so the
balance holds: over 100 days a turbine makes its power within 0.15% and a panel within 0.6%, and the bots clear every
commission as before. What is new is the moment: a turbine swings between about 0.8 and 1.35 times the valley's power as the
gusts and lulls pass, a panel between about a third and two and a half times (a gap in the cloud), and a single day's
panels vary by about 8%. The gusts are brush3d's (`WindRecipe`), stepped by the rules a tick a step and saved with the game
(save version 20), about 1 µs a step and a microsecond or two a turbine or panel. In brush3d the grass, trees and
dust show those same gusts, flowing round the buildings and trees, and the clouds' shadows are drawn where they shade the
panels. The worker that steps the air costs about 4–6% of a core at 1×, off the game's tick. `src/game/overhead.ts` has the
rules, `src/world/brush/wind.ts` the picture. Still open: whether the wind's own shelter (the air flowing round what stands)
should replace the rules' shelter number for turbines (a design call).

## brush3d's settings in the game (2026-11-15)

The settings panel's Game tab has brush3d's settings (#209) in place of the pixel size (gone with the pixel renderer, #211),
saved with the game's other settings and taking effect at once: **Graphics** (high, medium, low: presets for the three
machines, high the full picture and the default; medium halves the shadow and shelter maps' detail, holds the shadow to 75% of noon's
detail and halves the water's reflection, for integrated graphics; low holds the shadow to half noon's detail and also
draws 2× multisampling and at most 1600 × 900's pixels; each level's sun shadow is held to noon's detail at most, #251), **Rain and snow**
(full, or light: about a third of the drops and flakes) and **Lightning flashes** (full, which stays within the flash-safety
limits, gentle or off; the developer's decision on #209).
`src/world/brush/settings.ts` sends them to the renderer; brush3d's `QUALITY` and `setQuality` change the quality while the
game runs (`brush3d/docs/PERFORMANCE.md`).

## The game's weather, drawn by brush3d (2026-11-14)

In brush3d, everything brush3d can draw now comes from the game's own state (#207, #223 and
#224). The sky follows the game's weather, and a blizzard blows as hard as it looks. The land shows the snow lying, a late
frost's rime on the frost hollows, and mud on clay while the rules have it muddy. The water shows the river at its current,
a flood at the rules' surface, and a cold snap's ice frozen from the banks in. What brush3d draws that the rules don't track
is worked out from the game, as looks only, in `src/game/looks.ts`:
- how stormy the sky looks, darkening before the rain;
- the gold light under the clouds at some dawns and dusks and at a storm's edges;
- seeded lightning, so a save replays the same storm;
- an ordinary night frost on winter's clear, still nights;
- how wet the land is (sand dries first, clay and hollows last);
- mud on the bare earth as it wets;
- a river browned by heavy rain, clearing over the day after.
No rule reads any of it; a test guards that, and the bots give identical results. What the richer weather might do to
play is parked in #214. The player's flash setting for lightning is in the settings panel (#209).

## First light: the game drawn by brush3d (2026-11-14)

The game could now be drawn by brush3d, behind a `?renderer=brush3d` flag (#201, epic #212), while players still saw
pixel3d until the swap (#211, above). A tile is 4 m. `main.ts` draws through a `Scene` (`src/world/scene.ts`): the pixel
world moved whole into `pixelScene.ts` (its frames byte-identical), and the brush3d world is `src/world/brush/`, one piece a file, so the epic's tasks
each replace their own: the land (`land.ts`, #202), the buildings and trucks (`things.ts`, #203–#205), the trees and rocks
(`wild.ts`, #213), the season, hour and weather (`sky.ts`, #207, #208), with the tools (#206) and settings (#209) still to
add. Today it's plain: the ground one painted meadow green, everything built a grey stand-in. The paint holds at the
game's widest zoom (4 px a metre: the ground's strokes become a soft wash, no shimmer). A terrain level stands 1 m high,
the developer's pick of 0.5, 1 and 2 m (#220, 2026-11-16): the land keeps the shape the pixel world gave it, a riverbank
reads as a bank and a rocky rise as a low cliff.

## brush3d moves in (2026-11-14)

The painterly renderer, brush3d, moved here from its own repo (#200, epic #212), with its history (`git log -- brush3d/`), into
`brush3d/`: its code, the demo and its scenes, its tools (stills, videos, shimmer and pops, the GPU profile, the flash check,
the wind, water and cloud checks), the models' Blender scripts and its docs. One `package.json` (its scripts are `render:*`);
`npm test`, the typecheck, lint and CI cover it, and the demo is built and deployed beside the game (`<build>/brush3d/`).
Every pull request now gets a preview of both at `https://celestiallemon.github.io/Soil-n-Silo/pr-<number>/`. The game still
drew with pixel3d until the swap (#211); brush3d-renderer is archived, and its open issues moved here.

## Height and terrain (2026-10-17)

The map now has rolling ground, with four corner heights per tile, whole levels from 0 to 16 at 0.25 m each (`relief.ts`).
Chosen on 2026-10-17: the first stepped ground read as blocky and synthetic in play. The owner wanted organic solarpunk
land: rolling hills, floodplains, meadows and plateaus, with cliffs as an occasional feature. Corner heights keep the rules
clear. The generator makes broad, low-frequency hills, flat floodplains along rivers and round lakes and ponds, a flat home
area round the depot, and occasional mesas with a cliff rim at relief 0.65 and above. Rivers fall 3 levels at relief 0.55,
with a second fall at 0.85. Soil is poorer uphill with the commission's mean kept. Relief varies by commission; random
commissions can be Hilly or Flat. The country beyond rises into higher hills, with a track climbing out from the depot.

Buildings level unsuitable ground on placement for an extra price, choosing the cheapest level, never below nearby water.
Joined ground round the footprint follows as a slope where it stays within a 2-level span; otherwise it meets a cliff.
Fields can cross slopes but need no cliff inside; one-tile buildings stand anywhere on grass. Earthworks raise or lower a
point with the tiles that join there, or level an area at its rounded mean height. Dragging covers a rectangle of points.
A dig is done in full or refused: no moving buildings, trees, rock or water, going outside 0–16 or below nearby water, or
making a tile steeper than 2 levels. Earthworks and levelling cost 6 credits per point moved a level, counting distinct
heights at a footprint point separately; neither is refunded. Both are free in sandbox.

Trucks drive gentle, joined, open grass (a corner span of at most 1), never steep banks or cliffs. Each level climbed adds
0.6 tiles of effort in time and battery. Next-door goods need a joined edge too: the owner agreed to drop the gravity chute
down cliffs. Water beside a field must meet its ground edge; sprinklers pay 0.5 W per level of lift to centre height.
Turbines gain 5% wind per centre level and lose 3% per level of higher ground above their highest corner, as well as shelter
from trees and tall buildings. Field erosion scales with slope, up to ×1.5 at full steepness, or ×1.25 guarded by trees or
beans. A water wheel makes steady power from current on a river bank, more beside a fall. Rules and numbers in `DESIGN.md`.

The dock has Earthworks with Raise, Lower and Level chips (K; C cycles). The Height view tints centre height in bands of
3 levels, blended between, with steep banks darker; placement cards show the terrain's costs and effects, and the guide has "Height and
earthworks". Ground is shaded smooth across joined tiles, steep banks are worn turf, and cliff faces have strata every
2 levels under a turf lip, stone from level 8. The map's ground is drawn as objects in chunks so earthworks can redraw it.
Six tree species and bushes vary by place, with willows by water and pines up high (`trees.ts`; in brush3d, `src/world/brush/wild.ts`).
`test/height.test.ts` covers the height rules; the bot deliberately keeps its flat map to test the economy. Saves are version
7; older ones are refused.

## Next

- **Climate feature: done (2026-10-27).** Seasons, weather events, the weather station and forecast, the greenhouse and five kinds of ground are in
  (`DESIGN.md`: "Seasons", "Weather events", "The weather station", "Farming", "The map"; playtest notes under "Playtest of phase 4" and "Playtest of the whole climate feature and of ground (5.7)").
  What it left for later, each its own item:
  - **Winter's length** (a design call). Random winter commissions take the bot 2.3 to 2.8 times as long as a mild spring (`PAR_FACTOR` winter mild 2.6, gales 2.5, hard 3.25): the first
    sale comes late and a greenhouse (150 credits and a turbine) is the first minutes' money, and the hens lay at half rate. Options: a cheaper greenhouse (about 90), more winter credits, winter hens or a
    heated coop. Long Nights is cleared under glass (the bot 48.4 minutes, target 65).
  - **Hot summers on wheat and beans:** pace about 0.5 and 0.6 in a hot summer. Does summer want a cooler wheat range or a summer-crop push? Rerun `tools/seasonfactor.ts` whenever a season,
    warmth or a crop's range changes, and update `PAR_FACTOR`.
  - **Playing it by hand.** Phases 1 to 5 were played headless and in a headless browser (the dev build boots, every season and the Ground view draw, no console errors); nobody has played a
    whole commission by hand. Above all: every campaign event (the hurricane costs the bot a third more and is the likeliest to feel unfair), and random commissions of each season.
  - **Tonight's band in the forecast:** whether it wants to be split by the night's rain.
  - **Ground, from the 5.7 playtest:** sand and stony fields have no reason (about two thirds of loam's pace; a crop that likes them, or a gain for compost, would give them one); the land near the
    depot is mostly loam on most campaign maps, so the ground rarely makes the player choose (more variety round the depot?); summer's golden turf hides the ground's tints (the Ground view
    shows them); clay's hold helps least in a dry summer; a "high river" random commission can roll on a map with ponds.
  - **The playtest note (5.7):** tuned: the targets of Linen (45), Tired Soil (40) and Harvest Festival (55) and nine `PAR_FACTOR` steps of 0.05, from the bot with ground in. Not tuned, left to the design lead: the
    items above.
- Play the **problems strip** (experimental, off by default, a setting on the pause screen) and decide whether it stays.
  It lists the buildings with a problem now, longest first; the plan was to build it on the history instead (buildings below
  about 70% working over the last few minutes, worst first) and perhaps group it by cause.
- From the UI revamp, not built yet: a **sound** volume (with sound), and
  **moving** a building from its inspector (there is no rule for it yet).

- Play every campaign commission and tune: prices, crop and machine times, power numbers, and the target times set from the
  bot (below) against real play. Every commission now has a bot layout (`tools/layouts.ts`); targets are about 1.4 times the
  bot's best time (`DESIGN.md`, "Commissions"). The bot ends the later commissions with thousands of spare credits, so
  money stops mattering halfway through; worth a look when playing them.
- Play the trucks and tune them (cargo, speed, battery, waits, one truck at a time per building). The bot's times against
  the targets: First Light 13.5 (20), Morning Bread 38 and 30.5 built round neighbours (50), Windy Ridge 41.7 (55), Linen for the
  Looms 31.3 (45), Long Nights 48.4 (65), Tired Soil 28.1 (40), Riverlands 37.7 (50), Harvest Festival 39 (55), with ground in (5.7). `npm test` plays
  every layout and fails if one misses its target.
- Drones as automatic helpers beside the trucks (`DESIGN.md`, Open questions), once trucks have been played.
- Copy and paste / blueprints for repeated blocks (a row of fields with sprinklers).
- Undo for the last few actions.
- Sound.

## Later

- From the UI revamp, set aside: a **difficulty fingerprint** for each commission (an advanced option in the level select);
  a **soil map and soil forecast** in the ledger; a **route loop diagram** with each stop's share of the loop.
- A mountains-themed commission, with higher, more rugged ground.
- Slopes facing the sun give solar panels more power; cliffs shade panels in the morning and evening.
- Soil washing down from eroding fields onto the ground below.
- Pipes for water, so sprinklers need a source.
- More chains: tomatoes into ketchup, flax into rope, bees into candles; animals (goats for milk and cheese).
- Commission chains: a short campaign where each commission's map carries on from the last.
