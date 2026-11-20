import type { FlowerOptions, TuftOptions } from '../../../brush3d/src/index.ts';
import { FLOWER_REACH, TUFT_HEIGHT, TUFT_REACH } from '../../../brush3d/src/shared.ts';
import { GROUND } from '../../game/ground.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { joins, SIDES, spanOf, STEEP, type Relief } from '../../game/relief.ts';
import type { BuildingId } from '../../game/data.ts';
import type { Season } from '../../game/seasons.ts';
import { sizeOf, terrainAt, type GameState } from '../../game/state.ts';
import { YAW } from './catalog.ts';
import { TILE } from './scale.ts';

// Pure placement, masking, and block-change rules for the meadow: its grass tufts (#256) and its wildflowers (#266), which
// grow where the grass may, in the same blocks. Kept separate from `grass.ts` with no Three.js or renderer runtime imports
// so `npm test` exercises them directly in Node (as `landMap.ts` does for `land.ts`).

/**
 * Tiles a side of one map or country-fringe block: one mesh, made again whole when anything in it changes. Small, so
 * making one again fits the frame's budget (grass.ts).
 */
export const GRASS_BLOCK = 4;
/** Tiles beyond the map where grass tufts fade out into the country. */
export const GRASS_FRINGE = 4;

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
  tuft: Required<TuftOptions>;
}

/**
 * The meadow's density: dense, taller tussocks (the developer's pick on #256, `lush` of the quiet, meadow and lush
 * compared on its PR).
 */
export const GRASS_PROFILE: GrassProfile = {
  attempts: 11, baseProb: 0.18, lushProb: 0.82, clusterProb: 0.42,
  tall: [0.40, 0.36],
  tuft: { blades: [4, 3], width: [0.055, 0.028], spread: 0.11 },
};

/** The tallest a tuft is asked to be (m): its full lushness, at the most of its random 0.88–1.12 (grass.ts). */
const MAX_TALL = (GRASS_PROFILE.tall[0] + GRASS_PROFILE.tall[1]) * 1.12;

/**
 * The furthest (m) any blade reaches from its tuft's spot across the ground, at rest: brush3d's promise for `addTuft`
 * (`TUFT_REACH`, held to it by its brush3d/test/tuft.test.ts), ≈ 0.825 m.
 */
export const MAX_BLADE_REACH = GRASS_PROFILE.tuft.spread + TUFT_REACH * MAX_TALL;

export const FLOWER_MODES = ['off', 'subtle', 'meadow', 'lush'] as const;
export type FlowerMode = (typeof FLOWER_MODES)[number];

export interface FlowerProfile {
  /** Candidate spots tried per open grass tile; each that takes is a clump of blooms. */
  attempts: number;
  /**
   * Where the drifts are: the drift field (0..1, grass.ts's `driftAt`) eased from none at the first to full at the second.
   * Higher, fewer and smaller drifts with more open meadow between.
   */
  drift: [number, number];
  /** Blooms in a clump: `[min, spread]` (`min + floor(rand() * spread)`), times the season's `clump`. */
  clump: [number, number];
  /** The blooms' shape, passed to `addFlower`. */
  flower: Required<FlowerOptions>;
}

export const FLOWER_PROFILES: Record<Exclude<FlowerMode, 'off'>, FlowerProfile> = {
  subtle: { attempts: 8, drift: [0.66, 0.80], clump: [1, 3], flower: { size: [0.07, 0.03], lift: [0.16, 0.16], crisp: true } },
  meadow: { attempts: 12, drift: [0.60, 0.74], clump: [2, 3], flower: { size: [0.075, 0.035], lift: [0.18, 0.22], crisp: true } },
  lush: { attempts: 16, drift: [0.54, 0.70], clump: [2, 4], flower: { size: [0.08, 0.04], lift: [0.20, 0.30], crisp: true } },
};

export interface FlowerSeason {
  /** How thickly they bloom against spring's (the chance a candidate takes is multiplied by it): none in winter's snow. */
  density: number;
  /** How many blooms to a clump, against spring's. */
  clump: number;
  /** The colours (sRGB) and how often each is a drift's. */
  palette: readonly { hex: number; weight: number }[];
}

/** The wildflowers by season: the season never changes during a commission, so the meadow reads it once. */
export const FLOWER_SEASONS: Record<Season, FlowerSeason> = {
  // Fresh blooms: white, yellow, peach and sky blue.
  spring: {
    density: 1, clump: 1,
    palette: [{ hex: 0xf7f2e4, weight: 3 }, { hex: 0xf5cf3e, weight: 3 }, { hex: 0xf6b48f, weight: 2 }, { hex: 0x9cc8ec, weight: 2 }],
  },
  // Vibrant drifts: the farm demo's pinks, reds and violets with the white and yellow.
  summer: {
    density: 1.2, clump: 1.2,
    palette: [
      { hex: 0xf08bb0, weight: 2 }, { hex: 0xe8574a, weight: 2 }, { hex: 0xa77ad8, weight: 2 }, { hex: 0xf5cf3e, weight: 2 },
      { hex: 0xf7f2e4, weight: 1 },
    ],
  },
  // Sparse warm specks: the last few blooms, ochre, amber, rust and cream.
  autumn: {
    density: 0.3, clump: 0.5,
    palette: [{ hex: 0xe0a33a, weight: 3 }, { hex: 0xf0b84a, weight: 2 }, { hex: 0xcf6b3a, weight: 2 }, { hex: 0xeedcae, weight: 1 }],
  },
  winter: { density: 0, clump: 0, palette: [] },
};

