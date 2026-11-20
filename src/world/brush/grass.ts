import * as THREE from 'three';
import {
  addTuft, groundOf, MeshBuilder, noise2, rng, smooth, wheelRace,
  type BrushRenderer, type Ground,
} from '../../../brush3d/src/index.ts';
import type { Land } from '../../game/map.ts';
import { layoutOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import {
  blockSig, boxesIn, fringeFade, GRASS_FRINGE, GRASS_PROFILES, grassBlocks, inBuilding,
  tileHabitat, tileSeed, wetDistance,
  type BlockSig, type FootprintBox, type GrassBlockRect, type GrassMode, type GrassProfile,
} from './grassMask.ts';
import { TILE } from './scale.ts';

// Meadow grass tufts across the valley floor (#256): painted blades swaying in the living wind, coloured from the land's
// own painted ground (`r.landColourAt`) so they blend seamlessly into the ground paint and turn with the season (and
// shorten in winter so light snow lets frosted tips show while deep snow buries them cleanly).
//
// - Built in chunked 8 × 8-tile blocks across both the playable map and its country fringe (matching `Wild` and
//   `PaintedLand`): placing or removing a building or field, clearing a tree, or doing earthworks rebuilds only the
//   affected block(s) without shelter redraws or frame hitches (#204).
// - Earthwork-driven height rebuilds wait for `r.landRevision` to advance (after `PaintedLand` swaps its refitted
//   ground chunks in) and drain dirty blocks within `REBUILD_BUDGET` ms per frame, so tufts never float/sink mid-swap
//   and multi-block earthwork drags never hitch. Newly placed buildings or fields rebuild their block(s) immediately so
//   grass never pokes through a new footprint.
// - Ground-hugging tufts skip sun shadows and water reflections (`castShadow: false, reflect: false`): the painted
//   ground already reflects in rivers and ponds, and skipping grass reflections saves ~0.6–1.1 ms GPU on water maps.

/** Tile cut size (m) passed to `r.add` so each 8 × 8 block opts into frustum culling with `TILE_REACH` wind padding. */
const CUT = 64;
/** Per-frame CPU budget (ms) for rebuilding queued dirty grass blocks during play (matches `PaintedLand.step`). */
const REBUILD_BUDGET = 2.5;

interface Block {
  layout: string;
  relief: string;
  buildingIds: Set<number>;
  meshes: THREE.Mesh[];
}

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
  private readonly blocks = new Map<number, Block>();
  /** Dirty block IDs queued for budgeted per-frame rebuilding. */
  private readonly dirty = new Set<number>();
  private mode: GrassMode;
  private layout = -1;
  private landRev = '';
  private lastState: GameState;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState, initialMode: GrassMode) {
    this.r = r; this.lie = lie; this.land = land; this.mode = initialMode; this.lastState = s;
    this.seed = s.scenario.seed;
    this.reach = Math.min(GRASS_FRINGE, land.margin);
    this.ground = groundOf((x, z) => r.landAt(x, z));
    this.wetDist = wetDistance(land);
    this.grid = grassBlocks(s.map.width, s.map.height, this.reach);
    for (const rect of this.grid) this.blockById.set(rect.id, rect);
    if (this.mode !== 'off') this.rebuildAll(s);
  }

  /** Switches the look option in place without leaking meshes or geometries. */
  setMode(next: GrassMode) {
    if (next === this.mode) return;
    this.clearAll();
    this.mode = next;
    this.layout = -1;
    this.landRev = '';
    if (this.mode !== 'off') this.rebuildAll(this.lastState);
  }

  /**
   * Follows the game: newly placed buildings/fields clear their block(s) immediately so grass never pokes through;
   * clearings, removals, and post-swap terrain changes (`r.landRevision`) rebuild dirty blocks within a small
   * per-frame CPU budget (`REBUILD_BUDGET`).
   */
  sync(s: GameState) {
    this.lastState = s;
    if (this.mode === 'off') return;
    const layout = layoutOf(s), landRev = this.r.landRevision;
    const layoutChanged = layout !== this.layout;
    const landChanged = landRev !== this.landRev;

    if (layoutChanged || landChanged) {
      const yAt = (tx: number, ty: number) => this.r.landAt(tx * TILE, ty * TILE);
      for (const rect of this.grid) {
        const prev = this.blocks.get(rect.id);
        if (!prev) { this.dirty.add(rect.id); continue; }
        const sig = blockSig(s, this.land, this.lie.relief, yAt, this.mode, rect.x0, rect.y0, rect.x1, rect.y1);
        if (layoutChanged && sig.layout !== prev.layout) {
          const addedBuilding = sig.buildingIds.some((id) => !prev.buildingIds.has(id));
          if (addedBuilding) {
            this.dirty.delete(rect.id);
            this.rebuildBlock(s, rect, sig);
            continue;
          }
          this.dirty.add(rect.id);
        } else if (landChanged && sig.relief !== prev.relief) {
          this.dirty.add(rect.id);
        }
      }
      this.layout = layout;
      this.landRev = landRev;
    }

    if (this.dirty.size > 0) this.drainDirty(s, REBUILD_BUDGET);
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
    this.dirty.clear();
    const yAt = (tx: number, ty: number) => this.r.landAt(tx * TILE, ty * TILE);
    for (const rect of this.grid) {
      const sig = blockSig(s, this.land, this.lie.relief, yAt, this.mode, rect.x0, rect.y0, rect.x1, rect.y1);
      this.rebuildBlock(s, rect, sig);
    }
    this.layout = layoutOf(s);
    this.landRev = this.r.landRevision;
  }

  private drainDirty(s: GameState, budget: number) {
    const end = performance.now() + budget;
    const yAt = (tx: number, ty: number) => this.r.landAt(tx * TILE, ty * TILE);
    let done = 0;
    for (const id of this.dirty) {
      if (done > 0 && performance.now() >= end) break;
      this.dirty.delete(id);
      const rect = this.blockById.get(id);
      if (!rect) continue;
      const sig = blockSig(s, this.land, this.lie.relief, yAt, this.mode, rect.x0, rect.y0, rect.x1, rect.y1);
      this.rebuildBlock(s, rect, sig);
      done++;
    }
  }

  private rebuildBlock(s: GameState, rect: GrassBlockRect, sig: BlockSig) {
    if (this.mode === 'off') return;
    const prev = this.blocks.get(rect.id);
    if (prev) this.drop(prev.meshes);
    const profile = GRASS_PROFILES[this.mode];
    const { width: w, height: h } = s.map;
    const boxes = boxesIn(s, rect.x0, rect.y0, rect.x1, rect.y1);
    const mb = new MeshBuilder('grass');
    for (let y = rect.y0; y < rect.y1; y++) for (let x = rect.x0; x < rect.x1; x++) {
      const fade = fringeFade(x, y, w, h, this.reach);
      if (fade <= 0) continue;
      const onMap = x >= 0 && y >= 0 && x < w && y < h;
      this.scatterTile(mb, s, x, y, onMap, profile, boxes, fade);
    }
    const meshes = mb.vertexCount
      ? [this.r.add(mb.build(), 'grass', { tile: CUT, castShadow: false, reflect: false })]
      : [];
    this.blocks.set(rect.id, {
      layout: sig.layout,
      relief: sig.relief,
      buildingIds: new Set(sig.buildingIds),
      meshes,
    });
  }

  private clearAll() {
    this.dirty.clear();
    for (const b of this.blocks.values()) this.drop(b.meshes);
    this.blocks.clear();
  }

  private drop(meshes: THREE.Mesh[]) {
    for (const m of meshes) { this.r.remove(m); m.geometry.dispose(); }
  }
}
