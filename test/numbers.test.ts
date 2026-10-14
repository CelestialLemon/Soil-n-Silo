import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addStop, buyTruck, newRoute, place, setTruckRoute } from '../src/game/build.ts';
import { chainBuildings, chainOf } from '../src/game/chain.ts';
import { DAY_SECONDS, FIELD, ITEMS, POWER, type ItemId } from '../src/game/data.ts';
import { FLEET_SECONDS, routeTiming, truckTime } from '../src/game/fleet.ts';
import { creditsPerMin, flowRate, flowSeries, goodsHeld, soilTrend } from '../src/game/flows.ts';
import { nextHour, placement, tonight } from '../src/game/forecast.ts';
import { heldSince, historyOf, summarize, waitsOf } from '../src/game/history.ts';
import { HOUR_SECONDS, nightsOf, powerDay } from '../src/game/powerlog.ts';
import { RUN_SAMPLE, runWaits } from '../src/game/runlog.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { advance, deliver, hourAt } from '../src/game/sim.ts';
import { newGame, type Building, type GameState, type Route, type Truck } from '../src/game/state.ts';

// The numbers the HUD shows beyond the rules themselves: goods flows, route timing, power over a day, the run log, the
// placement and tonight forecasts, what a building waits for, and the guide's chains.

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

function put(s: GameState, type: Parameters<typeof place>[1], x: number, y: number): Building {
  const r = place(s, type, x, y, 0);
  assert.ok(r.ok, `${type} at ${x},${y}: ${r.message}`);
  return r.building!;
}

/** A pylon with a full battery beside it. */
function powerAt(s: GameState, x: number, y: number) {
  put(s, 'pylon', x, y);
  const bat = put(s, 'battery', x + 1, y);
  bat.charge = POWER.battery.capacity;
  return bat;
}

function trucksAt(s: GameState, x: number, y: number, n = 1): Truck[] {
  const g = put(s, 'garage', x, y);
  powerAt(s, x + 2, y);
  return Array.from({ length: n }, () => buyTruck(s, g).truck!);
}

function route(s: GameState, trucks: Truck[], ...stops: Building[]): Route {
  const r = newRoute(s);
  for (const b of stops) assert.ok(addStop(s, r, b).ok);
  for (const t of trucks) setTruckRoute(s, t, r);
  return r;
}

const depotOf = (s: GameState) => s.buildings.find((b) => b.type === 'depot')!;

test('goods flows: made, used and delivered a minute, over the window recorded', () => {
  const s = flat();
  const mill = put(s, 'mill', 4, 4);
  powerAt(s, 7, 4);
  mill.inputs = { wheat: 6 };
  advance(s, 30);
  // Three batches of 6 s: 3 flour made, 6 wheat used, over 30 s.
  assert.equal(Math.round(flowRate(s, 'made', 'flour') * 30 / 60), 3);
  assert.equal(Math.round(flowRate(s, 'used', 'wheat') * 30 / 60), 6);
  deliver(s, 'bread');
  assert.ok(flowRate(s, 'delivered', 'bread') > 0);
  assert.ok(creditsPerMin(s) >= ITEMS.bread.price, 'credits a minute count the delivery');
  const series = flowSeries(s, 'made', 'flour', 600, 10);
  assert.equal(series.length, 10);
  assert.equal(series[0], null, 'before recording began');
  assert.ok((series[9] ?? 0) > 0);
  assert.equal(goodsHeld(s).flour, 3, 'flour waiting in the mill');
});

test('goods held count every store and truck; soil trend follows soil health', () => {
  const s = flat();
  const silo = put(s, 'silo', 4, 4);
  silo.store!.wheat = 7;
  const [t] = trucksAt(s, 10, 10);
  t.cargo = ['wheat', 'egg'];
  const f = put(s, 'field', 20, 4);
  f.stored = 2; f.harvest = 'wheat'; f.compost = 1;
  const held = goodsHeld(s);
  assert.equal(held.wheat, 7 + 1 + 2);
  assert.equal(held.egg, 1);
  assert.equal(held.compost, 1);
  advance(s, 30);
  // The field's soil drops by 30: soil health follows.
  for (let y = 4; y < 7; y++) for (let x = 20; x < 23; x++) s.map.fertility[y * s.map.width + x] = 30;
  advance(s, 60);
  const trend = soilTrend(s)!;
  assert.ok(trend < 0, `trend ${trend}`);
});

