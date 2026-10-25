import { DAY_SECONDS, START_HOUR } from '../data.ts';
import { pushesAt } from '../events.ts';
import { noise1 } from '../rng.ts';
import { type Scenario } from '../scenarios.ts';
import { clearShare, windShare } from './weather.ts';

// Time, sun and wind: the hour and day of the game clock, how bright the sun is and how hard the wind blows (cloud and calm
// spells from sim/weather.ts dim them).

/** The hour of day, 0–24. */
export const hourAt = (time: number) => (START_HOUR + (time / DAY_SECONDS) * 24) % 24;
export const dayAt = (time: number) => 1 + Math.floor((time / DAY_SECONDS * 24 + START_HOUR) / 24);

/** Whether the sun is up at a time (even when cloud or a blizzard hides it). */
export const daylight = (sc: Scenario, time: number) => { const h = hourAt(time), sun = sc.climate.sun; return h > sun.rise && h < sun.set; };

/** Solar strength at a time: 0 at night, up to the season's strength at noon, less in cloud and as weather events dim it. */
export function sunAt(sc: Scenario, time: number) {
  const h = hourAt(time), sun = sc.climate.sun;
  if (h <= sun.rise || h >= sun.set) return 0;
  return sun.strength * Math.sin(Math.PI * (h - sun.rise) / (sun.set - sun.rise)) * clearShare(sc, time) * pushesAt(sc, time).sun;
}

/** The seasonal wind at a time before a weather event's push and before it is held to 0.05–1: a smooth seeded curve around the season's mean, lower in a calm spell. */
export function fairWindAt(sc: Scenario, time: number) {
  const w = sc.climate.wind;
  const n = noise1(time / 45, sc.seed + 77) * 0.7 + noise1(time / 11, sc.seed + 78) * 0.3;
  return (w.mean + (n - 0.5) * 2 * w.gust) * windShare(sc, time);
}

/** Wind strength 0–1 at a time: the seasonal wind (`fairWindAt`), and what weather events add. */
export const windAt = (sc: Scenario, time: number) => Math.max(0.05, Math.min(1, fairWindAt(sc, time) + pushesAt(sc, time).wind));
