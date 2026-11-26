import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, cellX, cellZ, COVER, type Field, fieldYield, type GameState, growCrops, must, placeThing, thingObb, obbDistance } from '../src/game/index.ts';
import { flatLand, land } from './helpers.ts';

/** The cells of a field, checked against its record. */
function cellsOf(s: GameState, f: Field): number[] {
  const g = s.grid, out: number[] = [];
  for (let i = 0; i < g.fieldOf.length; i++) if (g.fieldOf[i] === f.id) out.push(i);
  assert.equal(out.length, f.cellCount);
  assert.equal(f.areaM2, f.cellCount);
  for (const i of out) {
    assert.equal(g.cover[i], COVER.field);
    const ix = i % g.nx, iz = (i - ix) / g.nx;
    assert.ok(ix >= f.bounds.x0 && ix <= f.bounds.x1 && iz >= f.bounds.z0 && iz <= f.bounds.z1);
  }
  return out;
}

const paint = (s: GameState, crop: 'wheat' | 'beans', x0: number, z0: number, x1: number, z1: number, radius: number) =>
  apply(s, { type: 'paintField', crop, points: [{ x: x0, z: z0 }, { x: (x0 + x1) / 2 + 1, z: (z0 + z1) / 2 + 1 }, { x: x1, z: z1 }], radius });

test('a stroke paints one organic field, seamlessly across the land\'s chunks', () => {
  const s = flatLand();
  const r = paint(s, 'wheat', -40, -20, 40, -24, 3);
  assert.ok(r.ok);
  assert.equal(s.fields.length, 1);
  const f = s.fields[0], cells = cellsOf(s, f);
  assert.equal(f.crop, 'wheat');
  assert.ok(f.cellCount > 400 && f.cellCount < 560, `${f.cellCount} cells`);
  // It spans the chunk seams at x = -32, -16, 0, 16, 32 without a break.
  for (const seam of [-32, -16, 0, 16, 32]) assert.ok(cells.some((i) => cellX(s.grid, i % s.grid.nx) === seam + 0.5));
  // An organic, rounded stroke, not a box.
  assert.ok(f.cellCount < (f.bounds.x1 - f.bounds.x0 + 1) * (f.bounds.z1 - f.bounds.z0 + 1) * 0.9);
  assert.ok(r.value.fields && r.value.cover, 'it says which cells changed');
  assert.deepEqual(r.value.fields, f.bounds);
});

test('erasing splits a field; painting the gap joins it again; another crop is its own field', () => {
  const s = flatLand();
  assert.ok(paint(s, 'wheat', -30, -20, 30, -20, 3).ok);
  const id = s.fields[0].id, area = s.fields[0].areaM2;
  const cut = apply(s, { type: 'eraseField', points: [{ x: 0, z: -30 }, { x: 0, z: -10 }], radius: 2 });
  assert.ok(cut.ok);
  assert.equal(s.fields.length, 2);
  assert.ok(s.fields.some((f) => f.id === id), 'one half keeps the id');
  assert.ok(s.fields.reduce((a, f) => a + f.areaM2, 0) < area);
  for (const f of s.fields) cellsOf(s, f);
  assert.ok(paint(s, 'wheat', -5, -20, 5, -20, 3).ok);
  assert.equal(s.fields.length, 1);
  assert.equal(s.fields[0].id, id);
  // Beans touching the wheat are a field of their own.
  assert.ok(paint(s, 'beans', -10, -28, 10, -28, 3).ok);
  assert.equal(s.fields.length, 2);
  const beans = must(s.fields.find((f) => f.crop === 'beans'), 'the beans');
  assert.notEqual(beans.id, id);
  for (const f of s.fields) cellsOf(s, f);
  // Erasing everything clears the fields and the cover.
  assert.ok(apply(s, { type: 'eraseField', points: [{ x: -45, z: -24 }, { x: 45, z: -24 }], radius: 8 }).ok);
  assert.equal(s.fields.length, 0);
  assert.ok(s.grid.fieldOf.every((v) => v === 0));
  assert.ok(s.grid.cover.every((c, i) => c === s.grid.baseCover[i]));
  assert.ok(!apply(s, { type: 'eraseField', points: [{ x: 0, z: -20 }], radius: 3 }).ok, 'nothing left to erase');
});

test('fields keep to clear ground: never in water, under a building or on rock', () => {
  const s = flatLand();
  // Across the brook: the water's cells stay water.
  assert.ok(paint(s, 'beans', -50, -8, -50, 8, 3).ok);
  for (let i = 0; i < s.grid.fieldOf.length; i++) if (s.grid.fieldOf[i] !== 0) assert.notEqual(s.grid.baseCover[i], COVER.water);
  assert.equal(s.fields.length, 2, 'the brook splits it in two');
  assert.ok(!apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: 30, z: 30 }], radius: 4 }).ok, 'the pond takes no field');
  // Under a mill: none. Under a solar canopy: yes.
  assert.ok(placeThing(s, 'mill', -20, -30, 0.5).ok);
  assert.ok(placeThing(s, 'solar', 0, -30, 0).ok);
  assert.ok(paint(s, 'wheat', -30, -30, 10, -30, 5).ok);
  const g = s.grid, mill = thingObb(s.things[0]), solar = thingObb(s.things[1]);
  let underSolar = 0;
  for (let i = 0; i < g.fieldOf.length; i++) {
    if (g.fieldOf[i] === 0) continue;
    const ix = i % g.nx, x = cellX(g, ix), z = cellZ(g, (i - ix) / g.nx);
    assert.ok(obbDistance(mill, x, z) > 0, 'no field under the mill');
    if (obbDistance(solar, x, z) <= 0) underSolar++;
  }
  assert.ok(underSolar > 10, 'the field runs under the canopy');
  assert.ok(!apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: 0, z: 0 }], radius: 0 }).ok, 'a brush needs a size');
});

