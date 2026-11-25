// The valley's clock and its sun: what the crops, the solar canopies and the lamps read. The game's pace matches the
// world's sky (src/world/sky.ts): at 1×, a game hour lasts 30 real seconds. The sun keeps the season's hours, from the one
// table the sky is drawn by too (brush3d's SEASON_SUN): a winter canopy goes dark at four, a summer one shines till nine.
import { SEASON_SUN } from '../../brush3d/src/shared.ts';
import type { Season } from './state.ts';

/** Real seconds a game hour lasts at 1× speed. */
export const SECONDS_PER_GAME_HOUR = 30;

/** When the sun rises and sets in a season, hours. */
export const sunHours = (season: Season): { sunrise: number; sunset: number } => SEASON_SUN[season];

const hourOfDay = (hour: number) => ((hour % 24) + 24) % 24;
const quarter = (h: number) => Math.round(h * 4) / 4;

/**
 * The day's moments in a season, to the quarter hour, for the sky strip's quick jumps: dawn at sunrise, noon midway to
 * sunset, golden hour the last eighth of the day (about an hour before a winter sunset at four, two before a summer one at
 * nine) and dusk three quarters of an hour after sunset.
 */
export function seasonHours(season: Season): { dawn: number; noon: number; golden: number; dusk: number } {
  const { sunrise, sunset } = sunHours(season), day = sunset - sunrise;
  return { dawn: sunrise, noon: quarter(sunrise + day / 2), golden: quarter(sunset - day / 8), dusk: quarter(sunset + 0.75) };
}

/** How high the sun stands in a season, 0..1: 0 from sunset to sunrise, rising to 1 at midday. */
export function sunFactor(hour: number, season: Season): number {
  const h = hourOfDay(hour), { sunrise, sunset } = sunHours(season);
  if (h <= sunrise || h >= sunset) return 0;
  return Math.sin((Math.PI * (h - sunrise)) / (sunset - sunrise));
}

/** Dusk to dawn in a season: when the farmhouse lights its lamps. */
export function isNight(hour: number, season: Season): boolean {
  const h = hourOfDay(hour), { sunrise, sunset } = sunHours(season);
  return h < sunrise || h >= sunset;
}

/** "Day 2 at 03:20". */
export function formatClock(day: number, hour: number): string {
  const h = hourOfDay(hour), hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return `Day ${day} at ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
