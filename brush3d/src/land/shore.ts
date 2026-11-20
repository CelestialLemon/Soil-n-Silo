// The water's shores drawn as curves over the tile rules (Soil-n-Silo#258, docs/LAND.md): where the river and the ponds
// meet the land. The rules' water is whole tiles, and a bed cut to each tile's square reads as a river of sawtooth bends
// and ponds like square puddles. Instead the beds follow a smoothed field of how far each point is inside the water: the
// distance to the water's tile outline (positive in the water, negative on the bank), blurred so the corners of the tiles
// round off, with a gentle wander added, as `Surface` rounds the tiles' corners into hills. Where the field says water
// the ground sinks into its bed, so the shore (where the bed rises through the game's water) is a curve: a bend's outer
// corner is cut, its inner corner filled, a pond an oval. The rules don't change: the water stays on its tiles.
//
// The water may reach a little into a dry tile beside it (the inner side of a bend, a cove), never further than the
// water's sheet runs flat past its last wet tile (WATER.md), and only where the bank can take it: a bank at the water's
// level, not worked ground (a building's pad), not beside a fall (where the game lays the bank's water under it, #228).
// Round pads (a water wheel's) and falls the shore keeps to the tiles' outline, so a building stands square to the water
// and a fall's edges stay where they were. Everything the field gives is continuous across tiles, so the land's mesh,
// drawn tile by tile, stays closed.
//
// Pure arithmetic on the tiles, so it runs in Node (tools/land.ts checks it). paint.ts carves the beds with it.

/** The shore's numbers: how far the field is blurred, how far the shore wanders, and how its bed is laid. */
interface Style {
  /**
   * How far (tiles, a Gaussian's sigma) the outline is smoothed along the shore (`along`: a staircase of tiles into its
   * slope), every way (`round`: what's left of the corners), and how widely the shore's way is read (`coarse`).
   */
  along: number; round: number; coarse: number;
  /** How far (tiles) a wide water's shore is grown back out, as the smoothing draws it in. */
  grow: number;
  /** How far (tiles) the shore wanders either way, and over how long (tiles a wave). */
  meander: number; wave: number;
  /** Where the bed starts down (field, tiles: negative is out on the bank), and over how far (tiles) it reaches its deepest. */
  start: number; bank: number;
}
/**
 * The shore as the developer picked it on Soil-n-Silo#283 ("organic": rounded, and wandering a little, over a calmer one
 * that didn't wander).
 */
const STYLE: Style = { along: 1.5, round: 0.4, coarse: 1.2, grow: 0.25, meander: 0.12, wave: 3.5, start: -0.12, bank: 0.75 };

/** Samples a tile side of the field. */
const RES = 4;
/** How far (tiles) the distance to the outline is reckoned, either way; past it, it's held there. */
const CAP = 2;
/** How far (tiles) into the water's core the field is always at least that far in (up to this). */
const FLOOR = 0.42;
/** How far out on the bank (tiles, negative) the field counts before it's rounded. */
const DRY = -0.8;
/** The least the field is anywhere in the water (up to how far into its core the point is), after all of it. */
const KEEP = 0.34;
/**
 * How far (tiles) round a point the water's width is read (the deepest any of it is inside its outline), and how deep
 * it can be there and still count as narrow (a river two tiles wide is a tile deep at its middle).
 */
const WIDE = 1.5, NARROW = 0.8;
/** How far (tiles) round a pad or a fall the shore keeps to the outline, and by how far it's free again. */
const HOLD_IN = 0.5, HOLD_OUT = 1.6;
/** How far (tiles) into a dry tile its bed may reach, easing out from NEAR to FAR: inside where the water's sheet runs flat
 * past its last wet tile (half a tile), and clear of what stands in a tile's middle (a tree, within 0.15 of it). */
const NEAR = 0.3, FAR = 0.45;
/** How far (tiles) in from ground the bed can't cut into (a pad, a cliff's foot) it starts down. */
const GATE = 0.5;

/** What a tile is to the shore: ground the bed doesn't cut into, the water's, or a bank it may reach into. */
const SOLID = 0, WATER = 1, BANK = 2;

