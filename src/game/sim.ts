import {
  BELT, BUILDINGS, CROPS, DAY_SECONDS, FIELD, GROUP_NAMES, GROUPS, HIVE, INPUT_BATCHES, ITEMS, OUTPUT_BATCHES, PAD, POWER, recipeById,
  ROUTER_SECONDS, SAPLING_SECONDS, START_HOUR, TICK, TREE_HEALTH, type Ingredient, type ItemId, type Recipe,
} from './data.ts';
import { TERRAIN } from './map.ts';
import { networkOf, networks } from './power.ts';
import { noise1 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import {
  buildingAt, buildingById, centre, countTrees, DX, DY, layoutOf, left, opposite, reachTo, removeBuilding, right, sizeOf,
  STAT_BUCKET, STAT_BUCKETS, terrainAt, tileIndex, touchLayout, type BeltItem, type Building, type Dir, type GameState,
} from './state.ts';

// The simulation: one fixed step of TICK seconds at a time. Each step balances power, runs every building, moves goods
// out of buildings onto belts, along belts and through splitters, and into buildings, then updates the stats and goals.

// ---- Time, sun and wind ----

/** The hour of day, 0–24. */
export const hourAt = (time: number) => (START_HOUR + (time / DAY_SECONDS) * 24) % 24;
export const dayAt = (time: number) => 1 + Math.floor((time / DAY_SECONDS * 24 + START_HOUR) / 24);

/** Solar strength 0–1 (times the scenario's sun) at a time. */
export function sunAt(sc: Scenario, time: number) {
  const h = hourAt(time), w = sc.weather;
  if (h <= w.sunrise || h >= w.sunset) return 0;
  return w.sun * Math.sin(Math.PI * (h - w.sunrise) / (w.sunset - w.sunrise));
}

/** Wind strength 0–1 at a time: a smooth seeded curve around the scenario's mean. */
export function windAt(sc: Scenario, time: number) {
  const w = sc.weather;
  const n = noise1(time / 45, sc.seed + 77) * 0.7 + noise1(time / 11, sc.seed + 78) * 0.3;
  return Math.max(0.05, Math.min(1, w.wind + (n - 0.5) * 2 * w.gust));
}

// ---- Derived lookups, rebuilt when the layout changes ----

interface Out { belt: Building; side: Dir }

interface Derived {
  layout: number;
  /** Belts next to a building that take its goods, and the side they're on. */
  outs: Map<number, Out[]>;
  /** Sprinklers watering each field. */
  sprinklers: Map<number, Building[]>;
  /** Fields with a hive near enough to pollinate them. */
  pollinated: Set<number>;
  /** Fields near each hive. */
  flowers: Map<number, Building[]>;
  /** Wind turbines' shelter factor. */
  exposure: Map<number, number>;
  /** Sprinklers near water. */
  nearWater: Set<number>;
  /** Tiles under a field (the rest of the ground rests). */
  fielded: Set<number>;
}
const derivedCache = new WeakMap<GameState, Derived>();

function derived(s: GameState): Derived {
  const layout = layoutOf(s);
  let d = derivedCache.get(s);
  if (d && d.layout === layout) return d;
  d = { layout, outs: new Map(), sprinklers: new Map(), pollinated: new Set(), flowers: new Map(), exposure: new Map(), nearWater: new Set(), fielded: new Set() };
  const fields = s.buildings.filter((b) => b.type === 'field');
  const hives = s.buildings.filter((b) => b.type === 'hive');
  const sprinklers = s.buildings.filter((b) => b.type === 'sprinkler');
  for (const b of s.buildings) {
    if (b.type === 'belt' || b.type === 'splitter' || b.type === 'sorter' || b.type === 'crossing') continue;
    d.outs.set(b.id, beltsLeading(s, b));
  }
  for (const f of fields) {
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) d.fielded.add(tileIndex(s, x, y));
    const c = centre(f);
    d.sprinklers.set(f.id, sprinklers.filter((sp) => Math.max(Math.abs(sp.x + 0.5 - c.x), Math.abs(sp.y + 0.5 - c.y)) <= POWER.sprinklerReach + 0.5));
    if (hives.some((h) => reachTo(f, h.x, h.y) <= HIVE.reach)) d.pollinated.add(f.id);
  }
  for (const h of hives) d.flowers.set(h.id, fields.filter((f) => reachTo(f, h.x, h.y) <= HIVE.reach));
  for (const t of s.buildings) {
    if (t.type !== 'turbine') continue;
    let n = 0;
    const tall = new Set<Building>();
    for (let y = t.y - 2; y <= t.y + 2; y++) for (let x = t.x - 2; x <= t.x + 2; x++) {
      if ((x === t.x && y === t.y) || x < 0 || y < 0 || x >= s.map.width || y >= s.map.height) continue;
      const o = buildingAt(s, x, y);
      if (terrainAt(s, x, y) === TERRAIN.tree) n++;
      else if (o && o !== t && BUILDINGS[o.type].tall) tall.add(o);
    }
    n += tall.size;
    d.exposure.set(t.id, Math.max(POWER.shelterFloor, 1 - POWER.shelter * n));
  }
  for (const sp of sprinklers) {
    const r = POWER.waterNear;
    search: for (let y = sp.y - r; y <= sp.y + r; y++) for (let x = sp.x - r; x <= sp.x + r; x++) {
      if (x < 0 || y < 0 || x >= s.map.width || y >= s.map.height || Math.hypot(x - sp.x, y - sp.y) > r) continue;
      if (terrainAt(s, x, y) === TERRAIN.water) { d.nearWater.add(sp.id); break search; }
    }
  }
  derivedCache.set(s, d);
  return d;
}

