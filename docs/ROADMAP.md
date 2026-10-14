# Roadmap

Goal: the game in [`DESIGN.md`](DESIGN.md), a build-only solarpunk automation game played in seeded commissions of 30–60 minutes.
The game currently uses an in-repo Three.js renderer experiment inspired by the landscape presentation of Terra Nil. The
reference material and source notes are in [`research/terra-nil-visual-study/`](research/terra-nil-visual-study/).

Items are roughly in priority order within each section.

## History

- **2026-10-06/07: the season MVP.** A Stardew-like point-and-click farm (one 28-day season, 20,000g target, hand tools,
  chickens, mill and oven). Built and playable (milestones 0–5), then replaced; see git history before the pivot.
- **2026-10-09: the pivot.** The only player is the designer, so unlocking content isn't a reward loop; an automation game's
  loop (build, find the bottleneck, fix it) is. Short seeded levels are also quicker to test. Solarpunk setting chosen over
  low-magic medieval because power (sun, wind, storage) and closed loops are mechanics, not just looks.

## Experimental renderer (2026-10-14)

The former pixel-art renderer dependency was replaced with `src/renderer/verdantRenderer.ts`, a local full-resolution Three.js
renderer. It keeps the orthographic camera and game-side object API, with vertex-coloured terrain, fog, directional shadows,
procedural water shimmer and shader motion. Tree and bush models were also rebuilt as denser, layered silhouettes.

This is a first playable renderer pass rather than a style-complete port. Current limitations to evaluate: vegetation still uses
simple facet geometry; structures mostly retain the existing model set; terrain remains a flat gameplay grid; water and lighting
are stylized approximations; and performance needs checking on larger maps and lower-end hardware. Compare the live scene against
the gathered references before making deeper art or architectural choices.

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

## Next

- **The UI revamp (Clearday).** Replace the proof-of-concept HUD and menus with the agreed design: the system is in
  `src/ui/clearday/`, the screens, mockups, decisions and the new numbers the game must compute in
  [`ui-revamp/`](ui-revamp/README.md). Adds a Power panel, a routes side card with timing, a guide page per building with its
  chain, a ledger with valley health, and results with the run's milestones.
- The **problems strip** (experimental, off by default; a setting in the revamp's pause screen, mockup
  [`ui-revamp/mockups/play-problems.html`](ui-revamp/mockups/play-problems.html)). Problems are found on the map by default;
  with the setting on, a strip on the right edge lists them, built on the building history: buildings that spent much of the
  last few minutes not working (say below 70%), worst first, each with its main cause and for how long ("Mill · 45% · waiting
  for wheat"); clicking one selects it and moves the camera to it. Perhaps grouped by cause ("3 buildings waiting for wheat").
  Facts only, no suggested fix. Built with the UI revamp; play it to decide whether it stays.

- Play every campaign commission and tune: target times, prices, crop and machine times, power numbers. Bot layouts for the
  other five commissions in `tools/layouts.ts`, so `npm run sim` checks them all.
- Play the trucks and tune them (cargo, speed, battery, waits, one truck at a time per building) and the target times: the
  bot clears First Light in about 14 minutes, Morning Bread in about 29 (target 35) and Linen for the Looms in about 26
  (target 50).
- Models for the `truck` and the `garage`, and the silo without its drone pads (`ASSET_BRIEF.md`).
- Drones as automatic helpers beside the trucks (`DESIGN.md`, Open questions), once trucks have been played.
- Copy and paste / blueprints for repeated blocks (a row of fields with sprinklers).
- Undo for the last few actions.
- Sound.

## Later

- A **weather station** building (proposed 1×1, 80 credits, 2 W): owning one unlocks the forecast, sun and wind by hour from
  the seeded weather curves, in its inspector and in a Weather panel opened from the sun and wind chips by the dial. Without one
  you see only the weather now. Mockup: [`ui-revamp/mockups/roadmap-weather.html`](ui-revamp/mockups/roadmap-weather.html).
- From the UI revamp, set aside: a **difficulty fingerprint** for each commission (an advanced option in the level select);
  a **soil map and soil forecast** in the ledger; a **route loop diagram** with each stop's share of the loop.
- Weather events (rain waters fields, storms stop turbines), seasons as commission modifiers.
- Pipes for water, so sprinklers need a source.
- More chains: tomatoes into ketchup, flax into rope, bees into candles; animals (goats for milk and cheese).
- Commission chains: a short campaign where each commission's map carries on from the last.
