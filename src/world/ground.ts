import * as THREE from 'three';
import { FLAG, linearColor as lin, thin, type PixelObject, type PixelRenderer } from 'pixel3d-renderer';
import { TERRAIN, type Land } from '../game/map.ts';
import { baseLevel, centreLevel, corners, heightAt, heightOn, inRelief, sheetAt, sideOf, SIDES, splitsNwSe, spanOf, STEEP, type Relief } from '../game/relief.ts';
import { reliefOf, type GameState } from '../game/state.ts';

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
 * Lays a tile-sized object (a soil bed, an overlay tile) on a tile of the relief, lifted `lift` above it: returns its
 * geometry draped over the tile (`drape`) and writes where it stands into `pos`, its origin at the tile's centre and the
 * height of its lowest corner.
 */
export function lay(r: Relief, x: number, y: number, lift: number, g: THREE.BufferGeometry, pos: THREE.Vector3): THREE.BufferGeometry {
  const c = corners(r, x, y), base = Math.min(...c);
  pos.set(x + 0.5, base * LEVEL_HEIGHT + lift, y + 0.5);
  return drape(g, c.map((h) => h - base));
}

/** Draped geometries, by the geometry and the shape of the tile it was draped over. */
const draped = new WeakMap<THREE.BufferGeometry, Map<string, THREE.BufferGeometry>>();

/**
 * A tile-sized geometry (x and z within half a tile of its origin, non-indexed) draped over a tile whose corners stand
 * `c` levels above its lowest: each triangle cut along the diagonal the tile's top is split along (relief.ts `splitsNwSe`),
 * so every piece lies over one half of the top, and each vertex lifted by the ground's height under it. A flat tile gives
 * the geometry itself. Cached, so a shape is draped once.
 */
export function drape(g: THREE.BufferGeometry, c: readonly number[]): THREE.BufferGeometry {
  if (c.every((h) => h === 0)) return g;
  let byShape = draped.get(g);
  if (!byShape) { byShape = new Map(); draped.set(g, byShape); }
  const key = c.join(','), known = byShape.get(key);
  if (known) return known;
  // The diagonal as a signed distance, in the geometry's own coordinates (the tile's centre at the origin).
  const nwSe = splitsNwSe(c), side = (x: number, z: number) => (nwSe ? x - z : x + z);
  const names = Object.keys(g.attributes).filter((k) => k !== 'normal'), src = names.map((k) => g.getAttribute(k));
  const out = names.map(() => [] as number[]), pos = names.indexOf('position');
  type Vertex = number[][];
  const vertex = (i: number): Vertex => src.map((a) => Array.from({ length: a.itemSize }, (_, k) => a.array[i * a.itemSize + k]));
  const mix = (a: Vertex, b: Vertex, t: number): Vertex => a.map((v, n) => v.map((x, k) => x + (b[n][k] - x) * t));
  const emit = (tri: Vertex[]) => {
    for (const v of tri) v.forEach((data, n) => {
      if (n === pos) out[n].push(data[0], data[1] + heightOn(c, data[0] + 0.5, data[2] + 0.5) * LEVEL_HEIGHT, data[2]);
      else out[n].push(...data);
    });
  };
  for (let t = 0; t + 2 < src[pos].count; t += 3) {
    const tri = [vertex(t), vertex(t + 1), vertex(t + 2)], d = tri.map((v) => side(v[pos][0], v[pos][2]));
    // A vertex on the diagonal with the other two either side of it: cut the triangle in two through it.
    const on = [0, 1, 2].find((i) => d[i] === 0 && d[(i + 1) % 3] * d[(i + 2) % 3] < 0);
    if (on !== undefined) {
      const a = tri[on], b = tri[(on + 1) % 3], e = tri[(on + 2) % 3], j = (on + 1) % 3, l = (on + 2) % 3;
      const be = mix(b, e, d[j] / (d[j] - d[l]));
      emit([a, b, be]); emit([a, be, e]);
      continue;
    }
    // The lone vertex on one side of the diagonal, if the triangle crosses it: cut off its corner, and the quad left in two.
    const k = [0, 1, 2].find((i) => d[i] * d[(i + 1) % 3] < 0 && d[i] * d[(i + 2) % 3] < 0);
    if (k === undefined) { emit(tri); continue; }
    const a = tri[k], b = tri[(k + 1) % 3], e = tri[(k + 2) % 3];
    const ab = mix(a, b, d[k] / (d[k] - d[(k + 1) % 3])), ae = mix(a, e, d[k] / (d[k] - d[(k + 2) % 3]));
    emit([a, ab, ae]); emit([ab, b, e]); emit([ab, e, ae]);
  }
  const result = new THREE.BufferGeometry();
  names.forEach((name, n) => result.setAttribute(name, new THREE.Float32BufferAttribute(out[n], src[n].itemSize)));
  result.computeVertexNormals();
  byShape.set(key, result);
  return result;
}

