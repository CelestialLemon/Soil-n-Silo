import { DAY_SECONDS } from './data.ts';
import { activeEvents, allowed, EVENTS, type Active } from './events.ts';
import { CAMPAIGN, type Scenario } from './scenarios.ts';
import { GROUND_IDS, GROUND_NAMES, type GroundId } from './ground.ts';
import { isGuarded } from './sim/layout.ts';
import { inMap, type FieldBuilding, type GameState } from './state.ts';

// The dust storm: the dry summer's wind lifts the soil off a field with nothing to break it. A field is guarded from it by what
// guards it from erosion (`guardedAt`, rules.ts): a tree or sapling within a tile, or a bean field sharing an edge. Every tile of an
// unguarded field loses fertility while the storm blows, at the rate its entry in the catalogue gives (`dust`, per game hour at
// full strength, blown in and out by the event's ramp, times what its ground gives up to the wind: `DUST_BY_GROUND`); a guarded field loses nothing. The loss stays: a tile under a field never
// recovers (only resting ground does, sim/stats.ts), so compost and beans make it good. The sun and the trucks are plain levers.

const HOUR = DAY_SECONDS / 24;

/** How much more (or less) of the storm's rate a tile of each ground loses: the wind lifts sand worst and stony ground a little more than loam; clay and silt hold together. */
export const DUST_BY_GROUND: Record<GroundId, number> = { loam: 1, silt: 1, clay: 1, sand: 2, stony: 1.25 };

/** The share of the storm's rate a tile of this ground kind loses. */
export const dustShare = (kind: number): number => DUST_BY_GROUND[GROUND_IDS[kind]];

/** A storm is blowing hard enough to mark the fields it takes soil from once it is this far into its ramp in and until it falls below it on the way out (0–1). */
export const BLOWS_AT = 0.25;

/** The dust storm under way that blows hardest, with the fertility an unguarded tile of loam loses each game hour from it now (`dustShare` scales it by ground); null when none blows. */
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
    for (let y = b.y; y < b.y + 3; y++) for (let x = b.x; x < b.x + 3; x++) { const i = y * w + x; f[i] = Math.max(0, f[i] - by * dustShare(s.map.ground[i])); }
  }
}

/** Whether a climate can bring a dust storm (the sandbox starts any by hand). */
export const canDust = (c: Pick<Scenario['climate'], 'season' | 'character'>) => allowed('dustStorm', c);

/** Whether this commission can have a dust storm (so the cards say whether a field is guarded from it): the sandbox, a dry summer's random commission, or any that has one placed (Tired Soil's); the rest of the campaign has none. */
export const dustComes = (s: GameState) => {
  const sc = s.scenario;
  return sc.events.some((e) => e.kind === 'dustStorm') || !!sc.sandbox || (canDust(sc.climate) && !CAMPAIGN.some((c) => c.id === sc.id));
};

/** How the ground under a 3×3 field changes what a storm takes, in words ("sand loses twice as much"); '' when none of it differs from loam. */
export function dustGround(s: GameState, x: number, y: number): string {
  const w = s.map.width, kinds = new Set<number>();
  for (let ty = y; ty < y + 3; ty++) for (let tx = x; tx < x + 3; tx++) if (inMap(s, tx, ty)) kinds.add(s.map.ground[ty * w + tx]);
  const parts = [...kinds].filter((k) => dustShare(k) !== 1).map((k) => `${GROUND_NAMES[GROUND_IDS[k]].toLowerCase()} loses ${dustShare(k) === 2 ? 'twice' : `${dustShare(k)}×`} as much`);
  return parts.join(', ');
}

/** What the inspector says of a field's shelter from a dust storm, where one can come (it changes when a tree or a bean field goes up beside it), else null. */
export const dustNote = (s: GameState, f: FieldBuilding): string | null =>
  dustComes(s) ? (isGuarded(s, f) ? 'guarded: a tree, sapling or bean field beside it breaks the wind' : `exposed: nothing beside it breaks the wind, so a storm lifts its soil${dustGround(s, f.x, f.y) ? ` (${dustGround(s, f.x, f.y)})` : ''}. A tree, sapling or bean field beside it would guard it`) : null;
