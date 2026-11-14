import type { BrushRenderer, WaterMap } from '../../../brush3d/src/index.ts';
import { DAY_SECONDS } from '../../game/data.ts';
import { pushesAt } from '../../game/events.ts';
import { flooded, floodUnder } from '../../game/flood.ts';
import { iceAt, iceOf, type Ice } from '../../game/ice.ts';
import { groundLooksAt } from '../../game/looks.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { reliefOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import { LandGrid, Sender } from './grid.ts';
import { WATER_DOWN } from './landMap.ts';
import { LEVEL } from './scale.ts';

// The water, as brush3d draws it (#207): one map over the whole land (the map and the country round it), a cell a tile,
// sent with `setWater` whenever the game's water changes (brush3d/docs/WATER.md). It holds:
// - the river and the ponds, at their levels, the river running with its current (the map's, times the season's river);
// - a flood (flood.ts): the river spread over the tiles the rules cover, at the surface they give, and the river risen with
//   it. The water meets the land where the drawn ground
//   rises out of it, so its shore follows the land rather than the tiles (a hump of a covered tile may stand dry);
// - the river's ice in a cold snap (ice.ts): the rules' grid, frozen from the banks inward as the cold snap's cover rises,
//   a fall and the water just below it left open, so what is drawn open is what runs. Ponds freeze over with it (still
//   water; no rule reads them);
// - how muddy it runs (looks.ts, a look only): browner in heavy rain (a thunderstorm, a tropical storm) and a flood, clearing
//   slowly over the day after; a flood's water as brown as the flood is high while it lasts (the pixel world's is brown too).
// Nothing here changes a rule: it reads the game's state and draws it.
//
// #202 owns how the river and ponds sit in the land (their beds, the falls, the banks): it may change where the river's
// surface stands against its tile's level (`riverSurface`), and how the river's own cells are laid out, but the flood, the
// ice and the mud stay here.

/** How far over the land a flood's surface stands (m), so it covers the tiles it floods. */
const RIVER_LIFT = 0.03;
/** Where the river's or a pond's surface stands over a tile at `level` (m): in the bed brush3d cuts under it (#202). */
export const riverSurface = (level: number) => level * LEVEL - WATER_DOWN;
/** Flood water spread out of the river runs this much slower than the river beside it (the demo's, brush3d/src/demo/water.ts). */
const SPREAD_FLOW = 0.25;
/** How muddy a flood's water is at its height (0 clear .. 1 brown): the demo's flood at its peak. */
const FLOOD_MUD = 0.85;
/** The ice and the mud are sent in steps this fine (a map is laid out again with each change: brush3d/docs/WATER.md). */
const STEPS = 32;
/** How muddy the river runs is looked at again when the game's clock has moved this far (game seconds: a game minute). */
const LOOK = DAY_SECONDS / 24 / 60;

export class BrushWater {
  private readonly r: BrushRenderer;
  private readonly land: Land;
  private readonly lie: Lie;
  private readonly grid: LandGrid;
  /** The rules' river over the whole land, as the pixel world's ice reads it (iceView.ts): where it keeps running, and each tile's distance from the bank. */
  private readonly ice: Ice;
  /** Each land tile's river flow (m/s, x and z), and whether it is still water (a pond). */
  private readonly flowX: Float32Array;
  private readonly flowZ: Float32Array;
  private readonly pond: Uint8Array;
  private readonly send = new Sender();
  private at = NaN;
  private riverMud = 0;
  /** The land's water tiles, and the levels they were last sent at, with the relief they were read from. */
  private readonly wet: number[] = [];
  private readonly wetLevel: Float32Array;
  private wetRelief = -1;
  private wetStep = 0;

