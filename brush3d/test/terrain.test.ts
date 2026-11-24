import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { TerrainLand } from '../src/land/terrain.ts';
import type { LandAdder, LandArea } from '../src/land/paint.ts';
import { LAND_COVER, sampleHeightfield, terrainChunkCells, type TerrainMap } from '../src/shared.ts';

// The continuous terrain as drawn (land/terrain.ts, setTerrain): its chunks' triangles are the ones sampleHeightfield reads,
// and a change repaints only the chunks round it, swapped in together.

/** Stands in for the renderer: keeps the meshes the terrain adds. */
class Adder implements LandAdder {
  readonly meshes = new Set<THREE.Mesh>();
  changes = 0;
  add(geometry: THREE.BufferGeometry) { const m = new THREE.Mesh(geometry); this.meshes.add(m); return m; }
  remove(mesh: THREE.Mesh) { assert.ok(this.meshes.delete(mesh), 'removes a mesh it added'); }
  changeGround(_area: THREE.Box3 | null, change: () => void) { this.changes++; change(); }
  prepare() {}
}

/** A 40 × 24 terrain of 1 m cells: a slope with a bump and a rill cut down it on the diagonal. */
function terrain(): TerrainMap {
  const nx = 40, nz = 24, height = new Float32Array((nx + 1) * (nz + 1)), cover = new Uint8Array(nx * nz);
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    height[j * (nx + 1) + i] = 0.05 * i + 0.6 * Math.sin(i * 0.4) * Math.cos(j * 0.3) - (Math.abs(i - j - 8) < 1 ? 0.25 : 0);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) if (Math.abs(i - j - 8) < 1) cover[j * nx + i] = LAND_COVER.rill;
  return { nx, nz, cell: 1, x0: -20, z0: -12, height, cover };
}

/** Every triangle on the terrain's top (not its skirt): its corners and its middle lie on the sampled height. */
function checkTriangles(adder: Adder, m: TerrainMap) {
  const at = (x: number, z: number) => sampleHeightfield(m.height, m.nx, m.nz, m.cell, m.x0, m.z0, x, z);
  let top = 0;
  for (const mesh of adder.meshes) {
    const pos = mesh.geometry.getAttribute('position'), index = mesh.geometry.index!;
    for (let t = 0; t < index.count; t += 3) {
      const v = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, index.getX(t + k)));
      if (!v.every((p) => Math.abs(p.y - at(p.x, p.z)) < 1e-5)) continue;
      top++;
      const mid = v[0].clone().add(v[1]).add(v[2]).divideScalar(3);
      assert.ok(Math.abs(mid.y - at(mid.x, mid.z)) < 1e-5, `a triangle's middle off the sampled height by ${mid.y - at(mid.x, mid.z)}`);
      // It faces up.
      const n = v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0]));
      assert.ok(n.y > 0, 'a top triangle faces down');
    }
  }
  return top;
}

test('setTerrain draws two triangles a cell, in 16 m chunks, exactly on sampleHeightfield', () => {
  const m = terrain(), adder = new Adder(), land = new TerrainLand(adder, m);
  const cc = terrainChunkCells(1);
  assert.equal(land.chunkCells, 16);
  assert.equal(adder.meshes.size, Math.ceil(m.nx / cc) * Math.ceil(m.nz / cc));
  assert.equal(checkTriangles(adder, m), 2 * m.nx * m.nz);
  for (let k = 0; k < 200; k++) {
    const x = m.x0 + ((k * 37) % 401) / 10, z = m.z0 + ((k * 53) % 241) / 10;
    assert.equal(land.heightAt(x, z), sampleHeightfield(m.height, m.nx, m.nz, m.cell, m.x0, m.z0, x, z));
  }
  // A click lands on the drawn surface.
  const hit = land.hit({ origin: new THREE.Vector3(3, 30, -40), direction: new THREE.Vector3(0.1, -0.8, 1).normalize() });
  assert.ok(hit);
  assert.ok(Math.abs(hit.y - land.heightAt(hit.x, hit.z)) < 1e-4);
  land.dispose();
  assert.equal(adder.meshes.size, 0);
});

test('updateTerrain answers at once and repaints only the chunks round the change, swapped in together', () => {
  const m = terrain(), adder = new Adder(), land = new TerrainLand(adder, m);
  const before = new Set(adder.meshes);
  const swaps: LandArea[] = [];
  land.onSwap = (a) => swaps.push(a);
  // A 3 × 2 cell pad raised 0.5 m in the first chunk's middle.
  const rect = { x: 5, y: 5, width: 3, height: 2 }, h = new Float32Array(4 * 3);
  for (let j = 0; j <= 2; j++) for (let i = 0; i <= 3; i++) h[j * 4 + i] = m.height[(5 + j) * (m.nx + 1) + 5 + i] + 0.5;
  assert.ok(land.update(rect, { height: h, worked: new Uint8Array(6).fill(1) }) > 0);
  assert.ok(land.ahead);
  const x = m.x0 + 6.3, z = m.z0 + 5.6;
  assert.ok(Math.abs(land.heightAt(x, z) - sampleHeightfield(m.height, m.nx, m.nz, 1, m.x0, m.z0, x, z) - 0.5) < 1e-5);
  assert.equal(land.revision, 0);
  assert.ok(land.step(Infinity));
  assert.equal(land.revision, 1);
  assert.ok(!land.ahead);
  assert.equal(swaps.length, 1);
  assert.ok(swaps[0].x0 <= m.x0 + 5 && swaps[0].x1 >= m.x0 + 8 && swaps[0].z0 <= m.z0 + 5 && swaps[0].z1 >= m.z0 + 7);
  // The chunks round it were painted again (its paint's dryness follows the lie of the land over DRY_BLUR, 12 m), the
  // furthest kept.
  const kept = [...adder.meshes].filter((k) => before.has(k)).length;
  assert.ok(kept > 0 && kept < adder.meshes.size, `${kept} of ${adder.meshes.size} kept`);
  // The new triangles are the new heights'.
  const raised = { ...m, height: Float32Array.from(m.height) };
  for (let j = 0; j <= 2; j++) for (let i = 0; i <= 3; i++) raised.height[(5 + j) * (m.nx + 1) + 5 + i] = h[j * 4 + i];
  assert.equal(checkTriangles(adder, raised), 2 * m.nx * m.nz);
  // Nothing changed: nothing to do.
  assert.equal(land.update(rect, { height: h }), 0);
  assert.ok(land.step());
  assert.equal(land.revision, 1);
  land.dispose();
});

test('a change on a chunk\'s edge repaints the chunks on both sides', () => {
  const m = terrain(), adder = new Adder(), land = new TerrainLand(adder, m);
  const before = new Set(adder.meshes);
  // The corner shared by the first two chunks along x (at cell 16).
  const h = Float32Array.of(m.height[4 * (m.nx + 1) + 16] + 1);
  land.update({ x: 16, y: 4, width: 0 + 1, height: 1 }, { height: Float32Array.of(h[0], m.height[4 * (m.nx + 1) + 17], m.height[5 * (m.nx + 1) + 16], m.height[5 * (m.nx + 1) + 17]) });
  land.step(Infinity);
  const fresh = [...adder.meshes].filter((k) => !before.has(k)).length;
  assert.ok(fresh >= 2, `${fresh} chunks painted again`);
  assert.equal(checkTriangles(adder, { ...m, height: Float32Array.from(m.height, (v, k) => (k === 4 * (m.nx + 1) + 16 ? h[0] : v)) }), 2 * m.nx * m.nz);
  land.dispose();
});
