// The game's tools on the picture: what the player is about to do, drawn over the valley before they do it. A ghost of the
// thing being placed (brush3d's preview: green where it fits, red where it doesn't), the rill being dragged with the water
// the rules say it would carry (cool blue where it flows, warm amber dashes past the sill where it runs dry, a ring at the
// sill), a field brush's circle, a track's, a hedge's or a tree's outline, the contour lines while digging, the
// ground's moisture glow while painting fields, and the power as the game's state has it (state.power): wires sagging
// between pylons (pylons mode, always: they're real) or each power building's soft wireless radius (wireless mode, while
// placing power or asked).
import type * as THREE from 'three';
import { type BrushRenderer, type Line, type LinePoint, OVERLAY_LOOK, OVERLAY_NONE, type Overlay } from '../../brush3d/src/index.ts';
import {
  CATALOG, canPlace, canPlant, canTrack, type GameState, padTarget, type Point2, previewChannelFlow, type ThingKind, trackPath,
  type TreeSpecies, VALLEY_HALF,
} from '../game/index.ts';
import type { Things } from './things.ts';

/** What the player is about to do, for the world to draw. Where `fits` is left out, the world asks the game's rules. */
export type PreviewSpec =
  | { kind: 'thing'; thingKind: ThingKind; x: number; z: number; yaw: number; fits?: boolean; ignore?: number }
  | { kind: 'channel'; points: Point2[] }
  | { kind: 'field'; x: number; z: number; radius: number; erase?: boolean; fits?: boolean }
  | { kind: 'track'; points: Point2[]; fits?: boolean }
  | { kind: 'hedge'; points: Point2[]; fits?: boolean }
  | { kind: 'tree'; x: number; z: number; species?: TreeSpecies; fits?: boolean };

/** The tools' colours (sRGB). */
const COL = {
  wet: 0x5fb8e8, dry: 0xd8a860, sill: 0xf0b25a, fits: 0x9dffc0, blocked: 0xff6a50, field: 0xf3e3a0, erase: 0xff9a7a,
  track: 0xead7a6, hedge: 0x7cc46a, wire: 0x3b2f27, ring: 0x9fd8ff, ringOff: 0xd9c6a0, link: 0xffe3a0,
};

/** A circle of points on the land. */
function circle(x: number, z: number, radius: number, n = 48): LinePoint[] {
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return { x: x + Math.cos(a) * radius, z: z + Math.sin(a) * radius }; });
}

export class Tools {
  private readonly r: BrushRenderer;
  private state: GameState;
  private readonly things: Things;
  private spec: PreviewSpec | null = null;
  private ghost: { kind: ThingKind; mesh: THREE.Mesh } | null = null;
  private contours = false;
  private moisture = false;
  private showPower = false;

  constructor(r: BrushRenderer, state: GameState, things: Things) {
    this.r = r; this.state = state; this.things = things;
    this.drawPower();
  }

  reset(state: GameState) {
    this.state = state;
    this.refresh();
  }

  setPreview(spec: PreviewSpec | null) {
    this.spec = spec;
    this.drawPreview();
    this.drawPower();
  }

  setContours(on: boolean) {
    this.contours = on;
    const g = this.state.grid;
    this.r.setGrid(on ? { width: g.nx, height: g.nz, tile: g.cell, x0: g.x0, z0: g.z0, level: 0.25, gridStrength: 0, contourStrength: 0.55 } : null);
  }

  setMoisture(on: boolean) {
    this.moisture = on;
    this.drawMoisture();
  }

  setShowPower(on: boolean) { this.showPower = on; this.drawPower(); }

  /** After an edit: what the tools show may have changed with the state (the rules' answers, the wet, the power). */
  refresh() {
    this.drawPreview();
    this.drawPower();
    if (this.moisture) this.drawMoisture();
    if (this.contours) this.setContours(true);
  }

  dispose() {
    this.dropGhost();
    this.r.setLines(null, 'tool');
    this.r.setLines(null, 'power');
    this.r.setGrid(null);
    this.r.setOverlay(null);
  }

