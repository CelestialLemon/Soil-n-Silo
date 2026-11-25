// Site measurements depend on land edits. Water reserves, weather and bee activity change during play.
import { isNight } from './clock.ts';
import { clamp, polylineDistance, type Point2 } from './geom.ts';
import { cellX, cellZ, COVER, rectOfWorld, slopeAt } from './grid.ts';
import { noise2 } from './noise.ts';
import type { SimEnv } from './power/sim.ts';
import type { ThingKind } from './catalog.ts';
import type { Field, GameState, Thing } from './state.ts';

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

export function forageRate(s: GameState, t: Thing, env: SimEnv): number {
  if (s.season === 'winter' || isNight(s.sim.hour, s.season) || isRaining(env.weather) || env.weather === 'snow' || env.weather === 'blizzard') return 0;
  const site = serviceSite(s, t);
  const flowers = floweringArea(s, t);
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

export const hotMidday = (s: GameState, weather?: string) => (s.season === 'summer' || weather === 'heat-wave') && s.sim.hour >= 11 && s.sim.hour < 16;
