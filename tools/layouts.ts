import type { BuildingId, CropId, ItemId } from '../src/game/data.ts';
import type { Dir } from '../src/game/state.ts';

// The bot's layouts for `npm run sim` and the bot tests (tools/bot.ts), one per commission, relative to the depot's north-west tile and in
// build order. Also handy for scripted playtests in the browser (the dev server serves this file).

/** A building to place, with a field's crop or a machine's recipe (the bakery's); `as` names it for the routes. */
export interface Place { type: BuildingId; x: number; y: number; rot?: Dir; crop?: CropId; recipe?: string; as?: string }
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

/**
 * Sauce: a cannery between two tomato fields (t1, t2), an oil press beside it between two sunflower fields (u1, u2), a coop
 * under the press (seed cake in) on a bean field (b1, beans in), with sprinklers, power to them and a garage. The coop's eggs
 * and manure need a route, or it stops and the press with it.
 */
const sauce = (dx: number, dy: number): Step[] => [
  { type: 'field', x: dx - 3, y: dy - 8, crop: 'tomato', as: 't1' }, { type: 'field', x: dx - 2, y: dy - 11, crop: 'tomato', as: 't2' },
  { type: 'sprinkler', x: dx - 3, y: dy - 9 }, { type: 'pylon', x: dx - 4, y: dy - 10 },
  { type: 'field', x: dx + 1, y: dy - 11, crop: 'sunflower', as: 'u2' }, { type: 'field', x: dx + 4, y: dy - 9, crop: 'sunflower', as: 'u1' },
  { type: 'sprinkler', x: dx + 4, y: dy - 11 }, { type: 'pylon', x: dx + 4, y: dy - 10 },
  { type: 'press', x: dx + 2, y: dy - 8 }, { type: 'cannery', x: dx, y: dy - 8, as: 'cannery' },
  { type: 'solar', x: dx + 6, y: dy - 14 }, { type: 'garage', x: dx + 6, y: dy - 12, as: 'garage' },
  { type: 'coop', x: dx + 2, y: dy - 6, as: 'coop' }, { type: 'field', x: dx + 2, y: dy - 3, crop: 'beans', as: 'b1' },
];

/** Linen, west of the sauce: a spinner between two flax fields (x1, x2), a loom under it, and a hive pollinating the flax. */
const linen = (dx: number, dy: number): Step[] => [
  { type: 'field', x: dx - 11, y: dy - 8, crop: 'flax', as: 'x1' }, { type: 'field', x: dx - 8, y: dy - 11, crop: 'flax', as: 'x2' },
  { type: 'sprinkler', x: dx - 9, y: dy - 9 }, { type: 'pylon', x: dx - 10, y: dy - 10 },
  { type: 'spinner', x: dx - 8, y: dy - 8 }, { type: 'pylon', x: dx - 5, y: dy - 7 },
  { type: 'loom', x: dx - 8, y: dy - 6, as: 'loom' },
  { route: 'linen', garage: 'garage', trucks: 1, stops: [{ at: 'loom', pick: ['linen'] }, { at: 'depot' }] },
  { type: 'hive', x: dx - 6, y: dy - 6 },
];

/**
 * East of the sauce: a bakery beside the coop (eggs; bread unless `recipe` says otherwise), a mill beside the bakery between
 * two wheat fields (w1, w2), with their power and water.
 */
