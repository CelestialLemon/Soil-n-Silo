// brush3d's API: the one door into the renderer, for the game and the demo alike (docs/API.md). Anything not exported
// here is the renderer's own business (its passes, materials, shaders, uniforms and maps) and can change without notice.
// The demo (src/demo) imports nothing else; the tools, which test the insides, may.

// ---- The renderer ----
export { BrushRenderer, FALLING, type DrawnKind, type MeshOptions, type RendererOptions, type Settings } from './renderer/renderer';
export { QUALITY, type Quality, type QualityName } from './renderer/quality';
export type { MaterialKind } from './renderer/materials';
export type { Cover } from './renderer/shelter';

// ---- The game's tools on the picture (Soil-n-Silo#206) ----
export { OVERLAY_LOOK, OVERLAY_NONE, type Grid, type Overlay, type OverlayLook } from './renderer/overlay';
export { HIGHLIGHT_LOOK, type HighlightLook, type Mark } from './renderer/marks';
export { PREVIEW_LOOK, type Line, type LinePoint, type PreviewLook, type PreviewState } from './renderer/ontop';
export type { PickHit } from './renderer/pick';

// ---- The camera ----
export { MAX_ZOOM, MIN_ZOOM, PITCH, ViewCamera } from './renderer/camera';

// ---- The hour and the season ----
export { CHARACTERS, clockHour, referenceHour, REFERENCE_DAY, SEASON_SUN, SEASONS, type Character, type Day, type Season, type SeasonSettings } from './renderer/season';
export { hoursOf, lookAt, PRESETS as HOURS, type HourName, type Look } from './renderer/look';

// ---- The weather, the ground and the water ----
export { WEATHER_PRESETS, type CloudDrift, type Haze, type HazeKind, type Weather, type WeatherName } from './renderer/weather';
export { GROUND_EASE, type GroundMap } from './renderer/ground';
export { WATER_EASE, type WaterMap } from './renderer/water';
export type { DustSource } from './renderer/dust';

// ---- The land (docs/LAND.md) ----
export { LAND_COVER, LAND_GROUND, type Beyond, type LandCover, type LandGround, type LandMap, type LandPatch, type LandRect } from './land/map';
export { LAND_LOOK, type LandLook } from './land/paint';
export type { FlashSetting, Flicker, Strike } from './renderer/lightning';

// ---- The wind (docs/WIND.md) and the clouds: the simulation and recipe the rules share, and the renderer's view ----
export { startWind } from './wind/start';
export { WindWorker, type WindPort } from './wind/client';
export * from './shared';   // the simulation and the cloud recipe, which Node can load on their own
export { steadyWind, WIND_SCALE, windName, type WindStrength } from './renderer/wind';

// ---- The models (docs/MODELS.md) ----
export { blocksWind, GROUPS, MODELS, TILE, TOUR, wheelRace, type ModelInfo, type Stand } from './models/catalog';

// ---- The painting kit: the level below the game's API, which the demo's scenes are built with (docs/API.md) ----
export { MeshBuilder, noise2, PLAIN, rng, srgb, type Paint } from './kit/builder';
export {
  addCrag, addDab, addFlowers, addMound, addReeds, addStone, addTuft, C, groundOf, growTree, MapLine, smooth, treeWind,
  type CragOptions, type Ground, type Near, type Stream, type Tree, type TreeForm, type TreeKind,
} from './kit/kit';
export { dressFor, Grove, type Dress } from './kit/seasonTrees';
export {
  addCanopy, CROP_NAMES, CropPatch, growSpecies, SPECIES, speciesHeight, speciesTree, type CropName, type CropStage, type CropTile,
  type Species,
} from './kit/plants';
export { loadModel, ModelSet, ModelParts } from './kit/model';

// ---- Tools: measuring a frame ----
export { PassTimer, type FrameTimes } from './renderer/timer';
export { PASSES, PROFILE_KINDS, profileTable, runProfile, type ProfileCase, type ProfileRow } from './renderer/profile';
