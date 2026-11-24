// The crops: the player's painted fields (the game's fieldOf and fields) drawn as brush3d's organic crop blanket
// (OrganicCropField), lush and nearly ripe, each cell's stage a touch different so a field ripples rather than reads as a
// flat colour. A painted or erased field paints again only the chunks it reaches; the ground moving under a field (an
// earthwork beside it) fits them again once brush3d swaps the new land in.
import { type BrushRenderer, cropCode, type CropMask, type LandArea, noise2, OrganicCropField } from '../../brush3d/src/index.ts';
import type { Change, GameState, Rect } from '../game/index.ts';
import { landRectOf, rectOfArea } from './util.ts';

/** How ripe the crops stand: 0.75 to 0.92 of ripe (stage 3), by a slow drift over the valley. */
const RIPE_LOW = 0.75, RIPE_HIGH = 0.92;

export class Fields {
  private readonly r: BrushRenderer;
  private state: GameState;
  private field: OrganicCropField;
  private readonly stopLand: () => void;

  constructor(r: BrushRenderer, state: GameState) {
    this.r = r; this.state = state;
    this.field = this.build();
    this.stopLand = r.onLandChange((area) => this.landSwapped(area));
  }

  reset(state: GameState) {
    this.field.dispose();
    this.state = state;
    this.field = this.build();
  }

  /** Paints again the chunks a field edit reached. */
  sync(change: Change) {
    const rect = change.fields;
    if (!rect) return;
    const g = this.state.grid;
    const c = { x0: Math.max(0, rect.x0), z0: Math.max(0, rect.z0), x1: Math.min(g.nx - 1, rect.x1), z1: Math.min(g.nz - 1, rect.z1) };
    if (c.x0 > c.x1 || c.z0 > c.z1) return;
    const land = landRectOf(c), crop = new Uint8Array(land.width * land.height), stage = new Float32Array(land.width * land.height);
    for (let j = 0; j < land.height; j++) for (let i = 0; i < land.width; i++) {
      const ix = land.x + i, iz = land.y + j, o = j * land.width + i;
      crop[o] = this.cropAt(ix, iz); stage[o] = this.stageAt(ix, iz);
    }
    this.field.update(land, { crop, stage });
  }

  dispose() {
    this.stopLand();
    this.field.dispose();
  }

  private build(): OrganicCropField {
    const g = this.state.grid, n = g.nx * g.nz, crop = new Uint8Array(n), stage = new Float32Array(n);
    for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
      const k = iz * g.nx + ix;
      crop[k] = this.cropAt(ix, iz); stage[k] = this.stageAt(ix, iz);
    }
    const mask: CropMask = { nx: g.nx, nz: g.nz, cell: g.cell, x0: g.x0, z0: g.z0, crop, stage };
    const rows = ((this.state.seed % 360) / 360) * Math.PI;
    return new OrganicCropField(this.r, mask, { heightAt: (x, z) => this.r.landAt(x, z), rows, seed: this.state.seed });
  }

  /** The crop's code in a cell (0: none). */
  private cropAt(ix: number, iz: number): number {
    const g = this.state.grid, id = g.fieldOf[iz * g.nx + ix];
    if (id === 0) return 0;
    const f = this.state.fields.find((o) => o.id === id);
    return f ? cropCode(f.crop) : 0;
  }

  /** How far along a cell's crop is (0 sown .. 3 ripe). */
  private stageAt(ix: number, iz: number): number {
    const t = 0.5 + 0.5 * noise2(ix * 0.11 + 5.3, iz * 0.11 - 2.1);
    return 3 * (RIPE_LOW + (RIPE_HIGH - RIPE_LOW) * t);
  }

  /** The ground moved under fields: their chunks there are fitted to it again. */
  private landSwapped(area: LandArea) {
    const rect = rectOfArea(this.state.grid, area);
    if (rect && this.anyCrop(rect)) this.field.refit(landRectOf(rect));
  }

  private anyCrop(rect: Rect): boolean {
    const g = this.state.grid, halo = 3;
    for (let iz = Math.max(0, rect.z0 - halo); iz <= Math.min(g.nz - 1, rect.z1 + halo); iz++) {
      for (let ix = Math.max(0, rect.x0 - halo); ix <= Math.min(g.nx - 1, rect.x1 + halo); ix++) if (g.fieldOf[iz * g.nx + ix] !== 0) return true;
    }
    return false;
  }
}
