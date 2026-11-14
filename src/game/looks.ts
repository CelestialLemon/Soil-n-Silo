import { DAY_SECONDS } from './data.ts';
import { endOf, EVENTS, intensityAt, type WeatherEvent } from './events.ts';
import { floodUnder } from './flood.ts';
import { hash2 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import { dayAt, hourAt, windAt } from './sim/clock.ts';
import { weatherAt } from './sim/weather.ts';
import { warmthIn } from './warmth.ts';

// The weather's looks (#207): what brush3d draws that the game's rules don't track, worked out from what the game already
// knows (the season, the weather, the warmth, the wind and the events), so the picture can show it. LOOKS ONLY: no rule reads
// anything here, and nothing here is saved (each is a function of the commission and the clock, so a save loads under the same
// sky and replays the same lightning). Whether any of it should ever matter to play is parked in #214. The world layer
// (src/world/brush/) sends it to the renderer; test/looks.test.ts checks no rule imports this file.
//
// - How stormy the sky looks (`stormAt`): the stormy events' (Look.storm), leading their rain, so a storm darkens before the
//   rain comes and lifts before it stops.
// - The gold light under the clouds (`sunUnderAt`): a seeded roll at each dawn and dusk, and at a storm's edges as it comes
//   and goes.
// - Lightning (`lightningIn`): strikes on the land and distant flickers, at seeded game minutes while a thunderstorm or a
//   tropical storm lasts (Look.bolts, Look.far); the distant thunder comes before the storm and lingers after it.
// - What the weather leaves on the land (`groundLooksAt`): an ordinary night frost on clear, cold, still nights; how wet the
//   land is from the rain so far; and how muddy the river runs after heavy rain and in a flood.

const HOUR = DAY_SECONDS / 24;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => { const u = clamp01(t); return u * u * (3 - 2 * u); };
/** A severe event looks a little stronger (as events.ts's `lookAt`). */
const strengthOf = (e: WeatherEvent) => (e.strength === 'severe' ? 1.15 : 1);

// ---- The storm ----

/** How far ahead of its event a storm's look runs (game hours): it darkens this much before its rain, and lifts as much before the rain stops. */
export const STORM_LEAD = 0.75;

/** How stormy the sky looks at a time, 0–1 (brush3d's `storm`). */
export function stormAt(sc: Pick<Scenario, 'events'>, time: number): number {
  let out = 0;
  for (const e of sc.events) {
    const storm = EVENTS[e.kind].look.storm;
    if (storm) out = Math.max(out, Math.min(1, storm * intensityAt(e, time + STORM_LEAD * HOUR) * strengthOf(e)));
  }
  return out;
}

// ---- The gold light under the clouds ----

/** The chance a dawn or a dusk breaks gold under the clouds, the hours either side of sunrise or sunset it lasts, and the chance each edge of a storm does. */
export const GOLD = { chance: 0.3, hours: 1.25, storm: 0.5 };

/**
 * How much of a low sun gets in under the cloud at a time, 0–1 (brush3d's `sunUnder`): it only shows under a heavy cover,
 * lighting the land gold beneath a grey sky. Some dawns and dusks (a seeded roll each), and some storms' edges as they come
 * and go (one roll for each edge), at any hour under a storm.
 */
export function sunUnderAt(sc: Pick<Scenario, 'events' | 'seed' | 'climate'>, time: number): number {
  const h = hourAt(time), day = dayAt(time), { rise, set } = sc.climate.sun;
  let out = 0;
  [rise, set].forEach((edge, k) => {
    const off = Math.abs(h - edge);
    if (off < GOLD.hours && hash2(day, k, sc.seed + 311) < GOLD.chance) out = Math.max(out, smooth(1 - off / GOLD.hours));
  });
  for (const e of sc.events) {
    const storm = EVENTS[e.kind].look.storm;
    if (!storm) continue;
    const s = intensityAt(e, time + STORM_LEAD * HOUR);
    if (s <= 0 || s >= 1) continue;
    // The storm's front edge or its back, by which half of it this is: each breaks gold on its own roll, most halfway in.
    const back = time > e.start + e.length / 2 ? 1 : 0;
    if (hash2(Math.round(e.start / HOUR * 2), back, sc.seed + 313) < GOLD.storm) out = Math.max(out, clamp01(1 - Math.abs(s - 0.5) * 2.5));
  }
  return out;
}

// ---- Lightning ----

/** Lightning is rolled once a game minute. */
export const LIGHTNING_STEP = HOUR / 60;
/** The game hours the distant thunder comes before a storm, and lingers after it. */
export const FAR_HOURS = 1.5;

/** A strike: when (game seconds), where on the map (tiles; a little beyond its edge too), how strong (0–1) and the bolt's shape. */
export interface StrikeAt { time: number; x: number; y: number; strength: number; seed: number }
/** Distant lightning: when, how strong (0–1) and which way it lies (radians, from +x towards +y). */
export interface FlickerAt { time: number; strength: number; bearing: number }

/** How many tiles beyond the map's edge a strike may land. */
const STRIKE_MARGIN = 6;

/**
 * The lightning in the game minutes after `from` up to `to` (game seconds) on a map `width` × `height` tiles: seeded, so a time
 * always brings the same. Strikes come at a storm's height (its strength squared, so they cluster in its middle); flickers
 * from before it comes to after it has gone. The rates are for the game at 1×; `keep` (0–1) keeps that share of them (a
 * seeded share, the same ones each time), so at 4× a storm lights up as often a real second as at 1×.
 */
export function lightningIn(sc: Pick<Scenario, 'events' | 'seed'>, from: number, to: number, width: number, height: number, keep = 1): { strikes: StrikeAt[]; flickers: FlickerAt[] } {
  const strikes: StrikeAt[] = [], flickers: FlickerAt[] = [];
  const far = FAR_HOURS * HOUR, storms = sc.events.filter((e) => (EVENTS[e.kind].look.bolts || EVENTS[e.kind].look.far) && e.start - far < to && endOf(e) + far > from);
  if (!storms.length || !(to > from)) return { strikes, flickers };
  const seed = sc.seed + 317;
  for (let k = Math.floor(from / LIGHTNING_STEP) + 1; k * LIGHTNING_STEP <= to; k++) {
    const t = k * LIGHTNING_STEP;
    let bolts = 0, distant = 0;
    for (const e of storms) {
      const look = EVENTS[e.kind].look, i = intensityAt(e, t);
      bolts += (look.bolts ?? 0) * i * i * strengthOf(e);
      // Distant thunder: from FAR_HOURS before the storm, building to its full rate as the storm begins, and dying away as long after.
      distant += (look.far ?? 0) * smooth(Math.min(t - (e.start - far), endOf(e) + far - t) / far);
    }
    // Rates a game hour, so chances a game minute.
    if (hash2(k, 9, seed) >= keep) continue;
    if (hash2(k, 1, seed) < bolts / 60) {
      strikes.push({
        time: t, x: -STRIKE_MARGIN + hash2(k, 2, seed) * (width + 2 * STRIKE_MARGIN), y: -STRIKE_MARGIN + hash2(k, 3, seed) * (height + 2 * STRIKE_MARGIN),
        strength: 0.6 + 0.4 * hash2(k, 4, seed), seed: 1 + Math.floor(hash2(k, 5, seed) * 2147483646),
      });
    }
    if (hash2(k, 6, seed) < distant / 60) flickers.push({ time: t, strength: 0.5 + 0.5 * hash2(k, 7, seed), bearing: hash2(k, 8, seed) * Math.PI * 2 });
  }
  return { strikes, flickers };
}

// ---- What the weather leaves on the land ----

/** An ordinary night frost: none above `from` °C, hardest at `hard`; by day it holds only this many degrees colder; how fast it forms and melts (a game hour). */
export const NIGHT_FROST = { from: 3, hard: -5, day: 6, form: 0.35, melt: 0.6 };
/** How fast the land wets in rain and dries after (a game hour; drying two fifths as fast under full cloud, faster in a heat wave): brush3d's demo's. */
export const SOAK = { wet: 1.5, dry: 0.33 };
/** How muddy the river runs in the heaviest rain and in a flood at its height (0–1), how fast it muddies (a game hour), and the hours it takes to clear by half. */
export const RIVER_MUD = { rain: 0.75, flood: 0.85, rise: 0.8, half: 8 };
/** How far back the frost, the wet and the river's mud are worked out from (game hours), and the step. */
const WINDOW = 36, STEP = 0.25;

export interface GroundLooks {
  /** An ordinary night's frost over the valley, 0–1 (brush3d's `frost`). */
  frost: number;
  /** How wet the land is, 0 dry to 1 soaked (the wettest ground; brush3d's `wet`). */
  wet: number;
  /** How muddy the river runs, 0 clear to 1 brown (brush3d's water `mud`). */
  riverMud: number;
}

/**
 * What the weather has left on the land at a time, from the weather over the last WINDOW hours (each from nothing at the
 * window's start, or the commission's): a function of the commission and the clock, so a game loaded mid-storm lies the same.
 */
export function groundLooksAt(sc: Scenario, time: number): GroundLooks {
  const { rise, set } = sc.climate.sun, F = NIGHT_FROST;
  let frost = 0, wet = 0, mud = 0;
  const start = Math.max(0, time - WINDOW * HOUR), steps = Math.ceil((time - start) / (STEP * HOUR));
  for (let k = steps - 1; k >= 0; k--) {
    const t = time - k * STEP * HOUR, dt = Math.min(STEP, (t - start) / HOUR);
    if (dt <= 0) continue;
    const w = weatherAt(sc, t), h = hourAt(t), warmth = warmthIn(sc, t), night = h < rise || h >= set;
    // Frost: on a clear, still, cold night it forms towards how cold it is; by day only a hard cold keeps it; rain or snow takes it.
    const cold = (c: number) => smooth((F.from - c) / (F.from - F.hard));
    const goal = w.precip > 0 ? 0 : night ? cold(warmth) * (1 - w.cloud) * (1 - 0.6 * windAt(sc, t)) : cold(warmth + F.day);
    frost += (goal - frost) * Math.min(1, (goal > frost ? F.form : F.melt) * dt);
    // The land wets in rain (not snow) and dries after, faster in the sun and the heat.
    const rain = w.sky === 'rain' ? w.precip : 0;
    wet = rain > 0 ? Math.min(1, wet + SOAK.wet * rain * dt) : Math.max(0, wet - SOAK.dry * (0.4 + 0.6 * (1 - w.cloud)) * (1 + w.heat) * dt);
    // The river: muddied by heavy rain and a flood, clearing slowly after.
    let goalMud = 0;
    for (const e of sc.events) if (EVENTS[e.kind].heavyRain) goalMud = Math.max(goalMud, RIVER_MUD.rain * intensityAt(e, t));
    const flood = floodUnder(sc, t);
    if (flood) goalMud = Math.max(goalMud, RIVER_MUD.flood * flood.intensity);
    mud = goalMud > mud ? mud + (goalMud - mud) * Math.min(1, RIVER_MUD.rise * dt) : mud * 0.5 ** (dt / RIVER_MUD.half);
  }
  return { frost: clamp01(frost), wet: clamp01(wet), riverMud: clamp01(mud) };
}
