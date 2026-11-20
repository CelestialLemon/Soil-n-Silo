import assert from 'node:assert/strict';
import { test } from 'node:test';
// The painting kit needs three.js, so it can't go through brush3d/src/shared.ts (which loads in Node without it); this test
// builds the real crag geometry to check what's drawn stays on the rock tiles, so it reads the kit itself, as
// settings.test.ts reads renderer/quality.ts.
import { MeshBuilder, rng } from '../brush3d/src/kit/builder.ts';
import { addCrag, addStone, groundOf } from '../brush3d/src/kit/kit.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { CAMPAIGN } from '../src/game/scenarios.ts';
import { newGame } from '../src/game/state.ts';
import { cragTops, plantTile } from '../src/world/brush/pickTile.ts';
import { planOutcropTile, ROCK_BIT, rockMask, rockTileKey, type PlannedRock, type RocksLook } from '../src/world/brush/rockPlan.ts';
import { TILE } from '../src/world/brush/scale.ts';

const FLAT_GROUND = groundOf(() => 0);
const FLAT = () => 0;
const TOPS = cragTops({ addCrag, groundOf, MeshBuilder, rng });

/** Emits real `addCrag` geometry for planned pieces and returns the built BufferGeometry. */
function buildCrags(pieces: readonly PlannedRock[], ground = FLAT_GROUND) {
  const b = new MeshBuilder('paint');
  for (const p of pieces) {
    addCrag(b, ground, p.x, p.z, {
      rx: p.rx, ry: p.ry, rz: p.rz, yaw: p.yaw, pitch: p.pitch, roll: p.roll,
      sink: p.sink, crag: p.crag, moss: p.moss, detail: p.detail,
    }, rng(p.seed));
  }
  return b.build();
}

/** Distance from world XZ point (wx, wz) to the union of occupied rock tile squares (0 when inside). */
function distToRockUnion(wx: number, wz: number, tiles: readonly [number, number][]): number {
  let best = Infinity;
  for (const [tx, tz] of tiles) {
    const dx = Math.max(tx * TILE - wx, 0, wx - (tx + 1) * TILE);
    const dz = Math.max(tz * TILE - wz, 0, wz - (tz + 1) * TILE);
    best = Math.min(best, Math.hypot(dx, dz));
    if (best === 0) return 0;
  }
  return best;
}

test('rockMask and rockTileKey detect neighbour clearing and height changes at all corners and edges', () => {
  const rocks = new Set(['7,3', '8,3', '7,4', '8,4']);
  const isRock = (x: number, y: number) => rocks.has(`${x},${y}`);
  const m0 = rockMask(isRock, 7, 3);
  assert.equal(m0, ROCK_BIT.E | ROCK_BIT.S | ROCK_BIT.SE);

  const k0 = rockTileKey(7, 3, m0, () => 0);

  // Moving any of the 9 sampled points (4 corners, 4 cardinal edge midpoints, centre) invalidates the key.
  for (let dy = 0; dy <= 1; dy += 0.5) for (let dx = 0; dx <= 1; dx += 0.5) {
    const kMoved = rockTileKey(7, 3, m0, (tx, ty) => (Math.abs(tx - (7 + dx)) < 1e-6 && Math.abs(ty - (3 + dy)) < 1e-6 ? 0.25 : 0));
    assert.notEqual(kMoved, k0, `height change at (${7 + dx}, ${3 + dy}) must invalidate rockTileKey`);
  }

  // Clearing the neighbour in the next block flips its mask bit and invalidates the key.
  rocks.delete('8,3');
  const mCleared = rockMask(isRock, 7, 3);
  assert.equal(mCleared & ROCK_BIT.E, 0);
  assert.notEqual(rockTileKey(7, 3, mCleared, () => 0), k0);
});

