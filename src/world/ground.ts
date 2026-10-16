import * as THREE from 'three';
import { FLAG, linearColor as lin, type PixelObject, type PixelRenderer } from 'pixel3d-renderer';
import { TERRAIN, type Land } from '../game/map.ts';
import { centreLevel, corners, FLAT, heightAt, inRelief, sideOf, SIDES, type Relief } from '../game/relief.ts';
import { reliefOf, type GameState } from '../game/state.ts';
import { hash } from './kit.ts';

// The stepped ground: each land tile's top over its four corners, and the cliff faces where it stands above a neighbour,
// banded like strata a level at a time under a lip of turf. The country beyond the map is built once into the static scene
// (terrain.ts); the map's own ground is drawn as objects in chunks (`MapGround`), so earthworks can redraw what they change.

/** How high one level stands, in metres. */
export const LEVEL_HEIGHT = 0.75;

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

/** How steep a ramp is (radians). */
const SLOPE = Math.atan(LEVEL_HEIGHT);

/**
 * Lays a flat tile-sized object (a soil bed, an overlay tile) on a tile of the relief, lifted `lift` above it: on a ramp it
 * is tilted to the slope and stretched along it. Writes the transform into `pos`, `rot` and `scale`.
 */
export function lay(r: Relief, x: number, y: number, lift: number, pos: THREE.Vector3, rot: THREE.Euler, scale: THREE.Vector3, yaw = 0) {
  const d = r.ramp[y * r.width + x], k = 1 / Math.cos(SLOPE);
  pos.set(x + 0.5, centreLevel(r, x, y) * LEVEL_HEIGHT + lift, y + 0.5);
  if (d === FLAT) { rot.set(0, yaw, 0); scale.set(1, 1, 1); return; }
  // Rising north (−z) tips the far edge up: a turn about x; rising east (+x), a turn about z.
  rot.set(d === 0 ? SLOPE : d === 2 ? -SLOPE : 0, 0, d === 1 ? SLOPE : d === 3 ? -SLOPE : 0);
  scale.set(d === 1 || d === 3 ? k : 1, 1, d === 0 || d === 2 ? k : 1);
}

/** Grass by fertility band: dry and yellow-green on poor soil, deep green on rich. */
export const GRASS = [[0xa8a860, 0xb0ae66], [0x92a456, 0x98aa5a], [0x7c9e4c, 0x82a450], [0x6c9846, 0x72a04a], [0x5e9042, 0x649646]];
/** Cliff faces: earth for the low levels, stone higher up, a level a band; the turf lip along the top. */
const EARTH = [0x9c7e5a, 0x8c714f], STONE = [0x8e877a, 0x807a6e], LIP = 0x5d7d3a;
/** How deep the turf lip over a cliff is (m). */
const LIP_DEPTH = 0.09;
/** The level from which cliffs are stone. */
const STONE_FROM = 3;

/** Every colour the ground uses, so the palette can be chosen with them (MapGround's swatch). */
const COLOURS = [...GRASS.flat(), ...EARTH, ...STONE, LIP];

const OUT: readonly (readonly [number, number])[] = SIDES;

/** Triangles being gathered, as positions and linear colours (three numbers a vertex), ready for a static collector or an object. */
export class Tris {
  readonly pos: number[] = [];
  readonly col: number[] = [];
  /** How a colour is turned into the one drawn (the palette's choice, once known). */
  private readonly paint: (hex: number) => [number, number, number];
  constructor(paint: (hex: number) => [number, number, number] = (hex) => lin(hex)) { this.paint = paint; }

  /** A triangle, wound so that it faces `out` (its normal has a positive dot with it). */
  tri(a: number[], b: number[], c: number[], hex: number, out: readonly number[]) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    if (Math.hypot(n[0], n[1], n[2]) < 1e-9) return;
    const [p, q] = n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0 ? [c, b] : [b, c];
    const rgb = this.paint(hex);
    for (const v of [a, p, q]) { this.pos.push(v[0], v[1], v[2]); this.col.push(rgb[0], rgb[1], rgb[2]); }
  }

  quad(a: number[], b: number[], c: number[], d: number[], hex: number, out: readonly number[]) {
    this.tri(a, b, c, hex, out); this.tri(a, c, d, hex, out);
  }

  get empty() { return this.pos.length === 0; }

  /** The triangles as a geometry with flat normals, for `pushPrepared` or `addObject`. */
  geometry(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.computeVertexNormals();
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aFlag', new THREE.Float32BufferAttribute(new Float32Array(this.pos.length / 3).fill(FLAG.NORMAL), 1));
    return g;
  }
}

