// Time on the homestead: `stepSim` moves the living valley on by a slice of game time, in this order each sub-step: the
// clock, the weather (weather.ts) and any flood it raises (flood.ts), the workshops starting what they can, the power
// (what each network makes, stores and serves), the recipes under way, the Greenhouse, the hives and tanks, the crops,
// the carts, then the milestone drops' and seals' bookkeeping. Once a game hour, resting ground
// drifts back toward its soil's own fertility. The world calls it every frame
// with its clock, wind and clouds; the tests call it to play whole days headless.
import { stepBrief } from './brief.ts';
import { stepCarts } from './carts.ts';
import { SECONDS_PER_GAME_HOUR, sunFactor } from './clock.ts';
import { growCrops, restSoil } from './crops.ts';
import type { SimEvent } from './events.ts';
import { GOOD_LABELS } from './goods.ts';
import { type SimEnv, stepPower } from './power/sim.ts';
import type { GameState } from './state.ts';
import { advanceRecipes, describeRuntime, growGreenhouses, startRecipes, stepEcology, syncRuntime } from './workshops.ts';
import { refreshFlood } from './settle.ts';
import { stepWeather, toSpell, type WeatherSpell } from './weather.ts';

/** The weather worth a toast when it comes in. */
const NOTABLE: Partial<Record<WeatherSpell, string>> = {
  storm: 'A thunderstorm is rolling in.', gale: 'A gale is getting up: carts slow in the open, bees stay in.',
  blizzard: 'A blizzard is blowing in.', 'heat-wave': 'A heatwave: unshaded fields are drying fast.',
  frost: 'A frost is settling: tender beans in the hollows will be nipped.', snow: 'Snow is falling.',
};

/** The longest slice of game time one sub-step runs, game-seconds (a cart moves at most 6 m in it). */
export const MAX_SUBSTEP_SECONDS = 1;

export interface SimTickResult {
  /** Some field's crop grew a stage, ripened or was harvested: redraw the crops (each field's `growth`, `harvestReady`). */
  fieldStagesChanged: boolean;
  events: SimEvent[];
  cartsMoved: boolean;
  /** The flood rose or fell: redraw the live water (`grid.waterLevel`, `grid.flood`). */
  waterChanged: boolean;
  /** The wet banks moved with it: redraw the ground's moisture (`grid.moisture`) and which fields stand flooded. */
  groundChanged: boolean;
}

/**
 * A step's world, read from the living weather (`state.sim.weather`): its wind and clouds each sub-step, for a headless run
 * of the whole weather or a world drawing what the weather says.
 */
export function liveEnv(s: GameState, hour?: number): SimEnv {
  const w = s.sim.weather;
  return { windSpeed: w.windSpeed, cloudCover: w.cloudCover, useLiveWeather: true, ...(hour === undefined ? {} : { hour }) };
}

/**
 * Moves the homestead on by `dtSeconds` of game time: real seconds times the game's speed (at 1×, 30 to a game hour, as
 * the world's sky). `env.hour` is the world's clock after the step; left out, the simulation keeps its own.
 */
export function stepSim(s: GameState, dtSeconds: number, env: SimEnv): SimTickResult {
  const out: SimTickResult = { fieldStagesChanged: false, events: [], cartsMoved: false, waterChanged: false, groundChanged: false };
  const forced = env.weather === undefined || env.useLiveWeather ? undefined : toSpell(env.weather);
  syncRuntime(s);
  const sim = s.sim, total = Math.max(0, Number.isFinite(dtSeconds) ? dtSeconds : 0);
  const startHour = sim.hour, totalH = total / SECONDS_PER_GAME_HOUR;
  const steps = Math.max(1, Math.ceil(total / MAX_SUBSTEP_SECONDS)), dtSec = total / steps, dtH = dtSec / SECONDS_PER_GAME_HOUR;
  // With the world's clock, run the sub-steps along the hours it moved through (it may have wrapped past midnight).
  let span = totalH;
  if (env.hour !== undefined) {
    span = (((env.hour - startHour) % 24) + 24) % 24;
    if (span > totalH + 12) span = totalH;
  }
  for (let k = 0; k < steps; k++) {
    const before = sim.hour, hour = startHour + span * ((k + 1) / steps);
    sim.hour = ((hour % 24) + 24) % 24;
    if (sim.hour < before - 1e-9) sim.day++;
    if (dtH <= 0) break;
    const mid = startHour + span * ((k + 0.5) / steps);

    // The weather moves on, and any flood with it; the rest of the step lives in it.
    const was = sim.weather.spell, flooded = sim.floodApplied > 0;
    const w = stepWeather(s, dtH, sim.day, sim.hour, forced);
    if (w.spell !== was && NOTABLE[w.spell]) out.events.push({ type: 'weather', message: NOTABLE[w.spell] ?? '' });
    // The rest reads the spell the weather resolved (a forced alias, 'rain', as the 'soft-rain' it stepped to).
    const e: SimEnv = env.useLiveWeather ? { ...env, windSpeed: w.windSpeed, cloudCover: w.cloudCover, weather: w.spell }
      : { ...env, weather: w.spell };
    if (refreshFlood(s)) {
      out.waterChanged = true; out.groundChanged = true; out.fieldStagesChanged = true;
      if (!flooded && sim.floodApplied > 0) out.events.push({ type: 'flood', message: 'The brook is rising: flood water spills over the low meadows.' });
      if (flooded && sim.floodApplied === 0) out.events.push({ type: 'flood', message: 'The flood has gone down; the meadows are draining.' });
    }

    startRecipes(s);
    for (const n of stepPower(s, dtH, mid, e)) out.events.push({ type: 'blackout', message: s.sim.powerSummary.lastBlackoutReason, id: n.id });
    advanceRecipes(s, dtH, e.weather);
    growGreenhouses(s, dtH);
    stepEcology(s, dtH, e);
    const crops = growCrops(s, dtH, sunFactor(mid, s.season) * (1 - 0.35 * Math.min(1, Math.max(0, e.cloudCover))), e.weather, e.cloudCover);
    if (crops.stagesChanged) out.fieldStagesChanged = true;
    for (const f of crops.ripened) out.events.push({ type: 'ripe', message: `The ${GOOD_LABELS[f.crop].label} field is ripe: ${f.harvestReady} to bring in.`, id: f.id });
    const carts = stepCarts(s, dtSec, mid, out.events);
    if (carts.moved) out.cartsMoved = true;
    if (carts.stagesChanged) out.fieldStagesChanged = true;
    stepBrief(s, dtH, out.events);
    sim.soilHours += dtH;
    if (sim.soilHours >= 1) { restSoil(s, sim.soilHours); sim.soilHours = 0; }
  }
  if (env.hour !== undefined) sim.hour = ((env.hour % 24) + 24) % 24;
  for (const r of sim.things.values()) r.status = describeRuntime(s, r);
  return out;
}
