import assert from 'node:assert/strict';
import { test } from 'node:test';
import { corners, joins, type Relief } from '../src/game/relief.ts';
import { SLACK, Surface } from '../src/world/surface.ts';

// The ground as drawn (surface.ts): a smooth reading of the rules' levels that keeps to them where it must.

/** A relief `w` × `h` tiles, one sheet, each grid point at `f(px, py)`. */
function sheet(w: number, h: number, f: (px: number, py: number) => number): Relief & { corner: number[] } {
  const corner: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) corner.push(f(x, y), f(x + 1, y), f(x + 1, y + 1), f(x, y + 1));
  return { width: w, height: h, corner };
}

const wild = { water: () => false, worked: () => false };

/** Rolling ground, as the generator makes it: smooth noise rounded to whole levels. */
const rolling = (px: number, py: number) => Math.round(4 + 2.2 * Math.sin(px * 0.31) + 1.7 * Math.cos(py * 0.27 + px * 0.11));

test('flat ground is drawn flat, at its level', () => {
  const s = new Surface(sheet(6, 5, () => 3), wild);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) for (const [u, v] of [[0, 0], [0.3, 0.7], [1, 1]]) assert.equal(s.on(x, y, u, v), 3);
});

test('each point stays within half a level of the rules, and each tile between its corners\' smooth heights', () => {
  const r = sheet(20, 16, rolling), s = new Surface(r, wild);
  for (let y = 0; y < r.height; y++) for (let x = 0; x < r.width; x++) {
    const c = corners(r, x, y), f = [0, 1, 2, 3].map((k) => s.cornerAt(x, y, k));
    for (let k = 0; k < 4; k++) assert.ok(Math.abs(f[k] - c[k]) <= SLACK + 1e-9, `${x},${y} corner ${k}`);
    for (let j = 0; j <= 4; j++) for (let i = 0; i <= 4; i++) {
      const h = s.on(x, y, i / 4, j / 4);
      assert.ok(h >= Math.min(...f) - 1e-9 && h <= Math.max(...f) + 1e-9, `${x},${y} at ${i / 4},${j / 4}`);
    }
  }
});

test('it rolls: a long rise is drawn as one slope, not shelves and ramps', () => {
  // A rise of a level every four tiles, as rounding leaves it: flat shelves joined by one-tile ramps.
  const r = sheet(24, 4, (px) => Math.floor(px / 4)), s = new Surface(r, wild);
  let flat = 0;
  for (let x = 4; x < 20; x++) if (Math.abs(s.on(x, 1, 1, 0.5) - s.on(x, 1, 0, 0.5)) < 0.05) flat++;
  assert.equal(flat, 0, 'no tile along the rise is drawn flat');
});

test('where tiles join, their edges meet exactly; across a cliff each side keeps its own', () => {
  const r = sheet(12, 10, rolling);
  // A cliff: the east half raised two levels.
  for (let y = 0; y < 10; y++) for (let x = 6; x < 12; x++) for (let k = 0; k < 4; k++) r.corner[(y * 12 + x) * 4 + k] += 2;
  const s = new Surface(r, wild);
  for (let y = 0; y < 10; y++) for (let x = 0; x < 11; x++) {
    for (const u of [0, 0.25, 0.5, 0.9, 1]) {
      if (joins(r, x, y, 1)) assert.equal(s.on(x, y, 1, u), s.on(x + 1, y, 0, u));
      if (y + 1 < 10 && joins(r, x, y, 2)) assert.equal(s.on(x, y, u, 1), s.on(x, y + 1, u, 0));
    }
  }
  assert.ok(!joins(r, 5, 3, 1));
  assert.ok(s.on(6, 3, 0, 0.5) - s.on(5, 3, 1, 0.5) > 1, 'the cliff stays a cliff');
});

test('water and worked ground are drawn exactly at their levels', () => {
  const r = sheet(14, 12, rolling), worked = (x: number, y: number) => x >= 4 && x < 7 && y >= 4 && y < 7;
  // Level the worked square at its own level, as a building's earthworks would (the ground round it following).
  const l = corners(r, 5, 5)[0];
  for (let y = 4; y < 7; y++) for (let x = 4; x < 7; x++) for (let k = 0; k < 4; k++) r.corner[(y * 14 + x) * 4 + k] = l;
  const s = new Surface(r, { water: (x, y) => x === 10 && y === 10, worked });
  for (let y = 4; y < 7; y++) for (let x = 4; x < 7; x++) for (const [u, v] of [[0, 0], [0.5, 0.5], [0.2, 0.9], [1, 1]]) assert.equal(s.on(x, y, u, v), l);
  for (let k = 0; k < 4; k++) assert.equal(s.cornerAt(10, 10, k), corners(r, 10, 10)[k]);
});

test('fitting again moves only the ground it is let move', () => {
  const r = sheet(16, 12, rolling), s = new Surface(r, wild);
  const before = Array.from({ length: 16 * 12 }, (_, i) => s.on(i % 16, Math.floor(i / 16), 0.5, 0.5));
  // Raise a point in the east, near the middle, and let only the east half move.
  for (const [x, y, k] of [[10, 6, 0], [9, 6, 1], [9, 5, 2], [10, 5, 3]]) r.corner[(y * 16 + x) * 4 + k] += 1;
  const changed = s.refit(8, 0, 16, 12);
  assert.ok(changed.includes(6 * 16 + 10) && changed.every((i) => i % 16 >= 8));
  for (let y = 0; y < 12; y++) for (let x = 0; x < 8; x++) assert.equal(s.on(x, y, 0.5, 0.5), before[y * 16 + x]);
  assert.ok(Math.abs(s.cornerAt(10, 6, 0) - corners(r, 10, 6)[0]) <= SLACK + 1e-9);
  // Where the ground that moved meets the ground that didn't, the two still meet.
  for (let y = 0; y < 12; y++) for (const v of [0, 0.3, 0.7, 1]) {
    assert.ok(Math.abs(s.on(7, y, 1, v) - s.on(8, y, 0, v)) < 1e-9);
    const a = s.shadeAt(7, y, 1, v), b = s.shadeAt(8, y, 0, v), sa = s.slope(7, y, 1, v), sb = s.slope(8, y, 0, v);
    assert.ok(Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9);
    assert.ok(Math.abs(sa[0] - sb[0]) < 1e-9 && Math.abs(sa[1] - sb[1]) < 1e-9);
  }
});
