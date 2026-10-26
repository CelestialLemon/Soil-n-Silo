import { fertilityOf, GROUND, layGround, type GroundKind } from './ground.ts';
import { fbm2, hash2, mulberry32, noise2 } from './rng.ts';
import { centreLevel, isGentle, joins, MAX_LEVEL, SIDES } from './relief.ts';
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
  /** Soil fertility 0–100 per tile (what a field on it starts from): its ground's range, with local noise. */
  fertility: number[];
  /** The kind of ground (GROUND) per tile, row by row: a fixed trait, never changed (ground.ts). Water tiles hold loam, unread. */
  ground: GroundKind[];
  /** Each tile's corner heights, four a tile (north-west, north-east, south-east, south-west; 0 the valley floor, at most MAX_LEVEL); see relief.ts. */
  corner: number[];
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
  ground: GroundKind[];
  /** Corner heights as on the map (relief.ts); beyond the edge the land rises higher than MAX_LEVEL into hills. */
  corner: number[];
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
  const { width, height, terrain, fertility, ground, corner, depot, flow } = generateLand(sc, 0);
  const current = terrain.map((_, i) => Math.round(Math.hypot(flow[i * 2], flow[i * 2 + 1]) * 100) / 100);
  return { width, height, terrain, fertility, ground, corner, current, depot };
}

// Heights are levels; distances are tiles. Keep the landform scale and grade independent of amplitude: a taller landscape
// can use a larger HILL_HEIGHT / COUNTRY_HEIGHT and CLIFF_HEIGHT, and a steeper GRADE, without changing the construction.
const HILL_HEIGHT = 10, HILL_SCALE = 24, GRADE = 0.38, COUNTRY_HEIGHT = 22, COUNTRY_REACH = 42;
const HOME = 5, HOME_RADIUS = 9, HOME_STRETCH = 1.25;
const FLOODPLAIN = 3.5, FALL_HEIGHT = 3, FALL_RELIEF = 0.55, SECOND_FALL_RELIEF = 0.85, FALL_REACH = 8;
const CLIFF_HEIGHT = 3, MESA_RELIEF = 0.65, MESA_RADIUS = 8, MESA_ATTEMPTS = 24;
const BASIN_BANK = 3, BASIN_STRETCH = 1.15, BASIN_GAP = 4, BASIN_ATTEMPTS = 64;
const RIVER_PERIOD = 9, RIVER_PERIOD_SPREAD = 3, RIVER_SWAY = 2.8, RIVER_RIPPLE = 0.7, RIVER_RIPPLE_PERIOD = 5;
const RIVER_WIDTH = 3, RIVER_WIDTH_SWAY = 0.65, RIVER_WIDTH_PERIOD = 8, RIVER_STRAIGHT = 2, RIVER_EDGE = 3;
const TRACK_BEND = 5, TRACK_BEND_START = 6, TRACK_BEND_END = 26, TRACK_HEIGHT = 16, TRACK_REACH = 58;
const ROCK_BIAS = 0.2, FOREST_BIAS = 0.12, FOREST_THICKEN = 0.012;
const CELL = 4;
/** How far from a map tile the land can change its ground (tiles): the hollows round it, the water beside it, the vote among its neighbours. */
const GROUND_REACH = 12;
/** How much a stony tile adds to a rock's pull (in habitat units): rocks lie mostly on stony ground. */
const ROCK_STONY = 1.5;
const RIVER_FAST = 1.1, RIVER_SLOW = 0.6;
const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

interface Basin { x: number; y: number; radius: number }
interface Country { away: Float32Array; height: Float32Array }

/**
 * The land of a commission with `margin` tiles of country round the map. The ground of a tile depends on the land up to
 * GROUND_REACH tiles away (hollows, the water's reach), so the land is always laid with at least that much country and
 * cropped after: the map's ground is the same however little or much country is drawn.
 */
export function generateLand(sc: Scenario, margin: number): Land {
  const wide = lay(sc, Math.max(margin, GROUND_REACH));
  return wide.margin === margin ? wide : crop(wide, margin);
}

