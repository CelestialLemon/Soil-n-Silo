import * as THREE from 'three';
import { FLAG, linearColor as lin, thin, type PixelObject, type PixelRenderer } from 'pixel3d-renderer';
import { BUILDINGS } from '../game/data.ts';
import { TERRAIN, type Land } from '../game/map.ts';
import { baseLevel, centreLevel, corners, inRelief, joins, SIDES, spanOf, splitsNwSe, STEEP, type Relief } from '../game/relief.ts';
import { groundOf } from '../game/rules.ts';
import { reliefOf, type GameState } from '../game/state.ts';
import { type Season } from '../game/seasons.ts';
import { Surface } from './surface.ts';

// The ground: each land tile's top, drawn as the smooth reading of the rules' levels that surface.ts fits (worked ground and
// water exactly at their levels), lit by a light fixed to the land so its slopes read; and the cliff faces where a tile
// stands above a neighbour it doesn't join, banded like strata under a lip of turf. The country beyond the map is built once
// into the static scene (terrain.ts); the map's own ground is drawn as objects in chunks (`MapGround`), so earthworks can
// redraw what they change. Everything that stands on the ground stands on the ground as drawn (`Lie`).

/** How high one level stands, in metres. */
export const LEVEL_HEIGHT = 0.25;
const H = LEVEL_HEIGHT;

/** The most a side of a tile is cut into, drawing its patch, and how far (m) the triangles drawn may stray from the patch. */
const FINEST = 8, TOLERANCE = 0.01;
/** How finely a tile may be cut: whole, halves, quarters or eighths. */
const DETAILS = [1, 2, 4, FINEST];
/**
 * How many tiles of country round the map are drawn with it, and fitted again with it after earthworks, so the ground
 * that moves never meets ground drawn once (the country beyond, whose edge stays put).
 */
export const HALO = 3;
/** How far (tiles) round the ground earthworks changed the ground is fitted again (further out it hardly moves). */
const SPREAD = 8;

/**
 * The lie of the whole land as it is drawn (the country and the map, with the map's earthworks): its smooth surface, how
 * finely each tile of it is drawn, and the height of the ground at any point of the world. World x and z are the map's tiles
 * (the map's north-west corner at 0); the land's tiles start `margin` tiles further out.
 */
export class Lie {
  readonly relief: Relief & { corner: number[] };
  readonly margin: number;
  readonly surface: Surface;
  private readonly s: GameState;
  private readonly land: Land;
  /** How many pieces each land tile is cut into a side (DETAILS). */
  private readonly detail: Uint8Array;
  /** Each map tile under a building that needed level ground (worked, though earthworks may never have touched it). */
  private pads: Uint8Array;
  /** Each map tile's corners and whether it was worked, as last fitted. */
  private fitted: { corner: number[]; worked: boolean[] };

  constructor(s: GameState, land: Land) {
    this.s = s; this.land = land; this.margin = land.margin;
    this.relief = { width: land.width, height: land.height, corner: [...land.corner] };
    this.copyMap();
    this.pads = this.padsOf();
    this.fitted = this.fitting();
    this.surface = new Surface(this.relief, { water: (x, y) => this.water(x, y), worked: (x, y) => this.worked(x, y) });
    this.detail = new Uint8Array(land.width * land.height);
    for (let y = 0; y < land.height; y++) for (let x = 0; x < land.width; x++) this.detail[y * land.width + x] = this.cut(x, y);
  }

  /** Whether a land tile is on the map. */
  onMap(lx: number, ly: number) {
    const x = lx - this.margin, y = ly - this.margin;
    return x >= 0 && y >= 0 && x < this.s.map.width && y < this.s.map.height;
  }

  /** Whether a land tile is drawn with the map's ground: on the map, or in the country's HALO round it. */
  withMap(lx: number, ly: number) {
    const x = lx - this.margin, y = ly - this.margin;
    return x >= -HALO && y >= -HALO && x < this.s.map.width + HALO && y < this.s.map.height + HALO;
  }

  private water(lx: number, ly: number) { return this.land.terrain[ly * this.land.width + lx] === TERRAIN.water; }

  private worked(lx: number, ly: number) {
    if (!this.onMap(lx, ly)) return false;
    const i = (ly - this.margin) * this.s.map.width + lx - this.margin;
    return this.s.worked[i] === 1 || this.pads[i] === 1;
  }

  private padsOf() {
    const m = this.s.map, out = new Uint8Array(m.width * m.height);
    for (const b of this.s.buildings) {
      if (groundOf(b.type) !== 'flat') continue;
      const n = BUILDINGS[b.type].size;
      for (let y = b.y; y < b.y + n; y++) for (let x = b.x; x < b.x + n; x++) out[y * m.width + x] = 1;
    }
    return out;
  }

