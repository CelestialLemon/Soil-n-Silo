import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place } from '../src/game/build.ts';
import { placement } from '../src/game/forecast.ts';
import { ANIMALS, DAY_SECONDS, FIELD } from '../src/game/data.ts';
import { eventOn, heavyRainEvents, hoursOf, lookAt, pushesAt, timeOf, type EventKind, type Strength, type WeatherEvent } from '../src/game/events.ts';
import { TERRAIN } from '../src/game/map.ts';
import { coopPace, coopShade, coopTrees } from '../src/game/rules.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { climateOf, type Season } from '../src/game/seasons.ts';
import { sunAt, windAt } from '../src/game/sim/clock.ts';
import { raining, weatherAt } from '../src/game/sim/weather.ts';
import { newGame, type GameState } from '../src/game/state.ts';
import { beesFly, dryPace, henFact, henPace, warmthOf } from '../src/game/warmth.ts';
import { greyLook } from '../src/world/greyLook.ts';
import { lookAt as dayLook } from 'pixel3d-renderer';

const NO_CONDITIONS = { cloud: 0, rain: 0, calm: 0 };

/** A flat game in a clear season with one event on day 3 at 06:00 (or `hour`), set to the event's middle. */
function during(season: Season, kind: EventKind, strength: Strength = 'ordinary', hour = 6): { s: GameState; e: WeatherEvent; quiet: GameState } {
  const climate = { ...climateOf(season), conditions: NO_CONDITIONS };
  const base: Scenario = { ...SANDBOX, climate, width: 30, height: 30, terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 } };
  const e = eventOn(3, hour, kind, strength)[0];
  const s = newGame({ ...base, events: [e] }), quiet = newGame({ ...base, events: [] });
  s.time = quiet.time = e.start + e.length / 2;
  return { s, e, quiet };
}

test('a thunderstorm gives heavy rain, little sun and gusts, harder in a severe one', () => {
  const { s, e, quiet } = during('summer', 'thunderstorm');
  const sev = during('summer', 'thunderstorm', 'severe');
  assert.ok(raining(s.scenario, s.time) && !raining(quiet.scenario, quiet.time), 'fields count as watered, sprinklers rest');
  assert.ok(weatherAt(s.scenario, s.time).precip >= 0.85);
  const noon = timeOf(3, 12);
  assert.ok(sunAt(s.scenario, noon) < sunAt(quiet.scenario, noon) * 0.3, 'little sun');
  assert.ok(windAt(s.scenario, s.time) > windAt(quiet.scenario, quiet.time) + 0.3, 'gusts');
  assert.ok(sev.s.time > 0 && windAt(sev.s.scenario, sev.s.time) > windAt(s.scenario, s.time), 'stronger gusts when severe');
  assert.ok(sunAt(sev.s.scenario, noon) < sunAt(s.scenario, noon));
  assert.deepEqual(heavyRainEvents(s.scenario, s.time)[0], e, 'it counts as heavy rain for a flood');
});

test('soft rain waters every field but is not heavy rain', () => {
  const { s } = during('spring', 'softRain', 'ordinary', 8);
  assert.ok(raining(s.scenario, s.time));
  assert.equal(heavyRainEvents(s.scenario, s.time).length, 0);
  assert.ok(weatherAt(s.scenario, s.time).precip < 0.5);
});

test('a heat wave lifts the warmth past 30°C: unwatered fields nearly stop and hens slow; a severe one is hotter and longer', () => {
  const { s, quiet } = during('summer', 'heatWave', 'ordinary', 6);
  const sev = during('summer', 'heatWave', 'severe', 6);
  for (const g of [s, quiet, sev.s]) g.time = timeOf(3, 15);
  const hot = warmthOf(s), hotter = warmthOf(sev.s);
  assert.ok(warmthOf(quiet) < 32 && hot > 33 && hotter > hot + 3);
  assert.ok(dryPace(hot) < FIELD.dry * 0.5 && dryPace(hotter) <= FIELD.heatDry + 1e-9, 'an unwatered field nearly stops');
  assert.ok(henPace(s.scenario, hot) < henPace(quiet.scenario, warmthOf(quiet)));
  assert.ok(hoursOf('heatWave', 'severe')[0] >= hoursOf('heatWave')[1], 'longer');
  assert.ok(lookAt(s.scenario, timeOf(3, 15)).heat > 0.9);
});

