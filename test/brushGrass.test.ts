import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { MeshBuilder, rng, srgb } from '../brush3d/src/kit/builder.ts';
import { addTuft, groundOf } from '../brush3d/src/kit/kit.ts';
import { GRASS_INK, Picker } from '../brush3d/src/renderer/pick.ts';
import { place, remove, removeAt, reshape } from '../src/game/build.ts';
import { GROUND } from '../src/game/ground.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { must } from '../src/game/result.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { newGame, sizeOf, type Dir } from '../src/game/state.ts';
import { COUNTRY, landRelief, Lie } from '../src/world/ground.ts';
import { YAW } from '../src/world/brush/catalog.ts';
import {
  blockKey, blockSig, boxesIn, BUILDING_MARGIN, CLIFF_MARGIN, FIELD_MARGIN, fringeFade, GRASS_BLOCK, GRASS_FRINGE,
  GRASS_MODES, GRASS_PROFILES, grassBlocks, inBuilding, MAX_BLADE_REACH, ROCK_MARGIN, tileHabitat, tileSeed,
  WATER_MARGIN, wetDistance,
} from '../src/world/brush/grassMask.ts';
import { TILE } from '../src/world/brush/scale.ts';

// Pure placement, masking, seasonal sizing, emitted-geometry containment, chunked block-rebuild, and picking rules for
// meadow grass tufts (src/world/brush/grassMask.ts, brush3d/src/renderer/pick.ts, #256).

/** Exact `wheelRace` geometry from brush3d/src/models/catalog.ts (without Vite's `import.meta.glob`). */
function wheelRace(lx: number, lz: number, margin = 0.5) {
  const ease = (a: number, b: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  return (1 - ease(1, 1 + margin, Math.abs(lx))) * ease(1.7 - margin, 1.7, lz) * (1 - ease(8, 8 + margin, lz));
}

test('non-grass tiles, off-map tracks, and steep banks are excluded from grass tufts', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), relief = landRelief(land), wet = wetDistance(land);
  const { width: w, height: h } = s.map, M = land.margin;
  let checkedWater = 0, checkedTree = 0, checkedRock = 0, checkedGrass = 0, checkedTrack = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const t = s.map.terrain[y * w + x];
    const hab = tileHabitat(s, land, relief, wet, x, y, true);
    if (t === TERRAIN.water) { assert.equal(hab, null); checkedWater++; }
    else if (t === TERRAIN.tree) { assert.equal(hab, null); checkedTree++; }
    else if (t === TERRAIN.rock) { assert.equal(hab, null); checkedRock++; }
    else if (hab) checkedGrass++;
  }
  for (let y = -4; y < h + 4; y++) for (let x = -4; x < w + 4; x++) {
    if (x >= 0 && y >= 0 && x < w && y < h) continue;
    const li = (y + M) * land.width + (x + M);
    if (land.track[li] === 1) {
      assert.equal(tileHabitat(s, land, relief, wet, x, y, false), null);
      checkedTrack++;
    }
  }
  assert.ok(checkedWater > 0 && checkedTree > 0 && checkedRock > 0 && checkedGrass > 0 && checkedTrack > 0);
});

test('edge margins tighten next to water, rocks, cliffs, and the playable map edge', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), relief = landRelief(land), wet = wetDistance(land);
  const { width: w, height: h } = s.map, M = land.margin;
  let tx = -1, ty = -1;
  for (let y = 4; y < h - 4 && tx < 0; y++) for (let x = 4; x < w - 4 && tx < 0; x++) {
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) {
      if (s.map.terrain[(y + dy) * w + (x + dx)] !== TERRAIN.grass) ok = false;
    }
    if (ok && tileHabitat(s, land, relief, wet, x, y, true)) { tx = x; ty = y; }
  }
  assert.ok(tx >= 0, 'found open grass patch');

  s.map.terrain[(ty - 1) * w + tx] = TERRAIN.water;
  const nearWater = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(nearWater.minV >= WATER_MARGIN);

  s.map.terrain[ty * w + (tx + 1)] = TERRAIN.rock;
  const nearRock = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(nearRock.maxU <= TILE - ROCK_MARGIN);
  assert.ok(nearRock.rockBoost > 0);

  const southLi = (ty + 1 + M) * land.width + (tx + M);
  for (let k = 0; k < 4; k++) land.corner[southLi * 4 + k] += 3;
  const nearCliff = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(nearCliff.maxV <= TILE - CLIFF_MARGIN);

  let fx = -1;
  for (let x = 2; x < w - 2; x++) {
    const li = (-1 + M) * land.width + (x + M);
    if (land.terrain[li] === TERRAIN.grass && land.track[li] === 0 && tileHabitat(s, land, relief, wet, x, -1, false)) {
      fx = x; break;
    }
  }
  assert.ok(fx >= 0, 'found grass country fringe tile');
  const fringe = tileHabitat(s, land, relief, wet, fx, -1, false)!;
  assert.ok(fringe.maxV <= TILE - (BUILDING_MARGIN + 0.05));
});

