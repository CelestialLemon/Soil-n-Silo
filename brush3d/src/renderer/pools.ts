import * as THREE from 'three';

// Fewer draws (Soil-n-Silo#250). Every mesh a pass draws was a draw call of its own (each of a big map's tiles, tiles.ts,
// in each pass: the sun's shadow, the water's two, the silhouettes, the paint; each building's parts), and on the big
// maps that was over a thousand calls a frame, each costing the CPU more than the GPU. Here the meshes' vertices are kept
// together in a few big buffers ("pages", one set for each layout of attributes), and every mesh a pass would draw from
// one page, with one material, is drawn in one call (WebGL's multi-draw: one call, many stretches of the page's
// triangles). The meshes stay meshes in the scene, as before, with their own geometry: what reads or changes it (the
// springs, the shelter, the heights, a tree cleared, the marks) sees no difference; their arrays are views of the page's,
// so the memory isn't doubled. Just before three.js draws a scene hooked here, each pooled mesh it would draw (shown, in
// view) is hidden and its triangles listed for its page's draw instead, in the order three.js would draw them (front to
// back); just after, the meshes are shown again. So each pass still chooses what it draws, as before.

/**
 * The most vertices (and indices, separately) a page grows to; a geometry bigger than that gets a page of its own size. A
 * page starts small and grows as it fills. Big, so a pass's draws from it are near the order three.js would draw them
 * in (front to back across the whole map, which spares the GPU painting what's then hidden): with pages an eighth the
 * size, the sun's shadow cost 0.15 ms more at night on the c8 farm.
 */
const PAGE_VERTICES = 1 << 21;
const PAGE_INDICES = 1 << 22;
const FIRST_VERTICES = 1 << 15;
const FIRST_INDICES = 1 << 16;

/** Free stretches of a page's vertices or indices, [start, length], in order; first fit, merged as they're freed. */
class Stretches {
  private free: [number, number][];
  constructor(size: number) { this.free = [[0, size]]; }
  take(n: number) {
    for (let i = 0; i < this.free.length; i++) {
      const f = this.free[i];
      if (f[1] < n) continue;
      const start = f[0];
      if (f[1] === n) this.free.splice(i, 1); else { f[0] += n; f[1] -= n; }
      return start;
    }
    return -1;
  }
  give(start: number, n: number) {
    let i = 0;
    while (i < this.free.length && this.free[i][0] < start) i++;
    this.free.splice(i, 0, [start, n]);
    // Merged with the next, then with the one before.
    const next = this.free[i + 1];
    if (next && start + n === next[0]) { this.free[i][1] += next[1]; this.free.splice(i + 1, 1); }
    const before = this.free[i - 1];
    if (before && before[0] + before[1] === start) { before[1] += this.free[i][1]; this.free.splice(i, 1); }
  }
  /** Where the free stretch at the end (up to `size`) starts: past it, nothing is held. */
  end(size: number) {
    const last = this.free.at(-1);
    return last && last[0] + last[1] === size ? last[0] : size;
  }
  /** From `size` long to `to` (no shorter than end()). */
  resize(size: number, to: number) {
    if (to > size) { this.give(size, to - size); return; }
    const last = this.free.at(-1);
    if (to === size || !last) return;
    last[1] = to - last[0];
    if (!last[1]) this.free.pop();
  }
}

/** The meshes drawn from one page with one material (and one order among the passes' draws): one multi-draw. */
type Proxy = THREE.Mesh & {
  isBatchedMesh: boolean; _multiDrawStarts: Int32Array; _multiDrawCounts: Int32Array; _multiDrawCount: number;
  _multiDrawInstances: null; _matricesTexture: null; _indirectTexture: null; _colorsTexture: null; colorTexture: null;
};

/** A geometry's attribute in a page: its own, the page's, the version last sent up, and the view of the page's it reads. */
interface Part { name: string; own: THREE.BufferAttribute; into: THREE.BufferAttribute; version: number; view: THREE.TypedArray }

/** Where a geometry lies in its page. */
interface Slot {
  geometry: THREE.BufferGeometry; page: Page; vertex: number; vertices: number; first: number; count: number;
  parts: Part[]; index: THREE.BufferAttribute; indexVersion: number;
}

