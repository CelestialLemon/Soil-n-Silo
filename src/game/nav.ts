// Where an Electric Cart can drive, and how it gets there: a coarse 2 m grid over the land, worked out again whenever the
// land or what stands on it changes. Tracks and plank bridges are quick and easy on the battery; open meadow is slower
// and drains it harder; muddy ground by the water bogs a cart down; a planted field is dearer still (carts go round the
// crops, never through them, unless there's no other way); steep ground costs dear. Unbridged water, rills,
// rock, woods, hedgerows, tree trunks and buildings are walls; so is deep flood water (shallow flood water is mud). A* finds
// the cheapest way, then the path is pulled straight wherever a straight line costs no more, so carts follow curving tracks and run straight over bridges.
import { CATALOG } from './catalog.ts';
import { coreObb } from './earth.ts';
import { type Obb, obbDistance, type Point2, polylineDistance, toWorld } from './geom.ts';
import { BUILD_HALF, COVER, type Grid, slopeAt } from './grid.ts';
import type { GameState } from './state.ts';
import { FLOOD_DEEP } from './flood.ts';

/** The nav grid's cell, m, and its size: 80 × 80 over the 160 m land. */
export const NAV_CELL = 2;
export const NAV_N = 80;
const NAV_X0 = -80, NAV_Z0 = -80;

/** A cart's top speed on a track, m per game-second (at 1×, a game hour is 30 s). */
export const CART_SPEED = 6;

/** Each kind of ground: what it costs to cross a cell (per cell length), how fast a cart goes and how hard it drains. */
export const GROUND = {
  track: { cost: 1, speed: 1, drain: 1 },
  meadow: { cost: 2.8, speed: 0.48, drain: 1.8 },
  mud: { cost: 4.8, speed: 0.3, drain: 2.4 },
  /** A planted field: so dear that a cart drives round it (it crosses the crops only where there's no way round). */
  field: { cost: 28, speed: 0.4, drain: 2.0 },
} as const;
/** Slopes steeper than this cost a cart dear. */
export const STEEP = 0.35;
const STEEP_COST = 4, STEEP_SPEED = 0.7, STEEP_DRAIN = 0.8;
/** Off-track ground this damp is mud. */
export const MUDDY = 0.35;

export interface Nav {
  key: string;
  /** Per cell: the cost to cross it (Infinity: impassable), the speed factor and the battery drain factor. */
  cost: Float32Array; speed: Float32Array; drain: Float32Array;
  /** Per cell: 1 on a track or bridge. */
  track: Uint8Array;
  /** Per cell: 1 on unbridged water or a rill. */
  water: Uint8Array;
  /** Per cell: 1 on a planted field's ground (off any track or bridge). */
  field: Uint8Array;
  /** Cell paths found, by "from:to" (null: no way). */
  paths: Map<string, number[] | null>;
  /** Per cell: which connected patch of drivable ground it belongs to (-1: impassable); worked out when first asked. */
  comp?: Int32Array;
}

const navCache = new WeakMap<GameState, Nav>();

/**
 * What the nav grid depends on, as a short key: the land's revision (every edit to things, tracks, rills and fields moves
 * it on) and the hedgerows and planted trees (which don't).
 */
function navKey(s: GameState): string {
  let hedges = 0, trees = 0;
  for (const h of s.hedges) hedges += h.id;
  for (const t of s.plantedTrees) trees += t.id;
  return `${s.revision}|${s.hedges.length}:${hedges}|${s.plantedTrees.length}:${trees}|${s.sim.floodKey}`;
}

export const navIndex = (cx: number, cz: number) => cz * NAV_N + cx;
export const navCx = (x: number) => Math.max(0, Math.min(NAV_N - 1, Math.floor((x - NAV_X0) / NAV_CELL)));
export const navCz = (z: number) => Math.max(0, Math.min(NAV_N - 1, Math.floor((z - NAV_Z0) / NAV_CELL)));
export const navCellOf = (x: number, z: number) => navIndex(navCx(x), navCz(z));
export const navCenter = (i: number): Point2 => ({ x: NAV_X0 + ((i % NAV_N) + 0.5) * NAV_CELL, z: NAV_Z0 + (Math.floor(i / NAV_N) + 0.5) * NAV_CELL });

