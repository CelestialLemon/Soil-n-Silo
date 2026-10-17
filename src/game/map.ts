import { fbm2, hash2, mulberry32, noise2 } from './rng.ts';
import { FLAT, MAX_LEVEL, SIDES } from './relief.ts';
import type { Scenario } from './scenarios.ts';

// The map of a commission, generated from its seed: grass with a fertility per tile, water, rock and trees, and where the
// freight depot stands. The same scenario always gives the same map. The same noise carries on past the map's edge into
// the country around it (`generateLand`), which is only drawn.

export const TERRAIN = { grass: 0, water: 1, rock: 2, tree: 3 } as const;
export type TerrainKind = typeof TERRAIN[keyof typeof TERRAIN];

export interface MapData {
  width: number;
  height: number;
  /** TERRAIN per tile, row by row. */
  terrain: TerrainKind[];
  /** Soil fertility 0–100 per tile (what a field on it starts from). */
  fertility: number[];
  /** Each tile's level (0 the valley floor, at most MAX_LEVEL), and for a ramp the side it rises towards (FLAT if none); see relief.ts. */
  level: number[];
  ramp: number[];
  /** The speed of the river's current over each tile (m/s, 0 off the river and on still water). */
  current: number[];
  /** The depot's north-west tile (it is 3 × 3). */
  depot: { x: number; y: number };
}

/**
 * A commission's map with `margin` tiles of country beyond each edge, for drawing. Tiles are indexed from the land's own
 * north-west corner, so map tile (x, y) is land tile (x + margin, y + margin); the map part is exactly `generateMap`'s.
 */
export interface Land {
  /** The scenario's seed, for noise drawn over the land. */
  seed: number;
  margin: number;
  width: number;
  height: number;
  terrain: TerrainKind[];
  fertility: number[];
  /** Levels and ramps as on the map (relief.ts); beyond the edge the land rises higher than MAX_LEVEL into hills. */
  level: number[];
  ramp: number[];
  /** The depot's north-west tile, in map coordinates. */
  depot: { x: number; y: number };
  /** The river's current over each tile (vx, vz in m/s, two numbers a tile); 0 off the river and on still water. */
  flow: Float32Array;
  /** The track south of the depot, in map coordinates beyond the south edge only. */
  track: Uint8Array;
  /** How many levels each river tile is below its highest tile on the land (0 off the river). */
  drop: Uint8Array;
}

export const DEPOT_SIZE = 3;
/** Tiles around the depot kept clear, so every commission starts with room to build. */
const CLEARING = 8;

export function generateMap(sc: Scenario): MapData {
  const { width, height, terrain, fertility, level, ramp, depot, flow } = generateLand(sc, 0);
  const current = terrain.map((_, i) => Math.round(Math.hypot(flow[i * 2], flow[i * 2 + 1]) * 100) / 100);
  return { width, height, terrain, fertility, level, ramp, current, depot };
}

/** The country settles to this level for its outermost RIM tiles, where the distant woods start. */
export const RIM_LEVEL = 6;
const RIM = 10, RIM_BLEND = 12, CELL = 4;
/** The home oval encloses the required Chebyshev-five square; ascent distances are tiles per level. */
const HOME = 5, HOME_OVAL = 7, HOME_STRETCH = 1.25, HOME_STEP = 3.2, HOME_SWAY = 1.2, HOME_PERIOD = 3, HOME_BLEND = 4;
/** Gentle meanders and width variation are sampled in tiles, with short straight approaches to exits and falls. */
const RIVER_PERIOD = 9, RIVER_PERIOD_SPREAD = 3, RIVER_SWAY = 2.8, RIVER_RIPPLE = 0.7, RIVER_RIPPLE_PERIOD = 5;
const RIVER_WIDTH = 3, RIVER_WIDTH_SWAY = 0.65, RIVER_WIDTH_PERIOD = 8, RIVER_STRAIGHT = 2, RIVER_EDGE = 3;
/** Flat river banks leave room for fields, then widen into curved upland terraces. */
const RIVER_BANK = 4.2, VALLEY_FLOOR = 5, TERRACE_STEP = 8, RUGGED_STEP = 4.5, FALL_BLEND = 6;
/** Basins need a flat shore and several tiles per step, rather than a thin ring of cliffs. */
const BASIN_BANK = 3, BASIN_STEP = 3.5, BASIN_GAP = 4, BASIN_ATTEMPTS = 64, BASIN_STRETCH = 1.15, BASIN_HOME = 12;
/** Two drifting waves bend ridge contours differently at each height. */
const RIDGE_SWAY = 2.6, RIDGE_PERIOD = 6, RIDGE_DRIFT = 15, RIDGE_RIPPLE = 1.6, RIDGE_RIPPLE_PERIOD = 3.8, RIDGE_RIPPLE_DRIFT = 11;
const LONG_CLIFF = 12, RAMP_GAP = 3, RUGGED = 0.8;
const HILL_REACH = 24, HILL_BASE = 2, HILL_HEIGHT = 7, COUNTRY_TOP = 10;
const VALLEY_INNER = 1.5, VALLEY_OUTER = 8, COUNTRY_RAMP_CHANCE = 0.04;
const TRACK_BEND = 5, TRACK_BEND_START = 6, TRACK_BEND_END = 26;
const ROCK_BIAS = 0.2, FOREST_BIAS = 0.08, FOREST_THICKEN = 0.012;
const SOIL_HEIGHT = 9, SOIL_WATER = 10, SOIL_REACH = 2;
const RIVER_FAST = 1.1, RIVER_SLOW = 0.6;
const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