  /** Copies the map's corners into the land's relief. */
  private copyMap() {
    const m = this.s.map, M = this.margin, c = this.relief.corner;
    for (let i = 0; i < m.width * m.height; i++) {
      const x = i % m.width, y = Math.floor(i / m.width), j = ((y + M) * this.relief.width + x + M) * 4;
      for (let k = 0; k < 4; k++) c[j + k] = m.corner[i * 4 + k];
    }
  }

  /** What the fit takes from the map: its corners, and which tiles are worked. */
  private fitting() {
    const m = this.s.map, M = this.margin;
    return { corner: [...m.corner], worked: Array.from({ length: m.width * m.height }, (_, i) => this.worked(i % m.width + M, Math.floor(i / m.width) + M)) };
  }

  /**
   * Follows earthworks and worked ground on the map: fits the ground drawn with the map again. The land tiles (land
   * indices) drawn with the map whose drawing may have changed: those whose patch, shade or cut changed, and their
   * neighbours (whose sides and walls meet them).
   */
  update(): number[] {
    const m = this.s.map, M = this.margin, W = this.relief.width;
    this.copyMap();
    this.pads = this.padsOf();
    // The map tiles whose corners or working changed since the last fit, and the ground round them.
    const was = this.fitted, now = this.fitting();
    this.fitted = now;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < m.width * m.height; i++) {
      if (was.worked[i] === now.worked[i] && [0, 1, 2, 3].every((k) => was.corner[i * 4 + k] === now.corner[i * 4 + k])) continue;
      const x = i % m.width, y = Math.floor(i / m.width);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1);
    }
    if (x0 === Infinity) return [];
    const changed = this.surface.refit(M + Math.max(-HALO, x0 - SPREAD), M + Math.max(-HALO, y0 - SPREAD),
      M + Math.min(m.width + HALO, x1 + SPREAD), M + Math.min(m.height + HALO, y1 + SPREAD)), out = new Set<number>();
    for (const t of changed) {
      const lx = t % W, ly = (t - lx) / W;
      this.detail[t] = this.cut(lx, ly);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (this.withMap(lx + dx, ly + dy)) out.add((ly + dy) * W + lx + dx);
    }
    return [...out];
  }

  /** How finely to cut a land tile: the fewest pieces a side whose triangles surely stay within TOLERANCE of its patch. */
  private cut(lx: number, ly: number) {
    const bend = this.surface.bend(lx, ly) * H;
    return DETAILS.find((S) => bend / (S * S) <= TOLERANCE) ?? FINEST;
  }

  /** How many pieces a land tile is cut into a side. */
  detailOf(lx: number, ly: number) { return this.detail[ly * this.relief.width + lx]; }

  /**
   * How many pieces a land tile's side is cut into: as finely as the finer of the two tiles where they join, so their edges
   * meet point for point; the finest where the map meets the country (the country is drawn once, the map's side changes).
   */
  stepsOf(lx: number, ly: number, side: number) {
    const own = this.detailOf(lx, ly), nx = lx + SIDES[side][0], ny = ly + SIDES[side][1];
    if (!inRelief(this.relief, nx, ny)) return own;
    if (this.withMap(lx, ly) !== this.withMap(nx, ny)) return FINEST;
    return joins(this.relief, lx, ly, side) ? Math.max(own, this.detailOf(nx, ny)) : own;
  }

  /** The ground's height (m) at a point of the world. */
  y(x: number, z: number) { return this.surface.at(x + this.margin, z + this.margin) * H; }

  /** The ground's height (m) at (u, v) across map tile (x, y), on its own patch (at a cliff, its own side's). */
  tileY(x: number, y: number, u: number, v: number) { return this.surface.on(x + this.margin, y + this.margin, u, v) * H; }


  /**
   * A point of a land tile's patch at (u, v) across it: where it is in the world, its upward unit normal, and how the
   * hillshade lights it (`light`).
   */
  point(lx: number, ly: number, u: number, v: number): Point {
    const [hx, hz] = this.surface.slope(lx, ly, u, v), [sx, sz] = this.surface.shadeAt(lx, ly, u, v);
    return { p: [lx - this.margin + u, this.surface.on(lx, ly, u, v) * H, ly - this.margin + v], n: unit([-hx * H, 1, -hz * H]), s: light(unit([-sx * H, 1, -sz * H])) };
  }
}

