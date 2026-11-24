// The meadow: grass tufts, wildflowers in drifts and reeds along the water, over the valley in 16 m blocks. Each cell
// grows from its own seed (the game's hash of the valley's seed and the cell), so a block built again after an edit next
// door grows exactly as it did: nothing pops but what the edit touched. An edit queues the blocks it reaches; those whose
// land is being painted again wait for brush3d to swap the new land in (onLandChange) and are built again in that frame,
// before it's drawn, so the grass never floats over a new cut or sinks into a new pad; the rest are built within a few
// milliseconds a frame.
import type * as THREE from 'three';
import {
  addFlower, addReeds, addTuft, BANK_DRY, type BrushRenderer, C, groundOf, type LandArea, MeshBuilder, noise2, type ReedOptions,
  rng, srgb,
} from '../../brush3d/src/index.ts';
import {
  type Change, COVER, type GameState, hash3, isWet, obbBounds, pointInObb, type Rect, type Season, slopeAt,
  thingObb, type Tree, unionRect,
} from '../game/index.ts';
import { addMesh, dropMesh, rectOfArea } from './util.ts';

/** A block's side, in cells (16 m at the game's 1 m). */
const BLOCK = 16;
/** How long (ms) a frame may spend building blocks. */
const BUDGET_MS = 3;
/** The game's grass: short tufts of a few fine blades, in the ground's own colour (the old valley's look). */
const TUFT = { blades: [4, 3] as [number, number], width: [0.055, 0.028] as [number, number], spread: 0.11 };
/** How many tufts a square metre of open meadow grows, at most. */
const TUFTS = 1.05;
/** A wildflower's look: crisp small blooms that read at the game's zoom. */
const BLOOM = { size: [0.075, 0.035] as [number, number], lift: [0.18, 0.22] as [number, number], crisp: true };
/** Grass stays this far (m) from a building's footprint and a trunk. */
const CLEAR_THING = 0.3, CLEAR_TRUNK = 0.45;

/** The flowers each season brings: their colours (weighted) and how thickly they grow (1 spring's drifts). */
const FLOWERS: Record<Season, { palette: [number, number][]; density: number }> = {
  spring: { palette: [[0xe2dbc8, 3], [0xe0b93a, 3], [0xf6b48f, 2], [0x9cc8ec, 2]], density: 1 },
  summer: { palette: [[0xf08bb0, 2], [0xe8574a, 1], [0xa77ad8, 2], [0xe0b93a, 2], [0xe2dbc8, 2]], density: 0.45 },
  autumn: { palette: [[0xe0b93a, 2], [0xa77ad8, 1], [0xe2dbc8, 1]], density: 0.12 },
  winter: { palette: [], density: 0 },
};

/** The reeds through the year: green in spring and summer with bulrush heads by summer, straw in autumn, frosted grey in winter. */
const REEDS: Record<Season, { palette: number[]; tip: number; tipMix: number; tall: number; heads: number }> = {
  spring: { palette: [0x86a446, 0x9ab452, 0xb8a464], tip: 0xc4dc6c, tipMix: 0.6, tall: 0.85, heads: 0.3 },
  summer: { palette: [0x7a9a40, 0x6a8c3c, 0x9caa4e], tip: 0xb8d062, tipMix: 0.5, tall: 1, heads: 1 },
  autumn: { palette: [0xc9a24c, 0xb8903e, 0x9a9446], tip: 0xead48c, tipMix: 0.5, tall: 1, heads: 1.2 },
  winter: { palette: [0xa8987a, 0x9a8a6c, 0xb8ab8e], tip: 0xe8eef0, tipMix: 0.7, tall: 0.85, heads: 0.8 },
};
const REED_SHAPE: ReedOptions = { blades: [12, 10], across: 0.55, width: [0.026, 0.016] };

/** The cells a block covers. */
const blockRect = (bx: number, bz: number, n: number): Rect => ({ x0: bx * BLOCK, z0: bz * BLOCK, x1: Math.min(n, (bx + 1) * BLOCK) - 1, z1: Math.min(n, (bz + 1) * BLOCK) - 1 });

