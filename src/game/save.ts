import type { Medal } from './sim.ts';
import { BUILDINGS, CROPS, DRONE, ITEMS, recipesFor } from './data.ts';
import type { Scenario } from './scenarios.ts';
import type { Building, Drone, GameState } from './state.ts';

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
    return s?.version === 2 && complete(s) ? s : null;
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
    && arr(s.buildings) && s.buildings.every((b) => validBuilding(b, m.width, m.height)) && tasksFit(s.buildings);
}

/** Every drone's task flies to the kind of building it works with, if that building is still there. */
function tasksFit(buildings: Building[]): boolean {
  const byId = new Map(buildings.map((b) => [b.id, b]));
  return buildings.every((si) => si.type !== 'silo' || si.drones!.every((d) => {
    const t = d.task, b = t ? byId.get(t.target) : undefined;
    if (!t || !b) return true;
    if (t.kind === 'fetch') return b.type === 'silo' && b !== si;
    if (t.kind === 'sell') return b.type === 'depot';
    if (t.kind === 'feed') return b.type === 'field' || !!b.recipe;
    return b.type === 'field' || b.type === 'hive' || !!b.recipe;
  }));
}

const TASKS = ['feed', 'collect', 'fetch', 'sell'];
const PHASES = ['idle', 'charge', 'out', 'work', 'recharge', 'back'];
/** A drone is idle with nothing, or has a whole task. */
function drone(d: Drone): boolean {
  if (!d || !PHASES.includes(d.phase) || !num(d.t) || !num(d.energy) || d.energy < 0 || !items(d.cargo) || d.cargo.length > DRONE.cargo) return false;
  const t = d.task;
  if (d.phase === 'idle') return t === null && !d.cargo.length;
  return !!t && TASKS.includes(t.kind) && [t.target, t.tx, t.ty].every(num) && item(t.item)
    && Number.isInteger(t.n) && t.n >= 0 && t.n <= DRONE.cargo && (t.kind === 'sell' || t.kind === 'feed' || t.n > 0)
    // A drone collecting or fetching flies out empty, and brings back no more than it went for.
    && ((t.kind !== 'collect' && t.kind !== 'fetch') || (d.phase === 'recharge' || d.phase === 'back' ? d.cargo.length <= t.n : !d.cargo.length));
}

/** A building has what its type's rules read. */
function validBuilding(b: Building, w: number, h: number): boolean {
  if (!b || !num(b.id) || !num(b.x) || !num(b.y) || !(b.type in BUILDINGS) || !dir(b.rot)) return false;
  const n = BUILDINGS[b.type].size;
  if (b.x < 0 || b.y < 0 || b.x + n > w || b.y + n > h) return false;
  switch (b.type) {
    case 'silo': return stock(b.store) && counts(b.shared) && num(b.waited) && arr(b.drones) && b.drones.length > 0 && b.drones.every(drone);
    case 'depot': return !!b.sell && typeof b.sell === 'object' && !arr(b.sell) && Object.entries(b.sell).every(([k, v]) => item(k) && (v === 'spare' || v === 'half'));
    case 'field': return crop(b.crop) && (b.harvest === undefined || crop(b.harvest)) && num(b.growth) && num(b.stored) && num(b.compost) && items(b.refuse);
    case 'hive': return num(b.growth) && num(b.stored);
    case 'battery': return num(b.charge);
    case 'sapling': return num(b.age);
  }
  if (recipesFor(b.type).length) {
    return recipesFor(b.type).some((r) => r.id === b.recipe) && stock(b.inputs) && stock(b.outputs) && (b.progress === null || num(b.progress)) && items(b.refuse);
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
