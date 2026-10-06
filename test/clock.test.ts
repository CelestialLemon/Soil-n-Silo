import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DAY_CUTOFF, DAY_SECONDS, DAY_START, hourOfDay, newClock, nextDay, tick } from '../src/game/clock.ts';

test('a day runs from 6 AM to the 2 AM cutoff in DAY_SECONDS', () => {
  const clock = newClock();
  assert.equal(clock.hour, DAY_START);
  assert.equal(tick(clock, DAY_SECONDS / 2), false);
  assert.equal(clock.hour, 16);
  assert.equal(tick(clock, DAY_SECONDS), true);
  assert.equal(clock.hour, DAY_CUTOFF);
  assert.equal(hourOfDay(clock), 2);
});

test('the clock stops while paused', () => {
  const clock = newClock();
  clock.paused = true;
  assert.equal(tick(clock, 60), false);
  assert.equal(clock.hour, DAY_START);
});

test('the next day starts at 6 AM', () => {
  const clock = newClock();
  tick(clock, DAY_SECONDS);
  nextDay(clock);
  assert.deepEqual(clock, { day: 2, hour: DAY_START, paused: false });
});
