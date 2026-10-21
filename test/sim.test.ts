import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addStop, buyTruck, canPlace, copyRoute, deleteRoute, dumpCargo, moveStop, newRoute, place, remove, removeAt, removeStop, renameRoute, ROUTE_NAME_MAX,
  sellTruck, setCrop, setRecipe,
  setStopGood, setStopWait, setTruckRoute, truckPrice,
} from '../src/game/build.ts';
import { BUILDINGS, DAY_SECONDS, ITEMS, POWER, SILO, START_HOUR, TICK, TRUCK, type BuildingId, type ItemId } from '../src/game/data.ts';
import { generateMap, TERRAIN } from '../src/game/map.ts';
import { feederOf, networkOf, networks, pylonsInLink, wiresOf } from '../src/game/power.ts';
import { runtimeOf } from '../src/game/runtime.ts';
import { deserialize, readProgress, recordResult, serialize } from '../src/game/save.ts';
import { CAMPAIGN, randomScenario, SANDBOX, sandboxIn, scenarioById, tagsOf, type Scenario } from '../src/game/scenarios.ts';
import { CHARACTERS, charactersOf, climateOf, SEASON_IDS, SEASONS, seasonName } from '../src/game/seasons.ts';
import { accessTiles, distanceTo, isOpen, pathTo } from '../src/game/roads.ts';
import { hourAt, sunAt, windAt } from '../src/game/sim/clock.ts';
import { exposureOf } from '../src/game/sim/layout.ts';
import { fieldFertility, soilHealth } from '../src/game/sim/soil.ts';
import { deliver, linksAt, linksOf, passes, tradesNextDoor } from '../src/game/sim/goods.ts';
import { goalDone, medalFor, ratePerMin, routeRate } from '../src/game/sim/stats.ts';
import { describeLinks, describeStatus, stopProblems, truckProblems } from '../src/game/sim/describe.ts';
import { advance } from '../src/game/sim/step.ts';
import { lastPose } from '../src/game/sim/trucks.ts';
import { fieldPace } from '../src/game/sim/buildings.ts';
import { buildingAt, newGame, type Building, type BuildingOf, type Dir, type MachineBuilding, type GameState, type Route, type Truck } from '../src/game/state.ts';

/** A flat, empty test map: no water, rock or trees, even soil. */
function flat(extra: Partial<Scenario> = {}): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 }, ...extra,
  };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  return s;
}

