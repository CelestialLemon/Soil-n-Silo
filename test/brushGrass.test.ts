import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place, remove, removeAt, reshape } from '../src/game/build.ts';
import { GROUND } from '../src/game/ground.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { must } from '../src/game/result.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { newGame, sizeOf } from '../src/game/state.ts';
import { COUNTRY, landRelief, Lie } from '../src/world/ground.ts';
import {
  blockKey, borderBoxes, boxesIn, BUILDING_MARGIN, CLIFF_MARGIN, countrySig, FIELD_MARGIN, GRASS_BLOCK,
  GRASS_PROFILES, inBuilding, ROCK_MARGIN, tileHabitat, tileSeed, WATER_MARGIN, wetDistance,
} from '../src/world/brush/grassMask.ts';
import { TILE } from '../src/world/brush/scale.ts';

// Pure placement, masking, seasonal sizing, and block-rebuild rules for meadow grass tufts (src/world/brush/grassMask.ts, #256).

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
  // Pick a clean flat interior grass tile and verify synthetic neighbour margins directly.
  let tx = -1, ty = -1;
  for (let y = 4; y < h - 4 && tx < 0; y++) for (let x = 4; x < w - 4 && tx < 0; x++) {
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) {
      if (s.map.terrain[(y + dy) * w + (x + dx)] !== TERRAIN.grass) ok = false;
    }
    if (ok && tileHabitat(s, land, relief, wet, x, y, true)) { tx = x; ty = y; }
  }
  assert.ok(tx >= 0, 'found open grass patch');

  // Adjacent water on north (-y, side 0) tightens minV to WATER_MARGIN.
  s.map.terrain[(ty - 1) * w + tx] = TERRAIN.water;
  const nearWater = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(nearWater.minV >= WATER_MARGIN);

  // Adjacent rock on east (+x, side 1) tightens maxU to TILE - ROCK_MARGIN.
  s.map.terrain[ty * w + (tx + 1)] = TERRAIN.rock;
  const nearRock = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(nearRock.maxU <= TILE - ROCK_MARGIN);
  assert.ok(nearRock.rockBoost > 0);

  // Cliff on south (+y, side 2) tightens maxV to TILE - CLIFF_MARGIN.
  const southLi = (ty + 1 + M) * land.width + (tx + M);
  for (let k = 0; k < 4; k++) land.corner[southLi * 4 + k] += 3;
  const nearCliff = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(nearCliff.maxV <= TILE - CLIFF_MARGIN);

  // Country fringe tile immediately outside north edge (y = -1) clears BUILDING_MARGIN + 0.05 on its south side.
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

  // 2 neighbour trees -> woodland skirt boost, not deep woods.
  s.map.terrain[(ty - 1) * w + tx] = TERRAIN.tree;
  s.map.terrain[(ty + 1) * w + tx] = TERRAIN.tree;
  const skirt = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(skirt.skirtBoost > 0);
  assert.equal(skirt.deepWoods, 1);

  // 5 neighbour trees -> deep woods thinning.
  s.map.terrain[ty * w + (tx - 1)] = TERRAIN.tree;
  s.map.terrain[ty * w + (tx + 1)] = TERRAIN.tree;
  s.map.terrain[(ty - 1) * w + (tx - 1)] = TERRAIN.tree;
  const woods = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.equal(woods.skirtBoost, 0);
  assert.ok(woods.deepWoods < 0.4);

  // Stony ground reduces density and height.
  s.map.ground[ty * w + tx] = GROUND.stony;
  const stony = tileHabitat(s, land, relief, wet, tx, ty, true)!;
  assert.ok(stony.groundScale < 0.75);
  assert.ok(stony.heightScale < 0.9);

  // Winter scenario shortens tufts (~0.60x) so light snow shows tips and deep snow buries them cleanly.
  const sw = newGame(winterSc), lw = generateLand(winterSc, COUNTRY), rw = landRelief(lw), ww = wetDistance(lw);
  let wHab = null;
  for (let y = 2; y < sw.map.height - 2 && !wHab; y++) for (let x = 2; x < sw.map.width - 2 && !wHab; x++) {
    if (sw.map.ground[y * sw.map.width + x] === GROUND.loam) wHab = tileHabitat(sw, lw, rw, ww, x, y, true);
  }
  assert.ok(wHab);
  assert.equal(wHab.seasonDensity, 0.80);
  assert.equal(wHab.heightScale, 0.60);
});

