import * as THREE from 'three';
import { MeshBuilder, noise2 } from '../kit/builder.ts';
import { LAND_COVER, type Beyond, type LandRect } from './map.ts';
import { checkTerrain, checkTerrainPatch, hitHeightfield, sampleHeightfield, terrainChunkCells, type TerrainMap, type TerrainPatch } from './heightfield.ts';
import { COL, GROUND_TINT, LAND_LOOK, PAINT, STEP_BUDGET, type LandAdder, type LandArea, type LandLook } from './paint.ts';

// The continuous terrain painted from the game's heights (setTerrain, docs/API.md, docs/LAND.md): beside the tiled land
// (paint.ts), which fits a smooth surface to the rules' whole levels, sinks the water's tiles into a bed and cuts each
// tile finely, this draws exactly the heights it's given, two triangles a cell split as sampleHeightfield splits them,
// so what the game stands on its own heights sits on what's drawn. Nothing is subtracted: the game's heights already hold
// its brooks' beds, its ponds' basins, its rills' cuts and its pads.
//
// It's painted as the tiled land is (the same colours, ground tints, dryness, meadow drift, steep wear, damp banks and
// the country's dullness round the map, from paint.ts), by place rather than by tile: a cover's edge wanders a little, so
// it's a painted edge, not the grid's; the water's and the rills' beds take the cells within a metre of them, and the banks
// round them go damp. The country past it (`beyond`) is the tiled land's coarse floor of distant woods.
//
// It's drawn in chunks of about 16 m (terrainChunkCells), each one ground mesh. A change (updateTerrain) is painted again
// only in the chunks round it, a little each frame within STEP_BUDGET (step), and swapped in all together once they're all
// painted, as the tiled land's earthworks are.

/** How far (m) the terrain's outer edge is skirted down, so no crack shows between it and the country beyond. */
const SKIRT = 3;
/** How far (m) the beds' paint reaches past their cells, the banks' damp reaches up from them, and a pond deepens in. */
const BED_REACH = 0.8, DAMP_REACH = 2.5, DEEP_REACH = 3;
/** How far (m) the dryness is blurred, each way, and how far from water ground is still lush (m, as the tiled land's 4 tiles). */
const DRY_BLUR = 12, DRY_FROM_WATER = 16;
/** The least change to a cell's paint (linear RGB, or its share of the meadow's drift) its chunk is painted again for. */
const PAINT_SHOWS = 1 / 512;
/** The border between the map and the duller country (m): as the tiled land's BORDER, in metres. */
const BORDER = { near: 3.2, far: 12, wave: 24, rag: 1.4 };
/** Over how many of its cells the country beyond fades from the terrain's colour at its edge to its own (as paint.ts's). */
const APRON_BLEND = 3;
/** The terrain's own colours, beside the tiled land's: worked earth, a rill's damp bed and its pebbles. */
const SOIL = new THREE.Color(0x8a6a48), RILL_BED = new THREE.Color(0x5a4a34), PEBBLE = new THREE.Color(0x8e8676);

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const isBed = (c: number) => c === LAND_COVER.water || c === LAND_COVER.rill;
/** A rill cell's neighbours its line runs on to (rillDistance): east, south, and both ways diagonally (each pair once). */
const RILL_LINKS: [number, number][] = [[1, 0], [0, 1], [1, 1], [-1, 1]];

/** A window of cells, [x0, x1) × [y0, y1). */
interface Window { x0: number; y0: number; x1: number; y1: number }
const grown = (w: Window | null, x0: number, y0: number, x1: number, y1: number): Window => w
  ? { x0: Math.min(w.x0, x0), y0: Math.min(w.y0, y0), x1: Math.max(w.x1, x1), y1: Math.max(w.y1, y1) }
  : { x0, y0, x1, y1 };

/** The terrain as painted, from the game's heights. */
export class TerrainLand {
  readonly nx: number;
  readonly nz: number;
  readonly cell: number;
  readonly x0: number;
  readonly z0: number;
  /** Cells a side of a chunk. */
  readonly chunkCells: number;
  private readonly map: LandRect;
  private readonly look: LandLook;
  private readonly adder: LandAdder;
  private readonly height: Float32Array;
  private readonly cover: Uint8Array;
  private readonly ground: Uint8Array;
  private readonly worked: Uint8Array;
  /** Each cell's paint as land (linear RGB, and how much of the meadow's drift it takes), and the one on screen. */
  private readonly paint: Float32Array;
  private readonly drawnPaint: Float32Array;
  /** How dry each cell lies (0 lush to 1 dry); how far each is from water (m); before the blur; blurred along its row. */
  private readonly dry: Float32Array;
  private readonly wet: Float32Array;
  private readonly raw: Float32Array;
  private readonly rowDry: Float32Array;
  private readonly cols: number;
  private readonly chunks: (THREE.Mesh | null)[];
  private readonly geometries: (THREE.BufferGeometry | null)[];
  /** The chunks still to paint for a change, and those painted and waiting to be swapped in together. */
  private readonly pending = new Set<number>();
  private readonly built = new Map<number, THREE.BufferGeometry | null>();
  private apronMoved = false;
  private changed: Window | null = null;
  /** Counts the changes swapped in. */
  revision = 0;
  /** Whether heightAt answers for a change that isn't drawn yet (its chunks still being painted). */
  ahead = false;
  /** Called as a change is swapped in, with where (m) the terrain's height or paint may have changed. */
  onSwap: ((area: LandArea) => void) | null = null;
  private readonly beyond: Beyond | null;
  private readonly apronAt: { xs: number[]; zs: number[] } | null;
  private apron: THREE.Mesh | null = null;
  private apronGeometry: THREE.BufferGeometry | null = null;
  private readonly fields: { x: number; z: number; side: number; turn: number };
  /** The lowest and highest the terrain and the country are drawn (m), for tracing a line of sight over the country. */
  private low = 0;
  private high = 0;

