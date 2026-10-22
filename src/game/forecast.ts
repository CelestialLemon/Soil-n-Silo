import { BUILDINGS, CROPS, DAY_SECONDS, FIELD, HIVE, ITEMS, POLLINATION_BONUS, POWER, recipesFor, SAPLING_SECONDS, TREE_HEALTH, type BuildingId } from './data.ts';
import { networks, POWERED, pylonsInLink } from './power.ts';
import { HOUR_SECONDS } from './powerlog.ts';
import { erosionAt, guardedAt, hiveReaches, paceOf, pylonReaches, riverSeason, sprinklerWaters, sprinklerWatts, touchesWater, waterLevelNear, waterPace, wheelSite, windExposure } from './rules.ts';
import { earthPrice, groundworkFor, levelledFor } from './build.ts';
import { hourAt, sunAt, windAt } from './sim/clock.ts';
import { raining } from './sim/weather.ts';
import { linksAt } from './sim/goods.ts';
import { makes, shareOf, wants } from './sim/energy.ts';
import { wattsOf } from './sim/layout.ts';
import { describeLinks } from './sim/describe.ts';
import { centreLevel } from './relief.ts';
import { warmthFact, warmthOf } from './warmth.ts';
import { inMap, type Building, type FieldBuilding, type GameState, type Setting } from './state.ts';

// Forecasts from what the game already knows: what a building in hand would do on a tile (facts about the tile, no advice),
// and how tonight's battery charge will go if power is used as it is now (the weather is seeded, so the game knows it).

/** A fact for the placement card: a label, a value (and what it becomes), and a few words under it. */
export interface Fact { label: string; value: string; then?: string; sub: string; tone?: 'bad' | 'good' }

export interface Placement {
  facts: Fact[];
  /** What it would take from and give to the buildings next door, a line each. */
  next: string[];
}

/** How far ahead, in seconds of play, the placement card shows a field's soil. */
export const SOIL_AHEAD = 600;

const fmt1 = (n: number) => (Math.abs(n) >= 10 ? String(Math.round(n)) : n.toFixed(1).replace(/\.0$/, ''));
const watts = (w: number) => `${fmt1(w)} W`;

/** The average fertility of an n × n footprint. */
function soilUnder(s: GameState, x: number, y: number, n: number) {
  let sum = 0, k = 0;
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) if (inMap(s, tx, ty)) { sum += s.map.fertility[ty * s.map.width + tx]; k++; }
  return k ? sum / k : 0;
}

/** The sprinklers that would water a field at (x, y), and the most water any gives (the share of power it gets). */
function waterAt(s: GameState, x: number, y: number) {
  const sp = s.buildings.filter((b) => b.type === 'sprinkler' && sprinklerWaters(b.x, b.y, { type: 'field', x, y }));
  const shore = touchesWater(s, x, y);
  return { sprinklers: sp.length, shore, water: shore ? 1 : sp.reduce((m, b) => Math.max(m, shareOf(s, b)), 0) };
}

/** Whether a pylon would reach a footprint at (x, y). */
const powered = (s: GameState, type: BuildingId, x: number, y: number) => s.buildings.some((p) => BUILDINGS[p.type].grid === 'link' && pylonReaches({ type, x, y }, p.x, p.y));

