// The sky: the clock (paused, or one, two or four times the game's pace: at 1×, a game hour every 30 seconds), the
// season's light (brush3d's season, its sunrise and sunset from the game's table) and the weather (a brush3d preset), its
// clouds drifting with the wind aloft. The weather goes to brush3d a few times a second, as the game's would; brush3d
// carries the clouds on between.
import { type BrushRenderer, cloudDriftSpeed, type CloudDrift, SEASON_SUN, type Weather, WEATHER_PRESETS, type WeatherName } from '../../brush3d/src/index.ts';
import type { Season } from '../game/index.ts';

/** How fast the clock runs: paused, or 1×, 2× or 4×. */
export type Speed = 0 | 1 | 2 | 4;
/** Real seconds a game hour lasts at 1×. */
export const SECONDS_PER_HOUR = 30;
/** How often (Hz) the weather is sent. */
const WEATHER_HZ = 4;

export class Sky {
  hour: number;
  speed: Speed = 1;
  weather: WeatherName;
  private readonly cloudSeed: number;
  private drift: Required<CloudDrift> = { x: 0, z: 0, vx: 0, vz: 0 };
  private since = 0;

  constructor(hour: number, weather: WeatherName, seed: number) {
    this.hour = hour; this.weather = weather; this.cloudSeed = Math.abs(Math.trunc(seed)) % 1000;
  }

  /** The season's light; set before the season's scene is built (its trees and grass take it). */
  static season(r: BrushRenderer, season: Season) {
    r.setSeason({ season, ...SEASON_SUN[season] });
  }

  setWeather(name: WeatherName) { this.weather = name; this.since = Infinity; }

  /** The weather's rain and snow (for the ground's wet and snow). */
  get fall() { const w: Weather = WEATHER_PRESETS[this.weather]; return { rain: w.rain ?? 0, snow: w.snow ?? 0 }; }

  /** Runs the clock and the clouds on by `dt` real seconds, sending the weather when it's due. */
  step(r: BrushRenderer, dt: number, wind: { speed: number; direction: number }) {
    this.hour = (this.hour + (dt * this.speed) / SECONDS_PER_HOUR) % 24;
    const v = this.speed === 0 ? 0 : cloudDriftSpeed(wind.speed) * this.speed;
    this.drift.x += this.drift.vx * dt; this.drift.z += this.drift.vz * dt;
    this.drift.vx = Math.cos(wind.direction) * v; this.drift.vz = Math.sin(wind.direction) * v;
    this.since += dt;
    if (this.since >= 1 / WEATHER_HZ) this.send(r);
    r.setHour(this.hour);
  }

  /** Sends the weather now (`immediate`: drawn as it is at once, not eased to: a new valley). */
  send(r: BrushRenderer, immediate = false) {
    this.since = 0;
    r.setWeather({ ...WEATHER_PRESETS[this.weather], drift: { ...this.drift }, cloudSeed: this.cloudSeed }, immediate);
    r.setHour(this.hour);
  }
}
