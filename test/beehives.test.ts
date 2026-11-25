import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceRecipes, apply, COVER, fieldYield, forageRate, growCrops, startRecipes, stepCarts } from '../src/game/index.ts';
import { stepEcology } from '../src/game/workshops.ts';
import { building, fieldAt, flatLand, land } from './helpers.ts';

test('bees forage by day near beans, shelter from wind, and pollinate through to harvest', () => {
  const s = land({ height: () => 0 }), f = fieldAt(s, 'beans', 0, 0, 5);
  const { t, r } = building(s, 'beehive', 8, 0), fair = { windSpeed: 4, cloudCover: 0 };
  s.sim.hour = 12;
  assert.ok(forageRate(s, t, fair) > 1);
  for (const weather of ['rain', 'soft-rain', 'storm']) assert.equal(forageRate(s, t, { ...fair, weather }), 0);
  assert.equal(forageRate(s, t, { ...fair, windSpeed: 14 }), 0);
  s.hedges.push({ id: 20, points: [], path: [{ x: 9, z: -3 }, { x: 9, z: 3 }] });
  assert.ok(forageRate(s, t, { ...fair, windSpeed: 14 }) > 1);
  stepEcology(s, 4.5, fair);
  assert.equal(r.outputs.honey, 1);
  growCrops(s, 0.1, 1);
  s.sim.hour = 0;
  stepEcology(s, 0.1, fair);
  assert.equal(r.working, false);
  f.growth = 0.9999;
  growCrops(s, 1, 0);
  assert.equal(f.harvestReady, Math.round(fieldYield(f) * 1.25));
});

test('switching Bakery recipes preserves the paid batch and bills honey for the next', () => {
  const s = flatLand(), { t, r } = building(s, 'bakery', 0, -20);
  r.inputs = { flour: 2, eggs: 2, honey: 1 };
  r.powered = true;
  startRecipes(s);
  assert.ok(apply(s, { type: 'setRecipe', id: t.id, recipe: 'honey_cake' }).ok);
  advanceRecipes(s, 1.8);
  assert.equal(r.outputs.bread, 2);
  startRecipes(s);
  assert.deepEqual(r.inputs, {});
  advanceRecipes(s, 2.19);
  assert.equal(r.outputs.honey_cake, undefined);
  advanceRecipes(s, 0.02);
  assert.equal(r.outputs.honey_cake, 2);
});

for (const target of ['coop', 'composter'] as const) test(`Mill preference dispatches bran to the ${target}`, () => {
  const s = flatLand();
  assert.ok(apply(s, { type: 'place', kind: 'garage', x: -10, z: -30, yaw: 0 }).ok);
  const mill = building(s, 'mill', 6, -28), coop = building(s, 'coop', 22, -46), composter = building(s, 'composter', -26, -28);
  mill.r.outputs.bran = 2;
  assert.ok(apply(s, { type: 'setByproductPriority', id: mill.t.id, target }).ok);
  stepCarts(s, 1, 12, []);
  assert.equal(s.sim.carts[0].job?.to.id, (target === 'coop' ? coop : composter).t.id);
});

test('meadow flowers feed a hive without beans until winter or the meadow is cleared', () => {
  const s = land({ height: () => 0 }), { t } = building(s, 'beehive', 0, 0);
  s.sim.hour = 12;
  const calm = { windSpeed: 1, cloudCover: 0 };
  assert.equal(forageRate(s, t, calm), 1);
  s.season = 'winter';
  assert.equal(forageRate(s, t, calm), 0);
  s.season = 'summer';
  s.grid.cover.fill(COVER.bare);
  s.revision++;
  assert.equal(forageRate(s, t, calm), 0);
});
