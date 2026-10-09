import * as THREE from 'three';
import type { PixelObject, PixelRenderer } from 'pixel3d-renderer';
import { BUILDINGS, CROPS, HIVE, POWER, ROUTER_SECONDS, type BuildingId, type ItemId } from '../game/data.ts';
import { TERRAIN } from '../game/map.ts';
import { networks } from '../game/power.ts';
import { padTarget, windAt } from '../game/sim.ts';
import { buildingById, centre, DX, DY, layoutOf, sizeOf, type Building, type Dir, type GameState } from '../game/state.ts';
import { hash } from './kit.ts';
import type { Models } from './models.ts';
import { soilBand } from './shapes.ts';

// Shows the game state with renderer objects. Every frame it adds, swaps and removes objects so the world matches the state:
// buildings (idle or running), fields' soil and crops, goods on belts and in splitters, drones in flight, status markers,
// trees and rocks. It remembers which building each object belongs to, for picking and highlights.

/** Height of a belt's deck, where goods ride. */
export const DECK = 0.16;

const YAW: Record<Dir, number> = { 0: Math.PI, 1: Math.PI / 2, 2: 0, 3: -Math.PI / 2 };

interface Shown { obj: PixelObject; key: string }

const v = new THREE.Vector3(), e = new THREE.Euler();

/** Overlay colours: soil from poor (red) to rich (green), pylon reach, sprinkler water, bee range. */
const FERT = [0xb03020, 0xd07020, 0xd8b020, 0x98c030, 0x50a030, 0x207a30].map((c) => new THREE.Color(c));
const REACH = new THREE.Color(0xf0d060), WATER = new THREE.Color(0x60a8e8), BEES = new THREE.Color(0xf09030);

export type Overlay = 'none' | 'fertility' | 'power' | 'water' | 'bees';

export class WorldView {
  private readonly targets = new Map<PixelObject, number>();
  private readonly shown = new Map<number, Shown>();
  private readonly parts = new Map<number, Shown[]>();
  private readonly markers = new Map<number, Shown>();
  private readonly drones = new Map<number, PixelObject>();
  private readonly pools = new Map<ItemId, { objs: PixelObject[]; used: number }>();
  private readonly terrain: (Shown | null)[] = [];
  /** The map tile of each tree and rock object. */
  private readonly terrainTiles = new Map<PixelObject, { x: number; y: number }>();
  private terrainKey = '';
  private overlayObjs: PixelObject[] = [];
  private overlayKey = '';
  private readonly r: PixelRenderer;
  private readonly m: Models;

  constructor(r: PixelRenderer, m: Models) { this.r = r; this.m = m; }

  /** The building an object belongs to (id), or null. */
  buildingOf(o: PixelObject | null): number | null {
    return o ? this.targets.get(o) ?? null : null;
  }

  /** The tile of a tree or rock object, or null. */
  terrainOf(o: PixelObject | null): { x: number; y: number } | null {
    return o ? this.terrainTiles.get(o) ?? null : null;
  }

  /** Every visible object of a building, to highlight together. */
  objectsOf(id: number): PixelObject[] {
    const out: PixelObject[] = [];
    const main = this.shown.get(id);
    if (main) out.push(main.obj);
    for (const p of this.parts.get(id) ?? []) out.push(p.obj);
    return out;
  }

  private add(g: THREE.BufferGeometry, id: number | null) {
    const o = this.r.addObject(g);
    if (id !== null) this.targets.set(o, id);
    return o;
  }

  private drop(o: PixelObject) { this.targets.delete(o); o.remove(); }

  private show(slot: Shown | undefined, key: string, g: () => THREE.BufferGeometry, id: number | null, place: (o: PixelObject) => void): Shown {
    if (slot && slot.key === key) return slot;
    if (slot) this.drop(slot.obj);
    const obj = this.add(g(), id);
    place(obj);
    return { obj, key };
  }

  sync(s: GameState) {
    this.syncTerrain(s);
    const alive = new Set<number>();
    const wind = windAt(s.scenario, s.time);
    for (const b of s.buildings) {
      alive.add(b.id);
      const n = sizeOf(b), cx = b.x + n / 2, cz = b.y + n / 2;
      if (b.type === 'field') { this.syncField(s, b); continue; }
      const running = isRunning(b);
      let key = `${b.type} ${b.x} ${b.y} ${b.rot} ${running}`;
      let geo = () => this.m.buildings[b.type][running ? 'running' : 'idle'];
      if (b.type === 'turbine') {
        const speed = wind < 0.35 ? 0 : wind < 0.7 ? 1 : 2;
        key += ` ${speed}`;
        geo = () => this.m.turbine[speed];
      }
      this.shown.set(b.id, this.show(this.shown.get(b.id), key, geo, b.id, (o) => o.setTransform(v.set(cx, 0, cz), e.set(0, YAW[b.rot], 0))));
      if (b.type === 'sorter') this.syncFilter(b, cx, cz);
    }
    for (const [id, sh] of this.shown) if (!alive.has(id)) { this.drop(sh.obj); this.shown.delete(id); }
    for (const [id, ps] of this.parts) if (!alive.has(id)) { for (const p of ps) this.drop(p.obj); this.parts.delete(id); }
    this.syncMarkers(s, alive);
    this.syncGoods(s);
    this.syncDrones(s, alive);
  }

