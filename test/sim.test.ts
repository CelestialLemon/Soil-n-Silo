import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canPlace, place, remove, removeAt, setAccept, setCrop, setRecipe, setSell } from '../src/game/build.ts';
import { BUILDINGS, DAY_SECONDS, DRONE, ITEMS, POWER, SILO, START_HOUR } from '../src/game/data.ts';
import { generateMap, TERRAIN } from '../src/game/map.ts';
import { networkOf, networks } from '../src/game/power.ts';
import { deserialize, readProgress, recordResult, serialize } from '../src/game/save.ts';
import { CAMPAIGN, randomScenario, SANDBOX, scenarioById, type Scenario } from '../src/game/scenarios.ts';
import {
  advance, deliver, exposureOf, fieldFertility, goalDone, hourAt, medalFor, ratePerMin, servedBySilo, silosServing, soilHealth, sunAt, windAt,
} from '../src/game/sim.ts';
import { buildingAt, newGame, type Building, type Dir, type GameState } from '../src/game/state.ts';

/** A flat, empty test map: no water, rock or trees, even soil. */
function flat(extra: Partial<Scenario> = {}): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0 }, ...extra,
  };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  return s;
}

function put(s: GameState, type: Parameters<typeof place>[1], x: number, y: number, rot: Dir = 0): Building {
  const r = place(s, type, x, y, rot);
  assert.ok(r.ok, `${type} at ${x},${y}: ${r.message}`);
  return r.building!;
}

const depotOf = (s: GameState) => s.buildings.find((b) => b.type === 'depot')!;

/** A grid with a lot of power: pylon + batteries charged + daylight is not needed. */
function powerAt(s: GameState, x: number, y: number) {
  put(s, 'pylon', x, y);
  const bat = put(s, 'battery', x + 1, y);
  bat.charge = POWER.battery.capacity;
  return bat;
}

test('maps are the same for the same scenario, and every campaign map has room at the depot', () => {
  for (const sc of [...CAMPAIGN, SANDBOX, randomScenario(99, 2)]) {
    const a = generateMap(sc), b = generateMap(sc);
    assert.deepEqual(a, b, sc.id);
    assert.equal(a.terrain.length, sc.width * sc.height);
    // The depot's surroundings are clear.
    for (let y = a.depot.y - 3; y < a.depot.y + 6; y++) for (let x = a.depot.x - 3; x < a.depot.x + 6; x++) {
      if (x < 0 || y < 0 || x >= a.width || y >= a.height) continue;
      assert.equal(a.terrain[y * a.width + x] === TERRAIN.rock || a.terrain[y * a.width + x] === TERRAIN.tree, false, `${sc.id} ${x},${y}`);
    }
  }
});

test('scenarios: ids round-trip, random ones are deterministic', () => {
  for (const sc of CAMPAIGN) assert.equal(scenarioById(sc.id), sc);
  assert.deepEqual(scenarioById('r12345-3'), randomScenario(12345, 3));
  assert.equal(scenarioById('nope'), null);
  const r = randomScenario(7, 1);
  assert.ok(r.goals.length >= 1);
});

test('the sun rises and sets, and wind stays in range', () => {
  const sc = CAMPAIGN[0];
  assert.equal(hourAt(0), START_HOUR);
  const noon = (12 - START_HOUR) / 24 * DAY_SECONDS;
  assert.ok(sunAt(sc, noon) > 0.9);
  assert.equal(sunAt(sc, (22 - START_HOUR) / 24 * DAY_SECONDS), 0);
  assert.equal(sunAt(sc, 0) > 0, true, 'the day starts in sunlight');
  for (let t = 0; t < 2000; t += 7) { const w = windAt(sc, t); assert.ok(w >= 0.05 && w <= 1); }
});

test('placing checks terrain, room and credits, and removing refunds', () => {
  const s = flat();
  const before = s.credits;
  const mill = put(s, 'mill', 5, 5);
  assert.equal(s.credits, before - BUILDINGS.mill.cost);
  assert.equal(canPlace(s, 'pylon', 6, 6).ok, false);
  assert.equal(buildingAt(s, 6, 6), mill);
  s.map.terrain[2 * 30 + 2] = TERRAIN.rock;
  assert.equal(canPlace(s, 'pylon', 2, 2).ok, false);
  assert.ok(removeAt(s, 2, 2).ok);
  assert.equal(canPlace(s, 'pylon', 2, 2).ok, true);
  s.map.terrain[3 * 30 + 3] = TERRAIN.water;
  assert.equal(canPlace(s, 'mill', 2, 3).ok, false);
  assert.equal(canPlace(s, 'pylon', 3, 3).ok, true, 'pylons stand on water');
  remove(s, mill);
  assert.equal(s.credits, before - 15);
  assert.equal(buildingAt(s, 6, 6), null);
  s.credits = 1;
  assert.equal(canPlace(s, 'mill', 5, 5).ok, false);
});