/** A save read back, or null if it's refused. */
const load = (json: string) => { const r = deserialize(json); return r.ok ? r.value : null; };

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number, rot: Dir = 0): BuildingOf<K> {
  const r = place(s, type, x, y, rot);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
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

test('seasons: characters shift their season, names read right, the sandbox takes any season', () => {
  assert.deepEqual(climateOf('winter'), { season: 'winter', character: null, ...SEASONS.winter.levers });
  const gales = climateOf('autumn', 'gales');
  assert.ok(gales.wind.mean > SEASONS.autumn.levers.wind.mean);
  assert.deepEqual(gales.sun, SEASONS.autumn.levers.sun, 'gales move only the wind');
  assert.throws(() => climateOf('summer', 'hard'), /no hard summer/);
  assert.equal(seasonName(climateOf('spring', 'wet')), 'A wet spring');
  assert.equal(seasonName(climateOf('autumn', 'gales')), 'Autumn, gales');
  assert.equal(seasonName(climateOf('winter')), 'Winter');
  assert.deepEqual(tagsOf(CAMPAIGN[4]).slice(0, 3), ['Winter', 'Short days', 'Weak sun']);
  for (const season of SEASON_IDS) for (const c of [null, ...charactersOf(season)]) {
    const sb = sandboxIn(season, c);
    assert.deepEqual(scenarioById(sb.id), sb, sb.id);
    assert.equal(sb.climate.season, season);
    assert.equal(sb.climate.character, c);
  }
  assert.equal(scenarioById('sandbox-summer-hard'), null);
  assert.equal(scenarioById('sandbox-monsoon'), null);
  // Random commissions roll every season, each with a character that fits it, the same every time.
  const seen = new Set<string>();
  for (let seed = 1; seed < 200; seed++) {
    const sc = randomScenario(seed, 2), c = sc.climate;
    assert.ok(c.character !== null && CHARACTERS[c.character].seasons.includes(c.season), sc.id);
    assert.deepEqual(randomScenario(seed, 2).climate, c);
    seen.add(c.season);
  }
  assert.equal(seen.size, 4);
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

/** A powered garage at (x, y) (a pylon and a charged battery to its east) with `n` trucks. */
function garageAt(s: GameState, x: number, y: number, n = 1, powered = true) {
  const g = put(s, 'garage', x, y);
  if (powered) powerAt(s, x + 2, y);
  const trucks = Array.from({ length: n }, () => { const r = buyTruck(s, g); if (!r.ok) assert.fail(r.error); return r.value.truck; });
  return { g, trucks };
}

type StopSpec = Building | [Building, { drop?: ItemId[]; pick?: ItemId[]; wait?: number }];
/** A route through `stops` (each with its defaults, or the goods and wait given), run by `trucks`. */
function route(s: GameState, trucks: Truck[], ...stops: StopSpec[]): Route {
  const r = newRoute(s);
  for (const spec of stops) {
    const [b, o] = Array.isArray(spec) ? spec : [spec, {}];
    assert.ok(addStop(s, r, b).ok);
    const st = r.stops[r.stops.length - 1];
    if (o.drop) st.drop = o.drop;
    if (o.pick) st.pick = o.pick;
    if (o.wait !== undefined) st.wait = o.wait;
  }
  for (const t of trucks) setTruckRoute(s, t, r);
  return r;
}

/** Steps the game 0.1 s at a time until `done` (or `seconds` pass); returns the time it took. */
function until(s: GameState, done: () => boolean, seconds = 120) {
  const start = s.time;
  while (!done()) {
    assert.ok(s.time - start < seconds, `not within ${seconds} s`);
    advance(s, 0.1);
  }
  return s.time - start;
}

const count = (cargo: ItemId[], item: ItemId) => cargo.filter((i) => i === item).length;
const tile = (x: number, y: number) => y * 30 + x;

test('trucks drive on open ground: round buildings, and past a diagonal only between open tiles', () => {
  const s = flat();
  const mill = put(s, 'mill', 20, 20);
  assert.equal(isOpen(s, 20, 20), false);
  assert.equal(isOpen(s, 19, 20), true);
  assert.equal(accessTiles(s, mill).length, 8, 'the tiles sharing an edge with it');
  // A diagonal line of pylons, corner to corner: trucks can't squeeze between two of them, so they go round its end.
  for (let i = 0; i < 10; i++) put(s, 'pylon', i, i);
  const silo = put(s, 'silo', 6, 1);
  const p = pathTo(s, silo, tile(1, 6))!;
  assert.ok(p, 'there is a way');
  assert.ok(p.some((i) => i % 30 >= 10 && Math.floor(i / 30) >= 10), 'round the end of the line');
  assert.ok(p.every((i) => isOpen(s, i % 30, Math.floor(i / 30))));
  assert.equal(distanceTo(s, silo, p[p.length - 1]), 0, 'it ends beside the silo');
  // Walled in: no open tile beside it.
  const boxed = put(s, 'silo', 24, 2);
  for (const [x, y] of [[24, 1], [25, 1], [26, 2], [26, 3], [24, 4], [25, 4], [23, 2], [23, 3]]) put(s, 'pylon', x, y);
  assert.equal(accessTiles(s, boxed).length, 0);
  assert.equal(pathTo(s, boxed, tile(20, 10)), null);
  advance(s, 0.1);
  assert.equal(boxed.status, 'noroad');
  assert.match(describeStatus(s, boxed), /trucks can't reach it/);
});

test('a truck on a route picks up a field\'s harvest and sells it at the depot', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const f = put(s, 'field', 8, 20);
  f.stored = 6; f.harvest = 'wheat';
  const r = route(s, [t], f, depotOf(s));
  const credits = s.credits;
  until(s, () => (s.delivered.wheat ?? 0) === 6);
  assert.equal(s.credits, credits + 6 * ITEMS.wheat.price);
  assert.equal(f.stored, 0);
  assert.ok(routeRate(s, r) > 0);
});

test('each step notes where every truck stood as it began, for the view to draw it between steps; one put down elsewhere jumps', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const f = put(s, 'field', 8, 20);
  f.stored = 6; f.harvest = 'wheat';
  route(s, [t], f, depotOf(s));
  assert.equal(lastPose(s, t), null, 'none before a step');
  let drove = false;
  for (let i = 0; i < 100; i++) {
    const before = { x: t.x, y: t.y, heading: t.heading }, jumps = lastPose(s, t)?.jumps ?? 0;
    advance(s, TICK);
    const p = lastPose(s, t);
    assert.ok(p);
    // A truck leaving its garage is put down at the side it leaves by, rather than driving there.
    if (p.jumps > jumps) { assert.deepEqual([p.x, p.y], [t.x, t.y]); continue; }
    assert.deepEqual({ x: p.x, y: p.y, heading: p.heading }, before);
    if (Math.hypot(t.x - p.x, t.y - p.y) > 0.1) drove = true;
  }
  assert.ok(drove, 'it drove');
  assert.ok((lastPose(s, t)?.jumps ?? 0) > 0, 'it left its garage');
});

test('a route takes wheat from a field to a mill, and the mill\'s flour and bran to the depot', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const f = put(s, 'field', 8, 18);
  f.stored = 6; f.harvest = 'wheat';
  const mill = put(s, 'mill', 12, 20);
  powerAt(s, 14, 21);
  const r = route(s, [t], f, mill, depotOf(s));
  assert.deepEqual(r.stops[1], { building: mill.id, drop: ['wheat'], pick: ['flour', 'bran'], wait: TRUCK.wait, turn: 0 }, 'a stop drops what it takes and picks up what it makes');
  until(s, () => (s.delivered.flour ?? 0) === 3 && (s.delivered.bran ?? 0) === 3, 200);
  assert.equal(s.made.flour, 3);
});

test('a building loads one truck at a time (the depot two); the others queue in turn', () => {
  const s = flat();
  const { trucks } = garageAt(s, 2, 24, 3);
  const silo = put(s, 'silo', 8, 18);
  silo.store.wheat = 30;
  route(s, trucks, [silo, { pick: ['wheat'], drop: [] }], depotOf(s));
  let atSilo = 0, atDepot = 0, queued = false;
  until(s, () => {
    const docked = (b: Building) => trucks.filter((t) => t.phase === 'dock' && t.target === b.id).length;
    atSilo = Math.max(atSilo, docked(silo)); atDepot = Math.max(atDepot, docked(depotOf(s)));
    queued ||= trucks.some((t) => t.phase === 'queue');
    return (s.delivered.wheat ?? 0) === 30;
  }, 200);
  assert.equal(atSilo, 1);
  assert.ok(atDepot <= 2);
  assert.ok(queued, 'trucks arriving together queue');
});

test('a truck with nothing to move gives the building to the truck queued behind it', () => {
  const s = flat();
  const { trucks: [a, b] } = garageAt(s, 2, 24, 2);
  const mill = put(s, 'mill', 8, 18);
  powerAt(s, 11, 18);
  mill.inputs = { wheat: 6 }; mill.outputs = { flour: 3, bran: 3 };
  const silo = put(s, 'silo', 20, 18);
  a.cargo = ['wheat', 'wheat'];
  // A waits up to a minute to drop wheat at the full mill; B comes to empty it.
  route(s, [a], [mill, { drop: ['wheat'], pick: [], wait: 60 }], silo);
  advance(s, 1);
  route(s, [b], [mill, { drop: [], pick: ['flour', 'bran'] }], depotOf(s));
  const took = until(s, () => (s.delivered.flour ?? 0) >= 3, 60);
  assert.ok(took < 25, `B was served after ${took.toFixed(1)} s`);
});

test('a truck waits at a stop up to its wait for goods; with a wait of 0 it goes on at once', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const f = put(s, 'field', 8, 18);
  const silo = put(s, 'silo', 14, 18);
  const r = route(s, [t], [f, { wait: 10 }], silo);
  const visit = () => {
    until(s, () => t.phase === 'dock' && t.target === f.id);
    return until(s, () => t.target !== f.id);
  };
  assert.ok(Math.abs(visit() - 10) < 0.3, 'waited for wheat');
  assert.ok(setStopWait(s, r, 0, 0).ok);
  assert.ok(visit() < 0.5, 'went on at once');
});

