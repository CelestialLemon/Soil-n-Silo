// The land's grid: the continuous-terrain contract the game shares with brush3d's land.
//
// - A 160 × 160 grid of 1 m cells from (-80, -80) to (80, 80): the 120 m playable valley in [-60, 60]² and 20 m of hills
//   and woods around it.
// - Heights live on the cells' corners (vertices): a (nx + 1) × (nz + 1) Float32Array, vertex (ix, iz) at
//   (x0 + ix·cell, z0 + iz·cell), index iz·(nx + 1) + ix. `baseHeight` is the untouched valley; `height` is the live land
//   brush3d draws as is: it already holds the brook and pond beds, the buildings' settled pads and the dug rills' cuts.
// - Everything else lives on the cells (nx × nz, index iz·nx + ix): cover, soil, the worked-pad mask, the water surface
//   and its flow, the wet-bank moisture and which painted field a cell belongs to.
// - Between vertices the land is two flat triangles per cell, split along the u + v = 1 diagonal (`heightAt`), so the
//   rules and the picture read exactly the same height everywhere.

export const GRID_N = 160;
export const CELL_M = 1;
export const GRID_X0 = -80;
export const GRID_Z0 = -80;
/** Vertices along each side: GRID_N + 1. */
export const VERT_N = GRID_N + 1;

/** The playable valley: [-60, 60] on both axes. Beyond it, rising hills and woods. */
export const VALLEY_HALF = 60;
/** How far from the centre things, fields and tracks may reach (a margin inside the valley's edge). */
export const BUILD_HALF = 57;

/** What covers a cell. Natural covers (grass, bare, rock, woods, water) come from the valley; the rest from the player. */
export const COVER = { grass: 0, bare: 1, track: 2, rock: 3, woods: 4, water: 5, rill: 6, field: 7 } as const;
export type Cover = (typeof COVER)[keyof typeof COVER];

/** The soil under a cell. */
export const SOIL = { loam: 0, silt: 1, clay: 2, sand: 3, stony: 4 } as const;
export type Soil = (typeof SOIL)[keyof typeof SOIL];

/** A dry cell's water level. Read wetness with `isWet`. */
export const DRY = Number.NEGATIVE_INFINITY;
/** Whether a water level marks water (dry is -Infinity; anything at or below -100 counts as dry too). */
export const isWet = (level: number) => level > -100;

export interface Grid {
  readonly nx: number; readonly nz: number; readonly cell: number; readonly x0: number; readonly z0: number;
  /** The natural valley's vertex heights, never edited after generation. */
  readonly baseHeight: Float32Array;
  /** The live vertex heights brush3d draws: base + building pads + dug rills. */
  readonly height: Float32Array;
  /** Base + building pads, before the rills are cut: the rills' natural bank crest. */
  readonly landHeight: Float32Array;
  readonly baseCover: Uint8Array;
  readonly cover: Uint8Array;
  readonly soil: Uint8Array;
  /** 0..255: how much of the cell a building's settled pad works (255 under its core, easing out over its apron). */
  readonly worked: Uint8Array;
  /** The natural water surface (brook and pond), DRY where there's none. */
  readonly baseWaterLevel: Float32Array;
  readonly baseFlowX: Float32Array;
  readonly baseFlowZ: Float32Array;
  /** The live water surface: brook, pond and flowing rills. DRY where dry. */
  readonly waterLevel: Float32Array;
  /** The water's flow, m/s. */
  readonly flowX: Float32Array;
  readonly flowZ: Float32Array;
  /** 0..1: the wet-bank wash around natural water and flowing rills. */
  readonly moisture: Float32Array;
  /** 0 = no field, else the painted field's id. */
  readonly fieldOf: Uint16Array;
}

export function createGrid(): Grid {
  const verts = VERT_N * VERT_N, cells = GRID_N * GRID_N;
  const dry = () => new Float32Array(cells).fill(DRY);
  return {
    nx: GRID_N, nz: GRID_N, cell: CELL_M, x0: GRID_X0, z0: GRID_Z0,
    baseHeight: new Float32Array(verts), height: new Float32Array(verts), landHeight: new Float32Array(verts),
    baseCover: new Uint8Array(cells), cover: new Uint8Array(cells), soil: new Uint8Array(cells), worked: new Uint8Array(cells),
    baseWaterLevel: dry(), baseFlowX: new Float32Array(cells), baseFlowZ: new Float32Array(cells),
    waterLevel: dry(), flowX: new Float32Array(cells), flowZ: new Float32Array(cells),
    moisture: new Float32Array(cells), fieldOf: new Uint16Array(cells),
  };
}

export const vertexIndex = (g: Grid, ix: number, iz: number) => iz * (g.nx + 1) + ix;
export const cellIndex = (g: Grid, ix: number, iz: number) => iz * g.nx + ix;
/** A vertex's world position. */
export const vertexX = (g: Grid, ix: number) => g.x0 + ix * g.cell;
export const vertexZ = (g: Grid, iz: number) => g.z0 + iz * g.cell;
/** A cell's centre. */
export const cellX = (g: Grid, ix: number) => g.x0 + (ix + 0.5) * g.cell;
export const cellZ = (g: Grid, iz: number) => g.z0 + (iz + 0.5) * g.cell;
/** The cell a world point lies in, clamped to the grid. */
export const cellIx = (g: Grid, x: number) => clampInt(Math.floor((x - g.x0) / g.cell), 0, g.nx - 1);
export const cellIz = (g: Grid, z: number) => clampInt(Math.floor((z - g.z0) / g.cell), 0, g.nz - 1);
/** Whether a world point lies on the grid at all. */
export const onGrid = (g: Grid, x: number, z: number) =>
  x >= g.x0 && z >= g.z0 && x <= g.x0 + g.nx * g.cell && z <= g.z0 + g.nz * g.cell;

