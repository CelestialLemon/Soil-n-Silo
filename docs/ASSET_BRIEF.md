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
deliberate colours over fine detail. Models are seen packed close together on a grid, so keep each inside its footprint, with
explicit exceptions: a wind turbine's rotor sweeps past its tile above 2.3 m to clear neighbouring buildings; tree crowns may
overhang their one-tile trunk footprints; and a water wheel's rotating wheel and named axle/bearing/dynamo assembly may project
into the water in front of its 2×2 bank footprint.

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
- `move_spin_anemometer`: the weather station's cups. Like the turbine's rotor they turn whether or not the building is powered; the
  game picks their speed from the wind (see "Needed for the weather station").
- `smoke_emitter`: an Empty where a running machine's steam or smoke leaves (the game adds the puffs).
- `charge_<n>`: a battery's charge rings, `n` from 0 (lowest) to 3. The game shows rings 0..k−1 for k quarters of charge.
- `variant_<n>`: rocks and each tree species contain three overlapping alternatives,
  numbered 0…2. Each root stays at (0,0,0); show one root and its descendants.

A model that fails to load is drawn from simple shapes built in code (`src/world/shapes.ts`), so the game never waits for a model.

## Needed for v0.1 (all built, 2026-10-09)

Footprints are in tiles (metres). The game draws the Blender model where there is one and an in-code stand-in otherwise. The
mill's model is `mill_electric` and the coop's `coop_solar`.

| Model | Footprint | Height | Notes |
| --- | --- | --- | --- |
| `field` | 3 × 3 | — | Built in code (soil per tile, coloured by fertility), plus the crop models |
| `beans`, `sunflower`, `flax` | 1 × 1 | | New crops, 4 `stage_<n>` each. Sunflower tall (~1.4 m ripe) with a big yellow head; beans on a small pole; flax fine blue-flowered |
| `wheat`, `tomato` | | | Exist (`assets/wheat`, `assets/tomato`) |
| `sprinkler` | 1 × 1 | ~0.8 | A copper riser with a spinning head (`move_spin_head`) |
| `coop_solar` | 3 × 3 | | The coop: a green roof, solar tiles, a fixed open entrance |
| `beehive` | 1 × 1 | ~0.9 | A stacked hive on legs with a planter of flowers |
| `composter` | 2 × 2 | ~1.0 | Slatted timber bins, dark compost showing |
| `mill_electric` | 2 × 2 | ~2.0 | An electric grain mill: a hopper on a timber tower; `running_` a turning wheel or vibrating sieve |
| `water_wheel` | 2 × 2 bank | 1.91 above bank | Timber-and-stone generator house, moss roof, copper dynamo/conduit and `running_control_window` (emission 0.8). Ten-paddle wheel projects ~0.70 m beyond the front bank edge, down to ~−0.23 m at rest (~−0.25 m through a turn); `move_spin_wheel`, local X along the bank, `speed = 2*pi/5` rad/s. 1,288 triangles total |
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
| `tree_oak` | 1 × 1 trunk; crown overhang | 2.76–3.39 | Three variants; broad lumpy crown, stout forked trunk; distant canopy `#467348` |
| `tree_birch` | 1 × 1 trunk; crown overhang | 3.07–3.48 | Three variants; pale marked bark, airy yellow-green lobes, variant 1 has two stems; distant canopy `#b5ce76` |
| `tree_pine` | 1 × 1 trunk; crown overhang | 2.85–3.42 | Three variants; dark blue-green tiered spire with bare trunk at foot; distant canopy `#28564f` |
| `tree_willow` | 1 × 1 trunk; crown overhang | 2.62–3.16 | Three variants; soft-green dome and long drooping curtains near ground; distant canopy `#83b390` |
| `tree_poplar` | 1 × 1 trunk; crown overhang | 3.70–4.45 | Three variants; tall narrow Lombardy column, deep green; distant canopy `#2e633d` |
| `tree_apple` | 1 × 1 trunk; crown overhang | 2.04–2.25 | Three variants; small low orchard crown, coral fruit and pink blossom dots; distant canopy `#567843` |
| `bush` | 1 × 1 | ~0.8 | Existing rounded berry shrub |
| `sapling` | 1 × 1 | ~0.6 | A staked young tree |

Goods are small tokens (~0.25 m) built in code, one shape and colour per good, carried in a truck's bed.

Trees are authored at full model scale; the game uses 0.62–0.87× scale. Each
variant is flat shaded, grounded at its trunk foot and limited to 700 triangles.
Measurements below are in variant order 0 / 1 / 2; crown width is the larger
world X/Y extent of foliage, excluding fruit.

