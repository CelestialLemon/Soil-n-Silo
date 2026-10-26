import { activeEvents, allowed, EVENTS, type Active, type WeatherEvent } from './events.ts';
import { fertilityCap } from './ground.ts';
import { TERRAIN } from './map.ts';
import { centreLevel } from './relief.ts';
import { runtimeOf } from './runtime.ts';
import type { Scenario } from './scenarios.ts';
import type { Climate } from './seasons.ts';
import { reliefOf, sizeOf, touchLayout, type Building, type Footprint, type GameState } from './state.ts';

// The flood: the river (any water) spreads over the low ground beside it, then drains. The reach follows height: water reaches
// a tile only if its surface there is higher than the tile's ground and it can get there over ground at or below it. So a flood
// fills a flat floodplain, climbs a gentle valley floor, and stops at a bank (earthworks raise one) or a hillside. The surface of
// a flood falls a little with every tile it runs from the water (`FALL`), so a plain wide enough to carry it all the way thins
// it out instead of drowning. Pure rules on the map's relief; the view draws the water (world/floodView.ts).
//
// A flood is a rise, in levels above the surface of the water it comes from, over time (`floodRise`). The rise moves in half
// levels (the ground's height at a tile's centre is a multiple of a half), so the covered tiles change only a few times as a
// flood builds and drains: `flooded` is the set at the current step, worked out once and kept until it moves.

/** How far a flood's surface falls for every tile it runs from the water, in levels: floods thin out over wide flat ground. */
export const FALL = 0.16;

/** The silt a drained tile gains in fertility, on the soil now and the level it recovers to. Less than a flood costs. */
export const SILT = 2;

// ---- The flood over time ----

/** The levels of water a flood event stands at its peak (0 for any other event). The hook for a flood's strength: a hurricane's is the severe one, a level higher. */
export const floodLevel = (e: WeatherEvent): number => EVENTS[e.kind].flood?.[e.strength] ?? 0;

/** The most levels any flood in the catalogue stands at. */
export const HIGHEST_FLOOD = Math.max(...Object.values(EVENTS).flatMap((e) => Object.values(e.flood ?? {})));

/** How many levels above its normal surface the flood stands at a time: the highest of the floods under way, built in and out by their ramps. */
export function floodRise(sc: Pick<Scenario, 'events'>, time: number): number {
  const a = floodUnder(sc, time);
  return a ? floodLevel(a.event) * a.intensity : 0;
}

/**
 * The step of a rise: the rise in whole half levels, rounded down (0 until it has risen half a level; before that the water is
 * only rising in the channel). The water stands at its step, never above the rise, so what it covers is wet and what it spares is
 * dry. The flooded tiles change only between steps.
 */
export const floodStep = (rise: number): number => Math.floor(rise * 2 + 1e-6);

/** The tiles a flood has covered at a step. */
export interface Flooded {
  step: number;
  /** 1 for a flooded tile (map index), else 0. */
  tiles: Uint8Array;
  count: number;
  /** The height of the water's surface over each flooded tile, in levels (NaN: dry). */
  surface: Float32Array;
}

/**
 * The tiles a flood of `step` half levels covers, for the relief now. Each water tile is a source at its own surface (a river's
 * reaches stand at different levels either side of a fall); the water spreads tile to tile over ground lower than its surface
 * there, which is the source's, plus the rise, less `FALL` for every tile it has run.
 */
function floodedAt(s: GameState, step: number): Flooded {
  const { width: w, height: h, terrain } = s.map, n = w * h;
  const tiles = new Uint8Array(n), surface = new Float32Array(n).fill(NaN);
  let count = 0;
  if (step > 0) {
    // In hundredths of a level, whole numbers, so a surface level with a bank is exactly level with it (no rounding to cross it).
    const fall = Math.round(FALL * 100), height = new Int32Array(n), queue: number[] = [];
    for (let i = 0; i < n; i++) if (terrain[i] === TERRAIN.water) { queue.push(i); height[i] = s.map.corner[i * 4] * 100 + step * 50; }
    for (let k = 0; k < queue.length; k++) {
      const i = queue[k], x = i % w, y = (i - x) / w, up = height[i] - fall;
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as const) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        // The surface here is the highest any neighbour gives (a tile reached from one source may be reached higher from another); a rise spreads on.
        if (terrain[j] === TERRAIN.water || !(Math.round(centreLevel(s.map, nx, ny) * 100) < up)) continue;
        if (tiles[j] && height[j] >= up) continue;
        if (!tiles[j]) { tiles[j] = 1; count++; }
        height[j] = up; queue.push(j);
      }
    }
    for (let i = 0; i < n; i++) if (tiles[i] || terrain[i] === TERRAIN.water) surface[i] = height[i] / 100;
  }
  return { step, tiles, count, surface };
}

