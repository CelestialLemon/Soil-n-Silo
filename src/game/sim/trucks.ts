import { bays, BUILDINGS, TRUCK, type ItemId } from '../data.ts';
import { noteArrival } from '../fleet.ts';
import { networkOf } from '../power.ts';
import { accessTiles, distanceTo, isOpen, legLength, nearestOpen, pathTo } from '../roads.ts';
import {
  buildingById, layoutOf, routeById, tileIndex, type Building, type GameState, type Route, type Stop, type Truck,
} from '../state.ts';
import { handlesGoods } from './layout.ts';
import { wantsCompost, compostWanted, accept, waiting, take, takesGoods, tradesNextDoor } from './goods.ts';
import { shareOf } from './energy.ts';

// Trucks: routes, stops, driving, loading and charging.

/** Whether trucks can stop at a building: it grows, makes, uses or stores goods, or is the depot. */
export const isStop = (b: Building) => !!BUILDINGS[b.type].stores || handlesGoods(b);

export const tileOf = (s: GameState, t: Truck) => tileIndex(s, Math.floor(t.x), Math.floor(t.y));
export const garageOf = (s: GameState, t: Truck) => buildingById(s, t.garage);
export const routeOf = (s: GameState, t: Truck) => routeById(s, t.route);
/** The routes that stop at a building. */
export const routesAt = (s: GameState, b: Building) => s.routes.filter((r) => r.stops.some((st) => st.building === b.id));
/** The trucks running a route. */
export const trucksOn = (s: GameState, r: Route) => s.trucks.filter((t) => t.route === r.id);

/** Sends a truck along the shortest way to a building; false if there is none. */
function driveTo(s: GameState, t: Truck, b: Building): boolean {
  const p = pathTo(s, b, tileOf(s, t));
  if (!p) return false;
  t.path = p; t.target = b.id; t.phase = 'drive'; t.idle = 0;
  return true;
}

/** Sends a truck home to its garage (to park, or to charge); if it can't get there it waits where it is. */
function goHome(s: GameState, t: Truck) {
  const g = garageOf(s, t)!;
  t.path = [];
  if (distanceTo(s, g, tileOf(s, t)) === 0) { t.phase = routeOf(s, t)?.stops.length ? 'charge' : 'parked'; t.target = g.id; t.idle = 0; return; }
  if (!driveTo(s, t, g)) { t.phase = 'stuck'; t.target = null; }
}

/**
 * Sets a truck off for stop `from` of its route, or the next one after it that it can reach. If its battery wouldn't get it
 * there and then home, it goes home to charge first (unless it has just charged, or can't get home).
 */
function setOff(s: GameState, t: Truck, from: number) {
  const r = routeOf(s, t), g = garageOf(s, t)!;
  if (!r || !r.stops.length) { goHome(s, t); return; }
  const here = tileOf(s, t), n = r.stops.length;
  let i = -1;
  for (let k = 0; k < n; k++) {
    const b = buildingById(s, r.stops[(from + k) % n].building);
    if (b && distanceTo(s, b, here) < Infinity) { i = (from + k) % n; break; }
  }
  t.stop = ((from % n) + n) % n;
  if (i < 0) { t.phase = 'stuck'; t.path = []; t.target = null; return; }
  t.stop = i;
  const b = buildingById(s, r.stops[i].building)!;
  // The way there, and home from the tile it will stop at.
  const path = pathTo(s, b, here)!, leg = distanceTo(s, b, here), back = distanceTo(s, g, path.length ? path[path.length - 1] : here);
  if (!t.charged && back < Infinity && distanceTo(s, g, here) < Infinity
    && t.energy < (leg + back) * TRUCK.joulesPerTile) { goHome(s, t); return; }
  t.charged = false;
  t.path = path; t.target = b.id; t.phase = 'drive'; t.idle = 0;
}

/**
 * How many more compost a route's trucks may pick up, when fields are the only stops it drops compost at: what those fields
 * take now, less the compost its trucks carry. So a truck never fills up with compost no field takes, and has no room left
 * for their harvest (the fields then never grow, so their soil never wears down to take it). Unlimited when another of its
 * stops takes compost (the depot or a silo), or none does (the truck shows that it carries goods no stop takes).
 */
function compostRoom(s: GameState, r: Route): number {
  let room = 0;
  const fields = new Set<number>();
  for (const st of r.stops) {
    const b = buildingById(s, st.building);
    if (!b || !st.drop.includes('compost')) continue;
    if (b.type !== 'field') { if (takesGoods(b).includes('compost')) return Infinity; continue; }
    // A field the route stops at twice still takes its compost once.
    if (!fields.has(b.id)) room += compostWanted(s, b);
    fields.add(b.id);
  }
  if (!fields.size) return Infinity;
  for (const t of trucksOn(s, r)) room -= t.cargo.filter((i) => i === 'compost').length;
  return room;
}
/** Whether a truck on route `r` may pick up `item` now (compost only while the route's fields take more). */
const mayPick = (s: GameState, r: Route, item: ItemId) => item !== 'compost' || compostRoom(s, r) > 0;

