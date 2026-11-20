import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLOWER_REACH } from '../brush3d/src/shared.ts';
import { must } from '../src/game/result.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { SEASON_IDS } from '../src/game/seasons.ts';
import { newGame } from '../src/game/state.ts';
import { TERRAIN } from '../src/game/map.ts';
import {
  BUILDING_MARGIN, CLIFF_MARGIN, FIELD_MARGIN, FLOWER_MODES, FLOWER_PROFILES, FLOWER_SEASONS, flowerReach, flowersBloom,
  flowerTop, GRASS_TOP, grassAt, ROCK_MARGIN, WATER_MARGIN,
} from '../src/world/brush/grassMask.ts';
import { TILE } from '../src/world/brush/scale.ts';

// The meadow's wildflowers (#266): their densities and seasons, how far a bloom reaches against the margins the grass's
// masks keep (the flowers grow where the grass may, grassMask.ts's tileHabitat and footprints), and the pick. How far a
// bloom reaches is brush3d's promise (`FLOWER_REACH`, from shared.ts), which brush3d/test/flower.test.ts holds it to.

const DENSITIES = ['subtle', 'meadow', 'lush'] as const;

test('the densities go subtle < meadow < lush, and the options are off, subtle, meadow and lush', () => {
  assert.deepEqual([...FLOWER_MODES], ['off', 'subtle', 'meadow', 'lush']);
  for (const [a, b] of [['subtle', 'meadow'], ['meadow', 'lush']] as const) {
    const p = FLOWER_PROFILES[a], q = FLOWER_PROFILES[b];
    assert.ok(p.attempts < q.attempts, `${a} tries fewer spots than ${b}`);
    // A lower threshold on the drift field: more of the meadow in drifts.
    assert.ok(p.drift[0] > q.drift[0] && p.drift[1] > q.drift[1], `${a}'s drifts cover less than ${b}'s`);
    assert.ok(flowerTop(a) < flowerTop(b));
  }
  for (const m of DENSITIES) assert.ok(FLOWER_PROFILES[m].drift[0] < FLOWER_PROFILES[m].drift[1], m);
});

test('by season: spring\'s fresh blooms, summer\'s thicker drifts, autumn\'s sparse specks, none in winter', () => {
  const { spring, summer, autumn, winter } = FLOWER_SEASONS;
  assert.equal(spring.palette.length, 4, 'white, yellow, peach and sky blue');
  assert.ok(summer.density > spring.density && spring.density > autumn.density && autumn.density > 0);
  assert.ok(autumn.clump < spring.clump);
  assert.equal(winter.density, 0);
  // Autumn's colours are warm: more red than blue, each.
  for (const { hex } of autumn.palette) assert.ok(hex >> 16 > (hex & 0xff), hex.toString(16));
  for (const m of FLOWER_MODES) assert.equal(flowersBloom(m, 'winter'), false, m);
  for (const season of SEASON_IDS) {
    assert.equal(flowersBloom('off', season), false, season);
    if (season !== 'winter') for (const m of DENSITIES) assert.equal(flowersBloom(m, season), true, `${m} in ${season}`);
    for (const { weight } of FLOWER_SEASONS[season].palette) assert.ok(weight > 0);
  }
});

test('a bloom the masks let stand never reaches a building, field, rock, water or cliff', () => {
  // The flowers take the grass's spots (its tile's inner bounds, its footprints with their margins), and a clump's every
  // bloom is checked against them, so a bloom's whole reach stays within the narrowest margin.
  const narrowest = Math.min(BUILDING_MARGIN, FIELD_MARGIN, ROCK_MARGIN, WATER_MARGIN, CLIFF_MARGIN);
  for (const m of DENSITIES) {
    const p = FLOWER_PROFILES[m];
    assert.equal(flowerReach(p), FLOWER_REACH * (p.flower.size[0] + p.flower.size[1]));
    assert.ok(flowerReach(p) < narrowest, `${m}: a bloom reaches ${flowerReach(p).toFixed(3)} m, past ${narrowest} m`);
    // And stands no higher than its top, which the pick reads.
    assert.ok(flowerTop(m) >= p.flower.lift[0] + p.flower.lift[1] + flowerReach(p));
  }
});

test('a pick low over open grass is the meadow\'s flowers too: every bloom stands under the grass\'s tips', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), { width: w } = s.map;
  const i = s.map.terrain.findIndex((t, k) => t === TERRAIN.grass && k % w > 4);
  const x = ((i % w) + 0.5) * TILE, z = (Math.floor(i / w) + 0.5) * TILE;
  for (const m of DENSITIES) assert.ok(flowerTop(m) < GRASS_TOP, `${m}'s blooms under the grass's tips`);
  assert.equal(grassAt(s, x, z, flowerTop('lush') - 0.1), true, 'a bloom over open grass');
  assert.equal(grassAt(s, x, z, GRASS_TOP + 0.5), false, 'a crown over open grass');
});
