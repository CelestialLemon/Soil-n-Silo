import { mulberry32, noise2 } from '../../game/rng.ts';
import type { RocksLook } from '../../ui/rocksChoice.ts';
import { hash } from '../trees.ts';
import { TILE } from './scale.ts';

// Pure outcrop layout planner (#257): decides where boulders, crags, shoulders, shared-edge bridges, 2×2 quad keystones,
// and tapered talus sit for each rock tile. Plain TypeScript with no three.js or Vite imports so Node tests can verify
// cluster bridging, lone-tile containment (#206 picking), and cross-block cache-key invalidation (#204).

/** Bitmask of the 8 tiles around (x, y) that are also rock: cardinal N, E, S, W then diagonal NE, SE, SW, NW. */
export const ROCK_BIT = { N: 1, E: 2, S: 4, W: 8, NE: 16, SE: 32, SW: 64, NW: 128 } as const;

/** Computes the 8-bit rock neighbour mask around tile (x, y). */
export function rockMask(isRock: (x: number, y: number) => boolean, x: number, y: number): number {
  let m = 0;
  if (isRock(x, y - 1)) m |= ROCK_BIT.N;
  if (isRock(x + 1, y)) m |= ROCK_BIT.E;
  if (isRock(x, y + 1)) m |= ROCK_BIT.S;
  if (isRock(x - 1, y)) m |= ROCK_BIT.W;
  if (isRock(x + 1, y - 1)) m |= ROCK_BIT.NE;
  if (isRock(x + 1, y + 1)) m |= ROCK_BIT.SE;
  if (isRock(x - 1, y + 1)) m |= ROCK_BIT.SW;
  if (isRock(x - 1, y - 1)) m |= ROCK_BIT.NW;
  return m;
}

/** Deterministic priority per tile, used to pick hero crag peaks within contiguous rock clusters. */
const tilePrio = (x: number, y: number) => hash(x * 3.1 + 17, y * 2.7 - 11);

/**
 * Cache key for one rock tile in a block: changes whenever its neighbour mask or the ground height under its stones or
 * shared-edge bridges changes, so clearing a rock or levelling a neighbour across a block border updates both blocks.
 */
export function rockTileKey(
  x: number, y: number, mask: number, heightAt: (tx: number, ty: number) => number,
): string {
  const h = (tx: number, ty: number) => heightAt(tx, ty).toFixed(3);
  let k = `${x},${y},${mask},${h(x + 0.5, y + 0.5)}`;
  if (mask & ROCK_BIT.E) k += `,${h(x + 1, y + 0.5)}`;
  if (mask & ROCK_BIT.S) k += `,${h(x + 0.5, y + 1)}`;
  if ((mask & (ROCK_BIT.E | ROCK_BIT.S | ROCK_BIT.SE)) === (ROCK_BIT.E | ROCK_BIT.S | ROCK_BIT.SE)) k += `,${h(x + 1, y + 1)}`;
  return k;
}

/** One sculpted rock piece planned for an outcrop tile (metres, radians). */
export interface PlannedRock {
  x: number; z: number;
  rx: number; ry: number; rz: number;
  yaw: number; pitch: number; roll: number;
  sink: number; crag: number; moss: number;
  detail: 1 | 2;
  /** Low-frequency geological tone coordinate in [0, 1] (0 cool slate .. 0.5 mid granite .. 1 warm sandstone). */
  tone: number;
  /** Seed for this rock's cleavage planes and surface roughness. */
  seed: number;
}

interface OutcropStyle {
  heightScale: number;
  crag: number;
  moss: number;
  tilt: number;
  extraTalus: boolean;
}

const STYLES: Record<Exclude<RocksLook, 'off'>, OutcropStyle> = {
  soft: { heightScale: 1, crag: 0.52, moss: 0.62, tilt: 0.18, extraTalus: false },
  bold: { heightScale: 1.42, crag: 0.8, moss: 0.4, tilt: 0.28, extraTalus: true },
};