/** Cliff faces: earth for the low levels, stone higher up, STRATUM levels a band; the turf lip along the top. */
const EARTH = [0x9c7e5a, 0x8c714f], STONE = [0x8e877a, 0x807a6e], LIP = 0x5d7d3a;
/** How deep the turf lip over a cliff is (m). */
const LIP_DEPTH = 0.09;
/** Levels a band of a cliff's strata, and the level from which cliffs are stone. */
const STRATUM = 2, STONE_FROM = 8;

// ---- Grass, and the light that shows the lie of the land ----

type Lab = [number, number, number];
const toLin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toByte = (v: number) => { v = Math.min(1, Math.max(0, v)); return Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255); };
function hexToLab(hex: number): Lab {
  const r = toLin((hex >> 16) & 255), g = toLin((hex >> 8) & 255), b = toLin(hex & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function labToHex([L, a, b]: Lab): number {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return (toByte(r) << 16) | (toByte(g) << 8) | toByte(bl);
}
/**
 * Grass from lush (low, by water) to dry (high, far from it), all at one lightness so only the light shows the shape; a
 * steep bank's top is worn turf, ground trucks can't drive, that you can pick out at a glance.
 */
const GRASS = [0x66a248, 0x6f9f49, 0x789d4a, 0x819b4b, 0x88984c], BANK = 0x969a5f;
// The hillshade: a light fixed to the land, baked into the ground's colours, so gentle slopes read in any weather and at
// night, where the sun's few bands of light would show them all alike.
/** Where the hillshade's light comes from: the screen's upper left at the home view, a little off the grid, 45° up. */
const SHADE_LIGHT = (() => { const h = Math.hypot(2, 1); return [-2 / h * Math.SQRT1_2, Math.SQRT1_2, -1 / h * Math.SQRT1_2]; })();
/** Lightness (OKLab L) per unit of light turned towards or away, the step it is rounded to, and the most steps either way. */
const SHADE_GAIN = 0.6, SHADE_STEP = 0.04, SHADE_STEPS = 4;
const shaded = new Map<number, number>();
/** A colour lit by the hillshade for a face whose upward unit normal is `n`: lighter or darker by whole steps. */
export function hillshade(hex: number, n: Vec): number {
  const d = n[0] * SHADE_LIGHT[0] + n[1] * SHADE_LIGHT[1] + n[2] * SHADE_LIGHT[2] - SHADE_LIGHT[1];
  const k = Math.max(-SHADE_STEPS, Math.min(SHADE_STEPS, Math.round(SHADE_GAIN * d / SHADE_STEP)));
  return k === 0 ? hex : shadeStep(hex, k);
}
function shadeStep(hex: number, k: number): number {
  const key = hex * 16 + k + SHADE_STEPS;
  let out = shaded.get(key);
  if (out === undefined) { const [L, a, b] = hexToLab(hex); out = labToHex([L + k * SHADE_STEP, a, b]); shaded.set(key, out); }
  return out;
}
/** Every shade the hillshade can give a colour. */
const allShades = (hexes: number[]) => hexes.flatMap((h) => Array.from({ length: 2 * SHADE_STEPS + 1 }, (_, k) => k === SHADE_STEPS ? h : shadeStep(h, k - SHADE_STEPS)));

/** A grass colour by how dry the ground lies (`geography`, 0 lush to 1 dry); a steep bank is worn turf. */
export const grassOf = (dry: number, steep = false) => steep ? BANK : GRASS[Math.round(Math.min(1, Math.max(0, dry)) * (GRASS.length - 1))];

/**
 * How dry each tile of the land is by where it lies (0 lush to 1 dry), indexed like the land: high ground and ground far from
 * water are dry. Both are blurred over a few tiles, so the colour follows the lie of the land, never single tiles.
 */
export function geography(land: Land, r: Relief): Float32Array {
  const W = land.width, Ht = land.height, n = W * Ht, dist = new Float32Array(n).fill(Infinity), queue: number[] = [];
  for (let i = 0; i < n; i++) if (land.terrain[i] === TERRAIN.water) { dist[i] = 0; queue.push(i); }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], x = i % W, y = (i - x) / W;
    for (const [dx, dy] of OUT) {
      const nx = x + dx, ny = y + dy, j = ny * W + nx;
      if (nx < 0 || ny < 0 || nx >= W || ny >= Ht || dist[j] <= dist[i] + 1) continue;
      dist[j] = dist[i] + 1; queue.push(j);
    }
  }
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i % W, y = (i - x) / W;
    raw[i] = 0.6 * Math.min(1, centreLevel(r, x, y) / 10) + 0.4 * (1 - Math.exp(-Math.min(dist[i], 40) / 4));
  }
  // A box blur of radius 3, along rows then columns.
  const R = 3, tmp = new Float32Array(n), out = new Float32Array(n);
  for (let y = 0; y < Ht; y++) for (let x = 0; x < W; x++) {
    let s = 0, c = 0;
    for (let k = -R; k <= R; k++) { const xx = x + k; if (xx >= 0 && xx < W) { s += raw[y * W + xx]; c++; } }
    tmp[y * W + x] = s / c;
  }
  for (let y = 0; y < Ht; y++) for (let x = 0; x < W; x++) {
    let s = 0, c = 0;
    for (let k = -R; k <= R; k++) { const yy = y + k; if (yy >= 0 && yy < Ht) { s += tmp[yy * W + x]; c++; } }
    out[y * W + x] = s / c;
  }
  return out;
}

