import { blockAtTime, type Block } from './blocks.ts';
import { DAY_SECONDS } from './data.ts';
import { activeEvents, endOf, pushesAt, pushesOf as pushesOfActive, type EventKind, type Pushes, type WeatherEvent } from './events.ts';
import { clearSun, usualOf, usualWarmth } from './expected.ts';
import { cornerWorlds, FAMILIES, gridWorlds, issueTimeOf, type EventForecast, type Forecast, type Range } from './outlook.ts';
import type { Scenario } from './scenarios.ts';
import { CHARACTERS, SEASONS, type Climate } from './seasons.ts';
import { dayAt, hourAt, sunAt, windAt } from './sim/clock.ts';
import { CLOUD_DIM, clearShare, RAIN_FROM, raining, SHOWER_CLOUD } from './sim/weather.ts';
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
  /** The share of the time, 0–1, that rain falls and waters every field and rests the sprinklers (0 in winter: snow does neither). At a moment: 0 or 1 in the seeded weather. */
  rain(time: number): number;
  /** The share of the hour from `time` that it rains (0–1; 0 in winter), the water a field gets in that hour. */
  hourRain(time: number): number;
  /** The valley's warmth in °C. */
  warmth(time: number): number;
  /**
   * The warmths the weather can have at a time, for a result that is not monotone in the warmth (a crop's pace peaks inside its warm range): the
   * one warmth in the seeded or usual weather, in a forecast's block the warmths across its drift and showers' cooling, so a projection takes its
   * least or its most over them hour by hour rather than at one level all through.
   */
  warmths(time: number): number[];
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

/** The cloud a world's events put in the sky at once (their own cloud, and the cloud of the rain they bring): the sun's share is the least of this and the day's. */
const eventCloud = (p: { cloud: number; rain: number }) => Math.max(p.cloud, p.rain >= RAIN_FROM ? Math.min(1, SHOWER_CLOUD * p.rain) : 0);

/** What the lenses of one world share: what its events push at a time, and the share of an hour they rain. */
interface Shared { pushes: Map<number, Pushes>; eventRain: Map<number, number> }

/** What the player can see of the weather now, as ranges the weather of the block-free hours is held to for the next hours (the cone). */
interface Known {
  /** The sun's share cloud leaves, with no event in it. It is read as it is unless an event's cloud hides it (then it is at least this). */
  sun: Range;
  /** The seasonal wind before the events' push and before it is held to 0.05–1: exact, unless the wind is at a limit (then on one side of it). */
  wind: Range;
}

function knownOf(sc: Scenario, now: number): Known {
  // What the player sees is the sky and the wind with the events under way in them, at the strength they are felt (which fades out as an event ends,
  // and its end is not told exactly): so an event that is under way may hide up to its full cloud and push up to its full wind, no more.
  const full = pushesOfActive(activeEvents(sc, now).map(({ event }) => ({ event, intensity: 1 })));
  const share = clearShare(sc, now), wind = windAt(sc, now);
  const hidden = eventCloud(full) > 0;
  return {
    sun: { lo: share, hi: hidden ? 1 : share },
    wind: wind >= 1 - 1e-9 ? { lo: 1 - full.wind, hi: Infinity } : wind <= 0.05 + 1e-9 ? { lo: -Infinity, hi: 0.05 } : { lo: wind - full.wind, hi: wind },
  };
}

/** The point of a range a lens reads at `level` (0 the lowest end, 1 the highest). */
const pick = (r: Range, level: number) => r.lo + (r.hi - r.lo) * level;

/**
 * A view of the weather ahead: the usual weather where nothing says otherwise, and the forecast's blocks where they do. A block holds the
 * weather with no event in it; the events of the world (`events`) are laid on it at their own timing: the sun's share is the least of
 * the block's and the events' cloud, the wind adds their push, rain is on where either rains, the warmth takes their nudges. For the
 * first hours a block's range is cut to the cone round what is known now. A lens reads each range at `level`.
 */
