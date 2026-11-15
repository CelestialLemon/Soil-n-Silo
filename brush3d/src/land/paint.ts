import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshBuilder, noise2, type Paint } from '../kit/builder.ts';
import type { MaterialKind } from '../renderer/materials.ts';
import { checkLand, checkPatch, LAND_COVER, LAND_GROUND, type LandMap, type LandPatch, type LandRect } from './map.ts';
import { Surface, type Refit } from './surface.ts';

// The land painted from the game's map (Soil-n-Silo#202, docs/LAND.md): the renderer's own ground, in place of a mesh the
// game builds. Each tile's top is the game's smooth reading of the rules' levels (surface.ts, moved here as it was: within
// half a level of the rules, exactly level on worked ground and at the water, sharp at cliffs), cut as finely as its bends
// need; where neighbours' corners don't meet, a cliff face runs from one to the other; the water's tiles are hollowed into
// a bed under the game's water. The country past the tiles (`beyond`) is a coarse floor of distant woods round them.
//
// It's drawn in chunks of CHUNK tiles a side, each one ground mesh; out in the country, where no earthwork reaches, up to
// PIECE² chunks are drawn together as one mesh (a piece), since each mesh drawn costs the CPU about as much however few
// triangles it holds (#210). An earthwork (updateLand) is worked on a little each
// frame, within STEP_BUDGET (step): the ground fitted again round what changed (its sweeps spread over frames), then only
// the chunks whose ground or paint moved painted again, and swapped in all together once they're all painted, so the land
// never shows half an earthwork and no frame waits for the whole of one. Earthworks given meanwhile wait their turn.
//
// Its height anywhere (heightAt, the renderer's landAt) and where a line of sight first meets it (hit, landHit) are worked
// out from the same fit on the CPU, so what the game stands on the land sits on what's drawn.

/** Tiles a side of one chunk of the land's mesh. */
const CHUNK = 8;
/**
 * Chunks a side of one piece of the country: its chunks (those wholly more than a chunk out of the map) drawn as one mesh,
 * the same triangles as theirs. On the game's maps most of the land's chunks are country.
 */
const PIECE = 4;
/** The tiles (m) the country beyond is cut into, for each pass to draw only those in its view. */
const APRON_TILE = 256;
/** How finely a tile may be cut, a side: whole, halves, quarters or eighths. */
const DETAILS = [1, 2, 4, 8];
/** How far (m) the flat triangles drawn may stray from the smooth surface. */
const TOLERANCE = 0.04;
/**
 * The least a tile is cut into a side, by how far (tiles, either way) it is from the map: finely on the map and just round
 * it, where the camera comes close and the paint's colours change most; coarser in the country, coarsest far out.
 */
const NEAR_MAP = 3, NEAR_COUNTRY = 16;
/** How far (tiles) round an earthwork the ground is fitted again (further out it hardly moves; surface.ts keeps the edge). */
const SPREAD = 8;
/** How deep the water's bed lies (m) under its tiles' level at its deepest, and how far (tiles) in from the bank it gets there. */
const BED = 1.2, BANK = 0.75;
/** How deep the turf lip over a cliff is (m), levels a band of a cliff's strata, and the level from which a cliff is stone. */
const LIP = 0.3, STRATUM = 2, STONE_FROM = 8;
/** How far (m) the land's outer edge is skirted down, so no crack shows between it and the country beyond. */
const SKIRT = 3;
/**
 * How long (ms) a frame spends on an earthwork (step). It stops at the first piece of work that ends past it, and no piece
 * is cut short: the longest, painting one chunk or setting up or finishing the fit, take about 2 to 5 ms once warm.
 */
export const STEP_BUDGET = 3;
/** The four sides as tile steps (north, east, south, west), as the game's relief.ts has them. */
const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]] as const;

/** The land's look: what the developer picks between on the previews (#202). */
export interface LandLook {
  /** How strongly each ground kind tints the paint: 0 not at all, 1 as GROUND_TINT has it. */
  groundTint: number;
  /** The country round the map: its colours' lightness and colourfulness (1, as the map's). */
  beyond: { light: number; chroma: number };
}
/** The land's look until the developer's picks. */
export const LAND_LOOK: LandLook = { groundTint: 1, beyond: { light: 0.9, chroma: 0.8 } };

const srgb = (hex: number) => new THREE.Color(hex);
/** The land's colours (sRGB; the season turns the greens, seasonLook.ts). */
const COL = {
  lush: srgb(0x5a9848), dry: srgb(0x98a652), lime: srgb(0xa6c45a), emerald: srgb(0x40885a),
  worn: srgb(0x9a9460), bare: srgb(0xa88a62), track: srgb(0xc0a274), rock: srgb(0x9a9184), floor: srgb(0x3e6236),
  bed: srgb(0x9a8660), deep: srgb(0x6a5a40), lip: srgb(0x5f8a3a),
};
/** Cliff faces: earth for the low levels, stone higher up, a band each STRATUM levels in turn. */
const EARTH = [srgb(0x9c7e5a), srgb(0x8c714f)], STONE = [srgb(0x8e877a), srgb(0x807a6e)];
/** How each kind of ground tints the land: `mix` of the way towards `toward`, then `lift` lighter (or darker). Loam none. */
const GROUND_TINT: Record<number, { toward: THREE.Color; mix: number; lift: number }> = {
  [LAND_GROUND.silt]: { toward: srgb(0x54401c), mix: 0.12, lift: -0.04 },
  [LAND_GROUND.clay]: { toward: srgb(0xa4603c), mix: 0.22, lift: -0.02 },
  [LAND_GROUND.sand]: { toward: srgb(0xe0cc94), mix: 0.26, lift: 0.04 },
  [LAND_GROUND.stony]: { toward: srgb(0x8a8a82), mix: 0.26, lift: 0 },
};
/** How each cover's ground is painted: colour drift, brush scale (strokes a metre); and how much of the meadow's drift it takes. */
const PAINT: Record<number, { drift: number; brush: number; meadow: number }> = {
  [LAND_COVER.grass]: { drift: 0.3, brush: 2, meadow: 1 },
  [LAND_COVER.bare]: { drift: 0.45, brush: 2.5, meadow: 0 },
  [LAND_COVER.track]: { drift: 0.55, brush: 2.5, meadow: 0 },
  [LAND_COVER.rock]: { drift: 0.6, brush: 2, meadow: 0.3 },
  [LAND_COVER.woods]: { drift: 0.3, brush: 1.5, meadow: 0.4 },
  [LAND_COVER.water]: { drift: 0.5, brush: 2, meadow: 0 },
};
const FACE_PAINT: Paint = [0.5, 2.5, 0, 0];

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** Whether a tile's top is split from north-west to south-east (relief.ts's splitsNwSe): along its closer diagonal. */
function splitsNwSe(c: readonly number[]) {
  const a = Math.abs(c[0] - c[2]), b = Math.abs(c[1] - c[3]);
  return a !== b ? a < b : c[0] + c[2] >= c[1] + c[3];
}

