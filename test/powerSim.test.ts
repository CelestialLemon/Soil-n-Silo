import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, BATTERY_WH, CLOUD_DIM, FARMHOUSE_NIGHT_W, type GameState, generationOf, must, networksOf, sandboxSupplies, SOLAR_PEAK_W,
  stepPower, stepSim, type ThingKind, TURBINE_BASE_W, TURBINE_SPAN_W, WATERWHEEL_W,
} from '../src/game/index.ts';
import { flatLand } from './helpers.ts';

const put = (s: GameState, kind: ThingKind, x: number, z: number, yaw = 0) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};
const thing = (s: GameState, id: number) => must(s.things.find((t) => t.id === id), 'the thing');
const rt = (s: GameState, id: number) => must(s.sim.things.get(id), 'its runtime');
const calm = { windSpeed: 0, cloudCover: 0 };

/** A land with Supplies to spare, for building whatever a test needs. */
function sandbox(): GameState {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  return s;
}

/** Sets a workshop to work (its inputs taken, a recipe under way). */
function busy(s: GameState, id: number) {
  const r = rt(s, id);
  r.working = true; r.progress = 0;
}

test('solar canopies follow the sun and dim under cloud', () => {
  const s = sandbox(), solar = thing(s, put(s, 'solar', -40, -30));
  const noon = generationOf(s, solar, 12.5, calm);
  assert.ok(noon > 0.95 * SOLAR_PEAK_W && noon <= SOLAR_PEAK_W, `${noon}`);
  assert.ok(generationOf(s, solar, 8, calm) < noon);
  assert.equal(generationOf(s, solar, 2, calm), 0, 'dark at night');
  assert.equal(generationOf(s, solar, 22, calm), 0);
  const overcast = generationOf(s, solar, 12.5, { windSpeed: 0, cloudCover: 1 });
  assert.ok(Math.abs(overcast - noon * (1 - CLOUD_DIM)) < 1e-9);
  // A tree right beside it shades it.
  assert.ok(apply(s, { type: 'plantTree', x: -40, z: -26 }).ok);
  assert.ok(generationOf(s, solar, 12.5, calm) < noon);
});

test('turbines follow the wind, and catch more of it standing high', () => {
  const s = sandbox(), turbine = thing(s, put(s, 'turbine', -40, -40));
  const still = generationOf(s, turbine, 12, calm), gale = generationOf(s, turbine, 12, { windSpeed: 30, cloudCover: 0 });
  assert.ok(Math.abs(still - TURBINE_BASE_W) < 1e-9, 'a trickle in still air');
  assert.ok(Math.abs(gale - (TURBINE_BASE_W + TURBINE_SPAN_W)) < 1e-9);
  let last = -1;
  for (const w of [0, 2, 4, 6, 8, 10, 12]) {
    const v = generationOf(s, turbine, 12, { windSpeed: w, cloudCover: 0 });
    assert.ok(v > last, 'more wind, more power');
    last = v;
  }
  assert.equal(generationOf(s, turbine, 2, { windSpeed: 6, cloudCover: 0 }), generationOf(s, turbine, 14, { windSpeed: 6, cloudCover: 0 }), 'day and night alike');
});

test('a water wheel turns steadily, day and night, in any weather', () => {
  const s = sandbox(), wheel = thing(s, put(s, 'waterwheel', 0, 4.5, Math.PI));
  for (const hour of [0, 3, 12, 21]) for (const env of [calm, { windSpeed: 12, cloudCover: 1 }]) assert.equal(generationOf(s, wheel, hour, env), WATERWHEEL_W);
});

test('a battery soaks up the day\'s surplus and carries the home through the night', () => {
  const s = sandbox();
  const battery = put(s, 'battery', -40, -36), house = put(s, 'farmhouse', -28, -36);
  put(s, 'solar', -40, -24);
  const levels: number[] = [];
  let blackouts = 0;
  for (let h = 0; h < 48; h++) {
    for (let k = 0; k < 30; k++) blackouts += stepSim(s, 1, calm).events.filter((e) => e.type === 'blackout').length;
    levels[(Math.round(s.sim.hour) + 24) % 24] = rt(s, battery).charge;
    assert.ok(rt(s, house).powered, `the home is lit at ${s.sim.hour}`);
  }
  assert.equal(blackouts, 0);
  assert.ok(levels[17] > 0.95, `full by evening (${levels[17]})`);
  assert.ok(levels[5] < levels[19] && levels[5] > 0.4, `drawn down overnight to ${levels[5]}`);
  const net = must(s.sim.networks.find((n) => n.emitters.includes(battery)), 'its network');
  assert.equal(net.batteryCapWh, BATTERY_WH);
  assert.ok(Math.abs(s.sim.powerSummary.totalStoredWh - rt(s, battery).charge * BATTERY_WH) < 1e-9);
});

