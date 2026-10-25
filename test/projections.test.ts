import assert from 'node:assert/strict';
import { test } from 'node:test';
import { basisOf, notCounted, possibleIn, readingOf, TRUTH, USUAL, usualView, usualWords, viewsOf, worldsOf, EASE_HOURS, type Reading } from '../src/game/ahead.ts';
import { place, remove } from '../src/game/build.ts';
import { DAY_SECONDS, POWER, type BuildingId, type CropId } from '../src/game/data.ts';
import { endOf, eventOn, timeOf, type WeatherEvent } from '../src/game/events.ts';
import { usualOf } from '../src/game/expected.ts';
import { NIGHT_MARGINS, placement, tonight } from '../src/game/forecast.ts';
import { forecastAt, issueTimeOf, type Forecast } from '../src/game/outlook.ts';
import { CAMPAIGN, randomScenario, SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf } from '../src/game/seasons.ts';
import { windAt } from '../src/game/sim/clock.ts';
import { advance } from '../src/game/sim/step.ts';
import { hasStation } from '../src/game/station.ts';
import { newGame, type GameState } from '../src/game/state.ts';
import { dryLine, dryWords } from '../src/ui/format.ts';

// The projections (3.4): tonight's charge and a field's soil ahead read the weather through a view, never from the seeded weather
// ahead: the usual weather without a station, the ranges of the forecast with one.

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

type Layout = { charge: number; solar: number; turbines: number; looms: number };
const LAYOUTS: Layout[] = [{ charge: 0.7, solar: 2, turbines: 2, looms: 2 }, { charge: 0.4, solar: 3, turbines: 1, looms: 2 }];

/** A flat game of a commission's climate, seed and events with one network: a battery holding `charge`, panels, turbines, looms with yarn and a sprinkler, set to `time`. */
function rig(sc: Scenario, time: number, l: Layout): GameState {
  const g = newGame({ ...sc, credits: 1e6, goals: [], width: 30, height: 30, terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 } });
  g.map.fertility.fill(60); g.soilBase.fill(60);
  const put = (type: BuildingId, x: number, y: number) => { const r = place(g, type, x, y, 0); assert.ok(r.ok, `${type} at ${x},${y}`); return r.ok ? r.value.building : null; };
  const near = (type: BuildingId) => {
    for (let r = 1; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const q = place(g, type, 10 + dx, 10 + dy, 0); if (q.ok) return q.value.building; }
    return assert.fail(`no room for a ${type}`);
  };
  put('pylon', 10, 10);
  const battery = put('battery', 11, 10) as { charge: number };
  for (let i = 0; i < l.solar; i++) near('solar');
  for (let i = 0; i < l.turbines; i++) near('turbine');
  for (let i = 0; i < l.looms; i++) (near('loom') as { inputs: Record<string, number> }).inputs = { yarn: 30 };
  near('sprinkler');
  advance(g, 1);
  g.time = time; battery.charge = POWER.battery.capacity * l.charge;
  return g;
}

const forecastOf = (sc: Scenario, time: number): Reading => ({ kind: 'forecast', forecast: forecastAt(sc, issueTimeOf(time)), stale: false });
const soilThen = (g: GameState, crop: CropId, reading: Reading) => placement(g, 'field', 8, 8, { crop }, reading).facts.find((f) => f.label === 'Soil')!;
const soilRange = (f: { then?: string }): [number, number] => { const t = f.then ?? ''; return t.includes('–') ? [Number(t.split('–')[0]), Number(t.split('–')[1])] : [Number(t), Number(t)]; };

/** A commission with steady weather (no cloud, showers or calm spells, a steady wind, no drift), so the weather now says all of the usual. */
function steady(season: 'autumn' | 'summer', seed: number, events: WeatherEvent[]): Scenario {
  const climate = { ...climateOf(season), conditions: NO_CONDITIONS, wind: { mean: 0.8, gust: 0 }, warmth: { ...climateOf(season).warmth, drift: 0 } };
  return { ...SANDBOX, id: 'steady', sandbox: false, climate, seed, events };
}

