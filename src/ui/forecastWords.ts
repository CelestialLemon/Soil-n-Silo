import { DAY_SECONDS, START_HOUR } from '../game/data.ts';
import { eventName, timeOf } from '../game/events.ts';
import {
  SUN_BANDS, WIND_BANDS, kindsOf, nameOf, strengthsOf, wordsFor,
  type Conditions, type EventForecast, type Forecast, type Range,
} from '../game/outlook.ts';
import { FAULT_WORDS, type StationForecast } from '../game/station.ts';
import { dayClock } from './format.ts';

// What the forecast panel says, as data and words: no DOM, so `npm test` covers it. The forecast (outlook.ts) is a set of ranges that
// always hold what happens; this turns them into the panel's rows and drops what is already past. Facts only ("a gale, likely
// 10:00–22:00"), never advice.

const HOUR = DAY_SECONDS / 24;
/** The clock is told to ten minutes. */
const SLOT = HOUR / 6;
/** A tiny margin for comparing times (floating point). */
const EPS = 1e-6;

const pad = (n: number) => String(n).padStart(2, '0');

/** A moment as the day and the minutes since midnight, to the ten minutes (worked from whole slots, so floating point never turns midnight into 23:50). */
function slotOf(t: number, up = false): { day: number; minutes: number } {
  // An upper bound is told rounded up, a lower one down, so what is said always holds what the forecast says.
  const total = START_HOUR * 60 + (up ? Math.ceil(t / SLOT - EPS) : Math.floor(t / SLOT + EPS)) * 10;
  return { day: 1 + Math.floor(total / 1440), minutes: ((total % 1440) + 1440) % 1440 };
}

/** The word for a day against today: "" for today, "tomorrow ", "yesterday ", else "day 6 ". */
function dayWord(day: number, today: number): string {
  return day === today ? '' : day === today + 1 ? 'tomorrow ' : day === today - 1 ? 'yesterday ' : `day ${day} `;
}

/** A moment as its day and its time of day; an end at midnight is the end of the day before ("24:00"), not the start of the next. */
function partsOf(t: number, asEnd: boolean): { day: number; clock: string } {
  const { day, minutes } = slotOf(t, asEnd);
  if (asEnd && minutes === 0) return { day: day - 1, clock: '24:00' };
  return { day, clock: `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}` };
}

/** A moment of play as the panel writes it, against the day it is read on: "14:00", "tomorrow 06:30", "day 6 22:00". */
export function stamp(t: number, now: number, asEnd = false): string {
  const p = partsOf(t, asEnd);
  return `${dayWord(p.day, slotOf(now).day)}${p.clock}`;
}

/** Two moments as a span: "10:00–22:00", "tomorrow 22:00–day 6 04:00"; one moment where they are the same. The second takes a day word only where its day is not the first's. */
export function span(a: number, b: number, now: number): string {
  const x = partsOf(a, false), y = partsOf(b, true), today = slotOf(now).day;
  // The same ten minutes at both ends (a time on the clock exactly): one time, whatever midnight is called.
  if (Math.floor(a / SLOT + EPS) === Math.ceil(b / SLOT - EPS)) return `${dayWord(x.day, today)}${x.clock}`;
  if (x.day === y.day) return x.clock === y.clock ? `${dayWord(x.day, today)}${x.clock}` : `${dayWord(x.day, today)}${x.clock}–${y.clock}`;
  return `${dayWord(x.day, today)}${x.clock}–${dayWord(y.day, today)}${y.clock}`;
}

/** A number of degrees, the minus as a real minus sign. */
const deg = (n: number) => (n < 0 ? `−${-n}` : String(n));

/** A range of degrees: "3°C", "−1 to 3°C". */
export function degrees(r: Range): string {
  const lo = Math.round(r.lo), hi = Math.round(r.hi);
  return lo === hi ? `${deg(lo)}°C` : `${deg(lo)} to ${deg(hi)}°C`;
}

/** Hours of rain or snow, or an event's length, as a range: "none", "up to 2 hours", "2 to 4 hours". */
export function hours(r: Range, none = true): string {
  const lo = Math.round(r.lo * 2) / 2, hi = Math.round(r.hi * 2) / 2;
  const n = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  const unit = (x: number) => (x === 1 ? 'hour' : 'hours');
  if (none && hi < 0.5) return 'none';
  if (lo === hi) return `${n(hi)} ${unit(hi)}`;
  if (lo < 0.5) return `up to ${n(hi)} ${unit(hi)}`;
  return `${n(lo)} to ${n(hi)} hours`;
}

/** The words a range spans, joined: "cloudy to partly cloudy". */
export const bandWords = (bands: Parameters<typeof wordsFor>[0], r: Range) => wordsFor(bands, r).join(' to ');

/** "A gale", "An early frost": the name with its article. Some are never counted ("Fog"). */
export function withArticle(name: string): string {
  const lower = name.toLowerCase();
  if (/^(fog|haze|soft rain)$/.test(lower)) return name;
  return `${/^[aeiou]/.test(lower) ? 'An' : 'A'} ${lower}`;
}

