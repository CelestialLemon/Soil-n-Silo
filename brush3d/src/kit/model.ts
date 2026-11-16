import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshBuilder, PLAIN, rng, srgb, type Paint } from './builder';
import { addDab, addMound } from './kit';
import type { BrushRenderer } from '../renderer/renderer';
import { GLOW, type Glow, type Parts } from '../renderer/parts';

// Models made in Blender (tools/blender/, docs/MODELS.md), as glTF: inked things, each face one colour (a custom attribute,
// _COLOR, linear, as the scenes' own colours are), its material's name saying how the ink shader finishes it. No textures:
// the look is the renderer's. What grows on a model is painted, never inked (docs/DIRECTION.md): a planted roof is a
// `moss` surface, drawn with the land's brush, and its plants are named points the scene grows painted clumps at.

/** The ink shader's finish for each material name (see INK_FRAG): plain, timber grain, glass in panes, tin. */
const FINISH: Record<string, Paint> = {
  plain: PLAIN,
  timber: [2, 1, 0, 0],
  // Two panes a metre, both ways (uv in metres): a window's panes, a solar sheet's cells.
  glass: [1, 2, 2, 0],
  // Corrugations, five a metre across the sheet (uv in metres: down the slope, along the ridge).
  tin: [3, 0, 5, 0],
};
/** A planted surface's paint: the land's brush, a little livelier, with a rim of light. */
const MOSS: Paint = [0.75, 2.6, 0.7, 0.25];

const loader = new GLTFLoader();

/** Loads a model's scene. */
export async function loadModel(url: string): Promise<THREE.Object3D> {
  return (await loader.loadAsync(url)).scene;
}

/** The plants a model's `plant_<kind>_<n>` points grow: [leaf, foot, bloom or none, dabs for a half-metre clump]. */
const PLANTS: Record<string, { leaf: number[]; foot: number; bloom?: number[]; dabs: number }> = {
  herb: { leaf: [0x7fb24e, 0x6aa04a, 0x8cba52], foot: 0x4a7e40, dabs: 12 },
  flower: { leaf: [0x74aa4c, 0x6aa04a], foot: 0x4a7e40, bloom: [0xf08bb0, 0xf5cf3e, 0xf7f2e4, 0xa77ad8, 0xe8574a], dabs: 12 },
  shrub: { leaf: [0x4e9a3a, 0x40885a, 0x5aa03e], foot: 0x2f6a42, dabs: 20 },
  vine: { leaf: [0x5aa03e, 0x4e9a3a, 0x6aa84a], foot: 0x3e7a3c, dabs: 9 },
};

/** A model's piece the game moves or changes (docs/MODELS.md), by its name. */
const PART = /^(move_spin_|running_|charge_(\d+))/;
/** The running looks that are lights, which glow at night (#205): a fire, a lamp, a beacon, a lit window. */
const LIGHT = /^running_(glow|lamp|beacon|light|fire|.*window)/;
/**
 * Windows (#205): sea-glass panes (`glass` faces, pale green-blue: the solar glass is a deep blue), which light up at night
 * while their building works. By their colour's green, linear (sea glass #9ad2c8 about 0.64, solar blue #1d4fa0 about 0.08).
 */
const WINDOW_GREEN = 0.3;
/** A window's pane stands up: its normal's height under this. */
const UPRIGHT = 0.5;
/** Puffs a smoke emitter has (#205, SMOKE_VERT: each leaves once a cycle, spread through it), their colour and paint. */
const PUFFS = 8, SMOKE = new THREE.Color(0.58, 0.57, 0.62), SMOKE_PAINT: Paint = [0.4, 0.9, -1, 0.3];
/** How green a mesh's colours are on average (linear): a window's sea glass, or the solar glass. */
function greenOf(mesh: THREE.Mesh) {
  const col = mesh.geometry.getAttribute('_color');
  if (!col) return 1;
  let g = 0;
  for (let i = 0; i < col.count; i++) g += col.getY(i);
  return g / Math.max(col.count, 1);
}
/** How fast a spinning part turns at its usual pace when its model doesn't say (radians a second). */
const SPIN_SPEED = 0.6;

/** One of a set's parts: its axle (as placed), its pace (radians a second; 0 if it doesn't turn), how it glows at night. */
interface SetPart { origin: THREE.Vector3; axis: THREE.Vector3; speed: number; glow: Glow; light?: THREE.Vector3 }

