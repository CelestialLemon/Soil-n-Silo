// The brush3d world's models (#203, src/world/brush/catalog.ts): every building the game places has a solarpunk model built
// on its footprint, and each is turned to face the way the game says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BUILDING_IDS, BUILDINGS } from '../src/game/data.ts';
import { SIDES } from '../src/game/relief.ts';
import { MODEL_OF, TRUCK_MODEL, YAW } from '../src/world/brush/catalog.ts';

const index = JSON.parse(readFileSync(join(import.meta.dirname, '../brush3d/src/models/index.json'), 'utf8')) as Record<string, { tiles: [number, number] }>;

test('every building but the painted ones (a field, a sapling) has a model', () => {
  for (const id of BUILDING_IDS) {
    if (id === 'field' || id === 'sapling') { assert.equal(MODEL_OF[id], undefined, id); continue; }
    assert.ok(MODEL_OF[id], `${id} has no model`);
    assert.ok(index[MODEL_OF[id]], `${id}'s model ${MODEL_OF[id]} isn't in brush3d/src/models`);
  }
  assert.ok(index[TRUCK_MODEL], 'the truck model');
});

test("each building's model is built on its footprint", () => {
  for (const id of BUILDING_IDS) {
    const name = MODEL_OF[id];
    if (name) assert.deepEqual(index[name].tiles, [BUILDINGS[id].size, BUILDINGS[id].size], `${id} (${name})`);
  }
  assert.deepEqual(index[TRUCK_MODEL].tiles, [1, 1]);
});

test("a model's front (+z) turns to face the side the game's rot names", () => {
  for (const rot of [0, 1, 2, 3] as const) {
    const [dx, dz] = SIDES[rot];
    assert.ok(Math.abs(Math.sin(YAW[rot]) - dx) < 1e-9 && Math.abs(Math.cos(YAW[rot]) - dz) < 1e-9, `rot ${rot}`);
  }
});
