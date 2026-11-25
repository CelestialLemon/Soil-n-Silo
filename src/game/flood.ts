// Floods and overflow swales (Milestone 4). After sustained heavy rain, or in a spring spate, the brook and pond stand
// higher (the weather's `floodSurge`, weather.ts) and spill out over the low ground beside them: never far (the water
// thins as it spreads, so a flood reaches some FLOOD_MAX / FLOOD_FALL metres at most), and never over a rise higher than
// the water. Flooded fields pause, deep water cuts off unbridged cart routes, and shallow water makes mud.
//
// An overflow swale is a rill the player dug off the brook that carries water well away downhill: it gives the rising
// water somewhere to go, so the flood stands lower all round its intake and along it. Dig one to keep a low meadow or a
// track dry through a storm.
//
// The flood is drawn into the live water layer (`grid.waterLevel`, so brush3d draws it as water) with its depth in
// `grid.flood`; the natural water (`baseWaterLevel`) is never touched, so the water goes back exactly as it was.
import type { Channel, GameState } from './state.ts';
import { type Grid, isWet } from './grid.ts';
import { clamp, polylineDistance, smoothstep, type Point2 } from './geom.ts';

/** How much a flood's surface falls per metre as it spreads from the bank, m/m. */
export const FLOOD_FALL = 0.02;
/** The shallowest water counted as flood, m. */
export const FLOOD_MIN = 0.02;
/** Flood water deeper than this cuts off a cart route (unless bridged), m. */
export const FLOOD_DEEP = 0.12;
/** A surge move smaller than this leaves the water layer as it is, m. */
export const FLOOD_STEP = 0.02;
/** What an overflow swale takes off the surge near it, m; fully within SWALE_NEAR of it, fading out by SWALE_FAR. */
export const SWALE_RELIEF = 0.18, SWALE_NEAR = 6, SWALE_FAR = 16;
/** What makes a rill an overflow swale: a flowing reach this long, its water falling this far from its intake. */
export const SWALE_MIN_LENGTH = 8, SWALE_MIN_DROP = 0.25;
/** A field counts as flooded when this share of it lies under flood water. */
export const FIELD_FLOODED = 0.25;

/** A rill that relieves a flood: the flowing reach of its centreline. */
export interface Swale { channelId: number; path: Point2[]; drop: number; wetLength: number }

/** Whether a point lies on (or right beside) the natural brook or pond. */
function nearNaturalWater(g: Grid, p: Point2): boolean {
  const ix = Math.floor((p.x - g.x0) / g.cell), iz = Math.floor((p.z - g.z0) / g.cell);
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    const x = ix + dx, z = iz + dz;
    if (x >= 0 && z >= 0 && x < g.nx && z < g.nz && isWet(g.baseWaterLevel[z * g.nx + x])) return true;
  }
  return false;
}

/**
 * The rill's overflow swale, if it is one: tapped off the brook or pond, flowing far enough, and carrying the water away to
 * lower ground: the far end of its flowing reach stands SWALE_MIN_DROP or more below its intake (onto lower land, into a
 * lower basin or a reach of the brook well downstream). A loop that only dips and comes back to the same water gives the
 * flood nowhere to go, so it is no swale, however low its middle runs.
 */
export function swaleOf(s: GameState, c: Channel): Swale | undefined {
  const f = c.flow, g = s.grid;
  if (f.length < 2) return undefined;
  // Its intake is whichever end meets the natural water, with water flowing from there (the higher, if both do).
  const first = f[0], last = f[f.length - 1];
  const fromStart = first.wet && nearNaturalWater(g, first), fromEnd = last.wet && nearNaturalWater(g, last);
  if (!fromStart && !fromEnd) return undefined;
  const samples = fromStart && (!fromEnd || first.waterLevel >= last.waterLevel) ? f : [...f].reverse();
  const path: Point2[] = [];
  let wetLength = 0, k = 0;
  for (; k < samples.length && samples[k].wet; k++) {
    const p = samples[k];
    if (k > 0) wetLength += Math.hypot(p.x - samples[k - 1].x, p.z - samples[k - 1].z);
    path.push({ x: p.x, z: p.z });
  }
  // Where its flowing water ends up, against where it was taken off.
  const drop = samples[0].waterLevel - samples[k - 1].waterLevel;
  return wetLength >= SWALE_MIN_LENGTH && drop >= SWALE_MIN_DROP ? { channelId: c.id, path, drop, wetLength } : undefined;
}

/** Every overflow swale the player has dug. */
export const swalesOf = (s: GameState): Swale[] => s.channels.map((c) => swaleOf(s, c)).filter((v) => v !== undefined);

/** How much the swales take off the surge at a point, m (0..SWALE_RELIEF). */
export function swaleRelief(swales: readonly Swale[], x: number, z: number): number {
  let best = 0;
  for (const sw of swales) {
    if (sw.path.length < 2) continue;
    const d = polylineDistance(x, z, sw.path).d;
    best = Math.max(best, SWALE_RELIEF * (1 - smoothstep(SWALE_NEAR, SWALE_FAR, d)));
  }
  return best;
}

/** A cell's ground height: the mean of its corners. */
const cellGround = (g: Grid, ix: number, iz: number) => {
  const W = g.nx + 1, i = iz * W + ix;
  return (g.height[i] + g.height[i + 1] + g.height[i + W] + g.height[i + W + 1]) / 4;
};

/**
 * Lays a flood of `surge` metres over the live water `level` (already holding the brook, pond and flowing rills): the
 * natural water rises by the surge (less what the swales near it relieve) and spills over the low ground next to it,
 * thinning as it spreads. Writes each cell's flood depth into `depth` (0 where it's dry or natural water).
 */
