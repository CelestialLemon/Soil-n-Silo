// The seeded pocket valley: ~120 m of rolling meadow inside rising hills, a brook winding down it through a calm pond and
// out, rocky knolls, wild groves, and a gentle sunlit spot by the brook kept for the farmhouse.
//
// The land falls gently down the valley (along the brook) and rises gently away from the brook to either side, so a rill
// taken off the brook and led downstream along the slope flows (the ground ahead is lower than the brook it left), and one
// led straight uphill runs dry within a few metres. The brook's surface never rises downstream; its bed and the pond's
// are carved into the valley with shelving banks a little above the water, so the banks hold it.
import { fbm, noise2 } from '../noise.ts';
import { catmullRom, clamp, lerp, PathIndex, type Point2, smoothstep } from '../geom.ts';
import { cellHeightAt, cellX, cellZ, COVER, type Grid, isWet, SOIL, VALLEY_HALF, vertexX, vertexZ } from '../grid.ts';
import { makeRng, subSeed } from '../rng.ts';
import { blankState, type Crag, type GameState, type Season, type Tree, type TreeSpecies } from '../state.ts';
import { wetness } from '../wet.ts';
import { powerFor } from '../power/graph.ts';

/** How far the land falls per metre down the valley. */
export const VALLEY_FALL = 0.03;
/** How far it rises per metre away from the brook. */
export const SIDE_RISE = 0.025;
/** How far the brook's banks stand above its water, m. */
export const BANK_FREEBOARD = 0.2;
/** How deep the brook's bed lies below its water at the middle, m. */
const BROOK_DEPTH = 0.7;
const POND_DEPTH = 1.1;
/** How far the brook's water drops at least per metre downstream. */
const BROOK_DROP = 0.004;
/** How steeply the brook may come down to the pond, per metre. */
const POND_APPROACH = 0.03;
/** The brook's flow, m/s. */
const BROOK_SPEED = 0.8;
/** How far from the water's edge the banks are raised to hold it, m. */
const LEVEE = 3.5;
/** The homestead clearing's radius, m. */
export const CLEARING = 16;

interface Knoll { x: number; z: number; radius: number; height: number }

interface Brook {
  path: Point2[]; index: PathIndex; level: number[]; half: number[];
  pond: { x: number; z: number; radius: number; level: number; seed: number };
}