  // ---- Drawing ----

  private dropGhost() {
    if (!this.ghost) return;
    // The ghost's geometry is the things' cache (Things.ghost), freed with it.
    this.r.removePreview(this.ghost.mesh);
    this.ghost = null;
  }

  private drawPreview() {
    const spec = this.spec, s = this.state;
    if (spec?.kind !== 'thing') this.dropGhost();
    if (!spec) { this.r.setLines(null, 'tool'); return; }
    const lines: Line[] = [];
    switch (spec.kind) {
      case 'thing': {
        const fits = spec.fits ?? canPlace(s, spec.thingKind, spec.x, spec.z, spec.yaw, spec.ignore).ok;
        if (this.ghost?.kind !== spec.thingKind) {
          this.dropGhost();
          this.ghost = { kind: spec.thingKind, mesh: this.r.addPreview(this.things.ghost(spec.thingKind), fits ? 'fits' : 'blocked') };
        }
        const m = this.ghost.mesh, def = CATALOG[spec.thingKind];
        const y = def.padEase > 0 ? padTarget(s.grid, { kind: spec.thingKind, x: spec.x, z: spec.z, yaw: spec.yaw }) : this.r.landAt(spec.x, spec.z);
        m.position.set(spec.x, y, spec.z);
        m.rotation.set(0, spec.yaw, 0);
        m.updateMatrixWorld();
        this.r.setPreview(m, fits ? 'fits' : 'blocked');
        lines.push(...this.prospectiveLinks(spec.thingKind, spec.x, spec.z, y, spec.ignore));
        break;
      }
      case 'channel': {
        if (spec.points.length < 2) break;
        const p = previewChannelFlow(s, spec.points);
        // The rill in runs: blue where water would flow, amber dashes where it would stand dry.
        let run: LinePoint[] = [], wet: boolean | null = null;
        const flush = () => {
          if (run.length >= 2 && wet !== null) lines.push(wet ? { points: run, color: COL.wet, style: 'route', width: 1.3, opacity: 0.85 } : { points: run, color: COL.dry, style: 'dashed', width: 1.1, opacity: 0.9 });
        };
        for (const sm of p.samples) {
          if (wet !== null && sm.wet !== wet) { const last = run[run.length - 1]; flush(); run = last ? [last] : []; }
          wet = sm.wet;
          run.push({ x: sm.x, z: sm.z });
        }
        flush();
        if (p.sillPoint) lines.push({ points: circle(p.sillPoint.x, p.sillPoint.z, 0.9, 24), color: COL.sill, style: 'route', width: 0.22, opacity: 0.95, closed: true });
        break;
      }
      case 'field': {
        const ok = spec.fits ?? true;
        lines.push({ points: circle(spec.x, spec.z, spec.radius), color: !ok ? COL.blocked : spec.erase ? COL.erase : COL.field, style: 'dashed', width: 0.2, opacity: 0.95, closed: true });
        break;
      }
      case 'track': {
        if (spec.points.length < 2) break;
        const path = trackPath(spec.points), ok = spec.fits ?? canTrack(s, path).ok;
        lines.push({ points: path.map((q) => ({ x: q.x, z: q.z })), color: ok ? COL.track : COL.blocked, style: 'route', width: 1.8, opacity: 0.7 });
        break;
      }
      case 'hedge': {
        if (spec.points.length < 2) break;
        const path = trackPath(spec.points), ok = spec.fits ?? true;
        lines.push({ points: path.map((q) => ({ x: q.x, z: q.z })), color: ok ? COL.hedge : COL.blocked, style: 'route', width: 1.4, opacity: 0.7 });
        break;
      }
      case 'tree': {
        const ok = spec.fits ?? canPlant(s, spec.x, spec.z).ok;
        lines.push({ points: circle(spec.x, spec.z, 1.2, 28), color: ok ? COL.fits : COL.blocked, style: 'route', width: 0.2, opacity: 0.95, closed: true });
        lines.push({ points: circle(spec.x, spec.z, 0.25, 12), color: ok ? COL.fits : COL.blocked, style: 'route', width: 0.25, opacity: 0.95, closed: true });
        break;
      }
    }
    this.r.setLines(lines.length ? lines : null, 'tool');
  }

