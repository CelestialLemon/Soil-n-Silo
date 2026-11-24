import * as THREE from 'three';
import { addDab, MeshBuilder, noise2, rng } from './builder.ts';
import { smooth } from './kit.ts';
import { addStalk, BLOOM_PAINT, CROP_NAMES, LEAF_PAINT, STANDS, type CropName, type Stand } from './plants.ts';
import { CRISP_EDGE } from '../renderer/dabs.ts';
import { terrainChunkCells } from '../land/heightfield.ts';
import type { LandRect } from '../land/map.ts';
import type { MaterialKind } from '../renderer/materials.ts';

// The game's crops on the continuous terrain (setTerrain; docs/API.md, the plant kit): a field painted from a mask of cells
// rather than laid tile by tile (CropPatch). The blanket's every point stands on the ground under it (heightAt), so a field
// on a rolling hill hugs it with no steps; its edge is where the mask's cells end, measured in the world (the distance to
// the nearest cell that isn't the crop, looked for out to EDGE_HALO across chunk lines too) and ragged by seeded painterly
// noise, as the farm demo's fields are (scenes/farm.ts, cropField), so a field drawn across two chunks meets itself with no
// seam and no square corners. Drawn in chunks of about 16 m (as the terrain's), each made again on its own when the
// field changes there, its old meshes taken out and freed.

/** How far (m) a field's edge is looked for round a point: past it a point is wholly in (or out of) the field. */
export const EDGE_HALO = 2;
/** The blanket's grid (m), and how far (m, as the edge's distance) past its ragged edge it runs on under the soil. */
const STEP = 0.5, KEEP = -0.3;

/**
 * Which crop grows in each cell of a grid, and how far along: `nx` by `nz` cells `cell` metres square from (x0, z0), x
 * fastest (as the terrain's). `crop` is 0 where none grows, else 1 + the crop's index in CROP_NAMES; `stage` its stage,
 * 0 just sown to 3 ripe (between two whole stages, the crop's look part way between them).
 */
export interface CropMask {
  nx: number; nz: number; cell: number; x0: number; z0: number;
  crop: Uint8Array;
  stage: Float32Array | Uint8Array;
}

export interface OrganicCropOptions {
  /** The ground's height (m) at a point: r.landAt. */
  heightAt: (x: number, z: number) => number;
  /** Cells a side of a chunk (terrainChunkCells by default: about 16 m). */
  chunkCells?: number;
  /** The rows' way across the field (radians about the vertical, as a yaw; 0 along x). */
  rows?: number;
  /** Its own seed: the ragged edges and the stalks', leaves' and flowers' places. */
  seed?: number;
}

/** What the field adds its meshes through: the renderer's add and remove. */
export interface CropAdder {
  add(geometry: THREE.BufferGeometry, kind: MaterialKind, options?: { castShadow?: boolean; seasonal?: boolean; cover?: 'none'; cull?: boolean }): THREE.Mesh;
  remove(mesh: THREE.Mesh): void;
}

/** The crop's code in a mask (1 + its index in CROP_NAMES). */
export const cropCode = (crop: CropName) => CROP_NAMES.indexOf(crop) + 1;

/**
 * How far (m) a point lies inside the field of the crop `code` (1 + its index in CROP_NAMES): to the nearest cell that
 * isn't it; outside, less than 0, how far to the nearest that is. Out to ±EDGE_HALO. In the world, so the same from either
 * chunk; before the edge's noise.
 */
export function cropEdgeDistance(m: CropMask, code: number, x: number, z: number): number {
  const c = m.cell, fx = (x - m.x0) / c, fz = (z - m.z0) / c, ix = Math.floor(fx), iz = Math.floor(fz);
  const at = (i: number, j: number) => (i < 0 || j < 0 || i >= m.nx || j >= m.nz ? 0 : m.crop[j * m.nx + i]);
  const inside = at(ix, iz) === code, r = Math.ceil(EDGE_HALO / c) + 1;
  let best = EDGE_HALO * EDGE_HALO;
  for (let j = iz - r; j <= iz + r; j++) {
    const az = m.z0 + j * c, dz = Math.max(az - z, 0, z - az - c);
    if (dz * dz >= best) continue;
    for (let i = ix - r; i <= ix + r; i++) {
      if ((at(i, j) === code) === inside) continue;
      const ax = m.x0 + i * c, dx = Math.max(ax - x, 0, x - ax - c), d = dx * dx + dz * dz;
      if (d < best) best = d;
    }
  }
  return inside ? Math.sqrt(best) : -Math.sqrt(best);
}

