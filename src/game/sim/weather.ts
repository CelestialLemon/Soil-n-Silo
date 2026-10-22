import { DAY_SECONDS, START_HOUR } from '../data.ts';
import { hash2 } from '../rng.ts';
import { type Scenario } from '../scenarios.ts';
import { type GameState } from '../state.ts';

// Conditions: the everyday weather inside a season, small and unannounced, seeded like the wind curve: cloud that dims the sun
// for a few hours, showers (snow in winter) and calm spells that lower the wind. The season and its character set how much of
// the time each lasts (`conditions` in seasons.ts); the seed sets when.

/** What the sky is doing. Snow is winter's precipitation: it doesn't water fields. */
export type Sky = 'clear' | 'cloudy' | 'rain' | 'snow';

export interface Weather {
  sky: Sky;
  /** How hard it rains or snows, 0–1 (0 unless the sky is rain or snow). For the look and the drawn rain. */
  precip: number;
  /** How much of the sky is covered, 0–1. */
  cloud: number;
}

/** The lengths, in game hours, of the spells each condition comes in. */
const SPELL = { cloud: 4, rain: 2.5, calm: 5 } as const;
/** Precipitation below this is only a drizzle in the making: the sky counts as cloudy, fields stay as they are. */
const RAIN_FROM = 0.12;
/** Cover above this reads as a cloudy sky. */
const CLOUDY_FROM = 0.35;
/** The most cloud takes off the sun, and the most a calm spell takes off the wind. */
const CLOUD_DIM = 0.65, CALM_DROP = 0.6;

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * A condition over time, 0–1: the game hours are cut into spells of `len` hours, each is "on" with chance `share` at a seeded
 * strength, and the strength glides from one spell's middle to the next, so a condition builds and fades.
 */
function spellAt(time: number, len: number, share: number, seed: number) {
  const h = START_HOUR + time / DAY_SECONDS * 24, c = h / len - 0.5, i = Math.floor(c);
  const at = (k: number) => (hash2(k, 1, seed) < share ? 0.35 + 0.65 * hash2(k, 2, seed) : 0);
  const a = at(i), b = at(i + 1);
  return a + (b - a) * smooth(c - i);
}

const rainAt = (sc: Scenario, time: number) => spellAt(time, SPELL.rain, sc.climate.conditions.rain, sc.seed + 91);

/** How hard it rains or snows at a time, 0–1. */
export const precipAt = (sc: Scenario, time: number) => { const p = rainAt(sc, time); return p >= RAIN_FROM ? p : 0; };

/** How much of the sky is covered, 0–1: the cloudy spells, and the cloud a shower brings. */
export function cloudAt(sc: Scenario, time: number) {
  return Math.max(spellAt(time, SPELL.cloud, sc.climate.conditions.cloud, sc.seed + 92), Math.min(1, precipAt(sc, time) * 1.5));
}

/** How still the air is, 0–1: a calm spell lowers the wind. */
export const calmAt = (sc: Scenario, time: number) => spellAt(time, SPELL.calm, sc.climate.conditions.calm, sc.seed + 93);

/** The sun's share left by cloud, 0.35–1. */
export const clearShare = (sc: Scenario, time: number) => 1 - CLOUD_DIM * cloudAt(sc, time);
/** The wind's share left by a calm spell, 0.4–1. */
export const windShare = (sc: Scenario, time: number) => 1 - CALM_DROP * calmAt(sc, time);

/** The weather at a time: clear, cloudy, rain or snow, how hard it falls and how cloudy it is. */
export function weatherAt(sc: Scenario, time: number): Weather {
  const precip = precipAt(sc, time), cloud = cloudAt(sc, time);
  const sky: Sky = precip > 0 ? (sc.climate.season === 'winter' ? 'snow' : 'rain') : cloud >= CLOUDY_FROM ? 'cloudy' : 'clear';
  return { sky, precip, cloud };
}

/** The weather now in a game (for the HUD chip and the look). */
export const weatherNow = (s: GameState) => weatherAt(s.scenario, s.time);

/** Whether it rains at a time: every open field counts as watered and sprinklers rest. Snow doesn't. */
export const raining = (sc: Scenario, time: number) => sc.climate.season !== 'winter' && precipAt(sc, time) > 0;
