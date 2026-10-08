import { DEPTH, WIDTH } from './layout.ts';
import { BACKPACK, HOTBAR, SAVE_VERSION, type GameState } from './state.ts';

// One save slot (design doc: no multiple save slots). The game state is plain data, so a save is its JSON. The game saves
// each morning, after the night's steps, and when the page is hidden.

export const SAVE_KEY = 'soil-n-silo/save';

/** The save key for the page at `pathname`. The deployments (`/Soil-n-Silo/main/`, `/Soil-n-Silo/dev/`) share one origin, so
 * each keeps its own save; a game served from the root (the dev server) keeps the plain key. */
export function saveKey(pathname: string): string {
  const dir = pathname.replace(/[^/]*$/, '');
  return dir === '/' ? SAVE_KEY : `${SAVE_KEY}@${dir}`;
}

export const serialize = (s: GameState) => JSON.stringify(s);

/** The saved game, or null if there is none or it is from an incompatible version or broken. */
export function deserialize(json: string | null): GameState | null {
  if (!json) return null;
  try {
    const s = JSON.parse(json) as GameState;
    return s?.version === SAVE_VERSION && complete(s) ? s : null;
  } catch {
    return null;
  }
}

/** Every field the game reads is there, with the right type (a save edited by hand or cut short is refused). */
function complete(s: GameState): boolean {
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
  const arr = Array.isArray, bool = (v: unknown) => typeof v === 'boolean';
  const c = s.clock, coop = s.coop;
  return num(s.rng) && num(s.gold) && num(s.earned) && num(s.selected) && num(s.nextId) && bool(s.seasonOver) && bool(s.resultsSeen)
    && !!c && num(c.day) && num(c.hour) && bool(c.paused)
    && arr(s.inventory) && s.inventory.length === HOTBAR + BACKPACK
    && arr(s.tiles) && s.tiles.length === WIDTH * DEPTH
    && !!coop && arr(coop.chickens) && arr(coop.eggs) && num(coop.trough) && num(coop.manure) && bool(coop.doorOpen) && bool(coop.outsideToday)
    && arr(s.machines) && arr(s.bin) && arr(s.history);
}
