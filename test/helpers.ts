// Hand-made lands for the rules' tests: a plane of any slope, with a straight brook (or a still pond) where a test wants
// one, so each rule is tested on ground whose numbers are known.
import {
  blankState, cellX, cellZ, COVER, type GameState, generateValley, naturalize, type Point2, vertexX, vertexZ,
} from '../src/game/index.ts';

export interface LandSpec {
  /** The natural ground's height. */
  height: (x: number, z: number) => number;
  /** Where water lies: its surface at a cell's centre, or undefined where dry. */
  water?: (x: number, z: number) => number | undefined;
  /** How the water flows at a cell (m/s); still water by default. */
  flow?: (x: number, z: number) => Point2;
  /** How deep the water's bed lies below its surface. */
  depth?: number;
}

/** A state on a hand-made land. Water cells' corners are carved `depth` below their surface. */
export function land(spec: LandSpec): GameState {
  const s = blankState(1, 'summer'), g = s.grid, W = g.nx + 1, depth = spec.depth ?? 0.6;
  for (let iz = 0; iz <= g.nz; iz++) for (let ix = 0; ix <= g.nx; ix++) g.baseHeight[iz * W + ix] = spec.height(vertexX(g, ix), vertexZ(g, iz));
  for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
    const x = cellX(g, ix), z = cellZ(g, iz), w = spec.water?.(x, z);
    if (w === undefined) continue;
    const i = iz * g.nx + ix;
    g.baseWaterLevel[i] = w;
    g.baseCover[i] = COVER.water;
    const f = spec.flow?.(x, z) ?? { x: 0, z: 0 };
    g.baseFlowX[i] = f.x; g.baseFlowZ[i] = f.z;
    for (const [vx, vz] of [[ix, iz], [ix + 1, iz], [ix, iz + 1], [ix + 1, iz + 1]]) {
      const k = vz * W + vx;
      g.baseHeight[k] = Math.min(g.baseHeight[k], w - depth);
    }
  }
  naturalize(s);
  return s;
}

/**
 * Ground falling `fall` m per metre toward +x, with a brook running north–south along x = `brookX` (|x - brookX| <= 1.5),
 * its surface `freeboard` below the bank, flowing south.
 */
export function brookLand(fall = 0.03, brookX = -2, freeboard = 0.2): GameState {
  const h = (x: number) => -fall * x;
  return land({
    height: (x) => h(x),
    water: (x) => (Math.abs(x - brookX) <= 1.5 ? h(brookX) - freeboard : undefined),
    flow: () => ({ x: 0, z: 0.8 }),
  });
}

/** Flat ground at height 0 with an east–west brook along z = 0 (|z| <= 1.5) flowing east, and a still pond round (30, 30). */
export function flatLand(): GameState {
  return land({
    height: () => 0,
    water: (x, z) => (Math.abs(z) <= 1.5 || Math.hypot(x - 30, z - 30) <= 10 ? -0.2 : undefined),
    flow: (x, z) => (Math.abs(z) <= 1.5 ? { x: 0.8, z: 0 } : { x: 0, z: 0 }),
    depth: 0.7,
  });
}

/** The valley most tests share (grown once). */
let shared: GameState | undefined;
export function valley(): GameState {
  shared ??= generateValley(7, 'summer');
  return shared;
}

/** A fresh copy of a valley, for tests that change it. */
export const freshValley = (seed = 7) => generateValley(seed, 'summer');

/** Whether two typed arrays hold exactly the same values. */
export function same(a: ArrayLike<number>, b: ArrayLike<number>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
  return true;
}
