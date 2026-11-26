// The game's tools on the picture: what the player is about to do, drawn over the valley before they do it. A ghost of the
// thing being placed (brush3d's preview: green where it fits, red where it doesn't), the rill being dragged with the water
// the rules say it would carry (cool blue where it flows, warm amber dashes past the sill where it runs dry, a ring at the
// sill), a field brush's circle, a track's, a hedge's or a tree's outline, the contour lines while digging, the
// ground's moisture glow while painting fields, and the power as the game's state has it (state.power), or would have
// with the power building or relay in hand put down (previewPower): each power building's and relay's soft wireless
// field, a calm thin ring on the grass, only when the play layer asks for them (the power view, or a power building or
// relay in hand or picked; power is wireless: no lines run anywhere).
import type * as THREE from 'three';
import { type BrushRenderer, type Line, type LinePoint, OVERLAY_LOOK, OVERLAY_NONE, type Overlay } from '../../brush3d/src/index.ts';
import {
  hasServiceRadius, SERVICE_RADIUS, CATALOG, canPlace, canPlant, canTrack, type ChannelPreview, type GameState, padTarget, type Point2, type PowerRadius, previewChannelFlow,
  previewPower, type ThingKind, trackPath, type TreeSpecies, VALLEY_HALF,
} from '../game/index.ts';
import type { Things } from './things.ts';

/**
 * What the player is about to do, for the world to draw. Where `fits` is left out, the world asks the game's rules; a
 * rill's `preview`, where given, is the water the rules already worked out for these points (the world solves it itself
 * otherwise, and again whenever the valley changes under it).
 */
export type PreviewSpec =
  | { kind: 'thing'; thingKind: ThingKind; x: number; z: number; yaw: number; fits?: boolean; ignore?: number }
  | { kind: 'channel'; points: Point2[]; preview?: ChannelPreview }
  | { kind: 'field'; x: number; z: number; radius: number; erase?: boolean; fits?: boolean }
  | { kind: 'track'; points: Point2[]; fits?: boolean }
  | { kind: 'hedge'; points: Point2[]; fits?: boolean }
  | { kind: 'tree'; x: number; z: number; species?: TreeSpecies; fits?: boolean };

/** The tools' colours (sRGB). */
const COL = {
  wet: 0x5fb8e8, dry: 0xd8a860, sill: 0xf0b25a, fits: 0x9dffc0, blocked: 0xff6a50, field: 0xf3e3a0, erase: 0xff9a7a,
  track: 0xead7a6, hedge: 0x7cc46a, ring: 0xa8dcf5, ringOff: 0xdcc9a2,
};

/** A wireless field's ring: a thin, quiet line in the sky's blue where it carries power, sand-coloured dashes where not. */
const fieldRing = (x: number, z: number, radius: number, powered: boolean): Line =>
  powered
    ? { points: circle(x, z, radius, 72), color: COL.ring, style: 'route', width: 0.16, opacity: 0.6, closed: true }
    : { points: circle(x, z, radius, 72), color: COL.ringOff, style: 'dashed', width: 0.18, opacity: 0.5, closed: true };

/** A circle of points on the land. */
function circle(x: number, z: number, radius: number, n = 48): LinePoint[] {
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return { x: x + Math.cos(a) * radius, z: z + Math.sin(a) * radius }; });
}

export class Tools {
  private readonly r: BrushRenderer;
  private state: GameState;
  private readonly things: Things;
  private selected: number | null = null;
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

  setSelected(id: number | null) {
    this.selected = id;
    this.drawPreview();
  }

  setPreview(spec: PreviewSpec | null) {
    this.spec = spec;
    this.drawPreview();
    this.drawPower();
  }

  setContours(on: boolean) {
    this.contours = on;
    const g = this.state.grid;
    // A contour each 20 cm: on the valley's steady fall (about 5 cm a metre) they lie 3 to 5 m apart, close enough to read
    // the fall away from the brook at a glance, soft enough to leave the meadow's grass showing.
    this.r.setGrid(on ? { width: g.nx, height: g.nz, tile: g.cell, x0: g.x0, z0: g.z0, level: 0.2, gridStrength: 0, contourStrength: 0.5 } : null);
  }

  setMoisture(on: boolean) {
    this.moisture = on;
    this.drawMoisture();
  }

  setShowPower(on: boolean) { this.showPower = on; this.drawPower(); }

  /** After an edit: what the tools show may have changed with the state (the rules' answers, the wet, the power). */
  refresh() {
    // The valley changed: a rill's preview worked out before it is stale.
    if (this.spec?.kind === 'channel' && this.spec.preview) this.spec = { ...this.spec, preview: undefined };
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
    const lines: Line[] = [];
    const site = spec?.kind === 'thing' ? { kind: spec.thingKind, x: spec.x, z: spec.z }
      : !spec && s.things.find(t => t.id === this.selected);
    if (site && hasServiceRadius(site.kind))
      lines.push({ points: circle(site.x, site.z, SERVICE_RADIUS[site.kind]), closed: true, color: site.kind === 'beehive' ? 0xe8be66 : COL.wet, style: 'route', width: 0.15, opacity: 0.55 });
    if (!spec) { this.r.setLines(lines.length ? lines : null, 'tool'); return; }
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
        const field = this.prospectiveField();
        if (field) lines.push(fieldRing(field.x, field.z, field.radius, field.powered));
        break;
      }
      case 'channel': {
        if (spec.points.length < 2) break;
        const p = spec.preview ?? previewChannelFlow(s, spec.points);
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
   * The fields as they would stand with the thing in hand put down where it is (a moved thing taken from its old spot), so
   * every ring, the one in hand and those that lean on it, shows the network it would leave: null when no thing is in hand
   * or it neither makes a field nor moves one. `id` is the one in hand's entry.
   */
  private prospectivePower(): { radii: PowerRadius[]; id: number } | null {
    const spec = this.spec;
    if (spec?.kind !== 'thing') return null;
    const def = CATALOG[spec.thingKind];
    if (def.powerRole === 'none' || def.powerRole === 'load' || def.powerRange <= 0) return null;
    const { power, id } = previewPower(this.state, { kind: spec.thingKind, x: spec.x, z: spec.z, ignore: spec.ignore });
    return { radii: power.radii, id };
  }

  /** The field the power building or relay in hand would project at its spot: carrying power (blue) or waiting (sand). */
  private prospectiveField(): PowerRadius | null {
    const p = this.prospectivePower();
    return p?.radii.find((f) => f.id === p.id) ?? null;
  }

  /**
   * The power as the game has it: each field's ring, only while asked for (`setShowPower`). With a power building or
   * relay in hand, as it would be once put down there (the one in hand's own ring is the tool's).
   */
  private drawPower() {
    const lines: Line[] = [];
    if (this.showPower) {
      const p = this.prospectivePower();
      const moving = this.spec?.kind === 'thing' ? this.spec.ignore : undefined;
      const radii = p?.radii ?? this.state.power.radii, skip = p?.id ?? moving;
      for (const f of radii) if (f.id !== skip) lines.push(fieldRing(f.x, f.z, f.radius, f.powered));
    }
    this.r.setLines(lines.length ? lines : null, 'power');
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
