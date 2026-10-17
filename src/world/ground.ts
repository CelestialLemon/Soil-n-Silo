import * as THREE from 'three';
import { FLAG, linearColor as lin, type PixelObject, type PixelRenderer } from 'pixel3d-renderer';
import { TERRAIN, type Land } from '../game/map.ts';
import { baseLevel, centreLevel, corners, heightAt, inRelief, sheetAt, sideOf, SIDES, splitsNwSe, spanOf, STEEP, type Relief } from '../game/relief.ts';
import { reliefOf, type GameState } from '../game/state.ts';
import { hash } from './kit.ts';

// The ground: each land tile's top over its four corners, shaded smooth across the tiles it joins so slopes roll rather than
// facet, and the cliff faces where it stands above a neighbour, banded like strata under a lip of turf. The country beyond the map is built once into the static scene
// (terrain.ts); the map's own ground is drawn as objects in chunks (`MapGround`), so earthworks can redraw what they change.

/** How high one level stands, in metres. */
export const LEVEL_HEIGHT = 0.25;

/** The ground's height in metres at a point of a relief (tiles). */
export const groundY = (r: Relief, x: number, z: number) => heightAt(r, x, z) * LEVEL_HEIGHT;

/**
 * The height (m) a building `n` tiles a side stands at with its north-west tile at (x, y): the ground under a one-tile
 * building's centre, else the highest of its tiles (they are level, but for a field over a ramp).
 */
export function standY(r: Relief, n: number, x: number, y: number) {
  if (n === 1) return groundY(r, x + 0.5, y + 0.5);
  let top = 0;
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) if (inRelief(r, tx, ty)) top = Math.max(top, centreLevel(r, tx, ty));
  return top * LEVEL_HEIGHT;
}

/**
 * Lays a flat tile-sized object (a soil bed, an overlay tile) on a tile of the relief, lifted `lift` above it: on a slope it
 * is tilted to the plane that best fits the tile's corners and stretched along it. Writes the transform into `pos`, `rot`
 * and `scale`.
 */
export function lay(r: Relief, x: number, y: number, lift: number, pos: THREE.Vector3, rot: THREE.Euler, scale: THREE.Vector3, yaw = 0) {
  const [nw, ne, se, sw] = corners(r, x, y);
  // How far the ground rises across the tile eastwards (+x) and southwards (+z), in metres.
  const gx = (ne + se - nw - sw) / 2 * LEVEL_HEIGHT, gz = (sw + se - nw - ne) / 2 * LEVEL_HEIGHT;
  pos.set(x + 0.5, centreLevel(r, x, y) * LEVEL_HEIGHT + lift, y + 0.5);
  if (!gx && !gz) { rot.set(0, yaw, 0); scale.set(1, 1, 1); return; }
  // Rising south tips the near edge up, a turn back about x; rising east, a turn about z.
  rot.set(-Math.atan(gz), 0, Math.atan(gx));
  scale.set(Math.hypot(1, gx), 1, Math.hypot(1, gz));
}

/** Grass by fertility band: dry and yellow-green on poor soil, deep green on rich. */
export const GRASS = [[0xa8a860, 0xb0ae66], [0x92a456, 0x98aa5a], [0x7c9e4c, 0x82a450], [0x6c9846, 0x72a04a], [0x5e9042, 0x649646]];
/** A steep bank's top: worn turf, ground trucks can't drive that you can pick out at a glance. */
const BANK = [0xa6a064, 0xaea86a];
/** Cliff faces: earth for the low levels, stone higher up, STRATUM levels a band; the turf lip along the top. */
const EARTH = [0x9c7e5a, 0x8c714f], STONE = [0x8e877a, 0x807a6e], LIP = 0x5d7d3a;
/** How deep the turf lip over a cliff is (m). */
const LIP_DEPTH = 0.09;
/** Levels a band of a cliff's strata, and the level from which cliffs are stone. */
const STRATUM = 2, STONE_FROM = 8;

/** Every colour the ground uses, so the palette can be chosen with them (MapGround's swatch). */
const COLOURS = [...GRASS.flat(), ...BANK, ...EARTH, ...STONE, LIP];

const OUT: readonly (readonly [number, number])[] = SIDES;

type Vec = readonly number[];

/**
 * Triangles being gathered, as positions, normals and linear colours (three numbers a vertex), ready for a static collector
 * or an object.
 */
export class Tris {
  readonly pos: number[] = [];
  readonly nrm: number[] = [];
  readonly col: number[] = [];
  /** How a colour is turned into the one drawn (the palette's choice, once known). */
  private readonly paint: (hex: number) => [number, number, number];
  constructor(paint: (hex: number) => [number, number, number] = (hex) => lin(hex)) { this.paint = paint; }