/** The belts next to `b` that don't point into it (they take its goods), with the side each is on. */
function beltsLeading(s: GameState, b: Building): Out[] {
  const n = sizeOf(b), out: Out[] = [];
  const check = (x: number, y: number, side: Dir) => {
    const o = buildingAt(s, x, y);
    if (o && o.type === 'belt' && o.rot !== opposite(side) && !out.some((e) => e.belt === o) && !leadsInto(s, o, b)) out.push({ belt: o, side });
  };
  for (let i = 0; i < n; i++) {
    check(b.x + i, b.y - 1, 0);
    check(b.x + n, b.y + i, 1);
    check(b.x + i, b.y + n, 2);
    check(b.x - 1, b.y + i, 3);
  }
  return out;
}

/** Whether a belt line runs back into `b` within a few tiles (so `b` would be feeding its own input). */
function leadsInto(s: GameState, belt: Building, b: Building) {
  let cur: Building | null = belt;
  for (let i = 0; i < 8 && cur && cur.type === 'belt'; i++) {
    const next = buildingAt(s, cur.x + DX[cur.rot], cur.y + DY[cur.rot]);
    if (next === b) return true;
    cur = next;
  }
  return false;
}

export const outputsOf = (s: GameState, b: Building) => derived(s).outs.get(b.id) ?? [];
export const sprinklersOf = (s: GameState, b: Building) => derived(s).sprinklers.get(b.id) ?? [];
export const isPollinated = (s: GameState, b: Building) => derived(s).pollinated.has(b.id);
export const exposureOf = (s: GameState, b: Building) => derived(s).exposure.get(b.id) ?? 1;
export const nearWater = (s: GameState, b: Building) => derived(s).nearWater.has(b.id);

// ---- Soil ----

export function fieldFertility(s: GameState, f: Building) {
  let sum = 0;
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) sum += s.map.fertility[tileIndex(s, x, y)];
  return sum / 9;
}

function changeSoil(s: GameState, f: Building, by: number) {
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
    const i = tileIndex(s, x, y);
    s.map.fertility[i] = Math.max(0, Math.min(100, s.map.fertility[i] + by));
  }
}

/** Soil health: the average fertility of every field tile (50 with no fields), nudged by trees planted or cleared. */
export function soilHealth(s: GameState) {
  const fields = s.buildings.filter((b) => b.type === 'field');
  const base = fields.length ? fields.reduce((n, f) => n + fieldFertility(s, f), 0) / fields.length : 50;
  const trees = Math.max(-TREE_HEALTH.cap, Math.min(TREE_HEALTH.cap, (countTrees(s) - s.initialTrees) * TREE_HEALTH.perTree));
  return Math.max(0, Math.min(100, base + trees));
}