test('a silo serves buildings with a tile within its reach', () => {
  const s = flat();
  const silo = put(s, 'silo', 10, 10);
  const near = put(s, 'field', 10 + 2 + SILO.reach - 1, 10);   // its west column is `reach` tiles from the silo's east one
  const far = put(s, 'field', 10 + 2 + SILO.reach, 14);
  put(s, 'pylon', 4, 4);
  assert.deepEqual(servedBySilo(s, silo).map((b) => b.id), [near.id]);
  assert.deepEqual(silosServing(s, near).map((b) => b.id), [silo.id]);
  assert.equal(silosServing(s, far).length, 0);
});

test('a silo collects a field\'s harvest and sells what is on the sell list at the depot', () => {
  const s = flat();
  const d = s.map.depot;
  powerAt(s, d.x - 7, d.y - 2);
  const silo = put(s, 'silo', d.x - 4, d.y - 2);
  const f = put(s, 'field', d.x - 8, d.y - 6);
  f.stored = 6; f.harvest = 'wheat';
  advance(s, 10);
  assert.equal(f.stored, 0, 'collected');
  assert.equal(silo.store!.wheat, 6, 'not on the sell list: kept');
  assert.ok(setSell(depotOf(s), 'wheat', 'spare').ok);
  const credits = s.credits;
  advance(s, 15);
  assert.equal(s.delivered.wheat, 6);
  assert.equal(s.credits, credits + 6 * ITEMS.wheat.price);
  assert.equal(silo.store!.wheat ?? 0, 0);
});

test('drones feed a mill wheat and collect its flour and bran', () => {
  const s = flat();
  powerAt(s, 2, 2);
  put(s, 'pylon', 7, 3);
  const silo = put(s, 'silo', 4, 4);
  const mill = put(s, 'mill', 8, 4);
  silo.store!.wheat = 6;
  advance(s, 30);
  assert.equal(s.made.flour, 3);
  assert.equal(silo.store!.flour, 3);
  assert.equal(silo.store!.bran, 3);
  assert.equal(mill.status, 'input');
});

test('a mill whose bran nothing takes fills its silo and stops; without a silo it says so', () => {
  const s = flat();
  powerAt(s, 2, 2);
  put(s, 'pylon', 7, 3);
  const silo = put(s, 'silo', 4, 4);
  const mill = put(s, 'mill', 8, 4);
  silo.store = { wheat: 12, bran: SILO.perGood - 2 };
  setSell(depotOf(s), 'flour', 'spare');
  advance(s, 120);
  assert.equal(silo.store!.bran, SILO.perGood, 'the silo took what it had room for');
  assert.equal(mill.outputs!.bran, 3, 'the mill holds the rest');
  assert.equal(mill.status, 'blocked');
  assert.ok(mill.inputs!.wheat! > 0);
  remove(s, silo);
  advance(s, 1);
  assert.equal(mill.status, 'nosilo');
});

test('a silo out of a pylon\'s reach flies nothing; a powered one draws power while its drones charge', () => {
  const s = flat({ weather: { ...SANDBOX.weather, sun: 0, wind: 0.05, gust: 0 } });
  const silo = put(s, 'silo', 4, 4);
  const mill = put(s, 'mill', 8, 4);
  silo.store!.wheat = 6;
  advance(s, 5);
  assert.equal(silo.status, 'power');
  assert.equal(silo.store!.wheat, 6);
  const bat = powerAt(s, 2, 2);
  advance(s, 0.2);
  assert.ok(networkOf(s, silo)!.wanted >= DRONE.chargeRate, `wanted ${networkOf(s, silo)!.wanted}`);
  advance(s, 10);
  assert.ok((mill.inputs!.wheat ?? 0) + (s.made.flour ?? 0) * 2 >= 4, 'fed');
  assert.ok(bat.charge! < POWER.battery.capacity, 'the battery paid for the flights');
});

