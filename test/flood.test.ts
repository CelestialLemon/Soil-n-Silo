// Frost hollows, floods and overflow swales (Milestone 4), and the dry-fields guard on Steady Homestead: each on
// hand-made land whose numbers are known.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, type Crop, DRY_FIELDS, DRY_GRACE_HOURS, FLOOD_DEEP, FLOOD_MIN, type GameState, GROUND, groundAt, growCrops, hollowDepth,
  localTempC, must, weatherDrag, navCellOf, navFor, overlayFlood, passable, refreshFieldWeather, refreshFlood, sandboxSupplies, type SimEvent,
  stepSim, SWALE_MIN_DROP, swalesOf, type ThingKind,
} from '../src/game/index.ts';
import { brookLand, fieldAt, flatLand, land, same } from './helpers.ts';

const cellOf = (s: GameState, x: number, z: number) => Math.floor(z - s.grid.z0) * s.grid.nx + Math.floor(x - s.grid.x0);
/** Paints a field and returns a getter for it (by where it lies: painting another field makes the fields afresh). */
const paint = (s: GameState, crop: Crop, x: number, z: number, radius = 3) => {
  const r = apply(s, { type: 'paintField', crop, points: [{ x, z }], radius });
  assert.ok(r.ok, r.ok ? '' : r.error);
  return () => must(s.fields.find((f) => f.id === s.grid.fieldOf[cellOf(s, x, z)]), `the field at ${x}, ${z}`);
};
const put = (s: GameState, kind: ThingKind, x: number, z: number, yaw = 0) => {
  const r = apply(s, { type: 'place', kind, x, z, yaw });
  assert.ok(r.ok, r.ok ? '' : `${kind}: ${r.error}`);
  return must(r.value.created, kind);
};

// --- Frost hollows ------------------------------------------------------------------------------------------------------

/** A round hollow 2 m deep at (-20, 0) and a knoll 2 m high at (20, 0), on level ground. */
const hollowAndKnoll = () => land({
  height: (x, z) => 2 * Math.exp(-((x - 20) ** 2 + z ** 2) / 50) - 2 * Math.exp(-((x + 20) ** 2 + z ** 2) / 50),
});

test('cold air pools in a hollow on a still clear night, and frost nips its beans while the knoll\'s grow on', () => {
  const s = hollowAndKnoll(), g = s.grid;
  const ix = (x: number) => Math.floor(x - g.x0), iz = (z: number) => Math.floor(z - g.z0);
  assert.ok(hollowDepth(s, ix(-20), iz(0)) > 1, 'the hollow lies below the land round it');
  assert.ok(hollowDepth(s, ix(20), iz(0)) < -1, 'the knoll above it');
  // A still, clear small hour, 2.5°C at the homestead.
  s.sim.hour = 3;
  Object.assign(s.sim.weather, { tempC: 2.5, windSpeed: 1.5, cloudCover: 0, snowDepth: 0 });
  const low = localTempC(s, -20, 0), high = localTempC(s, 20, 0);
  assert.ok(low < 0, `frost in the hollow: ${low.toFixed(2)}°C`);
  assert.ok(high > 2.5, `a touch warmer on the knoll: ${high.toFixed(2)}°C`);
  // By day, or in a wind, the cold drains away.
  s.sim.hour = 13;
  assert.ok(localTempC(s, -20, 0) > low + 1.5);
  s.sim.hour = 3;
  const hollow = paint(s, 'beans', -20, 0), knoll = paint(s, 'beans', 20, 0), hollowBeans = hollow(), knollBeans = knoll();
  assert.notEqual(hollowBeans.id, knollBeans.id);
  hollowBeans.growth = knollBeans.growth = 0.5;
  hollowBeans.avgMoisture = knollBeans.avgMoisture = 0.6;
  growCrops(s, 1, 0);
  assert.ok(hollowBeans.frosted && !knollBeans.frosted);
  assert.ok(hollowBeans.growth < 0.5, 'frost sets the hollow\'s beans back');
  assert.ok(knollBeans.growth > 0.5, 'the knoll\'s grow on');
  // Frost never undoes a sowing: the beans never fall below a fresh replant.
  growCrops(s, 50, 0);
  assert.ok(hollowBeans.growth >= 0.12 - 1e-9);
});

test('wheat shrugs off a light frost but not a hard one', () => {
  const s = hollowAndKnoll(), wheat = fieldAt(s, 'wheat', -20, 0, 3);
  wheat.growth = 0.5;
  wheat.avgMoisture = 0.6;
  s.sim.hour = 3;
  Object.assign(s.sim.weather, { tempC: 2.5, windSpeed: 1.5, cloudCover: 0, snowDepth: 0 });
  growCrops(s, 1, 0);
  assert.ok(wheat.frosted && wheat.growth > 0.5, 'hardy to -2°C');
  const was = wheat.growth;
  s.sim.weather.tempC = -3;
  growCrops(s, 1, 0);
  assert.equal(wheat.growth, was, 'a hard frost stalls it');
  s.sim.weather.tempC = 10;
  s.sim.weather.snowDepth = 0.5;
  growCrops(s, 1, 0);
  assert.equal(wheat.growth, was, 'snow buries it');
});