/**
 * The height (m) a building `n` tiles a side stands at with its north-west tile at (x, y): the ground under a one-tile
 * building's centre, else the highest of its tiles' levels (worked ground, level, but for a field over a ramp).
 */
export function standY(lie: Lie, r: Relief, n: number, x: number, y: number) {
  if (n === 1) return lie.y(x + 0.5, y + 0.5);
  let top = 0;
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) if (inRelief(r, tx, ty)) top = Math.max(top, centreLevel(r, tx, ty));
  return top * LEVEL_HEIGHT;
}

/** Cliff faces: earth for the low levels, stone higher up, STRATUM levels a band; the turf lip along the top. */
const EARTH = [0x9c7e5a, 0x8c714f], STONE = [0x8e877a, 0x807a6e];
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
 * A season's turf: grass from lush (low, by water) to dry (high, far from it), all at one lightness so only the light shows the
 * shape; a steep bank's top is worn turf, ground trucks can't drive, that you can pick out at a glance; and the lip of turf
 * over a cliff. Spring is fresh green, summer goes golden on dry ground, autumn is duller and browner, winter frost-pale.
 */
interface Turf { grass: number[]; bank: number; lip: number }
/** Colours at their mean lightness, hue and chroma kept: a season's grass is one lightness from lush to dry. */
function level(hexes: number[]): number[] {
  const labs = hexes.map(hexToLab), L = labs.reduce((a, l) => a + l[0], 0) / labs.length;
  return labs.map(([, a, b]) => labToHex([L, a, b]));
}
const SEASON_TURF: Record<Season, Turf> = {
  spring: { grass: [0x62ac48, 0x70ae48, 0x7eac4a, 0x8caa4c, 0x9aa64e], bank: 0xa0a060, lip: 0x5f8a3a },
  summer: { grass: [0x6f9e44, 0x859f45, 0x9ba048, 0xb0a04a, 0xc2a24e], bank: 0xb0a064, lip: 0x7a8a3a },
  autumn: { grass: [0x7c8a48, 0x888646, 0x918044, 0x987a42, 0x9d7240], bank: 0x8e7c58, lip: 0x6a7438 },
  winter: { grass: [0xa6b498, 0xafb9a2, 0xb8bdac, 0xc0c3b6, 0xc8c8be], bank: 0xa8a698, lip: 0x8a9a7c },
};
export const TURF: Record<Season, Turf> = Object.fromEntries(
  Object.entries(SEASON_TURF).map(([k, t]) => [k, { ...t, grass: level(t.grass) }]),
) as Record<Season, Turf>;
// The hillshade: a light fixed to the land, baked into the ground's colours, so gentle slopes read in any weather and at
// night, where the sun's few bands of light would show them all alike.
/** Where the hillshade's light comes from: the screen's upper left at the home view, a little off the grid, 45° up. */
const SHADE_LIGHT = (() => { const h = Math.hypot(2, 1); return [-2 / h * Math.SQRT1_2, Math.SQRT1_2, -1 / h * Math.SQRT1_2]; })();
/** Lightness (OKLab L) per unit of light turned towards or away, the step it is rounded to, and the most steps either way. */
const SHADE_GAIN = 0.6, SHADE_STEP = 0.04, SHADE_STEPS = 2;
const shaded = new Map<number, number>();
/** How the hillshade lights ground whose upward unit normal is `n`, in steps (lighter above 0): rounded, a colour's step. */
const light = (n: Vec) => SHADE_GAIN * (n[0] * SHADE_LIGHT[0] + n[1] * SHADE_LIGHT[1] + n[2] * SHADE_LIGHT[2] - SHADE_LIGHT[1]) / SHADE_STEP;
/** A colour lit by the hillshade `k` whole steps (`light`, rounded), at most SHADE_STEPS either way. */
const hillshade = (hex: number, k: number) => { k = Math.max(-SHADE_STEPS, Math.min(SHADE_STEPS, k)); return k === 0 ? hex : shadeStep(hex, k); };
/** A tuft of grass on turf `hex` where the hillshade lights it `s` (`light`): a step darker than the turf round it. */
export const tuftOf = (hex: number, s: number) => hillshade(hex, Math.min(SHADE_STEPS, Math.round(s)) - 1);
function shadeStep(hex: number, k: number): number {
  const key = hex * 16 + k + SHADE_STEPS;
  let out = shaded.get(key);
  if (out === undefined) { const [L, a, b] = hexToLab(hex); out = labToHex([L + k * SHADE_STEP, a, b]); shaded.set(key, out); }
  return out;
}
/** Every shade the hillshade can give a colour. */
const allShades = (hexes: number[]) => hexes.flatMap((h) => Array.from({ length: 2 * SHADE_STEPS + 1 }, (_, k) => k === SHADE_STEPS ? h : shadeStep(h, k - SHADE_STEPS)));

