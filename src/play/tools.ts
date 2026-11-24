// The tools in hand: which tools take a stroke and which a click, which switch on the soft hints over the grass, and the
// live line each one says while it's hovered or dragged ("Flowing 16 m", "The ground is too steep here."). Plain functions
// of the game's state, so the controller only asks.
import {
  canDig, canPlace, canPlant, canTrack, CATALOG, channelPath, type ChannelPreview, type GameState, pathLength, type Point2, previewChannelFlow,
  type ThingKind, trackBridges, trackPath,
} from '../game/index.ts';
import { placedKind, type ToolId, type ToolReadout } from '../ui/index.ts';

/** The tools a left drag paints with, rather than pans the view. */
export type StrokeTool = 'field:wheat' | 'field:beans' | 'field:erase' | 'channel:dig' | 'channel:fill' | 'track:draw' | 'hedge:draw';
const STROKES: readonly ToolId[] = ['field:wheat', 'field:beans', 'field:erase', 'channel:dig', 'channel:fill', 'track:draw', 'hedge:draw'];
export const isStrokeTool = (t: ToolId): t is StrokeTool => STROKES.includes(t);
export const isFieldTool = (t: ToolId) => t.startsWith('field:');

/** The field brush's radius, m: `[` and `]` step it. */
export const BRUSH = { min: 2, max: 5, step: 0.5, start: 3 } as const;
/** How far apart a stroke's points are kept, m. */
export const STROKE_STEP: Record<StrokeTool, number> = {
  'field:wheat': 0.6, 'field:beans': 0.6, 'field:erase': 0.6, 'channel:dig': 0.8, 'channel:fill': 0.5, 'track:draw': 1, 'hedge:draw': 1,
};
/** A turn of R, Shift+wheel or the ring: 15°. */
export const TURN_STEP = Math.PI / 12;

/** A power building or relay: one that projects a wireless field (a thing that only uses power is not one). */
export const isPowerKind = (k: ThingKind) => CATALOG[k].powerRange > 0;

/** Whether a tool places a power building or relay. */
export function placesPower(tool: ToolId): boolean {
  const k = placedKind(tool);
  return k !== null && isPowerKind(k);
}

const m = (n: number) => `${Math.round(n)} m`;

const supplies = (n: number) => `${n} ${n === 1 ? 'Supply' : 'Supplies'}`;

/**
 * What a ghost at a spot says: why it can't stand there (the pool short of its cost among the reasons), or a word on
 * where it would, with what a paid building takes from the pool ("2 Supplies · 8 left").
 */
export function placeReadout(s: GameState, kind: ThingKind, x: number, z: number, yaw: number, ignore?: number): { fits: boolean; readout: ToolReadout | null } {
  const can = canPlace(s, kind, x, z, yaw, ignore);
  if (!can.ok) return { fits: false, readout: { text: can.error, tone: 'warn' } };
  // A move costs nothing: only a new building says its price.
  const cost = ignore === undefined ? CATALOG[kind].cost : 0;
  const price = cost > 0 ? ` · ${supplies(cost)} · ${s.sim.supplies.available - cost} left` : '';
  if (kind === 'waterwheel') return { fits: true, readout: { text: `Its wheel turns in the brook${price} · click to place`, tone: 'wet' } };
  if (kind === 'solar') {
    const g = s.grid, ix = Math.floor((x - g.x0) / g.cell), iz = Math.floor((z - g.z0) / g.cell);
    const id = ix >= 0 && iz >= 0 && ix < g.nx && iz < g.nz ? g.fieldOf[iz * g.nx + ix] : 0;
    const field = id === 0 ? undefined : s.fields.find((f) => f.id === id);
    if (field) return { fits: true, readout: { text: `Over the ${field.crop} · agrivoltaic shade${price}` } };
  }
  return { fits: true, readout: price ? { text: `${CATALOG[kind].label}${price} · click to place` } : null };
}

/**
 * What a rill being dragged would do: where it flows, where it stops, or why it can't be dug. `preview` is the water the
 * rules say it would carry (absent while the stroke is too short), handed on to the world to draw so it solves once.
 */
export function channelReadout(s: GameState, points: readonly Point2[]): { readout: ToolReadout; preview?: ChannelPreview } {
  const path = channelPath(points);
  if (path.length < 2 || pathLength(path) < 1.5) return { readout: { text: 'Drag from the brook or pond, downhill or along the contours' } };
  const preview = previewChannelFlow(s, points), can = canDig(s, path);
  if (!can.ok) return { readout: { text: can.error, tone: 'warn' }, preview };
  if (!preview.connected) return { readout: { text: 'Start from the brook or pond for gravity flow', tone: 'warn' }, preview };
  if (preview.sillPoint) return { readout: { text: `Flowing ${m(preview.wetLength)} · stops dry at uphill sill`, tone: 'warn' }, preview };
  return { readout: { text: `Flowing ${m(preview.wetLength)}`, tone: 'wet' }, preview };
}

/** What a track being dragged would be: its length and its bridges, or why it can't run there. */
export function trackReadout(s: GameState, points: readonly Point2[]): { fits: boolean; readout: ToolReadout } {
  const path = trackPath(points), can = canTrack(s, path);
  if (!can.ok) return { fits: false, readout: { text: can.error, tone: points.length < 3 ? 'neutral' : 'warn' } };
  const bridges = trackBridges(s, { id: -1, points: [...points], path }).length;
  const text = `Track ${m(pathLength(path))}${bridges ? ` · ${bridges} plank bridge${bridges === 1 ? '' : 's'}` : ''}`;
  return { fits: true, readout: { text } };
}

export const hedgeReadout = (points: readonly Point2[]): ToolReadout => ({ text: `Hedgerow ${m(pathLength(trackPath(points)))}` });

export function treeReadout(s: GameState, x: number, z: number): { fits: boolean; readout: ToolReadout | null } {
  const can = canPlant(s, x, z);
  return can.ok ? { fits: true, readout: null } : { fits: false, readout: { text: can.error, tone: 'warn' } };
}

/** Keeps a stroke's points `step` apart: whether the point was added. */
export function extend(points: Point2[], p: Point2, step: number): boolean {
  const last = points[points.length - 1];
  if (last && Math.hypot(p.x - last.x, p.z - last.z) < step) return false;
  points.push({ x: p.x, z: p.z });
  return true;
}
