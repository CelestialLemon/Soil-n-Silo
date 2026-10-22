import * as THREE from 'three';
import { FLAG, type PixelObject, type PixelRenderer } from 'pixel3d-renderer';
import type { Season } from '../game/seasons.ts';
import { TERRAIN, type Land } from '../game/map.ts';
import { joins } from '../game/relief.ts';
import { BUILDINGS } from '../game/data.ts';
import { layoutOf, reliefOf, type GameState } from '../game/state.ts';
import { grassOf, HALO, isBank, LEVEL_HEIGHT as H, Tris, tuftOf, type Lie, type MapGround } from './ground.ts';

// Small things in the grass: tufts, a few wildflowers, small stones. Only decoration: they never count for farming,
// clearing or routes, and they leave the ground's lines and overlays clear (hidden while those show).

/**
 * Wildflowers by season (cream mostly, a second colour in patches) and how many there are against summer's (spring has most,
 * autumn a few late ones, winter none), and small stones.
 */
const FLOWERS: Record<Season, number[]> = {
  spring: [0xeee6b0, 0xc6b8d8], summer: [0xe4d99b, 0xe8b86a], autumn: [0xd8a64e, 0xb89aa8], winter: [0xe4d99b, 0xc6b8d8],
};
const FLOWER_SHARE: Record<Season, number> = { spring: 1.5, summer: 1, autumn: 0.3, winter: 0 };
const PEBBLE = 0xa19c80;
/** Where the flower patches' field (`patch`) is cream below: 70% of the land (the field's 70th percentile). */
const CREAM = 0.63;
/** Every colour drawn besides the grass's own tufts (for the palette). */
export const detailColours = (season: Season) => [...FLOWERS[season], PEBBLE];

/** How many tiles of country past the map have them (further out they would hardly be seen), thinning out over the last FADE. */
const REACH = 12, FADE = 3;
/** The tiles a side the map's are drawn in, as the ground's are. */
const CHUNK = 8;
/** The least distance (m) between two of them, and how far they keep from a cliff's edge. */
const SPACING = 0.65, LIP = 0.2;
/** How far (m) from its foot each reaches, with a little to spare: no part of it may stand where it may not. */
const REACHES: Record<Kind, number> = { tuft: 0.2, flower: 0.27, pebble: 0.2 };
/** How far (m) a tuft's smaller clump stands from it. */
const PAIR = 0.2;
/** How far (m) their feet sink, so the drawn ground (within a centimetre of the fitted one) never shows under them. */
const SINK = 0.02;
const UP = [0, 1, 0];

type Kind = 'tuft' | 'flower' | 'pebble';
/**
 * One placed: where (world x, z), what, its ground's height (m) there, its colour and its leaves' (a tuft's colour, a step
 * darker than the turf), its own turn and size, whether a tuft has a smaller one beside it, and the ground's height (m)
 * under its other parts (`parts`: a tuft's smaller clump, a flower's other blossoms, a stone's corners).
 */
interface Thing { x: number; z: number; kind: Kind; y: number; hex: number; green: number; yaw: number; size: number; pair: boolean; feet: number[] }

/** Where a tuft's smaller clump, a flower's other blossoms, or a stone's corners stand from its foot (world x, z offsets). */
function parts(kind: Kind, yaw: number, s: number, pair: boolean): number[][] {
  if (kind === 'tuft') return pair ? [[Math.cos(yaw) * PAIR, Math.sin(yaw) * PAIR]] : [];
  if (kind === 'pebble') return Array.from({ length: 5 }, (_, k) => {
    const a = yaw + k * Math.PI * 2 / 5, r = 0.16 * s * (0.8 + 0.4 * ((k * 0.37 + s) % 1));
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  return Array.from({ length: pair ? 2 : 1 }, (_, i) => { const a = yaw + (i + 1) * 2.1; return [Math.cos(a) * 0.13 * s, Math.sin(a) * 0.13 * s]; });
}

/** A fixed pseudo-random number in [0, 1) for a cell and a stream (integer mixing, the same everywhere). */
function rand(x: number, y: number, stream: number) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(stream + 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}

/** A slow field over the land in [0, 1], `cell` metres a feature (value noise, smoothly blended). */
function patch(x: number, z: number, cell: number, stream: number) {
  const u = x / cell, v = z / cell, i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
  const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv);
  const a = rand(i, j, stream), b = rand(i + 1, j, stream), c = rand(i, j + 1, stream), d = rand(i + 1, j + 1, stream);
  return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
}

/** Where the one in a cell (map tile coordinates) would stand, and its rank among its neighbours (the lowest stays). */
const spot = (cx: number, cy: number) => ({ x: cx + 0.15 + 0.7 * rand(cx, cy, 1), z: cy + 0.15 + 0.7 * rand(cx, cy, 2), rank: rand(cx, cy, 3) });

/** Whether the one in a cell gives way to a neighbour too near it with a lower rank (whatever either may stand on). */
function crowded(cx: number, cy: number) {
  const me = spot(cx, cy);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const o = spot(cx + dx, cy + dy);
    if (Math.hypot(o.x - me.x, o.z - me.z) < SPACING && (o.rank < me.rank || (o.rank === me.rank && (dy < 0 || (dy === 0 && dx < 0))))) return true;
  }
  return false;
}

