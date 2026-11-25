// Site measurements depend on land edits. Water reserves, weather and bee activity change during play. Frost hollows: cold
// air drains into low ground on still nights, so a basin runs a few degrees colder than the slopes above it.
import { isNight } from './clock.ts';
import { clamp, polylineDistance, type Point2 } from './geom.ts';
import { cellX, cellZ, COVER, rectOfWorld, slopeAt } from './grid.ts';
import { noise2 } from './noise.ts';
import type { SimEnv } from './power/sim.ts';
import type { ThingKind } from './catalog.ts';
import type { Field, GameState, Thing } from './state.ts';
import type { ThingRuntime } from './workshops.ts';

export const SERVICE_RADIUS = { beehive: 14, rain_tank: 10, sprinkler: 11 } as const;
export const hasServiceRadius = (kind: ThingKind): kind is keyof typeof SERVICE_RADIUS => Object.hasOwn(SERVICE_RADIUS, kind);
const distance = (a: Point2, b: Point2) => Math.hypot(a.x - b.x, a.z - b.z);
export const isRaining = (weather?: string) => weather === 'rain' || weather === 'soft-rain' || weather === 'storm';
export function treeShade(s: GameState, p: Point2, radius?: number): number {
  let shade = 0;
  for (const trees of [s.wildTrees, s.plantedTrees]) for (const t of trees)
    if (distance(t, p) <= (radius ?? 3.5 + 2 * t.scale)) shade += 0.2;
  return Math.min(0.5, shade);
}

export function windShelter(s: GameState, p: Point2): number {
  let shelter = 0;
  for (const trees of [s.wildTrees, s.plantedTrees]) for (const t of trees) shelter += 0.45 * Math.max(0, 1 - distance(t, p) / 12);
  for (const h of s.hedges) shelter += 0.65 * Math.max(0, 1 - polylineDistance(p.x, p.z, h.path).d / 12);
  return Math.min(0.65, shelter);
}

function fieldCells(s: GameState, f: Field): Point2[] {
  const g = s.grid, points = [];
  for (let z = f.bounds.z0; z <= f.bounds.z1; z++) for (let x = f.bounds.x0; x <= f.bounds.x1; x++)
    if (g.fieldOf[z * g.nx + x] === f.id) points.push({ x: cellX(g, x), z: cellZ(g, z) });
  return points;
}

export function erosionDrain(s: GameState, f: Field): number {
  if (f.crop !== 'wheat') return 0;
  const cells = fieldCells(s, f);
  const avgSlope = cells.reduce((n, p) => n + slopeAt(s.grid, p.x, p.z), 0) / Math.max(1, cells.length);
  const drain = clamp(avgSlope - 0.08, 0, 0.1);
  if (!drain) return 0;
  const beanIds = new Set(s.fields.filter(v => v.crop === 'beans').map(v => v.id));
  const nearbyBeans = (p: Point2) => {
    if (!beanIds.size) return false;
    const g = s.grid, rect = rectOfWorld(g, p.x - 10, p.z - 10, p.x + 10, p.z + 10);
    if (rect) for (let z = rect.z0; z <= rect.z1; z++) for (let x: number = rect.x0; x <= rect.x1; x++)
      if (beanIds.has(g.fieldOf[z * g.nx + x]) && Math.hypot(cellX(g, x) - p.x, cellZ(g, z) - p.z) <= 10) return true;
    return false;
  };
  const protectedCells = cells.filter(p => treeShade(s, p, 10) > 0 || s.hedges.some(h => polylineDistance(p.x, p.z, h.path).d <= 10)
    || nearbyBeans(p)).length;
  return drain * (1 - 0.8 * protectedCells / cells.length);
}

export const flowerDrift = (seed: number, x: number, z: number) => noise2(seed, x * 0.09 + 31, z * 0.09 - 17);

interface Site { fields: Field[]; cells: Map<number, number[]>; meadow: boolean }
const sites = new WeakMap<Thing, { key: string; site: Site }>();
export function serviceSite(s: GameState, t: Thing): Site {
  const hit = sites.get(t);
  const key = `${s.revision}:${t.x},${t.z}`;
  if (hit?.key === key) return hit.site;
  if (!hasServiceRadius(t.kind)) return { fields: [], cells: new Map(), meadow: false };
  const radius = SERVICE_RADIUS[t.kind];
  const g = s.grid, rect = rectOfWorld(g, t.x - radius, t.z - radius, t.x + radius, t.z + radius);
  const cells = new Map<number, number[]>();
  let meadow = false;
  if (rect) for (let z = rect.z0; z <= rect.z1; z++) for (let x: number = rect.x0; x <= rect.x1; x++) {
    const p = { x: cellX(g, x), z: cellZ(g, z) }, i = z * g.nx + x;
    if (distance(t, p) > radius) continue;
    if (g.fieldOf[i]) {
      const id = g.fieldOf[i];
      if (!cells.has(id)) cells.set(id, []);
      cells.get(id)?.push(i);
    } else if (g.cover[i] === COVER.grass && g.worked[i] < 25 && flowerDrift(s.seed, p.x, p.z) > 0.15) meadow = true;
  }
  const site = { fields: s.fields.filter(f => cells.has(f.id)), cells, meadow };
  sites.set(t, { key, site });
  return site;
}

