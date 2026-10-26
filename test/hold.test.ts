import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buyTruck, place } from '../src/game/build.ts';
import { DAY_SECONDS, POWER } from '../src/game/data.ts';
import { activeEvents, EVENT_KINDS, EVENTS, SHAPES, timeOf, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { historyOf, summarize, waitsOf } from '../src/game/history.ts';
import { holdLabel, holdNeed, holdShape, readHold, truckHold } from '../src/game/hold.ts';
import { newRunLog, RUN_SAMPLE } from '../src/game/runlog.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { describeStatus, describeTruck } from '../src/game/sim/describe.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type BuildingOf, type GameState } from '../src/game/state.ts';
import { dayAt } from '../src/game/sim/clock.ts';
import { eventCosts, lostSeconds, NOTICEABLE } from '../src/game/weathercost.ts';
import type { BuildingId } from '../src/game/data.ts';
import { GROUND, PLAIN } from '../src/game/ground.ts';

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

/** A flat game in a season with the events given, set to `at`. */
function game(season: Season, events: WeatherEvent[], at: number): GameState {
  const climate = { ...climateOf(season), conditions: NO_CONDITIONS };
  const sc: Scenario = { ...SANDBOX, climate, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600, events,
    terrain: { ground: PLAIN, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.ground.fill(GROUND.loam); s.map.fertility.fill(60);
  s.soilBase.fill(60);
  s.time = at;
  return s;
}

const event = (kind: EventKind, strength: Strength, day: number, hour: number, hours: number): WeatherEvent => ({ kind, strength, start: timeOf(day, hour), length: hours * HOUR });

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

/** A pylon with a full battery, so the buildings near it have power. */
function power(s: GameState, x: number, y: number) {
  put(s, 'pylon', x, y);
  put(s, 'battery', x + 1, y).charge = POWER.battery.capacity;
}

test('a hold names its event, its strength and what it does to the building, and reads back', () => {
  const h = { kind: 'gale', strength: 'severe', effect: 'stopped' } as const;
  assert.deepEqual(readHold(holdNeed(h)), h);
  assert.equal(holdLabel(h), 'Stopped · severe gale');
  assert.equal(holdLabel({ kind: 'tropicalStorm', strength: 'severe', effect: 'stopped' }), 'Stopped · hurricane');
  for (const bad of [undefined, 42 as unknown as string, '', 'wheat', 'fog:ordinary', 'fog:mild:slowed', 'rain:ordinary:slowed', 'fog:ordinary:vanished']) assert.equal(readHold(bad), null, String(bad));
});

test('every event that marks things has a shape of its own', () => {
  const shaped = EVENT_KINDS.filter((k) => EVENTS[k].shape);
  assert.ok(shaped.length >= 3);
  assert.equal(new Set(shaped.map((k) => EVENTS[k].shape)).size, shaped.length, 'no two events share a shape');
  assert.ok(shaped.every((k) => SHAPES.includes(EVENTS[k].shape!) && EVENTS[k].holds && !EVENTS[k].good));
  assert.ok(SHAPES.length >= EVENT_KINDS.filter((k) => !EVENTS[k].good).length, 'room for every bad event');
});

test('a solar panel under a storm\'s cloud is held by the weather; the same panel in a clear sky is not', () => {
  const storm = event('thunderstorm', 'ordinary', 3, 10, 12);
  const s = game('summer', [storm], timeOf(3, 15) - 1), quiet = game('summer', [], timeOf(3, 15) - 1);
  for (const g of [s, quiet]) { power(g, 4, 4); put(g, 'solar', 4, 6); }
  const panel = (g: GameState) => g.buildings.find((b) => b.type === 'solar')!;
  advance(s, 2); advance(quiet, 2);
  assert.equal(panel(quiet).status, 'ok');
  assert.equal(panel(s).status, 'weather');
  assert.deepEqual(readHold(panel(s).need), { kind: 'thunderstorm', strength: 'ordinary', effect: 'weak' });
  assert.equal(holdLabel(readHold(panel(s).need)!), 'Weak · thunderstorm');
  assert.match(describeStatus(s, panel(s)), /Making about \d+% of its power: the thunderstorm dims the sun/);
  // Its history keeps the weather apart from "no power".
  const sum = summarize(historyOf(s, panel(s))!, s.time, 60);
  assert.ok(sum.shares.some((x) => x.status === 'weather' && x.need === panel(s).need));
});

test('fog slows a driving truck, and only a driving one', () => {
  const fog = event('fog', 'ordinary', 3, 4, 6);
  const s = game('autumn', [fog], timeOf(3, 6));
  const garage = put(s, 'garage', 6, 8);
  const r = buyTruck(s, garage);
  assert.ok(r.ok);
  const t = r.value.truck;
  assert.equal(truckHold(s, t), null, 'parked');
  t.phase = 'drive'; t.path = [40];
  assert.deepEqual(truckHold(s, t), { kind: 'fog', strength: 'ordinary', effect: 'slowed' });
  assert.match(describeTruck(s, t), /, slowed by the fog$/);
  t.path = [];
  assert.equal(truckHold(s, t), null, 'nowhere to go');
  t.path = [40]; s.time = timeOf(3, 12);
  assert.equal(truckHold(s, t), null, 'the fog is gone');
});

test('a heat wave marks the hens and the fields it slows, not the season\'s own heat', () => {
  const wave = event('heatWave', 'ordinary', 3, 6, 30);
  const s = game('summer', [wave], timeOf(3, 15)), quiet = game('summer', [], timeOf(3, 15));
  for (const g of [s, quiet]) { const coop = put(g, 'coop', 4, 4); coop.inputs = { beans: 6 }; put(g, 'field', 10, 10); put(g, 'field', 15, 10); }
  advance(s, 2); advance(quiet, 2);
  for (const b of quiet.buildings) assert.notEqual(b.status, 'weather', `${b.type} in an ordinary summer afternoon`);
  const held = s.buildings.filter((b) => b.status === 'weather');
  assert.deepEqual(held.map((b) => b.type).sort(), ['coop', 'field', 'field']);
  for (const b of held) assert.deepEqual(readHold(b.need), { kind: 'heatWave', strength: 'ordinary', effect: 'slowed' });
  assert.match(describeStatus(s, held.find((b) => b.type === 'field')!), /^Growing wheat slowly: the heat wave adds \d+°C/);
  // Before the heat has built in, nothing is marked.
  s.time = timeOf(3, 6.5);
  advance(s, 2);
  assert.ok(!s.buildings.some((b) => b.status === 'weather'));
});

test('a layout\'s own problem is not hidden by the weather', () => {
  const storm = event('thunderstorm', 'ordinary', 3, 10, 12);
  const s = game('summer', [storm], timeOf(3, 15) - 1);
  put(s, 'solar', 12, 4); // no pylon in reach
  advance(s, 2);
  assert.equal(s.buildings.find((b) => b.type === 'solar')!.status, 'nolink');
});

test('the weather\'s statuses show their event\'s shape; a different cause is a different wait', () => {
  assert.equal(holdShape(holdNeed({ kind: 'fog', strength: 'ordinary', effect: 'slowed' })), 'bars');
  assert.equal(holdShape(holdNeed({ kind: 'heatWave', strength: 'severe', effect: 'slowed' })), 'sun');
  assert.ok(SHAPES.includes(holdShape('gibberish')), 'an unknown cause still gets a shape');
  const storm = event('thunderstorm', 'ordinary', 3, 10, 4), fog = event('fog', 'ordinary', 3, 14, 4);
  const s = game('summer', [storm, fog], timeOf(3, 12));
  power(s, 4, 4); const panel = put(s, 'solar', 4, 6);
  advance(s, 20);
  s.time = timeOf(3, 15.5);
  advance(s, 20);
  const sum = summarize(historyOf(s, panel)!, s.time, 300);
  const waits = waitsOf(sum).filter((w) => w.kind === 'weather');
  assert.deepEqual(waits.map((w) => readHold(w.need)?.kind).sort(), ['fog', 'thunderstorm']);
});

test('the run log keeps what each event held, by event; it saves, and a broken record is refused', () => {
  const storm = event('thunderstorm', 'ordinary', 3, 10, 12);
  const s = game('summer', [storm], timeOf(3, 15) - 1);
  power(s, 4, 4); put(s, 'solar', 4, 6); put(s, 'solar', 2, 4);
  advance(s, 30);
  assert.ok(Math.abs((s.run.held['0|solar'] ?? 0) - 60) < 1e-6, `held ${s.run.held['0|solar']} panel-seconds`);
  assert.ok(Object.keys(s.run.held).every((k) => k.startsWith('0|')));
  assert.deepEqual(deserialize(serialize(s)).ok && JSON.parse(serialize(s)).run.held, s.run.held);
  const old = JSON.parse(serialize(s));
  for (const held of [{ '5|solar': 1 }, { '0|oak': 1 }, { 'x': 1 }, { '0|solar': 'a' }]) assert.equal(deserialize(JSON.stringify({ ...old, run: { ...s.run, held } })).ok, false, JSON.stringify(held));
  assert.equal(deserialize(JSON.stringify({ ...old, run: { ...s.run, output: [1, 2] } })).ok, false, 'the output is sampled with the curve');
  assert.equal(deserialize(JSON.stringify({ ...old, version: 14 })).ok, false);
});

// ---- The cost of an event ----

/** A run log where the valley made `rate` a second, less `dip` of it between a and b, sampled every RUN_SAMPLE seconds to `end`. */
function logOf(end: number, rate: number, dip: number, a: number, b: number, held: number): ReturnType<typeof newRunLog> {
  const run = newRunLog();
  let made = 0;
  for (let t = RUN_SAMPLE; t <= end; t += RUN_SAMPLE) { made += RUN_SAMPLE * rate * (t > a && t <= b ? 1 - dip : 1); run.curve.push(0); run.output.push(made); }
  if (held) run.held['0|truck'] = held;
  return run;
}

test('an event\'s cost is the work it lost, told in time', () => {
  const e = event('heatWave', 'ordinary', 3, 6, 30);
  const end = e.start + e.length + 600;
  // Half the work gone for the event's length (and the half minute after it, where the lost goods are still late): about half of it as time.
  const run = logOf(end, 2, 0.5, e.start, e.start + e.length, 100);
  const lost = lostSeconds(run, e, end)!;
  assert.ok(Math.abs(lost - e.length / 2) < 12, `lost ${lost} s of ${e.length}`);
  const [cost] = eventCosts({ events: [e] }, run, end);
  assert.equal(cost.day, 3);
  assert.equal(cost.seconds! % 30, 0, 'to the half minute');
  assert.ok(Math.abs(cost.seconds! - e.length / 2) <= 30);
  assert.deepEqual(cost.held, { truck: 100 });
  // A valley that made the same all along lost nothing.
  assert.equal(eventCosts({ events: [e] }, logOf(end, 2, 0, e.start, e.start + e.length, 100), end)[0].seconds, 0);
  // A small dip is below what the run can tell from chance.
  const small = lostSeconds(logOf(end, 2, 0.05, e.start, e.start + e.length, 100), e, end)!;
  assert.ok(small < NOTICEABLE);
});

test('an event that held nothing is not told, and one the run can\'t measure is told without a cost', () => {
  const e = event('heatWave', 'ordinary', 3, 6, 30), end = e.start + e.length + 600;
  assert.deepEqual(eventCosts({ events: [e] }, logOf(end, 2, 0.5, e.start, e.start + e.length, 0), end), [], 'it held nothing');
  const early = event('fog', 'ordinary', 1, 8, 4);
  assert.equal(eventCosts({ events: [early] }, logOf(end, 2, 0.5, early.start, early.start + early.length, 50), end)[0].seconds, null, 'no time before it to compare with');
  const noOutput = newRunLog(); noOutput.held['0|truck'] = 50;
  assert.equal(eventCosts({ events: [e] }, noOutput, end)[0].seconds, null);
  // An event the run ended before is not told.
  assert.deepEqual(eventCosts({ events: [e] }, logOf(end, 2, 0, 0, 0, 5), e.start - 1), []);
  assert.equal(dayAt(e.start), 3);
});

test('events under way at once are all held to account', () => {
  const a = event('thunderstorm', 'ordinary', 3, 10, 12), b = event('fog', 'ordinary', 3, 14, 4);
  assert.equal(activeEvents({ events: [a, b] }, timeOf(3, 15)).length, 2);
});
