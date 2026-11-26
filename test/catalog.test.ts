import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CATALOG, RACE_START, THING_KINDS, type ThingKind, WORKSHOP_KINDS } from '../src/game/index.ts';

interface Model { lo: [number, number, number]; hi: [number, number, number]; group: string }
const models = JSON.parse(readFileSync(new URL('../brush3d/src/models/index.json', import.meta.url), 'utf8')) as Record<string, Model>;

test('every thing is drawn with one of brush3d\'s models', () => {
  assert.deepEqual([...THING_KINDS].sort(), [
    'bakery', 'battery', 'beehive', 'bench', 'cannery', 'composter', 'coop', 'crates', 'depot', 'digester', 'farmhouse', 'garage', 'greenhouse',
    'lantern', 'loom', 'mill', 'oil_press', 'planter', 'rain_tank', 'relay', 'silo', 'solar', 'spinner', 'sprinkler', 'turbine', 'waterwheel',
    'weather_station',
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
  assert.deepEqual(oneOfEach, [
    'bakery', 'cannery', 'composter', 'coop', 'depot', 'digester', 'farmhouse', 'garage', 'greenhouse', 'loom', 'mill', 'oil_press', 'silo', 'spinner',
    'weather_station',
  ]);
  assert.deepEqual(THING_KINDS.filter((k) => CATALOG[k].allowOnField), ['solar']);
  for (const k of ['solar', 'turbine', 'waterwheel', 'digester'] as const) assert.equal(CATALOG[k].powerRole, 'source');
  assert.equal(CATALOG.battery.powerRole, 'store');
  assert.equal(CATALOG.relay.powerRole, 'relay');
  assert.equal(CATALOG.relay.category, 'power');
  for (const k of ['farmhouse', 'silo', 'mill', 'bakery', 'coop', 'garage', 'lantern', 'greenhouse', 'oil_press', 'cannery', 'spinner', 'loom'] as const) assert.equal(CATALOG[k].powerRole, 'load');
  // Pure biology, the settlement's landing and the weather's instruments need no power.
  for (const k of ['composter', 'depot', 'weather_station'] as const) assert.equal(CATALOG[k].powerRole, 'none');
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
    rain_tank: 1, sprinkler: 1, beehive: 1, battery: 1, relay: 0, bench: 0, lantern: 0, planter: 0, crates: 0, weather_station: 1, greenhouse: 3,
    oil_press: 2, cannery: 2, spinner: 2, loom: 2, digester: 3,
  });
  assert.deepEqual(THING_KINDS.filter((k) => CATALOG[k].immovable), ['depot']);
  assert.deepEqual(Object.fromEntries(THING_KINDS.filter((k) => CATALOG[k].powerDemand > 0).map((k) => [k, CATALOG[k].powerDemand])),
    { farmhouse: 0.5, mill: 2, bakery: 2.5, coop: 0.5, garage: 1.5, greenhouse: 2, oil_press: 1.5, cannery: 2, spinner: 1.5, loom: 2, lantern: 0.05, sprinkler: 1 });
});

test('the Milestone 4 buildings: the Weather Station and the Heated Greenhouse, one of each, on their models\' real bounds', () => {
  const ws = CATALOG.weather_station, gh = CATALOG.greenhouse;
  assert.deepEqual([ws.label, ws.model, ws.category, ws.oneOfEach, ws.cost, ws.powerRole, ws.powerDemand, ws.padEase, ws.maxSlope],
    ['Weather Station', 'weather_station', 'homestead', true, 1, 'none', 0, 2.5, 0.18]);
  assert.deepEqual([ws.lo, ws.hi, ws.top], [[-1.54, -1.85], [1.91, 1.52], 4.67]);
  assert.deepEqual([gh.label, gh.model, gh.category, gh.oneOfEach, gh.cost, gh.powerRole, gh.powerDemand, gh.padEase, gh.maxSlope],
    ['Heated Greenhouse', 'greenhouse', 'homestead', true, 3, 'load', 2, 3, 0.14]);
  assert.deepEqual([gh.lo, gh.hi, gh.top], [[-5.5, -5.65], [5.64, 5.96], 5.26]);
});

test('the Milestone 5A buildings: four craft workshops and the Biogas Digester, one of each, on their models\' real bounds', () => {
  const spec = (k: ThingKind) => { const d = CATALOG[k]; return [d.label, d.model, d.category, d.oneOfEach, d.cost, d.powerRole, d.powerDemand, d.padEase, d.maxSlope, d.lo, d.hi, d.top]; };
  assert.deepEqual(spec('oil_press'), ['Oil Press', 'oil_press', 'homestead', true, 2, 'load', 1.5, 3, 0.14, [-3.83, -3.75], [3.75, 3.75], 5.38]);
  assert.deepEqual(spec('cannery'), ['Cannery', 'cannery', 'homestead', true, 2, 'load', 2, 3, 0.14, [-3.75, -3.75], [3.85, 3.75], 5.6]);
  assert.deepEqual(spec('spinner'), ['Spinner', 'spinner', 'homestead', true, 2, 'load', 1.5, 3, 0.14, [-3.75, -3.8], [3.75, 3.75], 4.6]);
  assert.deepEqual(spec('loom'), ['Loom', 'loom', 'homestead', true, 2, 'load', 2, 3, 0.14, [-3.75, -3.75], [3.75, 3.75], 4.38]);
  assert.deepEqual(spec('digester'), ['Biogas Digester', 'digester', 'power', true, 3, 'source', 0, 3, 0.16, [-3.78, -3.78], [3.78, 3.78], 6.95]);
  assert.equal(CATALOG.digester.powerRange, 15);
  assert.deepEqual([...WORKSHOP_KINDS], ['mill', 'coop', 'bakery', 'composter', 'oil_press', 'cannery', 'spinner', 'loom']);
});
