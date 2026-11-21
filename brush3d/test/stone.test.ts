import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MeshBuilder, rng } from '../src/kit/builder.ts';
import { addCrag, addStone, groundOf } from '../src/kit/kit.ts';

// The painting kit's stones mark their paint as stone (stonePaint, dabs.ts: their brushwork negated), so the snow can lie on
// them their own way (Soil-n-Silo#286); the shader takes the brushwork back whole, so the mark alone changes no frame.

test('a crag and a stone mark every vertex as stone, their brushwork whole', () => {
  const ground = groundOf(() => 0);
  for (const add of [
    (b: MeshBuilder) => addCrag(b, ground, 0, 0, { rx: 1, ry: 0.8, rz: 1.2 }, rng(286)),
    (b: MeshBuilder) => addStone(b, ground, 0, 0, 0.6, 0.3, rng(286)),
  ]) {
    const b = new MeshBuilder('paint');
    add(b);
    const paint = b.build().getAttribute('aPaint');
    assert.ok(paint.count > 0);
    for (let i = 0; i < paint.count; i++) {
      const x = paint.getX(i);
      assert.ok(x < 0 && Math.abs(x) <= 1, `vertex ${i}: aPaint.x ${x}`);
      // Negating is exact, so abs() in the shader gives back exactly the brushwork the stone had unmarked.
      assert.equal(Math.fround(-x), Math.fround(Math.abs(x)));
    }
  }
});