/**
 * The lines drawn over the map's ground while building or doing earthworks: a grid on the tiles and contour lines between
 * levels. Their colours, and how wide they are drawn (m).
 */
const GRID = 0x5f7f44, CONTOUR = 0x6a6038, INDEX = 0x4f4628, LINE_WIDTH = 0.05;
/** How far the lines stand off the ground (m): over the overlays' tiles (view.ts), which earthworks show. */
const LINE_LIFT = 0.04;
/** Every fourth level's contour is drawn darker. */
const INDEX_EVERY = 4;
/** Every colour the map's ground can use, so the palette can be chosen with them (MapGround's swatch). */
const PALETTE = [...new Set([...allShades([...GRASS, BANK]), ...EARTH, ...STONE, LIP, GRID, CONTOUR, INDEX])];

/**
 * A ribbon over the ground from `p` to `q` (world points on one face whose upward unit normal is `n`), `w` wide and lifted
 * a little off it: a line drawn on the ground.
 */
function ribbon(t: Tris, p: Vec, q: Vec, n: Vec, hex: number, w = LINE_WIDTH) {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
  const s = [n[1] * d[2] - n[2] * d[1], n[2] * d[0] - n[0] * d[2], n[0] * d[1] - n[1] * d[0]], len = Math.hypot(s[0], s[1], s[2]);
  if (len < 1e-9) return;
  const k = w / 2 / len, o = (v: Vec, sign: number) => [0, 1, 2].map((i) => v[i] + s[i] * k * sign + n[i] * LINE_LIFT);
  t.quad(o(p, -1), o(p, 1), o(q, 1), o(q, -1), hex, n);
}

