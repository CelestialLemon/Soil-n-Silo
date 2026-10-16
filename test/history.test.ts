import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place, remove } from '../src/game/build.ts';
import { POWER, type BuildingId } from '../src/game/data.ts';
import { HISTORY_SECONDS, historyOf, summarize, type Bucket, type History } from '../src/game/history.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type BuildingOf, type GameState } from '../src/game/state.ts';

function flat(): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 },
  };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  return s;
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

/** A powered mill with nothing to grind. */
function mill(s: GameState) {
  put(s, 'pylon', 4, 4);
  const bat = put(s, 'battery', 5, 4);
  bat.charge = POWER.battery.capacity;
  return { m: put(s, 'mill', 6, 6), bat };
}

test('a building\'s history records how long it spent in each status, with what it waited for', () => {
  const s = flat(), { m } = mill(s);
  advance(s, 30);
  m.inputs.wheat = 6;
  advance(s, 30);
  const sum = summarize(historyOf(s, m)!, s.time, 300);
  const waiting = sum.shares.find((x) => x.status === 'input')!, working = sum.shares.find((x) => x.status === 'ok')!;
  assert.equal(waiting.need, 'wheat');
  // It waits 30 s, grinds three batches of 6 s, then waits again.
  assert.ok(working.seconds >= 17 && working.seconds <= 19, `worked ${working.seconds} s`);
  assert.ok(Math.abs(waiting.seconds + working.seconds - 60) < 1e-6, `waited ${waiting.seconds} s`);
  assert.deepEqual(sum.spans.map((x) => x.status), ['input', 'ok', 'input']);
  // Three batches of 6 s: 3 flour over the minute it has been recorded.
  assert.ok(Math.abs((sum.perMin.flour ?? 0) - 3) < 0.6, `flour ${sum.perMin.flour}/min`);
  // Time before it was built isn't counted.
  assert.ok(sum.shares.reduce((n, x) => n + x.seconds, 0) <= 60 + 1e-6);
});

test('history is kept for the last ten minutes only, and dropped when the building goes', () => {
  const s = flat(), { m, bat } = mill(s);
  advance(s, HISTORY_SECONDS + 120);
  const h = historyOf(s, m)!;
  // The run still going is kept, though it began long ago; buckets stop at the cut.
  assert.equal(h.runs.length, 1);
  assert.ok(h.buckets[0].from >= s.time - HISTORY_SECONDS - 20);
  const sum = summarize(h, s.time, 600);
  assert.equal(sum.spans[0].began, h.runs[0].from);
  assert.ok(Math.abs(sum.spans[0].from - (s.time - 600)) < 1e-6);
  assert.ok(historyOf(s, bat));
  remove(s, m);
  advance(s, 10);
  assert.equal(historyOf(s, m), null);
});

test('batteries and generators record a reading; the windows give about 60 bars', () => {
  const s = flat(), { bat } = mill(s);
  advance(s, 120);
  const h = historyOf(s, bat)!;
  assert.ok(h.buckets.every((k) => k.steps > 0));
  const sum = summarize(h, s.time, 60);
  assert.equal(sum.bars.length, 12);
  assert.ok(Math.abs(sum.bars[sum.bars.length - 1].value! - bat.charge) < 50);
  assert.equal(summarize(h, s.time, 600).step, 10);
  assert.equal(summarize(h, s.time, 300).step, 5);
  // Bars before it was built have no reading.
  assert.equal(summarize(h, s.time, 600).bars[0].value, null);
  // Pylons have no history.
  assert.equal(historyOf(s, s.buildings.find((b) => b.type === 'pylon')!), null);
});

const bucket = (from: number, o: Partial<Bucket> = {}): Bucket => ({ from, made: {}, value: 0, steps: 0, lowSteps: 0, lowShare: 0, ...o });

test('a summary weighs readings by the steps read, low power by the window, and rates by the time recorded', () => {
  // Recorded from 7 s: low on power throughout, at 10% for 60 s, then at 90% for the last 10 s.
  const h: History = {
    since: 7,
    runs: [{ from: 7, status: 'lowpower', share: 0.1 * 600 + 0.9 * 100, steps: 700 }],
    buckets: [],
  };
  for (let t = 5; t < 75; t += 5) {
    const late = t >= 65, n = t === 5 ? 30 : 50;
    h.buckets.push(bucket(t, { lowSteps: n, lowShare: n * (late ? 0.9 : 0.1), made: t === 10 ? { flour: 1 } : {}, value: t === 70 ? 20 : 0, steps: t === 70 ? 1 : 50 }));
  }
  const sum = summarize(h, 75, 10);
  // Only the last ten seconds count for the share it got.
  assert.ok(Math.abs(sum.shares[0].share! - 0.9) < 1e-9, `got ${sum.shares[0].share}`);
  // The hover still tells the whole run's share.
  assert.ok(Math.abs(sum.spans[0].share! - (0.1 * 600 + 0.9 * 100) / 700) < 1e-9);
  // 50 steps at 0 and 1 at 20 W: about 0.39 W, not the 10 W of the two bars' means.
  assert.ok(Math.abs(sum.reading!.avg - 20 / 51) < 1e-9, `avg ${sum.reading!.avg}`);
  assert.equal(sum.reading!.max, 20);
  // One flour since 7 s, over 68 s recorded (not from the bucket's start at 5 s).
  const long = summarize(h, 75, 300);
  assert.ok(Math.abs(long.perMin.flour! - 60 / 68) < 1e-9, `${long.perMin.flour}/min`);
});
