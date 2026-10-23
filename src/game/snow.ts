import { DAY_SECONDS } from './data.ts';
import { endOf, EVENTS, type Active, type WeatherEvent } from './events.ts';
import type { Scenario } from './scenarios.ts';
import { weatherAt } from './sim/weather.ts';

// Snow: on the panels after a blizzard, until it melts (a rule: the panels make less), and lying on the ground and the roofs
// during and after snowfall (only the look).

const HOUR = DAY_SECONDS / 24;

// ---- Snow on the panels ----

/** The hours a blizzard takes to bury the panels, from when it begins. */
export const BUILD_HOURS = 3;
/** The share of its light a panel under snow loses, at its deepest: a few percent still get through. */
export const PANEL_BLOCK = 0.92;
/** The snow on the panels, as a share of its deepest, below which it isn't told as snow. */
export const PANEL_FROM = 0.2;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** How deep the snow a blizzard leaves lies on the panels at a time, 0–1: it builds while the blizzard lasts, then melts off evenly over the hours the event lingers. */
export function snowOf(e: WeatherEvent, time: number): number {
  const melt = (EVENTS[e.kind].lingers ?? 0) * HOUR;
  if (!melt || time < e.start) return 0;
  const built = (at: number) => smooth(Math.min(1, (at - e.start) / (BUILD_HOURS * HOUR)));
  if (time < endOf(e)) return built(time);
  // Whatever it has built by the time it ends melts off from there.
  const left = 1 - (time - endOf(e)) / melt;
  return left > 0 ? built(endOf(e)) * left : 0;
}

/** The blizzard whose snow lies deepest on the panels now, with how deep; null when none lies. */
export function panelSnow(sc: Pick<Scenario, 'events'>, time: number): Active | null {
  let best: Active | null = null;
  for (const event of sc.events) {
    const intensity = snowOf(event, time);
    if (intensity > 0 && (!best || intensity > best.intensity)) best = { event, intensity };
  }
  return best;
}

/** The share of the sun's light that reaches a panel through the snow on it, 0–1. */
export const panelShare = (sc: Pick<Scenario, 'events'>, time: number): number => (sc.events.length ? 1 - PANEL_BLOCK * (panelSnow(sc, time)?.intensity ?? 0) : 1);

// ---- Snow on the ground ----

/** Game hours snow takes to bury the ground at a full fall, and how long it lies: it halves every MELT_HALF hours. */
const FILL_HOURS = 3, MELT_HALF = 9;
/** How far back, in game hours, the snow that fell still counts, and the step it is counted in. */
const WINDOW = 30, STEP_HOURS = 0.5;

/**
 * How much of the ground lies under snow at a time, 0–1 (the look): winter's snow showers and a blizzard lay it down as they
 * fall, a full fall burying the ground in a few hours, and it melts slowly once it has stopped. A function of the weather so far,
 * so a game loaded mid-winter lies under the same snow. None outside winter.
 */
export function lyingSnow(sc: Scenario, time: number): number {
  if (sc.climate.season !== 'winter') return 0;
  const decay = 0.5 ** (STEP_HOURS / MELT_HALF);
  let depth = 0;
  // Forward from the start of the window: it gains what falls, to a full cover at most, and melts a little each step.
  for (let k = Math.min(Math.ceil(WINDOW / STEP_HOURS), Math.floor(time / (STEP_HOURS * HOUR))); k >= 0; k--) {
    depth = Math.min(1, depth * decay + weatherAt(sc, time - k * STEP_HOURS * HOUR).precip * STEP_HOURS / FILL_HOURS);
  }
  return depth;
}
