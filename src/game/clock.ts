// The day clock (design doc, "Time and day structure"). A day runs from 6 AM to the 2 AM cutoff in about 13 real minutes,
// and stops while a menu is open. Hours count from the midnight that starts the day, so the cutoff is hour 26.
// Pure game state: no DOM and no renderer, so the tests run it in Node.

export const DAY_START = 6;
export const DAY_CUTOFF = 26;
/** Real seconds per in-game day (6 AM to 2 AM). Tune in playtests. */
export const DAY_SECONDS = 13 * 60;
export const HOURS_PER_SECOND = (DAY_CUTOFF - DAY_START) / DAY_SECONDS;

export interface Clock {
  /** 1-based day of the season. */
  day: number;
  /** Hours since the midnight that started this day: DAY_START to DAY_CUTOFF. */
  hour: number;
  paused: boolean;
}

export const newClock = (): Clock => ({ day: 1, hour: DAY_START, paused: false });

/** Runs the clock for `seconds` of real time. Returns true when it reached the 2 AM cutoff, where it stops. */
export function tick(clock: Clock, seconds: number): boolean {
  if (clock.paused) return false;
  clock.hour = Math.min(DAY_CUTOFF, clock.hour + seconds * HOURS_PER_SECOND);
  return clock.hour >= DAY_CUTOFF;
}

/** Starts the next day at 6 AM (after bed, or after the cutoff sent the player home). */
export function nextDay(clock: Clock) {
  clock.day += 1;
  clock.hour = DAY_START;
}

/** The time of day on a 24-hour clock, for the renderer's look and the HUD. */
export const hourOfDay = (clock: Clock) => clock.hour % 24;