/** Growth per second of a field as a multiple of its crop's normal pace, and the parts it's made of. */
export function fieldPace(s: GameState, f: Building) {
  const wet = sprinklersOf(s, f).reduce((m, sp) => Math.max(m, shareOf(s, sp)), 0);
  const water = FIELD.dry + (1 - FIELD.dry) * wet;
  const soil = FIELD.poorSoil + (FIELD.richSoil - FIELD.poorSoil) * fieldFertility(s, f) / 100;
  return { pace: water * soil, water: wet, soil };
}

// ---- Machines ----

const members = (ing: Ingredient): readonly ItemId[] => ('item' in ing ? [ing.item] : GROUPS[ing.group]);
const held = (b: Building, ing: Ingredient) => members(ing).reduce((n, it) => n + (b.inputs![it] ?? 0), 0);
const ingName = (ing: Ingredient) => ('item' in ing ? ITEMS[ing.item].name.toLowerCase() : GROUP_NAMES[ing.group]);

export const recipeOf = (b: Building): Recipe | null => (b.recipe ? recipeById(b.recipe) : null);

function missing(b: Building, r: Recipe) {
  return r.inputs.find((ing) => held(b, ing) < ing.n) ?? null;
}

function outputsFit(b: Building, r: Recipe) {
  return r.outputs.find((o) => (b.outputs![o.item] ?? 0) + o.n > o.n * OUTPUT_BATCHES) ?? null;
}

function consume(b: Building, r: Recipe) {
  for (const ing of r.inputs) {
    let need = ing.n;
    // Take from whichever member there's most of.
    while (need > 0) {
      const it = [...members(ing)].sort((a, c) => (b.inputs![c] ?? 0) - (b.inputs![a] ?? 0))[0];
      b.inputs![it] = (b.inputs![it] ?? 0) - 1;
      if (!b.inputs![it]) delete b.inputs![it];
      need--;
    }
  }
}

/** Whether a building takes `item` from a belt right now. Takes it if so (the depot delivers it at once). */
export function accept(s: GameState, b: Building, item: ItemId): boolean {
  switch (b.type) {
    case 'depot': deliver(s, item); return true;
    case 'field':
      if (item !== 'compost' || b.compost! >= FIELD.compostStore) return false;
      b.compost!++; return true;
    case 'pad':
      if (b.mode !== 'send' || b.store!.length >= PAD.store) return false;
      b.store!.push(item); return true;
  }
  const r = recipeOf(b);
  if (!r) return false;
  const ing = r.inputs.find((i) => members(i).includes(item));
  if (!ing || held(b, ing) >= ing.n * INPUT_BATCHES) return false;
  b.inputs![item] = (b.inputs![item] ?? 0) + 1;
  return true;
}

function deliver(s: GameState, item: ItemId) {
  s.delivered[item] = (s.delivered[item] ?? 0) + 1;
  s.credits += ITEMS[item].price;
  s.earned += ITEMS[item].price;
  const bucket = s.stats.delivered[0];
  bucket[item] = (bucket[item] ?? 0) + 1;
}

function made(s: GameState, item: ItemId, n: number) {
  s.made[item] = (s.made[item] ?? 0) + n;
  const bucket = s.stats.made[0];
  bucket[item] = (bucket[item] ?? 0) + n;
}

// ---- Power ----

const shares = new WeakMap<GameState, Map<number, number>>();
/** The share of the power it wanted that a building got last step (1 for buildings that need none). */
export function shareOf(s: GameState, b: Building) {
  if (!BUILDINGS[b.type].power) return 1;
  return shares.get(s)?.get(b.id) ?? 0;
}

/** Watts a building wants this step. */
export function wants(s: GameState, b: Building): number {
  const def = BUILDINGS[b.type];
  if (!def.power) return 0;
  if (b.type === 'sprinkler') return nearWater(s, b) ? POWER.sprinklerNearWater : POWER.sprinklerFar;
  if (b.type === 'pad') return b.drone!.phase === 'home' ? 0 : def.power;
  const r = recipeOf(b);
  if (!r) return 0;
  if (b.progress !== null && b.progress !== undefined) return def.power;
  return !missing(b, r) && !outputsFit(b, r) ? def.power : 0;
}

