import type { Medal } from './sim.ts';
import { BUILDINGS, recipesFor } from './data.ts';
import type { Building, GameState } from './state.ts';

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
    return s?.version === 1 && complete(s) ? s : null;
  } catch {
    return null;
  }
}

const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const nums = (o: unknown) => !!o && typeof o === 'object' && Object.values(o).every(num);
const arr = Array.isArray;

function complete(s: GameState): boolean {
  const m = s.map, st = s.stats;
  return !!s.scenario && typeof s.scenario.id === 'string' && arr(s.scenario.goals) && !!s.scenario.weather && !!s.scenario.terrain
    && !!m && num(m.width) && num(m.height) && arr(m.terrain) && m.terrain.length === m.width * m.height
    && arr(m.fertility) && m.fertility.length === m.width * m.height && m.fertility.every(num) && !!m.depot && num(m.depot.x) && num(m.depot.y)
    && [s.credits, s.time, s.carry, s.nextId, s.earned, s.initialTrees].every(num)
    && (s.completedAt === null || num(s.completedAt))
    && nums(s.delivered) && nums(s.made) && arr(s.reached) && s.reached.length === s.scenario.goals.length
    && !!st && num(st.since) && arr(st.made) && arr(st.delivered) && st.made.length > 0 && st.delivered.length > 0 && st.made.every(nums) && st.delivered.every(nums)
    && arr(s.buildings) && s.buildings.every((b) => validBuilding(b, m.width, m.height));
}

/** A building has what its type's rules read. */
function validBuilding(b: Building, w: number, h: number): boolean {
  if (!b || !num(b.id) || !num(b.x) || !num(b.y) || !(b.type in BUILDINGS) || ![0, 1, 2, 3].includes(b.rot)) return false;
  const n = BUILDINGS[b.type].size;
  if (b.x < 0 || b.y < 0 || b.x + n > w || b.y + n > h) return false;
  switch (b.type) {
    case 'belt': return arr(b.items) && b.items.every((i) => i && num(i.pos) && typeof i.item === 'string');
    case 'splitter': case 'crossing': case 'sorter': return arr(b.transit) && num(b.turn);
    case 'field': return typeof b.crop === 'string' && num(b.growth) && num(b.stored) && num(b.compost);
    case 'hive': return num(b.growth) && num(b.stored);
    case 'battery': return num(b.charge);
    case 'pad': return (b.mode === 'send' || b.mode === 'receive') && arr(b.store) && num(b.waited) && !!b.drone && num(b.drone.t) && arr(b.drone.cargo) && num(b.drone.target);
    case 'sapling': return num(b.age);
  }
  if (recipesFor(b.type).length) return typeof b.recipe === 'string' && nums(b.inputs) && nums(b.outputs) && (b.progress === null || num(b.progress));
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
