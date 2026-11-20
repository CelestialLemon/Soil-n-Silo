import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLOWER_REACH } from '../brush3d/src/shared.ts';
import { must } from '../src/game/result.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { SEASON_IDS } from '../src/game/seasons.ts';
import { newGame } from '../src/game/state.ts';
import { flooded } from '../src/game/flood.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import {
  BLOOM_REACH, BUILDING_MARGIN, CLIFF_MARGIN, FIELD_MARGIN, FLOWER_PROFILE, FLOWER_SEASONS, FLOWER_TOP, flowersBloom,
  GRASS_TOP, grassAt, ROCK_MARGIN, tileHabitat, WATER_MARGIN, wetDistance,
} from '../src/world/brush/grassMask.ts';
import { COUNTRY, Lie } from '../src/world/ground.ts';
import { TILE } from '../src/world/brush/scale.ts';

// The meadow's wildflowers (#266): their drifts and seasons, how far a bloom reaches against the margins the grass's
// masks keep (the flowers grow where the grass may, grassMask.ts's tileHabitat and footprints), and the pick. How far a
// bloom reaches is brush3d's promise (`FLOWER_REACH`, from shared.ts), which brush3d/test/flower.test.ts holds it to.

test('the drifts: a band of the drift field, eased from none to full', () => {
  assert.ok(FLOWER_PROFILE.drift[0] < FLOWER_PROFILE.drift[1]);
  assert.ok(FLOWER_PROFILE.attempts > 0 && FLOWER_PROFILE.clump[0] >= 1);
});

test('by season: spring\'s drifts, summer\'s and autumn\'s sparse ones, none in winter', () => {
  const { spring, summer, autumn, winter } = FLOWER_SEASONS;
  assert.equal(spring.palette.length, 4, 'white, yellow, peach and sky blue');
  // Spring is when the meadow blooms; summer's over its drier grass is as sparse as autumn's (the developer, on #266).
  assert.ok(spring.density > summer.density && summer.density > 0);
  assert.equal(summer.density, autumn.density);
  assert.equal(summer.clump, autumn.clump);
  assert.ok(autumn.clump < spring.clump);
  assert.equal(winter.density, 0);
  // Autumn's colours are warm: more red than blue, each.
  for (const { hex } of autumn.palette) assert.ok(hex >> 16 > (hex & 0xff), hex.toString(16));
  assert.equal(flowersBloom('winter'), false);
  for (const season of SEASON_IDS) {
    if (season !== 'winter') assert.equal(flowersBloom(season), true, season);
    for (const { weight } of FLOWER_SEASONS[season].palette) assert.ok(weight > 0);
  }
});

test('a bloom the masks let stand never reaches a building, field, rock, water or cliff', () => {
  // The flowers take the grass's spots (its tile's inner bounds, its footprints with their margins), and a clump's every
  // bloom is checked against them, so a bloom's whole reach stays within the narrowest margin.
  const narrowest = Math.min(BUILDING_MARGIN, FIELD_MARGIN, ROCK_MARGIN, WATER_MARGIN, CLIFF_MARGIN);
  const p = FLOWER_PROFILE;
  assert.equal(BLOOM_REACH, FLOWER_REACH * (p.flower.size[0] + p.flower.size[1]));
  assert.ok(BLOOM_REACH < narrowest, `a bloom reaches ${BLOOM_REACH.toFixed(3)} m, past ${narrowest} m`);
  // And stands no higher than its top, which the pick reads.
  assert.ok(FLOWER_TOP >= p.flower.lift[0] + p.flower.lift[1] + BLOOM_REACH);
});

test('a pick low over open grass is the meadow\'s flowers too: every bloom stands under the grass\'s tips', () => {
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), { width: w } = s.map;
  const i = s.map.terrain.findIndex((t, k) => t === TERRAIN.grass && k % w > 4);
  const x = ((i % w) + 0.5) * TILE, z = (Math.floor(i / w) + 0.5) * TILE;
  assert.ok(FLOWER_TOP < GRASS_TOP, 'the blooms under the grass\'s tips');
  assert.equal(grassAt(s, x, z, FLOWER_TOP - 0.1), true, 'a bloom over open grass');
  assert.equal(grassAt(s, x, z, GRASS_TOP + 0.5), false, 'a crown over open grass');
});

test('a flood takes no plant away: a flooded grass tile still grows its grass and flowers', () => {
  // Each stays rooted on the ground under the water, and brush3d's water hides what's below its surface: the taller poke
  // out of the shallows, deep water covers them (the developer, on #266).
  const sc = must(scenarioById('c7'), 'c7');
  const s = newGame(sc), land = generateLand(sc, COUNTRY), lie = new Lie(s, land), wet = wetDistance(land);
  s.scenario.events = [{ kind: 'flood', strength: 'severe', start: s.time - 6 * 3600, length: 48 * 3600 }];
  const f = flooded(s), { width: w } = s.map;
  let grassy = 0, growing = 0;
  for (let i = 0; i < f.tiles.length; i++) {
    if (!f.tiles[i] || s.map.terrain[i] !== TERRAIN.grass) continue;
    grassy++;
    if (tileHabitat(s, land, lie.relief, wet, i % w, Math.floor(i / w), true)) growing++;
  }
  assert.ok(grassy > 100, `the flood covers ${grassy} grass tiles`);
  // As many as on the same tiles dry (the habitat never reads the flood).
  s.scenario.events = [];
  let dry = 0;
  for (let i = 0; i < f.tiles.length; i++) {
    if (f.tiles[i] && s.map.terrain[i] === TERRAIN.grass && tileHabitat(s, land, lie.relief, wet, i % w, Math.floor(i / w), true)) dry++;
  }
  assert.ok(growing > grassy / 2, `${growing} of ${grassy} flooded grass tiles grow plants`);
  assert.equal(growing, dry);
});
