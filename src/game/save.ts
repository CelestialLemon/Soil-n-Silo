import { DEPTH, WIDTH } from './layout.ts';
import { SAVE_VERSION, type GameState } from './state.ts';

// One save slot (design doc: no multiple save slots). The game state is plain data, so a save is its JSON. The game saves
// each morning, after the night's steps, and when the page is hidden.

export const SAVE_KEY = 'soil-n-silo/save';

export const serialize = (s: GameState) => JSON.stringify(s);

/** The saved game, or null if there is none or it is from an incompatible version or broken. */
export function deserialize(json: string | null): GameState | null {
  if (!json) return null;
  try {
    const s = JSON.parse(json) as GameState;
    if (s?.version !== SAVE_VERSION || !Array.isArray(s.inventory) || !Array.isArray(s.tiles) || s.tiles.length !== WIDTH * DEPTH || !s.clock || !s.coop) return null;
    return s;
  } catch {
    return null;
  }
}
