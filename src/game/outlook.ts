import { DAY_SECONDS, START_HOUR } from './data.ts';
import { allowed, endOf, eventName, EVENTS, hoursOf, timeOf, type EventKind, type Strength, type WeatherEvent } from './events.ts';
import type { Scenario } from './scenarios.ts';
import { dayAt, hourAt, sunAt, windAt } from './sim/clock.ts';
import { precipAt } from './sim/weather.ts';
import { warmthIn } from './warmth.ts';

// The forecast (3.1): what a weather station knows at a game hour about the next three days. It is the truth, blurred: a pure
// function of the scenario and the hour it was issued, so the game keeps only that hour. No DOM, no state.
//
// Every number and window is the cell of a fixed grid that holds the truth: a day, half a day, four hours, two hours for a time of
// day (aligned to midnight, so "day 6" is a cell); 12, 6, 2 °C for a day's high and low; and so on. The cell's size steps down as the
// lead shrinks, each size dividing the one above, so the truth is always inside and each hour's cell lies inside the last one's.
// (A fixed grid, rather than a window of a random position round the truth, because a window of seeded position gives the truth
// away: two forecasts of the same event would solve for it. A cell says only which cell.) Sizes are steps, not a line, so how wide a
// window is says how far off something is only to a tier.
//
// Everything derived is either the cell of the true derived value (a day's high, its hours of rain) or built from ranges by
// operations that keep nesting (a sum, an intersection with a bound that only tightens), never a fresh guess.
//
// The forecast object carries only what the panel would say: ranges, the kinds and strengths not yet ruled out, windows and
// "possible". The truth is not in it, so what reads it (the panel, the projections of 3.4) cannot tell apart two scenarios that
// it reads the same. An event that is not listed yet is not told yet (not "none coming"); one that has ended is dropped.

const HOUR = DAY_SECONDS / 24;

/** How far ahead a forecast looks, in game hours: three days. */
export const FORECAST_HOURS = 72;
/** The lead times (game hours) where the forecast sharpens: "tomorrow", "day two", "day three". */
export const TIER_HOURS = [24, 48, 72] as const;

/** A range of values, both ends inside it. Times are seconds of play, as everywhere; warmth is °C. */
export interface Range { lo: number; hi: number }

/** Whether `a` lies inside `b`. */
export const within = (a: Range, b: Range) => a.lo >= b.lo && a.hi <= b.hi;

// ---- Families ----

/** The few families an event is named by when it is still days away ("a storm, possible"). A family is all bad events or all good ones. */
export const FAMILY_IDS = ['storm', 'flood', 'heat', 'cold', 'haze', 'fair'] as const;
export type Family = typeof FAMILY_IDS[number];

/** Each family's name ("Storm", as `eventName` names a kind: the panel adds the article and the "possible") and the kinds in it. */
export const FAMILIES: Record<Family, { name: string; kinds: readonly EventKind[] }> = {
  storm: { name: 'Storm', kinds: ['thunderstorm', 'tropicalStorm', 'gale'] },
  flood: { name: 'Flood', kinds: ['flood'] },
  heat: { name: 'Heat spell', kinds: ['heatWave'] },
  cold: { name: 'Cold spell', kinds: ['lateFrost', 'coldSnap', 'blizzard'] },
  haze: { name: 'Haze', kinds: ['fog', 'dustStorm'] },
  fair: { name: 'Fair spell', kinds: ['softRain', 'warmSpell', 'steadyBreeze'] },
};

/** The family of an event kind. */
export const familyOf = (kind: EventKind): Family => FAMILY_IDS.find((f) => FAMILIES[f].kinds.includes(kind)) as Family;

// ---- The forecast ----

/** How much of an event the forecast names: its family ("a storm"), its kind ("a tropical storm"; its strength still open), or all of it. */
export type Detail = 'family' | 'kind' | 'full';
/** How sure the words are: a family is only "possible", a kind or a kind and strength "likely", an event under way "certain". Never doubt: it always comes. */
export type Certainty = 'possible' | 'likely' | 'certain';

