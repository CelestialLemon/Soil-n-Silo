import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { CAMPAIGN } from '../src/game/scenarios.ts';
import { newGame, touchRelief } from '../src/game/state.ts';
import { BrushWater } from '../src/world/brush/water.ts';
import { SEND_GAP } from '../src/world/brush/grid.ts';
import { COUNTRY, Lie } from '../src/world/ground.ts';

// The water beside the river's falls (src/world/brush/water.ts, #202): the dry banks below a fall take the lower water's
// level, under their ground, so the water's sheet doesn't stand out over them; and only while the ground round them hides it.

test('a bank below a fall takes the water below, and lets it go when the ground beside it is dug lower', async () => {
  const sc = CAMPAIGN.find((c) => c.id === 'c6')!, s = newGame(sc), land = generateLand(sc, COUNTRY), lie = new Lie(s, land);
  // (Only the levels are read: brush3d's WaterMap type comes with its whole index, which Node's checks don't load.)
  const sent: { level: Float32Array }[] = [];
  const water = new BrushWater({ setWater: (m: { level: Float32Array }) => { sent.push(m); } } as never, land, lie);
  water.sync(s);
  assert.equal(sent.length, 1);
  const W = land.width, M = land.margin, first = sent[0].level;
  // A dry tile with a water level: a bank below a fall (commission 6 has two).
  const bank = first.findIndex((l, k) => !Number.isNaN(l) && land.terrain[k] !== TERRAIN.water);
  assert.ok(bank >= 0, 'commission 6 has a fall with a bank beside it');
  const bx = bank % W, by = (bank - bx) / W;
  // Dig a dry map tile beside it two levels under the water there.
  let dug = -1;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
    const k = (by + dy) * W + bx + dx, mx = bx + dx - M, my = by + dy - M;
    if (land.terrain[k] === TERRAIN.water || !Number.isNaN(first[k]) || mx < 0 || my < 0 || mx >= s.map.width || my >= s.map.height) continue;
    dug = my * s.map.width + mx;
    break;
  }
  assert.ok(dug >= 0);
  const low = Math.floor(first[bank]) - 2;
  s.map.corner.fill(low, dug * 4, dug * 4 + 4);
  touchRelief(s); lie.update();
  await new Promise((r) => setTimeout(r, SEND_GAP * 1000 + 50));
  water.sync(s);
  assert.equal(sent.length, 2, 'the water is sent again');
  assert.ok(Number.isNaN(sent[1].level[bank]), 'the bank lets the water below go');
});