test('habitat modifiers: tree skirts boost, deep woods thin, stony/sand thin, winter shortens tufts', () => {
  const springSc = must(scenarioById('c7'), 'c7');
  const winterSc = must(scenarioById('c5'), 'c5');
  const s = newGame(springSc), land = generateLand(springSc, COUNTRY), relief = landRelief(land), wet = wetDistance(land);
  const { width: w, height: h } = s.map;
  let tx = -1, ty = -1;
  for (let y = 4; y < h - 4 && tx < 0; y++) for (let x = 4; x < w - 4 && tx < 0; x++) {
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) {
      if (s.map.terrain[(y + dy) * w + (x + dx)] !== TERRAIN.grass) ok = false;
    }
    if (ok && tileHabitat(s, land, relief, wet, x, y, true)) { tx = x; ty = y; }
  }
  assert.ok(tx >= 0);

  s.map.ground[ty * w + tx] = GROUND.loam;
  const open = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.equal(open.skirtBoost, 0);
  assert.equal(open.deepWoods, 1);
  assert.equal(open.seasonDensity, 1);
  assert.equal(open.heightScale, 1);

  s.map.terrain[(ty - 1) * w + tx] = TERRAIN.tree;
  s.map.terrain[(ty + 1) * w + tx] = TERRAIN.tree;
  const skirt = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(skirt.skirtBoost > 0);
  assert.equal(skirt.deepWoods, 1);

  s.map.terrain[ty * w + (tx - 1)] = TERRAIN.tree;
  s.map.terrain[ty * w + (tx + 1)] = TERRAIN.tree;
  s.map.terrain[(ty - 1) * w + (tx - 1)] = TERRAIN.tree;
  const woods = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.equal(woods.skirtBoost, 0);
  assert.ok(woods.deepWoods < 0.4);

  s.map.ground[ty * w + tx] = GROUND.stony;
  const stony = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(stony.groundScale < 0.75);
  assert.ok(stony.heightScale < 0.9);

  const sw = newGame(winterSc), lw = generateLand(winterSc, COUNTRY), rw = landRelief(lw), ww = wetDistance(lw);
  let wHab = null;
  for (let y = 2; y < sw.map.height - 2 && !wHab; y++) for (let x = 2; x < sw.map.width - 2 && !wHab; x++) {
    if (sw.map.ground[y * sw.map.width + x] === GROUND.loam) wHab = tileHabitat(sw, lw, rw, ww, x, y, true);
  }
  assert.ok(wHab);
  assert.equal(wHab.seasonDensity, 0.80);
  assert.equal(wHab.heightScale, 0.60);
});

