import { CROPS, DAY_SECONDS, type CropId } from './data.ts';
import { activeEvents, allowed, endOf, RAMP_HOURS, type Active, type Strength } from './events.ts';
import { TERRAIN } from './map.ts';
import { centreLevel } from './relief.ts';
import { runtimeOf } from './runtime.ts';
import type { Scenario } from './scenarios.ts';
import { inMap, reliefOf, type FieldBuilding, type GameState } from './state.ts';

// Late frost: where frost settles. On a clear, still night the cold air runs downhill and pools in the low ground, so the frost
// lies in the hollows and on the valley floor and leaves the slopes clear. How low a spot lies is judged against the ground
// round it, not against the whole map (the real hollows are metres deep, our whole map is not four): a tile's *depth* is how
// far, in levels, it stands below the average of the ground within FROST_RADIUS tiles of it. An ordinary frost lies where that
// depth is HOLLOW or more; a severe one (a windy, bitter night) reaches the slopes too and stays off only the crests.
//
// A tender crop in a field the frost lies on loses its growth for as long as the frost lasts (the field starts again); a hardy
// crop, and what a field already holds, are untouched. Which tiles the frost lies on is the same for the rules, the cards and
// the rime drawn at dawn (`frostTiles`).

/** Tiles round a tile that count as "the ground round it". */
export const FROST_RADIUS = 6;
/** How far below the ground round it, in levels, a tile lies for an ordinary frost to settle on it (a hollow, the valley floor). */
export const HOLLOW = 0.2;
/** How far below the ground round it a tile may lie for a severe frost to reach it: slopes freeze too; only a crest, standing above its surroundings, is spared. */
export const SLOPE_REACH = -0.2;
/** A frost bites once it is this far into its ramp in and until it falls below it on the way out (0–1). */
export const BITES_AT = 0.5;
/** A field is frozen when at least this many of its 9 tiles are. */
const FIELD_TILES = 5;

/** How far below the ground round it each map tile lies, in levels (water: NaN); worked out once for the ground's current levels. */
function depths(s: GameState): Float64Array {
  const rt = runtimeOf(s), v = reliefOf(s);
  if (rt.frost && rt.frost.relief === v) return rt.frost.depth;
  const m = s.map, w = m.width, h = m.height, R = FROST_RADIUS;
  const level = new Float64Array(w * h), land = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    land[i] = m.terrain[i] === TERRAIN.water ? 0 : 1;
    level[i] = centreLevel(m, x, y);
  }
  const depth = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!land[i]) { depth[i] = NaN; continue; }
    let sum = 0, n = 0;
    for (let dy = Math.max(-R, -y); dy <= Math.min(R, h - 1 - y); dy++) for (let dx = Math.max(-R, -x); dx <= Math.min(R, w - 1 - x); dx++) {
      const j = i + dy * w + dx;
      if (land[j] && dx * dx + dy * dy <= R * R) { sum += level[j]; n++; }
    }
    depth[i] = sum / n - level[i];
  }
  rt.frost = { relief: v, depth };
  return depth;
}

/** How far a tile lies below the ground round it, in levels (negative on a rise; NaN on water or off the map). */
export const depthAt = (s: GameState, x: number, y: number): number => (inMap(s, x, y) ? depths(s)[y * s.map.width + x] : NaN);

/** Whether a tile is a frost hollow: low enough against the ground round it for an ordinary late frost to settle on it. */
export const isHollow = (s: GameState, x: number, y: number) => depthAt(s, x, y) >= reach('ordinary');

/** A depth a rounding error short of a threshold counts as on it. */
const EPS = 1e-6;
const reach = (strength: Strength) => (strength === 'severe' ? SLOPE_REACH : HOLLOW) - EPS;

/** The map tiles (by index) a late frost of a strength lies on: hollows and the valley floor; a severe one the slopes too. */
export function frostTiles(s: GameState, strength: Strength): number[] {
  const d = depths(s), out: number[] = [], r = reach(strength);
  for (let i = 0; i < d.length; i++) if (d[i] >= r) out.push(i);
  return out;
}

/** How many of the 3 × 3 tiles of a field at (x, y) a frost of a strength lies on. */
export function frostedTiles(s: GameState, x: number, y: number, strength: Strength = 'ordinary'): number {
  const r = reach(strength);
  let n = 0;
  for (let ty = y; ty < y + 3; ty++) for (let tx = x; tx < x + 3; tx++) if (depthAt(s, tx, ty) >= r) n++;
  return n;
}

/** Whether a field at (x, y) lies in a frost hollow: late frost settles on most of it. */
export const inHollow = (s: GameState, x: number, y: number) => frostedTiles(s, x, y) >= FIELD_TILES;

/** Whether the season can bring a late frost at all (so the cards say which ground it settles on). */
export const frostComes = (s: GameState) => allowed('lateFrost', s.scenario.climate);

/** The words for ground a late frost settles on, as a fact on the cards. */
export const HOLLOW_FACT = 'Frost hollow: late frost settles here';

/** The late frost under way that is biting now, with its strength, or null. */
export function frostNow(s: GameState, time = s.time): Active | null {
  let best: Active | null = null;
  for (const a of activeEvents(s.scenario, time)) if (a.event.kind === 'lateFrost' && a.intensity >= BITES_AT && (!best || a.event.strength === 'severe')) best = a;
  return best;
}

/** The late frost that takes a crop growing (now, or at `time`) in a field with its north-west tile at (x, y), or null: a frost is biting, it lies on the field, and the crop is tender. */
export function frostHits(s: GameState, crop: CropId, x: number, y: number, time = s.time): Active | null {
  if (!CROPS[crop].tender) return null;
  const a = frostNow(s, time);
  return a && frostedTiles(s, x, y, a.event.strength) >= FIELD_TILES ? a : null;
}

/** The late frost that takes the crop growing in a field now, or null. */
export const frostTakes = (s: GameState, f: FieldBuilding): Active | null => frostHits(s, f.crop, f.x, f.y);

// ---- The rime ----

const HOUR = DAY_SECONDS / 24;
/** How long the rime takes to melt once the frost is over (game hours): through the morning. */
export const MELT_HOURS = 3;

/**
 * The rime on the frozen ground at a time, 0–1 on the tiles every frost lies on (`hollows`) and on the slopes only a severe frost
 * reaches (`slopes`); null when there is none. Each frost's rime builds in with it, lies until it ends and melts away over
 * MELT_HOURS (from what had built up if it was cut short); the most of the frosts' rime shows, so one that follows another keeps
 * what the first left.
 */
export function rimeAt(sc: Pick<Scenario, 'events'>, time: number): { hollows: number; slopes: number } | null {
  let hollows = 0, slopes = 0;
  for (const e of sc.events) {
    if (e.kind !== 'lateFrost' || time < e.start) continue;
    // What it has built by `t` into it, never more than the event itself reaches (one cut short fades before the rime would have).
    const end = endOf(e), up = (t: number) => { const u = Math.min(1, t / (RAMP_HOURS * HOUR)); return u * u * (3 - 2 * u); }, peak = up(e.length / 2);
    const amount = time < end ? Math.min(up(time - e.start), peak) : peak * Math.max(0, 1 - (time - end) / (MELT_HOURS * HOUR));
    hollows = Math.max(hollows, amount);
    if (e.strength === 'severe') slopes = Math.max(slopes, amount);
  }
  return hollows > 0 ? { hollows, slopes } : null;
}