// --- Floods ---------------------------------------------------------------------------------------------------------------

test('a flood spills over the low meadow, pauses its fields, cuts unbridged ways and goes back exactly as it was', () => {
  // Level ground at 0, an east-west brook along z = 0 with its surface 0.2 m down.
  const s = flatLand(), g = s.grid;
  s.sim.supplies = sandboxSupplies();
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: 20, z: -15 }, { x: 20, z: 0 }, { x: 20, z: 15 }] }).ok);
  const bridge = must(s.bridges[0], 'a bridge over the brook');
  const getBeans = paint(s, 'beans', -20, -6), getFar = paint(s, 'wheat', -20, -40), beans = getBeans(), far = getFar();
  beans.growth = far.growth = 0.4;
  beans.avgMoisture = far.avgMoisture = 0.6;
  const base = Float32Array.from(g.baseWaterLevel), level = Float32Array.from(g.waterLevel), moisture = Float32Array.from(g.moisture);
  const navKey = navFor(s).key, near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  assert.ok(near(groundAt(s, -40, -9).speed, GROUND.meadow.speed), 'dry meadow out from the bank');
  assert.ok(passable(navFor(s), navCellOf(-20, -3)), 'dry meadow by the brook');

  s.sim.weather.floodSurge = 0.38;
  assert.ok(refreshFlood(s), 'the water changed');
  assert.ok(g.flood[cellOf(s, -20, -3.5)] > FLOOD_DEEP, `deep by the bank: ${g.flood[cellOf(s, -20, -3.5)].toFixed(3)} m`);
  assert.ok(g.waterLevel[cellOf(s, -20, -3.5)] > 0, 'drawn as water');
  assert.equal(g.flood[cellOf(s, -20, -30)], 0, 'never far from the bank');
  assert.ok(same(g.baseWaterLevel, base), 'the natural water is never touched');
  assert.ok(beans.flooded && !far.flooded);
  growCrops(s, 2, 1);
  assert.equal(beans.growth, 0.4, 'a flooded field waits');
  assert.ok(far.growth > 0.4);
  const nav = navFor(s);
  assert.notEqual(nav.key, navKey, 'the carts\' map is redrawn');
  assert.ok(!passable(nav, navCellOf(-20, -3)), 'deep flood water cuts the way');
  assert.ok(passable(nav, navCellOf(-20, -30)));
  assert.ok(passable(nav, navCellOf(bridge.x, bridge.z)), 'the bridge still carries it');
  assert.ok(g.flood[cellOf(s, -40, -8.5)] > FLOOD_MIN && g.flood[cellOf(s, -40, -8.5)] <= FLOOD_DEEP, 'shallow at the flood\'s edge');
  assert.ok(near(groundAt(s, -40, -9).speed, GROUND.mud.speed), 'and muddy: the carts slow');

  // A move under 2 cm leaves the water as it is.
  s.sim.weather.floodSurge = 0.37;
  assert.ok(!refreshFlood(s));
  // A shallow flood is mud: passable, slow.
  s.sim.weather.floodSurge = 0.3;
  assert.ok(refreshFlood(s));
  const shallow = g.flood[cellOf(s, -20, -3.5)];
  assert.ok(shallow > FLOOD_MIN && shallow <= FLOOD_DEEP, `shallow: ${shallow.toFixed(3)} m`);
  assert.ok(g.flood[cellOf(s, -20, -4.5)] > FLOOD_MIN && g.flood[cellOf(s, -20, -4.5)] <= FLOOD_DEEP);
  assert.ok(passable(navFor(s), navCellOf(-20, -5)), 'shallow flood water is passable');


  // It recedes cleanly.
  s.sim.weather.floodSurge = 0;
  assert.ok(refreshFlood(s));
  assert.ok(g.flood.every((d) => d === 0));
  assert.ok(same(g.waterLevel, level), 'the water stands where it did');
  assert.ok(same(g.moisture, moisture), 'and the banks are as wet as they were');
  assert.ok(!beans.flooded);
  assert.ok(passable(navFor(s), navCellOf(-20, -3)));
});

