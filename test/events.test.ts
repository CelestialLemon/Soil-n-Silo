import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buyTruck, newRoute, addStop, place, setTruckRoute } from '../src/game/build.ts';
import { DAY_SECONDS, ITEMS, POWER, START_HOUR } from '../src/game/data.ts';
import {
  activeEvents, allowed, clearWeather, endOf, eventChain, eventName, eventNow, eventOn, EVENT_KINDS, EVENTS, eventsIn, eventsOf, intensityAt, lookAt, NEUTRAL, pushesAt,
  rollEvents, startEvent, STRENGTHS, timeOf, type EventKind, type Lever, type Pushes, type Strength, type WeatherEvent,
} from '../src/game/events.ts';
import { TERRAIN } from '../src/game/map.ts';
import { touchRelief } from '../src/game/state.ts';
import { wheelSite } from '../src/game/rules.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { CAMPAIGN, randomScenario, SANDBOX, sandboxIn, scenarioById, type Scenario } from '../src/game/scenarios.ts';
import { charactersOf, climateOf, SEASON_IDS } from '../src/game/seasons.ts';
import { hourAt, sunAt, windAt } from '../src/game/sim/clock.ts';
import { makes } from '../src/game/sim/energy.ts';
import { advance } from '../src/game/sim/step.ts';
import { precipAt, raining, weatherAt } from '../src/game/sim/weather.ts';
import { newGame, type GameState } from '../src/game/state.ts';
import { warmthOf } from '../src/game/warmth.ts';

const HOUR = DAY_SECONDS / 24;
const dayOf = (t: number) => Math.floor((t / HOUR + START_HOUR) / 24) + 1;

/** Runs `f` with an event kind pushing the levers, as a later issue's entry would, and puts the table back. */
function pushing<T>(kind: EventKind, strength: Strength, push: Partial<Pushes>, f: () => T): T {
  const was = EVENTS[kind].push;
  EVENTS[kind].push = { ...was, [strength]: push };
  try { return f(); } finally { EVENTS[kind].push = was; }
}

const with1 = (sc: Scenario, ...events: WeatherEvent[]): Scenario => ({ ...sc, events });
const at = (day: number, hour: number) => timeOf(day, hour);

const CLEAR = { ...SANDBOX.climate, conditions: { cloud: 0, rain: 0, calm: 0 }, warmth: { low: 15, high: 15, drift: 0 } };

/** A flat, empty test map (no water, rock or trees) in a clear spring, with the sandbox's rules, in which a test can stage events. */
function sandbox(): GameState {
  const s = newGame({ ...SANDBOX, width: 30, height: 30, terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 }, climate: CLEAR });
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  return s;
}

test('the catalogue: every kind has a season it comes in, a length, and no good event is severe', () => {
  assert.equal(EVENT_KINDS.length, 13);
  for (const k of EVENT_KINDS) {
    const e = EVENTS[k];
    assert.ok(e.hours[0] > 0 && e.hours[0] <= e.hours[1] && e.hours[1] <= 48, k);
    assert.ok(Object.keys(e.seasons).length > 0 && Object.keys(e.seasons).every((x) => SEASON_IDS.includes(x as never)), k);
    if (e.good) assert.ok(!e.severe, `${k} is good and never severe`);
    if (e.begins) assert.ok(e.begins.every((h) => h >= 0 && h < 24));
    // Whatever it pushes names a lever the rules read.
    for (const strength of STRENGTHS) for (const l of Object.keys(e.push[strength] ?? {})) assert.ok(l in NEUTRAL, `${k} pushes ${l}`);
  }
  assert.equal(eventName('tropicalStorm'), 'Tropical storm');
  assert.equal(eventName('tropicalStorm', 'severe'), 'Hurricane');
  assert.equal(eventName('gale', 'severe'), 'Severe gale');
  // The table from #84: where the special ones come.
  assert.deepEqual(eventsOf(climateOf('summer', 'dry')).filter((k) => k === 'dustStorm'), ['dustStorm']);
  assert.ok(!allowed('dustStorm', climateOf('summer', 'hot')) && !allowed('dustStorm', climateOf('summer')));
  assert.ok(allowed('blizzard', climateOf('winter', 'hard')) && !allowed('blizzard', climateOf('winter')));
  assert.ok(!allowed('heatWave', climateOf('winter')) && allowed('heatWave', climateOf('summer')));
  assert.ok(!allowed('flood', climateOf('summer')) && allowed('flood', climateOf('spring', 'highRiver')));
  // Every season can bring something hard and something kind.
  for (const season of SEASON_IDS) for (const c of [null, ...charactersOf(season)]) {
    const kinds = eventsOf(climateOf(season, c));
    assert.ok(kinds.some((k) => !EVENTS[k].good) && kinds.some((k) => EVENTS[k].good), `${season} ${c}`);
    // The bad ones are listed first.
    assert.deepEqual(kinds, [...kinds.filter((k) => !EVENTS[k].good), ...kinds.filter((k) => EVENTS[k].good)]);
  }
});

