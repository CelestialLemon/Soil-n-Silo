import { isStop } from './sim/trucks.ts';
import { type Medal } from './sim/stats.ts';
import { bays, BUILDINGS, CROPS, ITEMS, recipesFor, TICK, TRUCK, type BuildingId } from './data.ts';
import { err, ok, tryParseJson, type Result } from './result.ts';
import type { Mark, RunLog } from './runlog.ts';
import type { Scenario } from './scenarios.ts';
import { MAX_LEVEL, spanOf, STEEP } from './relief.ts';
import { TERRAIN } from './map.ts';
import { isMachine, type Building, type GameState, type Route, type Truck } from './state.ts';

// Saving: the commission in progress (one at a time) and each commission's best result. The game state is plain data, so a
// save is its JSON.

export const SAVE_KEY = 'soil-n-silo/v2';

/** The save key for the page at `pathname`. The deployments (`/Soil-n-Silo/main/`, `/Soil-n-Silo/dev/`) share one origin, so
 * each keeps its own save; a game served from the root (the dev server) keeps the plain key. */
export function saveKey(pathname: string): string {
  const dir = pathname.replace(/[^/]*$/, '');
  return dir === '/' ? SAVE_KEY : `${SAVE_KEY}@${dir}`;
}

export const serialize = (s: GameState) => JSON.stringify(s);

/** The saved game, or why it was refused: there is none, or it's from another version or broken. */
export function deserialize(json: string | null): Result<GameState> {
  if (!json) return err('There is no saved game.');
  const parsed = tryParseJson(json);
  if (!parsed.ok) return err(`The save isn't JSON: ${parsed.error}`);
  const s = parsed.value as GameState | null;
  if (s?.version !== 7) return err('The save is from another version (this game reads version 7).');
  if (!complete(s)) return err('The save is broken: its state is incomplete or out of range.');
  if (!validRun(s.run, s.scenario.goals.length)) return err('The save is broken: its run log is incomplete or out of range.');
  return ok(s);
}

const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const nums = (o: unknown) => !!o && typeof o === 'object' && !Array.isArray(o) && Object.values(o).every(num);
const arr = Array.isArray;
const known = (o: object, v: unknown) => typeof v === 'string' && Object.hasOwn(o, v);
const item = (v: unknown) => known(ITEMS, v);
const items = (v: unknown) => arr(v) && v.every(item);
/** Counts by good: every key a good, every value a number. */
const counts = (o: unknown) => nums(o) && Object.keys(o as object).every(item);
/** Goods held: counts that are whole and not negative. */
const stock = (o: unknown) => counts(o) && Object.values(o as object).every((v) => Number.isInteger(v) && v >= 0);
const crop = (v: unknown) => known(CROPS, v);
const type = (v: unknown) => known(BUILDINGS, v);
const dir = (v: unknown) => v === 0 || v === 1 || v === 2 || v === 3;
const goal = (g: { kind?: string; item?: unknown; n?: unknown; perMin?: unknown; min?: unknown }) =>
  !!g && ((g.kind === 'deliver' && item(g.item) && num(g.n)) || (g.kind === 'rate' && item(g.item) && num(g.perMin)) || (g.kind === 'soil' && num(g.min)));

const str = (v: unknown) => typeof v === 'string';

/** The scenario's fields the simulation and the HUD read. */
function scenario(sc: Scenario): boolean {
  const w = sc?.weather, t = sc?.terrain;
  return !!sc && str(sc.id) && str(sc.name) && str(sc.blurb) && [sc.seed, sc.width, sc.height, sc.credits, sc.par].every(num)
    && arr(sc.tags) && sc.tags.every(str) && (sc.tips === undefined || (arr(sc.tips) && sc.tips.every(str)))
    && arr(sc.goals) && sc.goals.every(goal)
    && !!w && [w.sunrise, w.sunset, w.sun, w.wind, w.gust].every(num)
    && !!t && [t.soil, t.soilSpread, t.forest, t.rock, t.relief].every(num) && t.relief >= 0 && t.relief <= 1 && ['river', 'ponds', 'lake', 'none'].includes(t.water);
}

/** Whether a map's corners are ground the rules allow: no tile steeper than STEEP, water flat. */
function relief(m: GameState['map']) {
  for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
    const span = spanOf(m, x, y);
    if (span > STEEP || (m.terrain[y * m.width + x] === TERRAIN.water && span)) return false;
  }
  return true;
}

