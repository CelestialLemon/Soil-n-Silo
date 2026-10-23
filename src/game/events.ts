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
// Each of 2.3–2.8 fills in its events' pushes; those still empty change the sky and the HUD chip but not the rules.

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
  /** How far the day's warmth is lifted to a mild day's curve (0–1; never cooled: a day already warmer stays as it is). */
  mild: { neutral: 0, mix: 'max' },
  /** Gale-force wind, in multiples of a full wind (0: none): a turbine stops while this times its exposure is over the limit (wind.ts). */
  gale: { neutral: 0, mix: 'max' },
  /** A multiple of how far the bees fly: below half they stay in. */
  bees: { neutral: 1, mix: 'mul' },
  /** How far the river's quiet stretches are frozen over (0–1; ice.ts): a wheel on one makes that much less, and none when it is frozen shut. A fall keeps running. */
  ice: { neutral: 0, mix: 'max' },
  /** A multiple of the hens' laying. */
  hens: { neutral: 1, mix: 'mul' },
  /** A multiple of the heat a greenhouse needs: the hook for the greenhouse (phase 4), which doubles its heating in a cold snap. Nothing reads it yet. */
  heating: { neutral: 1, mix: 'mul' },
} as const satisfies Record<string, { neutral: number; mix: 'mul' | 'add' | 'max' }>;

export type Lever = keyof typeof LEVERS;
/** The levers' values at a moment, all events' pushes combined. */
export type Pushes = Record<Lever, number>;

const LEVER_IDS = Object.keys(LEVERS) as Lever[];

export const NEUTRAL: Readonly<Pushes> = Object.freeze(Object.fromEntries(LEVER_IDS.map((l) => [l, LEVERS[l].neutral])) as Pushes);

// ---- The catalogue ----

/**
 * The shapes a weather marker can take (the Clearday status shapes are taken by circle, half circle, square, triangle, drop and
 * ring): one for each bad event, drawn in `game.css`. An event with a `shape` marks the buildings and trucks it holds.
 */
export const SHAPES = ['bolt', 'sun', 'bars', 'chevron', 'swirl', 'wave', 'diamond', 'flake', 'slash', 'dots'] as const;
export type Shape = typeof SHAPES[number];

/**
 * A haze an event lays on the ground (a fog, a dust storm): how thick (0–1; the renderer's `haze`: about 0.3 a thin mist, 0.6 a fog),
 * its colour (sRGB hex), the height it reaches (metres; the renderer's `hazeTop`) and, for a haze that lifts, the share of its thickness
 * left by the time the event ends.
 */
export interface Haze { amount: number; color: number; top: number; thins?: number }

/** The hazes the catalogue uses: a cool grey for a fog, a warm brown for dust. */
export const FOG_HAZE = 0xcfd6d8, DUST_HAZE = 0xc49a62;

/** How an event looks in the sky, apart from its effects: the cover and the rain or snow drawn, how warm the light is (0–1), and its haze. */
export interface Look { cloud?: number; precip?: number; heat?: number; haze?: Haze }

export interface EventInfo {
  name: string;
  /** The severe form's name where it has its own ("Hurricane"). */
  severeName?: string;
  /** A good event: it helps, and is never severe. */
  good?: boolean;
  /** How long it lasts, in game hours (a random one rolls between the two). */
  hours: readonly [number, number];
  /** The severe form's hours, where it lasts longer than the ordinary one. */
  severeHours?: readonly [number, number];
  /** It rains hard enough to count as heavy rain, for what heavy rain brings (a spring flood, 2.5): see `heavyRainEvents`. */
  heavyRain?: boolean;
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
  /**
   * The shape of the marker over what the event stops or slows, once the event holds anything (the shape is the event's own, so
   * the layout's problems and the weather's can be told apart at a glance); with `holds`, what it does, in a few words, for the
   * list of markers. A good event holds nothing.
   */
  shape?: Shape;
  holds?: string;
  /** What it brings next: a flood follows its storm, at the same strength. */
  then?: EventKind;
  /** The seasons `then` follows in (default: every one). Needs the season to be known (`eventChain`), else nothing follows. */
  thenIn?: readonly Season[];
  /** For a flood: how many levels above its normal surface the water stands at the peak, by strength (flood.ts). */
  flood?: Partial<Record<Strength, number>>;
  /** The share of the event, around its middle (its worst hours), that the trucks stay in their garages, by strength (wind.ts). */
  garages?: Partial<Record<Strength, number>>;
  /** The game hours its effects outlast it (snow on the panels after a blizzard, until it melts); the results count what it cost over them too. */
  lingers?: number;
  /** For a dust storm: the fertility an unguarded field's tile loses each game hour at full strength, by strength (dust.ts). */
  dust?: Partial<Record<Strength, number>>;
}

