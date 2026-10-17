import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateLand, generateMap, TERRAIN, type MapData } from '../src/game/map.ts';
import { baseLevel, centreLevel, corners, isFlat, isGentle, joins, MAX_LEVEL, SIDES, sideOf, spanOf, STEEP } from '../src/game/relief.ts';
import { CAMPAIGN, randomScenario, SANDBOX, type Scenario } from '../src/game/scenarios.ts';

const SCENARIOS: Scenario[] = [...CAMPAIGN, SANDBOX, ...Array.from({ length: 200 }, (_, i) => randomScenario(i, (i % 3 + 1) as 1 | 2 | 3))];
const FLAT_SCENARIOS = (['river', 'ponds', 'lake', 'none'] as const).map((water) => ({ ...CAMPAIGN[0], id: `flat-${water}`, terrain: { ...CAMPAIGN[0].terrain, relief: 0, water } }));
const DRY_SCENARIOS = [0.2, 0.5, 0.9, 1].map((relief) => ({ ...CAMPAIGN[2], id: `dry-${relief}`, terrain: { ...CAMPAIGN[2].terrain, water: 'none' as const, relief } }));
// These narrow banks used to be severed by a one-corner mismatch beyond a waterfall's taper.
const FALL_REGRESSIONS = [874, 1003].map((seed) => randomScenario(seed, 2));
const ALL = [...SCENARIOS, ...FLAT_SCENARIOS, ...DRY_SCENARIOS, ...FALL_REGRESSIONS];
const maps = new Map(ALL.map((sc) => [sc, generateMap(sc)]));
const map = (sc: Scenario) => maps.get(sc)!;
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
const neighbours = (m: MapData, i: number, visit: (j: number, dir: number) => void) => {
  const x = i % m.width, y = Math.floor(i / m.width);
  SIDES.forEach(([dx, dy], d) => {
    if (x + dx >= 0 && y + dy >= 0 && x + dx < m.width && y + dy < m.height) visit(i + dy * m.width + dx, d);
  });
};
function components(m: MapData, accepts: (i: number) => boolean, crosses: (i: number, j: number, d: number) => boolean = () => true) {
  const label = new Int32Array(m.width * m.height).fill(-1), groups: number[][] = [];
  for (let i = 0; i < label.length; i++) {
    if (!accepts(i) || label[i] !== -1) continue;
    const q = [i], id = groups.length; label[i] = id;
    for (let k = 0; k < q.length; k++) neighbours(m, q[k], (j, d) => {
      if (label[j] === -1 && accepts(j) && crosses(q[k], j, d)) { label[j] = id; q.push(j); }
    });
    groups.push(q);
  }
  return { label, groups };
}

// Rivers divide the map until the player can build bridges. Test the depot's own bank and, independently, every other
// water-separated region: a cliff or a stand of trees must not introduce an additional inaccessible grass pocket.
test('trucks reach all grass on their bank, including high ground and plateaus', () => {
  for (const sc of ALL) {
    const m = map(sc), land = components(m, (i) => m.terrain[i] !== TERRAIN.water);
    const truck = components(m, (i) => m.terrain[i] === TERRAIN.grass && isGentle(m, i % m.width, Math.floor(i / m.width)),
      (i, _j, d) => joins(m, i % m.width, Math.floor(i / m.width), d));
    for (const body of land.groups) {
      const grass = body.filter((i) => m.terrain[i] === TERRAIN.grass);
      if (!grass.length) continue;
      const sizes = new Map<number, number>();
      for (const i of grass) sizes.set(truck.label[i], (sizes.get(truck.label[i]) ?? 0) + 1);
      assert.ok(!sizes.has(-1), `${sc.id}: grass on an undrivable bank`);
      assert.ok(Math.max(...sizes.values()) / grass.length >= 0.99, `${sc.id}: disconnected grass (${[...sizes.values()].join(', ')})`);
    }
    const depot = m.depot.y * m.width + m.depot.x, homeBank = land.groups[land.label[depot]];
    const grass = homeBank.filter((i) => m.terrain[i] === TERRAIN.grass);
    assert.ok(grass.filter((i) => truck.label[i] === truck.label[depot]).length / grass.length >= 0.99, `${sc.id}: depot bank`);
  }
});

