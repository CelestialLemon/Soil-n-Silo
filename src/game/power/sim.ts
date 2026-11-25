// The live power (Milestone 2): each wireless network (power/radius.ts) shares what its producers make and what its
// batteries hold. Solar canopies follow the sun and the clouds, wind turbines the live gusts, water wheels the brook
// (steady, day and night). Batteries soak up the surplus and carry the homestead through the night; when a network
// can't meet its demand, it sheds its workshops first (they pause), and that is a blackout.
import { chargingAtGarage } from '../carts.ts';
import { CATALOG } from '../catalog.ts';
import { formatClock, isNight, sunFactor } from '../clock.ts';
import { clamp } from '../geom.ts';
import { must } from '../result.ts';
import type { GameState, Thing } from '../state.ts';
import { describeRuntime, syncRuntime, type ThingRuntime } from '../workshops.ts';
import { feeds, roleOf } from './nodes.ts';
import { networksOf } from './radius.ts';

/** What the world tells the simulation each step: plain numbers, read from brush3d's live sky and wind. */
export interface SimEnv {
  /** The world's clock at the end of the step (0..24). Left out, the simulation keeps its own clock. */
  hour?: number;
  /** The live wind (brush3d's WindRecipe speed), m/s. */
  windSpeed: number;
  /** 0..1: how overcast the sky is. */
  cloudCover: number;
}

export const SOLAR_PEAK_W = 3;
/** How much a full overcast dims a canopy. */
export const CLOUD_DIM = 0.55;
export const TURBINE_BASE_W = 0.5, TURBINE_SPAN_W = 4, TURBINE_FULL_WIND = 12;
export const WATERWHEEL_W = 3.2;
/** A Battery's store and the most it gives or takes. A new one is built empty (workshops.ts). */
export const BATTERY_WH = 18, BATTERY_RATE_W = 6;
/** The Garage's draw while it charges a cart, and idle. */
export const GARAGE_CHARGE_W = 1.5, GARAGE_IDLE_W = 0.2;
/** The Farmhouse's draw at night (lamps lit) and by day. */
export const FARMHOUSE_NIGHT_W = 0.5, FARMHOUSE_DAY_W = 0.2;

export interface PowerNetwork {
  /** Its root emitter's thing id. */
  id: number;
  /** Its sources, batteries and relays, and the loads it powers, by thing id. */
  emitters: number[]; loads: number[];
  generationW: number;
  /** What its loads asked for, and what it gave them. */
  demandW: number; servedW: number;
  batteryWh: number; batteryCapWh: number;
  /** Some load went without (its workshops paused, or worse). */
  blackout: boolean;
  /** Fed by a source or a store at all. */
  fed: boolean;
}

export interface PowerSummary {
  totalGenW: number; totalDemandW: number; totalStoredWh: number; totalCapWh: number;
  anyBlackout: boolean;
  /** Why the last blackout happened, in plain words (empty until one has). */
  lastBlackoutReason: string;
}

/** A producer's watts now. */
export function generationOf(s: GameState, t: Thing, hour: number, env: SimEnv): number {
  switch (t.kind) {
    case 'solar': return sunFactor(hour, s.season) * (1 - CLOUD_DIM * clamp(env.cloudCover, 0, 1)) * SOLAR_PEAK_W * (1 - treeShade(s, t));
    case 'turbine': return (TURBINE_BASE_W + clamp(env.windSpeed / TURBINE_FULL_WIND, 0, 1) * TURBINE_SPAN_W) * ridge(s, t);
    case 'waterwheel': return WATERWHEEL_W;
    default: return 0;
  }
}

/** How much nearby trees shade a canopy: a fifth of its light for each trunk right beside it, at most half. */
function treeShade(s: GameState, t: Thing): number {
  let n = 0;
  for (const tr of [...s.wildTrees, ...s.plantedTrees]) if (Math.hypot(tr.x - t.x, tr.z - t.z) <= 3.5 + 2 * tr.scale) n++;
  return Math.min(0.5, 0.2 * n);
}