/**
 * The grid (each side of the tile, drawn just inside it, so a cliff's two sides each keep their own) and the contour lines
 * between levels over one tile's top.
 */
function tileLines(t: Tris, x: number, y: number, c: readonly number[]) {
  const p = cornerPoints(x, y, c), on = (u: number, v: number): Vec => [x + u, heightOn(c, u, v) * H, y + v];
  const i = LINE_WIDTH / 2;
  // Each side, inset by half a line so the two tiles sharing it draw one line between them.
  const sides: [Vec, Vec, number, number][] = [[[0, i], [1, i], 0, 1], [[1 - i, 0], [1 - i, 1], 1, 2], [[1, 1 - i], [0, 1 - i], 2, 3], [[i, 1], [i, 0], 3, 0]];
  // The diagonal the top is folded along, as a signed distance across the tile.
  const fold = splitsNwSe(c) ? (u: number, v: number) => u - v : (u: number, v: number) => u + v - 1;
  for (const [a, b] of sides) {
    // Split where it crosses the fold, so each piece lies on one triangle's plane.
    const da = fold(a[0], a[1]), db = fold(b[0], b[1]), f = da / (da - db);
    const m = da * db < 0 ? [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f] : b;
    for (const [u, v] of m === b ? [[a, b]] : [[a, m], [m, b]]) {
      ribbon(t, on(u[0], u[1]), on(v[0], v[1]), upNormalAt(c, p, (u[0] + v[0]) / 2, (u[1] + v[1]) / 2), GRID);
    }
  }
  for (const tri of halves(c)) {
    const lv = tri.map((k) => c[k]), lo = Math.min(...lv), hi = Math.max(...lv);
    if (hi === lo) continue;
    const n = unit(faceNormal(p[tri[0]], p[tri[1]], p[tri[2]]));
    for (let k = Math.ceil(lo - 0.5); k + 0.5 < hi; k++) {
      const v = k + 0.5;
      if (v <= lo) continue;
      const cut: Vec[] = [];
      for (let e = 0; e < 3; e++) {
        const A = tri[e], B = tri[(e + 1) % 3], ha = c[A], hb = c[B];
        if ((ha - v) * (hb - v) >= 0) continue;
        const f = (v - ha) / (hb - ha);
        cut.push([0, 1, 2].map((j) => p[A][j] + (p[B][j] - p[A][j]) * f));
      }
      if (cut.length === 2) ribbon(t, cut[0], cut[1], n, (k + 1) % INDEX_EVERY === 0 ? INDEX : CONTOUR);
    }
  }
}
const unit = (v: Vec) => { const l = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / l); };
/** The upward unit normal of the half of a tile's top under the tile point (u, v). */
function upNormalAt(c: readonly number[], p: Vec[], u: number, v: number): Vec {
  const nwSe = splitsNwSe(c), [h0, h1] = halves(c);
  // NW–SE diagonal: the first half (NW, NE, SE) has u > v; NE–SW: the first half (NW, NE, SW) has u + v < 1.
  const tri = (nwSe ? u >= v : u + v <= 1) ? h0 : h1;
  return unit(faceNormal(p[tri[0]], p[tri[1]], p[tri[2]]));
}

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
  readonly flg: number[] = [];
  /** The surface flag the next triangles get. */
  flag: number = FLAG.NORMAL;
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
      this.pos.push(v[0], v[1], v[2]); this.nrm.push(m[0], m[1], m[2]); this.col.push(rgb[0], rgb[1], rgb[2]); this.flg.push(this.flag);
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
    g.setAttribute('aFlag', new THREE.Float32BufferAttribute(this.flg, 1));
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
 * smooth with a normal at each corner, or flat without; lit by the hillshade.
 */