test('corner heights are integer, bounded and gentle or steep; water and home are flat', () => {
  for (const sc of ALL) {
    const m = map(sc);
    assert.equal(m.corner.length, m.width * m.height * 4);
    assert.ok(m.corner.every((c) => Number.isInteger(c) && c >= 0 && c <= MAX_LEVEL), sc.id);
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
      assert.ok(spanOf(m, x, y) <= STEEP, `${sc.id}: span at ${x},${y}`);
      if (m.terrain[y * m.width + x] === TERRAIN.water) assert.equal(spanOf(m, x, y), 0, `${sc.id}: water`);
      const home = Math.max(Math.abs(x - m.depot.x - 1), Math.abs(y - m.depot.y - 1));
      if (home <= 5) {
        assert.deepEqual(corners(m, x, y), [0, 0, 0, 0], `${sc.id}: home`);
        assert.equal(m.terrain[y * m.width + x], TERRAIN.grass);
      }
      if (home <= 8) assert.ok(m.terrain[y * m.width + x] !== TERRAIN.tree && m.terrain[y * m.width + x] !== TERRAIN.rock);
    }
    assert.ok(isFlat(m, m.depot.x, m.depot.y, 3));
  }
  for (const sc of FLAT_SCENARIOS) assert.ok(map(sc).corner.every((c) => c === 0), sc.id);
});

test('the same seed gives the same map, independently of drawing margin', () => {
  for (const sc of [...CAMPAIGN, SANDBOX, ...FLAT_SCENARIOS]) {
    const m = map(sc);
    assert.deepEqual(generateMap(sc), m, `${sc.id}: deterministic`);
    for (const M of [1, 16, 56]) {
      const land = generateLand(sc, M);
      assert.deepEqual(land.depot, m.depot);
      for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
        const i = y * m.width + x, j = (y + M) * land.width + x + M;
        assert.deepEqual(corners(land, x + M, y + M), corners(m, x, y), `${sc.id}: margin ${M} at ${x},${y}`);
        assert.equal(land.terrain[j], m.terrain[i]); assert.equal(land.fertility[j], m.fertility[i]);
        assert.equal(Math.round(Math.hypot(land.flow[j * 2], land.flow[j * 2 + 1]) * 100) / 100, m.current[i]);
      }
    }
  }
});

test('rivers are continuous and flow downhill; still water and most shores share a datum', () => {
  for (const sc of ALL) {
    const m = map(sc), river = sc.terrain.water === 'river', land = generateLand(sc, 0);
    const water = components(m, (i) => m.terrain[i] === TERRAIN.water);
    if (sc.terrain.water === 'none') assert.equal(water.groups.length, 0);
    else assert.ok(water.groups.length > 0, `${sc.id}: water exists`);
    const highest = Math.max(0, ...water.groups.flat().map((i) => m.corner[i * 4]));
    let banks = 0, joined = 0;
    for (const body of water.groups) {
      if (!river) assert.equal(new Set(body.map((i) => m.corner[i * 4])).size, 1, `${sc.id}: still water`);
      for (const i of body) {
        const x = i % m.width, y = Math.floor(i / m.width), l = baseLevel(m, x, y);
        const vx = land.flow[i * 2], vy = land.flow[i * 2 + 1];
        if (river) {
          assert.ok(Math.hypot(vx, vy) > 0.5 && Math.hypot(vx, vy) < 1.2);
          assert.equal(land.drop[i], highest - l);
        } else { assert.equal(vx, 0); assert.equal(vy, 0); assert.equal(land.drop[i], 0); }
        neighbours(m, i, (j, d) => {
          if (m.terrain[j] !== TERRAIN.water) {
            banks++; if (joins(m, x, y, d)) joined++;
            const bank = sideOf(m, j % m.width, Math.floor(j / m.width), (d + 2) % 4);
            assert.ok(Math.min(...bank) >= l, `${sc.id}: submerged bank at ${j}`);
          } else if (river) {
            const [dx, dy] = SIDES[d];
            if (dx * vx + dy * vy > 0.4) assert.ok(m.corner[j * 4] <= l, `${sc.id}: uphill current`);
            const fall = Math.abs(m.corner[j * 4] - l);
            assert.ok(fall === 0 || fall >= 3, `${sc.id}: falls are cliffs`);
          }
        });
      }
    }
    if (river) assert.equal(water.groups.length, 1, `${sc.id}: continuous river`);
    if (banks) assert.ok(joined / banks >= 0.85, `${sc.id}: ${joined}/${banks} watered banks`);
    m.terrain.forEach((t, i) => { if (t !== TERRAIN.water) { assert.equal(land.flow[i * 2], 0); assert.equal(land.flow[i * 2 + 1], 0); assert.equal(land.drop[i], 0); } });
  }
});

