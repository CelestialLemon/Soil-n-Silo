import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addStop, buyTruck, canPlace, canReshape, earthPrice, levelledFor, levelling, newRoute, place, priceOf, remove, reshape, setCrop, setTruckRoute, type Dig } from '../src/game/build.ts';
import { CROPS, EARTH, FIELD, POWER, TRUCK, type BuildingId } from '../src/game/data.ts';
import { placement } from '../src/game/forecast.ts';
import { TERRAIN } from '../src/game/map.ts';
import { centreLevel, corners, heightAt, isFlat, isGentle, isUnbroken, joins, MAX_LEVEL, sheetAt, spanOf, STEEP } from '../src/game/relief.ts';
import { accessTiles, distanceTo, isOpen, legLength } from '../src/game/roads.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { touchesWater, wheelSite } from '../src/game/rules.ts';
import { climateOf, type Character, type Season } from '../src/game/seasons.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { exposureOf, handsTo, isGuarded, wattsOf } from '../src/game/sim/layout.ts';
import { advance } from '../src/game/sim/step.ts';
import { redirect } from '../src/game/sim/trucks.ts';
import { served } from '../src/game/sim/describe.ts';
import { buildingAt, newGame, touchRelief, type BuildingOf, type Dir, type GameState } from '../src/game/state.ts';

// Height: corner heights (relief.ts), and what they do to trucks, placing, earthworks, next door, water, wind and soil.

function flat(): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0, relief: 0 },
  };
  const s = newGame(sc);
  s.map.corner.fill(0);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  touchRelief(s);
  return s;
}

/** Sets every corner of every tile in a box, x0..x1 and y0..y1 inclusive, to `level` (a cliff where it meets other ground). */
function ground(s: GameState, x0: number, y0: number, x1: number, y1: number, level: number) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tile(s, x, y, [level, level, level, level]);
}

/** Sets one tile's corners (north-west, north-east, south-east, south-west). */
function tile(s: GameState, x: number, y: number, c: number[]) {
  const i = (y * s.map.width + x) * 4;
  for (let k = 0; k < 4; k++) s.map.corner[i + k] = c[k];
  touchRelief(s);
}

