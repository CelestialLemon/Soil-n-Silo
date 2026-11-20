import assert from 'node:assert/strict';
import { test } from 'node:test';
import { REED_HEIGHT, REED_REACH, REED_WIDTH } from '../brush3d/src/shared.ts';
import { flooded } from '../src/game/flood.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { joins, spanOf, STEEP } from '../src/game/relief.ts';
import { place } from '../src/game/build.ts';
import { must } from '../src/game/result.ts';
import { mulberry32 } from '../src/game/rng.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { SEASON_IDS } from '../src/game/seasons.ts';
import { newGame, sizeOf } from '../src/game/state.ts';
import { COUNTRY, landRelief } from '../src/world/ground.ts';
import { YAW } from '../src/world/brush/catalog.ts';
import {
  boxesIn, BUILDING_MARGIN, FIELD_MARGIN, FLOWER_TOP, GRASS_TOP, grassAt, MAX_REED_REACH, REED_DEEP, REED_HIGH,
  REED_PROFILE, REED_SEASONS, REED_SLOPE, REED_TOP, reedBand, reedShore, reedSpot,
} from '../src/world/brush/grassMask.ts';
import { WATER_DOWN } from '../src/world/brush/landMap.ts';
import { LEVEL, TILE } from '../src/world/brush/scale.ts';
import { wheelRace } from './wheelRace.ts';

// The reeds along the water's edge (#267): their profile and seasons, which tiles are a shore they may line, how near
// the water's edge as drawn they stand, how far a clump reaches against the margins kept round buildings and rocks, and
// the pick. How far a clump reaches is brush3d's promise (`REED_REACH`, `REED_WIDTH`, `REED_HEIGHT`, from shared.ts),
// which brush3d/test/reed.test.ts holds `addReeds` to.

/** The maps the issue names: First Light, Windy Ridge, Long Nights, Riverlands, Harvest Festival. */
const MAPS = ['c1', 'c3', 'c5', 'c7', 'c8'];

test('the reeds are lush: long, thick beds that stand over the grass and flowers', () => {
  // The developer's pick on #267: the lush beds' numbers, kept exactly.
  assert.deepEqual(REED_PROFILE, {
    attempts: 64, beds: [0.36, 0.52], companions: [2, 3], heads: 0.1,
    reed: { blades: [12, 10], tall: [0.7, 0.55], across: 0.55, width: [0.026, 0.016] },
  });
  assert.ok(REED_PROFILE.beds[0] < REED_PROFILE.beds[1]);
  assert.ok(REED_TOP > GRASS_TOP && GRASS_TOP > FLOWER_TOP);
});

test('by season: green in spring and summer, golden straw in autumn, pale frost-tipped stalks in winter', () => {
  const rgb = (hex: number) => [hex >> 16, (hex >> 8) & 0xff, hex & 0xff];
  for (const season of ['spring', 'summer'] as const) {
    // Mostly green: most of each palette's weight more green than red.
    const { palette } = REED_SEASONS[season], total = palette.reduce((a, c) => a + c.weight, 0);
    const green = palette.filter(({ hex }) => rgb(hex)[1] > rgb(hex)[0]).reduce((a, c) => a + c.weight, 0);
    assert.ok(green / total >= 0.8, season);
  }
  // Autumn's straw: warm, gold (red over green over blue).
  for (const { hex } of REED_SEASONS.autumn.palette.slice(0, 2)) { const [r, g, b] = rgb(hex); assert.ok(r > g && g > b, hex.toString(16)); }
  // Winter's: dry and pale, with frost on the tips (near white, and more of the tip's colour than in summer).
  const [tr, tg, tb] = rgb(REED_SEASONS.winter.tip);
  assert.ok(Math.min(tr, tg, tb) > 0xd8);
  assert.ok(REED_SEASONS.winter.tipMix > REED_SEASONS.summer.tipMix);
  for (const season of SEASON_IDS) {
    const k = REED_SEASONS[season];
    assert.ok(k.density > 0 && k.tall > 0 && k.tall <= 1, season);
    for (const { weight } of k.palette) assert.ok(weight > 0);
  }
});

