import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place } from '../src/game/build.ts';
import { CROPS, DAY_SECONDS } from '../src/game/data.ts';
import { waterPace } from '../src/game/rules.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf } from '../src/game/seasons.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type FieldBuilding, type GameState } from '../src/game/state.ts';
import { FROST, beesFly, henPace, warmthAt, warmthPace } from '../src/game/warmth.ts';

function flat(warmth: { low: number; high: number; drift: number }): GameState {
  const sc: Scenario = {
    ...SANDBOX, climate: { ...SANDBOX.climate, warmth }, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 },
  };
  return newGame(sc);
}

function field(s: GameState, x: number, y: number): FieldBuilding {
  const r = place(s, 'field', x, y, 0);
  if (!r.ok) assert.fail(r.error);
  return r.value.building;
}

test('warmth follows the day and the season: coldest before dawn, warmest mid-afternoon, frosts only in winter', () => {
  for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
    const sc = { ...SANDBOX, climate: climateOf(season) };
    const w = sc.climate.warmth, at = (h: number) => warmthAt(sc, (((h - 7 + 24) % 24) / 24) * DAY_SECONDS);
    const cold = at(sc.climate.sun.rise - 1), warm = at(15);
    assert.ok(Math.abs(cold - w.low) <= w.drift + 1e-9 && Math.abs(warm - w.high) <= w.drift + 1e-9, season);
    assert.ok(cold < warm, season);
  }
  assert.ok(climateOf('winter').warmth.low < FROST && climateOf('spring').warmth.low > FROST);
});

test('a crop grows at full speed in its comfortable range, slower outside it, and a tender one stops below 10°C', () => {
  assert.equal(warmthPace(CROPS.wheat, 17), 1);
  assert.equal(warmthPace(CROPS.tomato, 18), 1);
  assert.ok(Math.abs(warmthPace(CROPS.tomato, 12) - 0.5) < 1e-9);
  assert.equal(warmthPace(CROPS.tomato, 9), 0);
  assert.ok(warmthPace(CROPS.wheat, -3) > 0 && warmthPace(CROPS.wheat, -3) < 0.3);
  assert.ok(warmthPace(CROPS.wheat, 30) < warmthPace(CROPS.wheat, 26));
  assert.ok(waterPace(0, 1, 34) < waterPace(0, 1, 20));
  assert.ok(waterPace(0, CROPS.sunflower.thirst) > waterPace(0));
});

test('frost takes a tender crop growing in an open field, and leaves a hardy one and the stored harvest', () => {
  const s = flat({ low: -3, high: -3, drift: 0 });
  const t = field(s, 4, 4), w = field(s, 10, 4);
  t.crop = 'tomato'; w.crop = 'wheat';
  t.growth = 0.5; t.stored = 2; t.harvest = 'tomato'; w.growth = 0.5;
  advance(s, 1);
  assert.equal(t.growth, 0);
  assert.equal(t.status, 'frost');
  assert.equal(t.stored, 2);
  assert.ok(w.growth > 0.5);
});

test('hens lay at the season\'s rate and slow above 30°C; bees fly from 10°C', () => {
  const rate = (season: 'spring' | 'summer' | 'autumn' | 'winter', w: number) => henPace({ ...SANDBOX, climate: climateOf(season) }, w);
  assert.equal(rate('spring', 15), 1);
  assert.equal(rate('summer', 25), 1);
  assert.equal(rate('autumn', 15), 0.75);
  assert.equal(rate('winter', 0), 0.5);
  assert.ok(rate('summer', 36) < 0.6 && rate('summer', 36) > 0);
  assert.ok(!beesFly(9.9) && beesFly(10));
});

test('a cold hive makes no honey and pollinates nothing, and a coop in winter lays at half speed', () => {
  const cold = flat({ low: 5, high: 5, drift: 0 }), warm = flat({ low: 15, high: 15, drift: 0 });
  for (const s of [cold, warm]) {
    const f = field(s, 4, 4); f.crop = 'sunflower';
    const h = place(s, 'hive', 8, 4, 0);
    if (!h.ok) assert.fail(h.error);
    advance(s, 60);
    const hive = h.value.building;
    if (s === cold) { assert.equal(hive.type === 'hive' && hive.stored, 0); assert.equal(hive.status, 'cold'); } else { assert.ok(hive.type === 'hive' && hive.stored > 0); assert.equal(hive.status, 'ok'); }
  }
  const winter = flat({ low: 5, high: 5, drift: 0 }), spring = flat({ low: 5, high: 5, drift: 0 });
  winter.scenario = { ...winter.scenario, climate: { ...winter.scenario.climate, hens: { lay: 0.5 } } };
  const progress = (s: GameState) => {
    const c = place(s, 'coop', 4, 4, 0);
    if (!c.ok) assert.fail(c.error);
    const b = c.value.building;
    if (!('progress' in b)) assert.fail('coop is a machine');
    b.inputs = { wheat: 2, beans: 2 }; advance(s, 4);
    return b.progress ?? 0;
  };
  const w = progress(winter), p = progress(spring);
  assert.ok(w > 0 && Math.abs(p - 2 * w) < 0.5, `winter ${w}, spring ${p}`);
});
