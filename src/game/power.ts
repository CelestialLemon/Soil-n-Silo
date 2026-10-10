import { BUILDINGS, POWER } from './data.ts';
import { layoutOf, reachTo, sizeOf, type Building, type GameState } from './state.ts';

// Power networks: pylons within reach of each other link into a network, and every building that makes, stores or uses
// power joins the network of the first pylon that reaches one of its tiles. Each network balances on its own (sim.ts).

export interface Network {
  id: number;
  pylons: Building[];
  members: Building[];
  /** Last step's numbers, in watts and joules, for the HUD and inspector. */
  made: number;
  wanted: number;
  /** Share of what was wanted that machines got, 0–1. */
  share: number;
  stored: number;
  capacity: number;
}

interface Networks { layout: number; list: Network[]; of: Map<number, Network> }
const cached = new WeakMap<GameState, Networks>();

export const POWERED = (b: Building) => b.type !== 'pylon' && (isGenerator(b) || isConsumer(b) || b.type === 'battery');
export const isGenerator = (b: Building) => b.type === 'solar' || b.type === 'turbine' || b.type === 'digester';
export const isConsumer = (b: Building) => !!BUILDINGS[b.type].power;

export function networks(s: GameState): Networks {
  const layout = layoutOf(s);
  let n = cached.get(s);
  if (n && n.layout === layout) return n;
  const pylons = s.buildings.filter((b) => b.type === 'pylon');
  const parent = pylons.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < pylons.length; i++) for (let j = i + 1; j < pylons.length; j++) {
    if (Math.hypot(pylons[i].x - pylons[j].x, pylons[i].y - pylons[j].y) <= POWER.pylon.link) parent[find(i)] = find(j);
  }
  const byRoot = new Map<number, Network>();
  const list: Network[] = [];
  pylons.forEach((p, i) => {
    const root = find(i);
    let net = byRoot.get(root);
    if (!net) { net = { id: list.length + 1, pylons: [], members: [], made: 0, wanted: 0, share: 0, stored: 0, capacity: 0 }; byRoot.set(root, net); list.push(net); }
    net.pylons.push(p);
  });
  const of = new Map<number, Network>();
  for (const p of pylons) of.set(p.id, byRoot.get(find(pylons.indexOf(p)))!);
  for (const b of s.buildings) {
    if (!POWERED(b)) continue;
    const i = pylons.findIndex((p) => reachTo(b, p.x, p.y) <= POWER.pylon.reach);
    if (i < 0) continue;
    const net = byRoot.get(find(i))!;
    net.members.push(b);
    of.set(b.id, net);
  }
  // Keep last step's numbers across a rebuild, so the HUD doesn't flicker when something is placed.
  if (n) for (const net of list) {
    const old = n.list.find((o) => o.pylons.some((p) => net.pylons.includes(p)));
    if (old) { net.made = old.made; net.wanted = old.wanted; net.share = old.share; }
  }
  n = { layout, list, of };
  cached.set(s, n);
  return n;
}

export const networkOf = (s: GameState, b: Building) => networks(s).of.get(b.id) ?? null;

const gap = (a: Building, b: Building) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * The pylon a powered building draws through, for showing it: the nearest of its network's pylons that reaches it.
 * Null when it has no network.
 */
export function feederOf(s: GameState, b: Building): Building | null {
  const net = networkOf(s, b);
  if (!net) return null;
  let best: Building | null = null, bestD = Infinity;
  for (const p of net.pylons) {
    if (reachTo(b, p.x, p.y) > POWER.pylon.reach) continue;
    const c = Math.hypot(p.x + 0.5 - (b.x + sizeOf(b) / 2), p.y + 0.5 - (b.y + sizeOf(b) / 2));
    if (c < bestD) { bestD = c; best = p; }
  }
  return best;
}

/**
 * The wires to draw between a network's pylons: the shortest links that join them all (a minimum spanning tree), so a
 * dense cluster of pylons doesn't turn into a web. Every one is within link range.
 */
export function wiresOf(net: Network): [Building, Building][] {
  const ps = net.pylons, n = ps.length;
  if (n < 2) return [];
  const inTree = new Array<boolean>(n).fill(false), best = new Array<number>(n).fill(Infinity), from = new Array<number>(n).fill(-1);
  const out: [Building, Building][] = [];
  best[0] = 0;
  for (let k = 0; k < n; k++) {
    let i = -1;
    for (let j = 0; j < n; j++) if (!inTree[j] && (i < 0 || best[j] < best[i])) i = j;
    inTree[i] = true;
    if (from[i] >= 0) out.push([ps[from[i]], ps[i]]);
    for (let j = 0; j < n; j++) {
      const d = gap(ps[i], ps[j]);
      if (!inTree[j] && d <= POWER.pylon.link && d < best[j]) { best[j] = d; from[j] = i; }
    }
  }
  return out;
}

/** The pylons a pylon at (x, y) would link to. */
export const pylonsInLink = (s: GameState, x: number, y: number) =>
  networks(s).list.flatMap((n) => n.pylons).filter((p) => (p.x !== x || p.y !== y) && Math.hypot(p.x - x, p.y - y) <= POWER.pylon.link);