/** Grows the valley for a seed and season. */
export function generateValley(seed: number, season: Season): GameState {
  const s = blankState(seed, season), g = s.grid, rng = makeRng(subSeed(seed, 1));
  const dir = rng.next() < 0.5 ? 1 : -1; // which way the brook runs (along x)
  const flip = rng.next() < 0.5 ? 1 : -1; // which side of the brook its meanders start

  // The brook's course, upstream (u = -84) to downstream (u = 84), u = dir * x.
  const zMid = rng.range(-8, 8), amp = rng.range(7, 12), freq = rng.range(0.035, 0.05), phase = rng.range(0, Math.PI * 2);
  const ctrl: Point2[] = [];
  for (let u = -86; u <= 86; u += 14) {
    const z = clamp(zMid + flip * amp * Math.sin(phase + u * freq) + rng.range(-2.5, 2.5), -28, 28);
    ctrl.push({ x: dir * u, z });
  }
  const course = catmullRom(ctrl, 1), index = new PathIndex(course);
  const uOf = (x: number) => dir * x;

  // The pond, on the brook a little downstream of the middle; the homestead upstream of it, off to one side.
  const pondAt = course[nearestIndex(course, (p) => uOf(p.x), rng.range(6, 18))];
  const pondSeed = subSeed(seed, 2), pondR = rng.range(7, 9);
  const homeAt = nearestIndex(course, (p) => uOf(p.x), rng.range(-24, -12));
  const side = rng.next() < 0.5 ? 1 : -1;
  const home = offsetFrom(course, homeAt, side * 16);

  // Knolls for the crags: up the valley's sides, away from the brook, the pond and the homestead.
  const knolls: Knoll[] = [];
  for (let tries = 0; knolls.length < 4 && tries < 200; tries++) {
    const x = rng.range(-50, 50), z = rng.range(-50, 50);
    const dB = index.nearest(x, z).d;
    if (dB < 18 || Math.hypot(x - home.x, z - home.z) < CLEARING + 14 || Math.hypot(x - pondAt.x, z - pondAt.z) < pondR + 14) continue;
    if (knolls.some((k) => Math.hypot(k.x - x, k.z - z) < 22)) continue;
    knolls.push({ x, z, radius: rng.range(6, 9), height: rng.range(1.8, 3.2) });
  }

  // The natural ground before the water is carved.
  const nSeed = subSeed(seed, 3);
  const ground = (x: number, z: number, dB = index.nearest(x, z).d) => {
    const dH = Math.hypot(x - home.x, z - home.z);
    const r = Math.max(Math.abs(x), Math.abs(z));
    let h = -VALLEY_FALL * uOf(x) + SIDE_RISE * dB + 0.0012 * Math.max(0, dB - 22) ** 2;
    // The hills round the valley, parting where the brook comes in and goes out.
    h += (9 * smoothstep(52, 78, r) + 0.12 * Math.max(0, r - 54)) * smoothstep(5, 26, dB);
    // Rolling ground, calm by the brook and in the homestead's clearing.
    const calm = smoothstep(5, 16, dB) * smoothstep(CLEARING - 2, CLEARING + 10, dH);
    h += 1.4 * fbm(nSeed, x / 24, z / 24, 4) * calm;
    for (const k of knolls) h += k.height * Math.exp(-((x - k.x) ** 2 + (z - k.z) ** 2) / (k.radius * k.radius));
    return h;
  };

  // The brook's water: never rising downstream, flat across the pond.
  const pondR0 = (x: number, z: number) => pondRadius(pondSeed, pondR, Math.atan2(z - pondAt.z, x - pondAt.x));
  const inPond = (x: number, z: number) => Math.hypot(x - pondAt.x, z - pondAt.z) < pondR0(x, z);
  // The pond fills to just below the lowest ground round its rim, so all its banks hold it.
  let rim = Infinity;
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2, r = pondRadius(pondSeed, pondR, a) + 1.5;
    const x = pondAt.x + Math.cos(a) * r, z = pondAt.z + Math.sin(a) * r;
    if (index.nearest(x, z).d > 4) rim = Math.min(rim, ground(x, z) - BANK_FREEBOARD);
  }
  // Down to the pond the water never rises; it eases down to the pond's level as it nears it (no step where it enters),
  // lies flat across the pond, then runs on down.
  const natural = course.map((p) => ground(p.x, p.z) - BANK_FREEBOARD);
  const entry = course.findIndex((p) => inPond(p.x, p.z));
  if (entry <= 0) throw new Error('The pond missed the brook');
  const level: number[] = [], half: number[] = [];
  for (let i = 0; i < entry; i++) level.push(Math.min(i > 0 ? level[i - 1] - BROOK_DROP : Infinity, natural[i]));
  const pondLevel = Math.min(level[entry - 1] - BROOK_DROP, natural[entry], rim);
  for (let i = entry - 1, along = 0; i >= 0; i--) {
    along += Math.hypot(course[i + 1].x - course[i].x, course[i + 1].z - course[i].z);
    level[i] = Math.min(level[i], pondLevel + POND_APPROACH * along);
  }
  // Out of the pond it eases down again, no faster than it came in.
  let leftPond = false, along = 0;
  for (let i = entry; i < course.length; i++) {
    const p = course[i];
    if (!leftPond && inPond(p.x, p.z)) { level.push(pondLevel); continue; }
    leftPond = true;
    along += Math.hypot(p.x - course[i - 1].x, p.z - course[i - 1].z);
    level.push(Math.max(Math.min(level[i - 1] - BROOK_DROP, natural[i]), Math.min(level[i - 1] - BROOK_DROP, pondLevel - POND_APPROACH * along)));
  }
  course.forEach((_p, i) => half.push(1.5 + 0.6 * (i / (course.length - 1)) + 0.25 * noise2(subSeed(seed, 4), i * 0.05, 0)));
  const brook: Brook = { path: course, index, level, half, pond: { x: pondAt.x, z: pondAt.z, radius: pondR, level: pondLevel, seed: pondSeed } };

  carve(g, ground, brook);
  markWater(g, brook);
  holdBanks(g);
  cover(s, knolls, brook, home);
  grow(s, rng, brook, home, knolls, season);
  naturalize(s);
  s.valley = { homestead: home, brook: course, brookLevel: level, pond: { x: pondAt.x, z: pondAt.z, radius: pondR, level: pondLevel } };
  return s;
}

