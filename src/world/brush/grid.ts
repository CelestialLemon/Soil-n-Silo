import type { Land } from '../../game/map.ts';
import { TILE } from './scale.ts';

// The grid the game's water and ground maps are sent on (#207): a cell a tile, over the whole land (the map and the country
// round it), its corner at the land's north-west corner, x fastest; so land tile (lx, ly) is cell ly * width + lx, and map
// tile (x, y) is land tile (x + margin, y + margin). brush3d's `setWater` and `setGround` take this shape.

export class LandGrid {
  readonly shape: { nx: number; nz: number; cell: number; x0: number; z0: number };
  readonly width: number;
  readonly height: number;
  readonly margin: number;

  constructor(land: Land) {
    this.width = land.width; this.height = land.height; this.margin = land.margin;
    this.shape = { nx: land.width, nz: land.height, cell: TILE, x0: -land.margin * TILE, z0: -land.margin * TILE };
  }

  /** The cell of map tile (x, y). */
  ofMap(x: number, y: number) { return (y + this.margin) * this.width + x + this.margin; }
}

/** Sends a map no more often than this (real seconds): each one is laid out again and starts a fresh ease (brush3d/docs/WATER.md, GROUND.md). */
export const SEND_GAP = 0.4;

/**
 * When to send a map: when what it's made from has changed (`key`), but not sooner than SEND_GAP after the last; the
 * first at once, with no ease (a level loading).
 */
export class Sender {
  private sent = '';
  private at = -Infinity;

  /** Whether to send now for `key`; the ease to send it with (0: at once) is `first`. */
  due(key: string) {
    if (key === this.sent) return false;
    const now = performance.now() / 1000;
    if (this.sent !== '' && now - this.at < SEND_GAP) return false;
    this.first = this.sent === '';
    this.sent = key; this.at = now;
    return true;
  }

  /** Whether the send `due` just allowed is the first. */
  first = true;
}

/**
 * A map of the grid softened over the tiles round each (weights 1 2 1 along each side), so a value laid tile by tile (the
 * frost on the rules' frost hollows) fades over a tile or so at its edge instead of stepping along the tiles' sides.
 */
export function soften(v: Float32Array, width: number, height: number): Float32Array {
  const along = new Float32Array(v.length), out = new Float32Array(v.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x;
    along[i] = (v[i] * 2 + v[x > 0 ? i - 1 : i] + v[x + 1 < width ? i + 1 : i]) / 4;
  }
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x;
    out[i] = (along[i] * 2 + along[y > 0 ? i - width : i] + along[y + 1 < height ? i + width : i]) / 4;
  }
  return out;
}