test('random events: seeded, by difficulty, never on day 1, never overlapping, half a day apart', () => {
  let severe = 0, hurricanes = 0, floods = 0;
  for (let seed = 1; seed <= 600; seed++) for (const d of [1, 2, 3] as const) {
    const sc = randomScenario(seed, d), ev = sc.events, id = `${sc.id} ${seasonLabel(sc)}`;
    assert.deepEqual(randomScenario(seed, d).events, ev, `${id} is the same every time`);
    assert.deepEqual(sc.events, rollEvents(seed, d, sc.climate, sc.par));
    // A flood follows its tropical storm, or its spring thunderstorm, at once: part of that storm, not one of the level's events.
    const followsStorm = (i: number) => ev[i].kind === 'flood' && ev[i].start === endOf(ev[i - 1] ?? ev[i]) && (ev[i - 1]?.kind === 'tropicalStorm' || (ev[i - 1]?.kind === 'thunderstorm' && sc.climate.season === 'spring'));
    const bad = ev.filter((e, i) => !EVENTS[e.kind].good && !followsStorm(i)), good = ev.filter((e) => EVENTS[e.kind].good);
    // How many: 1 bad and 1 good; 2 bad and 1 good; 2 bad and 0–1 good (fewer only where the climate allows too few kinds).
    assert.equal(bad.length, d === 1 ? 1 : 2, id);
    assert.ok(d === 3 ? good.length <= 1 : good.length === 1, id);
    for (const e of ev) {
      assert.ok(allowed(e.kind, sc.climate) || followsStorm(ev.indexOf(e)), `${id}: ${e.kind}`);
      assert.ok(dayOf(e.start) >= 2, `${id}: none on day 1`);
      assert.ok(endOf(e) <= Math.max(sc.par, timeOf(8, 0)) + 1e-9, `${id}: ${e.kind} ends within the level`);
      assert.ok(e.length > 0 && e.start % (HOUR / 2) === 0 && e.length % (HOUR / 2) === 0, 'on the half hour');
      if (e.strength === 'severe') { severe++; assert.equal(d, 3, `${id}: severe only at difficulty 3`); assert.ok(EVENTS[e.kind].severe); }
      if (e.kind === 'tropicalStorm' && e.strength === 'severe') { hurricanes++; assert.equal(sc.climate.character, 'stormy', `${id}: the hurricane is for a stormy character`); }
      const w = EVENTS[e.kind].begins;
      if (w) { const h = hourAt(e.start), span = (w[1] - w[0] + 24) % 24; assert.ok((h - w[0] + 24) % 24 <= span + 1e-9, `${id}: ${e.kind} begins at ${h}`); }
    }
    assert.ok(ev.filter((e) => e.strength === 'severe' && e.kind !== 'flood').length <= 1, `${id}: at most one severe`);
    // In order, none overlapping, half a day clear except where a flood follows its storm.
    for (let i = 1; i < ev.length; i++) {
      assert.ok(ev[i].start >= ev[i - 1].start, id);
      if (followsStorm(i)) { floods++; assert.equal(ev[i].start, endOf(ev[i - 1]), `${id}: the flood follows its storm`); assert.equal(ev[i].strength, ev[i - 1].strength); }
      else assert.ok(ev[i].start - endOf(ev[i - 1]) >= 12 * HOUR - 1e-9, `${id}: half a day clear`);
    }
  }
  assert.ok(severe > 100 && hurricanes > 3 && floods > 10, `${severe} severe, ${hurricanes} hurricanes, ${floods} floods`);
});

const seasonLabel = (sc: Scenario) => `${sc.climate.season}/${sc.climate.character}`;