test('a field reads its wetness: by the brook it is damp, far off dry', () => {
  const s = flatLand();
  assert.ok(paint(s, 'wheat', -40, 4.5, -20, 4.5, 2).ok);
  assert.ok(paint(s, 'beans', -40, -30, -20, -30, 2).ok);
  const wet = must(s.fields.find((f) => f.crop === 'wheat'), 'wheat'), dry = must(s.fields.find((f) => f.crop === 'beans'), 'beans');
  assert.ok(wet.avgMoisture > 0.1, `${wet.avgMoisture}`);
  assert.equal(dry.avgMoisture, 0);
});

test('digging a rill or laying a track through a field takes those cells', () => {
  const s = flatLand();
  assert.ok(paint(s, 'wheat', -30, -20, 30, -20, 4).ok);
  const before = s.fields[0].cellCount;
  const dug = apply(s, { type: 'digChannel', points: [{ x: -10, z: -30 }, { x: -10, z: -10 }] });
  assert.ok(dug.ok);
  assert.equal(s.fields.length, 2, 'the rill splits the field');
  assert.ok(dug.value.fields, 'the change says the fields changed');
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: 10, z: -30 }, { x: 10, z: -10 }] }).ok);
  assert.equal(s.fields.length, 3);
  const after = s.fields.reduce((a, f) => a + f.cellCount, 0);
  assert.ok(after < before);
  for (const f of s.fields) cellsOf(s, f);
});

test('painting the other crop over all of a field draws it again, though it keeps its id', () => {
  const s = flatLand();
  assert.ok(paint(s, 'wheat', -30, -20, 30, -20, 3).ok);
  const [wheat] = s.fields, cells = cellsOf(s, wheat), rev = s.revision;
  // The same stroke, beans: every cell of the field changes crop, none changes whether it's a field.
  const r = paint(s, 'beans', -30, -20, 30, -20, 3);
  assert.ok(r.ok);
  assert.equal(s.fields.length, 1);
  const [beans] = s.fields;
  assert.equal(beans.crop, 'beans');
  assert.deepEqual(cellsOf(s, beans), cells, 'the very same cells');
  assert.deepEqual(r.value.fields, wheat.bounds, 'it says the whole field is to be drawn again');
  assert.ok(r.value.revision > rev, 'and the valley has moved on');
});

test('pollination stays with the cells the bees visited: expanding dilutes it, shrinking keeps it, merging weighs it', () => {
  const s = land({ height: () => 0 });
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: 0, z: 0 }], radius: 2 }).ok);
  const small = s.fields[0], n0 = small.cellCount;
  assert.equal(n0, 12);
  small.pollinated = 1;
  small.growth = 0.5;
  // Expanding onto newly sown cells spreads only the old plot's share (it doesn't stay fully pollinated).
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: 0, z: 0 }, { x: 30, z: 0 }], radius: 3 }).ok);
  const big = must(s.fields.find((f) => f.id === small.id), 'expanded field');
  assert.equal(big.cellCount, 212);
  assert.equal(big.pollinated, n0 / big.cellCount);
  big.growth = 0.9999;
  growCrops(s, 1, 1);
  assert.equal(big.harvestReady, fieldYield(big, n0 / big.cellCount));
  assert.ok(big.harvestReady < fieldYield(big, 1));

  // Shrinking and splitting both keep the share the surviving cells had.
  const t = land({ height: () => 0 });
  assert.ok(apply(t, { type: 'paintField', crop: 'beans', points: [{ x: -20.5, z: 0.5 }, { x: 20.5, z: 0.5 }], radius: 2.6 }).ok);
  t.fields[0].pollinated = 0.5;
  assert.ok(apply(t, { type: 'eraseField', points: [{ x: 8.5, z: -5 }, { x: 8.5, z: 5 }], radius: 1.6 }).ok);
  assert.equal(t.fields.length, 2);
  const [larger, smaller] = [...t.fields].sort((a, b) => b.cellCount - a.cellCount);
  assert.equal(larger.pollinated, 0.5);
  assert.equal(smaller.pollinated, 0.5);

  // Joining the two again weighs each part's share by its cells; the gap's new cells are unpollinated.
  larger.pollinated = 1;
  smaller.pollinated = 0.5;
  const [a, b] = [larger.cellCount, smaller.cellCount];
  assert.ok(apply(t, { type: 'paintField', crop: 'beans', points: [{ x: 6.5, z: 0.5 }, { x: 10.5, z: 0.5 }], radius: 2.6 }).ok);
  assert.equal(t.fields.length, 1);
  const joined = t.fields[0];
  assert.ok(joined.cellCount > a + b);
  assert.ok(Math.abs(joined.pollinated - (a + 0.5 * b) / joined.cellCount) < 1e-12);
});