/**
 * Every weather event. Seasons and characters follow `docs/CLIMATE.md` (the table in #84); the odds are first sketches.
 * `push` is where an event's effects go (2.3–2.8); an event with it empty so far changes the sky, the HUD chip and the forecast's
 * list but not the rules.
 */
export const EVENTS: Record<EventKind, EventInfo> = {
  thunderstorm: {
    name: 'Thunderstorm', hours: [10, 14], seasons: { spring: 1, summer: 1 }, severe: true,
    odds: { stormy: 2.5, wet: 1.5, hot: 1.2, mild: 0.7, dry: 0.4 }, heavyRain: true, look: { cloud: 1, precip: 0.9 },
    shape: 'bolt', holds: 'solar panels weak under the cloud',
    // In spring heavy rain swells the river: a flood follows the storm (at its strength). In summer the ground drinks it.
    then: 'flood', thenIn: ['spring'],
    // Heavy rain waters every field and the sprinklers rest; little sun; gusts, stronger in a severe one.
    push: { ordinary: { rain: 0.9, sun: 0.6, wind: 0.45 }, severe: { rain: 1, sun: 0.4, wind: 0.7 } },
  },
  heatWave: {
    name: 'Heat wave', hours: [24, 40], severeHours: [40, 64], seasons: { summer: 1 }, severe: true,
    odds: { hot: 2.5, dry: 2, wet: 0.5, mild: 0.4, stormy: 0.6 }, look: { heat: 1 },
    shape: 'sun', holds: 'hens laying slowly, dry fields nearly stopped',
    // The whole warmth curve lifts past 30°C: unwatered fields nearly stop and hens slow (warmth.ts). A severe one is hotter and longer.
    push: { ordinary: { warmth: 5 }, severe: { warmth: 9 } },
  },
  fog: {
    name: 'Fog', hours: [4, 7], begins: [3, 7], seasons: { autumn: 1 }, severe: true,
    odds: { wet: 1.5, mild: 1.2, gales: 0.3, stormy: 0.5 },
    // A cool grey haze on the ground that thins as the morning lifts it (to a third of its thickness by the end).
    look: { cloud: 0.6, haze: { amount: 0.6, color: FOG_HAZE, top: 4, thins: 0.35 } },
    shape: 'bars', holds: 'trucks crawling, solar panels weak',
    // Solar is weak and the trucks crawl; a severe fog is thicker.
    push: { ordinary: { sun: 0.4, trucks: 0.5 }, severe: { sun: 0.25, trucks: 0.35 } },
  },
  softRain: {
    name: 'Soft rain', good: true, hours: [20, 28], seasons: { spring: 1, autumn: 1 },
    odds: { wet: 1.8, mild: 1.2, dry: 0.4 }, look: { cloud: 0.7, precip: 0.35 },
    // Gentle rain waters every field (and rests the sprinklers); it is too light to count as heavy rain.
    push: { ordinary: { rain: 0.35 } },
  },
  warmSpell: {
    name: 'Warm spell', good: true, hours: [24, 48], seasons: { autumn: 1, winter: 1 },
    odds: { mild: 1.5, hot: 1.5, hard: 0.3 }, look: {},
    // The day is lifted to a mild day's warmth (MILD_DAY): crops grow at a mild season's pace and the bees fly.
    push: { ordinary: { mild: 1 } },
  },
  steadyBreeze: {
    name: 'Steady breeze', good: true, hours: [20, 28], seasons: { summer: 1 },
    odds: { dry: 1.2, hot: 1.2, stormy: 0.5 }, look: {},
    // A wind in the calm season, on top of the calm spells.
    push: { ordinary: { wind: 0.4 } },
  },
  gale: {
    name: 'Gale', hours: [20, 28], seasons: { autumn: 1 }, severe: true,
    odds: { gales: 3, stormy: 2, mild: 0.4 }, look: { cloud: 0.5 },
    shape: 'chevron', holds: 'turbines too exposed stopped, sheltered ones turning slowly, bees kept in',
    // A strong wind (the wind push is a full wind's worth, so no calm spell dims it and turbines make all they can) and the bees stay in. In a severe one the wind is past what an exposed turbine stands
    // (`gale`, over the limit once exposure is above about three quarters): sheltered turbines furl and keep turning, unsteadily.
    push: { ordinary: { wind: 1, bees: 0 }, severe: { wind: 1, bees: 0, gale: 1.3 } },
  },
  tropicalStorm: {
    name: 'Tropical storm', severeName: 'Hurricane', hours: [24, 48], seasons: { summer: 0.15, autumn: 0.3 }, severe: true, then: 'flood',
    odds: { stormy: 3, wet: 1.5, gales: 1.2, mild: 0.3, dry: 0.1, hot: 0.5 }, heavyRain: true, look: { cloud: 1, precip: 0.8 },
    shape: 'swirl', holds: 'solar panels weak; in a hurricane every turbine, hen and bee stopped and the trucks kept in their garages',
    // Days of heavy rain and wind, and the flood after it. The bees stay in. A hurricane (the severe one) is wind no turbine stands (`gale`
    // over the limit even for a turbine in deep shelter), almost no sun, hens that stop laying, trucks that stay home through its worst
    // hours, and a flood a level higher (flood.ts, from its strength).
    push: {
      ordinary: { rain: 1, sun: 0.4, wind: 0.6, bees: 0 },
      severe: { rain: 1, sun: 0.05, wind: 0.8, gale: 3, bees: 0, hens: 0 },
    },
    garages: { severe: 0.5 },
  },
  flood: {
    name: 'Flood', hours: [24, 48], seasons: { spring: 1 }, severe: true,
    odds: { highRiver: 3, wet: 2, stormy: 1.5, mild: 0.6, dry: 0.2 }, push: {}, look: { cloud: 0.5, precip: 0.2 },
    shape: 'wave', holds: 'buildings under the water stopped, fields losing their crop',
    // The river stands 1 level above its surface at the peak, 2 in a severe one (a hurricane's flood is the severe one): see flood.ts.
    flood: { ordinary: 1, severe: 2 },
  },
  lateFrost: {
    name: 'Late frost', hours: [8, 10], begins: [20, 23], seasons: { spring: 1 }, severe: true,
    odds: { dry: 1.5, gales: 0.5, wet: 0.8, hot: 0.2, mild: 0.4 }, look: {},
    shape: 'diamond', holds: 'tender crops lost in the frost hollows',
    // A still, clear night: frost settles on the low ground round each spot and a tender crop there is lost (frost.ts). A severe one is a windy cold night, which reaches the slopes too.
    push: { severe: { wind: 0.5 } },
  },
  coldSnap: {
    name: 'Cold snap', hours: [24, 48], seasons: { winter: 1 }, severe: true,
    odds: { hard: 2.5, gales: 1, mild: 0.3 }, look: { cloud: 0.3 },
    shape: 'flake', holds: 'water wheels on frozen river, hens laying slowly',
    // The whole warmth curve drops and the hens slow; the river freezes over at its quiet stretches (ice.ts), though not at a fall;
    // a greenhouse (phase 4) needs twice the heat. A severe snap is colder and the hens all but stop.
    push: { ordinary: { warmth: -8, ice: 1, hens: 0.6, heating: 2 }, severe: { warmth: -13, ice: 1, hens: 0.35, heating: 3 } },
  },
  blizzard: {
    name: 'Blizzard', hours: [24, 48], seasons: { winter: 1 }, only: ['hard'], severe: true, lingers: 16,
    look: { cloud: 1, precip: 1 }, shape: 'slash', holds: 'solar panels dark and under snow, trucks slowed by snow',
    // No sun and trucks slowed by the snow; the snow it leaves on the panels melts off slowly afterwards (snow.ts). A severe one is deeper.
    push: { ordinary: { sun: 0, trucks: 0.5 }, severe: { sun: 0, trucks: 0.3 } },
  },
  dustStorm: {
    name: 'Dust storm', hours: [12, 24], seasons: { summer: 1 }, only: ['dry'], severe: true,
    odds: { dry: 2 }, look: { cloud: 0.4, heat: 0.5, haze: { amount: 0.7, color: DUST_HAZE, top: 6 } },
    shape: 'dots', holds: 'solar panels weak, trucks crawling, unguarded fields losing soil',
    // The sun is veiled to a third and the trucks crawl; the wind lifts the soil off fields with no tree or bean field beside
    // them (dust.ts). A severe one is thicker and takes twice the soil.
    push: { ordinary: { sun: 0.33, trucks: 0.6 }, severe: { sun: 0.2, trucks: 0.45 } },
    dust: { ordinary: 0.6, severe: 1.2 },
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

/**
 * The events under way that bring heavy rain: a thunderstorm and a tropical storm. A spring flood (2.5) builds on these;
 * a soft rain and the everyday showers are not heavy rain.
 */
export const heavyRainEvents = (sc: Pick<Scenario, 'events'>, time: number): WeatherEvent[] =>
  activeEvents(sc, time).filter((a) => EVENTS[a.event.kind].heavyRain).map((a) => a.event);

/** Where one event has a lever now: the value it pushes it to, felt as strongly as the event is; undefined where it doesn't push it. */
export function feltPush({ event, intensity }: Active, lever: Lever): number | undefined {
  const v = EVENTS[event.kind].push[event.strength]?.[lever];
  return v === undefined ? undefined : LEVERS[lever].neutral + (v - LEVERS[lever].neutral) * intensity;
}

/** What the events under way push the levers to, combined (see LEVERS). */
export function pushesOf(active: readonly Active[]): Pushes {
  if (!active.length) return NEUTRAL;
  const out = { ...NEUTRAL };
  for (const a of active) {
    for (const l of LEVER_IDS) {
      const felt = feltPush(a, l);
      if (felt === undefined) continue;
      const { mix } = LEVERS[l];
      out[l] = mix === 'mul' ? out[l] * felt : mix === 'add' ? out[l] + felt : Math.max(out[l], felt);
    }
  }
  return out;
}

/** The levers at a time. The rules read the sun, wind, rain, warmth, river and trucks through this. */
export const pushesAt = (sc: Pick<Scenario, 'events'>, time: number): Pushes => pushesOf(activeEvents(sc, time));

/** How the sky looks because of the events under way: the most cloud, the hardest rain and the warmest light any of them gives, felt as strongly as they are, and the thickest haze. */
export function lookAt(sc: Pick<Scenario, 'events'>, time: number): { cloud: number; precip: number; heat: number; haze: Haze | null } {
  let cloud = 0, precip = 0, heat = 0, haze: Haze | null = null;
  for (const { event, intensity } of activeEvents(sc, time)) {
    const look = EVENTS[event.kind].look, k = intensity * (event.strength === 'severe' ? 1.15 : 1);
    cloud = Math.max(cloud, Math.min(1, (look.cloud ?? 0) * k));
    precip = Math.max(precip, Math.min(1, (look.precip ?? 0) * k));
    heat = Math.max(heat, Math.min(1, (look.heat ?? 0) * k));
    if (look.haze) {
      // A haze that lifts is thickest at the start and thins toward the end, on top of the ramp in and out.
      const lift = 1 - (1 - (look.haze.thins ?? 1)) * Math.min(1, Math.max(0, (time - event.start) / event.length));
      const amount = Math.min(1, look.haze.amount * k * lift);
      if (!haze || amount > haze.amount) haze = { ...look.haze, amount };
    }
  }
  return { cloud, precip, heat, haze };
}

// ---- Building events ----

/** The range of hours an event of a kind lasts at a strength (the severe form's own, where it has one). */
export const hoursOf = (kind: EventKind, strength: Strength = 'ordinary'): readonly [number, number] =>
  (strength === 'severe' && EVENTS[kind].severeHours) || EVENTS[kind].hours;

/** The hours an event of a kind lasts when nothing says: the middle of its range. */
const usualHours = (kind: EventKind, strength: Strength) => { const h = hoursOf(kind, strength); return (h[0] + h[1]) / 2; };

/** What follows an event of a kind: its `then`, in the seasons it follows in (nothing in a season not known, if it is limited to some). */
const followingOf = (kind: EventKind, season?: Season): EventKind | undefined => {
  const e = EVENTS[kind];
  return !e.thenIn || (season !== undefined && e.thenIn.includes(season)) ? e.then : undefined;
};

/**
 * An event and what follows it (a flood after a tropical storm, or after a spring thunderstorm) starting at `start`, each lasting
 * `hours` (default: the kind's usual). `season` is the commission's, for what follows only in some seasons.
 */
export function eventChain(kind: EventKind, strength: Strength, start: number, hours?: number, season?: Season): WeatherEvent[] {
  const out: WeatherEvent[] = [];
  let at = snap(start);
  for (let k: EventKind | undefined = kind; k; k = followingOf(k, season)) {
    const length = snap((out.length ? usualHours(k, strength) : hours ?? usualHours(k, strength)) * HOUR);
    out.push({ kind: k, strength, start: at, length });
    at += length;
  }
  return out;
}

/**
 * An event placed by hand, for a campaign commission: "a gale on day 4, from 10:00" is `eventOn(4, 10, 'gale')`. It lasts the
 * kind's usual hours unless `hours` says. What follows it comes too (a tropical storm's flood), so the result is a list. Give the
 * commission's `season` for an event whose follower comes only in some seasons (a thunderstorm's flood, in spring).
 */
export function eventOn(day: number, hour: number, kind: EventKind, strength: Strength = 'ordinary', hours?: number, season?: Season): WeatherEvent[] {
  if (strength === 'severe' && !EVENTS[kind].severe) throw new Error(`${EVENTS[kind].name} has no severe form`);
  return eventChain(kind, strength, timeOf(day, hour), hours, season);
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
  const kinds = [...bad, ...good].map((kind, i) => ({ kind, strength: strengths[i], hours: hoursOf(kind, strengths[i]) }));
  for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
  const blocks = kinds.map((k) => eventChain(k.kind, k.strength, 0, Math.round((k.hours[0] + r() * (k.hours[1] - k.hours[0])) * 2) / 2, climate.season));
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
  const chain = eventChain(kind, strength, s.time, undefined, s.scenario.climate.season), shift = s.time - chain[0].start;
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
