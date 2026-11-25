import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, cellX, effectiveMoisture, must, runtimeOf, serviceSite, stepSim } from '../src/game/index.ts';
import { building, fieldAt, land, ribbon } from './helpers.ts';

test('tank reserves irrigate dry fields, drain, refill in rain, and stay bounded', () => {
  const s = land({ height: () => 8 }), field = fieldAt(s, 'wheat', 0, 0);
  const { r } = building(s, 'rain_tank', 4, 0);
  const env = { windSpeed: 0, cloudCover: 0 };
  assert.equal(r.water, 0);
  stepSim(s, 90, { ...env, weather: 'rain' });
  const filled = r.water;
  assert.ok(filled > 0);
  assert.ok(Math.abs(effectiveMoisture(s, field) - 0.32) < 1e-9);
  stepSim(s, 30, env);
  assert.ok(r.water < filled);
  r.water = 0.001;
  stepSim(s, 30, env);
  assert.equal(effectiveMoisture(s, field), 0);
  stepSim(s, 300, { ...env, weather: 'soft-rain' });
  assert.equal(r.water, 1);
  assert.ok(Math.abs(effectiveMoisture(s, field) - 0.32) < 1e-9);
});

test('only a powered sprinkler irrigates a high terrace inside its reach', () => {
  const s = land({ height: () => 12 });
  fieldAt(s, 'wheat', 0, 0);
  const far = fieldAt(s, 'beans', 30, 0), field = s.fields[0];
  const { r } = building(s, 'sprinkler', 6, 0);
  const env = { windSpeed: 12, cloudCover: 0 };
  stepSim(s, 1, env);
  assert.equal(effectiveMoisture(s, field), 0);
  building(s, 'turbine', 12, 0);
  stepSim(s, 1, env);
  assert.equal(r.watts, 1);
  assert.equal(effectiveMoisture(s, field), 0.75);
  assert.equal(effectiveMoisture(s, far), 0);
});

test('moving a tank preserves collected water and rebuilding starts empty', () => {
  const s = land({ height: () => 0 });
  const place = () => {
    const placed = apply(s, { type: 'place', kind: 'rain_tank', x: 10, z: 0, yaw: 0 });
    assert.ok(placed.ok && placed.value.created);
    return placed.value.created;
  };
  const id = place();
  stepSim(s, 10, { weather: 'rain', cloudCover: 1, windSpeed: 0 });
  const stored = runtimeOf(s, id)?.water;
  assert.ok(stored && stored > 0);
  assert.ok(apply(s, { type: 'move', id, x: 20, z: 0 }).ok);
  assert.equal(runtimeOf(s, id)?.water, stored);
  assert.ok(apply(s, { type: 'remove', id }).ok);
  assert.equal(runtimeOf(s, place())?.water, 0);
});

test('devices irrigate just their share of a ribbon and tanks split the covered area', () => {
  const s = land({ height: () => 0 }), { f, tip } = ribbon(s);
  const a = building(s, 'rain_tank', tip.x + 10, tip.z), b = building(s, 'rain_tank', tip.x + 10, tip.z);
  a.r.water = b.r.water = 1;
  s.sim.hour = 12;
  assert.equal(serviceSite(s, a.t).cells.get(f.id)?.length, 1);
  assert.equal(effectiveMoisture(s, f), 0.32 / f.cellCount);
  stepSim(s, 30, { windSpeed: 0, cloudCover: 0 });
  assert.ok(Math.abs(a.r.water - 0.9995) < 1e-9);
  assert.equal(a.r.water, b.r.water);
  const sprinkler = building(s, 'sprinkler', tip.x + 11, tip.z);
  building(s, 'turbine', tip.x + 10, tip.z + 3);
  stepSim(s, 1, { windSpeed: 10, cloudCover: 0 });
  assert.equal(effectiveMoisture(s, f), 0.75 / f.cellCount);
  stepSim(s, 1, { windSpeed: 10, cloudCover: 1, weather: 'rain' });
  assert.equal(sprinkler.r.watts, 0);
  const wet = (m: number) => { for (let i = 0; i < s.grid.fieldOf.length; i++) if (s.grid.fieldOf[i] === f.id) s.grid.moisture[i] = m; };
  wet(0.6);
  const wetReserve = a.r.water;
  stepSim(s, 1, { windSpeed: 10, cloudCover: 0 });
  assert.equal(a.r.water, wetReserve);
  assert.equal(sprinkler.r.watts, 0);
  wet(0);
  f.harvestReady = 4;
  const reserve = a.r.water;
  stepSim(s, 1, { windSpeed: 10, cloudCover: 0 });
  assert.equal(a.r.water, reserve);
  assert.equal(sprinkler.r.watts, 0);
});

