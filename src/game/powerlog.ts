import { DAY_SECONDS, START_HOUR, type BuildingId } from './data.ts';
import type { GameState } from './state.ts';

// Power over the last game day, for the Power panel: each in-game hour's average watts by source (solar, wind, digester,
// from batteries), what was used and what was short; the watts each kind of building drew; and each night's battery record
// (its lowest charge, when it ran dry, how long it was short). A game day lasts DAY_SECONDS of play, so an hour is
// HOUR_SECONDS. Kept in memory only (like history.ts).

export const HOUR_SECONDS = DAY_SECONDS / 24;
/** Nights kept. */
export const NIGHTS = 4;

/** One step's power across every network, in watts (stored and capacity in joules). */
export interface PowerStep {
  solar: number; wind: number; digester: number;
  /** Given by batteries, and taken in to charge them. */
  given: number; taken: number;
  /** Wanted, got (used), and wanted but not got (short). */
  wanted: number; used: number; short: number;
  stored: number; capacity: number;
  /** Whether it is night (no sun). */
  night: boolean;
}

type Sums = { solar: number; wind: number; digester: number; given: number; taken: number; wanted: number; used: number; short: number };
const SUM_KEYS: (keyof Sums)[] = ['solar', 'wind', 'digester', 'given', 'taken', 'wanted', 'used', 'short'];

interface Hour extends Sums {
  from: number;
  /** Seconds recorded (each sum is watts × seconds). */
  seconds: number;
  night: boolean;
  /** Watts × seconds used by each kind of building. */
  use: Partial<Record<BuildingId, number>>;
}

export interface Night {
  /** The day it began on (in the evening). */
  day: number;
  from: number;
  /** Seconds recorded, and seconds any network was short. */
  seconds: number;
  short: number;
  /** Batteries' lowest charge as a share of what they hold, and when (null: no batteries). */
  lowest: number | null;
  lowestAt: number;
  /** When the batteries first ran dry while short (null: they didn't). */
  dryAt: number | null;
}

interface Log { hours: Hour[]; nights: Night[] }
const all = new WeakMap<GameState, Log>();

function log(s: GameState): Log {
  let l = all.get(s);
  if (!l) all.set(s, (l = { hours: [], nights: [] }));
  return l;
}

const hourStart = (t: number) => Math.floor(t / HOUR_SECONDS + 1e-9) * HOUR_SECONDS;
/** The day a night belongs to: the evening it began. */
export const nightOf = (time: number, sunset: number) => {
  const hours = START_HOUR + time / DAY_SECONDS * 24, h = hours % 24, day = 1 + Math.floor(hours / 24);
  return h >= sunset ? day : day - 1;
};

/** Notes a step of power (`dt` long, ended now) and the watts each kind of building used in it. */
export function notePower(s: GameState, p: PowerStep, use: Partial<Record<BuildingId, number>>, dt: number) {
  const l = log(s), start = s.time - dt, from = hourStart(start);
  let h = l.hours[l.hours.length - 1];
  if (!h || h.from < from - 1e-6) {
    l.hours.push((h = { from, seconds: 0, night: p.night, use: {}, solar: 0, wind: 0, digester: 0, given: 0, taken: 0, wanted: 0, used: 0, short: 0 }));
    // A day and a bit, so the last 24 whole hours are always there.
    if (l.hours.length > 26) l.hours.splice(0, l.hours.length - 26);
  }
  h.seconds += dt;
  for (const k of SUM_KEYS) h[k] += p[k] * dt;
  for (const [type, w] of Object.entries(use) as [BuildingId, number][]) h.use[type] = (h.use[type] ?? 0) + w * dt;
  if (!p.night) return;
  // `night` is the step's end (the sun is read at the end of a step): so is the night it belongs to.
  const day = nightOf(s.time, s.scenario.weather.sunset);
  let n = l.nights[l.nights.length - 1];
  if (!n || n.day !== day) {
    l.nights.push((n = { day, from: start, seconds: 0, short: 0, lowest: null, lowestAt: start, dryAt: null }));
    if (l.nights.length > NIGHTS) l.nights.splice(0, l.nights.length - NIGHTS);
  }
  n.seconds += dt;
  if (p.short > 1e-6) n.short += dt;
  if (p.capacity > 0) {
    const k = p.stored / p.capacity;
    if (n.lowest === null || k < n.lowest - 1e-9) { n.lowest = k; n.lowestAt = s.time; }
    if (n.dryAt === null && k < 0.01 && p.short > 1e-6) n.dryAt = s.time;
  }
}

export interface HourAvg extends Sums { from: number; night: boolean; made: number }

export interface PowerDay {
  /** The last 24 in-game hours, oldest first, the one going on now last (null: not recorded). */
  hours: (HourAvg | null)[];
  /** Seconds of play the averages cover. */
  seconds: number;
  /** Average watts over what was recorded of those hours. */
  avg: Sums & { made: number };
  /** Average watts each kind of building used over them. */
  use: Partial<Record<BuildingId, number>>;
}

/** Power over the last game day. */
export function powerDay(s: GameState): PowerDay {
  // The hour the last step was in (at an hour's turn, the one just ended).
  const l = log(s), now = hourStart(s.time - 1e-6);
  const byFrom = new Map(l.hours.map((h) => [Math.round(h.from / HOUR_SECONDS), h]));
  const hours: (HourAvg | null)[] = [];
  const total: Sums = { solar: 0, wind: 0, digester: 0, given: 0, taken: 0, wanted: 0, used: 0, short: 0 };
  const use: Partial<Record<BuildingId, number>> = {};
  let seconds = 0;
  for (let i = 23; i >= 0; i--) {
    const h = byFrom.get(Math.round(now / HOUR_SECONDS) - i);
    if (!h || h.seconds <= 0) { hours.push(null); continue; }
    const avg = { from: h.from, night: h.night } as HourAvg;
    for (const k of SUM_KEYS) { avg[k] = h[k] / h.seconds; total[k] += h[k]; }
    avg.made = avg.solar + avg.wind + avg.digester;
    hours.push(avg);
    seconds += h.seconds;
    for (const [type, e] of Object.entries(h.use) as [BuildingId, number][]) use[type] = (use[type] ?? 0) + e;
  }
  const avg = { ...total, made: 0 };
  if (seconds > 0) {
    for (const k of SUM_KEYS) avg[k] = total[k] / seconds;
    for (const k of Object.keys(use) as BuildingId[]) use[k] = use[k]! / seconds;
  }
  avg.made = avg.solar + avg.wind + avg.digester;
  return { hours, seconds, avg, use };
}

/** The nights recorded, oldest first (the one going on now last, if it is night). */
export const nightsOf = (s: GameState): readonly Night[] => log(s).nights;