test('a clump the masks let stand never reaches into a building, field, wheel race or rock', () => {
  // A clump stands outside the footprints as the grass's (boxes widened by BUILDING_MARGIN, FIELD_MARGIN; a wheel's race by
  // BUILDING_MARGIN too) and inside its tile's bounds, kept MAX_REED_REACH off a rock's side, so its whole reach stays out.
  const p = REED_PROFILE, tall = (p.reed.tall[0] + p.reed.tall[1]) * Math.max(...SEASON_IDS.map((s) => REED_SEASONS[s].tall));
  assert.equal(MAX_REED_REACH, p.reed.across / Math.SQRT2 + REED_REACH * tall + p.reed.width[0] + p.reed.width[1] + REED_WIDTH);
  assert.ok(REED_TOP >= REED_HEIGHT * tall);
  assert.ok(MAX_REED_REACH < Math.min(BUILDING_MARGIN, FIELD_MARGIN), `a clump reaches ${MAX_REED_REACH.toFixed(3)} m`);
});

test('the reeds stand at the water\'s edge as drawn: up the bank a little, into the shallows a little', () => {
  assert.equal(reedBand(0), 1);
  assert.equal(reedBand(REED_DEEP), 0);
  assert.equal(reedBand(-REED_HIGH), 0);
  assert.equal(reedBand(1), 0, 'not in deep water');
  assert.equal(reedBand(-1), 0, 'not up on the meadow');
  for (let d = 0; d < REED_DEEP; d += 0.01) assert.ok(reedBand(d + 0.01) <= reedBand(d));
  for (let d = 0; d > -REED_HIGH; d -= 0.01) assert.ok(reedBand(d - 0.01) <= reedBand(d));
  // The band is shallower than the drawn bank stands over the water: none up on the grass beyond the bank.
  assert.ok(REED_HIGH < WATER_DOWN);
});

test('every map\'s shores are lined, and none by a fall, on a cliff or steep tile, or on a rock, tree or track', () => {
  for (const id of MAPS) {
    const sc = must(scenarioById(id), id);
    const s = newGame(sc), land = generateLand(sc, COUNTRY), relief = landRelief(land);
    const { width: w, height: h } = s.map, M = land.margin, W = land.width;
    let wet = 0, dry = 0;
    for (let y = -4; y < h + 4; y++) for (let x = -4; x < w + 4; x++) {
      const onMap = x >= 0 && y >= 0 && x < w && y < h, lx = x + M, ly = y + M, li = ly * W + lx;
      const shore = reedShore(s, land, relief, x, y, onMap);
      if (!shore) continue;
      const t = land.terrain[li];
      assert.ok(t === TERRAIN.water || t === TERRAIN.grass, `${id} ${x},${y}: on water or open grass`);
      assert.notEqual(land.track[li], 1);
      assert.ok(spanOf(relief, lx, ly) < STEEP);
      for (let d = 0; d < 4; d++) assert.ok(joins(relief, lx, ly, d), `${id} ${x},${y}: no cliff`);
      // Water and dry ground round it, all the water within two tiles at one level (no fall), whose surface it lines.
      const levels = new Set<number>();
      let water = false, ground = false;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const j = (ly + dy) * W + lx + dx, near = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
        if (land.terrain[j] === TERRAIN.water) { levels.add(relief.corner[j * 4]); water ||= near; } else ground ||= near;
      }
      assert.ok(water && ground, `${id} ${x},${y}: a shore`);
      assert.equal(levels.size, 1, `${id} ${x},${y}: no fall within two tiles`);
      assert.equal(shore.surface, [...levels][0] * LEVEL - WATER_DOWN);
      assert.ok(shore.minU < shore.maxU && shore.minV < shore.maxV);
      if (t === TERRAIN.water) wet++; else dry++;
    }
    assert.ok(wet > 20 && dry > 20, `${id}: ${wet} water and ${dry} bank tiles lined`);
  }
});

test('Harvest Festival\'s fall has no reeds within two tiles of it', () => {
  const sc = must(scenarioById('c8'), 'c8');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), relief = landRelief(land), M = land.margin, W = land.width;
  const falls: [number, number][] = [];
  for (let y = 0; y < s.map.height; y++) for (let x = 0; x < s.map.width; x++) {
    const k = (y + M) * W + x + M, j = k + 1;
    if (land.terrain[k] === TERRAIN.water && land.terrain[j] === TERRAIN.water && relief.corner[k * 4] !== relief.corner[j * 4]) falls.push([x, y]);
  }
  assert.ok(falls.length > 0);
  for (const [fx, fy] of falls) for (let dy = -2; dy <= 2; dy++) for (let dx = -1; dx <= 2; dx++) {
    assert.equal(reedShore(s, land, relief, fx + dx, fy + dy, true), null, `${fx + dx},${fy + dy}`);
  }
});

