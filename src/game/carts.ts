// Electric Carts: they haul everything on their own, with no route menus (docs/DESIGN.md, "Zero-Menu Solarpunk
// Logistics"). An idle cart looks for the most useful job it can reach, in this order:
//   1. the Pantry Order: bread, flour and beans to the Depot while the settlement still wants them;
//   2. starved workshops: wheat to the Mill, flour and eggs to the Bakery, bran (or wheat) to the Coop, manure (or bran)
//      to the Composter, from the fields, the workshops that make them or the Silo;
//   3. ripe fields, harvested into the Silo;
//   4. compost to the field whose soil is poorest;
//   5. workshops' filling output buffers, cleared into the Silo.
// What's spoken for is read from the carts' own jobs (never kept apart from them, so nothing is ever claimed twice or
// claimed forever). A cart checks its job again at each end, and on the way: a building taken down, or the land changed
// under its path, sends it another way, and cargo with nowhere to go waits on the cart until somewhere wants it.
import { CATALOG, isWorkshop, type ThingKind } from './catalog.ts';
import { type Change, emptyChange } from './change.ts';
import { sunFactor } from './clock.ts';
import { compostField, harvestField } from './crops.ts';
import type { SimEvent } from './events.ts';
import { type Point2, toWorld } from './geom.ts';
import { addGood, countOf, GOOD_LABELS, type Good, takeGood, totalStored } from './goods.ts';
import { CART_SPEED, dockOf, findPath, groundAt, navCellOf, navCenter, navFor, passable, reachOf } from './nav.ts';
import { err, ok, type Result } from './result.ts';
import type { Field, GameState, Thing } from './state.ts';
import { CART_COST, canAfford, MAX_CARTS, receiveDrop, refund, spend } from './supplies.ts';
import { INPUT_CAP, RECIPES, runtimeOf, siloRoom, type ThingRuntime, wantsInput } from './workshops.ts';

/** Units a cart carries per trip. */
export const CART_CAPACITY = 2;
/** Below this charge a cart heads home to charge; a charging cart sets out again once it holds CART_READY. */
export const CART_LOW = 0.22, CART_READY = 0.5;
/** Battery per metre on a track (a full charge runs 1.5 km of track); meadow, mud and climbs drain more. */
export const DRAIN_PER_M = 1 / 1500;
/** Charge per game hour at a powered Garage, and from its solar roof alone in daylight. */
export const CHARGE_PER_HOUR = 1.25, TRICKLE_PER_HOUR = 0.25;
/** How long loading or unloading takes, game hours. */
export const DWELL_HOURS = 0.06;
/** A cart within this of the Garage's dock is at the Garage (its parking spots spread either side of the dock), m. */
export const DOCK_RADIUS = 5;
/** A flat cart crawls home at this share of its speed. */
const LIMP = 0.25;
/** How often an idle cart looks for work, game hours. */
const THINK_HOURS = 0.05;

export type CartState = 'idle' | 'charging' | 'toPickup' | 'toDropoff' | 'returning';

/** One end of a haul: a building or a field. */
export interface Endpoint { kind: 'thing' | 'field'; id: number }

export interface CartJob { from: Endpoint; to: Endpoint; good: Good; count: number; priority: number }

export interface Cart {
  id: number;
  x: number; z: number;
  /** Which way it faces (as things' yaw: forward is (sin yaw, cos yaw)). */
  yaw: number;
  /** How fast it moved on the last step, m per game-second. */
  speed: number;
  /** 0..1. */
  battery: number;
  cargo: { good: Good; count: number } | null;
  state: CartState;
  /** What it's doing, in plain words, for its card: "Taking 2 Flour to the Depot". */
  jobDesc: string;
  /** Its waypoints, and the next one it drives to. */
  path: Point2[]; pathIdx: number;
  /** Where it's headed: "Depot", "Wheat field". */
  targetLabel?: string;
  job: CartJob | null;
  /** Game hours left loading or unloading (or before it looks for work again). */
  wait: number;
  /** The nav grid its path was found on: a change re-plans it. */
  navKey: string;
}

const dist = (a: Point2, b: Point2) => Math.hypot(a.x - b.x, a.z - b.z);
const sameEnd = (a: Endpoint, b: Endpoint) => a.kind === b.kind && a.id === b.id;
const thingEnd = (id: number): Endpoint => ({ kind: 'thing', id });
const fieldEnd = (id: number): Endpoint => ({ kind: 'field', id });