function viewOf(sc: Scenario, now: number, events: WeatherEvent[], blocks?: readonly Block[], level: Level = {}, shared: Shared = { pushes: new Map(), eventRain: new Map() }): Ahead {
  const c = sc.climate, u = usualOf(c), winter = c.season === 'winter', n = nowOf(sc, now), known = blocks ? knownOf(sc, now) : undefined;
  // A turbine in a gale is steady or not as the seeded noise goes: a forecast lens takes it at its worst when the wind is low and at its best when high; the usual weather, in the middle.
  const view: View = { events, gust: () => (blocks ? 1 - (level.wind ?? 0.5) : 0.5) };
  // The weight of what is known now: it fades over EASE_HOURS.
  const ease = (t: number) => Math.max(0, 1 - (t - now) / (EASE_HOURS * HOUR));
  const eased = (known_: number, usual: number, t: number) => { const w = ease(t); return w * known_ + (1 - w) * usual; };
  const kept = { events, climate: c };
  // The block range at a time, cut to the cone round what is known now (it narrows the range for the first hours and nests with every hour's).
  const cone = (dim: 'sun' | 'wind', b: Range, t: number): Range => {
    const k = (known as Known)[dim], reach = t > now ? DRIFT[dim] * (t - now) / HOUR + JUMP[dim] : 0;
    const lo = Math.max(b.lo, k.lo - reach), hi = Math.min(b.hi, k.hi + reach);
    return lo <= hi ? { lo, hi } : { lo: clamp(k.lo, b.lo, b.hi), hi: clamp(k.lo, b.lo, b.hi) };
  };
  const block = (t: number) => (blocks ? blockAtTime(blocks, t) : undefined);
  // What the world's events push at a time, worked out once for the world (its lenses all ask).
  const pushesOf = (t: number): Pushes => { let p = shared.pushes.get(t); if (!p) shared.pushes.set(t, (p = pushesAt(view, t))); return p; };
  const rainOf = (t: number) => { const p = pushesOf(t).rain; return p >= RAIN_FROM ? p : 0; };
  const usualWarm = (t: number) => {
    const rain = pushesOf(t).rain;
    // (Rain an event brings cools more than the usual showers do.)
    return usualWarmth(c, hourAt(t)) - (rain >= RAIN_FROM ? RAIN_COOLING * Math.max(0, rain - u.precip) : 0) + eventWarmth(kept, t, warmthByHour(c, hourAt(t)));
  };
  const warmNow = warmthIn(sc, now);
  // The day's curve and the seeded drift in the block's range, cooled by the showers and by the rain an event brings, and the events' nudges.
  const warmAt = (b: Block, t: number, drift: number, rain: number) => {
    const curve = warmthByHour(c, hourAt(t)) + pick(b.drift, drift);
    return curve - RAIN_COOLING * Math.max(pick(b.precip, rain), rainOf(t)) + eventWarmth(kept, t, curve);
  };
  return {
    events, gust: view.gust,
    sun(t) {
      const clear = clearSun(c, hourAt(t));
      if (clear <= 0) return 0;
      const p = pushesOf(t), b = block(t);
      if (b) return clear * Math.min(pick(cone('sun', b.sun, t), level.sun ?? 0.5), 1 - CLOUD_DIM * eventCloud(p)) * p.sun;
      // (Where there is no block, rain an event brings covers the sky too.)
      const rainy = p.rain >= RAIN_FROM ? 1 - CLOUD_DIM * Math.min(1, SHOWER_CLOUD * p.rain) : 1;
      return clear * Math.min(eased(n.cloud, u.clear, t), rainy) * p.sun;
    },
    wind(t) {
      const b = block(t), push = pushesOf(t).wind;
      if (b) return clamp(pick(cone('wind', b.wind, t), level.wind ?? 0.5) + push, 0.05, 1);
      return clamp(eased(n.windBase, u.wind, t) + push, 0.05, 1);
    },
    rain(t) {
      if (winter) return 0;
      if (rainOf(t) > 0) return 1;
      const b = block(t);
      if (b) return pick({ lo: b.precip.lo > 0 ? 1 : 0, hi: b.precip.hi > 0 ? 1 : 0 }, level.rain ?? 0.5);
      return clamp(eased(n.rain, u.showers, t), 0, 1);
    },
    hourRain(t) {
      if (winter) return 0;
      const b = block(t);
      // The events' share of the hour: five-minute samples, twelve to the hour.
      let e = shared.eventRain.get(t);
      if (e === undefined) { e = 0; for (let k = 0; k < 12; k++) if (rainOf(t + (k + 0.5) * HOUR / 12) > 0) e += 1 / 12; shared.eventRain.set(t, e); }
      // Without a block: the usual share of showers on what the events leave dry.
      if (!b) return e + (1 - e) * clamp(eased(n.rain, u.showers, t), 0, 1);
      // The hour is twelve samples: the block's share of showers and the events' (the samples where either rains are at least the greater and at most the sum).
      return pick({ lo: Math.max(b.rain.lo, e), hi: Math.min(1, b.rain.hi + e) }, level.rain ?? 0.5);
    },
    warmth(t) {
      const b = block(t);
      if (!b) return eased(warmNow, usualWarm(t), t);
      return warmAt(b, t, level.warmth ?? 0.5, level.rain ?? 0.5);
    },
    warmths(t) {
      const b = block(t);
      if (!b) return [this.warmth(t)];
      // Across the drift and between no showers and the hardest, at least every quarter degree (a crop's pace peaks inside the range, and the water's with the heat).
      const all = [0, 0.5, 1].flatMap((d) => [0, 1].map((r) => warmAt(b, t, d, r))), lo = Math.min(...all), hi = Math.max(...all), n = Math.max(1, Math.min(12, Math.ceil((hi - lo) / 0.25)));
      return Array.from({ length: n + 1 }, (_, k) => lo + (hi - lo) * k / n);
    },
  };
}