/** Low-frequency geological bedrock tone in [0, 1] at world (wx, wz), shared across an outcrop. */
function bedrockTone(wx: number, wz: number): number {
  return noise2(wx * 0.022 + 5.1, wz * 0.022 - 3.7, 257);
}

/** Clamps a stone offset (dx, dz) from tile centre so it never spills onto adjacent non-rock tiles. */
export function clampToRock(dx: number, dz: number, reach: number, mask: number): [number, number] {
  const half = TILE * 0.5;
  const maxX = mask & ROCK_BIT.E ? half : Math.max(0.15, half - reach - 0.12);
  const minX = mask & ROCK_BIT.W ? -half : -Math.max(0.15, half - reach - 0.12);
  const maxZ = mask & ROCK_BIT.S ? half : Math.max(0.15, half - reach - 0.12);
  const minZ = mask & ROCK_BIT.N ? -half : -Math.max(0.15, half - reach - 0.12);
  return [Math.max(minX, Math.min(maxX, dx)), Math.max(minZ, Math.min(maxZ, dz))];
}

/**
 * Plans the multi-scale rock pieces belonging to rock tile (x, y) for `soft` or `bold`.
 * Adjacent rock tiles fuse across shared cardinal edges (E, S) and 2×2 quad corners (E & S & SE).
 */
