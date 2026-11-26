// Living crops: each painted field grows with water, soil and light, ripens into a harvest waiting at its edge, and once
// the carts have taken the last of it, is sown again. Wheat, tomato, sunflower and flax draw the soil down; beans fix
// nitrogen and build it back up; a sack of compost lifts it at once. Each crop has its own character (docs/DESIGN.md):
//   wheat      hardy to -2°C, the standard grain;
//   beans      frost-tender, restore the soil, flower for bees, guard nearby slopes;
//   tomato     frost-tender, warmth-loving (brisk at 20°C, sulky below 12°C), flowers for bees;
//   sunflower  frost-tender, drought-hardy (grows briskly on dry uplands), flowers for bees;
//   flax       hardy to -2°C, cool-loving (brisk at 18°C or less, wilts above 26°C unless a canopy shades it), flowers for bees.
import { effectiveMoisture, erosionDrain, fieldTempC, hotMidday, isLiquidRain, pollinationCoverage } from './microclimate.ts';
import { markFloodedFields } from './flood.ts';
import { clamp, obbDistance } from './geom.ts';
import { thingObb } from './earth.ts';
import { cellX, cellZ, type Grid, type Soil, SOIL } from './grid.ts';
import type { Crop, Field, GameState } from './state.ts';

/** How fertile each soil starts, 0..1. */
export const SOIL_FERTILITY: { readonly [K in keyof typeof SOIL]: number } = { silt: 0.92, loam: 0.85, clay: 0.78, sand: 0.68, stony: 0.55 };
const FERTILITY_BY_CODE: readonly number[] = (() => {
  const out: number[] = [];
  for (const [k, code] of Object.entries(SOIL) as [keyof typeof SOIL, Soil][]) out[code] = SOIL_FERTILITY[k];
  return out;
})();

/** A freshly painted field's growth: seedlings show at once. */
export const SOWN_GROWTH = 0.15;
/** A field's growth when it's sown again after its harvest is carted away. */
export const REPLANT_GROWTH = 0.12;
/** Growth per game hour, before water, soil and light (a well-watered fertile field ripens in about 10–14 game hours). */
export const GROWTH_RATE = 0.11;
/** How a harvest moves the soil's fertility: beans build it back up, the rest draw it down. */
export const HARVEST_FERTILITY: { readonly [C in Crop]: number } = { wheat: -0.14, beans: 0.14, tomato: -0.12, sunflower: -0.12, flax: -0.1 };
/** Frost-tender crops: they pause and slip back at 0°C. The rest (wheat, flax) are hardy down to WHEAT_HARDY_C. */
export const TENDER_CROPS: readonly Crop[] = ['beans', 'tomato', 'sunflower'];
export const isTender = (c: Crop) => TENDER_CROPS.includes(c);
/** The moisture a sunflower's deep roots always find: dry uplands grow it briskly. */
export const DROUGHT_FLOOR = 0.25;
/** Tomato's warmth: brisk at TOMATO_WARM_C or more, sulky below TOMATO_COOL_C. Flax's: brisk at FLAX_COOL_C or less, wilting above FLAX_HOT_C. */
export const TOMATO_WARM_C = 20, TOMATO_COOL_C = 12, FLAX_COOL_C = 18, FLAX_HOT_C = 26;
/** How much a crop's favoured air quickens it, and its disliked air slows it. */
export const CLIMATE_BOOST = 0.15, CLIMATE_SULK = 0.2;
/** What one sack of compost adds to a field's fertility. */
export const COMPOST_BOOST = 0.28;
export const MIN_FERTILITY = 0.15;
/** How fast resting ground (no field on it) drifts back to its soil's fertility, per game day. */
export const REST_PER_DAY = 0.02;

/** A cell's natural fertility: its soil's, before any farming. */
export const naturalFertility = (g: Grid, i: number): number => FERTILITY_BY_CODE[g.soil[i]] ?? SOIL_FERTILITY.loam;

