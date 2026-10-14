import type * as THREE from 'three';
import type { Look } from 'pixel3d-renderer';

// What the game asks of a renderer: the pixel renderer (`PixelRenderer`, the default) satisfies it as it is, and the
// experimental full-resolution one (`?look=terra`, src/render/terra/) implements it. The views and the loop use only this.

/** A rigid object the game adds, moves and removes (see `PixelObject` in the pixel renderer for the full contract). */
export interface WorldObject {
  visible: boolean;
  /** Snap to the art-pixel grid; renderers without one ignore it. */
  snap: boolean;
  castShadow: boolean;
  /** Linear colour the surface mixes towards by `tintStrength` (0 to 1), or null. */
  tint: THREE.Color | null;
  tintStrength: number;
  /** 0 to 1; below 1 the object is see-through, casts no shadow and isn't picked. */
  opacity: number;
  highlight: boolean;
  setTransform(position: THREE.Vector3, rotation?: THREE.Quaternion | THREE.Euler, scale?: THREE.Vector3 | number): unknown;
  remove(): void;
}

export interface WorldRenderer {
  readonly camera: THREE.OrthographicCamera;
  /** The drawing size the camera's aspect follows (art pixels for the pixel renderer, CSS pixels for terra). */
  readonly width: number;
  readonly height: number;
  resize(width: number, height: number): void;
  /** Orthographic camera orbiting `target` at `azimuth` and `elevation` (radians), `viewHeight` metres tall. */
  placeCamera(target: THREE.Vector3, azimuth: number, elevation: number, viewHeight: number): void;
  renderGeometry(time: number): void;
  renderStyle(time: number): void;
  setLook(look: Look): void;
  addObject(geometry: THREE.BufferGeometry): WorldObject;
  /** The object drawn under a page point (`clientX`/`clientY`), if any. */
  pick(clientX: number, clientY: number): { object: WorldObject | null } | null;
}
