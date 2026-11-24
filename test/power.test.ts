import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, CATALOG, type GameState, must, type ThingKind, THING_KINDS } from '../src/game/index.ts';
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

test('power is wireless: fields, not wires; a relay carries power on', () => {
  const { s, solar, house, mill } = homestead();
  assert.deepEqual(s.power.radii.map((v) => v.id), [solar]);
  assert.equal(s.power.radii[0].radius, CATALOG.solar.powerRange);
  assert.deepEqual(s.power.powered, [solar, house]);
  assert.ok(!s.power.powered.includes(mill), 'the mill is out of reach');
  // A relay within reach of the canopy, with the mill inside its field.
  const placed = apply(s, { type: 'place', kind: 'relay', x: -29, z: -20.5, yaw: 0 });
  assert.ok(placed.ok && placed.value.powerChanged);
  const relay = must(placed.value.created, 'the relay');
  assert.deepEqual(s.power.powered, [solar, house, mill, relay]);
  assert.ok(s.power.radii.every((v) => v.powered));
  assert.deepEqual(Object.keys(s.power).sort(), ['connected', 'powered', 'radii'], 'no wires, no modes');
  // Take the relay away and the mill goes dark again.
  assert.ok(apply(s, { type: 'remove', id: relay }).ok);
  assert.ok(!s.power.powered.includes(mill));
});

test('the wooden pylons are gone: the relay is the one free power mast', () => {
  assert.ok(!(THING_KINDS as readonly string[]).includes('pylon'));
  assert.equal(CATALOG.relay.label, 'Power Relay');
  assert.ok(!apply(homestead().s, { type: 'place', kind: 'pylon' as ThingKind, x: -22, z: -20, yaw: 0 }).ok);
});

test('nothing is powered without a source; a battery alone feeds its network', () => {
  const s = flatLand();
  const house = put(s, 'farmhouse', -28, -30), lantern = put(s, 'lantern', -34, -20);
  assert.deepEqual(s.power.powered, []);
  assert.deepEqual(s.power.connected, [], 'two loads never wire to each other');
  const battery = put(s, 'battery', -40, -30);
  assert.deepEqual(s.power.powered, [house, lantern, battery].sort((a, b) => a - b));
});

test('a lantern draws from the fields it stands in but never carries power on between them', () => {
  const s = flatLand();
  // A canopy and a relay 28 m apart (each field 15 m): out of each other's reach.
  const solar = put(s, 'solar', -40, -30), relay = put(s, 'relay', -12, -30);
  // The mill stands in the relay's field only.
  const mill = put(s, 'mill', 0, -30);
  assert.deepEqual(s.power.powered, [solar]);
  // A lantern halfway, inside both fields: lit by the canopy, but the relay (and the mill past it) stay dark.
  const lantern = put(s, 'lantern', -26, -30);
  assert.deepEqual(s.power.powered, [solar, lantern]);
  assert.ok(!s.power.powered.includes(relay) && !s.power.powered.includes(mill), 'no relay through a lantern');
  assert.deepEqual(s.power.radii.map((v) => [v.id, v.powered]), [[solar, true], [relay, false]]);
  assert.deepEqual(s.power.connected, [solar, relay, mill, lantern].sort((a, b) => a - b), 'each sits in a field it shares');
  // A building between them (a farmhouse uses power too) carries none on either.
  assert.ok(apply(s, { type: 'remove', id: lantern }).ok);
  const house = put(s, 'farmhouse', -26, -30);
  assert.ok(!s.power.powered.includes(relay));
  assert.ok(s.power.powered.includes(house));
  // A second relay in its place, within reach of both, joins them for real.
  assert.ok(apply(s, { type: 'remove', id: house }).ok);
  put(s, 'relay', -26, -30);
  assert.ok(s.power.powered.includes(relay) && s.power.powered.includes(mill));
});
