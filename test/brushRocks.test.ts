import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CRAG_BOUND, CRAG_TRIANGLES } from '../brush3d/src/shared.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { CAMPAIGN } from '../src/game/scenarios.ts';
import { newGame } from '../src/game/state.ts';
import { cragTops, plantTile, type CragMesh } from '../src/world/brush/pickTile.ts';
import { planOutcropTile, ROCK_BIT, rockFootprint, rockMask, rockTileKey, type PlannedRock } from '../src/world/brush/rockPlan.ts';
import { TILE } from '../src/world/brush/scale.ts';

// The rock outcrops' plan and picks (#257), with no three.js: brush3d promises how far a crag reaches past its size and
// what it costs (`CRAG_BOUND`, `CRAG_TRIANGLES`, from shared.ts; brush3d/test/crag.test.ts holds `addCrag` to them), and
// here the plan is held to that promise. The picks read the crags' drawn surface; here they read a stand-in's.

const FLAT = () => 0;

/**
 * A stand-in for the crag `addCrag` draws (it needs three.js): the ellipsoid of the piece's half-extents, turned as addCrag
 * turns it (Three.js's YXZ order) and sunk as deep, on flat ground, as the pick's reader builds a crag (rocks.ts). The
 * pick's rules are held to whatever surface they're given; the real crag stays inside brush3d's promise.
 */
function standIn(p: PlannedRock): CragMesh {
  const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw), cp = Math.cos(p.pitch), sp = Math.sin(p.pitch);
  const cr = Math.cos(p.roll), sr = Math.sin(p.roll);
  const m = [
    [cy * cr + sy * sp * sr, -cy * sr + sy * sp * cr, sy * cp],
    [cp * sr, cp * cr, -sp],
    [-sy * cr + cy * sp * sr, sy * sr + cy * sp * cr, cy * cp],
  ];
  const mid = [p.x, p.ry * (1 - 2 * p.sink), p.z], LON = 24, LAT = 12, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= LAT; i++) for (let j = 0; j < LON; j++) {
    const th = Math.PI * i / LAT, ph = 2 * Math.PI * j / LON;
    const v = [Math.sin(th) * Math.cos(ph) * p.rx, Math.cos(th) * p.ry, Math.sin(th) * Math.sin(ph) * p.rz];
    for (let k = 0; k < 3; k++) pos.push(mid[k] + m[k][0] * v[0] + m[k][1] * v[1] + m[k][2] * v[2]);
  }
  for (let i = 0; i < LAT; i++) for (let j = 0; j < LON; j++) {
    const a = i * LON + j, b = i * LON + (j + 1) % LON, c = a + LON, d = b + LON;
    idx.push(a, c, b, b, c, d);
  }
  return { pos, idx };
}
const TOPS = cragTops(standIn);

/** The vertices of the stand-ins for `pieces`, as [x, y, z]. */
function verticesOf(pieces: readonly PlannedRock[]): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const p of pieces) {
    const { pos } = standIn(p);
    for (let i = 0; i < pos.length; i += 3) out.push([pos[i], pos[i + 1], pos[i + 2]]);
  }
  return out;
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

