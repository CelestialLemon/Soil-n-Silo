import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, CLOCK_JUMPED, type GameState, must, resetSteadyOnClockJump, sandboxSupplies, SETUP_CHANGED, type SimEvent, stepSim,
  STEADY_HOURS, type ThingKind,
} from '../src/game/index.ts';
import { flatLand } from './helpers.ts';

const put = (s: GameState, kind: ThingKind, x: number, z: number, yaw = 0) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};
/** A steady breeze: the turbines carry the homestead day and night. */
const breezy = { windSpeed: 12, cloudCover: 0 };

function run(s: GameState, hours: number): SimEvent[] {
  const events: SimEvent[] = [];
  for (let k = 0; k < hours * 30; k++) events.push(...stepSim(s, 1, breezy).events);
  return events;
}

/** A running homestead (a Farmhouse, a Garage and a Mill) on turbines, its Steady Homestead hours counting. */
function homestead() {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  put(s, 'farmhouse', -10, -16);
  const garage = put(s, 'garage', 6, -16, Math.PI);
  put(s, 'mill', -10, -32, Math.PI);
  for (const x of [-18, -2, 14]) put(s, 'turbine', x, -24);
  run(s, 3);
  const h = s.sim.brief.steadyHomestead;
  assert.ok(h.running && h.hours > 2.5, `the hours count (${h.hours.toFixed(2)})`);
  return { s, h, garage };
}

test('taking down the Garage mid-run starts an unfinished Steady Homestead over, and says why', () => {
  const { s, h, garage } = homestead();
  assert.ok(apply(s, { type: 'remove', id: garage }).ok);
  const events = run(s, 0.1);
  assert.equal(h.hours, 0);
  assert.equal(h.progress, 0);
  assert.ok(!h.running);
  assert.equal(h.resetReason, SETUP_CHANGED);
  assert.deepEqual(events.filter((e) => e.type === 'steadyReset').map((e) => e.message), [SETUP_CHANGED], 'said once');
  // Built again, it counts from zero.
  put(s, 'garage', 6, -16, Math.PI);
  run(s, 1);
  assert.ok(h.hours > 0.9 && h.hours < 1.1, `${h.hours}`);
});

test('jumping the clock starts an unfinished Steady Homestead over; a filled seal stays filled', () => {
  const { s, h } = homestead();
  assert.ok(resetSteadyOnClockJump(s));
  assert.equal(h.hours, 0);
  assert.equal(h.progress, 0);
  assert.equal(h.resetReason, CLOCK_JUMPED);
  assert.ok(!resetSteadyOnClockJump(s), 'nothing to start over');
  // Filled, it stays filled whatever the clock does, and the setup changing doesn't empty it either.
  h.hours = STEADY_HOURS; h.progress = 1; h.done = true;
  assert.ok(!resetSteadyOnClockJump(s));
  assert.ok(h.done && h.hours === STEADY_HOURS && h.progress === 1);
  assert.ok(apply(s, { type: 'remove', id: must(s.things.find((t) => t.kind === 'garage'), 'the garage').id }).ok);
  run(s, 0.1);
  assert.ok(h.done && h.hours === STEADY_HOURS && h.progress === 1);
});
