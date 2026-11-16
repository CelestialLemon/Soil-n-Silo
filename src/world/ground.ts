import { BUILDINGS } from '../game/data.ts';
import { TERRAIN, type Land } from '../game/map.ts';
import { centreLevel, inRelief, spanOf, STEEP, type Relief } from '../game/relief.ts';
import { groundOf } from '../game/rules.ts';
import type { GameState } from '../game/state.ts';
import { Surface } from '../../brush3d/src/shared.ts';

// The lie of the land: the smooth reading of the rules' levels that brush3d's surface.ts fits (worked ground and water
// exactly at their levels), over the map and the country round it, refitted after earthworks. Everything the game stands
// on the ground (buildings, trucks, the tools' marks) stands on it as `Lie` has it, and the brush3d world paints the land
// from the same fit (brush/land.ts).

/** How high one level stands, in the game's world units (brush/scale.ts's RISE turns them into metres). */
export const LEVEL_HEIGHT = 0.25;
const H = LEVEL_HEIGHT;
/** How many tiles of country lie past each edge of the map (generate the land with this margin). */
export const COUNTRY = 56;
/**
 * How many tiles of country round the map are fitted again with it after earthworks, so the ground that moves never meets
 * ground fitted once (the country beyond, whose edge stays put).
 */
const HALO = 3;
/** How far (tiles) round the ground earthworks changed the ground is fitted again (further out it hardly moves). */
const SPREAD = 8;

/**
 * The lie of the whole land (the country and the map, with the map's earthworks): its smooth surface, and the height of the
 * ground at any point of the world. World x and z are the map's tiles (the map's north-west corner at 0); the land's tiles
 * start `margin` tiles further out.
 */
export class Lie {
  readonly relief: Relief & { corner: number[] };
  readonly margin: number;
  private readonly surface: Surface;
  private readonly s: GameState;
  private readonly land: Land;
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
  }

  /** Whether a land tile is on the map. */
  private onMap(lx: number, ly: number) {
    const x = lx - this.margin, y = ly - this.margin;
    return x >= 0 && y >= 0 && x < this.s.map.width && y < this.s.map.height;
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

  /** Follows earthworks and worked ground on the map: fits the ground round what changed since the last fit again. */
  update() {
    const m = this.s.map, M = this.margin;
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
    if (x0 === Infinity) return;
    this.surface.refit(M + Math.max(-HALO, x0 - SPREAD), M + Math.max(-HALO, y0 - SPREAD),
      M + Math.min(m.width + HALO, x1 + SPREAD), M + Math.min(m.height + HALO, y1 + SPREAD));
  }

  /** The ground's height (world units) at a point of the world. */
  y(x: number, z: number) { return this.surface.at(x + this.margin, z + this.margin) * H; }

  /** The ground's height (world units) at (u, v) across map tile (x, y), on its own patch (at a cliff, its own side's). */
  tileY(x: number, y: number, u: number, v: number) { return this.surface.on(x + this.margin, y + this.margin, u, v) * H; }
}

/**
 * The height (world units) a building `n` tiles a side stands at with its north-west tile at (x, y): the ground under a one-tile
 * building's centre, else the highest of its tiles' levels (worked ground, level, but for a field over a ramp).
 */
export function standY(lie: Lie, r: Relief, n: number, x: number, y: number) {
  if (n === 1) return lie.y(x + 0.5, y + 0.5);
  let top = 0;
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) if (inRelief(r, tx, ty)) top = Math.max(top, centreLevel(r, tx, ty));
  return top * LEVEL_HEIGHT;
}

/** Whether a tile of a relief is a steep bank (worn turf). */
export const isBank = (r: Relief, x: number, y: number) => spanOf(r, x, y) >= STEEP;

/** The relief of the land around a map, indexed from the land's north-west corner (map tile (0, 0) is land tile (margin, margin)). */
export const landRelief = (land: Land): Relief => ({ width: land.width, height: land.height, corner: land.corner });
