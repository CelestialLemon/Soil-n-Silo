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
  blankSim, blankState, type Bridge, type Channel, type Crag, type Crop, CROPS, type Field, type FlowSample, type GameState, type Hedge,
  type PowerRadius, type PowerState, type Season, SEASONS, type SimState, STATE_VERSION, type Thing, type Track, type Tree,
  TREE_SPECIES, type TreeSpecies, type Valley,
} from './state.ts';
export {
  CATALOG, type Category, isThingKind, isWorkshop, type PowerRole, RACE_START, type ThingDef, type ThingKind, THING_KINDS,
  WORKSHOP_KINDS, type WorkshopKind,
} from './catalog.ts';
export {
  BANK_FREEBOARD, CLEARING, generateValley, naturalize, SIDE_RISE, TERRACE_DIP, TERRACE_WIDTH, VALLEY_FALL,
} from './valley/generate.ts';

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
export { type PowerCandidate, powerFor, previewPower } from './power/graph.ts';
export { type Networks, networksOf } from './power/radius.ts';

// The living homestead (Milestone 2): time, Supplies, goods, crops, workshops, power, carts and the brief.
export { stepSim, MAX_SUBSTEP_SECONDS, type SimTickResult } from './sim.ts';
export { type SimEvent, type SimEventType } from './events.ts';
export { formatClock, isNight, SECONDS_PER_GAME_HOUR, seasonHours, sunFactor, sunHours } from './clock.ts';
export {
  canAfford, CART_COST, costOf, DROP_AMOUNT, type DropId, MAX_CARTS, type MilestoneDrop, receiveDrop, refund, sandboxSupplies, spend,
  STARTER_SUPPLIES, starterSupplies, SUPPLY_CAP, type SuppliesState,
} from './supplies.ts';
export {
  addGood, capacity, countOf, describeInventory, type Good, type GoodCategory, type GoodInfo, GOOD_LABELS, GOODS, type Inventory,
  isGood, takeGood, totalStored,
} from './goods.ts';
export {
  agrivoltaicCoverage, COMPOST_BOOST, compostField, cropStage, fertilityFactor, fieldYield, growCrops, growthRate, GROWTH_RATE,
  HARVEST_FERTILITY, harvestField, lightFactor, MIN_FERTILITY, moistureFactor, naturalFertility, REPLANT_GROWTH, REST_PER_DAY,
  restSoil, SOIL_FERTILITY, soilFertility, SOWN_GROWTH, WATERED, wateredness,
} from './crops.ts';
export {
  advanceRecipes, describeRuntime, INPUT_CAP, OUTPUT_CAP, type Recipe, type RecipeInput, RECIPES, runtimeOf, SILO_CAP,
  SILO_GOOD_CAP, siloRoom, startRecipes, syncRuntime, type ThingRuntime, wantsInput,
} from './workshops.ts';
export {
  BATTERY_RATE_W, BATTERY_WH, CLOUD_DIM, demandOf, FARMHOUSE_DAY_W, FARMHOUSE_NIGHT_W, GARAGE_CHARGE_W,
  GARAGE_IDLE_W, generationOf, type PowerNetwork, type PowerSummary, refreshPower, type SimEnv, SOLAR_PEAK_W, stepPower, TURBINE_BASE_W,
  TURBINE_FULL_WIND, TURBINE_SPAN_W, WATERWHEEL_W,
} from './power/sim.ts';
export {
  CART_SPEED, dockOf, findPath, GROUND, groundAt, MUDDY, type Nav, NAV_CELL, NAV_N, navCellOf, navCenter, navFor, passable, reachOf,
  STEEP,
} from './nav.ts';
export {
  addStarterCart, atGarage, buyCart, type Cart, CART_CAPACITY, CART_LOW, CART_READY, type CartJob, type CartState, CHARGE_PER_HOUR,
  diagnoseIdleCarts, chargingAtGarage, DOCK_RADIUS, DRAIN_PER_M, DWELL_HOURS, type Endpoint, endpointLabel, fieldEdge, pathLeft, retireAllCarts, retireCart, stepCarts,
  TRICKLE_PER_HOUR,
} from './carts.ts';
export {
  blankBrief, type BriefState, CLOCK_JUMPED, LIVING_LAND_FERTILITY, LIVING_LAND_M2, type LivingLandSeal, PANTRY_ORDER, type PantryOrderSeal,
  resetSteadyOnClockJump, resetSteadyOnSetupChange, type Seal, type SealId, SEAL_LABELS, SETUP_CHANGED, STEADY_HOURS, type SteadyHomesteadSeal, stepBrief,
} from './brief.ts';
