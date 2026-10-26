import { CROPS } from './data.ts';
import { isFlooded } from './flood.ts';
import type { FieldBuilding, GameState } from './state.ts';
import { shareOf } from './sim/energy.ts';
import { derived } from './sim/layout.ts';
import { beesFly, beesNow, heatNeed, insideNow, warmthOf } from './warmth.ts';
import { keepingBeesIn } from './wind.ts';

// Where the bees forage: the open fields when the valley is warm enough, a working greenhouse when it is too cold outside.

/** A greenhouse that is working: dry, powered (when its crop needs heat) and at its crop's warmth. One cooling without power does not count. */
export function greenhouseWorking(s: GameState, f: FieldBuilding): boolean {
  if (f.type !== 'greenhouse' || isFlooded(s, f)) return false;
  const crop = CROPS[f.crop];
  if (heatNeed(crop, warmthOf(s)) > 0 && shareOf(s, f) <= 0) return false;
  return insideNow(s, f) >= crop.comfort.low - 0.05;
}

/** Whether a flowering field is one the bees would forage on in this warmth, the weather aside: the valley warm enough, or the field a working greenhouse. */
const foragable = (s: GameState, f: FieldBuilding) => CROPS[f.crop].flowers && (beesFly(warmthOf(s)) || greenhouseWorking(s, f));

/** Whether the bees forage on a flowering field now (it gets the pollination bonus): not kept in by a gale or storm, and the field foragable. */
export const foragesOn = (s: GameState, f: FieldBuilding) => !keepingBeesIn(s.scenario, s.time) && foragable(s, f);

/** The flowering fields in a hive's reach the bees would forage on, the weather aside: honey comes from up to HIVE.maxFlowers of them. */
export const foragableBy = (s: GameState, hiveId: number): FieldBuilding[] => (derived(s).flowers.get(hiveId) ?? []).filter((f) => foragable(s, f));

/** Whether a hive forages only under glass now: too cold outside, and a working greenhouse with a flowering crop within its reach. */
export const foragingUnderGlass = (s: GameState, hiveId: number) => !beesFly(warmthOf(s)) && foragableBy(s, hiveId).length > 0;

/** Where a hive's bees are, as a fact: "Foraging in the greenhouse: too cold outside" when they work under glass, else the valley's (warmth.ts `beesNow`). */
export function hiveBees(s: GameState, hiveId: number): { text: string; tone?: 'bad' | 'good' } {
  if (foragingUnderGlass(s, hiveId) && !keepingBeesIn(s.scenario, s.time)) return { text: 'Bees: foraging in the greenhouse: too cold outside', tone: 'good' };
  return beesNow(s);
}