/** A season's grass colour by how dry the ground lies (`geography`, 0 lush to 1 dry); a steep bank is worn turf. */
export const grassOf = (season: Season, dry: number, steep = false) => {
  const { grass, bank } = TURF[season];
  return steep ? bank : grass[Math.round(Math.min(1, Math.max(0, dry)) * (grass.length - 1))];
};

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
const paletteOf = (season: Season) => [...new Set([...allShades([...TURF[season].grass, TURF[season].bank]), ...EARTH, ...STONE, TURF[season].lip, GRID, CONTOUR, INDEX])];

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

const unit = (v: Vec) => { const l = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / l); };
const UP = [0, 1, 0];
/** A point of the ground: where it is, its upward unit normal, and how the hillshade lights it (`light`). */
interface Point { p: number[]; n: number[]; s: number }

/** The point a fraction `f` from a to b, taken the same way round whichever end is given first (so shared edges meet). */
function between(a: Point, b: Point, f: number): Point {
  if (a.p[0] > b.p[0] || (a.p[0] === b.p[0] && a.p[2] > b.p[2])) { [a, b] = [b, a]; f = 1 - f; }
  const mix = (x: number[], y: number[]) => x.map((v, i) => v + (y[i] - v) * f);
  return { p: mix(a.p, b.p), n: unit(mix(a.n, b.n)), s: a.s + (b.s - a.s) * f };
}

/**
 * A triangle of the ground's top, shaded smooth, in `hex` lit by the hillshade: cut where its light crosses from one
 * step to the next (half way between whole steps), each piece one step, so the light's edges run clean across the tiles.
 */
function groundTri(t: Tris, a: Point, b: Point, c: Point, hex: number) {
  const lo = Math.round(Math.min(a.s, b.s, c.s)), hi = Math.round(Math.max(a.s, b.s, c.s));
  if (lo === hi || hi < -SHADE_STEPS || lo > SHADE_STEPS) { t.tri(a.p, b.p, c.p, hillshade(hex, lo), UP, [a.n, b.n, c.n]); return; }
  for (let k = Math.max(lo, -SHADE_STEPS); k <= Math.min(hi, SHADE_STEPS); k++) {
    // The part lit k steps: between k - ½ and k + ½ (all below or above for the outermost steps).
    let poly = [a, b, c];
    if (k > -SHADE_STEPS) poly = clip(poly, (q) => q.s - (k - 0.5));
    if (k < SHADE_STEPS) poly = clip(poly, (q) => k + 0.5 - q.s);
    for (let i = 1; i + 1 < poly.length; i++) t.tri(poly[0].p, poly[i].p, poly[i + 1].p, hillshade(hex, k), UP, [poly[0].n, poly[i].n, poly[i + 1].n]);
  }
}

/** The part of a convex polygon where `side` is at least 0. */
function clip(poly: Point[], side: (q: Point) => number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], da = side(a), db = side(b);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) out.push(between(a, b, da / (da - db)));
  }
  return out;
}

/** A cell of four points (north-west, north-east, south-east, south-west) as two triangles, folded along the diagonal whose ends are closer in height. */
function cell(t: Tris, q: Point[], hex: number) {
  if (splitsNwSe(q.map((v) => v.p[1]))) { groundTri(t, q[0], q[1], q[2], hex); groundTri(t, q[0], q[2], q[3], hex); } else { groundTri(t, q[0], q[1], q[3], hex); groundTri(t, q[1], q[2], q[3], hex); }
}

/**
 * A land tile's top in `hex`, cut into its detail's cells. Where a side is cut finer (to meet a finer neighbour point for
 * point), the cells along it are drawn as a fan from their middle, through every point on their sides.
 */