test('a silo fetches what its buildings need from another silo in range', () => {
  const s = flat();
  powerAt(s, 1, 1);
  powerAt(s, 1, 20);
  put(s, 'pylon', 1, 9); put(s, 'pylon', 1, 15);
  const a = put(s, 'silo', 2, 4), b = put(s, 'silo', 2, 22);
  const mill = put(s, 'mill', 4, 22);
  a.store!.wheat = 8;
  assert.equal(silosServing(s, mill).length, 1);
  advance(s, 30);
  assert.ok((s.made.flour ?? 0) >= 2, `flour ${s.made.flour}`);
  assert.equal(a.store!.wheat ?? 0, 0);
  assert.ok(b.store!.flour! >= 2);
});

test('a silo doesn\'t sell or feed goods another silo\'s drone is on its way to fetch', () => {
  const s = flat();
  const d = s.map.depot;
  powerAt(s, d.x - 7, d.y - 3);
  powerAt(s, 1, 1);
  // Built first, so its drones choose first: it reserves the wheat before the other silo looks for something to sell.
  const b = put(s, 'silo', 2, 4);
  const a = put(s, 'silo', d.x - 4, d.y - 2);   // by the depot, selling wheat
  put(s, 'mill', 4, 4);
  setSell(depotOf(s), 'wheat', 'spare');
  a.store!.wheat = 4;
  advance(s, 0.1);
  assert.ok(b.drones!.some((x) => x.task?.kind === 'fetch'), 'b fetches');
  advance(s, 20);
  assert.equal(s.delivered.wheat ?? 0, 0, 'a kept the wheat for b');
  assert.ok((s.made.flour ?? 0) + (s.buildings.find((x) => x.type === 'mill')!.inputs!.wheat ?? 0) >= 2);
});

test('a silo fetching a good sold by half keeps feeding it, even when its turn is the depot\'s', () => {
  const s = flat();
  powerAt(s, 2, 2);
  put(s, 'pylon', 7, 3); put(s, 'pylon', 2, 10); put(s, 'pylon', 2, 17);
  const a = put(s, 'silo', 4, 4), src = put(s, 'silo', 4, 19);
  const mill = put(s, 'mill', 8, 4);
  setSell(depotOf(s), 'wheat', 'half');
  a.shared!.wheat = 2;                                // ahead on feeding, with nothing left to sell
  src.store!.wheat = 14;
  advance(s, 60);
  // The source silo sells its own wheat too (it is sold by half and nothing there uses it), so not all of it comes here.
  assert.ok((s.made.flour ?? 0) >= 1, `flour ${s.made.flour}; mill ${JSON.stringify(mill.inputs)}`);
  assert.equal(a.shared!.wheat, 0, 'the turns evened out');
});

test('a building that refuses a good isn\'t fed it; another one gets it', () => {
  const s = flat();
  powerAt(s, 2, 2);
  const silo = put(s, 'silo', 4, 4);
  const coop = put(s, 'coop', 7, 4);       // nearer than the digester
  const dig = put(s, 'digester', 11, 4);
  assert.ok(setAccept(coop, 'bran', false).ok);
  silo.store!.bran = 4;
  advance(s, 15);
  assert.equal(coop.inputs!.bran ?? 0, 0);
  assert.ok((dig.inputs!.bran ?? 0) + (dig.progress !== null ? 1 : 0) >= 1);
  assert.equal(setAccept(coop, 'egg', false).ok, false, 'not one of its inputs');
});

test('a drone whose target goes flies home with its cargo', () => {
  const s = flat();
  powerAt(s, 2, 2);
  const silo = put(s, 'silo', 4, 4);
  const mill = put(s, 'mill', 9, 4);
  silo.store!.wheat = 4;
  advance(s, 1.5);
  const d = silo.drones!.find((x) => x.task)!;
  assert.equal(d.task!.kind, 'feed');
  remove(s, mill);
  advance(s, 10);
  assert.ok(silo.drones!.every((x) => x.phase === 'idle'));
  assert.equal(silo.store!.wheat, 4);
});

test('the depot starts selling the products, and half of what else the commission asks for', () => {
  const s = flat({ goals: [{ kind: 'deliver', item: 'flour', n: 5 }, { kind: 'deliver', item: 'bread', n: 5 }, { kind: 'soil', min: 40 }] });
  assert.deepEqual(depotOf(s).sell, { bread: 'spare', honeycake: 'spare', sauce: 'spare', linen: 'spare', flour: 'half' });
  assert.equal(setSell(depotOf(s), 'flour', 'half').ok, false, 'already so');
  assert.ok(setSell(depotOf(s), 'flour', null).ok);
  assert.equal(depotOf(s).sell!.flour, undefined);
});

