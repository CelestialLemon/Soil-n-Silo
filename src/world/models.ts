import { FLAG, GeometryCollector } from 'pixel3d-renderer';
import { box } from './farm.ts';

// The game's moving objects, built once in local space (origin on the ground at the tile centre).

/** A flat frame marking the tile under the pointer, 1 m across, lying just above the ground. */
export function tileCursor() {
  const c = new GeometryCollector();
  for (const [x, z, w, d] of [[0, -0.47, 1, 0.06], [0, 0.47, 1, 0.06], [-0.47, 0, 0.06, 0.88], [0.47, 0, 0.06, 0.88]]) {
    box(c, x, 0, z, w, 0.02, d, 0xfff0c0, FLAG.EMISSIVE);
  }
  return c.build();
}
