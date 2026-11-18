import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QUALITY } from '../brush3d/src/renderer/quality.ts';
import { QUALITIES, readSettings } from '../src/ui/settings.ts';

test('brush3d’s settings default to the full picture, and an unknown choice falls back to it', () => {
  const d = readSettings(null);
  assert.deepEqual([d.quality, d.falling, d.flashes], ['high', 'full', 'full']);
  const s = readSettings('{"quality":"low","falling":"light","flashes":"gentle"}');
  assert.deepEqual([s.quality, s.falling, s.flashes], ['low', 'light', 'gentle']);
  const bad = readSettings('{"quality":"ultra","falling":0.5,"flashes":"none"}');
  assert.deepEqual([bad.quality, bad.falling, bad.flashes], ['high', 'full', 'full']);
  // The tools' looks (#206): halo and bold by default, the player's pick kept, anything else the default.
  assert.deepEqual([d.highlight, d.overlayStyle], ['halo', 'bold']);
  const t = readSettings('{"highlight":"gold","overlayStyle":"borders"}');
  assert.deepEqual([t.highlight, t.overlayStyle], ['gold', 'borders']);
  const off = readSettings('{"highlight":"glow","overlayStyle":3}');
  assert.deepEqual([off.highlight, off.overlayStyle], ['halo', 'bold']);
  // The pixel ratio (#210): 1.25 by default (the developer's pick); the player's pick kept, the screen's own too; anything else the default.
  assert.equal(d.pixelRatio, '1.25');
  assert.equal(readSettings('{"pixelRatio":"1"}').pixelRatio, '1');
  assert.equal(readSettings('{"pixelRatio":"full"}').pixelRatio, 'full');
  assert.equal(readSettings('{"pixelRatio":1}').pixelRatio, '1.25');
});

test('each graphics quality is one of brush3d’s presets, each asking less of the GPU than the one above', () => {
  assert.deepEqual([...QUALITIES], Object.keys(QUALITY));
  const cost = QUALITIES.map((q) => QUALITY[q]);
  for (let i = 1; i < cost.length; i++) {
    const [a, b] = [cost[i - 1], cost[i]];
    assert.ok(b.samples <= a.samples && b.shadowMapSize <= a.shadowMapSize && b.shelterSize <= a.shelterSize && b.maxPixels <= a.maxPixels);
    assert.notDeepEqual(a, b);
  }
});
