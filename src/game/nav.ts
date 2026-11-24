// Where an Electric Cart can drive, and how it gets there: a coarse 2 m grid over the land, worked out again whenever the
// land or what stands on it changes. Tracks and plank bridges are quick and easy on the battery; open meadow is slower
// and drains it harder; muddy ground by the water bogs a cart down; steep ground costs dear. Unbridged water, rills,
// rock, woods, hedgerows, tree trunks and buildings are walls. A* finds the cheapest way, then the path is pulled
// straight wherever a straight line costs no more, so carts follow curving tracks and run straight over bridges.
import { CATALOG } from './catalog.ts';
import { coreObb } from './earth.ts';
import { type Obb, obbDistance, type Point2, polylineDistance, toWorld } from './geom.ts';
import { BUILD_HALF, COVER, type Grid, slopeAt } from './grid.ts';
import type { GameState } from './state.ts';

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
  /** Cell paths found, by "from:to" (null: no way). */
  paths: Map<string, number[] | null>;
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
  return `${s.revision}|${s.hedges.length}:${hedges}|${s.plantedTrees.length}:${trees}`;
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
  const water = new Uint8Array(n), blocked = new Uint8Array(n), wet = new Float32Array(n);
  for (let cz = 0; cz < NAV_N; cz++) for (let cx = 0; cx < NAV_N; cx++) {
    const i = navIndex(cx, cz), c = navCenter(i);
    if (Math.abs(c.x) > BUILD_HALF + 1 || Math.abs(c.z) > BUILD_HALF + 1) { blocked[i] = 1; continue; }
    forFine(g, cx, cz, (k) => {
      const cv = g.cover[k];
      if (cv === COVER.rock || cv === COVER.woods) blocked[i] = 1;
      else if (cv === COVER.water || cv === COVER.rill) water[i] = 1;
      else if (cv === COVER.track) track[i] = 1;
      wet[i] = Math.max(wet[i], g.moisture[k]);
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
    const ground = track[i] ? GROUND.track : wet[i] > MUDDY ? GROUND.mud : GROUND.meadow;
    const c = navCenter(i), steep = !track[i] && slopeAt(g, c.x, c.z) > STEEP;
    cost[i] = ground.cost + (steep ? STEEP_COST : 0);
    speed[i] = ground.speed * (steep ? STEEP_SPEED : 1);
    drain[i] = ground.drain + (steep ? STEEP_DRAIN : 0);
  }
  return { key, cost, speed, drain, track, paths: new Map() };
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

/** The passable cell nearest a point, within `reach` cells (the point's own first). */
export function nearestPassable(nav: Nav, x: number, z: number, reach = 4): number | undefined {
  const cx = navCx(x), cz = navCz(z);
  let best: number | undefined, bestD = Infinity;
  for (let dz = -reach; dz <= reach; dz++) for (let dx = -reach; dx <= reach; dx++) {
    const ax = cx + dx, az = cz + dz;
    if (ax < 0 || az < 0 || ax >= NAV_N || az >= NAV_N) continue;
    const i = navIndex(ax, az);
    if (!passable(nav, i)) continue;
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

/** The cost of a straight line between two points, by the costliest cell it crosses (Infinity if any is impassable). */
function lineCost(nav: Nav, a: Point2, b: Point2): number {
  const len = Math.hypot(b.x - a.x, b.z - a.z), steps = Math.max(1, Math.ceil(len / 0.5));
  let worst = 0;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps, i = navCellOf(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t);
    worst = Math.max(worst, nav.cost[i]);
  }
  return worst;
}

/** Pulls a cell path straight wherever a straight line crosses nothing costlier than the cells it skips. */
function smooth(nav: Nav, cells: readonly number[]): Point2[] {
  const pts = cells.map(navCenter);
  if (pts.length <= 2) return pts;
  const out: Point2[] = [pts[0]];
  let i = 0;
  while (i < pts.length - 1) {
    let best = i + 1, worst = nav.cost[cells[i + 1]];
    for (let j = i + 2; j < pts.length; j++) {
      worst = Math.max(worst, nav.cost[cells[j]]);
      if (lineCost(nav, pts[i], pts[j]) <= worst + 1e-6) best = j;
      else if (j - best > 3) break;
    }
    out.push(pts[best]);
    i = best;
  }
  return out;
}

/** A drivable path of waypoints from one point to another, or null if no cart can get there. */
export function findPath(s: GameState, from: Point2, to: Point2): Point2[] | null {
  const nav = navFor(s);
  const a = passable(nav, navCellOf(from.x, from.z)) ? navCellOf(from.x, from.z) : nearestPassable(nav, from.x, from.z, 2) ?? navCellOf(from.x, from.z);
  const b = nearestPassable(nav, to.x, to.z, 3);
  if (b === undefined) return null;
  const cells = findCells(nav, a, b);
  if (!cells) return null;
  const pts = smooth(nav, cells);
  pts[0] = { x: from.x, z: from.z };
  if (pts.length === 1) pts.push(navCenter(b));
  const end = pts[pts.length - 1];
  // Finish at the exact spot if it's on drivable ground next to the last cell.
  if (passable(nav, navCellOf(to.x, to.z)) && Math.hypot(end.x - to.x, end.z - to.z) <= NAV_CELL * 1.5) pts[pts.length - 1] = { x: to.x, z: to.z };
  return pts;
}

/** The ground under a point, for a moving cart: its speed and drain factors (open meadow if off the grid). */
export function groundAt(s: GameState, x: number, z: number): { speed: number; drain: number; onTrack: boolean } {
  const nav = navFor(s), i = navCellOf(x, z);
  if (!passable(nav, i)) return { speed: GROUND.meadow.speed, drain: GROUND.meadow.drain, onTrack: false };
  return { speed: nav.speed[i], drain: nav.drain[i], onTrack: nav.track[i] === 1 };
}

/** Where carts stop at a building: before its door (its front), or another side if that's blocked; null if none is free. */
export function dockOf(s: GameState, t: { kind: keyof typeof CATALOG; x: number; z: number; yaw: number }): Point2 | null {
  const nav = navFor(s), d = CATALOG[t.kind], out = 1.8;
  const local = (lx: number, lz: number) => toWorld(t.x, t.z, t.yaw, lx, lz);
  // A water wheel's front is in the brook: its door is round the back.
  const sides: Point2[] = d.onBank
    ? [local(d.offX, d.lo[1] - out), local(d.lo[0] - out, d.core.offZ), local(d.hi[0] + out, d.core.offZ)]
    : [local(d.offX, d.hi[1] + out), local(d.hi[0] + out, d.offZ), local(d.lo[0] - out, d.offZ), local(d.offX, d.lo[1] - out)];
  for (const p of sides) if (passable(nav, navCellOf(p.x, p.z))) return p;
  for (const p of sides) {
    const i = nearestPassable(nav, p.x, p.z, 2);
    if (i !== undefined) return navCenter(i);
  }
  return null;
}
