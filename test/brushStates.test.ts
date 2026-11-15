// How the brush3d world reads a building's moving parts and its state from the game (#205, src/world/brush/states.ts).
// How the renderer turns a part is brush3d's own check (brush3d/tools/parts.ts, run by brush3d.test.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place } from '../src/game/build.ts';
import { POWER, type BuildingId } from '../src/game/data.ts';
import { TERRAIN } from '../src/game/map.ts';
import { runtimeOf } from '../src/game/runtime.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { newGame, type BuildingOf, type GameState, type Status } from '../src/game/state.ts';
import { PLAIN } from '../src/game/ground.ts';
import { chargeRings, isRunning, partsLook, stateOf } from '../src/world/brush/states.ts';

function valley(): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events: [],
    terrain: { ground: PLAIN, water: 'river', forest: 0, rock: 0, relief: 0 },
  };
  const s = newGame(sc);
  s.map.terrain.fill(TERRAIN.grass);
  s.map.corner.fill(0);
  return s;
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

test('a battery lights a ring a quarter, the first at any charge', () => {
  const c = POWER.battery.capacity;
  assert.equal(chargeRings(0), 0);
  assert.equal(chargeRings(c * 0.01), 0);
  assert.equal(chargeRings(c * 0.05), 1);
  assert.equal(chargeRings(c * 0.25), 1);
  assert.equal(chargeRings(c * 0.3), 2);
  assert.equal(chargeRings(c * 0.74), 3);
  assert.equal(chargeRings(c), 4);
});

test('the five states: working, idle, unpowered, weather (building: none yet)', () => {
  const s = valley(), mill = put(s, 'mill', 8, 8), sprinkler = put(s, 'sprinkler', 14, 8);
  const as = (b: typeof mill | typeof sprinkler, status: Status) => { b.status = status; return stateOf(b); };
  mill.progress = null;
  assert.equal(as(mill, 'idle'), 'idle');
  assert.equal(as(mill, 'input'), 'idle');
  assert.equal(as(mill, 'blocked'), 'idle');
  mill.progress = 3;
  assert.equal(as(mill, 'ok'), 'working');
  // A machine keeps its batch through a power cut, but it isn't working.
  assert.equal(as(mill, 'power'), 'unpowered');
  assert.equal(isRunning(mill), false);
  assert.equal(as(mill, 'nolink'), 'unpowered');
  assert.equal(as(mill, 'lowpower'), 'unpowered');
  assert.equal(as(sprinkler, 'ok'), 'working');
  assert.equal(as(sprinkler, 'frost'), 'weather');
  assert.equal(as(sprinkler, 'cold'), 'weather');
  assert.equal(as(sprinkler, 'rain'), 'idle');
});

test("a machine's parts turn while it works, slower on part of its power", () => {
  const s = valley(), mill = put(s, 'mill', 8, 8);
  mill.status = 'ok'; mill.progress = 2;
  runtimeOf(s).shares = new Map([[mill.id, 0.5]]);
  assert.deepEqual(partsLook(s, mill), { pace: 0.5, running: true });
  runtimeOf(s).shares = new Map([[mill.id, 1]]);
  assert.equal(partsLook(s, mill).pace, 1);
  mill.progress = null; mill.status = 'idle';
  assert.deepEqual(partsLook(s, mill), { pace: 0, running: false });
  mill.progress = 2; mill.status = 'power';
  assert.deepEqual(partsLook(s, mill), { pace: 0, running: false });
});

test("a battery's parts are its rings; a turbine turns with the wind, linked or not", () => {
  const s = valley(), battery = put(s, 'battery', 8, 8), turbine = put(s, 'turbine', 14, 14);
  battery.charge = POWER.battery.capacity / 2;
  assert.equal(partsLook(s, battery).charge, 2);
  assert.equal(partsLook(s, battery).pace, 0);
  turbine.status = 'nolink';
  const look = partsLook(s, turbine);
  assert.ok(Number.isFinite(look.pace) && look.pace >= 0, `${look.pace}`);
});
