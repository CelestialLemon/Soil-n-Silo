import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MeshBuilder, rng, srgb } from '../src/kit/builder.ts';
import { addFlower, groundOf, type FlowerOptions } from '../src/kit/kit.ts';
import { CRISP_EDGE } from '../src/renderer/dabs.ts';
import { FLOWER_REACH } from '../src/shared.ts';

// `addFlower`'s blooms stay within what kit/flower.ts promises the game (Soil-n-Silo#266): no further than
// `FLOWER_REACH * size` from the bloom's middle, across the ground or up, with the bloom's middle `lift` over the ground.
// The flutter is the shader's (FOLIAGE_VERT: under 0.15 × size, across the view), so it's counted from that, not here.

/** The demo's blooms (no options), the game's (src/world/brush/grassMask.ts's FLOWER_PROFILES) and bigger. */
const SHAPES: (FlowerOptions | undefined)[] = [
  undefined,
  { size: [0.07, 0.03], lift: [0.16, 0.16], crisp: true },
  { size: [0.08, 0.04], lift: [0.2, 0.3] },
  { size: [0.2, 0.1], lift: [0.5, 0.5] },
];
const FLUTTER = 0.15 * Math.hypot(1, 0.5, 0.5);

test('a bloom stays within FLOWER_REACH of its middle, its middle within its lift', () => {
  const ground = groundOf((x, z) => 0.3 * x - 0.2 * z + Math.sin(x * 1.7) * Math.cos(z * 1.3));
  const rand = rng(266), colour = srgb(0xf5cf3e);
  let nearest = Infinity;
  for (const shape of SHAPES) {
    const [sMin, sSpread] = shape?.size ?? [0.055, 0.035], [lMin, lSpread] = shape?.lift ?? [0.18, 0.22];
    for (let k = 0; k < 400; k++) {
      const x = (rand() - 0.5) * 40, z = (rand() - 0.5) * 40;
      const mb = new MeshBuilder('foliage');
      addFlower(mb, ground, x, z, colour, rand, shape);
      const g = mb.build(), pos = g.getAttribute('position'), card = g.getAttribute('aCard'), y = ground.height(x, z);
      assert.equal(pos.count, 4, 'one dab');
      for (let i = 0; i < pos.count; i++) {
        // Its middle where it was asked, `lift` over the ground.
        assert.ok(Math.hypot(pos.getX(i) - x, pos.getZ(i) - z) < 1e-4, 'its middle where it was asked (float32)');
        const up = pos.getY(i) - y;
        assert.ok(up >= lMin - 1e-4 && up <= lMin + lSpread + 1e-4, `its middle stands ${up.toFixed(3)} m up`);
        // Its corner, any way round, and the flutter: within FLOWER_REACH × its size.
        const size = card.getZ(i), out = Math.hypot(card.getX(i), card.getY(i)) * size + FLUTTER * size;
        assert.ok(size >= sMin - 1e-6 && size <= sMin + sSpread + 1e-6, `a dab of ${size.toFixed(3)} m`);
        assert.ok(out <= FLOWER_REACH * size + 1e-6, `a bloom reaches ${(out / size).toFixed(3)} × its size`);
        nearest = Math.min(nearest, 1 - out / (FLOWER_REACH * size));
        // Crisp edges when asked (the game's), the demo's soft ones otherwise.
        assert.ok(Math.abs(g.getAttribute('aPaint').getX(i) - (0.2 + (shape?.crisp ? CRISP_EDGE : 0))) < 1e-6);
      }
    }
  }
  // A promise far looser than the blooms would cost the game a bare ring round everything.
  assert.ok(nearest < 0.03, `the furthest corner came within ${(nearest * 100).toFixed(1)}% of FLOWER_REACH's promise`);
});
