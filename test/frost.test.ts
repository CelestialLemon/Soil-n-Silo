import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place } from '../src/game/build.ts';
import { DAY_SECONDS, START_HOUR, type CropId } from '../src/game/data.ts';
import { clearWeather, EVENTS, rollEvents, startEvent, timeOf, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { placement } from '../src/game/forecast.ts';
import { depthAt, frostComes, frostedTiles, frostNow, frostTakes, frostTiles, HOLLOW, inHollow, isHollow, MELT_HOURS, rimeAt } from '../src/game/frost.ts';
import { readHold } from '../src/game/hold.ts';
import { CAMPAIGN, SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { fieldPace } from '../src/game/sim/buildings.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, touchRelief, type FieldBuilding, type GameState } from '../src/game/state.ts';

const HOUR = DAY_SECONDS / 24;
const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

/**
 * A 40 × 40 game in a season with the events given: the ground rises in a plane (half a level a tile east) with a bowl dug into
 * it round (12, 12) and a hill raised round (30, 30), so there is a hollow, a slope that is neither, and a crest.
 */
function game(season: Season, events: WeatherEvent[], at: number): GameState {
  const climate = { ...climateOf(season), conditions: NO_CONDITIONS };
  const sc: Scenario = { ...SANDBOX, climate, id: 'test', sandbox: false, credits: 100_000, width: 40, height: 40, goals: [], par: 600, events,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  const v = (x: number, y: number) => 0.5 * x + 6 - 3 * Math.max(0, 1 - Math.hypot(x - 12, y - 12) / 5) + 4 * Math.max(0, 1 - Math.hypot(x - 30, y - 30) / 5);
  for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) s.map.corner.splice((y * 40 + x) * 4, 4, v(x, y), v(x + 1, y), v(x + 1, y + 1), v(x, y + 1));
  touchRelief(s);
  s.time = at;
  return s;
}

const frost = (strength: Strength, day = 3, hour = 21, hours = 9): WeatherEvent => ({ kind: 'lateFrost', strength, start: timeOf(day, hour), length: hours * HOUR });

function field(s: GameState, x: number, y: number, crop: CropId): FieldBuilding {
  const r = place(s, 'field', x, y, 0, { crop });
  if (!r.ok) assert.fail(`field at ${x},${y}: ${r.error}`);
  return r.value.building;
}

// The three sites: the bowl's floor, a slope on the plane, and the hill's crest.
const HOLLOW_AT = { x: 11, y: 11 }, SLOPE_AT = { x: 28, y: 6 }, CREST_AT = { x: 29, y: 29 };

test('a hollow is judged against the ground round it: the bowl and not the slope, whatever height they are at', () => {
  const s = game('spring', [], 0);
  assert.ok(isHollow(s, 12, 12) && inHollow(s, HOLLOW_AT.x, HOLLOW_AT.y), 'the bowl\'s floor is a hollow');
  assert.ok(Math.abs(depthAt(s, SLOPE_AT.x + 1, SLOPE_AT.y + 1)) < 1e-6, 'a plane slope is level with its surroundings');
  assert.ok(!isHollow(s, SLOPE_AT.x + 1, SLOPE_AT.y + 1) && !inHollow(s, SLOPE_AT.x, SLOPE_AT.y));
  assert.ok(depthAt(s, 30, 30) < 0 && !inHollow(s, CREST_AT.x, CREST_AT.y), 'a crest stands above what is round it');
  // Raising the whole ground changes none of it.
  const high = game('spring', [], 0);
  for (let i = 0; i < high.map.corner.length; i++) high.map.corner[i] += 3;
  touchRelief(high);
  assert.deepEqual(frostTiles(high, 'ordinary'), frostTiles(s, 'ordinary'));
  // Earthworks move the hollows (the cache follows the ground).
  const dug = frostTiles(s, 'ordinary').length;
  for (let i = 0; i < s.map.corner.length; i++) s.map.corner[i] = 0;
  touchRelief(s);
  assert.equal(frostTiles(s, 'ordinary').length, 0, 'flat ground has no hollows');
  assert.ok(dug > 0);
  assert.ok(HOLLOW > 0);
});

test('a severe frost reaches the slopes, and only the crests stay clear', () => {
  const s = game('spring', [], 0);
  const ordinary = new Set(frostTiles(s, 'ordinary')), severe = new Set(frostTiles(s, 'severe'));
  assert.ok([...ordinary].every((i) => severe.has(i)), 'a severe frost lies wherever an ordinary one does');
  assert.ok(severe.size > ordinary.size * 2);
  assert.equal(frostedTiles(s, SLOPE_AT.x, SLOPE_AT.y, 'ordinary'), 0);
  assert.equal(frostedTiles(s, SLOPE_AT.x, SLOPE_AT.y, 'severe'), 9);
  assert.equal(frostedTiles(s, CREST_AT.x, CREST_AT.y, 'severe'), 0);
});

test('a late frost takes a tender crop in a hollow and leaves the slope, the crest and a hardy crop alone', () => {
  const e = frost('ordinary');
  const s = game('spring', [e], timeOf(3, 12));
  const tomato = field(s, HOLLOW_AT.x, HOLLOW_AT.y, 'tomato'), wheat = field(s, 14, 11, 'wheat'), slope = field(s, SLOPE_AT.x, SLOPE_AT.y, 'sunflower'), crest = field(s, CREST_AT.x, CREST_AT.y, 'tomato');
  assert.ok(inHollow(s, 14, 11), 'the wheat is in the hollow too');
  advance(s, 10);
  for (const f of [tomato, wheat, slope, crest]) assert.ok(f.growth > 0.01, `${f.crop} grows by day`);
  const before = wheat.growth;
  // In the middle of the frost.
  s.time = timeOf(4, 1);
  advance(s, 10);
  assert.deepEqual(frostNow(s)?.event, e);
  assert.equal(tomato.growth, 0, 'the tender crop in the hollow is lost');
  assert.equal(tomato.status, 'weather');
  const hold = readHold(tomato.need);
  assert.deepEqual(hold && { kind: hold.kind, effect: hold.effect }, { kind: 'lateFrost', effect: 'lost' });
  assert.match(describeStatus(s, tomato), /^The growing tomato is lost to the late frost/);
  assert.ok(wheat.growth > before, 'wheat is hardy');
  assert.ok(wheat.status !== 'weather' && slope.status !== 'weather' && crest.status !== 'weather', 'a slope and a crest are clear of an ordinary frost');
  // The crop the frost took starts again once it has passed.
  s.time = endOf(e) + 5 * HOUR;
  advance(s, 10);
  assert.ok(tomato.growth > 0 && tomato.growth < 0.5, `grows again: ${tomato.growth}`);
  assert.ok(tomato.status !== 'weather');
});

test('a severe frost takes a tender crop on a slope too, but not on a crest', () => {
  const e = frost('severe');
  const s = game('spring', [e], timeOf(4, 1));
  const slope = field(s, SLOPE_AT.x, SLOPE_AT.y, 'sunflower'), crest = field(s, CREST_AT.x, CREST_AT.y, 'tomato'), wheat = field(s, SLOPE_AT.x + 4, SLOPE_AT.y, 'beans');
  advance(s, 10);
  assert.equal(slope.growth, 0);
  assert.equal(slope.status, 'weather');
  assert.ok(wheat.growth > 0, 'beans are hardy');
  assert.notEqual(crest.status, 'weather', 'a crest stays clear');
});

test('what a field already holds is untouched by the frost, and the run log counts what it held', () => {
  const e = frost('ordinary');
  const s = game('spring', [e], timeOf(4, 1));
  const f = field(s, HOLLOW_AT.x, HOLLOW_AT.y, 'tomato');
  f.stored = 3; f.harvest = 'tomato';
  advance(s, 10);
  assert.equal(f.stored, 3);
  assert.ok((s.run.held['0|field'] ?? 0) > 9, `held ${s.run.held['0|field']} s`);
});

test('the frost bites only after it has built in, and lets go as it fades', () => {
  const e = frost('ordinary');
  const s = game('spring', [e], 0);
  s.time = e.start + 0.1 * HOUR;
  assert.equal(frostNow(s), null);
  s.time = e.start + 2 * HOUR;
  assert.ok(frostNow(s));
  s.time = e.start + e.length - 0.1 * HOUR;
  assert.equal(frostNow(s), null);
  const f = field(s, HOLLOW_AT.x, HOLLOW_AT.y, 'tomato');
  s.time = timeOf(3, 12);
  assert.equal(frostTakes(s, f), null);
});

test('the rime builds with the frost, lies until it ends and melts away through the morning', () => {
  const e = frost('severe');
  const sc = { events: [e] };
  assert.equal(rimeAt(sc, e.start - 1), null);
  const early = rimeAt(sc, e.start + 0.3 * HOUR)!, later = rimeAt(sc, e.start + 2 * HOUR)!;
  assert.ok(early.hollows > 0 && early.hollows < later.hollows);
  assert.equal(later.hollows, 1);
  assert.equal(later.slopes, 1, 'a severe frost whitens the slopes too');
  const end = e.start + e.length;
  assert.equal(rimeAt(sc, end - 1)!.hollows, 1);
  const melting = rimeAt(sc, end + MELT_HOURS * HOUR / 2)!;
  assert.ok(Math.abs(melting.hollows - 0.5) < 1e-6 && Math.abs(melting.slopes - 0.5) < 1e-6);
  assert.equal(rimeAt(sc, end + MELT_HOURS * HOUR + 1), null);
  assert.equal(rimeAt({ events: [frost('ordinary')] }, e.start + 2 * HOUR)!.slopes, 0, 'an ordinary frost leaves the slopes bare');
});

test('a frost cut short melts from the rime it had built, and one frost following another keeps what the first left', () => {
  const cut = { ...frost('ordinary'), length: 0.5 * HOUR }, end = cut.start + cut.length;
  const atEnd = rimeAt({ events: [cut] }, end - 0.01)!.hollows, justAfter = rimeAt({ events: [cut] }, end + 0.01)!.hollows;
  assert.ok(atEnd < 0.5 && justAfter <= atEnd + 1e-3, `rime ${atEnd} just before the end, ${justAfter} just after`);
  // A severe frost that has ended as an ordinary one starts: its slopes are still white while the ordinary one builds.
  const severe = { ...frost('severe'), length: 6 * HOUR }, next = { ...frost('ordinary'), start: severe.start + 6 * HOUR };
  const sc = { events: [severe, next] }, at = rimeAt(sc, next.start + 0.1 * HOUR)!;
  assert.ok(at.slopes > 0.9 && at.hollows > 0.9, `slopes ${at.slopes}, hollows ${at.hollows}`);
});

test('a frost the sandbox clears early fades with it: the rime never thickens while the event falls away', () => {
  const s = game('spring', [], timeOf(3, 21));
  s.scenario.sandbox = true;
  assert.ok(startEvent(s, 'lateFrost', 'ordinary').ok);
  s.time += 0.3 * HOUR;
  const built = rimeAt(s.scenario, s.time)!.hollows;
  assert.ok(clearWeather(s).ok);
  let last = built;
  for (let dt = 0; dt <= 4 * HOUR; dt += 0.1 * HOUR) {
    const now = rimeAt(s.scenario, s.time + dt)?.hollows ?? 0;
    assert.ok(now <= last + 1e-9 && now <= built + 1e-9, `rime ${now} after ${dt} s, was ${last} (built ${built})`);
    last = now;
  }
  assert.equal(rimeAt(s.scenario, s.time + 5 * HOUR), null);
});

test('while a frost takes a field\'s crop its pace and its forecast say nothing grows', () => {
  const s = game('spring', [frost('severe')], timeOf(3, 12));
  s.scenario.climate = { ...s.scenario.climate, warmth: { ...s.scenario.climate.warmth, low: 14, high: 24 } }; // warm enough that the crop would grow
  const f = field(s, SLOPE_AT.x, SLOPE_AT.y, 'tomato');
  assert.ok(fieldPace(s, f).pace > 0, 'grows before the frost');
  s.time = timeOf(4, 1);
  assert.ok(frostTakes(s, f));
  assert.equal(fieldPace(s, f).pace, 0);
  assert.equal(placement(s, 'field', SLOPE_AT.x, SLOPE_AT.y, { crop: 'tomato' }).facts[0].value, '+0');
  assert.notEqual(placement(s, 'field', SLOPE_AT.x, SLOPE_AT.y, { crop: 'wheat' }).facts[0].value, '+0', 'a hardy crop still grows');
});

test('the ten-minute soil forecast loses what a frost ahead takes', () => {
  const at = timeOf(3, 12);
  const warm = (s: GameState) => { s.scenario.climate = { ...s.scenario.climate, warmth: { ...s.scenario.climate.warmth, low: 14, high: 24, drift: 0 } }; return s; };
  const soonAfter = (events: WeatherEvent[]) => placement(warm(game('spring', events, at)), 'field', SLOPE_AT.x, SLOPE_AT.y, { crop: 'tomato' }).facts.find((f) => f.label === 'Soil')!;
  const clear = soonAfter([]), frozen = soonAfter([frost('severe', 3, 14, 40)]);
  assert.equal(clear.value, frozen.value);
  assert.ok(Number(frozen.then) > Number(clear.then), `soil ${frozen.then} with a long frost ahead, ${clear.then} without`);
});

test('a field whose frozen tiles sit exactly on the severe threshold is not missed to rounding', () => {
  const s = newGame({ ...SANDBOX, seed: 8 });
  assert.ok(frostedTiles(s, 42, 3, 'severe') >= 5);
});

test('the cards say a field is in a frost hollow, in spring, and for a tender crop it is bad news', () => {
  const s = game('spring', [], 0);
  const fact = (x: number, y: number, crop: CropId) => placement(s, 'field', x, y, { crop }).facts.find((f) => f.label === 'Frost hollow');
  const tender = fact(HOLLOW_AT.x, HOLLOW_AT.y, 'tomato'), hardy = fact(HOLLOW_AT.x, HOLLOW_AT.y, 'wheat');
  assert.match(tender?.sub ?? '', /late frost settles here/);
  assert.equal(tender?.tone, 'bad');
  assert.ok(hardy && hardy.tone === undefined, 'a hardy crop is told it is unharmed');
  assert.equal(fact(SLOPE_AT.x, SLOPE_AT.y, 'tomato'), undefined);
  // Only a season that can bring a frost mentions it.
  const summer = game('summer', [], 0);
  assert.ok(!frostComes(summer) && frostComes(s));
  assert.equal(placement(summer, 'field', HOLLOW_AT.x, HOLLOW_AT.y, { crop: 'tomato' }).facts.find((f) => f.label === 'Frost hollow'), undefined);
});

test('late frost is for random commissions: spring only, at night, and not in the campaign', () => {
  const e = EVENTS.lateFrost;
  assert.deepEqual(Object.keys(e.seasons), ['spring']);
  assert.ok(e.begins && e.begins[0] >= 20);
  assert.ok(CAMPAIGN.every((c) => c.events.every((x) => x.kind !== 'lateFrost')));
  let found = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const climate = climateOf('spring', 'dry');
    for (const ev of rollEvents(seed, 3, climate, 600)) if (ev.kind === 'lateFrost') { found++; const hour = (ev.start / HOUR + START_HOUR) % 24; assert.ok(hour >= 20 && hour <= 23, `begins ${hour}`); }
  }
  assert.ok(found > 20, `${found} late frosts in 200 dry springs`);
});

function endOf(e: WeatherEvent) { return e.start + e.length; }