export function tileTop(t: Tris, x: number, y: number, c: readonly number[], hex: number, normals?: readonly Vec[]) {
  const p = cornerPoints(x, y, c);
  for (const [a, b, d] of halves(c)) {
    t.tri(p[a], p[b], p[d], hillshade(hex, unit(faceNormal(p[a], p[b], p[d]))), UP, normals && [normals[a], normals[b], normals[d]]);
  }
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

/** Whether a tile of a relief is a steep bank (worn turf). */
export const isBank = (r: Relief, x: number, y: number) => spanOf(r, x, y) >= STEEP;

/** The relief of the land around a map, indexed from the land's north-west corner (map tile (0, 0) is land tile (margin, margin)). */
export const landRelief = (land: Land): Relief => ({ width: land.width, height: land.height, corner: land.corner });

// ---- The map's ground, as objects ----

/** Tiles a side of one chunk of the map's ground. */
const CHUNK = 8;

interface Chunk { o: PixelObject; g: THREE.BufferGeometry }

/**
 * The map's own ground (every land tile on the map; water is the static scene's), drawn as objects a chunk at a time and
 * redrawn when earthworks change the levels under it, with the grid and contour lines over it as objects of their own,
 * shown while building. Its colours are chosen with the scene's palette: `geometries` (with a swatch of every colour it
 * uses) go to `quantizePalette`, then `show` reads back what each colour became, so chunks drawn later match, and adds the
 * chunks to the renderer.
 */
export class MapGround {
  /** Each chunk's ground and its lines (the renderer leaves disposing their geometries to us), null where it has no land. */
  private readonly chunks: ({ top: Chunk; lines: Chunk | null } | null)[] = [];
  /** The land's relief (the country beyond the map and the map), kept up with earthworks on the map: for smooth shading across the map's edge. */
  private readonly whole: Relief & { corner: number[] };
  private readonly swatch: THREE.BufferGeometry;
  private painted = new Map<number, [number, number, number]>();
  private relief = 0;
  readonly geometries: THREE.BufferGeometry[] = [];
  private r: PixelRenderer | null = null;
  private readonly s: GameState;
  private readonly land: Land;
  private readonly first: ({ top: THREE.BufferGeometry; lines: THREE.BufferGeometry | null } | null)[] = [];
  /** How dry each land tile is by where it lies (`geography`). */
  private dry: Float32Array;
  private linesShown = false;

  constructor(s: GameState, land: Land) {
    this.s = s; this.land = land;
    this.whole = { width: land.width, height: land.height, corner: [...land.corner] };
    this.copyMap();
    this.dry = geography(land, this.whole);
    const sw = new Tris();
    PALETTE.forEach((c, i) => sw.tri([i, -50, 0], [i + 1, -50, 0], [i, -50, 1], c, [0, 1, 0]));
    this.swatch = sw.geometry();
    this.geometries.push(this.swatch);
    for (let cy = 0; cy * CHUNK < s.map.height; cy++) for (let cx = 0; cx * CHUNK < s.map.width; cx++) {
      const g = this.build(cx, cy);
      this.first.push(g);
      if (g) this.geometries.push(g.top, ...(g.lines ? [g.lines] : []));
    }
    this.relief = reliefOf(s);
  }

  /** Once the palette is chosen: reads back the colours it gave the ground, and adds the chunks to the renderer. */
  show(r: PixelRenderer) {
    this.r = r;
    const c = this.swatch.getAttribute('aColor');
    PALETTE.forEach((hex, i) => this.painted.set(hex, [c.getX(i * 3), c.getY(i * 3), c.getZ(i * 3)]));
    for (const g of this.first) this.chunks.push(g && this.add(g));
    this.first.length = 0;
  }

  /** Shows or hides the grid and contour lines over the map's ground. */
  showLines(on: boolean) {
    if (on === this.linesShown) return;
    this.linesShown = on;
    for (const c of this.chunks) if (c?.lines) c.lines.o.visible = on;
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

  private add(g: { top: THREE.BufferGeometry; lines: THREE.BufferGeometry | null }) {
    const r = this.r;
    if (!r) throw new Error('MapGround: show it before drawing more');
    const object = (geometry: THREE.BufferGeometry): Chunk => {
      const o = r.addObject(geometry);
      o.setTransform(new THREE.Vector3(0, 0, 0));
      return { o, g: geometry };
    };
    const lines = g.lines && object(g.lines);
    if (lines) { lines.o.visible = this.linesShown; lines.o.castShadow = false; }
    return { top: object(g.top), lines };
  }

  /** Redraws the chunks whose tiles, or their neighbours, earthworks have changed since the last call. */
  sync() {
    if (!this.r) return;
    const v = reliefOf(this.s);
    if (v === this.relief) return;
    this.relief = v;
    const m = this.s.map, w = m.width, cols = Math.ceil(w / CHUNK), dirty = new Set<number>();
    const changed = this.copyMap();
    if (!changed.length) return;
    // How dry the ground lies follows its height, blurred over a few tiles: every chunk it changes in is redrawn.
    const was = this.dry, M = this.land.margin, lw = this.land.width;
    this.dry = geography(this.land, this.whole);
    for (let i = 0; i < w * m.height; i++) {
      const x = i % w, y = Math.floor(i / w), j = (y + M) * lw + x + M;
      if (grassOf(was[j]) !== grassOf(this.dry[j])) dirty.add(Math.floor(y / CHUNK) * cols + Math.floor(x / CHUNK));
    }
    for (const i of changed) {
      const x = i % w, y = Math.floor(i / w);
      // Its neighbours' cliffs and their shading (which takes in the tiles round each corner) change with it.
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < m.height) dirty.add(Math.floor(ny / CHUNK) * cols + Math.floor(nx / CHUNK));
      }
    }
    for (const k of dirty) {
      const old = this.chunks[k];
      if (old) for (const c of [old.top, old.lines]) if (c) { c.o.remove(); c.g.dispose(); }
      const g = this.build(k % cols, Math.floor(k / cols));
      this.chunks[k] = g && this.add(g);
    }
  }

  private build(cx: number, cy: number): { top: THREE.BufferGeometry; lines: THREE.BufferGeometry | null } | null {
    const m = this.s.map, land = this.land, M = land.margin, lr = this.whole;
    const paint = (hex: number) => this.painted.get(hex) ?? lin(hex);
    const t = new Tris(paint), lines = new Tris(paint);
    lines.flag = thin(FLAG.DECOR);
    for (let y = cy * CHUNK; y < Math.min(m.height, (cy + 1) * CHUNK); y++) for (let x = cx * CHUNK; x < Math.min(m.width, (cx + 1) * CHUNK); x++) {
      const i = y * m.width + x;
      if (m.terrain[i] === TERRAIN.water) continue;
      tileTop(t, x, y, corners(m, x, y), grassOf(this.dry[(y + M) * land.width + x + M], isBank(m, x, y)), cornerNormals(lr, x + M, y + M));
      tileLines(lines, x, y, corners(m, x, y));
      for (let side = 0; side < 4; side++) {
        const nx = x + SIDES[side][0], ny = y + SIDES[side][1], own = sideOf(m, x, y, side);
        const onMap = nx >= 0 && ny >= 0 && nx < m.width && ny < m.height;
        const water = onMap ? m.terrain[ny * m.width + nx] === TERRAIN.water : land.terrain[(ny + M) * land.width + nx + M] === TERRAIN.water;
        // Down to water's surface level (the bank below it is the scene's), or to the neighbour's side.
        const l = baseLevel(lr, nx + M, ny + M), below = water ? [l, l] : sideOf(lr, nx + M, ny + M, (side + 2) % 4);
        cliff(t, x, y, side, own, below);
      }
    }
    return t.empty ? null : { top: t.geometry(), lines: lines.empty ? null : lines.geometry() };
  }
}
