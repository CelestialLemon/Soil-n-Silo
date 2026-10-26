import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateLand, generateMap, TERRAIN, type MapData } from '../src/game/map.ts';
import { baseLevel, centreLevel, corners, isFlat, isGentle, joins, MAX_LEVEL, SIDES, sideOf, spanOf, STEEP } from '../src/game/relief.ts';
import { FERTILITY_RANGE, GROUND, GROUND_IDS, type GroundId, type GroundKind } from '../src/game/ground.ts';
import { newGame } from '../src/game/state.ts';
import { removeAt } from '../src/game/build.ts';
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
        assert.equal(land.terrain[j], m.terrain[i]); assert.equal(land.fertility[j], m.fertility[i]); assert.equal(land.ground[j], m.ground[i]);
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

test('cover keeps the requested shares and its habitat bias', () => {
  const rock: number[] = [], forest: number[] = [];
  for (const sc of ALL) {
    const m = map(sc), grass = m.terrain.map((_, i) => i).filter((i) => m.terrain[i] === TERRAIN.grass);
    for (const [kind, target] of [[TERRAIN.tree, sc.terrain.forest], [TERRAIN.rock, sc.terrain.rock]]) {
      assert.ok(Math.abs(m.terrain.filter((t) => t === kind).length / m.terrain.length - target) < 0.005, `${sc.id}: cover share`);
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
    assert.ok(grass.length > 0);
  }
  assert.ok(mean(rock) > 0.02, 'rock prefers high ground and cliffs');
  assert.ok(mean(forest) > 0, 'forest has a milder preference');
});

/** The share of a map's land (not water) under each kind of ground. */
const shares = (m: MapData) => {
  const count = GROUND_IDS.map(() => 0);
  let n = 0;
  for (let i = 0; i < m.terrain.length; i++) if (m.terrain[i] !== TERRAIN.water) { count[m.ground[i]]++; n++; }
  return Object.fromEntries(GROUND_IDS.map((id, k) => [id, count[k] / n])) as Record<GroundId, number>;
};
const meanShares = (list: Scenario[]) => Object.fromEntries(GROUND_IDS.map((id) => [id, mean(list.map((sc) => shares(map(sc))[id]))])) as Record<GroundId, number>;

test('every tile has a kind of ground, and the ground sets its fertility within the kind\'s range', () => {
  for (const sc of ALL) {
    const m = map(sc);
    assert.equal(m.ground.length, m.terrain.length);
    for (let i = 0; i < m.terrain.length; i++) {
      assert.ok(Number.isInteger(m.ground[i]) && m.ground[i] >= 0 && m.ground[i] < GROUND_IDS.length, `${sc.id}: a kind of ground`);
      const [lo, hi] = FERTILITY_RANGE[GROUND_IDS[m.ground[i]]];
      assert.ok(m.fertility[i] >= lo && m.fertility[i] <= hi, `${sc.id}: ${GROUND_IDS[m.ground[i]]} fertility ${m.fertility[i]}`);
      if (m.terrain[i] === TERRAIN.rock) assert.equal(m.ground[i], GROUND.stony, `${sc.id}: the ground under a rock is stony`);
    }
  }
  // Each kind uses its range with local noise, and the ranges order silt > loam > clay > sand > stony.
  const means = Object.fromEntries(GROUND_IDS.map((id) => [id, mean(CAMPAIGN.flatMap((sc) => map(sc).ground.map((g, i) => (GROUND_IDS[g] === id && map(sc).terrain[i] === TERRAIN.grass ? map(sc).fertility[i] : NaN)).filter((f) => !Number.isNaN(f))))]));
  assert.ok(means.silt > means.loam && means.loam > means.clay && means.clay > means.sand && means.sand > means.stony, JSON.stringify(means));
});

test('ground lies in large patches that follow the land', () => {
  for (const sc of [...CAMPAIGN, SANDBOX]) {
    const m = map(sc), grass = m.terrain.map((_, i) => i).filter((i) => m.terrain[i] !== TERRAIN.water);
    // Few tiles stand alone: most have most of the tiles round them of their own kind.
    let lone = 0;
    for (const i of grass) {
      let same = 0, all = 0;
      neighbours(m, i, (j) => { if (m.terrain[j] !== TERRAIN.water) { all++; if (m.ground[j] === m.ground[i]) same++; } });
      if (all && same * 2 < all) lone++;
    }
    assert.ok(lone / grass.length < 0.05, `${sc.id}: ${(100 * lone / grass.length).toFixed(1)}% of tiles stand alone`);
    // Every kind that covers a twelfth of the map or more holds a patch big enough for several fields (a field is 3 × 3).
    for (const k of [GROUND.silt, GROUND.clay, GROUND.sand, GROUND.stony]) {
      const patches = components(m, (i) => m.ground[i] === k).groups.filter((g) => m.terrain[g[0]] !== TERRAIN.water);
      if (shares(m)[GROUND_IDS[k]] >= 0.08) assert.ok(Math.max(...patches.map((g) => g.length)) >= 30, `${sc.id}: ${GROUND_IDS[k]} has a patch of several fields`);
    }
  }
});

test('ground follows the land: silt on the low ground by the river, clay in hollows and by still water, sand on the banks, stony on the heights', () => {
  const rivers = ALL.filter((sc) => sc.terrain.water === 'river' && sc.terrain.relief >= 0.25 && !sc.id.startsWith('dry')), still = ALL.filter((sc) => sc.terrain.water === 'lake' || sc.terrain.water === 'ponds');
  assert.ok(rivers.length > 20 && still.length > 20);
  // Silt lies nearer the water than the rest of the ground, and low; there is little of it by still water and none without water.
  const nearer: number[] = [], lower: number[] = [];
  for (const sc of rivers) {
    const m = map(sc), silt: number[] = [], rest: number[] = [], water = m.terrain.map((_, i) => i).filter((i) => m.terrain[i] === TERRAIN.water);
    if (!water.length) continue;
    const away = (i: number) => Math.min(...water.map((j) => Math.hypot((i % m.width) - (j % m.width), Math.floor(i / m.width) - Math.floor(j / m.width))));
    const lv = (i: number) => centreLevel(m, i % m.width, Math.floor(i / m.width));
    const siltTiles = m.ground.map((g, i) => (g === GROUND.silt ? i : -1)).filter((i) => i >= 0), other = m.ground.map((g, i) => (g !== GROUND.silt && m.terrain[i] !== TERRAIN.water ? i : -1)).filter((i) => i >= 0);
    if (siltTiles.length < 20) continue;
    for (const i of siltTiles.filter((_, n) => n % 7 === 0)) silt.push(away(i));
    for (const i of other.filter((_, n) => n % 25 === 0)) rest.push(away(i));
    nearer.push(mean(rest) - mean(silt));
    lower.push(mean(other.map(lv)) - mean(siltTiles.map(lv)));
  }
  assert.ok(nearer.length > 10 && nearer.every((d) => d > 0) && lower.every((d) => d > -0.01) && mean(lower) > 0.2, 'silt lies low and near the river');
  assert.ok(meanShares(still).silt < 0.4 * meanShares(rivers).silt, 'still water leaves little silt');
  assert.ok(meanShares(still).clay > meanShares(rivers).clay, 'still water leaves more clay');
  assert.equal(shares(map(DRY_SCENARIOS[1])).silt, 0, 'no water, no silt');
  // Stony ground is higher than the rest, and a hillier map has more of it.
  const heights = ALL.filter((sc) => sc.terrain.relief >= 0.6).map((sc) => {
    const m = map(sc), level = (k: (g: GroundKind) => boolean) => mean(m.ground.map((g, i) => (k(g) && m.terrain[i] !== TERRAIN.water ? centreLevel(m, i % m.width, Math.floor(i / m.width)) : NaN)).filter((v) => !Number.isNaN(v)));
    return level((g) => g === GROUND.stony) - level((g) => g !== GROUND.stony);
  });
  assert.ok(mean(heights) > 1, `stony ground is high (${mean(heights).toFixed(2)} levels above the rest)`);
  const hilly = ALL.filter((sc) => sc.terrain.relief >= 0.85 && !sc.terrain.ground.stony), flat = ALL.filter((sc) => sc.terrain.relief === 0 && !sc.terrain.ground.stony);
  assert.ok(meanShares(hilly).stony > meanShares(flat).stony + 0.08, 'hills are stonier by themselves');
  // Sand is there, and loam is the largest share.
  assert.ok(meanShares(rivers).sand > 0.02 && meanShares(rivers).loam > 0.35 && meanShares(rivers).loam < 0.8, `a river valley is about half loam (${meanShares(rivers).loam.toFixed(2)})`);
});

test('the mix follows the commission: rocky, poor soil and the campaign\'s stories', () => {
  const plain = ALL.filter((sc) => sc.id.startsWith('r') && !sc.tags.some((t) => t === 'Rocky' || t === 'Poor soil' || t === 'Hilly' || t === 'Flat')), rocky = ALL.filter((sc) => sc.tags.includes('Rocky')), poor = ALL.filter((sc) => sc.tags.includes('Poor soil'));
  assert.ok(plain.length > 20 && rocky.length > 10 && poor.length > 10);
  assert.ok(meanShares(rocky).stony > meanShares(plain).stony + 0.04, 'Rocky is stonier');
  assert.ok(meanShares(poor).sand > meanShares(plain).sand + 0.05 && meanShares(poor).stony > meanShares(plain).stony + 0.05, 'Poor soil is sandier and stonier');
  const fertility = (sc: Scenario) => mean(map(sc).fertility.filter((_, i) => map(sc).terrain[i] !== TERRAIN.water));
  assert.ok(mean(poor.map(fertility)) < mean(plain.map(fertility)) - 5, 'Poor soil is poorer');
  const [, , c3, , , c6, c7] = CAMPAIGN;
  assert.ok(shares(map(c6)).sand + shares(map(c6)).stony > 0.45, 'Tired Soil is sandy and stony');
  assert.ok(shares(map(c7)).silt > 1.5 * shares(map(SANDBOX)).silt && shares(map(c7)).silt > 0.2, 'Riverlands has a wide silt floodplain');
  assert.ok(shares(map(c3)).stony > 0.25 && shares(map(c3)).stony > shares(map(c3)).clay, 'Windy Ridge is stony high ground');
});

test('rocks lie mostly on stony ground, and clearing one leaves the ground', () => {
  let onStony = 0, rocks = 0;
  for (const sc of [...CAMPAIGN, SANDBOX, ...SCENARIOS.slice(0, 40)]) {
    if (sc.terrain.rock === 0) continue;
    const m = map(sc), bare = generateMap({ ...sc, terrain: { ...sc.terrain, rock: 0 } });
    for (let i = 0; i < m.terrain.length; i++) if (m.terrain[i] === TERRAIN.rock) { rocks++; if (bare.ground[i] === GROUND.stony) onStony++; }
    assert.deepEqual(m.ground.map((g, i) => (m.terrain[i] === TERRAIN.rock ? 0 : g)), bare.ground.map((g, i) => (m.terrain[i] === TERRAIN.rock ? 0 : g)), `${sc.id}: rocks leave the rest of the ground alone`);
  }
  assert.ok(onStony / rocks > 0.6, `${(100 * onStony / rocks).toFixed(0)}% of rocks lie on stony ground`);
  const s = newGame(CAMPAIGN[2]), rock = s.map.terrain.findIndex((t) => t === TERRAIN.rock);
  assert.ok(rock >= 0);
  const x = rock % s.map.width, y = Math.floor(rock / s.map.width), fertility = s.map.fertility[rock];
  s.credits = 1e6;
  assert.ok(removeAt(s, x, y).ok, 'a rock can be cleared');
  assert.equal(s.map.terrain[rock], TERRAIN.grass);
  assert.equal(s.map.ground[rock], GROUND.stony);
  assert.equal(s.map.fertility[rock], fertility);
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