/** The nav grid for the state as it stands (cached until the land or what's on it changes). */
export function navFor(s: GameState): Nav {
  const key = navKey(s), hit = navCache.get(s);
  if (hit && hit.key === key) return hit;
  const nav = buildNav(s, key);
  navCache.set(s, nav);
  return nav;
}

function buildNav(s: GameState, key: string): Nav {
  const g = s.grid, n = NAV_N * NAV_N;
  const cost = new Float32Array(n), speed = new Float32Array(n), drain = new Float32Array(n), track = new Uint8Array(n);
  const water = new Uint8Array(n), blocked = new Uint8Array(n), wet = new Float32Array(n), crop = new Uint8Array(n), field = new Uint8Array(n);
  for (let cz = 0; cz < NAV_N; cz++) for (let cx = 0; cx < NAV_N; cx++) {
    const i = navIndex(cx, cz), c = navCenter(i);
    if (Math.abs(c.x) > BUILD_HALF + 1 || Math.abs(c.z) > BUILD_HALF + 1) { blocked[i] = 1; continue; }
    forFine(g, cx, cz, (k) => {
      const cv = g.cover[k];
      if (cv === COVER.rock || cv === COVER.woods) blocked[i] = 1;
      else if (cv === COVER.water || cv === COVER.rill) water[i] = 1;
      else if (cv === COVER.track) track[i] = 1;
      if (g.fieldOf[k] !== 0) crop[i] = 1;
      // Deep flood water cuts the way (a bridge still carries it); shallow flood water is mud.
      if (g.flood[k] > FLOOD_DEEP) water[i] = 1;
      wet[i] = Math.max(wet[i], g.moisture[k], g.flood[k] > 0 ? 1 : 0);
    });
  }
  // Plank bridges carry carts over the water and rills they span.
  for (const b of s.bridges) {
    const box: Obb = { cx: b.x, cz: b.z, hw: b.width / 2, hd: b.length / 2, yaw: b.yaw };
    forBox(box, 0.9, (i) => { water[i] = 0; track[i] = 1; });
  }
  // Buildings (but solar canopies, which carts drive under), hedgerows and tree trunks.
  for (const t of s.things) if (t.kind !== 'solar') forBox(coreObb(t), 0.2, (i) => { blocked[i] = 1; });
  for (const h of s.hedges) for (let i = 0; i < n; i++) {
    const c = navCenter(i);
    if (!blocked[i] && polylineDistance(c.x, c.z, h.path).d <= 1) blocked[i] = 1;
  }
  for (const t of [...s.wildTrees, ...s.plantedTrees]) blocked[navCellOf(t.x, t.z)] = 1;

  for (let i = 0; i < n; i++) {
    if (blocked[i] || water[i]) { cost[i] = Infinity; speed[i] = 0; drain[i] = 0; continue; }
    // A cell that touches a crop is field ground (a track or bridge through it is still a track).
    if (!track[i] && crop[i]) field[i] = 1;
    const ground = track[i] ? GROUND.track : field[i] ? GROUND.field : wet[i] > MUDDY ? GROUND.mud : GROUND.meadow;
    const c = navCenter(i), steep = !track[i] && slopeAt(g, c.x, c.z) > STEEP;
    cost[i] = ground.cost + (steep ? STEEP_COST : 0);
    speed[i] = ground.speed * (steep ? STEEP_SPEED : 1);
    drain[i] = ground.drain + (steep ? STEEP_DRAIN : 0);
  }
  return { key, cost, speed, drain, track, water, field, paths: new Map() };
}

/** The fine land cells (1 m) under a nav cell. */
function forFine(g: Grid, cx: number, cz: number, fn: (k: number) => void) {
  const per = NAV_CELL / g.cell, ox = (NAV_X0 - g.x0) / g.cell, oz = (NAV_Z0 - g.z0) / g.cell;
  for (let dz = 0; dz < per; dz++) for (let dx = 0; dx < per; dx++) {
    const ix = ox + cx * per + dx, iz = oz + cz * per + dz;
    if (ix >= 0 && iz >= 0 && ix < g.nx && iz < g.nz) fn(iz * g.nx + ix);
  }
}

