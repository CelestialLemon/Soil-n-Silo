import { pushesAt } from './events.ts';
import { ANIMALS, DAY_SECONDS, FIELD, type CropDef } from './data.ts';
import { noise1 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import type { Climate } from './seasons.ts';
import type { GameState } from './state.ts';
import { hourAt } from './sim/clock.ts';
import { precipAt } from './sim/weather.ts';

// Warmth: the valley's temperature in °C, one number for the whole valley, and what it does to a crop.

/** Below this the valley is in frost. */
export const FROST = 0;

/** The hour of the afternoon it is warmest. It is coldest an hour before the sun rises. */
const WARMEST = 15;

/** A season's warmth at an hour of the day, before the seed's drift: the day's curve from the cold before dawn to the afternoon's warmth. */
export function warmthByHour(c: Pick<Climate, 'warmth' | 'sun'>, hour: number): number {
  const w = c.warmth, coldest = c.sun.rise - 1;
  const up = WARMEST - coldest, u = (hour - coldest + 24) % 24;
  const frac = u < up ? (1 - Math.cos(Math.PI * u / up)) / 2 : (1 + Math.cos(Math.PI * (u - up) / (24 - up))) / 2;
  return w.low + (w.high - w.low) * frac;
}

/**
 * The warmth the season and the seed give at a time, before anything nudges it: a day's curve from the cold before dawn to the
 * afternoon's warmth between the season's low and high, and a smooth seeded drift of the whole day either way.
 */
export function warmthAt(sc: Scenario, time: number): number {
  const drift = (noise1(time / DAY_SECONDS, sc.seed + 91) - 0.5) * 2 * sc.climate.warmth.drift;
  return warmthByHour(sc.climate, hourAt(time)) + drift;
}

/**
 * What nudges the warmth at a time, in °C: each entry adds its part. This is the one place conditions (rain, 1.3) and weather
 * events (a heat wave, a cold snap, phase 2) add theirs, by pushing a function here.
 */
export const WARMTH_NUDGES: ((s: GameState, time: number) => number)[] = [
  // Rain or snow cools the valley, by up to RAIN_COOLING at its heaviest.
  (s, time) => -RAIN_COOLING * precipAt(s.scenario, time),
  // A weather event lifts or drops the whole curve (a heat wave, a cold snap), its `warmth` push.
  (s, time) => pushesAt(s.scenario, time).warmth,
];

/** The most, in °C, that precipitation cools the valley. */
export const RAIN_COOLING = 2;
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

/** How fast the hens lay in a warmth, 0–1: the season's rate, slowed smoothly above ANIMALS.henHeat. */
export function henPace(sc: Scenario, w: number): number {
  const d = Math.max(0, w - ANIMALS.henHeat);
  return sc.climate.hens.lay / (1 + (d / ANIMALS.henHeatWidth) ** 2);
}

/** Whether the bees leave the hive in a warmth: not below ANIMALS.beesFly. */
export const beesFly = (w: number) => w >= ANIMALS.beesFly;

/** The coop's laying as a fact: "Hens: laying at half speed, 3°C". */
export function henFact(sc: Scenario, w: number): { text: string; tone?: 'bad' | 'good' } {
  const f = henPace(sc, w), head = `Hens, ${Math.round(w)}°C`;
  if (f >= 0.97) return { text: `${head}: laying at full speed`, tone: 'good' };
  return { text: `${head}: ${w > ANIMALS.henHeat ? 'too warm' : 'cool season'}, laying at about ${Math.round(f * 20) * 5}% speed`, tone: f < 0.6 ? 'bad' : undefined };
}

/** The bees as a fact: "Bees: staying in, 7°C". */
export function beesFact(w: number): { text: string; tone?: 'bad' | 'good' } {
  return beesFly(w) ? { text: `Bees: flying, ${Math.round(w)}°C`, tone: 'good' } : { text: `Bees: staying in, ${Math.round(w)}°C (below ${ANIMALS.beesFly}°C)`, tone: 'bad' };
}