export function top(t: Tris, lie: Lie, lx: number, ly: number, hex: number) {
  const S = lie.detailOf(lx, ly), E = [0, 1, 2, 3].map((side) => lie.stepsOf(lx, ly, side));
  const grid: Point[] = [];
  for (let j = 0; j <= S; j++) for (let i = 0; i <= S; i++) grid.push(lie.point(lx, ly, i / S, j / S));
  const g = (i: number, j: number) => grid[j * (S + 1) + i];
  for (let cj = 0; cj < S; cj++) for (let ci = 0; ci < S; ci++) {
    const ring: Point[] = [g(ci, cj)];
    // The extra points along a side cut finer, in order round the cell (north west to east, east north to south, and so on).
    const extra = (side: number, from: number, at: (s: number) => [number, number]) => {
      const m = E[side] / S;
      for (let k = 1; k < m; k++) { const [u, v] = at((from * m + (side >= 2 ? -k : k)) / E[side]); ring.push(lie.point(lx, ly, u, v)); }
    };
    if (cj === 0) extra(0, ci, (s) => [s, 0]);
    ring.push(g(ci + 1, cj));
    if (ci === S - 1) extra(1, cj, (s) => [1, s]);
    ring.push(g(ci + 1, cj + 1));
    if (cj === S - 1) extra(2, ci + 1, (s) => [s, 1]);
    ring.push(g(ci, cj + 1));
    if (ci === 0) extra(3, cj + 1, (s) => [0, s]);
    if (ring.length === 4) { cell(t, ring, hex); continue; }
    const mid = lie.point(lx, ly, (ci + 0.5) / S, (cj + 0.5) / S);
    for (let k = 0; k < ring.length; k++) groundTri(t, mid, ring[k], ring[(k + 1) % ring.length], hex);
  }
}

/** Where along a tile's side a point s (0 to 1, in the order relief.ts lists side heights) lies across the tile. */
const SIDE_AT: ((s: number) => [number, number])[] = [(s) => [s, 0], (s) => [1, s], (s) => [s, 1], (s) => [0, s]];

/** The height (m) along a land tile's side as it is drawn: straight between the points it is cut into. */
function sideLine(lie: Lie, lx: number, ly: number, side: number): (s: number) => number {
  const E = lie.stepsOf(lx, ly, side), h = Array.from({ length: E + 1 }, (_, k) => { const [u, v] = SIDE_AT[side](k / E); return lie.surface.on(lx, ly, u, v) * H; });
  return (s) => { const a = Math.min(E - 1, Math.floor(s * E)), f = s * E - a; return h[a] + (h[a + 1] - h[a]) * f; };
}

/**
 * The cliff face along one side of a land tile, from its top down to `below`: the neighbour's top along the side, or a
 * level (m) when it is water's surface or the map's ground (`floor`): a turf lip, then a band of earth or stone a level.
 * Drawn between each two points either side is cut into.
 */
export function cliff(t: Tris, lie: Lie, lx: number, ly: number, side: number, floor: number | null, lip: number, tone: (hex: number) => number = (c) => c) {
  const nx = lx + SIDES[side][0], ny = ly + SIDES[side][1], M = lie.margin;
  const own = sideLine(lie, lx, ly, side), low = floor === null ? sideLine(lie, nx, ny, (side + 2) % 4) : () => floor;
  const steps = Math.max(lie.stepsOf(lx, ly, side), floor === null ? lie.stepsOf(nx, ny, (side + 2) % 4) : 1);
  const [a, b] = sideEnds(lx - M, ly - M, side), out = [SIDES[side][0], 0, SIDES[side][1]];
  for (let k = 0; k < steps; k++) {
    const s0 = k / steps, s1 = (k + 1) / steps, top: Line = [own(s0), own(s1)], bottom: Line = [low(s0), low(s1)];
    if (top[0] <= bottom[0] + 1e-6 && top[1] <= bottom[1] + 1e-6) continue;
    const pa: [number, number] = [a[0] + (b[0] - a[0]) * s0, a[1] + (b[1] - a[1]) * s0], pb: [number, number] = [a[0] + (b[0] - a[0]) * s1, a[1] + (b[1] - a[1]) * s1];
    const under: Line = [top[0] - LIP_DEPTH, top[1] - LIP_DEPTH];
    band(t, pa, pb, [bottom, under], [top], tone(lip), out);
    const from = Math.floor(Math.min(...bottom) / H / STRATUM), to = Math.ceil(Math.max(...top) / H / STRATUM);
    for (let n = from; n < to; n++) {
      const lo = n * STRATUM * H, hi = (n + 1) * STRATUM * H, shades = n * STRATUM >= STONE_FROM ? STONE : EARTH;
      band(t, pa, pb, [bottom, [lo, lo]], [under, [hi, hi]], tone(shades[n & 1]), out);
    }
  }
}

/**
 * A sheet over part of a map tile's ground, [u0, u1] × [v0, v1] across it, `lift` (m) above it and cut as finely as the
 * tile is: an overlay's tile, a field's soil; with `skirt`, sides down into the ground, so it stands as a raised bed.
 */