/** A chunk's meshes, as made (cropChunk): the blanket, the stalks and the leaves, flowers and fruit over it, each if any. */
export interface CropChunk { mass: MeshBuilder; stalks: MeshBuilder; dabs: MeshBuilder }

/** A crop's look at a stage between two whole ones: the two stands and how far between. */
const standsAt = (crop: number, stage: number): [Stand, Stand, number] => {
  const list = STANDS[CROP_NAMES[crop - 1]], s = Math.min(3, Math.max(0, stage)), a = Math.floor(s);
  return [list[a], list[Math.min(3, a + 1)], s - a];
};

/**
 * Paints one chunk of a mask's fields (chunk (cx, cz), `cc` cells a side), each crop in it a blanket of its own over the
 * ground. Plain: no renderer (OrganicCropField adds what this makes).
 */
export function cropChunk(m: CropMask, o: OrganicCropOptions, cx: number, cz: number): CropChunk {
  const cc = o.chunkCells ?? terrainChunkCells(m.cell), c = m.cell, seed = o.seed ?? 213, rows = o.rows ?? 0;
  const out: CropChunk = { mass: new MeshBuilder('crop'), stalks: new MeshBuilder('grass'), dabs: new MeshBuilder('foliage') };
  const i0 = cx * cc, j0 = cz * cc, i1 = Math.min(m.nx, i0 + cc), j1 = Math.min(m.nz, j0 + cc);
  if (i1 <= i0 || j1 <= j0) return out;
  // The crops in reach of the chunk (its fields' edges run on past their cells).
  const halo = Math.ceil((EDGE_HALO + 0.5) / c), codes = new Set<number>();
  for (let j = Math.max(0, j0 - halo); j < Math.min(m.nz, j1 + halo); j++) for (let i = Math.max(0, i0 - halo); i < Math.min(m.nx, i1 + halo); i++) {
    const k = m.crop[j * m.nx + i];
    if (k > 0 && k <= CROP_NAMES.length) codes.add(k);
  }
  const X0 = m.x0 + i0 * c, Z0 = m.z0 + j0 * c, X1 = m.x0 + i1 * c, Z1 = m.z0 + j1 * c;
  // The blanket's grid, on the world's half metres from the mask's corner, so neighbours share their seam's points.
  const a0 = Math.round((X0 - m.x0) / STEP), a1 = Math.round((X1 - m.x0) / STEP), b0 = Math.round((Z0 - m.z0) / STEP), b1 = Math.round((Z1 - m.z0) / STEP);
  const nu = a1 - a0 + 1, sinR = Math.sin(rows), cosR = Math.cos(rows), colour = new THREE.Color(), nrm = new THREE.Vector3();
  for (const code of [...codes].sort((p, q) => p - q)) {
    const f = fieldOf(m, o, code, seed);
    // Each point's edge distance, and its vertex once it's needed (only the field's quads are drawn).
    const edge = new Float32Array(nu * (b1 - b0 + 1)), vert = new Int32Array(edge.length).fill(-1);
    for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) edge[(b - b0) * nu + (a - a0)] = f.edge(m.x0 + a * STEP, m.z0 + b * STEP);
    const vertex = (a: number, b: number) => {
      const k = (b - b0) * nu + (a - a0);
      if (vert[k] >= 0) return vert[k];
      const x = m.x0 + a * STEP, z = m.z0 + b * STEP, d = edge[k], [s, t, w] = f.stand(x, z);
      const e = 0.25;
      nrm.set(f.top(x - e, z) - f.top(x + e, z), 2 * e, f.top(x, z - e) - f.top(x, z + e)).normalize();
      // Banded along its rows in its deeper colour, sunlit tips in patches, its foot's colour at its edge.
      const across = -x * sinR + z * cosR, along = x * cosR + z * sinR;
      const band = smooth(-0.35, 0.35, Math.sin(across * 1.7 * Math.PI) + 0.3 * noise2(along * 0.08, across * 0.3));
      const base = SCRATCH.a.copy(s.base).lerp(t.base, w), deep = SCRATCH.b.copy(s.deep).lerp(t.deep, w);
      const tip = SCRATCH.c.copy(s.tip).lerp(t.tip, w), root = SCRATCH.d.copy(s.root).lerp(t.root, w);
      colour.copy(base).lerp(deep, band * 0.6).lerp(tip, smooth(0.5, 0.9, noise2(x * 0.06 + 9, z * 0.09)) * 0.3)
        .lerp(root, (1 - smooth(0.1, 0.8, d)) * 0.35);
      return (vert[k] = out.mass.vertex({ x, y: f.top(x, z), z }, nrm, colour, [0.5, 1.3, rows, 0]));
    };
    for (let b = b0; b < b1; b++) for (let a = a0; a < a1; a++) {
      const k = (b - b0) * nu + (a - a0);
      if (edge[k] <= KEEP && edge[k + 1] <= KEEP && edge[k + nu] <= KEEP && edge[k + nu + 1] <= KEEP) continue;
      out.mass.quad(vertex(a, b), vertex(a, b + 1), vertex(a + 1, b + 1), vertex(a + 1, b));
    }
    // What stands on it, cell by cell (each cell's from its own seed, so a cell's plants are the same whichever chunk).
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      if (m.crop[j * m.nx + i] !== code) continue;
      const rand = rng((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(j + 1, 0x85ebca6b) ^ Math.imul(seed + code, 0xc2b2ae35)) >>> 0);
      plants(out, f, m.x0 + i * c, m.z0 + j * c, c, standsAt(code, m.stage[j * m.nx + i]), rand);
    }
  }
  return out;
}

