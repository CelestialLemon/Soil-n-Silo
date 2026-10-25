import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DAY_SECONDS } from '../src/game/data.ts';
import { clearWeather, endOf, eventOn, EVENT_KINDS, EVENTS, startEvent, timeOf, type WeatherEvent } from '../src/game/events.ts';
import {
  bandOf, cornersOf, cornerWorlds, dayTruth, FAMILIES, FAMILY_IDS, familyOf, forecastAt, FORECAST_HOURS, issueTimeOf, kindsOf, nameOf, RAIN_BANDS, strengthsOf, SUN_BANDS, WIND_BANDS, wordsFor,
  type EventForecast, type Forecast, type Range,
} from '../src/game/outlook.ts';
import { CAMPAIGN, randomScenario, SANDBOX, sandboxIn, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, SEASON_IDS } from '../src/game/seasons.ts';
import { hourAt, sunAt, windAt } from '../src/game/sim/clock.ts';
import { precipAt } from '../src/game/sim/weather.ts';
import { newGame } from '../src/game/state.ts';
import { warmthOf } from '../src/game/warmth.ts';

const HOUR = DAY_SECONDS / 24;
const SLACK = 1e-6;
/** Strictly: the truth is inside, to the last digit. */
const has = (r: Range, v: number) => r.lo <= v && v <= r.hi;
const rank = { family: 0, kind: 1, full: 2 } as const;

/** Whether `a` lies inside `b`. */
const nested = (a: Range, b: Range) => a.lo >= b.lo - SLACK && a.hi <= b.hi + SLACK;
/** The event a forecast entry is about, in the scenario. */
const truthOf = (sc: Scenario, e: EventForecast) => sc.events[e.id];

