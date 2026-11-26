// Field outlines (#318): a closed polygon of corners, filled with a crop (or cleared) on the 1 m grid by its cells' centres.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, cellX, cellZ, COVER, type Crop, deserializeSave, eraseFieldPolygon, type GameState, MAX_PATH_POINTS, must, obbDistance, paintFieldPolygon,
  type Point2, serializeSave, thingObb,
} from '../src/game/index.ts';
import { freshValley, land } from './helpers.ts';

const flat = () => land({ height: () => 0 });
const rect = (x0: number, z0: number, x1: number, z1: number): Point2[] => [{ x: x0, z: z0 }, { x: x1, z: z0 }, { x: x1, z: z1 }, { x: x0, z: z1 }];
/** The cells growing a field, as their centres. */
function fieldCells(s: GameState): Point2[] {
  const g = s.grid, out: Point2[] = [];
  for (let i = 0; i < g.fieldOf.length; i++) if (g.fieldOf[i] !== 0) out.push({ x: cellX(g, i % g.nx), z: cellZ(g, Math.floor(i / g.nx)) });
  return out;
}
const paint = (s: GameState, crop: Crop, points: Point2[]) => {
  const r = apply(s, { type: 'paintFieldPolygon', crop, points });
  assert.ok(r.ok, r.ok ? '' : r.error);
  return r.value;
};

test('a rectangle outline fills exactly the cells whose centres lie inside it', () => {
  const s = flat();
  paint(s, 'wheat', rect(0, 0, 10, 6));
  assert.equal(s.fields.length, 1);
  assert.equal(s.fields[0].crop, 'wheat');
  assert.equal(s.fields[0].cellCount, 60);
  assert.equal(s.fields[0].areaM2, 60);
  for (const p of fieldCells(s)) assert.ok(p.x > 0 && p.x < 10 && p.z > 0 && p.z < 6, `${p.x}, ${p.z} inside`);
  // The same outline clockwise fills the same cells.
  const t = flat();
  paint(t, 'wheat', rect(0, 0, 10, 6).reverse());
  assert.equal(t.fields[0].cellCount, 60);
});

test('a concave L-shaped outline fills its L, not its hull', () => {
  const s = flat();
  paint(s, 'beans', [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 4 }, { x: 4, z: 4 }, { x: 4, z: 10 }, { x: 0, z: 10 }]);
  assert.equal(s.fields.length, 1);
  assert.equal(s.fields[0].cellCount, 10 * 4 + 4 * 6);
  for (const p of fieldCells(s)) assert.ok(!(p.x > 4 && p.z > 4), `${p.x}, ${p.z} is in the notch`);
});

test('corners on cell centres count each cell once: outlines sharing an edge tile the ground', () => {
  const s = flat();
  // Every corner and edge passes right through cell centres.
  paint(s, 'wheat', rect(0.5, 0.5, 5.5, 5.5));
  assert.equal(s.fields[0].cellCount, 25, 'as many cells as square metres');
  // A neighbour sharing its east edge: no cell painted twice, none left out between them.
  paint(s, 'beans', rect(5.5, 0.5, 9.5, 5.5));
  const wheat = must(s.fields.find((f) => f.crop === 'wheat'), 'wheat'), beans = must(s.fields.find((f) => f.crop === 'beans'), 'beans');
  assert.equal(wheat.cellCount, 25, 'the wheat keeps its cells');
  assert.equal(beans.cellCount, 20);
  // A diamond whose corners sit on cell centres.
  const t = flat();
  paint(t, 'flax', [{ x: 0.5, z: -4.5 }, { x: 5.5, z: 0.5 }, { x: 0.5, z: 5.5 }, { x: -4.5, z: 0.5 }]);
  assert.equal(t.fields[0].cellCount, 50, 'a 50 m² diamond');
});

test('an outline plants only where a field may grow: round buildings, off the water', () => {
  const s = land({ height: () => 0, water: (_x, z) => (z >= 2 && z < 3 ? -0.02 : undefined), depth: 0.05 });
  assert.ok(apply(s, { type: 'place', kind: 'silo', x: 15, z: -4, yaw: 0 }).ok);
  const silo = must(s.things.find((t) => t.kind === 'silo'), 'the silo');
  paint(s, 'wheat', rect(0, -8, 20, 8));
  const g = s.grid, cells = fieldCells(s);
  assert.ok(cells.length > 0 && cells.length < 20 * 16, `${cells.length} cells planted`);
  for (const p of cells) {
    const i = Math.floor(p.z - g.z0) * g.nx + Math.floor(p.x - g.x0);
    assert.notEqual(g.cover[i] === COVER.water ? 'water' : 'land', 'water', `no crop on the water at ${p.x}, ${p.z}`);
    assert.ok(obbDistance(thingObb(silo), p.x, p.z) > 0, `no crop under the silo at ${p.x}, ${p.z}`);
  }
  assert.equal(s.fields.length, 2, 'the water strip parts it in two');
});

