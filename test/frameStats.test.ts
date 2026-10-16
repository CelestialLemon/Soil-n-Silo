import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FrameTimes, STATS_WINDOW } from '../src/ui/frameStats.ts';
import { readSettings } from '../src/ui/settings.ts';

test('no frames, no summary', () => {
  assert.equal(new FrameTimes().summary(), null);
});

test('steady frames give the same average and lows', () => {
  const t = new FrameTimes();
  for (let i = 0; i < 600; i++) t.add(1000 / 60);
  const s = t.summary();
  assert.ok(s);
  assert.equal(s.frames, 600);
  for (const v of [s.average, s.low1, s.low01]) assert.ok(Math.abs(v - 60) < 1e-6, String(v));
});

test('the lows are the frame rate of the slowest 1% and 0.1% of frames', () => {
  const t = new FrameTimes();
  // 1000 frames: 989 at 10 ms, 10 at 20 ms, one at 50 ms.
  for (let i = 0; i < 989; i++) t.add(10);
  for (let i = 0; i < 10; i++) t.add(20);
  t.add(50);
  const s = t.summary();
  assert.ok(s);
  assert.ok(Math.abs(s.average - 1000 / ((989 * 10 + 10 * 20 + 50) / 1000)) < 1e-9);
  // The slowest 10 frames: one at 50 ms and nine at 20 ms, 23 ms on average.
  assert.ok(Math.abs(s.low1 - 1000 / 23) < 1e-9);
  assert.equal(s.low01, 20);
});

test('frames older than the window drop out', () => {
  const t = new FrameTimes();
  t.add(500);
  for (let i = 0; i < STATS_WINDOW / 10; i++) t.add(10);
  assert.equal(t.length, STATS_WINDOW / 10);
  assert.equal(t.at(0), 10);
  const s = t.summary();
  assert.ok(s);
  assert.ok(Math.abs(s.average - 100) < 1e-6);
  assert.equal(s.low01, 100);
});

test('the frame rate setting falls back to off', () => {
  assert.equal(readSettings(null).frameStats, 'off');
  assert.equal(readSettings('{"frameStats":"full"}').frameStats, 'full');
  assert.equal(readSettings('{"frameStats":"lots"}').frameStats, 'off');
});
