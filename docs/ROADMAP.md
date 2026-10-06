# Roadmap

Goal: the MVP in [`DESIGN.md`](DESIGN.md), one 28-day season with a 20,000g target, proving that farming and production chains
are fun without a social layer. The game is drawn with [`pixel3d-renderer`](https://github.com/CelestialLemon/pixel3d-renderer),
and is the first real game on it: renderer gaps found here go back to that repo as issues (`docs/BOARD.md`, "Renderer issues").

Items are roughly in priority order within each milestone. Each milestone ends playable.

## Renderer

Pinned: **v0.1.0** (`package.json`). The game owns the loop, state, input, UI, audio and save; the renderer draws, and answers
"what is under the pointer" (`pick`).

**Likely gaps** (read off the design doc against v0.1.0; confirm each against the game before opening an issue):

| Need (design doc) | v0.1.0 | Notes |
| --- | --- | --- |
| Buildings and trees fade or cut away when they hide the tile under the pointer | No | Maybe not needed: the 4 camera views may be enough. If it is, there is no per-object or per-part transparency or cut-away yet, and the static world is one merged mesh, so occluders that can fade would have to be objects. |
| Soil colour shows fertility, per tile | Partly | Colours are per vertex and quantised once. One geometry per fertility band (a handful of instanced objects) works if the bands are in the palette from the start; a per-object tint would be cleaner. |
| Machine smoke and glow while running | Partly | `FLAG.EMISSIVE` works on objects; objects have no ambient motion (smoke, sway), which only the baked dynamic mesh has. |
| Chickens moving about | Rigid parts only | No skinned meshes. Rigid parts as separate objects (the renderer's walker example) may be enough for the MVP. There is no player character. |
| Crops growing in 3–5 stages, tilled tiles, placed machines | Yes | Objects: add, swap, remove. Copies of one geometry are instanced. |
| Hovered-tile highlight, clicking tiles and things | Yes | A flat emissive object plus `pick`; working in the shell already. The baked scene has no object ids, so anything clickable other than a tile (machines, bin, coop) should be an object. |
| Orthographic 3/4 view, 4 preset views, mouse panning | Yes | `placeCamera` snaps to the art-pixel grid, so panning doesn't shimmer; working in the shell already. |
| Day/night from 6 AM to 2 AM | Yes | `lookAt(hour)`, or the game's own `dayCycle`. |
| Lamps on placed objects (coop light, oven glow at night) | No | Lamps are scene data, fixed at construction. |

## Milestone 0: set-up (done 2026-10-06)

- The repo, the agent workflow (`AGENTS.md`, `docs/BOARD.md`), CI, the design doc in `docs/`.
- A game shell on the renderer: a placeholder farm, the camera from the design doc (orthographic, 45° home yaw, 30° pitch, 4
  preset views 90° apart, 1x/2x/3x integer zoom that scales whole art pixels, mouse panning), the hovered-tile highlight, and
  the day clock. The game is point-and-click, with no player character (decided 2026-10-06).

## Milestone 1: the farm and clicking

- Farm layout (open question): about 300 tillable tiles, coop, shipping bin, shop. The tile grid as game state.
- Clicking: use the held tool on a tile, interact with a thing. On-screen buttons to turn the camera.
- Tools: hoe, watering can, hand. Hotbar and backpack, stacking items. HTML/CSS HUD over the canvas.
- Occluder fade or cut-away, only if the 4 views aren't enough (renderer gap above).

## Milestone 2: crops and soil

- Wheat, tomato, pumpkin: growth stages per watered day, regrowth, harvest, scraps. Crops as data.
- Fertility per tile (0–100), drain, rest recovery, manure +25; soil colour by fertility; inspect.
- Quality rolled from fertility at harvest.
- The overnight sequence, in the design doc's order, as pure, tested game logic.

## Milestone 3: chickens

- Coop, trough, feed and scraps, happiness, eggs (quality from happiness), manure, petting, coop door.

## Milestone 4: processing and economy

- Mill and oven, placed on the farm; recipes as data; quality averaging; progress shown on the machine.
- Shop, shipping bin, overnight payout, quality multipliers, starting state.

## Milestone 5: the season

- Morning summary, HUD money tracker, 2 AM cutoff and its penalty, day 28 results with tiers, free mode after day 28.
- Save and load (one slot).
- A spreadsheet or scripted sim of the economy to check the 20,000g target (open question).

## Later

The design doc's post-MVP list: composter, seasons and weather, more animals and recipes, area tools, stamina, farm expansion.