test('building and field footprints mask grass cleanly and profiles scale monotonically', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc);
  s.credits = 1e6;
  const depot = s.buildings[0];
  const dBoxes = boxesIn(s, depot.x - 1, depot.y - 1, depot.x + sizeOf(depot) + 1, depot.y + sizeOf(depot) + 1);
  // Centre and margin of depot are excluded; far outside is clear.
  const cx = (depot.x + sizeOf(depot) / 2) * TILE, cz = (depot.y + sizeOf(depot) / 2) * TILE;
  assert.equal(inBuilding(dBoxes, cx, cz), true);
  assert.equal(inBuilding(dBoxes, depot.x * TILE - BUILDING_MARGIN * 0.5, cz), true);
  assert.equal(inBuilding(dBoxes, depot.x * TILE - BUILDING_MARGIN - 0.5, cz), false);

  // Field uses tighter FIELD_MARGIN than structures.
  let field = null;
  for (let y = 8; y < s.map.height - 8 && !field; y++) for (let x = 8; x < s.map.width - 8 && !field; x++) {
    const res = place(s, 'field', x, y, 0);
    if (res.ok) field = res.value.building;
  }
  assert.ok(field);
  const fBoxes = boxesIn(s, field.x, field.y, field.x + sizeOf(field), field.y + sizeOf(field));
  assert.equal(inBuilding(fBoxes, field.x * TILE - FIELD_MARGIN * 0.5, (field.y + 0.5) * TILE), true);
  assert.equal(inBuilding(fBoxes, field.x * TILE - BUILDING_MARGIN + 0.02, (field.y + 0.5) * TILE), false);

  // Profile ordering: quiet < meadow < lush.
  assert.ok(GRASS_PROFILES.quiet.attempts < GRASS_PROFILES.meadow.attempts);
  assert.ok(GRASS_PROFILES.meadow.attempts < GRASS_PROFILES.lush.attempts);
});

test('block keys isolate edits to affected 8x8 blocks and border earthworks update countrySig', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), lie = new Lie(s, land);
  s.credits = 1e6;
  const { width: w, height: h } = s.map;
  const yAt = (tx: number, ty: number) => lie.y(tx, ty);
  const allKeys = () => {
    const map = new Map<string, string>();
    for (let by = 0; by * GRASS_BLOCK < h; by++) for (let bx = 0; bx * GRASS_BLOCK < w; bx++) {
      const x0 = bx * GRASS_BLOCK, y0 = by * GRASS_BLOCK;
      map.set(`${bx},${by}`, blockKey(s, land, lie.relief, yAt, 'meadow', x0, y0, Math.min(w, x0 + GRASS_BLOCK), Math.min(h, y0 + GRASS_BLOCK)));
    }
    return map;
  };
  const diffCount = (a: Map<string, string>, b: Map<string, string>) => [...a].filter(([k, v]) => b.get(k) !== v).length;

  const before = allKeys();
  const c0 = countrySig(s, land, lie.relief, yAt, 'meadow');

  // Place a silo deep inside the map -> only 1–2 blocks change, countrySig untouched.
  let placed = null;
  for (let y = 12; y < h - 12 && !placed; y++) for (let x = 12; x < w - 12 && !placed; x++) {
    const res = place(s, 'silo', x, y, 0);
    if (res.ok) placed = res.value.building;
  }
  assert.ok(placed);
  const afterPlace = allKeys();
  const changedPlace = diffCount(before, afterPlace);
  assert.ok(changedPlace >= 1 && changedPlace <= 4, `expected 1-4 changed blocks, got ${changedPlace}`);
  assert.equal(countrySig(s, land, lie.relief, yAt, 'meadow'), c0);

  // Removing the silo restores the exact previous block keys.
  assert.equal(remove(s, placed).ok, true);
  assert.equal(diffCount(before, allKeys()), 0);

  // Clearing an interior tree touches only 1–2 blocks and leaves countrySig untouched.
  let cleared = false;
  for (let y = 8; y < h - 8 && !cleared; y++) for (let x = 8; x < w - 8 && !cleared; x++) {
    if (s.map.terrain[y * w + x] === TERRAIN.tree) cleared = removeAt(s, x, y).ok;
  }
  assert.ok(cleared);
  const changedTree = diffCount(before, allKeys());
  assert.ok(changedTree >= 1 && changedTree <= 4);
  assert.equal(countrySig(s, land, lie.relief, yAt, 'meadow'), c0);

  // Border earthwork updates countrySig (while borderBoxes ignores interior buildings).
  let borderMoved = false;
  for (let x = 4; x < w - 4 && !borderMoved; x++) {
    const res = reshape(s, { how: 'raise', from: { x, y: 0 }, to: { x, y: 0 }, at: { x, y: 0 } });
    if (res.ok) { lie.update(); borderMoved = true; }
  }
  assert.ok(borderMoved);
  assert.notEqual(countrySig(s, land, lie.relief, yAt, 'meadow'), c0);
  assert.equal(borderBoxes(s).length, 0);

  // tileSeed is deterministic and varies across tiles.
  assert.equal(tileSeed(42, 7, 13), tileSeed(42, 7, 13));
  assert.notEqual(tileSeed(42, 7, 13), tileSeed(42, 8, 13));
});
