// The live land, composed from the untouched valley and what the player built on it, always in this order:
//
//   1. The natural valley: `baseHeight` and `baseCover` (its brook, pond and rocks stay as they are).
//   2. Building pads: a flat core at the pad's `padTargetY` (the mean of the natural ground under it, fixed when placed),
//      easing over `padEase` metres into the slope round it. Never raising a natural brook or pond bed.
//   3. Rills: a shallow U-shaped cut along each rill's centreline (cover RILL), never inside a building's core.
//   4. Tracks (cover TRACK) and painted fields (cover FIELD) where the ground is clear.
//
// `recomposeEarth` rebuilds a rect of it from scratch, so removing or moving anything gives back the valley exactly.
import { CATALOG, type ThingDef } from './catalog.ts';
import { forCellsNear, forVerticesNear, lerp, type Obb, obbDistance, obbRect, pathRect, smoothstep, toWorld } from './geom.ts';
import { cellX, cellZ, clampRect, COVER, type Grid, isWet, type Rect, rectsOverlap, unionRect, vertexX, vertexZ } from './grid.ts';
import type { Channel, GameState, Thing, Track } from './state.ts';

/** How deep a dug rill's cut is along its centreline, m. */
export const CHANNEL_DEPTH = 0.35;
/** The rill's cut is full depth within this of its centreline, easing to nothing at CHANNEL_REACH, m. */
export const CHANNEL_FULL = 0.55;
export const CHANNEL_REACH = 1.25;
/** Cells whose centre lies within this of a rill's centreline are the rill (cover RILL, its water), m. */
export const RILL_HALF = 0.8;
/** A track's half width, m (1.8 m wide). */
export const TRACK_HALF = 0.9;

/** A thing's whole footprint on the ground. */
export function thingObb(t: Pick<Thing, 'kind' | 'x' | 'z' | 'yaw'>, grow = 0): Obb {
  const d = CATALOG[t.kind];
  const c = toWorld(t.x, t.z, t.yaw, d.offX, d.offZ);
  return { cx: c.x, cz: c.z, hw: d.halfW + grow, hd: d.halfD + grow, yaw: t.yaw };
}

/** The core of a thing's footprint: what its pad holds flat (all of it but a water wheel's race). */
export function coreObb(t: Pick<Thing, 'kind' | 'x' | 'z' | 'yaw'>): Obb {
  const d = CATALOG[t.kind].core;
  const c = toWorld(t.x, t.z, t.yaw, d.offX, d.offZ);
  return { cx: c.x, cz: c.z, hw: d.halfW, hd: d.halfD, yaw: t.yaw };
}

export const settles = (d: ThingDef) => d.padEase > 0;

/** The cells a thing's footprint and pad may change. */
export function thingRect(g: Grid, t: Pick<Thing, 'kind' | 'x' | 'z' | 'yaw'>): Rect | undefined {
  const d = CATALOG[t.kind];
  return unionRect(obbRect(g, thingObb(t), 1), obbRect(g, coreObb(t), d.padEase + 1));
}
export const channelRect = (g: Grid, c: Pick<Channel, 'path'>) => pathRect(g, c.path, CHANNEL_REACH + 1);
export const trackRect = (g: Grid, t: Pick<Track, 'path'>) => pathRect(g, t.path, TRACK_HALF + 1);

/** The height a pad at this spot holds: the mean of the natural ground at the vertices under its core (its centre if none). */
export function padTarget(g: Grid, t: Pick<Thing, 'kind' | 'x' | 'z' | 'yaw'>): number {
  const core = coreObb(t), r = obbRect(g, core);
  let sum = 0, n = 0;
  if (r) for (let iz = r.z0; iz <= r.z1 + 1; iz++) for (let ix = r.x0; ix <= r.x1 + 1; ix++) {
    if (obbDistance(core, vertexX(g, ix), vertexZ(g, iz)) > 0) continue;
    sum += g.baseHeight[iz * (g.nx + 1) + ix];
    n++;
  }
  if (n > 0) return sum / n;
  const c = toWorld(t.x, t.z, t.yaw, CATALOG[t.kind].core.offX, CATALOG[t.kind].core.offZ);
  return baseAt(g, c.x, c.z);
}

const baseAt = (g: Grid, x: number, z: number) => {
  const ix = Math.min(g.nx, Math.max(0, Math.round((x - g.x0) / g.cell))), iz = Math.min(g.nz, Math.max(0, Math.round((z - g.z0) / g.cell)));
  return g.baseHeight[iz * (g.nx + 1) + ix];
};

/** Whether a vertex touches a natural water cell: a brook or pond bed, which pads never raise. */
function isBedVertex(g: Grid, ix: number, iz: number): boolean {
  for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) {
    const cx = ix + dx, cz = iz + dz;
    if (cx < 0 || cz < 0 || cx >= g.nx || cz >= g.nz) continue;
    if (isWet(g.baseWaterLevel[cz * g.nx + cx])) return true;
  }
  return false;
}

/** The settled buildings' cores, which nothing cuts into. */
export function protectedCores(s: GameState): Obb[] {
  return s.things.filter((t) => settles(CATALOG[t.kind])).map(coreObb);
}

/** Whether a point lies inside a settled building's core. */
export const inCore = (cores: readonly Obb[], x: number, z: number) => cores.some((o) => obbDistance(o, x, z) <= 0);

/** How deep a rill cuts at `d` metres from its centreline. */
export const channelCut = (d: number) => CHANNEL_DEPTH * (1 - smoothstep(CHANNEL_FULL, CHANNEL_REACH, d));

