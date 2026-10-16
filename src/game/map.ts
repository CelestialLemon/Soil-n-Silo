import { fbm2, hash2, mulberry32, noise2 } from './rng.ts';
import { FLAT } from './relief.ts';
import type { Scenario } from './scenarios.ts';

// The map of a commission, generated from its seed: grass with a fertility per tile, water, rock and trees, and where the
// freight depot stands. The same scenario always gives the same map. The same noise carries on past the map's edge into
// the country around it (`generateLand`), which is only drawn.

export const TERRAIN = { grass: 0, water: 1, rock: 2, tree: 3 } as const;
export type TerrainKind = typeof TERRAIN[keyof typeof TERRAIN];

export interface MapData {
  width: number;
  height: number;
  /** TERRAIN per tile, row by row. */
  terrain: TerrainKind[];
  /** Soil fertility 0–100 per tile (what a field on it starts from). */
  fertility: number[];
  /** Each tile's level (0 the valley floor, at most MAX_LEVEL), and for a ramp the side it rises towards (FLAT if none); see relief.ts. */
  level: number[];
  ramp: number[];
  /** The speed of the river's current over each tile (m/s, 0 off the river and on still water). */
  current: number[];
  /** The depot's north-west tile (it is 3 × 3). */
  depot: { x: number; y: number };
}

/**
 * A commission's map with `margin` tiles of country beyond each edge, for drawing. Tiles are indexed from the land's own
 * north-west corner, so map tile (x, y) is land tile (x + margin, y + margin); the map part is exactly `generateMap`'s.
 */
export interface Land {
  /** The scenario's seed, for noise drawn over the land. */
  seed: number;
  margin: number;
  width: number;
  height: number;
  terrain: TerrainKind[];
  fertility: number[];
  /** Levels and ramps as on the map (relief.ts); beyond the edge the land rises higher than MAX_LEVEL into hills. */
  level: number[];
  ramp: number[];
  /** The depot's north-west tile, in map coordinates. */
  depot: { x: number; y: number };
  /** The river's current over each tile (vx, vz in m/s, two numbers a tile); 0 off the river and on still water. */
  flow: Float32Array;
  /** How many falls each river tile is below the river's source (0 off the river). */
  drop: Uint8Array;
}

export const DEPOT_SIZE = 3;
/** Tiles around the depot kept clear, so every commission starts with room to build. */
const CLEARING = 8;

export function generateMap(sc: Scenario): MapData {
  const { width, height, terrain, fertility, level, ramp, depot, flow } = generateLand(sc, 0);
  const current = terrain.map((_, i) => Math.round(Math.hypot(flow[i * 2], flow[i * 2 + 1]) * 100) / 100);
  return { width, height, terrain, fertility, level, ramp, current, depot };
}

/** The river's speed (m/s) where it is narrowest and widest. */
const RIVER_FAST = 1.1, RIVER_SLOW = 0.6;

