import type { BuildingId } from '../../game/data.ts';
import type { Dir } from '../../game/state.ts';

// Which of brush3d's solarpunk models (brush3d/docs/MODELS.md) draws each thing the game places (#203). Kept apart from
// things.ts, with nothing of the renderer in it, so the game's tests can check it against the models' index in Node.

/**
 * The model for each building, by its file's name in brush3d/src/models/. Every one is built on the building's own
 * footprint (n × n tiles at 4 m a tile), centred, its front towards +z. A field and a sapling aren't models: what grows is
 * painted (#213), so they have none here.
 */
export const MODEL_OF: Partial<Record<BuildingId, string>> = {
  silo: 'silo', garage: 'garage', greenhouse: 'greenhouse', sprinkler: 'sprinkler', coop: 'coop', hive: 'beehive',
  composter: 'composter', mill: 'mill', press: 'oil_press', spinner: 'spinner', loom: 'loom', bakery: 'bakery',
  cannery: 'cannery', solar: 'solar_panel', turbine: 'wind_turbine', battery: 'battery', wheel: 'water_wheel',
  digester: 'digester', pylon: 'pylon', station: 'weather_station', depot: 'depot',
};

/** The trucks' model. */
export const TRUCK_MODEL = 'truck';

/**
 * The turn about the vertical (radians) that faces a model's front (+z) the way the game's `rot` says: 0 north (−z), 1 east
 * (+x), 2 south (+z), 3 west (−x), the sides `SIDES` in relief.ts counts. A water wheel's `rot` faces its river (wheelSite in rules.ts), and its model's front is the side its wheel hangs
 * off, so the wheel hangs over the water.
 */
export const YAW: Record<Dir, number> = { 0: Math.PI, 1: Math.PI / 2, 2: 0, 3: -Math.PI / 2 };