export function planOutcropTile(
  x: number, y: number, isRock: (tx: number, ty: number) => boolean, look: Exclude<RocksLook, 'off'>,
): PlannedRock[] {
  const out: PlannedRock[] = [];
  const cx = (x + 0.5) * TILE, cz = (y + 0.5) * TILE;
  const st = STYLES[look];
  const mask = rockMask(isRock, x, y);
  const N = (mask & ROCK_BIT.N) !== 0, E = (mask & ROCK_BIT.E) !== 0, S = (mask & ROCK_BIT.S) !== 0, W = (mask & ROCK_BIT.W) !== 0;
  const NE = (mask & ROCK_BIT.NE) !== 0, SE = (mask & ROCK_BIT.SE) !== 0, SW = (mask & ROCK_BIT.SW) !== 0, NW = (mask & ROCK_BIT.NW) !== 0;
  const card = (N ? 1 : 0) + (E ? 1 : 0) + (S ? 1 : 0) + (W ? 1 : 0);

  const rand = mulberry32((Math.floor(hash(x + 5, y - 5) * 1e9) ^ 0x4b1d) >>> 0);
  const tone = bedrockTone(cx, cz);

  // Direction pulling inward toward the cluster interior (away from open grass sides).
  const pullX = (E ? 1 : 0) - (W ? 1 : 0) + 0.5 * ((NE ? 1 : 0) + (SE ? 1 : 0) - (NW ? 1 : 0) - (SW ? 1 : 0));
  const pullZ = (S ? 1 : 0) - (N ? 1 : 0) + 0.5 * ((SE ? 1 : 0) + (SW ? 1 : 0) - (NE ? 1 : 0) - (NW ? 1 : 0));
  const pullLen = Math.hypot(pullX, pullZ);
  const inX = pullLen > 1e-3 ? pullX / pullLen : 0, inZ = pullLen > 1e-3 ? pullZ / pullLen : 0;

  // Dominant grain/ridge direction along rock continuity, with organic wobble.
  const alongX = (E ? 1 : 0) + (W ? 1 : 0), alongZ = (N ? 1 : 0) + (S ? 1 : 0);
  const alongD1 = (NE ? 1 : 0) + (SW ? 1 : 0), alongD2 = (NW ? 1 : 0) + (SE ? 1 : 0);
  const best = Math.max(alongX, alongZ, alongD1, alongD2);
  let ridgeYaw = rand() * Math.PI;
  if (best > 0) {
    if (alongX === best && alongZ < best) ridgeYaw = 0;
    else if (alongZ === best && alongX < best) ridgeYaw = Math.PI / 2;
    else if (alongD2 === best && alongD1 < best) ridgeYaw = Math.PI / 4;
    else if (alongD1 === best && alongD2 < best) ridgeYaw = -Math.PI / 4;
    ridgeYaw += (rand() - 0.5) * 0.7;
  }

  const tilt = () => (rand() - 0.5) * 2 * st.tilt;
  const nextSeed = (r: () => number) => Math.floor(r() * 1e9) >>> 0;

  if (card === 0) {
    // Lone rock tile: a compact 2–3 stone mini-outcrop staying cleanly within its tile.
    const rx = 1.2 + rand() * 0.35, rz = 0.88 + rand() * 0.3, ry = (0.76 + rand() * 0.34) * st.heightScale;
    const [dx, dz] = clampToRock((rand() - 0.5) * 0.7, (rand() - 0.5) * 0.7, Math.max(rx, rz) * 0.85, mask);
    const yaw = rand() * Math.PI;
    out.push({ x: cx + dx, z: cz + dz, rx, ry, rz, yaw, pitch: tilt(), roll: tilt(), sink: 0.34, crag: st.crag, moss: st.moss, detail: 2, tone, seed: nextSeed(rand) });

    // Companion boulder nestled against one flank.
    const ca = yaw + 1.1 + rand() * 1.2, cr = 0.85 + rand() * 0.35;
    const crx = 0.62 + rand() * 0.28, crz = 0.5 + rand() * 0.22, cry = (0.42 + rand() * 0.24) * st.heightScale;
    const [cdx, cdz] = clampToRock(dx + Math.cos(ca) * cr, dz + Math.sin(ca) * cr, crx * 0.85, mask);
    out.push({
      x: cx + cdx, z: cz + cdz, rx: crx, ry: cry, rz: crz, yaw: ca + rand() * 0.8, pitch: tilt() * 0.7, roll: tilt() * 0.7,
      sink: 0.38, crag: st.crag * 0.85, moss: Math.min(0.85, st.moss + 0.12), detail: 1, tone, seed: nextSeed(rand),
    });

    if (st.extraTalus || rand() < 0.65) {
      const ta = ca + 2.3 + rand() * 1.4, tr = 0.95 + rand() * 0.4;
      const trx = 0.38 + rand() * 0.2, trz = 0.3 + rand() * 0.16, try_ = 0.22 + rand() * 0.14;
      const [tdx, tdz] = clampToRock(dx + Math.cos(ta) * tr, dz + Math.sin(ta) * tr, trx, mask);
      out.push({
        x: cx + tdx, z: cz + tdz, rx: trx, ry: try_, rz: trz, yaw: rand() * Math.PI, pitch: 0, roll: 0,
        sink: 0.44, crag: st.crag * 0.7, moss: st.moss, detail: 1, tone, seed: nextSeed(rand),
      });
    }
  } else if (card <= 2) {
    // Edge, peninsula, or ridge band: elongated boulder pulled inward toward rock neighbours, tapered talus toward grass.
    const rx = 1.35 + rand() * 0.45, rz = 0.95 + rand() * 0.35, ry = (0.86 + rand() * 0.44) * st.heightScale;
    const shift = 0.45 + rand() * 0.45;
    const [dx, dz] = clampToRock(inX * shift + (rand() - 0.5) * 1.0, inZ * shift + (rand() - 0.5) * 1.0, Math.max(rx, rz) * 0.78, mask);
    out.push({
      x: cx + dx, z: cz + dz, rx, ry, rz, yaw: ridgeYaw, pitch: tilt() * 0.8, roll: tilt() * 0.8,
      sink: 0.33, crag: st.crag + 0.05, moss: st.moss, detail: 2, tone, seed: nextSeed(rand),
    });

    const ox = pullLen > 1e-3 ? -inX : Math.cos(ridgeYaw + Math.PI / 2);
    const oz = pullLen > 1e-3 ? -inZ : Math.sin(ridgeYaw + Math.PI / 2);
    const sr = 0.75 + rand() * 0.4;
    const srx = 0.72 + rand() * 0.34, srz = 0.54 + rand() * 0.26, sry = (0.38 + rand() * 0.24) * st.heightScale;
    const [sdx, sdz] = clampToRock(ox * sr + (rand() - 0.5) * 0.9, oz * sr + (rand() - 0.5) * 0.9, srx * 0.85, mask);
    out.push({
      x: cx + sdx, z: cz + sdz, rx: srx, ry: sry, rz: srz, yaw: ridgeYaw + (rand() - 0.5) * 1.1, pitch: tilt() * 0.6, roll: tilt() * 0.6,
      sink: 0.42, crag: st.crag * 0.85, moss: Math.min(0.85, st.moss + 0.1), detail: 1, tone, seed: nextSeed(rand),
    });

    if (st.extraTalus || rand() < 0.45) {
      const ta = Math.atan2(oz, ox) + (rand() - 0.5) * 1.8, tr = 1.0 + rand() * 0.45;
      const trx = 0.42 + rand() * 0.2, trz = 0.32 + rand() * 0.16, try_ = (0.24 + rand() * 0.14) * st.heightScale;
      const [tdx, tdz] = clampToRock(Math.cos(ta) * tr, Math.sin(ta) * tr, trx, mask);
      out.push({
        x: cx + tdx, z: cz + tdz, rx: trx, ry: try_, rz: trz, yaw: rand() * Math.PI, pitch: 0, roll: 0,
        sink: 0.45, crag: st.crag * 0.75, moss: st.moss * 0.9, detail: 1, tone, seed: nextSeed(rand),
      });
    }
  } else {
    // Deep interior cluster (3 or 4 cardinal rock neighbours): vary between tall hero crags and broad linking shelves.
    const p = tilePrio(x, y);
    let beats = 0;
    if (N && p > tilePrio(x, y - 1)) beats++;
    if (E && p > tilePrio(x + 1, y)) beats++;
    if (S && p > tilePrio(x, y + 1)) beats++;
    if (W && p > tilePrio(x - 1, y)) beats++;
    const hero = beats >= 2 || p > 0.6;

    if (hero) {
      const rx = 1.65 + rand() * 0.55, rz = 1.25 + rand() * 0.45, ry = (1.2 + rand() * 0.55) * st.heightScale;
      const [dx, dz] = clampToRock((rand() - 0.5) * 2.1, (rand() - 0.5) * 2.1, Math.max(rx, rz) * 0.7, mask);
      out.push({
        x: cx + dx, z: cz + dz, rx, ry, rz, yaw: ridgeYaw, pitch: tilt(), roll: tilt(), sink: 0.32,
        crag: Math.min(0.95, st.crag + 0.12), moss: st.moss * 0.82, detail: 2, tone, seed: nextSeed(rand),
      });

      const sa = ridgeYaw + (rand() < 0.5 ? 1 : -1) * (1.2 + rand() * 0.9), sr = 1.15 + rand() * 0.45;
      const srx = 1.1 + rand() * 0.35, srz = 0.85 + rand() * 0.3, sry = (0.62 + rand() * 0.32) * st.heightScale;
      const [sdx, sdz] = clampToRock(dx + Math.cos(sa) * sr, dz + Math.sin(sa) * sr, srx * 0.75, mask);
      out.push({
        x: cx + sdx, z: cz + sdz, rx: srx, ry: sry, rz: srz, yaw: ridgeYaw + (rand() - 0.5) * 0.8, pitch: tilt() * 0.7, roll: tilt() * 0.7,
        sink: 0.38, crag: st.crag, moss: st.moss, detail: 1, tone, seed: nextSeed(rand),
      });
    } else {
      const rx = 1.55 + rand() * 0.5, rz = 1.25 + rand() * 0.4, ry = (0.55 + rand() * 0.32) * st.heightScale;
      const [dx, dz] = clampToRock((rand() - 0.5) * 2.0, (rand() - 0.5) * 2.0, Math.max(rx, rz) * 0.7, mask);
      out.push({
        x: cx + dx, z: cz + dz, rx, ry, rz, yaw: ridgeYaw, pitch: tilt() * 0.5, roll: tilt() * 0.5, sink: 0.42,
        crag: st.crag * 0.85, moss: Math.min(0.85, st.moss + 0.1), detail: 1, tone, seed: nextSeed(rand),
      });

      const ba = rand() * Math.PI * 2, br = 0.95 + rand() * 0.45;
      const brx = 0.95 + rand() * 0.35, brz = 0.75 + rand() * 0.28, bry = (0.64 + rand() * 0.36) * st.heightScale;
      const [bdx, bdz] = clampToRock(-dx * 0.4 + Math.cos(ba) * br, -dz * 0.4 + Math.sin(ba) * br, brx * 0.75, mask);
      out.push({
        x: cx + bdx, z: cz + bdz, rx: brx, ry: bry, rz: brz, yaw: ridgeYaw + (rand() - 0.5) * 0.9, pitch: tilt() * 0.8, roll: tilt() * 0.8,
        sink: 0.36, crag: st.crag, moss: st.moss, detail: 1, tone, seed: nextSeed(rand),
      });
    }
  }

  // ---- Grid-breaking shared-edge bridges and 2×2 quad keystones (owned canonically by the NW tile) ----

  if (E && S && SE && hash(x + 41, y - 23) < 0.65) {
    const qrand = mulberry32((Math.floor(hash(x + 97, y - 43) * 1e9) ^ 0x2f71) >>> 0);
    const qx = (x + 1) * TILE + (qrand() - 0.5) * 1.4;
    const qz = (y + 1) * TILE + (qrand() - 0.5) * 1.4;
    const qrx = 1.7 + qrand() * 0.6, qrz = 1.3 + qrand() * 0.45, qry = (1.1 + qrand() * 0.65) * st.heightScale;
    out.push({
      x: qx, z: qz, rx: qrx, ry: qry, rz: qrz, yaw: qrand() * Math.PI,
      pitch: (qrand() - 0.5) * 2 * st.tilt, roll: (qrand() - 0.5) * 2 * st.tilt,
      sink: 0.33, crag: Math.min(0.95, st.crag + 0.1), moss: st.moss * 0.88, detail: 2, tone: bedrockTone(qx, qz), seed: nextSeed(qrand),
    });
  }

  if (E && hash(x + 71, y + 13) < 0.62) {
    const erand = mulberry32((Math.floor(hash(x + 71, y + 13) * 1e9) ^ 0x1a33) >>> 0);
    const erx = 1.25 + erand() * 0.45, erz = 0.85 + erand() * 0.32, ery = (0.56 + erand() * 0.36) * st.heightScale;
    const maxDz = N && NE && S && SE ? 1.2 : 0.65;
    const ex = (x + 1) * TILE + (erand() - 0.5) * 0.6;
    const ez = cz + (erand() - 0.5) * 2 * maxDz;
    out.push({
      x: ex, z: ez, rx: erx, ry: ery, rz: erz, yaw: (erand() - 0.5) * 0.6,
      pitch: (erand() - 0.5) * st.tilt, roll: (erand() - 0.5) * st.tilt,
      sink: 0.38, crag: st.crag * 0.92, moss: st.moss, detail: 1, tone: bedrockTone(ex, ez), seed: nextSeed(erand),
    });
  }

  if (S && hash(x - 19, y + 83) < 0.62) {
    const srand = mulberry32((Math.floor(hash(x - 19, y + 83) * 1e9) ^ 0x3c59) >>> 0);
    const srx = 1.25 + srand() * 0.45, srz = 0.85 + srand() * 0.32, sry = (0.56 + srand() * 0.36) * st.heightScale;
    const maxDx = E && SE && W && SW ? 1.2 : 0.65;
    const sx = cx + (srand() - 0.5) * 2 * maxDx;
    const sz = (y + 1) * TILE + (srand() - 0.5) * 0.6;
    out.push({
      x: sx, z: sz, rx: srx, ry: sry, rz: srz, yaw: Math.PI / 2 + (srand() - 0.5) * 0.6,
      pitch: (srand() - 0.5) * st.tilt, roll: (srand() - 0.5) * st.tilt,
      sink: 0.38, crag: st.crag * 0.92, moss: st.moss, detail: 1, tone: bedrockTone(sx, sz), seed: nextSeed(srand),
    });
  }

  return out;
}
