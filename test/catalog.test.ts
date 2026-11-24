import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CATALOG, RACE_START, THING_KINDS } from '../src/game/index.ts';

interface Model { lo: [number, number, number]; hi: [number, number, number]; group: string }
const models = JSON.parse(readFileSync(new URL('../brush3d/src/models/index.json', import.meta.url), 'utf8')) as Record<string, Model>;

test('every thing is drawn with one of brush3d\'s models', () => {
  assert.deepEqual([...THING_KINDS].sort(), [
    'bakery', 'battery', 'bench', 'composter', 'coop', 'crates', 'depot', 'farmhouse', 'garage', 'lantern', 'mill', 'planter', 'relay',
    'silo', 'solar', 'turbine', 'waterwheel',
  ]);
  for (const k of THING_KINDS) assert.ok(models[CATALOG[k].model], `${k}: model ${CATALOG[k].model}`);
});

test("footprints are the models' real bounds, in metres", () => {
  for (const k of THING_KINDS) {
    const d = CATALOG[k], m = models[d.model];
    assert.deepEqual([d.lo[0], d.lo[1]], [m.lo[0], m.lo[2]], `${k}: lo`);
    assert.deepEqual([d.hi[0], d.hi[1]], [m.hi[0], m.hi[2]], `${k}: hi`);
    assert.equal(d.top, m.hi[1], `${k}: top`);
    assert.equal(d.halfW, (m.hi[0] - m.lo[0]) / 2);
    assert.equal(d.halfD, (m.hi[2] - m.lo[2]) / 2);
    assert.equal(d.offX, (m.hi[0] + m.lo[0]) / 2);
    assert.equal(d.offZ, (m.hi[2] + m.lo[2]) / 2);
    if (!d.onBank) assert.deepEqual(d.core, { halfW: d.halfW, halfD: d.halfD, offX: d.offX, offZ: d.offZ });
  }
  // The farmhouse is 11.6 m square, not three 4 m tiles.
  assert.equal(CATALOG.farmhouse.halfW * 2, 11.6);
});

test("the water wheel's house is its core; its race runs out in front of it", () => {
  const w = CATALOG.waterwheel;
  assert.ok(w.onBank);
  assert.ok(Math.abs(w.core.offZ + w.core.halfD - RACE_START) < 1e-9);
  assert.ok(Math.abs(w.core.offZ - w.core.halfD - w.lo[1]) < 1e-9);
  assert.ok(w.raceOffset > RACE_START && w.raceOffset < w.hi[1]);
});

test('the roster: one of each homestead building, repeatable power, free props', () => {
  const oneOfEach = THING_KINDS.filter((k) => CATALOG[k].oneOfEach).sort();
  assert.deepEqual(oneOfEach, ['bakery', 'composter', 'coop', 'depot', 'farmhouse', 'garage', 'mill', 'silo']);
  assert.deepEqual(THING_KINDS.filter((k) => CATALOG[k].allowOnField), ['solar']);
  for (const k of ['solar', 'turbine', 'waterwheel'] as const) assert.equal(CATALOG[k].powerRole, 'source');
  assert.equal(CATALOG.battery.powerRole, 'store');
  assert.equal(CATALOG.relay.powerRole, 'relay');
  assert.equal(CATALOG.relay.category, 'power');
  for (const k of ['farmhouse', 'silo', 'mill', 'bakery', 'coop', 'garage', 'lantern'] as const) assert.equal(CATALOG[k].powerRole, 'load');
  // Pure biology and the settlement's landing need no power.
  for (const k of ['composter', 'depot'] as const) assert.equal(CATALOG[k].powerRole, 'none');
  for (const k of ['bench', 'planter', 'crates'] as const) { assert.equal(CATALOG[k].category, 'prop'); assert.equal(CATALOG[k].powerRole, 'none'); }
  for (const k of THING_KINDS) {
    const d = CATALOG[k];
    assert.ok(d.label.length > 0 && d.maxSlope > 0 && d.padEase >= 0 && d.top > 0);
    // Power is wireless: only what makes or passes on a field reaches out, and none of it by wire.
    assert.equal(d.powerRange > 0, d.powerRole === 'source' || d.powerRole === 'store' || d.powerRole === 'relay', `${k}: its field`);
    // The Depot alone stands on the ground as it is: it's set when the valley grows, which leaves the land its own.
    if (d.category === 'homestead' && k !== 'depot') assert.ok(d.padEase >= 2.5 && d.padEase <= 3.5, `${k} settles a soft pad`);
  }
});

test('Supplies costs: land-craft, the home and props free; workshops 2, tech 1 to 3; only the Depot is fixed', () => {
  const cost = Object.fromEntries(THING_KINDS.map((k) => [k, CATALOG[k].cost]));
  assert.deepEqual(cost, {
    farmhouse: 0, silo: 2, mill: 2, bakery: 2, coop: 2, composter: 2, garage: 2, depot: 0, solar: 1, turbine: 3, waterwheel: 3,
    battery: 1, relay: 0, bench: 0, lantern: 0, planter: 0, crates: 0,
  });
  assert.deepEqual(THING_KINDS.filter((k) => CATALOG[k].immovable), ['depot']);
  assert.deepEqual(Object.fromEntries(THING_KINDS.filter((k) => CATALOG[k].powerDemand > 0).map((k) => [k, CATALOG[k].powerDemand])),
    { farmhouse: 0.5, mill: 2, bakery: 2.5, coop: 0.5, garage: 1.5, lantern: 0.05 });
});