/** A land with a narrower margin: every array's middle. */
function crop(land: Land, margin: number): Land {
  const cut = land.margin - margin, w = land.width - 2 * cut, h = land.height - 2 * cut;
  const take = <A extends { [i: number]: number }>(a: ArrayLike<number>, n: number, make: (len: number) => A): A => {
    const out = make(w * h * n);
    for (let y = 0; y < h; y++) for (let k = 0; k < w * n; k++) out[y * w * n + k] = a[((y + cut) * land.width + cut) * n + k];
    return out;
  };
  const plain = (a: number[], n = 1) => take(a, n, (len) => new Array<number>(len).fill(0));
  return {
    ...land, margin, width: w, height: h,
    terrain: plain(land.terrain) as TerrainKind[], fertility: plain(land.fertility), ground: plain(land.ground) as GroundKind[], corner: plain(land.corner, 4),
    flow: take(land.flow, 2, (len) => new Float32Array(len)), track: take(land.track, 1, (len) => new Uint8Array(len)), drop: take(land.drop, 1, (len) => new Uint8Array(len)),
  };
}

function lay(sc: Scenario, margin: number): Land {
  const { width: w, height: h, seed, terrain: t } = sc, r = mulberry32(seed);
  const M = margin, lw = w + 2 * M, lh = h + 2 * M, size = lw * lh;
  const terrain = new Array<TerrainKind>(size).fill(TERRAIN.grass), fertility = new Array<number>(size).fill(0), ground = new Array<GroundKind>(size).fill(GROUND.loam);
  const corner = new Array<number>(size * 4).fill(0), flow = new Float32Array(size * 2);
  const drop = new Uint8Array(size), track = new Uint8Array(size);
  const depot = { x: Math.floor(w / 2 - 1 + (r() - 0.5) * w * 0.4), y: h - DEPOT_SIZE - 1 };
  const land: Land = { seed, margin: M, width: lw, height: lh, terrain, fertility, ground, corner, depot, flow, drop, track };
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const home = (x: number, y: number) => Math.hypot((x - depot.x - 1.5) / HOME_STRETCH, y - depot.y - 1.5);
  const river = riverCourse(sc, depot, r), basins = basinSites(sc, r, home);
  const halo = MAX_LEVEL + COUNTRY_HEIGHT + CLIFF_HEIGHT, P = M + halo;
  const vw = w + P * 2 + 1, vh = h + P * 2 + 1, vertices = vw * vh;
  const slices = Array.from({ length: (river.vertical ? h : w) + P * 2 + 1 }, (_, i) => {
    const a = i - P, bounds = river.bounds(a), previous = river.bounds(a - 1);
    let datum = 0;
    for (const f of river.falls) datum += FALL_HEIGHT * (1 - smoothstep(-FALL_REACH, FALL_REACH, river.sign * (a - f)));
    return { ...bounds, vertexLo: Math.min(bounds.lo, previous.lo), vertexHi: Math.max(bounds.hi, previous.hi) + 1, centre: river.course(a), datum };
  });
  const bend = hash2(seed, 3, 91) < 0.5 ? -1 : 1;
  const trackX = (y: number) => depot.x + 1 + Math.round(bend * TRACK_BEND * smoothstep(h + TRACK_BEND_START, h + TRACK_BEND_END, y));
  const trackHeight = (y: number) => TRACK_HEIGHT * smoothstep(h + 6, h + TRACK_REACH, y);
  const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - w), Math.max(0, -y, y - h));
  const shore = (x: number, y: number) => {
    if (t.water === 'river') {
      const a = river.vertical ? y : x, b = river.vertical ? x : y, slice = slices[a + P];
      return Math.max(0, slice.vertexLo - b, b - slice.vertexHi);
    }
    let distance = Infinity;
    for (const p of basins) distance = Math.min(distance, Math.hypot(x - p.x, (y - p.y) * BASIN_STRETCH) - p.radius);
    return Math.max(0, distance);
  };

  // Each reach has its own sheet of vertices. Away from a fall all sheets coincide; near it, the floodplain follows the
  // water's datum and the scarp fades out across the bank, leaving a gentle route round either end of the fall.
  // A halo larger than any possible height makes the lowering pass independent of the requested drawing margin: even
  // a zero just outside the halo cannot influence a map corner. No country-only constraint is allowed to reach the map.
  // A lower cone from water protects the bank when the home envelope cuts into an upstream reach. Like the upper
  // envelope, it is one-Lipschitz, so the lowering pass cannot push a shore below the surface it must meet.
  const waterDistance = new Int16Array(vertices).fill(32767);
  if (t.water === 'river' && river.falls.length) {
    for (let y = -P; y <= h + P; y++) for (let x = -P; x <= w + P; x++) {
      if (shore(x, y) === 0) waterDistance[(y + P) * vw + x + P] = 0;
    }
    gentleVertices(waterDistance, vw, vh);
  }
  const sheets = Array.from({ length: t.water === 'river' ? river.falls.length + 1 : 1 }, () => new Int16Array(vertices));
  for (let y = -P; y <= h + P; y++) for (let x = -P; x <= w + P; x++) {
    const i = (y + P) * vw + x + P, distance = beyond(x, y);
    const hills = HILL_HEIGHT * t.relief * (0.25 + 0.75 * noise2(x / HILL_SCALE, y / HILL_SCALE, seed + 71));
    const country = COUNTRY_HEIGHT * smoothstep(0, COUNTRY_REACH, distance) * (0.6 + 0.4 * noise2(x / 32, y / 32, seed + 73));
    const homeCap = Math.max(0, home(x, y) - HOME_RADIUS) * GRADE;
    const shoreDistance = shore(x, y), bank = t.water === 'river' ? FLOODPLAIN : BASIN_BANK;
    const rise = Math.max(0, shoreDistance - bank) * GRADE;
    const a = river.vertical ? y : x, b = river.vertical ? x : y;
    const { datum, centre } = slices[a + P];
    // Even the narrower bank has an exit before the map edge. It remains the same function in the drawing margin.
    const breadth = river.vertical ? w : h;
    const room = b < centre ? centre : breadth - centre;
    const fallWeight = 1 - smoothstep(1, Math.max(3, Math.min(11, room - 5)), shoreDistance);
    const roadDistance = y >= h ? Math.max(0, Math.abs(x - trackX(y) - 0.5) - 2.5) : Infinity;
    for (let s = 0; s < sheets.length; s++) {
      const waterLevel = s * FALL_HEIGHT;
      const base = t.water === 'river' ? datum + (waterLevel - datum) * fallWeight : 0;
      let height = base + Math.min(hills + country, rise);
      height = Math.min(height, homeCap, trackHeight(y) + roadDistance * GRADE);
      if (roadDistance === 0) height = trackHeight(y);
      sheets[s][i] = Math.round(Math.max(0, waterLevel - waterDistance[i], Math.min(MAX_LEVEL + country, height)));
    }
  }
  // Independent lowering can carry a sheet's influence past its sampled taper. Couple the two reaches at the lip,
  // outside the scarp, then settle them again until both the grade and those shared vertices agree. Lowering is monotone
  // and bounded, so this terminates; the water cone prevents a shared vertex from pulling down the upstream shore.
  let settled = false;
  while (!settled) {
    for (const sheet of sheets) gentleVertices(sheet, vw, vh);
    settled = true;
    if (t.water !== 'river') continue;
    for (const f of river.falls) {
      const first = river.level(f - 1) / FALL_HEIGHT, second = river.level(f) / FALL_HEIGHT;
      const high = Math.max(first, second), breadth = river.vertical ? w : h, slice = slices[f + P];
      for (let b = -P; b <= breadth + P; b++) {
        const distance = Math.max(0, slice.vertexLo - b, b - slice.vertexHi);
        const room = b < slice.centre ? slice.centre : breadth - slice.centre;
        if (distance < Math.max(FALL_HEIGHT, Math.min(11, room - 5))) continue;
        const i = river.vertical ? (f + P) * vw + b + P : (b + P) * vw + f + P;
        const height = Math.min(sheets[first][i], sheets[second][i]);
        if (height < high * FALL_HEIGHT - waterDistance[i]) continue;
        if (sheets[first][i] !== height || sheets[second][i] !== height) settled = false;
        sheets[first][i] = height; sheets[second][i] = height;
      }
    }
  }
  const country: Country = { away: new Float32Array(size), height: new Float32Array(size) };
  let highestRiver = 0;
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const i = idx(x, y), a = river.vertical ? y : x, b = river.vertical ? x : y;
    const l = t.water === 'river' ? river.level(a) : 0, sheet = sheets[l / FALL_HEIGHT];
    const v = (y + P) * vw + x + P;
    corner[i * 4] = sheet[v]; corner[i * 4 + 1] = sheet[v + 1];
    corner[i * 4 + 2] = sheet[v + vw + 1]; corner[i * 4 + 3] = sheet[v + vw];
    country.away[i] = beyond(x + 0.5, y + 0.5);
    const bounds = slices[a + P];
    const water = t.water === 'river' ? b >= bounds.lo && b <= bounds.hi
      : basins.some((p) => Math.hypot(x + 0.5 - p.x, (y + 0.5 - p.y) * BASIN_STRETCH) < p.radius);
    if (water) {
      terrain[i] = TERRAIN.water;
      // Water has one surface per tile, including at the lip of a fall. The shore envelope leaves the same datum at the
      // land's shared corners; only the deliberate fall changes sheets.
      corner.fill(l, i * 4, i * 4 + 4);
      if (t.water === 'river') {
        const db = (river.course(a + 0.1) - river.course(a - 0.1)) * 5, n = Math.hypot(db, 1);
        const speed = RIVER_SLOW + (RIVER_FAST - RIVER_SLOW) * noise2(a / 12, 1, seed + 6);
        const along = river.sign * speed / n, across = along * db;
        flow[i * 2] = river.vertical ? across : along; flow[i * 2 + 1] = river.vertical ? along : across;
        highestRiver = Math.max(highestRiver, l);
      }
    }
    if (y >= h && Math.abs(x - trackX(y)) <= 1) track[i] = 1;
  }
  addMesas(sc, land, r);
  const habitat = new Float32Array(size);
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const i = idx(x, y), near = onMap(x, y) ? onMap : (tx: number, ty: number) => tx >= -M && ty >= -M && tx < w + M && ty < h + M;
    const height = centreLevel(land, x + M, y + M); country.height[i] = height;
    let cliff = 0;
    for (let d = 0; d < SIDES.length; d++) {
      const [dx, dy] = SIDES[d];
      if (near(x + dx, y + dy) && !joins(land, x + M, y + M, d)) { cliff = 1; break; }
    }
    habitat[i] = t.relief * (Math.min(1, height / Math.max(1, HILL_HEIGHT * t.relief)) + cliff);
    if (terrain[i] === TERRAIN.water && t.water === 'river') drop[i] = highestRiver - corner[i * 4];
  }
  const cover = coverGuard(sc, land);
  layGrounds(sc, land);
  // Rocks lie mostly on stony ground (the pull is on top of the hills' and cliffs'), and the ground under one stays stony.
  const rocky = habitat.map((v, i) => v + (ground[i] === GROUND.stony ? ROCK_STONY : 0));
  scatter(sc, land, rocky, country.away, t.rock, 3.5, seed + 37, TERRAIN.rock, 0, cover);
  for (let i = 0; i < size; i++) if (terrain[i] === TERRAIN.rock) ground[i] = GROUND.stony;
  scatter(sc, land, habitat, country.away, t.forest, 7, seed + 21, TERRAIN.tree, FOREST_THICKEN, cover);
  fertilise(sc, land);
  return land;
}

