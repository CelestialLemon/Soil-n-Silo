// The crops: the player's painted fields (the game's fieldOf and fields) drawn as brush3d's organic crop blanket
// (OrganicCropField), each at the stage the game grows it to (cropStage): fresh sprouts when sown, tall and lush as it
// grows, golden once ripe, and sprouts again once an Electric Cart carries the harvest away. A field's stage is drawn in
// GROWTH_STEPS even steps, and a field is painted again only when its step moves on (a few times a game day), so growing
// costs nothing between. Each cell's stage is a touch different, so a field ripples rather than reads as a flat colour. A
// painted or erased field paints again only the chunks it reaches; the ground moving under a field (an earthwork beside
// it) fits them again once brush3d swaps the new land in.
import { type BrushRenderer, cropCode, type CropMask, type LandArea, noise2, OrganicCropField } from '../../brush3d/src/index.ts';
import { type Change, clamp, cropStage, type Field, type GameState, type Rect } from '../game/index.ts';
import { landRectOf, rectOfArea } from './util.ts';

/** The steps a field's look grows through, from sown (0) to ripe (GROWTH_STEPS). */
export const GROWTH_STEPS = 8;
/** The game's last stage (cropStage: 0..20 growing, 21 ripe and waiting for a cart). */
const RIPE_STAGE = 21;
/** brush3d's ripe stage (CropMask: 0 just sown .. 3 ripe). */
const BRUSH_RIPE = 3;
/** How far a cell's stage strays from its field's (brush3d stages): the ripple across a field. */
const RIPPLE = 0.22;

/** A field's step (0..GROWTH_STEPS) from the game's stage. */
export const growthStep = (f: Pick<Field, 'growth' | 'harvestReady'>) => Math.round((cropStage(f) / RIPE_STAGE) * GROWTH_STEPS);

export class Fields {
  private readonly r: BrushRenderer;
  private state: GameState;
  private field: OrganicCropField;
  private readonly stopLand: () => void;
  /** Each field's step as drawn, by its id. */
  private readonly steps = new Map<number, number>();

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
    // Fields that stepped on meanwhile first, so what's painted here is as they stand.
    this.syncGrowth();
    this.paint(rect);
  }

  /**
   * The crops grew (a sim tick): paints again only the fields whose drawn step moved on (ripened, harvested and sown
   * again, or grew a step). Returns how many fields it painted again.
   */
  syncGrowth(): number {
    let n = 0;
    const live = new Set<number>();
    for (const f of this.state.fields) {
      live.add(f.id);
      const step = growthStep(f);
      if (this.steps.get(f.id) === step) continue;
      this.steps.set(f.id, step);
      this.paint(f.bounds);
      n++;
    }
    for (const id of [...this.steps.keys()]) if (!live.has(id)) this.steps.delete(id);
    return n;
  }

  dispose() {
    this.stopLand();
    this.field.dispose();
  }

  /** Paints again the cells of a rect, as the fields stand now. */
  private paint(rect: Rect) {
    const g = this.state.grid;
    const c = { x0: Math.max(0, rect.x0), z0: Math.max(0, rect.z0), x1: Math.min(g.nx - 1, rect.x1), z1: Math.min(g.nz - 1, rect.z1) };
    if (c.x0 > c.x1 || c.z0 > c.z1) return;
    const land = landRectOf(c), crop = new Uint8Array(land.width * land.height), stage = new Float32Array(land.width * land.height);
    for (let j = 0; j < land.height; j++) for (let i = 0; i < land.width; i++) {
      const ix = land.x + i, iz = land.y + j, o = j * land.width + i, f = this.fieldAt(ix, iz);
      crop[o] = f ? cropCode(f.crop) : 0; stage[o] = f ? this.stageAt(f, ix, iz) : 0;
    }
    this.field.update(land, { crop, stage });
  }

  /** A field's step as drawn (a field new since: as it stands now, noted). */
  private stepOf(f: Field): number {
    let step = this.steps.get(f.id);
    if (step === undefined) { step = growthStep(f); this.steps.set(f.id, step); }
    return step;
  }

  private build(): OrganicCropField {
    this.steps.clear();
    const g = this.state.grid, n = g.nx * g.nz, crop = new Uint8Array(n), stage = new Float32Array(n);
    for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
      const k = iz * g.nx + ix, f = this.fieldAt(ix, iz);
      if (!f) continue;
      crop[k] = cropCode(f.crop); stage[k] = this.stageAt(f, ix, iz);
    }
    const mask: CropMask = { nx: g.nx, nz: g.nz, cell: g.cell, x0: g.x0, z0: g.z0, crop, stage };
    const rows = ((this.state.seed % 360) / 360) * Math.PI;
    return new OrganicCropField(this.r, mask, { heightAt: (x, z) => this.r.landAt(x, z), rows, seed: this.state.seed });
  }

  /** The field in a cell, if any. */
  private fieldAt(ix: number, iz: number): Field | undefined {
    const g = this.state.grid, id = g.fieldOf[iz * g.nx + ix];
    return id === 0 ? undefined : this.state.fields.find((o) => o.id === id);
  }

  /** How far along a cell's crop is drawn (brush3d's 0 sown .. 3 ripe): its field's step, with a little ripple. */
  private stageAt(f: Field, ix: number, iz: number): number {
    const step = this.stepOf(f), base = (step / GROWTH_STEPS) * BRUSH_RIPE;
    const ripple = noise2(ix * 0.11 + 5.3, iz * 0.11 - 2.1) * RIPPLE;
    // Ripe stands ripe all over (the ripple only ever holds a cell back a touch); sown stands sown.
    return step >= GROWTH_STEPS ? clamp(BRUSH_RIPE - Math.abs(ripple) * 0.5, 0, BRUSH_RIPE) : clamp(base + ripple, 0, BRUSH_RIPE - 0.25);
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
