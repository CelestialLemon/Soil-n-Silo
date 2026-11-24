import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canPlace, cellHeightAt, cellX, cellZ, CLEARING, COVER, generateValley, GRID_N, heightAt, isWet, slopeAt, STATE_VERSION,
  VALLEY_FALL, VALLEY_HALF, VERT_N,
} from '../src/game/index.ts';
import { brookSpot, same, SEEDS, valley } from './helpers.ts';

test('the same seed grows the same valley; another seed grows another', () => {
  const a = valley(), b = generateValley(7, 'summer'), c = generateValley(8, 'summer');
  assert.ok(same(a.grid.baseHeight, b.grid.baseHeight));
  assert.ok(same(a.grid.baseCover, b.grid.baseCover));
  assert.ok(same(a.grid.baseWaterLevel, b.grid.baseWaterLevel));
  assert.ok(same(a.grid.moisture, b.grid.moisture));
  assert.deepEqual(a.crags, b.crags);
  assert.deepEqual(a.wildTrees, b.wildTrees);
  assert.deepEqual(a.valley, b.valley);
  assert.ok(!same(a.grid.baseHeight, c.grid.baseHeight));
});

test('the grid keeps the continuous-terrain contract', () => {
  const s = valley(), g = s.grid;
  assert.equal(s.version, STATE_VERSION);
  assert.equal(s.revision, 0);
  assert.deepEqual([g.nx, g.nz, g.cell, g.x0, g.z0], [GRID_N, GRID_N, 1, -80, -80]);
  for (const a of [g.baseHeight, g.height, g.landHeight]) assert.equal(a.length, VERT_N * VERT_N);
  for (const a of [g.baseCover, g.cover, g.soil, g.worked, g.waterLevel, g.flowX, g.flowZ, g.moisture, g.fieldOf]) assert.equal(a.length, GRID_N * GRID_N);
  // A fresh valley's live land is the natural one.
  assert.ok(same(g.height, g.baseHeight));
  assert.ok(same(g.cover, g.baseCover));
  assert.ok(same(g.waterLevel, g.baseWaterLevel));
  // heightAt reads the exact triangles: at a vertex it's the vertex.
  assert.equal(heightAt(g, -80 + 37, -80 + 91), g.height[91 * VERT_N + 37]);
});

test("the brook's water never rises downstream, and its bed lies well below its banks", () => {
  for (const seed of [7, 11, 23]) {
    const s = seed === 7 ? valley() : generateValley(seed, 'autumn');
    const { brook, brookLevel, pond } = s.valley;
    assert.ok(brook.length > 100);
    for (let i = 1; i < brookLevel.length; i++) assert.ok(brookLevel[i] <= brookLevel[i - 1], `seed ${seed}: rises at ${i}`);
    assert.ok(brookLevel.includes(pond.level), 'the pond lies on the brook');
    // Inside the valley: bank (4 m to the side) minus the bed at the middle.
    const g = s.grid;
    for (let i = 2; i < brook.length - 2; i += 6) {
      const p = brook[i];
      if (Math.abs(p.x) > 50 || Math.abs(p.z) > 50 || Math.hypot(p.x - pond.x, p.z - pond.z) < pond.radius + 6) continue;
      const a = brook[i - 2], b = brook[i + 2], len = Math.hypot(b.x - a.x, b.z - a.z);
      const nx = -(b.z - a.z) / len, nz = (b.x - a.x) / len;
      const bank = Math.min(heightAt(g, p.x + nx * 4, p.z + nz * 4), heightAt(g, p.x - nx * 4, p.z - nz * 4));
      const depth = bank - heightAt(g, p.x, p.z);
      assert.ok(depth >= 0.7 && depth <= 1.6, `seed ${seed}: bed ${depth.toFixed(2)} m below the bank at ${i}`);
      assert.ok(bank > brookLevel[i], `seed ${seed}: the bank holds the water at ${i}`);
    }
  }
});

test('the banks hold the water: no dry cell beside the water lies below its surface', () => {
  for (const seed of [7, 1, 2, 3, 42, 777]) {
    const s = seed === 7 ? valley() : generateValley(seed, 'spring'), g = s.grid;
    let water = 0;
    for (let iz = 1; iz < g.nz - 1; iz++) for (let ix = 1; ix < g.nx - 1; ix++) {
      const i = iz * g.nx + ix;
      if (!isWet(g.baseWaterLevel[i])) continue;
      water++;
      assert.equal(g.baseCover[i], COVER.water);
      if (Math.abs(cellX(g, ix)) > VALLEY_HALF || Math.abs(cellZ(g, iz)) > VALLEY_HALF) continue;
      for (const j of [i - 1, i + 1, i - g.nx, i + g.nx]) {
        if (isWet(g.baseWaterLevel[j])) continue;
        const jx = j % g.nx, jz = (j - jx) / g.nx;
        assert.ok(cellHeightAt(g, jx, jz, g.baseHeight) >= g.baseWaterLevel[i], `seed ${seed}: leak at (${cellX(g, jx)}, ${cellZ(g, jz)})`);
      }
    }
    assert.ok(water > 500, `seed ${seed}: a brook and a pond (${water} cells)`);
  }
});

