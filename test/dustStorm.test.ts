import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place, setCrop } from '../src/game/build.ts';
import { DAY_SECONDS } from '../src/game/data.ts';
import { blowDust, dustComes, dustFor, dustNote } from '../src/game/dust.ts';
import { DUST_HAZE, EVENTS, FOG_HAZE, lookAt, pushesAt, timeOf, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { placement } from '../src/game/forecast.ts';
import { holdLabel, readHold, truckHold } from '../src/game/hold.ts';
import { TERRAIN } from '../src/game/map.ts';
import { CAMPAIGN, SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Character, type Season } from '../src/game/seasons.ts';
import { sunAt } from '../src/game/sim/clock.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { fieldFertility } from '../src/game/sim/soil.ts';
import { advance } from '../src/game/sim/step.ts';
import { weatherAt } from '../src/game/sim/weather.ts';
import { newGame, tileIndex, touchLayout, type BuildingOf, type GameState } from '../src/game/state.ts';
import type { BuildingId } from '../src/game/data.ts';
import { PLAIN } from '../src/game/ground.ts';

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

/** A flat game in a season with the events given, set to `at`. */
function game(season: Season, events: WeatherEvent[], at: number, character: Character | null = 'dry'): GameState {
  const climate = { ...climateOf(season, character), conditions: NO_CONDITIONS };
  const sc: Scenario = { ...SANDBOX, climate, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events,
    terrain: { ground: PLAIN, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  s.time = at;
  return s;
}

const event = (kind: EventKind, strength: Strength, day: number, hour: number, hours: number): WeatherEvent => ({ kind, strength, start: timeOf(day, hour), length: hours * HOUR });
const DUST = event('dustStorm', 'ordinary', 3, 8, 18);

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

const tree = (s: GameState, x: number, y: number) => { s.map.terrain[tileIndex(s, x, y)] = TERRAIN.tree; touchLayout(s); };
const soil = (s: GameState, f: BuildingOf<'field'>) => fieldFertility(s, f);

test('a dust storm veils the sun to about a third and slows the trucks, as to about a third', () => {
  const s = game('summer', [DUST], timeOf(3, 14)), quiet = game('summer', [], timeOf(3, 14));
  const p = pushesAt(s.scenario, s.time);
  assert.ok(p.sun < 0.34 && p.trucks < 0.65, 'the levers');
  const share = sunAt(s.scenario, s.time) / sunAt(quiet.scenario, s.time);
  assert.ok(share > 0.3 && share < 0.36, `solar to about a third, got ${share.toFixed(2)}`);
  const severe = game('summer', [event('dustStorm', 'severe', 3, 8, 18)], timeOf(3, 14));
  assert.ok(sunAt(severe.scenario, severe.time) < sunAt(s.scenario, s.time), 'a severe one is darker');
  assert.ok(pushesAt(severe.scenario, severe.time).trucks < p.trucks);
});

test('an unguarded field loses fertility in the wind; a tree, a sapling or a bean field beside it guards it', () => {
  const s = game('summer', [DUST], timeOf(3, 8));
  const open = put(s, 'field', 4, 4), treed = put(s, 'field', 12, 4), sapled = put(s, 'field', 20, 4), beside = put(s, 'field', 4, 12), beans = put(s, 'field', 7, 12);
  tree(s, 11, 4); put(s, 'sapling', 19, 5);
  setCrop(s, beans, 'beans');
  // Full stores, so no harvest wears the soil in the meantime.
  for (const b of s.buildings) if (b.type === 'field') b.stored = 6;
  const bare = s.map.fertility.slice();
  advance(s, 18 * HOUR);
  const lost = 60 - soil(s, open);
  assert.ok(lost > 6 && lost < 12, `an ordinary storm takes about ten points, took ${lost.toFixed(1)}`);
  assert.equal(soil(s, treed), 60, 'a tree beside it');
  assert.equal(soil(s, sapled), 60, 'a sapling beside it');
  // The bean field guards the wheat field next to it; the beans themselves have nothing beside them but the wheat.
  assert.equal(soil(s, beside), 60, 'a bean field sharing an edge');
  assert.ok(soil(s, beans) < 60, 'the beans are not guarded by the wheat');
  // Ground without a field is not touched.
  for (let i = 0; i < bare.length; i++) {
    const x = i % s.map.width, y = (i - x) / s.map.width, inField = s.buildings.some((b) => b.type === 'field' && x >= b.x && y >= b.y && x < b.x + 3 && y < b.y + 3);
    if (!inField) assert.equal(s.map.fertility[i], bare[i], `tile ${x},${y}`);
  }
  // It stops with the storm.
  const after = soil(s, open);
  advance(s, 4 * HOUR);
  assert.equal(soil(s, open), after, 'nothing more is lost once it has passed');
});

test('a severe dust storm takes twice the soil, felt as strongly as it has built', () => {
  const run = (strength: Strength) => {
    const s = game('summer', [event('dustStorm', strength, 3, 8, 18)], timeOf(3, 8));
    const f = put(s, 'field', 4, 4);
    f.stored = 6; // full, so harvests do not wear it
    blowDustFor(s, 18 * HOUR);
    return 60 - soil(s, f);
  };
  const ordinary = run('ordinary'), severe = run('severe');
  assert.ok(Math.abs(severe / ordinary - 2) < 0.01, `${ordinary.toFixed(2)} vs ${severe.toFixed(2)}`);
  const s = game('summer', [DUST], DUST.start + 0.5 * HOUR);
  assert.ok(dustFor(s.scenario, s.time)!.rate < 0.6 * 0.5, 'blown in by the ramp');
  assert.equal(dustFor(s.scenario, DUST.start - 1), null);
});

/** Only the wind, no growing: runs the dust rule alone across `seconds` of play. */
function blowDustFor(s: GameState, seconds: number) {
  const dt = 0.5;
  for (let t = 0; t < seconds; t += dt) { s.time += dt; blowDust(s, dt); }
}

test('a field the wind strips is marked as the weather\'s doing, and a guarded one is not', () => {
  const s = game('summer', [DUST], timeOf(3, 12));
  const open = put(s, 'field', 4, 4), guarded = put(s, 'field', 12, 4);
  tree(s, 11, 4);
  put(s, 'pylon', 20, 4); put(s, 'solar', 20, 6);
  advance(s, 2);
  assert.equal(open.status, 'weather');
  const hold = readHold(open.need)!;
  assert.deepEqual([hold.kind, hold.effect], ['dustStorm', 'eroded']);
  assert.equal(holdLabel(hold), 'Losing soil · dust storm');
  assert.notEqual(guarded.status, 'weather');
  assert.match(describeStatus(s, open), /Losing soil to the dust storm.*no tree, sapling or bean field/);
  const panel = s.buildings.find((b) => b.type === 'solar')!;
  assert.equal(panel.status, 'weather', 'the panel under the veil');
  assert.equal(EVENTS.dustStorm.shape, 'dots');
  assert.ok(EVENTS.dustStorm.holds);
  // Not marked as the wind dies away.
  const late = game('summer', [DUST], DUST.start + 17.9 * HOUR);
  const f = put(late, 'field', 4, 4);
  advance(late, 1);
  assert.notEqual(f.status, 'weather');
});

test('trucks driving in the dust storm are marked slowed', () => {
  const s = game('summer', [DUST], timeOf(3, 12));
  const t = { id: 99, phase: 'drive', path: [1, 2, 3] } as never;
  const hold = truckHold(s, t);
  assert.deepEqual([hold?.kind, hold?.effect], ['dustStorm', 'slowed']);
});

test('the dust storm is drawn as a warm brown haze, and the fog as a grey one that thins as the morning lifts it', () => {
  const s = game('summer', [DUST], timeOf(3, 14));
  const dust = lookAt(s.scenario, s.time);
  assert.equal(dust.haze?.color, DUST_HAZE);
  assert.ok(dust.haze.amount > 0.65 && dust.haze.amount <= 1, 'thick');
  assert.ok(dust.heat > 0.3, 'a warm light');
  assert.equal(weatherAt(s.scenario, s.time).haze?.color, DUST_HAZE, 'the weather carries it for the sky');
  assert.equal(lookAt(s.scenario, DUST.start - 1).haze, null);
  assert.equal(lookAt(s.scenario, DUST.start + 0.1 * HOUR).haze!.amount < 0.1, true, 'built in');

  const fog = event('fog', 'ordinary', 3, 4, 6);
  const f = game('autumn', [fog], 0, null).scenario;
  const early = lookAt(f, fog.start + 1.6 * HOUR).haze!, late = lookAt(f, fog.start + 4.3 * HOUR).haze!;
  assert.equal(early.color, FOG_HAZE);
  assert.ok(early.amount > 0.45 && early.amount <= 0.6, `a fog is about 0.6, got ${early.amount}`);
  assert.ok(late.amount < early.amount * 0.75, 'thinner as it lifts');
  assert.equal(lookAt(f, fog.start + 5 * HOUR).haze !== null, true);
  assert.equal(lookAt(f, endOfFog(fog)).haze, null, 'gone when it has passed');
  assert.equal(lookAt(game('autumn', [], 0).scenario, 0).haze, null, 'a clear day has none');
});

const endOfFog = (e: WeatherEvent) => e.start + e.length;

test('the placement card\'s soil forecast counts what a dust storm will take from an exposed field, and not from a guarded one', () => {
  const calm = game('summer', [], timeOf(3, 8)), stormy = game('summer', [DUST], timeOf(3, 8));
  const soilAfter = (s: GameState, x: number, y: number) => Number(placement(s, 'field', x, y).facts.find((f) => f.label === 'Soil')!.then);
  tree(calm, 3, 4); tree(stormy, 3, 4);
  assert.ok(soilAfter(stormy, 12, 12) < soilAfter(calm, 12, 12) - 4, 'an exposed field loses the storm\'s soil over the next ten minutes');
  assert.equal(soilAfter(stormy, 4, 4), soilAfter(calm, 4, 4), 'a guarded one loses none');
});

test('the cards say whether a field is guarded where a dust storm can come, and only there', () => {
  const dry = game('summer', [], timeOf(2, 8)), hot = game('summer', [], timeOf(2, 8), 'hot');
  assert.ok(dustComes(dry) && !dustComes(hot), 'a dry summer can, a hot one cannot');
  assert.ok(dustComes(hot) === false);
  const fact = (s: GameState, x: number, y: number) => placement(s, 'field', x, y).facts.find((f) => f.label === 'Dust storm');
  assert.equal(fact(dry, 4, 4)?.value, 'exposed');
  tree(dry, 3, 4);
  assert.equal(fact(dry, 4, 4)?.value, 'guarded');
  assert.equal(fact(hot, 4, 4), undefined);
  const f = put(dry, 'field', 4, 4);
  assert.match(dustNote(dry, f)!, /^guarded: a tree/);
  assert.equal(dustNote(hot, put(hot, 'field', 4, 4)), null);
  // A campaign commission shows it only if it places one (Tired Soil does, not First Light); the sandbox always shows it.
  const campaign = newGame(CAMPAIGN[0]);
  assert.equal(dustComes(campaign), false);
  assert.equal(dustComes(newGame(CAMPAIGN[5])), true);
  assert.equal(dustComes(newGame(SANDBOX)), true);
  const placed = game('summer', [], 0, null);
  assert.equal(dustComes(placed), false);
  placed.scenario.events = [DUST];
  assert.equal(dustComes(placed), true, 'one is on its way');
});
