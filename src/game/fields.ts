// Painted fields: the player brushes irregular patches of a crop onto clear, gentle ground; each connected patch of one
// crop is a field. Painting over a field of the other crop takes those cells; erasing can split a field in two.
import { CATALOG } from './catalog.ts';
import type { Change } from './change.ts';
import { obbDistance, type Point2, polylineDistance, resample } from './geom.ts';
import { addCell, BUILD_HALF, cellX, cellZ, COVER, type Grid, type Rect, slopeAt, unionRect } from './grid.ts';
import { recomposeCover, thingObb } from './earth.ts';
import { fieldYield, soilFertility, SOWN_GROWTH } from './crops.ts';
import { err, ok, type Result } from './result.ts';
import { CROPS, type Crop, type Field, type GameState } from './state.ts';

/** The steepest ground a field takes. */
export const FIELD_MAX_SLOPE = 0.3;
export const MAX_BRUSH = 8;
/** How close to a tree's trunk or a hedge a field may come, m. */
const TREE_CLEAR = 1.2, HEDGE_CLEAR = 0.6;

const cropCode = (c: Crop) => CROPS.indexOf(c) + 1;

/** Each cell's crop code (0 none, 1 + index in CROPS). */
function cropCells(s: GameState): Uint8Array {
  const g = s.grid, codes = new Map(s.fields.map((f) => [f.id, cropCode(f.crop)]));
  const out = new Uint8Array(g.nx * g.nz);
  for (let i = 0; i < out.length; i++) if (g.fieldOf[i] !== 0) out[i] = codes.get(g.fieldOf[i]) ?? 0;
  return out;
}

/** Whether a field may grow on a cell: clear, gentle, open ground (solar canopies may stand over it). */
export function fieldAllowed(s: GameState, ix: number, iz: number): boolean {
  const g = s.grid, x = cellX(g, ix), z = cellZ(g, iz), i = iz * g.nx + ix;
  if (Math.abs(x) > BUILD_HALF + 1 || Math.abs(z) > BUILD_HALF + 1) return false;
  const c = g.cover[i];
  if (c !== COVER.grass && c !== COVER.bare && c !== COVER.field) return false;
  if (slopeAt(g, x, z) > FIELD_MAX_SLOPE) return false;
  for (const t of s.things) if (!CATALOG[t.kind].allowOnField && obbDistance(thingObb(t), x, z) <= 0) return false;
  for (const c2 of s.crags) if (Math.hypot(x - c2.x, z - c2.z) <= c2.radius) return false;
  for (const t of s.wildTrees) if (Math.hypot(x - t.x, z - t.z) <= TREE_CLEAR * t.scale) return false;
  for (const t of s.plantedTrees) if (Math.hypot(x - t.x, z - t.z) <= TREE_CLEAR * t.scale) return false;
  for (const h of s.hedges) if (polylineDistance(x, z, h.path).d <= HEDGE_CLEAR) return false;
  return true;
}

/** The cells a brush stroke touches: within `radius` of the stroke. */
function strokeCells(g: Grid, points: readonly Point2[], radius: number, fn: (ix: number, iz: number) => void) {
  const path = points.length > 1 ? resample(points, 0.5) : [...points];
  if (path.length === 0) return;
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const p of path) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
  const ix0 = Math.max(0, Math.floor((minX - radius - g.x0) / g.cell)), ix1 = Math.min(g.nx - 1, Math.floor((maxX + radius - g.x0) / g.cell));
  const iz0 = Math.max(0, Math.floor((minZ - radius - g.z0) / g.cell)), iz1 = Math.min(g.nz - 1, Math.floor((maxZ + radius - g.z0) / g.cell));
  for (let iz = iz0; iz <= iz1; iz++) for (let ix = ix0; ix <= ix1; ix++)
    if (polylineDistance(cellX(g, ix), cellZ(g, iz), path).d <= radius) fn(ix, iz);
}

function checkStroke(points: readonly Point2[], radius: number): Result<void, string> {
  if (points.length === 0) return err('Nothing to paint.');
  if (!(radius > 0) || radius > MAX_BRUSH) return err(`The brush must be between 0 and ${MAX_BRUSH} m.`);
  if (points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.z))) return err('That stroke left the valley.');
  return ok(undefined);
}

