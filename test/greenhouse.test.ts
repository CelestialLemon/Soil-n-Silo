import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place, setCrop } from '../src/game/build.ts';
import { CROP_IDS, CROPS, DAY_SECONDS, FIELD } from '../src/game/data.ts';
import { eventOn, timeOf } from '../src/game/events.ts';
import { placement, tonight } from '../src/game/forecast.ts';
import { groundOf } from '../src/game/rules.ts';
import { TERRAIN } from '../src/game/map.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { powerDay } from '../src/game/powerlog.ts';
import { POWER } from '../src/game/data.ts';
import { fieldPace } from '../src/game/sim/buildings.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { wants } from '../src/game/sim/energy.ts';
import { sprinklersOf } from '../src/game/sim/layout.ts';
import { raining } from '../src/game/sim/weather.ts';
import { advance } from '../src/game/sim/step.ts';
import { growsCrops, newGame, type FieldBuilding, type GameState } from '../src/game/state.ts';
import type { CropId } from '../src/game/data.ts';
import { heatNeed, insideAfter, insideFact, insideNow, insideWarmth, warmthOf } from '../src/game/warmth.ts';
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
  assert.equal(insideFact(18, -3), 'Inside 18°C, outside −3°C');
  assert.equal(insideFact(17.6, -3.4, 13.2), 'Inside 18°C, outside −3°C, heating 13 W');
});