/** What the land adds its meshes through: the renderer's add and remove. */
export interface LandAdder {
  add(geometry: THREE.BufferGeometry, kind: MaterialKind, options: { under?: boolean; tile?: number; fields?: { x: number; z: number; side: number; turn: number } }): THREE.Mesh;
  remove(mesh: THREE.Mesh): void;
  /**
   * Runs `change` (the land's meshes added and taken out) as one change to the ground, within `area` (metres, the whole
   * world if null): what follows the ground's shape (its shelter, its heights) is found again once, after it.
   */
  changeGround(area: THREE.Box3 | null, change: () => void): void;
  /** What the renderer works out from a ground mesh's geometry when it's added, worked out now. */
  prepare(geometry: THREE.BufferGeometry): void;
}

/** The land as painted, from the game's map. */
export class PaintedLand {
  readonly width: number;
  readonly height: number;
  private readonly tile: number;
  private readonly level: number;
  private readonly x0: number;
  private readonly z0: number;
  private readonly map: LandRect;
  private readonly look: LandLook;
  private readonly adder: LandAdder;
  /** The corners in levels, as the fit reads them. */
  private readonly relief: { width: number; height: number; corner: Float64Array };
  private readonly worked: Uint8Array;
  private readonly cover: Uint8Array;
  private readonly ground: Uint8Array;
  private readonly surface: Surface;
  /** How many pieces each tile is cut into a side. */
  private readonly detail: Uint8Array;
  /** Each tile's paint (linear RGB, and how much of the meadow's drift it takes), four numbers a tile. */
  private readonly paint: Float32Array;
  /** How dry each tile lies (0 lush, by water and low, to 1 dry, high and far from it); and on the way there, how far each
   * is from the water (tiles), how dry it is before the blur, and blurred along its row. */
  private readonly dry: Float32Array;
  private readonly wet: Float32Array;
  private readonly raw: Float32Array;
  private readonly rowDry: Float32Array;
  /** The chunks' meshes, and the geometry each was made of (the land's own, to free when it's swapped out). */
  private readonly chunks: (THREE.Mesh | null)[];
  private readonly geometries: (THREE.BufferGeometry | null)[];
  /** Each chunk's piece of the country (-1: drawn on its own); each piece's chunks, its mesh and what it's made of; and the
   * pieces whose chunks changed, to make again (merge). */
  private readonly pieceOf: Int32Array;
  private readonly pieces = new Map<number, { chunks: number[]; mesh: THREE.Mesh | null; geometry: THREE.BufferGeometry | null }>();
  private readonly stale = new Set<number>();
  /** The earthwork being fitted (step), its chunks still to paint, and those painted and waiting to be swapped in together. */
  private fitting: { change: Change; refit: Refit | null; taken: Taken } | null = null;
  private readonly pending = new Set<number>();
  private readonly built = new Map<number, THREE.BufferGeometry | null>();
  /** Whether the land's outer edge moved, so the country beyond's mesh, which meets it, is made again at the swap. */
  private apronMoved = false;
  /** The earthworks given since the last was taken up (step does them in turn), and the tiles as they'll be once it is. */
  private change: Change | null = null;
  /** Whether one was given since the last step: it's fitted a step later, not in the frame the game fitted its own. */
  private given = false;
  private readonly next: { corner: Float64Array; worked: Uint8Array; cover: Uint8Array; ground: Uint8Array };
  /** Counts the earthworks swapped in: what lies on the land as drawn (the tools' lines) lies on it again when it moves. */
  revision = 0;
  private readonly cols: number;
  private apron: THREE.Mesh | null = null;
  private apronGeometry: THREE.BufferGeometry | null = null;
  private readonly beyond: LandMap['beyond'];
  private readonly fields: { x: number; z: number; side: number; turn: number };
  /** The lowest and highest the land is drawn (m), for tracing a line of sight. */
  private low = 0;
  private high = 0;

