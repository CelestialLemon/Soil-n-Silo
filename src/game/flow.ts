// Gravity irrigation: how water runs along the dug rills. Source-limited and never rising:
//
// - Water enters a rill only where its centreline touches the brook or pond (a contact), carrying that water's surface as
//   its head. Only samples whose ground lies under that surface stand full whatever their cut; a sample on a bank above it
//   must clear its bed and stay inside its banks like any other, so a rill dug along a high bank stays dry. From there it
//   marches along the centreline (and across explicit junctions where one rill's end meets, or its line crosses,
//   another's), losing FRICTION metres per metre: it can never stand higher than where it came from.
// - At each step the carried level is held below the rill's natural bank crest (it stays inside the cut), and it flows
//   only while it clears the cut's bed by MIN_WATER_DEPTH. Where the ground climbs to a sill the level can't clear, the
//   rill runs dry from there on.
// - Flow follows centrelines only, never the grid's cells, so two rills dug side by side never leak into each other.
import { cellIx, cellIz, cellX, cellZ, DRY, type Grid, isWet, sampleHeight, vertexX, vertexZ } from './grid.ts';
import { CHANNEL_REACH, channelCut, inCore, protectedCores, RILL_HALF } from './earth.ts';
import { catmullRom, forCellsNear, forVerticesNear, pathLength, type Point2, segmentsCross } from './geom.ts';
import type { Channel, FlowSample, GameState } from './state.ts';
import { addCell, type Rect } from './grid.ts';

/** The spacing of a rill's centreline samples, m. */
export const CHANNEL_SPACING = 0.5;
/** How much the water's level drops per metre it runs along a rill. */
export const FRICTION = 0.005;
/** How deep the water must stand over the bed to flow, m. */
export const MIN_WATER_DEPTH = 0.04;
/** How far below the bank crest the water stays, m. */
export const FREEBOARD = 0.04;
/** How close a rill's end must come to another rill's centreline to join it, m. */
export const JUNCTION = 0.75;
/** How close a rill's centreline must come to the brook or pond to draw from it, m. */
export const CONTACT = 1;
/** How fast water runs in a rill, m/s (for the picture's flow). */
export const RILL_SPEED = 0.35;

/** A rill's smooth centreline from the stroke the player drew. */
export const channelPath = (points: readonly Point2[]) => catmullRom(points, CHANNEL_SPACING);

interface Node { ch: number; i: number; x: number; z: number; bed: number; bank: number; source: number }

/** The natural water surface a point draws from (the highest within CONTACT), or DRY. */
function contactLevel(g: Grid, x: number, z: number): number {
  let best = DRY;
  const ix = cellIx(g, x), iz = cellIz(g, z), reach = Math.ceil(CONTACT / g.cell);
  for (let dz = -reach; dz <= reach; dz++) for (let dx = -reach; dx <= reach; dx++) {
    const cx = ix + dx, cz = iz + dz;
    if (cx < 0 || cz < 0 || cx >= g.nx || cz >= g.nz) continue;
    const level = g.baseWaterLevel[cz * g.nx + cx];
    if (!isWet(level)) continue;
    // Within the water cell itself, or within CONTACT of its edge.
    const ex = Math.max(Math.abs(x - cellX(g, cx)) - g.cell / 2, 0), ez = Math.max(Math.abs(z - cellZ(g, cz)) - g.cell / 2, 0);
    if (Math.hypot(ex, ez) <= CONTACT && level > best) best = level;
  }
  return best;
}

/**
 * Solves the water along every rill at once. `bedAt(ch, x, z)` reads the cut bed under a sample; the bank is the land
 * before any rill was cut (`landHeight`). Returns each rill's samples.
 */
