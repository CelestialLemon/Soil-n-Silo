// Continuous, unpredictable living weather (docs/DESIGN.md, "Continuous, Unpredictable Living Weather"; Milestone 4).
//
// The valley's terrain comes from its seed; its weather from a separate `weatherSeed`, rolled fresh every time the game
// is played (rollWeatherSeed), so the same map never lives through the same week twice. The season and the valley's
// climate character ("A wet spring", "A hard winter") shape what can come.
//
// The weather is a timeline of spells (clear, showers, fog, a gale, a frosty night...), each lasting 6 to 16 game hours and
// easing into the next over an hour and a half. The timeline is a pure function of (season, climate, weatherSeed): any
// hour of any day can be read from it directly, so the Weather Station's forecast is simply the timeline read ahead,
// and always comes true. Spells start at any hour and drift across days and nights; nothing is saved up for a finale.
//
// On top of the spells, `stepWeather` keeps what weather leaves behind and builds up over time: the brook's flood surge
// after sustained rain (or a spring spate), how wet the ground is, the snow lying and the rime of frost.
import { sunFactor } from './clock.ts';
import { clamp, lerp, smoothstep } from './geom.ts';
import { hash3, makeRng, subSeed } from './rng.ts';
import type { GameState, Season } from './state.ts';

/** A valley's climate character: brush3d's CHARACTERS (renderer/season.ts), the season's twist. */
export const CLIMATES = ['mild', 'wet', 'dry', 'hot', 'gales', 'stormy', 'hard', 'highRiver'] as const;
export type ClimateCharacter = (typeof CLIMATES)[number];
export const isClimate = (c: string): c is ClimateCharacter => (CLIMATES as readonly string[]).includes(c);

/** Each season's characters, and the postcard's plain words for them. */
export const CLIMATE_DESCRIPTIONS: { readonly [S in Season]: Readonly<Partial<Record<ClimateCharacter, string>>> } = {
  spring: { mild: 'A mild spring', wet: 'A wet spring', highRiver: 'Spring spate', stormy: 'A stormy spring' },
  summer: { mild: 'A warm summer', dry: 'A dry summer', hot: 'A hot summer', stormy: 'Summer storms' },
  autumn: { mild: 'A crisp autumn', gales: 'Autumn, gales', wet: 'A wet autumn', stormy: 'Autumn squalls' },
  winter: { mild: 'A mild winter', hard: 'A hard winter', gales: 'Winter gales', wet: 'A snowy winter' },
};

/** The characters a season can have. */
export const climatesOf = (season: Season): ClimateCharacter[] => Object.keys(CLIMATE_DESCRIPTIONS[season]) as ClimateCharacter[];

/** The postcard's words for a season's character ("A hard winter"). */
export function describeClimate(season: Season, climate: ClimateCharacter): string {
  return CLIMATE_DESCRIPTIONS[season][climate] ?? `${season.charAt(0).toUpperCase()}${season.slice(1)}, ${climate}`;
}

/** A character for a season picked from `seed` (the same seed, the same character). */
export function climateFor(seed: number, season: Season): ClimateCharacter {
  const pool = climatesOf(season);
  return pool[Math.floor(makeRng(subSeed(seed, 98)).next() * pool.length) % pool.length];
}

/**
 * A fresh weather seed for a new play of a valley: from the clock and Math.random, so each run's weather differs. (The
 * rules never call it themselves: tests and replays pass their own seed.)
 */
export function rollWeatherSeed(): number {
  return (Math.floor(Math.random() * 0x7fffffff) ^ (Date.now() & 0x7fffffff)) >>> 0;
}

/** The weather's spells, as brush3d's weather presets name them where they share one. */
export const WEATHER_SPELLS = ['clear', 'scattered', 'overcast', 'fog', 'soft-rain', 'storm', 'heat-wave', 'gale', 'frost', 'snow', 'blizzard'] as const;
export type WeatherSpell = (typeof WEATHER_SPELLS)[number];
export const isWeatherSpell = (w: string): w is WeatherSpell => (WEATHER_SPELLS as readonly string[]).includes(w);

export const WEATHER_LABELS: { readonly [W in WeatherSpell]: string } = {
  clear: 'Clear', scattered: 'Fair, scattered cloud', overcast: 'Overcast', fog: 'Fog', 'soft-rain': 'Showers', storm: 'Thunderstorm',
  'heat-wave': 'Heatwave', gale: 'Gale', frost: 'Frost', snow: 'Snow', blizzard: 'Blizzard',
};

