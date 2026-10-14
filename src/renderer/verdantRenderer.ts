import * as THREE from 'three';

const MOTION_ATTRIBUTES = 'attribute float aMode;\nattribute vec3 aAnchor;\nattribute vec3 aAxis;\nattribute vec4 aAnim;\nuniform float uWorldTime;';
const MOTION_VERTEX = `#include <begin_vertex>
  if (aMode > 0.5 && aMode < 1.5) {
    float swayWeight = clamp((position.y - aAnchor.y) / max(aAnim.y, 0.18), 0.0, 1.0);
    transformed.x += sin(uWorldTime * aAnim.z + aAnim.x) * 0.045 * swayWeight;
    transformed.z += cos(uWorldTime * aAnim.z * 0.83 + aAnim.x) * 0.03 * swayWeight;
  } else if (aMode > 1.5 && aMode < 2.5) {
    vec3 spinAxis = normalize(aAxis);
    vec3 fromPivot = transformed - aAnchor;
    float angle = uWorldTime * aAnim.z + aAnim.x;
    transformed = aAnchor + fromPivot * cos(angle) + cross(spinAxis, fromPivot) * sin(angle) + spinAxis * dot(spinAxis, fromPivot) * (1.0 - cos(angle));
  } else if (aMode > 2.5 && aMode < 3.5) {
    float drift = fract(uWorldTime * aAnim.z + aAnim.x);
    transformed.y += drift * 0.42;
    transformed.x += sin(uWorldTime * 1.4 + aAnim.x) * 0.035;
  } else if (aMode > 3.5) {
    vec3 swingAxis = normalize(aAxis);
    vec3 fromPivot = transformed - aAnchor;
    float angle = sin(uWorldTime * aAnim.z + aAnim.x) * aAnim.y;
    transformed = aAnchor + fromPivot * cos(angle) + cross(swingAxis, fromPivot) * sin(angle) + swingAxis * dot(swingAxis, fromPivot) * (1.0 - cos(angle));
  }`;

/** Handle for a selectable world mesh. Kept small so world adapters can update game state without owning WebGL details. */
export class RenderObject {
  readonly mesh: THREE.Mesh;
  private readonly release: (object: RenderObject) => void;
  private readonly ownsGeometry: boolean;
  private readonly hasAnimatedVertices: boolean;
  private readonly animatedBounds: THREE.Sphere | null;
  private pickGeometry?: THREE.BufferGeometry;
  private pickMesh?: THREE.Mesh;
  private worldTime = 0;
  private tintValue: THREE.Color | null = null;
  private tintAmount = 0;
  private highlightValue = false;
  private opacityValue = 1;
  pickable = false;

