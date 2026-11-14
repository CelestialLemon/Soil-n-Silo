import { cloudDriftSpeed, cloudShade, TILE, WindRecipe, type WindGoal, type WindGrid, type WindState } from '../../brush3d/src/shared.ts';
import { TICK } from './data.ts';
import { lookAt } from './events.ts';
import { runtimeOf } from './runtime.ts';
import type { Scenario } from './scenarios.ts';
import { windAt } from './sim/clock.ts';
import { CLOUD_DIM, cloudAt, weatherAt } from './sim/weather.ts';
import { centre, type Building, type GameState } from './state.ts';

// What passes over the valley (#208, #198): the living wind's gusts and the clouds' shadows, one of each for the rules and the
// picture, so the wind the player sees in the grass is the wind the turbines feel, and a cloud's shadow over a solar panel cuts
// its power.
//
// The rules' wind and cloud stay what they were: one number each for the valley (sim/clock.ts's windAt, sim/weather.ts's
// cloudAt), what the forecasts tell, the planning numbers and every day's and season's average. What is new is where and when,
// moment to moment: a turbine makes its power times the gust passing over it, and a panel under a cloud's shadow loses what the
// valley's cloud takes, and one in the sun keeps it all. Both average out to the valley's (the gusts' recipe balances every gust
// against its lull; the clouds shade as much of the land as the cover says), so the balance holds and only the moment varies.
//
// - **The gusts** are brush3d's recipe (brush3d/src/wind/recipe.ts), stepped here a tick at a time on the game's clock and saved
//   with the game. A rotor stands 14 m up, where the wind is the free air alone (brush3d's height rule: from 8 m the ground air
//   plays no part), so the rules need the gusts, not the air under them: the picture steps that air in a worker, fed the same
//   goals, and draws it. The shelter a turbine gets stays the rules' (rules.ts's windExposure: what stands round it), a planning
//   number the placement card shows.
// - **The clouds** are brush3d's cloud field (brush3d/src/renderer/clouds.ts) at the drawn cover (sim/weather.ts's weatherAt,
//   with the weather events' looks), carried along by the wind at `cloudDriftSpeed` from where they started; the picture draws
//   the same field, given the drift.
//
// Both are deterministic, a pure function of the ticks run and the scenario, so saves and the bots replay them bit for bit.

/** Where the wind blows towards (radians, from +x towards +z): one way for every map. */
export const WIND_DIRECTION = (31 * Math.PI) / 180;
/** The rules' full wind (1) in metres a second: a gale (brush3d's WIND_SCALE.gale). */
export const FULL_WIND = 17;
/** How gusty the wind is (brush3d's 0 steady to 1): the middle, as the gusts' look was picked at. */
export const GUSTINESS = 0.5;
/** The wind the game asks for is held to steps of this (m/s), so the picture's worker is told of a change only now and then. */
const SPEED_STEP = 0.1;
/** How far past the map the wind's world reaches, metres, and the size of its cells. */
const MARGIN = 32, CELL = 2;
/** The wind's world covers at most this many cells a side (brush3d's MAX_CELLS). */
const MAX_CELLS = 256;

/** The wind the game asks of the living wind at a time: the rules' wind or the weather's look of it (a blizzard's), whichever is stronger. */
export function windGoal(sc: Scenario, time: number): WindGoal {
  const speed = Math.round(Math.max(windAt(sc, time), lookAt(sc, time).wind) * FULL_WIND / SPEED_STEP) * SPEED_STEP;
  return { speed, direction: WIND_DIRECTION, gustiness: GUSTINESS, rhythm: 0.5 };
}

/**
 * The wind's world for a map of `width` by `height` tiles: centred on the map, past its edges by MARGIN, in cells of CELL metres.
 * The gusts are laid from its centre, so the rules and the picture must use the same (the picture's worker steps the air on it).
 */