const garageOf = (s: GameState) => s.things.find((t) => t.kind === 'garage');
const thingById = (s: GameState, id: number) => s.things.find((t) => t.id === id);
const fieldById = (s: GameState, id: number) => s.fields.find((f) => f.id === id);

/** An endpoint's name: "Mill", "Wheat field". */
export function endpointLabel(s: GameState, e: Endpoint): string {
  if (e.kind === 'field') { const f = fieldById(s, e.id); return f ? `${GOOD_LABELS[f.crop].label} field` : 'field'; }
  const t = thingById(s, e.id);
  return t ? CATALOG[t.kind].label : 'building';
}

// --- Where carts stop ---------------------------------------------------------------------------------------------------

const edgeCache = new WeakMap<GameState, { key: string; at: Map<number, Point2 | null> }>();

/** Where carts load at a field: its drivable cell nearest a track (or, with no tracks, nearest the Garage). */
export function fieldEdge(s: GameState, f: Field): Point2 | null {
  const nav = navFor(s);
  let cache = edgeCache.get(s);
  if (!cache || cache.key !== nav.key) { cache = { key: nav.key, at: new Map() }; edgeCache.set(s, cache); }
  const hit = cache.at.get(f.id);
  if (hit !== undefined) return hit;
  const g = s.grid, cells = new Set<number>();
  for (let iz = f.bounds.z0; iz <= f.bounds.z1; iz++) for (let ix = f.bounds.x0; ix <= f.bounds.x1; ix++) {
    if (g.fieldOf[iz * g.nx + ix] !== f.id) continue;
    const i = navCellOf(g.x0 + (ix + 0.5) * g.cell, g.z0 + (iz + 0.5) * g.cell);
    if (passable(nav, i)) cells.add(i);
  }
  const tracks: Point2[] = [];
  for (let i = 0; i < nav.track.length; i++) if (nav.track[i] === 1 && passable(nav, i)) tracks.push(navCenter(i));
  const home = garageOf(s);
  let best: Point2 | null = null, bestD = Infinity;
  for (const i of cells) {
    const c = navCenter(i);
    let d = Infinity;
    if (tracks.length > 0) for (const t of tracks) d = Math.min(d, Math.hypot(t.x - c.x, t.z - c.z));
    else d = home ? Math.hypot(home.x - c.x, home.z - c.z) : 0;
    if (d < bestD) { bestD = d; best = c; }
  }
  cache.at.set(f.id, best);
  return best;
}

/** Where a cart stops for an endpoint, or null if it's gone or no cart can stand by it. */
function placeOf(s: GameState, e: Endpoint): Point2 | null {
  if (e.kind === 'field') { const f = fieldById(s, e.id); return f ? fieldEdge(s, f) : null; }
  const t = thingById(s, e.id);
  return t ? dockOf(s, t) : null;
}

/** Where cart number `k` parks at the Garage: side by side before its door. */
function parking(s: GameState, cart: Cart): Point2 | null {
  const garage = garageOf(s);
  if (!garage) return null;
  const dock = dockOf(s, garage);
  if (!dock) return null;
  const k = s.sim.carts.indexOf(cart), n = s.sim.carts.length;
  const along = (k - (n - 1) / 2) * 2.2;
  const p = toWorld(dock.x, dock.z, garage.yaw, along, 0.6), nav = navFor(s);
  return passable(nav, navCellOf(p.x, p.z)) ? p : dock;
}

/** Whether a cart stands at the Garage as it is now (a cart parked at its old site, after it moved, isn't). */
export function atGarage(s: GameState, cart: Pick<Cart, 'x' | 'z'>): boolean {
  const garage = garageOf(s), dock = garage && dockOf(s, garage);
  return dock ? dist(dock, cart) <= DOCK_RADIUS : false;
}

/** Whether a cart is charging at the Garage now (what the Garage draws its charging power for). */
export const chargingAtGarage = (s: GameState, cart: Cart): boolean => cart.state === 'charging' && cart.battery < 1 && atGarage(s, cart);

// --- The cart roster ----------------------------------------------------------------------------------------------------