/**
 * Rebuilds the live land (heights, covers, the worked-pad mask) over a rect of cells from the natural valley and
 * everything built on it. The rect should hold the old and the new reach of whatever changed.
 */
export function recomposeEarth(s: GameState, rect: Rect): void {
  const g = s.grid, r = clampRect(g, rect);
  if (!r) return;
  const W = g.nx + 1, vx0 = r.x0, vz0 = r.z0, vx1 = r.x1 + 1, vz1 = r.z1 + 1;
  const cores = protectedCores(s);

  // 1. The natural valley.
  for (let iz = vz0; iz <= vz1; iz++) for (let ix = vx0; ix <= vx1; ix++) g.height[iz * W + ix] = g.baseHeight[iz * W + ix];
  for (let iz = r.z0; iz <= r.z1; iz++) for (let ix = r.x0; ix <= r.x1; ix++) g.worked[iz * g.nx + ix] = 0;

  // 2. Building pads, in the order they were placed.
  const pads = s.things.filter((t) => settles(CATALOG[t.kind])).sort((a, b) => a.id - b.id);
  for (const t of pads) {
    const ease = CATALOG[t.kind].padEase, core = coreObb(t);
    const pr = obbRect(g, core, ease + 1);
    if (!pr || !rectsOverlap(pr, { x0: vx0 - 1, z0: vz0 - 1, x1: vx1, z1: vz1 })) continue;
    const weight = (x: number, z: number) => {
      const sd = obbDistance(core, x, z);
      return sd <= 0 ? 1 : sd >= ease ? 0 : 1 - smoothstep(0, ease, sd);
    };
    for (let iz = Math.max(vz0, pr.z0); iz <= Math.min(vz1, pr.z1 + 1); iz++) for (let ix = Math.max(vx0, pr.x0); ix <= Math.min(vx1, pr.x1 + 1); ix++) {
      const w = weight(vertexX(g, ix), vertexZ(g, iz));
      if (w <= 0) continue;
      const i = iz * W + ix, h = g.height[i];
      const target = lerp(h, t.padTargetY, w);
      g.height[i] = isBedVertex(g, ix, iz) ? Math.min(h, target) : target;
    }
    for (let iz = Math.max(r.z0, pr.z0); iz <= Math.min(r.z1, pr.z1); iz++) for (let ix = Math.max(r.x0, pr.x0); ix <= Math.min(r.x1, pr.x1); ix++) {
      const w = Math.round(weight(cellX(g, ix), cellZ(g, iz)) * 255), i = iz * g.nx + ix;
      if (w > g.worked[i]) g.worked[i] = w;
    }
  }
  for (let iz = vz0; iz <= vz1; iz++) for (let ix = vx0; ix <= vx1; ix++) g.landHeight[iz * W + ix] = g.height[iz * W + ix];

  // 3. Rills: cut below the land, never into a building's core.
  const inRect = (ix: number, iz: number) => ix >= vx0 && ix <= vx1 && iz >= vz0 && iz <= vz1;
  const vrect = { x0: vx0 - 1, z0: vz0 - 1, x1: vx1, z1: vz1 };
  for (const c of s.channels) {
    const cr = channelRect(g, c);
    if (!cr || !rectsOverlap(cr, vrect)) continue;
    forVerticesNear(g, c.path, CHANNEL_REACH, (ix, iz, d) => {
      if (!inRect(ix, iz) || inCore(cores, vertexX(g, ix), vertexZ(g, iz))) return;
      const i = iz * W + ix, cut = g.landHeight[i] - channelCut(d);
      if (cut < g.height[i]) g.height[i] = cut;
    });
  }

  recomposeCover(s, r);
}

/** Rebuilds the covers over a rect of cells: nature's, then rills, tracks, building pads and fields. */
export function recomposeCover(s: GameState, rect: Rect): void {
  const g = s.grid, r = clampRect(g, rect);
  if (!r) return;
  const w = r.x1 - r.x0 + 1;
  // 0 nothing, 1 track, 2 rill: what the strokes put on each cell of the rect.
  const mark = new Uint8Array(w * (r.z1 - r.z0 + 1));
  const at = (ix: number, iz: number) => ix >= r.x0 && ix <= r.x1 && iz >= r.z0 && iz <= r.z1;
  for (const t of s.tracks) {
    const tr = trackRect(g, t);
    if (tr && rectsOverlap(tr, r)) forCellsNear(g, t.path, TRACK_HALF, (ix, iz) => { if (at(ix, iz)) mark[(iz - r.z0) * w + ix - r.x0] = 1; });
  }
  for (const c of s.channels) {
    const cr = channelRect(g, c);
    if (cr && rectsOverlap(cr, r)) forCellsNear(g, c.path, RILL_HALF, (ix, iz) => { if (at(ix, iz)) mark[(iz - r.z0) * w + ix - r.x0] = 2; });
  }
  for (let iz: number = r.z0; iz <= r.z1; iz++) for (let ix: number = r.x0; ix <= r.x1; ix++) {
    const i = iz * g.nx + ix, base = g.baseCover[i], m = mark[(iz - r.z0) * w + ix - r.x0];
    let c: number = base;
    if (base !== COVER.water && base !== COVER.rock) {
      if (m === 2) c = COVER.rill;
      else if (m === 1) c = COVER.track;
      else if (g.fieldOf[i] !== 0) c = COVER.field;
      else if (g.worked[i] >= 200) c = COVER.bare;
    }
    g.cover[i] = c;
  }
}