/** Below this air, bees stay in the hive (unless a warm Heated Greenhouse stands within their reach). */
export const BEE_MIN_C = 10;

/** Whether a Heated Greenhouse is warm now: powered and growing (bees forage inside it in the cold). */
export const greenhouseWarm = (r: ThingRuntime | undefined) => r?.kind === 'greenhouse' && r.powered && r.working;

/** A powered, growing Heated Greenhouse within a hive's reach: its bees forage warm inside the glass. */
export function warmGreenhouseNear(s: GameState, t: Point2): boolean {
  return s.things.some((g) => g.kind === 'greenhouse' && distance(g, t) <= SERVICE_RADIUS.beehive && greenhouseWarm(s.sim.things.get(g.id)));
}

/**
 * How briskly a hive's bees forage now (0: they stay in). Outdoors they need daylight, flowers (flowering beans or a
 * wildflower meadow), dry calm weather and air of 10°C or more, and never in winter; a warm Heated Greenhouse within their
 * reach lets them forage inside the glass whatever the weather (by day).
 */
export function forageRate(s: GameState, t: Thing, env: SimEnv): number {
  if (isNight(s.sim.hour, s.season)) return 0;
  const flowers = floweringArea(s, t);
  if (warmGreenhouseNear(s, t)) return 1 + Math.min(3, flowers / 20) * 0.2;
  const weather = env.weather ?? s.sim.weather.spell;
  if (s.season === 'winter' || isRaining(weather) || weather === 'snow' || weather === 'blizzard' || weather === 'gale') return 0;
  if (s.sim.weather.tempC < BEE_MIN_C) return 0;
  const site = serviceSite(s, t);
  if (!flowers && !site.meadow) return 0;
  const wind = env.windSpeed * (1 - windShelter(s, t));
  return (1 + Math.min(3, flowers / 20) * 0.2) * clamp(1 - (wind - 9) / 5, 0, 1);
}

export function floweringArea(s: GameState, t: Thing): number {
  const site = serviceSite(s, t);
  return site.fields.reduce((area, f) => area + (f.crop === 'beans' && f.growth >= 0.45
    ? (site.cells.get(f.id)?.length ?? 0) * s.grid.cell ** 2 : 0), 0);
}

export function pollinationCoverage(s: GameState, f: Field): number {
  const covered = new Set<number>();
  for (const t of s.things) if (t.kind === 'beehive' && s.sim.things.get(t.id)?.working)
    for (const cell of serviceSite(s, t).cells.get(f.id) ?? []) covered.add(cell);
  return covered.size / f.cellCount;
}

// Each cell takes the strongest water source, which lifts it to that source's level from its own natural moisture (a wet
// bank needs no lift). Tanks serving the same dry cell share its cost; a cell already moist enough costs them nothing. Rain
// waters every field at a sprinkler's level, so idle sprinklers and tanks neither dry crops out nor drain.
export function effectiveMoisture(s: GameState, f: Field, drain?: Map<number, number>, weather?: string): number {
  if (isRaining(weather)) return Math.max(f.avgMoisture, 0.75);
  const watered = new Map<number, number[]>();
  for (const t of s.things) {
    const r = s.sim.things.get(t.id);
    const sprinkler = t.kind === 'sprinkler' && (r?.watts ?? 0) > 0;
    if (!sprinkler && !(t.kind === 'rain_tank' && r && r.water > 0)) continue;
    for (const cell of serviceSite(s, t).cells.get(f.id) ?? []) {
      const tanks = watered.get(cell);
      if (sprinkler) watered.set(cell, []);
      else if (!tanks) watered.set(cell, [t.id]);
      else if (tanks.length) tanks.push(t.id);
    }
  }
  let lift = 0;
  for (const [cell, tanks] of watered) {
    const base = s.grid.moisture[cell];
    lift += Math.max(0, (tanks.length ? 0.32 : 0.75) - base);
    if (drain && !f.harvestReady && base < 0.32)
      for (const id of tanks) drain.set(id, (drain.get(id) ?? 0) + s.grid.cell ** 2 / tanks.length);
  }
  return f.avgMoisture + lift / f.cellCount;
}

/** The air at which the hens and the crops feel the heat, °C. */
export const HOT_C = 28;
/** A hot midday (summer's, or a heatwave's), or any hour of 28°C or more: the hens want shade. */
export const hotMidday = (s: GameState, weather?: string) =>
  ((s.season === 'summer' || weather === 'heat-wave') && s.sim.hour >= 11 && s.sim.hour < 16) || s.sim.weather.tempC >= HOT_C;