function newCart(s: GameState): Cart {
  const garage = garageOf(s);
  const at = garage ? (dockOf(s, garage) ?? { x: garage.x, z: garage.z }) : { x: 0, z: 0 };
  const cart: Cart = {
    id: s.sim.nextCartId++, x: at.x, z: at.z, yaw: garage?.yaw ?? 0, speed: 0, battery: 1, cargo: null, state: 'idle',
    jobDesc: 'Parked at the Garage', path: [], pathIdx: 0, job: null, wait: 0, navKey: '',
  };
  s.sim.carts.push(cart);
  return cart;
}

/** The Garage's own cart, which comes with it. */
export function addStarterCart(s: GameState): Cart | undefined {
  return s.sim.carts.length === 0 ? newCart(s) : undefined;
}

/** Buys another Electric Cart at the Garage. */
export function buyCart(s: GameState): Result<Change, string> {
  if (!garageOf(s)) return err('Carts live at the Garage: build one first.');
  if (s.sim.carts.length >= MAX_CARTS) return err(`The Garage holds at most ${MAX_CARTS} carts.`);
  const can = canAfford(s.sim.supplies, CART_COST, 'Another Electric Cart');
  if (!can.ok) return can;
  spend(s.sim.supplies, CART_COST);
  const cart = newCart(s), change = emptyChange(s.revision);
  change.carts = true; change.supplies = true; change.created = cart.id;
  return ok(change);
}

/** Retires a cart, refunding it in full; its cargo goes into the Silo if there's room. The Garage keeps its last cart. */
export function retireCart(s: GameState, id: number): Result<Change, string> {
  const k = s.sim.carts.findIndex((c) => c.id === id);
  if (k < 0) return err('There is no cart there to retire.');
  if (s.sim.carts.length <= 1 && garageOf(s)) return err('The Garage keeps its own cart: remove the Garage to retire it.');
  const [cart] = s.sim.carts.splice(k, 1);
  stowCargo(s, cart);
  refund(s.sim.supplies, CART_COST);
  const change = emptyChange(s.revision);
  change.carts = true; change.supplies = true;
  return ok(change);
}

/** Retires every cart (the Garage came down), refunding all but the one it came with. */
export function retireAllCarts(s: GameState): void {
  const extra = Math.max(0, s.sim.carts.length - 1);
  for (const c of s.sim.carts) stowCargo(s, c);
  s.sim.carts = [];
  refund(s.sim.supplies, extra * CART_COST);
}

/** Puts a retiring cart's cargo into the Silo, as much as fits. */
function stowCargo(s: GameState, cart: Cart) {
  if (!cart.cargo) return;
  const silo = s.things.find((t) => t.kind === 'silo'), r = silo && runtimeOf(s, silo.id);
  if (r) addGood(r.outputs, cart.cargo.good, Math.min(cart.cargo.count, siloRoom(r, cart.cargo.good)));
  cart.cargo = null;
}

// --- What's spoken for --------------------------------------------------------------------------------------------------

/** Units of `good` carts are on their way to collect at `end`. */
function claimed(s: GameState, end: Endpoint, good: Good): number {
  let n = 0;
  for (const c of s.sim.carts) if (c.job && c.state === 'toPickup' && c.job.good === good && sameEnd(c.job.from, end)) n += c.job.count;
  return n;
}

/** Units carts are bringing to `end` (of `goods`, or of anything). */
function incoming(s: GameState, end: Endpoint, goods?: readonly Good[]): number {
  let n = 0;
  for (const c of s.sim.carts) {
    if (!c.job || !sameEnd(c.job.to, end) || (goods && !goods.includes(c.job.good))) continue;
    if (c.state === 'toPickup') n += c.job.count;
    else if (c.state === 'toDropoff' && c.cargo) n += c.cargo.count;
  }
  return n;
}

interface Source { end: Endpoint; avail: number; at: Point2; silo: boolean }

/**
 * Which patch of drivable ground a cart is on (nav.ts reachOf): only places on it are worth a thought, so a field across
 * an unbridged brook neither crowds out the ones it can reach nor stands in for a workshop's preferred input. Undefined:
 * every place counts (a cart standing on no drivable patch, which findPath sorts out).
 */
type Reach = number | undefined;
const within = (s: GameState, reach: Reach, at: Point2) => reach === undefined || reachOf(s, at, 'goal') === reach;

