import { FLUIDS, type PixelFluid, type PixelRenderer } from 'pixel3d-renderer';
import { flooded, type Flooded } from '../game/flood.ts';
import { TERRAIN } from '../game/map.ts';
import { type GameState } from '../game/state.ts';
import { LEVEL_HEIGHT, type Lie } from './ground.ts';

// The flood water: one renderer fluid layer (silty brown) over the tiles the flood covers and the river's own, at the surface
// the rules give each (flood.ts). The cells change only when the flood moves a step (a few times as it builds and drains); the
// water stands at its step's surface (raised where the smooth ground is drawn higher, so a tile the rules cover is covered), so
// it climbs and falls in half levels (an eighth of a metre): the renderer hides water behind higher ground by depth, the rules
// decide what the flood can reach.

/** The water stands this much (m) above the rules' surface, so it clears ground at the same height instead of fighting it. */
const LIFT = 0.02;

export class FloodView {
  private readonly r: PixelRenderer;
  private readonly lie: Lie;
  private layer: PixelFluid | null = null;
  /** The covered tiles the layer's cells were last made for. */
  private shown: Flooded | null = null;

  constructor(r: PixelRenderer, lie: Lie) { this.r = r; this.lie = lie; }

  /** The highest the ground is drawn anywhere on a tile (at its corners and middle), in metres, on the tile's own patch (at a cliff, not the neighbour's). */
  private highest(x: number, y: number): number {
    let top = -Infinity;
    for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5]] as const) top = Math.max(top, this.lie.tileY(x, y, u, v));
    return top;
  }

  sync(s: GameState) {
    const f = flooded(s);
    if (f.step === 0) {
      if (this.layer) this.layer.visible = false;
      return;
    }
    const layer = this.layer ??= this.r.addFluid(FLUIDS.flood);
    if (this.shown !== f) {
      const { width, height, terrain } = s.map, heights = new Float32Array(width * height);
      for (let i = 0; i < heights.length; i++) {
        if (terrain[i] === TERRAIN.water) heights[i] = f.surface[i] * LEVEL_HEIGHT;
        // The ground is drawn smooth, within half a level of the rules' (which put this tile under water): the water covers the
        // whole tile as drawn, never less than the rules' surface.
        else if (f.tiles[i]) heights[i] = Math.max(f.surface[i] * LEVEL_HEIGHT, this.highest(i % width, Math.floor(i / width)) + LIFT);
        else heights[i] = NaN;
      }
      layer.setCells({ x: 0, z: 0, cell: 1, cols: width, rows: height, heights });
      this.shown = f;
    }
    layer.y = LIFT;
    layer.visible = true;
  }
}
