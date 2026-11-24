// The wind: brush3d's live wind simulation (startWind, in a worker) over the valley, round its buildings, trees and
// hedges, with gusts running through the grass and the crowns; its strength follows the weather. It's run on a few seconds
// before it's shown, so the gusts have filled the valley; until then, and wherever a worker can't run, the renderer is
// given the goal, steady (steadyWind).
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

export class Wind {
  private worker: WindWorker | null = null;
  goal: WindGoal;

  constructor(weather: WeatherName, seed: number, obstacles: Obstacle[]) {
    this.goal = { speed: STRENGTH[weather], direction: 0.6 + ((seed % 360) * Math.PI) / 180, gustiness: 0.5, rhythm: 0.5 };
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
  }

  /** The wind (m/s along x and z) at a point and a height. */
  at(x: number, z: number, height: number): [number, number] {
    if (this.worker && this.warm) return this.worker.at(x, z, height);
    return [Math.cos(this.goal.direction) * this.goal.speed, Math.sin(this.goal.direction) * this.goal.speed];
  }

  dispose() { this.worker?.dispose(); this.worker = null; }
}