/** A crop's field over a mask: its edge (with the noise), how tall it stands, its top, and its look, at any point. */
interface Field {
  edge(x: number, z: number): number;
  tall(x: number, z: number): number;
  top(x: number, z: number): number;
  stand(x: number, z: number): [Stand, Stand, number];
}

function fieldOf(m: CropMask, o: OrganicCropOptions, code: number, seed: number): Field {
  const sx = (seed % 97) * 3.1 + code * 17.3, sz = (seed % 89) * 2.3 - code * 11.1, c = m.cell;
  // Its stage at a point: the crop's cells' round it, blended between their middles (only the crop's own).
  const stage = (x: number, z: number) => {
    const fx = (x - m.x0) / c - 0.5, fz = (z - m.z0) / c - 0.5, ix = Math.floor(fx), iz = Math.floor(fz), u = fx - ix, v = fz - iz;
    let s = 0, w = 0;
    for (const [di, dj, k] of [[0, 0, (1 - u) * (1 - v)], [1, 0, u * (1 - v)], [0, 1, (1 - u) * v], [1, 1, u * v]]) {
      const i = ix + di, j = iz + dj;
      if (i < 0 || j < 0 || i >= m.nx || j >= m.nz || m.crop[j * m.nx + i] !== code || k <= 0) continue;
      s += m.stage[j * m.nx + i] * k; w += k;
    }
    if (w > 0) return s / w;
    // Off its cells (its edge running on past them): the nearest of its cells' round.
    const r = Math.ceil(EDGE_HALO / c) + 1, cx = Math.floor((x - m.x0) / c), cz = Math.floor((z - m.z0) / c);
    let best = Infinity, at = 0;
    for (let j = cz - r; j <= cz + r; j++) for (let i = cx - r; i <= cx + r; i++) {
      if (i < 0 || j < 0 || i >= m.nx || j >= m.nz || m.crop[j * m.nx + i] !== code) continue;
      const d = (i - cx) * (i - cx) + (j - cz) * (j - cz);
      if (d < best) { best = d; at = m.stage[j * m.nx + i]; }
    }
    return at;
  };
  const f: Field = {
    edge: (x, z) => cropEdgeDistance(m, code, x, z) + 0.3 * noise2(x * 0.45 + sx, z * 0.45 + sz) + 0.12 * noise2(x * 1.3 - sz, z * 1.3 + sx),
    stand: (x, z) => standsAt(code, stage(x, z)),
    tall: (x, z) => {
      const [s, t, w] = f.stand(x, z), tall = s.tall + (t.tall - s.tall) * w;
      return tall * smooth(0, 0.9, f.edge(x, z)) * (1 + 0.08 * noise2(x * 0.5, z * 0.5));
    },
    // (A little into the ground at its foot, so the edge sinks into the soil rather than standing on it.)
    top: (x, z) => o.heightAt(x, z) + f.tall(x, z) - 0.04,
  };
  return f;
}

