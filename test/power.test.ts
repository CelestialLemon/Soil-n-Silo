import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, CATALOG, type GameState, must, type PowerMode, type ThingKind } from '../src/game/index.ts';
import { flatLand } from './helpers.ts';

const put = (s: GameState, kind: ThingKind, x: number, z: number) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw: 0 });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};

/** A solar canopy with the farmhouse in reach, and the mill out of it (loads don't wire to each other). */
function homestead() {
  const s = flatLand();
  const solar = put(s, 'solar', -40, -30), house = put(s, 'farmhouse', -28, -30), mill = put(s, 'mill', -16, -16);
  return { s, solar, house, mill };
}

test('pylons mode: wires join what is in reach, along the shortest spans; a pylon carries power on', () => {
  const { s, solar, house, mill } = homestead();
  assert.equal(s.powerMode, 'pylons');
  assert.deepEqual(s.power.powered, [solar, house]);
  assert.ok(!s.power.powered.includes(mill), 'the mill is out of reach');
  assert.equal(s.power.spans.length, 1);
  const w = s.power.spans[0];
  assert.deepEqual([w.from, w.to], [solar, house]);
  assert.ok(Math.abs(w.a.y - CATALOG.solar.wireY) < 1e-6 && Math.abs(w.b.y - CATALOG.farmhouse.wireY) < 1e-6, 'wires hang from their tops');
  const placed = apply(s, { type: 'place', kind: 'pylon', x: -22, z: -20, yaw: 0 });
  assert.ok(placed.ok && placed.value.powerChanged);
  const pylon = must(placed.value.created, 'the pylon');
  assert.deepEqual(s.power.powered, [solar, house, mill, pylon]);
  assert.deepEqual(s.power.connected, [solar, house, mill, pylon]);
  assert.equal(s.power.spans.length, 3, 'a tree: one wire fewer than its poles');
  assert.equal(s.power.radii.length, 0);
  // Take the pylon away and the mill goes dark again.
  assert.ok(apply(s, { type: 'remove', id: pylon }).ok);
  assert.ok(!s.power.powered.includes(mill));
});

test('wireless mode: fields, not wires; relays carry power on, pylons do nothing', () => {
  const { s, solar, house, mill } = homestead();
  const pylon = put(s, 'pylon', -22, -20);
  const r = apply(s, { type: 'setPowerMode', mode: 'wireless' });
  assert.ok(r.ok && r.value.powerChanged);
  assert.equal(s.power.mode, 'wireless');
  assert.equal(s.power.spans.length, 0);
  assert.deepEqual(s.power.radii.map((v) => v.id), [solar]);
  assert.equal(s.power.radii[0].radius, CATALOG.solar.powerRange);
  assert.deepEqual(s.power.powered, [solar, house]);
  assert.ok(!s.power.powered.includes(pylon) && !s.power.powered.includes(mill));
  // A relay within reach of the canopy, with the mill inside its field.
  const relay = put(s, 'relay', -29, -20.5);
  assert.deepEqual(s.power.powered, [solar, house, mill, relay]);
  assert.ok(s.power.radii.every((v) => v.powered));
  // Back to pylons: the relay is no pole, the pylon wires the mill.
  assert.ok(apply(s, { type: 'setPowerMode', mode: 'pylons' }).ok);
  assert.deepEqual(s.power.powered, [solar, house, mill, pylon]);
  const again = apply(s, { type: 'setPowerMode', mode: 'pylons' });
  assert.ok(again.ok && !again.value.powerChanged, 'no change, nothing to redraw');
  assert.ok(!apply(s, { type: 'setPowerMode', mode: 'laser' as PowerMode }).ok);
  assert.equal(s.powerMode, 'pylons');
});

test('nothing is powered without a source; a battery alone feeds its network', () => {
  const s = flatLand();
  const house = put(s, 'farmhouse', -28, -30), lantern = put(s, 'lantern', -34, -20);
  assert.deepEqual(s.power.powered, []);
  assert.deepEqual(s.power.connected, [], 'two loads never wire to each other');
  const battery = put(s, 'battery', -40, -30);
  assert.deepEqual(s.power.powered, [house, lantern, battery].sort((a, b) => a - b));
});
