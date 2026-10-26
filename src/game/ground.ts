import { fbm2 } from './rng.ts';
import { centreLevel, depthBelowRound, spanOf, type Relief } from './relief.ts';

// Ground: every grass tile is one of five kinds, a fixed trait laid in large patches that follow the land, and the kind sets the
// tile's starting fertility. Nothing changes it: no earthworks, compost or clearing turn one kind into another. This file is the
// kinds, their fertility, and `layGround`, which lays a map's ground from its relief and water (pure, so it runs in Node).

export const GROUND = { loam: 0, silt: 1, clay: 2, sand: 3, stony: 4 } as const;
export type GroundKind = typeof GROUND[keyof typeof GROUND];
export type GroundId = keyof typeof GROUND;
export const GROUND_IDS = Object.keys(GROUND) as GroundId[];

export const GROUND_NAMES: Record<GroundId, string> = { loam: 'Loam', silt: 'Silt', clay: 'Clay', sand: 'Sand', stony: 'Stony' };

/** The fertility a kind of ground starts at, from poor to rich: a tile gets a place in its range from smooth local noise. */
export const FERTILITY_RANGE: Record<GroundId, readonly [number, number]> = {
  loam: [50, 70], silt: [70, 90], clay: [45, 65], sand: [20, 40], stony: [15, 35],
};

/** How much more (or less) of each kind a commission's ground has than a plain valley's: 0 for the valley, 1 for a good deal more, up to about 2. Loam is what is left. */
export type GroundMix = Record<Exclude<GroundId, 'loam'>, number>;

/** A plain valley's ground: whatever its river, hollows and hills give. */
export const PLAIN: GroundMix = { silt: 0, clay: 0, sand: 0, stony: 0 };

/** The kind of ground a map index holds, as a name. */
export const groundName = (kind: number): string => GROUND_NAMES[GROUND_IDS[kind]];

/** The fertility a tile of `kind` starts at, given a place in its range `u` (0–1, from the noise). */
export function fertilityOf(kind: GroundKind, u: number): number {
  const [lo, hi] = FERTILITY_RANGE[GROUND_IDS[kind]];
  return Math.round(lo + (hi - lo) * Math.min(1, Math.max(0, u)));
}

/** Smoothly 0 at `a` and 1 at `b` (either way round). */
const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Tiles round a tile that count as "the ground round it" when finding hollows and crests (frost.ts uses the same). */
const ROUND = 6;
/** What loam scores everywhere: any other kind beats it only where the land or its patch says so. */
const LOAM_SCORE = 0.5;
/** The strength of each kind's own feature of the land (silt: low ground by the water; clay: hollows; sand: raised banks and old terraces; stony: crests and high ground). */
const SILT = 1.1, CLAY = 0.95, SAND = 0.95, STONY = 1.1;
/** Silt by a lake or ponds: still water leaves less. */
const STILL = 0.3;
/** How far the plain's patches reach: the share of land each kind's random patch covers at amplitude 1 is where its noise tops its loam threshold. */
const PATCH_FROM = 0.5, PATCH_TO = 0.8;
/** The scale of a patch of ground in tiles, and the share of a tile's score its noise can add or take. */
const PATCH = 11, JITTER = 0.3;
/** Rounds of the majority vote that rubs out single tiles of one kind in another's patch. */
const SETTLE = 2;
/** The patches a plain valley has of its own, as a share of a patch layer's full amplitude (a commission's mix adds to it). */
const BASE = { clay: 0.72, sand: 0.62, stony: 0.5 };

export interface GroundSite extends Relief {
  /** 1 on a water tile, else 0, row by row. */
  water: ArrayLike<number>;
  /** How the commission is watered: a river leaves silt, still water clay. */
  kind: 'river' | 'ponds' | 'lake' | 'none';
  /** The commission's own mix of ground. */
  mix: GroundMix;
  seed: number;
  /** The map coordinates of the site's north-west tile, so the same noise lies over the same tiles however much land round the map is laid. */
  origin: { x: number; y: number };
}

/**
 * How far each tile is from the nearest water (tiles, 8-way with diagonals a little dearer) and the level of that water's
 * surface: two sweeps of a distance transform that carry the level along. Infinity and NaN with no water.
 */
function waterReach(s: GroundSite): { distance: Float32Array; level: Float32Array } {
  const w = s.width, h = s.height, n = w * h, distance = new Float32Array(n).fill(Infinity), level = new Float32Array(n).fill(NaN);
  for (let i = 0; i < n; i++) if (s.water[i]) { distance[i] = 0; level[i] = s.corner[i * 4]; }
  const relax = (i: number, x: number, y: number, dx: number, dy: number) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
    const j = ny * w + nx, d = distance[j] + (dx && dy ? Math.SQRT2 : 1);
    if (d < distance[i]) { distance[i] = d; level[i] = level[j]; }
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (const [dx, dy] of [[-1, 0], [-1, -1], [0, -1], [1, -1]] as const) relax(y * w + x, x, y, dx, dy);
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) for (const [dx, dy] of [[1, 0], [1, 1], [0, 1], [-1, 1]] as const) relax(y * w + x, x, y, dx, dy);
  return { distance, level };
}