test('building, field, and water-wheel race footprints mask grass cleanly and clear full blade reach', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc);
  s.credits = 1e6;
  assert.ok(MAX_BLADE_REACH < FIELD_MARGIN, `MAX_BLADE_REACH (${MAX_BLADE_REACH}) must be < FIELD_MARGIN (${FIELD_MARGIN})`);
  assert.ok(FIELD_MARGIN < BUILDING_MARGIN, `FIELD_MARGIN (${FIELD_MARGIN}) must be < BUILDING_MARGIN (${BUILDING_MARGIN})`);

  const depot = s.buildings[0];
  const dBoxes = boxesIn(s, depot.x - 1, depot.y - 1, depot.x + sizeOf(depot) + 1, depot.y + sizeOf(depot) + 1);
  const cx = (depot.x + sizeOf(depot) / 2) * TILE, cz = (depot.y + sizeOf(depot) / 2) * TILE;
  assert.equal(inBuilding(dBoxes, cx, cz), true);
  assert.equal(inBuilding(dBoxes, depot.x * TILE - BUILDING_MARGIN * 0.5, cz), true);
  assert.equal(inBuilding(dBoxes, depot.x * TILE - BUILDING_MARGIN - 0.5, cz), false);

  let field = null;
  for (let y = 8; y < s.map.height - 8 && !field; y++) for (let x = 8; x < s.map.width - 8 && !field; x++) {
    const res = place(s, 'field', x, y, 0);
    if (res.ok) field = res.value.building;
  }
  assert.ok(field);
  const fBoxes = boxesIn(s, field.x, field.y, field.x + sizeOf(field), field.y + sizeOf(field));
  assert.equal(inBuilding(fBoxes, field.x * TILE - FIELD_MARGIN * 0.5, (field.y + 0.5) * TILE), true);
  assert.equal(inBuilding(fBoxes, field.x * TILE - BUILDING_MARGIN + 0.02, (field.y + 0.5) * TILE), false);

  // Water-wheel race exclusion across all 4 rotations: points along the front race (+z in model frame) are excluded.
  for (const rot of [0, 1, 2, 3] as Dir[]) {
    const wheel = { ...depot, id: 9000 + rot, type: 'wheel' as const, x: 20, y: 20, rot };
    const wState = { ...s, buildings: [wheel] };
    const wBoxes = boxesIn(wState, 16, 16, 26, 26);
    const n = sizeOf(wheel), wcx = (wheel.x + n / 2) * TILE, wcz = (wheel.y + n / 2) * TILE;
    const yaw = YAW[rot], cos = Math.cos(yaw), sin = Math.sin(yaw);
    // Model +z (lz = 5.5 m, inside race 1.7..8.0 m) mapped to world: dx = sin * lz, dz = cos * lz.
    const rx = wcx + sin * 5.5, rz = wcz + cos * 5.5;
    assert.equal(inBuilding(wBoxes, rx, rz, wheelRace), true, `rot ${rot}: race centre should be excluded`);
    // Behind the wheel (-z in model frame, 6 m out): well clear of footprint and race.
    const bx = wcx - sin * 6.5, bz = wcz - cos * 6.5;
    assert.equal(inBuilding(wBoxes, bx, bz, wheelRace), false, `rot ${rot}: behind wheel should be clear`);
  }

  // Profile ordering: quiet < meadow < lush.
  assert.deepEqual([...GRASS_MODES], ['off', 'quiet', 'meadow', 'lush']);
  assert.ok(GRASS_PROFILES.quiet.attempts < GRASS_PROFILES.meadow.attempts);
  assert.ok(GRASS_PROFILES.meadow.attempts < GRASS_PROFILES.lush.attempts);
});

test('emitted Lush grass blade geometry never protrudes into any building, field, or wheel-race footprint', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), lie = new Lie(s, land), wet = wetDistance(land);
  s.credits = 1e6;
  const { width: w, height: h } = s.map;

  // Place a silo and a field in open grass, plus attach a synthetic water wheel to test its race too.
  let silo = null, field = null;
  for (let y = 10; y < h - 10 && !silo; y++) for (let x = 10; x < w - 10 && !silo; x++) {
    const res = place(s, 'silo', x, y, 0);
    if (res.ok) silo = res.value.building;
  }
  for (let y = 10; y < h - 10 && !field; y++) for (let x = 10; x < w - 10 && !field; x++) {
    const res = place(s, 'field', x, y, 0);
    if (res.ok) field = res.value.building;
  }
  assert.ok(silo && field);
  lie.update();

  const profile = GRASS_PROFILES.lush;
  const flatGround = groundOf(() => 0);
  const baseCol = srgb(0x5a9848);
  const mb = new MeshBuilder('grass');

  // Scatter densely across a ring of tiles around every placed building and field.
  for (const b of s.buildings) {
    const n = sizeOf(b);
    const x0 = Math.max(0, b.x - 2), x1 = Math.min(w, b.x + n + 2);
    const y0 = Math.max(0, b.y - 2), y1 = Math.min(h, b.y + n + 2);
    const boxes = boxesIn(s, x0, y0, x1, y1);
    for (let ty = y0; ty < y1; ty++) for (let tx = x0; tx < x1; tx++) {
      const hab = tileHabitat(s, land, lie.relief, wet, tx, ty, true);
      if (!hab) continue;
      const rand = rng(tileSeed(s.scenario.seed, tx, ty));
      const tx0 = tx * TILE, tz0 = ty * TILE;
      for (let a = 0; a < profile.attempts * 4; a++) {
        const wx = tx0 + hab.minU + rand() * (hab.maxU - hab.minU);
        const wz = tz0 + hab.minV + rand() * (hab.maxV - hab.minV);
        if (inBuilding(boxes, wx, wz, wheelRace)) continue;
        // Force worst-case max lushness (1.0) and max random tallness (1.12).
        const tall = (profile.tall[0] + profile.tall[1]) * hab.heightScale * 1.12;
        addTuft(mb, flatGround, wx, wz, tall, baseCol, rand, profile.tuft);
      }
    }
  }

  assert.ok(mb.vertexCount > 500, `expected hundreds of emitted grass vertices, got ${mb.vertexCount}`);
  const geom = mb.build();
  const pos = geom.getAttribute('position');
  let violations = 0;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i), vz = pos.getZ(i);
    for (const b of s.buildings) {
      const n = sizeOf(b);
      if (vx > b.x * TILE && vx < (b.x + n) * TILE && vz > b.y * TILE && vz < (b.y + n) * TILE) {
        violations++;
      }
    }
  }
  geom.dispose();
  assert.equal(violations, 0, `expected 0 emitted grass blade vertices inside building/field footprints, got ${violations}`);
});

