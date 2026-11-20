import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TUFT_REACH } from '../brush3d/src/shared.ts';
import { place, remove, removeAt } from '../src/game/build.ts';
import { GROUND } from '../src/game/ground.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { must } from '../src/game/result.ts';
import { mulberry32 } from '../src/game/rng.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { newGame, sizeOf, type Building, type Dir } from '../src/game/state.ts';
import { COUNTRY, landRelief, Lie } from '../src/world/ground.ts';
import { YAW } from '../src/world/brush/catalog.ts';
import {
  blockOf, boxesIn, BUILDING_MARGIN, CLIFF_MARGIN, FIELD_MARGIN, fringeFade, GRASS_BLOCK, GRASS_FRINGE, GRASS_MODES,
  GRASS_PROFILES, grassAt, grassTop, grassBlocks, grassLayout, inBuilding, layoutChanges, MAX_BLADE_REACH, ROCK_MARGIN,
  tileHabitat, tileSeed, WATER_MARGIN, wetDistance,
} from '../src/world/brush/grassMask.ts';
import { TILE } from '../src/world/brush/scale.ts';

// Pure placement, masking, seasonal sizing, block-change and picking rules for meadow grass tufts
// (src/world/brush/grassMask.ts, #256). How far a tuft's blades reach is brush3d's promise (`TUFT_REACH`, from shared.ts),
// which brush3d/test/tuft.test.ts holds its blades to; here the masks are held to it, with no three.js.

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
  assert.ok(nearCliff.edgeBoost > 0, 'a hill\'s edge, where the wildflowers gather');

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
  assert.equal(woods.deepWoods, 0, "deep woods: no grass");

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

test('every tuft the masks let stand keeps its blades\' whole reach off every building, field and wheel race', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), lie = new Lie(s, land), wet = wetDistance(land);
  s.credits = 1e6;
  const { width: w, height: h } = s.map;
  // The reach is brush3d's promise for a tuft at its tallest in Lush, the densest and tallest.
  const lush = GRASS_PROFILES.lush;
  assert.equal(MAX_BLADE_REACH, Math.max(...Object.values(GRASS_PROFILES).map((p) => p.tuft.spread + TUFT_REACH * (p.tall[0] + p.tall[1]) * 1.12)));

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
  // And a water wheel (its race reaches out in front of it), on open grass, turned each way in turn below.
  let spot: [number, number] | null = null;
  for (let y = 12; y < h - 12 && !spot; y++) for (let x = 12; x < w - 12 && !spot; x++) {
    let open = true;
    for (let dy = -3; dy < 6 && open; dy++) for (let dx = -3; dx < 6 && open; dx++) open = s.map.terrain[(y + dy) * w + x + dx] === TERRAIN.grass && !s.buildings.some((b) => x + dx >= b.x && x + dx < b.x + sizeOf(b) && y + dy >= b.y && y + dy < b.y + sizeOf(b));
    if (open) spot = [x, y];
  }
  assert.ok(spot);
  for (const rot of [0, 1, 2, 3] as Dir[]) s.buildings.push({ ...silo, id: 9000 + rot, type: 'wheel', x: spot[0], y: spot[1], rot });
  lie.update();

  // Everywhere a blade of a tuft could reach: rings round its spot out to the full reach, every 11.25°.
  const reach: [number, number][] = [];
  for (const r of [0.25, 0.5, 0.75, 1]) for (let k = 0; k < 32; k++) {
    reach.push([Math.cos(k * Math.PI / 16) * r * MAX_BLADE_REACH, Math.sin(k * Math.PI / 16) * r * MAX_BLADE_REACH]);
  }
  // Scatter densely across a ring of tiles around every placed building and field.
  let tufts = 0, violations = 0, inRace = 0;
  for (const b of s.buildings) {
    const n = sizeOf(b);
    const x0 = Math.max(0, b.x - 2), x1 = Math.min(w, b.x + n + 2);
    const y0 = Math.max(0, b.y - 2), y1 = Math.min(h, b.y + n + 2);
    const boxes = boxesIn(s, x0, y0, x1, y1);
    for (let ty = y0; ty < y1; ty++) for (let tx = x0; tx < x1; tx++) {
      const hab = tileHabitat(s, land, lie.relief, wet, tx, ty, true);
      if (!hab) continue;
      const rand = mulberry32(tileSeed(s.scenario.seed, tx, ty));
      for (let a = 0; a < lush.attempts * 4; a++) {
        const wx = tx * TILE + hab.minU + rand() * (hab.maxU - hab.minU);
        const wz = ty * TILE + hab.minV + rand() * (hab.maxV - hab.minV);
        if (inBuilding(boxes, wx, wz, wheelRace)) continue;
        tufts++;
        for (const [dx, dz] of reach) {
          const vx = wx + dx, vz = wz + dz;
          for (const o of s.buildings) {
            const m = sizeOf(o);
            if (vx > o.x * TILE && vx < (o.x + m) * TILE && vz > o.y * TILE && vz < (o.y + m) * TILE) violations++;
            if (o.type !== 'wheel') continue;
            // The race itself (no margin), in the wheel's own frame (as inBuilding turns it).
            const yaw = YAW[o.rot], ox = vx - (o.x + m / 2) * TILE, oz = vz - (o.y + m / 2) * TILE;
            if (wheelRace(ox * Math.cos(yaw) - oz * Math.sin(yaw), ox * Math.sin(yaw) + oz * Math.cos(yaw), 0) > 0) inRace++;
          }
        }
      }
    }
  }
  assert.ok(tufts > 500, `expected hundreds of tufts by the buildings, got ${tufts}`);
  assert.equal(inRace, 0, `expected no blade's reach in a water wheel's race, got ${inRace} points`);
  assert.equal(violations, 0, `expected no blade's reach inside a building or field, got ${violations} points`);
});