/** What a building of `type` placed with its north-west tile at (x, y) would do there. */
export function placement(s: GameState, type: BuildingId, x: number, y: number, set: Setting = {}): Placement {
  const def = BUILDINGS[type], facts: Fact[] = [];
  const pylonFact = (): Fact => (powered(s, type, x, y) ? { label: 'Power', value: 'in reach', sub: 'of a pylon' } : { label: 'Power', value: 'none', sub: 'no pylon in reach', tone: 'bad' });
  const gw = groundworkFor(s, type, x, y), here = inMap(s, x, y) ? centreLevel(s.map, x, y) : 0;
  if (gw.ok && gw.value.level !== null) facts.push({ label: 'Earthworks', value: String(earthPrice(s, gw.value.move.steps)), sub: `levels the ground to level ${gw.value.level} (${gw.value.move.steps} steps)`, tone: 'bad' });
  // What it would do on the ground as it will be: levelled first, if placing it levels it.
  const there = (): Placement => {
    switch (type) {
      case 'field': {
        const crop = CROPS[set.crop ?? 'wheat'], soil = soilUnder(s, x, y, 3), { sprinklers, shore, water } = waterAt(s, x, y);
        // A hive within reach of a flowering crop adds a good to every harvest.
        const pollinated = crop.flowers && s.buildings.some((b) => b.type === 'hive' && hiveReaches({ type: 'field', x, y }, b.x, b.y));
        const perMin = (crop.yield + (pollinated ? POLLINATION_BONUS : 0)) * 60 * paceOf(water, soil, crop).pace / crop.grow;
        // Sloping tiles under it wear faster (erosion).
        const guarded = guardedAt(s, x, y);
        let slopes = 0, wear = 0;
        for (let ty = y; ty < y + 3; ty++) for (let tx = x; tx < x + 3; tx++) {
          const k = inMap(s, tx, ty) ? erosionAt(s, tx, ty, guarded) : 1;
          wear += k / 9; if (k > 1) slopes++;
        }
        // The harvests over the next SOIL_AHEAD seconds, each wearing the soil and slowing the next.
        let t = 0, later = soil;
        for (;;) { t += crop.grow / paceOf(water, later, crop).pace; if (t > SOIL_AHEAD) break; later = Math.max(0, Math.min(100, later + crop.soil * (crop.soil < 0 ? wear : 1))); }
        facts.push({ label: crop.name, value: `+${fmt1(perMin)}`, sub: 'a minute, in comfortable warmth' });
        facts.push({ label: 'Soil', value: String(Math.round(soil)), then: String(Math.round(later)), sub: `in ${SOIL_AHEAD / 60} min if harvests are carried off` });
        facts.push(shore ? { label: 'Water', value: 'beside water', sub: 'grows at 100%' } : sprinklers ? { label: 'Water', value: `${sprinklers} sprinkler${sprinklers > 1 ? 's' : ''}`, sub: `grows at ${Math.round(waterPace(water, crop.thirst) * 100)}%` }
          : { label: 'Water', value: 'none', sub: `grows at ${Math.round(waterPace(0, crop.thirst) * 100)}%`, tone: 'bad' });
        const warm = warmthFact(crop, warmthOf(s));
        facts.push({ label: 'Warmth', value: `${Math.round(warmthOf(s))}°C`, sub: warm.text.slice(warm.text.indexOf(': ') + 2), tone: warm.tone === 'bad' ? 'bad' : undefined });
        if (slopes) facts.push({ label: 'Slope', value: `${slopes} of 9 tiles`, sub: `wear up to ${fmt1(1 + (guarded ? FIELD.erosionGuarded : FIELD.erosion))}× as fast${guarded ? '; trees or beans beside it help' : ''}`, tone: guarded ? undefined : 'bad' });
        break;
      }
      case 'sprinkler': {
        const fields = s.buildings.filter((b) => b.type === 'field' && sprinklerWaters(x, y, b)), water = inMap(s, x, y) ? waterLevelNear(s, x, y) : null;
        const lift = water === null ? here : Math.max(0, here - water);
        facts.push({ label: 'Waters', value: `${fields.length} field${fields.length === 1 ? '' : 's'}`, sub: `centres within ${POWER.sprinklerReach} tiles` });
        facts.push({ label: 'Uses', value: inMap(s, x, y) ? watts(sprinklerWatts(s, x, y)) : '–', sub: `${water === null ? 'far from water' : 'near water'}${lift ? `, lifting it ${fmt1(lift)} level${lift === 1 ? '' : 's'}` : ''}` });
        facts.push(pylonFact());
        break;
      }
      case 'hive': {
        const near = s.buildings.filter((b): b is FieldBuilding => b.type === 'field' && hiveReaches(b, x, y));
        const flowers = Math.min(HIVE.maxFlowers, near.filter((f) => CROPS[f.crop].flowers).length);
        facts.push({ label: 'Honey', value: `+${fmt1(flowers * 60 / HIVE.honeySeconds)}`, sub: 'a minute', tone: flowers ? undefined : 'bad' });
        facts.push({ label: 'Flowers', value: `${flowers} field${flowers === 1 ? '' : 's'}`, sub: `flowering within ${HIVE.reach} tiles` });
        facts.push({ label: 'Pollinates', value: `${near.filter((f) => CROPS[f.crop].flowers).length}`, sub: 'flowering fields' });
        break;
      }
      case 'solar': {
        const sc = s.scenario;
        facts.push({ label: 'Now', value: watts(POWER.solar * sunAt(sc, s.time)), sub: 'in this sun' });
        facts.push({ label: 'Midday', value: watts(POWER.solar * sc.climate.sun.strength), sub: `sun ${String(sc.climate.sun.rise).padStart(2, '0')}:00–${sc.climate.sun.set}:00` });
        facts.push(pylonFact());
        break;
      }
      case 'turbine': {
        const w = inMap(s, x, y) ? windExposure(s, x, y) : { shelter: 1, height: 1, exposure: 1 }, exp = w.exposure;
        facts.push({ label: 'Wind', value: `${Math.round(exp * 100)}%`, sub: w.height > 1 ? `reaches it here, ${Math.round((w.height - 1) * 100)}% more up high` : 'reaches it here', tone: w.shelter < 1 ? 'bad' : w.height > 1 ? 'good' : undefined });
        facts.push({ label: 'Now', value: watts(POWER.turbine * windAt(s.scenario, s.time) * exp), sub: 'in this wind' });
        facts.push(pylonFact());
        break;
      }
      case 'pylon': {
        const links = pylonsInLink(s, x, y).length;
        const reached = s.buildings.filter((b) => POWERED(b) && pylonReaches(b, x, y));
        const fresh = reached.filter((b) => !networks(s).of.get(b.id)).length;
        facts.push({ label: 'Links', value: `${links} pylon${links === 1 ? '' : 's'}`, sub: links ? `within ${POWER.pylon.link} tiles` : 'a new network' });
        facts.push({ label: 'Reaches', value: `${reached.length}`, sub: `building${reached.length === 1 ? '' : 's'}${fresh ? `, ${fresh} not yet powered` : ''}` });
        break;
      }
      case 'wheel': {
        const site = inMap(s, x, y) ? wheelSite(s, x, y) : null;
        if (site) {
          facts.push({ label: 'Makes', value: watts(site.watts), sub: 'day and night' });
          facts.push({ label: 'Current', value: `${site.current.toFixed(1)} m/s`, sub: site.fall ? 'beside a fall' : 'no fall beside it', tone: site.fall ? 'good' : undefined });
          facts.push({ label: 'Season', value: `×${site.flow.toFixed(1)}`, sub: riverSeason(site.flow), tone: site.flow >= 1.2 ? 'good' : site.flow <= 0.7 ? 'bad' : undefined });
        } else facts.push({ label: 'River', value: 'none', sub: 'it needs a river at its bank', tone: 'bad' });
        facts.push(pylonFact());
        break;
      }
      case 'sapling':
        facts.push({ label: 'Grows', value: `${SAPLING_SECONDS} s`, sub: 'into a tree' });
        facts.push({ label: 'Soil health', value: `+${TREE_HEALTH.perTree}`, sub: `a tree, up to ${TREE_HEALTH.cap} in all` });
        break;
      default: {
        const r = recipesFor(type).find((x) => x.id === set.recipe) ?? recipesFor(type)[0];
        if (r && r.outputs.length) facts.push({ label: 'Full speed', value: fmt1(r.outputs[0].n * 60 / r.time), sub: `${ITEMS[r.outputs[0].item].name.toLowerCase()} a minute` });
        if (type === 'digester') facts.push({ label: 'Makes', value: watts(POWER.digester), sub: 'while burning' });
        if (type === 'battery') facts.push({ label: 'Stores', value: `${POWER.battery.capacity} J`, sub: `${POWER.battery.rate} W in and out` });
        if (def.power || POWERED({ type } as Building)) facts.push(pylonFact());
      }
    }
  return { facts, next: describeLinks(linksAt(s, type, x, y, set)) };
  };
  return levelledFor(s, gw.ok ? gw.value.move : null, there);
}

