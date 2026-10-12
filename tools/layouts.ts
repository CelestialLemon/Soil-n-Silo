import type { BuildingId, CropId, ItemId } from '../src/game/data.ts';
import type { Dir } from '../src/game/state.ts';

// The bot's layouts for `npm run sim` (tools/sim.ts), one per commission, relative to the depot's north-west tile and in
// build order. Also handy for scripted playtests in the browser (the dev server serves this file).

/** A building to place; `as` names it for the routes. */
export interface Place { type: BuildingId; x: number; y: number; rot?: Dir; crop?: CropId; as?: string }
/** A stop: a named building (or the depot), with the goods and wait it has unless given. */
export interface StopStep { at: string; drop?: ItemId[]; pick?: ItemId[]; wait?: number }
/** A route through named buildings, with `trucks` new trucks from the named garage. */
export interface RouteStep { route: string; garage: string; trucks: number; stops: StopStep[] }
/** One more truck from a garage on a route made before. */
export interface TruckStep { truck: string; garage: string }
/** Once the commission's goal `goal` is met, a route's trucks move to another route. */
export interface MoveStep { move: string; to: string; goal: number }
export type Step = Place | RouteStep | TruckStep | MoveStep;
export type Layout = (dx: number, dy: number) => Step[];

/**
 * The shared core: two rows of three fields north of the depot (west of it and above it), one sprinkler between the rows
 * watering all six, with open rows above, between and below them for the trucks. Fields are named f1..f6.
 */
const fields = (dx: number, dy: number, crop?: CropId): Step[] => [
  ...[-6, -3, 0].flatMap((x, i) => [
    { type: 'field' as const, x: dx + x, y: dy - 5, crop, as: `f${i + 1}` },
    { type: 'field' as const, x: dx + x, y: dy - 11, crop, as: `f${i + 4}` },
  ]),
  { type: 'sprinkler', x: dx - 2, y: dy - 7 }, { type: 'pylon', x: dx - 1, y: dy - 7 },
];
const allFields = (o: Omit<StopStep, 'at'> = {}): StopStep[] => ['f1', 'f2', 'f3', 'f6', 'f5', 'f4'].map((at) => ({ at, ...o }));

/**
 * East of the fields, past an open column: a garage, a machine (`a`, named by its type) and power: pylons linking back to
 * the sprinkler's, and a solar panel. A second machine goes east of the first, past another open column.
 */
const block = (dx: number, dy: number, a: BuildingId): Step[] => [
  { type: 'garage', x: dx + 4, y: dy - 11, as: 'garage' }, { type: 'pylon', x: dx + 6, y: dy - 10 },
  { type: 'solar', x: dx + 7, y: dy - 13 },
  { type: a, x: dx + 4, y: dy - 7, as: a }, { type: 'pylon', x: dx + 6, y: dy - 6 },
];

/** More power east of the block: a battery, solar panels and turbines on their own pylon. */
const morePower = (dx: number, dy: number): Step[] => [
  { type: 'battery', x: dx + 7, y: dy - 11 }, { type: 'pylon', x: dx + 12, y: dy - 9 },
  { type: 'battery', x: dx + 10, y: dy - 11 }, { type: 'solar', x: dx + 13, y: dy - 11 },
  { type: 'turbine', x: dx + 14, y: dy - 8 }, { type: 'turbine', x: dx + 14, y: dy - 6 },
];

