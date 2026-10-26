import * as THREE from 'three';
import { FLAG, type PixelObject, type PixelRenderer } from 'pixel3d-renderer';
import { DAY_SECONDS } from '../game/data.ts';
import { TERRAIN, type Land } from '../game/map.ts';
import { lyingSnow } from '../game/snow.ts';
import { layoutOf, reliefOf, type GameState } from '../game/state.ts';
import { HALO, sheet, Tris, type Lie } from './ground.ts';

// Lying snow on the ground: a sheet of white over the grass (the map and the ring of country drawn with it), faded in as snow falls
// and out as it melts (`lyingSnow`). The cover is dithered (an opacity), so a light fall dusts the ground and a deep one buries it.
// It lies a hair over the grass and under a field's raised soil, so fields stay dark among the white. It is drawn only while
// there is snow, and drawn again when the ground's levels change. Roofs and panels are tinted by WorldView (`snow`).

/** The snow's white, a little blue; the most the sheet covers the ground (the grass still shows through); how far above the ground it lies (m). */
const WHITE = new THREE.Color(0xf2f6fc), MOST = 1.1, LIFT = 0.012;
/** How much of its cover is left while a tool overlay is over the ground (it would hide the overlay's tiles otherwise). */
const UNDER_OVERLAY = 0.35;
/** The snow's cover is worked out this often (game seconds); it changes over hours. */
const EVERY = DAY_SECONDS / 24 / 4;

export class SnowView {
  private readonly r: PixelRenderer;
  private readonly lie: Lie;
  private readonly land: Land;
  private drawn: { o: PixelObject; g: THREE.BufferGeometry } | null = null;
  private relief = -1;
  private layout = -1;
  private at = -Infinity;
  private game: GameState | null = null;
  private cover_ = 0;

  constructor(r: PixelRenderer, lie: Lie, land: Land) { this.r = r; this.lie = lie; this.land = land; }

  /** How much of the ground lies under snow now, 0–1. */
  cover(s: GameState): number {
    if (this.game !== s || Math.abs(s.time - this.at) >= EVERY) { this.game = s; this.at = s.time; this.cover_ = lyingSnow(s.scenario, s.time); }
    return this.cover_;
  }

  /** Shows the snow as it lies now (fainter while an overlay is shown), or none. */
  sync(s: GameState, overlay: boolean) {
    const cover = this.cover(s), opacity = cover < 0.03 ? 0 : Math.min(1, cover * MOST) * (overlay ? UNDER_OVERLAY : 1);
    if (opacity <= 0) { this.drop(); return; }
    const relief = reliefOf(s), layout = layoutOf(s);
    if (!this.drawn || this.relief !== relief || this.layout !== layout) {
      this.drop();
      const t = new Tris();
      t.flag = FLAG.DECOR;
      const { width, height } = s.map, { margin } = this.land;
      const sheltered = new Set<number>();
      for (const b of s.buildings) if (b.type === 'greenhouse') {
        for (let y = b.y; y < b.y + 3; y++) for (let x = b.x; x < b.x + 3; x++) sheltered.add(y * width + x);
      }
      for (let y = -HALO; y < height + HALO; y++) for (let x = -HALO; x < width + HALO; x++) {
        if (x >= 0 && y >= 0 && x < width && y < height && sheltered.has(y * width + x)) continue;
        if (this.land.terrain[(y + margin) * this.land.width + x + margin] === TERRAIN.water) continue;
        sheet(t, this.lie, x, y, [0, 0, 1, 1], LIFT, 0xf4f0e0);
      }
      const g = t.geometry(), o = this.r.addObject(g);
      o.setTransform(new THREE.Vector3(0, 0, 0));
      o.tint = WHITE; o.tintStrength = 1; o.castShadow = false;
      this.drawn = { o, g };
      this.relief = relief;
      this.layout = layout;
    }
    this.drawn.o.opacity = opacity;
  }

  private drop() {
    this.drawn?.o.remove();
    this.drawn?.g.dispose();
    this.drawn = null;
  }
}
