import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, atGarage, type Cart, CART_LOW, CART_READY, countOf, demandOf, diagnoseIdleCarts, dockOf, DOCK_RADIUS, findPath, GARAGE_CHARGE_W, GARAGE_IDLE_W, GROUND, groundAt,
  type GameState, fieldEdge, must, navCellOf, navFor, PANTRY_ORDERS, passable, type Point2, reachOf, sandboxSupplies, SILO_CAP, SILO_GOOD_CAP,
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
  // The grain loop's order (flatLand is a summer valley, whose own order is the Cannery's).
  s.sim.brief.order.targets = { ...PANTRY_ORDERS.spring };
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

/** Every nav cell a path's legs run through (sampled finely), but its first point's own. */
function cellsOnPath(path: Point2[]): Set<number> {
  const out = new Set<number>(), own = navCellOf(path[0].x, path[0].z);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    for (let k = 0; k <= 2000; k++) {
      const t = k / 2000, c = navCellOf(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t);
      if (c !== own) out.add(c);
    }
  }
  return out;
}

test('a cart left in a wide brook when its bridge comes up climbs out on the near bank, never across the water', () => {
  // An 8 m brook (four nav cells, z in [-4, 4)), the full width of the land.
  const s = land({ height: () => 0, water: (_x, z) => (Math.abs(z) < 4 ? -0.2 : undefined), depth: 0.7 });
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  put(s, 'garage', -10, -28, Math.PI);
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -20, z: -14 }, { x: -20, z: 0 }, { x: -20, z: 14 }] }).ok);
  assert.equal(s.bridges.length, 1);
  for (const z of [-3, -1, 1, 3]) assert.ok(passable(navFor(s), navCellOf(-20, z)), 'the bridge carries it');
  // The bridge comes up under two carts: one a cell from the south bank, one two cells in.
  assert.ok(apply(s, { type: 'removeTrack', id: s.tracks[0].id }).ok);
  const nav = navFor(s);
  for (const z of [-3, -1, 1, 3]) assert.ok(!passable(nav, navCellOf(-20, z)), 'water again');
  const home = { x: -10, z: -36 };
  // Two cells in: every way out crosses another cell of the brook, so there's none.
  assert.equal(findPath(s, { x: -20, z: -1 }, home), null, 'stranded, not cutting across the water');
  assert.equal(reachOf(s, { x: -20, z: -1 }, 'start'), -1);
  // A cell from the bank: it steps straight out onto the south bank, over no other water.
  const out = must(findPath(s, { x: -20, z: -3 }, home), 'a way out');
  for (const c of cellsOnPath(out)) assert.ok(passable(nav, c), `crosses blocked cell ${c} on ${JSON.stringify(out)}`);
  // Driven by the sim, the stranded cart never moves through the brook either.
  const cart = s.sim.carts[0];
  cart.x = -20; cart.z = -1; cart.state = 'idle'; cart.path = []; cart.job = null;
  put(s, 'silo', 12, -24);
  assert.ok(apply(s, { type: 'paintField', crop: 'beans', points: [{ x: 0, z: -28 }], radius: 3 }).ok);
  s.fields[0].harvestReady = 4;
  assert.match(diagnoseIdleCarts(s) ?? '', /bridge/);
  const start = navCellOf(cart.x, cart.z);
  for (let k = 0; k < 60; k++) {
    stepSim(s, 1, breezy);
    const c = navCellOf(cart.x, cart.z);
    assert.ok(c === start || passable(navFor(s), c), `in the water at (${cart.x.toFixed(2)}, ${cart.z.toFixed(2)})`);
  }
  assert.match(cart.jobDesc, /no way back to the Garage/);
});

