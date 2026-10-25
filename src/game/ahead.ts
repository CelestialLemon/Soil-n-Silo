import { DAY_SECONDS } from './data.ts';
import { endOf, pushesAt, timeOf, type WeatherEvent } from './events.ts';
import { clearSun, usualOf, usualWarmth } from './expected.ts';
import { cornerWorlds, FAMILIES, issueTimeOf, type EventForecast, type Forecast, type Range } from './outlook.ts';
import type { Scenario } from './scenarios.ts';
import { CHARACTERS, SEASONS, type Climate } from './seasons.ts';
import { dayAt, hourAt, sunAt, windAt } from './sim/clock.ts';
import { CALM_DROP, CLOUD_DIM, clearShare, RAIN_FROM, raining, SHOWER_CLOUD } from './sim/weather.ts';
import { stationForecast } from './station.ts';
import type { GameState } from './state.ts';
import { eventWarmth, RAIN_COOLING, warmthByHour, warmthIn } from './warmth.ts';
import type { View } from './wind.ts';

// The weather ahead, as a projection reads it (3.4). The seeded weather is known to the game and not to the player, so a screen that
// looks ahead (tonight's charge, a field's soil in ten minutes) reads it through one of these, never from the scenario:
//
//   truth     the seeded weather itself (tests, and the bot's checks; nothing the player sees)
//   usual     what a season and character give on average (expected.ts), no events that haven't begun. Without a station.
//   forecast  the station's forecast (outlook.ts): the projection is run at the ends of what it allows, in several `Ahead`s
//
// An `Ahead` is a view, not a copy of the game: the rules read the sun, wind, rain and warmth through it and the events in force
// (`View`: the gale that stops a turbine, the snow on the panels, the dust, the frost). What is known now stays known: the weather of
// this hour eases to the usual (or the forecast's) over `EASE_HOURS`, and an event under way keeps on through the projection (its
// length isn't known without a station; with one, it is the forecast's range).
//
// What a forecast lens reads is the forecast object and what the player sees now (which events have begun and ended, with their
// kind and strength, the weather this hour): never the scenario's events ahead nor its seeded curves ahead.

const HOUR = DAY_SECONDS / 24;

/** The hours the weather now takes to ease to the usual (linearly). */
export const EASE_HOURS = 1;

/** What a projection reads of the weather at a time. */
export interface Ahead extends View {
  /** The sun's strength: the season's curve times the share cloud leaves (and an event's dimming), not yet through snow on the panels. */
  sun(time: number): number;
  /** The wind, 0–1. */
  wind(time: number): number;
  /** The share of the time, 0–1, that rain falls and waters every field and rests the sprinklers (0 in winter: snow does neither). */
  rain(time: number): number;
  /** The valley's warmth in °C. */
  warmth(time: number): number;
}

/** How a projection reads the weather ahead. */
export type Reading =
  | { kind: 'truth' }
  | { kind: 'usual' }
  /** The station's forecast; `stale` when no station is renewing it (the label then says what it is from). */
  | { kind: 'forecast'; forecast: Forecast; stale: boolean };

export const TRUTH: Reading = { kind: 'truth' };
export const USUAL: Reading = { kind: 'usual' };

/** The conditions a projection may vary over a forecast's ranges. */
export type Dim = 'sun' | 'wind' | 'rain' | 'warmth';

// ---- Now ----

/** What the player can see of the weather now, held for the next hours. */
interface Now {
  /** The share of the sun cloud leaves. */
  cloud: number;
  /** The wind before the events' push. */
  windBase: number;
  /** 1 when it rains now. */
  rain: number;
}

function nowOf(sc: Scenario, now: number): Now {
  const p = pushesAt(sc, now);
  return { cloud: clearShare(sc, now), windBase: windAt(sc, now) - p.wind, rain: raining(sc, now) ? 1 : 0 };
}

/** A length an event under way is taken to keep on for. */
const FOR_GOOD = 1e9;

/** The events a projection takes to be in force: the ended ones as they were, the ones under way for good (their length isn't known), none that haven't begun. */
export function keptEvents(sc: Pick<Scenario, 'events'>, now: number): WeatherEvent[] {
  return sc.events.filter((e) => e.start <= now).map((e) => (endOf(e) > now ? { ...e, length: FOR_GOOD } : e));
}