export function generateLand(sc: Scenario, margin: number): Land {
  const { width: w, height: h, seed, terrain: t } = sc, r = mulberry32(seed);
  const M = margin, lw = w + 2 * M, lh = h + 2 * M, size = lw * lh;
  const terrain = new Array<TerrainKind>(size).fill(TERRAIN.grass), fertility = new Array<number>(size).fill(0);
  const level = new Array<number>(size).fill(0), ramp = new Array<number>(size).fill(FLAT);
  const flow = new Float32Array(size * 2), drop = new Uint8Array(size), track = new Uint8Array(size);
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const inside = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
  const depot = { x: Math.floor(w / 2 - 1 + (r() - 0.5) * w * 0.4), y: h - DEPOT_SIZE - 1 };
  const land: Land = { seed, margin: M, width: lw, height: lh, terrain, fertility, level, ramp, depot, flow, drop, track };
  const top = Math.min(MAX_LEVEL, Math.ceil(t.relief * MAX_LEVEL));

  const river = riverCourse(sc, depot, r);
  const surface = generateRelief(sc, depot, river, r);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = idx(x, y), j = y * w + x;
    terrain[i] = surface.terrain[j]; level[i] = surface.level[j]; ramp[i] = surface.ramp[j];
  }
  const country = countryside(sc, land, river);

  // Quantiles keep the requested shares despite the clearing. High ground and cliff edges favour rock and, more mildly,
  // trees. Ramps and the track stay grass; neither counts against a scatter's quota.
  const habitat = new Float32Array(size);
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const i = idx(x, y), near = onMap(x, y) ? onMap : inside;
    let cliff = 0;
    if (country.away[i] <= 12) for (const [dx, dy] of SIDES) if (near(x + dx, y + dy) && level[idx(x + dx, y + dy)] !== level[i]) { cliff = 1; break; }
    habitat[i] = t.relief * (Math.min(1, level[i] / Math.max(1, top)) + cliff);
  }
  scatter(sc, land, habitat, country.away, t.rock, 3.5, seed + 37, TERRAIN.rock, 0);
  scatter(sc, land, habitat, country.away, t.forest, 7, seed + 21, TERRAIN.tree, FOREST_THICKEN);

  fertilise(sc, land, country);
  return land;
}

type Surface = Pick<MapData, 'width' | 'height' | 'terrain' | 'level' | 'ramp' | 'depot'>;

/** A tile-scale river; the same functions continue the channel into the drawing margin. */
interface River {
  vertical: boolean;
  sign: number;
  span: number;
  falls: number[];
  course: (a: number) => number;
  bounds: (a: number) => { lo: number; hi: number };
  level: (a: number) => number;
}

function riverCourse(sc: Scenario, depot: Land['depot'], r: () => number): River {
  const { width: w, height: h, seed, terrain: t } = sc;
  const vertical = r() < 0.5, sign = vertical || hash2(seed, 1, 77) < 0.5 ? 1 : -1;
  const span = vertical ? h : w, breadth = vertical ? w : h;
  const phase = r() * Math.PI * 2, period = RIVER_PERIOD + r() * RIVER_PERIOD_SPREAD;
  const centre = vertical ? (depot.x + 1 < w / 2 ? w * 0.77 : w * 0.23) : h * 0.27;
  // Keep short flat approaches at the map edge, then resume the same meander in the country beyond it.
  const axis = (a: number) => {
    const end = span - 1 - RIVER_STRAIGHT;
    if (a < RIVER_STRAIGHT) return RIVER_STRAIGHT + Math.min(0, a + RIVER_STRAIGHT);
    if (a > end) return end + Math.max(0, a - span + 1 - RIVER_STRAIGHT);
    return a;
  };
  const course = (a: number) => {
    a = axis(a);
    return Math.max(RIVER_EDGE, Math.min(breadth - 1 - RIVER_EDGE, centre + RIVER_SWAY * Math.sin(a / period + phase) + RIVER_RIPPLE * Math.sin(a / RIVER_RIPPLE_PERIOD + phase)));
  };
  const top = Math.min(MAX_LEVEL, Math.ceil(t.relief * MAX_LEVEL));
  const falls = top === 0 ? [] : top === 1 ? [Math.round(span * 0.5)] : [Math.round(span * 0.34), Math.round(span * 0.68)];
  const level = (a: number) => falls.length - falls.filter((f) => sign > 0 ? a >= f : a < f).length;
  const rawBounds = (a: number) => {
    const fall = falls.find((f) => Math.abs(a - f) <= RIVER_STRAIGHT);
    if (fall !== undefined) a = fall;
    const width = RIVER_WIDTH + RIVER_WIDTH_SWAY * Math.sin(axis(a) / RIVER_WIDTH_PERIOD + phase);
    return { lo: Math.ceil(course(a) - width / 2), hi: Math.floor(course(a) + width / 2) };
  };
  // A median removes one-row notches in either bank while preserving the 2–4-tile channel width.
  const bounds = (a: number) => {
    const left = rawBounds(a - 1), middle = rawBounds(a), right = rawBounds(a + 1);
    const median = (a: number, b: number, c: number) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
    return { lo: median(left.lo, middle.lo, right.lo), hi: median(left.hi, middle.hi, right.hi) };
  };
  return { vertical, sign, span, falls, course, bounds, level };
}