test('without a station, tonight and the soil do not change with the events ahead or the seed', () => {
  const hurricane = eventOn(2, 21, 'tropicalStorm', 'severe', 36), dust = eventOn(3, 6, 'dustStorm', 'ordinary', 24);
  const night = (seed: number, events: WeatherEvent[], reading: Reading) => tonight(rig(steady('autumn', seed, events), timeOf(2, 15), { charge: 0.7, solar: 1, turbines: 2, looms: 2 }), reading)!;
  const quiet = night(1, [], USUAL), stormy = night(2, hurricane, USUAL);
  assert.deepEqual(quiet.points, stormy.points, 'a hurricane that has not begun is not in tonight');
  assert.equal(quiet.dryAt, stormy.dryAt);
  assert.notDeepEqual(night(1, [], TRUTH).points, night(2, hurricane, TRUTH).points, 'the seeded weather does see it');
  const field = (seed: number, events: WeatherEvent[], reading: Reading) => soilThen(rig(steady('summer', seed, events), timeOf(2, 15), { charge: 1, solar: 0, turbines: 0, looms: 0 }), 'wheat', reading);
  assert.deepEqual(field(1, [], USUAL), field(2, dust, USUAL), 'a dust storm that has not begun is not in the soil');
  assert.notEqual(field(1, [], TRUTH).then, field(2, dust, TRUTH).then);
});

test('without a station, the weather now holds for an hour and then eases to the usual', () => {
  const sc = { ...SANDBOX, id: 't', sandbox: false, climate: climateOf('autumn'), events: [] as WeatherEvent[] };
  const now = 123.4, view = usualView(sc, now), u = usualOf(sc.climate);
  assert.ok(Math.abs(view.wind(now) - windAt(sc, now)) < 1e-9, 'the wind now is the wind now');
  const later = now + (EASE_HOURS + 0.1) * HOUR;
  assert.ok(Math.abs(view.wind(later) - u.wind) < 1e-9, 'past the hour it is the season\'s usual wind');
  assert.equal(view.events.length, 0);
});

test('an event under way is taken to keep on; one over is a fact', () => {
  const night = (events: WeatherEvent[]) => tonight(rig(steady('autumn', 1, events), timeOf(2, 21), { charge: 0.6, solar: 0, turbines: 2, looms: 2 }), USUAL)!;
  assert.equal(night([]).dryAt, null, 'the turbines carry the night');
  const under = night(eventOn(2, 19, 'tropicalStorm', 'severe', 5));
  assert.ok(under.dryAt !== null, 'a hurricane under way stops them, and it is taken to go on');
  assert.equal(tonight(rig(steady('autumn', 1, eventOn(2, 19, 'tropicalStorm', 'severe', 5)), timeOf(2, 21), { charge: 0.6, solar: 0, turbines: 2, looms: 2 }), TRUTH)!.dryAt, null, 'the seeded weather has it over at midnight');
  const over = night(eventOn(2, 8, 'tropicalStorm', 'severe', 5));
  assert.equal(over.dryAt, null, 'one that is over does not stop them');
});

test('with a station, an event the forecast names is a range; one that is only possible on day three is not in it', () => {
  const named = steady('autumn', 3, eventOn(4, 6, 'tropicalStorm', 'severe', 30)), now = timeOf(2, 12);
  const worlds = worldsOf(named, forecastAt(named, issueTimeOf(now)), now, now + 60 * HOUR);
  assert.ok(worlds.length > 1 && worlds.every((w) => w.some((e) => e.kind === 'tropicalStorm')), 'every world has the storm, at its corners');
  assert.ok(new Set(worlds.map((w) => w.find((e) => e.kind === 'tropicalStorm')!.strength)).size === 2, 'a tropical storm may still be a hurricane');
  const far = steady('autumn', 3, eventOn(4, 20, 'tropicalStorm', 'ordinary', 30));
  const f = forecastAt(far, issueTimeOf(now));
  assert.equal(f.events[0]?.detail, 'family');
  assert.deepEqual(worldsOf(far, f, now, now + 60 * HOUR), [[]], 'a possible storm is not counted');
  const g = rig(far, now, { charge: 1, solar: 0, turbines: 0, looms: 0 });
  const soil = soilThen(g, 'wheat', { kind: 'forecast', forecast: f, stale: false });
  assert.match(soil.sub, /a possible storm on day 4 is not counted/);
  assert.equal(possibleIn(far, { kind: 'forecast', forecast: f, stale: false }, now, now + 60 * HOUR).length, 1);
  assert.equal(notCounted(far, USUAL, now, now + 60 * HOUR), '');
  // The storm does show in a night it reaches.
  const night = timeOf(4, 15), t = tonight(rig(named, night, { charge: 0.7, solar: 1, turbines: 2, looms: 2 }), forecastOf(named, night))!;
  assert.ok(t.runs > 1 && t.dry?.always, 'a hurricane under way stops the turbines in every night the forecast allows');
});

