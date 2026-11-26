// The Spring Valley, played headless from an empty homestead to Restored, the way a player might: a farmhouse, a gravity
// channel off the brook, wheat and bean fields along it, a track over the channel on a plank bridge, then the Silo, Garage
// and Mill, a water wheel, a battery and a canopy over the wheat, all joined by relays into one network, inside the
// starter Supplies. The settlement's drops pay for the Coop and Bakery, then the Composter and a second cart. Then the
// homestead runs itself, and the test watches.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, canPlace, costOf, countOf, formatClock, generateValley, type Good, hasWeatherStation, liveEnv, must,
  PANTRY_ORDER, type Point2, previewChannelFlow, type SimEvent, serviceSite, stationForecast, stepSim, suggestWaterWheelYaw, SUPPLY_CAP,
  type ThingKind,
} from '../src/game/index.ts';
import { brookSpot, build, done, joinMain } from './helpers.ts';

// Each runs in the valley's own continuous weather (the spell, the air and any flood from the timeline); the last also
// takes its wind and clouds from the weather (liveEnv), with a stormier character and another weather seed.
const SPRING_RUNS = [
  { cartCount: 1, live: false, weather: {} }, { cartCount: 2, live: false, weather: {} },
  { cartCount: 1, live: true, weather: { weatherSeed: 55, climate: 'stormy' } },
] as const;
for (const { cartCount, live, weather } of SPRING_RUNS) test(`the Spring Valley plays through to Restored with ${cartCount} cart(s) and no blackout once powered${live ? ', wind and clouds from living weather' : ''}`, (t) => {
  const s = generateValley(1042, 'spring', weather), sup = s.sim.supplies, h = s.valley.homestead;
  assert.ok(s.things.some((v) => v.kind === 'depot'), 'the Depot stands from the start');
  done(apply(s, { type: 'place', kind: 'farmhouse', x: h.x, z: h.z, yaw: 0 }), 'the farmhouse');

  // A gravity channel off the brook toward the terrace.
  let dug = false;
  for (const off of [12, 16, 8, 20]) for (const deg of [70, 60, 80, 90]) {
    if (dug) break;
    const pts = brookSpot(s, off).stroke(deg, 30);
    if (previewChannelFlow(s, pts).wetLength < 18) continue;
    dug = apply(s, { type: 'digChannel', points: pts }).ok;
  }
  assert.ok(dug, 'a channel that runs');
  const P = s.channels[0].path, n = P.length;
  const beside = (k: number, d: number): Point2 => {
    const a = P[Math.max(0, k - 2)], b = P[Math.min(n - 1, k + 2)], L = Math.hypot(b.x - a.x, b.z - a.z);
    return { x: P[k].x - ((b.z - a.z) / L) * d, z: P[k].z + ((b.x - a.x) / L) * d };
  };
  // Wheat along one bank of it, beans along the other.
  const wheatPts = [0.25, 0.45, 0.65, 0.8].map((f) => beside(Math.floor(n * f), 2.6));
  done(apply(s, { type: 'paintField', crop: 'wheat', points: wheatPts, radius: 2.3 }), 'the wheat');
  done(apply(s, { type: 'paintField', crop: 'beans', points: [0.25, 0.45, 0.65].map((f) => beside(Math.floor(n * f), -2.6)), radius: 2.3 }), 'the beans');
  assert.equal(s.fields.length, 2);

  // A track from the Depot's stub over the channel near its end (a plank bridge), on to the yard.
  const k = Math.floor(n * 0.92), a0 = P[k - 2], a1 = P[k + 2], L = Math.hypot(a1.x - a0.x, a1.z - a0.z);
  const perp = { x: -(a1.z - a0.z) / L, z: (a1.x - a0.x) / L }, C = P[k];
  const D = s.tracks[0].points[s.tracks[0].points.length - 1];
  const c1 = { x: C.x + perp.x * 7, z: C.z + perp.z * 7 }, c2 = { x: C.x - perp.x * 7, z: C.z - perp.z * 7 };
  const [near, far] = Math.hypot(c1.x - D.x, c1.z - D.z) < Math.hypot(c2.x - D.x, c2.z - D.z) ? [c1, c2] : [c2, c1];
  done(apply(s, { type: 'addTrack', points: [D, near, far, { x: 5, z: -36 }, { x: 22, z: -36 }] }), 'the track');
  assert.ok(s.bridges.length >= 1, 'a plank bridge over the channel');

  // The yard, the power and the network, inside the starter parcel.
  const silo = build(s, 'silo', { x: 0, z: -43 });
  build(s, 'garage', { x: 10, z: -43 }, Math.PI);
  const mill = build(s, 'mill', { x: -10, z: -42 });
  let wheel = -1;
  for (let along = -14; along <= 14 && wheel < 0; along += 2) {
    const p = brookSpot(s, 0).at(along, 5.5), yaw = suggestWaterWheelYaw(s, p.x, p.z);
    if (yaw !== undefined && canPlace(s, 'waterwheel', p.x, p.z, yaw).ok) wheel = must(done(apply(s, { type: 'place', kind: 'waterwheel', x: p.x, z: p.z, yaw }), 'the wheel').created, 'the wheel');
  }
  assert.ok(wheel >= 0, 'a water wheel on the brook');
  build(s, 'battery', { x: 20, z: -30 });
  build(s, 'solar', wheatPts[1]);
  for (const v of [...s.things]) if (v.kind !== 'depot' && v.kind !== 'relay') joinMain(s, wheel, v.id);
  assert.equal(sup.available, 1, 'eleven of the twelve starter Supplies spent');
  assert.equal(s.sim.carts.length, 1, 'the Garage\'s own cart');

  build(s, 'beehive', { x: 2, z: -32 });
  // Then it runs: build what the drops pay for as they come.
  const env = live ? liveEnv(s) : { windSpeed: 4, cloudCover: 0.2 }, events: SimEvent[] = [], when = new Map<string, string>();
  const plan: [ThingKind, Point2][] = [['coop', { x: 22, z: -44 }], ['bakery', { x: -20, z: -40 }], ['composter', { x: -26, z: -30 }]];
  plan.push(['rain_tank', wheatPts[0]]);
  const ids = new Map<ThingKind, number>();
  const started = performance.now();
  let hours = 0;
  while (hours < 24 * 5 && !s.sim.brief.restored) {
    for (let k2 = 0; k2 < 30; k2++) for (const e of stepSim(s, 1, env).events) {
      events.push(e);
      const key = e.type === 'seal' || e.type === 'drop' ? e.message : e.type;
      if (!when.has(key)) when.set(key, formatClock(s.sim.day, s.sim.hour));
    }
    hours++;
    while (plan.length > 0 && sup.available >= (plan[0][0] === 'rain_tank' ? 1 : 2)) {
      const [kind, at] = must(plan.shift(), 'the next building'), id = build(s, kind, at);
      ids.set(kind, id);
      if (kind !== 'composter' && kind !== 'rain_tank') joinMain(s, wheel, id);
    }
    if (plan.length === 0 && sup.available >= 1 && s.sim.carts.length < cartCount) done(apply(s, { type: 'buyCart' }), 'a second cart');
  }
  const ms = performance.now() - started;
  t.diagnostic(`Restored on ${when.get('restored') ?? 'never'}: within ${hours} game hours (${(hours / 24).toFixed(2)} game-days), simulated in ${Math.round(ms)} ms`);
  for (const [k3, v] of when) t.diagnostic(`  ${v}: ${k3 === 'ripe' ? 'a field first ripe' : k3}`);

  // Both drops came, in order, and paid for the rest.
  const drops = events.filter((e) => e.type === 'drop');
  assert.equal(drops.length, 2);
  assert.match(drops[0].message, /first harvest/);
  assert.match(drops[1].message, /first crafted good/);
  assert.equal(sup.unlocked, SUPPLY_CAP);
  assert.ok(sup.drops.every((d) => d.received));
  assert.equal(plan.length, 0, 'the Coop, Bakery and Composter all built');
  assert.equal(s.sim.carts.length, cartCount);
  assert.equal(sup.spent, 18 + cartCount);
  assert.ok(sup.available >= 0 && sup.spent + sup.available === sup.unlocked);

  const tank = must(s.things.find(v => v.kind === 'rain_tank'), 'the Rain Tank');
  assert.ok(serviceSite(s, tank).fields.length > 0, 'the tank serves a planted bank');
  assert.ok(s.sim.delivered.honey === 4, 'the hive supplied the settlement order');

  // The carts brought the harvests in, and every workshop made its goods.
  const made = (id: number) => must(s.sim.things.get(id), 'a runtime').made;
  assert.ok(made(mill) >= 3, `the Mill ground ${made(mill)} times`);
  for (const kind of ['coop', 'bakery', 'composter'] as const) assert.ok(made(must(ids.get(kind), kind)) >= 1, `the ${kind} made ${made(must(ids.get(kind), kind))}`);
  assert.ok(countOf(s.sim.delivered, 'beans') >= 6, 'beans straight from the field to the Depot');
  assert.ok(s.fields.every((f) => f.growth < 1 || f.harvestReady > 0), 'fields replanted after harvest');
  assert.ok(Object.keys(must(s.sim.things.get(silo), 'the silo').outputs).length > 0, 'the Silo holds the surplus');

  t.diagnostic(`Supplies spent: ${sup.spent}/${sup.cap}`);
  // The Pantry Order, in full.
  for (const [g, want] of Object.entries(PANTRY_ORDER)) assert.ok(countOf(s.sim.delivered, g as keyof typeof PANTRY_ORDER) >= (want ?? 0), `${g} delivered`);
  assert.ok(s.sim.brief.order.done);

  // Never a blackout once powered, so Steady Homestead ran straight through.
  assert.equal(events.filter((e) => e.type === 'blackout').length, 0, events.filter((e) => e.type === 'blackout').map((e) => e.message).join('\n'));
  assert.equal(events.filter((e) => e.type === 'steadyReset').length, 0);
  assert.equal(s.sim.powerSummary.lastBlackoutReason, '');

  // All three seals, and the valley Restored, inside five game-days.
  const b = s.sim.brief;
  assert.ok(b.order.done && b.livingLand.done && b.steadyHomestead.done);
  assert.equal(events.filter((e) => e.type === 'seal').length, 3);
  assert.ok(b.restored);
  assert.equal(events.filter((e) => e.type === 'restored').length, 1);
  assert.ok(hours >= 48 && hours <= 24 * 5, `${hours} game hours`);
});