/** Smooth contours give the steps their outlines; cleanup leaves room for buildings at every bend and shore. */
function generateRelief(sc: Scenario, depot: Land['depot'], river: River, r: () => number): Surface {
  const { width: w, height: h, seed, terrain: t } = sc;
  const terrain = new Array<TerrainKind>(w * h).fill(TERRAIN.grass), level = new Array<number>(w * h).fill(0);
  const ramp = new Array<number>(w * h).fill(FLAT), surface: Surface = { width: w, height: h, terrain, level, ramp, depot };
  const idx = (x: number, y: number) => y * w + x;
  const top = Math.min(MAX_LEVEL, Math.ceil(t.relief * MAX_LEVEL));
  const fixed = new Uint8Array(w * h), minimum = new Uint8Array(w * h);
  const home = (x: number, y: number) => Math.hypot((x - depot.x - 1) / HOME_STRETCH, y - depot.y - 1);
  const desired = new Float64Array(w * h);
  const slices = Array.from({ length: river.span }, (_, a) => ({ ...river.bounds(a), centre: river.course(a), level: river.level(a) }));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = idx(x, y), a = river.vertical ? y : x, b = river.vertical ? x : y;
    const bend = RIDGE_SWAY * Math.sin(x / RIDGE_PERIOD + seed + y / RIDGE_DRIFT)
      + RIDGE_RIPPLE * Math.sin(x / RIDGE_RIPPLE_PERIOD + seed * 0.3 - y / RIDGE_RIPPLE_DRIFT);
    let height = top * (1 - (y + 0.5 - bend) / h);
    if (t.water === 'river') {
      const slice = slices[a], distance = Math.abs(b - slice.centre);
      const rise = Math.max(0, distance - VALLEY_FLOOR + 3 * (noise2(a / 10, b / 10, seed + 61) - 0.5)) / (t.relief >= RUGGED ? RUGGED_STEP : TERRACE_STEP);
      height = rise;
      for (const fall of river.falls) height += 1 - smoothstep(-FALL_BLEND, FALL_BLEND, river.sign * (a - fall) + Math.max(0, distance - 4) * 0.45 * Math.sin(b / 7 + seed));
      if (b >= slice.lo && b <= slice.hi) { terrain[i] = TERRAIN.water; fixed[i] = 1; }
      if (distance < RIVER_BANK) height = river.level(a);
      height = Math.max(river.level(a), height);
    }
    // An oval clearing contains the required square but rounds the home terrace's outline further out.
    const distance = home(x, y), homeBend = HOME_SWAY * Math.sin(x / HOME_PERIOD + seed) * smoothstep(HOME_OVAL, HOME_OVAL + HOME_BLEND, distance);
    height = Math.min(height, Math.max(0, (distance - HOME_OVAL + homeBend) / HOME_STEP));
    desired[i] = height;
    level[i] = Math.max(0, Math.min(top, Math.round(height)));
    if (terrain[i] === TERRAIN.water) level[i] = river.level(a);
    if (Math.max(Math.abs(x - depot.x - 1), Math.abs(y - depot.y - 1)) <= HOME) { fixed[i] = 1; level[i] = 0; }
  }

  cutBasins(sc, surface, r, home);
  settleWater(surface, t.water === 'river', fixed, minimum);
  mergeNarrowTerraces(surface, fixed, minimum);
  tidyTerraces(surface, fixed, minimum, desired);
  mergeNarrowTerraces(surface, fixed, minimum);
  connectTerraces(sc, surface);
  return surface;
}