// ---- Building a view ----

/** What a forecast says of the conditions at a time (the range of its day, widened for what a day's range does not hold): undefined where it has nothing to say. */
interface Picks {
  sun?: (time: number) => Range | undefined;
  wind?: (time: number) => Range | undefined;
  rain?: (time: number) => Range | undefined;
  warmth?: (time: number) => Range | undefined;
}

/** How far along its range a lens reads each condition, 0 (the lowest) to 1 (the highest). */
type Level = Partial<Record<Dim, number>>;

/**
 * How fast, per game hour, the sun's share and the wind can change in the seeded weather at the most (a cloud or calm spell glides in over
 * hours, a shower in over two, and an event's ramp is an hour and a half), so how far an hour ahead can stray from what is known now.
 */
const DRIFT = { sun: 0.8, wind: 1.3 } as const;
/** The sun's share can also jump when a shower sets in: rain under RAIN_FROM is only a drizzle, and cloud takes its share at once. */
const JUMP = { sun: CLOUD_DIM * SHOWER_CLOUD * RAIN_FROM, wind: 0 } as const;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * A view of the weather ahead: the usual weather where nothing says otherwise, and the picks of a forecast's days where they do (they
 * hold the events' effects on sun, wind, rain and warmth; the events in `events` are for what the picks do not hold: the gale that
 * stops a turbine, the snow on the panels, ice, dust and frost, and every effect on a day without picks). A lens reads a pick at `level`.
 */
