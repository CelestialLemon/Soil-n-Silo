// Milestone 5A's full roster: five crops with their own characters (tomato, sunflower and flax beside wheat and beans),
// the Oil Press, Cannery, Spinner and Loom with the carts working their chains on their own, and the Biogas Digester's
// storm-proof power from the homestead's organic waste.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  advanceRecipes, apply, BATTERY_WH, canPlace, CATALOG, costOf, CROPS, type Crop, cropClimate, countOf, describeRuntime, diagnoseIdleCarts,
  DIGESTER_BURN_HOURS, DIGESTER_CHARGE_BELOW, DIGESTER_W, type Endpoint, erosionDrain,
  type Field, floweringArea, forageRate, formatClock, type GameState, generateValley, generationOf, type Good, GOOD_LABELS, GOODS, GREENHOUSE_HOURS, GREENHOUSE_YIELD,
  growCrops, growGreenhouses, HARVEST_FERTILITY, liveEnv, must, PANTRY_ORDERS, type Point2, previewChannelFlow, RECIPES, sandboxSupplies, type SimEnv, type SimEvent, SILO_GOOD_CAP, starterSupplies, startRecipes, stepPower, stepSim,
  suggestWaterWheelYaw, SUPPLY_CAP, type ThingKind, WHEAT_HARDY_C,
} from '../src/game/index.ts';
import { brookSpot, build, building, done, fieldAt, flatLand, joinMain, land } from './helpers.ts';

const put = (s: GameState, kind: ThingKind, x: number, z: number, yaw = 0) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};
const rt = (s: GameState, id: number) => must(s.sim.things.get(id), 'its runtime');

/** Each crop in its own field on flat dry ground, equal in soil and water, so only the crop's character tells them apart. */
function fiveFields(): { s: GameState; fields: Record<Crop, Field> } {
  const s = land({ height: () => 0 });
  CROPS.forEach((crop, i) => fieldAt(s, crop, -40 + 20 * i, -30, 3));
  // (Each paint rebuilds the fields: read them once all are painted.)
  const fields = Object.fromEntries(CROPS.map((crop) => [crop, must(s.fields.find((f) => f.crop === crop), crop)])) as Record<Crop, Field>;
  for (const f of s.fields) { f.fertility = 0.8; f.avgMoisture = 0.05; f.growth = 0.3; }
  return { s, fields };
}

/** How far each crop grows in `hours` at noon light in air of `tempC`, from the same start. */
function growIn(tempC: number, hours = 1): Record<Crop, number> {
  const { s, fields } = fiveFields();
  s.sim.weather.tempC = tempC;
  s.sim.weather.snowDepth = 0;
  growCrops(s, hours, 1);
  return Object.fromEntries(CROPS.map((c) => [c, fields[c].growth - 0.3])) as Record<Crop, number>;
}

