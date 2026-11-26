// Hand-made lands for the rules' tests: a plane of any slope, with a straight brook (or a still pond) where a test wants
// one, so each rule is tested on ground whose numbers are known.
import assert from 'node:assert/strict';
import {
  apply, canPlace, type Change, type Crop, must, networksOf, type Result, runtimeOf, type ThingKind, blankState, cellX, cellZ, COVER, type GameState,
  generateValley, naturalize, type Point2, vertexX, vertexZ,
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

/** The seeds the valley's playability tests sweep: the game's default (1042) and a spread of others. */
export const SEEDS = [1042, 7, 1, 2, 3, 42] as const;

/**
 * A spot on a generated valley's brook, `offset` samples (about a metre each) down the brook from the sample nearest the
 * homestead (negative: upstream): where it is, its water's surface, the way downstream, and the way across to the
 * homestead's side (the farming terrace).
 */
export function brookSpot(s: GameState, offset = 0) {
  const { brook, brookLevel, homestead: h } = s.valley;
  let bi = 0;
  brook.forEach((p, i) => { if (Math.hypot(p.x - h.x, p.z - h.z) < Math.hypot(brook[bi].x - h.x, brook[bi].z - h.z)) bi = i; });
  const i = Math.max(3, Math.min(brook.length - 4, bi + offset));
  const a = brook[i - 3], b = brook[i + 3], len = Math.hypot(b.x - a.x, b.z - a.z);
  const down = { x: (b.x - a.x) / len, z: (b.z - a.z) / len };
  const side = (h.x - brook[bi].x) * -down.z + (h.z - brook[bi].z) * down.x > 0 ? 1 : -1;
  const across = { x: -down.z * side, z: down.x * side };
  /** A point `along` metres downstream and `out` metres across toward the terrace (negative: the far side). */
  const at = (along: number, out: number): Point2 => ({ x: brook[i].x + down.x * along + across.x * out, z: brook[i].z + down.z * along + across.z * out });
  /** A straight stroke from the brook's middle, `deg` degrees off downstream toward the terrace (90: straight across). */
  const stroke = (deg: number, length: number, step = 10): Point2[] => {
    const r = (deg * Math.PI) / 180, out: Point2[] = [];
    for (let k = 0; k <= length; k += step) out.push(at(Math.cos(r) * k, Math.sin(r) * k));
    return out;
  };
  return { i, p: brook[i], level: brookLevel[i], down, across, at, stroke };
}

/** A fresh copy of a valley, for tests that change it. */
export const freshValley = (seed = 7) => generateValley(seed, 'summer');

/** Whether two typed arrays hold exactly the same values. */
export function same(a: ArrayLike<number>, b: ArrayLike<number>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
  return true;
}

/** Seed a simulation fixture directly, including its runtime, for tests of operation after placement. */
export function building(s: GameState, kind: ThingKind, x: number, z: number) {
  const t = { id: s.nextId++, kind, x, z, yaw: 0, padTargetY: 0 };
  s.things.push(t);
  return { t, r: must(runtimeOf(s, t.id), kind) };
}

export function fieldAt(s: GameState, crop: Crop, x: number, z: number, radius = 3) {
  const result = apply(s, { type: 'paintField', crop, points: [{ x, z }], radius });
  if (!result.ok) throw new Error(result.error);
  return must(s.fields.find(f => f.crop === crop), crop);
}

// The easternmost cell is tangent to a device placed one service radius (a Sprinkler: half its patch's width) beyond its centre.
export function ribbon(s: GameState) {
  const result = apply(s, { type: 'paintField', crop: 'beans', points: [{ x: -40.5, z: 0.5 }, { x: 39.5, z: 0.5 }], radius: 1.1 });
  if (!result.ok) throw new Error(result.error);
  const f = s.fields[0];
  return { f, tip: { x: cellX(s.grid, f.bounds.x1), z: 0.5 } };
}

// --- Headless playthroughs: building a homestead the way a player might ------------------------------------------------

export const done = (r: Result<Change, string>, what: string): Change => {
  assert.ok(r.ok, r.ok ? '' : `${what}: ${r.error}`);
  return r.value;
};

/** Places a thing at the first free spot spiralling out from `near`. */
export function build(s: GameState, kind: ThingKind, near: Point2, yaw = 0): number {
  for (let r = 0; r <= 20; r++) for (let a = 0; a < 16; a++) {
    const x = near.x + r * Math.cos((a * Math.PI) / 8), z = near.z + r * Math.sin((a * Math.PI) / 8);
    if (canPlace(s, kind, x, z, yaw).ok) return must(done(apply(s, { type: 'place', kind, x, z, yaw }), kind).created, kind);
    if (r === 0) break;
  }
  assert.fail(`no room for a ${kind} near ${near.x}, ${near.z}`);
}

/** The ids of the networks a thing belongs to (an emitter) or draws from (a load). */
function netsOf(s: GameState, id: number): Set<number> {
  const n = networksOf(s), out = new Set<number>();
  const e = n.emitters.findIndex((t) => t.id === id);
  if (e >= 0) out.add(n.emitters[n.netOf[e]].id);
  const l = n.loads.findIndex((t) => t.id === id);
  if (l >= 0) for (const i of n.loadNets[l]) out.add(n.emitters[i].id);
  return out;
}

/** Brings a thing into the water wheel's network, a relay at a time from the network's nearest field. */
export function joinMain(s: GameState, wheel: number, id: number) {
  const t = must(s.things.find((v) => v.id === id), 'the thing');
  for (let tries = 0; tries < 8; tries++) {
    const n = networksOf(s), main = n.emitters[n.netOf[n.emitters.findIndex((e) => e.id === wheel)]].id;
    if (netsOf(s, id).has(main)) return;
    const mains = n.emitters.filter((_e, i) => n.emitters[n.netOf[i]].id === main);
    let best = mains[0], bd = Infinity;
    for (const m of mains) { const d = Math.hypot(m.x - t.x, m.z - t.z); if (d < bd) { bd = d; best = m; } }
    const step = Math.min(13, Math.max(2, bd - 1)), ux = (t.x - best.x) / bd, uz = (t.z - best.z) / bd;
    let placed = false;
    for (let j = 0; j < 60 && !placed; j++) {
      const x = best.x + ux * step + Math.cos(j * 2.4) * j * 0.2, z = best.z + uz * step + Math.sin(j * 2.4) * j * 0.2;
      if (Math.hypot(x - best.x, z - best.z) > 14.5 || !canPlace(s, 'relay', x, z, 0).ok) continue;
      done(apply(s, { type: 'place', kind: 'relay', x, z, yaw: 0 }), 'a relay');
      placed = true;
    }
    assert.ok(placed, 'room for a relay');
  }
  assert.fail(`could not bring thing ${id} into the network`);
}