const bakery = (dx: number, dy: number, recipe?: string): Step[] => [
  { type: 'bakery', x: dx + 5, y: dy - 5, recipe, as: 'bakery' }, { type: 'mill', x: dx + 7, y: dy - 5, as: 'mill' },
  { type: 'pylon', x: dx + 7, y: dy - 3 }, { type: 'field', x: dx + 9, y: dy - 5, as: 'w1' }, { type: 'field', x: dx + 7, y: dy - 8, as: 'w2' },
  { type: 'sprinkler', x: dx + 10, y: dy - 7 }, { type: 'pylon', x: dx + 11, y: dy - 9 }, { type: 'sprinkler', x: dx + 5, y: dy - 2 },
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
  // the bakery and its bread to the depot; the coop's manure is composted and the compost goes back to the fields (what
  // they don't need is sold at the depot).
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
    {
      route: 'manure', garage: 'garage', trucks: 1,
      stops: [{ at: 'coop', pick: ['manure'], drop: [] }, { at: 'composter' }, { at: 'depot', drop: ['compost'] }],
    },
    ...morePower(dx, dy).slice(1),
    { truck: 'bread', garage: 'garage' },
    { type: 'solar', x: dx + 13, y: dy - 13 }, { type: 'turbine', x: dx + 16, y: dy - 7 },
  ],
  // Bread with neighbours doing the short hops: a mill between two wheat fields, a bakery beside it (flour), a coop under
  // both (bran in, eggs out), and a composter beside the coop and a field (manure in, compost out). Trucks only bring the
  // wheat of three more fields (and compost to them) and take the bread (and the compost the fields don't need) to the
  // depot: 3 trucks on 2 routes, where the
  // layout with every hop by truck (c2) needs 4 on 3.
  'c2:next': (dx, dy) => [
    { type: 'field', x: dx - 3, y: dy - 8, as: 'w' }, { type: 'field', x: dx - 2, y: dy - 11, as: 'n' },
    { type: 'sprinkler', x: dx - 3, y: dy - 9 }, { type: 'pylon', x: dx - 3, y: dy - 10 },
    { type: 'mill', x: dx, y: dy - 8, as: 'mill' }, { type: 'pylon', x: dx + 4, y: dy - 8 },
    { type: 'solar', x: dx + 5, y: dy - 8 }, { type: 'coop', x: dx, y: dy - 6, as: 'coop' },
    { type: 'garage', x: dx + 5, y: dy - 11, as: 'garage' },
    { type: 'bakery', x: dx + 2, y: dy - 8, as: 'bakery' }, { type: 'solar', x: dx + 5, y: dy - 6 },
    { type: 'composter', x: dx - 2, y: dy - 5, as: 'composter' },
    { route: 'bread', garage: 'garage', trucks: 1, stops: [{ at: 'bakery', drop: [], pick: ['bread'] }, { at: 'composter', drop: [], pick: ['compost'] }, { at: 'depot', drop: ['bread', 'compost'] }] },
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
  // Oil and bread on wind power: a press between two sunflower fields, a mill between two wheat fields, a coop under the mill
  // eating its bran and the press's seed cake, a bakery beside the mill and on the coop, and a digester under the coop burning
  // its manure for power. A truck brings a wheat field and two sunflower fields to the mill and the press; others take the
  // oil and seed cake, and the mill's spare bran and the bread, to the depot.
  c3: (dx, dy) => [
    { type: 'field', x: dx + 5, y: dy - 7, crop: 'sunflower', as: 'u1' }, { type: 'field', x: dx + 3, y: dy - 4, crop: 'sunflower', as: 'u2' },
    { type: 'sprinkler', x: dx + 6, y: dy - 4 }, { type: 'press', x: dx + 3, y: dy - 6, as: 'press' },
    { type: 'pylon', x: dx + 4, y: dy - 9 }, { type: 'pylon', x: dx + 8, y: dy - 4 }, { type: 'turbine', x: dx + 9, y: dy - 6 },
    { type: 'garage', x: dx + 5, y: dy - 11, as: 'garage' },
    { route: 'oil', garage: 'garage', trucks: 1, stops: [{ at: 'press', pick: ['oil', 'seedcake'] }, { at: 'depot' }] },
    { type: 'turbine', x: dx + 10, y: dy - 4 },
    { type: 'field', x: dx - 3, y: dy - 8, as: 'w' }, { type: 'field', x: dx - 2, y: dy - 11, as: 'n' },
    { type: 'sprinkler', x: dx - 3, y: dy - 9 }, { type: 'pylon', x: dx - 3, y: dy - 10 },
    { type: 'mill', x: dx, y: dy - 8, as: 'mill' }, { type: 'coop', x: dx, y: dy - 6, as: 'coop' },
    { type: 'bakery', x: dx + 2, y: dy - 8, as: 'bakery' },
    { route: 'bread', garage: 'garage', trucks: 1, stops: [{ at: 'mill', pick: ['bran'] }, { at: 'bakery', pick: ['bread'] }, { at: 'depot' }] },
    { type: 'digester', x: dx, y: dy - 3 }, { type: 'pylon', x: dx + 2, y: dy - 1 },
    { type: 'turbine', x: dx + 9, y: dy - 2 },
    { type: 'field', x: dx - 4, y: dy - 15, as: 'f1' }, { type: 'field', x: dx - 1, y: dy - 15, crop: 'sunflower', as: 'f2' },
    { type: 'field', x: dx + 2, y: dy - 15, crop: 'sunflower', as: 'f3' },
    { type: 'sprinkler', x: dx + 1, y: dy - 12 }, { type: 'sprinkler', x: dx - 3, y: dy - 12 },
    { route: 'farm', garage: 'garage', trucks: 1, stops: [{ at: 'f1' }, { at: 'f2' }, { at: 'f3' }, { at: 'mill', pick: [] }, { at: 'press', pick: [] }] },
    { type: 'hive', x: dx + 8, y: dy - 7 }, { type: 'hive', x: dx + 1, y: dy - 16 },
  ],
  // Honey cake through the long nights: a mill between two wheat fields, a bakery beside it making honey cake, a coop under
  // both (bran in, eggs out) and a hive beside the bakery, gathering from three bean fields (they flower; their beans aren't
  // needed). A digester beside the coop burns its manure for power at night. One truck takes the cake to the depot.
  c5: (dx, dy) => [
    { type: 'field', x: dx - 3, y: dy - 8, as: 'w' }, { type: 'field', x: dx - 2, y: dy - 11, as: 'n' },
    { type: 'sprinkler', x: dx - 3, y: dy - 9 }, { type: 'pylon', x: dx - 4, y: dy - 10 },
    { type: 'mill', x: dx, y: dy - 8, as: 'mill' }, { type: 'coop', x: dx, y: dy - 6 },
    { type: 'bakery', x: dx + 2, y: dy - 8, recipe: 'honeycake', as: 'bakery' }, { type: 'hive', x: dx + 4, y: dy - 8 },
    ...[-11, -7, -4].map((y) => ({ type: 'field' as const, x: dx + 5, y: dy + y, crop: 'beans' as const })),
    { type: 'pylon', x: dx + 4, y: dy - 10 }, { type: 'turbine', x: dx + 3, y: dy - 13 },
    { type: 'garage', x: dx + 2, y: dy - 12, as: 'garage' },
    { route: 'cake', garage: 'garage', trucks: 1, stops: [{ at: 'bakery', pick: ['honeycake'] }, { at: 'depot' }] },
    { type: 'digester', x: dx - 2, y: dy - 5 }, { type: 'pylon', x: dx - 3, y: dy - 3 },
    { type: 'battery', x: dx + 5, y: dy - 14 }, { type: 'turbine', x: dx + 7, y: dy - 12 },
  ],
  // Sauce on worn-out soil: a cannery between two tomato fields, an oil press beside it between two sunflower fields, a coop
  // under the press (seed cake in) and a bean field under the coop (beans in, and the soil back), a composter beside the coop
  // (manure in) feeding a sunflower field next door. Trucks take the sauce and eggs to the depot, and the compost to the other
  // fields (what they don't take to the depot). Compost and beans lift soil health past the goal without trees.
  c6: (dx, dy) => [
    ...sauce(dx, dy),
    { route: 'sauce', garage: 'garage', trucks: 1, stops: [{ at: 'cannery', pick: ['sauce'] }, { at: 'coop', pick: ['egg'], drop: [] }, { at: 'depot' }] },
    { type: 'composter', x: dx + 5, y: dy - 6, as: 'composter' },
    { type: 'sprinkler', x: dx + 5, y: dy - 2 }, { type: 'pylon', x: dx + 7, y: dy - 3 },
    { type: 'turbine', x: dx + 10, y: dy - 3 }, { type: 'battery', x: dx + 8, y: dy - 1 },
    {
      route: 'compost', garage: 'garage', trucks: 1, stops: [
        { at: 'composter', pick: ['compost'], drop: [] }, ...['t1', 't2', 'u2', 'b1'].map((at) => ({ at, pick: [] })), { at: 'depot', drop: ['compost'] },
      ],
    },
    { type: 'solar', x: dx + 8, y: dy - 5 },
  ],
  // Three orders at once, each its own block: sauce (a truck takes the coop's eggs and manure with it), linen to the west,
  // and bread to the east, the bakery taking the coop's eggs next door. A truck takes the mill's bran to the coop.
  c7: (dx, dy) => [
    ...sauce(dx, dy),
    { route: 'sauce', garage: 'garage', trucks: 1, stops: [{ at: 'cannery', pick: ['sauce'] }, { at: 'coop', pick: ['egg', 'manure'], drop: [] }, { at: 'depot' }] },
    { type: 'turbine', x: dx + 3, y: dy - 13 },
    ...linen(dx, dy),
    { type: 'hive', x: dx + 1, y: dy - 12 },
    { type: 'battery', x: dx + 8, y: dy - 14 }, { type: 'turbine', x: dx + 5, y: dy - 13 },
    ...bakery(dx, dy),
    { route: 'bread', garage: 'garage', trucks: 1, stops: [{ at: 'bakery', pick: ['bread'], drop: [] }, { at: 'depot' }] },
    { route: 'bran', garage: 'garage', trucks: 1, stops: [{ at: 'mill', pick: ['bran'] }, { at: 'coop', pick: [] }, { at: 'depot' }] },
    { type: 'solar', x: dx + 12, y: dy - 12 }, { type: 'turbine', x: dx + 10, y: dy - 11 }, { type: 'battery', x: dx + 12, y: dy - 6 },
  ],
  // Everything at once: Riverlands' blocks with the bakery making honey cake and a hive beside it. The coop's manure goes to
  // a composter with the sauce, and one truck takes the mill's bran to it and its compost round the fields (spare bran and
  // compost to the depot), which keeps soil health above the goal.
  c8: (dx, dy) => [
    ...sauce(dx, dy),
    { type: 'composter', x: dx - 2, y: dy - 4, as: 'composter' },
    {
      route: 'sauce', garage: 'garage', trucks: 1,
      stops: [{ at: 'cannery', pick: ['sauce'] }, { at: 'coop', pick: ['egg', 'manure'], drop: [] }, { at: 'composter', pick: [] }, { at: 'depot' }],
    },
    { type: 'turbine', x: dx + 3, y: dy - 13 },
    ...linen(dx, dy),
    { type: 'hive', x: dx + 1, y: dy - 12 },
    { type: 'battery', x: dx + 8, y: dy - 14 }, { type: 'turbine', x: dx + 5, y: dy - 13 },
    ...bakery(dx, dy, 'honeycake'), { type: 'hive', x: dx + 5, y: dy - 6 },
    { route: 'cake', garage: 'garage', trucks: 1, stops: [{ at: 'bakery', pick: ['honeycake'], drop: [] }, { at: 'depot' }] },
    {
      route: 'compost', garage: 'garage', trucks: 1, stops: [
        { at: 'mill', pick: ['bran'], drop: [] }, { at: 'composter', pick: ['compost'] },
        ...['t1', 't2', 'u2', 'u1', 'w2'].map((at) => ({ at, pick: [] })), { at: 'depot', drop: ['compost', 'bran'] },
      ],
    },
    { type: 'solar', x: dx + 12, y: dy - 12 }, { type: 'turbine', x: dx + 10, y: dy - 11 }, { type: 'battery', x: dx + 12, y: dy - 6 },
  ],
};