/** Whether any wildflowers bloom at a density in a season. */
export const flowersBloom = (mode: FlowerMode, season: Season) => mode !== 'off' && FLOWER_SEASONS[season].density > 0;

/** The furthest (m) a bloom reaches from its middle at a density: brush3d's promise for `addFlower` (`FLOWER_REACH`). */
export const flowerReach = (p: FlowerProfile) => FLOWER_REACH * (p.flower.size[0] + p.flower.size[1]);

/** Margins (m) kept clear around cliff faces, non-grass neighbours, and footprints. */
export const CLIFF_MARGIN = 0.85;
export const WATER_MARGIN = 0.45;
export const ROCK_MARGIN = 0.35;
/**
 * Kept strictly above `MAX_BLADE_REACH` so no blade at rest stands in a building's or field's footprint. The wind's sway
 * is left out, on purpose (as it is from `TUFT_REACH`): the grass shader bends a blade across the view only, never nearer or
 * further, so a blade in a gust can lean over a field's edge or in front of a wall it already stood in front of, but
 * never through a wall. Covering the sway's full reach (up to 0.6 m, in a storm) would leave a bare ring round everything.
 */
export const BUILDING_MARGIN = 0.90;
export const FIELD_MARGIN = 0.85;

export interface FootprintBox {
  x0: number; x1: number; z0: number; z1: number;
  wheel?: { cx: number; cz: number; cos: number; sin: number };
}

export interface TileHabitat {
  minU: number; maxU: number; minV: number; maxV: number;
  waterBoost: number; skirtBoost: number; rockBoost: number;
  /** At a hill's edge: a bank or cliff on a side (the wildflowers gather there). */
  edgeBoost: number;
  deepWoods: number; groundScale: number; seasonDensity: number; heightScale: number;
}