/** Watts a generator makes this step. */
export function makes(s: GameState, b: Building, sun: number, wind: number): number {
  switch (b.type) {
    case 'solar': return POWER.solar * sun;
    case 'turbine': return POWER.turbine * wind * exposureOf(s, b);
    case 'digester': return b.progress !== null && b.progress !== undefined ? POWER.digester : 0;
    default: return 0;
  }
}

function balancePower(s: GameState, sun: number, wind: number, dt: number) {
  const map = new Map<number, number>();
  for (const net of networks(s).list) {
    let made = 0, wanted = 0, stored = 0, capacity = 0;
    const batteries: Building[] = [];
    for (const b of net.members) {
      made += makes(s, b, sun, wind);
      wanted += wants(s, b);
      if (b.type === 'battery') { batteries.push(b); stored += b.charge!; capacity += POWER.battery.capacity; }
    }
    let share = 1;
    if (made >= wanted) {
      let spare = (made - wanted) * dt;
      for (const bat of batteries) {
        const add = Math.min(spare, POWER.battery.rate * dt, POWER.battery.capacity - bat.charge!);
        bat.charge! += add; spare -= add;
      }
    } else {
      let short = (wanted - made) * dt, given = 0;
      for (const bat of batteries) {
        const take = Math.min(short, POWER.battery.rate * dt, bat.charge!);
        bat.charge! -= take; short -= take; given += take;
      }
      share = wanted > 0 ? Math.min(1, (made + given / dt) / wanted) : 1;
      if (share > 0.999) share = 1;
    }
    net.made = made; net.wanted = wanted; net.share = share;
    net.stored = batteries.reduce((n, b) => n + b.charge!, 0); net.capacity = capacity;
    for (const b of net.members) map.set(b.id, share);
  }
  shares.set(s, map);
}

// ---- Belts and routers ----

/** Puts `item` onto belt `belt` coming from direction `travel` (the way it's moving), if there's room. */
function ontoBelt(belt: Building, item: ItemId, travel: Dir): boolean {
  if (belt.rot === opposite(travel)) return false;
  const items = belt.items!;
  if (belt.rot === travel) {
    const last = items[items.length - 1];
    if (last && last.pos < BELT.spacing) return false;
    items.push({ item, pos: 0, step: stepNo });
    return true;
  }
  // From the side: it joins in the middle of the belt.
  const at = 0.5;
  if (items.some((it) => Math.abs(it.pos - at) < BELT.spacing)) return false;
  const i = items.findIndex((it) => it.pos < at);
  items.splice(i < 0 ? items.length : i, 0, { item, pos: at, step: stepNo });
  return true;
}

const isRouter = (b: Building) => b.type === 'splitter' || b.type === 'sorter' || b.type === 'crossing';

/** Hands `item`, moving in direction `travel`, to whatever is on the tile at (x, y). */
function handTo(s: GameState, x: number, y: number, item: ItemId, travel: Dir): boolean {
  const nb = buildingAt(s, x, y);
  if (!nb) return false;
  if (nb.type === 'belt') return ontoBelt(nb, item, travel);
  if (isRouter(nb)) {
    const from = opposite(travel);
    if (nb.type === 'crossing') {
      if (nb.transit!.some((t) => t.from % 2 === from % 2)) return false;
    } else if (nb.transit!.length >= 1) return false;
    nb.transit!.push({ item, from, t: ROUTER_SECONDS });
    return true;
  }
  return accept(s, nb, item);
}

