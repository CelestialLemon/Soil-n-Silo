# Roadmap

Goal: the MVP in [`DESIGN.md`](DESIGN.md), one 28-day season with a 20,000g target, proving that farming and production chains
are fun without a social layer. The game is drawn with [`pixel3d-renderer`](https://github.com/CelestialLemon/pixel3d-renderer),
and is the first real game on it: renderer gaps found here go back to that repo as issues (`AGENTS.md`, "Renderer issues").

Items are roughly in priority order within each milestone. Each milestone ends playable.

## Renderer

Pinned: commit **6216837** on the renderer's `main` (`package.json`), which has object highlight (#22) and ambient motion on
objects (#23) but no release tag yet. Move the pin to **v0.2.0** once it is tagged. The game owns the loop, state, input, UI, audio and save; the renderer draws, and answers
"what is under the pointer" (`pick`).

**Gaps** (read off the design doc against v0.1.0, updated as the MVP was built):

| Need (design doc) | Status | Notes |
| --- | --- | --- |
| Buildings and trees fade or cut away when they hide the tile under the pointer | Not needed yet | The 4 views seem enough; playtests decide. Maybe not needed: the 4 camera views may be enough. If it is, there is no per-object or per-part transparency or cut-away yet, and the static world is one merged mesh, so occluders that can fade would have to be objects. |
| Soil colour shows fertility, per tile | Worked around | One soil geometry per fertility band and water state (10, all in the palette from the start), swapped as the tile changes. A per-object tint would be cleaner. |
| Machine smoke and glow while running | Yes (#23) | Running machines swap to a geometry with smoke puffs, turning sails and an emissive fire. Crops sway. |
| Highlight the thing under the pointer | Yes (#22) | `PixelObject.highlight`, at most 4 at once. |
| Chickens moving about | Rigid parts only | No skinned meshes. Rigid parts as separate objects (the renderer's walker example) may be enough for the MVP. There is no player character. |
| Crops growing in 3–5 stages, tilled tiles, placed machines | Yes | Objects: add, swap, remove. Copies of one geometry are instanced. |
| Hovered-tile highlight, clicking tiles and things | Yes | A flat emissive frame plus `pick`. Everything clickable other than a grass tile is an object. |
| Orthographic 3/4 view, 4 preset views, mouse panning | Yes | `placeCamera` snaps to the art-pixel grid, so panning doesn't shimmer; working in the shell already. |
| Day/night from 6 AM to 2 AM | Yes | `lookAt(hour)`, or the game's own `dayCycle`. |
| Lamps on placed objects (coop light, oven glow at night) | No | Lamps are scene data, fixed at construction. Not needed yet: emissive windows and the oven fire glow after dusk without lamp light. |

## Milestone 0: set-up (done 2026-10-06)

- The repo, the agent instructions (`AGENTS.md`), CI, the design doc in `docs/`.
- A game shell on the renderer: a placeholder farm, the camera from the design doc (orthographic, 45° home yaw, 30° pitch, 4
  preset views 90° apart, 1x/2x/3x integer zoom that scales whole art pixels, mouse panning), the hovered-tile highlight, and
  the day clock. The game is point-and-click, with no player character (decided 2026-10-06).

## Milestone 1: the farm and clicking (done 2026-10-07)

- Farm layout (open question): about 300 tillable tiles, coop, shipping bin, shop. The tile grid as game state.
- Clicking: use the held tool on a tile, interact with a thing. On-screen buttons to turn the camera.
- Tools: hoe, watering can, hand. Hotbar and backpack, stacking items. HTML/CSS HUD over the canvas.
- Occluder fade or cut-away, only if the 4 views aren't enough (renderer gap above). Not done: not needed so far.

## Milestone 2: crops and soil (done 2026-10-07)

- Wheat, tomato, pumpkin: growth stages per watered day, regrowth, harvest, scraps. Crops as data.
- Fertility per tile (0–100), drain, rest recovery, manure +25; soil colour by fertility; inspect.
- Quality rolled from fertility at harvest.
- The overnight sequence, in the design doc's order, as pure, tested game logic.

## Milestone 3: chickens (done 2026-10-07)

- Coop, trough, feed and scraps, happiness, eggs (quality from happiness), manure, petting, coop door.

## Milestone 4: processing and economy (done 2026-10-07)

- Mill and oven, placed on the farm; recipes as data; quality averaging; progress shown on the machine.
- Shop, shipping bin, overnight payout, quality multipliers, starting state.

## Milestone 5: the season (done 2026-10-07)

- Morning summary, HUD money tracker, 2 AM cutoff and its penalty, day 28 results with tiers, free mode after day 28.
- Save and load (one slot).
- A spreadsheet or scripted sim of the economy to check the 20,000g target (open question).

## Next

- Playtest and tune: prices, quality odds, happiness, day length (`npm run sim` checks the economy; see the design doc's open
  questions for what it found).
- Sound, and the coop's roof lifting off to show the chickens inside.

## Later

The design doc's post-MVP list: composter, seasons and weather, more animals and recipes, area tools, stamina, farm expansion.