/**
 * Lowers a grid of corner heights (`w` × `h` points, row by row) to the highest surface below it whose every tile is gentle:
 * no point more than a level above any of its eight neighbours. Two sweeps of the distance transform suffice, and tiles
 * reading their four corners from the grid then join their neighbours everywhere.
 */
function gentleVertices(v: Int16Array, w: number, h: number) {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (x) v[i] = Math.min(v[i], v[i - 1] + 1);
    if (y) for (let dx = -1; dx <= 1; dx++) if (x + dx >= 0 && x + dx < w) v[i] = Math.min(v[i], v[i - w + dx] + 1);
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    if (x + 1 < w) v[i] = Math.min(v[i], v[i + 1] + 1);
    if (y + 1 < h) for (let dx = -1; dx <= 1; dx++) if (x + dx >= 0 && x + dx < w) v[i] = Math.min(v[i], v[i + w + dx] + 1);
  }
}

function basinSites(sc: Scenario, r: () => number, home: (x: number, y: number) => number): Basin[] {
  const { width: w, height: h, terrain: t } = sc, basins: Basin[] = [];
  if (t.water !== 'lake' && t.water !== 'ponds') return basins;
  const count = t.water === 'lake' ? 1 : 3 + Math.floor(r() * 3);
  for (let k = 0; k < count; k++) {
    const radius = t.water === 'lake' ? 6 + r() * 2 : 2 + r() * 1.3;
    for (let attempt = 0; attempt < BASIN_ATTEMPTS; attempt++) {
      const x = radius + BASIN_BANK + r() * (w - 2 * (radius + BASIN_BANK));
      const y = radius + BASIN_BANK + r() * (h * 0.7 - 2 * (radius + BASIN_BANK));
      if (home(x, y) <= HOME_RADIUS + radius + BASIN_BANK
        || basins.some((p) => Math.hypot(x - p.x, (y - p.y) * BASIN_STRETCH) <= radius + p.radius + BASIN_GAP)) continue;
      basins.push({ x, y, radius }); break;
    }
  }
  return basins;
}

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
  const falls = t.relief < FALL_RELIEF ? [] : t.relief < SECOND_FALL_RELIEF ? [Math.round(span * 0.5)] : [Math.round(span * 0.34), Math.round(span * 0.68)];
  const level = (a: number) => FALL_HEIGHT * (falls.length - falls.filter((f) => sign > 0 ? a >= f : a < f).length);
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

