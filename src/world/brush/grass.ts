import * as THREE from 'three';
import {
  addTuft, groundOf, MeshBuilder, noise2, rng, smooth, wheelRace,
  type BrushRenderer, type Ground, type LandArea,
} from '../../../brush3d/src/index.ts';
import type { Land } from '../../game/map.ts';
import { layoutOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import {
  boxesIn, fringeFade, GRASS_FRINGE, GRASS_PROFILES, grassBlocks, grassLayout, inBuilding, layoutChanges,
  tileHabitat, tileSeed, wetDistance,
  type FootprintBox, type GrassBlockRect, type GrassLayout, type GrassMode, type GrassProfile,
} from './grassMask.ts';
import { TILE } from './scale.ts';

// Meadow grass tufts across the valley floor (#256): painted blades swaying in the living wind, coloured from the land's
// own painted ground (`r.landColourAt`) so they blend into the ground paint and turn with the season (and shorten in
// winter so light snow lets frosted tips show while deep snow buries them cleanly).
//
// - Built in 4 × 4-tile blocks across the playable map and its country fringe, each one mesh. What changes in play
//   (a building or field placed or taken away, a tree or rock cleared, an earthwork) makes again only the blocks it
//   touches, found by comparing the layout's terrain and buildings with the last (grassMask.ts's layoutChanges), and
//   made again a few a frame within `REBUILD_BUDGET` (#204), so a long build drag never hitches.
// - A block a new building stands in, or whose land was just redrawn (`r.onLandChange`, as an earthwork is swapped in),
//   is hidden until it's made again, first in the queue: its grass never pokes through the building or floats over (or
//   sinks into) the old ground for a frame. The rest (grass growing back) keep showing until they're made again.
// - Ground-hugging tufts skip sun shadows and water reflections (`castShadow: false, reflect: false`): the painted
//   ground already reflects in rivers and ponds, and skipping grass reflections saves ~0.6–1.1 ms GPU on water maps.

/** Per-frame CPU budget (ms) for making queued blocks again during play (matches `PaintedLand.step`). */
const REBUILD_BUDGET = 2.5;

const SCRATCH = new THREE.Color();

export class Grass {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly land: Land;
  private readonly ground: Ground;
  /** Distance (tiles) from each land tile to the nearest water tile (computed once; water never moves). */
  private readonly wetDist: Float32Array;
  private readonly seed: number;
  private readonly reach: number;
  private readonly grid: GrassBlockRect[];
  private readonly blockById = new Map<number, GrassBlockRect>();
  private readonly blocks = new Map<number, THREE.Mesh[]>();
  /** Blocks to make again: hidden until they are (and made first), and the rest. */
  private readonly urgent = new Set<number>();
  private readonly dirty = new Set<number>();
  private mode: GrassMode;
  /** The game's layout as the grass last followed it. */
  private layout = -1;
  private seen: GrassLayout;
  private lastState: GameState;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState, initialMode: GrassMode) {
    this.r = r; this.lie = lie; this.land = land; this.mode = initialMode; this.lastState = s;
    this.seed = s.scenario.seed;
    this.reach = Math.min(GRASS_FRINGE, land.margin);
    this.ground = groundOf((x, z) => r.landAt(x, z));
    this.wetDist = wetDistance(land);
    this.grid = grassBlocks(s.map.width, s.map.height, this.reach);
    for (const rect of this.grid) this.blockById.set(rect.id, rect);
    this.seen = grassLayout(s);
    if (this.mode !== 'off') this.rebuildAll(s);
    r.onLandChange((area) => this.landChanged(area));
  }

  /** Switches the look option in place without leaking meshes or geometries. */
  setMode(next: GrassMode) {
    if (next === this.mode) return;
    this.clearAll();
    this.mode = next;
    if (this.mode !== 'off') this.rebuildAll(this.lastState);
  }

  /**
   * Follows the game: the blocks a change in its layout touches are queued (those a new building stands in hidden till
   * they're made), and queued blocks made again within `REBUILD_BUDGET` ms.
   */
  sync(s: GameState) {
    this.lastState = s;
    if (this.mode === 'off') return;
    const layout = layoutOf(s);
    if (layout !== this.layout) {
      this.layout = layout;
      const now = grassLayout(s), { urgent, dirty } = layoutChanges(this.seen, now, s.map.width);
      this.seen = now;
      for (const id of urgent) this.hide(id);
      for (const id of dirty) if (this.blockById.has(id) && !this.urgent.has(id)) this.dirty.add(id);
    }
    if (this.urgent.size || this.dirty.size) this.drain(s);
  }

  /** The land as drawn changed in `area` (m): its blocks hidden, to be made again on it first. */
  private landChanged(area: LandArea) {
    if (this.mode === 'off') return;
    const x0 = Math.floor(area.x0 / TILE), z0 = Math.floor(area.z0 / TILE), x1 = Math.ceil(area.x1 / TILE) - 1, z1 = Math.ceil(area.z1 / TILE) - 1;
    for (const rect of this.grid) if (rect.x1 > x0 && rect.x0 <= x1 && rect.y1 > z0 && rect.y0 <= z1) this.hide(rect.id);
  }

  /** A block queued first, its grass hidden till it's made again. */
  private hide(id: number) {
    if (!this.blockById.has(id)) return;
    this.dirty.delete(id);
    this.urgent.add(id);
    for (const m of this.blocks.get(id) ?? []) m.visible = false;
  }

  // ---- Meadow colour & lushness ----

  /** Painted ground colour at world point (wx, wz) with slight organic blade-to-blade variation. */
  private tuftColor(wx: number, wz: number, rand: () => number): THREE.Color {
    return this.r.landColourAt(wx, wz, SCRATCH)
      .offsetHSL((rand() - 0.5) * 0.014, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.035);
  }

  /** Broad organic meadow drift value (0..1) at world metres (wx, wz). */
  private patchLush(wx: number, wz: number): number {
    const s = (this.seed % 997) * 0.13;
    const broad = noise2(wx * 0.042 + s, wz * 0.042 - s * 0.7) * 0.5 + 0.5;
    const med = noise2(wx * 0.105 - s * 0.5, wz * 0.105 + s) * 0.5 + 0.5;
    return smooth(0.30, 0.86, broad * 0.72 + med * 0.28);
  }

  // ---- Per-tile grass scattering ----

  private scatterTile(
    mb: MeshBuilder,
    s: GameState,
    tx: number,
    ty: number,
    onMap: boolean,
    profile: GrassProfile,
    boxes: readonly FootprintBox[],
    fade = 1,
  ) {
    const hab = tileHabitat(s, this.land, this.lie.relief, this.wetDist, tx, ty, onMap);
    if (!hab) return;
    const { minU, maxU, minV, maxV, waterBoost, skirtBoost, rockBoost, deepWoods, groundScale, seasonDensity, heightScale } = hab;
    const rand = rng(tileSeed(this.seed, tx, ty));
    const x0 = tx * TILE, z0 = ty * TILE;

    const canPlace = (wx: number, wz: number): boolean => {
      if (wx < x0 + minU || wx > x0 + maxU || wz < z0 + minV || wz > z0 + maxV) return false;
      if (boxes.length && inBuilding(boxes, wx, wz, wheelRace)) return false;
      return this.ground.normal(wx, wz).y >= 0.82;
    };

    const placeTuft = (wx: number, wz: number, lush: number) => {
      const tall = (profile.tall[0] + lush * profile.tall[1]) * heightScale * (0.88 + rand() * 0.24);
      addTuft(mb, this.ground, wx, wz, tall, this.tuftColor(wx, wz, rand), rand, profile.tuft);
    };

    for (let a = 0; a < profile.attempts; a++) {
      const wx = x0 + minU + rand() * (maxU - minU);
      const wz = z0 + minV + rand() * (maxV - minV);
      const lush = Math.min(1, this.patchLush(wx, wz) * 0.85 + waterBoost + skirtBoost + rockBoost);
      const prob = (profile.baseProb + lush * profile.lushProb) * deepWoods * groundScale * seasonDensity * fade;
      if (rand() > prob) continue;
      if (!canPlace(wx, wz)) continue;
      placeTuft(wx, wz, lush);
      // Organic tussock clumping: occasionally add a nearby companion tuft in lush spots.
      if (lush > 0.42 && rand() < profile.clusterProb * lush * fade) {
        const ang = rand() * Math.PI * 2, dist = 0.42 + rand() * 0.55;
        const cx = wx + Math.cos(ang) * dist, cz = wz + Math.sin(ang) * dist;
        if (canPlace(cx, cz)) placeTuft(cx, cz, lush * 0.92);
      }
    }
  }

  // ---- Block building & budgeted draining ----

  private rebuildAll(s: GameState) {
    this.urgent.clear();
    this.dirty.clear();
    for (const rect of this.grid) this.rebuildBlock(s, rect);
    this.layout = layoutOf(s);
    this.seen = grassLayout(s);
  }

  /** Makes queued blocks again, the hidden first, until `REBUILD_BUDGET` ms are spent (at least one a frame). */
  private drain(s: GameState) {
    const end = performance.now() + REBUILD_BUDGET;
    let done = 0;
    for (const queue of [this.urgent, this.dirty]) {
      for (const id of queue) {
        if (done > 0 && performance.now() >= end) return;
        queue.delete(id);
        const rect = this.blockById.get(id);
        if (rect) this.rebuildBlock(s, rect);
        done++;
      }
    }
  }

  private rebuildBlock(s: GameState, rect: GrassBlockRect) {
    this.drop(this.blocks.get(rect.id) ?? []);
    const profile = GRASS_PROFILES[this.mode as Exclude<GrassMode, 'off'>];
    const { width: w, height: h } = s.map;
    const boxes = boxesIn(s, rect.x0, rect.y0, rect.x1, rect.y1);
    const mb = new MeshBuilder('grass');
    for (let y = rect.y0; y < rect.y1; y++) for (let x = rect.x0; x < rect.x1; x++) {
      const fade = fringeFade(x, y, w, h, this.reach);
      if (fade <= 0) continue;
      const onMap = x >= 0 && y >= 0 && x < w && y < h;
      this.scatterTile(mb, s, x, y, onMap, profile, boxes, fade);
    }
    // Culled whole (not cut into tiles: a block is small, and made again often).
    this.blocks.set(rect.id, mb.vertexCount ? [this.r.add(mb.build(), 'grass', { cull: true, castShadow: false, reflect: false })] : []);
  }

  private clearAll() {
    this.urgent.clear();
    this.dirty.clear();
    for (const meshes of this.blocks.values()) this.drop(meshes);
    this.blocks.clear();
  }

  private drop(meshes: THREE.Mesh[]) {
    for (const m of meshes) { this.r.remove(m); m.geometry.dispose(); }
  }
}
