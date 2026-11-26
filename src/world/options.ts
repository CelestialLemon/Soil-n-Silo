// The world's URL options: how a PR preview (or the developer) opens the valley.
//   seed=1042 (the valley), season=spring|summer|autumn|winter, hour=10.5 (or dawn, noon, golden, sunset, night),
//   weather=clear|scattered|overcast|soft-rain|storm|mist|fog|... (brush3d's WEATHER_PRESETS, or a spell: gale, frost: locks the weather; left out,
//   the valley lives in its own continuous weather), climate=mild|wet|dry|hot|gales|stormy|hard|highRiver (the season's
//   character), wseed=12345 (the weather's seed: the same week of weather again), quality=high|medium|low,
//   yaw=orbit|snap (the camera's turn, for a link that wants one; otherwise the player's own setting),
//   campaign=<id> (a campaign valley, src/game/campaign.ts), terrain=<style> (the game's TERRAIN_STYLES),
//   difficulty=<difficulty> (the game's DIFFICULTIES) and sandbox=1|true (the sandbox: no order to fill).
// The camera's turn is a player setting (decided 2026-11-25, docs/ROADMAP.md): a free orbit by default, or snapped 90°
// views for those who prefer them, remembered in the browser (CAMERA_YAW_KEY).
import { QUALITY, type QualityName, WEATHER_PRESETS, type WeatherName } from '../../brush3d/src/index.ts';
import {
  campaignById, type ClimateCharacter, type Difficulty, isClimate, isDifficulty, isTerrainStyle, isWeatherSpell, SEASONS, type Season,
  type TerrainStyle, type WeatherSpell,
} from '../game/index.ts';

/** How the camera turns: a free smooth orbit, or four cardinal views 90° apart. */
export type YawMode = 'orbit' | 'snap';

export const YAW_MODES: readonly YawMode[] = ['orbit', 'snap'];

/** brush3d's graphics presets, best first (the settings panel's choices). */
export const QUALITY_NAMES: readonly QualityName[] = ['high', 'medium', 'low'];

/** Where the browser keeps the player's camera setting. */
export const CAMERA_YAW_KEY = 'soil-n-silo:camera-yaw';

export interface WorldOptions {
  yaw: YawMode;
  seed: number;
  season: Season;
  /** The clock hour, 0..24. */
  hour: number;
  /** A locked weather (`?weather=`: a brush3d preset or one of the game's spells); left out, the living weather runs. */
  weather?: WeatherName | WeatherSpell;
  /** The season's character (`?climate=`); left out, the valley's own. */
  climate?: ClimateCharacter;
  /** The weather's seed (`?wseed=`); left out, a fresh one each play. */
  weatherSeed?: number;
  /** The graphics preset (brush3d's QUALITY); left out, high. */
  quality?: QualityName;
  /** A campaign valley to open (`?campaign=`, checked against the game's campaign); left out, none. */
  campaign?: string;
  /** The land's style for a generated valley (`?terrain=`); left out, the game's own. */
  terrain?: TerrainStyle;
  /** How hard a generated valley's order is (`?difficulty=`); left out, the game's own. */
  difficulty?: Difficulty;
  /** The sandbox (`?sandbox=1` or `true`): building freely, no order to fill; left out, false. */
  sandbox?: boolean;
}

export const DEFAULT_OPTIONS: Readonly<WorldOptions> = { yaw: 'orbit', seed: 1042, season: 'spring', hour: 10.5 };

/** The camera setting the player last chose in this browser, if any (none where storage is blocked). */
export function storedYawMode(): YawMode | undefined {
  try {
    const v = typeof localStorage === 'undefined' ? null : localStorage.getItem(CAMERA_YAW_KEY);
    return v !== null && (YAW_MODES as readonly string[]).includes(v) ? (v as YawMode) : undefined;
  } catch { return undefined; }
}

/** Remembers the player's camera setting (quietly does nothing where storage is blocked). */
export function storeYawMode(mode: YawMode): void {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(CAMERA_YAW_KEY, mode); } catch { /* private window or blocked storage */ }
}

/** Named hours a URL may use. */
const HOURS: Record<string, number> = { dawn: 7, morning: 9, noon: 12.5, afternoon: 15, golden: 17.5, sunset: 19, dusk: 20, night: 22.5 };

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

/**
 * The world's options from a URL's query (the page's by default); anything missing or unknown takes its default. The
 * camera's turn comes from the URL if it names one, else the player's stored setting, else a free orbit.
 */
export function readUrlOptions(search: string = typeof location === 'undefined' ? '' : location.search, stored: YawMode | undefined = storedYawMode()): WorldOptions {
  const p = new URLSearchParams(search), d = DEFAULT_OPTIONS;
  const seedText = p.get('seed'), seedNum = seedText === null ? NaN : Number(seedText);
  const hourText = p.get('hour');
  let hour = d.hour;
  if (hourText !== null) {
    const named = HOURS[hourText.toLowerCase()], n = Number(hourText);
    if (named !== undefined) hour = named;
    else if (Number.isFinite(n)) hour = ((n % 24) + 24) % 24;
  }
  const weatherText = p.get('weather'), qualityText = p.get('quality'), climateText = p.get('climate'), wseedText = p.get('wseed');
  const out: WorldOptions = {
    yaw: pick(p.get('yaw'), YAW_MODES, stored ?? d.yaw),
    seed: Number.isFinite(seedNum) ? Math.trunc(seedNum) >>> 0 : d.seed,
    season: pick(p.get('season'), SEASONS, d.season),
    hour,
  };
  if (weatherText !== null && (Object.hasOwn(WEATHER_PRESETS, weatherText) || isWeatherSpell(weatherText))) out.weather = weatherText as WeatherName | WeatherSpell;
  if (climateText !== null && isClimate(climateText)) out.climate = climateText;
  const wseed = wseedText === null || wseedText.trim() === '' ? NaN : Number(wseedText);
  if (Number.isInteger(wseed)) out.weatherSeed = wseed >>> 0;
  if (qualityText !== null && Object.hasOwn(QUALITY, qualityText)) out.quality = qualityText as QualityName;
  const campaignText = p.get('campaign'), terrainText = p.get('terrain'), difficultyText = p.get('difficulty'), sandboxText = p.get('sandbox');
  if (campaignText !== null && campaignById(campaignText)) out.campaign = campaignText;
  if (terrainText !== null && isTerrainStyle(terrainText)) out.terrain = terrainText;
  if (difficultyText !== null && isDifficulty(difficultyText)) out.difficulty = difficultyText;
  if (sandboxText !== null && ['1', 'true'].includes(sandboxText.toLowerCase())) out.sandbox = true;
  return out;
}

/**
 * Sets one URL option in place (no reload, no new history entry), so a preview link carries the choice. With `onlyIfSet`,
 * only an option the URL already names is rewritten (so it never contradicts a setting the player just changed).
 */
export function writeUrlParam(key: string, value: string, onlyIfSet = false): void {
  if (typeof location === 'undefined' || typeof history === 'undefined') return;
  const url = new URL(location.href);
  if (url.searchParams.get(key) === value || (onlyIfSet && !url.searchParams.has(key))) return;
  url.searchParams.set(key, value);
  history.replaceState(history.state, '', url);
}

/** Takes a URL option away in place (no reload, no new history entry): a lock lifted. */
export function clearUrlParam(key: string): void {
  if (typeof location === 'undefined' || typeof history === 'undefined') return;
  const url = new URL(location.href);
  if (!url.searchParams.has(key)) return;
  url.searchParams.delete(key);
  history.replaceState(history.state, '', url);
}
