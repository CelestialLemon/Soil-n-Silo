import { BUILDINGS, FIELD, HIVE, POWER, type BuildingId } from './data.ts';
import { TERRAIN } from './map.ts';
import { centreLevel, FLAT, SIDES, sideOf } from './relief.ts';
import { buildingAt, centre, inMap, reachTo, terrainAt, tileIndex, type Building, type Dir, type Footprint, type GameState } from './state.ts';

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

/** What ground a building needs: any tile (one tile big), no cliff inside it (a field), or flat at one level (the rest). */
export type Ground = 'any' | 'unbroken' | 'flat';
export const groundOf = (type: BuildingId): Ground => (type === 'field' ? 'unbroken' : BUILDINGS[type].size === 1 ? 'any' : 'flat');

/**
 * The tiles just outside a square footprint, each with the footprint's tile it shares an edge with and the side it lies on
 * (north side west to east, then east, south, west).
 */
export function rim(x: number, y: number, n: number): { x: number; y: number; ix: number; iy: number; side: Dir }[] {
  const out: { x: number; y: number; ix: number; iy: number; side: Dir }[] = [];
  for (let k = 0; k < n; k++) out.push({ x: x + k, y: y - 1, ix: x + k, iy: y, side: 0 });
  for (let k = 0; k < n; k++) out.push({ x: x + n, y: y + k, ix: x + n - 1, iy: y + k, side: 1 });
  for (let k = 0; k < n; k++) out.push({ x: x + k, y: y + n, ix: x + k, iy: y + n - 1, side: 2 });
  for (let k = 0; k < n; k++) out.push({ x: x - 1, y: y + k, ix: x, iy: y + k, side: 3 });
  return out;
}

/** Whether water lies across one side of a tile at the height of the ground along that side (not below a bank). */
function waterAtSide(s: GameState, ix: number, iy: number, side: number) {
  const [dx, dy] = SIDES[side], wx = ix + dx, wy = iy + dy;
  if (!inMap(s, wx, wy) || terrainAt(s, wx, wy) !== TERRAIN.water) return false;
  const l = s.map.level[tileIndex(s, wx, wy)], [a, b] = sideOf(s.map, ix, iy, side);
  return a === l && b === l;
}

/**
 * Whether a field's 3x3 footprint at (x, y) shares an edge with water at the ground's own level (diagonal contact doesn't
 * count, nor water below a bank).
 */
export function touchesWater(s: GameState, x: number, y: number) {
  return rim(x, y, 3).some((t) => waterAtSide(s, t.ix, t.iy, t.side));
}

/** The level of the highest water near a sprinkler at (x, y), or null when there is none in reach. */
export function waterLevelNear(s: GameState, x: number, y: number): number | null {
  const r = POWER.waterNear;
  let best: number | null = null;
  for (let ty = y - r; ty <= y + r; ty++) for (let tx = x - r; tx <= x + r; tx++) {
    if (inMap(s, tx, ty) && Math.hypot(tx - x, ty - y) <= r && terrainAt(s, tx, ty) === TERRAIN.water) {
      const l = s.map.level[tileIndex(s, tx, ty)];
      if (best === null || l > best) best = l;
    }
  }
  return best;
}

/**
 * Watts a sprinkler at (x, y) needs: little near water, more far from it, and more for each level it lifts the water (above
 * the highest water near it, or from the valley floor).
 */
export function sprinklerWatts(s: GameState, x: number, y: number) {
  const here = s.map.level[tileIndex(s, x, y)], water = waterLevelNear(s, x, y);
  return water === null ? POWER.sprinklerFar + POWER.sprinklerLift * here : POWER.sprinklerNearWater + POWER.sprinklerLift * Math.max(0, here - water);
}

/** Whether a hive at (x, y) reaches a field (to gather from it and pollinate it). */
export const hiveReaches = (field: Footprint, x: number, y: number) => reachTo(field, x, y) <= HIVE.reach;