test('random events: the character shifts the odds, and some kinds come only in their character', () => {
  const tally = (season: 'spring' | 'summer' | 'autumn', character: 'wet' | 'dry' | 'stormy' | 'mild', kind: EventKind) => {
    let n = 0;
    for (let seed = 1; seed <= 400; seed++) n += rollEvents(seed, 3, climateOf(season, character), 3000).filter((e) => e.kind === kind).length;
    return n;
  };
  assert.ok(tally('spring', 'stormy', 'thunderstorm') > tally('spring', 'dry', 'thunderstorm') * 1.5);
  assert.ok(tally('summer', 'dry', 'heatWave') > tally('summer', 'stormy', 'heatWave'));
  assert.ok(tally('autumn', 'stormy', 'tropicalStorm') > tally('autumn', 'mild', 'tropicalStorm'));
  assert.equal(tally('summer', 'dry', 'dustStorm') > 0, true);
  const winter = [1, 2, 3].flatMap((d) => Array.from({ length: 200 }, (_, i) => randomScenario(i, d as 1 | 2 | 3))).filter((sc) => sc.climate.season === 'winter');
  assert.ok(winter.length > 30);
  for (const sc of winter) for (const e of sc.events) {
    assert.ok(['coldSnap', 'blizzard', 'warmSpell'].includes(e.kind), e.kind);
    if (e.kind === 'blizzard') assert.equal(sc.climate.character, 'hard');
  }
});

test('events are spread over the level and fit a short one', () => {
  const sc = randomScenario(5, 1);
  const short = rollEvents(5, 3, sc.climate, 10 * 60);
  assert.ok(short.length >= 1);
  for (const e of short) assert.ok(dayOf(e.start) >= 2);
  // A long level uses its length.
  let latest = 0;
  for (let seed = 1; seed < 100; seed++) latest = Math.max(latest, ...rollEvents(seed, 2, sc.climate, 3600).map((e) => endOf(e)));
  assert.ok(latest > 3000, `${latest}`);
});

test('campaign commissions have no events yet, and a commission can be given some by hand', () => {
  for (const sc of CAMPAIGN) assert.deepEqual(sc.events, [], sc.id);
  assert.deepEqual(SANDBOX.events, []);
  const gale = eventOn(4, 10, 'gale');
  assert.deepEqual(gale, [{ kind: 'gale', strength: 'ordinary', start: (3 * 24 + 10 - START_HOUR) * HOUR, length: 24 * HOUR }]);
  assert.equal(hourAt(gale[0].start), 10);
  assert.equal(dayOf(gale[0].start), 4);
  assert.equal(eventOn(3, 9, 'heatWave', 'ordinary', 30)[0].length, 30 * HOUR);
  assert.throws(() => eventOn(2, 8, 'softRain', 'severe'), /no severe form/);
  // A tropical storm brings its flood, and a hurricane a severe one.
  const storm = eventOn(5, 8, 'tropicalStorm', 'severe', 30);
  assert.deepEqual(storm.map((e) => [e.kind, e.strength]), [['tropicalStorm', 'severe'], ['flood', 'severe']]);
  assert.equal(storm[1].start, endOf(storm[0]));
});

test('the events under way: they build in, hold and fade out, and the forecast can read those ahead', () => {
  const [e] = eventOn(3, 8, 'gale');
  const sc = with1(SANDBOX, e);
  assert.equal(activeEvents(sc, e.start - 1).length, 0);
  assert.equal(eventNow(sc, e.start - 1), null);
  assert.equal(eventNow(sc, e.start), e, 'named from the moment it starts');
  assert.equal(intensityAt(e, e.start), 0);
  assert.ok(intensityAt(e, e.start + 5 * HOUR) === 1 && intensityAt(e, e.start + 0.5 * HOUR) < 0.5);
  assert.ok(intensityAt(e, endOf(e) - 0.2 * HOUR) < 0.1);
  assert.equal(activeEvents(sc, endOf(e)).length, 0, 'over once its length has passed');
  const more = [...eventOn(3, 8, 'gale'), ...eventOn(6, 8, 'fog'), ...eventOn(9, 8, 'softRain')];
  const plan = with1(SANDBOX, ...more);
  assert.deepEqual(eventsIn(plan, 0, at(7, 0)).map((x) => x.kind), ['gale', 'fog']);
  assert.deepEqual(eventsIn(plan, at(4, 0), at(4, 1)).map((x) => x.kind), ['gale'], 'one under way counts');
  assert.deepEqual(eventsIn(plan, at(10, 12), at(11, 0)), [], 'none after the last');
});

