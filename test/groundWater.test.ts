import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TRUTH } from '../src/game/ahead.ts';
import { place } from '../src/game/build.ts';
import { DAY_SECONDS } from '../src/game/data.ts';
import { endOf, eventOn, timeOf, type WeatherEvent } from '../src/game/events.ts';
import { placement } from '../src/game/forecast.ts';
import { GROUND, PLAIN, type GroundKind } from '../src/game/ground.ts';
import { forecastAt, issueTimeOf } from '../src/game/outlook.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { fieldPace } from '../src/game/sim/buildings.ts';
import { advance } from '../src/game/sim/step.ts';
import { raining } from '../src/game/sim/weather.ts';
import { newGame, type FieldBuilding, type GameState } from '../src/game/state.ts';
import { dryPace } from '../src/game/warmth.ts';
import { CLAY_HEAT, CLAY_HOLD, groundWaterNote, soaked, waterOf } from '../src/game/wet.ts';

// Ground and water (5.3): clay holds the rain for a day and is half watered in a heat wave; sand drains, watered only while it rains.

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

/** A flat game in a season with no showers of its own and `events`, with the ground of the 3×3 field at (8, 8) set to `kinds` (row by row; one kind fills it). */
function rig(season: Season, events: WeatherEvent[], kinds: GroundKind | GroundKind[] = GROUND.loam): GameState {
  const climate = { ...climateOf(season), conditions: NO_CONDITIONS };
  const sc: Scenario = { ...SANDBOX, climate, events, width: 30, height: 30, credits: 1e6, goals: [], terrain: { ground: PLAIN, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.ground.fill(GROUND.loam);
  for (let i = 0; i < 9; i++) s.map.ground[(8 + Math.floor(i / 3)) * s.map.width + 8 + (i % 3)] = Array.isArray(kinds) ? kinds[i] : kinds;
  return s;
}

const rain = () => eventOn(3, 8, 'softRain')[0];
const field = (s: GameState) => { const r = place(s, 'field', 8, 8, 0); assert.ok(r.ok); return r.ok ? r.value.building : assert.fail(); };

test('clay stays watered for a day after the rain stops; every other ground is watered only while it rains', () => {
  const e = rain(), stop = endOf(e);
  for (const [name, kind, held] of [['clay', GROUND.clay, true], ['sand', GROUND.sand, false], ['loam', GROUND.loam, false], ['silt', GROUND.silt, false], ['stony', GROUND.stony, false]] as const) {
    const s = rig('spring', [e], kind);
    s.time = e.start + e.length / 2;
    assert.equal(waterOf(s, true, 8, 8, 0), 1, `${name} in the rain`);
    s.time = stop + HOUR; assert.ok(!raining(s.scenario, s.time));
    assert.equal(waterOf(s, true, 8, 8, 0), held ? 1 : 0, `${name} an hour after`);
    s.time = stop + CLAY_HOLD - 2 * HOUR;
    assert.equal(waterOf(s, true, 8, 8, 0), held ? 1 : 0, `${name} a day less two hours after`);
    s.time = stop + CLAY_HOLD + 2 * HOUR;
    assert.equal(waterOf(s, true, 8, 8, 0), 0, `${name} a day and two hours after: dry again`);
  }
});

test('a clay field is half watered in a heat wave, with no rain held; a sprinkler\'s share is the least a tile gets', () => {
  const heat = eventOn(3, 6, 'heatWave')[0], quiet = rig('summer', [], GROUND.clay);
  const s = rig('summer', [heat], GROUND.clay);
  s.time = quiet.time = timeOf(3, 15);
  assert.equal(waterOf(s, true, 8, 8, 0), CLAY_HEAT);
  assert.equal(waterOf(quiet, true, 8, 8, 0), 0, 'no heat wave: dry');
  assert.equal(waterOf(s, true, 8, 8, 0.8), 0.8, 'a sprinkler giving more');
  assert.equal(waterOf(s, true, 8, 8, 0.2), CLAY_HEAT, 'a sprinkler giving less');
  // Loam is dry in the heat; clay grows faster for it.
  const loam = rig('summer', [heat], GROUND.loam);
  loam.time = s.time;
  assert.equal(waterOf(loam, true, 8, 8, 0), 0);
  const c = field(s), l = field(loam);
  assert.ok(fieldPace(s, c).pace > fieldPace(loam, l).pace * 1.3, 'the heat spares clay');
  assert.ok(fieldPace(s, c).water === CLAY_HEAT && dryPace(35) < 0.4);
  // Rain held beats the heat: a clay field that had rain a few hours ago is fully watered in it.
  const wet = rig('summer', [eventOn(3, 6, 'heatWave')[0], ...eventOn(3, 0, 'thunderstorm')], GROUND.clay);
  wet.time = timeOf(3, 15);
  assert.equal(waterOf(wet, true, 8, 8, 0), 1);
});

test('a field\'s water is the share of its tiles that are watered', () => {
  const e = rain(), mix = [GROUND.clay, GROUND.clay, GROUND.clay, GROUND.sand, GROUND.sand, GROUND.sand, GROUND.loam, GROUND.loam, GROUND.silt];
  const s = rig('spring', [e], mix);
  s.time = endOf(e) + 3 * HOUR;
  assert.ok(Math.abs(waterOf(s, true, 8, 8, 0) - 1 / 3) < 1e-9);
  assert.ok(Math.abs(waterOf(s, true, 8, 8, 0.6) - (3 + 6 * 0.6) / 9) < 1e-9, 'the sprinkler waters the rest');
});

test('a greenhouse is out of the rain: ground does nothing for its water', () => {
  const e = rain(), s = rig('spring', [e], GROUND.clay);
  s.time = e.start + e.length / 2;
  assert.equal(waterOf(s, false, 8, 8, 0), 0);
  s.time = endOf(e) + HOUR;
  assert.equal(waterOf(s, false, 8, 8, 0.3), 0.3);
  assert.equal(groundWaterNote(s, false, 8, 8), null);
  const r = place(s, 'greenhouse', 8, 8, 0); assert.ok(r.ok);
  assert.equal(fieldPace(s, r.ok ? r.value.building : assert.fail()).water, 0);
});

test('clay is not watered before the commission began, and snow does not water it', () => {
  const s = rig('spring', [], GROUND.clay);
  s.time = 0; assert.ok(!soaked(s.scenario, s.time));
  const w = rig('winter', [], GROUND.clay);
  w.time = timeOf(3, 12);
  assert.equal(waterOf(w, true, 8, 8, 0), 0);
});

test('the notes say what the ground does with the rain, and the sim keeps to them', () => {
  const s = rig('spring', [rain()], [GROUND.clay, GROUND.clay, GROUND.sand, GROUND.loam, GROUND.loam, GROUND.loam, GROUND.loam, GROUND.loam, GROUND.loam]);
  const note = groundWaterNote(s, true, 8, 8) ?? '';
  assert.match(note, /clay under 2 of 9 tiles holds the rain for a day/);
  assert.match(note, /sand under 1 of 9 tiles drains: watered only while it rains/);
  assert.equal(groundWaterNote(rig('spring', []), true, 8, 8), null, 'loam says nothing');
  s.time = timeOf(3, 8) + 2 * HOUR;
  const water = placement(s, 'field', 8, 8, { crop: 'wheat' }, TRUTH).facts.find((f) => f.label === 'Water')!;
  assert.match(water.sub, /clay under 2 of 9 tiles/);
});

/** The soil the card says a field will have in ten minutes, against the soil the sim leaves it with after running them. */
function soilAhead(s: GameState, f: FieldBuilding, reading = TRUTH) {
  const told = placement(s, 'field', 8, 8, { crop: f.crop }, reading).facts.find((x) => x.label === 'Soil')!;
  return told.then ?? told.value;
}

test('the soil ahead counts the clay holding the rain, honestly', () => {
  // A day of rain ends an hour or two into the run: the clay field is watered up to a day on, then dries; loam dries at once.
  const e = rain();
  for (const kind of [GROUND.clay, GROUND.loam, GROUND.sand]) {
    for (const lead of [-1, 3, 5, 9, 15]) {
      const s = rig('spring', [e], kind);
      s.map.fertility.fill(60); s.soilBase.fill(60);
      const f = field(s);
      f.crop = 'wheat';
      s.time = endOf(e) + lead * HOUR;
      const told = soilAhead(s, f);
      const [lo, hi] = told.includes('–') ? told.split('–').map(Number) : [Number(told), Number(told)];
      const forecast = placement(s, 'field', 8, 8, { crop: 'wheat' }, { kind: 'forecast', forecast: forecastAt(s.scenario, issueTimeOf(s.time)), stale: false }).facts.find((x) => x.label === 'Soil')!.then ?? '';
      const [flo, fhi] = forecast.includes('–') ? forecast.split('–').map(Number) : [Number(forecast), Number(forecast)];
      for (let t = 0; t < 600; t += 1) { advance(s, 1); f.stored = 0; }
      const real = Math.round(s.map.fertility[8 * s.map.width + 8]);
      assert.ok(Math.abs(real - (lo + hi) / 2) <= 1, `${kind}, ${lead} h after the rain: sim ${real}, card ${told}`);
      assert.ok(flo <= real && real <= fhi, `${kind}, ${lead} h after the rain: the forecast's ${forecast} holds the sim's ${real}`);
    }
  }
});

test('the soil ahead counts the heat wave\'s half watering of clay, and a wave that ends inside the window', () => {
  const heat = eventOn(3, 6, 'heatWave')[0];
  let differ = false;
  for (const lead of [4, 20, 30]) {
    const soils: number[] = [];
    for (const kind of [GROUND.clay, GROUND.loam]) {
      const s = rig('summer', [heat], kind);
      s.map.fertility.fill(60); s.soilBase.fill(60);
      const f = field(s);
      s.time = endOf(heat) - lead * HOUR / 2;
      const told = soilAhead(s, f), [lo, hi] = told.includes('–') ? told.split('–').map(Number) : [Number(told), Number(told)];
      for (let t = 0; t < 600; t += 1) { advance(s, 1); f.stored = 0; }
      const real = Math.round(s.map.fertility[8 * s.map.width + 8]);
      assert.ok(Math.abs(real - (lo + hi) / 2) <= 1, `${kind} ${lead}: sim ${real}, card ${told}`);
      soils.push(real);
    }
    assert.ok(soils[0] <= soils[1], 'clay grows faster in the heat, so wheat has worn it more');
    differ ||= soils[0] < soils[1];
  }
  assert.ok(differ, 'the ground shows in the soil ahead');
});
