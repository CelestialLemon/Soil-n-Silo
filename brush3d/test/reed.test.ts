import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MeshBuilder, rng, srgb } from '../src/kit/builder.ts';
import { addReeds, groundOf, type ReedOptions } from '../src/kit/kit.ts';
import { REED_HEIGHT, REED_REACH, REED_WIDTH } from '../src/shared.ts';

// `addReeds`'s stalks stay within what kit/reed.ts promises the game (Soil-n-Silo#267): no further than
// `across / √2 + REED_REACH * tall + width + REED_WIDTH` across the ground from the clump's spot, and no higher than
// `REED_HEIGHT * tall` over the ground at a stalk's root (`tall` and `width` the most the options give).

/** The demo's clumps (no options), the game's two densities' shapes (src/world/brush/grassMask.ts), and wider. */
const SHAPES: ReedOptions[] = [
  {},
  { blades: [10, 8], tall: [0.6, 0.45], across: 0.5, width: [0.026, 0.016], heads: 0.3 },
  { blades: [12, 10], tall: [0.7, 0.55], across: 0.55, width: [0.026, 0.016], heads: 0.3 },
  { blades: [12, 6], tall: [1, 1], across: 0.9, width: [0.03, 0.02], heads: 1, colour: srgb(0xc4a050) },
];

test('a clump\'s stalks stay within REED_REACH and REED_HEIGHT of its spot, and come near both', () => {
  const sloped = groundOf((x, z) => 0.3 * x - 0.2 * z + Math.sin(x * 1.7) * Math.cos(z * 1.3)), flat = groundOf(() => 0.7);
  const rand = rng(267);
  let nearest = Infinity, nearestUp = Infinity, clumps = 0;
  for (const shape of SHAPES) {
    const across = shape.across ?? 0.45, [t0, t1] = shape.tall ?? [0.5, 0.45], [w0, w1] = shape.width ?? [0.018, 0.012];
    const tall = t0 + t1, reach = across / Math.SQRT2 + REED_REACH * tall + w0 + w1 + REED_WIDTH, up = REED_HEIGHT * tall;
    for (let k = 0; k < 3000; k++) {
      const ground = k % 2 ? sloped : flat, x = (rand() - 0.5) * 40, z = (rand() - 0.5) * 40;
      const mb = new MeshBuilder('grass');
      addReeds(mb, ground, x, z, rand, shape);
      const pos = mb.build().getAttribute('position');
      assert.ok(pos.count > 0);
      let far = 0, high = -Infinity;
      for (let i = 0; i < pos.count; i++) far = Math.max(far, Math.hypot(pos.getX(i) - x, pos.getZ(i) - z));
      // On flat ground, the ground under every root is the same: a stalk's height is over it.
      if (ground === flat) for (let i = 0; i < pos.count; i++) high = Math.max(high, pos.getY(i) - 0.7);
      assert.ok(far <= reach + 1e-6, `a stalk reaches ${far.toFixed(4)} m, past ${reach.toFixed(4)}`);
      assert.ok(high <= up + 1e-6, `a stalk stands ${high.toFixed(4)} m, over ${up.toFixed(4)}`);
      // How close the clump came to each promise, as a share of it: a promise far looser than the stalks would cost the
      // game a bare ring round everything it keeps its reeds off. The reach is a sum of parts that never quite line up (a
      // stalk at the square's corner leans along x twice as far as along z, never along the diagonal, and it's widest at
      // its root, not its tip), so it's never met exactly: a tenth to a sixth of it is the slack, a few centimetres.
      nearest = Math.min(nearest, 1 - far / reach);
      if (ground === flat) nearestUp = Math.min(nearestUp, 1 - high / up);
      clumps++;
    }
  }
  assert.equal(clumps, SHAPES.length * 3000);
  assert.ok(nearest < 0.2, `the furthest stalk came within ${(nearest * 100).toFixed(1)}% of the reach promised`);
  assert.ok(nearestUp < 0.03, `the highest stalk came within ${(nearestUp * 100).toFixed(1)}% of REED_HEIGHT's promise`);
});
