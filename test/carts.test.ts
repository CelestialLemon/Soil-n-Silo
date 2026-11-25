import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, atGarage, type Cart, CART_LOW, CART_READY, countOf, demandOf, findPath, GARAGE_CHARGE_W, GARAGE_IDLE_W, GROUND, groundAt,
  type GameState, must, navCellOf, navFor, passable, type Point2, reachOf, sandboxSupplies, SILO_CAP, SILO_GOOD_CAP,
  type SimEvent, stepSim, type ThingKind, totalStored, wantsInput,
} from '../src/game/index.ts';
import { flatLand, land } from './helpers.ts';

const put = (s: GameState, kind: ThingKind, x: number, z: number, yaw = 0) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};
const rt = (s: GameState, id: number) => must(s.sim.things.get(id), 'its runtime');
/** A breezy noon: the turbines run near full. */
const breezy = { windSpeed: 12, cloudCover: 0 };

function sandbox(): GameState {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  return s;
}

/** Runs the homestead `hours` game hours in 1-second steps; returns its events. */
function run(s: GameState, hours: number, until?: () => boolean): SimEvent[] {
  const events: SimEvent[] = [];
  for (let k = 0; k < hours * 30; k++) {
    events.push(...stepSim(s, 1, breezy).events);
    if (until?.()) break;
  }
  return events;
}

/** Path length, and how much of it runs on track. */
function onTrackShare(s: GameState, path: Point2[]): { length: number; share: number } {
  let length = 0, track = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(1, Math.ceil(d / 0.5));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      if (groundAt(s, a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t).onTrack) track += d / n;
    }
    length += d;
  }
  return { length, share: length > 0 ? track / length : 0 };
}

/**
 * A working homestead south of the brook, on turbines in a steady breeze: the Garage, Mill, Bakery, Coop, Silo and the
 * Depot, with a ripe wheat field to the west.
 */
function homestead() {
  const s = sandbox();
  const garage = put(s, 'garage', -10, -28, Math.PI);
  const mill = put(s, 'mill', 6, -28, Math.PI), bakery = put(s, 'bakery', 22, -28, Math.PI);
  const coop = put(s, 'coop', 22, -46, 0), silo = put(s, 'silo', 6, -46);
  const depot = put(s, 'depot', -12, -46, 0);
  for (const x of [-2, 14, 30]) put(s, 'turbine', x, -38);
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: -44, z: -30 }, { x: -36, z: -30 }, { x: -28, z: -30 }], radius: 3 }).ok);
  const wheat = s.fields[0];
  wheat.harvestReady = 8;
  return { s, garage, mill, bakery, coop, silo, depot, wheat };
}

test('carts take tracks and bridges over meadow, and keep off the mud', () => {
  const s = sandbox();
  const from = { x: -40, z: -40 }, to = { x: 40, z: -40 };
  const meadow = must(findPath(s, from, to), 'a way over the meadow');
  assert.ok(onTrackShare(s, meadow).share < 0.01);
  assert.ok(meadow.length <= 3, 'a straight line over open meadow');
  // A track bowing 12 m south: a longer way, but quicker and easier on the battery.
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -40, z: -42 }, { x: -20, z: -52 }, { x: 20, z: -52 }, { x: 40, z: -42 }] }).ok);
  const tracked = must(findPath(s, from, to), 'a way along the track');
  const t = onTrackShare(s, tracked);
  assert.ok(t.share > 0.75, `${Math.round(t.share * 100)}% on the track`);
  assert.ok(t.length > onTrackShare(s, meadow).length);
  // Ground: track beats meadow beats mud, in speed and drain.
  assert.ok(GROUND.track.speed > GROUND.meadow.speed && GROUND.meadow.speed > GROUND.mud.speed);
  assert.ok(GROUND.track.drain < GROUND.meadow.drain && GROUND.meadow.drain < GROUND.mud.drain);
  const mid = s.tracks[0].points[Math.floor(s.tracks[0].points.length / 2)];
  assert.ok(groundAt(s, mid.x, mid.z).onTrack);
  assert.equal(groundAt(s, mid.x, mid.z).speed, GROUND.track.speed);
  assert.ok(groundAt(s, 0, -2.5).speed < GROUND.meadow.speed, 'the brook\'s bank is mud');
});