  constructor(geometry: THREE.BufferGeometry, release: (object: RenderObject) => void) {
    this.release = release;
    let g = geometry;
    if (!g.getAttribute('color') && g.getAttribute('aColor')) g = geometry.clone();
    this.ownsGeometry = g !== geometry;
    if (g !== geometry) g.setAttribute('color', g.getAttribute('aColor').clone());
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    const glow = !!g.getAttribute('aFlag');
    const animated = !!g.getAttribute('aMode');
    const modes = g.getAttribute('aMode');
    this.hasAnimatedVertices = !!modes && (() => { for (let i = 0; i < modes.count; i++) if (modes.getX(i) > 0.5) return true; return false; })();
    if (this.hasAnimatedVertices) {
      if (!g.boundingSphere) g.computeBoundingSphere();
      const base = g.boundingSphere!, center = base.center.clone(), position = g.getAttribute('position'), anchor = g.getAttribute('aAnchor');
      const p = new THREE.Vector3(), pivot = new THREE.Vector3();
      let radius = base.radius;
      for (let i = 0; i < modes!.count; i++) {
        const kind = modes!.getX(i);
        if (kind < 0.5) continue;
        p.fromBufferAttribute(position, i);
        if (kind > 1.5 && kind < 2.5 || kind > 3.5) {
          pivot.fromBufferAttribute(anchor, i);
          radius = Math.max(radius, center.distanceTo(pivot) + p.distanceTo(pivot));
        } else radius = Math.max(radius, center.distanceTo(p) + (kind > 2.5 && kind < 3.5 ? 0.43 : 0.06));
      }
      this.animatedBounds = new THREE.Sphere(center, radius);
    } else this.animatedBounds = null;
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: !!g.getAttribute('color'),
      roughness: 0.78,
      metalness: 0.015,
      flatShading: true,
    });
    if (glow || animated) material.onBeforeCompile = (shader) => {
      const attrs = `${glow ? 'attribute float aFlag;\nvarying float vFlag;\n' : ''}${animated ? `${MOTION_ATTRIBUTES}\n` : ''}`;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${attrs}`);
      if (glow) {
        shader.vertexShader = shader.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>\nvFlag = aFlag;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nvarying float vFlag;')
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * step(0.5, vFlag) * (1.0 - step(1.5, vFlag)) * 0.32;');
      }
      if (animated) {
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', MOTION_VERTEX);
        shader.uniforms.uWorldTime = { value: 0 };
      }
      material.userData.shader = shader;
    };
    material.customProgramCacheKey = () => `verdant-v1-${glow ? 1 : 0}-${animated ? 1 : 0}`;
    this.mesh = new THREE.Mesh(g, material);
    if (animated) {
      const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
      depth.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', `#include <common>\n${MOTION_ATTRIBUTES}`)
          .replace('#include <begin_vertex>', MOTION_VERTEX);
        shader.uniforms.uWorldTime = { value: 0 };
        depth.userData.shader = shader;
      };
      depth.customProgramCacheKey = () => 'verdant-depth-motion-v1';
      this.mesh.customDepthMaterial = depth;
    }
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.userData.renderObject = this;
  }

  get visible() { return this.mesh.visible; }
  set visible(v: boolean) { this.mesh.visible = v; }
  get animated() { return this.hasAnimatedVertices; }
  get pickBounds() { return this.animatedBounds; }
  get castShadow() { return this.mesh.castShadow; }
  set castShadow(v: boolean) { this.mesh.castShadow = v; }
  set opacity(v: number) {
    const next = THREE.MathUtils.clamp(v, 0, 1);
    if (next === this.opacityValue) return;
    this.opacityValue = next;
    const m = this.mesh.material as THREE.MeshStandardMaterial;
    const wasTransparent = m.transparent;
    m.opacity = this.opacityValue;
    m.transparent = this.opacityValue < 1;
    m.depthWrite = this.opacityValue >= 1;
    if (m.transparent !== wasTransparent) m.needsUpdate = true;
  }
  get opacity() { return this.opacityValue; }
  set tint(v: THREE.Color | null) { this.tintValue = v; this.refreshMaterial(); }
  get tint() { return this.tintValue; }
  set tintStrength(v: number) { this.tintAmount = THREE.MathUtils.clamp(v, 0, 1); this.refreshMaterial(); }
  get tintStrength() { return this.tintAmount; }
  set highlight(v: boolean) { this.highlightValue = v; this.refreshMaterial(); }
  get highlight() { return this.highlightValue; }

  setTransform(position: THREE.Vector3, rotation?: THREE.Euler | THREE.Quaternion, scale?: number | THREE.Vector3) {
    this.mesh.position.copy(position);
    if (rotation instanceof THREE.Quaternion) this.mesh.quaternion.copy(rotation);
    else if (rotation) this.mesh.rotation.copy(rotation);
    if (typeof scale === 'number') this.mesh.scale.setScalar(scale);
    else if (scale) this.mesh.scale.copy(scale);
    this.mesh.updateMatrix();
  }

  setTime(time: number) {
    this.worldTime = time;
    const m = this.mesh.material as THREE.MeshStandardMaterial;
    const shader = m.userData.shader as { uniforms: { uWorldTime: { value: number } } } | undefined;
    if (shader?.uniforms.uWorldTime) shader.uniforms.uWorldTime.value = time;
    const depth = this.mesh.customDepthMaterial as THREE.MeshDepthMaterial | undefined;
    const depthShader = depth?.userData.shader as { uniforms: { uWorldTime: { value: number } } } | undefined;
    if (depthShader?.uniforms.uWorldTime) depthShader.uniforms.uWorldTime.value = time;
  }

  /** A lazily updated CPU copy lets raycasting follow GPU vertex animation without touching draw geometry. */
  raycastMesh(): THREE.Mesh {
    if (!this.hasAnimatedVertices) return this.mesh;
    if (!this.pickGeometry) {
      this.pickGeometry = this.mesh.geometry.clone();
      if (this.animatedBounds) this.pickGeometry.boundingSphere = this.animatedBounds.clone();
      this.pickMesh = new THREE.Mesh(this.pickGeometry, this.mesh.material);
      this.pickMesh.userData.renderObject = this;
    }

    const source = this.mesh.geometry;
    const position = source.getAttribute('position'), target = this.pickGeometry.getAttribute('position');
    const mode = source.getAttribute('aMode'), anchor = source.getAttribute('aAnchor'), axis = source.getAttribute('aAxis'), anim = source.getAttribute('aAnim');
    const p = new THREE.Vector3(), pivot = new THREE.Vector3(), rotationAxis = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
      p.fromBufferAttribute(position, i);
      const kind = mode.getX(i), phase = anim.getX(i), speed = anim.getZ(i);
      if (kind > 0.5 && kind < 1.5) {
        const weight = THREE.MathUtils.clamp((p.y - anchor.getY(i)) / Math.max(anim.getY(i), 0.18), 0, 1);
        p.x += Math.sin(this.worldTime * speed + phase) * 0.045 * weight;
        p.z += Math.cos(this.worldTime * speed * 0.83 + phase) * 0.03 * weight;
      } else if ((kind > 1.5 && kind < 2.5) || kind > 3.5) {
        pivot.fromBufferAttribute(anchor, i);
        rotationAxis.fromBufferAttribute(axis, i).normalize();
        const angle = kind < 2.5 ? this.worldTime * speed + phase : Math.sin(this.worldTime * speed + phase) * anim.getY(i);
        p.sub(pivot).applyAxisAngle(rotationAxis, angle).add(pivot);
      } else if (kind > 2.5 && kind < 3.5) {
        const drift = ((this.worldTime * speed + phase) % 1 + 1) % 1;
        p.y += drift * 0.42;
        p.x += Math.sin(this.worldTime * 1.4 + phase) * 0.035;
      }
      target.setXYZ(i, p.x, p.y, p.z);
    }
    target.needsUpdate = true;
    this.pickGeometry.computeBoundingBox();
    this.mesh.updateMatrixWorld(true);
    this.pickMesh!.matrix.copy(this.mesh.matrix);
    this.pickMesh!.matrixWorld.copy(this.mesh.matrixWorld);
    this.pickMesh!.matrixAutoUpdate = false;
    this.pickMesh!.visible = this.mesh.visible;
    return this.pickMesh!;
  }

  remove() {
    this.mesh.parent?.remove(this.mesh);
    (this.mesh.material as THREE.Material).dispose();
    (this.mesh.customDepthMaterial as THREE.Material | undefined)?.dispose();
    if (this.ownsGeometry) this.mesh.geometry.dispose();
    this.pickGeometry?.dispose();
    this.release(this);
  }

  private refreshMaterial() {
    const m = this.mesh.material as THREE.MeshStandardMaterial;
    m.color.set(0xffffff);
    if (this.tintValue && this.tintAmount) m.color.lerp(this.tintValue, this.tintAmount);
    m.emissive.set(this.highlightValue ? 0xc1d9a0 : 0x000000);
    m.emissiveIntensity = this.highlightValue ? 0.22 : 0;
  }
}

