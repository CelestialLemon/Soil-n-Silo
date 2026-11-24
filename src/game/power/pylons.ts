// Pylons mode: slim wooden poles carry wires. Power buildings, the homestead's buildings, lanterns and free pylons within
// reach of each other join up along the shortest wires that connect them (a minimum spanning tree per network).
import { CATALOG } from '../catalog.ts';
import { heightAt } from '../grid.ts';
import type { GameState, PowerState, Thing, WireSpan } from '../state.ts';
import { feeds, rangeOf, roleOf, Sets } from './nodes.ts';

export function pylonNetwork(s: GameState): PowerState {
  const nodes = s.things.filter((t) => { const r = roleOf(t); return r !== 'none' && r !== 'relay'; }).sort((a, b) => a.id - b.id);
  const edges: { a: number; b: number; d: number }[] = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.z - b.z);
    if (d <= Math.max(rangeOf(a), rangeOf(b))) edges.push({ a: i, b: j, d });
  }
  edges.sort((p, q) => p.d - q.d || nodes[p.a].id - nodes[q.a].id || nodes[p.b].id - nodes[q.b].id);
  const sets = new Sets(nodes.length), spans: WireSpan[] = [];
  const top = (t: Thing) => ({ x: t.x, y: heightAt(s.grid, t.x, t.z) + CATALOG[t.kind].wireY, z: t.z });
  for (const e of edges) if (sets.join(e.a, e.b)) {
    const a = nodes[e.a], b = nodes[e.b];
    spans.push({ from: a.id, to: b.id, a: top(a), b: top(b) });
  }
  const size = new Map<number, number>(), fed = new Set<number>();
  nodes.forEach((t, i) => { const r = sets.find(i); size.set(r, (size.get(r) ?? 0) + 1); if (feeds(roleOf(t))) fed.add(r); });
  const connected = nodes.filter((_t, i) => (size.get(sets.find(i)) ?? 0) >= 2).map((t) => t.id);
  const powered = nodes.filter((_t, i) => fed.has(sets.find(i))).map((t) => t.id);
  return { mode: 'pylons', spans, radii: [], connected, powered };
}
