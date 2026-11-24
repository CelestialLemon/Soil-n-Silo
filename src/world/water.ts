// The water and the ground's state: the game's water surface and flow (brook, pond and the rills that run) sent as brush3d's
// water map, and its wet banks with the weather's rain and snow as the ground map. Both are sent whole (160 × 160 floats: a
// fraction of a millisecond) when they change, and ease in (WATER_EASE, GROUND_EASE), so a rill's water runs in rather
// than popping.
import { type BrushRenderer, GROUND_EASE, type GroundMap, WATER_EASE, type WaterMap } from '../../brush3d/src/index.ts';
import { COVER, type GameState, isWet } from '../game/index.ts';

/** The water as brush3d takes it: narrow water (a rill running down a slope keeps to its own banks). */
export function waterMap(state: GameState): WaterMap {
  const g = state.grid, n = g.nx * g.nz, level = new Float32Array(n);
  for (let k = 0; k < n; k++) { const v = g.waterLevel[k]; level[k] = isWet(v) ? v : NaN; }
  const ice = state.season === 'winter' ? new Float32Array(n).fill(0.3) : undefined;
  return {
    nx: g.nx, nz: g.nz, cell: g.cell, x0: g.x0, z0: g.z0, level, flowX: Float32Array.from(g.flowX), flowZ: Float32Array.from(g.flowZ),
    narrow: true, ...(ice ? { ice } : {}),
  };
}

/** How the weather wets and whitens the ground (the world's, from its weather preset). */
export interface Sky { rain: number; snow: number }

/** The ground's state: the banks the water wets (the game's moisture), the rain on everything, the snow lying, the mud. */
export function groundMap(state: GameState, sky: Sky): GroundMap {
  const g = state.grid, n = g.nx * g.nz, wet = new Float32Array(n), mud = new Float32Array(n);
  const rain = Math.min(1, sky.rain * 1.2), lying = sky.snow > 0 ? 0.4 + 0.3 * Math.min(1, sky.snow) : 0;
  for (let k = 0; k < n; k++) {
    const m = g.moisture[k], c = g.cover[k];
    wet[k] = Math.max(m, rain);
    const bare = c === COVER.track || c === COVER.bare || c === COVER.field;
    mud[k] = bare ? Math.max(0.35 * m, 0.6 * rain) : 0.2 * rain * m;
  }
  const out: GroundMap = { nx: g.nx, nz: g.nz, cell: g.cell, x0: g.x0, z0: g.z0, wet, mud };
  if (lying > 0) out.snow = new Float32Array(n).fill(lying);
  if (state.season === 'winter') out.frost = new Float32Array(n).fill(lying > 0 ? 0.2 : 0.45);
  return out;
}

export const sendWater = (r: BrushRenderer, state: GameState, immediate = false) => r.setWater(waterMap(state), immediate ? 0 : WATER_EASE);
export const sendGround = (r: BrushRenderer, state: GameState, sky: Sky, immediate = false) => r.setGround(groundMap(state, sky), immediate ? 0 : GROUND_EASE);
