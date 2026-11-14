import assert from 'node:assert/strict';
import { test } from 'node:test';
import { WIND_TICK } from '../brush3d/src/shared.ts';
import { place } from '../src/game/build.ts';
import { DAY_SECONDS, TICK, type BuildingId } from '../src/game/data.ts';
import { PLAIN } from '../src/game/ground.ts';
import { gustOver, lightOver, shadeOver, stepOverhead, windGrid } from '../src/game/overhead.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf } from '../src/game/seasons.ts';
import { CLOUD_DIM, cloudAt } from '../src/game/sim/weather.ts';
import { sunAt, windAt } from '../src/game/sim/clock.ts';
import { makes, makesNow } from '../src/game/sim/energy.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type BuildingOf, type GameState } from '../src/game/state.ts';

// What passes over the valley (overhead.ts, #208 and #198): a turbine makes its power times the gust passing over it, a panel
// loses the cloud's share of its sun only under a cloud's shadow. Moment to moment they vary; over the days they make what the
// valley's sun and wind give, so the game's balance holds.

/** A flat, open valley in spring (some cloud, some wind), `size` tiles a side, with no weather events. */
function valley(size = 60): GameState {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('spring', null), id: 'test', sandbox: false, credits: 1_000_000, width: size, height: size, goals: [], par: 600, events: [],
    terrain: { ground: PLAIN, water: 'none', forest: 0, rock: 0, relief: 0 } };
  return newGame(sc);
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

/** Turbines and panels spread over the valley, each on its own, `n` a side. */
function spread(s: GameState, type: 'turbine' | 'solar', n: number, off: number) {
  const step = Math.floor((s.map.width - 8) / n), out = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) out.push(put(s, type, 4 + i * step + off, 4 + j * step + off));
  return out;
}

/** Runs the sky alone (the clock, the gusts and the clouds' drift), a tick at a time, calling `each` after every tick. */
function run(s: GameState, seconds: number, each: () => void) {
  for (let i = 0; i < Math.round(seconds / TICK); i++) { s.time += TICK; stepOverhead(s); each(); }
}

test('the rules and the wind tick together: one step of the game is one of the wind\'s', () => {
  assert.equal(WIND_TICK, TICK);
});

test('the wind\'s world covers the map and its margin, centred on the map, within the cells the wind can hold', () => {
  for (const [w, h] of [[44, 36], [64, 52], [30, 30]]) {
    const g = windGrid(w, h);
    assert.ok(g.nx <= 256 && g.nz <= 256);
    assert.equal(g.x0 + (g.nx * g.cell) / 2, (w * 4) / 2);
    assert.equal(g.z0 + (g.nz * g.cell) / 2, (h * 4) / 2);
    assert.ok(g.x0 <= -16 && g.z0 <= -16 && g.x0 + g.nx * g.cell >= w * 4 + 16, `${w}x${h} reaches past the map`);
  }
});

test('a turbine makes its power times the gust over it: it varies, and over the days it makes what the valley\'s wind gives', () => {
  const s = valley(), turbines = spread(s, 'turbine', 3, 0);
  let valleys = 0, here = 0, lo = Infinity, hi = 0;
  const differ = new Set<string>();
  run(s, 20 * DAY_SECONDS, () => {
    const sun = sunAt(s.scenario, s.time), wind = windAt(s.scenario, s.time);
    for (const b of turbines) {
      const a = makes(s, b, sun, wind), n = makesNow(s, b, sun, wind);
      valleys += a; here += n;
      if (a > 0) { lo = Math.min(lo, n / a); hi = Math.max(hi, n / a); }
    }
    if (s.wind.tick % 600 === 0) differ.add(turbines.map((b) => gustOver(s, b).toFixed(3)).join());
  });
  assert.ok(valleys > 0);
  assert.ok(Math.abs(here / valleys - 1) < 0.01, `over the days a turbine makes the valley's power (${(here / valleys).toFixed(4)})`);
  assert.ok(lo < 0.9 && hi > 1.1, `the gusts and lulls move it (${lo.toFixed(2)}..${hi.toFixed(2)})`);
  assert.ok([...differ].some((g) => new Set(g.split(',')).size > 1), 'turbines in different places feel different gusts');
});