/** What a day's sun, wind and rain are, in words, from the forecast's ranges (day three is not told this far ahead). */
export interface ConditionWords {
  sun: string; wind: string; gusts: string; rain: string; snow: boolean;
  /** The ranges the bars are drawn from. */
  ranges: Pick<Conditions, 'sun' | 'wind' | 'gust' | 'rain'>;
}

export function conditionWords(c: Conditions): ConditionWords {
  return {
    sun: bandWords(SUN_BANDS, c.sun), wind: bandWords(WIND_BANDS, c.wind), gusts: bandWords(WIND_BANDS, c.gust),
    rain: hours(c.rain), snow: c.snow, ranges: { sun: c.sun, wind: c.wind, gust: c.gust, rain: c.rain },
  };
}

/** A stretch of a day, six hours of the clock, as the blocks of the forecast (3.7) tell it: "06:00–12:00: sunny, light wind, dry". */
export interface PartView {
  when: string;
  /** Null where the stretch has no daylight. */
  sun: string | null;
  wind: string;
  rain: string;
}

/** What the sky is over, for the stretches the panel splits a day in: the sun's hours (clock hours) and whether the season's precipitation is snow. */
export interface SkyFacts { rise: number; set: number; snow: boolean }

/** The least and the most of some ranges. */
const hullOf = (rs: Range[]): Range => ({ lo: Math.min(...rs.map((r) => r.lo)), hi: Math.max(...rs.map((r) => r.hi)) });
const unit = (r: Range): Range => ({ lo: Math.max(0, Math.min(1, r.lo)), hi: Math.max(0, Math.min(1, r.hi)) });

/**
 * A day's four six-hour stretches in the words of the forecast's blocks (those not yet over), for the days it tells hour by hour or in
 * threes and sixes. The blocks hold the weather with no weather event in it: the events are told on their own, so "calm" here can be
 * a gale that is listed beside it. Facts only.
 */
export function dayParts(f: Forecast, day: number, now: number, sky?: SkyFacts): PartView[] {
  const out: PartView[] = [];
  for (let q = 0; q < 4; q++) {
    const from = Math.max(timeOf(day, 6 * q), now), to = timeOf(day, 6 * q + 6);
    if (to <= from + EPS) continue;
    const blocks = f.blocks.filter((b) => b.end > from + EPS && b.start < to - EPS);
    if (!blocks.length) continue;
    const sun = hullOf(blocks.map((b) => b.sun)), wind = unit(hullOf(blocks.map((b) => b.wind))), rain = hullOf(blocks.map((b) => b.rain));
    const lit = !sky || (6 * q < sky.set && 6 * q + 6 > sky.rise);
    out.push({
      when: span(from, to, now), sun: lit ? bandWords(SUN_BANDS, sun) : null, wind: bandWords(WIND_BANDS, wind),
      rain: rain.hi <= 0 ? 'dry' : rain.lo > 0 ? (sky?.snow ? 'snow' : 'showers') : sky?.snow ? 'dry to snow' : 'dry to showers',
    });
  }
  return out;
}

/** One event of a day, as the panel writes it. */
export interface EventRow {
  id: number;
  /** A bad event is a hard turn, a good one a kind turn: told apart by a shape and these words as well as colour. */
  good: boolean;
  tag: 'Hard turn' | 'Kind turn';
  /** "A severe gale", "A storm". */
  name: string;
  /** "possible" (only the family is named), "likely" (not yet begun), "under way". Never a doubt: it comes. */
  certainty: string;
  /** The window it happens in: "10:00–22:00", "tomorrow 22:00–day 6 04:00", "until 21:00". */
  when: string;
  /** More, a line each: the start and the end, how long, what it may be. */
  lines: string[];
}

/** Whether an event has begun, as far as this forecast says (it was under way when issued, or the start window is past). */
const begun = (e: EventForecast, now: number) => e.underway || e.start.hi <= now + EPS;

/** What the forecast has left of an entry at `now`: null where it is over, else the windows with the past cut off. */
export function remaining(e: EventForecast, now: number): { start: Range; end: Range; begun: boolean } | null {
  if (e.end.hi <= now + EPS) return null;
  const clip = (r: Range): Range => ({ lo: Math.max(r.lo, now), hi: Math.max(r.hi, now) });
  return { start: clip(e.start), end: clip(e.end), begun: begun(e, now) };
}

/** The kinds an entry may still be, in words ("a thunderstorm, a tropical storm or a gale"). */
function mayBe(e: EventForecast): string | null {
  const kinds = kindsOf(e);
  if (e.detail === 'family') {
    const names = kinds.map((k) => eventName(k).toLowerCase());
    return names.length > 1 ? `may be ${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}` : null;
  }
  if (e.detail === 'kind' && strengthsOf(e).length > 1) return `may grow to ${eventName(kinds[0], 'severe').toLowerCase()}`;
  return null;
}