function nearestIndex(path: readonly Point2[], key: (p: Point2) => number, target: number): number {
  let best = 0;
  path.forEach((p, i) => { if (Math.abs(key(p) - target) < Math.abs(key(path[best]) - target)) best = i; });
  return best;
}

/** A point `off` metres to the side of the path at sample i (positive: left of downstream). */
function offsetFrom(path: readonly Point2[], i: number, off: number): Point2 {
  const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1;
  return { x: path[i].x - (dz / len) * off, z: path[i].z + (dx / len) * off };
}

/** The pond's organic edge: its radius in direction `theta`. */
const pondRadius = (seed: number, r: number, theta: number) =>
  r * (1 + 0.16 * noise2(seed, 3 + 1.4 * Math.cos(theta), 3 + 1.4 * Math.sin(theta)));

/** Where a point is against the water: the brook's level and edge distance there, and the pond's. */
function waterNear(b: Brook, x: number, z: number, maxD = Infinity) {
  const n = b.index.nearest(x, z, maxD);
  const i = Math.max(0, n.seg), j = Math.min(b.path.length - 1, i + 1);
  const wB = lerp(b.level[i], b.level[j], n.t), hw = lerp(b.half[i], b.half[j], n.t);
  const rp = Math.hypot(x - b.pond.x, z - b.pond.z), R = pondRadius(b.pond.seed, b.pond.radius, Math.atan2(z - b.pond.z, x - b.pond.x));
  return { dB: n.d, wB, hw, eB: n.d - hw, seg: i, eP: rp - R, R };
}

/** Carves the brook's and pond's beds and shelving banks into the natural ground. */
function carve(g: Grid, ground: (x: number, z: number, dB?: number) => number, b: Brook) {
  const W = g.nx + 1;
  const bank = (w: number, e: number) => w + BANK_FREEBOARD * smoothstep(0, 1.2, e) + 0.14 * Math.max(0, e - 1.2);
  for (let iz = 0; iz <= g.nz; iz++) for (let ix = 0; ix <= g.nx; ix++) {
    const x = vertexX(g, ix), z = vertexZ(g, iz), n = waterNear(b, x, z);
    let h = ground(x, z, n.dB);
    const wP = b.pond.level;
    // The brook: a rounded bed under its water, shelving banks just above it.
    const pb = n.eB <= 0 ? n.wB - BROOK_DEPTH * (1 - (n.dB / n.hw) ** 2) : bank(n.wB, n.eB);
    // The pond: shelving into a deeper middle.
    const pp = n.eP <= 0 ? wP - POND_DEPTH * smoothstep(0, Math.min(4, n.R * 0.6), -n.eP) - 0.05 : bank(wP, n.eP);
    h = Math.min(h, pb, pp);
    // Banks hold the water: dry ground beside it never dips below the water's surface.
    if (n.eB > 0 && n.eP > 0 && n.eB < LEVEE) h = Math.max(h, n.wB + 0.1 * Math.min(1, n.eB / 0.8));
    if (n.eP > 0 && n.eB > 0 && n.eP < LEVEE) h = Math.max(h, wP + 0.1 * Math.min(1, n.eP / 0.8));
    g.baseHeight[iz * W + ix] = h;
  }
}

/** Marks the natural water cells: their surface and flow. */
function markWater(g: Grid, b: Brook) {
  for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
    const x = cellX(g, ix), z = cellZ(g, iz), n = waterNear(b, x, z, 6), i = iz * g.nx + ix;
    const pond = n.eP < 1.5, brook = n.eB < 1.5;
    if (!pond && !brook) continue;
    const w = pond ? b.pond.level : n.wB;
    if (cellHeightAt(g, ix, iz, g.baseHeight) >= w) continue;
    g.baseWaterLevel[i] = w;
    if (pond) continue; // the pond lies still
    const a = b.path[n.seg], c = b.path[Math.min(b.path.length - 1, n.seg + 1)];
    const len = Math.hypot(c.x - a.x, c.z - a.z) || 1;
    // Quicker in the middle, slower at the edges.
    const speed = BROOK_SPEED * (1 - 0.6 * clamp(n.dB / n.hw, 0, 1));
    g.baseFlowX[i] = ((c.x - a.x) / len) * speed;
    g.baseFlowZ[i] = ((c.z - a.z) / len) * speed;
  }
}