/** The seeded weather itself. */
export function truthView(sc: Scenario): Ahead {
  const hourRain = (t: number) => { let n = 0; for (let k = 0; k < 12; k++) if (raining(sc, t + (k + 0.5) * HOUR / 12)) n++; return n / 12; };
  return { events: sc.events, sun: (t) => sunAt(sc, t), wind: (t) => windAt(sc, t), rain: (t) => (raining(sc, t) ? 1 : 0), hourRain, warmth: (t) => warmthIn(sc, t), warmths: (t) => [warmthIn(sc, t)] };
}

/** The usual weather from `now` on, with the events under way kept on. */
export const usualView = (sc: Scenario, now: number): Ahead => viewOf(sc, now, keptEvents(sc, now));

// ---- The forecast's worlds ----

/** The most worlds (combinations of the ways events may turn out) a projection runs over before it keeps to fewer ways for each event. */
const MAX_WORLDS = 128;
/** A night run at every half hour inside the windows is two runs a world (not nine), so it affords twice the worlds. */
const MAX_FINE_WORLDS = 256;

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
export function worldsOf(sc: Scenario, f: Forecast, now: number, until: number, fine = false): WeatherEvent[][] {
  // (The hour the player's forecast was in force: this hour's, or a sandbox forecast renewed at this very moment.)
  const at = Math.max(issueTimeOf(now), Math.min(f.issued, now));
  // What the player has seen begin and end (it changes the worlds), by event.
  const key = `${at}|${until}|${fine}|${sc.events.map((e) => `${e.start <= now ? 1 : 0}${endOf(e) <= now ? 1 : 0}`).join('')}`;
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
    ...(fine ? [(e: EventForecast) => [...gridWorlds(view, e, HOUR / 2), ...cornerWorlds(middle, centre(e))]] : []),
    (e) => [...cornerWorlds(view, e), ...cornerWorlds(middle, centre(e))],
    (e) => cornerWorlds(view, e),
    (e) => extremes(cornerWorlds(view, e)),
  ];
  let worlds: WeatherEvent[][] = [[]];
  const cap = fine ? MAX_FINE_WORLDS : MAX_WORLDS, dedupe = (r: WeatherEvent[][]) => r.filter((w, i, all) => all.findIndex((x) => JSON.stringify(x) === JSON.stringify(w)) === i);
  const count = (roots: WeatherEvent[][][]) => roots.reduce((n, r) => n * r.length, 1);
  for (let k = 0; k < tiers.length; k++) {
    const roots = roots0.map(tiers[k]).map(dedupe);
    if (count(roots) > cap && k < tiers.length - 1) continue;
    // Where the finer ways did not fit for every event, give them to as many events as fit, the cheapest first (the fewest worlds added: a window of
    // a few hours that is the one that matters tonight before a long one), then the earliest (the cap should not drop the timing of one event
    // because another was added).
    if (count(roots) <= cap) {
      const finest = roots0.map((e) => dedupe(tiers[0](e)));
      const order = roots0.map((_, n) => n).sort((a, b) => finest[a].length / roots[a].length - finest[b].length / roots[b].length || roots0[a].start.lo - roots0[b].start.lo);
      for (const i of order) {
        for (let finer = 0; finer < k; finer++) {
          const options = finer === 0 ? finest[i] : dedupe(tiers[finer](roots0[i])), trial = roots.map((r, n) => (n === i ? options : r));
          if (count(trial) <= cap) { roots[i] = options; break; }
        }
      }
    }
    worlds = [[]];
    for (const r of roots) worlds = worlds.flatMap((w) => r.map((x) => [...w, ...x]));
    // (At the last tier, if there are still too many, an even sample of them.)
    if (worlds.length > cap) worlds = worlds.filter((_, i) => i % Math.ceil(worlds.length / cap) === 0);
    break;
  }
  const out = worlds.map((w) => [...fixed, ...w]);
  if (!byKey) cache.set(f, (byKey = new Map<string, WeatherEvent[][]>()));
  if (byKey.size > 12) byKey.clear();
  byKey.set(key, out);
  return out;
}

// ---- Levels ----

/** The levels a lens takes in a range: its ends, and the middle (a result that is not monotone, a crop's pace across its comfortable warmth, peaks inside). */
export const LEVELS = [0, 0.5, 1] as const;