  private syncField(s: GameState, f: Building) {
    const list = this.parts.get(f.id) ?? [];
    const crop = CROPS[f.crop!];
    // Every tile shows the field's stage; a harvest waiting shows ripe until a belt takes it.
    const stage = f.stored! >= crop.yield ? crop.stages - 1 : Math.min(crop.stages - 1, Math.floor(f.growth! * crop.stages));
    let i = 0;
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
      const band = soilBand(s.map.fertility[y * s.map.width + x]);
      list[i] = this.show(list[i], `soil ${x} ${y} ${band}`, () => this.m.soil[band], f.id, (o) => o.setTransform(v.set(x + 0.5, 0, y + 0.5)));
      i++;
      const turn = Math.floor(hash(x, y) * 4) * Math.PI / 2;
      list[i] = this.show(list[i], `crop ${x} ${y} ${f.crop} ${stage}`, () => this.m.crops[f.crop!][stage], f.id,
        (o) => o.setTransform(v.set(x + 0.5, 0.03, y + 0.5), e.set(0, turn, 0)));
      i++;
    }
    this.parts.set(f.id, list);
  }

  private syncFilter(b: Building, cx: number, cz: number) {
    const list = this.parts.get(b.id) ?? [];
    if (b.filter) {
      list[0] = this.show(list[0], `filter ${b.filter}`, () => this.m.items[b.filter!], b.id, (o) => o.setTransform(v.set(cx, 0.62, cz), e.set(0, 0, 0), 1.4));
    } else if (list[0]) { this.drop(list[0].obj); list.length = 0; }
    this.parts.set(b.id, list);
  }

  private syncMarkers(s: GameState, alive: Set<number>) {
    for (const b of s.buildings) {
      const colour = markerColour(b);
      const cur = this.markers.get(b.id);
      if (!colour) { if (cur) { this.drop(cur.obj); this.markers.delete(b.id); } continue; }
      const n = sizeOf(b), h = this.m.buildings[b.type].height;
      this.markers.set(b.id, this.show(cur, colour, () => this.m.markers[colour], b.id, (o) => (o.castShadow = false, o).setTransform(v.set(b.x + n / 2, (b.type === 'field' ? 0.9 : h) + 0.45, b.y + n / 2))));
    }
    for (const [id, sh] of this.markers) if (!alive.has(id)) { this.drop(sh.obj); this.markers.delete(id); }
  }

  /** Goods on belts and inside splitters, sorters and crossings, from pools of objects per good. */
  private syncGoods(s: GameState) {
    for (const p of this.pools.values()) p.used = 0;
    const put = (item: ItemId, x: number, y: number, z: number, yaw: number) => {
      let p = this.pools.get(item);
      if (!p) { p = { objs: [], used: 0 }; this.pools.set(item, p); }
      let o = p.objs[p.used];
      if (!o) { o = this.add(this.m.items[item], null); o.castShadow = false; p.objs.push(o); }
      p.used++;
      o.visible = true;
      o.setTransform(v.set(x, y, z), e.set(0, yaw, 0));
    };
    for (const b of s.buildings) {
      if (b.type === 'belt') {
        for (const it of b.items!) put(it.item, b.x + 0.5 + DX[b.rot] * (it.pos - 0.5), DECK, b.y + 0.5 + DY[b.rot] * (it.pos - 0.5), YAW[b.rot]);
      } else if (b.transit) {
        for (const t of b.transit) {
          // From the side it came in towards the middle.
          const k = Math.max(0, t.t) / ROUTER_SECONDS * 0.4;
          put(t.item, b.x + 0.5 + DX[t.from] * k, DECK + 0.02, b.y + 0.5 + DY[t.from] * k, 0);
        }
      }
    }
    for (const p of this.pools.values()) for (let i = p.used; i < p.objs.length; i++) p.objs[i].visible = false;
  }

  private syncDrones(s: GameState, alive: Set<number>) {
    for (const b of s.buildings) {
      if (b.type !== 'pad' || b.mode !== 'send') continue;
      let o = this.drones.get(b.id);
      if (!o) { o = this.add(this.m.drone, b.id); this.drones.set(b.id, o); }
      const d = b.drone!, home = centre(b);
      const target = d.target ? buildingById(s, d.target) : padTarget(s, b);
      const to = target ? centre(target) : home;
      let t = 0;
      if (d.phase === 'out') t = d.t; else if (d.phase === 'hover') t = 1; else if (d.phase === 'back') t = 1 - d.t;
      const x = home.x + (to.x - home.x) * t, z = home.y + (to.y - home.y) * t;
      const lift = d.phase === 'home' ? 0.35 : 0.35 + Math.min(1, Math.sin(Math.PI * t) * 3) * 2.2 + (d.phase === 'hover' ? 0.8 : 0);
      o.setTransform(v.set(x, lift, z), e.set(0, Math.atan2(to.x - home.x, to.y - home.y), 0));
    }
    for (const [id, o] of this.drones) {
      const b = alive.has(id) ? s.buildings.find((x) => x.id === id) : null;
      if (!b || b.mode !== 'send') { this.drop(o); this.drones.delete(id); }
    }
  }

  /** Trees and rocks on the map, as objects so they can be cleared. */
  private syncTerrain(s: GameState) {
    const key = String(layoutOf(s));
    if (key === this.terrainKey) return;
    this.terrainKey = key;
    const { width: w } = s.map;
    s.map.terrain.forEach((t, i) => {
      const x = i % w, y = Math.floor(i / w), n = hash(x, y);
      const want = t === TERRAIN.tree ? `tree${Math.floor(n * 3)}` : t === TERRAIN.rock ? `rock${Math.floor(n * 3)}` : null;
      const cur = this.terrain[i];
      if (cur && cur.key === want) return;
      if (cur) { this.terrainTiles.delete(cur.obj); this.drop(cur.obj); this.terrain[i] = null; }
      if (!want) return;
      const g = t === TERRAIN.tree ? this.m.trees[n < 0.55 ? 0 : n < 0.85 ? 1 : 2] : this.m.rocks[Math.floor(n * 3) % 3];
      const obj = this.add(g, null);
      obj.setTransform(v.set(x + 0.5, 0, y + 0.5), e.set(0, n * Math.PI * 2, 0), t === TERRAIN.tree ? 0.62 + 0.25 * n : 1);
      this.terrainTiles.set(obj, { x, y });
      this.terrain[i] = { obj, key: want };
    });
  }

  private tile(tint: THREE.Color) {
    const o = this.r.addObject(this.m.fill);
    o.tint = tint; o.tintStrength = 1; o.castShadow = false;
    return o;
  }

  /** Coloured tiles over the map: soil fertility, pylon reach, sprinkler water or bee range. */
  overlay(s: GameState, kind: Overlay) {
    const key = kind === 'none' ? 'none' : `${kind} ${kind === 'fertility' ? s.map.fertility.map((f) => Math.floor(f / 17)).join('') : ''} ${s.buildings.length} ${networks(s).layout}`;
    if (key === this.overlayKey) return;
    this.overlayKey = key;
    for (const o of this.overlayObjs) o.remove();
    this.overlayObjs = [];
    if (kind === 'none') return;
    const { width: w, height: h } = s.map;
    const mark = new Set<number>();
    const cover = (bx: number, by: number, n: number, r: number) => {
      for (let y = by - r; y < by + n + r; y++) for (let x = bx - r; x < bx + n + r; x++) if (x >= 0 && y >= 0 && x < w && y < h) mark.add(y * w + x);
    };
    if (kind === 'fertility') {
      for (let i = 0; i < w * h; i++) {
        if (s.map.terrain[i] !== TERRAIN.grass) continue;
        const o = this.tile(FERT[Math.min(5, Math.floor(s.map.fertility[i] / 17))]);
        o.setTransform(v.set(i % w + 0.5, 0.02, Math.floor(i / w) + 0.5));
        this.overlayObjs.push(o);
      }
      return;
    }
    for (const b of s.buildings) {
      if (kind === 'power' && b.type === 'pylon') cover(b.x, b.y, 1, POWER.pylon.reach);
      if (kind === 'water' && b.type === 'sprinkler') cover(b.x - 1, b.y - 1, 3, POWER.sprinklerReach - 1);
      if (kind === 'bees' && b.type === 'hive') cover(b.x, b.y, 1, HIVE.reach);
    }
    const tint = kind === 'power' ? REACH : kind === 'water' ? WATER : BEES;
    for (const i of mark) {
      const o = this.tile(tint);
      o.setTransform(v.set(i % w + 0.5, 0.02, Math.floor(i / w) + 0.5));
      this.overlayObjs.push(o);
    }
  }
}

/** Is it doing its thing (to show its running look)? */
function isRunning(b: Building) {
  if (b.type === 'pad') return b.drone?.phase !== 'home' || (b.mode === 'receive' && b.store!.length > 0);
  if (b.recipe) return b.progress !== null && b.progress !== undefined;
  return b.status === 'ok';
}

const QUIET = new Set<BuildingId>(['belt', 'splitter', 'sorter', 'crossing', 'depot', 'sapling']);

function markerColour(b: Building): 'red' | 'orange' | 'yellow' | 'blue' | 'purple' | null {
  if (QUIET.has(b.type)) return null;
  switch (b.status) {
    case 'power': case 'nolink': return b.type === 'pad' && b.status === 'nolink' ? 'purple' : 'red';
    case 'lowpower': return 'orange';
    case 'blocked': return 'orange';
    case 'input': return b.type === 'pad' ? null : 'yellow';
    case 'flowers': return 'yellow';
    case 'dry': return 'blue';
    default: return null;
  }
}

export { BUILDINGS };
