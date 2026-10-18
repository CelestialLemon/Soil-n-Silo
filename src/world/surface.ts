import type { Relief } from '../game/relief.ts';

// The ground as it is drawn: a smooth reading of the rules' whole levels. The rules keep each tile's corners at whole
// levels (relief.ts), so ground that rises gently is shelves joined by one-tile ramps. Drawn as they are, those read as
// terraces. Instead, the view fits one smooth height to each point where tiles join (a corner fan, as `sheetAt` finds),
// bending as little as it can while staying within half a level of the rules' height there, and draws each tile as a
// bicubic patch over its four corners. Water stays exactly at its level, and so does worked ground (levelled, or under a
// building that needed it level: GameState `worked`), so a building's pad is exactly flat. Where tiles don't join (a
// cliff) each side keeps its own fan, so cliffs stay sharp.
//
// It also keeps the slopes the hillshade lights (`shadeAt`): the patches' own slopes, blurred over a tile or so, so the
// light falls in broad, clean shapes rather than following every small bend.
//
// Pure arithmetic on a relief, so the tests run it in Node; ground.ts draws it.

/** How far (levels) a point's smooth height may stray from the rules' height there: just under half a level. */
export const SLACK = 0.499;
/** How strongly the fit pulls towards the rules' heights, against bending: just enough to pick one answer. */
const PULL = 0.002;
/**
 * How the fit is solved: sweeps of projected Gauss–Seidel, over-relaxed by OMEGA. A fixed number, so the same ground
 * always fits the same way: enough from scratch for the whole land (the map's points to well under a millimetre), and
 * fewer from the last fit after earthworks.
 */
const OMEGA = 1.7, SWEEPS = 256, REFIT_SWEEPS = 128;
/** How far (tiles) past the ground it moves a refit reckons, so the window's edge never shows in it. */
const WINDOW = 8;
/** How many times the hillshade's slopes are blurred, each time towards the neighbouring points'. */
const SHADE_BLUR = 2;
/** Tile corners (north-west, north-east, south-east, south-west) as steps along x and along z from the north-west one. */
const CU = [0, 1, 1, 0], CV = [0, 0, 1, 1];
/** For each corner, its neighbours along the tile's sides: the corner east or west of it, and south or north of it. */
const XNEXT = [1, 0, 3, 2], ZNEXT = [3, 2, 1, 0];
/** The most fans one fan's row of the fit touches (its neighbours two steps each way, and diagonally). */
const ROW = 32;

/** What the fit needs to know of each tile besides its corners. */
export interface Ground {
  /** Whether a tile is water: its corners stay at its level. */
  water(x: number, y: number): boolean;
  /** Whether a tile is worked: drawn exactly at its corners' levels. */
  worked(x: number, y: number): boolean;
}

/**
 * The smooth ground over a relief. Fitted once over the whole land; `refit` follows earthworks, moving only the points it
 * is let move (the map's and a little round it), so ground drawn once never changes under it.
 */
export class Surface {
  readonly width: number;
  readonly height: number;
  /** Each tile corner's smooth height (levels), four a tile like `Relief.corner`. */
  private readonly f: Float64Array;
  /** Each tile's patch: its 4 × 4 Bézier control heights (levels), row by row along z, each row along x. */
  private readonly net: Float64Array;
  /** Whether each tile's patch is flat (all its controls one height). */
  private readonly flat: Uint8Array;
  /** Each tile corner's slopes for the hillshade (levels a tile, along x then z), two a corner. */
  private readonly shade: Float64Array;
  private readonly relief: Relief;
  private readonly ground: Ground;

  constructor(relief: Relief, ground: Ground) {
    this.relief = relief; this.ground = ground;
    this.width = relief.width; this.height = relief.height;
    const n = this.width * this.height;
    this.f = new Float64Array(n * 4);
    this.net = new Float64Array(n * 16);
    this.flat = new Uint8Array(n);
    this.shade = new Float64Array(n * 8);
    const fans = new Fans(relief, ground, null);
    fans.start(null);
    fans.solve(SWEEPS);
    fans.write(this.f);
    patches(fans, this.f, this.width, this.height, this.net, this.flat, this.shade);
  }

