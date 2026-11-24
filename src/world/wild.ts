// What grows and stands wild, and the trees and hedges the player plants: the valley's crags, its wild trees (in 16 m
// groves, dressed for the season), the far woods round it (cheap canopies for woods too far off to tell one tree's limbs
// from another's), each planted tree and each hedge as its own tagged meshes (so a pick names it, and one comes and goes
// without the rest being built again). What stands on land that brush3d swaps in again is grown again on it, in that frame.
import type * as THREE from 'three';
import {
  addCanopy, addCrag, type BrushRenderer, C, DRAG, dressFor, groundOf, Grove, growSpecies, type LandArea, MeshBuilder, noise2,
  type Obstacle, rng, type Species, speciesTree, type Tree as KitTree, treeWind,
} from '../../brush3d/src/index.ts';
import { type Change, COVER, type GameState, type Hedge, hash3, isWet, polylineDistance, type Tree, VALLEY_HALF } from '../game/index.ts';
import { addMesh, dropAll, tagOf } from './util.ts';

/** The wild groves' blocks (m), and the far woods' reach and spacing (m). */
const GROVE = 16, FAR_REACH = 116, FAR_STEP = 3.6;
/** Where the far woods start: just past the valley's own trees. */
const FAR_FROM = VALLEY_HALF + 3;
/** A tree's strokes against the kit's: a little broader for the game's camera, further off than the demo's. */
const WILD_STROKE = 1.2;

/** The kit's tree for one of the game's. */
function kitTree(t: Tree, wild: boolean): KitTree {
  const k = speciesTree(t.species, t.x, t.z, t.scale, t.seed);
  if (!wild && t.scale < 0.8) k.form = 'sapling';
  else if (wild && !k.form) k.form = 'wood';
  if (wild) k.stroke = WILD_STROKE;
  return k;
}

interface Area { x0: number; z0: number; x1: number; z1: number }
const touches = (a: Area, x: number, z: number, m: number) => x > a.x0 - m && x < a.x1 + m && z > a.z0 - m && z < a.z1 + m;

export class Wild {
  private readonly r: BrushRenderer;
  private state: GameState;
  private crags: THREE.Mesh[] = [];
  private far: THREE.Mesh[] = [];
  /** The wild trees by grove (keyed by the grove's block), each grove one set of meshes. */
  private groves = new Map<string, { trees: Tree[]; meshes: THREE.Mesh[] }>();
  private planted = new Map<number, { tree: Tree; meshes: THREE.Mesh[] }>();
  private hedges = new Map<number, { hedge: Hedge; meshes: THREE.Mesh[] }>();
  private readonly stopLand: () => void;
  /** Whether what blocks the wind changed since the world last asked. */
  windChanged = false;

  constructor(r: BrushRenderer, state: GameState) {
    this.r = r; this.state = state;
    this.stopLand = r.onLandChange((area) => this.landSwapped(area));
    this.buildAll();
  }

  reset(state: GameState) {
    this.clear();
    this.state = state;
    this.buildAll();
  }

  /** The trees and hedges an edit added, moved or took away. */
  sync(change: Change) {
    const s = this.state;
    for (const id of change.trees) {
      const old = this.planted.get(id);
      if (old) { dropAll(this.r, old.meshes); this.planted.delete(id); }
      const t = s.plantedTrees.find((o) => o.id === id);
      if (t) this.planted.set(id, { tree: t, meshes: this.growPlanted(t) });
      this.windChanged = true;
    }
    for (const id of change.hedges) {
      const old = this.hedges.get(id);
      if (old) { dropAll(this.r, old.meshes); this.hedges.delete(id); }
      const h = s.hedges.find((o) => o.id === id);
      if (h) this.hedges.set(id, { hedge: h, meshes: this.growHedge(h) });
      this.windChanged = true;
    }
  }

  /** What slows the wind: the trees' crowns and the hedges. */
  obstacles(): Obstacle[] {
    const out: Obstacle[] = [];
    for (const t of [...this.state.wildTrees, ...this.state.plantedTrees]) out.push(treeWind(kitTree(t, !t.planted)));
    for (const h of this.state.hedges) {
      const p = h.path;
      for (let i = 0; i + 1 < p.length; i += 4) {
        const b = p[Math.min(p.length - 1, i + 4)];
        out.push({ strip: { ax: p[i].x, az: p[i].z, bx: b.x, bz: b.z, width: 1.6 }, drag: DRAG.hedge });
      }
    }
    return out;
  }

