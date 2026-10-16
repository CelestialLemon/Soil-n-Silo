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
  const { width, height, terrain, fertility, level, ramp, depot } = generateLand(sc, 0);
  return { width, height, terrain, fertility, level, ramp, depot };
}

/** The country settles to this level for its outermost RIM tiles, where the distant woods start. */
export const RIM_LEVEL = 6;
const RIM = 10, RIM_BLEND = 12, CELL = 4, HOME = 6;
const LONG_CLIFF = 12, RAMP_GAP = 3, RUGGED = 0.8;
const HILL_REACH = 24, HILL_BASE = 2, HILL_HEIGHT = 7, COUNTRY_TOP = 10;
const VALLEY_INNER = 1.5, VALLEY_OUTER = 8, COUNTRY_RAMP_CHANCE = 0.04;
const TRACK_BEND = 5, TRACK_BEND_START = 6, TRACK_BEND_END = 26;
const ROCK_BIAS = 0.2, FOREST_BIAS = 0.08, FOREST_THICKEN = 0.012;
const SOIL_HEIGHT = 9, SOIL_WATER = 10, SOIL_REACH = 2;
const RIVER_FAST = 1.1, RIVER_SLOW = 0.6;
const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

interface Cell { x: number; y: number; w: number; h: number; level: number; water: boolean }

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
  const distanceHome = (x: number, y: number) => Math.max(Math.abs(x - depot.x - 1), Math.abs(y - depot.y - 1));
  const top = Math.min(MAX_LEVEL, Math.ceil(t.relief * MAX_LEVEL));

  // Broad cells give every terrace room for buildings, including at the map's edges. Their height follows a valley or a
  // ridge, rather than independent tile noise. Water uses the same cells so it cannot leave one-tile strips of bank.
  const nx = Math.max(1, Math.floor(w / CELL)), ny = Math.max(1, Math.floor(h / CELL));
  const xs = Array.from({ length: nx + 1 }, (_, x) => Math.floor(x * w / nx));
  const ys = Array.from({ length: ny + 1 }, (_, y) => Math.floor(y * h / ny));
  const cells: Cell[] = [];
  const eachNeighbour = (i: number, visit: (j: number) => void) => {
    const x = i % nx, y = Math.floor(i / nx);
    if (x > 0) visit(i - 1); if (x + 1 < nx) visit(i + 1);
    if (y > 0) visit(i - nx); if (y + 1 < ny) visit(i + nx);
  };
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const ridge = 1 - (y + 0.5) / ny + 0.12 * Math.sin(x * 0.55 + seed);
    cells.push({ x: xs[x], y: ys[y], w: xs[x + 1] - xs[x], h: ys[y + 1] - ys[y], level: Math.max(0, Math.min(top, Math.round(top * ridge))), water: false });
  }
  const home = (c: Cell) => c.x <= depot.x + 1 + HOME && c.x + c.w > depot.x + 1 - HOME && c.y <= depot.y + 1 + HOME && c.y + c.h > depot.y + 1 - HOME;
  const homeCells = cells.map((c, i) => home(c) ? i : -1).filter((i) => i >= 0);
  const homeDistance = (i: number) => Math.min(...homeCells.map((j) => Math.abs(i % nx - j % nx) + Math.abs(Math.floor(i / nx) - Math.floor(j / nx))));
  const clear = (c: Cell) => c.x <= depot.x + 1 + CLEARING && c.x + c.w > depot.x + 1 - CLEARING
    && c.y <= depot.y + 1 + CLEARING && c.y + c.h > depot.y + 1 - CLEARING;

  const vertical = r() < 0.5, sign = vertical || hash2(seed, 1, 77) < 0.5 ? 1 : -1;
  const length = vertical ? ny : nx, breadth = vertical ? nx : ny;
  const phase = r() * 6.28, period = 2 + r(), amp = 0.65 + r() * 0.3;
  const centre = vertical ? (depot.x + 1 < w / 2 ? nx - 3 : 2) : Math.max(1, Math.floor(ny * 0.3));
  const course = (a: number) => Math.max(0, Math.min(breadth - 1, centre + Math.sin(a / period + phase) * amp));
  const falls = top === 0 ? [] : top === 1 ? [Math.round(length * 0.5)] : [Math.round(length * 0.34), Math.round(length * 0.68)];
  const riverLevel = (a: number) => falls.length - falls.filter((f) => sign > 0 ? a >= f : a < f).length;
  const riverCell = (a: number, b: number) => vertical ? a * nx + b : b * nx + a;
  const basins: number[][] = [];
  if (t.water === 'river') {
    for (let a = 0; a < length; a++) {
      const b = Math.round(course(a)), prev = Math.round(course(a - 1));
      for (let c = Math.min(b, prev); c <= Math.max(b, prev); c++) cells[riverCell(a, c)].water = true;
    }
    const distance = new Array<number>(cells.length).fill(1e6), queue: number[] = [];
    cells.forEach((c, i) => { if (c.water) { distance[i] = 0; queue.push(i); } });
    for (let q = 0; q < queue.length; q++) eachNeighbour(queue[q], (j) => {
      if (distance[j] > distance[queue[q]] + 1) { distance[j] = distance[queue[q]] + 1; queue.push(j); }
    });
    cells.forEach((c, i) => {
      const a = vertical ? Math.floor(i / nx) : i % nx;
      c.level = Math.min(top, riverLevel(a) + Math.floor(Math.max(0, distance[i] - (t.relief >= RUGGED ? 1 : 0)) / (t.relief >= RUGGED ? 1 : 2)));
    });
  } else if (t.water !== 'none') {
    const n = t.water === 'lake' ? 1 : 3 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const cx = 1 + r() * (nx - 2), cy = 1 + r() * (ny * 0.65 - 1);
      const rad = t.water === 'lake' ? 1.6 + r() * 0.4 : 0.55 + r() * 0.35;
      let nearest = -1, distance = Infinity, filled = false;
      cells.forEach((c, i) => {
        if (clear(c)) return;
        const d = Math.hypot(i % nx - cx, (Math.floor(i / nx) - cy) * 1.15);
        if (d < distance) { nearest = i; distance = d; }
        if (d < rad) { c.water = true; filled = true; }
      });
      if (!filled && nearest >= 0) cells[nearest].water = true;
    }
    const seen = new Set<number>();
    cells.forEach((c, i) => {
      if (!c.water || seen.has(i)) return;
      const body = [i]; seen.add(i);
      for (let q = 0; q < body.length; q++) eachNeighbour(body[q], (j) => { if (cells[j].water && !seen.has(j)) { seen.add(j); body.push(j); } });
      basins.push(body);
      const l = Math.max(0, Math.min(...body.map((j) => Math.min(cells[j].level, homeDistance(j) - 1))));
      for (const j of body) { cells[j].level = l; eachNeighbour(j, (k) => { if (!cells[k].water) cells[k].level = l; }); }
    });
  }

  // Lower the envelope to one step per cell, making a generous home terrace. Match banks to their water before
  // relaxing the rest of the land.
  cells.forEach((c, i) => {
    if (c.water) eachNeighbour(i, (j) => { if (!cells[j].water) cells[j].level = Math.max(cells[j].level, c.level); });
    if (home(c)) c.level = 0;
  });
  const queue = cells.map((_, i) => i);
  const relax = () => {
    for (let q = 0; q < queue.length; q++) eachNeighbour(queue[q], (j) => {
      const limit = cells[queue[q]].level + 1;
      if (cells[j].level > limit) { cells[j].level = limit; queue.push(j); }
    });
    queue.length = 0;
  };
  relax();
  // Nearby basins can share a bank. Lower their surfaces together until every body and its banks fit the same envelope.
  let changed = true;
  while (changed && basins.length) {
    changed = false;
    for (const body of basins) {
      let l = Math.min(...body.map((i) => cells[i].level));
      for (const i of body) eachNeighbour(i, (j) => { l = Math.min(l, cells[j].level); });
      for (const i of body) {
        const lower = (j: number) => { if (cells[j].level > l) { cells[j].level = l; queue.push(j); changed = true; } };
        lower(i); eachNeighbour(i, lower);
      }
    }
    relax();
  }
  for (const c of cells) for (let y = c.y; y < c.y + c.h; y++) for (let x = c.x; x < c.x + c.w; x++) {
    const i = idx(x, y); level[i] = c.level;
    if (c.water) terrain[i] = TERRAIN.water;
  }

  // Flat regions are joined by a small number of ramps. A candidate must leave every flat land tile in a 2 × 2 square,
  // and have flat land at both ends. Long shared boundaries get a second route, separated from the first.
  const parent = cells.map((_, i) => i);
  const root = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const union = (a: number, b: number) => { parent[root(a)] = root(b); };
  cells.forEach((c, i) => { if (!c.water) eachNeighbour(i, (j) => { if (!cells[j].water && c.level === cells[j].level) union(i, j); }); });
  interface Boundary { low: number; high: number; dir: number; length: number; key: string }
  const boundaries: Boundary[] = [];
  cells.forEach((c, i) => {
    if (c.water) return;
    eachNeighbour(i, (j) => {
      if (cells[j].water || cells[j].level !== c.level + 1) return;
      const dir = j === i - nx ? 0 : j === i + 1 ? 1 : j === i + nx ? 2 : 3;
      boundaries.push({ low: i, high: j, dir, length: dir % 2 ? c.h : c.w, key: `${root(i)}:${root(j)}` });
    });
  });
  const lengths = new Map<string, number>(), runs = new Map<string, number>(), placed: { x: number; y: number }[] = [];
  for (const b of boundaries) lengths.set(b.key, (lengths.get(b.key) ?? 0) + b.length);
  boundaries.sort((a, b) => hash2(a.low, a.high, seed + 81) - hash2(b.low, b.high, seed + 81));
  const flatSquare = (x: number, y: number) => {
    const l = level[idx(x, y)];
    for (let oy = -1; oy <= 0; oy++) for (let ox = -1; ox <= 0; ox++) {
      let ok = true;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const tx = x + ox + dx, ty = y + oy + dy, i = idx(tx, ty);
        if (!onMap(tx, ty) || terrain[i] === TERRAIN.water || level[i] !== l || ramp[i] !== FLAT) ok = false;
      }
      if (ok) return true;
    }
    return false;
  };
  const place = (b: Boundary, space = RAMP_GAP) => {
    const c = cells[b.low], [dx, dy] = SIDES[b.dir];
    for (const n of (space === 1 ? [1, 2, 3] : [3, 2, 1])) for (const start of [...new Set([0, b.length - n, ...Array.from({ length: b.length - n + 1 }, (_, k) => k)])]) {
      const tiles: { x: number; y: number }[] = [];
      for (let k = start; k < start + n; k++) tiles.push({ x: b.dir % 2 ? (b.dir === 1 ? c.x + c.w - 1 : c.x) : c.x + k,
        y: b.dir % 2 ? c.y + k : (b.dir === 2 ? c.y + c.h - 1 : c.y) });
      if (tiles.some(({ x, y }) => distanceHome(x, y) <= 5 || placed.some((p) => Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) < space
          || (Math.abs(p.x - x) + Math.abs(p.y - y) === 1 && (ramp[idx(p.x, p.y)] % 2 ? p.y === y : p.x === x))
          || (ramp[idx(p.x, p.y)] === b.dir && level[idx(p.x, p.y)] === c.level
            && (b.dir % 2 ? p.x === x && Math.abs(p.y - y) <= 1 : p.y === y && Math.abs(p.x - x) <= 1)))
        || [0, -1, 1].some((step) => { const i = idx(x + dx * step, y + dy * step); return terrain[i] === TERRAIN.water || ramp[i] !== FLAT || level[i] !== c.level + (step === 1 ? 1 : 0); }))) continue;
      for (const { x, y } of tiles) ramp[idx(x, y)] = b.dir;
      let ok = true;
      const flat = (x: number, y: number) => ramp[idx(x, y)] === FLAT;
      const visited = new Set<number>(), remaining: number[] = [];
      for (let y = c.y; y < c.y + c.h; y++) for (let x = c.x; x < c.x + c.w; x++) if (flat(x, y)) remaining.push(idx(x, y));
      const connected = remaining.slice(0, 1);
      if (connected.length) visited.add(connected[0]);
      for (let k = 0; k < connected.length; k++) {
        const x = connected[k] % lw - M, y = Math.floor(connected[k] / lw) - M;
        for (const [dx, dy] of SIDES) if (x + dx >= c.x && x + dx < c.x + c.w && y + dy >= c.y && y + dy < c.y + c.h) {
          const i = idx(x + dx, y + dy);
          if (ramp[i] === FLAT && !visited.has(i)) { visited.add(i); connected.push(i); }
        }
      }
      if (visited.size !== remaining.length) ok = false;
      eachNeighbour(b.low, (j) => {
        const other = cells[j];
        if (other.water || other.level !== c.level) return;
        let open = false;
        if (other.x !== c.x) {
          const x = other.x < c.x ? c.x : c.x + c.w - 1, dx = other.x < c.x ? -1 : 1;
          for (let y = c.y; y < c.y + c.h; y++) if (flat(x, y) && flat(x + dx, y)) open = true;
        } else {
          const y = other.y < c.y ? c.y : c.y + c.h - 1, dy = other.y < c.y ? -1 : 1;
          for (let x = c.x; x < c.x + c.w; x++) if (flat(x, y) && flat(x, y + dy)) open = true;
        }
        if (!open) ok = false;
      });
      for (const { x, y } of tiles) for (let ty = y - 1; ty <= y + 1; ty++) for (let tx = x - 1; tx <= x + 1; tx++) {
        if (onMap(tx, ty) && terrain[idx(tx, ty)] !== TERRAIN.water && ramp[idx(tx, ty)] === FLAT && !flatSquare(tx, ty)) ok = false;
      }
      if (ok) { placed.push(...tiles); runs.set(b.key, (runs.get(b.key) ?? 0) + 1); union(b.low, b.high); return true; }
      for (const { x, y } of tiles) ramp[idx(x, y)] = FLAT;
    }
    return false;
  };
  for (const b of boundaries) if (root(b.low) !== root(b.high)) place(b);
  for (const b of boundaries) if (root(b.low) !== root(b.high)) place(b, 1);
  for (const b of boundaries) if ((lengths.get(b.key) ?? 0) > LONG_CLIFF && (runs.get(b.key) ?? 0) < 2) { if (!place(b)) place(b, 1); }

  const country = countryside(sc, land, xs, ys, course, riverLevel, vertical, sign);

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

