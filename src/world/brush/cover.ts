import type { BrushRenderer, GroundMap } from '../../../brush3d/src/index.ts';
import { DAY_SECONDS } from '../../game/data.ts';
import { frostTiles, rimeAt } from '../../game/frost.ts';
import { GROUND } from '../../game/ground.ts';
import type { Land } from '../../game/map.ts';
import { muddyAt } from '../../game/mud.ts';
import { lyingSnow } from '../../game/snow.ts';
import { reliefOf, type GameState } from '../../game/state.ts';
import { LandGrid, Sender, soften } from './grid.ts';

// What lies on the land, as brush3d draws it (#207): one map over the whole land, a cell a tile, sent with `setGround`
// whenever it changes (brush3d/docs/GROUND.md). From what the game has:
// - the snow lying in winter (snow.ts's `lyingSnow`): one depth for the valley; brush3d keeps it off what's sheltered (under
//   a roof, less under a tree) and lays it on the roofs and the panels itself;
// - a late frost's rime (frost.ts's `rimeAt`) on the tiles the rules freeze: the frost hollows, and the slopes too in a
//   severe one, softened over a tile at its edge so it doesn't step along the tiles' sides; brush3d whitens the low ground
//   and the grass tips in it first, and melts it first where the morning's sun has shone, as the game lowers it;
// - mud on clay while the rules have clay muddy (mud.ts's `muddyAt`): brush3d paints it only on the bare earth there.
// Nothing here changes a rule: it reads the game's state and draws it.

/** How hard the frost is at a late frost's height (brush3d's frost, 0..1): the demo's late frost at dawn. */
const RIME = 0.8;
/** How muddy muddy clay is (brush3d's mud, 0..1). */
const CLAY_MUD = 0.8;
/** Values are sent in steps this fine, so the map changes a few times as the snow lies or the rime builds, not every frame. */
const STEPS = 64;
/** What the map is made from is looked at again when the game's clock has moved this far (game seconds: a game minute). */
const LOOK = DAY_SECONDS / 24 / 60;

export class BrushCover {
  private readonly r: BrushRenderer;
  private readonly land: Land;
  private readonly grid: LandGrid;
  private readonly send = new Sender();
  private at = NaN;
  private now = { snow: 0, hollows: 0, slopes: 0, muddy: false };

  constructor(r: BrushRenderer, land: Land) {
    this.r = r; this.land = land; this.grid = new LandGrid(land);
  }

  /** Sends what lies on the land as the game has it now, if it changed. */
  sync(s: GameState) {
    if (!(Math.abs(s.time - this.at) < LOOK)) {
      const sc = s.scenario, rime = rimeAt(sc, s.time), q = (v: number) => Math.round(v * STEPS) / STEPS;
      this.at = s.time;
      this.now = { snow: q(lyingSnow(sc, s.time)), hollows: q(rime?.hollows ?? 0), slopes: q(rime?.slopes ?? 0), muddy: muddyAt(sc, s.time) };
    }
    const { snow, hollows, slopes, muddy } = this.now;
    if (!this.send.due(`${snow}:${hollows}:${slopes}:${muddy}:${hollows || slopes ? reliefOf(s) : 0}`)) return;
    this.r.setGround(snow || hollows || muddy ? this.build(s) : null, this.send.first ? 0 : undefined);
  }

  private build(s: GameState): GroundMap {
    const { land, grid } = this, n = land.width * land.height, m = s.map, { snow, hollows, slopes, muddy } = this.now;
    const out: GroundMap = { ...grid.shape };
    if (snow > 0) out.snow = new Float32Array(n).fill(snow);
    if (hollows > 0) {
      const frost = new Float32Array(n);
      if (slopes > 0) for (const i of frostTiles(s, 'severe')) frost[grid.ofMap(i % m.width, Math.floor(i / m.width))] = slopes * RIME;
      for (const i of frostTiles(s, 'ordinary')) frost[grid.ofMap(i % m.width, Math.floor(i / m.width))] = hollows * RIME;
      out.frost = soften(frost, land.width, land.height);
    }
    if (muddy) {
      // Clay over the whole land: the map's own ground on the map, the country's beyond it.
      const mud = new Float32Array(n);
      for (let i = 0; i < n; i++) if (land.ground[i] === GROUND.clay) mud[i] = CLAY_MUD;
      for (let i = 0; i < m.width * m.height; i++) mud[grid.ofMap(i % m.width, Math.floor(i / m.width))] = m.ground[i] === GROUND.clay ? CLAY_MUD : 0;
      out.mud = mud;
    }
    return out;
  }
}