function viewOf(sc: Scenario, now: number, events: WeatherEvent[], picks?: Picks, level: Level = {}, margins: Margins = {}, days = new Map<number, { sun: number; wind: number }>()): Ahead {
  const c = sc.climate, u = usualOf(c), winter = c.season === 'winter', n = nowOf(sc, now);
  // A turbine in a gale is steady or not as the seeded noise goes: a forecast lens takes it at its worst when the wind is low and at its best when high; the usual weather, in the middle.
  const view: View = { events, gust: () => (picks ? 1 - (level.wind ?? 0.5) : 0.5) };
  // The weight of what is known now: it fades over EASE_HOURS.
  const ease = (t: number) => Math.max(0, 1 - (t - now) / (EASE_HOURS * HOUR));
  // Without a range, the weather now eases to the usual. With one, the weather lies in it, and within what it can have changed since now
  // (a lens reads it at its `level`): the cone round what is known narrows the range for the first hours and nests with every hour's.
  const mix = (dim: Dim, known: number, r: Range | undefined, usual: number, t: number) => {
    if (!r) { const w = ease(t); return w * known + (1 - w) * usual; }
    const reach = dim === 'sun' || dim === 'wind' ? (t > now ? DRIFT[dim] * (t - now) / HOUR + JUMP[dim] : 0) : Infinity;
    const lo = Math.max(r.lo, known - reach), hi = Math.min(r.hi, known + reach);
    return lo <= hi ? lo + (hi - lo) * (level[dim] ?? 0.5) : clamp(known, r.lo, r.hi);
  };
  const kept = { events, climate: c };
  // What the world's events do to a day's sun and wind on average (a forecast's day holds them): the sun's share of its clear curve and the wind's push, from the hourly middles as the day's numbers are.
  const pushOfDay = (t: number) => {
    const day = dayAt(t);
    let m = days.get(day);
    if (!m) {
      let sunSum = 0, clearSum = 0, windSum = 0, hours = 0;
      for (let h = 0; h < 24; h++) {
        const tt = timeOf(day, h + 0.5);
        if (tt < 0) continue;
        const p = pushesAt(view, tt), clear = clearSun(c, hourAt(tt));
        sunSum += clear * p.sun; clearSum += clear; windSum += p.wind; hours++;
      }
      days.set(day, (m = { sun: clearSum > 0 ? sunSum / clearSum : 1, wind: hours ? windSum / hours : 0 }));
    }
    return m;
  };
  // Cloud leaves the sun at least this share, and a wind of the season never leaves the range the season's mean, gusts and calm spells give.
  const sunLeast = 1 - CLOUD_DIM, windLeast = Math.max(0.05, (c.wind.mean - c.wind.gust) * (1 - CALM_DROP)), windMost = Math.min(1, c.wind.mean + c.wind.gust);
  // The usual day's warmth (without the seeded drift), with the events in force.
  const usualWarm = (t: number) => {
    const rain = pushesAt(view, t).rain;
    // (Rain an event brings cools more than the usual showers do.)
    return usualWarmth(c, hourAt(t)) - (rain >= RAIN_FROM ? RAIN_COOLING * Math.max(0, rain - u.precip) : 0) + eventWarmth(kept, t, warmthByHour(c, hourAt(t)));
  };
  const warmNow = warmthIn(sc, now);
  return {
    events, gust: view.gust,
    sun(t) {
      const clear = clearSun(c, hourAt(t));
      if (clear <= 0) return 0;
      const day = picks?.sun?.(t), p = pushOfDay(t).sun, m = margins.sun ?? 0;
      // A forecast's day holds the events' dimming too: the cloud's share is the day's, less what the world's events take, within what cloud takes at most.
      const r = day && (p > 1e-6 ? { lo: clamp(day.lo / p - m, sunLeast, 1), hi: clamp(day.hi / p + m, sunLeast, 1) } : { lo: sunLeast, hi: 1 });
      const p2 = pushesAt(view, t);
      // (Where there is no range, rain an event brings covers the sky too.)
      const rainy = !r && p2.rain >= RAIN_FROM ? 1 - CLOUD_DIM * Math.min(1, SHOWER_CLOUD * p2.rain) : 1;
      return clear * Math.min(mix('sun', n.cloud, r, u.clear, t), rainy) * p2.sun;
    },
    wind(t) {
      const day = picks?.wind?.(t), p = pushOfDay(t).wind, m = margins.wind ?? 0;
      // (Wind a gale pushes is cut off at a full wind, so a day it blows in says nothing of the wind without it, beyond the season's range.)
      const r = day && (p > 1e-9 ? { lo: windLeast, hi: windMost } : { lo: clamp(day.lo - m, windLeast, windMost), hi: clamp(day.hi + m, windLeast, windMost) });
      return clamp(mix('wind', n.windBase, r, u.wind, t) + pushesAt(view, t).wind, 0.05, 1);
    },
    rain(t) {
      if (winter) return 0;
      const r = picks?.rain?.(t);
      if (!r && pushesAt(view, t).rain >= RAIN_FROM) return 1;
      return clamp(mix('rain', n.rain, r, u.showers, t), 0, 1);
    },
    warmth(t) {
      const day = picks?.warmth?.(t);
      if (!day) return mix('warmth', warmNow, undefined, usualWarm(t), t);
      // The season's curve and the events' lift (their timing is the world's), as far either way as the day's drift and the rain's cooling
      // take it and the margin allows, inside what the day's lowest and highest hour allow.
      const at = warmthByHour(c, hourAt(t)) + eventWarmth(kept, t, warmthByHour(c, hourAt(t))), lo = Math.max(day.lo, at - c.warmth.drift - RAIN_COOLING - (margins.warmth ?? 0)), hi = Math.min(day.hi, at + c.warmth.drift + (margins.warmth ?? 0));
      return mix('warmth', warmNow, lo <= hi ? { lo, hi } : day, 0, t);
    },
  };
}

/** The seeded weather itself. */
export function truthView(sc: Scenario): Ahead {
  return { events: sc.events, sun: (t) => sunAt(sc, t), wind: (t) => windAt(sc, t), rain: (t) => (raining(sc, t) ? 1 : 0), warmth: (t) => warmthIn(sc, t) };
}

/** The usual weather from `now` on, with the events under way kept on. */
export const usualView = (sc: Scenario, now: number): Ahead => viewOf(sc, now, keptEvents(sc, now));

// ---- The forecast's worlds ----

/** The most worlds (combinations of the ways events may turn out) a projection runs over before it keeps to fewer ways for each event. */
const MAX_WORLDS = 256;