// ---- Tonight ----

/** The play time at which the hour of day next reaches `hour` (strictly after `time`). */
export function nextHour(time: number, hour: number) {
  const ahead = (((hour - hourAt(time)) % 24) + 24) % 24;
  return time + (ahead > 1e-9 ? ahead : 24) * HOUR_SECONDS;
}

export interface Tonight {
  /** The batteries' charge, as a share of what they hold, from now to an hour after sunrise. */
  points: { t: number; k: number }[];
  /** When the coming night starts (null: it is night now) and ends. */
  sunset: number | null;
  sunrise: number;
  /** When all the batteries run dry (null: they last the night), and from then until sunrise: the average shortfall and the
   * time short. */
  dryAt: number | null;
  shortAfter: number;
  shortFor: number;
  /** The highest charge before the night, and when. */
  peak: { t: number; k: number };
}

/**
 * How the batteries' charge will go until the morning, if every network keeps using what it uses now (and digesters burning
 * now keep burning): the sun and wind follow the commission's seeded weather. Null without batteries.
 */
export function tonight(s: GameState): Tonight | null {
  const sc = s.scenario, w = sc.climate.sun, now = s.time, h = hourAt(now);
  const night = h < w.rise || h >= w.set;
  const sunset = night ? null : nextHour(now, w.set);
  const sunrise = nextHour(sunset ?? now, w.rise), end = sunrise + HOUR_SECONDS;
  const nets = networks(s).list.map((net) => {
    const bats = net.members.filter((b) => b.type === 'battery').map((b) => b.charge);
    // What the sprinklers want when they run (they rest in rain) and what everything else wants now.
    const sprinklers = net.members.filter((b) => b.type === 'sprinkler').reduce((n, b) => n + wattsOf(s, b), 0);
    return { net, bats, sprinklers, other: net.members.reduce((n, b) => n + (b.type === 'sprinkler' ? 0 : wants(s, b)), 0), solar: net.members.filter((b) => b.type === 'solar').length, turbines: net.members.filter((b) => b.type === 'turbine'),
      digesters: net.members.filter((b) => b.type === 'digester' || b.type === 'wheel').reduce((n, b) => n + makes(s, b, 0, 0), 0) };
  });
  const capacity = nets.reduce((n, x) => n + x.bats.length, 0) * POWER.battery.capacity;
  if (!capacity) return null;
  const step = HOUR_SECONDS / 6, points: { t: number; k: number }[] = [];
  const nightFrom = sunset ?? now; // only the coming night counts as a failure; before it the batteries just fill or drain
  let dryAt: number | null = null, shortSum = 0, shortFor = 0;
  const stored = () => nets.reduce((n, x) => n + x.bats.reduce((a, b) => a + b, 0), 0);
  let peak = { t: now, k: stored() / capacity };
  points.push({ t: now, k: peak.k });
  for (let t = now, dt: number; t < end - 1e-6; t += dt) {
    // Cut a step short where it would cross sunset or sunrise, so each one is wholly in the night or wholly out.
    dt = Math.min(step, end - t, ...[nightFrom, sunrise].filter((b) => b > t + 1e-6).map((b) => b - t));
    const sun = sunAt(sc, t + dt / 2), wind = windAt(sc, t + dt / 2);
    let short = 0;
    for (const x of nets) {
      const made = POWER.solar * sun * x.solar + x.turbines.reduce((n, b) => n + makes(s, b, 0, wind), 0) + x.digesters;
      let spare = (made - x.other - (raining(sc, t + dt / 2) ? 0 : x.sprinklers)) * dt;
      for (let i = 0; i < x.bats.length; i++) {
        const move = spare > 0 ? Math.min(spare, POWER.battery.rate * dt, POWER.battery.capacity - x.bats[i]) : Math.max(spare, -POWER.battery.rate * dt, -x.bats[i]);
        x.bats[i] += move; spare -= move;
      }
      if (spare < -1e-6) short += -spare / dt;
    }
    // Dry once every battery is spent (one network's going first still leaves the rest holding) and something goes short.
    const k = stored() / capacity;
    const inNight = t >= nightFrom - 1e-6 && t + dt <= sunrise + 1e-6;
    if (inNight && dryAt === null && k < 1e-6 && short > 1e-6) dryAt = t + dt;
    points.push({ t: t + dt, k });
    if ((sunset === null || t + dt <= sunset) && k > peak.k) peak = { t: t + dt, k };
    if (inNight && dryAt !== null && short > 1e-6) { shortSum += short * dt; shortFor += dt; }
  }
  return { points, sunset, sunrise, dryAt, shortAfter: shortFor ? shortSum / shortFor : 0, shortFor, peak };
}

/** Seconds of play to in-game hours and minutes, for a span ("3 h 20"). */
export const gameSpan = (seconds: number) => {
  const m = Math.round(seconds / DAY_SECONDS * 24 * 60);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
};
