// The Weather Station and the Heated Greenhouse (Milestone 4): the forecast once a station stands, a crop grown under
// glass whatever the weather, heated harder in the cold, and a warm place for winter bees.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, blankState, countOf, demandOf, describeRuntime, describeWeather, forageRate, type GameState,
  GREENHOUSE_COLD_C, GREENHOUSE_COLD_W, GREENHOUSE_HOURS, GREENHOUSE_MILD_W, GREENHOUSE_YIELD, growCrops, growGreenhouses,
  hasWeatherStation, must, OUTPUT_CAP, PANTRY_ORDERS, sandboxSupplies, stationForecast, stepSim, type ThingKind,
  warmGreenhouseNear,
} from '../src/game/index.ts';
import { building, fieldAt, flatLand, land } from './helpers.ts';

const put = (s: GameState, kind: ThingKind, x: number, z: number, yaw = 0) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};
const rt = (s: GameState, id: number) => must(s.sim.things.get(id), 'its runtime');

test('a Weather Station brings the forecast, and its card reads the sky', () => {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  assert.ok(!hasWeatherStation(s));
  assert.deepEqual(stationForecast(s), [], 'no forecast before the station');
  const id = put(s, 'weather_station', -10, -20);
  assert.ok(hasWeatherStation(s));
  const days = stationForecast(s);
  assert.equal(days.length, 3);
  assert.deepEqual(days.map((d) => d.day), [s.sim.day + 1, s.sim.day + 2, s.sim.day + 3]);
  for (const d of days) assert.ok(d.minTempC <= d.maxTempC && d.label && d.icon);
  assert.equal(describeRuntime(s, rt(s, id)), describeWeather(s));
});

test('the Greenhouse grows the crop it is set to, and only a greenhouse takes a crop', () => {
  const s = flatLand(), { t, r } = building(s, 'greenhouse', -20, -30), mill = building(s, 'mill', 10, -30);
  assert.equal(r.greenhouseCrop, 'beans', 'beans by default');
  assert.ok(apply(s, { type: 'setGreenhouseCrop', id: t.id, crop: 'wheat' }).ok);
  assert.equal(r.greenhouseCrop, 'wheat');
  assert.ok(!apply(s, { type: 'setGreenhouseCrop', id: mill.t.id, crop: 'beans' }).ok, 'not a greenhouse');
  assert.ok(!apply(s, { type: 'setGreenhouseCrop', id: t.id, crop: 'turnips' as 'beans' }).ok, 'not a crop');
  assert.ok(!apply(s, { type: 'setGreenhouseCrop', id: 9999, crop: 'beans' }).ok, 'nothing there');
  r.powered = true;
  growGreenhouses(s, GREENHOUSE_HOURS - 0.01);
  assert.equal(countOf(r.outputs, 'wheat'), 0);
  growGreenhouses(s, 0.02);
  assert.equal(countOf(r.outputs, 'wheat'), GREENHOUSE_YIELD);
  assert.match(describeRuntime(s, r), /under glass/);
  // Unpowered, it waits; full, it stops and asks for nothing.
  r.powered = false;
  growGreenhouses(s, GREENHOUSE_HOURS * 2);
  assert.equal(countOf(r.outputs, 'wheat'), GREENHOUSE_YIELD);
  r.powered = true;
  r.outputs = { wheat: OUTPUT_CAP };
  growGreenhouses(s, GREENHOUSE_HOURS * 2);
  assert.equal(r.working, false);
  assert.equal(demandOf(s, t, r, 12), 0);
});

test('the Greenhouse draws 2 W in the cold and 0.5 W in mild air', () => {
  const s = flatLand(), { t, r } = building(s, 'greenhouse', -20, -30);
  r.working = true;
  s.sim.weather.tempC = GREENHOUSE_COLD_C - 0.5;
  assert.equal(demandOf(s, t, r, 12), GREENHOUSE_COLD_W);
  assert.equal(GREENHOUSE_COLD_W, 2);
  s.sim.weather.tempC = GREENHOUSE_COLD_C + 5;
  assert.equal(demandOf(s, t, r, 12), GREENHOUSE_MILD_W);
  assert.equal(GREENHOUSE_MILD_W, 0.5);
});