/** One kind and strength an event may still turn out to be. */
export interface Possible { kind: EventKind; strength: Strength }

/**
 * An event the forecast names. Nothing in it is a guess that can be wrong: the event comes, inside `start` and `end`, as one of
 * `possible`. For the projections of 3.4: run at the ends of `start`, `end` (and `length`, where an event keeps its end) and at
 * every `possible` pair (`cornersOf`).
 */
export interface EventForecast {
  /** The event's index in `Scenario.events`: a handle that stays the same from one forecast to the next. */
  id: number;
  detail: Detail;
  certainty: Certainty;
  family: Family;
  /** A good event (soft rain, a warm spell, a steady breeze): it helps. */
  good: boolean;
  /** The kinds and strengths it may still be, only ever fewer as the lead shrinks: a family's kinds the season allows, then one kind, then one pair. */
  possible: readonly Possible[];
  /** It has begun: `start` is then one value, and `end` is what the forecast says is left ("the gale eases, 18:00–21:00"). */
  underway: boolean;
  /** When it begins (seconds of play). A flood after its storm begins when the storm ends (`after`). */
  start: Range;
  /** When it ends. */
  end: Range;
  /** How long it lasts (`end − start` at the corners, kept inside what the kind allows). */
  length: Range;
  /** The id of the storm this flood follows ("a tropical storm, then a flood"), where it follows one: named only once the storm's kind is. */
  after: number | null;
}

/** What to call an entry: its family while it is undecided ("Storm"), else its kind, with its strength where that is settled ("Tropical storm", "Hurricane"). */
export function nameOf(e: Pick<EventForecast, 'detail' | 'family' | 'possible'>): string {
  if (e.detail === 'family') return FAMILIES[e.family].name;
  const p = e.possible[0];
  return eventName(p.kind, e.detail === 'full' ? p.strength : 'ordinary');
}

/** The kinds the possible pairs name, and the strengths, each once. */
export const kindsOf = (e: Pick<EventForecast, 'possible'>): EventKind[] => [...new Set(e.possible.map((p) => p.kind))];
export const strengthsOf = (e: Pick<EventForecast, 'possible'>): Strength[] => [...new Set(e.possible.map((p) => p.strength))];

/** A day's conditions: numbers the words are chosen from. */
export interface Conditions {
  /** The sun's share of a clear day's, 0–1 (cloud, fog, a blizzard take it down). */
  sun: Range;
  /** The wind's mean over the day and its strongest hour, 0–1 of full strength (calm spells take the mean down). */
  wind: Range;
  gust: Range;
  /** The hours of the day it rains (or snows: winter). */
  rain: Range;
  /** The precipitation is snow. */
  snow: boolean;
}

export interface DayForecast {
  /** The commission's day (day 1 begins at the start hour). */
  day: number;
  /** The day's warmest and coldest hour, °C. */
  warmth: { low: Range; high: Range };
  /** The sun, wind and rain: null where it is too far off to say (day three). */
  conditions: Conditions | null;
}

/**
 * What the station knows at `issued`. `events` are by start; `days` are the commission's days from the one in progress to the last
 * whose noon is within three days, the sharpness of each by how near its noon is (so three or four days).
 */
export interface Forecast {
  /** When it was issued, in seconds of play (whole game hours, except a renewal after the weather was changed by hand). */
  issued: number;
  /** How far it looks: `issued` plus three days. */
  until: number;
  events: EventForecast[];
  days: DayForecast[];
}

/** The last whole game hour at or before `time`: when the forecast in force at `time` was issued. */
export const issueTimeOf = (time: number) => Math.floor(time / HOUR + 1e-9) * HOUR;

// ---- Cells ----

