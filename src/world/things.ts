// The things the player places (src/game/catalog.ts): each drawn with its brush3d model (loaded once, awaited, before the
// valley is shown), on its own tagged meshes so a pick names it and one comes and goes without the rest being built
// again. They stand on the ground as drawn: a thing whose ground is being worked again (its settled pad) waits for brush3d
// to swap the new land in and is built in that frame. Their moving parts and lights follow the living homestead (each
// building's runtime, state.sim.things): turbines turn with the wind at their hub, water wheels with the water in their
// race, the mill's stone and the composter's drum only while they work (the mill's with power too), the bakery's oven
// glows and smokes while it bakes with power, the garage's lamp while it has power, the battery's rings show its charge,
// the farmhouse smokes and its windows light after sunset while it has power, the lanterns (self-charging) and the Depot's
// beacon glow after dusk always (brush3d lights what runs, at night). The Weather Station's anemometer cups spin with the
// wind at its mast, and the Heated Greenhouse's lanterns glow warm at night while it's heated and powered. The Oil Press's
// handwheel and the Spinner's wheel turn, the Cannery's stove glows and steams and the Loom weaves only while they work with
// power; the Biogas Digester's flare burns while it burns waste, whatever the sky. What has no power sits quiet and dark.
import * as THREE from 'three';
import {
  blocksWind, type BrushRenderer, type LandArea, loadModel, MODELS, type ModelParts, ModelSet, type Obstacle,
} from '../../brush3d/src/index.ts';
import {
  CATALOG, type Change, clamp, type GameState, isWet, must, runtimeOf, type Thing, type ThingKind, THING_KINDS, thingObb, toWorld,
} from '../game/index.ts';
import { dropAll, tagOf } from './util.ts';

/** The models every placeable thing uses, loaded once (by model name). */
export type ModelCache = ReadonlyMap<string, THREE.Object3D>;

/** The Electric Cart's model (brush3d's truck: front towards +z, an open bed behind the cab). */
export const CART_MODEL = 'truck';

/** Loads every placeable thing's model and the cart's (each file once). */
export async function loadModels(): Promise<ModelCache> {
  const names = [...new Set([...THING_KINDS.map((k) => CATALOG[k].model), CART_MODEL])];
  const loaded = await Promise.all(names.map(async (name) => {
    const info = MODELS[name] as (typeof MODELS)[string] | undefined;
    if (!info) throw new Error(`brush3d has no model called ${name}`);
    return [name, await loadModel(info.url)] as const;
  }));
  return new Map(loaded);
}

/** The model's name for a kind of thing (brush3d's MODELS key): for a ghost while placing. */
export const getModelForKind = (kind: ThingKind) => CATALOG[kind].model;

/** How often (Hz) the moving parts are told the game's state: they ease between. */
const PARTS_HZ = 4;
/** A battery's charge (0..1) at which each of its four rings lights, bottom up. */
const RINGS = [0.12, 0.37, 0.62, 0.87];

interface Item { thing: Thing; meshes: THREE.Mesh[]; parts: ModelParts; shown: string }

/** Where the wind is (m/s, along x and z) at a point and a height: the world's live wind. */
export type WindAt = (x: number, z: number, height: number) => [number, number];

export class Things {
  private readonly r: BrushRenderer;
  private state: GameState;
  private readonly models: ModelCache;
  private readonly items = new Map<number, Item>();
  /** Things waiting for the land under them to be swapped in (their pads being painted). */
  private readonly waiting = new Set<number>();
  private idle = 0;
  private selected: number | null = null;
  private clock = 0;
  /** The homestead moved on since the parts were last told. */
  private stale = true;
  private readonly ghosts = new Map<ThingKind, THREE.BufferGeometry>();
  private readonly stopLand: () => void;
  /** Whether what blocks the wind changed since the world last asked. */
  windChanged = false;

  constructor(r: BrushRenderer, state: GameState, models: ModelCache) {
    this.r = r; this.state = state; this.models = models;
    for (const t of state.things) this.build(t);
    this.stopLand = r.onLandChange((area) => this.landSwapped(area));
    this.windChanged = true;
  }

  reset(state: GameState) {
    for (const it of this.items.values()) dropAll(this.r, it.meshes);
    this.items.clear(); this.waiting.clear();
    this.state = state;
    for (const t of state.things) this.build(t);
    this.windChanged = true;
  }