  constructor(adder: LandAdder, m: LandMap, look: LandLook = LAND_LOOK) {
    checkLand(m);
    this.adder = adder; this.look = look;
    this.width = m.width; this.height = m.height; this.tile = m.tile; this.level = m.level; this.x0 = m.x0; this.z0 = m.z0;
    this.map = { ...m.map }; this.beyond = m.beyond ?? null;
    const n = m.width * m.height;
    this.relief = { width: m.width, height: m.height, corner: Float64Array.from(m.corners, (c) => Math.round(c / m.level)) };
    this.worked = Uint8Array.from(m.worked); this.cover = Uint8Array.from(m.cover); this.ground = Uint8Array.from(m.ground);
    this.next = { corner: this.relief.corner.slice(), worked: this.worked.slice(), cover: this.cover.slice(), ground: this.ground.slice() };
    // (The fit reads the water and worked tiles as they're to be: it's set up as an earthwork's taken up, and the land
    // answers as it was until it's done, settle. When nothing's under way, those are the land's own.)
    const next = this.next;
    this.surface = new Surface(this.relief, { water: (x, y) => next.cover[y * this.width + x] === LAND_COVER.water, worked: (x, y) => next.worked[y * this.width + x] === 1 });
    this.detail = new Uint8Array(n);
    for (let i = 0; i < n; i++) this.detail[i] = this.cut(i % this.width, Math.floor(i / this.width));
    this.dry = new Float32Array(n); this.wet = new Float32Array(n); this.raw = new Float32Array(n); this.rowDry = new Float32Array(n);
    this.dryness(null);
    this.paint = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) this.paintTile(i, this.paint, i * 4);
    this.bounds();
    const side = Math.max(m.width, m.height) * m.tile;
    this.fields = { x: m.x0 + (m.width * m.tile) / 2, z: m.z0 + (m.height * m.tile) / 2, side, turn: 0 };
    this.cols = Math.ceil(m.width / CHUNK);
    const rows = Math.ceil(m.height / CHUNK);
    this.chunks = new Array<THREE.Mesh | null>(this.cols * rows).fill(null);
    this.geometries = new Array<THREE.BufferGeometry | null>(this.cols * rows).fill(null);
    this.pieceOf = new Int32Array(this.cols * rows).fill(-1);
    const mp = m.map, pcols = Math.ceil(this.cols / PIECE);
    for (let k = 0; k < this.chunks.length; k++) {
      const cx = k % this.cols, cy = Math.floor(k / this.cols), x0 = cx * CHUNK, y0 = cy * CHUNK;
      // Wholly more than a chunk out of the map: past anything an earthwork paints again (up to two tiles round it).
      const near = x0 + CHUNK > mp.x - CHUNK && x0 < mp.x + mp.width + CHUNK && y0 + CHUNK > mp.y - CHUNK && y0 < mp.y + mp.height + CHUNK;
      if (near) continue;
      const p = Math.floor(cy / PIECE) * pcols + Math.floor(cx / PIECE);
      this.pieceOf[k] = p;
      let piece = this.pieces.get(p);
      if (!piece) this.pieces.set(p, piece = { chunks: [], mesh: null, geometry: null });
      piece.chunks.push(k);
    }
    adder.changeGround(null, () => {
      for (let k = 0; k < this.chunks.length; k++) this.setChunk(k, this.chunkGeometry(k));
      this.merge();
      this.addApron();
    });
  }

  /** Takes the land's meshes out of the scene, and frees them. */
  dispose() {
    this.adder.changeGround(null, () => {
      for (let k = 0; k < this.chunks.length; k++) this.setChunk(k, null);
      this.merge();
      this.addApron(false);
    });
    for (const g of this.built.values()) g?.dispose();
    this.pending.clear(); this.built.clear(); this.change = null; this.fitting = null;
  }

  /**
   * An earthwork, or anything else that changes tiles: the new values for the tiles in `rect`, lined up to be made over
   * the next frames (step): the ground fitted again round them, and the chunks whose ground or paint that moves painted
   * again. Until it's fitted the land answers (heightAt, hit) as it was; until it's swapped in it's drawn as it was.
   * Returns how many tiles changed.
   */
  update(rect: LandRect, p: LandPatch): number {
    checkPatch({ width: this.width, height: this.height, level: this.level }, rect, p);
    const W = this.width, { corner: c, worked, cover, ground } = this.next;
    const change = this.change ?? { dirty: new Set<number>(), fit: null, paint: null, watered: false };
    let changed = 0;
    for (let j = 0; j < rect.height; j++) for (let i = 0; i < rect.width; i++) {
      const x = rect.x + i, y = rect.y + j, t = y * W + x, k = j * rect.width + i;
      let moved = false, repainted = false;
      if (p.corners) for (let n = 0; n < 4; n++) {
        const l = Math.round(p.corners[k * 4 + n] / this.level);
        if (l !== c[t * 4 + n]) { c[t * 4 + n] = l; moved = true; }
      }
      if (p.worked && p.worked[k] !== worked[t]) { worked[t] = p.worked[k]; moved = true; }
      if (p.cover && p.cover[k] !== cover[t]) {
        if ((p.cover[k] === LAND_COVER.water) !== (cover[t] === LAND_COVER.water)) { moved = true; change.watered = true; }
        cover[t] = p.cover[k]; repainted = true;
      }
      if (p.ground && p.ground[k] !== ground[t]) { ground[t] = p.ground[k]; repainted = true; }
      if (moved) change.fit = grown(change.fit, x, y);
      if (moved || repainted) { change.dirty.add(t); change.paint = grown(change.paint, x, y); changed++; }
    }
    if (changed === 0) return 0;
    this.change = change; this.given = true;
    return changed;
  }

  /**
   * Works on the earthworks lined up (update) for up to `budget` ms, at least a little each frame: fits the ground again
   * round the first (heightAt and hit answer for the new ground from then), paints its chunks, and once they're all
   * painted swaps them in together; then the next. Whether there's nothing left to do (Infinity: all of it, now).
   */
  step(budget = STEP_BUDGET): boolean {
    const end = performance.now() + budget, fresh = this.given;
    this.given = false;
    let busy = false;
    for (;;) {
      if (!this.fitting && this.pending.size === 0 && this.built.size === 0 && !this.apronMoved && !this.change) return true;
      if (busy && performance.now() >= end) return false;
      busy = true;
      if (this.fitting) {
        const { change, refit, taken } = this.fitting;
        if (refit && !refit.sweep(end)) continue;
        this.fitting = null;
        this.settle(change, refit, taken);
      } else if (this.pending.size > 0) {
        const k = this.pending.values().next().value!;
        this.pending.delete(k);
        this.built.set(k, this.chunkGeometry(k));
      } else if (this.built.size > 0 || this.apronMoved) {
        this.swap();
      } else if (this.change) {
        // Not in the frame it was given: the game fits its own reading of the land (its Lie) in that one.
        if (fresh && budget !== Infinity) return false;
        this.begin(this.change);
        this.change = null;
      }
    }
  }

  /**
   * An earthwork taken up: its corners made the fit's, and the ground's refit round them started (step runs its sweeps).
   * Its cover and the rest are the land's once it's fitted (settle), so it answers as it was until then. (The relief's
   * corners are only the fit's: what's drawn and answered is the fit.)
   */
  private begin(change: Change) {
    const c = this.relief.corner, next = this.next, W = this.width, H = this.height, fit = change.fit;
    // Its tiles' other values as they are now (a later earthwork may change them again before this one's fitted).
    const taken: Taken = { tiles: [...change.dirty], values: new Uint8Array(change.dirty.size * 3) };
    taken.tiles.forEach((t, i) => taken.values.set([next.worked[t], next.cover[t], next.ground[t]], i * 3));
    for (const t of change.dirty) {
      for (let k = 0; k < 4; k++) c[t * 4 + k] = next.corner[t * 4 + k];
      // How low and high the land is drawn, for a line of sight: only ever further out (it's only a bound).
      this.low = Math.min(this.low, Math.min(c[t * 4], c[t * 4 + 1], c[t * 4 + 2], c[t * 4 + 3]) * this.level - BED - 1);
      this.high = Math.max(this.high, (Math.max(c[t * 4], c[t * 4 + 1], c[t * 4 + 2], c[t * 4 + 3]) + 1) * this.level);
    }
    const refit = fit && this.surface.refitting(Math.max(0, fit.x0 - SPREAD), Math.max(0, fit.y0 - SPREAD), Math.min(W, fit.x1 + SPREAD), Math.min(H, fit.y1 + SPREAD));
    this.fitting = { change, refit, taken };
  }

  /** The earthwork's ground fitted: its paint and detail, and the chunks to paint again lined up. */
  private settle({ dirty, fit, paint: given, watered }: Change, refit: Refit | null, { tiles, values }: Taken) {
    const W = this.width, H = this.height;
    tiles.forEach((t, i) => { this.worked[t] = values[i * 3]; this.cover[t] = values[i * 3 + 1]; this.ground[t] = values[i * 3 + 2]; });
    let win = given ?? { x0: 0, y0: 0, x1: 0, y1: 0 };
    if (fit && refit) {
      for (const t of refit.finish()) dirty.add(t);
      // How dry the ground lies follows its height (blurred over a few tiles) and the water (all of it, if that moved):
      // the tiles whose paint may change grow by those whose dryness did.
      const d = this.dryness(watered ? null : fit);
      win = { x0: Math.min(win.x0, d.x0), y0: Math.min(win.y0, d.y0), x1: Math.max(win.x1, d.x1), y1: Math.max(win.y1, d.y1) };
    }
    const paint = new Float32Array(4);
    for (let y = win.y0; y < win.y1; y++) for (let x = win.x0; x < win.x1; x++) {
      const t = y * W + x;
      this.paintTile(t, paint);
      let changed = false;
      for (let c = 0; c < 4; c++) if (Math.abs(paint[c] - this.paint[t * 4 + c]) > 1e-6) changed = true;
      if (changed) { this.paint.set(paint, t * 4); dirty.add(t); }
    }
    const near = (t: number, r: number, f: (x: number, y: number) => void) => {
      const x = t % W, y = (t - x) / W;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H) f(nx, ny);
      }
    };
    // How finely each is cut: the tiles that changed, and those beside them (a water tile's bank).
    for (const t of [...dirty]) near(t, 1, (x, y) => {
      const i = y * W + x, S = this.cut(x, y);
      if (S !== this.detail[i]) { this.detail[i] = S; dirty.add(i); }
    });
    // What's drawn changes up to two tiles round each tile that did: its sides' steps and faces (its neighbours'), the
    // water's bed, its paint (blended over the next tile and a little more). The country beyond meets the land's edge.
    for (const t of dirty) {
      near(t, 2, (x, y) => this.pending.add(Math.floor(y / CHUNK) * this.cols + Math.floor(x / CHUNK)));
      const x = t % W, y = (t - x) / W;
      if (this.beyond && (x === 0 || y === 0 || x === W - 1 || y === H - 1)) this.apronMoved = true;
    }
  }

  /** The chunks painted for an earthwork, swapped in together (and the country beyond made again, if the edge moved). */
  private swap() {
    const C = CHUNK * this.tile;
    let area: THREE.Box3 | null = new THREE.Box3();
    for (const k of this.built.keys()) {
      const x = this.x0 + (k % this.cols) * C, z = this.z0 + Math.floor(k / this.cols) * C;
      area.union(new THREE.Box3(new THREE.Vector3(x, -Infinity, z), new THREE.Vector3(x + C, Infinity, z + C)));
    }
    // The country beyond reaches out of sight: everywhere.
    if (this.apronMoved) area = null;
    this.adder.changeGround(area, () => {
      for (const [k, g] of this.built) this.setChunk(k, g);
      this.merge();
      if (this.apronMoved) { this.addApron(false); this.addApron(); }
    });
    this.built.clear();
    this.apronMoved = false;
    this.revision++;
  }

  /** The land's height (m) at a point of the world (x, z in metres), as drawn: the beds and cliffs too. */
  heightAt(x: number, z: number): number {
    const px = (x - this.x0) / this.tile, py = (z - this.z0) / this.tile;
    if (px >= 0 && py >= 0 && px <= this.width && py <= this.height) {
      const tx = Math.min(this.width - 1, Math.floor(px)), ty = Math.min(this.height - 1, Math.floor(py));
      return this.drawn(tx, ty, px - tx, py - ty);
    }
    return this.beyondAt(x, z);
  }

  /** Where a line of sight first meets the land, or null if it misses (on the CPU: no wait for the GPU). */
  hit(ray: { origin: THREE.Vector3; direction: THREE.Vector3 }, into = new THREE.Vector3()): THREE.Vector3 | null {
    const o = ray.origin, d = ray.direction, len = d.length();
    if (len === 0) return null;
    const dx = d.x / len, dy = d.y / len, dz = d.z / len;
    // Along the ray from where it comes down past the land's top to where it passes under its bottom (or a long way).
    let t = dy < 0 ? Math.max(0, (this.high + 1 - o.y) / dy) : 0;
    let end = dy < 0 ? (this.low - 1 - o.y) / dy : t + 4 * (this.width + this.height) * this.tile;
    // Only over what's drawn: the land's tiles and the country beyond's grid round them.
    const b = this.beyond, lx1 = this.x0 + this.width * this.tile, lz1 = this.z0 + this.height * this.tile;
    const box: [number, number, number, number][] = [
      [o.x, dx, Math.min(this.x0, b ? b.x0 : Infinity), Math.max(lx1, b ? b.x0 + (b.nx - 1) * b.cell : -Infinity)],
      [o.z, dz, Math.min(this.z0, b ? b.z0 : Infinity), Math.max(lz1, b ? b.z0 + (b.nz - 1) * b.cell : -Infinity)],
    ];
    for (const [from, along, lo, hi] of box) {
      if (Math.abs(along) < 1e-12) { if (from < lo || from > hi) return null; continue; }
      const p = (lo - from) / along, q = (hi - from) / along;
      t = Math.max(t, Math.min(p, q)); end = Math.min(end, Math.max(p, q));
    }
    if (t > end) return null;
    const step = 0.5, above = (s: number) => o.y + dy * s - this.heightAt(o.x + dx * s, o.z + dz * s);
    // Under the land where it comes in (from under it, or through the world's side, which has no wall), it meets nothing
    // drawn until it's out over it (the land is seen only from above), so only a crossing from over it to under counts.
    let over = above(t) >= 0;
    for (let last = t; last < end;) {
      const s = Math.min(last + step, end), h = above(s);
      if (h > 0 || !over) { over ||= h > 0; last = s; continue; }
      // Narrowed down between the last step above the land and this one.
      let a = last, b = s;
      for (let k = 0; k < 24; k++) { const m = (a + b) / 2; if (above(m) > 0) a = m; else b = m; }
      return into.set(o.x + dx * b, o.y + dy * b, o.z + dz * b);
    }
    return null;
  }

  // ---- The shape ----

  /** A tile's height (m) at (u, v) across it, as drawn: the smooth surface, hollowed under water. */
  private drawn(tx: number, ty: number, u: number, v: number): number {
    const h = this.surface.on(tx, ty, u, v) * this.level;
    return this.cover[ty * this.width + tx] === LAND_COVER.water ? h - this.carve(tx + u, ty + v) : h;
  }

  /** How far (m) the water's bed lies under its tiles' level at a point (in tiles): nothing at the bank, BED in from it. */
  private carve(px: number, py: number): number {
    let d = BANK;
    const fx = Math.floor(px), fy = Math.floor(py);
    for (let y = fy - 1; y <= fy + 1; y++) for (let x = fx - 1; x <= fx + 1; x++) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height || this.cover[y * this.width + x] === LAND_COVER.water) continue;
      const ex = Math.max(x - px, 0, px - (x + 1)), ey = Math.max(y - py, 0, py - (y + 1));
      d = Math.min(d, Math.hypot(ex, ey));
    }
    return BED * smooth(0, BANK, d);
  }

  /** The land's upward normal at (u, v) across a tile. */
  private normal(tx: number, ty: number, u: number, v: number, out: THREE.Vector3) {
    const [hx, hz] = this.surface.slope(tx, ty, u, v), k = this.level / this.tile;
    let gx = hx * k, gz = hz * k;
    if (this.cover[ty * this.width + tx] === LAND_COVER.water) {
      const e = 0.02, px = tx + u, py = ty + v;
      gx -= (this.carve(px + e, py) - this.carve(px - e, py)) / (2 * e * this.tile);
      gz -= (this.carve(px, py + e) - this.carve(px, py - e)) / (2 * e * this.tile);
    }
    return out.set(-gx, 1, -gz).normalize();
  }

  /** How finely to cut a tile: the fewest pieces a side that keep within TOLERANCE, and no fewer than where it is needs. */
  private cut(x: number, y: number): number {
    const bend = this.surface.bend(x, y) * this.level, m = this.map;
    const off = Math.max(m.x - 1 - x, x - (m.x + m.width), m.y - 1 - y, y - (m.y + m.height), 0);
    let least = off <= NEAR_MAP ? 4 : off <= NEAR_COUNTRY ? 2 : 1;
    // The water's tiles by a bank, finely, so the bed's slope up to it is drawn.
    if (this.nearBank(x, y)) least = Math.max(least, 4);
    return DETAILS.find((S) => S >= least && bend / (S * S) <= TOLERANCE) ?? 8;
  }

  /** Whether a water tile has dry ground beside it (its bed rises to the bank inside it). */
  private nearBank(x: number, y: number) {
    if (this.cover[y * this.width + x] !== LAND_COVER.water) return false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < this.width && ny < this.height && this.cover[ny * this.width + nx] !== LAND_COVER.water) return true;
    }
    return false;
  }

  /** Whether the land runs on smoothly from a tile across a side (their corners along it meet); false off the land. */
  private joins(x: number, y: number, side: number): boolean {
    const nx = x + SIDES[side][0], ny = y + SIDES[side][1];
    if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) return false;
    const a = this.sideOf(x, y, side), b = this.sideOf(nx, ny, (side + 2) % 4);
    return a[0] === b[0] && a[1] === b[1];
  }

  /** A tile's levels at its side's two ends: north and south west to east, east and west north to south. */
  private sideOf(x: number, y: number, side: number): [number, number] {
    const c = this.relief.corner, k = (y * this.width + x) * 4;
    switch (side) {
      case 0: return [c[k], c[k + 1]];
      case 1: return [c[k + 1], c[k + 2]];
      case 2: return [c[k + 3], c[k + 2]];
      default: return [c[k], c[k + 3]];
    }
  }

  /** How many pieces a tile's side is cut into: as finely as the finer of it and its neighbour, so their edges meet point for point. */
  private steps(x: number, y: number, side: number): number {
    const own = this.detail[y * this.width + x], nx = x + SIDES[side][0], ny = y + SIDES[side][1];
    if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) return own;
    return Math.max(own, this.detail[ny * this.width + nx]);
  }

  /** The land's lowest and highest drawn points. */
  private bounds() {
    let lo = Infinity, hi = -Infinity;
    for (const c of this.relief.corner) { lo = Math.min(lo, c); hi = Math.max(hi, c); }
    this.low = lo * this.level - BED - 1; this.high = (hi + 1) * this.level;
    const b = this.beyond;
    if (b) for (const h of b.height) { this.low = Math.min(this.low, h); this.high = Math.max(this.high, h); }
  }

  // ---- The paint ----

  /**
   * How dry each tile lies: high ground and ground far from water are dry, blurred over a few tiles so it follows the
   * land's lie. Found again for the tiles whose height changed in `moved` (all of it, and how far each is from the water,
   * if null); the tiles whose dryness that changed.
   */
  private dryness(moved: Window | null): Window {
    const W = this.width, H = this.height, n = W * H, R = DRY_BLUR, c = this.relief.corner;
    if (!moved) {
      const dist = this.wet.fill(Infinity), queue: number[] = [];
      for (let i = 0; i < n; i++) if (this.cover[i] === LAND_COVER.water) { dist[i] = 0; queue.push(i); }
      for (let q = 0; q < queue.length; q++) {
        const i = queue[q], x = i % W, y = (i - x) / W;
        for (const [dx, dy] of SIDES) {
          const nx = x + dx, ny = y + dy, j = ny * W + nx;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || dist[j] <= dist[i] + 1) continue;
          dist[j] = dist[i] + 1; queue.push(j);
        }
      }
    }
    const w = moved ?? { x0: 0, y0: 0, x1: W, y1: H };
    for (let y = w.y0; y < w.y1; y++) for (let x = w.x0; x < w.x1; x++) {
      const i = y * W + x, level = (c[i * 4] + c[i * 4 + 1] + c[i * 4 + 2] + c[i * 4 + 3]) / 4;
      this.raw[i] = 0.6 * Math.min(1, Math.max(0, level / 10)) + 0.4 * (1 - Math.exp(-Math.min(this.wet[i], 40) / 4));
    }
    // Blurred along the rows, then down the columns: each spreads what changed R tiles further.
    const bx0 = Math.max(0, w.x0 - R), bx1 = Math.min(W, w.x1 + R), by0 = Math.max(0, w.y0 - R), by1 = Math.min(H, w.y1 + R);
    for (let y = w.y0; y < w.y1; y++) for (let x = bx0; x < bx1; x++) {
      let s = 0, k = 0;
      for (let d = -R; d <= R; d++) { const xx = x + d; if (xx >= 0 && xx < W) { s += this.raw[y * W + xx]; k++; } }
      this.rowDry[y * W + x] = s / k;
    }
    for (let y = by0; y < by1; y++) for (let x = bx0; x < bx1; x++) {
      let s = 0, k = 0;
      for (let d = -R; d <= R; d++) { const yy = y + d; if (yy >= 0 && yy < H) { s += this.rowDry[yy * W + x]; k++; } }
      this.dry[y * W + x] = s / k;
    }
    return { x0: bx0, y0: by0, x1: bx1, y1: by1 };
  }

  /** A tile's paint (linear RGB, and how much of the meadow's drift it takes), into `out` from `o`. */
  private paintTile(t: number, out: Float32Array, o = 0) {
    const c = SCRATCH.a, cover = this.cover[t];
    switch (cover) {
      case LAND_COVER.bare: c.copy(COL.bare); break;
      case LAND_COVER.track: c.copy(COL.track); break;
      case LAND_COVER.rock: c.copy(COL.lush).lerp(COL.dry, this.dry[t]).lerp(COL.rock, 0.65); break;
      case LAND_COVER.woods: c.copy(COL.floor); break;
      case LAND_COVER.water: c.copy(COL.bed); break;
      default: c.copy(COL.lush).lerp(COL.dry, this.dry[t]);
    }
    if (cover !== LAND_COVER.water) this.tint(c, this.ground[t]);
    const x = t % this.width, y = (t - x) / this.width;
    if (!this.onMap(x, y)) this.dull(c);
    out[o] = c.r; out[o + 1] = c.g; out[o + 2] = c.b; out[o + 3] = (PAINT[cover] ?? PAINT[0]).meadow;
  }

  /** A colour as a kind of ground tints it (subtly: the cover's own colour leads). */
  private tint(c: THREE.Color, kind: number) {
    const g = GROUND_TINT[kind], k = this.look.groundTint;
    if (!g || k === 0) return;
    c.lerp(g.toward, g.mix * k);
    c.multiplyScalar(1 + g.lift * k * 2);
  }

  /** A colour as the country beyond the map has it: a little duller, so where the player can build reads at a glance. */
  private dull(c: THREE.Color) {
    const { light, chroma } = this.look.beyond, y = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    c.setRGB((y + (c.r - y) * chroma) * light, (y + (c.g - y) * chroma) * light, (y + (c.b - y) * chroma) * light);
  }

  private onMap(x: number, y: number) { const m = this.map; return x >= m.x && y >= m.y && x < m.x + m.width && y < m.y + m.height; }

  /**
   * The ground's colour at a point (tiles), into `c`, and how much of the meadow's drift it takes: the tiles' paints blended
   * between their middles, over a point that wanders a little, so a cover's edge is a painted one, not the tiles' grid.
   */
  private colourAt(px: number, py: number, c: THREE.Color): number {
    const wx = px + 0.35 * noise2(px * 0.55 + 17, py * 0.55 - 5), wy = py + 0.35 * noise2(px * 0.55 - 31, py * 0.55 + 9);
    const fx = wx - 0.5, fy = wy - 0.5, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy, p = this.paint;
    const xa = Math.min(this.width - 1, Math.max(0, ix)), xb = Math.min(this.width - 1, Math.max(0, ix + 1));
    const ya = Math.min(this.height - 1, Math.max(0, iy)), yb = Math.min(this.height - 1, Math.max(0, iy + 1));
    const o00 = (ya * this.width + xa) * 4, o10 = (ya * this.width + xb) * 4, o01 = (yb * this.width + xa) * 4, o11 = (yb * this.width + xb) * 4;
    const w00 = (1 - u) * (1 - v), w10 = u * (1 - v), w01 = (1 - u) * v, w11 = u * v;
    const r = p[o00] * w00 + p[o10] * w10 + p[o01] * w01 + p[o11] * w11, g = p[o00 + 1] * w00 + p[o10 + 1] * w10 + p[o01 + 1] * w01 + p[o11 + 1] * w11;
    const b = p[o00 + 2] * w00 + p[o10 + 2] * w10 + p[o01 + 2] * w01 + p[o11 + 2] * w11, m = p[o00 + 3] * w00 + p[o10 + 3] * w10 + p[o01 + 3] * w01 + p[o11 + 3] * w11;
    c.setRGB(r, g, b);
    return m;
  }

  // ---- The mesh ----

  /** A chunk's mesh made of `g` (none: taken out), in place of the one it had, which is freed; in the country, its piece's
   * made again (merge). */
  private setChunk(k: number, g: THREE.BufferGeometry | null) {
    if (this.pieceOf[k] >= 0) {
      this.geometries[k]?.dispose();
      this.geometries[k] = g;
      this.stale.add(this.pieceOf[k]);
      return;
    }
    const old = this.chunks[k];
    if (old) this.adder.remove(old);
    this.geometries[k]?.dispose();
    this.geometries[k] = g;
    this.chunks[k] = g && this.adder.add(g, 'ground', { under: true, tile: CHUNK * this.tile, fields: this.fields });
  }

  /** The pieces whose chunks changed, made again: their chunks' geometries as one mesh, in place of the one each had. */
  private merge() {
    for (const p of this.stale) {
      const piece = this.pieces.get(p)!;
      if (piece.mesh) this.adder.remove(piece.mesh);
      piece.geometry?.dispose();
      const parts = piece.chunks.map((k) => this.geometries[k]).filter((g): g is THREE.BufferGeometry => g !== null);
      // (The chunks' colours are the land's own: only the piece is prepared, so the season turns them once.)
      const g = parts.length ? mergeGeometries(parts) : null;
      if (g) this.adder.prepare(g);
      piece.geometry = g;
      piece.mesh = g && this.adder.add(g, 'ground', { under: true, tile: PIECE * CHUNK * this.tile, fields: this.fields });
    }
    this.stale.clear();
  }

  /** The country beyond's mesh made and added (`make` false: only the one it had taken out, and freed). */
  private addApron(make = true) {
    if (this.apron) this.adder.remove(this.apron);
    this.apronGeometry?.dispose();
    this.apronGeometry = make ? this.apronMesh() : null;
    // (In big tiles: 64 m made about 490 meshes on the game's maps, each costing the CPU as it's drawn, and its triangles
    // are coarse, so the tiles off screen cost the GPU little, #210.)
    this.apron = this.apronGeometry && this.adder.add(this.apronGeometry, 'ground', { under: true, tile: APRON_TILE, fields: this.fields });
  }

  /** A chunk's mesh, null if it has none (the land is narrower than its chunks). */
  private chunkGeometry(k: number): THREE.BufferGeometry | null {
    const cx = k % this.cols, cy = Math.floor(k / this.cols), b = new MeshBuilder('paint');
    for (let y = cy * CHUNK; y < Math.min(this.height, (cy + 1) * CHUNK); y++) for (let x = cx * CHUNK; x < Math.min(this.width, (cx + 1) * CHUNK); x++) {
      this.top(b, x, y);
      for (let side = 0; side < 4; side++) {
        const nx = x + SIDES[side][0], ny = y + SIDES[side][1];
        if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) this.face(b, x, y, side, null);
        else if (!this.joins(x, y, side)) this.face(b, x, y, side, [nx, ny]);
      }
    }
    if (b.vertexCount === 0) return null;
    // What the renderer works out from a ground mesh, worked out here, as it's painted, rather than when it's swapped in.
    const g = b.build();
    // (A piece's chunks are prepared together, once merged.)
    if (this.pieceOf[k] < 0) this.adder.prepare(g);
    return g;
  }

  /** The height (m) of the vertex `vertex` added last. */
  private vy = 0;

  /** A vertex of a tile's top at (u, v) across it. */
  private vertex(b: MeshBuilder, tx: number, ty: number, u: number, v: number): number {
    const px = tx + u, py = ty + v, y = this.vy = this.drawn(tx, ty, u, v), n = this.normal(tx, ty, u, v, SCRATCH.n), c = SCRATCH.c;
    const meadow = this.colourAt(px, py, c), cover = this.cover[ty * this.width + tx], wx = this.x0 + px * this.tile, wz = this.z0 + py * this.tile;
    // The meadow's drift: rises lime, hollows emerald, in broad soft patches.
    const k = noise2(wx * 0.02 + 7, wz * 0.02 - 3) * 0.5 + 0.5;
    c.lerp(COL.lime, smooth(0.55, 0.9, k) * 0.35 * meadow).lerp(COL.emerald, smooth(0.6, 0.95, 1 - k) * 0.35 * meadow);
    // A steep bank wears to bare turf.
    const steep = smooth(0.35, 0.9, Math.hypot(n.x, n.z) / Math.max(1e-3, n.y));
    if (cover !== LAND_COVER.water) c.lerp(COL.worn, steep * 0.5);
    // The bed darkens as it deepens.
    if (cover === LAND_COVER.water) c.lerp(COL.deep, (this.carve(px, py) / BED) * 0.7);
    const pt = PAINT[cover] ?? PAINT[0];
    const drift = Math.min(1, pt.drift + steep * 0.4 + noise2(wx * 0.21 + 3, wz * 0.21 - 9) * 0.15);
    return b.vertex({ x: wx, y, z: wz }, n, c, [drift, pt.brush, 0.7 + noise2(wx * 0.05, wz * 0.05) * 0.9, 0]);
  }

  /**
   * A tile's top, cut into its detail's cells. Where a side is cut finer (to meet a finer neighbour point for point), the
   * cells along it are drawn as a fan from their middle, through every point on their sides.
   */
  private top(b: MeshBuilder, x: number, y: number) {
    const S = this.detail[y * this.width + x], E = [0, 1, 2, 3].map((side) => this.steps(x, y, side));
    const grid: number[] = [], hs: number[] = [];
    for (let j = 0; j <= S; j++) for (let i = 0; i <= S; i++) { grid.push(this.vertex(b, x, y, i / S, j / S)); hs.push(this.vy); }
    const g = (i: number, j: number) => grid[j * (S + 1) + i], h = (i: number, j: number) => hs[j * (S + 1) + i];
    // Triangles listed round a cell as its ring runs (north-west, north-east, south-east, south-west) face down: each is
    // laid the other way round, to face up.
    const up = (a: number, c: number, d: number) => b.tri(a, d, c);
    for (let cj = 0; cj < S; cj++) for (let ci = 0; ci < S; ci++) {
      const ring: number[] = [g(ci, cj)];
      const extra = (side: number, from: number, at: (s: number) => [number, number]) => {
        const m = E[side] / S;
        for (let k = 1; k < m; k++) { const [u, v] = at((from * m + (side >= 2 ? -k : k)) / E[side]); ring.push(this.vertex(b, x, y, u, v)); }
      };
      if (cj === 0) extra(0, ci, (s) => [s, 0]);
      ring.push(g(ci + 1, cj));
      if (ci === S - 1) extra(1, cj, (s) => [1, s]);
      ring.push(g(ci + 1, cj + 1));
      if (cj === S - 1) extra(2, ci + 1, (s) => [s, 1]);
      ring.push(g(ci, cj + 1));
      if (ci === 0) extra(3, cj + 1, (s) => [0, s]);
      if (ring.length === 4) {
        if (splitsNwSe([h(ci, cj), h(ci + 1, cj), h(ci + 1, cj + 1), h(ci, cj + 1)])) { up(ring[0], ring[1], ring[2]); up(ring[0], ring[2], ring[3]); }
        else { up(ring[0], ring[1], ring[3]); up(ring[1], ring[2], ring[3]); }
        continue;
      }
      const mid = this.vertex(b, x, y, (ci + 0.5) / S, (cj + 0.5) / S);
      for (let k = 0; k < ring.length; k++) up(mid, ring[k], ring[(k + 1) % ring.length]);
    }
  }

  /** The height (m) along a tile's side as its top is drawn (straight between the points it is cut into), at s (0..1) along it. */
  private sideLine(x: number, y: number, side: number): (s: number) => number {
    const E = this.steps(x, y, side), at = SIDE_AT[side];
    const hs = Array.from({ length: E + 1 }, (_, k) => { const [u, v] = at(k / E); return this.drawn(x, y, u, v); });
    return (s) => { const a = Math.min(E - 1, Math.floor(s * E)), f = s * E - a; return hs[a] + (hs[a + 1] - hs[a]) * f; };
  }

  /**
   * The face along one side of a tile, from its top down to the neighbour's (`next`), where its top stands above it: a
   * turf lip, then bands of earth or stone. Off the land's edge (`next` null), a skirt a little way down, so no crack shows
   * between it and the country beyond.
   */
  private face(b: MeshBuilder, x: number, y: number, side: number, next: [number, number] | null) {
    const own = this.sideLine(x, y, side), low = next ? this.sideLine(next[0], next[1], (side + 2) % 4) : (s: number) => own(s) - SKIRT;
    const steps = next ? Math.max(this.steps(x, y, side), this.steps(next[0], next[1], (side + 2) % 4)) : this.steps(x, y, side);
    const [a, c] = SIDE_ENDS[side], out = SCRATCH.out.set(SIDES[side][0], 0, SIDES[side][1]), onMap = this.onMap(x, y);
    const wx = (u: number) => this.x0 + (x + u) * this.tile, wz = (v: number) => this.z0 + (y + v) * this.tile;
    const lipColour = SCRATCH.lip.copy(COL.lip), floor = SCRATCH.floor.copy(COL.floor);
    if (!onMap) { this.dull(lipColour); this.dull(floor); }
    for (let k = 0; k < steps; k++) {
      const s0 = k / steps, s1 = (k + 1) / steps, top: Line = [own(s0), own(s1)], bottom: Line = [low(s0), low(s1)];
      if (top[0] <= bottom[0] + 1e-6 && top[1] <= bottom[1] + 1e-6) continue;
      const p0: [number, number] = [wx(a[0] + (c[0] - a[0]) * s0), wz(a[1] + (c[1] - a[1]) * s0)];
      const p1: [number, number] = [wx(a[0] + (c[0] - a[0]) * s1), wz(a[1] + (c[1] - a[1]) * s1)];
      if (!next) { band(b, p0, p1, [bottom], [top], floor, out, FACE_PAINT); continue; }
      const under: Line = [top[0] - LIP, top[1] - LIP];
      band(b, p0, p1, [bottom, under], [top], lipColour, out, FACE_PAINT);
      const L = this.level, from = Math.floor(Math.min(...bottom) / L / STRATUM), to = Math.ceil(Math.max(...under) / L / STRATUM);
      for (let n = from; n < to; n++) {
        const lo = n * STRATUM * L, hi = (n + 1) * STRATUM * L, shade = SCRATCH.band.copy((n * STRATUM >= STONE_FROM ? STONE : EARTH)[n & 1]);
        if (!onMap) this.dull(shade);
        band(b, p0, p1, [bottom, [lo, lo]], [under, [hi, hi]], shade, out, FACE_PAINT);
      }
    }
  }

  // ---- The country beyond ----

  /** The country beyond's height (m) at a point: its grid's, carried on from the land's edge where it meets it. */
  private beyondAt(x: number, z: number): number {
    const b = this.beyond;
    const ex = Math.min(this.x0 + this.width * this.tile, Math.max(this.x0, x)), ez = Math.min(this.z0 + this.height * this.tile, Math.max(this.z0, z));
    const edge = () => this.heightAt(ex, ez);
    if (!b) return edge();
    const fx = Math.min(b.nx - 1.001, Math.max(0, (x - b.x0) / b.cell)), fz = Math.min(b.nz - 1.001, Math.max(0, (z - b.z0) / b.cell));
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, H = b.height, at = (a: number, c: number) => H[c * b.nx + a];
    const far = (at(i, j) * (1 - u) + at(i + 1, j) * u) * (1 - v) + (at(i, j + 1) * (1 - u) + at(i + 1, j + 1) * u) * v;
    // Within a cell of the land's edge, from the edge's height to the grid's, so the two meet.
    const k = smooth(0, b.cell, Math.hypot(x - ex, z - ez));
    return k >= 1 ? far : edge() + (far - edge()) * k;
  }

  /** The country beyond as one mesh: distant woods' floor on a coarse grid round the land, its lines meeting the land's edges. */
  private apronMesh(): THREE.BufferGeometry | null {
    const bd = this.beyond;
    if (!bd) return null;
    const lx0 = this.x0, lx1 = this.x0 + this.width * this.tile, lz0 = this.z0, lz1 = this.z0 + this.height * this.tile;
    const lines = (from: number, n: number, edges: number[]) => [...new Set([...Array.from({ length: n }, (_, k) => from + k * bd.cell), ...edges])].sort((p, q) => p - q);
    const xs = lines(bd.x0, bd.nx, [lx0, lx1]), zs = lines(bd.z0, bd.nz, [lz0, lz1]), b = new MeshBuilder('paint'), nx = xs.length;
    const c = SCRATCH.c, n = SCRATCH.n, e = 1;
    for (const z of zs) for (const x of xs) {
      const y = this.heightAt(x, z);
      n.set(this.heightAt(x - e, z) - this.heightAt(x + e, z), 2 * e, this.heightAt(x, z - e) - this.heightAt(x, z + e)).normalize();
      const k = noise2(x * 0.015 + 2, z * 0.015 + 8) * 0.5 + 0.5;
      c.copy(COL.floor).lerp(COL.emerald, k * 0.3);
      this.dull(c);
      b.vertex({ x, y, z }, n, c, [0.3, 1.5, 0.7, 0]);
    }
    for (let j = 0; j + 1 < zs.length; j++) for (let i = 0; i + 1 < nx; i++) {
      // Not where the land is.
      if (xs[i] >= lx0 && xs[i + 1] <= lx1 && zs[j] >= lz0 && zs[j + 1] <= lz1) continue;
      const a = j * nx + i;
      // (Rows run south, columns east: laid this way round to face up.)
      b.quad(a, a + nx, a + nx + 1, a + 1);
    }
    return b.vertexCount ? b.build() : null;
  }
}