/** A cell's stalks, leaves, flowers, fruit and heads, as CropPatch's (plants.ts), each on the ground under it. */
function plants(out: CropChunk, f: Field, cx: number, cz: number, side: number, [st0, st1, w]: [Stand, Stand, number], rand: () => number) {
  // Its things are its nearer whole stage's; its height between the two.
  const st = w < 0.5 ? st0 : st1, area = side * side;
  const spot = () => { const x = cx + rand() * side, z = cz + rand() * side; return { x, z, d: f.edge(x, z) }; };
  const ground = (x: number, z: number) => f.top(x, z) - f.tall(x, z) + 0.04;
  if (st.stalks) {
    for (let k = 0, n = Math.round(st.stalks * area * 2); k < n; k++) {
      const { x, z, d } = spot();
      if (d < 0.05 || (d > 0.8 && rand() > 0.35)) continue;
      addStalk(out.stalks, x, ground(x, z), z, f.tall(x, z) + st.tall * (0.05 + rand() * 0.15), st, rand, st.ears ?? false);
    }
  }
  if (st.plants && st.leaf) {
    for (let k = 0, n = Math.round(st.plants * area * 0.6); k < n; k++) {
      const { x, z, d } = spot();
      if (d < 0.1) continue;
      const top = f.top(x, z) + 0.04;
      for (let l = 0; l < 3; l++) {
        const dir = new THREE.Vector3(rand() - 0.5, 0.9, rand() - 0.5).normalize();
        const p = new THREE.Vector3(x + dir.x * st.leaf, top - st.leaf * (0.2 + rand() * 0.5), z + dir.z * st.leaf);
        const lit = smooth(0, 1, dir.y + (rand() - 0.5) * 0.4);
        const col = st.base.clone().lerp(st.tip, lit * 0.5).lerp(st.deep, (1 - lit) * 0.4).offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.05);
        addDab(out.dabs, p, dir, col, st.leaf * (0.8 + rand() * 0.4), rand(), LEAF_PAINT);
      }
    }
  }
  for (const bl of st.blooms ?? []) {
    for (let k = 0, n = Math.round(bl.per * area); k < n; k++) {
      const { x, z, d } = spot();
      if (d < 0.15) continue;
      const y = f.top(x, z) + 0.04 - (bl.sink ?? 0) * rand() + bl.size * 0.4;
      addDab(out.dabs, new THREE.Vector3(x, y, z), UP, bl.color.clone().offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.07),
        bl.size * (0.8 + rand() * 0.4), rand(), bl.shape ? [BLOOM_PAINT[0], bl.shape, Math.PI / 2 + (rand() - 0.5) * 0.4, 0.3] : BLOOM_PAINT);
    }
  }
  if (st.heads) {
    const h = st.heads;
    for (let k = 0, n = Math.round(h.per * area * 0.5); k < n; k++) {
      const { x, z, d } = spot();
      if (d < 0.2) continue;
      const g = ground(x, z), tall = f.tall(x, z), y = g + st.tall * smooth(0, 0.7, d) * (0.95 + rand() * 0.15);
      addStalk(out.stalks, x, g + tall * 0.7, z, y - g - tall * 0.7, st, rand, false);
      const p = new THREE.Vector3(x, y, z), face = new THREE.Vector3(0.6, 0.5, 0.3).normalize();
      addDab(out.dabs, p, face, h.petals.clone().offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.06), h.size * (0.85 + rand() * 0.3), rand(), [0.2 + CRISP_EDGE, 1, -1, 0.4]);
      addDab(out.dabs, p.clone().addScaledVector(face, h.size * 0.5), face, h.eye, h.size * 0.42, rand(), [0.1 + CRISP_EDGE, 1, -1, 0.1]);
    }
  }
}

/**
 * A mask's fields, painted (cropChunk) into the renderer chunk by chunk. `update` takes new values for a rectangle of the
 * mask's cells and paints again only the chunks within EDGE_HALO of it; `refit` paints again where the ground under the
 * fields moved; `dispose` takes it all out. Each chunk's meshes are freed as they're replaced.
 */
export class OrganicCropField {
  private readonly r: CropAdder;
  private readonly mask: CropMask;
  private readonly options: OrganicCropOptions;
  readonly chunkCells: number;
  private readonly cols: number;
  private readonly rowsCount: number;
  private readonly chunks = new Map<number, THREE.Mesh[]>();

