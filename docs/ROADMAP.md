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

Pinned: **v0.3.0** (`package.json`). The game owns the loop, state, input, UI, audio and save; the renderer draws, and answers
"what is under the pointer" (`pick`).

| Need | Status | Notes |
| --- | --- | --- |
| Build preview ("ghost") drawn see-through and tinted green/red | Yes ([#30](https://github.com/CelestialLemon/pixel3d-renderer/issues/30), v0.3.0) | `opacity` and `tint`; `pick` sees through it. |
| Overlays (fertility, power reach, water, bees) without a geometry per colour | Yes (#30) | One tile geometry, tinted per tile. |
| Many goods moving (once on belts, now under drones) without redrawing the object shadow map | Yes ([#31](https://github.com/CelestialLemon/pixel3d-renderer/issues/31)) | Goods, markers, ghosts and overlays have `castShadow = false`. |
| Turbine rotors turning with the wind | Worked around | Three rotor speeds, swapped by wind strength (spin speed is baked into the geometry). |
| Lamps on placed objects (pylon lanterns at night) | No | Lamps are scene data; emissive parts glow after dusk instead. |
| Buildings fading when they hide the tile under the pointer | Not needed yet | Picking a tile uses the ground plane, so tall buildings don't block placement. |

## v0.1: the pivot (2026-10-09)

- Game rules in `src/game/`: goods, crops, buildings and recipes as data (`data.ts`); seeded maps (`map.ts`); commissions
  (`scenarios.ts`); the fixed-step simulation (`sim.ts`): belts, splitters, sorters, crossings, drone pads (replaced by silos, below), fields with
  fertility, water and pollination, machines with strict byproducts, pylon power networks with batteries, goals and medals;
  building and configuring (`build.ts`); saves (`save.ts`). Unit tests in `test/`.
- `npm run sim`: a bot builds a fixed layout as credits allow and plays a commission on the real rules (layouts for First
  Light, Morning Bread and Linen for the Looms so far, `tools/layouts.ts`).
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

## Trucks instead of drones (planned 2026-10-12)

Silos and their drones did two jobs in one building: more carrying meant more storage, each silo held whatever its drones had
grabbed (so processors were fed badly), and drones each chose their own job, so several did the same one while others sat
idle. Storage and transport are now separate, and you set how goods move: trucks run routes you give them, over the open
ground between buildings (no roads to build), queuing only at the building they load at. Drones come back later, as automatic
helpers, once trucks have been played. Rules in `DESIGN.md`, "Logistics". Steps:

1. Rules (`src/game/`): the silo as storage only, the garage, trucks with batteries, routes and stops, the shortest way over
   open tiles (worked out again only when the layout changes), one truck at a time per building and the queue; drones, the
   depot's sell list and the per-input toggles removed. Save version 3 (older saves are refused). Tests for paths, queues,
   the wait rules, charging, and a building cut off.
2. The world: trucks with their cargo (a stand-in shape first), the garage (stand-in), queues beside buildings, a selected
   route's way and stops on the ground, the roads overlay and the "can't be reached" marker.
3. The HUD: the garage's inspector (buy trucks, give them routes), the route editor, the routes list in the stats with goods
   a minute per route, and the guide's pages.
4. `npm run sim`: bot layouts with routes for First Light, Morning Bread and Linen for the Looms; tune the truck numbers and
   the target times by playing.
5. Models: `truck` and `garage`, and the silo without its drone pads (`ASSET_BRIEF.md`).

## Next

- Play every campaign commission and tune: target times, prices, crop and machine times, power numbers. Bot layouts for the
  other five commissions in `tools/layouts.ts`, so `npm run sim` checks them all.
- Drones as automatic helpers beside the trucks (`DESIGN.md`, Open questions), once trucks have been played.
- Copy and paste / blueprints for repeated blocks (a row of fields with sprinklers).
- Undo for the last few actions.
- Sound.

## Later

- Weather events (rain waters fields, storms stop turbines), seasons as commission modifiers.
- Pipes for water, so sprinklers need a source.
- More chains: tomatoes into ketchup, flax into rope, bees into candles; animals (goats for milk and cheese).
- Commission chains: a short campaign where each commission's map carries on from the last.
