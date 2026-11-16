import * as THREE from 'three';
import { CropPatch, HIGHLIGHT_LOOK, MeshBuilder, ModelSet, OVERLAY_LOOK, OVERLAY_NONE, PLAIN, PREVIEW_LOOK, srgb, type BrushRenderer, type HighlightLook, type Line, type OverlayLook, type PickHit } from '../../../brush3d/src/index.ts';
import { BUILDINGS, HIVE, POWER, type BuildingId, type CropId } from '../../game/data.ts';
import { TERRAIN } from '../../game/map.ts';
import { feederOf, networkOf, networks, POWERED, pylonsInLink, wiresOf } from '../../game/power.ts';
import { centreLevel } from '../../game/relief.ts';
import { isOpen, legPath } from '../../game/roads.ts';
import { pylonReaches, pylonsLink } from '../../game/rules.ts';
import { cutOff } from '../../game/sim/trucks.ts';
import { buildingAt, buildingById, growsCrops, inMap, layoutOf, reliefOf, sizeOf, type Building, type Dir, type GameState, type Route } from '../../game/state.ts';
import type { Highlight, OverlayStyle } from '../../ui/settings.ts';
import { isBank, standY, type Lie } from '../ground.ts';
import type { MarkerAt, PagePoint, Picker, Preview, ShowFrame, SyncFrame, Tile, Under } from '../scene.ts';
import {
  BEES, CURSOR_GRID, CUT_OFF, FERT, GHOST_WIRE, GROUND_COLOURS, hasMarker, heightTint, inPower, LINK, NET_COLOURS, netColour, ROADS, ROUTE_COLOURS, routeColour, WATER,
  type CursorPatch, type NetLabel, type Overlay, type PowerFocus, type StopLabel,
} from '../legend.ts';
import { YAW } from './catalog.ts';
import { LEVEL, RISE, TILE } from './scale.ts';
import { thingHeight, type Things } from './things.ts';

// The game's tools in the painted world (#206): picking what's under the pointer, the marks on buildings and trucks
// (highlighted, tinted for what's in focus), the build preview and its frames, the overlays, the grid and contours, the
// routes and power lines, and where the HUD puts its labels and markers. The calls are brush3d's (docs/API.md, "Picking"
// and "The game's tools on the picture"); what each shows is the game's, and its colours are the HUD's too (legend.ts).
// How each looks is the developer's pick (#206, PR #233, 2026-11-16): the build preview a blueprint (brush3d's
// PREVIEW_LOOK) with brackets at its footprint's corners, and the highlight and the overlays' look the player's to choose
// in the settings (HIGHLIGHT_LOOKS, OVERLAY_LOOKS).
//
// Units: the Scene's are the game's (a tile 1, heights as ground.ts's Lie has them); brush3d's are metres (scale.ts).

/** How near the line of sight through the pointer a truck must drive (m) to change what is under the pointer. */
const TRUCK_REACH = 3.2;
/** How far from a tree's tile's middle (tiles) a pick on a plant still finds the tree: a crown leans over its tile's edge. */
const CROWN_REACH = 0.8;
/** How strongly an overlay covers the land; the tint of what's linked to the focus, and how strong. */
const LINK_STRENGTH = 0.55;
/**
 * A frame round a footprint being built, in the blueprint's green where it fits and red where it doesn't: brackets at its
 * corners, each arm this share of a side; their width, how far in from the footprint's edge and over its ground (m).
 */
const FRAME_ARM = 0.3, FRAME_WIDTH = 0.35, FRAME_INSET = 0.15, FRAME_LIFT = 0.05;
/** How far below a pylon's top its wires meet it (m); how far over a building's card and marker stand (world units). */
const PYLON_TOP = 0.4, LABEL_OVER = 0.3, MARKER_OVER = 0.1;
/** The grey a building with no model yet previews as. */
const GREY = srgb(0x9a968e);
/** The tile cursor's marks (the tile pointed at, an earthwork's points) and those refused; a dot's radius (m). */
const CURSOR = 0xfff0c0, REFUSED = 0xe8705a, DOT = 0.8;
/** How far over its ground the cursor lies (m); a tile's corners (u, v), north-west, north-east, south-east, south-west (CursorPatch's). */
const CURSOR_LIFT = 0.08, CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];

