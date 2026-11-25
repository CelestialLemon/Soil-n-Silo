import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, CLOCK_JUMPED, FLOODED_FIELDS, FROSTED_FIELDS, type GameState, GREENHOUSE_FULL, homesteadRuns, must, OUTPUT_CAP, refreshFlood,
  resetSteadyOnClockJump, runtimeOf, sandboxSupplies, SETUP_CHANGED, type SimEvent, stallReason, stepSim, STEADY_HOURS, type ThingKind,
} from '../src/game/index.ts';
import { fieldAt, flatLand } from './helpers.ts';

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

/** The buildings that make a homestead run (a Farmhouse, a Garage and a Mill) on turbines: no crops yet. */
function buildings() {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  s.sim.weatherOverride = 'clear';
  put(s, 'farmhouse', -10, -16);
  const garage = put(s, 'garage', 6, -16, Math.PI);
  put(s, 'mill', -10, -32, Math.PI);
  for (const x of [-18, -2, 14]) put(s, 'turbine', x, -24);
  return { s, garage };
}

/** A running homestead (those buildings and a field of beans by the brook), its Steady Homestead hours counting. */
function homestead() {
  const { s, garage } = buildings();
  fieldAt(s, 'beans', -20, -5, 3);
  run(s, 3);
  const h = s.sim.brief.steadyHomestead;
  assert.ok(h.running && h.hours > 2.5, `the hours count (${h.hours.toFixed(2)})`);
  return { s, h, garage };
}

