// Digging and filling rills: a narrow hand-dug cut along a stroke the player drags. Where it touches the brook or pond,
// water runs along it by gravity alone (flow.ts) and wets its banks (wet.ts). Filling one gives back the ground exactly.
import { CATALOG } from './catalog.ts';
import type { Change } from './change.ts';
import { channelRect, coreObb, RILL_HALF, settles, thingObb } from './earth.ts';
import { channelPath } from './flow.ts';
import { obbDistance, pathLength, type Point2 } from './geom.ts';
import { cellIx, cellIz, COVER, VALLEY_HALF } from './grid.ts';
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
  return ok(undefined);
}

/** Digs a rill along a stroke. */
export function digChannel(s: GameState, points: readonly Point2[]): Result<Change, string> {
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
