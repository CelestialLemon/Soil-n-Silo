import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MeshBuilder, rng, srgb } from '../src/kit/builder.ts';
import { addTuft, groundOf, type TuftOptions } from '../src/kit/kit.ts';
import { TUFT_HEIGHT, TUFT_REACH } from '../src/shared.ts';

// `addTuft`'s blades stay within what kit/tuft.ts promises the game (Soil-n-Silo#256): no further than
// `spread + TUFT_REACH * tall` across the ground from the tuft's spot, no higher than `TUFT_HEIGHT * tall` above it.

/** The demo's tufts (no options) and the game's three densities' shapes (src/world/brush/grassMask.ts), and wider. */
const SHAPES: (TuftOptions | undefined)[] = [
  undefined,
  { blades: [3, 2], width: [0.046, 0.022], spread: 0.08 },
  { blades: [3, 3], width: [0.052, 0.026], spread: 0.10 },
  { blades: [4, 3], width: [0.055, 0.028], spread: 0.11 },
  { blades: [6, 4], width: [0.07, 0.04], spread: 0.2 },
];

test('a tuft\'s blades stay within TUFT_REACH and TUFT_HEIGHT of its spot, and come near both', () => {
  const ground = groundOf((x, z) => 0.3 * x - 0.2 * z + Math.sin(x * 1.7) * Math.cos(z * 1.3));
  const rand = rng(256), colour = srgb(0x5a9848);
  let nearest = Infinity, nearestUp = Infinity, tufts = 0;
  for (const shape of SHAPES) {
    const spread = shape?.spread ?? 0.04;
    for (let k = 0; k < 400; k++) {
      const x = (rand() - 0.5) * 40, z = (rand() - 0.5) * 40, tall = 0.1 + rand() * 1.4;
      const mb = new MeshBuilder('grass');
      addTuft(mb, ground, x, z, tall, colour, rand, shape);
      const pos = mb.build().getAttribute('position'), y = ground.height(x, z);
      const reach = spread + TUFT_REACH * tall, up = TUFT_HEIGHT * tall;
      let far = 0, high = -Infinity;
      for (let i = 0; i < pos.count; i++) {
        far = Math.max(far, Math.hypot(pos.getX(i) - x, pos.getZ(i) - z));
        high = Math.max(high, pos.getY(i) - y);
      }
      assert.ok(pos.count > 0);
      assert.ok(far <= reach + 1e-6, `a blade reaches ${far.toFixed(4)} m, past ${reach.toFixed(4)} (tall ${tall.toFixed(3)}, spread ${spread})`);
      assert.ok(high <= up + 1e-6, `a blade stands ${high.toFixed(4)} m, over ${up.toFixed(4)} (tall ${tall.toFixed(3)})`);
      // How close the tuft came to each promise, as a share of it: a promise far looser than the blades would cost the
      // game a bare ring round everything it keeps its grass off.
      nearest = Math.min(nearest, 1 - far / reach);
      nearestUp = Math.min(nearestUp, 1 - high / up);
      tufts++;
    }
  }
  assert.equal(tufts, SHAPES.length * 400);
  assert.ok(nearest < 0.03, `the furthest blade came within ${(nearest * 100).toFixed(1)}% of TUFT_REACH's promise`);
  assert.ok(nearestUp < 0.03, `the highest blade came within ${(nearestUp * 100).toFixed(1)}% of TUFT_HEIGHT's promise`);
});