/** The drivable graph uses map indices, so country tiles cannot affect reachability or scatter quotas. */
function landGraph(sc: Scenario, land: Land): number[][] {
  const { width: w, height: h } = sc, { margin: M, width: lw } = land;
  return Array.from({ length: w * h }, (_, i) => {
    const x = i % w, y = Math.floor(i / w), out: number[] = [];
    if (land.terrain[(y + M) * lw + x + M] === TERRAIN.water || !isGentle(land, x + M, y + M)) return out;
    SIDES.forEach(([dx, dy], d) => {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && land.terrain[(ny + M) * lw + nx + M] !== TERRAIN.water
        && isGentle(land, nx + M, ny + M) && joins(land, x + M, y + M, d)) out.push(ny * w + nx);
    });
    return out;
  });
}

// Isolated vertices count too: water contributes the same constant before and after a mesa, while a newly isolated
// land tile must count as a severed route.
function regionCount(graph: number[][]): number {
  const seen = new Uint8Array(graph.length);
  let count = 0;
  for (let i = 0; i < graph.length; i++) {
    if (seen[i]) continue;
    count++; const queue = [i]; seen[i] = 1;
    for (let k = 0; k < queue.length; k++) for (const j of graph[queue[k]]) if (!seen[j]) { seen[j] = 1; queue.push(j); }
  }
  return count;
}