test('emitted addCrag geometry stays cleanly contained in the rock tile union across lone, plus, T, L, edge, and cleared-corner shapes', () => {
  const shapes: { name: string; tiles: [number, number][] }[] = [
    { name: 'lone', tiles: [[0, 0]] },
    { name: 'plus', tiles: [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]] },
    { name: 'T-north', tiles: [[0, 0], [0, -1], [1, 0], [-1, 0]] },
    { name: 'T-south', tiles: [[0, 0], [0, 1], [1, 0], [-1, 0]] },
    { name: 'L-NE', tiles: [[0, 0], [0, -1], [1, 0]] },
    { name: 'L-SE', tiles: [[0, 0], [0, 1], [1, 0]] },
    { name: 'L-SW', tiles: [[0, 0], [0, 1], [-1, 0]] },
    { name: 'L-NW', tiles: [[0, 0], [0, -1], [-1, 0]] },
    { name: 'strip-E', tiles: [[0, 0], [1, 0], [2, 0]] },
    { name: 'strip-S', tiles: [[0, 0], [0, 1], [0, 2]] },
    { name: 'quad-2x2', tiles: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    // 3×3 cluster with one diagonal corner cleared (each corner in turn).
    { name: '3x3-no-NE', tiles: [[-1, -1], [0, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
    { name: '3x3-no-SE', tiles: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1]] },
    { name: '3x3-no-SW', tiles: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [0, 1], [1, 1]] },
    { name: '3x3-no-NW', tiles: [[0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
  ];

  // Test across multiple world coordinate offsets to exercise many deterministic RNG seeds, on both flat and sloped terrain.
  const sloped = groundOf((wx, wz) => 0.25 * Math.sin(wx * 0.15) + 0.2 * Math.cos(wz * 0.12));
  const offsets: [number, number][] = [[4, 4], [11, 7], [23, 19], [37, 5]];

  for (const look of ['soft', 'bold'] as const) {
    for (const shape of shapes) {
      for (const [ox, oy] of offsets) {
        const shifted: [number, number][] = shape.tiles.map(([tx, ty]) => [tx + ox, ty + oy]);
        const set = new Set(shifted.map(([tx, ty]) => `${tx},${ty}`));
        const isRock = (tx: number, ty: number) => set.has(`${tx},${ty}`);
        const pieces: PlannedRock[] = [];
        for (const [tx, ty] of shifted) pieces.push(...planOutcropTile(tx, ty, isRock, look));
        const g = buildCrags(pieces, sloped);
        const pos = g.getAttribute('position');
        let maxSpill = 0;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
          if (vy <= sloped.height(vx, vz)) continue;
          const d = distToRockUnion(vx, vz, shifted);
          if (d > maxSpill) maxSpill = d;
        }
        g.dispose();
        assert.ok(
          maxSpill <= 0.05,
          `${look} ${shape.name} @(${ox},${oy}) spilled ${maxSpill.toFixed(3)} m above ground into non-rock tile`,
        );
      }
    }
  }

  // Contiguous 3×3 cluster still bridges shared interior seams and bold remains taller than soft.
  const inCluster = (x: number, y: number) => x >= 0 && x <= 2 && y >= 0 && y <= 2;
  const softAll: PlannedRock[] = [], boldAll: PlannedRock[] = [];
  for (let y = 0; y <= 2; y++) for (let x = 0; x <= 2; x++) {
    softAll.push(...planOutcropTile(x, y, inCluster, 'soft'));
    boldAll.push(...planOutcropTile(x, y, inCluster, 'bold'));
  }
  const bridgeX = softAll.filter((p) => Math.abs(p.x - TILE) < 0.75).length;
  const bridgeZ = softAll.filter((p) => Math.abs(p.z - TILE) < 0.75).length;
  assert.ok(bridgeX >= 2 && bridgeZ >= 2, `cluster bridges seams (x=${bridgeX}, z=${bridgeZ})`);
  const meanH = (arr: typeof softAll) => arr.reduce((a, p) => a + p.ry, 0) / arr.length;
  assert.ok(meanH(boldAll) > meanH(softAll) * 1.25, `bold (${meanH(boldAll).toFixed(2)}) taller than soft (${meanH(softAll).toFixed(2)})`);
});

test('diagonal ridges align their Three.js rotated long axis along NW-SE for NW|SE masks and NE-SW for NE|SW masks', () => {
  // In Three.js, positive yaw rotates local +X to (cos(yaw), 0, -sin(yaw)).
  // NW-SE has dx*dz > 0; NE-SW has dx*dz < 0.
  for (const [name, isDiag, wantSign] of [
    ['NW|SE', (cx: number, cy: number) => (x: number, y: number) => (x === cx && y === cy) || (x === cx - 1 && y === cy - 1) || (x === cx + 1 && y === cy + 1), +1],
    ['NE|SW', (cx: number, cy: number) => (x: number, y: number) => (x === cx && y === cy) || (x === cx + 1 && y === cy - 1) || (x === cx - 1 && y === cy + 1), -1],
  ] as const) {
    let dirCorr = 0, meshCov = 0;
    const samples = 40;
    for (let i = 0; i < samples; i++) {
      const tx = 5 + i * 3, ty = 7 + (i % 7) * 2;
      // Add one cardinal neighbour so it enters the ridge-aligned branch (card === 1, best === 2 on the diagonal).
      const base = isDiag(tx, ty);
      const isRock = (x: number, y: number) => base(x, y) || (x === tx + 1 && y === ty);
      const primary = planOutcropTile(tx, ty, isRock, 'soft')[0];
      // Local +X rotated by yaw in Three.js is (cos(yaw), -sin(yaw)).
      const dx = Math.cos(primary.yaw), dz = -Math.sin(primary.yaw);
      dirCorr += dx * dz;

      // Also verify the actual emitted geometry's XZ covariance aligns with the same diagonal.
      const g = buildCrags([primary]);
      const pos = g.getAttribute('position');
      for (let v = 0; v < pos.count; v++) meshCov += (pos.getX(v) - primary.x) * (pos.getZ(v) - primary.z);
      g.dispose();
    }
    assert.ok(dirCorr * wantSign > 0, `${name} yaw correlation ${dirCorr.toFixed(2)} should have sign ${wantSign}`);
    assert.ok(meshCov * wantSign > 0, `${name} emitted XZ covariance ${meshCov.toFixed(2)} should have sign ${wantSign}`);
  }
});

test('addCrag geometry counts match IcosahedronGeometry (80 / 180 tris) and emitted rock budgets stay reasonable including near-country', () => {
  // Exact single-mesh counts for detail 1 and detail 2.
  for (const [detail, wantVerts, wantTris] of [[1, 42, 80], [2, 92, 180]] as const) {
    const b = new MeshBuilder('paint');
    addCrag(b, FLAT_GROUND, 0, 0, { rx: 1, ry: 1, rz: 1, detail }, rng(1));
    const g = b.build();
    assert.equal(g.getAttribute('position').count, wantVerts, `detail ${detail} vertices`);
    assert.equal(g.getIndex()!.count / 3, wantTris, `detail ${detail} triangles`);
    g.dispose();
  }

  const emitTris = (tiles: [number, number][], isRock: (x: number, y: number) => boolean, look: RocksLook) => {
    const b = new MeshBuilder('paint');
    for (const [x, y] of tiles) {
      if (look === 'off') {
        const r = rng(Math.floor(((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1 + 1) % 1 * 1e9));
        addStone(b, FLAT_GROUND, (x + 0.5) * TILE, (y + 0.5) * TILE, 1.1 + r() * 0.4, 0.3, r);
        if (r() < 0.6) addStone(b, FLAT_GROUND, (x + 0.5) * TILE, (y + 0.5) * TILE, 0.5 + r() * 0.3, 0.3, r);
      } else {
        for (const p of planOutcropTile(x, y, isRock, look)) {
          addCrag(b, FLAT_GROUND, p.x, p.z, {
            rx: p.rx, ry: p.ry, rz: p.rz, yaw: p.yaw, pitch: p.pitch, roll: p.roll,
            sink: p.sink, crag: p.crag, moss: p.moss, detail: p.detail,
          }, rng(p.seed));
        }
      }
    }
    const g = b.build();
    const tris = g.getIndex() ? g.getIndex()!.count / 3 : 0;
    g.dispose();
    return tris;
  };

  for (const id of ['c3', 'c4', 'c7', 'c8']) {
    const sc = CAMPAIGN.find((c) => c.id === id)!;
    const land = generateLand(sc, 8);
    const M = land.margin;
    const mapRock = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < sc.width && y < sc.height && land.terrain[(y + M) * land.width + x + M] === TERRAIN.rock;
    const mapTiles: [number, number][] = [];
    for (let y = 0; y < sc.height; y++) for (let x = 0; x < sc.width; x++) if (mapRock(x, y)) mapTiles.push([x, y]);

    const softTris = emitTris(mapTiles, mapRock, 'soft');
    const boldTris = emitTris(mapTiles, mapRock, 'bold');
    // Real emitted triangle counts per rock tile stay well below 420 tris/tile (baseline addStone is ~288 tris/tile).
    assert.ok(softTris / mapTiles.length < 420, `${id} soft avg tris/tile = ${(softTris / mapTiles.length).toFixed(1)}`);
    assert.ok(boldTris / mapTiles.length < 420, `${id} bold avg tris/tile = ${(boldTris / mapTiles.length).toFixed(1)}`);

    if (id === 'c3') {
      const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - sc.width), Math.max(0, -y, y - sc.height));
      const countryRock = (x: number, y: number) => {
        if (x >= 0 && y >= 0 && x < sc.width && y < sc.height) return false;
        const lx = x + M, ly = y + M;
        return lx >= 0 && ly >= 0 && lx < land.width && ly < land.height && beyond(x + 0.5, y + 0.5) <= 8
          && land.terrain[ly * land.width + lx] === TERRAIN.rock;
      };
      const countryTiles: [number, number][] = [];
      for (let y = -M; y < sc.height + M; y++) for (let x = -M; x < sc.width + M; x++) {
        if (countryRock(x, y)) countryTiles.push([x, y]);
      }
      const countrySoft = emitTris(countryTiles, countryRock, 'soft');
      const countryBold = emitTris(countryTiles, countryRock, 'bold');
      assert.ok(countryTiles.length > 0, 'c3 has near-country rocks');
      assert.ok(countrySoft / countryTiles.length < 420, `c3 near-country soft avg tris/tile = ${(countrySoft / countryTiles.length).toFixed(1)}`);
      assert.ok(countryBold / countryTiles.length < 420, `c3 near-country bold avg tris/tile = ${(countryBold / countryTiles.length).toFixed(1)}`);
    }
  }
});

test('plantTile keeps rock picks on the rock tile next to a tree while preserving overhanging tree-crown picking', () => {
  const s = newGame(CAMPAIGN[0]);
  const w = s.map.width;
  // Clear a clean patch around (5, 5) so only our test rock, tree, and field are there.
  for (let y = 3; y <= 7; y++) for (let x = 3; x <= 7; x++) s.map.terrain[y * w + x] = TERRAIN.grass;
  s.buildings = s.buildings.filter((b) => b.x < 2 || b.x > 8 || b.y < 2 || b.y > 8);
  s.map.terrain[5 * w + 5] = TERRAIN.rock;
  s.map.terrain[5 * w + 6] = TERRAIN.tree;

  // Direct hit on rock geometry inside the rock tile (even right near the border with the neighbour tree) picks the rock.
  assert.deepEqual(plantTile(s, { x: 5.5 * TILE, y: 0.9, z: 5.5 * TILE }, FLAT, 'bold', TOPS), { x: 5, y: 5 });

  // A low overhanging tree crown above the rock's local height (including a 3.98 m birch crown over a tall bold rock)
  // resolves to the adjacent tree rather than the rock.
  assert.deepEqual(plantTile(s, { x: 5.85 * TILE, y: 3.98, z: 5.5 * TILE }, FLAT, 'bold', TOPS), { x: 6, y: 5 });
  assert.deepEqual(plantTile(s, { x: 5.85 * TILE, y: 5.2, z: 5.5 * TILE }, FLAT, 'bold', TOPS), { x: 6, y: 5 });

  // Verify the exact Windy Ridge (40, 22) birch crown at 3.98 m over rock (41, 22) picks the tree.
  const c3 = newGame(CAMPAIGN.find((c) => c.id === 'c3')!);
  assert.deepEqual(plantTile(c3, { x: 41.25 * TILE, y: 3.98, z: 22.5 * TILE }, FLAT, 'bold', TOPS), { x: 40, y: 22 });

  // A tree crown overhanging empty grass within CROWN_REACH still resolves to the tree.
  assert.deepEqual(plantTile(s, { x: 6.5 * TILE, y: 4.5, z: 4.8 * TILE }, FLAT, 'bold', TOPS), { x: 6, y: 5 });

  // A crop/building on grass next to a rock is never stolen by the rock.
  s.buildings.push({ id: 999, type: 'field', x: 4, y: 4, rot: 0, crop: 'wheat', growth: 0.5, stored: 0, status: 'idle', need: null } as never);
  assert.equal(plantTile(s, { x: 5.5 * TILE, y: 0.4, z: 4.97 * TILE }, FLAT, 'bold', TOPS), null);
});

test('plantTile measures a crag\'s top from the ground under it, not under the hit, on a slope', () => {
  const s = newGame(CAMPAIGN[0]);
  const w = s.map.width;
  for (let y = 3; y <= 7; y++) for (let x = 3; x <= 7; x++) s.map.terrain[y * w + x] = TERRAIN.grass;
  s.buildings = s.buildings.filter((b) => b.x < 2 || b.x > 8 || b.y < 2 || b.y > 8);
  s.map.terrain[5 * w + 5] = TERRAIN.rock;
  s.map.terrain[6 * w + 5] = TERRAIN.tree;
  const lone = (x: number, y: number) => x === 5 && y === 5;
  const main = planOutcropTile(5, 5, lone, 'bold')[0];
  // The land falls steeply away to the south, towards the tree, from the crag's centre.
  const slope = (_x: number, z: number) => -(z - main.z) * 0.8;
  const g = buildCrags([main], groundOf(slope)), pos = g.getAttribute('position');
  let checked = 0, highest = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i), vy = pos.getY(i) - 0.02, vz = pos.getZ(i);
    highest = Math.max(highest, vy);
    // Points on its downhill side, in the crown's reach, a metre or more lower ground under them than under its centre.
    if (Math.floor(vx / TILE) !== 5 || Math.floor(vz / TILE) !== 5 || Math.hypot(vx / TILE - 5.5, vz / TILE - 6.5) >= 0.8) continue;
    if (vy < 0.5 || slope(vx, vz) > -1) continue;
    assert.deepEqual(plantTile(s, { x: vx, y: vy, z: vz }, slope, 'bold', TOPS), { x: 5, y: 5 });
    checked++;
  }
  g.dispose();
  assert.ok(checked > 0, 'points on the downhill face, in the crown\'s reach');
  // And a hit over the crag's top, in the crown's reach, is the crown's.
  assert.deepEqual(plantTile(s, { x: main.x, y: highest + 0.5, z: 5.95 * TILE }, slope, 'bold', TOPS), { x: 5, y: 6 });
});

