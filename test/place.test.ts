import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, canPlace, CATALOG, coreObb, COVER, heightAt, isWet, must, obbDistance, placeThing, type Rect, suggestWaterWheelYaw,
  thingRect, vertexX, vertexZ,
} from '../src/game/index.ts';
import { flatLand, freshValley, land, same, valley } from './helpers.ts';

const contains = (outer: Rect, inner: Rect) => outer.x0 <= inner.x0 && outer.z0 <= inner.z0 && outer.x1 >= inner.x1 && outer.z1 >= inner.z1;

test('buildings go anywhere clear and gentle, at any rotation', () => {
  const s = flatLand();
  for (const [i, yaw] of [0, 0.3, 1.1, 2.5, -2].entries()) {
    const r = apply(s, { type: 'place', kind: 'bench', x: -40 + i * 8, z: 20, yaw });
    assert.ok(r.ok, r.ok ? '' : r.error);
  }
  const f = apply(s, { type: 'place', kind: 'farmhouse', x: 0, z: -20, yaw: 0.77 });
  assert.ok(f.ok);
  const t = must(s.things.find((v) => v.id === f.value.created), 'the farmhouse');
  assert.equal(t.kind, 'farmhouse');
  assert.ok(Math.abs(t.yaw - 0.77) < 1e-12);
  assert.deepEqual(f.value.things, [t.id]);
  assert.equal(f.value.revision, s.revision);
});

test('the rules say why a spot is wrong', () => {
  const s = flatLand();
  const no = (r: { ok: boolean; error?: string }, re: RegExp) => { assert.ok(!r.ok); assert.match(r.error ?? '', re); };
  no(canPlace(s, 'mill', 0, 0, 0), /water/);
  no(canPlace(s, 'mill', 56, -20, 0), /edge/);
  assert.ok(placeThing(s, 'farmhouse', 0, -20, 0).ok);
  no(canPlace(s, 'farmhouse', -30, -20, 0), /already a Farmhouse/);
  no(canPlace(s, 'silo', 8, -20, 0), /overlap the Farmhouse/);
  // Turned 45°, a silo's corner reaches the farmhouse that a square silo beside it would clear.
  assert.ok(canPlace(s, 'silo', 10.2, -20, 0).ok);
  no(canPlace(s, 'silo', 10.2, -20, Math.PI / 4), /overlap/);
  for (const kind of ['silo', 'mill', 'bakery'] as const) {
    assert.ok(placeThing(s, kind, -40 + ['silo', 'mill', 'bakery'].indexOf(kind) * 12, 20, 0).ok);
    no(canPlace(s, kind, 40, 40, 0), /one of each/);
  }
  // Power and props repeat.
  assert.ok(placeThing(s, 'solar', -40, -40, 0).ok && placeThing(s, 'solar', -30, -40, 0).ok);
  const steep = land({ height: (x) => 0.3 * x });
  no(canPlace(steep, 'farmhouse', 0, 0, 0), /steep/);
  assert.ok(canPlace(steep, 'pylon', 0, 0, 0).ok, 'a pole stands on a slope a house cannot');
  const v = valley(), crag = v.crags[0];
  no(canPlace(v, 'bench', crag.x, crag.z, 0), /rock/);
  const tree = v.wildTrees.find((t) => Math.abs(t.x) < 50 && Math.abs(t.z) < 50 && v.crags.every((c) => Math.hypot(c.x - t.x, c.z - t.z) > 6));
  no(canPlace(v, 'planter', must(tree, 'a tree').x + 0.5, must(tree, 'a tree').z, 0), /tree/);
});

