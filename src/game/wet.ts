import { DAY_SECONDS } from './data.ts';
import { activeEvents } from './events.ts';
import { GROUND } from './ground.ts';
import { groundUnder } from './rules.ts';
import type { Scenario } from './scenarios.ts';
import { raining } from './sim/weather.ts';
import { type GameState } from './state.ts';

// Ground and water (5.3): the one trait each of clay and sand has toward the rain and the heat wave. Rain waters every open field
// while it falls (sim/weather.ts); on top of that, a clay tile holds the water it was given for about a day, and in a heat wave
// is half watered with no rain held. Sand drains: it is watered by rain only while it rains, which is what every other ground gets
// too, so loam, silt, stony and sand are all "while it rains". A field's water is the share of its nine tiles that are watered
// (as its fertility is the mean of its tiles'), with a sprinkler's share the least any tile gets. A greenhouse is out of the rain,
// so none of this reaches it. Nothing is saved: whether it rained in the last day follows from the seeded weather.

const HOUR = DAY_SECONDS / 24;

/** How long a clay tile stays watered after the rain stops: a game day. */
export const CLAY_HOLD = DAY_SECONDS;
/** How watered a clay tile is in a heat wave with no rain held (0–1): half. */
export const CLAY_HEAT = 0.5;

/** The latest hour mark, at most CLAY_HOLD back from `time` (and not before the commission began), at which it rains; null if it doesn't. */
const memo: { sc: Scenario | null; events: unknown; n: number; time: number; last: number | null } = { sc: null, events: null, n: 0, time: NaN, last: null };
export function lastRainBefore(sc: Scenario, time: number): number | null {
  if (memo.sc === sc && memo.events === sc.events && memo.n === sc.events.length && memo.time === time) return memo.last;
  let last: number | null = null;
  for (let t = time; t >= Math.max(0, time - CLAY_HOLD) - 1e-9; t -= HOUR) if (raining(sc, t)) { last = t; break; }
  memo.sc = sc; memo.events = sc.events; memo.n = sc.events.length; memo.time = time; memo.last = last;
  return last;
}

/** Whether it rained within the last CLAY_HOLD (or rains now): clay is watered. */
export const soaked = (sc: Scenario, time: number) => lastRainBefore(sc, time) !== null;

/** Whether a heat wave is under way at a time, in the events a scenario, or a projection's view of one, holds. */
export const heatWaveAt = (sc: Pick<Scenario, 'events'>, time: number) => activeEvents(sc, time).some((a) => a.event.kind === 'heatWave');

/**
 * How watered a field (a footprint at (x, y); `open` for one in the rain, not a greenhouse) is at a time, not counting water at its
 * edge: the mean over its tiles. A tile has the sprinklers' `share` of power at least; rain waters it fully; a clay tile also is
 * while it holds the rain of the last day, and half in a heat wave.
 */
export function waterOf(s: GameState, open: boolean, x: number, y: number, share: number, time = s.time): number {
  if (!open) return share;
  if (raining(s.scenario, time)) return 1;
  const clay = groundUnder(s, x, y)[GROUND.clay];
  if (!clay) return share;
  const floor = soaked(s.scenario, time) ? 1 : heatWaveAt(s.scenario, time) ? CLAY_HEAT : 0;
  return (clay * Math.max(share, floor) + (9 - clay) * share) / 9;
}

/** The latest time an hour-by-hour projection knows it rained, as a slow run takes it and a fast run does (null: not within the last day). */
export function rainKnown(sc: Scenario, time: number): { lo: number; hi: number } {
  const last = lastRainBefore(sc, time);
  if (last === null) return { lo: -Infinity, hi: -Infinity };
  // Whole hours are sampled, so the rain may have lasted up to the next mark.
  return { lo: last, hi: Math.min(time, last + HOUR) };
}

/**
 * The share of the hour from `hour` that a clay tile is watered by rain it held or got, given the hour's rain share `r` and when
 * rain was last known (`end`); a slow run takes the least (rain at the start of the hour, ended as soon as it can have), a fast run the
 * most (rain that may come any time in it and last to its end).
 */
export function clayHourWet(r: number, end: number, hour: number, fast: boolean): { wet: number; end: number } {
  const held = Math.max(0, Math.min(1, (end + CLAY_HOLD - hour) / HOUR));
  if (fast) return r > 0 ? { wet: 1, end: hour + HOUR } : { wet: held, end };
  return { wet: Math.max(r, held), end: r > 0 ? hour + r * HOUR : end };
}

/** What the inspector and the placement card say of a field's water from the ground it stands on (null: nothing to say, or the rain doesn't reach it). */
export function groundWaterNote(s: GameState, open: boolean, x: number, y: number): string | null {
  if (!open) return null;
  const kinds = groundUnder(s, x, y), clay = kinds[GROUND.clay], sand = kinds[GROUND.sand], notes: string[] = [];
  if (clay) notes.push(`clay under ${clay} of 9 tiles holds the rain for a day${heatWaveAt(s.scenario, s.time) && !soaked(s.scenario, s.time) ? ' and is half watered in this heat' : ' and is half watered in a heat wave'}`);
  if (sand) notes.push(`sand under ${sand} of 9 tiles drains: watered only while it rains`);
  return notes.length ? notes.join('; ') : null;
}