export class Meadow {
  private readonly r: BrushRenderer;
  private state: GameState;
  private readonly cols: number;
  private readonly rows: number;
  private readonly meshes: THREE.Mesh[][];
  /** Blocks to build when there's time, and blocks waiting for the land under them to be swapped in. */
  private readonly queue = new Set<number>();
  private readonly waiting = new Set<number>();
  /** Frames the waiting blocks have waited with no land being painted (an edit that left the drawn land as it was). */
  private idle = 0;
  /** Where each thing and planted tree stood when last drawn (cells), so moving one clears the grass from where it goes and
   * grows it back where it was. */
  private readonly footprints = new Map<string, Rect>();
  private readonly stopLand: () => void;
  private flowerColours: THREE.Color[] = [];
  private reed = REEDS.spring;

  constructor(r: BrushRenderer, state: GameState) {
    this.r = r; this.state = state;
    const g = state.grid;
    this.cols = Math.ceil(g.nx / BLOCK); this.rows = Math.ceil(g.nz / BLOCK);
    this.meshes = Array.from({ length: this.cols * this.rows }, () => []);
    this.stopLand = r.onLandChange((area) => this.landSwapped(area));
    this.season(state.season);
    this.rememberFootprints();
    for (let k = 0; k < this.meshes.length; k++) this.build(k);
  }

  /** A new valley: everything built again (setTerrain fires onLandChange too, but this is sure). */
  reset(state: GameState) {
    this.state = state;
    this.queue.clear(); this.waiting.clear();
    this.season(state.season);
    this.rememberFootprints();
    for (let k = 0; k < this.meshes.length; k++) this.build(k);
  }

  /** Queues the blocks an edit reaches. `landSent`: the land under `landRect` is being painted again (wait for its swap). */
  sync(change: Change, landRect: Rect | undefined, landSent: boolean) {
    let dirty = unionRect(change.wet, change.water);
    const moved = (key: string, now: Rect | undefined) => {
      const was = this.footprints.get(key);
      dirty = unionRect(unionRect(dirty, was), now);
      if (now) this.footprints.set(key, now); else this.footprints.delete(key);
    };
    for (const id of change.things) {
      const t = this.state.things.find((o) => o.id === id);
      moved(`thing:${id}`, t && this.rectOfBounds(obbBounds(thingObb(t), CLEAR_THING + 1)));
    }
    for (const id of change.trees) {
      const t = this.state.plantedTrees.find((o) => o.id === id);
      moved(`tree:${id}`, t && this.rectOfBounds({ minX: t.x - 1.5, minZ: t.z - 1.5, maxX: t.x + 1.5, maxZ: t.z + 1.5 }));
    }
    if (dirty) for (const k of this.blocksIn(dirty)) this.queue.add(k);
    if (landRect) for (const k of this.blocksIn({ x0: landRect.x0 - 1, z0: landRect.z0 - 1, x1: landRect.x1 + 1, z1: landRect.z1 + 1 })) {
      if (landSent) { this.waiting.add(k); this.queue.delete(k); } else this.queue.add(k);
    }
  }

  /** Builds queued blocks within the frame's budget, once the land isn't mid-repaint. */
  drain() {
    if (this.waiting.size) {
      // An edit that changed nothing as drawn never swaps: let its blocks go after a few quiet frames.
      if (this.r.landAhead) this.idle = 0;
      else if (++this.idle > 3) { for (const k of this.waiting) this.queue.add(k); this.waiting.clear(); this.idle = 0; }
    }
    if (!this.queue.size || this.r.landAhead) return;
    const start = performance.now();
    for (const k of this.queue) {
      this.queue.delete(k);
      if (this.waiting.has(k)) continue;
      this.build(k);
      if (performance.now() - start > BUDGET_MS) break;
    }
  }

  dispose() {
    this.stopLand();
    for (const list of this.meshes) { for (const m of list) dropMesh(this.r, m); list.length = 0; }
    this.queue.clear(); this.waiting.clear();
  }

  // ---- Building ----

  /** The land swapped in over `area`: the blocks there that wait for it are built now, before the frame draws it. */
  private landSwapped(area: LandArea) {
    const rect = rectOfArea(this.state.grid, area);
    if (!rect) return;
    for (const k of this.blocksIn(rect)) if (this.waiting.delete(k)) this.build(k);
  }