/** The tiles the shore reads: the land's size, and per tile whether it's water, whether it's worked, its corners (levels). */
export interface ShoreTiles {
  width: number; height: number;
  water(t: number): boolean;
  worked(t: number): boolean;
  /** Each tile's four corners (levels: north-west, north-east, south-east, south-west), four a tile. */
  corner: ArrayLike<number>;
}

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The larger of two, its corner rounded over a tenth of a tile, so the field has no crease where one takes over. */
const smax = (a: number, b: number, k = 0.1) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * k / 4; };

/** A tile-sized square's distance from a point (tiles): 0 inside it. */
const boxDist = (x: number, y: number, px: number, py: number) => Math.hypot(Math.max(x - px, 0, px - (x + 1)), Math.max(y - py, 0, py - (y + 1)));

/** The shores' field over the land: built once, then updated round earthworks. */
export class ShoreField {
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: ShoreTiles;
  /** Each tile's water (1) or not, as `tiles` had it when last read. */
  private readonly wet: Uint8Array;
  /** Each tile's kind (SOLID, WATER, BANK). */
  private readonly kind: Uint8Array;
  /** Each tile held to the outline (a pad, a fall's water and what's round it). */
  private readonly held: Uint8Array;
  /** Each tile with a held tile within HOLD_OUT's reach of it. */
  private readonly heldNear: Uint8Array;
  /** The field (tiles inside the water, negative outside), RES² samples a tile, at the samples' middles. */
  private readonly field: Float32Array;
  /** The field before what's held keeps it to the outline, and the least it may be (-Infinity: no least), as `field`. */
  private readonly base: Float32Array;
  private readonly keep: Float32Array;
  private readonly nx: number;
  private readonly ny: number;

  constructor(tiles: ShoreTiles) {
    this.tiles = tiles;
    this.width = tiles.width; this.height = tiles.height;
    this.kind = new Uint8Array(this.width * this.height);
    this.wet = new Uint8Array(this.width * this.height);
    this.held = new Uint8Array(this.width * this.height);
    this.heldNear = new Uint8Array(this.width * this.height);
    this.nx = this.width * RES; this.ny = this.height * RES;
    this.field = new Float32Array(this.nx * this.ny);
    this.base = new Float32Array(this.nx * this.ny);
    this.keep = new Float32Array(this.nx * this.ny);
    this.update({ x0: 0, y0: 0, x1: this.width, y1: this.height });
  }

  /** How far the field and the kinds reach from a tile that changed (tiles). */
  static readonly REACH = Math.ceil(CAP + HOLD_OUT + 3 * (STYLE.along + STYLE.round + STYLE.coarse) + WIDE) + 1;

