// The Sprinkler (#318): a centred, turnable 20 × 14 m patch, and a pump that draws less the nearer the water it lifts from.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, cellX, cellZ, distanceToWater, type GameState, hasServiceArea, hasServiceRadius, must, obbDistance, serviceSite, SPRINKLER_BOX, SPRINKLER_FAR_W,
  SPRINKLER_NEAR_W, sandboxSupplies, sprinklerObb, sprinklerPowerW, stepSim, type Thing,
} from '../src/game/index.ts';
import { brookLand, building, flatLand, land } from './helpers.ts';

/** A dry, level land with one big wheat field round the origin. */
function bigField(): GameState {
  const s = land({ height: () => 12 });
  const r = apply(s, { type: 'paintFieldPolygon', crop: 'wheat', points: [{ x: -25, z: -25 }, { x: 25, z: -25 }, { x: 25, z: 25 }, { x: -25, z: 25 }] });
  assert.ok(r.ok, r.ok ? '' : r.error);
  return s;
}
const covered = (s: GameState, t: Thing) => new Set(serviceSite(s, t).cells.get(s.fields[0].id) ?? []);
const cellAt = (s: GameState, x: number, z: number) => Math.floor(z - s.grid.z0) * s.grid.nx + Math.floor(x - s.grid.x0);

test('a Sprinkler waters a 20 × 14 m patch centred on it, turned with it', () => {
  const s = bigField(), t = building(s, 'sprinkler', 0, 0).t;
  assert.ok(hasServiceArea('sprinkler') && !hasServiceRadius('sprinkler'), 'a patch, not a circle');
  assert.ok(hasServiceArea('beehive') && hasServiceRadius('rain_tank'));
  // Facing its yaw of 0, 20 m across x and 14 m along z.
  const flat = covered(s, t);
  assert.equal(flat.size, 2 * SPRINKLER_BOX.halfW * 2 * SPRINKLER_BOX.halfD);
  assert.ok(flat.has(cellAt(s, 9.5, 0)) && flat.has(cellAt(s, -9.5, 6.5)));
  assert.ok(!flat.has(cellAt(s, 0, 9.5)) && !flat.has(cellAt(s, 10.5, 0)) && !flat.has(cellAt(s, 0, 7.5)));
  // A quarter turn swaps its sides.
  t.yaw = Math.PI / 2;
  const turned = covered(s, t);
  assert.equal(turned.size, flat.size);
  assert.ok(turned.has(cellAt(s, 0, 9.5)) && !turned.has(cellAt(s, 9.5, 0)));
  for (const i of turned) assert.ok(Math.abs(cellX(s.grid, i % s.grid.nx)) < 7 && Math.abs(cellZ(s.grid, Math.floor(i / s.grid.nx))) < 10);
  // An eighth turn: about the same area, along the diagonal.
  t.yaw = Math.PI / 4;
  const diagonal = covered(s, t);
  assert.ok(Math.abs(diagonal.size - flat.size) <= 12, `${diagonal.size} cells`);
  assert.notEqual(diagonal.has(cellAt(s, 6, 6)), diagonal.has(cellAt(s, -6, 6)), 'one diagonal in its patch, the other out');
  for (let i = 0; i < s.grid.fieldOf.length; i++) {
    if (s.grid.fieldOf[i] === 0) continue;
    const x = cellX(s.grid, i % s.grid.nx), z = cellZ(s.grid, Math.floor(i / s.grid.nx));
    assert.equal(diagonal.has(i), obbDistance(sprinklerObb(t), x, z) <= 0, `the patch the world draws at ${x}, ${z}`);
  }
});

test('turning or moving a Sprinkler waters its new patch at once', () => {
  const s = bigField(), t = building(s, 'sprinkler', 0, 0).t, revision = s.revision;
  assert.ok(covered(s, t).has(cellAt(s, 9.5, 0)));
  t.yaw = Math.PI / 2;
  assert.ok(!covered(s, t).has(cellAt(s, 9.5, 0)), 'turned, with the land unchanged');
  t.x = 9;
  assert.ok(covered(s, t).has(cellAt(s, 15.5, 0)), 'moved');
  assert.equal(s.revision, revision);
  // Through the rules too (beside the field: a Sprinkler stands off the crops).
  s.sim.supplies = sandboxSupplies();
  const r = apply(s, { type: 'place', kind: 'sprinkler', x: -30, z: -15, yaw: 0 });
  assert.ok(r.ok, r.ok ? '' : r.error);
  const placed = () => must(s.things.find((v) => v.id === (r.ok ? r.value.created : -1)), 'the placed sprinkler');
  assert.ok(covered(s, placed()).has(cellAt(s, -21.5, -15)) && !covered(s, placed()).has(cellAt(s, -24.5, -6.5)));
  assert.ok(apply(s, { type: 'rotate', id: placed().id, yaw: Math.PI / 2 }).ok);
  assert.ok(!covered(s, placed()).has(cellAt(s, -21.5, -15)) && covered(s, placed()).has(cellAt(s, -24.5, -6.5)), 'turned');
});