/**
 * Lifts the bank wherever a dry cell beside the water sits a little lower than the water's surface (where the brook's
 * level slopes between neighbouring cells), raising only the corners it shares with no water cell, so the banks hold
 * the water everywhere. A cell whose every corner is the water's joins it.
 */
function holdBanks(g: Grid) {
  const W = g.nx + 1;
  const wetCorner = (vx: number, vz: number) => {
    for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) {
      const cx = vx + dx, cz = vz + dz;
      if (cx >= 0 && cz >= 0 && cx < g.nx && cz < g.nz && isWet(g.baseWaterLevel[cz * g.nx + cx])) return true;
    }
    return false;
  };
  for (let pass = 0; pass < 8; pass++) {
    let lifted = false;
    for (let iz = 1; iz < g.nz - 1; iz++) for (let ix = 1; ix < g.nx - 1; ix++) {
      const i = iz * g.nx + ix;
      if (isWet(g.baseWaterLevel[i])) continue;
      let top = -Infinity;
      for (const j of [i - 1, i + 1, i - g.nx, i + g.nx]) if (isWet(g.baseWaterLevel[j])) top = Math.max(top, g.baseWaterLevel[j]);
      const deficit = top - cellHeightAt(g, ix, iz, g.baseHeight);
      if (!(deficit > 0)) continue;
      const free = [[ix, iz], [ix + 1, iz], [ix, iz + 1], [ix + 1, iz + 1]].filter(([vx, vz]) => !wetCorner(vx, vz));
      if (free.length === 0) {
        // Every corner it has is the water's: it's a nook of the water itself.
        g.baseWaterLevel[i] = top;
        lifted = true;
        continue;
      }
      for (const [vx, vz] of free) g.baseHeight[vz * W + vx] += (4 * deficit) / free.length + 0.01;
      lifted = true;
    }
    if (!lifted) break;
  }
}

/** The natural covers and soils. */
function cover(s: GameState, knolls: readonly Knoll[], b: Brook, home: Point2) {
  const g = s.grid, soilSeed = subSeed(s.seed, 5);
  for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
    const x = cellX(g, ix), z = cellZ(g, iz), i = iz * g.nx + ix, n = waterNear(b, x, z, 10);
    const out = Math.max(Math.abs(x), Math.abs(z)) > VALLEY_HALF;
    const wet = g.baseWaterLevel[i] > -100;
    const h00 = g.baseHeight[iz * (g.nx + 1) + ix], h11 = g.baseHeight[(iz + 1) * (g.nx + 1) + ix + 1];
    const h10 = g.baseHeight[iz * (g.nx + 1) + ix + 1], h01 = g.baseHeight[(iz + 1) * (g.nx + 1) + ix];
    const slope = Math.hypot((h10 - h00 + h11 - h01) / 2, (h01 - h00 + h11 - h10) / 2) / g.cell;
    const nearKnoll = knolls.some((k) => Math.hypot(x - k.x, z - k.z) < k.radius * 0.9);
    g.baseCover[i] = wet ? COVER.water : out && Math.min(n.eB, n.eP) > 2 ? COVER.woods : slope > 0.5 ? COVER.bare : COVER.grass;
    const v = fbm(soilSeed, x / 18, z / 18, 3);
    g.soil[i] = Math.min(n.eB, n.eP) < 5 ? (n.eP < 3 && n.eP > -1 ? SOIL.sand : SOIL.silt)
      : slope > 0.25 || nearKnoll ? SOIL.stony
      : v > 0.3 ? SOIL.clay
      : v < -0.35 && Math.hypot(x - home.x, z - home.z) > CLEARING ? SOIL.sand
      : SOIL.loam;
  }
}