  /**
   * The tiles changed in [x0, x1) × [y0, y1) (read again from `tiles`): the kinds and the field worked out again as far as
   * they reach, and the tiles whose kind or field moved. If the water's tiles are as they were (an earthwork beside it:
   * the game never moves its water), only what's held changes the field, a few tiles round, so it's quick.
   */
  update(w: { x0: number; y0: number; x1: number; y1: number }): number[] {
    const W = this.width, H = this.height;
    let watered = false;
    for (let y = w.y0; y < w.y1; y++) for (let x = w.x0; x < w.x1; x++) {
      const t = y * W + x, wet = this.tiles.water(t) ? 1 : 0;
      if (wet !== this.wet[t]) { this.wet[t] = wet; watered = true; }
    }
    if (!this.built) watered = true;
    const R = watered ? ShoreField.REACH : Math.ceil(HOLD_OUT) + 1;
    const x0 = Math.max(0, w.x0 - R), y0 = Math.max(0, w.y0 - R), x1 = Math.min(W, w.x1 + R), y1 = Math.min(H, w.y1 + R);
    const changed = new Set<number>();
    // The kinds (and what's held) one tile further than they're needed, as they read a tile round.
    for (let y = Math.max(0, y0 - 1); y < Math.min(H, y1 + 1); y++) for (let x = Math.max(0, x0 - 1); x < Math.min(W, x1 + 1); x++) {
      const t = y * W + x, k = this.kindOf(x, y), h = this.heldOf(x, y);
      if (k !== this.kind[t] && x >= x0 && y >= y0 && x < x1 && y < y1) changed.add(t);
      this.kind[t] = k; this.held[t] = h;
    }
    const r = Math.ceil(HOLD_OUT);
    for (let y = Math.max(0, y0 - 1); y < Math.min(H, y1 + 1); y++) for (let x = Math.max(0, x0 - 1); x < Math.min(W, x1 + 1); x++) {
      let near = 0;
      for (let v = Math.max(0, y - r); v <= Math.min(H - 1, y + r) && !near; v++) for (let u = Math.max(0, x - r); u <= Math.min(W - 1, x + r); u++) if (this.held[v * W + u]) { near = 1; break; }
      this.heldNear[y * W + x] = near;
    }
    if (watered) this.smooth(x0, y0, x1, y1);
    this.built = true;
    // Kept to the outline round what's held, and however it's smoothed, a water tile keeps water round its middle.
    for (let j = y0 * RES; j < y1 * RES; j++) for (let i = x0 * RES; i < x1 * RES; i++) {
      const px = (i + 0.5) / RES, py = (j + 0.5) / RES, at = j * this.nx + i, own = this.outline(px, py);
      let v = this.base[at];
      v += (own - v) * (1 - smooth(HOLD_IN, HOLD_OUT, this.heldDist(px, py)));
      if (this.keep[at] > -Infinity) v = smax(v, this.keep[at]);
      if (Math.abs(v - this.field[at]) > 1e-5) changed.add(Math.floor(py) * W + Math.floor(px));
      this.field[at] = v;
    }
    return [...changed];
  }

  /** Whether the field's been worked out once (the first update works it all out). */
  private built = false;

