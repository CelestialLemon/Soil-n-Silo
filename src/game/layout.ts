// The farm's layout (design doc, open question "Farm layout", decided here): a fenced farm with the farmhouse, shop stall and
// shipping bin along the north, the coop and its chicken run on the west, a 20 x 15 field (300 tillable tiles) in the middle,
// and open grass where bought machines go. Each character is one 1 m tile; tile (col, row) covers x in [col, col + 1] and
// z in [row, row + 1]. Buildings face +z (south), towards the camera's home view.
//   #  fence      .  grass (machines can go here)      ,  field grass (tillable)      -  dirt path
//   H  farmhouse  S  shop stall   B  shipping bin   C  coop   r  chicken run   f  run fence
//   T  oak        P  pine         b  bush           @  where the camera starts (grass)
export const MAP = [
  '##################################',
  '#T.......P.....T.........P....T..#',
  '#..HHHH......SS.................P#',
  '#..HHHH...............b..........#',
  '#..HHHHB.........................#',
  '#.......b........................#',
  '#--------------------------------#',
  '#..........-.....................#',
  '#.CCC......-.,,,,,,,,,,,,,,,,,,,,#',
  '#.CCC......-.,,,,,,,,,,,,,,,,,,,,#',
  '#fCCCff....-.,,,,,,,,,,,,,,,,,,,,#',
  '#rrrrrf....-.,,,,,,,,,,,,,,,,,,,,#',
  '#rrrrrf....-@,,,,,,,,,,,,,,,,,,,,#',
  '#rrrrrf....-.,,,,,,,,,,,,,,,,,,,,#',
  '#rrrrrf....-.,,,,,,,,,,,,,,,,,,,,#',
  '#ffffff....-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.,,,,,,,,,,,,,,,,,,,,#',
  '#..........-.....................#',
  '#T....b....-...P.........b.....T.#',
  '##################################',
];
export const WIDTH = MAP[0].length, DEPTH = MAP.length;

export const at = (col: number, row: number) => MAP[row]?.[col] ?? '#';
export const inFarm = (col: number, row: number) => col >= 0 && row >= 0 && col < WIDTH && row < DEPTH;
export const tileIndex = (col: number, row: number) => row * WIDTH + col;

/** The field: grass the hoe can till. */
export const isField = (col: number, row: number) => at(col, row) === ',';
/** Open grass where a bought machine can stand. */
export const isOpenGrass = (col: number, row: number) => '.@'.includes(at(col, row));
export const isRun = (col: number, row: number) => at(col, row) === 'r';

export type BuildingKind = 'farmhouse' | 'shop' | 'bin' | 'coop';
export interface Footprint { col: number; row: number; cols: number; rows: number }
export const footprintCentre = (f: Footprint) => ({ x: f.col + f.cols / 2, z: f.row + f.rows / 2 });

/** A building's footprint: the bounding box of its letter in the map. */
function footprint(ch: string): Footprint {
  let c0 = Infinity, r0 = Infinity, c1 = -1, r1 = -1;
  MAP.forEach((line, row) => [...line].forEach((c, col) => {
    if (c !== ch) return;
    c0 = Math.min(c0, col); r0 = Math.min(r0, row); c1 = Math.max(c1, col); r1 = Math.max(r1, row);
  }));
  if (c1 < 0) throw new Error(`layout: no '${ch}' in the map`);
  return { col: c0, row: r0, cols: c1 - c0 + 1, rows: r1 - r0 + 1 };
}

export const BUILDINGS: Record<BuildingKind, Footprint> = {
  farmhouse: footprint('H'), shop: footprint('S'), bin: footprint('B'), coop: footprint('C'),
};
/** The chicken run in front of the coop, inside its fence. */
export const RUN = footprint('r');

export function home(): { col: number; row: number } {
  const f = footprint('@');
  return { col: f.col, row: f.row };
}

/** How many tiles the hoe can till (the design doc asks for about 300). */
export const FIELD_TILES = MAP.reduce((n, line) => n + [...line].filter((c) => c === ',').length, 0);