  /** Where a hedge, a planted tree or a wild one is near a point (for a pick): the nearest within reach. */
  nearest(x: number, z: number): { kind: 'tree' | 'hedge'; id: number; d: number } | null {
    let best: { kind: 'tree' | 'hedge'; id: number; d: number } | null = null;
    for (const t of this.state.plantedTrees) {
      const d = Math.hypot(t.x - x, t.z - z);
      if (d < 2.5 * Math.max(0.6, t.scale) && (!best || d < best.d)) best = { kind: 'tree', id: t.id, d };
    }
    for (const h of this.state.hedges) {
      const d = h.path.length > 1 ? polylineDistance(x, z, h.path).d : Infinity;
      if (d < 1.6 && (!best || d < best.d)) best = { kind: 'hedge', id: h.id, d };
    }
    return best;
  }

  /** The meshes of a planted tree or a hedge, for its highlight. */
  meshesOf(kind: 'tree' | 'hedge', id: number): THREE.Mesh[] {
    return (kind === 'tree' ? this.planted.get(id)?.meshes : this.hedges.get(id)?.meshes) ?? [];
  }

  dispose() {
    this.stopLand();
    this.clear();
  }

  // ---- Building ----

  private clear() {
    dropAll(this.r, this.crags); dropAll(this.r, this.far);
    for (const g of this.groves.values()) dropAll(this.r, g.meshes);
    for (const p of this.planted.values()) dropAll(this.r, p.meshes);
    for (const h of this.hedges.values()) dropAll(this.r, h.meshes);
    this.groves.clear(); this.planted.clear(); this.hedges.clear();
  }

  private buildAll() {
    const s = this.state;
    this.crags = this.buildCrags();
    this.far = this.buildFar();
    for (const t of s.wildTrees) {
      const key = `${Math.floor(t.x / GROVE)},${Math.floor(t.z / GROVE)}`;
      const g = this.groves.get(key) ?? { trees: [], meshes: [] };
      g.trees.push(t);
      this.groves.set(key, g);
    }
    for (const g of this.groves.values()) g.meshes = this.growGrove(g.trees);
    for (const t of s.plantedTrees) this.planted.set(t.id, { tree: t, meshes: this.growPlanted(t) });
    for (const h of s.hedges) this.hedges.set(h.id, { hedge: h, meshes: this.growHedge(h) });
    this.windChanged = true;
  }

  /** The land swapped in over `area`: what stands there is grown again on it. */
  private landSwapped(area: LandArea) {
    if (this.crags.length && this.state.crags.some((c) => touches(area, c.x, c.z, c.radius + 1))) {
      dropAll(this.r, this.crags);
      this.crags = this.buildCrags();
    }
    for (const g of this.groves.values()) {
      if (!g.trees.some((t) => touches(area, t.x, t.z, 1))) continue;
      dropAll(this.r, g.meshes);
      g.meshes = this.growGrove(g.trees);
    }
    for (const p of this.planted.values()) {
      if (!touches(area, p.tree.x, p.tree.z, 1)) continue;
      dropAll(this.r, p.meshes);
      p.meshes = this.growPlanted(p.tree);
    }
    for (const h of this.hedges.values()) {
      if (!h.hedge.path.some((q) => touches(area, q.x, q.z, 1.5))) continue;
      dropAll(this.r, h.meshes);
      h.meshes = this.growHedge(h.hedge);
    }
  }

  private ground() { return groundOf((x, z) => this.r.landAt(x, z)); }

  /** The season's dress for trees: leaves don't fall where there's water. */
  private grove() {
    const g = this.state.grid;
    return new Grove(dressFor(this.state.season, (x, z) => {
      const ix = Math.floor((x - g.x0) / g.cell), iz = Math.floor((z - g.z0) / g.cell);
      return ix < 0 || iz < 0 || ix >= g.nx || iz >= g.nz || !isWet(g.waterLevel[iz * g.nx + ix]);
    }));
  }

  /** Adds a grove's meshes, freeing our copies of what brush3d cuts into tiles. */
  private addGrove(grove: Grove, tag?: string): THREE.Mesh[] {
    const r = this.r;
    return grove.addTo({ add: (geometry, kind, options) => addMesh(r, geometry, kind, options) }, { cull: true, ...(tag === undefined ? {} : { tag }) });
  }