function moveBelt(s: GameState, b: Building, dt: number) {
  const items = b.items!;
  if (!items.length) { b.status = 'idle'; return; }
  const step = BELT.speed * dt;
  // The front good keeps its distance from the last one on the belt ahead, if that runs the same way.
  const ahead = buildingAt(s, b.x + DX[b.rot], b.y + DY[b.rot]);
  const tail = ahead?.type === 'belt' && ahead.rot === b.rot ? ahead.items![ahead.items!.length - 1] : undefined;
  const frontLimit = tail ? Math.min(1, tail.pos + 1 - BELT.spacing) : 1;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    // A good that came onto this belt during this step has moved already (whichever order the belts are in).
    if (it.step === stepNo) continue;
    const limit = i === 0 ? frontLimit : items[i - 1].pos - BELT.spacing;
    it.pos = Math.max(it.pos, Math.min(it.pos + step, limit));
  }
  const front = items[0];
  if (front.pos >= 1) {
    if (handTo(s, b.x + DX[b.rot], b.y + DY[b.rot], front.item, b.rot)) items.shift();
  }
  b.status = items.length && items[0].pos >= 1 && items.length * BELT.spacing >= 1 ? 'blocked' : 'ok';
}

function routeOut(s: GameState, b: Building, dt: number) {
  const tr = b.transit!;
  for (let i = 0; i < tr.length; i++) {
    const t = tr[i];
    t.t -= dt;
    if (t.t > 0) continue;
    const travel = opposite(t.from);
    // Exits in a fixed order of compass directions, so goods coming in from several sides still take turns between them.
    let exits: Dir[];
    if (b.type === 'crossing') exits = [travel];
    else if (b.type === 'sorter') exits = b.filter && t.item === b.filter ? [b.rot] : b.filter ? [left(b.rot), right(b.rot)] : [b.rot];
    else exits = ([0, 1, 2, 3] as Dir[]).filter((d) => d !== t.from);
    exits.sort((a, c) => a - c);
    const n = exits.length, start = exits.findIndex((d) => d >= b.turn!);
    for (let k = 0; k < n; k++) {
      const d = exits[((start < 0 ? 0 : start) + k) % n];
      if (handTo(s, b.x + DX[d], b.y + DY[d], t.item, d)) {
        b.turn = (d + 1) % 4;
        tr.splice(i, 1); i--;
        break;
      }
    }
  }
  b.status = tr.some((t) => t.t <= 0) ? 'blocked' : tr.length ? 'ok' : 'idle';
}

/** Moves one good from a building's outputs onto each belt beside it that takes goods and has room. */
function pushOut(s: GameState, b: Building) {
  const belts = outputsOf(s, b);
  if (!belts.length) return;
  const goods = outputGoods(b);
  if (!goods.length) return;
  for (let k = 0; k < belts.length; k++) {
    const { belt, side } = belts[((b.turn ?? 0) + k) % belts.length];
    // Each belt takes the next kind of good in turn, so a mill's flour and bran share its belts.
    for (let g = 0; g < goods.length; g++) {
      const item = goods[((b.turn ?? 0) + g) % goods.length];
      if (!has(b, item)) continue;
      if (ontoBelt(belt, item, side)) { take(b, item); b.turn = ((b.turn ?? 0) + 1) % 997; break; }
    }
  }
}

function outputGoods(b: Building): ItemId[] {
  if (b.type === 'field') return b.stored! > 0 ? [b.harvest ?? b.crop!] : [];
  if (b.type === 'hive') return b.stored! > 0 ? ['honey'] : [];
  if (b.type === 'pad') return b.mode === 'receive' && b.store!.length ? [b.store![0]] : [];
  if (b.outputs) return Object.keys(b.outputs).filter((k) => b.outputs![k as ItemId]! > 0) as ItemId[];
  return [];
}
function has(b: Building, item: ItemId) {
  if (b.type === 'field' || b.type === 'hive') return b.stored! > 0;
  if (b.type === 'pad') return b.store!.length > 0 && b.store![0] === item;
  return (b.outputs?.[item] ?? 0) > 0;
}
function take(b: Building, item: ItemId) {
  if (b.type === 'field' || b.type === 'hive') { b.stored!--; if (!b.stored) b.harvest = b.crop; return; }
  if (b.type === 'pad') { b.store!.shift(); return; }
  b.outputs![item]! -= 1;
  if (!b.outputs![item]) delete b.outputs![item];
}

// ---- Buildings ----