/** The tiny sky icons beside the dial. */
export type ForecastIcon = 'sun' | 'partly' | 'cloud' | 'fog' | 'rain' | 'storm' | 'heat' | 'gale' | 'frost' | 'snow';
export const FORECAST_ICONS: { readonly [W in WeatherSpell]: ForecastIcon } = {
  clear: 'sun', scattered: 'partly', overcast: 'cloud', fog: 'fog', 'soft-rain': 'rain', storm: 'storm', 'heat-wave': 'heat', gale: 'gale',
  frost: 'frost', snow: 'snow', blizzard: 'snow',
};

/** A weather name from elsewhere (an older weather word, a brush3d preset, a URL) as a spell: 'rain' is 'soft-rain'. */
export function toSpell(w: string): WeatherSpell {
  if (isWeatherSpell(w)) return w;
  switch (w) {
    case 'rain': case 'showers': case 'drizzle': return 'soft-rain';
    case 'breeze': case 'fair': return 'scattered';
    case 'heatwave': case 'heat': return 'heat-wave';
    case 'thunder': case 'thunderstorm': return 'storm';
    case 'wind': case 'windy': return 'gale';
    case 'mist': return 'fog';
    default: return 'clear';
  }
}

/** The weather now, and what it has left behind (on `state.sim.weather`). */
export interface WeatherState {
  spell: WeatherSpell; label: string;
  /** 0..1 each: how overcast, how hard it rains or snows, how stormy, how hot, how hazy. */
  cloudCover: number; rain: number; snow: number; storm: number; heat: number; haze: number;
  /** The wind, m/s: calm 2–4, a breeze 5–7, a gale 12–15, a storm 13–16, a blizzard 16–19. */
  windSpeed: number;
  /** The air at the homestead, °C (low hollows run colder: microclimate.ts localTempC). */
  tempC: number;
  /** How far the brook and pond stand above their usual level, m (0..FLOOD_MAX). */
  floodSurge: number;
  /** 0..1: how wet the ground is (rain wets it, sun and wind dry it). */
  groundWet: number;
  /** 0..1: the snow lying. */
  snowDepth: number;
  /** 0..1: the rime of frost on the ground. */
  frostCover: number;
  /** Lightning flickers (a storm at 0.6 or more). */
  lightning: boolean;
  /** 0..1: how soaked the catchment is (sustained rain raises the brook). */
  soak: number;
}

/** The highest the brook and pond rise in a flood, m. */
export const FLOOD_MAX = 0.38;

/** One spell on the timeline: game hours from the start of day 1. */
export interface SpellSpan { spell: WeatherSpell; start: number; end: number; intensity: number }

/** How a spell looks at full strength, and how it shifts the air's temperature. */
interface SpellLook { cloud: number; rain: number; snow: number; storm: number; heat: number; haze: number; wind: number; temp: number; nightTemp: number }
const LOOK: { readonly [W in WeatherSpell]: SpellLook } = {
  clear: { cloud: 0.08, rain: 0, snow: 0, storm: 0, heat: 0, haze: 0.05, wind: 3, temp: 0.5, nightTemp: -0.5 },
  scattered: { cloud: 0.4, rain: 0, snow: 0, storm: 0, heat: 0, haze: 0.1, wind: 5.5, temp: 0, nightTemp: 0 },
  overcast: { cloud: 0.85, rain: 0, snow: 0, storm: 0, heat: 0, haze: 0.2, wind: 4.5, temp: -1, nightTemp: 1 },
  fog: { cloud: 0.6, rain: 0, snow: 0, storm: 0, heat: 0, haze: 0.85, wind: 1.5, temp: -1, nightTemp: 0.5 },
  'soft-rain': { cloud: 0.9, rain: 0.6, snow: 0, storm: 0, heat: 0, haze: 0.3, wind: 5.5, temp: -2, nightTemp: 1 },
  storm: { cloud: 1, rain: 1, snow: 0, storm: 0.85, heat: 0, haze: 0.35, wind: 14.5, temp: -3, nightTemp: 1 },
  'heat-wave': { cloud: 0.05, rain: 0, snow: 0, storm: 0, heat: 1, haze: 0.3, wind: 2.5, temp: 5, nightTemp: 3 },
  gale: { cloud: 0.6, rain: 0.15, snow: 0, storm: 0, heat: 0, haze: 0.15, wind: 13.5, temp: -2, nightTemp: 1 },
  frost: { cloud: 0.05, rain: 0, snow: 0, storm: 0, heat: 0, haze: 0.1, wind: 1.5, temp: -2, nightTemp: -5 },
  snow: { cloud: 0.95, rain: 0, snow: 0.6, storm: 0, heat: 0, haze: 0.45, wind: 4.5, temp: -2, nightTemp: 0 },
  blizzard: { cloud: 1, rain: 0, snow: 1, storm: 0.3, heat: 0, haze: 0.8, wind: 17.5, temp: -7, nightTemp: -2 },
};