test('a water wheel stands on the bank with its wheel in the flowing brook', () => {
  const s = flatLand();
  // The brook runs east along z = 0 (|z| < 2); a wheel 4.5 m north of it facing south (yaw π) dips its wheel in.
  assert.ok(canPlace(s, 'waterwheel', 0, 4.5, Math.PI).ok);
  assert.match(String((canPlace(s, 'waterwheel', 0, 8, 0) as { error: string }).error), /reach into the brook/);
  assert.match(String((canPlace(s, 'waterwheel', 0, 2.5, Math.PI) as { error: string }).error), /dry bank/);
  // The pond (round (30, 30)) lies still: no wheel turns in it.
  assert.match(String((canPlace(s, 'waterwheel', 30, 43, Math.PI) as { error: string }).error), /flowing/);
  // Hovering near the brook suggests facing it.
  const yaw = must(suggestWaterWheelYaw(s, 6, 4.5), 'a facing');
  assert.ok(Math.abs(Math.abs(yaw) - Math.PI) < 0.5, `faces the brook (${yaw})`);
  assert.ok(canPlace(s, 'waterwheel', 6, 4.5, yaw).ok);
  assert.equal(suggestWaterWheelYaw(s, -20, -30), undefined, 'no brook near');
  // In the generated valley too, somewhere along the brook.
  const v = valley(), b = v.valley.brook;
  let found = false;
  for (let i = 20; i < b.length - 20 && !found; i += 3) {
    const p = b[i], q = b[i + 2], len = Math.hypot(q.x - p.x, q.z - p.z);
    for (const side of [1, -1]) for (const off of [4, 4.5, 5, 5.5, 6]) {
      const x = p.x - (side * (q.z - p.z) / len) * off, z = p.z + (side * (q.x - p.x) / len) * off;
      const y = suggestWaterWheelYaw(v, x, z);
      if (y !== undefined && canPlace(v, 'waterwheel', x, z, y).ok) found = true;
    }
  }
  assert.ok(found, 'a water wheel fits somewhere on the brook');
});

test('a placed building settles a flat pad that eases into the slope', () => {
  const s = land({ height: (x, z) => 0.06 * x + 0.02 * z });
  const r = placeThing(s, 'mill', 10, 10, 0.4);
  assert.ok(r.ok);
  const t = s.things[0], g = s.grid;
  assert.ok(Math.abs(heightAt(g, t.x, t.z) - t.padTargetY) < 1e-4, 'its core is flat at the pad height');
  assert.ok(Math.abs(heightAt(g, t.x + 2, t.z - 2) - t.padTargetY) < 1e-4);
  assert.ok(Math.abs(t.padTargetY - (0.06 * 10 + 0.02 * 10)) < 0.05, 'the pad sits at the mean natural ground');
  // Far from it, untouched.
  assert.ok(Math.abs(heightAt(g, 40, 40) - (0.06 * 40 + 0.02 * 40)) < 1e-5);
  assert.equal(g.height[(40 + 80) * (g.nx + 1) + 40 + 80], g.baseHeight[(40 + 80) * (g.nx + 1) + 40 + 80]);
  assert.ok(g.worked[(10 + 80) * g.nx + 10 + 80] === 255);
  assert.equal(g.cover[(10 + 80) * g.nx + 10 + 80], COVER.bare);
});

test('a pad never fills a brook bed', () => {
  const s = flatLand(), g = s.grid, W = g.nx + 1;
  assert.ok(placeThing(s, 'silo', 0, 6, 0).ok);
  let checked = 0;
  for (let iz = 70; iz <= 90; iz++) for (let ix = 70; ix <= 90; ix++) {
    const k = iz * W + ix;
    const wet = [[0, 0], [-1, 0], [0, -1], [-1, -1]].some(([dx, dz]) => isWet(g.baseWaterLevel[(iz + dz) * g.nx + ix + dx]));
    if (!wet) continue;
    checked++;
    assert.ok(g.height[k] <= g.baseHeight[k], `bed vertex (${vertexX(g, ix)}, ${vertexZ(g, iz)}) raised`);
  }
  assert.ok(checked > 10);
});