test('a Sprinkler draws 0.5 W by the water, up to 2 W far from it', () => {
  // Level ground, the brook along z = 0 (|z| <= 1.5).
  const s = flatLand();
  const at = (z: number) => sprinklerPowerW(s, { x: -40, z });
  assert.ok(Math.abs(distanceToWater(s, { x: -40, z: -20 }) - 18) <= 1, `${distanceToWater(s, { x: -40, z: -20 })} m`);
  assert.equal(at(-4), SPRINKLER_NEAR_W);
  assert.equal(at(-11), SPRINKLER_NEAR_W, 'within 10 m');
  assert.equal(at(-50), SPRINKLER_FAR_W, 'beyond 35 m');
  assert.equal(at(-70), SPRINKLER_FAR_W);
  // Between, evenly (to the nearest 0.05 W).
  for (const z of [-15, -20, -25, -30, -35]) {
    const d = distanceToWater(s, { x: -40, z }), w = at(z), even = 0.5 + 1.5 * Math.min(1, Math.max(0, (d - 10) / 25));
    assert.ok(Math.abs(w - even) <= 0.025 + 1e-9, `${w} W at ${d} m`);
    assert.ok(Math.abs(w * 20 - Math.round(w * 20)) < 1e-9, `${w} W is a multiple of 0.05 W`);
    assert.ok(w > SPRINKLER_NEAR_W && w < SPRINKLER_FAR_W);
  }
  assert.ok(at(-20) < at(-30), 'farther draws more');
  // No water at all: the full 2 W.
  const dry = land({ height: () => 0 });
  assert.equal(distanceToWater(dry, { x: 0, z: 0 }), Infinity);
  assert.equal(sprinklerPowerW(dry, { x: 0, z: 0 }), SPRINKLER_FAR_W);
});

test('a flowing rill dug near a Sprinkler eases its pump, and it draws what it needs while it runs', () => {
  // Ground falling east from a brook along x = -2.
  const s = brookLand(), spot = { x: 22, z: 30 };
  const field = apply(s, { type: 'paintFieldPolygon', crop: 'wheat', points: [{ x: 14, z: 25 }, { x: 30, z: 25 }, { x: 30, z: 35 }, { x: 14, z: 35 }] });
  assert.ok(field.ok, field.ok ? '' : field.error);
  const far = sprinklerPowerW(s, spot);
  assert.ok(far > 1 && far < SPRINKLER_FAR_W, `${far} W some 24 m from the brook`);
  const sprinkler = building(s, 'sprinkler', spot.x, spot.z);
  building(s, 'turbine', 34, 30);
  s.sim.hour = 12;
  stepSim(s, 1, { windSpeed: 12, cloudCover: 0 });
  assert.equal(sprinkler.r.watts, far, 'it draws its own figure');
  assert.match(sprinkler.r.status, new RegExp(`Watering nearby fields · ${far.toFixed(2).replace(/0$/, '').replace('.', '\\.')} W`));
  // A rill dug downhill from the brook, past the field's south side.
  const dug = apply(s, { type: 'digChannel', points: [{ x: -1, z: 20 }, { x: 20, z: 22 }, { x: 40, z: 23 }] });
  assert.ok(dug.ok, dug.ok ? '' : dug.error);
  assert.ok(must(s.channels[0], 'the rill').flow.some((f) => f.wet), 'it flows');
  const near = sprinklerPowerW(s, spot);
  assert.ok(near < far, `${near} W once the rill flows ${distanceToWater(s, spot).toFixed(1)} m away`);
  assert.equal(near, SPRINKLER_NEAR_W);
  stepSim(s, 1, { windSpeed: 12, cloudCover: 0 });
  assert.equal(sprinkler.r.watts, SPRINKLER_NEAR_W, 'still watering the dry north of the field, at the lighter draw');
});
