import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkTerrain, checkTerrainPatch, hitHeightfield, sampleHeightfield, terrainChunkCells, type TerrainMap } from '../src/shared.ts';

// The continuous terrain's one way of reading its height between the grid's points (land/heightfield.ts): the cell's two
// triangles split from its north-east corner to its south-west one, the same everywhere the game and brush3d ask.

/** A small bumpy terrain: 6 × 5 cells of 1.5 m, its north-west corner at (-4, 2). */
const NX = 6, NZ = 5, CELL = 1.5, X0 = -4, Z0 = 2;
const HEIGHTS = Float32Array.from({ length: (NX + 1) * (NZ + 1) }, (_, k) => {
  const i = k % (NX + 1), j = Math.floor(k / (NX + 1));
  return Math.sin(i * 1.3) * 0.8 + Math.cos(j * 0.9 + i * 0.4) * 0.6 + (i === 3 && j === 2 ? -1.2 : 0);
});
const at = (x: number, z: number) => sampleHeightfield(HEIGHTS, NX, NZ, CELL, X0, Z0, x, z);
const corner = (i: number, j: number) => HEIGHTS[j * (NX + 1) + i];

test('the height at each grid point is that point\'s height', () => {
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    assert.ok(Math.abs(at(X0 + i * CELL, Z0 + j * CELL) - corner(i, j)) < 1e-6, `corner ${i},${j}`);
  }
});

test('the height is continuous across cell edges and the diagonal', () => {
  const e = 1e-7;
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) for (let s = 0; s <= 10; s++) {
    const f = s / 10, x = X0 + i * CELL, z = Z0 + j * CELL;
    // Along each cell's west edge (from either side) and its north edge.
    if (i > 0) assert.ok(Math.abs(at(x - e, z + f * CELL) - at(x + e, z + f * CELL)) < 1e-5, `west edge of ${i},${j}`);
    if (j > 0) assert.ok(Math.abs(at(x + f * CELL, z - e) - at(x + f * CELL, z + e)) < 1e-5, `north edge of ${i},${j}`);
    // Across the diagonal u + v = 1, from either triangle.
    const dx = x + f * CELL, dz = z + (1 - f) * CELL;
    assert.ok(Math.abs(at(dx - e, dz - e) - at(dx + e, dz + e)) < 1e-5, `diagonal of ${i},${j}`);
  }
});

test('the cell splits along its north-east to south-west diagonal, as each triangle\'s formula says', () => {
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const h00 = corner(i, j), h10 = corner(i + 1, j), h01 = corner(i, j + 1), h11 = corner(i + 1, j + 1);
    const x = X0 + i * CELL, z = Z0 + j * CELL;
    // The middle of the cell lies on that diagonal: the mean of its north-east and south-west corners (not the other two).
    assert.ok(Math.abs(at(x + CELL / 2, z + CELL / 2) - (h10 + h01) / 2) < 1e-6);
    for (const [u, v] of [[0.2, 0.3], [0.1, 0.85], [0.6, 0.35], [0.7, 0.8], [0.95, 0.9], [0.4, 0.55]]) {
      const want = u + v <= 1 ? h00 + u * (h10 - h00) + v * (h01 - h00) : h11 + (1 - u) * (h01 - h11) + (1 - v) * (h10 - h11);
      assert.ok(Math.abs(at(x + u * CELL, z + v * CELL) - want) < 1e-6, `cell ${i},${j} at ${u},${v}`);
    }
  }
});

test('a point off the grid takes the height at the nearest point of its edge', () => {
  const x1 = X0 + NX * CELL, z1 = Z0 + NZ * CELL;
  assert.equal(at(X0 - 10, Z0 - 10), corner(0, 0));
  assert.equal(at(x1 + 3, z1 + 0.5), corner(NX, NZ));
  assert.ok(Math.abs(at(X0 - 5, Z0 + 2.25) - at(X0, Z0 + 2.25)) < 1e-9);
  assert.ok(Math.abs(at(X0 + 4, z1 + 7) - at(X0 + 4, z1)) < 1e-9);
  assert.ok(Math.abs(at(x1 + 1, Z0 + 3) - at(x1, Z0 + 3)) < 1e-9);
});