/** The scenarios to sweep: the campaign, and random commissions of every difficulty. */
const SWEEP: Scenario[] = [...CAMPAIGN, ...Array.from({ length: 30 }, (_, i) => randomScenario(9000 + i * 61, ((i % 3) + 1) as 1 | 2 | 3))];

test('the real night is inside the range at every hour, for every commission', () => {
  let cases = 0, banded = 0;
  for (const sc of SWEEP) for (let h = 6; h < 24 * 6; h += 13) {
    const time = h * HOUR + 3;
    for (const l of LAYOUTS) {
      const g = rig(sc, time, l), real = tonight(g, TRUTH)!, told = tonight(g, forecastOf(sc, time))!;
      cases++; if (told.runs > 1) banded++;
      real.points.forEach((p, i) => assert.ok(told.points[i].lo <= p.k + 1e-9 && p.k <= told.points[i].hi + 1e-9, `${sc.id} at ${h}: the charge ${p.k} at step ${i} is outside ${told.points[i].lo}–${told.points[i].hi}`));
      if (real.dryAt === null) assert.ok(!told.dry?.always, `${sc.id} at ${h}: it holds, but the forecast has it dry in every case`);
      else assert.ok(told.dry !== null && real.dryAt >= told.dry.from - 1e-6 && real.dryAt <= told.dry.to + 1e-6, `${sc.id} at ${h}: dry at ${real.dryAt}, not in ${told.dry?.from}–${told.dry?.to}`);
    }
  }
  assert.ok(cases > 500 && banded > cases / 2, `${banded} of ${cases} told a range`);
});

test('the real soil is inside the range at every hour, for every commission', () => {
  let cases = 0, counted = 0;
  for (const sc of SWEEP) for (let h = 6; h < 24 * 6; h += 17) {
    const time = h * HOUR + 3, g = rig(sc, time, { charge: 1, solar: 0, turbines: 0, looms: 0 }), reading = forecastOf(sc, time);
    for (const crop of ['wheat', 'tomato', 'beans'] as CropId[]) {
      const real = soilThen(g, crop, TRUTH), told = soilThen(g, crop, reading);
      cases++;
      // What the forecast only calls possible is not in the range, and the card says so.
      if (told.sub.includes('not counted')) continue;
      counted++;
      const [lo, hi] = soilRange(told), truth = Number(real.then);
      assert.ok(lo <= truth && truth <= hi, `${sc.id} at ${h}, ${crop}: soil ${truth} is outside ${lo}–${hi}`);
    }
  }
  assert.ok(counted > cases * 0.8, `${counted} of ${cases} were counted`);
});

