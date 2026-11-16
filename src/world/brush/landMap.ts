import { LAND_COVER, LAND_GROUND, type Beyond, type LandMap, type LandPatch, type LandRect } from '../../../brush3d/src/shared.ts';
import { BUILDINGS } from '../../game/data.ts';
import { GROUND } from '../../game/ground.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { groundOf } from '../../game/rules.ts';
import type { GameState } from '../../game/state.ts';

// The game's land in brush3d's terms (#202): what `r.setLand` takes, from the map and the country the game generates round
// it. Plain data, so the tests check it in Node; land.ts sends it. (The water is #207's water.ts, WATER_DOWN under its tiles' level.)
//
// The country round the map: the river and the track running off under the woods near
// the country's edge, woods' floor far out (the woods' trees are wild.ts's), and past the country an apron of distant
// woods rising and falling a little, so even a far view never sees past the world.

/** The game's sizes: metres a tile and a level (scale.ts, passed in so this loads in Node). */
export interface Scale { tile: number; level: number }

/** Over the country's last RIM tiles the river and the track run out of sight; past NEAR tiles from the map, woods are woods' floor. */
const RIM = 10, NEAR = 12;
/** How far past the country the apron of distant woods goes (tiles), its cells (tiles), and how much it rises and falls (levels). */
const APRON = 120, APRON_CELL = 4, APRON_ROLL = 6.4;
/**
 * How far (m) the river's and the ponds' surface stands under their tiles' level: the banks stand a little over the
 * water, and the water's edge is where the bed (brush3d cuts it under the water's tiles, 1.2 m
 * at its deepest, brush3d/docs/LAND.md) rises through it, a little in from the tile's side rather than on it. In metres,
 * not levels, so it stays inside the bed whatever a level's height (#220). The water map (water.ts) lays them at this.
 */
export const WATER_DOWN = 0.48;

/** The game's kinds of ground as brush3d's. */
const GROUND_OF: Record<number, number> = {
  [GROUND.loam]: LAND_GROUND.loam, [GROUND.silt]: LAND_GROUND.silt, [GROUND.clay]: LAND_GROUND.clay, [GROUND.sand]: LAND_GROUND.sand, [GROUND.stony]: LAND_GROUND.stony,
};

const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The land's tiles, as setLand and updateLand take them. */
export type Tiles = Pick<LandMap, 'corners' | 'worked' | 'cover' | 'ground'>;

/**
 * The land's tiles as the game has them now: the country's, with the map's own over it (its earthworks, cleared trees,
 * moved rocks). Given the tiles as they were (`was`), only the map's are worked out again: the country never changes.
 */
export function tilesOf(s: GameState, land: Land, { level }: Scale, was?: Tiles): Tiles {
  const m = s.map, M = land.margin, W = land.width, n = W * land.height;
  const corners = was ? was.corners.slice() : new Float32Array(n * 4), worked = was ? was.worked.slice() : new Uint8Array(n);
  const cover = was ? was.cover.slice() : new Uint8Array(n), ground = was ? was.ground.slice() : new Uint8Array(n);
  // The tiles under a building that needs level ground: drawn level (as ground.ts's Lie fits them, its pads).
  const pads = new Uint8Array(m.width * m.height);
  for (const b of s.buildings) {
    if (groundOf(b.type) !== 'flat') continue;
    const size = BUILDINGS[b.type].size;
    for (let y = b.y; y < b.y + size; y++) for (let x = b.x; x < b.x + size; x++) pads[y * m.width + x] = 1;
  }
  /** How far (tiles) a point is inside the country's outer edge, and beyond the map's edge. */
  const rim = (x: number, y: number) => Math.min(x + M, y + M, m.width + M - x, m.height + M - y);
  const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - m.width), Math.max(0, -y, y - m.height));
  const [lx0, ly0, lx1, ly1] = was ? [M, M, M + m.width, M + m.height] : [0, 0, W, land.height];
  for (let ly = ly0; ly < ly1; ly++) for (let lx = lx0; lx < lx1; lx++) {
    const i = ly * W + lx, x = lx - M, y = ly - M, onMap = x >= 0 && y >= 0 && x < m.width && y < m.height, mi = y * m.width + x;
    const t = onMap ? m.terrain[mi] : land.terrain[i];
    for (let k = 0; k < 4; k++) corners[i * 4 + k] = (onMap ? m.corner[mi * 4 + k] : land.corner[i * 4 + k]) * level;
    ground[i] = GROUND_OF[onMap ? m.ground[mi] : land.ground[i]] ?? LAND_GROUND.loam;
    // Water's tiles stay level (as the rules' relief has them), whether or not they're drawn as water.
    worked[i] = t === TERRAIN.water || (onMap && (s.worked[mi] === 1 || pads[mi] === 1)) ? 1 : 0;
    const mid = rim(x + 0.5, y + 0.5), track = !onMap && land.track[i] === 1;
    let c: number = LAND_COVER.grass;
    if (t === TERRAIN.water) c = onMap || mid > RIM + 2 ? LAND_COVER.water : LAND_COVER.woods;
    else if (!onMap && track && mid < RIM + 8) c = LAND_COVER.woods;
    else if (track) c = LAND_COVER.track;
    else if (t === TERRAIN.rock) c = LAND_COVER.rock;
    else if (t === TERRAIN.tree && !onMap && beyond(x + 0.5, y + 0.5) > NEAR) c = LAND_COVER.woods;
    cover[i] = c;
  }
  return { corners, worked, cover, ground };
}