/**
 * Mesas at high relief: a second gentle sheet of ground over a broad, irregular oval, rising gradually onto its top on one
 * flank and standing CLIFF_HEIGHT above the land round it on the other. A site whose rim would cut off land trucks reach
 * is passed over.
 */
function addMesas(sc: Scenario, land: Land, r: () => number) {
  const { width: w, height: h, seed, terrain: t } = sc, { margin: M, width: lw, corner, depot } = land;
  if (t.relief < MESA_RELIEF) return;
  const count = t.relief >= 0.95 ? 2 : 1, before = regionCount(landGraph(sc, land));
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const placed: Basin[] = [];
  for (let k = 0; k < count; k++) for (let attempt = 0; attempt < MESA_ATTEMPTS; attempt++) {
    const rx = MESA_RADIUS * (0.85 + r() * 0.3), ry = rx * (0.8 + r() * 0.3);
    const cx = rx + 2 + r() * (w - 2 * rx - 4), cy = ry + 2 + r() * (h * 0.8 - 2 * ry - 4);
    if (placed.some((p) => Math.hypot(cx - p.x, cy - p.y) < p.radius + rx + 3)) continue;
    const angle = r() * Math.PI * 2, ux = Math.cos(angle), uy = Math.sin(angle);
    const mask: number[] = [];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const radius = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
      if (radius < 1 + 0.08 * Math.sin(x / 3 + y / 5 + seed)) mask.push(y * w + x);
    }
    if (!mask.length || mask.some((i) => {
      const x = i % w, y = Math.floor(i / w);
      return land.terrain[idx(x, y)] === TERRAIN.water || Math.max(Math.abs(x - depot.x - 1), Math.abs(y - depot.y - 1)) <= HOME + 2
        || SIDES.some(([dx, dy]) => land.terrain[idx(x + dx, y + dy)] === TERRAIN.water);
    })) continue;
    const vw = w + 1, vh = h + 1, lifted = new Int16Array(vw * vh);
    for (let y = 0; y <= h; y++) for (let x = 0; x <= w; x++) {
      const tx = Math.min(x, w - 1), ty = Math.min(y, h - 1), c = x === w ? (y === h ? 2 : 1) : y === h ? 3 : 0;
      const base = corner[idx(tx, ty) * 4 + c], along = ((x - cx) * ux + (y - cy) * uy) / rx;
      lifted[y * vw + x] = Math.min(MAX_LEVEL, base + Math.round(CLIFF_HEIGHT * smoothstep(-0.8, 0.45, along)));
    }
    gentleVertices(lifted, vw, vh);
    const old = mask.map((i) => corner.slice(idx(i % w, Math.floor(i / w)) * 4, idx(i % w, Math.floor(i / w)) * 4 + 4));
    mask.forEach((i) => {
      const x = i % w, y = Math.floor(i / w), j = idx(x, y) * 4, v = y * vw + x;
      corner[j] = lifted[v]; corner[j + 1] = lifted[v + 1]; corner[j + 2] = lifted[v + vw + 1]; corner[j + 3] = lifted[v + vw];
    });
    if (regionCount(landGraph(sc, land)) > before) {
      mask.forEach((i, n) => { const j = idx(i % w, Math.floor(i / w)) * 4; for (let c = 0; c < 4; c++) corner[j + c] = old[n][c]; });
      continue;
    }
    placed.push({ x: cx, y: cy, radius: rx }); break;
  }
}