  /**
   * Fits the ground again after the relief changed (earthworks, or tiles worked) in the tiles [x0, x1) × [y0, y1), from
   * where it was, and the patches and shade of the tiles inside (those drawn again); the tiles whose patch or shade moved.
   * The tiles outside keep theirs, as they were drawn. It moves only the points at least two tiles in from the edge, so
   * the points on the edge keep their heights and their slopes (which take the points next to them): the tiles either
   * side of it still meet, smooth, and the edge's shade is kept as it was. Worked out over a window a little larger, so
   * the ground round it is reckoned as before.
   */
  refit(x0: number, y0: number, x1: number, y1: number): number[] {
    const P = WINDOW, wx = Math.max(0, x0 - P), wy = Math.max(0, y0 - P), ww = Math.min(this.width, x1 + P) - wx, wh = Math.min(this.height, y1 + P) - wy;
    const corner = new Array<number>(ww * wh * 4), f = new Float64Array(ww * wh * 4);
    for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) for (let k = 0; k < 4; k++) {
      const from = ((y + wy) * this.width + x + wx) * 4 + k, to = (y * ww + x) * 4 + k;
      corner[to] = this.relief.corner[from]; f[to] = this.f[from];
    }
    const inside = (x: number, y: number) => x + wx >= x0 && y + wy >= y0 && x + wx < x1 && y + wy < y1;
    const free = (x: number, y: number) => x + wx > x0 && y + wy > y0 && x + wx < x1 - 1 && y + wy < y1 - 1;
    const fans = new Fans({ width: ww, height: wh, corner }, { water: (x, y) => this.ground.water(x + wx, y + wy), worked: (x, y) => this.ground.worked(x + wx, y + wy) }, free);
    fans.start(f);
    fans.solve(REFIT_SWEEPS);
    fans.write(f);
    const net = new Float64Array(ww * wh * 16), flat = new Uint8Array(ww * wh), shade = new Float64Array(ww * wh * 8);
    patches(fans, f, ww, wh, net, flat, shade);
    const changed: number[] = [];
    for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) {
      if (!inside(x, y)) continue;
      const i = (y + wy) * this.width + x + wx, w = y * ww + x;
      for (let k = 0; k < 4; k++) this.f[i * 4 + k] = f[w * 4 + k];
      let moved = this.flat[i] !== flat[w];
      for (let k = 0; k < 16; k++) { moved ||= Math.abs(this.net[i * 16 + k] - net[w * 16 + k]) > 1e-4; this.net[i * 16 + k] = net[w * 16 + k]; }
      // The shade at points on the edge stays as the tiles outside have it, so the light meets across it.
      for (let k = 0; k < 8; k++) {
        const X = x + wx + CU[k >> 1], Y = y + wy + CV[k >> 1];
        if (X === x0 || X === x1 || Y === y0 || Y === y1) continue;
        moved ||= Math.abs(this.shade[i * 8 + k] - shade[w * 8 + k]) > 1e-3; this.shade[i * 8 + k] = shade[w * 8 + k];
      }
      this.flat[i] = flat[w];
      if (moved) changed.push(i);
    }
    return changed;
  }

  /** The smooth height (levels) of a tile's corner k (north-west, north-east, south-east, south-west). */
  cornerAt(x: number, y: number, k: number): number { return this.f[(y * this.width + x) * 4 + k]; }

  /** A tile's height (levels) at (u, v) across it (0 to 1 east and south); exactly its level on a flat tile. */
  on(x: number, y: number, u: number, v: number): number {
    const p = this.net, o = (y * this.width + x) * 16;
    if (this.flat[y * this.width + x]) return p[o];
    const bu = bern(u), bv = bern(v);
    let h = 0;
    for (let j = 0; j < 4; j++) h += bv[j] * (bu[0] * p[o + j * 4] + bu[1] * p[o + j * 4 + 1] + bu[2] * p[o + j * 4 + 2] + bu[3] * p[o + j * 4 + 3]);
    return h;
  }

  /** A tile's slopes (levels a tile) along x and along z at (u, v) across it. */
  slope(x: number, y: number, u: number, v: number): [number, number] {
    const p = this.net, o = (y * this.width + x) * 16;
    if (this.flat[y * this.width + x]) return [0, 0];
    const bu = bern(u), bv = bern(v), du = dbern(u), dv = dbern(v);
    let hx = 0, hz = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const c = p[o + j * 4 + i]; hx += du[i] * bv[j] * c; hz += bu[i] * dv[j] * c; }
    return [hx, hz];
  }

  /** The slopes (levels a tile, along x and z) the hillshade lights a tile by at (u, v) across it: between its corners'. */
  shadeAt(x: number, y: number, u: number, v: number): [number, number] {
    const s = this.shade, o = (y * this.width + x) * 8, w = [(1 - u) * (1 - v), u * (1 - v), u * v, (1 - u) * v];
    return [w[0] * s[o] + w[1] * s[o + 2] + w[2] * s[o + 4] + w[3] * s[o + 6], w[0] * s[o + 1] + w[1] * s[o + 3] + w[2] * s[o + 5] + w[3] * s[o + 7]];
  }

  /**
   * How far (levels) flat triangles may stray from a tile's patch, times the square of how many pieces each side is cut
   * into: no triangle with its corners within one cell strays further, from the bounds of the patch's second derivatives
   * (its Bézier controls bound them).
   */
  bend(x: number, y: number): number {
    if (this.flat[y * this.width + x]) return 0;
    const p = this.net, o = (y * this.width + x) * 16;
    let xx = 0, zz = 0, xz = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const c = p[o + j * 4 + i];
      if (i < 2) xx = Math.max(xx, Math.abs(c - 2 * p[o + j * 4 + i + 1] + p[o + j * 4 + i + 2]));
      if (j < 2) zz = Math.max(zz, Math.abs(c - 2 * p[o + (j + 1) * 4 + i] + p[o + (j + 2) * 4 + i]));
      if (i < 3 && j < 3) xz = Math.max(xz, Math.abs(c - p[o + j * 4 + i + 1] - p[o + (j + 1) * 4 + i] + p[o + (j + 1) * 4 + i + 1]));
    }
    return (6 * xx + 6 * zz + 2 * 9 * xz) / 8;
  }

  /** The height (levels) at a point (x, y in tiles), on the tile under it (clamped to the relief). */
  at(px: number, py: number): number {
    const x = Math.min(this.width - 1, Math.max(0, Math.floor(px))), y = Math.min(this.height - 1, Math.max(0, Math.floor(py)));
    return this.on(x, y, Math.min(1, Math.max(0, px - x)), Math.min(1, Math.max(0, py - y)));
  }
}

