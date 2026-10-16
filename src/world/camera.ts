import * as THREE from 'three';
import type { PixelRenderer } from 'pixel3d-renderer';
import type { SettingsStore } from '../ui/settings.ts';

// The camera: where the view looks, how far in it is, which of the four views it turns to, and the maths between the page and
// the ground. It is orthographic at a 30° pitch, turns between four views 90° apart, zooms towards the pointer and pans. It
// knows the map only by its size (to keep the target on it); the game state is not its business.

/** The zoom range, as screen pixels per metre of ground, and where a commission starts. */
const MIN_ZOOM = 16, MAX_ZOOM = 96, START_ZOOM = 32;
/** How much one wheel notch or key press zooms. */
const ZOOM_STEP = 1.25;
const ELEVATION = THREE.MathUtils.degToRad(30);
const HOME_YAW = THREE.MathUtils.degToRad(45);
const ZOOM_RATE = 14;               // how fast the zoom eases towards its level (per second, in log space)
const TURN_SECONDS = 0.3;

export class Camera {
  private readonly target: THREE.Vector3;
  private view4 = 0;
  /** Screen pixels per art pixel: the pixel size setting. */
  private pixelSize: number;
  /** The zoom, as screen pixels per metre of ground: `zoom` eases towards `zoomGoal`. */
  private zoom = START_ZOOM;
  private zoomGoal = START_ZOOM;
  /** While zooming towards the pointer: the ground point that stays under it, and where the pointer is from the centre. */
  private zoomAnchor: { ground: THREE.Vector3; dx: number; dy: number } | null = null;
  private yaw = HOME_YAW;
  private turnFrom = HOME_YAW;
  private turnAt = -Infinity;
  /** The loop's time as of the last update, which a turn starts from. */
  private time = 0;
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  /** A world point's place on the page. */
  private readonly projected = new THREE.Vector3();
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly hit = new THREE.Vector3();

  private readonly renderer: PixelRenderer;
  private readonly canvas: HTMLCanvasElement;
  private readonly map: { width: number; height: number };
  private readonly changed: () => void;

  /** `start` is the ground point first looked at; `changed` is called whenever what is under a point of the page may have changed. */
  constructor(
    renderer: PixelRenderer,
    canvas: HTMLCanvasElement,
    settings: SettingsStore,
    map: { width: number; height: number },
    start: { x: number; z: number },
    changed: () => void,
  ) {
    this.renderer = renderer; this.canvas = canvas; this.map = map; this.changed = changed;
    this.target = new THREE.Vector3(start.x, 0, start.z);
    this.pixelSize = settings.get().pixelSize;
    settings.listen((st) => { if (st.pixelSize !== this.pixelSize) { this.pixelSize = st.pixelSize; this.fit(); } });
    addEventListener('resize', () => this.fit());
    this.fit();
  }