/** Each season's air: its daily mean and how far the afternoon rises above it (and the small hours fall below), °C. */
const SEASON_AIR: { readonly [S in Season]: { mean: number; swing: number } } = {
  spring: { mean: 12, swing: 6 }, summer: { mean: 23, swing: 6.5 }, autumn: { mean: 10, swing: 5 }, winter: { mean: -3, swing: 4 },
};
/** How a character shifts its season's air, °C. */
const CLIMATE_AIR: { readonly [C in ClimateCharacter]: number } = { mild: 0, wet: -1, dry: 1.5, hot: 2, gales: -1, stormy: 0, hard: -4, highRiver: 0 };
const MILD_WINTER = 2.5;

/**
 * How often each spell comes in a season (relative weights, before the character and the hour shift them). A spell the
 * season can't have weighs 0.
 */
const SEASON_SPELLS: { readonly [S in Season]: Readonly<Partial<Record<WeatherSpell, number>>> } = {
  spring: { clear: 3, scattered: 4, overcast: 2.5, fog: 1.2, 'soft-rain': 3, storm: 0.8, gale: 0.5, frost: 1.2 },
  summer: { clear: 4, scattered: 4, overcast: 1.5, fog: 0.4, 'soft-rain': 1.8, storm: 1.2, 'heat-wave': 1.6, gale: 0.3 },
  autumn: { clear: 2.5, scattered: 3, overcast: 3, fog: 2, 'soft-rain': 3, storm: 1, gale: 1.5, frost: 1.4 },
  winter: { clear: 3, scattered: 2.5, overcast: 3, fog: 1.5, frost: 2.2, snow: 2.2, blizzard: 0.6, gale: 0.8 },
};
/** How a character weighs the spells (multipliers). */
const CLIMATE_SPELLS: { readonly [C in ClimateCharacter]: Readonly<Partial<Record<WeatherSpell, number>>> } = {
  mild: { clear: 1.2, scattered: 1.2, storm: 0.5, blizzard: 0.4, gale: 0.6, 'heat-wave': 0.6, frost: 0.8 },
  wet: { 'soft-rain': 2.2, overcast: 1.5, storm: 1.3, snow: 2.2, clear: 0.6, 'heat-wave': 0.3 },
  dry: { clear: 1.8, 'soft-rain': 0.3, storm: 0.5, overcast: 0.6, 'heat-wave': 1.8, fog: 0.5 },
  hot: { 'heat-wave': 3, clear: 1.3, 'soft-rain': 0.6, overcast: 0.6 },
  gales: { gale: 4, overcast: 1.3, storm: 1.3, blizzard: 1.5, fog: 0.5 },
  stormy: { storm: 3.5, 'soft-rain': 1.4, gale: 1.5, clear: 0.7 },
  hard: { frost: 1.8, snow: 1.5, blizzard: 2.5, clear: 1.1, fog: 0.8 },
  highRiver: { 'soft-rain': 1.8, overcast: 1.3, storm: 1.2 },
};

/** How a spell's chance shifts with the hour it would begin: frosts and fog settle in overnight, heat builds by day. */
function hourAffinity(spell: WeatherSpell, startHour: number): number {
  const h = ((startHour % 24) + 24) % 24, night = h >= 17 || h < 3, morning = h >= 6 && h < 12;
  switch (spell) {
    case 'frost': return night ? 2.5 : 0.15;
    case 'fog': return h >= 19 || h < 6 ? 2 : 0.35;
    case 'heat-wave': return morning ? 2.2 : night ? 0.2 : 0.8;
    case 'storm': return h >= 12 && h < 20 ? 1.4 : 0.8;
    default: return 1;
  }
}