function solve(g: Grid, paths: readonly (readonly Point2[])[], bedAt: (ch: number, x: number, z: number) => number): FlowSample[][] {
  const nodes: Node[][] = paths.map((path, ch) => path.map((p, i) => ({
    ch, i, x: p.x, z: p.z, bed: bedAt(ch, p.x, p.z), bank: sampleHeight(g, g.landHeight, p.x, p.z), source: contactLevel(g, p.x, p.z),
  })));
  // Edges: along each centreline, and junctions between rills.
  const links = new Map<Node, { to: Node; d: number }[]>();
  const link = (a: Node, b: Node, d: number) => {
    let la = links.get(a); if (!la) links.set(a, (la = []));
    let lb = links.get(b); if (!lb) links.set(b, (lb = []));
    la.push({ to: b, d }); lb.push({ to: a, d });
  };
  for (const line of nodes) for (let i = 1; i < line.length; i++) link(line[i - 1], line[i], Math.hypot(line[i].x - line[i - 1].x, line[i].z - line[i - 1].z));
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
    for (const { ia, ib, d } of junctionPairs(paths[a], paths[b])) link(nodes[a][ia], nodes[b][ib], d);
  }

  // Widest-path search: the highest head that can reach each sample, settled highest first.
  const head = new Map<Node, number>();
  const heap: { n: Node; h: number }[] = [];
  const push = (n: Node, h: number) => {
    if (h <= (head.get(n) ?? DRY)) return;
    head.set(n, h);
    heap.push({ n, h });
    let k = heap.length - 1;
    while (k > 0) { const p = (k - 1) >> 1; if (heap[p].h >= heap[k].h) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length > 0 && last) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1, r = l + 1;
        let m = k;
        if (l < heap.length && heap[l].h > heap[m].h) m = l;
        if (r < heap.length && heap[r].h > heap[m].h) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  for (const line of nodes) for (const n of line) if (isWet(n.source)) push(n, n.source);

  const out = new Map<Node, { level: number; wet: boolean }>();
  while (heap.length > 0) {
    const { n, h } = pop();
    if (out.has(n) || h < (head.get(n) ?? DRY)) continue;
    // Where the ground lies under the surface of the brook or pond it touches, the rill stands in that water, at its
    // level. Everywhere else, even within reach of the water on a bank above it, the level stays inside the cut and must
    // clear the bed.
    const inWater = isWet(n.source) && n.bank <= n.source;
    const level = inWater ? Math.min(h, n.source) : Math.min(h, n.bank - FREEBOARD);
    const wet = inWater || level > n.bed + MIN_WATER_DEPTH;
    out.set(n, { level, wet });
    if (!wet) continue;
    for (const { to, d } of links.get(n) ?? []) if (!out.has(to)) push(to, level - FRICTION * d);
  }

  return nodes.map((line) => line.map((n) => {
    const o = out.get(n);
    const wet = o?.wet ?? false;
    return { x: n.x, z: n.z, wet, waterLevel: wet && o ? o.level : DRY, bedHeight: n.bed, bankHeight: n.bank };
  }));
}

/** Where two rills join: sample `ia` of one links to sample `ib` of the other, `d` apart. */
export interface JunctionPair { ia: number; ib: number; d: number }

/** A rill's samples in runs of RUN, each with its box: what the junction search tests first, run against run. */
interface Run { from: number; to: number; minX: number; minZ: number; maxX: number; maxZ: number }
const RUN = 16;
const runsOf = new WeakMap<readonly Point2[], Run[]>();
function runs(path: readonly Point2[]): Run[] {
  let out = runsOf.get(path);
  if (out) return out;
  out = [];
  // Runs share their end samples, so every segment (k - 1, k) lies wholly within the run holding k.
  for (let from = 0; path.length > 0; from += RUN) {
    const to = Math.min(path.length - 1, from + RUN);
    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
    for (let k = from; k <= to; k++) { const p = path[k]; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
    out.push({ from, to, minX, minZ, maxX, maxZ });
    if (to >= path.length - 1) break;
  }
  runsOf.set(path, out);
  return out;
}
const near = (r: Run, x: number, z: number, m: number) => x >= r.minX - m && x <= r.maxX + m && z >= r.minZ - m && z <= r.maxZ + m;
const overlap = (r: Run, o: Run, m: number) => r.minX - m <= o.maxX && o.minX - m <= r.maxX && r.minZ - m <= o.maxZ && o.minZ - m <= r.maxZ;

/** The junctions found between two dug rills, kept while both stand (a rill's path never changes once dug). */
const pairsOf = new WeakMap<readonly Point2[], WeakMap<readonly Point2[], JunctionPair[]>>();

/**
 * Where two rills join: each end of one that comes within JUNCTION of the other's centreline links to its nearest sample
 * there, and where their centrelines cross, the samples past the crossing link. Only runs whose boxes come within reach
 * are searched, and the pairs between two rills are remembered, so a solve over many rills stays quick.
 */
export function junctionPairs(a: readonly Point2[], b: readonly Point2[]): JunctionPair[] {
  let byB = pairsOf.get(a);
  const had = byB?.get(b);
  if (had) return had;
  const out = findJunctions(a, b);
  if (!byB) pairsOf.set(a, (byB = new WeakMap()));
  byB.set(b, out);
  return out;
}

function findJunctions(a: readonly Point2[], b: readonly Point2[]): JunctionPair[] {
  const out: JunctionPair[] = [];
  if (a.length === 0 || b.length === 0) return out;
  const ra = runs(a), rb = runs(b);
  // The sample of a line nearest a point, if one lies within JUNCTION (the first of equals, as a full scan finds it).
  const nearest = (p: Point2, line: readonly Point2[], lineRuns: Run[]) => {
    let best = -1, bd = Infinity;
    for (const r of lineRuns) {
      if (!near(r, p.x, p.z, JUNCTION)) continue;
      for (let k = r.from; k <= r.to; k++) { const d = Math.hypot(p.x - line[k].x, p.z - line[k].z); if (d < bd) { bd = d; best = k; } }
    }
    return bd <= JUNCTION ? { k: best, d: bd } : undefined;
  };
  for (const e of [0, a.length - 1]) { const n = nearest(a[e], b, rb); if (n) out.push({ ia: e, ib: n.k, d: n.d }); }
  for (const e of [0, b.length - 1]) { const n = nearest(b[e], a, ra); if (n) out.push({ ia: n.k, ib: e, d: n.d }); }
  const crossings: JunctionPair[] = [];
  for (const r of ra) for (const o of rb) {
    if (!overlap(r, o, 0)) continue;
    for (let i = r.from + 1; i <= r.to; i++) for (let j = o.from + 1; j <= o.to; j++) {
      if (segmentsCross(a[i - 1], a[i], b[j - 1], b[j])) crossings.push({ ia: i, ib: j, d: Math.hypot(a[i].x - b[j].x, a[i].z - b[j].z) });
    }
  }
  crossings.sort((p, q) => p.ia - q.ia || p.ib - q.ib);
  return out.concat(crossings);
}

/** The water along every rill as the land stands now. */
function solveLive(s: GameState): FlowSample[][] {
  const g = s.grid;
  return solve(g, s.channels.map((c) => c.path), (_ch, x, z) => sampleHeight(g, g.height, x, z));
}

/**
 * Re-solves the water in every rill and writes the live water layer (the brook and pond, then the flowing rills). Returns
 * the cells whose water changed.
 */
export function refreshWater(s: GameState): Rect | undefined {
  const g = s.grid;
  const flows = solveLive(s);
  s.channels.forEach((c, k) => { c.flow = flows[k]; });
  const level = Float32Array.from(g.baseWaterLevel), fx = Float32Array.from(g.baseFlowX), fz = Float32Array.from(g.baseFlowZ);
  for (const c of s.channels) {
    for (let i = 1; i < c.flow.length; i++) {
      const a = c.flow[i - 1], b = c.flow[i];
      if (!a.wet || !b.wet) continue;
      const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
      // Water runs from the higher level to the lower.
      const sign = a.waterLevel >= b.waterLevel ? 1 : -1;
      const wl = (a.waterLevel + b.waterLevel) / 2;
      forCellsNear(g, [a, b], RILL_HALF, (ix, iz) => {
        const k = iz * g.nx + ix;
        if (isWet(g.baseWaterLevel[k])) return;
        if (wl > level[k]) { level[k] = wl; fx[k] = (sign * (b.x - a.x) / len) * RILL_SPEED; fz[k] = (sign * (b.z - a.z) / len) * RILL_SPEED; }
      });
    }
  }
  let dirty: Rect | undefined;
  for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
    const k = iz * g.nx + ix;
    if (level[k] !== g.waterLevel[k] || fx[k] !== g.flowX[k] || fz[k] !== g.flowZ[k]) dirty = addCell(dirty, ix, iz);
  }
  g.waterLevel.set(level); g.flowX.set(fx); g.flowZ.set(fz);
  return dirty;
}

