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
  blankSim, blankState, defaultWeatherSeed, isTerrainStyle, TERRAIN_STYLES, type TerrainStyle, type WeatherOptions, type Bridge, type Channel, type Crag, type Crop, CROPS, type Field, type FlowSample, type GameState, type Hedge,
  type PowerRadius, type PowerState, type Season, SEASONS, type SimState, STATE_VERSION, type Thing, type Track, type Tree,
  TREE_SPECIES, type TreeSpecies, type Valley,
} from './state.ts';
export {
  CATALOG, type Category, isThingKind, isWorkshop, type PowerRole, RACE_START, type ThingDef, type ThingKind, THING_KINDS,
  WORKSHOP_KINDS, type WorkshopKind,
} from './catalog.ts';
export {
  BANK_FREEBOARD, CLEARING, generateValley, LANDFORMS, naturalize, SIDE_RISE, TERRACE_DIP, TERRACE_WIDTH, VALLEY_FALL, type ValleyGenOptions,
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
export {
  BEE_MIN_C, FLOWERING_CROPS, FLOWERING_GROWTH, floweringArea, flowerDrift, SOIL_DRAINING, effectiveMoisture, erosionDrain, fieldTempC, forageRate, greenhouseWarm, HOLLOW_COLD_C, HOLLOW_REACH,
  hollowDepth, hollowDepths, HOT_C, hotMidday, inversion, isLiquidRain, isRaining, isSnowing, LIQUID_RAIN, localTempC, serviceSite, hasServiceRadius, SERVICE_RADIUS, SLOPE_WARM_C,
  treeShade, warmGreenhouseNear, windShelter,
} from './microclimate.ts';
export { liveEnv, stepSim, MAX_SUBSTEP_SECONDS, type SimTickResult } from './sim.ts';
export {
  absHour, CLIMATE_DESCRIPTIONS, type ClimateCharacter, CLIMATES, climateFor, climatesOf, type DayForecast, describeClimate, describeWeather,
  FLOOD_MAX, FORECAST_ICONS, type ForecastIcon, forecastDay, forecastDays, hasWeatherStation, initialWeather, stationForecast, isClimate, isWeatherSpell, rollWeatherSeed, skyAt,
  type SkyNow, SPELL_BLEND_HOURS, type SpellSpan, spellTimeline, stepWeather, surgeOf, toSpell, WEATHER_LABELS, WEATHER_SPELLS, type WeatherKey,
  weatherKeyOf, type WeatherSpell, type WeatherState,
} from './weather.ts';
export {
  appliedSurge, FIELD_FLOODED, FLOOD_DEEP, FLOOD_FALL, FLOOD_MIN, FLOOD_STEP, floodMoved, markFloodedFields, overlayFlood, type Swale, SWALE_FAR,
  SWALE_MIN_DROP, SWALE_MIN_LENGTH, SWALE_NEAR, SWALE_RELIEF, swaleOf, swaleRelief, swalesOf,
} from './flood.ts';
export { refreshFlood } from './settle.ts';
export { type SimEvent, type SimEventType } from './events.ts';
export { formatClock, isNight, SECONDS_PER_GAME_HOUR, seasonHours, sunFactor, sunHours } from './clock.ts';
export {
  canAfford, CART_COST, costOf, DROP_AMOUNT, type DropId, MAX_CARTS, type MilestoneDrop, receiveDrop, refund, SANDBOX_SUPPLIES, sandboxSupplies, spend,
  STARTER_SUPPLIES, starterSupplies, SUPPLY_CAP, type SuppliesState,
} from './supplies.ts';
export {
  addGood, capacity, countOf, describeInventory, type Good, type GoodCategory, type GoodInfo, GOOD_LABELS, GOODS, type Inventory,
  isGood, takeGood, totalStored,
} from './goods.ts';
export {
  agrivoltaicCoverage, CLIMATE_BOOST, CLIMATE_SULK, COMPOST_BOOST, compostField, cropClimate, cropMoisture, cropStage, DROUGHT_FLOOR,
  FLAX_COOL_C, FLAX_HOT_C, isTender, TENDER_CROPS, TOMATO_COOL_C, TOMATO_WARM_C, fertilityFactor, fieldFrostStalled, fieldMoisture, fieldYield, FROST_SETBACK, growCrops, HEAT_C,
  HEAT_EVAPORATION, SNOW_BURIES, WHEAT_HARDY_C, growthRate, GROWTH_RATE,
  HARVEST_FERTILITY, harvestField, lightFactor, MIN_FERTILITY, moistureFactor, naturalFertility, refreshFieldWeather, REPLANT_GROWTH, REST_PER_DAY,
  restSoil, SOIL_FERTILITY, soilFertility, SOWN_GROWTH, WATERED, wateredness,
} from './crops.ts';
export {
  advanceRecipes, BYPRODUCTS, type ByproductMaker, type ByproductTarget, describeRuntime, DIGESTER_BURN_HOURS, DIGESTER_FEED, DIGESTER_FUELS,
  DIGESTER_W, effectivePriority, inputsOf, isByproductMaker, GREENHOUSE_COLD_C, GREENHOUSE_COLD_W, GREENHOUSE_HOURS, GREENHOUSE_MILD_W, GREENHOUSE_YIELD, growGreenhouses, INPUT_CAP, OUTPUT_CAP, type Recipe, type RecipeInput, RECIPES, runtimeOf, SILO_CAP,
  SILO_GOOD_CAP, siloRoom, startRecipes, syncGreenhouses, syncRuntime, type ThingRuntime, wantsInput,
} from './workshops.ts';
export {
  BATTERY_RATE_W, BATTERY_WH, CLOUD_DIM, demandOf, DIGESTER_CHARGE_BELOW, FARMHOUSE_DAY_W, FARMHOUSE_NIGHT_W, GARAGE_CHARGE_W,
  GARAGE_IDLE_W, generationOf, type PowerNetwork, type PowerSummary, refreshPower, type SimEnv, SOLAR_PEAK_W, stepPower, TURBINE_BASE_W,
  TURBINE_FULL_WIND, TURBINE_SPAN_W, WATERWHEEL_W,
} from './power/sim.ts';
export {
  CART_SPEED, dockOf, findPath, GROUND, groundAt, MUDDY, type Nav, NAV_CELL, NAV_N, navCellOf, navCenter, navFor, passable, reachOf,
  STEEP,
} from './nav.ts';
export {
  addStarterCart, atGarage, buyCart, type Cart, CART_CAPACITY, CART_LOW, CART_READY, type CartJob, type CartState, CHARGE_PER_HOUR,
  diagnoseIdleCarts, chargingAtGarage, COLD_C, GALE_WIND, weatherDrag, DOCK_RADIUS, DRAIN_PER_M, DWELL_HOURS, type Endpoint, endpointLabel, fieldEdge, pathLeft, retireAllCarts, retireCart, stepCarts,
  TRICKLE_PER_HOUR,
} from './carts.ts';
export {
  blankBrief, type BriefState, CLOCK_JUMPED, DRY_FIELDS, DRY_GRACE_HOURS, FLOODED_FIELDS, fieldsParched, FROSTED_FIELDS, GREENHOUSE_FULL, homesteadRuns, LIVING_LAND_FERTILITY, LIVING_LAND_M2, type LivingLandSeal,
  PANTRY_ORDER, PANTRY_ORDERS, type PantryOrderSeal, PARCHED,
  resetSteadyOnClockJump, resetSteadyOnSetupChange, type Seal, type SealId, SEAL_LABELS, SETUP_CHANGED, STEADY_HOURS, stallReason, type SteadyHomesteadSeal, stepBrief,
} from './brief.ts';

// Milestone 5B: the campaign's curated valleys, procedural valleys and Sandbox, and saves.
export { CAMPAIGN_VALLEYS, campaignById, type CampaignValley, startCampaignValley } from './campaign.ts';
export {
  balancedCap, buildingsForOrder, DIFFICULTIES, DIFFICULTY_ALLOWANCE, type Difficulty, generateProceduralValley, isDifficulty,
  MIN_PROCEDURAL_CAP, minimumSuppliesForOrder, proceduralTitle, type ProceduralOptions, rollPantryOrder, STARTER_SHARE,
} from './procedural.ts';
export { deserializeSave, MAX_PATH_LENGTH, MAX_PATH_POINTS, MAX_SAVE_BYTES, MAX_SAVE_DAY, MAX_SAVED_ITEMS, OLD_SAVE, serializeSave } from './save.ts';