test('gentle hills replace terrace ledges, with occasional substantial cliffs at higher relief', () => {
  let cliffs = 0, hills = 0;
  for (const sc of ALL) {
    const m = map(sc);
    let flat = 0, gentle = 0, steep = 0, edges = 0, tall = 0;
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
      if (m.terrain[y * m.width + x] === TERRAIN.water) continue;
      const span = spanOf(m, x, y);
      if (span === 0) flat++; else if (span === 1) gentle++; else steep++;
      for (const d of [1, 2]) {
        const [dx, dy] = SIDES[d], nx = x + dx, ny = y + dy;
        if (nx >= m.width || ny >= m.height || m.terrain[ny * m.width + nx] === TERRAIN.water || joins(m, x, y, d)) continue;
        edges++;
        const a = sideOf(m, x, y, d), b = sideOf(m, nx, ny, (d + 2) % 4);
        if (Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) >= 3) tall++;
      }
    }
    assert.ok(steep / (flat + gentle + steep) < 0.02, `${sc.id}: banks are rare`);
    if (sc.terrain.relief < 0.55) assert.equal(edges, 0, `${sc.id}: no incidental ledges`);
    if (sc.terrain.relief >= 0.85) { cliffs += tall; hills += Math.max(...m.corner); }
    if (sc.terrain.relief >= 0.4) assert.ok(gentle > 0, `${sc.id}: hills have slopes`);
  }
  assert.ok(cliffs > 0 && hills > 0, 'high relief has cliffs and hills');
});

test('soil retains its mean and height penalty; cover retains requested shares and habitat bias', () => {
  const rock: number[] = [], forest: number[] = [];
  for (const sc of ALL) {
    const m = map(sc), grass = m.terrain.map((_, i) => i).filter((i) => m.terrain[i] === TERRAIN.grass);
    assert.ok(m.fertility.every((f) => Number.isInteger(f) && f >= 5 && f <= 95));
    assert.ok(Math.abs(mean(grass.map((i) => m.fertility[i])) - sc.terrain.soil) < 2, `${sc.id}: mean soil`);
    for (const [kind, target] of [[TERRAIN.tree, sc.terrain.forest], [TERRAIN.rock, sc.terrain.rock]]) {
      assert.ok(Math.abs(m.terrain.filter((t) => t === kind).length / m.terrain.length - target) < 0.005, `${sc.id}: cover share`);
    }
    const levels = grass.map((i) => centreLevel(m, i % m.width, Math.floor(i / m.width)));
    const lo = Math.min(...levels), hi = Math.max(...levels);
    if (hi > lo) {
      assert.ok(mean(grass.filter((_, n) => levels[n] === lo).map((i) => m.fertility[i])) > mean(grass.filter((_, n) => levels[n] === hi).map((i) => m.fertility[i])), `${sc.id}: poorer uphill`);
    }
    if (sc.terrain.relief === 0) continue;
    const scores: number[][] = [[], [], []], top = Math.max(...m.corner);
    for (let i = 0; i < m.terrain.length; i++) {
      const x = i % m.width, y = Math.floor(i / m.width);
      if (m.terrain[i] === TERRAIN.water || Math.max(Math.abs(x - m.depot.x - 1), Math.abs(y - m.depot.y - 1)) <= 8) continue;
      let cliff = 0;
      neighbours(m, i, (_j, d) => { if (!joins(m, x, y, d)) cliff = 1; });
      const score = centreLevel(m, x, y) / top + cliff;
      scores[0].push(score);
      if (m.terrain[i] === TERRAIN.rock) scores[1].push(score);
      if (m.terrain[i] === TERRAIN.tree) scores[2].push(score);
    }
    if (scores[1].length) rock.push(mean(scores[1]) - mean(scores[0]));
    if (scores[2].length) forest.push(mean(scores[2]) - mean(scores[0]));
  }
  assert.ok(mean(rock) > 0.02, 'rock prefers high ground and cliffs');
  assert.ok(mean(forest) > 0, 'forest has a milder preference');
});