const SEASON_INDEX: { readonly [S in Season]: number } = { spring: 0, summer: 1, autumn: 2, winter: 3 };

// The timelines read so far, by (season, climate, weatherSeed): each grows on demand, spell by spell.
const timelines = new Map<string, { spans: SpellSpan[]; next: () => number }>();
const TIMELINE_CACHE = 16;

/**
 * The spell timeline for (season, climate, weatherSeed), read far enough to cover game hour `untilH` (hours from the start
 * of day 1). The first spell is always fair, until the early afternoon of day 1 or later, so a valley opens on a gentle
 * morning.
 */
export function spellTimeline(season: Season, climate: ClimateCharacter, weatherSeed: number, untilH: number): SpellSpan[] {
  const key = `${season}:${climate}:${weatherSeed >>> 0}`;
  let tl = timelines.get(key);
  if (!tl) {
    const rng = makeRng(hash3(weatherSeed >>> 0, SEASON_INDEX[season] * 16 + CLIMATES.indexOf(climate), 0x77ea));
    const next = () => rng.next();
    const first: WeatherSpell = next() < 0.6 ? 'clear' : 'scattered';
    tl = { spans: [{ spell: first, start: -6, end: 14 + next() * 5, intensity: 0.9 + 0.2 * next() }], next };
    if (timelines.size >= TIMELINE_CACHE) timelines.delete(timelines.keys().next().value ?? '');
    timelines.set(key, tl);
  }
  const { spans, next } = tl;
  while (spans[spans.length - 1].end <= untilH + 2) {
    const prev = spans[spans.length - 1], start = prev.end;
    const weights = SEASON_SPELLS[season], shift = CLIMATE_SPELLS[climate];
    const options = (Object.entries(weights) as [WeatherSpell, number][]).map(([spell, w]): [WeatherSpell, number] =>
      [spell, w * (shift[spell] ?? 1) * hourAffinity(spell, start) * (spell === prev.spell ? 0.35 : 1)]);
    const total = options.reduce((v, [, w]) => v + w, 0);
    let pick = next() * total, spell = options[0][0];
    for (const [s, w] of options) { pick -= w; if (pick <= 0) { spell = s; break; } }
    const hours = 6 + next() * 10;
    spans.push({ spell, start, end: start + hours, intensity: 0.9 + 0.2 * next() });
  }
  return spans;
}

/** Game hours from the start of day 1. */
export const absHour = (day: number, hour: number) => (day - 1) * 24 + hour;

/** How long two spells take to ease into each other, game hours. */
export const SPELL_BLEND_HOURS = 1.5;

/** The spell (or the two spells easing into each other) at game hour `t`: `a` and `b` with `b`'s share `w` (0..1). */
function spellsAt(season: Season, climate: ClimateCharacter, weatherSeed: number, t: number): { a: SpellSpan; b: SpellSpan; w: number } {
  const spans = spellTimeline(season, climate, weatherSeed, t);
  let k = spans.length - 1;
  while (k > 0 && spans[k].start > t) k--;
  const cur = spans[k], half = SPELL_BLEND_HOURS / 2;
  if (t > cur.end - half && k + 1 < spans.length) return { a: cur, b: spans[k + 1], w: smoothstep(0, 1, (t - (cur.end - half)) / SPELL_BLEND_HOURS) };
  if (t < cur.start + half && k > 0) return { a: spans[k - 1], b: cur, w: smoothstep(0, 1, (t - (cur.start - half)) / SPELL_BLEND_HOURS) };
  return { a: cur, b: cur, w: 0 };
}

/** The day-to-day drift of the air (a warmer or cooler day than the season's mean), °C. */
function dayDrift(weatherSeed: number, t: number): number {
  const d = Math.floor(t / 24), f = smoothstep(0, 1, t / 24 - d);
  const n = (k: number) => hash3(weatherSeed >>> 0, k, 0xd41f) / 0xffffffff * 3 - 1.5;
  return lerp(n(d), n(d + 1), f);
}

/** A gentle gusting of the wind over the hours, m/s. */
function gust(weatherSeed: number, t: number): number {
  const k = Math.floor(t * 2), f = smoothstep(0, 1, t * 2 - k);
  const n = (i: number) => hash3(weatherSeed >>> 0, i, 0x6057) / 0xffffffff * 1.6 - 0.8;
  return lerp(n(k), n(k + 1), f);
}

