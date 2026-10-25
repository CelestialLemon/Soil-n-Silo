import { DAY_SECONDS, START_HOUR } from './data.ts';
import type { Range } from './outlook.ts';
import type { Scenario } from './scenarios.ts';
import { fairWindAt, hourAt } from './sim/clock.ts';
import { CLOUD_DIM, cloudSpellAt, RAIN_FROM, SHOWER_CLOUD, showersAt } from './sim/weather.ts';
import { warmthAt, warmthByHour } from './warmth.ts';

// The forecast's blocks of the day (3.7): the near-term conditions, a block of hours at a time, so tonight is not told only as a part of
// a day. Pure, no state; `forecastAt` carries them (`Forecast.blocks`).
//
// A block holds the weather with no weather event in it (cloudy spells and showers, the seasonal wind, the drift of the day's warmth):
// the events are told on their own, with windows, and a projection lays each one's effect at its own timing on top (ahead.ts), so the
// two never have to be pulled apart. What a block says is a range that every moment of its hours lies in, built like the rest of the
// forecast: the range of the true values over the block's hours, each end rounded outward to a fixed grid, so the truth is inside and
// the grid says only which cell. The blocks are aligned to the clock (midnight, then every 6, 3 or 1 hour), and a finer block lies in the
// coarser one that held its hours before, on a finer grid: the range over fewer hours is inside the range over more, and a finer cell
// holds the same value inside the coarser one, so each hour's forecast lies inside the last one's.
//
// The range over a block's hours comes from the weather in 5-game-minute bins: each bin holds the curve at its two ends and the
// most its curvature can take it past them (`pad`), so the numbers are certain bounds for every moment of the bin, not samples.

const HOUR = DAY_SECONDS / 24;
/** A bin: 5 game minutes. */
const BIN = HOUR / 12;
const BIN_HOURS = 1 / 12;

/** A block of the day: the hours from `start` to `end` (seconds of play, aligned to the clock), and what holds in them from the forecast's issue on. */
export interface Block {
  start: number;
  end: number;
  /** The sun's share of a clear sky that cloud leaves, 0.35–1 (cloudy spells and the cloud of a shower; no event). */
  sun: Range;
  /** The seasonal wind before a weather event's push and before it is held to 0.05–1, 0–1 of a full wind (the calm spells take it down). The strongest hour is `wind.hi`. */
  wind: Range;
  /** How hard the showers fall at any moment, 0–1: from 0 where the sky can be dry at some moment, to the hardest. A moment is wet where this is above 0. */
  precip: Range;
  /** The share of an hour (starting in the block) that it showers, 0–1. */
  rain: Range;
  /** The seeded drift of the day's warmth, °C (the day's curve is public; rain cooling is told by `precip`). */
  drift: Range;
}

// ---- The grid ----

/**
 * The cell of the grid of `size` that holds `v`, closed: `[k·size, (k + 1)·size]`. The cell comes from `floor(v · scale)` in whole
 * units, so the cells of sizes that divide each other nest exactly, whatever floating point does to `v`.
 */
export function cell(v: number, size: number, scale: number): Range {
  const units = Math.round(size * scale), k = Math.floor(Math.floor(v * scale) / units);
  return { lo: Math.min(k * units / scale, v), hi: Math.max((k + 1) * units / scale, v) };
}

/** The cell sizes of a block by its length and lead: the finer the nearer. Each divides the one above. */
interface Grid { share: number; rain: number; drift: number }
const GRIDS = { hour: { share: 0.025, rain: 0.125, drift: 0.25 }, three: { share: 0.05, rain: 0.125, drift: 0.5 }, six: { share: 0.1, rain: 0.25, drift: 1 }, far: { share: 0.2, rain: 0.5, drift: 2 } } satisfies Record<string, Grid>;

/** Up to this lead (game hours) a six-hour block splits in threes, and a three-hour block in hours. A six-hour block's grid steps down at `TWO_DAYS`. */
export const BLOCK_SPLIT = { three: 24, hour: 6 } as const;
const TWO_DAYS = 48;
/** How far ahead blocks are told, game hours. */
export const BLOCK_HOURS = 72;

// ---- Bins ----