/** Big buffers of one layout of attributes (their names, sizes and types), holding many geometries' vertices. */
class Page {
  geometry: THREE.BufferGeometry;
  index: Uint32Array;
  vertexCap: number;
  indexCap: number;
  readonly vertices: Stretches;
  readonly indices: Stretches;
  /** Its draws, by the material drawn with and the order drawn in. */
  readonly proxies = new Map<THREE.Material, Map<number, Proxy>>();
  /** What it holds. */
  readonly slots = new Set<Slot>();
  /** Drawn yet: its buffers are on the GPU, so a new size costs sending them up again. */
  drawn = false;
  /** Trimmed since it was last sized (see trim). */
  snug = false;
  readonly layout: string;

  constructor(layout: string, like: THREE.BufferGeometry, vertexCap: number, indexCap: number) {
    this.layout = layout;
    this.vertexCap = vertexCap;
    this.indexCap = indexCap;
    this.vertices = new Stretches(vertexCap);
    this.indices = new Stretches(indexCap);
    this.index = new Uint32Array(indexCap);
    this.geometry = Page.buffers(like, vertexCap, this.index);
  }

  /** A page's geometry: `like`'s attributes, `vertexCap` long (what they hold copied in, up to that); the index given. */
  private static buffers(like: THREE.BufferGeometry, vertexCap: number, index: Uint32Array) {
    const g = new THREE.BufferGeometry();
    for (const [name, a] of Object.entries(like.attributes) as [string, THREE.BufferAttribute][]) {
      const Array = a.array.constructor as Float32ArrayConstructor, array = new Array(vertexCap * a.itemSize);
      array.set((a.array as Float32Array).subarray(0, Math.min(a.array.length, array.length)));
      g.setAttribute(name, new THREE.BufferAttribute(array, a.itemSize, a.normalized));
    }
    g.setIndex(new THREE.BufferAttribute(index, 1));
    // Never culled, and sorted as at the origin (three.js would otherwise measure the whole page).
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
    g.boundingBox = new THREE.Box3(new THREE.Vector3(-Infinity, -Infinity, -Infinity), new THREE.Vector3(Infinity, Infinity, Infinity));
    return g;
  }

  /** Trimmed to what it holds and an eighth more (for what's added later): only before it's first drawn, when it's free. */
  trim() {
    const fit = (end: number, cap: number) => Math.min(cap, Math.max(1, Math.ceil(end * 1.125)));
    const v = fit(this.vertices.end(this.vertexCap), this.vertexCap), i = fit(this.indices.end(this.indexCap), this.indexCap);
    if (v < this.vertexCap || i < this.indexCap) this.resize(v, i);
    this.snug = true;
  }

  /**
   * Sizes it to hold `vertexCap` vertices and `indexCap` indices: its buffers made anew (and sent up whole), what it holds
   * copied into them, and its geometries' arrays made views of the new ones. (Not one given an array of its own since:
   * it's taken out of the page before the next draw, see Pools.sync.)
   */
  resize(vertexCap: number, indexCap: number) {
    const old = this.geometry, index = new Uint32Array(indexCap);
    index.set(this.index.subarray(0, indexCap));
    this.geometry = Page.buffers(old, vertexCap, index);
    this.index = index;
    for (const slot of this.slots) for (const part of slot.parts) {
      const into = this.geometry.getAttribute(part.name) as THREE.BufferAttribute, k = into.itemSize;
      const view = (into.array as Float32Array).subarray(slot.vertex * k, (slot.vertex + slot.vertices) * k);
      if (part.own.array === part.view) part.own.array = view;
      part.into = into;
      part.view = view;
    }
    this.vertices.resize(this.vertexCap, vertexCap);
    this.indices.resize(this.indexCap, indexCap);
    this.vertexCap = vertexCap;
    this.indexCap = indexCap;
    this.snug = false;
    for (const byOrder of this.proxies.values()) for (const p of byOrder.values()) p.geometry = this.geometry;
    old.dispose();
  }

  /** Where `vertices` vertices and `count` indices go in it, if there's room; [-1, -1] if not. */
  take(vertices: number, count: number) {
    const vertex = this.vertices.take(vertices);
    if (vertex < 0) return [-1, -1];
    const first = this.indices.take(count);
    if (first < 0) { this.vertices.give(vertex, vertices); return [-1, -1]; }
    return [vertex, first];
  }

