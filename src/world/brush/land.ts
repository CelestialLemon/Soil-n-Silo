import type { BrushRenderer, LandRect } from '../../../brush3d/src/index.ts';
import type { Land } from '../../game/map.ts';
import { layoutOf, reliefOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import { landMapOf, patchOf, tilesOf, type Scale, type Tiles } from './landMap.ts';
import { LEVEL, TILE } from './scale.ts';

// The land, painted by brush3d from the game's map (#202): its levels, cliffs and banks, the river's and the ponds' beds, and
// the country round the map with the apron of distant woods past it (`r.setLand`, brush3d/docs/LAND.md). Earthworks,
// cleared trees and moved rocks go to `r.updateLand` as the tiles they changed, and brush3d paints only the ground round
// them again. The water over the beds is #207's (water.ts), `WATER_DOWN` under the tiles' level (landMap.ts).
//
// The game's `Lie` (ground.ts) is the same smooth fit of the same tiles, so what the other pieces stand on it (things.ts,
// wild.ts, the tile cursor) sits on the land as drawn, but in the water's beds (the Lie has them at their level).

const SCALE: Scale = { tile: TILE, level: LEVEL };

export class BrushLand {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly land: Land;
  /** The tiles as last sent. */
  private sent: Tiles;
  /** The map's tiles, among the land's: all that can change. */
  private readonly map: LandRect;
  private relief: number;
  private layout: number;

  constructor(r: BrushRenderer, s: GameState, land: Land, lie: Lie) {
    this.r = r; this.land = land; this.lie = lie;
    const map = landMapOf(s, land, SCALE);
    this.sent = { corners: map.corners, worked: map.worked, cover: map.cover, ground: map.ground }; this.map = map.map;
    r.setLand(map);
    this.relief = reliefOf(s); this.layout = layoutOf(s);
  }

  /** The land's height (m) at a point (m), as drawn. */
  heightAt(x: number, z: number) { return this.r.landAt(x, z); }

  /** Follows the game: earthworks, worked ground, a building's pad, trees cleared and rocks moved, as the tiles they changed. */
  sync(s: GameState) {
    const relief = reliefOf(s), layout = layoutOf(s);
    if (relief === this.relief && layout === this.layout) return;
    this.lie.update();
    this.relief = relief; this.layout = layout;
    const now = tilesOf(s, this.land, SCALE, this.sent), change = patchOf(this.sent, now, this.land.width, this.map);
    this.sent = now;
    if (change) this.r.updateLand(change.rect, change.patch);
  }
}
