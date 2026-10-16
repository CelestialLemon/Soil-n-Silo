import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addStop, buyTruck, canPlace, canReshape, earthPrice, newRoute, place, priceOf, reshape, setTruckRoute } from '../src/game/build.ts';
import { CROPS, EARTH, FIELD, POWER, TRUCK, type BuildingId } from '../src/game/data.ts';
import { placement } from '../src/game/forecast.ts';
import { TERRAIN } from '../src/game/map.ts';
import { centreLevel, corners, FLAT, heightAt, isFlat, isUnbroken, joins } from '../src/game/relief.ts';
import { legLength } from '../src/game/roads.ts';
import { touchesWater, wheelSite } from '../src/game/rules.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { exposureOf, wattsOf } from '../src/game/sim/layout.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, touchRelief, type BuildingOf, type Dir, type GameState, type MachineBuilding } from '../src/game/state.ts';

// Height: levels and ramps (relief.ts), and what they do to trucks, placing, next door, water, wind and soil.

function flat(): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 },
  };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  return s;
}

/** Sets the level (and ramp) of every tile in a box, x0..x1 and y0..y1 inclusive. */
function ground(s: GameState, x0: number, y0: number, x1: number, y1: number, level: number, ramp = FLAT) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * s.map.width + x; s.map.level[i] = level; s.map.ramp[i] = ramp; }
  touchRelief(s);
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number, rot: Dir = 0): BuildingOf<K> {
  const r = place(s, type, x, y, rot);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

test('relief: a ramp rises one level towards its side and joins the ground at both ends; elsewhere a level step is a cliff', () => {
  const s = flat();
  ground(s, 0, 0, 29, 9, 1);           // a terrace along the north
  ground(s, 5, 10, 5, 10, 0, 0);       // a ramp at (5, 10) rising north onto it
  assert.deepEqual(corners(s.map, 5, 10), [1, 1, 0, 0]);
  assert.equal(centreLevel(s.map, 5, 10), 0.5);
  assert.equal(heightAt(s.map, 5.5, 10), 1);
  assert.equal(heightAt(s.map, 5.5, 11), 0);
  assert.ok(joins(s.map, 5, 10, 0), 'up onto the terrace');
  assert.ok(joins(s.map, 5, 10, 2), 'down onto the floor');
  assert.ok(!joins(s.map, 5, 10, 1) && !joins(s.map, 5, 10, 3), 'its sides are cliffs');
  assert.ok(!joins(s.map, 4, 10, 0), 'a level step with no ramp is a cliff');
  assert.ok(isFlat(s.map, 0, 0, 3) && !isFlat(s.map, 4, 9, 2));
  assert.ok(isUnbroken(s.map, 4, 9, 1) && isUnbroken(s.map, 5, 9, 1) && !isUnbroken(s.map, 3, 8, 3) && isUnbroken(s.map, 5, 9, 1));
});

test('trucks: a cliff stops them, a ramp lets them climb, and each level climbed costs TRUCK.climb more tiles', () => {
  const s = flat();
  ground(s, 0, 0, 29, 9, 1);
  const a = put(s, 'silo', 10, 4), b = put(s, 'silo', 10, 20);
  assert.equal(legLength(s, b, a), Infinity, 'no way up');
  const r = reshape(s, 12, 10, 'ramp', 0);
  assert.ok(r.ok, r.ok ? '' : r.error);
  const up = legLength(s, b, a), down = legLength(s, a, b);
  assert.ok(up < Infinity && down < Infinity);
  assert.ok(Math.abs(up - down - TRUCK.climb) < 1e-9, `up ${up}, down ${down}`);
});

test('a truck climbing a ramp is slower and uses more battery than on the flat', () => {
  const run = (climb: boolean) => {
    const s = flat();
    // The garage on the floor, the silo up on a terrace past a wide ramp (or all on the flat).
    if (climb) { ground(s, 0, 0, 29, 14, 1); ground(s, 0, 15, 29, 15, 0, 0); }
    const g = put(s, 'garage', 3, 22), silo = put(s, 'silo', 4, 3);
    const t = buyTruck(s, g);
    assert.ok(t.ok);
    const r = newRoute(s);
    assert.ok(addStop(s, r, silo).ok);
    setTruckRoute(s, t.value.truck, r);
    let time = 0;
    while (t.value.truck.phase !== 'queue' && t.value.truck.phase !== 'dock' && time < 60) { advance(s, 0.1); time += 0.1; }
    return { time, used: TRUCK.battery - t.value.truck.energy };
  };
  const low = run(false), high = run(true);
  assert.ok(high.time > low.time + TRUCK.climb / TRUCK.speed * 0.9, `${high.time} vs ${low.time}`);
  assert.ok(Math.abs(high.used - low.used - TRUCK.climb * TRUCK.joulesPerTile) < 0.2, `${high.used} vs ${low.used}`);
});

test('placing: machines need flat ground and level it for the earthworks price; fields lie over ramps; one tile stands anywhere', () => {
  const s = flat();
  ground(s, 0, 0, 29, 9, 1);
  ground(s, 3, 10, 8, 10, 0, 0);
  // A mill half on the terrace, half below: levelled, for two steps.
  const c = canPlace(s, 'mill', 10, 9);
  assert.ok(c.ok && c.value.level !== null && c.value.steps === 2, JSON.stringify(c));
  const before = s.credits;
  const m = put(s, 'mill', 10, 9);
  assert.equal(before - s.credits, priceOf(s, 'mill') + earthPrice(s, 2));
  assert.ok(isFlat(s.map, m.x, m.y, 2));
  // A field over the ramp needs nothing; one across the cliff is levelled.
  const f = canPlace(s, 'field', 3, 9);
  assert.ok(f.ok && f.value.level === null, 'over a ramp');
  const g = canPlace(s, 'field', 14, 9);
  assert.ok(g.ok && g.value.level !== null && g.value.steps === 3, 'across a cliff');
  // A pylon or sprinkler on the ramp itself.
  for (const t of ['pylon', 'sprinkler', 'turbine'] as const) { const p = canPlace(s, t, 5, 10); assert.ok(p.ok && p.value.steps === 0, t); }
  // The placement card says what levelling costs.
  const card = placement(s, 'bakery', 20, 9).facts.find((x) => x.label === 'Earthworks');
  assert.equal(card?.value, String(earthPrice(s, 2)));
});

test('earthworks raise, lower and ramp a tile, a step at a time, and refuse what they can\'t do', () => {
  const s = flat();
  const before = s.credits;
  assert.ok(reshape(s, 4, 4, 'raise', 0).ok);
  assert.equal(s.map.level[4 * 30 + 4], 1);
  assert.equal(before - s.credits, EARTH.step);
  assert.ok(reshape(s, 4, 5, 'ramp', 0).ok, 'a ramp up onto it');
  assert.ok(joins(s.map, 4, 5, 0));
  assert.ok(!reshape(s, 4, 5, 'ramp', 0).ok, 'already that ramp');
  assert.ok(reshape(s, 4, 5, 'raise', 0).ok);
  assert.deepEqual([s.map.level[5 * 30 + 4], s.map.ramp[5 * 30 + 4]], [1, FLAT], 'raising a ramp flattens it at its top');
  assert.ok(!canReshape(s, 7, 7, 'lower', 0).ok, 'nothing below the valley floor');
  put(s, 'pylon', 8, 8);
  assert.ok(!canReshape(s, 8, 8, 'raise', 0).ok, 'not under a building');
  s.map.terrain[9 * 30 + 9] = TERRAIN.water; s.map.level[9 * 30 + 10] = 1;
  assert.ok(!canReshape(s, 9, 9, 'raise', 0).ok, 'water stays');
  s.map.level[9 * 30 + 9] = 1;
  assert.ok(!canReshape(s, 10, 9, 'lower', 0).ok, 'not below the water beside it');
});

test('next door: goods go down a cliff but not up it', () => {
  for (const fieldUp of [true, false]) {
    const s = flat();
    ground(s, 0, 0, 29, 9, fieldUp ? 1 : 0);
    ground(s, 0, 10, 29, 29, fieldUp ? 0 : 1);
    put(s, 'pylon', 14, 12);
    const bat = put(s, 'battery', 15, 12);
    bat.charge = POWER.battery.capacity;
    const f = put(s, 'field', 10, 7), m = put(s, 'mill', 11, 10) as MachineBuilding;
    f.stored = 6;
    advance(s, 1);
    assert.equal((m.inputs.wheat ?? 0) > 0 || (m.progress ?? null) !== null, fieldUp, `field ${fieldUp ? 'above' : 'below'} the mill`);
  }
});

test('water: a field is watered by water at its own level only; a sprinkler pays to lift water', () => {
  const s = flat();
  for (let y = 0; y < 30; y++) s.map.terrain[y * 30] = TERRAIN.water;
  touchRelief(s);
  assert.ok(touchesWater(s, 1, 5), 'beside water at its level');
  ground(s, 1, 0, 29, 29, 1);
  assert.ok(!touchesWater(s, 1, 5), 'above the water');
  const sp = put(s, 'sprinkler', 3, 3);
  assert.equal(wattsOf(s, sp), POWER.sprinklerNearWater + POWER.sprinklerLift);
  const far = put(s, 'sprinkler', 20, 20);
  assert.equal(wattsOf(s, far), POWER.sprinklerFar + POWER.sprinklerLift);
});

test('wind: a turbine gets more up high, and higher ground beside it shelters it', () => {
  const s = flat();
  ground(s, 10, 10, 20, 20, 2);
  const t = put(s, 'turbine', 15, 15);
  assert.ok(Math.abs(exposureOf(s, t) - (1 + 2 * POWER.windPerLevel)) < 1e-9);
  const low = put(s, 'turbine', 9, 15);
  assert.ok(Math.abs(exposureOf(s, low) - (1 - 2 * POWER.shelter)) < 1e-9, 'two levels of hill beside it');
});

test('erosion: a harvest wears a field\'s ramp tiles more, less so with a tree beside it', () => {
  const wear = (guard: boolean) => {
    const s = flat();
    ground(s, 0, 0, 29, 9, 1);
    ground(s, 4, 10, 6, 10, 0, 0);
    if (guard) { s.map.terrain[10 * 30 + 7] = TERRAIN.tree; touchRelief(s); }
    const f = put(s, 'field', 4, 9);
    f.growth = 0.999;
    advance(s, 0.5);
    return [60 - s.map.fertility[9 * 30 + 4], 60 - s.map.fertility[10 * 30 + 4]];
  };
  const loss = -CROPS.wheat.soil;
  const [flatTile, rampTile] = wear(false), [, guarded] = wear(true);
  assert.ok(Math.abs(flatTile - loss) < 1e-9);
  assert.ok(Math.abs(rampTile - loss * (1 + FIELD.erosion)) < 1e-9, `${rampTile}`);
  assert.ok(Math.abs(guarded - loss * (1 + FIELD.erosionGuarded)) < 1e-9, `${guarded}`);
});

test('a water wheel stands on a river bank at the water\'s level, faces it, and makes more beside a fall', () => {
  const s = flat();
  for (let y = 0; y < 30; y++) for (const x of [14, 15]) { const i = y * 30 + x; s.map.terrain[i] = TERRAIN.water; s.map.current[i] = 1; }
  touchRelief(s);
  assert.equal(wheelSite(s, 4, 4), null, 'nowhere near the river');
  const site = wheelSite(s, 12, 4);
  assert.ok(site && site.rot === 1 && !site.fall && Math.abs(site.watts - POWER.wheel) < 1e-9, JSON.stringify(site));
  assert.ok(!canPlace(s, 'wheel', 4, 4).ok);
  const w = put(s, 'wheel', 12, 4);
  assert.equal(w.rot, 1);
  assert.ok(Math.abs(wattsOf(s, w) - POWER.wheel) < 1e-9);
  // A fall: the river a level lower from row 12 down.
  ground(s, 14, 12, 15, 29, 0); ground(s, 0, 0, 29, 11, 1); ground(s, 16, 12, 29, 29, 0); ground(s, 0, 12, 13, 29, 0);
  const fall = wheelSite(s, 12, 10);
  assert.ok(fall && fall.fall && Math.abs(fall.watts - POWER.wheel * POWER.wheelFall) < 1e-9, JSON.stringify(fall));
  assert.equal(wheelSite(s, 16, 10)?.rot, 3);
  // Still water turns nothing.
  for (let y = 0; y < 30; y++) for (const x of [14, 15]) s.map.current[y * 30 + x] = 0;
  assert.equal(wheelSite(s, 12, 4), null);
});