  /**
   * The field before what's held, over [x0, x1) × [y0, y1) (tiles), from the outline's distance as far round as the
   * smoothing reaches: into `base`, and the least it may be in the water into `keep`.
   */
  private smooth(x0: number, y0: number, x1: number, y1: number) {
    const W = this.width;
    // How far each tile is from the water's edge, so the work far from it (where every stage gives what it was given) is
    // skipped: the field's the same, only sooner.
    const edge = this.edges();
    const st = STYLE, Kc = Math.ceil(3 * st.coarse * RES), Kt = Math.ceil(3 * st.along * RES), Ki = Math.ceil(3 * st.round * RES), Kg = Kc + Kt + Ki;
    const sx0 = x0 * RES, sy0 = y0 * RES, sx1 = x1 * RES, sy1 = y1 * RES;
    const gx0 = Math.max(0, sx0 - Kg), gy0 = Math.max(0, sy0 - Kg), gx1 = Math.min(this.nx, sx1 + Kg), gy1 = Math.min(this.ny, sy1 + Kg);
    const gw = gx1 - gx0, gh = gy1 - gy0, raw = new Float32Array(gw * gh);
    const calm = new Uint8Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const t = Math.floor((gy0 + j) / RES) * W + Math.floor((gx0 + i) / RES), o = j * gw + i;
      calm[o] = edge[t];
      raw[o] = edge[t] > CAP + 1 ? (this.wet[t] ? CAP : -CAP) : this.outline((gx0 + i + 0.5) / RES, (gy0 + j + 0.5) / RES);
    }
    // (A stage reading K samples round can be skipped where every one of them is past the outline's reach.)
    const still = (K: number) => CAP + 2 + Math.ceil(K / RES);
    // Which way the shore runs at each point, from the outline blurred widely: across its slope. (A staircase of tiles has
    // its run's slope here, not its treads': the mean of its sides' facings.)
    const coarse = blur(raw, gw, gh, st.coarse * RES, calm, still(Kc));
    // Smoothed along that way only, so a staircase of tiles turns into its slope and a bend into a curve, while across the
    // water (how wide it is) it's as it was. Where the way is unclear (in the middle of the water, far up the bank), less so.
    const along = raw.slice(), step = 1, n = Kt;
    const weights = Array.from({ length: 2 * n + 1 }, (_, k) => Math.exp(-0.5 * ((k - n) * step / (st.along * RES)) ** 2));
    const wsum = weights.reduce((a, b) => a + b, 0);
    for (let j = 1; j < gh - 1; j++) for (let i = 1; i < gw - 1; i++) {
      const o = j * gw + i;
      if (Math.abs(raw[o]) >= CAP) continue;
      const gxv = (coarse[o + 1] - coarse[o - 1]) / 2, gyv = (coarse[o + gw] - coarse[o - gw]) / 2, g = Math.hypot(gxv, gyv);
      const sure = smooth(0.02, 0.06, g);
      if (sure === 0) continue;
      const tx = -gyv / g, ty = gxv / g;
      let v = 0;
      for (let k = 0; k <= 2 * n; k++) v += weights[k] * sample(raw, gw, gh, i + (k - n) * step * tx, j + (k - n) * step * ty);
      along[o] = raw[o] + (v / wsum - raw[o]) * sure;
    }
    // Never shrunk past a floor in the water, so a small pond or a narrow tip of water (which the smoothing along its shore
    // would take away) keeps its water.
    // (And held to DRY outside before it's rounded: far up the bank counts no more than a little way, or the rounding would
    // drag a small pond's shore in after it.)
    // (Only where the water's narrow: in a wide pond, how far it reaches across lets its corners round off freely; but a
    // channel a tile wide (a tile of water in no square of four) is narrow however wide the water beside it, straight or
    // turning, and so is the pond's edge where it joins, so the channel isn't cut off from it.)
    const tx0 = Math.floor(gx0 / RES) - 2, ty0 = Math.floor(gy0 / RES) - 2, tw = Math.ceil(gx1 / RES) + 2 - tx0, th = Math.ceil(gy1 / RES) + 2 - ty0;
    const narrow = new Uint8Array(tw * th);
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) narrow[y * tw + x] = this.narrow(tx0 + x, ty0 + y) ? 1 : 0;
    const ease = (px: number, py: number) => {
      const x = Math.floor(px), y = Math.floor(py);
      let d = Infinity;
      for (let v = y - 2; v <= y + 2; v++) for (let u = x - 2; u <= x + 2; u++) {
        if (narrow[(v - ty0) * tw + u - tx0]) d = Math.min(d, boxDist(u, v, px, py));
      }
      return smooth(0.5, 1.25, d);
    };
    const wide = spread(raw, gw, gh, WIDE * RES, calm, still(WIDE * RES)), floor = (o: number, px: number, py: number, most: number) =>
      Math.min(this.core(px, py), most) - (wide[o] > NARROW ? (wide[o] - NARROW) * 2 * ease(px, py) : 0);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const o = j * gw + i;
      if (raw[o] >= CAP) continue;
      along[o] = raw[o] > 0 ? smax(along[o], floor(o, (gx0 + i + 0.5) / RES, (gy0 + j + 0.5) / RES, FLOOR)) : smax(along[o], DRY);
    }
    // Then rounded a little every way, for what's left of the corners.
    const round = blur(along, gw, gh, st.round * RES, calm, still(Ki));
    for (let j = sy0; j < sy1; j++) for (let i = sx0; i < sx1; i++) {
      const px = (i + 0.5) / RES, py = (j + 0.5) / RES, o = (j - gy0) * gw + i - gx0, own = raw[o], at = j * this.nx + i;
      // Grown back out where the water's wide, as the smoothing shrinks a pond (a round pond's shore runs round its tiles).
      let v = round[o] + st.grow * smooth(NARROW, 2, wide[o]);
      // Wandering near the shore.
      const near = 1 - smooth(1, 1.5, Math.abs(own));
      if (near > 0) v += st.meander * near * wander(px / st.wave, py / st.wave);
      this.base[at] = v;
      this.keep[at] = own > 0 && calm[o] <= still(Ki) ? floor(o, px, py, KEEP) : -Infinity;
    }
  }

  /** Whether a tile is water a tile wide: water, and in no square of four tiles of water (off the land counts as water). */
  private narrow(x: number, y: number): boolean {
    const W = this.width, H = this.height, wet = (u: number, v: number) => u < 0 || v < 0 || u >= W || v >= H || !!this.wet[v * W + u];
    if (x < 0 || y < 0 || x >= W || y >= H || !this.wet[y * W + x]) return false;
    for (let v = y - 1; v <= y; v++) for (let u = x - 1; u <= x; u++) if (wet(u, v) && wet(u + 1, v) && wet(u, v + 1) && wet(u + 1, v + 1)) return false;
    return true;
  }

  /** The field at a point (tiles): about how far inside the water's shore it is, negative out on the bank. */
  at(px: number, py: number): number {
    const fx = Math.min(this.nx - 1, Math.max(0, px * RES - 0.5)), fy = Math.min(this.ny - 1, Math.max(0, py * RES - 0.5));
    const i = Math.min(this.nx - 2, Math.floor(fx)), j = Math.min(this.ny - 2, Math.floor(fy)), u = fx - i, v = fy - j, f = this.field, n = this.nx;
    return (f[j * n + i] * (1 - u) + f[j * n + i + 1] * u) * (1 - v) + (f[(j + 1) * n + i] * (1 - u) + f[(j + 1) * n + i + 1] * u) * v;
  }

  /**
   * How deep (0 to 1 of the bed's deepest) the bed lies at a point (tiles) of the tile (tx, ty): nothing on solid ground,
   * the field's say elsewhere, eased out towards ground it can't cut into and, in a bank, by how far into it the point is.
   */
  depth(tx: number, ty: number, px: number, py: number): number {
    const W = this.width, k = this.kind[ty * W + tx];
    if (k === SOLID) return 0;
    const s = STYLE;
    let d = smooth(s.start, s.start + s.bank, this.at(px, py));
    if (d === 0) return 0;
    let solid = GATE, wet = Infinity;
    for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) {
      if (x < 0 || y < 0 || x >= W || y >= this.height) continue;
      const n = this.kind[y * W + x];
      if (n === SOLID) solid = Math.min(solid, boxDist(x, y, px, py));
      else if (n === WATER && k === BANK) wet = Math.min(wet, boxDist(x, y, px, py));
    }
    d *= smooth(0, GATE, solid);
    if (k === BANK) d *= 1 - smooth(NEAR, FAR, wet);
    return d;
  }

  /** Whether a tile is a bank the bed may reach into (its bed cut finely, as the water's beside a bank are). */
  isBank(x: number, y: number) { return this.kind[y * this.width + x] === BANK; }

  /**
   * Whether a water tile's bed rises steeply, so it's cut more finely still: beside ground the bed can't cut into (a pad,
   * a cliff's foot: it rises to it over GATE), or a lone tile or a river's end (round, in a tile's width).
   */
  isSteep(x: number, y: number) {
    if (this.kind[y * this.width + x] !== WATER) return false;
    let wet = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) continue;
      const k = this.kind[ny * this.width + nx];
      if (k === SOLID) return true;
      if (k === WATER && dx * dy === 0 && dx + dy !== 0) wet++;
    }
    return wet <= 1;
  }

  /** A tile's kind, from the tiles round it. */
  private kindOf(x: number, y: number): number {
    const { width: W, height: H, corner: c } = this.tiles, t = y * W + x;
    if (this.wet[t]) return WATER;
    if (this.tiles.worked(t)) return SOLID;
    // A bank: beside water, all of it at one level, and every corner it shares with the water at that level.
    let level = NaN;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy, u = ny * W + nx;
      if ((dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= W || ny >= H || !this.wet[u]) continue;
      const l = c[u * 4];
      if (!Number.isNaN(level) && l !== level) return SOLID;
      level = l;
      // The corners of this tile on the water tile's side (the shared corner, or the shared side's two).
      for (let k = 0; k < 4; k++) {
        const cx = (k === 1 || k === 2 ? 1 : 0), cy = (k >= 2 ? 1 : 0);
        if ((dx === 0 || cx === (dx > 0 ? 1 : 0)) && (dy === 0 || cy === (dy > 0 ? 1 : 0)) && c[t * 4 + k] !== l) return SOLID;
      }
    }
    return Number.isNaN(level) ? SOLID : BANK;
  }

  /** Whether a tile holds the shore to the outline round it: worked ground that isn't water (a pad), or water at a fall. */
  private heldOf(x: number, y: number): number {
    const { width: W, height: H, corner: c } = this.tiles, t = y * W + x;
    if (!this.wet[t]) return this.tiles.worked(t) ? 1 : 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy, u = ny * W + nx;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H && this.wet[u] && c[u * 4] !== c[t * 4]) return 1;
    }
    return 0;
  }

  /** How far (tiles) a point is from the nearest held tile, up to HOLD_OUT. */
  private heldDist(px: number, py: number): number {
    const fx = Math.floor(px), fy = Math.floor(py), r = Math.ceil(HOLD_OUT);
    let d = HOLD_OUT;
    if (!this.heldNear[fy * this.width + fx]) return d;
    for (let y = fy - r; y <= fy + r; y++) for (let x = fx - r; x <= fx + r; x++) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height || !this.held[y * this.width + x]) continue;
      d = Math.min(d, boxDist(x, y, px, py));
    }
    return d;
  }

  /**
   * How far (tiles) a point is inside the water's core: the water tiles' middles, joined to their water neighbours' (half a
   * tile round each middle and each join, so in the water, never past its outline). What the field never drops below, so a
   * lone tile of water, a narrow river and a staircase of tiles keep their water, and still round: a floor kept to the
   * outline itself would square a pond's corners off again.
   */
  private core(px: number, py: number): number {
    const W = this.width, H = this.height, fx = Math.floor(px), fy = Math.floor(py);
    let d = 2;
    for (let y = fy - 1; y <= fy + 1; y++) for (let x = fx - 1; x <= fx + 1; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H || !this.wet[y * W + x]) continue;
      const cx = x + 0.5, cy = y + 0.5, dy = py - cy;
      d = Math.min(d, Math.hypot(px - cx, dy));
      // The joins east and south (west and north are their neighbours').
      if (x + 1 < W && this.wet[y * W + x + 1]) d = Math.min(d, Math.hypot(Math.max(0, cx - px, px - cx - 1), dy));
      if (y + 1 < H && this.wet[(y + 1) * W + x]) d = Math.min(d, Math.hypot(px - cx, Math.max(0, cy - py, py - cy - 1)));
    }
    return 0.5 - d;
  }

  /** Each tile's distance (tiles, the most either way) to the nearest of the other wetness, up to 255. */
  private edges(): Uint8Array {
    const W = this.width, H = this.height, d = new Uint8Array(W * H).fill(255), wet = this.wet;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = y * W + x;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const u = (y + dy) * W + x + dx;
        if (x + dx >= 0 && y + dy >= 0 && x + dx < W && y + dy < H && wet[u] !== wet[t]) { d[t] = 1; break; }
      }
    }
    // Two passes, down then up, each tile one more than the least of the neighbours already passed.
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = y * W + x;
      if (x > 0) d[t] = Math.min(d[t], d[t - 1] + 1);
      if (y > 0) { d[t] = Math.min(d[t], d[t - W] + 1); if (x > 0) d[t] = Math.min(d[t], d[t - W - 1] + 1); if (x < W - 1) d[t] = Math.min(d[t], d[t - W + 1] + 1); }
    }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
      const t = y * W + x;
      if (x < W - 1) d[t] = Math.min(d[t], d[t + 1] + 1);
      if (y < H - 1) { d[t] = Math.min(d[t], d[t + W] + 1); if (x < W - 1) d[t] = Math.min(d[t], d[t + W + 1] + 1); if (x > 0) d[t] = Math.min(d[t], d[t + W - 1] + 1); }
    }
    return d;
  }

  /** The distance (tiles) from a point to the water's tile outline: positive in the water, negative outside, within CAP. */
  private outline(px: number, py: number): number {
    const W = this.width, H = this.height, fx = Math.min(W - 1, Math.max(0, Math.floor(px))), fy = Math.min(H - 1, Math.max(0, Math.floor(py)));
    const inside = this.wet[fy * W + fx], r = CAP + 1;
    let d = CAP;
    for (let y = fy - r; y <= fy + r; y++) for (let x = fx - r; x <= fx + r; x++) {
      // (Off the land, the land carries on as its edge: nothing there counts.)
      if (x < 0 || y < 0 || x >= W || y >= H || this.wet[y * W + x] === inside) continue;
      d = Math.min(d, boxDist(x, y, px, py));
    }
    return inside ? d : -d;
  }
}