test('taking down the Garage mid-run starts an unfinished Steady Homestead over, and says why', () => {
  const { s, h, garage } = homestead();
  const r = apply(s, { type: 'remove', id: garage });
  assert.ok(r.ok && r.value.steadyReset, 'the edit says so');
  const events = run(s, 0.1);
  assert.equal(h.hours, 0);
  assert.equal(h.progress, 0);
  assert.ok(!h.running);
  assert.equal(h.resetReason, SETUP_CHANGED);
  assert.deepEqual(events.filter((e) => e.type === 'steadyReset'), [], 'said once, by the edit, not again by the tick');
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

test('taking down and building again while paused still starts an unfinished Steady Homestead over', () => {
  const { s, h, garage } = homestead();
  const before = h.hours;
  // Paused: no tick runs between the teardown and the rebuild.
  const r = apply(s, { type: 'remove', id: garage });
  assert.ok(r.ok && r.value.steadyReset);
  assert.equal(h.hours, 0);
  assert.equal(h.progress, 0);
  assert.equal(h.resetReason, SETUP_CHANGED);
  put(s, 'garage', 6, -16, Math.PI);
  run(s, 0.5);
  assert.ok(h.running);
  assert.ok(h.hours > 0.4 && h.hours < 0.6, `counts from zero (${h.hours.toFixed(2)}), not on from ${before.toFixed(2)}`);
  // The last workshop too; a building that doesn't make it run (a Silo) doesn't.
  const silo = put(s, 'silo', 22, -32);
  const kept = h.hours;
  const quiet = apply(s, { type: 'remove', id: silo });
  assert.ok(quiet.ok && !quiet.value.steadyReset);
  assert.equal(h.hours, kept);
  const mill = must(s.things.find((t) => t.kind === 'mill'), 'the mill');
  const gone = apply(s, { type: 'remove', id: mill.id });
  assert.ok(gone.ok && gone.value.steadyReset);
  put(s, 'mill', -10, -32, Math.PI);
  assert.equal(h.hours, 0);
});

test('a homestead with nothing growing (no field, no Greenhouse) never earns Steady Homestead', () => {
  const { s } = buildings();
  const h = s.sim.brief.steadyHomestead;
  assert.ok(!homesteadRuns(s));
  run(s, 6);
  assert.ok(!h.running, 'not running');
  assert.equal(h.hours, 0, 'no hours with the farm shut down');
  // A Heated Greenhouse is a crop growing: it runs (a winter valley under glass).
  put(s, 'greenhouse', 8, -36);
  assert.ok(homesteadRuns(s));
  run(s, 1);
  assert.ok(h.running && h.hours > 0.9, `${h.hours}`);
});

test('erasing the last field starts Steady Homestead over: it can\'t clear the dry pause', () => {
  const { s } = buildings();
  const h = s.sim.brief.steadyHomestead;
  // A dry upland field: the homestead runs, then pauses once it's stood parched past the grace hours.
  const field = fieldAt(s, 'wheat', 30, -50, 3);
  field.growth = 0.2;
  run(s, 8);
  assert.ok(h.paused && h.hours > 0, `paused at ${h.hours.toFixed(2)} h`);
  const r = apply(s, { type: 'eraseField', points: [{ x: 30, z: -50 }], radius: 5 });
  assert.ok(r.ok && r.value.steadyReset, 'erasing the last field says so');
  assert.equal(s.fields.length, 0);
  assert.equal(h.hours, 0);
  assert.equal(h.resetReason, SETUP_CHANGED);
  run(s, 2);
  assert.ok(!h.running);
  assert.equal(h.hours, 0, 'no hours count with no field');
});

test('Steady Homestead pauses while every field stands flooded, and goes on once the water recedes', () => {
  const { s, h } = homestead();
  const field = must(s.fields[0], 'the field');
  s.sim.weather.floodSurge = 0.38;
  assert.ok(refreshFlood(s));
  assert.ok(field.flooded, 'the field by the brook floods');
  const held = h.hours;
  run(s, 1);
  // Read afresh each time (an assertion narrows the field's type for the rest of the test).
  const reason = (): string => h.pauseReason;
  assert.ok(h.paused);
  assert.equal(reason(), FLOODED_FIELDS);
  assert.equal(h.hours, held, 'no hours while flooded');
  s.sim.weather.floodSurge = 0;
  s.sim.weather.soak = 0;
  assert.ok(refreshFlood(s));
  run(s, 1);
  assert.ok(!h.paused && reason() === '');
  assert.ok(h.hours > held + 0.9, 'counting again');
});

test('a full Heated Greenhouse with no field grows nothing: Steady Homestead pauses until a cart hauls its crop out', () => {
  const { s } = buildings();
  const h = s.sim.brief.steadyHomestead, gh = must(runtimeOf(s, put(s, 'greenhouse', 8, -36)), 'the greenhouse');
  // No cart to haul it out: it stands full.
  s.sim.carts = [];
  gh.outputs = { wheat: OUTPUT_CAP };
  run(s, 2);
  const reason = (): string => h.pauseReason;
  assert.ok(h.running && h.paused);
  assert.equal(reason(), GREENHOUSE_FULL);
  assert.equal(h.hours, 0, 'no hours while nothing grows');
  gh.outputs = {};
  run(s, 1);
  assert.ok(!h.paused && reason() === '');
  assert.ok(h.hours > 0.9, `counting once it grows again (${h.hours.toFixed(2)})`);
});

test('a lone bean field stalled by frost pauses Steady Homestead until it thaws, or a Heated Greenhouse grows on', () => {
  const { s, h } = homestead();
  const beans = must(s.fields[0], 'the beans');
  s.season = 'winter';
  s.climate = 'hard';
  s.sim.weatherOverride = 'blizzard';
  run(s, 0.5);
  assert.ok(beans.frosted, 'the beans stand frosted');
  const held = h.hours, reason = (): string => h.pauseReason;
  run(s, 2);
  assert.ok(h.paused);
  assert.equal(reason(), FROSTED_FIELDS);
  assert.equal(h.hours, held, 'no hours while nothing grows');
  // A warm Heated Greenhouse grows on under its glass: the hours count again.
  put(s, 'greenhouse', 8, -36);
  run(s, 1);
  assert.ok(!h.paused && reason() === '');
  assert.ok(h.hours > held + 0.9, `counting under glass (${h.hours.toFixed(2)})`);
});

test('laying a track over the only field starts Steady Homestead over at once, so replanting before a tick keeps nothing', () => {
  const { s } = buildings();
  const h = s.sim.brief.steadyHomestead;
  fieldAt(s, 'beans', -20, -6, 1);
  run(s, 3);
  assert.ok(h.running && h.hours > 2.5, `the hours count (${h.hours.toFixed(2)})`);
  const r = apply(s, { type: 'addTrack', points: [{ x: -26, z: -6 }, { x: -20, z: -6 }, { x: -14, z: -6 }] });
  assert.ok(r.ok && r.value.steadyReset, 'the edit says so');
  assert.equal(s.fields.length, 0, 'the track took the field');
  assert.equal(h.hours, 0);
  assert.equal(h.resetReason, SETUP_CHANGED);
  // Replanted before the next tick: it counts from zero.
  fieldAt(s, 'beans', -20, 6, 3);
  run(s, 0.5);
  assert.ok(h.running && h.hours > 0.4 && h.hours < 0.6, `counts from zero (${h.hours.toFixed(2)})`);
});

test('Steady Homestead matches crop frost rules: hardy wheat counts in light frost, and a ripe field cannot mask a frosted one', () => {
  const { s } = buildings();
  const h = s.sim.brief.steadyHomestead;
  const wheat = fieldAt(s, 'wheat', -20, -6, 3);
  wheat.growth = 0.3;
  // Mild freezing air (-0.5°C, no snow): wheat is frosted visually but still grows down to -2°C, so Steady Homestead counts.
  s.sim.weatherOverride = 'frost';
  s.sim.hour = 3;
  s.sim.weather.tempC = -0.5;
  s.sim.weather.snowDepth = 0;
  assert.equal(stallReason(s, false), '');
  // Now add a ripe wheat field and a frost-stalled bean field: painting rebuilds s.fields, so mark all wheat fields ripe after.
  fieldAt(s, 'wheat', 20, -6, 3);
  fieldAt(s, 'beans', -20, 10, 3);
  for (const f of s.fields) {
    if (f.crop === 'wheat') f.harvestReady = 3;
    else f.growth = 0.3;
  }
  assert.equal(stallReason(s, false), FROSTED_FIELDS);
  assert.ok(h.hours === 0);
});
