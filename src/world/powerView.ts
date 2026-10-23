import * as THREE from 'three';
import type { PixelObject, PixelRenderer } from 'pixel3d-renderer';
import { BUILDINGS, POWER } from '../game/data.ts';
import { feederOf, networkOf, networks, POWERED, pylonsInLink, wiresOf, type Network } from '../game/power.ts';
import { pylonReaches, pylonsLink } from '../game/rules.ts';
import { buildingById, layoutOf, reliefOf, sizeOf, type Building, type GameState } from '../game/state.ts';
import { overlayTiles, standY, type Lie } from './ground.ts';
import type { Models } from './models.ts';
import { NET_COLOURS } from './shapes.ts';

// Shows the power networks, only while the player works with power, so pylons stay in the background otherwise:
//
// - every network has a colour (NET_COLOURS, by its place in the list): its pylons' reach on the ground, the wires
//   joining its pylons and the feed lines from a pylon to each building it powers;
// - a focused pylon shows its reach (a square, 3 tiles round it) and its link range (a dashed circle, 8 tiles);
// - a pylon being placed shows both, the wires it would make and feeds to the buildings it would bring power to;
// - a label over each network shown says what it makes and uses, and how full its batteries are.

/** Where to draw the power layer, and how much of it. */
export interface PowerFocus {
  /** Every network (the power overlay, or placing something that makes, stores or uses power). */
  all: boolean;
  /** Tint each network's reach on the ground (the power overlay, or placing a pylon). */
  tiles: boolean;
  /** A building whose network to show (selected or under the pointer): a pylon or a powered building. */
  focus: number | null;
  /** Pylons being placed: tile and whether each can be built. */
  ghosts: { x: number; y: number; ok: boolean }[];
}

export interface NetLabel { x: number; y: number; z: number; colour: number; net: Network }

/** Wire thickness and sag, feed line thickness, range marks' width; how high a wire meets a pylon below its top. */
const WIRE = 0.07, SAG = 0.05, MAX_SAG = 0.35, FEED = 0.045, MARK = 0.08, PYLON_TOP = 0.1;
/** How strongly reach tiles take their network's colour (paler than the wires, so the wires stand out), and how solid feeds are. */
const TILE_STRENGTH = 0.8, FEED_OPACITY = 0.55;
const GHOST = NET_COLOURS.length;
const TILE_TINTS = NET_COLOURS.map((c) => new THREE.Color(c));
const GHOST_TINT = new THREE.Color(0xd8ffb0);
const X = new THREE.Vector3(1, 0, 0), dir = new THREE.Vector3(), q = new THREE.Quaternion(), scale = new THREE.Vector3();
const v = new THREE.Vector3(), e = new THREE.Euler();

/** The colour index of a network: its place in the list, wrapping round the palette. */
export const netColour = (s: GameState, net: Network) => networks(s).list.indexOf(net) % NET_COLOURS.length;

/** Whether a building takes part in power: a pylon, or something that makes, stores or uses it. */
export const inPower = (b: Building) => BUILDINGS[b.type].grid === 'link' || POWERED(b);

export class PowerView {
  private objs: PixelObject[] = [];
  /** Geometries made for what is shown (the reach tiles), disposed with it. */
  private own: THREE.BufferGeometry[] = [];
  private key = '';
  private shownLabels: NetLabel[] = [];
  private readonly r: PixelRenderer;
  private readonly m: Models;

  private readonly lie: Lie;

  constructor(r: PixelRenderer, m: Models, lie: Lie) { this.r = r; this.m = m; this.lie = lie; }

  /** The labels to show over the networks drawn, in world space. */
  labels(): NetLabel[] { return this.shownLabels; }

