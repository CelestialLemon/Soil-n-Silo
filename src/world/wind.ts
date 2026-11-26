// The wind: brush3d's live wind simulation (startWind, in a worker) over the valley, round its buildings, trees and
// hedges, with gusts running through the grass and the crowns; its strength follows the living weather's wind
// (state.sim.weather.windSpeed, setSpeed). It's run on a few seconds
// before it's shown, so the gusts have filled the valley; until then, and wherever a worker can't run, the renderer is
// given the goal, steady (steadyWind). The live wind's speed, eased over a few seconds, is what the homestead's turbines
// are fed (the world's getSimEnv).
import {
  type BrushRenderer, type Obstacle, startWind, steadyWind, WIND_TICK, type WindGoal, type WindWorker,
} from '../../brush3d/src/index.ts';

/** How far (m/s) the weather's wind must move before the simulation is given a new goal: it eases there itself. */
const GOAL_STEP = 0.25;
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

  constructor(speed: number, seed: number, obstacles: Obstacle[]) {
    this.goal = { speed, direction: 0.6 + ((seed % 360) * Math.PI) / 180, gustiness: 0.5, rhythm: 0.5 };
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

  /** The wind follows the weather's (m/s at ground level): a new goal only once it has moved GOAL_STEP. */
  setSpeed(speed: number) {
    if (!Number.isFinite(speed) || Math.abs(speed - this.goal.speed) < GOAL_STEP) return;
    this.goal = { ...this.goal, speed };
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
