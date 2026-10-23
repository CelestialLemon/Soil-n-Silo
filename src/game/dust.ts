import { DAY_SECONDS } from './data.ts';
import { activeEvents, allowed, EVENTS, type Active } from './events.ts';
import { CAMPAIGN, type Scenario } from './scenarios.ts';
import { isGuarded } from './sim/layout.ts';
import type { FieldBuilding, GameState } from './state.ts';

// The dust storm: the dry summer's wind lifts the soil off a field with nothing to break it. A field is guarded from it by what
// guards it from erosion (`guardedAt`, rules.ts): a tree or sapling within a tile, or a bean field sharing an edge. Every tile of an
// unguarded field loses fertility while the storm blows, at the rate its entry in the catalogue gives (`dust`, per game hour at
// full strength, blown in and out by the event's ramp); a guarded field loses nothing. The loss stays: a tile under a field never
// recovers (only resting ground does, sim/stats.ts), so compost and beans make it good. The sun and the trucks are plain levers.

const HOUR = DAY_SECONDS / 24;

/** A storm is blowing hard enough to mark the fields it takes soil from once it is this far into its ramp in and until it falls below it on the way out (0–1). */
export const BLOWS_AT = 0.25;

/** The dust storm under way that blows hardest, with the fertility an unguarded tile loses each game hour from it now; null when none blows. */
export function dustFor(sc: Pick<Scenario, 'events'>, time: number): { cause: Active; rate: number } | null {
  let cause: Active | null = null, strongest = 0;
  for (const a of activeEvents(sc, time)) {
    const rate = (EVENTS[a.event.kind].dust?.[a.event.strength] ?? 0) * a.intensity;
    if (rate > strongest) { cause = a; strongest = rate; }
  }
  return cause ? { cause, rate: strongest } : null;
}

/** The dust storm that is taking this field's soil now (blowing and nothing guarding it), or null. */
export function dustTakes(s: GameState, f: FieldBuilding): Active | null {
  const d = dustFor(s.scenario, s.time);
  return d && d.cause.intensity >= BLOWS_AT && !isGuarded(s, f) ? d.cause : null;
}

/** Each step: the wind takes the soil of every unguarded field's tiles. */
export function blowDust(s: GameState, dt: number) {
  const d = dustFor(s.scenario, s.time);
  if (!d) return;
  const by = d.rate * dt / HOUR, f = s.map.fertility, w = s.map.width;
  for (const b of s.buildings) {
    if (b.type !== 'field' || isGuarded(s, b)) continue;
    for (let y = b.y; y < b.y + 3; y++) for (let x = b.x; x < b.x + 3; x++) f[y * w + x] = Math.max(0, f[y * w + x] - by);
  }
}

/** Whether a climate can bring a dust storm (the sandbox starts any by hand). */
export const canDust = (c: Pick<Scenario['climate'], 'season' | 'character'>) => allowed('dustStorm', c);

/** Whether this commission can have a dust storm (so the cards say whether a field is guarded from it): the sandbox, a dry summer's random commission, or any that has one placed (Tired Soil's); the rest of the campaign has none. */
export const dustComes = (s: GameState) => {
  const sc = s.scenario;
  return sc.events.some((e) => e.kind === 'dustStorm') || !!sc.sandbox || (canDust(sc.climate) && !CAMPAIGN.some((c) => c.id === sc.id));
};

/** What the inspector says of a field's shelter from a dust storm, where one can come (it changes when a tree or a bean field goes up beside it), else null. */
export const dustNote = (s: GameState, f: FieldBuilding): string | null =>
  dustComes(s) ? (isGuarded(s, f) ? 'guarded: a tree, sapling or bean field beside it breaks the wind' : 'exposed: nothing beside it breaks the wind, so a storm lifts its soil. A tree, sapling or bean field beside it would guard it') : null;