/**
 * The small things in the grass on the map, on the country's halo round it (both following earthworks, in chunks), and on
 * the country a little further out (drawn once), all dulled off the map like the rest of the country.
 */
export class GroundDetail {
  private readonly r: PixelRenderer;
  private readonly s: GameState;
  private readonly land: Land;
  private readonly lie: Lie;
  private readonly ground: MapGround;
  private readonly tone: (hex: number) => number;
  private readonly chunks = new Map<number, { o: PixelObject; g: THREE.BufferGeometry; key: string }>();
  private readonly country: { o: PixelObject; g: THREE.BufferGeometry } | null;
  private readonly cols: number;
  private key = '';
  private shown = true;
  private readonly season: Season;

  /** `tone` dulls the country's colours. Make it once the ground's palette is chosen (`MapGround.show`). */
  constructor(r: PixelRenderer, s: GameState, land: Land, lie: Lie, ground: MapGround, tone: (hex: number) => number) {
    this.r = r; this.s = s; this.season = s.scenario.climate.season; this.land = land; this.lie = lie; this.ground = ground; this.tone = tone;
    this.cols = Math.ceil((s.map.width + 2 * HALO) / CHUNK);
    const { width: w, height: h } = s.map, out: Thing[] = [];
    for (let y = -REACH; y < h + REACH; y++) for (let x = -REACH; x < w + REACH; x++) {
      const far = Math.hypot(Math.max(0, -x - 0.5, x + 0.5 - w), Math.max(0, -y - 0.5, y + 0.5 - h));
      if (this.lie.withMap(x + land.margin, y + land.margin) || far > REACH) continue;
      const t = this.thing(x, y, null, Math.min(1, (REACH - far) / FADE));
      if (t) out.push(t);
    }
    this.country = out.length ? this.add(out) : null;
    this.sync();
  }

  /** Shows or hides them all. */
  show(on: boolean) {
    if (on === this.shown) return;
    this.shown = on;
    for (const c of this.chunks.values()) c.o.visible = on;
    if (this.country) this.country.o.visible = on;
  }

  /** Follows the map: after earthworks (call after `MapGround.sync`) or a change of buildings, redraws the chunks that changed. */
  sync() {
    const key = `${layoutOf(this.s)} ${reliefOf(this.s)}`;
    if (key === this.key) return;
    this.key = key;
    const busy = this.occupied(), down = Math.ceil((this.s.map.height + 2 * HALO) / CHUNK);
    for (let cy = 0; cy < down; cy++) for (let cx = 0; cx < this.cols; cx++) {
      const things: Thing[] = [];
      for (let y = cy * CHUNK; y < (cy + 1) * CHUNK; y++) for (let x = cx * CHUNK; x < (cx + 1) * CHUNK; x++) {
        if (x >= this.s.map.width + 2 * HALO || y >= this.s.map.height + 2 * HALO) continue;
        const t = this.thing(x - HALO, y - HALO, busy);
        if (t) things.push(t);
      }
      const k = cy * this.cols + cx, old = this.chunks.get(k), id = things.map((t) => `${t.kind}${t.x.toFixed(3)},${t.z.toFixed(3)},${t.y.toFixed(3)},${t.hex},${t.green},${t.feet.map((f) => f.toFixed(3)).join(',')}`).join(' ');
      if (old && old.key === id) continue;
      if (old) { old.o.remove(); old.g.dispose(); this.chunks.delete(k); }
      if (!things.length) continue;
      const c = this.add(things);
      c.o.visible = this.shown;
      this.chunks.set(k, { ...c, key: id });
    }
  }

  /** The map tiles none may stand on: water, buildings and fields, worked ground, trees and rock (1). */
  private occupied() {
    const m = this.s.map, out = new Uint8Array(m.width * m.height);
    m.terrain.forEach((t, i) => { if (t !== TERRAIN.grass || this.s.worked[i]) out[i] = 1; });
    for (const b of this.s.buildings) {
      const n = BUILDINGS[b.type].size;
      for (let y = b.y; y < b.y + n; y++) for (let x = b.x; x < b.x + n; x++) out[y * m.width + x] = 1;
    }
    return out;
  }