export interface ChannelPreview {
  samples: FlowSample[];
  /** Whether any of it flows. */
  connected: boolean;
  wetLength: number;
  dryLength: number;
  /** Where the water stops: the first dry sample after the wet reach (absent if it all flows, or none of it). */
  sillPoint?: Point2;
}

/**
 * What water would do in a rill dug along `points`, without digging it: the same solve the dug rill gets (with its cut
 * and its junctions with the rills already dug), read-only and fast enough to run on every drag.
 */
export function previewChannelFlow(s: GameState, points: readonly Point2[]): ChannelPreview {
  const g = s.grid, path = channelPath(points);
  if (path.length === 0) return { samples: [], connected: false, wetLength: 0, dryLength: 0 };
  const view = heightsWithRill(s, path);
  const mine = s.channels.length;
  const flows = solve(g, [...s.channels.map((c) => c.path), path], (_ch, x, z) => sampleHeight(g, view, x, z));
  return summarize(flows[mine]);
}

/**
 * The live heights with a new rill cut along `path`, exactly as recomposeEarth would cut it, without digging it (the live
 * heights themselves if it would cut nothing).
 */
export function heightsWithRill(s: GameState, path: readonly Point2[]): Float32Array {
  const g = s.grid, W = g.nx + 1, cores = protectedCores(s), cut = new Map<number, number>();
  forVerticesNear(g, path, CHANNEL_REACH, (ix, iz, d) => {
    if (inCore(cores, vertexX(g, ix), vertexZ(g, iz))) return;
    const i = iz * W + ix, h = Math.fround(g.landHeight[i] - channelCut(d));
    if (h < g.height[i]) cut.set(i, h);
  });
  if (cut.size === 0) return g.height;
  const h = Float32Array.from(g.height);
  for (const [i, v] of cut) h[i] = v;
  return h;
}

/** A rill's wet and dry reach. */
export function summarize(samples: FlowSample[]): ChannelPreview {
  let wetLength = 0, sillPoint: Point2 | undefined, seenWet = false;
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    if (p.wet) seenWet = true;
    else if (seenWet && !sillPoint) sillPoint = { x: p.x, z: p.z };
    if (i > 0 && p.wet && samples[i - 1].wet) wetLength += Math.hypot(p.x - samples[i - 1].x, p.z - samples[i - 1].z);
  }
  const total = pathLength(samples);
  return { samples, connected: seenWet, wetLength, dryLength: Math.max(0, total - wetLength), sillPoint };
}

/** The wet and dry reach of a dug rill. */
export const channelSummary = (c: Channel) => summarize(c.flow);