// The Winter Valley, in living weather: the open fields lie frozen, so the homestead grows under glass. A Heated
// Greenhouse grows wheat for the Mill (then beans for the settlement), a Beehive beside it forages inside the warm glass,
// two Water Wheels and a Battery keep it heated through the long nights, and the Weather Station reads the days ahead. All
// inside the 20 Supplies.
test('the Winter Valley plays through to Restored under glass, with a Greenhouse, a Beehive and a Weather Station', (t) => {
  const s = generateValley(1042, 'winter'), sup = s.sim.supplies, h = s.valley.homestead;
  assert.deepEqual(s.sim.brief.order.targets, { bread: 8, flour: 6, beans: 6, honey: 2 });
  done(apply(s, { type: 'place', kind: 'farmhouse', x: h.x, z: h.z, yaw: 0 }), 'the farmhouse');

  // Wheat along a rill off the brook, for Living Land (it lies frozen most of the winter, and never parched).
  let dug = false;
  for (const off of [12, 16, 8, 20]) for (const deg of [70, 60, 80, 90]) {
    if (dug) break;
    const pts = brookSpot(s, off).stroke(deg, 30);
    if (previewChannelFlow(s, pts).wetLength < 18) continue;
    dug = apply(s, { type: 'digChannel', points: pts }).ok;
  }
  assert.ok(dug, 'a channel that runs');
  const P = s.channels[0].path, n = P.length;
  const beside = (k: number, d: number): Point2 => {
    const a = P[Math.max(0, k - 2)], b = P[Math.min(n - 1, k + 2)], L = Math.hypot(b.x - a.x, b.z - a.z);
    return { x: P[k].x - ((b.z - a.z) / L) * d, z: P[k].z + ((b.x - a.x) / L) * d };
  };
  done(apply(s, { type: 'paintField', crop: 'wheat', points: [0.25, 0.45, 0.65, 0.8].map((f) => beside(Math.floor(n * f), 2.6)), radius: 2.3 }), 'the wheat');
  done(apply(s, { type: 'paintField', crop: 'wheat', points: [0.25, 0.45, 0.65].map((f) => beside(Math.floor(n * f), -2.6)), radius: 2.3 }), 'more wheat');
  const k = Math.floor(n * 0.92), a0 = P[k - 2], a1 = P[k + 2], L = Math.hypot(a1.x - a0.x, a1.z - a0.z);
  const perp = { x: -(a1.z - a0.z) / L, z: (a1.x - a0.x) / L }, C = P[k];
  const D = s.tracks[0].points[s.tracks[0].points.length - 1];
  const c1 = { x: C.x + perp.x * 7, z: C.z + perp.z * 7 }, c2 = { x: C.x - perp.x * 7, z: C.z - perp.z * 7 };
  const [near, far] = Math.hypot(c1.x - D.x, c1.z - D.z) < Math.hypot(c2.x - D.x, c2.z - D.z) ? [c1, c2] : [c2, c1];
  done(apply(s, { type: 'addTrack', points: [D, near, far, { x: 5, z: -36 }, { x: 22, z: -36 }] }), 'the track');

  // The yard and its power inside the starter parcel: the Greenhouse growing wheat, its hive beside it.
  build(s, 'garage', { x: 10, z: -43 }, Math.PI);
  const mill = build(s, 'mill', { x: -10, z: -42 });
  const glass = build(s, 'greenhouse', { x: 0, z: -30 });
  done(apply(s, { type: 'setGreenhouseCrop', id: glass, crop: 'wheat' }), 'wheat under glass');
  const wheels: number[] = [];
  const wheel = () => {
    for (let along = -14; along <= 14; along += 2) {
      const p = brookSpot(s, 0).at(along, 5.5), yaw = suggestWaterWheelYaw(s, p.x, p.z);
      if (yaw !== undefined && canPlace(s, 'waterwheel', p.x, p.z, yaw).ok) return must(done(apply(s, { type: 'place', kind: 'waterwheel', x: p.x, z: p.z, yaw }), 'a wheel').created, 'a wheel');
    }
    assert.fail('no room for a water wheel');
  };
  wheels.push(wheel());
  build(s, 'battery', { x: 20, z: -30 });
  const g = must(s.things.find((v) => v.id === glass), 'the greenhouse');
  const hive = build(s, 'beehive', { x: g.x + 9, z: g.z });
  for (const v of [...s.things]) if (v.kind !== 'depot' && v.kind !== 'relay' && v.kind !== 'beehive') joinMain(s, wheels[0], v.id);
  assert.equal(sup.available, 0, 'the twelve starter Supplies spent');

  const env = liveEnv(s), events: SimEvent[] = [], when = new Map<string, string>();
  const plan: ThingKind[] = ['waterwheel', 'weather_station', 'coop', 'bakery'];
  const ids = new Map<ThingKind, number>();
  let hours = 0, lowest = Infinity, forecasts = 0;
  while (hours < 24 * 7 && !s.sim.brief.restored) {
    for (let k2 = 0; k2 < 30; k2++) for (const e of stepSim(s, 1, env).events) {
      events.push(e);
      const key = e.type === 'seal' || e.type === 'drop' ? e.message : e.type;
      if (!when.has(key)) when.set(key, formatClock(s.sim.day, s.sim.hour));
    }
    hours++;
    lowest = Math.min(lowest, s.sim.weather.tempC);
    while (plan.length > 0 && sup.available >= costOf(plan[0])) {
      const kind = must(plan.shift(), 'the next building');
      const id = kind === 'waterwheel' ? wheel() : build(s, kind, kind === 'weather_station' ? { x: -2, z: -48 } : kind === 'coop' ? { x: 22, z: -44 } : { x: -20, z: -40 });
      if (kind === 'waterwheel') wheels.push(id);
      ids.set(kind, id);
      if (kind !== 'weather_station') joinMain(s, wheels[0], id);
    }
    if (hasWeatherStation(s) && stationForecast(s).length === 3) forecasts++;
    // Wheat under the glass until the order's flour and bread are in, then beans, as a player watching the Depot would.
    const r = must(s.sim.things.get(glass), 'the greenhouse'), o = s.sim.brief.order;
    const crop = countOf(o.delivered, 'flour') >= 6 && countOf(o.delivered, 'bread') >= 8 ? 'beans' : 'wheat';
    if (r.greenhouseCrop !== crop) done(apply(s, { type: 'setGreenhouseCrop', id: glass, crop }), `${crop} under glass`);
  }
  t.diagnostic(`Restored on ${when.get('restored') ?? 'never'}: within ${hours} game hours (${(hours / 24).toFixed(2)} game-days); the coldest hour ${lowest.toFixed(1)}°C`);
  for (const [k3, v] of when) t.diagnostic(`  ${v}: ${k3}`);
  const blackouts = events.filter((e) => e.type === 'blackout' || e.type === 'steadyReset');
  for (const e of blackouts) t.diagnostic(`  ${e.type}: ${e.message}`);

  assert.ok(lowest < 0, 'a real winter: freezing hours');
  assert.equal(blackouts.length, 0, 'the glass stayed heated: no blackout, no reset');
  assert.equal(sup.unlocked, SUPPLY_CAP);
  assert.equal(plan.length, 0, 'the second wheel, the Weather Station, the Coop and the Bakery all built');
  assert.equal(sup.spent, SUPPLY_CAP, 'all 20 Supplies at work');
  assert.ok(forecasts > 0, 'the Weather Station read the days ahead');
  // The glass grew the order's wheat and beans, the bees foraged inside it, and the workshops made the rest.
  assert.ok(must(s.sim.things.get(glass), 'the greenhouse').made >= 6);
  assert.ok(must(s.sim.things.get(hive), 'the hive').made >= 2, 'honey from the winter hive');
  assert.ok(must(s.sim.things.get(mill), 'the mill').made >= 3);
  for (const [good, want] of Object.entries(s.sim.brief.order.targets)) assert.ok(countOf(s.sim.delivered, good as Good) >= want, `${good} delivered`);
  const b = s.sim.brief;
  assert.ok(b.order.done && b.livingLand.done && b.steadyHomestead.done, JSON.stringify({ order: b.order.progress, land: b.livingLand.progress, steady: b.steadyHomestead }));
  assert.ok(b.restored);
});