test('in winter every crop grows at full speed for warmth in a greenhouse, and tomato is lost in an open field', () => {
  const s = valley('winter', [], 0, timeOf(2, 3));
  assert.ok(warmthOf(s) < 6);
  const tomato = build(s, 'greenhouse', 4, 4, 'tomato'), open = build(s, 'field', 4, 10, 'tomato');
  assert.equal(fieldPace(s, tomato).byWarmth, 1);
  assert.equal(fieldPace(s, open).byWarmth, 0);
  advance(s, 20);
  assert.ok(tomato.growth > 0, 'it starts at the warmth full power would hold');
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

test('tonight counts a sprinkler that waters a greenhouse as running through the rain', () => {
  const night = (type: 'field' | 'greenhouse') => {
    const s = valley('autumn', [], 1, timeOf(2, 20));
    s.scenario.climate = { ...s.scenario.climate, sun: { rise: 6, set: 20, strength: 1 } };
    place(s, 'pylon', 14, 14, 0); place(s, 'battery', 15, 14, 0);
    build(s, type, 10, 10, 'wheat');
    place(s, 'sprinkler', 12, 13, 0);
    advance(s, 1);
    const bat = s.buildings.find((b) => b.type === 'battery');
    if (bat?.type === 'battery') bat.charge = 500;
    return tonight(s, { kind: 'truth' });
  };
  const open = night('field'), under = night('greenhouse');
  assert.ok(open && under);
  assert.ok((under.dryAt ?? Infinity) < (open.dryAt ?? Infinity), `greenhouse ${under.dryAt}, field ${open.dryAt}`);
});

test('the placement card does not count on a sprinkler resting in the rain that a new greenhouse would wake, with no power behind it', () => {
  const s = valley('spring', [], 1, 0);
  for (let t = 0; t < 3 * DAY_SECONDS && !raining(s.scenario, s.time); t += 30) s.time = t;
  place(s, 'pylon', 12, 14, 0);
  place(s, 'sprinkler', 12, 13, 0);
  advance(s, 1);
  const water = (type: 'field' | 'greenhouse') => placement(s, type, 10, 10, { crop: 'wheat' }).facts.find((f) => f.label === 'Water');
  assert.equal(water('field')?.value, 'rain');
  assert.notEqual(water('greenhouse')?.sub, 'grows at 100%');
  assert.match(water('greenhouse')?.sub ?? '', /grows at (\d+)%/);
});

// ---- Heating (4.2) ----

const HOUR = DAY_SECONDS / 24;

/** A greenhouse of `crop` at (4, 4) in a winter valley at 2 am on day 3, with a pylon and `batteries` full batteries beside it. */
function heated(crop: CropId, batteries: number, events: WeatherEvent[] = []) {
  const s = valley('winter', events, 0, timeOf(2, 2));
  const g = build(s, 'greenhouse', 4, 4, crop);
  const pylon = place(s, 'pylon', 8, 5, 0);
  assert.ok(pylon.ok);
  for (let i = 0; i < batteries; i++) {
    const b = place(s, 'battery', 8, 8 + 2 * i, 0);
    assert.ok(b.ok);
    if (b.value.building.type === 'battery') b.value.building.charge = POWER.battery.capacity;
  }
  return { s, g };
}

test('the cooling model: with no power the warmth falls toward the outside with a time constant of 5 game hours, exactly whatever the step', () => {
  const tomato = CROPS.tomato, at = (hours: number, watts: number, step: number) => {
    let t = 18;
    for (let n = 0; n < hours * HOUR / step; n++) t = insideAfter(tomato, t, -5, watts, step);
    return t;
  };
  for (const [h, want] of [[1, 13.8], [2, 10.4], [8, -0.4], [16, -4.1]] as const) assert.ok(Math.abs(at(h, 0, 0.1) - want) < 0.06, `${h} h: ${at(h, 0, 0.1)}`);
  assert.ok(Math.abs(at(8, 0, 0.1) - at(8, 0, 4)) < 1e-9, 'the same in big steps');
  assert.ok(Math.abs(at(16, 0.5 * heatNeed(tomato, -5), 0.1) - 7.0) < 0.06, 'half the power for 16 h');
  assert.ok(Math.abs(at(40, heatNeed(tomato, -5), 0.1) - 18) < 1e-9, 'all the power holds the warmth');
  assert.equal(insideAfter(tomato, 18, 40, 0, 10_000), tomato.comfort.high, 'vented above the crop\'s highest');
});

test('a greenhouse draws 0.6 W for each °C the outside is below its crop\'s warmth, and nothing when warmer', () => {
  assert.ok(Math.abs(heatNeed(CROPS.tomato, -5) - 13.8) < 1e-9);
  assert.ok(Math.abs(heatNeed(CROPS.wheat, -5) - 6.6) < 1e-9);
  assert.equal(heatNeed(CROPS.tomato, 20), 0);
  const { s, g } = heated('tomato', 1);
  assert.ok(Math.abs(wants(s, g) - heatNeed(CROPS.tomato, warmthOf(s))) < 1e-9 && wants(s, g) > 5);
});

test('with the power it needs a greenhouse holds its warmth through the night, and grows', () => {
  const { s, g } = heated('tomato', 4);
  advance(s, 4 * HOUR);
  assert.ok(Math.abs(insideNow(s, g) - 18) < 1e-6, `${insideNow(s, g)}`);
  assert.equal(g.status, 'ok');
  assert.ok(g.growth > 0);
  assert.ok(s.credits < 100_000);
});

test('with none, a greenhouse cools toward the outside, a tender crop stops below 10°C but is not lost, and it says why', () => {
  const { s, g } = heated('tomato', 0);
  advance(s, 4 * HOUR);
  g.growth = 0.5;
  advance(s, HOUR);
  assert.ok(insideNow(s, g) < 10 && insideNow(s, g) > warmthOf(s), `${insideNow(s, g)} outside ${warmthOf(s)}`);
  assert.equal(fieldPace(s, g).byWarmth, 0);
  assert.equal(g.status, 'power');
  assert.equal(g.growth, 0.5, 'the growth is kept');
  assert.match(describeStatus(s, g), /^Cooling: not enough power/);
});

test('a short share cools it more slowly, and the power back warms it again', () => {
  const { s, g } = heated('wheat', 0);
  // Wheat wants 6°C: with the outside well below it, no power cools it.
  advance(s, 6 * HOUR);
  const cold = insideNow(s, g);
  assert.ok(cold < 6 - 0.5, `${cold}`);
  const bat = place(s, 'battery', 8, 8, 0);
  assert.ok(bat.ok && bat.value.building.type === 'battery');
  bat.value.building.charge = POWER.battery.capacity;
  advance(s, 2 * HOUR);
  assert.ok(insideNow(s, g) > cold, 'warming again');
  assert.ok(insideNow(s, g) < 6, 'slowly');
});

test('in summer a greenhouse needs nothing, and no power is no shortage', () => {
  const s = valley('summer', [], 0, timeOf(2, 12));
  const g = build(s, 'greenhouse', 4, 4, 'wheat');
  advance(s, 2 * HOUR);
  assert.equal(wants(s, g), 0);
  assert.equal(g.status, 'ok');
});

test('a cold snap makes a greenhouse need more, through the colder outside alone', () => {
  const calm = heated('tomato', 1), snap = heated('tomato', 1, [{ kind: 'coldSnap', strength: 'ordinary', start: timeOf(2, 0), length: 40 * HOUR }]);
  assert.ok(wants(snap.s, snap.g) > wants(calm.s, calm.g) + 4, `${wants(snap.s, snap.g)} vs ${wants(calm.s, calm.g)}`);
});

test('the power log counts the heating as its own kind of building', () => {
  const { s } = heated('tomato', 4);
  advance(s, HOUR);
  assert.ok((powerDay(s).use.greenhouse ?? 0) > 5);
});

test('a greenhouse\'s warmth is saved, and a broken one is a broken save', () => {
  const { s, g } = heated('tomato', 0);
  advance(s, 2 * HOUR);
  const back = deserialize(serialize(s));
  assert.ok(back.ok);
  const g2 = back.value.buildings.find((b) => b.type === 'greenhouse');
  assert.ok(g2 && growsCrops(g2) && g2.inside === g.inside);
  const bad = JSON.parse(serialize(s));
  bad.buildings.find((b: { type: string }) => b.type === 'greenhouse').inside = 'cold';
  assert.ok(!deserialize(JSON.stringify(bad)).ok);
});