/**
 * Whether a truck is done at its stop: it carries none of the stop's drop goods (compost doesn't count at a field whose soil
 * is good: waiting won't make it take any), and is full or has nothing it may pick up there.
 */
const doneAt = (s: GameState, t: Truck, st: Stop, b: Building, r: Route) =>
  !t.cargo.some((i) => st.drop.includes(i) && !(b.type === 'field' && i === 'compost' && !wantsCompost(s, b)))
  && (t.cargo.length >= TRUCK.cargo || !st.pick.some((i) => mayPick(s, r, i)));

/** Moves one good at a stop: drops one the building takes, else picks up the next of the stop's goods there is. */
function moveOne(s: GameState, t: Truck, st: Stop, b: Building, r: Route): boolean {
  for (let k = 0; k < t.cargo.length; k++) {
    const it = t.cargo[k];
    if (st.drop.includes(it) && accept(s, b, it)) { t.cargo.splice(k, 1); r.moved.push(s.time); return true; }
  }
  if (t.cargo.length >= TRUCK.cargo) return false;
  const n = st.pick.length;
  for (let k = 0; k < n; k++) {
    const it = st.pick[(st.turn + k) % n];
    if (waiting(b, it) > 0 && mayPick(s, r, it)) { take(s, b, it); t.cargo.push(it); st.turn = (st.turn + k + 1) % n; return true; }
  }
  return false;
}

/** A docked truck's step at its stop: moves goods, and leaves when done or when it has waited long enough. */
function atStop(s: GameState, t: Truck, dt: number, queued: boolean) {
  const r = routeOf(s, t), st = r?.stops[t.stop], b = t.target !== null ? buildingById(s, t.target) : null;
  if (!r || !st || !b || st.building !== b.id) { redirect(s, t); return; }
  t.budget += TRUCK.moveRate * dt;
  let stuck = false;
  while (t.budget >= 1) {
    if (moveOne(s, t, st, b, r)) { t.budget -= 1; t.idle = 0; } else { stuck = true; t.budget = 1; break; }
  }
  if (doneAt(s, t, st, b, r)) { setOff(s, t, t.stop + 1); return; }
  if (stuck) {
    t.idle += dt;
    if (t.idle >= st.wait - 1e-9 || queued) setOff(s, t, t.stop + 1);
  }
}

/** Drives a truck along its path; at the end it parks at its garage or joins the queue at its stop. */
function drive(s: GameState, t: Truck, dt: number) {
  const w = s.map.width;
  let left = (t.energy > 0 ? TRUCK.speed : TRUCK.crawl) * dt;
  while (left > 1e-9 && t.path.length) {
    const i = t.path[0], tx = i % w + 0.5, ty = Math.floor(i / w) + 0.5;
    const dx = tx - t.x, dy = ty - t.y, d = Math.hypot(dx, dy);
    if (d > 1e-6) t.heading = Math.atan2(dx, dy);
    const step = Math.min(d, left);
    if (d > 1e-9) { t.x += dx / d * step; t.y += dy / d * step; }
    left -= step;
    t.energy = Math.max(0, t.energy - step * TRUCK.joulesPerTile);
    if (step >= d - 1e-9) { t.x = tx; t.y = ty; t.path.shift(); }
  }
  if (t.path.length) return;
  const b = t.target !== null ? buildingById(s, t.target) : null;
  if (!b) { redirect(s, t); return; }
  if (b.id === t.garage) { t.phase = routeOf(s, t)?.stops.length ? 'charge' : 'parked'; t.idle = 0; return; }
  t.phase = 'queue'; t.arrived = s.time; t.idle = 0;
  noteArrival(s, t);
}

/**
 * Points a truck at what it should do now: after its route changed, its target went, or it was given another route. A
 * truck at its garage starts from there on the next step; one elsewhere heads for its current stop (or home, with no route).
 */
export function redirect(s: GameState, t: Truck) {
  const r = routeOf(s, t);
  if (t.phase === 'parked' || t.phase === 'charge') { if (!r?.stops.length) t.phase = 'parked'; return; }
  if (!r?.stops.length) { goHome(s, t); return; }
  setOff(s, t, t.stop);
}

/**
 * After a route's stops changed (`kept[i]` is where old stop i is now, or null if it went): each of its trucks keeps its
 * stop, at its new place; a truck whose stop went goes on to the one that came after it (stop 1 after the last).
 */
export function routeChanged(s: GameState, r: Route, kept: (number | null)[]) {
  const n = r.stops.length;
  for (const t of trucksOn(s, r)) {
    if (!n) { t.stop = 0; redirect(s, t); continue; }
    const now = kept[t.stop];
    if (now !== null && now !== undefined) { t.stop = now; if (t.phase === 'stuck') redirect(s, t); continue; }
    // The stops before it that are left: the next one is now at that place.
    t.stop = kept.slice(0, t.stop).filter((k) => k !== null).length % n;
    const away = t.phase === 'drive' || t.phase === 'queue' || t.phase === 'dock';
    if ((away && t.target !== t.garage) || t.phase === 'stuck') { if (t.phase !== 'drive') t.phase = 'stuck'; setOff(s, t, t.stop); }
  }
}

