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
windows and fire use emission strength ≥ 0.5. The single shared palette lives
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
Solarpunk machines with state-specific parts also use idle/running rows and four
columns (front/back/left/right). Their shared details live in `solarpunk.py`, which
checks footprint bounds through a full rotation of every `move_spin_` mesh.
Solarpunk models use a 3,000-triangle budget per visible stage or variant. `mill_electric` is the
electric mill; the existing `mill` remains the original windmill.

The drone is 0.7 m across with its origin at its flying centre; its four
`move_spin_rotor_0`…`move_spin_rotor_3` nodes have local X pointing up and
`speed = 18`. The sprinkler's `move_spin_head` also has local X up, `speed = 3`.
Rock previews show `variant_0`…`variant_2` in separate rows; each variant root
is at the origin. Beans, sunflower and flax use four `stage_0`…`stage_3` roots
and each covers one tile. The solar coop has a fixed open entrance.

With the Blender Flatpak, use an absolute script path (its working directory
may differ from the shell's):

```sh
flatpak run org.blender.Blender -b --python-exit-code 1 --python "$PWD/assets/drone/build.py"
```

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
| Solarpunk ceramic/metal | ceramic `#f4f5e9`, copper `#b96c49`, brass `#d4ad60` |
| Solar/glass | solar `#234c83`, solar_light `#4c85b0`, glass `#8ecac6` |
| Living roofs/linen/light | moss `#638456`, linen `#dddcc2`, charge `#a7e5b3` |
