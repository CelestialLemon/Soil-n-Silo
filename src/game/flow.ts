// Gravity irrigation: how water runs along the dug rills. Source-limited and never rising:
//
// - Water enters a rill only where its centreline touches the brook or pond (a contact), carrying that water's surface as
//   its head. From there it marches along the centreline (and across explicit junctions where one rill's end meets, or its
//   line crosses, another's), losing FRICTION metres per metre: it can never stand higher than where it came from.
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
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) junctions(nodes[a], nodes[b], link);

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
    // In the brook or pond the rill stands in its water; elsewhere the level stays inside the cut and must clear the bed.
    const inWater = isWet(n.source) && h <= n.source;
    const level = inWater ? h : Math.min(h, n.bank - FREEBOARD);
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

/** Links two rills where one's end comes within JUNCTION of the other's centreline, or their centrelines cross. */
function junctions(a: Node[], b: Node[], link: (a: Node, b: Node, d: number) => void) {
  if (a.length === 0 || b.length === 0) return;
  const nearest = (p: Node, line: Node[]) => {
    let best = line[0], bd = Infinity;
    for (const q of line) { const d = Math.hypot(p.x - q.x, p.z - q.z); if (d < bd) { bd = d; best = q; } }
    return { q: best, d: bd };
  };
  for (const [ends, other] of [[a, b], [b, a]] as const) for (const e of [ends[0], ends[ends.length - 1]]) {
    const { q, d } = nearest(e, other);
    if (d <= JUNCTION) link(e, q, d);
  }
  for (let i = 1; i < a.length; i++) for (let j = 1; j < b.length; j++) {
    const x = segmentsCross(a[i - 1], a[i], b[j - 1], b[j]);
    if (x) link(a[i], b[j], Math.hypot(a[i].x - b[j].x, a[i].z - b[j].z));
  }
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
  // The new rill's cut, exactly as recomposeEarth would make it.
  const W = g.nx + 1, cores = protectedCores(s), cut = new Map<number, number>();
  forVerticesNear(g, path, CHANNEL_REACH, (ix, iz, d) => {
    if (inCore(cores, vertexX(g, ix), vertexZ(g, iz))) return;
    const i = iz * W + ix, h = Math.fround(g.landHeight[i] - channelCut(d));
    if (h < g.height[i]) cut.set(i, h);
  });
  const view = cut.size === 0 ? g.height : withCut(g.height, cut);
  const mine = s.channels.length;
  const flows = solve(g, [...s.channels.map((c) => c.path), path], (_ch, x, z) => sampleHeight(g, view, x, z));
  return summarize(flows[mine]);
}

function withCut(height: Float32Array, cut: Map<number, number>): Float32Array {
  const h = Float32Array.from(height);
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
