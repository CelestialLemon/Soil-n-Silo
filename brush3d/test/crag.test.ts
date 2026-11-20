import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { MeshBuilder, rng } from '../src/kit/builder.ts';
import { addCrag, groundOf, type CragOptions } from '../src/kit/kit.ts';
import { CRAG_BOUND, CRAG_TRIANGLES } from '../src/shared.ts';

// `addCrag` keeps what kit/crag.ts promises the game (Soil-n-Silo#257): seen from above, every crag lies inside the shadow
// of its swollen, turned ellipsoid, stands no higher than its top, and is made of `CRAG_TRIANGLES[detail]` triangles.

test('a crag stays inside CRAG_BOUND\'s ellipsoid on any ground, comes near it, and has CRAG_TRIANGLES triangles', () => {
  const grounds = [
    groundOf(() => 0),
    groundOf((x, z) => 0.25 * Math.sin(x * 0.15) + 0.2 * Math.cos(z * 0.12)),
    groundOf((x, z) => 0.8 * x - 0.5 * z),
  ];
  const rand = rng(257), euler = new THREE.Euler(), rot = new THREE.Matrix4();
  let fullest = 0, highest = 0, crags = 0;
  for (const ground of grounds) for (let k = 0; k < 300; k++) {
    const opts: CragOptions = {
      rx: 0.4 + rand() * 2, ry: 0.3 + rand() * 2.4, rz: 0.4 + rand() * 1.8,
      yaw: rand() * Math.PI * 2, pitch: (rand() - 0.5) * 0.6, roll: (rand() - 0.5) * 0.6,
      sink: rand() * 0.6, crag: rand(), moss: rand(), detail: rand() < 0.5 ? 1 : 2,
    };
    const x = (rand() - 0.5) * 60, z = (rand() - 0.5) * 60, b = new MeshBuilder('paint');
    addCrag(b, ground, x, z, opts, rng(Math.floor(rand() * 1e9)));
    const g = b.build(), pos = g.getAttribute('position');
    assert.equal(g.getIndex()?.count, CRAG_TRIANGLES[opts.detail ?? 2] * 3, `detail ${opts.detail} triangles`);

    // The promised ellipsoid, turned as addCrag turns it; its shadow on the ground is the ellipse `q`.
    const swell = CRAG_BOUND.swell + CRAG_BOUND.perCrag * (opts.crag ?? 0.55);
    const a = [opts.rx * swell * CRAG_BOUND.skirt, opts.ry * swell, opts.rz * swell * CRAG_BOUND.skirt];
    const e = rot.makeRotationFromEuler(euler.set(opts.pitch ?? 0, opts.yaw ?? 0, opts.roll ?? 0, 'YXZ')).elements;
    const row = (i: number) => [e[i], e[i + 4], e[i + 8]];
    const dot = (p: number[], q: number[]) => p[0] * q[0] * a[0] ** 2 + p[1] * q[1] * a[1] ** 2 + p[2] * q[2] * a[2] ** 2;
    const qxx = dot(row(0), row(0)), qxz = dot(row(0), row(2)), qzz = dot(row(2), row(2)), det = qxx * qzz - qxz * qxz;
    const top = ground.height(x, z) + opts.ry * (1 - 2 * (opts.sink ?? 0.34)) + Math.sqrt(dot(row(1), row(1)));
    for (let i = 0; i < pos.count; i++) {
      const dx = pos.getX(i) - x, dz = pos.getZ(i) - z;
      const q = (qzz * dx * dx - 2 * qxz * dx * dz + qxx * dz * dz) / det;
      assert.ok(q <= 1 + 1e-6, `a vertex ${Math.sqrt(q).toFixed(4)}× out from the crag's middle, past its promised shadow (${JSON.stringify(opts)})`);
      assert.ok(pos.getY(i) <= top + 1e-5, `a vertex ${(pos.getY(i) - top).toFixed(4)} m over the promised top (${JSON.stringify(opts)})`);
      fullest = Math.max(fullest, Math.sqrt(q));
      highest = Math.max(highest, 1 - (top - pos.getY(i)) / (2 * Math.sqrt(dot(row(1), row(1)))));
    }
    g.dispose();
    crags++;
  }
  assert.equal(crags, 900);
  // A promise far looser than the stone would cost the game room on its rock tiles: the fullest crag comes near it.
  assert.ok(fullest > 0.95, `the furthest vertex reached ${(fullest * 100).toFixed(1)}% of the promised shadow`);
  assert.ok(highest > 0.9, `the highest vertex reached ${(highest * 100).toFixed(1)}% of the way up the promised ellipsoid`);
});
