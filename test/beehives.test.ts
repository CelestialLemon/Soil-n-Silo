import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceRecipes, apply, blankState, COVER, fieldYield, forageRate, growCrops, OUTPUT_CAP, startRecipes, stepCarts, totalStored } from '../src/game/index.ts';
import { outputRoom, stepEcology } from '../src/game/workshops.ts';
import { building, fieldAt, flatLand, land, ribbon } from './helpers.ts';

test('bees forage by day near beans, shelter from wind, and pollinate through to harvest', () => {
  const s = land({ height: () => 0 }), f = fieldAt(s, 'beans', 0, 0, 5);
  const { t, r } = building(s, 'beehive', 8, 0), fair = { windSpeed: 4, cloudCover: 0 };
  s.sim.hour = 12;
  f.growth = 0.5;
  assert.ok(forageRate(s, t, fair) > 1);
  for (const weather of ['rain', 'soft-rain', 'storm', 'snow', 'blizzard']) assert.equal(forageRate(s, t, { ...fair, weather }), 0);
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

test('toggling the Bakery recipe moves waiting honey between its outputs and inputs', () => {
  const s = flatLand(), { t, r } = building(s, 'bakery', 0, -20);
  r.inputs = { flour: 1, honey: 2 };
  assert.ok(apply(s, { type: 'setRecipe', id: t.id, recipe: 'bread' }).ok);
  assert.deepEqual([r.inputs, r.outputs], [{ flour: 1 }, { honey: 2 }]);
  assert.ok(apply(s, { type: 'setRecipe', id: t.id, recipe: 'honey_cake' }).ok);
  assert.deepEqual([r.inputs, r.outputs], [{ flour: 1, honey: 2 }, {}]);
  r.inputs = { flour: 7 };
  r.outputs = { honey: 3 };
  assert.ok(apply(s, { type: 'setRecipe', id: t.id, recipe: 'honey_cake' }).ok);
  assert.deepEqual([r.inputs, r.outputs], [{ flour: 7, honey: 1 }, { honey: 2 }]);
});

test('switching to Bread with a Honey Cake batch under way never fills the Bakery past its output cap', () => {
  const s = flatLand(), { t, r } = building(s, 'bakery', 0, -20);
  const recipe = (v: 'bread' | 'honey_cake') => assert.ok(apply(s, { type: 'setRecipe', id: t.id, recipe: v }).ok);
  r.outputs = { bread: 6 };
  r.inputs = { flour: 1, eggs: 1, honey: 3 };
  r.powered = true;
  recipe('honey_cake');
  startRecipes(s);
  assert.equal(r.working, true);
  // The paid batch will make 2: no room is left for the waiting Honey, so it waits in the inputs.
  recipe('bread');
  assert.equal(outputRoom(r), 0);
  assert.deepEqual([r.inputs, r.outputs], [{ honey: 2 }, { bread: 6 }]);
  advanceRecipes(s, 2.3);
  assert.deepEqual(r.outputs, { bread: 6, honey_cake: 2 });
  startRecipes(s);
  assert.equal(totalStored(r.outputs), OUTPUT_CAP);
  assert.deepEqual(r.inputs, { honey: 2 });
  // As the carts empty the outputs, the unused Honey goes out after them.
  r.outputs = { honey_cake: 2 };
  startRecipes(s);
  assert.deepEqual([r.inputs, r.outputs], [{}, { honey_cake: 2, honey: 2 }]);
  // And back: Honey Cake takes it in again.
  recipe('honey_cake');
  assert.deepEqual([r.inputs, r.outputs], [{ honey: 2 }, { honey_cake: 2 }]);
});

test('Honey in transit to a full Bread Bakery stays on the cart and goes on to the Silo', () => {
  const s = flatLand();
  assert.ok(apply(s, { type: 'place', kind: 'garage', x: -10, z: -30, yaw: 0 }).ok);
  const bakery = building(s, 'bakery', 8, -28), silo = building(s, 'silo', -25, -28);
  silo.r.outputs.honey = 2;
  const recipe = (v: 'bread' | 'honey_cake') => assert.ok(apply(s, { type: 'setRecipe', recipe: v, id: bakery.t.id }).ok);
  recipe('honey_cake');
  for (let i = 0; i < 600 && s.sim.carts[0].cargo?.count !== 2; i++) stepCarts(s, 1, 12, []);
  assert.equal(s.sim.carts[0].cargo?.good, 'honey');
  // A Honey Cake batch under way (2 to come) beside 6 Bread: the Bakery has no room for the Honey once it bakes Bread.
  Object.assign(bakery.r, { outputs: { bread: 6 }, working: true, batch: 'honey_cake', progress: 0.5 });
  recipe('bread');
  for (let i = 0; i < 600 && silo.r.outputs.honey !== 2; i++) {
    stepCarts(s, 1, 12, []);
    assert.ok(totalStored(bakery.r.outputs) + 2 <= OUTPUT_CAP, `${JSON.stringify(bakery.r.outputs)} with a batch under way`);
  }
  assert.equal(silo.r.outputs.honey, 2);
  assert.equal(bakery.r.outputs.honey, undefined);
});

for (const target of ['coop', 'composter'] as const) test(`Mill preference dispatches bran to the ${target}`, () => {
  const s = flatLand();
  assert.ok(apply(s, { type: 'place', kind: 'garage', x: -10, z: -30, yaw: 0 }).ok);
  const mill = building(s, 'mill', 6, -28), coop = building(s, 'coop', 22, -46), composter = building(s, 'composter', -26, -28);
  mill.r.outputs.bran = 2;
  if (target === 'composter') coop.r.outputs.manure = 2;
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

test('pollination of one ribbon cell boosts only that fraction through harvest', () => {
  const s = land({ height: () => 0 }), { f, tip } = ribbon(s);
  building(s, 'beehive', tip.x + 14, tip.z).r.working = true;
  f.growth = 0.999;
  growCrops(s, 1, 1);
  assert.equal(f.pollinated, 1 / f.cellCount);
  assert.equal(f.harvestReady, fieldYield(f));
});

test('forage follows flowering area and the pantry follows the growing season', () => {
  const rate = (dots: boolean) => {
    const s = land({ height: () => 0 });
    for (const x of dots ? [-4, 0, 4] : [0]) fieldAt(s, 'beans', x + 0.5, 0.5, dots ? 0.51 : 3.6);
    const { t } = building(s, 'beehive', 0, 6);
    s.sim.hour = 12;
    const forage = () => forageRate(s, t, { windSpeed: 0, cloudCover: 0 });
    const sprouts = forage();
    for (const f of s.fields) f.growth = 0.45;
    const flowers = forage();
    assert.ok(flowers > sprouts);
    s.season = 'winter';
    assert.equal(forage(), 0);
    return flowers;
  };
  assert.ok(rate(true) < rate(false));
  for (const season of ['spring', 'summer', 'autumn', 'winter'] as const)
    assert.equal(blankState(1, season).sim.brief.order.targets.honey, season === 'winter' ? undefined : 4);
});

test('a Bakery returns honey already in transit and carts continue hauling', () => {
  const s = flatLand();
  assert.ok(apply(s, { type: 'place', kind: 'garage', x: -10, z: -30, yaw: 0 }).ok);
  const bakery = building(s, 'bakery', 8, -28), silo = building(s, 'silo', -25, -28);
  silo.r.outputs.honey = 2;
  const recipe = (v: 'bread' | 'honey_cake') => assert.ok(apply(s, { type: 'setRecipe', recipe: v, id: bakery.t.id }).ok);
  const until = (condition: () => boolean) => {
    for (let i = 0; i < 600 && !condition(); i++) stepCarts(s, 1, 12, []);
    assert.ok(condition());
  };
  recipe('honey_cake');
  until(() => s.sim.carts[0].cargo?.count === 2);
  bakery.r.inputs.honey = 1;
  recipe('bread');
  until(() => bakery.r.outputs.honey === 3);
  until(() => silo.r.outputs.honey === 3);
  bakery.r.outputs.honey_cake = 2;
  until(() => silo.r.outputs.honey_cake === 2);
  silo.r.outputs.honey_cake = 14;
  building(s, 'depot', -12, -46);
  bakery.r.outputs.honey_cake = 1;
  until(() => s.sim.delivered.honey_cake === 1);
  fieldAt(s, 'wheat', 22, -40).harvestReady = 2;
  until(() => silo.r.outputs.wheat === 2);
});

test('Manure to Silo holds the manure there and leaves a lone egg at the Coop', () => {
  const s = flatLand();
  assert.ok(apply(s, { type: 'place', kind: 'garage', x: -10, z: -30, yaw: 0 }).ok);
  const coop = building(s, 'coop', 8, -28), silo = building(s, 'silo', -25, -28);
  building(s, 'composter', 20, -46);
  coop.r.priority = 'silo';
  coop.r.outputs = { eggs: 1, manure: 1 };
  for (let i = 0; i < 250; i++) stepCarts(s, 1, 12, []);
  assert.deepEqual(silo.r.outputs, { manure: 1 });
  assert.deepEqual(coop.r.outputs, { eggs: 1 });
});