test('frost, snow and flood stop the fields but never the glass', () => {
  const s = land({ height: () => 0 });
  const beans = fieldAt(s, 'beans', 20, 0, 4), { r } = building(s, 'greenhouse', -20, 0);
  r.powered = true;
  beans.growth = 0.5;
  s.sim.hour = 4;
  Object.assign(s.sim.weather, { tempC: -6, snowDepth: 0.5 });
  growCrops(s, 2, 0);
  growGreenhouses(s, 2);
  assert.ok(beans.frosted, 'the beans are frosted');
  assert.ok(beans.growth < 0.5, 'and set back');
  s.sim.weather.floodSurge = 0.3;
  beans.flooded = true;
  growGreenhouses(s, GREENHOUSE_HOURS);
  assert.equal(countOf(r.outputs, 'beans'), GREENHOUSE_YIELD, 'the glass grew on through it all');
});

test('carts take the Greenhouse\'s crop where it\'s wanted, and a glut of it to the Silo', () => {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  s.sim.weatherOverride = 'clear';
  put(s, 'farmhouse', -10, -16);
  put(s, 'garage', 6, -16, Math.PI);
  const silo = put(s, 'silo', 6, -46), glass = put(s, 'greenhouse', -24, -40), mill = put(s, 'mill', 24, -30, Math.PI);
  for (const x of [-18, -2, 14]) put(s, 'turbine', x, -26);
  assert.ok(apply(s, { type: 'setGreenhouseCrop', id: glass, crop: 'wheat' }).ok);
  rt(s, glass).outputs = { wheat: 2, beans: 4 };
  const ground = () => countOf(rt(s, mill).inputs, 'wheat') + countOf(rt(s, mill).outputs, 'flour') + rt(s, mill).made;
  for (let k = 0; k < 4 * 30 && (ground() === 0 || countOf(rt(s, silo).outputs, 'beans') < 2); k++) stepSim(s, 1, { windSpeed: 12, cloudCover: 0 });
  assert.ok(ground() > 0, 'the Mill got the greenhouse wheat');
  assert.equal(countOf(rt(s, glass).outputs, 'wheat'), 0);
  assert.ok(countOf(rt(s, silo).outputs, 'beans') >= 2, 'the spare beans went to the Silo');
});

test('winter bees forage by day in a warm Greenhouse within their reach, and stay in otherwise', () => {
  const s = land({ height: () => 0 }), env = { windSpeed: 3, cloudCover: 0.2 };
  s.season = 'winter';
  s.sim.hour = 12;
  s.sim.weather.tempC = -4;
  const hive = building(s, 'beehive', 0, 0), glass = building(s, 'greenhouse', 12, 0);
  assert.equal(forageRate(s, hive.t, env), 0, 'cold glass: the bees stay in');
  glass.r.powered = true;
  glass.r.working = true;
  assert.ok(warmGreenhouseNear(s, hive.t));
  assert.ok(forageRate(s, hive.t, env) >= 1, 'a warm greenhouse within 14 m');
  assert.ok(forageRate(s, hive.t, { ...env, weather: 'blizzard' }) >= 1, 'whatever the weather outside');
  s.sim.hour = 1;
  assert.equal(forageRate(s, hive.t, env), 0, 'not by night');
  s.sim.hour = 12;
  const far = building(s, 'beehive', -20, 0);
  assert.equal(forageRate(s, far.t, env), 0, 'too far from the glass');
  glass.r.powered = false;
  assert.equal(forageRate(s, hive.t, env), 0, 'an unpowered greenhouse is cold');
  // In a mild spring the bees forage outdoors only in air of 10°C or more.
  const spring = land({ height: () => 0 });
  fieldAt(spring, 'beans', 0, 0, 5).growth = 0.5;
  const out = building(spring, 'beehive', 8, 0);
  spring.sim.hour = 12;
  spring.sim.weather.tempC = 8;
  assert.equal(forageRate(spring, out.t, env), 0, 'too cold to fly');
  spring.sim.weather.tempC = 14;
  assert.ok(forageRate(spring, out.t, env) > 0);
});

test('each season brings its own Pantry Order', () => {
  for (const season of ['spring', 'summer', 'autumn', 'winter'] as const)
    assert.deepEqual(blankState(1, season).sim.brief.order.targets, PANTRY_ORDERS[season]);
  assert.deepEqual(PANTRY_ORDERS.winter, { bread: 8, flour: 6, beans: 6, honey: 2 });
});