/**
 * A model's moving and changing parts as added to a ModelSet (Soil-n-Silo#205), for the game to say how they are now:
 * `spin` turns its `move_spin_*` parts, `show` its `running_*` look (its smoke and its lit windows with it) and the
 * battery's `charge_<n>` rings. Each call does
 * only its own job (docs/API.md: a mill with no power gets `spin(0)` and `show({ running: false })`). Until the set is
 * added to the renderer (addTo) it keeps what it's told, and then shows it; once its meshes are taken out, it does
 * nothing. A new one is at rest, its running look and every charge ring showing, as the model is drawn.
 */
export class ModelParts {
  /** Where smoke or steam leaves it (its `smoke_emitter`s, as placed). */
  readonly smoke: THREE.Vector3[] = [];
  /**
   * Its parts, by their index in the set: those that turn, the running looks (and its smoke's chimneys), the charge rings
   * by number, its windows (one part, lit while it works).
   */
  readonly spins: number[] = [];
  readonly running: number[] = [];
  readonly charges: number[][] = [];
  readonly windows: number[] = [];
  private table: Parts | null = null;
  private slots: readonly number[] = [];
  private gens: number[] = [];
  private pace = 0;
  private shown: { running: boolean; charge: number | null } = { running: true, charge: null };

  /** Whether it has anything to move or change. */
  get any() { return this.spins.length + this.running.length + this.charges.length + this.windows.length > 0; }

  /** Turns its spinning parts at `pace` times their usual speed (0 still, 1 the model's pace), eased to it. */
  spin(pace: number) {
    this.pace = pace;
    for (const p of this.spins) { const s = this.slot(p); if (s !== null) this.table!.spin(s, pace); }
  }

  /**
   * Its running look (`running`: its `running_*` parts show only while it works) and its charge (`charge`, 0 to 4: the
   * rings lit from the bottom up, `charge_0` first). What isn't given stays as it is.
   */
  show(o: { running?: boolean; charge?: number }) {
    if (o.running !== undefined) this.shown.running = o.running;
    if (o.charge !== undefined) this.shown.charge = o.charge;
    this.apply();
  }

  /** @internal Its parts' slots in the renderer (ModelSet.addTo), by their index in the set; what it was told, shown. */
  bind(table: Parts, slots: readonly number[]) {
    this.table = table; this.slots = slots;
    this.gens = slots.map((s) => table.generation(s));
    this.spin(this.pace);
    this.apply();
  }

  private apply() {
    if (!this.table) return;
    for (const p of this.running) { const s = this.slot(p); if (s !== null) this.table.show(s, this.shown.running); }
    for (const p of this.windows) { const s = this.slot(p); if (s !== null) this.table.light(s, this.shown.running); }
    const charge = this.shown.charge;
    this.charges.forEach((ring, n) => { for (const p of ring) { const s = this.slot(p); if (s !== null) this.table!.show(s, charge === null || n < charge); } });
  }

  /** A part's slot, or null once its meshes are taken out. */
  private slot(p: number) {
    const s = this.slots[p];
    return s !== undefined && this.table!.generation(s) === this.gens[p] ? s : null;
  }
}

/**
 * The meshes a scene's models go into: the inked things, their planted surfaces (painted), and the plants growing on
 * them (painted leaves). Fill it with `add`, then `addTo` the renderer.
 */
export class ModelSet {
  readonly ink = new MeshBuilder('ink');
  readonly paint = new MeshBuilder('paint');
  readonly leaves = new MeshBuilder('foliage');
  readonly smoke = new MeshBuilder('smoke');
  private readonly rand: () => number;
  /** The smoke's own (Soil-n-Silo#205): a chimney added takes nothing from the plants', so they grow as they did without it. */
  private readonly smokeRand: () => number;
  /** The parts of the models added, in the order added (their index is what the vertices carry, less one). */
  private readonly parts: SetPart[] = [];
  private readonly things: ModelParts[] = [];
  constructor(seed = 7) { this.rand = rng(seed); this.smokeRand = rng(seed + 1013); }