/** Still water is cut from ellipses, with a flat bank and broad terraces around each basin. */
function cutBasins(sc: Scenario, surface: Surface, r: () => number, home: (x: number, y: number) => number) {
  const { width: w, height: h, terrain, level } = surface, t = sc.terrain;
  const top = Math.min(MAX_LEVEL, Math.ceil(t.relief * MAX_LEVEL)), idx = (x: number, y: number) => y * w + x;
  const basinHeight = (l: number, distance: number, radius: number) => l + Math.round(Math.max(0, distance - radius - BASIN_BANK) / BASIN_STEP);
  if (t.water !== 'river' && t.water !== 'none') {
    // Keep one broad summit: several overlapping basin envelopes must not erase the scenario's relief range.
    const summit: { x: number; y: number }[] = [];
    for (let y = 0; y <= h - 3 && !summit.length; y++) for (let x = 0; x <= w - 3; x++) {
      if (level[idx(x, y)] !== top || !landSquare(surface, x, y, 3)) continue;
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) summit.push({ x: x + dx, y: y + dy });
      break;
    }
    const basinAt = (cx: number, cy: number, radius: number) => {
      let l = top;
      for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(h - 1, cy + radius); y++) {
        for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(w - 1, cx + radius); x++) {
          if (Math.hypot(x - cx, (y - cy) * BASIN_STRETCH) < radius) l = Math.min(l, level[idx(x, y)]);
        }
      }
      return l;
    };
    const n = t.water === 'lake' ? 1 : 3 + Math.floor(r() * 3);
    const ponds: { x: number; y: number; radius: number }[] = [];
    for (let k = 0; k < n; k++) {
      const radius = t.water === 'lake' ? 6 + r() * 2 : 2 + r() * 1.3;
      let cx = 0, cy = 0, basin = 0, fits = false;
      for (let attempt = 0; attempt < BASIN_ATTEMPTS; attempt++) {
        cx = radius + BASIN_BANK + r() * (w - 2 * (radius + BASIN_BANK)); cy = radius + BASIN_BANK + r() * (h * 0.7 - 2 * (radius + BASIN_BANK));
        if (home(cx, cy) <= BASIN_HOME + radius || ponds.some((p) => Math.hypot(cx - p.x, (cy - p.y) * BASIN_STRETCH) <= radius + p.radius + BASIN_GAP)) continue;
        // Ponds share a valley datum, so nearby shelves can overlap without making thin terraces between their levels.
        const floor = basinAt(cx, cy, radius + BASIN_BANK);
        basin = t.water === 'ponds' ? Math.max(0, Math.min(1, top - 1)) : floor;
        if (floor < basin) continue;
        const keepsSummit = summit.every((p) => basinHeight(basin, Math.hypot(p.x - cx, (p.y - cy) * BASIN_STRETCH), radius) >= top);
        if (keepsSummit) { fits = true; break; }
      }
      if (!fits) continue;
      ponds.push({ x: cx, y: cy, radius });
      const water: number[] = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const distance = Math.hypot(x - cx, (y - cy) * BASIN_STRETCH), i = idx(x, y);
        level[i] = Math.min(level[i], basinHeight(basin, distance, radius));
        if (distance < radius) water.push(i);
      }
      // A tiny disc can rasterise as a rectangle. Use its actual tile bounds to cut the four corners.
      const xs = water.map((i) => i % w), ys = water.map((i) => Math.floor(i / w));
      const west = Math.min(...xs), east = Math.max(...xs), north = Math.min(...ys), south = Math.max(...ys);
      for (const i of water) {
        const x = i % w, y = Math.floor(i / w);
        if ((x === west || x === east) && (y === north || y === south)) continue;
        terrain[i] = TERRAIN.water; level[i] = basin;
      }
    }
  }
}

/** Settle each still surface and protect the water and home while limiting every neighbouring step to one level. */
function settleWater(surface: Surface, river: boolean, fixed: Uint8Array, minimum: Uint8Array) {
  const { width: w, height: h, terrain, level } = surface;
  const waterBodies = regions(surface, true).groups;
  for (const body of waterBodies) {
    if (!river) {
      let l = MAX_LEVEL;
      for (const i of body) { l = Math.min(l, level[i]); neighbours(surface, i, (j) => { l = Math.min(l, level[j]); }); }
      // Protect the shores too: later corner cleanup must not lift them out of watering reach.
      for (const i of body) {
        level[i] = l;
        neighbours(surface, i, (j) => { if (!fixed[j]) level[j] = l; fixed[j] = 1; });
      }
    }
    for (const i of body) {
      fixed[i] = 1;
      neighbours(surface, i, (j) => { if (terrain[j] !== TERRAIN.water) { minimum[j] = Math.max(minimum[j], level[i]); level[j] = Math.max(level[j], minimum[j]); } });
    }
  }
  const queue = Array.from({ length: w * h }, (_, i) => i);
  for (let k = 0; k < queue.length; k++) neighbours(surface, queue[k], (j) => {
    if (level[j] > level[queue[k]] + 1 && !fixed[j]) { level[j] = level[queue[k]] + 1; queue.push(j); }
  });
}

/** Only map tiles take part in cleanup and ramp placement; the drawing margin cannot change these regions. */
function neighbours(m: Surface, i: number, visit: (j: number, dir: number) => void) {
  const x = i % m.width, y = Math.floor(i / m.width);
  if (y > 0) visit(i - m.width, 0); if (x + 1 < m.width) visit(i + 1, 1);
  if (y + 1 < m.height) visit(i + m.width, 2); if (x > 0) visit(i - 1, 3);
}

