// Digging and filling rills: a narrow hand-dug cut along a stroke the player drags. Where it touches the brook or pond,
// water runs along it by gravity alone (flow.ts) and wets its banks (wet.ts). Filling one gives back the ground exactly.
import { CATALOG } from './catalog.ts';
import type { Change } from './change.ts';
import { BEARING, checkCrossings } from './bridges.ts';
import { CHANNEL_REACH, channelRect, coreObb, RILL_HALF, settles, thingObb } from './earth.ts';
import { channelPath, heightsWithRill } from './flow.ts';
import { obbDistance, pathBounds, pathLength, type Point2 } from './geom.ts';
import { cellIx, cellIz, COVER, VALLEY_HALF } from './grid.ts';
import { strokeFits } from './limits.ts';
import { err, ok, type Result } from './result.ts';
import { settle } from './settle.ts';
import { type Channel, type GameState, takeId } from './state.ts';

export const MIN_CHANNEL = 1.5;
export const MAX_CHANNEL = 240;
/** How close a rill may come to a tree's trunk (times its scale), m. */
const TRUNK = 1;

/** Whether a rill may be dug along this centreline. */
export function canDig(s: GameState, path: readonly Point2[]): Result<void, string> {
  const len = pathLength(path);
  if (path.length < 2 || len < MIN_CHANNEL) return err('Drag a little further to dig a rill.');
  if (len > MAX_CHANNEL) return err(`A rill can run at most ${MAX_CHANNEL} m.`);
  const g = s.grid, edge = VALLEY_HALF - 1;
  const cores = s.things.filter((t) => settles(CATALOG[t.kind])).map((t) => ({ t, core: coreObb(t) }));
  const props = s.things.filter((t) => !settles(CATALOG[t.kind])).map((t) => ({ t, box: thingObb(t) }));
  for (const p of path) {
    if (Math.abs(p.x) > edge || Math.abs(p.z) > edge) return err("A rill can't leave the valley.");
    const c = g.baseCover[cellIz(g, p.z) * g.nx + cellIx(g, p.x)];
    if (c === COVER.rock) return err('There is rock in the way.');
    if (c === COVER.woods) return err("The woods' roots are in the way.");
    for (const { t, core } of cores) if (obbDistance(core, p.x, p.z) <= RILL_HALF + 0.4) return err(`The ${CATALOG[t.kind].label} is in the way.`);
    for (const { t, box } of props) if (obbDistance(box, p.x, p.z) <= RILL_HALF) return err(`The ${CATALOG[t.kind].label} is in the way.`);
    for (const k of s.crags) if (Math.hypot(p.x - k.x, p.z - k.z) <= k.radius + RILL_HALF) return err('There is rock in the way.');
    for (const t of [...s.wildTrees, ...s.plantedTrees]) if (Math.hypot(p.x - t.x, p.z - t.z) <= TRUNK * t.scale + RILL_HALF) return err('A tree is in the way.');
  }
  return keepsTracks(s, path);
}

/**
 * Whether every track the rill would cross or reshape could still bridge it (and every other crossing it makes), on the
 * land the cut would leave: laying the track after the rill would be refused otherwise, so digging the rill after it is
 * too. A rill needn't cross a track to touch its bridges: its cut lowers the ground CHANNEL_REACH out, and a bridge's
 * bank heights are read up to BEARING past the track's samples, from the corners of the cell they fall in.
 */
function keepsTracks(s: GameState, path: readonly Point2[]): Result<void, string> {
  const reach = pathBounds(path, CHANNEL_REACH + BEARING + Math.SQRT2 * s.grid.cell);
  const crossed = s.tracks.filter((t) => {
    const b = pathBounds(t.path, 0);
    return b.minX <= reach.maxX && b.maxX >= reach.minX && b.minZ <= reach.maxZ && b.maxZ >= reach.minZ;
  });
  if (crossed.length === 0) return ok(undefined);
  const channels = [...s.channels, { id: -1, points: [], path: [...path], flow: [] }], h = heightsWithRill(s, path);
  for (const t of crossed) {
    const r = checkCrossings(s, t.path, channels, h);
    if (!r.ok) return err(`That would cut a track where no bridge could cross: ${lower(r.error)}`);
  }
  return ok(undefined);
}

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** Digs a rill along a stroke. */
export function digChannel(s: GameState, points: readonly Point2[]): Result<Change, string> {
  const fits = strokeFits(s, 'rill', points);
  if (!fits.ok) return fits;
  const path = channelPath(points);
  const can = canDig(s, path);
  if (!can.ok) return can;
  const id = takeId(s);
  const c: Channel = { id, points: points.map((p) => ({ x: p.x, z: p.z })), path, flow: [] };
  s.channels.push(c);
  return ok(settle(s, { earth: channelRect(s.grid, c), water: true, channels: [id], created: id }));
}

/** Fills a rill back in. */
export function fillChannel(s: GameState, id: number): Result<Change, string> {
  const k = s.channels.findIndex((c) => c.id === id);
  if (k < 0) return err('There is no rill there to fill.');
  const [c] = s.channels.splice(k, 1);
  return ok(settle(s, { earth: channelRect(s.grid, c), water: true, channels: [id] }));
}