/** What the forecast must name at `t0`: every event not yet ended that is under way or begins within three days, and a flood once its storm is named. */
function checkHonest(sc: Scenario, f: Forecast, t0: number, label: string) {
  assert.equal(f.issued, t0);
  assert.equal(f.until, t0 + FORECAST_HOURS * HOUR);
  const ids = new Set(f.events.map((e) => e.id));
  assert.equal(ids.size, f.events.length, `${label}: an event is named twice`);
  sc.events.forEach((ev, i) => {
    const entry = f.events.find((e) => e.id === i);
    if (endOf(ev) <= t0) return assert.ok(!entry, `${label}: event ${i} is over but still named`);
    const underway = ev.start <= t0, lead = (ev.start - t0) / HOUR;
    const pred = sc.events.findIndex((p, j) => j !== i && EVENTS[p.kind].then === ev.kind && p.strength === ev.strength && Math.abs(endOf(p) - ev.start) < 1e-6);
    if (underway || pred < 0 || endOf(sc.events[pred]) <= t0) {
      const should = underway || lead <= FORECAST_HOURS;
      return assert.equal(!!entry, should, `${label}: event ${i} (${ev.kind}) ${should ? 'should be named' : 'is named too early'} (lead ${lead})`);
    }
    const stormEntry = f.events.find((e) => e.id === pred);
    assert.equal(!!entry, !!stormEntry && stormEntry.detail !== 'family', `${label}: flood ${i} is named when its storm's kind is`);
  });
  for (const e of f.events) {
    const ev = truthOf(sc, e), name = `${label}: event ${e.id} (${ev.kind})`;
    assert.ok(has(e.start, ev.start), `${name}: start ${JSON.stringify(e.start)} misses ${ev.start}`);
    assert.ok(has(e.end, endOf(ev)), `${name}: end ${JSON.stringify(e.end)} misses ${endOf(ev)}`);
    assert.ok(has(e.length, ev.length), `${name}: length ${JSON.stringify(e.length)} misses ${ev.length}`);
    assert.ok(e.possible.some((p) => p.kind === ev.kind && p.strength === ev.strength), `${name}: the truth is ruled out`);
    assert.ok(e.start.lo <= e.start.hi && e.end.lo <= e.end.hi && e.length.lo <= e.length.hi, `${name}: an empty range`);
    assert.equal(e.underway, ev.start <= t0);
    if (e.underway) assert.deepEqual(e.start, { lo: ev.start, hi: ev.start }, `${name}: start is known`);
    else assert.ok(e.start.lo >= t0 - SLACK, `${name}: it has not begun, but the window starts before now`);
    assert.ok(e.end.lo >= t0 - SLACK, `${name}: it has not ended`);
    const lead = (ev.start - t0) / HOUR;
    if (!e.underway && e.after === null) assert.equal(e.detail, lead > 48 ? 'family' : lead > 24 ? 'kind' : 'full', `${name}: detail at lead ${lead}`);
    assert.equal(e.certainty, e.underway ? 'certain' : e.detail === 'family' ? 'possible' : 'likely');
    assert.equal(e.good, !!EVENTS[ev.kind].good);
    assert.equal(e.family, familyOf(ev.kind));
    for (const p of e.possible) assert.equal(familyOf(p.kind), e.family, `${name}: a kind of another family`);
    if (e.detail === 'full') assert.equal(e.possible.length, 1);
    if (e.detail !== 'family') assert.deepEqual(kindsOf(e), [ev.kind]);
    if (e.after !== null) {
      const storm = f.events.find((s) => s.id === e.after)!;
      assert.deepEqual(e.start, { lo: Math.min(storm.end.lo, ev.start), hi: Math.max(storm.end.hi, ev.start) }, `${name}: a flood begins where its storm ends`);
      assert.ok(strengthsOf(e).every((s) => strengthsOf(storm).includes(s)), `${name}: strengths of a flood are its storm's`);
    }
    // The corners are events that can be run, and the truth lies between them.
    const cornerEvents = cornersOf(e), corners = cornerEvents.filter((c) => c.kind === ev.kind && c.strength === ev.strength);
    assert.ok(corners.length > 0);
    assert.ok(Math.min(...corners.map((c) => c.start)) <= ev.start + SLACK && Math.max(...corners.map((c) => c.start)) >= ev.start - SLACK, `${name}: corner starts`);
    assert.ok(Math.min(...corners.map((c) => c.length)) <= ev.length + SLACK && Math.max(...corners.map((c) => c.length)) >= ev.length - SLACK, `${name}: corner lengths`);
    assert.ok(Math.min(...corners.map(endOf)) <= endOf(ev) + SLACK && Math.max(...corners.map(endOf)) >= endOf(ev) - SLACK, `${name}: corner ends`);
    // A result monotone in the start and the end, whichever way each goes, is bracketed by the corners.
    for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const at = (c: WeatherEvent) => a * c.start + b * endOf(c), v = at(ev);
      assert.ok(Math.min(...corners.map(at)) <= v + SLACK && Math.max(...corners.map(at)) >= v - SLACK, `${name}: corners bracket ${a}·start + ${b}·end`);
    }
    // Every corner is an event the forecast allows: inside its windows and lengths.
    for (const c of cornerEvents) {
      assert.ok(has({ lo: e.start.lo - SLACK, hi: e.start.hi + SLACK }, c.start) && has({ lo: e.end.lo - SLACK, hi: e.end.hi + SLACK }, endOf(c)) && has({ lo: e.length.lo - SLACK, hi: e.length.hi + SLACK }, c.length), `${name}: a corner outside the forecast`);
      assert.ok(c.length >= 0);
    }
  }
  // The days: their numbers hold what happens.
  const first = f.days[0].day;
  f.days.forEach((d, k) => {
    assert.equal(d.day, first + k);
    const t = dayTruth(sc, d.day), name = `${label}: day ${d.day}`, lead = Math.max(0, (timeOf(d.day, 12) - t0) / HOUR);
    assert.ok(lead <= FORECAST_HOURS + SLACK);
    assert.ok(has(d.warmth.low, t.low) && has(d.warmth.high, t.high), `${name}: warmth ${JSON.stringify(d.warmth)} misses ${t.low}, ${t.high}`);
    assert.equal(d.conditions === null, lead > 48, `${name}: conditions at lead ${lead}`);
    if (d.conditions) {
      const c = d.conditions;
      assert.ok(has(c.sun, t.sun) && has(c.wind, t.wind) && has(c.gust, t.gust) && has(c.rain, t.rain), `${name}: conditions ${JSON.stringify(c)} miss ${JSON.stringify(t)}`);
      assert.ok(c.sun.lo >= 0 && c.sun.hi <= 1 && c.wind.hi <= 1 && c.gust.hi <= 1 && c.rain.lo >= 0 && c.rain.hi <= 24);
      // The words the numbers give include the truth's.
      for (const [bands, r, v] of [[SUN_BANDS, c.sun, t.sun], [WIND_BANDS, c.wind, t.wind], [RAIN_BANDS, c.rain, t.rain]] as const) {
        assert.ok(bandOf(bands, r.lo) <= bandOf(bands, v) && bandOf(bands, v) <= bandOf(bands, r.hi), `${name}: words`);
        assert.ok(wordsFor(bands, r).includes(bands[bandOf(bands, r.lo)][1]));
      }
    }
  });
}