/** The air's diurnal swing at hour `h`: 1 at three in the afternoon, -1 at three in the morning. */
const diurnal = (h: number) => Math.cos((2 * Math.PI * (h - 15)) / 24);

/** What the sky is doing at an hour: everything but what builds up over time. */
export interface SkyNow {
  spell: WeatherSpell; cloudCover: number; rain: number; snow: number; storm: number; heat: number; haze: number; windSpeed: number; tempC: number;
}

/** The weather's settings that the timeline reads: the season, the valley's character and its weather seed. */
export interface WeatherKey { season: Season; climate: ClimateCharacter; weatherSeed: number }
export const weatherKeyOf = (s: GameState): WeatherKey => ({ season: s.season, climate: s.climate, weatherSeed: s.weatherSeed });

/** The air's base temperature for a season and character, °C. */
function airMean(season: Season, climate: ClimateCharacter): number {
  return SEASON_AIR[season].mean + CLIMATE_AIR[climate] + (season === 'winter' && climate === 'mild' ? MILD_WINTER : 0);
}

/** The warmest a held cold spell's air may be, °C: frost below freezing, snow colder still, a blizzard hard frozen. */
const FORCED_COLD_C: Readonly<Partial<Record<WeatherSpell, number>>> = { frost: -1, snow: -1.5, blizzard: -4 };

/**
 * The sky at game hour `t` (from the start of day 1), straight from the timeline: `forced` holds one spell instead (a
 * locked weather, or a test's). Pure: the same key and hour always give the same sky.
 */
export function skyAt(key: WeatherKey, t: number, forced?: WeatherSpell | null): SkyNow {
  const { season, climate, weatherSeed } = key;
  const pair = forced ? undefined : spellsAt(season, climate, weatherSeed, t);
  const a = pair ? pair.a : { spell: forced ?? 'clear', start: t, end: t + 1, intensity: 1 }, b = pair ? pair.b : a, w = pair ? pair.w : 0;
  const la = LOOK[a.spell], lb = LOOK[b.spell];
  const mix = (f: (l: SpellLook) => number, ia = 1, ib = 1) => lerp(f(la) * ia, f(lb) * ib, w);
  const ia = a.intensity, ib = b.intensity;
  const h = ((t % 24) + 24) % 24, d = diurnal(h), night = Math.max(0, -d);
  const cloudCover = clamp(mix((l) => l.cloud), 0, 1);
  let rain = clamp(mix((l) => l.rain, ia, ib), 0, 1), snow = clamp(mix((l) => l.snow, ia, ib), 0, 1);
  const storm = clamp(mix((l) => l.storm, ia, ib), 0, 1), heat = clamp(mix((l) => l.heat, ia, ib), 0, 1);
  const haze = clamp(mix((l) => l.haze), 0, 1);
  const shift = mix((l) => l.temp + l.nightTemp * night);
  const air = SEASON_AIR[season];
  let tempC = clamp(airMean(season, climate) + dayDrift(weatherSeed, t) + air.swing * (1 - 0.55 * cloudCover) * d + shift, -18, 38);
  // A cold spell held in place (Sandbox's weather lock, `?weather=`, a test's) brings its own freezing air whatever the
  // season, so a locked frost rimes the ground and locked snow falls as snow, not warm rain. The living weather (no spell
  // held) is untouched.
  if (forced) { const cold = FORCED_COLD_C[forced]; if (cold !== undefined) tempC = Math.min(tempC, cold); }
  // Rain falls as snow in the cold, and snow as rain in a thaw.
  if (tempC <= 0.5) { snow = clamp(snow + rain, 0, 1); rain = 0; }
  else if (tempC > 2.5) { rain = clamp(rain + snow, 0, 1); snow = 0; }
  const windSpeed = Math.max(0.5, mix((l) => l.wind, 0.95 + 0.1 * (ia - 0.9) / 0.2, 0.95 + 0.1 * (ib - 0.9) / 0.2) + gust(weatherSeed, t));
  return { spell: w < 0.5 ? a.spell : b.spell, cloudCover, rain, snow, storm, heat, haze, windSpeed, tempC };
}

