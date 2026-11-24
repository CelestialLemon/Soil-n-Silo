// What the overlay says about the valley, read off the game's state: the postcard's figures, a clicked thing's one plain
// line ("Agrivoltaic · Shading wheat", "Needs a pylon or power nearby") and the sky's weather in the strip's four words.
import {
  CATALOG, channelSummary, type GameState, polylineDistance, type Thing, type ThingKind, toWorld,
} from '../game/index.ts';
import type { ValleyStats, Weather } from '../ui/index.ts';
import type { WeatherName } from '../world/index.ts';

/** The postcard's figures. */
export function valleyStats(s: GameState): ValleyStats {
  const thingCounts: Partial<Record<ThingKind, number>> = {};
  for (const t of s.things) thingCounts[t.kind] = (thingCounts[t.kind] ?? 0) + 1;
  return {
    seed: s.seed, season: s.season, hasFarmhouse: (thingCounts.farmhouse ?? 0) > 0, thingCounts,
    fieldAreaM2: s.fields.reduce((sum, f) => sum + f.areaM2, 0),
    flowingRillM: s.channels.reduce((sum, c) => sum + channelSummary(c).wetLength, 0),
    bridgeCount: s.bridges.length,
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

/** Whether it's dark enough for lanterns and lit windows. */
const isNight = (hour: number) => hour < 6.5 || hour > 19.5;

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
  const needs = s.powerMode === 'pylons' ? 'Needs a pylon or power nearby' : 'Needs a relay or power nearby';
  const connected = role === 'none' ? undefined : role === 'load' ? powered : linked;
  const say = (line: string) => ({ line, connected });
  switch (t.kind) {
    case 'farmhouse': return say(powered ? 'Home · Connected to power' : `Home · ${needs}`);
    case 'mill': return say(powered ? 'Millstones turning · Connected to power' : needs);
    case 'silo': case 'bakery': return say(powered ? 'Connected to power' : needs);
    case 'solar': {
      const crop = cropUnder(s, t);
      if (crop) return say(`Agrivoltaic · Shading ${crop}`);
      return say(isNight(hour) ? 'Resting until sunrise' : 'Soaking up the sun');
    }
    case 'turbine': return say('Catching the wind');
    case 'waterwheel': return say('Water Wheel · Turning in the brook');
    case 'battery': return say(linked ? "Storing the homestead's power" : needs);
    case 'pylon': {
      if (s.powerMode !== 'pylons') return say('Standing idle · power is wireless here');
      const wires = p.spans.filter((w) => w.from === t.id || w.to === t.id).length;
      return say(wires > 0 ? `Carrying ${wires} wire${wires === 1 ? '' : 's'}` : 'Needs power within 15 m');
    }
    case 'relay': {
      if (s.powerMode !== 'wireless') return say('Standing idle · power runs on pylons here');
      return say(powered ? 'Passing power on' : 'Needs power within 15 m');
    }
    // A solar lantern charges itself, so it glows either way; the card's pip says whether it's on the homestead's power.
    case 'lantern': return say(isNight(hour) ? 'Glowing along the way' : 'Charging in the sun · glows after dusk');
    case 'bench': case 'planter': case 'crates': return say(surroundings(s, t));
  }
}
