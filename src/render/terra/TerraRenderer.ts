import * as THREE from 'three';
import type { Look, PixelScene } from 'pixel3d-renderer';
import type { WorldRenderer } from '../../world/renderer.ts';
import { depthMaterial, litMaterial, shared } from './material.ts';
import { groundUniforms } from './ground.ts';
import { ObjectBatch, type TerraObject } from './objects.ts';
import { waterMesh } from './water.ts';
import { TerraPost } from './post.ts';
import { TerraFoliage } from './foliage.ts';
import type { GameState } from '../../game/state.ts';
import { windAt } from '../../game/sim.ts';

// An experimental full-resolution renderer for a softer, painterly look (`?look=terra`): plain three.js, smooth lighting,
// soft shadows and tone mapping, no pixelation. It draws the same PixelScene and objects as the pixel renderer, through
// the same interface (WorldRenderer). `width` and `height` are CSS pixels; the canvas is drawn at the device resolution.

/** The device pixel ratio is capped here: sharper than this costs a lot of fill for little gain. */
const MAX_DPR = 2;
const SHADOW_MAP_SIZE = 4096;
/** How opaque overlay tiles are, and how thick power wires are drawn (of the game's thickness). */
const GLAZE = 0.4, THIN = 0.4;

export class TerraRenderer implements WorldRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 300);
  readonly scene = new THREE.Scene();
  width = 1; height = 1;

  private readonly sun = new THREE.DirectionalLight(0xffffff, 1);
  private readonly sky = new THREE.HemisphereLight(0xffffff, 0x627080, 1);
  private readonly shadowCenter: THREE.Vector3;
  private readonly batches = new Map<THREE.BufferGeometry, ObjectBatch>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  /** AO, bloom at night, tilt-shift, tone mapping and the colour grade (post.ts). */
  private readonly post: TerraPost;
  private dpr = 1;
  /** The objects that sway in the wind (trees and bushes), by geometry. */
  private readonly swaying: Set<THREE.BufferGeometry>;
  /** Grass tufts and wildflowers over the open ground (foliage.ts). */
  private readonly foliage = new TerraFoliage(this.scene);

  readonly canvas: HTMLCanvasElement;

  /** The geometries drawn see-through (overlay tiles), so the ground shows through them. */
  private readonly glazed: Set<THREE.BufferGeometry>;
  /** The bar geometries drawn thinner (power wires and feeds: thin cables rather than glowing bands). */
  private readonly thinned: Set<THREE.BufferGeometry>;

  /**
   * `sway`: the geometries of objects that sway in the wind (trees and bushes). `glaze`: the geometries drawn see-through
   * (overlay tiles: the grass shows through their tint rather than a flat board of squares). `thin`: bar geometries drawn
   * thinner (power wires).
   */
  constructor(canvas: HTMLCanvasElement, world: PixelScene, { sway = [], glaze = [], thin = [] }: { sway?: THREE.BufferGeometry[]; glaze?: THREE.BufferGeometry[]; thin?: THREE.BufferGeometry[] } = {}) {
    this.canvas = canvas;
    this.swaying = new Set(sway);
    this.glazed = new Set(glaze);
    this.thinned = new Set(thin);
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false });   // post.ts multisamples
    r.setPixelRatio(Math.min(devicePixelRatio, MAX_DPR));
    r.toneMapping = THREE.NoToneMapping;   // post.ts tone maps and grades
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    canvas.style.imageRendering = 'auto';   // the page styles the canvas for pixel art

    // The map spans x in [0, width] and z in [0, height], and the scene's shadow square is centred on it (terrain.ts).
    groundUniforms.uTerraMap.value.set(Math.round(world.shadow.center.x * 2), Math.round(world.shadow.center.z * 2));
    const sv = { instanced: false, motion: false, transparent: false };
    const staticMesh = new THREE.Mesh(world.staticGeometry, litMaterial(sv));
    staticMesh.customDepthMaterial = depthMaterial(sv);   // what lies beyond the map's edge is dropped (ground.ts)
    staticMesh.castShadow = staticMesh.receiveShadow = true;
    this.scene.add(staticMesh);
    if (world.dynamicGeometry) {
      const v = { instanced: false, motion: true, transparent: false };
      const dyn = new THREE.Mesh(world.dynamicGeometry, litMaterial(v));
      dyn.customDepthMaterial = depthMaterial(v);
      dyn.castShadow = dyn.receiveShadow = true;
      dyn.frustumCulled = false;   // posed on the GPU, so its bounding sphere is only roughly right
      this.scene.add(dyn);
    }
    if (world.fluids && world.fluids.geometry.getAttribute('position').count > 0) this.scene.add(waterMesh(world));

    // The sun's shadow covers the scene's shadow square; the light sits on the sun's side of its centre.
    const { center, radius } = world.shadow;
    this.shadowCenter = center.clone();
    const sc = this.sun.shadow.camera;
    sc.left = -radius; sc.right = radius; sc.top = radius; sc.bottom = -radius; sc.near = 1; sc.far = 200;
    sc.updateProjectionMatrix();
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun, this.sun.target, this.sky);
    this.post = new TerraPost(r, this.scene, this.camera);
  }

  setLook(look: Look) {
    const az = THREE.MathUtils.degToRad(look.sunAz), el = THREE.MathUtils.degToRad(look.sunEl);
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
    this.sun.position.copy(this.shadowCenter).addScaledVector(dir, 80);
    this.sun.target.position.copy(this.shadowCenter);
    this.sun.target.updateMatrixWorld();
    // Warm sunlight; the sky light takes the sky's colours, so night turns blue and dusk warm.
    this.sun.color.setRGB(1, 0.95, 0.86).lerp(look.skyBot, 0.25);
    this.sun.intensity = 2.6 * look.sunI;
    this.sky.color.copy(look.skyTop).lerp(new THREE.Color(1, 1, 1), 0.35);
    this.sky.intensity = 4 * look.ambient;
    this.post.setLook(look.expo, look.lampOn, look.night);
    this.scene.background = look.skyBot.clone();
    shared.uTerraGlow.value = 0.5 + 1.5 * look.lampOn;
  }

  /** Sets the drawing size in CSS pixels (the canvas backing store is that times the capped device pixel ratio). */
  resize(w: number, h: number) {
    this.width = w; this.height = h;
    this.dpr = Math.min(devicePixelRatio, MAX_DPR);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.post.setSize(w, h);
  }

  placeCamera(target: THREE.Vector3, azimuth: number, elevation: number, viewHeight: number) {
    const cam = this.camera, halfH = viewHeight / 2, halfW = halfH * (this.width / this.height);
    cam.left = -halfW; cam.right = halfW; cam.top = halfH; cam.bottom = -halfH;
    cam.updateProjectionMatrix();
    const dir = new THREE.Vector3(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation));
    cam.position.copy(target).addScaledVector(dir, 100);
    cam.lookAt(target);
    cam.updateMatrixWorld();
  }

  addObject(geometry: THREE.BufferGeometry): TerraObject {
    let b = this.batches.get(geometry);
    if (!b) {
      const sway = this.swaying.has(geometry) ? 1 : 0, alpha = this.glazed.has(geometry) ? GLAZE : 1, girth = this.thinned.has(geometry) ? THIN : 1;
      this.batches.set(geometry, b = new ObjectBatch(geometry, this.scene, { sway, alpha, girth }));
    }
    return b.add();
  }

  /**
   * What the terra look shows of the game beyond the objects: the ground foliage (laid out again when the layout changes;
   * pressed flat under an overlay, `flat`) and the wind plants sway in. Call once a frame; `dt` in seconds.
   */
  syncGame(s: GameState, flat: boolean, dt: number) {
    this.foliage.sync(s, flat, dt);
    const goal = 0.35 + 0.9 * windAt(s.scenario, s.time);
    shared.uTerraWind.value += (goal - shared.uTerraWind.value) * Math.min(1, dt * 2);
  }

  /** Poses the objects where the game put them and sets the motion clock. */
  renderGeometry(time: number) {
    shared.uTerraTime.value = time;
    for (const b of this.batches.values()) b.pose();
  }

  renderStyle(_time: number) {
    if (Math.min(devicePixelRatio, MAX_DPR) !== this.dpr) this.resize(this.width, this.height);   // moved screens or zoomed
    this.post.render();
  }

  /** The nearest opaque object under a page point, as of the last `renderGeometry` (ignoring motion). */
  pick(clientX: number, clientY: number): { object: TerraObject | null } | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width, y = (clientY - rect.top) / rect.height;
    if (!(x >= 0 && y >= 0 && x <= 1 && y <= 1)) return null;
    this.ndc.set(x * 2 - 1, 1 - y * 2);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    let best: { distance: number; object: TerraObject } | null = null;
    const hits: THREE.Intersection[] = [];
    for (const b of this.batches.values()) for (const { mesh, drawn } of b.pickable) {
      if (mesh.count === 0) continue;
      hits.length = 0;
      mesh.raycast(this.raycaster, hits);
      for (const h of hits) {
        if (h.instanceId === undefined || (best && h.distance >= best.distance)) continue;
        best = { distance: h.distance, object: drawn[h.instanceId] };
      }
    }
    return { object: best?.object ?? null };
  }
}
