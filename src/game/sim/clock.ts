import { DAY_SECONDS, START_HOUR } from '../data.ts';
import { noise1 } from '../rng.ts';
import { type Scenario } from '../scenarios.ts';

// Time, sun and wind: the hour and day of the game clock, how bright the sun is and how hard the wind blows.

/** The hour of day, 0–24. */
export const hourAt = (time: number) => (START_HOUR + (time / DAY_SECONDS) * 24) % 24;
export const dayAt = (time: number) => 1 + Math.floor((time / DAY_SECONDS * 24 + START_HOUR) / 24);

/** Solar strength at a time: 0 at night, up to the season's strength at noon. */
export function sunAt(sc: Scenario, time: number) {
  const h = hourAt(time), sun = sc.climate.sun;
  if (h <= sun.rise || h >= sun.set) return 0;
  return sun.strength * Math.sin(Math.PI * (h - sun.rise) / (sun.set - sun.rise));
}

/** Wind strength 0–1 at a time: a smooth seeded curve around the season's mean. */
export function windAt(sc: Scenario, time: number) {
  const w = sc.climate.wind;
  const n = noise1(time / 45, sc.seed + 77) * 0.7 + noise1(time / 11, sc.seed + 78) * 0.3;
  return Math.max(0.05, Math.min(1, w.mean + (n - 0.5) * 2 * w.gust));
}