/**
 * Whether a tree or rock may take a map tile (by map index): only where the grass trucks drive on stays connected round it,
 * so the woods and rock grow in dense stands without ever closing a route, and need no visible grid of corridors.
 */
function coverGuard(sc: Scenario, land: Land): (i: number) => boolean {
  const graph = landGraph(sc, land), { width: w } = sc, { margin: M, width: lw, terrain } = land;
  const landIndex = (i: number) => (Math.floor(i / w) + M) * lw + i % w + M;
  const seen = new Int32Array(graph.length), queue = new Int32Array(graph.length);
  let stamp = 0;
  return (i: number) => {
    const neighbours = graph[i].filter((j) => terrain[landIndex(j)] === TERRAIN.grass);
    if (neighbours.length <= 1) return true;
    stamp++; seen[i] = stamp; seen[neighbours[0]] = stamp;
    let head = 0, tail = 1, remaining = neighbours.length - 1;
    queue[0] = neighbours[0];
    while (head < tail) for (const j of graph[queue[head++]]) {
      if (seen[j] === stamp || terrain[landIndex(j)] !== TERRAIN.grass) continue;
      seen[j] = stamp; queue[tail++] = j;
      if (neighbours.includes(j) && --remaining === 0) return true;
    }
    return false;
  };
}

