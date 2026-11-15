import { POWER } from '../../game/data.ts';
import { pushesAt } from '../../game/events.ts';
import { readHold } from '../../game/hold.ts';
import { gustOver } from '../../game/overhead.ts';
import { windAt } from '../../game/sim/clock.ts';
import { shareOf } from '../../game/sim/energy.ts';
import { exposureOf, runsInFrost } from '../../game/sim/layout.ts';
import { isMachine, type Building, type GameState, type Status } from '../../game/state.ts';
import { turbineShare } from '../../game/wind.ts';

// How a building's moving and changing parts are now, from the game's state (#205): how fast its rotor, wheel or stones
// turn, whether its running look shows (a fire's glow, a lamp, flour running), how many of a battery's charge rings are
// lit, and which of the five states the player reads it in without clicking (the developer's, 2026-11-14, on #205):
//
//   working    its parts turning, its running look and lights on
//   idle       nothing to do, or its store full: still, its running look off
//   unpowered  no power (or too little): still, dark
//   weather    stopped (or slowed) by the weather: a turbine in a gale, a wheel on ice
//   building   under construction (the game has no construction yet: nothing is in this state)
//
// The renderer only draws: things.ts sends each building's look (brush3d's ModelParts: `spin`, `show`), and how each state
// is decorated beyond its own parts is a look the developer picks (#205's look PR). Pure: no renderer here, so the tests
// read it in Node.

/** The five states a building is read in at a glance. */
export type ThingState = 'working' | 'idle' | 'unpowered' | 'weather' | 'building';

/** How a building's parts are now: their pace (0 still, 1 the model's usual), its running look, its charge rings lit (0..4). */
export interface PartsLook { pace: number; running: boolean; charge?: number }

/** The statuses that mean no power, or too little. */
const UNPOWERED = new Set<Status>(['power', 'lowpower', 'nolink']);
/** The statuses that mean the weather holds it (or its crop): a weather event, too cold, frost. */
const WEATHER = new Set<Status>(['weather', 'cold', 'frost']);

/**
 * Is it doing its thing (to show its running look)? The pixel world's rule (view.ts's isRunning), less a building with no
 * power: a machine keeps its batch through a power cut, but it isn't working.
 */
export function isRunning(b: Building) {
  // Weather that only slows or weakens it leaves it running; stopped (a machine keeps its progress for later), it rests.
  if (b.status === 'weather' && readHold(b.need)?.effect === 'stopped') return false;
  if (b.status === 'power' || b.status === 'nolink') return false;
  if (isMachine(b)) return b.progress !== null;
  return b.status === 'ok' || b.status === 'weather' || b.status === 'lowpower';
}

/** The state a building is read in (see ThingState). */
export function stateOf(b: Building): ThingState {
  if (UNPOWERED.has(b.status)) return 'unpowered';
  if (WEATHER.has(b.status)) return 'weather';
  return isRunning(b) ? 'working' : 'idle';
}

/** A battery's charge rings lit, 0 to 4, one per quarter (any charge at all lights the first), as the pixel world shows them. */
export function chargeRings(charge: number) {
  const k = charge / POWER.battery.capacity;
  return k < 0.02 ? 0 : Math.min(4, Math.ceil(k * 4 - 0.02));
}

/**
 * How its parts are now. A turbine's rotor turns with the wind it feels: the valley's (windAt), its shelter (exposure),
 * the gust passing over it (#208, the rules' own), and a gale furling or stopping it; it turns whether or not it's linked,
 * as a free rotor would. A weather station's cups turn with the wind there, powered or not. A water wheel turns with the
 * river (a flood or a drought raises or lowers it) unless it's frozen in. A machine's parts turn while it works, slower
 * on part of its power.
 */
export function partsLook(s: GameState, b: Building): PartsLook {
  const running = isRunning(b);
  switch (b.type) {
    case 'turbine': {
      const e = exposureOf(s, b);
      return { pace: windAt(s.scenario, s.time) * e * turbineShare(s, b.id, e) * gustOver(s, b), running };
    }
    case 'station': return { pace: windAt(s.scenario, s.time) * gustOver(s, b), running };
    case 'wheel': {
      const p = pushesAt(s.scenario, s.time);
      return { pace: p.river * (runsInFrost(s, b) ? 1 : 1 - p.ice), running };
    }
    case 'battery': return { pace: 0, running, charge: chargeRings(b.charge) };
    default: return { pace: running ? Math.min(1, shareOf(s, b)) : 0, running };
  }
}