/** The size (game hours) of the cell of the day that a time is told in, by lead: within 6 h two hours, tomorrow four, day two half a day, day three a day. */
const TIME_CELL: readonly (readonly [number, number])[] = [[6, 2], [24, 4], [48, 12], [Infinity, 24]];
/** The size (°C) of the cell a day's high and low are told in, by lead of the day's noon: 2, 4, 8 (about ±1, ±2, ±4). */
const WARMTH_CELL: readonly (readonly [number, number])[] = [[24, 2], [48, 4], [Infinity, 8]];
/** The size of the cell a day's sun share, mean wind, strongest hour (0–1) and hours of rain are told in; beyond 48 h they are not told. */
const CONDITION_CELL: readonly (readonly [number, { sun: number; wind: number; gust: number; rain: number }])[] = [
  [24, { sun: 0.1, wind: 0.1, gust: 0.1, rain: 2 }],
  [48, { sun: 0.3, wind: 0.3, gust: 0.3, rain: 6 }],
];

/** The step of a table (ending in a step that takes the rest) that a lead falls in. */
const stepAt = <T>(table: readonly (readonly [number, T])[], lead: number): T => (table.find(([upTo]) => lead <= upTo + EPS) ?? table[table.length - 1])[1];

/** A tiny margin for comparing leads (floating point). */
const EPS = 1e-9;

/**
 * The cell of the grid of `size` that holds `v`, closed: `[k·size, (k + 1)·size]`. The cell comes from `floor(v · scale)` in whole
 * units, so the cells of sizes that divide each other nest exactly, whatever floating point does to `v`. (`scale` is how many units
 * make 1; `size` is a whole number of units.)
 */
function cell(v: number, size: number, scale: number): Range {
  const units = Math.round(size * scale), k = Math.floor(Math.floor(v * scale) / units);
  // Only floating point's last digit can put `v` outside; the truth is never told apart by this.
  return { lo: Math.min(k * units / scale, v), hi: Math.max((k + 1) * units / scale, v) };
}

const clampTo = (r: Range, lo: number, hi: number): Range => ({ lo: Math.min(hi, Math.max(lo, r.lo)), hi: Math.max(lo, Math.min(hi, r.hi)) });

// ---- Events ----

const STEP = HOUR / 2;

/** The cell a time is told in at a lead (game hours): a block of the day's clock, so a time of day reads the same in every forecast. */
function timeCell(t: number, lead: number): Range {
  const size = stepAt(TIME_CELL, lead), shift = START_HOUR * 2;
  // Whole half hours of the clock since midnight of day 1.
  const c = cell(t / STEP + shift, size * 2, 1);
  return { lo: Math.min((c.lo - shift) * STEP, t), hi: Math.max((c.hi - shift) * STEP, t) };
}

/** The event that this one follows (a flood after its storm), if any. */
function followedOf(sc: Scenario, i: number): number | null {
  const e = sc.events[i];
  for (let j = 0; j < sc.events.length; j++) {
    const p = sc.events[j];
    if (j !== i && EVENTS[p.kind].then === e.kind && p.strength === e.strength && Math.abs(endOf(p) - e.start) < 1e-6) return j;
  }
  return null;
}

/** The kind and strength pairs a kind can take (one strength, if it has no severe form). */
const pairsOf = (kind: EventKind): Possible[] => [{ kind, strength: 'ordinary' }, ...(EVENTS[kind].severe ? [{ kind, strength: 'severe' as const }] : [])];

const sameWorld = (a: Possible, b: Possible) => a.kind === b.kind && a.strength === b.strength;
const withTruth = (xs: Possible[], e: WeatherEvent): Possible[] => (xs.some((p) => sameWorld(p, e)) ? xs : [...xs, { kind: e.kind, strength: e.strength }]);