  /**
   * Grown to fit `vertices` vertices and `count` indices more at its end, if it can grow that far: doubled before it's
   * drawn (it's trimmed after), by a quarter once it has been (each growth sends the whole page up again).
   */
  grow(vertices: number, count: number) {
    const by = this.drawn ? 1.25 : 2;
    const to = (cap: number, most: number, end: number, need: number) => cap >= most && end + need > cap ? -1
      : Math.min(most, Math.max(Math.ceil(cap * by), end + need));
    const v = to(this.vertexCap, PAGE_VERTICES, this.vertices.end(this.vertexCap), vertices);
    const i = to(this.indexCap, PAGE_INDICES, this.indices.end(this.indexCap), count);
    if (v < 0 || i < 0 || this.vertices.end(this.vertexCap) + vertices > v || this.indices.end(this.indexCap) + count > i) return false;
    this.resize(Math.max(v, this.vertexCap), Math.max(i, this.indexCap));
    return true;
  }

  proxy(material: THREE.Material, renderOrder: number) {
    let byOrder = this.proxies.get(material);
    if (!byOrder) this.proxies.set(material, byOrder = new Map<number, Proxy>());
    let p = byOrder.get(renderOrder);
    if (!p) {
      p = Object.assign(new THREE.Mesh(this.geometry, material), {
        isBatchedMesh: true, _multiDrawStarts: new Int32Array(16), _multiDrawCounts: new Int32Array(16), _multiDrawCount: 0,
        _multiDrawInstances: null, _matricesTexture: null, _indirectTexture: null, _colorsTexture: null, colorTexture: null,
      });
      p.frustumCulled = false;
      p.renderOrder = renderOrder;
      p.matrixAutoUpdate = false;
      p.matrixWorldAutoUpdate = false;
      byOrder.set(renderOrder, p);
    }
    return p;
  }

  dispose() { this.geometry.dispose(); }
}

/** A mesh drawn from a page this pass, and where three.js would have put it among the draws. */
interface Entry { slot: Slot; z: number; id: number }

export class Pools {
  private pages = new Map<string, Page[]>();
  private slots = new Map<THREE.BufferGeometry, Slot>();
  private pooled = new WeakSet<THREE.BufferAttribute>();
  /** Each material's twin for the pages' draws: its own (three.js compiles it for multi-draw), all else read through. */
  private twins = new Map<THREE.Material, THREE.Material>();
  private hidden: THREE.Object3D[] = [];
  private shown: Proxy[] = [];
  private lists = new Map<Proxy, Entry[]>();
  private frustum = new THREE.Frustum();
  private screen = new THREE.Matrix4();
  private centre = new THREE.Vector4();
  /** Whether to draw from the pages (asked at each draw); not, each mesh is drawn as its own call (for comparing). */
  private readonly enabled: () => boolean;

  constructor(enabled: () => boolean) { this.enabled = enabled; }

  /** Pools draws of `scene` while three.js renders it. */
  hook(scene: THREE.Scene) {
    scene.onBeforeRender = (_gl, _scene, camera) => this.before(scene, camera);
    scene.onAfterRender = () => this.after(scene);
  }