test('water enriches nearby grass at the same height', () => {
  for (const sc of CAMPAIGN) {
    const m = generateMap({ ...sc, terrain: { ...sc.terrain, soilSpread: 0 } });
    const wet: number[][] = Array.from({ length: MAX_LEVEL * 4 + 1 }, () => []), dry = wet.map(() => [] as number[]);
    for (let i = 0; i < m.terrain.length; i++) {
      if (m.terrain[i] !== TERRAIN.grass) continue;
      const x = i % m.width, y = Math.floor(i / m.width);
      let water = false;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (x + dx >= 0 && y + dy >= 0 && x + dx < m.width && y + dy < m.height && m.terrain[(y + dy) * m.width + x + dx] === TERRAIN.water) water = true;
      }
      (water ? wet : dry)[centreLevel(m, x, y) * 4].push(m.fertility[i]);
    }
    let compared = false;
    for (let l = 0; l < wet.length; l++) if (wet[l].length && dry[l].length) {
      assert.ok(mean(wet[l]) > mean(dry[l]), `${sc.id}: water bonus at ${l / 4}`); compared = true;
    }
    assert.ok(compared, `${sc.id}: wet and dry land`);
  }
});

test('the drawing country has joined slopes, higher hills and a drivable track from home', () => {
  for (const sc of [...CAMPAIGN, ...FLAT_SCENARIOS]) {
    const M = 56, land = generateLand(sc, M), w = sc.width, h = sc.height;
    const idx = (x: number, y: number) => (y + M) * land.width + x + M;
    let high = 0;
    for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
      const i = idx(x, y);
      assert.ok(spanOf(land, x + M, y + M) <= STEEP, `${sc.id}: country span`);
      assert.ok(corners(land, x + M, y + M).every((c) => Number.isInteger(c) && c >= 0));
      if (land.terrain[i] === TERRAIN.water) assert.equal(spanOf(land, x + M, y + M), 0);
      if (x < 0 || y < 0 || x >= w || y >= h) high = Math.max(high, ...corners(land, x + M, y + M));
      if (!land.track[i]) continue;
      assert.ok(y >= h); assert.equal(land.terrain[i], TERRAIN.grass);
      assert.ok(isGentle(land, x + M, y + M));
      for (const d of [1, 2]) {
        const [dx, dy] = SIDES[d];
        if (x + dx < w + M && y + dy < h + M && land.track[idx(x + dx, y + dy)]) assert.ok(joins(land, x + M, y + M, d), `${sc.id}: track join`);
      }
    }
    assert.ok(high > Math.max(...map(sc).corner), `${sc.id}: country hills`);
    assert.equal(land.track.reduce((a, b) => a + b, 0), M * 3);
    for (let x = land.depot.x; x < land.depot.x + 3; x++) assert.ok(joins(land, x + M, h - 1 + M, 2), `${sc.id}: home exit`);
  }
});
