import { GROUND } from '../../game/ground.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { joins, SIDES, spanOf, STEEP, type Relief } from '../../game/relief.ts';
import { sizeOf, terrainAt, type GameState } from '../../game/state.ts';
import type { GrassMode } from '../../ui/grassChoice.ts';
import { YAW } from './catalog.ts';
import { TILE } from './scale.ts';

// Pure placement, masking, and block-signature rules for meadow grass tufts (#256). Kept separate from `grass.ts` with
// no Three.js or renderer imports so `npm test` exercises them directly in Node (as `landMap.ts` does for `land.ts`).

/** Tiles a side of one map block (matches `Wild` and `PaintedLand`). */
export const GRASS_BLOCK = 8;
/** Tiles beyond the map where grass tufts fade out into the country. */
export const GRASS_FRINGE = 4;

/** Margins (m) kept clear around cliff faces, non-grass neighbours, and footprints. */
export const CLIFF_MARGIN = 0.85;
export const WATER_MARGIN = 0.45;
export const ROCK_MARGIN = 0.35;
export const BUILDING_MARGIN = 0.45;
export const FIELD_MARGIN = 0.30;

export interface GrassProfile {
  /** Candidate spots tried per open grass tile. */
  attempts: number;
  /** Minimum chance a candidate spawns on open lawn (keeps quiet painted spaces between drifts). */
  baseProb: number;
  /** Extra chance added by lushness (drifts, tree skirts, banks). */
  lushProb: number;
  /** Chance a lush tuft spawns a tight companion tussock nearby (organic clumping). */
  clusterProb: number;
  /** Tuft height (m): base and extra at full lushness. */
  tall: [number, number];
  /** Shape options passed to `addTuft`. */
  tuft: { blades: [number, number]; width: [number, number]; spread: number };
}

export const GRASS_PROFILES: Record<Exclude<GrassMode, 'off'>, GrassProfile> = {
  quiet: {
    attempts: 3, baseProb: 0.06, lushProb: 0.56, clusterProb: 0.22,
    tall: [0.30, 0.24],
    tuft: { blades: [3, 2], width: [0.046, 0.022], spread: 0.08 },
  },
  meadow: {
    attempts: 6, baseProb: 0.10, lushProb: 0.72, clusterProb: 0.32,
    tall: [0.36, 0.32],
    tuft: { blades: [3, 3], width: [0.052, 0.026], spread: 0.10 },
  },
  lush: {
    attempts: 11, baseProb: 0.18, lushProb: 0.82, clusterProb: 0.42,
    tall: [0.40, 0.36],
    tuft: { blades: [4, 3], width: [0.055, 0.028], spread: 0.11 },
  },
};

export interface FootprintBox {
  x0: number; x1: number; z0: number; z1: number;
  wheel?: { cx: number; cz: number; cos: number; sin: number };
}

export interface TileHabitat {
  minU: number; maxU: number; minV: number; maxV: number;
  waterBoost: number; skirtBoost: number; rockBoost: number;
  deepWoods: number; groundScale: number; seasonDensity: number; heightScale: number;
}

