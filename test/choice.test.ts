import assert from 'node:assert/strict';
import { test } from 'node:test';
import { choicesOf, place, remember, settingFor, settingName, stepSetting } from '../src/game/build.ts';
import { CROP_IDS } from '../src/game/data.ts';
import { placement } from '../src/game/forecast.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { newGame, type GameState } from '../src/game/state.ts';

// Choosing a field's crop or a bakery's recipe while placing it, and the choice remembered for the level.

function flat(): GameState {
  const sc: Scenario = { ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 } };
  return newGame(sc);
}

test('only the field and the bakery offer a choice', () => {
  assert.deepEqual(choicesOf('field').map((c) => c.crop), [...CROP_IDS]);
  assert.deepEqual(choicesOf('bakery').map((c) => c.recipe), ['bread', 'honeycake']);
  for (const t of ['silo', 'mill', 'hive', 'garage'] as const) assert.deepEqual(choicesOf(t), []);
});

test('a field is placed growing the chosen crop, and a bakery making the chosen recipe', () => {
  const s = flat();
  const f = place(s, 'field', 2, 2, 0, { crop: 'beans' });
  assert.ok(f.ok && f.value.building.crop === 'beans');
  assert.match(f.ok ? f.value.message : '', /\(beans\)/);
  const b = place(s, 'bakery', 10, 2, 0, { recipe: 'honeycake' });
  assert.ok(b.ok && b.value.building.recipe === 'honeycake');
  assert.match(b.ok ? b.value.message : '', /\(honey cake\)/);
});

test('without a setting a building keeps its default', () => {
  const s = flat();
  const f = place(s, 'field', 2, 2, 0), b = place(s, 'bakery', 10, 2, 0);
  assert.ok(f.ok && f.value.building.crop === 'wheat');
  assert.ok(b.ok && b.value.building.recipe === 'bread');
});

test('a setting that does not fit the type is a bug and throws; a refused placement does not need one', () => {
  const s = flat();
  assert.throws(() => place(s, 'bakery', 10, 2, 0, { crop: 'beans' }));
  assert.throws(() => place(s, 'field', 2, 2, 0, { recipe: 'bread' }));
  assert.throws(() => place(s, 'silo', 20, 2, 0, { crop: 'beans' }));
  s.credits = 0;
  assert.equal(place(s, 'field', 2, 2, 0, { crop: 'beans' }).ok, false);
  assert.equal(s.buildings.length, 1, 'only the depot');
});

test('the level remembers the last choice for each type, and starts on wheat and bread', () => {
  const s = flat();
  assert.deepEqual(settingFor(s, 'field'), { crop: 'wheat' });
  assert.deepEqual(settingFor(s, 'bakery'), { recipe: 'bread' });
  assert.deepEqual(settingFor(s, 'silo'), {});
  remember(s, 'field', { crop: 'flax' });
  remember(s, 'bakery', { recipe: 'honeycake' });
  assert.deepEqual(settingFor(s, 'field'), { crop: 'flax' });
  assert.deepEqual(settingFor(s, 'bakery'), { recipe: 'honeycake' });
  remember(s, 'bakery', { crop: 'flax' });
  remember(s, 'silo', { crop: 'flax' });
  assert.deepEqual(settingFor(s, 'bakery'), { recipe: 'honeycake' }, 'a setting for another kind is left out');
  assert.deepEqual(flat().chosen, { crop: 'wheat', recipes: {} }, 'a new level starts over');
});

test('the remembered choice survives a save', () => {
  const s = flat();
  remember(s, 'field', { crop: 'tomato' });
  remember(s, 'bakery', { recipe: 'honeycake' });
  const back = deserialize(serialize(s));
  assert.ok(back.ok);
  if (back.ok) assert.deepEqual(back.value.chosen, { crop: 'tomato', recipes: { bakery: 'honeycake' } });
  const broken = JSON.parse(serialize(s));
  broken.chosen.crop = 'gold';
  assert.equal(deserialize(JSON.stringify(broken)).ok, false);
  broken.chosen = { crop: 'wheat', recipes: { bakery: 'sauce' } };
  assert.equal(deserialize(JSON.stringify(broken)).ok, false, 'a recipe the building does not work');
  for (const crop of ['__proto__', 'toString']) assert.equal(deserialize(JSON.stringify({ ...JSON.parse(serialize(s)), chosen: { crop, recipes: {} } })).ok, false, 'a name every object has');
});

test('stepping goes round the choices both ways, and names them', () => {
  assert.deepEqual(stepSetting('field', { crop: 'wheat' }, 1), { crop: 'beans' });
  assert.deepEqual(stepSetting('field', { crop: 'wheat' }, -1), { crop: 'flax' });
  assert.deepEqual(stepSetting('field', { crop: 'flax' }, 1), { crop: 'wheat' });
  assert.deepEqual(stepSetting('bakery', { recipe: 'honeycake' }, 1), { recipe: 'bread' });
  assert.deepEqual(stepSetting('silo', {}, 1), {});
  assert.equal(settingName({ crop: 'sunflower' }), 'sunflower');
  assert.equal(settingName({ recipe: 'honeycake' }), 'honey cake');
  assert.equal(settingName({}), '');
});

test('the placement card speaks of the choice in hand', () => {
  const s = flat();
  assert.equal(placement(s, 'field', 2, 2).facts[0].label, 'Wheat');
  assert.equal(placement(s, 'field', 2, 2, { crop: 'beans' }).facts[0].label, 'Beans');
  const bread = placement(s, 'bakery', 10, 2).facts[0], cake = placement(s, 'bakery', 10, 2, { recipe: 'honeycake' }).facts[0];
  assert.match(bread.sub, /bread/);
  assert.match(cake.sub, /honey cake/);
});

test('the placement card counts a hive\'s pollination for a flowering crop only', () => {
  const s = flat();
  place(s, 'hive', 8, 2, 0);
  const beans = placement(s, 'field', 2, 2, { crop: 'beans' }).facts[0], far = placement(s, 'field', 20, 20, { crop: 'beans' }).facts[0];
  assert.ok(parseFloat(beans.value.slice(1)) > parseFloat(far.value.slice(1)), 'beans near a hive yield more');
  assert.equal(placement(s, 'field', 2, 2).facts[0].value, placement(s, 'field', 20, 20).facts[0].value, 'wheat does not flower');
});
