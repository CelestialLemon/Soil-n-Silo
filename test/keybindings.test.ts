import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ACTIONS, assign, bindable, canon, defaultBindings, keyLabel, keymapOf, overridesOf, readOverrides, resolve, unassign } from '../src/keybindings.ts';
import { BUILDINGS } from '../src/game/data.ts';
import { readSettings } from '../src/ui/settings.ts';

test('the defaults give no key to two actions', () => {
  const seen = new Set<string>();
  for (const codes of Object.values(defaultBindings())) for (const c of codes) { assert.ok(!seen.has(c), `${c} twice`); seen.add(c); }
  assert.equal(keymapOf(defaultBindings()).get('KeyF'), 'build:field');
  assert.equal(keymapOf(defaultBindings()).get('Space'), 'pause');
});

test('no overrides resolve to the defaults, and the defaults to no overrides', () => {
  assert.deepEqual(resolve({}), defaultBindings());
  assert.deepEqual(overridesOf(defaultBindings()), {});
});

test('assigning a key takes it from the action that had it', () => {
  const { bindings, took } = assign(defaultBindings(), 'remove', 0, 'KeyR');
  assert.deepEqual(bindings.remove, ['KeyR']);
  assert.deepEqual(bindings.rotate, []);
  assert.deepEqual(took, ['rotate']);
  assert.deepEqual(overridesOf(bindings), { remove: ['KeyR'], rotate: [] });
  assert.deepEqual(resolve(overridesOf(bindings)), bindings);
});

test('the second slot adds a key; the first replaces one; a key already on the action is not doubled', () => {
  const b = defaultBindings();
  assert.deepEqual(assign(b, 'zoomOut', 1, 'KeyN').bindings.zoomOut, ['Minus', 'KeyN']);
  assert.deepEqual(assign(b, 'zoomIn', 0, 'KeyN').bindings.zoomIn, ['KeyN', 'Equal']);
  assert.deepEqual(assign(b, 'zoomIn', 1, 'KeyZ').bindings.zoomIn, ['KeyZ']);
  // The second slot of an action with no key is its first.
  assert.deepEqual(assign(unassign(b, 'remove', 0), 'remove', 1, 'KeyN').bindings.remove, ['KeyN']);
  assert.deepEqual(unassign(b, 'zoomIn', 0).zoomIn, ['Equal']);
});

test('assigning leaves the bindings it was given alone', () => {
  const b = defaultBindings();
  assign(b, 'remove', 0, 'KeyR');
  assert.deepEqual(b, defaultBindings());
});

test('saved overrides are read back with unknown actions, unusable keys, extras and doubles dropped', () => {
  const o = readOverrides({
    remove: ['KeyR', 'KeyR', 'Escape', 'ShiftLeft', 5, 'Numpad4', 'KeyA'], nonsense: ['KeyA'], rotate: 'KeyB', zoomIn: [],
  });
  assert.deepEqual(o, { remove: ['KeyR', 'Digit4'], zoomIn: [] });
  assert.deepEqual(readOverrides(null), {});
  assert.deepEqual(readOverrides('x'), {});
});

test('a key given to two actions by hand stays with one, and an override beats a default', () => {
  const b = resolve({ remove: ['KeyR'], panLeft: ['KeyR'] });
  assert.deepEqual(b.remove, ['KeyR']);
  assert.deepEqual(b.panLeft, []);
  assert.deepEqual(b.rotate, []);
  const seen = new Set<string>();
  for (const a of ACTIONS) for (const c of b[a.id]) { assert.ok(!seen.has(c)); seen.add(c); }
});

test('the numpad counts as the main keys, and some keys cannot be bound', () => {
  assert.equal(canon('NumpadAdd'), 'Equal');
  assert.equal(canon('NumpadSubtract'), 'Minus');
  assert.equal(canon('Numpad2'), 'Digit2');
  assert.equal(canon('KeyA'), 'KeyA');
  for (const c of ['Escape', 'ShiftLeft', 'ControlRight', 'MetaLeft', 'Enter', 'F5', '']) assert.ok(!bindable(c), c);
  for (const c of ['KeyA', 'Tab', 'Space', 'ArrowUp', 'Digit1', 'Equal']) assert.ok(bindable(c), c);
});

test('keys are named as the layout prints them, else by their place', () => {
  assert.equal(keyLabel('KeyF'), 'F');
  assert.equal(keyLabel('Digit1'), '1');
  assert.equal(keyLabel('ArrowLeft'), '←');
  assert.equal(keyLabel('Equal'), '=');
  assert.equal(keyLabel('KeyQ', new Map([['KeyQ', 'a']])), 'A');
  assert.equal(keyLabel('Space', new Map([['Space', ' ']])), 'Space');
});

test('settings keep the player\'s keys, and a broken value falls back to none', () => {
  assert.deepEqual(readSettings(JSON.stringify({ keys: { remove: ['KeyR'] } })).keys, { remove: ['KeyR'] });
  assert.deepEqual(readSettings(JSON.stringify({ keys: 7 })).keys, {});
  assert.deepEqual(readSettings(null).keys, {});
});

test('every building with a key has an action, and no other', () => {
  const keyed = Object.entries(BUILDINGS).filter(([, d]) => d.key).map(([id]) => `build:${id}`).sort();
  assert.deepEqual(ACTIONS.map((a) => a.id).filter((id) => id.startsWith('build:')).sort(), keyed);
});
