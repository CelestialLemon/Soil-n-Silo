// What the game's rules share with the picture, so the two can't disagree (docs/API.md): the wind simulation (the wind the
// turbines feel is the wind in the grass: the rules step its gusts, WindRecipe, and the picture the air under them), the
// cloud recipe (a cloud's shadow on a solar panel) and how big a tile is in their metres. Plain code, with no
// drawing and no bundler in it, so the rules' tests and bots import this file straight into Node; src/index.ts exports
// it all too. Keep it so: its imports carry their `.ts` and reach nothing that needs three.js or Vite
// (`npm run typecheck` loads it in Node to check).

export {
  DRAG, MAX_SPEED as MAX_WIND, SOLID_DRAG, TICK as WIND_TICK, WindRecipe, WindSim, windAt, windBetween,
  type Gusts, type Obstacle, type Shape, type WindGoal, type WindGrid, type WindOptions, type WindSave, type WindSnapshot, type WindState,
} from './wind/sim.ts';
export { CLOUD_SHAPE, cloudDriftSpeed, cloudShade, type CloudField, type CloudLayer, type CloudShape } from './renderer/clouds.ts';
// The land's smooth reading of the rules' levels (land/surface.ts, Soil-n-Silo#202): the land brush3d paints has its shape,
// and the game stands its things on the same fit (its src/world/ground.ts), so they sit on the hills as painted.
export { SLACK, Surface, type Ground as SurfaceGround, type Relief } from './land/surface.ts';
export { checkLand, LAND_COVER, LAND_GROUND, type Beyond, type LandCover, type LandGround, type LandMap, type LandPatch, type LandRect } from './land/map.ts';
export { TILE } from './models/tile.ts';
// How far a crag reaches past its size, and its triangles (kit/crag.ts), which the game plans its outcrops by (Soil-n-Silo#257).
export { CRAG_BOUND, CRAG_TRIANGLES } from './kit/crag.ts';
// How far a grass tuft's blades reach (kit/tuft.ts), which the game keeps its grass's margins by (Soil-n-Silo#256).
export { TUFT_HEIGHT, TUFT_REACH } from './kit/tuft.ts';
// And how far a wildflower's bloom reaches (kit/flower.ts), for the game's margins and its pick (Soil-n-Silo#266).
export { FLOWER_REACH } from './kit/flower.ts';
// And how far a clump of reeds reaches (kit/reed.ts), for the game's margins and its pick (Soil-n-Silo#267).
export { REED_HEIGHT, REED_REACH, REED_WIDTH } from './kit/reed.ts';