test('plantTile: a crown over a crag\'s low shoulder is the tree\'s, every drawn point of the crag the rock\'s', () => {
  const s = newGame(CAMPAIGN[0]);
  const w = s.map.width;
  for (let y = 2; y <= 10; y++) for (let x = 2; x <= 10; x++) s.map.terrain[y * w + x] = TERRAIN.grass;
  s.buildings = s.buildings.filter((b) => b.x < 1 || b.x > 11 || b.y < 1 || b.y > 11);
  // A bold rock with a tree east of it: its emitted surface is about 1.45 m high at this point, a crown hit 0.7 m over it.
  s.map.terrain[5 * w + 5] = TERRAIN.rock;
  s.map.terrain[5 * w + 6] = TERRAIN.tree;
  assert.deepEqual(plantTile(s, { x: 22.81, y: 2.15, z: 21.77 }, FLAT, 'bold', TOPS), { x: 6, y: 5 });

  // A 3 × 3 patch of rock with a corner cut, ringed by trees, and a lone rock among trees: each vertex of the crags
  // drawn (just under the surface), whichever tile's crag it is, picks the rock tile it stands on, a crown in reach or not.
  for (let y = 2; y <= 10; y++) for (let x = 2; x <= 10; x++) s.map.terrain[y * w + x] = TERRAIN.tree;
  for (let y = 4; y <= 6; y++) for (let x = 4; x <= 6; x++) s.map.terrain[y * w + x] = TERRAIN.rock;
  s.map.terrain[4 * w + 6] = TERRAIN.tree;
  s.map.terrain[9 * w + 9] = TERRAIN.rock;
  const isRock = (x: number, y: number) => x >= 0 && y >= 0 && x < w && s.map.terrain[y * w + x] === TERRAIN.rock;
  for (const look of ['soft', 'bold'] as const) {
    let checked = 0;
    for (let y = 2; y <= 10; y++) for (let x = 2; x <= 10; x++) {
      if (!isRock(x, y)) continue;
      const g = buildCrags(planOutcropTile(x, y, isRock, look));
      const pos = g.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i) - 0.02, vz = pos.getZ(i);
        const tx = Math.floor(vx / TILE), ty = Math.floor(vz / TILE);
        if (vy <= 0.05 || !isRock(tx, ty)) continue;
        assert.deepEqual(plantTile(s, { x: vx, y: vy, z: vz }, FLAT, look, TOPS), { x: tx, y: ty }, `${look} vertex at (${vx.toFixed(2)}, ${vy.toFixed(2)}, ${vz.toFixed(2)})`);
        checked++;
      }
      g.dispose();
    }
    assert.ok(checked > 500, `${look}: ${checked} vertices checked`);
  }
});