test('trees by the coop shade it: hens slow less in the heat, up to a limit', () => {
  const { s } = during('summer', 'heatWave');
  s.time = timeOf(3, 15);
  const coop = place(s, 'coop', 10, 10, 0);
  assert.ok(coop.ok);
  const w = warmthOf(s), bare = coopPace(s, 10, 10, w);
  assert.equal(coopTrees(s, 10, 10), 0);
  assert.equal(bare, henPace(s.scenario, w));
  const plant = (x: number, y: number) => { s.map.terrain[y * s.map.width + x] = TERRAIN.tree; };
  plant(9, 10);
  assert.equal(coopTrees(s, 10, 10), 1);
  assert.equal(coopShade(s, 10, 10), ANIMALS.shadePerTree);
  const one = coopPace(s, 10, 10, w);
  assert.ok(one > bare, 'a tree at the edge helps');
  plant(8, 8); plant(14, 14); plant(12, 9); plant(11, 8);
  assert.equal(coopShade(s, 10, 10), ANIMALS.shadeMost, 'capped');
  assert.ok(coopPace(s, 10, 10, w) > one);
  plant(2, 2); // far away
  assert.equal(coopShade(s, 10, 10), ANIMALS.shadeMost);
  // Trees only matter in the heat.
  assert.equal(coopPace(s, 10, 10, 20), henPace(s.scenario, 20));
  assert.match(henFact(s.scenario, 40, ANIMALS.shadePerTree).text, /shade/);
});

test('fog weakens solar and slows the trucks, more when severe', () => {
  const { s, quiet } = during('autumn', 'fog', 'ordinary', 5);
  const sev = during('autumn', 'fog', 'severe', 5);
  const noon = timeOf(3, 8);
  s.time = sev.s.time = quiet.time = noon;
  assert.ok(sunAt(s.scenario, noon) < sunAt(quiet.scenario, noon) * 0.5);
  assert.ok(sunAt(sev.s.scenario, noon) < sunAt(s.scenario, noon));
  assert.equal(pushesAt(s.scenario, noon).trucks, 0.5);
  assert.ok(pushesAt(sev.s.scenario, noon).trucks < 0.5);
  assert.equal(pushesAt(quiet.scenario, noon).trucks, 1);
});

test('a warm spell lifts a cold day to a mild one: crops grow, the bees fly; a warm day stays as it is', () => {
  const { s, quiet } = during('winter', 'warmSpell');
  const dawn = timeOf(4, 7), noon = timeOf(3, 15);
  for (const t of [dawn, noon]) {
    s.time = t; quiet.time = t;
    assert.ok(warmthOf(s) > warmthOf(quiet) + 10, 'lifted');
  }
  s.time = noon;
  assert.ok(beesFly(warmthOf(s)) && !beesFly(warmthOf(quiet)));
  // Already warmer than the mild day: left alone.
  const hot = during('summer', 'warmSpell');
  assert.equal(warmthOf(hot.s), warmthOf(hot.quiet));
});

test('a steady breeze blows through the calm season', () => {
  const { s, quiet } = during('summer', 'steadyBreeze');
  assert.ok(windAt(s.scenario, s.time) > windAt(quiet.scenario, quiet.time) + 0.3);
});