test('a line of sight meets the terrain where its height says, from above only', () => {
  // Straight down onto every cell's two triangles.
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) for (const [u, v] of [[0.25, 0.25], [0.75, 0.7]]) {
    const x = X0 + (i + u) * CELL, z = Z0 + (j + v) * CELL, t = hitHeightfield(HEIGHTS, NX, NZ, CELL, X0, Z0, x, 20, z, 0, -2, 0);
    assert.ok(t !== null);
    assert.ok(Math.abs(20 - 2 * t - at(x, z)) < 1e-5);
  }
  // Slanting, from over the terrain: the hit lies on the drawn surface, and nothing along the line before it is under it.
  let hits = 0;
  for (let k = 0; k < 400; k++) {
    const a = k * 2.399, ox = X0 + NX * CELL / 2 + Math.cos(a) * 4.4, oz = Z0 + NZ * CELL / 2 + Math.sin(a) * 3.7, oy = 2 + (k % 7);
    const tx = X0 + ((k * 37) % 97) / 97 * NX * CELL, tz = Z0 + ((k * 53) % 89) / 89 * NZ * CELL;
    const dx = tx - ox, dy = at(tx, tz) - 0.3 - oy, dz = tz - oz;
    const t = hitHeightfield(HEIGHTS, NX, NZ, CELL, X0, Z0, ox, oy, oz, dx, dy, dz);
    if (t === null) continue;
    hits++;
    const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
    assert.ok(Math.abs(y - at(x, z)) < 1e-4, `hit ${k} off the surface by ${y - at(x, z)}`);
    for (let s = 0; s < 200; s++) {
      const q: number = (t * s) / 200, px = ox + dx * q, pz = oz + dz * q;
      const inside = px >= X0 && px <= X0 + NX * CELL && pz >= Z0 && pz <= Z0 + NZ * CELL;
      if (inside) assert.ok(oy + dy * q >= at(px, pz) - 1e-4, `line ${k} passes under the terrain before its hit`);
    }
  }
  assert.ok(hits > 300, `${hits} hits`);
  // From under it looking up, and past it, it misses.
  assert.equal(hitHeightfield(HEIGHTS, NX, NZ, CELL, X0, Z0, X0 + 3, -10, Z0 + 3, 0, 1, 0), null);
  assert.equal(hitHeightfield(HEIGHTS, NX, NZ, CELL, X0, Z0, X0 - 5, 3, Z0 - 5, -1, -0.1, 0), null);
});

test('the terrain is drawn in chunks about 16 m a side, at least 8 cells', () => {
  assert.equal(terrainChunkCells(1), 16);
  assert.equal(terrainChunkCells(0.5), 32);
  assert.equal(terrainChunkCells(2), 8);
  assert.equal(terrainChunkCells(4), 8);
});

test('a terrain or a patch whose arrays don\'t fit is refused', () => {
  const ok: TerrainMap = { nx: 4, nz: 3, cell: 1, x0: 0, z0: 0, height: new Float32Array(20), cover: new Uint8Array(12) };
  checkTerrain(ok);
  assert.throws(() => checkTerrain({ ...ok, height: new Float32Array(12) }));
  assert.throws(() => checkTerrain({ ...ok, cover: new Uint8Array(20) }));
  assert.throws(() => checkTerrain({ ...ok, height: Float32Array.from({ length: 20 }, (_, k) => (k === 3 ? NaN : 0)) }));
  assert.throws(() => checkTerrain({ ...ok, map: { x: 1, y: 0, width: 4, height: 3 } }));
  checkTerrainPatch(ok, { x: 1, y: 1, width: 2, height: 2 }, { height: new Float32Array(9), cover: new Uint8Array(4) });
  assert.throws(() => checkTerrainPatch(ok, { x: 1, y: 1, width: 2, height: 2 }, { height: new Float32Array(4) }));
  assert.throws(() => checkTerrainPatch(ok, { x: 3, y: 1, width: 2, height: 2 }, {}));
});