export function sheet(t: Tris, lie: Lie, x: number, y: number, [u0, v0, u1, v1]: readonly number[], lift: number, hex: number, skirt = false) {
  const lx = x + lie.margin, ly = y + lie.margin, S = lie.detailOf(lx, ly), pts: Point[] = [];
  for (let j = 0; j <= S; j++) for (let i = 0; i <= S; i++) {
    const q = lie.point(lx, ly, u0 + (u1 - u0) * i / S, v0 + (v1 - v0) * j / S);
    pts.push({ p: [q.p[0], q.p[1] + lift, q.p[2]], n: q.n, s: q.s });
  }
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const q = [pts[j * (S + 1) + i], pts[j * (S + 1) + i + 1], pts[(j + 1) * (S + 1) + i + 1], pts[(j + 1) * (S + 1) + i]];
    for (const [a, b, c] of splitsNwSe(q.map((v) => v.p[1])) ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]]) t.tri(q[a].p, q[b].p, q[c].p, hex, UP, [q[a].n, q[b].n, q[c].n]);
  }
  if (!skirt) return;
  // Round the border (north, east, south, west), each piece down to just under the ground, facing out.
  const at = (i: number, j: number) => pts[j * (S + 1) + i].p, down = (p: Vec) => [p[0], p[1] - lift - 0.01, p[2]];
  for (let k = 0; k < S; k++) for (const [a, b, out] of [[at(k, 0), at(k + 1, 0), [0, 0, -1]], [at(S, k), at(S, k + 1), [1, 0, 0]], [at(k, S), at(k + 1, S), [0, 0, 1]], [at(0, k), at(0, k + 1), [-1, 0, 0]]] as const) {
    t.quad(a, b, down(b), down(a), hex, out);
  }
}

/**
 * A ribbon over the ground from `p` to `q` (world points on the ground whose upward unit normal is about `n`), `w` wide and
 * lifted a little off it: a line drawn on the ground.
 */
function ribbon(t: Tris, p: Vec, q: Vec, n: Vec, hex: number, w = LINE_WIDTH) {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
  const s = [n[1] * d[2] - n[2] * d[1], n[2] * d[0] - n[0] * d[2], n[0] * d[1] - n[1] * d[0]], len = Math.hypot(s[0], s[1], s[2]);
  if (len < 1e-9) return;
  const k = w / 2 / len, o = (v: Vec, sign: number) => [0, 1, 2].map((i) => v[i] + s[i] * k * sign + n[i] * LINE_LIFT);
  t.quad(o(p, -1), o(p, 1), o(q, 1), o(q, -1), hex, n);
}

/** A line along the ground of a map tile, from (u0, v0) to (u1, v1) across it, in `pieces` pieces that follow the ground. */
function lineOn(t: Tris, lie: Lie, lx: number, ly: number, u0: number, v0: number, u1: number, v1: number, pieces: number, hex: number) {
  for (let k = 0; k < pieces; k++) {
    const a = k / pieces, b = (k + 1) / pieces, m = (a + b) / 2;
    const p = lie.point(lx, ly, u0 + (u1 - u0) * a, v0 + (v1 - v0) * a), q = lie.point(lx, ly, u0 + (u1 - u0) * b, v0 + (v1 - v0) * b);
    ribbon(t, p.p, q.p, lie.point(lx, ly, u0 + (u1 - u0) * m, v0 + (v1 - v0) * m).n, hex);
  }
}

/**
 * The grid along a map tile's sides (just inside, so a cliff's two sides each keep their own) and the contour lines between
 * its levels: where the rules' ground (two triangles over its corners) crosses each half level, laid on the ground as drawn.
 */
function tileLines(t: Tris, lie: Lie, x: number, y: number, c: readonly number[]) {
  const lx = x + lie.margin, ly = y + lie.margin, i = LINE_WIDTH / 2, S = Math.max(2, lie.detailOf(lx, ly));
  lineOn(t, lie, lx, ly, 0, i, 1, i, S, GRID);
  lineOn(t, lie, lx, ly, 1 - i, 0, 1 - i, 1, S, GRID);
  lineOn(t, lie, lx, ly, 1, 1 - i, 0, 1 - i, S, GRID);
  lineOn(t, lie, lx, ly, i, 1, i, 0, S, GRID);
  const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (const tri of splitsNwSe(c) ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]]) {
    const lv = tri.map((k) => c[k]), lo = Math.min(...lv), hi = Math.max(...lv);
    for (let k = Math.ceil(lo - 0.5); k + 0.5 < hi; k++) {
      const v = k + 0.5;
      if (v <= lo) continue;
      const cut: number[][] = [];
      for (let e = 0; e < 3; e++) {
        const A = tri[e], B = tri[(e + 1) % 3], ha = c[A], hb = c[B];
        if ((ha - v) * (hb - v) >= 0) continue;
        const f = (v - ha) / (hb - ha);
        cut.push([uv[A][0] + (uv[B][0] - uv[A][0]) * f, uv[A][1] + (uv[B][1] - uv[A][1]) * f]);
      }
      if (cut.length === 2) lineOn(t, lie, lx, ly, cut[0][0], cut[0][1], cut[1][0], cut[1][1], S, (k + 1) % INDEX_EVERY === 0 ? INDEX : CONTOUR);
    }
  }
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
 * redrawn when earthworks change the ground under it, with the grid and contour lines over it as objects of their own,
 * shown while building. Its colours are chosen with the scene's palette: `geometries` (with a swatch of every colour it
 * and `paint` use) go to `quantizePalette`, then `show` reads back what each colour became, so what is drawn later matches,
 * and adds the chunks to the renderer.
 */