test('the heat wave warms the look, and a clear day with no heat is left alone', () => {
  const noon = dayLook(12);
  assert.equal(greyLook(noon, { cloud: 0, precip: 0, heat: 0 }), noon);
  const warm = greyLook(noon, { cloud: 0, precip: 0, heat: 1 });
  assert.ok(warm.litTint[0] > noon.litTint[0] && warm.litTint[1] > noon.litTint[1]);
  assert.notEqual(warm.skyBot.getHex(), noon.skyBot.getHex());
});

test('a severe heat wave lasts longer than an ordinary one, and the short events stay short', () => {
  assert.ok(hoursOf('heatWave', 'severe')[0] >= hoursOf('heatWave')[1]);
  for (const [kind, h] of [['thunderstorm', 14], ['fog', 7], ['softRain', 28]] as const) assert.ok(hoursOf(kind)[1] <= h, kind);
  assert.equal(eventOn(3, 6, 'heatWave', 'severe')[0].length > eventOn(3, 6, 'heatWave')[0].length, true);
});

test('the placement card counts rain as water for a field, as the simulation does', () => {
  const { s, quiet } = during('spring', 'softRain', 'ordinary', 8);
  const water = (g: GameState) => placement(g, 'field', 10, 10, { crop: 'wheat' }).facts.find((f) => f.label === 'Water');
  assert.equal(water(quiet)?.value, 'none');
  assert.equal(water(s)?.value, 'rain');
  assert.match(water(s)?.sub ?? '', /100%/);
});

test('the soil forecast counts rain only while it lasts', () => {
  const HOUR = DAY_SECONDS / 24;
  const soilThen = (hours: number | null) => {
    const climate = { ...climateOf('spring'), conditions: NO_CONDITIONS };
    const events = hours === null ? [] : eventOn(3, 8, 'softRain', 'ordinary', hours);
    const g = newGame({ ...SANDBOX, climate, width: 30, height: 30, terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 }, events });
    g.time = timeOf(3, 8) + 22 * HOUR; // two hours before the short one ends
    return Number(placement(g, 'field', 10, 10, { crop: 'wheat' }).facts.find((f) => f.label === 'Soil')?.then);
  };
  const ending = soilThen(24), lasting = soilThen(1000), none = soilThen(null);
  // More water means faster growth, so more harvests wearing the soil: the less the rain, the more soil is left.
  assert.ok(lasting < ending && ending <= none, `${lasting} < ${ending} <= ${none}`);
});

test('the soil forecast sees rain that begins later in its ten minutes', () => {
  const HOUR = DAY_SECONDS / 24;
  const soilThen = (rain: boolean) => {
    const climate = { ...climateOf('spring'), conditions: NO_CONDITIONS, warmth: { low: 18, high: 18, drift: 0 } };
    const events = rain ? eventOn(3, 8, 'softRain', 'ordinary', 24) : [];
    const g = newGame({ ...SANDBOX, climate, width: 30, height: 30, terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 }, events });
    g.time = timeOf(3, 8) - 26 * HOUR; // the rain begins a day and two hours ahead
    return Number(placement(g, 'field', 10, 10, { crop: 'wheat' }).facts.find((f) => f.label === 'Soil')?.then);
  };
  assert.ok(soilThen(true) < soilThen(false), 'later rain speeds growth, so wears more soil');
});

test('the soil forecast waits out a spell with no growth and sees a warm spell after it', () => {
  const climate = { ...climateOf('winter'), conditions: NO_CONDITIONS, warmth: { low: 2, high: 2, drift: 0 } };
  const events = eventOn(3, 10, 'warmSpell', 'ordinary', 24);
  const g = newGame({ ...SANDBOX, climate, width: 30, height: 30, terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 }, events });
  g.time = timeOf(2, 8);
  const soil = placement(g, 'field', 10, 10, { crop: 'tomato' }).facts.find((f) => f.label === 'Soil');
  assert.ok(Number(soil?.then) < 60, 'it grows, and wears the soil, once the warm spell comes');
});