/** Deterministic tile hash in 0..2^32-1 for per-tile seeding (rebuilding a block never shifts neighbouring tiles). */
export function tileSeed(seed: number, x: number, y: number): number {
  let h = (seed ^ Math.imul(x + 374761393, 668265263) ^ Math.imul(y + 1274126177, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Distance (tiles, capped at 40) from each land tile to the nearest water tile (water never moves in play). */
export function wetDistance(land: Pick<Land, 'width' | 'height' | 'terrain'>): Float32Array {
  const { width: W, height: H, terrain } = land, n = W * H;
  const dist = new Float32Array(n).fill(40);
  const queue = new Int32Array(n);
  let head = 0, tail = 0;
  for (let i = 0; i < n; i++) {
    if (terrain[i] === TERRAIN.water) { dist[i] = 0; queue[tail++] = i; }
  }
  while (head < tail) {
    const i = queue[head++], d = dist[i] + 1;
    if (d >= 40) continue;
    const x = i % W, y = (i - x) / W;
    for (const [dx, dy] of SIDES) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (dist[j] > d) { dist[j] = d; queue[tail++] = j; }
    }
  }
  return dist;
}

/** Whether (x, z) in metres falls inside any building footprint (or water wheel race, when `wheelRaceAt` is given). */
export function inBuilding(
  boxes: readonly FootprintBox[],
  x: number,
  z: number,
  wheelRaceAt?: (lx: number, lz: number, pad: number) => number,
): boolean {
  for (const b of boxes) {
    if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) return true;
    if (b.wheel && wheelRaceAt) {
      const dx = x - b.wheel.cx, dz = z - b.wheel.cz;
      const lx = dx * b.wheel.cos - dz * b.wheel.sin;
      const lz = dx * b.wheel.sin + dz * b.wheel.cos;
      if (wheelRaceAt(lx, lz, 0.8) > 0) return true;
    }
  }
  return false;
}

function makeBox(b: GameState['buildings'][number]): FootprintBox {
  const n = sizeOf(b);
  const margin = b.type === 'field' ? FIELD_MARGIN : BUILDING_MARGIN;
  const box: FootprintBox = {
    x0: b.x * TILE - margin, x1: (b.x + n) * TILE + margin,
    z0: b.y * TILE - margin, z1: (b.y + n) * TILE + margin,
  };
  if (b.type === 'wheel') {
    const yaw = YAW[b.rot];
    box.wheel = { cx: (b.x + n / 2) * TILE, cz: (b.y + n / 2) * TILE, cos: Math.cos(yaw), sin: Math.sin(yaw) };
  }
  return box;
}

/** Expanded building footprints & wheel races that can touch tiles in `[x0, x1) × [y0, y1)`. */
export function boxesIn(s: GameState, x0: number, y0: number, x1: number, y1: number): FootprintBox[] {
  const out: FootprintBox[] = [];
  for (const b of s.buildings) {
    const n = sizeOf(b), pad = b.type === 'wheel' ? 3 : 1;
    if (b.x + n + pad <= x0 || b.x - pad >= x1 || b.y + n + pad <= y0 || b.y - pad >= y1) continue;
    out.push(makeBox(b));
  }
  return out;
}

/** Buildings whose footprint (or wheel race) can reach past the map edge into the country fringe. */
export function borderBoxes(s: GameState): FootprintBox[] {
  const { width: w, height: h } = s.map;
  const out: FootprintBox[] = [];
  for (const b of s.buildings) {
    const n = sizeOf(b), pad = b.type === 'wheel' ? 3 : 1;
    if (b.x - pad >= 0 && b.x + n + pad <= w && b.y - pad >= 0 && b.y + n + pad <= h) continue;
    out.push(makeBox(b));
  }
  return out;
}

/**
 * Evaluates whether map/country tile `(tx, ty)` can hold meadow grass tufts and returns its inner placement bounds
 * and habitat modifiers, or `null` if the tile is excluded (non-grass, track, steep bank, or pinched margins).
 */
export function tileHabitat(
  s: GameState,
  land: Land,
  relief: Relief,
  wetDist: Float32Array,
  tx: number,
  ty: number,
  onMap: boolean,
): TileHabitat | null {
  const M = land.margin, W = land.width, H = land.height;
  const lx = tx + M, ly = ty + M, li = ly * W + lx;
  const terrain = onMap ? terrainAt(s, tx, ty) : land.terrain[li];
  if (terrain !== TERRAIN.grass) return null;
  if (!onMap && land.track[li] === 1) return null;
  if (spanOf(relief, lx, ly) >= STEEP) return null;

  const kindAt = (nx: number, ny: number): number => {
    const nlx = nx + M, nly = ny + M;
    if (nlx < 0 || nly < 0 || nlx >= W || nly >= H) return TERRAIN.grass;
    if (nx >= 0 && ny >= 0 && nx < s.map.width && ny < s.map.height) return terrainAt(s, nx, ny);
    return land.terrain[nly * W + nlx];
  };

  let treesNear = 0, rockNear = false;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (dx === 0 && dy === 0) continue;
    const k = kindAt(tx + dx, ty + dy);
    if (k === TERRAIN.tree) treesNear++;
    else if (k === TERRAIN.rock) rockNear = true;
  }

  let minU = 0.08, maxU = TILE - 0.08, minV = 0.08, maxV = TILE - 0.08;
  for (let d = 0; d < 4; d++) {
    const [dx, dy] = SIDES[d], nx = tx + dx, ny = ty + dy, nlx = nx + M, nly = ny + M;
    let margin = 0;
    if (!joins(relief, lx, ly, d)) {
      margin = CLIFF_MARGIN;
    } else if (!onMap && nx >= 0 && ny >= 0 && nx < s.map.width && ny < s.map.height) {
      margin = BUILDING_MARGIN + 0.05;
    } else {
      const nk = kindAt(nx, ny);
      if (nk === TERRAIN.water) margin = WATER_MARGIN;
      else if (nk === TERRAIN.rock) margin = ROCK_MARGIN;
      else if (nlx >= 0 && nly >= 0 && nlx < W && nly < H && land.track[nly * W + nlx] === 1) margin = ROCK_MARGIN;
    }
    if (margin <= 0) continue;
    if (d === 0) minV = Math.max(minV, margin);
    else if (d === 1) maxU = Math.min(maxU, TILE - margin);
    else if (d === 2) maxV = Math.min(maxV, TILE - margin);
    else minU = Math.max(minU, margin);
  }
  if (minU >= maxU || minV >= maxV) return null;

  const winter = s.scenario.climate.season === 'winter';
  const gKind = onMap ? s.map.ground[ty * s.map.width + tx] : land.ground[li];
  return {
    minU, maxU, minV, maxV,
    waterBoost: wetDist[li] <= 1 ? 0.30 : wetDist[li] <= 2 ? 0.16 : 0,
    skirtBoost: treesNear >= 1 && treesNear <= 3 ? 0.24 : 0,
    rockBoost: rockNear ? 0.16 : 0,
    deepWoods: treesNear >= 5 ? 0.28 : treesNear === 4 ? 0.55 : 1,
    groundScale: gKind === GROUND.stony ? 0.68 : gKind === GROUND.sand ? 0.76 : gKind === GROUND.silt ? 1.12 : 1,
    seasonDensity: winter ? 0.80 : 1,
    heightScale: (winter ? 0.60 : 1) * (gKind === GROUND.stony ? 0.82 : gKind === GROUND.sand ? 0.88 : 1),
  };
}

