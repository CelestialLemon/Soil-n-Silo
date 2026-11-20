import { CRAG_BOUND } from '../../../brush3d/src/shared.ts';
import { mulberry32, noise2 } from '../../game/rng.ts';
import { hash } from '../trees.ts';
import { TILE } from './scale.ts';

// Pure outcrop layout planner (#257): decides where boulders, crags, shoulders, shared-edge bridges, 2×2 quad keystones,
// and tapered talus sit for each rock tile. Plain TypeScript with no three.js or Vite imports so Node tests can verify
// cluster bridging, strict tile-union containment (#206 picking), and cross-block cache-key invalidation (#204).

/** Rocks comparison look (`off` = legacy stones, `soft` = calm mossy crags, `bold` = taller faceted crags & talus). */
export type RocksLook = 'off' | 'soft' | 'bold';

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
 * Cache key for one rock tile in a block: changes whenever its neighbour mask or the ground height at its centre,
 * four cardinal edge midpoints, or four corners changes, so clearing a rock or earthworks nearby invalidates it cleanly.
 */
export function rockTileKey(
  x: number, y: number, mask: number, heightAt: (tx: number, ty: number) => number,
): string {
  let k = `${x},${y},${mask}`;
  for (let dy = 0; dy <= 1; dy += 0.5) for (let dx = 0; dx <= 1; dx += 0.5) {
    k += `,${heightAt(x + dx, y + dy).toFixed(3)}`;
  }
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

/** Shape parameters that determine a crag's conservative horizontal footprint. */
export type RockShape = Pick<PlannedRock, 'rx' | 'ry' | 'rz' | 'yaw' | 'pitch' | 'roll' | 'crag'>;

/** Projected XZ ellipse matrix (`qxx`, `qxz`, `qzz`) and axis half-extents (`fx`, `fz`) bounding a deformed crag. */
export interface RockFootprint {
  qxx: number; qxz: number; qzz: number;
  fx: number; fz: number;
}

/**
 * The XZ shadow of the ellipsoid brush3d promises a crag stays inside (`CRAG_BOUND`: its noise's swell, its skirt's
 * flare), turned by its tilt and yaw.
 */
export function rockFootprint(s: RockShape): RockFootprint {
  const k = CRAG_BOUND.swell + CRAG_BOUND.perCrag * s.crag;
  const ax = s.rx * k * CRAG_BOUND.skirt, ay = s.ry * k, az = s.rz * k * CRAG_BOUND.skirt;
  const cy = Math.cos(s.yaw), sy = Math.sin(s.yaw);
  const cp = Math.cos(s.pitch), sp = Math.sin(s.pitch);
  const cr = Math.cos(s.roll), sr = Math.sin(s.roll);
  // Rows 0 and 2 of Three.js YXZ Euler rotation matrix Ry(yaw) * Rx(pitch) * Rz(roll).
  const m00 = cy * cr + sy * sp * sr, m01 = -cy * sr + sy * sp * cr, m02 = sy * cp;
  const m20 = -sy * cr + cy * sp * sr, m21 = sy * sr + cy * sp * cr, m22 = cy * cp;
  const qxx = (m00 * ax) ** 2 + (m01 * ay) ** 2 + (m02 * az) ** 2;
  const qzz = (m20 * ax) ** 2 + (m21 * ay) ** 2 + (m22 * az) ** 2;
  const qxz = m00 * m20 * ax * ax + m01 * m21 * ay * ay + m02 * m22 * az * az;
  return { qxx, qxz, qzz, fx: Math.sqrt(qxx), fz: Math.sqrt(qzz) };
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

const DIAGS: readonly [bit: number, cardA: number, cardB: number, sx: number, sz: number][] = [
  [ROCK_BIT.NE, ROCK_BIT.N, ROCK_BIT.E, 1, -1],
  [ROCK_BIT.SE, ROCK_BIT.S, ROCK_BIT.E, 1, 1],
  [ROCK_BIT.SW, ROCK_BIT.S, ROCK_BIT.W, -1, 1],
  [ROCK_BIT.NW, ROCK_BIT.N, ROCK_BIT.W, -1, -1],
];

/**
 * Exact minimum squared distance in the footprint's `Q^{-1}` metric from `(dx, dz)` to the forbidden diagonal quadrant
 * `{ (px, pz) : sx * px >= half && sz * pz >= half }`. `d2 >= 1` guarantees the entire deformed crag stays disjoint from it.
 */
function quadrantClearance(
  dx: number, dz: number, qxx: number, qxz: number, qzz: number, sx: number, sz: number, half: number,
): { d2: number; vx: number; vz: number } {
  const cx = sx * half - dx, cz = sz * half - dz;
  if (sx * cx <= 0 && sz * cz <= 0) return { d2: 0, vx: dx, vz: dz };
  const det = Math.max(1e-12, qxx * qzz - qxz * qxz);
  // Corner (cx, cz).
  let d2 = (qzz * cx * cx - 2 * qxz * cx * cz + qxx * cz * cz) / det;
  let vx = sx * half, vz = sz * half;
  // X-boundary ray (v_x = cx, sz * v_z >= sz * cz).
  const vzRay = (qxz / qxx) * cx;
  if (sz * vzRay >= sz * cz) {
    const dRay = (cx * cx) / qxx;
    if (dRay < d2) { d2 = dRay; vx = sx * half; vz = dz + vzRay; }
  }
  // Z-boundary ray (v_z = cz, sx * v_x >= sx * cx).
  const vxRay = (qxz / qzz) * cz;
  if (sx * vxRay >= sx * cx) {
    const dRay = (cz * cz) / qzz;
    if (dRay < d2) { d2 = dRay; vx = dx + vxRay; vz = sz * half; }
  }
  return { d2, vx, vz };
}

/**
 * Clamps a stone offset `(dx, dz)` from tile centre and computes any uniform scale `<= 1` needed so the crag's full
 * conservative footprint stays inside the union of occupied rock tiles (respecting both cardinal and diagonal bits).
 */
function clampToRock(
  dx: number, dz: number, shape: RockShape, mask: number,
): { dx: number; dz: number; scale: number } {
  const half = TILE * 0.5;
  const E = (mask & ROCK_BIT.E) !== 0, W = (mask & ROCK_BIT.W) !== 0;
  const S = (mask & ROCK_BIT.S) !== 0, N = (mask & ROCK_BIT.N) !== 0;
  const fp = rockFootprint(shape);

  let scale = 1;
  if (!E && !W && fp.fx > half) scale = Math.min(scale, half / fp.fx);
  if (!N && !S && fp.fz > half) scale = Math.min(scale, half / fp.fz);
  if (fp.fx > TILE) scale = Math.min(scale, TILE / fp.fx);
  if (fp.fz > TILE) scale = Math.min(scale, TILE / fp.fz);

  const fx = fp.fx * scale, fz = fp.fz * scale;
  const s2 = scale * scale;
  const qxx = fp.qxx * s2, qxz = fp.qxz * s2, qzz = fp.qzz * s2;

  const maxX = E ? half : half - fx, minX = W ? -half : -(half - fx);
  const maxZ = S ? half : half - fz, minZ = N ? -half : -(half - fz);
  let x = Math.max(minX, Math.min(maxX, dx));
  let z = Math.max(minZ, Math.min(maxZ, dz));

  // Only missing diagonals whose two adjacent cardinals are rock can be reached from inside the cardinal clamp box.
  const missing: [number, number][] = [];
  for (const [bit, a, b, sx, sz] of DIAGS) {
    if ((mask & a) && (mask & b) && !(mask & bit)) missing.push([sx, sz]);
  }
  if (!missing.length) return { dx: x, dz: z, scale };

  for (let iter = 0; iter < 8; iter++) {
    let worstD2 = Infinity, worstVx = 0, worstVz = 0, worstSx = 0, worstSz = 0;
    for (const [sx, sz] of missing) {
      const c = quadrantClearance(x, z, qxx, qxz, qzz, sx, sz, half);
      if (c.d2 < worstD2) { worstD2 = c.d2; worstVx = c.vx; worstVz = c.vz; worstSx = sx; worstSz = sz; }
    }
    if (worstD2 >= 1) break;
    const wx = x - worstVx, wz = z - worstVz, wlen = Math.hypot(wx, wz);
    if (wlen < 1e-6) {
      x -= worstSx * 0.5 * half;
      z -= worstSz * 0.5 * half;
    } else {
      const step = Math.min(1.5, (1 / Math.sqrt(Math.max(worstD2, 0.04)) - 1) * 1.05);
      x += wx * step;
      z += wz * step;
    }
    x = Math.max(minX, Math.min(maxX, x));
    z = Math.max(minZ, Math.min(maxZ, z));
  }

  const checkMin = (px: number, pz: number) => {
    let m = Infinity;
    for (const [sx, sz] of missing) m = Math.min(m, quadrantClearance(px, pz, qxx, qxz, qzz, sx, sz, half).d2);
    return m;
  };
  let minD2 = checkMin(x, z);
  if (minD2 < 1) {
    const midX = 0.5 * (minX + maxX), midZ = 0.5 * (minZ + maxZ);
    const midD2 = checkMin(midX, midZ);
    if (midD2 > minD2) { x = midX; z = midZ; minD2 = midD2; }
    if (minD2 < 1) scale *= Math.sqrt(Math.max(minD2, 1e-4)) * 0.995;
  }

  return { dx: x, dz: z, scale };
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
  // Three.js positive yaw rotates local +X toward −Z: +π/4 aligns along NE–SW, −π/4 along NW–SE.
  const alongX = (E ? 1 : 0) + (W ? 1 : 0), alongZ = (N ? 1 : 0) + (S ? 1 : 0);
  const alongNESW = (NE ? 1 : 0) + (SW ? 1 : 0), alongNWSE = (NW ? 1 : 0) + (SE ? 1 : 0);
  const best = Math.max(alongX, alongZ, alongNESW, alongNWSE);
  let ridgeYaw = rand() * Math.PI;
  if (best > 0) {
    if (alongX === best && alongZ < best) ridgeYaw = 0;
    else if (alongZ === best && alongX < best) ridgeYaw = Math.PI / 2;
    else if (alongNESW === best && alongNWSE < best) ridgeYaw = Math.PI / 4;
    else if (alongNWSE === best && alongNESW < best) ridgeYaw = -Math.PI / 4;
    ridgeYaw += (rand() - 0.5) * 0.7;
  }

  const tilt = () => (rand() - 0.5) * 2 * st.tilt;
  const nextSeed = (r: () => number) => Math.floor(r() * 1e9) >>> 0;

  const pushFitted = (
    dx: number, dz: number,
    piece: Omit<PlannedRock, 'x' | 'z'>,
  ): [number, number] => {
    const fit = clampToRock(dx, dz, piece, mask);
    out.push({
      ...piece,
      x: cx + fit.dx, z: cz + fit.dz,
      rx: piece.rx * fit.scale, ry: piece.ry * fit.scale, rz: piece.rz * fit.scale,
    });
    return [fit.dx, fit.dz];
  };

  if (card === 0) {
    // Lone rock tile: a compact 2–3 stone mini-outcrop staying cleanly within its tile.
    const rx = 1.2 + rand() * 0.35, rz = 0.88 + rand() * 0.3, ry = (0.76 + rand() * 0.34) * st.heightScale;
    const yaw = rand() * Math.PI;
    const [dx, dz] = pushFitted((rand() - 0.5) * 0.7, (rand() - 0.5) * 0.7, {
      rx, ry, rz, yaw, pitch: tilt(), roll: tilt(), sink: 0.34, crag: st.crag, moss: st.moss, detail: 2, tone, seed: nextSeed(rand),
    });

    // Companion boulder nestled against one flank.
    const ca = yaw + 1.1 + rand() * 1.2, cr = 0.85 + rand() * 0.35;
    const crx = 0.62 + rand() * 0.28, crz = 0.5 + rand() * 0.22, cry = (0.42 + rand() * 0.24) * st.heightScale;
    pushFitted(dx + Math.cos(ca) * cr, dz + Math.sin(ca) * cr, {
      rx: crx, ry: cry, rz: crz, yaw: ca + rand() * 0.8, pitch: tilt() * 0.7, roll: tilt() * 0.7,
      sink: 0.38, crag: st.crag * 0.85, moss: Math.min(0.85, st.moss + 0.12), detail: 1, tone, seed: nextSeed(rand),
    });

    if (st.extraTalus || rand() < 0.65) {
      const ta = ca + 2.3 + rand() * 1.4, tr = 0.95 + rand() * 0.4;
      const trx = 0.38 + rand() * 0.2, trz = 0.3 + rand() * 0.16, try_ = 0.22 + rand() * 0.14;
      pushFitted(dx + Math.cos(ta) * tr, dz + Math.sin(ta) * tr, {
        rx: trx, ry: try_, rz: trz, yaw: rand() * Math.PI, pitch: 0, roll: 0,
        sink: 0.44, crag: st.crag * 0.7, moss: st.moss, detail: 1, tone, seed: nextSeed(rand),
      });
    }
  } else if (card <= 2) {
    // Edge, peninsula, or ridge band: elongated boulder pulled inward toward rock neighbours, tapered talus toward grass.
    const rx = 1.35 + rand() * 0.45, rz = 0.95 + rand() * 0.35, ry = (0.86 + rand() * 0.44) * st.heightScale;
    const shift = 0.45 + rand() * 0.45;
    pushFitted(inX * shift + (rand() - 0.5) * 1.0, inZ * shift + (rand() - 0.5) * 1.0, {
      rx, ry, rz, yaw: ridgeYaw, pitch: tilt() * 0.8, roll: tilt() * 0.8,
      sink: 0.33, crag: st.crag + 0.05, moss: st.moss, detail: 2, tone, seed: nextSeed(rand),
    });

    const ox = pullLen > 1e-3 ? -inX : Math.cos(ridgeYaw + Math.PI / 2);
    const oz = pullLen > 1e-3 ? -inZ : -Math.sin(ridgeYaw + Math.PI / 2);
    const sr = 0.75 + rand() * 0.4;
    const srx = 0.72 + rand() * 0.34, srz = 0.54 + rand() * 0.26, sry = (0.38 + rand() * 0.24) * st.heightScale;
    pushFitted(ox * sr + (rand() - 0.5) * 0.9, oz * sr + (rand() - 0.5) * 0.9, {
      rx: srx, ry: sry, rz: srz, yaw: ridgeYaw + (rand() - 0.5) * 1.1, pitch: tilt() * 0.6, roll: tilt() * 0.6,
      sink: 0.42, crag: st.crag * 0.85, moss: Math.min(0.85, st.moss + 0.1), detail: 1, tone, seed: nextSeed(rand),
    });

    if (st.extraTalus || rand() < 0.45) {
      const ta = Math.atan2(oz, ox) + (rand() - 0.5) * 1.8, tr = 1.0 + rand() * 0.45;
      const trx = 0.42 + rand() * 0.2, trz = 0.32 + rand() * 0.16, try_ = (0.24 + rand() * 0.14) * st.heightScale;
      pushFitted(Math.cos(ta) * tr, Math.sin(ta) * tr, {
        rx: trx, ry: try_, rz: trz, yaw: rand() * Math.PI, pitch: 0, roll: 0,
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
      const [dx, dz] = pushFitted((rand() - 0.5) * 2.1, (rand() - 0.5) * 2.1, {
        rx, ry, rz, yaw: ridgeYaw, pitch: tilt(), roll: tilt(), sink: 0.32,
        crag: Math.min(0.95, st.crag + 0.12), moss: st.moss * 0.82, detail: 2, tone, seed: nextSeed(rand),
      });

      const sa = ridgeYaw + (rand() < 0.5 ? 1 : -1) * (1.2 + rand() * 0.9), sr = 1.15 + rand() * 0.45;
      const srx = 1.1 + rand() * 0.35, srz = 0.85 + rand() * 0.3, sry = (0.62 + rand() * 0.32) * st.heightScale;
      pushFitted(dx + Math.cos(sa) * sr, dz + Math.sin(sa) * sr, {
        rx: srx, ry: sry, rz: srz, yaw: ridgeYaw + (rand() - 0.5) * 0.8, pitch: tilt() * 0.7, roll: tilt() * 0.7,
        sink: 0.38, crag: st.crag, moss: st.moss, detail: 1, tone, seed: nextSeed(rand),
      });
    } else {
      const rx = 1.55 + rand() * 0.5, rz = 1.25 + rand() * 0.4, ry = (0.55 + rand() * 0.32) * st.heightScale;
      const [dx, dz] = pushFitted((rand() - 0.5) * 2.0, (rand() - 0.5) * 2.0, {
        rx, ry, rz, yaw: ridgeYaw, pitch: tilt() * 0.5, roll: tilt() * 0.5, sink: 0.42,
        crag: st.crag * 0.85, moss: Math.min(0.85, st.moss + 0.1), detail: 1, tone, seed: nextSeed(rand),
      });

      const ba = rand() * Math.PI * 2, br = 0.95 + rand() * 0.45;
      const brx = 0.95 + rand() * 0.35, brz = 0.75 + rand() * 0.28, bry = (0.64 + rand() * 0.36) * st.heightScale;
      pushFitted(-dx * 0.4 + Math.cos(ba) * br, -dz * 0.4 + Math.sin(ba) * br, {
        rx: brx, ry: bry, rz: brz, yaw: ridgeYaw + (rand() - 0.5) * 0.9, pitch: tilt() * 0.8, roll: tilt() * 0.8,
        sink: 0.36, crag: st.crag, moss: st.moss, detail: 1, tone, seed: nextSeed(rand),
      });
    }
  }

  // ---- Grid-breaking shared-edge bridges and 2×2 quad keystones (owned canonically by the NW tile) ----
  const half = TILE * 0.5;

  if (E && S && SE && hash(x + 41, y - 23) < 0.65) {
    const qrand = mulberry32((Math.floor(hash(x + 97, y - 43) * 1e9) ^ 0x2f71) >>> 0);
    const rawDx = (qrand() - 0.5) * 1.4, rawDz = (qrand() - 0.5) * 1.4;
    const qrx = 1.7 + qrand() * 0.6, qrz = 1.3 + qrand() * 0.45, qry = (1.1 + qrand() * 0.65) * st.heightScale;
    const yaw = qrand() * Math.PI, pitch = (qrand() - 0.5) * 2 * st.tilt, roll = (qrand() - 0.5) * 2 * st.tilt;
    const crag = Math.min(0.95, st.crag + 0.1);
    const fp = rockFootprint({ rx: qrx, ry: qry, rz: qrz, yaw, pitch, roll, crag });
    const s = Math.min(1, TILE / Math.max(fp.fx, fp.fz));
    const maxDx = Math.max(0, TILE - fp.fx * s), maxDz = Math.max(0, TILE - fp.fz * s);
    const qx = (x + 1) * TILE + Math.max(-maxDx, Math.min(maxDx, rawDx));
    const qz = (y + 1) * TILE + Math.max(-maxDz, Math.min(maxDz, rawDz));
    out.push({
      x: qx, z: qz, rx: qrx * s, ry: qry * s, rz: qrz * s, yaw, pitch, roll,
      sink: 0.33, crag, moss: st.moss * 0.88, detail: 2, tone: bedrockTone(qx, qz), seed: nextSeed(qrand),
    });
  }

  if (E && hash(x + 71, y + 13) < 0.62) {
    const erand = mulberry32((Math.floor(hash(x + 71, y + 13) * 1e9) ^ 0x1a33) >>> 0);
    const erx = 1.25 + erand() * 0.45, erz = 0.85 + erand() * 0.32, ery = (0.56 + erand() * 0.36) * st.heightScale;
    const rawDx = (erand() - 0.5) * 0.6, rawDz = (erand() - 0.5) * 2.4;
    const yaw = (erand() - 0.5) * 0.6, pitch = (erand() - 0.5) * st.tilt, roll = (erand() - 0.5) * st.tilt;
    const crag = st.crag * 0.92;
    const fp = rockFootprint({ rx: erx, ry: ery, rz: erz, yaw, pitch, roll, crag });
    const northRock = N && NE, southRock = S && SE;
    let s = Math.min(1, TILE / fp.fx, TILE / fp.fz);
    if (!northRock && !southRock && fp.fz * s > half) s = Math.min(s, half / fp.fz);
    const fx = fp.fx * s, fz = fp.fz * s;
    const maxDx = Math.max(0, TILE - fx);
    const minZ = northRock ? -1.2 : -(half - fz), maxZ = southRock ? 1.2 : half - fz;
    const ex = (x + 1) * TILE + Math.max(-maxDx, Math.min(maxDx, rawDx));
    const ez = cz + Math.max(Math.min(minZ, maxZ), Math.min(maxZ, rawDz));
    out.push({
      x: ex, z: ez, rx: erx * s, ry: ery * s, rz: erz * s, yaw, pitch, roll,
      sink: 0.38, crag, moss: st.moss, detail: 1, tone: bedrockTone(ex, ez), seed: nextSeed(erand),
    });
  }

  if (S && hash(x - 19, y + 83) < 0.62) {
    const srand = mulberry32((Math.floor(hash(x - 19, y + 83) * 1e9) ^ 0x3c59) >>> 0);
    const srx = 1.25 + srand() * 0.45, srz = 0.85 + srand() * 0.32, sry = (0.56 + srand() * 0.36) * st.heightScale;
    const rawDx = (srand() - 0.5) * 2.4, rawDz = (srand() - 0.5) * 0.6;
    const yaw = Math.PI / 2 + (srand() - 0.5) * 0.6, pitch = (srand() - 0.5) * st.tilt, roll = (srand() - 0.5) * st.tilt;
    const crag = st.crag * 0.92;
    const fp = rockFootprint({ rx: srx, ry: sry, rz: srz, yaw, pitch, roll, crag });
    const westRock = W && SW, eastRock = E && SE;
    let s = Math.min(1, TILE / fp.fx, TILE / fp.fz);
    if (!westRock && !eastRock && fp.fx * s > half) s = Math.min(s, half / fp.fx);
    const fx = fp.fx * s, fz = fp.fz * s;
    const minX = westRock ? -1.2 : -(half - fx), maxX = eastRock ? 1.2 : half - fx;
    const maxDz = Math.max(0, TILE - fz);
    const sx = cx + Math.max(Math.min(minX, maxX), Math.min(maxX, rawDx));
    const sz = (y + 1) * TILE + Math.max(-maxDz, Math.min(maxDz, rawDz));
    out.push({
      x: sx, z: sz, rx: srx * s, ry: sry * s, rz: srz * s, yaw, pitch, roll,
      sink: 0.38, crag, moss: st.moss, detail: 1, tone: bedrockTone(sx, sz), seed: nextSeed(srand),
    });
  }

  return out;
}
