import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addStop, buyTruck, newRoute, place, setTruckRoute } from '../src/game/build.ts';
import type { BuildingId } from '../src/game/data.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type GameState } from '../src/game/state.ts';

// Fuzzing the save reader: whatever the string, deserialize returns a Result and never throws, and a save it accepts runs.

/** A small game with a few buildings, a route with a truck, and some time played. */
function played(): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'fuzz', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 },
  };
  const s = newGame(sc);
  const put = (type: BuildingId, x: number, y: number) => {
    const r = place(s, type, x, y, 0);
    if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
    return r.value.building;
  };
  const field = put('field', 8, 18), mill = put('mill', 12, 20), silo = put('silo', 8, 24);
  put('pylon', 20, 4); put('battery', 21, 4); put('sapling', 3, 3);
  const g = put('garage', 16, 4);
  const truck = buyTruck(s, g);
  if (!truck.ok) assert.fail(truck.error);
  const r = newRoute(s);
  for (const b of [field, mill, silo]) assert.ok(addStop(s, r, b).ok);
  setTruckRoute(s, truck.value.truck, r);
  advance(s, 20);
  return s;
}

/** mulberry32: a small seeded generator, so the same mutants come every run. */
function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Json = Record<string, unknown>;
const isNode = (v: unknown): v is Json => !!v && typeof v === 'object';

/** The save with one value replaced at a random path (walking down from the root, stopping at a leaf or by chance). */
function mutant(base: unknown, rnd: () => number): { json: string; what: string } {
  const root = structuredClone(base) as Json;
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
  let parent: Json = root, key = '';
  const path: string[] = [];
  for (;;) {
    const keys = Object.keys(parent);
    if (!keys.length) break;
    key = pick(keys);
    path.push(key);
    const next = parent[key];
    if (!isNode(next) || !Object.keys(next).length || rnd() < 0.15) break;
    parent = next;
  }
  const wrong = [null, undefined, 'x', '', 0, 1, -1, 1.5, NaN, Infinity, 1e12, -1e12, 9999, {}, [], [1], { a: 1 }, true, false];
  const value = pick(wrong);
  if (value === undefined) delete parent[key];
  else parent[key] = value;
  return { json: JSON.stringify(root), what: `${path.join('.')} = ${String(JSON.stringify(value))}` };
}

const MUTANTS = 600;

test('a mutated save is refused, or loads and runs; the reader never throws', () => {
  const base = JSON.parse(serialize(played()));
  const rnd = prng(20240607);
  let accepted = 0;
  for (let i = 0; i < MUTANTS; i++) {
    const { json, what } = mutant(base, rnd);
    let r;
    try { r = deserialize(json); } catch (e) { assert.fail(`deserialize threw for ${what}: ${String(e)}`); }
    if (!r.ok) continue;
    accepted++;
    try { advance(r.value, 5); } catch (e) { assert.fail(`an accepted save crashed when run, for ${what}: ${String(e)}`); }
  }
  assert.ok(accepted < MUTANTS, 'some mutants must be refused');
});

test('regression: a save with a huge time carry is refused, not simulated for ever', () => {
  const s = JSON.parse(serialize(played()));
  for (const carry of [1e12, -1e12]) {
    s.carry = carry;
    assert.equal(deserialize(JSON.stringify(s)).ok, false, String(carry));
  }
});

test('non-JSON and edge inputs are refused with a reason', () => {
  const full = serialize(played());
  const deep = '['.repeat(100_000) + ']'.repeat(100_000);
  const deepObj = '{"a":'.repeat(50_000) + '1' + '}'.repeat(50_000);
  for (const input of ['', 'null', '[]', '{}', '0', '"x"', 'true', 'nope', full.slice(0, full.length >> 1), full.slice(0, -1), deep, deepObj,
    '{"version":4}', '{"version":4,"scenario":null}', '{"version":4,"scenario":{"goals":null}}']) {
    let r;
    try { r = deserialize(input); } catch (e) { assert.fail(`deserialize threw for ${input.slice(0, 40)}: ${String(e)}`); }
    assert.equal(r.ok, false, input.slice(0, 40));
    if (!r.ok) assert.ok(r.error.length > 0);
  }
  assert.equal(deserialize(null).ok, false);
  assert.equal(deserialize(full).ok, true);
});

test('regression: a non-numeric carry is refused, not thrown on', () => {
  const s = JSON.parse(serialize(played())) as Json;
  s.carry = { toString: null };
  let r;
  try { r = deserialize(JSON.stringify(s)); } catch (e) { assert.fail(`deserialize threw: ${String(e)}`); }
  assert.equal(r.ok, false);
});

test('a save whose map size disagrees with its commission, or is fractional, is refused', () => {
  const good = JSON.parse(serialize(played())) as GameState;
  assert.ok(deserialize(JSON.stringify(good)).ok);
  for (const [what, edit] of [
    ['fractional width', (j: GameState) => { j.scenario.width = 30.5; }],
    ['width unlike the map', (j: GameState) => { j.scenario.width = 31; }],
  ] as const) {
    const j = structuredClone(good);
    edit(j);
    assert.equal(deserialize(JSON.stringify(j)).ok, false, what);
  }
});
