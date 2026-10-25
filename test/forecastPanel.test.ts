import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DAY_SECONDS } from '../src/game/data.ts';
import { timeOf } from '../src/game/events.ts';
import { forecastAt } from '../src/game/outlook.ts';
import { CAMPAIGN, sandboxIn } from '../src/game/scenarios.ts';
import type { StationForecast } from '../src/game/station.ts';
import { ACTIONS, defaultBindings } from '../src/keybindings.ts';
import { degrees, eventRow, forecastView, hours, remaining, soonRows, span, stamp, staleLine, withArticle } from '../src/ui/forecastWords.ts';

const HOUR = DAY_SECONDS / 24;
const sc = CAMPAIGN.find((c) => c.id === 'c8')!; // a tropical storm on day 3 at 08:00, its flood on day 4 at 20:00, a fog on day 7
const told = (issued: number, stale = false, reason: StationForecast['reason'] = null): StationForecast => ({ forecast: forecastAt(sc, issued), issued, stale, reason });

test('times are written against the day they are read on, an end at midnight as 24:00', () => {
  const now = timeOf(3, 10);
  assert.equal(stamp(timeOf(3, 14.5), now), '14:30');
  assert.equal(stamp(timeOf(4, 6), now), 'tomorrow 06:00');
  assert.equal(stamp(timeOf(2, 22), now), 'yesterday 22:00');
  assert.equal(stamp(timeOf(6, 8), now), 'day 6 08:00');
  assert.equal(stamp(timeOf(4, 0), now, true), '24:00');
  assert.equal(span(timeOf(3, 10), timeOf(3, 22), now), '10:00–22:00');
  assert.equal(span(timeOf(4, 10), timeOf(4, 22), now), 'tomorrow 10:00–22:00');
  assert.equal(span(timeOf(3, 22), timeOf(4, 4), now), '22:00–tomorrow 04:00');
  assert.equal(span(timeOf(4, 12), timeOf(5, 0), now), 'tomorrow 12:00–24:00');
  assert.equal(span(timeOf(3, 12), timeOf(3, 12), now), '12:00');
  assert.equal(span(timeOf(4, 0), timeOf(4, 0), now), 'tomorrow 00:00');
});

test('a lower bound is told rounded down and an upper bound rounded up, so the range said holds the forecast’s', () => {
  const now = timeOf(2, 12), t = timeOf(2, 15 + 7 / 60);
  assert.equal(stamp(t, now), '15:00');
  assert.equal(stamp(t, now, true), '15:10');
  assert.equal(span(t, t, now), '15:00–15:10');
});

test('degrees, hours and names read as the panel says them', () => {
  assert.equal(degrees({ lo: -1, hi: 3 }), '−1 to 3°C');
  assert.equal(degrees({ lo: 8, hi: 8 }), '8°C');
  assert.equal(degrees({ lo: -4, hi: -2 }), '−4 to −2°C');
  assert.equal(hours({ lo: 0, hi: 0 }), 'none');
  assert.equal(hours({ lo: 0, hi: 2 }), 'up to 2 hours');
  assert.equal(hours({ lo: 2, hi: 4 }), '2 to 4 hours');
  assert.equal(hours({ lo: 12, hi: 12 }, false), '12 hours');
  assert.equal(withArticle('Gale'), 'A gale');
  assert.equal(withArticle('Early frost'), 'An early frost');
  assert.equal(withArticle('Fog'), 'Fog');
  assert.equal(withArticle('Soft rain'), 'Soft rain');
});

test('a fresh forecast lists today and the days ahead, with each event in the day it begins', () => {
  const issued = timeOf(1, 15), v = forecastView(told(issued), issued);
  assert.deepEqual(v.days.map((d) => d.name), ['Today', 'Tomorrow', 'Day 3', 'Day 4']);
  assert.equal(v.stale, null);
  const rows = v.days.flatMap((d) => d.events.map((e) => [d.day, e]));
  assert.equal(rows.length, 1, 'the flood is told with its storm, not on its own');
  const [day, e] = rows[0] as [number, (typeof v.days)[number]['events'][number]];
  assert.equal(day, 3);
  assert.equal(e.tag, 'Hard turn');
  assert.equal(e.good, false);
  assert.match(e.name, /^A tropical storm, then a flood$/);
  assert.equal(e.certainty, 'likely');
  assert.match(e.lines.join('|'), /may grow to hurricane/);
  // Day three of the forecast (day 4) has no conditions yet.
  assert.equal(v.days[3].conditions, null);
  assert.ok(v.days[0].conditions);
});