type Line = [number, number];
/** A window of tiles, [x0, x1) × [y0, y1). */
interface Window { x0: number; y0: number; x1: number; y1: number }
/** An earthwork's change, given and not yet fitted: the tiles it changed, those round which the ground is fitted again
 * (none: only its paint changed), those whose paint did, and whether the water moved. */
interface Change { dirty: Set<number>; fit: Window | null; paint: Window | null; watered: boolean }
/** An earthwork's tiles as they were when it was taken up: worked, cover and ground, three values a tile (begin). */
interface Taken { tiles: number[]; values: Uint8Array }
/** A window grown to take in a tile (from nothing, if null). */
const grown = (w: Window | null, x: number, y: number): Window => w
  ? { x0: Math.min(w.x0, x), y0: Math.min(w.y0, y), x1: Math.max(w.x1, x + 1), y1: Math.max(w.y1, y + 1) }
  : { x0: x, y0: y, x1: x + 1, y1: y + 1 };
/** How far (tiles) the dryness is blurred, each way. */
const DRY_BLUR = 3;
/** Where along a tile's side a point s (0 to 1, in the order sideOf lists its ends) lies across the tile. */
const SIDE_AT: ((s: number) => [number, number])[] = [(s) => [s, 0], (s) => [1, s], (s) => [s, 1], (s) => [0, s]];
/** The two ends of a tile's side, across the tile (u, v), in the order sideOf lists them. */
const SIDE_ENDS: [[number, number], [number, number]][] = [[[0, 0], [1, 0]], [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[0, 0], [0, 1]]];
const SCRATCH = {
  a: new THREE.Color(), c: new THREE.Color(), lip: new THREE.Color(), floor: new THREE.Color(), band: new THREE.Color(),
  n: new THREE.Vector3(), out: new THREE.Vector3(),
};
const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3();

