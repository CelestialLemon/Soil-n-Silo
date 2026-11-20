import * as THREE from 'three';
import {
  addTuft, groundOf, LAND_LOOK, MeshBuilder, noise2, rng, smooth, srgb, wheelRace,
  type BrushRenderer, type Ground,
} from '../../../brush3d/src/index.ts';
import { GROUND } from '../../game/ground.ts';
import type { Land } from '../../game/map.ts';
import { layoutOf, reliefOf, type GameState } from '../../game/state.ts';
import type { GrassMode } from '../../ui/grassChoice.ts';
import type { Lie } from '../ground.ts';
import {
  blockKey, borderBoxes, boxesIn, countrySig, GRASS_BLOCK, GRASS_FRINGE, GRASS_PROFILES, inBuilding,
  tileHabitat, tileSeed, wetDistance, type FootprintBox, type GrassProfile,
} from './grassMask.ts';
import { RISE, TILE } from './scale.ts';

// Meadow grass tufts across the valley floor (#256): painted blades swaying in the living wind, coloured from the land's
// own meadow palette so they blend into the ground paint and turn with the season (and shorten in winter so light snow
// lets frosted tips show while deep snow buries them cleanly).
//
// - Built in 8 × 8-tile blocks matching `Wild` and `PaintedLand`: placing or removing a building or field, clearing a
//   tree, or doing earthworks rebuilds only the affected block(s) without shelter redraws or frame hitches (#204).
// - A short fringe just outside the map fades softly into the duller country ground so the playable edge stays clear
//   without looking clipped.
// - Ground-hugging tufts skip sun shadows and water reflections (`castShadow: false, reflect: false`): the painted
//   ground already reflects in rivers and ponds, and skipping grass reflections saves ~0.6–1.1 ms GPU on water maps.

/** How finely the renderer cuts the country fringe's mesh (m). */
const CUT = 64;

/** Meadow colours matching `brush3d/src/land/paint.ts`, so tufts grow out of the painted ground seamlessly. */
const COL = {
  lush: srgb(0x5a9848),
  dry: srgb(0x98a652),
  lime: srgb(0xa6c45a),
  emerald: srgb(0x40885a),
};

const GROUND_TINT: Record<number, { toward: THREE.Color; mix: number; lift: number }> = {
  [GROUND.silt]: { toward: srgb(0x54401c), mix: 0.12, lift: -0.04 },
  [GROUND.clay]: { toward: srgb(0xa4603c), mix: 0.22, lift: -0.02 },
  [GROUND.sand]: { toward: srgb(0xe0cc94), mix: 0.26, lift: 0.04 },
  [GROUND.stony]: { toward: srgb(0x8a8a82), mix: 0.26, lift: 0 },
};

interface Block { key: string; meshes: THREE.Mesh[] }

const SCRATCH = new THREE.Color();

/** Dulls a colour to match the country outside the playable map (`LAND_LOOK.beyond`). */
function dullCountry(c: THREE.Color) {
  const { light, chroma } = LAND_LOOK.beyond;
  const y = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  c.setRGB((y + (c.r - y) * chroma) * light, (y + (c.g - y) * chroma) * light, (y + (c.b - y) * chroma) * light);
}

