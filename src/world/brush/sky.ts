import { steadyWind, WIND_SCALE, type BrushRenderer, type Weather } from '../../../brush3d/src/index.ts';
import { DUST_HAZE } from '../../game/events.ts';
import { windAt } from '../../game/sim/clock.ts';
import { weatherNow } from '../../game/sim/weather.ts';
import type { GameState } from '../../game/state.ts';
import { TILE } from './scale.ts';

// The hour, the season and the weather, as brush3d draws them (#201's first light): the season set once, the game's clock
// hour every frame, and the game's weather now mapped plainly onto brush3d's (cloud, rain or snow, the heat, a fog's or a
// dust storm's haze) with one steady wind. #207 maps the whole of the game's weather, ground and water onto it (storms,
// lightning, lying snow, frost, wet and mud), #208 the living wind and the clouds' drift the rules share.

/** Which way the steady wind blows (radians, from +x towards +z), and how strong the game's full wind is (m/s). */
const WIND_DIRECTION = (31 * Math.PI) / 180, FULL_WIND = WIND_SCALE.gale;

export class BrushSky {
  private readonly r: BrushRenderer;
  private sent = '';
  private wind = -1;

  constructor(r: BrushRenderer, s: GameState) {
    this.r = r;
    // The game's season, its twist and its day: brush3d's seasons and characters are the game's own.
    const { season, character, sun } = s.scenario.climate;
    r.setSeason({ season, character, sunrise: sun.rise, sunset: sun.set });
  }

  sync(s: GameState, hour: number) {
    const r = this.r, w = weatherNow(s), fall = w.precip;
    const weather: Weather = {
      cloud: w.cloud, cloudSeed: s.scenario.seed, heat: w.heat,
      rain: w.sky === 'rain' ? fall : 0, snow: w.sky === 'snow' ? fall : 0,
      haze: w.haze ? { amount: w.haze.amount, color: w.haze.color, top: w.haze.top * TILE, kind: w.haze.color === DUST_HAZE ? 'dust' : 'fog' } : null,
    };
    // Sent when it changes: its looks ease towards what was asked last (the first at once, as a level loads).
    const key = JSON.stringify(weather);
    if (key !== this.sent) { r.setWeather(weather, this.sent === ''); this.sent = key; }
    const wind = Math.round(windAt(s.scenario, s.time) * 50) / 50;
    if (wind !== this.wind) { this.wind = wind; const snap = steadyWind(wind * FULL_WIND, WIND_DIRECTION); r.setWind(snap, snap, 0); }
    r.setHour(hour);
  }
}
