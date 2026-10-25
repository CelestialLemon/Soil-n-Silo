import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DAY_SECONDS } from '../src/game/data.ts';
import { allowed, endOf, EVENT_KINDS, EVENTS, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { CAMPAIGN } from '../src/game/scenarios.ts';
import { dayAt, hourAt } from '../src/game/sim/clock.ts';
import { eventWords, stationWords } from '../src/game/eventwords.ts';
import { randomScenario, SANDBOX } from '../src/game/scenarios.ts';

// The campaign's weather is placed by hand (2.10): each commission has the events that teach what it means to, none on the first day,
// none that overlap, and never the late frost, the blizzard or the hurricane, which are left for random commissions.

const HOUR = DAY_SECONDS / 24;
const byId = (id: string) => CAMPAIGN.find((c) => c.id === id)!;

/** What each commission places: the event, its strength, and the day and hour it begins (the flood after c8's storm comes with it). */
const PLACED: Record<string, [EventKind, Strength, number, number][]> = {
  c1: [['softRain', 'ordinary', 2, 6]],
  c2: [['thunderstorm', 'ordinary', 5, 9]],
  c3: [['gale', 'severe', 7, 8]],
  c4: [['heatWave', 'ordinary', 4, 8]],
  c5: [['coldSnap', 'ordinary', 3, 18], ['warmSpell', 'ordinary', 7, 8]],
  c6: [['dustStorm', 'ordinary', 4, 9]],
  c7: [['flood', 'ordinary', 6, 8]],
  c8: [['tropicalStorm', 'ordinary', 3, 8], ['fog', 'ordinary', 7, 4]],
};

const startsOf = (events: WeatherEvent[]) => events.map((e) => ({ kind: e.kind, strength: e.strength, day: dayAt(e.start), hour: hourAt(e.start) }));

test('every campaign commission has the events placed for it, where they were placed', () => {
  assert.deepEqual(Object.keys(PLACED), CAMPAIGN.map((c) => c.id));
  for (const sc of CAMPAIGN) {
    // The flood after c8's storm starts when the storm ends, so it is checked by that, not by a day and hour.
    const got = startsOf(sc.events.filter((e, i) => !(i > 0 && sc.events[i - 1].kind === 'tropicalStorm')));
    assert.deepEqual(got.map((e) => [e.kind, e.strength, e.day, e.hour]), PLACED[sc.id], sc.id);
  }
  const storm = byId('c8').events;
  assert.deepEqual(storm.map((e) => e.kind), ['tropicalStorm', 'flood', 'fog']);
  assert.equal(storm[1].start, endOf(storm[0]), 'the flood follows its storm at once');
});

test('campaign events come in their commission\'s season, after the first day, one at a time and inside its target time', () => {
  for (const sc of CAMPAIGN) {
    let last = -Infinity;
    for (const e of sc.events) {
      assert.ok(dayAt(e.start) >= 2, `${sc.id}: ${e.kind} on day ${dayAt(e.start)}`);
      // A flood after a storm is not rolled for its own season (a tropical storm brings it), but every other event is allowed here.
      if (!(e.kind === 'flood' && sc.events.some((x) => EVENTS[x.kind].then === 'flood'))) assert.ok(allowed(e.kind, sc.climate), `${sc.id}: ${e.kind} in ${sc.climate.season} ${sc.climate.character}`);
      assert.ok(e.start >= last, `${sc.id}: ${e.kind} overlaps the one before`);
      assert.ok(e.start - last >= 12 * HOUR || e.start === last, `${sc.id}: ${e.kind} follows the last with less than half a day clear`);
      assert.ok(endOf(e) <= sc.par, `${sc.id}: ${e.kind} ends after the target time`);
      last = endOf(e);
    }
  }
});

test('the late frost, the blizzard and the hurricane stay out of the campaign', () => {
  for (const sc of CAMPAIGN) for (const e of sc.events) {
    assert.ok(e.kind !== 'lateFrost' && e.kind !== 'blizzard', `${sc.id}: ${e.kind}`);
    assert.ok(!(e.kind === 'tropicalStorm' && e.strength === 'severe'), `${sc.id}: a hurricane`);
  }
});

test('every kind of event is somewhere in the campaign but the ones left out', () => {
  const seen = new Set(CAMPAIGN.flatMap((c) => c.events.map((e) => e.kind)));
  const left = new Set<EventKind>(['lateFrost', 'blizzard', 'steadyBreeze']);
  for (const k of EVENT_KINDS) assert.ok(seen.has(k) || left.has(k), `${k} is not in the campaign`);
});

test('Windy Ridge\'s gale is the severe one: a mild gale stops no turbine, so it teaches no shelter', () => {
  const [gale] = byId('c3').events;
  assert.equal(gale.kind, 'gale');
  assert.equal(gale.strength, 'severe');
  assert.ok(EVENTS.gale.push.severe?.gale);
});

test('the briefing letter names the events a campaign commission will bring, and a random one those the season can', () => {
  const words = (id: string) => eventWords(byId(id)).join(' ');
  assert.equal(words('c1'), 'Kinder turns it can take: a soft rain.');
  assert.equal(words('c2'), 'Weather to watch for this season: a thunderstorm.');
  assert.equal(words('c3'), 'Weather to watch for this season: a gale.');
  assert.equal(words('c4'), 'Weather to watch for this season: a heat wave.');
  assert.equal(words('c5'), 'Weather to watch for this season: a cold snap. Kinder turns it can take: a warm spell.');
  assert.equal(words('c6'), 'Weather to watch for this season: a dust storm.');
  assert.equal(words('c7'), 'Weather to watch for this season: a flood.');
  // The storm's flood is part of the storm.
  assert.equal(words('c8'), 'Weather to watch for this season: fog or a tropical storm.');
  const season = { ...byId('c1'), id: 'r1-1' };
  assert.match(eventWords(season).join(' '), /thunderstorm, a flood or a late frost/);
});

test('every briefing that names events says what a weather station gives, with its price', () => {
  for (const sc of [...CAMPAIGN, SANDBOX, randomScenario(7, 2)]) {
    assert.ok(eventWords(sc).length > 0, `${sc.id} names no events`);
    assert.deepEqual(stationWords(sc), ['A weather station (80 credits, 3 W) tells when: it gives a forecast of the next three days.'], sc.id);
  }
});