  sync(s: GameState, f: PowerFocus) {
    const focus = f.focus !== null ? buildingById(s, f.focus) : null;
    const focusNet = focus && inPower(focus) ? (BUILDINGS[focus.type].grid === 'link' ? networks(s).of.get(focus.id) ?? null : networkOf(s, focus)) : null;
    const key = `${layoutOf(s)} ${reliefOf(s)} ${f.all} ${f.tiles} ${focus && inPower(focus) ? focus.id : ''} ${f.ghosts.map((g) => `${g.x},${g.y},${g.ok}`).join(';')}`;
    if (key === this.key) return;
    this.key = key;
    for (const o of this.objs) o.remove();
    this.objs = [];
    for (const g of this.own) g.dispose();
    this.own = [];
    this.shownLabels = [];
    const list = networks(s).list;
    const shown = f.all ? list : focusNet ? [focusNet] : [];
    if (f.tiles) this.reachTiles(s, f.ghosts);
    const top = this.m.buildings.pylon.height - PYLON_TOP;
    for (const net of shown) {
      const c = netColour(s, net);
      for (const [a, b] of wiresOf(net)) this.wire(c, a.x + 0.5, a.y + 0.5, b.x + 0.5, b.y + 0.5, top + this.at(s, a.x, a.y), top + this.at(s, b.x, b.y));
      for (const b of net.members) {
        const p = feederOf(s, b);
        if (p) this.feed(s, c, p.x + 0.5, p.y + 0.5, top + this.at(s, p.x, p.y), b);
      }
      const at = net.pylons.reduce((a, p) => ({ x: a.x + p.x + 0.5, z: a.z + p.y + 0.5, y: a.y + this.at(s, p.x, p.y) }), { x: 0, z: 0, y: 0 });
      this.shownLabels.push({ x: at.x / net.pylons.length, y: at.y / net.pylons.length + top + 0.9, z: at.z / net.pylons.length, colour: NET_COLOURS[c], net });
    }
    if (focus && BUILDINGS[focus.type].grid === 'link' && focusNet) this.ranges(s, netColour(s, focusNet), focus.x, focus.y);
    this.ghostLinks(s, f.ghosts, top);
  }

  /** Each network's reach on the ground in its colour (a tile in two networks' reach belongs to the first, like the rules). */
  private reachTiles(s: GameState, ghosts: PowerFocus['ghosts']) {
    const { width: w, height: h } = s.map, r = POWER.pylon.reach;
    const owner = new Map<number, THREE.Color>();
    // Pylons in the order the rules look at them (power.ts), so the first to reach a tile colours it.
    const of = networks(s).of;
    for (const p of s.buildings) {
      if (BUILDINGS[p.type].grid !== 'link') continue;
      const net = of.get(p.id);
      if (!net) continue; // a pylon under flood water is on no network
      const tint = TILE_TINTS[netColour(s, net)];
      for (let y = p.y - r; y <= p.y + r; y++) for (let x = p.x - r; x <= p.x + r; x++) {
        if (x >= 0 && y >= 0 && x < w && y < h && !owner.has(y * w + x)) owner.set(y * w + x, tint);
      }
    }
    for (const g of ghosts) {
      if (!g.ok) continue;
      for (let y = g.y - r; y <= g.y + r; y++) for (let x = g.x - r; x <= g.x + r; x++) {
        if (x >= 0 && y >= 0 && x < w && y < h && !owner.has(y * w + x)) owner.set(y * w + x, GHOST_TINT);
      }
    }
    // One object a tint.
    const byTint = new Map<THREE.Color, number[]>();
    for (const [i, tint] of owner) { const l = byTint.get(tint); if (l) l.push(i); else byTint.set(tint, [i]); }
    for (const [tint, list] of byTint) {
      const g = overlayTiles(this.lie, list, w, 0.02), o = this.r.addObject(g);
      o.tint = tint; o.tintStrength = TILE_STRENGTH; o.castShadow = false;
      o.setTransform(v.set(0, 0, 0), e.set(0, 0, 0));
      this.objs.push(o); this.own.push(g);
    }
  }

  /** A bar from a to b, `t` thick (and `h` tall; `t` when left out). */
  private bar(c: number, a: THREE.Vector3, b: THREE.Vector3, t: number, h = t, opacity = 1) {
    const len = dir.subVectors(b, a).length();
    if (len < 1e-4) return;
    q.setFromUnitVectors(X, dir.divideScalar(len));
    const o = this.r.addObject(this.m.wires[c]);
    o.castShadow = false;
    o.snap = false;
    o.opacity = opacity;
    o.setTransform(a, q, scale.set(len, h, t));
    this.objs.push(o);
  }

  /** The ground's height (m) under a one-tile building on a tile (a pylon). */
  private at(s: GameState, x: number, y: number) { return standY(this.lie, s.map, 1, x, y); }