  constructor(adder: LandAdder, m: TerrainMap, look: LandLook = LAND_LOOK) {
    checkTerrain(m);
    this.adder = adder; this.look = look;
    this.nx = m.nx; this.nz = m.nz; this.cell = m.cell; this.x0 = m.x0; this.z0 = m.z0;
    this.chunkCells = terrainChunkCells(m.cell);
    const n = m.nx * m.nz;
    this.map = m.map ? { ...m.map } : { x: 0, y: 0, width: m.nx, height: m.nz };
    this.beyond = m.beyond ?? null;
    this.height = Float32Array.from(m.height);
    this.cover = Uint8Array.from(m.cover);
    this.ground = m.ground ? Uint8Array.from(m.ground) : new Uint8Array(n);
    this.worked = m.worked ? Uint8Array.from(m.worked) : new Uint8Array(n);
    this.dry = new Float32Array(n); this.wet = new Float32Array(n); this.raw = new Float32Array(n); this.rowDry = new Float32Array(n);
    this.paint = new Float32Array(n * 4);
    this.repaint();
    this.drawnPaint = this.paint.slice();
    this.bounds();
    const w = m.nx * m.cell, h = m.nz * m.cell;
    this.fields = { x: m.x0 + w / 2, z: m.z0 + h / 2, side: Math.max(w, h), turn: 0 };
    this.apronAt = this.apronLines();
    this.cols = Math.ceil(m.nx / this.chunkCells);
    const rows = Math.ceil(m.nz / this.chunkCells);
    this.chunks = new Array<THREE.Mesh | null>(this.cols * rows).fill(null);
    this.geometries = new Array<THREE.BufferGeometry | null>(this.cols * rows).fill(null);
    adder.changeGround(null, () => {
      for (let k = 0; k < this.chunks.length; k++) this.setChunk(k, this.chunkGeometry(k));
      this.addApron();
    });
  }

  /** Takes the terrain's meshes out of the scene, and frees them. */
  dispose() {
    this.adder.changeGround(null, () => {
      for (let k = 0; k < this.chunks.length; k++) this.setChunk(k, null);
      this.addApron(false);
    });
    for (const g of this.built.values()) g?.dispose();
    this.pending.clear(); this.built.clear();
  }

  /**
   * A change to the terrain (an earthwork, a rill dug, a field worked): the new values for the cells in `rect` (cells),
   * lined up to be painted over the next frames (step). heightAt and hit answer for it at once (ahead), the picture once
   * it's swapped in. Returns how many cells changed.
   */
  update(rect: LandRect, p: TerrainPatch): number {
    checkTerrainPatch(this, rect, p);
    const NX = this.nx, NZ = this.nz, row = NX + 1, moved = new Uint8Array(NX * NZ);
    let shape: Window | null = null, beds: Window | null = null, changed = 0, any: Window | null = null;
    if (p.height) for (let j = 0; j <= rect.height; j++) for (let i = 0; i <= rect.width; i++) {
      const vx = rect.x + i, vz = rect.y + j, v = p.height[j * (rect.width + 1) + i];
      if (v === this.height[vz * row + vx]) continue;
      this.height[vz * row + vx] = v;
      // The cells round the corner.
      for (const [cx, cz] of [[vx - 1, vz - 1], [vx, vz - 1], [vx - 1, vz], [vx, vz]]) if (cx >= 0 && cz >= 0 && cx < NX && cz < NZ) moved[cz * NX + cx] = 1;
      shape = grown(shape, vx - 1, vz - 1, vx + 1, vz + 1);
    }
    for (let j = 0; j < rect.height; j++) for (let i = 0; i < rect.width; i++) {
      const x = rect.x + i, y = rect.y + j, t = y * NX + x, k = j * rect.width + i;
      let cellChanged = moved[t] === 1;
      if (p.cover && p.cover[k] !== this.cover[t]) {
        if (isBed(p.cover[k]) || isBed(this.cover[t])) beds = grown(beds, x, y, x + 1, y + 1);
        this.cover[t] = p.cover[k]; cellChanged = true;
      }
      if (p.ground && p.ground[k] !== this.ground[t]) { this.ground[t] = p.ground[k]; cellChanged = true; }
      if (p.worked && p.worked[k] !== this.worked[t]) { this.worked[t] = p.worked[k]; cellChanged = true; }
      if (cellChanged) { changed++; any = grown(any, x, y, x + 1, y + 1); }
    }
    for (let t = 0; t < moved.length; t++) if (moved[t] && !(t % NX >= rect.x && t % NX < rect.x + rect.width && Math.floor(t / NX) >= rect.y && Math.floor(t / NX) < rect.y + rect.height)) {
      changed++; any = grown(any, t % NX, Math.floor(t / NX), t % NX + 1, Math.floor(t / NX) + 1);
    }
    if (changed === 0 || !any) return 0;
    if (shape) this.bounds();
    // The paint follows the height (its dryness) and the water: the cells whose paint that changes, too.
    const was = this.paint.slice();
    this.repaint();
    let painted: Window | null = null;
    // (Only by more than shows: the dryness blurs over DRY_BLUR, and a small cut moves it a hair over many metres.)
    for (let t = 0; t < NX * NZ; t++) for (let c = 0; c < 4; c++) if (Math.abs(this.paint[t * 4 + c] - was[t * 4 + c]) > PAINT_SHOWS) {
      painted = grown(painted, t % NX, Math.floor(t / NX), t % NX + 1, Math.floor(t / NX) + 1);
      break;
    }
    // What's drawn changes round each: a cell's paint blends over the next (2 cells), its corners' normals reach a cell,
    // a bed's paint and its bank's damp reach DAMP_REACH round it.
    const C = this.cell, reachBed = Math.ceil((DAMP_REACH + 0.5) / C) + 1;
    const windows: [Window | null, number][] = [[any, 2], [shape, 2], [painted, 2], [beds, reachBed]];
    let all: Window | null = null;
    for (const [w, r] of windows) if (w) all = grown(all, Math.max(0, w.x0 - r), Math.max(0, w.y0 - r), Math.min(NX, w.x1 + r), Math.min(NZ, w.y1 + r));
    const a = all!, cc = this.chunkCells;
    for (let cz = Math.floor(a.y0 / cc); cz <= Math.floor((a.y1 - 1) / cc); cz++) for (let cx = Math.floor(a.x0 / cc); cx <= Math.floor((a.x1 - 1) / cc); cx++) {
      const k = cz * this.cols + cx;
      const old = this.built.get(k);
      if (old !== undefined) { old?.dispose(); this.built.delete(k); }
      this.pending.add(k);
    }
    // The country beyond meets the terrain's edge, and takes its colour near it.
    const edge = this.beyond ? Math.ceil(this.beyond.cell / C) + 2 : 0;
    if (this.beyond && (a.x0 <= edge || a.y0 <= edge || a.x1 >= NX - edge || a.y1 >= NZ - edge)) this.apronMoved = true;
    this.changed = grown(this.changed, a.x0, a.y0, a.x1, a.y1);
    this.ahead = true;
    return changed;
  }