/** Each range is inside the one an hour before; nothing named is dropped before it is over; the names only get sharper. */
function checkNarrowing(sc: Scenario, prev: Forecast, f: Forecast, label: string) {
  for (const p of prev.events) {
    const e = f.events.find((x) => x.id === p.id), name = `${label}: event ${p.id} (${sc.events[p.id].kind})`;
    if (endOf(sc.events[p.id]) <= f.issued) { assert.ok(!e); continue; }
    assert.ok(e, `${name}: dropped before it is over`);
    assert.ok(nested(e.start, p.start), `${name}: start ${JSON.stringify(e.start)} not inside ${JSON.stringify(p.start)}`);
    assert.ok(nested(e.end, p.end), `${name}: end ${JSON.stringify(e.end)} not inside ${JSON.stringify(p.end)}`);
    assert.ok(nested(e.length, p.length), `${name}: length ${JSON.stringify(e.length)} not inside ${JSON.stringify(p.length)}`);
    assert.ok(e.possible.every((q) => p.possible.some((r) => r.kind === q.kind && r.strength === q.strength)), `${name}: something ruled out came back`);
    assert.ok(rank[e.detail] >= rank[p.detail], `${name}: the name got vaguer`);
    // A flood is told as part of its storm until the storm is over.
    assert.ok(e.after === p.after || (e.after === null && endOf(sc.events[p.after!]) <= f.issued), `${name}: after`);
  }
  for (const d of f.days) {
    const p = prev.days.find((x) => x.day === d.day);
    if (!p) continue;
    const name = `${label}: day ${d.day}`;
    assert.ok(nested(d.warmth.low, p.warmth.low) && nested(d.warmth.high, p.warmth.high), `${name}: warmth`);
    if (p.conditions) {
      assert.ok(d.conditions, `${name}: conditions dropped`);
      for (const k of ['sun', 'wind', 'gust', 'rain'] as const) assert.ok(nested(d.conditions[k], p.conditions[k]), `${name}: ${k}`);
    }
  }
}

/** Every hour of a run's weather (to two hours past its last event). */
function walk(sc: Scenario, label: string) {
  const last = Math.max(0, ...sc.events.map(endOf)), until = last + 3 * HOUR;
  let prev: Forecast | null = null;
  for (let t = 0; t <= until; t += HOUR) {
    const f = forecastAt(sc, t);
    checkHonest(sc, f, t, `${label} @${t / HOUR}h`);
    if (prev) checkNarrowing(sc, prev, f, `${label} @${t / HOUR}h`);
    prev = f;
  }
}

test('every campaign commission: at every hour the forecast holds what happens, and only narrows', () => {
  for (const sc of CAMPAIGN) walk(sc, sc.id);
});

test('random commissions at each difficulty: at every hour the forecast holds what happens, and only narrows', () => {
  for (const difficulty of [1, 2, 3] as const) for (let seed = 1; seed <= 40; seed++) walk(randomScenario(seed * 7919, difficulty), `r${seed * 7919}-${difficulty}`);
});

test('every season and character: the days hold what happens', () => {
  for (const season of SEASON_IDS) {
    const sc: Scenario = { ...SANDBOX, climate: climateOf(season), events: [] };
    for (let t = 0; t <= 96 * HOUR; t += HOUR) checkHonest(sc, forecastAt(sc, t), t, season);
  }
});