const H = LEVEL_HEIGHT;

/** A tile's top over its corners (levels: north-west, north-east, south-east, south-west), at (x, y) in the world. */
export function tileTop(t: Tris, x: number, y: number, c: readonly number[], hex: number) {
  t.quad([x, c[0] * H, y], [x, c[3] * H, y + 1], [x + 1, c[2] * H, y + 1], [x + 1, c[1] * H, y], hex, [0, 1, 0]);
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
export function cliff(t: Tris, x: number, y: number, side: number, own: readonly number[], below: readonly number[], tone: (hex: number) => number = (c) => c) {
  if (own[0] <= below[0] + 1e-9 && own[1] <= below[1] + 1e-9) return;
  const [a, b] = sideEnds(x, y, side), out = [OUT[side][0], 0, OUT[side][1]];
  const top: Line = [own[0] * H, own[1] * H], bottom: Line = [below[0] * H, below[1] * H], lip: Line = [top[0] - LIP_DEPTH, top[1] - LIP_DEPTH];
  band(t, a, b, [bottom, lip], [top], tone(LIP), out);
  const from = Math.floor(Math.min(below[0], below[1])), to = Math.ceil(Math.max(own[0], own[1]));
  for (let k = from; k < to; k++) {
    const shades = k >= STONE_FROM ? STONE : EARTH;
    band(t, a, b, [bottom, [k * H, k * H]], [lip, [(k + 1) * H, (k + 1) * H]], tone(shades[k & 1]), out);
  }
}

/** A grass colour for a tile: its fertility band, and one of two shades by a hash of where it is. */
export const grassOf = (fertility: number, x: number, y: number) => GRASS[Math.min(4, Math.floor(fertility / 20))][hash(x, y) < 0.5 ? 0 : 1];

/** The relief of the land around a map, indexed in map coordinates (map tile (0, 0) is land tile (margin, margin)). */
export const landRelief = (land: Land): Relief => ({ width: land.width, height: land.height, level: land.level, ramp: land.ramp });

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
  private readonly objs: (PixelObject | null)[] = [];
  private readonly level: number[];
  private readonly ramp: number[];
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
    this.level = [...s.map.level]; this.ramp = [...s.map.ramp];
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
    for (const g of this.first) this.objs.push(g ? this.add(g) : null);
    this.first.length = 0;
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
    for (let i = 0; i < m.level.length; i++) {
      if (m.level[i] === this.level[i] && m.ramp[i] === this.ramp[i]) continue;
      this.level[i] = m.level[i]; this.ramp[i] = m.ramp[i];
      const x = i % w, y = Math.floor(i / w);
      for (const [dx, dy] of [[0, 0], ...SIDES]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < m.height) dirty.add(Math.floor(ny / CHUNK) * cols + Math.floor(nx / CHUNK));
      }
    }
    for (const k of dirty) {
      this.objs[k]?.remove();
      const g = this.build(k % cols, Math.floor(k / cols));
      this.objs[k] = g ? this.add(g) : null;
    }
  }

  private build(cx: number, cy: number): THREE.BufferGeometry | null {
    const m = this.s.map, land = this.land, M = land.margin, lr = landRelief(land);
    const t = new Tris((hex) => this.painted.get(hex) ?? lin(hex));
    for (let y = cy * CHUNK; y < Math.min(m.height, (cy + 1) * CHUNK); y++) for (let x = cx * CHUNK; x < Math.min(m.width, (cx + 1) * CHUNK); x++) {
      const i = y * m.width + x;
      if (m.terrain[i] === TERRAIN.water) continue;
      tileTop(t, x, y, corners(m, x, y), grassOf(this.s.soilBase[i], x, y));
      for (let side = 0; side < 4; side++) {
        const nx = x + SIDES[side][0], ny = y + SIDES[side][1], own = sideOf(m, x, y, side);
        const onMap = nx >= 0 && ny >= 0 && nx < m.width && ny < m.height;
        const water = onMap ? m.terrain[ny * m.width + nx] === TERRAIN.water : land.terrain[(ny + M) * land.width + nx + M] === TERRAIN.water;
        // Down to water's surface level (the bank below it is the scene's), or to the neighbour's side.
        const below = water ? [onMap ? m.level[ny * m.width + nx] : land.level[(ny + M) * land.width + nx + M]].flatMap((l) => [l, l])
          : onMap ? sideOf(m, nx, ny, (side + 2) % 4) : sideOf(lr, nx + M, ny + M, (side + 2) % 4);
        cliff(t, x, y, side, own, below);
      }
    }
    return t.empty ? null : t.geometry();
  }
}