/** Everywhere `good` can be collected now (on the cart's patch of ground), and how much of it isn't spoken for. */
function sources(s: GameState, good: Good, reach?: Reach): Source[] {
  const out: Source[] = [];
  for (const f of s.fields) {
    if (f.crop !== good || f.harvestReady <= 0) continue;
    const end = fieldEnd(f.id), avail = f.harvestReady - claimed(s, end, good), at = fieldEdge(s, f);
    if (avail > 0 && at && within(s, reach, at)) out.push({ end, avail, at, silo: false });
  }
  for (const t of s.things) {
    if (t.kind !== 'silo' && !isWorkshop(t.kind)) continue;
    const r = s.sim.things.get(t.id);
    if (!r || countOf(r.outputs, good) <= 0) continue;
    const end = thingEnd(t.id), avail = countOf(r.outputs, good) - claimed(s, end, good), at = dockOf(s, t);
    if (avail > 0 && at && within(s, reach, at)) out.push({ end, avail, at, silo: t.kind === 'silo' });
  }
  return out;
}

/** The Pantry Order's goods the Depot still wants, beyond what carts are already bringing. */
function depotWants(s: GameState, depot: Thing, good: Good): number {
  const o = s.sim.brief.order;
  if (o.done) return 0;
  const target = o.targets[good] ?? 0;
  return Math.max(0, target - countOf(s.sim.delivered, good) - incoming(s, thingEnd(depot.id), [good]));
}

/** How many of `good` a workshop or the Silo would take, beyond what carts are already bringing. */
function thingWants(s: GameState, t: Thing, r: ThingRuntime, good: Good): number {
  const end = thingEnd(t.id);
  if (t.kind === 'silo') return Math.max(0, Math.min(wantsInput(r, good) - incoming(s, end, [good]), siloRoom(r) - incoming(s, end)));
  if (!isWorkshop(t.kind)) return 0;
  const group = RECIPES[t.kind].inputs.find((input) => input.options.includes(good));
  if (!group) return 0;
  const room = INPUT_CAP - totalStored(r.inputs) - incoming(s, end);
  return Math.max(0, Math.min(room, wantsInput(r, good) - incoming(s, end, group.options)));
}

/** A destination that wants a good, and how urgently (lower first). */
interface Want { end: Endpoint; at: Point2; good: Good; want: number; priority: number; fromFieldsOnly?: boolean; fromThing?: number }

/** Everything the homestead wants hauled now (to places on the cart's patch of ground), most urgent first. */
function wants(s: GameState, reach?: Reach): Want[] {
  const out: Want[] = [];
  const depot = s.things.find((t) => t.kind === 'depot'), bakery = s.things.find((t) => t.kind === 'bakery');
  const bakeryFed = () => {
    if (!bakery) return true;
    const r = s.sim.things.get(bakery.id);
    return !r || countOf(r.inputs, 'flour') + incoming(s, thingEnd(bakery.id), ['flour']) >= 1;
  };
  // 1. The Pantry Order (flour once the Bakery has its share).
  if (depot) {
    const at = dockOf(s, depot);
    if (at && within(s, reach, at)) for (const good of Object.keys(s.sim.brief.order.targets) as Good[]) {
      const want = depotWants(s, depot, good);
      if (want > 0) out.push({ end: thingEnd(depot.id), at, good, want, priority: good === 'flour' && !bakeryFed() ? 3.5 : 1 });
    }
  }
  // 2. Starved workshops: their preferred input first, the fallback only when none of the preferred is to be had.
  for (const t of s.things) {
    if (!isWorkshop(t.kind)) continue;
    const r = s.sim.things.get(t.id), at = r && dockOf(s, t);
    if (!r || !at || !within(s, reach, at)) continue;
    for (const input of RECIPES[t.kind].inputs) {
      for (const [k, good] of input.options.entries()) {
        if (k > 0 && input.options.slice(0, k).some((p) => sources(s, p, reach).some((src) => src.end.id !== t.id || src.end.kind !== 'thing'))) break;
        const want = thingWants(s, t, r, good);
        if (want > 0) out.push({ end: thingEnd(t.id), at, good, want, priority: 2 + k * 0.5 });
      }
    }
  }
  // 3 and 5. The Silo takes ripe harvests, and workshops' filling outputs.
  const silo = s.things.find((t) => t.kind === 'silo'), siloRt = silo && s.sim.things.get(silo.id), siloAt = silo && dockOf(s, silo);
  if (silo && siloRt && siloAt && within(s, reach, siloAt)) {
    // Each good only to its share of the Silo, so a glut of one (beans, say) never fills it against the rest: past that,
    // ripe fields hold their harvest until something wants it.
    const room = (good: Good) => thingWants(s, silo, siloRt, good);
    for (const good of ['wheat', 'beans'] as const) {
      const want = room(good);
      if (want > 0) out.push({ end: thingEnd(silo.id), at: siloAt, good, want, priority: 3, fromFieldsOnly: true });
    }
    for (const t of s.things) {
      const r = isWorkshop(t.kind) ? s.sim.things.get(t.id) : undefined;
      if (!r || totalStored(r.outputs) < 4) continue;
      for (const good of Object.keys(r.outputs) as Good[]) {
        const want = room(good);
        if (want > 0) out.push({ end: thingEnd(silo.id), at: siloAt, good, want, priority: 5, fromThing: t.id });
      }
    }
  }
  // 4. Compost to the poorest soil.
  for (const f of [...s.fields].sort((a, b) => a.fertility - b.fertility)) {
    if (f.fertility >= 0.8 || incoming(s, fieldEnd(f.id), ['compost']) > 0) continue;
    const at = fieldEdge(s, f);
    if (at && within(s, reach, at)) out.push({ end: fieldEnd(f.id), at, good: 'compost', want: 1, priority: 4 + f.fertility * 0.1 });
  }
  return out;
}

