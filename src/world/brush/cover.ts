import type { BrushRenderer, GroundMap } from '../../../brush3d/src/index.ts';
import { DAY_SECONDS } from '../../game/data.ts';
import { depthAt, frostTiles, rimeAt } from '../../game/frost.ts';
import { GROUND } from '../../game/ground.ts';
import { groundLooksAt } from '../../game/looks.ts';
import type { Land } from '../../game/map.ts';
import { muddyAt } from '../../game/mud.ts';
import { fbm2 } from '../../game/rng.ts';
import { accessTiles } from '../../game/roads.ts';
import { panelSnow, lyingSnow } from '../../game/snow.ts';
import { layoutOf, reliefOf, sizeOf, type GameState } from '../../game/state.ts';
import { warmthIn } from '../../game/warmth.ts';
import { soaked } from '../../game/wet.ts';
import { LandGrid, Sender, soften } from './grid.ts';

// What lies on the land, as brush3d draws it (#207): one map over the whole land, a cell a tile, sent with `setGround`
// whenever it changes (brush3d/docs/GROUND.md). From what the game has, and the looks it works out (looks.ts):
// - the snow lying in winter (snow.ts's `lyingSnow`): the valley's depth, deeper in drifts and thinner between them; the
//   solar panels hold the snow the rules leave on them (`panelSnow`: they make less while it lies) after the rest has gone.
//   brush3d keeps it off what's sheltered (under a roof, less under a tree), and fills the hollows first itself;
// - frost: an ordinary night's (looks.ts) over the valley, and a late frost's rime (frost.ts's `rimeAt`) on the tiles the
//   rules freeze: the frost hollows, and the slopes too in a severe one, softened over a tile at its edge so it doesn't step
//   along the tiles' sides. brush3d whitens the low ground and the grass tips first, and melts it first where the
//   morning's sun has shone, as the game lowers it;
// - how wet the land is (looks.ts), tile by tile: sand dries first and clay last, rises before hollows; and clay stays damp
//   while the rules have it holding the rain (wet.ts's `soaked`);
// - mud: on clay while the rules have it muddy (mud.ts's `muddyAt`), and on the bare earth (the track, the depot's yard,
//   where trucks load, the fields' beds) as it wets; none while the ground is frozen. brush3d paints it on bare earth only.
// Nothing here changes a rule: it reads the game's state and draws it.

/** How hard the frost is at a late frost's height (brush3d's frost, 0..1): the demo's late frost at dawn. */
const RIME = 0.8;
/** How hard an ordinary night's frost lies at its hardest: most of the open ground white till the sun reaches it (GROUND.md). */
const NIGHT_RIME = 0.55;
/** How muddy muddy clay is (brush3d's mud, 0..1). */
const CLAY_MUD = 0.8;
/** How muddy the bare earth gets when soaked: a little less than clay. */
const BARE_MUD = 0.65;
/** How deep the snow lies in a drift and between drifts, against the valley's depth; and how wide a drift is (tiles). */
const DRIFT = { deep: 1.2, thin: 0.8, size: 7 };
/** How deep the panels' snow lies at its deepest: covering them (GROUND.md: 0.5 covers the grass). */
const PANEL_SNOW = 0.6;
/** How much slower each ground dries than loam (the power the land's wetness is raised to), and how damp clay stays while it holds the rain. */
const DRIES = { [GROUND.loam]: 1, [GROUND.silt]: 0.85, [GROUND.clay]: 0.6, [GROUND.sand]: 1.8, [GROUND.stony]: 1.3 } as Record<number, number>;
const CLAY_DAMP = 0.35;
/** How much faster a rise dries, and slower a hollow (by its depth below the ground round it, levels, out to this far). */
const LIE = { by: 0.35, reach: 0.5 };
/** Values are sent in steps this fine, so the map changes a few times as the snow lies or the rime builds, not every frame. */
const STEPS = 64;
/** What the map is made from is looked at again when the game's clock has moved this far (game seconds: a game minute). */
const LOOK = DAY_SECONDS / 24 / 60;

interface Now { snow: number; hollows: number; slopes: number; muddy: boolean; panel: number; frost: number; wet: number; damp: boolean; frozen: boolean }
const NONE: Now = { snow: 0, hollows: 0, slopes: 0, muddy: false, panel: 0, frost: 0, wet: 0, damp: false, frozen: false };

export class BrushCover {
  private readonly r: BrushRenderer;
  private readonly land: Land;
  private readonly grid: LandGrid;
  private send = new Sender();
  /** How deep the snow drifts on each land tile, against the valley's depth. */
  private readonly drift: Float32Array;
  private at = NaN;
  private now = NONE;

  constructor(r: BrushRenderer, land: Land) {
    this.r = r; this.land = land; this.grid = new LandGrid(land);
    this.drift = new Float32Array(land.width * land.height);
    for (let y = 0; y < land.height; y++) for (let x = 0; x < land.width; x++) {
      this.drift[y * land.width + x] = DRIFT.thin + (DRIFT.deep - DRIFT.thin) * fbm2(x / DRIFT.size, y / DRIFT.size, land.seed + 331);
    }
  }

  /** Sends it all again at the next sync, at once (something else sent the renderer a ground: the profile, #210). */
  resend() { this.send = new Sender(); }

