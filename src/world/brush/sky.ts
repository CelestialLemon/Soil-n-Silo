import { steadyWind, WIND_SCALE, type BrushRenderer, type Weather } from '../../../brush3d/src/index.ts';
import { DUST_HAZE, lookAt } from '../../game/events.ts';
import { lightningIn, LIGHTNING_STEP, stormAt, sunUnderAt } from '../../game/looks.ts';
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
//
// And the storm's looks (looks.ts; none is a rule): how stormy the sky looks, the gold light under the clouds at some dawns
// and dusks and at a storm's edges, and the lightning, struck and flickered as the game's clock reaches each seeded minute.
// brush3d's flash governor keeps every flash within the flash limits whatever is asked; the player's setting for it is #209's.

/** Which way the steady wind blows (radians, from +x towards +z), and how strong the game's full wind is (m/s). */
const WIND_DIRECTION = (31 * Math.PI) / 180, FULL_WIND = WIND_SCALE.gale;
/** A jump in the clock longer than this (game seconds: a still, a load, a skip) brings no lightning for the minutes skipped. */
const LIGHTNING_JUMP = 10 * LIGHTNING_STEP;
/** At most this many strikes and flickers in one frame. */
const LIGHTNING_FRAME = 2;

export class BrushSky {
  private readonly r: BrushRenderer;
  private sent = '';
  private wind = -1;
  /** The game time the lightning was last looked for to. */
  private struck = NaN;

  constructor(r: BrushRenderer, s: GameState) {
    this.r = r;
    // The game's season, its twist and its day: brush3d's seasons and characters are the game's own.
    const { season, character, sun } = s.scenario.climate;
    r.setSeason({ season, character, sunrise: sun.rise, sunset: sun.set });
  }

  sync(s: GameState, hour: number, speed: number) {
    const r = this.r, sc = s.scenario, w = weatherNow(s), fall = w.precip, q = (v: number) => Math.round(v * 100) / 100;
    const weather: Weather = {
      cloud: w.cloud, cloudSeed: sc.seed, heat: w.heat,
      rain: w.sky === 'rain' ? fall : 0, snow: w.sky === 'snow' ? fall : 0,
      haze: w.haze ? { amount: w.haze.amount, color: w.haze.color, top: w.haze.top * TILE, kind: w.haze.color === DUST_HAZE ? 'dust' : 'fog' } : null,
      storm: q(stormAt(sc, s.time)), sunUnder: q(sunUnderAt(sc, s.time)),
    };
    // Sent when it changes: its looks ease towards what was asked last (the first at once, as a level loads).
    const key = JSON.stringify(weather);
    if (key !== this.sent) { r.setWeather(weather, this.sent === ''); this.sent = key; }
    const wind = Math.round(Math.max(windAt(sc, s.time), lookAt(sc, s.time).wind) * 50) / 50;
    if (wind !== this.wind) { this.wind = wind; const snap = steadyWind(wind * FULL_WIND, WIND_DIRECTION); r.setWind(snap, snap, 0); }
    r.setHour(hour);
    this.lightning(s, speed);
  }

  /** Strikes and flickers the lightning of the game minutes since the last frame, at the game's speed `speed`. */
  private lightning(s: GameState, speed: number) {
    const from = this.struck;
    this.struck = s.time;
    if (!(s.time > from) || s.time - from > LIGHTNING_JUMP) return;
    // At 1× a game second is a real one; faster, a seeded share of the lightning is kept (the same share at the same speed,
    // whatever the frame rate), so it comes as often a real second.
    const keep = Math.min(1, 1 / Math.max(1, speed));
    const { strikes, flickers } = lightningIn(s.scenario, from, s.time, s.map.width, s.map.height, keep);
    for (const b of strikes.slice(0, LIGHTNING_FRAME)) this.r.strike({ x: (b.x + 0.5) * TILE, z: (b.y + 0.5) * TILE, strength: b.strength, seed: b.seed });
    for (const f of flickers.slice(0, LIGHTNING_FRAME)) this.r.flicker({ strength: f.strength, bearing: f.bearing });
  }
}