/**
 * The forecast as the player can read it at `at` (a game hour at or before now): what the station says, with what the player sees
 * since — which events have begun (with their kind, strength and start) and which are over — folded in. An event that has begun is
 * told in full; one that has not begun starts no earlier than `at`; one that is over is left to `keptEvents`. (What has begun or ended
 * is seen at `now`; the windows are held to the game hour `at`, so they are the same all through it.)
 */
function seenBy(sc: Scenario, f: Forecast, at: number, now: number): EventForecast[] {
  const out: EventForecast[] = [];
  for (const e of f.events) {
    const real = sc.events[e.id];
    if (!real || endOf(real) <= now) continue;
    const after = e.after !== null && sc.events[e.after] && endOf(sc.events[e.after]) > now ? e.after : null;
    if (real.start <= now) {
      const end: Range = { lo: Math.max(e.end.lo, at), hi: Math.max(e.end.hi, at) };
      out.push({ ...e, detail: 'full', certainty: 'certain', possible: [{ kind: real.kind, strength: real.strength }], underway: true, after,
        start: { lo: real.start, hi: real.start }, end, length: { lo: Math.max(e.length.lo, end.lo - real.start), hi: Math.min(e.length.hi, end.hi - real.start) } });
    } else out.push({ ...e, after, start: { lo: Math.max(e.start.lo, at), hi: Math.max(e.start.hi, at) }, end: { lo: Math.max(e.end.lo, at), hi: e.end.hi } });
  }
  return out;
}

const cache = new WeakMap<Forecast, Map<string, WeatherEvent[][]>>();

/**
 * The worlds a forecast allows, each a list of events to run in place of the scenario's: the events already over as they were, the
 * ones under way that the forecast doesn't name kept on, and for each event the forecast names (but only says "possible" of) every
 * corner it allows (`cornerWorlds`), combined. Events that begin after `until` can't reach the projection and are left out.
 */
export function worldsOf(sc: Scenario, f: Forecast, now: number, until: number): WeatherEvent[][] {
  // (The hour the player's forecast was in force: this hour's, or a sandbox forecast renewed at this very moment.)
  const at = Math.max(issueTimeOf(now), Math.min(f.issued, now));
  // What the player has seen begin and end (it changes the worlds), by event.
  const key = `${at}|${until}|${sc.events.map((e) => `${e.start <= now ? 1 : 0}${endOf(e) <= now ? 1 : 0}`).join('')}`;
  let byKey = cache.get(f);
  const hit = byKey?.get(key);
  if (hit) return hit;
  const seen = seenBy(sc, f, at, now), named = new Set(seen.map((e) => e.id));
  const view: Forecast = { ...f, events: seen };
  const fixed = [
    ...sc.events.filter((e) => endOf(e) <= now),
    // Under way and not named (a station that is out of date): the player sees it, its end is not known.
    ...sc.events.filter((e, i) => e.start <= now && endOf(e) > now && !named.has(i)).map((e) => ({ ...e, length: FOR_GOOD })),
  ];
  // Each event at its corners, and at the middle of what its windows allow (a night's charge is not monotone in when a storm begins or ends: it can be worst between two corners).
  const centre = (e: EventForecast): EventForecast => {
    const start = (e.start.lo + e.start.hi) / 2, end = clamp((e.end.lo + e.end.hi) / 2, start + e.length.lo, start + e.length.hi);
    return { ...e, start: { lo: start, hi: start }, end: { lo: end, hi: end }, length: { lo: end - start, hi: end - start } };
  };
  const middle: Forecast = { ...f, events: seen.map(centre) };
  const roots0 = seen.filter((e) => e.after === null && e.detail !== 'family' && e.start.lo < until);
  // Every combination of the events' corners and middles; where there are too many to run, of their corners alone, and then of the
  // extremes of each (the earliest and latest start, the shortest and longest, of each kind and strength): the combined worst cases stay.
  const extremes = (all: WeatherEvent[][]): WeatherEvent[][] => {
    // (A world's first event is the one the entry is about; a flood laid after it comes with it.)
    const key = (w: WeatherEvent[]) => `${w[0].kind}/${w[0].strength}`, keys = [...new Set(all.map(key))];
    const keep = new Set<WeatherEvent[]>();
    for (const k of keys) {
      const own = all.filter((w) => key(w) === k);
      for (const f of [(w: WeatherEvent[]) => w[0].start, (w: WeatherEvent[]) => -w[0].start, (w: WeatherEvent[]) => endOf(w[0]), (w: WeatherEvent[]) => -endOf(w[0])]) keep.add(own.reduce((x, y) => (f(y) < f(x) ? y : x)));
    }
    return [...keep];
  };
  const tiers: ((e: EventForecast) => WeatherEvent[][])[] = [
    (e) => [...cornerWorlds(view, e), ...cornerWorlds(middle, centre(e))],
    (e) => cornerWorlds(view, e),
    (e) => extremes(cornerWorlds(view, e)),
  ];
  let worlds: WeatherEvent[][] = [[]];
  for (const tier of tiers) {
    const roots = roots0.map(tier).map((r) => r.filter((w, i, all) => all.findIndex((x) => JSON.stringify(x) === JSON.stringify(w)) === i));
    if (roots.reduce((n, r) => n * r.length, 1) > MAX_WORLDS && tier !== tiers[tiers.length - 1]) continue;
    worlds = [[]];
    for (const r of roots) worlds = worlds.flatMap((w) => r.map((x) => [...w, ...x]));
    // (At the last tier, if there are still too many, an even sample of them.)
    if (worlds.length > MAX_WORLDS) worlds = worlds.filter((_, i) => i % Math.ceil(worlds.length / MAX_WORLDS) === 0);
    break;
  }
  const out = worlds.map((w) => [...fixed, ...w]);
  if (!byKey) cache.set(f, (byKey = new Map<string, WeatherEvent[][]>()));
  if (byKey.size > 12) byKey.clear();
  byKey.set(key, out);
  return out;
}

