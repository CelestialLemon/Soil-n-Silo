import assert from 'node:assert/strict';
import { test } from 'node:test';
import { effectiveMoisture, stepSim } from '../src/game/index.ts';
import { building, fieldAt, land } from './helpers.ts';

test('tank reserves irrigate dry fields, drain, refill in rain, and stay bounded', () => {
  const s = land({ height: () => 8 }), field = fieldAt(s, 'wheat', 0, 0);
  const { r } = building(s, 'rain_tank', 8, 0);
  const env = { windSpeed: 0, cloudCover: 0 };
  assert.equal(r.water, 0.6);
  assert.equal(effectiveMoisture(s, field), 0.32);
  stepSim(s, 30, env);
  assert.ok(r.water < 0.6);
  r.water = 0.001;
  stepSim(s, 30, env);
  assert.equal(effectiveMoisture(s, field), 0);
  stepSim(s, 240, { ...env, weather: 'soft-rain' });
  assert.equal(r.water, 1);
  assert.equal(effectiveMoisture(s, field), 0.32);
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