test("five crops, in brush3d's order, each painting a field of its own", () => {
  const plants = readFileSync(new URL('../brush3d/src/kit/plants.ts', import.meta.url), 'utf8');
  const names = must(/CROP_NAMES = \[([^\]]*)\]/.exec(plants), 'CROP_NAMES')[1].split(',').map((n) => n.trim().replace(/'/g, ''));
  assert.deepEqual([...CROPS], names, 'the crop codes (1 + index) match the renderer\'s mask');
  const { s, fields } = fiveFields();
  assert.equal(s.fields.length, 5);
  for (const c of CROPS) {
    assert.equal(fields[c].crop, c);
    assert.ok(GOODS.includes(c) && GOOD_LABELS[c].category === 'harvest', `${c} is a harvest`);
  }
  // Beans build the soil back; the rest draw it down.
  assert.deepEqual(HARVEST_FERTILITY, { wheat: -0.14, beans: 0.14, tomato: -0.12, sunflower: -0.12, flax: -0.1 });
});

test('the full goods roster: labels, units, categories and distinct cargo colours', () => {
  const want = {
    tomato: ['Tomato', 'crate of tomatoes', 'harvest', '#c84232'], sunflower: ['Sunflower', 'bundle of sunflowers', 'harvest', '#e0b833'],
    flax: ['Flax', 'sheaf of flax', 'harvest', '#8aa8b8'], seed_cake: ['Seed Cake', 'press of seed cake', 'byproduct', '#9a7342'],
    oil: ['Oil', 'jug of oil', 'crafted', '#d9a432'], tomato_sauce: ['Tomato Sauce', 'jar of sauce', 'crafted', '#b5382a'],
    yarn: ['Yarn', 'skein of yarn', 'crafted', '#d9d4c7'], linen: ['Linen', 'bolt of linen', 'crafted', '#e8e2d5'],
  } as const;
  for (const [g, [label, unit, category, color]] of Object.entries(want)) {
    const info = GOOD_LABELS[g as keyof typeof want];
    assert.deepEqual([info.label, info.unit, info.category, info.color], [label, unit, category, color], g);
  }
  assert.equal(new Set(GOODS.map((g) => GOOD_LABELS[g].color)).size, GOODS.length, 'every good its own colour');
});

test('tomato loves warmth, flax loves the cool, and a canopy keeps flax from wilting in the heat', () => {
  const warm = growIn(22), cool = growIn(8), mild = growIn(15);
  assert.ok(warm.tomato > 1.1 * warm.wheat, `tomato in the warmth: ${warm.tomato} vs wheat ${warm.wheat}`);
  assert.ok(cool.tomato < 0.85 * cool.wheat, `tomato in the cool: ${cool.tomato} vs wheat ${cool.wheat}`);
  assert.ok(mild.flax > 1.1 * mild.wheat, `flax in the cool: ${mild.flax} vs wheat ${mild.wheat}`);
  assert.ok(Math.abs(mild.tomato - mild.wheat) < 1e-9, 'tomato takes mild air as wheat does');
  assert.equal(cropClimate('flax', 30), 0.8, 'flax wilts above 26°C');
  assert.equal(cropClimate('flax', 30, 1), 1, 'unless a solar canopy shades it');
  assert.equal(cropClimate('wheat', 30), 1);
  assert.equal(cropClimate('tomato', 22), 1.15);
  assert.equal(cropClimate('tomato', 10), 0.8);
});

test('sunflowers are drought-hardy: on dry ground they outgrow the thirsty crops', () => {
  const dry = growIn(15);
  assert.ok(dry.sunflower > 1.4 * dry.wheat, `sunflower ${dry.sunflower} vs wheat ${dry.wheat} on dry ground`);
  assert.ok(dry.sunflower > 1.4 * dry.beans);
});

test('frost: beans, tomato and sunflower are tender at 0°C; wheat and flax are hardy to -2°C', () => {
  const nipped = growIn(-1);
  for (const c of ['beans', 'tomato', 'sunflower'] as const) assert.ok(nipped[c] < 0, `${c} slips back at -1°C`);
  for (const c of ['wheat', 'flax'] as const) assert.ok(nipped[c] > 0, `${c} grows on at -1°C`);
  const hard = growIn(WHEAT_HARDY_C - 1);
  for (const c of CROPS) assert.ok(hard[c] <= 0, `${c} pauses at ${WHEAT_HARDY_C - 1}°C`);
});

test('every flowering crop (beans, tomato, sunflower, flax) feeds the bees; wheat does not', () => {
  for (const crop of CROPS) {
    const s = land({ height: () => 0 }), f = fieldAt(s, crop, 0, 0, 5), { t } = building(s, 'beehive', 8, 0);
    s.sim.hour = 12;
    s.sim.weather.tempC = 18;
    f.growth = 0.3;
    assert.equal(floweringArea(s, t), 0, `${crop} doesn't flower while young`);
    f.growth = 0.5;
    if (crop === 'wheat') assert.equal(floweringArea(s, t), 0, 'wheat never flowers for bees');
    else {
      assert.ok(floweringArea(s, t) > 0, `${crop} flowers`);
      assert.ok(forageRate(s, t, { windSpeed: 2, cloudCover: 0 }) > 1, `bees forage on ${crop}`);
    }
  }
});

test('every soil-draining crop erodes on a steep unguarded slope; beans hold it, and guard their neighbours', () => {
  for (const crop of CROPS) {
    const s = land({ height: (x) => x * 0.2 }), f = fieldAt(s, crop, 0, 0, 2);
    if (crop === 'beans') { assert.equal(erosionDrain(s, f), 0); continue; }
    const open = erosionDrain(s, f);
    assert.ok(open > 0.09, `${crop} erodes: ${open}`);
    fieldAt(s, 'beans', 6, 0, 2);
    assert.ok(erosionDrain(s, must(s.fields.find((v) => v.crop === crop), crop)) < 0.3 * open, `beans guard the ${crop}`);
  }
});

test('the Heated Greenhouse grows any of the five crops', () => {
  const s = flatLand(), { t, r } = building(s, 'greenhouse', -20, -30);
  r.powered = true;
  for (const crop of CROPS) {
    assert.ok(apply(s, { type: 'setGreenhouseCrop', id: t.id, crop }).ok, crop);
    r.outputs = {};
    r.progress = 0;
    growGreenhouses(s, GREENHOUSE_HOURS + 0.01);
    assert.equal(countOf(r.outputs, crop), GREENHOUSE_YIELD, `${crop} under glass`);
  }
});

test('the four new workshops\' recipes, and seed cake feeding the hens and the compost', () => {
  assert.deepEqual(RECIPES.oil_press, { inputs: [{ options: ['sunflower'], count: 2, keep: 4 }], outputs: { oil: 2, seed_cake: 1 }, hours: 1.8, verb: 'Pressing sunflower oil' });
  assert.deepEqual(RECIPES.cannery, { inputs: [{ options: ['tomato'], count: 2, keep: 4 }, { options: ['oil'], count: 1, keep: 2 }], outputs: { tomato_sauce: 2 }, hours: 2, verb: 'Simmering tomato sauce' });
  assert.deepEqual(RECIPES.spinner, { inputs: [{ options: ['flax'], count: 2, keep: 4 }], outputs: { yarn: 2 }, hours: 1.8, verb: 'Spinning flax into yarn' });
  assert.deepEqual(RECIPES.loom, { inputs: [{ options: ['yarn'], count: 2, keep: 4 }], outputs: { linen: 2 }, hours: 2.2, verb: 'Weaving linen' });
  assert.deepEqual(RECIPES.coop.inputs[0].options, ['bran', 'seed_cake', 'wheat']);
  assert.deepEqual(RECIPES.composter.inputs[0].options, ['manure', 'bran', 'seed_cake']);
  const s = flatLand(), coop = building(s, 'coop', 0, -20).r, composter = building(s, 'composter', 20, -20).r;
  coop.inputs = { seed_cake: 1 }; composter.inputs = { seed_cake: 1 };
  coop.powered = true;
  startRecipes(s);
  assert.ok(coop.working && composter.working, 'both take seed cake');
  advanceRecipes(s, 2.3);
  assert.deepEqual([coop.outputs, composter.outputs], [{ eggs: 2, manure: 1 }, { compost: 2 }]);
});

/** A breezy homestead in the sandbox: turbines, a Garage, a Silo and the Depot, south of flatLand's brook. */
function craftYard() {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  put(s, 'garage', -10, -28, Math.PI);
  const silo = put(s, 'silo', 38, -28), depot = put(s, 'depot', -12, -46, 0);
  for (const x of [-2, 14, 30]) put(s, 'turbine', x, -38);
  return { s, silo, depot };
}
const breezy: SimEnv = { windSpeed: 12, cloudCover: 0, weather: 'clear' };
function run(s: GameState, hours: number, each?: () => void): SimEvent[] {
  const events: SimEvent[] = [];
  for (let h = 0; h < hours; h++) {
    for (let k = 0; k < 30; k++) events.push(...stepSim(s, 1, breezy).events);
    each?.();
  }
  return events;
}

test('the carts work the summer chains on their own: sunflowers to the Oil Press, tomatoes and oil to the Cannery, sauce to the Depot', () => {
  const { s } = craftYard();
  const press = put(s, 'oil_press', 6, -28, Math.PI), cannery = put(s, 'cannery', 22, -28, Math.PI);
  s.sim.brief.order.targets = { tomato_sauce: 4 };
  assert.ok(apply(s, { type: 'buyCart' }).ok);
  assert.ok(apply(s, { type: 'paintField', crop: 'sunflower', points: [{ x: -44, z: -30 }, { x: -30, z: -30 }], radius: 3 }).ok);
  assert.ok(apply(s, { type: 'paintField', crop: 'tomato', points: [{ x: -44, z: -54 }, { x: -30, z: -54 }], radius: 3 }).ok);
  const sun = must(s.fields.find((f) => f.crop === 'sunflower'), 'sunflowers'), tom = must(s.fields.find((f) => f.crop === 'tomato'), 'tomatoes');
  sun.harvestReady = 6; tom.harvestReady = 6;
  // The settlement's two drops to come, as in a real valley.
  s.sim.supplies.drops = starterSupplies().drops;
  const events = run(s, 30, () => {
    if (sun.harvestReady === 0) sun.harvestReady = 4;
    if (tom.harvestReady === 0) tom.harvestReady = 4;
  });
  assert.ok(rt(s, press).made >= 2, `the press pressed ${rt(s, press).made}`);
  assert.ok(rt(s, cannery).made >= 2, `the cannery simmered ${rt(s, cannery).made}`);
  assert.ok(countOf(s.sim.delivered, 'tomato_sauce') >= 4, 'sauce delivered');
  assert.ok(s.sim.brief.order.done);
  // The settlement's drops: a tomato or sunflower harvest is a first harvest; sauce is a first crafted good.
  const drops = events.filter((e) => e.type === 'drop').map((e) => e.message);
  assert.equal(drops.length, 2, drops.join('; '));
  assert.ok(s.sim.supplies.drops.every((d) => d.received));
});

test('the carts work the autumn chain on their own: flax to the Spinner, yarn to the Loom, linen to the Depot', () => {
  const { s } = craftYard();
  const spinner = put(s, 'spinner', 6, -28, Math.PI), loom = put(s, 'loom', 22, -28, Math.PI);
  s.sim.brief.order.targets = { linen: 4 };
  assert.ok(apply(s, { type: 'paintField', crop: 'flax', points: [{ x: -44, z: -30 }, { x: -30, z: -30 }], radius: 3 }).ok);
  const flax = s.fields[0];
  flax.harvestReady = 8;
  run(s, 30, () => { if (flax.harvestReady === 0) flax.harvestReady = 4; });
  assert.ok(rt(s, spinner).made >= 2, `the spinner spun ${rt(s, spinner).made}`);
  assert.ok(rt(s, loom).made >= 2, `the loom wove ${rt(s, loom).made}`);
  assert.ok(countOf(s.sim.delivered, 'linen') >= 4);
  assert.ok(!s.sim.powerSummary.anyBlackout);
});

/** Pitch dark, dead calm, deep winter, a blizzard blowing. */
const blizzard: SimEnv = { windSpeed: 0, cloudCover: 1, weather: 'blizzard', hour: 0 };

test('the Biogas Digester is built cold and empty: taking it down and building it again makes no power', () => {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  const id = put(s, 'digester', 0, -20), r = rt(s, id);
  assert.deepEqual([r.working, r.inputs, r.progress], [false, {}, 0]);
  r.inputs = { manure: 3 };
  startRecipes(s);
  assert.ok(!r.working, 'the workshops\' start leaves it cold: only the power lights it');
  // An empty Battery beside it asks for charge: it lights.
  put(s, 'battery', 8, -20);
  stepSim(s, 1, blizzard);
  assert.ok(r.working);
  assert.ok(apply(s, { type: 'remove', id }).ok);
  const again = put(s, 'digester', 0, -20), r2 = rt(s, again);
  assert.deepEqual([r2.working, r2.inputs], [false, {}]);
  assert.equal(generationOf(s, must(s.things.find((t) => t.id === again), 'it'), 0, blizzard), 0);
  assert.equal(describeRuntime(s, r2), 'Waiting for manure, bran or seed cake');
});

test('the Biogas Digester burns waste into 4 W in a pitch-dark calm winter blizzard, and stops when the waste runs out', () => {
  const s = flatLand();
  s.season = 'winter';
  s.sim.weatherOverride = 'blizzard';
  s.sim.hour = 0;
  const dig = building(s, 'digester', 0, -20), spinner = building(s, 'spinner', 10, -20), solar = building(s, 'solar', -10, -20);
  // The farmhouse's lamps keep asking all night, so it burns its waste back to back.
  building(s, 'farmhouse', 0, -32);
  dig.r.inputs = { manure: 1, bran: 1 };
  spinner.r.inputs = { flax: 4 };
  const env: SimEnv = { windSpeed: 0, cloudCover: 1, weather: 'blizzard' };
  stepSim(s, 1, env);
  assert.ok(dig.r.working);
  assert.equal(generationOf(s, dig.t, s.sim.hour, env), DIGESTER_W);
  assert.equal(generationOf(s, solar.t, s.sim.hour, env), 0, 'the canopy is dark');
  assert.equal(dig.r.watts, DIGESTER_W);
  assert.ok(spinner.r.powered && spinner.r.working, 'it runs the Spinner through the blizzard night');
  assert.match(describeRuntime(s, dig.r), /^Burning biogas · 4\.0 W \(\d+%\)$/);
  // Two units: two burns, back to back, then cold.
  let hours = 0;
  while (hours < 3 * DIGESTER_BURN_HOURS && (dig.r.working || countOf(dig.r.inputs, 'bran') > 0)) { stepSim(s, 30, env); hours++; }
  assert.ok(hours >= 2 * DIGESTER_BURN_HOURS - 1 && hours <= 2 * DIGESTER_BURN_HOURS + 1, `burned for ${hours} h`);
  assert.equal(dig.r.made, 2);
  stepSim(s, 30, env);
  assert.equal(dig.r.watts, 0, 'out of waste, out of power');
  assert.equal(describeRuntime(s, dig.r), 'Waiting for manure, bran or seed cake');
});

test('carts bring the Digester its waste, and a byproduct sent to the Digester goes there first', () => {
  const { s } = craftYard();
  const dig = put(s, 'digester', 6, -28), coop = put(s, 'coop', 22, -28, Math.PI), mill = put(s, 'mill', 22, -46, 0);
  const press = put(s, 'oil_press', 6, -46, 0);
  // Which targets each maker takes.
  for (const [id, ok, bad] of [[mill, ['auto', 'coop', 'composter', 'digester'], ['silo']], [coop, ['auto', 'composter', 'digester', 'silo'], ['coop']],
    [press, ['auto', 'coop', 'composter', 'digester'], ['silo']]] as const) {
    for (const target of ok) assert.ok(apply(s, { type: 'setByproductPriority', id, target }).ok, `${target}`);
    for (const target of bad) assert.ok(!apply(s, { type: 'setByproductPriority', id, target }).ok, `not ${target}`);
  }
  assert.ok(!apply(s, { type: 'setByproductPriority', id: dig, target: 'auto' }).ok, 'the Digester makes no byproduct');
  // The Mill's bran, sent to the Digester, goes there before the hungry Coop.
  assert.ok(apply(s, { type: 'setByproductPriority', id: mill, target: 'digester' }).ok);
  rt(s, mill).outputs = { bran: 2 };
  run(s, 1);
  assert.ok(countOf(rt(s, dig).inputs, 'bran') + (rt(s, dig).working ? 1 : 0) >= 2, `bran in the Digester: ${JSON.stringify(rt(s, dig))}`);
  assert.equal(countOf(rt(s, coop).inputs, 'bran'), 0, 'none to the Coop');
  // The press's seed cake, sent to the Coop, feeds the hens.
  assert.ok(apply(s, { type: 'setByproductPriority', id: press, target: 'coop' }).ok);
  rt(s, press).outputs = { seed_cake: 2 };
  run(s, 1);
  assert.ok(rt(s, coop).made + (rt(s, coop).working ? 1 : 0) + countOf(rt(s, coop).inputs, 'seed_cake') >= 2, 'seed cake to the hens');
  // The Coop's manure with no Composter: on auto, the carts feed it to the Digester.
  rt(s, coop).outputs = { manure: 2 };
  const before = rt(s, dig).made + (rt(s, dig).working ? 1 : 0) + countOf(rt(s, dig).inputs, 'manure');
  run(s, 1);
  assert.equal(countOf(rt(s, coop).outputs, 'manure') <= 1, true, 'the manure was hauled');
  assert.ok(rt(s, dig).made + (rt(s, dig).working ? 1 : 0) + countOf(rt(s, dig).inputs, 'manure') + countOf(rt(s, dig).inputs, 'bran') > before);
});

// --- Sol's Round 1 review of Milestone 5A -------------------------------------------------------------------------------

test('the Digester is dispatchable: it holds its waste on a sunny surplus, and lights the moment a load or a low battery needs it', () => {
  const s = flatLand();
  s.sim.hour = 12;
  const sunny: SimEnv = { windSpeed: 0, cloudCover: 0, weather: 'clear' };
  const dig = building(s, 'digester', 0, -20);
  building(s, 'solar', -8, -20);
  dig.r.inputs = { manure: 2 };
  // Noon sun, nothing asking, no battery: standby, the hopper untouched.
  for (let k = 0; k < 30; k++) stepSim(s, 1, sunny);
  assert.equal(dig.r.working, false);
  assert.deepEqual(dig.r.inputs, { manure: 2 });
  assert.equal(dig.r.watts, 0);
  assert.equal(describeRuntime(s, dig.r), `Standby · 2 waste ready (${DIGESTER_W.toFixed(1)} W on demand)`);
  // A full Battery and the farmhouse's daytime draw within the sun's: still standby.
  const bat = building(s, 'battery', 8, -20);
  bat.r.charge = 1;
  const home = building(s, 'farmhouse', 0, -32);
  for (let k = 0; k < 30; k++) stepSim(s, 1, sunny);
  assert.equal(dig.r.working, false, 'the sun and a full battery carry the day');
  assert.deepEqual(dig.r.inputs, { manure: 2 });
  // Sunset: the canopy dark, the lamps lit. It lights at once and carries them, with no blackout and the battery spared.
  s.sim.hour = 23;
  const events = stepSim(s, 1, { ...sunny, hour: 23 + 1 / 30 }).events;
  assert.ok(dig.r.working, 'lit by the shortfall');
  assert.deepEqual(dig.r.inputs, { manure: 1 });
  assert.ok(home.r.powered);
  assert.equal(events.filter((e) => e.type === 'blackout').length, 0);
  assert.ok(!s.sim.powerSummary.anyBlackout);

  // A Battery drained below 85% on a sunny surplus with nothing asking: it lights to top it up.
  const t = flatLand();
  t.sim.hour = 12;
  const d2 = building(t, 'digester', 0, -20), b2 = building(t, 'battery', 8, -20);
  building(t, 'solar', -8, -20);
  d2.r.inputs = { bran: 1 };
  b2.r.charge = DIGESTER_CHARGE_BELOW + 0.05;
  stepSim(t, 1, sunny);
  assert.equal(d2.r.working, false, 'above 85%: standby');
  b2.r.charge = DIGESTER_CHARGE_BELOW - 0.05;
  stepSim(t, 1, sunny);
  assert.ok(d2.r.working, 'below 85%: lit');
  assert.deepEqual(d2.r.inputs, {});
});

test('paused, the power never lights a cold Digester', () => {
  const s = flatLand();
  s.sim.hour = 23;
  const dig = building(s, 'digester', 0, -20);
  building(s, 'farmhouse', 0, -32);
  dig.r.inputs = { manure: 1 };
  stepPower(s, 0, 23, blizzard);
  assert.equal(dig.r.working, false);
  assert.deepEqual(dig.r.inputs, { manure: 1 });
});

test('one unit of waste gives exactly 16 Wh, and the card reads 0 W the moment the burn ends', () => {
  const s = flatLand();
  const dig = building(s, 'digester', 0, -20), bat = building(s, 'battery', 8, -20);
  dig.r.inputs = { manure: 1 };
  // A step that doesn't divide the four-hour burn: the last one has only a sliver of it left.
  const dtH = 0.3;
  let steps = 0;
  while (dig.r.made === 0 && steps < 100) {
    stepPower(s, dtH, 0, blizzard);
    advanceRecipes(s, dtH, 'blizzard');
    steps++;
    if (dig.r.made === 0) assert.equal(dig.r.watts, DIGESTER_W * Math.min(1, (1 - dig.r.progress + dtH / DIGESTER_BURN_HOURS) * DIGESTER_BURN_HOURS / dtH));
  }
  assert.equal(dig.r.made, 1);
  assert.equal(dig.r.watts, 0, 'burnt out: no stale 4 W');
  assert.equal(dig.r.working, false);
  const wh = bat.r.charge * BATTERY_WH;
  assert.ok(wh <= DIGESTER_W * DIGESTER_BURN_HOURS + 1e-6, `${wh} Wh`);
  assert.ok(Math.abs(wh - DIGESTER_W * DIGESTER_BURN_HOURS) < 0.01, `${wh} Wh`);
});

/** Runs the yard a frame at a time until a cart sets out with `good`; returns where it's bound. */
function firstHaul(s: GameState, good: Good): Endpoint {
  for (let k = 0; k < 30 * 6; k++) {
    stepSim(s, 1, breezy);
    const job = s.sim.carts.find((c) => c.job?.good === good)?.job;
    if (job) return job.to;
  }
  assert.fail(`no cart set out with ${good}`);
}

test('the Cannery and the Loom get their first batch of oil and yarn before the Depot takes the order\'s share', () => {
  {
    const { s } = craftYard();
    const press = put(s, 'oil_press', 6, -28, Math.PI), cannery = put(s, 'cannery', 22, -28, Math.PI);
    s.sim.brief.order.targets = { tomato_sauce: 6, oil: 4 };
    rt(s, cannery).inputs = { tomato: 4 };
    rt(s, press).outputs = { oil: 2 };
    assert.deepEqual(firstHaul(s, 'oil'), { kind: 'thing', id: cannery }, 'oil to the waiting Cannery first');
  }
  {
    const { s } = craftYard();
    const spinner = put(s, 'spinner', 6, -28, Math.PI), loom = put(s, 'loom', 22, -28, Math.PI);
    s.sim.brief.order.targets = { linen: 6, yarn: 4 };
    rt(s, spinner).outputs = { yarn: 2 };
    assert.deepEqual(firstHaul(s, 'yarn'), { kind: 'thing', id: loom }, 'yarn to the waiting Loom first');
  }
  {
    // Once the order wants no more linen, the Loom holds no yarn back from the Depot.
    const { s, depot } = craftYard();
    const spinner = put(s, 'spinner', 6, -28, Math.PI);
    put(s, 'loom', 22, -28, Math.PI);
    s.sim.brief.order.targets = { linen: 6, yarn: 4 };
    s.sim.delivered = { linen: 6 };
    rt(s, spinner).outputs = { yarn: 2 };
    assert.deepEqual(firstHaul(s, 'yarn'), { kind: 'thing', id: depot });
  }
  {
    // With 1 sauce batch (needs 1 oil) and 1 Depot oil remaining, a 2-oil stack sends only 1 oil to the Cannery so the other isn't stranded.
    const { s } = craftYard();
    const press = put(s, 'oil_press', 6, -28, Math.PI), cannery = put(s, 'cannery', 22, -28, Math.PI);
    s.sim.brief.order.targets = { tomato_sauce: 2, oil: 1 };
    rt(s, cannery).inputs = { tomato: 4 };
    rt(s, press).outputs = { oil: 2 };
    let hauledCount = 0;
    for (let k = 0; k < 30 * 6; k++) {
      stepSim(s, 1, breezy);
      const job = s.sim.carts.find((c) => c.job?.good === 'oil')?.job;
      if (job) {
        assert.deepEqual(job.to, { kind: 'thing', id: cannery });
        hauledCount = job.count;
        break;
      }
    }
    assert.equal(hauledCount, 1, 'caps Cannery oil haul to the 1 oil needed for the final sauce batch');
  }
  {
    // When the final required linen batch is already underway in the Loom, Spinner yarn goes straight to the Depot.
    const { s, depot } = craftYard();
    const spinner = put(s, 'spinner', 6, -28, Math.PI), loom = put(s, 'loom', 22, -28, Math.PI);
    s.sim.brief.order.targets = { linen: 2, yarn: 2 };
    rt(s, loom).working = true;
    rt(s, loom).progress = 0.25;
    rt(s, spinner).outputs = { yarn: 2 };
    assert.deepEqual(firstHaul(s, 'yarn'), { kind: 'thing', id: depot }, 'in-progress linen counts toward order, freeing yarn for Depot');
  }
});

test('a shed load on a neighbouring network never causes an overlapping Digester to burn fuel unnecessarily', () => {
  const s = flatLand();
  // Network A: solar (~1.8 W in light cloud at noon) reaches Mill (2.0 W, sheds) and shared Oil Press (1.5 W).
  // Network B: cold Digester (with fuel) sits 22 m away so its emitters don't merge with Solar, but its 15 m range also reaches Oil Press.
  const solar = building(s, 'solar', -11, -20);
  const dig = building(s, 'digester', 11, -20);
  const mill = building(s, 'mill', -19, -20);
  const press = building(s, 'oil_press', 0, -20);
  mill.r.working = true;
  press.r.working = true;
  dig.r.inputs = { manure: 1 };
  // Noon with cloudCover 0.72 -> solar makes ~1.81 W (enough for Oil Press 1.5 W, short of Mill 2.0 W).
  stepPower(s, 0.1, 12, { windSpeed: 0, cloudCover: 0.72 });
  assert.ok(solar.r.watts > 1.5 && solar.r.watts < 2.0, `solar output ${solar.r.watts.toFixed(2)} W`);
  assert.equal(dig.r.working, false, 'Digester stays cold: Solar already covers the shared Oil Press');
  assert.deepEqual(dig.r.inputs, { manure: 1 });
  assert.equal(press.r.powered, true, 'Oil Press runs on Solar');
  assert.equal(mill.r.powered, false, 'Mill sheds on Solar');
});

test('a byproduct sent to a building since taken down goes where Auto would send it', () => {
  const { s } = craftYard();
  const mill = put(s, 'mill', 6, -46, 0), composter = put(s, 'composter', 22, -46, 0), coop = put(s, 'coop', -26, -28, Math.PI);
  const dig = put(s, 'digester', 22, -28);
  assert.ok(apply(s, { type: 'setByproductPriority', id: mill, target: 'digester' }).ok);
  assert.ok(apply(s, { type: 'remove', id: dig }).ok);
  assert.equal(rt(s, mill).priority, 'digester', 'the choice is kept');
  rt(s, mill).outputs = { bran: 2 };
  // As on Auto: the hungry Coop (bran its first choice) before the nearer Composter (bran its second).
  assert.deepEqual(firstHaul(s, 'bran'), { kind: 'thing', id: coop });
  assert.equal(countOf(rt(s, composter).inputs, 'bran'), 0);
});

test('on Auto the Composter eats seed cake before the Digester burns it; sent to the Digester, it goes there first', () => {
  for (const sendTo of ['auto', 'digester'] as const) {
    const { s } = craftYard();
    const press = put(s, 'oil_press', 6, -46, 0), composter = put(s, 'composter', -26, -28, Math.PI), dig = put(s, 'digester', 22, -46);
    assert.ok(apply(s, { type: 'setByproductPriority', id: press, target: sendTo }).ok);
    rt(s, press).outputs = { seed_cake: 2 };
    assert.deepEqual(firstHaul(s, 'seed_cake'), { kind: 'thing', id: sendTo === 'auto' ? composter : dig }, sendTo);
  }
});

test('with the Silo full and a Cannery already standing, the idle carts never ask for another Cannery', () => {
  const { s, silo } = craftYard();
  const cannery = put(s, 'cannery', 22, -28, Math.PI);
  s.sim.brief.order.targets = { linen: 6 };
  rt(s, cannery).inputs = { tomato: 4 };
  rt(s, silo).outputs = { tomato: SILO_GOOD_CAP };
  assert.ok(apply(s, { type: 'paintField', crop: 'tomato', points: [{ x: -44, z: -54 }, { x: -30, z: -54 }], radius: 3 }).ok);
  must(s.fields.find((f) => f.crop === 'tomato'), 'tomatoes').harvestReady = 4;
  const hint = must(diagnoseIdleCarts(s), 'a hint');
  assert.equal(hint, 'Silo has no room for tomato — check the Cannery');
  // With no Cannery standing, it suggests one.
  assert.ok(apply(s, { type: 'remove', id: cannery }).ok);
  assert.equal(diagnoseIdleCarts(s), 'Silo has no room for tomato — build a Cannery to use it');
});

test('each season has its own Pantry Order, all within the 20-Supply cap', () => {
  assert.deepEqual(PANTRY_ORDERS, {
    spring: { bread: 10, flour: 6, beans: 6, honey: 4 }, summer: { tomato_sauce: 6, oil: 4, beans: 6, honey: 4 },
    autumn: { linen: 6, yarn: 4, flour: 6, honey: 2 }, winter: { bread: 8, flour: 6, beans: 6, honey: 2 },
  });
});

// --- Summer and Autumn, played headless to Restored ---------------------------------------------------------------------

/**
 * A rill off the brook toward the terrace, and the Depot's track over it on a plank bridge to the yard (as the Spring
 * Valley's playthrough lays them out). Returns a point `d` metres beside the rill at share `f` of its length.
 */
function terrace(s: GameState): (f: number, d: number) => Point2 {
  let dug = false;
  for (const off of [12, 16, 8, 20]) for (const deg of [70, 60, 80, 90]) {
    if (dug) break;
    const pts = brookSpot(s, off).stroke(deg, 30);
    if (previewChannelFlow(s, pts).wetLength < 18) continue;
    dug = apply(s, { type: 'digChannel', points: pts }).ok;
  }
  assert.ok(dug, 'a channel that runs');
  const P = s.channels[0].path, n = P.length;
  const k = Math.floor(n * 0.92), a0 = P[k - 2], a1 = P[k + 2], L = Math.hypot(a1.x - a0.x, a1.z - a0.z);
  const perp = { x: -(a1.z - a0.z) / L, z: (a1.x - a0.x) / L }, C = P[k];
  const D = s.tracks[0].points[s.tracks[0].points.length - 1];
  const c1 = { x: C.x + perp.x * 7, z: C.z + perp.z * 7 }, c2 = { x: C.x - perp.x * 7, z: C.z - perp.z * 7 };
  const [near, far] = Math.hypot(c1.x - D.x, c1.z - D.z) < Math.hypot(c2.x - D.x, c2.z - D.z) ? [c1, c2] : [c2, c1];
  done(apply(s, { type: 'addTrack', points: [D, near, far, { x: 5, z: -36 }, { x: 22, z: -36 }] }), 'the track');
  return (f: number, d: number) => {
    const i = Math.floor(n * f), a = P[Math.max(0, i - 2)], b = P[Math.min(n - 1, i + 2)], len = Math.hypot(b.x - a.x, b.z - a.z);
    return { x: P[i].x - ((b.z - a.z) / len) * d, z: P[i].z + ((b.x - a.x) / len) * d };
  };
}

/** A water wheel on the brook by the homestead. */
function wheel(s: GameState): number {
  for (let along = -14; along <= 14; along += 2) {
    const p = brookSpot(s, 0).at(along, 5.5), yaw = suggestWaterWheelYaw(s, p.x, p.z);
    if (yaw !== undefined && canPlace(s, 'waterwheel', p.x, p.z, yaw).ok) return must(done(apply(s, { type: 'place', kind: 'waterwheel', x: p.x, z: p.z, yaw }), 'a wheel').created, 'a wheel');
  }
  assert.fail('no room for a water wheel');
}

interface Season5A {
  season: 'summer' | 'autumn';
  /** The crops along each bank of the rill, and further out on the dry terrace (or none). */
  near: Crop; far: Crop; upland?: Crop;
  /** What the starter parcel builds (with the wheel), where ('canopy': over the near field); then what the drops pay for. */
  start: [ThingKind, Point2 | 'canopy'][]; plan: [ThingKind, Point2][];
  /** The workshops whose work the order needs. */
  makers: ThingKind[];
}

const SEASONS_5A: Season5A[] = [
  {
    season: 'summer', near: 'tomato', far: 'beans', upland: 'sunflower',
    start: [['garage', { x: 10, z: -43 }], ['oil_press', { x: -10, z: -42 }], ['cannery', { x: -20, z: -40 }], ['battery', { x: 20, z: -30 }],
      ['beehive', { x: 2, z: -32 }], ['solar', 'canopy']],
    plan: [['silo', { x: 0, z: -43 }], ['waterwheel', { x: 0, z: 0 }], ['solar', { x: 26, z: -24 }], ['battery', { x: 26, z: -46 }]],
    makers: ['oil_press', 'cannery'],
  },
  {
    season: 'autumn', near: 'flax', far: 'wheat',
    start: [['garage', { x: 10, z: -43 }], ['mill', { x: -10, z: -42 }], ['spinner', { x: -20, z: -40 }], ['loom', { x: 22, z: -44 }],
      ['battery', { x: 20, z: -30 }]],
    plan: [['beehive', { x: 2, z: -32 }], ['digester', { x: 0, z: -43 }], ['silo', { x: -26, z: -30 }], ['solar', { x: 26, z: -24 }]],
    makers: ['mill', 'spinner', 'loom'],
  },
];

for (const cfg of SEASONS_5A) test(`the ${cfg.season[0].toUpperCase() + cfg.season.slice(1)} Valley plays through to Restored on its own craft (${cfg.makers.join(', ')}), within 20 Supplies`, (t) => {
  const s = generateValley(1042, cfg.season), sup = s.sim.supplies, h = s.valley.homestead;
  assert.deepEqual(s.sim.brief.order.targets, PANTRY_ORDERS[cfg.season]);
  done(apply(s, { type: 'place', kind: 'farmhouse', x: h.x, z: h.z, yaw: 0 }), 'the farmhouse');
  const beside = terrace(s);
  const nearPts = [0.25, 0.45, 0.65, 0.8].map((f) => beside(f, 2.6));
  done(apply(s, { type: 'paintField', crop: cfg.near, points: nearPts, radius: 2.3 }), cfg.near);
  done(apply(s, { type: 'paintField', crop: cfg.far, points: [0.25, 0.45, 0.65].map((f) => beside(f, -2.6)), radius: 2.3 }), cfg.far);
  if (cfg.upland) done(apply(s, { type: 'paintField', crop: cfg.upland, points: [0.3, 0.5, 0.7].map((f) => beside(f, 9)), radius: 2.3 }), cfg.upland);

  const main = wheel(s), ids = new Map<ThingKind, number>();
  const raise = (kind: ThingKind, at: Point2 | 'canopy') => {
    const id = kind === 'waterwheel' ? wheel(s) : build(s, kind, at === 'canopy' ? nearPts[1] : at, kind === 'garage' ? Math.PI : 0);
    ids.set(kind, id);
    if (CATALOG[kind].powerRole !== 'none' && kind !== 'beehive') joinMain(s, main, id);
  };
  for (const [kind, at] of cfg.start) raise(kind, at);
  assert.equal(sup.available, 0, `the twelve starter Supplies spent (${sup.available} left)`);

  const env = liveEnv(s), events: SimEvent[] = [], when = new Map<string, string>(), plan = [...cfg.plan];
  let hours = 0;
  while (hours < 24 * 6 && !s.sim.brief.restored) {
    for (let k = 0; k < 30; k++) for (const e of stepSim(s, 1, env).events) {
      events.push(e);
      const key = e.type === 'seal' || e.type === 'drop' ? e.message : e.type;
      if (!when.has(key)) when.set(key, formatClock(s.sim.day, s.sim.hour));
    }
    hours++;
    while (plan.length > 0 && sup.available >= costOf(plan[0][0])) { const [kind, at] = must(plan.shift(), 'next'); raise(kind, at); }
    if (plan.length === 0 && sup.available >= 1 && s.sim.carts.length < 2) done(apply(s, { type: 'buyCart' }), 'a second cart');
  }
  t.diagnostic(`Restored on ${when.get('restored') ?? 'never'}: within ${hours} game hours (${(hours / 24).toFixed(2)} game-days)`);
  for (const [k, v] of when) t.diagnostic(`  ${v}: ${k}`);
  const trouble = events.filter((e) => e.type === 'blackout' || e.type === 'steadyReset');
  for (const e of trouble) t.diagnostic(`  ${e.type}: ${e.message}`);
  const b = s.sim.brief;
  t.diagnostic(`  delivered ${JSON.stringify(s.sim.delivered)}; steady ${b.steadyHomestead.hours.toFixed(1)} h ${b.steadyHomestead.pauseReason}; land ${b.livingLand.progress.toFixed(2)}`);

  assert.equal(events.filter((e) => e.type === 'drop').length, 2, 'both drops');
  assert.equal(sup.unlocked, SUPPLY_CAP);
  assert.equal(plan.length, 0, 'everything the drops pay for built');
  assert.ok(sup.spent <= SUPPLY_CAP);
  for (const kind of cfg.makers) assert.ok(rt(s, must(ids.get(kind), kind)).made >= 2, `the ${kind} made ${rt(s, must(ids.get(kind), kind)).made}`);
  // Autumn's Digester burns the Mill's bran into power.
  const dig = ids.get('digester');
  if (dig !== undefined) assert.ok(rt(s, dig).made >= 1, `the Digester burned ${rt(s, dig).made} loads`);
  for (const [good, want] of Object.entries(b.order.targets)) assert.ok(countOf(s.sim.delivered, good as Good) >= want, `${good} delivered`);
  assert.equal(trouble.length, 0, 'no blackout, no reset');
  assert.ok(b.order.done && b.livingLand.done && b.steadyHomestead.done);
  assert.ok(b.restored);
});
