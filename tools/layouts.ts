import type { BuildingId, CropId, ItemId } from '../src/game/data.ts';
import type { Dir } from '../src/game/state.ts';

// The bot's layouts for `npm run sim` (tools/sim.ts), one per commission, relative to the depot's north-west tile and in
// build order. Also handy for scripted playtests in the browser (the dev server serves this file).

export interface Step { type: BuildingId; x: number; y: number; rot?: Dir; crop?: CropId; filter?: ItemId }
export type Layout = (dx: number, dy: number) => Step[];

const N: Dir = 0, E: Dir = 1, S: Dir = 2, W: Dir = 3;
const line = (type: BuildingId, x0: number, y0: number, n: number, rot: Dir): Step[] =>
  Array.from({ length: n }, (_, i) => ({ type, x: x0 + (rot === E ? i : rot === 3 ? -i : 0), y: y0 + (rot === S ? i : rot === 0 ? -i : 0), rot }));

/** Layouts by commission, relative to the depot's north-west tile, in build order. */
export const LAYOUTS: Record<string, Layout> = {
  // Six wheat fields along a belt; a splitter sends half to the depot as wheat and half to a mill, whose flour (and bran)
  // goes on to the depot. Sprinklers, solar, a turbine and batteries power it.
  c1: (dx, dy) => {
    const F = dy - 12, x0 = dx - 20;
    return [
      ...Array.from({ length: 6 }, (_, i) => ({ type: 'field' as const, x: x0 + 3 * i, y: F })),
      ...line('belt', x0, F + 3, 18, E),
      { type: 'splitter', x: x0 + 18, y: F + 3 },
      { type: 'belt', x: x0 + 19, y: F + 3, rot: E },
      ...line('belt', x0 + 18, F + 4, dy + 1 - (F + 4), S),
      { type: 'belt', x: dx - 2, y: dy + 1, rot: E }, { type: 'belt', x: dx - 1, y: dy + 1, rot: E },
      { type: 'mill', x: dx, y: F + 3 },
      ...line('belt', dx + 2, F + 3, dy - (F + 3), S),
      { type: 'pylon', x: dx + 3, y: F + 1 }, { type: 'solar', x: dx + 4, y: F - 2 }, { type: 'battery', x: dx + 4, y: F + 2 },
      { type: 'turbine', x: dx + 3, y: F + 4 },
      { type: 'pylon', x: x0 + 17, y: F - 2 }, { type: 'sprinkler', x: x0 + 15, y: F - 1 },
      { type: 'pylon', x: x0 + 11, y: F - 2 }, { type: 'sprinkler', x: x0 + 9, y: F - 1 },
      { type: 'pylon', x: x0 + 5, y: F - 2 }, { type: 'sprinkler', x: x0 + 3, y: F - 1 },
      { type: 'solar', x: dx + 6, y: F - 2 }, { type: 'battery', x: dx + 6, y: F + 2 },
    ];
  },
  // Bread with the loop closed: wheat fields feed a mill; a sorter sends its flour into the bakery and its bran to the
  // coop, with the overflow burnt in the digester; bean fields feed the coop too (and restore the soil); a sorter sends the
  // eggs into the bakery and the manure on to the depot with the bread.
  c2: (dx, dy) => [
    // Wheat: six fields east of the mill, a belt west along under them, then down into the mill.
    ...Array.from({ length: 6 }, (_, i) => ({ type: 'field' as const, x: dx + 2 + 3 * i, y: dy - 13 })),
    ...line('belt', dx + 19, dy - 10, 19, W),
    { type: 'belt', x: dx, y: dy - 10, rot: S }, { type: 'belt', x: dx, y: dy - 9, rot: S },
    { type: 'mill', x: dx, y: dy - 8 },
    { type: 'belt', x: dx, y: dy - 6, rot: S },
    { type: 'sorter', x: dx, y: dy - 5, rot: S, filter: 'flour' },
    // Power for the middle.
    { type: 'pylon', x: dx + 3, y: dy - 6 }, { type: 'solar', x: dx + 4, y: dy - 5 }, { type: 'solar', x: dx + 6, y: dy - 5 },
    { type: 'battery', x: dx + 4, y: dy - 8 },
    // Bran west to the coop; beans from three fields north of it.
    { type: 'belt', x: dx - 1, y: dy - 5, rot: W }, { type: 'belt', x: dx - 2, y: dy - 5, rot: W },
    { type: 'coop', x: dx - 5, y: dy - 6 },
    ...Array.from({ length: 3 }, (_, i) => ({ type: 'field' as const, x: dx - 13 + 3 * i, y: dy - 11, crop: 'beans' as const })),
    ...line('belt', dx - 13, dy - 8, 9, E),
    { type: 'belt', x: dx - 4, y: dy - 8, rot: S }, { type: 'belt', x: dx - 4, y: dy - 7, rot: S },
    { type: 'digester', x: dx + 1, y: dy - 6 },
    // Eggs east into the bakery; manure down to the bread line and the depot.
    ...line('belt', dx - 3, dy - 3, 2, E),
    { type: 'sorter', x: dx - 1, y: dy - 3, rot: E, filter: 'egg' },
    { type: 'belt', x: dx - 1, y: dy - 2, rot: S }, { type: 'belt', x: dx - 1, y: dy - 1, rot: E },
    { type: 'bakery', x: dx, y: dy - 4 },
    { type: 'belt', x: dx, y: dy - 2, rot: S }, { type: 'belt', x: dx, y: dy - 1, rot: S },
    // Water and more power, as credits allow.
    { type: 'pylon', x: dx + 1, y: dy - 12 }, { type: 'pylon', x: dx + 5, y: dy - 15 }, { type: 'sprinkler', x: dx + 4, y: dy - 14 },
    { type: 'pylon', x: dx + 11, y: dy - 15 }, { type: 'sprinkler', x: dx + 10, y: dy - 14 },
    { type: 'pylon', x: dx + 17, y: dy - 15 }, { type: 'sprinkler', x: dx + 16, y: dy - 14 },
    { type: 'pylon', x: dx - 3, y: dy - 12 }, { type: 'pylon', x: dx - 8, y: dy - 13 },
    { type: 'sprinkler', x: dx - 11, y: dy - 12 }, { type: 'sprinkler', x: dx - 6, y: dy - 12 },
    { type: 'hive', x: dx - 4, y: dy - 10 },
    { type: 'solar', x: dx + 4, y: dy - 3 }, { type: 'solar', x: dx + 6, y: dy - 3 }, { type: 'battery', x: dx + 6, y: dy - 8 },
    { type: 'turbine', x: dx + 3, y: dy - 3 },
  ],
};