  /** Sends what lies on the land as the game has it now, if it changed. */
  sync(s: GameState) {
    if (!(Math.abs(s.time - this.at) < LOOK)) {
      const sc = s.scenario, rime = rimeAt(sc, s.time), looks = groundLooksAt(sc, s.time), q = (v: number) => Math.round(v * STEPS) / STEPS;
      this.at = s.time;
      this.now = {
        snow: q(lyingSnow(sc, s.time)), hollows: q(rime?.hollows ?? 0), slopes: q(rime?.slopes ?? 0), muddy: muddyAt(sc, s.time),
        panel: q(panelSnow(sc, s.time)?.intensity ?? 0), frost: q(looks.frost), wet: q(looks.wet), damp: soaked(sc, s.time), frozen: warmthIn(sc, s.time) < 0,
      };
    }
    const n = this.now, wet = n.wet > 0 || n.damp || n.muddy, bare = n.panel > 0 || (wet && !n.frozen);
    // The ground's levels shape the rime and the drying; the buildings, the panels' snow and the bare earth.
    const key = `${n.snow}:${n.hollows}:${n.slopes}:${n.muddy}:${n.panel}:${n.frost}:${n.wet}:${n.damp}:${n.frozen}:${n.hollows || n.slopes || wet ? reliefOf(s) : 0}:${bare ? layoutOf(s) : 0}`;
    if (!this.send.due(key)) return;
    this.r.setGround(n.snow || n.hollows || n.frost || n.panel || wet ? this.build(s) : null, this.send.first ? 0 : undefined);
  }

  private build(s: GameState): GroundMap {
    const { land, grid } = this, n = land.width * land.height, m = s.map, now = this.now, out: GroundMap = { ...grid.shape };
    const mapOf = (i: number) => grid.ofMap(i % m.width, Math.floor(i / m.width));
    if (now.snow > 0 || now.panel > 0) {
      const snow = new Float32Array(n);
      if (now.snow > 0) for (let i = 0; i < n; i++) snow[i] = Math.min(1, now.snow * this.drift[i]);
      if (now.panel > 0) for (const b of s.buildings) if (b.type === 'solar') this.footprint(s, b, (k) => { snow[k] = Math.max(snow[k], now.panel * PANEL_SNOW); });
      out.snow = snow;
    }
    if (now.hollows > 0 || now.frost > 0) {
      const frost = new Float32Array(n);
      if (now.slopes > 0) for (const i of frostTiles(s, 'severe')) frost[mapOf(i)] = now.slopes * RIME;
      if (now.hollows > 0) for (const i of frostTiles(s, 'ordinary')) frost[mapOf(i)] = now.hollows * RIME;
      const night = now.frost * NIGHT_RIME;
      for (let i = 0; i < n; i++) frost[i] = Math.max(frost[i], night);
      out.frost = now.hollows > 0 ? soften(frost, land.width, land.height) : frost;
    }
    if (!(now.wet > 0 || now.damp || now.muddy)) return out;
    // Each tile's ground (the map's own on the map, the country's beyond it), and on the map how it lies.
    const ground = Uint8Array.from(land.ground), dries = new Float32Array(n);
    for (let i = 0; i < m.width * m.height; i++) ground[mapOf(i)] = m.ground[i];
    for (let i = 0; i < n; i++) dries[i] = DRIES[ground[i]] ?? 1;
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
      const d = depthAt(s, x, y);
      if (Number.isFinite(d)) dries[grid.ofMap(x, y)] *= 1 - LIE.by * Math.max(-1, Math.min(1, d / LIE.reach));
    }
    const wet = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      wet[i] = now.wet > 0 ? now.wet ** dries[i] : 0;
      if (now.damp && ground[i] === GROUND.clay) wet[i] = Math.max(wet[i], CLAY_DAMP);
    }
    if (wet.some((v) => v > 0)) out.wet = wet;
    if (now.frozen) return out;
    // Mud: muddy clay, the wetter the muddier; and the bare earth as it wets, drying out after the ground round it.
    const mud = new Float32Array(n), soft = (v: number) => { const u = Math.min(1, v / 0.5); return u * u * (3 - 2 * u); };
    if (now.muddy) for (let i = 0; i < n; i++) if (ground[i] === GROUND.clay) mud[i] = CLAY_MUD * (0.6 + 0.4 * soft(wet[i]));
    const bare = (k: number) => { mud[k] = Math.max(mud[k], BARE_MUD * soft(wet[k] ** 0.7)); };
    for (let i = 0; i < n; i++) if (land.track[i]) bare(i);
    for (const b of s.buildings) {
      if (b.type === 'field' || b.type === 'depot') this.footprint(s, b, bare);
      if (b.type === 'depot' || b.type === 'field' || b.type === 'silo') for (const i of accessTiles(s, b)) bare(mapOf(i));
    }
    if (mud.some((v) => v > 0)) out.mud = mud;
    return out;
  }

  /** Calls `fn` with the cell of each tile a building stands on. */
  private footprint(s: GameState, b: GameState['buildings'][number], fn: (cell: number) => void) {
    const size = sizeOf(b);
    for (let y = b.y; y < b.y + size; y++) for (let x = b.x; x < b.x + size; x++) fn(this.grid.ofMap(x, y));
  }
}
