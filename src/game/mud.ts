import { DAY_SECONDS, TRUCK } from './data.ts';
import { GROUND } from './ground.ts';
import { raining } from './sim/weather.ts';
import type { Scenario } from './scenarios.ts';
import type { GameState } from './state.ts';
import { warmthIn } from './warmth.ts';

// Mud: clay turns to mud while it rains and for TRUCK.mudHours game hours after, and a truck driving on a muddy clay tile keeps
// TRUCK.mudSpeed of its speed. Frozen clay is firm (no mud while the warmth is below 0°C), sand never is muddy, and other ground
// is unchanged. Trucks do not route round mud: their paths come from the land alone (roads.ts), and mud slows them where they
// drive. The rule reads the weather alone, so nothing is saved.

const HOUR = DAY_SECONDS / 24;
/** How often, in game hours, the last rain is looked for (a shower lasts longer than this). */
const LOOK = 1 / 3;

/** Whether it has rained at any time in the last `hours` game hours (and now), counting the rain's own spells and events'. */
export function rainedWithin(sc: Scenario, time: number, hours: number): boolean {
  for (let h = 0; h <= hours + 1e-9; h += LOOK) if (raining(sc, time - h * HOUR)) return true;
  return false;
}

/** Whether clay is muddy at a time: it rains or did within TRUCK.mudHours, and the valley is not frozen. */
export const muddyAt = (sc: Scenario, time: number): boolean => warmthIn(sc, time) >= 0 && rainedWithin(sc, time, TRUCK.mudHours);

/** The share of its speed a truck keeps on a tile of the map (index), with `muddy` the answer of `muddyAt` for now. */
export const mudSpeedOn = (s: GameState, tile: number, muddy: boolean): number => (muddy && s.map.ground[tile] === GROUND.clay ? TRUCK.mudSpeed : 1);