  /**
   * Puts a geometry's vertices into a page, if it can be (indexed, every attribute plain, nothing shared with another
   * geometry pooled already): its attributes' arrays become views of the page's. Returns whether it did.
   */
  add(geometry: THREE.BufferGeometry) {
    if (this.slots.has(geometry) || !poolable(geometry)) return false;
    const index = geometry.getIndex()!;
    const attributes = Object.entries(geometry.attributes);
    for (const [, a] of attributes) if ((a as THREE.InterleavedBufferAttribute).isInterleavedBufferAttribute || this.pooled.has(a as THREE.BufferAttribute)) return false;
    const vertices = attributes[0][1].count, count = index.count;
    if (attributes.some(([, a]) => a.count !== vertices)) return false;
    const layout = attributes.map(([n, a]) => `${n}:${a.itemSize}:${a.array.constructor.name}:${a.normalized ? 1 : 0}`).sort().join(',');
    const pages = this.pages.get(layout) ?? [];
    this.pages.set(layout, pages);
    let page: Page | undefined, vertex = -1, first = -1;
    for (const p of pages) {
      [vertex, first] = p.take(vertices, count);
      if (vertex >= 0) { page = p; break; }
    }
    // The last page grown, or a new one.
    const last = pages.at(-1);
    if (!page && last?.grow(vertices, count)) {
      [vertex, first] = last.take(vertices, count);
      if (vertex >= 0) page = last;
    }
    if (!page) {
      page = new Page(layout, geometry, Math.max(FIRST_VERTICES, vertices), Math.max(FIRST_INDICES, count));
      pages.push(page);
      [vertex, first] = page.take(vertices, count);
    }
    const slot: Slot = { geometry, page, vertex, vertices, first, count, parts: [], index, indexVersion: index.version };
    for (const [name, a] of attributes as [string, THREE.BufferAttribute][]) {
      const into = page.geometry.getAttribute(name) as THREE.BufferAttribute, k = a.itemSize;
      const view = (into.array as Float32Array).subarray(vertex * k, (vertex + vertices) * k);
      view.set(a.array);
      a.array = view;
      into.addUpdateRange(vertex * k, vertices * k);
      into.needsUpdate = true;
      slot.parts.push({ name, own: a, into, version: a.version, view });
      this.pooled.add(a);
    }
    this.sendIndex(slot);
    page.slots.add(slot);
    this.slots.set(geometry, slot);
    return true;
  }

  /**
   * Takes a geometry out of its page, giving it its own arrays again (it may be the caller's, and drawn again), unless
   * `keep` is false (it's about to be thrown away: its arrays are then the page's, which another may take).
   */
  remove(geometry: THREE.BufferGeometry, keep = true) {
    const slot = this.slots.get(geometry);
    if (!slot) return;
    this.slots.delete(geometry);
    for (const part of slot.parts) {
      if (keep && part.own.array === part.view) part.own.array = part.view.slice();
      this.pooled.delete(part.own);
    }
    const page = slot.page;
    page.vertices.give(slot.vertex, slot.vertices);
    page.indices.give(slot.first, slot.count);
    page.slots.delete(slot);
    if (page.slots.size) return;
    // Its last: the page goes, and its buffers with it.
    const pages = this.pages.get(page.layout)!;
    pages.splice(pages.indexOf(page), 1);
    if (!pages.length) this.pages.delete(page.layout);
    page.dispose();
  }

  /** The page's indices for a geometry: its own, moved on by where its vertices start in the page. */
  private sendIndex(slot: Slot) {
    const own = slot.index.array, page = slot.page;
    for (let i = 0; i < slot.count; i++) page.index[slot.first + i] = own[i] + slot.vertex;
    const into = page.geometry.getIndex()!;
    into.addUpdateRange(slot.first, slot.count);
    into.needsUpdate = true;
  }

  /**
   * What changed in the geometries since (their attributes' versions moved on: colours turned, trees cleared or moved)
   * goes up with their pages: each changed attribute's whole stretch (whatever was sent up while the pools were off, its
   * own ranges then are gone). One given new attributes, arrays or index, or drawn in part, is taken out of its page.
   */
  private sync() {
    for (const slot of this.slots.values()) {
      const g = slot.geometry;
      if (!poolable(g) || g.index !== slot.index || Object.keys(g.attributes).length !== slot.parts.length ||
        slot.parts.some((p) => g.attributes[p.name] !== p.own || p.own.array !== p.view)) { this.remove(g); continue; }
      for (const part of slot.parts) {
        const a = part.own;
        if (a.version === part.version) continue;
        part.version = a.version;
        part.into.addUpdateRange(slot.vertex * a.itemSize, slot.vertices * a.itemSize);
        part.into.needsUpdate = true;
        // (Its own ranges are sent up with the page's; drawn on its own later, it's sent whole.)
        a.clearUpdateRanges();
      }
      if (slot.index.version !== slot.indexVersion) {
        slot.indexVersion = slot.index.version;
        this.sendIndex(slot);
        slot.index.clearUpdateRanges();
      }
    }
  }

