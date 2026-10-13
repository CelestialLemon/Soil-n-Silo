import { isStop, type Medal } from './sim.ts';
import { bays, BUILDINGS, CROPS, ITEMS, recipesFor, TRUCK } from './data.ts';
import { startedRunLog, type RunLog } from './runlog.ts';
import type { Scenario } from './scenarios.ts';
import type { Building, GameState, Route, Truck } from './state.ts';

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

/** The saved game, or null if there is none, or it's from another version or broken. */
export function deserialize(json: string | null): GameState | null {
  if (!json) return null;
  try {
    const s = JSON.parse(json) as GameState;
    if (s?.version !== 3 || !complete(s)) return null;
    // Saved before the run was logged: it is logged from now on.
    if (s.run === undefined) s.run = startedRunLog(s);
    return validRun(s.run) ? s : null;
  } catch {
    return null;
  }
}

const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const nums = (o: unknown) => !!o && typeof o === 'object' && !Array.isArray(o) && Object.values(o).every(num);
const arr = Array.isArray;
const item = (v: unknown) => typeof v === 'string' && v in ITEMS;
const items = (v: unknown) => arr(v) && v.every(item);
/** Counts by good: every key a good, every value a number. */
const counts = (o: unknown) => nums(o) && Object.keys(o as object).every(item);
/** Goods held: counts that are whole and not negative. */
const stock = (o: unknown) => counts(o) && Object.values(o as object).every((v) => Number.isInteger(v) && v >= 0);
const crop = (v: unknown) => typeof v === 'string' && v in CROPS;
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
    && !!t && [t.soil, t.soilSpread, t.forest, t.rock].every(num) && ['river', 'ponds', 'lake', 'none'].includes(t.water);
}

function complete(s: GameState): boolean {
  const m = s.map, st = s.stats;
  return scenario(s.scenario)
    && !!m && num(m.width) && num(m.height) && arr(m.terrain) && m.terrain.length === m.width * m.height
    && arr(m.fertility) && m.fertility.length === m.width * m.height && m.fertility.every(num)
    && arr(s.soilBase) && s.soilBase.length === m.fertility.length && s.soilBase.every(num) && !!m.depot && num(m.depot.x) && num(m.depot.y)
    && [s.credits, s.time, s.carry, s.nextId, s.earned, s.initialTrees].every(num)
    && (s.completedAt === null || num(s.completedAt))
    && stock(s.delivered) && stock(s.made) && arr(s.reached) && s.reached.length === s.scenario.goals.length
    && !!st && num(st.since) && arr(st.made) && st.made.length > 0 && st.made.every(counts)
    && !!st.delivered && typeof st.delivered === 'object' && Object.entries(st.delivered).every(([k, v]) => item(k) && arr(v) && v.every(num))
    && arr(s.buildings) && s.buildings.every((b) => validBuilding(b, m.width, m.height))
    && arr(s.routes) && s.routes.every(validRoute) && stopsExist(s) && docksFit(s) && arr(s.trucks) && s.trucks.every((t) => validTruck(s, t)) && uniqueIds(s);
}

const int = (v: unknown) => Number.isInteger(v);

const MARKS = ['first', 'night', 'truck', 'second', 'loop', 'goal'];
/** The run's log: milestones, the curve, and seconds by kind of building, problem and night. */
function validRun(r: RunLog): boolean {
  const kinds = (o: unknown) => nums(o) && Object.keys(o as object).every((k) => k in BUILDINGS);
  return !!r && arr(r.marks) && r.marks.every((m) => !!m && num(m.t) && MARKS.includes(m.kind) && (m.item === undefined || item(m.item))
      && (m.type === undefined || m.type in BUILDINGS) && (m.goal === undefined || int(m.goal)) && (m.n === undefined || num(m.n)))
    && num(r.curveFrom) && arr(r.curve) && r.curve.every(num) && kinds(r.time) && nums(r.problems)
    && arr(r.nights) && r.nights.every((n) => !!n && num(n.day) && num(n.short) && arr(n.types) && n.types.every((t) => t in BUILDINGS))
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
    && arr(t.path) && t.path.every((i) => int(i) && i >= 0 && i < w * h) && (t.target === null || num(t.target))
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
  if (!b || !num(b.id) || !num(b.x) || !num(b.y) || !(b.type in BUILDINGS) || !dir(b.rot)) return false;
  const n = BUILDINGS[b.type].size;
  if (b.x < 0 || b.y < 0 || b.x + n > w || b.y + n > h) return false;
  switch (b.type) {
    case 'silo': return stock(b.store);
    case 'field': return crop(b.crop) && (b.harvest === undefined || crop(b.harvest)) && num(b.growth) && num(b.stored) && num(b.compost);
    case 'hive': return num(b.growth) && num(b.stored);
    case 'battery': return num(b.charge);
    case 'sapling': return num(b.age);
  }
  if (recipesFor(b.type).length) {
    return recipesFor(b.type).some((r) => r.id === b.recipe) && stock(b.inputs) && stock(b.outputs) && (b.progress === null || num(b.progress));
  }
  return true;
}

export interface Best { medal: Medal; time: number }
export type Progress = Record<string, Best>;

export function readProgress(json: string | null): Progress {
  try {
    const p = JSON.parse(json ?? '{}');
    return p && typeof p === 'object' ? p as Progress : {};
  } catch {
    return {};
  }
}

const RANK: Record<Medal, number> = { gold: 3, silver: 2, bronze: 1 };

/** Records a finished commission, keeping the better of the old and new results. */
export function recordResult(p: Progress, id: string, medal: Medal, time: number): Progress {
  const old = p[id];
  if (!old || RANK[medal] > RANK[old.medal] || (RANK[medal] === RANK[old.medal] && time < old.time)) return { ...p, [id]: { medal, time } };
  return p;
}
