import * as THREE from 'three';
import type { PixelObject, PixelRenderer } from 'pixel3d-renderer';
import { cropStage } from '../game/crops.ts';
import { BUILDINGS, footprintCentre, RUN, WIDTH, type BuildingKind } from '../game/layout.ts';
import { isRunning, MACHINE_SIZE } from '../game/machines.ts';
import type { GameState } from '../game/state.ts';
import { hash } from './kit.ts';
import { SOIL_TOP, soilBand, type Models } from './models.ts';

// Shows the game state with renderer objects: every frame it adds, swaps and removes objects so the farm matches the state
// (soil by fertility band and water, crops by stage, machines idle or running, chickens, eggs and manure), and animates
// what moves on its own (chickens wandering the run, the coop door). It also remembers which thing each object is, for
// clicks and highlights.

export type Target =
  | { kind: 'tile'; col: number; row: number }
  | { kind: 'building'; building: BuildingKind }
  | { kind: 'door' }
  | { kind: 'trough' }
  | { kind: 'eggs' }
  | { kind: 'manure' }
  | { kind: 'chicken'; id: number }
  | { kind: 'machine'; id: number };

/** An object shown for a key (e.g. a geometry choice): replaced when the key changes. */
interface Shown { obj: PixelObject; key: string }

interface Hen { obj: PixelObject; x: number; z: number; tx: number; tz: number; heading: number; wait: number; hop: number }

const TROUGH = new THREE.Vector3(RUN.col + RUN.cols - 1.1, 0, RUN.row + RUN.rows - 0.5);
/** Where eggs and manure lie in the run, near the coop. */
const NESTS = [[1.5, 11.5], [2.2, 11.4], [4.8, 11.5], [5.5, 11.6], [1.4, 12.3], [5.6, 12.4]];
const PILES = [[2.0, 13.4], [3.4, 12.8], [4.6, 13.6], [1.6, 14.4], [3.0, 14.3], [5.0, 14.6], [2.6, 12.2], [4.2, 14.7]];
const DOOR_OPEN = -1.9;   // radians the door swings out
const HEN_SPEED = 0.6;    // m/s

const v = new THREE.Vector3(), e = new THREE.Euler();

export class FarmView {
  private readonly targets = new Map<PixelObject, Target>();
  private readonly soil: (Shown | null)[] = [];
  private readonly crops: (Shown | null)[] = [];
  private readonly machines = new Map<number, Shown>();
  private readonly hens = new Map<number, Hen>();
  private readonly nests: PixelObject[] = [];
  private readonly piles: PixelObject[] = [];
  private readonly door: PixelObject;
  private readonly doorAt: THREE.Vector3;
  private trough: Shown | null = null;
  private doorAngle = 0;
  private readonly r: PixelRenderer;
  private readonly m: Models;

  constructor(r: PixelRenderer, m: Models) {
    this.r = r; this.m = m;
    const geo: Record<BuildingKind, THREE.BufferGeometry> = { farmhouse: m.farmhouse, shop: m.shop, bin: m.bin, coop: m.coop };
    for (const [building, f] of Object.entries(BUILDINGS) as [BuildingKind, typeof BUILDINGS[BuildingKind]][]) {
      const c = footprintCentre(f);
      this.add(geo[building], { kind: 'building', building }).setTransform(v.set(c.x, 0, c.z));
    }
    const coop = footprintCentre(BUILDINGS.coop);
    this.doorAt = new THREE.Vector3(coop.x, 0, coop.z).add(m.doorHinge);
    this.door = this.add(m.coopDoor, { kind: 'door' }).setTransform(this.doorAt);
    for (const [x, z] of NESTS) { const o = this.add(m.eggNest, { kind: 'eggs' }).setTransform(v.set(x, 0, z), e.set(0, hash(x, z) * 6, 0)); o.visible = false; this.nests.push(o); }
    for (const [x, z] of PILES) { const o = this.add(m.manure, { kind: 'manure' }).setTransform(v.set(x, 0, z), e.set(0, hash(z, x) * 6, 0)); o.visible = false; this.piles.push(o); }
  }

  private add(g: THREE.BufferGeometry, t: Target) {
    const o = this.r.addObject(g);
    this.targets.set(o, t);
    return o;
  }

  private remove(o: PixelObject) {
    this.targets.delete(o);
    o.remove();
  }

  /** Shows `g` for `key` in `slot`, replacing what was there if the key changed; null removes it. */
  private show(slot: Shown | null, key: string | null, g: () => THREE.BufferGeometry, t: Target, place: (o: PixelObject) => void): Shown | null {
    if (slot && slot.key === key) return slot;
    if (slot) this.remove(slot.obj);
    if (key === null) return null;
    const obj = this.add(g(), t);
    place(obj);
    return { obj, key };
  }

  targetOf(o: PixelObject | null): Target | null {
    return o ? this.targets.get(o) ?? null : null;
  }

  /** Every object that belongs to the same thing as `t` (the coop is its body and door), to highlight together. */
  objectsOf(t: Target): PixelObject[] {
    const out: PixelObject[] = [];
    for (const [o, ot] of this.targets) if (o.visible && sameThing(t, ot)) out.push(o);
    return out;
  }