  private cameraAxes() { this.forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)); this.right.set(-this.forward.z, 0, this.forward.x); }
  turn(dir: 1 | -1) { this.view4 += dir; this.turnFrom = this.yaw; this.turnAt = this.time; this.changed(); }
  private turning() {
    const k = Math.min(1, (this.time - this.turnAt) / TURN_SECONDS);
    const next = this.turnFrom + (HOME_YAW + this.view4 * Math.PI / 2 - this.turnFrom) * (1 - (1 - k) ** 3);
    if (next !== this.yaw) this.changed();
    this.yaw = next;
  }
  pan(dx: number, dy: number) {
    this.cameraAxes();
    const metres = 1 / this.zoom;
    const before = this.target.clone();
    this.target.addScaledVector(this.right, -dx * metres).addScaledVector(this.forward, dy * metres / Math.sin(ELEVATION));
    this.clampTarget();
    // A pan during a zoom carries the zoom's anchor along, so the two don't fight.
    if (this.zoomAnchor) this.zoomAnchor.ground.add(this.target.clone().sub(before));
    this.changed();
  }
  private clampTarget() {
    this.target.x = THREE.MathUtils.clamp(this.target.x, 0, this.map.width);
    this.target.z = THREE.MathUtils.clamp(this.target.z, 0, this.map.height);
  }
  /** Points the camera at a ground point, optionally at a zoom (screen pixels per metre, reached at once). */
  lookAt(x: number, z: number, zoom?: number) {
    this.target.set(x, 0, z); this.clampTarget();
    if (zoom) { this.setZoom(zoom); this.zoom = this.zoomGoal; }
    this.changed();
  }
  /** Zooms in (+1) or out (−1) by one step. */
  zoomStep(dir: number, at?: { x: number; y: number }) { this.setZoom(this.zoomGoal * ZOOM_STEP ** dir, at); }
  /** Zooms to `goal` screen pixels per metre, keeping the ground under the page point `at` (the pointer) where it is; the centre without one. */
  setZoom(goal: number, at?: { x: number; y: number }) {
    goal = THREE.MathUtils.clamp(goal, MIN_ZOOM, MAX_ZOOM);
    if (goal === this.zoomGoal) return;
    this.zoomGoal = goal;
    // The ground under the point, from where the camera is now (target, turn and zoom), not from the last picture drawn:
    // several wheel events can arrive before the next frame.
    if (at) {
      const dx = at.x - innerWidth / 2, dy = at.y - innerHeight / 2, metres = 1 / this.zoom;
      this.cameraAxes();
      const ground = this.target.clone().addScaledVector(this.right, dx * metres).addScaledVector(this.forward, -dy * metres / Math.sin(ELEVATION));
      this.zoomAnchor = { ground, dx, dy };
    } else this.zoomAnchor = null;
  }
  /** One frame of the zoom easing towards its goal. */
  private zooming(dt: number) {
    if (this.zoom === this.zoomGoal) return;
    const k = 1 - Math.exp(-dt * ZOOM_RATE);
    this.zoom = Math.exp(Math.log(this.zoom) + Math.log(this.zoomGoal / this.zoom) * k);
    if (Math.abs(Math.log(this.zoomGoal / this.zoom)) < 0.004) this.zoom = this.zoomGoal;
    if (this.zoomAnchor) {
      this.cameraAxes();
      const metres = 1 / this.zoom;
      this.target.copy(this.zoomAnchor.ground).addScaledVector(this.right, -this.zoomAnchor.dx * metres).addScaledVector(this.forward, this.zoomAnchor.dy * metres / Math.sin(ELEVATION));
      this.clampTarget();
    }
    if (this.zoom === this.zoomGoal) this.zoomAnchor = null;
    this.changed();
  }
  /** Sizes the art (render target) for the window at the pixel size, and lays the canvas out centred on the window. */
  fit() {
    const { renderer, canvas, pixelSize } = this;
    const w = Math.max(1, Math.ceil(innerWidth / pixelSize)), h = Math.max(1, Math.ceil(innerHeight / pixelSize));
    if (renderer.width !== w || renderer.height !== h) renderer.resize(w, h);
    const cw = w * pixelSize, ch = h * pixelSize;
    canvas.style.width = `${cw}px`; canvas.style.height = `${ch}px`;
    canvas.style.left = `${Math.floor((innerWidth - cw) / 2)}px`; canvas.style.top = `${Math.floor((innerHeight - ch) / 2)}px`;
    this.changed();
  }

  /** One frame: the turn and the zoom ease on (`time` is the loop's, `dt` the frame's seconds) and the renderer's camera is placed. */
  update(time: number, dt: number) {
    this.time = time;
    this.turning();
    this.zooming(dt);
    // The view is as tall as the art at the zoom's screen pixels per metre.
    this.renderer.placeCamera(this.target, this.yaw, ELEVATION, this.renderer.height * this.pixelSize / this.zoom);
  }

  /** A world point's place on the page. */
  toScreen(x: number, y: number, z: number) {
    const rect = this.canvas.getBoundingClientRect();
    this.projected.set(x, y, z).project(this.renderer.camera);
    return { sx: rect.left + (this.projected.x + 1) / 2 * rect.width, sy: rect.top + (1 - this.projected.y) / 2 * rect.height };
  }

  /** The point on the ground plane under a point of the page. */
  groundAt(x: number, y: number): THREE.Vector3 | null {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.set((x - rect.left) / rect.width * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    this.renderer.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.ndc, this.renderer.camera);
    return this.raycaster.ray.intersectPlane(this.ground, this.hit) ? this.hit.clone() : null;
  }
  /**
   * The map tile under a point of the page, on the ground (whatever stands there): the first place the line of sight meets
   * the ground's height `ground` (metres at a point, never above `top`), so a cliff face picks the tile on top of it.
   */
  tileAt(x: number, y: number, ground: (x: number, z: number) => number = () => 0, top = 0): { x: number; y: number } | null {
    if (!this.groundAt(x, y)) return null;
    const ray = this.raycaster.ray, o = ray.origin, d = ray.direction;
    if (d.y > -1e-6) return null;
    // From where the ray is at `top`, in steps a tenth of a tile across the ground, to where it meets it; then halve in on it.
    const k = (t: number) => o.y + d.y * t - ground(o.x + d.x * t, o.z + d.z * t);
    let t0 = (o.y - top) / -d.y;
    const step = 0.1 / Math.max(1e-6, Math.hypot(d.x, d.z)), end = o.y / -d.y + step;
    let t1 = t0;
    while (t1 < end && k(t1) > 0) { t0 = t1; t1 += step; }
    for (let i = 0; i < 12; i++) { const m = (t0 + t1) / 2; if (k(m) > 0) t0 = m; else t1 = m; }
    const t = { x: Math.floor(o.x + d.x * t1), y: Math.floor(o.z + d.z * t1) };
    return t.x >= 0 && t.y >= 0 && t.x < this.map.width && t.y < this.map.height ? t : null;
  }
}
