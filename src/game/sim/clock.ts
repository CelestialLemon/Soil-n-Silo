import { DAY_SECONDS, START_HOUR } from '../data.ts';
import { noise1 } from '../rng.ts';
import { type Scenario } from '../scenarios.ts';

// Time, sun and wind: the hour and day of the game clock, how bright the sun is and how hard the wind blows.

/** The hour of day, 0–24. */
export const hourAt = (time: number) => (START_HOUR + (time / DAY_SECONDS) * 24) % 24;
export const dayAt = (time: number) => 1 + Math.floor((time / DAY_SECONDS * 24 + START_HOUR) / 24);

/** Solar strength 0–1 (times the scenario's sun) at a time. */
export function sunAt(sc: Scenario, time: number) {
  const h = hourAt(time), w = sc.weather;
  if (h <= w.sunrise || h >= w.sunset) return 0;
  return w.sun * Math.sin(Math.PI * (h - w.sunrise) / (w.sunset - w.sunrise));
}

/** Wind strength 0–1 at a time: a smooth seeded curve around the scenario's mean. */
export function windAt(sc: Scenario, time: number) {
  const w = sc.weather;
  const n = noise1(time / 45, sc.seed + 77) * 0.7 + noise1(time / 11, sc.seed + 78) * 0.3;
  return Math.max(0.05, Math.min(1, w.wind + (n - 0.5) * 2 * w.gust));
}
