import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateLand, generateMap, RIM_LEVEL, TERRAIN, type MapData } from '../src/game/map.ts';
import { FLAT, joins, MAX_LEVEL, SIDES } from '../src/game/relief.ts';
import { CAMPAIGN, randomScenario, SANDBOX, type Scenario } from '../src/game/scenarios.ts';

const SCENARIOS: Scenario[] = [...CAMPAIGN, SANDBOX, ...[1, 7, 17, 72, 78, 80, 92, 99, 109, 133, 186, 296, 771, 933, 953].flatMap((s) => ([1, 2, 3] as const).map((d) => randomScenario(s, d)))];
const FLAT_SCENARIOS = (['river', 'ponds', 'lake', 'none'] as const).map((water) => ({ ...CAMPAIGN[0], id: `flat-${water}`, terrain: { ...CAMPAIGN[0].terrain, relief: 0, water } }));
const DRY_SCENARIOS = [0.2, 0.5, 0.9].map((relief) => ({ ...CAMPAIGN[2], id: `dry-${relief}`, terrain: { ...CAMPAIGN[2].terrain, water: 'none' as const, relief } }));
const ALL = [...SCENARIOS, ...FLAT_SCENARIOS, ...DRY_SCENARIOS];
const maps = new Map(ALL.map((sc) => [sc, generateMap(sc)]));
const map = (sc: Scenario) => maps.get(sc)!;
const landTile = (m: MapData, i: number) => m.terrain[i] !== TERRAIN.water;
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
function coverage(m: MapData, n: number) {
  const covered = new Uint8Array(m.width * m.height);
  for (let y = 0; y <= m.height - n; y++) for (let x = 0; x <= m.width - n; x++) {
    const l = m.level[y * m.width + x];
    let ok = true;
    for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) {
      const i = (y + dy) * m.width + x + dx;
      if (!landTile(m, i) || m.level[i] !== l || m.ramp[i] !== FLAT) ok = false;
    }
    if (ok) for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) covered[(y + dy) * m.width + x + dx] = 1;
  }
  return covered;
}
const rampRuns = (m: MapData) => components(m, (i) => m.ramp[i] !== FLAT, (i, j, d) => m.ramp[i] === m.ramp[j]
  && m.level[i] === m.level[j] && d % 2 !== m.ramp[i] % 2).groups;
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

// Count flat land cliff edges in both orientations. A run keeps the same signed level pair, so turns, ramps and changes
// of terrace end it; shorelines and the map border are not cliffs. Weight by edge length rather than by number of runs.
function cliffStraightness(m: MapData) {
  let edges = 0, long = 0, longest = 0;
  for (const vertical of [false, true]) for (let b = 1; b < (vertical ? m.width : m.height); b++) {
    let run = 0, previous = '';
    const end = () => { edges += run; longest = Math.max(longest, run); if (run > 6) long += run; run = 0; };
    for (let a = 0; a < (vertical ? m.height : m.width); a++) {
      const i = vertical ? a * m.width + b : b * m.width + a, j = i - (vertical ? 1 : m.width);
      const key = landTile(m, i) && landTile(m, j) && m.ramp[i] === FLAT && m.ramp[j] === FLAT && m.level[i] !== m.level[j]
        ? `${m.level[i]}:${m.level[j]}` : '';
      if (!key || key !== previous) end();
      if (key) run++;
      previous = key;
    }
    end();
  }
  return { edges, long, longest };
}

test('campaign cliffs follow irregular contours rather than long rectangular borders', () => {
  let total = 0, long = 0;
  for (const sc of CAMPAIGN) {
    const stats = cliffStraightness(map(sc)); total += stats.edges; long += stats.long;
    assert.ok(stats.edges > 0, `${sc.id}: cliffs to measure`);
    assert.ok(stats.long / stats.edges < 0.25, `${sc.id}: ${stats.long}/${stats.edges} cliff edges in straight runs longer than six`);
    assert.ok(stats.longest <= 12, `${sc.id}: straight cliff of ${stats.longest} tiles`);
  }
  assert.ok(long / total < 0.15, 'long straight cliff edges are rare across the campaign');
});

