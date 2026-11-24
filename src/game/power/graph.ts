// The power preview (Milestone 1): which things join a network and which are powered. Power is wireless (decided
// 2026-11-25, docs/ROADMAP.md): each power building and free relay projects a soft field, and no lines run anywhere. No
// watts, no charge yet (Milestone 2).
import type { GameState, PowerState } from '../state.ts';
export { feeds, rangeOf, roleOf, Sets } from './nodes.ts';
import { radiusNetwork } from './radius.ts';

/** The power preview for the state as it stands. */
export const powerFor = (s: GameState): PowerState => radiusNetwork(s);

/** Recomputes the power preview; returns whether it changed. */
export function refreshPower(s: GameState): boolean {
  const next = powerFor(s);
  const changed = JSON.stringify(next) !== JSON.stringify(s.power);
  s.power = next;
  return changed;
}
