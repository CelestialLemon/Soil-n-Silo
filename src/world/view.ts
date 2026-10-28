import * as THREE from 'three';
import type { PixelObject, PixelRenderer } from 'pixel3d-renderer';
import { CROPS, HIVE, POWER, TICK, TRUCK, type BuildingId, type ItemId } from '../game/data.ts';
import { TERRAIN } from '../game/map.ts';
import { networkOf, networks } from '../game/power.ts';
import { isOpen } from '../game/roads.ts';
import { readHold } from '../game/hold.ts';
import { panelSnow } from '../game/snow.ts';
import { shareOf, wants } from '../game/sim/energy.ts';
import { daylight, windAt } from '../game/sim/clock.ts';
import { exposureOf } from '../game/sim/layout.ts';
import { TURBINE_WEAK, turbineShare } from '../game/wind.ts';
import { HANDOFF_SECONDS, recentHandoffs } from '../game/sim/goods.ts';
import { cutOff, lastPose } from '../game/sim/trucks.ts';
import { buildingById, growsCrops, inMap, isMachine, layoutOf, reliefOf, sizeOf, terrainAt, type Building, type Dir, type FieldBuilding, type GameState, type Status, type Truck } from '../game/state.ts';
import { isBank, overlayTiles, sheet, standY, Tris, type HaloThing, type Lie } from './ground.ts';
import { baseLevel, centreLevel } from '../game/relief.ts';
import { hash } from './kit.ts';
import { treeAt, wetAt } from './trees.ts';
import type { Models } from './models.ts';
import { GROUND_TINT, soilBand, soilOf, TRUCK_BED } from './shapes.ts';
import { GROUND_IDS } from '../game/ground.ts';

// Shows the game state with renderer objects. Every frame it adds, swaps and removes objects so the world matches the state:
// buildings (idle or running), fields' soil and crops, trucks (with their cargo in the bed, queuing in line behind the one
// loading), trees and rocks. Status markers are the HUD's (a shape and a tint over each building with a problem): this says
// where they go. It remembers which building or truck each object belongs to, for picking and
// highlights.

const YAW: Record<Dir, number> = { 0: Math.PI, 1: Math.PI / 2, 2: 0, 3: -Math.PI / 2 };

/** An object shown, what it shows, and its geometry if it is its own (made for it, so disposed with it). */
interface Shown { obj: PixelObject; key: string; own?: THREE.BufferGeometry }

const v = new THREE.Vector3(), e = new THREE.Euler();

/** Overlay colours: soil from poor (red) to rich (green), roads (and buildings trucks can't reach), sprinkler water, bee range (power: powerView.ts). */
const FERT = [0xb03020, 0xd07020, 0xd8b020, 0x98c030, 0x50a030, 0x207a30].map((c) => new THREE.Color(c));
/** The Ground view's colour per kind of ground, by the map's index (`GROUND_IDS`). */
const GROUND_COLOURS = GROUND_IDS.map((id) => new THREE.Color(GROUND_TINT[id]));
const ROADS = new THREE.Color(0xd8d0b0), CUT_OFF = new THREE.Color(0xff5040), WATER = new THREE.Color(0x60a8e8), BEES = new THREE.Color(0xf09030);
/** The tint of the buildings and trucks linked to what is focused: a truck's stops, a garage's trucks. */
export const LINK = 0x7ee060;
const LINKED = new THREE.Color(LINK), LINK_STRENGTH = 0.55;
/** The white of snow on roofs and panels, and how white a roof goes under snow lying on the ground and a panel under the snow a blizzard left on it (the tint's strength). */
const SNOW = new THREE.Color(0xf2f6fc), ROOF_SNOW = 0.55, PANEL_SNOW = 0.9;
/** How far apart trucks queuing at a building stand, one behind the other. */
const QUEUE_GAP = 0.8;
/**
 * How a truck was last shown: its place back from the front of its line (as a step back in the world) and its phase, and
 * how far it still stands from where it should (`cx`, `cz`), closing at the speed it drives, so it moves up a line rather than
 * jumping.
 */
