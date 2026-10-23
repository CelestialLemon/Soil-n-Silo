import { FLUIDS, type PixelFluid, type PixelRenderer } from 'pixel3d-renderer';
import { frozenBank, iceAt, iceOf, type Ice } from '../game/ice.ts';
import type { Land } from '../game/map.ts';
import type { GameState } from '../game/state.ts';
import { LEVEL_HEIGHT } from './ground.ts';
import { WATER_Y } from './terrain.ts';

// The frozen river: one renderer fluid layer of ice (a second water surface a hair above the baked river) over the river's quiet
// stretches, grown inward from the banks as a cold snap sets in and melted back as it passes. The cells change only when the ice
// moves a tile, a few times as it forms and melts; a fall and the water just below it stay open (ice.ts: the same grid the rules read, so
// the wheels beside open water are the ones that turn). It is drawn on the whole land (the country round the map too), but only where the rules freeze the river: never over a fall.

/** The ice stands this much (m) above the water's own surface (a level's height plus WATER_Y), so the two never fight over a pixel (the renderer's least is 2 cm). */
const LIFT = 0.03;

export class IceView {
  private readonly r: PixelRenderer;
  private readonly land: Land;
  private readonly ice: Ice;
  private layer: PixelFluid | null = null;
  /** The tiles in from the bank the layer's cells were last made for. */
  private shown = 0;

  constructor(r: PixelRenderer, land: Land) {
    this.r = r; this.land = land;
    const river = new Uint8Array(land.width * land.height);
    for (let i = 0; i < river.length; i++) river[i] = land.flow[i * 2] !== 0 || land.flow[i * 2 + 1] !== 0 ? 1 : 0;
    this.ice = iceOf({ width: land.width, height: land.height, river, level: (i) => land.corner[i * 4] });
  }

  sync(s: GameState) {
    const step = frozenBank(this.ice, iceAt(s.scenario, s.time));
    if (step === 0) {
      if (this.layer) this.layer.visible = false;
      this.shown = 0;
      return;
    }
    const layer = this.layer ??= this.r.addFluid(FLUIDS.ice);
    if (step !== this.shown) {
      const { width, height, margin, corner } = this.land, { bank, open } = this.ice, heights = new Float32Array(width * height).fill(NaN);
      for (let i = 0; i < heights.length; i++) if (bank[i] > 0 && bank[i] <= step && !open[i]) heights[i] = corner[i * 4] * LEVEL_HEIGHT + WATER_Y + LIFT;
      layer.setCells({ x: -margin, z: -margin, cell: 1, cols: width, rows: height, heights });
      this.shown = step;
    }
    layer.visible = true;
  }
}