/**
 * The part of a face between the highest of `lows` and the lowest of `highs` (each a straight line from p0 to p1, metres),
 * in one colour, facing `out`: cut where any two lines cross, so each piece is a quad or a triangle.
 */
function band(b: MeshBuilder, p0: [number, number], p1: [number, number], lows: Line[], highs: Line[], colour: THREE.Color, out: THREE.Vector3, paint: Paint) {
  const lines = [...lows, ...highs], cuts = [0, 1];
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const d0 = lines[i][0] - lines[j][0], d1 = lines[i][1] - lines[j][1];
    if ((d0 < 0 && d1 > 0) || (d0 > 0 && d1 < 0)) cuts.push(d0 / (d0 - d1));
  }
  cuts.sort((p, q) => p - q);
  const at = (f: Line, u: number) => f[0] + (f[1] - f[0]) * u;
  const lo = (u: number) => Math.max(...lows.map((f) => at(f, u))), hi = (u: number) => Math.min(...highs.map((f) => at(f, u)));
  for (let k = 0; k + 1 < cuts.length; k++) {
    const u0 = cuts[k], u1 = cuts[k + 1];
    if (u1 - u0 < 1e-6) continue;
    const l0 = lo(u0), l1 = lo(u1), h0 = hi(u0), h1 = hi(u1);
    if (h0 - l0 < 1e-6 && h1 - l1 < 1e-6) continue;
    const p = (u: number, y: number) => ({ x: p0[0] + (p1[0] - p0[0]) * u, y, z: p0[1] + (p1[1] - p0[1]) * u });
    const q = [p(u0, l0), p(u0, Math.max(l0, h0)), p(u1, Math.max(l1, h1)), p(u1, l1)];
    const i0 = b.vertex(q[0], out, colour, paint), i1 = b.vertex(q[1], out, colour, paint), i2 = b.vertex(q[2], out, colour, paint), i3 = b.vertex(q[3], out, colour, paint);
    // Facing out: the way round whose normal (across its diagonals, which holds for a quad squeezed to a triangle too)
    // points along `out`.
    ab.set(q[2].x - q[0].x, q[2].y - q[0].y, q[2].z - q[0].z); ac.set(q[3].x - q[1].x, q[3].y - q[1].y, q[3].z - q[1].z);
    if (cross.crossVectors(ab, ac).dot(out) >= 0) b.quad(i0, i1, i2, i3); else b.quad(i0, i3, i2, i1);
  }
}
