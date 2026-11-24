// The continuous terrain the game hands the renderer (setTerrain, docs/API.md): a grid of vertex heights in metres, two
// triangles a cell, with no levels, no terrace fit and no bed sunk under it (the game's heights already hold its brooks'
// beds, its ponds' basins, its rills' cuts and its buildings' pads). Plain data, its checks, and the one way its height is
// read between the grid's points, with no drawing, so the game's rules and tests load it in Node (shared.ts) and stand
// their things on exactly the triangles brush3d draws (land/terrain.ts).
import type { Beyond, LandRect } from './map.ts';

/**
 * The terrain, as the game sends it (setTerrain): `nx` by `nz` cells `cell` metres square, the north-west corner at
 * (x0, z0); `height` the (nx + 1) × (nz + 1) heights of their corners (metres), row by row along z, each row along x
 * (vertex (ix, iz) at (x0 + ix·cell, z0 + iz·cell) is `height[iz·(nx + 1) + ix]`); and per cell (nx × nz, the same order)
 * what covers it, what ground it is and whether people have worked it.
 */
export interface TerrainMap {
  nx: number; nz: number; cell: number; x0: number; z0: number;
  /** The cells' corners' heights (metres): the ground as drawn, its beds, cuts and pads already in it. */
  height: Float32Array;
  /** What covers each cell (LAND_COVER: grass, bare, track, rock, woods, water, rill). */
  cover: Uint8Array;
  /** What ground each cell is (LAND_GROUND: a subtle tint; loam if left out). */
  ground?: Uint8Array;
  /** The cells people have worked (1; else 0): a field's bed, a yard. Painted as turned earth, with no meadow drift. */
  worked?: Uint8Array;
  /** The map, in cells: the part the player builds on; the country round it is drawn duller (all of it if left out). */
  map?: LandRect;
  /** The country past the terrain, as LandMap's (none: the terrain's edge is the world's). */
  beyond?: Beyond | null;
}

/**
 * New values for a rectangle of the terrain's cells (updateTerrain): `height` the (width + 1) × (height + 1) corners of the
 * rectangle's cells (so the corners on its edge, shared with the cells round it, too), the rest per cell over the
 * rectangle; any left out stay.
 */
export interface TerrainPatch { height?: Float32Array; cover?: Uint8Array; ground?: Uint8Array; worked?: Uint8Array }

/** How many cells a side the terrain is drawn in chunks of: about 16 m (16 cells at 1 m), at least 8. */
export const terrainChunkCells = (cell: number) => Math.max(8, Math.round(16 / cell));

/** Throws if a terrain's arrays don't fit its size (a programmer's bug, not the player's). */
export function checkTerrain(m: TerrainMap) {
  if (!(m.nx > 0 && m.nz > 0 && m.cell > 0) || !Number.isInteger(m.nx) || !Number.isInteger(m.nz)) throw new Error(`setTerrain: a terrain ${m.nx} x ${m.nz}, cell ${m.cell}`);
  checkTerrainArrays('setTerrain', m.nx, m.nz, m);
  if (!m.height) throw new Error('setTerrain: no heights');
  if (!m.cover) throw new Error('setTerrain: no cover');
  const r = m.map;
  if (r && (r.x < 0 || r.y < 0 || r.width < 0 || r.height < 0 || r.x + r.width > m.nx || r.y + r.height > m.nz)) throw new Error('setTerrain: the map is not inside the terrain');
  const b = m.beyond;
  if (b && (b.nx < 2 || b.nz < 2 || b.cell <= 0 || b.height.length !== b.nx * b.nz)) throw new Error(`setTerrain: beyond's grid ${b.nx} x ${b.nz} has ${b.height.length} heights`);
}

/** Throws if a patch's arrays don't fit its rectangle, or the rectangle the terrain. */
export function checkTerrainPatch(m: Pick<TerrainMap, 'nx' | 'nz'>, r: LandRect, p: TerrainPatch) {
  if (r.x < 0 || r.y < 0 || r.width <= 0 || r.height <= 0 || r.x + r.width > m.nx || r.y + r.height > m.nz) throw new Error('updateTerrain: the rectangle is not inside the terrain');
  checkTerrainArrays('updateTerrain', r.width, r.height, p);
}

function checkTerrainArrays(call: string, w: number, h: number, a: TerrainPatch) {
  const n = w * h;
  const sizes: [string, { length: number } | undefined, number][] = [['height', a.height, (w + 1) * (h + 1)], ['cover', a.cover, n], ['ground', a.ground, n], ['worked', a.worked, n]];
  for (const [name, arr, want] of sizes) if (arr && arr.length !== want) throw new Error(`${call}: ${name} has ${arr.length} values for ${want}`);
  if (a.height) for (const v of a.height) if (!Number.isFinite(v)) throw new Error(`${call}: a height of ${v}`);
}

/**
 * The terrain's height (metres) at a point of the world (x, z), exactly as brush3d draws it: on the cell's two triangles,
 * split along the diagonal from its north-east corner to its south-west one (u + v = 1, u along x and v along z across
 * the cell). A point off the grid takes the height at the nearest point on its edge.
 *
 * - `u + v <= 1`, triangle (0,0)-(0,1)-(1,0): `h00 + u·(h10 − h00) + v·(h01 − h00)`
 * - otherwise, triangle (1,0)-(0,1)-(1,1): `h11 + (1 − u)·(h01 − h11) + (1 − v)·(h10 − h11)`
 */