/**
 * Works out each tile's patch (into `net`, and whether it is `flat`) and the hillshade's slopes (`shade`) from the fitted
 * heights `f` of a relief `width` × `height` tiles.
 */
function patches(fans: Fans, f: Float64Array, width: number, height: number, net: Float64Array, flats: Uint8Array, shade: Float64Array) {
  const N = fans.count, tx = new Float64Array(N), tz = new Float64Array(N);
  // Each fan's slopes along x and along z (levels a tile): the gentlest of the sides of its fan along that axis, or flat
  // where they disagree in direction, or where it has no neighbour (or no one neighbour) on a side, at a cliff's lip. So
  // a patch never overshoots its corners and a flat tile stays flat.
  for (let node = 0; node < N; node++) {
    for (const [axis, next, ahead, out] of [[0, XNEXT, CU, tx], [2, ZNEXT, CV, tz]] as const) {
      if (fans.next[node * 4 + axis] < 0 || fans.next[node * 4 + axis + 1] < 0) continue;
      let s = NaN;
      for (let i = fans.first[node]; i < fans.first[node + 1]; i++) {
        const e = fans.list[i], d = (f[(e & ~3) + next[e & 3]] - f[e]) * (ahead[e & 3] === 0 ? 1 : -1);
        s = Number.isNaN(s) ? d : minmod(s, d);
      }
      out[node] = s;
    }
  }
  for (let i = 0; i < width * height; i++) {
    const b = i * 4, p = net, o = i * 16;
    // Each corner sets the four controls nearest it: its height, a third of its slopes inwards, and both (no twist).
    for (let k = 0; k < 4; k++) {
      const node = fans.of[b + k], ci = CU[k] * 3, cj = CV[k] * 3, sx = CU[k] ? -1 : 1, sz = CV[k] ? -1 : 1, h = f[b + k];
      const ax = sx * tx[node] / 3, az = sz * tz[node] / 3;
      p[o + cj * 4 + ci] = h;
      p[o + cj * 4 + ci + sx] = h + ax;
      p[o + (cj + sz) * 4 + ci] = h + az;
      p[o + (cj + sz) * 4 + ci + sx] = h + ax + az;
    }
    let flat = 1;
    for (let k = 1; k < 16; k++) if (p[o + k] !== p[o]) { flat = 0; break; }
    flats[i] = flat;
  }
  // The hillshade's slopes: each fan's, blurred towards its neighbours' (each counting half its own), flat at water and
  // on worked ground so a pad is lit as flat as it is.
  let gx = tx, gz = tz;
  const near: number[] = [];
  for (let pass = 0; pass < SHADE_BLUR; pass++) {
    const nx = new Float64Array(N), nz = new Float64Array(N);
    for (let node = 0; node < N; node++) {
      if (fans.pinned[node]) continue;
      let sx = 2 * gx[node], sz = 2 * gz[node], w = 2;
      fans.around(node, near);
      for (const o of near) { sx += gx[o]; sz += gz[o]; w++; }
      nx[node] = sx / w; nz[node] = sz / w;
    }
    gx = nx; gz = nz;
  }
  for (let e = 0; e < f.length; e++) { const node = fans.of[e]; shade[e * 2] = gx[node]; shade[e * 2 + 1] = gz[node]; }
}

