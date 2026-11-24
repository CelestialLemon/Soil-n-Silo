// Living crops: each painted field grows with water, soil and light, ripens into a harvest waiting at its edge, and once
// the carts have taken the last of it, is sown again. Wheat draws the soil down; beans fix nitrogen and build it back
// up; a sack of compost lifts it at once.
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
/** How a harvest moves the soil's fertility: wheat draws it down, beans build it back up. */
export const HARVEST_FERTILITY: { readonly [C in Crop]: number } = { wheat: -0.14, beans: 0.14 };
/** What one sack of compost adds to a field's fertility. */
export const COMPOST_BOOST = 0.28;
export const MIN_FERTILITY = 0.15;

/** The soil's mean fertility over a field's cells. */
export function soilFertility(g: Grid, cells: readonly number[]): number {
  if (cells.length === 0) return SOIL_FERTILITY.loam;
  let sum = 0;
  for (const i of cells) sum += FERTILITY_BY_CODE[g.soil[i]] ?? SOIL_FERTILITY.loam;
  return sum / cells.length;
}

/** Whole units a ripe field yields: more with area, a little more on rich soil (2 to 8). */
export function fieldYield(f: Pick<Field, 'areaM2' | 'fertility'>): number {
  return clamp(Math.round((f.areaM2 / 18) * (0.5 + 0.6 * f.fertility)), 2, 8);
}

/**
 * How well watered a field is, 0..1, from its mean wet-bank moisture: the banks' wash fades out over a few metres
 * (wet.ts), so a field hugging a brook or a flowing rill (mean moisture WATERED or more) counts as fully watered.
 */
export const WATERED = 0.45;
export const wateredness = (m: number) => clamp(m / WATERED, 0, 1);
/** Water: a well-watered field grows about three and a half times as fast as a dry one. */
export const moistureFactor = (m: number) => 0.35 + 0.9 * wateredness(m);
export const fertilityFactor = (f: number) => 0.35 + 0.75 * clamp(f, 0, 1);
/** Light: slow, gentle root growth at night, brisk in daylight. */
export const lightFactor = (sun: number) => 0.15 + 0.85 * clamp(sun, 0, 1);

/**
 * Growth per game hour. `sun` is the light reaching the ground (0..1); `coverage` how much of the field stands under solar
 * canopies (agrivoltaics: a touch less light, a touch less thirst, about even).
 */
export function growthRate(f: Pick<Field, 'avgMoisture' | 'fertility'>, sun: number, coverage = 0): number {
  const c = clamp(coverage, 0, 1);
  return GROWTH_RATE * moistureFactor(f.avgMoisture + 0.07 * c) * fertilityFactor(f.fertility) * lightFactor(sun * (1 - 0.15 * c));
}

/** A coarse stage of a field's crop for redrawing: 0..20 as it grows, 21 when ripe. */
export const cropStage = (f: Pick<Field, 'growth' | 'harvestReady'>) => (f.harvestReady > 0 ? 21 : Math.floor(clamp(f.growth, 0, 1) * 20));

/** Grows every field by `dtH` game hours; returns the fields that ripened and whether any stage changed. */
export function growCrops(s: GameState, dtH: number, sun: number): { ripened: Field[]; stagesChanged: boolean } {
  const ripened: Field[] = [];
  let stagesChanged = false;
  const cover = agrivoltaicCoverage(s);
  for (const f of s.fields) {
    if (f.harvestReady > 0) continue;
    const before = cropStage(f);
    f.growth = Math.min(1, f.growth + growthRate(f, sun, cover.get(f.id) ?? 0) * dtH);
    if (f.growth >= 1) { f.harvestReady = fieldYield(f); ripened.push(f); }
    if (cropStage(f) !== before) stagesChanged = true;
  }
  return { ripened, stagesChanged };
}

/** Takes up to `n` ripe units from a field; when the last is gone, the soil changes with the harvest and it's sown again. */
export function harvestField(f: Field, n: number): number {
  const took = Math.max(0, Math.min(n, f.harvestReady));
  f.harvestReady -= took;
  if (took > 0 && f.harvestReady === 0) {
    f.fertility = clamp(f.fertility + HARVEST_FERTILITY[f.crop], MIN_FERTILITY, 1);
    f.growth = REPLANT_GROWTH;
  }
  return took;
}

/** Works a sack of compost into a field. */
export function compostField(f: Field): void {
  f.fertility = clamp(f.fertility + COMPOST_BOOST, MIN_FERTILITY, 1);
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