/** The weather a valley opens with: the sky of its first morning, and its season's lie of the land. */
export function initialWeather(key: WeatherKey, day = 1, hour = 8, forced?: WeatherSpell | null): WeatherState {
  const sky = skyAt(key, absHour(day, hour), forced);
  const { season, climate } = key;
  const snowy = season === 'winter' && (climate === 'wet' || climate === 'hard');
  const soak = climate === 'highRiver' ? 0.5 : climate === 'wet' ? 0.25 : climate === 'dry' || climate === 'hot' ? 0 : 0.1;
  return {
    ...sky, label: WEATHER_LABELS[sky.spell], floodSurge: 0, groundWet: climate === 'wet' ? 0.4 : climate === 'dry' || climate === 'hot' ? 0.05 : 0.15,
    snowDepth: snowy ? 0.25 : 0, frostCover: sky.tempC <= 1 ? 0.4 : 0, lightning: sky.storm >= 0.6, soak,
  };
}

/**
 * How fast each character's catchment drains, per game hour: parched ground in a dry or hot summer drinks a storm
 * (rarely a flood), and a wet one is already soaked (a run of rain brings the brook up).
 */
const CATCHMENT_DRAIN: { readonly [C in ClimateCharacter]: number } = {
  mild: 0.045, wet: 0.03, dry: 0.08, hot: 0.08, gales: 0.045, stormy: 0.045, hard: 0.045, highRiver: 0.045,
};

/** How far the catchment's soak lifts the brook: nothing below 0.35, a full flood when soaked through. */
export const surgeOf = (soak: number) => FLOOD_MAX * smoothstep(0.35, 1, soak);

/**
 * Moves the weather on `dtH` game hours to `day`, `hour`: the sky from the timeline (or the locked weather, or `forced`
 * for this step: a test's or the world's own spell), and what builds up over time (the flood surge, the wet ground, the
 * snow and the frost). Returns the weather now (also on `state.sim.weather`).
 */
export function stepWeather(s: GameState, dtH: number, day: number, hour: number, forced?: WeatherSpell | null): WeatherState {
  const w = s.sim.weather, key = weatherKeyOf(s);
  const sky = skyAt(key, absHour(day, hour), forced ?? s.sim.weatherOverride);
  Object.assign(w, sky);
  w.label = WEATHER_LABELS[sky.spell];
  w.lightning = sky.storm >= 0.6;
  const dt = Math.max(0, dtH);
  if (dt > 0) {
    const sun = sunFactor(hour, s.season);
    // The catchment soaks up sustained rain and drains slowly; a spring spate keeps it high, swelling and easing over days.
    const spate = s.climate === 'highRiver' ? 0.4 + 0.22 * Math.sin((2 * Math.PI * absHour(day, hour)) / 60 + (key.weatherSeed % 7)) : 0;
    w.soak = clamp(w.soak + dt * (0.07 * sky.rain + 0.05 * sky.storm + 0.02 * sky.snow * (sky.tempC > 1 ? 1 : 0) - CATCHMENT_DRAIN[s.climate]), spate, 1);
    const target = surgeOf(w.soak);
    w.floodSurge = target > w.floodSurge ? Math.min(target, w.floodSurge + 0.06 * dt) : Math.max(target, w.floodSurge - 0.03 * dt);
    if (w.floodSurge < 1e-4) w.floodSurge = 0;
    // Rain wets the ground; sun and wind dry it.
    w.groundWet = clamp(w.groundWet + dt * (0.3 * sky.rain - 0.03 * (0.3 + sun + sky.windSpeed / 10) * (1 - sky.rain)), 0, 1);
    // Snow lies where it's freezing and melts in a thaw.
    w.snowDepth = clamp(w.snowDepth + dt * (sky.tempC <= 1 ? 0.06 * sky.snow : -0.02 * (sky.tempC - 1) - 0.01 * sun), 0, 1);
    // Rime builds on freezing nights and in a frost, and the morning sun melts it.
    const freezing = sky.tempC <= 1 || sky.spell === 'frost';
    w.frostCover = clamp(w.frostCover + dt * (freezing ? 0.25 * (sky.tempC <= 1 ? 1 : 0.4) : -(0.3 * (sun + 0.3) + 0.05 * Math.max(0, sky.tempC - 1))), 0, 1);
  }
  return w;
}