/** The highlight settings' looks (the player's pick; halo the default): a crisp cream outline, a soft halo, a bold gold line. */
export const HIGHLIGHT_LOOKS: Record<Highlight, HighlightLook> = {
  outline: HIGHLIGHT_LOOK,
  halo: { color: 0xfff4d6, width: 9, glow: 1, fill: 0.35 },
  gold: { color: 0xffc23d, width: 3.5, glow: 0, fill: 0 },
};
/**
 * The overlay settings' looks, and how strongly each covers the land (the player's pick; bold the default): a wash in the
 * land's own light and shade with a thin dark line between colours; strong flat colour with a firm line; a light wash with
 * a wide band of full colour inside each region's border. Night and weather fall on each (the developer's call, #206).
 */
export const OVERLAY_LOOKS: Record<OverlayStyle, { look: OverlayLook; strength: number }> = {
  wash: { look: OVERLAY_LOOK, strength: 0.6 },
  bold: { look: { lit: 0, edge: 0.5, rim: 0 }, strength: 0.85 },
  borders: { look: { lit: 1, edge: 0.25, rim: 1.2 }, strength: 0.3 },
};

const hex = (c: THREE.Color) => c.getHex();

/** A building's footprint's ground, as things.ts stands it (m). */
const standM = (lie: Lie, s: GameState, n: number, x: number, y: number) => standY(lie, s.map, n, x, y) * RISE * TILE;

export class BrushTools {
  readonly picker: Picker;
  readonly preview: Preview;
  private readonly r: BrushRenderer;
  private readonly things: Things;
  private readonly lie: Lie;
  private readonly marked = new Set<THREE.Mesh>();
  private overlayKey = '';
  private routesKey = '';
  private powerKey = '';
  private framesKey = '';
  private cursorKey = '';
  private gridOn: boolean | null = null;
  private routeLabels: StopLabel[] = [];
  private powerLabels: NetLabel[] = [];
  /** The power networks' reach on the ground, per tile index (the power overlay's), as last worked out. */
  private reach = new Map<number, number>();

  constructor(r: BrushRenderer, state: GameState, things: Things, lie: Lie) {
    this.r = r; this.things = things; this.lie = lie;
    this.picker = new BrushPicker(r, state, things);
    this.preview = new BrushPreview(r, things, (lines) => this.frames(lines));
  }

  private overlayStrength = OVERLAY_LOOKS.bold.strength;
  /** The player's highlight and overlay settings, from now (the overlay shown sent again in its look). */
  setLooks(highlight: Highlight, overlay: OverlayStyle) {
    this.r.setHighlightLook(HIGHLIGHT_LOOKS[highlight]);
    this.r.setOverlayLook(OVERLAY_LOOKS[overlay].look);
    this.overlayStrength = OVERLAY_LOOKS[overlay].strength;
    this.overlayKey = '';
  }

  /** Before the tools run: the grid and the contour lines while building or doing earthworks. */
  sync(s: GameState, f: SyncFrame) {
    if (f.lines === this.gridOn) return;
    this.gridOn = f.lines;
    this.r.setGrid(f.lines ? { width: s.map.width, height: s.map.height, level: LEVEL } : null);
  }

  /** Once the tools have run: the overlay, the marks, the routes and the power lines they show. */
  show(s: GameState, f: ShowFrame) {
    (this.preview as BrushPreview).flush();
    this.power(s, f.power);
    this.overlay(s, f.overlay);
    this.marks(f.links, f.highlight);
    this.routes(s, f.routes.routes, f.routes.numbers);
  }

  stopLabels(): StopLabel[] { return this.routeLabels; }
  netLabels(): NetLabel[] { return this.powerLabels; }

  /** Where each building with a problem shows its marker: over its model's top (world units). */
  markerSpots(s: GameState): MarkerAt[] {
    const out: MarkerAt[] = [];
    for (const b of s.buildings) {
      if (!hasMarker(b)) continue;
      const n = sizeOf(b), top = growsCrops(b) && b.type === 'field' ? thingHeight('field') + 1 : thingHeight(b.type);
      out.push({ id: b.id, status: b.status, need: b.need, x: b.x + n / 2, y: standY(this.lie, s.map, n, b.x, b.y) * RISE + top / TILE + MARKER_OVER, z: b.y + n / 2 });
    }
    return out;
  }