function regions(m: Surface, water: boolean) {
  const labels = new Int32Array(m.width * m.height).fill(-1), groups: number[][] = [];
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] >= 0 || (m.terrain[i] === TERRAIN.water) !== water) continue;
    const q = [i], id = groups.length; labels[i] = id;
    for (let k = 0; k < q.length; k++) neighbours(m, q[k], (j) => {
      if (labels[j] < 0 && (m.terrain[j] === TERRAIN.water) === water && (water || m.level[j] === m.level[i])) {
        labels[j] = id; q.push(j);
      }
    });
    groups.push(q);
  }
  return { labels, groups };
}

function landSquare(m: Surface, x: number, y: number, n: number) {
  if (x < 0 || y < 0 || x + n > m.width || y + n > m.height) return false;
  const l = m.level[y * m.width + x];
  for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) {
    const i = (y + dy) * m.width + x + dx;
    if (m.terrain[i] === TERRAIN.water || m.ramp[i] !== FLAT || m.level[i] !== l) return false;
  }
  return true;
}

const covered = (m: Surface, x: number, y: number) => {
  for (let oy = -1; oy <= 0; oy++) for (let ox = -1; ox <= 0; ox++) if (landSquare(m, x + ox, y + oy, 2)) return true;
  return false;
};

/** Merge terraces without a 3×3 field site; these narrow pockets cannot spare tiles for a ramp and flat landings. */
function mergeNarrowTerraces(m: Surface, fixed: Uint8Array, minimum: Uint8Array) {
  const { width: w, level } = m;
  for (const body of regions(m, false).groups) {
    if (body.some((i) => fixed[i] || landSquare(m, i % w, Math.floor(i / w), 3))) continue;
    const members = new Set(body), heights = new Set<number>();
    for (const i of body) neighbours(m, i, (j) => { if (level[j] !== level[i]) heights.add(level[j]); });
    for (const l of heights) {
      const fits = body.every((i) => {
        let ok = l >= minimum[i];
        neighbours(m, i, (j) => { if (!members.has(j) && Math.abs(l - level[j]) > 1) ok = false; });
        return ok;
      });
      if (fits) { for (const i of body) level[i] = l; break; }
    }
  }
}

/** Repair unsupported corners with small squares, preserving water, home and the one-level envelope. */
function tidyTerraces(surface: Surface, fixed: Uint8Array, minimum: Uint8Array, desired: Float64Array) {
  const { width: w, height: h, terrain, level } = surface;
  const idx = (x: number, y: number) => y * w + x;
  const onMap = (x: number, y: number) => x >= 0 && x < w && y >= 0 && y < h;
  const bad = (x: number, y: number) => onMap(x, y) && terrain[idx(x, y)] !== TERRAIN.water && !covered(surface, x, y);
  // First reduce the sliver count strictly. At a stubborn bank corner, raising can move a sliver towards broader land;
  // this second phase never lowers tiles, so even equal-count repairs terminate as the integer height sum increases.
  let raising = false;
  for (;;) {
    let changes = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!bad(x, y)) continue;
      let best: { ids: number[]; height: number; removed: number; cost: number } | undefined;
      for (const n of [2, 3]) for (let oy = 1 - n; oy <= 0; oy++) for (let ox = 1 - n; ox <= 0; ox++) {
        const sx = x + ox, sy = y + oy;
        if (!onMap(sx, sy) || !onMap(sx + n - 1, sy + n - 1)) continue;
        const ids = Array.from({ length: n * n }, (_, k) => idx(sx + k % n, sy + Math.floor(k / n)));
        if (ids.some((i) => terrain[i] === TERRAIN.water)) continue;
        const old = ids.map((i) => level[i]);
        for (const l of new Set(old)) {
          if (raising && (old.some((v) => v > l) || old.every((v) => v === l))) continue;
          if (ids.some((i) => (fixed[i] && level[i] !== l) || minimum[i] > l)) continue;
          let before = 0, after = 0, valid = true, cost = 0;
          for (let ty = sy - 1; ty <= sy + n; ty++) for (let tx = sx - 1; tx <= sx + n; tx++) if (bad(tx, ty)) before++;
          ids.forEach((i) => { level[i] = l; cost += Math.abs(desired[i] - l); });
          for (let ty = sy - 1; ty <= sy + n; ty++) for (let tx = sx - 1; tx <= sx + n; tx++) if (bad(tx, ty)) after++;
          for (const i of ids) {
            const x = i % w, y = Math.floor(i / w);
            for (const [dx, dy] of SIDES) if (onMap(x + dx, y + dy) && Math.abs(level[idx(x + dx, y + dy)] - l) > 1) valid = false;
          }
          ids.forEach((i, k) => { level[i] = old[k]; });
          // Prefer fewer slivers, then a small edit close to the original height field.
          const removed = before - after; cost += n;
          if (valid && (removed > 0 || (raising && removed === 0))
            && (!best || removed > best.removed || (removed === best.removed && cost < best.cost))) best = { ids, height: l, removed, cost };
        }
      }
      if (best) { for (const i of best.ids) level[i] = best.height; changes++; }
    }
    if (!changes) { if (raising) break; raising = true; }
  }
}