/** The valley's crags and wild trees. */
function grow(s: GameState, rng: ReturnType<typeof makeRng>, b: Brook, home: Point2, knolls: readonly Knoll[], season: Season) {
  const g = s.grid;
  const crag = (x: number, z: number, radius: number, height: number) => {
    const c: Crag = { id: s.nextId++, x, z, radius, height, seed: rng.int(0x7fffffff) };
    s.crags.push(c);
    for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++)
      if (Math.hypot(cellX(g, ix) - x, cellZ(g, iz) - z) <= radius * 0.9) g.baseCover[iz * g.nx + ix] = COVER.rock;
  };
  for (const k of knolls) {
    crag(k.x, k.z, rng.range(1.8, 3), rng.range(1.2, 2.4));
    if (rng.next() < 0.6) {
      const a = rng.range(0, Math.PI * 2), d = rng.range(3, 4.5);
      crag(k.x + Math.cos(a) * d, k.z + Math.sin(a) * d, rng.range(1, 1.8), rng.range(0.6, 1.4));
    }
  }

  // Wild trees: woods along the valley's rim, a few groves on its sides, willows by the water.
  const clear = (x: number, z: number, minGap: number) => {
    const n = waterNear(b, x, z, 10), i = Math.floor((z - g.z0) / g.cell) * g.nx + Math.floor((x - g.x0) / g.cell);
    if (Math.min(n.eB, n.eP) < 1.8 || g.baseCover[i] === COVER.rock || g.baseCover[i] === COVER.water) return false;
    if (Math.hypot(x - home.x, z - home.z) < CLEARING + 8) return false;
    if (s.crags.some((c) => Math.hypot(x - c.x, z - c.z) < c.radius + 1.5)) return false;
    return !s.wildTrees.some((t) => Math.hypot(x - t.x, z - t.z) < minGap);
  };
  const tree = (x: number, z: number, species: TreeSpecies, scale: number) => {
    const t: Tree = { id: s.nextId++, x, z, species, scale, seed: rng.int(0x7fffffff), planted: false };
    s.wildTrees.push(t);
  };
  const broadleaf: TreeSpecies[] = season === 'winter' ? ['oak', 'birch', 'pine'] : ['oak', 'birch', 'poplar', 'oak'];
  // The rim: a ring of woods just inside and outside the valley's edge.
  for (let k = 0; k < 900 && s.wildTrees.length < 120; k++) {
    const edge = rng.range(-64, 64), inward = rng.range(52, 64), along = rng.int(4);
    const x = along === 0 ? inward : along === 1 ? -inward : edge, z = along === 2 ? inward : along === 3 ? -inward : edge;
    if (!clear(x, z, 4.5)) continue;
    tree(x, z, inward > 58 && rng.next() < 0.5 ? 'pine' : rng.pick(broadleaf), rng.range(0.85, 1.25));
  }
  // Groves on the valley's sides.
  for (let gIdx = 0, tries = 0; gIdx < 4 && tries < 60; tries++) {
    const cx = rng.range(-46, 46), cz = rng.range(-46, 46);
    const dB = b.index.nearest(cx, cz).d;
    if (dB < 10 || !clear(cx, cz, 10)) continue;
    gIdx++;
    const species = rng.pick(broadleaf), count = 3 + rng.int(5);
    for (let t = 0; t < count * 4 && count > 0; t++) {
      const a = rng.range(0, Math.PI * 2), d = rng.range(0, 7), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (Math.abs(x) < 54 && Math.abs(z) < 54 && clear(x, z, 3.5)) tree(x, z, rng.next() < 0.8 ? species : rng.pick(broadleaf), rng.range(0.8, 1.15));
    }
  }
  // Willows by the brook and pond.
  for (let k = 0; k < 40; k++) {
    const i = rng.int(b.path.length), p = b.path[i];
    if (Math.abs(p.x) > 54 || Math.abs(p.z) > 54) continue;
    const a = rng.range(0, Math.PI * 2), d = b.half[i] + rng.range(2.5, 5);
    const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
    if (b.index.nearest(x, z).d < b.half[i] + 2 || !clear(x, z, 6)) continue;
    tree(x, z, season === 'winter' ? 'birch' : 'willow', rng.range(0.9, 1.2));
  }
}

/**
 * Copies the natural valley (`baseHeight`, `baseCover`, `baseWaterLevel`, `baseFlowX/Z`) into the live layers and works
 * out its wet banks and power: the last step of growing a valley, and how a hand-made map (a test's) becomes playable.
 */
export function naturalize(s: GameState): void {
  const g = s.grid;
  g.height.set(g.baseHeight);
  g.landHeight.set(g.baseHeight);
  g.cover.set(g.baseCover);
  g.waterLevel.set(g.baseWaterLevel);
  g.flowX.set(g.baseFlowX);
  g.flowZ.set(g.baseFlowZ);
  g.moisture.set(wetness(g));
  s.power = powerFor(s);
}
