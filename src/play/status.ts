// What the overlay says about the valley, read off the game's state: the postcard's figures (with the Supplies, the brief
// and the power), a clicked thing's plain lines ("Grinding wheat into flour · 40%", "Stock: 4 Wheat") and its card's
// extras (the Garage's carts, the refund, the Greenhouse's draw, the Weather Station's days ahead), and the living weather
// as the sky strip reads it out ("Showers · 11°C"; the old four-word chip still maps brush3d's presets).
import {
  BATTERY_WH, BEE_MIN_C, CART_COST, CATALOG, channelSummary, countOf, describeClimate, describeInventory, describeRuntime, describeWeather,
  floweringArea, FORECAST_ICONS, forecastDays, type GameState, type Good, GREENHOUSE_COLD_C, GREENHOUSE_COLD_W, GREENHOUSE_MILD_W,
  greenhouseWarm, SERVICE_RADIUS, serviceSite, treeShade, warmGreenhouseNear, windShelter,
  GOOD_LABELS, isNight, isWorkshop, MAX_CARTS, polylineDistance, runtimeOf, SILO_CAP, type Thing, type ThingKind, toWorld,
  totalStored,
} from '../game/index.ts';
import { type CartControls, type LiveWeatherView, suppliesView, type ValleyStats, type Weather } from '../ui/index.ts';
import type { WeatherName } from '../world/index.ts';

/**
 * The postcard's figures. `starterTracks`: the tracks the valley came with (the Depot's stub), which, like the Depot, are
 * not the player's work (so rolling a fresh valley over an untouched one asks nothing).
 */
export function valleyStats(s: GameState, starterTracks: ReadonlySet<number> = new Set()): ValleyStats {
  const thingCounts: Partial<Record<ThingKind, number>> = {};
  for (const t of s.things) thingCounts[t.kind] = (thingCounts[t.kind] ?? 0) + 1;
  const placed = s.things.filter((t) => !CATALOG[t.kind].immovable).length;
  const tracks = s.tracks.filter((t) => !starterTracks.has(t.id)).length;
  const sim = s.sim;
  return {
    seed: s.seed, season: s.season, hasFarmhouse: (thingCounts.farmhouse ?? 0) > 0, thingCounts,
    fieldAreaM2: s.fields.reduce((sum, f) => sum + f.areaM2, 0),
    flowingRillM: s.channels.reduce((sum, c) => sum + channelSummary(c).wetLength, 0),
    bridgeCount: s.bridges.length,
    landEditCount: placed + s.fields.length + s.channels.length + tracks + s.hedges.length + s.plantedTrees.length,
    // Copies, so a snapshot the overlay keeps never changes under it as the homestead runs on.
    supplies: suppliesView(sim.supplies),
    brief: structuredClone(sim.brief),
    cartCount: sim.carts.length, maxCarts: MAX_CARTS, hasGarage: (thingCounts.garage ?? 0) > 0,
    powerSummary: { ...sim.powerSummary },
    climateLabel: describeClimate(s.season, s.climate),
  };
}

/** The strip's weather for the sky's (brush3d's presets): every preset reads as the nearest of the four. */
const FROM_SKY: Record<WeatherName, Weather> = {
  clear: 'clear', 'heat-wave': 'clear',
  scattered: 'breeze', mist: 'breeze', dust: 'breeze',
  overcast: 'overcast', fog: 'overcast', 'low-cloud': 'overcast', snow: 'overcast', blizzard: 'overcast',
  'soft-rain': 'rain', storm: 'rain',
};
/** The sky (a brush3d preset) for each of the strip's four weathers. */
const TO_SKY: Record<Weather, WeatherName> = { clear: 'clear', breeze: 'scattered', overcast: 'overcast', rain: 'soft-rain' };

export const uiWeather = (w: WeatherName): Weather => FROM_SKY[w];
export const skyWeather = (w: Weather): WeatherName => TO_SKY[w];