| Species | Triangles | Height (m) | Crown width (m) |
| --- | --- | --- | --- |
| Oak | 400 / 400 / 400 | 3.140 / 2.763 / 3.391 | 2.300 / 1.995 / 2.257 |
| Birch | 320 / 400 / 320 | 3.274 / 3.069 / 3.478 | 1.720 / 1.510 / 1.670 |
| Pine | 94 / 94 / 94 | 3.350 / 2.855 / 3.421 | 1.760 / 1.537 / 1.505 |
| Willow | 544 / 544 / 544 | 2.980 / 2.622 / 3.159 | 2.320 / 2.019 / 2.413 |
| Poplar | 278 / 278 / 278 | 4.200 / 3.696 / 4.452 | 1.392 / 1.422 / 1.335 |
| Apple | 482 / 482 / 482 | 2.120 / 2.035 / 2.247 | 1.760 / 1.487 / 1.793 |

### Seasonal trees (climate phase 1, #95)

A commission has one season for its whole run (`Scenario.climate.season`), so the game loads the set for that season once.
Summer is the model above. `tree_<species>_spring`, `_autumn` and `_winter` (and `bush_<season>`) are the other seasons, built
by the same `assets/tree_<species>/build.py` (a `seasonal` loop in `assets/trees.py`, previews as `preview_<season>.png`). Same
three variants, same trunks, same limits (700 triangles, trunk inside the tile, crown free to overhang); a bare winter crown's
boughs (`_bough`) may overhang like a crown. The pine keeps its one model all year (pines stay green among the bare trees).
`treeModel` in `src/world/trees.ts` picks the file.

| Species | Spring | Autumn | Winter |
| --- | --- | --- | --- |
| Oak | fresh green `#76a84e` | amber and russet `#d98a32` | bare boughs, grey-brown twig masses `#7a6758` |
| Birch | sprout green `#91bc61` | thinning gold `#e3b43c`, pale boughs showing | bare pale boughs, purple-brown twigs `#8c6c66` |
| Willow | sprout green `#91bc61` | yellow `#cdb04a` | bare arching boughs, thin golden-ochre curtains `#b48d42` |
| Poplar | fresh green `#588650` | thinning gold column `#e3b43c` | bare upswept boughs, narrow twig spires `#7a6758` |
| Apple | blossom, pale pink and white over fresh green `#e9c3c0` | amber and gold, ripe fruit `#c0782e` | bare boughs, twig masses `#7a6758` |
| Bush | fresh green with white flowers `#76a84e` | russet and amber with berries `#a8502f` | bare twiggy mound, red berries kept `#6d5644` |
| Pine | summer model | summer model | summer model |

The colours are the distant canopy of each season (`CANOPY` in `src/world/trees.ts`); the far woods' crowns and apron use them
and the season's mix in `WOODS`, with pines in the mix staying green. Winter has no snow cover on the models: it is a bare
look, and any frosting is the ground's job.

The water wheel's exception is checked by name (`front_water_parts` in
`assets/solarpunk.py`): `move_spin_wheel`, `Waterwheel_axle`,
`Waterwheel_bank_bearings`, `Waterwheel_dynamo_and_conduit`. They remain within
X = [−1,1], Y = [−1.9,1], Z ≤ 1.3 m. Only the rotating wheel may reach
Z = −0.26 m; the other named parts stay grounded. Every other mesh stays
inside the grounded 2×2 footprint. The complete swept envelope is validated,
and the origin stays at the bank footprint centre, without recentering on the
overhang. River surface is ~−0.12 m; the bed is ~−0.42 m.
The complete model bounds at rest are 1.779 × 2.605 × 2.142 m (X/Y/Z),
including the submerged paddles; its highest point is 1.910 m above the bank.
The wheel is 0.340 m wide, with a 1.437 m swept diameter and its axle at
(0, −0.980, 0.470) in Blender metres. Its lowest paddle reaches −0.248 m
through a full turn.

## Needed for the silos (2026-10-10, built 2026-10-11)


| Model | Footprint | Height | Notes |
| --- | --- | --- | --- |
| `silo` | 2 × 2 | ~2.4 | A ceramic grain silo with copper hoops and a green or moss roof, on a stone apron. Tall: it shelters turbines |

## Needed for the trucks (2026-10-12, built 2026-10-16)

Trucks on routes carry the goods, and the silo only stores them.

| Model | Footprint | Height | Notes |
| --- | --- | --- | --- |
| `truck` | ~0.86 long × 0.51 wide | ~0.47 | A small electric farm truck: a rounded ceramic cab, emissive sea-glass windows, solar glass on the cab roof, and an open timber bed. Its flat floor is at 0.27 m (`TRUCK_BED` in `src/world/shapes.ts`), with all 6 goods slots clear above it; the builder checks their clearance. Front facing +Z. Seen moving in 8 directions |
| `garage` | 2 × 2 | ~1.66 | An open-front timber shelter on individual stone shoes, slatted side/back walls, a pitched moss and solar-glass roof, planting and a copper charging post. Trucks park on the ground under the canopy |

## Needed for the weather station (climate phase 3, #137; built 2026-10-25)

