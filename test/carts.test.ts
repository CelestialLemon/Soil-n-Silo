import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, type Cart, CART_LOW, CART_READY, countOf, findPath, GROUND, groundAt, type GameState, must, navCellOf, navFor, passable,
  type Point2, sandboxSupplies, type SimEvent, stepSim, type ThingKind,
} from '../src/game/index.ts';
import { flatLand } from './helpers.ts';

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
