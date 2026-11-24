// The game's rules and state, as pure TypeScript: no DOM, no three.js, no renderer, so `npm test` runs them in Node.
// Everything outside src/game/ (the world bridge, the UI, the loop) reaches the rules through this file.
export { err, must, ok, type Result } from './result.ts';

// The land's grid: the continuous-terrain contract shared with brush3d.
export {
  addCell, BUILD_HALF, baseHeightAt, CELL_M, cellHeightAt, cellIndex, cellIx, cellIz, cellX, cellZ, clampRect, COVER, type Cover,
  DRY, expandRect, fullRect, gradientAt, type Grid, GRID_N, GRID_X0, GRID_Z0, heightAt, isWet, onGrid, type Rect, rectOfWorld,
  rectsOverlap, sampleHeight, slopeAt, SOIL, type Soil, unionRect, VALLEY_HALF, VERT_N, vertexIndex, vertexX, vertexZ,
} from './grid.ts';
export {
  catmullRom, clamp, lerp, type Obb, obbBounds, obbCorners, obbDistance, obbsOverlap, pathLength, type Point2, pointInObb,
  polylineDistance, resample, segmentDistance, smoothstep, toLocal, toWorld, wrapAngle,
} from './geom.ts';
export { fbm, noise2 } from './noise.ts';
export { hash3, makeRng, type Rng } from './rng.ts';

// State and its parts.
export {
  blankState, type Bridge, type Channel, type Crag, type Crop, CROPS, type Field, type FlowSample, type GameState, type Hedge,
  type PowerMode, type PowerRadius, type PowerState, type Season, SEASONS, STATE_VERSION, type Thing, type Track, type Tree,
  TREE_SPECIES, type TreeSpecies, type Valley, type Vec3, type WireSpan,
} from './state.ts';
export { CATALOG, type Category, isThingKind, type PowerRole, RACE_START, type ThingDef, type ThingKind, THING_KINDS } from './catalog.ts';
export { BANK_FREEBOARD, CLEARING, generateValley, naturalize, SIDE_RISE, VALLEY_FALL } from './valley/generate.ts';

// Edits.
export { type Action, apply } from './actions.ts';
export { type Change, emptyChange } from './change.ts';
export {
  CHANNEL_DEPTH, CHANNEL_REACH, coreObb, padTarget, recomposeEarth, RILL_HALF, thingObb, thingRect, TRACK_HALF,
} from './earth.ts';
export { canPlace, moveThing, placeThing, removeThing, rotateThing, suggestWaterWheelYaw } from './place.ts';
export { eraseField, FIELD_MAX_SLOPE, fieldAllowed, type FieldEdit, paintField } from './fields.ts';
export { canDig, digChannel, fillChannel } from './channels.ts';
export {
  CHANNEL_SPACING, channelPath, channelSummary, type ChannelPreview, FREEBOARD, FRICTION, JUNCTION, junctionPairs, type JunctionPair,
  MIN_WATER_DEPTH, previewChannelFlow,
} from './flow.ts';
export { WET_REACH, wetness } from './wet.ts';
export {
  addHedge, addTrack, canPlant, canTrack, MAX_GRADE, MIN_TRACK, PATH_SPACING, plantTree, removeHedge, removeTrack, removeTree, SAPLING_SCALE,
  trackPath,
} from './paths.ts';
export { BRIDGE_WIDTH, checkCrossings, MAX_SPAN, recomputeBridges, trackBridges } from './bridges.ts';
export { POWER_MODES, powerFor, setPowerMode } from './power/graph.ts';
