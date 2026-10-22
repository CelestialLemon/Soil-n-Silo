import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place } from '../src/game/build.ts';
import { CROPS, DAY_SECONDS } from '../src/game/data.ts';
import { waterPace } from '../src/game/rules.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf } from '../src/game/seasons.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type FieldBuilding, type GameState } from '../src/game/state.ts';
import { FROST, warmthAt, warmthPace } from '../src/game/warmth.ts';

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
