// The land the game hands the renderer (Soil-n-Silo#202, docs/LAND.md): its tiles' corners, what covers each and what
// ground it is, which part is the map the player builds on, and the country past it. Plain data and its checks, with no
// drawing, so the game's tests load it in Node (shared.ts); land/paint.ts paints it.

/**
 * What covers a tile: the paint the land takes there. `rill` is the continuous terrain's alone (setTerrain): a narrow
 * runnel's bed, painted as a brook's (its damp banks, its pebbles) at a cell's width.
 */
export const LAND_COVER = { grass: 0, bare: 1, track: 2, rock: 3, woods: 4, water: 5, rill: 6 } as const;
export type LandCover = typeof LAND_COVER[keyof typeof LAND_COVER];

/** What ground a tile is, as the game's map has it: it tints the paint, subtly (loam, the usual, not at all). */
export const LAND_GROUND = { loam: 0, silt: 1, clay: 2, sand: 3, stony: 4 } as const;
export type LandGround = typeof LAND_GROUND[keyof typeof LAND_GROUND];

/** A rectangle of the land's tiles: its north-west tile and its size, in tiles. */
export interface LandRect { x: number; y: number; width: number; height: number }

/**
 * The country past the land's tiles, so the camera never sees the end of the world: a coarse grid of heights (metres), a
 * corner at (x0, z0), nx by nz points `cell` metres apart, x fastest. Drawn where the land's tiles aren't, as distant
 * woods' floor; its points under the land are not read. Where it meets the land the land's own edge carries on.
 */
export interface Beyond { nx: number; nz: number; cell: number; x0: number; z0: number; height: Float32Array }

/** The land, as the game sends it once a level (setLand). */
export interface LandMap {
  /** The land in tiles: the map and the country round it the game draws in tiles too. */
  width: number; height: number;
  /** How wide a tile is (metres), and how high one of the rules' levels stands (metres). */
  tile: number; level: number;
  /** Where the land's north-west corner is (metres). */
  x0: number; z0: number;
  /**
   * Each tile's own four corners (metres; north-west, north-east, south-east, south-west), tile by tile along a row, rows in
   * order: 4 × width × height values, each a whole number of levels. Where two neighbours' corners along their side meet,
   * the land runs on smoothly; where they don't, the side is a cliff face from one to the other.
   */
  corners: Float32Array;
  /** The tiles drawn exactly at their corners' level (1; else 0): worked ground, a building's pad, the water's tiles. */
  worked: Uint8Array;
  /** What covers each tile (LAND_COVER), and what ground it is (LAND_GROUND). */
  cover: Uint8Array; ground: Uint8Array;
  /** The map: the part the player builds on. The country round it is drawn a little duller, so the edge reads. */
  map: LandRect;
  /** The country past the tiles (none: the land's edge is the world's). */
  beyond?: Beyond | null;
}

/** New values for a rectangle's tiles (updateLand): each array as LandMap's, over the rectangle alone; any left out stay. */
export interface LandPatch { corners?: Float32Array; worked?: Uint8Array; cover?: Uint8Array; ground?: Uint8Array }

/** Throws if a land's arrays don't fit its size, or its corners aren't whole levels (a programmer's bug, not the player's). */
export function checkLand(m: LandMap) {
  const n = m.width * m.height;
  if (!(m.width > 0 && m.height > 0 && m.tile > 0 && m.level > 0)) throw new Error(`setLand: a land ${m.width} x ${m.height}, tile ${m.tile}, level ${m.level}`);
  checkArrays('setLand', n, m);
  const r = m.map;
  if (r.x < 0 || r.y < 0 || r.width < 0 || r.height < 0 || r.x + r.width > m.width || r.y + r.height > m.height) throw new Error('setLand: the map is not inside the land');
  const b = m.beyond;
  if (b && (b.nx < 2 || b.nz < 2 || b.cell <= 0 || b.height.length !== b.nx * b.nz)) throw new Error(`setLand: beyond's grid ${b.nx} x ${b.nz} has ${b.height.length} heights`);
}

/** Throws if a patch's arrays don't fit its rectangle, or the rectangle the land. */
export function checkPatch(m: Pick<LandMap, 'width' | 'height' | 'level'>, r: LandRect, p: LandPatch) {
  if (r.x < 0 || r.y < 0 || r.width <= 0 || r.height <= 0 || r.x + r.width > m.width || r.y + r.height > m.height) throw new Error('updateLand: the rectangle is not inside the land');
  checkArrays('updateLand', r.width * r.height, { ...p, level: m.level });
}

function checkArrays(call: string, n: number, a: LandPatch & { level: number }) {
  const sizes: [string, { length: number } | undefined, number][] = [['corners', a.corners, 4 * n], ['worked', a.worked, n], ['cover', a.cover, n], ['ground', a.ground, n]];
  for (const [name, arr, want] of sizes) if (arr && arr.length !== want) throw new Error(`${call}: ${name} has ${arr.length} values for ${want}`);
  if (a.corners) for (const c of a.corners) {
    const l = c / a.level;
    if (Math.abs(l - Math.round(l)) > 1e-4) throw new Error(`${call}: a corner at ${c} m is not a whole number of ${a.level} m levels`);
  }
}
