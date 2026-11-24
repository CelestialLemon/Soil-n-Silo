// Wireless mode: power buildings and free relays each project a soft field. Fields within reach of each other join a
// network; a homestead building or lantern inside a fed network's field is powered. No wires.
import type { GameState, PowerRadius, PowerState } from '../state.ts';
import { feeds, rangeOf, roleOf, Sets } from './nodes.ts';

export function radiusNetwork(s: GameState): PowerState {
  const emitters = s.things.filter((t) => { const r = roleOf(t); return (feeds(r) || r === 'relay') && rangeOf(t) > 0; }).sort((a, b) => a.id - b.id);
  const loads = s.things.filter((t) => roleOf(t) === 'load').sort((a, b) => a.id - b.id);
  const sets = new Sets(emitters.length + loads.length);
  for (let i = 0; i < emitters.length; i++) for (let j = i + 1; j < emitters.length; j++) {
    const a = emitters[i], b = emitters[j];
    if (Math.hypot(a.x - b.x, a.z - b.z) <= Math.max(rangeOf(a), rangeOf(b))) sets.join(i, j);
  }
  // Each load joins the network of every field it stands in.
  loads.forEach((l, k) => emitters.forEach((e, i) => { if (Math.hypot(l.x - e.x, l.z - e.z) <= rangeOf(e)) sets.join(emitters.length + k, i); }));
  const all = [...emitters, ...loads];
  const size = new Map<number, number>(), fed = new Set<number>();
  all.forEach((t, i) => { const r = sets.find(i); size.set(r, (size.get(r) ?? 0) + 1); if (feeds(roleOf(t))) fed.add(r); });
  const radii: PowerRadius[] = emitters.map((e, i) => ({ id: e.id, x: e.x, z: e.z, radius: rangeOf(e), powered: fed.has(sets.find(i)) }));
  const ids = (pred: (i: number) => boolean) => all.filter((_t, i) => pred(i)).map((t) => t.id).sort((a, b) => a - b);
  return {
    mode: 'wireless', spans: [], radii,
    connected: ids((i) => (size.get(sets.find(i)) ?? 0) >= 2),
    powered: ids((i) => fed.has(sets.find(i))),
  };
}
