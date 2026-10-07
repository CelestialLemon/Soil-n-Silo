# Soil n Silo models

From the repository root, rebuild every GLB and contact sheet with Blender 5.2:

```sh
./assets/build_all.sh
```

Set `BLENDER_BIN` to use another Blender executable. A single model can be built
with `blender -b --python assets/chicken/build.py`. Scripts are deterministic;
`build.py` is the source of truth. Exports go to `public/models/<name>.glb` and
previews to `assets/<name>/preview.png`. The builder prints measured triangles
and dimensions and rejects degenerate, smooth, below-ground or over-budget meshes.

Metres, Blender Z-up, front −Y, footprint centred at the origin. GLB exports are
Y-up, apply modifiers, retain custom properties, and contain no cameras, lights,
UVs or images. All surfaces use flat shading and a single Principled Base Color;
windows and fire use emission strength ≥ 0.5. The single 31-colour palette lives
in `common.py`; material names describe their intended appearance. No ground slabs.

Crop GLBs contain overlapping `stage_0`… roots, each at (0,0,0); show exactly one
root and its descendants. Tomato harvest returns to `stage_2`. `door` is a joined
coop door with its origin at the bottom of its left hinge; rotate around vertical
Y after GLB loading (Blender Z). `fill` is removable trough grain. The oven toggles
`idle_mouth` / `running_fire` and provides the Empty `smoke_emitter`. Mill sails and
hub are one `move_spin_sails` mesh with local X along the axle and `speed = 1.2`.
Ground cover uses `decor_`; no intentionally thin parts are needed. Tree crowns
overhang their trunk footprints.

Static previews are 512×512: front/back on the top row, left/right below. Crop
previews have stage rows top to bottom and front/back/left/right columns. Coop
previews have closed/open rows; oven previews have idle/running rows. All cameras
are orthographic, 30° above the ground. Preview state changes happen after export.

| Palette group | Named colours (sRGB hex) |
| --- | --- |
| Ivory | feather `#fff5e2`, chalk `#f2e8cc`, cream `#e5c992` |
| Warm crops/paint | red `#bb4743`, red_light `#d65a4b`, tomato `#e25136`, pumpkin `#e58a32`, pumpkin_dark `#bc6127` |
| Grain | gold `#ddba57`, straw `#b48d42` |
| Plants | green `#528447`, leaf `#76a84e`, darkleaf `#326043`, sprout `#91bc61` |
| Timber | wood `#8a6a44`, lightwood `#a07a50`, darkwood `#59432f`, bark `#674735` |
| Stone/metal | stone `#898c83`, stone_light `#b5ad94`, slate `#4b6470`, slate_light `#627c84`, iron `#38484a`, black `#262d2c` |
| Clay/cloth/light | clay `#cb7852`, brick `#aa523c`, sack `#c5aa70`, glow `#ffd68b`, fire `#ff9c39` |
| Manure | dung `#68412e`, dung_light `#8a5835` |

