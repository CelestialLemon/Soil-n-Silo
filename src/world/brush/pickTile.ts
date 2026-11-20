import { TERRAIN } from '../../game/map.ts';
import { buildingAt, inMap, type GameState } from '../../game/state.ts';
import type { Tile } from '../scene.ts';
import { TILE } from './scale.ts';

/** How far from a tree's tile's middle (tiles) a pick on a plant still finds the tree: a crown leans over its tile's edge. */
export const CROWN_REACH = 0.8;
/** How far from a rock tile's middle (tiles) a depth-rounded plant hit on empty grass still resolves to the rock (~20 cm past its edge). */
export const ROCK_EDGE_REACH = 0.55;
/** Tallest a rock outcrop stands above ground (m): plant hits higher than this over a rock tile are overhanging tree crowns. */
export const ROCK_PICK_TOP = 4.2;

/**
 * Resolves a `'plant'` pick hit at world metres `p` (with ground height `landY` in metres) to its tree or rock tile.
 * Keeps direct hits inside a rock tile on that rock (never jumping to an adjacent tree), while preserving overhanging
 * tree-crown picking (`CROWN_REACH`) and avoiding stealing clicks on adjacent crops/buildings.
 */
export function plantTile(
  s: GameState,
  p: { x: number; y: number; z: number },
  landY?: number,
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
      if (bestTree && landY !== undefined && p.y - landY > ROCK_PICK_TOP) return bestTree;
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