/** The events the forecast names at `issued`. */
function eventForecasts(sc: Scenario, issued: number): EventForecast[] {
  const season = sc.climate.season;
  const order = sc.events.map((_, i) => i).sort((a, b) => sc.events[a].start - sc.events[b].start || a - b);
  const made = new Map<number, EventForecast>();
  for (const i of order) {
    const e = sc.events[i], end = endOf(e);
    if (end <= issued) continue;
    const underway = e.start <= issued, lead = (e.start - issued) / HOUR;
    const pred = followedOf(sc, i), before = pred === null ? undefined : made.get(pred);
    let detail: Detail;
    if (underway) detail = 'full';
    else if (pred !== null) {
      // A flood is part of its storm: it is told once the storm's kind is.
      if (!before || before.detail === 'family') continue;
      detail = before.detail;
    } else if (lead > FORECAST_HOURS + EPS) continue;
    else detail = lead > TIER_HOURS[1] + EPS ? 'family' : lead > TIER_HOURS[0] + EPS ? 'kind' : 'full';

    // What it may be.
    let possible: Possible[];
    if (detail === 'full') possible = [{ kind: e.kind, strength: e.strength }];
    else if (pred !== null && before) {
      const follows = before.possible.filter((p) => EVENTS[p.kind].then === e.kind && (EVENTS[p.kind].thenIn?.includes(season) ?? true));
      possible = withTruth(follows.map((p) => ({ kind: e.kind, strength: p.strength })).filter((p, k, all) => all.findIndex((q) => sameWorld(p, q)) === k), e);
    } else if (detail === 'kind') possible = pairsOf(e.kind);
    else {
      const kinds = FAMILIES[familyOf(e.kind)].kinds.filter((k) => k === e.kind || allowed(k, sc.climate));
      possible = kinds.flatMap(pairsOf);
    }
    possible = withTruth(possible, e);

    // How long it can last, as far as what it may be allows (the catalogue's hours, which only tighten as the kinds do).
    // (A length the catalogue does not give, authored by hand, widens it by whole quarter days, never to its exact length.)
    const hours = possible.map((p) => hoursOf(p.kind, p.strength)), quarter = 6 * HOUR;
    const least = Math.min(...hours.map((h) => h[0] * HOUR)), most = Math.max(...hours.map((h) => h[1] * HOUR));
    const own = hoursOf(e.kind, e.strength);
    const minLen = e.length < own[0] * HOUR ? Math.min(least, Math.max(STEP, Math.floor(e.length / quarter) * quarter), e.length) : least;
    const maxLen = e.length > own[1] * HOUR ? Math.max(most, Math.ceil(e.length / quarter) * quarter) : most;

    let start: Range;
    if (underway) start = { lo: e.start, hi: e.start };
    else if (pred !== null && before) start = { lo: Math.min(before.end.lo, e.start), hi: Math.max(before.end.hi, e.start) };
    else {
      // It has not begun, which the forecast knows.
      const c = timeCell(e.start, lead);
      start = { lo: Math.max(c.lo, issued), hi: c.hi };
    }
    const c = timeCell(end, (end - issued) / HOUR);
    // It lasts as long as its kinds allow, and it has not ended yet.
    const endR: Range = { lo: Math.max(c.lo, start.lo + minLen, issued), hi: Math.min(c.hi, start.hi + maxLen) };
    // (`min` and `max` with the length are only for floating point's last digit.)
    const length: Range = { lo: Math.min(Math.max(minLen, endR.lo - start.hi), e.length), hi: Math.max(Math.min(maxLen, endR.hi - start.lo), e.length) };

    made.set(i, {
      id: i, detail, certainty: underway ? 'certain' : detail === 'family' ? 'possible' : 'likely', family: familyOf(e.kind), good: !!EVENTS[e.kind].good,
      possible, underway, start, end: endR, length, after: pred === null || !before ? null : pred,
    });
  }
  // In the order the forecast says: by the windows, never by the true starts inside them.
  return [...made.values()].sort((a, b) => a.start.lo - b.start.lo || a.start.hi - b.start.hi || a.end.lo - b.end.lo || a.end.hi - b.end.hi || a.id - b.id);
}

/**
 * The lengths a kind and strength allows inside what the entry says: its catalogue hours where they overlap the entry's lengths, else
 * the entry's (also where the entry reaches past every kind's hours: a length authored by hand).
 */
function lengthsOf(e: EventForecast, kind: EventKind, strength: Strength): Range {
  const all = e.possible.map((p) => hoursOf(p.kind, p.strength)), [h0, h1] = hoursOf(kind, strength);
  if (e.length.lo < Math.min(...all.map((h) => h[0])) * HOUR - 1e-6 || e.length.hi > Math.max(...all.map((h) => h[1])) * HOUR + 1e-6) return e.length;
  const lo = Math.max(h0 * HOUR, e.length.lo), hi = Math.min(h1 * HOUR, e.length.hi);
  return lo <= hi ? { lo, hi } : e.length;
}