test('blocks: a placement, removal or clearing queues only the blocks it touches, from a cheap layout diff', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY);
  s.credits = 1e6;
  const { width: w, height: h } = s.map, reach = Math.min(GRASS_FRINGE, land.margin);
  const rects = grassBlocks(w, h, reach), byId = new Map(rects.map((r) => [r.id, r]));
  assert.ok(rects.filter((r) => !r.onMap).length >= 8, 'the country fringe has blocks of its own');
  assert.ok(rects.every((r) => r.x1 - r.x0 <= GRASS_BLOCK && r.y1 - r.y0 <= GRASS_BLOCK));
  // blockOf names the block that holds a tile, on the map or in the fringe.
  for (const [x, y] of [[0, 0], [5, 9], [-1, -reach], [w - 1, h + reach - 1], [-reach, h - 1]]) {
    const r = byId.get(blockOf(x, y));
    assert.ok(r && x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1, `tile ${x},${y} in its block`);
  }
  assert.equal(fringeFade(5, 5, w, h, reach), 1);
  assert.ok(fringeFade(-1, 5, w, h, reach) > 0 && fringeFade(-1, 5, w, h, reach) < 1);
  assert.equal(fringeFade(-reach - 1, 5, w, h, reach), 0);

  const changes = (f: () => void) => {
    const was = grassLayout(s);
    f();
    return layoutChanges(was, grassLayout(s), w);
  };
  const onMapOnly = (ids: Set<number>) => [...ids].every((id) => byId.get(id)?.onMap);
  assert.deepEqual(changes(() => {}), { urgent: new Set(), dirty: new Set() });

  // A silo placed inside the map: the blocks its box reaches, hidden till made again; nothing else.
  let silo: Building | null = null;
  const placed = changes(() => {
    for (let y = 12; y < h - 12 && !silo; y++) for (let x = 12; x < w - 12 && !silo; x++) {
      const res = place(s, 'silo', x, y, 0);
      if (res.ok) silo = res.value.building;
    }
  });
  const b = silo as Building | null;
  if (!b) throw new Error('no room for a silo');
  const n = sizeOf(b);
  assert.ok(placed.urgent.size >= 1 && placed.urgent.size <= 4 && placed.dirty.size === 0, JSON.stringify([...placed.urgent]));
  assert.ok(onMapOnly(placed.urgent), 'an inner building touches no fringe block');
  for (const [x, y] of [[b.x - 1, b.y - 1], [b.x + n, b.y + n]]) assert.ok(placed.urgent.has(blockOf(x, y)));

  // Taken away: the same blocks, but grass grows back (no hurry).
  const removed = changes(() => assert.equal(remove(s, b).ok, true));
  assert.equal(removed.urgent.size, 0);
  assert.deepEqual(removed.dirty, placed.urgent);

  // A tree cleared: the blocks round its tile (its neighbours' grass depends on it), none urgent.
  let at = [-1, -1];
  const cleared = changes(() => {
    for (let y = 8; y < h - 8 && at[0] < 0; y++) for (let x = 8; x < w - 8 && at[0] < 0; x++) {
      if (s.map.terrain[y * w + x] === TERRAIN.tree && removeAt(s, x, y).ok) at = [x, y];
    }
  });
  assert.ok(at[0] >= 0);
  assert.equal(cleared.urgent.size, 0);
  assert.ok(cleared.dirty.size >= 1 && cleared.dirty.size <= 4 && onMapOnly(cleared.dirty));
  assert.ok(cleared.dirty.has(blockOf(at[0], at[1])));

  // A water wheel's race reaches three tiles out: its blocks are all hidden too.
  const wheel = { ...s.buildings[0], id: 9999, type: 'wheel' as const, x: 20, y: 20, rot: 0 as Dir };
  const wheeled = changes(() => s.buildings.push(wheel));
  for (const [x, y] of [[17, 17], [20 + sizeOf(wheel) + 2, 20 + sizeOf(wheel) + 2]]) assert.ok(wheeled.urgent.has(blockOf(x, y)));
  s.buildings.pop();

  assert.equal(tileSeed(42, 7, 13), tileSeed(42, 7, 13));
  assert.notEqual(tileSeed(42, 7, 13), tileSeed(42, 8, 13));
});