/** The whole land for `r.setLand`. */
export function landMapOf(s: GameState, land: Land, scale: Scale): LandMap {
  const M = land.margin, m = s.map;
  return {
    width: land.width, height: land.height, tile: scale.tile, level: scale.level, x0: -M * scale.tile, z0: -M * scale.tile,
    ...tilesOf(s, land, scale), map: { x: M, y: M, width: m.width, height: m.height }, beyond: beyondOf(s, land, scale),
  };
}

/**
 * The apron past the country: a coarse grid of heights from the level the country settles to at its rim, rising and falling
 * a little away from it (terrain.ts's apron, at brush3d's scale).
 */
function beyondOf(s: GameState, land: Land, { tile, level }: Scale): Beyond {
  const M = land.margin, w = s.map.width, h = s.map.height, from = -M - APRON;
  const nx = Math.ceil((w + 2 * (M + APRON)) / APRON_CELL) + 1, nz = Math.ceil((h + 2 * (M + APRON)) / APRON_CELL) + 1;
  const rimLevel = Math.min(...land.corner.slice(0, 4)), height = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = from + i * APRON_CELL, y = from + j * APRON_CELL;
    const out = Math.max(-M - x, x - (w + M), -M - y, y - (h + M), 0);
    height[j * nx + i] = (rimLevel + (hash(x * 0.37, y * 0.71) - 0.5) * APRON_ROLL * smoothstep(0, 8, out)) * level;
  }
  return { nx, nz, cell: APRON_CELL * tile, x0: from * tile, z0: from * tile, height };
}

/**
 * The tiles that differ between two of `tilesOf`'s (looking only `within` a rectangle, if given), as the rectangle round
 * them and its values for `r.updateLand`; null where nothing differs.
 */
export function patchOf(was: Tiles, now: Tiles, width: number, within?: LandRect): { rect: LandRect; patch: LandPatch } | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const area = within ?? { x: 0, y: 0, width, height: now.cover.length / width }, c = was.corners, d = now.corners;
  for (let y = area.y; y < area.y + area.height; y++) for (let x = area.x; x < area.x + area.width; x++) {
    const i = y * width + x, k = i * 4;
    if (was.worked[i] === now.worked[i] && was.cover[i] === now.cover[i] && was.ground[i] === now.ground[i]
      && c[k] === d[k] && c[k + 1] === d[k + 1] && c[k + 2] === d[k + 2] && c[k + 3] === d[k + 3]) continue;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1);
  }
  if (x0 === Infinity) return null;
  const rect = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, n = rect.width * rect.height;
  const patch = { corners: new Float32Array(n * 4), worked: new Uint8Array(n), cover: new Uint8Array(n), ground: new Uint8Array(n) };
  for (let j = 0; j < rect.height; j++) for (let i = 0; i < rect.width; i++) {
    const from = (y0 + j) * width + x0 + i, to = j * rect.width + i;
    patch.worked[to] = now.worked[from]; patch.cover[to] = now.cover[from]; patch.ground[to] = now.ground[from];
    for (let k = 0; k < 4; k++) patch.corners[to * 4 + k] = now.corners[from * 4 + k];
  }
  return { rect, patch };
}