/** The crop a thing stands over, if any (a solar canopy over a field: agrivoltaics). */
function cropUnder(s: GameState, t: Thing): string | undefined {
  const def = CATALOG[t.kind], g = s.grid;
  for (const [fx, fz] of [[0, 0], [-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) {
    const p = toWorld(t.x, t.z, t.yaw, def.offX + fx * def.halfW, def.offZ + fz * def.halfD);
    const ix = Math.floor((p.x - g.x0) / g.cell), iz = Math.floor((p.z - g.z0) / g.cell);
    if (ix < 0 || iz < 0 || ix >= g.nx || iz >= g.nz) continue;
    const id = g.fieldOf[iz * g.nx + ix];
    const field = id === 0 ? undefined : s.fields.find((f) => f.id === id);
    if (field) return field.crop;
  }
  return undefined;
}

/** Where a yard prop sits, in a word or two. */
function surroundings(s: GameState, t: Thing): string {
  if (s.valley.brook.length > 1 && polylineDistance(t.x, t.z, s.valley.brook).d < 9) return 'By the brook';
  const trees = [...s.wildTrees, ...s.plantedTrees].filter((tr) => Math.hypot(tr.x - t.x, tr.z - t.z) < 10).length;
  if (trees >= 2) return 'Sheltered clearing';
  if (trees === 1) return 'In the shade of a tree';
  return 'Open to the sky';
}

/** A clicked thing's one plain line, and whether it's on the power (left out for things power doesn't touch). */
export function thingStatus(s: GameState, t: Thing, hour: number): { line: string; connected?: boolean } {
  const role = CATALOG[t.kind].powerRole, p = s.power;
  const powered = p.powered.includes(t.id), linked = p.connected.includes(t.id);
  const needs = 'Needs a relay or power nearby';
  const connected = role === 'none' ? undefined : role === 'load' ? powered : linked;
  const say = (line: string) => ({ line, connected });
  switch (t.kind) {
    // The homestead's buildings say how they're doing as the homestead runs (workshops.ts).
    // The Depot's order is its second line: its first says what it is.
    case 'depot': return say(s.sim.brief.order.done ? 'Pantry Order filled · the settlement thanks you' : "The settlement's landing · carts bring the Pantry Order here");
    case 'rain_tank': case 'sprinkler': case 'beehive': case 'farmhouse': case 'silo': case 'mill': case 'bakery': case 'coop': case 'composter': case 'garage':
    case 'weather_station': case 'greenhouse': {
      const r = runtimeOf(s, t.id);
      if (r) {
        let note = '';
        if (t.kind === 'coop' && treeShade(s, t, 10)) note = ' · Shaded by trees';
        if (t.kind === 'beehive') {
          const flowers = floweringArea(s, t);
          const forage = warmGreenhouseNear(s, t) ? 'Foraging in the Greenhouse'
            : s.season === 'winter' ? 'Resting until spring' : s.sim.weather.tempC < BEE_MIN_C ? 'Too cold to fly'
            : flowers ? `${flowers} m² of flowering beans` : serviceSite(s, t).meadow ? 'Meadow flowers' : 'Plant beans nearby';
          note = `${windShelter(s, t) > 0.1 ? ' · Sheltered' : ''} · ${forage}`;
        }
        return say(describeRuntime(s, r) + note);
      }
      return say(powered ? 'Connected to power' : needs);
    }
    case 'solar': {
      const crop = cropUnder(s, t);
      const shade = treeShade(s, t) > 0 ? ' · Shaded by trees' : '';
      if (crop) return say(`Agrivoltaic over ${crop}${shade}`);
      return say(isNight(hour, s.season) ? 'Resting until sunrise' : `Soaking up the sun${shade}`);
    }
    case 'turbine': return say(windShelter(s, t) > 0.1 ? 'Wind slowed by nearby shelter' : 'Catching the wind');
    case 'waterwheel': return say('Water Wheel · Turning in the brook');
    case 'battery': {
      const r = runtimeOf(s, t.id);
      return say(linked && r ? `Charge ${Math.round(r.charge * 100)}%` : needs);
    }
    case 'relay': return say(powered ? 'Passing power on' : 'Needs power within 15 m');
    // A solar lantern charges itself from its own cap, so it glows after dusk power or none; the card's pip says whether
    // it's on the homestead's power too.
    case 'lantern': return say(isNight(hour, s.season) ? 'Glowing along the way' : 'Charging in the sun · glows after dusk');
    case 'bench': case 'planter': case 'crates': return say(surroundings(s, t));
  }
}

/** "Bread 4/10 · Flour 6/6 · Beans 6/6": the Pantry Order as delivered so far. */
function orderLine(s: GameState): string {
  const o = s.sim.brief.order;
  return (Object.entries(o.targets) as [Good, number][])
    .map(([g, n]) => `${Math.min(n, countOf(o.delivered, g))}/${n} ${GOOD_LABELS[g].label}`).join(' · ');
}

/** A watt figure: "3.0 W". */
const watts = (w: number) => `${w.toFixed(1)} W`;

/**
 * A clicked building's second line: its stock (a workshop's goods in and out, the Silo's fill, the Depot's order), its
 * power (what a source makes, a battery's store and which way it's going), or what its carts are about (the Garage).
 */
export function thingDetail(s: GameState, t: Thing, diagnosis: string | null = null): string | undefined {
  const r = runtimeOf(s, t.id);
  if (!r) return undefined;
  const net = s.sim.networks.find((n) => n.id === r.powerNetId);
  if (isWorkshop(t.kind)) {
    const parts: string[] = [];
    if (totalStored(r.inputs) > 0) parts.push(`Stock: ${describeInventory(r.inputs)}`);
    if (totalStored(r.outputs) > 0) parts.push(`Made: ${describeInventory(r.outputs)}`);
    return parts.length > 0 ? parts.join(' · ') : 'Stock: nothing yet';
  }
  switch (t.kind) {
    case 'silo': return `${totalStored(r.outputs)} / ${SILO_CAP} stored`;
    case 'depot': return s.sim.brief.order.done ? undefined : `Order: ${orderLine(s)}`;
    case 'garage': {
      if (diagnosis) return diagnosis;
      const cart = s.sim.carts.find((c) => c.state !== 'idle') ?? s.sim.carts[0];
      return cart ? `Cart ${cart.id} · ${Math.round(cart.battery * 100)}% · ${cart.jobDesc}` : undefined;
    }
    case 'solar': case 'turbine': case 'waterwheel':
      return `Making ${watts(r.watts)}${net ? ` · network ${watts(net.generationW)} made, ${watts(net.servedW)} used` : ''}`;
    case 'battery': {
      if (!net) return `${(r.charge * BATTERY_WH).toFixed(1)} / ${BATTERY_WH} Wh`;
      const spare = net.generationW - net.servedW;
      const way = r.charge >= 0.999 ? 'Full' : spare > 0.05 ? 'Charging' : spare < -0.05 ? 'Carrying the homestead' : 'Holding';
      return `${net.batteryWh.toFixed(1)} / ${net.batteryCapWh.toFixed(0)} Wh · ${way}`;
    }
    case 'greenhouse': {
      const parts: string[] = [];
      if (totalStored(r.outputs) > 0) parts.push(`Made: ${describeInventory(r.outputs)}`);
      // Its draw while it grows (a full one rests, drawing nothing, until a cart takes the harvest).
      if (!r.powered) parts.push('Needs power');
      else if (r.working) parts.push(s.sim.weather.tempC < GREENHOUSE_COLD_C ? `${watts(GREENHOUSE_COLD_W)} in cold` : `${watts(GREENHOUSE_MILD_W)} in mild air`);
      const bees = s.things.some((h) => h.kind === 'beehive' && Math.hypot(h.x - t.x, h.z - t.z) <= SERVICE_RADIUS.beehive);
      if (bees && greenhouseWarm(r)) parts.push('Warming nearby bees');
      return parts.join(' · ');
    }
    case 'weather_station': return `Next: ${forecastDays(s, 3).map((f) => `Day ${f.day} ${f.label}`).join(' · ')}`;
    case 'farmhouse': return net ? `Network ${watts(net.generationW)} made, ${watts(net.servedW)} used` : undefined;
    default: return undefined;
  }
}

/** The sky strip's living weather: the spell now, its words, the air's temperature, and whether `?weather=` holds it. */
export function liveWeatherView(s: GameState): LiveWeatherView {
  const w = s.sim.weather;
  return {
    spell: w.spell, label: w.label, tempC: w.tempC, icon: FORECAST_ICONS[w.spell], locked: s.sim.weatherOverride !== null,
    detail: describeWeather(s),
  };
}

/** The Garage card's cart row: buy another, or retire the newest (the Garage's own first one stays). */
export function cartControls(s: GameState): CartControls {
  const carts = s.sim.carts, count = carts.length;
  const view: CartControls = {
    count, max: MAX_CARTS, canAfford: s.sim.supplies.available >= CART_COST && count < MAX_CARTS, canRetire: count > 1,
  };
  if (count > 1) view.retireId = carts[count - 1].id;
  return view;
}
