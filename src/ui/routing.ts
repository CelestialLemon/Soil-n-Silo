import { BUILDINGS, ITEM_IDS, type ItemId } from '../game/data.ts';
import { givesGoods } from '../game/sim/goods.ts';
import { trucksOn } from '../game/sim/trucks.ts';
import { stopProblems, truckProblems } from '../game/sim/describe.ts';
import { buildingById, type GameState, type Route, type Truck } from '../game/state.ts';
import { ROUTE_COLOURS } from '../world/shapes.ts';
import { routeColour } from '../world/routeView.ts';
import { hex } from './format.ts';

// Routes and trucks in words, for the inspector and the routes card.

/** A route's colour as CSS, as drawn on the map. */
export const routeCss = (s: GameState, r: Route) => hex(ROUTE_COLOURS[routeColour(s, r)]);

/** A route's stops in a few words, runs of one kind together: "Field ×3 → Mill → Freight depot". */
export function stopsText(s: GameState, r: Route): string {
  const out: { name: string; n: number }[] = [];
  for (const st of r.stops) {
    const b = buildingById(s, st.building), name = b ? BUILDINGS[b.type].name : '?', last = out[out.length - 1];
    if (last?.name === name) last.n++; else out.push({ name, n: 1 });
  }
  return out.map((x) => (x.n > 1 ? `${x.name} ×${x.n}` : x.name)).join(' → ');
}

/** The goods a route picks up anywhere (the goods it moves). */
export function routeGoods(s: GameState, r: Route): ItemId[] {
  const got = new Set<ItemId>();
  for (const st of r.stops) {
    const b = buildingById(s, st.building);
    if (!b) continue;
    const gives = b.type === 'silo' ? st.pick : givesGoods(b);
    for (const i of st.pick) if (gives.includes(i)) got.add(i);
  }
  return ITEM_IDS.filter((i) => got.has(i));
}

/** A truck's name: its number at its garage, and the garage's when there are several. */
export function truckName(s: GameState, t: Truck): string {
  const n = s.trucks.filter((x) => x.garage === t.garage).indexOf(t) + 1;
  const garages = s.buildings.filter((b) => b.type === 'garage'), g = garages.findIndex((b) => b.id === t.garage);
  return garages.length > 1 ? `Truck ${n} of garage ${g + 1}` : `Truck ${n}`;
}

/** A route's problems, by stop and by truck, in a line each. */
export function routeProblems(s: GameState, r: Route): string[] {
  const out = stopProblems(s, r).flatMap((p, i) => (p ? [`Stop ${i + 1}: ${p}`] : []));
  for (const t of trucksOn(s, r)) for (const p of truckProblems(s, t)) out.push(`${truckName(s, t)}: ${p}`);
  if (r.stops.length && !trucksOn(s, r).length) out.push('No trucks run it.');
  return out;
}

/** What a route's trucks are doing, counted: "2 driving · 1 queuing". */
export function trucksDoing(s: GameState, r: Route): string {
  const n = new Map<string, number>();
  for (const t of trucksOn(s, r)) {
    const what = t.phase === 'drive' ? (t.target === t.garage ? 'going to charge' : 'driving') : t.phase === 'dock' ? 'at a stop'
      : t.phase === 'queue' ? 'queuing' : t.phase === 'stuck' ? 'stuck' : 'charging';
    n.set(what, (n.get(what) ?? 0) + 1);
  }
  return [...n].map(([w, k]) => `${k} ${w}`).join(' · ');
}

/** What of a route's stops a panel shows (not the stops' turns, which change all the time). */
export const stopsKey = (r: Route) => r.stops.map((st) => [st.building, st.drop, st.pick, st.wait]);

/** Whether the caret is in a text box inside `el` (a rebuild would lose it). */
export const typingIn = (el: HTMLElement) => document.activeElement instanceof HTMLInputElement && el.contains(document.activeElement);