interface TruckShown { obj: PixelObject; bx: number; bz: number; phase: Truck['phase']; jumps: number; cx: number; cz: number; x: number; z: number }
/** How far a field's soil stands over the ground (m). */
const SOIL_TOP = 0.03;

export type Overlay = 'none' | 'fertility' | 'ground' | 'height' | 'power' | 'roads' | 'water' | 'bees';

/** The height view: tints from low to high, a band every HEIGHT_BAND levels (blended between), steep banks darker. */
const LEVELS = [0x3a8a5a, 0x8ab84a, 0xd8c050, 0xd88a3a, 0xb04a3a].map((c) => new THREE.Color(c));
const HEIGHT_BAND = 3, BANK_SHADE = 0.75;
const heightTint = (level: number, steep: boolean) => {
  const t = Math.min(LEVELS.length - 1, level / HEIGHT_BAND), k = Math.min(LEVELS.length - 2, Math.floor(t));
  const c = LEVELS[k].clone().lerp(LEVELS[k + 1], t - k);
  return steep ? c.multiplyScalar(BANK_SHADE) : c;
};

export class WorldView {
  /**
   * Counts the objects shown or taken away (a building placed, removed or swapped for another look, a tree cleared, a truck
   * bought, a good loaded or handed to another truck): what is under the pointer may have changed. Trucks driving on are not
   * counted.
   */
  changes = 0;
  private readonly targets = new Map<PixelObject, number>();
  private readonly shown = new Map<number, Shown>();
  private readonly parts = new Map<number, Shown[]>();
  private linksKey = '';
  private readonly linked = new Set<number>();
  private tinted: PixelObject[] = [];
  /** Truck objects by truck id, and how each was last shown. */
  private readonly trucks = new Map<number, TruckShown>();
  /** The game the trucks were last shown for, and its time then (with the part of a step since). */
  private truckGame: GameState | null = null;
  private truckClock = 0;
  private readonly pools = new Map<ItemId, { objs: PixelObject[]; used: number }>();
  private readonly terrain: (Shown | null)[] = [];
  /** The map tile of each tree and rock object. */
  private readonly terrainTiles = new Map<PixelObject, { x: number; y: number }>();
  private terrainKey = '';
  private overlayObjs: { o: PixelObject; g: THREE.BufferGeometry }[] = [];
  private overlayKey = '';
  private readonly r: PixelRenderer;
  private readonly m: Models;
  private readonly lie: Lie;
  /** A colour as the palette drew it, for what is drawn on the ground (MapGround's `paint`). */
  private readonly paint: (hex: number) => [number, number, number];

  /** The trees and rocks on the country drawn with the map (terrain.ts), and the height each stands at. */
  private readonly halo: { thing: HaloThing; obj: PixelObject | null; y: number }[];

  constructor(r: PixelRenderer, m: Models, lie: Lie, paint: (hex: number) => [number, number, number], halo: readonly HaloThing[]) {
    this.r = r; this.m = m; this.lie = lie; this.paint = paint;
    this.halo = halo.map((thing) => ({ thing, obj: null, y: NaN }));
  }

  /** The building or truck an object belongs to (id), or null. */
  buildingOf(o: PixelObject | null): number | null {
    return o ? this.targets.get(o) ?? null : null;
  }

  /** The tile of a tree or rock object, or null. */
  terrainOf(o: PixelObject | null): { x: number; y: number } | null {
    return o ? this.terrainTiles.get(o) ?? null : null;
  }

  /** Every visible object of a building or truck, to highlight together. */
  objectsOf(id: number): PixelObject[] {
    const out: PixelObject[] = [];
    const truck = this.trucks.get(id), main = this.shown.get(id) ?? truck;
    if (main) out.push(main.obj);
    for (const p of this.parts.get(id) ?? []) out.push(p.obj);
    return out;
  }