/** The nav cells whose centres lie within `margin` of a box. */
function forBox(o: Obb, margin: number, fn: (i: number) => void) {
  const r = o.hw + o.hd + margin + NAV_CELL;
  const cx0 = navCx(o.cx - r), cx1 = navCx(o.cx + r), cz0 = navCz(o.cz - r), cz1 = navCz(o.cz + r);
  for (let cz = cz0; cz <= cz1; cz++) for (let cx = cx0; cx <= cx1; cx++) {
    const i = navIndex(cx, cz), c = navCenter(i);
    if (obbDistance(o, c.x, c.z) <= margin) fn(i);
  }
}

export const passable = (nav: Nav, i: number) => Number.isFinite(nav.cost[i]);

/** The passable cell nearest a point, within `reach` cells (the point's own first); `ok`: only cells it allows. */
export function nearestPassable(nav: Nav, x: number, z: number, reach = 4, ok?: (i: number) => boolean): number | undefined {
  const cx = navCx(x), cz = navCz(z);
  let best: number | undefined, bestD = Infinity;
  for (let dz = -reach; dz <= reach; dz++) for (let dx = -reach; dx <= reach; dx++) {
    const ax = cx + dx, az = cz + dz;
    if (ax < 0 || az < 0 || ax >= NAV_N || az >= NAV_N) continue;
    const i = navIndex(ax, az);
    if (!passable(nav, i) || (ok && !ok(i))) continue;
    const c = navCenter(i), d = Math.hypot(c.x - x, c.z - z);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** A binary min-heap of cells by score. */
class Heap {
  private readonly items: number[] = [];
  private readonly score: Float64Array;
  constructor(score: Float64Array) { this.score = score; }
  get size() { return this.items.length; }
  push(i: number) {
    const a = this.items, f = this.score;
    a.push(i);
    let k = a.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (f[a[p]] <= f[a[k]]) break;
      [a[p], a[k]] = [a[k], a[p]];
      k = p;
    }
  }
  pop(): number {
    const a = this.items, f = this.score, top = a[0], last = a.pop();
    if (a.length > 0 && last !== undefined) {
      a[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1, r = l + 1;
        let m = k;
        if (l < a.length && f[a[l]] < f[a[m]]) m = l;
        if (r < a.length && f[a[r]] < f[a[m]]) m = r;
        if (m === k) break;
        [a[m], a[k]] = [a[k], a[m]];
        k = m;
      }
    }
    return top;
  }
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] as const;

/**
 * The cheapest cell path from one cell to another (A*, octile steps; a diagonal step can't cut a blocked corner), or null
 * if there's no way. The start and goal cells are allowed even if blocked (a cart parked by a building's door).
 */
export function findCells(nav: Nav, from: number, to: number): number[] | null {
  const key = `${from}:${to}`, hit = nav.paths.get(key);
  if (hit !== undefined) return hit;
  const n = NAV_N * NAV_N, gScore = new Float64Array(n).fill(Infinity), fScore = new Float64Array(n).fill(Infinity);
  const came = new Int32Array(n).fill(-1), closed = new Uint8Array(n), open = new Heap(fScore);
  const tx = to % NAV_N, tz = Math.floor(to / NAV_N);
  const h = (i: number) => {
    const dx = Math.abs((i % NAV_N) - tx), dz = Math.abs(Math.floor(i / NAV_N) - tz);
    return GROUND.track.cost * (dx + dz + (Math.SQRT2 - 2) * Math.min(dx, dz));
  };
  const costAt = (i: number) => (i === to || i === from ? Math.min(nav.cost[i], GROUND.meadow.cost) : nav.cost[i]);
  gScore[from] = 0; fScore[from] = h(from); open.push(from);
  let found = false;
  while (open.size > 0) {
    const i = open.pop();
    if (closed[i]) continue;
    if (i === to) { found = true; break; }
    closed[i] = 1;
    const x = i % NAV_N, z = Math.floor(i / NAV_N);
    for (const [dx, dz] of DIRS) {
      const ax = x + dx, az = z + dz;
      if (ax < 0 || az < 0 || ax >= NAV_N || az >= NAV_N) continue;
      const j = navIndex(ax, az);
      if (closed[j]) continue;
      const cj = costAt(j);
      if (!Number.isFinite(cj)) continue;
      const diag = dx !== 0 && dz !== 0;
      if (diag && (!Number.isFinite(costAt(navIndex(x + dx, z))) || !Number.isFinite(costAt(navIndex(x, z + dz))))) continue;
      const step = (diag ? Math.SQRT2 : 1) * (costAt(i) + cj) / 2;
      const gj = gScore[i] + step;
      if (gj < gScore[j]) { gScore[j] = gj; fScore[j] = gj + h(j); came[j] = i; open.push(j); }
    }
  }
  let out: number[] | null = null;
  if (found) {
    out = [];
    for (let i = to; i !== -1; i = came[i]) out.push(i);
    out.reverse();
  }
  if (nav.paths.size > 4000) nav.paths.clear();
  nav.paths.set(key, out);
  return out;
}

/**
 * Calls `fn` with every nav cell a straight segment crosses, in order, exactly (a grid walk, not samples); a segment
 * through a cell's corner counts both cells beside the corner too, as a diagonal step can't cut one. A cell off the grid is
 * -1. Stops early when `fn` returns true.
 */
function forSegmentCells(a: Point2, b: Point2, fn: (i: number) => boolean | void): void {
  const ax = (a.x - NAV_X0) / NAV_CELL, az = (a.z - NAV_Z0) / NAV_CELL, bx = (b.x - NAV_X0) / NAV_CELL, bz = (b.z - NAV_Z0) / NAV_CELL;
  const at = (cx: number, cz: number) => (cx < 0 || cz < 0 || cx >= NAV_N || cz >= NAV_N ? -1 : navIndex(cx, cz));
  let cx = Math.floor(ax), cz = Math.floor(az);
  const ex = Math.floor(bx), ez = Math.floor(bz), dx = bx - ax, dz = bz - az;
  const sx = Math.sign(dx), sz = Math.sign(dz);
  const tdx = sx !== 0 ? 1 / Math.abs(dx) : Infinity, tdz = sz !== 0 ? 1 / Math.abs(dz) : Infinity;
  let tx = sx > 0 ? (cx + 1 - ax) * tdx : sx < 0 ? (ax - cx) * tdx : Infinity;
  let tz = sz > 0 ? (cz + 1 - az) * tdz : sz < 0 ? (az - cz) * tdz : Infinity;
  if (fn(at(cx, cz))) return;
  for (let guard = 0; (cx !== ex || cz !== ez) && guard < 4 * NAV_N; guard++) {
    const t = Math.min(tx, tz);
    if (t > 1) break;
    if (Math.abs(tx - tz) < 1e-9) {
      // Through a corner: both cells beside it, then the one across.
      if (fn(at(cx + sx, cz)) || fn(at(cx, cz + sz))) return;
      cx += sx; cz += sz; tx += tdx; tz += tdz;
    } else if (tx < tz) { cx += sx; tx += tdx; }
    else { cz += sz; tz += tdz; }
    if (fn(at(cx, cz))) return;
  }
}

/** The cost of a straight line between two points, by the costliest cell it crosses (Infinity if any is impassable). */
function lineCost(nav: Nav, a: Point2, b: Point2): number {
  let worst = 0;
  forSegmentCells(a, b, (i) => {
    worst = Math.max(worst, i < 0 ? Infinity : nav.cost[i]);
    return worst === Infinity;
  });
  return worst;
}

/**
 * Whether a straight run between two points crosses only drivable cells costing no more than `limit` (`own`: a cell it may
 * cross anyway): a run the path is pulled onto never cuts across a field the cells it replaces went round.
 */
function runClear(nav: Nav, a: Point2, b: Point2, own = -1, limit = Infinity): boolean {
  let clear = true;
  forSegmentCells(a, b, (i) => {
    if (i !== own && (i < 0 || !passable(nav, i) || nav.cost[i] > limit + 1e-6)) clear = false;
    return !clear;
  });
  return clear;
}

/**
 * Pulls a cell path straight wherever a straight line crosses nothing costlier than the cells it skips. The goal is weighed
 * as A* weighed it (no dearer than meadow), so a goal inside a field never lets a long straight cut across the crops.
 */
function smooth(nav: Nav, cells: readonly number[]): Point2[] {
  const pts = cells.map(navCenter);
  if (pts.length <= 2) return pts;
  const last = pts.length - 1, costOf = (j: number) => (j === last ? Math.min(nav.cost[cells[j]], GROUND.meadow.cost) : nav.cost[cells[j]]);
  const out: Point2[] = [pts[0]];
  let i = 0;
  while (i < pts.length - 1) {
    let best = i + 1, worst = costOf(i + 1);
    for (let j = i + 2; j < pts.length; j++) {
      worst = Math.max(worst, costOf(j));
      if (lineCost(nav, pts[i], pts[j]) <= worst + 1e-6) best = j;
      else if (j - best > 3) break;
    }
    out.push(pts[best]);
    i = best;
  }
  return out;
}

/**
 * The start cell a path from a point is found from: its own if drivable, else the nearest drivable one within 2 cells that
 * it can step to straight without crossing any other water (a cart left in the brook when its bridge came up climbs out on
 * the near bank, never across the rest of the brook); undefined if there's none (it's stranded until a bridge spans it).
 * Its own cell may be walled by a building set down on it: it steps out over that.
 */
function startCell(nav: Nav, p: Point2): number | undefined {
  const own = navCellOf(p.x, p.z);
  if (passable(nav, own)) return own;
  const cx = navCx(p.x), cz = navCz(p.z), reach = 2;
  let best: number | undefined, bestD = Infinity;
  for (let dz = -reach; dz <= reach; dz++) for (let dx = -reach; dx <= reach; dx++) {
    const ax = cx + dx, az = cz + dz;
    if (ax < 0 || az < 0 || ax >= NAV_N || az >= NAV_N) continue;
    const i = navIndex(ax, az);
    if (!passable(nav, i)) continue;
    const c = navCenter(i), d = Math.hypot(c.x - p.x, c.z - p.z);
    if (d < bestD && stepDry(nav, p, c, own)) { bestD = d; best = i; }
  }
  return best;
}

/** Whether a straight step between two points crosses no water but its own cell's (nor leaves the grid). */
function stepDry(nav: Nav, a: Point2, b: Point2, own: number): boolean {
  let dry = true;
  forSegmentCells(a, b, (i) => { if (i !== own && (i < 0 || nav.water[i] === 1)) dry = false; return !dry; });
  return dry;
}

/**
 * A drivable path of waypoints from one point to another, or null if no cart can get there. It starts at the exact point
 * and ends at the exact spot when that's on drivable ground beside the last cell; a run to or from either is kept only
 * where it crosses no wall, else the path goes by the nearest cell's centre (so it never clips a corner of the water).
 */
export function findPath(s: GameState, from: Point2, to: Point2): Point2[] | null {
  const nav = navFor(s);
  const a = startCell(nav, from), b = nearestPassable(nav, to.x, to.z, 3);
  if (a === undefined || b === undefined) return null;
  const cells = findCells(nav, a, b);
  if (!cells) return null;
  const centres = smooth(nav, cells);
  if (centres.length === 1) centres.push(navCenter(b));
  const start = { x: from.x, z: from.z }, own = navCellOf(from.x, from.z);
  // Straight to the second waypoint if that's clear (and no dearer than the leg from the start cell's centre it replaces:
  // it never clips a field the path went round); else by the start cell's centre (a cart off the drivable ground steps out
  // to it first, over no other water).
  const pts = runClear(nav, start, centres[1], own, lineCost(nav, centres[0], centres[1])) ? [start, ...centres.slice(1)] : [start, ...centres];
  // Finish at the exact spot if it's on drivable ground next to the last cell, and the run to it is clear (and no dearer
  // than the leg it replaces, or than the ground at either end of the last step).
  const end = pts[pts.length - 1], spot = { x: to.x, z: to.z }, spotCell = navCellOf(to.x, to.z);
  if (passable(nav, spotCell) && Math.hypot(end.x - to.x, end.z - to.z) <= NAV_CELL * 1.5) {
    const prev = pts[pts.length - 2], last = Math.max(nav.cost[spotCell], nav.cost[navCellOf(end.x, end.z)]);
    if (runClear(nav, prev, spot, pts.length === 2 ? own : -1, Math.max(lineCost(nav, prev, end), nav.cost[spotCell]))) pts[pts.length - 1] = spot;
    else if (runClear(nav, end, spot, -1, last)) pts.push(spot);
  }
  return pts;
}

/** Which connected patch of drivable ground each nav cell is on (-1: impassable): 4-neighbours, as A* steps (a diagonal
 * step never cuts a corner, so it joins only cells already joined round it). */
function components(nav: Nav): Int32Array {
  if (nav.comp) return nav.comp;
  const n = NAV_N * NAV_N, comp = new Int32Array(n).fill(-1), stack: number[] = [];
  let next = 0;
  for (let start = 0; start < n; start++) {
    if (comp[start] >= 0 || !passable(nav, start)) continue;
    comp[start] = next;
    stack.push(start);
    while (stack.length > 0) {
      const i = stack.pop() ?? 0, x = i % NAV_N, z = (i - x) / NAV_N;
      for (const j of [x > 0 ? i - 1 : -1, x < NAV_N - 1 ? i + 1 : -1, z > 0 ? i - NAV_N : -1, z < NAV_N - 1 ? i + NAV_N : -1]) {
        if (j >= 0 && comp[j] < 0 && passable(nav, j)) { comp[j] = next; stack.push(j); }
      }
    }
    next++;
  }
  nav.comp = comp;
  return comp;
}

/**
 * Which patch of drivable ground a point is on, as `findPath` reads it (a start: its own cell or the nearest it can step to
 * within 2; a goal: the nearest within 3), or -1 if none. Two points a cart can drive between share one; O(1) once the land's patches
 * are worked out (once per nav grid).
 */
export function reachOf(s: GameState, p: Point2, as: 'start' | 'goal'): number {
  const nav = navFor(s), comp = components(nav);
  const i = as === 'start' ? startCell(nav, p) : nearestPassable(nav, p.x, p.z, 3);
  return i === undefined ? -1 : comp[i];
}

/** Which patch of drivable ground nav cell `i` is on (-1: impassable), on the nav grid as it stands. */
export function navComponent(s: GameState, i: number): number {
  return components(navFor(s))[i];
}

/** The ground under a point, for a moving cart: its speed and drain factors (open meadow if off the grid). */
export function groundAt(s: GameState, x: number, z: number): { speed: number; drain: number; onTrack: boolean } {
  const nav = navFor(s), i = navCellOf(x, z);
  if (!passable(nav, i)) return { speed: GROUND.meadow.speed, drain: GROUND.meadow.drain, onTrack: false };
  return { speed: nav.speed[i], drain: nav.drain[i], onTrack: nav.track[i] === 1 };
}

/**
 * Where carts stop at a building: before its door (its front), or another side if that's blocked; null if none is free.
 * A stop across water from the building (its door faces a narrow unbridged brook, the stop on the far bank) counts only if
 * no side has a stop on its own bank, so carts load where they can drive up to it, never over the water. Given a patch of
 * drivable ground (`reach`, reachOf), only a stop on that patch: a cart weighs every side it can reach, not just the first.
 */
export function dockOf(s: GameState, t: { kind: keyof typeof CATALOG; x: number; z: number; yaw: number }, reach?: number): Point2 | null {
  const nav = navFor(s), d = CATALOG[t.kind], out = 1.8;
  const local = (lx: number, lz: number) => toWorld(t.x, t.z, t.yaw, lx, lz);
  // A water wheel's front is in the brook: its door is round the back.
  const sides: Point2[] = d.onBank
    ? [local(d.offX, d.lo[1] - out), local(d.lo[0] - out, d.core.offZ), local(d.hi[0] + out, d.core.offZ)]
    : [local(d.offX, d.hi[1] + out), local(d.hi[0] + out, d.offZ), local(d.lo[0] - out, d.offZ), local(d.offX, d.lo[1] - out)];
  const centre = local(d.core.offX, d.core.offZ), own = navCellOf(centre.x, centre.z), comp = components(nav);
  // The first free stop (a side's own spot, else the drivable cell nearest one) that `ok` allows.
  const find = (ok: (p: Point2, i: number) => boolean): Point2 | null => {
    for (const p of sides) {
      const i = navCellOf(p.x, p.z);
      if (passable(nav, i) && ok(p, i)) return p;
    }
    for (const p of sides) {
      const i = nearestPassable(nav, p.x, p.z, 2, (j) => ok(navCenter(j), j));
      if (i !== undefined) return navCenter(i);
    }
    return null;
  };
  const dry = (p: Point2) => stepDry(nav, centre, p, own), onPatch = (i: number) => reach === undefined || comp[i] === reach;
  const bank = find((p, i) => dry(p) && onPatch(i));
  if (bank || (reach !== undefined && find(dry))) return bank;
  return find((_p, i) => onPatch(i));
}