/** Layouts by commission, relative to the depot's north-west tile, in build order. */
export const LAYOUTS: Record<string, Layout> = {
  // Six wheat fields: one truck takes the near row's wheat to the depot, another the far row's to a mill and the mill's
  // flour and bran to the depot.
  c1: (dx, dy) => [
    ...fields(dx, dy),
    ...block(dx, dy, 'mill').slice(0, 3),
    { route: 'wheat', garage: 'garage', trucks: 1, stops: [{ at: 'f1' }, { at: 'f2' }, { at: 'f3' }, { at: 'depot' }] },
    { type: 'mill', x: dx + 4, y: dy - 7, as: 'mill' }, { type: 'pylon', x: dx + 6, y: dy - 6 },
    { route: 'flour', garage: 'garage', trucks: 1, stops: [{ at: 'f6' }, { at: 'f5' }, { at: 'f4' }, { at: 'mill' }, { at: 'depot' }] },
    { type: 'battery', x: dx + 7, y: dy - 11 },
    { truck: 'flour', garage: 'garage' },
    { type: 'solar', x: dx + 8, y: dy - 7 }, { type: 'turbine', x: dx + 8, y: dy - 4 },
  ],
  // Bread with the loop closed: six wheat fields feed a mill; its bran feeds the coop, whose eggs and the mill's flour go to
  // the bakery and its bread to the depot; the coop's manure is composted and the compost goes back to the fields.
  c2: (dx, dy) => [
    ...fields(dx, dy),
    ...block(dx, dy, 'mill'),
    { type: 'composter', x: dx + 8, y: dy - 4, as: 'composter' },
    { route: 'wheat', garage: 'garage', trucks: 1, stops: [{ at: 'composter', pick: ['compost'], drop: [] }, ...allFields(), { at: 'mill', pick: [] }] },
    { type: 'coop', x: dx + 4, y: dy - 4, as: 'coop' },
    { type: 'bakery', x: dx + 8, y: dy - 7, as: 'bakery' }, { type: 'battery', x: dx + 7, y: dy - 11 },
    {
      route: 'bread', garage: 'garage', trucks: 1, stops: [
        { at: 'mill', drop: [] }, { at: 'coop', pick: ['egg'] }, { at: 'bakery' }, { at: 'depot', drop: ['bread'] },
      ],
    },
    { route: 'manure', garage: 'garage', trucks: 1, stops: [{ at: 'coop', pick: ['manure'], drop: [] }, { at: 'composter', pick: [] }] },
    ...morePower(dx, dy).slice(1),
    { truck: 'bread', garage: 'garage' },
    { type: 'solar', x: dx + 13, y: dy - 13 }, { type: 'turbine', x: dx + 16, y: dy - 7 },
  ],
  // Bread with neighbours doing the short hops: a mill between two wheat fields, a bakery beside it (flour), a coop under
  // both (bran in, eggs out), and a composter beside the coop and a field (manure in, compost out). Trucks only bring the
  // wheat of three more fields (and compost to them) and take the bread to the depot: 3 trucks on 2 routes, where the
  // layout with every hop by truck (c2) needs 4 on 3.
  'c2:next': (dx, dy) => [
    { type: 'field', x: dx - 3, y: dy - 8, as: 'w' }, { type: 'field', x: dx - 2, y: dy - 11, as: 'n' },
    { type: 'sprinkler', x: dx - 3, y: dy - 9 }, { type: 'pylon', x: dx - 3, y: dy - 10 },
    { type: 'mill', x: dx, y: dy - 8, as: 'mill' }, { type: 'pylon', x: dx + 4, y: dy - 8 },
    { type: 'solar', x: dx + 5, y: dy - 8 }, { type: 'coop', x: dx, y: dy - 6, as: 'coop' },
    { type: 'garage', x: dx + 5, y: dy - 11, as: 'garage' },
    { type: 'bakery', x: dx + 2, y: dy - 8, as: 'bakery' }, { type: 'solar', x: dx + 5, y: dy - 6 },
    { route: 'bread', garage: 'garage', trucks: 1, stops: [{ at: 'bakery', drop: [], pick: ['bread'] }, { at: 'depot', drop: ['bread'] }] },
    { type: 'composter', x: dx - 2, y: dy - 5, as: 'composter' },
    { type: 'battery', x: dx + 7, y: dy - 8 }, { type: 'pylon', x: dx + 9, y: dy - 9 },
    ...[-4, -1, 2].map((x, i) => ({ type: 'field' as const, x: dx + x, y: dy - 15, as: `f${i + 1}` })),
    { type: 'pylon', x: dx + 4, y: dy - 12 }, { type: 'pylon', x: dx + 4, y: dy - 16 },
    { type: 'sprinkler', x: dx - 2, y: dy - 16 }, { type: 'sprinkler', x: dx + 3, y: dy - 16 },
    {
      route: 'wheat', garage: 'garage', trucks: 1,
      stops: [{ at: 'composter', pick: ['compost'], drop: [] }, { at: 'f1' }, { at: 'f2' }, { at: 'f3' }, { at: 'n' }, { at: 'mill', pick: [] }],
    },
    ...morePower(dx, dy),
    { truck: 'wheat', garage: 'garage' },
    { type: 'solar', x: dx + 13, y: dy - 13 }, { type: 'turbine', x: dx + 16, y: dy - 7 },
  ],
  // Linen and yarn: six flax fields feed a spinner; one route takes yarn to the loom and its linen to the depot, another
  // takes yarn straight to the depot (a commission goal), sharing it by how often their trucks come.
  c4: (dx, dy) => [
    ...fields(dx, dy, 'flax'),
    ...block(dx, dy, 'spinner'),
    { route: 'flax', garage: 'garage', trucks: 1, stops: [...allFields(), { at: 'spinner', pick: [] }] },
    { type: 'loom', x: dx + 8, y: dy - 7, as: 'loom' }, { type: 'battery', x: dx + 7, y: dy - 11 },
    { route: 'weave', garage: 'garage', trucks: 1, stops: [{ at: 'spinner', drop: [] }, { at: 'loom' }, { at: 'depot', drop: ['linen'] }] },
    { route: 'yarn', garage: 'garage', trucks: 1, stops: [{ at: 'spinner', drop: [] }, { at: 'depot', drop: ['yarn'] }] },
    ...morePower(dx, dy).slice(1),
    { truck: 'flax', garage: 'garage' },
    // Once the yarn rate is reached, all the yarn goes to the loom.
    { move: 'yarn', to: 'weave', goal: 1 },
  ],
};
