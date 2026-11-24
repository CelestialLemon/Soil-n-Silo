// Tracks, hedgerows and planted trees: drawn as smooth splines (tracks, hedges) or dropped where the player clicks (trees).
// Tracks paint their cover onto the land and bridge every brook and rill they cross (bridges.ts).
import { checkCrossings } from './bridges.ts';
import { CATALOG } from './catalog.ts';
import type { Change } from './change.ts';
import { RILL_HALF, thingObb, trackRect } from './earth.ts';
import { catmullRom, obbDistance, pathLength, type Point2, polylineDistance } from './geom.ts';
import { BUILD_HALF, cellIx, cellIz, COVER, heightAt, isWet, slopeAt } from './grid.ts';
import { err, ok, type Result } from './result.ts';
import { settle } from './settle.ts';
import { type GameState, takeId, type Track, type Tree, TREE_SPECIES, type TreeSpecies } from './state.ts';

/** The spacing of tracks' and hedges' centreline samples, m. */
export const PATH_SPACING = 0.5;
/** The steepest grade a track climbs. */
export const MAX_GRADE = 0.3;
export const MIN_TRACK = 2;
const TRUNK = 1;
/** A sapling's size against a grown tree's. */
export const SAPLING_SCALE = 0.6;
/** How many cells round the water its carved bank lip reaches (a bridge's ends rest there). */
const BANK_LIP = 1;
/** How close planted trees may stand to each other and other trees, m. */
const TREE_SPACING = 1.5;

export const trackPath = (points: readonly Point2[]) => catmullRom(points, PATH_SPACING);

const blockedByThings = (s: GameState, p: Point2, margin: number) =>
  s.things.find((t) => obbDistance(thingObb(t), p.x, p.z) <= margin);

/** Whether a track may run along this centreline. */
export function canTrack(s: GameState, path: readonly Point2[]): Result<void, string> {
  if (path.length < 2 || pathLength(path) < MIN_TRACK) return err('Drag a little further to lay a track.');
  const g = s.grid;
  for (const p of path) {
    if (Math.abs(p.x) > BUILD_HALF + 1 || Math.abs(p.z) > BUILD_HALF + 1) return err("A track can't leave the valley.");
    const c = g.baseCover[cellIz(g, p.z) * g.nx + cellIx(g, p.x)];
    if (c === COVER.rock) return err('There is rock in the way.');
    if (c === COVER.woods) return err('The woods are in the way.');
    const t = blockedByThings(s, p, 0.6);
    if (t) return err(`The ${CATALOG[t.kind].label} is in the way.`);
    for (const k of s.crags) if (Math.hypot(p.x - k.x, p.z - k.z) <= k.radius + 0.6) return err('There is rock in the way.');
    for (const t2 of [...s.wildTrees, ...s.plantedTrees]) if (Math.hypot(p.x - t2.x, p.z - t2.z) <= TRUNK * t2.scale + 0.6) return err('A tree is in the way.');
  }
  // Grade, measured over 2 m steps on dry ground: bridges carry it over water and rills, and their bank lips.
  const nearWater = (p: Point2) => {
    const ix = cellIx(g, p.x), iz = cellIz(g, p.z);
    for (let dz = -BANK_LIP; dz <= BANK_LIP; dz++) for (let dx = -BANK_LIP; dx <= BANK_LIP; dx++) {
      const cx = ix + dx, cz = iz + dz;
      if (cx >= 0 && cz >= 0 && cx < g.nx && cz < g.nz && isWet(g.baseWaterLevel[cz * g.nx + cx])) return true;
    }
    return s.channels.some((ch) => polylineDistance(p.x, p.z, ch.path).d <= RILL_HALF + 1);
  };
  for (let i = 4; i < path.length; i += 2) {
    const a = path[i - 4], b = path[i];
    if (nearWater(a) || nearWater(b)) continue;
    const grade = Math.abs(heightAt(g, b.x, b.z) - heightAt(g, a.x, a.z)) / Math.hypot(b.x - a.x, b.z - a.z);
    if (grade > MAX_GRADE) return err('Too steep for a track: follow the slope round.');
  }
  return checkCrossings(s, path);
}

export function addTrack(s: GameState, points: readonly Point2[]): Result<Change, string> {
  const path = trackPath(points);
  const can = canTrack(s, path);
  if (!can.ok) return can;
  const id = takeId(s), t: Track = { id, points: points.map((p) => ({ x: p.x, z: p.z })), path };
  s.tracks.push(t);
  return ok(settle(s, { cover: trackRect(s.grid, t), tracks: [id], created: id }));
}

