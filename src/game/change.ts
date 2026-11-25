// What an edit changed, so the picture redraws only that: dirty rects (cells; the union of where things were and are now)
// for each layer of the land, and which entities changed.
import type { Rect } from './grid.ts';

export interface Change {
  /** The land's revision after the edit. */
  revision: number;
  /** Cells whose vertex heights may have changed (their corners: x0..x1 + 1, z0..z1 + 1). */
  height?: Rect;
  cover?: Rect;
  water?: Rect;
  /** Cells whose wet-bank moisture changed. */
  wet?: Rect;
  /** Cells whose field changed. */
  fields?: Rect;
  things: number[];
  channels: number[];
  tracks: number[];
  hedges: number[];
  trees: number[];
  bridges: boolean;
  powerChanged: boolean;
  /** The Supplies pool changed (something paid for or refunded). */
  supplies?: boolean;
  /** The carts changed (one bought, retired, or all gone with the Garage). */
  carts?: boolean;
  /** An unfinished Steady Homestead started over: the edit took down what makes the homestead run. */
  steadyReset?: boolean;
  /** The id of what the edit made, if it made something. */
  created?: number;
}

export const emptyChange = (revision: number): Change =>
  ({ revision, things: [], channels: [], tracks: [], hedges: [], trees: [], bridges: false, powerChanged: false });
