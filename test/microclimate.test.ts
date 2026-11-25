import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceRecipes, erosionDrain, generationOf, growCrops, startRecipes } from '../src/game/index.ts';
import { building, fieldAt, land } from './helpers.ts';

for (const kind of ['trees', 'hedges', 'beans'] as const) test(`${kind} guard wheat against slope erosion`, () => {
  const s = land({ height: x => x * 0.2 }), f = fieldAt(s, 'wheat', 0, 0, 2);
  const open = erosionDrain(s, f);
  assert.ok(open > 0.099 && open <= 0.1);
  if (kind === 'trees') s.wildTrees.push({ x: 5, z: 0, id: 10, planted: false, species: 'oak', scale: 1, seed: 1 });
  if (kind === 'hedges') s.hedges.push({ id: 10, path: [{ x: 4, z: -5 }, { x: 4, z: 5 }], points: [] });
  if (kind === 'beans') fieldAt(s, 'beans', 6, 0, 2);
  assert.ok(Math.abs(erosionDrain(s, f) / open - 0.2) < 0.001);
});

test('shade reduces solar generation and turbine wind, and keeps hens comfortable at noon', () => {
  const s = land({ height: () => 0 });
  const solar = building(s, 'solar', 0, 0), turbine = building(s, 'turbine', 4, 0), coop = building(s, 'coop', 8, 0);
  const env = { windSpeed: 10, cloudCover: 0 };
  const watts = () => [solar, turbine].map(({ t }) => generationOf(s, t, 12, env));
  const open = watts();
  s.sim.hour = 12;
  coop.r.inputs.bran = 1;
  startRecipes(s);
  coop.r.powered = true;
  advanceRecipes(s, 0.5);
  const exposed = coop.r.progress;
  s.plantedTrees.push({ x: 2, z: 0, id: 10, planted: true, species: 'oak', scale: 1, seed: 1 });
  assert.ok(watts().every((w, i) => w < open[i]));
  advanceRecipes(s, 0.5);
  assert.ok(Math.abs(coop.r.progress - exposed - 0.5 * 1.15 / 2) < 1e-9);
});

test('canopy coverage helps at summer noon and shades the field on an overcast day', () => {
  const s = land({ height: () => 0 }), f = fieldAt(s, 'wheat', 0, 0, 1.8);
  s.sim.hour = 12;
  const growth = (weather: string) => {
    f.growth = 0;
    growCrops(s, 1, 1, weather);
    return f.growth;
  };
  const open = growth('clear');
  building(s, 'solar', 0, 0);
  assert.ok(growth('clear') >= open * 1.1);
  assert.ok(growth('overcast') <= open * 0.91);
});
