// The land: the game's grid (src/game/grid.ts) sent to brush3d as continuous terrain (setTerrain), and each edit after as a
// patch over the cells it touched (updateTerrain), so only the chunks round an earthwork are painted again. The game's
// cover codes are brush3d's (LAND_COVER) but for its fields, which brush3d draws as worked bare earth under the crops'
// blanket; its soils are brush3d's grounds. Past the grid the country rises gently into wooded hills (`beyond`).
import { type BrushRenderer, LAND_COVER, type LandRect, noise2, type TerrainMap, type TerrainPatch } from '../../brush3d/src/index.ts';
import { type Change, COVER, type GameState, type Grid, heightAt, type Rect, unionRect, VALLEY_HALF } from '../game/index.ts';
import { landRectOf } from './util.ts';

/** How much of a building's pad (0..255) counts as worked ground: painted as trodden earth, with no meadow drift. */
const WORKED = 150;
/** The country past the grid: its grid's spacing and how far out it reaches (m). */
const BEYOND_CELL = 8, BEYOND_REACH = 240;

/** A cell's cover as brush3d paints it. */
export const landCover = (cover: number) => (cover === COVER.field ? LAND_COVER.bare : cover);

/** Whether brush3d paints a cell as worked ground: a field's bed, or under a building's settled pad. */
export const isWorked = (g: Grid, k: number) => g.fieldOf[k] !== 0 || g.worked[k] >= WORKED;

/** The whole terrain, as setTerrain takes it. */
export function terrainMap(state: GameState): TerrainMap {
  const g = state.grid, n = g.nx * g.nz;
  const cover = new Uint8Array(n), worked = new Uint8Array(n);
  for (let k = 0; k < n; k++) { cover[k] = landCover(g.cover[k]); worked[k] = isWorked(g, k) ? 1 : 0; }
  const edge = Math.round((-VALLEY_HALF - g.x0) / g.cell), side = Math.round((2 * VALLEY_HALF) / g.cell);
  return {
    nx: g.nx, nz: g.nz, cell: g.cell, x0: g.x0, z0: g.z0,
    height: Float32Array.from(g.height), cover, worked, ground: Uint8Array.from(g.soil),
    map: { x: edge, y: Math.round((-VALLEY_HALF - g.z0) / g.cell), width: side, height: side },
    beyond: beyondOf(g, state.seed),
  };
}

/**
 * The country round the grid: the grid's own edge carried on and rising into soft wooded hills, so the valley sits in a
 * bowl that fills the view's corners at every turn.
 */
function beyondOf(g: Grid, seed: number) {
  const n = Math.round((2 * BEYOND_REACH) / BEYOND_CELL) + 1, x0 = -BEYOND_REACH, z0 = -BEYOND_REACH;
  const right = g.x0 + g.nx * g.cell, bottom = g.z0 + g.nz * g.cell, height = new Float32Array(n * n), s = (seed % 997) * 0.37;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = x0 + i * BEYOND_CELL, z = z0 + j * BEYOND_CELL;
    const ex = Math.min(right, Math.max(g.x0, x)), ez = Math.min(bottom, Math.max(g.z0, z));
    const out = Math.hypot(x - ex, z - ez);
    const roll = 3.2 * noise2(x * 0.012 + s, z * 0.012 - s) + 1.4 * noise2(x * 0.03 - 4 * s, z * 0.03 + 2);
    height[j * n + i] = heightAt(g, ex, ez) + out * 0.16 + Math.min(1, out / 30) * roll;
  }
  return { nx: n, nz: n, cell: BEYOND_CELL, x0, z0, height };
}

/** The cells an edit changed the land over: its heights, its cover, its fields (worked, and cover too). */
export const landRectOfChange = (change: Change): Rect | undefined => unionRect(unionRect(change.height, change.cover), change.fields);

/** The patch of the terrain over a rect of cells, from the grid as it is now. */
export function terrainPatch(g: Grid, rect: LandRect): TerrainPatch {
  const { x, y, width: w, height: h } = rect, W = g.nx + 1;
  const height = new Float32Array((w + 1) * (h + 1)), cover = new Uint8Array(w * h), worked = new Uint8Array(w * h), ground = new Uint8Array(w * h);
  for (let j = 0; j <= h; j++) for (let i = 0; i <= w; i++) height[j * (w + 1) + i] = g.height[(y + j) * W + x + i];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = (y + j) * g.nx + x + i, o = j * w + i;
    cover[o] = landCover(g.cover[k]); worked[o] = isWorked(g, k) ? 1 : 0; ground[o] = g.soil[k];
  }
  return { height, cover, worked, ground };
}

/** Sends the land again over what an edit touched; returns the rect sent (cells), if any. */
export function syncTerrain(r: BrushRenderer, state: GameState, change: Change): Rect | undefined {
  const rect = landRectOfChange(change);
  if (!rect) return undefined;
  const g = state.grid;
  const clamped = { x0: Math.max(0, rect.x0), z0: Math.max(0, rect.z0), x1: Math.min(g.nx - 1, rect.x1), z1: Math.min(g.nz - 1, rect.z1) };
  if (clamped.x0 > clamped.x1 || clamped.z0 > clamped.z1) return undefined;
  const land = landRectOf(clamped);
  r.updateTerrain(land, terrainPatch(g, land));
  return clamped;
}