/** The soil's mean fertility over a field's cells, as farming has left it (grid.fertility). */
export function soilFertility(g: Grid, cells: readonly number[]): number {
  if (cells.length === 0) return SOIL_FERTILITY.loam;
  let sum = 0;
  for (const i of cells) sum += g.fertility[i];
  return sum / cells.length;
}

/** Whole units a ripe field yields: more with area, a little more on rich soil (2 to 8). */
export function fieldYield(f: Pick<Field, 'areaM2' | 'fertility'>, pollinated = 0): number {
  const base = clamp(Math.round((f.areaM2 / 18) * (0.5 + 0.6 * f.fertility)), 2, 8);
  return Math.round(base * (1 + 0.25 * pollinated));
}

/**
 * How well watered a field is, 0..1, from its mean wet-bank moisture: the banks' wash fades out over a few metres
 * (wet.ts), so a field hugging a brook or a flowing rill (mean moisture WATERED or more) counts as fully watered.
 */
export const WATERED = 0.45;
export const wateredness = (m: number) => clamp(m / WATERED, 0, 1);
/** Water: a well-watered field grows about three and a half times as fast as a dry one. */
export const moistureFactor = (m: number) => 0.35 + 0.9 * wateredness(m);
/** The moisture a crop feels from `m`: a sunflower's deep roots never feel drier than DROUGHT_FLOOR. */
export const cropMoisture = (crop: Crop | undefined, m: number) => (crop === 'sunflower' ? Math.max(m, DROUGHT_FLOOR) : m);

/**
 * How a crop takes the air over its field (`tempC`), as a factor on its growth: tomato loves warmth and sulks in the cool,
 * flax loves the cool and wilts in the heat unless a solar canopy shades it (`coverage`, 0..1). The others take any air.
 */
export function cropClimate(crop: Crop, tempC: number, coverage = 0): number {
  if (crop === 'tomato') return tempC >= TOMATO_WARM_C ? 1 + CLIMATE_BOOST : tempC < TOMATO_COOL_C ? 1 - CLIMATE_SULK : 1;
  if (crop === 'flax') return tempC <= FLAX_COOL_C ? 1 + CLIMATE_BOOST : tempC > FLAX_HOT_C ? 1 - CLIMATE_SULK * (1 - clamp(coverage, 0, 1)) : 1;
  return 1;
}
export const fertilityFactor = (f: number) => 0.35 + 0.75 * clamp(f, 0, 1);
/** Light: slow, gentle root growth at night, brisk in daylight. */
export const lightFactor = (sun: number) => 0.15 + 0.85 * clamp(sun, 0, 1);

/**
 * Growth per game hour. `sun` is the light reaching the ground (0..1); `coverage` how much of the field stands under solar
 * canopies (agrivoltaics: a touch less light, a touch less thirst, about even).
 */
export function growthRate(f: Pick<Field, 'avgMoisture' | 'fertility'> & { crop?: Crop }, sun: number, coverage = 0): number {
  const c = clamp(coverage, 0, 1);
  return GROWTH_RATE * moistureFactor(cropMoisture(f.crop, f.avgMoisture + 0.07 * c)) * fertilityFactor(f.fertility) * lightFactor(sun * (1 - 0.15 * c));
}

/** A coarse stage of a field's crop for redrawing: 0..20 as it grows, 21 when ripe. */
export const cropStage = (f: Pick<Field, 'growth' | 'harvestReady'>) => (f.harvestReady > 0 ? 21 : Math.floor(clamp(f.growth, 0, 1) * 20));

/** Tender crops (beans, tomato, sunflower): under frost they pause and slip back this much growth per game hour (never below a seedling). */
export const FROST_SETBACK = 0.08;
/** Hardy wheat and flax shrug off a chill down to this air, °C; colder, they pause. */
export const WHEAT_HARDY_C = -2;
/** Snow this deep buries a field: it pauses. */
export const SNOW_BURIES = 0.35;
/** A heatwave's air (°C) and how much moisture it takes off an unshaded field. */
export const HEAT_C = 30, HEAT_EVAPORATION = 0.12;