test('rivers wind in continuous two-to-four-tile cross sections and fall across their full width', () => {
  for (const sc of ALL.filter((sc) => sc.terrain.water === 'river')) {
    const m = map(sc), land = generateLand(sc, 0), first = m.terrain.indexOf(TERRAIN.water);
    const vertical = Math.abs(land.flow[first * 2 + 1]) > Math.abs(land.flow[first * 2]);
    const span = vertical ? m.height : m.width, breadth = vertical ? m.width : m.height;
    let previous: number[] = [];
    for (let a = 0; a < span; a++) {
      const cross: number[] = [];
      for (let b = 0; b < breadth; b++) if (m.terrain[vertical ? a * m.width + b : b * m.width + a] === TERRAIN.water) cross.push(b);
      assert.ok(cross.length >= 2 && cross.length <= 4, `${sc.id}: river width ${cross.length} at ${a}`);
      assert.equal(cross.at(-1)! - cross[0] + 1, cross.length, `${sc.id}: solid cross section`);
      const levels = cross.map((b) => m.level[vertical ? a * m.width + b : b * m.width + a]);
      assert.equal(new Set(levels).size, 1, `${sc.id}: level across the river`);
      if (previous.length) assert.ok(cross.some((b) => previous.includes(b)), `${sc.id}: adjacent cross sections overlap`);
      previous = cross;
    }
  }
});

test('ponds and lakes have rounded outlines even at the smallest radius', () => {
  for (const sc of ALL.filter((sc) => sc.terrain.water === 'ponds' || sc.terrain.water === 'lake')) {
    const m = map(sc);
    for (const body of components(m, (i) => !landTile(m, i)).groups) {
      const xs = body.map((i) => i % m.width), ys = body.map((i) => Math.floor(i / m.width)), tiles = new Set(body);
      for (const x of [Math.min(...xs), Math.max(...xs)]) for (const y of [Math.min(...ys), Math.max(...ys)]) {
        assert.ok(!tiles.has(y * m.width + x), `${sc.id}: a water body fills its bounding-box corner at ${x},${y}`);
      }
    }
  }
});

test('generation is deterministic and the map is independent of every drawing margin', () => {
  for (const sc of ALL) {
    const m = map(sc), core = generateLand(sc, 0);
    assert.deepEqual(generateMap(sc), m);
    for (const M of [1, 7, 20, 56]) {
      const land = generateLand(sc, M);
      assert.equal(land.width, m.width + 2 * M);
      assert.equal(land.height, m.height + 2 * M);
      assert.deepEqual(land.depot, m.depot);
      for (const field of ['terrain', 'fertility', 'level', 'ramp', 'drop'] as const) {
        for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
          assert.equal(land[field][(y + M) * land.width + x + M], core[field][y * m.width + x], `${sc.id} ${field} at ${x},${y}, margin ${M}`);
        }
      }
      for (let y = m.height; y < m.height + M; y++) for (let x = -M; x < m.width + M; x++) {
        const i = (y + M) * land.width + x + M;
        if (!land.track[i]) continue;
        if (y === m.height) assert.ok(joins(land, x + M, y + M, 0), `${sc.id}: track exit, margin ${M}`);
        if (y + 1 < m.height + M && land.track[i + land.width]) assert.ok(joins(land, x + M, y + M, 2), `${sc.id}: track, margin ${M}`);
      }
    }
  }
});

