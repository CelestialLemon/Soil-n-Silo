import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addStop, buyTruck, newRoute, place, setTruckRoute } from '../src/game/build.ts';
import { BUILDINGS, FIELD, POWER } from '../src/game/data.ts';
import { eventOn, EVENTS, eventsOf, rollEvents, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { canFlood, FALL, flooded, floodRise, floodsAt, floodStep, isFlooded, isWet, SILT } from '../src/game/flood.ts';
import { readHold } from '../src/game/hold.ts';
import { placement } from '../src/game/forecast.ts';
import { TERRAIN } from '../src/game/map.ts';
import { networkOf } from '../src/game/power.ts';
import { corners } from '../src/game/relief.ts';
import { accessTiles, distanceTo } from '../src/game/roads.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf } from '../src/game/seasons.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { linksOf } from '../src/game/sim/goods.ts';
import { served } from '../src/game/sim/describe.ts';
import { flowersNear } from '../src/game/sim/buildings.ts';
import { isPollinated, sprinklersOf } from '../src/game/sim/layout.ts';
import { advance } from '../src/game/sim/step.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { buildingAt, newGame, touchRelief, type Building, type BuildingOf, type Dir, type GameState } from '../src/game/state.ts';
import type { BuildingId } from '../src/game/data.ts';
import { GROUND, PLAIN } from '../src/game/ground.ts';

const CLEAR = { ...climateOf('spring', 'mild'), conditions: { cloud: 0, rain: 0, calm: 0 }, warmth: { low: 15, high: 15, drift: 0 } };

/**
 * A 30 × 30 map, flat at level 0, with a river two tiles wide at x = 2–3 and one flood on day 3 (06:00 or `hour`) at `kind` and
 * `strength`, with the game set to `at` (default: its middle).
 */
function flooding(kind: EventKind = 'flood', strength: Strength = 'ordinary', at?: (e: WeatherEvent) => number): { s: GameState; events: WeatherEvent[] } {
  const events = eventOn(3, 6, kind, strength, undefined, 'spring');
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events,
    terrain: { ground: PLAIN, water: 'river', forest: 0, rock: 0, relief: 0 }, climate: CLEAR,
  };
  const s = newGame(sc);
  s.map.terrain.fill(TERRAIN.grass);
  s.map.corner.fill(0);
  s.map.ground.fill(GROUND.loam); s.map.fertility.fill(60);
  s.soilBase.fill(60);
  for (let y = 0; y < 30; y++) for (let x = 2; x <= 3; x++) s.map.terrain[y * 30 + x] = TERRAIN.water;
  s.map.depot.x = 20; s.map.depot.y = 20;
  s.buildings[0].x = 20; s.buildings[0].y = 20;
  const e = events.find((x) => x.kind === 'flood') ?? events[0];
  s.time = at ? at(e) : e.start + e.length / 2;
  return { s, events };
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number, rot: Dir = 0): BuildingOf<K> {
  const r = place(s, type, x, y, rot);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

/** Raises every corner of the tiles in a column of the map to `level`. */
function raise(s: GameState, x: number, level: number, from = 0, to = 29) {
  for (let y = from; y <= to; y++) s.map.corner.fill(level, (y * 30 + x) * 4, (y * 30 + x) * 4 + 4);
  touchRelief(s);
}

/** The columns of a row that are under water. */
const wetColumns = (s: GameState, y = 10) => Array.from({ length: 30 }, (_, x) => x).filter((x) => isWet(s, x, y));

test('a flood spreads over the flat ground beside the river, to the reach its level gives, and no further', () => {
  const { s } = flooding();
  const wet = wetColumns(s);
  // Ordinary flood: 1 level at the peak; the surface falls FALL a tile, so flat ground floods until the surface is under it.
  const reach = Math.floor(1 / FALL - 1e-9);
  assert.deepEqual(wet, [...Array.from({ length: reach }, (_, k) => 4 + k), ...Array.from({ length: reach }, (_, k) => 1 - k).filter((x) => x >= 0)].sort((a, b) => a - b));
  assert.ok(!isWet(s, 2, 10) && !isWet(s, 3, 10), 'the river itself is not "flooded"');
  assert.ok(!isWet(s, 4 + reach, 10) && !isWet(s, 4 + reach + 3, 10));
  // A severe flood is a level higher, so it goes further.
  const sev = flooding('flood', 'severe').s;
  assert.ok(wetColumns(sev).length > wet.length * 1.5);
  // Nothing outside a flood.
  const dry = flooding('flood', 'ordinary', (e) => e.start - 100).s;
  assert.equal(flooded(dry).count, 0);
  assert.equal(wetColumns(dry).length, 0);
});

test('the water covers only ground it stands above, at every height of the rise', () => {
  const { s, events } = flooding();
  const e = events[0], w = 30;
  let seen = 0;
  for (let t = e.start - 10; t < e.start + e.length + 20; t += 0.7) {
    s.time = t;
    const rise = floodRise(s.scenario, t), f = flooded(s);
    for (let i = 0; i < f.tiles.length; i++) if (f.tiles[i]) {
      seen++;
      assert.ok(f.surface[i] > 0 && f.surface[i] <= rise + 1e-6, `tile ${i} at ${t}: surface ${f.surface[i]} against a rise of ${rise}`);
      assert.ok(isWet(s, i % w, Math.floor(i / w)));
    }
  }
  assert.ok(seen > 0);
  s.time = e.start + 1; // shortly into the ramp, the rise is under half a level
  assert.ok(floodRise(s.scenario, s.time) > 0 && floodRise(s.scenario, s.time) < 0.5);
  assert.equal(flooded(s).count, 0, 'no ground floods before the water has risen half a level');
});

test('the reach follows height: ground above the water stays dry, and a bank built with earthworks keeps the water out', () => {
  const { s } = flooding();
  assert.ok(isWet(s, 5, 10) && isWet(s, 8, 10));
  // A rise in the land: water reaches the foot of a ridge and no higher than its own surface.
  raise(s, 6, 3);
  assert.ok(isWet(s, 4, 10) && isWet(s, 5, 10), 'water up to the bank');
  assert.ok(!isWet(s, 6, 10), 'the bank itself');
  assert.ok(!isWet(s, 7, 10) && !isWet(s, 8, 10), 'and nothing behind it: the water cannot get there over ground at or below its level');
  // Take the bank away again and it floods again (the reach is worked out afresh when the ground changes).
  raise(s, 6, 0);
  assert.ok(isWet(s, 7, 10) && isWet(s, 8, 10));
  // A bank only on part of the river's length leaves the rest of the plain open to it: the water goes round the end.
  raise(s, 6, 3, 0, 9);
  assert.ok(!isWet(s, 6, 5));
  assert.ok(isWet(s, 7, 10), 'round the end of a short bank');
});

test('the flood rises and falls with the event: dry, then wider, then draining', () => {
  const { s, events } = flooding(), e = events[0];
  const cover = (t: number) => { s.time = t; return flooded(s).count; };
  assert.equal(cover(e.start - 1), 0);
  const early = cover(e.start + 20), mid = cover(e.start + e.length / 2), late = cover(e.start + e.length - 20);
  assert.ok(early > 0 && early <= mid && late <= mid, `${early} ${mid} ${late}`);
  assert.equal(cover(e.start + e.length), 0);
  assert.ok(floodRise(s.scenario, e.start + e.length / 2) > 0.99 && floodRise(s.scenario, e.start + e.length / 2) <= 1);
  assert.equal(floodStep(0), 0);
  assert.equal(floodStep(1), 2);
  assert.ok(floodStep(0.3) === 0 && floodStep(0.5) === 1 && floodStep(0.99) === 1 && floodStep(1) === 2);
});

test('a flooded field loses its growing crop and starts again; what it stored is untouched; a flooded building stops and says so', () => {
  const { s } = flooding('flood', 'ordinary', (e) => e.start - 30);
  const field = put(s, 'field', 5, 5);
  field.crop = 'sunflower'; field.growth = 0.1; field.stored = 3;
  const mill = put(s, 'mill', 6, 12);
  mill.inputs = { wheat: 2 };
  const dry = put(s, 'field', 18, 5);
  dry.growth = 0.5;
  advance(s, 1);
  assert.notEqual(field.status, 'weather');
  // The flood comes.
  while (!isFlooded(s, field)) advance(s, 1);
  advance(s, 1);
  assert.deepEqual([field.status, readHold(field.need)?.kind, readHold(field.need)?.effect], ['weather', 'flood', 'lost']);
  assert.equal(field.growth, 0, 'the growing crop is lost');
  assert.equal(field.stored, 3, 'the harvest it already held is not');
  assert.deepEqual([mill.status, readHold(mill.need)?.kind, readHold(mill.need)?.effect], ['weather', 'flood', 'stopped']);
  assert.equal(mill.progress, null);
  assert.deepEqual(mill.inputs, { wheat: 2 }, 'its stock is untouched');
  assert.notEqual(dry.status, 'weather');
  assert.ok(dry.growth > 0.5, 'higher ground keeps growing');
  assert.match(describeStatus(s, field), /Under water.*lost.*starts again/);
  assert.match(describeStatus(s, mill), /Under water.*stopped/);
  // The field grows nothing while the water stands.
  advance(s, 30);
  assert.equal(field.growth, 0);
  // When the water drains it works again, from the start.
  while (isFlooded(s, field)) advance(s, 5);
  advance(s, 2);
  assert.notEqual(field.status, 'weather');
  advance(s, 5);
  assert.ok(field.growth > 0);
});

test('silt does not lift stony ground past its cap', () => {
  const { s, events } = flooding();
  advance(s, 1);
  const i = 10 * 30 + 6;
  s.map.ground[i] = GROUND.stony; s.map.fertility[i] = FIELD.stonyCap - 1; s.soilBase[i] = FIELD.stonyCap - 1;
  while (s.time < events[0].start + events[0].length + 5) advance(s, 5);
  assert.equal(s.map.fertility[i], FIELD.stonyCap);
  assert.equal(s.soilBase[i], FIELD.stonyCap);
});

test('drained ground gains a little silt, never as much as the flood cost', () => {
  const { s, events } = flooding();
  advance(s, 1);
  const before = s.map.fertility[10 * 30 + 6], base = s.soilBase[10 * 30 + 6], far = s.map.fertility[10 * 30 + 25];
  // Let the whole event pass.
  const e = events[0];
  while (s.time < e.start + e.length + 5) advance(s, 5);
  assert.equal(s.map.fertility[10 * 30 + 6], before + SILT, 'silt where the water stood');
  assert.equal(s.soilBase[10 * 30 + 6], base + SILT, 'and the soil recovers to the richer level');
  assert.equal(s.map.fertility[10 * 30 + 25], far, 'none on ground the flood never reached');
  // A flood costs a field its crop: at least a quarter of a harvest of wheat, worth more than 9 tiles × 2 fertility ever are.
  assert.ok(SILT <= 3, 'a little');
  // Silt is not twice. Drained again, nothing more comes without another flood.
  const after = s.map.fertility[10 * 30 + 6];
  advance(s, 60);
  assert.equal(s.map.fertility[10 * 30 + 6], after);
  assert.equal(s.map.fertility[10 * 30 + 6] <= 100, true);
});

test('trucks cannot drive through water: they go round it, or wait until it drains', () => {
  // A pond in the middle of an open plain, with a route from one side of it to the other.
  const { s } = flooding('flood', 'ordinary', (e) => e.start - 30);
  for (let y = 0; y < 30; y++) for (let x = 2; x <= 3; x++) s.map.terrain[y * 30 + x] = TERRAIN.grass;
  s.map.terrain[15 * 30 + 15] = TERRAIN.water;
  const a = put(s, 'silo', 5, 14), b = put(s, 'silo', 24, 14);
  const g = put(s, 'garage', 5, 18);
  put(s, 'pylon', 8, 18);
  put(s, 'battery', 9, 18).charge = POWER.battery.capacity;
  const bought = buyTruck(s, g);
  if (!bought.ok) assert.fail(bought.error);
  const truck = bought.value.truck, r = newRoute(s);
  addStop(s, r, a); addStop(s, r, b);
  setTruckRoute(s, truck, r);
  const dry = distanceTo(s, b, 14 * 30 + 7);
  advance(s, 1);
  s.time = s.scenario.events[0].start + s.scenario.events[0].length / 2;
  advance(s, 1);
  assert.ok(isWet(s, 12, 15) && isWet(s, 18, 15), 'the pond has spread');
  const round = distanceTo(s, b, 14 * 30 + 7);
  assert.ok(round > dry && round < Infinity, `the way round (${round.toFixed(1)}) is longer than the way across (${dry.toFixed(1)})`);
  // A building in the water has nowhere to load; when the flood is gone it has again.
  const swamped = put(s, 'silo', 13, 12);
  advance(s, 1);
  assert.ok(isFlooded(s, swamped));
  assert.equal(accessTiles(s, swamped).length, 0);
  assert.equal(distanceTo(s, swamped, 14 * 30 + 7), Infinity);
  // A truck on the road never stands in water, for as long as the flood lasts, and still makes its trips.
  let trips = 0, wasAt = '';
  for (let k = 0; k < 300; k++) {
    advance(s, 0.5);
    assert.equal(isWet(s, Math.floor(truck.x), Math.floor(truck.y)), false, `truck in water at ${truck.x.toFixed(1)},${truck.y.toFixed(1)} (t=${s.time})`);
    const at = truck.phase === 'dock' || truck.phase === 'queue' ? String(truck.target) : '';
    if (at && at !== wasAt) trips++;
    wasAt = at;
  }
  assert.ok(trips >= 2, `${trips}`);
  s.time = s.scenario.events[0].start + s.scenario.events[0].length + 10;
  advance(s, 1);
  assert.ok(accessTiles(s, swamped).length > 0);
  assert.ok(distanceTo(s, swamped, 14 * 30 + 7) < Infinity);
});

test('a flooded building leaves the power network: a flooded pylon links nothing', () => {
  const { s } = flooding('flood', 'ordinary', (e) => e.start - 30);
  const solar = put(s, 'solar', 6, 8), pylon = put(s, 'pylon', 7, 10), far = put(s, 'pylon', 14, 10), mill = put(s, 'mill', 16, 8);
  advance(s, 1);
  assert.equal(networkOf(s, mill)?.id, networkOf(s, far)?.id);
  s.time = s.scenario.events[0].start + s.scenario.events[0].length / 2;
  advance(s, 1);
  assert.equal(solar.status, 'weather');
  assert.equal(pylon.status, 'weather');
  assert.equal(networkOf(s, solar), null);
  assert.equal(networkOf(s, pylon), null);
  assert.ok(networkOf(s, far), 'a pylon on dry ground still works');
});

test('the placement card counts only what the water leaves: a flooded pylon does not reach, a flooded hive does not pollinate', () => {
  const { s } = flooding('flood', 'ordinary', (e) => e.start - 30);
  const pylon = put(s, 'pylon', 8, 10), hive = put(s, 'hive', 8, 14);
  const fact = (type: BuildingId, x: number, y: number, label: string, crop?: 'sunflower') => placement(s, type, x, y, crop ? { crop } : {}).facts.find((f) => f.label === label)?.value;
  advance(s, 1);
  assert.equal(fact('mill', 11, 9, 'Power'), 'in reach');
  const dry = fact('field', 11, 13, 'Sunflower', 'sunflower');
  s.time = s.scenario.events[0].start + s.scenario.events[0].length / 2;
  advance(s, 1);
  assert.ok(isFlooded(s, pylon) && isFlooded(s, hive));
  assert.equal(fact('mill', 11, 9, 'Power'), 'none');
  assert.notEqual(fact('field', 11, 13, 'Sunflower', 'sunflower'), dry, 'no bonus from a hive under water');
});

test('a bank exactly as high as the water has run down to holds it, however far the water ran', () => {
  const { s } = flooding('flood', 'severe');
  // The river stands at level 3; its flood is 2 levels up, 5 in all, and falls FALL a tile: 25 tiles out it is exactly level 1.
  for (const x of [2, 3]) for (let y = 0; y < 30; y++) s.map.corner.fill(3, (y * 30 + x) * 4, (y * 30 + x) * 4 + 4);
  raise(s, 28, 1);
  assert.ok(isWet(s, 27, 10), 'the water runs 24 tiles');
  assert.ok(!isWet(s, 28, 10), 'and no further over a bank as high as it is');
  assert.ok(!isWet(s, 29, 10), 'nor behind it');
});

test('a building the water reaches between steps (a bank lowered while paused) can be described at once', () => {
  const { s } = flooding();
  raise(s, 6, 3); // a bank keeps the water off the ground behind it
  const pylon = put(s, 'pylon', 8, 10), mill = put(s, 'mill', 8, 14);
  advance(s, 1);
  assert.equal(pylon.status, 'ok');
  raise(s, 6, 0); // the bank goes; the next step has not run
  assert.ok(isFlooded(s, pylon));
  assert.match(describeStatus(s, pylon), /Under water/);
  assert.match(describeStatus(s, mill), /Under water/);
});

test('a partly flooded depot still loads trucks on its dry side', () => {
  const { s } = flooding('flood', 'ordinary');
  s.map.depot.x = 8; s.map.depot.y = 8;
  s.buildings[0].x = 8; s.buildings[0].y = 8;
  advance(s, 1);
  assert.ok(isFlooded(s, s.buildings[0]));
  assert.ok(accessTiles(s, s.buildings[0]).length > 0);
});

test('a flooded hive pollinates nothing, and a flooded field feeds no hive', () => {
  // The hive stands in the water, the field on dry ground within its reach.
  const a = flooding('flood', 'ordinary', (e) => e.start - 30).s;
  const field = put(a, 'field', 10, 9), hive = put(a, 'hive', 8, 10);
  field.crop = 'sunflower';
  advance(a, 1);
  assert.ok(isPollinated(a, field) && flowersNear(a, hive) === 1, 'dry weather: both ways');
  a.time = a.scenario.events[0].start + a.scenario.events[0].length / 2;
  advance(a, 1);
  assert.ok(isFlooded(a, hive) && !isFlooded(a, field));
  assert.ok(!isPollinated(a, field));
  // The field stands in the water, the hive on dry ground.
  const b = flooding('flood', 'ordinary', (e) => e.start - 30).s;
  const wet = put(b, 'field', 6, 9), dry = put(b, 'hive', 12, 10);
  wet.crop = 'sunflower';
  advance(b, 1);
  assert.equal(flowersNear(b, dry), 1);
  b.time = b.scenario.events[0].start + b.scenario.events[0].length / 2;
  advance(b, 1);
  assert.ok(isFlooded(b, wet) && !isFlooded(b, dry));
  assert.equal(flowersNear(b, dry), 0);
  assert.ok(!isPollinated(b, wet), 'a field under water is pollinated by no hive');
  // A sprinkler waters no field under water.
  const c = flooding('flood', 'ordinary', (e) => e.start - 30).s;
  const field2 = put(c, 'field', 6, 9), sprinkler = put(c, 'sprinkler', 10, 10);
  advance(c, 1);
  assert.deepEqual(sprinklersOf(c, field2), [sprinkler]);
  c.time = c.scenario.events[0].start + c.scenario.events[0].length / 2;
  advance(c, 1);
  assert.ok(isFlooded(c, field2));
  assert.deepEqual(sprinklersOf(c, field2), []);
});

test('a building the water covers trades with no neighbour: the links say so, as the transfers do', () => {
  const { s } = flooding('flood', 'ordinary', (e) => e.start - 30);
  const field = put(s, 'field', 7, 9), mill = put(s, 'mill', 10, 10);
  field.crop = 'wheat'; field.harvest = 'wheat';
  advance(s, 1);
  assert.deepEqual(linksOf(s, mill).from.map((l) => l.b), [field]);
  assert.ok(served(s, mill, 'wheat', 'drop'));
  s.time = s.scenario.events[0].start + s.scenario.events[0].length / 2;
  advance(s, 1);
  assert.ok(isFlooded(s, field) && !isFlooded(s, mill));
  field.stored = 3;
  advance(s, 2);
  assert.deepEqual(linksOf(s, mill).from, []);
  assert.ok(!served(s, mill, 'wheat', 'drop'));
  assert.equal(field.stored, 3);
});

test('a game loaded just before the water drains silts as the one that ran on', () => {
  const { s, events } = flooding('flood', 'ordinary', (e) => e.start + e.length - 20);
  const e = events[0];
  for (let k = 0; s.time < e.start + e.length + 5; k++) {
    const back = deserialize(serialize(s));
    if (!back.ok) assert.fail(back.error);
    advance(s, 0.1); advance(back.value, 0.1);
    assert.deepEqual(Array.from(back.value.map.fertility), Array.from(s.map.fertility), `tick ${k}`);
    assert.deepEqual(Array.from(back.value.soilBase), Array.from(s.soilBase), `tick ${k}`);
  }
  assert.equal(s.map.fertility[10 * 30 + 6], 60 + SILT);
});

test('the depot is not stopped by a flood, and a sapling keeps growing', () => {
  const { s } = flooding('flood', 'severe', (e) => e.start + e.length / 2);
  s.map.depot.x = 8; s.map.depot.y = 8;
  const sapling = put(s, 'sapling', 7, 15);
  advance(s, 1);
  assert.notEqual(sapling.status, 'weather');
  assert.ok(buildingAt(s, 7, 15));
});

test('the flood level of ground: the lowest flood that reaches it, shown on the placement card', () => {
  const { s } = flooding('flood', 'ordinary', (e) => e.start - 100);
  const at = (x: number, y = 10) => floodsAt(s, { type: 'field', x, y });
  assert.equal(at(5), 1, 'the floodplain floods in an ordinary flood');
  assert.equal(at(15), 2, 'higher up only a severe flood reaches it');
  assert.equal(at(28, 28), null, 'ground the highest flood cannot reach');
  raise(s, 4, 3);
  assert.equal(at(5), null, 'behind a bank');
  assert.ok(canFlood(climateOf('spring')) && canFlood(climateOf('autumn', 'stormy')) && !canFlood(climateOf('winter')));
  // The card states it.
  raise(s, 4, 0);
  const card = placement(s, 'field', 6, 10).facts.find((f) => f.label === 'Floods');
  assert.ok(card, 'a field on the floodplain says it floods');
  assert.match(card.value, /level 1/);
  assert.equal(placement(s, 'field', 25, 25).facts.find((f) => f.label === 'Floods'), undefined);
});

test('a spring thunderstorm brings a flood at once, at its strength; a summer one does not', () => {
  const spring = eventOn(3, 6, 'thunderstorm', 'ordinary', undefined, 'spring');
  assert.deepEqual(spring.map((e) => e.kind), ['thunderstorm', 'flood']);
  assert.equal(spring[1].start, spring[0].start + spring[0].length);
  assert.equal(spring[1].strength, 'ordinary');
  assert.equal(eventOn(3, 6, 'thunderstorm', 'severe', undefined, 'spring')[1].strength, 'severe');
  assert.deepEqual(eventOn(3, 6, 'thunderstorm', 'ordinary', undefined, 'summer').map((e) => e.kind), ['thunderstorm']);
  assert.deepEqual(eventOn(3, 6, 'thunderstorm').map((e) => e.kind), ['thunderstorm'], 'its season is not known');
  // A tropical storm brings its flood in any season.
  assert.deepEqual(eventOn(3, 6, 'tropicalStorm', 'severe', undefined, 'autumn').map((e) => e.kind), ['tropicalStorm', 'flood']);
  assert.equal(EVENTS.flood.flood?.severe, 2 * (EVENTS.flood.flood?.ordinary ?? 0), 'a hurricane\'s flood is a level higher');
  // Random commissions: every spring thunderstorm they roll is followed by its flood.
  let storms = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const climate = climateOf('spring', seed % 2 ? 'stormy' : 'wet'), ev = rollEvents(seed, 3, climate, 3000);
    ev.forEach((e, i) => { if (e.kind === 'thunderstorm') { storms++; assert.equal(ev[i + 1]?.kind, 'flood', `seed ${seed}`); assert.equal(ev[i + 1].start, e.start + e.length); assert.equal(ev[i + 1].strength, e.strength); } });
  }
  assert.ok(storms > 50, `${storms}`);
  assert.ok(eventsOf(climateOf('spring')).includes('flood'));
});