  constructor(r: BrushRenderer, land: Land, lie: Lie) {
    this.r = r; this.land = land; this.lie = lie;
    this.grid = new LandGrid(land);
    const n = land.width * land.height, river = new Uint8Array(n);
    this.flowX = new Float32Array(n); this.flowZ = new Float32Array(n); this.pond = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const vx = land.flow[i * 2], vz = land.flow[i * 2 + 1];
      this.flowX[i] = vx; this.flowZ[i] = vz;
      river[i] = vx !== 0 || vz !== 0 ? 1 : 0;
      this.pond[i] = land.terrain[i] === TERRAIN.water && !river[i] ? 1 : 0;
    }
    for (let i = 0; i < n; i++) if (land.terrain[i] === TERRAIN.water) this.wet.push(i);
    this.wetLevel = new Float32Array(this.wet.length).fill(NaN);
    this.ice = iceOf({ width: land.width, height: land.height, river, level: (i) => land.corner[i * 4] });
  }

  /** Sends the water as the game has it now, if it changed. */
  sync(s: GameState) {
    const sc = s.scenario, f = flooded(s), cover = iceAt(sc, s.time), flood = floodUnder(sc, s.time);
    const speed = sc.climate.river.flow * pushesAt(sc, s.time).river;
    if (!(Math.abs(s.time - this.at) < LOOK)) { this.at = s.time; this.riverMud = groundLooksAt(sc, s.time).riverMud; }
    const mud = Math.max(flood ? flood.intensity * FLOOD_MUD : 0, this.riverMud);
    const iceStep = Math.round(cover * STEPS), mudStep = Math.round(mud * STEPS);
    // The map changes only when one of these does: the flood's step (and the land it covers), the ice's and the mud's, and
    // the levels of the water's own tiles (not every earthwork, #204: sending the map again took 40 to 90 ms, a hitch
    // each time a building levelled its ground, though the water stood as it was).
    if (!this.send.due(`${f.step}:${f.step > 0 ? reliefOf(s) : this.levels(s)}:${iceStep}:${mudStep}:${speed}`)) return;
    this.r.setWater(this.build(s, f, iceStep / STEPS, mudStep / STEPS, speed), this.send.first ? 0 : undefined);
  }

  /** A count that moves on only when the levels of the land's water tiles change. */
  private levels(s: GameState) {
    const relief = reliefOf(s);
    if (relief === this.wetRelief) return this.wetStep;
    this.wetRelief = relief;
    const corner = this.lie.relief.corner;
    let moved = false;
    this.wet.forEach((k, i) => {
      if (this.wetLevel[i] !== corner[k * 4]) { this.wetLevel[i] = corner[k * 4]; moved = true; }
    });
    if (moved) this.wetStep++;
    return this.wetStep;
  }

  private build(s: GameState, f: ReturnType<typeof flooded>, cover: number, mud: number, speed: number): WaterMap {
    const { land, lie, grid } = this, { width: W, height: H, margin: M } = land, n = W * H, m = s.map;
    const level = new Float32Array(n).fill(NaN), flowX = new Float32Array(n), flowZ = new Float32Array(n);
    const corner = lie.relief.corner;
    for (let i = 0; i < n; i++) {
      if (land.terrain[i] !== TERRAIN.water) continue;
      level[i] = riverSurface(corner[i * 4]);
      flowX[i] = this.flowX[i] * speed; flowZ[i] = this.flowZ[i] * speed;
    }
    // Beside a fall, the banks below it (#202): the water's sheet runs from cell to cell at their surfaces, and on flat a
    // cell past the last wet one, so beside a fall it would slope from the water above down over the bank below, standing
    // out of the land there like a sail. Those banks are given the water below's surface (under them, so they hide it):
    // the sheet beside the fall then runs down the bank's own cliff, out of sight.
    // (Read from the river's cells as they were, so a bank given a surface here doesn't count as river for the next.)
    const river = level.slice();
    for (let i = 0; i < n; i++) {
      if (Number.isNaN(river[i])) continue;
      const x = i % W, y = (i - x) / W;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const ux = x + dx, uy = y + dy, u = uy * W + ux;
        if (ux < 0 || uy < 0 || ux >= W || uy >= H || !(river[u] > river[i] + 0.01)) continue;
        for (const s of [-1, 1]) {
          const bx = x + dy * s, by = y + dx * s, k = by * W + bx;
          if (bx < 0 || by < 0 || bx >= W || by >= H || land.terrain[k] === TERRAIN.water || !Number.isNaN(river[k])) continue;
          // The lowest fall beside it wins, if two are.
          if (Math.min(corner[k * 4], corner[k * 4 + 1], corner[k * 4 + 2], corner[k * 4 + 3]) * LEVEL >= river[i] && !(level[k] <= river[i])) level[k] = river[i];
        }
      }
    }
    // A flood: the rules' surface over each tile it covers, and the river risen to it. Flood water out of the river runs on
    // the way the river beside it does, slower once it leaves the channel (breadth first from the river, as the rules spread it).
    if (f.step > 0) {
      const queue: number[] = [];
      for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
        const i = y * m.width + x, k = (y + M) * W + x + M;
        if (Number.isNaN(f.surface[i])) continue;
        if (m.terrain[i] === TERRAIN.water) { level[k] = Math.max(level[k], f.surface[i] * LEVEL + RIVER_LIFT); queue.push(k); continue; }
        if (f.tiles[i]) level[k] = f.surface[i] * LEVEL + RIVER_LIFT;
      }
      const reached = new Uint8Array(n);
      for (const k of queue) reached[k] = 1;
      for (let q = 0; q < queue.length; q++) {
        const k = queue[q], x = k % W, y = (k - x) / W;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const j = (y + dy) * W + x + dx, mx = x + dx - M, my = y + dy - M;
          if (mx < 0 || my < 0 || mx >= m.width || my >= m.height || reached[j] || !f.tiles[my * m.width + mx]) continue;
          const slow = land.terrain[k] === TERRAIN.water ? SPREAD_FLOW : 1;
          reached[j] = 1; flowX[j] = flowX[k] * slow; flowZ[j] = flowZ[k] * slow;
          queue.push(j);
        }
      }
    }
    const out: WaterMap = { ...grid.shape, level, flowX, flowZ };
    if (mud > 0) out.mud = new Float32Array(n).fill(mud);
    if (cover > 0) {
      // The rules' ice, tile by tile from the bank inward (the pixel world's steps, `frozenBank`, made smooth), so each tile
      // rises from open to frozen over in its turn; brush3d freezes the banks first inside each. Ponds freeze evenly.
      const { bank, open, reach } = this.ice, ice = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        if (this.pond[i]) ice[i] = cover;
        else if (bank[i] > 0 && !open[i]) ice[i] = Math.min(1, Math.max(0, cover * reach - (bank[i] - 1)));
      }
      out.ice = ice;
    }
    return out;
  }
}