test('the levers: an event pushes the sun, wind, cloud, rain, warmth, river and trucks, felt as strongly as it has built', () => {
  const [e] = eventOn(3, 8, 'gale');
  const sc = with1({ ...SANDBOX, climate: { ...SANDBOX.climate, conditions: { cloud: 0, rain: 0, calm: 0 } } }, e);
  const mid = e.start + 8 * HOUR, before = e.start - HOUR, none = { ...sc, events: [] };
  assert.deepEqual(pushesAt(sc, mid), pushesAt(none, mid), 'no push, no change');
  assert.deepEqual(pushesAt(sc, mid), NEUTRAL);
  const push: Partial<Pushes> = { sun: 0.4, wind: 0.5, cloud: 0.8, rain: 0.9, warmth: -6, river: 0.5, trucks: 0.5 };
  pushing('gale', 'ordinary', push, () => {
    const p = pushesAt(sc, mid);
    for (const l of Object.keys(push) as Lever[]) assert.equal(p[l], push[l], l);
    assert.deepEqual(pushesAt(sc, before), NEUTRAL, 'nothing before it starts');
    const early = pushesAt(sc, e.start + 0.6 * HOUR);
    assert.ok(early.sun > 0.4 && early.sun < 1 && early.wind > 0 && early.wind < 0.5 && early.warmth < 0 && early.warmth > -6, 'blended in');
    // The rules read them.
    const noon = at(3, 12);
    assert.ok(sunAt(sc, noon) < sunAt(none, noon) * 0.5);
    assert.ok(windAt(sc, mid) > windAt(none, mid));
    assert.ok(precipAt(sc, mid) >= 0.9 && raining(sc, mid) && !raining(none, mid), 'fields count as watered in an event\'s rain');
    assert.equal(weatherAt(sc, mid).sky, 'rain');
    assert.ok(weatherAt(sc, mid).cloud >= 0.8);
    const s = newGame(sc);
    s.time = mid;
    const s0 = newGame(none);
    s0.time = mid;
    assert.ok(warmthOf(s) < warmthOf(s0) - 4, 'the warmth curve drops');
  });
  assert.deepEqual(pushesAt(sc, mid), NEUTRAL, 'the table is put back');
  // Several events at once: multipliers multiply, additions add, floors take the highest.
  const both = with1(SANDBOX, ...eventOn(3, 8, 'gale'), ...eventOn(3, 8, 'fog', 'ordinary', 20));
  pushing('gale', 'ordinary', { sun: 0.5, wind: 0.2, cloud: 0.3 }, () => pushing('fog', 'ordinary', { sun: 0.5, wind: 0.1, cloud: 0.6 }, () => {
    const p = pushesAt(both, at(3, 14));
    assert.equal(p.sun, 0.25);
    assert.ok(Math.abs(p.wind - 0.3) < 1e-9);
    assert.equal(p.cloud, 0.6);
  }));
});

