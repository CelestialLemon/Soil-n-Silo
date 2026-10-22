import { DAY_SECONDS, FIELD, type CropDef } from './data.ts';
import { noise1 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import type { GameState } from './state.ts';
import { hourAt } from './sim/clock.ts';
import { precipAt } from './sim/weather.ts';

// Warmth: the valley's temperature in °C, one number for the whole valley, and what it does to a crop.

/** Below this the valley is in frost. */
export const FROST = 0;

/** The hour of the afternoon it is warmest. It is coldest an hour before the sun rises. */
const WARMEST = 15;

/**
 * The warmth the season and the seed give at a time, before anything nudges it: a day's curve from the cold before dawn to the
 * afternoon's warmth between the season's low and high, and a smooth seeded drift of the whole day either way.
 */
export function warmthAt(sc: Scenario, time: number): number {
  const w = sc.climate.warmth, coldest = sc.climate.sun.rise - 1, h = hourAt(time);
  const up = WARMEST - coldest, u = (h - coldest + 24) % 24;
  const frac = u < up ? (1 - Math.cos(Math.PI * u / up)) / 2 : (1 + Math.cos(Math.PI * (u - up) / (24 - up))) / 2;
  const drift = (noise1(time / DAY_SECONDS, sc.seed + 91) - 0.5) * 2 * w.drift;
  return w.low + (w.high - w.low) * frac + drift;
}

/**
 * What nudges the warmth at a time, in °C: each entry adds its part. This is the one place conditions (rain, 1.3) and weather
 * events (a heat wave, a cold snap, phase 2) add theirs, by pushing a function here.
 */
export const WARMTH_NUDGES: ((s: GameState, time: number) => number)[] = [
  // Rain or snow cools the valley, by up to RAIN_COOLING at its heaviest.
  (s, time) => -RAIN_COOLING * precipAt(s.scenario, time),
];

/** The most, in °C, that precipitation cools the valley. */
const RAIN_COOLING = 2;
const warmthNudge = (s: GameState, time: number) => WARMTH_NUDGES.reduce((sum, f) => sum + f(s, time), 0);

/** The valley's warmth at a time (default now), in °C. */
export const warmthOf = (s: GameState, time = s.time): number => warmthAt(s.scenario, time) + warmthNudge(s, time);

/** How a crop's growth fares in a warmth, 0–1: full inside its comfortable range, slower smoothly outside it, none for a tender crop below FIELD.tenderStops. */
export function warmthPace(crop: CropDef, w: number): number {
  if (crop.tender && w < FIELD.tenderStops) return 0;
  const d = w < crop.comfort.low ? crop.comfort.low - w : w > crop.comfort.high ? w - crop.comfort.high : 0;
  return 1 / (1 + (d / FIELD.warmthWidth) ** 2);
}

/** Whether frost takes the growing crop in an open field. */
export const frostKills = (crop: CropDef, w: number) => crop.tender && w < FROST;

/** The growth multiplier of an unwatered field in a warmth: FIELD.dry, falling to FIELD.heatDry as the heat passes FIELD.heat. */
export function dryPace(w: number): number {
  const heat = Math.max(0, Math.min(1, (w - FIELD.heat) / (FIELD.heatFull - FIELD.heat)));
  return FIELD.dry + (FIELD.heatDry - FIELD.dry) * heat;
}

/** Where a warmth falls for a crop, as a fact: "Tomato, 12°C: cool for it, grows at about half speed". */
export function warmthFact(crop: CropDef, w: number): { text: string; tone?: 'bad' | 'good' } {
  const head = `${crop.name}, ${Math.round(w)}°C`;
  if (frostKills(crop, w)) return { text: `${head}: frost, a tender crop is lost in an open field`, tone: 'bad' };
  const f = warmthPace(crop, w);
  if (w >= crop.comfort.low && w <= crop.comfort.high) return { text: `${head}: comfortable, grows at full speed`, tone: 'good' };
  const word = w < crop.comfort.low ? 'cool' : 'warm';
  const how = f === 0 ? `it stops growing below ${FIELD.tenderStops}°C` : f >= 0.97 ? 'grows at nearly full speed' : `grows at about ${Math.round(f * 20) * 5}% speed`;
  return { text: `${head}: ${word} for it, ${how}`, tone: f < 0.6 ? 'bad' : undefined };
}