test('every range the panel prints is the forecast’s own, nothing sharper', () => {
  const issued = timeOf(2, 9), f = forecastAt(sc, issued), v = forecastView({ forecast: f, issued, stale: false, reason: null }, issued);
  for (const d of v.days) {
    const src = f.days.find((x) => x.day === d.day)!;
    assert.equal(d.high, degrees(src.warmth.high));
    assert.equal(d.low, degrees(src.warmth.low));
  }
});

test('a kind turn is told apart from a hard one by its tag as well as its colour', () => {
  const s = sandboxIn('spring');
  const kind = { ...s, events: [{ kind: 'softRain' as const, strength: 'ordinary' as const, start: timeOf(1, 20), length: 6 * HOUR }] };
  const issued = timeOf(1, 12), f = forecastAt(kind, issued), e = f.events[0];
  const row = eventRow(e, f.events, issued)!;
  assert.equal(row.good, true);
  assert.equal(row.tag, 'Kind turn');
  assert.equal(row.name, 'Soft rain');
});

test('an out-of-date forecast says why and since when, drops what is over and cuts the past from the windows', () => {
  const issued = timeOf(2, 17), now = timeOf(3, 10.5), sf = told(issued, true, 'power');
  assert.equal(staleLine(sf), 'Out of date: no power since day 2, 17:00');
  assert.equal(staleLine(told(issued)), null);
  const v = forecastView(sf, now);
  assert.equal(v.stale, 'Out of date: no power since day 2, 17:00');
  // Days before today are dropped.
  assert.deepEqual(v.days.map((d) => d.day), [3, 4, 5]);
  assert.equal(v.days[0].name, 'Today');
  // The storm may be under way now: its start window begins no earlier than now.
  const e = sf.forecast.events.find((x) => x.id === 0)!, left = remaining(e, now)!;
  assert.ok(left.start.lo >= now && left.start.hi >= now && left.end.lo >= now);
  const row = v.days[0].events[0];
  assert.match(row.lines[0], /^begins 10:30–/);
  // Long after it is over, nothing of it is left.
  const later = timeOf(8, 0);
  assert.equal(eventRow(e, sf.forecast.events, later), null);
  assert.equal(forecastView(sf, later).days.flatMap((d) => d.events).length, 0);
});

test('an event the forecast has begun is told as under way, with its end only', () => {
  const issued = timeOf(3, 12), f = forecastAt(sc, issued), e = f.events.find((x) => x.id === 0)!;
  assert.equal(e.underway, true);
  const row = eventRow(e, f.events, issued)!;
  assert.equal(row.certainty, 'under way');
  assert.match(row.when, /^until /);
  assert.ok(row.lines.every((l) => !l.startsWith('begins')));
});

test('the HUD chip hints only at what begins within the next day', () => {
  assert.equal(soonRows(forecastAt(sc, timeOf(1, 15)), timeOf(1, 15)).length, 0, 'the storm is two days off');
  const issued = timeOf(2, 10), rows = soonRows(forecastAt(sc, issued), issued);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].good, false);
});

test('the HUD chip keeps an upcoming flood while its storm is under way', () => {
  const issued = timeOf(4, 12), f = forecastAt(sc, issued);
  assert.equal(f.events.find((e) => e.id === 0)?.underway, true);
  const rows = soonRows(f, issued);
  assert.equal(rows.length, 1);
  assert.match(rows[0].name, /then a flood/);
});

test('a storm and its flood are one window, to the flood’s end; an event of an old forecast whose days ran out is still told', () => {
  const issued = timeOf(4, 12), f = forecastAt(sc, issued), e = f.events.find((x) => x.id === 0)!;
  const row = eventRow(e, f.events, issued)!, flood = f.events.find((x) => x.id === 1)!;
  assert.equal(row.when, `until ${stamp(flood.end.hi, issued, true)}`);
  assert.ok(row.lines.some((l) => l.startsWith('the storm ends')));
  // Read days later, the flood has begun as far as the forecast says: it is told in today's column, and with no column left it is still told.
  const old = { forecast: forecastAt(sc, timeOf(3, 12)), issued: timeOf(3, 12), stale: true, reason: 'power' as const };
  const later = forecastView(old, timeOf(5, 1));
  assert.equal(later.days[0].name, 'Today');
  assert.equal(later.days[0].events.length, 1);
  assert.equal(later.rest.length, 0);
  const bare = forecastView({ ...old, forecast: { ...old.forecast, days: [] } }, timeOf(5, 1));
  assert.equal(bare.days.length, 0);
  assert.equal(bare.rest.length, 1);
});

test('the forecast has a key of its own in the panels group', () => {
  const a = ACTIONS.find((x) => x.id === 'forecast')!;
  assert.equal(a.group, 'panels');
  assert.equal(defaultBindings().forecast.length, 1);
});
