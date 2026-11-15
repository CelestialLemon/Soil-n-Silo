// How the brush3d world reads a building's moving parts and its state from the game (#205, src/world/brush/states.ts), and
// how the renderer turns a part (brush3d/src/renderer/parts.ts): eased to the pace it's given, worked out from the time.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Parts, EASE } from '../brush3d/src/renderer/parts.ts';
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

test('a part eases to its pace, and a frame is the same however it was reached; a still shows it at rest', () => {
  const run = (times: number[]) => {
    const p = new Parts(), slot = p.add({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }, 2);
    // Told at 0, it starts turning from the next frame (here at 0 too).
    p.update(0); p.spin(slot, 1); p.update(0);
    for (const t of times) p.update(t);
    return (p.texture.image.data as Float32Array)[3];
  };
  assert.equal(run([]), 0);
  const smooth = run([0.5, 1, 1.5, 2, 2.5, 3]), once = run([3]);
  assert.ok(Math.abs(smooth - once) < 1e-5, `${smooth} vs ${once}`);
  // From rest, it turns speed × (t − EASE(1 − e^(−t/EASE))) by t.
  const t = 3, want = (2 * (t - EASE * (1 - Math.exp(-t / EASE)))) % (2 * Math.PI);
  assert.ok(Math.abs(once - want) < 1e-5, `${once} vs ${want}`);
  // Told to turn but drawn only once (a still), it stays at rest: it starts at the first frame after it's told.
  const p = new Parts(), slot = p.add({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 2);
  p.spin(slot, 1); p.update(5);
  assert.equal((p.texture.image.data as Float32Array)[3], 0);
});

test("a part is freed with its last mesh, and an old handle doesn't move the next part in its slot", () => {
  const p = new Parts(), a = p.add({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 1);
  p.hold([a]); p.hold([a]);
  const gen = p.generation(a);
  p.release([a]);
  assert.equal(p.count, 1);
  p.release([a]);
  assert.equal(p.count, 0);
  const b = p.add({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 1);
  assert.equal(b, a, 'the slot is taken again');
  assert.notEqual(p.generation(b), gen);
  // A slot no mesh took is freed at once.
  const c = p.add({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 1);
  p.hold([b]); p.unheld([b, c]);
  assert.equal(p.count, 1);
  // Hidden, a part is folded to its axle (texel 1's w).
  p.show(b, false);
  assert.equal((p.texture.image.data as Float32Array)[b * 16 + 7], 0);
});

test('seeking back draws a frame as it was, through changes of pace', () => {
  const p = new Parts(), slot = p.add({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 1);
  const at = (t: number) => { p.update(t); return (p.texture.image.data as Float32Array)[3]; };
  at(0); p.spin(slot, 1); at(0);
  const half = at(0.5);
  at(1); p.spin(slot, 2);
  const late = at(3);
  assert.ok(late !== 0);
  assert.equal(at(0.5), half);
  assert.equal(at(0), 0);
  // Forward again past where the pace changed: the same frames, the change of pace kept.
  assert.equal(at(3), late);
  assert.equal(at(1.5), at(1.5));
  at(0); assert.equal(at(3), late);
  // Told a new pace after a jump back, it takes a new course from there.
  at(0.5); p.spin(slot, 3);
  assert.notEqual(at(3), late);
});

test("a mesh's bounds hold its parts wherever they turn, and a pick sees them where they're drawn", async () => {
  const THREE = await import('three');
  const p = new Parts(), slot = p.add({ x: 0, y: 2, z: 0 }, { x: 0, y: 0, z: 1 }, 1);
  // A blade up from the axle at (0, 2, 0), and a post below it that doesn't turn.
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 2, 0, 0.1, 4, 0, -0.1, 4, 0, 0, 0, 0, 0.1, 1, 0, -0.1, 1, 0], 3));
  g.setAttribute('aPart', new THREE.Float32BufferAttribute([slot + 1, slot + 1, slot + 1, 0, 0, 0], 1));
  p.sweep(g);
  assert.ok(g.boundingBox!.min.y <= 0 && g.boundingBox!.max.y >= 4 && g.boundingBox!.min.x <= -2 && g.boundingBox!.max.x >= 2, 'swept round the axle');
  // Turned some way round, the blade with it (as the shader turns it), the post where it stands.
  p.update(0); p.spin(slot, 1); p.update(0); p.update(Math.PI + EASE);
  const d = p.texture.image.data as Float32Array, angle = d[3], posed = p.posed(g)!;
  assert.ok(Math.abs(posed.getY(1) - (2 + 0.1 * Math.sin(angle) + 2 * Math.cos(angle))) < 1e-4 && Math.abs(posed.getY(3)) < 1e-9);
  p.show(slot, false);
  assert.equal(p.posed(g)!.getY(1), 2, 'hidden, folded to its axle');
});