test('route timing: arrivals per stop, the loop, gaps between trucks, idle share', () => {
  const s = flat();
  const trucks = trucksAt(s, 2, 24, 2);
  const silo = put(s, 'silo', 8, 18);
  silo.store!.wheat = 30;
  const far = put(s, 'silo', 20, 6);
  const r = route(s, trucks, silo, far);
  r.stops[0].drop = []; r.stops[0].pick = ['wheat'];
  r.stops[1].drop = ['wheat']; r.stops[1].pick = [];
  const empty = newRoute(s);
  assert.equal(routeTiming(s, empty).slowest, null, 'a route without trucks has no slowest stop');
  advance(s, 200);
  const tm = routeTiming(s, r);
  assert.ok(tm.window > 190 && tm.window <= FLEET_SECONDS);
  assert.ok(tm.stops[0].arrivals >= 3 && tm.stops[1].arrivals >= 3, JSON.stringify(tm.stops));
  assert.ok(tm.loop !== null && tm.loop > 0);
  assert.ok(tm.driving !== null && tm.driving < tm.loop!, 'a round takes longer than the driving alone');
  assert.ok(tm.stops[0].gap !== null && tm.stops[0].gap < tm.loop!, 'two trucks: the gap is shorter than a round');
  assert.ok(tm.slowest);
  const time = truckTime(s, trucks[0], r.id);
  assert.ok(time.total > 100 && time.idle !== null && time.idle >= 0 && time.idle < 1);
  assert.ok((time.seconds.drive ?? 0) > 0);
  // A stop no truck reaches is the slowest.
  const walled = put(s, 'silo', 26, 26);
  addStop(s, r, walled);
  for (const [x, y] of [[25, 26], [25, 27], [25, 28], [26, 25], [27, 25], [28, 25], [28, 26], [28, 27], [28, 28], [26, 28], [27, 28], [25, 25]]) put(s, 'pylon', x, y);
  advance(s, 120);
  const after = routeTiming(s, r);
  assert.equal(after.stops[2].arrivals, 0);
  assert.equal(after.slowest?.stop, 2);
});

test('power over a day: sources by hour, the digester among them, use by building, nights', () => {
  const s = flat({ weather: { sunrise: 6, sunset: 20, sun: 1, wind: 0.5, gust: 0 } });
  put(s, 'pylon', 5, 5);
  put(s, 'solar', 6, 6);
  const dig = put(s, 'digester', 3, 6);
  dig.inputs = { manure: 3 };
  const mill = put(s, 'mill', 6, 3);
  mill.inputs = { wheat: 30 };
  put(s, 'battery', 3, 3);
  advance(s, DAY_SECONDS);
  const day = powerDay(s);
  assert.equal(day.hours.length, 24);
  assert.ok(day.hours.every((h) => h !== null), 'a whole day recorded');
  assert.ok(day.avg.solar > 0 && day.avg.digester > 0, JSON.stringify(day.avg));
  assert.ok(Math.abs(day.avg.made - (day.avg.solar + day.avg.wind + day.avg.digester)) < 1e-9);
  assert.ok((day.use.mill ?? 0) > 0);
  assert.ok(day.hours.some((h) => h!.night) && day.hours.some((h) => !h!.night));
  const nights = nightsOf(s);
  assert.ok(nights.length >= 1);
  assert.ok(nights[0].lowest !== null);
});

test('tonight: a battery feeding a steady load runs dry when its charge is spent', () => {
  const s = flat({ weather: { sunrise: 6, sunset: 20, sun: 1, wind: 0.05, gust: 0 } });
  put(s, 'pylon', 5, 5);
  const bat = put(s, 'battery', 6, 5);
  const loom = put(s, 'loom', 5, 7);
  loom.inputs = { yarn: 30 };
  advance(s, 1);
  // At 20:00 sharp, half full; the loom wants 20 W, the battery holds 2400 J: 1200 J last 60 s of play.
  s.time = nextHour(s.time, 20) - 0.05;
  advance(s, 0.1);
  bat.charge = POWER.battery.capacity / 2;
  const t = tonight(s)!;
  assert.ok(t);
  assert.equal(t.sunset, null, 'it is night');
  assert.ok(t.dryAt !== null);
  const expect = s.time + POWER.battery.capacity / 2 / 20;
  assert.ok(Math.abs(t.dryAt! - expect) <= HOUR_SECONDS / 6 + 1e-6, `dry at ${t.dryAt}, expected ${expect}`);
  assert.ok(Math.abs(t.shortAfter - 20) < 1e-6, `short ${t.shortAfter}`);
  assert.ok(Math.abs(hourAt(t.sunrise) - 6) < 1e-6);
  const none = flat();
  assert.equal(tonight(none), null, 'no batteries, no forecast');
});

