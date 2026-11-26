// What of the weather the water and the ground maps show, in steps (water.ts sends them again when a step moves), and
// the thresholds both read. Kept apart from water.ts, which talks to brush3d, so the rules' tests can check them in Node.
import type { GameState } from '../game/index.ts';

/** The brook runs swollen and brown above this surge, m. */
export const SWOLLEN = 0.05;
/** The rime starts to gather in the hollows below this, °C. */
export const FROST_AIR_C = 3;

/** How frozen the water is, 0..1, for the air (°C) and the season; undefined: open water. */
export function iceOf(tempC: number, season: GameState['season']): number | undefined {
  if (tempC <= -4) return 0.75;
  if (tempC <= 0) return 0.25 + 0.5 * (-tempC / 4);
  if (tempC <= 2 && season === 'winter') return 0.15;
  return undefined;
}

/** What of the weather the water map shows, in steps: when it moves, the water is sent again. */
export const waterKey = (state: GameState) => {
  const w = state.sim.weather;
  return `${Math.round((iceOf(w.tempC, state.season) ?? -1) * 20)} ${w.floodSurge > SWOLLEN ? Math.round(w.floodSurge * 50) : 0}`;
};

/** What of the weather the ground map shows, in steps: when it moves, the ground is sent again. */
export const groundKey = (state: GameState) => {
  const w = state.sim.weather, step = (v: number) => Math.round(v * 20);
  // Whether a snow or a frost layer is sent at all (groundMap's own tests), apart from its steps: a thin layer that rounds
  // to step 0 is still a layer, never the bare ground's key.
  const snow = w.snowDepth > 0.01 ? 1 : 0, frost = w.frostCover > 0.01 || w.tempC <= FROST_AIR_C ? 1 : 0;
  return `${step(Math.max(w.groundWet, Math.min(1, w.rain * 1.2)))} ${snow}:${step(w.snowDepth)} ${frost}:${step(w.frostCover)} ${w.tempC <= FROST_AIR_C ? Math.round(w.tempC * 2) : 'warm'}`;
};
