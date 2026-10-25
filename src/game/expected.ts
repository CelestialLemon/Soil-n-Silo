import { CLOUD_DIM, RAIN_FROM, SHOWER_CLOUD, SPELL_LEAST, SPELL_MOST } from './sim/weather.ts';
import type { Climate } from './seasons.ts';
import { RAIN_COOLING, warmthByHour } from './warmth.ts';

// The usual weather (3.4): what a season and its character give on average, the "expected" twin of the seeded curves in
// sim/weather.ts, sim/clock.ts and warmth.ts. Without a station the projections (tonight's charge, a field's soil ahead) read
// these instead of the seeded weather ahead. Pure and derived from the same constants the seeded curves use, so a change to a
// spell's length or strength moves both; `test/expected.test.ts` holds each to the long-run mean of the seeded curves.
//
// A spell condition (cloud, showers, calm) is, at any time, `a + (b - a) · smooth(f)`: a and b are the strengths of two spells
// side by side (each 0, or between SPELL_LEAST and SPELL_MOST, "on" with the season's share) and f is how far across the glide
// it is. At a time no one knows, a, b and f are independent: `spellLaw` is that distribution on a fine grid, and cloud (the
// larger of the cloudy spells and the cloud a shower brings) is worked out from the laws of the two independent processes.

/** The grid the laws are kept on: values 0, 1/BINS … 1. */
const BINS = 400;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** The distribution of a spell condition at an unknown time: the mass at 0, 1/BINS … 1 (mass between grid points is split between its neighbours, so the mean is exact). */
export function spellLaw(share: number): Float64Array {
  const law = new Float64Array(BINS + 1), K = 24, M = 24;
  // One spell's strength: off with probability 1 − share, else spread evenly between the least and the most.
  const spell: [number, number][] = [[0, 1 - share]];
  for (let i = 0; i < K; i++) spell.push([SPELL_LEAST + (SPELL_MOST - SPELL_LEAST) * (i + 0.5) / K, share / K]);
  const put = (v: number, w: number) => {
    const x = v * BINS, i = Math.min(BINS - 1, Math.floor(x)), f = x - i;
    law[i] += w * (1 - f); law[i + 1] += w * f;
  };
  for (const [a, wa] of spell) {
    if (wa <= 0) continue;
    for (const [b, wb] of spell) {
      if (wb <= 0) continue;
      for (let j = 0; j < M; j++) put(a + (b - a) * smooth((j + 0.5) / M), wa * wb / M);
    }
  }
  return law;
}

const mean = (law: Float64Array) => law.reduce((n, w, k) => n + w * k / BINS, 0);

/** What is usual in a climate, as long-run averages. */
export interface Usual {
  /** The share of the sky covered on average, 0–1 (cloudy spells and the cloud showers bring). */
  cloud: number;
  /** The sun's share left by cloud on average. */
  clear: number;
  /** The share of time the sky showers (rain; in winter, snow): a field is watered that share of the time, outside winter. */
  showers: number;
  /** How hard it rains or snows on average (0 in dry spells), 0–1. */
  precip: number;
  /** The wind's share left by calm spells on average. */
  calm: number;
  /** The mean wind, 0–1 of a full wind. */
  wind: number;
}

const cache = new Map<string, Usual>();

type Source = Pick<Climate, 'conditions' | 'wind'>;

/** The long-run averages of a climate's everyday weather. */
export function usualOf(c: Source): Usual {
  const key = `${c.conditions.cloud},${c.conditions.rain},${c.conditions.calm},${c.wind.mean}`;
  let u = cache.get(key);
  if (u) return u;
  const cloudy = spellLaw(c.conditions.cloud), rainy = spellLaw(c.conditions.rain);
  // Showers fall where the rain spell is past RAIN_FROM; the sky is then at least as covered as they make it.
  const rainFrom = Math.ceil(RAIN_FROM * BINS - 1e-9);
  let precip = 0, showers = 0, cloud = 0;
  for (let r = 0; r <= BINS; r++) {
    const wr = rainy[r];
    if (!wr) continue;
    const p = r >= rainFrom ? r / BINS : 0, cover = Math.min(1, p * SHOWER_CLOUD);
    if (p > 0) { precip += wr * p; showers += wr; }
    for (let k = 0; k <= BINS; k++) cloud += wr * cloudy[k] * Math.max(k / BINS, cover);
  }
  const calm = 1 - 0.6 * mean(spellLaw(c.conditions.calm));
  u = { cloud, clear: 1 - CLOUD_DIM * cloud, showers, precip, calm, wind: c.wind.mean * calm };
  cache.set(key, u);
  return u;
}

/** The sun's strength at an hour of the day on a usual day: the season's daily curve times the average share cloud leaves. */
export function usualSun(c: Pick<Climate, 'sun' | 'conditions' | 'wind'>, hour: number): number {
  return clearSun(c, hour) * usualOf(c).clear;
}

/** The sun's strength at an hour of the day under a clear sky: 0 at night, the season's strength at noon. */
export function clearSun(c: Pick<Climate, 'sun'>, hour: number): number {
  const sun = c.sun;
  return hour <= sun.rise || hour >= sun.set ? 0 : sun.strength * Math.sin(Math.PI * (hour - sun.rise) / (sun.set - sun.rise));
}

/** The warmth at an hour of the day on a usual day: the season's daily curve without the day's drift, cooled by the average rain. */
export function usualWarmth(c: Pick<Climate, 'warmth' | 'sun' | 'conditions' | 'wind'>, hour: number): number {
  return warmthByHour(c, hour) - RAIN_COOLING * usualOf(c).precip;
}