/** A day ahead, as the Weather Station reads it. */
export interface DayForecast { day: number; icon: ForecastIcon; spell: WeatherSpell; label: string; minTempC: number; maxTempC: number }

/** How much each spell counts toward a day's icon, per hour it holds (the weather that shapes a day wins it). */
const SEVERITY: { readonly [W in WeatherSpell]: number } = {
  clear: 1, scattered: 1, overcast: 1.1, fog: 1.2, 'soft-rain': 1.5, storm: 3, 'heat-wave': 2.5, gale: 2.5, frost: 1.8, snow: 2, blizzard: 3,
};

/** How finely a forecast reads its day, game hours: fine enough that its low and high are the day's own to 0.1°C. */
export const FORECAST_STEP_HOURS = 1 / 6;

/**
 * A day's weather read straight from the timeline: the spell that shapes it, and its coldest and warmest air (read every
 * ten minutes, and at each spell's turn within the day, where the air shifts fastest).
 */
export function forecastDay(key: WeatherKey, day: number, forced?: WeatherSpell | null): DayForecast {
  const hours = new Map<WeatherSpell, number>(), t0 = absHour(day, 0), steps = Math.round(24 / FORECAST_STEP_HOURS);
  let lo = Infinity, hi = -Infinity;
  const air = (t: number) => { const c = skyAt(key, t, forced).tempC; lo = Math.min(lo, c); hi = Math.max(hi, c); };
  for (let k = 0; k < steps; k++) {
    const sky = skyAt(key, t0 + (k + 0.5) * FORECAST_STEP_HOURS, forced);
    hours.set(sky.spell, (hours.get(sky.spell) ?? 0) + FORECAST_STEP_HOURS);
    lo = Math.min(lo, sky.tempC); hi = Math.max(hi, sky.tempC);
  }
  for (let k = 0; k <= steps; k++) air(t0 + k * FORECAST_STEP_HOURS);
  if (!forced) {
    const half = SPELL_BLEND_HOURS / 2;
    for (const sp of spellTimeline(key.season, key.climate, key.weatherSeed, t0 + 24))
      for (const t of [sp.start - half, sp.start, sp.start + half]) if (t >= t0 && t <= t0 + 24) air(t);
  }
  let spell: WeatherSpell = 'clear', best = -1;
  for (const [sp, h] of hours) { const score = h * SEVERITY[sp]; if (score > best) { best = score; spell = sp; } }
  return { day, icon: FORECAST_ICONS[spell], spell, label: WEATHER_LABELS[spell], minTempC: Math.round(lo * 10) / 10, maxTempC: Math.round(hi * 10) / 10 };
}

/** The next `count` days (tomorrow first), read from the same timeline the weather will follow: the forecast comes true. */
export function forecastDays(s: GameState, count = 3): DayForecast[] {
  const key = weatherKeyOf(s), out: DayForecast[] = [];
  for (let k = 1; k <= count; k++) out.push(forecastDay(key, s.sim.day + k, s.sim.weatherOverride));
  return out;
}

/** Whether the homestead has its Weather Station, which reads the days ahead. */
export const hasWeatherStation = (s: GameState): boolean => s.things.some((t) => t.kind === 'weather_station');

/** The forecast the sky strip shows: the next `count` days once a Weather Station stands, none before. */
export const stationForecast = (s: GameState, count = 3): DayForecast[] => (hasWeatherStation(s) ? forecastDays(s, count) : []);

/**
 * A plain line for the weather now (its sky, air, wind, and any frost, snow or flood), and tomorrow's outlook once a
 * Weather Station stands (none before it: the station is what reads the days ahead).
 */
export function describeWeather(s: GameState): string {
  const w = s.sim.weather;
  const parts = [`${w.label}, ${Math.round(w.tempC)}°C`, `wind ${Math.round(w.windSpeed)} m/s`];
  if (w.snowDepth > 0.05) parts.push('snow lying');
  if (w.frostCover > 0.3) parts.push('frost on the ground');
  if (s.sim.floodApplied > 0) parts.push('the brook in flood');
  if (hasWeatherStation(s)) {
    const [next] = forecastDays(s, 1);
    parts.push(`Tomorrow: ${next.label.toLowerCase()}, ${Math.round(next.minTempC)} to ${Math.round(next.maxTempC)}°C`);
  }
  return parts.join(' · ');
}