/** Join the flat terraces without cutting their necks or leaving unsupported tiles beside a ramp. */
function connectTerraces(sc: Scenario, surface: Surface) {
  const { seed } = sc, { width: w, height: h, level, ramp, depot } = surface;
  const { labels, groups } = regions(surface, false);
  // Join components first; then add a second separated route along each long shared cliff.
  const parent = groups.map((_, i) => i);
  const root = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  interface Boundary { low: number; high: number; dir: number; key: string }
  const boundaries: Boundary[] = [], lengths = new Map<string, number>(), runs = new Map<string, number>();
  for (let i = 0; i < w * h; i++) if (labels[i] >= 0) neighbours(surface, i, (j, d) => {
    if (labels[j] < 0 || level[j] !== level[i] + 1) return;
    const key = `${labels[i]}:${labels[j]}`;
    boundaries.push({ low: i, high: j, dir: d, key }); lengths.set(key, (lengths.get(key) ?? 0) + 1);
  });
  boundaries.sort((a, b) => hash2(a.low, a.high, seed + 81) - hash2(b.low, b.high, seed + 81));
  const placed: number[] = [];
  const place = (b: Boundary, gap: number, n: number) => {
    const [dx, dy] = SIDES[b.dir], step = dy * w + dx, cross = b.dir % 2 ? w : 1;
    for (let offset = 0; offset < n; offset++) {
      const tiles = Array.from({ length: n }, (_, k) => b.low + (k - offset) * cross);
      if (tiles.some((i) => {
        const x = i % w, y = Math.floor(i / w);
        return x < 0 || x >= w || y < 0 || y >= h || x - dx < 0 || x - dx >= w || x + dx < 0 || x + dx >= w
          || y - dy < 0 || y - dy >= h || y + dy < 0 || y + dy >= h || (b.dir % 2 ? x !== b.low % w : y !== Math.floor(b.low / w))
          || labels[i] !== labels[b.low] || labels[i + step] !== labels[b.high] || labels[i - step] !== labels[b.low]
          || Math.max(Math.abs(x - depot.x - 1), Math.abs(y - depot.y - 1)) <= HOME
          || [i - step, i, i + step].some((j) => ramp[j] !== FLAT)
          || placed.some((j) => Math.max(Math.abs(j % w - x), Math.abs(Math.floor(j / w) - y)) < gap);
      })) continue;
      tiles.forEach((i) => { ramp[i] = b.dir; });
      let ok = true;
      const affected = new Set<number>();
      for (const i of tiles) {
        affected.add(i); neighbours(surface, i, (j) => { affected.add(j); neighbours(surface, j, (k) => affected.add(k)); });
      }
      for (const i of affected) if (labels[i] >= 0 && ramp[i] === FLAT && !covered(surface, i % w, Math.floor(i / w))) ok = false;
      // A ramp must not cut a narrow flat neck into disconnected pieces.
      const remaining = groups[labels[b.low]].filter((i) => ramp[i] === FLAT), visited = new Set<number>(), q = remaining.slice(0, 1);
      if (q.length) visited.add(q[0]);
      for (let k = 0; k < q.length; k++) neighbours(surface, q[k], (j) => {
        if (labels[j] === labels[b.low] && ramp[j] === FLAT && !visited.has(j)) { visited.add(j); q.push(j); }
      });
      if (visited.size !== remaining.length) ok = false;
      if (ok) {
        placed.push(...tiles); parent[root(labels[b.low])] = root(labels[b.high]); runs.set(b.key, (runs.get(b.key) ?? 0) + 1); return true;
      }
      tiles.forEach((i) => { ramp[i] = FLAT; });
    }
    return false;
  };
  // Try wide runs across all candidates before accepting a narrow one.
  for (const gap of [RAMP_GAP, 2]) for (const n of [3, 2, 1]) for (const b of boundaries) {
    if (root(labels[b.low]) !== root(labels[b.high])) place(b, gap, n);
  }
  for (const n of [3, 2, 1]) for (const b of boundaries) {
    if ((lengths.get(b.key) ?? 0) > LONG_CLIFF && (runs.get(b.key) ?? 0) < 2) place(b, 2, n);
  }
}

