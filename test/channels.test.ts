import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, channelSummary, FRICTION, type GameState, isWet, must, type Point2, previewChannelFlow,
} from '../src/game/index.ts';
import { brookLand, freshValley, land, same } from './helpers.ts';

const at = (s: GameState, x: number, z: number) => Math.floor(z - s.grid.z0) * s.grid.nx + Math.floor(x - s.grid.x0);
const dig = (s: GameState, points: Point2[]) => {
  const r = apply(s, { type: 'digChannel', points });
  assert.ok(r.ok, r.ok ? '' : r.error);
  return must(s.channels.find((c) => c.id === r.value.created), 'the rill');
};

test('a rill led downhill from the brook flows its whole length and wets both banks', () => {
  // Ground falling 3 cm/m east; the brook along x = -2, its surface at -0.14.
  const s = brookLand(), source = -0.14;
  const moistBefore = Float32Array.from(s.grid.moisture);
  const rev = s.revision;
  const r = apply(s, { type: 'digChannel', points: [{ x: -1, z: 0 }, { x: 10, z: 3 }, { x: 20, z: 6 }] });
  assert.ok(r.ok);
  assert.ok(r.value.height && r.value.water && r.value.wet && r.value.cover, 'it reports what changed');
  assert.equal(r.value.revision, rev + 1);
  const c = s.channels[0], sum = channelSummary(c);
  assert.ok(sum.connected && sum.dryLength < 0.01 && sum.wetLength > 20, JSON.stringify({ ...sum, samples: undefined }));
  assert.equal(sum.sillPoint, undefined);
  // Never above its source, and falling along the way.
  let prev = Infinity;
  for (const p of c.flow) {
    assert.ok(p.wet && p.waterLevel <= source + 1e-6 && p.waterLevel <= prev + 1e-6);
    // Past the brook's edge (x = -0.5) and its contact reach, the water keeps inside the cut.
    if (p.x > 1) assert.ok(p.waterLevel > p.bedHeight && p.waterLevel < p.bankHeight, `inside the cut at x = ${p.x.toFixed(2)}`);
    prev = p.waterLevel;
  }
  // The live water layer runs down the rill; its banks are wet now and were dry before.
  assert.ok(isWet(s.grid.waterLevel[at(s, 10, 3)]));
  assert.ok(Math.hypot(s.grid.flowX[at(s, 10, 3)], s.grid.flowZ[at(s, 10, 3)]) > 0);
  for (const [x, z] of [[10, 5.5], [10, 0.5], [18, 8]]) {
    assert.equal(moistBefore[at(s, x, z)], 0);
    assert.ok(s.grid.moisture[at(s, x, z)] > 0.2, `wet bank at (${x}, ${z})`);
  }
});

test('a 20 m climb of +2 cm/m stops dry: water never runs uphill', () => {
  // Ground rising 2 cm/m east; the brook along x = -2, its surface at -0.24.
  const s = land({ height: (x) => 0.02 * x, water: (x) => (Math.abs(x + 2) <= 1.5 ? -0.24 : undefined), flow: () => ({ x: 0, z: 0.8 }) });
  const points = [{ x: -1, z: 0 }, { x: 19, z: 0 }];
  const preview = previewChannelFlow(s, points);
  assert.ok(preview.connected, 'it taps the brook');
  const sill = must(preview.sillPoint, 'a sill');
  assert.ok(sill.x < 4, `the water stops after a few metres (sill at x = ${sill.x.toFixed(2)})`);
  assert.ok(preview.wetLength < 5 && preview.dryLength > 15);
  for (const p of preview.samples) {
    if (p.x > 4) assert.ok(!p.wet, `dry at x = ${p.x.toFixed(2)}`);
    if (p.wet) assert.ok(p.waterLevel <= -0.24 + 1e-6, 'never above the brook it left');
  }
  const c = dig(s, points);
  assert.deepEqual(c.flow, preview.samples, 'the dug rill matches its preview');
  // Past the sill: no water, no wet bank.
  assert.ok(!isWet(s.grid.waterLevel[at(s, 12, 0)]));
  assert.equal(s.grid.moisture[at(s, 12, 2)], 0);
  assert.equal(s.grid.moisture[at(s, 15, 0)], 0);
});

test('on level ground water runs only as far as its fall allows', () => {
  // Dead flat: the water loses FRICTION a metre and has only its few centimetres over the bed to lose.
  const s = land({ height: () => 0, water: (x) => (Math.abs(x + 2) <= 1.5 ? -0.12 : undefined) });
  const p = previewChannelFlow(s, [{ x: -1, z: 0 }, { x: 39, z: 0 }]);
  assert.ok(p.connected && p.sillPoint);
  assert.ok(p.wetLength > 2 && p.wetLength < 0.3 / FRICTION, `${p.wetLength} m`);
});

test('rills dug side by side, 1 m or 2 m apart, never leak into each other', () => {
  for (const gap of [1, 2]) {
    const s = brookLand();
    const a = dig(s, [{ x: -1, z: 0 }, { x: 20, z: 0 }]);
    // Starts 1.5 m from the brook's edge: it touches neither the brook nor the other rill's line.
    const b = dig(s, [{ x: 1.5, z: gap }, { x: 20, z: gap }]);
    assert.ok(channelSummary(a).dryLength < 0.01, 'the tapped rill flows');
    assert.ok(b.flow.every((p) => !p.wet), `the rill ${gap} m off stays dry`);
    if (gap === 2) {
      assert.ok(!isWet(s.grid.waterLevel[at(s, 10, 2)]), 'no water in its cells');
      assert.ok(isWet(s.grid.waterLevel[at(s, 10, 0)]));
    }
  }
});

