import { GeometryCollector } from 'pixel3d-renderer';
import { box } from './farm.ts';

// The game's moving objects, built once in local space (origin on the ground, facing +z). Placeholders until the real models.

/** The farmer: one rigid body for now (characters are a renderer gap to confirm, see docs/ROADMAP.md). */
export function farmer() {
  const c = new GeometryCollector();
  box(c, 0, 0, 0, 0.3, 0.42, 0.2, 0x4a3a2a);                  // legs
  box(c, 0, 0.42, 0, 0.36, 0.42, 0.24, 0x5a7a3a);             // shirt
  box(c, 0, 0.84, 0, 0.26, 0.26, 0.26, 0xf0c8a0);             // head
  box(c, 0, 1.08, 0, 0.44, 0.04, 0.44, 0xe0c070);             // straw hat brim
  box(c, 0, 1.12, 0, 0.22, 0.1, 0.22, 0xe0c070);              // crown
  for (const x of [-0.06, 0.06]) box(c, x, 0.9, 0.13, 0.04, 0.05, 0.01, 0x202020);
  return c.build();
}
