import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateLand, generateMap, TERRAIN } from '../src/game/map.ts';
import { CAMPAIGN, randomScenario, SANDBOX, type Scenario } from '../src/game/scenarios.ts';

const SCENARIOS: Scenario[] = [...CAMPAIGN, SANDBOX, ...[1, 7, 78, 99].flatMap((s) => ([1, 2, 3] as const).map((d) => randomScenario(s, d)))];
const withWater = (water: Scenario['terrain']['water']) => SCENARIOS.filter((sc) => sc.terrain.water === water);

test('the land around a map holds the map unchanged at its centre', () => {
  for (const sc of SCENARIOS) {
    const m = generateMap(sc), M = 20, land = generateLand(sc, M);
    assert.equal(land.width, m.width + 2 * M);
    assert.equal(land.height, m.height + 2 * M);
    assert.deepEqual(land.depot, m.depot);
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
      const i = (y + M) * land.width + x + M;
      assert.equal(land.terrain[i], m.terrain[y * m.width + x], `${sc.id} terrain at ${x},${y}`);
      assert.equal(land.fertility[i], m.fertility[y * m.width + x], `${sc.id} fertility at ${x},${y}`);
    }
  }
});

test('a river runs one way along its course and drops over two falls; ponds lie still', () => {
  const rivers = withWater('river');
  assert.ok(rivers.length > 0);
  for (const sc of rivers) {
    const land = generateLand(sc, 10);
    let sum = [0, 0];
    const drops = new Set<number>();
    land.terrain.forEach((t, i) => {
      if (t !== TERRAIN.water) { assert.equal(land.flow[i * 2], 0); assert.equal(land.flow[i * 2 + 1], 0); return; }
      const vx = land.flow[i * 2], vz = land.flow[i * 2 + 1], speed = Math.hypot(vx, vz);
      assert.ok(speed > 0.5 && speed < 1.2, `${sc.id}: speed ${speed}`);
      sum = [sum[0] + vx, sum[1] + vz];
      drops.add(land.drop[i]);
      // Downstream (one tile along the current's main axis), the river is never higher.
      const x = i % land.width, y = Math.floor(i / land.width);
      const [dx, dy] = Math.abs(vx) > Math.abs(vz) ? [Math.sign(vx), 0] : [0, Math.sign(vz)];
      const j = (y + dy) * land.width + x + dx;
      if (x + dx >= 0 && x + dx < land.width && y + dy >= 0 && y + dy < land.height && land.terrain[j] === TERRAIN.water) {
        assert.ok(land.drop[j] >= land.drop[i], `${sc.id}: rises downstream at ${x},${y}`);
      }
    });
    assert.ok(Math.hypot(sum[0], sum[1]) > 0, `${sc.id}: the current goes somewhere`);
    assert.deepEqual([...drops].sort(), [0, 1, 2], `${sc.id}: levels`);
  }
  for (const sc of [...withWater('ponds'), ...withWater('lake')]) {
    const land = generateLand(sc, 10);
    assert.ok(land.flow.every((v) => v === 0) && land.drop.every((v) => v === 0), `${sc.id}: still water`);
  }
});