test('the forecast is the same every time for a scenario and an hour', () => {
  for (const sc of [CAMPAIGN[7], CAMPAIGN[4], randomScenario(31, 3)]) {
    const t = 30 * HOUR, a = forecastAt(sc, t);
    forecastAt(sc, 5 * HOUR); forecastAt(sc, 70 * HOUR);
    assert.deepEqual(forecastAt(sc, t), a);
    assert.deepEqual(forecastAt(structuredClone(sc), t), a);
  }
});

test('the forecast has no more in it than the ranges: moving an event within its cells changes nothing', () => {
  const spring = climateOf('spring', 'dry');
  const mk = (hour: number): Scenario => ({ ...SANDBOX, climate: spring, events: eventOn(8, hour, 'lateFrost', 'ordinary', 8.5) });
  // Three days ahead, less an hour: only the family and a day, so half an hour either way is not told.
  const a = forecastAt(mk(21), timeOf(5, 22)), b = forecastAt(mk(21.5), timeOf(5, 22));
  assert.equal(a.events.length, 1);
  assert.deepEqual(a, b);
});

test('the sharpness steps at 72, 48 and 24 hours', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'gales'), events: eventOn(8, 8, 'gale', 'severe') };
  const start = sc.events[0].start;
  const at = (lead: number) => forecastAt(sc, start - lead * HOUR).events[0];
  assert.equal(forecastAt(sc, start - 73 * HOUR).events.length, 0, 'beyond three days nothing is told');
  assert.equal(at(72).detail, 'family');
  assert.equal(at(49).detail, 'family');
  assert.equal(at(48).detail, 'kind');
  assert.equal(at(25).detail, 'kind');
  assert.equal(at(24).detail, 'full');
  assert.equal(at(1).detail, 'full');
  assert.ok(at(72).possible.length > 1 && kindsOf(at(72)).includes('gale'));
  assert.deepEqual(kindsOf(at(48)), ['gale']);
  assert.deepEqual(strengthsOf(at(48)), ['ordinary', 'severe']);
  assert.deepEqual(strengthsOf(at(24)), ['severe']);
  assert.equal(nameOf(at(72)), FAMILIES.storm.name);
  assert.equal(nameOf(at(30)), 'Gale');
  assert.equal(nameOf(at(10)), 'Severe gale');
  // A day, half a day, four hours, two hours: no wider than their cell, and a cell of the clock.
  const width = (lead: number) => { const r = at(lead).start; return (r.hi - r.lo) / HOUR; };
  assert.ok(width(72) <= 24 && width(30) <= 12 && width(20) <= 4 && width(5) <= 2);
  assert.ok(width(72) > 12 && width(30) > 4);
  assert.equal(at(72).certainty, 'possible');
  assert.equal(at(30).certainty, 'likely');
});

test('an event under way is told by its end, and its end narrows to the hour it comes', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'gales'), events: eventOn(4, 10, 'gale') };
  const [e] = sc.events, end = endOf(e);
  const at = (hours: number) => forecastAt(sc, end - hours * HOUR).events[0];
  assert.ok(at(12).underway && at(12).start.lo === e.start && at(12).start.hi === e.start);
  assert.ok(at(1).end.hi - at(1).end.lo <= 2 * HOUR + SLACK, 'within two hours of the end: a two-hour cell');
  assert.ok(at(12).end.hi - at(12).end.lo <= 4 * HOUR + SLACK);
  assert.ok(has(at(1).end, end));
  assert.equal(forecastAt(sc, end).events.length, 0, 'over');
});

