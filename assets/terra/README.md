# Terra-style pilot

Alternate models for the full-resolution renderer experiment. Original assets
and the pixel renderer are untouched. `build.py` is each model's deterministic
source; `terra_common.py` owns the palette, smooth geometry helpers, vertex bake,
validation, export and preview lighting. Built with Blender Flatpak 5.2.

| Model | Triangles | Blender dimensions X × Y × Z (m) |
| --- | ---: | --- |
| `tree_oak` | 5,400 | 2.414416 × 1.923951 × 3.050000 |
| `wind_turbine` | 5,908 | 2.165243 × 0.682221 × 4.860000 |
| `tree_pine` | 4,850 | 1.595389 × 1.571151 × 3.200000 |
| `bush` | 1,952 | 0.827486 × 0.618783 × 0.800000 |
| `rock` | 694 / 1,356 / 1,930 (`variant_0`…`variant_2`) | 0.871275 × 0.748764 × 0.400000 / 0.793676 × 0.675475 × 0.580000 / 0.882518 × 0.692188 × 0.380000 |
| `wheat` | 864 / 864 / 864 / 1,920 (`stage_0`…`stage_3`) | 0.647027 × 0.663868 × 0.697911 (all-stage bounds) |
| `depot` | 5,928 | 2.670000 × 2.650000 × 2.580000 |
| `mill_electric` | 5,120 idle / 5,132 running | 1.583564 × 1.365000 × 1.930000 |
| `solar_panel` | 5,440 | 1.860000 × 1.500668 × 0.949675 |
| `pylon` | 1,796 | 0.420000 × 0.317221 × 1.470000 |
| `sprinkler` | 2,992 | 0.725801 × 0.589443 × 0.818730 |
| `battery` | 5,836 (fully charged) | 1.560000 × 1.560000 × 1.065000 |
| `silo` | 5,980 | 1.970000 × 1.970000 × 2.550000 |
| `garage` | 4,932 | 2.000000 × 1.980000 × 1.290000 |
| `truck` | 4,720 | 0.485000 × 0.860000 × 0.460000 |

Metres, Z-up, front −Y; GLB exports Y-up, front +Z. Ground-level footprint
origins and overall bounds match the originals. The oak crown overhangs its
trunk. The turbine's fixed parts stay inside one tile and its rotor's full sweep
stays above 2.3 m. `move_spin_rotor` keeps the original pivot
`(0.001249969, −0.251110647, 3.62)` in Blender coordinates, local X along −Y,
and custom property `speed = 1.2` (available as `userData.speed` in three.js).
Its mesh contains the spinner, three blades and their coloured tips.

All meshes are smooth shaded; machine edges are bevelled with weighted normals.
No image textures, UVs, cameras, lights or keyframe animations are exported.
Previews are 512 × 512: front/back above left/right, orthographic at 30° pitch,
rendered in Cycles with a soft warm sun and cool sky fill. The preview adds normal
scene lighting to the same baked vertex colours exported to GLB.

Rock previews have three variant rows; wheat previews have four stage rows, with
front/back/left/right columns at 256 pixels per view, matching the originals.
Their AO is baked separately per visible root. Each root stays at the origin;
every stage/variant retains its original bounds, including wheat's slight ground
clearance. Vegetation builders read the original `public/models/<name>.glb` to
retain every original node's parent, transform and custom properties while
replacing its geometry. The oak has small overlapping leaf cushions and a few
lighter top tufts; the pine has layered needle sprays. Bushes, rocks and wheat
each stay below 2,000 triangles per visible stage or variant.

## Vertex colours

The active Blender corner attribute `Color` exports as **`COLOR_0`**. It contains
the **complete linear RGB albedo**, including each part's palette colour,
deterministic 40-ray local ambient occlusion, and a cooler/darker bottom to
lighter top gradient. Alpha is always 1. Material Base Color factors are white;
**do not multiply the palette in again**. Roughness is 0.82, metallic is zero.
After baking, non-emissive meshes use one identical white material slot so Blender
5.2 retains the baked colours on all faces, including formerly separate paints.
Lamps, charge rings, and other originally emissive surfaces retain a material
with palette-coloured emission (strength ≥ 0.5) and a nonzero glTF emissive factor.
Export validation also rejects entirely white placeholder colour attributes.

three.js `GLTFLoader` handles the colour attribute and enables vertex colours on
its imported materials automatically. If replacing materials, use a white
`MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.82,
metalness: 0 })`, retaining the geometry's `color` attribute and normals. Colours
are already linear; do not apply an sRGB-to-linear conversion to the attribute.
Use normal sun/ambient lighting; strong additional AO will double-darken crevices.
The rotor carries its baked colour shading as it rotates. This is an ambient
style bake, not a dynamic shadow map or a texture bake.

## Build

From the repository root:

```sh
flatpak run org.blender.Blender -b --python-exit-code 1 --python "$PWD/assets/terra/tree_oak/build.py"
flatpak run org.blender.Blender -b --python-exit-code 1 --python "$PWD/assets/terra/wind_turbine/build.py"
```

Outputs are `public/models/terra/<name>.glb` and the adjacent `preview.png`.
Builders assert a 6,000-triangle ceiling, original dimensions, nondegenerate
geometry, smooth shading and the turbine animation contract. They also inspect
the resulting GLB for normals, `COLOR_0`, white material factors and no textures
or UVs. Temporary preview views are removed after rendering. No reference images
are copied or bundled. Small turbine vents/bolts are easiest to see close up;
the required four-view sheet frames its entire original 4.86 m height.