test('picking up several goods, a truck takes one of each in turn', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 8, 18);
  silo.store = { flour: 10, egg: 10 };
  route(s, [t], [silo, { pick: ['flour', 'egg'], drop: [] }], depotOf(s));
  until(s, () => t.phase === 'drive' && t.target === depotOf(s).id);
  assert.equal(count(t.cargo, 'flour'), 3);
  assert.equal(count(t.cargo, 'egg'), 3);
});

test('goods a building won\'t take stay aboard while the truck picks up into the room it has left', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const mill = put(s, 'mill', 8, 18);     // unpowered: it never makes room for wheat
  mill.inputs = { wheat: 6 }; mill.outputs = { flour: 3, bran: 3 };
  t.cargo = ['wheat', 'wheat', 'wheat'];
  route(s, [t], [mill, { wait: 2 }], [depotOf(s), { drop: ['flour', 'bran'] }]);
  until(s, () => t.phase === 'drive' && t.target === depotOf(s).id);
  assert.equal(t.cargo.length, TRUCK.cargo);
  assert.equal(count(t.cargo, 'wheat'), 3);
  until(s, () => (s.delivered.flour ?? 0) + (s.delivered.bran ?? 0) === 3);
  assert.equal(count(t.cargo, 'wheat'), 3, 'still aboard: the depot stop doesn\'t drop it');
  assert.deepEqual(truckProblems(s, t), [], 'the mill takes wheat, so it isn\'t stuck aboard');
});

test('a truck low on charge goes home to charge first, drawing on its garage\'s network', () => {
  const s = flat();
  const { g, trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 8, 18);
  silo.store.wheat = 30;
  route(s, [t], [silo, { pick: ['wheat'], drop: [] }], depotOf(s));
  until(s, () => t.phase === 'dock');
  t.energy = 2;
  until(s, () => t.phase === 'drive');
  assert.equal(t.target, g.id, 'home first');
  until(s, () => t.phase === 'charge');
  advance(s, 0.2);
  assert.ok(networkOf(s, g)!.wanted >= TRUCK.chargeRate - 1e-6, `wanted ${networkOf(s, g)!.wanted}`);
  until(s, () => t.phase === 'drive', 20);
  assert.equal(t.target, depotOf(s).id, 'then straight on to the stop it was going to');
  assert.ok(t.energy > TRUCK.battery - 5);
});

test('at a garage without power a truck gives up after a while and crawls on empty', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24, 1, false);
  const silo = put(s, 'silo', 8, 18);
  silo.store.wheat = 30;
  route(s, [t], [silo, { pick: ['wheat'], drop: [] }], depotOf(s));
  until(s, () => t.phase === 'dock');
  t.energy = 0;
  until(s, () => t.phase === 'charge', 60);
  const waited = until(s, () => t.phase === 'drive');
  assert.ok(Math.abs(waited - TRUCK.giveUp) < 0.3, `waited ${waited}`);
  const x = t.x, y = t.y;
  advance(s, 1);
  assert.ok(Math.abs(Math.hypot(t.x - x, t.y - y) - TRUCK.crawl) < 0.05, 'crawling');
});

test('a truck skips a stop it can\'t reach; with none it can, it waits and says so', () => {
  const s = flat();
  const { trucks: [a, b] } = garageAt(s, 2, 24, 2);
  const boxed = put(s, 'silo', 24, 2);
  boxed.store.wheat = 10;
  const walls = [[24, 1], [25, 1], [26, 2], [26, 3], [24, 4], [25, 4], [23, 2], [23, 3]].map(([x, y]) => put(s, 'pylon', x, y));
  const silo = put(s, 'silo', 8, 18);
  const r = route(s, [a], [boxed, { pick: ['wheat'], drop: [] }], silo);
  route(s, [b], [boxed, { pick: ['wheat'], drop: [] }]);
  for (let i = 0; i < 100; i++) { advance(s, 0.1); assert.notEqual(a.target, boxed.id); }
  assert.match(stopProblems(s, r)[0]!, /No open tile/);
  assert.equal(b.phase, 'stuck');
  assert.match(truckProblems(s, b)[0], /none of its stops/);
  remove(s, walls[0]);
  until(s, () => b.phase === 'dock' && b.target === boxed.id, 60);
});

test('a truck finds its way again when the layout changes, and moves off a tile built on', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 24, 4);
  route(s, [t], [silo, { pick: [], drop: [], wait: 0 }]);
  until(s, () => t.phase === 'drive' && t.path.length > 8);
  put(s, 'pylon', Math.floor(t.x), Math.floor(t.y));
  advance(s, 0.1);
  assert.ok(isOpen(s, Math.floor(t.x), Math.floor(t.y)), 'off the pylon');
  // A wall right across its way: it goes round.
  const y = Math.floor(t.y) - 2;
  for (let x = 0; x < 28; x++) if (canPlace(s, 'pylon', x, y).ok) put(s, 'pylon', x, y);
  until(s, () => t.phase === 'dock' && t.target === silo.id, 60);
});

test('removing a building takes it out of its routes; removing a garage sells its trucks', () => {
  const s = flat();
  const { g, trucks: [t, u] } = garageAt(s, 2, 24, 2);
  const f = put(s, 'field', 8, 18);
  const r = route(s, [t, u], f, depotOf(s));
  until(s, () => t.target === f.id);
  remove(s, f);
  assert.deepEqual(r.stops.map((st) => st.building), [depotOf(s).id]);
  advance(s, 0.5);
  assert.equal(t.target, depotOf(s).id);
  t.cargo = ['wheat'];
  const credits = s.credits;
  assert.ok(remove(s, g).ok);
  assert.equal(s.trucks.length, 0);
  assert.equal(s.credits, credits + BUILDINGS.garage.cost + 2 * truckPrice(s));
});

