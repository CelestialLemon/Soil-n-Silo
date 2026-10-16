import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place } from '../src/game/build.ts';
import { BUILDINGS, CROPS, HIVE, POWER, recipeWords, TRUCK, type BuildingId } from '../src/game/data.ts';
import { placement } from '../src/game/forecast.ts';
import { TERRAIN, type TerrainKind } from '../src/game/map.ts';
import { networkOf } from '../src/game/power.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { exposureOf, nearWater } from '../src/game/sim/layout.ts';
import { fieldPace } from '../src/game/sim/buildings.ts';
import { describeStatus } from '../src/game/sim/describe.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, touchLayout, type BuildingOf, type GameState } from '../src/game/state.ts';

// The placement card and the simulation share their rules (rules.ts): what a building in hand is said to do is what it does
// once placed. And the words that quote a number take it from data.ts.

function flat(): GameState {
  const sc: Scenario = {
    ...SANDBOX, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { soil: 60, soilSpread: 0, water: 'none', forest: 0, rock: 0 },
  };
  const s = newGame(sc);
  s.map.fertility.fill(60);
  s.soilBase.fill(60);
  return s;
}

function put<K extends BuildingId>(s: GameState, type: K, x: number, y: number): BuildingOf<K> {
  const r = place(s, type, x, y, 0);
  if (!r.ok) assert.fail(`${type} at ${x},${y}: ${r.error}`);
  return r.value.building;
}

function setTerrain(s: GameState, kind: TerrainKind, tiles: [number, number][]) {
  for (const [x, y] of tiles) s.map.terrain[y * s.map.width + x] = kind;
  touchLayout(s);
}

const fact = (s: GameState, type: Parameters<typeof place>[1], x: number, y: number, label: string) =>
  placement(s, type, x, y).facts.find((f) => f.label === label)!;

test('a turbine gets the wind the placement card says it would, however it is sheltered', () => {
  const layouts: ((s: GameState) => void)[] = [
    () => {},
    (s) => setTerrain(s, TERRAIN.tree, [[9, 9], [12, 10]]),
    (s) => { put(s, 'mill', 11, 10); setTerrain(s, TERRAIN.tree, [[8, 8]]); },
    (s) => { put(s, 'bakery', 8, 8); put(s, 'silo', 11, 11); setTerrain(s, TERRAIN.tree, [[10, 8], [12, 9], [8, 12], [9, 12], [13, 13]]); },
  ];
  for (const [i, setUp] of layouts.entries()) {
    const s = flat();
    setUp(s);
    const said = fact(s, 'turbine', 10, 10, 'Wind').value;
    const t = put(s, 'turbine', 10, 10);
    assert.equal(said, `${Math.round(exposureOf(s, t) * 100)}%`, `layout ${i}`);
  }
  // At the map's edge the shelter search stays on the map.
  const s = flat();
  setTerrain(s, TERRAIN.tree, [[1, 0]]);
  const said = fact(s, 'turbine', 0, 0, 'Wind').value;
  assert.equal(said, `${Math.round(exposureOf(s, put(s, 'turbine', 0, 0)) * 100)}%`);
  assert.equal(said, `${Math.round((1 - POWER.shelter) * 100)}%`);
});

test('a field grows at the pace the placement card says, watered or dry, on any soil', () => {
  for (const [soil, watered] of [[60, false], [60, true], [25, true], [90, false]] as const) {
    const s = flat();
    s.map.fertility.fill(soil);
    if (watered) {
      put(s, 'pylon', 14, 10);
      put(s, 'battery', 15, 10).charge = POWER.battery.capacity;
      put(s, 'sprinkler', 13, 11);
      advance(s, 0.2);
    }
    const crop = CROPS.wheat, said = Number(fact(s, 'field', 10, 10, crop.name).value);
    const f = put(s, 'field', 10, 10);
    assert.equal(said, Number((crop.yield * 60 * fieldPace(s, f).pace / crop.grow).toFixed(1)), `soil ${soil}, watered ${watered}`);
  }
});

test('a sprinkler is near water, and a building in reach of a pylon, as the placement card says', () => {
  for (const water of [[[10, 2]], [[10, 1]], [[17, 10]], []] as [number, number][][]) {
    const s = flat();
    setTerrain(s, TERRAIN.water, water);
    const said = fact(s, 'sprinkler', 10, 10, 'Uses').sub === 'near water';
    assert.equal(said, nearWater(s, put(s, 'sprinkler', 10, 10)), JSON.stringify(water));
  }
  for (const [x, y] of [[3, 3], [4, 4], [5, 3], [3, 6]]) {
    const s = flat();
    put(s, 'pylon', 0, 0);
    const said = fact(s, 'mill', x, y, 'Power').value === 'in reach';
    assert.equal(said, networkOf(s, put(s, 'mill', x, y)) !== null, `${x},${y}`);
  }
});

test('words that quote a number take it from the data', () => {
  assert.equal(BUILDINGS.mill.hint, '2 wheat → flour + bran.');
  assert.equal(BUILDINGS.coop.hint, `Chickens: ${recipeWords('eggs')}.`);
  assert.ok(BUILDINGS.pylon.hint.includes(`within ${POWER.pylon.reach} tiles`) && BUILDINGS.pylon.hint.includes(`within ${POWER.pylon.link}`));
  assert.ok(BUILDINGS.garage.hint.includes(`up to ${TRUCK.perGarage} trucks`));
  const s = flat(), h = put(s, 'hive', 10, 10);
  advance(s, 0.2);
  assert.equal(h.status, 'flowers');
  assert.ok(describeStatus(s, h).includes(`within ${HIVE.reach} tiles`));
});
