import assert from 'node:assert/strict';
import { test } from 'node:test';
import { beltPath, canPlace, linkPad, place, remove, removeAt, setCrop, setFilter, setPadMode, setRecipe } from '../src/game/build.ts';
import { BELT, BUILDINGS, DAY_SECONDS, ITEMS, POWER, START_HOUR } from '../src/game/data.ts';
import { generateMap, TERRAIN } from '../src/game/map.ts';
import { networkOf, networks } from '../src/game/power.ts';
import { deserialize, readProgress, recordResult, serialize } from '../src/game/save.ts';
import { CAMPAIGN, randomScenario, SANDBOX, scenarioById, type Scenario } from '../src/game/scenarios.ts';
import { advance, exposureOf, fieldFertility, goalDone, hourAt, medalFor, ratePerMin, soilHealth, sunAt, windAt } from '../src/game/sim.ts';
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

/** A line of belts from (x0, y) eastwards, n long. */
function beltEast(s: GameState, x0: number, y: number, n: number) {
  for (let i = 0; i < n; i++) put(s, 'belt', x0 + i, y, 1);
}

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
  assert.equal(canPlace(s, 'belt', 6, 6).ok, false);
  assert.equal(buildingAt(s, 6, 6), mill);
  s.map.terrain[2 * 30 + 2] = TERRAIN.rock;
  assert.equal(canPlace(s, 'belt', 2, 2).ok, false);
  assert.ok(removeAt(s, 2, 2).ok);
  assert.equal(canPlace(s, 'belt', 2, 2).ok, true);
  s.map.terrain[3 * 30 + 3] = TERRAIN.water;
  assert.equal(canPlace(s, 'mill', 2, 3).ok, false);
  assert.equal(canPlace(s, 'belt', 3, 3).ok, true, 'belts bridge water');
  remove(s, mill);
  assert.equal(s.credits, before - 15);
  assert.equal(buildingAt(s, 6, 6), null);
  s.credits = 1;
  assert.equal(canPlace(s, 'mill', 5, 5).ok, false);
});

test('a belt path runs along x then y, each belt pointing the way the line goes', () => {
  assert.deepEqual(beltPath({ x: 1, y: 1 }, { x: 3, y: 2 }, 0).map((p) => [p.x, p.y, p.rot]), [[1, 1, 1], [2, 1, 1], [3, 1, 2], [3, 2, 2]]);
  assert.deepEqual(beltPath({ x: 4, y: 4 }, { x: 4, y: 4 }, 3), [{ x: 4, y: 4, rot: 3 }]);
});

test('goods travel along belts at belt speed and into the depot, which pays for them', () => {
  const s = flat();
  const d = s.map.depot;
  // A belt line ending in the depot's west side.
  for (let x = d.x - 5; x < d.x; x++) put(s, 'belt', x, d.y + 1, 1);
  const first = buildingAt(s, d.x - 5, d.y + 1)!;
  first.items!.push({ item: 'bread', pos: 0 });
  const credits = s.credits;
  advance(s, 5 / BELT.speed + 0.5);
  assert.equal(s.delivered.bread, 1);
  assert.equal(s.credits, credits + ITEMS.bread.price);
});

test('a belt keeps its goods apart and stops when the end is blocked', () => {
  const s = flat();
  beltEast(s, 2, 2, 3);
  const b0 = buildingAt(s, 2, 2)!;
  // Feed one good each step for a while; the last belt leads nowhere.
  for (let i = 0; i < 100; i++) { if (!b0.items!.length || b0.items![b0.items!.length - 1].pos >= BELT.spacing) b0.items!.push({ item: 'wheat', pos: 0 }); advance(s, 0.1); }
  const all = [0, 1, 2].flatMap((i) => buildingAt(s, 2 + i, 2)!.items!);
  assert.ok(all.length >= 3 / BELT.spacing && all.length <= 3 / BELT.spacing + 1, `full: ${all.length}`);
  for (const b of [0, 1, 2].map((i) => buildingAt(s, 2 + i, 2)!)) {
    const items = b.items!;
    for (let i = 1; i < items.length; i++) assert.ok(items[i - 1].pos - items[i].pos >= BELT.spacing - 1e-9);
  }
});