export interface FieldEdit { fieldRect?: Rect; coverRect?: Rect; fieldIds: number[] }

/** Paints a crop onto the clear ground under a brush stroke. */
export function paintField(s: GameState, crop: Crop, points: readonly Point2[], radius: number): Result<FieldEdit, string> {
  if (!CROPS.includes(crop)) return err(`There's no crop called ${String(crop)}.`);
  const bad = checkStroke(points, radius);
  if (!bad.ok) return bad;
  const g = s.grid, crops = cropCells(s), code = cropCode(crop);
  let painted = 0, already = 0;
  strokeCells(g, points, radius, (ix, iz) => {
    const i = iz * g.nx + ix;
    if (crops[i] === code) { already++; return; }
    if (!fieldAllowed(s, ix, iz)) return;
    crops[i] = code;
    painted++;
  });
  if (painted === 0 && already === 0) return err('Nothing there to plant: fields need clear, gentle ground.');
  if (painted === 0) return ok({ fieldIds: [] });
  return ok(relabel(s, crops));
}

/** Clears fields under a brush stroke. */
export function eraseField(s: GameState, points: readonly Point2[], radius: number): Result<FieldEdit, string> {
  const bad = checkStroke(points, radius);
  if (!bad.ok) return bad;
  const g = s.grid, crops = cropCells(s);
  let erased = 0;
  strokeCells(g, points, radius, (ix, iz) => { const i = iz * g.nx + ix; if (crops[i] !== 0) { crops[i] = 0; erased++; } });
  if (erased === 0) return err('No field there to clear.');
  return ok(relabel(s, crops));
}

/** Clears field cells the ground no longer suits (under a new rill or track): returns what changed, if anything. */
export function pruneFields(s: GameState, rect: Rect): FieldEdit | undefined {
  const g = s.grid, crops = cropCells(s);
  let pruned = 0;
  for (let iz = rect.z0; iz <= rect.z1; iz++) for (let ix = rect.x0; ix <= rect.x1; ix++) {
    const i = iz * g.nx + ix;
    if (crops[i] !== 0 && g.cover[i] !== COVER.field && g.cover[i] !== COVER.grass && g.cover[i] !== COVER.bare) { crops[i] = 0; pruned++; }
  }
  return pruned > 0 ? relabel(s, crops) : undefined;
}

/**
 * Turns the cells' crops into fields: each 4-connected patch of one crop is a field, keeping the id of the old field it
 * overlaps most (so painting onto a field grows it, and erasing it in two keeps the id on the larger part).
 */