test('a short Garage move onto its parked cart sets the cart out before the new door, where it charges', () => {
  const s = sandbox();
  const garage = put(s, 'garage', -10, -28, Math.PI);
  const cart = s.sim.carts[0], g = () => must(s.things.find((t) => t.id === garage), 'the garage');
  cart.battery = 0.3;
  cart.state = 'charging';
  run(s, 0.3);
  assert.ok(atGarage(s, cart) && cart.battery > 0.3, 'parked and charging');
  const old = { x: cart.x, z: cart.z };
  // A 3.5 m move toward its door: its new walls stand where the cart is parked.
  const r = apply(s, { type: 'move', id: garage, x: -10, z: -31.5 });
  assert.ok(r.ok && r.value.carts, 'the move moves the cart');
  assert.ok(!passable(navFor(s), navCellOf(old.x, old.z)), 'the old parking spot is inside the Garage now');
  // Inside the walls, by the dock, isn't at the Garage.
  const dock = must(dockOf(s, g()), 'its dock');
  assert.ok(Math.hypot(dock.x - old.x, dock.z - old.z) <= DOCK_RADIUS && !atGarage(s, old));
  assert.ok(passable(navFor(s), navCellOf(cart.x, cart.z)), `set out on open ground (${cart.x.toFixed(1)}, ${cart.z.toFixed(1)})`);
  assert.ok(atGarage(s, cart));
  const there = cart.battery;
  for (let k = 0; k < 15; k++) {
    stepSim(s, 1, breezy);
    assert.ok(passable(navFor(s), navCellOf(cart.x, cart.z)), 'never inside a wall');
  }
  assert.equal(cart.state, 'charging');
  assert.ok(cart.battery > there, 'charging before the new door');
  assert.equal(demandOf(s, g(), rt(s, garage), 12), GARAGE_CHARGE_W);
});

test('a field split by an unbridged barrier is loaded from the side a cart can reach, even with a track on the other', () => {
  // A 1 m line of water the width of the land (z in [0, 1)), but for a 1 m gap at x in [0, 1): a field grows through the
  // gap as one patch, but carts (on a 2 m grid) can't cross anywhere.
  const s = land({
    height: () => 0,
    water: (x, z) => (z >= 0 && z < 1 && !(x >= 0 && x < 1) ? -0.02 : undefined),
    depth: 0.05,
  });
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  put(s, 'garage', -10, -28, Math.PI);
  const silo = put(s, 'silo', 6, -24);
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: 0.5, z: 0.5 }], radius: 4 }).ok);
  assert.equal(s.fields.length, 1, 'one field, through the gap');
  const field = s.fields[0];
  field.harvestReady = 4;
  // A track on the far side.
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -30, z: 10 }, { x: 0, z: 10 }, { x: 30, z: 10 }] }).ok);
  const cart = s.sim.carts[0], near = reachOf(s, cart, 'start');
  assert.notEqual(near, reachOf(s, { x: 0, z: 10 }, 'goal'), 'the water parts the two sides');
  const far = must(fieldEdge(s, field), 'its loading spot by the track');
  assert.ok(far.z > 0, 'nearest the track: the far side');
  const here = must(fieldEdge(s, field, near), 'a loading spot on the cart\'s side');
  assert.ok(here.z < 0 && reachOf(s, here, 'goal') === near);
  run(s, 2, () => countOf(rt(s, silo).outputs, 'wheat') > 0);
  assert.ok(countOf(rt(s, silo).outputs, 'wheat') > 0, `harvested from the near side: ${cart.jobDesc}`);
});

test('a building facing a narrow unbridged brook is loaded from a side on its own bank, never across the water', () => {
  // A 1 m line of water the width of the land (z in [3, 4)), just before the Silo's door.
  const s = land({ height: () => 0, water: (_x, z) => (z >= 3 && z < 4 ? -0.02 : undefined), depth: 0.05 });
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  put(s, 'garage', -10, -28, Math.PI);
  const silo = put(s, 'silo', 0, -0.8);
  const wheat = ripeField(s, 'wheat', -30, -20, 4);
  const cart = s.sim.carts[0], near = reachOf(s, cart, 'start');
  assert.notEqual(near, reachOf(s, { x: 0, z: 6 }, 'goal'), 'the water parts the two banks');
  // Its door faces the water: it docks on its own bank, not on the far one.
  const t = must(s.things.find((v) => v.id === silo), 'the silo');
  const dock = must(dockOf(s, t), 'its dock');
  assert.ok(dock.z < 3 && reachOf(s, dock, 'goal') === near, `docks on its own bank: (${dock.x.toFixed(2)}, ${dock.z.toFixed(2)})`);
  assert.deepEqual(dockOf(s, t, near), dock);
  assert.equal(dockOf(s, t, reachOf(s, { x: 0, z: 6 }, 'goal')), null, 'no side of it on the far bank');
  run(s, 2, () => countOf(rt(s, silo).outputs, 'wheat') > 0);
  assert.ok(countOf(rt(s, silo).outputs, 'wheat') > 0, `harvested to the Silo: ${cart.jobDesc}`);
  assert.ok(must(s.fields.find((f) => f.id === wheat), 'the field').harvestReady < 4);
});

