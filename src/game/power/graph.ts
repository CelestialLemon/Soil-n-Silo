// The power preview (Milestone 1): which things join a network and which are powered, in either wiring mode, on the same
// buildings. No watts, no charge yet (Milestone 2).
import type { Change } from '../change.ts';
import { emptyChange } from '../change.ts';
import { err, ok, type Result } from '../result.ts';
import type { GameState, PowerMode, PowerState } from '../state.ts';
export { feeds, rangeOf, roleOf, Sets } from './nodes.ts';
import { pylonNetwork } from './pylons.ts';
import { radiusNetwork } from './radius.ts';

export const POWER_MODES: readonly PowerMode[] = ['pylons', 'wireless'];

/** The power preview for the state's mode. */
export const powerFor = (s: GameState): PowerState => (s.powerMode === 'pylons' ? pylonNetwork(s) : radiusNetwork(s));

/** Recomputes the power preview; returns whether it changed. */
export function refreshPower(s: GameState): boolean {
  const next = powerFor(s);
  const changed = JSON.stringify(next) !== JSON.stringify(s.power);
  s.power = next;
  return changed;
}

/** Switches the wiring mode and recomputes the preview. */
export function setPowerMode(s: GameState, mode: PowerMode): Result<Change, string> {
  if (!POWER_MODES.includes(mode)) return err(`There's no power mode called ${String(mode)}.`);
  s.powerMode = mode;
  const change = emptyChange(s.revision);
  change.powerChanged = refreshPower(s);
  return ok(change);
}