  /**
   * Adds a model, placed by `matrix`, and returns its parts, for the game to move and change (ModelParts). One that
   * `floats` (a boat) gets no waterline (#18): its inside is dry, though it's below the water's surface.
   */
  add(model: THREE.Object3D, matrix: THREE.Matrix4, floats = false): ModelParts {
    model.updateMatrixWorld(true);
    const p = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Color(), s = new THREE.Vector3(), q = new THREE.Quaternion();
    const thing = new ModelParts(), mine = new Map<THREE.Object3D, number>();
    // Its windows' part (-1: none yet), and their middle.
    const windows = { at: new THREE.Vector3(), n: 0, part: -1 };
    // Its lamps' middles (by part): where their light is, wherever their axle (often the model's own origin).
    const lamps = new Map<number, { at: THREE.Vector3; n: number }>();
    this.things.push(thing);
    // The part a mesh is of, if it is (the nearest of it and the nodes it hangs from with a part's name): its index in
    // the set, + 1; 0 for none.
    const partOf = (o: THREE.Object3D): number => {
      for (let at: THREE.Object3D | null = o; at && at !== model; at = at.parent) {
        const named = PART.exec(at.name);
        if (!named) continue;
        let i = mine.get(at);
        if (i === undefined) {
          const w = matrix.clone().multiply(at.matrixWorld), spin = named[1] === 'move_spin_';
          i = this.parts.push({
            origin: new THREE.Vector3().setFromMatrixPosition(w), axis: new THREE.Vector3().setFromMatrixColumn(w, 0).normalize(),
            speed: spin ? (at.userData.speed as number | undefined) ?? SPIN_SPEED : 0,
            glow: LIGHT.test(at.name) ? GLOW.lamp : GLOW.none,
          }) - 1;
          mine.set(at, i);
          if (spin) thing.spins.push(i);
          else if (named[2] === undefined) thing.running.push(i);
          else (thing.charges[Number(named[2])] ??= []).push(i);
        }
        return i + 1;
      }
      return 0;
    };
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const m = matrix.clone().multiply(o.matrixWorld);
      if (!mesh.isMesh) {
        const kind = /^plant_([a-z]+)_/.exec(o.name)?.[1];
        if (kind && PLANTS[kind]) { m.decompose(p, q, s); this.grow(kind, p, s.x, s.y); }
        if (/^smoke_emitter/.test(o.name)) this.chimney(thing, new THREE.Vector3().setFromMatrixPosition(m));
        return;
      }
      const name = (mesh.material as THREE.Material).name, moss = name === 'moss';
      const nm = new THREE.Matrix3().getNormalMatrix(m), b = moss ? this.paint : this.ink;
      b.part = partOf(o);
      // Its windows: one part, at their middle (for the light they throw), which never moves. Upright panes only: a
      // sea-glass awning or skylight isn't a window lit from inside.
      const glazed = !b.part && name === 'glass' && greenOf(mesh) > WINDOW_GREEN;
      if (glazed && windows.part < 0) {
        windows.part = this.parts.push({ origin: new THREE.Vector3(), axis: new THREE.Vector3(1, 0, 0), speed: 0, glow: GLOW.window }) - 1;
        thing.windows.push(windows.part);
      }
      const finish = moss ? MOSS : FINISH[name] ?? PLAIN;
      const g = mesh.geometry, paint: Paint = floats && !moss ? [finish[0], finish[1], finish[2], 1] : finish;
      const pos = g.getAttribute('position'), nrm = g.getAttribute('normal'), col = g.getAttribute('_color'), uv = g.getAttribute('uv');
      const base = b.vertexCount, lamp = b.part > 0 && this.parts[b.part - 1].glow === GLOW.lamp ? lamps.get(b.part) ?? { at: new THREE.Vector3(), n: 0 } : null;
      if (lamp) lamps.set(b.part, lamp);
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(m);
        n.fromBufferAttribute(nrm, i).applyMatrix3(nm).normalize();
        if (col) c.setRGB(col.getX(i), col.getY(i), col.getZ(i)); else c.setRGB(1, 1, 1);
        const pane = glazed && Math.abs(n.y) < UPRIGHT;
        if (pane) { b.part = windows.part + 1; windows.at.add(p); windows.n++; }
        if (lamp) { lamp.at.add(p); lamp.n++; }
        b.vertex(p, n, c, paint, uv ? [uv.getX(i), uv.getY(i)] : [0, 0]);
        if (pane) b.part = 0;
      }
      const index = g.index;
      if (index) for (let i = 0; i < index.count; i += 3) b.tri(base + index.getX(i), base + index.getX(i + 1), base + index.getX(i + 2));
      else for (let i = 0; i < pos.count; i += 3) b.tri(base + i, base + i + 1, base + i + 2);
      b.part = 0;
    });
    // Each charge ring by its number, none missing.
    for (let k = 0; k < thing.charges.length; k++) thing.charges[k] ??= [];
    if (windows.part >= 0) this.parts[windows.part].origin.copy(windows.at.divideScalar(Math.max(windows.n, 1)));
    for (const [k, l] of lamps) if (l.n) this.parts[k - 1].light = l.at.divideScalar(l.n);
    return thing;
  }

  /**
   * Smoke from a chimney (#205, a model's `smoke_emitter` at `at`): its puffs, and a part for it that shows while its
   * building works (with its running look), so the smoke starts and stops with it.
   */
  private chimney(thing: ModelParts, at: THREE.Vector3) {
    thing.smoke.push(at);
    const i = this.parts.push({ origin: at.clone(), axis: new THREE.Vector3(1, 0, 0), speed: 0, glow: GLOW.none }) - 1;
    thing.running.push(i);
    this.smoke.part = i + 1;
    const up = new THREE.Vector3(0, 1, 0), rand = this.smokeRand;
    for (let k = 0; k < PUFFS; k++) {
      addDab(this.smoke, at, up, SMOKE.clone().offsetHSL(0, 0, (rand() - 0.5) * 0.06), 0.3 * (0.8 + rand() * 0.4),
        (k + rand() * 0.6) / PUFFS, SMOKE_PAINT);
    }
    this.smoke.part = 0;
  }

  /** A painted plant at a model's point: a cushion `radius` across and `tall` high; a vine is a column of them. */
  private grow(kind: string, at: THREE.Vector3, radius: number, tall: number) {
    const spec = PLANTS[kind], rand = this.rand;
    const pick = (list: number[]) => srgb(list[Math.floor(rand() * list.length)]);
    const leaf = pick(spec.leaf), foot = srgb(spec.foot), bloom = spec.bloom ? pick(spec.bloom) : undefined;
    const dabs = Math.round(spec.dabs * Math.max(0.6, radius / 0.5));
    if (kind !== 'vine') { addMound(this.leaves, at.x, at.y, at.z, radius, tall, leaf, foot, dabs, rand, bloom); return; }
    for (let y = 0; y < tall; y += radius * 0.9) {
      const k = 1 - 0.35 * (y / tall);
      addMound(this.leaves, at.x + (rand() - 0.5) * radius * 0.5, at.y + y, at.z + (rand() - 0.5) * radius * 0.5, radius * k, radius * 1.3,
        leaf.clone().offsetHSL(0, 0, (rand() - 0.5) * 0.05), foot, dabs, rand);
    }
  }

  /**
   * Adds the set's meshes to the renderer, and returns them (for whoever takes them out again: `r.remove` each). `tag` goes
   * with each, for picking (MeshOptions.tag): a set that is one thing, a building.
   */
  addTo(r: Pick<BrushRenderer, 'add'> & Partial<Pick<BrushRenderer, 'parts'>>, tag?: unknown): THREE.Mesh[] {
    const out: THREE.Mesh[] = [];
    // Its parts get their slots in the renderer, for the game to move and change through each model's ModelParts. (A
    // renderer stand-in without parts draws them where they rest.)
    const table = r.parts, slots = table ? this.parts.map((p) => table.add(p.origin, p.axis, p.speed, p.glow, p.light)) : undefined;
    if (this.ink.vertexCount) out.push(r.add(this.ink.build(slots), 'ink', { tag }));
    // A planted roof is a roof: rain and snow stop at it, as at an inked one (paint is no cover unless told).
    if (this.paint.vertexCount) out.push(r.add(this.paint.build(slots), 'paint', { seasonal: true, cover: 'full', tag }));
    if (this.leaves.vertexCount) out.push(r.add(this.leaves.build(), 'foliage', { cover: 'none', seasonal: true, tag }));
    // Its smoke isn't the thing (no tag: a pick sees through it), and casts no shadow. Without parts there's none to draw.
    if (this.smoke.vertexCount && slots) out.push(r.add(this.smoke.build(slots), 'smoke', { cover: 'none', castShadow: false }));
    // Bound before the slots no mesh took are freed: a handle keeps the part a slot held, so it never moves the next one in it.
    if (table && slots) { for (const t of this.things) t.bind(table, slots); table.unheld(slots); }
    return out;
  }
}