test('idle carts explain missing storage, disconnected fields and full storage', () => {
  const s = sandbox();
  put(s, 'garage', -15, -25);
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: -15, z: 25 }], radius: 3 }).ok);
  s.fields[0].harvestReady = 4;
  assert.match(diagnoseIdleCarts(s) ?? '', /Silo or Mill/);
  const silo = put(s, 'silo', 10, -25);
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: -32, z: -25 }], radius: 3 }).ok);
  for (const f of s.fields) f.harvestReady = 4;
  assert.equal(s.fields.length, 2);
  assert.ok(apply(s, { type: 'buyCart' }).ok);
  const busy = s.sim.carts[1];
  busy.state = 'toPickup';
  busy.job = { from: { kind: 'field', id: s.fields.find(f => f.bounds.z0 < s.grid.nz / 2)!.id },
    to: { kind: 'thing', id: silo }, good: 'wheat', count: 2, priority: 3 };
  assert.match(diagnoseIdleCarts(s) ?? '', /bridge/);
  busy.job = null;
  busy.state = 'idle';
  assert.match(diagnoseIdleCarts(s) ?? '', /bridge/);
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: 0, z: -12 }, { x: 0, z: 12 }] }).ok);
  assert.equal(diagnoseIdleCarts(s), null);
  rt(s, silo).outputs.wheat = SILO_GOOD_CAP;
  assert.match(diagnoseIdleCarts(s) ?? '', /no room for wheat/);
});

// --- Fields are no road (#317) -----------------------------------------------------------------------------------------

/** Whether a path's points (sampled every 0.25 m) ever cross a planted field's ground, but within `skip` m of its ends. */
function crossesField(s: GameState, path: Point2[], skip = 0): boolean {
  const nav = navFor(s), first = path[0], last = path[path.length - 1];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.25));
    for (let k = 0; k <= n; k++) {
      const p = { x: a.x + ((b.x - a.x) * k) / n, z: a.z + ((b.z - a.z) * k) / n };
      if (Math.hypot(p.x - first.x, p.z - first.z) < skip || Math.hypot(p.x - last.x, p.z - last.z) < skip) continue;
      if (nav.field[navCellOf(p.x, p.z)] === 1) return true;
    }
  }
  return false;
}
const outline = (x0: number, z0: number, x1: number, z1: number): Point2[] => [{ x: x0, z: z0 }, { x: x1, z: z0 }, { x: x1, z: z1 }, { x: x0, z: z1 }];

test('carts drive round a planted field, never through it, though the way round is longer', () => {
  const s = sandbox(), from = { x: -30, z: -30 }, to = { x: 30, z: -30 };
  const open = must(findPath(s, from, to), 'a way over the open meadow');
  assert.ok(open.length <= 3, 'straight over the meadow');
  assert.ok(apply(s, { type: 'paintFieldPolygon', crop: 'wheat', points: outline(-10, -44, 10, -16) }).ok);
  const nav = navFor(s);
  assert.equal(nav.cost[navCellOf(0, -30)], GROUND.field.cost, 'the field is field ground');
  assert.ok(GROUND.field.cost > GROUND.mud.cost && GROUND.mud.cost > GROUND.meadow.cost);
  assert.ok(GROUND.field.speed < GROUND.meadow.speed && GROUND.field.drain > GROUND.meadow.drain);
  const round = must(findPath(s, from, to), 'a way round the field');
  assert.ok(!crossesField(s, round), `never over the crops: ${JSON.stringify(round)}`);
  assert.ok(onTrackShare(s, round).length > onTrackShare(s, open).length + 4, 'the longer way round');
  // Hemmed in by a hedge to the north, west and south, the only way out from beside it is over the crops: then it crosses.
  // (Corners every 2 m along each side, so the hedge's curve keeps to the lines.)
  const along = (a: Point2, b: Point2) => {
    const n = Math.round(Math.hypot(b.x - a.x, b.z - a.z) / 2);
    return Array.from({ length: n }, (_, k) => ({ x: a.x + ((b.x - a.x) * k) / n, z: a.z + ((b.z - a.z) * k) / n }));
  };
  const corners = [{ x: 12, z: -14 }, { x: -16, z: -14 }, { x: -16, z: -46 }, { x: 12, z: -46 }];
  const hedge = [...along(corners[0], corners[1]), ...along(corners[1], corners[2]), ...along(corners[2], corners[3]), corners[3]];
  assert.ok(apply(s, { type: 'addHedge', points: hedge }).ok);
  const through = must(findPath(s, { x: -13, z: -30 }, { x: 30, z: -30 }), 'the one way out: over the crops');
  assert.ok(crossesField(s, through));
});

