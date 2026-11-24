import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, canDig, channelPath, channelSummary, FRICTION, type GameState, isWet, JUNCTION, type JunctionPair, junctionPairs, makeRng,
  must, type Point2, previewChannelFlow,
} from '../src/game/index.ts';
import { segmentsCross } from '../src/game/geom.ts';
import { brookLand, flatLand, freshValley, land, same } from './helpers.ts';

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

test('a rill dug along a high bank beside the brook stays dry: touching the water is not drawing from it', () => {
  // A brook along x = -2 (surface -0.2), and east of it a bank standing 1.9 m high, its foot carved down to the bed.
  const s = land({ height: (x) => (x >= 0.5 ? 1.9 : 0), water: (x) => (Math.abs(x + 2) <= 1.5 ? -0.2 : undefined), flow: () => ({ x: 0, z: 0.8 }) });
  const moist = Float32Array.from(s.grid.moisture), water = Float32Array.from(s.grid.waterLevel);
  // Within a metre of the water's edge (x = 0) all its length, its bed well above the water.
  const points = [{ x: 0.9, z: -10 }, { x: 0.9, z: 10 }];
  const preview = previewChannelFlow(s, points);
  for (const p of preview.samples) assert.ok(p.bedHeight > 1, `a high bed at z = ${p.z.toFixed(2)}`);
  assert.ok(!preview.connected && preview.samples.every((p) => !p.wet), 'no water climbs onto the bank');
  const c = dig(s, points);
  assert.ok(c.flow.every((p) => !p.wet));
  assert.ok(same(s.grid.waterLevel, water), 'no rill water on the bank');
  assert.ok(same(s.grid.moisture, moist), 'and no wet bank from it');
  // A rill cut down into the water from the same bank (its line reaching into the brook) does draw from it.
  const tap = previewChannelFlow(s, [{ x: -1.5, z: 12 }, { x: -0.6, z: 12 }, { x: -0.6, z: 20 }]);
  assert.ok(tap.connected);
  for (const p of tap.samples) if (p.wet) assert.ok(p.waterLevel <= -0.2 + 1e-6 && (p.bankHeight <= -0.2 || p.waterLevel > p.bedHeight));
});

test('a rill can\'t be dug where it would leave a track no bridge could cross', () => {
  const s = flatLand();
  // A track ending at z = -10; a rill across its very end would leave it running into a ditch.
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -20, z: -30 }, { x: -20, z: -10 }] }).ok);
  const across = [{ x: -26, z: -10 }, { x: -14, z: -10 }];
  const r = apply(s, { type: 'digChannel', points: across });
  assert.ok(!r.ok && /track/.test(r.error), r.ok ? 'dug' : r.error);
  assert.equal(s.channels.length, 0, 'nothing dug');
  assert.ok(!canDig(s, channelPath(across)).ok, 'the drag says so too');
  // Laid the other way round, the track is refused the same crossing.
  const t = flatLand();
  assert.ok(apply(t, { type: 'digChannel', points: across }).ok);
  assert.ok(!apply(t, { type: 'addTrack', points: [{ x: -20, z: -30 }, { x: -20, z: -10 }] }).ok);
  // Across the track's middle, a bridge spans it: that rill may be dug.
  const mid = apply(s, { type: 'digChannel', points: [{ x: -26, z: -20 }, { x: -14, z: -20 }] });
  assert.ok(mid.ok && mid.value.bridges);
  assert.equal(s.bridges.length, 1);
});

/** Junctions between two rills as the solver first found them: every end against every sample, every segment pair. */
function junctionsByScan(a: readonly Point2[], b: readonly Point2[]): JunctionPair[] {
  const out: JunctionPair[] = [];
  const nearest = (p: Point2, line: readonly Point2[]) => {
    let best = 0, bd = Infinity;
    line.forEach((q, k) => { const d = Math.hypot(p.x - q.x, p.z - q.z); if (d < bd) { bd = d; best = k; } });
    return { k: best, d: bd };
  };
  for (const e of [0, a.length - 1]) { const n = nearest(a[e], b); if (n.d <= JUNCTION) out.push({ ia: e, ib: n.k, d: n.d }); }
  for (const e of [0, b.length - 1]) { const n = nearest(b[e], a); if (n.d <= JUNCTION) out.push({ ia: n.k, ib: e, d: n.d }); }
  for (let i = 1; i < a.length; i++) for (let j = 1; j < b.length; j++) {
    if (segmentsCross(a[i - 1], a[i], b[j - 1], b[j])) out.push({ ia: i, ib: j, d: Math.hypot(a[i].x - b[j].x, a[i].z - b[j].z) });
  }
  return out;
}

test('junctions found by box are the ones a full scan finds, and many rills side by side stay quick to solve', () => {
  // Wandering rills, crossing and ending near each other.
  const r = makeRng(11), rng = () => r.next(), lines: Point2[][] = [];
  for (let k = 0; k < 30; k++) {
    let x = rng() * 40 - 20, z = rng() * 40 - 20, a = rng() * Math.PI * 2;
    const pts: Point2[] = [];
    for (let i = 0; i < 6; i++) { pts.push({ x, z }); a += (rng() - 0.5) * 1.2; x += Math.cos(a) * 6; z += Math.sin(a) * 6; }
    lines.push(channelPath(pts));
  }
  let found = 0;
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const scan = junctionsByScan(lines[i], lines[j]), boxed = junctionPairs(lines[i], lines[j]);
    assert.deepEqual(boxed, scan, `rills ${i} and ${j}`);
    assert.equal(junctionPairs(lines[i], lines[j]), boxed, 'kept while both rills stand');
    found += scan.length;
  }
  assert.ok(found > 20, `${found} junctions`);

  // 25 rills 60 m long, 1.2 m apart (their boxes overlap), fed from the brook; a 26th dragged across them all.
  const s = brookLand();
  for (let k = 0; k < 25; k++) dig(s, [{ x: -1, z: -30 + k * 1.2 }, { x: 59, z: -30 + k * 1.2 }]);
  const drag = [{ x: 30, z: -34 }, { x: 31, z: 0 }, { x: 33, z: 4 }];
  previewChannelFlow(s, drag);
  const t0 = performance.now(), runs = 5;
  for (let k = 0; k < runs; k++) previewChannelFlow(s, drag);
  const ms = (performance.now() - t0) / runs;
  assert.ok(ms < 30, `a preview over 25 rills took ${ms.toFixed(1)} ms`);
});