test('a flood after its storm is told once the storm is named, and begins where the storm ends', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'stormy'), events: eventOn(5, 8, 'tropicalStorm', 'ordinary', undefined, 'autumn') };
  assert.equal(sc.events.length, 2);
  const start = sc.events[0].start, at = (lead: number) => forecastAt(sc, start - lead * HOUR);
  assert.deepEqual(at(60).events.map((e) => e.id), [0], 'a storm is only "possible": no flood yet');
  assert.equal(at(60).events[0].detail, 'family');
  const named = at(40).events;
  assert.deepEqual(named.map((e) => e.id), [0, 1]);
  assert.equal(named[1].after, 0);
  assert.deepEqual(named[1].start, named[0].end);
  assert.deepEqual(kindsOf(named[1]), ['flood']);
  assert.deepEqual(strengthsOf(named[1]), ['ordinary', 'severe'], 'a hurricane may still be what it is');
  assert.deepEqual(strengthsOf(at(10).events[1]), ['ordinary']);
  // A flood that stands alone (a spring flood of the river) is not part of anything.
  const alone: Scenario = { ...SANDBOX, climate: climateOf('spring', 'highRiver'), events: eventOn(6, 8, 'flood') };
  assert.equal(forecastAt(alone, alone.events[0].start - 60 * HOUR).events[0].after, null);
});

test('the corner worlds lay a flood after its storm', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'stormy'), events: eventOn(5, 8, 'tropicalStorm', 'ordinary', undefined, 'autumn') };
  const f = forecastAt(sc, sc.events[0].start - 40 * HOUR), storm = f.events[0];
  const worlds = cornerWorlds(f, storm);
  assert.ok(worlds.length >= 8);
  for (const w of worlds) {
    assert.deepEqual(w.map((e) => e.kind), ['tropicalStorm', 'flood']);
    assert.equal(w[1].start, endOf(w[0]));
    assert.equal(w[1].strength, w[0].strength);
  }
  // Every world satisfies what the forecast says, a flood's end inside its own window too.
  for (const w of worlds) {
    assert.ok(has({ lo: f.events[1].end.lo - SLACK, hi: f.events[1].end.hi + SLACK }, endOf(w[1])), 'a flood ends inside its window');
    assert.ok(has({ lo: storm.end.lo - SLACK, hi: storm.end.hi + SLACK }, endOf(w[0])));
  }
  assert.ok(Math.min(...worlds.map((w) => w[0].start)) <= sc.events[0].start && Math.max(...worlds.map((w) => w[0].start)) >= sc.events[0].start);
  assert.ok(Math.min(...worlds.map((w) => endOf(w[1]))) <= endOf(sc.events[1]) && Math.max(...worlds.map((w) => endOf(w[1]))) >= endOf(sc.events[1]));
  // Once the storm has begun, its start is one value; a lone event has just its own corners.
  const later = forecastAt(sc, sc.events[0].start + 5 * HOUR);
  assert.ok(cornerWorlds(later, later.events[0]).every((w) => w.length === 2 && w[0].start === sc.events[0].start));
  const gale: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'gales'), events: eventOn(5, 8, 'gale') };
  assert.ok(cornerWorlds(forecastAt(gale, gale.events[0].start - 10 * HOUR), forecastAt(gale, gale.events[0].start - 10 * HOUR).events[0]).every((w) => w.length === 1));
});

test('good events are named too, and a family is all good or all bad', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('spring', 'wet'), events: eventOn(5, 6, 'softRain') };
  const e = forecastAt(sc, sc.events[0].start - 50 * HOUR).events[0];
  assert.ok(e.good && e.detail === 'family' && e.family === 'fair');
  assert.deepEqual(strengthsOf(e), ['ordinary'], 'a good event is never severe');
  for (const f of FAMILY_IDS) assert.equal(new Set(FAMILIES[f].kinds.map((k) => !!EVENTS[k].good)).size, 1, `${f}`);
  for (const k of EVENT_KINDS) assert.equal(FAMILY_IDS.filter((f) => FAMILIES[f].kinds.includes(k)).length, 1, `${k} is in one family`);
});

test('the family names only what the season allows, and each kind keeps its length', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'stormy'), events: eventOn(5, 8, 'tropicalStorm') };
  const e = forecastAt(sc, sc.events[0].start - 70 * HOUR).events[0];
  assert.deepEqual(kindsOf(e).sort(), ['gale', 'tropicalStorm'], 'no thunderstorm in autumn');
  assert.ok(e.length.lo >= 20 * HOUR && e.length.hi <= 48 * HOUR);
  const summer: Scenario = { ...SANDBOX, climate: climateOf('summer', 'stormy'), events: eventOn(5, 8, 'tropicalStorm') };
  assert.deepEqual(kindsOf(forecastAt(summer, summer.events[0].start - 70 * HOUR).events[0]).sort(), ['thunderstorm', 'tropicalStorm']);
});