export interface GrassBlockRect {
  id: number;
  x0: number; y0: number; x1: number; y1: number;
  /** Whether this block contains any playable map tiles (`false` for pure country-fringe blocks). */
  onMap: boolean;
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
      if (wheelRaceAt(lx, lz, BUILDING_MARGIN) > 0) return true;
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

/** All 8 × 8-tile blocks covering the playable map `[0, w) × [0, h)` and its `reach`-tile country fringe. */
export function grassBlocks(w: number, h: number, reach: number): GrassBlockRect[] {
  const out: GrassBlockRect[] = [];
  const bx0 = Math.floor(-reach / GRASS_BLOCK), bx1 = Math.floor((w + reach - 1) / GRASS_BLOCK);
  const by0 = Math.floor(-reach / GRASS_BLOCK), by1 = Math.floor((h + reach - 1) / GRASS_BLOCK);
  for (let by = by0; by <= by1; by++) for (let bx = bx0; bx <= bx1; bx++) {
    const x0 = Math.max(-reach, bx * GRASS_BLOCK), x1 = Math.min(w + reach, (bx + 1) * GRASS_BLOCK);
    const y0 = Math.max(-reach, by * GRASS_BLOCK), y1 = Math.min(h + reach, (by + 1) * GRASS_BLOCK);
    if (x0 >= x1 || y0 >= y1) continue;
    out.push({
      id: (by + 64) * 1024 + (bx + 64),
      x0, y0, x1, y1,
      onMap: x1 > 0 && x0 < w && y1 > 0 && y0 < h,
    });
  }
  return out;
}

/** Density fade (0..1) for tile `(x, y)`: 1 on the playable map, tapering smoothly over `reach` country-fringe tiles. */
export function fringeFade(x: number, y: number, w: number, h: number, reach: number): number {
  if (x >= 0 && y >= 0 && x < w && y < h) return 1;
  const beyond = Math.hypot(Math.max(0, -x, x - w + 1), Math.max(0, -y, y - h + 1));
  const t = Math.min(1, Math.max(0, beyond / (reach + 0.5)));
  const fade = (1 - t * t * (3 - 2 * t)) * 0.65;
  return fade > 0.05 ? fade : 0;
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

  let minU = 0.08, maxU = TILE - 0.08, minV = 0.08, maxV = TILE - 0.08, edge = false;
  for (let d = 0; d < 4; d++) {
    const [dx, dy] = SIDES[d], nx = tx + dx, ny = ty + dy, nlx = nx + M, nly = ny + M;
    let margin = 0;
    if (!joins(relief, lx, ly, d)) {
      margin = CLIFF_MARGIN;
      edge = true;
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
    edgeBoost: edge ? 0.14 : 0,
    deepWoods: treesNear >= 5 ? 0 : treesNear === 4 ? 0.55 : 1,
    groundScale: gKind === GROUND.stony ? 0.68 : gKind === GROUND.sand ? 0.76 : gKind === GROUND.silt ? 1.12 : 1,
    seasonDensity: winter ? 0.80 : 1,
    heightScale: (winter ? 0.60 : 1) * (gKind === GROUND.stony ? 0.82 : gKind === GROUND.sand ? 0.88 : 1),
  };
}

/** The id of the block (grassBlocks') that holds tile (x, y), on the map or in its fringe. */
export const blockOf = (x: number, y: number) => (Math.floor(y / GRASS_BLOCK) + 64) * 1024 + (Math.floor(x / GRASS_BLOCK) + 64);

/** Where a building stands, as far as the grass is concerned. */
interface Standing { type: BuildingId; x: number; y: number; rot: number }
const same = (a: Standing | undefined, b: Standing | undefined) => !!a && !!b && a.type === b.type && a.x === b.x && a.y === b.y && a.rot === b.rot;

/** What of the game's layout the grass stands round: the map's terrain, and each building where it stands. */
export interface GrassLayout { terrain: Uint8Array; buildings: Map<number, Standing> }

export function grassLayout(s: GameState): GrassLayout {
  const buildings = new Map<number, Standing>();
  for (const b of s.buildings) buildings.set(b.id, { type: b.type, x: b.x, y: b.y, rot: b.rot });
  return { terrain: Uint8Array.from(s.map.terrain), buildings };
}

/**
 * The blocks touched by what changed between two layouts of a map `width` tiles across: `urgent`, those a building now
 * stands in (or its wheel's race reaches), whose grass must go before the building is drawn; `dirty`, the rest (a tree
 * or rock cleared, a building taken away: grass grows back). A tile's grass depends on its neighbours' terrain, so a
 * changed tile touches the blocks round it too. Costs a look at each tile and building, not a block's worth of work.
 */
export function layoutChanges(was: GrassLayout, now: GrassLayout, width: number): { urgent: Set<number>; dirty: Set<number> } {
  const urgent = new Set<number>(), dirty = new Set<number>();
  const touch = (into: Set<number>, x0: number, y0: number, x1: number, y1: number) => {
    for (let y = Math.floor(y0 / GRASS_BLOCK); y <= Math.floor(y1 / GRASS_BLOCK); y++) {
      for (let x = Math.floor(x0 / GRASS_BLOCK); x <= Math.floor(x1 / GRASS_BLOCK); x++) into.add(blockOf(x * GRASS_BLOCK, y * GRASS_BLOCK));
    }
  };
  for (let i = 0; i < now.terrain.length; i++) {
    if (was.terrain[i] === now.terrain[i]) continue;
    const x = i % width, y = (i - x) / width;
    touch(dirty, x - 1, y - 1, x + 1, y + 1);
  }
  // A building's box (makeBox) reaches less than a tile past its footprint; a wheel's race, three.
  const around = (b: Standing, into: Set<number>) => {
    const n = sizeOf(b), pad = b.type === 'wheel' ? 3 : 1;
    touch(into, b.x - pad, b.y - pad, b.x + n + pad - 1, b.y + n + pad - 1);
  };
  for (const [id, b] of now.buildings) if (!same(was.buildings.get(id), b)) around(b, urgent);
  for (const [id, b] of was.buildings) if (!same(now.buildings.get(id), b)) around(b, dirty);
  for (const id of urgent) dirty.delete(id);
  return { urgent, dirty };
}

/** How high (m) a meadow tuft's tip stands over the land at most: its tallest blade (addTuft). */
export const GRASS_TOP = TUFT_HEIGHT * MAX_TALL + 0.05;

/**
 * How high (m) a wildflower's bloom stands over the land at most, at a density: its highest (addFlower); none when off.
 * Under the grass's top (GRASS_TOP) at every density, so a pick under it is the meadow's.
 */
export function flowerTop(mode: FlowerMode): number {
  if (mode === 'off') return 0;
  const p = FLOWER_PROFILES[mode];
  return p.flower.lift[0] + p.flower.lift[1] + flowerReach(p) + 0.05;
}

/**
 * Whether what a pick calls a plant, at (x, z) m and `above` m over the land, is the meadow's grass or flowers (#256,
 * #266) rather than a tree or a rock: lower than the grass's tips (GRASS_TOP, over the flowers' blooms), and over a tile
 * of open grass (or off the map). brush3d paints grass and flowers as it does a tree's leaves, so its pick can't tell them
 * apart; the game can. A tree's crown leaning over the next tile stands higher. (A branch hanging lower than the grass's
 * tips over the next tile is taken for the meadow: picked on its crown or its own tile instead.)
 */
export function grassAt(s: GameState, x: number, z: number, above: number): boolean {
  if (above >= GRASS_TOP) return false;
  const tx = Math.floor(x / TILE), ty = Math.floor(z / TILE);
  return tx < 0 || ty < 0 || tx >= s.map.width || ty >= s.map.height || terrainAt(s, tx, ty) === TERRAIN.grass;
}