// --- Dispatch -----------------------------------------------------------------------------------------------------------

/** Which patch of drivable ground a cart stands on (undefined if it's on none: it weighs every place, as before). */
function cartReach(s: GameState, cart: Cart): Reach {
  const r = reachOf(s, cart, 'start');
  return r >= 0 ? r : undefined;
}

/** Gives an idle cart the most useful job it can reach; returns whether it found one. */
function dispatch(s: GameState, cart: Cart): boolean {
  const here = { x: cart.x, z: cart.z }, jobs: { job: CartJob; src: Point2; dst: Point2; score: number }[] = [];
  const reach = cartReach(s, cart);
  for (const w of wants(s, reach)) {
    for (const src of sources(s, w.good, reach)) {
      if (sameEnd(src.end, w.end)) continue;
      if (w.fromFieldsOnly && src.end.kind !== 'field') continue;
      if (w.fromThing !== undefined && src.end.id !== w.fromThing) continue;
      if (w.end.kind === 'thing' && src.silo && s.things.find((t) => t.id === w.end.id)?.kind === 'silo') continue;
      const count = Math.min(CART_CAPACITY, src.avail, w.want);
      if (count <= 0) continue;
      const job: CartJob = { from: src.end, to: w.end, good: w.good, count, priority: w.priority };
      // Within a priority, the shortest haul; a haul from the Silo only when nothing nearer the source has it.
      jobs.push({ job, src: src.at, dst: w.at, score: w.priority * 1000 + dist(here, src.at) + dist(src.at, w.at) + (src.silo ? 40 : 0) });
    }
  }
  jobs.sort((a, b) => a.score - b.score);
  for (const j of jobs.slice(0, 8)) {
    const toSrc = findPath(s, here, j.src);
    if (!toSrc || !findPath(s, j.src, j.dst)) continue;
    cart.job = j.job;
    setLeg(s, cart, 'toPickup', toSrc, j.job.from);
    cart.jobDesc = `Fetching ${j.job.count} ${GOOD_LABELS[j.job.good].label} from the ${endpointLabel(s, j.job.from)} for the ${endpointLabel(s, j.job.to)}`;
    return true;
  }
  return false;
}

/** Finds somewhere for the cargo a cart holds; returns whether it did. */
function routeCargo(s: GameState, cart: Cart): boolean {
  const cargo = cart.cargo;
  if (!cargo) return false;
  const here = { x: cart.x, z: cart.z };
  const reach = cartReach(s, cart);
  const options = wants(s, reach).filter((w) => w.good === cargo.good && !w.fromFieldsOnly && w.fromThing === undefined)
    .map((w) => ({ w, score: w.priority * 1000 + dist(here, w.at) }));
  // The Silo takes any good with room (its share of it), as the last resort.
  const silo = s.things.find((t) => t.kind === 'silo'), siloRt = silo && s.sim.things.get(silo.id), siloAt = silo && dockOf(s, silo);
  if (silo && siloRt && siloAt && within(s, reach, siloAt) && thingWants(s, silo, siloRt, cargo.good) >= cargo.count)
    options.push({ w: { end: thingEnd(silo.id), at: siloAt, good: cargo.good, want: cargo.count, priority: 6 }, score: 6000 + dist(here, siloAt) });
  options.sort((a, b) => a.score - b.score);
  for (const { w } of options.slice(0, 6)) {
    const path = findPath(s, here, w.at);
    if (!path) continue;
    cart.job = { from: { kind: 'thing', id: -1 }, to: w.end, good: cargo.good, count: cargo.count, priority: w.priority };
    setLeg(s, cart, 'toDropoff', path, w.end);
    cart.jobDesc = `Taking ${cargo.count} ${GOOD_LABELS[cargo.good].label} to the ${endpointLabel(s, w.end)}`;
    return true;
  }
  return false;
}