export function sampleHeightfield(heights: Float32Array, nx: number, nz: number, cell: number, x0: number, z0: number, x: number, z: number): number {
  const fx = Math.min(nx, Math.max(0, (x - x0) / cell)), fz = Math.min(nz, Math.max(0, (z - z0) / cell));
  const ix = Math.min(nx - 1, Math.floor(fx)), iz = Math.min(nz - 1, Math.floor(fz)), u = fx - ix, v = fz - iz, row = nx + 1;
  const k = iz * row + ix, h00 = heights[k], h10 = heights[k + 1], h01 = heights[k + row], h11 = heights[k + row + 1];
  return u + v <= 1 ? h00 + u * (h10 - h00) + v * (h01 - h00) : h11 + (1 - u) * (h01 - h11) + (1 - v) * (h10 - h11);
}

/**
 * Where a line of sight from (ox, oy, oz) along (dx, dy, dz) first meets the terrain's triangles from above, as the
 * distance along it in units of the direction's length, or null if it misses. Exact: it walks the cells the line crosses
 * in order and meets each of their two triangles (the same as sampleHeightfield's), so a click on a 1 m rill's edge or a
 * hillside lands where it's drawn. Only the grid's own cells (not the country round it).
 */
export function hitHeightfield(heights: Float32Array, nx: number, nz: number, cell: number, x0: number, z0: number,
  ox: number, oy: number, oz: number, dx: number, dy: number, dz: number): number | null {
  // Where it's over the grid: its span along the line within the grid's square.
  let t0 = 0, t1 = Infinity;
  const spans: [number, number, number, number][] = [[ox, dx, x0, x0 + nx * cell], [oz, dz, z0, z0 + nz * cell]];
  for (const [o, d, lo, hi] of spans) {
    if (Math.abs(d) < 1e-12) { if (o < lo || o > hi) return null; continue; }
    const a = (lo - o) / d, b = (hi - o) / d;
    t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
  }
  if (t0 > t1) return null;
  // Straight down (or up): the height under it.
  if (Math.abs(dx) < 1e-12 && Math.abs(dz) < 1e-12) {
    if (dy >= 0) return null;
    const h = sampleHeightfield(heights, nx, nz, cell, x0, z0, ox, oz), t = (h - oy) / dy;
    return t >= 0 ? t : null;
  }
  // The cells along it in order (a grid walk), from where it comes over the grid.
  const row = nx + 1, inv = 1 / cell;
  const px = (ox + dx * t0 - x0) * inv, pz = (oz + dz * t0 - z0) * inv;
  let ix = Math.min(nx - 1, Math.max(0, Math.floor(px))), iz = Math.min(nz - 1, Math.max(0, Math.floor(pz)));
  const sx = dx > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
  const tdx = Math.abs(dx) < 1e-12 ? Infinity : cell / Math.abs(dx), tdz = Math.abs(dz) < 1e-12 ? Infinity : cell / Math.abs(dz);
  let nextX = Math.abs(dx) < 1e-12 ? Infinity : (x0 + (ix + (sx > 0 ? 1 : 0)) * cell - ox) / dx;
  let nextZ = Math.abs(dz) < 1e-12 ? Infinity : (z0 + (iz + (sz > 0 ? 1 : 0)) * cell - oz) / dz;
  for (let steps = 0; steps < 4 * (nx + nz) + 8; steps++) {
    const k = iz * row + ix, ax = x0 + ix * cell, az = z0 + iz * cell, bx = ax + cell, bz = az + cell;
    const h00 = heights[k], h10 = heights[k + 1], h01 = heights[k + row], h11 = heights[k + row + 1];
    // Its two triangles, the nearer hit (they don't overlap, seen from above, so at most one is met before the other).
    let best = Infinity;
    const a = triangle(ox, oy, oz, dx, dy, dz, ax, h00, az, ax, h01, bz, bx, h10, az);
    if (a !== null && a >= t0 - 1e-9) best = a;
    const b = triangle(ox, oy, oz, dx, dy, dz, bx, h10, az, ax, h01, bz, bx, h11, bz);
    if (b !== null && b >= t0 - 1e-9 && b < best) best = b;
    if (best < Infinity) return Math.max(0, best);
    if (nextX < nextZ) { ix += sx; if (ix < 0 || ix >= nx || nextX > t1) return null; nextX += tdx; }
    else { iz += sz; if (iz < 0 || iz >= nz || nextZ > t1) return null; nextZ += tdz; }
  }
  return null;
}

/**
 * Where a line meets a triangle (its corners listed to face up), coming down onto it (onto its top, not its underside),
 * as the distance along it; null if it misses (Möller–Trumbore).
 */
function triangle(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number,
  ax: number, ay: number, az: number, bx: number, by: number, bz: number, cx: number, cy: number, cz: number): number | null {
  const e1x = bx - ax, e1y = by - ay, e1z = bz - az, e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
  // Its upward normal, e1 × e2: only a line coming down onto it counts.
  const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
  if (nx * dx + ny * dy + nz * dz >= 0) return null;
  const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < 1e-14) return null;
  const inv = 1 / det, tx = ox - ax, ty = oy - ay, tz = oz - az, u = (tx * px + ty * py + tz * pz) * inv, e = 1e-9;
  if (u < -e || u > 1 + e) return null;
  const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) * inv;
  if (v < -e || u + v > 1 + e) return null;
  return (e2x * qx + e2y * qy + e2z * qz) * inv;
}