/** An entry as a row, or null where the forecast has nothing left of it at `now`. `all` are the forecast's entries (for "then a flood"). */
export function eventRow(e: EventForecast, all: readonly EventForecast[], now: number): EventRow | null {
  const left = remaining(e, now);
  if (!left) return null;
  // A flood after its storm is told with the storm ("a tropical storm, then a flood"), while the storm is still listed.
  if (e.after !== null && all.some((x) => x.id === e.after && remaining(x, now))) return null;
  const name = nameOf(e);
  const flood = all.find((x) => x.after === e.id && remaining(x, now));
  const title = withArticle(name) + (flood ? ', then a flood' : '');
  const certainty = e.underway ? 'under way' : e.certainty;
  const lines: string[] = [];
  let when: string;
  // With a flood after it, the window runs to the flood's end, and the storm's own end is a line of its own.
  const floodLeft = flood ? remaining(flood, now) : null;
  const last = Math.max(left.end.hi, floodLeft?.end.hi ?? 0), ends = flood ? 'the storm ends' : 'ends';
  if (left.begun) {
    when = `until ${stamp(last, now, true)}`;
    lines.push(e.underway ? `${ends} ${span(left.end.lo, left.end.hi, now)}` : `should have begun; ${ends} ${span(left.end.lo, left.end.hi, now)}`);
  } else {
    when = span(left.start.lo, last, now);
    lines.push(`begins ${span(left.start.lo, left.start.hi, now)}`, `${ends} ${span(left.end.lo, left.end.hi, now)}`);
    lines.push(`lasts ${hours({ lo: e.length.lo / HOUR, hi: e.length.hi / HOUR }, false)}`);
  }
  if (floodLeft) lines.push(`the flood ends ${span(floodLeft.end.lo, floodLeft.end.hi, now)}`);
  const may = mayBe(e);
  if (may) lines.push(may);
  return { id: e.id, good: e.good, tag: e.good ? 'Kind turn' : 'Hard turn', name: title, certainty, when, lines };
}

/** One day of the panel. */
export interface DayView {
  day: number;
  /** "Today", "Tomorrow", "Day 6". */
  name: string;
  /** "day 4" for today and tomorrow; empty otherwise (the name says it). */
  sub: string;
  low: string;
  high: string;
  conditions: ConditionWords | null;
  /** Where the forecast tells the day in blocks (today and tomorrow): the day's stretches of six hours, those not yet over. */
  parts: PartView[];
  events: EventRow[];
}

export interface ForecastView {
  /** When it was issued: "day 4, 14:00". */
  issued: string;
  /** How far it looks: "day 7, 14:00". */
  until: string;
  /** "Out of date: no power, since day 4, 14:00", or null while the station renews it. */
  stale: string | null;
  days: DayView[];
  /** Events the forecast names that fall in no column above: begun ones once its days have run out, and ones past the last column. */
  rest: EventRow[];
}

const dayName = (day: number, today: number) => (day === today ? 'Today' : day === today + 1 ? 'Tomorrow' : `Day ${day}`);

/** The line that says the forecast is out of date, and from when. */
export function staleLine(sf: StationForecast): string | null {
  if (!sf.stale) return null;
  return sf.reason ? `Out of date: ${FAULT_WORDS[sf.reason]} since ${dayClock(sf.issued)}` : `Renewing: this is the forecast of ${dayClock(sf.issued)}`;
}

/**
 * The forecast as the panel shows it at `now`: the days from today on (the forecast's own days; those past are dropped), each with its
 * events (an event goes in the day it begins, or today where it has begun), the past cut off the windows, and what is over gone.
 */
export function forecastView(sf: StationForecast, now: number, sky?: SkyFacts): ForecastView {
  const f: Forecast = sf.forecast, today = slotOf(now).day;
  const days = f.days.filter((d) => d.day >= today).map((d): DayView => ({
    day: d.day, name: dayName(d.day, today), sub: d.day <= today + 1 ? `day ${d.day}` : '',
    low: degrees(d.warmth.low), high: degrees(d.warmth.high), conditions: d.conditions ? conditionWords(d.conditions) : null, parts: d.conditions ? dayParts(f, d.day, now, sky) : [], events: [],
  }));
  const rest: EventRow[] = [];
  // In the order the forecast gives: by window.
  for (const e of f.events) {
    const row = eventRow(e, f.events, now);
    if (!row) continue;
    // An event that has begun, as far as the forecast says, is today's; one yet to come is in the day it may begin.
    const left = remaining(e, now), home = left && !left.begun ? slotOf(left.start.lo).day : today;
    const day = days.find((d) => d.day === home);
    if (day) day.events.push(row); else rest.push(row);
  }
  return { issued: dayClock(sf.issued), until: dayClock(f.until), stale: staleLine(sf), days, rest };
}

/** The events the forecast names that have not begun and begin within the next day: what the HUD chip hints at (a mark, not a message). A flood after a storm is told with its storm, which may be under way. */
export function soonRows(f: Forecast, now: number): EventRow[] {
  const rows = new Map<number, EventRow>();
  for (const e of f.events) {
    if (e.underway || e.start.lo >= now + DAY_SECONDS || e.start.hi <= now + EPS) continue;
    const owner = e.after !== null ? f.events.find((x) => x.id === e.after) ?? e : e;
    const row = eventRow(owner, f.events, now);
    if (row) rows.set(owner.id, row);
  }
  return [...rows.values()];
}