test('water stops a cart until a plank bridge spans it', () => {
  const s = sandbox();
  const south = { x: -20, z: -20 }, north = { x: -20, z: 20 };
  assert.equal(findPath(s, south, north), null, 'the brook runs the width of the land');
  assert.ok(!passable(navFor(s), navCellOf(-20, 0)));
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -20, z: -15 }, { x: -20, z: 0 }, { x: -20, z: 15 }] }).ok);
  assert.equal(s.bridges.length, 1);
  const path = must(findPath(s, south, north), 'a way over the bridge');
  assert.ok(passable(navFor(s), navCellOf(-20, 0)));
  const crossing = path.find((p, i) => i > 0 && Math.sign(p.z) !== Math.sign(path[i - 1].z));
  assert.ok(crossing, 'it crosses');
  assert.ok(onTrackShare(s, path).share > 0.6);
  // Take the track up and the way is cut again.
  assert.ok(apply(s, { type: 'removeTrack', id: s.tracks[0].id }).ok);
  assert.equal(findPath(s, south, north), null);
});

test('carts work the whole chain on their own: harvest to the Mill, flour and eggs to the Bakery, bread to the Depot', () => {
  const { s, mill, bakery, coop, wheat } = homestead();
  assert.equal(s.sim.carts.length, 1);
  assert.ok(apply(s, { type: 'buyCart' }).ok);
  // First things first: wheat from the field to the Mill.
  run(s, 0.2);
  assert.ok(s.sim.carts.some((c) => c.job?.from.kind === 'field' && c.job.from.id === wheat.id && c.job.good === 'wheat'), s.sim.carts.map((c) => c.jobDesc).join('; '));
  let bread = 0;
  for (let h = 0; h < 30 && countOf(s.sim.delivered, 'bread') < 4; h++) {
    run(s, 1);
    if (wheat.harvestReady === 0) wheat.harvestReady = 6;
    bread = countOf(s.sim.delivered, 'bread');
  }
  assert.ok(rt(s, mill).made >= 2, `the mill ground ${rt(s, mill).made}`);
  assert.ok(rt(s, coop).made >= 1, `the hens laid ${rt(s, coop).made}`);
  assert.ok(rt(s, bakery).made >= 2, `the bakery baked ${rt(s, bakery).made}`);
  assert.ok(bread >= 4, `${bread} bread delivered`);
  assert.ok(countOf(s.sim.delivered, 'flour') > 0, 'flour too, once the bakery had its share');
  assert.ok(!s.sim.powerSummary.anyBlackout);
  for (const c of s.sim.carts) assert.ok(c.battery > 0, 'none ran flat');
});

test('a cart running low goes home to charge, and sets out again once it holds enough', () => {
  const { s } = homestead();
  const cart = s.sim.carts[0];
  cart.battery = CART_LOW + 0.03;
  const states: Cart['state'][] = [];
  let lowest = 1, rose = false;
  for (let k = 0; k < 30 * 8 && !rose; k++) {
    stepSim(s, 1, breezy);
    if (states.at(-1) !== cart.state) states.push(cart.state);
    lowest = Math.min(lowest, cart.battery);
    if (states.includes('charging') && cart.battery >= CART_READY && cart.state !== 'charging') rose = true;
  }
  assert.ok(lowest < CART_LOW, `it ran down to ${lowest.toFixed(2)}`);
  assert.ok(states.includes('returning') && states.includes('charging'), states.join(' → '));
  assert.ok(rose, `it set out again: ${states.join(' → ')}`);
  assert.ok(cart.battery >= CART_READY);
});

test('a cart whose destination is taken down mid-haul finds somewhere else for its cargo', () => {
  const { s, mill, silo } = homestead();
  const cart = s.sim.carts[0];
  run(s, 3, () => cart.state === 'toDropoff' && cart.job?.to.id === mill && cart.cargo !== null);
  assert.equal(cart.state, 'toDropoff');
  assert.equal(must(cart.job, 'its job').to.id, mill);
  const cargo = must(cart.cargo, 'its cargo');
  assert.ok(apply(s, { type: 'remove', id: mill }).ok);
  stepSim(s, 1, breezy);
  assert.ok(cart.job === null || cart.job.to.id !== mill, 'it gave up on the Mill');
  assert.ok(cart.cargo, 'still holding its load');
  const before = countOf(rt(s, silo).outputs, cargo.good);
  run(s, 2, () => cart.cargo === null);
  assert.equal(cart.cargo, null);
  assert.ok(countOf(rt(s, silo).outputs, cargo.good) >= before + cargo.count, 'into the Silo');
});