test('each range lies inside the one an hour before', () => {
  let cases = 0;
  for (const sc of SWEEP.filter((_, i) => i % 2 === 0)) for (let h = 6; h < 24 * 6; h += 23) {
    const start = issueTimeOf(h * HOUR + 1), next = start + HOUR, l = LAYOUTS[0];
    const g1 = rig(sc, start, l), a = tonight(g1, forecastOf(sc, start))!, real = tonight(g1, TRUTH)!;
    // An hour on, from the charge the real night has then.
    const g2 = rig(sc, next, { ...l, charge: real.points.find((p) => p.t >= next - 1e-6)!.k }), b = tonight(g2, forecastOf(sc, next))!;
    cases++;
    for (const q of b.points) {
      const p = a.points.find((x) => Math.abs(x.t - q.t) < 1e-3);
      if (p) assert.ok(q.lo >= p.lo - 1e-6 && q.hi <= p.hi + 1e-6, `${sc.id} at ${h}: ${q.lo}–${q.hi} is not inside ${p.lo}–${p.hi} at ${q.t}`);
    }
    if (a.dry && b.dry) assert.ok(b.dry.from >= a.dry.from - 1e-6 && b.dry.to <= a.dry.to + 1e-6, `${sc.id} at ${h}: the dry time widened`);
  }
  assert.ok(cases > 30);
  // The soil, from the same state an hour on (nothing changes in a field's soil but the weather).
  for (const sc of SWEEP.filter((_, i) => i % 3 === 0)) for (let h = 6; h < 24 * 4; h += 19) {
    const start = issueTimeOf(h * HOUR + 1), next = start + HOUR, g1 = rig(sc, start, LAYOUTS[0]), g2 = rig(sc, next, LAYOUTS[0]);
    const [a0, a1] = soilRange(soilThen(g1, 'wheat', forecastOf(sc, start))), [b0, b1] = soilRange(soilThen(g2, 'wheat', forecastOf(sc, next)));
    // (The window moves an hour on, so the soil is the same field an hour later: its range may only narrow, within a step of the harvest.)
    assert.ok(b1 - b0 <= a1 - a0 + 4, `${sc.id} at ${h}: the soil range widened ${a0}–${a1} to ${b0}–${b1}`);
  }
});

test('two scenarios whose forecasts read the same give the same range', () => {
  const base = steady('autumn', 5, eventOn(3, 6, 'tropicalStorm', 'ordinary', 30)), now = timeOf(2, 18);
  // Moved a little, inside the cells the forecast tells it in.
  // (The storm begins 0.5 s of play and ends 0.8 s later than it did; the flood that follows begins where it ends.)
  const moved: Scenario = { ...base, events: base.events.map((e, i) => (i === 0 ? { ...e, start: e.start + 0.5, length: e.length + 0.3 } : { ...e, start: e.start + 0.8 })) };
  const fa = forecastAt(base, issueTimeOf(now)), fb = forecastAt(moved, issueTimeOf(now));
  assert.deepEqual(fa, fb, 'the forecast cannot tell them apart');
  const layout = { charge: 0.7, solar: 1, turbines: 2, looms: 2 };
  assert.deepEqual(tonight(rig(base, now, layout), { kind: 'forecast', forecast: fa, stale: false }), tonight(rig(moved, now, layout), { kind: 'forecast', forecast: fb, stale: false }));
  assert.deepEqual(soilThen(rig(base, now, layout), 'wheat', { kind: 'forecast', forecast: fa, stale: false }), soilThen(rig(moved, now, layout), 'wheat', { kind: 'forecast', forecast: fb, stale: false }));
  assert.notDeepEqual(base.events, moved.events, 'though the storms are not the same');
});

test('the range is one value where nothing the forecast says reaches the projection', () => {
  // No growth in a winter\'s cold at any warmth the forecast allows: the soil does not move.
  const sc = { ...SANDBOX, id: 'w', sandbox: false, climate: climateOf('winter', 'hard'), events: [] as WeatherEvent[] };
  const g = rig(sc, timeOf(2, 8), { charge: 1, solar: 0, turbines: 0, looms: 0 }), f = soilThen(g, 'tomato', forecastOf(sc, g.time));
  assert.equal(f.then, f.value, `soil stays ${f.value}`);
});

