import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clearSun, spellLaw, usualOf, usualSun, usualWarmth } from '../src/game/expected.ts';
import { SANDBOX } from '../src/game/scenarios.ts';
import { charactersOf, climateOf, SEASON_IDS, type Climate } from '../src/game/seasons.ts';
import { hourAt, sunAt, windAt } from '../src/game/sim/clock.ts';
import { calmAt, cloudAt, clearShare, precipAt } from '../src/game/sim/weather.ts';
import { warmthIn } from '../src/game/warmth.ts';

// The usual weather (expected.ts) against the long-run mean of the seeded curves it stands for.

const CLIMATES: Climate[] = SEASON_IDS.flatMap((season) => [null, ...charactersOf(season)].map((character) => climateOf(season, character)));
const nameOf = (c: Climate) => `${c.season} ${c.character ?? '-'}`;

/** Long-run means over many seeds at times spread through the days (no events). */
function means(climate: Climate) {
  const m = { cloud: 0, clear: 0, precip: 0, showers: 0, calm: 0, wind: 0, sun: 0, sunUsual: 0, warmth: 0, warmthUsual: 0, n: 0 };
  for (let seed = 1; seed <= 120; seed++) {
    const sc = { ...SANDBOX, climate, seed: seed * 7919, events: [] };
    for (let k = 0; k < 80; k++) {
      const t = (k * 7.37 + seed * 0.13) * 10, hour = hourAt(t), p = precipAt(sc, t);
      m.cloud += cloudAt(sc, t); m.clear += clearShare(sc, t); m.precip += p; m.showers += p > 0 ? 1 : 0; m.calm += 1 - 0.6 * calmAt(sc, t); m.wind += windAt(sc, t);
      m.sun += sunAt(sc, t); m.sunUsual += usualSun(climate, hour);
      m.warmth += warmthIn(sc, t); m.warmthUsual += usualWarmth(climate, hour); m.n++;
    }
  }
  for (const k of Object.keys(m) as (keyof typeof m)[]) if (k !== 'n') m[k] /= m.n;
  return m;
}

test('the usual weather matches the long-run mean of the seeded curves, in every season and character', () => {
  for (const c of CLIMATES) {
    const u = usualOf(c), m = means(c), name = nameOf(c);
    const near = (what: string, a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${name}: ${what} ${a.toFixed(3)} usual, ${b.toFixed(3)} seeded`);
    near('cloud', u.cloud, m.cloud, 0.012);
    near('sun left by cloud', u.clear, m.clear, 0.01);
    near('rain', u.precip, m.precip, 0.01);
    near('time it showers', u.showers, m.showers, 0.02);
    near('calm', u.calm, m.calm, 0.01);
    near('wind', u.wind, m.wind, 0.015);
    near('sun', m.sunUsual, m.sun, 0.01);
    // (Both warmths are without a drift's mean: it is zero.)
    near('warmth', m.warmthUsual, m.warmth, 0.2);
  }
});

test('a spell condition\'s law has the mean the spells give, and the sun\'s curve is the season\'s', () => {
  for (const share of [0, 0.1, 0.25, 0.5, 1]) {
    const law = spellLaw(share), total = law.reduce((a, b) => a + b, 0), mean = law.reduce((n, w, k) => n + w * k / (law.length - 1), 0);
    assert.ok(Math.abs(total - 1) < 1e-9, 'a law sums to one');
    assert.ok(Math.abs(mean - 0.675 * share) < 1e-3, `share ${share}: mean ${mean}`);
  }
  const c = climateOf('summer');
  assert.equal(clearSun(c, c.sun.rise), 0);
  assert.equal(clearSun(c, c.sun.set), 0);
  assert.ok(Math.abs(clearSun(c, (c.sun.rise + c.sun.set) / 2) - c.sun.strength) < 1e-9);
  assert.ok(Math.abs(usualSun(c, 13) - clearSun(c, 13) * usualOf(c).clear) < 1e-12);
});

test('a drier or wetter character moves the usual weather the way the season\'s numbers say', () => {
  const wet = usualOf(climateOf('spring', 'wet')), dry = usualOf(climateOf('spring', 'dry'));
  assert.ok(wet.showers > dry.showers && wet.precip > dry.precip && wet.cloud > dry.cloud);
  assert.ok(usualOf(climateOf('summer', 'dry')).calm < usualOf(climateOf('summer', 'wet')).calm, 'calm spells take more of a dry summer\'s wind');
});