test('when a route changes, a truck keeps going where it was going if that is still a stop', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const a = put(s, 'silo', 8, 18), b = put(s, 'silo', 20, 10);
  a.store.wheat = 30;
  const r = route(s, [t], [a, { pick: ['wheat'], drop: [] }], [b, { wait: 0 }], depotOf(s));
  until(s, () => t.phase === 'drive' && t.target === b.id);
  assert.ok(moveStop(s, r, 1, -1).ok);
  assert.equal(t.target, b.id);
  assert.equal(t.stop, 0);
  assert.ok(removeStop(s, r, 0).ok);
  assert.equal(t.target, a.id, 'its stop went: on to the one now in its place');
  assert.ok(deleteRoute(s, r).ok);
  until(s, () => t.phase === 'parked');
  assert.equal(t.route, null);
  assert.ok(load(serialize(s)), 'still saves');
});

test('a silo holds up to its limit of each good; a full one still takes the others', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 8, 18);
  silo.store.wheat = SILO.perGood - 2;
  t.cargo = ['wheat', 'wheat', 'wheat', 'wheat', 'flour', 'flour'];
  route(s, [t], [silo, { wait: 1 }], [depotOf(s), { drop: [] }]);
  until(s, () => t.phase === 'drive' && t.target === depotOf(s).id);
  assert.deepEqual(silo.store, { wheat: SILO.perGood, flour: 2 });
  assert.deepEqual(t.cargo, ['wheat', 'wheat']);
});

test('a building whose outputs are full with no route picking them up says so; so does one no route feeds', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const mill = put(s, 'mill', 8, 18);
  powerAt(s, 11, 18);
  mill.inputs = { wheat: 6 }; mill.outputs = { bran: 3 };
  const r = route(s, [t], [mill, { pick: ['flour'], drop: [] }], depotOf(s));
  advance(s, 0.2);
  assert.equal(mill.status, 'noroute');
  assert.match(describeStatus(s, mill), /Full of bran: no route/);
  assert.ok(setStopGood(s, r, 0, 'bran', 'pick').ok);
  until(s, () => mill.status === 'input', 60);
  assert.match(describeStatus(s, mill), /Waiting for wheat: no route or building next door brings it/);
  assert.ok(setStopGood(s, r, 0, 'wheat', 'drop').ok);
  assert.doesNotMatch(describeStatus(s, mill), /no route/);
});

test('garages hold a few trucks; trucks cost credits and refund them', () => {
  const s = flat();
  const { g } = garageAt(s, 2, 24, 0);
  const credits = s.credits;
  for (let i = 0; i < TRUCK.perGarage; i++) assert.ok(buyTruck(s, g).ok);
  assert.equal(s.credits, credits - TRUCK.perGarage * TRUCK.cost);
  assert.equal(buyTruck(s, g).ok, false, 'full');
  assert.ok(sellTruck(s, s.trucks[0]).ok);
  assert.equal(s.credits, credits - (TRUCK.perGarage - 1) * TRUCK.cost);
  assert.ok(s.trucks.every((t) => t.energy === TRUCK.battery && t.phase === 'parked'));
});

test('a good is dropped or picked up at a stop, never both', () => {
  const s = flat();
  const silo = put(s, 'silo', 8, 18);
  const r = newRoute(s);
  addStop(s, r, silo);
  assert.ok(r.stops[0].drop.includes('wheat'));
  assert.ok(setStopGood(s, r, 0, 'wheat', 'pick').ok);
  assert.ok(!r.stops[0].drop.includes('wheat') && r.stops[0].pick.includes('wheat'));
  assert.equal(setStopGood(s, r, 0, 'wheat', 'pick').ok, false, 'already so');
  assert.ok(setStopGood(s, r, 0, 'wheat', null).ok);
  assert.ok(!r.stops[0].drop.includes('wheat') && !r.stops[0].pick.includes('wheat'));
  assert.equal(addStop(s, r, put(s, 'pylon', 1, 1)).ok, false, 'no goods at a pylon');
  for (let i = 1; i < TRUCK.maxStops; i++) assert.ok(addStop(s, r, silo).ok);
  assert.equal(addStop(s, r, silo).ok, false, 'at most maxStops');
});

test('a powered mill turns wheat into flour and bran', () => {
  const s = flat();
  powerAt(s, 2, 2);
  const mill = put(s, 'mill', 5, 2);
  mill.inputs.wheat = 6;
  advance(s, 0.2);
  assert.notEqual(mill.progress, null, 'started');
  advance(s, 7);
  assert.ok((s.made.flour ?? 0) >= 1);
  assert.ok((s.made.bran ?? 0) >= 1);
});

test('an unpowered machine does not run; a pylon out of reach does not power it', () => {
  const s = flat();
  const mill = put(s, 'mill', 10, 10);
  mill.inputs.wheat = 2;
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
  loom.inputs.yarn = 9;
  s.scenario = { ...s.scenario, climate: { ...s.scenario.climate, wind: { mean: 0.2, gust: 0 }, sun: { ...s.scenario.climate.sun, strength: 0 } } };
  advance(s, 1);
  const net = networkOf(s, loom)!;
  assert.ok(net.made < net.wanted);
  assert.ok(net.share < 1 && net.share > 0, `share ${net.share}`);
  assert.equal(loom.status, 'lowpower');
  remove(s, loom);
  advance(s, 5);
  assert.ok(bat.charge > 0, 'surplus charges the battery');
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
});

test('a field takes compost only while its soil is poor, and spreads it at once; a truck carries the rest on', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const a = put(s, 'field', 8, 18), b = put(s, 'field', 14, 18), c = put(s, 'field', 20, 18);
  const soil = (f: Building, v: number) => { for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) s.map.fertility[y * s.map.width + x] = v; };
  soil(a, 90); soil(b, 75); soil(c, 62);
  route(s, [t], [a, { drop: ['compost'], pick: [] }], [b, { drop: ['compost'], pick: [] }], [c, { drop: ['compost'], pick: [] }]);
  t.cargo = ['compost', 'compost', 'compost', 'compost'];
  until(s, () => fieldFertility(s, c) > 62 && t.target !== c.id, 120);
  assert.equal(fieldFertility(s, a), 90, 'good soil takes none');
  assert.equal(fieldFertility(s, b), 87, 'one lifts it over the line');
  assert.equal(fieldFertility(s, c), 86, 'poor soil takes what it needs');
  assert.deepEqual(t.cargo, ['compost'], 'and the rest rides on');
});