  /**
   * The tile cursor's marks, as lines on the land: a frame along a tile's sides, a ring round a corner. Drawn over the
   * finished picture like the routes, where no night or weather hides them. Each lies on its own tile's ground as the
   * game reads it (the patch's heights): at a cliff a tile's side is on two terraces, and the mark is this tile's.
   */
  cursor(marks: readonly CursorPatch[], refused: readonly CursorPatch[]) {
    const key = JSON.stringify([marks, refused]);
    if (key === this.cursorKey) return;
    this.cursorKey = key;
    const lines: Line[] = [], G = CURSOR_GRID;
    const add = (patches: readonly CursorPatch[], color: number) => {
      for (const p of patches) {
        // A point of the tile (u, v from its north-west corner, 0..1, held to the tile for its height) on its ground (m).
        const at = (u: number, v: number) => {
          const cu = Math.min(1, Math.max(0, u)) * G, cv = Math.min(1, Math.max(0, v)) * G;
          const i = Math.min(G - 1, Math.floor(cu)), j = Math.min(G - 1, Math.floor(cv)), fu = cu - i, fv = cv - j, h = p.heights;
          const top = h[j * (G + 1) + i] * (1 - fu) + h[j * (G + 1) + i + 1] * fu, bottom = h[(j + 1) * (G + 1) + i] * (1 - fu) + h[(j + 1) * (G + 1) + i + 1] * fu;
          return { x: (p.x + u) * TILE, y: (top * (1 - fv) + bottom * fv) * TILE + CURSOR_LIFT, z: (p.y + v) * TILE };
        };
        // Its sides, north, east, south, west: each from a corner to the next, a point a piece of the tile's grid.
        const side = (e: number) => Array.from({ length: G + 1 }, (_, k) => {
          const t = k / G, [u0, v0] = CORNERS[e], [u1, v1] = CORNERS[(e + 1) % 4];
          return at(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t);
        });
        if (p.edges === 15) lines.push({ points: [0, 1, 2, 3].flatMap((e) => side(e).slice(1)), color, style: 'route', width: 0.25, closed: true });
        else for (let e = 0; e < 4; e++) if (p.edges & (1 << e)) lines.push({ points: side(e), color, style: 'route', width: 0.25 });
        for (const d of p.dots) {
          const [u, v] = CORNERS[d], r = DOT / TILE;
          lines.push({ points: Array.from({ length: 16 }, (_, i) => at(u + Math.cos(i / 16 * Math.PI * 2) * r, v + Math.sin(i / 16 * Math.PI * 2) * r)), color, style: 'route', width: 0.3, closed: true });
        }
      }
    };
    add(marks, CURSOR);
    add(refused, REFUSED);
    this.r.setLines(lines.length ? lines : null, 'cursor');
  }

  /** The frames round footprints being built, as lines (sent only when they change). */
  private frames(lines: Line[]) {
    const key = JSON.stringify(lines);
    if (key === this.framesKey) return;
    this.framesKey = key;
    this.r.setLines(lines, 'frames');
  }

  /** The buildings and trucks highlighted (selected, under the pointer) and tinted (linked to the focus). */
  private marks(links: readonly number[], highlight: readonly number[]) {
    const want = new Map<THREE.Mesh, { highlight: boolean; tint: { color: number; strength: number } | null }>();
    const of = (id: number) => this.things.meshesOf(id);
    for (const id of links) for (const m of of(id)) want.set(m, { highlight: false, tint: { color: LINK, strength: LINK_STRENGTH } });
    for (const id of highlight) for (const m of of(id)) want.set(m, { highlight: true, tint: want.get(m)?.tint ?? null });
    for (const m of this.marked) if (!want.has(m)) this.r.setMark(m, null);
    for (const [m, mark] of want) this.r.setMark(m, mark);
    this.marked.clear();
    for (const m of want.keys()) this.marked.add(m);
  }

