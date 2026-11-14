import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkLand, LAND_COVER } from '../brush3d/src/shared.ts';
import { levelling } from '../src/game/build.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { CAMPAIGN, SANDBOX } from '../src/game/scenarios.ts';
import { newGame } from '../src/game/state.ts';
import { landMapOf, patchOf, tilesOf, waterSurface } from '../src/world/brush/landMap.ts';

// The game's land as brush3d's (src/world/brush/landMap.ts, #202): what the brush3d world sends to r.setLand and
// r.updateLand. How brush3d paints it is checked in brush3d/tools/land.ts.

const SCALE = { tile: 4, level: 1 }, MARGIN = 24;

for (const sc of [...CAMPAIGN, SANDBOX]) {
  test(`${sc.id}: the land sent is the map and the country round it, whole levels`, () => {
    const s = newGame(sc), land = generateLand(sc, MARGIN), map = landMapOf(s, land, SCALE), m = s.map;
    assert.doesNotThrow(() => checkLand(map));
    assert.deepEqual(map.map, { x: MARGIN, y: MARGIN, width: m.width, height: m.height });
    assert.equal(map.x0, -MARGIN * SCALE.tile);
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
      const t = (y + MARGIN) * map.width + x + MARGIN, i = y * m.width + x;
      for (let k = 0; k < 4; k++) assert.equal(map.corners[t * 4 + k], m.corner[i * 4 + k] * SCALE.level);
      // The water's tiles are drawn as water, and level.
      if (m.terrain[i] === TERRAIN.water) { assert.equal(map.cover[t], LAND_COVER.water); assert.equal(map.worked[t], 1); }
    }
    // The country's own corners off the map.
    assert.equal(map.corners[0], land.corner[0] * SCALE.level);
  });
}

test('the water stands under its tiles\' level, over the bed brush3d cuts under it', () => {
  // (Half a level down: the banks over it, the bed, 1.2 m deep at its deepest, under it.)
  assert.ok(waterSurface(3) < 3 && waterSurface(3) > 3 - 1.2 / SCALE.level);
});

test('an earthwork is sent as the tiles it changed, nothing when nothing did', () => {
  const sc = CAMPAIGN[0], s = newGame(sc), land = generateLand(sc, MARGIN), was = tilesOf(s, land, SCALE);
  assert.equal(patchOf(was, tilesOf(s, land, SCALE), land.width), null);
  const d = s.map.depot, area = { x: d.x + 5, y: d.y + 1, w: 3, h: 3 };
  const move = levelling(s, area, s.map.corner[(area.y * s.map.width + area.x) * 4] + 1);
  for (const [k, h] of move.set) s.map.corner[k] = h;
  const change = patchOf(was, tilesOf(s, land, SCALE), land.width);
  assert.ok(change);
  // Round the levelled tiles (levelling may move a neighbour's corner too), within a tile of them.
  const r = change.rect;
  assert.ok(r.x >= area.x + MARGIN - 1 && r.y >= area.y + MARGIN - 1 && r.x + r.width <= area.x + MARGIN + 4 && r.y + r.height <= area.y + MARGIN + 4, JSON.stringify(r));
  for (let j = 0; j < r.height; j++) for (let i = 0; i < r.width; i++) {
    const mi = (r.y + j - MARGIN) * s.map.width + r.x + i - MARGIN, k = j * r.width + i;
    for (let c = 0; c < 4; c++) assert.equal(change.patch.corners![k * 4 + c], s.map.corner[mi * 4 + c] * SCALE.level);
  }
});
