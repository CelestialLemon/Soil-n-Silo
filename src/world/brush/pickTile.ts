import { TERRAIN } from '../../game/map.ts';
import { buildingAt, inMap, type GameState } from '../../game/state.ts';
import type { Tile } from '../scene.ts';
import { footprintDistance2, planOutcropTile, rockFootprint, type RocksLook } from './rockPlan.ts';
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

/**
 * A conservative top (m, the world's height) of the rock standing at world `(wx, wz)` on rock tile `(ox, oz)`, from the
 * ground under each piece's own centre (`landAt`), so a crag's downhill side doesn't read taller than it is. A tile's
 * pieces reach into any of its eight neighbours (a main piece's centre may sit on an edge shared with a rock neighbour;
 * bridges and keystones sit on its E/S edges), so all rock tiles of the 3 × 3 around `(ox, oz)` are checked. Over gaps where
 * no piece reaches, a low floor (`ROCK_FLOOR` over the ground there) lets a low crown overhanging the tile win.
 */
function rockCeilingAt(
  s: GameState, ox: number, oz: number, wx: number, wz: number, landAt: (x: number, z: number) => number, look: RocksLook,
): number {
  const here = landAt(wx, wz);
  if (look === 'off') return here + OLD_STONE_TOP;
  const w = s.map.width;
  const isRock = (x: number, y: number) => inMap(s, x, y) && s.map.terrain[y * w + x] === TERRAIN.rock;
  let ceiling = here + ROCK_FLOOR;
  for (let ty = oz - 1; ty <= oz + 1; ty++) for (let tx = ox - 1; tx <= ox + 1; tx++) {
    if (!isRock(tx, ty)) continue;
    for (const piece of planOutcropTile(tx, ty, isRock, look)) {
      const fp = rockFootprint(piece);
      const px = wx - piece.x, pz = wz - piece.z;
      if (Math.abs(px) > fp.fx || Math.abs(pz) > fp.fz) continue;
      if (footprintDistance2(fp, px, pz) > 1) continue;
      // Top of the crag (addCrag): its centre ry * (1 - 2 sink) over the ground under it, plus ry with the surface's noise.
      const top = landAt(piece.x, piece.z) + piece.ry * (2 - 2 * piece.sink) * 1.08 + 0.15;
      if (top > ceiling) ceiling = top;
    }
  }
  return ceiling;
}

/**
 * Resolves a `'plant'` pick hit at world metres `p` to its tree or rock tile, `landAt` the ground's height (m) at a
 * point of the world. A hit on a rock tile stays on it unless it's above that rock's top and a tree's crown is in reach
 * (a crown leaning over the rock wins); a hit on grass finds a tree in reach, else a rock just past its edge, never a
 * rock over a crop or building next to it.
 */
export function plantTile(
  s: GameState, p: { x: number; y: number; z: number }, landAt: (x: number, z: number) => number, look: RocksLook,
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
      if (bestTree && p.y > rockCeilingAt(s, ox, oz, p.x, p.z, landAt, look)) return bestTree;
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