/**
 * The moisture a field's crop feels now: its banks' and its devices' (effectiveMoisture), less a heatwave's evaporation
 * where no solar canopy shades it; a sunflower's deep roots never feel drier than DROUGHT_FLOOR. `coverage`: the share of
 * it under canopies.
 */
export function fieldMoisture(s: GameState, f: Field, weather?: string, coverage = agrivoltaicCoverage(s).get(f.id) ?? 0): number {
  const m = effectiveMoisture(s, f, undefined, weather);
  if (isLiquidRain(s, weather) || s.sim.weather.tempC < HEAT_C) return cropMoisture(f.crop, m);
  return cropMoisture(f.crop, Math.max(0, m - HEAT_EVAPORATION * (1 - clamp(coverage, 0, 1))));
}

/** Whether a growing field stands frosted now: its air (frost hollows colder) at or below freezing, or buried in snow. */
const frostedNow = (s: GameState, f: Field) => f.harvestReady === 0 && (fieldTempC(s, f, s.sim.weather.tempC) <= 0 || s.sim.weather.snowDepth >= SNOW_BURIES);

/**
 * Whether frost or snow actually stalls this growing field: tender crops (beans, tomato, sunflower) stall at 0°C, hardy
 * wheat and flax grow down to WHEAT_HARDY_C (-2°C), and deep snow buries them all. Used by both `growCrops` and Steady
 * Homestead so they never disagree.
 */
export function fieldFrostStalled(s: GameState, f: Field): boolean {
  if (f.harvestReady > 0) return false;
  if (s.sim.weather.snowDepth >= SNOW_BURIES) return true;
  const air = fieldTempC(s, f, s.sim.weather.tempC);
  return isTender(f.crop) ? air <= 0 : air < WHEAT_HARDY_C;
}

/**
 * Reads every field's frost and flood afresh from the weather and the water as they stand, growing nothing: after the clock
 * jumps or the weather lock changes while the clock is stopped, so a field's card never shows the last running tick's.
 */
export function refreshFieldWeather(s: GameState): void {
  for (const f of s.fields) f.frosted = frostedNow(s, f);
  markFloodedFields(s);
}

/**
 * Grows every field by `dtH` game hours; returns the fields that ripened and whether any stage changed. The weather has
 * its say (state.sim.weather): a flooded field pauses; frost (its air at or below freezing, frost hollows colder) or deep
 * snow pauses the tender crops and nips them back a little (they regrow once thawed), while wheat and flax grow on down to
 * -2°C; a heatwave dries the unshaded fields; and each crop takes the air its own way (cropClimate).
 */
export function growCrops(s: GameState, dtH: number, sun: number, weather?: string, cloudCover = 0): { ripened: Field[]; stagesChanged: boolean } {
  const ripened: Field[] = [];
  let stagesChanged = false;
  const cover = agrivoltaicCoverage(s);
  for (const f of s.fields) {
    if (f.harvestReady > 0) { f.frosted = false; continue; }
    const before = cropStage(f);
    f.frosted = frostedNow(s, f);
    if (f.flooded) continue;
    if (fieldFrostStalled(s, f)) {
      if (isTender(f.crop) && dtH > 0) f.growth = Math.max(Math.min(f.growth, REPLANT_GROWTH), f.growth - FROST_SETBACK * dtH);
      if (cropStage(f) !== before) stagesChanged = true;
      continue;
    }
    const coverage = cover.get(f.id) ?? 0;
    const climate = cloudCover >= 0.65 ? 1 - 0.1 * coverage : hotMidday(s, weather) ? 1 + 0.12 * coverage : 1;
    const bees = pollinationCoverage(s, f);
    if (dtH > 0) f.pollinated = Math.max(f.pollinated, bees);
    const rate = growthRate({ crop: f.crop, fertility: f.fertility, avgMoisture: fieldMoisture(s, f, weather, coverage) }, sun, coverage);
    const air = cropClimate(f.crop, fieldTempC(s, f, s.sim.weather.tempC), coverage);
    f.growth = Math.min(1, f.growth + rate * climate * air * (1 + 0.05 * bees) * dtH);
    if (f.growth >= 1) { f.harvestReady = fieldYield(f, f.pollinated); ripened.push(f); }
    if (cropStage(f) !== before) stagesChanged = true;
  }
  return { ripened, stagesChanged };
}