  /** The things an edit placed, moved, turned or took away. `landSent`: their ground is being painted again. */
  sync(change: Change, landSent: boolean) {
    for (const id of change.things) {
      const old = this.items.get(id);
      if (old) { dropAll(this.r, old.meshes); this.items.delete(id); }
      this.waiting.delete(id);
      // Placed, moved, turned or taken away: what blocks the wind may have changed either way (a removed building must
      // stop sheltering its lee now, not at some later edit).
      this.windChanged = true;
      const t = this.state.things.find((o) => o.id === id);
      if (!t) continue;
      if (landSent && this.r.landAhead && CATALOG[t.kind].padEase > 0) this.waiting.add(id);
      else this.build(t);
    }
    if (change.powerChanged) for (const it of this.items.values()) it.shown = '';
  }

  /** Each frame: builds what waited once its land is in, and every so often (or when told the homestead moved on) tells the moving parts how things are. */
  frame(dt: number, windAt: WindAt) {
    if (this.waiting.size) {
      if (this.r.landAhead) this.idle = 0;
      else if (++this.idle > 3) { for (const id of [...this.waiting]) this.buildId(id); this.idle = 0; }
    }
    this.clock += dt;
    if (this.clock < 1 / PARTS_HZ && !this.stale) return;
    this.clock = 0; this.stale = false;
    for (const it of this.items.values()) this.showState(it, windAt);
  }

  /** The homestead moved on (a sim tick): the parts are told how things are on the next frame. */
  markStale() { this.stale = true; }

  /** Tells a thing's moving parts and lights how it is now (its runtime), only when that changed. */
  private showState(it: Item, windAt: WindAt) {
    const t = it.thing, rt = runtimeOf(this.state, t.id), g = this.state.grid;
    const powered = rt?.powered ?? false, working = rt?.working ?? false;
    let spin = 0, running = true, charge: number | undefined;
    switch (t.kind) {
      case 'turbine': {
        // A rotor turns with the wind whatever the network does with its power.
        const [u, v] = windAt(t.x, t.z, 14);
        spin = clamp(Math.hypot(u, v) / 6, 0.12, 2.5);
        break;
      }
      case 'weather_station': {
        // The cups spin with the wind at the mast's head, whatever the network does.
        const [u, v] = windAt(t.x, t.z, 4);
        spin = clamp(Math.hypot(u, v) / 4, 0.1, 3);
        running = true;
        break;
      }
      // Heated and powered, its warm lanterns glow after dusk; in a blackout the glass goes dark.
      case 'greenhouse': running = working && powered; break;
      case 'waterwheel': {
        const race = toWorld(t.x, t.z, t.yaw, 0, CATALOG.waterwheel.raceOffset);
        const ix = Math.floor((race.x - g.x0) / g.cell), iz = Math.floor((race.z - g.z0) / g.cell);
        const k = iz * g.nx + ix, wet = ix >= 0 && iz >= 0 && ix < g.nx && iz < g.nz && isWet(g.waterLevel[k]);
        spin = wet ? clamp(0.6 + Math.hypot(g.flowX[k], g.flowZ[k]), 0.6, 1.6) : 0;
        running = wet;
        break;
      }
      // Grinding needs wheat and power: waiting for either, the stone stands still and the flour stops.
      case 'sprinkler': running = (rt?.watts ?? 0) > 0; spin = running ? 1 : 0; break;
      case 'mill': running = working && powered; spin = running ? 1 : 0; break;
      case 'bakery': running = working && powered; break;
      // The press's handwheel and the great spinning wheel turn only while they work with power.
      case 'oil_press': case 'spinner': running = working && powered; spin = running ? 1 : 0; break;
      // The cannery's stove glows and its pipe steams while it works with power (its model's `running_glow` and
      // `smoke_emitter`). The loom's model has no moving or running part yet (brush3d/docs/MODELS.md): `running` is set for
      // it so a part added later lights up, and until then it stands still. Model tweaks go in their own renderer PR.
      case 'cannery': case 'loom': running = working && powered; break;
      // It makes its own power: its pipe smokes (the model's one part, `smoke_emitter`) while it burns waste, day or night,
      // in any weather; standing by with a full hopper it's quiet. The flare is painted on, not a running part.
      case 'digester': running = working; break;
      // The drum turns by hand-crank and gravity: no power, only something to turn.
      case 'composter': spin = working ? 1 : 0; running = working; break;
      case 'battery': running = powered; charge = RINGS.filter((at) => (rt?.charge ?? 0) >= at).length; break;
      case 'garage': case 'farmhouse': case 'coop': running = powered; break;
      // A solar lantern charges from its own little cap by day: it glows after dusk (brush3d lights what runs, at night)
      // power or none, even far out along a track beyond every power field.
      case 'lantern': running = true; break;
      // The settlement's landing keeps its beacon lit for the carts.
      case 'depot': running = true; break;
      default: break;
    }
    // Told only when it changes (a turbine's pace in steps of a tenth).
    const key = `${Math.round(spin * 10)} ${running ? 1 : 0} ${charge ?? '-'}`;
    if (key === it.shown) return;
    it.shown = key;
    it.parts.spin(spin);
    it.parts.show(charge === undefined ? { running } : { running, charge });
  }

