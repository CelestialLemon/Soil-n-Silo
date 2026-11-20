import * as THREE from 'three';
import {
  addFlower, addTuft, groundOf, MeshBuilder, noise2, rng, smooth, srgb, wheelRace,
  type BrushRenderer, type Ground, type LandArea,
} from '../../../brush3d/src/index.ts';
import type { Land } from '../../game/map.ts';
import { flooded } from '../../game/flood.ts';
import { layoutOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import {
  blockOf, boxesIn, FLOWER_PROFILES, FLOWER_SEASONS, flowersBloom, fringeFade, GRASS_FRINGE, GRASS_PROFILES, grassBlocks, grassLayout,
  inBuilding, layoutChanges, meadowTop, tileHabitat, tileSeed, wetDistance,
  type FlowerMode, type FlowerProfile, type FlowerSeason, type FootprintBox, type GrassBlockRect, type GrassLayout,
  type GrassMode, type GrassProfile, type TileHabitat,
} from './grassMask.ts';
import { TILE } from './scale.ts';

// The meadow across the valley floor: grass tufts (#256), painted blades swaying in the living wind, coloured from the
// land's own painted ground (`r.landColourAt`) so they blend into the ground paint and turn with the season (and shorten
// in winter so light snow lets frosted tips show while deep snow buries them cleanly); and wildflowers among them (#266),
// in soft drifts of the season's colours, gathered at the woods' skirts and the hills' edges, none in winter.
//
// - Both grow where the grass may (grassMask.ts's tileHabitat, footprints, slopes), each from its own random numbers, so
//   the grass is the same with the flowers on or off. No flowers on a tile a flood covers (flood.ts): they'd stand over its
//   water. They grow back as it drains.
// - Built in 4 × 4-tile blocks across the playable map and its country fringe, each a mesh for the grass and one for the
//   flowers. What changes in play
//   (a building or field placed or taken away, a tree or rock cleared, an earthwork) makes again only the blocks it
//   touches, found by comparing the layout's terrain and buildings with the last (grassMask.ts's layoutChanges), and
//   made again a few a frame within `REBUILD_BUDGET` (#204), so a long build drag never hitches.
// - A block a new building stands in, or whose ground an earthwork just moved (`r.onLandChange`, as it's swapped in), is
//   hidden until it's made again, first in the queue: its grass never pokes through the building or floats over (or
//   sinks into) the new ground for a frame. The rest (grass growing back, a repaint) keep showing until they're made.
// - Ground-hugging tufts and flowers skip sun shadows and water reflections (`castShadow: false, reflect: false`): the
//   painted ground already reflects in rivers and ponds, and skipping grass reflections saves ~0.6–1.1 ms GPU on water maps.

/** Per-frame CPU budget (ms) for making queued blocks again during play (matches `PaintedLand.step`). */
const REBUILD_BUDGET = 2.5;

/**
 * How far (m) the land may move under a block before its grass is hidden till it's made again. The refit's spread nudges
 * the ground a few centimetres for several tiles round an earthwork (a pixel or so at the closest zoom, for the frames
 * till it's made again); the tiles raised or lowered move a level.
 */
const MOVED = 0.1;
/** Where in a tile its height is looked at, to tell whether the ground under a block moved. */
const QUARTERS = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]] as const;

const SCRATCH = new THREE.Color();
/** Mixed into a tile's seed for its flowers' random numbers, apart from its grass's. */
const FLOWER_SALT = 0x5eed266;
/** The drifts' colour patches: about this many metres across, their edges wandering by up to `WANDER` m. */
const PATCH = 7;
const WANDER = 2.5;
/** The share of clumps in a colour of their own, not their patch's: a few strays among a drift. */
const STRAYS = 0.1;

/** What the meadow shows: its grass's density and its flowers'. */
export interface MeadowLooks { grass: GrassMode; flowers: FlowerMode }