  /** A colour per tile over the map (or none): the overlay's, or the power networks' reach. */
  private overlay(s: GameState, kind: Overlay) {
    const key = kind === 'none' ? 'none' : kind === 'power' ? `power ${this.powerKey}`
      : `${kind} ${reliefOf(s)} ${kind === 'fertility' ? s.map.fertility.map((f) => Math.floor(f / 17)).join('') : kind === 'ground' ? s.scenario.seed : ''} ${s.buildings.length} ${networks(s).layout} ${layoutOf(s)}${kind === 'roads' ? ` ${s.buildings.filter((b) => cutOff(s, b)).map((b) => b.id).join(',')}` : ''}`;
    if (key === this.overlayKey) return;
    this.overlayKey = key;
    if (kind === 'none') { this.r.setOverlay(null); return; }
    const { width: w, height: h } = s.map, color = new Uint32Array(w * h).fill(OVERLAY_NONE);
    const grass = (i: number) => s.map.terrain[i] === TERRAIN.grass;
    if (kind === 'height') {
      for (let i = 0; i < w * h; i++) if (s.map.terrain[i] !== TERRAIN.water) color[i] = hex(heightTint(centreLevel(s.map, i % w, Math.floor(i / w)), isBank(s.map, i % w, Math.floor(i / w))));
    } else if (kind === 'fertility') {
      for (let i = 0; i < w * h; i++) if (grass(i)) color[i] = hex(FERT[Math.min(5, Math.floor(s.map.fertility[i] / 17))]);
    } else if (kind === 'ground') {
      // The ground's kinds exactly, tile by tile (#202's decision: subtle in the paint, exact here).
      for (let i = 0; i < w * h; i++) if (grass(i)) color[i] = hex(GROUND_COLOURS[s.map.ground[i]]);
    } else if (kind === 'roads') {
      for (let i = 0; i < w * h; i++) if (isOpen(s, i % w, Math.floor(i / w))) color[i] = hex(ROADS);
      for (const b of s.buildings) {
        if (!cutOff(s, b)) continue;
        for (let y = b.y; y < b.y + sizeOf(b); y++) for (let x = b.x; x < b.x + sizeOf(b); x++) color[y * w + x] = hex(CUT_OFF);
      }
    } else if (kind === 'power') {
      for (const [i, c] of this.reach) color[i] = c;
    } else {
      const tint = hex(kind === 'water' ? WATER : BEES);
      const cover = (bx: number, by: number, n: number, r: number) => {
        for (let y = by - r; y < by + n + r; y++) for (let x = bx - r; x < bx + n + r; x++) if (x >= 0 && y >= 0 && x < w && y < h) color[y * w + x] = tint;
      };
      for (const b of s.buildings) {
        if (kind === 'water' && b.type === 'sprinkler') cover(b.x - 1, b.y - 1, 3, POWER.sprinklerReach - 1);
        if (kind === 'bees' && b.type === 'hive') cover(b.x, b.y, 1, HIVE.reach);
      }
    }
    this.r.setOverlay({ width: w, height: h, color, strength: this.overlayStrength });
  }

  /** The routes shown, each its way on the ground in its colour; with `numbers`, labels over its stops. */
  private routes(s: GameState, routes: Route[], numbers: boolean) {
    const key = `${layoutOf(s)} ${reliefOf(s)} ${numbers} ${routes.map((r) => `${r.id}:${routeColour(s, r)}:${r.stops.map((st) => st.building).join(',')}`).join(';')}`;
    if (key === this.routesKey) return;
    this.routesKey = key;
    const lines: Line[] = [], labels: StopLabel[] = [], w = s.map.width;
    for (const r of routes) {
      const c = routeColour(s, r), stops = r.stops.map((st) => buildingById(s, st.building));
      for (let i = 0; i < stops.length && stops.length > 1; i++) {
        const a = stops[i], b = stops[(i + 1) % stops.length];
        if (!a || !b || a === b) continue;
        const p = legPath(s, a, b);
        if (!p) continue;
        // Through each tile's middle and the middle of the edge it crosses to the next, on the land.
        const points: { x: number; z: number }[] = [];
        p.forEach((i, k) => {
          const x = (i % w + 0.5) * TILE, z = (Math.floor(i / w) + 0.5) * TILE, last = points[points.length - 1];
          if (k) points.push({ x: (last.x + x) / 2, z: (last.z + z) / 2 });
          points.push({ x, z });
        });
        lines.push({ points, color: ROUTE_COLOURS[c], style: 'route' });
      }
      if (!numbers) continue;
      // One label a building, with every stop number it has.
      const seen = new Map<number, number[]>();
      r.stops.forEach((st, i) => { const l = seen.get(st.building); if (l) l.push(i + 1); else seen.set(st.building, [i + 1]); });
      for (const [id, nums] of seen) {
        const b = buildingById(s, id);
        if (!b) continue;
        const n = sizeOf(b);
        labels.push({ x: b.x + n / 2, y: standY(this.lie, s.map, n, b.x, b.y) * RISE + thingHeight(b.type) / TILE + LABEL_OVER, z: b.y + n / 2, colour: ROUTE_COLOURS[c], text: nums.join(' · ') });
      }
    }
    this.routeLabels = labels;
    this.r.setLines(lines, 'routes');
  }