test('chunked map and fringe blocks isolate edits, split layout vs relief sigs, and respond to mode switches', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), lie = new Lie(s, land);
  s.credits = 1e6;
  const { width: w, height: h } = s.map, reach = Math.min(GRASS_FRINGE, land.margin);
  const rects = grassBlocks(w, h, reach);
  const mapRects = rects.filter((r) => r.onMap);
  const fringeRects = rects.filter((r) => !r.onMap);
  assert.ok(mapRects.length > 0 && fringeRects.length >= 8, `expected chunked fringe blocks, got ${fringeRects.length}`);
  assert.ok(rects.every((r) => r.x1 - r.x0 <= GRASS_BLOCK && r.y1 - r.y0 <= GRASS_BLOCK));
  assert.equal(fringeFade(5, 5, w, h, reach), 1);
  assert.ok(fringeFade(-1, 5, w, h, reach) > 0 && fringeFade(-1, 5, w, h, reach) < 1);
  assert.equal(fringeFade(-reach - 1, 5, w, h, reach), 0);

  const yAt = (tx: number, ty: number) => lie.y(tx, ty);
  const allSigs = (mode: 'quiet' | 'meadow' | 'lush' = 'meadow') =>
    new Map(rects.map((r) => [r.id, blockSig(s, land, lie.relief, yAt, mode, r.x0, r.y0, r.x1, r.y1)]));
  const diffKeys = (a: Map<number, ReturnType<typeof blockSig>>, b: Map<number, ReturnType<typeof blockSig>>) =>
    rects.filter((r) => {
      const sa = a.get(r.id)!, sb = b.get(r.id)!;
      return sa.layout !== sb.layout || sa.relief !== sb.relief;
    });

  const before = allSigs('meadow');

  // Mode switch changes layout sig on every block.
  const quiet = allSigs('quiet');
  const lush = allSigs('lush');
  assert.equal(diffKeys(before, quiet).length, rects.length);
  assert.equal(diffKeys(before, lush).length, rects.length);

  // Place a silo deep inside the map -> only 1–4 blocks' layout sigs change, smoothing stays local, 0 fringe blocks change.
  let placed = null;
  for (let y = 12; y < h - 12 && !placed; y++) for (let x = 12; x < w - 12 && !placed; x++) {
    const res = place(s, 'silo', x, y, 0);
    if (res.ok) placed = res.value.building;
  }
  assert.ok(placed);
  lie.update();
  const afterPlace = allSigs('meadow');
  const changedPlace = diffKeys(before, afterPlace);
  const changedLayout = rects.filter((r) => afterPlace.get(r.id)!.layout !== before.get(r.id)!.layout);
  const addedBlocks = rects.filter((r) =>
    afterPlace.get(r.id)!.buildingIds.some((id) => !before.get(r.id)!.buildingIds.includes(id)),
  );
  assert.ok(changedLayout.length >= 1 && changedLayout.length <= 4, `expected 1-4 layout-changed blocks, got ${changedLayout.length}`);
  assert.ok(changedPlace.length >= changedLayout.length && changedPlace.length <= 9, `expected localized relief spread (<=9 blocks), got ${changedPlace.length}`);
  assert.ok(addedBlocks.length >= 1 && addedBlocks.length <= 4, 'newly placed building must appear in 1-4 blocks buildingIds');
  assert.equal(changedPlace.filter((r) => !r.onMap).length, 0, 'interior building must not dirty any fringe block');

  // Removing the silo removes its buildingId from the block's layout signature.
  assert.equal(remove(s, placed).ok, true);
  lie.update();
  const afterRemove = allSigs('meadow');
  assert.equal(
    rects.filter((r) => afterRemove.get(r.id)!.layout !== before.get(r.id)!.layout).length,
    0,
  );

  // Clearing an interior tree touches only 1–4 map blocks and 0 fringe blocks.
  const beforeTree = allSigs('meadow');
  let cleared = false;
  for (let y = 8; y < h - 8 && !cleared; y++) for (let x = 8; x < w - 8 && !cleared; x++) {
    if (s.map.terrain[y * w + x] === TERRAIN.tree) cleared = removeAt(s, x, y).ok;
  }
  assert.ok(cleared);
  const changedTree = diffKeys(beforeTree, allSigs('meadow'));
  assert.ok(changedTree.length >= 1 && changedTree.length <= 4);
  assert.equal(changedTree.filter((r) => !r.onMap).length, 0);

  // Border earthwork dirties only the local 1–2 adjacent fringe blocks, not the entire perimeter.
  const beforeBorder = allSigs('meadow');
  let borderMoved = false;
  for (let x = 12; x < w - 12 && !borderMoved; x++) {
    const res = reshape(s, { how: 'raise', from: { x, y: 0 }, to: { x, y: 0 }, at: { x, y: 0 } });
    if (res.ok) { lie.update(); borderMoved = true; }
  }
  assert.ok(borderMoved);
  const changedBorder = diffKeys(beforeBorder, allSigs('meadow'));
  const changedFringe = changedBorder.filter((r) => !r.onMap);
  assert.ok(changedFringe.length >= 1 && changedFringe.length <= 3, `expected 1-3 dirty fringe blocks, got ${changedFringe.length}`);
  assert.ok(changedFringe.length < fringeRects.length, 'border earthwork must not dirty all fringe blocks');

  // blockKey and tileSeed remain deterministic.
  const r0 = mapRects[0];
  assert.equal(
    blockKey(s, land, lie.relief, yAt, 'meadow', r0.x0, r0.y0, r0.x1, r0.y1),
    blockKey(s, land, lie.relief, yAt, 'meadow', r0.x0, r0.y0, r0.x1, r0.y1),
  );
  assert.equal(tileSeed(42, 7, 13), tileSeed(42, 7, 13));
  assert.notEqual(tileSeed(42, 7, 13), tileSeed(42, 8, 13));
});

