// After an edit: rebuild what it touched and everything that follows from it, in order (the land, then the water in the
// rills, the wet banks, the fields' moisture, the bridges and the power preview, and whether Steady Homestead starts
// over), and say what changed.
import { resetSteadyOnSetupChange } from './brief.ts';
import { recomputeBridges } from './bridges.ts';
import { type Change, emptyChange } from './change.ts';
import { recomposeCover, recomposeEarth } from './earth.ts';
import { type FieldEdit, noteFields, pruneFields, updateFieldMoisture } from './fields.ts';
import { composeWater, refreshWater } from './flow.ts';
import { appliedSurge, floodMoved, markFloodedFields } from './flood.ts';
import { clampRect, type Rect, unionRect } from './grid.ts';
import { refreshPower } from './power/graph.ts';
import type { GameState } from './state.ts';
import { refreshWet } from './wet.ts';

export interface Edit {
  /** Cells whose heights and covers to rebuild (old ∪ new reach). */
  earth?: Rect;
  /** Cells whose covers alone to rebuild. */
  cover?: Rect;
  /** The rills changed: re-solve the water even if no land moved. */
  water?: boolean;
  fields?: FieldEdit;
  things?: number[]; channels?: number[]; tracks?: number[]; hedges?: number[]; trees?: number[];
  created?: number;
}

export function settle(s: GameState, e: Edit): Change {
  const g = s.grid, change = emptyChange(s.revision);
  const earth = e.earth && clampRect(g, e.earth), cover = e.cover && clampRect(g, e.cover);
  if (earth) recomposeEarth(s, earth);
  if (cover) recomposeCover(s, cover);
  change.height = earth;
  change.cover = unionRect(earth, cover);
  noteFields(change, e.fields);
  const touched = unionRect(earth, cover);
  if (touched) noteFields(change, pruneFields(s, touched));
  if (earth || e.water) {
    change.water = refreshWater(s);
    change.wet = refreshWet(s);
  }
  if (change.wet || change.fields) { updateFieldMoisture(s); markFloodedFields(s); }
  change.bridges = recomputeBridges(s);
  change.powerChanged = refreshPower(s);
  if (change.height || change.cover || change.water || change.fields) s.revision++;
  change.revision = s.revision;
  change.things = e.things ?? [];
  change.channels = e.channels ?? [];
  change.tracks = e.tracks ?? [];
  change.hedges = e.hedges ?? [];
  change.trees = e.trees ?? [];
  if (e.created !== undefined) change.created = e.created;
  // Taking down what makes the homestead run (a building, or the last field: erased, or under a track, a rill or a
  // building) starts an unfinished Steady Homestead over now, paused or not, so putting it back before the next tick
  // can't keep the hours.
  if (resetSteadyOnSetupChange(s)) change.steadyReset = true;
  return change;
}

/**
 * Redraws the flood when the weather's surge has moved far enough from what the water layer shows (2 cm, or back to
 * none): the live water, the wet banks, the fields' moisture and which fields stand flooded, and the carts' map. With
 * `force`, redraws it whatever the surge did. Returns whether the water changed.
 */
export function refreshFlood(s: GameState, force = false): boolean {
  if (!force && !floodMoved(s)) return false;
  s.sim.floodApplied = appliedSurge(s.sim.weather.floodSurge);
  const water = composeWater(s), wet = refreshWet(s);
  if (wet) updateFieldMoisture(s);
  markFloodedFields(s);
  s.sim.floodKey++;
  return water !== undefined || wet !== undefined;
}
