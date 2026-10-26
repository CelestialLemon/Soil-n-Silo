import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place, remove, removeAt } from '../src/game/build.ts';
import { BUILDINGS, DAY_SECONDS, type BuildingId } from '../src/game/data.ts';
import { eventOn, startEvent, type WeatherEvent } from '../src/game/events.ts';
import { placement } from '../src/game/forecast.ts';
import { forecastAt, issueTimeOf } from '../src/game/outlook.ts';
import { TERRAIN } from '../src/game/map.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf } from '../src/game/seasons.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { wants } from '../src/game/sim/energy.ts';
import { advance } from '../src/game/sim/step.ts';
import { dropForecastIfNone, FAULT_WORDS, hasStation, renewNow, stationFault, stationForecast, stationsOf, stationWorking } from '../src/game/station.ts';
import { newGame, type BuildingOf, type Dir, type GameState } from '../src/game/state.ts';
import { PLAIN } from '../src/game/ground.ts';

const HOUR = DAY_SECONDS / 24;
const CLEAR = { ...climateOf('spring', 'mild'), conditions: { cloud: 0, rain: 0, calm: 0 }, warmth: { low: 15, high: 15, drift: 0 } };

/** A 30 × 30 flat valley with a river at x = 2–3, the given weather ahead and credits to spare; the game starts at `time`. */
function valley(events: WeatherEvent[] = [], time = 0): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events,
    terrain: { ground: PLAIN, water: 'river', forest: 0, rock: 0, relief: 0 }, climate: CLEAR,
  };
  const s = newGame(sc);
  s.map.terrain.fill(TERRAIN.grass);
  s.map.corner.fill(0);
  for (let y = 0; y < 30; y++) for (let x = 2; x <= 3; x++) s.map.terrain[y * 30 + x] = TERRAIN.water;
  s.map.depot.x = 20; s.map.depot.y = 20;
  s.buildings[0].x = 20; s.buildings[0].y = 20;
  s.time = time;
  return s;
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number, rot: Dir = 0): BuildingOf<K> {
  const r = place(s, type, x, y, rot);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

/** A station at (10, 10) with a pylon beside it and a turbine to run it (a calm-free spring day: the wind blows by itself). */
function powered(events: WeatherEvent[] = [], time = 0) {
  const s = valley(events, time);
  const station = put(s, 'station', 10, 10);
  const pylon = put(s, 'pylon', 11, 10);
  const turbine = put(s, 'turbine', 12, 12);
  return { s, station, pylon, turbine };
}

const hour = (s: GameState, n: number) => advance(s, n * HOUR);

test('the station is a 1 × 1 powered building of 80 credits and 3 W, in the Power category', () => {
  const d = BUILDINGS.station;
  assert.deepEqual([d.size, d.cost, d.power, d.category], [1, 80, 3, 'power']);
  assert.ok(!d.tall, 'it must not shelter a turbine');
  const s = valley();
  const before = s.credits;
  const b = put(s, 'station', 10, 10);
  assert.equal(before - s.credits, 80);
  assert.ok(hasStation(s));
  assert.deepEqual(stationsOf(s), [b]);
});

test('its placement card says the valley already has a station, once one stands, and says nothing before', () => {
  const s = valley();
  const first = placement(s, 'station', 10, 10);
  assert.ok(first.facts.every((f) => !/already/i.test(f.value + f.sub)), 'no station yet');
  assert.ok(first.facts.some((f) => f.label === 'Forecast'));
  put(s, 'station', 10, 10);
  const second = placement(s, 'station', 14, 14);
  const fact = second.facts.find((f) => f.label === 'Station');
  assert.equal(fact?.sub, 'The valley already has a station: a second adds nothing');
  assert.equal(fact?.tone, undefined, 'a fact, not a warning');
  // Placing a second one is still allowed.
  put(s, 'station', 14, 14);
  assert.equal(stationsOf(s).length, 2);
});

test('it draws 3 W all the time', () => {
  const { s, station } = powered();
  assert.equal(wants(s, station), 3);
});

test('a powered station renews the forecast at every whole game hour, and nothing is issued before it has power', () => {
  const { s } = powered([], 25);
  assert.equal(s.forecastIssued, null);
  assert.equal(stationForecast(s), null);
  advance(s, 0.1);
  assert.equal(s.forecastIssued, issueTimeOf(s.time), 'issued as soon as it works');
  for (let k = 0; k < 30; k++) {
    hour(s, 0.37);
    const f = stationForecast(s);
    assert.ok(f && !f.stale && f.reason === null);
    assert.equal(f.issued, issueTimeOf(s.time));
    assert.deepEqual(f.forecast, forecastAt(s.scenario, f.issued));
    assert.equal(s.forecastIssued, f.issued, 'only that hour is kept');
  }
});

test('a station with no pylon in reach gives no forecast at all, and says why', () => {
  const s = valley();
  put(s, 'station', 10, 10);
  hour(s, 2);
  assert.equal(stationForecast(s), null);
  assert.equal(s.forecastIssued, null);
  assert.equal(stationFault(s), 'nolink');
  assert.ok(!stationWorking(s));
});

test('without power it keeps its last forecast, marked out of date and why, and stops renewing; power brings it back', () => {
  const { s, turbine } = powered();
  hour(s, 5.5);
  const last = s.forecastIssued;
  assert.equal(last, issueTimeOf(s.time));
  remove(s, turbine);
  hour(s, 3);
  assert.equal(s.forecastIssued, last, 'no renewal');
  const f = stationForecast(s);
  assert.ok(f && f.stale);
  assert.equal(f.issued, last);
  assert.equal(f.reason, 'power');
  assert.equal(FAULT_WORDS[f.reason as 'power'], 'no power');
  assert.deepEqual(f.forecast, forecastAt(s.scenario, last), 'it is what the last forecast said');
  assert.match(describeStatus(s, stationsOf(s)[0]), /No power/);
  put(s, 'turbine', 12, 12);
  hour(s, 0.3);
  const g = stationForecast(s);
  assert.ok(g && !g.stale && g.issued === issueTimeOf(s.time));
});

test('a station cut off from the grid keeps the forecast and says no pylon reaches it', () => {
  const { s, pylon } = powered();
  hour(s, 2.2);
  const last = s.forecastIssued;
  remove(s, pylon);
  hour(s, 2);
  const f = stationForecast(s);
  assert.ok(f && f.stale && f.issued === last);
  assert.equal(f.reason, 'nolink');
});

test('the moment power is lost the forecast is out of date, not an hour later', () => {
  const { s, turbine } = powered([], 25);
  advance(s, HOUR * 0.5);
  const issued = s.forecastIssued;
  assert.equal(stationForecast(s)?.stale, false);
  remove(s, turbine);
  advance(s, 0.3);
  assert.equal(issueTimeOf(s.time), issued, 'still the same hour');
  const f = stationForecast(s);
  assert.ok(f && f.stale && f.reason === 'power' && f.issued === issued);
});

test('a station short of power (not none) stops renewing too', () => {
  const { s } = powered();
  advance(s, HOUR * 1.2);
  const last = s.forecastIssued;
  for (const [x, y] of [[8, 8], [9, 8], [8, 9], [9, 9], [13, 8], [14, 8], [13, 9], [14, 9], [8, 11], [9, 11], [13, 11], [14, 11]]) put(s, 'sprinkler', x, y);
  hour(s, 2);
  assert.equal(stationFault(s), 'short');
  assert.equal(s.forecastIssued, last, 'no renewal on a trickle');
  const f = stationForecast(s);
  assert.ok(f && f.stale && f.reason === 'short');
  assert.match(describeStatus(s, stationsOf(s)[0]), /Low power/);
});

test('a pylon bulldozed while paused stops the station at once: no sandbox renewal either', () => {
  const s = newGame(SANDBOX);
  const spot = (type: BuildingId) => { for (let y = 20; y < 40; y++) for (let x = 20; x < 40; x++) { const r = place(s, type, x, y, 0); if (r.ok) return r.value.building; } return assert.fail(type); };
  spot('station'); const pylon = spot('pylon'); spot('turbine'); spot('turbine');
  advance(s, HOUR * 1.4);
  assert.ok(stationWorking(s));
  const before = s.forecastIssued;
  remove(s, pylon);
  assert.ok(!stationWorking(s));
  startEvent(s, 'gale');
  renewNow(s);
  assert.equal(s.forecastIssued, before);
  assert.equal(stationForecast(s)?.reason, 'nolink');
});

test('a station under flood water stops renewing and keeps the last forecast', () => {
  // A flood on day 2 at 06:00 reaches the ground beside the river; the station stands at x = 5.
  const events = eventOn(2, 6, 'flood', 'ordinary', undefined, 'spring');
  const flood = events.find((e) => e.kind === 'flood') as WeatherEvent;
  const s = valley(events, flood.start - 3 * HOUR);
  put(s, 'station', 5, 10); put(s, 'pylon', 6, 10); put(s, 'turbine', 8, 12);
  hour(s, 0.5);
  const last = s.forecastIssued;
  assert.ok(last !== null);
  const wet = (): boolean => stationFault(s) === 'flood';
  let seen = false;
  for (let k = 0; k < 400 && !seen; k++) { advance(s, 1); seen = wet(); }
  assert.ok(seen, 'the water reaches the station');
  const frozen = s.forecastIssued;
  hour(s, 3);
  assert.equal(s.forecastIssued, frozen, 'renewing stops while it is under water');
  const f = stationForecast(s);
  assert.ok(f && f.stale && f.reason === 'flood');
  assert.match(describeStatus(s, stationsOf(s)[0]), /Under water/);
  assert.equal(wants(s, stationsOf(s)[0]), 0, 'a drowned station draws nothing');
});

test('bulldozing the last station drops the forecast; one of two leaves it', () => {
  const { s, station } = powered();
  const second = put(s, 'station', 13, 10);
  hour(s, 1.2);
  assert.ok(stationForecast(s));
  remove(s, station);
  assert.ok(stationForecast(s), 'the other still stands');
  removeAt(s, second.x, second.y);
  assert.ok(!hasStation(s));
  assert.equal(s.forecastIssued, null);
  assert.equal(stationForecast(s), null);
  // Building another starts from nothing: no forecast until it has run.
  put(s, 'station', 10, 10);
  assert.equal(stationForecast(s), null);
  advance(s, 0.1);
  assert.ok(stationForecast(s));
  // Nothing else drops it.
  dropForecastIfNone(s);
  assert.ok(stationForecast(s));
});

test('with two stations, one working keeps the forecast fresh whatever the other does', () => {
  const { s } = powered();
  put(s, 'station', 27, 5); // no pylon reaches it
  hour(s, 2);
  const f = stationForecast(s);
  assert.ok(f && !f.stale && f.reason === null);
  assert.equal(stationFault(s), null);
});

test('in the sandbox, changing the weather by hand renews the forecast at once, at that moment', () => {
  const s = newGame(SANDBOX);
  const spot = (type: BuildingId) => { for (let y = 20; y < 40; y++) for (let x = 20; x < 40; x++) { const r = place(s, type, x, y, 0); if (r.ok) return r.value.building; } return assert.fail(type); };
  spot('station'); spot('pylon'); spot('turbine'); spot('turbine');
  advance(s, HOUR * 1.4);
  assert.ok(stationWorking(s), 'it has power');
  advance(s, 3.7);
  const r = startEvent(s, 'gale');
  assert.ok(r.ok);
  assert.ok(s.forecastIssued !== null && s.forecastIssued < s.time, 'hand-started weather is not in the forecast yet');
  renewNow(s);
  assert.equal(s.forecastIssued, s.time);
  const f = stationForecast(s);
  assert.ok(f && !f.stale);
  const gale = f.forecast.events.find((e) => e.underway);
  assert.ok(gale, 'the gale is under way, not coming within the hour');
  // The next hour renews it as usual.
  hour(s, 1);
  assert.equal(s.forecastIssued, issueTimeOf(s.time));
});

test('without power, changing the weather by hand renews nothing', () => {
  const s = newGame(SANDBOX);
  const r = place(s, 'station', 25, 25, 0);
  assert.ok(r.ok);
  startEvent(s, 'gale');
  renewNow(s);
  assert.equal(s.forecastIssued, null);
});

test('the save keeps the hour of the last forecast; saves of the version before are refused', () => {
  const { s } = powered();
  hour(s, 3.5);
  const issued = s.forecastIssued;
  assert.ok(issued !== null);
  const back = deserialize(serialize(s));
  assert.ok(back.ok);
  assert.equal(back.value.forecastIssued, issued);
  assert.equal(back.value.version, 19);
  assert.deepEqual(stationForecast(back.value)?.forecast, stationForecast(s)?.forecast);
  // Before the first forecast it is null.
  assert.ok(deserialize(serialize(valley())).ok);
  const old = { ...JSON.parse(serialize(s)), version: 15 };
  delete old.forecastIssued;
  assert.ok(!deserialize(JSON.stringify(old)).ok);
  for (const bad of ['"x"', '-5', String(s.time + 1000), 'true', 'undefined']) {
    const o = JSON.parse(serialize(s)); o.forecastIssued = bad === 'undefined' ? undefined : JSON.parse(bad);
    assert.ok(!deserialize(JSON.stringify(o)).ok, `forecastIssued ${bad} is refused`);
  }
});

test('the station keeps no state of its own: it is a plain building', () => {
  const { station } = powered();
  const keys = Object.keys(station).sort();
  assert.deepEqual(keys, ['id', 'rot', 'status', 'type', 'x', 'y']);
});