/** The corners of the (start, end) pairs the windows and the lengths allow, all three together: the vertices of that region. */
function regionCorners(start: Range, end: Range, length: Range): [number, number][] {
  const out: [number, number][] = [], tol = 1e-6;
  const add = (s: number, e: number) => {
    const ok = s >= start.lo - tol && s <= start.hi + tol && e >= end.lo - tol && e <= end.hi + tol && e - s >= length.lo - tol && e - s <= length.hi + tol;
    if (ok && !out.some(([a, b]) => a === s && b === e)) out.push([s, e]);
  };
  for (const s of [start.lo, start.hi]) { add(s, Math.max(end.lo, s + length.lo)); add(s, Math.min(end.hi, s + length.hi)); }
  for (const e of [end.lo, end.hi]) { add(Math.max(start.lo, e - length.hi), e); add(Math.min(start.hi, e - length.lo), e); }
  return out.length ? out : [[start.lo, Math.max(end.lo, start.lo + length.lo)]];
}

/**
 * The events an entry allows at its corners, for a projection to run at (3.4): each kind and strength not ruled out, at the corners of
 * the region its start window, end window and lengths allow together (the earliest and latest start, the earliest and latest end, the
 * shortest and longest length it can have there). Every one satisfies everything the forecast says. A flood after its storm
 * (`after`) starts where the storm ends: use `cornerWorlds`.
 */
export function cornersOf(e: EventForecast): WeatherEvent[] {
  return e.possible.flatMap(({ kind, strength }) => regionCorners(e.start, e.end, lengthsOf(e, kind, strength)).map(([start, end]) => ({ kind, strength, start, length: end - start })));
}

/**
 * The worlds a projection runs in for one named event (3.4): each of its corners with the events that follow it laid after it, as the
 * commission lays them: a flood begins where its storm ends, at the storm's strength, and ends inside its own window. Every world
 * satisfies everything the forecast says (a storm's end that no flood could follow inside its window is not a corner). Each world is a
 * list of events to run in place of the true ones; the truth lies between them.
 */
export function cornerWorlds(f: Forecast, e: EventForecast): WeatherEvent[][] {
  const follow = (world: WeatherEvent[], from: EventForecast): WeatherEvent[][] =>
    f.events.filter((x) => x.after === from.id).reduce<WeatherEvent[][]>((worlds, next) => worlds.flatMap((w) => {
      const last = w[w.length - 1], start = endOf(last), pairs = next.possible.filter((q) => q.strength === last.strength);
      return pairs.length ? pairs.flatMap(({ kind, strength }) => {
        const len = lengthsOf(next, kind, strength);
        return [Math.max(next.end.lo, start + len.lo), Math.min(next.end.hi, start + len.hi)].flatMap((end) => follow([...w, { kind, strength, start, length: end - start }], next));
      }) : [w];
    }), [world]);
  const followers = f.events.filter((x) => x.after === e.id);
  return e.possible.flatMap(({ kind, strength }) => {
    // The ends of the event that a flood can follow inside its own window.
    const ends = followers.reduce<Range>((r, next) => {
      const lens = next.possible.filter((q) => q.strength === strength).map((q) => lengthsOf(next, q.kind, q.strength));
      return lens.length ? { lo: Math.max(r.lo, next.end.lo - Math.max(...lens.map((l) => l.hi))), hi: Math.min(r.hi, next.end.hi - Math.min(...lens.map((l) => l.lo))) } : r;
    }, e.end);
    const own = ends.lo <= ends.hi ? ends : e.end;
    return regionCorners(e.start, own, lengthsOf(e, kind, strength)).flatMap(([start, end]) => follow([{ kind, strength, start, length: end - start }], e));
  });
}

// ---- Days ----