// ---- Levels ----

/**
 * How much wider than a day's published range a projection reads each condition it varies, by the condition (the sun's and wind's
 * share are fractions of 1, the rain's a fraction of the day, the warmth °C): the hours a projection reads are not the day the
 * range holds, and the weather really varies through the day (a night's wind is not the day's mean, rain is on or off). Each
 * projection says how much it needs (a night's charge is more sensitive to the wind than a field's soil is to the hours of rain).
 */
export type Margins = Partial<Record<Dim, number>>;

/** The levels a lens takes in a range: its ends, and the middle (a result that is not monotone, a crop's pace across its comfortable warmth, peaks inside). */
export const LEVELS = [0, 0.5, 1] as const;

/** What the forecast says of each condition at a time, from the range of the day that time falls in. */
function picksOf(f: Forecast, climate: Scenario['climate'], margins: Margins): Picks {
  const days = new Map(f.days.map((d) => [d.day, d]));
  const winter = climate.season === 'winter';
  const grow = (r: Range, m: number, lo: number, hi: number): Range => ({ lo: clamp(r.lo - m, lo, hi), hi: clamp(r.hi + m, lo, hi) });
  return {
    sun: (t) => days.get(dayAt(t))?.conditions?.sun,
    wind: (t) => days.get(dayAt(t))?.conditions?.wind,
    rain: (t) => { const c = days.get(dayAt(t))?.conditions; return c && !winter ? grow({ lo: c.rain.lo / 24, hi: c.rain.hi / 24 }, margins.rain ?? 0, 0, 1) : undefined; },
    // No hour of the day is colder than its lowest or warmer than its highest.
    warmth: (t) => { const w = days.get(dayAt(t))?.warmth; return w && { lo: w.low.lo, hi: w.high.hi }; },
  };
}

