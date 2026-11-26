// How much a homestead may hold: one set of limits shared by the tools that make things (so play never makes more) and by
// the save reader (so a save never asks for more). Anything a tool accepts, a save of it reads back (save.ts).
import { pathLength, type Point2 } from './geom.ts';
import { err, ok, type Result } from './result.ts';

/** The most buildings, rills, tracks, hedges or planted trees a homestead holds, each. */
export const MAX_SAVED_ITEMS = 4000;
/** The most rills: the water's solve weighs every pair of them. */
export const MAX_CHANNELS = 200;
/** The most junctions across all rills (ends touching another rill, plus crossings): bounds the water solver's links. */
export const MAX_CHANNEL_JUNCTIONS = 4000;
/** The most control points one rill, track or hedge holds, and the longest its stroke runs (through its points), m. */
export const MAX_PATH_POINTS = 2000;
export const MAX_PATH_LENGTH = 2000;
/** The most control points, and the longest strokes, all the rills, tracks and hedges hold together (points, m). */
export const MAX_TOTAL_PATH_POINTS = 12_000;
export const MAX_TOTAL_PATH_LENGTH = 12_000;
/**
 * The highest next id (of a building, rill, track, hedge, tree or cart) a valley may hold: far below where whole numbers
 * stop being exact, so every id allocated stays exact and every edited valley stays loadable.
 */
export const MAX_SAVED_ID = 1_000_000_000;

/** Whether the valley still has headroom to allocate another entity id without crossing MAX_SAVED_ID. */
export const idFits = (s: { nextId: number }): Result<void, string> => (
  s.nextId < MAX_SAVED_ID ? ok(undefined) : err('This valley has reached its limit of new things.')
);

/** Whether the homestead still has headroom to allocate another cart id without crossing MAX_SAVED_ID. */
export const cartIdFits = (s: { sim: { nextCartId: number } }): Result<void, string> => (
  s.sim.nextCartId < MAX_SAVED_ID ? ok(undefined) : err('This valley has reached its limit of new carts.')
);

export type StrokeKind = 'rill' | 'track' | 'hedge';
interface Strokes { channels: readonly { points: readonly Point2[] }[]; tracks: readonly { points: readonly Point2[] }[]; hedges: readonly { points: readonly Point2[] }[] }

/** How many control points, and how far, all of a homestead's strokes run together. */
export function strokeTotals(s: Strokes): { points: number; length: number } {
  let points = 0, length = 0;
  for (const list of [s.channels, s.tracks, s.hedges]) for (const p of list) { points += p.points.length; length += pathLength(p.points); }
  return { points, length };
}

/** What a homestead's strokes ask for beyond the limits, if anything (all together, and the rills' count). */
export function strokesFault(s: Strokes): string | undefined {
  if (s.channels.length > MAX_CHANNELS) return 'too many rills';
  const t = strokeTotals(s);
  if (t.points > MAX_TOTAL_PATH_POINTS || t.length > MAX_TOTAL_PATH_LENGTH) return 'rills, tracks and hedges too long together';
  return undefined;
}

/** Whether a new stroke of this kind fits within the limits, beside the homestead's others. */
export function strokeFits(s: Strokes, kind: StrokeKind, points: readonly Point2[]): Result<void, string> {
  if (points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.z))) return err(`That ${kind} left the valley.`);
  if (points.length > MAX_PATH_POINTS || pathLength(points) > MAX_PATH_LENGTH) return err(`That ${kind} is too long: draw it in shorter pieces.`);
  const list = kind === 'rill' ? s.channels : kind === 'track' ? s.tracks : s.hedges;
  if (list.length >= (kind === 'rill' ? MAX_CHANNELS : MAX_SAVED_ITEMS)) return err(`The valley holds no more ${kind}s.`);
  const t = strokeTotals(s);
  if (t.points + points.length > MAX_TOTAL_PATH_POINTS || t.length + pathLength(points) > MAX_TOTAL_PATH_LENGTH) {
    return err('The valley holds no more rills, tracks and hedges: take some away first.');
  }
  return ok(undefined);
}