test('meadow grass is transparent to picking beside trees and rocks from all 4 views', () => {
  // Open grass tile (10, 10) right next to a tree on (10, 9) and a rock on (11, 10).
  const gx = (10 + 0.5) * TILE, gz = (10 + 0.5) * TILE;
  const picker = new Picker({
    landHit: (ray) => ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3()),
    waterAt: () => null,
    tagged: () => [],
  });
  const pixels = (depth: number, ink: number) =>
    Float32Array.from({ length: 36 }, (_, i) => (i % 4 === 2 ? depth : i % 4 === 3 ? ink : 0));

  for (let view = 0; view < 4; view++) {
    const yaw = (Math.PI / 4) + (view * Math.PI) / 2;
    const pitch = Math.PI / 6; // 30° camera pitch, matching the game
    const dist = 120;
    const cam = new THREE.OrthographicCamera(-40, 40, 22.5, -22.5, 0.1, 400);
    cam.position.set(
      gx + Math.cos(yaw) * Math.cos(pitch) * dist,
      Math.sin(pitch) * dist,
      gz + Math.sin(yaw) * Math.cos(pitch) * dist,
    );
    cam.lookAt(gx, 0, gz);
    cam.updateMatrixWorld();

    // A 0.85 m grass blade on tile (10, 10) sits ~1.7 m nearer along the 30° view ray than the ground.
    const bladeDepth = dist - 1.7;
    const grassHit = picker.hit(pixels(bladeDepth, GRASS_INK), cam, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), []);
    assert.ok(grassHit, `view ${view}: grass pick returned null`);
    assert.equal(grassHit.what, 'land', `view ${view}: meadow grass must pick as 'land', not 'plant'`);
    assert.equal(Math.floor(grassHit.point.x / TILE), 10);
    assert.equal(Math.floor(grassHit.point.z / TILE), 10);

    // An actual tree crown or rock (ink = 0.0) standing above the land still picks as 'plant'.
    const treeHit = picker.hit(pixels(dist - 4.0, 0), cam, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), []);
    assert.equal(treeHit?.what, 'plant', `view ${view}: tree/rock must still pick as 'plant'`);
  }
});