  private season(season: Season) {
    const f = FLOWERS[season];
    this.flowerColours = f.palette.flatMap(([hex, w]) => Array.from({ length: w }, () => srgb(hex)));
    this.reed = REEDS[season];
  }

  private rememberFootprints() {
    this.footprints.clear();
    for (const t of this.state.things) { const rect = this.rectOfBounds(obbBounds(thingObb(t), CLEAR_THING + 1)); if (rect) this.footprints.set(`thing:${t.id}`, rect); }
    for (const t of this.state.plantedTrees) { const rect = this.rectOfBounds({ minX: t.x - 1.5, minZ: t.z - 1.5, maxX: t.x + 1.5, maxZ: t.z + 1.5 }); if (rect) this.footprints.set(`tree:${t.id}`, rect); }
  }

  private rectOfBounds(b: { minX: number; minZ: number; maxX: number; maxZ: number }): Rect | undefined {
    const g = this.state.grid;
    const x0 = Math.max(0, Math.floor((b.minX - g.x0) / g.cell)), z0 = Math.max(0, Math.floor((b.minZ - g.z0) / g.cell));
    const x1 = Math.min(g.nx - 1, Math.floor((b.maxX - g.x0) / g.cell)), z1 = Math.min(g.nz - 1, Math.floor((b.maxZ - g.z0) / g.cell));
    return x0 > x1 || z0 > z1 ? undefined : { x0, z0, x1, z1 };
  }

  private *blocksIn(rect: Rect) {
    const bx0 = Math.max(0, Math.floor(rect.x0 / BLOCK)), bz0 = Math.max(0, Math.floor(rect.z0 / BLOCK));
    const bx1 = Math.min(this.cols - 1, Math.floor(rect.x1 / BLOCK)), bz1 = Math.min(this.rows - 1, Math.floor(rect.z1 / BLOCK));
    for (let bz = bz0; bz <= bz1; bz++) for (let bx = bx0; bx <= bx1; bx++) yield bz * this.cols + bx;
  }