  private add(g: THREE.BufferGeometry, id: number | null) {
    this.changes++;
    const o = this.r.addObject(g);
    if (id !== null) this.targets.set(o, id);
    return o;
  }

  private drop(o: PixelObject) { this.changes++; this.targets.delete(o); o.remove(); }

  /** Shows `key` in a slot, replacing what it showed; `own` when the geometry is made for it (and goes with it). */
  private show(slot: Shown | undefined, key: string, g: () => THREE.BufferGeometry, id: number | null, place: (o: PixelObject) => void, own = false): Shown {
    if (slot && slot.key === key) return slot;
    if (slot) { this.drop(slot.obj); slot.own?.dispose(); }
    const geometry = g(), obj = this.add(geometry, id);
    place(obj);
    return own ? { obj, key, own: geometry } : { obj, key };
  }

  sync(s: GameState) {
    this.syncTerrain(s);
    const alive = new Set<number>();
    const wind = windAt(s.scenario, s.time);
    for (const b of s.buildings) {
      alive.add(b.id);
      const n = sizeOf(b), cx = b.x + n / 2, cz = b.y + n / 2;
      if (growsCrops(b)) { this.syncField(s, b); continue; }
      const running = isRunning(b);
      const y = standY(this.lie, s.map, n, b.x, b.y);
      let key = `${b.type} ${b.x} ${b.y} ${b.rot} ${running} ${y}`;
      let geo = () => this.m.buildings[b.type][running ? 'running' : 'idle'];
      if (b.type === 'turbine') {
        // Index 0 is the rotor standing still: stopped by a gale, whatever the turbine's own status; furled to a crawl in one it shelters from.
        const share = turbineShare(s, b.id, exposureOf(s, b));
        const speed = share <= 0 ? 0 : share <= TURBINE_WEAK ? 1 : wind < 0.35 ? 1 : wind < 0.7 ? 2 : 3;
        key += ` ${speed}`;
        geo = () => this.m.turbine[speed];
      }
      if (b.type === 'station') {
        // The cups turn with the wind, powered or not: light, moderate or strong.
        const band = wind < 0.35 ? 0 : wind < 0.7 ? 1 : 2;
        key += ` ${band}`;
        geo = () => this.m.station[band];
      }
      if (b.type === 'battery') {
        // Its charge rings light from the bottom up, one per quarter (any charge at all lights the first).
        const k = b.charge / POWER.battery.capacity, level = k < 0.02 ? 0 : Math.min(4, Math.ceil(k * 4 - 0.02));
        key += ` ${level}`;
        geo = () => this.m.battery[level];
      }
      this.shown.set(b.id, this.show(this.shown.get(b.id), key, geo, b.id, (o) => o.setTransform(v.set(cx, y, cz), e.set(0, YAW[b.rot], 0))));
    }
    for (const [id, sh] of this.shown) if (!alive.has(id)) { this.drop(sh.obj); this.shown.delete(id); }
    for (const [id, ps] of this.parts) if (!alive.has(id)) { for (const p of ps) { this.drop(p.obj); p.own?.dispose(); } this.parts.delete(id); }
    this.syncTrucks(s);
  }

