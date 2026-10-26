import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addStop, buyTruck, newRoute, place, setCrop, setTruckRoute } from '../src/game/build.ts';
import { DAY_SECONDS, POWER } from '../src/game/data.ts';
import { activeEvents, eventChain, EVENTS, rollEvents, timeOf, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { floodLevel, floodRise } from '../src/game/flood.ts';
import { readHold, truckHold } from '../src/game/hold.ts';
import { TERRAIN } from '../src/game/map.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Character, type Season } from '../src/game/seasons.ts';
import { windAt } from '../src/game/sim/clock.ts';
import { describeStatus, describeTruck } from '../src/game/sim/describe.ts';
import { makes } from '../src/game/sim/energy.ts';
import { exposureOf } from '../src/game/sim/layout.ts';
import { advance } from '../src/game/sim/step.ts';
import { tonight } from '../src/game/forecast.ts';
import { garageOf, tileOf } from '../src/game/sim/trucks.ts';
import { newGame, tileIndex, touchLayout, type BuildingOf, type GameState } from '../src/game/state.ts';
import { distanceTo } from '../src/game/roads.ts';
import { beesOut, warmthOf } from '../src/game/warmth.ts';
import { garaging, keepingBeesIn, standsGale, turbineShare } from '../src/game/wind.ts';
import type { BuildingId } from '../src/game/data.ts';
import { TRUTH } from '../src/game/ahead.ts';
import { GROUND, PLAIN } from '../src/game/ground.ts';

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

/** A flat game in a season with the events given, set to `at`. */
function game(season: Season, events: WeatherEvent[], at: number, character: Character | null = null): GameState {
  const climate = { ...climateOf(season, character), conditions: NO_CONDITIONS };
  const sc: Scenario = { ...SANDBOX, climate, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events,
    terrain: { ground: PLAIN, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.ground.fill(GROUND.loam); s.map.fertility.fill(60);
  s.soilBase.fill(60);
  s.time = at;
  return s;
}

const event = (kind: EventKind, strength: Strength, day: number, hour: number, hours: number): WeatherEvent => ({ kind, strength, start: timeOf(day, hour), length: hours * HOUR });

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

/** A pylon with a full battery, so the buildings near it have power. */
function power(s: GameState, x: number, y: number) {
  put(s, 'pylon', x, y);
  put(s, 'battery', x + 1, y).charge = POWER.battery.capacity;
}

/** Trees on the tiles beside (x, y), `n` of them, for shelter. */
function trees(s: GameState, x: number, y: number, n: number) {
  const around = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]];
  for (const [dx, dy] of around.slice(0, n)) s.map.terrain[tileIndex(s, x + dx, y + dy)] = TERRAIN.tree;
  touchLayout(s);
}

/** A turbine at (x, y) with `shelter` trees beside it, on a powered network. */
function turbine(s: GameState, x: number, y: number, shelter: number) {
  trees(s, x, y, shelter);
  power(s, x, y + 2);
  return put(s, 'turbine', x, y);
}

const watts = (s: GameState, b: BuildingOf<'turbine'>) => makes(s, b, 0, windAt(s.scenario, s.time));

test('an ordinary gale is a strong wind: turbines at full power, bees stay in, nothing is stopped', () => {
  const gale = event('gale', 'ordinary', 3, 8, 24);
  const s = game('autumn', [gale], timeOf(3, 14), 'gales'), quiet = game('autumn', [], timeOf(3, 14), 'gales');
  for (const g of [s, quiet]) { power(g, 4, 4); put(g, 'turbine', 6, 6); put(g, 'hive', 12, 8); }
  const t = s.buildings.find((b) => b.type === 'turbine')! as BuildingOf<'turbine'>;
  assert.ok(windAt(s.scenario, s.time) >= 0.95, 'a strong wind');
  assert.equal(turbineShare(s, t.id, exposureOf(s, t)), 1, 'an ordinary gale does not touch a turbine');
  assert.ok(Math.abs(watts(s, t) - POWER.turbine * windAt(s.scenario, s.time)) < 1e-9, 'full power');
  assert.ok(warmthOf(s) > 10 && keepingBeesIn(s.scenario, s.time), 'warm enough to fly, but the gale keeps them in');
  assert.ok(!beesOut(s) && beesOut(quiet));
  advance(s, 2); advance(quiet, 2);
  const hive = s.buildings.find((b) => b.type === 'hive')!;
  assert.equal(s.buildings.find((b) => b.type === 'turbine')!.status, 'ok');
  // The hive has no flowers here, so give it some: then the weather is what stops it.
  for (const g of [s, quiet]) { const f = put(g, 'field', 12, 12); setCrop(g, f, 'sunflower'); }
  advance(s, 2); advance(quiet, 2);
  assert.equal(hive.status, 'weather');
  assert.deepEqual(readHold(hive.need), { kind: 'gale', strength: 'ordinary', effect: 'stopped' });
  assert.match(describeStatus(s, hive), /^The bees stay in: the gale is too wild/);
  assert.notEqual(quiet.buildings.find((b) => b.type === 'hive')!.status, 'weather');
  const before = hive.growth;
  advance(s, 20);
  assert.equal(hive.growth, before, 'no honey in a gale');
});

test('a severe gale stops an exposed turbine; a sheltered one keeps turning, furled, in gusts', () => {
  const gale = event('gale', 'severe', 3, 8, 24);
  const s = game('autumn', [gale], timeOf(3, 14), 'gales');
  power(s, 4, 4);
  const bare = turbine(s, 10, 10, 0), grove = turbine(s, 16, 10, 4), light = turbine(s, 22, 10, 2);
  advance(s, 1);
  const normal = (b: BuildingOf<'turbine'>) => POWER.turbine * windAt(s.scenario, s.time) * exposureOf(s, b);
  assert.equal(watts(s, bare), 0, 'exposed: stopped');
  assert.equal(bare.status, 'weather');
  assert.deepEqual(readHold(bare.need), { kind: 'gale', strength: 'severe', effect: 'stopped' });
  assert.match(describeStatus(s, bare), /^Stopped: the severe gale is stronger than a turbine this exposed can stand/);
  assert.equal(watts(s, light), 0, 'two trees are not enough');
  // The sheltered one turns, but at well under what its shelter would give it in an ordinary wind, and the gusts move it.
  const seen: number[] = [];
  for (let i = 0; i < 40; i++) { s.time += 1.7; seen.push(watts(s, grove) / normal(grove)); }
  assert.ok(seen.every((x) => x > 0 && x < 0.85), `reduced: ${seen.map((x) => x.toFixed(2)).join(' ')}`);
  assert.ok(Math.max(...seen) - Math.min(...seen) > 0.1, 'unsteady');
  advance(s, 1);
  assert.equal(grove.status, 'weather');
  assert.deepEqual(readHold(grove.need), { kind: 'gale', strength: 'severe', effect: 'weak' });
  assert.match(describeStatus(s, grove), /^Turning slowly, in gusts, making about \d+% of its power/);
  // Once it has passed, every turbine runs as usual.
  s.time = timeOf(5, 12);
  advance(s, 1);
  for (const b of [bare, grove, light]) assert.equal(b.status, 'ok');
  assert.equal(turbineShare(s, bare.id, exposureOf(s, bare)), 1);
});

test('up high a turbine is more exposed, so it stops sooner; the cards say which stand a severe gale', () => {
  assert.ok(standsGale(EVENTS.gale.push.severe?.gale ?? 0, 0.7) && !standsGale(EVENTS.gale.push.severe?.gale ?? 0, 0.8) && !standsGale(EVENTS.gale.push.severe?.gale ?? 0, 1));
  assert.ok(!standsGale(EVENTS.tropicalStorm.push.severe?.gale ?? 0, POWER.shelterFloor), 'a hurricane beats even the deepest shelter');
  const gale = event('gale', 'severe', 3, 8, 24);
  const s = game('autumn', [gale], timeOf(3, 14));
  s.map.corner.fill(8);
  power(s, 4, 4);
  const high = turbine(s, 16, 10, 3);
  assert.ok(exposureOf(s, high) > 1 / (EVENTS.gale.push.severe?.gale ?? 1), `three trees but up at level 8: ${exposureOf(s, high)}`);
  assert.equal(watts(s, high), 0);
});

test('ramping in, the most exposed turbines stop first', () => {
  const gale = event('gale', 'severe', 3, 8, 24);
  const s = game('autumn', [gale], gale.start);
  power(s, 4, 4);
  const bare = turbine(s, 10, 10, 0), grove = turbine(s, 16, 10, 4);
  let bareStopped: number | null = null, groveStopped: number | null = null;
  for (let h = 0; h <= 3; h += 0.1) {
    s.time = gale.start + h * HOUR;
    if (bareStopped === null && watts(s, bare) === 0) bareStopped = h;
    if (groveStopped === null && watts(s, grove) === 0) groveStopped = h;
  }
  assert.ok(bareStopped !== null && bareStopped < 1.5, `bare stops while it builds: ${bareStopped}`);
  assert.equal(groveStopped, null, 'the sheltered one never does');
});

test('a hurricane stops every turbine, however sheltered, takes the sun and the hens and the bees, and keeps the trucks home in its worst hours', () => {
  const hurricane = event('tropicalStorm', 'severe', 3, 6, 36);
  const s = game('autumn', [hurricane], timeOf(3, 20), 'stormy'), quiet = game('autumn', [], timeOf(3, 20), 'stormy');
  for (const g of [s, quiet]) { power(g, 4, 4); turbine(g, 10, 10, 0); turbine(g, 16, 10, 8); put(g, 'solar', 4, 7); const c = put(g, 'coop', 20, 4); c.inputs = { beans: 6 }; put(g, 'hive', 24, 14); setCrop(g, put(g, 'field', 22, 18), 'sunflower'); }
  advance(s, 2); advance(quiet, 2);
  for (const b of s.buildings.filter((x) => x.type === 'turbine')) {
    assert.equal(b.status, 'weather');
    assert.deepEqual(readHold(b.need), { kind: 'tropicalStorm', strength: 'severe', effect: 'stopped' });
    assert.equal(makes(s, b, 0, 1), 0);
    assert.match(describeStatus(s, b), /^Stopped: no turbine, sheltered or not, stands the hurricane/);
  }
  const noon = timeOf(3, 12);
  s.time = noon; quiet.time = noon;
  const sun = (g: GameState) => makes(g, g.buildings.find((b) => b.type === 'solar')!, Math.max(0, Math.sin(Math.PI * (12 - 7) / 11)), 0);
  advance(s, 1); advance(quiet, 1);
  const panel = s.buildings.find((b) => b.type === 'solar')!;
  assert.ok(sun(s) > 0);
  assert.ok(panel.status === 'weather' && readHold(panel.need)?.effect === 'weak', 'solar is weak under the hurricane');
  const coop = s.buildings.find((b) => b.type === 'coop')!;
  assert.deepEqual(readHold(coop.need), { kind: 'tropicalStorm', strength: 'severe', effect: 'stopped' });
  assert.match(describeStatus(s, coop), /^The hens have stopped laying/);
  const eggs = (g: GameState) => g.buildings.find((b) => b.type === 'coop') as BuildingOf<'coop'>;
  const was = eggs(s).progress;
  advance(s, 30);
  assert.ok(eggs(s).progress === was || (eggs(s).progress ?? 0) - (was ?? 0) < 0.5, 'the hens do not lay');
  const hive = s.buildings.find((b) => b.type === 'hive')!;
  assert.deepEqual(readHold(hive.need), { kind: 'tropicalStorm', strength: 'severe', effect: 'stopped' });
  assert.ok(!beesOut(s));
  assert.equal(quiet.buildings.find((b) => b.type === 'coop')!.status, 'ok');
  for (const b of quiet.buildings.filter((x) => x.type === 'turbine')) assert.equal(b.status, 'ok');
});

test('a hurricane\'s flood is certain and a level higher than an ordinary storm\'s', () => {
  const chain = (strength: Strength) => eventChain('tropicalStorm', strength, timeOf(3, 6), undefined, 'autumn');
  assert.deepEqual(chain('ordinary').map((e) => [e.kind, e.strength]), [['tropicalStorm', 'ordinary'], ['flood', 'ordinary']]);
  assert.deepEqual(chain('severe').map((e) => [e.kind, e.strength]), [['tropicalStorm', 'severe'], ['flood', 'severe']]);
  assert.equal(floodLevel(chain('severe')[1]), floodLevel(chain('ordinary')[1]) + 1);
  const s = game('autumn', chain('severe'), chain('severe')[1].start + 12 * HOUR);
  assert.equal(floodRise(s.scenario, s.time), floodLevel(chain('severe')[1]));
  // In summer too.
  assert.equal(eventChain('tropicalStorm', 'ordinary', timeOf(3, 6), undefined, 'summer')[1]?.kind, 'flood');
});

test('an ordinary tropical storm: heavy rain, little sun, strong wind, bees in; every turbine runs', () => {
  const storm = event('tropicalStorm', 'ordinary', 3, 6, 36);
  const s = game('autumn', [storm], timeOf(3, 14), 'stormy'), quiet = game('autumn', [], timeOf(3, 14), 'stormy');
  for (const g of [s, quiet]) { power(g, 4, 4); turbine(g, 10, 10, 0); put(g, 'solar', 4, 7); }
  advance(s, 2);
  assert.equal(s.buildings.find((b) => b.type === 'turbine')!.status, 'ok');
  assert.equal(s.buildings.find((b) => b.type === 'solar')!.status, 'weather', 'the sun is dimmed');
  assert.ok(windAt(s.scenario, s.time) >= 0.95);
  assert.ok(!beesOut(s) && beesOut(quiet));
  assert.equal(garaging(s.scenario, s.time), null, 'the trucks keep running');
  assert.equal(activeEvents(s.scenario, s.time).length, 1);
});

/** A garage with a truck on a field-to-depot route. */
function haul(s: GameState) {
  power(s, 4, 22);
  const garage = put(s, 'garage', 4, 18);
  const field = put(s, 'field', 4, 8);
  field.stored = 6; field.harvest = 'wheat';
  const depot = s.buildings.find((b) => b.type === 'depot')!;
  const bought = buyTruck(s, garage);
  assert.ok(bought.ok);
  const r = newRoute(s);
  assert.ok(addStop(s, r, field).ok && addStop(s, r, depot).ok);
  setTruckRoute(s, bought.value.truck, r);
  return { truck: bought.value.truck, garage };
}

test('in a hurricane\'s worst hours the trucks drive home and stay; they go out again when it eases', () => {
  const hurricane = event('tropicalStorm', 'severe', 3, 0, 36); // worst hours: 09:00 on day 3 to 03:00 on day 4... the middle half
  assert.deepEqual([garaging(game('autumn', [hurricane], timeOf(3, 4)).scenario, timeOf(3, 4)), garaging(game('autumn', [hurricane], timeOf(3, 12)).scenario, timeOf(3, 12))], [null, hurricane]);
  assert.equal(garaging(game('autumn', [hurricane], 0).scenario, timeOf(4, 12)), null, 'by the end it has eased');
  const s = game('autumn', [hurricane], timeOf(2, 20), 'stormy');
  const { truck } = haul(s);
  advance(s, 12);
  assert.equal(String(truck.phase), 'drive', 'before the storm, off on its route');
  assert.equal(truckHold(s, truck), null);
  s.time = timeOf(3, 9.5);
  advance(s, 60);
  const home = () => distanceTo(s, garageOf(s, truck)!, tileOf(s, truck)) === 0;
  assert.ok(['charge', 'parked'].includes(truck.phase), `home in the worst hours: ${truck.phase}`);
  assert.ok(home());
  assert.deepEqual(truckHold(s, truck), { kind: 'tropicalStorm', strength: 'severe', effect: 'stopped' });
  assert.match(describeTruck(s, truck), /^Kept in its garage by the hurricane until it eases/);
  advance(s, 60);
  assert.ok(['charge', 'parked'].includes(truck.phase), 'and stays there');
  // When the worst has passed it goes again.
  s.time = timeOf(4, 5);
  advance(s, 30);
  assert.ok(['drive', 'dock', 'queue'].includes(truck.phase), `back on its route: ${truck.phase}`);
  assert.equal(truckHold(s, truck), null);
});

test('a truck far from home when the worst hours begin turns back', () => {
  const hurricane = event('tropicalStorm', 'severe', 3, 0, 36);
  const s = game('autumn', [hurricane], timeOf(3, 8), 'stormy');
  const { truck, garage } = haul(s);
  advance(s, 8);
  assert.equal(truck.target !== garage.id, true, 'out on its route');
  s.time = timeOf(3, 9.5);
  advance(s, 1);
  assert.equal(truck.target, garage.id, 'told to go home');
  advance(s, 120);
  assert.ok(['charge', 'parked'].includes(truck.phase));
});

test('the odds: a tropical storm is rarer in summer than autumn, a hurricane needs a stormy character and the hardest difficulty', () => {
  assert.equal(EVENTS.tropicalStorm.seasons.summer, 0.15);
  assert.ok((EVENTS.tropicalStorm.seasons.autumn ?? 0) > (EVENTS.tropicalStorm.seasons.summer ?? 0));
  assert.ok(!EVENTS.tropicalStorm.seasons.spring && !EVENTS.tropicalStorm.seasons.winter, 'only late in summer or in autumn');
  let storms = 0, hurricanes = 0;
  for (const [season, character] of [['summer', 'stormy'], ['autumn', 'stormy'], ['autumn', 'wet'], ['autumn', 'gales'], ['summer', 'hot']] as const) {
    for (let seed = 1; seed <= 150; seed++) for (const difficulty of [1, 2, 3] as const) {
      const ev = rollEvents(seed * 7919, difficulty, climateOf(season, character), 40 * 60);
      for (const e of ev) if (e.kind === 'tropicalStorm') {
        storms++;
        if (e.strength === 'severe') { hurricanes++; assert.equal(difficulty, 3); assert.equal(character, 'stormy'); }
      }
      assert.ok(ev.filter((e) => e.kind === 'tropicalStorm' && e.strength === 'severe').length <= 1, 'at most one hurricane a level');
    }
  }
  assert.ok(storms > 0 && hurricanes > 0, `${storms} storms, ${hurricanes} hurricanes`);
});

test('wind events are marked: each has a shape of its own and says what it holds', () => {
  for (const k of ['gale', 'tropicalStorm'] as const) assert.ok(EVENTS[k].shape && EVENTS[k].holds, k);
  assert.notEqual(EVENTS.gale.shape, EVENTS.tropicalStorm.shape);
});

test('a gale blows at full strength through the calm spells and gusts of its season', () => {
  const gale = event('gale', 'ordinary', 3, 8, 24);
  for (const seed of [1, 192, 4242]) {
    const s = game('autumn', [gale], gale.start, 'stormy');
    s.scenario.seed = seed;
    s.scenario.climate.conditions = climateOf('autumn', 'stormy').conditions;
    for (let h = 2; h <= 22; h += 0.25) assert.equal(windAt(s.scenario, gale.start + h * HOUR), 1, `seed ${seed}, ${h} h in`);
  }
});

test('a stuck truck outside when the worst hours begin finds its way home; a turbine out of the network is still stopped', () => {
  const hurricane = event('tropicalStorm', 'severe', 3, 0, 36);
  const s = game('autumn', [hurricane], timeOf(3, 8), 'stormy');
  const { truck, garage } = haul(s);
  advance(s, 8);
  assert.notEqual(truck.target, garage.id);
  truck.phase = 'stuck'; truck.target = null; truck.path = [];
  s.time = timeOf(3, 9.5);
  advance(s, 3);
  assert.equal(truck.target, garage.id, 'it looks for the way home');
  advance(s, 120);
  assert.ok(['charge', 'parked'].includes(truck.phase), String(truck.phase));
  // A turbine no pylon reaches shows no weather hold, but the storm still stops it (what the view draws).
  const t = put(s, 'turbine', 20, 20);
  assert.equal(t.status === 'ok', false);
  assert.equal(turbineShare(s, t.id, exposureOf(s, t)), 0);
});

test('tonight\'s forecast sees a hurricane that starts overnight, and one that has passed by morning', () => {
  const calm = { ...climateOf('autumn'), conditions: NO_CONDITIONS, wind: { mean: 0.8, gust: 0 } };
  const night = (events: WeatherEvent[]) => {
    const s = game('autumn', events, timeOf(1, 19));
    s.scenario.climate = calm;
    power(s, 4, 4);
    for (const x of [8, 10]) put(s, 'turbine', x, 6);
    put(s, 'pylon', 9, 4);
    const loom = put(s, 'loom', 4, 7); loom.inputs = { yarn: 30 };
    const loom2 = put(s, 'loom', 7, 7); loom2.inputs = { yarn: 30 };
    advance(s, 1);
    return tonight(s, TRUTH)!;
  };
  assert.equal(night([]).dryAt, null, 'the turbines carry the night');
  assert.ok(night([event('tropicalStorm', 'severe', 1, 20, 36)]).dryAt !== null, 'a hurricane from 20:00 stops them');
  // One that began earlier and ends at midnight: the turbines are stopped now, and running again after.
  const late = night([event('tropicalStorm', 'severe', 1, 8, 16)]);
  assert.ok(late.dryAt === null || late.dryAt > timeOf(1, 23), 'they run again once it has passed');
});