test('a lake or ponds flood their shores as a river does', () => {
  const { s } = flooding();
  for (let y = 0; y < 30; y++) for (let x = 2; x <= 3; x++) s.map.terrain[y * 30 + x] = TERRAIN.grass;
  s.map.terrain[15 * 30 + 15] = TERRAIN.water;
  advance(s, 1);
  assert.ok(isWet(s, 16, 15) && isWet(s, 15, 14));
  assert.ok(!isWet(s, 5, 10), 'the old river bed is plain ground now');
});

test('saplings, pylons, the wheel: every kind of building keeps a status the interface knows', () => {
  const { s } = flooding('flood', 'ordinary', (e) => e.start + e.length / 2);
  const seen: Building[] = [];
  for (const type of Object.keys(BUILDINGS) as BuildingId[]) {
    if (type === 'depot' || type === 'sapling') continue;
    const r = place(s, type, 4, 2 + seen.length * 3, 0);
    if (r.ok) seen.push(r.value.building);
  }
  advance(s, 1);
  for (const b of seen) if (isFlooded(s, b)) assert.equal(b.status, 'weather', b.type);
  assert.ok(seen.some((b) => b.status === 'weather'));
  assert.deepEqual(corners(s.map, 5, 5), [0, 0, 0, 0]);
});