The weather station is the building that gives a forecast (`CLIMATE.md`). Its model is a small piece of valley furniture, not a
landmark: it stands among fields, sprinklers and pylons, so its silhouette must not be mistaken for either of them.

| Model | Footprint | Height | Notes |
| --- | --- | --- | --- |
| `weather_station` | 1 × 1 | ~1.1 | A white slatted instrument screen (a Stevenson screen) with tilted ceramic louvres, a linen core, a brass door catch and a living-moss lid, on four timber legs with stone feet. Beside it a thin copper mast with a wind vane and a three-cup anemometer, and a small ceramic rain gauge with a copper funnel. Grass tufts. Not `tall`: it must not shelter a turbine |

- **Silhouette.** A sprinkler is a squat copper riser with a brass head (0.82 m); a pylon is a slim brown timber pole (1.47 m) with a white
  insulator and a copper cap. The station is a wide white box on legs with a thin mast beside it, 1.1 m tall. The comparison with a sprinkler and a pylon
  at the game's camera is in the PR for #137.
- **Moving part.** `move_spin_anemometer` is the three cups and their arms, joined, with its origin at the hub on the mast axis and
  its local X axis vertical (as the sprinkler's head), so the cups turn about the mast. Custom property `speed = 2.5` rad/s is only
  the default; the game sets the speed (below). Its swept disc (radius 0.23 m) stays inside the 1 × 1 footprint and above the screen's roof.
- **How the game wires it.** Not in the model, in `src/world/`; the station building does the same as the turbine, with faster speeds
  for the smaller cups, and not tied to the building's power:
  1. `FILES` in `models.ts`: `station: 'weather_station'` (whatever id the building has), so its `idle`/`running` looks (the build
     ghost, the inspector) come from `lookFrom`.
  2. Add to `Models` a `station: Geo[]` of three geometries, built like `turbine` but with no stopped look and these speeds in rad/s:
     **1.5** (light wind), **3.5** (moderate), **6** (strong, and every gale). Each is the whole model collected with
     `movingPartMotion`, replacing the speed in the motion, like the turbine's three looks:
     ```ts
     const stationRoot = roots.get('weather_station');
     const station = [1.5, 3.5, 6].map((speed) => stationRoot
       ? collect(stationRoot, () => true, (m) => { const mo = movingPartMotion(m); return mo && mo.anim ? { ...mo, anim: [...(mo.anim as number[]).slice(0, 3), speed] as [number, number, number, number] } : mo; }, true).build()
       : standIn('station').running);
     ```
     return it from `loadModels` beside `turbine`, and list it in `allGeometries`.
  3. In `view.ts` `sync`, for the station, pick the look from the wind the way the turbine does, with the same bands and no
     power or `isRunning` test: `const band = wind < 0.35 ? 0 : wind < 0.7 ? 1 : 2; key += ' ' + band; geo = () => this.m.station[band];`.
- Tune the three speeds by eye in play: the three cups look identical every 120°, so 6 rad/s shows 3 cycles a second. Slow it down if
  it flickers at the renderer's frame rate.

## Greenhouse (climate phase 4, #151)

| Model | Footprint | Height | Notes |
| --- | --- | --- | --- |
| `greenhouse` | 3 × 3 | ~2.34 m | Low timber shell on individual stone shoes, sea-glass panes, copper ridge and two raised vent hoods. Vines climb two opposite corners. A glazed front door has a brass pull. No floor or crops: the game's field view draws all nine growing tiles. |

- The eave is 1.45 m, ridge 2.10 m: low enough to see the beds, with clearance for ripe sunflowers in the outer rows.
- `glass_*` panes use one shared flat glass material, split at each frame bay. The 0.10–0.11 m bars stand at least
  0.04 m proud of the pane surfaces (more than the renderer's 2 mm depth tolerance). No ambient motion on the shell.
- Loaded with the released renderer v0.5.0's `glassMeshRule`, into the **same geometry** as the opaque frame. The renderer
  draws the tint, rims and roof glints, lets crops and frame shadows show through, casts no glass shadow and picks through panes.
- The field view adds the shell after its soil/crops. Only the shell takes the normal building snow tint, including its glass
  roof; the ground snow sheet excludes the greenhouse's nine tiles and rebuilds on placement/removal.
- Two warm heater lanterns hang inside the gables: `idle_Heater_lantern` is unlit clay, `running_Heater_lantern` is warm
  `glow` emission 0.8. The game chooses the lit look only at night while the building actually receives heating watts
  (`wants * shareOf`, with a power network). Partial power still lights them; no draw, no network or flooding leaves them dark.
  Emissive surfaces signal warmth without adding a light source or changing the crop colours.
- `assets/greenhouse/build.py` is deterministic, uses the shared palette and validates a 3,000-triangle budget; its contact
  sheet has idle/heated rows. The greenhouse also has its own generated Clearday icon.
