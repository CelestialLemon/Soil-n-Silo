// The lie of the land: every tile has a height (in levels, 0 at the valley floor) at each of its four corners, so the
// ground slopes across tiles in any direction. Where two tiles meet, the ground either joins (their corners along the
// shared side are at the same heights) or there is a cliff. Trucks cross only where it joins, and only on gentle ground (a
// tile whose corners differ by at most a level); a steep tile (two levels) is a bank they can't drive. Water tiles are flat
// at the level of their surface.
//
// These are pure rules on the array a map carries (`corner`), shared by the map generator, the simulation, the earthworks
// and the view.

/** The highest a corner can stand on the map. */
export const MAX_LEVEL = 16;
/** The most a tile's corners may differ by: a steep tile. Gentle ground differs by at most a level. */
export const STEEP = 2;

/** The four sides as tile steps: north (−y), east (+x), south (+y), west (−x). */
export const SIDES: readonly (readonly [number, number])[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/**
 * What relief needs of a map (or of the land around it): its size and each tile's corner heights, four a tile (north-west,
 * north-east, south-east, south-west), row by row.
 */
export interface Relief { width: number; height: number; corner: ArrayLike<number> }

const at = (r: Relief, x: number, y: number) => y * r.width + x;
export const inRelief = (r: Relief, x: number, y: number) => x >= 0 && y >= 0 && x < r.width && y < r.height;

/** A tile's corner heights (levels): north-west, north-east, south-east, south-west. */
export function corners(r: Relief, x: number, y: number): [number, number, number, number] {
  const k = at(r, x, y) * 4, c = r.corner;
  return [c[k], c[k + 1], c[k + 2], c[k + 3]];
}

/** A tile's lowest corner (levels): the level of a flat tile, or of water's surface. */
export const baseLevel = (r: Relief, x: number, y: number) => Math.min(...corners(r, x, y));

/** How far a tile's corners differ (levels): 0 flat, 1 gentle, STEEP a bank. */
export const spanOf = (r: Relief, x: number, y: number) => { const c = corners(r, x, y); return Math.max(...c) - Math.min(...c); };

/** Whether trucks can drive over a tile's ground: its corners differ by at most a level. */
export const isGentle = (r: Relief, x: number, y: number) => spanOf(r, x, y) <= 1;

/**
 * A tile's height (in levels) at its centre, on the ground as it is drawn: the middle of the diagonal its top is split along
 * (`splitsNwSe`), which on a tile folded along that diagonal is not the mean of its corners.
 */
export const centreLevel = (r: Relief, x: number, y: number) => {
  const c = corners(r, x, y);
  return splitsNwSe(c) ? (c[0] + c[2]) / 2 : (c[1] + c[3]) / 2;
};

/**
 * The heights (in levels) of a tile's side at its two ends: the north and south sides west to east, the east and west sides
 * north to south. Two tiles join across a side when the side of one and the facing side of the other match.
 */
export function sideOf(r: Relief, x: number, y: number, side: number): [number, number] {
  const [nw, ne, se, sw] = corners(r, x, y);
  switch (side) {
    case 0: return [nw, ne];
    case 1: return [ne, se];
    case 2: return [sw, se];
    default: return [nw, sw];
  }
}

/** Whether the ground joins between a tile and its neighbour across `side` (false off the edge, or at a cliff). */
export function joins(r: Relief, x: number, y: number, side: number): boolean {
  const [dx, dy] = SIDES[side], nx = x + dx, ny = y + dy;
  if (!inRelief(r, x, y) || !inRelief(r, nx, ny)) return false;
  const a = sideOf(r, x, y, side), b = sideOf(r, nx, ny, (side + 2) % 4);
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * Whether a tile's top is drawn as two triangles split from north-west to south-east (else from north-east to south-west):
 * along the diagonal whose ends are closer in height, so a ridge or a hollow across the tile follows the ground's shape.
 */
export function splitsNwSe(c: readonly number[]) {
  const a = Math.abs(c[0] - c[2]), b = Math.abs(c[1] - c[3]);
  return a !== b ? a < b : c[0] + c[2] >= c[1] + c[3];
}

/**
 * The ground's height (in levels) at a point (x, y in tiles, a tile's centre at +0.5), on the tile under it: on the triangle
 * of the tile's top it falls in (`splitsNwSe`), as the ground is drawn.
 */
export function heightAt(r: Relief, px: number, py: number): number {
  const x = Math.min(r.width - 1, Math.max(0, Math.floor(px))), y = Math.min(r.height - 1, Math.max(0, Math.floor(py)));
  return heightOn(corners(r, x, y), px - x, py - y);
}

/**
 * The height over a tile with corner heights `c` (north-west, north-east, south-east, south-west) at (u, v) across it (0 to
 * 1 east and south, clamped to the tile), on the triangle of its top the point falls in.
 */
export function heightOn(c: readonly number[], u: number, v: number): number {
  const [nw, ne, se, sw] = c;
  u = Math.min(1, Math.max(0, u)); v = Math.min(1, Math.max(0, v));
  if (splitsNwSe(c)) return u >= v ? nw + (ne - nw) * u + (se - ne) * v : nw + (se - sw) * u + (sw - nw) * v;
  return u + v <= 1 ? nw + (ne - nw) * u + (sw - nw) * v : se + (sw - se) * (1 - u) + (ne - se) * (1 - v);
}

/** Whether every corner of the square at (x, y), `n` tiles a side, is at one level (false if any of it is off the map). */
export function isFlat(r: Relief, x: number, y: number, n: number): boolean {
  if (!inRelief(r, x, y) || !inRelief(r, x + n - 1, y + n - 1)) return false;
  const l = r.corner[at(r, x, y) * 4];
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) if (corners(r, tx, ty).some((c) => c !== l)) return false;
  return true;
}

/** Whether the ground joins between every two neighbouring tiles of the square at (x, y), `n` a side (no cliff inside it). */
export function isUnbroken(r: Relief, x: number, y: number, n: number): boolean {
  if (!inRelief(r, x, y) || !inRelief(r, x + n - 1, y + n - 1)) return false;
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) {
    if (tx + 1 < x + n && !joins(r, tx, ty, 1)) return false;
    if (ty + 1 < y + n && !joins(r, tx, ty, 2)) return false;
  }
  return true;
}