function countryside(sc: Scenario, land: Land, xs: number[], ys: number[], course: (a: number) => number, riverLevel: (a: number) => number, vertical: boolean, sign: number) {
  const { width: w, height: h, seed, terrain: t } = sc;
  const { margin: M, width: lw, height: lh, terrain, level, ramp, depot, track, flow, drop } = land, size = lw * lh;
  const nx = xs.length - 1, ny = ys.length - 1;
  const idx = (x: number, y: number) => (y + M) * lw + x + M;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const inside = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
  const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - w + 1), Math.max(0, -y, y - h + 1));
  // The country continues the map's cells, opening into valleys by the river and the winding track. The track rises on
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
  const cellAt = (v: number, span: number, n: number) => v < 0 ? Math.floor(v / CELL) : v >= span ? n + Math.floor((v - span) / CELL) : Math.ceil((v + 1) * n / span) - 1;
  const away = new Float32Array(size), gx = Math.floor(-M / CELL), gy = Math.floor(-M / CELL);
  const gw = Math.floor((w + M - 1) / CELL) - gx + 1, gh = Math.floor((h + M - 1) / CELL) - gy + 1;
  const hillNoise = new Float32Array(gw * gh), soilNoise = new Float32Array(gw * gh);
  if (M) for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    hillNoise[y * gw + x] = noise2((x + gx) / 3, (y + gy) / 3, seed + 71);
    soilNoise[y * gw + x] = fbm2((x + gx) * CELL / 9, (y + gy) * CELL / 9, seed + 51, 3);
  }
  const riverSpan = vertical ? h : w, riverN = vertical ? ny : nx, cross = vertical ? xs : ys;
  const river = Array.from({ length: riverSpan + M * 2 }, (_, i) => {
    const a = cellAt(i - M, riverSpan, riverN), b = Math.round(course(a)), prev = Math.round(course(a - 1));
    const along = (i - M) / (riverSpan / riverN), db = (course(along + 0.1) - course(along - 0.1)) * 5, n = Math.hypot(db, 1);
    const speed = RIVER_SLOW + (RIVER_FAST - RIVER_SLOW) * noise2(along / 3, 1, seed + 6);
    return { lo: cross[Math.min(b, prev)], hi: cross[Math.max(b, prev) + 1] - 1, level: riverLevel(a), along: sign * speed / n, across: sign * speed * db / n };
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
