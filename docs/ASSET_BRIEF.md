# Asset brief: models for the game

Who this is for: whoever builds the 3D models. To change a rule, edit this file in the same PR as the work that needs the change.

## Style

From the design doc ("Camera and presentation"): low-poly, flat-colour models, seen from 4 sides (the camera turns in 90° steps),
so every model must read well all the way round. The orthographic camera looks down at 30°, and the renderer turns the scene into
pixel art at about 16 art pixels per metre of view height, so small details under ~0.06 m disappear or flicker. Prefer bold
shapes and a few deliberate colours over fine detail.

## Pipeline

The renderer's loader and its rules are in the renderer repo: `docs/ASSET_BRIEF.md` there, "The pipeline contract". In short:
a deterministic Blender Python build script per model (the source of truth), a GLB export with one flat Principled base colour
per material (no textures, UVs or vertex colours), and a preview PNG. Here they live in `assets/<name>/build.py`, exported to
`public/models/<name>.glb`.

Scale: 1 Blender unit = 1 m = one farm tile. Origin on the ground at the model's footprint centre, facing +Z.

## Names the game reads

Besides the renderer's prefixes (`decor_`, `thin_`, `move_spin_` ...), the game splits models by these node names
(`src/world/models.ts`):

- `stage_<n>`: a crop's growth stages, each a root at the origin. Every part sways in the wind about the plant's foot.
- `running_*` / `idle_*`: a machine's parts shown only while it runs / is idle. Its `move_spin_` parts turn only while it runs.
- `smoke_emitter`: an Empty where a running machine's smoke leaves (the game adds the puffs).
- `door`: the coop door, origin on its hinge at the bottom; the game swings it about the vertical axis.
- `fill`: the trough's feed, shown while the trough has food.

A model that fails to load is drawn as a plain box of its size, with a console warning.

## Needed for the MVP (all built, 2026-10-07)

| Model | Notes |
| --- | --- |
| Chicken | Rigid parts; small (about 0.4 m), must read at 1x zoom |
| Wheat, tomato, pumpkin | 3–5 growth stages each, one model per stage; tomato has a harvested-and-regrowing stage |
| Tilled soil tile | Built in code instead (`src/world/models.ts`): 5 fertility bands, pale to rich dark brown, each dry and watered |
| Coop | With a door that opens. The trough is its own model (`trough`), in the chicken run; the roof doesn't lift off yet |
| Shipping bin, shop stall | |
| Mill, oven | Idle and running looks (smoke, glow) |
| Items | Hotbar icons are pixel art drawn in code (`src/ui/icons.ts`). In the world: `egg_nest` and `manure` |
| Trees, fence, path | `tree_oak`, `tree_pine`, `bush`; the fence and path are built in code |
