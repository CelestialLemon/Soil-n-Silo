import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recipeById } from '../src/game/data.ts';
import { err, ok, tryParseJson } from '../src/game/result.ts';

test('results carry a value or an error', () => {
  assert.deepEqual(ok(3), { ok: true, value: 3 });
  assert.deepEqual(err('no'), { ok: false, error: 'no' });
});

test('tryParseJson returns the value, or why the text is not JSON', () => {
  assert.deepEqual(tryParseJson('{"a":[1,null]}'), ok({ a: [1, null] }));
  assert.deepEqual(tryParseJson('null'), ok(null));
  const bad = tryParseJson('{nope');
  assert.ok(!bad.ok && bad.error.length > 0);
});

test('an unknown recipe id is a bug and throws', () => {
  assert.equal(recipeById('flour').building, 'mill');
  assert.throws(() => recipeById('nope'), /No recipe with id nope/);
});