test('relief gives broad buildable terraces, single-height cliffs, and a flat home below the summit', () => {
  for (const sc of ALL) {
    const m = map(sc), c2 = coverage(m, 2), c3 = coverage(m, 3), flat: number[] = [];
    const top = Math.max(...m.level);
    assert.ok(top <= MAX_LEVEL);
    if (sc.terrain.relief === 0) { assert.equal(top, 0); assert.ok(m.ramp.every((r) => r === FLAT)); }
    else {
      assert.equal(top, Math.ceil(sc.terrain.relief * MAX_LEVEL), `${sc.id}: relief range`);
      assert.ok(m.level[m.depot.y * m.width + m.depot.x] < top, `${sc.id}: depot below summit`);
    }
    m.level.forEach((l, i) => {
      assert.ok(Number.isInteger(l) && l >= 0 && l <= MAX_LEVEL);
      neighbours(m, i, (j) => assert.ok(Math.abs(l - m.level[j]) <= 1, `${sc.id}: tall cliff at ${i}`));
      if (landTile(m, i) && m.ramp[i] === FLAT) { assert.ok(c2[i], `${sc.id}: sliver at ${i % m.width},${Math.floor(i / m.width)}`); flat.push(i); }
    });
    assert.ok(mean(flat.map((i) => c3[i])) >= 0.8, `${sc.id}: 3×3 coverage`);
    assert.ok(flat.length / m.terrain.filter((t) => t !== TERRAIN.water).length >= 0.9, `${sc.id}: mostly flat`);
    const homeLevel = m.level[m.depot.y * m.width + m.depot.x];
    for (let y = m.depot.y - 4; y <= Math.min(m.height - 1, m.depot.y + 6); y++) for (let x = m.depot.x - 4; x <= m.depot.x + 6; x++) {
      const i = y * m.width + x;
      assert.equal(m.ramp[i], FLAT, `${sc.id}: home ramp`);
      assert.equal(m.level[i], homeLevel, `${sc.id}: home terrace`);
      assert.notEqual(m.terrain[i], TERRAIN.water, `${sc.id}: home water`);
    }
  }
});

test('ramps are grass runs of one to three, joining flat ground at each end', () => {
  for (const sc of ALL) {
    const m = map(sc);
    for (const run of rampRuns(m)) {
      assert.ok(run.length >= 1 && run.length <= 3, `${sc.id}: ramp width ${run.length}`);
      for (const i of run) {
        const d = m.ramp[i], [dx, dy] = SIDES[d], low = i - dy * m.width - dx, high = i + dy * m.width + dx;
        assert.equal(m.terrain[i], TERRAIN.grass);
        assert.equal(m.ramp[low], FLAT, `${sc.id}: ramp low end at ${i}`); assert.equal(m.ramp[high], FLAT, `${sc.id}: ramp high end at ${i}`);
        assert.ok(landTile(m, low) && landTile(m, high));
        assert.equal(m.level[low], m.level[i]); assert.equal(m.level[high], m.level[i] + 1);
        assert.ok(joins(m, i % m.width, Math.floor(i / m.width), d));
        assert.ok(joins(m, i % m.width, Math.floor(i / m.width), (d + 2) % 4));
      }
    }
  }
});

test('ramps connect each water-separated land region and offer a choice along long cliffs', () => {
  for (const sc of ALL) {
    const m = map(sc), regions = components(m, (i) => landTile(m, i));
    const reachable = components(m, (i) => landTile(m, i), (i, _j, d) => joins(m, i % m.width, Math.floor(i / m.width), d));
    for (const group of regions.groups) if (group.length >= 30) assert.equal(new Set(group.map((i) => reachable.label[i])).size, 1, `${sc.id}: disconnected land`);
    const flats = components(m, (i) => landTile(m, i) && m.ramp[i] === FLAT, (i, j) => m.level[i] === m.level[j]);
    const key = (a: number, b: number) => `${Math.min(a, b)}:${Math.max(a, b)}`;
    const cliffs = new Map<string, number>(), ramps = new Map<string, number>();
    for (let i = 0; i < m.terrain.length; i++) if (flats.label[i] >= 0) neighbours(m, i, (j) => {
      if (j <= i || flats.label[j] < 0 || m.level[i] === m.level[j]) return;
      const k = key(flats.label[i], flats.label[j]); cliffs.set(k, (cliffs.get(k) ?? 0) + 1);
    });
    for (const run of rampRuns(m)) {
      const i = run[0], [dx, dy] = SIDES[m.ramp[i]], k = key(flats.label[i - dy * m.width - dx], flats.label[i + dy * m.width + dx]);
      ramps.set(k, (ramps.get(k) ?? 0) + 1);
    }
    for (const [k, length] of cliffs) if (length > 12) assert.ok((ramps.get(k) ?? 0) >= 2, `${sc.id}: ${length}-tile cliff ${k} has ${ramps.get(k) ?? 0} routes`);
    if (sc.terrain.relief > 0) assert.ok([...cliffs.values()].reduce((a, b) => a + b, 0) > m.ramp.filter((r) => r !== FLAT).length, `${sc.id}: cliffs still matter`);
  }
});