test('a gentle, open clearing by the brook is kept for the farmhouse', () => {
  for (const seed of [7, 5, 99]) {
    const s = seed === 7 ? valley() : generateValley(seed, 'summer'), g = s.grid, h = s.valley.homestead;
    assert.ok(Math.abs(h.x) < 45 && Math.abs(h.z) < 45);
    let steepest = 0;
    for (let a = 0; a < 32; a++) for (const r of [0, 3, 6, 9, CLEARING - 4]) steepest = Math.max(steepest, slopeAt(g, h.x + Math.cos(a) * r, h.z + Math.sin(a) * r));
    assert.ok(steepest < 0.2, `seed ${seed}: clearing slope ${steepest.toFixed(3)}`);
    for (const yaw of [0, 0.7, 2.1]) assert.ok(canPlace(s, 'farmhouse', h.x, h.z, yaw).ok, `seed ${seed}: farmhouse fits at yaw ${yaw}`);
    // No rock or wild tree in the clearing; the brook within reach.
    for (const c of s.crags) assert.ok(Math.hypot(c.x - h.x, c.z - h.z) > CLEARING);
    for (const t of s.wildTrees) assert.ok(Math.hypot(t.x - h.x, t.z - h.z) > CLEARING);
    const toBrook = Math.min(...s.valley.brook.map((p) => Math.hypot(p.x - h.x, p.z - h.z)));
    assert.ok(toBrook < 20, `seed ${seed}: brook ${toBrook.toFixed(1)} m away`);
  }
});

test('hills rise round the valley, woods beyond it, crags on knolls, groves and wet banks', () => {
  const s = valley(), g = s.grid;
  let rim = 0, rimN = 0, mid = 0, midN = 0, woods = 0, outside = 0;
  for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
    const x = cellX(g, ix), z = cellZ(g, iz), r = Math.max(Math.abs(x), Math.abs(z)), i = iz * g.nx + ix;
    const h = cellHeightAt(g, ix, iz, g.baseHeight);
    if (r > 70 && !isWet(g.baseWaterLevel[i])) { rim += h; rimN++; }
    if (r < 30) { mid += h; midN++; }
    if (r > VALLEY_HALF) { outside++; if (g.baseCover[i] === COVER.woods) woods++; }
  }
  assert.ok(rim / rimN > mid / midN + 4, 'the rim stands well above the valley floor');
  assert.ok(woods / outside > 0.8, 'woods beyond the valley');
  assert.ok(s.crags.length >= 3);
  for (const c of s.crags) {
    assert.ok(Math.abs(c.x) < 56 && Math.abs(c.z) < 56);
    assert.equal(g.baseCover[Math.floor(c.z + 80) * g.nx + Math.floor(c.x + 80)], COVER.rock);
  }
  assert.ok(s.wildTrees.length > 60);
  assert.ok(new Set(s.wildTrees.map((t) => t.id)).size === s.wildTrees.length);
  for (const t of s.wildTrees) assert.ok(!t.planted && !isWet(g.baseWaterLevel[Math.floor(t.z + 80) * g.nx + Math.floor(t.x + 80)]));
  // The banks start wet; far from water the ground is dry.
  const p = s.valley.brook[Math.floor(s.valley.brook.length / 3)];
  assert.ok(g.moisture[Math.floor(p.z + 80) * g.nx + Math.floor(p.x + 80)] === 1);
  const h = s.valley.homestead;
  assert.ok(g.moisture[Math.floor(h.z + 80) * g.nx + Math.floor(h.x + 80)] === 0);
  // Soils vary.
  assert.ok(new Set(g.soil).size >= 4);
});

test('every season grows', () => {
  for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
    const s = generateValley(3, season);
    assert.equal(s.season, season);
    assert.ok(s.wildTrees.length > 0);
  }
});

test('the valley falls steadily down the brook, about 5 m across its 120 m', () => {
  for (const seed of SEEDS) {
    const { brook, brookLevel } = generateValley(seed, 'spring').valley;
    const levelAt = (x: number) => brookLevel[brook.reduce((best, p, i) => (Math.abs(p.x - x) < Math.abs(brook[best].x - x) ? i : best), 0)];
    const drop = Math.abs(levelAt(-60) - levelAt(60));
    assert.ok(drop >= 4.5 && drop <= 6.5, `seed ${seed}: the brook falls ${drop.toFixed(2)} m across the valley`);
    assert.ok(Math.abs(VALLEY_FALL * 120 - 5.4) < 1e-9);
  }
});

test('beside the upper and middle brook a meadow terrace lies below its water; the far side rises above it', () => {
  for (const seed of SEEDS) {
    const s = generateValley(seed, 'spring'), g = s.grid;
    for (const offset of [-15, 0]) {
      const b = brookSpot(s, offset);
      // Out across the terrace, and on down it: from a little to a couple of metres below the brook's water.
      for (const [along, out] of [[0, 16], [0, 22], [8, 14], [12, 24]]) {
        const p = b.at(along, out), below = b.level - heightAt(g, p.x, p.z);
        assert.ok(below > 0.05 && below < 2.5, `seed ${seed}, brook ${b.i}: terrace ${below.toFixed(2)} m below the water ${out} m out, ${along} m down`);
      }
      // Across the brook the land climbs: a rill led there meets a sill.
      const far = b.at(0, -12);
      assert.ok(heightAt(g, far.x, far.z) > b.level + 0.3, `seed ${seed}, brook ${b.i}: the far side rises`);
    }
  }
});
