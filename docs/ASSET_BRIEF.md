# Asset brief: models for the game

Who this is for: whichever agent builds the 3D models (usually **Sol**). To change a rule, propose it on `docs/BOARD.md` first.

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

## Needed for the MVP

| Model | Notes |
| --- | --- |
| Chicken | Rigid parts; small (about 0.4 m), must read at 1x zoom |
| Wheat, tomato, pumpkin | 3–5 growth stages each, one model per stage; tomato has a harvested-and-regrowing stage |
| Tilled soil tile | One per fertility band, pale to rich dark brown (exact bands agreed when soil work starts) |
| Coop | With a door that opens and a trough inside; the roof may need to lift off so the player can see in |
| Shipping bin, shop stall | |
| Mill, oven | Idle and running looks (smoke, glow) |
| Items | Seeds, feed, egg, manure, flour, bread, pumpkin pie: small, for the hotbar icons and for dropped items |
| Trees, fence, path | Farm dressing |
