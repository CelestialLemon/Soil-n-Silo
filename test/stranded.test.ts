import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addStop, buyTruck, newRoute, place, setTruckRoute } from '../src/game/build.ts';
import { POWER, type BuildingId } from '../src/game/data.ts';
import { TERRAIN } from '../src/game/map.ts';
import { distanceTo, isOpen, nearestOpen } from '../src/game/roads.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, tileIndex, type BuildingOf, type Dir, type GameState } from '../src/game/state.ts';
import { PLAIN } from '../src/game/ground.ts';

const W = 30;

/** A flat, open 30 × 30 map with the depot at 20,20. */
function plain(): GameState {
  const sc: Scenario = { ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: W, height: W, goals: [], par: 600, events: [], terrain: { ground: PLAIN, water: 'river', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.terrain.fill(TERRAIN.grass);
  s.map.corner.fill(0);
  s.map.depot.x = 20; s.map.depot.y = 20;
  s.buildings[0].x = 20; s.buildings[0].y = 20;
  return s;
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number, rot: Dir = 0): BuildingOf<K> {
  const r = place(s, type, x, y, rot);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

test('a truck put down off a tile that was built on lands where it can get out, not in a walled pocket beside it', () => {
  const s = plain();
  const a = put(s, 'silo', 5, 14), b = put(s, 'silo', 24, 14), g = put(s, 'garage', 5, 18);
  put(s, 'pylon', 8, 18);
  put(s, 'battery', 9, 18).charge = POWER.battery.capacity;
  // Pylons round the tile 12,10 on three sides: once 12,11 is built on, it is a pocket (a diagonal never squeezes between two corners).
  put(s, 'pylon', 11, 10); put(s, 'pylon', 13, 10); put(s, 'pylon', 12, 9);
  const bought = buyTruck(s, g);
  if (!bought.ok) assert.fail(bought.error);
  const truck = bought.value.truck, r = newRoute(s);
  addStop(s, r, a); addStop(s, r, b);
  setTruckRoute(s, truck, r);
  advance(s, 1);
  // The truck stands on 12,11, where the pocket's mouth is. 11,11 and 13,11 are as near to it as the pocket.
  truck.x = 12.5; truck.y = 11.5; truck.path = []; truck.phase = 'stuck';
  const stand = tileIndex(s, 12, 11), pocket = tileIndex(s, 12, 10);
  assert.ok(isOpen(s, 12, 10) && distanceTo(s, g, pocket) < Infinity, 'open ground before it is built on');
  put(s, 'pylon', 12, 11);
  assert.equal(isOpen(s, 12, 11), false);
  assert.equal(distanceTo(s, g, pocket), Infinity, 'the tile behind it is now a pocket');
  assert.notEqual(nearestOpen(s, 12, 11), null);
  advance(s, 1);
  const here = tileIndex(s, Math.floor(truck.x), Math.floor(truck.y));
  assert.notEqual(here, stand);
  assert.ok(distanceTo(s, g, here) < Infinity, `the truck stands at ${truck.x},${truck.y}, with no way home`);
  for (let k = 0; k < 200; k++) advance(s, 1);
  assert.notEqual(truck.phase, 'stuck', 'it has a way to its stops');
});

test('nearestOpen with a home skips tiles with no way there, and falls back to the nearest when none has one', () => {
  const s = plain();
  const g = put(s, 'garage', 5, 18);
  for (const [x, y] of [[11, 10], [13, 10], [12, 9], [12, 11]]) put(s, 'pylon', x, y);
  const pocket = tileIndex(s, 12, 10);
  assert.equal(nearestOpen(s, 12, 11), pocket, 'asking for no way out, the nearest of the tiles round the built-on one is the pocket');
  const out = nearestOpen(s, 12, 11, g);
  assert.ok(out !== null && out !== pocket && distanceTo(s, g, out) < Infinity);
  // A garage with no open tile beside it: no tile has a way there, so the nearest open tile will do.
  const walled = put(s, 'garage', 25, 25);
  for (let k = 0; k < 2; k++) for (const [x, y] of [[24, 25 + k], [27, 25 + k], [25 + k, 24], [25 + k, 27]]) put(s, 'pylon', x, y);
  assert.equal(nearestOpen(s, 12, 11, walled), pocket);
});