/** The hourly samples of a day's weather: the middle of each hour of the commission's day (day 1 begins at the start hour). */
function samples(day: number): number[] {
  const out: number[] = [];
  for (let h = 0; h < 24; h++) { const t = timeOf(day, h + 0.5); if (t >= 0) out.push(t); }
  return out;
}

/** What really happens on a day: its coldest and warmest hour, and its conditions. The forecast blurs these; nothing else is behind it. */
export function dayTruth(sc: Scenario, day: number): { low: number; high: number; sun: number; wind: number; gust: number; rain: number } {
  const ts = samples(day), sun = sc.climate.sun;
  let low = Infinity, high = -Infinity, got = 0, clear = 0, windSum = 0, gust = 0, rain = 0;
  for (const t of ts) {
    const w = warmthIn(sc, t), wind = windAt(sc, t), h = hourAt(t);
    low = Math.min(low, w); high = Math.max(high, w);
    got += sunAt(sc, t);
    // The sun of a clear sky at that hour.
    if (h > sun.rise && h < sun.set) clear += sun.strength * Math.sin(Math.PI * (h - sun.rise) / (sun.set - sun.rise));
    windSum += wind; gust = Math.max(gust, wind);
    if (precipAt(sc, t) > 0) rain++;
  }
  return { low, high, sun: clear > 0 ? got / clear : 1, wind: windSum / ts.length, gust, rain };
}

const NOON = 12;

function dayForecast(sc: Scenario, day: number, issued: number): DayForecast {
  const lead = Math.max(0, (timeOf(day, NOON) - issued) / HOUR), t = dayTruth(sc, day);
  const w = stepAt(WARMTH_CELL, lead), c = lead <= CONDITION_CELL[CONDITION_CELL.length - 1][0] + EPS ? stepAt(CONDITION_CELL, lead) : undefined;
  return {
    day,
    warmth: { low: cell(t.low, w, 100), high: cell(t.high, w, 100) },
    conditions: c ? {
      sun: clampTo(cell(t.sun, c.sun, 1000), 0, 1), wind: clampTo(cell(t.wind, c.wind, 1000), 0, 1), gust: clampTo(cell(t.gust, c.gust, 1000), 0, 1), rain: clampTo(cell(t.rain, c.rain, 1), 0, 24),
      snow: sc.climate.season === 'winter',
    } : null,
  };
}

/** What the station knows at `issued` (seconds of play): the same every time for a scenario and an hour. */
export function forecastAt(sc: Scenario, issued: number): Forecast {
  const days: DayForecast[] = [];
  for (let d = dayAt(issued); (timeOf(d, NOON) - issued) / HOUR <= FORECAST_HOURS + EPS; d++) days.push(dayForecast(sc, d, issued));
  return { issued, until: issued + FORECAST_HOURS * HOUR, events: eventForecasts(sc, issued), days };
}

// ---- Words ----

/** The words for a number, from its band: a band's `upTo` is the number it reaches (exclusive); the last band takes the rest. */
type Bands = readonly (readonly [number, string])[];

export const SUN_BANDS: Bands = [[0.35, 'dark'], [0.6, 'cloudy'], [0.8, 'partly cloudy'], [Infinity, 'sunny']];
export const WIND_BANDS: Bands = [[0.2, 'still'], [0.4, 'light wind'], [0.6, 'breezy'], [0.8, 'windy'], [Infinity, 'very windy']];
/** Hours of rain or snow: none, a little (up to 3 h), showers (up to 9 h), most of the day. */
export const RAIN_BANDS: Bands = [[0.5, 'dry'], [3.5, 'a little'], [9.5, 'showers'], [Infinity, 'most of the day']];

export const bandOf = (bands: Bands, v: number) => bands.findIndex(([upTo]) => v < upTo);

/** The words a range spans, from the lowest band to the highest: one word where it lies in one band, else the first and the last ("light wind to windy"). */
export function wordsFor(bands: Bands, r: Range): string[] {
  const a = bandOf(bands, r.lo), b = bandOf(bands, r.hi);
  return a === b ? [bands[a][1]] : [bands[a][1], bands[b][1]];
}
