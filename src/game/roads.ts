import { TERRAIN } from './map.ts';
import { buildingAt, inMap, layoutOf, sizeOf, terrainAt, type Building, type GameState } from './state.ts';
import { runtimeOf } from './runtime.ts';

// The roads: trucks drive on any open tile (grass with nothing built on it), from tile centre to tile centre in 8
// directions, a diagonal only when both tiles beside it are open. A truck loads at an open tile next to a building (sharing
// an edge with it). Each building that trucks drive to has a distance field: how far every tile is from the nearest open
// tile next to it, by the shortest way. A truck follows the field downhill, so it always takes a shortest way. Fields are
// worked out when first asked for and dropped when the layout changes.

export interface Roads { layout: number; open: Uint8Array; fields: Map<number, Float64Array> }

const SQRT2 = Math.SQRT2;
/** The 8 neighbours: dx, dy, cost. */
const STEPS: [number, number, number][] = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, SQRT2], [1, -1, SQRT2], [-1, 1, SQRT2], [-1, -1, SQRT2]];

function roads(s: GameState): Roads {
  const layout = layoutOf(s);
  const rt = runtimeOf(s);
  let r = rt.roads;
  if (r && r.layout === layout) return r;
  const { width: w, height: h } = s.map;
  const open = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) open[y * w + x] = terrainAt(s, x, y) === TERRAIN.grass && !buildingAt(s, x, y) ? 1 : 0;
  r = { layout, open, fields: new Map() };
  rt.roads = r;
  return r;
}

/** Whether trucks can drive on a tile. */
export const isOpen = (s: GameState, x: number, y: number) => inMap(s, x, y) && roads(s).open[y * s.map.width + x] === 1;

/** The open tiles next to a building (sharing an edge with it), by index: north side west to east, then east, south, west. */
export function accessTiles(s: GameState, b: Building): number[] {
  const n = sizeOf(b), w = s.map.width, out: number[] = [];
  const at = (x: number, y: number) => { if (isOpen(s, x, y)) out.push(y * w + x); };
  for (let x = b.x; x < b.x + n; x++) at(x, b.y - 1);
  for (let y = b.y; y < b.y + n; y++) at(b.x + n, y);
  for (let x = b.x; x < b.x + n; x++) at(x, b.y + n);
  for (let y = b.y; y < b.y + n; y++) at(b.x - 1, y);
  return out;
}

/** The steps from tile i a truck can take: to open neighbours, diagonals only past two open tiles. */
function* neighbours(open: Uint8Array, w: number, h: number, i: number): Generator<[number, number]> {
  const x = i % w, y = (i - x) / w;
  for (const [dx, dy, c] of STEPS) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= w || ny >= h || !open[ny * w + nx]) continue;
    if (dx && dy && (!open[y * w + nx] || !open[ny * w + x])) continue;
    yield [ny * w + nx, c];
  }
}

/** How far every tile is from the open tiles next to a building (Infinity where trucks can't get there). */
export function distanceField(s: GameState, b: Building): Float64Array {
  const r = roads(s);
  let f = r.fields.get(b.id);
  if (f) return f;
  const { width: w, height: h } = s.map;
  f = new Float64Array(w * h).fill(Infinity);
  // Dijkstra from every access tile at once, with a binary heap of [distance, tile].
  const heap: [number, number][] = [];
  const push = (d: number, i: number) => {
    heap.push([d, i]);
    for (let k = heap.length - 1; k > 0;) {
      const p = (k - 1) >> 1;
      if (heap[p][0] <= heap[k][0]) break;
      [heap[p], heap[k]] = [heap[k], heap[p]]; k = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      for (let k = 0; ;) {
        const a = 2 * k + 1, c = a + 1;
        let m = k;
        if (a < heap.length && heap[a][0] < heap[m][0]) m = a;
        if (c < heap.length && heap[c][0] < heap[m][0]) m = c;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]]; k = m;
      }
    }
    return top;
  };
  for (const i of accessTiles(s, b)) { f[i] = 0; push(0, i); }
  while (heap.length) {
    const [d, i] = pop();
    if (d > f[i]) continue;
    for (const [j, c] of neighbours(r.open, w, h, i)) if (d + c < f[j]) { f[j] = d + c; push(d + c, j); }
  }
  r.fields.set(b.id, f);
  return f;
}

/** Tiles from a tile to the nearest open tile next to a building, by the shortest way (Infinity if there is none). */
export const distanceTo = (s: GameState, b: Building, tile: number) => distanceField(s, b)[tile];

/**
 * The tiles to drive through from `from` to the nearest open tile next to `b`, not counting `from` (empty when it is already
 * there), or null when there is no way.
 */
export function pathTo(s: GameState, b: Building, from: number): number[] | null {
  const f = distanceField(s, b), r = roads(s), { width: w, height: h } = s.map;
  if (!(f[from] < Infinity)) return null;
  const out: number[] = [];
  for (let i = from; f[i] > 0;) {
    let best = -1, bestD = Infinity;
    for (const [j, c] of neighbours(r.open, w, h, i)) if (f[j] + c < bestD) { bestD = f[j] + c; best = j; }
    if (best < 0 || f[best] >= f[i]) return null;
    out.push(best);
    i = best;
  }
  return out;
}

/** The shortest way from building a to building b: the tile a truck leaves a from, then the tiles it drives through. */
export function legPath(s: GameState, a: Building, b: Building): number[] | null {
  const f = distanceField(s, b);
  let start = -1;
  for (const i of accessTiles(s, a)) if (start < 0 || f[i] < f[start]) start = i;
  if (start < 0) return null;
  const p = pathTo(s, b, start);
  return p ? [start, ...p] : null;
}

/** The shortest way from building a's open tiles to building b's, in tiles (Infinity if there is none). */
export function legLength(s: GameState, a: Building, b: Building): number {
  const f = distanceField(s, b);
  let d = Infinity;
  for (const i of accessTiles(s, a)) d = Math.min(d, f[i]);
  return d;
}

/** The open tile nearest to (x, y) (itself if open), by rings, or null on a map with none. */
export function nearestOpen(s: GameState, x: number, y: number): number | null {
  const { width: w, height: h } = s.map;
  for (let r = 0; r < Math.max(w, h); r++) {
    let best: number | null = null, bestD = Infinity;
    for (let ty = y - r; ty <= y + r; ty++) for (let tx = x - r; tx <= x + r; tx++) {
      if (Math.max(Math.abs(tx - x), Math.abs(ty - y)) !== r || !isOpen(s, tx, ty)) continue;
      const d = Math.hypot(tx - x, ty - y);
      if (d < bestD) { bestD = d; best = ty * w + tx; }
    }
    if (best !== null) return best;
  }
  return null;
}
