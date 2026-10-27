import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GROUND, GROUND_ABOUT, GROUND_IDS, groundWords } from '../src/game/ground.ts';

// Where the ground shows (5.5): the words for the ground under a field, the legend's text.

const counts = (m: Partial<Record<keyof typeof GROUND, number>>) => GROUND_IDS.map((id) => m[id] ?? 0);

test('the ground under a field in words: one kind, two kinds, or mostly', () => {
  assert.equal(groundWords(counts({ silt: 9 })), 'silt');
  assert.equal(groundWords(counts({ silt: 6, clay: 3 })), '6 silt, 3 clay');
  assert.equal(groundWords(counts({ sand: 5, clay: 2, stony: 2 })), 'mixed, mostly sand');
  assert.equal(groundWords(counts({})), '–');
});

test('every kind of ground has a legend line saying where it lies and what it does', () => {
  for (const id of GROUND_IDS) assert.ok(GROUND_ABOUT[id].where && GROUND_ABOUT[id].does, id);
});