export interface Pick { object: RenderObject }

/**
 * In-repo, full-resolution Three.js renderer for the lush valley direction. Simulation and all input remain game-owned.
 * Its API is intentionally limited to camera placement, object handles, and picking.
 */
export class VerdantRenderer {
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 800);
  readonly scene = new THREE.Scene();
  width: number;
  height: number;
  private readonly gl: THREE.WebGLRenderer;
  private readonly objects = new Set<RenderObject>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly sun: THREE.DirectionalLight;
  private readonly fill: THREE.HemisphereLight;
  private readonly canvas: HTMLCanvasElement;
  private readonly world: THREE.Object3D;
  private readonly pickOccluder: THREE.Object3D | null;

  constructor(canvas: HTMLCanvasElement, world: THREE.Object3D) {
    this.canvas = canvas;
    this.world = world;
    this.pickOccluder = (world.userData.pickOccluder as THREE.Object3D | undefined) ?? null;
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.12;
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.add(world);
    this.scene.background = new THREE.Color(0xb9d7dc);
    this.scene.fog = new THREE.FogExp2(0xb9d7dc, 0.0025);

    this.fill = new THREE.HemisphereLight(0xe3f4ef, 0x607346, 1.1);
    this.scene.add(this.fill);
    this.sun = new THREE.DirectionalLight(0xfff0d1, 2.1);
    this.sun.position.set(-35, 55, 28);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -60;
    this.sun.shadow.camera.right = 60;
    this.sun.shadow.camera.top = 60;
    this.sun.shadow.camera.bottom = -60;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 180;
    this.sun.shadow.bias = -0.00018;
    this.sun.shadow.normalBias = 0.025;
    this.scene.add(this.sun, this.sun.target);

    this.width = canvas.width;
    this.height = canvas.height;
  }

  resize(width: number, height: number) {
    this.gl.setSize(width, height, false);
    this.width = width;
    this.height = height;
    this.camera.updateProjectionMatrix();
  }

  addObject(geometry: THREE.BufferGeometry): RenderObject {
    const object = new RenderObject(geometry, (o) => this.objects.delete(o));
    this.scene.add(object.mesh);
    this.objects.add(object);
    return object;
  }

  /** Camera remains orthographic and tracks game-world metres. */
  placeCamera(target: THREE.Vector3, yaw: number, elevation: number, viewHeight: number) {
    const aspect = this.height ? this.width / this.height : 1;
    const h = Math.max(0.1, viewHeight);
    this.camera.left = -h * aspect / 2;
    this.camera.right = h * aspect / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    // Orthographic zoom comes from the frustum, so keep a fixed orbit distance. Letting this shrink with `h` can put tall
    // foreground models behind the camera when zoomed in.
    const orbit = 100;
    this.camera.position.set(
      target.x + Math.sin(yaw) * Math.cos(elevation) * orbit,
      target.y + Math.sin(elevation) * orbit,
      target.z + Math.cos(yaw) * Math.cos(elevation) * orbit,
    );
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.sun.position.set(target.x - 35, 55, target.z + 28);
    this.sun.target.position.set(target.x, 0, target.z);
    this.sun.target.updateMatrixWorld();
  }

  setTimeOfDay(hour: number) {
    const daylight = THREE.MathUtils.clamp(Math.sin(((hour - 6) / 12) * Math.PI), 0, 1);
    const dusk = 1 - Math.min(1, Math.abs(hour - 6) / 3, Math.abs(hour - 18) / 3);
    this.sun.intensity = 0.2 + daylight * 2.15;
    this.fill.intensity = 0.82 + daylight * 0.42;
    this.sun.color.set(0xffe8c4).lerp(new THREE.Color(0xfff4de), daylight);
    const sky = new THREE.Color(0x829ba7).lerp(new THREE.Color(0xb9d7dc), daylight);
    if (dusk > 0) sky.lerp(new THREE.Color(0xe4a477), Math.min(0.22, dusk * 0.18));
    this.scene.background = sky;
    if (this.scene.fog instanceof THREE.FogExp2) this.scene.fog.color.copy(sky);
  }

  pick(x: number, y: number): Pick | null {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.set((x - rect.left) / rect.width * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const candidates: THREE.Mesh[] = [];
    for (const object of this.objects) {
      if (!object.pickable || !object.mesh.visible) continue;
      if (object.animated) {
        object.mesh.updateMatrixWorld(true);
        const bounds = object.pickBounds ?? object.mesh.geometry.boundingSphere;
        if (bounds && !this.raycaster.ray.intersectsSphere(bounds.clone().applyMatrix4(object.mesh.matrixWorld))) continue;
        candidates.push(object.raycastMesh());
      } else candidates.push(object.mesh);
    }
    const targets = this.pickOccluder ? [this.pickOccluder, ...candidates] : candidates;
    const hits = this.raycaster.intersectObjects(targets, this.pickOccluder !== null);
    const nearest = hits.find((hit) => hit.object.visible);
    const object = nearest?.object.userData.renderObject as RenderObject | undefined;
    return object?.pickable ? { object } : null;
  }

  /** Updates world effects, animation uniforms and the scene in one pass. */
  render(time: number) {
    const update = this.world.userData.update as ((t: number) => void) | undefined;
    update?.(time);
    for (const object of this.objects) object.setTime(time);
    this.gl.render(this.scene, this.camera);
  }
}