test('the labels follow: no station, a station, a station out of date', () => {
  const sc = steady('autumn', 5, []), g = rig(sc, timeOf(3, 14), { charge: 0.7, solar: 1, turbines: 1, looms: 1 }), fresh = forecastOf(sc, g.time);
  const old: Reading = { kind: 'forecast', forecast: forecastAt(sc, timeOf(2, 14)), stale: true };
  assert.equal(usualWords(climateOf('winter')), 'a usual winter');
  assert.equal(usualWords(climateOf('spring', 'wet')), 'a usual wet spring');
  assert.equal(usualWords(climateOf('autumn', 'gales')), 'a usual autumn of gales');
  assert.equal(basisOf(USUAL, sc.climate, g.time), 'for a usual autumn');
  assert.equal(basisOf(fresh, sc.climate, g.time), 'from the forecast');
  assert.equal(basisOf(old, sc.climate, g.time), 'from the forecast of day 2, 14:00');
  assert.equal(tonight(g, USUAL)!.basis, 'for a usual autumn');
  assert.equal(tonight(g, fresh)!.basis, 'from the forecast');
  assert.equal(tonight(g, old)!.basis, 'from the forecast of day 2, 14:00');
  assert.match(soilThen(g, 'wheat', USUAL).sub, /in 10 min if harvests are carried off, in a usual autumn$/);
  assert.match(soilThen(g, 'wheat', fresh).sub, /, from the forecast$/);
  assert.match(soilThen(g, 'wheat', old).sub, /, from the forecast of day 2, 14:00$/);
});

test('the dry time is told as one time, a range, or "may run dry from"', () => {
  const t = (dry: { from: number; to: number; always: boolean } | null, runs = 3) => ({ dry: dry && { ...dry, after: { lo: 0, hi: 0 }, short: { lo: 0, hi: 0 } }, runs }) as unknown as Parameters<typeof dryWords>[0];
  const at = (h: number) => timeOf(1, h);
  assert.deepEqual(dryWords(t(null)), { when: 'held', what: 'they last the night', bad: false });
  assert.equal(dryWords(t({ from: at(26), to: at(26), always: true })).when, '02:00');
  assert.equal(dryWords(t({ from: at(25 + 40 / 60), to: at(27 + 10 / 60), always: true })).when, '01:40–03:10');
  assert.equal(dryWords(t({ from: at(26), to: at(30), always: false })).when, 'from 02:00');
  assert.equal(dryLine(t({ from: at(25 + 40 / 60), to: at(27 + 10 / 60), always: true })), 'run dry between 01:40 and 03:10');
  assert.equal(dryLine(t({ from: at(26), to: at(30), always: false })), 'may run dry from 02:00');
  assert.equal(dryLine(t({ from: at(26), to: at(26), always: true })), 'run dry at 02:00');
});

test('the margins and lens sets stay cheap enough to recompute as the ghost moves', () => {
  const sc = CAMPAIGN[7], g = rig(sc, timeOf(3, 14), LAYOUTS[0]), reading = forecastOf(sc, g.time), t0 = Date.now();
  for (let i = 0; i < 40; i++) { tonight(g, reading); soilThen(g, 'wheat', reading); }
  assert.ok(Date.now() - t0 < 4000, `${Date.now() - t0} ms for 40 recomputations`);
  assert.ok(viewsOf(g, reading, NIGHT_MARGINS, g.time + 200).length >= 27);
  assert.ok(endOf(sc.events[0]) > 0);
  void (undefined as unknown as Forecast);
});