export function windGrid(width: number, height: number): WindGrid {
  const w = width * TILE, h = height * TILE;
  const nx = Math.min(MAX_CELLS, Math.ceil((w + 2 * MARGIN) / CELL)), nz = Math.min(MAX_CELLS, Math.ceil((h + 2 * MARGIN) / CELL));
  return { nx, nz, cell: CELL, x0: w / 2 - (nx * CELL) / 2, z0: h / 2 - (nz * CELL) / 2 };
}

/** What passes over a new game: the wind's gusts as they start, and the clouds where they start. */
export function newOverhead(sc: Scenario, width: number, height: number): { wind: WindState; clouds: { x: number; z: number } } {
  return { wind: new WindRecipe(windGrid(width, height), windGoal(sc, 0), { seed: sc.seed }).state, clouds: { x: 0, z: 0 } };
}

/** The game's gusts, stepped on its state (the same object as `s.wind`, so what it steps is what's saved). */
function gustsOf(s: GameState): WindRecipe {
  const r = runtimeOf(s);
  if (!r.gusts || r.gusts.state !== s.wind) {
    r.gusts = new WindRecipe(windGrid(s.map.width, s.map.height), windGoal(s.scenario, s.time), { state: s.wind });
    s.wind = r.gusts.state;
  }
  return r.gusts;
}

/** Moves what passes over on by a tick, the tick that has just begun (step.ts's tick, after the clock): the gusts, and the clouds' drift. */
export function stepOverhead(s: GameState) {
  const gusts = gustsOf(s), goal = windGoal(s.scenario, s.time);
  gusts.setGoal(goal);
  gusts.step();
  const v = cloudDriftSpeed(goal.speed) * TICK;
  s.clouds.x += v * Math.cos(WIND_DIRECTION); s.clouds.z += v * Math.sin(WIND_DIRECTION);
}

/** Where a building stands in the wind's and the clouds' metres: the middle of its footprint. */
function metres(b: Building): [number, number] {
  const c = centre(b);
  return [c.x * TILE, c.y * TILE];
}

/** How hard the wind blows over a building now, as a share of the valley's (windAt): the gust passing, 1 on average. */
export const gustOver = (s: GameState, b: Building) => gustsOf(s).gustAt(...metres(b));

/** The cloud now: the rules' cover (what dims the valley's sun) and the drawn one (with the weather events' looks), worked out once a tick. */
function cloudNow(s: GameState) {
  const r = runtimeOf(s);
  if (r.cloudNow?.time !== s.time) r.cloudNow = { time: s.time, rules: cloudAt(s.scenario, s.time), drawn: weatherAt(s.scenario, s.time).cloud };
  return r.cloudNow;
}

/** How shaded a building is by the clouds now, 0 in the sun to 1 in a cloud's deepest shadow: the field the picture draws. */
export function shadeOver(s: GameState, b: Building) {
  const { drawn } = cloudNow(s);
  return cloudShade(...metres(b), { cover: drawn, x: s.clouds.x, z: s.clouds.z, seed: s.scenario.seed });
}

/**
 * The sun a building gets now under the clouds, as a share of the valley's (sunAt, which the cloud dims by `CLOUD_DIM` of the
 * cover): in a cloud's shadow it loses what the valley's cloud takes, in the sun nothing, so across the land (and over time, as
 * the clouds pass) it is 1 on average. Where the weather's look draws more cloud than the rules count, its shadow takes that share less.
 */
export function lightOver(s: GameState, b: Building) {
  const { rules, drawn } = cloudNow(s);
  if (!(rules > 0) || !(drawn > 0)) return 1;
  return (1 - CLOUD_DIM * rules * shadeOver(s, b) / drawn) / (1 - CLOUD_DIM * rules);
}

/** What a generator makes now over what the valley's sun and wind alone would give it: a panel's light, a turbine's gust; 1 for the rest. */
export function hereShare(s: GameState, b: Building) {
  return b.type === 'solar' ? lightOver(s, b) : b.type === 'turbine' ? gustOver(s, b) : 1;
}
