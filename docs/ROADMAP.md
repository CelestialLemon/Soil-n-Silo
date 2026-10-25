# Roadmap

Goal: the game in [`DESIGN.md`](DESIGN.md), a build-only solarpunk automation game played in seeded commissions of 30–60 minutes.
The game is drawn with [`pixel3d-renderer`](https://github.com/CelestialLemon/pixel3d-renderer), and is the first real game on it:
renderer gaps found here go back to that repo as issues (`AGENTS.md`, "Renderer issues").

Items are roughly in priority order within each section.

## History

- **2026-10-06/07: the season MVP.** A Stardew-like point-and-click farm (one 28-day season, 20,000g target, hand tools,
  chickens, mill and oven). Built and playable (milestones 0–5), then replaced; see git history before the pivot.
- **2026-10-09: the pivot.** The only player is the designer, so unlocking content isn't a reward loop; an automation game's
  loop (build, find the bottleneck, fix it) is. Short seeded levels are also quicker to test. Solarpunk setting chosen over
  low-magic medieval because power (sun, wind, storage) and closed loops are mechanics, not just looks.

## Renderer

Pinned: **v0.3.3** (`package.json`). The game owns the loop, state, input, UI, audio and save; the renderer draws, and answers
"what is under the pointer" (`pick`).

| Need | Status | Notes |
| --- | --- | --- |
| Build preview ("ghost") drawn see-through and tinted green/red | Yes ([#30](https://github.com/CelestialLemon/pixel3d-renderer/issues/30), v0.3.0) | `opacity` and `tint`; `pick` sees through it. |
| Overlays (fertility, power reach, water, bees) without a geometry per colour | Yes (#30) | One tile geometry, tinted per tile. |
| Many goods moving (now in trucks) without redrawing the object shadow map | Yes ([#31](https://github.com/CelestialLemon/pixel3d-renderer/issues/31)) | Goods, markers, ghosts and overlays have `castShadow = false`. |
| Smooth ground without false outline dashes or contact darkening | Yes ([#38](https://github.com/CelestialLemon/pixel3d-renderer/issues/38), v0.3.2) | Joined ground is shaded smooth in the game. |
| Gentle folds between flat ground faces without outline ink or contact darkening | Yes ([#41](https://github.com/CelestialLemon/pixel3d-renderer/issues/41), v0.3.3) | Meadows and slopes read clean; cliffs and buildings keep their ink. |
| Turbine rotors turning with the wind | Worked around | Three rotor speeds, swapped by wind strength (spin speed is baked into the geometry). |
| Lamps on placed objects (pylon lanterns at night) | No | Lamps are scene data; emissive parts glow after dusk instead. |
| Buildings fading when they hide the tile under the pointer | Not needed yet | Picking a tile uses the ground plane, so tall buildings don't block placement. |

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
- Models: 27 solarpunk Blender models (`assets/`), built by a Codex agent from `docs/ASSET_BRIEF.md`.

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
Six tree species and bushes vary by place, with willows by water and pines up high (`trees.ts`, models in `ASSET_BRIEF.md`).
`test/height.test.ts` covers the height rules; the bot deliberately keeps its flat map to test the economy. Saves are version
7; older ones are refused.

## Next

- **Seasons, weather and ground types**, designed on 2026-10-21 in [`CLIMATE.md`](CLIMATE.md): one season per level in
  place of the weather settings, seeded weather events, a weather station selling the forecast, the greenhouse, and five
  ground types. Built in that order; each part writes its rules into `DESIGN.md`, and `CLIMATE.md` is deleted once all of
  it is in.
- **Climate phase 1, left open after the playtest (2026-10-22):** random winter commissions take 2.6 to 3.85 times as long
  (the bot needs about 80 minutes for bread and 125 for linen in a hard winter, flax growing at a fifth of its pace), so the
  greenhouse (#86) should bring winter back toward the others. Long Nights (c5) cannot be cleared until then (its target 70 is a
  placeholder, its bot test skipped). Hot summers are hard on wheat (pace about 0.5) and beans (0.6): worth a look whether
  summer wants a cooler wheat range or a summer-crop push. `tools/seasonfactor.ts` should be rerun whenever a season,
  warmth or crop range changes, and `PAR_FACTOR` updated. Not played by hand: only headless runs (loading, conditions, rain
  and snow, no NaNs).
- **Climate phase 3, left open after the playtest (2026-10-25):** the station, the forecast, its panel and the projections are in and
  were played headless and in a headless browser (`DESIGN.md`, "Playtest of phase 3"): the forecast changes whether, when and with what
  power a player builds, its ranges held in about 16,000 checks, and 80 credits and 3 W stay. Still to do: play every campaign event by hand
  (the hurricane costs the bot a third more and is the likeliest to feel unfair), and random commissions of each season; sharper
  near-term conditions for the Power panel's "tonight" (#144); Long Nights waits for the greenhouse (#86).
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
  the targets: First Light 14 (20), Morning Bread 30 and 26 built round neighbours (35), Windy Ridge 32 (45), Linen for the
  Looms 26 (35), Long Nights 29 (40), Tired Soil 25 (35), Riverlands 34 (50), Harvest Festival 36 (50). `npm test` plays
  every layout and fails if one misses its target.
- Models for the `truck` and the `garage`, and the silo without its drone pads (`ASSET_BRIEF.md`).
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