test('a pick low over open grass is the meadow\'s grass, not the tree or rock beside it', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), { width: w, height: h } = s.map;
  let tree: [number, number] | null = null, grass: [number, number] | null = null;
  for (let y = 4; y < h - 4 && !(tree && grass); y++) for (let x = 4; x < w - 4; x++) {
    const t = s.map.terrain[y * w + x];
    if (t === TERRAIN.tree && !tree) tree = [x, y];
    if (t === TERRAIN.grass && !grass) grass = [x, y];
  }
  assert.ok(tree && grass);
  const mid = ([x, y]: [number, number]) => [(x + 0.5) * TILE, (y + 0.5) * TILE] as const;
  // Each density's tallest blade is under its top; none when the grass is off.
  for (const m of ['quiet', 'meadow', 'lush'] as const) {
    assert.ok(grassTop(m) > 1.2 * (GRASS_PROFILES[m].tall[0] + GRASS_PROFILES[m].tall[1]) * 1.12, m);
  }
  assert.ok(grassTop('quiet') < grassTop('meadow') && grassTop('meadow') < grassTop('lush'));
  assert.equal(grassAt(s, ...mid(grass), 0.4, grassTop('meadow')), true, 'a blade over open grass');
  assert.equal(grassAt(s, ...mid(grass), 0.4, grassTop('off')), false, 'a low branch over open grass, the grass off');
  assert.equal(grassAt(s, ...mid(grass), grassTop('lush') + 0.5, grassTop('lush')), false, 'a crown leaning over open grass');
  assert.equal(grassAt(s, ...mid(tree), 0.4, grassTop('meadow')), false, 'the foot of a tree, or a rock, on its own tile');
  assert.equal(grassAt(s, -2, -2, 0.4, grassTop('meadow')), true, 'a blade in the country beyond the map');
});
