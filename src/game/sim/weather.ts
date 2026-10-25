import { DAY_SECONDS, START_HOUR } from '../data.ts';
import { lookAt, pushesAt, type Haze } from '../events.ts';
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
  /** How warm the light is, 0–1 (a heat wave). For the look only. */
  heat: number;
  /** The haze on the ground (a fog, a dust storm), thickest first; null when there is none. For the look only. */
  haze: Haze | null;
}

/** The lengths, in game hours, of the spells each condition comes in. */
export const SPELL = { cloud: 4, rain: 2.5, calm: 5 } as const;
/** Precipitation below this is only a drizzle in the making: the sky counts as cloudy, fields stay as they are. */
export const RAIN_FROM = 0.12;
/** Cover above this reads as a cloudy sky. */
const CLOUDY_FROM = 0.35;
/** The most cloud takes off the sun, and the most a calm spell takes off the wind. */
export const CLOUD_DIM = 0.65, CALM_DROP = 0.6;
/** A spell that is on has a strength between these two (the shortest are 0.35 of the longest). */
export const SPELL_LEAST = 0.35, SPELL_MOST = 1;
/** How much of the sky a shower covers, per unit of how hard it falls. */
export const SHOWER_CLOUD = 1.5;

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * A condition over time, 0–1: the game hours are cut into spells of `len` hours, each is "on" with chance `share` at a seeded
 * strength, and the strength glides from one spell's middle to the next, so a condition builds and fades.
 */
function spellAt(time: number, len: number, share: number, seed: number) {
  const h = START_HOUR + time / DAY_SECONDS * 24, c = h / len - 0.5, i = Math.floor(c);
  const at = (k: number) => (hash2(k, 1, seed) < share ? SPELL_LEAST + (SPELL_MOST - SPELL_LEAST) * hash2(k, 2, seed) : 0);
  const a = at(i), b = at(i + 1);
  return a + (b - a) * smooth(c - i);
}

/** How hard the showers fall at a time, 0–1, before a weather event's rain (and before the drizzle under `RAIN_FROM` is dropped). */
export const showersAt = (sc: Scenario, time: number) => spellAt(time, SPELL.rain, sc.climate.conditions.rain, sc.seed + 91);
const rainAt = (sc: Scenario, time: number) => Math.max(showersAt(sc, time), pushesAt(sc, time).rain);

/** How hard it rains or snows at a time with no weather event: the showers alone (what the forecast's blocks tell, 3.7). */
export const fairPrecipAt = (sc: Scenario, time: number) => { const p = showersAt(sc, time); return p >= RAIN_FROM ? p : 0; };
/** How much the cloudy spells cover at a time, 0–1 (before the cloud of a shower or an event). */
export const cloudSpellAt = (sc: Scenario, time: number) => spellAt(time, SPELL.cloud, sc.climate.conditions.cloud, sc.seed + 92);
/** How much of the sky is covered at a time with no weather event: the cloudy spells and the cloud of a shower. */
export const fairCloudAt = (sc: Scenario, time: number) => Math.max(cloudSpellAt(sc, time), Math.min(1, fairPrecipAt(sc, time) * SHOWER_CLOUD));

/** How hard it rains or snows at a time, 0–1: the showers, and a weather event's rain. */
export const precipAt = (sc: Scenario, time: number) => { const p = rainAt(sc, time); return p >= RAIN_FROM ? p : 0; };

/** How much of the sky is covered, 0–1: the cloudy spells, the cloud a shower brings and a weather event's. */
export function cloudAt(sc: Scenario, time: number) {
  return Math.max(cloudSpellAt(sc, time), Math.min(1, precipAt(sc, time) * SHOWER_CLOUD), pushesAt(sc, time).cloud);
}

/** How still the air is, 0–1: a calm spell lowers the wind. */
export const calmAt = (sc: Scenario, time: number) => spellAt(time, SPELL.calm, sc.climate.conditions.calm, sc.seed + 93);

/** The sun's share left by cloud, 0.35–1. */
export const clearShare = (sc: Scenario, time: number) => 1 - CLOUD_DIM * cloudAt(sc, time);
/** The wind's share left by a calm spell, 0.4–1. */
export const windShare = (sc: Scenario, time: number) => 1 - CALM_DROP * calmAt(sc, time);

/**
 * The weather at a time: clear, cloudy, rain or snow, how hard it falls and how cloudy it is. Weather events darken the sky and
 * bring rain or snow of their own to the look (`lookAt`), over what the rules give (`precipAt`, `cloudAt`).
 */
export function weatherAt(sc: Scenario, time: number): Weather {
  const look = lookAt(sc, time), precip = Math.max(precipAt(sc, time), look.precip >= RAIN_FROM ? look.precip : 0), cloud = Math.max(cloudAt(sc, time), look.cloud, Math.min(1, precip * SHOWER_CLOUD));
  const sky: Sky = precip > 0 ? (sc.climate.season === 'winter' ? 'snow' : 'rain') : cloud >= CLOUDY_FROM ? 'cloudy' : 'clear';
  return { sky, precip, cloud, heat: look.heat, haze: look.haze };
}

/** The weather now in a game (for the HUD chip and the look). */
export const weatherNow = (s: GameState) => weatherAt(s.scenario, s.time);

/** Whether it rains at a time: every open field counts as watered and sprinklers rest. Snow doesn't. */
export const raining = (sc: Scenario, time: number) => sc.climate.season !== 'winter' && precipAt(sc, time) > 0;
