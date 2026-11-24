// Wireless power: power buildings and free relays each project a soft field. Fields within reach of each other join a
// network; a homestead building or lantern inside a fed network's field is powered. No wires. Only those fields carry
// power on: a building or lantern that uses power draws from the fields it stands in, but never joins two of them (a
// lantern between a canopy and a far relay doesn't pass the canopy's power to the relay).
import type { GameState, PowerRadius, PowerState, Thing } from '../state.ts';
import { feeds, rangeOf, roleOf, Sets } from './nodes.ts';

export function radiusNetwork(s: GameState): PowerState {
  const emitters = s.things.filter((t) => { const r = roleOf(t); return (feeds(r) || r === 'relay') && rangeOf(t) > 0; }).sort((a, b) => a.id - b.id);
  const loads = s.things.filter((t) => roleOf(t) === 'load').sort((a, b) => a.id - b.id);
  // The networks: emitters (sources, stores, relays) alone, joined where their fields reach each other.
  const sets = new Sets(emitters.length);
  for (let i = 0; i < emitters.length; i++) for (let j = i + 1; j < emitters.length; j++) {
    const a = emitters[i], b = emitters[j];
    if (Math.hypot(a.x - b.x, a.z - b.z) <= Math.max(rangeOf(a), rangeOf(b))) sets.join(i, j);
  }
  const members = new Map<number, number>(), fed = new Set<number>();
  emitters.forEach((e, i) => {
    const r = sets.find(i);
    members.set(r, (members.get(r) ?? 0) + 1);
    if (feeds(roleOf(e))) fed.add(r);
  });
  // Each load sits in the fields of zero or more networks; it draws from them without joining them.
  const inFields = (l: Thing) => new Set(emitters.flatMap((e, i) => (Math.hypot(l.x - e.x, l.z - e.z) <= rangeOf(e) ? [sets.find(i)] : [])));
  const loadNets = loads.map(inFields);
  for (const nets of loadNets) for (const r of nets) members.set(r, (members.get(r) ?? 0) + 1);

  const radii: PowerRadius[] = emitters.map((e, i) => ({ id: e.id, x: e.x, z: e.z, radius: rangeOf(e), powered: fed.has(sets.find(i)) }));
  const connected: number[] = [], powered: number[] = [];
  emitters.forEach((e, i) => {
    const r = sets.find(i);
    if ((members.get(r) ?? 0) >= 2) connected.push(e.id);
    if (fed.has(r)) powered.push(e.id);
  });
  loads.forEach((l, k) => {
    const nets = [...loadNets[k]];
    if (nets.length > 0) connected.push(l.id);
    if (nets.some((r) => fed.has(r))) powered.push(l.id);
  });
  return { radii, connected: connected.sort((a, b) => a - b), powered: powered.sort((a, b) => a - b) };
}
