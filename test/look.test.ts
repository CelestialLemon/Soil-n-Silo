import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lookAt } from 'pixel3d-renderer';
import { SEASON_IDS } from '../src/game/seasons.ts';
import { greyLook } from '../src/world/greyLook.ts';
import { grassOf } from '../src/world/ground.ts';

test('a clear sky leaves the look as it is, and cloud and rain dim and grey it step by step', () => {
  const noon = lookAt(12);
  assert.equal(greyLook(noon, { cloud: 0, precip: 0 }), noon);
  const cloudy = greyLook(noon, { cloud: 0.6, precip: 0 }), grey = greyLook(noon, { cloud: 1, precip: 0 }), rain = greyLook(noon, { cloud: 1, precip: 1 });
  assert.ok(noon.sunI > cloudy.sunI && cloudy.sunI > grey.sunI && grey.sunI > rain.sunI);
  assert.ok(noon.chroma > cloudy.chroma && cloudy.chroma > grey.chroma && grey.chroma > rain.chroma);
  assert.ok(grey.skyTop.r >= 0 && rain.skyTop.getHex() !== noon.skyTop.getHex());
});

test('each season has its own grass, from lush to dry', () => {
  const seen = new Set<number>();
  for (const s of SEASON_IDS) {
    assert.notEqual(grassOf(s, 0), grassOf(s, 1), s);
    for (const dry of [0, 0.5, 1]) { const c = grassOf(s, dry); assert.ok(!seen.has(c), `${s} ${dry}`); seen.add(c); }
  }
});
