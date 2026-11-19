import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { CAMPAIGN } from '../src/game/scenarios.ts';
import { planOutcropTile, ROCK_BIT, rockMask, rockTileKey, type PlannedRock } from '../src/world/brush/rockPlan.ts';
import { TILE } from '../src/world/brush/scale.ts';

test('rockMask and rockTileKey detect neighbour clearing and shared-edge height changes across block borders', () => {
  const rocks = new Set(['7,3', '8,3', '7,4', '8,4']);
  const isRock = (x: number, y: number) => rocks.has(`${x},${y}`);
  const m0 = rockMask(isRock, 7, 3);
  assert.equal(m0, ROCK_BIT.E | ROCK_BIT.S | ROCK_BIT.SE);

  let edgeBump = 0;
  const height = (tx: number, ty: number) => (tx >= 8 && ty >= 3 ? edgeBump : 0);
  const k0 = rockTileKey(7, 3, m0, height);

  // Levelling the neighbour across the block boundary (x = 8) changes the shared-edge height key.
  edgeBump = 1;
  assert.notEqual(rockTileKey(7, 3, m0, height), k0);

  // Clearing the neighbour in the next block flips its mask bit and invalidates the key.
  rocks.delete('8,3');
  const mCleared = rockMask(isRock, 7, 3);
  assert.equal(mCleared & ROCK_BIT.E, 0);
  assert.notEqual(rockTileKey(7, 3, mCleared, () => 0), k0);
});

test('planOutcropTile keeps lone rocks cleanly inside their tile and bridges contiguous rock clusters across seams', () => {
  for (const look of ['soft', 'bold'] as const) {
    const pieces = planOutcropTile(5, 5, (x, y) => x === 5 && y === 5, look);
    assert.ok(pieces.length >= 2 && pieces.length <= 3, `${look} lone tile spawns 2-3 pieces, got ${pieces.length}`);
    for (const p of pieces) {
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.z) && p.rx > 0 && p.ry > 0 && p.rz > 0);
      const reach = Math.max(p.rx, p.rz) * 0.85;
      // Centres stay cleanly inside the tile [20, 24] so adjacent grass tiles stay buildable and picking stays accurate.
      assert.ok(p.x - reach >= 5 * TILE - 0.4 && p.x + reach <= 6 * TILE + 0.4, `${look} lone rock x=${p.x}±${reach}`);
      assert.ok(p.z - reach >= 5 * TILE - 0.4 && p.z + reach <= 6 * TILE + 0.4, `${look} lone rock z=${p.z}±${reach}`);
    }
  }

  // Contiguous 3×3 cluster: must place pieces straddling the shared interior tile boundaries (x = 4, z = 4).
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
  assert.ok(meanH(boldAll) > meanH(softAll) * 1.25, `bold (${meanH(boldAll).toFixed(2)}) should be taller than soft (${meanH(softAll).toFixed(2)})`);
});

test('planOutcropTile stays within triangle budget across all rocky campaign commissions', () => {
  for (const id of ['c3', 'c4', 'c7', 'c8']) {
    const sc = CAMPAIGN.find((c) => c.id === id)!;
    const land = generateLand(sc, 8);
    const M = land.margin;
    const isRock = (x: number, y: number) => {
      const lx = x + M, ly = y + M;
      return lx >= 0 && ly >= 0 && lx < land.width && ly < land.height && land.terrain[ly * land.width + lx] === TERRAIN.rock;
    };
    let tiles = 0, trisSoft = 0, trisBold = 0;
    for (let y = 0; y < sc.height; y++) for (let x = 0; x < sc.width; x++) {
      if (!isRock(x, y)) continue;
      tiles++;
      for (const p of planOutcropTile(x, y, isRock, 'soft')) trisSoft += p.detail === 2 ? 320 : 80;
      for (const p of planOutcropTile(x, y, isRock, 'bold')) trisBold += p.detail === 2 ? 320 : 80;
    }
    // Baseline average is 512 tris/tile (1.6 × 320); keep clustered outcrops at or below ~560 tris/tile.
    assert.ok(trisSoft / tiles < 560, `${id} soft avg tris/tile = ${(trisSoft / tiles).toFixed(1)}`);
    assert.ok(trisBold / tiles < 560, `${id} bold avg tris/tile = ${(trisBold / tiles).toFixed(1)}`);
  }
});