test('a truck with compost doesn\'t wait at a field whose soil is good', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const a = put(s, 'field', 8, 18), b = put(s, 'field', 14, 18);
  s.map.fertility.fill(95);
  route(s, [t], [a, { drop: ['compost'], pick: [], wait: 60 }], [b, { drop: ['compost'], pick: [], wait: 60 }]);
  t.cargo = ['compost'];
  until(s, () => t.target === b.id, 40);
  assert.deepEqual(t.cargo, ['compost']);
});

test('a route picks up only the compost its fields take now, so a truck never jams full of it', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const comp = put(s, 'composter', 8, 12);
  const a = put(s, 'field', 8, 18), b = put(s, 'field', 14, 18), mill = put(s, 'mill', 20, 18);
  comp.outputs = { compost: 6 };
  // Good soil, full of wheat: the fields don't grow, so their soil won't wear down to take compost.
  s.map.fertility.fill(90);
  for (const f of [a, b]) { f.stored = 6; f.harvest = 'wheat'; }
  route(s, [t], [comp, { pick: ['compost'], drop: [] }], a, b, [mill, { pick: [] }]);
  until(s, () => (mill.inputs.wheat ?? 0) > 0, 60);
  assert.equal(count(t.cargo, 'compost'), 0, 'none taken: no field needs it');
  assert.equal(comp.outputs.compost, 6);
  // Poor soil on one field: the route takes what it needs (+12 a compost, from 70 to over 85: 2), and no more.
  for (let y = a.y; y < a.y + 3; y++) for (let x = a.x; x < a.x + 3; x++) s.map.fertility[y * s.map.width + x] = 70;
  until(s, () => t.target === a.id, 60);
  assert.equal(count(t.cargo, 'compost'), 2);
  assert.equal(comp.outputs.compost, 4);
  until(s, () => t.target === b.id, 60);
  assert.equal(count(t.cargo, 'compost'), 0);
  assert.equal(fieldFertility(s, a), 94);
});

test('a field a route stops at more than once counts its compost once', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const comp = put(s, 'composter', 8, 12), a = put(s, 'field', 8, 18), mill = put(s, 'mill', 20, 18);
  comp.outputs = { compost: 6 };
  s.map.fertility.fill(80);
  route(s, [t], [comp, { pick: ['compost'], drop: [] }], a, a, a, [mill, { pick: [] }]);
  until(s, () => t.target === a.id, 60);
  assert.equal(count(t.cargo, 'compost'), 1);
});

