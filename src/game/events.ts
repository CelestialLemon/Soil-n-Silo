import { DAY_SECONDS, START_HOUR } from './data.ts';
import { err, ok, type Result } from './result.ts';
import { mulberry32 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import type { Character, Climate, Season } from './seasons.ts';
import type { GameState } from './state.ts';

// Weather events: things that happen during a commission, last half a day to two days and pass (a storm, a flood, a frost, a
// heat wave). A commission's events are part of the commission, seeded like its map (random ones) or placed by hand
// (campaign ones, `eventOn`), so the bot can play them and the forecast (phase 3) can read them ahead.
//
// The whole catalogue is one table, `EVENTS`: for each kind its name, when it can come (season, character, odds), how long it
// lasts, how it looks and what it pushes. An event's effects are its `push`: amounts for a few levers (sun, wind, cloud, rain,
// warmth, the river, truck speed) that the rules already read through `pushesAt`, so a new effect is one line in its entry,
// and an effect that needs more than a lever (a flood's water, a frost's spots) reads the event itself (`activeEvents`).
// Most entries push nothing yet: each of 2.3–2.8 fills in its events.

export const EVENT_KINDS = [
  'thunderstorm', 'heatWave', 'fog', 'softRain', 'warmSpell', 'steadyBreeze',
  'gale', 'tropicalStorm', 'flood', 'lateFrost', 'coldSnap', 'blizzard', 'dustStorm',
] as const;
export type EventKind = typeof EVENT_KINDS[number];

/** Events come in two strengths; the severe tropical storm is the hurricane. */
export const STRENGTHS = ['ordinary', 'severe'] as const;
export type Strength = typeof STRENGTHS[number];

/** A weather event in a commission: what, how strong, and when (seconds of play from the start). */
export interface WeatherEvent {
  kind: EventKind;
  strength: Strength;
  start: number;
  length: number;
}

export const endOf = (e: WeatherEvent) => e.start + e.length;

// ---- Levers ----

/**
 * The levers an event can push, each with its neutral value and how several events' pushes combine: multipliers multiply,
 * additions add, floors take the highest. An event gives a lever the value it pushes it to at full strength; the ramp in and
 * out blends it from neutral (`pushesOf`).
 */
const LEVERS = {
  /** The share of the sun's light left (× the season's sun and the cloud). */
  sun: { neutral: 1, mix: 'mul' },
  /** Added to the wind (0–1 of full strength), after calm spells. */
  wind: { neutral: 0, mix: 'add' },
  /** The sky is at least this covered (0–1): dims the sun like cloud does. */
  cloud: { neutral: 0, mix: 'max' },
  /** It rains or snows at least this hard (0–1): fields count as watered while it rains. */
  rain: { neutral: 0, mix: 'max' },
  /** Added to the valley's warmth, in °C. */
  warmth: { neutral: 0, mix: 'add' },
  /** A multiple of the river's current, so of what a water wheel makes. */
  river: { neutral: 1, mix: 'mul' },
  /** A multiple of the trucks' speed. */
  trucks: { neutral: 1, mix: 'mul' },
} as const satisfies Record<string, { neutral: number; mix: 'mul' | 'add' | 'max' }>;

export type Lever = keyof typeof LEVERS;
/** The levers' values at a moment, all events' pushes combined. */
export type Pushes = Record<Lever, number>;

const LEVER_IDS = Object.keys(LEVERS) as Lever[];

export const NEUTRAL: Readonly<Pushes> = Object.freeze(Object.fromEntries(LEVER_IDS.map((l) => [l, LEVERS[l].neutral])) as Pushes);

// ---- The catalogue ----

/** How an event looks in the sky, apart from its effects: the cover and the rain or snow drawn (0–1). */
export interface Look { cloud?: number; precip?: number }

export interface EventInfo {
  name: string;
  /** The severe form's name where it has its own ("Hurricane"). */
  severeName?: string;
  /** A good event: it helps, and is never severe. */
  good?: boolean;
  /** How long it lasts, in game hours (a random one rolls between the two). */
  hours: readonly [number, number];
  /** The hours of the day it can begin in, where it is tied to one (fog at dawn, a frost at night); the window may wrap midnight. */
  begins?: readonly [number, number];
  /** How often each season brings it (1: usual); a season missing from the table never does. */
  seasons: Partial<Record<Season, number>>;
  /** Only in these characters (the blizzard in a hard winter, the dust storm in a dry summer). */
  only?: readonly Character[];
  /** Each character's multiple of its odds. */
  odds?: Partial<Record<Character, number>>;
  /** Whether it can be severe (the good ones never are). */
  severe?: boolean;
  /** What it pushes, by strength. Empty until the issue for the event lands. */
  push: Partial<Record<Strength, Partial<Pushes>>>;
  /** How the sky looks while it lasts. */
  look: Look;
  /** What it brings next: a flood follows its storm, at the same strength. */
  then?: EventKind;
}

/**
 * Every weather event. Seasons and characters follow `docs/CLIMATE.md` (the table in #84); the odds are first sketches.
 * `push` is where an event's effects go (2.3–2.8); it is empty for all of them for now, so an event so far changes the sky, the
 * HUD chip and the forecast's list but not the rules.
 */
export const EVENTS: Record<EventKind, EventInfo> = {
  thunderstorm: {
    name: 'Thunderstorm', hours: [10, 14], seasons: { spring: 1, summer: 1 }, severe: true,
    odds: { stormy: 2.5, wet: 1.5, hot: 1.2, mild: 0.7, dry: 0.4 }, push: {}, look: { cloud: 1, precip: 0.9 },
  },
  heatWave: {
    name: 'Heat wave', hours: [24, 48], seasons: { summer: 1 }, severe: true,
    odds: { hot: 2.5, dry: 2, wet: 0.5, mild: 0.4, stormy: 0.6 }, push: {}, look: {},
  },
  fog: {
    name: 'Fog', hours: [4, 7], begins: [3, 7], seasons: { autumn: 1 }, severe: true,
    odds: { wet: 1.5, mild: 1.2, gales: 0.3, stormy: 0.5 }, push: {}, look: { cloud: 0.6 },
  },
  softRain: {
    name: 'Soft rain', good: true, hours: [20, 28], seasons: { spring: 1, autumn: 1 },
    odds: { wet: 1.8, mild: 1.2, dry: 0.4 }, push: {}, look: { cloud: 0.7, precip: 0.35 },
  },
  warmSpell: {
    name: 'Warm spell', good: true, hours: [24, 48], seasons: { autumn: 1, winter: 1 },
    odds: { mild: 1.5, hot: 1.5, hard: 0.3 }, push: {}, look: {},
  },
  steadyBreeze: {
    name: 'Steady breeze', good: true, hours: [20, 28], seasons: { summer: 1 },
    odds: { dry: 1.2, hot: 1.2, stormy: 0.5 }, push: {}, look: {},
  },
  gale: {
    name: 'Gale', hours: [20, 28], seasons: { autumn: 1 }, severe: true,
    odds: { gales: 3, stormy: 2, mild: 0.4 }, push: {}, look: { cloud: 0.5 },
  },
  tropicalStorm: {
    name: 'Tropical storm', severeName: 'Hurricane', hours: [24, 48], seasons: { summer: 0.25, autumn: 0.5 }, severe: true, then: 'flood',
    odds: { stormy: 3, wet: 1.5, gales: 1.2, mild: 0.3, dry: 0.1, hot: 0.5 }, push: {}, look: { cloud: 1, precip: 0.8 },
  },
  flood: {
    name: 'Flood', hours: [24, 48], seasons: { spring: 1 }, severe: true,
    odds: { highRiver: 3, wet: 2, stormy: 1.5, mild: 0.6, dry: 0.2 }, push: {}, look: { cloud: 0.5, precip: 0.2 },
  },
  lateFrost: {
    name: 'Late frost', hours: [8, 10], begins: [20, 23], seasons: { spring: 1 }, severe: true,
    odds: { dry: 1.5, gales: 0.5, wet: 0.8, hot: 0.2, mild: 0.4 }, push: {}, look: {},
  },
  coldSnap: {
    name: 'Cold snap', hours: [24, 48], seasons: { winter: 1 }, severe: true,
    odds: { hard: 2.5, gales: 1, mild: 0.3 }, push: {}, look: { cloud: 0.3 },
  },
  blizzard: {
    name: 'Blizzard', hours: [24, 48], seasons: { winter: 1 }, only: ['hard'], severe: true,
    push: {}, look: { cloud: 1, precip: 1 },
  },
  dustStorm: {
    name: 'Dust storm', hours: [12, 24], seasons: { summer: 1 }, only: ['dry'], severe: true,
    push: {}, look: { cloud: 0.4 },
  },
};

/** The event's name at a strength ("Tropical storm", "Hurricane", "Severe gale"). */
export function eventName(kind: EventKind, strength: Strength = 'ordinary'): string {
  const e = EVENTS[kind];
  return strength === 'severe' ? e.severeName ?? `Severe ${e.name.toLowerCase()}` : e.name;
}

/** Whether a kind comes in this season and character at all. */
export function allowed(kind: EventKind, c: Pick<Climate, 'season' | 'character'>): boolean {
  const e = EVENTS[kind];
  return (e.seasons[c.season] ?? 0) > 0 && (!e.only || (c.character !== null && e.only.includes(c.character)));
}

/** The events a season and character can bring (what the briefing lists), the bad ones first. */
export const eventsOf = (c: Pick<Climate, 'season' | 'character'>): EventKind[] =>
  EVENT_KINDS.filter((k) => allowed(k, c)).sort((a, b) => Number(!!EVENTS[a].good) - Number(!!EVENTS[b].good));

/** How likely a kind is in a climate, relative to the others (0 when it can't come). */
function oddsOf(kind: EventKind, c: Pick<Climate, 'season' | 'character'>): number {
  if (!allowed(kind, c)) return 0;
  const e = EVENTS[kind];
  return (e.seasons[c.season] ?? 0) * (c.character ? e.odds?.[c.character] ?? 1 : 1);
}

// ---- Time ----

const HOUR = DAY_SECONDS / 24;
/** The time (seconds of play) of an hour of a day: day 1 begins at START_HOUR, and an hour past 24 runs into the next day. */
export const timeOf = (day: number, hour: number) => ((day - 1) * 24 + hour - START_HOUR) * HOUR;

/** Events build in and fade out over this many game hours at either end. */
export const RAMP_HOURS = 1.5;
const RAMP = RAMP_HOURS * HOUR;
/** Times are kept to a half hour. */
const STEP = HOUR / 2;
const snap = (t: number) => Math.round(t / STEP) * STEP;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** How much of its full strength an event has at a time, 0–1: it builds in, holds and fades out; 0 outside it. */
export function intensityAt(e: WeatherEvent, time: number): number {
  if (time < e.start || time >= endOf(e)) return 0;
  return smooth(Math.min(1, (time - e.start) / RAMP, (endOf(e) - time) / RAMP));
}

export interface Active { event: WeatherEvent; intensity: number }

const NONE: readonly Active[] = Object.freeze([]);

/** The events under way at a time, with how strongly each is felt. */
export function activeEvents(sc: Pick<Scenario, 'events'>, time: number): readonly Active[] {
  if (!sc.events.length) return NONE;
  let out: Active[] | null = null;
  for (const event of sc.events) if (time >= event.start && time < endOf(event)) (out ??= []).push({ event, intensity: intensityAt(event, time) });
  return out ?? NONE;
}

/** The event to show now (the HUD chip, the sky): the latest to have begun, or null. */
export function eventNow(sc: Pick<Scenario, 'events'>, time: number): WeatherEvent | null {
  let now: WeatherEvent | null = null;
  for (const { event } of activeEvents(sc, time)) if (!now || event.start >= now.start) now = event;
  return now;
}

/** The events that begin, or are under way, anywhere in [from, to), by start: the forecast's view of what is ahead. */
export const eventsIn = (sc: Pick<Scenario, 'events'>, from: number, to: number): WeatherEvent[] =>
  sc.events.filter((e) => e.start < to && endOf(e) > from).sort((a, b) => a.start - b.start);

/** What the events under way push the levers to, combined (see LEVERS). */
export function pushesOf(active: readonly Active[]): Pushes {
  if (!active.length) return NEUTRAL;
  const out = { ...NEUTRAL };
  for (const { event, intensity } of active) {
    const push = EVENTS[event.kind].push[event.strength];
    if (!push) continue;
    for (const l of LEVER_IDS) {
      const v = push[l];
      if (v === undefined) continue;
      const { neutral, mix } = LEVERS[l], felt = neutral + (v - neutral) * intensity;
      out[l] = mix === 'mul' ? out[l] * felt : mix === 'add' ? out[l] + felt : Math.max(out[l], felt);
    }
  }
  return out;
}

/** The levers at a time. The rules read the sun, wind, rain, warmth, river and trucks through this. */
export const pushesAt = (sc: Pick<Scenario, 'events'>, time: number): Pushes => pushesOf(activeEvents(sc, time));

/** How the sky looks because of the events under way: the most cloud and the hardest rain any of them gives, felt as strongly as they are. */
export function lookAt(sc: Pick<Scenario, 'events'>, time: number): { cloud: number; precip: number } {
  let cloud = 0, precip = 0;
  for (const { event, intensity } of activeEvents(sc, time)) {
    const look = EVENTS[event.kind].look, k = intensity * (event.strength === 'severe' ? 1.15 : 1);
    cloud = Math.max(cloud, Math.min(1, (look.cloud ?? 0) * k));
    precip = Math.max(precip, Math.min(1, (look.precip ?? 0) * k));
  }
  return { cloud, precip };
}

// ---- Building events ----

/** The hours an event of a kind lasts when nothing says: the middle of its range. */
const usualHours = (kind: EventKind) => (EVENTS[kind].hours[0] + EVENTS[kind].hours[1]) / 2;

/** An event and what follows it (a flood after a tropical storm) starting at `start`, each lasting `hours` (default: the kind's usual). */
export function eventChain(kind: EventKind, strength: Strength, start: number, hours?: number): WeatherEvent[] {
  const out: WeatherEvent[] = [];
  let at = snap(start);
  for (let k: EventKind | undefined = kind; k; k = EVENTS[k].then) {
    const length = snap((out.length ? usualHours(k) : hours ?? usualHours(k)) * HOUR);
    out.push({ kind: k, strength, start: at, length });
    at += length;
  }
  return out;
}

/**
 * An event placed by hand, for a campaign commission: "a gale on day 4, from 10:00" is `eventOn(4, 10, 'gale')`. It lasts the
 * kind's usual hours unless `hours` says. What follows it comes too (a tropical storm's flood), so the result is a list.
 */
export function eventOn(day: number, hour: number, kind: EventKind, strength: Strength = 'ordinary', hours?: number): WeatherEvent[] {
  if (strength === 'severe' && !EVENTS[kind].severe) throw new Error(`${EVENTS[kind].name} has no severe form`);
  return eventChain(kind, strength, timeOf(day, hour), hours);
}

// ---- Random commissions ----

/** The first day events may come: none on day 1, so the farm can get going. */
const FIRST_DAY = 2;
/** The least clear time between one event and the next (game hours), except a flood after its storm. */
const GAP_HOURS = 12;
/** The chance that, at difficulty 3, one of the bad events is severe; a harsh character makes it likelier. */
const SEVERE_CHANCE = 0.5, HARSH_SEVERE_CHANCE = 0.75;
const HARSH: readonly Character[] = ['hard', 'stormy'];
/** Odds of a kind already chosen coming again. */
const REPEAT = 0.2;
/** A day or two is the least a level has room for. */
const MIN_HORIZON_DAYS = 6;

/** Bad events and good ones by difficulty (the bad ones' count; the good ones' count may be 0 at difficulty 3). */
const BAD_COUNT: Record<number, number> = { 1: 1, 2: 2, 3: 2 };

/** Draws `n` kinds, good or bad, from those the climate allows, by odds; fewer if it allows too few. */
function draw(n: number, good: boolean, c: Climate, r: () => number): EventKind[] {
  const out: EventKind[] = [];
  for (let i = 0; i < n; i++) {
    const w = EVENT_KINDS.map((k) => (!!EVENTS[k].good === good ? oddsOf(k, c) * (out.includes(k) ? REPEAT : 1) : 0));
    const total = w.reduce((a, b) => a + b, 0);
    if (total <= 0) break;
    let x = r() * total, j = 0;
    while (j < w.length - 1 && x >= w[j]) { x -= w[j]; j++; }
    out.push(EVENT_KINDS[j]);
  }
  return out;
}

/** Whether a kind in a climate can be made severe in a random commission: not every tropical storm grows into a hurricane, only in a stormy character. */
const canBeSevere = (kind: EventKind, c: Climate) => !!EVENTS[kind].severe && (kind !== 'tropicalStorm' || c.character === 'stormy');

/**
 * The events of a random commission, from its seed, difficulty and climate; `horizon` (seconds) is how long a level is expected to
 * run (its target time), over which they are spread. The same arguments always give the same events.
 *
 * Difficulty 1 has one bad event and one good one, all ordinary; 2 has two bad and one good; 3 has two bad, one of which may be
 * severe (the hurricane, only in a stormy character), and none or one good. None come on day 1, none overlap (a flood follows its
 * storm at once) and at least half a day is clear between them. Each kind's odds follow the season and the character.
 */
export function rollEvents(seed: number, difficulty: 1 | 2 | 3, climate: Climate, horizon: number): WeatherEvent[] {
  const r = mulberry32(seed ^ (difficulty * 0x2545f491) ^ 0xe7e47);
  const bad = draw(BAD_COUNT[difficulty], false, climate, r);
  const good = draw(difficulty === 3 ? (r() < 0.5 ? 1 : 0) : 1, true, climate, r);
  const strengths: Strength[] = [...bad, ...good].map(() => 'ordinary');
  if (difficulty === 3) {
    const options = bad.map((k, i) => (canBeSevere(k, climate) ? i : -1)).filter((i) => i >= 0);
    if (options.length && r() < (climate.character && HARSH.includes(climate.character) ? HARSH_SEVERE_CHANCE : SEVERE_CHANCE)) strengths[options[Math.floor(r() * options.length)]] = 'severe';
  }
  // Each event with what follows it is one block, laid out in a random order.
  const kinds = [...bad, ...good].map((kind, i) => ({ kind, strength: strengths[i], hours: EVENTS[kind].hours }));
  for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
  const blocks = kinds.map((k) => eventChain(k.kind, k.strength, 0, Math.round((k.hours[0] + r() * (k.hours[1] - k.hours[0])) * 2) / 2));
  const span = (b: WeatherEvent[]) => b.reduce((n, e) => n + e.length, 0);
  const from = timeOf(FIRST_DAY, 0), end = Math.max(horizon, timeOf(FIRST_DAY + MIN_HORIZON_DAYS, 0)), gap = GAP_HOURS * HOUR;
  // Drop what doesn't fit, then spread the free time between and around the blocks.
  const needed = () => blocks.reduce((n, b) => n + span(b), 0) + (blocks.length - 1) * gap;
  while (blocks.length > 1 && needed() > end - from) blocks.pop();
  // Lay the blocks out in the free time; a window can carry one past the end and crowd the next, so lay them out again (a few
  // times at most) until all fit, keeping the layout that placed the most.
  let best: WeatherEvent[] = [], placedMost = -1;
  for (let attempt = 0; attempt < 12 && placedMost < blocks.length; attempt++) {
    const offsets = blocks.map(() => r() * Math.max(0, end - from - needed())).sort((a, b) => a - b);
    const out: WeatherEvent[] = [];
    let free = from, used = 0, placed = 0;
    blocks.forEach((b, i) => {
      const window = EVENTS[b[0].kind].begins;
      let start = Math.max(free, from + offsets[i] + used);
      if (window) start = beginInWindow(start, window, r);
      // Moving into the window can carry it past the end: take the window of the day before, or leave it out if that leaves no room.
      if (window && start + span(b) > end) start -= DAY_SECONDS;
      used += span(b) + gap;
      if (start < free || start + span(b) > end) return;
      const at = b.map((e) => ({ ...e, start: snap(start + e.start) }));
      out.push(...at);
      free = endOf(at[at.length - 1]) + gap;
      placed++;
    });
    if (placed > placedMost) { best = out; placedMost = placed; }
  }
  return best;
}

/** The first time at or after `t` that falls within the hours of a day `window` (which may wrap midnight), at a seeded hour in it. */
function beginInWindow(t: number, window: readonly [number, number], r: () => number): number {
  const [a, b] = window, width = (b - a + 24) % 24;
  let day = Math.floor((t / HOUR + START_HOUR) / 24) + 1;
  const hour = a + Math.floor(r() * (width * 2 + 1)) / 2;
  if (timeOf(day, hour) < t) day++;
  return timeOf(day, hour);
}

// ---- The sandbox ----

/** Whether this commission's weather can be started by hand. */
const handMade = (s: GameState) => !!s.scenario.sandbox;

/** Ends what is under way (it fades out over the ramp) and drops what hasn't begun: the sandbox's weather starts from a clean sky. */
function clearSky(s: GameState) {
  const now = s.time;
  // One still building in fades from where it has got to (the ramp out as long as the ramp in has run), so it never strengthens first.
  const fade = (e: WeatherEvent) => Math.min(RAMP, now - e.start);
  s.scenario.events = s.scenario.events.filter((e) => e.start < now)
    .map((e) => (endOf(e) > now + fade(e) ? { ...e, length: now + fade(e) - e.start } : e)).filter((e) => e.length > 0);
}

/** Sandbox: starts an event now, ending what is under way and dropping what was ahead. A flood still follows its storm. */
export function startEvent(s: GameState, kind: EventKind, strength: Strength = 'ordinary'): Result<WeatherEvent[]> {
  if (!handMade(s)) return err('Only the sandbox starts weather by hand.');
  if (strength === 'severe' && !EVENTS[kind].severe) return err(`${EVENTS[kind].name} has no severe form.`);
  clearSky(s);
  // It begins at exactly this moment (chains keep to the half hour), so it is under way at once even while the game is paused.
  const chain = eventChain(kind, strength, s.time), shift = s.time - chain[0].start;
  for (const e of chain) e.start += shift;
  s.scenario.events.push(...chain);
  return ok(chain);
}

/** Sandbox: ends the weather under way and drops what was ahead. */
export function clearWeather(s: GameState): Result<void> {
  if (!handMade(s)) return err('Only the sandbox starts weather by hand.');
  clearSky(s);
  return ok(undefined);
}