/**
 * The ground of a site: the kind each tile holds (water tiles loam, though nothing reads them). Each kind scores on a feature of
 * the land, times a patch of noise so its edges wander, plus the commission's own mix as a patch layer of its own:
 *
 * - silt: low ground close to the water (the floodplain, which a flood covers); a quarter of that beside still water;
 * - clay: hollows (the frost's depth against the ground round it), and the low wet ground by still water;
 * - sand: raised banks beside the water, a step above the plain, and patches on the old terraces;
 * - stony: crests and ridges, high ground and eroded slopes.
 *
 * The highest score wins, loam's a constant, then a majority vote settles stray tiles into the patches round them.
 */
export function layGround(s: GroundSite): GroundKind[] {
  const w = s.width, h = s.height, n = w * h, { x: ox, y: oy } = s.origin;
  const land = new Uint8Array(n).fill(1);
  for (let i = 0; i < n; i++) if (s.water[i]) land[i] = 0;
  const depth = depthBelowRound(s, land, ROUND), { distance, level: surface } = waterReach(s);
  const still = s.kind === 'ponds' || s.kind === 'lake', silty = s.kind === 'none' ? 0 : still ? STILL : 1;
  // Each kind's noise, its own field at a scale of PATCH tiles.
  const noise = (k: number, x: number, y: number) => fbm2((x + ox) / PATCH, (y + oy) / PATCH, s.seed + 811 * k, 2);
  const patch = (k: number, x: number, y: number) => smoothstep(PATCH_FROM, PATCH_TO, noise(k + 10, x, y));
  const kinds = new Array<GroundKind>(n).fill(GROUND.loam);
  const widen = s.mix.silt;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!land[i]) continue;
    const level = centreLevel(s, x, y), rise = level - (Number.isNaN(surface[i]) ? 0 : surface[i]), near = distance[i];
    const flat = 1 - smoothstep(0.5, 1.5, spanOf(s, x, y));
    const crest = smoothstep(0.1, 0.7, -depth[i]), hollow = smoothstep(0.3, 1.2, depth[i]);
    const plain = (1 - smoothstep(2 + 2 * widen, 5 + 4 * widen, near)) * (1 - smoothstep(0.8, 1.5 + widen, rise));
    const bank = (1 - smoothstep(3, 8, near)) * smoothstep(0.5, 1.5, rise) * (1 - smoothstep(2.5, 4.5, rise));
    // Just beyond the floodplain, where the old river left its sand: bends and terraces.
    const band = smoothstep(2, 4, near) * (1 - smoothstep(7, 11, near));
    const wet = still ? (1 - smoothstep(2, 5, near)) * (1 - smoothstep(0.3, 1.5, rise)) : 0;
    const terrace = smoothstep(0.5, 1.5, level) * flat;
    const low = 1 - smoothstep(1, 3.5, level), high = smoothstep(2, 6, level), slope = smoothstep(1, 2, spanOf(s, x, y));
    const jitter = (k: number) => 1 - JITTER + 2 * JITTER * noise(k, x, y);
    const score: Record<GroundId, number> = {
      loam: LOAM_SCORE,
      silt: SILT * silty * plain * jitter(1) + s.mix.silt * 0.4 * plain,
      clay: CLAY * Math.max(hollow, 0.8 * wet) * jitter(2) + (BASE.clay + s.mix.clay) * low * patch(2, x, y),
      sand: SAND * Math.max(bank, 0.6 * band * patch(3, x, y), 0.6 * terrace * patch(3, x, y)) * jitter(3) + (BASE.sand * Math.max(band, terrace, 0.35) + s.mix.sand) * patch(3, x, y),
      stony: STONY * Math.max(crest, high, 0.7 * slope) * jitter(4) + (BASE.stony + s.mix.stony) * (0.4 + 0.6 * smoothstep(0, 4, level)) * patch(4, x, y),
    };
    let best: GroundId = 'loam';
    for (const id of GROUND_IDS) if (score[id] > score[best]) best = id;
    kinds[i] = GROUND[best];
  }
  // A majority vote among a tile's land neighbours rubs out single tiles of one kind in another's patch: patches hold several fields.
  for (let round = 0; round < SETTLE; round++) {
    const before = kinds.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!land[i]) continue;
      const votes = [0, 0, 0, 0, 0];
      for (let dy = Math.max(-2, -y); dy <= Math.min(2, h - 1 - y); dy++) for (let dx = Math.max(-2, -x); dx <= Math.min(2, w - 1 - x); dx++) {
        const j = i + dy * w + dx;
        if (land[j]) votes[before[j]] += dx || dy ? 1 : 1.5;
      }
      let best = before[i];
      for (let k = 0; k < votes.length; k++) if (votes[k] > votes[best] + 1e-9) best = k as GroundKind;
      kinds[i] = best;
    }
  }
  return kinds;
}