/** Moves the soil's fertility on every cell of a field by `delta`, and the field's own (their mean) with it. */
function workSoil(s: GameState, f: Field, delta: number): void {
  const g = s.grid;
  let sum = 0, n = 0;
  for (let iz = f.bounds.z0; iz <= f.bounds.z1; iz++) for (let ix = f.bounds.x0; ix <= f.bounds.x1; ix++) {
    const i = iz * g.nx + ix;
    if (g.fieldOf[i] !== f.id) continue;
    g.fertility[i] = clamp(g.fertility[i] + delta, MIN_FERTILITY, 1);
    sum += g.fertility[i]; n++;
  }
  if (n > 0) f.fertility = sum / n;
}

/** Takes up to `n` ripe units from a field; when the last is gone, the soil changes with the harvest and it's sown again. */
export function harvestField(s: GameState, f: Field, n: number): number {
  const took = Math.max(0, Math.min(n, f.harvestReady));
  f.harvestReady -= took;
  if (took > 0 && f.harvestReady === 0) {
    workSoil(s, f, HARVEST_FERTILITY[f.crop] - erosionDrain(s, f));
    f.growth = REPLANT_GROWTH;
    f.pollinated = 0;
  }
  return took;
}

/** Works a sack of compost into a field. */
export function compostField(s: GameState, f: Field): void {
  workSoil(s, f, COMPOST_BOOST);
}

/** Lets resting ground (no field on it) drift `hours` game hours back toward its soil's own fertility. */
export function restSoil(s: GameState, hours: number): void {
  const g = s.grid, step = (REST_PER_DAY * hours) / 24;
  if (!(step > 0)) return;
  for (let i = 0; i < g.fertility.length; i++) {
    if (g.fieldOf[i] !== 0) continue;
    const v = g.fertility[i], to = naturalFertility(g, i);
    if (v !== to) g.fertility[i] = v < to ? Math.min(to, v + step) : Math.max(to, v - step);
  }
}

// Each field's share under solar canopies, worked out again only when the land or the things on it change.
const coverCache = new WeakMap<GameState, { key: string; cover: Map<number, number> }>();

/** How much of each field (0..1) stands under a solar canopy. */
export function agrivoltaicCoverage(s: GameState): Map<number, number> {
  const solar = s.things.filter((t) => t.kind === 'solar');
  const key = `${s.revision}:${solar.map((t) => `${t.id}@${t.x},${t.z},${t.yaw}`).join(';')}`;
  const hit = coverCache.get(s);
  if (hit && hit.key === key) return hit.cover;
  const cover = new Map<number, number>(), g = s.grid;
  if (solar.length > 0) {
    const boxes = solar.map((t) => thingObb(t));
    for (const f of s.fields) {
      let under = 0;
      for (let iz = f.bounds.z0; iz <= f.bounds.z1; iz++) for (let ix = f.bounds.x0; ix <= f.bounds.x1; ix++) {
        if (g.fieldOf[iz * g.nx + ix] !== f.id) continue;
        const x = cellX(g, ix), z = cellZ(g, iz);
        if (boxes.some((b) => obbDistance(b, x, z) <= 0)) under++;
      }
      if (under > 0) cover.set(f.id, under / Math.max(1, f.cellCount));
    }
  }
  coverCache.set(s, { key, cover });
  return cover;
}
