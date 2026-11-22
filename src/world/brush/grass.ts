import * as THREE from 'three';
import {
  addFlower, addReeds, addTuft, groundOf, MeshBuilder, noise2, rng, smooth, srgb, wheelRace,
  type BrushRenderer, type Ground, type LandArea, type ReedOptions,
} from '../../../brush3d/src/index.ts';
import type { Land } from '../../game/map.ts';
import { layoutOf, type GameState } from '../../game/state.ts';
import type { Lie } from '../ground.ts';
import {
  blockOf, boxesIn, FLOWER_PROFILE, FLOWER_SEASONS, flowersBloom, fringeFade, GRASS_FRINGE, GRASS_PROFILE, grassBlocks, grassLayout,
  inBuilding, layoutChanges, MAX_REED_REACH, REED_PROFILE, REED_SEASONS, REED_TOP, reedBand, reedShore, reedSpot,
  tileHabitat, tileSeed, wetDistance,
  type FlowerSeason, type FootprintBox, type GrassBlockRect, type GrassLayout, type ReedSeason, type TileHabitat,
} from './grassMask.ts';
import { TILE } from './scale.ts';

// The meadow across the valley floor: grass tufts (#256), painted blades swaying in the living wind, coloured from the
// land's own painted ground (`r.landColourAt`) so they blend into the ground paint and turn with the season (and shorten
// in winter so light snow lets frosted tips show while deep snow buries them cleanly); and wildflowers among them (#266),
// in soft drifts of the season's colours, gathered at the woods' skirts and the hills' edges, none in winter; and reeds
// along the water's edge (#267), in beds with open bank between, thicker by still water, green in spring and summer,
// golden straw in autumn and dry, frost-tipped stalks in winter.
//
// - The reeds line the water's edge as drawn: where the land brush3d draws (`r.landAt`, its bed square or curving) meets
//   the water's surface (grassMask.ts's reedShore and reedBand), from a little up the bank to a little into the shallows
//   (each clump's middle: its stalks spread a little either way).
//   None by a fall, on a cliff or a steep tile, in a footprint or a wheel's race, or near a rock's crags. Rooted in the
//   ground, they stand in the winter's ice rather than float on it.
// - The grass and flowers grow where the grass may (grassMask.ts's tileHabitat, footprints, slopes), each from its own
//   random numbers, so the grass is the same with the flowers or without.
// - A flood (flood.ts) takes no plant away: grass, flowers and reeds all stay rooted on the ground under it, and brush3d's
//   water hides what's below its surface, so the taller poke out of the shallows and deep water covers them (the
//   developer, on #266 and #267). At its height an ordinary flood stands over a metre deep at the river's edge, so the
//   river's reeds go mostly under it (the tallest tips show in places, and more while it rises or drains); a severe one
//   covers them all.
// - Built in 4 × 4-tile blocks across the playable map and its country fringe, each a mesh for the grass, one for the
//   flowers and one for the reeds. What changes in play
//   (a building or field placed or taken away, a tree or rock cleared, an earthwork) makes again only the blocks it
//   touches, found by comparing the layout's terrain and buildings with the last (grassMask.ts's layoutChanges), and
//   made again a few a frame within `REBUILD_BUDGET` (#204), so a long build drag never hitches.
// - A block a new building stands in, or whose ground an earthwork just moved (`r.onLandChange`, as it's swapped in), is
//   hidden until it's made again, first in the queue: its grass never pokes through the building or floats over (or
//   sinks into) the new ground for a frame. The rest (grass growing back, a repaint) keep showing until they're made.
// - Ground-hugging tufts and flowers skip sun shadows and water reflections (`castShadow: false, reflect: false`): the
//   painted ground already reflects in rivers and ponds, and skipping grass reflections saves ~0.6–1.1 ms GPU on water maps.
// - The grass and flowers stand aside (hidden, not made again) while an overlay or the build or earthwork tools show
//   (ShowFrame.details, `setDetails`), so the overlays' tints and the grid read clean; the reeds by the water stay (#285).

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
/** Mixed into a tile's seed for its reeds' random numbers, apart from its grass's and flowers'. */
const REED_SALT = 0x2ee0267;
/** How much thicker the reed beds are by still water (a pond or a lake) than by the running river. */
const STILL_LIFT = 0.12;

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
  /** Each block's grass, flowers and reeds (none: none in it), and the land's height under it as it was made (`heightsUnder`). */
  private readonly blocks = new Map<number, Block>();
  /** Blocks to make again: hidden until they are (and made first), and the rest. */
  private readonly urgent = new Set<number>();
  private readonly dirty = new Set<number>();
  /** The flowers' season (it never changes during a commission), its colours as three.js wants them, and whether they bloom. */
  private readonly season: FlowerSeason;
  private readonly palette: THREE.Color[];
  private readonly flowering: boolean;
  /** The reeds' season, its colours as three.js wants them. */
  private readonly reedSeason: ReedSeason;
  private readonly reedPalette: THREE.Color[];
  private readonly reedTip: THREE.Color;
  /** The game's layout as the meadow last followed it. */
  private layout = -1;
  private seen: GrassLayout;
  /** Whether the grass and flowers show (ShowFrame.details): they stand aside for the overlays and the tools' lines. */
  private details = true;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState) {
    this.r = r; this.lie = lie; this.land = land;
    this.seed = s.scenario.seed;
    this.season = FLOWER_SEASONS[s.scenario.climate.season];
    this.flowering = flowersBloom(s.scenario.climate.season);
    this.palette = this.season.palette.map((c) => srgb(c.hex));
    this.reedSeason = REED_SEASONS[s.scenario.climate.season];
    this.reedPalette = this.reedSeason.palette.map((c) => srgb(c.hex));
    this.reedTip = srgb(this.reedSeason.tip);
    this.reach = Math.min(GRASS_FRINGE, land.margin);
    this.ground = groundOf((x, z) => r.landAt(x, z));
    this.wetDist = wetDistance(land);
    this.grid = grassBlocks(s.map.width, s.map.height, this.reach);
    for (const rect of this.grid) this.blockById.set(rect.id, rect);
    this.seen = grassLayout(s);
    this.rebuildAll(s);
    r.onLandChange((area) => this.landChanged(area));
  }

  /**
   * How high (m) its reeds stand at most at (x, z) m, as shown: their top (REED_TOP) where a clump on show stands within
   * its reach (MAX_REED_REACH) of the point, else 0. For telling them from a tree in a pick (tools.ts).
   */
  reedTopAt(x: number, z: number): number {
    const R = MAX_REED_REACH, ids = new Set<number>();
    for (const wx of [x - R, x + R]) for (const wz of [z - R, z + R]) ids.add(blockOf(Math.floor(wx / TILE), Math.floor(wz / TILE)));
    for (const id of ids) {
      // (Only a block's reeds on show: none while it's hidden, waiting to be made again.)
      const b = this.blocks.get(id), c = b?.clumps;
      if (!c || !b.reeds?.visible) continue;
      for (let i = 0; i < c.length; i += 2) if ((c[i] - x) ** 2 + (c[i + 1] - z) ** 2 < R * R) return REED_TOP;
    }
    return 0;
  }

  /**
   * Follows the game: the blocks a change in its layout touches are queued (those a new building stands in hidden till
   * they're made), and queued blocks made again within `REBUILD_BUDGET` ms.
   */
  sync(s: GameState) {
    const layout = layoutOf(s);
    if (layout !== this.layout) {
      this.layout = layout;
      const now = grassLayout(s), { urgent, dirty } = layoutChanges(this.seen, now, s.map.width);
      this.seen = now;
      for (const id of urgent) this.hide(id);
      for (const id of dirty) this.queue(id);
    }
    // Not on an earthwork's new ground till it's drawn (the swap's landChanged queues what it moved).
    if ((this.urgent.size || this.dirty.size) && !this.r.landAhead) this.drain(s);
  }

  /**
   * Whether the grass and flowers show: hidden while an overlay or the build or earthwork tools show (ShowFrame.details),
   * shown again after, nothing made again. The reeds stay; a block hidden till it's made again stays hidden.
   */
  setDetails(on: boolean) {
    if (on === this.details) return;
    this.details = on;
    this.reshow();
  }

  /**
   * Each block's grass, flowers and reeds shown or hidden as they should be (after something else showed every mesh: a
   * profile run): hidden while the block waits to be made again, the grass and flowers while the details stand aside.
   */
  reshow() {
    for (const [id, b] of this.blocks) {
      const wait = this.urgent.has(id);
      if (b.grass) b.grass.visible = !wait && this.details;
      if (b.flowers) b.flowers.visible = !wait && this.details;
      if (b.reeds) b.reeds.visible = !wait;
    }
  }

  /** A block queued to be made again (behind the hidden ones), its plants showing meanwhile. */
  private queue(id: number) {
    if (this.blockById.has(id) && !this.urgent.has(id)) this.dirty.add(id);
  }

  /**
   * The land as drawn changed in `area` (m): its blocks made again, those whose ground moved under them hidden till they
   * are (made first), so no tuft floats over or sinks into it; the rest (repainted, or the refit's spread leaving them as
   * they were) keep showing meanwhile.
   */
  private landChanged(area: LandArea) {
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
    for (const m of [b?.grass, b?.flowers, b?.reeds]) if (m) m.visible = false;
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
  private driftAt(wx: number, wz: number, lift: number): number {
    const p = FLOWER_PROFILE;
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

  // ---- The reeds' beds and colours ----

  /**
   * Where the reed beds are (0..1) along a shore at world metres (wx, wz): broad stretches with a finer break-up, so a bed
   * has a ragged end and open bank between; raised by still water (`lift`).
   */
  private bedsAt(wx: number, wz: number, lift: number): number {
    const p = REED_PROFILE;
    const s = (this.seed % 977) * 0.19 + 57;
    const broad = noise2(wx * 0.08 + s, wz * 0.08 - s * 0.5) * 0.5 + 0.5;
    const fine = noise2(wx * 0.31 - s * 0.3, wz * 0.31 + s) * 0.5 + 0.5;
    return smooth(p.beds[0], p.beds[1], broad * 0.7 + fine * 0.3 + lift);
  }

  /** The reeds' palette's colour at `t` (0..1) along its weights. */
  private reedColour(t: number): THREE.Color {
    const colours = this.reedSeason.palette, total = colours.reduce((a, c) => a + c.weight, 0);
    let at = t * total;
    for (let i = 0; i < colours.length; i++) {
      at -= colours[i].weight;
      if (at < 0) return this.reedPalette[i];
    }
    return this.reedPalette[this.reedPalette.length - 1];
  }

  // ---- Per-tile scattering ----

  /** A tile's grass and flowers, where its habitat lets them grow. */
  private scatterTile(
    grass: MeshBuilder,
    flowers: MeshBuilder | null,
    s: GameState,
    tx: number,
    ty: number,
    onMap: boolean,
    boxes: readonly FootprintBox[],
    fade: number,
  ) {
    const hab = tileHabitat(s, this.land, this.lie.relief, this.wetDist, tx, ty, onMap);
    if (!hab) return;
    const x0 = tx * TILE, z0 = ty * TILE;
    const canPlace = (wx: number, wz: number): boolean => {
      if (wx < x0 + hab.minU || wx > x0 + hab.maxU || wz < z0 + hab.minV || wz > z0 + hab.maxV) return false;
      if (boxes.length && inBuilding(boxes, wx, wz, wheelRace)) return false;
      return this.ground.normal(wx, wz).y >= 0.82;
    };
    this.scatterGrass(grass, tx, ty, hab, canPlace, fade);
    if (flowers) this.scatterFlowers(flowers, tx, ty, hab, canPlace, fade);
  }

  private scatterGrass(
    mb: MeshBuilder,
    tx: number,
    ty: number,
    hab: TileHabitat,
    canPlace: (wx: number, wz: number) => boolean,
    fade: number,
  ) {
    const profile = GRASS_PROFILE;
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
    fade: number,
  ) {
    const profile = FLOWER_PROFILE;
    const { minU, maxU, minV, maxV, waterBoost, skirtBoost, edgeBoost, deepWoods, groundScale } = hab;
    const { density, clump } = this.season;
    const rand = rng(tileSeed(this.seed ^ FLOWER_SALT, tx, ty));
    const x0 = tx * TILE, z0 = ty * TILE, lift = skirtBoost * 0.6 + edgeBoost + waterBoost * 0.4;
    for (let a = 0; a < profile.attempts; a++) {
      const wx = x0 + minU + rand() * (maxU - minU), wz = z0 + minV + rand() * (maxV - minV);
      const prob = this.driftAt(wx, wz, lift) * density * deepWoods * groundScale * fade;
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

  /**
   * A tile's reeds, if it's a shore (grassMask.ts's reedShore): candidate spots taken by how near the water's edge as drawn
   * they are (reedBand, from the land's height there against the water's surface) and by the beds field, each a clump of
   * one colour with a few more beside it in the bed, each one's spot added to `clumps` (x, z m). Thinned in the country
   * fringe.
   */
  private scatterReeds(
    mb: MeshBuilder, clumps: number[], s: GameState, tx: number, ty: number, onMap: boolean, boxes: readonly FootprintBox[], fade: number,
  ) {
    const shore = reedShore(s, this.land, this.lie.relief, tx, ty, onMap);
    if (!shore) return;
    const profile = REED_PROFILE, season = this.reedSeason;
    const rand = rng(tileSeed(this.seed ^ REED_SALT, tx, ty));
    const x0 = tx * TILE, z0 = ty * TILE, lift = shore.still ? STILL_LIFT : 0;
    const options: ReedOptions = {
      ...profile.reed, tall: [profile.reed.tall[0] * season.tall, profile.reed.tall[1] * season.tall],
      tip: this.reedTip, tipMix: season.tipMix, heads: profile.heads * season.heads,
    };
    const band = (wx: number, wz: number) => reedBand(shore.surface - this.r.landAt(wx, wz));
    const canPlace = (wx: number, wz: number) => reedSpot(shore, tx, ty, wx, wz, boxes, wheelRace, () => this.ground.normal(wx, wz).y);
    for (let a = 0; a < profile.attempts; a++) {
      const wx = x0 + shore.minU + rand() * (shore.maxU - shore.minU), wz = z0 + shore.minV + rand() * (shore.maxV - shore.minV);
      const prob = band(wx, wz) * this.bedsAt(wx, wz, lift) * season.density * fade;
      if (rand() >= prob || !canPlace(wx, wz)) continue;
      options.colour = this.reedColour(rand());
      addReeds(mb, this.ground, wx, wz, rand, options);
      clumps.push(wx, wz);
      // A few more round it in the bed, where the water's edge lets them.
      const more = profile.companions[0] + Math.floor(rand() * profile.companions[1]);
      for (let k = 0; k < more; k++) {
        const ang = rand() * Math.PI * 2, dist = 0.35 + rand() * 0.5;
        const cx = wx + Math.cos(ang) * dist, cz = wz + Math.sin(ang) * dist;
        if (rand() < band(cx, cz) && canPlace(cx, cz)) { addReeds(mb, this.ground, cx, cz, rand, options); clumps.push(cx, cz); }
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

  /** Makes a block again, its grass, flowers and reeds (and notes the land under it as it was made). */
  private rebuildBlock(s: GameState, rect: GrassBlockRect) {
    const was = this.blocks.get(rect.id);
    this.drop(was?.grass);
    this.drop(was?.flowers);
    this.drop(was?.reeds);
    const block: Block = { heights: this.heightsUnder(rect) };
    const { width: w, height: h } = s.map;
    const boxes = boxesIn(s, rect.x0, rect.y0, rect.x1, rect.y1);
    const grass = new MeshBuilder('grass');
    const flowers = this.flowering ? new MeshBuilder('foliage') : null;
    const reeds = new MeshBuilder('grass'), clumps: number[] = [];
    for (let y = rect.y0; y < rect.y1; y++) for (let x = rect.x0; x < rect.x1; x++) {
      const fade = fringeFade(x, y, w, h, this.reach);
      if (fade <= 0) continue;
      const onMap = x >= 0 && y >= 0 && x < w && y < h;
      this.scatterTile(grass, flowers, s, x, y, onMap, boxes, fade);
      this.scatterReeds(reeds, clumps, s, x, y, onMap, boxes, fade);
    }
    // Culled whole (not cut into tiles: a block is small, and made again often). The flowers keep no rain off (cover).
    if (grass.vertexCount) block.grass = this.r.add(grass.build(), 'grass', { cull: true, castShadow: false, reflect: false });
    if (flowers?.vertexCount) block.flowers = this.r.add(flowers.build(), 'foliage', { cull: true, castShadow: false, reflect: false, cover: 'none' });
    for (const m of [block.grass, block.flowers]) if (m) m.visible = this.details;
    // The reeds stand in the water, so they show in it.
    if (reeds.vertexCount) {
      block.reeds = this.r.add(reeds.build(), 'grass', { cull: true, castShadow: false });
      block.clumps = Float32Array.from(clumps);
    }
    this.blocks.set(rect.id, block);
  }

  /** Takes a mesh out of the picture and frees it. */
  private drop(m: THREE.Mesh | undefined): undefined {
    if (m) { this.r.remove(m); m.geometry.dispose(); }
    return undefined;
  }
}

/** A block's grass, flowers and reeds, as made, where its reeds' clumps stand (x, z m), and the land's height under it then. */
interface Block { grass?: THREE.Mesh; flowers?: THREE.Mesh; reeds?: THREE.Mesh; clumps?: Float32Array; heights: Float32Array }