test('placing: a field forecasts its harvest, its soil in ten minutes and its water', () => {
  const s = flat();
  const p = placement(s, 'field', 4, 4);
  const [harvest, soil, water] = p.facts;
  assert.equal(harvest.label, 'Wheat');
  assert.equal(soil.value, '60');
  assert.ok(Number(soil.then) < 60, 'wheat wears the soil');
  assert.equal(water.value, 'none');
  assert.equal(water.sub, `grows at ${FIELD.dry * 100}%`);
  put(s, 'sprinkler', 3, 5);
  powerAt(s, 1, 1);
  put(s, 'pylon', 2, 6);
  advance(s, 0.2);
  const wet = placement(s, 'field', 4, 4);
  assert.equal(wet.facts[2].value, '1 sprinkler');
  assert.ok(Number(wet.facts[0].value) > Number(harvest.value));
  // A mill beside it would take its wheat.
  put(s, 'field', 10, 4);
  assert.ok(placement(s, 'mill', 13, 4).next.some((l) => l.includes('wheat')));
});

test('the run log: milestones, the goal good\'s curve, waits; it saves, and an older save starts one', () => {
  const s = flat({ goals: [{ kind: 'deliver', item: 'flour', n: 3 }] });
  s.reached = [false];
  const mill = put(s, 'mill', 4, 4);
  put(s, 'mill', 4, 8);
  powerAt(s, 7, 4);
  mill.inputs = { wheat: 6 };
  advance(s, 25);
  const kinds = s.run.marks.map((m) => `${m.kind}:${m.item ?? m.type ?? ''}`);
  assert.ok(kinds.includes('first:flour') && kinds.includes('first:bran'), kinds.join(' '));
  assert.ok(kinds.includes('second:mill'));
  for (let i = 0; i < 3; i++) deliver(s, 'flour');
  advance(s, 1.5);
  assert.ok(s.run.marks.some((m) => m.kind === 'goal' && m.goal === 0));
  assert.ok(s.completedAt !== null);
  assert.equal(s.run.curve.length, Math.floor(s.completedAt! / RUN_SAMPLE) + 1);
  assert.equal(s.run.curve[0], 0);
  const waits = runWaits(s.run);
  assert.ok(waits.some((w) => w.type === 'mill' && w.status === 'input'), 'the second mill waited for wheat');
  // Kept playing, the run log no longer grows.
  const saved = JSON.stringify(s.run);
  advance(s, DAY_SECONDS * 2);
  assert.equal(JSON.stringify(s.run), saved);
  const back = deserialize(serialize(s))!;
  assert.deepEqual(back.run, s.run);
  const old = JSON.parse(serialize(s));
  delete old.run;
  const migrated = deserialize(JSON.stringify(old))!;
  assert.ok(migrated.run.marks.every((m) => m.t === -1));
  assert.equal(migrated.run.curve.length, 1);
  assert.equal(deserialize(JSON.stringify({ ...old, run: { ...s.run, curve: ['x'] } })), null);
});

test('a building\'s history says how long its status has held, what it waited for, and what was taken', () => {
  const s = flat();
  const [t] = trucksAt(s, 2, 24);
  const f = put(s, 'field', 8, 18);
  f.stored = 6; f.harvest = 'wheat';
  const mill = put(s, 'mill', 14, 4);
  powerAt(s, 17, 4);
  route(s, [t], f, depotOf(s));
  advance(s, 60);
  const sum = summarize(historyOf(s, mill)!, s.time, 60);
  const waits = waitsOf(sum);
  assert.equal(waits[0].kind, 'input');
  assert.equal(waits[0].need, 'wheat');
  assert.ok(waits[0].share > 0.9);
  assert.ok(heldSince(historyOf(s, mill)!)!.from <= 1);
  const fs = summarize(historyOf(s, f)!, s.time, 60);
  assert.equal(fs.taken.wheat, 6, 'the truck took the harvest');
});

test('chains: bread comes from a bakery fed by a mill and a coop, back to the fields', () => {
  const c = chainOf('bread');
  assert.equal(c.from?.building, 'bakery');
  assert.deepEqual(chainBuildings(c), ['bakery', 'mill', 'field', 'coop']);
  const egg = c.from!.inputs.find((i) => 'item' in i && i.item === 'egg')!;
  assert.ok('item' in egg && egg.from?.building === 'coop' && egg.from.inputs.some((i) => 'group' in i && i.group === 'feed'));
  assert.equal(chainOf('wheat').from?.verb, 'grow');
  assert.equal(chainOf('bran').from?.building, 'mill', 'a byproduct comes from its maker');
  assert.equal(chainOf('honey').from?.building, 'hive');
  const items: ItemId[] = ['linen', 'sauce', 'honeycake', 'compost'];
  for (const i of items) assert.ok(chainOf(i).from, i);
});