test('place → move → rotate → remove gives back the valley exactly, with old ∪ new dirty rects', () => {
  const s = freshValley(), g = s.grid, h = s.valley.homestead;
  const placed = apply(s, { type: 'place', kind: 'farmhouse', x: h.x, z: h.z, yaw: 0.3 });
  assert.ok(placed.ok);
  const id = must(placed.value.created, 'its id');
  assert.ok(!same(g.height, g.baseHeight), 'the pad changed the land');
  const before = thingRect(g, must(s.things[0], 'it'));
  const rev = s.revision;
  const moved = apply(s, { type: 'move', id, x: h.x + 3, z: h.z - 2, yaw: 1.2 });
  assert.ok(moved.ok, moved.ok ? '' : moved.error);
  assert.ok(s.revision > rev);
  const after = must(thingRect(g, s.things[0]), 'the new rect');
  const dirty = must(moved.value.height, 'a height rect');
  assert.ok(contains(dirty, must(before, 'the old rect')) && contains(dirty, after), 'the dirty rect holds where it was and is');
  assert.ok(apply(s, { type: 'rotate', id, yaw: -0.5 }).ok);
  assert.ok(Math.abs(s.things[0].yaw + 0.5) < 1e-12);
  const gone = apply(s, { type: 'remove', id });
  assert.ok(gone.ok);
  assert.equal(s.things.length, 0);
  assert.ok(same(g.height, g.baseHeight), 'heights back exactly');
  assert.ok(same(g.landHeight, g.baseHeight));
  assert.ok(same(g.cover, g.baseCover), 'covers back exactly');
  assert.ok(g.worked.every((v) => v === 0));
  // Rejected edits change nothing.
  const rev2 = s.revision;
  assert.ok(!apply(s, { type: 'move', id, x: 0, z: 0 }).ok);
  assert.ok(!apply(s, { type: 'place', kind: 'farmhouse', x: 1000, z: 0, yaw: 0 }).ok);
  assert.equal(s.revision, rev2);
});

test('a solar canopy may stand over a painted field (agrivoltaics); other buildings may not', () => {
  const s = flatLand();
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: -30, z: -20 }, { x: -10, z: -20 }], radius: 6 }).ok);
  assert.ok(placeThing(s, 'solar', -20, -20, 0.2).ok);
  assert.match(String((canPlace(s, 'mill', -12, -20, 0) as { error: string }).error), /field/);
  assert.ok(s.grid.fieldOf[(-20 + 80) * s.grid.nx + (-20 + 80)] !== 0, 'the field stays under the canopy');
  assert.equal(CATALOG.solar.padEase, 0);
});

test('a pad never lifts another building\'s core, and pads settle the same whatever order they were placed in', () => {
  // A 12 % slope rising toward +z: the mill 8 m uphill of the silo, its pad's fringe reaching over the silo's core.
  const slope = () => land({ height: (_x, z) => 0.12 * z });
  const place = (s: ReturnType<typeof slope>, kind: 'silo' | 'mill', z: number) => {
    const r = apply(s, { type: 'place', kind, x: 0, z, yaw: 0 });
    assert.ok(r.ok, r.ok ? '' : r.error);
    return must(s.things.find((t) => t.id === r.value.created), kind);
  };
  const a = slope(), siloA = place(a, 'silo', 0), millA = place(a, 'mill', 8);
  const b = slope(), millB = place(b, 'mill', 8), siloB = place(b, 'silo', 0);
  const g = a.grid, W = g.nx + 1;
  for (const [s, t] of [[a, siloA], [a, millA], [b, siloB], [b, millB]] as const) {
    const core = coreObb(t);
    let n = 0;
    for (let iz = 0; iz <= g.nz; iz++) for (let ix = 0; ix <= g.nx; ix++) {
      if (obbDistance(core, vertexX(g, ix), vertexZ(g, iz)) > 0) continue;
      n++;
      assert.equal(s.grid.height[iz * W + ix], Math.fround(t.padTargetY), `the ${t.kind}'s core is flat at its own height`);
    }
    assert.ok(n > 40, `${n} vertices under the ${t.kind}'s core`);
  }
  assert.equal(siloA.padTargetY, siloB.padTargetY);
  assert.ok(same(a.grid.height, b.grid.height), 'either order settles the same land');
  assert.ok(same(a.grid.worked, b.grid.worked));
  // Taking the mill away gives the silo's pad back as if it stood alone.
  const alone = slope();
  place(alone, 'silo', 0);
  assert.ok(apply(a, { type: 'remove', id: millA.id }).ok);
  assert.ok(same(a.grid.height, alone.grid.height));
});
