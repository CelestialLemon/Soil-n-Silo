// The camera: an orthographic three-quarter view (brush3d's 30° pitch) the game steers with its own controller and places
// on brush3d's view each frame (ViewCamera.place). It turns in one of two ways, a Milestone 1 preview choice (?yaw=):
// `snap`, the four cardinal views 90° apart with a damped turn between them (Q/E), or `orbit`, a free smooth turn (a
// held Q/E, or a drag). Zoom eases towards its goal and keeps the ground under the pointer where it was; panning moves
// the ground with the pointer; both stay within the valley.
import { type BrushRenderer, PITCH } from '../../brush3d/src/index.ts';
import { clamp, VALLEY_HALF, wrapAngle } from '../game/index.ts';
import type { YawMode } from './options.ts';

/** The zoom's range (CSS pixels a metre): from the whole valley to a close look at a bench. */
export const ZOOM_MIN = 16, ZOOM_MAX = 96;
/** Where the camera starts: zoomed to the homestead, looking from the first of the four views. */
export const START_ZOOM = 34, START_HEADING = Math.PI / 4;
/** How far from the valley's middle the view's middle may go (m). */
const PAN_LIMIT = VALLEY_HALF;
/** How fast each ease closes (1/s): the turn, the zoom, a glide to a place, the ground's height under the view. */
const TURN_RATE = 9, ZOOM_RATE = 14, GLIDE_RATE = 6, LIFT_RATE = 5;
/** A held Q or E in orbit mode turns this fast (rad/s). */
const ORBIT_SPEED = 1.5;

