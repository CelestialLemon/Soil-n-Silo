import type { addCrag, groundOf, MeshBuilder, rng } from '../../../brush3d/src/index.ts';
import { TERRAIN } from '../../game/map.ts';
import { buildingAt, inMap, type GameState } from '../../game/state.ts';
import type { Tile } from '../scene.ts';
import { planOutcropTile, rockFootprint, type PlannedRock, type RocksLook } from './rockPlan.ts';
import { TILE } from './scale.ts';

/** How far from a tree's tile's middle (tiles) a pick on a plant still finds the tree: a crown leans over its tile's edge. */
const CROWN_REACH = 0.8;
/** How far from a rock tile's middle (tiles) a depth-rounded plant hit on empty grass still resolves to the rock (~20 cm past its edge). */
const ROCK_EDGE_REACH = 0.55;
/** Above the tallest rock (m over the ground): a plant hit higher than this over grass is never a rock (bold crags reach ~3.8 m). */
const ROCK_PICK_TOP = 4;
/** Height (m) under which a hit over a rock tile counts as rock even where no planned piece stands (low stones, skirts). */
const ROCK_FLOOR = 0.4;
/** The `off` look's round stones: how high (m over the ground under the hit) they reach. */
const OLD_STONE_TOP = 1.6;
/** How far round a hit (m) a crag's surface is read, and how far over it (m) a hit still counts as on it: a pick's point is rounded. */
const SURFACE_REACH = 0.3, SURFACE_SLACK = 0.2;

/**
 * A crag's drawn surface: how high (m, over the ground under its centre) it stands over world `(wx, wz)`, or null if
 * it doesn't stand there.
 */
export type CragTop = (piece: PlannedRock, wx: number, wz: number) => number | null;

/**
 * Reads crags' surfaces from their own triangles, each crag made once (on flat ground, as `addCrag` would draw it: a
 * crag's top doesn't change with the slope, only its buried skirt) and kept. The painting kit is given, so this file
 * loads in Node without the renderer: the game gives brush3d's (rocks.ts), the tests the kit's.
 */
export function cragTops(kit: {
  addCrag: typeof addCrag; groundOf: typeof groundOf; MeshBuilder: typeof MeshBuilder; rng: typeof rng;
}): CragTop {
  const flat = kit.groundOf(() => 0);
  const made = new Map<string, { pos: Float32Array; idx: ArrayLike<number> }>();
  return (p, wx, wz) => {
    const key = `${p.seed},${p.x},${p.z},${p.rx},${p.ry},${p.rz}`;
    let crag = made.get(key);
    if (!crag) {
      const b = new kit.MeshBuilder('paint');
      kit.addCrag(b, flat, p.x, p.z, {
        rx: p.rx, ry: p.ry, rz: p.rz, yaw: p.yaw, pitch: p.pitch, roll: p.roll, sink: p.sink, crag: p.crag, moss: p.moss, detail: p.detail,
      }, kit.rng(p.seed));
      const g = b.build(), index = g.getIndex();
      if (!index) throw new Error('a crag is built indexed');
      crag = { pos: Float32Array.from(g.getAttribute('position').array), idx: Array.from(index.array) };
      g.dispose();
      if (made.size >= 512) made.clear();
      made.set(key, crag);
    }
    // The highest of its triangles over the point.
    const { pos, idx } = crag;
    let top: number | null = null;
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      const ax = pos[a], az = pos[a + 2], bx = pos[b], bz = pos[b + 2], cx = pos[c], cz = pos[c + 2];
      const det = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      if (Math.abs(det) < 1e-9) continue;
      const u = ((bz - cz) * (wx - cx) + (cx - bx) * (wz - cz)) / det, v = ((cz - az) * (wx - cx) + (ax - cx) * (wz - cz)) / det;
      if (u < -1e-6 || v < -1e-6 || u + v > 1 + 1e-6) continue;
      const y = u * pos[a + 1] + v * pos[b + 1] + (1 - u - v) * pos[c + 1];
      if (top === null || y > top) top = y;
    }
    return top;
  };
}