/** What holds at every moment of a 5-minute bin. */
interface Bin {
  sun: Range; wind: Range; precip: Range; drift: Range;
}

interface Cache { bins: Map<number, Bin>; pad: { wind: number; shower: number; cloud: number; drift: number } }
const caches = new WeakMap<Scenario, Cache>();

function cacheOf(sc: Scenario): Cache {
  let c = caches.get(sc);
  if (!c) {
    const w = sc.climate.wind, M = Math.max(Math.abs(w.mean - w.gust), Math.abs(w.mean + w.gust)), d2 = BIN_HOURS * BIN_HOURS / 8;
    // The most the second derivative of each curve is (per game hour squared) times the bin's curvature allowance Δ²/8: a spell glides by a smoothstep (|f''| ≤ 6/len² of a unit).
    // Wind: the noise (4.5 h and 1.1 h knots) times the calm spell's share; the drift knots are a day apart.
    const K = 3.853 * w.gust + 0.144 * M;
    caches.set(sc, c = { bins: new Map(), pad: { wind: K * d2, shower: 6 / (2.5 * 2.5) * d2, cloud: 6 / (4 * 4) * d2, drift: 2 * sc.climate.warmth.drift * 6 / (24 * 24) * d2 } });
  }
  return c;
}

const hull = (a: number, b: number, pad: number): Range => ({ lo: Math.min(a, b) - pad, hi: Math.max(a, b) + pad });
const clamp01 = (r: Range): Range => ({ lo: Math.max(0, Math.min(1, r.lo)), hi: Math.max(0, Math.min(1, r.hi)) });
/** A shower below the drizzle's threshold is dry. */
const wet = (p: number) => (p >= RAIN_FROM ? p : 0);

function binOf(sc: Scenario, k: number): Bin {
  const cache = cacheOf(sc);
  let b = cache.bins.get(k);
  if (b) return b;
  const t0 = k * BIN, t1 = (k + 1) * BIN, pad = cache.pad;
  const shower = hull(showersAt(sc, t0), showersAt(sc, t1), pad.shower), spell = hull(cloudSpellAt(sc, t0), cloudSpellAt(sc, t1), pad.cloud);
  const precip: Range = clamp01({ lo: wet(shower.lo), hi: wet(shower.hi) });
  // The cloud is the greater of the spell and the shower's (1.5 of its strength): the sun's share is 1 less 0.65 of it.
  const cloud: Range = { lo: Math.max(spell.lo, Math.min(1, SHOWER_CLOUD * precip.lo)), hi: Math.max(spell.hi, Math.min(1, SHOWER_CLOUD * precip.hi)) };
  const drift = hull(warmthAt(sc, t0) - warmthByHour(sc.climate, hourAt(t0)), warmthAt(sc, t1) - warmthByHour(sc.climate, hourAt(t1)), pad.drift);
  cache.bins.set(k, b = {
    sun: clamp01({ lo: 1 - CLOUD_DIM * Math.min(1, cloud.hi), hi: 1 - CLOUD_DIM * Math.max(0, cloud.lo) }),
    wind: hull(fairWindAt(sc, t0), fairWindAt(sc, t1), pad.wind), precip, drift,
  });
  return b;
}

/** The index of the bin that holds a time. */
const binAt = (t: number) => Math.floor(t / BIN + 1e-9);

// ---- Blocks ----

/** The start of the clock's `size`-hour block (aligned to midnight) number `n`, in seconds of play. */
const blockStart = (n: number, size: number) => (n * size - START_HOUR) * HOUR;

function rangeOver(bins: Bin[], pick: (b: Bin) => Range): Range {
  let lo = Infinity, hi = -Infinity;
  for (const b of bins) { const r = pick(b); lo = Math.min(lo, r.lo); hi = Math.max(hi, r.hi); }
  return { lo, hi };
}

/**
 * The block from `start` to `end`, as the forecast issued at `issued` tells it: the range over the hours from the issue on (a block
 * that has begun is told for what is left of it), on the grid of `grid`.
 */
