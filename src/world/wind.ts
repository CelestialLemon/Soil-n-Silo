// The wind: brush3d's live wind simulation (startWind, in a worker) over the valley, round its buildings, trees and
// hedges, with gusts running through the grass and the crowns; its strength follows the weather. It's run on a few seconds
// before it's shown, so the gusts have filled the valley; until then, and wherever a worker can't run, the renderer is
// given the goal, steady (steadyWind). The live wind's speed, eased over a few seconds, is what the homestead's turbines
// are fed (the world's getSimEnv).
import {
  type BrushRenderer, type Obstacle, startWind, steadyWind, type WeatherName, WIND_TICK, type WindGoal, type WindWorker,
} from '../../brush3d/src/index.ts';

/** How hard the wind blows (m/s at ground level) in each weather. */
const STRENGTH: Record<WeatherName, number> = {
  clear: 3.5, scattered: 4.5, overcast: 5, 'soft-rain': 6, storm: 14, mist: 1.5, fog: 1.5, 'low-cloud': 3, dust: 9,
  'heat-wave': 2, snow: 5, blizzard: 17,
};
/** Seconds the wind is run on before it's shown. */
const WARM = 10;
/** The wind's grid: a little past the valley's grid. */
const GRID = { nx: 200, nz: 200, cell: 1, x0: -100, z0: -100 };
/** Where the live speed is read: over the valley's middle, at a turbine's hub height (m). */
const HUB = 14;
/** Seconds the live speed takes to follow the wind (most of the way): a gust lifts it, a lull lets it down. */
const SPEED_EASE = 3;

export class Wind {
  private worker: WindWorker | null = null;
  goal: WindGoal;
  /** The live wind's speed (m/s) over the valley at a hub's height, eased: what the turbines make power from. */
  speed: number;

  constructor(weather: WeatherName, seed: number, obstacles: Obstacle[]) {
    this.goal = { speed: STRENGTH[weather], direction: 0.6 + ((seed % 360) * Math.PI) / 180, gustiness: 0.5, rhythm: 0.5 };
    this.speed = this.goal.speed;
    this.start(obstacles, seed);
  }

  private start(obstacles: Obstacle[], seed: number) {
    try {
      const w = startWind(GRID, obstacles, this.goal, { seed: (seed % 9973) + 1 });
      w.advance(WARM);
      this.worker = w;
    } catch {
      // No workers here (a test page, a locked-down browser): the steady wind stands in.
      this.worker = null;
    }
  }

  /** The wind follows the weather. */
  setWeather(weather: WeatherName) {
    this.goal = { ...this.goal, speed: STRENGTH[weather] };
    this.worker?.setGoal(this.goal);
  }

  setObstacles(obstacles: Obstacle[]) { this.worker?.setObstacles(obstacles); }

  private get warm() { const c = this.worker?.cur; return !!c && c.tick >= Math.round(WARM / WIND_TICK); }

  /** Runs the wind on by `dt` seconds and gives the renderer this frame's. */
  step(r: BrushRenderer, dt: number) {
    const w = this.worker;
    if (w) w.advance(dt);
    if (w?.prev && w.cur && this.warm) r.setWind(w.prev, w.cur, w.alpha);
    else { const s = steadyWind(this.goal.speed, this.goal.direction); r.setWind(s, s, 0); }
    const [u, v] = this.at(0, 0, HUB);
    this.speed += (Math.hypot(u, v) - this.speed) * (1 - Math.exp(-dt / SPEED_EASE));
  }

  /** The wind (m/s along x and z) at a point and a height. */
  at(x: number, z: number, height: number): [number, number] {
    if (this.worker && this.warm) return this.worker.at(x, z, height);
    return [Math.cos(this.goal.direction) * this.goal.speed, Math.sin(this.goal.direction) * this.goal.speed];
  }

  dispose() { this.worker?.dispose(); this.worker = null; }
}