  /**
   * A triangle, wound so that it faces `out` (its normal has a positive dot with it); shaded flat, or smooth with a normal
   * given for each corner.
   */
  tri(a: Vec, b: Vec, c: Vec, hex: number, out: Vec, normals?: readonly [Vec, Vec, Vec]) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], len = Math.hypot(n[0], n[1], n[2]);
    if (len < 1e-9) return;
    const flip = n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0, rgb = this.paint(hex), f = (flip ? -1 : 1) / len;
    const face = [n[0] * f, n[1] * f, n[2] * f], ns = normals ?? [face, face, face];
    const order = flip ? [0, 2, 1] : [0, 1, 2], vs = [a, b, c];
    for (const k of order) {
      const v = vs[k], m = ns[k];
      this.pos.push(v[0], v[1], v[2]); this.nrm.push(m[0], m[1], m[2]); this.col.push(rgb[0], rgb[1], rgb[2]);
    }
  }

  quad(a: Vec, b: Vec, c: Vec, d: Vec, hex: number, out: Vec) {
    this.tri(a, b, c, hex, out); this.tri(a, c, d, hex, out);
  }

  get empty() { return this.pos.length === 0; }

  /** The triangles as a geometry, for `pushPrepared` or `addObject`. */
  geometry(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aFlag', new THREE.Float32BufferAttribute(new Float32Array(this.pos.length / 3).fill(FLAG.NORMAL), 1));
    return g;
  }
}

const H = LEVEL_HEIGHT;

/** Where a tile's corners lie in the world: north-west, north-east, south-east, south-west. */
const cornerPoints = (x: number, y: number, c: readonly number[]): Vec[] =>
  [[x, c[0] * H, y], [x + 1, c[1] * H, y], [x + 1, c[2] * H, y + 1], [x, c[3] * H, y + 1]];

/** A tile's top as two triangles of its corners (by index), split along the diagonal relief.ts draws (`splitsNwSe`). */
const halves = (c: readonly number[]): [number, number, number][] => (splitsNwSe(c) ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]]);

const UP = [0, 1, 0];

/**
 * A tile's top over its corners (levels: north-west, north-east, south-east, south-west), at (x, y) in the world: shaded
 * smooth with a normal at each corner, or flat without.
 */
export function tileTop(t: Tris, x: number, y: number, c: readonly number[], hex: number, normals?: readonly Vec[]) {
  const p = cornerPoints(x, y, c);
  for (const [a, b, d] of halves(c)) t.tri(p[a], p[b], p[d], hex, UP, normals && [normals[a], normals[b], normals[d]]);
}

/** The upward normal of the triangle a, b, c (unnormalised: twice its area long). */
function faceNormal(a: Vec, b: Vec, c: Vec): number[] {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  return n[1] < 0 ? n.map((v) => -v) : n;
}

/**
 * The normals at a tile's four corners for smooth shading: at each, the mean of the faces of the top that meet there, over
 * every tile whose ground joins this one's at that point (relief.ts, `sheetAt`), so a slope shades as one surface across
 * tiles but a cliff's top edge stays sharp.
 */
export function cornerNormals(r: Relief, x: number, y: number): Vec[] {
  return [0, 1, 2, 3].map((k) => {
    const px = x + (k === 1 || k === 2 ? 1 : 0), py = y + (k >= 2 ? 1 : 0), sum = [0, 0, 0];
    for (const t of sheetAt(r, px, py, { x, y })) {
      const c = corners(r, t.x, t.y), p = cornerPoints(t.x, t.y, c);
      for (const tri of halves(c)) {
        if (!tri.includes(t.k)) continue;
        const n = faceNormal(p[tri[0]], p[tri[1]], p[tri[2]]);
        sum[0] += n[0]; sum[1] += n[1]; sum[2] += n[2];
      }
    }
    const len = Math.hypot(sum[0], sum[1], sum[2]);
    return len > 1e-9 ? sum.map((v) => v / len) : UP;
  });
}

/** The two ends of a tile's side in the world (x, z), in the order relief.ts lists side heights. */
function sideEnds(x: number, y: number, side: number): [[number, number], [number, number]] {
  switch (side) {
    case 0: return [[x, y], [x + 1, y]];
    case 1: return [[x + 1, y], [x + 1, y + 1]];
    case 2: return [[x, y + 1], [x + 1, y + 1]];
    default: return [[x, y], [x, y + 1]];
  }
}

type Line = [number, number];
const at = (f: Line, u: number) => f[0] + (f[1] - f[0]) * u;

/**
 * The part of a wall face between the highest of `lows` and the lowest of `highs` (each a straight line from one end of the
 * side to the other, in metres), in one colour: cut where any two lines cross, so each piece is a quad or a triangle.
 */