function setLeg(s: GameState, cart: Cart, state: CartState, path: Point2[], target: Endpoint | 'home') {
  cart.state = state;
  cart.path = path;
  cart.pathIdx = path.length > 1 ? 1 : path.length;
  cart.navKey = navFor(s).key;
  cart.targetLabel = target === 'home' ? 'Garage' : endpointLabel(s, target);
}

/** Sends a cart home to its parking spot (or leaves it where it is if it can't get there). */
function goHome(s: GameState, cart: Cart, why: string) {
  cart.job = null;
  const spot = parking(s, cart);
  if (!spot) { cart.state = 'idle'; cart.path = []; cart.jobDesc = 'Waiting: no way back to the Garage'; cart.wait = THINK_HOURS; return; }
  if (dist(spot, cart) < 0.5) { cart.state = cart.battery < 1 ? 'charging' : 'idle'; cart.path = []; cart.jobDesc = cart.battery < 1 ? 'Charging at the Garage' : 'Parked at the Garage'; return; }
  const path = findPath(s, cart, spot);
  if (!path) { cart.state = 'idle'; cart.path = []; cart.jobDesc = 'Waiting: no way back to the Garage'; cart.wait = THINK_HOURS; return; }
  setLeg(s, cart, 'returning', path, 'home');
  cart.jobDesc = why;
}

// --- Loading and unloading ----------------------------------------------------------------------------------------------

function pickUp(s: GameState, cart: Cart): boolean {
  const job = cart.job;
  if (!job) return false;
  let took = 0, stages = false;
  if (job.from.kind === 'field') {
    const f = fieldById(s, job.from.id);
    if (f && f.crop === job.good) {
      took = harvestField(s, f, Math.min(job.count, CART_CAPACITY));
      stages = took > 0;
    }
  } else {
    const r = thingById(s, job.from.id) && s.sim.things.get(job.from.id);
    if (r) took = takeGood(r.outputs, job.good, Math.min(job.count, CART_CAPACITY));
  }
  if (took === 0) { cart.job = null; cart.state = 'idle'; cart.jobDesc = 'Looking for work'; return false; }
  cart.cargo = { good: job.good, count: took };
  job.count = took;
  const dst = placeOf(s, job.to), path = dst && findPath(s, cart, dst);
  if (path) {
    setLeg(s, cart, 'toDropoff', path, job.to);
    cart.jobDesc = `Taking ${took} ${GOOD_LABELS[job.good].label} to the ${endpointLabel(s, job.to)}`;
  } else if (!routeCargo(s, cart)) goHome(s, cart, `Holding ${took} ${GOOD_LABELS[job.good].label}: nowhere to take it yet`);
  return stages;
}

/** How many of a cart's cargo an endpoint takes now. */
function accepts(s: GameState, end: Endpoint, good: Good, n: number): number {
  if (end.kind === 'field') {
    const f = fieldById(s, end.id);
    return f && good === 'compost' && f.fertility < 1 ? Math.min(n, 1) : 0;
  }
  const t = thingById(s, end.id), r = t && runtimeOf(s, end.id);
  if (!t || !r) return 0;
  if (t.kind === 'depot') {
    const o = s.sim.brief.order;
    return o.done ? 0 : Math.min(n, Math.max(0, (o.targets[good] ?? 0) - countOf(s.sim.delivered, good)));
  }
  if (t.kind === 'silo') return Math.min(n, siloRoom(r, good));
  if (isWorkshop(t.kind) && RECIPES[t.kind].inputs.some((input) => input.options.includes(good))) return Math.min(n, Math.max(0, INPUT_CAP - totalStored(r.inputs)));
  return 0;
}

const HARVESTS: readonly Good[] = ['wheat', 'beans'], CRAFTED: readonly Good[] = ['flour', 'eggs', 'bread'];