/** A smooth wander, about -1 to 1: two octaves of value noise. */
function wander(x: number, y: number) { return 0.7 * value(x, y) + 0.3 * value(x * 2.3 + 17.1, y * 2.3 - 5.3); }
function value(x: number, y: number) {
  const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return 2 * ((a * (1 - su) + b * su) * (1 - sv) + (c * (1 - su) + d * su) * sv) - 1;
}
function hash(i: number, j: number) {
  let h = Math.imul(i, 0x27d4eb2d) ^ Math.imul(j, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * A grid (w × h) blurred by a Gaussian of `sigma` cells, along rows then columns, its edges carried on; the cells whose
 * `calm` is past `still` (all round them the same) kept as they are.
 */
function blur(src: Float32Array, w: number, h: number, sigma: number, calm: Uint8Array, still: number): Float32Array {
  const K = Math.ceil(3 * sigma), kernel = new Float32Array(2 * K + 1);
  for (let i = -K; i <= K; i++) kernel[i + K] = Math.exp(-0.5 * (i / sigma) ** 2);
  const sum = kernel.reduce((a, b) => a + b, 0);
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  const rows = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (calm[j * w + i] > still) { rows[j * w + i] = src[j * w + i]; continue; }
    let v = 0;
    for (let k = -K; k <= K; k++) v += kernel[k + K] * src[j * w + Math.min(w - 1, Math.max(0, i + k))];
    rows[j * w + i] = v;
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (calm[j * w + i] > still) { out[j * w + i] = rows[j * w + i]; continue; }
    let v = 0;
    for (let k = -K; k <= K; k++) v += kernel[k + K] * rows[Math.min(h - 1, Math.max(0, j + k)) * w + i];
    out[j * w + i] = v;
  }
  return out;
}

/** A grid (w × h) with each cell the most of those within `r` cells of it (a square), along rows then columns; the cells
 * whose `calm` is past `still` kept as they are. */
function spread(src: Float32Array, w: number, h: number, r: number, calm: Uint8Array, still: number): Float32Array {
  const rows = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (calm[j * w + i] > still) { rows[j * w + i] = src[j * w + i]; continue; }
    let v = -Infinity;
    for (let k = Math.max(0, i - r); k <= Math.min(w - 1, i + r); k++) v = Math.max(v, src[j * w + k]);
    rows[j * w + i] = v;
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (calm[j * w + i] > still) { out[j * w + i] = rows[j * w + i]; continue; }
    let v = -Infinity;
    for (let k = Math.max(0, j - r); k <= Math.min(h - 1, j + r); k++) v = Math.max(v, rows[k * w + i]);
    out[j * w + i] = v;
  }
  return out;
}

/** A grid (w × h) read between its cells at (x, y) (cells), its edges carried on. */
function sample(g: Float32Array, w: number, h: number, x: number, y: number): number {
  const fx = Math.min(w - 1, Math.max(0, x)), fy = Math.min(h - 1, Math.max(0, y));
  const i = Math.min(w - 2, Math.floor(fx)), j = Math.min(h - 2, Math.floor(fy)), u = fx - i, v = fy - j;
  return (g[j * w + i] * (1 - u) + g[j * w + i + 1] * u) * (1 - v) + (g[(j + 1) * w + i] * (1 - u) + g[(j + 1) * w + i + 1] * u) * v;
}