const minmod = (a: number, b: number) => (a > 0 && b > 0 ? Math.min(a, b) : a < 0 && b < 0 ? Math.max(a, b) : 0);
const bern = (t: number) => { const s = 1 - t; return [s * s * s, 3 * t * s * s, 3 * t * t * s, t * t * t]; };
const dbern = (t: number) => { const s = 1 - t; return [-3 * s * s, 3 * s * s - 6 * t * s, 6 * t * s - 3 * t * t, 3 * t * t]; };

/**
 * The points the fit moves: one for each corner fan (the tile corners at a grid point whose ground joins there), each with
 * its neighbours along the axes, its bounds, and the height the fit finds.
 */
class Fans {
  /** Each tile corner's fan. */
  readonly of: Int32Array;
  /** Each fan's tile corners (as tile × 4 + corner), listed from `first`. */
  readonly first: Int32Array;
  readonly list: Int32Array;
  readonly count: number;
  /**
   * Each fan's neighbouring fan east, west, south and north of it (four a fan): -1 where there is none (the land's edge, or
   * a cliff), -2 where there are two (a cliff that starts at this point).
   */
  readonly next: Int32Array;
  /** Each fan's rules' level, its lowest and highest smooth height, and its smooth height. */
  private readonly q: Float64Array;
  private readonly lo: Float64Array;
  private readonly hi: Float64Array;
  private readonly h: Float64Array;
  /** The fans held at their level: water's and worked ground's. */
  readonly pinned: Uint8Array;
  /** The fans the fit moves. */
  private readonly free: Int32Array;

