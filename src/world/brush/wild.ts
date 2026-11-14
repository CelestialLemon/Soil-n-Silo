import * as THREE from 'three';
import {
  addCanopy, addStone, CropPatch, dressFor, groundOf, Grove, MeshBuilder, rng, speciesTree, type BrushRenderer, type CropStage, type Dress,
  type Ground, type Species,
} from '../../../brush3d/src/index.ts';
import { CROPS, SAPLING_SECONDS } from '../../game/data.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { baseLevel } from '../../game/relief.ts';
import { inMap, layoutOf, reliefOf, terrainAt, type FieldBuilding, type GameState } from '../../game/state.ts';
import { landRelief, standY, type Lie } from '../ground.ts';
import { hash } from '../kit.ts';
import { treeAt, wetAt } from '../trees.ts';
import { RISE, TILE } from './scale.ts';
import { thingHeight } from './things.ts';

// What grows, in paint (#213): the fields' crops at their stage, the trees by species in the level's season (the game picks
// the species by where a tree stands, trees.ts, as the pixel world does), saplings growing, and the rocks. The renderer
// paints them from the game's words (brush3d/src/kit/plants.ts); this says which and where.
//
// - The map's trees are painted in blocks of BLOCK × BLOCK tiles, each made anew only when a tree in it is cleared, grows
//   from a sapling or has the ground moved under it; a field's crop when its stage or crop changes. (#204 makes these
//   changes without a hitch.)
// - The country's trees within NEAR tiles of the map are painted as the map's; further off, the woods are crowns alone, a
//   crown for each 2 × 2 tiles of wood, as the pixel world draws them (terrain.ts).

/** The side of a block of the map's trees (tiles). */
const BLOCK = 8;
/** How far beyond the map (tiles) the country's trees are painted whole; further, the woods are crowns. */
const NEAR = 8;
/** How finely the renderer cuts the country's meshes, so only what's in view is drawn (m). */
const CUT = 64;
/** A grown tree's size, from a tile's hash: some variety, as the pixel world's 0.62 to 0.87 of its model. */
const treeSize = (n: number) => 0.8 + 0.3 * n;
/**
 * How broad a tree's strokes are against the demo's (brush3d's kit): the game's camera stands further off (4 to 24 px a
 * metre, against the demo's 16 to 192), where the kit's strokes would be a few pixels each, noisy and costly. Broader,
 * fewer strokes keep a crown reading as a few masses of light and shade, at about a third of the cost.
 */
const STROKE = 1.8;
/** The share of a crown's outer strokes painted: a little looser than the demo's, and cheaper where woods stand thick. */
const FILL = 0.55;
/** How far a tree stands off its tile's middle (m): woods, not an orchard's rows. */
const JITTER = 1.2;

/**
 * A field's stage as drawn: by its growth, and ripe while a harvest waits for a truck (as the pixel world's, view.ts).
 */
export function stageOf(f: FieldBuilding): CropStage {
  const crop = CROPS[f.crop];
  return (f.stored >= crop.yield ? crop.stages - 1 : Math.min(crop.stages - 1, Math.floor(f.growth * crop.stages))) as CropStage;
}

interface Shown { meshes: THREE.Mesh[]; key: string }