test('a cart whose pickup is taken down heads back, and the land changing re-plans its way', () => {
  const { s, wheat } = homestead();
  const cart = s.sim.carts[0];
  run(s, 1, () => cart.state === 'toPickup' && cart.job?.from.kind === 'field');
  assert.equal(cart.state, 'toPickup');
  const key = cart.navKey;
  // A bench dropped on the land moves the nav grid on; the cart finds its way again.
  put(s, 'bench', -20, -10);
  stepSim(s, 1, breezy);
  assert.notEqual(cart.navKey, key);
  assert.equal(cart.state, 'toPickup');
  // Erasing the whole field cancels the job.
  const b = wheat.bounds, g = s.grid;
  assert.ok(apply(s, { type: 'eraseField', points: [{ x: g.x0 + b.x0, z: -30 }, { x: g.x0 + b.x1 + 1, z: -30 }], radius: 6 }).ok);
  assert.equal(s.fields.length, 0);
  stepSim(s, 1, breezy);
  assert.ok((['returning', 'idle', 'charging'] as Cart['state'][]).includes(cart.state), cart.state);
  assert.equal(cart.job, null);
});

/** Paints a small round field of a crop at (x, z), ripe with `ready` units; returns its id. */
function ripeField(s: GameState, crop: 'wheat' | 'beans', x: number, z: number, ready: number, radius = 1.5): number {
  assert.ok(apply(s, { type: 'paintField', crop, points: [{ x, z }], radius }).ok);
  const f = must(s.fields.find((v) => v.crop === crop && Math.hypot(s.grid.x0 + (v.bounds.x0 + v.bounds.x1 + 1) / 2 - x, s.grid.z0 + (v.bounds.z0 + v.bounds.z1 + 1) / 2 - z) < 2), 'the field');
  f.harvestReady = ready;
  return f.id;
}

test('fields across an unbridged brook never crowd out the one a cart can reach', () => {
  const s = sandbox();
  put(s, 'garage', -10, -28, Math.PI);
  put(s, 'silo', 6, -14);
  // Nine ripe fields just over the brook, nearer than the one on the cart's own side.
  const far = [-24, -16, -8, 0, 8, 16, 24, 32, 40].map((x) => ripeField(s, 'wheat', x, 8, 4));
  const near = ripeField(s, 'wheat', 50, -52, 4);
  const cart = s.sim.carts[0];
  assert.notEqual(reachOf(s, cart, 'start'), reachOf(s, { x: 0, z: 8 }, 'goal'), 'the brook parts them');
  run(s, 0.1, () => cart.job !== null);
  assert.ok(cart.job, `it found work: ${cart.jobDesc}`);
  assert.deepEqual(cart.job.from, { kind: 'field', id: near });
  assert.ok(!far.includes(cart.job.from.id));
  assert.equal(cart.state, 'toPickup');
});

test('a workshop\'s preferred input across the water doesn\'t stop a cart bringing the one it can reach', () => {
  const s = sandbox();
  put(s, 'garage', -10, -28, Math.PI);
  const coop = put(s, 'coop', 22, -46, 0);
  // Bran waits at a Mill over the unbridged brook; wheat ripens on the cart's own side.
  const mill = put(s, 'mill', 6, 20);
  rt(s, mill).outputs = { bran: 3 };
  const wheat = ripeField(s, 'wheat', -40, -30, 4);
  const cart = s.sim.carts[0];
  run(s, 0.1, () => cart.job !== null);
  assert.ok(cart.job, `it found work: ${cart.jobDesc}`);
  assert.equal(cart.job.good, 'wheat');
  assert.deepEqual(cart.job.from, { kind: 'field', id: wheat });
  assert.deepEqual(cart.job.to, { kind: 'thing', id: coop });
});

test('a cart\'s path never cuts the corner of a blocked cell where it starts or ends', () => {
  // One nav cell of water, [0, 2) × [0, 2): a straight run from the start to the end would graze its corner.
  const inside = (x: number, z: number) => x >= 0 && x < 2 && z >= 0 && z < 2;
  const s = land({ height: () => 0, water: (x, z) => (inside(x, z) ? -0.2 : undefined) });
  assert.ok(!passable(navFor(s), navCellOf(1, 1)));
  const from = { x: -3.9, z: 0.9 }, to = { x: 1.3, z: -0.3 };
  const path = must(findPath(s, from, to), 'a way round');
  assert.deepEqual(path[0], from);
  assert.deepEqual(path[path.length - 1], to);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    for (let k = 0; k <= 4000; k++) {
      const t = k / 4000, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      assert.ok(!inside(x, z), `(${x.toFixed(4)}, ${z.toFixed(4)}) is in the water, on ${JSON.stringify(path)}`);
    }
  }
  // And the other way.
  const back = must(findPath(s, to, from), 'a way back');
  for (let i = 1; i < back.length; i++) {
    const a = back[i - 1], b = back[i];
    for (let k = 0; k <= 4000; k++) {
      const t = k / 4000;
      assert.ok(!inside(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t));
    }
  }
});