  /** With `free` null, every fan not pinned moves. */
  constructor(r: Relief, g: Ground, free: ((x: number, y: number) => boolean) | null) {
    const W = r.width, H = r.height, c = r.corner, n = W * H * 4;
    // Tile corners in one fan where their tiles join: across a side whose two ends meet.
    const up = Int32Array.from({ length: n }, (_, i) => i);
    const root = (i: number) => { while (up[i] !== i) { up[i] = up[up[i]]; i = up[i]; } return i; };
    const join = (a: number, b: number) => { a = root(a); b = root(b); if (a !== b) up[Math.max(a, b)] = Math.min(a, b); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const a = (y * W + x) * 4;
      if (x + 1 < W && c[a + 1] === c[a + 4] && c[a + 2] === c[a + 7]) { join(a + 1, a + 4); join(a + 2, a + 7); }
      if (y + 1 < H && c[a + 3] === c[a + W * 4] && c[a + 2] === c[a + W * 4 + 1]) { join(a + 3, a + W * 4); join(a + 2, a + W * 4 + 1); }
    }
    this.of = new Int32Array(n);
    const id = new Int32Array(n).fill(-1);
    let count = 0;
    for (let e = 0; e < n; e++) { const rt = root(e); if (id[rt] < 0) id[rt] = count++; this.of[e] = id[rt]; }
    this.count = count;
    // Each fan's corners.
    this.first = new Int32Array(count + 1);
    for (let e = 0; e < n; e++) this.first[this.of[e] + 1]++;
    for (let i = 0; i < count; i++) this.first[i + 1] += this.first[i];
    this.list = new Int32Array(n);
    const fill = this.first.slice(0, count);
    for (let e = 0; e < n; e++) this.list[fill[this.of[e]]++] = e;
    // Each fan's neighbours along the axes, level, bounds and freedom.
    this.next = new Int32Array(count * 4).fill(-1);
    this.q = new Float64Array(count); this.lo = new Float64Array(count); this.hi = new Float64Array(count); this.h = new Float64Array(count);
    this.pinned = new Uint8Array(count);
    const moves = new Uint8Array(count).fill(1), freed: number[] = [];
    for (let node = 0; node < count; node++) {
      for (let i = this.first[node]; i < this.first[node + 1]; i++) {
        const e = this.list[i], t = e >> 2, k = e & 3, x = t % W, y = (t - x) / W;
        if (g.water(x, y) || g.worked(x, y)) this.pinned[node] = 1;
        if (free && !free(x, y)) moves[node] = 0;
        this.link(node, CU[k] === 0 ? 0 : 1, this.of[(e & ~3) + XNEXT[k]]);
        this.link(node, CV[k] === 0 ? 2 : 3, this.of[(e & ~3) + ZNEXT[k]]);
      }
      const q = c[this.list[this.first[node]]];
      this.q[node] = q;
      this.lo[node] = this.pinned[node] ? q : Math.min(q, Math.max(0, q - SLACK));
      this.hi[node] = this.pinned[node] ? q : q + SLACK;
      if (moves[node] && !this.pinned[node]) freed.push(node);
    }
    this.free = Int32Array.from(freed);
  }

  /** Notes `o` as a fan's neighbour on one side (east, west, south, north). */
  private link(node: number, dir: number, o: number) {
    const k = node * 4 + dir, was = this.next[k];
    this.next[k] = was === -1 || was === o ? o : -2;
  }

  /** A fan's distinct neighbours along the tiles' sides, into `out` (cleared first). */
  around(node: number, out: number[]) {
    out.length = 0;
    for (let i = this.first[node]; i < this.first[node + 1]; i++) {
      const e = this.list[i], a = this.of[(e & ~3) + XNEXT[e & 3]], b = this.of[(e & ~3) + ZNEXT[e & 3]];
      if (!out.includes(a)) out.push(a);
      if (!out.includes(b)) out.push(b);
    }
  }

  /** Starts each fan's height at its rules' level, or (with `f`) at the mean of its corners' heights there, in bounds. */
  start(f: Float64Array | null) {
    for (let node = 0; node < this.count; node++) {
      let h = this.q[node];
      if (f) {
        let s = 0;
        for (let i = this.first[node]; i < this.first[node + 1]; i++) s += f[this.list[i]];
        h = s / (this.first[node + 1] - this.first[node]);
      }
      this.h[node] = Math.min(this.hi[node], Math.max(this.lo[node], h));
    }
  }