function band(t: Tris, a: [number, number], b: [number, number], lows: Line[], highs: Line[], hex: number, out: readonly number[]) {
  const lines = [...lows, ...highs], cuts = [0, 1];
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const d0 = lines[i][0] - lines[j][0], d1 = lines[i][1] - lines[j][1];
    if ((d0 < 0 && d1 > 0) || (d0 > 0 && d1 < 0)) cuts.push(d0 / (d0 - d1));
  }
  cuts.sort((p, q) => p - q);
  const lo = (u: number) => Math.max(...lows.map((f) => at(f, u))), hi = (u: number) => Math.min(...highs.map((f) => at(f, u)));
  for (let k = 0; k + 1 < cuts.length; k++) {
    const u0 = cuts[k], u1 = cuts[k + 1];
    if (u1 - u0 < 1e-6) continue;
    const l0 = lo(u0), l1 = lo(u1), h0 = hi(u0), h1 = hi(u1);
    if (h0 - l0 < 1e-6 && h1 - l1 < 1e-6) continue;
    const p = (u: number, y: number) => [a[0] + (b[0] - a[0]) * u, y, a[1] + (b[1] - a[1]) * u];
    t.quad(p(u0, l0), p(u0, Math.max(l0, h0)), p(u1, Math.max(l1, h1)), p(u1, l1), hex, out);
  }
}

/**
 * The cliff face along one side of a tile, from its own side heights `own` down to its neighbour's `below` (levels, in the
 * order relief.ts gives them), where it is the higher: a turf lip, then a band of earth or stone a level.
 */
export function cliff(t: Tris, x: number, y: number, side: number, own: Vec, below: Vec, tone: (hex: number) => number = (c) => c) {
  if (own[0] <= below[0] + 1e-9 && own[1] <= below[1] + 1e-9) return;
  const [a, b] = sideEnds(x, y, side), out = [OUT[side][0], 0, OUT[side][1]];
  const top: Line = [own[0] * H, own[1] * H], bottom: Line = [below[0] * H, below[1] * H], lip: Line = [top[0] - LIP_DEPTH, top[1] - LIP_DEPTH];
  band(t, a, b, [bottom, lip], [top], tone(LIP), out);
  const from = Math.floor(Math.min(below[0], below[1]) / STRATUM), to = Math.ceil(Math.max(own[0], own[1]) / STRATUM);
  for (let k = from; k < to; k++) {
    const lo = k * STRATUM * H, hi = (k + 1) * STRATUM * H, shades = k * STRATUM >= STONE_FROM ? STONE : EARTH;
    band(t, a, b, [bottom, [lo, lo]], [lip, [hi, hi]], tone(shades[k & 1]), out);
  }
}

/** A grass colour for a tile: its fertility band, and one of two shades by a hash of where it is; a steep bank is worn turf. */
export const grassOf = (fertility: number, x: number, y: number, steep = false) => (steep ? BANK : GRASS[Math.min(4, Math.floor(fertility / 20))])[hash(x, y) < 0.5 ? 0 : 1];

/** Whether a tile of a relief is a steep bank (worn turf). */
export const isBank = (r: Relief, x: number, y: number) => spanOf(r, x, y) >= STEEP;

/** The relief of the land around a map, indexed from the land's north-west corner (map tile (0, 0) is land tile (margin, margin)). */
export const landRelief = (land: Land): Relief => ({ width: land.width, height: land.height, corner: land.corner });

// ---- The map's ground, as objects ----

/** Tiles a side of one chunk of the map's ground. */
const CHUNK = 8;

/**
 * The map's own ground (every land tile on the map; water is the static scene's), drawn as objects a chunk at a time and
 * redrawn when earthworks change the levels under it. Its colours are chosen with the scene's palette: `geometries` (with a
 * swatch of every colour it uses) go to `quantizePalette`, then `show` reads back what each colour became, so chunks drawn
 * later match, and adds the chunks to the renderer.
 */
export class MapGround {
  /** Each chunk's object and its geometry (the renderer leaves disposing that to us), null where it has no land. */
  private readonly chunks: ({ o: PixelObject; g: THREE.BufferGeometry } | null)[] = [];
  /** The land's relief (the country beyond the map and the map), kept up with earthworks on the map: for smooth shading across the map's edge. */
  private readonly whole: Relief & { corner: number[] };
  private readonly swatch: THREE.BufferGeometry;
  private painted = new Map<number, [number, number, number]>();
  private relief = 0;
  readonly geometries: THREE.BufferGeometry[] = [];
  private r: PixelRenderer | null = null;
  private readonly s: GameState;
  private readonly land: Land;
  private readonly first: (THREE.BufferGeometry | null)[] = [];

