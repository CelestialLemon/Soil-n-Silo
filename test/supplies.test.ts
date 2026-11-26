import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, CATALOG, CART_COST, type GameState, MAX_CARTS, must, receiveDrop, STARTER_SUPPLIES, starterSupplies, SUPPLY_CAP,
  type ThingKind, THING_KINDS,
} from '../src/game/index.ts';
import { flatLand, freshValley } from './helpers.ts';

const put = (s: GameState, kind: ThingKind, x: number, z: number) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw: 0 });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};

test('the Spring Valley starts with 12 Supplies, two drops to come and a cap of 20', () => {
  const s = flatLand(), sup = s.sim.supplies;
  assert.equal(sup.available, STARTER_SUPPLIES);
  assert.equal(sup.unlocked, 12);
  assert.equal(sup.spent, 0);
  assert.equal(sup.cap, SUPPLY_CAP);
  assert.deepEqual(sup.drops.map((d) => [d.id, d.amount, d.received]), [['firstHarvest', 4, false], ['firstCraft', 4, false]]);
});

test('every kind has its price: homes, relays and props are free, canopies, batteries and the Weather Station 1, workshops 2, turbines, wheels and the Greenhouse 3', () => {
  const want: Partial<Record<ThingKind, number>> = {
    farmhouse: 0, relay: 0, bench: 0, lantern: 0, planter: 0, crates: 0, depot: 0, solar: 1, rain_tank: 1, sprinkler: 1, beehive: 1, battery: 1,
    weather_station: 1, silo: 2, mill: 2, bakery: 2, coop: 2, composter: 2, garage: 2, turbine: 3, waterwheel: 3, greenhouse: 3,
    oil_press: 2, cannery: 2, spinner: 2, loom: 2, digester: 3,
  };
  for (const k of THING_KINDS) assert.equal(CATALOG[k].cost, want[k], k);
  assert.equal(CART_COST, 1);
});

test('placing spends Supplies; past the pool it is refused with a Result, and removing refunds all of it', () => {
  const s = flatLand(), sup = s.sim.supplies;
  const ids = (['silo', 'mill', 'bakery', 'coop', 'composter'] as const).map((k, i) => put(s, k, -45 + 15 * i, -40));
  assert.equal(sup.available, 2);
  assert.equal(sup.spent, 10);
  const turbine = apply(s, { type: 'place', kind: 'turbine', x: -40, z: -52, yaw: 0 });
  assert.ok(!turbine.ok);
  assert.match(turbine.error, /needs 3 Supplies; you have 2 free/);
  assert.equal(s.things.length, 5, 'nothing was placed');
  // Free things still go down with an empty pool.
  put(s, 'solar', -40, -52);
  put(s, 'battery', -28, -52);
  assert.equal(sup.available, 0);
  put(s, 'relay', -18, -52);
  put(s, 'bench', -10, -52);
  put(s, 'farmhouse', 40, -25);
  assert.equal(sup.available, 0);
  const r = apply(s, { type: 'remove', id: ids[1] });
  assert.ok(r.ok && r.value.supplies);
  assert.equal(sup.available, 2);
  assert.equal(sup.spent, 10);
  assert.ok(apply(s, { type: 'place', kind: 'turbine', x: 40, z: -48, yaw: 0 }).ok === false, 'still short of 3');
  assert.ok(apply(s, { type: 'remove', id: ids[0] }).ok);
  assert.equal(sup.available, 4);
  put(s, 'turbine', 40, -48);
  assert.equal(sup.available, 1);
});

test('a drop arrives once, and the pool never passes its cap', () => {
  const sup = starterSupplies();
  assert.equal(must(receiveDrop(sup, 'firstHarvest'), 'the drop').amount, 4);
  assert.equal(receiveDrop(sup, 'firstHarvest'), undefined, 'only once');
  assert.equal(sup.available, 16);
  const tight = starterSupplies();
  tight.cap = 14;
  receiveDrop(tight, 'firstHarvest');
  receiveDrop(tight, 'firstCraft');
  assert.equal(tight.unlocked, 14);
  assert.equal(tight.available, 14);
  const full = starterSupplies();
  receiveDrop(full, 'firstHarvest'); receiveDrop(full, 'firstCraft');
  assert.equal(full.unlocked, SUPPLY_CAP);
});

test('the Depot stands from the start: free, and it can be neither moved nor removed', () => {
  const s = freshValley(1042);
  const depot = must(s.things.find((t) => t.kind === 'depot'), 'the depot');
  assert.equal(s.sim.supplies.available, STARTER_SUPPLIES, 'it cost nothing');
  const moved = apply(s, { type: 'move', id: depot.id, x: depot.x + 3, z: depot.z });
  assert.ok(!moved.ok);
  assert.match(moved.error, /stays/);
  const removed = apply(s, { type: 'remove', id: depot.id });
  assert.ok(!removed.ok);
  assert.ok(s.things.includes(depot));
});

test('the Garage comes with a cart; more cost 1 each up to 4, and retiring one refunds it', () => {
  const s = flatLand(), sup = s.sim.supplies;
  const none = apply(s, { type: 'buyCart' });
  assert.ok(!none.ok);
  assert.match(none.error, /Garage/);
  const garage = put(s, 'garage', -20, -40);
  assert.equal(s.sim.carts.length, 1, 'the starter cart');
  assert.equal(sup.available, 10);
  for (let k = 2; k <= MAX_CARTS; k++) {
    const r = apply(s, { type: 'buyCart' });
    assert.ok(r.ok && r.value.carts && r.value.supplies);
    assert.equal(s.sim.carts.length, k);
  }
  assert.equal(sup.available, 7);
  const fifth = apply(s, { type: 'buyCart' });
  assert.ok(!fifth.ok);
  assert.match(fifth.error, /at most 4/);
  assert.ok(apply(s, { type: 'retireCart', id: s.sim.carts[3].id }).ok);
  assert.equal(s.sim.carts.length, 3);
  assert.equal(sup.available, 8);
  assert.ok(!apply(s, { type: 'retireCart', id: 999 }).ok);
  // The Garage keeps its last cart.
  assert.ok(apply(s, { type: 'retireCart', id: s.sim.carts[2].id }).ok);
  assert.ok(apply(s, { type: 'retireCart', id: s.sim.carts[1].id }).ok);
  assert.equal(sup.available, 10);
  assert.ok(!apply(s, { type: 'retireCart', id: s.sim.carts[0].id }).ok);
  // Taking the Garage down retires every cart, refunding the extras and the Garage itself.
  assert.ok(apply(s, { type: 'buyCart' }).ok);
  assert.ok(apply(s, { type: 'buyCart' }).ok);
  assert.equal(sup.available, 8);
  const gone = apply(s, { type: 'remove', id: garage });
  assert.ok(gone.ok);
  assert.equal(s.sim.carts.length, 0);
  assert.equal(sup.available, 12);
  assert.equal(sup.spent, 0);
});

test('a removed building takes its live side with it', () => {
  const s = flatLand();
  const mill = put(s, 'mill', -20, -40);
  assert.ok(s.sim.things.has(mill));
  assert.ok(apply(s, { type: 'remove', id: mill }).ok);
  assert.ok(!s.sim.things.has(mill));
});
