import { BUILDINGS, ITEMS, SAPLING_SECONDS, TICK } from '../data.ts';
import { noteTrucks } from '../fleet.ts';
import { tickFlows } from '../flows.ts';
import { TERRAIN } from '../map.ts';
import { networkOf, networks } from '../power.ts';
import { noteRun } from '../runlog.ts';
import { isMachine, removeBuilding, tileIndex, touchLayout, type Building, type GameState } from '../state.ts';
import { sunAt, windAt } from './clock.ts';
import { soilHealth } from './soil.ts';
import { wattsOf } from './layout.ts';
import { raining } from './weather.ts';
import { feedNeighbours } from './goods.ts';
import { shareOf, balancePower, countCharging, runGarages } from './energy.ts';
import { runMachine, runField, runHive } from './buildings.ts';
import { runTrucks, cutOff } from './trucks.ts';
import { recordHistory, rest, updateStats, goalDone, updateGoals } from './stats.ts';
import { blockedGood, served } from './describe.ts';
import { applyHolds } from '../hold.ts';

// The simulation: one fixed step of TICK seconds at a time. Each step balances power, runs every building, hands goods to
// the buildings next door that take them, drives the trucks along their routes (docking, moving goods, charging), then
// updates the stats and goals.

/** Advances the game by `seconds` of play, in fixed steps; at most `maxSteps` of them (the rest is dropped, so a slow frame
 * can't snowball). */
export function advance(s: GameState, seconds: number, maxSteps = Infinity) {
  s.carry += seconds;
  let n = 0;
  while (s.carry >= TICK - 1e-9 && n < maxSteps) { tick(s); s.carry -= TICK; n++; }
  if (n >= maxSteps) s.carry = 0;
}

export function tick(s: GameState) {
  const dt = TICK;
  s.time += dt;
  const sun = sunAt(s.scenario, s.time), wind = windAt(s.scenario, s.time);
  countCharging(s);
  balancePower(s, sun, wind, dt);
  const grown: Building[] = [];
  for (const b of s.buildings) {
    switch (b.type) {
      case 'depot': break;
      case 'silo': b.status = 'idle'; break;
      case 'field': runField(s, b, dt); break;
      case 'hive': runHive(s, b, dt); break;
      case 'sprinkler': case 'battery': case 'pylon': case 'solar': case 'turbine': case 'wheel': {
        if (b.type === 'sprinkler' && raining(s.scenario, s.time)) { b.status = 'rain'; break; } // the rain waters the fields, connected or not
        const net = BUILDINGS[b.type].grid === 'link' ? null : networkOf(s, b);
        if (BUILDINGS[b.type].grid !== 'link' && !net) { b.status = 'nolink'; break; }
        if (b.type === 'sprinkler') { const sh = shareOf(s, b); b.status = sh <= 0 ? 'power' : sh < 1 ? 'lowpower' : 'ok'; }
        else if (b.type === 'solar') b.status = sun > 0 ? 'ok' : 'idle';
        else if (b.type === 'wheel') b.status = wattsOf(s, b) > 0 ? 'ok' : 'idle';
        else b.status = 'ok';
        break;
      }
      case 'sapling':
        b.age += dt;
        b.status = 'ok';
        if (b.age >= SAPLING_SECONDS) grown.push(b);
        break;
      default:
        if (isMachine(b)) {
          runMachine(s, b, dt);
          if (BUILDINGS[b.type].grid && !networkOf(s, b) && b.status === 'ok') b.status = 'nolink';
        }
    }
  }
  for (const b of grown) {
    removeBuilding(s, b);
    s.map.terrain[tileIndex(s, b.x, b.y)] = TERRAIN.tree;
  }
  if (grown.length) touchLayout(s);
  feedNeighbours(s);
  runTrucks(s, dt);
  runGarages(s);
  // A building trucks can't reach, or whose outputs are full with no route picking them up, says so (unless it lacks power
  // or water, which say more).
  for (const b of s.buildings) {
    if (!['input', 'blocked', 'ok', 'idle'].includes(b.status) || b.type === 'depot') continue;
    if (cutOff(s, b)) { b.status = 'noroad'; continue; }
    const g = b.status === 'blocked' ? blockedGood(b) : null;
    if (g && !served(s, b, g, 'pick')) { b.status = 'noroute'; b.need = ITEMS[g].name.toLowerCase(); }
  }
  // Last, what weather stops or slows (a layout's own problem, found above, comes first).
  applyHolds(s);
  recordHistory(s, sun, wind, dt);
  // Once a second, ground without a field recovers a little.
  if (Math.floor(s.time + 1e-6) !== Math.floor(s.time - dt + 1e-6)) rest(s);
  updateStats(s);
  updateGoals(s);
  noteTrucks(s, dt);
  tickFlows(s, () => soilHealth(s));
  noteRun(s, dt, sun <= 0, networks(s).list.some((n) => n.share < 1 && n.wanted > 0), () => s.scenario.goals.map((_, i) => goalDone(s, i)));
}