  /**
   * The power networks while the player works with power: each network's wires between its pylons' tops
   * and feeds down to what it powers, in its colour, with a label; its reach on the ground (the power overlay); a focused
   * pylon's reach and link range; and what pylons being placed would wire up.
   */
  private power(s: GameState, f: PowerFocus) {
    const focus = f.focus !== null ? buildingById(s, f.focus) : null;
    const focusNet = focus && inPower(focus) ? (BUILDINGS[focus.type].grid === 'link' ? networks(s).of.get(focus.id) ?? null : networkOf(s, focus)) : null;
    const key = `${layoutOf(s)} ${reliefOf(s)} ${f.all} ${f.tiles} ${focus && inPower(focus) ? focus.id : ''} ${f.ghosts.map((g) => `${g.x},${g.y},${g.ok}`).join(';')}`;
    if (key === this.powerKey) return;
    this.powerKey = key;
    const lines: Line[] = [], labels: NetLabel[] = [], list = networks(s).list;
    const top = (x: number, y: number) => standM(this.lie, s, 1, x, y) + thingHeight('pylon') - PYLON_TOP;
    const at = (x: number, y: number) => ({ x: (x + 0.5) * TILE, y: top(x, y), z: (y + 0.5) * TILE });
    const wire = (color: number, a: { x: number; y: number }, b: { x: number; y: number }) => lines.push({ points: [at(a.x, a.y), at(b.x, b.y)], color, style: 'wire' });
    const feed = (color: number, p: { x: number; y: number }, b: Building) => {
      const n = sizeOf(b), y = standM(this.lie, s, n, b.x, b.y) + Math.min(thingHeight(b.type) * 0.7, 5.6);
      lines.push({ points: [at(p.x, p.y), { x: (b.x + n / 2) * TILE, y, z: (b.y + n / 2) * TILE }], color, style: 'wire', opacity: 0.55, width: 0.08 });
    };
    for (const net of f.all ? list : focusNet ? [focusNet] : []) {
      const c = NET_COLOURS[netColour(s, net)];
      for (const [a, b] of wiresOf(net)) wire(c, a, b);
      for (const b of net.members) { const p = feederOf(s, b); if (p) feed(c, p, b); }
      const mid = net.pylons.reduce((m, p) => ({ x: m.x + p.x + 0.5, z: m.z + p.y + 0.5, y: m.y + top(p.x, p.y) }), { x: 0, z: 0, y: 0 });
      const k = net.pylons.length;
      labels.push({ x: mid.x / k, y: mid.y / k / TILE + LABEL_OVER, z: mid.z / k, colour: c, net });
    }
    // A pylon's reach (a square) and its link range (a dashed ring), on the land.
    const ranges = (color: number, x: number, y: number) => {
      const r = POWER.pylon.reach, L = POWER.pylon.link * TILE, cx = (x + 0.5) * TILE, cz = (y + 0.5) * TILE;
      lines.push({ points: [[x - r, y - r], [x + r + 1, y - r], [x + r + 1, y + r + 1], [x - r, y + r + 1]].map(([px, pz]) => ({ x: px * TILE, z: pz * TILE })), color, style: 'route', width: 0.3, closed: true });
      lines.push({ points: Array.from({ length: 64 }, (_, i) => ({ x: cx + Math.cos(i / 64 * Math.PI * 2) * L, z: cz + Math.sin(i / 64 * Math.PI * 2) * L })), color, style: 'dashed', closed: true });
    };
    if (focus && BUILDINGS[focus.type].grid === 'link' && focusNet) ranges(NET_COLOURS[netColour(s, focusNet)], focus.x, focus.y);
    // Pylons being placed: their wires to the pylons they'd link to (and to each other), feeds to the buildings they'd
    // bring power to (a building joins the first pylon's network that reaches it, and new pylons come last), and the last
    // one's reach and range.
    const ok = f.ghosts.filter((g) => g.ok), fed = new Set<number>();
    ok.forEach((g, i) => {
      for (const p of pylonsInLink(s, g.x, g.y)) wire(GHOST_WIRE, g, p);
      const prev = ok[i - 1];
      if (prev && pylonsLink(prev.x, prev.y, g.x, g.y)) wire(GHOST_WIRE, prev, g);
      for (const b of s.buildings) {
        if (!POWERED(b) || fed.has(b.id) || networkOf(s, b) || !pylonReaches(b, g.x, g.y)) continue;
        fed.add(b.id);
        feed(GHOST_WIRE, g, b);
      }
    });
    const last = f.ghosts[f.ghosts.length - 1];
    if (last) ranges(GHOST_WIRE, last.x, last.y);
    this.powerLabels = labels;
    this.r.setLines(lines, 'power');
    // Each network's reach on the ground (a tile in two networks' reach belongs to the first, as in the rules), and a pylon
    // being placed's in pale green: the power overlay's tiles.
    this.reach = new Map();
    if (!f.tiles) return;
    const { width: w, height: h } = s.map, r = POWER.pylon.reach, of = networks(s).of;
    const claim = (px: number, py: number, c: number) => {
      for (let y = py - r; y <= py + r; y++) for (let x = px - r; x <= px + r; x++) if (x >= 0 && y >= 0 && x < w && y < h && !this.reach.has(y * w + x)) this.reach.set(y * w + x, c);
    };
    for (const p of s.buildings) {
      if (BUILDINGS[p.type].grid !== 'link') continue;
      const net = of.get(p.id);
      if (net) claim(p.x, p.y, NET_COLOURS[netColour(s, net)]);
    }
    for (const g of f.ghosts) if (g.ok) claim(g.x, g.y, GHOST_WIRE);
  }
}

