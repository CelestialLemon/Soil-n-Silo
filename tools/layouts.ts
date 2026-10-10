import type { BuildingId, CropId, ItemId } from '../src/game/data.ts';
import type { Dir } from '../src/game/state.ts';

// The bot's layouts for `npm run sim` (tools/sim.ts), one per commission, relative to the depot's north-west tile and in
// build order. Also handy for scripted playtests in the browser (the dev server serves this file).

import type { SellMode } from '../src/game/data.ts';

/** A building to place; `refuse` lists goods it won't take from silos. */
export interface Step { type: BuildingId; x: number; y: number; rot?: Dir; crop?: CropId; refuse?: ItemId[] }
export type Layout = (dx: number, dy: number) => Step[];

/** A row of n fields, west to east from (x0, y). */
const fields = (x0: number, y: number, n: number, crop?: CropId): Step[] =>
  Array.from({ length: n }, (_, i) => ({ type: 'field' as const, x: x0 + 3 * i, y, crop }));

/**
 * The shared core: a silo ten tiles north of the depot with a row of five fields above it, three sprinklers between, and
 * pylons along the sprinklers. (ox, oy) is the silo's north-west tile.
 */
const core = (ox: number, oy: number, crop?: CropId): Step[] => [
  { type: 'silo', x: ox, y: oy }, { type: 'pylon', x: ox + 2, y: oy - 1 }, { type: 'solar', x: ox + 5, y: oy },
  ...fields(ox - 6, oy - 5, 5, crop),
  { type: 'sprinkler', x: ox + 1, y: oy - 2 }, { type: 'pylon', x: ox + 6, y: oy - 1 }, { type: 'sprinkler', x: ox + 7, y: oy - 2 },
  { type: 'pylon', x: ox - 2, y: oy - 1 }, { type: 'sprinkler', x: ox - 4, y: oy - 2 },
];

/** Layouts by commission, relative to the depot's north-west tile, in build order. */
export const LAYOUTS: Record<string, Layout> = {
  // Six wheat fields round one silo, with a mill beside it. Wheat is sold by half (a commission goal), so the silo shares
  // it between the mill and the depot; the bran is sold when spare.
  c1: (dx, dy) => {
    const ox = dx, oy = dy - 10;
    return [
      ...core(ox, oy),
      { type: 'mill', x: ox + 3, y: oy },
      { type: 'field', x: ox - 4, y: oy },
      { type: 'battery', x: ox + 3, y: oy + 2 }, { type: 'solar', x: ox + 5, y: oy + 2 }, { type: 'battery', x: ox + 7, y: oy },
      { type: 'turbine', x: ox + 9, y: oy - 1 }, { type: 'turbine', x: ox + 9, y: oy + 1 },
    ];
  },
  // Bread with the loop closed: five wheat fields feed a mill; the coop takes its bran and the beans from three fields;
  // the bakery bakes flour and eggs; the eggs and bran nothing takes are sold, and the digester burns only the manure. A
  // second silo by the coop shares the work.
  c2: (dx, dy) => {
    const ox = dx, oy = dy - 10;
    return [
      ...core(ox, oy),
      { type: 'mill', x: ox + 3, y: oy },
      { type: 'coop', x: ox, y: oy + 3 },
      ...fields(ox - 6, oy + 3, 2, 'beans'),
      { type: 'sprinkler', x: ox - 4, y: oy + 2 },
      { type: 'bakery', x: ox - 3, y: oy },
      // Power for the night before anything else.
      { type: 'battery', x: ox + 7, y: oy }, { type: 'turbine', x: ox + 8, y: oy + 2 },
      { type: 'digester', x: ox - 6, y: oy, refuse: ['bran'] },
      // A second silo by the coop: three drones aren't enough for the whole chain.
      { type: 'pylon', x: ox + 7, y: oy + 3 }, { type: 'silo', x: ox + 6, y: oy + 4 },
      { type: 'field', x: ox + 3, y: oy + 3, crop: 'beans' }, { type: 'sprinkler', x: ox + 2, y: oy + 2 },
      { type: 'solar', x: ox + 9, y: oy }, { type: 'battery', x: ox + 9, y: oy + 2 },
      { type: 'turbine', x: ox + 8, y: oy + 3 }, { type: 'hive', x: ox - 1, y: oy + 6 },
      // More power, once bread pays for it.
      { type: 'pylon', x: ox + 11, y: oy - 1 }, { type: 'solar', x: ox + 11, y: oy }, { type: 'solar', x: ox + 13, y: oy },
      { type: 'battery', x: ox + 11, y: oy + 2 }, { type: 'turbine', x: ox + 13, y: oy - 2 }, { type: 'turbine', x: ox + 13, y: oy + 2 },
    ];
  },
  // Linen and yarn: six flax fields round a silo with a spinner and a loom. Yarn is sold by half (a commission goal), so
  // the silo shares it between the loom and the depot.
  c4: (dx, dy) => {
    const ox = dx, oy = dy - 10;
    return [
      ...core(ox, oy, 'flax'),
      { type: 'spinner', x: ox + 3, y: oy },
      { type: 'field', x: ox - 4, y: oy, crop: 'flax' },
      { type: 'loom', x: ox + 3, y: oy + 2 }, { type: 'battery', x: ox + 7, y: oy },
      { type: 'solar', x: ox + 5, y: oy + 2 }, { type: 'battery', x: ox + 7, y: oy + 2 },
      { type: 'turbine', x: ox + 9, y: oy - 1 }, { type: 'turbine', x: ox + 9, y: oy + 1 }, { type: 'solar', x: ox + 5, y: oy + 4 },
    ];
  },
};

/** Goods the bot adds to the depot's sell list, by commission. */
export const SELL: Record<string, Partial<Record<ItemId, SellMode>>> = { c1: { bran: 'spare' }, c2: { egg: 'spare', bran: 'spare' } };