/**
 * The country drawn with the map (`HALO`): each of its land tiles' colour (by land index; none for water) and its walls'
 * dulling, for MapGround; and the trees and rocks on it, for the view to stand on its ground as it moves.
 */
export interface Halo { colour: Map<number, number>; tone: (hex: number) => number; things: HaloThing[] }
/** A tree or rock on the halo: its model (already dulled), where it stands (world x, z), turned and scaled, and how far it sinks (m). */
export interface HaloThing { g: THREE.BufferGeometry; x: number; z: number; yaw: number; scale: number; sink: number }

/** The map's ground, and the country's `HALO` round it, drawn in chunks redrawn as earthworks change them. */
export class MapGround {
  /** Each chunk's ground and its lines (the renderer leaves disposing their geometries to us), null where it has no land. */
  private readonly chunks: ({ top: Chunk; lines: Chunk | null } | null)[] = [];
  private readonly swatch: THREE.BufferGeometry;
  private readonly painted = new Map<number, [number, number, number]>();
  private readonly colours: number[];
  private relief = 0;
  readonly geometries: THREE.BufferGeometry[] = [];
  private r: PixelRenderer | null = null;
  private readonly s: GameState;
  private readonly land: Land;
  private readonly lie: Lie;
  private readonly first: ({ top: THREE.BufferGeometry; lines: THREE.BufferGeometry | null } | null)[] = [];
  /** How dry each land tile is by where it lies (`geography`). */
  private dry: Float32Array;
  private linesShown = false;

  private readonly halo: Halo;
  private readonly season: Season;
  /** The tiles drawn (the map and its halo), wide and high, in chunks so many a row. */
  private readonly across: number;
  private readonly down: number;
  private readonly cols: number;

  /** `extra` are colours others draw on the ground with `paint` (a field's soil). */
  constructor(s: GameState, land: Land, lie: Lie, halo: Halo, extra: readonly number[] = []) {
    this.s = s; this.land = land; this.lie = lie; this.halo = halo; this.season = s.scenario.climate.season;
    this.across = s.map.width + 2 * HALO; this.down = s.map.height + 2 * HALO; this.cols = Math.ceil(this.across / CHUNK);
    this.dry = geography(land, lie.relief);
    const country = [...allShades([...new Set([...halo.colour.values(), ...[...TURF[this.season].grass, TURF[this.season].bank].map(halo.tone)])]), ...[...EARTH, ...STONE, TURF[this.season].lip].map(halo.tone)];
    this.colours = [...new Set([...paletteOf(this.season), ...country, ...extra])];
    const sw = new Tris();
    this.colours.forEach((c, i) => sw.tri([i, -50, 0], [i + 1, -50, 0], [i, -50, 1], c, [0, 1, 0]));
    this.swatch = sw.geometry();
    this.geometries.push(this.swatch);
    for (let cy = 0; cy * CHUNK < this.down; cy++) for (let cx = 0; cx < this.cols; cx++) {
      const g = this.build(cx, cy);
      this.first.push(g);
      if (g) this.geometries.push(g.top, ...(g.lines ? [g.lines] : []));
    }
    this.relief = reliefOf(s);
  }

  /** A colour as the palette drew it (for what is drawn on the ground later: `extra` colours). */
  readonly paint = (hex: number): [number, number, number] => this.painted.get(hex) ?? lin(hex);

  /** Once the palette is chosen: reads back the colours it gave the ground, and adds the chunks to the renderer. */
  show(r: PixelRenderer) {
    this.r = r;
    const c = this.swatch.getAttribute('aColor');
    this.colours.forEach((hex, i) => this.painted.set(hex, [c.getX(i * 3), c.getY(i * 3), c.getZ(i * 3)]));
    for (const g of this.first) this.chunks.push(g && this.add(g));
    this.first.length = 0;
  }