/** A turbine catches more wind standing high and open, less down in a hollow (against the homestead's ground). */
function ridge(s: GameState, t: Thing): number {
  const home = s.things.find((v) => v.kind === 'farmhouse');
  const base = home ? home.padTargetY : t.padTargetY;
  return 1 + clamp((t.padTargetY - base) / 8, -0.15, 0.25);
}

/** A load's watts now: workshops while they work, the farmhouse's lamps at night, the garage while it charges a cart
 * parked at it (not one left at its old site after it moved). */
export function demandOf(s: GameState, t: Thing, r: ThingRuntime, hour: number): number {
  const def = CATALOG[t.kind];
  switch (t.kind) {
    case 'farmhouse': return isNight(hour, s.season) ? FARMHOUSE_NIGHT_W : FARMHOUSE_DAY_W;
    case 'garage': return s.sim.carts.some((c) => chargingAtGarage(s, c)) ? GARAGE_CHARGE_W : GARAGE_IDLE_W;
    case 'lantern': return isNight(hour, s.season) ? def.powerDemand : 0;
    case 'mill': case 'bakery': case 'coop': return r.working ? def.powerDemand : 0;
    default: return 0;
  }
}

/** Who goes without first when a network runs short: workshops pause before the hens, the garage and the home go dark. */
const SHED_ORDER: Partial<Record<Thing['kind'], number>> = { farmhouse: 0, garage: 1, coop: 2, lantern: 3, mill: 4, bakery: 5 };

/**
 * Runs the power for `dtH` game hours at `hour`; returns the networks that fell into a blackout on this step. With `dtH`
 * 0 it only reads the power as it stands (refreshPower): a battery with any charge can give its rate, and none is drawn.
 */