  private buildCrags(): THREE.Mesh[] {
    if (!this.state.crags.length) return [];
    const b = new MeshBuilder('paint'), ground = this.ground();
    for (const c of this.state.crags) {
      const rand = rng(c.seed >>> 0);
      const stone = C.stone.clone().offsetHSL((rand() - 0.5) * 0.02, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.06);
      addCrag(b, ground, c.x, c.z, { rx: c.radius, ry: c.height, rz: c.radius * (0.65 + rand() * 0.25), yaw: rand() * Math.PI * 2, pitch: (rand() - 0.5) * 0.2, roll: (rand() - 0.5) * 0.2, moss: 0.45 + rand() * 0.3, color: stone }, rand);
      // A shoulder or two of talus at its foot.
      const shoulders = 1 + Math.floor(rand() * 3);
      for (let k = 0; k < shoulders; k++) {
        const a = rand() * Math.PI * 2, d = c.radius * (0.9 + rand() * 0.5), s = c.radius * (0.25 + rand() * 0.2);
        addCrag(b, ground, c.x + Math.cos(a) * d, c.z + Math.sin(a) * d, { rx: s, ry: s * 0.6, rz: s * 0.8, detail: 1, sink: 0.4, color: stone }, rand);
      }
    }
    return b.vertexCount ? [addMesh(this.r, b.build(), 'paint', { seasonal: true, tile: 32 })] : [];
  }

  /** The far woods: canopies over the woods round the valley and out into the hills past the grid. */
  private buildFar(): THREE.Mesh[] {
    const s = this.state, g = s.grid, ground = this.ground(), crowns = new MeshBuilder('foliage');
    const species: Species[] = ['oak', 'pine', 'birch', 'oak', 'poplar', 'pine'];
    const right = g.x0 + g.nx * g.cell, bottom = g.z0 + g.nz * g.cell;
    for (let z = -FAR_REACH; z <= FAR_REACH; z += FAR_STEP) for (let x = -FAR_REACH; x <= FAR_REACH; x += FAR_STEP) {
      const rand = rng(hash3(s.seed ^ 0x5f0d, Math.round(x * 10), Math.round(z * 10)));
      const px = x + (rand() - 0.5) * FAR_STEP * 0.9, pz = z + (rand() - 0.5) * FAR_STEP * 0.9;
      if (Math.max(Math.abs(px), Math.abs(pz)) < FAR_FROM) continue;
      const inside = px > g.x0 && px < right && pz > g.z0 && pz < bottom;
      if (inside) {
        const c = Math.floor((pz - g.z0) / g.cell) * g.nx + Math.floor((px - g.x0) / g.cell);
        if (g.cover[c] !== COVER.woods) continue;
      } else if (rand() < 0.25) continue;
      const n = 0.5 + 0.5 * noise2(px * 0.05 + 11, pz * 0.05 - 4);
      const kind = species[Math.floor((n * 0.999 + rand() * 0.35) * species.length) % species.length] ?? 'oak';
      addCanopy(crowns, px, ground.height(px, pz) - 0.3, pz, 3.2 + 1.4 * n, kind, s.season, rand);
    }
    return crowns.vertexCount ? [addMesh(this.r, crowns.build(), 'foliage', { tile: 32, castShadow: true })] : [];
  }

  private growGrove(trees: Tree[]): THREE.Mesh[] {
    const grove = this.grove(), ground = this.ground();
    for (const t of trees) growSpecies(grove, ground, t.species, kitTree(t, true), rng(t.seed >>> 0));
    return this.addGrove(grove);
  }

  private growPlanted(t: Tree): THREE.Mesh[] {
    const grove = this.grove();
    growSpecies(grove, this.ground(), t.species, kitTree(t, false), rng(t.seed >>> 0));
    return this.addGrove(grove, tagOf('tree', t.id));
  }

  /** A hedge: dense hedge-form bushes every metre or so along its path, now and then a small broadleaf among them. */
  private growHedge(h: Hedge): THREE.Mesh[] {
    const grove = this.grove(), ground = this.ground(), rand = rng(hash3(this.state.seed, h.id, 77)), p = h.path;
    if (p.length < 2) return [];
    let next = 0, walked = 0;
    for (let i = 0; i + 1 < p.length; i++) {
      const a = p[i], b = p[i + 1], len = Math.hypot(b.x - a.x, b.z - a.z);
      while (next <= walked + len) {
        const t = len > 0 ? (next - walked) / len : 0, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
        const jx = (rand() - 0.5) * 0.3, jz = (rand() - 0.5) * 0.3;
        if (rand() < 0.08) {
          grove.grow(ground, { kind: 'broadleaf', x: x + jx, z: z + jz, seed: Math.floor(rand() * 1e6), scale: 0.75 + rand() * 0.25, form: 'hedge' }, rand);
        } else {
          const leaf = C.emerald.clone().lerp(C.deepLeaf, rand() * 0.6).lerp(C.leaf, rand() * 0.3);
          grove.grow(ground, { kind: 'bush', x: x + jx, z: z + jz, seed: 0, scale: 1.15 + rand() * 0.45, leaf, form: 'hedge' }, rand);
        }
        next += 1.15 + rand() * 0.5;
      }
      walked += len;
    }
    return this.addGrove(grove, tagOf('hedge', h.id));
  }
}
