// The valley's clock and its sun: what the crops and the solar canopies read. The game's pace matches the world's sky
// (src/world/sky.ts): at 1×, a game hour lasts 30 real seconds.

/** Real seconds a game hour lasts at 1× speed. */
export const SECONDS_PER_GAME_HOUR = 30;
/** Sunrise and sunset, hours. */
export const SUNRISE = 6, SUNSET = 19;

/** How high the sun stands, 0..1: 0 from sunset to sunrise, rising to 1 at midday. */
export function sunFactor(hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  if (h <= SUNRISE || h >= SUNSET) return 0;
  return Math.sin((Math.PI * (h - SUNRISE)) / (SUNSET - SUNRISE));
}

/** Dusk to dawn: when the farmhouse lights its lamps. */
export const isNight = (hour: number): boolean => { const h = ((hour % 24) + 24) % 24; return h < SUNRISE || h >= SUNSET; };

/** "Day 2 at 03:20". */
export function formatClock(day: number, hour: number): string {
  const h = ((hour % 24) + 24) % 24, hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return `Day ${day} at ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