  /**
   * What a thing being placed would join: in pylons mode a dashed wire to each powered neighbour within reach; in
   * wireless mode its own field's ring, if it makes or passes one.
   */
  private prospectiveLinks(kind: ThingKind, x: number, z: number, y: number, ignore?: number): Line[] {
    const def = CATALOG[kind], role = def.powerRole;
    if (role === 'none') return [];
    if (this.state.power.mode === 'wireless') {
      return def.powerRange > 0 && role !== 'load' && role !== 'pylon' ? [{ points: circle(x, z, def.powerRange, 64), color: COL.ring, style: 'dashed', width: 0.3, opacity: 0.8, closed: true }] : [];
    }
    if (role === 'relay') return [];
    const out: Line[] = [], top = { x, y: y + def.wireY, z };
    for (const t of this.state.things) {
      if (t.id === ignore) continue;
      const other = CATALOG[t.kind];
      if (other.powerRole === 'none' || other.powerRole === 'relay') continue;
      const d = Math.hypot(t.x - x, t.z - z);
      if (d > Math.max(def.powerRange, other.powerRange) || d < 0.5) continue;
      out.push({ points: [top, { x: t.x, y: this.r.landAt(t.x, t.z) + other.wireY, z: t.z }], color: COL.link, style: 'dashed', width: 0.12, opacity: 0.85 });
    }
    return out;
  }

  /** The power as the game has it: wires in pylons mode; in wireless mode, the fields' rings while they're wanted. */
  private drawPower() {
    const p = this.state.power, lines: Line[] = [];
    if (p.mode === 'pylons') {
      for (const span of p.spans) lines.push({ points: [span.a, span.b], color: COL.wire, style: 'wire', width: 0.05, opacity: 0.95 });
    } else if (this.showPower || this.placingPower()) {
      for (const f of p.radii) lines.push({ points: circle(f.x, f.z, f.radius, 64), color: f.powered ? COL.ring : COL.ringOff, style: 'dashed', width: 0.3, opacity: f.powered ? 0.85 : 0.6, closed: true });
    }
    this.r.setLines(lines.length ? lines : null, 'power');
  }

  private placingPower() {
    const s = this.spec;
    return s?.kind === 'thing' && CATALOG[s.thingKind].powerRole !== 'none';
  }

  /** The ground's moisture as a soft blue glow over the valley (no lines between cells), while fields are being painted. */
  private drawMoisture() {
    if (!this.moisture) { this.r.setOverlay(null); this.r.setOverlayLook(); return; }
    const g = this.state.grid, color = new Uint32Array(g.nx * g.nz).fill(OVERLAY_NONE);
    for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
      const x = g.x0 + (ix + 0.5) * g.cell, z = g.z0 + (iz + 0.5) * g.cell, k = iz * g.nx + ix;
      if (Math.abs(x) > VALLEY_HALF || Math.abs(z) > VALLEY_HALF) continue;
      const m = g.moisture[k];
      if (m < 0.04) continue;
      // From a pale sky blue to a deep pool blue as it wets.
      const t = Math.min(1, m), r = Math.round(0xb8 + (0x2e - 0xb8) * t), gg = Math.round(0xe0 + (0x86 - 0xe0) * t), b = Math.round(0xf4 + (0xd8 - 0xf4) * t);
      color[k] = (r << 16) | (gg << 8) | b;
    }
    const overlay: Overlay = { width: g.nx, height: g.nz, tile: g.cell, x0: g.x0, z0: g.z0, color, strength: 0.45 };
    this.r.setOverlayLook({ ...OVERLAY_LOOK, edge: 0 });
    this.r.setOverlay(overlay);
  }
}