test('erasing an outline clears just the fields inside it, and can split one', () => {
  const s = flat();
  paint(s, 'wheat', rect(0, 0, 20, 6));
  const r = apply(s, { type: 'eraseFieldPolygon', points: rect(8, -2, 12, 8) });
  assert.ok(r.ok, r.ok ? '' : r.error);
  assert.equal(s.fields.length, 2, 'split in two');
  assert.equal(s.fields.reduce((n, f) => n + f.cellCount, 0), 120 - 24);
  assert.ok(apply(s, { type: 'eraseFieldPolygon', points: rect(-1, -1, 21, 7) }).ok);
  assert.equal(s.fields.length, 0);
  assert.equal(fieldCells(s).length, 0);
});

test('a bad outline is refused, and the land is left as it was', () => {
  const s = flat();
  paint(s, 'wheat', rect(0, 0, 4, 4));
  const before = Uint16Array.from(s.grid.fieldOf);
  const refused = (r: { ok: boolean }, why: string) => assert.ok(!r.ok, why);
  refused(paintFieldPolygon(s, 'wheat', [{ x: 0, z: 0 }, { x: 5, z: 5 }]), 'two corners');
  refused(eraseFieldPolygon(s, [{ x: 0, z: 0 }, { x: 5, z: 5 }]), 'two corners');
  refused(paintFieldPolygon(s, 'wheat', []), 'no corners');
  const many = Array.from({ length: MAX_PATH_POINTS + 1 }, (_, k) => {
    const a = (k / (MAX_PATH_POINTS + 1)) * Math.PI * 2;
    return { x: 20 + Math.cos(a) * 8, z: Math.sin(a) * 8 };
  });
  refused(paintFieldPolygon(s, 'wheat', many), 'too many corners');
  assert.ok(paintFieldPolygon(s, 'wheat', many.slice(0, MAX_PATH_POINTS)).ok, 'the most corners an outline holds');
  const after = Uint16Array.from(s.grid.fieldOf);
  refused(paintFieldPolygon(s, 'wheat', [{ x: 0, z: 0 }, { x: Number.NaN, z: 5 }, { x: 5, z: 0 }]), 'a corner off the valley');
  refused(paintFieldPolygon(s, 'wheat', [{ x: 0, z: 0 }, { x: Infinity, z: 5 }, { x: 5, z: 0 }]), 'a corner off the valley');
  refused(paintFieldPolygon(s, 'rye' as Crop, rect(30, 0, 34, 4)), 'no such crop');
  refused(paintFieldPolygon(s, 'wheat', [{ x: 30, z: 0 }, { x: 34, z: 0 }, { x: 38, z: 0 }]), 'a flat outline holds no ground');
  refused(paintFieldPolygon(s, 'wheat', rect(500, 500, 510, 510)), 'off the land');
  refused(eraseFieldPolygon(s, rect(-30, -30, -20, -20)), 'no field there to clear');
  assert.deepEqual(Uint16Array.from(s.grid.fieldOf), after, 'nothing changed by the refusals');
  assert.notDeepEqual(after, before);
});

test('an outline painted over its own crop changes nothing, and is no error', () => {
  const s = flat();
  paint(s, 'wheat', rect(0, 0, 6, 6));
  const r = paintFieldPolygon(s, 'wheat', rect(1, 1, 5, 5));
  assert.ok(r.ok);
  assert.deepEqual(r.value.fieldIds, []);
});

test('outlined fields save and load as they were', () => {
  const s = freshValley(), h = s.valley.homestead;
  paint(s, 'tomato', [{ x: h.x, z: h.z }, { x: h.x + 12, z: h.z }, { x: h.x + 12, z: h.z + 5 }, { x: h.x + 5, z: h.z + 5 }, { x: h.x + 5, z: h.z + 12 }, { x: h.x, z: h.z + 12 }]);
  paint(s, 'sunflower', rect(h.x - 20, h.z - 14, h.x - 10, h.z - 8));
  assert.ok(s.fields.length >= 2);
  const back = deserializeSave(serializeSave(s));
  assert.ok(back.ok, back.ok ? '' : back.error);
  assert.deepEqual(back.value.fields.map((f) => [f.id, f.crop, f.cellCount]), s.fields.map((f) => [f.id, f.crop, f.cellCount]));
  assert.deepEqual(Uint16Array.from(back.value.grid.fieldOf), Uint16Array.from(s.grid.fieldOf));
});
