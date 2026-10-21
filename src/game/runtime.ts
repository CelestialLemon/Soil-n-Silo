import type { Fleet } from './fleet.ts';
import type { Flows } from './flows.ts';
import type { History } from './history.ts';
import type { Networks } from './power.ts';
import type { Log } from './powerlog.ts';
import type { Roads } from './roads.ts';
import type { Handoff } from './sim/goods.ts';
import type { Derived } from './sim/layout.ts';
import type { TruckPose } from './sim/trucks.ts';
import type { Cache, GameState } from './state.ts';

// Runtime: everything a game holds that is not saved. The GameState is plain JSON (what gets saved); what is worked out from
// it, or only watched for a while, hangs off it here, so one place lists it all. A loaded or new game starts with none of it,
// and each module fills in its own slice when it first needs it.

export interface Runtime {
  /** Who stands where, by tile and by id, and the layout's version (state.ts). */
  tiles?: Cache;
  /** The power networks for the current layout (power.ts). */
  networks?: Networks;
  /** Which tiles trucks can drive on, and the distance fields toward each building, for the current layout (roads.ts). */
  roads?: Roads;
  /** The per-layout facts the sim reads: sprinklers, pollination, water, neighbours (sim/layout.ts). */
  derived?: Derived;
  /** The share of the power it wanted that each building got last step, by building id (sim/energy.ts). */
  shares?: Map<number, number>;
  /** Watts each garage wants for the trucks charging there, by building id (sim/energy.ts). */
  charging?: Map<number, number>;
  /** Goods recently handed next door, for the view to show crossing over (sim/goods.ts). */
  handoffs?: Handoff[];
  /** When each building last took a good from next door, so neighbours sharing a giver take turns (sim/goods.ts). */
  lastFed?: Map<number, number>;
  /** Where each truck stood as the last step began, for the view to draw it between steps (sim/trucks.ts). */
  truckPoses?: Map<number, TruckPose>;
  /** The layout the trucks last found their ways on (sim/trucks.ts). */
  truckLayout?: number;
  /** Each building's recent history of what it did, by building id (history.ts). */
  histories?: Map<number, History>;
  /** When the histories were last pruned (history.ts). */
  historyPruned?: number;
  /** What the trucks did over the last stretch of play (fleet.ts). */
  fleet?: Fleet;
  /** Goods moved and soil health over the last stretch of play (flows.ts). */
  flows?: Flows;
  /** The hours and nights of the power log (powerlog.ts). */
  powerLog?: Log;
  /** Bumped whenever earthworks change the ground's levels, so the view redraws it (state.ts, `touchRelief`). */
  relief?: number;
  /** Bumped whenever a route, a stop or a truck's assignment changes, so the interface knows to redraw its panels. Numbered across games (see nextVersion). */
  routesVersion: number;
}

const runtimes = new WeakMap<GameState, Runtime>();

/** A game's runtime data, made empty the first time it is asked for. */
export function runtimeOf(s: GameState): Runtime {
  let r = runtimes.get(s);
  if (!r) runtimes.set(s, (r = { routesVersion: nextVersion() }));
  return r;
}

let versions = 1;
/** The next version number, for layouts and routes. Counted across all games, so a number never comes back for something else. */
export const nextVersion = () => versions++;

/** Marks routes, stops or truck assignments as changed. */
export function touchRoutes(s: GameState) {
  runtimeOf(s).routesVersion = nextVersion();
}