test('a rill joined to a flowing one at an explicit junction flows too', () => {
  const s = brookLand();
  dig(s, [{ x: -1, z: 0 }, { x: 20, z: 0 }]);
  const branch = dig(s, [{ x: 10, z: 0.3 }, { x: 16, z: 8 }, { x: 24, z: 14 }]);
  assert.ok(channelSummary(branch).connected);
  assert.ok(branch.flow.every((p) => p.wet));
  const tapAt = must(s.channels[0].flow.find((p) => Math.abs(p.x - 10) < 0.3), 'the tap');
  for (const p of branch.flow) assert.ok(p.waterLevel <= tapAt.waterLevel + 1e-6, 'no higher than where it branched');
});

test('the live preview is exactly what digging gives, even meeting other rills', () => {
  const s = brookLand();
  dig(s, [{ x: -1, z: 0 }, { x: 20, z: 0 }]);
  const pts = [{ x: 12, z: 0.4 }, { x: 18, z: -6 }, { x: 22, z: -14 }];
  const before = s.revision, height = Float32Array.from(s.grid.height), water = Float32Array.from(s.grid.waterLevel);
  const preview = previewChannelFlow(s, pts);
  assert.equal(s.revision, before, 'previewing changes nothing');
  assert.ok(same(s.grid.height, height) && same(s.grid.waterLevel, water));
  assert.ok(preview.connected && preview.wetLength > 10, 'it branches off the flowing rill');
  const c = dig(s, pts);
  assert.deepEqual(c.flow, preview.samples);
  assert.deepEqual(channelSummary(c), preview);
});

test('filling a rill dries its banks and gives back the ground exactly', () => {
  const s = brookLand(), g = s.grid;
  const moist = Float32Array.from(g.moisture), water = Float32Array.from(g.waterLevel), cover = Uint8Array.from(g.cover);
  const a = dig(s, [{ x: -1, z: 0 }, { x: 10, z: 3 }, { x: 20, z: 6 }]);
  const b = dig(s, [{ x: 5, z: 1.7 }, { x: 5, z: 20 }]);
  assert.ok(!same(g.height, g.baseHeight));
  assert.ok(apply(s, { type: 'fillChannel', id: a.id }).ok);
  assert.ok(b.flow.every((p) => !p.wet), 'cut off from its source, the branch runs dry');
  assert.ok(apply(s, { type: 'fillChannel', id: b.id }).ok);
  assert.ok(same(g.height, g.baseHeight), 'heights exactly back');
  assert.ok(same(g.landHeight, g.baseHeight));
  assert.ok(same(g.waterLevel, water) && same(g.moisture, moist) && same(g.cover, cover));
  assert.ok(!apply(s, { type: 'fillChannel', id: a.id }).ok);
});

test('rills keep out of buildings, rock and the valley\'s edge', () => {
  const s = brookLand();
  assert.ok(apply(s, { type: 'place', kind: 'mill', x: 20, z: 20, yaw: 0 }).ok);
  const r = apply(s, { type: 'digChannel', points: [{ x: 10, z: 20 }, { x: 30, z: 20 }] });
  assert.ok(!r.ok && /Mill/.test(r.error));
  assert.ok(!apply(s, { type: 'digChannel', points: [{ x: 40, z: 40 }, { x: 70, z: 40 }] }).ok);
  assert.ok(!apply(s, { type: 'digChannel', points: [{ x: 0, z: 30 }, { x: 0.5, z: 30 }] }).ok, 'too short');
});

test('in the generated valley, a rill led downstream from the brook flows and wets its banks', () => {
  const s = freshValley(), b = s.valley.brook, h = s.valley.homestead;
  let bi = 0;
  b.forEach((p, i) => { if (Math.hypot(p.x - h.x, p.z - h.z) < Math.hypot(b[bi].x - h.x, b[bi].z - h.z)) bi = i; });
  const p = b[bi], q = b[bi + 3], len = Math.hypot(q.x - p.x, q.z - p.z);
  const tx = (q.x - p.x) / len, tz = (q.z - p.z) / len;
  const side = (h.x - p.x) * -tz + (h.z - p.z) * tx > 0 ? 1 : -1;
  let best = 0, bestPts: Point2[] = [];
  for (const ang of [0.1, 0.2, 0.3, 0.4]) {
    const dx = tx * Math.cos(ang) - side * tz * Math.sin(ang), dz = tz * Math.cos(ang) + side * tx * Math.sin(ang);
    const pts = [0, 6, 12, 18].map((k) => ({ x: p.x + dx * k, z: p.z + dz * k }));
    const wet = previewChannelFlow(s, pts).wetLength;
    if (wet > best) { best = wet; bestPts = pts; }
  }
  assert.ok(best >= 10, `a rill flows ${best.toFixed(1)} m`);
  const c = dig(s, bestPts);
  const top = Math.max(...s.valley.brookLevel.slice(Math.max(0, bi - 10), bi + 10));
  for (const f of c.flow) if (f.wet) assert.ok(f.waterLevel <= top + 1e-6);
  assert.ok(channelSummary(c).wetLength >= 10);
});