test('every crag\'s promised shadow (brush3d\'s CRAG_BOUND) stays in the rock tile union across lone, plus, T, L, edge, and cleared-corner shapes', () => {
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

  // The plan's footprint is the shadow of brush3d's promised ellipsoid: unturned, its half-extents swollen and flared.
  const fp = rockFootprint({ rx: 1.5, ry: 1, rz: 0.8, yaw: 0, pitch: 0, roll: 0, crag: 0.5 });
  const swell = CRAG_BOUND.swell + CRAG_BOUND.perCrag * 0.5;
  assert.ok(Math.abs(fp.fx - 1.5 * swell * CRAG_BOUND.skirt) < 1e-9 && Math.abs(fp.fz - 0.8 * swell * CRAG_BOUND.skirt) < 1e-9);

  // Many world offsets, for many deterministic seeds. The shadow brush3d promises a crag stays inside (rockFootprint) is the
  // same on any ground, so flat ground is enough: its edge, all round, stays on the rock.
  const offsets: [number, number][] = [[4, 4], [11, 7], [23, 19], [37, 5]];
  const RIM = 256;

  for (const shape of shapes) {
    for (const [ox, oy] of offsets) {
      const shifted: [number, number][] = shape.tiles.map(([tx, ty]) => [tx + ox, ty + oy]);
      const set = new Set(shifted.map(([tx, ty]) => `${tx},${ty}`));
      const isRock = (tx: number, ty: number) => set.has(`${tx},${ty}`);
      let maxSpill = 0;
      for (const [tx, ty] of shifted) for (const p of planOutcropTile(tx, ty, isRock)) {
        // The shadow's ellipse is L·(cos t, sin t), L the Cholesky factor of its matrix.
        const fp = rockFootprint(p), l00 = Math.sqrt(fp.qxx), l10 = fp.qxz / l00, l11 = Math.sqrt(Math.max(0, fp.qzz - l10 * l10));
        for (let k = 0; k < RIM; k++) {
          const c = Math.cos(2 * Math.PI * k / RIM), si = Math.sin(2 * Math.PI * k / RIM);
          maxSpill = Math.max(maxSpill, distToRockUnion(p.x + l00 * c, p.z + l10 * c + l11 * si, shifted));
        }
      }
      assert.ok(maxSpill <= 0.01, `${shape.name} @(${ox},${oy}): a crag's shadow spills ${maxSpill.toFixed(3)} m off the rock`);
    }
  }

  // A contiguous 3×3 cluster bridges its shared interior seams.
  const inCluster = (x: number, y: number) => x >= 0 && x <= 2 && y >= 0 && y <= 2;
  const all: PlannedRock[] = [];
  for (let y = 0; y <= 2; y++) for (let x = 0; x <= 2; x++) all.push(...planOutcropTile(x, y, inCluster));
  const bridgeX = all.filter((p) => Math.abs(p.x - TILE) < 0.75).length;
  const bridgeZ = all.filter((p) => Math.abs(p.z - TILE) < 0.75).length;
  assert.ok(bridgeX >= 2 && bridgeZ >= 2, `cluster bridges seams (x=${bridgeX}, z=${bridgeZ})`);
});

test('diagonal ridges align their long axis along NW-SE for NW|SE masks and NE-SW for NE|SW masks', () => {
  // In Three.js, positive yaw rotates local +X to (cos(yaw), 0, -sin(yaw)).
  // NW-SE has dx*dz > 0; NE-SW has dx*dz < 0.
  for (const [name, isDiag, wantSign] of [
    ['NW|SE', (cx: number, cy: number) => (x: number, y: number) => (x === cx && y === cy) || (x === cx - 1 && y === cy - 1) || (x === cx + 1 && y === cy + 1), +1],
    ['NE|SW', (cx: number, cy: number) => (x: number, y: number) => (x === cx && y === cy) || (x === cx + 1 && y === cy - 1) || (x === cx - 1 && y === cy + 1), -1],
  ] as const) {
    let dirCorr = 0, shadowCov = 0;
    const samples = 40;
    for (let i = 0; i < samples; i++) {
      const tx = 5 + i * 3, ty = 7 + (i % 7) * 2;
      // Add one cardinal neighbour so it enters the ridge-aligned branch (card === 1, best === 2 on the diagonal).
      const base = isDiag(tx, ty);
      const isRock = (x: number, y: number) => base(x, y) || (x === tx + 1 && y === ty);
      const primary = planOutcropTile(tx, ty, isRock)[0];
      // Local +X rotated by yaw in Three.js is (cos(yaw), -sin(yaw)).
      const dx = Math.cos(primary.yaw), dz = -Math.sin(primary.yaw);
      dirCorr += dx * dz;

      // And the crag's shadow on the ground (its tilt too) leans along the same diagonal.
      shadowCov += rockFootprint(primary).qxz;
    }
    assert.ok(dirCorr * wantSign > 0, `${name} yaw correlation ${dirCorr.toFixed(2)} should have sign ${wantSign}`);
    assert.ok(shadowCov * wantSign > 0, `${name} shadow XZ covariance ${shadowCov.toFixed(2)} should have sign ${wantSign}`);
  }
});