function complete(s: GameState): boolean {
  const m = s.map, st = s.stats;
  return scenario(s.scenario)
    && !!m && int(m.width) && int(m.height) && m.width > 0 && m.height > 0 && m.width === s.scenario.width && m.height === s.scenario.height
    && arr(m.terrain) && m.terrain.length === m.width * m.height
    && arr(m.fertility) && m.fertility.length === m.width * m.height && m.fertility.every(num)
    && arr(m.corner) && m.corner.length === m.width * m.height * 4 && m.corner.every((c) => int(c) && c >= 0 && c <= MAX_LEVEL)
    && arr(m.current) && m.current.length === m.width * m.height && m.current.every((c) => num(c) && c >= 0)
    && relief(m)
    && arr(s.soilBase) && s.soilBase.length === m.fertility.length && s.soilBase.every(num) && !!m.depot && num(m.depot.x) && num(m.depot.y)
    && [s.credits, s.time, s.carry, s.nextId, s.earned, s.initialTrees].every(num) && Math.abs(s.carry) <= TICK
    && (s.completedAt === null || num(s.completedAt))
    && stock(s.delivered) && stock(s.made) && arr(s.reached) && s.reached.length === s.scenario.goals.length
    && !!st && num(st.since) && arr(st.made) && st.made.length > 0 && st.made.every(counts)
    && !!st.delivered && typeof st.delivered === 'object' && Object.entries(st.delivered).every(([k, v]) => item(k) && arr(v) && v.every(num))
    && validChosen(s.chosen)
    && arr(s.buildings) && s.buildings.every((b) => validBuilding(b, m.width, m.height))
    && arr(s.routes) && s.routes.every(validRoute) && stopsExist(s) && arr(s.trucks) && s.trucks.every((t) => validTruck(s, t)) && docksFit(s) && uniqueIds(s);
}

const int = (v: unknown) => Number.isInteger(v);

/** The choices remembered for placing: a crop, and for each building a recipe it works. */
function validChosen(c: GameState['chosen']): boolean {
  return !!c && crop(c.crop) && !!c.recipes && typeof c.recipes === 'object' && !arr(c.recipes)
    && Object.entries(c.recipes).every(([k, v]) => type(k) && recipesFor(k as BuildingId).some((r) => r.id === v));
}

const MARKS = ['first', 'night', 'truck', 'second', 'loop', 'goal'];
/** The run's log: milestones (each with what its kind needs), the curve, and seconds by kind of building, problem and night. */
function validRun(r: RunLog, goals: number): boolean {
  const kinds = (o: unknown) => nums(o) && Object.keys(o as object).every((k) => k in BUILDINGS);
  const needs = (m: Mark) => (m.kind === 'first' || m.kind === 'loop' ? m.item !== undefined : m.kind === 'second' ? m.type !== undefined
    : m.kind === 'goal' ? m.goal !== undefined && m.goal >= 0 && m.goal < goals : true);
  return !!r && arr(r.marks) && r.marks.every((m) => !!m && num(m.t) && MARKS.includes(m.kind) && (m.item === undefined || item(m.item))
      && (m.type === undefined || type(m.type)) && (m.goal === undefined || int(m.goal)) && (m.n === undefined || num(m.n)) && needs(m))
    && num(r.curveStep) && r.curveStep > 0 && arr(r.curve) && r.curve.every(num) && kinds(r.time) && nums(r.problems)
    && arr(r.nights) && r.nights.every((n) => !!n && num(n.day) && num(n.short) && arr(n.types) && n.types.every(type))
    && !!r.trucks && num(r.trucks.total) && num(r.trucks.wait) && kinds(r.trucks.at);
}

/** A route: stops at buildings (each good dropped or picked up, never both), with a wait in range. */
function validRoute(r: Route): boolean {
  return !!r && num(r.id) && str(r.name) && arr(r.moved) && r.moved.every(num) && arr(r.stops) && r.stops.length <= TRUCK.maxStops
    && r.stops.every((st) => !!st && num(st.building) && items(st.drop) && items(st.pick) && !st.drop.some((i) => st.pick.includes(i))
      && num(st.wait) && st.wait >= 0 && st.wait <= TRUCK.maxWait && int(st.turn) && st.turn >= 0);
}