test('the sandbox has no events ahead; one started by hand is under way, and renews at once', () => {
  const s = newGame(sandboxIn('autumn', 'gales'));
  s.time = 13.5 * HOUR;
  assert.deepEqual(forecastAt(s.scenario, issueTimeOf(s.time)).events, []);
  const before = forecastAt(s.scenario, issueTimeOf(s.time));
  assert.ok(startEvent(s, 'gale', 'severe').ok);
  // Renewed now (not at the last whole hour): the gale is under way, not "coming within the hour".
  const now = forecastAt(s.scenario, s.time);
  const gale = now.events.find((e) => s.scenario.events[e.id].kind === 'gale')!;
  assert.ok(gale.underway && gale.detail === 'full' && gale.start.lo === s.time);
  assert.deepEqual(before.events, []);
  assert.ok(now.events.every((e) => e.underway), 'nothing started by hand is forecast ahead');
  clearWeather(s);
  assert.ok(forecastAt(s.scenario, s.time + 3 * HOUR).events.length === 0, 'cleared');
});

test('a storm started by hand in the sandbox is told with the flood that follows it, and nothing else', () => {
  const s = newGame(sandboxIn('autumn', 'stormy'));
  s.time = 20 * HOUR;
  assert.ok(startEvent(s, 'tropicalStorm').ok);
  const f = forecastAt(s.scenario, s.time);
  assert.equal(f.events.length, 2);
  assert.ok(f.events[0].underway && !f.events[1].underway && f.events[1].after === f.events[0].id);
  assert.deepEqual(f.events[1].start, f.events[0].end);
});

test('events with the same windows come in the same order, whichever starts first', () => {
  const gale = (start: number): WeatherEvent => ({ kind: 'gale', strength: 'ordinary', start, length: 24 * HOUR });
  const mk = (a: number, b: number): Scenario => ({ ...SANDBOX, climate: climateOf('autumn', 'gales'), events: [gale(a), gale(b)] });
  const one = forecastAt(mk(61 * HOUR + 1, 61 * HOUR + 6), 0), two = forecastAt(mk(61 * HOUR + 6, 61 * HOUR + 1), 0);
  assert.deepEqual(one.events.map((e) => e.id), [0, 1]);
  assert.deepEqual(one, two, 'the forecast cannot say which comes first');
});

test('a length the catalogue does not give is not told exactly, and fractions of a second stay inside', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'gales'), events: [{ kind: 'gale', strength: 'ordinary', start: 70 * HOUR + 0.2, length: 3 * HOUR }] };
  const e = forecastAt(sc, 0).events[0];
  assert.ok(e.length.lo < 3 * HOUR && e.length.hi > 3 * HOUR && e.length.lo !== 3 * HOUR);
  walk({ ...sc, events: [{ kind: 'gale', strength: 'ordinary', start: 100.2, length: 30.1 }] }, 'fractions');
});

test('a flood a hair after its storm is a flood of its own, and stays told from hour to hour', () => {
  const storm = eventOn(5, 8, 'tropicalStorm', 'ordinary', 36, 'autumn')[0];
  const flood: WeatherEvent = { kind: 'flood', strength: 'ordinary', start: endOf(storm) + 0.01, length: 36 * HOUR };
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'stormy'), events: [storm, flood] };
  walk(sc, 'adjacent');
  assert.equal(forecastAt(sc, endOf(storm) - 40 * HOUR).events.find((e) => e.id === 1)?.after ?? null, null);
});

