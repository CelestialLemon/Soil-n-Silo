import * as THREE from 'three';
import { C, groundOf, MeshBuilder, noise2, smooth, type BrushRenderer, type Paint } from '../../../brush3d/src/index.ts';
import type { Land } from '../../game/map.ts';
import { TERRAIN } from '../../game/map.ts';
import { reliefOf, type GameState } from '../../game/state.ts';
import { HALO, type Lie } from '../ground.ts';
import { RISE, TILE } from './scale.ts';

// The land, plainly (#201's first light): the ground as the game fits it (ground.ts's Lie, the smooth reading of the rules'
// levels that the pixel world draws too), in metres, painted one meadow green with the water's tiles flat slate and the
// rocks' grey, over the map and the country round it. No cliffs faces, banks, river, grass, tracks or paint by ground kind
// yet: #202 replaces all of this with the renderer's own land from the map (`r.setLand`, `r.updateLand`), and drops it.

/** The paint of the plain ground: some colour drift, two strokes a metre. */
const PAINT: Paint = [0.35, 2, 0, 0];
const WATER = C.water.clone(), ROCK = C.stone.clone();
/** How finely the ground is cut (m): finely over the map and its halo, coarser in the country beyond. */
const FINE = 1, NEAR = 2, FAR = 4, NEAR_BAND = 16;
/** The size of the pieces the ground is cut into, each drawn only when it's in view (m). */
const PIECE = 32;

export class PlainLand {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly land: Land;
  private mesh: THREE.Mesh | null = null;
  private relief = -1;

  constructor(r: BrushRenderer, land: Land, lie: Lie) {
    this.r = r; this.land = land; this.lie = lie;
  }

  /** The ground's height (m) at a point (m), as drawn. */
  heightAt(x: number, z: number) { return this.lie.y(x / TILE, z / TILE) * RISE * TILE; }

  /** Follows earthworks: fits the ground again and draws it anew when the rules' relief has changed (a hitch: #202 patches it). */
  sync(s: GameState) {
    const v = reliefOf(s);
    if (v === this.relief) return;
    if (this.mesh) { this.lie.update(); this.r.remove(this.mesh); this.mesh.geometry.dispose(); }
    this.relief = v;
    // The square the land covers: brush3d lays its cloud map (the clouds' shadows, their mirror in the water) over it.
    const m = s.map, side = (Math.max(m.width, m.height) + 2 * this.land.margin) * TILE;
    const fields = { x: (m.width / 2) * TILE, z: (m.height / 2) * TILE, side, turn: 0 };
    this.mesh = this.r.add(this.build(s), 'ground', { under: true, tile: PIECE, fields });
  }

  private build(s: GameState) {
    const { land } = this, m = s.map, M = land.margin;
    const axis = (tiles: number) => spacing(-M * TILE, (tiles + M) * TILE, -(HALO + 1) * TILE, (tiles + HALO + 1) * TILE);
    const xs = axis(m.width), zs = axis(m.height), nx = xs.length;
    const ground = groundOf((x, z) => this.heightAt(x, z)), b = new MeshBuilder('paint'), c = new THREE.Color();
    for (const z of zs) for (const x of xs) {
      // The tile the point is on, as the land has it (the map's own terrain where it's on the map: trees cleared, rocks moved).
      const tx = Math.floor(x / TILE), tz = Math.floor(z / TILE), onMap = tx >= 0 && tz >= 0 && tx < m.width && tz < m.height;
      const lx = Math.min(land.width - 1, Math.max(0, tx + M)), lz = Math.min(land.height - 1, Math.max(0, tz + M));
      const t = onMap ? m.terrain[tz * m.width + tx] : land.terrain[lz * land.width + lx];
      const k = noise2(x * 0.02 + 7, z * 0.02 - 3) * 0.5 + 0.5;
      c.copy(C.meadow).lerp(C.lime, smooth(0.55, 0.9, k) * 0.4).lerp(C.emerald, smooth(0.6, 0.95, 1 - k) * 0.4);
      if (t === TERRAIN.water) c.copy(WATER);
      else if (t === TERRAIN.rock) c.lerp(ROCK, 0.6);
      b.vertex({ x, y: this.heightAt(x, z), z }, ground.normal(x, z), c, PAINT);
    }
    for (let j = 0; j + 1 < zs.length; j++) for (let i = 0; i + 1 < nx; i++) { const a = j * nx + i; b.quad(a, a + nx, a + nx + 1, a + 1); }
    return b.build();
  }
}

/** Points from `lo` to `hi` (m): FINE apart between `fineLo` and `fineHi`, NEAR just outside, FAR beyond. */
function spacing(lo: number, hi: number, fineLo: number, fineHi: number) {
  const out: number[] = [];
  for (let x = lo; x < hi;) {
    out.push(x);
    const off = Math.max(fineLo - x, x - fineHi, 0);
    x += off === 0 ? FINE : off < NEAR_BAND ? NEAR : FAR;
  }
  out.push(hi);
  return out;
}