export class Meadow {
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
  /** Each block's grass and flowers (none: none in it), and the land's height under it as it was made (`heightsUnder`). */
  private readonly blocks = new Map<number, Block>();
  /** Blocks to make again: hidden until they are (and made first), and the rest. */
  private readonly urgent = new Set<number>();
  private readonly dirty = new Set<number>();
  private looks: MeadowLooks;
  /** The flowers' season (it never changes during a commission), its colours as three.js wants them. */
  private readonly season: FlowerSeason;
  private readonly palette: THREE.Color[];
  /** The game's layout as the meadow last followed it, and the tiles a flood covered (flood.ts's `flooded`). */
  private layout = -1;
  private wet: Uint8Array | null = null;
  private seen: GrassLayout;
  private lastState: GameState;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState, looks: MeadowLooks) {
    this.r = r; this.lie = lie; this.land = land; this.looks = { ...looks }; this.lastState = s;
    this.seed = s.scenario.seed;
    this.season = FLOWER_SEASONS[s.scenario.climate.season];
    this.palette = this.season.palette.map((c) => srgb(c.hex));
    this.reach = Math.min(GRASS_FRINGE, land.margin);
    this.ground = groundOf((x, z) => r.landAt(x, z));
    this.wetDist = wetDistance(land);
    this.grid = grassBlocks(s.map.width, s.map.height, this.reach);
    for (const rect of this.grid) this.blockById.set(rect.id, rect);
    this.seen = grassLayout(s);
    if (this.on) this.rebuildAll(s);
    r.onLandChange((area) => this.landChanged(area));
  }

  /** How high (m) the meadow's plants stand at most, as shown: for telling them from a tree in a pick (tools.ts). */
  get top(): number { return meadowTop(this.looks.grass, this.flowering ? this.looks.flowers : 'off'); }

  /** Whether the flowers bloom: on, and not in winter. */
  private get flowering(): boolean { return flowersBloom(this.looks.flowers, this.lastState.scenario.climate.season); }

  /** Whether there's anything in the meadow to draw. */
  private get on(): boolean { return this.looks.grass !== 'off' || this.flowering; }

  /**
   * Switches a look option in place without leaking meshes or geometries: only the layer it changes is made again (the
   * grass keeps showing while the flowers change, and the flowers in winter don't change at all).
   */
  setLooks(next: Partial<MeadowLooks>) {
    const was = { grass: this.looks.grass, flowers: this.flowering ? this.looks.flowers : 'off' };
    this.looks = { ...this.looks, ...next };
    const layers = { grass: this.looks.grass !== was.grass, flowers: (this.flowering ? this.looks.flowers : 'off') !== was.flowers };
    if (!layers.grass && !layers.flowers) return;
    for (const b of this.blocks.values()) {
      if (layers.grass) b.grass = this.drop(b.grass);
      if (layers.flowers) b.flowers = this.drop(b.flowers);
    }
    if (!this.on) { this.urgent.clear(); this.dirty.clear(); return; }
    this.wet = this.flowering ? flooded(this.lastState).tiles : null;
    // On an earthwork's new ground not drawn yet: queued (sync makes them once it is).
    if (this.r.landAhead) { for (const rect of this.grid) this.queue(rect.id); return; }
    // Turned on from nothing: the layout it last followed is old, so it's all made afresh.
    if (was.grass === 'off' && was.flowers === 'off') { this.rebuildAll(this.lastState); return; }
    for (const rect of this.grid) {
      // A block waiting to be made again is made whole; the rest only in the layer that changed.
      const queued = this.urgent.delete(rect.id) || this.dirty.delete(rect.id);
      this.rebuildBlock(this.lastState, rect, queued ? undefined : layers);
    }
  }

  /**
   * Follows the game: the blocks a change in its layout touches are queued (those a new building stands in hidden till
   * they're made), and queued blocks made again within `REBUILD_BUDGET` ms.
   */
  sync(s: GameState) {
    this.lastState = s;
    if (!this.on) return;
    const layout = layoutOf(s);
    if (layout !== this.layout) {
      this.layout = layout;
      const now = grassLayout(s), { urgent, dirty } = layoutChanges(this.seen, now, s.map.width);
      this.seen = now;
      for (const id of urgent) this.hide(id);
      for (const id of dirty) this.queue(id);
    }
    if (this.flowering) this.followFlood(s);
    // Not on an earthwork's new ground till it's drawn (the swap's landChanged queues what it moved).
    if ((this.urgent.size || this.dirty.size) && !this.r.landAhead) this.drain(s);
  }

  /** A block queued to be made again (behind the hidden ones), its plants showing meanwhile. */
  private queue(id: number) {
    if (this.blockById.has(id) && !this.urgent.has(id)) this.dirty.add(id);
  }

  /** The blocks whose tiles a flood has just covered or left queued, so their flowers go and come back with it. */
  private followFlood(s: GameState) {
    const now = flooded(s).tiles;
    if (now === this.wet) return;
    const was = this.wet, w = s.map.width;
    this.wet = now;
    if (!was) return;
    for (let i = 0; i < now.length; i++) if (now[i] !== was[i]) this.queue(blockOf(i % w, Math.floor(i / w)));
  }

  /**
   * The land as drawn changed in `area` (m): its blocks made again, those whose ground moved under them hidden till they
   * are (made first), so no tuft floats over or sinks into it; the rest (repainted, or the refit's spread leaving them as
   * they were) keep showing meanwhile.
   */
  private landChanged(area: LandArea) {
    if (!this.on) return;
    const x0 = Math.floor(area.x0 / TILE), z0 = Math.floor(area.z0 / TILE), x1 = Math.ceil(area.x1 / TILE) - 1, z1 = Math.ceil(area.z1 / TILE) - 1;
    for (const rect of this.grid) {
      if (rect.x1 <= x0 || rect.x0 > x1 || rect.y1 <= z0 || rect.y0 > z1) continue;
      const was = this.blocks.get(rect.id)?.heights, now = this.heightsUnder(rect);
      if (!was || now.some((y, i) => Math.abs(y - was[i]) > MOVED)) this.hide(rect.id);
      else this.queue(rect.id);
    }
  }

  /** The land's height (m) under a block, as drawn: at each quarter of each tile. */
  private heightsUnder(rect: GrassBlockRect): Float32Array {
    const out = new Float32Array((rect.x1 - rect.x0) * (rect.y1 - rect.y0) * 4);
    let i = 0;
    for (let y = rect.y0; y < rect.y1; y++) for (let x = rect.x0; x < rect.x1; x++) {
      for (const [u, v] of QUARTERS) out[i++] = this.r.landAt((x + u) * TILE, (y + v) * TILE);
    }
    return out;
  }

  /** A block queued first, its grass hidden till it's made again. */
  private hide(id: number) {
    if (!this.blockById.has(id)) return;
    this.dirty.delete(id);
    this.urgent.add(id);
    const b = this.blocks.get(id);
    for (const m of [b?.grass, b?.flowers]) if (m) m.visible = false;
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

  // ---- The wildflowers' drifts and colours ----

  /**
   * Where the wildflowers drift (0..1) at world metres (wx, wz): broad soft patches with a finer break-up, so drifts
   * have ragged edges and open meadow between; raised by the tile's habitat (`lift`: tree skirts, hill edges, banks).
   */
  private driftAt(wx: number, wz: number, lift: number, p: FlowerProfile): number {
    const s = (this.seed % 991) * 0.17 + 31;
    const broad = noise2(wx * 0.055 - s, wz * 0.055 + s * 0.6) * 0.5 + 0.5;
    const fine = noise2(wx * 0.19 + s * 0.4, wz * 0.19 - s) * 0.5 + 0.5;
    return smooth(p.drift[0], p.drift[1], broad * 0.66 + fine * 0.34 + lift);
  }

  /**
   * A drift's colour at (wx, wz): the season's palette by patches about `PATCH` m across (the nearest of a jittered grid
   * of points, its edges wandering), so a drift is mostly one colour and two meet along a ragged edge.
   */
  private patchColour(wx: number, wz: number): THREE.Color {
    const s = (this.seed % 983) * 0.11;
    const px = wx + noise2(wx * 0.11 + s, wz * 0.11) * WANDER, pz = wz + noise2(wx * 0.11, wz * 0.11 - s) * WANDER;
    const cx = Math.floor(px / PATCH), cz = Math.floor(pz / PATCH);
    let best = Infinity, pick = 0;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const h = tileSeed(this.seed ^ FLOWER_SALT, cx + dx, cz + dz);
      const qx = (cx + dx + (h & 0xffff) / 0x10000) * PATCH, qz = (cz + dz + (h >>> 16) / 0x10000) * PATCH;
      const d = (qx - px) ** 2 + (qz - pz) ** 2;
      if (d < best) { best = d; pick = tileSeed(h, 7, 11) / 2 ** 32; }
    }
    return this.paletteAt(pick);
  }

  /** The palette's colour at `t` (0..1) along its weights. */
  private paletteAt(t: number): THREE.Color {
    const colours = this.season.palette, total = colours.reduce((a, c) => a + c.weight, 0);
    let at = t * total;
    for (let i = 0; i < colours.length; i++) {
      at -= colours[i].weight;
      if (at < 0) return this.palette[i];
    }
    return this.palette[this.palette.length - 1];
  }

  // ---- Per-tile scattering ----

  /** A tile's grass and flowers, where its habitat lets them grow. */
  private scatterTile(
    grass: MeshBuilder | null,
    flowers: MeshBuilder | null,
    s: GameState,
    tx: number,
    ty: number,
    onMap: boolean,
    boxes: readonly FootprintBox[],
    fade: number,
    wet: Uint8Array | null,
  ) {
    const hab = tileHabitat(s, this.land, this.lie.relief, this.wetDist, tx, ty, onMap);
    if (!hab) return;
    const x0 = tx * TILE, z0 = ty * TILE;
    const canPlace = (wx: number, wz: number): boolean => {
      if (wx < x0 + hab.minU || wx > x0 + hab.maxU || wz < z0 + hab.minV || wz > z0 + hab.maxV) return false;
      if (boxes.length && inBuilding(boxes, wx, wz, wheelRace)) return false;
      return this.ground.normal(wx, wz).y >= 0.82;
    };
    if (grass) this.scatterGrass(grass, tx, ty, hab, canPlace, GRASS_PROFILES[this.looks.grass as Exclude<GrassMode, 'off'>], fade);
    if (flowers && !(onMap && wet?.[ty * s.map.width + tx])) this.scatterFlowers(flowers, tx, ty, hab, canPlace, FLOWER_PROFILES[this.looks.flowers as Exclude<FlowerMode, 'off'>], fade);
  }

  private scatterGrass(
    mb: MeshBuilder,
    tx: number,
    ty: number,
    hab: TileHabitat,
    canPlace: (wx: number, wz: number) => boolean,
    profile: GrassProfile,
    fade: number,
  ) {
    const { minU, maxU, minV, maxV, waterBoost, skirtBoost, rockBoost, deepWoods, groundScale, seasonDensity, heightScale } = hab;
    const rand = rng(tileSeed(this.seed, tx, ty));
    const x0 = tx * TILE, z0 = ty * TILE;

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

  /**
   * A tile's wildflowers: candidate spots taken by the drift field (so they gather in drifts, not evenly), each a clump of
   * a few blooms of one colour, the patch's (or now and then a stray). Thinned as the grass is in deep woods and on poor
   * ground, and in the country fringe.
   */
  private scatterFlowers(
    mb: MeshBuilder,
    tx: number,
    ty: number,
    hab: TileHabitat,
    canPlace: (wx: number, wz: number) => boolean,
    profile: FlowerProfile,
    fade: number,
  ) {
    const { minU, maxU, minV, maxV, waterBoost, skirtBoost, edgeBoost, deepWoods, groundScale } = hab;
    const { density, clump } = this.season;
    const rand = rng(tileSeed(this.seed ^ FLOWER_SALT, tx, ty));
    const x0 = tx * TILE, z0 = ty * TILE, lift = skirtBoost * 0.6 + edgeBoost + waterBoost * 0.4;
    for (let a = 0; a < profile.attempts; a++) {
      const wx = x0 + minU + rand() * (maxU - minU), wz = z0 + minV + rand() * (maxV - minV);
      const prob = this.driftAt(wx, wz, lift, profile) * density * deepWoods * groundScale * fade;
      if (rand() >= prob) continue;
      const colour = rand() < STRAYS ? this.paletteAt(rand()) : this.patchColour(wx, wz);
      const blooms = Math.max(1, Math.round((profile.clump[0] + Math.floor(rand() * profile.clump[1])) * clump));
      for (let k = 0; k < blooms; k++) {
        // The first at the spot, the rest round it, closer in more often.
        const ang = rand() * Math.PI * 2, dist = k === 0 ? 0 : 0.08 + rand() * rand() * 0.34;
        const fx = wx + Math.cos(ang) * dist, fz = wz + Math.sin(ang) * dist;
        if (canPlace(fx, fz)) addFlower(mb, this.ground, fx, fz, colour, rand, profile.flower);
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
    this.wet = this.flowering ? flooded(s).tiles : null;
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

  /** Makes a block again: its grass and flowers both, or only the `layers` asked (the land under it as it was made). */
  private rebuildBlock(s: GameState, rect: GrassBlockRect, layers = { grass: true, flowers: true }) {
    const block = this.blocks.get(rect.id) ?? { heights: this.heightsUnder(rect) };
    if (layers.grass) block.grass = this.drop(block.grass);
    if (layers.flowers) block.flowers = this.drop(block.flowers);
    const { width: w, height: h } = s.map;
    const boxes = boxesIn(s, rect.x0, rect.y0, rect.x1, rect.y1);
    const grass = layers.grass && this.looks.grass !== 'off' ? new MeshBuilder('grass') : null;
    const flowers = layers.flowers && this.flowering ? new MeshBuilder('foliage') : null;
    const wet = flowers ? flooded(s).tiles : null;
    for (let y = rect.y0; y < rect.y1; y++) for (let x = rect.x0; x < rect.x1; x++) {
      const fade = fringeFade(x, y, w, h, this.reach);
      if (fade <= 0) continue;
      const onMap = x >= 0 && y >= 0 && x < w && y < h;
      this.scatterTile(grass, flowers, s, x, y, onMap, boxes, fade, wet);
    }
    // Culled whole (not cut into tiles: a block is small, and made again often). The flowers keep no rain off (cover).
    if (grass?.vertexCount) block.grass = this.r.add(grass.build(), 'grass', { cull: true, castShadow: false, reflect: false });
    if (flowers?.vertexCount) block.flowers = this.r.add(flowers.build(), 'foliage', { cull: true, castShadow: false, reflect: false, cover: 'none' });
    // Both made: the land under it is as it is now.
    if (layers.grass && layers.flowers) block.heights = this.heightsUnder(rect);
    this.blocks.set(rect.id, block);
  }

  /** Takes a mesh out of the picture and frees it. */
  private drop(m: THREE.Mesh | undefined): undefined {
    if (m) { this.r.remove(m); m.geometry.dispose(); }
    return undefined;
  }
}

/** A block's grass and flowers, as made, and the land's height under it then. */
interface Block { grass?: THREE.Mesh; flowers?: THREE.Mesh; heights: Float32Array }