function dropOff(s: GameState, cart: Cart, events: SimEvent[]): void {
  const job = cart.job, cargo = cart.cargo;
  if (!job || !cargo) { goHome(s, cart, 'Heading back to the Garage'); return; }
  const n = accepts(s, job.to, cargo.good, cargo.count);
  if (n > 0) {
    if (job.to.kind === 'field') { const f = fieldById(s, job.to.id); if (f) for (let k = 0; k < n; k++) compostField(s, f); }
    else {
      const t = thingById(s, job.to.id), r = runtimeOf(s, job.to.id);
      if (t && r) {
        if (t.kind === 'depot') addGood(s.sim.delivered, cargo.good, n);
        else if (t.kind === 'silo') addGood(r.outputs, cargo.good, n);
        else addGood(r.inputs, cargo.good, n);
        milestone(s, t.kind, cargo.good, events);
      }
    }
    cargo.count -= n;
  }
  if (cargo.count <= 0) {
    cart.cargo = null;
    cart.job = null;
    if (cart.battery < CART_LOW) goHome(s, cart, 'Heading back to the Garage to charge');
    else { cart.state = 'idle'; cart.path = []; cart.jobDesc = 'Looking for work'; }
    return;
  }
  // Somewhere else must take the rest.
  cart.job = null;
  if (!routeCargo(s, cart)) goHome(s, cart, `Holding ${cargo.count} ${GOOD_LABELS[cargo.good].label}: nowhere to take it yet`);
}

/** The settlement's milestone drops: the first harvest stored, the first crafted good shipped. */
function milestone(s: GameState, kind: ThingKind, good: Good, events: SimEvent[]) {
  const sup = s.sim.supplies;
  const drop = kind === 'depot' ? (CRAFTED.includes(good) ? receiveDrop(sup, 'firstCraft') : undefined)
    : (kind === 'silo' || isWorkshop(kind)) && HARVESTS.includes(good) ? receiveDrop(sup, 'firstHarvest') : undefined;
  if (drop) events.push({ type: 'drop', message: `Settlement parcel arrived: +${drop.amount} Supplies for the ${drop.label.charAt(0).toLowerCase()}${drop.label.slice(1)}!` });
}

// --- Driving ------------------------------------------------------------------------------------------------------------

/** Whether a cart's job still has both its ends (or, carrying cargo, its destination). */
function jobStands(s: GameState, cart: Cart): boolean {
  const job = cart.job;
  if (!job) return true;
  const there = (e: Endpoint) => (e.kind === 'field' ? fieldById(s, e.id) !== undefined : thingById(s, e.id) !== undefined);
  if (cart.state === 'toPickup') return there(job.from) && there(job.to);
  return there(job.to);
}

/** The end a cart is driving to now. */
function legTarget(s: GameState, cart: Cart): Point2 | null {
  if (cart.state === 'returning') return parking(s, cart);
  if (!cart.job) return null;
  return placeOf(s, cart.state === 'toPickup' ? cart.job.from : cart.job.to);
}