export function stepPower(s: GameState, dtH: number, hour: number, env: SimEnv): PowerNetwork[] {
  const rt = s.sim.things, { emitters, netOf, loads, loadNets } = networksOf(s);
  const was = new Map(s.sim.networks.map((n) => [n.id, n.blackout]));
  const nets = new Map<number, PowerNetwork & { batteries: ThingRuntime[] }>();
  const nets_ = (id: number) => must(nets.get(id), 'a power network');
  emitters.forEach((e, i) => {
    const root = emitters[netOf[i]].id;
    let n = nets.get(root);
    if (!n) {
      n = { id: root, emitters: [], loads: [], generationW: 0, demandW: 0, servedW: 0, batteryWh: 0, batteryCapWh: 0, blackout: false, fed: false, batteries: [] };
      nets.set(root, n);
    }
    n.emitters.push(e.id);
    if (feeds(roleOf(e))) n.fed = true;
    const r = rt.get(e.id);
    if (!r) return;
    r.powerNetId = root;
    r.watts = generationOf(s, e, hour, env);
    n.generationW += r.watts;
    if (e.kind === 'battery') { n.batteries.push(r); n.batteryWh += r.charge * BATTERY_WH; n.batteryCapWh += BATTERY_WH; }
  });

  // Each load stands in the fields of zero or more networks, and draws from whichever of the fed ones has the most to spare.
  const asks: { t: Thing; r: ThingRuntime; nets: PowerNetwork[]; w: number }[] = [];
  loads.forEach((l, k) => {
    const r = rt.get(l.id);
    if (!r) return;
    const nets = [...loadNets[k]].map((i) => nets_(emitters[i].id)).sort((a, b) => a.id - b.id);
    asks.push({ t: l, r, nets, w: demandOf(s, l, r, hour) });
  });
  asks.sort((a, b) => (SHED_ORDER[a.t.kind] ?? 9) - (SHED_ORDER[b.t.kind] ?? 9) || a.t.id - b.t.id);

  // Serve the loads in order while the networks' producers and batteries can.
  const canGive = (n: { batteries: ThingRuntime[]; batteryWh: number }) => {
    const rate = n.batteries.length * BATTERY_RATE_W;
    return dtH > 0 ? Math.min(rate, n.batteryWh / dtH) : n.batteryWh > 1e-9 ? rate : 0;
  };
  const left = new Map([...nets.values()].map((n) => [n.id, n.generationW + canGive(n)]));
  const short: Thing[] = [];
  for (const a of asks) {
    const fed = a.nets.filter((n) => n.fed);
    let best: PowerNetwork | undefined;
    for (const n of fed) if (!best || (left.get(n.id) ?? 0) > (left.get(best.id) ?? 0) + 1e-9) best = n;
    const net = best ?? a.nets[0];
    a.r.powerNetId = net ? net.id : -1;
    if (net) { net.loads.push(a.t.id); net.demandW += a.w; }
    if (!best) { a.r.powered = false; a.r.watts = 0; continue; }
    const have = left.get(best.id) ?? 0;
    if (a.w <= have + 1e-9) {
      left.set(best.id, have - a.w);
      best.servedW += a.w;
      a.r.powered = true; a.r.watts = a.w;
    } else {
      best.blackout = true;
      a.r.powered = false; a.r.watts = 0;
      short.push(a.t);
    }
  }
  // Emitters are powered when their network is fed.
  for (const n of nets.values()) for (const id of n.emitters) { const r = rt.get(id); if (r) r.powered = n.fed; }

  // The batteries take the surplus or cover the shortfall, sharing one level across the network.
  for (const n of nets.values()) {
    if (n.batteries.length === 0) continue;
    const rate = n.batteries.length * BATTERY_RATE_W, net = n.generationW - n.servedW;
    const delta = net >= 0 ? Math.min(net, rate) * dtH : -Math.min(-net, rate) * dtH;
    n.batteryWh = clamp(n.batteryWh + delta, 0, n.batteryCapWh);
    const level = n.batteryCapWh > 0 ? n.batteryWh / n.batteryCapWh : 0;
    for (const b of n.batteries) b.charge = level;
  }

  const fresh: PowerNetwork[] = [];
  const out = [...nets.values()].map((n): PowerNetwork => ({
    id: n.id, emitters: n.emitters, loads: n.loads, generationW: n.generationW, demandW: n.demandW, servedW: n.servedW,
    batteryWh: n.batteryWh, batteryCapWh: n.batteryCapWh, blackout: n.blackout, fed: n.fed,
  }));
  for (const n of out) if (n.blackout && was.get(n.id) !== true) fresh.push(n);
  s.sim.networks = out;
  const sum = s.sim.powerSummary;
  sum.totalGenW = out.reduce((v, n) => v + n.generationW, 0);
  sum.totalDemandW = out.reduce((v, n) => v + n.demandW, 0);
  sum.totalStoredWh = out.reduce((v, n) => v + n.batteryWh, 0);
  sum.totalCapWh = out.reduce((v, n) => v + n.batteryCapWh, 0);
  sum.anyBlackout = out.some((n) => n.blackout);
  if (fresh.length > 0) {
    const names = [...new Set(short.map((t) => CATALOG[t.kind].label))].join(' and ');
    const hasStore = fresh.some((n) => n.batteryCapWh > 0);
    const fix = hasStore ? 'add a Water Wheel or another Battery' : 'add a Battery or a Water Wheel';
    sum.lastBlackoutReason = `Blackout on ${formatClock(s.sim.day, hour)}: the ${names} went without power. To carry it, ${fix}.`;
  }
  return fresh;
}

/**
 * Reads the power again as the homestead stands now, with no time passing: what each network makes and asks for, what's
 * powered, any blackout and the totals, and each building's card. Batteries keep their charge, and recipes, carts, the
 * clock and the brief stay put. For an edit or a jump of the clock while the game is paused, so the power view and the
 * workshops' lights show it at once. Returns the networks it found newly in a blackout.
 */
export function refreshPower(s: GameState, env: SimEnv): PowerNetwork[] {
  syncRuntime(s);
  const fresh = stepPower(s, 0, env.hour ?? s.sim.hour, env);
  for (const r of s.sim.things.values()) r.status = describeRuntime(s, r);
  return fresh;
}