function blockOf(sc: Scenario, start: number, end: number, issued: number, grid: Grid, wetRuns: WetRuns): Block {
  const from = binAt(Math.max(start, issued)), to = binAt(end);
  const bins: Bin[] = [];
  for (let k = from; k < to; k++) bins.push(binOf(sc, k));
  // An hour starting in the block (sampled at five-minute midpoints) lies in twelve bins from one of `from … to`.
  let least = Infinity, most = -Infinity;
  for (let j = from; j <= to; j++) { least = Math.min(least, wetRuns.certain(j)); most = Math.max(most, wetRuns.maybe(j)); }
  // (The cell is held to the unit range a share lives in: a cell's end past 1 says nothing more.)
  const q = (r: Range, size: number, scale: number, lo = -Infinity, hi = Infinity): Range => ({ lo: Math.max(lo, cell(r.lo, size, scale).lo), hi: Math.min(hi, cell(r.hi, size, scale).hi) });
  const sun = rangeOver(bins, (b) => b.sun), wind = rangeOver(bins, (b) => b.wind), precip = rangeOver(bins, (b) => b.precip), drift = rangeOver(bins, (b) => b.drift);
  return {
    start, end,
    sun: q(sun, grid.share, 1000, 1 - CLOUD_DIM, 1), wind: q(wind, grid.share, 1000), precip: q(precip, grid.rain, 1000, 0, 1),
    rain: q({ lo: least, hi: most }, grid.rain, 1000, 0, 1), drift: q(drift, grid.drift, 100),
  };
}

/** For the twelve bins from a bin on: the share of them that are certainly wet, and that may be. */
interface WetRuns { certain(j: number): number; maybe(j: number): number }

function wetRunsOf(sc: Scenario, from: number, to: number): WetRuns {
  const certain: number[] = [0], maybe: number[] = [0];
  for (let k = from; k < to + 12; k++) {
    const p = binOf(sc, k).precip;
    certain.push(certain[certain.length - 1] + (p.lo > 0 ? 1 : 0)); maybe.push(maybe[maybe.length - 1] + (p.hi > 0 ? 1 : 0));
  }
  return { certain: (j) => (certain[j - from + 12] - certain[j - from]) / 12, maybe: (j) => (maybe[j - from + 12] - maybe[j - from]) / 12 };
}

/**
 * The blocks of the day that the forecast issued at `issued` tells: six-hour blocks (aligned to the clock) for the three days ahead, a
 * six-hour block split into threes once it begins within 24 h and a three-hour block into hours once it begins within 6 h, and
 * the one in progress for what is left of it. A block's grid steps down as it nears (`GRIDS`).
 */
export function blocksAt(sc: Scenario, issued: number): Block[] {
  const out: Block[] = [], clock = START_HOUR + issued / HOUR, last = issued + BLOCK_HOURS * HOUR;
  // (The last block ends at most six hours past `last`; an hour starting in it reads an hour more.)
  const runs = wetRunsOf(sc, binAt(issued), binAt(last) + 6 * 12 + 1);
  for (let n = Math.floor(clock / 6 + 1e-9); blockStart(n, 6) < last - 1e-6; n++) {
    const s6 = blockStart(n, 6), e6 = blockStart(n + 1, 6);
    if (e6 <= issued + 1e-6) continue;
    if ((s6 - issued) / HOUR > BLOCK_SPLIT.three + 1e-9) { out.push(blockOf(sc, s6, e6, issued, (s6 - issued) / HOUR > TWO_DAYS + 1e-9 ? GRIDS.far : GRIDS.six, runs)); continue; }
    for (let m = 0; m < 2; m++) {
      const s3 = s6 + m * 3 * HOUR, e3 = s3 + 3 * HOUR;
      if (e3 <= issued + 1e-6) continue;
      if ((s3 - issued) / HOUR > BLOCK_SPLIT.hour + 1e-9) { out.push(blockOf(sc, s3, e3, issued, GRIDS.three, runs)); continue; }
      for (let h = 0; h < 3; h++) {
        const s1 = s3 + h * HOUR, e1 = s1 + HOUR;
        if (e1 > issued + 1e-6) out.push(blockOf(sc, s1, e1, issued, GRIDS.hour, runs));
      }
    }
  }
  return out;
}

/** The block that holds a time, if the forecast tells one. */
export const blockAtTime = (blocks: readonly Block[], t: number): Block | undefined => blocks.find((b) => t >= b.start - 1e-9 && t < b.end - 1e-9);