/** Charges a truck at its garage from the garage's network; true if it got any charge this step. */
function charge(s: GameState, t: Truck, dt: number) {
  const g = garageOf(s, t)!;
  const give = Math.min(TRUCK.chargeRate * dt, TRUCK.battery - t.energy) * (networkOf(s, g) ? shareOf(s, g) : 0);
  t.energy = Math.min(TRUCK.battery, t.energy + give);
  return give > 1e-9;
}

/** The layout each game's trucks last found their ways on. */
const truckLayout = new WeakMap<GameState, number>();

/** Drives, docks and charges every truck, then lets queued trucks dock where a building has room. */
export function runTrucks(s: GameState, dt: number) {
  // The layout changed: a truck on a tile that was built on moves to the nearest open one, and driving trucks find their
  // way again (a building may stand across it, or a new way be shorter).
  const layout = layoutOf(s);
  if (truckLayout.get(s) !== layout) {
    truckLayout.set(s, layout);
    for (const t of s.trucks) {
      if (!isOpen(s, Math.floor(t.x), Math.floor(t.y))) {
        const i = nearestOpen(s, Math.floor(t.x), Math.floor(t.y));
        if (i !== null) { t.x = i % s.map.width + 0.5; t.y = Math.floor(i / s.map.width) + 0.5; }
      }
      const b = t.target !== null ? buildingById(s, t.target) : null, here = tileOf(s, t);
      // At a building or its garage, but no longer beside it (moved off a tile built on, or walled off): it drives back,
      // or on to its next stop if it can't.
      if (t.phase === 'queue' || t.phase === 'dock') { if (!b || distanceTo(s, b, here) !== 0) { t.phase = 'stuck'; redirect(s, t); } continue; }
      if (t.phase === 'parked' || t.phase === 'charge') { if (distanceTo(s, garageOf(s, t)!, here) !== 0) goHome(s, t); continue; }
      if (t.phase !== 'drive') continue;
      if (b && driveTo(s, t, b)) continue;
      if (b?.id === t.garage) { t.phase = 'stuck'; t.path = []; t.target = null; } else redirect(s, t);
    }
  }
  const queued = new Set<number>();
  for (const t of s.trucks) if (t.phase === 'queue' && t.target !== null) queued.add(t.target);
  for (const t of s.trucks) {
    switch (t.phase) {
      case 'parked': {
        charge(s, t, dt);
        // Given a route: off it goes (home again to charge first, if its battery is short).
        if (routeOf(s, t)?.stops.length) { t.charged = false; setOff(s, t, t.stop); }
        break;
      }
      case 'charge': {
        if (charge(s, t, dt)) t.idle = 0; else t.idle += dt;
        if (!routeOf(s, t)?.stops.length) { t.phase = 'parked'; break; }
        if (t.energy >= TRUCK.battery - 1e-6 || t.idle >= TRUCK.giveUp) { t.charged = true; setOff(s, t, t.stop); }
        break;
      }
      case 'drive': drive(s, t, dt); break;
      case 'dock': atStop(s, t, dt, queued.has(t.target!)); break;
      case 'stuck': redirect(s, t); break;
      case 'queue': break;
    }
  }
  // Queued trucks dock in the order they came, while the building has a free bay.
  const docked = new Map<number, number>(), waitingAt = new Map<number, Truck[]>();
  for (const t of s.trucks) {
    if (t.target === null) continue;
    if (t.phase === 'dock') docked.set(t.target, (docked.get(t.target) ?? 0) + 1);
    if (t.phase === 'queue') { const q = waitingAt.get(t.target); if (q) q.push(t); else waitingAt.set(t.target, [t]); }
  }
  for (const [id, q] of waitingAt) {
    const b = buildingById(s, id);
    if (!b) { for (const t of q) redirect(s, t); continue; }
    q.sort((a, c) => a.arrived - c.arrived || a.id - c.id);
    for (let free = bays(b.type) - (docked.get(id) ?? 0), k = 0; free > 0 && k < q.length; free--, k++) {
      const t = q[k];
      t.phase = 'dock'; t.budget = 0; t.idle = 0;
    }
  }
}

/**
 * Whether trucks can't reach a building that needs them: no open tile beside it (unless it trades only with the buildings
 * next door), or (a stop) the garage of a truck on one of its routes has no way there.
 */
export function cutOff(s: GameState, b: Building): boolean {
  if (!isStop(b) && b.type !== 'garage') return false;
  // Walled in, it needs no trucks if no route stops there and it trades with the buildings next door instead.
  if (!accessTiles(s, b).length) return b.type === 'garage' || routesAt(s, b).length > 0 || !tradesNextDoor(s, b);
  return routesAt(s, b).some((r) => trucksOn(s, r).some((t) => { const g = garageOf(s, t); return !!g && legLength(s, g, b) === Infinity; }));
}
