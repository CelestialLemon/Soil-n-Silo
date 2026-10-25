import { floodHolds } from './flood.ts';
import { networkOf } from './power.ts';
import { forecastAt, issueTimeOf, type Forecast } from './outlook.ts';
import { runtimeOf } from './runtime.ts';
import { shareOf } from './sim/energy.ts';
import type { Building, GameState } from './state.ts';

// The weather station (3.2): the building that gives the forecast. The forecast is a pure function of the scenario and the hour it
// was issued (outlook.ts), so the game keeps only that hour (`GameState.forecastIssued`). A station that has power renews it at
// every whole game hour; one without (short of power, cut off from the grid, under flood water) keeps the last and stops renewing,
// so the forecast ages: it is `forecastAt(scenario, oldIssued)` read later, and what has already happened is dropped from it
// as it is. Bulldoze the last station and the forecast is gone. No DOM.
//
// What reads it (the forecast panel, the projections): `hasStation`, `stationForecast`, and `stationFault`.

/** Why a station isn't working: its network is out of power, or gives it only part of the 3 W, no pylon reaches it, or water stands on it. */
export type StationFault = 'power' | 'short' | 'nolink' | 'flood';

/** The fault in words, as the inspector says why a forecast is out of date ("Out of date: no power"). */
export const FAULT_WORDS: Record<StationFault, string> = { power: 'no power', short: 'short of power', nolink: 'no power, no pylon in reach', flood: 'under water' };

const isStation = (b: Building) => b.type === 'station';

/** The weather stations the valley has. */
export const stationsOf = (s: GameState): Building[] => s.buildings.filter(isStation);

/** Whether the valley has a weather station (working or not). One is enough: a second adds nothing. */
export const hasStation = (s: GameState): boolean => s.buildings.some(isStation);

/**
 * Why a station isn't working now (null: it is): water on it, no pylon reaching it (the layout as it stands, so a pylon bulldozed while
 * paused counts at once), or the power its network gave it last step: none, or less than all of its 3 W. A station works only on full power.
 */
export function faultOf(s: GameState, b: Building): StationFault | null {
  if (floodHolds(s, b)) return 'flood';
  if (!networkOf(s, b)) return 'nolink';
  const share = shareOf(s, b);
  return share <= 0 ? 'power' : share < 1 ? 'short' : null;
}

const FAULT_ORDER: readonly StationFault[] = ['short', 'power', 'nolink', 'flood'];

/**
 * Why the valley has no working station: null while one works (or there is none), else the fault of the station nearest to
 * working (short of power, before no power, before no pylon in reach, before water).
 */
export function stationFault(s: GameState): StationFault | null {
  let best: StationFault | null = null;
  for (const b of s.buildings) {
    if (!isStation(b)) continue;
    const f = faultOf(s, b);
    if (!f) return null;
    if (best === null || FAULT_ORDER.indexOf(f) < FAULT_ORDER.indexOf(best)) best = f;
  }
  return best;
}

/** Whether a station works now: there is one and it has power and is dry. */
export const stationWorking = (s: GameState): boolean => hasStation(s) && stationFault(s) === null;

/**
 * Renews the forecast at the whole hour (once per hour, never earlier than the one in hand), if a station works. Run each step,
 * after the buildings' statuses are final.
 */
export function renewForecast(s: GameState) {
  if (!hasStation(s)) return;
  const hour = issueTimeOf(s.time);
  if (s.forecastIssued !== null && s.forecastIssued >= hour) return;
  if (stationFault(s) === null) s.forecastIssued = hour;
}

/**
 * Renews the forecast at this exact moment, if a station works: the sandbox changes the weather by hand (`startEvent`,
 * `clearWeather`), and the forecast is then worked out again at once, so an event begun by hand is under way, not "coming within
 * the hour".
 */
export function renewNow(s: GameState) {
  if (stationWorking(s)) s.forecastIssued = s.time;
}

/** The last station was bulldozed (or none was left): the forecast is gone. Call after a building is removed. */
export function dropForecastIfNone(s: GameState) {
  if (!hasStation(s)) s.forecastIssued = null;
}

/** What a station tells now. */
export interface StationForecast {
  forecast: Forecast;
  /** When it was issued ("as of day 4, 14:00"), in seconds of play. */
  issued: number;
  /** Out of date: no working station is renewing it (none has power, or it is older than the hour in progress). */
  stale: boolean;
  /** Why no station is renewing it (null while one is). */
  reason: StationFault | null;
}

/**
 * The forecast the valley has: null where there is none (no station, or none has had power yet). Out of date when no station works now
 * (the moment power is lost, not an hour later) or the one in hand is older than the hour in progress; it is then what the last forecast
 * said, with what is past dropped by the forecast itself.
 */
export function stationForecast(s: GameState): StationForecast | null {
  const issued = s.forecastIssued;
  if (issued === null || !hasStation(s)) return null;
  const fault = stationFault(s), stale = fault !== null || issued < issueTimeOf(s.time);
  return { forecast: forecastFor(s, issued), issued, stale, reason: fault };
}

/** The forecast issued at a time, kept for the scenario's events as they stand (the sandbox swaps them) so a panel can read it every frame. */
function forecastFor(s: GameState, issued: number): Forecast {
  const rt = runtimeOf(s), events = s.scenario.events, c = rt.station;
  if (c && c.issued === issued && c.events === events && c.n === events.length) return c.forecast;
  const forecast = forecastAt(s.scenario, issued);
  rt.station = { issued, events, n: events.length, forecast };
  return forecast;
}
