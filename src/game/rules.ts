import { pushesAt } from './events.ts';
import { ANIMALS, BUILDINGS, FIELD, HIVE, POWER, type BuildingId, type CropDef } from './data.ts';
import { GROUND_IDS } from './ground.ts';
import { dryPace, henPace, warmthOf, warmthPace } from './warmth.ts';
import { mapIce } from './ice.ts';
import { TERRAIN } from './map.ts';
import { baseLevel, centreLevel, corners, joins, MAX_LEVEL, SIDES, sideOf, spanOf, STEEP } from './relief.ts';
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
  const l = baseLevel(s.map, wx, wy), [a, b] = sideOf(s.map, ix, iy, side);
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
      const l = baseLevel(s.map, tx, ty);
      if (best === null || l > best) best = l;
    }
  }
  return best;
}

/**
 * Watts a sprinkler at (x, y) needs: little near water, more far from it, and more for each level it lifts the water (from
 * the highest water near it, or from the valley floor, to the ground under it).
 */
export function sprinklerWatts(s: GameState, x: number, y: number) {
  const here = centreLevel(s.map, x, y), water = waterLevelNear(s, x, y);
  return water === null ? POWER.sprinklerFar + POWER.sprinklerLift * here : POWER.sprinklerNearWater + POWER.sprinklerLift * Math.max(0, here - water);
}

/** The most a sprinkler can want: far from water, up at the highest level. */
export const SPRINKLER_MOST = POWER.sprinklerFar + POWER.sprinklerLift * MAX_LEVEL;
/** The most a turbine can make: unsheltered at the highest level, in full wind. */
export const TURBINE_MOST = POWER.turbine * (1 + POWER.windPerLevel * MAX_LEVEL);

/** Whether a hive at (x, y) reaches a field (to gather from it and pollinate it). */
export const hiveReaches = (field: Footprint, x: number, y: number) => reachTo(field, x, y) <= HIVE.reach;

/** How a turbine at (x, y) stands in the wind: the share the trees, tall buildings and higher ground in reach leave it, and how much more it gets up high. */
export function windExposure(s: GameState, x: number, y: number) {
  const r = POWER.shelterReach, tall = new Set<Building>(), here = top(s, x, y);
  let n = 0, hill = 0;
  for (let ty = y - r; ty <= y + r; ty++) for (let tx = x - r; tx <= x + r; tx++) {
    if ((tx === x && ty === y) || !inMap(s, tx, ty)) continue;
    const o = buildingAt(s, tx, ty);
    if (terrainAt(s, tx, ty) === TERRAIN.tree) n++;
    else if (o && BUILDINGS[o.type].tall) tall.add(o);
    hill = Math.max(hill, top(s, tx, ty) - here);
  }
  const shelter = Math.max(POWER.shelterFloor, 1 - POWER.shelter * (n + tall.size) - POWER.shelterHill * hill);
  const height = 1 + POWER.windPerLevel * centreLevel(s.map, x, y);
  return { shelter, height, exposure: shelter * height };
}

/** The trees within ANIMALS.shadeReach tiles of a coop at (x, y) (counting up to the most that shades it). */
export function coopTrees(s: GameState, x: number, y: number): number {
  const r = ANIMALS.shadeReach, n = BUILDINGS.coop.size, most = Math.ceil(ANIMALS.shadeMost / ANIMALS.shadePerTree);
  let trees = 0;
  for (let ty = y - r; ty < y + n + r; ty++) for (let tx = x - r; tx < x + n + r; tx++) {
    if (inMap(s, tx, ty) && terrainAt(s, tx, ty) === TERRAIN.tree) trees++;
  }
  return Math.min(trees, most);
}

/** The heat, in °C, the trees by a coop at (x, y) take off what the hens feel. */
export const coopShade = (s: GameState, x: number, y: number) => coopTrees(s, x, y) * ANIMALS.shadePerTree;

/** How fast the hens of a coop (or one about to stand) at (x, y) lay in a warmth (default now), with its trees' shade and what a weather event does to them (a storm or a cold snap slows them). */
export const coopPace = (s: GameState, x: number, y: number, w = warmthOf(s)) => henPace(s.scenario, w, coopShade(s, x, y)) * pushesAt(s.scenario, s.time).hens;

/** The highest corner of a tile (levels). */
const top = (s: GameState, x: number, y: number) => Math.max(...corners(s.map, x, y));

/** The share of the wind a turbine at (x, y) gets (above 1 up high): its shelter times its height. */
export const exposureAt = (s: GameState, x: number, y: number) => windExposure(s, x, y).exposure;