  constructor(s: GameState, land: Land) {
    this.s = s; this.land = land;
    this.whole = { width: land.width, height: land.height, corner: [...land.corner] };
    this.copyMap();
    const sw = new Tris();
    COLOURS.forEach((c, i) => sw.tri([i, -50, 0], [i + 1, -50, 0], [i, -50, 1], c, [0, 1, 0]));
    this.swatch = sw.geometry();
    this.geometries.push(this.swatch);
    for (let cy = 0; cy * CHUNK < s.map.height; cy++) for (let cx = 0; cx * CHUNK < s.map.width; cx++) {
      const g = this.build(cx, cy);
      this.first.push(g);
      if (g) this.geometries.push(g);
    }
    this.relief = reliefOf(s);
  }

  /** Once the palette is chosen: reads back the colours it gave the ground, and adds the chunks to the renderer. */
  show(r: PixelRenderer) {
    this.r = r;
    const c = this.swatch.getAttribute('aColor');
    COLOURS.forEach((hex, i) => this.painted.set(hex, [c.getX(i * 3), c.getY(i * 3), c.getZ(i * 3)]));
    for (const g of this.first) this.chunks.push(g ? { o: this.add(g), g } : null);
    this.first.length = 0;
  }

  /** Copies the map's corners into the land's relief; the tiles that changed, by map index. */
  private copyMap(): number[] {
    const m = this.s.map, M = this.land.margin, changed: number[] = [];
    for (let i = 0; i < m.width * m.height; i++) {
      const x = i % m.width, y = Math.floor(i / m.width), j = ((y + M) * this.whole.width + x + M) * 4;
      let diff = false;
      for (let k = 0; k < 4; k++) if (this.whole.corner[j + k] !== m.corner[i * 4 + k]) { this.whole.corner[j + k] = m.corner[i * 4 + k]; diff = true; }
      if (diff) changed.push(i);
    }
    return changed;
  }

  private add(g: THREE.BufferGeometry) {
    if (!this.r) throw new Error('MapGround: show it before drawing more');
    const o = this.r.addObject(g);
    o.setTransform(new THREE.Vector3(0, 0, 0));
    return o;
  }

  /** Redraws the chunks whose tiles, or their neighbours, earthworks have changed since the last call. */
  sync() {
    if (!this.r) return;
    const v = reliefOf(this.s);
    if (v === this.relief) return;
    this.relief = v;
    const m = this.s.map, w = m.width, cols = Math.ceil(w / CHUNK), dirty = new Set<number>();
    for (const i of this.copyMap()) {
      const x = i % w, y = Math.floor(i / w);
      // Its neighbours' cliffs and their shading (which takes in the tiles round each corner) change with it.
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < m.height) dirty.add(Math.floor(ny / CHUNK) * cols + Math.floor(nx / CHUNK));
      }
    }
    for (const k of dirty) {
      const old = this.chunks[k];
      if (old) { old.o.remove(); old.g.dispose(); }
      const g = this.build(k % cols, Math.floor(k / cols));
      this.chunks[k] = g ? { o: this.add(g), g } : null;
    }
  }

  private build(cx: number, cy: number): THREE.BufferGeometry | null {
    const m = this.s.map, land = this.land, M = land.margin, lr = this.whole;
    const t = new Tris((hex) => this.painted.get(hex) ?? lin(hex));
    for (let y = cy * CHUNK; y < Math.min(m.height, (cy + 1) * CHUNK); y++) for (let x = cx * CHUNK; x < Math.min(m.width, (cx + 1) * CHUNK); x++) {
      const i = y * m.width + x;
      if (m.terrain[i] === TERRAIN.water) continue;
      tileTop(t, x, y, corners(m, x, y), grassOf(this.s.soilBase[i], x, y, isBank(m, x, y)), cornerNormals(lr, x + M, y + M));
      for (let side = 0; side < 4; side++) {
        const nx = x + SIDES[side][0], ny = y + SIDES[side][1], own = sideOf(m, x, y, side);
        const onMap = nx >= 0 && ny >= 0 && nx < m.width && ny < m.height;
        const water = onMap ? m.terrain[ny * m.width + nx] === TERRAIN.water : land.terrain[(ny + M) * land.width + nx + M] === TERRAIN.water;
        // Down to water's surface level (the bank below it is the scene's), or to the neighbour's side.
        const l = baseLevel(lr, nx + M, ny + M), below = water ? [l, l] : sideOf(lr, nx + M, ny + M, (side + 2) % 4);
        cliff(t, x, y, side, own, below);
      }
    }
    return t.empty ? null : t.geometry();
  }
}