test('a panel loses the cloud\'s share of its sun only under a cloud\'s shadow: over the days it makes what the valley\'s sun gives', () => {
  const s = valley(), panels = spread(s, 'solar', 3, 0);
  let valleys = 0, here = 0, shadedLess = 0, compared = 0;
  run(s, 20 * DAY_SECONDS, () => {
    const sun = sunAt(s.scenario, s.time), wind = windAt(s.scenario, s.time);
    for (const b of panels) { valleys += makes(s, b, sun, wind); here += makesNow(s, b, sun, wind); }
    if (sun > 0 && cloudAt(s.scenario, s.time) > 0.05 && s.wind.tick % 50 === 0) {
      const [a, b] = [...panels].sort((p, q) => shadeOver(s, p) - shadeOver(s, q)).filter((_, i, l) => i === 0 || i === l.length - 1);
      if (shadeOver(s, b) - shadeOver(s, a) > 0.2) { compared++; if (makesNow(s, b, sun, wind) < makesNow(s, a, sun, wind)) shadedLess++; }
    }
  });
  assert.ok(valleys > 0);
  assert.ok(Math.abs(here / valleys - 1) < 0.03, `over the days a panel makes the valley's power (${(here / valleys).toFixed(4)})`);
  assert.ok(compared > 20 && shadedLess === compared, `the panel in a cloud's shadow makes less than one in the sun (${shadedLess}/${compared})`);
});

test('in a clear sky a panel gets the valley\'s sun, and never more than the cloud took', () => {
  const s = valley(), [b] = spread(s, 'solar', 1, 0);
  run(s, 3 * DAY_SECONDS, () => {
    const cloud = cloudAt(s.scenario, s.time), light = lightOver(s, b);
    if (cloud === 0) assert.equal(light, 1);
    assert.ok(light <= 1 / (1 - CLOUD_DIM * cloud) + 1e-9 && light >= 0, `a gap gives at most the sun the cloud took (${light} at cover ${cloud})`);
  });
});

test('a save in the middle of a run plays on as the run does: the gusts, the clouds and the power the same', () => {
  const s = valley(40);
  put(s, 'pylon', 10, 10);
  put(s, 'battery', 11, 10);
  put(s, 'turbine', 13, 10);
  put(s, 'solar', 8, 12);
  put(s, 'solar', 12, 13);
  advance(s, 300);
  const back = deserialize(serialize(s));
  assert.ok(back.ok, back.ok ? '' : back.error);
  const t = back.value;
  for (let i = 0; i < 6; i++) { advance(s, 100.05); advance(t, 100.05); }
  assert.equal(serialize(t), serialize(s));
  assert.ok(s.clouds.x > 0 && s.clouds.z > 0, 'the clouds drift with the wind');
});

test('a save whose wind or clouds are broken is refused', () => {
  const s = valley(30);
  advance(s, 20);
  const breaks: ((o: GameState) => void)[] = [
    (o) => { o.wind.speed = -1; }, (o) => { o.wind.speed = 1e9; }, (o) => { o.wind.fade = 2; },
    (o) => { (o.wind as unknown as Record<string, unknown>).gusts = null; }, (o) => { o.wind.gusts.speed = 0; },
    (o) => { o.wind.tick = 1.5; }, (o) => { (o.clouds as unknown as Record<string, unknown>).x = 'x'; },
    (o) => { delete (o as Partial<GameState>).clouds; }, (o) => { delete (o as Partial<GameState>).wind; },
  ];
  assert.ok(deserialize(serialize(s)).ok);
  for (const [i, f] of breaks.entries()) {
    const o = JSON.parse(serialize(s)) as GameState;
    f(o);
    assert.ok(!deserialize(JSON.stringify(o)).ok, `break ${i} is refused`);
  }
});