test('an event\'s push reaches the water wheel and the trucks', () => {
  // A wheel on a river.
  const s = sandbox();
  s.scenario.climate.river.flow = 1;
  for (let y = 0; y < s.map.height; y++) for (const x of [14, 15]) { const i = y * s.map.width + x; s.map.terrain[i] = TERRAIN.water; s.map.current[i] = 1; }
  touchRelief(s);
  const site = wheelSite(s, 12, 4);
  assert.ok(site);
  const placed = place(s, 'wheel', 12, 4, site.rot);
  assert.ok(placed.ok);
  const wheel = placed.value.building;
  const [e] = eventOn(1, 12, 'coldSnap');
  s.scenario.events = [e];
  s.time = e.start + 6 * HOUR;
  const full = makes(s, wheel, 0, 0);
  assert.ok(Math.abs(full - POWER.wheel) < 1e-9);
  pushing('coldSnap', 'ordinary', { river: 0.25 }, () => assert.ok(Math.abs(makes(s, wheel, 0, 0) - POWER.wheel * 0.25) < 1e-9));
  // Trucks: the same trip takes twice as long at half speed.
  const trip = (slow: boolean) => {
    const g = sandbox();
    const garage = place(g, 'garage', 2, 24, 0); assert.ok(garage.ok);
    place(g, 'pylon', 4, 24, 0); const bat = place(g, 'battery', 5, 24, 0); assert.ok(bat.ok && bat.value.building.type === 'battery'); if (bat.ok && bat.value.building.type === 'battery') bat.value.building.charge = POWER.battery.capacity;
    const field = place(g, 'field', 26, 3, 0); assert.ok(field.ok && field.value.building.type === 'field');
    if (field.ok && field.value.building.type === 'field') { field.value.building.stored = 6; field.value.building.harvest = 'wheat'; }
    const depot = g.buildings.find((b) => b.type === 'depot')!;
    const bought = buyTruck(g, garage.value.building); assert.ok(bought.ok);
    const r = newRoute(g);
    assert.ok(field.ok && addStop(g, r, field.value.building).ok && addStop(g, r, depot).ok);
    setTruckRoute(g, bought.value.truck, r);
    if (slow) g.scenario.events = [{ kind: 'coldSnap', strength: 'ordinary', start: -100 * HOUR, length: 1000 * HOUR }];
    let t = 0;
    while ((g.delivered.wheat ?? 0) < 6) { advance(g, 0.1); t += 0.1; assert.ok(t < 600, 'delivered'); }
    return t;
  };
  const normal = trip(false);
  const slowed = pushing('coldSnap', 'ordinary', { trucks: 0.5 }, () => trip(true));
  assert.ok(slowed > normal * 1.4, `${slowed} against ${normal}`);
  assert.equal(ITEMS.wheat.price > 0, true);
});

test('the sky shows an event without changing the rules: rain is drawn but no field counts as watered', () => {
  const sc = { ...SANDBOX, climate: { ...SANDBOX.climate, conditions: { cloud: 0, rain: 0, calm: 0 } } };
  const [e] = eventOn(3, 8, 'tropicalStorm'); // its effects come with 2.4
  const mid = e.start + 5 * HOUR, storm = with1(sc, e);
  assert.equal(weatherAt(sc, mid).sky, 'clear');
  const w = weatherAt(storm, mid);
  assert.equal(w.sky, 'rain');
  assert.ok(w.precip > 0.5 && w.cloud > 0.9);
  assert.equal(raining(storm, mid), false, 'effects come later');
  assert.equal(sunAt(storm, at(3, 12)), sunAt(sc, at(3, 12)));
  assert.equal(precipAt(storm, mid), 0);
  assert.ok(lookAt(storm, mid).precip > 0.5);
  // Snow in winter; the blizzard is all snow.
  const [b] = eventOn(3, 8, 'blizzard');
  const win = with1({ ...sandboxIn('winter', 'hard'), climate: { ...climateOf('winter', 'hard'), conditions: { cloud: 0, rain: 0, calm: 0 } } }, b);
  assert.equal(weatherAt(win, b.start + 8 * HOUR).sky, 'snow');
  // A severe one looks heavier.
  const [sev] = eventOn(3, 8, 'gale', 'severe'), [ord] = eventOn(3, 8, 'gale');
  assert.ok(lookAt(with1(sc, sev), sev.start + 8 * HOUR).cloud > lookAt(with1(sc, ord), ord.start + 8 * HOUR).cloud);
});

