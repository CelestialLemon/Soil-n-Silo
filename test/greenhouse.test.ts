import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place, setCrop } from '../src/game/build.ts';
import { CROP_IDS, CROPS, DAY_SECONDS, FIELD } from '../src/game/data.ts';
import { eventOn, timeOf } from '../src/game/events.ts';
import { placement } from '../src/game/forecast.ts';
import { groundOf } from '../src/game/rules.ts';
import { TERRAIN } from '../src/game/map.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { fieldPace } from '../src/game/sim/buildings.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { wants } from '../src/game/sim/energy.ts';
import { sprinklersOf } from '../src/game/sim/layout.ts';
import { raining } from '../src/game/sim/weather.ts';
import { advance } from '../src/game/sim/step.ts';
import { growsCrops, newGame, type FieldBuilding, type GameState } from '../src/game/state.ts';
import type { CropId } from '../src/game/data.ts';
import { insideFact, insideWarmth, warmthOf } from '../src/game/warmth.ts';
import type { WeatherEvent } from '../src/game/events.ts';

/** A 30 × 30 flat map with a river at x = 2–3 (a shore for anything built at x = 4), in a season with no weather but the events given. */
function valley(season: Season, events: WeatherEvent[] = [], rain = 0, at = 0): GameState {
  const climate = { ...climateOf(season), conditions: { cloud: 0, rain, calm: 0 } };
  const sc: Scenario = { ...SANDBOX, climate, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events,
    terrain: { soil: 60, soilSpread: 0, water: 'river', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.terrain.fill(TERRAIN.grass);
  s.map.corner.fill(0);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  for (let y = 0; y < 30; y++) for (let x = 2; x <= 3; x++) s.map.terrain[y * 30 + x] = TERRAIN.water;
  s.map.depot.x = 25; s.map.depot.y = 25;
  s.buildings[0].x = 25; s.buildings[0].y = 25;
  s.time = at;
  return s;
}

function build(s: GameState, type: 'field' | 'greenhouse', x: number, y: number, crop: CropId): FieldBuilding {
  const r = place(s, type, x, y, 0, { crop });
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

test('a greenhouse is a building of its own that grows like a field', () => {
  const s = valley('summer');
  const g = build(s, 'greenhouse', 4, 4, 'beans');
  assert.equal(g.type, 'greenhouse');
  assert.ok(growsCrops(g));
  assert.equal(s.credits, 100_000 - 150);
  assert.ok(setCrop(s, g, 'flax').ok && g.crop === 'flax');
  advance(s, 80);
  assert.ok(g.stored > 0, 'it harvests');
  assert.ok(s.map.fertility[4 * 30 + 4] !== 60, 'the harvest changes the soil');
});

test('a greenhouse needs flat ground, a field only an unbroken one', () => {
  assert.equal(groundOf('greenhouse'), 'flat');
  assert.equal(groundOf('field'), 'unbroken');
});

test('inside, a crop is held at the lowest warmth it grows at full speed in, or the outside if warmer, vented above its highest', () => {
  for (const c of CROP_IDS) {
    const k = CROPS[c];
    assert.equal(insideWarmth(k, -5), k.comfort.low);
    assert.equal(insideWarmth(k, k.comfort.low + 1), k.comfort.low + 1);
    assert.ok(insideWarmth(k, 45) <= k.comfort.high && insideWarmth(k, 45) <= FIELD.heat);
  }
  assert.equal(insideFact(CROPS.tomato, -3), 'Inside 18°C, outside −3°C');
});

test('in winter every crop grows at full speed for warmth in a greenhouse, and tomato is lost in an open field', () => {
  const s = valley('winter', [], 0, timeOf(2, 3));
  assert.ok(warmthOf(s) < 6);
  const tomato = build(s, 'greenhouse', 4, 4, 'tomato'), open = build(s, 'field', 4, 10, 'tomato');
  assert.equal(fieldPace(s, tomato).byWarmth, 1);
  assert.equal(fieldPace(s, open).byWarmth, 0);
  advance(s, 20);
  assert.ok(tomato.growth > 0 && tomato.status === 'ok', `${tomato.status}`);
  assert.equal(open.growth, 0);
});

test('the rain does not water a greenhouse, and its sprinkler keeps running in it', () => {
  const s = valley('spring', [], 1, 0);
  for (let t = 0; t < 3 * DAY_SECONDS && !raining(s.scenario, s.time); t += 30) s.time = t;
  assert.ok(raining(s.scenario, s.time), 'it rains');
  const g = build(s, 'greenhouse', 10, 10, 'wheat'), f = build(s, 'field', 10, 16, 'wheat');
  assert.equal(fieldPace(s, g).water, 0);
  assert.equal(fieldPace(s, f).water, 1);
  // The projection on the placement card does not count on the rain either.
  assert.equal(placement(s, 'greenhouse', 14, 4, { crop: 'wheat' }).facts.find((f) => f.label === 'Water')?.value, 'none');
  assert.equal(placement(s, 'field', 14, 4, { crop: 'wheat' }).facts.find((f) => f.label === 'Water')?.value, 'rain');
  const sp = place(s, 'sprinkler', 12, 13, 0);
  assert.ok(sp.ok);
  assert.equal(sprinklersOf(s, g).length, 1);
  assert.ok(wants(s, sp.value.building) > 0, 'a sprinkler by a greenhouse draws power in the rain');
  const dry = place(s, 'sprinkler', 12, 19, 0);
  assert.ok(dry.ok && sprinklersOf(s, f).includes(dry.value.building));
  assert.equal(wants(s, dry.value.building), 0, 'one that waters only an open field rests in the rain');
});

test('a late frost takes the tender crop of an open field and leaves the greenhouse alone', () => {
  const events = eventOn(3, 21, 'lateFrost', 'severe', 9, 'spring');
  const s = valley('spring', events, 0, timeOf(4, 1));
  const open = build(s, 'field', 4, 4, 'tomato'), under = build(s, 'greenhouse', 4, 10, 'tomato');
  advance(s, 10);
  assert.equal(open.growth, 0);
  assert.ok(under.growth > 0 && under.status !== 'weather' && under.status !== 'frost');
});

test('a flood reaches a greenhouse: the growing crop is lost', () => {
  const events = eventOn(3, 6, 'flood', 'severe', undefined, 'spring');
  const s = valley('spring', events, 0, timeOf(2, 12));
  const g = build(s, 'greenhouse', 4, 4, 'wheat');
  advance(s, 30);
  assert.ok(g.growth > 0);
  s.time = events[0].start + events[0].length / 2;
  advance(s, 2);
  assert.equal(g.growth, 0);
  assert.match(describeStatus(s, g), /^Under water: the growing wheat is lost, the greenhouse starts again/);
});

test('a dust storm takes no soil from a greenhouse', () => {
  const events = eventOn(3, 6, 'dustStorm', 'severe', undefined, 'summer');
  const s = valley('summer', events, 0, events[0].start + events[0].length / 2);
  build(s, 'greenhouse', 4, 4, 'wheat');
  const open = build(s, 'field', 4, 10, 'wheat');
  const at = (x: number, y: number) => s.map.fertility[y * 30 + x];
  advance(s, 10);
  assert.equal(at(5, 5), 60);
  assert.ok(at(open.x + 1, open.y + 1) < 60);
});

test('saves of the version before are refused', () => {
  const s = valley('summer');
  build(s, 'greenhouse', 4, 4, 'wheat');
  const back = deserialize(serialize(s));
  assert.ok(back.ok);
  assert.equal(back.value.buildings.find((b) => b.type === 'greenhouse')?.type, 'greenhouse');
  assert.ok(!deserialize(JSON.stringify({ ...JSON.parse(serialize(s)), version: 16 })).ok);
});