/**
 * What stands under the pointer, from brush3d's pick of the frame drawn (r.pick, r.requestPick). The tile of ground comes
 * from the game's camera each frame; a tree's tile, and the building or truck there, from the last pick.
 */
class BrushPicker implements Picker {
  private readonly r: BrushRenderer;
  private readonly things: Things;
  /** The last pick's answer, where the pointer was (device pixels) and the camera then, and the tile of ground under it then. */
  private seen: { hit: PickHit | null; px: string; camera: THREE.Matrix4; ground: Tile | null } | null = null;
  private pickNo = 0;
  private picking = false;
  private readonly trucksSeen = new Map<number, { x: number; z: number }>();
  private changesSeen = -1;
  private layoutSeen = '';

  constructor(r: BrushRenderer, state: GameState, things: Things) {
    this.r = r; this.things = things;
    this.layoutSeen = `${layoutOf(state)} ${reliefOf(state)}`;
  }

  /** The camera as placed now, to tell whether the picture under a still pointer has moved. */
  private cameraNow(into = new THREE.Matrix4()) {
    const c = this.r.view.camera;
    return into.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
  }
  private pixel(at: PagePoint) {
    const rect = this.r.canvas.getBoundingClientRect();
    return `${Math.floor((at.x - rect.left) / rect.width * this.r.width)} ${Math.floor((at.y - rect.top) / rect.height * this.r.height)} ${this.r.width} ${this.r.height}`;
  }
  private keep(hit: PickHit | null, px: string, camera: THREE.Matrix4, ground: Tile | null) { this.seen = { hit, px, camera, ground }; }

