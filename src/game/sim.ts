// Time on the homestead: `stepSim` moves the living valley on by a slice of game time, in this order each sub-step: the
// clock, the workshops starting what they can, the power (what each network makes, stores and serves), the recipes
// under way, the crops, the carts, then the milestone drops' and seals' bookkeeping. Once a game hour, resting ground
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
import { advanceRecipes, describeRuntime, startRecipes, stepEcology, syncRuntime } from './workshops.ts';

/** The longest slice of game time one sub-step runs, game-seconds (a cart moves at most 6 m in it). */
export const MAX_SUBSTEP_SECONDS = 1;

export interface SimTickResult {
  /** Some field's crop grew a stage, ripened or was harvested: redraw the crops (each field's `growth`, `harvestReady`). */
  fieldStagesChanged: boolean;
  events: SimEvent[];
  cartsMoved: boolean;
}

/**
 * Moves the homestead on by `dtSeconds` of game time: real seconds times the game's speed (at 1×, 30 to a game hour, as
 * the world's sky). `env.hour` is the world's clock after the step; left out, the simulation keeps its own.
 */
export function stepSim(s: GameState, dtSeconds: number, env: SimEnv): SimTickResult {
  const out: SimTickResult = { fieldStagesChanged: false, events: [], cartsMoved: false };
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

    startRecipes(s);
    for (const n of stepPower(s, dtH, mid, env)) out.events.push({ type: 'blackout', message: s.sim.powerSummary.lastBlackoutReason, id: n.id });
    advanceRecipes(s, dtH, env.weather);
    stepEcology(s, dtH, env);
    const crops = growCrops(s, dtH, sunFactor(mid, s.season) * (1 - 0.35 * Math.min(1, Math.max(0, env.cloudCover))), env.weather);
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
