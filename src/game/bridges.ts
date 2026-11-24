// Plank bridges: wherever a track crosses water (the brook, the pond) or a dug rill's cut (wet or dry: a dry rill is still
// a ditch a cart can't roll through), a bridge spans from the dry bank before to the dry bank after. Rebuilt from the
// tracks and rills whenever either changes.
import { CHANNEL_REACH, RILL_HALF } from './earth.ts';
import { pathBounds, type Point2, polylineDistance } from './geom.ts';
import { cellIx, cellIz, type Grid, isWet, sampleHeight } from './grid.ts';
import { err, ok, type Result } from './result.ts';
import type { Bridge, Channel, GameState, Track } from './state.ts';

/** The longest span a plank bridge makes, m. */
export const MAX_SPAN = 12;
export const BRIDGE_WIDTH = 2.2;
/** How much higher one bank may stand than the other for a bridge to rest on both, m. */
const MAX_BANK_STEP = 1.2;
/** A bridge reaches this far onto each bank past the crossing, m. */
export const BEARING = 0.5;

interface Crossing { from: number; to: number }

/** The runs of a track's centreline that cross water or a rill's cut: sample index ranges [from, to]. */
function crossings(g: Grid, channels: readonly Channel[], path: readonly Point2[]): Crossing[] {
  const boxes = channels.map((c) => pathBounds(c.path, CHANNEL_REACH));
  const crossing = (p: Point2) => {
    if (isWet(g.baseWaterLevel[cellIz(g, p.z) * g.nx + cellIx(g, p.x)])) return true;
    return channels.some((c, k) => {
      const b = boxes[k];
      return p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ && polylineDistance(p.x, p.z, c.path).d <= RILL_HALF;
    });
  };
  const out: Crossing[] = [];
  let start = -1;
  path.forEach((p, i) => {
    if (crossing(p)) { if (start < 0) start = i; }
    else if (start >= 0) { out.push({ from: start, to: i - 1 }); start = -1; }
  });
  if (start >= 0) out.push({ from: start, to: path.length - 1 });
  return out;
}

/** The bridge a crossing needs, or why it can't have one, on the land `h` (the live land unless asked of another). */
function span(g: Grid, path: readonly Point2[], c: Crossing, h: Float32Array = g.height): Result<Omit<Bridge, 'id' | 'trackId'>, string> {
  if (c.from === 0 || c.to === path.length - 1) return err('A track must reach dry ground on both sides of the water.');
  const a = path[c.from - 1], b = path[c.to + 1];
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  if (len + 2 * BEARING > MAX_SPAN) return err(`That crossing is too wide for a plank bridge (${len.toFixed(1)} m; at most ${MAX_SPAN - 2 * BEARING} m).`);
  // The deck rests on the banks where the crossing ends and where its planks end, BEARING further on.
  const ux = len > 0 ? dx / len : 0, uz = len > 0 ? dz / len : 0;
  const at = (x: number, z: number) => sampleHeight(g, h, x, z);
  const ha = Math.max(at(a.x, a.z), at(a.x - ux * BEARING, a.z - uz * BEARING));
  const hb = Math.max(at(b.x, b.z), at(b.x + ux * BEARING, b.z + uz * BEARING));
  if (Math.abs(ha - hb) > MAX_BANK_STEP) return err('The banks are too uneven for a bridge to rest on both.');
  let water = -Infinity;
  for (let i = c.from; i <= c.to; i++) {
    const p = path[i], w = g.waterLevel[cellIz(g, p.z) * g.nx + cellIx(g, p.x)];
    if (isWet(w)) water = Math.max(water, w);
  }
  const deckY = Math.max(ha, hb, water + 0.25) + 0.1;
  return ok({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, yaw: Math.atan2(dx, dz), length: len + 2 * BEARING, width: BRIDGE_WIDTH, deckY });
}

/**
 * Whether a track along this centreline can bridge every crossing it makes: over the rills dug now, or (to ask whether a
 * new rill may be dug) over `channels` on the land `h` they would leave.
 */
export function checkCrossings(
  s: GameState, path: readonly Point2[], channels: readonly Channel[] = s.channels, h: Float32Array = s.grid.height,
): Result<void, string> {
  for (const c of crossings(s.grid, channels, path)) {
    const r = span(s.grid, path, c, h);
    if (!r.ok) return r;
  }
  return ok(undefined);
}

/** The bridges a track needs where it crosses water and rills (any crossing that can't be bridged is left out). */
export function trackBridges(s: GameState, t: Track): Bridge[] {
  const out: Bridge[] = [];
  for (const c of crossings(s.grid, s.channels, t.path)) {
    const r = span(s.grid, t.path, c);
    if (r.ok) out.push({ ...r.value, id: `${t.id}-${out.length}`, trackId: t.id });
  }
  return out;
}

/** Rebuilds every bridge; returns whether any changed. */
export function recomputeBridges(s: GameState): boolean {
  const next = s.tracks.flatMap((t) => trackBridges(s, t));
  const changed = JSON.stringify(next) !== JSON.stringify(s.bridges);
  s.bridges = next;
  return changed;
}