  /** Brings the objects in line with the state, and moves what animates. `dt` in seconds. */
  sync(s: GameState, dt: number) {
    // Soil and crops.
    s.tiles.forEach((tile, i) => {
      if (!tile) return;
      const col = i % WIDTH, row = Math.floor(i / WIDTH), t: Target = { kind: 'tile', col, row };
      const band = soilBand(tile.fertility), wet = tile.watered ? 1 : 0;
      this.soil[i] = this.show(this.soil[i] ?? null, tile.tilled ? `${band}${wet}` : null, () => this.m.soil[band][wet], t,
        (o) => o.setTransform(v.set(col + 0.5, 0, row + 0.5)));
      const c = tile.crop, stage = c ? cropStage(c) : 0;
      this.crops[i] = this.show(this.crops[i] ?? null, c ? `${c.id}${stage}` : null, () => this.m.crops[c!.id][stage], t,
        (o) => o.setTransform(v.set(col + 0.5, SOIL_TOP, row + 0.5), e.set(0, Math.floor(hash(col, row) * 4) * Math.PI / 2, 0)));
    });

    // Machines, idle or running.
    for (const mc of s.machines) {
      const running = isRunning(mc), geo = this.m[mc.kind][running ? 'running' : 'idle'];
      // Keyed by place too: ids start again in a new game.
      const shown = this.show(this.machines.get(mc.id) ?? null, `${mc.kind} ${mc.col} ${mc.row} ${running}`, () => geo, { kind: 'machine', id: mc.id },
        (o) => o.setTransform(v.set(mc.col + MACHINE_SIZE.cols / 2, 0, mc.row + MACHINE_SIZE.rows / 2)));
      this.machines.set(mc.id, shown!);
    }
    for (const [id, sh] of this.machines) if (!s.machines.some((mc) => mc.id === id)) { this.remove(sh.obj); this.machines.delete(id); }

    // The coop: trough, eggs, manure, the door, and the chickens, out in the run while the door is open.
    this.trough = this.show(this.trough, s.coop.trough > 0 ? 'full' : 'empty', () => (s.coop.trough > 0 ? this.m.trough.full : this.m.trough.empty),
      { kind: 'trough' }, (o) => o.setTransform(TROUGH));
    this.nests.forEach((o, i) => (o.visible = i < s.coop.eggs.length));
    this.piles.forEach((o, i) => (o.visible = i < s.coop.manure));
    const want = s.coop.doorOpen ? DOOR_OPEN : 0;
    this.doorAngle += Math.sign(want - this.doorAngle) * Math.min(Math.abs(want - this.doorAngle), dt * 4);
    this.door.setTransform(this.doorAt, e.set(0, this.doorAngle, 0));
    this.syncHens(s, dt);
  }

  private syncHens(s: GameState, dt: number) {
    for (const c of s.coop.chickens) if (!this.hens.has(c.id)) {
      const obj = this.add(this.m.chicken, { kind: 'chicken', id: c.id });
      const x = this.doorAt.x + 0.3, z = this.doorAt.z + 0.4;
      this.hens.set(c.id, { obj, x, z, tx: x, tz: z, heading: 0, wait: Math.random() * 2, hop: Math.random() * 6 });
    }
    for (const [id, h] of this.hens) if (!s.coop.chickens.some((c) => c.id === id)) { this.remove(h.obj); this.hens.delete(id); }
    for (const h of this.hens.values()) {
      h.obj.visible = s.coop.doorOpen;
      if (!s.coop.doorOpen) { h.x = h.tx = this.doorAt.x + 0.3; h.z = h.tz = this.doorAt.z + 0.3; continue; }
      const dx = h.tx - h.x, dz = h.tz - h.z, d = Math.hypot(dx, dz);
      if (d < 0.05) {
        h.wait -= dt;
        if (h.wait <= 0) {
          h.tx = RUN.col + 0.4 + Math.random() * (RUN.cols - 0.8);
          h.tz = RUN.row + 0.6 + Math.random() * (RUN.rows - 1.0);
          h.wait = 1 + Math.random() * 3;
        }
      } else {
        const step = Math.min(d, HEN_SPEED * dt);
        h.x += dx / d * step; h.z += dz / d * step;
        h.heading = Math.atan2(dx, dz);
        h.hop += dt * 14;
      }
      const lift = d >= 0.05 ? Math.abs(Math.sin(h.hop)) * 0.05 : 0;
      h.obj.setTransform(v.set(h.x, lift, h.z), e.set(0, h.heading, 0));
    }
  }
}

function sameThing(a: Target, b: Target) {
  if (a.kind === 'building' && a.building === 'coop') return b.kind === 'door' || (b.kind === 'building' && b.building === 'coop');
  if (a.kind !== b.kind) return false;
  if (a.kind === 'building') return a.building === (b as typeof a).building;
  if (a.kind === 'tile') return a.col === (b as typeof a).col && a.row === (b as typeof a).row;
  if (a.kind === 'chicken' || a.kind === 'machine') return a.id === (b as typeof a).id;
  return true;
}