  /** Material `m`'s twin for the pages' draws: everything (its shaders, uniforms, depth test, side) read from it as it is now. */
  private twinOf(m: THREE.Material) {
    let twin = this.twins.get(m);
    if (!twin) {
      const made = Object.create(m) as THREE.Material;
      // Its own listeners (three.js frees what it compiled for it when it's disposed), not the material's.
      (made as unknown as { _listeners: object })._listeners = {};
      this.twins.set(m, twin = made);
      // Thrown away with it, and the pages' draws with it.
      const gone = () => {
        m.removeEventListener('dispose', gone);
        this.twins.delete(m);
        for (const pages of this.pages.values()) for (const p of pages) p.proxies.delete(made);
        made.dispose();
      };
      m.addEventListener('dispose', gone);
    }
    return twin;
  }

  private before(scene: THREE.Scene, camera: THREE.Camera) {
    if (!this.enabled() || !this.slots.size) return;
    this.sync();
    for (const pages of this.pages.values()) for (const p of pages) if (!p.drawn && !p.snug) p.trim();
    this.screen.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.screen, THREE.WebGLCoordinateSystem, (camera as THREE.PerspectiveCamera).reversedDepth);
    this.collect(scene, camera);
    if (!this.lists.size) return;
    for (const [proxy, list] of this.lists) {
      // Front to back, as three.js sorts what's opaque (then by when the mesh was made).
      list.sort((a, b) => a.z - b.z || a.id - b.id);
      let starts = proxy._multiDrawStarts, counts = proxy._multiDrawCounts;
      if (starts.length < list.length) {
        proxy._multiDrawStarts = starts = new Int32Array(list.length * 2);
        proxy._multiDrawCounts = counts = new Int32Array(list.length * 2);
      }
      list.forEach((e, i) => { starts[i] = e.slot.first * 4; counts[i] = e.slot.count; });
      proxy._multiDrawCount = list.length;
      list[0].slot.page.drawn = true;
      this.shown.push(proxy);
      scene.add(proxy);
    }
    this.lists.clear();
  }

  /** Finds the pooled meshes three.js would draw (shown, in view), hiding each and listing it for its page's draw. */
  private collect(parent: THREE.Object3D, camera: THREE.Camera) {
    for (const o of parent.children) {
      if (!o.visible) continue;
      const mesh = o as THREE.Mesh, slot = mesh.isMesh ? this.slots.get(mesh.geometry) : undefined;
      // Only what a page's draw can stand for: a mesh where its geometry was made (the draw has one place, the world's
      // origin), on the first layer (as the draw is), with one of the renderer's own materials (three.js's own read
      // what a real batch has), drawn as triangles.
      const m = mesh.material as THREE.ShaderMaterial;
      if (!slot || o.children.length || !m.isShaderMaterial || m.wireframe || o.layers.mask !== 1 || !isIdentity(o.matrixWorld)) {
        if (o.children.length) this.collect(o, camera);
        continue;
      }
      o.visible = false;
      this.hidden.push(o);
      if (!o.layers.test(camera.layers) || (o.frustumCulled && !this.frustum.intersectsObject(o))) continue;
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      const sphere = mesh.geometry.boundingSphere!;
      const z = this.centre.set(sphere.center.x, sphere.center.y, sphere.center.z, 1).applyMatrix4(this.screen).z;
      const proxy = slot.page.proxy(this.twinOf(m), o.renderOrder);
      let list = this.lists.get(proxy);
      if (!list) this.lists.set(proxy, list = []);
      list.push({ slot, z, id: o.id });
    }
  }

  private after(scene: THREE.Scene) {
    for (const o of this.hidden) o.visible = true;
    this.hidden.length = 0;
    for (const p of this.shown) scene.remove(p);
    this.shown.length = 0;
  }
}

/** Whether a geometry's draw is one a page can make: all of it, indexed, as triangles of plain attributes. */
function poolable(g: THREE.BufferGeometry) {
  return !!g.index && Object.keys(g.attributes).length > 0 && !g.groups.length && !Object.keys(g.morphAttributes).length &&
    g.drawRange.start === 0 && g.drawRange.count === Infinity;
}

function isIdentity(m: THREE.Matrix4) {
  const e = m.elements;
  return e[0] === 1 && e[5] === 1 && e[10] === 1 && e[15] === 1 && e[1] === 0 && e[2] === 0 && e[3] === 0 && e[4] === 0 &&
    e[6] === 0 && e[7] === 0 && e[8] === 0 && e[9] === 0 && e[11] === 0 && e[12] === 0 && e[13] === 0 && e[14] === 0;
}