function countryside(sc: Scenario, land: Land, channel: River) {
  const { width: w, height: h, seed, terrain: t } = sc;
  const { margin: M, width: lw, height: lh, terrain, level, ramp, depot, track, flow, drop } = land, size = lw * lh;
  const { vertical, sign, course, bounds, level: riverLevel } = channel;
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const inside = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
  const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - w + 1), Math.max(0, -y, y - h + 1));
  // The country continues the map's edge heights, opening into valleys by the river and the winding track. The track rises on
  // straight sections, with flat ground at each end of a ramp; both valleys disappear beneath the level rim.
  const bendHash = Math.sin(seed * 127.1 + 3 * 311.7) * 43758.5453;
  const bend = bendHash - Math.floor(bendHash) < 0.5 ? -1 : 1;
  const trackAt = (y: number) => depot.x + 1 + Math.round(bend * TRACK_BEND * smoothstep(h + TRACK_BEND_START, h + TRACK_BEND_END, y));
  const trackX = Array.from({ length: lh }, (_, y) => trackAt(y - M));
  const roadRamps = new Set<number>();
  let last = h + M;
  for (let y = h + M - RIM - 2; y > h && roadRamps.size < RIM_LEVEL; y--) {
    if (last - y >= 2 && trackAt(y - 1) === trackAt(y) && trackAt(y) === trackAt(y + 1)) { roadRamps.add(y); last = y; }
  }
  const roadLevels = new Uint8Array(lh);
  // A cropped margin may end before the ascent is complete; the track still leaves home at its level.
  let roadLevel = 0;
  for (let y = h; y < h + M; y++) { roadLevels[y + M] = roadLevel; if (roadRamps.has(y)) roadLevel++; }
  const rim = (x: number, y: number) => Math.min(x + M, y + M, w + M - 1 - x, h + M - 1 - y);
  const away = new Float32Array(size), gx = Math.floor(-M / CELL), gy = Math.floor(-M / CELL);
  const gw = Math.floor((w + M - 1) / CELL) - gx + 1, gh = Math.floor((h + M - 1) / CELL) - gy + 1;
  const hillNoise = new Float32Array(gw * gh), soilNoise = new Float32Array(gw * gh);
  if (M) for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    hillNoise[y * gw + x] = noise2((x + gx) / 3, (y + gy) / 3, seed + 71);
    soilNoise[y * gw + x] = fbm2((x + gx) * CELL / 9, (y + gy) * CELL / 9, seed + 51, 3);
  }
  const riverSpan = vertical ? h : w;
  const river = Array.from({ length: riverSpan + M * 2 }, (_, i) => {
    const a = i - M, db = (course(a + 0.1) - course(a - 0.1)) * 5, n = Math.hypot(db, 1);
    const speed = RIVER_SLOW + (RIVER_FAST - RIVER_SLOW) * noise2(a / 12, 1, seed + 6);
    return { ...bounds(a), level: riverLevel(a), along: sign * speed / n, across: sign * speed * db / n };
  });
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    if (onMap(x, y)) continue;
    const i = idx(x, y); away[i] = beyond(x, y);
    const rimDistance = rim(x, y);
    const roadDistance = y >= h ? Math.max(0, Math.abs(x - trackX[y + M]) - 1) : 1e6;
    track[i] = roadDistance === 0 ? 1 : 0;
    if (rimDistance < RIM) { level[i] = RIM_LEVEL; continue; }
    const edge = idx(Math.max(0, Math.min(w - 1, x)), Math.max(0, Math.min(h - 1, y)));
    const current = river[(vertical ? y : x) + M], b = vertical ? x : y;
    const waterDistance = t.water === 'river' ? Math.max(0, current.lo - b, b - current.hi) : 1e6;
    const open = Math.min(roadDistance, waterDistance), valley = smoothstep(VALLEY_INNER, VALLEY_OUTER, open);
    if (waterDistance === 0 && rimDistance >= RIM + 2) terrain[i] = TERRAIN.water;
    const hill = smoothstep(0, HILL_REACH, away[i]) * (HILL_BASE + HILL_HEIGHT * hillNoise[(Math.floor(y / CELL) - gy) * gw + Math.floor(x / CELL) - gx]) * valley;
    const base = roadDistance < waterDistance ? roadLevels[y + M] : current.level;
    const l = base + (level[edge] - base) * valley + hill;
    level[i] = Math.min(COUNTRY_TOP, Math.round(l + (RIM_LEVEL - l) * (1 - smoothstep(RIM, RIM + RIM_BLEND, rimDistance))));
    if (terrain[i] === TERRAIN.water) level[i] = current.level;
  }
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const i = idx(x, y);
    if (terrain[i] !== TERRAIN.water) continue;
    for (const [dx, dy] of SIDES) if (inside(x + dx, y + dy) && !onMap(x + dx, y + dy)) {
      const j = idx(x + dx, y + dy);
      if (terrain[j] !== TERRAIN.water) level[j] = Math.max(level[j], level[i]);
    }
  }
  for (let y = h; y < h + M; y++) for (let x = trackX[y + M] - 1; x <= trackX[y + M] + 1; x++) if (inside(x, y)) {
    const i = idx(x, y); terrain[i] = TERRAIN.grass; level[i] = roadLevels[y + M];
    if (roadRamps.has(y)) ramp[i] = 2;
  }
  for (let y = -M + 1; y < h + M - 1; y++) for (let x = -M + 1; x < w + M - 1; x++) {
    if (onMap(x, y) || rim(x, y) < RIM || hash2(x, y, seed + 83) > COUNTRY_RAMP_CHANCE) continue;
    const i = idx(x, y);
    if (terrain[i] !== TERRAIN.grass || track[i] || ramp[i] !== FLAT) continue;
    if (SIDES.some(([dx, dy]) => ramp[idx(x + dx, y + dy)] !== FLAT)) continue;
    for (let d = 0; d < 4; d++) {
      const [dx, dy] = SIDES[d], low = idx(x - dx, y - dy), high = idx(x + dx, y + dy);
      if (terrain[low] === TERRAIN.water || terrain[high] === TERRAIN.water || level[low] !== level[i] || level[high] !== level[i] + 1) continue;
      ramp[i] = d; break;
    }
  }

  let highestRiver = 0;
  if (t.water === 'river') for (let i = 0; i < size; i++) if (terrain[i] === TERRAIN.water) highestRiver = Math.max(highestRiver, level[i]);
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const i = idx(x, y);
    if (terrain[i] !== TERRAIN.water || t.water !== 'river') continue;
    const current = river[(vertical ? y : x) + M];
    flow[i * 2] = vertical ? current.across : current.along; flow[i * 2 + 1] = vertical ? current.along : current.across;
    drop[i] = highestRiver - level[i];
  }

  return { away, soilNoise, gw, gh, gx, gy };
}