  /** How dry each land tile lies by where it lies (`geography`), as the ground is drawn now. */
  get dryness(): Float32Array { return this.dry; }

  /** Shows or hides the grid and contour lines over the map's ground. */
  showLines(on: boolean) {
    if (on === this.linesShown) return;
    this.linesShown = on;
    for (const c of this.chunks) if (c?.lines) c.lines.o.visible = on;
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

  /**
   * Follows earthworks: fits the ground again (`Lie.update`) and redraws the chunks whose ground changed, or whose grass
   * did (how dry the ground lies follows its height, blurred over a few tiles). Call before anything asks the lie.
   */
  sync() {
    if (!this.r) return;
    const v = reliefOf(this.s);
    if (v === this.relief) return;
    this.relief = v;
    const m = this.s.map, lw = this.land.width, o = this.land.margin - HALO, dirty = new Set<number>();
    const chunk = (lx: number, ly: number) => Math.floor((ly - o) / CHUNK) * this.cols + Math.floor((lx - o) / CHUNK);
    for (const i of this.lie.update()) dirty.add(chunk(i % lw, Math.floor(i / lw)));
    const was = this.dry, M = this.land.margin;
    this.dry = geography(this.land, this.lie.relief);
    for (let y = M; y < M + m.height; y++) for (let x = M; x < M + m.width; x++) {
      if (grassOf(this.season, was[y * lw + x]) !== grassOf(this.season, this.dry[y * lw + x])) dirty.add(chunk(x, y));
    }
    for (const k of dirty) {
      const old = this.chunks[k];
      if (old) for (const c of [old.top, old.lines]) if (c) { c.o.remove(); c.g.dispose(); }
      const g = this.build(k % this.cols, Math.floor(k / this.cols));
      this.chunks[k] = g && this.add(g);
    }
  }

  private build(cx: number, cy: number): { top: THREE.BufferGeometry; lines: THREE.BufferGeometry | null } | null {
    const m = this.s.map, land = this.land, M = land.margin, lie = this.lie, o = M - HALO;
    const t = new Tris(this.paint), lines = new Tris(this.paint);
    lines.flag = thin(FLAG.DECOR);
    for (let y = cy * CHUNK; y < Math.min(this.down, (cy + 1) * CHUNK); y++) for (let x = cx * CHUNK; x < Math.min(this.across, (cx + 1) * CHUNK); x++) {
      const lx = x + o, ly = y + o, mx = lx - M, my = ly - M, onMap = lie.onMap(lx, ly);
      const hex = onMap ? m.terrain[my * m.width + mx] === TERRAIN.water ? undefined : grassOf(this.season, this.dry[ly * land.width + lx], isBank(m, mx, my))
        : this.halo.colour.get(ly * land.width + lx);
      if (hex === undefined) continue;
      top(t, lie, lx, ly, hex);
      if (onMap) tileLines(lines, lie, mx, my, corners(m, mx, my));
      for (let side = 0; side < 4; side++) {
        const nx = lx + SIDES[side][0], ny = ly + SIDES[side][1];
        if (joins(lie.relief, lx, ly, side)) continue;
        // Down to water's surface level (the bank below it is the scene's), or to the neighbour's top.
        const water = land.terrain[ny * land.width + nx] === TERRAIN.water;
        cliff(t, lie, lx, ly, side, water ? baseLevel(lie.relief, nx, ny) * H : null, TURF[this.season].lip, onMap ? undefined : this.halo.tone);
      }
    }
    return t.empty ? null : { top: t.geometry(), lines: lines.empty ? null : lines.geometry() };
  }
}

/** How far an overlay's square stands in from its tile's sides, and how far over its lift its top stands (m). */
const FILL_INSET = 0.08, FILL_TOP = 0.015;

/**
 * Overlay tiles: a square over each map tile listed (by index, the map `width` wide), a little in from its sides, on the
 * ground `lift` (m) above it, all in one geometry (its colour is the object's tint). `inset` is how far (of a tile) each square stands in
 * from its tile's sides; none makes the squares run together.
 */
export function overlayTiles(lie: Lie, tiles: Iterable<number>, width: number, lift: number, inset = FILL_INSET): THREE.BufferGeometry {
  const t = new Tris();
  t.flag = FLAG.DECOR;
  for (const i of tiles) sheet(t, lie, i % width, Math.floor(i / width), [inset, inset, 1 - inset, 1 - inset], lift + FILL_TOP, 0xf4f0e0);
  return t.geometry();
}
