import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lookAt } from 'pixel3d-renderer';
import { SEASON_IDS } from '../src/game/seasons.ts';
import { fallIntensity, greyLook } from '../src/world/greyLook.ts';
import { GROUND } from '../src/game/ground.ts';
import { grassOf, mudOf } from '../src/world/ground.ts';
import { SOIL, soilOf } from '../src/world/shapes.ts';

test('a clear sky leaves the look as it is, and cloud and rain dim and grey it step by step', () => {
  const noon = lookAt(12);
  assert.equal(greyLook(noon, { cloud: 0, precip: 0 }), noon);
  const cloudy = greyLook(noon, { cloud: 0.6, precip: 0 }), grey = greyLook(noon, { cloud: 1, precip: 0 }), rain = greyLook(noon, { cloud: 1, precip: 1 });
  assert.ok(noon.sunI > cloudy.sunI && cloudy.sunI > grey.sunI && grey.sunI > rain.sunI);
  assert.ok(noon.chroma > cloudy.chroma && cloudy.chroma > grey.chroma && grey.chroma > rain.chroma);
  assert.ok(grey.skyTop.r >= 0 && rain.skyTop.getHex() !== noon.skyTop.getHex());
});

test('each season has its own grass, from lush to dry', () => {
  const seen = new Set<number>();
  for (const s of SEASON_IDS) {
    assert.notEqual(grassOf(s, 0), grassOf(s, 1), s);
    for (const dry of [0, 0.5, 1]) { const c = grassOf(s, dry); assert.ok(!seen.has(c), `${s} ${dry}`); seen.add(c); }
  }
});

test('everyday precipitation falls light to moderate, and nothing falls without it', () => {
  assert.equal(fallIntensity(0), 0);
  assert.ok(fallIntensity(0.12) >= 0.15 && fallIntensity(0.12) < fallIntensity(1));
  assert.ok(fallIntensity(1) <= 0.5);
});

const rgb = (hex: number) => [hex >> 16 & 255, hex >> 8 & 255, hex & 255];
const light = (hex: number) => { const [r, g, b] = rgb(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const apart = (a: number, b: number) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));

test('each ground has its own turf in every season, loam as the baseline, and the season still leads', () => {
  for (const season of SEASON_IDS) for (const dry of [0, 0.5, 1]) {
    const loam = grassOf(season, dry), kinds = [GROUND.loam, GROUND.silt, GROUND.clay, GROUND.sand, GROUND.stony].map((k) => grassOf(season, dry, false, k));
    assert.equal(kinds[0], loam);
    assert.equal(new Set(kinds).size, 5, `${season} ${dry}`);
    assert.ok(light(kinds[1]) < light(loam), 'silt is dark');
    assert.ok(light(kinds[3]) > light(loam), 'sand is pale');
    assert.ok(rgb(kinds[2])[0] - rgb(kinds[2])[1] > rgb(loam)[0] - rgb(loam)[1], 'clay is redder');
    // The ground only tints: it moves a colour by less than the season's turf spans from lush to dry (about 70), and winter's pale turf stays paler than summer's.
    for (const k of kinds.slice(1)) assert.ok(apart(k, loam) < 45, `${season} ${dry}`);
  }
});

test('winter turf on any ground is paler than summer turf on any other', () => {
  const grounds = [GROUND.loam, GROUND.silt, GROUND.clay, GROUND.sand, GROUND.stony];
  for (const w of grounds) for (const m of grounds) assert.ok(light(grassOf('winter', 0.5, false, w)) > light(grassOf('summer', 0.5, false, m)), `${w} ${m}`);
});

test('a field\'s soil takes its ground\'s tint, band by band', () => {
  for (let band = 0; band < SOIL.length; band++) {
    assert.equal(soilOf(band, GROUND.loam), SOIL[band]);
    assert.equal(new Set([0, 1, 2, 3, 4].map((k) => soilOf(band, k))).size, 5, `band ${band}`);
  }
});

test('wet clay is darker than dry clay, in every season', () => {
  for (const season of SEASON_IDS) for (const dry of [0, 0.5, 1]) {
    const clay = grassOf(season, dry, false, GROUND.clay);
    assert.ok(light(mudOf(clay)) < light(clay), `${season} ${dry}`);
  }
});