  /**
   * Paints the chunks lined up (update) for up to `budget` ms, at least one each frame, and once they're all painted swaps
   * them in together. Whether there's nothing left to do (Infinity: all of it, now).
   */
  step(budget = STEP_BUDGET): boolean {
    const end = performance.now() + budget;
    let busy = false;
    for (;;) {
      if (this.pending.size === 0 && this.built.size === 0 && !this.apronMoved) return true;
      if (busy && performance.now() >= end) return false;
      busy = true;
      if (this.pending.size > 0) {
        const k = this.pending.values().next().value!;
        this.pending.delete(k);
        this.built.set(k, this.chunkGeometry(k));
      } else this.swap();
    }
  }

  private swap() {
    const C = this.chunkCells * this.cell;
    let area: THREE.Box3 | null = new THREE.Box3();
    for (const k of this.built.keys()) {
      const x = this.x0 + (k % this.cols) * C, z = this.z0 + Math.floor(k / this.cols) * C;
      area.union(new THREE.Box3(new THREE.Vector3(x, -Infinity, z), new THREE.Vector3(x + C, Infinity, z + C)));
    }
    if (this.apronMoved) area = null;
    this.adder.changeGround(area, () => {
      for (const [k, g] of this.built) this.setChunk(k, g);
      if (this.apronMoved) { this.addApron(false); this.addApron(); }
    });
    this.built.clear();
    this.apronMoved = false;
    this.drawnPaint.set(this.paint);
    this.revision++;
    this.ahead = false;
    const w = this.changed;
    this.changed = null;
    if (w && this.onSwap) {
      const c = this.cell;
      this.onSwap({ x0: this.x0 + w.x0 * c, z0: this.z0 + w.y0 * c, x1: this.x0 + w.x1 * c, z1: this.z0 + w.y1 * c });
    }
  }

  // ---- What the game asks ----

  /** The terrain's height (m) at a point of the world, exactly as drawn (sampleHeightfield); past it, the country's. */
  heightAt(x: number, z: number): number {
    if (this.inside(x, z)) return sampleHeightfield(this.height, this.nx, this.nz, this.cell, this.x0, this.z0, x, z);
    return this.beyondAt(x, z);
  }

  /** How much of a bed (a water's or a rill's) a point is painted as: 0 on dry ground, 1 on the bed. */
  bedAt(x: number, z: number): number {
    if (!this.inside(x, z)) return 0;
    return this.bedShare(x, z);
  }

  /** How far a point is into the duller country round the map: 0 on the map, 1 out in the country. */
  countryAt(x: number, z: number): number { return this.dullness(x, z); }

  /** The terrain's painted colour (linear RGB, before the season turns it) at a point of the world, as drawn. */
  landColourAt(x: number, z: number, into = new THREE.Color()): THREE.Color {
    if (this.inside(x, z)) {
      this.topColour(x, z, this.normalAt(x, z, SCRATCH.n), into, this.drawnPaint);
      return into;
    }
    return this.beyondColour(x, z, into, this.drawnPaint);
  }