test('rivers run downhill over one or two unit falls; still water has level surfaces and same-level banks', () => {
  for (const sc of ALL) {
    const m = map(sc), land = generateLand(sc, 0), river = sc.terrain.water === 'river';
    const water = components(m, (i) => !landTile(m, i));
    if (sc.terrain.water !== 'none') assert.ok(water.groups.length > 0, `${sc.id}: water exists`);
    const highest = Math.max(0, ...m.level.filter((_, i) => !landTile(m, i)));
    let banks = 0, wetBanks = 0;
    for (const body of water.groups) {
      if (!river) assert.equal(new Set(body.map((i) => m.level[i])).size, 1, `${sc.id}: still surface`);
      for (const i of body) {
        assert.equal(m.ramp[i], FLAT);
        const vx = land.flow[i * 2], vy = land.flow[i * 2 + 1];
        if (river) {
          assert.ok(Math.hypot(vx, vy) > 0.5 && Math.hypot(vx, vy) < 1.2);
          assert.equal(land.drop[i], highest - m.level[i]);
        } else { assert.equal(vx, 0); assert.equal(vy, 0); assert.equal(land.drop[i], 0); }
        neighbours(m, i, (j, d) => {
          if (landTile(m, j)) {
            banks++; if (m.level[j] === m.level[i] && m.ramp[j] === FLAT) wetBanks++;
            assert.ok(m.level[j] >= m.level[i], `${sc.id}: submerged bank at ${j}`);
          } else if (river) {
            const [dx, dy] = SIDES[d];
            if (dx * vx + dy * vy > 0.4) assert.ok(m.level[j] <= m.level[i], `${sc.id}: upstream fall`);
            assert.ok(Math.abs(m.level[j] - m.level[i]) <= 1);
          }
        });
      }
    }
    if (river) {
      assert.equal(water.groups.length, 1, `${sc.id}: continuous river`);
      const used = new Set(water.groups.flatMap((g) => g.map((i) => m.level[i])));
      assert.equal(used.size - 1, sc.terrain.relief === 0 ? 0 : Math.min(2, Math.ceil(sc.terrain.relief * MAX_LEVEL)), `${sc.id}: falls`);
    }
    if (banks) assert.ok(wetBanks / banks >= 0.6, `${sc.id}: watered banks ${wetBanks}/${banks}`);
    land.terrain.forEach((t, i) => { if (t !== TERRAIN.water) { assert.equal(land.flow[i * 2], 0); assert.equal(land.flow[i * 2 + 1], 0); assert.equal(land.drop[i], 0); } });
  }
});

test('river banks rise away into upland terraces', () => {
  for (const sc of ALL.filter((sc) => sc.terrain.water === 'river' && sc.terrain.relief > 0)) {
    const m = map(sc), distance = new Int32Array(m.level.length).fill(-1), queue: number[] = [];
    m.terrain.forEach((t, i) => { if (t === TERRAIN.water) { distance[i] = 0; queue.push(i); } });
    for (let k = 0; k < queue.length; k++) neighbours(m, queue[k], (j) => {
      if (distance[j] === -1) { distance[j] = distance[queue[k]] + 1; queue.push(j); }
    });
    const bank: number[] = [], upland: number[] = [];
    for (let i = 0; i < m.level.length; i++) {
      if (!landTile(m, i) || Math.max(Math.abs(i % m.width - m.depot.x - 1), Math.abs(Math.floor(i / m.width) - m.depot.y - 1)) <= 8) continue;
      if (distance[i] <= 4) bank.push(m.level[i]);
      if (distance[i] >= 8) upland.push(m.level[i]);
    }
    assert.ok(mean(upland) > mean(bank), `${sc.id}: river valley below uplands`);
  }
});