const clampInt = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Locates (x, z) in its cell: the cell and the local u, v in [0, 1]. Points off the grid clamp to its edge. */
function locate(g: Grid, x: number, z: number) {
  const fx = (x - g.x0) / g.cell, fz = (z - g.z0) / g.cell;
  const ix = clampInt(Math.floor(fx), 0, g.nx - 1), iz = clampInt(Math.floor(fz), 0, g.nz - 1);
  return { ix, iz, u: clamp01(fx - ix), v: clamp01(fz - iz) };
}

/**
 * The height of vertex array `h` at a world point, on the exact triangles brush3d draws: inside cell (ix, iz), with local
 * u, v in [0, 1], triangle A (0,0)-(0,1)-(1,0) where u + v <= 1, triangle B (1,0)-(0,1)-(1,1) otherwise.
 */
export function sampleHeight(g: Grid, h: Float32Array, x: number, z: number): number {
  const { ix, iz, u, v } = locate(g, x, z);
  const w = g.nx + 1, i = iz * w + ix;
  const h00 = h[i], h10 = h[i + 1], h01 = h[i + w], h11 = h[i + w + 1];
  if (u + v <= 1) return h00 + u * (h10 - h00) + v * (h01 - h00);
  return h11 + (1 - u) * (h01 - h11) + (1 - v) * (h10 - h11);
}

/** The live land's height at a world point. */
export const heightAt = (g: Grid, x: number, z: number) => sampleHeight(g, g.height, x, z);
/** The natural valley's height at a world point. */
export const baseHeightAt = (g: Grid, x: number, z: number) => sampleHeight(g, g.baseHeight, x, z);

/** The exact gradient (dh/dx, dh/dz) of vertex array `h` (the live land by default) at a world point: its triangle's slope. */
export function gradientAt(g: Grid, x: number, z: number, h: Float32Array = g.height): { dx: number; dz: number } {
  const { ix, iz, u, v } = locate(g, x, z);
  const w = g.nx + 1, i = iz * w + ix;
  const h00 = h[i], h10 = h[i + 1], h01 = h[i + w], h11 = h[i + w + 1];
  if (u + v <= 1) return { dx: (h10 - h00) / g.cell, dz: (h01 - h00) / g.cell };
  return { dx: (h11 - h01) / g.cell, dz: (h11 - h10) / g.cell };
}

/** The steepness (rise over run) of the land at a world point. */
export function slopeAt(g: Grid, x: number, z: number, h: Float32Array = g.height): number {
  const { dx, dz } = gradientAt(g, x, z, h);
  return Math.hypot(dx, dz);
}

/** A cell's height: the mean of its four corners. */
export function cellHeightAt(g: Grid, ix: number, iz: number, h: Float32Array = g.height): number {
  const w = g.nx + 1, i = iz * w + ix;
  return ((h[i]) + (h[i + 1]) + (h[i + w]) + (h[i + w + 1])) / 4;
}

// --- Rects: an inclusive range of cells, [x0..x1] × [z0..z1] in cell indices. -----------------------------------------

export interface Rect { x0: number; z0: number; x1: number; z1: number }

export const fullRect = (g: Grid): Rect => ({ x0: 0, z0: 0, x1: g.nx - 1, z1: g.nz - 1 });

/** The union of two rects; either may be missing. */
export function unionRect(a: Rect | undefined, b: Rect | undefined): Rect | undefined {
  if (!a) return b;
  if (!b) return a;
  return { x0: Math.min(a.x0, b.x0), z0: Math.min(a.z0, b.z0), x1: Math.max(a.x1, b.x1), z1: Math.max(a.z1, b.z1) };
}

/** A rect grown by `n` cells on every side (not clamped). */
export const expandRect = (r: Rect, n: number): Rect => ({ x0: r.x0 - n, z0: r.z0 - n, x1: r.x1 + n, z1: r.z1 + n });

/** A rect clamped to the grid, or undefined if it misses it. */
export function clampRect(g: Grid, r: Rect): Rect | undefined {
  const c = { x0: Math.max(0, r.x0), z0: Math.max(0, r.z0), x1: Math.min(g.nx - 1, r.x1), z1: Math.min(g.nz - 1, r.z1) };
  return c.x0 > c.x1 || c.z0 > c.z1 ? undefined : c;
}

export const rectsOverlap = (a: Rect, b: Rect) => a.x0 <= b.x1 && b.x0 <= a.x1 && a.z0 <= b.z1 && b.z0 <= a.z1;

/** The cells a world-space box [minX, maxX] × [minZ, maxZ] touches, clamped to the grid. */
export function rectOfWorld(g: Grid, minX: number, minZ: number, maxX: number, maxZ: number): Rect | undefined {
  return clampRect(g, {
    x0: Math.floor((minX - g.x0) / g.cell), z0: Math.floor((minZ - g.z0) / g.cell),
    x1: Math.floor((maxX - g.x0) / g.cell), z1: Math.floor((maxZ - g.z0) / g.cell),
  });
}

/** Grows `acc` to include cell (ix, iz). */
export function addCell(acc: Rect | undefined, ix: number, iz: number): Rect {
  if (!acc) return { x0: ix, z0: iz, x1: ix, z1: iz };
  if (ix < acc.x0) acc.x0 = ix;
  if (ix > acc.x1) acc.x1 = ix;
  if (iz < acc.z0) acc.z0 = iz;
  if (iz > acc.z1) acc.z1 = iz;
  return acc;
}
