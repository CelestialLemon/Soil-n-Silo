// The power preview (Milestone 1): which things join a network and which are powered. Power is wireless (decided
// 2026-11-25, docs/ROADMAP.md): each power building and free relay projects a soft field, and no lines run anywhere. No
// watts, no charge yet (Milestone 2).
import type { ThingKind } from '../catalog.ts';
import type { GameState, PowerState, Thing } from '../state.ts';
export { feeds, rangeOf, roleOf, Sets } from './nodes.ts';
import { radiusNetwork } from './radius.ts';

/** The power preview for the state as it stands. */
export const powerFor = (s: GameState): PowerState => radiusNetwork(s);

/** A thing about to be placed (`ignore` left out) or moved (`ignore`: its id), at its proposed spot. */
export interface PowerCandidate { kind: ThingKind; x: number; z: number; ignore?: number }

/**
 * The power preview as it would stand with the candidate in place: a moved thing taken from its old spot (so nothing
 * still leans on where it was), a new one added. The candidate's own entry carries `id`: its id if moved, else -1.
 * Changes nothing.
 */
export function previewPower(s: GameState, c: PowerCandidate): { power: PowerState; id: number } {
  const id = c.ignore ?? -1, old = s.things.find((t) => t.id === c.ignore);
  const moved: Thing = { id, kind: c.kind, x: c.x, z: c.z, yaw: old?.yaw ?? 0, padTargetY: old?.padTargetY ?? 0 };
  const things = [...s.things.filter((t) => t.id !== c.ignore), moved];
  return { power: powerFor({ ...s, things }), id };
}

/** Recomputes the power preview; returns whether it changed. */
export function refreshPower(s: GameState): boolean {
  const next = powerFor(s);
  const changed = JSON.stringify(next) !== JSON.stringify(s.power);
  s.power = next;
  return changed;
}
