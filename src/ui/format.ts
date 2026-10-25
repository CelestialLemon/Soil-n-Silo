import { BUILDINGS, ITEMS, type BuildingId, type ItemId } from '../game/data.ts';
import type { Tonight } from '../game/forecast.ts';
import type { Range } from '../game/outlook.ts';
import { HOUR_SECONDS } from '../game/powerlog.ts';
import { dayAt, hourAt } from '../game/sim/clock.ts';

// Numbers and words as the interface writes them. Two clocks: play time (minutes of play, `13:00`, "5 min ago") for anything
// measured over minutes of play, and the time of day (`dusk 20:00`) for the in-game hours. Power in watts, never energy.

/** Seconds of play as m:ss (h:mm:ss past an hour). */
export function playTime(t: number) {
  const s = Math.max(0, Math.floor(t)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(sec).padStart(2, '0')}`;
}

/** A length of play, roughly, in words: "a minute", "1½ minutes", "3 minutes" (to the half minute). */
export function aboutTime(seconds: number) {
  const m = Math.round(Math.max(0, seconds) / 30) / 2, whole = Math.floor(m), half = m - whole > 0;
  return m === 0.5 ? 'half a minute' : m === 1 ? 'a minute' : `${whole}${half ? '½' : ''} minutes`;
}

/** An hour of day (0–24) as hh:mm, to the 10 minutes. */
export function clock(hour: number) {
  const m = Math.floor((((hour % 24) + 24) % 24) * 6 + 1e-6) * 10;
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
/** The time of day at a moment of play. */
export const clockAt = (time: number) => clock(hourAt(time));

/** A moment of play as the day and the time of day: "day 4, 14:00". */
export const dayClock = (time: number) => `day ${dayAt(time)}, ${clockAt(time)}`;

/** A number with thousands separators. */
export const num = (n: number) => Math.round(n).toLocaleString('en-GB');
/** A small number to one decimal place (whole from 10 up), without a trailing .0. */
export const dec = (n: number) => (Math.abs(n) >= 10 ? String(Math.round(n)) : n.toFixed(1).replace(/\.0$/, ''));
export const watts = (w: number) => `${dec(w)} W`;
export const pct = (k: number) => `${Math.round(k * 100)}%`;

export const itemName = (i: ItemId) => ITEMS[i].name.toLowerCase();
/** A building's name in a sentence, lower case. */
export const lcBuilding = (t: BuildingId) => BUILDINGS[t].name.toLowerCase();

/** "1 truck", "3 trucks". */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The good named by a status's need ("egg", "feed (beans, bran or seed cake)"), if it is one. */
export const itemByName = (need: string | undefined): ItemId | null =>
  (need ? (Object.keys(ITEMS) as ItemId[]).find((i) => ITEMS[i].name.toLowerCase() === need) ?? null : null);

/** A route or network colour as CSS. */
export const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

/**
 * When the batteries run dry tonight, as the cards say it: one time for one run, a range when the forecast leaves room, "from" a time
 * when some of the nights it allows last (they may run dry, or not).
 */
export function dryWords(t: Tonight): { when: string; what: string; bad: boolean } {
  const d = t.dry;
  if (!d) return { when: 'held', what: t.runs > 1 ? 'they last the night' : 'they last the night', bad: false };
  if (d.always && d.to - d.from < HOUR_SECONDS / 3) return { when: clockAt(d.from), what: 'batteries run dry', bad: true };
  if (d.always) return { when: `${clockAt(d.from)}–${clockAt(d.to)}`, what: 'batteries run dry in this time', bad: true };
  return { when: `from ${clockAt(d.from)}`, what: 'they may run dry, or last the night', bad: true };
}

/** A range of numbers, as one when it is one ("12 W", "8–14 W"). */
export const spanOf = (r: Range, f: (n: number) => string, join = '–') => (f(r.lo) === f(r.hi) ? f(r.lo) : `${f(r.lo)}${join}${f(r.hi)}`);

/** The dry time in a sentence about tonight: "run dry at 02:40", "run dry between 01:40 and 03:10", "may run dry from 02:10". */
export function dryLine(t: Tonight): string {
  const d = t.dry;
  if (!d) return 'last the night';
  if (d.always) return d.to - d.from < HOUR_SECONDS / 3 ? `run dry at ${clockAt(d.from)}` : `run dry between ${clockAt(d.from)} and ${clockAt(d.to)}`;
  return `may run dry from ${clockAt(d.from)}`;
}