test('a truck full of compost none of its fields takes now says so', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const a = put(s, 'field', 8, 18), mill = put(s, 'mill', 20, 18);
  s.map.fertility.fill(90);
  route(s, [t], a, [mill, { pick: [] }]);
  t.cargo = Array(TRUCK.cargo).fill('compost');
  assert.match(truckProblems(s, t)[0], /full of compost/);
  s.map.fertility.fill(70);
  assert.deepEqual(truckProblems(s, t), [], 'the field takes it now');
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

test('a field sharing an edge with water is fully watered; diagonal contact is not', () => {
  const s = flat();
  s.map.terrain[3 * s.map.width + 6] = TERRAIN.water; // above the field's top row
  const side = put(s, 'field', 4, 4);
  assert.equal(fieldPace(s, side).water, 1);
  const t = flat();
  t.map.terrain[3 * t.map.width + 7] = TERRAIN.water; // diagonal to a field at 4..6
  const diag = put(t, 'field', 4, 4);
  assert.equal(fieldPace(t, diag).water, 0);
  const edge = flat();
  edge.map.terrain[0] = TERRAIN.water;
  assert.equal(fieldPace(edge, put(edge, 'field', 0, 1)).water, 1); // map edge doesn't wrap
});

test('coops lay eggs from feed; composters make compost', () => {
  const s = flat();
  const coop = put(s, 'coop', 2, 2);
  coop.inputs.bran = 2;
  const comp = put(s, 'composter', 10, 2);
  comp.inputs.manure = 1; comp.inputs.seedcake = 1;
  advance(s, 21);
  assert.equal(coop.outputs.egg, 2);
  assert.equal(coop.outputs.manure, 1);
  assert.equal(comp.outputs.compost, 1);
});

test('hives need flowering fields near them and pollinate them', () => {
  const s = flat();
  const hive = put(s, 'hive', 10, 10);
  advance(s, 1);
  assert.equal(hive.status, 'flowers');
  const f = put(s, 'field', 12, 10);
  f.crop = 'beans';
  advance(s, 50);
  assert.ok(hive.stored >= 1);
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
  const back = load(serialize(s))!;
  assert.ok(back);
  assert.equal(back.buildings.length, s.buildings.length);
  assert.equal(buildingAt(back, 5, 5)?.type, 'mill');
  assert.equal(load('{"version":1}'), null);
  assert.equal(load('nonsense'), null);
  let p = readProgress(null);
  p = recordResult(p, 'c1', 'silver', 900);
  p = recordResult(p, 'c1', 'bronze', 500);
  assert.equal(p.c1.medal, 'silver');
  p = recordResult(p, 'c1', 'silver', 800);
  assert.equal(p.c1.time, 800);
});

test('a refused save says why', () => {
  const s = flat();
  put(s, 'mill', 6, 6);
  const json = JSON.parse(serialize(s));
  const why = (text: string | null) => { const r = deserialize(text); if (r.ok) assert.fail('refused'); return r.error; };
  assert.match(why(null), /no saved game/);
  assert.match(why('nonsense'), /isn't JSON/);
  assert.match(why('null'), /another version/);
  assert.match(why(JSON.stringify({ ...json, version: 3 })), /another version/);
  assert.match(why(JSON.stringify({ ...json, trucks: undefined })), /its state/);
  assert.match(why(JSON.stringify({ ...json, run: undefined })), /its run log/);
  // Malformed data is refused, never thrown on.
  const odd = { toString: null };
  assert.match(why(JSON.stringify({ ...json, version: odd })), /another version/);
  assert.match(why(JSON.stringify({ ...json, trucks: [null] })), /its state/);
  assert.match(why(JSON.stringify({ ...json, buildings: [{ ...json.buildings[0], type: odd }] })), /its state/);
  assert.match(why(JSON.stringify({ ...json, buildings: json.buildings.map((b: Building) => (b.type === 'mill' ? { ...b, recipe: 'nope' } : b)) })), /its state/);
  assert.match(why(JSON.stringify({ ...json, buildings: json.buildings.map((b: Building) => (b.type === 'mill' ? { ...b, inputs: undefined } : b)) })), /its state/);
  assert.match(why(JSON.stringify({ ...json, run: { ...json.run, nights: [{ day: 0, short: 0, types: [odd] }] } })), /its run log/);
  // A stray recipe on a building that makes nothing is ignored: it loads, and steps without a lookup.
  const stray = deserialize(JSON.stringify({ ...json, buildings: json.buildings.map((b: Building) => (b.type === 'depot' ? { ...b, recipe: 'nope' } : b)) }));
  assert.ok(stray.ok);
  if (stray.ok) for (let i = 0; i < 50; i++) advance(stray.value, 0.1);
  const back = deserialize(serialize(s));
  assert.ok(back.ok && back.value.buildings.length === s.buildings.length);
  assert.deepEqual(readProgress('not json'), {}, 'broken progress starts afresh');
});

test('saves with missing or broken state are refused', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const f = put(s, 'field', 8, 18);
  route(s, [t], f, depotOf(s));
  advance(s, 3);
  t.cargo = ['wheat'];
  const json = JSON.parse(serialize(s));
  const without = (fn: (o: any) => void) => { const o = structuredClone(json); fn(o); return load(JSON.stringify(o)); };
  const back = without(() => {})!;
  assert.ok(back);
  assert.deepEqual(back.trucks, s.trucks);
  assert.deepEqual(back.routes, s.routes);
  assert.equal(without((o) => { delete o.trucks; }), null);
  assert.equal(without((o) => { delete o.routes; }), null);
  assert.equal(without((o) => { delete o.carry; }), null);
  assert.equal(without((o) => { o.trucks[0].garage = f.id; }), null, 'a truck\'s home is a garage');
  assert.equal(without((o) => { o.trucks[0].route = 999; }), null, 'a route there is');
  assert.equal(without((o) => { o.trucks[0].phase = 'flying'; }), null);
  assert.equal(without((o) => { o.trucks[0].cargo = Array(TRUCK.cargo + 1).fill('wheat'); }), null);
  assert.equal(without((o) => { o.trucks[0].cargo = ['gold']; }), null);
  assert.equal(without((o) => { o.routes[0].stops[0].drop = ['wheat']; o.routes[0].stops[0].pick = ['wheat']; }), null, 'never both');
  assert.equal(without((o) => { o.routes[0].stops[0].wait = -1; }), null);
  assert.equal(without((o) => { o.trucks[0].budget = -1e100; }), null, 'a truck that could never move goods again');
  assert.equal(without((o) => { const f = o.buildings.find((b: any) => b.type === 'field').id; Object.assign(o.trucks[0], { phase: 'dock', target: f }); o.trucks.push({ ...o.trucks[0], id: o.nextId++ }); }), null, 'two trucks in one bay');
  assert.ok(without((o) => { Object.assign(o.trucks[0], { phase: 'dock', target: o.buildings.find((b: any) => b.type === 'field').id }); }), 'one is fine');
  assert.equal(without((o) => { o.trucks[0].id = f.id; }), null, 'ids are one count');
  assert.equal(without((o) => { o.nextId += 0.5; }), null, 'whole ids');
  assert.equal(without((o) => { o.routes[0].id = 0; }), null, 'ids above 0');
  assert.equal(without((o) => { o.buildings[0].type = 'castle'; }), null);
  assert.equal(without((o) => { o.buildings.find((b: any) => b.type === 'field').crop = 'not-a-crop'; }), null);
  assert.equal(without((o) => { o.version = 3; }), null, 'saves from an older version are refused');
  assert.equal(without((o) => { delete o.soilBase; }), null);
  assert.equal(without((o) => { delete o.scenario.tags; }), null);
  assert.equal(without((o) => { delete o.scenario.climate.wind.mean; }), null);
  assert.equal(without((o) => { o.scenario.climate.season = 'monsoon'; }), null, 'a season there is');
  assert.equal(without((o) => { o.scenario.climate.character = 'hard'; o.scenario.climate.season = 'summer'; }), null, 'no hard summer');
  const m = flat();
  put(m, 'mill', 10, 10);
  const mj = JSON.parse(serialize(m));
  assert.equal(load(JSON.stringify({ ...mj, buildings: mj.buildings.map((b: any) => (b.type === 'mill' ? { ...b, recipe: 'bread' } : b)) })), null);
  const k = flat();
  const silo = put(k, 'silo', 6, 6);
  const kj = JSON.parse(serialize(k));
  assert.ok(load(JSON.stringify(kj)));
  assert.equal(load(JSON.stringify({ ...kj, buildings: kj.buildings.map((b: any) => (b.id === silo.id ? { ...b, store: { wheat: 0.5 } } : b)) })), null);
});

test('removing a building twice refunds it once', () => {
  const s = flat();
  const f = put(s, 'field', 4, 4), credits = s.credits;
  assert.ok(remove(s, f).ok);
  assert.equal(remove(s, f).ok, false);
  assert.equal(s.credits, credits + BUILDINGS.field.cost);
});

test('a field keeps the kind of its harvest when its crop changes, and its stops pick up both', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const f = put(s, 'field', 4, 4);
  f.stored = 3; f.harvest = 'wheat';
  const silo = put(s, 'silo', 8, 4);
  const r = route(s, [t], f, [silo, { wait: 0 }]);
  setCrop(s, f, 'tomato');
  assert.deepEqual(r.stops[0].pick, ['wheat', 'tomato']);
  until(s, () => (silo.store.wheat ?? 0) === 3, 60);
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
  assert.equal(k.outputs.bread, 1);
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


test('power drawing: a network\'s wires join every pylon with the fewest, shortest links; a building is fed by its nearest pylon', () => {
  const s = flat();
  const a = put(s, 'pylon', 2, 2), b = put(s, 'pylon', 8, 2), c = put(s, 'pylon', 8, 8), d = put(s, 'pylon', 3, 7);
  const far = put(s, 'pylon', 25, 25);
  const net = networkOf(s, put(s, 'mill', 6, 4))!;
  assert.equal(net.pylons.length, 4);
  const wires = wiresOf(net);
  assert.equal(wires.length, 3, 'a spanning tree of 4 pylons');
  for (const [p, q] of wires) assert.ok(Math.hypot(p.x - q.x, p.y - q.y) <= POWER.pylon.link);
  // Every pylon is joined.
  const joined = new Set(wires.flat());
  for (const p of [a, b, c, d]) assert.ok(joined.has(p));
  assert.deepEqual(wiresOf(networks(s).of.get(far.id)!), []);
  // The mill at (6..7, 4..5) is reached by a, b, c and d; b (8, 2) is nearest its centre.
  assert.equal(feederOf(s, buildingAt(s, 6, 4)!), b);
  assert.equal(feederOf(s, put(s, 'loom', 15, 15)), null);
  assert.deepEqual(new Set(pylonsInLink(s, 8, 5)), new Set([a, b, c, d]));
  assert.deepEqual(pylonsInLink(s, 16, 16), []);
});

test('a docked truck walled off from its building stops loading there and goes on', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 8, 18), other = put(s, 'silo', 20, 18);
  silo.store.wheat = 30;
  route(s, [t], [silo, { pick: ['wheat'], drop: [], wait: 60 }], [other, { wait: 0 }]);
  until(s, () => t.phase === 'dock' && t.target === silo.id);
  for (const i of accessTiles(s, silo)) put(s, 'pylon', i % 30, Math.floor(i / 30));
  advance(s, 0.2);
  assert.notEqual(t.phase, 'dock');
  const wheat = silo.store.wheat;
  advance(s, 10);
  assert.equal(silo.store.wheat, wheat, 'no loading from afar');
});