test('soil follows height, grass retains the scenario mean, and forest and rock retain their shares', () => {
  for (const sc of ALL) {
    const m = map(sc), grass = m.terrain.map((_, i) => i).filter((i) => m.terrain[i] === TERRAIN.grass);
    assert.ok(m.fertility.every((f) => Number.isInteger(f) && f >= 5 && f <= 95));
    assert.ok(Math.abs(mean(grass.map((i) => m.fertility[i])) - sc.terrain.soil) < 5, `${sc.id}: soil mean`);
    for (const [kind, target] of [[TERRAIN.tree, sc.terrain.forest], [TERRAIN.rock, sc.terrain.rock]]) {
      assert.ok(Math.abs(m.terrain.filter((t) => t === kind).length / m.terrain.length - target) < 0.025, `${sc.id}: cover share`);
    }
    if (sc.terrain.relief > 0) {
      const lowest = Math.min(...grass.map((i) => m.level[i])), highest = Math.max(...grass.map((i) => m.level[i]));
      assert.ok(mean(grass.filter((i) => m.level[i] === lowest).map((i) => m.fertility[i])) > mean(grass.filter((i) => m.level[i] === highest).map((i) => m.fertility[i])), `${sc.id}: poorer uphill`);
    }
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
      if (Math.max(Math.abs(x - m.depot.x - 1), Math.abs(y - m.depot.y - 1)) <= 8) {
        assert.ok(m.terrain[y * m.width + x] !== TERRAIN.tree && m.terrain[y * m.width + x] !== TERRAIN.rock, `${sc.id}: clearing`);
      }
    }
  }
});

test('rock and forest favour high ground and cliffs across the scenario spread', () => {
  const rock: number[] = [], forest: number[] = [];
  for (const sc of SCENARIOS) {
    const m = map(sc), scores: number[][] = [[], [], []], top = Math.max(...m.level);
    if (top === 0) continue; // a flat map has no ridges or cliffs to favour
    for (let i = 0; i < m.level.length; i++) {
      const x = i % m.width, y = Math.floor(i / m.width);
      if (!landTile(m, i) || m.ramp[i] !== FLAT || Math.max(Math.abs(x - m.depot.x - 1), Math.abs(y - m.depot.y - 1)) <= 8) continue;
      let cliff = 0;
      neighbours(m, i, (j) => { if (m.level[i] !== m.level[j]) cliff = 1; });
      const score = m.level[i] / top + cliff;
      scores[0].push(score);
      if (m.terrain[i] === TERRAIN.rock) scores[1].push(score);
      if (m.terrain[i] === TERRAIN.tree) scores[2].push(score);
    }
    rock.push(mean(scores[1]) - mean(scores[0]));
    forest.push(mean(scores[2]) - mean(scores[0]));
  }
  assert.ok(mean(rock) > 0.15, 'rock favours the ridges and cliffs');
  assert.ok(mean(forest) > 0.01, 'forest has a milder preference');
});

