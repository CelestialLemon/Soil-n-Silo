import type { Medal } from './sim.ts';
import type { GameState } from './state.ts';

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

function complete(s: GameState): boolean {
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
  const m = s.map;
  return !!s.scenario && typeof s.scenario.id === 'string' && Array.isArray(s.scenario.goals)
    && !!m && num(m.width) && num(m.height) && Array.isArray(m.terrain) && m.terrain.length === m.width * m.height
    && Array.isArray(m.fertility) && m.fertility.length === m.width * m.height
    && Array.isArray(s.buildings) && s.buildings.every((b) => num(b.x) && num(b.y) && num(b.id) && typeof b.type === 'string')
    && num(s.credits) && num(s.time) && num(s.nextId) && !!s.stats && Array.isArray(s.reached);
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
