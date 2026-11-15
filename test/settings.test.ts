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