const QUARTER = Math.PI / 2;
/** The nearest of the four views' headings (45° + 90° n) to a heading. */
const nearestView = (h: number) => Math.PI / 4 + Math.round((h - Math.PI / 4) / QUARTER) * QUARTER;
/** Brings `a` round to within half a turn of `b`. */
const near = (a: number, b: number) => b + wrapAngle(a - b);
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export class CameraRig {
  x: number; z: number;
  /** The ground's height under the view's middle, eased so the view doesn't jump over a bank. */
  private y = 0;
  zoom = START_ZOOM;
  heading = START_HEADING;
  private goalZoom = START_ZOOM;
  private goalHeading = START_HEADING;
  /** Where the pointer was for the zoom under way (CSS pixels from the screen's middle), so the ground there stays put. */
  private anchor = { x: 0, y: 0 };
  private glide: { x: number; z: number } | null = null;
  private hold = 0;
  mode: YawMode;

  constructor(x: number, z: number, mode: YawMode) {
    this.x = x; this.z = z; this.mode = mode;
  }

  /** Puts the view at once where it's going: no ease (a new valley, the first frame). */
  settle(r: BrushRenderer) {
    this.zoom = this.goalZoom; this.heading = this.goalHeading;
    if (this.glide) { this.x = this.glide.x; this.z = this.glide.z; this.glide = null; }
    this.y = r.landAt(this.x, this.z);
  }

  setMode(mode: YawMode) {
    this.mode = mode;
    if (mode === 'snap') { this.hold = 0; this.goalHeading = nearestView(this.goalHeading); }
  }

  /** Turns a view (snap: 90° to the next cardinal view; orbit: 45° on). */
  stepYaw(dir: -1 | 1) {
    if (this.mode === 'snap') this.goalHeading = nearestView(this.goalHeading) + dir * QUARTER;
    else this.goalHeading += dir * (Math.PI / 4);
  }

  /** Orbit mode: turns by an angle (a drag). In snap mode it's a turn to the view nearest where it would end. */
  orbitBy(delta: number) {
    if (this.mode === 'orbit') { this.goalHeading += delta; this.heading += delta; }
    else if (Math.abs(delta) >= Math.PI / 4) this.goalHeading = nearestView(this.goalHeading + delta);
  }

  /** Orbit mode: keeps turning while Q (-1) or E (1) is held; 0 stops. In snap mode, nothing (stepYaw turns it). */
  setOrbitHold(dir: -1 | 0 | 1) { this.hold = this.mode === 'orbit' ? dir : 0; }

  /** Moves the view by screen pixels (a drag): the ground under the pointer moves with it. */
  panByScreen(dx: number, dy: number) {
    const c = Math.cos(this.heading), s = Math.sin(this.heading), k = 1 / this.zoom, f = k / Math.sin(PITCH);
    this.panByWorld(-dx * k * c - dy * f * s, dx * k * s - dy * f * c);
  }

  /** Moves the view by metres over the ground (the keyboard's pan, along the screen's axes as the game works them out). */
  panByWorld(dx: number, dz: number) {
    this.glide = null;
    this.x = clamp(this.x + dx, -PAN_LIMIT, PAN_LIMIT);
    this.z = clamp(this.z + dz, -PAN_LIMIT, PAN_LIMIT);
  }

  /** The screen's right and its up, as directions over the ground (for keyboard panning). */
  axes() {
    const c = Math.cos(this.heading), s = Math.sin(this.heading);
    return { right: { x: c, z: -s }, up: { x: -s, z: -c } };
  }

  /**
   * Zooms by a factor (over 1 in), easing to it, keeping the ground under the pointer (CSS pixels from the screen's middle;
   * left out, the middle) where it was.
   */
  zoomBy(factor: number, anchorX = 0, anchorY = 0) {
    this.goalZoom = clamp(this.goalZoom * factor, ZOOM_MIN, ZOOM_MAX);
    this.anchor = { x: anchorX, y: anchorY };
  }

  /** Glides the view to a place (and a zoom). */
  focusOn(x: number, z: number, zoom?: number) {
    this.glide = { x: clamp(x, -PAN_LIMIT, PAN_LIMIT), z: clamp(z, -PAN_LIMIT, PAN_LIMIT) };
    if (zoom !== undefined) { this.goalZoom = clamp(zoom, ZOOM_MIN, ZOOM_MAX); this.anchor = { x: 0, y: 0 }; }
  }

  /** Eases the turn, the zoom and any glide on by `dt` seconds, and places brush3d's view. Returns whether it moved. */
  update(r: BrushRenderer, dt: number): boolean {
    const was = { x: this.x, z: this.z, zoom: this.zoom, heading: this.heading };
    if (this.hold !== 0) this.goalHeading += this.hold * ORBIT_SPEED * dt;
    this.goalHeading = near(this.goalHeading, this.heading);
    const dh = this.goalHeading - this.heading;
    this.heading = Math.abs(dh) < 1e-4 ? this.goalHeading : this.heading + dh * ease(TURN_RATE, dt);
    if (Math.abs(this.heading) > 4 * Math.PI) { const w = wrapAngle(this.heading); this.goalHeading += w - this.heading; this.heading = w; }
    const dz = this.goalZoom - this.zoom;
    if (dz !== 0) {
      const next = Math.abs(dz) < 1e-3 ? this.goalZoom : this.zoom + dz * ease(ZOOM_RATE, dt);
      // The ground under the anchor stays put: it was anchor / zoom from the middle, and is to be at the same place.
      const k = 1 / this.zoom - 1 / next, c = Math.cos(this.heading), s = Math.sin(this.heading), f = k / Math.sin(PITCH);
      const ax = this.anchor.x, ay = this.anchor.y;
      this.zoom = next;
      this.x = clamp(this.x + ax * k * c + ay * f * s, -PAN_LIMIT, PAN_LIMIT);
      this.z = clamp(this.z - ax * k * s + ay * f * c, -PAN_LIMIT, PAN_LIMIT);
    }
    if (this.glide) {
      const t = ease(GLIDE_RATE, dt);
      this.x += (this.glide.x - this.x) * t; this.z += (this.glide.z - this.z) * t;
      if (Math.hypot(this.glide.x - this.x, this.glide.z - this.z) < 0.01) { this.x = this.glide.x; this.z = this.glide.z; this.glide = null; }
    }
    this.y += (r.landAt(this.x, this.z) - this.y) * ease(LIFT_RATE, dt);
    this.place(r);
    return was.x !== this.x || was.z !== this.z || was.zoom !== this.zoom || was.heading !== this.heading;
  }

  /** Places brush3d's view as the rig is now. */
  place(r: BrushRenderer) {
    r.view.place({ x: this.x, y: this.y, z: this.z, heading: this.heading, zoom: this.zoom });
  }

  /** The heading the view is turning to. */
  get targetHeading() { return this.goalHeading; }
}