export class Grass {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly land: Land;
  private readonly ground: Ground;
  /** Distance (tiles) from each land tile to the nearest water tile (computed once; water never moves). */
  private readonly wetDist: Float32Array;
  private readonly seed: number;
  private readonly blocks = new Map<number, Block>();
  private countryMeshes: THREE.Mesh[] = [];
  private countryKey = '';
  private mode: GrassMode;
  private layout = -1;
  private relief = -1;
  private lastState: GameState;
  private grassBaked = false;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState, initialMode: GrassMode) {
    this.r = r; this.lie = lie; this.land = land; this.mode = initialMode; this.lastState = s;
    this.seed = s.scenario.seed;
    this.ground = groundOf((x, z) => lie.y(x / TILE, z / TILE) * RISE * TILE);
    this.wetDist = wetDistance(land);
    if (this.mode !== 'off') this.sync(s);
  }

  /** Switches the look option in place without leaking meshes or geometries. */
  setMode(next: GrassMode) {
    if (next === this.mode) return;
    this.clearAll();
    this.mode = next;
    this.layout = -1;
    this.relief = -1;
    if (this.mode !== 'off') {
      this.sync(this.lastState);
      this.ensureBaked();
    }
  }

  /** Bakes the grass material's brush basis once grass meshes exist, cutting per-pixel shader work. */
  ensureBaked() {
    if (this.grassBaked || this.mode === 'off') return;
    if (this.r.setFields('grass', 1024)) this.grassBaked = true;
  }

  /** Follows the game: buildings/fields placed or removed, trees cleared or grown, earthworks. */
  sync(s: GameState) {
    this.lastState = s;
    if (this.mode === 'off') return;
    const layout = layoutOf(s), relief = reliefOf(s);
    if (layout === this.layout && relief === this.relief) return;
    this.layout = layout;
    this.relief = relief;
    this.syncCountry(s);
    this.syncBlocks(s);
  }

  // ---- Meadow colour & lushness ----

  /** Meadow base colour at world point (wx, wz) on land tile (lx, ly), matching `PaintedLand`. */
  private tuftColor(lx: number, ly: number, wx: number, wz: number, onMap: boolean, rand: () => number): THREE.Color {
    const W = this.land.width, i = ly * W + lx;
    const c = this.lie.relief.corner, k4 = i * 4;
    const avgLevel = (c[k4] + c[k4 + 1] + c[k4 + 2] + c[k4 + 3]) * 0.25;
    const dry = 0.6 * Math.min(1, Math.max(0, avgLevel / 10)) + 0.4 * (1 - Math.exp(-this.wetDist[i] / 4));
    SCRATCH.copy(COL.lush).lerp(COL.dry, dry);
    const gKind = onMap ? this.lastState.map.ground[(ly - this.land.margin) * this.lastState.map.width + (lx - this.land.margin)] : this.land.ground[i];
    const gt = GROUND_TINT[gKind];
    if (gt) {
      SCRATCH.lerp(gt.toward, gt.mix);
      SCRATCH.multiplyScalar(1 + gt.lift * 2);
    }
    if (!onMap) dullCountry(SCRATCH);
    const drift = noise2(wx * 0.02 + 7, wz * 0.02 - 3) * 0.5 + 0.5;
    SCRATCH.lerp(COL.lime, smooth(0.55, 0.9, drift) * 0.35).lerp(COL.emerald, smooth(0.6, 0.95, 1 - drift) * 0.35);
    return SCRATCH.clone().offsetHSL((rand() - 0.5) * 0.014, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.035);
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
    fringeFade = 1,
  ) {
    const hab = tileHabitat(s, this.land, this.lie.relief, this.wetDist, tx, ty, onMap);
    if (!hab) return;
    const { minU, maxU, minV, maxV, waterBoost, skirtBoost, rockBoost, deepWoods, groundScale, seasonDensity, heightScale } = hab;
    const lx = tx + this.land.margin, ly = ty + this.land.margin;
    const rand = rng(tileSeed(this.seed, tx, ty));
    const x0 = tx * TILE, z0 = ty * TILE;

    const canPlace = (wx: number, wz: number): boolean => {
      if (wx < x0 + minU || wx > x0 + maxU || wz < z0 + minV || wz > z0 + maxV) return false;
      if (boxes.length && inBuilding(boxes, wx, wz, wheelRace)) return false;
      return this.ground.normal(wx, wz).y >= 0.82;
    };

    const placeTuft = (wx: number, wz: number, lush: number) => {
      const tall = (profile.tall[0] + lush * profile.tall[1]) * heightScale * (0.88 + rand() * 0.24);
      addTuft(mb, this.ground, wx, wz, tall, this.tuftColor(lx, ly, wx, wz, onMap, rand), rand, profile.tuft);
    };

    for (let a = 0; a < profile.attempts; a++) {
      const wx = x0 + minU + rand() * (maxU - minU);
      const wz = z0 + minV + rand() * (maxV - minV);
      const lush = Math.min(1, this.patchLush(wx, wz) * 0.85 + waterBoost + skirtBoost + rockBoost);
      const prob = (profile.baseProb + lush * profile.lushProb) * deepWoods * groundScale * seasonDensity * fringeFade;
      if (rand() > prob) continue;
      if (!canPlace(wx, wz)) continue;
      placeTuft(wx, wz, lush);
      // Organic tussock clumping: occasionally add a nearby companion tuft in lush spots.
      if (lush > 0.42 && rand() < profile.clusterProb * lush * fringeFade) {
        const ang = rand() * Math.PI * 2, dist = 0.42 + rand() * 0.55;
        const cx = wx + Math.cos(ang) * dist, cz = wz + Math.sin(ang) * dist;
        if (canPlace(cx, cz)) placeTuft(cx, cz, lush * 0.92);
      }
    }
  }

  // ---- Country fringe (rebuilt only if mode changes or the map's outer border changes) ----

  private syncCountry(s: GameState) {
    if (this.mode === 'off') return;
    const key = countrySig(s, this.land, this.lie.relief, (tx, ty) => this.lie.y(tx, ty), this.mode);
    if (key === this.countryKey) return;
    if (this.countryMeshes.length) { this.drop(this.countryMeshes); this.countryMeshes = []; }
    this.countryKey = key;
    const profile = GRASS_PROFILES[this.mode];
    const { width: w, height: h } = s.map, reach = Math.min(GRASS_FRINGE, this.land.margin);
    const mb = new MeshBuilder('grass');
    const edgeBoxes = borderBoxes(s);
    for (let y = -reach; y < h + reach; y++) for (let x = -reach; x < w + reach; x++) {
      if (x >= 0 && y >= 0 && x < w && y < h) continue;
      const beyond = Math.hypot(Math.max(0, -x, x - w + 1), Math.max(0, -y, y - h + 1));
      const fade = (1 - smooth(0, reach + 0.5, beyond)) * 0.65;
      if (fade <= 0.05) continue;
      this.scatterTile(mb, s, x, y, false, profile, edgeBoxes, fade);
    }
    if (mb.vertexCount) {
      this.countryMeshes = [this.r.add(mb.build(), 'grass', { tile: CUT, castShadow: false, reflect: false })];
    }
  }

  // ---- Map blocks (8 × 8 tiles, rebuilt individually on change) ----

  private syncBlocks(s: GameState) {
    if (this.mode === 'off') return;
    const profile = GRASS_PROFILES[this.mode];
    const { width: w, height: h } = s.map;
    const yAt = (tx: number, ty: number) => this.lie.y(tx, ty);
    for (let by = 0; by * GRASS_BLOCK < h; by++) for (let bx = 0; bx * GRASS_BLOCK < w; bx++) {
      const x0 = bx * GRASS_BLOCK, y0 = by * GRASS_BLOCK;
      const x1 = Math.min(w, x0 + GRASS_BLOCK), y1 = Math.min(h, y0 + GRASS_BLOCK);
      const id = by * 1024 + bx;
      const key = blockKey(s, this.land, this.lie.relief, yAt, this.mode, x0, y0, x1, y1);
      const prev = this.blocks.get(id);
      if (prev?.key === key) continue;
      if (prev) this.drop(prev.meshes);
      const boxes = boxesIn(s, x0, y0, x1, y1);
      const mb = new MeshBuilder('grass');
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        this.scatterTile(mb, s, x, y, true, profile, boxes);
      }
      const meshes = mb.vertexCount ? [this.r.add(mb.build(), 'grass', { tile: CUT, castShadow: false, reflect: false })] : [];
      this.blocks.set(id, { key, meshes });
    }
  }

  private clearAll() {
    for (const b of this.blocks.values()) this.drop(b.meshes);
    this.blocks.clear();
    if (this.countryMeshes.length) { this.drop(this.countryMeshes); this.countryMeshes = []; }
    this.countryKey = '';
  }

  private drop(meshes: THREE.Mesh[]) {
    for (const m of meshes) { this.r.remove(m); m.geometry.dispose(); }
  }
}