/** The views a projection runs over: one for the truth or the usual weather; for a forecast, every world it allows at every level of the conditions `dims` it varies. */
export function viewsOf(s: GameState, reading: Reading, margins: Margins, until: number): Ahead[] {
  const sc = s.scenario, now = s.time;
  if (reading.kind === 'truth') return [truthView(sc)];
  if (reading.kind === 'usual') return [usualView(sc, now)];
  const f = reading.forecast, worlds = worldsOf(sc, f, now, until);
  // Every combination of levels of the dimensions that matter (the middle of the ones that don't).
  let levels: Partial<Record<Dim, number>>[] = [{}];
  for (const d of Object.keys(margins) as Dim[]) levels = levels.flatMap((l) => LEVELS.map((k) => ({ ...l, [d]: k })));
  const picks = picksOf(f, sc.climate, margins);
  return worlds.flatMap((w) => { const days = new Map<number, { sun: number; wind: number }>(); return levels.map((l) => viewOf(sc, now, w, picks, l, margins, days)); });
}

/**
 * The events the forecast only says are possible (a family, day three) that reach into the projection and that the player has not seen
 * begin or end: they are not in the range (nothing says what they are, or whether it is this one), so a projection says it does not
 * count them. Of the forecast reading only.
 */
export function possibleIn(sc: Scenario, reading: Reading, now: number, until: number): EventForecast[] {
  if (reading.kind !== 'forecast') return [];
  const f = reading.forecast, at = Math.max(issueTimeOf(now), Math.min(f.issued, now));
  return seenBy(sc, f, at, now).filter((e) => e.detail === 'family' && e.after === null && e.start.lo < until);
}

/** The least and the most of some numbers: the range the runs span. */
export const spread = (xs: readonly number[]): Range => ({ lo: Math.min(...xs), hi: Math.max(...xs) });

/** The reading of the weather ahead that this game's player has: the station's forecast, or the usual weather without one. */
export function readingOf(s: GameState): Reading {
  const station = stationForecast(s);
  return station ? { kind: 'forecast', forecast: station.forecast, stale: station.stale } : USUAL;
}

// ---- Words ----

/** The season and character as the usual weather is named: "a usual wet spring", "a usual autumn of gales". */
export function usualWords(c: Pick<Climate, 'season' | 'character'>): string {
  const season = SEASONS[c.season].name.toLowerCase(), ch = c.character ? CHARACTERS[c.character] : null;
  return `a usual ${ch ? (ch.noun ? `${season} of ${ch.word}` : `${ch.word} ${season}`) : season}`;
}

/** The time of day of a moment of play, "14:00". */
const clockWords = (time: number) => { const m = Math.round(hourAt(time) * 60) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };

/** What a projection says it assumes, as a fact: "for a usual winter", "from the forecast", "from the forecast of day 4, 14:00" (an out-of-date station). */
export function basisOf(reading: Reading, climate: Pick<Climate, 'season' | 'character'>, now: number): string {
  if (reading.kind === 'truth') return 'from the weather as it will be';
  if (reading.kind === 'usual') return `for ${usualWords(climate)}`;
  const f = reading.forecast;
  return reading.stale || f.issued < issueTimeOf(now) - 1e-6 ? `from the forecast of day ${dayAt(f.issued)}, ${clockWords(f.issued)}` : 'from the forecast';
}

/** What a projection does not count, as a fact: "a possible storm on day 5 is not counted" (empty where it counts everything the forecast says). */
export function notCounted(sc: Scenario, reading: Reading, now: number, until: number): string {
  const e = possibleIn(sc, reading, now, until);
  if (!e.length) return '';
  const words = e.map((x) => `a possible ${FAMILIES[x.family].name.toLowerCase()} on day ${dayAt(x.start.lo)}`);
  return `${words.join(' and ')} ${e.length > 1 ? 'are' : 'is'} not counted`;
}

/**
 * What a projection until `until` says it assumes: `basisOf`, and for an out-of-date forecast that does not reach so far, that the rest is
 * the usual weather (that part of the range is one value: nothing says otherwise).
 */
export function basisFor(reading: Reading, climate: Pick<Climate, 'season' | 'character'>, now: number, until: number): string {
  const basis = basisOf(reading, climate, now);
  if (reading.kind !== 'forecast' || !reading.stale) return basis;
  const reached = new Set(reading.forecast.days.filter((d) => d.conditions).map((d) => d.day));
  for (let day = dayAt(now); day <= dayAt(until); day++) if (!reached.has(day)) return `${basis}, the usual weather past it`;
  return basis;
}