function runMachine(s: GameState, b: Building, dt: number) {
  const r = recipeOf(b)!;
  const def = BUILDINGS[b.type];
  const share = shareOf(s, b);
  if (b.progress === null || b.progress === undefined) {
    const lack = missing(b, r), full = outputsFit(b, r);
    if (lack) { b.status = 'input'; b.need = ingName(lack); return; }
    if (full) { b.status = 'blocked'; b.need = ITEMS[full.item].name.toLowerCase(); return; }
    if (def.power && share <= 0) { b.status = 'power'; b.need = undefined; return; }
    consume(b, r);
    b.progress = 0;
  }
  // The digester is a generator: it burns at its own pace.
  const pace = def.power ? share : 1;
  b.progress! += dt * pace;
  b.status = pace <= 0 ? 'power' : pace < 1 ? 'lowpower' : 'ok';
  b.need = undefined;
  if (b.progress! >= r.time) {
    for (const o of r.outputs) { b.outputs![o.item] = (b.outputs![o.item] ?? 0) + o.n; made(s, o.item, o.n); }
    b.progress = null;
  }
}

function runField(s: GameState, f: Building, dt: number) {
  const crop = CROPS[f.crop!];
  if (f.compost! > 0 && fieldFertility(s, f) < FIELD.compostBelow) { f.compost!--; changeSoil(s, f, FIELD.compostGain); }
  const bonus = crop.flowers && isPollinated(s, f) ? 1 : 0;
  // A harvest of the old crop waits to go before the new one can join it.
  const old = f.stored! > 0 && (f.harvest ?? f.crop) !== f.crop;
  if (old || f.stored! + crop.yield + bonus > FIELD.store) { f.status = 'blocked'; f.need = CROPS[f.harvest ?? f.crop!].name.toLowerCase(); return; }
  const p = fieldPace(s, f);
  f.growth! += dt * p.pace / crop.grow;
  f.status = p.water < 1 ? 'dry' : 'ok';
  f.need = undefined;
  if (f.growth! >= 1) {
    f.growth = 0;
    f.stored! += crop.yield + bonus;
    f.harvest = f.crop;
    made(s, f.crop!, crop.yield + bonus);
    changeSoil(s, f, crop.soil);
  }
}

/** Flowering fields a hive gathers from (up to HIVE.maxFlowers count). */
export function flowersNear(s: GameState, h: Building) {
  return Math.min(HIVE.maxFlowers, (derived(s).flowers.get(h.id) ?? []).filter((f) => CROPS[f.crop!].flowers).length);
}

function runHive(s: GameState, h: Building, dt: number) {
  const flowers = flowersNear(s, h);
  if (!flowers) { h.status = 'flowers'; return; }
  if (h.stored! >= HIVE.store) { h.status = 'blocked'; h.need = 'honey'; return; }
  h.growth! += dt * flowers / HIVE.honeySeconds;
  h.status = 'ok';
  if (h.growth! >= 1) { h.growth = 0; h.stored!++; made(s, 'honey', 1); }
}