test('the sandbox starts any event at either strength, ending what was under way and dropping what was ahead', () => {
  const s = sandbox();
  s.time = at(2, 9);
  const sandboxEvents = SANDBOX.events;
  // It begins at this very moment, even between the half hours and while the game is paused.
  s.time = at(2, 9) + 3;
  assert.ok(startEvent(s, 'thunderstorm', 'ordinary').ok);
  assert.equal(eventNow(s.scenario, s.time)?.kind, 'thunderstorm');
  assert.equal(s.scenario.events[0].start, s.time);
  s.time = at(2, 9);
  const r = startEvent(s, 'thunderstorm', 'ordinary');
  assert.ok(r.ok);
  assert.equal(eventNow(s.scenario, s.time)?.kind, 'thunderstorm');
  assert.equal(SANDBOX.events, sandboxEvents);
  assert.deepEqual(SANDBOX.events, [], 'a game has its own events: the commission is left alone');
  advance(s, 40);
  const k = startEvent(s, 'tropicalStorm', 'severe');
  assert.ok(k.ok && k.value.length === 2 && k.value[1].kind === 'flood');
  assert.equal(s.scenario.events.filter((e) => e.kind === 'flood').length, 1);
  assert.equal(eventNow(s.scenario, s.time)?.strength, 'severe', 'the new one is named from the start');
  assert.equal(eventName(eventNow(s.scenario, s.time)!.kind, 'severe'), 'Hurricane');
  // The old one fades out over the ramp rather than cutting off.
  const old = s.scenario.events.find((e) => e.kind === 'thunderstorm')!;
  assert.ok(endOf(old) > s.time && endOf(old) <= s.time + 2 * HOUR);
  advance(s, 100);
  assert.equal(activeEvents(s.scenario, s.time).some((a) => a.event.kind === 'thunderstorm'), false);
  assert.ok(!startEvent(s, 'softRain', 'severe').ok);
  for (const kind of EVENT_KINDS) for (const strength of STRENGTHS) assert.equal(startEvent(s, kind, strength).ok, strength === 'ordinary' || !!EVENTS[kind].severe, `${kind} ${strength}`);
  // One cleared while still building in only fades: it never gets stronger.
  assert.ok(startEvent(s, 'fog', 'ordinary').ok);
  advance(s, 5);
  const felt = (t: number) => activeEvents(s.scenario, t).filter((x) => x.event.kind === 'fog').reduce((m, x) => Math.max(m, x.intensity), 0);
  const peak = felt(s.time);
  assert.ok(peak > 0 && peak < 1);
  assert.ok(clearWeather(s).ok);
  for (let t = s.time; t < s.time + 20; t += 0.5) assert.ok(felt(t) <= peak + 1e-9, `at ${t}`);
  assert.equal(felt(s.time + 20), 0);
  const c = clearWeather(s);
  assert.ok(c.ok);
  advance(s, 100);
  assert.equal(eventNow(s.scenario, s.time), null);
  assert.equal(s.scenario.events.length > 0, true, 'what has passed is kept');
  // Only the sandbox does it.
  const game = newGame(randomScenario(3, 1));
  assert.ok(!startEvent(game, 'gale').ok && !clearWeather(game).ok);
  assert.deepEqual(game.scenario.events, randomScenario(3, 1).events);
});

test('a save keeps the commission\'s events, and a broken or older one is refused', () => {
  const s = newGame(randomScenario(8, 3));
  assert.ok(s.scenario.events.length > 0);
  const back = deserialize(serialize(s));
  assert.ok(back.ok);
  assert.deepEqual(back.value.scenario.events, s.scenario.events);
  const sb = sandbox();
  startEvent(sb, 'coldSnap', 'severe');
  const back2 = deserialize(serialize(sb));
  assert.ok(back2.ok && eventNow(back2.value.scenario, sb.time)?.kind === 'coldSnap', 'the sandbox\'s manual events are saved');
  const bad = (f: (e: Record<string, unknown>) => unknown) => { const c = JSON.parse(serialize(s)) as { scenario: { events: Record<string, unknown>[] } }; f(c.scenario.events[0]); return deserialize(JSON.stringify(c)).ok; };
  assert.equal(bad((e) => { e.kind = 'meteor'; }), false);
  assert.equal(bad((e) => { e.strength = 'mighty'; }), false);
  assert.equal(bad((e) => { e.length = 0; }), false);
  assert.equal(bad((e) => { e.start = null; }), false);
  assert.equal(bad(() => undefined), true);
  const noEvents = JSON.parse(serialize(s)); delete noEvents.scenario.events;
  assert.equal(deserialize(JSON.stringify(noEvents)).ok, false);
  const old = JSON.parse(serialize(s)); old.version = 13;
  assert.equal(deserialize(JSON.stringify(old)).ok, false, 'no migration');
  const softSevere = JSON.parse(serialize(s)); softSevere.scenario.events[0] = { kind: 'softRain', strength: 'severe', start: 100, length: 100 };
  assert.equal(deserialize(JSON.stringify(softSevere)).ok, false);
});

test('scenario ids still find their commissions, events and all', () => {
  assert.deepEqual(scenarioById('r12345-3')?.events, randomScenario(12345, 3).events);
  assert.deepEqual(scenarioById('sandbox-winter')?.events, []);
  assert.deepEqual(eventChain('flood', 'ordinary', 0).map((e) => e.kind), ['flood']);
});