test('the country rises into stepped hills, settles at the rim, and carries a drivable winding track', () => {
  for (const sc of ALL) {
    const M = 56, land = generateLand(sc, M), w = sc.width, h = sc.height;
    const idx = (x: number, y: number) => (y + M) * land.width + x + M;
    let hills = 0, countryRamps = 0, highestHill = 0;
    const highestWater = Math.max(0, ...land.level.filter((_, i) => land.terrain[i] === TERRAIN.water));
    const bendHash = Math.sin(sc.seed * 127.1 + 3 * 311.7) * 43758.5453;
    const bend = bendHash - Math.floor(bendHash) < 0.5 ? -1 : 1;
    for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
      const i = idx(x, y), rim = Math.min(x + M, y + M, w + M - 1 - x, h + M - 1 - y);
      assert.ok(Number.isInteger(land.level[i]) && land.level[i] >= 0 && land.level[i] <= 10);
      if (rim < 10) { assert.equal(land.level[i], RIM_LEVEL, `${sc.id}: rim`); assert.equal(land.ramp[i], FLAT); }
      if (x < 0 || y < 0 || x >= w || y >= h) {
        if (land.level[i] > MAX_LEVEL && rim >= 10) hills++;
        highestHill = Math.max(highestHill, land.level[i]);
        if (land.ramp[i] !== FLAT && !land.track[i]) {
          countryRamps++; assert.equal(land.terrain[i], TERRAIN.grass);
          const [dx, dy] = SIDES[land.ramp[i]], low = idx(x - dx, y - dy), high = idx(x + dx, y + dy);
          assert.equal(land.ramp[low], FLAT); assert.equal(land.ramp[high], FLAT);
          assert.equal(land.level[low], land.level[i]); assert.equal(land.level[high], land.level[i] + 1);
          assert.notEqual(land.terrain[low], TERRAIN.water); assert.notEqual(land.terrain[high], TERRAIN.water);
        }
      }
      if (land.terrain[i] === TERRAIN.water) {
        if (sc.terrain.water === 'river') {
          assert.equal(land.drop[i], highestWater - land.level[i]);
          assert.ok(Math.hypot(land.flow[i * 2], land.flow[i * 2 + 1]) > 0.5);
        } else { assert.equal(land.drop[i], 0); assert.equal(land.flow[i * 2], 0); assert.equal(land.flow[i * 2 + 1], 0); }
        for (const [dx, dy] of SIDES) {
          const j = idx(x + dx, y + dy);
          if (land.terrain[j] !== undefined && land.terrain[j] !== TERRAIN.water) assert.ok(land.level[j] >= land.level[i], `${sc.id}: country bank`);
        }
      }
      const t = Math.min(1, Math.max(0, (y - h - 6) / 20));
      const expected = y >= h && Math.abs(x - land.depot.x - 1 - Math.round(bend * 5 * t * t * (3 - 2 * t))) <= 1;
      assert.equal(land.track[i], expected ? 1 : 0, `${sc.id}: track mask at ${x},${y}`);
      if (!land.track[i]) continue;
      assert.ok(y >= h && Math.abs(x - land.depot.x - 1) <= 6);
      assert.equal(land.terrain[i], TERRAIN.grass);
      assert.ok(land.ramp[i] === FLAT || land.ramp[i] === 2);
      if (y + 1 < h + M && land.track[idx(x, y + 1)]) assert.ok(joins(land, x + M, y + M, 2), `${sc.id}: track cliff at ${x},${y}`);
      if (land.track[idx(x + 1, y)]) assert.ok(joins(land, x + M, y + M, 1), `${sc.id}: track across`);
    }
    assert.ok(hills > 100 && countryRamps > 0 && highestHill > RIM_LEVEL);
    assert.equal(land.track.reduce((a, b) => a + b, 0), M * 3);
    for (let x = land.depot.x; x < land.depot.x + 3; x++) assert.ok(joins(land, x + M, h - 1 + M, 2), `${sc.id}: depot track exit`);
  }
});

test('water enriches neighbouring grass within the same terrace', () => {
  for (const sc of ALL.filter((sc) => sc.terrain.water !== 'none')) {
    const m = generateMap({ ...sc, terrain: { ...sc.terrain, soilSpread: 0 } });
    const wet: number[][] = Array.from({ length: MAX_LEVEL + 1 }, () => []), dry: number[][] = wet.map(() => []);
    for (let i = 0; i < m.terrain.length; i++) {
      if (m.terrain[i] !== TERRAIN.grass || m.ramp[i] !== FLAT) continue;
      const x = i % m.width, y = Math.floor(i / m.width);
      let water = false;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (x + dx >= 0 && y + dy >= 0 && x + dx < m.width && y + dy < m.height && m.terrain[(y + dy) * m.width + x + dx] === TERRAIN.water) water = true;
      }
      (water ? wet : dry)[m.level[i]].push(m.fertility[i]);
    }
    let compared = false;
    for (let l = 0; l <= MAX_LEVEL; l++) if (wet[l].length && dry[l].length) {
      assert.ok(mean(wet[l]) > mean(dry[l]), `${sc.id}: water bonus at level ${l}`); compared = true;
    }
    assert.ok(compared, `${sc.id}: wet and dry grass to compare`);
  }
});

test('a 52×45 map with 56 tiles of country generates comfortably within a frame budget', () => {
  const sc = { ...CAMPAIGN[7], width: 52, height: 45 };
  generateLand(sc, 56);
  const timings = Array.from({ length: 5 }, () => { const start = performance.now(); generateLand(sc, 56); return performance.now() - start; });
  timings.sort((a, b) => a - b);
  assert.ok(timings[2] < 50, `generation took ${timings.join(', ')} ms`);
});