test('a soaked catchment brings the flood up as the homestead runs, and says so', () => {
  const s = flatLand();
  s.sim.hour = 10;
  s.sim.weatherOverride = 'storm';
  s.sim.weather.soak = 1;
  let changed = 0;
  const events: SimEvent[] = [];
  for (let k = 0; k < 8 * 30; k++) {
    const tick = stepSim(s, 1, { windSpeed: 12, cloudCover: 1 });
    if (tick.waterChanged) { changed++; assert.ok(tick.groundChanged); }
    events.push(...tick.events);
  }
  assert.ok(changed >= 3, `redrawn as it rose, step by step (${changed})`);
  assert.ok(changed < 30, 'but not every tick');
  assert.ok(s.sim.floodApplied > 0.3);
  assert.ok(events.some((e) => e.type === 'flood'));
});

test('an overflow swale off the brook keeps the meadow round it drier', () => {
  // Ground falling 3 cm/m east; the brook along x = -2.
  const make = (swale: boolean) => {
    const s = brookLand();
    if (swale) assert.ok(apply(s, { type: 'digChannel', points: [{ x: -1, z: 0 }, { x: 10, z: 0 }, { x: 22, z: 0 }] }).ok);
    s.sim.weather.floodSurge = 0.38;
    refreshFlood(s, true);
    return s;
  };
  const plain = make(false), relieved = make(true);
  const [sw] = swalesOf(relieved);
  assert.ok(sw && sw.wetLength >= 8 && sw.drop >= 0.25, 'the rill is a swale');
  assert.deepEqual(swalesOf(plain), []);
  const volume = (s: GameState) => {
    let v = 0;
    for (let z = 3; z <= 12; z++) for (let x = 0; x <= 14; x++) v += s.grid.flood[cellOf(s, x + 0.5, z + 0.5)];
    return v;
  };
  assert.ok(volume(plain) > 0, 'the meadow floods without it');
  assert.ok(volume(relieved) < 0.6 * volume(plain), `${volume(relieved).toFixed(2)} vs ${volume(plain).toFixed(2)} m³`);
  // A short rill isn't a swale.
  const short = brookLand();
  assert.ok(apply(short, { type: 'digChannel', points: [{ x: -1, z: 0 }, { x: 4, z: 0 }] }).ok);
  assert.deepEqual(swalesOf(short), []);
});

test('a higher flood reaches a cell past a lower bank nearer to it', () => {
  // Level ground at 0 and two brooks 4 m apart (bank to bank): a low one along x = -3 (its surface 0.3 m down) and a higher
  // one along x = 3 (0.1 m down). In a 0.3 m surge the low one stands at 0, the high one at 0.2 m.
  const s = land({ height: () => 0, water: (x) => (Math.abs(x + 3) <= 1 ? -0.3 : Math.abs(x - 3) <= 1 ? -0.1 : undefined), depth: 0.6 });
  const g = s.grid, level = Float32Array.from(g.baseWaterLevel), depth = new Float32Array(g.nx * g.nz);
  overlayFlood(s, 0.3, level, depth);
  // The cell right by the low bank is 1 m from it but 4 m from the high one: the high water, thinned 2 cm/m, stands at
  // 0.12 m there, well above the low water's -0.02 m.
  for (const [x, want] of [[-1.5, 0.12], [-0.5, 0.14], [0.5, 0.16], [1.5, 0.18]]) {
    const i = cellOf(s, x, 0.5);
    assert.ok(Math.abs(level[i] - want) < 0.005, `x = ${x}: the higher surface ${want} m, not the nearer lower one (${level[i].toFixed(3)})`);
    assert.ok(depth[i] > FLOOD_MIN);
  }
  // Beyond the low brook only its own (lower) water spreads: the high flood never crosses it.
  assert.ok(Math.abs(level[cellOf(s, -4.5, 0.5)] - -0.02) < 0.005);
});

test('a rill that loops back into the same brook is no swale; one that carries the water downhill is', () => {
  // Ground falling 3 cm/m east; the brook along x = -2.
  const loop = brookLand();
  assert.ok(apply(loop, { type: 'digChannel', points: [{ x: -1, z: -6 }, { x: 14, z: -6 }, { x: 14, z: 6 }, { x: -1, z: 6 }] }).ok);
  const flow = must(loop.channels[0], 'the loop').flow;
  assert.ok(flow.every((p) => p.wet), 'the water runs all the way round');
  const low = Math.min(...flow.map((p) => p.waterLevel));
  assert.ok(flow[0].waterLevel - low >= SWALE_MIN_DROP, 'its middle dips well below the brook');
  assert.deepEqual(swalesOf(loop), [], 'but it brings the water back to the same brook: no swale');
  const out = brookLand();
  assert.ok(apply(out, { type: 'digChannel', points: [{ x: -1, z: 0 }, { x: 10, z: 0 }, { x: 22, z: 0 }] }).ok);
  const [sw] = swalesOf(out);
  assert.ok(sw && sw.drop >= SWALE_MIN_DROP, 'a swale out onto lower ground');
  // Under a full surge, the loop leaves the meadow by its intake as flooded as no rill at all; the swale relieves it.
  const flood = (s: GameState) => {
    s.sim.weather.floodSurge = 0.38;
    refreshFlood(s, true);
    let v = 0;
    for (let z = -3; z <= 3; z++) for (let x = 0; x <= 4; x++) v += s.grid.flood[cellOf(s, x + 0.5, z + 0.5)];
    return v;
  };
  const plain = brookLand();
  assert.ok(flood(plain) > 0 && flood(loop) >= 0.95 * flood(plain), 'the loop relieves nothing');
  assert.ok(flood(out) < 0.8 * flood(plain), 'the swale does');
});