  /** Builds one block again: its tufts, its flowers and its reeds, each cell from its own seed. */
  private build(k: number) {
    const r = this.r, s = this.state, g = s.grid, list = this.meshes[k];
    for (const m of list) dropMesh(r, m);
    list.length = 0;
    const bx = k % this.cols, bz = (k - bx) / this.cols, rect = blockRect(bx, bz, g.nx);
    const x0 = g.x0 + rect.x0 * g.cell, z0 = g.z0 + rect.z0 * g.cell, x1 = g.x0 + (rect.x1 + 1) * g.cell, z1 = g.z0 + (rect.z1 + 1) * g.cell;
    // What stands in the block: the things' footprints and the trunks the grass keeps clear of.
    const near = (x: number, z: number, m: number) => x > x0 - m && x < x1 + m && z > z0 - m && z < z1 + m;
    const obbs = s.things.map((t) => thingObb(t)).filter((o) => near(o.cx, o.cz, Math.hypot(o.hw, o.hd) + 1));
    const trunks: Tree[] = [...s.wildTrees, ...s.plantedTrees].filter((t) => near(t.x, t.z, 1));
    const blocked = (x: number, z: number) => obbs.some((o) => pointInObb(o, x, z, CLEAR_THING)) || trunks.some((t) => Math.hypot(t.x - x, t.z - z) < CLEAR_TRUNK * Math.max(1, t.scale));
    const ground = groundOf((x, z) => r.landAt(x, z));
    const grass = new MeshBuilder('grass'), flowers = new MeshBuilder('foliage'), tint = C.meadow.clone();
    const fl = FLOWERS[s.season], reed = this.reed, seed = s.seed;
    for (let iz = rect.z0; iz <= rect.z1; iz++) for (let ix = rect.x0; ix <= rect.x1; ix++) {
      const c = iz * g.nx + ix, cover = g.cover[c];
      if (cover === COVER.water || cover === COVER.rill || cover === COVER.track || cover === COVER.rock || cover === COVER.field) continue;
      if (g.fieldOf[c] !== 0 || isWet(g.waterLevel[c])) continue;
      const rand = rng(hash3(seed, ix, iz)), cx = g.x0 + ix * g.cell, cz = g.z0 + iz * g.cell;
      const wet = g.moisture[c], worked = g.worked[c] / 255;
      // Reeds along the water's edge: a dry cell with water beside it.
      if (wet > 0.35 && this.besideWater(ix, iz) && rand() < 0.55 * (0.6 + 0.4 * noise2(cx * 0.21 + 7, cz * 0.21))) {
        const rx = cx + rand() * g.cell, rz = cz + rand() * g.cell;
        if (!blocked(rx, rz)) {
          const col = srgb(reed.palette[Math.floor(rand() * reed.palette.length)] ?? 0x7a9a40);
          addReeds(grass, ground, rx, rz, rand, { ...REED_SHAPE, tall: [0.7 * reed.tall, 0.55 * reed.tall], colour: col, tip: srgb(reed.tip), tipMix: reed.tipMix, heads: 0.1 * reed.heads });
        }
      }
      // The grass: thick in the open meadow, thinning in drifts, sparse under the woods and on bare ground, none on a pad.
      const drift = 0.5 + 0.5 * noise2(cx * 0.07 + seed % 101, cz * 0.07 - 3);
      const base = cover === COVER.woods ? 0.18 : cover === COVER.bare ? 0.08 : 0.55 + 0.45 * drift;
      const density = TUFTS * base * (1 - worked) * (1 + 0.3 * wet);
      let count = Math.floor(density) + (rand() < density % 1 ? 1 : 0);
      if (count > 0 && slopeAt(g, cx + 0.5, cz + 0.5) > 1.1) count = 0;
      for (let n = 0; n < count; n++) {
        const x = cx + rand() * g.cell, z = cz + rand() * g.cell;
        if (blocked(x, z) || r.bedAt(x, z) > BANK_DRY) continue;
        const lush = Math.min(1, 0.35 * drift + 0.7 * wet + 0.15 * rand());
        r.landColourAt(x, z, tint).lerp(C.meadow, 0.2).lerp(C.emerald, 0.25 * wet)
          .offsetHSL((rand() - 0.5) * 0.014, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.035);
        addTuft(grass, ground, x, z, 0.18 + lush * 0.3, tint, rand, TUFT);
      }
      // Wildflowers in drifts of a colour, over the open meadow.
      if (fl.density > 0 && cover === COVER.grass && worked < 0.1 && this.flowerColours.length) {
        const bloom = noise2(cx * 0.09 + 31, cz * 0.09 - 17 + (seed % 53));
        if (bloom > 0.15 && rand() < fl.density * 0.55 * Math.min(1, (bloom - 0.15) * 2.5)) {
          const pick = Math.abs(Math.floor((noise2(cx * 0.05 - 9, cz * 0.05 + 4) * 0.5 + 0.5) * this.flowerColours.length * 1.7)) % this.flowerColours.length;
          const col = this.flowerColours[pick] ?? C.lime;
          const many = 1 + Math.floor(rand() * 3);
          for (let n = 0; n < many; n++) {
            const x = cx + rand() * g.cell, z = cz + rand() * g.cell;
            if (!blocked(x, z) && r.bedAt(x, z) <= BANK_DRY) addFlower(flowers, ground, x, z, col, rand, BLOOM);
          }
        }
      }
    }
    if (grass.vertexCount) list.push(addMesh(r, grass.build(), 'grass', { castShadow: false, reflect: false, cull: true }));
    if (flowers.vertexCount) list.push(addMesh(r, flowers.build(), 'foliage', { castShadow: false, cover: 'none', reflect: false, cull: true }));
  }

  /** Whether water lies in a cell next to this one. */
  private besideWater(ix: number, iz: number) {
    const g = this.state.grid;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const x = ix + dx, z = iz + dz;
      if ((dx || dz) && x >= 0 && z >= 0 && x < g.nx && z < g.nz && isWet(g.waterLevel[z * g.nx + x])) return true;
    }
    return false;
  }
}