  /**
   * Where a line of sight first meets the terrain, or null if it misses: on the terrain's own triangles exactly
   * (hitHeightfield), and over the country round it, traced in steps.
   */
  hit(ray: { origin: THREE.Vector3; direction: THREE.Vector3 }, into = new THREE.Vector3()): THREE.Vector3 | null {
    const o = ray.origin, d = ray.direction;
    const exact = hitHeightfield(this.height, this.nx, this.nz, this.cell, this.x0, this.z0, o.x, o.y, o.z, d.x, d.y, d.z);
    const b = this.beyond, len = d.length();
    if (!b || len === 0) return exact === null ? null : into.set(o.x + d.x * exact, o.y + d.y * exact, o.z + d.z * exact);
    // Over the country: from where it comes down past the top to where it passes under the bottom, or meets the terrain.
    const dx = d.x / len, dy = d.y / len, dz = d.z / len;
    let t = dy < 0 ? Math.max(0, (this.high + 1 - o.y) / dy) : 0;
    let end = dy < 0 ? (this.low - 1 - o.y) / dy : t + 4 * (b.nx + b.nz) * b.cell;
    if (exact !== null) end = Math.min(end, exact * len);
    const box: [number, number, number, number][] = [
      [o.x, dx, Math.min(this.x0, b.x0), Math.max(this.x0 + this.nx * this.cell, b.x0 + (b.nx - 1) * b.cell)],
      [o.z, dz, Math.min(this.z0, b.z0), Math.max(this.z0 + this.nz * this.cell, b.z0 + (b.nz - 1) * b.cell)],
    ];
    for (const [from, along, lo, hi] of box) {
      if (Math.abs(along) < 1e-12) { if (from < lo || from > hi) return null; continue; }
      const p = (lo - from) / along, q = (hi - from) / along;
      t = Math.max(t, Math.min(p, q)); end = Math.min(end, Math.max(p, q));
    }
    const done = () => (exact === null ? null : into.set(o.x + d.x * exact, o.y + d.y * exact, o.z + d.z * exact));
    if (t > end) return done();
    // (Over the terrain itself it's the exact hit's: the country's steps only look outside it.)
    const above = (s: number) => {
      const x = o.x + dx * s, z = o.z + dz * s;
      return this.inside(x, z) ? 1 : o.y + dy * s - this.beyondAt(x, z);
    };
    const step = Math.max(0.5, b.cell / 8);
    let over = above(t) >= 0;
    for (let last = t; last < end;) {
      const s = Math.min(last + step, end), h = above(s);
      if (h > 0 || !over) { over ||= h > 0; last = s; continue; }
      let lo = last, hi = s;
      for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (above(m) > 0) lo = m; else hi = m; }
      return into.set(o.x + dx * hi, o.y + dy * hi, o.z + dz * hi);
    }
    return done();
  }

  // ---- The shape ----

  private inside(x: number, z: number) {
    return x >= this.x0 && z >= this.z0 && x <= this.x0 + this.nx * this.cell && z <= this.z0 + this.nz * this.cell;
  }

  /** The terrain's upward normal at a point: from its heights a cell either way (the same at a vertex either chunk paints). */
  private normalAt(x: number, z: number, out: THREE.Vector3) {
    const e = this.cell, H = this.height, nx = this.nx, nz = this.nz, c = this.cell, x0 = this.x0, z0 = this.z0;
    const gx = (sampleHeightfield(H, nx, nz, c, x0, z0, x + e, z) - sampleHeightfield(H, nx, nz, c, x0, z0, x - e, z)) / (2 * e);
    const gz = (sampleHeightfield(H, nx, nz, c, x0, z0, x, z + e) - sampleHeightfield(H, nx, nz, c, x0, z0, x, z - e)) / (2 * e);
    return out.set(-gx, 1, -gz).normalize();
  }

  /** The lowest and highest the terrain and the country are drawn. */
  private bounds() {
    let lo = Infinity, hi = -Infinity;
    for (const h of this.height) { lo = Math.min(lo, h); hi = Math.max(hi, h); }
    if (this.beyond) for (const h of this.beyond.height) { lo = Math.min(lo, h); hi = Math.max(hi, h); }
    this.low = lo - SKIRT - 1; this.high = hi + 1;
  }

  /**
   * How far (m) a point lies from the nearest cell `want` picks (0 inside one), looked for out to `reach` m (`reach` if
   * there's none that near).
   */
  private distanceTo(x: number, z: number, reach: number, want: (cover: number) => boolean): number {
    const c = this.cell, fx = (x - this.x0) / c, fz = (z - this.z0) / c, r = Math.ceil(reach / c);
    const i0 = Math.max(0, Math.floor(fx) - r), i1 = Math.min(this.nx - 1, Math.floor(fx) + r);
    const j0 = Math.max(0, Math.floor(fz) - r), j1 = Math.min(this.nz - 1, Math.floor(fz) + r);
    let best = reach * reach;
    for (let j = j0; j <= j1; j++) {
      const az = this.z0 + j * c, dz = Math.max(az - z, 0, z - az - c);
      if (dz * dz >= best) continue;
      for (let i = i0; i <= i1; i++) {
        if (!want(this.cover[j * this.nx + i])) continue;
        const ax = this.x0 + i * c, dx = Math.max(ax - x, 0, x - ax - c), d = dx * dx + dz * dz;
        if (d < best) best = d;
      }
    }
    return Math.sqrt(best);
  }

  /**
   * How far (m) a point is from a rill: from the line through its cells' middles (each to the next, a diagonal neighbour's
   * too), less half a cell, so a rill cut on the diagonal is painted along its line rather than in its cells' steps.
   */
  private rillDistance(x: number, z: number, reach: number): number {
    const c = this.cell, NX = this.nx, NZ = this.nz, fx = (x - this.x0) / c, fz = (z - this.z0) / c, r = Math.ceil(reach / c) + 1;
    const i0 = Math.max(0, Math.floor(fx) - r), i1 = Math.min(NX - 1, Math.floor(fx) + r);
    const j0 = Math.max(0, Math.floor(fz) - r), j1 = Math.min(NZ - 1, Math.floor(fz) + r);
    const rill = (i: number, j: number) => i >= 0 && j >= 0 && i < NX && j < NZ && this.cover[j * NX + i] === LAND_COVER.rill;
    // (In cells: the middles are at whole numbers plus a half.)
    const px = fx - 0.5, pz = fz - 0.5;
    let best = Infinity;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!rill(i, j)) continue;
      best = Math.min(best, (px - i) * (px - i) + (pz - j) * (pz - j));
      for (const [di, dj] of RILL_LINKS) {
        if (!rill(i + di, j + dj)) continue;
        const t = Math.min(1, Math.max(0, ((px - i) * di + (pz - j) * dj) / (di * di + dj * dj)));
        const ex = px - i - di * t, ez = pz - j - dj * t;
        best = Math.min(best, ex * ex + ez * ez);
      }
    }
    return Math.min(reach, Math.max(0, (Math.sqrt(best) - 0.5) * c));
  }

  /** How far (m) a point is from a bed: a water's cells, or a rill's line (rillDistance); out to `reach`. */
  private bedDistance(x: number, z: number, reach: number): number {
    return Math.min(this.distanceTo(x, z, reach, (k) => k === LAND_COVER.water), this.rillDistance(x, z, reach));
  }

  /** How much of a bed a point is painted as (0..1): the cells of water and rills, and a little past them, wandering. */
  private bedShare(x: number, z: number) {
    const d = this.bedDistance(x, z, BED_REACH + 0.3);
    return 1 - smooth(0, BED_REACH, d + 0.22 * noise2(x * 0.6 + 3.1, z * 0.6 - 7.3));
  }

  // ---- The paint ----

  /** Each cell's paint as land, from its cover, ground, whether it's worked and how dry it lies. */
  private repaint() {
    this.dryness();
    const n = this.nx * this.nz, c = SCRATCH.a;
    for (let t = 0; t < n; t++) {
      const cover = this.cover[t], bed = isBed(cover), worked = this.worked[t] === 1 && !bed && cover !== LAND_COVER.track && cover !== LAND_COVER.rock;
      let meadow = (PAINT[cover] ?? PAINT[0]).meadow;
      if (worked) { c.copy(SOIL); meadow = 0; } else switch (bed ? LAND_COVER.grass : cover) {
        case LAND_COVER.bare: c.copy(COL.bare); break;
        case LAND_COVER.track: c.copy(COL.track); break;
        case LAND_COVER.rock: c.copy(COL.lush).lerp(COL.dry, this.dry[t]).lerp(COL.rock, 0.65); break;
        case LAND_COVER.woods: c.copy(COL.floor); break;
        // (Under a bed, as by water: lush. The bed's painted over it by place, topColour.)
        default: c.copy(COL.lush).lerp(COL.dry, bed ? 0 : this.dry[t]); if (bed) meadow = 0;
      }
      const g = GROUND_TINT[this.ground[t]], k = this.look.groundTint;
      if (g && k !== 0) { c.lerp(g.toward, g.mix * k); c.multiplyScalar(1 + g.lift * k * 2); }
      this.paint[t * 4] = c.r; this.paint[t * 4 + 1] = c.g; this.paint[t * 4 + 2] = c.b; this.paint[t * 4 + 3] = meadow;
    }
  }

  /** How dry each cell lies: high ground and ground far from water are dry, blurred so it follows the land's lie. */
  private dryness() {
    const NX = this.nx, NZ = this.nz, n = NX * NZ, row = NX + 1, H = this.height, c = this.cell;
    const dist = this.wet.fill(Infinity), queue: number[] = [];
    for (let i = 0; i < n; i++) if (isBed(this.cover[i])) { dist[i] = 0; queue.push(i); }
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q], x = i % NX, y = (i - x) / NX;
      for (const [dx, dy] of SIDES) {
        const nx = x + dx, ny = y + dy, j = ny * NX + nx;
        if (nx < 0 || ny < 0 || nx >= NX || ny >= NZ || dist[j] <= dist[i] + c) continue;
        dist[j] = dist[i] + c; queue.push(j);
      }
    }
    let low = Infinity;
    for (const h of H) low = Math.min(low, h);
    for (let i = 0; i < n; i++) {
      const x = i % NX, y = (i - x) / NX, k = y * row + x, h = (H[k] + H[k + 1] + H[k + row] + H[k + row + 1]) / 4;
      this.raw[i] = 0.6 * Math.min(1, Math.max(0, (h - low) / 10)) + 0.4 * (1 - Math.exp(-Math.min(dist[i], 10 * DRY_FROM_WATER) / DRY_FROM_WATER));
    }
    const R = Math.max(1, Math.round(DRY_BLUR / c));
    for (let y = 0; y < NZ; y++) for (let x = 0; x < NX; x++) {
      let s = 0, k = 0;
      for (let d = -R; d <= R; d++) { const xx = x + d; if (xx >= 0 && xx < NX) { s += this.raw[y * NX + xx]; k++; } }
      this.rowDry[y * NX + x] = s / k;
    }
    for (let y = 0; y < NZ; y++) for (let x = 0; x < NX; x++) {
      let s = 0, k = 0;
      for (let d = -R; d <= R; d++) { const yy = y + d; if (yy >= 0 && yy < NZ) { s += this.rowDry[yy * NX + x]; k++; } }
      this.dry[y * NX + x] = s / k;
    }
  }

  /** A colour as the country beyond the map has it: duller (LAND_LOOK.beyond). */
  private dull(c: THREE.Color): THREE.Color {
    const { light, chroma } = this.look.beyond, y = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    return c.setRGB((y + (c.r - y) * chroma) * light, (y + (c.g - y) * chroma) * light, (y + (c.b - y) * chroma) * light);
  }

  private dullBy(c: THREE.Color, k: number) {
    if (k <= 0) return;
    if (k >= 1) { this.dull(c); return; }
    const d = SCRATCH.dulled.copy(c);
    this.dull(d);
    c.lerp(d, k);
  }

  /** How much of the country's dullness a point (m) takes: 0 on the map, 1 out in the country, along a wandering border. */
  private dullness(x: number, z: number): number {
    const m = this.map, c = this.cell, mx0 = this.x0 + m.x * c, mx1 = mx0 + m.width * c, mz0 = this.z0 + m.y * c, mz1 = mz0 + m.height * c;
    const ox = Math.max(mx0 - x, x - mx1), oz = Math.max(mz0 - z, z - mz1);
    const d = ox > 0 || oz > 0 ? Math.hypot(Math.max(0, ox), Math.max(0, oz)) : Math.max(ox, oz);
    if (d <= 0) return 0;
    const { near, far, wave, rag } = BORDER;
    const swell = Math.min(1, Math.max(0, noise2(x / wave + 11.3, z / wave - 4.7) * 0.5 + 0.5));
    const reach = near + (far - near) * swell + rag * noise2(x * 0.1125 - 3.1, z * 0.1125 + 5.9);
    return smooth(0, reach, d);
  }

  /**
   * The ground's colour at a point (m), into `c`, and how much of the meadow's drift it takes: the cells' paints blended
   * between their middles, over a point that wanders a little, so a cover's edge is a painted one, not the grid's.
   */
  private colourAt(x: number, z: number, c: THREE.Color, p: Float32Array): number {
    const C = this.cell, wx = x + 0.4 * noise2(x * 0.45 + 17, z * 0.45 - 5), wz = z + 0.4 * noise2(x * 0.45 - 31, z * 0.45 + 9);
    const fx = (wx - this.x0) / C - 0.5, fy = (wz - this.z0) / C - 0.5, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
    const W = this.nx, Hh = this.nz;
    const xa = Math.min(W - 1, Math.max(0, ix)), xb = Math.min(W - 1, Math.max(0, ix + 1));
    const ya = Math.min(Hh - 1, Math.max(0, iy)), yb = Math.min(Hh - 1, Math.max(0, iy + 1));
    const o00 = (ya * W + xa) * 4, o10 = (ya * W + xb) * 4, o01 = (yb * W + xa) * 4, o11 = (yb * W + xb) * 4;
    const w00 = (1 - u) * (1 - v), w10 = u * (1 - v), w01 = (1 - u) * v, w11 = u * v;
    const at = (k: number) => p[o00 + k] * w00 + p[o10 + k] * w10 + p[o01 + k] * w01 + p[o11 + k] * w11;
    c.setRGB(at(0), at(1), at(2));
    return at(3);
  }

  /** A point's colour before its slope wears it or the beds paint it: the cells' paint, as dull as the country is there, the meadow's drift. */
  private baseColour(x: number, z: number, c: THREE.Color, paint: Float32Array, drift = 1) {
    const meadow = this.colourAt(x, z, c, paint);
    this.dullBy(c, this.dullness(x, z));
    const k = noise2(x * 0.02 + 7, z * 0.02 - 3) * 0.5 + 0.5, m = meadow * drift;
    c.lerp(COL.lime, smooth(0.55, 0.9, k) * 0.35 * m).lerp(COL.emerald, smooth(0.6, 0.95, 1 - k) * 0.35 * m);
  }

  /** What the last topColour found besides the colour: how steep the ground, how much shingle and bed it is. */
  private readonly painted = { steep: 0, shingle: 0, bed: 0 };

  /**
   * The painted colour (linear RGB, before the season turns it) at a point (m), into `c`: its base colour, a steep bank's
   * wear, damp up the bank from a bed, a shingle along the waterline, and the bed itself where the water's and the rills'
   * cells are (a pond's darkening as it deepens; a rill's damp dark earth and pebbles); last, the country's colour at the
   * terrain's edge.
   */
  private topColour(x: number, z: number, n: THREE.Vector3, c: THREE.Color, paint: Float32Array) {
    const bed = this.bedShare(x, z);
    this.baseColour(x, z, c, paint, 1 - bed);
    const steep = smooth(0.35, 0.9, Math.hypot(n.x, n.z) / Math.max(1e-3, n.y));
    c.lerp(COL.worn, steep * 0.5 * (1 - bed));
    const broken = noise2(x * 0.35 + 11, z * 0.35 - 4);
    const near = this.bedDistance(x, z, DAMP_REACH + 0.5);
    c.lerp(COL.damp, (1 - smooth(0.2, DAMP_REACH, near + 0.4 * broken)) * 0.45 * (1 - bed));
    const shingle = smooth(0.12, 0.4, bed) * (1 - smooth(0.55, 0.85, bed)) * smooth(-0.35, 0.25, noise2(x * 0.6 - 2, z * 0.6 + 6));
    c.lerp(COL.shingle, shingle * 0.6);
    if (bed > 0) {
      // A rill's bed, or a pond's or a brook's: whichever the point is nearer.
      const rill = smooth(-0.4, 0.4, this.distanceTo(x, z, 2, (k) => k === LAND_COVER.water) - this.rillDistance(x, z, 2));
      const deep = smooth(0, DEEP_REACH, this.distanceTo(x, z, DEEP_REACH, (k) => k !== LAND_COVER.water));
      const under = SCRATCH.b.copy(COL.bed).lerp(COL.deep, 0.2 + deep * 0.6);
      const stones = smooth(0.15, 0.75, noise2(x * 1.7 + 5, z * 1.7 - 2)) * 0.45;
      under.lerp(SCRATCH.dulled.copy(RILL_BED).lerp(PEBBLE, stones), rill);
      this.dullBy(under, this.dullness(x, z));
      c.lerp(under, bed);
    }
    this.alongApron(x, z, c, paint);
    this.painted.steep = steep; this.painted.shingle = shingle; this.painted.bed = bed;
  }

  // ---- The mesh ----

  private setChunk(k: number, g: THREE.BufferGeometry | null) {
    const old = this.chunks[k];
    if (old) this.adder.remove(old);
    this.geometries[k]?.dispose();
    this.geometries[k] = g;
    this.chunks[k] = g && this.adder.add(g, 'ground', { under: true, tile: this.chunkCells * this.cell, fields: this.fields });
  }

  /**
   * A chunk's mesh: its cells' corners as they're given, two triangles a cell split from the north-east corner to the
   * south-west one (as sampleHeightfield splits them), and down the terrain's outer edge a skirt.
   */
  private chunkGeometry(k: number): THREE.BufferGeometry | null {
    const cc = this.chunkCells, cx = k % this.cols, cy = Math.floor(k / this.cols);
    const i0 = cx * cc, j0 = cy * cc, i1 = Math.min(this.nx, i0 + cc), j1 = Math.min(this.nz, j0 + cc);
    if (i1 <= i0 || j1 <= j0) return null;
    const b = new MeshBuilder('paint'), w = i1 - i0 + 1, row = this.nx + 1, n = SCRATCH.n, c = SCRATCH.c;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = this.x0 + i * this.cell, z = this.z0 + j * this.cell, y = this.height[j * row + i];
      this.normalAt(x, z, n);
      this.topColour(x, z, n, c, this.paint);
      const { steep, shingle, bed } = this.painted;
      const own = this.cover[Math.min(this.nz - 1, j) * this.nx + Math.min(this.nx - 1, i)];
      const pt = PAINT[bed > 0.5 ? LAND_COVER.water : isBed(own) ? LAND_COVER.grass : own] ?? PAINT[0];
      const drift = Math.min(1, pt.drift + steep * 0.4 + shingle * 0.3 + noise2(x * 0.21 + 3, z * 0.21 - 9) * 0.15);
      b.vertex({ x, y, z }, n, c, [drift, pt.brush, 0.7 + noise2(x * 0.05, z * 0.05) * 0.9, 0]);
    }
    // (Listed (0,0), (0,1), (1,0) and (1,0), (0,1), (1,1) across a cell, they face up.)
    for (let j = 0; j < j1 - j0; j++) for (let i = 0; i < i1 - i0; i++) {
      const a = j * w + i;
      b.tri(a, a + w, a + 1);
      b.tri(a + 1, a + w, a + w + 1);
    }
    this.skirt(b, i0, j0, i1, j1);
    const g = b.build();
    this.adder.prepare(g);
    return g;
  }

  /** Down the terrain's outer edge where the chunk meets it: a skirt SKIRT m down, so no crack shows against the country. */
  private skirt(b: MeshBuilder, i0: number, j0: number, i1: number, j1: number) {
    const row = this.nx + 1, colour = SCRATCH.floor;
    const edges: [boolean, number, number, number, number, number, number][] = [
      // [on the edge, along from, along to, fixed, step x?, out x, out z]
      [j0 === 0, i0, i1, 0, 1, 0, -1], [j1 === this.nz, i0, i1, this.nz, 1, 0, 1],
      [i0 === 0, j0, j1, 0, 0, -1, 0], [i1 === this.nx, j0, j1, this.nx, 0, 1, 0],
    ];
    for (const [on, from, to, fixed, alongX, ox, oz] of edges) {
      if (!on) continue;
      const out = SCRATCH.out.set(ox, 0, oz);
      for (let s = from; s < to; s++) {
        const [ia, ja, ib, jb] = alongX ? [s, fixed, s + 1, fixed] : [fixed, s, fixed, s + 1];
        const xa = this.x0 + ia * this.cell, za = this.z0 + ja * this.cell, xb = this.x0 + ib * this.cell, zb = this.z0 + jb * this.cell;
        const ya = this.height[ja * row + ia], yb = this.height[jb * row + ib];
        colour.copy(COL.floor);
        this.dullBy(colour, this.dullness((xa + xb) / 2, (za + zb) / 2));
        const p = [b.vertex({ x: xa, y: ya - SKIRT, z: za }, out, colour, FACE_PAINT), b.vertex({ x: xa, y: ya, z: za }, out, colour, FACE_PAINT),
          b.vertex({ x: xb, y: yb, z: zb }, out, colour, FACE_PAINT), b.vertex({ x: xb, y: yb - SKIRT, z: zb }, out, colour, FACE_PAINT)];
        // Facing out: listed bottom, top, top, bottom, the quad's normal is along (zb − za, 0, xa − xb).
        if ((zb - za) * ox - (xb - xa) * oz > 0) b.quad(p[0], p[1], p[2], p[3]); else b.quad(p[0], p[3], p[2], p[1]);
      }
    }
  }

  // ---- The country beyond (as the tiled land's, paint.ts) ----

  private addApron(make = true) {
    if (this.apron) this.adder.remove(this.apron);
    this.apronGeometry?.dispose();
    this.apronGeometry = make ? this.apronMesh() : null;
    this.apron = this.apronGeometry && this.adder.add(this.apronGeometry, 'ground', { under: true, tile: APRON_TILE, fields: this.fields });
  }

  /** The country beyond's height (m) at a point: its grid's, carried on from the terrain's edge within a cell of it. */
  private beyondAt(x: number, z: number): number {
    const b = this.beyond;
    const ex = Math.min(this.x0 + this.nx * this.cell, Math.max(this.x0, x)), ez = Math.min(this.z0 + this.nz * this.cell, Math.max(this.z0, z));
    const edge = sampleHeightfield(this.height, this.nx, this.nz, this.cell, this.x0, this.z0, ex, ez);
    if (!b) return edge;
    const fx = Math.min(b.nx - 1.001, Math.max(0, (x - b.x0) / b.cell)), fz = Math.min(b.nz - 1.001, Math.max(0, (z - b.z0) / b.cell));
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, H = b.height, at = (a: number, c: number) => H[c * b.nx + a];
    const far = (at(i, j) * (1 - u) + at(i + 1, j) * u) * (1 - v) + (at(i, j + 1) * (1 - u) + at(i + 1, j + 1) * u) * v;
    const k = smooth(0, b.cell, Math.hypot(x - ex, z - ez));
    return k >= 1 ? far : edge + (far - edge) * k;
  }

  /** The country beyond's colour at a point past the terrain: the woods' floor, dulled, and near the terrain its edge's colour. */
  private beyondColour(x: number, z: number, c: THREE.Color, paint: Float32Array): THREE.Color {
    const k = noise2(x * 0.015 + 2, z * 0.015 + 8) * 0.5 + 0.5;
    c.copy(COL.floor).lerp(COL.emerald, k * 0.3);
    this.dull(c);
    if (!this.beyond) return c;
    const lx1 = this.x0 + this.nx * this.cell, lz1 = this.z0 + this.nz * this.cell;
    const ex = Math.min(lx1, Math.max(this.x0, x)), ez = Math.min(lz1, Math.max(this.z0, z)), away = Math.hypot(x - ex, z - ez);
    const reach = APRON_BLEND * this.beyond.cell;
    if (away < reach) {
      const edge = SCRATCH.edge;
      this.baseColour(ex, ez, edge, paint);
      c.lerp(edge, 1 - smooth(0, reach, away));
    }
    return c;
  }

  /** The country beyond's grid lines (m), across and down, with the terrain's edges among them; null if there's none. */
  private apronLines(): { xs: number[]; zs: number[] } | null {
    const bd = this.beyond;
    if (!bd) return null;
    const lines = (from: number, n: number, edges: number[]) => [...new Set([...Array.from({ length: n }, (_, k) => from + k * bd.cell), ...edges])].sort((p, q) => p - q);
    return { xs: lines(bd.x0, bd.nx, [this.x0, this.x0 + this.nx * this.cell]), zs: lines(bd.z0, bd.nz, [this.z0, this.z0 + this.nz * this.cell]) };
  }

  /**
   * Within a cell of the country's grid of the terrain's outer edge, `c` taken towards the colour the country has where it
   * meets the terrain (the terrain's at its grid's lines, straight between them), so the two meet in one colour all along it.
   */
  private alongApron(x: number, z: number, c: THREE.Color, paint: Float32Array) {
    const at = this.apronAt, b = this.beyond;
    if (!at || !b) return;
    const reach = b.cell, X0 = this.x0, X1 = this.x0 + this.nx * this.cell, Z0 = this.z0, Z1 = this.z0 + this.nz * this.cell;
    const xs = at.xs.filter((v) => v >= X0 - 1e-6 && v <= X1 + 1e-6), zs = at.zs.filter((v) => v >= Z0 - 1e-6 && v <= Z1 + 1e-6);
    const sides: [number, number, number[], (l: number) => [number, number]][] = [
      [x - X0, z, zs, (l) => [X0, l]], [X1 - x, z, zs, (l) => [X1, l]], [z - Z0, x, xs, (l) => [l, Z0]], [Z1 - z, x, xs, (l) => [l, Z1]],
    ];
    let r = 0, g = 0, bl = 0, sum = 0, most = 0;
    const e = SCRATCH.alongA, f = SCRATCH.alongB;
    for (const [d, along, lines, on] of sides) {
      if (d >= reach || lines.length < 2) continue;
      let i = 0;
      while (i + 2 < lines.length && lines[i + 1] <= along) i++;
      const t = Math.min(1, Math.max(0, (along - lines[i]) / (lines[i + 1] - lines[i])));
      this.baseColour(...on(lines[i]), e, paint);
      this.baseColour(...on(lines[i + 1]), f, paint);
      e.lerp(f, t);
      if (d <= 1e-9) { c.copy(e); return; }
      const k = 1 - smooth(0, reach, d), w = k / d;
      r += e.r * w; g += e.g * w; bl += e.b * w; sum += w; most = Math.max(most, k);
    }
    if (sum > 0) c.lerp(SCRATCH.alongA.setRGB(r / sum, g / sum, bl / sum), most);
  }

  /** The country beyond as one mesh: distant woods' floor on a coarse grid round the terrain, its lines meeting its edges. */
  private apronMesh(): THREE.BufferGeometry | null {
    if (!this.beyond) return null;
    const lx0 = this.x0, lx1 = this.x0 + this.nx * this.cell, lz0 = this.z0, lz1 = this.z0 + this.nz * this.cell;
    const { xs, zs } = this.apronAt!, b = new MeshBuilder('paint'), nx = xs.length;
    const c = SCRATCH.c, n = SCRATCH.n, e = 1;
    for (const z of zs) for (const x of xs) {
      const y = this.heightAt(x, z);
      n.set(this.heightAt(x - e, z) - this.heightAt(x + e, z), 2 * e, this.heightAt(x, z - e) - this.heightAt(x, z + e)).normalize();
      this.beyondColour(x, z, c, this.paint);
      b.vertex({ x, y, z }, n, c, [0.3, 1.5, 0.7, 0]);
    }
    for (let j = 0; j + 1 < zs.length; j++) for (let i = 0; i + 1 < nx; i++) {
      if (xs[i] >= lx0 && xs[i + 1] <= lx1 && zs[j] >= lz0 && zs[j + 1] <= lz1) continue;
      const a = j * nx + i;
      b.quad(a, a + nx, a + nx + 1, a + 1);
    }
    return b.vertexCount ? b.build() : null;
  }
}

/** The tiles (m) the country beyond is cut into (as paint.ts's). */
const APRON_TILE = 256;
const FACE_PAINT = [0.5, 2.5, 0, 0] as const;
const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]] as const;
const SCRATCH = {
  a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color(), floor: new THREE.Color(), dulled: new THREE.Color(),
  edge: new THREE.Color(), alongA: new THREE.Color(), alongB: new THREE.Color(), n: new THREE.Vector3(), out: new THREE.Vector3(),
};