test('after a jump of the stopped clock, the fields\' frost is read afresh without growing them', () => {
  const s = hollowAndKnoll(), beans = fieldAt(s, 'beans', -20, 0, 3);
  beans.growth = 0.5;
  beans.avgMoisture = 0.6;
  // A still clear small hour, frost in the hollow: a running tick frosts the beans.
  s.sim.hour = 3;
  Object.assign(s.sim.weather, { tempC: 1, windSpeed: 1.5, cloudCover: 0, snowDepth: 0 });
  growCrops(s, 0, 0);
  assert.ok(beans.frosted);
  // The clock jumps to a warm afternoon while stopped: no tick runs, but the field is read again.
  s.sim.hour = 15;
  s.sim.weather.tempC = 14;
  refreshFieldWeather(s);
  assert.ok(!beans.frosted, 'thawed');
  assert.equal(beans.growth, 0.5, 'nothing grew');
  // And back to a hard frost; the flood mark is read too.
  s.sim.hour = 4;
  s.sim.weather.tempC = -4;
  refreshFieldWeather(s);
  assert.ok(beans.frosted && !beans.flooded);
  assert.equal(beans.growth, 0.5);
});

test('gales slow unsheltered carts, cold drains their batteries, and soaked ground bogs them off the track', () => {
  const s = land({ height: () => 0 }), at = { x: 0, z: 0 };
  Object.assign(s.sim.weather, { windSpeed: 4, tempC: 10, groundWet: 0.2 });
  assert.deepEqual(weatherDrag(s, at, false), { speed: 1, drain: 1 });
  s.sim.weather.windSpeed = 14;
  assert.equal(weatherDrag(s, at, true).speed, 0.88);
  s.hedges.push({ id: 20, points: [], path: [{ x: 1.5, z: -4 }, { x: 1.5, z: 4 }] });
  assert.equal(weatherDrag(s, at, true).speed, 1, 'a hedge breaks the gale');
  s.sim.weather.tempC = -3;
  assert.equal(weatherDrag(s, at, true).drain, 1.15);
  s.sim.weather.groundWet = 0.9;
  assert.deepEqual(weatherDrag(s, at, true), { speed: 1, drain: 1.15 }, 'the track stays firm');
  const off = weatherDrag(s, at, false);
  assert.ok(Math.abs(off.speed - 0.85) < 1e-9 && Math.abs(off.drain - 1.15 * 1.15) < 1e-9);
});

// --- Dry fields ----------------------------------------------------------------------------------------------------------

test('Steady Homestead pauses while every growing field stays parched, and goes on once they\'re watered', () => {
  const s = flatLand();
  s.sim.supplies = sandboxSupplies();
  s.sim.hour = 9;
  s.sim.weatherOverride = 'clear';
  put(s, 'farmhouse', -10, -16);
  put(s, 'garage', 6, -16, Math.PI);
  put(s, 'mill', -10, -32, Math.PI);
  for (const x of [-18, -2, 14]) put(s, 'turbine', x, -24);
  const field = fieldAt(s, 'wheat', 30, -50, 3);
  field.growth = 0.2;
  assert.ok(field.avgMoisture < 0.25, `a dry upland field (${field.avgMoisture.toFixed(2)})`);
  const env = { windSpeed: 12, cloudCover: 0 }, h = s.sim.brief.steadyHomestead;
  for (let k = 0; k < (DRY_GRACE_HOURS + 2) * 30; k++) stepSim(s, 1, env);
  assert.ok(h.paused, 'paused');
  // Read afresh each time (an assertion narrows the field's type for the rest of the test).
  const reason = (): string => h.pauseReason;
  assert.equal(reason(), DRY_FIELDS);
  const held = h.hours;
  assert.ok(held > DRY_GRACE_HOURS - 0.5 && held < DRY_GRACE_HOURS + 0.5, `the grace hours count (${held.toFixed(2)})`);
  for (let k = 0; k < 30; k++) stepSim(s, 1, env);
  assert.equal(h.hours, held, 'no hours while paused');
  s.sim.weatherOverride = 'soft-rain';
  for (let k = 0; k < 30; k++) stepSim(s, 1, env);
  assert.ok(!h.paused && reason() === '');
  assert.ok(h.hours > held, 'rain waters the fields and the hours count again');
});
