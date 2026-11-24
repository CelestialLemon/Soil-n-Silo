import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { cropChunk, cropCode, cropEdgeDistance, EDGE_HALO, OrganicCropField, type CropAdder, type CropMask } from '../src/kit/organicCrop.ts';
import { CROP_NAMES } from '../src/kit/plants.ts';

// The game's crops painted from a mask over the continuous terrain (kit/organicCrop.ts): a field across two chunks meets
// itself with no seam, its blanket stands on the ground under it, and a change paints again only the chunks it reaches.

const ground = (x: number, z: number) => 0.4 * Math.sin(x * 0.21) + 0.3 * Math.cos(z * 0.17) + 0.02 * x;

/** 40 × 20 cells of 1 m from (-10, -5): wheat over the line between the first two chunks (at cell 16), beans in a ragged patch. */
function mask(): CropMask {
  const nx = 40, nz = 20, crop = new Uint8Array(nx * nz), stage = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i;
    if (i >= 9 && i < 24 && j >= 3 && j < 15) { crop[k] = cropCode('wheat'); stage[k] = 2 + (i - 9) / 15; }
    else if (i >= 27 && i < 37 && j >= 4 + (i % 3) && j < 17) { crop[k] = cropCode('beans'); stage[k] = 3; }
  }
  return { nx, nz, cell: 1, x0: -10, z0: -5, crop, stage };
}

/** Stands in for the renderer: keeps the meshes the field adds. */
class Adder implements CropAdder {
  readonly meshes = new Set<THREE.Mesh>();
  add(geometry: THREE.BufferGeometry) { const m = new THREE.Mesh(geometry); this.meshes.add(m); return m; }
  remove(mesh: THREE.Mesh) { assert.ok(this.meshes.delete(mesh), 'removes a mesh it added'); }
}

test('a field\'s edge is measured in the world: the same from any chunk, and continuous', () => {
  const m = mask(), code = cropCode('wheat');
  // Deep in it and far out of it, the halo; on its cells' edge, 0.
  assert.equal(cropEdgeDistance(m, code, m.x0 + 16, m.z0 + 9), EDGE_HALO);
  assert.equal(cropEdgeDistance(m, code, m.x0 + 2, m.z0 + 9), -EDGE_HALO);
  assert.ok(Math.abs(cropEdgeDistance(m, code, m.x0 + 9.5, m.z0 + 9)) <= 0.5 + 1e-9);
  assert.ok(Math.abs(cropEdgeDistance(m, code, m.x0 + 8.5, m.z0 + 9) + 0.5) < 1e-9);
  // Changes no faster than the distance moved (a distance field), so it has no steps.
  for (let k = 0; k < 2000; k++) {
    const x = m.x0 + 6 + ((k * 37) % 211) / 10, z = m.z0 + ((k * 53) % 191) / 10, s = 0.05;
    const d = Math.abs(cropEdgeDistance(m, code, x + s, z) - cropEdgeDistance(m, code, x, z));
    assert.ok(d <= s + 1e-9, `jumps ${d} over ${s} m at ${x}, ${z}`);
  }
});

test('two chunks meet with no seam: their shared points are the same points', () => {
  const m = mask(), o = { heightAt: ground, chunkCells: 16 };
  const a = cropChunk(m, o, 0, 0).mass.build(), b = cropChunk(m, o, 1, 0).mass.build();
  const seamX = m.x0 + 16;
  const seam = (g: THREE.BufferGeometry) => {
    const pos = g.getAttribute('position'), col = g.getAttribute('color'), out = new Map<string, number[]>();
    for (let v = 0; v < pos.count; v++) if (Math.abs(pos.getX(v) - seamX) < 1e-6) {
      out.set(pos.getZ(v).toFixed(4), [pos.getY(v), col.getX(v), col.getY(v), col.getZ(v), ...g.getAttribute('normal').array.slice(v * 3, v * 3 + 3)]);
    }
    return out;
  };
  const sa = seam(a), sb = seam(b);
  assert.ok(sa.size > 20, `${sa.size} seam points`);
  let shared = 0;
  for (const [z, va] of sa) {
    const vb = sb.get(z);
    // A point standing over the ground (in the field, not sunk under the soil past its edge) is in both.
    if (va[0] > ground(seamX, Number(z)) - 0.04 + 1e-5) assert.ok(vb, `seam point at z ${z} only in the first chunk`);
    if (!vb) continue;
    shared++;
    for (let c = 0; c < va.length; c++) assert.ok(Math.abs(va[c] - vb[c]) < 1e-6, `seam point at z ${z} differs`);
  }
  assert.ok(shared > 20);
});

test('the blanket stands on the ground under it, no lower than a little into it', () => {
  const m = mask(), o = { heightAt: ground, chunkCells: 16 };
  for (const cx of [0, 1, 2]) {
    const g = cropChunk(m, o, cx, 0).mass.build(), pos = g.getAttribute('position');
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
      assert.ok(y >= ground(x, z) - 0.04 - 1e-5 && y <= ground(x, z) + 1.55 * 1.08, `a point at ${y} over ground ${ground(x, z)}`);
    }
  }
});

test('every crop at every stage paints', () => {
  for (const name of CROP_NAMES) for (let stage = 0; stage <= 3; stage++) {
    const m: CropMask = { nx: 8, nz: 8, cell: 1, x0: 0, z0: 0, crop: new Uint8Array(64), stage: new Float32Array(64).fill(stage) };
    for (let j = 2; j < 6; j++) for (let i = 2; i < 6; i++) m.crop[j * 8 + i] = cropCode(name);
    const c = cropChunk(m, { heightAt: () => 0 }, 0, 0);
    assert.ok(c.mass.vertexCount > 0, `${name} at ${stage}: no blanket`);
    if (stage > 0) assert.ok(c.stalks.vertexCount + c.dabs.vertexCount > 0, `${name} at ${stage}: nothing standing`);
  }
});

test('a change paints again only the chunks it reaches, and dispose takes everything out', () => {
  const m = mask(), adder = new Adder(), field = new OrganicCropField(adder, m, { heightAt: ground, chunkCells: 16 });
  assert.equal(field.meshes.length, adder.meshes.size);
  assert.ok(field.meshes.every((mesh) => mesh.userData.crop === true));
  const before = new Set(adder.meshes);
  // The beans' patch's middle (cells 30–33, in the third chunk along x): it and the chunk within EDGE_HALO of it (and a cell)
  // are painted again, not the first.
  const n = field.update({ x: 30, y: 8, width: 4, height: 4 }, { stage: new Float32Array(16).fill(1) });
  assert.equal(n, 2);
  const kept = [...adder.meshes].filter((mesh) => before.has(mesh));
  assert.ok(kept.length > 0 && kept.length < adder.meshes.size);
  // Nothing new: nothing painted.
  assert.equal(field.update({ x: 30, y: 8, width: 4, height: 4 }, { stage: new Float32Array(16).fill(1) }), 0);
  field.dispose();
  assert.equal(adder.meshes.size, 0);
  assert.equal(field.meshes.length, 0);
});