/** A silo beside the depot holding `n` wheat, with a powered mill it serves, and wheat sold as `mode`. */
function wheatAndMill(mode: 'spare' | 'half', n: number) {
  const s = flat();
  const d = s.map.depot;
  powerAt(s, d.x - 9, d.y - 2);
  put(s, 'pylon', d.x - 5, d.y - 3);
  const silo = put(s, 'silo', d.x - 4, d.y - 2);
  const mill = put(s, 'mill', d.x - 7, d.y - 4);
  setSell(depotOf(s), 'wheat', mode);
  silo.store!.wheat = n;
  return { s, silo, mill };
}

test('a good sold when spare goes to buildings first; sold by half, the silo shares it', () => {
  const spare = wheatAndMill('spare', 20);
  advance(spare.s, 60);
  assert.equal(spare.s.delivered.wheat ?? 0, 20 - 2 * (spare.s.made.flour ?? 0) - (spare.mill.inputs!.wheat ?? 0) - (spare.mill.progress !== null ? 2 : 0));
  assert.ok((spare.s.made.flour ?? 0) >= 4, 'the mill got wheat first');
  const half = wheatAndMill('half', 20);
  advance(half.s, 60);
  const sold = half.s.delivered.wheat ?? 0;
  assert.ok(sold >= 6 && sold <= 14, `sold ${sold} of 20`);
});

test('a powered mill turns wheat into flour and bran', () => {
  const s = flat();
  powerAt(s, 2, 2);
  const mill = put(s, 'mill', 5, 2);
  mill.inputs!.wheat = 6;
  advance(s, 0.2);
  assert.notEqual(mill.progress, null, 'started');
  advance(s, 7);
  assert.ok((s.made.flour ?? 0) >= 1);
  assert.ok((s.made.bran ?? 0) >= 1);
});

test('an unpowered machine does not run; a pylon out of reach does not power it', () => {
  const s = flat();
  const mill = put(s, 'mill', 10, 10);
  mill.inputs!.wheat = 2;
  advance(s, 2);
  assert.equal(mill.status, 'power');
  powerAt(s, 2, 2);
  assert.equal(networkOf(s, mill), null);
  put(s, 'pylon', 7, 8);       // links to the first (within 8) and reaches the mill (within 3)
  assert.equal(networks(s).list.length, 1);
  assert.ok(networkOf(s, mill));
  advance(s, 1);
  assert.notEqual(mill.status, 'power');
});

test('power shortfall slows machines to the share they get; batteries charge from surplus', () => {
  const s = flat();
  put(s, 'pylon', 5, 5);
  const bat = put(s, 'battery', 6, 5);
  const t = put(s, 'turbine', 4, 5);
  const loom = put(s, 'loom', 5, 7);
  loom.inputs!.yarn = 9;
  s.scenario = { ...s.scenario, weather: { ...s.scenario.weather, wind: 0.2, gust: 0, sun: 0 } };
  advance(s, 1);
  const net = networkOf(s, loom)!;
  assert.ok(net.made < net.wanted);
  assert.ok(net.share < 1 && net.share > 0, `share ${net.share}`);
  assert.equal(loom.status, 'lowpower');
  remove(s, loom);
  advance(s, 5);
  assert.ok(bat.charge! > 0, 'surplus charges the battery');
  assert.ok(t);
});

test('fields grow, harvest, drain the soil, and take compost', () => {
  const s = flat();
  const f = put(s, 'field', 4, 4);
  const fert = fieldFertility(s, f);
  // No water: slow. 40 s × 1/0.4 = 100 s for wheat at fertility 60.
  advance(s, 101);
  assert.equal(s.made.wheat, 3);
  assert.ok(fieldFertility(s, f) < fert);
  // Compost restores.
  f.compost = 1;
  advance(s, 0.2);
  assert.equal(f.compost, 0);
  assert.ok(fieldFertility(s, f) > fert);
});

test('sprinklers water fields and speed them up', () => {
  const dry = flat(), wet = flat();
  for (const s of [dry, wet]) put(s, 'field', 4, 4);
  put(wet, 'sprinkler', 3, 3);
  powerAt(wet, 3, 1);
  advance(dry, 60); advance(wet, 60);
  assert.equal(dry.made.wheat ?? 0, 0);
  assert.equal(wet.made.wheat, 3);
});

