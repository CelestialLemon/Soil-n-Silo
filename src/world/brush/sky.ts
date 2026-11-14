import { steadyWind, WIND_SCALE, type BrushRenderer, type Weather } from '../../../brush3d/src/index.ts';
import { DUST_HAZE, lookAt } from '../../game/events.ts';
import { windAt } from '../../game/sim/clock.ts';
import { weatherNow } from '../../game/sim/weather.ts';
import type { GameState } from '../../game/state.ts';
import { TILE } from './scale.ts';

// The hour, the season and the sky, as brush3d draws them (#207): the season set once, the game's clock hour every frame,
// and the game's weather now (sim/weather.ts's `weatherNow`: the everyday spells and the events' looks) as brush3d's: the
// cover, rain or snow (winter's is snow), a heat wave's warm light, a fog's or a dust storm's haze (its colour tells which),
// and the wind. A blizzard is heavy snow in a strong wind as brush3d draws it (brush3d/docs/GROUND.md), so the drawn wind
// is the rules' or the events' look's (events.ts, `Look.wind`), whichever is stronger. The pace is the game's: brush3d only
// eases the looks between its steps. The wind is one steady wind until #208 brings the living wind the rules share. What
// lies on the land and the water are cover.ts's and water.ts's.

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
    const wind = Math.round(Math.max(windAt(s.scenario, s.time), lookAt(s.scenario, s.time).wind) * 50) / 50;
    if (wind !== this.wind) { this.wind = wind; const snap = steadyWind(wind * FULL_WIND, WIND_DIRECTION); r.setWind(snap, snap, 0); }
    r.setHour(hour);
  }
}
