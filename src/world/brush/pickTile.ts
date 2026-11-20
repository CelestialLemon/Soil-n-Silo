import { TERRAIN } from '../../game/map.ts';
import { buildingAt, inMap, type GameState } from '../../game/state.ts';
import type { Tile } from '../scene.ts';
import { planOutcropTile, rockFootprint, type RocksLook } from './rockPlan.ts';
import { TILE } from './scale.ts';

/** How far from a tree's tile's middle (tiles) a pick on a plant still finds the tree: a crown leans over its tile's edge. */
export const CROWN_REACH = 0.8;
/** How far from a rock tile's middle (tiles) a depth-rounded plant hit on empty grass still resolves to the rock (~20 cm past its edge). */
export const ROCK_EDGE_REACH = 0.55;
/** Tallest a rock outcrop stands above ground (m) when no per-tile rock pieces are queried. */
export const ROCK_PICK_TOP = 3.5;

/**
 * Conservative upper bound (m above local ground) on rock geometry standing at world `(wx, wz)` on rock tile `(ox, oz)`.
 * Checks pieces owned by `(ox, oz)` and its W/N/NW rock neighbours (which can bridge across the shared edge/corner).
 * Over open gaps within a rock tile where no piece reaches `(wx, wz)`, returns a low 0.4 m floor so low overhanging tree
 * crowns win cleanly.
 */
export function rockCeilingAt(
  s: GameState,
  ox: number,
  oz: number,
  wx: number,
  wz: number,
  look: RocksLook = 'bold',
): number {
  if (look === 'off') return 1.6;
  const w = s.map.width;
  const isRock = (x: number, y: number) => inMap(s, x, y) && s.map.terrain[y * w + x] === TERRAIN.rock;
  let ceiling = 0.4;
  for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) {
    const tx = ox + dx, ty = oz + dy;
    if (!isRock(tx, ty)) continue;
    for (const piece of planOutcropTile(tx, ty, isRock, look)) {
      const fp = rockFootprint(piece);
      const px = wx - piece.x, pz = wz - piece.z;
      if (Math.abs(px) > fp.fx || Math.abs(pz) > fp.fz) continue;
      const d2 = fp.qxx * px * px + 2 * fp.qxz * px * pz + fp.qzz * pz * pz;
      if (d2 > 1.15) continue;
      // Top of the ellipsoidal crag above ground: cy + ry*(1 + noise), bevelled softly.
      const top = piece.ry * (2 - 2 * piece.sink) * 1.08 + 0.15;
      if (top > ceiling) ceiling = top;
    }
  }
  return ceiling;
}

/**
 * Resolves a `'plant'` pick hit at world metres `p` (with ground height `landY` in metres) to its tree or rock tile.
 * Keeps direct hits on rock geometry on that rock tile (never jumping to an adjacent tree), while letting low and high
 * overhanging tree crowns (`CROWN_REACH`) above the rock's local height win cleanly, and avoiding stealing clicks on
 * adjacent crops/buildings.
 */
export function plantTile(
  s: GameState,
  p: { x: number; y: number; z: number },
  landY?: number,
  look: RocksLook = 'bold',
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
      if (bestTree && landY !== undefined && p.y - landY > rockCeilingAt(s, ox, oz, p.x, p.z, look)) return bestTree;
      return { x: ox, y: oz };
    }
  }

  if (bestTree) return bestTree;

  if (ownIn && !buildingAt(s, ox, oz) && (landY === undefined || p.y - landY <= ROCK_PICK_TOP)) {
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