  private syncField(s: GameState, f: FieldBuilding) {
    const list = this.parts.get(f.id) ?? [];
    const crop = CROPS[f.crop];
    // Every tile shows the field's stage; a harvest waiting shows ripe until a truck picks it up.
    const stage = f.stored >= crop.yield ? crop.stages - 1 : Math.min(crop.stages - 1, Math.floor(f.growth * crop.stages));
    // The ground under a field can move when earthworks nearby are fitted in (ground.ts, Lie).
    const lie = reliefOf(s);
    // The nine tiles' soil is one geometry: keyed on each tile's fertility band and ground (which tint it) and on the relief.
    const tiles: string[] = [];
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
      const at = y * s.map.width + x;
      tiles.push(`${soilBand(s.map.fertility[at])}:${s.map.ground[at]}`);
    }
    list[0] = this.show(list[0], `soil ${f.x} ${f.y} ${tiles.join(',')} ${lie}`, () => this.soil(s, f), f.id, (o) => o.setTransform(v.set(0, 0, 0), e.set(0, 0, 0)), true);
    let i = 1;
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
      const turn = Math.floor(hash(x, y) * 4) * Math.PI / 2;
      list[i] = this.show(list[i], `crop ${x} ${y} ${f.crop} ${stage} ${lie}`, () => this.m.crops[f.crop][stage], f.id,
        (o) => o.setTransform(v.set(x + 0.5, this.lie.y(x + 0.5, y + 0.5) + SOIL_TOP, y + 0.5), e.set(0, turn, 0)));
      i++;
    }
    // A glass shell over the game's crops; heater lanterns light only on nights receiving heat.
    if (f.type === 'greenhouse') {
      const y = standY(this.lie, s.map, 3, f.x, f.y);
      const heated = !daylight(s.scenario, s.time) && !!networkOf(s, f) && wants(s, f) * shareOf(s, f) > 0;
      list[i] = this.show(list[i], `shell ${f.x} ${f.y} ${y} ${heated}`, () => this.m.buildings.greenhouse[heated ? 'running' : 'idle'], f.id, (o) => o.setTransform(v.set(f.x + 1.5, y, f.y + 1.5), e.set(0, 0, 0)));
    }
    this.parts.set(f.id, list);
  }

  /** A field's soil, by each tile's fertility band and ground (which tint it): on every tile a raised bed over the ground, with three furrows across it. */
  private soil(s: GameState, f: FieldBuilding) {
    const t = new Tris(this.paint);
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
      const at = y * s.map.width + x, band = soilBand(s.map.fertility[at]), kind = s.map.ground[at], furrow = soilOf(Math.max(0, band - 1), kind);
      sheet(t, this.lie, x, y, [0.01, 0.01, 0.99, 0.99], SOIL_TOP, soilOf(band, kind), true);
      for (const z of [0.2, 0.5, 0.8]) sheet(t, this.lie, x, y, [0.05, z - 0.04, 0.95, z + 0.04], SOIL_TOP + 0.015, furrow, true);
    }
    return t.geometry();
  }

  /** Where each building with a problem shows its marker: a point over it, in world space. */
  markerSpots(s: GameState): { id: number; status: Status; need?: string; x: number; y: number; z: number }[] {
    const out: { id: number; status: Status; need?: string; x: number; y: number; z: number }[] = [];
    for (const b of s.buildings) {
      if (!hasMarker(b)) continue;
      const n = sizeOf(b), h = this.m.buildings[b.type].height;
      out.push({ id: b.id, status: b.status, need: b.need, x: b.x + n / 2, y: standY(this.lie, s.map, n, b.x, b.y) + (growsCrops(b) ? 0.9 : h) + 0.35, z: b.y + n / 2 });
    }
    return out;
  }

  /** Where a truck is shown, on the ground (tiles), or null if it isn't. */
  truckAt(id: number): { x: number; z: number } | null {
    const t = this.trucks.get(id);
    return t ? { x: t.x, z: t.z } : null;
  }

  /**
   * Every truck, facing the way it drives, with its cargo in its bed; trucks queuing stand in line behind the one loading.
   * Each is drawn between where it stood as the last step began and where it stands now, by how far the next step has got,
   * so it drives smoothly rather than a step at a time; one moving up a line (or onto the bay) drives there at its driving speed.
   */
  private syncTrucks(s: GameState) {
    for (const p of this.pools.values()) p.used = 0;
    // The game time since the trucks were last shown: none while paused, and none for a game just loaded or begun.
    const clock = s.time + s.carry, since = this.truckGame === s ? Math.max(0, clock - this.truckClock) : 0;
    if (this.truckGame !== s) { for (const o of this.trucks.values()) this.drop(o.obj); this.trucks.clear(); }
    this.truckGame = s; this.truckClock = clock;
    const k = Math.min(1, Math.max(0, s.carry / TICK));
    // Each queuing truck's place in its line: 1 for the first behind the building's bay.
    const place = new Map<Truck, number>(), lines = new Map<number, Truck[]>();
    for (const t of s.trucks) if (t.phase === 'queue' && t.target !== null) { const l = lines.get(t.target); if (l) l.push(t); else lines.set(t.target, [t]); }
    for (const l of lines.values()) l.sort((a, b) => a.arrived - b.arrived || a.id - b.id).forEach((t, i) => place.set(t, i + 1));
    const alive = new Set<number>();
    for (const t of s.trucks) {
      alive.add(t.id);
      const p = lastPose(s, t), jumps = p?.jumps ?? 0;
      // Turned the short way round.
      const heading = p ? p.heading + (Math.atan2(Math.sin(t.heading - p.heading), Math.cos(t.heading - p.heading))) * k : t.heading;
      const back = (place.get(t) ?? 0) * QUEUE_GAP, bx = -Math.sin(t.heading) * back, bz = -Math.cos(t.heading) * back;
      let o = this.trucks.get(t.id);
      if (!o) { o = { obj: this.add(this.m.truck, t.id), bx, bz, phase: t.phase, jumps, cx: 0, cz: 0, x: t.x, z: t.y }; this.trucks.set(t.id, o); }
      if (o.jumps !== jumps) { o.cx = 0; o.cz = 0; }
      // Moving up its line, or from the line onto the bay, it starts from where it stood. (Joining a line it still steps back
      // into it at once: easing that would drive it back through the trucks already waiting.)
      else if (o.phase === 'queue' && (o.bx !== bx || o.bz !== bz)) { o.cx += o.bx - bx; o.cz += o.bz - bz; }
      // It closes at the speed it drives: a crawl on an empty battery.
      const gap = Math.hypot(o.cx, o.cz), speed = t.energy > 0 ? TRUCK.speed : TRUCK.crawl;
      const close = gap > 1e-9 ? Math.max(0, gap - speed * since) / gap : 0;
      o.cx *= close; o.cz *= close;
      Object.assign(o, { bx, bz, phase: t.phase, jumps });
      const x = (p ? p.x + (t.x - p.x) * k : t.x) + bx + o.cx, z = (p ? p.y + (t.y - p.y) * k : t.y) + bz + o.cz;
      o.x = x; o.z = z;
      // On a ramp it leans with the ground: the slope along its heading, from the ground a little ahead of it and behind.
      const fx = Math.sin(heading) * 0.3, fz = Math.cos(heading) * 0.3;
      const gy = this.lie.y(x, z), lean = Math.atan2(this.lie.y(x + fx, z + fz) - this.lie.y(x - fx, z - fz), 0.6);
      o.obj.setTransform(v.set(x, gy, z), e.set(-lean, heading, 0, 'YXZ'));
      t.cargo.forEach((item, i) => {
        const [sx, sz] = TRUCK_BED.slots[i % TRUCK_BED.slots.length], c = Math.cos(heading), sn = Math.sin(heading);
        this.putGood(item, x + sx * c + sz * sn, gy + TRUCK_BED.y + Math.tan(lean) * sz, z - sx * sn + sz * c, heading, TRUCK_BED.scale, t.id);
      });
    }
    for (const [id, o] of this.trucks) if (!alive.has(id)) { this.drop(o.obj); this.trucks.delete(id); }
    this.syncHandoffs(s);
    for (const p of this.pools.values()) for (let i = p.used; i < p.objs.length; i++) if (p.objs[i].visible) { p.objs[i].visible = false; this.changes++; }
  }

  /** Goods handed to a building next door, each hopping over the edge the two share. */
  private syncHandoffs(s: GameState) {
    for (const hd of recentHandoffs(s)) {
      const a = buildingById(s, hd.from), b = buildingById(s, hd.to);
      if (!a || !b) continue;
      const k = Math.min(1, Math.max(0, (s.time - hd.time) / HANDOFF_SECONDS));
      const ex = edge(a.x, sizeOf(a), b.x, sizeOf(b)), ez = edge(a.y, sizeOf(a), b.y, sizeOf(b));
      // From half a tile inside the giver to half a tile inside the taker, in an arc (down a cliff when the taker is lower).
      const x = ex.at + ex.dir * (k - 0.5), z = ez.at + ez.dir * (k - 0.5);
      const ya = standY(this.lie, s.map, sizeOf(a), a.x, a.y), yb = standY(this.lie, s.map, sizeOf(b), b.x, b.y);
      this.putGood(hd.item, x, ya + (yb - ya) * k * k + 0.35 + Math.sin(Math.PI * k) * 0.5, z, 0, 0.6, null);
    }
  }

  /** A good from the pool of objects for its kind; picking it picks `owner` (the truck carrying it), if any. */
  private putGood(item: ItemId, x: number, y: number, z: number, yaw: number, scale: number, owner: number | null) {
    let p = this.pools.get(item);
    if (!p) { p = { objs: [], used: 0 }; this.pools.set(item, p); }
    let o = p.objs[p.used];
    if (!o) { o = this.add(this.m.items[item], null); o.castShadow = false; p.objs.push(o); }
    p.used++;
    // Handed to another truck, or shown again: picking it now picks something else.
    if ((this.targets.get(o) ?? null) !== owner || !o.visible) this.changes++;
    if (owner === null) this.targets.delete(o); else this.targets.set(o, owner);
    o.visible = true;
    o.setTransform(v.set(x, y, z), e.set(0, yaw, 0), scale);
  }

  /**
   * Tints the buildings and trucks linked to what is focused (a truck's stops, a garage's trucks), so you can see who works
   * with whom; none with an empty list. Call after `sync` every frame: an object is swapped when its building starts or
   * stops running.
   */
  links(ids: number[]) {
    const key = ids.join(' ');
    if (key !== this.linksKey) {
      this.linksKey = key;
      this.linked.clear();
      for (const id of ids) this.linked.add(id);
    }
    const want: PixelObject[] = [];
    for (const id of this.linked) want.push(...this.objectsOf(id));
    for (const o of this.tinted) if (!want.includes(o)) o.tint = null;
    for (const o of want) if (o.tint !== LINKED) { o.tint = LINKED; o.tintStrength = LINK_STRENGTH; }
    this.tinted = want;
  }

  /**
   * Snow on the buildings: roofs go white with the snow lying on the ground (`ground`, 0–1), and a solar panel with the snow a
   * blizzard left on it. Call after `links` every frame: a building's tint is the link's while it is linked.
   */
  snow(s: GameState, ground: number) {
    const panels = panelSnow(s.scenario, s.time)?.intensity ?? 0;
    for (const b of s.buildings) {
      // Fields keep their soil/crops untinted; only the greenhouse's final part is its shell.
      const o = b.type === 'greenhouse' ? this.parts.get(b.id)?.at(-1)?.obj : this.shown.get(b.id)?.obj;
      if (!o || o.tint === LINKED) continue;
      const k = Math.max(ground * ROOF_SNOW, b.type === 'solar' ? panels * PANEL_SNOW : 0);
      if (k < 0.02) { if (o.tint === SNOW) o.tint = null; continue; }
      if (o.tint !== SNOW) o.tint = SNOW;
      o.tintStrength = k;
    }
  }

  /** Trees and rocks on the map, as objects so they can be cleared. */
  private syncTerrain(s: GameState) {
    const key = `${layoutOf(s)} ${reliefOf(s)}`;
    if (key === this.terrainKey) return;
    this.terrainKey = key;
    const { width: w } = s.map;
    s.map.terrain.forEach((t, i) => {
      const x = i % w, y = Math.floor(i / w), n = hash(x, y);
      const gy = this.lie.y(x + 0.5, y + 0.5), lie = gy.toFixed(3), want = t === TERRAIN.tree ? `tree${Math.floor(n * 3)} ${lie}` : t === TERRAIN.rock ? `rock${Math.floor(n * 3)} ${lie}` : null;
      const cur = this.terrain[i];
      if (cur && cur.key === want) return;
      if (cur) { this.terrainTiles.delete(cur.obj); this.drop(cur.obj); this.terrain[i] = null; }
      if (!want) return;
      const tree = t === TERRAIN.tree ? treeAt(x, y, baseLevel(s.map, x, y), wetAt((wx, wy) => inMap(s, wx, wy) && terrainAt(s, wx, wy) === TERRAIN.water, x, y)) : null;
      const g = tree ? this.m.trees[tree.species][tree.variant] : this.m.rocks[Math.floor(n * 3) % 3];
      const obj = this.add(g, null);
      obj.setTransform(v.set(x + 0.5, gy, y + 0.5), e.set(0, n * Math.PI * 2, 0), t === TERRAIN.tree ? 0.62 + 0.25 * n : 1);
      this.terrainTiles.set(obj, { x, y });
      this.terrain[i] = { obj, key: want };
    });
    // The country's round the map, standing on its ground as earthworks on the map's edge move it.
    for (const h of this.halo) {
      const { g, x, z, yaw, scale, sink } = h.thing, y = this.lie.y(x, z) - sink;
      if (Math.abs(y - h.y) < 1e-3) continue;
      h.y = y;
      h.obj ??= this.r.addObject(g);
      h.obj.setTransform(v.set(x, y, z), e.set(0, yaw, 0), scale);
    }
  }

  /** Overlay tiles in `tint` over the map tiles listed (by index), `lift` above their ground, as one object. */
  private tiles(s: GameState, list: Iterable<number>, lift: number, tint: THREE.Color, opacity = 1) {
    const g = overlayTiles(this.lie, list, s.map.width, lift);
    if (!g.getAttribute('position').count) { g.dispose(); return; }
    const o = this.r.addObject(g);
    o.setTransform(v.set(0, 0, 0), e.set(0, 0, 0));
    o.tint = tint; o.tintStrength = 1; o.castShadow = false; o.opacity = opacity;
    this.overlayObjs.push({ o, g });
  }

  /**
   * Coloured tiles over the map: soil fertility, the kind of ground, roads (the open ground trucks drive on, and red under the buildings they
   * can't reach), sprinkler water or bee range. Power is PowerView's.
   */
  overlay(s: GameState, kind: Overlay) {
    if (kind === 'power') kind = 'none';
    const key = kind === 'none' ? 'none' : `${kind} ${reliefOf(s)} ${kind === 'fertility' ? s.map.fertility.map((f) => Math.floor(f / 17)).join('') : kind === 'ground' ? s.scenario.seed : ''} ${s.buildings.length} ${networks(s).layout} ${layoutOf(s)}${kind === 'roads' ? ` ${s.buildings.filter((b) => cutOff(s, b)).map((b) => b.id).join(',')}` : ''}`;
    if (key === this.overlayKey) return;
    this.overlayKey = key;
    for (const { o, g } of this.overlayObjs) { o.remove(); g.dispose(); }
    this.overlayObjs = [];
    if (kind === 'none') return;
    const { width: w, height: h } = s.map;
    /** Tiles by their tint. */
    const by = (tint: (i: number) => THREE.Color | null) => {
      const out = new Map<THREE.Color, number[]>();
      for (let i = 0; i < w * h; i++) { const c = tint(i); if (!c) continue; const l = out.get(c); if (l) l.push(i); else out.set(c, [i]); }
      return out;
    };
    if (kind === 'height') {
      // A tint per level band (blended between), steep banks darker: one object per tint.
      const tints = new Map<string, THREE.Color>();
      const groups = by((i) => {
        if (s.map.terrain[i] === TERRAIN.water) return null;
        const x = i % w, y = Math.floor(i / w), c = heightTint(centreLevel(s.map, x, y), isBank(s.map, x, y)), k = c.getHexString();
        const known = tints.get(k);
        if (known) return known;
        tints.set(k, c);
        return c;
      });
      for (const [tint, list] of groups) this.tiles(s, list, 0.02, tint);
      return;
    }
    if (kind === 'fertility') {
      for (const [tint, list] of by((i) => (s.map.terrain[i] === TERRAIN.grass ? FERT[Math.min(5, Math.floor(s.map.fertility[i] / 17))] : null))) this.tiles(s, list, 0.02, tint);
      return;
    }
    if (kind === 'ground') {
      for (const [tint, list] of by((i) => (s.map.terrain[i] === TERRAIN.grass ? GROUND_COLOURS[s.map.ground[i]] : null))) this.tiles(s, list, 0.02, tint);
      return;
    }
    if (kind === 'roads') {
      const open: number[] = [], cut: number[] = [];
      for (let i = 0; i < w * h; i++) if (isOpen(s, i % w, Math.floor(i / w))) open.push(i);
      for (const b of s.buildings) {
        if (!cutOff(s, b)) continue;
        for (let y = b.y; y < b.y + sizeOf(b); y++) for (let x = b.x; x < b.x + sizeOf(b); x++) cut.push(y * w + x);
      }
      this.tiles(s, open, 0.02, ROADS, 0.4);
      this.tiles(s, cut, 0.05, CUT_OFF);
      return;
    }
    const mark = new Set<number>();
    const cover = (bx: number, by: number, n: number, r: number) => {
      for (let y = by - r; y < by + n + r; y++) for (let x = bx - r; x < bx + n + r; x++) if (x >= 0 && y >= 0 && x < w && y < h) mark.add(y * w + x);
    };
    for (const b of s.buildings) {
      if (kind === 'water' && b.type === 'sprinkler') cover(b.x - 1, b.y - 1, 3, POWER.sprinklerReach - 1);
      if (kind === 'bees' && b.type === 'hive') cover(b.x, b.y, 1, HIVE.reach);
    }
    this.tiles(s, mark, 0.02, kind === 'water' ? WATER : BEES);
  }
}

/**
 * Where two footprints meet along one axis (a from `a0`, b from `b0`, `na` and `nb` tiles long): the line between them and
 * which way it is crossed from a to b, or the middle of their overlap (not crossed) when they lie side by side on it.
 */
function edge(a0: number, na: number, b0: number, nb: number): { at: number; dir: number } {
  if (a0 + na <= b0) return { at: b0, dir: 1 };
  if (b0 + nb <= a0) return { at: a0, dir: -1 };
  return { at: (Math.max(a0, b0) + Math.min(a0 + na, b0 + nb)) / 2, dir: 0 };
}

/** Is it doing its thing (to show its running look)? */
function isRunning(b: Building) {
  // Weather that only slows or weakens it leaves it running; stopped (a machine keeps its progress for later), it rests.
  if (b.status === 'weather' && readHold(b.need)?.effect === 'stopped') return false;
  if (isMachine(b)) return b.progress !== null;
  return b.status === 'ok' || b.status === 'weather';
}

const QUIET = new Set<BuildingId>(['depot', 'sapling']);

/** Whether a building shows a marker: it has a problem (not working, not just idle). */
const hasMarker = (b: Building) => !QUIET.has(b.type) && b.status !== 'ok' && b.status !== 'idle';

