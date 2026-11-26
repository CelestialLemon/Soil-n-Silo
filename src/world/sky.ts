// The sky: the clock (paused, or one, two or four times the game's pace: at 1×, a game hour every 30 seconds), the
// season's light (brush3d's season with the valley's climate character, its sunrise and sunset from the game's table) and
// the living weather (state.sim.weather, the game's continuous weather: its cloud, rain, snow, storm, heat and haze), its
// clouds drifting with the wind aloft. The weather goes to brush3d a few times a second, as the game moves it on; brush3d
// eases between and carries the clouds on.
//
// A strong storm (the game's `lightning`) throws a strike now and then while the clock runs: one every 14 to 28 real
// seconds, from a seeded sequence, never while paused. brush3d keeps every flash within its flash limits whatever is asked
// (lightning.ts, FLASH_LIMIT); the spacing here keeps well inside them, so a storm never strobes. With the player's
// flashes off (flashesEnabled, the settings panel), no strike is thrown at all: no bolt, no flash, no glow.
import { type BrushRenderer, type Character, cloudDriftSpeed, type CloudDrift, SEASON_SUN, type Weather } from '../../brush3d/src/index.ts';
import { type ClimateCharacter, makeRng, type Rng, type Season, type WeatherState } from '../game/index.ts';

/** How fast the clock runs: paused, or 1×, 2× or 4×. */
export type Speed = 0 | 1 | 2 | 4;
/** Real seconds a game hour lasts at 1×. */
export const SECONDS_PER_HOUR = 30;
/** How often (Hz) the weather is sent. */
const WEATHER_HZ = 4;
/** The real seconds between storm strikes: a random spell in this range each time. */
const STRIKE_GAP = { min: 14, max: 28 };
/** How far from the middle of the view a strike lands, m (so its bolt is mostly in sight). */
const STRIKE_REACH = 38;
/** The fog's colour (brush3d's own fog preset's). */
const HAZE_COLOR = 0xcfd6d8;

/** brush3d's weather for the game's living weather: drawn as the game has it. */
export function drawnWeather(w: WeatherState): Weather {
  return {
    cloud: w.cloudCover, rain: w.rain, snow: w.snow, storm: w.storm, heat: w.heat,
    sunUnder: w.storm > 0.2 ? 0.35 : w.cloudCover > 0.2 && w.cloudCover < 0.85 ? 0.45 : 0,
    haze: w.haze > 0.02 ? { amount: w.haze, color: HAZE_COLOR, top: 4.5 } : null,
  };
}

export class Sky {
  hour: number;
  speed: Speed = 1;
  /** Whether the storm throws its strikes (the player's flash setting); off, a storm only rains and blows. */
  flashesEnabled = true;
  private readonly cloudSeed: number;
  private drift: Required<CloudDrift> = { x: 0, z: 0, vx: 0, vz: 0 };
  private since = 0;
  private readonly strikes: Rng;
  /** Real seconds until the storm's next strike (counted only while one is on and the clock runs). */
  private nextStrike: number;

  constructor(hour: number, seed: number) {
    this.hour = hour; this.cloudSeed = Math.abs(Math.trunc(seed)) % 1000;
    this.strikes = makeRng(((seed >>> 0) ^ 0x5717ce) >>> 0);
    this.nextStrike = this.gap();
  }

  /** The season's light and its character; set before the season's scene is built (its trees and grass take it). */
  static season(r: BrushRenderer, season: Season, character: ClimateCharacter) {
    // The game's climate characters are brush3d's CHARACTERS, word for word.
    r.setSeason({ season, character: character satisfies Character, ...SEASON_SUN[season] });
  }

  /** Sends the weather on the next frame (it changed outside the clock: a lock, a new valley). */
  markDue() { this.since = Infinity; }

  /**
   * Runs the clock and the clouds on by `dt` real seconds, sending the weather when it's due, and throws the storm's
   * strikes. `weather` is the game's living weather; `view` where a strike may land round.
   */
  step(r: BrushRenderer, dt: number, wind: { speed: number; direction: number }, weather: WeatherState, view: { x: number; z: number }) {
    this.hour = (this.hour + (dt * this.speed) / SECONDS_PER_HOUR) % 24;
    const v = this.speed === 0 ? 0 : cloudDriftSpeed(wind.speed) * this.speed;
    this.drift.x += this.drift.vx * dt; this.drift.z += this.drift.vz * dt;
    this.drift.vx = Math.cos(wind.direction) * v; this.drift.vz = Math.sin(wind.direction) * v;
    this.since += dt;
    if (this.since >= 1 / WEATHER_HZ) this.send(r, weather);
    else r.setHour(this.hour);
    this.storm(r, dt, weather, view);
  }

  /** Sends the weather now (`immediate`: drawn as it is at once, not eased to: a new valley). */
  send(r: BrushRenderer, weather: WeatherState, immediate = false) {
    this.since = 0;
    r.setWeather({ ...drawnWeather(weather), drift: { ...this.drift }, cloudSeed: this.cloudSeed }, immediate);
    r.setHour(this.hour);
  }

  /** The storm's strikes: real seconds (a 4× clock doesn't strike faster), none while paused or with no storm on. */
  private storm(r: BrushRenderer, dt: number, weather: WeatherState, view: { x: number; z: number }) {
    if (!this.flashesEnabled || !weather.lightning || this.speed === 0) return;
    this.nextStrike -= dt;
    if (this.nextStrike > 0) return;
    this.nextStrike = this.gap();
    const a = this.strikes.next() * Math.PI * 2, d = STRIKE_REACH * (0.35 + 0.65 * this.strikes.next());
    r.strike({
      x: view.x + Math.cos(a) * d, z: view.z + Math.sin(a) * d,
      strength: Math.min(1, 0.55 + 0.45 * weather.storm), seed: Math.floor(this.strikes.next() * 1e6),
    });
  }

  private gap() { return STRIKE_GAP.min + (STRIKE_GAP.max - STRIKE_GAP.min) * this.strikes.next(); }
}