test('a rock beside a shore keeps the reeds a clump\'s reach off it', () => {
  let checked = 0;
  for (const id of MAPS) {
    const sc = must(scenarioById(id), id);
    const s = newGame(sc), land = generateLand(sc, COUNTRY), relief = landRelief(land);
    for (let y = 0; y < s.map.height; y++) for (let x = 0; x < s.map.width; x++) {
      const shore = reedShore(s, land, relief, x, y, true);
      if (!shore) continue;
      const rock = (dx: number, dy: number) => s.map.terrain[(y + dy) * s.map.width + x + dx] === TERRAIN.rock;
      if (rock(0, -1)) { assert.ok(shore.minV >= MAX_REED_REACH); checked++; }
      if (rock(1, 0)) { assert.ok(shore.maxU <= TILE - MAX_REED_REACH); checked++; }
      if (rock(0, 1)) { assert.ok(shore.maxV <= TILE - MAX_REED_REACH); checked++; }
      if (rock(-1, 0)) { assert.ok(shore.minU >= MAX_REED_REACH); checked++; }
    }
  }
  assert.ok(checked > 0);
});

test('a flood takes no reeds away: they line the same shores under it, mostly under an ordinary one, all under a severe one', () => {
  // Rooted on the ground, the water hiding what's below its surface (the developer, on #266 and #267). The flood's surface
  // (the rules', which water.ts draws) at its height over each shore tile, against the water's edge there: an ordinary
  // flood stands over a metre deep at the river's edge, most of the tallest reed (the tips of the tallest show in places,
  // and more while it rises or drains); a severe one covers every reed, even those furthest up the bank.
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), relief = landRelief(land), { width: w, height: h } = s.map;
  const shores = () => {
    const out = new Map<number, number>();
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const r = reedShore(s, land, relief, tx, ty, true);
      if (r) out.set(ty * w + tx, r.surface);
    }
    return out;
  };
  const dry = shores();
  for (const [strength, over] of [['ordinary', 0.75 * REED_TOP], ['severe', REED_TOP + REED_HIGH]] as const) {
    s.scenario.events = [{ kind: 'flood', strength, start: s.time - 6 * 3600, length: 48 * 3600 }];
    const f = flooded(s), wet = shores();
    assert.ok(f.count > 100, `${strength}: the flood covers ${f.count} tiles`);
    assert.deepEqual([...wet], [...dry], strength);
    // Riverlands' shores are all the river's, and every one is under the flood (its banks and its channel both).
    assert.ok(wet.size > 100, `${strength}: ${wet.size} shore tiles`);
    for (const [i, edge] of wet) {
      const at = `${strength}, tile ${i % w}, ${Math.floor(i / w)}`;
      assert.ok(Number.isFinite(f.surface[i]), `${at}: under the flood`);
      const deep = f.surface[i] * LEVEL - edge;
      assert.ok(deep > over, `${at}: ${deep.toFixed(2)} m deep at the water's edge`);
    }
  }
});