/** No building has more trucks docked than it has bays. */
function docksFit(s: GameState): boolean {
  const n = new Map<number, number>();
  for (const t of s.trucks) if (t.phase === 'dock' && t.target !== null) n.set(t.target, (n.get(t.target) ?? 0) + 1);
  return [...n].every(([id, k]) => { const b = s.buildings.find((x) => x.id === id); return !!b && k <= bays(b.type); });
}

/** Every stop is at a building there is, one trucks stop at. */
function stopsExist(s: GameState): boolean {
  const byId = new Map(s.buildings.map((b) => [b.id, b]));
  return s.routes.every((r) => r.stops.every((st) => { const b = byId.get(st.building); return !!b && isStop(b); }));
}

const PHASES = ['parked', 'charge', 'drive', 'queue', 'dock', 'stuck'];
/** A truck: at home in a garage there is, on the map, with a route there is (or none) and a cargo it can carry. */
function validTruck(s: GameState, t: Truck): boolean {
  const { width: w, height: h } = s.map;
  return !!t && num(t.id) && s.buildings.some((b) => b.id === t.garage && b.type === 'garage')
    && (t.route === null || s.routes.some((r) => r.id === t.route)) && int(t.stop) && t.stop >= 0 && PHASES.includes(t.phase)
    && [t.x, t.y, t.heading, t.energy, t.idle, t.budget, t.arrived].every(num) && t.x >= 0 && t.y >= 0 && t.x <= w && t.y <= h
    && t.energy >= 0 && t.energy <= TRUCK.battery && typeof t.charged === 'boolean'
    && t.idle >= 0 && t.budget >= 0 && t.budget <= 2
    && arr(t.path) && t.path.every((i) => int(i) && i >= 0 && i < w * h) && int(t.from) && t.from >= 0 && t.from < w * h && (t.target === null || num(t.target))
    // Driving, queuing or docked, it is going to or at a building; queuing or docked, at a stop of its route.
    && (!['drive', 'queue', 'dock'].includes(t.phase) || t.target !== null) && (!['queue', 'dock'].includes(t.phase) || t.route !== null)
    && items(t.cargo) && t.cargo.length <= TRUCK.cargo;
}

/** Buildings, routes and trucks share one count of ids, below the next one. */
function uniqueIds(s: GameState): boolean {
  const ids = [...s.buildings, ...s.routes, ...s.trucks].map((x) => x.id);
  // Whole and above 0: the building cache marks an empty tile with 0.
  return int(s.nextId) && new Set(ids).size === ids.length && ids.every((id) => int(id) && id > 0 && id < s.nextId);
}

/** A building has what its type's rules read. */
function validBuilding(b: Building, w: number, h: number): boolean {
  if (!b || !num(b.id) || !num(b.x) || !num(b.y) || !type(b.type) || !dir(b.rot)) return false;
  const n = BUILDINGS[b.type].size;
  if (b.x < 0 || b.y < 0 || b.x + n > w || b.y + n > h) return false;
  switch (b.type) {
    case 'silo': return stock(b.store);
    case 'field': return crop(b.crop) && (b.harvest === undefined || crop(b.harvest)) && num(b.growth) && num(b.stored);
    case 'hive': return num(b.growth) && num(b.stored);
    case 'battery': return num(b.charge);
    case 'sapling': return num(b.age);
  }
  // A machine's recipe is one it makes (the rules look recipes up by id).
  if (isMachine(b)) {
    return recipesFor(b.type).some((r) => r.id === b.recipe) && stock(b.inputs) && stock(b.outputs) && (b.progress === null || num(b.progress));
  }
  return true;
}

export interface Best { medal: Medal; time: number }
export type Progress = Record<string, Best>;

export function readProgress(json: string | null): Progress {
  const p = tryParseJson(json ?? '{}');
  return p.ok && p.value && typeof p.value === 'object' ? p.value as Progress : {};
}

const RANK: Record<Medal, number> = { gold: 3, silver: 2, bronze: 1 };

/** Records a finished commission, keeping the better of the old and new results. */
export function recordResult(p: Progress, id: string, medal: Medal, time: number): Progress {
  const old = p[id];
  if (!old || RANK[medal] > RANK[old.medal] || (RANK[medal] === RANK[old.medal] && time < old.time)) return { ...p, [id]: { medal, time } };
  return p;
}