test('the projections follow the station: none, working, out of date, gone', () => {
  // A calm-free spring valley with a battery on the grid and a station that a turbine runs.
  const sc: Scenario = { ...SANDBOX, id: 'st', sandbox: false, width: 30, height: 30, credits: 1e6, goals: [], terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 },
    climate: { ...climateOf('spring', 'mild'), conditions: NO_CONDITIONS, warmth: { low: 15, high: 15, drift: 0 } }, events: eventOn(3, 6, 'gale', 'ordinary', 24) };
  const s = newGame(sc);
  s.map.fertility.fill(60); s.soilBase.fill(60);
  const put = (type: BuildingId, x: number, y: number) => { const r = place(s, type, x, y, 0); assert.ok(r.ok, `${type}: ${r.ok ? '' : r.error}`); return r.ok ? r.value.building : null; };
  const near = (type: BuildingId) => {
    for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const q = place(s, type, 11 + dx, 10 + dy, 0); if (q.ok) return q.value.building; }
    return assert.fail(`no room for a ${type}`);
  };
  put('pylon', 11, 10);
  near('battery'); near('solar'); near('solar');
  near('turbine');
  const label = () => tonight(s)!.basis;
  assert.equal(readingOf(s).kind, 'usual');
  assert.equal(label(), 'for a usual mild spring');
  const station = near('station');
  assert.equal(readingOf(s).kind, 'usual', 'a station that has not renewed the forecast yet tells nothing');
  advance(s, 3 * HOUR);
  assert.equal(readingOf(s).kind, 'forecast');
  assert.equal(label(), 'from the forecast');
  assert.match(soilThen(s, 'wheat', readingOf(s)).sub, /, from the forecast$/);
  assert.ok(tonight(s)!.runs > 0);
  // Cut off from the grid: it keeps the last forecast and says so.
  const issued = s.forecastIssued!;
  remove(s, s.buildings.find((b) => b.type === 'pylon')!);
  advance(s, 2 * HOUR);
  assert.equal(s.forecastIssued, issued);
  assert.ok(readingOf(s).kind === 'forecast' && (readingOf(s) as { stale: boolean }).stale);
  assert.match(soilThen(s, 'wheat', readingOf(s)).sub, /, from the forecast of day 1, /);
  // The last station gone: the forecast is gone, and the usual weather is back.
  remove(s, station);
  assert.ok(!hasStation(s));
  assert.equal(readingOf(s).kind, 'usual');
  assert.match(soilThen(s, 'wheat', readingOf(s)).sub, /, in a usual mild spring$/);
});

test('combined worst cases are kept: two severe storms in one soil projection', () => {
  const sc: Scenario = { ...steady('summer', 13, [...eventOn(2, 10, 'dustStorm', 'severe', 24), ...eventOn(3, 22, 'dustStorm', 'severe', 18)]), climate: { ...climateOf('summer', 'dry'), conditions: NO_CONDITIONS, warmth: { ...climateOf('summer').warmth, drift: 0 } } };
  const time = timeOf(2, 8), g = rig(sc, time, { charge: 1, solar: 0, turbines: 0, looms: 0 });
  const real = Number(soilThen(g, 'wheat', TRUTH).then), [lo, hi] = soilRange(soilThen(g, 'wheat', forecastOf(sc, time)));
  assert.ok(lo <= real && real <= hi, `soil ${real} is outside ${lo}–${hi}`);
});

test('a turbine in a severe gale keeps its seeded unsteadiness inside the range', () => {
  const sc = steady('autumn', 1, eventOn(2, 8, 'gale', 'severe', 30)), time = timeOf(2, 15);
  const g = rig(sc, time, { charge: 0.7, solar: 0, turbines: 4, looms: 2 });
  const real = tonight(g, TRUTH)!, told = tonight(g, forecastOf(sc, time))!;
  real.points.forEach((p, i) => assert.ok(told.points[i].lo <= p.k + 1e-9 && p.k <= told.points[i].hi + 1e-9, `step ${i}: ${p.k} is outside ${told.points[i].lo}–${told.points[i].hi}`));
});

test('the usual weather counts the cloud and the cooling of rain an event under way brings', () => {
  const sc = { ...steady('autumn', 1, eventOn(2, 8, 'softRain', 'ordinary', 24)) }, now = timeOf(2, 12);
  const dry = { ...sc, events: [] as WeatherEvent[] };
  const wet = usualView(sc, now), none = usualView(dry, now), later = now + 5 * HOUR;
  assert.ok(wet.sun(later) < none.sun(later) - 0.01, 'rain dims the sun after the hour is up');
  assert.ok(wet.warmth(later) < none.warmth(later) - 0.1, 'and cools the valley');
});

test('tonight says what a stale forecast only called possible and does not count', () => {
  const sc = steady('autumn', 3, eventOn(3, 21, 'tropicalStorm', 'severe', 30)), time = timeOf(3, 15);
  const old: Reading = { kind: 'forecast', forecast: forecastAt(sc, timeOf(1, 12)), stale: true };
  const t = tonight(rig(sc, time, { charge: 0.7, solar: 1, turbines: 2, looms: 2 }), old)!;
  assert.match(t.notCounted, /a possible storm on day 3 is not counted/);
});