test('a pick low over the water or its banks is the reeds where they stand, and elsewhere it isn\'t', () => {
  // `reeds` is the reeds' top where a clump stands within reach of the point, else 0 (grass.ts's reedTopAt).
  const sc = must(scenarioById('c1'), 'c1');
  const s = newGame(sc), { width: w } = s.map;
  const mid = (i: number): [number, number] => [((i % w) + 0.5) * TILE, (Math.floor(i / w) + 0.5) * TILE];
  const water = s.map.terrain.findIndex((t) => t === TERRAIN.water), grass = s.map.terrain.findIndex((t) => t === TERRAIN.grass);
  const tree = s.map.terrain.findIndex((t) => t === TERRAIN.tree);
  const top = GRASS_TOP, reeds = REED_TOP, stalk = (top + reeds) / 2;
  assert.ok(top < stalk && stalk < reeds, 'a reed stands over the grass and flowers');
  assert.equal(grassAt(s, ...mid(water), 0.5, reeds), true, 'a reed over the water');
  assert.equal(grassAt(s, ...mid(water), 0.5, 0), false, 'a low branch over the water, no reeds there');
  assert.equal(grassAt(s, ...mid(water), reeds + 0.5, reeds), false, 'a crown over the water');
  assert.equal(grassAt(s, ...mid(grass), stalk, reeds), true, 'a reed over the bank');
  assert.equal(grassAt(s, ...mid(grass), stalk, 0), false, 'a branch over the grass, no reeds there');
  assert.equal(grassAt(s, ...mid(grass), top - 0.05, 0), true, 'a blade over the grass');
  assert.equal(grassAt(s, -2, -2, stalk, 0), false, 'a branch beyond the map, no reeds there');
  assert.equal(grassAt(s, -2, -2, stalk, reeds), true, 'a reed beyond the map');
  assert.equal(grassAt(s, ...mid(tree), 0.5, reeds), false, 'the foot of a tree on its own tile');
});

test('a clump reedSpot lets stand reaches into no building, field or wheel race', () => {
  // Water wheels and silos along the banks of First Light's river and Riverlands', and clumps tried densely over every
  // shore tile round them: each one let stand, its whole reach (MAX_REED_REACH round it) stays out of every footprint
  // and every race.
  const ring: [number, number][] = [];
  for (const r of [0.5, 1]) for (let k = 0; k < 32; k++) ring.push([Math.cos(k * Math.PI / 16) * r * MAX_REED_REACH, Math.sin(k * Math.PI / 16) * r * MAX_REED_REACH]);
  let stood = 0, refused = 0, into = 0;
  for (const id of ['c1', 'c7']) {
    const sc = must(scenarioById(id), id);
    const s = newGame(sc), land = generateLand(sc, COUNTRY), relief = landRelief(land), { width: w, height: h } = s.map;
    s.credits = 1e9;
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 3) for (const rot of [0, 1, 2, 3] as const) place(s, 'wheel', x, y, rot);
    for (let y = 0; y < h; y += 3) for (let x = 1; x < w; x += 4) place(s, 'silo', x, y, 0);
    const wheels = s.buildings.filter((b) => b.type === 'wheel');
    assert.ok(wheels.length > 3, `${id}: wheels on the banks`);
    const boxes = boxesIn(s, -2, -2, w + 2, h + 2), rand = mulberry32(0x267);
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const shore = reedShore(s, land, relief, tx, ty, true);
      if (!shore) continue;
      for (let a = 0; a < 40; a++) {
        const wx = tx * TILE + rand() * TILE, wz = ty * TILE + rand() * TILE;
        if (!reedSpot(shore, tx, ty, wx, wz, boxes, wheelRace, () => 1)) { refused++; continue; }
        stood++;
        for (const [dx, dz] of ring) {
          const vx = wx + dx, vz = wz + dz;
          for (const o of s.buildings) {
            const n = sizeOf(o);
            if (vx > o.x * TILE && vx < (o.x + n) * TILE && vz > o.y * TILE && vz < (o.y + n) * TILE) into++;
            if (o.type !== 'wheel') continue;
            const yaw = YAW[o.rot], ox = vx - (o.x + n / 2) * TILE, oz = vz - (o.y + n / 2) * TILE;
            if (wheelRace(ox * Math.cos(yaw) - oz * Math.sin(yaw), ox * Math.sin(yaw) + oz * Math.cos(yaw), 0) > 0) into++;
          }
        }
      }
    }
  }
  assert.ok(stood > 1000 && refused > 1000, `${stood} clumps stood, ${refused} refused`);
  assert.equal(into, 0, `${into} points of a clump's reach in a footprint or a race`);
  // And none on ground steeper than a bank.
  const shore = { surface: 0, minU: 0, maxU: TILE, minV: 0, maxV: TILE, still: false };
  assert.equal(reedSpot(shore, 0, 0, 1, 1, [], wheelRace, () => REED_SLOPE - 0.01), false);
  assert.equal(reedSpot(shore, 0, 0, 1, 1, [], wheelRace, () => REED_SLOPE), true);
});