export function removeTrack(s: GameState, id: number): Result<Change, string> {
  const k = s.tracks.findIndex((t) => t.id === id);
  if (k < 0) return err('There is no track there to remove.');
  const [t] = s.tracks.splice(k, 1);
  return ok(settle(s, { cover: trackRect(s.grid, t), tracks: [id] }));
}

export function addHedge(s: GameState, points: readonly Point2[]): Result<Change, string> {
  const path = catmullRom(points, PATH_SPACING), g = s.grid;
  if (path.length < 2 || pathLength(path) < 1) return err('Drag a little further to plant a hedge.');
  for (const p of path) {
    if (Math.abs(p.x) > BUILD_HALF + 1 || Math.abs(p.z) > BUILD_HALF + 1) return err("A hedge can't leave the valley.");
    const c = g.cover[cellIz(g, p.z) * g.nx + cellIx(g, p.x)];
    if (c === COVER.water || c === COVER.rill) return err("A hedge can't grow in water.");
    if (c === COVER.rock) return err('There is rock in the way.');
    if (c === COVER.track) return err('A track runs there.');
    const t = blockedByThings(s, p, 0.5);
    if (t) return err(`The ${CATALOG[t.kind].label} is in the way.`);
    for (const k of s.crags) if (Math.hypot(p.x - k.x, p.z - k.z) <= k.radius + 0.5) return err('There is rock in the way.');
  }
  const id = takeId(s);
  s.hedges.push({ id, points: points.map((p) => ({ x: p.x, z: p.z })), path });
  return ok(settle(s, { hedges: [id], created: id }));
}

export function removeHedge(s: GameState, id: number): Result<Change, string> {
  const k = s.hedges.findIndex((h) => h.id === id);
  if (k < 0) return err('There is no hedge there to remove.');
  s.hedges.splice(k, 1);
  return ok(settle(s, { hedges: [id] }));
}

/** Whether a tree may be planted here. */
export function canPlant(s: GameState, x: number, z: number): Result<void, string> {
  const g = s.grid;
  if (!Number.isFinite(x) || !Number.isFinite(z) || Math.abs(x) > BUILD_HALF || Math.abs(z) > BUILD_HALF) return err("That's outside the valley.");
  const i = cellIz(g, z) * g.nx + cellIx(g, x), c = g.cover[i];
  if (c === COVER.water || c === COVER.rill) return err("A tree can't grow in water.");
  if (c === COVER.rock) return err('There is rock there.');
  if (c === COVER.track) return err('A track runs there.');
  if (c === COVER.field) return err("That's on a field.");
  if (slopeAt(g, x, z) > 0.6) return err('Too steep for a tree.');
  const t = blockedByThings(s, { x, z }, 0.8);
  if (t) return err(`The ${CATALOG[t.kind].label} is in the way.`);
  for (const k of s.crags) if (Math.hypot(x - k.x, z - k.z) <= k.radius + 0.5) return err('There is rock there.');
  for (const t2 of [...s.wildTrees, ...s.plantedTrees]) if (Math.hypot(x - t2.x, z - t2.z) < TREE_SPACING) return err('Too close to another tree.');
  return ok(undefined);
}

export function plantTree(s: GameState, x: number, z: number, species: TreeSpecies = 'oak'): Result<Change, string> {
  if (!TREE_SPECIES.includes(species)) return err(`There's no tree called ${String(species)}.`);
  const can = canPlant(s, x, z);
  if (!can.ok) return can;
  const id = takeId(s);
  const tree: Tree = { id, x, z, species, scale: SAPLING_SCALE, seed: (s.seed ^ Math.imul(id, 0x9e3779b1)) >>> 0, planted: true };
  s.plantedTrees.push(tree);
  return ok(settle(s, { trees: [id], created: id }));
}

export function removeTree(s: GameState, id: number): Result<Change, string> {
  const k = s.plantedTrees.findIndex((t) => t.id === id);
  if (k < 0) return err(s.wildTrees.some((t) => t.id === id) ? 'Wild trees stay: the valley keeps them.' : 'There is no tree there.');
  s.plantedTrees.splice(k, 1);
  return ok(settle(s, { trees: [id] }));
}
