import { blocksWind, DRAG, MODELS, startWind, steadyWind, WIND_TICK, type BrushRenderer, type Obstacle, type WindWorker } from '../../../brush3d/src/index.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { windGoal, windGrid, WIND_DIRECTION } from '../../game/overhead.ts';
import { layoutOf, sizeOf, type GameState } from '../../game/state.ts';
import { MODEL_OF, YAW } from './catalog.ts';
import { TILE } from './scale.ts';

// The living wind, drawn (#208): the air under the gusts the rules step (src/game/overhead.ts), so the grass, the trees and
// the dust show the gusts the turbines feel. The rules step only the gusts, saved with the game (`s.wind`); brush3d's worker
// steps the air under them (brush3d/docs/WIND.md), started from the rules' gusts and given the same goal every tick, so its
// gusts are the rules', tick for tick, and its air flows round what stands on the map: the buildings with walls (brush3d's
// `blocksWind`) and the trees' crowns, on the map and in the country the wind's world reaches past it.
//
// - **One tick for one.** Each frame the worker is given the ticks the rules ran since the last, each with the goal the rules
//   asked for then, and is put as far into the next as the game's clock is (`s.carry`), so the picture is never ahead of the
//   rules nor drifts from them. Paused, nothing is given and the air stands still where it was.
// - **Catching up.** A worker that falls more than CATCH_UP ticks behind (a slow machine, the game at 8× or 16×, a load) is
//   jumped to the rules' gusts at once (`setState`): the air carries on from where it was, under the rules' gusts.
// - **The grid** is the rules' (`windGrid`): 2 m cells, past the map by about 32 m, centred on it; at 1 m a commission's map
//   wouldn't fit in the worker's 256 cells.

/** Ticks behind the rules past which the worker is jumped to their gusts. */
const CATCH_UP = 30;
/** How wide a tree's crown is to the wind, metres (a tile is 4). */
const CROWN = 2.4;

export class BrushWind {
  private readonly r: BrushRenderer;
  private readonly land: Land;
  private readonly wind: WindWorker;
  /** The game it follows, the rules' tick it has been given up to, and the layout its obstacles are for. */
  private state: GameState;
  private fed: number;
  private layout: number;
  private obstacles: string;

  constructor(r: BrushRenderer, s: GameState, land: Land) {
    this.r = r; this.land = land; this.state = s;
    const obstacles = this.obstaclesOf(s);
    this.obstacles = JSON.stringify(obstacles); this.layout = layoutOf(s);
    this.wind = startWind(windGrid(s.map.width, s.map.height), obstacles, windGoal(s.scenario, s.time), { state: s.wind });
    this.fed = s.wind.tick;
  }

  sync(s: GameState) {
    const wind = this.wind;
    // Another game (a load): its gusts at once, and the trees and the dust start at rest.
    if (s !== this.state) { this.state = s; wind.setState(s.wind); this.fed = s.wind.tick; this.r.restartWind(); this.layout = -1; }
    const layout = layoutOf(s);
    if (layout !== this.layout) {
      this.layout = layout;
      const obstacles = this.obstaclesOf(s), key = JSON.stringify(obstacles);
      if (key !== this.obstacles) { this.obstacles = key; wind.setObstacles(obstacles); }
    }
    const due = s.wind.tick - this.fed;
    if (due < 0 || due + wind.pending > CATCH_UP) wind.setState(s.wind);
    else for (let k = this.fed + 1; k <= s.wind.tick; k++) {
      // The goal the rules asked for at tick k (overhead.ts's stepOverhead: windGoal at the time the tick ends).
      wind.setGoal(windGoal(s.scenario, s.time - (s.wind.tick - k) * WIND_TICK));
      wind.advance(WIND_TICK);
    }
    this.fed = s.wind.tick;
    wind.lead(s.carry / WIND_TICK);
    if (wind.cur) this.r.setWind(wind.prev ?? wind.cur, wind.cur, wind.alpha);
    else { const snap = steadyWind(windGoal(s.scenario, s.time).speed, WIND_DIRECTION); this.r.setWind(snap, snap, 0); }
  }

  /** What the wind meets: the buildings with walls, and the trees' crowns on the map and in the country the wind's world covers. */
  private obstaclesOf(s: GameState): Obstacle[] {
    const out: Obstacle[] = [];
    for (const b of s.buildings) {
      const name = MODEL_OF[b.type], m = name ? MODELS[name] : undefined;
      if (!m || !blocksWind(m)) continue;
      // The model stands on the middle of its footprint, turned by YAW (three.js's turn about y, +x towards -z).
      const n = sizeOf(b), yaw = YAW[b.rot], c = Math.cos(yaw), sn = Math.sin(yaw);
      const ox = (m.lo[0] + m.hi[0]) / 2, oz = (m.lo[2] + m.hi[2]) / 2;
      out.push({
        box: { x: (b.x + n / 2) * TILE + ox * c + oz * sn, z: (b.y + n / 2) * TILE - ox * sn + oz * c, hx: (m.hi[0] - m.lo[0]) / 2, hz: (m.hi[2] - m.lo[2]) / 2, turn: -yaw },
        solid: true, height: m.hi[1],
      });
    }
    const grid = windGrid(s.map.width, s.map.height), M = this.land.margin;
    const x0 = Math.max(-M, Math.floor(grid.x0 / TILE)), x1 = Math.min(s.map.width + M, Math.ceil((grid.x0 + grid.nx * grid.cell) / TILE));
    const y0 = Math.max(-M, Math.floor(grid.z0 / TILE)), y1 = Math.min(s.map.height + M, Math.ceil((grid.z0 + grid.nz * grid.cell) / TILE));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const onMap = x >= 0 && y >= 0 && x < s.map.width && y < s.map.height;
      const t = onMap ? s.map.terrain[y * s.map.width + x] : this.land.terrain[(y + M) * this.land.width + x + M];
      if (t === TERRAIN.tree) out.push({ circle: { x: (x + 0.5) * TILE, z: (y + 0.5) * TILE, radius: CROWN }, drag: DRAG.crown });
    }
    return out;
  }
}
