import * as THREE from 'three';
import type { BrushRenderer } from '../../../brush3d/src/index.ts';
import type { Lens } from '../camera.ts';
import { TILE } from './scale.ts';

// The game's camera on brush3d (camera.ts's Lens): the game keeps its controller, in world units and CSS pixels a tile,
// and places brush3d's view in metres and CSS pixels a metre (r.view.place), every frame. The canvas covers the window and
// brush3d draws it at the screen's own resolution (fewer pixels on a high-DPI screen: maxPixels).

export class BrushLens implements Lens {
  onFit = () => {};
  private readonly r: BrushRenderer;
  private readonly canvas: HTMLCanvasElement;
  private readonly shrink = new THREE.Matrix4().makeScale(1 / TILE, 1 / TILE, 1 / TILE);
  /**
   * A camera that takes world units to the screen as the view draws them in metres: for the tile cursor (tileCursor.ts).
   * Its own matrix is set (the view's, shrunk to world units), so updateMatrixWorld derives the rest from it.
   */
  readonly cursor = new THREE.Camera();

  constructor(r: BrushRenderer, canvas: HTMLCanvasElement) {
    this.r = r; this.canvas = canvas;
    this.cursor.matrixAutoUpdate = false;
  }

  fit() {
    const w = innerWidth, h = innerHeight;
    Object.assign(this.canvas.style, { width: `${w}px`, height: `${h}px`, left: '0px', top: '0px', imageRendering: 'auto' });
    this.r.resize(w, h);
    this.onFit();
  }

  place(target: THREE.Vector3, yaw: number, _pitch: number, zoom: number) {
    // The pitch is brush3d's PITCH, the same 30°.
    this.r.view.place({ x: target.x * TILE, y: target.y * TILE, z: target.z * TILE, heading: yaw, zoom: zoom / TILE });
    const cam = this.r.view.camera;
    this.cursor.matrix.multiplyMatrices(this.shrink, cam.matrixWorld);
    this.cursor.updateMatrixWorld(true);
    this.cursor.projectionMatrix.copy(cam.projectionMatrix);
  }

  project(p: THREE.Vector3) { return p.multiplyScalar(TILE).project(this.r.view.camera); }

  aim(ndc: THREE.Vector2, ray: THREE.Ray) {
    const cam = this.r.view.camera;
    ray.origin.set(ndc.x, ndc.y, -1).unproject(cam).divideScalar(TILE);
    ray.direction.set(0, 0, -1).transformDirection(cam.matrixWorld);
    return ray;
  }
}
