import { eventName, pushesAt } from './events.ts';
import { ANIMALS, CROPS, DAY_SECONDS, FIELD, GREENHOUSE, type CropDef } from './data.ts';
import { noise1 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import type { Climate } from './seasons.ts';
import type { FieldBuilding, GameState } from './state.ts';
import { keepingBeesIn } from './wind.ts';
import { hourAt } from './sim/clock.ts';
import { precipAt } from './sim/weather.ts';

// Warmth: the valley's temperature in °C, one number for the whole valley, and what it does to a crop.

/** Below this the valley is in frost. */
export const FROST = 0;

/** The hour of the afternoon it is warmest. It is coldest an hour before the sun rises. */
const WARMEST = 15;

/** A season's warmth at an hour of the day, before the seed's drift: the day's curve from the cold before dawn to the afternoon's warmth. */
export function warmthByHour(c: Pick<Climate, 'warmth' | 'sun'>, hour: number): number {
  const w = c.warmth, coldest = c.sun.rise - 1;
  const up = WARMEST - coldest, u = (hour - coldest + 24) % 24;
  const frac = u < up ? (1 - Math.cos(Math.PI * u / up)) / 2 : (1 + Math.cos(Math.PI * (u - up) / (24 - up))) / 2;
  return w.low + (w.high - w.low) * frac;
}

/**
 * The warmth the season and the seed give at a time, before anything nudges it: a day's curve from the cold before dawn to the
 * afternoon's warmth between the season's low and high, and a smooth seeded drift of the whole day either way.
 */
export function warmthAt(sc: Scenario, time: number): number {
  const drift = (noise1(time / DAY_SECONDS, sc.seed + 91) - 0.5) * 2 * sc.climate.warmth.drift;
  return warmthByHour(sc.climate, hourAt(time)) + drift;
}

/**
 * What nudges the warmth at a time, in °C: each entry adds its part. This is the one place conditions (rain, 1.3) and weather
 * events (a heat wave, a cold snap, phase 2) add theirs, by pushing a function here.
 */
export const WARMTH_NUDGES: ((sc: Scenario, time: number) => number)[] = [
  // Rain or snow cools the valley, by up to RAIN_COOLING at its heaviest.
  (sc, time) => -RAIN_COOLING * precipAt(sc, time),
  // A weather event lifts or drops the whole curve (a heat wave, a cold snap), its `warmth` push; a warm spell lifts a cold day up to a mild one.
  (sc, time) => eventWarmth(sc, time, warmthAt(sc, time)),
];

/** What the events under way add to a day's warmth `base` at a time, in °C: their `warmth` push, and a warm spell's lift of a colder day up to a mild one. */
export function eventWarmth(sc: Pick<Scenario, 'events' | 'climate'>, time: number, base: number): number {
  const p = pushesAt(sc, time);
  if (!p.mild) return p.warmth;
  const mild = warmthByHour({ warmth: MILD_DAY, sun: sc.climate.sun }, hourAt(time));
  return p.warmth + p.mild * Math.max(0, mild - base);
}

/** The day a warm spell lifts a colder one to: a mild day's coldest and warmest, in °C. Crops grow at nearly full speed in it and the bees fly. */
export const MILD_DAY = { low: 12, high: 24, drift: 0 };

/** The most, in °C, that precipitation cools the valley. */
export const RAIN_COOLING = 2;
const warmthNudge = (sc: Scenario, time: number) => WARMTH_NUDGES.reduce((sum, f) => sum + f(sc, time), 0);

/** The valley's warmth at a time in a scenario, in °C: the weather alone (the forecast reads it ahead). */
export const warmthIn = (sc: Scenario, time: number): number => warmthAt(sc, time) + warmthNudge(sc, time);

/** The valley's warmth at a time (default now), in °C. */
export const warmthOf = (s: GameState, time = s.time): number => warmthIn(s.scenario, time);

/** How a crop's growth fares in a warmth, 0–1: full inside its comfortable range, slower smoothly outside it, none for a tender crop below FIELD.tenderStops. */
export function warmthPace(crop: CropDef, w: number): number {
  if (crop.tender && w < FIELD.tenderStops) return 0;
  const d = w < crop.comfort.low ? crop.comfort.low - w : w > crop.comfort.high ? w - crop.comfort.high : 0;
  return 1 / (1 + (d / FIELD.warmthWidth) ** 2);
}

/** The warmth a greenhouse growing a crop holds with all the power it needs: the lowest the crop grows at full speed in, or the outside when warmer, and vented down to the crop's highest (or FIELD.heat, where an unwatered crop would slow) when hotter. A new greenhouse starts here, and the forecast reads it (4.3). */
export const insideWarmth = (crop: CropDef, outside: number) => Math.min(Math.max(outside, crop.comfort.low), ventAt(crop));

/** The warmth a greenhouse vents down to, for free. */
const ventAt = (crop: CropDef) => Math.min(crop.comfort.high, FIELD.heat);

/** A greenhouse's warmth now, in °C: what it has cooled or warmed to (a new one, not yet stepped, the warmth full power would hold). */
export const insideNow = (s: GameState, g: FieldBuilding) => g.inside ?? insideWarmth(CROPS[g.crop], warmthOf(s));

/** The watts a greenhouse growing a crop needs to hold its warmth with the outside at a warmth: GREENHOUSE.loss for each °C the outside is below the crop's comfortable low, none when warmer. */
export const heatNeed = (crop: CropDef, outside: number) => GREENHOUSE.loss * Math.max(0, crop.comfort.low - outside);

/**
 * A greenhouse's warmth after `seconds` of play, from `inside` now, with the outside's warmth and the watts it is given held for the
 * step: it relaxes exactly toward what that power would hold (the outside plus the watts over the loss) with a time constant of
 * capacity / loss game hours (5), and is vented down to the crop's highest comfortable warmth.
 */
export function insideAfter(crop: CropDef, inside: number, outside: number, watts: number, seconds: number): number {
  const hours = seconds / (DAY_SECONDS / 24), held = outside + watts / GREENHOUSE.loss;
  return Math.min(ventAt(crop), held + (inside - held) * Math.exp(-hours * GREENHOUSE.loss / GREENHOUSE.capacity));
}

/** A greenhouse's warmth as a fact: "Inside 18°C, outside −3°C, heating 13 W" (its warmth, the outside's and the watts it is heated with, if given). */
export function insideFact(inside: number, outside: number, watts?: number): string {
  const deg = (n: number) => { const r = Math.round(n); return `${r < 0 ? '−' : ''}${Math.abs(r)}°C`; };
  return `Inside ${deg(inside)}, outside ${deg(outside)}${watts === undefined ? '' : `, heating ${Math.round(watts)} W`}`;
}

/** Whether frost takes the growing crop in an open field. */
export const frostKills = (crop: CropDef, w: number) => crop.tender && w < FROST;

/** The growth multiplier of an unwatered field in a warmth: FIELD.dry, falling to FIELD.heatDry as the heat passes FIELD.heat. */
export function dryPace(w: number): number {
  const heat = Math.max(0, Math.min(1, (w - FIELD.heat) / (FIELD.heatFull - FIELD.heat)));
  return FIELD.dry + (FIELD.heatDry - FIELD.dry) * heat;
}

/** Where a warmth falls for a crop, as a fact: "Tomato, 12°C: cool for it, grows at about half speed". */
export function warmthFact(crop: CropDef, w: number): { text: string; tone?: 'bad' | 'good' } {
  const head = `${crop.name}, ${Math.round(w)}°C`;
  if (frostKills(crop, w)) return { text: `${head}: frost, a tender crop is lost in an open field`, tone: 'bad' };
  const f = warmthPace(crop, w);
  if (w >= crop.comfort.low && w <= crop.comfort.high) return { text: `${head}: comfortable, grows at full speed`, tone: 'good' };
  const word = w < crop.comfort.low ? 'cool' : 'warm';
  const how = f === 0 ? `it stops growing below ${FIELD.tenderStops}°C` : f >= 0.97 ? 'grows at nearly full speed' : `grows at about ${Math.round(f * 20) * 5}% speed`;
  return { text: `${head}: ${word} for it, ${how}`, tone: f < 0.6 ? 'bad' : undefined };
}

/** How fast the hens lay in a warmth, 0–1: the season's rate, slowed smoothly above ANIMALS.henHeat, less so where trees shade the coop (`shade`, in °C). */
export function henPace(sc: Scenario, w: number, shade = 0): number {
  const d = Math.max(0, w - shade - ANIMALS.henHeat);
  return sc.climate.hens.lay / (1 + (d / ANIMALS.henHeatWidth) ** 2);
}

/** Whether the bees leave the hive in a warmth: not below ANIMALS.beesFly. */
export const beesFly = (w: number) => w >= ANIMALS.beesFly;

/** Whether the bees fly now: warm enough, and the weather (a gale, a storm) does not keep them in. */
export const beesOut = (s: GameState, time = s.time) => beesFly(warmthOf(s, time)) && !keepingBeesIn(s.scenario, time);

/** The bees now as a fact, with what keeps them in: the cold, or the weather ("the gale keeps them in"). */
export function beesNow(s: GameState): { text: string; tone?: 'bad' | 'good' } {
  const a = keepingBeesIn(s.scenario, s.time);
  return beesFact(warmthOf(s), a ? `the ${eventName(a.event.kind, a.event.strength).toLowerCase()} keeps them in` : undefined);
}

/** The coop's laying as a fact (`slow`: what a weather event multiplies the hens' pace by, a storm's or a cold snap's): "Hens: laying at half speed, 3°C". */
export function henFact(sc: Scenario, w: number, shade = 0, slow = 1): { text: string; tone?: 'bad' | 'good' } {
  const f = henPace(sc, w, shade) * slow, head = `Hens, ${Math.round(w)}°C`;
  if (f >= 0.97) return { text: `${head}: laying at full speed`, tone: 'good' };
  const hot = w > ANIMALS.henHeat, shaded = hot && shade > 0 ? `, the trees shade them ${shade}°C` : '';
  return { text: `${head}: ${hot ? 'too warm' : slow < 1 ? 'the weather slows them' : 'cool season'}, laying at about ${Math.round(f * 20) * 5}% speed${shaded}`, tone: f < 0.6 ? 'bad' : undefined };
}

/** The trees by a coop as a fact, for its card: "2 trees within 2 tiles: the hens feel 4°C less of a heat wave". */
export function shadeFact(trees: number): string {
  if (!trees) return `no trees within ${ANIMALS.shadeReach} tiles to shade the hens in a heat wave`;
  return `within ${ANIMALS.shadeReach} tiles: the hens feel ${trees * ANIMALS.shadePerTree}°C less of a heat wave${trees * ANIMALS.shadePerTree >= ANIMALS.shadeMost ? ' (the most trees can take off)' : ''}`;
}

/** The bees as a fact: "Bees: staying in, 7°C"; `weather` is what keeps them in apart from the cold ("the gale keeps them in"). */
export function beesFact(w: number, weather?: string): { text: string; tone?: 'bad' | 'good' } {
  if (!beesFly(w)) return { text: `Bees: staying in, ${Math.round(w)}°C (below ${ANIMALS.beesFly}°C)`, tone: 'bad' };
  return weather ? { text: `Bees: staying in, ${weather}`, tone: 'bad' } : { text: `Bees: flying, ${Math.round(w)}°C`, tone: 'good' };
}