function scatter(sc: Scenario, land: Land, habitat: Float32Array, away: Float32Array, share: number, scale: number, s: number, kind: TerrainKind, thicken: number) {
  const { width: w, height: h } = sc, { margin: M, width: lw, terrain, ramp, track, depot } = land;
  const gx = Math.floor(-M / CELL), gy = Math.floor(-M / CELL);
  const gw = Math.floor((w + M - 1) / CELL) - gx + 1, gh = Math.floor((h + M - 1) / CELL) - gy + 1;
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const distanceHome = (x: number, y: number) => Math.max(Math.abs(x - depot.x - 1), Math.abs(y - depot.y - 1));

  if (share <= 0) return;
  const scatterNoise = new Float32Array(gw * gh);
  const noise = (x: number, y: number) => noise2(x / scale, y / scale, s) * 0.85 + noise2(x * 1.7, y * 1.7, s + 3) * 0.15;
  if (M) for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) scatterNoise[y * gw + x] = noise((x + gx) * CELL, (y + gy) * CELL);
  const v = (x: number, y: number) => {
    const i = idx(x, y);
    return (onMap(x, y) ? noise(x, y) : scatterNoise[(Math.floor(y / CELL) - gy) * gw + Math.floor(x / CELL) - gx])
      + habitat[i] * (kind === TERRAIN.rock ? ROCK_BIAS : FOREST_BIAS);
  };
  const vals: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = idx(x, y);
    if (terrain[i] === TERRAIN.grass && ramp[i] === FLAT && distanceHome(x, y) > CLEARING) vals.push(v(x, y));
  }
  vals.sort((a, b) => b - a);
  const cut = vals[Math.min(vals.length - 1, Math.floor(w * h * share))] ?? Infinity;
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const i = idx(x, y);
    if (terrain[i] !== TERRAIN.grass || ramp[i] !== FLAT || track[i] || distanceHome(x, y) <= CLEARING) continue;
    if (v(x, y) + thicken * away[i] >= cut) terrain[i] = kind;
  }
}

function fertilise(sc: Scenario, land: Land, country: ReturnType<typeof countryside>) {
  const { width: w, height: h, seed, terrain: t } = sc;
  const { margin: M, width: lw, height: lh, terrain, level, fertility } = land, size = lw * lh;
  const { soilNoise, gw, gx, gy } = country, top = Math.min(MAX_LEVEL, Math.ceil(t.relief * MAX_LEVEL));
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const inside = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
  // Soil retains its water bonus and local variation. Centre the grass noise separately at each height before applying
  // the uphill penalty, so a large noise blob cannot reverse it, and relief does not change the commission's mean soil.
  const wet = new Uint8Array(size);
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) if (terrain[idx(x, y)] === TERRAIN.water) {
    for (let dy = -SOIL_REACH; dy <= SOIL_REACH; dy++) for (let dx = -SOIL_REACH; dx <= SOIL_REACH; dx++) {
      const tx = x + dx, ty = y + dy;
      if (inside(tx, ty) && (!onMap(tx, ty) || onMap(x, y))) wet[idx(tx, ty)] = 1;
    }
  }
  let total = 0, count = 0, heightTotal = 0;
  const totals = new Array<number>(top + 1).fill(0), counts = new Array<number>(top + 1).fill(0);
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const i = idx(x, y);
    const soil = onMap(x, y) ? fbm2(x / 9, y / 9, seed + 51, 3) : soilNoise[(Math.floor(y / CELL) - gy) * gw + Math.floor(x / CELL) - gx];
    let f = t.soil + t.soilSpread * (soil * 2 - 1) * 1.6 - level[i] * t.relief * SOIL_HEIGHT;
    if (wet[i]) f += SOIL_WATER;
    fertility[i] = f;
    if (onMap(x, y) && terrain[i] === TERRAIN.grass) { total += f; count++; heightTotal += level[i]; totals[level[i]] += f; counts[level[i]]++; }
  }
  const correction = count ? t.soil - total / count : 0;
  for (let i = 0; i < size; i++) {
    const l = level[i], offset = counts[l] ? t.soil + (heightTotal / count - l) * t.relief * SOIL_HEIGHT - totals[l] / counts[l] : correction;
    fertility[i] = Math.round(Math.max(5, Math.min(95, fertility[i] + offset)));
  }
}