test('coops lay eggs from feed; composters make compost', () => {
  const s = flat();
  const coop = put(s, 'coop', 2, 2);
  coop.inputs!.bran = 2;
  const comp = put(s, 'composter', 10, 2);
  comp.inputs!.manure = 1; comp.inputs!.seedcake = 1;
  advance(s, 21);
  assert.equal(coop.outputs!.egg, 2);
  assert.equal(coop.outputs!.manure, 1);
  assert.equal(comp.outputs!.compost, 1);
});

test('hives need flowering fields near them and pollinate them', () => {
  const s = flat();
  const hive = put(s, 'hive', 10, 10);
  advance(s, 1);
  assert.equal(hive.status, 'flowers');
  const f = put(s, 'field', 12, 10);
  f.crop = 'beans';
  advance(s, 50);
  assert.ok(hive.stored! >= 1);
});

test('the commission completes when every goal is met, with a medal by time', () => {
  const s = flat({ goals: [{ kind: 'deliver', item: 'bread', n: 2 }, { kind: 'soil', min: 40 }], par: 100 });
  s.reached = [false, false];
  deliver(s, 'bread');
  advance(s, 1);
  assert.equal(goalDone(s, 0), false);
  deliver(s, 'bread');
  advance(s, 1);
  assert.ok(goalDone(s, 0));
  assert.ok(goalDone(s, 1), `soil ${soilHealth(s)}`);
  assert.ok(s.completedAt !== null);
  assert.equal(medalFor(100, 90), 'gold');
  assert.equal(medalFor(100, 140), 'silver');
  assert.equal(medalFor(100, 160), 'bronze');
});

test('saves round-trip, and progress keeps the best result', () => {
  const s = flat();
  put(s, 'mill', 4, 4);
  advance(s, 3);
  const back = deserialize(serialize(s))!;
  assert.ok(back);
  assert.equal(back.buildings.length, s.buildings.length);
  assert.equal(buildingAt(back, 5, 5)?.type, 'mill');
  assert.equal(deserialize('{"version":1}'), null);
  assert.equal(deserialize('nonsense'), null);
  let p = readProgress(null);
  p = recordResult(p, 'c1', 'silver', 900);
  p = recordResult(p, 'c1', 'bronze', 500);
  assert.equal(p.c1.medal, 'silver');
  p = recordResult(p, 'c1', 'silver', 800);
  assert.equal(p.c1.time, 800);
});

test('saves with missing state are refused', () => {
  const s = flat();
  const silo = put(s, 'silo', 6, 6);
  silo.drones![0] = { phase: 'out', t: 0.5, energy: 0, task: { kind: 'sell', target: 1, tx: 3, ty: 3, item: 'egg', n: 0 }, cargo: ['egg'] };
  const json = JSON.parse(serialize(s));
  const without = (f: (o: any) => void) => { const o = structuredClone(json); f(o); return deserialize(JSON.stringify(o)); };
  const siloOf = (o: any) => o.buildings.find((b: any) => b.type === 'silo');
  assert.ok(without(() => {}));
  assert.equal(without((o) => { delete siloOf(o).drones; }), null);
  assert.equal(without((o) => { delete o.carry; }), null);
  assert.equal(without((o) => { siloOf(o).drones[0].task = null; }), null, 'a flying drone has a task');
  assert.equal(without((o) => { o.buildings[0].type = 'castle'; }), null);
  assert.equal(without((o) => { siloOf(o).store.gold = 1; }), null);
  assert.equal(without((o) => { delete o.buildings.find((b: any) => b.type === 'depot').sell; }), null);
  assert.equal(without((o) => { o.buildings.find((b: any) => b.type === 'depot').sell = []; }), null);
  assert.equal(without((o) => { siloOf(o).store = []; }), null);
  assert.equal(without((o) => { siloOf(o).store.wheat = 0.5; }), null);
  assert.equal(without((o) => { o.version = 1; }), null, 'saves from before silos are refused');
  assert.equal(without((o) => { siloOf(o).drones[0].task.kind = 'fetch'; }), null, 'a fetch flies to a silo, not the depot');
  assert.equal(without((o) => { delete o.soilBase; }), null);
  assert.equal(without((o) => { delete o.scenario.tags; }), null);
  assert.equal(without((o) => { delete o.scenario.weather.wind; }), null);
  const f = flat();
  put(f, 'field', 4, 4); put(f, 'mill', 10, 10);
  const fj = JSON.parse(serialize(f));
  assert.ok(deserialize(JSON.stringify(fj)));
  assert.equal(deserialize(JSON.stringify({ ...fj, buildings: fj.buildings.map((b: any) => (b.type === 'field' ? { ...b, crop: 'not-a-crop' } : b)) })), null);
  assert.equal(deserialize(JSON.stringify({ ...fj, buildings: fj.buildings.map((b: any) => (b.type === 'mill' ? { ...b, recipe: 'bread' } : b)) })), null);
});

