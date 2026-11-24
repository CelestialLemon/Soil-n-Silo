import assert from 'node:assert/strict';
import { test } from 'node:test';
import { err, must, ok } from '../src/game/index.ts';

test('results carry a value or an error', () => {
  assert.deepEqual(ok(3), { ok: true, value: 3 });
  assert.deepEqual(err('no'), { ok: false, error: 'no' });
});

test('a missing value an invariant promised is a bug and throws', () => {
  assert.equal(must(0, 'a zero'), 0);
  assert.throws(() => must(null, 'the farmhouse'), /Missing the farmhouse/);
});
