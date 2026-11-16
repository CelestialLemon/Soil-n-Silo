import * as THREE from 'three';
import type { BrushRenderer } from '../../../brush3d/src/index.ts';
import type { Lens } from '../camera.ts';
import { TILE } from './scale.ts';

// The game's camera on brush3d (camera.ts's Lens): the game keeps its controller, in world units and CSS pixels a tile,
// and places brush3d's view in metres and CSS pixels a metre (r.view.place), every frame. The canvas covers the window and
// brush3d draws it at the screen's own resolution (fewer pixels on a high-DPI screen: maxPixels).

export class BrushLens implements Lens {
  onFit = () => {};
  /** While set, the game's camera leaves the view where it is (a profile places it itself, #210). */
  held = false;
  private readonly r: BrushRenderer;
  private readonly canvas: HTMLCanvasElement;

  constructor(r: BrushRenderer, canvas: HTMLCanvasElement) {
    this.r = r; this.canvas = canvas;
  }

  fit() {
    const w = innerWidth, h = innerHeight;
    Object.assign(this.canvas.style, { width: `${w}px`, height: `${h}px`, left: '0px', top: '0px' });
    this.r.resize(w, h);
    this.onFit();
  }

  place(target: THREE.Vector3, yaw: number, _pitch: number, zoom: number) {
    if (this.held) return;
    // The pitch is brush3d's PITCH, the same 30°.
    this.r.view.place({ x: target.x * TILE, y: target.y * TILE, z: target.z * TILE, heading: yaw, zoom: zoom / TILE });
  }

  project(p: THREE.Vector3) { return p.multiplyScalar(TILE).project(this.r.view.camera); }

  aim(ndc: THREE.Vector2, ray: THREE.Ray) {
    const cam = this.r.view.camera;
    ray.origin.set(ndc.x, ndc.y, -1).unproject(cam).divideScalar(TILE);
    ray.direction.set(0, 0, -1).transformDirection(cam.matrixWorld);
    return ray;
  }
}
