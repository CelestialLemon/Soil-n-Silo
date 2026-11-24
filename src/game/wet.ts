// Wet banks: the dark, damp strip of soil along water. Moisture comes from the brook and pond and from rills where water
// actually flows (a dry rill wets nothing), fading out over WET_REACH metres. brush3d paints it on the ground (setGround).
import { addCell, type Grid, isWet, type Rect } from './grid.ts';
import { smoothstep } from './geom.ts';
import type { GameState } from './state.ts';

/** How far a bank's wetness reaches from the water, m. */
export const WET_REACH = 3.75;

/** The wet-bank moisture (0..1) for a grid's live water: 1 in the water, fading to 0 at WET_REACH from it. */
export function wetness(g: Grid): Float32Array {
  const n = g.nx * g.nz, d = new Float32Array(n).fill(Infinity);
  for (let i = 0; i < n; i++) if (isWet(g.waterLevel[i])) d[i] = 0;
  // A two-pass chamfer distance (steps of 1 and √2 cells): close to the true distance, and the same on every run.
  const D = Math.SQRT2, nx = g.nx, nz = g.nz;
  const relax = (i: number, j: number, w: number) => { const v = d[j] + w; if (v < d[i]) d[i] = v; };
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
    const i = iz * nx + ix;
    if (ix > 0) relax(i, i - 1, 1);
    if (iz > 0) {
      relax(i, i - nx, 1);
      if (ix > 0) relax(i, i - nx - 1, D);
      if (ix < nx - 1) relax(i, i - nx + 1, D);
    }
  }
  for (let iz = nz - 1; iz >= 0; iz--) for (let ix = nx - 1; ix >= 0; ix--) {
    const i = iz * nx + ix;
    if (ix < nx - 1) relax(i, i + 1, 1);
    if (iz < nz - 1) {
      relax(i, i + nx, 1);
      if (ix < nx - 1) relax(i, i + nx + 1, D);
      if (ix > 0) relax(i, i + nx - 1, D);
    }
  }
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) m[i] = d[i] === 0 ? 1 : 1 - smoothstep(0, WET_REACH, d[i] * g.cell);
  return m;
}

/** Recomputes the grid's moisture; returns the cells that changed. */
export function refreshWet(s: GameState): Rect | undefined {
  const g = s.grid, m = wetness(g);
  let dirty: Rect | undefined;
  for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
    const i = iz * g.nx + ix;
    if (m[i] !== g.moisture[i]) dirty = addCell(dirty, ix, iz);
  }
  g.moisture.set(m);
  return dirty;
}