test('without a store, nightfall is a blackout, and it says why and how to fix it', () => {
  const s = sandbox();
  put(s, 'solar', -40, -24);
  const house = put(s, 'farmhouse', -28, -30);
  s.sim.hour = 18;
  const events = [];
  for (let k = 0; k < 30 * 4; k++) events.push(...stepSim(s, 1, calm).events);
  const blackout = events.filter((e) => e.type === 'blackout');
  assert.equal(blackout.length, 1, 'one blackout, when it starts');
  assert.match(blackout[0].message, /Blackout on Day 1 at 1\d:\d\d: the Farmhouse went without power\. To carry it, add a Battery or a Water Wheel\./);
  assert.ok(!rt(s, house).powered);
  assert.ok(s.sim.powerSummary.anyBlackout);
  assert.equal(s.sim.powerSummary.lastBlackoutReason, blackout[0].message);
});

test('a short network pauses its workshops before the hens, the garage and the home', () => {
  const s = sandbox();
  put(s, 'turbine', -40, -36);
  const house = put(s, 'farmhouse', -40, -24), mill = put(s, 'mill', -28, -36), coop = put(s, 'coop', -40, -50);
  busy(s, mill); busy(s, coop);
  // 0.5 W of still air: the home's lamps (0.5 W at night) and nothing else.
  const fresh = stepPower(s, 0.01, 22, calm);
  assert.equal(fresh.length, 1);
  assert.ok(rt(s, house).powered);
  assert.equal(rt(s, house).watts, FARMHOUSE_NIGHT_W);
  assert.ok(!rt(s, coop).powered && !rt(s, mill).powered);
  assert.match(s.sim.powerSummary.lastBlackoutReason, /the Coop and Mill went without power/);
  // A steady blackout isn't news again; a gust brings the coop back first, then the mill.
  assert.equal(stepPower(s, 0.01, 22, calm).length, 0);
  stepPower(s, 0.01, 22, { windSpeed: 2, cloudCover: 0 });
  assert.ok(rt(s, coop).powered && !rt(s, mill).powered);
  stepPower(s, 0.01, 22, { windSpeed: 12, cloudCover: 0 });
  assert.ok(rt(s, coop).powered && rt(s, mill).powered);
  assert.ok(!s.sim.powerSummary.anyBlackout);
});

test('networks are separate until relays join them: one\'s battery can\'t carry another\'s mill', () => {
  const s = sandbox();
  const battery = put(s, 'battery', -40, -40), house = put(s, 'farmhouse', -30, -30);
  const solar = put(s, 'solar', 30, -40), mill = put(s, 'mill', 40, -30);
  busy(s, mill);
  rt(s, battery).charge = 1;
  stepPower(s, 0.01, 22, calm);
  assert.equal(s.sim.networks.length, 2);
  assert.ok(rt(s, house).powered, 'the battery keeps the home lit');
  assert.ok(!rt(s, mill).powered, 'the far canopy is dark at night, and the battery is out of reach');
  const dark = must(s.sim.networks.find((n) => n.emitters.includes(solar)), 'the canopy\'s network');
  assert.ok(dark.blackout && dark.loads.includes(mill));
  // A chain of relays joins them, and the battery carries both.
  for (let x = -27; x <= 25; x += 13) put(s, 'relay', x, -44);
  assert.equal(new Set(networksOf(s).netOf).size, 1);
  stepPower(s, 0.01, 22, calm);
  assert.equal(s.sim.networks.length, 1);
  assert.ok(rt(s, house).powered && rt(s, mill).powered);
  assert.ok(rt(s, battery).charge < 1, 'it pays for both');
});

test('a load beyond every field has no power and belongs to no network', () => {
  const s = sandbox();
  put(s, 'solar', -40, -40);
  const mill = put(s, 'mill', 30, -40);
  busy(s, mill);
  stepPower(s, 0.01, 12, calm);
  assert.ok(!rt(s, mill).powered);
  assert.equal(rt(s, mill).powerNetId, -1);
  assert.match(stepSim(s, 1, calm) && rt(s, mill).status, /Needs a relay or power nearby/);
});
