import { BUILDINGS, POWER, TICK, TRUCK, type BuildingId } from '../data.ts';
import { pushesAt } from '../events.ts';
import { floodHolds } from '../flood.ts';
import { panelShare } from '../snow.ts';
import { networkOf, networks } from '../power.ts';
import { notePower, type PowerStep } from '../powerlog.ts';
import { isMachine, type BatteryBuilding, type Building, type GameState } from '../state.ts';
import { exposureOf, rainWaters, runsInFrost, wattsOf } from './layout.ts';
import { recipeOf, missing, outputsFit } from './goods.ts';
import { runtimeOf } from '../runtime.ts';
import { turbineShare, type View } from '../wind.ts';
import { daylight } from './clock.ts';

// Power: what each building wants and makes, how each network balances, and the watts garages want for charging.

/** The share of the power it wanted that a building got last step (1 for buildings that need none). */
export function shareOf(s: GameState, b: Building) {
  if (!BUILDINGS[b.type].power) return 1;
  return runtimeOf(s).shares?.get(b.id) ?? 0;
}

/** Watts a building wants this step. */
export function wants(s: GameState, b: Building): number {
  const def = BUILDINGS[b.type];
  if (!def.power) return 0;
  if (b.type === 'sprinkler') return rainWaters(s, b) ? 0 : wattsOf(s, b); // open fields are watered by the rain
  if (b.type === 'station') return floodHolds(s, b) ? 0 : def.power; // a drowned station is stopped: it draws nothing
  if (b.type === 'garage') return runtimeOf(s).charging?.get(b.id) ?? 0;
  if (!isMachine(b)) return 0;
  const r = recipeOf(b);
  if (b.progress !== null) return def.power;
  return !missing(b, r) && !outputsFit(b, r) ? def.power : 0;
}

/** Watts a generator makes this step (or at `time`, for a forecast: the sun and wind are those of that time, and `view` the events then in force). */
export function makes(s: GameState, b: Building, sun: number, wind: number, time = s.time, view: View = s.scenario): number {
  switch (b.type) {
    case 'solar': return POWER.solar * sun * panelShare(view, time); // snow lies on the panels after a blizzard
    case 'turbine': { const e = exposureOf(s, b); return POWER.turbine * wind * e * turbineShare(s, b.id, e, time, view); } // a gale can stop it or make it furl
    case 'wheel': { // a weather event can raise or drop the river, and a cold snap freezes it over, but not at a fall
      const p = pushesAt(view, time);
      return wattsOf(s, b) * p.river * (runsInFrost(s, b) ? 1 : 1 - p.ice);
    }
    case 'digester': return b.progress !== null ? POWER.digester : 0;
    default: return 0;
  }
}

export function balancePower(s: GameState, sun: number, wind: number, dt: number) {
  const map = new Map<number, number>();
  const step: PowerStep = { solar: 0, wind: 0, water: 0, digester: 0, given: 0, taken: 0, wanted: 0, used: 0, short: 0, stored: 0, capacity: 0, night: !daylight(s.scenario, s.time) }; // not `sun <= 0`: a blizzard darkens the day, it isn't night
  const use: Partial<Record<BuildingId, number>> = {};
  for (const net of networks(s).list) {
    let made = 0, wanted = 0, capacity = 0;
    const batteries: BatteryBuilding[] = [], want = new Map<Building, number>();
    for (const b of net.members) {
      const w = makes(s, b, sun, wind), u = wants(s, b);
      made += w;
      if (b.type === 'solar' || b.type === 'turbine' || b.type === 'wheel' || b.type === 'digester') step[b.type === 'turbine' ? 'wind' : b.type === 'wheel' ? 'water' : b.type] += w;
      wanted += u;
      if (u > 0) want.set(b, u);
      if (b.type === 'battery') { batteries.push(b); capacity += POWER.battery.capacity; }
    }
    let share = 1;
    if (made >= wanted) {
      let spare = (made - wanted) * dt;
      for (const bat of batteries) {
        const add = Math.min(spare, POWER.battery.rate * dt, POWER.battery.capacity - bat.charge);
        bat.charge += add; spare -= add; step.taken += add / dt;
      }
    } else {
      let short = (wanted - made) * dt, given = 0;
      for (const bat of batteries) {
        const take = Math.min(short, POWER.battery.rate * dt, bat.charge);
        bat.charge -= take; short -= take; given += take;
      }
      step.given += given / dt;
      share = wanted > 0 ? Math.min(1, (made + given / dt) / wanted) : 1;
      if (share > 0.999) share = 1;
    }
    net.made = made; net.wanted = wanted; net.share = share;
    net.stored = batteries.reduce((n, b) => n + b.charge, 0); net.capacity = capacity;
    step.wanted += wanted; step.used += wanted * share; step.short += wanted * (1 - share);
    step.stored += net.stored; step.capacity += capacity;
    for (const b of net.members) map.set(b.id, share);
    for (const [b, u] of want) use[b.type] = (use[b.type] ?? 0) + u * share;
  }
  runtimeOf(s).shares = map;
  notePower(s, step, use, dt);
}

/**
 * Watts each garage wants for the trucks charging there, worked out before power is balanced: each truck at most the charge
 * rate, and no more than it needs to fill up this step.
 */
export function countCharging(s: GameState) {
  const m = new Map<number, number>();
  for (const t of s.trucks) {
    if (t.phase !== 'parked' && t.phase !== 'charge') continue;
    const w = Math.min(TRUCK.chargeRate, Math.max(0, TRUCK.battery - t.energy) / TICK);
    if (w > 0) m.set(t.garage, (m.get(t.garage) ?? 0) + w);
  }
  runtimeOf(s).charging = m;
}

/** A garage's status: charging its trucks, short of power for them, or idle. */
export function runGarages(s: GameState) {
  const want = runtimeOf(s).charging;
  for (const g of s.buildings) {
    if (g.type !== 'garage') continue;
    const w = want?.get(g.id) ?? 0, share = shareOf(s, g);
    g.need = undefined;
    if (floodHolds(s, g)) { g.status = 'idle'; continue; }
    g.status = !networkOf(s, g) ? 'power' : w > 0 && share <= 0 ? 'power' : w > 0 && share < 1 ? 'lowpower' : w > 0 ? 'ok' : 'idle';
  }
}