test('carts load at a field from its edge, by the track running beside it', () => {
  const s = sandbox();
  put(s, 'garage', -30, -28, Math.PI);
  assert.ok(apply(s, { type: 'paintFieldPolygon', crop: 'wheat', points: outline(-10, -40, 10, -20) }).ok);
  const f = s.fields[0];
  // No track: the edge nearest the Garage, outside the crops.
  const nav = navFor(s), edge = must(fieldEdge(s, f), 'a loading spot');
  const i = navCellOf(edge.x, edge.z);
  assert.equal(nav.field[i], 0, 'not among the crops');
  assert.ok(passable(nav, i));
  assert.ok(edge.x < -10 && edge.x > -14, `on the field's west side, by the Garage: ${edge.x}, ${edge.z}`);
  // A track along its south side: carts load on it.
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -30, z: -42 }, { x: 0, z: -42 }, { x: 30, z: -42 }] }).ok);
  const nav2 = navFor(s), onTrack = must(fieldEdge(s, f), 'a loading spot by the track');
  assert.equal(nav2.track[navCellOf(onTrack.x, onTrack.z)], 1, `on the track: ${onTrack.x}, ${onTrack.z}`);
  assert.equal(nav2.field[navCellOf(onTrack.x, onTrack.z)], 0);
  assert.ok(onTrack.z < -40, 'on the south side');
  // A cart harvests it without once driving over the crops.
  const silo = put(s, 'silo', 30, -28);
  f.harvestReady = 4;
  for (let k = 0; k < 4 * 30 && countOf(rt(s, silo).outputs, 'wheat') === 0; k++) {
    stepSim(s, 1, breezy);
    for (const c of s.sim.carts) assert.equal(navFor(s).field[navCellOf(c.x, c.z)], 0, `cart ${c.id} at ${c.x.toFixed(1)}, ${c.z.toFixed(1)}: ${c.jobDesc}`);
  }
  assert.ok(countOf(rt(s, silo).outputs, 'wheat') > 0, 'harvested into the Silo');
});

test('a field walled in on every side is loaded from among its crops, and only by a cart that can reach it', () => {
  // A 2 m moat round a square island (|x|, |z| < 6): the field fills the island.
  const s = land({
    height: () => 0,
    water: (x, z) => { const r = Math.max(Math.abs(x), Math.abs(z)); return r >= 6 && r < 8 ? -0.02 : undefined; },
    depth: 0.05,
  });
  s.sim.supplies = sandboxSupplies();
  put(s, 'garage', -30, -28, Math.PI);
  assert.ok(apply(s, { type: 'paintFieldPolygon', crop: 'wheat', points: outline(-6, -6, 6, 6) }).ok);
  const f = s.fields[0], nav = navFor(s);
  const inside = must(fieldEdge(s, f), 'a loading spot on the island');
  assert.equal(nav.field[navCellOf(inside.x, inside.z)], 1, 'among the crops: there is no edge to stand on');
  assert.ok(Math.abs(inside.x) < 6 && Math.abs(inside.z) < 6);
  const cart = s.sim.carts[0];
  assert.equal(fieldEdge(s, f, reachOf(s, cart, 'start')), null, 'no spot the Garage\'s cart can reach');
});

test('exact endpoint rewrites never steer a cart through a crop cell A* skipped', () => {
  const s = land({ height: () => 0 });
  assert.ok(apply(s, { type: 'paintFieldPolygon', crop: 'wheat', points: outline(0, 2, 4, 4) }).ok);
  const path = must(findPath(s, { x: 1, z: 1 }, { x: 2.1, z: 3.9 }), 'path to crop goal');
  const skipped = navCellOf(1, 3);
  assert.equal(navFor(s).field[skipped], 1, '(1, 3) is inside the crops');
  assert.ok(!cellsOnPath(path).has(skipped), `path ${JSON.stringify(path)} must not cut across crop cell (1, 3)`);
});
