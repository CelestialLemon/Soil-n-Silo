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
| Buildings and trees fade or cut away when they block the player | No | No per-object or per-part transparency or cut-away. The static world is one merged mesh, so occluders that can fade would have to be objects. |
| Soil colour shows fertility, per tile | Partly | Colours are per vertex and quantised once. One geometry per fertility band (a handful of instanced objects) works if the bands are in the palette from the start; a per-object tint would be cleaner. |
| Machine smoke and glow while running | Partly | `FLAG.EMISSIVE` works on objects; objects have no ambient motion (smoke, sway), which only the baked dynamic mesh has. |
| Chickens and the farmer walking | Rigid parts only | No skinned meshes. Rigid limbs as separate objects (the renderer's walker example) may be enough for the MVP. |
| Crops growing in 3–5 stages, tilled tiles, placed machines | Yes | Objects: add, swap, remove. Copies of one geometry are instanced. |
| Targeted-tile highlight, mouse targeting | Yes | A flat emissive object plus `pick`. |
| Orthographic 3/4 view, 90° snaps, pixel-step camera | Yes | `placeCamera` snaps to the art-pixel grid; working in the shell already. |
| Day/night from 6 AM to 2 AM | Yes | `lookAt(hour)`, or the game's own `dayCycle`. |
| Lamps on placed objects (coop light, oven glow at night) | No | Lamps are scene data, fixed at construction. |

## Milestone 0: set-up (done 2026-10-06)

- The repo, the agent workflow (`AGENTS.md`, `docs/BOARD.md`), CI, the design doc in `docs/`.
- A game shell on the renderer: a placeholder farm, the camera from the design doc (orthographic, 45° home yaw, 30° pitch, 90°
  snapped turns, 1x/2x/3x integer zoom that scales whole art pixels), camera-relative walking, 4-way facing, and the day clock.

## Milestone 1: the farm and the player

- Farm layout (open question): about 300 tillable tiles, coop, shipping bin, shop. The tile grid as game state.
- Targeting: the tile in front, highlighted; optional mouse targeting within one tile. Use and Interact buttons.
- Tools: hoe, watering can, hand. Hotbar and backpack, stacking items. HTML/CSS HUD over the canvas.
- Occluder fade or cut-away (renderer gap above).

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