export function overlayFlood(s: GameState, surge: number, level: Float32Array, depth: Float32Array): void {
  depth.fill(0);
  if (!(surge > FLOOD_MIN)) return;
  const g = s.grid, nx = g.nx, nz = g.nz, n = nx * nz, swales = swalesOf(s);
  const relief = (ix: number, iz: number) => swales.length ? swaleRelief(swales, g.x0 + (ix + 0.5) * g.cell, g.z0 + (iz + 0.5) * g.cell) : 0;
  // The flood's surface on each cell, spreading out from the natural water: each cell's surface no higher than the cell
  // it came from, nor than the water it spilled from risen by the surge (less what a swale relieves there) and thinning
  // with the distance. Spread highest surface first (a Dijkstra on the head, as the rills' water in flow.ts), and a higher
  // surface reached later always supersedes a lower one, so a low bank nearby never keeps a higher flood from a cell.
  const surf = new Float32Array(n).fill(-Infinity), dist = new Float32Array(n).fill(Infinity), origin = new Float32Array(n);
  // A max-heap of (surface, distance, cell) entries; an entry the cell has since bettered is skipped when it comes up.
  const hs: number[] = [], hd: number[] = [], hi: number[] = [];
  const above = (a: number, b: number) => hs[a] > hs[b] || (hs[a] === hs[b] && hd[a] < hd[b]);
  const swap = (a: number, b: number) => {
    [hs[a], hs[b]] = [hs[b], hs[a]]; [hd[a], hd[b]] = [hd[b], hd[a]]; [hi[a], hi[b]] = [hi[b], hi[a]];
  };
  const push = (i: number) => {
    hs.push(surf[i]); hd.push(dist[i]); hi.push(i);
    let k = hs.length - 1;
    while (k > 0) { const p = (k - 1) >> 1; if (!above(k, p)) break; swap(k, p); k = p; }
  };
  const pop = (): number => {
    const top = { s: hs[0], d: hd[0], i: hi[0] }, end = hs.length - 1;
    swap(0, end); hs.pop(); hd.pop(); hi.pop();
    let k = 0;
    for (;;) {
      const l = 2 * k + 1, r = l + 1;
      let m = k;
      if (l < hs.length && above(l, m)) m = l;
      if (r < hs.length && above(r, m)) m = r;
      if (m === k) break;
      swap(m, k); k = m;
    }
    return top.s === surf[top.i] && top.d === dist[top.i] ? top.i : -1;
  };
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
    const i = iz * nx + ix;
    if (!isWet(g.baseWaterLevel[i])) continue;
    const rise = Math.max(0, surge - relief(ix, iz));
    surf[i] = g.baseWaterLevel[i] + rise;
    origin[i] = g.baseWaterLevel[i];
    dist[i] = 0;
    if (level[i] < surf[i]) level[i] = surf[i];
    push(i);
  }
  const reach = surge / FLOOD_FALL + 1;
  while (hs.length > 0) {
    const i = pop();
    if (i < 0) continue;
    const ix = i % nx, iz = (i - ix) / nx;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dz) continue;
      const jx = ix + dx, jz = iz + dz;
      if (jx < 0 || jz < 0 || jx >= nx || jz >= nz) continue;
      const j = jz * nx + jx;
      if (isWet(g.baseWaterLevel[j])) continue;
      const d = dist[i] + (dx && dz ? Math.SQRT2 : 1) * g.cell;
      if (d > reach) continue;
      const ground = cellGround(g, jx, jz);
      const top = Math.fround(Math.min(surf[i], origin[i] + Math.max(0, surge - relief(jx, jz)) - FLOOD_FALL * d));
      if (top - ground <= FLOOD_MIN) continue;
      if (top > surf[j] + 1e-4 || (top >= surf[j] - 1e-6 && d < dist[j] - 1e-6)) {
        surf[j] = top; dist[j] = Math.fround(d); origin[j] = origin[i];
        push(j);
      }
    }
  }
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
    const i = iz * nx + ix;
    if (!Number.isFinite(surf[i]) || isWet(g.baseWaterLevel[i])) continue;
    const dp = surf[i] - cellGround(g, ix, iz);
    if (dp <= FLOOD_MIN) continue;
    depth[i] = dp;
    if (level[i] < surf[i]) level[i] = surf[i];
  }
}

/** Notes which fields stand under flood water now. Returns whether any field's state changed. */
export function markFloodedFields(s: GameState): boolean {
  const g = s.grid;
  let changed = false;
  for (const f of s.fields) {
    let wet = 0;
    for (let iz = f.bounds.z0; iz <= f.bounds.z1; iz++) for (let ix = f.bounds.x0; ix <= f.bounds.x1; ix++) {
      const i = iz * g.nx + ix;
      if (g.fieldOf[i] === f.id && g.flood[i] > FLOOD_MIN) wet++;
    }
    const flooded = wet >= FIELD_FLOODED * Math.max(1, f.cellCount);
    if (flooded !== f.flooded) { f.flooded = flooded; changed = true; }
  }
  return changed;
}

/** The surge the water layer should be drawn with: none below FLOOD_MIN. */
export const appliedSurge = (surge: number) => (surge > FLOOD_MIN ? clamp(surge, 0, 1) : 0);

/** Whether the flood has moved far enough from what the water layer shows to redraw it. */
export function floodMoved(s: GameState): boolean {
  const next = appliedSurge(s.sim.weather.floodSurge), was = s.sim.floodApplied;
  return next === 0 ? was !== 0 : Math.abs(next - was) >= FLOOD_STEP;
}
