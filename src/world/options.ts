// The world's URL options: how a PR preview (or the developer) opens the valley, and the two Milestone 1 look choices to flip
// between on the preview (docs/ROADMAP.md, "Decisions & Preview Choices"): `?yaw=snap|orbit` and `?wiring=pylons|wireless`.
//   seed=1042 (the valley), season=spring|summer|autumn|winter, hour=10.5 (or dawn, noon, golden, sunset, night),
//   weather=clear|scattered|overcast|soft-rain|storm|mist|fog|... (brush3d's WEATHER_PRESETS), quality=high|medium|low
import { QUALITY, type QualityName, WEATHER_PRESETS, type WeatherName } from '../../brush3d/src/index.ts';
import { SEASONS, type Season } from '../game/index.ts';

/** How the camera turns: four cardinal views 90° apart, or a free smooth orbit. */
export type YawMode = 'snap' | 'orbit';
/** How power reaches buildings: slim wooden pylons carrying wires, or a soft wireless radius round power buildings and relays. */
export type WiringMode = 'pylons' | 'wireless';

export const YAW_MODES: readonly YawMode[] = ['snap', 'orbit'];
export const WIRING_MODES: readonly WiringMode[] = ['pylons', 'wireless'];

export interface WorldOptions {
  yaw: YawMode;
  wiring: WiringMode;
  seed: number;
  season: Season;
  /** The clock hour, 0..24. */
  hour: number;
  weather: WeatherName;
  /** The graphics preset (brush3d's QUALITY); left out, high. */
  quality?: QualityName;
}

export const DEFAULT_OPTIONS: Readonly<WorldOptions> = { yaw: 'snap', wiring: 'pylons', seed: 1042, season: 'spring', hour: 10.5, weather: 'clear' };

/** Named hours a URL may use. */
const HOURS: Record<string, number> = { dawn: 7, morning: 9, noon: 12.5, afternoon: 15, golden: 17.5, sunset: 19, dusk: 20, night: 22.5 };

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

/** The world's options from a URL's query (the page's by default); anything missing or unknown takes its default. */
export function readUrlOptions(search: string = typeof location === 'undefined' ? '' : location.search): WorldOptions {
  const p = new URLSearchParams(search), d = DEFAULT_OPTIONS;
  const seedText = p.get('seed'), seedNum = seedText === null ? NaN : Number(seedText);
  const hourText = p.get('hour');
  let hour = d.hour;
  if (hourText !== null) {
    const named = HOURS[hourText.toLowerCase()], n = Number(hourText);
    if (named !== undefined) hour = named;
    else if (Number.isFinite(n)) hour = ((n % 24) + 24) % 24;
  }
  const weatherText = p.get('weather'), qualityText = p.get('quality');
  const out: WorldOptions = {
    yaw: pick(p.get('yaw'), YAW_MODES, d.yaw),
    wiring: pick(p.get('wiring'), WIRING_MODES, d.wiring),
    seed: Number.isFinite(seedNum) ? Math.trunc(seedNum) >>> 0 : d.seed,
    season: pick(p.get('season'), SEASONS, d.season),
    hour,
    weather: weatherText !== null && Object.hasOwn(WEATHER_PRESETS, weatherText) ? (weatherText as WeatherName) : d.weather,
  };
  if (qualityText !== null && Object.hasOwn(QUALITY, qualityText)) out.quality = qualityText as QualityName;
  return out;
}

/** Sets one URL option in place (no reload, no new history entry), so a preview link carries the choice. */
export function writeUrlParam(key: string, value: string): void {
  if (typeof location === 'undefined' || typeof history === 'undefined') return;
  const url = new URL(location.href);
  if (url.searchParams.get(key) === value) return;
  url.searchParams.set(key, value);
  history.replaceState(history.state, '', url);
}