test('taking out the last stop while a truck is there sends it on to stop 1', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const a = put(s, 'silo', 8, 18), b = put(s, 'silo', 14, 18), c = put(s, 'silo', 20, 18);
  const r = route(s, [t], [a, { wait: 0 }], [b, { wait: 0 }], [c, { wait: 30 }]);
  until(s, () => t.phase === 'dock' && t.target === c.id);
  assert.ok(removeStop(s, r, 2).ok);
  assert.equal(t.target, a.id);
});

test('a save with a queuing truck that is going nowhere is refused', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  route(s, [t], put(s, 'silo', 8, 18));
  const json = JSON.parse(serialize(s));
  json.trucks[0].phase = 'queue'; json.trucks[0].target = null;
  assert.equal(load(JSON.stringify(json)), null);
});

test('route edits keep each truck\'s own stop: a repeated building, or a stop it is charging before', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const a = put(s, 'silo', 8, 18), b = put(s, 'silo', 14, 18), c = put(s, 'silo', 20, 18);
  const r = route(s, [t], [a, { wait: 30 }], [b, { wait: 0 }], [a, { wait: 0 }], [c, { wait: 0 }]);
  until(s, () => t.phase === 'dock' && t.target === a.id && t.stop === 0);
  assert.ok(removeStop(s, r, 0).ok);
  assert.equal(t.target, b.id, 'its stop went: on to the next, not the other stop at the same silo');
  t.phase = 'charge'; t.stop = 2; t.target = t.garage;   // charging before going to c
  assert.ok(removeStop(s, r, 0).ok);
  assert.equal(r.stops[t.stop].building, c.id);
});

test('a truck beside its garage still charges when its battery is low', () => {
  const s = flat();
  const { g, trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 2, 21);   // north of the garage: they share open tiles
  silo.store.wheat = 30;
  route(s, [t], [silo, { pick: ['wheat'], drop: [] }], depotOf(s));
  until(s, () => t.phase === 'dock');
  t.energy = 1;
  until(s, () => t.phase !== 'dock');
  assert.equal(t.target, g.id);
});

test('a stop the trucks\' garage can\'t reach is flagged, and a save with a stop at a garage is refused', () => {
  const s = flat();
  const { g, trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 20, 10);
  // A ring of pylons one tile out: the silo has open tiles beside it, but no way in.
  for (let x = 18; x <= 23; x++) for (const y of [8, 13]) put(s, 'pylon', x, y);
  for (let y = 9; y <= 12; y++) for (const x of [18, 23]) put(s, 'pylon', x, y);
  const r = route(s, [t], silo);
  assert.match(stopProblems(s, r)[0]!, /from their garage/);
  const json = JSON.parse(serialize(s));
  json.routes[0].stops[0].building = g.id;
  assert.equal(load(JSON.stringify(json)), null);
});

test('a stop its trucks\' garage can\'t reach says so, though it has open tiles beside it', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 20, 10);
  for (let x = 18; x <= 23; x++) for (const y of [8, 13]) put(s, 'pylon', x, y);
  for (let y = 9; y <= 12; y++) for (const x of [18, 23]) put(s, 'pylon', x, y);
  advance(s, 0.2);
  assert.equal(silo.status, 'idle', 'no route yet: nothing needs to reach it');
  route(s, [t], silo);
  advance(s, 0.2);
  assert.equal(silo.status, 'noroad');
});

test('with room for one good a visit, a truck still takes each of a stop\'s goods in turn', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const silo = put(s, 'silo', 8, 18), other = put(s, 'silo', 20, 18);
  silo.store = { flour: 10, bran: 10 };
  t.cargo = ['egg', 'egg', 'egg', 'egg', 'egg'];   // never dropped: one free slot
  route(s, [t], [silo, { pick: ['flour', 'bran'], drop: [] }], [other, { drop: ['flour', 'bran'], wait: 0 }]);
  until(s, () => (other.store.flour ?? 0) >= 2 && (other.store.bran ?? 0) >= 2, 200);
});

test('a mill beside wheat fields takes their wheat without a truck; touching corners is not beside', () => {
  const s = flat();
  powerAt(s, 8, 5);
  const mill = put(s, 'mill', 5, 5);
  const west = put(s, 'field', 2, 4), south = put(s, 'field', 5, 7), corner = put(s, 'field', 7, 2);
  for (const f of [west, south, corner]) { f.stored = 6; f.harvest = 'wheat'; }
  assert.deepEqual(linksOf(s, mill).from.map((l) => l.b).sort((a, b) => a.id - b.id), [west, south]);
  assert.deepEqual(passes(west, mill), ['wheat']);
  assert.deepEqual(passes(mill, west), [], 'a field takes only compost');
  until(s, () => (s.made.flour ?? 0) >= 3, 60);
  assert.equal(corner.stored, 6, 'a field touching only at a corner keeps its wheat');
  assert.ok(west.stored < 6 && south.stored < 6, 'both fields next door give');
});