export class Wild {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly land: Land;
  private readonly dress: Dress | null;
  private readonly ground: Ground;
  private readonly blocks = new Map<number, Shown>();
  private readonly fields = new Map<number, Shown>();
  private readonly saplings = new Map<number, Shown>();
  private layout = -1;
  private relief = -1;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState) {
    this.r = r; this.lie = lie; this.land = land;
    const M = land.margin;
    this.ground = groundOf((x, z) => lie.y(x / TILE, z / TILE) * RISE * TILE);
    // Fallen leaves and petals lie on the land, not on the water.
    this.dress = dressFor(s.scenario.climate.season, (x, z) => {
      const lx = Math.floor(x / TILE) + M, ly = Math.floor(z / TILE) + M;
      return lx >= 0 && ly >= 0 && lx < land.width && ly < land.height && land.terrain[ly * land.width + lx] !== TERRAIN.water;
    });
    this.country(s);
  }

  /** Follows the game: trees cleared or grown, saplings growing, crops growing, ripening and harvested, earthworks. */
  sync(s: GameState) {
    const layout = layoutOf(s), relief = reliefOf(s);
    if (layout !== this.layout || relief !== this.relief) {
      this.layout = layout; this.relief = relief;
      this.syncBlocks(s);
    }
    this.syncFields(s);
    this.syncSaplings(s);
  }

  // ---- The country beyond the map, made once ----

  private country(s: GameState) {
    const { land, r } = this, M = land.margin, w = s.map.width, h = s.map.height;
    const lr = landRelief(land), season = s.scenario.climate.season;
    const kind = (x: number, y: number) => land.terrain[(y + M) * land.width + x + M];
    const onLand = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
    const wet = (x: number, y: number) => wetAt((wx, wy) => onLand(wx, wy) && kind(wx, wy) === TERRAIN.water, x, y);
    const species = (x: number, y: number) => treeAt(x, y, baseLevel(lr, x + M, y + M), wet(x, y)).species;
    const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - w), Math.max(0, -y, y - h));
    const grove = new Grove(this.dress), crowns = new MeshBuilder('foliage'), stones = new MeshBuilder('paint'), rand = rng(213);
    for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
      if (x >= 0 && y >= 0 && x < w && y < h) continue;
      const t = kind(x, y), near = beyond(x + 0.5, y + 0.5) <= NEAR;
      // Rocks only near the map, as the pixel world's: further off they'd be specks.
      if (t === TERRAIN.rock && near) this.stone(stones, x, y);
      if (t !== TERRAIN.tree) continue;
      if (near) { this.tree(grove, species(x, y), x, y); continue; }
      // A crown for each 2 × 2 block of far woods, of the species of its first tile.
      if ((x & 1) || (y & 1)) continue;
      const n = hash(x, y), cx = (x + 1 + (hash(x + 3, y) - 0.5)) * TILE, cz = (y + 1 + (hash(x, y + 3) - 0.5)) * TILE;
      addCanopy(crowns, cx, this.ground.height(cx, cz) - 0.3, cz, 3.2 + 1.4 * n, species(x, y), season, rand);
    }
    grove.addTo(r, { tile: CUT });
    if (crowns.vertexCount) r.add(crowns.build(), 'foliage', { tile: CUT, castShadow: true });
    if (stones.vertexCount) r.add(stones.build(), 'paint', { tile: CUT });
  }

  // ---- The map's trees and rocks, a block at a time ----

  private syncBlocks(s: GameState) {
    const { width: w, height: h } = s.map;
    const wet = (x: number, y: number) => wetAt((wx, wy) => inMap(s, wx, wy) && terrainAt(s, wx, wy) === TERRAIN.water, x, y);
    for (let by = 0; by * BLOCK < h; by++) for (let bx = 0; bx * BLOCK < w; bx++) {
      // What the block holds: its trees and rocks, and the ground under each.
      const here: [number, number, number][] = [];
      for (let y = by * BLOCK; y < Math.min(h, (by + 1) * BLOCK); y++) for (let x = bx * BLOCK; x < Math.min(w, (bx + 1) * BLOCK); x++) {
        const t = terrainAt(s, x, y);
        if (t === TERRAIN.tree || t === TERRAIN.rock) here.push([x, y, t]);
      }
      const key = here.map(([x, y, t]) => `${x},${y},${t},${this.lie.y(x + 0.5, y + 0.5).toFixed(3)}`).join(' ');
      const id = by * 1024 + bx, was = this.blocks.get(id);
      if (was?.key === key) continue;
      if (was) this.drop(was.meshes);
      const grove = new Grove(this.dress), stones = new MeshBuilder('paint');
      for (const [x, y, t] of here) {
        if (t === TERRAIN.rock) this.stone(stones, x, y);
        else this.tree(grove, treeAt(x, y, baseLevel(s.map, x, y), wet(x, y)).species, x, y);
      }
      const meshes = grove.addTo(this.r, { tile: CUT });
      if (stones.vertexCount) meshes.push(this.r.add(stones.build(), 'paint', { tile: CUT }));
      this.blocks.set(id, { meshes, key });
    }
  }

  /** A grown tree of `species` on tile (x, y), into `grove`. */
  private tree(grove: Grove, species: Species, x: number, y: number, size = treeSize(hash(x, y))) {
    const n = hash(x * 1.3 + 7, y * 0.9 - 3);
    const tx = (x + 0.5) * TILE + (hash(x + 11, y) - 0.5) * JITTER, tz = (y + 0.5) * TILE + (hash(x, y + 11) - 0.5) * JITTER;
    const seed = Math.floor(n * 1e9);
    grove.grow(this.ground, { ...speciesTree(species, tx, tz, size, seed), stroke: STROKE, fill: FILL }, rng(seed));
  }

  /** A rock on tile (x, y), into `b`: a stone or two, sunk into the ground. */
  private stone(b: MeshBuilder, x: number, y: number) {
    const rand = rng(Math.floor(hash(x + 5, y - 5) * 1e9)), cx = (x + 0.5) * TILE, cz = (y + 0.5) * TILE;
    addStone(b, this.ground, cx, cz, 1.1 + rand() * 0.4, 0.3, rand);
    if (rand() < 0.6) addStone(b, this.ground, cx + (rand() - 0.5) * 2.2, cz + (rand() - 0.5) * 2.2, 0.5 + rand() * 0.3, 0.3, rand);
  }

  // ---- What the game plants: fields' crops and saplings ----

  private syncFields(s: GameState) {
    const seen = new Set<number>();
    for (const b of s.buildings) {
      // An open field's crop; a greenhouse's grows unseen under its glass, which is opaque in the game (MODELS.md).
      if (b.type !== 'field') continue;
      seen.add(b.id);
      const stage = stageOf(b), y = standY(this.lie, s.map, 3, b.x, b.y) * RISE * TILE + thingHeight('field');
      const key = `${b.crop} ${stage} ${b.x} ${b.y} ${y.toFixed(3)}`, was = this.fields.get(b.id);
      if (was?.key === key) continue;
      if (was) this.drop(was.meshes);
      const patch = new CropPatch();
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
        // The field's tiles join into one crop: each carries on to its neighbours inside the field.
        const joins = (j > 0 ? 1 : 0) | (i < 2 ? 2 : 0) | (j < 2 ? 4 : 0) | (i > 0 ? 8 : 0);
        patch.add({ x: (b.x + i + 0.5) * TILE, y, z: (b.y + j + 0.5) * TILE, crop: b.crop, stage, joins, side: TILE });
      }
      this.fields.set(b.id, { meshes: patch.addTo(this.r), key });
    }
    for (const [id, was] of this.fields) if (!seen.has(id)) { this.drop(was.meshes); this.fields.delete(id); }
  }

  /** Saplings, as young trees of the species that will grow there, a little bigger each quarter of their growing. */
  private syncSaplings(s: GameState) {
    const seen = new Set<number>();
    const wet = (x: number, y: number) => wetAt((wx, wy) => inMap(s, wx, wy) && terrainAt(s, wx, wy) === TERRAIN.water, x, y);
    for (const b of s.buildings) {
      if (b.type !== 'sapling') continue;
      seen.add(b.id);
      const step = Math.min(3, Math.floor((b.age / SAPLING_SECONDS) * 4)), ground = this.lie.y(b.x + 0.5, b.y + 0.5);
      const key = `${b.x} ${b.y} ${step} ${ground.toFixed(3)}`, was = this.saplings.get(b.id);
      if (was?.key === key) continue;
      if (was) this.drop(was.meshes);
      const grove = new Grove(this.dress), species = treeAt(b.x, b.y, baseLevel(s.map, b.x, b.y), wet(b.x, b.y)).species;
      this.tree(grove, species, b.x, b.y, treeSize(hash(b.x, b.y)) * (0.25 + 0.15 * step));
      this.saplings.set(b.id, { meshes: grove.addTo(this.r), key });
    }
    for (const [id, was] of this.saplings) if (!seen.has(id)) { this.drop(was.meshes); this.saplings.delete(id); }
  }

  private drop(meshes: THREE.Mesh[]) {
    for (const m of meshes) { this.r.remove(m); m.geometry.dispose(); }
  }
}