  /** Whether a land tile may have them: open grass (on the map, nothing in `busy` there), not the country's track. */
  private open(lx: number, ly: number, busy: Uint8Array | null) {
    const land = this.land, m = this.s.map, x = lx - land.margin, y = ly - land.margin;
    if (lx < 0 || ly < 0 || lx >= land.width || ly >= land.height) return false;
    if (this.lie.onMap(lx, ly)) return !busy || !busy[y * m.width + x];
    const i = ly * land.width + lx;
    return land.terrain[i] === TERRAIN.grass && !land.track[i];
  }

  /** What stands in a cell (map tile coordinates), if anything: by its place, the ground's lie, how dry it is, and `fade` (fewer, towards the far country). */
  private thing(cx: number, cy: number, busy: Uint8Array | null, fade = 1): Thing | null {
    if (crowded(cx, cy)) return null;
    const { x, z } = spot(cx, cy), M = this.land.margin, lx = cx + M, ly = cy + M, u = x - cx, v = z - cy;
    if (!this.open(lx, ly, busy)) return null;
    const edge = [v, 1 - u, 1 - v, u];
    for (let side = 0; side < 4; side++) if (edge[side] < LIP && !joins(this.lie.relief, lx, ly, side)) return null;
    // Fewer on steep ground, and no flowers there or on banks; drier ground has fewer flowers and more stones.
    const [hx, hz] = this.lie.surface.slope(lx, ly, u, v), slope = Math.hypot(hx, hz) * H, bank = isBank(this.lie.relief, lx, ly);
    const steep = slope < 0.25 ? 1 : slope < 0.5 ? 1 - 3 * (slope - 0.25) : 0.25;
    const d = Math.min(1, Math.max(0, this.ground.dryness[ly * this.land.width + lx])), lush = 0.35 + 1.3 * patch(x, z, 6, 4);
    const tuft = 0.34 * (1 - 0.45 * d), flower = slope < 0.5 && !bank ? 0.06 * FLOWER_SHARE[this.season] * (1 - d) ** 2 : 0, pebble = 0.02 + 0.05 * d;
    const all = (tuft + flower + pebble) * lush * steep * fade;
    if (rand(cx, cy, 5) >= all) return null;
    const pick = rand(cx, cy, 6) * (tuft + flower + pebble), kind: Kind = pick < tuft ? 'tuft' : pick < tuft + flower ? 'flower' : 'pebble';
    const yaw = rand(cx, cy, 8) * Math.PI * 2, size = 0.85 + 0.3 * rand(cx, cy, 9);
    if (!this.fits(lx, ly, x, z, REACHES[kind] * size, busy)) return null;
    const pair = rand(cx, cy, 10) < 0.5 && (kind !== 'tuft' || this.fits(lx, ly, x + Math.cos(yaw) * PAIR, z + Math.sin(yaw) * PAIR, REACHES.tuft * size * 0.8, busy));
    const feet = parts(kind, yaw, size, pair).map(([dx, dz]) => this.lie.y(x + dx, z + dz) - SINK);
    const p = this.lie.point(lx, ly, u, v), dull = this.lie.onMap(lx, ly) ? (c: number) => c : this.tone;
    const green = tuftOf(dull(grassOf(this.season, d, bank)), p.s);
    const hex = kind === 'tuft' ? green : kind === 'pebble' ? dull(PEBBLE) : dull(FLOWERS[this.season][patch(x, z, 4, 7) < CREAM ? 0 : 1]);
    return { x, z, kind, y: p.p[1] - SINK, hex, green, yaw, size, pair, feet };
  }

  /**
   * Whether what stands at (x, z) (world), `r` across, on land tile (lx, ly), stays on ground it may stand on: wherever
   * round it reaches past its own tile, onto open ground across a side that joins (never over a cliff's edge).
   */
  private fits(lx: number, ly: number, x: number, z: number, r: number, busy: Uint8Array | null) {
    const M = this.land.margin, rel = this.lie.relief;
    for (let k = 0; k <= 8; k++) {
      const a = k * Math.PI / 4, px = k === 8 ? x : x + Math.cos(a) * r, pz = k === 8 ? z : z + Math.sin(a) * r;
      const tx = Math.floor(px) + M, ty = Math.floor(pz) + M;
      if (tx === lx && ty === ly) continue;
      if (!this.open(tx, ty, busy)) return false;
      // Across its own sides (east 1, west 3, south 2, north 0), and on round for a corner.
      if (tx !== lx && !joins(rel, lx, ly, tx > lx ? 1 : 3)) return false;
      if (ty !== ly && !joins(rel, lx, ly, ty > ly ? 2 : 0)) return false;
      if (tx !== lx && ty !== ly && (!joins(rel, tx, ly, ty > ly ? 2 : 0) || !joins(rel, lx, ty, tx > lx ? 1 : 3))) return false;
    }
    return true;
  }