test('moving the Garage over the water stops its charging cart, until a bridge lets it drive to the new one', () => {
  const s = sandbox();
  const garage = put(s, 'garage', -10, -28, Math.PI);
  const cart = s.sim.carts[0], g = () => must(s.things.find((t) => t.id === garage), 'the garage');
  cart.battery = 0.3;
  cart.state = 'charging';
  run(s, 0.5);
  assert.ok(cart.battery > 0.3, 'it charges at the Garage');
  assert.equal(demandOf(s, g(), rt(s, garage), 12), GARAGE_CHARGE_W);
  // The Garage moves over the brook: the cart is stranded at its old site.
  assert.ok(apply(s, { type: 'move', id: garage, x: -10, z: 28 }).ok);
  assert.ok(!atGarage(s, cart));
  const stranded = cart.battery;
  run(s, 2);
  assert.ok(Math.abs(cart.battery - stranded) < 1e-9, `no charge from a Garage it isn't at (${stranded} → ${cart.battery})`);
  assert.notEqual(cart.state, 'charging');
  assert.equal(demandOf(s, g(), rt(s, garage), 12), GARAGE_IDLE_W, 'and the Garage draws nothing to charge it');
  assert.match(cart.jobDesc, /no way back to the Garage/);
  // A track over the brook (a plank bridge): the cart drives to the new Garage and charges there.
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -20, z: -15 }, { x: -20, z: 0 }, { x: -20, z: 15 }] }).ok);
  run(s, 3, () => cart.state === 'charging' && atGarage(s, cart));
  assert.equal(cart.state, 'charging');
  assert.ok(atGarage(s, cart) && cart.z > 0, `at the new Garage (${cart.x.toFixed(1)}, ${cart.z.toFixed(1)})`);
  const there = cart.battery;
  run(s, 0.5);
  assert.ok(cart.battery > there, 'charging again');
  assert.equal(demandOf(s, g(), rt(s, garage), 12), GARAGE_CHARGE_W);
});

test('a glut of one crop never fills the Silo: past its share it waits in the fields, and the workshops\' goods still fit', () => {
  const s = sandbox();
  put(s, 'garage', -10, -28, Math.PI);
  const silo = put(s, 'silo', 6, -46);
  assert.ok(apply(s, { type: 'buyCart' }).ok && apply(s, { type: 'buyCart' }).ok);
  const beans = [-30, -22, -14].map((x) => ripeField(s, 'beans', x, -52, 8, 2));
  for (let h = 0; h < 16; h++) {
    run(s, 1);
    for (const id of beans) { const f = must(s.fields.find((v) => v.id === id), 'a bean field'); if (f.harvestReady === 0) f.harvestReady = 8; }
  }
  const store = rt(s, silo);
  assert.equal(countOf(store.outputs, 'beans'), SILO_GOOD_CAP, 'beans fill only their share');
  assert.ok(totalStored(store.outputs) < SILO_CAP);
  assert.equal(wantsInput(store, 'beans'), 0);
  assert.ok(s.fields.some((f) => f.harvestReady > 0), 'the rest wait ripe in the fields');
  for (const c of s.sim.carts) assert.ok(c.cargo === null || c.cargo.good !== 'beans' || c.state !== 'toDropoff' || c.job?.to.id !== silo, 'no cart hauls more beans to the Silo');
  // The Mill's flour and bran still have room in the Silo.
  const mill = put(s, 'mill', 30, -40);
  rt(s, mill).outputs = { flour: 4, bran: 2 };
  run(s, 4, () => countOf(store.outputs, 'flour') > 0);
  assert.ok(countOf(store.outputs, 'flour') > 0, 'flour cleared into the Silo');
  assert.equal(countOf(store.outputs, 'beans'), SILO_GOOD_CAP);
  // Even a Silo stuffed to every good's share keeps room for the rest, and never takes one past its share.
  store.outputs = { beans: SILO_GOOD_CAP, wheat: SILO_GOOD_CAP, flour: SILO_GOOD_CAP, bran: SILO_GOOD_CAP };
  assert.equal(wantsInput(store, 'wheat'), 0);
  assert.equal(wantsInput(store, 'eggs'), SILO_CAP - 4 * SILO_GOOD_CAP);
});