  /** A wire between two pylon tops (at heights ta and tb), sagging a little in the middle. */
  private wire(c: number, ax: number, az: number, bx: number, bz: number, ta: number, tb: number) {
    const sag = Math.min(MAX_SAG, Math.hypot(bx - ax, bz - az) * SAG), n = 4;
    const at = (k: number) => new THREE.Vector3(ax + (bx - ax) * k, ta + (tb - ta) * k - sag * 4 * k * (1 - k), az + (bz - az) * k);
    for (let i = 0; i < n; i++) this.bar(c, at(i / n), at((i + 1) / n), WIRE);
  }

  /** A feed line from a pylon's top down to the building it powers. */
  private feed(s: GameState, c: number, px: number, pz: number, top: number, b: Building) {
    const n = sizeOf(b), h = Math.min(this.m.buildings[b.type].height * 0.7, 1.4) + standY(this.lie, s.map, n, b.x, b.y);
    this.bar(c, new THREE.Vector3(px, top, pz), new THREE.Vector3(b.x + n / 2, h, b.y + n / 2), FEED, FEED, FEED_OPACITY);
  }

  /** A pylon's reach (a square outline) and link range (a dashed circle), on the ground (a tile's length at a time, at its height). */
  private ranges(s: GameState, c: number, x: number, y: number) {
    const r = POWER.pylon.reach, lift = 0.05;
    const mark = (ax: number, az: number, bx: number, bz: number) => {
      const gy = this.lie.y((ax + bx) / 2, (az + bz) / 2) + lift;
      this.bar(c, new THREE.Vector3(ax, gy, az), new THREE.Vector3(bx, gy, bz), MARK, 0.02);
    };
    const corners = [[x - r, y - r], [x + r + 1, y - r], [x + r + 1, y + r + 1], [x - r, y + r + 1]];
    for (let i = 0; i < 4; i++) {
      const [ax, az] = corners[i], [bx, bz] = corners[(i + 1) % 4], len = Math.hypot(bx - ax, bz - az);
      for (let k = 0; k < len; k++) mark(ax + (bx - ax) * k / len, az + (bz - az) * k / len, ax + (bx - ax) * (k + 1) / len, az + (bz - az) * (k + 1) / len);
    }
    const n = 56, cx = x + 0.5, cz = y + 0.5, L = POWER.pylon.link;
    for (let i = 0; i < n; i += 2) {
      const a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2;
      mark(cx + Math.cos(a) * L, cz + Math.sin(a) * L, cx + Math.cos(b) * L, cz + Math.sin(b) * L);
    }
  }

  /**
   * Pylons being placed: their wires to the pylons they would link to (and to each other), feeds to the powered
   * buildings they would reach, and the last one's reach and link range.
   */
  private ghostLinks(s: GameState, ghosts: PowerFocus['ghosts'], top: number) {
    const ok = ghosts.filter((g) => g.ok);
    // A building joins the network of the first pylon that reaches it (power.ts), and new pylons come last: so a pylon
    // being placed feeds only buildings without a network yet, each from the first new pylon that reaches it.
    const fed = new Set<number>();
    ok.forEach((g, i) => {
      const gt = top + this.at(s, g.x, g.y);
      for (const p of pylonsInLink(s, g.x, g.y)) this.wire(GHOST, g.x + 0.5, g.y + 0.5, p.x + 0.5, p.y + 0.5, gt, top + this.at(s, p.x, p.y));
      const prev = ok[i - 1];
      if (prev && pylonsLink(prev.x, prev.y, g.x, g.y)) this.wire(GHOST, prev.x + 0.5, prev.y + 0.5, g.x + 0.5, g.y + 0.5, top + this.at(s, prev.x, prev.y), gt);
      for (const b of s.buildings) {
        if (!POWERED(b) || fed.has(b.id) || networkOf(s, b) || !pylonReaches(b, g.x, g.y)) continue;
        fed.add(b.id);
        this.feed(s, GHOST, g.x + 0.5, g.y + 0.5, gt, b);
      }
    });
    const last = ghosts[ghosts.length - 1];
    if (last) this.ranges(s, GHOST, last.x, last.y);
  }
}