/** Runs every cart for `dtSec` game-seconds (at 1×, 30 to a game hour). */
export function stepCarts(s: GameState, dtSec: number, hour: number, events: SimEvent[]): { moved: boolean; stagesChanged: boolean } {
  const dtH = dtSec / 30, nav = navFor(s);
  let moved = false, stagesChanged = false;
  const garage = garageOf(s), garageRt = garage && s.sim.things.get(garage.id);
  for (const cart of s.sim.carts) {
    cart.speed = 0;
    // The job's ends still stand?
    if (!jobStands(s, cart)) {
      if (cart.cargo) { cart.job = null; if (!routeCargo(s, cart)) goHome(s, cart, `Holding ${cart.cargo.count} ${GOOD_LABELS[cart.cargo.good].label}: its destination is gone`); }
      else goHome(s, cart, 'Its job is gone: heading back');
    }
    // The land changed under its path: find the way again.
    const driving = cart.state === 'toPickup' || cart.state === 'toDropoff' || cart.state === 'returning';
    if (driving && cart.navKey !== nav.key) {
      const target = legTarget(s, cart), path = target && findPath(s, cart, target);
      if (path) { cart.path = path; cart.pathIdx = path.length > 1 ? 1 : path.length; cart.navKey = nav.key; }
      else if (cart.cargo) { cart.job = null; if (!routeCargo(s, cart)) goHome(s, cart, `Holding ${cart.cargo.count} ${GOOD_LABELS[cart.cargo.good].label}: the way is cut`); }
      else goHome(s, cart, 'The way is cut: heading back');
    }

    // A cart parked or charging where the Garage no longer stands (it was moved) drives to where it is now; if the way
    // is cut, it waits where it is, charging nothing.
    // (An idle cart away from it already heads there when it finds no work.)
    if (cart.state === 'charging' && garage && !atGarage(s, cart)) goHome(s, cart, 'Heading to the Garage');
    if (cart.state === 'charging') {
      const rate = garageRt?.powered ? CHARGE_PER_HOUR : sunFactor(hour, s.season) > 0 ? TRICKLE_PER_HOUR : 0;
      cart.battery = Math.min(1, cart.battery + rate * dtH);
      cart.jobDesc = garageRt?.powered ? 'Charging at the Garage' : 'Charging slowly from the Garage roof';
    }
    if (cart.wait > 0) { cart.wait = Math.max(0, cart.wait - dtH); if (cart.wait > 0) continue; }

    switch (cart.state) {
      case 'charging': {
        if (cart.battery < CART_READY) break;
        if (cart.cargo ? routeCargo(s, cart) : dispatch(s, cart)) break;
        if (cart.battery >= 1) { cart.state = 'idle'; cart.jobDesc = 'Parked at the Garage'; }
        cart.wait = THINK_HOURS;
        break;
      }
      case 'idle': {
        if (cart.cargo ? routeCargo(s, cart) : cart.battery >= CART_LOW && dispatch(s, cart)) break;
        const spot = parking(s, cart);
        if (spot && dist(spot, cart) >= 0.5) goHome(s, cart, cart.battery < CART_LOW ? 'Heading back to the Garage to charge' : 'Heading back to the Garage');
        else if (spot && cart.battery < 1) { cart.state = 'charging'; cart.jobDesc = 'Charging at the Garage'; }
        else cart.wait = THINK_HOURS;
        break;
      }
      case 'returning': case 'toPickup': case 'toDropoff': {
        if (drive(s, cart, dtSec)) moved = true;
        if (cart.pathIdx < cart.path.length) break;
        // Arrived.
        if (cart.state === 'returning') {
          cart.state = cart.battery < 1 ? 'charging' : 'idle';
          cart.jobDesc = cart.battery < 1 ? 'Charging at the Garage' : 'Parked at the Garage';
          const g = garageOf(s);
          if (g) cart.yaw = g.yaw + Math.PI;
        } else if (cart.state === 'toPickup') {
          if (pickUp(s, cart)) stagesChanged = true;
          cart.wait = DWELL_HOURS;
        } else {
          dropOff(s, cart, events);
          cart.wait = DWELL_HOURS;
        }
        break;
      }
    }
    // A cart with work left but little charge finishes its haul, then heads home (dropOff sees to that).
  }
  return { moved, stagesChanged };
}

/** Drives a cart along its path for `dtSec`; returns whether it moved. */
function drive(s: GameState, cart: Cart, dtSec: number): boolean {
  let left = dtSec, movedAny = false;
  while (left > 1e-9 && cart.pathIdx < cart.path.length) {
    const to = cart.path[cart.pathIdx], dx = to.x - cart.x, dz = to.z - cart.z, d = Math.hypot(dx, dz);
    if (d < 1e-6) { cart.pathIdx++; continue; }
    const ground = groundAt(s, cart.x, cart.z);
    const v = CART_SPEED * ground.speed * (cart.battery > 0 ? 1 : LIMP);
    const step = Math.min(d, v * left);
    cart.x += (dx / d) * step; cart.z += (dz / d) * step;
    cart.yaw = Math.atan2(dx, dz);
    cart.battery = Math.max(0, cart.battery - DRAIN_PER_M * ground.drain * step);
    cart.speed = v;
    left -= step / v;
    movedAny = true;
    if (step >= d - 1e-9) { cart.x = to.x; cart.z = to.z; cart.pathIdx++; }
  }
  return movedAny;
}

/** How far a cart has to go along its path, m (for cards and tests). */
export function pathLeft(cart: Cart): number {
  let d = 0, at: Point2 = cart;
  for (let i = cart.pathIdx; i < cart.path.length; i++) { d += dist(at, cart.path[i]); at = cart.path[i]; }
  return d;
}