function scatter(sc: Scenario, land: Land, habitat: Float32Array, away: Float32Array, share: number, scale: number, seed: number, kind: TerrainKind, thicken: number, cover: (i: number) => boolean) {
  if (share <= 0) return;
  const { width: w, height: h } = sc, { margin: M, width: lw, terrain, track, depot } = land;
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const eligible = (x: number, y: number) => terrain[idx(x, y)] === TERRAIN.grass && !track[idx(x, y)]
    && Math.max(Math.abs(x - depot.x - 1), Math.abs(y - depot.y - 1)) > CLEARING;
  const noise = (x: number, y: number) => noise2(x / scale, y / scale, seed) * 0.85 + noise2(x * 1.7, y * 1.7, seed + 3) * 0.15;
  const value = (x: number, y: number) => noise(x, y) + habitat[idx(x, y)] * (kind === TERRAIN.rock ? ROCK_BIAS : FOREST_BIAS);
  const candidates: { i: number; value: number }[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (eligible(x, y)) candidates.push({ i: y * w + x, value: value(x, y) });
  candidates.sort((a, b) => b.value - a.value || a.i - b.i);
  const target = Math.round(w * h * share), cut = candidates[Math.min(candidates.length - 1, target)]?.value ?? Infinity;
  let placed = 0;
  for (const c of candidates) {
    if (placed >= target) break;
    if (!cover(c.i)) continue;
    terrain[idx(c.i % w, Math.floor(c.i / w))] = kind; placed++;
  }
  // The country uses coarse noise cells and the map's quantile, with woods thickening into the distance.
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    if (onMap(x, y) || !eligible(x, y)) continue;
    const i = idx(x, y), v = noise(Math.floor(x / CELL) * CELL, Math.floor(y / CELL) * CELL)
      + habitat[i] * (kind === TERRAIN.rock ? ROCK_BIAS : FOREST_BIAS);
    if (v + thicken * away[i] >= cut) terrain[i] = kind;
  }
}

/** Lays the ground of the land (ground.ts); rocks, placed afterwards, make their tiles stony. */
function layGrounds(sc: Scenario, land: Land) {
  const { margin: M, width, height, terrain, corner, ground } = land;
  const kinds = layGround({ kind: sc.terrain.water, mix: sc.terrain.ground, seed: sc.seed, width, height, corner, water: terrain.map((t) => (t === TERRAIN.water ? 1 : 0)), origin: { x: -M, y: -M } });
  for (let i = 0; i < kinds.length; i++) ground[i] = kinds[i];
}

/** Fertility from the ground: its kind's range, placed in it by smooth local noise (the country in coarse cells, as the woods thicken). */
function fertilise(sc: Scenario, land: Land) {
  const { width: w, height: h, seed } = sc, { margin: M, width: lw, fertility, ground } = land;
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const map = x >= 0 && y >= 0 && x < w && y < h, i = (y + M) * lw + x + M;
    // The noise's own range is narrow (its octaves average out), so it is stretched to use the whole of the kind's range.
    const n = map ? fbm2(x / 9, y / 9, seed + 51, 3) : fbm2(Math.floor(x / CELL) * CELL / 9, Math.floor(y / CELL) * CELL / 9, seed + 51, 3);
    fertility[i] = fertilityOf(ground[i], (n - 0.25) * 2);
  }
}