  /** Writes each tile corner's smooth height. */
  write(f: Float64Array) { for (let e = 0; e < f.length; e++) f[e] = this.h[this.of[e]]; }

  /**
   * Fits the free fans' heights: the least bending (plus a slight pull to the rules' levels) within their bounds, the
   * others held where they are. The energy is the sum of squares of the second differences along x and z at each fan with
   * one neighbour either side on that axis, and twice the twist across each tile; solved by `sweeps` sweeps of projected
   * Gauss–Seidel, over-relaxed, over the energy's rows for the free fans.
   */
  solve(sweeps: number) {
    const free = this.free, slot = new Int32Array(this.count).fill(-1);
    free.forEach((node, i) => { slot[node] = i; });
    // Each free fan's row: the fans it touches, and their coefficients.
    const cols = new Int32Array(free.length * ROW), vals = new Float64Array(free.length * ROW), size = new Uint8Array(free.length);
    const add = (i: number, j: number, v: number) => {
      const o = i * ROW;
      for (let k = 0; k < size[i]; k++) if (cols[o + k] === j) { vals[o + k] += v; return; }
      if (size[i] === ROW) throw new Error('Surface: a fan touches too many others');
      cols[o + size[i]] = j; vals[o + size[i]++] = v;
    };
    const term = (nodes: readonly number[], c: readonly number[], w: number) => {
      for (let a = 0; a < nodes.length; a++) {
        const i = slot[nodes[a]];
        if (i >= 0) for (let b = 0; b < nodes.length; b++) add(i, nodes[b], w * c[a] * c[b]);
      }
    };
    for (let i = 0; i < free.length; i++) add(i, free[i], PULL);
    for (let node = 0; node < this.count; node++) for (const axis of [0, 2]) {
      const after = this.next[node * 4 + axis], before = this.next[node * 4 + axis + 1];
      if (after >= 0 && before >= 0 && (slot[node] >= 0 || slot[after] >= 0 || slot[before] >= 0)) term([before, node, after], [1, -2, 1], 1);
    }
    for (let e = 0; e < this.of.length; e += 4) {
      const t = [this.of[e], this.of[e + 1], this.of[e + 2], this.of[e + 3]];
      if (t.some((node) => slot[node] >= 0)) term(t, [1, -1, 1, -1], 2);
    }
    // Packed tight, without each row's own fan (it counts for nothing on differences, below).
    const start = new Int32Array(free.length + 1), diag = new Float64Array(free.length);
    for (let i = 0; i < free.length; i++) start[i + 1] = start[i] + size[i] - 1;
    const col = new Int32Array(start[free.length]), val = new Float64Array(start[free.length]);
    for (let i = 0, at = 0; i < free.length; i++) for (let k = 0; k < size[i]; k++) {
      const j = cols[i * ROW + k], v = vals[i * ROW + k];
      if (j === free[i]) diag[i] = v; else { col[at] = j; val[at++] = v; }
    }
    const h = this.h, q = this.q, lo = new Float64Array(free.length), hi = new Float64Array(free.length), pull = new Float64Array(free.length);
    for (let i = 0; i < free.length; i++) { lo[i] = this.lo[free[i]]; hi[i] = this.hi[free[i]]; pull[i] = q[free[i]]; }
    for (let sweep = 0; sweep < sweeps; sweep++) {
      for (let i = 0; i < free.length; i++) {
        // The bending's rows each sum to nothing, so it is taken on differences: exactly nothing on flat ground.
        const node = free[i], here = h[node];
        let g = PULL * (here - pull[i]);
        for (let k = start[i]; k < start[i + 1]; k++) g += val[k] * (h[col[k]] - here);
        const next = here - OMEGA * g / diag[i];
        h[node] = next < lo[i] ? lo[i] : next > hi[i] ? hi[i] : next;
      }
    }
  }
}