test('rain waters a dry terrace while its sprinkler idles and its tank refills without draining', () => {
  const s = land({ height: () => 12 }), field = fieldAt(s, 'wheat', 0, 0);
  const sprinkler = building(s, 'sprinkler', 6, 0), tank = building(s, 'rain_tank', -4, 0);
  building(s, 'turbine', 12, 0);
  s.sim.hour = 12;
  stepSim(s, 1, { windSpeed: 12, cloudCover: 0 });
  assert.equal(sprinkler.r.watts, 1);
  for (const weather of ['soft-rain', 'rain', 'storm']) {
    tank.r.water = 0.5;
    stepSim(s, 3, { windSpeed: 12, cloudCover: 1, weather });
    assert.equal(sprinkler.r.watts, 0);
    assert.equal(field.avgMoisture, 0);
    assert.equal(effectiveMoisture(s, field, undefined, weather), 0.75);
    assert.ok(Math.abs(tank.r.water - (0.5 + 0.1 * 0.18)) < 1e-9);
  }
});

test('irrigation lifts each covered cell from its own moisture: a wet bank neither drains a tank nor keeps a sprinkler off', () => {
  const s = land({ height: () => 12 }), g = s.grid;
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: -16, z: 0 }, { x: 16, z: 0 }], radius: 3 }).ok);
  const f = s.fields[0];
  const cells: number[] = [];
  for (let i = 0; i < g.fieldOf.length; i++) if (g.fieldOf[i] === f.id) cells.push(i);
  const wetWestOf = (x: number) => {
    let wet = 0;
    for (const i of cells) { g.moisture[i] = cellX(g, i % g.nx) < x ? 1 : 0; wet += g.moisture[i]; }
    f.avgMoisture = wet / f.cellCount;
  };
  const env = { windSpeed: 12, cloudCover: 0 };
  s.sim.hour = 12;

  // A wet bank at the west tip of an otherwise dry field: a tank reaching only the bank neither lifts nor drains.
  wetWestOf(-10);
  assert.ok(f.avgMoisture < 0.32);
  const tank = building(s, 'rain_tank', -26, 0);
  tank.r.water = 1;
  const reach = must(serviceSite(s, tank.t).cells.get(f.id), 'tank reach');
  assert.ok(reach.length > 0 && reach.every((i) => g.moisture[i] === 1));
  assert.equal(effectiveMoisture(s, f), f.avgMoisture);
  stepSim(s, 30, env);
  assert.equal(tank.r.water, 1);

  // The west half wet, the east half dry (the field's mean above the sprinkler's threshold): a sprinkler reaching only
  // the dry east end runs, and lifts just those cells.
  wetWestOf(0);
  assert.ok(f.avgMoisture >= 0.45);
  const east = cells.filter((i) => g.moisture[i] === 0);
  const sprinkler = building(s, 'sprinkler', 26, 0);
  building(s, 'turbine', 30, 4);
  const spray = must(serviceSite(s, sprinkler.t).cells.get(f.id), 'sprinkler reach');
  assert.ok(spray.length > 0 && spray.every((i) => g.moisture[i] === 0));
  stepSim(s, 1, env);
  assert.equal(sprinkler.r.watts, 1);
  assert.ok(Math.abs(effectiveMoisture(s, f) - (f.avgMoisture + 0.75 * spray.length / f.cellCount)) < 1e-9);
  assert.ok(east.length > spray.length);

  // Once the cells it reaches are wet, it idles even though the rest of the field is dry.
  for (const i of spray) g.moisture[i] = 0.5;
  stepSim(s, 1, env);
  assert.equal(sprinkler.r.watts, 0);
});
