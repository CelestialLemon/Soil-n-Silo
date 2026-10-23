import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buyTruck, place } from '../src/game/build.ts';
import { DAY_SECONDS, POWER, type BuildingId } from '../src/game/data.ts';
import { allowed, EVENTS, endOf, eventsOf, pushesAt, timeOf, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { eventIndex, readHold, truckHold } from '../src/game/hold.ts';
import { iceOf, mapIce, OPEN_REACH, runsAt, frozenBank } from '../src/game/ice.ts';
import { generateLand, TERRAIN } from '../src/game/map.ts';
import { coopPace, wheelSite } from '../src/game/rules.ts';
import { SANDBOX, scenarioById, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { sunAt, windAt } from '../src/game/sim/clock.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { makes } from '../src/game/sim/energy.ts';
import { advance } from '../src/game/sim/step.ts';
import { lyingSnow, panelShare, panelSnow, PANEL_BLOCK, snowOf } from '../src/game/snow.ts';
import { newGame, touchRelief, type BuildingOf, type GameState } from '../src/game/state.ts';
import { tonight } from '../src/game/forecast.ts';
import { nightsOf } from '../src/game/powerlog.ts';
import { henFact, warmthOf } from '../src/game/warmth.ts';
import { lostSeconds } from '../src/game/weathercost.ts';
import { newRunLog } from '../src/game/runlog.ts';
import { weatherAt } from '../src/game/sim/weather.ts';

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

const event = (kind: EventKind, strength: Strength, day: number, hour: number, hours: number): WeatherEvent => ({ kind, strength, start: timeOf(day, hour), length: hours * HOUR });

/** A winter game on flat ground with the events given, set to `at`; with `river`, a river two tiles wide down the map with a fall across it (the water 2 levels high above row 15, level below). */
function winter(events: WeatherEvent[], at: number, river = false, character: 'hard' | null = null): GameState {
  const climate = { ...climateOf('winter', character), conditions: NO_CONDITIONS };
  const sc: Scenario = { ...SANDBOX, climate, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  s.time = at;
  if (river) {
    const { width, height } = s.map;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const i = y * width + x, level = y < 15 ? 2 : 0;
      s.map.corner.fill(level, i * 4, i * 4 + 4);
      if (x === 14 || x === 15) { s.map.terrain[i] = TERRAIN.water; s.map.current[i] = 1; }
    }
    s.scenario.climate.river.flow = 1;
    touchRelief(s);
  }
  return s;
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

function power(s: GameState, x: number, y: number) {
  put(s, 'pylon', x, y);
  put(s, 'battery', x + 1, y).charge = POWER.battery.capacity;
}

// ---- The cold snap ----

test('a cold snap drops the warmth by 8°C and a severe one by 13, and the whole day\'s curve with it', () => {
  const snap = event('coldSnap', 'ordinary', 3, 6, 30), severe = { ...snap, strength: 'severe' as const };
  const s = winter([snap], timeOf(3, 18)), quiet = winter([], timeOf(3, 18)), sev = winter([severe], timeOf(3, 18));
  assert.ok(Math.abs(warmthOf(quiet) - warmthOf(s) - 8) < 1e-9);
  assert.ok(Math.abs(warmthOf(quiet) - warmthOf(sev) - 13) < 1e-9);
  // Not before it begins; building in over its first hours.
  s.time = timeOf(3, 5);
  assert.equal(warmthOf(s), warmthOf(quiet, s.time));
  s.time = timeOf(3, 6.75);
  const half = warmthOf(quiet, s.time) - warmthOf(s);
  assert.ok(half > 0.5 && half < 7.5, `${half}`);
});

test('a cold snap slows the hens; a season\'s heat is the heat wave\'s alone', () => {
  const snap = event('coldSnap', 'ordinary', 3, 6, 30);
  const s = winter([snap], timeOf(3, 18)), quiet = winter([], timeOf(3, 18));
  put(s, 'coop', 4, 4); put(quiet, 'coop', 4, 4);
  const c = (g: GameState) => coopPace(g, 4, 4);
  assert.ok(Math.abs(c(s) - c(quiet) * 0.6) < 1e-9, `${c(s)} against ${c(quiet)}`);
  const sev = winter([{ ...snap, strength: 'severe' }], timeOf(3, 18));
  assert.ok(coopPace(sev, 4, 4) < c(s));
});

test('a cold snap freezes the quiet stretches: a wheel there stops, a wheel at a fall keeps turning', () => {
  const snap = event('coldSnap', 'ordinary', 3, 6, 30);
  const s = winter([snap], timeOf(3, 18), true), quiet = winter([], timeOf(3, 18), true);
  const wheels = (g: GameState) => ({ quiet: put(g, 'wheel', 12, 8), fall: put(g, 'wheel', 12, 13) });
  const a = wheels(s), b = wheels(quiet);
  assert.equal(wheelSite(s, 12, 8)?.fall, false);
  assert.equal(wheelSite(s, 12, 13)?.fall, true);
  assert.equal(makes(quiet, b.quiet, 0, 0), POWER.wheel, 'a quiet wheel in an ordinary winter');
  assert.equal(makes(s, a.quiet, 0, 0), 0, 'frozen shut');
  assert.ok(Math.abs(makes(s, a.fall, 0, 0) - makes(quiet, b.fall, 0, 0)) < 1e-9 && makes(s, a.fall, 0, 0) > 0, 'a fall keeps running');
  // The ice forms over the first hours: a wheel on it slows before it stops, and runs again as it melts.
  s.time = timeOf(3, 6.5);
  const early = makes(s, a.quiet, 0, 0);
  assert.ok(early > 0 && early < POWER.wheel, `${early}`);
  s.time = timeOf(3, 6) + 30 * HOUR + HOUR;
  assert.ok(makes(s, a.quiet, 0, 0) > 0);
  s.time = endOf(snap) + HOUR;
  assert.equal(makes(s, a.quiet, 0, 0), POWER.wheel);
});

test('a frozen wheel is marked by the cold snap, a wheel at a fall is not, and the cause is named', () => {
  const snap = event('coldSnap', 'ordinary', 3, 6, 30);
  const s = winter([snap], timeOf(3, 18), true);
  put(s, 'pylon', 10, 9);
  const quiet = put(s, 'wheel', 12, 8), fall = put(s, 'wheel', 12, 13);
  put(s, 'pylon', 10, 12);
  put(s, 'pylon', 10, 10);
  advance(s, 2);
  assert.equal(quiet.status, 'weather');
  assert.deepEqual(readHold(quiet.need), { kind: 'coldSnap', strength: 'ordinary', effect: 'stopped' });
  assert.notEqual(fall.status, 'weather');
  assert.match(describeStatus(s, quiet), /Stopped: the river is frozen over here by the cold snap/);
});

test('hens in a cold snap are marked as slowed by it', () => {
  const snap = event('coldSnap', 'ordinary', 3, 6, 30);
  const s = winter([snap], timeOf(3, 18));
  const coop = put(s, 'coop', 4, 4); coop.inputs = { beans: 6 };
  advance(s, 2);
  assert.equal(coop.status, 'weather');
  assert.deepEqual(readHold(coop.need), { kind: 'coldSnap', strength: 'ordinary', effect: 'slowed' });
  assert.match(describeStatus(s, coop), /^Hens laying at about \d+% speed: the cold snap/);
});

test('the drawn ice is where the rules freeze: the land the view reads (with its country) agrees with the map\'s river, falls open', () => {
  const sc = scenarioById('r3-3');
  assert.ok(sc);
  const margin = 12, land = generateLand(sc, margin), map = newGame(sc).map;
  const river = new Uint8Array(land.width * land.height);
  for (let i = 0; i < river.length; i++) river[i] = land.flow[i * 2] !== 0 || land.flow[i * 2 + 1] !== 0 ? 1 : 0;
  const seen = iceOf({ width: land.width, height: land.height, river, level: (i) => land.corner[i * 4] }), rules = mapIce(map);
  let rivers = 0, open = 0;
  for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
    const at = (y + margin) * land.width + x + margin, i = y * map.width + x;
    if (!rules.bank[i]) { assert.equal(seen.bank[at], 0, `land at ${x},${y}`); continue; }
    rivers++; open += rules.open[i];
    assert.equal(seen.open[at], rules.open[i], `open at ${x},${y}`);
    assert.equal(seen.bank[at], rules.bank[i], `bank at ${x},${y}`);
  }
  assert.ok(rivers > 0 && open > 0 && open < rivers, `${open} of ${rivers} river tiles are open`);
});

test('the river\'s ice: open at a fall and one tile round it, in from the banks elsewhere', () => {
  // A river four tiles wide, 12 long, with a fall between rows 5 and 6.
  const width = 10, height = 12, river = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 3; x < 7; x++) river[y * width + x] = 1;
  const ice = iceOf({ width, height, river, level: (i) => (Math.floor(i / width) < 6 ? 2 : 0) });
  const at = (x: number, y: number) => y * width + x;
  for (let x = 3; x < 7; x++) {
    for (const y of [4, 5, 6, 7]) assert.equal(ice.open[at(x, y)], 1, `open at ${x},${y}`);
    for (const y of [0, 2, 3, 8, 10, 11]) assert.equal(ice.open[at(x, y)], 0, `frozen at ${x},${y}`);
  }
  assert.equal(OPEN_REACH, 1);
  assert.equal(ice.bank[at(3, 0)], 1);
  assert.equal(ice.bank[at(4, 0)], 2);
  assert.equal(ice.bank[at(0, 0)], 0, 'land');
  // The edge of the map is not a bank: the river runs on past it.
  assert.equal(ice.reach, 2, 'the widest stretch of ice is two tiles in from each bank');
  assert.equal(frozenBank(ice, 0), 0);
  assert.equal(frozenBank(ice, 0.5), 1);
  assert.equal(frozenBank(ice, 1), 2);
});

test('ponds don\'t freeze, and a map\'s ice is worked out once', () => {
  const s = winter([], 0, true);
  const i = 5 * s.map.width + 3;
  s.map.terrain[i] = TERRAIN.water; // a pond: water with no current
  const ice = mapIce(s.map);
  assert.equal(ice, mapIce(s.map));
  assert.equal(ice.bank[i], 0);
  assert.ok(runsAt(s.map, 14, 14) && !runsAt(s.map, 14, 8));
});

test('a cold snap leaves the greenhouse its double heat as a lever (phase 4 reads it)', () => {
  const snap = event('coldSnap', 'ordinary', 3, 6, 30);
  const s = winter([snap], timeOf(3, 18));
  assert.equal(pushesAt(s.scenario, s.time).heating, 2);
  assert.equal(pushesAt(winter([], 0).scenario, 0).heating, 1);
});

// ---- The blizzard ----

test('a blizzard takes the sun entirely and slows trucks; the wind stays the season\'s', () => {
  const b = event('blizzard', 'ordinary', 3, 6, 30);
  const s = winter([b], timeOf(3, 14), false, 'hard'), quiet = winter([], timeOf(3, 14), false, 'hard');
  assert.ok(sunAt(quiet.scenario, s.time) > 0.1);
  assert.equal(sunAt(s.scenario, s.time), 0);
  assert.equal(windAt(s.scenario, s.time), windAt(quiet.scenario, s.time));
  assert.equal(pushesAt(s.scenario, s.time).trucks, 0.5);
  assert.ok(Math.abs(pushesAt(winter([{ ...b, strength: 'severe' }], s.time).scenario, s.time).trucks - 0.3) < 1e-9);
  const garage = put(s, 'garage', 6, 8);
  const t = buyTruck(s, garage);
  assert.ok(t.ok);
  t.value.truck.phase = 'drive'; t.value.truck.path = [40];
  assert.deepEqual(truckHold(s, t.value.truck), { kind: 'blizzard', strength: 'ordinary', effect: 'slowed' });
  assert.equal(weatherAt(s.scenario, s.time).sky, 'snow');
});

test('panels in a blizzard are dark and marked as stopped by it', () => {
  const b = event('blizzard', 'ordinary', 3, 6, 30);
  const s = winter([b], timeOf(3, 14), false, 'hard');
  power(s, 4, 4); const panel = put(s, 'solar', 4, 6);
  advance(s, 2);
  assert.equal(panel.status, 'weather');
  assert.deepEqual(readHold(panel.need), { kind: 'blizzard', strength: 'ordinary', effect: 'stopped' });
});

test('snow lies on the panels after a blizzard and melts off over the next hours', () => {
  const b = event('blizzard', 'ordinary', 3, 6, 24);
  const s = winter([b], b.start, false, 'hard');
  assert.equal(snowOf(b, b.start - 1), 0);
  assert.equal(snowOf(b, b.start), 0);
  assert.equal(snowOf(b, b.start + 3 * HOUR), 1, 'buried within three hours');
  assert.ok(snowOf(b, b.start + HOUR) > 0.1 && snowOf(b, b.start + HOUR) < 0.5);
  assert.equal(snowOf(b, endOf(b)), 1);
  const half = snowOf(b, endOf(b) + 8 * HOUR);
  assert.ok(Math.abs(half - 0.5) < 1e-9, `${half}`);
  assert.equal(snowOf(b, endOf(b) + 16 * HOUR), 0);
  assert.equal(snowOf(b, endOf(b) + 100 * HOUR), 0);
  // The panels' light: nearly none under the full snow, all of it once it has melted.
  assert.equal(panelShare(s.scenario, b.start - 1), 1);
  assert.ok(Math.abs(panelShare(s.scenario, endOf(b)) - (1 - PANEL_BLOCK)) < 1e-9);
  assert.equal(panelShare(s.scenario, endOf(b) + 16 * HOUR), 1);
  assert.deepEqual(panelSnow(s.scenario, endOf(b) + 4 * HOUR)?.event, b);
  // A panel makes less by day after the blizzard than in the same sun without the snow, and recovers.
  const noon = timeOf(5, 12);
  const panel = put(s, 'solar', 4, 6);
  s.time = endOf(b) + 2 * HOUR;
  const after = makes(s, panel, 1, 0);
  assert.ok(after > 0 && after < POWER.solar * 0.2, `${after}`);
  s.time = noon; // ~a day and a half later, melted
  assert.equal(makes(s, panel, 1, 0), POWER.solar);
});

test('a panel under the blizzard\'s snow is held by it after the blizzard, and the hold counts for the blizzard\'s cost', () => {
  const b = event('blizzard', 'ordinary', 3, 6, 24);
  const s = winter([b], endOf(b) + 2 * HOUR, false, 'hard');
  power(s, 4, 4); const panel = put(s, 'solar', 4, 6);
  s.time = timeOf(4, 10) - 1;
  assert.ok(s.time > endOf(b));
  advance(s, 2);
  assert.equal(panel.status, 'weather');
  assert.deepEqual(readHold(panel.need), { kind: 'blizzard', strength: 'ordinary', effect: 'weak' });
  assert.match(describeStatus(s, panel), /snow from the blizzard lies on the panels until it melts/);
  assert.equal(eventIndex(s.scenario, s.time, { kind: 'blizzard', strength: 'ordinary' }), 0, 'attributed to the blizzard though it is over');
  assert.ok((s.run.held['0|solar'] ?? 0) > 0);
  // Other kinds are attributed only while they are under way.
  assert.equal(eventIndex(s.scenario, s.time, { kind: 'fog', strength: 'ordinary' }), -1);
  // After it has melted, the panel is free.
  s.time = timeOf(6, 10);
  advance(s, 2);
  assert.notEqual(panel.status, 'weather');
});

test('the blizzard\'s cost is measured over the hours its snow lingers', () => {
  const b = event('blizzard', 'ordinary', 3, 6, 24);
  const run = newRunLog();
  // A steady rate of output, then the blizzard, then nothing made until the snow has gone, then the steady rate again.
  const step = run.curveStep, total = Math.ceil(timeOf(8, 0) / step) + 2;
  let made = 0;
  for (let k = 0; k < total; k++) {
    const t = k * step, rate = t >= b.start && t < endOf(b) + 16 * HOUR ? 0 : 1;
    run.output.push(made); run.curve.push(0);
    made += rate * step;
  }
  const lost = lostSeconds(run, b, timeOf(8, 0));
  assert.ok(lost !== null && lost > 24 * HOUR, `${lost}`);
});

test('the blizzard\'s lying snow builds in a few hours, lies through it and melts slowly; there is none out of winter', () => {
  const b = event('blizzard', 'ordinary', 3, 6, 24);
  const s = winter([b], b.start, false, 'hard');
  assert.equal(lyingSnow(s.scenario, b.start - HOUR), 0);
  assert.ok(lyingSnow(s.scenario, b.start + 2 * HOUR) > 0.3);
  assert.ok(lyingSnow(s.scenario, b.start + 6 * HOUR) > 0.95);
  assert.ok(lyingSnow(s.scenario, endOf(b)) > 0.95);
  const later = [4, 12, 24].map((h) => lyingSnow(s.scenario, endOf(b) + h * HOUR));
  assert.ok(later[0] > later[1] && later[1] > later[2], later.join(' '));
  assert.ok(later[0] > 0.6 && later[2] < 0.25, later.join(' '));
  for (const season of ['spring', 'summer', 'autumn'] as Season[]) {
    const g = winter([b], b.start + 10 * HOUR);
    g.scenario.climate = { ...climateOf(season), conditions: NO_CONDITIONS };
    assert.equal(lyingSnow(g.scenario, g.time), 0, season);
  }
});

test('everyday snow showers lay a dusting', () => {
  const s = winter([], 0);
  s.scenario.climate = { ...s.scenario.climate, conditions: { cloud: 0.3, rain: 1, calm: 0 } };
  let most = 0;
  for (let h = 0; h < 72; h += 0.5) most = Math.max(most, lyingSnow(s.scenario, h * HOUR));
  assert.ok(most > 0.15, `${most}`);
});

// ---- The catalogue ----

test('the blizzard comes only in a hard winter, the cold snap in any winter, neither out of it', () => {
  assert.ok(allowed('coldSnap', climateOf('winter')) && allowed('coldSnap', climateOf('winter', 'hard')));
  assert.ok(!allowed('blizzard', climateOf('winter')) && allowed('blizzard', climateOf('winter', 'hard')));
  for (const s of ['spring', 'summer', 'autumn'] as Season[]) assert.ok(!eventsOf(climateOf(s)).some((k) => k === 'coldSnap' || k === 'blizzard'), s);
  assert.deepEqual(eventsOf(climateOf('winter', 'hard')).filter((k) => !EVENTS[k].good), ['coldSnap', 'blizzard']);
});

test('both winter events have a marker shape and say what they hold', () => {
  for (const k of ['coldSnap', 'blizzard'] as EventKind[]) assert.ok(EVENTS[k].shape && EVENTS[k].holds, k);
});

// ---- Review fixes ----

test('a daytime blizzard is not night: the power log and the run log keep the nights apart', () => {
  const b = event('blizzard', 'ordinary', 3, 8, 6);
  const s = winter([b], timeOf(3, 11), false, 'hard');
  power(s, 4, 4); put(s, 'solar', 4, 6);
  advance(s, 10);
  assert.equal(sunAt(s.scenario, s.time), 0);
  assert.equal(nightsOf(s).length, 0, 'no night recorded');
  assert.equal(s.run.nights.length, 0);
});

test('the battery forecast sees a river freeze before morning', () => {
  const snap = event('coldSnap', 'ordinary', 3, 18, 24);
  const s = winter([snap], timeOf(3, 17), true);
  put(s, 'pylon', 10, 9);
  const wheel = put(s, 'wheel', 12, 8);
  put(s, 'battery', 10, 11).charge = 0;
  put(s, 'pylon', 10, 7);
  void wheel;
  const t = tonight(s);
  assert.ok(t);
  const quiet = winter([], timeOf(3, 17), true);
  put(quiet, 'pylon', 10, 9); put(quiet, 'wheel', 12, 8); put(quiet, 'battery', 10, 11).charge = 0; put(quiet, 'pylon', 10, 7);
  const q = tonight(quiet);
  assert.ok(q);
  assert.ok(t.points[t.points.length - 1].k < q.points[q.points.length - 1].k, 'less charge at dawn when the wheel freezes');
});

test('the coop\'s card and its line tell the hens\' real pace in a cold snap', () => {
  const snap = event('coldSnap', 'ordinary', 3, 6, 30);
  const s = winter([snap], timeOf(3, 18));
  const coop = put(s, 'coop', 4, 4);
  coop.inputs = { beans: 6 };
  advance(s, 2);
  const pace = Math.round(coopPace(s, 4, 4) * 100);
  assert.ok(pace < 50, `${pace}`);
  assert.match(describeStatus(s, coop), new RegExp(`about ${pace}% speed`));
  assert.ok(henFact(s.scenario, warmthOf(s), 0, pushesAt(s.scenario, s.time).hens).text.includes('the weather slows them'));
});