  under(s: GameState, at: PagePoint, ground: Tile | null): Under {
    const seen = this.seen;
    if (!seen) return { tile: ground, building: null };
    const hit = seen.hit, still = seen.px === this.pixel(at) && this.cameraNow(scratch).equals(seen.camera);
    // What the pick met, as a tile of the map: a tree's own (it leans over the next), else the one it met.
    const met = hit ? (hit.what === 'plant' ? treeTile(s, hit.point) : null) ?? tileOf(s, hit.point) : null;
    const tree = hit?.what === 'plant' ? treeTile(s, hit.point) : null;
    const tile = still && tree ? tree : ground;
    // A building's or truck's own mesh, if it still stands for it; else the building on the tile the pick met.
    let building: number | null = null;
    if (hit?.what === 'thing' && typeof hit.tag === 'number') {
      building = buildingById(s, hit.tag) || s.trucks.some((t) => t.id === hit.tag) ? hit.tag : null;
    }
    if (building === null) {
      const t = met ?? seen.ground;
      building = t ? buildingAt(s, t.x, t.y)?.id ?? null : null;
    }
    return { tile, building };
  }

  now(at: PagePoint, ground: Tile | null) {
    this.pickNo++;
    this.keep(this.r.pick(at.x, at.y), this.pixel(at), this.cameraNow(), ground);
  }

  request(at: PagePoint, ground: Tile | null, still: () => boolean) {
    if (this.picking) return false;
    this.picking = true;
    const no = ++this.pickNo, px = this.pixel(at), drawn = this.cameraNow();
    this.r.requestPick(at.x, at.y).then((hit) => {
      this.picking = false;
      if (no === this.pickNo && still()) this.keep(hit, px, drawn, ground);
    }, () => { this.picking = false; });
    return true;
  }

  forget() { this.pickNo++; this.seen = null; }

  moved(s: GameState, at: PagePoint | null) {
    let moved = false;
    const layout = `${layoutOf(s)} ${reliefOf(s)}`;
    if (this.things.changes !== this.changesSeen || layout !== this.layoutSeen) { this.changesSeen = this.things.changes; this.layoutSeen = layout; moved = true; }
    // A truck driving under the pointer, or out from under it.
    let sight: THREE.Ray | null = null;
    for (const t of s.trucks) {
      const now = this.things.truckAt(t.id), was = this.trucksSeen.get(t.id);
      if (!now || (was && was.x === now.x && was.z === now.z)) continue;
      this.trucksSeen.set(t.id, now);
      if (moved || !at) continue;
      sight ??= this.r.view.rayAt(at.x, at.y);
      for (const q of was ? [now, was] : [now]) {
        const p = new THREE.Vector3(q.x * TILE, this.r.landAt(q.x * TILE, q.z * TILE) + 1, q.z * TILE);
        if (sight.distanceToPoint(p) < TRUCK_REACH) moved = true;
      }
    }
    return moved;
  }
}
const scratch = new THREE.Matrix4();

/** The map tile a point of the world (m) is over, or null off the map. */
function tileOf(s: GameState, p: THREE.Vector3): Tile | null {
  const x = Math.floor(p.x / TILE), y = Math.floor(p.z / TILE);
  return inMap(s, x, y) ? { x, y } : null;
}

/** The tree (or rock) on the map nearest a point a pick met on a plant, if one's close enough for its crown to be there. */
function treeTile(s: GameState, p: THREE.Vector3): Tile | null {
  const fx = p.x / TILE, fz = p.z / TILE;
  let best: Tile | null = null, near = CROWN_REACH;
  for (let y = Math.floor(fz) - 1; y <= Math.floor(fz) + 1; y++) for (let x = Math.floor(fx) - 1; x <= Math.floor(fx) + 1; x++) {
    if (!inMap(s, x, y)) continue;
    const t = s.map.terrain[y * s.map.width + x];
    if (t !== TERRAIN.tree && t !== TERRAIN.rock) continue;
    const d = Math.hypot(fx - (x + 0.5), fz - (y + 0.5));
    if (d < near) { near = d; best = { x, y }; }
  }
  return best;
}

/**
 * What would be built, see-through (brush3d's previews, never picked): each building its model tinted for whether it
 * fits, a field's crop a tile at a time, and the frames round the footprints as lines on the land. Cleared each frame and
 * shown again; the meshes are kept and reused, a pool a kind.
 */
