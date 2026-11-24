// Free placement: buildings and props go anywhere on clear, gentle ground at any rotation. Buildings settle a soft pad
// into the slope (earth.ts); the water wheel stands on a brook's bank with its wheel in the flowing water.
import { CATALOG, isThingKind, RACE_START, type ThingKind } from './catalog.ts';
import type { Change } from './change.ts';
import { CHANNEL_REACH, coreObb, padTarget, RILL_HALF, thingObb, thingRect, TRACK_HALF } from './earth.ts';
import { obbCorners, obbDistance, obbSamples, obbsOverlap, pathBounds, polylineDistance, toWorld, wrapAngle } from './geom.ts';
import { BUILD_HALF, cellIx, cellIz, COVER, isWet, sampleHeight, unionRect } from './grid.ts';
import { err, ok, type Result } from './result.ts';
import { settle } from './settle.ts';
import { type GameState, type Thing, takeId } from './state.ts';

/** How much room things keep between them, m. */
const GAP = 0.3;
/** How close a thing may stand to a tree's trunk (times its scale), m. */
const TRUNK = 1;
/** How close to a hedge's line, m. */
const HEDGE_CLEAR = 0.6;
/** The least depth of water under a water wheel, m. */
const RACE_DEPTH = 0.3;
/** The least speed of the water a wheel turns in, m/s: a brook, not the still pond. */
const RACE_FLOW = 0.05;

const near = (path: readonly { x: number; z: number }[], x: number, z: number, r: number) => {
  const b = pathBounds(path, r);
  return x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && polylineDistance(x, z, path).d <= r;
};

/** Whether a thing of this kind may stand here, facing `yaw`; `ignore` is a thing being moved. Says why not. */
export function canPlace(s: GameState, kind: ThingKind, x: number, z: number, yaw: number, ignore?: number): Result<void, string> {
  if (!isThingKind(kind)) return err(`There's nothing called ${String(kind)} to build.`);
  if (![x, z, yaw].every(Number.isFinite)) return err('That spot is off the map.');
  const def = CATALOG[kind], g = s.grid, others = s.things.filter((t) => t.id !== ignore);
  if (def.oneOfEach && others.some((t) => t.kind === kind)) return err(`There's already a ${def.label}: the homestead has one of each.`);
  const at = { kind, x, z, yaw }, full = thingObb(at), core = coreObb(at);
  if (obbCorners(full).some((p) => Math.abs(p.x) > BUILD_HALF || Math.abs(p.z) > BUILD_HALF)) return err("That's too close to the valley's edge.");

  // The ground under its core: dry, open, gentle.
  let lo = Infinity, hi = -Infinity;
  for (const p of obbSamples(core, 0.75)) {
    const i = cellIz(g, p.z) * g.nx + cellIx(g, p.x);
    if (isWet(g.baseWaterLevel[i])) return err(def.onBank ? "The wheel's house must stand on the dry bank." : "That's in the water.");
    const c = g.baseCover[i];
    if (c === COVER.rock) return err('There is rock in the way.');
    if (c === COVER.woods) return err("That's in the woods.");
    const h = sampleHeight(g, g.baseHeight, p.x, p.z);
    lo = Math.min(lo, h); hi = Math.max(hi, h);
  }
  if ((hi - lo) / (2 * Math.max(def.core.halfW, def.core.halfD)) > def.maxSlope) return err('The ground is too steep here.');

  // Its whole footprint: clear of rills, tracks, hedges, fields, rocks, trees and other things.
  for (const p of obbSamples(full, 0.75)) {
    const inRace = def.onBank && localZ(at, p) > RACE_START;
    for (const c of s.channels) if (near(c.path, p.x, p.z, inRace ? 0 : RILL_HALF + GAP)) return err('A rill runs there.');
    for (const t of s.tracks) if (near(t.path, p.x, p.z, TRACK_HALF + GAP)) return err("That's on a track.");
    for (const h of s.hedges) if (near(h.path, p.x, p.z, HEDGE_CLEAR)) return err('A hedge is in the way.');
    if (!def.allowOnField && !inRace && g.fieldOf[cellIz(g, p.z) * g.nx + cellIx(g, p.x)] !== 0) return err("That's on a field: clear it first, or build beside it.");
  }
  for (const c of s.crags) if (obbDistance(full, c.x, c.z) <= c.radius) return err('There is rock in the way.');
  for (const t of [...s.wildTrees, ...s.plantedTrees]) if (obbDistance(full, t.x, t.z) <= TRUNK * t.scale) return err('A tree is in the way.');
  for (const t of others) if (obbsOverlap(full, thingObb(t), GAP / 2)) return err(`That would overlap the ${CATALOG[t.kind].label}.`);
  // A settled pad mustn't press into a rill's cut.
  if (def.padEase > 0) for (const c of s.channels) {
    if (c.path.some((p) => obbDistance(core, p.x, p.z) <= CHANNEL_REACH)) return err('A rill runs too close.');
  }

  if (def.onBank) {
    const race = raceCheck(s, at);
    if (!race.ok) return race;
  }
  return ok(undefined);
}