  /** Highlights one thing (null: none). */
  setSelected(id: number | null) {
    if (this.selected !== null) for (const m of this.items.get(this.selected)?.meshes ?? []) this.r.setMark(m, null);
    this.selected = id;
    if (id !== null) for (const m of this.items.get(id)?.meshes ?? []) this.r.setMark(m, { highlight: true });
  }

  /** A ghost of a kind's model at rest at the origin, facing +z (the caller's preview places it). Cached; ours to free. */
  ghost(kind: ThingKind): THREE.BufferGeometry {
    const had = this.ghosts.get(kind);
    if (had) return had;
    const set = new ModelSet(7);
    set.add(must(this.models.get(CATALOG[kind].model), `the ${kind}'s model`), new THREE.Matrix4());
    const g = set.ink.build();
    this.ghosts.set(kind, g);
    return g;
  }

  /** What slows the wind: the buildings with walls. */
  obstacles(): Obstacle[] {
    const out: Obstacle[] = [];
    for (const t of this.state.things) {
      const def = CATALOG[t.kind], info = MODELS[def.model] as (typeof MODELS)[string] | undefined;
      if (!info || !blocksWind(info)) continue;
      const o = thingObb(t);
      out.push({ box: { x: o.cx, z: o.cz, hx: o.hw * 0.9, hz: o.hd * 0.9, turn: -o.yaw }, solid: true, height: def.top * 0.8 });
    }
    return out;
  }

  dispose() {
    this.stopLand();
    for (const it of this.items.values()) dropAll(this.r, it.meshes);
    this.items.clear();
    for (const g of this.ghosts.values()) g.dispose();
    this.ghosts.clear();
  }

  // ---- Building ----

  private buildId(id: number) {
    this.waiting.delete(id);
    const t = this.state.things.find((o) => o.id === id);
    if (t) this.build(t);
  }

  /** Builds a thing on the ground as drawn (its pad's height where it has one). */
  private build(t: Thing) {
    const old = this.items.get(t.id);
    if (old) dropAll(this.r, old.meshes);
    const def = CATALOG[t.kind], model = must(this.models.get(def.model), `the ${t.kind}'s model`);
    const y = def.padEase > 0 ? t.padTargetY : this.r.landAt(t.x, t.z);
    const set = new ModelSet(t.id * 7919 + 13);
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(t.x, y, t.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), t.yaw), new THREE.Vector3(1, 1, 1));
    const parts = set.add(model, matrix);
    const meshes = set.addTo(this.r, tagOf('thing', t.id));
    this.items.set(t.id, { thing: t, meshes, parts, shown: '' });
    // Shown as the homestead has it from its first frame, not as the model rests.
    this.stale = true;
    if (this.selected === t.id) for (const m of meshes) this.r.setMark(m, { highlight: true });
  }

  /** The land swapped in over `area`: things standing there (and those waiting for it) are built again on it. */
  private landSwapped(area: LandArea) {
    for (const t of this.state.things) {
      const o = thingObb(t), m = Math.hypot(o.hw, o.hd);
      if (o.cx < area.x0 - m || o.cx > area.x1 + m || o.cz < area.z0 - m || o.cz > area.z1 + m) continue;
      if (this.waiting.has(t.id) || this.items.has(t.id)) { this.waiting.delete(t.id); this.build(t); }
    }
  }

  /** The meshes of a thing, for its highlight. */
  meshesOf(id: number): THREE.Mesh[] { return this.items.get(id)?.meshes ?? []; }
}
