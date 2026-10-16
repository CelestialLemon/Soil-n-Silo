# Soil n Silo models

From the repository root, rebuild every GLB and contact sheet with Blender 5.2:

```sh
./assets/build_all.sh
```

Set `BLENDER_BIN` to use another Blender executable. A single model can be built
with `blender -b --python assets/wheat/build.py`. Scripts are deterministic;
`build.py` is the source of truth. Exports go to `public/models/<name>.glb` and
previews to `assets/<name>/preview.png`. The builder prints measured triangles
and dimensions and rejects degenerate, smooth, below-ground or over-budget meshes.

Metres, Blender Z-up, front −Y, footprint centred at the origin. GLB exports are
Y-up, apply modifiers, retain custom properties, and contain no cameras, lights,
UVs or images. All surfaces use flat shading and a single Principled Base Color;
windows and fire use emission strength ≥ 0.5. The single shared palette lives
in `common.py`; material names describe their intended appearance. No ground slabs.

Crop GLBs contain overlapping `stage_0`… roots, each at (0,0,0); show exactly one
root and its descendants. Tomato harvest returns to `stage_2`. Ground cover uses
`decor_`; no intentionally thin parts are needed. Tree crowns overhang their trunk
footprints.

Static previews are 512×512: front/back on the top row, left/right below. Crop
previews have stage rows top to bottom and front/back/left/right columns. All cameras
are orthographic, 30° above the ground. Preview state changes happen after export.
Solarpunk machines with state-specific parts also use idle/running rows and four
columns (front/back/left/right). Their shared details live in `solarpunk.py`, which
checks footprint bounds through a full rotation of every `move_spin_` mesh.
`build_complete` accepts a square side length or an `(X, Y)` footprint pair for
rectangular models such as the truck; its cargo floor stays at Blender Z = 0.27 m.
Solarpunk models use a 3,000-triangle budget per visible stage or variant. `mill_electric` is the
electric mill and `coop_solar` the coop.

The sprinkler's `move_spin_head` also has local X up, `speed = 3`.
Rock previews show `variant_0`…`variant_2` in separate rows; each variant root
is at the origin. Beans, sunflower and flax use four `stage_0`…`stage_3` roots
and each covers one tile. The solar coop has a fixed open entrance.

The battery's charge rings are four joined meshes `charge_0`…`charge_3` (lowest
first); the game shows rings 0..k−1 for k quarters of charge. The wind turbine's
rotor sweeps past its one tile: `build_complete(..., overhang_above=2.3)` lets a
`move_spin_` part do that while its whole swept disc stays above 2.3 m. The silo
stands in its back-left corner on a stone apron with three small pads.

The six trees (`tree_oak`, `tree_birch`, `tree_pine`, `tree_willow`,
`tree_poplar`, `tree_apple`) also use three `variant_<n>` roots at the trunk
foot, with variant rows and front/back/left/right columns. `trees.py` checks
the 700-triangle limit per variant and woody stems inside their one tile.
Crowns may overhang; asymmetric crowns do not move the trunk origin. Each
builder's docstring gives its representative distant-canopy hex.

The water wheel's 2×2 footprint is the bank, centred on the origin; its front
faces the water (-Y). `build_complete(..., front_water_parts=(...))` allows
only the named wheel, axle, bearings and dynamo/conduit to extend as far as
Y = -1.9 m, with X still in [-1, 1]. Only `move_spin_` geometry may dip to
Z = -0.26 m; named static parts stay above Z = 0. Their upper bound is 1.3 m.
All other parts stay grounded inside the footprint, and spinning parts are
checked through a complete revolution. This exception preserves the bank
origin instead of recentering the model on its overhang. `move_spin_wheel`
has local X along the bank and `speed = 2*pi/5` rad/s (five seconds per turn).

With the Blender Flatpak, use an absolute script path (its working directory
may differ from the shell's):

```sh
flatpak run org.blender.Blender -b --python-exit-code 1 --python "$PWD/assets/wheat/build.py"
```

| Palette group | Named colours (sRGB hex) |
| --- | --- |
| Ivory | feather `#fff5e2`, chalk `#f2e8cc`, cream `#e5c992` |
| Warm crops/paint | red_light `#d65a4b`, tomato `#e25136` |
| Grain | gold `#ddba57`, straw `#b48d42` |
| Plants | green `#528447`, leaf `#76a84e`, darkleaf `#326043`, sprout `#91bc61` |
| Oak | oak_leaf `#467348`, oak_light `#588650` |
| Birch | birch_bark `#eee8d6`, birch_mark `#494b43`, birch_leaf `#b5ce76` |
| Pine | pine_leaf `#28564f`, pine_light `#34675b` |
| Willow | willow_leaf `#83b390`, willow_shade `#659478` |
| Poplar | poplar_leaf `#2e633d`, poplar_light `#3f7746` |
| Apple | apple_leaf `#567843`, apple_red `#e76a65`, blossom `#f3bbbf` |
| Timber | wood `#8a6a44`, lightwood `#a07a50`, darkwood `#59432f`, bark `#674735` |
| Stone/metal | stone `#898c83`, stone_light `#b5ad94`, slate `#4b6470`, slate_light `#627c84`, iron `#38484a`, black `#262d2c` |
| Clay/cloth/light | clay `#cb7852`, brick `#aa523c`, sack `#c5aa70`, glow `#ffd68b`, fire `#ff9c39` |
| Manure | dung `#68412e` |
| Solarpunk ceramic/metal | ceramic `#f4f5e9`, copper `#b96c49`, brass `#d4ad60` |
| Solar/glass | solar `#234c83`, solar_light `#4c85b0`, glass `#8ecac6` |
| Living roofs/linen/light | moss `#638456`, linen `#dddcc2`, charge `#a7e5b3` |
