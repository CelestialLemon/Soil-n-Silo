# Asset brief: models for the game

Who this is for: whoever builds the 3D models. To change a rule, edit this file in the same PR as the work that needs the change.

## Style

The game is set in a **solarpunk** valley (`DESIGN.md`): technology grown together with nature. Think timber frames, white
ceramic and glass, copper and brass fittings, solar glass, terracotta, and living plants on every structure (moss roofs, vines,
planters, grass tufts). Shapes are rounded and friendly rather than industrial; nothing is chrome or grey steel. Machines should
look crafted or grown, not stamped out. A building's job should be readable from its silhouette (a turbine's rotor, a mill's
hopper, a loom's frame, a bakery's chimney).

From the camera (`DESIGN.md`, "Camera"): low-poly, flat-colour models, seen from 4 sides (the camera turns in 90° steps), so every
model must read well all the way round. The orthographic camera looks down at 30°, and the renderer turns the scene into pixel art
at about 16 art pixels per metre of view height, so small details under ~0.06 m disappear or flicker. Prefer bold shapes and a few
deliberate colours over fine detail. Models are seen packed close together on a grid, so keep each inside its footprint. One exception: a wind turbine's rotor
sweeps past its tile, high enough (above 2.3 m) to clear the buildings beside it.

## Pipeline

The renderer's loader and its rules are in the renderer repo: `docs/ASSET_BRIEF.md` there, "The pipeline contract". In short:
a deterministic Blender Python build script per model (the source of truth), a GLB export with one flat Principled base colour
per material (no textures, UVs or vertex colours), and a preview PNG. Here they live in `assets/<name>/build.py`, exported to
`public/models/<name>.glb`; `assets/README.md` has the conventions and `assets/common.py` the shared palette and helpers.

Scale: 1 Blender unit = 1 m = one tile. Origin on the ground at the model's footprint centre, front facing +Z (glTF), which is −Y in
Blender.

## Names the game reads

Besides the renderer's prefixes (`decor_`, `thin_`, `move_spin_` ...), the game splits models by these node names
(`src/world/models.ts`):

- `stage_<n>`: a crop's growth stages, each a root at the origin. Every part sways in the wind about the plant's foot. A crop
  model covers one tile; a field shows 9 of them.
- `running_*` / `idle_*`: a machine's parts shown only while it runs / is idle. Its `move_spin_` parts turn only while it runs
  (a wind turbine's rotor always turns).
- `smoke_emitter`: an Empty where a running machine's steam or smoke leaves (the game adds the puffs).
- `charge_<n>`: a battery's charge rings, `n` from 0 (lowest) to 3. The game shows rings 0..k−1 for k quarters of charge.

A model that fails to load is drawn from simple shapes built in code (`src/world/shapes.ts`), so the game never waits for a model.

## Needed for v0.1 (all built, 2026-10-09)

Footprints are in tiles (metres). The game draws the Blender model where there is one and an in-code stand-in otherwise. The
mill's model is `mill_electric` and the coop's `coop_solar` (the season-era `mill` and `coop` are kept).

| Model | Footprint | Height | Notes |
| --- | --- | --- | --- |
| `drone` | ~0.7 | ~0.25 | Four rotors (`move_spin_` each), a cargo basket; seen from above mostly |
| `field` | 3 × 3 | — | Built in code (soil per tile, coloured by fertility), plus the crop models |
| `beans`, `sunflower`, `flax` | 1 × 1 | | New crops, 4 `stage_<n>` each. Sunflower tall (~1.4 m ripe) with a big yellow head; beans on a small pole; flax fine blue-flowered |
| `wheat`, `tomato` | | | Exist (`assets/wheat`, `assets/tomato`) |
| `sprinkler` | 1 × 1 | ~0.8 | A copper riser with a spinning head (`move_spin_head`) |
| `coop` | 3 × 3 | | Exists (`assets/coop`), can stay; a solarpunk version (green roof, solar tiles) is welcome |
| `beehive` | 1 × 1 | ~0.9 | A stacked hive on legs with a planter of flowers |
| `composter` | 2 × 2 | ~1.0 | Slatted timber bins, dark compost showing |
| `mill` | 2 × 2 | ~2.0 | An electric grain mill: a hopper on a timber tower; `running_` a turning wheel or vibrating sieve |
| `oil_press` | 2 × 2 | ~1.4 | A screw press with a big wheel (`move_spin_`) and a jar of golden oil |
| `spinner` | 2 × 2 | ~1.3 | Spinning frame with bobbins (`move_spin_` wheel) |
| `loom` | 2 × 2 | ~1.5 | A timber loom with linen on it |
| `bakery` | 2 × 2 | ~2.0 | A tiled clay oven with a chimney (`smoke_emitter`), `running_` glow in its mouth |
| `cannery` | 2 × 2 | ~1.6 | A copper kettle and a rack of red jars, steam (`smoke_emitter`) |
| `solar_panel` | 2 × 2 | ~0.95 | Sleek and low: one thin sheet of deep-blue cells in a slim white frame, tilted to the front on a copper rail and two slender posts, meadow beneath (redrawn 2026-10-11) |
| `wind_turbine` | 1 × 1 | ~4.9 | Slim white tower (hub at 3.6 m), a big three-blade rotor (~2.5 m across, `move_spin_rotor`, local X along the axle) facing +Z, sweeping past the tile above 2.3 m; terracotta blade tips (redrawn 2026-10-11) |
| `battery` | 2 × 2 | ~1.1 | Four slim ceramic cells on a timber deck, copper bus bars between their terminals, four emissive charge rings per cell (`charge_0`…`charge_3`) (redrawn 2026-10-11) |
| `digester` | 2 × 2 | ~1.6 | A dome tank with a moss roof and a little flare pipe (`smoke_emitter`) |
| `pylon` | 1 × 1 | ~1.45 | Quiet: a short slim timber pole, a ceramic insulator, a copper cap and a tiny lamp. There are many, so they sit in the background; the game draws their wires and reach when you work with power (redrawn 2026-10-11) |
| `depot` | 3 × 3 | ~2.5 | The freight depot: a station platform with a cargo airship mast or a rail car; the commission's destination |
| `rock` | 1 × 1 | ~0.6 | Two or three variants as `variant_<n>` roots |
| `tree_oak`, `tree_pine`, `bush` | | | Exist |
| `sapling` | 1 × 1 | ~0.6 | A staked young tree |

Goods are small tokens (~0.25 m) built in code, one shape and colour per good, hung under the drone carrying them.

## Needed for the silos (2026-10-10, built 2026-10-11)

Belts, splitters, sorters, crossings and drone pads were removed (their models with them); silos and their drones carry the
goods now.

| Model | Footprint | Height | Notes |
| --- | --- | --- | --- |
| `silo` | 2 × 2 | ~2.4 | A ceramic grain silo with copper hoops and a green or moss roof, and three small landing pads for its drones at local (x, z) (0.5, 0.5), (−0.4, 0.55) and (0.55, −0.45) (`SILO_PADS` in `src/world/shapes.ts`), each with a small light. The drones park 0.42 m up, so keep the pads clear above that. Tall: it shelters turbines |

**Unused since the pivot** (kept for later chains): `chicken`, `egg_nest`, `manure`, `trough`, `farmhouse`, `shop_stall`,
`shipping_bin`, `oven`, `pumpkin`, `mill`, `coop`.