// --- Frost hollows ------------------------------------------------------------------------------------------------------

/** How far round a cell the land's mean is read for its hollow, m. */
export const HOLLOW_REACH = 10;
/** The most a hollow cools its air, and a rise warms it, °C. */
export const HOLLOW_COLD_C = 3.5, SLOPE_WARM_C = 0.5;

const hollowCache = new WeakMap<GameState, { revision: number; depth: Float32Array }>();

/**
 * How far each cell lies below the mean ground within HOLLOW_REACH of it, m (negative: above it, on a rise). Cold air
 * drains into the hollows on still nights. Worked out again when the land changes.
 */
export function hollowDepths(s: GameState): Float32Array {
  const hit = hollowCache.get(s);
  if (hit && hit.revision === s.revision) return hit.depth;
  const g = s.grid, nx = g.nx, nz = g.nz, W = nx + 1, r = Math.round(HOLLOW_REACH / g.cell);
  // A summed-area table of the cells' ground heights.
  const sum = new Float64Array((nx + 1) * (nz + 1));
  const ground = (ix: number, iz: number) => { const i = iz * W + ix; return (g.height[i] + g.height[i + 1] + g.height[i + W] + g.height[i + W + 1]) / 4; };
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++)
    sum[(iz + 1) * (nx + 1) + ix + 1] = ground(ix, iz) + sum[iz * (nx + 1) + ix + 1] + sum[(iz + 1) * (nx + 1) + ix] - sum[iz * (nx + 1) + ix];
  const depth = new Float32Array(nx * nz);
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
    const x0 = Math.max(0, ix - r), x1 = Math.min(nx, ix + r + 1), z0 = Math.max(0, iz - r), z1 = Math.min(nz, iz + r + 1);
    const total = sum[z1 * (nx + 1) + x1] - sum[z0 * (nx + 1) + x1] - sum[z1 * (nx + 1) + x0] + sum[z0 * (nx + 1) + x0];
    depth[iz * nx + ix] = total / ((x1 - x0) * (z1 - z0)) - ground(ix, iz);
  }
  hollowCache.set(s, { revision: s.revision, depth });
  return depth;
}

/** How far cell (ix, iz) lies below the land round it, m (negative: on a rise). */
export const hollowDepth = (s: GameState, ix: number, iz: number) => hollowDepths(s)[iz * s.grid.nx + ix];

/** A hollow's chill (negative) or a rise's warmth, °C, on a still clear night. */
const hollowShift = (depth: number) => depth > 0 ? -HOLLOW_COLD_C * clamp(depth / 1.5, 0, 1) : SLOPE_WARM_C * clamp(-depth, 0, 1);

/** How strongly cold air pools now, 0..1: fully on a still night, a little by day or in a wind. */
export function inversion(s: GameState): number {
  const w = s.sim.weather;
  return (isNight(s.sim.hour, s.season) ? 1 : 0.35) * clamp(1 - (w.windSpeed - 6) / 8, 0.3, 1) * (1 - 0.4 * w.cloudCover);
}

/** The air at a point, °C: `baseTempC` (the homestead's) colder down in a hollow, a touch warmer up a slope. */
export function localTempC(s: GameState, x: number, z: number, baseTempC = s.sim.weather.tempC): number {
  const g = s.grid, ix = clamp(Math.floor((x - g.x0) / g.cell), 0, g.nx - 1), iz = clamp(Math.floor((z - g.z0) / g.cell), 0, g.nz - 1);
  return baseTempC + hollowShift(hollowDepth(s, ix, iz)) * inversion(s);
}

const fieldShiftCache = new WeakMap<Field, { key: string; shift: number }>();

/** The air over a field, °C: the mean of its cells' (localTempC). */
export function fieldTempC(s: GameState, f: Field, baseTempC = s.sim.weather.tempC): number {
  const key = `${s.revision}:${f.cellCount}:${f.bounds.x0},${f.bounds.z0},${f.bounds.x1},${f.bounds.z1}`;
  let hit = fieldShiftCache.get(f);
  if (hit?.key !== key) {
    const g = s.grid, depth = hollowDepths(s);
    let sum = 0, n = 0;
    for (let iz = f.bounds.z0; iz <= f.bounds.z1; iz++) for (let ix = f.bounds.x0; ix <= f.bounds.x1; ix++) {
      const i = iz * g.nx + ix;
      if (g.fieldOf[i] !== f.id) continue;
      sum += hollowShift(depth[i]); n++;
    }
    hit = { key, shift: n > 0 ? sum / n : 0 };
    fieldShiftCache.set(f, hit);
  }
  return baseTempC + hit.shift * inversion(s);
}
