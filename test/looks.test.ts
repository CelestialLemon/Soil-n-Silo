import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { DAY_SECONDS } from '../src/game/data.ts';
import { endOf, timeOf, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { groundLooksAt, lightningIn, STORM_LEAD, stormAt, sunUnderAt } from '../src/game/looks.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';

// The weather's looks (#207): seeded, so the same time always brings the same; within their bounds; following the weather they
// are drawn from; and read by no rule.

const HOUR = DAY_SECONDS / 24;
const CALM = { cloud: 0, rain: 0, calm: 1 };
const event = (kind: EventKind, day: number, hour: number, hours: number, strength: Strength = 'ordinary'): WeatherEvent => ({ kind, strength, start: timeOf(day, hour), length: hours * HOUR });

/** A commission in `season` with `events` and no weather of its own (no showers, no cloud, still). */
function commission(season: Season, events: WeatherEvent[], seed = 7, over: Partial<Scenario['climate']> = {}): Scenario {
  return { ...SANDBOX, id: 'looks', seed, events, climate: { ...climateOf(season), conditions: CALM, ...over } };
}

const STORM = event('thunderstorm', 2, 12, 12);

test('a storm darkens before its rain and lifts before it stops; other weather is not a storm', () => {
  const sc = commission('summer', [STORM]);
  assert.equal(stormAt(sc, STORM.start - 2 * HOUR), 0);
  assert.ok(stormAt(sc, STORM.start - (STORM_LEAD / 2) * HOUR) > 0, 'dark before the rain');
  assert.ok(stormAt(sc, STORM.start + 6 * HOUR) > 0.9, 'stormy at its height');
  assert.ok(stormAt(sc, endOf(STORM) - (STORM_LEAD / 2) * HOUR) === 0, 'lifted before the rain stops');
  const soft = commission('spring', [event('softRain', 2, 12, 12)]);
  for (let t = 0; t < 4 * DAY_SECONDS; t += HOUR / 4) assert.equal(stormAt(soft, t), 0);
});

test('the gold light under the clouds: some dawns and dusks, within 0–1, the same each time', () => {
  const sc = commission('autumn', [STORM]);
  let gold = 0, edges = 0;
  for (let day = 1; day <= 40; day++) {
    for (const edge of [sc.climate.sun.rise, sc.climate.sun.set]) {
      edges++;
      if (sunUnderAt(sc, timeOf(day, edge)) > 0.9) gold++;
    }
  }
  assert.ok(gold > edges * 0.15 && gold < edges * 0.5, `${gold} of ${edges} dawns and dusks break gold`);
  for (let t = 0; t < 10 * DAY_SECONDS; t += 3) {
    const v = sunUnderAt(sc, t);
    assert.ok(v >= 0 && v <= 1);
    assert.equal(v, sunUnderAt(sc, t));
  }
  // At noon, with no storm, never.
  for (let day = 5; day <= 40; day++) assert.equal(sunUnderAt(sc, timeOf(day, 12)), 0);
});

test('lightning comes with a storm, is seeded, and the same however the time is cut up', () => {
  const sc = commission('summer', [STORM]);
  const whole = lightningIn(sc, 0, 5 * DAY_SECONDS, 40, 30);
  assert.ok(whole.strikes.length > 5, `${whole.strikes.length} strikes`);
  assert.ok(whole.flickers.length > 5, `${whole.flickers.length} flickers`);
  for (const b of whole.strikes) {
    assert.ok(b.time > STORM.start && b.time < endOf(STORM), 'strikes only while it lasts');
    assert.ok(b.x >= -6 && b.x <= 46 && b.y >= -6 && b.y <= 36 && b.strength >= 0.6 && b.strength <= 1 && Number.isInteger(b.seed) && b.seed > 0);
  }
  // Distant thunder comes before most storms, and lingers after them.
  const seeds = Array.from({ length: 20 }, (_, k) => lightningIn(commission('summer', [STORM], k + 1), 0, 5 * DAY_SECONDS, 40, 30).flickers);
  assert.ok(seeds.filter((f) => f.some((x) => x.time < STORM.start)).length >= 15, 'before');
  assert.ok(seeds.filter((f) => f.some((x) => x.time > endOf(STORM))).length >= 15, 'after');
  assert.deepEqual(lightningIn(sc, 0, 5 * DAY_SECONDS, 40, 30), whole);
  // Frame by frame, uneven frames: the same strikes and flickers.
  const pieces: ReturnType<typeof lightningIn> = { strikes: [], flickers: [] };
  for (let t = 0, k = 0; t < 5 * DAY_SECONDS; k++) {
    const next = Math.min(5 * DAY_SECONDS, t + 0.013 + (k % 7) * 0.031);
    const got = lightningIn(sc, t, next, 40, 30);
    pieces.strikes.push(...got.strikes); pieces.flickers.push(...got.flickers);
    t = next;
  }
  assert.deepEqual(pieces, whole);
  // A share kept: some of the same ones, fewer.
  const half = lightningIn(sc, 0, 5 * DAY_SECONDS, 40, 30, 0.5);
  assert.ok(half.strikes.length < whole.strikes.length && half.strikes.every((b) => whole.strikes.some((w) => w.time === b.time)));
  // No storm, no lightning; a soft rain brings none.
  assert.deepEqual(lightningIn(commission('spring', [event('softRain', 2, 12, 12)]), 0, 5 * DAY_SECONDS, 40, 30), { strikes: [], flickers: [] });
  // Another seed, other lightning.
  assert.notDeepEqual(lightningIn(commission('summer', [STORM], 8), 0, 5 * DAY_SECONDS, 40, 30), whole);
});

test('a clear, cold, still night brings frost, gone by a mild afternoon; a warm night none', () => {
  const cold = commission('spring', [], 7, { warmth: { low: -4, high: 9, drift: 0 } });
  assert.ok(groundLooksAt(cold, timeOf(3, 5.5)).frost > 0.3, 'white by dawn');
  assert.ok(groundLooksAt(cold, timeOf(3, 15)).frost < 0.05, 'melted by the afternoon');
  const warm = commission('summer', []);
  for (let h = 0; h < 24; h += 0.5) assert.equal(groundLooksAt(warm, timeOf(3, h)).frost, 0);
});

test('the land wets in rain and dries after; the river muddies in heavy rain and clears slowly', () => {
  const rain = event('softRain', 2, 8, 6), sc = commission('spring', [rain, event('thunderstorm', 4, 8, 10)]);
  assert.equal(groundLooksAt(sc, rain.start - HOUR).wet, 0);
  const soaked = groundLooksAt(sc, endOf(rain) - HOUR).wet;
  assert.ok(soaked > 0.5, `soaked ${soaked}`);
  const after = groundLooksAt(sc, endOf(rain) + 8 * HOUR).wet;
  assert.ok(after < soaked && after >= 0, 'drying');
  // A soft rain is not heavy: the river stays clear.
  assert.equal(groundLooksAt(sc, endOf(rain)).riverMud, 0);
  const storm = sc.events[1], height = groundLooksAt(sc, storm.start + 6 * HOUR).riverMud;
  assert.ok(height > 0.4, `muddy ${height}`);
  const later = groundLooksAt(sc, endOf(storm) + 6 * HOUR).riverMud;
  assert.ok(later > 0.1 && later < height, `clearing ${later}`);
});

test('every look stays within 0–1 through a year of commissions', () => {
  for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
    const sc: Scenario = { ...SANDBOX, id: 'looks', seed: 11, climate: climateOf(season), events: [event('thunderstorm', 2, 3, 14, 'severe'), event('gale', 3, 20, 10), event('tropicalStorm', 5, 1, 20, 'severe')] };
    for (let t = 0; t < 7 * DAY_SECONDS; t += 37) {
      const g = groundLooksAt(sc, t);
      for (const v of [g.frost, g.wet, g.riverMud, stormAt(sc, t), sunUnderAt(sc, t)]) assert.ok(v >= 0 && v <= 1, `${season} ${t}: ${v}`);
    }
  }
});

test('no rule reads the looks: nothing in the game imports looks.ts', () => {
  const files: string[] = [];
  const walk = (dir: string) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.ts')) files.push(p); } };
  walk('src/game');
  assert.ok(files.length > 20);
  for (const f of files) if (!f.endsWith('looks.ts')) assert.doesNotMatch(readFileSync(f, 'utf8'), /from '[./]*\/looks\.ts'/, f);
});
