# The land

The ground the game builds on, painted by the renderer from the game's map (Soil-n-Silo#202). The game sends its tiles
once a level (`r.setLand`) and each earthwork's tiles as it happens (`r.updateLand`); the renderer draws the rest. The
code is `src/land/`: `map.ts` (what the game sends, and its checks), `surface.ts` (the smooth fit), `paint.ts` (the mesh,
the paint and the earthworks). `tools/land.ts` checks it on a made-up land (`npm test` runs it).

## What the game sends

`LandMap` (`src/land/map.ts`, API.md has the fields): the land in tiles, which is the map the player builds on and the
country the game draws round it in tiles too, then `beyond`, a coarse grid of heights past those tiles. Per tile:

- **Four corners**, each a whole number of levels (metres). Where two neighbours' corners along their side meet, the land
  runs on; where they don't, that side is a cliff.
- **Worked** (1 or 0): drawn flat at exactly its corners' level. Pads, worked ground and the water's tiles.
- **Cover** (grass, bare, track, rock, woods, water): the paint.
- **Ground** (loam, silt, clay, sand, stony): a subtle tint over the paint. Loam, the usual, has none.

## How it's drawn

- **One smooth surface.** The rules' land is two flat triangles a tile, which looks like folded card. The drawn land is
  a smooth fit of the same tiles (`surface.ts`, the game's own fit, moved here as it was): never more than half a level
  from the rules' height, exactly level on worked tiles, sharp at cliffs. So the hills are the shape the player built,
  only rounded. Each tile is cut as finely as its bends need (whole, halves, quarters or eighths), finer on and near the
  map where the camera comes close.
- **Cliffs.** Where neighbours don't meet, a wall runs from the upper tile's side down to the lower one's, with a turf lip
  at the top and bands of earth (stone from level 8 up) every two levels: the strata, the developer's pick over soft earth and
  grey rock (Soil-n-Silo#228).
- **The water's beds.** Under each water tile the ground sinks into a bed, 1.2 m at its deepest, rising to the bank over
  the last three quarters of a tile where dry ground is beside it. The water itself is the game's water map (`setWater`,
  `WATER.md`); the game lays it a little under its tiles' level (Soil-n-Silo's `WATER_DOWN`, 0.48 m), so the banks stand over
  it and the shore is where the bed rises through it.
- **Falls.** Where the river steps down a level, the cliff face runs between its two beds, and the game's water slides down
  over it, a ramp a tile long (its banks beside the fall get the water below's level, under them, so the sheet doesn't stand
  out over them). A stand-in: a fall that reads as one is Soil-n-Silo#241.
- **The paint.** Grass runs from lush, low and near water, to dry, high and far from it (blurred over a few tiles, so it
  follows the land rather than the tile grid), with the meadow's drifts of colour. Bare earth, tracks, rock and woods'
  floor have their own colours; the ground kind tints them a little (clay warmer, sand paler, stony greyer). The season
  turns the greens as it does everywhere.
- **The country.** The tiles off the map are drawn the same, clearly duller (`LandLook.beyond`, the developer's pick), so
  the edge of the buildable map reads. The dullness comes in by place just outside the map (Soil-n-Silo#269), reaching
  full between one and three tiles out, its outer edge wandering along the map's sides like a brush's; the map's own
  tiles keep their colour, to their very edge.
  Past the tiles, `beyond` is a coarse floor of distant woods out to the horizon. It starts from the land's own colour
  where it meets the land's edge and fades to the woods' floor over three of its cells; and since its cells are 16 m and
  run straight between their corners, the land's last cell in from its edge is taken towards that same straight run, so
  the two meet in one colour all along the edge and no seam shows there in any season. The land's outer edge is skirted
  down 3 m so no crack shows where they meet.
- **Chunks.** The land is meshes of 8 by 8 tiles, each cut into the renderer's tiles so a pass draws only what it sees.

## Earthworks without a hitch

`r.updateLand(rect, patch)` takes only the changed tiles' new values and returns how many tiles really changed (0: nothing
to do). Nothing on screen changes in that call. Over the next frames, about `STEP_BUDGET` (3 ms) each:

1. The first frame waits, so the game's own reading of the land (its `Lie`, which it refits in the same frame) and the
   drawn land don't both fall in one frame.
2. The ground is fitted again within 8 tiles of the change (further out it hardly moves): set up in one frame, its 128
   sweeps of the solver eight at a time over the next, then finished, with how dry the ground lies round it (all of it,
   if the water moved) and the chunks whose ground or paint moved. The sweeps run in the same order however they're
   spread, so the ground fits exactly as if it were done at once.
3. The following frames paint those chunks again, a few a frame.
4. Once all are painted, they're swapped in at once, so the land never shows half an earthwork. The things that read the
   ground (the shelter's map, the hollows where thin snow lies, the clouds' map, `landAt`'s grid) are refreshed once for
   the whole swap, over the changed area only where they can be. If the land's outer edge moved, the country beyond's mesh
   is made again to meet it.

No piece of work is cut short, so a frame goes over 3 ms by the piece it ends on: the longest, one chunk painted or the
fit set up or finished, take 2 to 5 ms once warm (commission 8's land, in Node). The first earthwork of a session takes
longer while the code warms up. An earthwork given while another is under way waits its turn, and each is swapped in on
its own. Old chunks are freed when they're swapped out.

## Asking where the land is

`r.landAt(x, z)` and `r.landHit(ray)` answer from the same fit, on the CPU, with no wait for the GPU: what the game
stands on the land sits on what's drawn. In the water's beds they give the bed; the game's `Lie` has the water's tiles
at their level, which is where a boat or a dropped good on the water belongs.

## Not yet

- Falls that read as waterfalls (Soil-n-Silo#241).
- Grass tufts where the cover says grass (the meadow's), round what stands on it.
- The cuts models need where they stand: the water wheel's race in its bank (`wheelRace` in the catalogue).
- The game fits the same tiles a second time for its `Lie` (about 10 ms an earthwork, all in one frame); one fit shared
  between them would take that away.