/** Where a pad's drone is flying to: its linked pad or the depot, if it's a valid target. */
export function padTarget(s: GameState, p: Building): Building | null {
  const t = p.link ? buildingById(s, p.link) : null;
  if (!t || !(t.type === 'depot' || (t.type === 'pad' && t.mode === 'receive'))) return null;
  return padDistance(p, t) <= PAD.range ? t : null;
}
export function padDistance(a: Building, b: Building) {
  const ca = centre(a), cb = centre(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}

function runPad(s: GameState, p: Building, dt: number) {
  if (p.mode === 'receive') {
    p.status = p.store!.length >= PAD.receiveStore ? 'blocked' : p.store!.length ? 'ok' : 'idle';
    p.need = p.status === 'blocked' ? 'its goods' : undefined;
    return;
  }
  const d = p.drone!, share = shareOf(s, p);
  const target = d.target ? buildingById(s, d.target) : null;
  const dist = target ? Math.max(1, padDistance(p, target)) : 1;
  switch (d.phase) {
    case 'home': {
      const t = padTarget(s, p);
      if (!t) { p.status = 'nolink'; return; }
      if (!p.store!.length) { p.status = 'input'; p.need = 'goods to send'; p.waited = 0; return; }
      p.waited! += dt;
      if (p.store!.length < PAD.cargo && p.waited! < PAD.waitSeconds) { p.status = 'ok'; return; }
      d.cargo = p.store!.splice(0, PAD.cargo);
      d.phase = 'out'; d.t = 0; d.target = t.id; p.waited = 0;
      p.status = 'ok';
      return;
    }
    case 'out':
      if (!target) { d.phase = 'back'; return; }
      d.t += dt * PAD.speed * share / dist;
      p.status = share <= 0 ? 'power' : share < 1 ? 'lowpower' : 'ok';
      if (d.t >= 1) { d.t = 1; d.phase = 'hover'; }
      return;
    case 'hover':
      // The target may have gone, or stopped receiving, while the drone flew: then it takes the goods home.
      if (!target || !(target.type === 'depot' || (target.type === 'pad' && target.mode === 'receive'))) { d.phase = 'back'; d.t = 0; return; }
      if (target.type === 'depot') { for (const it of d.cargo) deliver(s, it); d.cargo = []; }
      else if (target.store!.length + d.cargo.length <= PAD.receiveStore) { target.store!.push(...d.cargo); d.cargo = []; }
      if (d.cargo.length) { p.status = 'blocked'; p.need = 'room at the receiving pad'; return; }
      d.phase = 'back'; d.t = 0;
      return;
    case 'back':
      d.t += dt * PAD.speed * Math.max(share, target ? 0 : 1) / dist;
      p.status = share <= 0 ? 'power' : 'ok';
      if (d.t >= 1 || !target) {
        // Goods it couldn't deliver (the target went) go back on the pad, first in line.
        if (d.cargo.length) { p.store!.unshift(...d.cargo); d.cargo = []; }
        d.phase = 'home'; d.t = 0; d.target = 0;
      }
      return;
  }
}

// ---- The step ----

/** Advances the game by `seconds` of play, in fixed steps; at most `maxSteps` of them (the rest is dropped, so a slow frame
 * can't snowball). */
export function advance(s: GameState, seconds: number, maxSteps = Infinity) {
  s.carry += seconds;
  let n = 0;
  while (s.carry >= TICK - 1e-9 && n < maxSteps) { tick(s); s.carry -= TICK; n++; }
  if (n >= maxSteps) s.carry = 0;
}

/** Counts steps, so goods handed from belt to belt move once per step. */
let stepNo = 0;

export function tick(s: GameState) {
  stepNo++;
  const dt = TICK;
  s.time += dt;
  const sun = sunAt(s.scenario, s.time), wind = windAt(s.scenario, s.time);
  balancePower(s, sun, wind, dt);
  const grown: Building[] = [];
  for (const b of s.buildings) {
    switch (b.type) {
      case 'belt': case 'splitter': case 'sorter': case 'crossing': case 'depot': break;
      case 'field': runField(s, b, dt); break;
      case 'hive': runHive(s, b, dt); break;
      case 'pad': runPad(s, b, dt); break;
      case 'sprinkler': case 'battery': case 'pylon': case 'solar': case 'turbine': {
        const net = b.type === 'pylon' ? null : networkOf(s, b);
        if (b.type !== 'pylon' && !net) { b.status = 'nolink'; break; }
        if (b.type === 'sprinkler') { const sh = shareOf(s, b); b.status = sh <= 0 ? 'power' : sh < 1 ? 'lowpower' : 'ok'; }
        else if (b.type === 'solar') b.status = sun > 0 ? 'ok' : 'idle';
        else b.status = 'ok';
        break;
      }
      case 'sapling':
        b.age! += dt;
        b.status = 'ok';
        if (b.age! >= SAPLING_SECONDS) grown.push(b);
        break;
      default:
        if (b.recipe) {
          runMachine(s, b, dt);
          if (b.type === 'digester' && !networkOf(s, b) && b.status === 'ok') b.status = 'nolink';
        }
    }
  }
  for (const b of grown) {
    removeBuilding(s, b);
    s.map.terrain[tileIndex(s, b.x, b.y)] = TERRAIN.tree;
  }
  if (grown.length) touchLayout(s);
  for (const b of s.buildings) if (b.type !== 'belt' && !isRouter(b)) pushOut(s, b);
  for (const b of s.buildings) if (isRouter(b)) routeOut(s, b, dt);
  for (const b of s.buildings) if (b.type === 'belt') moveBelt(s, b, dt);
  // Once a second, ground without a field recovers a little.
  if (Math.floor(s.time + 1e-6) !== Math.floor(s.time - dt + 1e-6)) rest(s);
  updateStats(s);
  updateGoals(s);
}

function rest(s: GameState) {
  const fielded = derived(s).fielded, f = s.map.fertility, base = s.soilBase;
  for (let i = 0; i < f.length; i++) if (f[i] < base[i] && !fielded.has(i)) f[i] = Math.min(base[i], f[i] + FIELD.rest);
}

function updateStats(s: GameState) {
  const st = s.stats;
  if (s.time - st.since >= STAT_BUCKET) {
    st.since += STAT_BUCKET;
    st.made.unshift({}); st.delivered.unshift({});
    if (st.made.length > STAT_BUCKETS) st.made.length = STAT_BUCKETS;
    if (st.delivered.length > STAT_BUCKETS) st.delivered.length = STAT_BUCKETS;
  }
}

/** Per-minute rate of a good over the last minute, from the stat buckets. */
export function ratePerMin(s: GameState, item: ItemId, which: 'made' | 'delivered') {
  const buckets = s.stats[which], into = s.time - s.stats.since;
  const minute = STAT_BUCKET * (STAT_BUCKETS - 1);
  // The newest buckets whole; the oldest only for the part of it still inside the last minute.
  let total = 0;
  buckets.forEach((b, i) => {
    const n = b[item] ?? 0;
    total += i === STAT_BUCKETS - 1 ? n * Math.max(0, 1 - into / STAT_BUCKET) : n;
  });
  const span = Math.min(s.time, minute);
  return span > 0 ? total / span * 60 : 0;
}

export function goalDone(s: GameState, i: number): boolean {
  const g = s.scenario.goals[i];
  if (g.kind === 'deliver') return (s.delivered[g.item] ?? 0) >= g.n;
  if (g.kind === 'rate') return s.reached[i];
  return soilHealth(s) >= g.min;
}

function updateGoals(s: GameState) {
  const goals = s.scenario.goals;
  goals.forEach((g, i) => {
    // A rate goal counts only once a full minute of deliveries has been measured.
    if (g.kind === 'rate' && !s.reached[i] && s.time >= 60 && ratePerMin(s, g.item, 'delivered') >= g.perMin) s.reached[i] = true;
  });
  if (s.completedAt === null && goals.length && goals.every((_, i) => goalDone(s, i))) s.completedAt = s.time;
}

export type Medal = 'gold' | 'silver' | 'bronze';
export function medalFor(par: number, time: number): Medal {
  return time <= par ? 'gold' : time <= par * 1.5 ? 'silver' : 'bronze';
}

/** One line on what a building is doing, for the hover and the inspector. */
export function describeStatus(s: GameState, b: Building): string {
  const def = BUILDINGS[b.type];
  switch (b.status) {
    case 'input': return `Waiting for ${b.need ?? 'goods'}`;
    case 'blocked': return `Output blocked: nowhere for ${b.need ?? 'its goods'} to go`;
    case 'power': return networkOf(s, b) ? 'No power: the network is out of power' : 'No power: not in reach of a pylon';
    case 'lowpower': return `Low power: running at ${Math.round(shareOf(s, b) * 100)}%`;
    case 'nolink':
      if (b.type === 'pad') return 'Not linked: select it and link it to a receiving pad or the depot';
      return 'Not connected: no pylon in reach';
    case 'flowers': return 'No flowering fields within 4 tiles';
    case 'idle':
      if (b.type === 'solar') return 'Night: no sun';
      if (b.type === 'belt') return 'Empty';
      return 'Idle';
    case 'dry': return `Growing ${CROPS[b.crop!].name.toLowerCase()} slowly: no water`;
    case 'ok':
      if (b.type === 'field') return `Growing ${CROPS[b.crop!].name.toLowerCase()}`;
      return b.recipe ? 'Working' : def.name;
  }
}
