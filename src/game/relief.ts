// The lie of the land: every tile stands at a whole level (0 at the valley floor) and is either flat or a ramp, which rises
// one level across the tile towards one side. Where two tiles meet, the ground either joins (the two edges are at the same
// heights) or there is a cliff. Trucks cross only where it joins; a cliff also stops goods going uphill between
// neighbours. Water tiles carry a level too: the level of their surface, the same as the banks they lie between.
//
// These are pure rules on the arrays a map carries (`level`, `ramp`), shared by the map generator, the simulation, the
// earthworks and the view.

/** The highest level a tile can stand at on the map. */
export const MAX_LEVEL = 4;
/** `ramp` of a flat tile; otherwise a ramp's `Dir`, the side it rises towards (0 north, 1 east, 2 south, 3 west). */
export const FLAT = -1;

/** The four sides as tile steps: north (−y), east (+x), south (+y), west (−x). */
export const SIDES: readonly (readonly [number, number])[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/** What relief needs of a map (or of the land around it): its size and each tile's level and ramp, row by row. */
export interface Relief { width: number; height: number; level: ArrayLike<number>; ramp: ArrayLike<number> }

const at = (r: Relief, x: number, y: number) => y * r.width + x;
export const inRelief = (r: Relief, x: number, y: number) => x >= 0 && y >= 0 && x < r.width && y < r.height;

/**
 * The ground's height (in levels) at a tile's four corners: north-west, north-east, south-east, south-west. A flat tile is
 * level at its level L; a ramp is at L on the side it rises from and L + 1 on the side it rises towards.
 */
export function corners(r: Relief, x: number, y: number): [number, number, number, number] {
  const i = at(r, x, y), l = r.level[i], d = r.ramp[i];
  if (d === FLAT) return [l, l, l, l];
  const u = l + 1;
  switch (d) {
    case 0: return [u, u, l, l];
    case 1: return [l, u, u, l];
    case 2: return [l, l, u, u];
    default: return [u, l, l, u];
  }
}

/** A tile's height (in levels) at its centre: its level when flat, half a level up on a ramp. */
export const centreLevel = (r: Relief, x: number, y: number) => {
  const i = at(r, x, y);
  return r.level[i] + (r.ramp[i] === FLAT ? 0 : 0.5);
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

/** The ground's height (in levels) at a point (x, y in tiles, a tile's centre at +0.5), on the tile under it. */
export function heightAt(r: Relief, px: number, py: number): number {
  const x = Math.min(r.width - 1, Math.max(0, Math.floor(px))), y = Math.min(r.height - 1, Math.max(0, Math.floor(py)));
  const u = Math.min(1, Math.max(0, px - x)), v = Math.min(1, Math.max(0, py - y));
  const [nw, ne, se, sw] = corners(r, x, y);
  return (nw * (1 - u) + ne * u) * (1 - v) + (sw * (1 - u) + se * u) * v;
}

/** Whether every tile of the square at (x, y), `n` tiles a side, is flat and at one level (false if any is off the map). */
export function isFlat(r: Relief, x: number, y: number, n: number): boolean {
  if (!inRelief(r, x, y) || !inRelief(r, x + n - 1, y + n - 1)) return false;
  const l = r.level[at(r, x, y)];
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) {
    const i = at(r, tx, ty);
    if (r.ramp[i] !== FLAT || r.level[i] !== l) return false;
  }
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