function relabel(s: GameState, crops: Uint8Array): FieldEdit {
  const g = s.grid, n = g.nx * g.nz, label = new Int32Array(n).fill(-1);
  const comps: { crop: number; cells: number[] }[] = [];
  for (let start = 0; start < n; start++) {
    if (crops[start] === 0 || label[start] >= 0) continue;
    const crop = crops[start], cells = [start], id = comps.length;
    label[start] = id;
    for (let k = 0; k < cells.length; k++) {
      const i = cells[k], ix = i % g.nx, iz = (i - ix) / g.nx;
      const next = [ix > 0 ? i - 1 : -1, ix < g.nx - 1 ? i + 1 : -1, iz > 0 ? i - g.nx : -1, iz < g.nz - 1 ? i + g.nx : -1];
      for (const j of next) if (j >= 0 && label[j] < 0 && crops[j] === crop) { label[j] = id; cells.push(j); }
    }
    comps.push({ crop, cells });
  }
  // Keep ids: each old field goes to the patch of its crop it overlaps most, biggest overlaps first.
  const oldCrop = new Map(s.fields.map((f) => [f.id, cropCode(f.crop)]));
  const overlaps: { comp: number; id: number; count: number }[] = [];
  comps.forEach((c, k) => {
    const counts = new Map<number, number>();
    for (const i of c.cells) { const id = g.fieldOf[i]; if (id !== 0 && oldCrop.get(id) === c.crop) counts.set(id, (counts.get(id) ?? 0) + 1); }
    for (const [id, count] of counts) overlaps.push({ comp: k, id, count });
  });
  overlaps.sort((a, b) => b.count - a.count || a.id - b.id || a.comp - b.comp);
  const idOf = new Array<number>(comps.length).fill(0), used = new Set<number>();
  for (const o of overlaps) if (idOf[o.comp] === 0 && !used.has(o.id)) { idOf[o.comp] = o.id; used.add(o.id); }
  let next = 1;
  const fresh = () => { while (used.has(next)) next++; used.add(next); return next; };
  comps.forEach((_c, k) => { if (idOf[k] === 0) idOf[k] = fresh(); });

  // A cell changed if its field's id or its crop did: painting the other crop over all of a field keeps the field's id
  // (it is still the patch it overlaps most) but changes what grows there, which must be drawn again.
  let dirty: Rect | undefined;
  const fieldOf = new Uint16Array(n), was = cropCells(s);
  comps.forEach((c, k) => { for (const i of c.cells) fieldOf[i] = idOf[k]; });
  for (let i = 0; i < n; i++) {
    if (fieldOf[i] !== g.fieldOf[i] || crops[i] !== was[i]) { const ix = i % g.nx; dirty = addCell(dirty, ix, (i - ix) / g.nx); }
  }
  const before = new Map(s.fields.map((f) => [f.id, f]));
  g.fieldOf.set(fieldOf);
  s.fields = comps.map((c, k) => fieldOf2(g, idOf[k], CROPS[c.crop - 1], c.cells, before.get(idOf[k]))).sort((a, b) => a.id - b.id);
  if (dirty) recomposeCover(s, dirty);
  const changed = s.fields.filter((f) => { const b = before.get(f.id); return !b || b.cellCount !== f.cellCount || b.crop !== f.crop; }).map((f) => f.id);
  for (const id of before.keys()) if (!s.fields.some((f) => f.id === id)) changed.push(id);
  return { fieldRect: dirty, coverRect: dirty, fieldIds: changed.sort((a, b) => a - b) };
}

/**
 * A field over these cells. One that keeps an old field's id keeps how its crop was doing (its growth, its soil and any
 * harvest waiting, trimmed to what its new size yields); a new field, or one painted over with the other crop, is sown
 * fresh, its fertility the soil's under it.
 */
function fieldOf2(g: Grid, id: number, crop: Crop, cells: number[], was: Field | undefined): Field {
  let bounds: Rect | undefined, wet = 0;
  for (const i of cells) { const ix = i % g.nx; bounds = addCell(bounds, ix, (i - ix) / g.nx); wet += g.moisture[i]; }
  const areaM2 = cells.length * g.cell * g.cell, kept = was?.crop === crop ? was : undefined;
  const fertility = was ? was.fertility : soilFertility(g, cells);
  const f: Field = {
    id, crop, cellCount: cells.length, areaM2, avgMoisture: cells.length > 0 ? wet / cells.length : 0,
    bounds: bounds ?? { x0: 0, z0: 0, x1: -1, z1: -1 },
    growth: kept ? kept.growth : SOWN_GROWTH, fertility, harvestReady: 0,
  };
  if (kept && kept.harvestReady > 0) f.harvestReady = Math.min(kept.harvestReady, fieldYield(f));
  return f;
}

/** Recomputes each field's mean moisture (after the water changes). */
export function updateFieldMoisture(s: GameState): void {
  const g = s.grid, sums = new Map<number, number>();
  for (let i = 0; i < g.fieldOf.length; i++) { const id = g.fieldOf[i]; if (id !== 0) sums.set(id, (sums.get(id) ?? 0) + g.moisture[i]); }
  for (const f of s.fields) f.avgMoisture = f.cellCount > 0 ? (sums.get(f.id) ?? 0) / f.cellCount : 0;
}

/** Records a field edit into a change. */
export function noteFields(change: Change, edit: FieldEdit | undefined): void {
  if (!edit) return;
  change.fields = unionRect(change.fields, edit.fieldRect);
  change.cover = unionRect(change.cover, edit.coverRect);
}