/** The tiles flooded now. Changes only when `syncFlood` says the step moved, or earthworks change the relief. */
export function flooded(s: GameState): Flooded {
  const rt = runtimeOf(s), relief = reliefOf(s), step = floodStep(floodRise(s.scenario, s.time));
  if (rt.flooded && rt.flooded.relief === relief && rt.flooded.value.step === step) return rt.flooded.value;
  const value = floodedAt(s, step);
  rt.flooded = { relief, value };
  return value;
}

/** Whether a tile is under flood water now. */
export function isWet(s: GameState, x: number, y: number): boolean {
  const f = flooded(s);
  return f.count > 0 && x >= 0 && y >= 0 && x < s.map.width && y < s.map.height && f.tiles[y * s.map.width + x] === 1;
}

/** Whether any tile of a building (or a footprint about to be placed) is under flood water now. */
export function isFlooded(s: GameState, b: Footprint): boolean {
  const f = flooded(s);
  if (!f.count) return false;
  const n = sizeOf(b), w = s.map.width;
  for (let y = b.y; y < b.y + n; y++) for (let x = b.x; x < b.x + n; x++) if (f.tiles[y * w + x] === 1) return true;
  return false;
}

/** Whether the water stops a building: any with a tile under it, but the depot (its yard is dry) and a sapling (it grows on). */
export const floodHolds = (s: GameState, b: Building): boolean => b.type !== 'depot' && b.type !== 'sapling' && isFlooded(s, b);

/** The flood under way that stands highest, whose water the buildings are under (null when none). */
export function floodUnder(sc: Pick<Scenario, 'events'>, time: number): Active | null {
  let best: Active | null = null, high = 0;
  for (const a of activeEvents(sc, time)) {
    const rise = floodLevel(a.event) * a.intensity;
    if (rise > high) { best = a; high = rise; }
  }
  return best;
}

// ---- Where it reaches ----

/**
 * For every tile of the map, the first step at which a flood covers it as it builds (1 half level up to the highest flood's), or 0
 * if none does. Worked out once for the relief, then kept.
 */
function firstSteps(s: GameState): Uint8Array {
  const rt = runtimeOf(s), relief = reliefOf(s);
  if (rt.floodSteps && rt.floodSteps.relief === relief) return rt.floodSteps.first;
  const first = new Uint8Array(s.map.width * s.map.height);
  for (let step = 1; step <= 2 * HIGHEST_FLOOD; step++) {
    const f = floodedAt(s, step);
    for (let i = 0; i < first.length; i++) if (!first[i] && f.tiles[i]) first[i] = step;
  }
  rt.floodSteps = { relief, first };
  return first;
}

/**
 * The lowest flood level that reaches a footprint (1 an ordinary flood, 2 a severe one), or null if no flood the game has does.
 * The placement card states it as a fact. A footprint partly off the map counts what is on it.
 */
export function floodsAt(s: GameState, b: Footprint): number | null {
  const first = firstSteps(s), n = sizeOf(b), w = s.map.width;
  let least = Infinity;
  for (let y = b.y; y < b.y + n; y++) for (let x = b.x; x < b.x + n; x++) {
    if (x < 0 || y < 0 || x >= w || y >= s.map.height) continue;
    const k = first[y * w + x];
    if (k) least = Math.min(least, Math.ceil(k / 2));
  }
  return least === Infinity ? null : least;
}

/** Whether a climate can bring a flood at all (the sandbox starts any by hand): in a season that has one, or one that brings it (a tropical storm). */
export const canFlood = (c: Pick<Climate, 'season' | 'character'>): boolean => allowed('flood', c) || allowed('tropicalStorm', c);

// ---- Each step ----

/**
 * Called each step, after the clock moved on by `dt`: when the flood has moved a step, the layout is touched (roads, power
 * networks and what hangs on them are worked out again for the new water), and ground the water has left gains silt. Just
 * after a load nothing is cached, so the step before is worked out from the clock, and the first step silts like any other.
 */
export function syncFlood(s: GameState, dt: number) {
  const rt = runtimeOf(s), relief = reliefOf(s);
  const before = rt.flooded && rt.flooded.relief === relief ? rt.flooded.value : floodedAt(s, floodStep(floodRise(s.scenario, s.time - dt)));
  const now = flooded(s);
  if (before.step === now.step) return;
  touchLayout(s);
  if (now.step < before.step) {
    const f = s.map.fertility, base = s.soilBase, was = before.tiles;
    for (let i = 0; i < was.length; i++) if (was[i] === 1 && now.tiles[i] !== 1) {
      const cap = fertilityCap(s.map.ground[i]);
      f[i] = Math.min(cap, f[i] + SILT); base[i] = Math.min(cap, base[i] + SILT);
    }
  }
}