test('removing a building twice refunds it once', () => {
  const s = flat();
  const f = put(s, 'field', 4, 4), credits = s.credits;
  assert.ok(remove(s, f).ok);
  assert.equal(remove(s, f).ok, false);
  assert.equal(s.credits, credits + BUILDINGS.field.cost);
});

test('a field keeps the kind of its harvest when its crop changes', () => {
  const s = flat();
  const f = put(s, 'field', 4, 4);
  f.stored = 3; f.harvest = 'wheat';
  setCrop(f, 'tomato');
  powerAt(s, 8, 1);
  const silo = put(s, 'silo', 8, 4);
  advance(s, 10);
  assert.deepEqual(silo.store, { wheat: 3 });
  assert.equal(f.stored, 0);
  assert.equal(f.harvest, 'tomato');
});

test('rate goals count every delivery in the last minute, and only those', () => {
  const s = flat({ goals: [{ kind: 'rate', item: 'yarn', perMin: 6 }] });
  s.reached = [false];
  advance(s, 1);
  for (let i = 0; i < 6; i++) { deliver(s, 'yarn'); advance(s, 0.1); }
  advance(s, 60 - s.time + 0.05);
  assert.ok(ratePerMin(s, 'yarn', 'delivered') >= 6, `rate ${ratePerMin(s, 'yarn', 'delivered')}`);
  assert.ok(s.reached[0]);
  advance(s, 15);
  assert.ok(ratePerMin(s, 'yarn', 'delivered') < 6);
});

test('a tall building shelters a turbine once, however many tiles it has', () => {
  const s = flat();
  const t = put(s, 'turbine', 10, 10);
  put(s, 'mill', 11, 10);
  assert.equal(exposureOf(s, t), 1 - POWER.shelter);
});

test('ground without a field rests back towards its starting fertility', () => {
  const s = flat();
  const f = put(s, 'field', 4, 4);
  for (let i = 0; i < s.map.fertility.length; i++) s.map.fertility[i] = 10;
  advance(s, 100);
  assert.equal(fieldFertility(s, f), 10, 'under a field: no rest');
  assert.ok(Math.abs(s.map.fertility[0] - 20) < 0.5, `resting: ${s.map.fertility[0]}`);
  advance(s, 1000);
  assert.equal(s.map.fertility[0], 60, 'not past where it started');
});

test('changing a recipe waits for the batch in progress', () => {
  const s = flat();
  powerAt(s, 1, 1);
  const k = put(s, 'bakery', 2, 3);
  k.inputs = { flour: 1, egg: 1 };
  advance(s, 1);
  assert.notEqual(k.progress, null);
  assert.equal(setRecipe(k, 'honeycake').ok, false);
  assert.equal(k.recipe, 'bread');
  advance(s, 9);
  assert.equal(k.outputs!.bread, 1);
  assert.ok(setRecipe(k, 'honeycake').ok);
});

test('a rate goal is not met by deliveries more than a minute apart', () => {
  const s = flat({ goals: [{ kind: 'rate', item: 'yarn', perMin: 5 }] });
  s.reached = [false];
  advance(s, 60.1);
  for (let i = 0; i < 4; i++) { deliver(s, 'yarn'); advance(s, 0.1); }
  advance(s, 121 - s.time);
  for (let i = 0; i < 2; i++) { deliver(s, 'yarn'); advance(s, 0.1); }
  advance(s, 0.2);
  assert.equal(ratePerMin(s, 'yarn', 'delivered'), 2);
  assert.equal(s.reached[0], false);
});

test('random commissions have two to four goals', () => {
  for (let seed = 1; seed < 200; seed++) for (const d of [1, 2, 3] as const) {
    const n = randomScenario(seed, d).goals.length;
    assert.ok(n >= 2 && n <= 4, `seed ${seed} difficulty ${d}: ${n}`);
  }
});

