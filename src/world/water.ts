// The water and the ground's state, as the living weather leaves them: the game's water surface and flow (brook, pond, the
// rills that run, and floodwater spilled over the low ground) sent as brush3d's water map, warm and silty where it has
// flooded or the brook runs high, and iced over as the air freezes; and the ground map: the banks the water wets, the
// rain-soaked ground and its mud, the snow lying, and the rime of frost, gathering first in the frost hollows where the
// cold air pools. Both are sent whole (160 × 160 floats: a fraction of a millisecond) when they change, and ease in
// (WATER_EASE, GROUND_EASE), so a rill's water runs in and a frost creeps over rather than popping. The weather moves
// them on slowly, so they're sent again only once what they'd show has moved a step (waterKey, groundKey).
import { type BrushRenderer, GROUND_EASE, type GroundMap, WATER_EASE, type WaterMap } from '../../brush3d/src/index.ts';
import { clamp, COVER, type GameState, hollowDepths, isWet } from '../game/index.ts';

/** The brook runs swollen and brown above this surge, m. */
const SWOLLEN = 0.05;
/** The rime starts to gather in the hollows below this, °C. */
const FROST_AIR_C = 3;

/** How frozen the water is, 0..1, for the air (°C) and the season; undefined: open water. */
export function iceOf(tempC: number, season: GameState['season']): number | undefined {
  if (tempC <= -4) return 0.75;
  if (tempC <= 0) return 0.25 + 0.5 * (-tempC / 4);
  if (tempC <= 2 && season === 'winter') return 0.15;
  return undefined;
}

/** The water as brush3d takes it: narrow water (a rill running down a slope keeps to its own banks). */
export function waterMap(state: GameState): WaterMap {
  const g = state.grid, w = state.sim.weather, n = g.nx * g.nz, level = new Float32Array(n), mud = new Float32Array(n);
  const surge = w.floodSurge > SWOLLEN ? w.floodSurge : 0;
  let muddy = false;
  for (let k = 0; k < n; k++) {
    const v = g.waterLevel[k];
    level[k] = isWet(v) ? v : NaN;
    // Floodwater, and the brook and pond running high, are warm brown with silt.
    const flooded = g.flood[k] > 0.01, swollen = surge > 0 && isWet(g.baseWaterLevel[k]);
    if (flooded || swollen) { mud[k] = clamp(g.flood[k] * 1.8 + surge * 0.8, 0, 0.85); muddy = true; }
  }
  const frozen = iceOf(w.tempC, state.season), ice = frozen === undefined ? undefined : new Float32Array(n).fill(frozen);
  return {
    nx: g.nx, nz: g.nz, cell: g.cell, x0: g.x0, z0: g.z0, level, flowX: Float32Array.from(g.flowX), flowZ: Float32Array.from(g.flowZ),
    narrow: true, ...(muddy ? { mud } : {}), ...(ice ? { ice } : {}),
  };
}

/** What of the weather the water map shows, in steps: when it moves, the water is sent again. */
export const waterKey = (state: GameState) => {
  const w = state.sim.weather;
  return `${Math.round((iceOf(w.tempC, state.season) ?? -1) * 20)} ${w.floodSurge > SWOLLEN ? Math.round(w.floodSurge * 50) : 0}`;
};

/** The ground's state: the wet (banks, rain, flood), the mud, the snow lying, and the frost (deepest in the hollows). */
export function groundMap(state: GameState): GroundMap {
  const g = state.grid, w = state.sim.weather, n = g.nx * g.nz, wet = new Float32Array(n), mud = new Float32Array(n);
  const rain = Math.min(1, w.rain * 1.2), soaked = Math.max(w.groundWet, rain);
  for (let k = 0; k < n; k++) {
    const m = g.moisture[k], c = g.cover[k], flooded = g.flood[k] > 0.01;
    wet[k] = Math.max(m, soaked, flooded ? 1 : 0);
    const bare = c === COVER.track || c === COVER.bare || c === COVER.field;
    mud[k] = bare ? Math.max(0.35 * m, 0.65 * soaked, flooded ? 0.85 : 0) : Math.max(0.2 * soaked * m, flooded ? 0.4 : 0);
  }
  const out: GroundMap = { nx: g.nx, nz: g.nz, cell: g.cell, x0: g.x0, z0: g.z0, wet, mud };
  if (w.snowDepth > 0.01) out.snow = new Float32Array(n).fill(w.snowDepth);
  if (w.frostCover > 0.01 || w.tempC <= FROST_AIR_C) {
    // The cold air drains into the hollows: they rime first and most, on a frosty morning when the rest is barely touched.
    const depth = hollowDepths(state), chill = clamp((FROST_AIR_C - w.tempC) / 4, 0, 1), frost = new Float32Array(n);
    for (let k = 0; k < n; k++) frost[k] = clamp(w.frostCover + Math.max(0, depth[k]) * 0.45 * chill, 0, 1);
    out.frost = frost;
  }
  return out;
}

/** What of the weather the ground map shows, in steps: when it moves, the ground is sent again. */
export const groundKey = (state: GameState) => {
  const w = state.sim.weather, step = (v: number) => Math.round(v * 20);
  return `${step(Math.max(w.groundWet, Math.min(1, w.rain * 1.2)))} ${step(w.snowDepth)} ${step(w.frostCover)} ${w.tempC <= FROST_AIR_C ? Math.round(w.tempC * 2) : 'warm'}`;
};

export const sendWater = (r: BrushRenderer, state: GameState, immediate = false) => r.setWater(waterMap(state), immediate ? 0 : WATER_EASE);
export const sendGround = (r: BrushRenderer, state: GameState, immediate = false) => r.setGround(groundMap(state), immediate ? 0 : GROUND_EASE);
