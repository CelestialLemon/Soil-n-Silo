import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CATALOG, RACE_START, THING_KINDS } from '../src/game/index.ts';

interface Model { lo: [number, number, number]; hi: [number, number, number]; group: string }
const models = JSON.parse(readFileSync(new URL('../brush3d/src/models/index.json', import.meta.url), 'utf8')) as Record<string, Model>;

test('every starter thing is drawn with one of brush3d\'s models', () => {
  assert.deepEqual([...THING_KINDS].sort(), ['bakery', 'battery', 'bench', 'crates', 'farmhouse', 'lantern', 'mill', 'planter', 'pylon', 'relay', 'silo', 'solar', 'turbine', 'waterwheel']);
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
  assert.deepEqual(oneOfEach, ['bakery', 'farmhouse', 'mill', 'silo']);
  assert.deepEqual(THING_KINDS.filter((k) => CATALOG[k].allowOnField), ['solar']);
  for (const k of ['solar', 'turbine', 'waterwheel'] as const) assert.equal(CATALOG[k].powerRole, 'source');
  assert.equal(CATALOG.battery.powerRole, 'store');
  assert.equal(CATALOG.pylon.powerRole, 'pylon');
  assert.equal(CATALOG.relay.powerRole, 'relay');
  for (const k of ['farmhouse', 'silo', 'mill', 'bakery', 'lantern'] as const) assert.equal(CATALOG[k].powerRole, 'load');
  for (const k of ['bench', 'planter', 'crates'] as const) { assert.equal(CATALOG[k].category, 'prop'); assert.equal(CATALOG[k].powerRole, 'none'); }
  for (const k of THING_KINDS) {
    const d = CATALOG[k];
    assert.ok(d.label.length > 0 && d.maxSlope > 0 && d.padEase >= 0 && d.wireY > 0 && d.wireY <= Math.max(d.top, 0.8));
    if (d.category === 'homestead') assert.ok(d.padEase >= 2.5 && d.padEase <= 3.5, `${k} settles a soft pad`);
  }
});