test('the crags\' triangles (brush3d\'s CRAG_TRIANGLES) stay within budget per rock tile, near country included', () => {
  const tris = (tiles: [number, number][], isRock: (x: number, y: number) => boolean) => {
    let n = 0;
    for (const [x, y] of tiles) for (const p of planOutcropTile(x, y, isRock)) n += CRAG_TRIANGLES[p.detail];
    return n;
  };

  for (const id of ['c3', 'c4', 'c7', 'c8']) {
    const sc = CAMPAIGN.find((c) => c.id === id)!;
    const land = generateLand(sc, 8);
    const M = land.margin;
    const mapRock = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < sc.width && y < sc.height && land.terrain[(y + M) * land.width + x + M] === TERRAIN.rock;
    const mapTiles: [number, number][] = [];
    for (let y = 0; y < sc.height; y++) for (let x = 0; x < sc.width; x++) if (mapRock(x, y)) mapTiles.push([x, y]);

    // Well below 420 triangles a rock tile on average (the old round stones, addStone, were about 288).
    const perTile = tris(mapTiles, mapRock) / mapTiles.length;
    assert.ok(perTile < 420, `${id} avg tris/tile = ${perTile.toFixed(1)}`);

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
      assert.ok(countryTiles.length > 0, 'c3 has near-country rocks');
      const perTile = tris(countryTiles, countryRock) / countryTiles.length;
      assert.ok(perTile < 420, `c3 near-country avg tris/tile = ${perTile.toFixed(1)}`);
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
  assert.deepEqual(plantTile(s, { x: 5.5 * TILE, y: 0.9, z: 5.5 * TILE }, FLAT, TOPS), { x: 5, y: 5 });

  // A low overhanging tree crown above the rock's local height resolves to the adjacent tree rather than the rock.
  assert.deepEqual(plantTile(s, { x: 5.85 * TILE, y: 3.98, z: 5.5 * TILE }, FLAT, TOPS), { x: 6, y: 5 });
  assert.deepEqual(plantTile(s, { x: 5.85 * TILE, y: 5.2, z: 5.5 * TILE }, FLAT, TOPS), { x: 6, y: 5 });

  // A tree crown overhanging empty grass within CROWN_REACH still resolves to the tree.
  assert.deepEqual(plantTile(s, { x: 6.5 * TILE, y: 4.5, z: 4.8 * TILE }, FLAT, TOPS), { x: 6, y: 5 });

  // A crop/building on grass next to a rock is never stolen by the rock.
  s.buildings.push({ id: 999, type: 'field', x: 4, y: 4, rot: 0, crop: 'wheat', growth: 0.5, stored: 0, status: 'idle', need: null } as never);
  assert.equal(plantTile(s, { x: 5.5 * TILE, y: 0.4, z: 4.97 * TILE }, FLAT, TOPS), null);
});

test('plantTile measures a crag\'s top from the ground under it, not under the hit, on a slope', () => {
  const s = newGame(CAMPAIGN[0]);
  const w = s.map.width;
  for (let y = 3; y <= 7; y++) for (let x = 3; x <= 7; x++) s.map.terrain[y * w + x] = TERRAIN.grass;
  s.buildings = s.buildings.filter((b) => b.x < 2 || b.x > 8 || b.y < 2 || b.y > 8);
  s.map.terrain[5 * w + 5] = TERRAIN.rock;
  s.map.terrain[6 * w + 5] = TERRAIN.tree;
  const lone = (x: number, y: number) => x === 5 && y === 5;
  const main = planOutcropTile(5, 5, lone)[0];
  // The land falls steeply away to the south, towards the tree, from the crag's centre.
  const slope = (_x: number, z: number) => -(z - main.z) * 0.8;
  // The crag on the slope stands as on flat ground (the ground under its centre is 0): only its buried skirt changes.
  let checked = 0, highest = -Infinity;
  for (const [vx, y, vz] of verticesOf([main])) {
    const vy = y - 0.02;
    highest = Math.max(highest, vy);
    // Points on its downhill side, in the crown's reach, a metre or more lower ground under them than under its centre.
    if (Math.floor(vx / TILE) !== 5 || Math.floor(vz / TILE) !== 5 || Math.hypot(vx / TILE - 5.5, vz / TILE - 6.5) >= 0.8) continue;
    if (vy < 0.5 || slope(vx, vz) > -1) continue;
    assert.deepEqual(plantTile(s, { x: vx, y: vy, z: vz }, slope, TOPS), { x: 5, y: 5 });
    checked++;
  }
  assert.ok(checked > 0, 'points on the downhill face, in the crown\'s reach');
  // And a hit over the crag's top, in the crown's reach, is the crown's.
  assert.deepEqual(plantTile(s, { x: main.x, y: highest + 0.5, z: 5.95 * TILE }, slope, TOPS), { x: 5, y: 6 });
});

test('plantTile: a crown over a crag\'s low shoulder is the tree\'s, every point of the crag\'s surface the rock\'s', () => {
  const s = newGame(CAMPAIGN[0]);
  const w = s.map.width;
  for (let y = 2; y <= 10; y++) for (let x = 2; x <= 10; x++) s.map.terrain[y * w + x] = TERRAIN.grass;
  s.buildings = s.buildings.filter((b) => b.x < 1 || b.x > 11 || b.y < 1 || b.y > 11);
  // A rock with a tree east of it: along its shoulder, in the crown's reach, a hit just over the crag's surface (as
  // the pick reads it: 0.3 m round the point, with 0.2 m of slack) is the crown's, a hit on it the rock's.
  s.map.terrain[5 * w + 5] = TERRAIN.rock;
  s.map.terrain[5 * w + 6] = TERRAIN.tree;
  const pieces = planOutcropTile(5, 5, (x, y) => x === 5 && y === 5);
  const surface = (x: number, z: number) => {
    let high: number | null = null;
    for (const p of pieces) {
      const y = TOPS(p, x, z);
      if (y !== null && (high === null || y > high)) high = y;
    }
    return high;
  };
  let shoulders = 0;
  for (let x = 22.85; x < 23.95; x += 0.1) for (const z of [21.5, 22, 22.5]) {
    const here = surface(x, z);
    if (here === null || here < 0.5) continue;
    const round = Math.max(...[[0, 0], [0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]].map(([dx, dz]) => surface(x + dx, z + dz) ?? 0));
    assert.deepEqual(plantTile(s, { x, y: round + 0.3, z }, FLAT, TOPS), { x: 6, y: 5 }, `over the shoulder at (${x.toFixed(2)}, ${z})`);
    assert.deepEqual(plantTile(s, { x, y: here - 0.02, z }, FLAT, TOPS), { x: 5, y: 5 }, `on the shoulder at (${x.toFixed(2)}, ${z})`);
    shoulders++;
  }
  assert.ok(shoulders > 5, `${shoulders} points on the shoulder checked`);

  // A 3 × 3 patch of rock with a corner cut, ringed by trees, and a lone rock among trees: each vertex of the crags
  // drawn (just under the surface), whichever tile's crag it is, picks the rock tile it stands on, a crown in reach or not.
  for (let y = 2; y <= 10; y++) for (let x = 2; x <= 10; x++) s.map.terrain[y * w + x] = TERRAIN.tree;
  for (let y = 4; y <= 6; y++) for (let x = 4; x <= 6; x++) s.map.terrain[y * w + x] = TERRAIN.rock;
  s.map.terrain[4 * w + 6] = TERRAIN.tree;
  s.map.terrain[9 * w + 9] = TERRAIN.rock;
  const isRock = (x: number, y: number) => x >= 0 && y >= 0 && x < w && s.map.terrain[y * w + x] === TERRAIN.rock;
  let checked = 0;
  for (let y = 2; y <= 10; y++) for (let x = 2; x <= 10; x++) {
    if (!isRock(x, y)) continue;
    for (const [vx, y0, vz] of verticesOf(planOutcropTile(x, y, isRock))) {
      const vy = y0 - 0.02;
      const tx = Math.floor(vx / TILE), ty = Math.floor(vz / TILE);
      if (vy <= 0.05 || !isRock(tx, ty)) continue;
      assert.deepEqual(plantTile(s, { x: vx, y: vy, z: vz }, FLAT, TOPS), { x: tx, y: ty }, `vertex at (${vx.toFixed(2)}, ${vy.toFixed(2)}, ${vz.toFixed(2)})`);
      checked++;
    }
  }
  assert.ok(checked > 500, `${checked} vertices checked`);
});

test('cragTops: a crag turned in place (same seed and size) is read anew, not from the old one kept', () => {
  const isRock = (x: number, y: number) => x === 5 && y === 5;
  const [piece] = planOutcropTile(5, 5, isRock);
  const turned: PlannedRock = { ...piece, yaw: piece.yaw + Math.PI / 2 };
  let builds = 0;
  const tops = cragTops((p) => { builds++; return standIn(p); });
  const fresh = cragTops(standIn);
  let differs = 0;
  for (let dx = -1.5; dx <= 1.5; dx += 0.25) for (let dz = -1.5; dz <= 1.5; dz += 0.25) {
    const x = piece.x + dx, z = piece.z + dz;
    tops(piece, x, z);
    const a = tops(turned, x, z), b = fresh(turned, x, z);
    assert.equal(a, b);
    if (a !== tops(piece, x, z)) differs++;
  }
  assert.ok(differs > 0, 'the turn changes the surface somewhere');
  assert.equal(builds, 2, 'each crag built once, then kept');
});