/**
 * How high (m, the world's) a hit at world `(wx, wz)` on rock tile `(ox, oz)` can be and still be on its rock: the crags'
 * drawn surface there (`top`, over the ground under each crag's centre, so a crag's downhill side doesn't read taller than
 * it is), read a little round the point and with a little slack for the pick's rounding. A tile's pieces reach into any of
 * its eight neighbours (a main piece's centre may sit on an edge shared with a rock neighbour; bridges and keystones sit
 * on its E/S edges), so all rock tiles of the 3 × 3 around `(ox, oz)` are read. Where no crag stands, a low floor
 * (`ROCK_FLOOR` over the ground there) lets a low crown overhanging the tile win.
 */
function rockCeilingAt(
  s: GameState, ox: number, oz: number, wx: number, wz: number, landAt: (x: number, z: number) => number, look: RocksLook,
  top: CragTop,
): number {
  const here = landAt(wx, wz);
  if (look === 'off') return here + OLD_STONE_TOP;
  const w = s.map.width;
  const isRock = (x: number, y: number) => inMap(s, x, y) && s.map.terrain[y * w + x] === TERRAIN.rock;
  const R = SURFACE_REACH;
  let ceiling = here + ROCK_FLOOR;
  for (let ty = oz - 1; ty <= oz + 1; ty++) for (let tx = ox - 1; tx <= ox + 1; tx++) {
    if (!isRock(tx, ty)) continue;
    for (const piece of planOutcropTile(tx, ty, isRock, look)) {
      const fp = rockFootprint(piece), px = wx - piece.x, pz = wz - piece.z;
      // Only crags whose footprint (grown by the reach) is near the point are read.
      if (Math.abs(px) > fp.fx + R || Math.abs(pz) > fp.fz + R) continue;
      let high: number | null = null;
      for (const [dx, dz] of [[0, 0], [R, 0], [-R, 0], [0, R], [0, -R]]) {
        const y = top(piece, wx + dx, wz + dz);
        if (y !== null && (high === null || y > high)) high = y;
      }
      if (high !== null) ceiling = Math.max(ceiling, landAt(piece.x, piece.z) + high + SURFACE_SLACK);
    }
  }
  return ceiling;
}

/**
 * Resolves a `'plant'` pick hit at world metres `p` to its tree or rock tile, `landAt` the ground's height (m) at a
 * point of the world and `top` the crags' surfaces (`cragTops`). A hit on a rock tile stays on it unless it's over that
 * rock's surface and a tree's crown is in reach (a crown leaning over the rock wins); a hit on grass finds a tree in
 * reach, else a rock just past its edge, never a rock over a crop or building next to it.
 */
export function plantTile(
  s: GameState, p: { x: number; y: number; z: number }, landAt: (x: number, z: number) => number, look: RocksLook,
  top: CragTop,
): Tile | null {
  const fx = p.x / TILE, fz = p.z / TILE;
  const ox = Math.floor(fx), oz = Math.floor(fz);
  const w = s.map.width;

  let bestTree: Tile | null = null, nearTree = CROWN_REACH;
  for (let y = oz - 1; y <= oz + 1; y++) for (let x = ox - 1; x <= ox + 1; x++) {
    if (!inMap(s, x, y) || s.map.terrain[y * w + x] !== TERRAIN.tree) continue;
    const d = Math.hypot(fx - (x + 0.5), fz - (y + 0.5));
    if (d < nearTree) { nearTree = d; bestTree = { x, y }; }
  }

  const ownIn = inMap(s, ox, oz);
  if (ownIn) {
    const ownT = s.map.terrain[oz * w + ox];
    if (ownT === TERRAIN.tree) return { x: ox, y: oz };
    if (ownT === TERRAIN.rock) {
      if (bestTree && p.y > rockCeilingAt(s, ox, oz, p.x, p.z, landAt, look, top)) return bestTree;
      return { x: ox, y: oz };
    }
  }

  if (bestTree) return bestTree;

  if (ownIn && !buildingAt(s, ox, oz) && p.y - landAt(p.x, p.z) <= ROCK_PICK_TOP) {
    let bestRock: Tile | null = null, nearRock = ROCK_EDGE_REACH;
    for (let y = oz - 1; y <= oz + 1; y++) for (let x = ox - 1; x <= ox + 1; x++) {
      if (!inMap(s, x, y) || s.map.terrain[y * w + x] !== TERRAIN.rock) continue;
      const d = Math.hypot(fx - (x + 0.5), fz - (y + 0.5));
      if (d < nearRock) { nearRock = d; bestRock = { x, y }; }
    }
    if (bestRock) return bestRock;
  }

  return null;
}