test('byproducts go next door too: a coop beside a mill eats its bran, and a composter beside a coop and a field feeds the field', () => {
  const s = flat();
  powerAt(s, 5, 8);
  const mill = put(s, 'mill', 5, 5), coop = put(s, 'coop', 7, 5), comp = put(s, 'composter', 10, 5), f = put(s, 'field', 12, 5);
  mill.inputs = { wheat: 6 }; coop.inputs = { beans: 2 };
  until(s, () => (s.made.egg ?? 0) >= 4, 60);
  assert.equal(mill.outputs.bran ?? 0, 0, 'the coop took the bran');
  s.map.fertility.fill(40);
  until(s, () => (s.made.compost ?? 0) >= 1 && !comp.outputs.compost, 120);
  assert.ok(fieldFertility(s, f) > 40, 'the field used the compost from next door');
  assert.equal(comp.outputs.compost ?? 0, 0);
});

test('silos and the depot trade only with trucks; a walled-in building fed from next door needs no road', () => {
  const s = flat();
  powerAt(s, 1, 1);
  const silo = put(s, 'silo', 5, 9), f = put(s, 'field', 7, 9);
  f.stored = 6; f.harvest = 'wheat';
  advance(s, 1);
  assert.deepEqual(silo.store, {});
  assert.equal(f.stored, 6);
  // A mill boxed in by fields on every side: no truck can reach it, but it needs none.
  const mill = put(s, 'mill', 16, 16);
  for (const [x, y] of [[14, 13], [17, 13], [18, 16], [15, 18]] as const) put(s, 'field', x, y);
  put(s, 'pylon', 15, 16); put(s, 'pylon', 15, 17);
  advance(s, 0.2);
  assert.equal(accessTiles(s, mill).length, 0);
  assert.notEqual(mill.status, 'noroad');
  assert.ok(tradesNextDoor(s, mill));
});

test('placing a building shows who it would trade with next door', () => {
  const s = flat();
  put(s, 'field', 2, 4); put(s, 'field', 5, 7);
  put(s, 'coop', 7, 4);
  assert.deepEqual(describeLinks(linksAt(s, 'mill', 5, 5)), ['Takes wheat from 2 fields', 'Gives bran to the coop']);
  assert.deepEqual(describeLinks(linksAt(s, 'silo', 5, 5)), [], 'a silo trades only with trucks');
});

test('routes can be renamed and copied; a truck can dump its cargo', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const f = put(s, 'field', 8, 18);
  const r = route(s, [t], f, depotOf(s));
  assert.ok(renameRoute(s, r, '  Wheat   to market ').ok);
  assert.equal(r.name, 'Wheat to market');
  assert.equal(renameRoute(s, r, '   ').ok, false);
  assert.equal(renameRoute(s, r, 'x'.repeat(40)).ok, true);
  assert.equal(r.name.length, ROUTE_NAME_MAX);
  renameRoute(s, r, 'Wheat');
  const c = copyRoute(s, r);
  assert.equal(c.name, 'Wheat (copy)');
  assert.equal(copyRoute(s, r).name, 'Wheat (copy 2)');
  assert.deepEqual(c.stops.map((st) => st.building), r.stops.map((st) => st.building));
  c.stops[0].pick.push('beans');
  assert.ok(!r.stops[0].pick.includes('beans'), 'the copy has its own stops');
  assert.equal(s.trucks.filter((x) => x.route === c.id).length, 0, 'a copy has no trucks');
  t.cargo = ['wheat', 'wheat'];
  assert.ok(dumpCargo(t).ok);
  assert.deepEqual(t.cargo, []);
  assert.equal(dumpCargo(t).ok, false);
  assert.ok(load(serialize(s)), 'still saves');
});

test('two buildings sharing a slow giver next door take turns', () => {
  const s = flat();
  powerAt(s, 5, 2);
  const mill = put(s, 'mill', 5, 5), a = put(s, 'coop', 2, 5), b = put(s, 'coop', 7, 5);
  // A trickle of wheat: the mill makes one bran at a time (its flour is cleared away).
  until(s, () => {
    if (!mill.inputs.wheat && mill.progress === null) mill.inputs.wheat = 2;
    delete mill.outputs.flour;
    return (s.made.bran ?? 0) >= 4;
  }, 200);
  advance(s, 0.2);
  const took = (c: MachineBuilding) => (c.inputs.bran ?? 0) + (c.outputs.egg ?? 0) + (c.progress !== null ? 2 : 0);
  assert.ok(took(a) > 0 && took(b) > 0, 'both coops got bran');
});

test('a composter full of compost that no field wants says why', () => {
  const s = flat();
  const { trucks: [t] } = garageAt(s, 2, 24);
  const comp = put(s, 'composter', 8, 12), a = put(s, 'field', 8, 18);
  s.map.fertility.fill(90);
  route(s, [t], [comp, { pick: ['compost'], drop: [] }], [a, { pick: [], drop: ['compost'] }]);
  comp.status = 'blocked'; comp.need = 'compost';
  assert.match(describeStatus(s, comp), /no field needs any/);
  s.map.fertility.fill(70);
  assert.match(describeStatus(s, comp), /^Output blocked/);
});

test('a loaded game starts with a fresh runtime, and routesVersion changes when a stop is added', () => {
  const s = flat();
  const silo = put(s, 'silo', 8, 18);
  const r = newRoute(s);
  assert.equal(networks(s), networks(s), 'the same game keeps its runtime');
  assert.ok(runtimeOf(s).networks);
  const before = runtimeOf(s).routesVersion;
  assert.ok(addStop(s, r, silo).ok);
  assert.notEqual(runtimeOf(s).routesVersion, before);
  const copy = load(serialize(s))!;
  assert.notEqual(runtimeOf(copy), runtimeOf(s));
  assert.equal(runtimeOf(copy).networks, undefined, 'nothing derived is carried over');
  assert.notEqual(runtimeOf(copy).routesVersion, runtimeOf(s).routesVersion, 'a version is never reused by another game');
});
