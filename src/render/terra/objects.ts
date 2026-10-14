import * as THREE from 'three';
import type { WorldObject } from '../../world/renderer.ts';
import { depthMaterial, INSTANCE_EXTRA, INSTANCE_TINT, litMaterial } from './material.ts';

// Objects the game adds, moves and removes, drawn instanced: every object sharing a geometry goes in one batch, and each
// frame the visible ones are packed into three meshes by how they draw (opaque and casting, opaque without a shadow,
// see-through).

let nextId = 1;
/** A stable pseudo-random clock phase in [0, 1) from an object's id. */
const phaseOf = (id: number) => ((Math.imul(id, 2654435761) >>> 8) & 0xffffff) / 0x1000000;

export class TerraObject implements WorldObject {
  readonly position = new THREE.Vector3();
  readonly quaternion = new THREE.Quaternion();
  readonly scale = new THREE.Vector3(1, 1, 1);
  visible = true;
  snap = true;   // no pixel grid here
  castShadow = true;
  tint: THREE.Color | null = null;
  tintStrength = 0.5;
  opacity = 1;
  highlight = false;
  readonly phase = phaseOf(nextId++);

  private readonly batch: ObjectBatch;
  constructor(batch: ObjectBatch) { this.batch = batch; }

  setTransform(position: THREE.Vector3, rotation?: THREE.Quaternion | THREE.Euler, scale?: THREE.Vector3 | number) {
    this.position.copy(position);
    if (rotation instanceof THREE.Euler) this.quaternion.setFromEuler(rotation);
    else if (rotation) this.quaternion.copy(rotation);
    if (typeof scale === 'number') this.scale.setScalar(scale);
    else if (scale) this.scale.copy(scale);
    return this;
  }

  remove() { this.highlight = false; this.batch.detach(this); }
}

/** One of a batch's meshes, grown (replaced by one twice the size) when it runs out of room. */
class Slot {
  mesh: THREE.InstancedMesh;
  /** The object drawn as each instance this frame, for picking. */
  drawn: TerraObject[] = [];
  /** A geometry of the slot's own sharing the game geometry's attributes, so it can carry its own instance attributes. */
  private readonly geometry: THREE.BufferGeometry;

  private readonly material: THREE.Material;
  private readonly depth: THREE.Material | undefined;
  private readonly casts: boolean;
  private readonly scene: THREE.Scene;

  /** How much the batch's objects sway in the wind (0: not at all). */
  private readonly sway: number;

  constructor(source: THREE.BufferGeometry, material: THREE.Material, depth: THREE.Material | undefined, casts: boolean, scene: THREE.Scene, sway: number) {
    this.material = material; this.depth = depth; this.casts = casts; this.scene = scene; this.sway = sway;
    const g = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(source.attributes)) g.setAttribute(name, attr);
    g.setIndex(source.index);
    for (const grp of source.groups) g.addGroup(grp.start, grp.count, grp.materialIndex);
    this.geometry = g;
    this.mesh = this.make(16);
  }

  private make(capacity: number) {
    this.geometry.setAttribute(INSTANCE_TINT, new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute(INSTANCE_EXTRA, new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4).setUsage(THREE.DynamicDrawUsage));
    const m = new THREE.InstancedMesh(this.geometry, this.material, capacity);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (this.depth) m.customDepthMaterial = this.depth;
    m.castShadow = this.casts; m.receiveShadow = true;
    m.frustumCulled = false;   // instances move every frame; a stale bounding sphere would cull them
    m.count = 0;
    this.scene.add(m);
    return m;
  }

  /** Draws `objects` this frame, their opacity scaled by `alpha` and their y and z scale by `girth`. */
  fill(objects: TerraObject[], alpha = 1, girth = 1) {
    if (objects.length > this.mesh.instanceMatrix.count) {
      let capacity = this.mesh.instanceMatrix.count;
      while (capacity < objects.length) capacity *= 2;
      this.scene.remove(this.mesh);
      this.mesh.dispose();
      this.mesh = this.make(capacity);
    }
    const tint = this.geometry.getAttribute(INSTANCE_TINT) as THREE.InstancedBufferAttribute;
    const extra = this.geometry.getAttribute(INSTANCE_EXTRA) as THREE.InstancedBufferAttribute;
    objects.forEach((o, i) => {
      matrix.compose(o.position, o.quaternion, girth === 1 ? o.scale : thick.set(o.scale.x, o.scale.y * girth, o.scale.z * girth));
      this.mesh.setMatrixAt(i, matrix);
      const t = o.tint;
      tint.setXYZW(i, t?.r ?? 0, t?.g ?? 0, t?.b ?? 0, t ? o.tintStrength : 0);
      extra.setXYZW(i, o.opacity * alpha, o.highlight ? 1 : 0, o.phase, this.sway);
    });
    this.mesh.count = objects.length;
    this.mesh.instanceMatrix.needsUpdate = true;
    tint.needsUpdate = true; extra.needsUpdate = true;
    // The bounding sphere is what the raycaster tests first; recompute it for the instances' new places.
    this.mesh.boundingSphere = null;
    this.drawn = objects;
  }
}

const matrix = new THREE.Matrix4(), thick = new THREE.Vector3();

export class ObjectBatch {
  readonly objects: TerraObject[] = [];
  /** Opaque casting, opaque not casting, see-through. */
  readonly slots: Slot[];

  /** Every object's opacity is scaled by this: below 1, the whole batch is see-through (overlay tiles). */
  private readonly alpha: number;
  /** Every object's y and z scale is scaled by this (bars along x: thinner wires). */
  private readonly girth: number;

  /**
   * `sway`: how much the objects sway in the wind (trees and bushes; 0 for everything else). `alpha`: below 1, every
   * object is drawn see-through at that opacity (times its own), so the ground shows through overlay tiles. `girth`:
   * scales every object's y and z (bars along x, such as wires, drawn thinner).
   */
  constructor(geometry: THREE.BufferGeometry, scene: THREE.Scene, { sway = 0, alpha = 1, girth = 1 } = {}) {
    this.alpha = alpha; this.girth = girth;
    const motion = !!geometry.getAttribute('aMode');
    const solid = { instanced: true, motion, transparent: false }, clear = { ...solid, transparent: true };
    this.slots = [
      new Slot(geometry, litMaterial(solid), depthMaterial(solid), true, scene, sway),
      new Slot(geometry, litMaterial(solid), depthMaterial(solid), false, scene, sway),
      new Slot(geometry, litMaterial(clear), undefined, false, scene, sway),
    ];
  }

  add() { const o = new TerraObject(this); this.objects.push(o); return o; }

  detach(o: TerraObject) {
    const i = this.objects.indexOf(o);
    if (i >= 0) this.objects.splice(i, 1);
  }

  /** Packs the visible objects into the slots for this frame. */
  pose() {
    const lists: TerraObject[][] = [[], [], []];
    for (const o of this.objects) {
      if (!o.visible || o.opacity <= 0) continue;
      lists[o.opacity < 1 || this.alpha < 1 ? 2 : o.castShadow ? 0 : 1].push(o);
    }
    this.slots.forEach((s, i) => s.fill(lists[i], i === 2 ? this.alpha : 1, this.girth));
  }

  /** The meshes `pick` can hit: the opaque ones (see-through objects are picked through, as in the pixel renderer). */
  get pickable() { return this.slots.slice(0, 2).map((s) => ({ mesh: s.mesh, drawn: s.drawn })); }
}