/**
 * Which conditions a projection varies over the forecast's ranges, and how. `together` move as one, all at their lowest or all at their
 * highest: for a result that only rises with each of them (a night's charge rises with the sun, the wind and the rain that rests the
 * sprinklers), the two runs bracket every other. `ends` are read at their lowest and highest in every combination (a crop grows faster
 * with every share of rain), `each` at every level in every combination: for a result that does not move one way with them (a crop's
 * pace across its warmth).
 */
export interface Lenses { together?: Dim[]; ends?: Dim[]; each?: Dim[]; /** Also run events at every half hour inside their windows (a night's charge is not monotone in when a storm begins or ends); where there are too few worlds to afford it, at their corners. */ fine?: boolean }

const viewCache = new WeakMap<Forecast, Map<string, Ahead[]>>();

/** A view that remembers what it said: the weather at the same time is worked out once. */
function remembered(v: Ahead): Ahead {
  const memo = { sun: new Map<number, number>(), wind: new Map<number, number>(), rain: new Map<number, number>(), hourRain: new Map<number, number>(), warmth: new Map<number, number>() }, warmths = new Map<number, number[]>();
  const wrap = (k: keyof typeof memo) => (t: number) => {
    let x = memo[k].get(t);
    if (x === undefined) memo[k].set(t, (x = v[k](t)));
    return x;
  };
  return { ...v, sun: wrap('sun'), wind: wrap('wind'), rain: wrap('rain'), hourRain: wrap('hourRain'), warmth: wrap('warmth'), warmths: (t) => { let x = warmths.get(t); if (!x) warmths.set(t, (x = v.warmths(t))); return x; } };
}

/**
 * The views a projection runs over: one for the truth or the usual weather; for a forecast, every world it allows at the levels of the
 * conditions `lenses` name. The views for a forecast are kept for half a second of play (the card is made again as the ghost moves) and
 * read the weather as it was then.
 */
export function viewsOf(s: GameState, reading: Reading, lenses: Lenses, until: number): Ahead[] {
  const sc = s.scenario;
  if (reading.kind === 'truth') return [truthView(sc)];
  if (reading.kind === 'usual') return [usualView(sc, s.time)];
  const f = reading.forecast, now = Math.floor(s.time * 2) / 2, by = Math.ceil(until / HOUR) * HOUR;
  const key = `${now}|${by}|${lenses.together?.join()}|${lenses.ends?.join()}|${lenses.each?.join()}|${lenses.fine}|${sc.events.map((e) => `${e.start <= now ? 1 : 0}${endOf(e) <= now ? 1 : 0}`).join('')}`;
  let byKey = viewCache.get(f);
  const hit = byKey?.get(key);
  if (hit) return hit;
  const worlds = worldsOf(sc, f, now, by, lenses.fine);
  let levels: Level[] = lenses.together?.length ? [0, 1].map((k) => Object.fromEntries((lenses.together as Dim[]).map((d) => [d, k]))) : [{}];
  for (const d of lenses.ends ?? []) levels = levels.flatMap((l) => [0, 1].map((k) => ({ ...l, [d]: k })));
  for (const d of lenses.each ?? []) levels = levels.flatMap((l) => LEVELS.map((k) => ({ ...l, [d]: k })));
  const out = worlds.flatMap((w) => { const shared: Shared = { pushes: new Map(), eventRain: new Map() }; return levels.map((l) => remembered(viewOf(sc, now, w, f.blocks, l, shared))); });
  if (!byKey) viewCache.set(f, (byKey = new Map<string, Ahead[]>()));
  if (byKey.size > 6) byKey.clear();
  byKey.set(key, out);
  return out;
}

/**
 * Whether the forecast leaves room in when an event of these kinds begins or ends, or what it is, for a projection until `until`: the worlds
 * differ in them. A result that is not monotone in such an event's timing (a dust storm that suppresses a harvest the soil would have made) can
 * fall between the sampled worlds.
 */
export function eventsVary(s: GameState, reading: Reading, until: number, kinds: readonly EventKind[]): boolean {
  if (reading.kind !== 'forecast') return false;
  const signatures = new Set(worldsOf(s.scenario, reading.forecast, Math.floor(s.time * 2) / 2, Math.ceil(until / HOUR) * HOUR).map((w) => JSON.stringify(w.filter((e) => kinds.includes(e.kind)))));
  return signatures.size > 1;
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
  // A forecast out of date reaches only as far as its blocks do; past them the weather is the usual.
  const last = reading.forecast.blocks[reading.forecast.blocks.length - 1];
  if (!last || until > last.end + 1e-6) return `${basis}, the usual weather past it`;
  return basis;
}
