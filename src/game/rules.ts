import { BUILDINGS, FIELD, HIVE, POWER } from './data.ts';
import { TERRAIN } from './map.ts';
import { buildingAt, centre, inMap, reachTo, terrainAt, type Building, type Footprint, type GameState } from './state.ts';

// The rules about where things stand, shared by the simulation and the placement forecast: what reaches what, what shelters
// a turbine, how fast a field grows. Each takes a footprint or a tile, so it answers for a building in hand as it does for
// one placed.

/** Whether a pylon at (px, py) powers a footprint: one of its tiles is within the pylon's reach. */
export const pylonReaches = (b: Footprint, px: number, py: number) => reachTo(b, px, py) <= POWER.pylon.reach;

/** Whether pylons at two tiles link into one network. */
export const pylonsLink = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by) <= POWER.pylon.link;

/** Whether a sprinkler at (x, y) waters a field: the field's centre is within its reach. */
export function sprinklerWaters(x: number, y: number, field: Footprint) {
  const c = centre(field);
  return Math.max(Math.abs(x + 0.5 - c.x), Math.abs(y + 0.5 - c.y)) <= POWER.sprinklerReach + 0.5;
}

/** Whether a sprinkler at (x, y) is near water (and so cheaper to run). */
export function nearWaterAt(s: GameState, x: number, y: number) {
  const r = POWER.waterNear;
  for (let ty = y - r; ty <= y + r; ty++) for (let tx = x - r; tx <= x + r; tx++) {
    if (inMap(s, tx, ty) && Math.hypot(tx - x, ty - y) <= r && terrainAt(s, tx, ty) === TERRAIN.water) return true;
  }
  return false;
}

/** Whether a hive at (x, y) reaches a field (to gather from it and pollinate it). */
export const hiveReaches = (field: Footprint, x: number, y: number) => reachTo(field, x, y) <= HIVE.reach;

/** The share of the wind a turbine at (x, y) gets, after the trees and tall buildings in reach (each counted once). */
export function exposureAt(s: GameState, x: number, y: number) {
  const r = POWER.shelterReach, tall = new Set<Building>();
  let n = 0;
  for (let ty = y - r; ty <= y + r; ty++) for (let tx = x - r; tx <= x + r; tx++) {
    if ((tx === x && ty === y) || !inMap(s, tx, ty)) continue;
    const o = buildingAt(s, tx, ty);
    if (terrainAt(s, tx, ty) === TERRAIN.tree) n++;
    else if (o && BUILDINGS[o.type].tall) tall.add(o);
  }
  return Math.max(POWER.shelterFloor, 1 - POWER.shelter * (n + tall.size));
}

/** A field's growth multiplier from water, given the most water any of its sprinklers gives (0–1). */
export const waterPace = (wet: number) => FIELD.dry + (1 - FIELD.dry) * wet;

/**
 * A field's growth pace as a multiple of its crop's normal pace, from the most water any of its sprinklers gives (0–1) and
 * its average fertility (0–100), with the parts it's made of.
 */
export function paceOf(wet: number, fertility: number) {
  const byWater = waterPace(wet);
  const bySoil = FIELD.poorSoil + (FIELD.richSoil - FIELD.poorSoil) * fertility / 100;
  return { pace: byWater * bySoil, byWater, bySoil };
}