/**
 * The tiles meeting at the grid point (px, py) (the north-west corner of tile (px, py)) and the corner of each that lies
 * there (0 north-west … 3 south-west), those on the relief: the tile to its south-east, south-west, north-west, north-east.
 */
export function aroundPoint(r: Relief, px: number, py: number): { x: number; y: number; k: number }[] {
  const out: { x: number; y: number; k: number }[] = [];
  for (const [x, y, k] of [[px, py, 0], [px - 1, py, 1], [px - 1, py - 1, 2], [px, py - 1, 3]] as const) if (inRelief(r, x, y)) out.push({ x, y, k });
  return out;
}

/**
 * The tiles meeting at grid point (px, py) whose ground joins `from`'s there: `from` and those reached from it round the
 * point across sides that join (so one sheet of ground, not the foot of a cliff). `from` must touch the point.
 */
export function sheetAt(r: Relief, px: number, py: number, from: { x: number; y: number }): { x: number; y: number; k: number }[] {
  const all = aroundPoint(r, px, py), seen = new Set<number>();
  const start = all.findIndex((t) => t.x === from.x && t.y === from.y);
  if (start < 0) throw new Error(`sheetAt: tile ${from.x},${from.y} doesn't touch point ${px},${py}`);
  const stack = [start];
  seen.add(start);
  for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
    const t = all[top];
    for (let j = 0; j < all.length; j++) {
      if (seen.has(j)) continue;
      const o = all[j], side = SIDES.findIndex(([dx, dy]) => t.x + dx === o.x && t.y + dy === o.y);
      if (side >= 0 && joins(r, t.x, t.y, side)) { seen.add(j); stack.push(j); }
    }
  }
  return [...seen].map((j) => all[j]);
}

/**
 * How far each tile lies below the average of the land within `radius` tiles of it, in levels (negative on a rise, NaN where
 * `land` is 0): a hollow is deep, a crest negative. Judged against the ground round it, not the whole map, so a real hollow
 * shows on a map that climbs. The late frost settles by it (frost.ts) and the ground's clay and stony patches follow it (ground.ts).
 */
export function depthBelowRound(r: Relief, land: ArrayLike<number>, radius: number): Float64Array {
  const w = r.width, h = r.height, level = new Float64Array(w * h), depth = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (land[y * w + x]) level[y * w + x] = centreLevel(r, x, y);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!land[i]) { depth[i] = NaN; continue; }
    let sum = 0, n = 0;
    for (let dy = Math.max(-radius, -y); dy <= Math.min(radius, h - 1 - y); dy++) for (let dx = Math.max(-radius, -x); dx <= Math.min(radius, w - 1 - x); dx++) {
      const j = i + dy * w + dx;
      if (land[j] && dx * dx + dy * dy <= radius * radius) { sum += level[j]; n++; }
    }
    depth[i] = sum / n - level[i];
  }
  return depth;
}
