import { pushesAt } from './events.ts';
import { SIDES } from './relief.ts';
import type { MapData } from './map.ts';
import type { Scenario } from './scenarios.ts';

// The frozen river: in a cold snap the river freezes over at its quiet stretches, from the banks inward, and a water wheel on
// ice stops. A fall and the water just below it keep running (rivers freeze at the margins first, and a fall never stills), so
// a wheel beside a fall keeps turning. Pure rules on the map's river; the view draws the ice (world/iceView.ts) from the same
// grid, so what is drawn open is what runs.

/** What the grid of water needs: the river's tiles (not ponds), and the level of the water on every tile. */
export interface Water {
  width: number;
  height: number;
  /** 1 for a river tile, else 0. */
  river: ArrayLike<number>;
  /** The level of the water's surface on a river tile (levels). */
  level: (i: number) => number;
}

export interface Ice {
  /** 1 where the river keeps running in a cold snap: a fall (a river tile beside one at another level) and the tiles next to it. */
  open: Uint8Array;
  /** How many tiles in from the bank a river tile is (1: beside land or still water). 0 off the river. */
  bank: Uint8Array;
  /** The widest `bank` of any tile that can freeze (0 when none can). */
  reach: number;
}

/** How far from a fall the water stays open, in tiles (Chebyshev). */
export const OPEN_REACH = 1;

/** Where the river keeps running and how far each tile is from a bank. */
export function iceOf(w: Water): Ice {
  const { width, height } = w, n = width * height;
  const open = new Uint8Array(n), bank = new Uint8Array(n), fall: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!w.river[i]) continue;
    const x = i % width, y = (i - x) / width;
    for (const [dx, dy] of SIDES) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const j = ny * width + nx;
      if (w.river[j] && w.level(j) !== w.level(i)) { fall.push(i); break; }
    }
  }
  for (const i of fall) {
    const x = i % width, y = (i - x) / width;
    for (let dy = -OPEN_REACH; dy <= OPEN_REACH; dy++) for (let dx = -OPEN_REACH; dx <= OPEN_REACH; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height) open[ny * width + nx] = 1;
    }
  }
  // The distance in from the bank, tile by tile over the river; the edge of the grid is not a bank (the river runs on past it).
  let queue: number[] = [], reach = 0;
  for (let i = 0; i < n; i++) {
    if (!w.river[i]) continue;
    const x = i % width, y = (i - x) / width;
    if (SIDES.some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < width && ny < height && !w.river[ny * width + nx]; })) { bank[i] = 1; queue.push(i); }
  }
  for (let d = 1; queue.length; d++) {
    const next: number[] = [];
    for (const i of queue) {
      if (!open[i]) reach = Math.max(reach, d);
      const x = i % width, y = (i - x) / width;
      for (const [dx, dy] of SIDES) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const j = ny * width + nx;
        if (w.river[j] && !bank[j]) { bank[j] = Math.min(255, d + 1); next.push(j); }
      }
    }
    queue = next;
  }
  return { open, bank, reach };
}

const cache = new WeakMap<MapData, Ice>();

/** The map's river for a cold snap (worked out once; the river's shape never changes). */
export function mapIce(map: MapData): Ice {
  let ice = cache.get(map);
  if (!ice) {
    const river = new Uint8Array(map.width * map.height);
    for (let i = 0; i < river.length; i++) river[i] = map.current[i] > 0 ? 1 : 0;
    ice = iceOf({ width: map.width, height: map.height, river, level: (i) => map.corner[i * 4] });
    cache.set(map, ice);
  }
  return ice;
}

/** How far the river's quiet stretches are frozen over at a time, 0–1: a cold snap builds the ice in and melts it out. */
export const iceAt = (sc: Pick<Scenario, 'events'>, time: number): number => pushesAt(sc, time).ice;

/** Whether the river keeps running at a tile in a cold snap (a fall, or just below one). */
export const runsAt = (map: MapData, x: number, y: number): boolean => mapIce(map).open[y * map.width + x] === 1;

/** The ice's reach in steps, so the drawn ice changes a few times as it forms and melts: tiles in from the bank that are frozen (0: none). */
export function frozenBank(ice: Ice, cover: number): number {
  return cover <= 0.02 ? 0 : Math.ceil(Math.min(1, cover) * ice.reach - 1e-6);
}