const localZ = (t: { x: number; z: number; yaw: number }, p: { x: number; z: number }) =>
  (p.x - t.x) * Math.sin(t.yaw) + (p.z - t.z) * Math.cos(t.yaw);

/** A water wheel's race: its wheel must turn in the flowing brook, deep enough, in front of its house. */
function raceCheck(s: GameState, t: { kind: ThingKind; x: number; z: number; yaw: number }): Result<void, string> {
  const g = s.grid, def = CATALOG[t.kind];
  for (const lz of [def.raceOffset - 1, def.raceOffset, def.raceOffset + 1]) {
    const p = toWorld(t.x, t.z, t.yaw, 0, lz), i = cellIz(g, p.z) * g.nx + cellIx(g, p.x);
    const level = g.baseWaterLevel[i];
    if (!isWet(level)) return err('The wheel must reach into the brook: face it toward the water.');
    if (Math.hypot(g.baseFlowX[i], g.baseFlowZ[i]) < RACE_FLOW) return err('The wheel needs flowing water, not the still pond.');
    if (lz === def.raceOffset && level - sampleHeight(g, g.baseHeight, p.x, p.z) < RACE_DEPTH) return err('The brook is too shallow there for the wheel.');
  }
  return ok(undefined);
}

/**
 * A facing for a water wheel at (x, z): toward the nearest flowing brook within reach, turned a little either way to find
 * one where it fits. Undefined when no brook is near.
 */
export function suggestWaterWheelYaw(s: GameState, x: number, z: number): number | undefined {
  const g = s.grid, reach = 10;
  let best: { d: number; x: number; z: number } | undefined;
  const ix0 = cellIx(g, x - reach), ix1 = cellIx(g, x + reach), iz0 = cellIz(g, z - reach), iz1 = cellIz(g, z + reach);
  for (let iz = iz0; iz <= iz1; iz++) for (let ix = ix0; ix <= ix1; ix++) {
    const i = iz * g.nx + ix;
    if (!isWet(g.baseWaterLevel[i]) || Math.hypot(g.baseFlowX[i], g.baseFlowZ[i]) < RACE_FLOW) continue;
    const cx = g.x0 + (ix + 0.5) * g.cell, cz = g.z0 + (iz + 0.5) * g.cell, d = Math.hypot(cx - x, cz - z);
    if (d <= reach && (!best || d < best.d)) best = { d, x: cx, z: cz };
  }
  if (!best) return undefined;
  const facing = Math.atan2(best.x - x, best.z - z);
  for (let k = 0; k <= 9; k++) for (const sign of k === 0 ? [1] : [1, -1]) {
    const yaw = wrapAngle(facing + sign * k * (Math.PI / 36));
    if (canPlace(s, 'waterwheel', x, z, yaw).ok) return yaw;
  }
  return wrapAngle(facing);
}

/** Places a thing. */
export function placeThing(s: GameState, kind: ThingKind, x: number, z: number, yaw: number): Result<Change, string> {
  const can = canPlace(s, kind, x, z, yaw);
  if (!can.ok) return can;
  const id = takeId(s), t: Thing = { id, kind, x, z, yaw: wrapAngle(yaw), padTargetY: 0 };
  t.padTargetY = padTarget(s.grid, t);
  s.things.push(t);
  return ok(settle(s, { earth: thingRect(s.grid, t), things: [id], created: id }));
}

/** Moves (and optionally turns) a thing. */
export function moveThing(s: GameState, id: number, x: number, z: number, yaw?: number): Result<Change, string> {
  const t = s.things.find((v) => v.id === id);
  if (!t) return err('There is nothing there to move.');
  const turn = yaw ?? t.yaw;
  const can = canPlace(s, t.kind, x, z, turn, id);
  if (!can.ok) return can;
  const before = thingRect(s.grid, t);
  t.x = x; t.z = z; t.yaw = wrapAngle(turn);
  t.padTargetY = padTarget(s.grid, t);
  return ok(settle(s, { earth: unionRect(before, thingRect(s.grid, t)), things: [id] }));
}

/** Turns a thing where it stands. */
export function rotateThing(s: GameState, id: number, yaw: number): Result<Change, string> {
  const t = s.things.find((v) => v.id === id);
  if (!t) return err('There is nothing there to turn.');
  return moveThing(s, id, t.x, t.z, yaw);
}

/** Removes a thing; its ground goes back to the valley as it was. */
export function removeThing(s: GameState, id: number): Result<Change, string> {
  const k = s.things.findIndex((v) => v.id === id);
  if (k < 0) return err('There is nothing there to remove.');
  const [t] = s.things.splice(k, 1);
  return ok(settle(s, { earth: thingRect(s.grid, t), things: [id] }));
}
