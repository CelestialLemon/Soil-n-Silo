import assert from 'node:assert/strict';
import { test } from 'node:test';
import { layWater, type WaterMap } from '../src/renderer/water.ts';

// The water's sheet over narrow rills on the continuous terrain (renderer/water.ts, WaterMap.narrow): at 160 × 160 cells of
// 1 m, a rill a cell wide running diagonally down a slope doesn't lay its water higher up over its banks further down.

const N = 160, SLOPE = 0.2, CUT = 0.3, DEPTH = 0.1;
/** The ground at a cell's middle: falling SLOPE m a cell along x and along z. */
const ground = (i: number, j: number) => -SLOPE * (i + j);

/** A rill down the diagonal (cell i = j), cut CUT under the ground and DEPTH deep. */
function rill(narrow?: boolean): WaterMap {
  const level = new Float32Array(N * N).fill(NaN);
  for (let i = 0; i < N; i++) level[i * N + i] = ground(i, i) - CUT + DEPTH;
  return { nx: N, nz: N, cell: 1, x0: -N / 2, z0: -N / 2, level, narrow };
}

/** The banks either side of it: the dry cells beside it. */
const banks = () => {
  const out: [number, number][] = [];
  for (let i = 1; i < N - 1; i++) out.push([i + 1, i], [i, i + 1]);
  return out;
};

test('broad water (the default) carries the rill\'s water higher up over its banks: its sheet stands on them', () => {
  const laid = layWater(rill());
  let over = 0;
  for (const [i, j] of banks()) if (laid.data[(j * N + i) * 4] >= ground(i, j) - 1e-4) over++;
  assert.ok(over > N, `${over} banks under the sheet`);
});

test('narrow water lays its sheet on its banks at the water beside them lower down, under the ground', () => {
  const t = performance.now(), laid = layWater(rill(true)), took = performance.now() - t;
  for (const [i, j] of banks()) {
    const sheet = laid.data[(j * N + i) * 4];
    assert.ok(sheet <= ground(i, j) - 2 * SLOPE + 1e-4, `bank ${i},${j}: the sheet at ${sheet}, the ground at ${ground(i, j)}`);
  }
  // The water itself as sent.
  for (let i = 0; i < N; i++) assert.ok(Math.abs(laid.data[(i * N + i) * 4] - (ground(i, i) - CUT + DEPTH)) < 1e-4, `the rill at ${i}`);
  assert.ok(took < 1000, `laid in ${took} ms`);
});

test('narrow left out is the default, exactly', () => {
  const a = layWater(rill()), b = layWater(rill(false));
  assert.deepEqual(a.data, b.data);
  assert.deepEqual(a.ice, b.ice);
});
