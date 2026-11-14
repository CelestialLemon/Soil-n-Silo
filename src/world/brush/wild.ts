import * as THREE from 'three';
import { MeshBuilder, PLAIN, srgb, type BrushRenderer } from '../../../brush3d/src/index.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { layoutOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import { RISE, TILE } from './scale.ts';

// The trees and rocks, plainly (#201's first light): a tree a grey spire and a rock a low block on each tile the land has
// them, on the map and in the country round it, so they show rather than silently missing. The game's trees in paint
// replace them (#213), and a world that changes without a stutter (#204) the map's mesh made anew when one is cleared.

const DARK = srgb(0x77736c);
/** A tree's stand-in: a six-sided spire, 5 m tall. */
const SPIRE = new THREE.ConeGeometry(1.4, 5, 6).translate(0, 2.5, 0);
/** A rock's stand-in: a low block. */
const ROCK = new THREE.BoxGeometry(2.2, 0.9, 1.8).translate(0, 0.45, 0);

export class Wild {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  /** The map's trees and rocks (cleared as the game builds), apart from the country's, which never change. */
  private map: THREE.Mesh | null = null;
  private layout = -1;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState) {
    this.r = r; this.lie = lie;
    // The country's, beyond the map: one mesh made once, cut into tiles so only those in view are drawn.
    const m = s.map, M = land.margin, mb = new MeshBuilder('ink');
    for (let ly = 0; ly < land.height; ly++) for (let lx = 0; lx < land.width; lx++) {
      const x = lx - M, y = ly - M;
      if (x >= 0 && y >= 0 && x < m.width && y < m.height) continue;
      this.add(mb, land.terrain[ly * land.width + lx], x, y);
    }
    if (mb.vertexCount) r.add(mb.build(), 'ink', { tile: 64 });
  }

  /** Follows the game: trees cleared and rocks moved on the map. */
  sync(s: GameState) {
    const v = layoutOf(s);
    if (v === this.layout) return;
    this.layout = v;
    if (this.map) { this.r.remove(this.map); this.map.geometry.dispose(); }
    const m = s.map, mb = new MeshBuilder('ink');
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) this.add(mb, m.terrain[y * m.width + x], x, y);
    this.map = mb.vertexCount ? this.r.add(mb.build(), 'ink') : null;
  }

  /** A tree's or a rock's stand-in on tile (x, y), into `mb`; nothing for other ground. */
  private add(mb: MeshBuilder, t: number, x: number, y: number) {
    if (t !== TERRAIN.tree && t !== TERRAIN.rock) return;
    const at = new THREE.Matrix4().makeTranslation((x + 0.5) * TILE, this.lie.y(x + 0.5, y + 0.5) * RISE * TILE, (y + 0.5) * TILE);
    mb.addGeometry(t === TERRAIN.rock ? ROCK : SPIRE, at, DARK, PLAIN);
  }
}
