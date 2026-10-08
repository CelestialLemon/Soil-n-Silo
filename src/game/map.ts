import { fbm2, mulberry32, noise2 } from './rng.ts';
import type { Scenario } from './scenarios.ts';

// The map of a commission, generated from its seed: grass with a fertility per tile, water, rock and trees, and where the
// freight depot stands. The same scenario always gives the same map.

export const TERRAIN = { grass: 0, water: 1, rock: 2, tree: 3 } as const;
export type TerrainKind = typeof TERRAIN[keyof typeof TERRAIN];

export interface MapData {
  width: number;
  height: number;
  /** TERRAIN per tile, row by row. */
  terrain: TerrainKind[];
  /** Soil fertility 0–100 per tile (what a field on it starts from). */
  fertility: number[];
  /** The depot's north-west tile (it is 3 × 3). */
  depot: { x: number; y: number };
}

export const DEPOT_SIZE = 3;
/** Tiles around the depot kept clear, so every commission starts with room to build. */
const CLEARING = 8;

export function generateMap(sc: Scenario): MapData {
  const { width: w, height: h, seed, terrain: t } = sc;
  const r = mulberry32(seed);
  const terrain: TerrainKind[] = new Array(w * h).fill(TERRAIN.grass);
  const fertility: number[] = new Array(w * h).fill(0);
  const idx = (x: number, y: number) => y * w + x;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;

  // The depot on the south edge, off centre.
  const depot = { x: Math.floor(w / 2 - 1 + (r() - 0.5) * w * 0.4), y: h - DEPOT_SIZE - 1 };
  const nearDepot = (x: number, y: number) => Math.max(Math.abs(x - (depot.x + 1)), Math.abs(y - (depot.y + 1))) <= CLEARING;

  // Water.
  if (t.water === 'river') {
    const vertical = r() < 0.5;
    const phase = r() * 6.28, period = 5 + r() * 4, amp = 2 + r() * 3;
    if (vertical) {
      // Down the map, on the side away from the depot.
      const cx = depot.x + 1 < w / 2 ? w * (0.62 + r() * 0.2) : w * (0.18 + r() * 0.2);
      for (let y = 0; y < h; y++) {
        const c = cx + Math.sin(y / period + phase) * amp + (noise2(y / 3, 0, seed + 5) - 0.5) * 2;
        const half = 1 + noise2(y / 4, 1, seed + 6) * 0.9;
        for (let x = Math.floor(c - half); x <= Math.ceil(c + half); x++) if (inside(x, y) && Math.abs(x - c) <= half) terrain[idx(x, y)] = TERRAIN.water;
      }
    } else {
      const cy = h * (0.22 + r() * 0.25);
      for (let x = 0; x < w; x++) {
        const c = cy + Math.sin(x / period + phase) * amp + (noise2(x / 3, 0, seed + 5) - 0.5) * 2;
        const half = 1 + noise2(x / 4, 1, seed + 6) * 0.9;
        for (let y = Math.floor(c - half); y <= Math.ceil(c + half); y++) if (inside(x, y) && Math.abs(y - c) <= half) terrain[idx(x, y)] = TERRAIN.water;
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

  // Forest and rock, by quantile of their noise so their share of the map is about what the scenario asks.
  const scatter = (share: number, scale: number, s: number, kind: TerrainKind) => {
    if (share <= 0) return;
    const vals: number[] = [];
    const v = (x: number, y: number) => fbm2(x / scale, y / scale, s, 3) * 0.85 + noise2(x * 1.7, y * 1.7, s + 3) * 0.15;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (terrain[idx(x, y)] === TERRAIN.grass) vals.push(v(x, y));
    vals.sort((a, b) => b - a);
    const cut = vals[Math.min(vals.length - 1, Math.floor(vals.length * share))];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (terrain[idx(x, y)] !== TERRAIN.grass || nearDepot(x, y)) continue;
      if (v(x, y) > cut) terrain[idx(x, y)] = kind;
    }
  };
  scatter(t.forest, 7, seed + 21, TERRAIN.tree);
  scatter(t.rock, 3.5, seed + 37, TERRAIN.rock);

  // Soil: noise around the scenario's mean, richer by the water.
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let f = t.soil + t.soilSpread * (fbm2(x / 9, y / 9, seed + 51, 3) * 2 - 1) * 1.6;
    let wet = false;
    for (let dy = -2; dy <= 2 && !wet; dy++) for (let dx = -2; dx <= 2; dx++) if (inside(x + dx, y + dy) && terrain[idx(x + dx, y + dy)] === TERRAIN.water) { wet = true; break; }
    if (wet) f += 10;
    fertility[idx(x, y)] = Math.round(Math.max(5, Math.min(95, f)));
  }

  // The depot's own tiles are plain ground.
  for (let y = depot.y; y < depot.y + DEPOT_SIZE; y++) for (let x = depot.x; x < depot.x + DEPOT_SIZE; x++) terrain[idx(x, y)] = TERRAIN.grass;

  return { width: w, height: h, terrain, fertility, depot };
}