export function generateLand(sc: Scenario, margin: number): Land {
  const { width: w, height: h, seed, terrain: t } = sc;
  const r = mulberry32(seed);
  const M = margin, lw = w + 2 * M, lh = h + 2 * M;
  const terrain: TerrainKind[] = new Array<TerrainKind>(lw * lh).fill(TERRAIN.grass);
  const fertility: number[] = new Array<number>(lw * lh).fill(0);
  const level: number[] = new Array<number>(lw * lh).fill(0), ramp: number[] = new Array<number>(lw * lh).fill(FLAT);
  const flow = new Float32Array(lw * lh * 2), drop = new Uint8Array(lw * lh);
  // Map coordinates throughout; the land reaches `margin` tiles past every edge.
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const inside = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
  /** How many tiles (x, y) is beyond the map's edge (0 on it). */
  const beyond = (x: number, y: number) => Math.max(0, -x, -y, x - w + 1, y - h + 1);

  // The depot on the south edge, off centre.
  const depot = { x: Math.floor(w / 2 - 1 + (r() - 0.5) * w * 0.4), y: h - DEPOT_SIZE - 1 };
  const nearDepot = (x: number, y: number) => Math.max(Math.abs(x - (depot.x + 1)), Math.abs(y - (depot.y + 1))) <= CLEARING;

  // Water.
  if (t.water === 'river') {
    const vertical = r() < 0.5;
    const phase = r() * 6.28, period = 5 + r() * 4, amp = 2 + r() * 3;
    // Along the river, `a` runs down the map (vertical) or across it; `b` is across the river.
    const len = vertical ? h : w;
    const sign = hash2(seed, 1, 77) < 0.5 ? 1 : -1;   // which way it flows along `a`
    // Two small falls on the map, a third and two thirds of the way along (each boundary lies before tile `a`).
    const falls = [Math.round(len * (0.3 + hash2(seed, 2, 77) * 0.1)), Math.round(len * (0.62 + hash2(seed, 3, 77) * 0.1))];
    const dropAt = (a: number) => falls.filter((f) => (sign > 0 ? a >= f : a < f)).length;
    const course = (c0: number) => (a: number) => c0 + Math.sin(a / period + phase) * amp + (noise2(a / 3, 0, seed + 5) - 0.5) * 2;
    let centre: (a: number) => number;
    if (vertical) {
      // Down the map, on the side away from the depot.
      centre = course(depot.x + 1 < w / 2 ? w * (0.62 + r() * 0.2) : w * (0.18 + r() * 0.2));
    } else {
      centre = course(h * (0.22 + r() * 0.25));
    }
    for (let a = -M; a < len + M; a++) {
      const c = centre(a), half = 1 + noise2(a / 4, 1, seed + 6) * 0.9;
      // The current runs along the course, faster where the river is narrow.
      const db = centre(a + 0.5) - centre(a - 0.5), n = Math.hypot(db, 1);
      const speed = RIVER_SLOW + (RIVER_FAST - RIVER_SLOW) * Math.min(1, Math.max(0, (1.9 - half) / 0.9));
      const along = sign * speed / n, across = sign * speed * db / n;
      for (let b = Math.floor(c - half); b <= Math.ceil(c + half); b++) {
        const [x, y] = vertical ? [b, a] : [a, b];
        if (!inside(x, y) || Math.abs(b - c) > half) continue;
        const i = idx(x, y);
        terrain[i] = TERRAIN.water;
        flow[i * 2] = vertical ? across : along; flow[i * 2 + 1] = vertical ? along : across;
        drop[i] = dropAt(a);
      }
    }
  } else if (t.water === 'ponds' || t.water === 'lake') {
    const n = t.water === 'lake' ? 1 : 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const rad = t.water === 'lake' ? 5 + r() * 2 : 1.6 + r() * 1.8;
      let cx = 0, cy = 0;
      for (let tries = 0; tries < 20; tries++) {
        cx = 3 + r() * (w - 6); cy = 3 + r() * (h * 0.7);
        if (!nearDepot(Math.round(cx), Math.round(cy))) break;
      }
      for (let y = Math.floor(cy - rad - 2); y <= cy + rad + 2; y++) for (let x = Math.floor(cx - rad - 2); x <= cx + rad + 2; x++) {
        if (!inside(x, y)) continue;
        const d = Math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 1.15);
        if (d < rad + (noise2(x / 2, y / 2, seed + 9 + i) - 0.5) * 1.6) terrain[idx(x, y)] = TERRAIN.water;
      }
    }
  }

  // Forest and rock, by quantile of their noise on the map so their share of it is about what the scenario asks. Beyond the
  // edge the woods thicken, so the map sits in a clearing.
  const scatter = (share: number, scale: number, s: number, kind: TerrainKind, thicken: number) => {
    if (share <= 0) return;
    const vals: number[] = [];
    const v = (x: number, y: number) => fbm2(x / scale, y / scale, s, 3) * 0.85 + noise2(x * 1.7, y * 1.7, s + 3) * 0.15;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (terrain[idx(x, y)] === TERRAIN.grass) vals.push(v(x, y));
    vals.sort((a, b) => b - a);
    const cut = vals[Math.min(vals.length - 1, Math.floor(vals.length * share))];
    for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
      if (terrain[idx(x, y)] !== TERRAIN.grass || nearDepot(x, y)) continue;
      if (v(x, y) + thicken * beyond(x, y) > cut) terrain[idx(x, y)] = kind;
    }
  };
  scatter(t.forest, 7, seed + 21, TERRAIN.tree, 0.012);
  scatter(t.rock, 3.5, seed + 37, TERRAIN.rock, 0);

  // Soil: noise around the scenario's mean, richer by the water (on the map, only water on the map counts).
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    let f = t.soil + t.soilSpread * (fbm2(x / 9, y / 9, seed + 51, 3) * 2 - 1) * 1.6;
    const near = onMap(x, y) ? onMap : inside;
    let wet = false;
    for (let dy = -2; dy <= 2 && !wet; dy++) for (let dx = -2; dx <= 2; dx++) if (near(x + dx, y + dy) && terrain[idx(x + dx, y + dy)] === TERRAIN.water) { wet = true; break; }
    if (wet) f += 10;
    fertility[idx(x, y)] = Math.round(Math.max(5, Math.min(95, f)));
  }

  // The depot's own tiles are plain ground.
  for (let y = depot.y; y < depot.y + DEPOT_SIZE; y++) for (let x = depot.x; x < depot.x + DEPOT_SIZE; x++) {
    const i = idx(x, y);
    terrain[i] = TERRAIN.grass; flow[i * 2] = flow[i * 2 + 1] = 0; drop[i] = 0;
  }

  return { seed, margin: M, width: lw, height: lh, terrain, fertility, level, ramp, depot, flow, drop };
}
