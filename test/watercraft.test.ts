import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, effectiveMoisture, runtimeOf, serviceSite, stepSim } from '../src/game/index.ts';
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
  f.avgMoisture = 0.6;
  const wetReserve = a.r.water;
  stepSim(s, 1, { windSpeed: 10, cloudCover: 0 });
  assert.equal(a.r.water, wetReserve);
  assert.equal(sprinkler.r.watts, 0);
  f.avgMoisture = 0;
  f.harvestReady = 4;
  const reserve = a.r.water;
  stepSim(s, 1, { windSpeed: 10, cloudCover: 0 });
  assert.equal(a.r.water, reserve);
  assert.equal(sprinkler.r.watts, 0);
});
