import { CROPS, FIELD, TREE_HEALTH } from '../data.ts';
import { fertilityCap, groundPace, stonyLoss } from '../ground.ts';
import { groundUnder } from '../rules.ts';
import { countTrees, growsCrops, tileIndex, type Building, type FieldBuilding, type GameState } from '../state.ts';

// Soil: how fertile a field is, what its ground does to the crop, and how fast it grows.

export function fieldFertility(s: GameState, f: Building) {
  let sum = 0;
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) sum += s.map.fertility[tileIndex(s, x, y)];
  return sum / 9;
}

/** The highest fertility a field's tiles can reach together: stony ground is thin (ground.ts), so a field on it tops out lower. */
export function fieldCeiling(s: GameState, f: Building) {
  let sum = 0;
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) sum += fertilityCap(s.map.ground[tileIndex(s, x, y)]);
  return sum / 9;
}

export function changeSoil(s: GameState, f: Building, by: number) {
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
    const i = tileIndex(s, x, y);
    s.map.fertility[i] = Math.max(0, Math.min(fertilityCap(s.map.ground[i]), s.map.fertility[i] + by));
  }
}

/** The kinds of ground under a field or greenhouse, tile by tile (see groundUnder). */
export const fieldGround = (s: GameState, f: Building) => groundUnder(s, f.x, f.y, 3);

/** A field's growth multiplier from its ground, for the crop it grows. */
export const fieldGroundPace = (s: GameState, f: FieldBuilding) => groundPace(CROPS[f.crop], fieldGround(s, f));

/** What a harvest of a field yields before bees: its crop's yield, less where most of the field is stony (never below 1). */
export const harvestOf = (s: GameState, f: FieldBuilding) => Math.max(1, CROPS[f.crop].yield - stonyLoss(fieldGround(s, f)));

/** Whether a field's soil is poor enough, and still has room under its ground's cap, to take compost (so a stony field that is as high as it can be takes none). */
export const soilTakesCompost = (s: GameState, f: Building) => { const now = fieldFertility(s, f); return now < FIELD.compostBelow && now < fieldCeiling(s, f) - 1; };

/** Soil health: the average fertility of every field tile (50 with no fields), nudged by trees planted or cleared. */
export function soilHealth(s: GameState) {
  const fields = s.buildings.filter(growsCrops);
  const base = fields.length ? fields.reduce((n, f) => n + fieldFertility(s, f), 0) / fields.length : 50;
  const trees = Math.max(-TREE_HEALTH.cap, Math.min(TREE_HEALTH.cap, (countTrees(s) - s.initialTrees) * TREE_HEALTH.perTree));
  return Math.max(0, Math.min(100, base + trees));
}