class BrushPreview implements Preview {
  private readonly r: BrushRenderer;
  private readonly things: Things;
  private readonly send: (lines: Line[]) => void;
  /** Each kind's geometries (a building's model or stand-in, a crop's tile), keyed by kind and whether its model is in. */
  private readonly geometries = new Map<string, THREE.BufferGeometry[]>();
  private readonly pools = new Map<string, { sets: THREE.Mesh[][]; used: number }>();
  private framed: Line[] = [];

  constructor(r: BrushRenderer, things: Things, send: (lines: Line[]) => void) { this.r = r; this.things = things; this.send = send; }

  clear() {
    for (const p of this.pools.values()) { for (const set of p.sets) for (const m of set) m.visible = false; p.used = 0; }
    this.framed = [];
  }

  /** Sends the frames shown since the last clear (the scene's show, once the tools have run). */
  flush() { this.send(this.framed); }

  frame(n: number, ok: boolean, x: number, y: number, z: number) {
    const h = n / 2 * TILE - FRAME_INSET, cx = x * TILE, cz = z * TILE, top = y * TILE + FRAME_LIFT, arm = 2 * h * FRAME_ARM;
    const color = ok ? PREVIEW_LOOK.fits : PREVIEW_LOOK.blocked, at = (dx: number, dz: number) => ({ x: cx + dx, y: top, z: cz + dz });
    // An L at each corner.
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      this.framed.push({ points: [at(sx * h, sz * (h - arm)), at(sx * h, sz * h), at(sx * (h - arm), sz * h)], color, style: 'route', width: FRAME_WIDTH });
    }
  }

  building(type: BuildingId, x: number, y: number, z: number, rot: Dir, ok: boolean) {
    const model = this.things.modelOf(type);
    this.show(`b ${type} ${model ? 'model' : 'stand-in'}`, () => this.buildingGeometry(type, model), x, y, z, YAW[rot], ok);
  }

  crop(crop: CropId, x: number, y: number, z: number, ok: boolean) {
    this.show(`crop ${crop}`, () => cropGeometry(crop), x, y + thingHeight('field') / TILE, z, 0, ok);
  }

  private show(key: string, make: () => THREE.BufferGeometry[], x: number, y: number, z: number, yaw: number, ok: boolean) {
    let gs = this.geometries.get(key);
    if (!gs) { gs = make(); this.geometries.set(key, gs); }
    let pool = this.pools.get(key);
    if (!pool) { pool = { sets: [], used: 0 }; this.pools.set(key, pool); }
    const set = pool.sets[pool.used] ?? gs.map((g) => this.r.addPreview(g, ok ? 'fits' : 'blocked'));
    pool.sets[pool.used++] = set;
    for (const m of set) {
      m.visible = true;
      m.position.set(x * TILE, y * TILE, z * TILE);
      m.rotation.set(0, yaw, 0);
      if (m.userData.preview !== (ok ? 'fits' : 'blocked')) this.r.setPreview(m, ok ? 'fits' : 'blocked');
    }
  }

  /** A building's model as drawn (its built parts, not its plants), at the origin facing +z; or its grey block. */
  private buildingGeometry(type: BuildingId, model: THREE.Object3D | null): THREE.BufferGeometry[] {
    if (model) {
      const set = new ModelSet(1);
      set.add(model, new THREE.Matrix4());
      return [set.ink, set.paint].filter((b) => b.vertexCount).map((b) => b.build());
    }
    const n = BUILDINGS[type].size, side = n * TILE - 0.6, tall = thingHeight(type), mb = new MeshBuilder('ink');
    const g = new THREE.BoxGeometry(side, tall, side).translate(0, tall / 2, 0);
    mb.addGeometry(g, new THREE.Matrix4(), GREY, PLAIN);
    g.dispose();
    return [mb.build()];
  }
}

/** One tile of a crop, grown enough to tell apart (its third stage), at the origin: the painted crop's own geometry. */
function cropGeometry(crop: CropId): THREE.BufferGeometry[] {
  const patch = new CropPatch(), out: THREE.BufferGeometry[] = [];
  patch.add({ x: 0, y: 0, z: 0, crop, stage: 2, side: TILE });
  patch.addTo({ add: (g: THREE.BufferGeometry) => { out.push(g); return new THREE.Mesh(g); } });
  return out;
}