/** Lays the whole map as one sheet of ground, each point (px, py) at `f(px, py)`: slopes that join everywhere. */
function shape(s: GameState, f: (px: number, py: number) => number) {
  for (let y = 0; y < s.map.height; y++) for (let x = 0; x < s.map.width; x++) tile(s, x, y, [f(x, y), f(x + 1, y), f(x + 1, y + 1), f(x, y + 1)]);
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number, rot: Dir = 0): BuildingOf<K> {
  const r = place(s, type, x, y, rot);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

/** A dig at a single point, from the tile `at` that touches it. */
const at = (how: Dig['how'], px: number, py: number, x: number, y: number): Dig => ({ how, from: { x: px, y: py }, to: { x: px, y: py }, at: { x, y } });

test('relief: a tile slopes between its corners, joins its neighbours where their corners meet, and is a cliff elsewhere', () => {
  const s = flat();
  ground(s, 0, 0, 29, 9, 2);           // a terrace along the north
  tile(s, 5, 10, [2, 2, 0, 0]);        // a bank at (5, 10) up onto it
  tile(s, 6, 10, [2, 2, 1, 1]);        // and a gentle slope beside it, down to a step
  assert.equal(centreLevel(s.map, 5, 10), 1);
  assert.equal(heightAt(s.map, 5.5, 10), 2);
  assert.equal(heightAt(s.map, 5.5, 11), 0);
  assert.equal(spanOf(s.map, 5, 10), STEEP);
  assert.ok(!isGentle(s.map, 5, 10) && isGentle(s.map, 6, 10), 'steep and gentle');
  assert.ok(joins(s.map, 5, 10, 0) && joins(s.map, 5, 10, 2), 'up onto the terrace, down onto the floor');
  assert.ok(!joins(s.map, 5, 10, 1) && !joins(s.map, 6, 10, 2), 'a bank and a slope that don\'t meet; a slope ending in a step');
  assert.ok(!joins(s.map, 4, 10, 0), 'a step with no slope is a cliff');
  assert.ok(isFlat(s.map, 0, 0, 3) && !isFlat(s.map, 4, 9, 2));
  assert.ok(isUnbroken(s.map, 5, 9, 1) && !isUnbroken(s.map, 4, 9, 2));
  // At the point between them, the terrace and the bank are one sheet; the floor below the cliff is another.
  assert.deepEqual(sheetAt(s.map, 5, 10, { x: 5, y: 9 }).map((t) => `${t.x},${t.y}`).sort(), ['4,9', '5,10', '5,9']);
});

test('trucks: a cliff stops them, a slope lets them climb, a steep bank doesn\'t; each level climbed costs TRUCK.climb more tiles', () => {
  const s = flat();
  ground(s, 0, 0, 29, 9, 1);
  const a = put(s, 'silo', 10, 4), b = put(s, 'silo', 10, 20);
  assert.equal(legLength(s, b, a), Infinity, 'no way up');
  // Raising the two points at the foot of the cliff below (12, 9) slopes the tile below them up to the terrace.
  const r = reshape(s, { how: 'raise', from: { x: 12, y: 10 }, to: { x: 13, y: 10 }, at: { x: 12, y: 10 } });
  assert.ok(r.ok, r.ok ? '' : r.error);
  assert.deepEqual(corners(s.map, 12, 10), [1, 1, 0, 0]);
  const up = legLength(s, b, a), down = legLength(s, a, b);
  assert.ok(up < Infinity && down < Infinity);
  assert.ok(Math.abs(up - down - TRUCK.climb) < 1e-9, `up ${up}, down ${down}`);
  // Steepened into a bank, the slope is no road.
  tile(s, 12, 10, [2, 2, 0, 0]);
  assert.ok(!isOpen(s, 12, 10));
});

/** The terrace of `rise` levels over the north of the map, a slope of a level a row down to the floor (or all on the flat). */
const terrace = (s: GameState, rise: number) => shape(s, (_, py) => Math.max(0, Math.min(rise, 16 - py)));

test('a truck climbing a slope is slower and uses more battery than on the flat', () => {
  const run = (climb: boolean) => {
    const s = flat();
    // The garage on the floor, the silo up on the terrace (or all on the flat).
    if (climb) terrace(s, 3);
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
  const low = run(false), high = run(true), extra = 3 * TRUCK.climb;
  assert.ok(high.time > low.time + extra / TRUCK.speed * 0.8, `${high.time} vs ${low.time}`);
  assert.ok(Math.abs(high.used - low.used - extra * TRUCK.joulesPerTile) < 0.2, `${high.used} vs ${low.used}`);
});

test('placing: machines need flat ground and level it for the earthworks price, sloping the ground round them; fields lie on slopes', () => {
  const s = flat();
  ground(s, 0, 0, 29, 9, 1);
  // A mill half on the terrace, half below: levelled to the lower, for six steps (three points on the terrace, and three
  // along the cliff's edge, at the top of the cliff).
  const c = canPlace(s, 'mill', 10, 9);
  assert.ok(c.ok && c.value.level === 0 && c.value.move.steps === 6, JSON.stringify(c.ok && { level: c.value.level, steps: c.value.move.steps }));
  const before = s.credits;
  const m = put(s, 'mill', 10, 9);
  assert.equal(before - s.credits, priceOf(s, 'mill') + earthPrice(s, 6));
  assert.ok(isFlat(s.map, m.x, m.y, 2));
  // The terrace it was cut into slopes down to it rather than standing over it at a cliff.
  assert.deepEqual(corners(s.map, 10, 8), [1, 1, 0, 0]);
  assert.ok(joins(s.map, 10, 8, 2) && joins(s.map, 9, 9, 1));
  // A field on a gentle slope needs nothing; one across the cliff is levelled.
  terrace(s, 3);
  const f = canPlace(s, 'field', 3, 12);
  assert.ok(f.ok && f.value.level === null, 'on a slope');
  ground(s, 14, 20, 29, 29, 4);
  const g = canPlace(s, 'field', 13, 19);
  assert.ok(g.ok && g.value.level !== null && g.value.move.steps > 0, 'across a cliff');
  // A pylon, sprinkler or turbine on the slope itself.
  for (const t of ['pylon', 'sprinkler', 'turbine'] as const) { const p = canPlace(s, t, 5, 14); assert.ok(p.ok && p.value.move.steps === 0, t); }
  // The placement card says what levelling costs.
  const card = placement(s, 'bakery', 20, 13).facts.find((x) => x.label === 'Earthworks');
  const gw = canPlace(s, 'bakery', 20, 13);
  assert.ok(gw.ok);
  assert.equal(card?.value, String(earthPrice(s, gw.value.move.steps)));
});

test('earthworks raise and lower the ground at a point a level, with every tile that joins there, and refuse what they can\'t do', () => {
  const s = flat();
  const before = s.credits;
  assert.ok(reshape(s, at('raise', 5, 5, 4, 4)).ok);
  assert.deepEqual([corners(s.map, 4, 4)[2], corners(s.map, 5, 4)[3], corners(s.map, 5, 5)[0], corners(s.map, 4, 5)[1]], [1, 1, 1, 1]);
  assert.equal(before - s.credits, EARTH.step);
  assert.ok(reshape(s, at('raise', 5, 5, 4, 4)).ok);
  assert.ok(!canReshape(s, at('raise', 5, 5, 4, 4)).ok, 'too steep');
  // An area: every point in it, for a step each.
  const area: Dig = { how: 'raise', from: { x: 10, y: 10 }, to: { x: 12, y: 12 }, at: { x: 10, y: 10 } };
  const r = reshape(s, area);
  assert.ok(r.ok && r.value.steps === 9);
  assert.ok(isFlat(s.map, 10, 10, 2) && corners(s.map, 10, 10)[0] === 1);
  assert.ok(!canReshape(s, at('lower', 7, 7, 7, 7)).ok, 'nothing below the valley floor');
  // Levelling flattens a tile at its middle height (rounded), the ground round it following.
  assert.ok(reshape(s, at('level', 5, 5, 4, 4)).ok);
  assert.ok(isFlat(s.map, 4, 4, 1));
  put(s, 'pylon', 8, 8);
  assert.ok(!canReshape(s, at('raise', 8, 8, 7, 7)).ok, 'not under a building');
  // Water stays, and the ground can't go below it.
  ground(s, 18, 18, 24, 24, 2);
  s.map.terrain[20 * 30 + 20] = TERRAIN.water;
  touchRelief(s);
  assert.ok(!canReshape(s, at('raise', 20, 20, 20, 20)).ok, 'water stays');
  assert.ok(!canReshape(s, at('lower', 20, 20, 19, 19)).ok, 'not below the water beside it');
  assert.ok(reshape(s, at('raise', 20, 20, 19, 19)).ok, 'the bank rises; the water doesn\'t');
  assert.equal(spanOf(s.map, 20, 20), 0);
});

test('next door: goods pass where the ground joins, never across a cliff', () => {
  for (const cliff of [true, false]) {
    const s = flat();
    if (cliff) ground(s, 0, 0, 29, 9, 1);
    put(s, 'pylon', 14, 12);
    const bat = put(s, 'battery', 15, 12);
    bat.charge = POWER.battery.capacity;
    const f = put(s, 'field', 10, 7), m = put(s, 'mill', 11, 10);
    f.stored = 6;
    advance(s, 1);
    assert.equal((m.inputs.wheat ?? 0) > 0 || (m.progress ?? null) !== null, !cliff, cliff ? 'across a cliff' : 'on the flat');
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
  assert.ok(Math.abs(exposureOf(s, low) - (1 - 2 * POWER.shelterHill)) < 1e-9, 'two levels of hill beside it');
});

test('erosion: a harvest wears a field\'s sloping tiles more the steeper they are, less so with a tree beside it', () => {
  const wear = (guard: boolean) => {
    const s = flat();
    // The field's rows: flat, gentle (a level across), steep (two).
    shape(s, (_, py) => (py <= 5 ? 3 : py === 6 ? 2 : 0));
    if (guard) { s.map.terrain[5 * 30 + 7] = TERRAIN.tree; touchRelief(s); }
    const f = put(s, 'field', 4, 4);
    f.growth = 0.999;
    advance(s, 0.5);
    return [4, 5, 6].map((y) => 60 - s.map.fertility[y * 30 + 4]);
  };
  const loss = -CROPS.wheat.soil;
  const [flatTile, gentle, steep] = wear(false), [, , guarded] = wear(true);
  assert.ok(Math.abs(flatTile - loss) < 1e-9);
  assert.ok(Math.abs(gentle - loss * (1 + FIELD.erosion / 2)) < 1e-9, `${gentle}`);
  assert.ok(Math.abs(steep - loss * (1 + FIELD.erosion)) < 1e-9, `${steep}`);
  assert.ok(Math.abs(guarded - loss * (1 + FIELD.erosionGuarded)) < 1e-9, `${guarded}`);
});

test('a water wheel stands on a river bank at the water\'s level, faces it, and makes more beside a fall', () => {
  const s = flat();
  s.scenario.climate.river.flow = 1;
  for (let y = 0; y < 30; y++) for (const x of [14, 15]) { const i = y * 30 + x; s.map.terrain[i] = TERRAIN.water; s.map.current[i] = 1; }
  touchRelief(s);
  assert.equal(wheelSite(s, 4, 4), null, 'nowhere near the river');
  const site = wheelSite(s, 12, 4);
  assert.ok(site && site.rot === 1 && !site.fall && Math.abs(site.watts - POWER.wheel) < 1e-9, JSON.stringify(site));
  assert.ok(!canPlace(s, 'wheel', 4, 4).ok);
  const w = put(s, 'wheel', 12, 4);
  assert.equal(w.rot, 1);
  assert.ok(Math.abs(wattsOf(s, w) - POWER.wheel) < 1e-9);
  // A fall: the river a few levels lower from row 12 down.
  ground(s, 0, 0, 29, 11, 3); ground(s, 0, 12, 29, 29, 0);
  const fall = wheelSite(s, 12, 10);
  assert.ok(fall && fall.fall && Math.abs(fall.watts - POWER.wheel * POWER.wheelFall) < 1e-9, JSON.stringify(fall));
  assert.equal(wheelSite(s, 16, 10)?.rot, 3);
  // The season scales the current, and so the watts.
  s.scenario.climate.river.flow = 0.5;
  assert.ok(Math.abs((wheelSite(s, 12, 10)?.watts ?? 0) - 0.5 * POWER.wheel * POWER.wheelFall) < 1e-9);
  // Still water turns nothing.
  for (let y = 0; y < 30; y++) for (const x of [14, 15]) s.map.current[y * 30 + x] = 0;
  assert.equal(wheelSite(s, 12, 4), null);
});

test('a truck spends on each step exactly what the roads counted for it', () => {
  const s = flat();
  terrace(s, 3);
  const g = put(s, 'garage', 3, 22), silo = put(s, 'silo', 4, 3);
  const t = buyTruck(s, g);
  assert.ok(t.ok);
  const r = newRoute(s);
  assert.ok(addStop(s, r, silo).ok);
  setTruckRoute(s, t.value.truck, r);
  const tr = t.value.truck;
  // From its garage (it leaves by the side nearest the silo) to the silo: the battery it uses is the effort the roads
  // counted, to the joule.
  const effort = Math.min(...accessTiles(s, g).map((a) => distanceTo(s, silo, a))), before = tr.energy;
  for (let k = 0; k < 600 && tr.phase !== 'queue' && tr.phase !== 'dock'; k++) advance(s, 0.1);
  assert.ok(tr.phase === 'queue' || tr.phase === 'dock', tr.phase);
  assert.ok(Math.abs(before - tr.energy - effort * TRUCK.joulesPerTile) < 1e-6, `used ${before - tr.energy}, the roads say ${effort * TRUCK.joulesPerTile}`);
});

test('a truck sent off again part way across a tile climbs from where it set off', () => {
  const s = flat();
  // The one way up is the slope at (5, 15); the slope at (6, 16) beside the truck goes nowhere.
  ground(s, 0, 0, 29, 15, 1); tile(s, 5, 15, [1, 1, 0, 0]); tile(s, 6, 16, [0, 1, 1, 0]);
  const g = put(s, 'garage', 3, 22), silo = put(s, 'silo', 4, 3);
  const t = buyTruck(s, g);
  assert.ok(t.ok);
  const r = newRoute(s);
  assert.ok(addStop(s, r, silo).ok);
  const tr = t.value.truck;
  setTruckRoute(s, tr, r);
  Object.assign(tr, { x: 5.55, y: 16.5, phase: 'drive' });
  redirect(s, tr);
  // Within a hundredth of a tile: it starts a little off the tile's centre. Missing the climb would be TRUCK.climb out.
  const effort = distanceTo(s, silo, 16 * 30 + 5), before = tr.energy;
  for (let k = 0; k < 600 && tr.phase !== 'queue' && tr.phase !== 'dock'; k++) advance(s, 0.1);
  assert.ok(tr.phase === 'queue' || tr.phase === 'dock', tr.phase);
  assert.ok(Math.abs(before - tr.energy - effort * TRUCK.joulesPerTile) < 0.01 * TRUCK.joulesPerTile, `used ${before - tr.energy}, the roads say ${effort * TRUCK.joulesPerTile}`);
});

test('a field next door that starts or stops growing beans guards a field against erosion at once', () => {
  const s = flat();
  const f = put(s, 'field', 4, 4), n = put(s, 'field', 7, 4);
  assert.ok(!isGuarded(s, f));
  assert.ok(setCrop(s, n, 'beans').ok);
  assert.ok(isGuarded(s, f));
  assert.ok(setCrop(s, n, 'wheat').ok);
  assert.ok(!isGuarded(s, f));
});

test('the placement card judges water on the ground as it will be once levelled', () => {
  const s = flat();
  for (let y = 0; y < 30; y++) s.map.terrain[y * 30 + 3] = TERRAIN.water;
  ground(s, 0, 0, 29, 29, 1);
  ground(s, 4, 6, 4, 6, 2);
  const card = placement(s, 'field', 4, 5);
  assert.ok(card.facts.some((f) => f.label === 'Earthworks'));
  assert.equal(card.facts.find((f) => f.label === 'Water')?.value, 'beside water');
  const f = put(s, 'field', 4, 5);
  assert.ok(touchesWater(s, f.x, f.y));
});

test('what is worked out on ground levelled for a question holds only while it is levelled', () => {
  const s = flat();
  const turbine = put(s, 'turbine', 10, 10);
  ground(s, 12, 10, 12, 10, 2);
  const sheltered = exposureOf(s, turbine);
  assert.ok(sheltered < 1, 'the higher ground shelters it');
  // Warm and cold: inside, it is worked out for the levelled ground; after, for the ground as it is again.
  const move = levelling(s, { x: 12, y: 10, w: 1, h: 1 }, 0);
  assert.equal(levelledFor(s, move, () => exposureOf(s, turbine)), 1);
  assert.equal(exposureOf(s, turbine), sheltered);
  touchRelief(s);
  assert.equal(levelledFor(s, move, () => exposureOf(s, turbine)), 1);
  assert.equal(exposureOf(s, turbine), sheltered);
});

test('a save with ground the rules don\'t allow is refused', () => {
  const s = flat();
  tile(s, 0, 0, [STEEP + 1, 0, 0, 0]);
  assert.equal(deserialize(serialize(s)).ok, false, 'steeper than a bank');
  tile(s, 0, 0, [MAX_LEVEL + 1, MAX_LEVEL + 1, MAX_LEVEL + 1, MAX_LEVEL + 1]);
  assert.equal(deserialize(serialize(s)).ok, false, 'above the highest level');
  tile(s, 0, 0, [1, 0, 0, 0]);
  assert.equal(deserialize(serialize(s)).ok, true);
  s.map.terrain[0] = TERRAIN.water;
  assert.equal(deserialize(serialize(s)).ok, false, 'water on a slope');
  s.map.terrain[0] = TERRAIN.grass;
  s.scenario.terrain.relief = -1;
  assert.equal(deserialize(serialize(s)).ok, false, 'relief is a share, 0 to 1');
});

test('trucks load only where the ground joins the building, and goods go next door up a joined slope but not across a cliff', () => {
  const s = flat();
  ground(s, 0, 0, 29, 9, 1);
  const silo = put(s, 'silo', 10, 8);   // on the terrace's edge: its south side faces a cliff
  assert.ok(accessTiles(s, silo).every((i) => Math.floor(i / 30) < 10), 'never from below the cliff');
  // A field on the floor rising onto the terrace by a slope under it trades with a mill whose edge it joins.
  for (const x of [20, 21, 22]) tile(s, x, 10, [1, 1, 0, 0]);
  const f = put(s, 'field', 20, 10), m = put(s, 'mill', 20, 8);
  assert.ok(handsTo(s, f, m) && handsTo(s, m, f), 'up and down a joined slope');
  const g = put(s, 'field', 24, 10), n = put(s, 'mill', 24, 8);
  assert.ok(!handsTo(s, g, n) && !handsTo(s, n, g), 'not across a cliff');
});

test('a field below a mill up a cliff is not served by it: its wheat needs a truck', () => {
  const s = flat();
  ground(s, 10, 0, 29, 29, 1);
  const f = put(s, 'field', 7, 4);
  put(s, 'mill', 10, 4);
  assert.ok(!handsTo(s, f, buildingAt(s, 10, 4)!));
  assert.ok(!served(s, f, 'wheat', 'pick'));
});

test('a truck at a garage between two pieces of ground leaves by the side that reaches its stop', () => {
  const s = flat();
  // A belt of woods splits the map in two; the garage stands in a gap in it, open to both sides.
  for (let y = 0; y < 30; y++) for (const x of [12, 13]) if (y < 10 || y > 11) s.map.terrain[y * 30 + x] = TERRAIN.tree;
  touchRelief(s);
  const g = put(s, 'garage', 12, 10), silo = put(s, 'silo', 3, 10);
  const t = buyTruck(s, g);
  assert.ok(t.ok);
  assert.ok(t.value.truck.x > 14, 'bought on the east side, away from the silo');
  const r = newRoute(s);
  assert.ok(addStop(s, r, silo).ok);
  setTruckRoute(s, t.value.truck, r);
  for (let k = 0; k < 200 && t.value.truck.phase !== 'queue' && t.value.truck.phase !== 'dock'; k++) advance(s, 0.1);
  assert.ok(t.value.truck.phase === 'queue' || t.value.truck.phase === 'dock', t.value.truck.phase);
});

test('levelling beside water never takes the ground below the water\'s surface', () => {
  const s = flat();
  ground(s, 5, 4, 5, 4, 2);
  s.map.terrain[4 * 30 + 5] = TERRAIN.water;
  touchRelief(s);
  const d: Dig = { how: 'level', from: { x: 5, y: 5 }, to: { x: 7, y: 7 }, at: { x: 5, y: 5 } };
  const r = canReshape(s, d);
  if (!r.ok) assert.fail(r.error);
  assert.equal(r.value.level, 2);
  assert.ok(reshape(s, d).ok);
  for (let y = 5; y < 7; y++) for (let x = 5; x < 7; x++) assert.deepEqual(corners(s.map, x, y), [2, 2, 2, 2]);
});

test('a tile\'s centre is where its ground is drawn, so a corner raised on its own climbs nothing to the middle', () => {
  const s = flat();
  // Folded along the diagonal through its three low corners: its middle is on the flat.
  tile(s, 5, 5, [1, 0, 0, 0]);
  assert.equal(centreLevel(s.map, 5, 5), 0);
  for (const c of [[1, 0, 0, 0], [0, 1, 2, 1], [1, 0, 1, 0], [0, 1, 1, 0], [2, 1, 0, 1]]) {
    tile(s, 8, 8, c);
    assert.equal(centreLevel(s.map, 8, 8), heightAt(s.map, 8.5, 8.5), c.join(','));
  }
});

test('levelling leaves the ground under a tree or rock beside it as it lies: the area meets it at a cliff', () => {
  const s = flat();
  // A step of a level at px 6, sloping across the tiles at x 5; levelled at 1, the area's west edge rises.
  shape(s, (px) => (px >= 6 ? 1 : 0));
  s.map.terrain[6 * 30 + 4] = TERRAIN.tree;
  s.map.terrain[5 * 30 + 4] = TERRAIN.rock;
  touchRelief(s);
  const r = reshape(s, { how: 'level', from: { x: 5, y: 5 }, to: { x: 8, y: 8 }, at: { x: 5, y: 5 } });
  assert.ok(r.ok, r.ok ? '' : r.error);
  assert.deepEqual(corners(s.map, 5, 6), [1, 1, 1, 1]);
  assert.deepEqual(corners(s.map, 4, 7), [0, 1, 1, 0], 'open grass follows');
  assert.deepEqual(corners(s.map, 4, 6), [0, 0, 0, 0], 'the tree\'s ground stays');
  assert.deepEqual(corners(s.map, 4, 5), [0, 0, 0, 0], 'the rock\'s ground stays');
  assert.ok(!joins(s.map, 4, 6, 1));
});

test('worked ground: earthworks and buildings that need level ground mark their tiles worked, kept after the building goes', () => {
  const s = flat(), w = (x: number, y: number) => s.worked[y * s.map.width + x];
  assert.ok(s.worked.every((v) => v === 0));
  // A building that needs flat ground works its footprint even where none had to move; one that stands anywhere doesn't.
  const g = put(s, 'garage', 4, 4);
  assert.deepEqual([w(4, 4), w(5, 5), w(6, 6)], [1, 1, 0]);
  put(s, 'sprinkler', 10, 10);
  assert.equal(w(10, 10), 0);
  // Nor does a field, which only needs its ground unbroken.
  put(s, 'field', 24, 4);
  assert.equal(w(25, 5), 0);
  assert.ok(remove(s, g).ok);
  assert.equal(w(4, 4), 1);
  // Raising a point works the tiles that move.
  assert.ok(reshape(s, at('raise', 15, 15, 15, 15)).ok);
  assert.deepEqual([w(14, 14), w(15, 15), w(14, 15), w(15, 14), w(16, 16)], [1, 1, 1, 1, 0]);
  // Levelling ground already level settles it for nothing, once.
  const before = s.credits, lv: Dig = { how: 'level', from: { x: 20, y: 20 }, to: { x: 22, y: 22 }, at: { x: 20, y: 20 } };
  assert.ok(reshape(s, lv).ok);
  assert.equal(s.credits, before);
  assert.deepEqual([w(20, 20), w(21, 21), w(22, 22)], [1, 1, 0]);
  assert.equal(canReshape(s, lv).ok, false);
  // It is saved.
  const back = deserialize(serialize(s));
  assert.ok(back.ok && back.value.worked[4 * s.map.width + 4] === 1);
});

test('the season scales a water wheel\'s current: spring beats summer, a high river adds, a dry spell takes away', () => {
  const s = flat();
  for (let y = 0; y < 30; y++) for (const x of [14, 15]) { const i = y * 30 + x; s.map.terrain[i] = TERRAIN.water; s.map.current[i] = 1; }
  touchRelief(s);
  const at = (season: Season, character: Character | null = null) => { s.scenario.climate = climateOf(season, character); return wheelSite(s, 12, 4)!.watts; };
  const spring = at('spring'), summer = at('summer'), autumn = at('autumn'), winter = at('winter');
  assert.ok(spring > autumn && autumn > summer && summer > winter, `${spring} ${autumn} ${summer} ${winter}`);
  assert.ok(at('spring', 'highRiver') > spring);
  assert.ok(at('summer', 'dry') < summer);
  assert.ok(Math.abs(spring - POWER.wheel * climateOf('spring').river.flow) < 1e-9);
});

test('the river runs fastest in spring and slowest in winter, high river raises it and a dry season lowers it', () => {
  const flow = (season: Season, ch: Character | null = null) => climateOf(season, ch).river.flow;
  assert.ok(flow('spring') > flow('autumn') && flow('autumn') > flow('summer') && flow('summer') > flow('winter'));
  assert.ok(flow('spring', 'highRiver') > flow('spring') && flow('summer', 'dry') < flow('summer'));
});