test('the days hold what an independent count of the weather gives', () => {
  for (const sc of [CAMPAIGN[0], CAMPAIGN[4], CAMPAIGN[7], randomScenario(77, 3)]) {
    const g = newGame(sc);
    for (const day of [1, 2, 4]) {
      const hours: number[] = [];
      for (let h = 0; h < 24; h++) { const t = timeOf(day, h + 0.5); if (t >= 0) hours.push(t); }
      assert.equal(hours.length, day === 1 ? 17 : 24, 'day 1 begins at 07:00');
      const warm = hours.map((t) => warmthOf(g, t)), wind = hours.map((t) => windAt(sc, t));
      const sun = sc.climate.sun, clear = hours.reduce((n, t) => { const h = hourAt(t); return h > sun.rise && h < sun.set ? n + sun.strength * Math.sin(Math.PI * (h - sun.rise) / (sun.set - sun.rise)) : n; }, 0);
      const t = dayTruth(sc, day);
      assert.equal(t.low, Math.min(...warm));
      assert.equal(t.high, Math.max(...warm));
      assert.ok(Math.abs(t.wind - wind.reduce((a, b) => a + b, 0) / hours.length) < 1e-9);
      assert.equal(t.gust, Math.max(...wind));
      assert.equal(t.rain, hours.filter((x) => precipAt(sc, x) > 0).length);
      assert.ok(Math.abs(t.sun - hours.reduce((n, x) => n + sunAt(sc, x), 0) / clear) < 1e-9);
    }
  }
});

test('several floods after one storm are each laid after the storm', () => {
  const storm: WeatherEvent = { kind: 'tropicalStorm', strength: 'ordinary', start: 30 * HOUR, length: 30 * HOUR };
  const flood = (length: number): WeatherEvent => ({ kind: 'flood', strength: 'ordinary', start: 60 * HOUR, length: length * HOUR });
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'stormy'), events: [storm, flood(30), flood(40)] };
  const named = forecastAt(sc, 10 * HOUR);
  assert.equal(named.events.length, 3);
  assert.deepEqual(named.events.map((e) => e.after), [null, 0, 0]);
  for (const w of cornerWorlds(named, named.events[0])) {
    assert.ok(w.length === 3 && w[1].start === endOf(w[0]) && w[2].start === endOf(w[0]) && w[1].length > 0 && w[2].length > 0, JSON.stringify(w));
  }
});

test('a hand-authored length longer than its kind lasts is still bracketed by the corners', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'gales'), events: [{ kind: 'gale', strength: 'ordinary', start: 65 * HOUR, length: 40 * HOUR }] };
  walk(sc, 'long gale');
  walk({ ...sc, events: [{ kind: 'gale', strength: 'ordinary', start: 650, length: 1.234 }] }, 'tiny gale');
  assert.notEqual(forecastAt({ ...sc, events: [{ kind: 'gale', strength: 'ordinary', start: 650, length: 1.234 }] }, 0).events[0].length.lo, 1.234);
});

test('issue times are whole game hours', () => {
  assert.equal(issueTimeOf(0), 0);
  assert.equal(issueTimeOf(HOUR - 0.01), 0);
  assert.equal(issueTimeOf(HOUR), HOUR);
  assert.equal(issueTimeOf(7.5 * HOUR), 7 * HOUR);
});

test('the days start from the day in progress and reach three days ahead', () => {
  const sc = CAMPAIGN[0];
  for (let h = 0; h < 72; h++) {
    const f = forecastAt(sc, h * HOUR);
    assert.ok(f.days.length === 3 || f.days.length === 4, `${h} h: ${f.days.length} days`);
    assert.equal(f.days[0].day, Math.floor((h + 7) / 24) + 1);
  }
  // Day 1 begins at the start hour: only its hours from then are counted.
  const t = dayTruth(sc, 1);
  assert.ok(Number.isFinite(t.low) && t.sun > 0);
});

test('a hand-placed event with a length the catalogue does not give is still held', () => {
  const sc: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'gales'), events: eventOn(5, 8, 'gale', 'ordinary', 3) };
  walk(sc, 'short gale');
  const long: Scenario = { ...SANDBOX, climate: climateOf('autumn', 'gales'), events: eventOn(5, 8, 'fog', 'severe', 30) };
  walk(long, 'long fog');
  const odd: WeatherEvent = { kind: 'coldSnap', strength: 'severe', start: 123.3, length: 77.7 };
  walk({ ...SANDBOX, climate: climateOf('winter'), events: [odd] }, 'odd');
});