test('a powered mill turns wheat into flour and bran; with nowhere for bran to go it stalls', () => {
  const s = flat();
  powerAt(s, 2, 2);
  const mill = put(s, 'mill', 5, 2);
  put(s, 'belt', 7, 2, 1);      // leads away east: an output
  put(s, 'belt', 8, 2, 1);
  mill.inputs!.wheat = 6;
  advance(s, 0.2);
  assert.notEqual(mill.progress, null, 'started');
  advance(s, 7);
  assert.ok((s.made.flour ?? 0) >= 1);
  assert.ok((s.made.bran ?? 0) >= 1);
  // The output belt leads nowhere, so goods back up and the mill ends up blocked.
  advance(s, 60);
  assert.equal(mill.status, 'input');
  mill.inputs!.wheat = 6;
  advance(s, 60);
  assert.equal(mill.status, 'blocked');
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

test('fields grow, harvest onto belts, drain the soil, and take compost', () => {
  const s = flat();
  const f = put(s, 'field', 4, 4);
  put(s, 'belt', 7, 5, 1);
  put(s, 'belt', 8, 5, 1);
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
  for (const s of [dry, wet]) { put(s, 'field', 4, 4); put(s, 'belt', 7, 5, 1); put(s, 'belt', 8, 5, 1); }
  put(wet, 'sprinkler', 3, 3);
  powerAt(wet, 3, 1);
  advance(dry, 60); advance(wet, 60);
  assert.equal(dry.made.wheat ?? 0, 0);
  assert.equal(wet.made.wheat, 3);
});

test('splitters share goods between belts; sorters send the chosen good straight on', () => {
  const s = flat();
  put(s, 'belt', 2, 5, 1);
  put(s, 'splitter', 3, 5);
  put(s, 'belt', 3, 4, 0); put(s, 'belt', 4, 5, 1); put(s, 'belt', 3, 6, 2);
  const src = buildingAt(s, 2, 5)!;
  for (let i = 0; i < 6; i++) { src.items!.push({ item: 'wheat', pos: 0 }); advance(s, 1); }
  advance(s, 2);
  const n = (x: number, y: number) => buildingAt(s, x, y)!.items!.length;
  assert.deepEqual([n(3, 4), n(4, 5), n(3, 6)], [2, 2, 2]);

  const t = flat();
  put(t, 'belt', 2, 5, 1);
  const sorter = put(t, 'sorter', 3, 5, 1);
  setFilter(sorter, 'egg');
  put(t, 'belt', 4, 5, 1); put(t, 'belt', 3, 4, 0); put(t, 'belt', 3, 6, 2);
  const src2 = buildingAt(t, 2, 5)!;
  for (const item of ['egg', 'bran', 'egg', 'bran'] as const) { src2.items!.push({ item, pos: 0 }); advance(t, 1); }
  advance(t, 2);
  const items = (x: number, y: number) => buildingAt(t, x, y)!.items!.map((i) => i.item);
  assert.deepEqual(items(4, 5), ['egg', 'egg']);
  assert.deepEqual([...items(3, 4), ...items(3, 6)].sort(), ['bran', 'bran']);
});

test('crossings let two lines cross without mixing', () => {
  const s = flat();
  put(s, 'belt', 2, 5, 1); put(s, 'crossing', 3, 5); put(s, 'belt', 4, 5, 1);
  put(s, 'belt', 3, 4, 2); put(s, 'belt', 3, 6, 2);
  buildingAt(s, 2, 5)!.items!.push({ item: 'egg', pos: 0 });
  buildingAt(s, 3, 4)!.items!.push({ item: 'flax', pos: 0 });
  advance(s, 3);
  assert.deepEqual(buildingAt(s, 4, 5)!.items!.map((i) => i.item), ['egg']);
  assert.deepEqual(buildingAt(s, 3, 6)!.items!.map((i) => i.item), ['flax']);
});

test('drone pads fly goods to a linked pad, using power while in flight', () => {
  const s = flat();
  powerAt(s, 1, 1);
  const a = put(s, 'pad', 2, 3);
  const b = put(s, 'pad', 20, 3);
  setPadMode(b, 'receive');
  assert.equal(linkPad(s, b, a).ok, false, 'a receiving pad does not send');
  assert.ok(linkPad(s, a, b).ok);
  a.store!.push('egg', 'egg', 'egg', 'egg', 'egg');
  advance(s, 0.2);
  assert.equal(a.drone!.phase, 'out');
  advance(s, 10);
  assert.equal(b.store!.length, 5);
  // Unpowered, the receiving pad still works (it needs no power to land on).
  assert.equal(networkOf(s, b), null);
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
  const d = s.map.depot;
  put(s, 'belt', d.x - 1, d.y + 1, 1);
  const b = buildingAt(s, d.x - 1, d.y + 1)!;
  b.items!.push({ item: 'bread', pos: 0.9 });
  advance(s, 1);
  assert.equal(goalDone(s, 0), false);
  b.items!.push({ item: 'bread', pos: 0.9 });
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
  put(s, 'belt', 3, 3, 1);
  put(s, 'pad', 6, 6);
  const json = JSON.parse(serialize(s));
  const without = (f: (o: any) => void) => { const o = structuredClone(json); f(o); return deserialize(JSON.stringify(o)); };
  assert.ok(without(() => {}));
  assert.equal(without((o) => { delete o.buildings.find((b: any) => b.type === 'belt').items; }), null);
  assert.equal(without((o) => { delete o.carry; }), null);
  assert.equal(without((o) => { delete o.buildings.find((b: any) => b.type === 'pad').drone; }), null);
  assert.equal(without((o) => { o.buildings[0].type = 'castle'; }), null);
  assert.equal(without((o) => { o.buildings.find((b: any) => b.type === 'belt').items.push({ item: 'gold', pos: 0 }); }), null);
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
  put(s, 'belt', 7, 5, 1); put(s, 'belt', 8, 5, 1); put(s, 'belt', 9, 5, 1);
  advance(s, 1);
  const items = [7, 8, 9].flatMap((x) => buildingAt(s, x, 5)!.items!.map((i) => i.item));
  assert.ok(items.length > 0 && items.every((i) => i === 'wheat'), items.join());
  advance(s, 10);
  assert.equal(f.stored, 0);
  assert.equal(f.harvest, 'tomato');
});

test('a pad cannot switch to receiving while its drone is out', () => {
  const s = flat();
  powerAt(s, 1, 1);
  const a = put(s, 'pad', 2, 3), b = put(s, 'pad', 12, 3);
  setPadMode(b, 'receive'); linkPad(s, a, b);
  a.store!.push('egg', 'egg', 'egg', 'egg', 'egg');
  advance(s, 0.5);
  assert.equal(a.drone!.phase, 'out');
  assert.equal(setPadMode(a, 'receive').ok, false);
  advance(s, 10);
  assert.equal(b.store!.length, 5);
});

test('rate goals count every delivery in the last minute, and only those', () => {
  const s = flat({ goals: [{ kind: 'rate', item: 'yarn', perMin: 6 }] });
  s.reached = [false];
  const d = s.map.depot;
  const belt = put(s, 'belt', d.x - 1, d.y + 1, 1);
  advance(s, 1);
  for (let i = 0; i < 6; i++) { belt.items!.push({ item: 'yarn', pos: 1 }); advance(s, 0.1); }
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

test('a drone whose destination goes brings its cargo home', () => {
  const s = flat();
  powerAt(s, 1, 1);
  const a = put(s, 'pad', 2, 3), b = put(s, 'pad', 20, 3);
  setPadMode(b, 'receive'); linkPad(s, a, b);
  a.store!.push('egg', 'egg', 'egg', 'egg', 'egg');
  advance(s, 1);
  assert.equal(a.drone!.phase, 'out');
  remove(s, b);
  advance(s, 10);
  assert.equal(a.drone!.phase, 'home');
  assert.deepEqual(a.store, ['egg', 'egg', 'egg', 'egg', 'egg']);
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

test('a splitter fed from two sides still shares between both exits', () => {
  const s = flat();
  // Inputs from the west and the north; exits east and south.
  put(s, 'belt', 2, 5, 1); put(s, 'belt', 3, 4, 2);
  put(s, 'splitter', 3, 5);
  put(s, 'belt', 4, 5, 1); put(s, 'belt', 5, 5, 1); put(s, 'belt', 3, 6, 2); put(s, 'belt', 3, 7, 2);
  for (let i = 0; i < 4; i++) {
    buildingAt(s, 2, 5)!.items!.push({ item: 'egg', pos: 0.9 });
    buildingAt(s, 3, 4)!.items!.push({ item: 'egg', pos: 0.9 });
    advance(s, 1.5);
  }
  advance(s, 1);
  const east = [4, 5].reduce((n, x) => n + buildingAt(s, x, 5)!.items!.length, 0), south = [6, 7].reduce((n, y) => n + buildingAt(s, 3, y)!.items!.length, 0);
  assert.equal(east + south, 8);
  assert.ok(east >= 3 && south >= 3, `east ${east}, south ${south}`);
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

test('a drone takes its goods home if its target stops receiving', () => {
  const s = flat();
  powerAt(s, 1, 1);
  const a = put(s, 'pad', 2, 3), b = put(s, 'pad', 20, 3);
  setPadMode(b, 'receive'); linkPad(s, a, b);
  a.store!.push('egg', 'egg', 'egg', 'egg', 'egg');
  advance(s, 1);
  setPadMode(b, 'send');
  advance(s, 12);
  assert.equal(b.store!.length, 0);
  assert.equal(a.drone!.phase, 'home');
  assert.equal(a.store!.length, 5);
});

test('sorters share the other goods between both sides, whichever way they face', () => {
  for (const rot of [0, 1, 2, 3] as Dir[]) {
    const s = flat();
    const back = (rot + 2) % 4, L = (rot + 3) % 4, R = (rot + 1) % 4;
    const DXs = [0, 1, 0, -1], DYs = [-1, 0, 1, 0], cx = 10, cy = 10;
    put(s, 'belt', cx + DXs[back], cy + DYs[back], rot);
    const sorter = put(s, 'sorter', cx, cy, rot);
    setFilter(sorter, 'egg');
    put(s, 'belt', cx + DXs[L], cy + DYs[L], L as Dir); put(s, 'belt', cx + 2 * DXs[L], cy + 2 * DYs[L], L as Dir);
    put(s, 'belt', cx + DXs[R], cy + DYs[R], R as Dir); put(s, 'belt', cx + 2 * DXs[R], cy + 2 * DYs[R], R as Dir);
    const src = buildingAt(s, cx + DXs[back], cy + DYs[back])!;
    for (let i = 0; i < 4; i++) { src.items!.push({ item: 'bran', pos: 0.9 }); advance(s, 1); }
    const n = (d: number) => buildingAt(s, cx + DXs[d], cy + DYs[d])!.items!.length + buildingAt(s, cx + 2 * DXs[d], cy + 2 * DYs[d])!.items!.length;
    assert.deepEqual([n(L), n(R)], [2, 2], `facing ${rot}`);
  }
});

test('goods take as long along a belt line whichever order it was built in', () => {
  const times = [false, true].map((reverse) => {
    const s = flat();
    const d = s.map.depot;
    const xs = Array.from({ length: 12 }, (_, i) => d.x - 12 + i);
    for (const x of reverse ? [...xs].reverse() : xs) put(s, 'belt', x, d.y + 1, 1);
    buildingAt(s, xs[0], d.y + 1)!.items!.push({ item: 'egg', pos: 0 });
    let t = 0;
    while (!s.delivered.egg && t < 60) { advance(s, 0.1); t += 0.1; }
    return Math.round(t * 10);
  });
  assert.equal(times[0], times[1]);
});

test('a rate goal is not met by deliveries more than a minute apart', () => {
  const s = flat({ goals: [{ kind: 'rate', item: 'yarn', perMin: 5 }] });
  s.reached = [false];
  const d = s.map.depot;
  const belt = put(s, 'belt', d.x - 1, d.y + 1, 1);
  advance(s, 60.1);
  for (let i = 0; i < 4; i++) { belt.items!.push({ item: 'yarn', pos: 1 }); advance(s, 0.1); }
  advance(s, 121 - s.time);
  for (let i = 0; i < 2; i++) { belt.items!.push({ item: 'yarn', pos: 1 }); advance(s, 0.1); }
  advance(s, 0.2);
  assert.equal(ratePerMin(s, 'yarn', 'delivered'), 2);
  assert.equal(s.reached[0], false);
});

test('goods take as long through a row of splitters whichever order it was built in', () => {
  const times = [false, true].map((reverse) => {
    const s = flat();
    const xs = Array.from({ length: 6 }, (_, i) => 4 + i);
    put(s, 'belt', 3, 5, 1);
    for (const x of reverse ? [...xs].reverse() : xs) put(s, 'splitter', x, 5);
    put(s, 'belt', 10, 5, 1); put(s, 'belt', 11, 5, 1);
    buildingAt(s, 3, 5)!.items!.push({ item: 'egg', pos: 1 });
    let t = 0;
    while (!buildingAt(s, 10, 5)!.items!.length && t < 30) { advance(s, 0.1); t += 0.1; }
    return Math.round(t * 10);
  });
  assert.equal(times[0], times[1]);
});
