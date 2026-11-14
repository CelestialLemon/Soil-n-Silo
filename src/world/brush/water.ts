import type { BrushRenderer, WaterMap } from '../../../brush3d/src/index.ts';
import { pushesAt } from '../../game/events.ts';
import { flooded, floodUnder } from '../../game/flood.ts';
import { iceAt, iceOf, type Ice } from '../../game/ice.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { reliefOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import { LandGrid, Sender } from './grid.ts';
import { LEVEL } from './scale.ts';

// The water, as brush3d draws it (#207): one map over the whole land (the map and the country round it), a cell a tile,
// sent with `setWater` whenever the game's water changes (brush3d/docs/WATER.md). It holds:
// - the river and the ponds, at their levels, the river running with its current (the map's, times the season's river);
// - a flood (flood.ts): the river spread over the tiles the rules cover, at the surface they give, and the river risen with
//   it; silty while it lasts (the pixel world's flood water is brown too). The water meets the land where the drawn ground
//   rises out of it, so its shore follows the land rather than the tiles (a hump of a covered tile may stand dry);
// - the river's ice in a cold snap (ice.ts): the rules' grid, frozen from the banks inward as the cold snap's cover rises,
//   a fall and the water just below it left open, so what is drawn open is what runs. Ponds freeze over with it (still
//   water; no rule reads them).
// Nothing here changes a rule: it reads the game's state and draws it.
//
// #202 owns how the river and ponds sit in the land (their beds, the falls, the banks): it may change where the river's
// surface stands against its tile's level (`riverSurface`), and how the river's own cells are laid out, but the flood, the
// ice and the mud stay here.

/** How far over its tile's level a river's or pond's surface stands (m): a hair over the plain land's flat water tiles. #202 cuts the beds. */
const RIVER_LIFT = 0.03;
/** Where the river's or a pond's surface stands over a tile at `level` (m). */
export const riverSurface = (level: number) => level * LEVEL + RIVER_LIFT;
/** Flood water spread out of the river runs this much slower than the river beside it (the demo's, brush3d/src/demo/water.ts). */
const SPREAD_FLOW = 0.25;
/** How muddy a flood's water is at its height (0 clear .. 1 brown): the demo's flood at its peak. */
const FLOOD_MUD = 0.85;
/** The ice and the mud are sent in steps this fine (a map is laid out again with each change: brush3d/docs/WATER.md). */
const STEPS = 32;

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
    this.ice = iceOf({ width: land.width, height: land.height, river, level: (i) => land.corner[i * 4] });
  }

  /** Sends the water as the game has it now, if it changed. */
  sync(s: GameState) {
    const sc = s.scenario, f = flooded(s), cover = iceAt(sc, s.time), flood = floodUnder(sc, s.time);
    const speed = sc.climate.river.flow * pushesAt(sc, s.time).river;
    const iceStep = Math.round(cover * STEPS), mudStep = Math.round((flood ? flood.intensity : 0) * STEPS);
    // The map changes only when one of these does: the flood's step (and the land it covers), the ice's and the mud's.
    if (!this.send.due(`${f.step}:${reliefOf(s)}:${iceStep}:${mudStep}:${speed}`)) return;
    this.r.setWater(this.build(s, f, iceStep / STEPS, (mudStep / STEPS) * FLOOD_MUD, speed), this.send.first ? 0 : undefined);
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
