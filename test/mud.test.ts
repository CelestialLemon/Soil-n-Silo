import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buyTruck, place } from '../src/game/build.ts';
import { DAY_SECONDS, TRUCK } from '../src/game/data.ts';
import { blowDust, dustGround, dustNote, dustShare } from '../src/game/dust.ts';
import { endOf, timeOf, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { flooded } from '../src/game/flood.ts';
import { depthAt } from '../src/game/frost.ts';
import { GROUND, GROUND_IDS, PLAIN, type GroundKind } from '../src/game/ground.ts';
import { holdLabel, holdNeed, holdShape, isMud, readHold, truckHold } from '../src/game/hold.ts';
import { TERRAIN } from '../src/game/map.ts';
import { muddyAt, rainedWithin } from '../src/game/mud.ts';
import { distanceTo, pathTo } from '../src/game/roads.ts';
import { CAMPAIGN, SANDBOX, scenarioById, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { describeTruck } from '../src/game/sim/describe.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type BuildingOf, type GameState, type Truck } from '../src/game/state.ts';
import type { BuildingId } from '../src/game/data.ts';
import { fieldFertility } from '../src/game/sim/soil.ts';

// Mud on clay (5.4): trucks slow on clay while it rains and for TRUCK.mudHours after, not on frozen clay and never on sand; the dust
// storm takes most from sand; the flood's reach and the frost's hollows follow where the ground lies.

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };
const event = (kind: EventKind, strength: Strength, day: number, hour: number, hours: number): WeatherEvent => ({ kind, strength, start: timeOf(day, hour), length: hours * HOUR });
/** A day of soft rain from the morning of day 3 (the only rain: no showers). */
const RAIN = event('softRain', 'ordinary', 3, 8, 24);

/** A flat spring game with `events` and no weather of its own, all its ground `kind`. */
function game(events: WeatherEvent[], kind: GroundKind, over: Partial<Scenario['climate']> = {}, season: Season = 'spring'): GameState {
  const climate = { ...climateOf(season), conditions: NO_CONDITIONS, ...over };
  const sc: Scenario = { ...SANDBOX, climate, id: 'test', sandbox: false, credits: 100_000, width: 40, height: 30, goals: [], par: 600, events,
    terrain: { ground: PLAIN, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.ground.fill(kind);
  return s;
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

test('clay is muddy while it rains and for six game hours after, then firm', () => {
  const s = game([RAIN], GROUND.clay);
  const sc = s.scenario, end = endOf(RAIN);
  assert.equal(muddyAt(sc, RAIN.start - HOUR), false, 'dry before');
  assert.equal(muddyAt(sc, RAIN.start + 6 * HOUR), true, 'raining');
  assert.equal(muddyAt(sc, end), true, 'as the rain stops');
  assert.equal(muddyAt(sc, end + (TRUCK.mudHours - 1) * HOUR), true, 'still muddy five hours after');
  assert.equal(muddyAt(sc, end + (TRUCK.mudHours + 1) * HOUR), false, 'firm again after the six hours');
  assert.ok(rainedWithin(sc, end + 4 * HOUR, 6) && !rainedWithin(sc, end + 4 * HOUR, 1));
});

test('frozen clay is firm: no mud while the warmth is below 0°C, rain or not', () => {
  const cold = game([RAIN], GROUND.clay, { warmth: { low: -8, high: -4, drift: 0 } });
  assert.equal(muddyAt(cold.scenario, RAIN.start + 6 * HOUR), false);
  const mild = game([RAIN], GROUND.clay, { warmth: { low: 5, high: 15, drift: 0 } });
  assert.equal(muddyAt(mild.scenario, RAIN.start + 6 * HOUR), true);
});

test('snow makes no mud: winter has none', () => {
  const s = game([RAIN], GROUND.clay, {}, 'winter');
  s.scenario.climate.warmth = { low: 3, high: 8, drift: 0 };
  assert.equal(muddyAt(s.scenario, RAIN.start + 6 * HOUR), false);
});

/** A truck on a long drive east along a row of `ground`, at `time`: how far it gets in 4 seconds of play. */
function distance(kind: GroundKind, events: WeatherEvent[], time: number, over: Partial<Scenario['climate']> = {}): number {
  const s = game(events, kind, over);
  const garage = put(s, 'garage', 2, 12);
  put(s, 'silo', 34, 12);
  const r = buyTruck(s, garage);
  assert.ok(r.ok);
  const t = r.value.truck;
  s.time = time;
  const silo = s.buildings.find((b) => b.type === 'silo')!;
  t.x = 5.5; t.y = 13.5;
  t.phase = 'drive'; t.target = silo.id; t.path = [13 * s.map.width + 6]; t.from = 13 * s.map.width + 5;
  const x0 = t.x;
  advance(s, 4);
  return t.x - x0;
}

test('a truck drives at half speed on muddy clay, and at full speed on firm clay, sand, loam and the rest', () => {
  const rain = RAIN.start + 8 * HOUR;
  const firm = distance(GROUND.clay, [], rain), muddy = distance(GROUND.clay, [RAIN], rain);
  assert.ok(firm > 4, `a truck covers ground in 4 s (${firm.toFixed(1)})`);
  assert.ok(Math.abs(muddy / firm - TRUCK.mudSpeed) < 0.1, `half speed in the mud: ${muddy.toFixed(1)} against ${firm.toFixed(1)}`);
  for (const kind of [GROUND.loam, GROUND.silt, GROUND.sand, GROUND.stony]) {
    assert.ok(Math.abs(distance(kind, [RAIN], rain) - firm) < 0.05, `${GROUND_IDS[kind]} is firm in the rain`);
  }
  // Six hours after the rain, still slow; eight, back to full speed.
  assert.ok(distance(GROUND.clay, [RAIN], endOf(RAIN) + 3 * HOUR) < firm * 0.6);
  assert.ok(Math.abs(distance(GROUND.clay, [RAIN], endOf(RAIN) + 9 * HOUR) - firm) < 0.05);
  assert.ok(Math.abs(distance(GROUND.clay, [RAIN], rain, { warmth: { low: -8, high: -4, drift: 0 } }) - firm) < 0.05, 'frozen clay is firm');
});

test('mud slows the clock but not the battery a tile', () => {
  const run = (events: WeatherEvent[]) => {
    const s = game(events, GROUND.clay);
    const garage = put(s, 'garage', 2, 12);
    put(s, 'silo', 34, 12);
    const r = buyTruck(s, garage);
    assert.ok(r.ok);
    const t = r.value.truck, silo = s.buildings.find((b) => b.type === 'silo')!;
    s.time = RAIN.start + 8 * HOUR;
    t.x = 5.5; t.y = 13.5; t.phase = 'drive'; t.target = silo.id; t.path = [13 * s.map.width + 6]; t.from = 13 * s.map.width + 5;
    const e0 = t.energy, x0 = t.x;
    advance(s, 4);
    return (e0 - t.energy) / (t.x - x0);
  };
  assert.ok(Math.abs(run([RAIN]) - run([])) < 0.01, 'the same joules a tile, mud or not');
});

test('trucks are not rerouted round mud: their way is worked out from the land', () => {
  const dry = game([], GROUND.clay), wet = game([RAIN], GROUND.clay);
  for (const s of [dry, wet]) { s.time = RAIN.start + 8 * HOUR; put(s, 'garage', 2, 12); put(s, 'silo', 34, 12); }
  const silo = (s: GameState) => s.buildings.find((b) => b.type === 'silo')!;
  assert.equal(distanceTo(dry, silo(dry), 13 * 40 + 6), distanceTo(wet, silo(wet), 13 * 40 + 6));
  assert.deepEqual(pathTo(dry, silo(dry), 13 * 40 + 6), pathTo(wet, silo(wet), 13 * 40 + 6));
});

test('a truck slowed by mud carries the weather hold\'s status: "Slowed · mud", on the card and the marker', () => {
  const s = game([RAIN], GROUND.clay);
  const garage = put(s, 'garage', 2, 12);
  const r = buyTruck(s, garage);
  assert.ok(r.ok);
  const t: Truck = r.value.truck;
  s.time = RAIN.start + 8 * HOUR;
  assert.equal(truckHold(s, t), null, 'parked');
  t.x = 8.5; t.y = 8.5; t.phase = 'drive'; t.path = [9 * s.map.width + 9];
  const hold = truckHold(s, t)!;
  assert.deepEqual(hold, { kind: 'mud', strength: 'ordinary', effect: 'slowed' });
  assert.ok(isMud(hold));
  assert.equal(holdLabel(hold), 'Slowed · mud');
  assert.deepEqual(readHold(holdNeed(hold)), hold);
  assert.equal(holdShape(holdNeed(hold)), 'wave');
  assert.match(describeTruck(s, t), /, slowed by mud: it drives at 50% speed on clay/);
  s.map.ground.fill(GROUND.sand);
  assert.equal(truckHold(s, t), null, 'sand is firm');
  s.map.ground.fill(GROUND.clay); s.time = endOf(RAIN) + 8 * HOUR;
  assert.equal(truckHold(s, t), null, 'the mud has dried');
});

test('a weather event that slows trucks is named over the mud', () => {
  const fog = event('fog', 'ordinary', 3, 4, 20);
  const s = game([RAIN, fog], GROUND.clay);
  const garage = put(s, 'garage', 2, 12);
  const r = buyTruck(s, garage);
  assert.ok(r.ok);
  const t = r.value.truck;
  s.time = RAIN.start + 8 * HOUR;
  t.x = 8.5; t.y = 8.5; t.phase = 'drive'; t.path = [9 * s.map.width + 9];
  assert.equal(truckHold(s, t)?.kind, 'fog');
});

test('the dust storm takes twice the soil from sand, a quarter more from stony ground, and the same from loam, silt and clay', () => {
  assert.deepEqual(GROUND_IDS.map((id, k) => [id, dustShare(k)]), [['loam', 1], ['silt', 1], ['clay', 1], ['sand', 2], ['stony', 1.25]]);
  const dust = event('dustStorm', 'ordinary', 3, 8, 18);
  const lost = (kind: GroundKind) => {
    const s = game([dust], kind, {}, 'summer');
    s.map.fertility.fill(90); s.soilBase.fill(90);
    const f = put(s, 'field', 4, 4);
    f.stored = 6;
    s.time = dust.start;
    for (let t = 0; t < 18 * HOUR; t += 0.5) { s.time += 0.5; blowDust(s, 0.5); }
    return 90 - fieldFertility(s, f);
  };
  const loam = lost(GROUND.loam);
  assert.ok(loam > 5, `loam loses ${loam.toFixed(1)}`);
  assert.ok(Math.abs(lost(GROUND.sand) / loam - 2) < 0.01, 'sand twice');
  assert.ok(Math.abs(lost(GROUND.stony) / loam - 1.25) < 0.01, 'stony a quarter more');
  for (const kind of [GROUND.silt, GROUND.clay]) assert.ok(Math.abs(lost(kind) / loam - 1) < 0.01);
});

test('the field\'s dust card says what its ground gives up to the wind', () => {
  const dust = event('dustStorm', 'ordinary', 3, 8, 18);
  const s = game([dust], GROUND.loam, {}, 'summer');
  const f = put(s, 'field', 4, 4);
  assert.equal(dustGround(s, f.x, f.y), '');
  assert.doesNotMatch(dustNote(s, f)!, /sand/);
  s.map.ground[4 * s.map.width + 4] = GROUND.sand;
  assert.equal(dustGround(s, f.x, f.y), 'sand loses twice as much');
  assert.match(dustNote(s, f)!, /exposed: .*\(sand loses twice as much\)/);
});

// ---- The flood and the frost follow the ground ----

const land = (s: GameState, i: number) => s.map.terrain[i] !== TERRAIN.water;
const share = (s: GameState, tiles: number[], kind: GroundKind) => tiles.filter((i) => land(s, i)).filter((i) => s.map.ground[i] === kind).length / Math.max(1, tiles.filter((i) => land(s, i)).length);

test('floods reach silt first: the water covers a much larger share of silt than of the land', () => {
  for (const id of ['c7', 'c8']) {
    const sc = scenarioById(id)!, s = newGame(sc), fl = sc.events.find((e) => e.kind === 'flood')!;
    s.time = fl.start + (endOf(fl) - fl.start) / 2;
    const covered = flooded(s), all = [...s.map.terrain.keys()];
    const wet = all.filter((i) => covered.tiles[i]);
    assert.ok(wet.length > 100, `${id}: the flood covers land`);
    assert.ok(share(s, wet, GROUND.silt) > 2 * share(s, all, GROUND.silt) && share(s, wet, GROUND.silt) > 0.5, `${id}: silt ${share(s, wet, GROUND.silt).toFixed(2)} of the flooded land against ${share(s, all, GROUND.silt).toFixed(2)} of the land`);
  }
});

test('frost settles in clay hollows: the deep basins of a map are mostly clay (a river\'s floodplain is silt)', () => {
  for (const id of ['c3', 'c5']) {
    const s = newGame(CAMPAIGN.find((c) => c.id === id)!), all = [...s.map.terrain.keys()];
    const deep = all.filter((i) => land(s, i) && depthAt(s, i % s.map.width, Math.floor(i / s.map.width)) >= 0.6);
    assert.ok(deep.length > 40, `${id}: it has hollows`);
    assert.ok(share(s, deep, GROUND.clay) > 0.4 && share(s, deep, GROUND.clay) > 3 * share(s, all, GROUND.clay), `${id}: clay ${share(s, deep, GROUND.clay).toFixed(2)} of its hollows against ${share(s, all, GROUND.clay).toFixed(2)} of the land`);
  }
});
