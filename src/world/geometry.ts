import * as THREE from 'three';

/** Small geometry builder for the game's source models. It produces ordinary, vertex-coloured Three.js geometry. */
export const FLAG = { NORMAL: 0, EMISSIVE: 1, DECOR: 2, STEAM: 3 } as const;

export interface Motion { kind: 'sway' | 'spin' | 'swing' | 'smoke'; at?: number[]; axis?: number[]; phase?: number; seed?: number; height?: number; speed?: number; amplitude?: number }

/** Convert an sRGB model colour to the linear values expected by a vertex-colour material. */
export function linearColor(hex: number): [number, number, number] {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
}

export function place(
  x: number, y: number, z: number,
  rx = 0, ry = 0, rz = 0,
  sx = 1, sy = sx, sz = sx,
): THREE.Matrix4 {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(sx, sy, sz),
  );
}

/** Descriptors retained at call sites so model scripts remain explicit; animated parts are handled by scene objects. */
export const motion = {
  sway: (x: number, z: number, phase = 0, height = 1, y = 0): Motion => ({ kind: 'sway', at: [x, y, z], phase, height, speed: 1.3 }),
  spin: (at: number[], axis: number[], speed = 1): Motion => ({ kind: 'spin', at, axis, speed }),
  swing: (at: number[], axis: number[], amplitude = 0.1): Motion => ({ kind: 'swing', at, axis, speed: 1.4, amplitude }),
  smoke: (at: number[], phase = 0, seed = 0): Motion => ({ kind: 'smoke', at, phase: phase + seed, speed: 0.35 }),
};

export class GeometryCollector {
  private readonly positions: number[] = [];
  private readonly normals: number[] = [];
  private readonly colors: number[] = [];
  private readonly flags: number[] = [];
  private readonly modes: number[] = [];
  private readonly anchors: number[] = [];
  private readonly axes: number[] = [];
  private readonly animation: number[] = [];

  constructor(_animated = false) {}

  add(
    geometry: THREE.BufferGeometry,
    matrix: THREE.Matrix4 | null,
    color: number[] | THREE.Color | null,
    flag: number = FLAG.NORMAL,
    flat = false,
    _motion?: Motion,
  ) {
    let g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    if (matrix) g.applyMatrix4(matrix);
    if (!g.getAttribute('normal') || flat) g.computeVertexNormals();
    const p = g.getAttribute('position'), n = g.getAttribute('normal');
    const sourceColor = g.getAttribute('color') ?? g.getAttribute('aColor');
    const sourceFlags = g.getAttribute('aFlag'), sourceMode = g.getAttribute('aMode');
    const sourceAnchor = g.getAttribute('aAnchor'), sourceAxis = g.getAttribute('aAxis'), sourceAnim = g.getAttribute('aAnim');
    const c = color instanceof THREE.Color ? [color.r, color.g, color.b] : color;
    const rgb = c ?? [1, 1, 1];
    const mode = _motion ? ({ sway: 1, spin: 2, smoke: 3, swing: 4 }[_motion.kind]) : 0;
    const at = _motion?.at, direction = _motion?.axis;
    const anchor = new THREE.Vector3(at?.[0] ?? 0, at?.[1] ?? 0, at?.[2] ?? 0);
    const axis = new THREE.Vector3(direction?.[0] ?? 0, direction?.[1] ?? 1, direction?.[2] ?? 0);
    if (matrix && at) anchor.applyMatrix4(matrix);
    if (matrix && direction) axis.transformDirection(matrix);
    for (let i = 0; i < p.count; i++) {
      this.positions.push(p.getX(i), p.getY(i), p.getZ(i));
      this.normals.push(n.getX(i), n.getY(i), n.getZ(i));
      this.colors.push(sourceColor && !color ? sourceColor.getX(i) : rgb[0], sourceColor && !color ? sourceColor.getY(i) : rgb[1], sourceColor && !color ? sourceColor.getZ(i) : rgb[2]);
      this.flags.push(sourceFlags?.getX(i) ?? flag);
      this.modes.push(_motion ? mode : sourceMode?.getX(i) ?? 0);
      const pivot = _motion ? anchor : new THREE.Vector3(sourceAnchor?.getX(i) ?? 0, sourceAnchor?.getY(i) ?? 0, sourceAnchor?.getZ(i) ?? 0);
      const spinAxis = _motion ? axis : new THREE.Vector3(sourceAxis?.getX(i) ?? 0, sourceAxis?.getY(i) ?? 1, sourceAxis?.getZ(i) ?? 0);
      if (matrix && !_motion && sourceAnchor) pivot.applyMatrix4(matrix);
      if (matrix && !_motion && sourceAxis) spinAxis.transformDirection(matrix);
      this.anchors.push(pivot.x, pivot.y, pivot.z);
      this.axes.push(spinAxis.x, spinAxis.y, spinAxis.z);
      this.animation.push(
        _motion?.phase ?? _motion?.seed ?? sourceAnim?.getX(i) ?? 0,
        _motion?.height ?? _motion?.amplitude ?? sourceAnim?.getY(i) ?? 1,
        _motion?.speed ?? sourceAnim?.getZ(i) ?? 0,
        sourceAnim?.getW(i) ?? 0,
      );
    }
    g.dispose();
    return this;
  }

  pushPrepared(geometry: THREE.BufferGeometry) { return this.add(geometry, null, null); }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
    g.setAttribute('aFlag', new THREE.Float32BufferAttribute(this.flags, 1));
    g.setAttribute('aMode', new THREE.Float32BufferAttribute(this.modes, 1));
    g.setAttribute('aAnchor', new THREE.Float32BufferAttribute(this.anchors, 3));
    g.setAttribute('aAxis', new THREE.Float32BufferAttribute(this.axes, 3));
    g.setAttribute('aAnim', new THREE.Float32BufferAttribute(this.animation, 4));
    g.computeBoundingBox();
    g.computeBoundingSphere();
    return g;
  }
}

export const MAX_HIGHLIGHTS = 12;

export function hourLabel(hour: number): string {
  const total = ((Math.round(hour * 60) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60), m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