/** How a turbine at (x, y) stands in the wind: the share the trees, tall buildings and higher ground in reach leave it, and how much more it gets up high. */
export function windExposure(s: GameState, x: number, y: number) {
  const r = POWER.shelterReach, tall = new Set<Building>(), here = s.map.level[tileIndex(s, x, y)];
  let n = 0, hill = 0;
  for (let ty = y - r; ty <= y + r; ty++) for (let tx = x - r; tx <= x + r; tx++) {
    if ((tx === x && ty === y) || !inMap(s, tx, ty)) continue;
    const o = buildingAt(s, tx, ty), i = tileIndex(s, tx, ty);
    if (terrainAt(s, tx, ty) === TERRAIN.tree) n++;
    else if (o && BUILDINGS[o.type].tall) tall.add(o);
    hill = Math.max(hill, s.map.level[i] + (s.map.ramp[i] === FLAT ? 0 : 1) - here);
  }
  const shelter = Math.max(POWER.shelterFloor, 1 - POWER.shelter * (n + tall.size + Math.max(0, hill - (s.map.ramp[tileIndex(s, x, y)] === FLAT ? 0 : 1))));
  const height = 1 + POWER.windPerLevel * centreLevel(s.map, x, y);
  return { shelter, height, exposure: shelter * height };
}

/** The share of the wind a turbine at (x, y) gets (above 1 up high): its shelter times its height. */
export const exposureAt = (s: GameState, x: number, y: number) => windExposure(s, x, y).exposure;

/**
 * Where a water wheel with its north-west tile at (x, y) would stand: facing the river it shares an edge with at its own level
 * (the side with the most river), the current there (m/s) and whether a fall is beside it, and the watts it makes; null where
 * there is no river at the bank's level.
 */
export function wheelSite(s: GameState, x: number, y: number): { rot: Dir; current: number; fall: boolean; watts: number } | null {
  const sides = [0, 0, 0, 0];
  let current = 0, fall = false;
  for (const t of rim(x, y, 2)) {
    if (!inMap(s, t.ix, t.iy) || !waterAtSide(s, t.ix, t.iy, t.side)) continue;
    const i = tileIndex(s, t.x, t.y), c = s.map.current[i];
    if (c <= 0) continue;
    sides[t.side]++;
    current = Math.max(current, c);
    for (const [dx, dy] of SIDES) {
      const nx = t.x + dx, ny = t.y + dy;
      if (inMap(s, nx, ny) && terrainAt(s, nx, ny) === TERRAIN.water && s.map.level[tileIndex(s, nx, ny)] !== s.map.level[i]) fall = true;
    }
  }
  if (!current) return null;
  const rot = sides.indexOf(Math.max(...sides)) as Dir;
  return { rot, current, fall, watts: POWER.wheel * current * (fall ? POWER.wheelFall : 1) };
}

/**
 * Whether goods can be handed from building `a` to building `b` next door: somewhere along the edge they share, the ground
 * joins, or a's side of it stands above b's. Down a cliff is fine (they drop), up one is not.
 */
export function handsDown(s: GameState, a: Footprint, b: Footprint) {
  const n = BUILDINGS[a.type].size;
  return rim(a.x, a.y, n).some((t) => {
    if (!inMap(s, t.x, t.y) || !covers(b, t.x, t.y)) return false;
    const mine = sideOf(s.map, t.ix, t.iy, t.side), theirs = sideOf(s.map, t.x, t.y, (t.side + 2) % 4);
    return mine[0] >= theirs[0] && mine[1] >= theirs[1];
  });
}

/** Whether a footprint covers a tile. */
const covers = (b: Footprint, x: number, y: number) => { const n = BUILDINGS[b.type].size; return x >= b.x && y >= b.y && x < b.x + n && y < b.y + n; };

/** Whether a field at (x, y) is guarded against erosion: a tree or sapling within a tile of it, or a bean field sharing an edge. */
export function guardedAt(s: GameState, x: number, y: number) {
  for (let ty = y - 1; ty <= y + 3; ty++) for (let tx = x - 1; tx <= x + 3; tx++) {
    if (!inMap(s, tx, ty) || (tx >= x && ty >= y && tx < x + 3 && ty < y + 3)) continue;
    if (terrainAt(s, tx, ty) === TERRAIN.tree || buildingAt(s, tx, ty)?.type === 'sapling') return true;
  }
  return rim(x, y, 3).some((t) => { const o = inMap(s, t.x, t.y) ? buildingAt(s, t.x, t.y) : null; return o?.type === 'field' && o.crop === 'beans'; });
}

/** How many times a crop's soil loss a field's tile at (x, y) takes per harvest: more on a ramp, less so when guarded. */
export function erosionAt(s: GameState, x: number, y: number, guarded: boolean) {
  return s.map.ramp[tileIndex(s, x, y)] === FLAT ? 1 : 1 + (guarded ? FIELD.erosionGuarded : FIELD.erosion);
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
