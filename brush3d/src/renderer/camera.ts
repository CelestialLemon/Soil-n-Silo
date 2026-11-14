import * as THREE from 'three';

// The game's camera: orthographic, a 3/4 view pitched 30° down, four views 90° apart, zoom as screen pixels per metre.
// The demo drives it itself (turn, pan, update); the game keeps its own controller and places it each frame (place), and
// asks it where a point of the world is on the page (toScreen) and what's under the pointer (rayAt), in CSS pixels.

export const PITCH = THREE.MathUtils.degToRad(30);
export const MIN_ZOOM = 16, MAX_ZOOM = 192;
/**
 * How far the camera sits from its target along the view, at least (orthographic, so this only has to clear the scene).
 * A view wider than the demo's (the game's, zoomed out: down to 4 px a metre) sits further back, so the land at the
 * bottom of the screen isn't cut off by the camera, nor that at the top by how far it sees (apply).
 */
export const CAMERA_DISTANCE = 120;
/**
 * How high above the target the view sees at the bottom of the screen, at least (the demo's widest view clears 40 m), and
 * above the land's top (`landTop`) by what may stand on it: the tallest building, the windmill's sails. And how far it
 * sees past the land at the top of the screen (m).
 */
const CLEAR = 40, TALLEST = 20, BEYOND = 100;

/** Something on the page (the canvas): where it is, in CSS pixels. */
interface OnPage { getBoundingClientRect(): { left: number; top: number; width: number; height: number } }

export class ViewCamera {
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);
  readonly target = new THREE.Vector3();
  /** The view, 0..3: the camera looks from 45° + 90° × view. */
  view = 0;
  /** Screen pixels per metre. */
  zoom = 32;
  /** How far the camera sits back from the target along the view, as last applied (m). */
  distance = CAMERA_DISTANCE;
  /** The highest the land stands (m): the renderer's, from its ground, so a wide view doesn't cut off its hills (apply). */
  landTop = -Infinity;
  /**
   * Device pixels per CSS pixel the view is framed at, the view's size in CSS pixels and its canvas (where it is on the
   * page): the renderer's, set as it's made and resized. For place, toScreen and rayAt.
   */
  screen: { ratio: number; width: number; height: number; canvas: OnPage | null } = { ratio: 1, width: 1, height: 1, canvas: null };
  private yaw = THREE.MathUtils.degToRad(45);
  private readonly ndc = new THREE.Vector3();

  constructor(view = 0, zoom = 32) {
    this.view = view; this.zoom = zoom;
    this.yaw = this.goalYaw();
  }

  /** Where the camera looks from now, radians (turning eases it between the views): screen right is (cos, 0, -sin). */
  get heading() { return this.yaw; }

  private goalYaw() { return THREE.MathUtils.degToRad(45 + 90 * this.view); }

  turn(dir: number) { this.view = (this.view + dir + 4) % 4; }

  /** Eases the turn; returns true while it is still moving. */
  update(dt: number, instant = false) {
    const goal = this.goalYaw();
    let d = goal - this.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw = instant || Math.abs(d) < 1e-4 ? goal : this.yaw + d * (1 - Math.exp(-dt * 9));
    return Math.abs(d) > 1e-4;
  }

  /** The unit vector from the target towards the camera. */
  backward() {
    return new THREE.Vector3(Math.sin(this.yaw) * Math.cos(PITCH), Math.sin(PITCH), Math.cos(this.yaw) * Math.cos(PITCH));
  }

  /** Moves the target by screen pixels (drag). */
  pan(dx: number, dy: number) {
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    // Screen up is the ground's forward foreshortened by the pitch.
    this.target.addScaledVector(right, -dx / this.zoom).addScaledVector(fwd, dy / this.zoom / Math.sin(PITCH));
  }

  /**
   * Places the camera, for a caller with its own controller (the game), each frame before it draws or asks toScreen or
   * rayAt: the ground point in the middle of the screen, where it looks from (radians: 45° + 90° × the view at rest;
   * screen right is (cos, 0, -sin)) and the zoom in CSS pixels a metre, so a high-DPI screen shows the same land as any
   * other. The view turns no further by itself: don't call update with it.
   */
  place(at: { x: number; y?: number; z: number; heading: number; zoom: number }) {
    this.target.set(at.x, at.y ?? 0, at.z);
    this.yaw = at.heading;
    this.view = ((Math.round((at.heading - Math.PI / 4) / (Math.PI / 2)) % 4) + 4) % 4;
    this.zoom = at.zoom * this.screen.ratio;
    this.apply(this.screen.width * this.screen.ratio, this.screen.height * this.screen.ratio);
  }

  /** Where a point of the world (m) is drawn on the page, in CSS pixels as pointer events count them, as last placed. */
  toScreen(x: number, y: number, z: number): { x: number; y: number } {
    const p = this.ndc.set(x, y, z).project(this.camera), r = this.rect();
    return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height };
  }

  /** The line of sight through a point of the page (CSS pixels, as pointer events give it), in metres, as last placed. */
  rayAt(clientX: number, clientY: number, into = new THREE.Ray()): THREE.Ray {
    const r = this.rect();
    const x = (clientX - r.left) / r.width * 2 - 1, y = 1 - (clientY - r.top) / r.height * 2;
    into.origin.set(x, y, -1).unproject(this.camera);
    into.direction.copy(this.backward()).negate();
    return into;
  }

  private rect() {
    return this.screen.canvas?.getBoundingClientRect() ?? { left: 0, top: 0, width: this.screen.width, height: this.screen.height };
  }

  apply(width: number, height: number) {
    const w = width / this.zoom / 2, h = height / this.zoom / 2;
    const c = this.camera;
    c.left = -w; c.right = w; c.top = h; c.bottom = -h;
    // The land at the top and bottom of the view lies this far past the target and short of it, along the view; the
    // camera sits back far enough to see the land's top and what stands on it at the bottom.
    const deep = h / Math.tan(PITCH), clear = Math.max(CLEAR, this.landTop + TALLEST - this.target.y);
    this.distance = Math.max(CAMERA_DISTANCE, (h * Math.cos(PITCH) + clear) / Math.sin(PITCH));
    c.near = 1; c.far = Math.max(CAMERA_DISTANCE * 2.5, this.distance + deep + BEYOND);
    c.position.copy(this.target).addScaledVector(this.backward(), this.distance);
    c.up.set(0, 1, 0);
    c.lookAt(this.target);
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  }
}