  constructor(r: CropAdder, mask: CropMask, options: OrganicCropOptions) {
    const n = mask.nx * mask.nz;
    if (mask.crop.length !== n || mask.stage.length !== n) throw new Error(`OrganicCropField: a ${mask.nx} x ${mask.nz} mask has ${mask.crop.length} crops and ${mask.stage.length} stages`);
    this.r = r; this.options = options;
    this.mask = { ...mask, crop: Uint8Array.from(mask.crop), stage: Float32Array.from(mask.stage) };
    this.chunkCells = options.chunkCells ?? terrainChunkCells(mask.cell);
    this.cols = Math.ceil(mask.nx / this.chunkCells); this.rowsCount = Math.ceil(mask.nz / this.chunkCells);
    for (let k = 0; k < this.cols * this.rowsCount; k++) this.paint(k);
  }

  /** Every mesh the field has in the renderer now (the game's tools show through them: userData.crop). */
  get meshes(): THREE.Mesh[] { return [...this.chunks.values()].flat(); }

  /**
   * New crops and stages for the cells in `rect` (each array over the rectangle alone; one left out stays), painted again
   * at once in the chunks they reach. Returns how many chunks were painted again.
   */
  update(rect: LandRect, patch: { crop?: Uint8Array; stage?: Float32Array | Uint8Array }): number {
    const m = this.mask, n = rect.width * rect.height;
    if (rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0 || rect.x + rect.width > m.nx || rect.y + rect.height > m.nz) throw new Error('OrganicCropField.update: the rectangle is not inside the mask');
    if ((patch.crop && patch.crop.length !== n) || (patch.stage && patch.stage.length !== n)) throw new Error(`OrganicCropField.update: ${n} cells`);
    let changed = false;
    for (let j = 0; j < rect.height; j++) for (let i = 0; i < rect.width; i++) {
      const t = (rect.y + j) * m.nx + rect.x + i, k = j * rect.width + i;
      if (patch.crop && patch.crop[k] !== m.crop[t]) { m.crop[t] = patch.crop[k]; changed = true; }
      if (patch.stage && patch.stage[k] !== m.stage[t]) { m.stage[t] = patch.stage[k]; changed = true; }
    }
    return changed ? this.refit(rect) : 0;
  }

  /** Paints again the chunks within EDGE_HALO of `rect` (cells): after the ground moved under the fields there. */
  refit(rect: LandRect): number {
    const halo = Math.ceil((EDGE_HALO + 0.5) / this.mask.cell) + 1, cc = this.chunkCells;
    const x0 = Math.max(0, rect.x - halo), y0 = Math.max(0, rect.y - halo);
    const x1 = Math.min(this.mask.nx, rect.x + rect.width + halo), y1 = Math.min(this.mask.nz, rect.y + rect.height + halo);
    let count = 0;
    for (let cz = Math.floor(y0 / cc); cz <= Math.floor((y1 - 1) / cc); cz++) for (let cx = Math.floor(x0 / cc); cx <= Math.floor((x1 - 1) / cc); cx++) {
      this.paint(cz * this.cols + cx);
      count++;
    }
    return count;
  }

  /** Takes the field's meshes out of the renderer, and frees them. */
  dispose() {
    for (const k of [...this.chunks.keys()]) this.clear(k);
  }

  private clear(k: number) {
    for (const mesh of this.chunks.get(k) ?? []) { this.r.remove(mesh); mesh.geometry.dispose(); }
    this.chunks.delete(k);
  }

  private paint(k: number) {
    this.clear(k);
    const c = cropChunk(this.mask, { ...this.options, chunkCells: this.chunkCells }, k % this.cols, Math.floor(k / this.cols));
    const meshes: THREE.Mesh[] = [];
    if (c.mass.vertexCount) meshes.push(this.r.add(c.mass.build(), 'crop', { cull: true }));
    // The crop's own colour, not the season's (as CropPatch's).
    if (c.stalks.vertexCount) meshes.push(this.r.add(c.stalks.build(), 'grass', { castShadow: false, seasonal: false, cull: true }));
    if (c.dabs.vertexCount) meshes.push(this.r.add(c.dabs.build(), 'foliage', { castShadow: false, cover: 'none', cull: true }));
    for (const mesh of meshes) mesh.userData.crop = true;
    if (meshes.length) this.chunks.set(k, meshes);
  }
}

const UP = new THREE.Vector3(0, 1, 0);
const SCRATCH = { a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color(), d: new THREE.Color() };
