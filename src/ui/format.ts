import { BUILDINGS, ITEMS, type BuildingId, type ItemId } from '../game/data.ts';
import { hourAt } from '../game/sim/clock.ts';

// Numbers and words as the interface writes them. Two clocks: play time (minutes of play, `13:00`, "5 min ago") for anything
// measured over minutes of play, and the time of day (`dusk 20:00`) for the in-game hours. Power in watts, never energy.

/** Seconds of play as m:ss (h:mm:ss past an hour). */
export function playTime(t: number) {
  const s = Math.max(0, Math.floor(t)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(sec).padStart(2, '0')}`;
}

/** An hour of day (0–24) as hh:mm, to the 10 minutes. */
export function clock(hour: number) {
  const m = Math.floor((((hour % 24) + 24) % 24) * 6 + 1e-6) * 10;
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
/** The time of day at a moment of play. */
export const clockAt = (time: number) => clock(hourAt(time));

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