  private add(things: Thing[]) {
    const t = new Tris(this.ground.paint);
    t.flag = FLAG.DECOR;
    for (const th of things) draw(t, th);
    const g = t.geometry(), o = this.r.addObject(g);
    o.setTransform(new THREE.Vector3(0, 0, 0));
    o.castShadow = false; o.snap = false;
    return { o, g };
  }
}

/** A leaf from (x, y, z) leaning out along `a` (`lean` of its height), `len` tall and `w` wide at its foot: seen from both sides. */
function leaf(t: Tris, x: number, y: number, z: number, a: number, len: number, w: number, hex: number, lean = 0.45) {
  const cx = Math.cos(a), sz = Math.sin(a), px = -sz * w / 2, pz = cx * w / 2;
  const p = [x - px, y, z - pz], q = [x + px, y, z + pz], tip = [x + cx * len * lean, y + len, z + sz * len * lean];
  // Lit like the ground under it, whichever side shows.
  t.tri(p, q, tip, hex, [pz, 0, -px], [UP, UP, UP]);
  t.tri(p, q, tip, hex, [-pz, 0, px], [UP, UP, UP]);
}

/** A clump of leaves round (x, z), turned `yaw`, `s` its size. */
function clump(t: Tris, x: number, y: number, z: number, yaw: number, s: number, hex: number) {
  for (let k = 0; k < 4; k++) {
    const a = yaw + k * Math.PI / 2 + (k & 1) * 0.4, r = 0.05 * s;
    leaf(t, x + Math.cos(a) * r, y, z + Math.sin(a) * r, a, (k & 1 ? 0.2 : 0.26) * s + SINK, 0.11 * s, hex);
  }
}

/** A blossom: a squat eight-faced head `r` across at (x, y, z). */
function blossom(t: Tris, x: number, y: number, z: number, yaw: number, r: number, hex: number) {
  const top = [x, y + r * 0.6, z], bottom = [x, y - r * 0.6, z];
  const ring = [0, 1, 2, 3].map((k) => { const a = yaw + k * Math.PI / 2; return [x + Math.cos(a) * r, y, z + Math.sin(a) * r]; });
  for (let k = 0; k < 4; k++) {
    const a = ring[k], b = ring[(k + 1) % 4], out = [(a[0] + b[0]) / 2 - x, 0, (a[2] + b[2]) / 2 - z];
    t.tri(a, b, top, hex, [out[0], 0.6 * r, out[2]]);
    t.tri(a, b, bottom, hex, [out[0], -0.6 * r, out[2]]);
  }
}

function draw(t: Tris, th: Thing) {
  const { x, y, z, yaw, size: s, hex } = th;
  if (th.kind === 'tuft') {
    clump(t, x, y, z, yaw, s, hex);
    if (th.pair) clump(t, x + Math.cos(yaw) * PAIR, th.feet[0], z + Math.sin(yaw) * PAIR, yaw + 1, s * 0.8, hex);
  } else if (th.kind === 'flower') {
    // Two or three blossoms over a few leaves.
    clump(t, x, y, z, yaw, s * 0.7, th.green);
    const at = [[0, 0], ...parts('flower', yaw, s, th.pair)], feet = [y, ...th.feet];
    at.forEach(([dx, dz], k) => {
      const bx = x + dx, bz = z + dz, foot = feet[k], by = foot + SINK + (0.3 - 0.06 * k) * s;
      // Its stem: two thin crossed blades up to the head.
      for (const turn of [0, Math.PI / 2]) leaf(t, bx, foot, bz, yaw + k + turn, by - foot, 0.035 * s, th.green, 0);
      blossom(t, bx, by, bz, yaw + k, 0.11 * s, hex);
    });
  } else {
    // A low, five-sided stone seated on the ground under its corners, its top a little smaller than its foot.
    const r = 0.16 * s, top = th.feet.reduce((a, b) => a + b, 0) / 5 + SINK + 0.08 * s;
    const foot = parts('pebble', yaw, s, false).map(([dx, dz], k) => [x + dx, th.feet[k], z + dz]);
    const cap = foot.map(([fx, , fz]) => { const a = 0.2, dx = fx - x, dz = fz - z; return [x + (dx * Math.cos(a) - dz * Math.sin(a)) * 0.6, top, z + (dx * Math.sin(a) + dz * Math.cos(a)) * 0.6]; });
    for (let k = 0; k < 5; k++) {
      const n = (k + 1) % 5, out = [(foot[k][0] + foot[n][0]) / 2 - x, 0.5 * r, (foot[k][2] + foot[n][2]) / 2 - z];
      t.quad(foot[k], foot[n], cap[n], cap[k], hex, out);
    }
    t.tri(cap[0], cap[1], cap[2], hex, UP); t.tri(cap[0], cap[2], cap[3], hex, UP); t.tri(cap[0], cap[3], cap[4], hex, UP);
  }
}