/** The season's river in words, from its flow: "a high, fast river". */
export const riverSeason = (flow: number) => (flow >= 1.2 ? 'a high, fast river' : flow <= 0.7 ? 'a low, slow river' : 'a moderate river');

/**
 * Where a water wheel with its north-west tile at (x, y) would stand: facing the river it shares an edge with at its own level
 * (the side with the most river), the current there (m/s, the map's river times the season's flow) and whether a fall is beside it, and the watts it makes; null where
 * there is no river at the bank's level. `runs`: whether the water it stands on keeps running in a cold snap (a fall, or just
 * below one) rather than freezing over (ice.ts).
 */
export function wheelSite(s: GameState, x: number, y: number): { rot: Dir; current: number; flow: number; fall: boolean; runs: boolean; watts: number } | null {
  const sides = [0, 0, 0, 0], open = mapIce(s.map).open;
  let current = 0, fall = false, runs = false;
  for (const t of rim(x, y, 2)) {
    if (!inMap(s, t.ix, t.iy) || !waterAtSide(s, t.ix, t.iy, t.side)) continue;
    const c = s.map.current[tileIndex(s, t.x, t.y)];
    if (c <= 0) continue;
    sides[t.side]++;
    current = Math.max(current, c);
    if (open[tileIndex(s, t.x, t.y)]) runs = true;
    for (const [dx, dy] of SIDES) {
      const nx = t.x + dx, ny = t.y + dy;
      if (inMap(s, nx, ny) && terrainAt(s, nx, ny) === TERRAIN.water && baseLevel(s.map, nx, ny) !== baseLevel(s.map, t.x, t.y)) fall = true;
    }
  }
  if (!current) return null;
  const flow = s.scenario.climate.river.flow;
  current *= flow;
  const rot = sides.indexOf(Math.max(...sides)) as Dir;
  return { rot, current, flow, fall, runs, watts: POWER.wheel * current * (fall ? POWER.wheelFall : 1) };
}

/** Whether goods can pass between buildings `a` and `b` next door: somewhere along the edge they share, the ground joins (not across a cliff). */
export function meets(s: GameState, a: Footprint, b: Footprint) {
  return rim(a.x, a.y, BUILDINGS[a.type].size).some((t) => inMap(s, t.x, t.y) && covers(b, t.x, t.y) && joins(s.map, t.ix, t.iy, t.side));
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

/**
 * How many times a crop's soil loss a field's tile at (x, y) takes per harvest: more the steeper it slopes (FIELD.erosion
 * more on a steep tile, half that on a gentle one), less so when guarded.
 */
export function erosionAt(s: GameState, x: number, y: number, guarded: boolean) {
  return 1 + (guarded ? FIELD.erosionGuarded : FIELD.erosion) * spanOf(s.map, x, y) / STEEP;
}

/** How many tiles of each kind of ground (by `GROUND`) lie under an n × n footprint at (x, y); tiles off the map are not counted. */
export function groundUnder(s: GameState, x: number, y: number, n = 3): number[] {
  const counts = GROUND_IDS.map(() => 0);
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) if (inMap(s, tx, ty)) counts[s.map.ground[tileIndex(s, tx, ty)]]++;
  return counts;
}

/**
 * A field's growth multiplier from water, given the most water any of its sprinklers gives (0–1), how much of the loss a crop
 * suffers (its `thirst`) and, optionally, the warmth (an unwatered field nearly stops in heat).
 */
export const waterPace = (wet: number, thirst = 1, warmth?: number) => 1 - thirst * (1 - (warmth === undefined ? FIELD.dry : dryPace(warmth))) * (1 - wet);

/**
 * A field's growth pace as a multiple of its crop's normal pace, from the most water any of its sprinklers gives (0–1), its
 * average fertility (0–100), its ground's multiplier (`byGround`, from groundPace) and, given a crop and a warmth, the warmth; with the parts it's made of.
 */
export function paceOf(wet: number, fertility: number, crop?: CropDef, warmth?: number, byGround = 1) {
  const byWater = waterPace(wet, crop?.thirst, warmth);
  const bySoil = FIELD.poorSoil + (FIELD.richSoil - FIELD.poorSoil) * fertility / 100;
  const byWarmth = crop && warmth !== undefined ? warmthPace(crop, warmth) : 1;
  return { pace: byWater * bySoil * byWarmth * byGround, byWater, bySoil, byWarmth, byGround };
}