/**
 * Compact state signature of a map block (plus its 1-tile terrain/relief halo and nearby buildings) so only blocks
 * touched by a placement, clearing, or earthwork rebuild.
 */
export function blockKey(
  s: GameState,
  land: Land,
  relief: Relief,
  yAt: (tx: number, ty: number) => number,
  mode: GrassMode,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): string {
  const { width: w, height: h } = s.map, M = land.margin, W = land.width;
  const hx0 = Math.max(0, x0 - 1), hy0 = Math.max(0, y0 - 1), hx1 = Math.min(w, x1 + 1), hy1 = Math.min(h, y1 + 1);
  let tHash = 2166136261, hHash = 2166136261;
  const mix = (acc: number, v: number) => Math.imul(acc ^ v, 16777619) >>> 0;
  const corner = relief.corner;
  for (let y = hy0; y < hy1; y++) for (let x = hx0; x < hx1; x++) {
    const li = (y + M) * W + x + M;
    tHash = mix(tHash, terrainAt(s, x, y));
    const c4 = li * 4;
    hHash = mix(hHash, (corner[c4] | (corner[c4 + 1] << 5) | (corner[c4 + 2] << 10) | (corner[c4 + 3] << 15)));
    if (x >= x0 && x < x1 && y >= y0 && y < y1) {
      hHash = mix(hHash, Math.round(yAt(x + 0.5, y + 0.5) * 1000));
    }
  }
  let bPart = '';
  for (const b of s.buildings) {
    const n = sizeOf(b), pad = b.type === 'wheel' ? 3 : 1;
    if (b.x + n + pad <= x0 || b.x - pad >= x1 || b.y + n + pad <= y0 || b.y - pad >= y1) continue;
    bPart += `${b.id}:${b.type}:${b.x},${b.y},${b.rot};`;
  }
  return `${mode}|${tHash}|${hHash}|${bPart}`;
}

/** State signature of the map's 1-tile outer perimeter so interior edits never touch the country fringe. */
export function countrySig(
  s: GameState,
  land: Land,
  relief: Relief,
  yAt: (tx: number, ty: number) => number,
  mode: GrassMode,
): string {
  const { width: w, height: h } = s.map, M = land.margin, W = land.width;
  const corner = relief.corner;
  let tHash = 2166136261, hHash = 2166136261;
  const mix = (acc: number, v: number) => Math.imul(acc ^ v, 16777619) >>> 0;
  const visit = (x: number, y: number) => {
    tHash = mix(tHash, terrainAt(s, x, y));
    const c4 = ((y + M) * W + x + M) * 4;
    hHash = mix(hHash, (corner[c4] | (corner[c4 + 1] << 5) | (corner[c4 + 2] << 10) | (corner[c4 + 3] << 15)));
    hHash = mix(hHash, Math.round(yAt(x + 0.5, y + 0.5) * 1000));
  };
  for (let x = 0; x < w; x++) { visit(x, 0); if (h > 1) visit(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { visit(0, y); if (w > 1) visit(w - 1, y); }
  let bPart = '';
  for (const b of s.buildings) {
    const n = sizeOf(b), pad = b.type === 'wheel' ? 3 : 1;
    if (b.x - pad >= 0 && b.x + n + pad <= w && b.y - pad >= 0 && b.y + n + pad <= h) continue;
    bPart += `${b.id}:${b.type}:${b.x},${b.y},${b.rot};`;
  }
  return `${mode}|${tHash}|${hHash}|${bPart}`;
}
