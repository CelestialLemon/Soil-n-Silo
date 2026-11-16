import * as THREE from 'three';

// What the game's tools draw over the finished picture (Soil-n-Silo#206): the building being placed, a blueprint of it in
// the colour for whether it fits (a preview), and lines: routes on the ground, the power networks' wires between pylon tops, a range's
// dashed ring, the frame round a footprint being built. They're the player's tools, not the world, so they're drawn after the
// post pass: no fog, haze or grade over them, never in the G-buffer (so never picked, never casting a shadow or sheltering
// anything), and hidden only where something of the world stands in front of them (the G-buffer's depth there).

/** Whether the building being placed fits where it is. */
export type PreviewState = 'fits' | 'blocked';

/** A point of a line (m); one with no `y` lies on the land. */
export interface LinePoint { x: number; y?: number; z: number }

/**
 * A line the game shows: `route`, a band along the land; `dashed`, the same broken into dashes (a range's ring); `wire`, a
 * thin line in the air sagging between its points (pylon tops). `color` is sRGB; `width` metres (it never draws thinner
 * than a couple of pixels, so it reads at every zoom); `closed` joins the last point to the first.
 */
export interface Line {
  points: LinePoint[];
  color: number;
  style: 'route' | 'wire' | 'dashed';
  width?: number;
  opacity?: number;
  closed?: boolean;
}

/**
 * How a preview is drawn: its colour where it fits and where it doesn't (sRGB), how much of that colour is laid over the
 * model's own (`tint`, 0..1), how solid it is (`opacity`), how much the sun shades it (`shade`, 0 flat to 1), and how much
 * level lines across it show, a blueprint's, solid and in the colour (`lines`, 0..1).
 */
export interface PreviewLook { fits: number; blocked: number; tint: number; opacity: number; shade: number; lines: number }
/**
 * The blueprint, the developer's pick (#206, 2026-11-16, over see-through glass and a nearly solid model): a faint body all in
 * the colour, a little shaded, with solid level lines across it, so it never reads as a building already there.
 */
export const PREVIEW_LOOK: PreviewLook = { fits: 0x9dffc0, blocked: 0xff6a50, tint: 1, opacity: 0.28, shade: 0.4, lines: 1 };
/** How far apart a preview's level lines are (m). */
const LEVEL_LINES = 0.6;
const WIDTH = { route: 0.5, dashed: 0.3, wire: 0.12 } as const, MIN_PX = { route: 3, dashed: 2.5, wire: 1.6 } as const;
/** How far a line on the land is lifted off it (m), how far apart its points are laid along it, and a dash and its gap. */
const LIFT = 0.08, STEP = 1, DASH = 1.2, GAP = 0.8;
/** A wire's sag, as a share of its span, and at most (m). */
const SAG = 0.05, MAX_SAG = 1.4;

// Hidden where the world shows nearer (its depth from the G-buffer, resolved and half-float: allowing for its rounding).
const HIDDEN = /* glsl */ `
uniform sampler2D uOnTopAux;
bool hiddenAt(float depth) {
  float shown = texelFetch(uOnTopAux, ivec2(gl_FragCoord.xy), 0).z;
  return shown > 0.0 && depth > shown + 0.15 + shown * 0.004;
}
vec3 toSrgbOnTop(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
`;

const PREVIEW_VERT = /* glsl */ `
invariant gl_Position;
varying vec3 vColorOnTop;
varying vec3 vNormalOnTop;
varying float vHeightOnTop;
varying float vDepthOnTop;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0), vp = viewMatrix * wp;
  vNormalOnTop = normalize(mat3(modelMatrix) * normal);
  vHeightOnTop = wp.y;
#ifdef USE_COLOR
  vColorOnTop = color.rgb;
#else
  vColorOnTop = vec3(0.8);
#endif
  vDepthOnTop = -vp.z;
  gl_Position = projectionMatrix * vp;
}
`;
const PREVIEW_FRAG = /* glsl */ `
${HIDDEN}
uniform vec3 uPreviewColor;
uniform vec4 uPreviewLook;
uniform vec3 uSunDir;
varying vec3 vColorOnTop;
varying vec3 vNormalOnTop;
varying float vHeightOnTop;
varying float vDepthOnTop;
layout(location = 0) out vec4 outColor;
void main() {
  if (hiddenAt(vDepthOnTop)) discard;
  // uPreviewLook: how much of the state's colour (x), how solid (y), how much the sun shades it (z), how much its level
  // lines show (w): a line a pixel or so wide at each LEVEL_LINES of height, on the surfaces that rise (a flat roof at a
  // line's height would be all line).
  float lit = mix(1.0, 0.62 + 0.38 * max(dot(normalize(vNormalOnTop), uSunDir), 0.0), uPreviewLook.z);
  vec3 c = mix(toSrgbOnTop(vColorOnTop), uPreviewColor, uPreviewLook.x) * lit;
  float h = vHeightOnTop / ${LEVEL_LINES.toFixed(2)}, rise = fwidth(h), fh = max(rise, 1e-4);
  float line = uPreviewLook.w * (1.0 - smoothstep(0.6, 1.4, abs(fract(h + 0.5) - 0.5) / fh)) * smoothstep(0.002, 0.006, rise);
  outColor = vec4(mix(c, uPreviewColor, line), mix(uPreviewLook.y, 1.0, line));
}
`;
const DEPTH_FRAG = /* glsl */ `
layout(location = 0) out vec4 outColor;
void main() { outColor = vec4(0.0); }
`;

// A line's vertex is its middle; it's pushed sideways (aSide.xyz, a unit across it, signed) by half its width (aSide.w,
// metres) or by half aMinPx CSS pixels (uOnTopScreen: the width drawn, device pixels, and device pixels a CSS pixel),
// whichever is wider.
const LINE_VERT = /* glsl */ `
attribute vec4 aSide;
attribute float aMinPx;
uniform vec2 uOnTopScreen;
varying vec4 vColorOnTop;
varying float vDepthOnTop;
void main() {
  float pxPerMetre = projectionMatrix[0][0] * uOnTopScreen.x * 0.5;
  vec3 p = position + aSide.xyz * max(aSide.w, aMinPx * uOnTopScreen.y * 0.5 / pxPerMetre);
  vec4 vp = viewMatrix * modelMatrix * vec4(p, 1.0);
  vColorOnTop = color;
  vDepthOnTop = -vp.z;
  gl_Position = projectionMatrix * vp;
}
`;
const LINE_FRAG = /* glsl */ `
${HIDDEN}
varying vec4 vColorOnTop;
varying float vDepthOnTop;
layout(location = 0) out vec4 outColor;
void main() {
  if (hiddenAt(vDepthOnTop)) discard;
  outColor = vec4(toSrgbOnTop(vColorOnTop.rgb), vColorOnTop.a);
}
`;

const UP = new THREE.Vector3(0, 1, 0);

export class OnTop {
  private readonly previews = new THREE.Scene();
  private readonly lines = new THREE.Scene();
  /** Each group's lines and their mesh, and the land they were laid on (a group with a point on the land is laid again when it moves). */
  private readonly groups = new Map<string, { lines: readonly Line[]; mesh: THREE.Mesh; land: string | null }>();
  private readonly aux: THREE.IUniform<THREE.Texture | null> = { value: null };
  private readonly screen = { value: new THREE.Vector2(1, 1) };
  private readonly sunDir: THREE.IUniform<THREE.Vector3>;
  private readonly depthOnly: THREE.ShaderMaterial;
  private readonly lineMaterial: THREE.ShaderMaterial;
  private readonly land: (x: number, z: number) => number;
  private readonly landRevision: () => string;
  private look = PREVIEW_LOOK;
  /** The look's tint, opacity, shade and lines, shared by every preview's material. */
  private readonly lookUniform = { value: new THREE.Vector4() };

  /** `sunDir` is the scene's (shared); `land` the land's height as drawn, which changes with `landRevision`. */
  constructor(sunDir: THREE.IUniform<THREE.Vector3>, land: (x: number, z: number) => number, landRevision: () => string) {
    this.sunDir = sunDir;
    this.land = land;
    this.landRevision = landRevision;
    this.setLook(PREVIEW_LOOK);
    this.depthOnly = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, vertexShader: PREVIEW_VERT, fragmentShader: DEPTH_FRAG, colorWrite: false, side: THREE.DoubleSide,
    });
    this.lineMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, vertexColors: true, transparent: true,
      depthWrite: false, depthTest: false, side: THREE.DoubleSide,
      uniforms: { uOnTopAux: this.aux, uOnTopScreen: this.screen },
    });
  }

  /** How previews are drawn (PREVIEW_LOOK, the blueprint, by default), the ones shown too. */
  setLook(look: PreviewLook) {
    this.look = look;
    this.lookUniform.value.set(look.tint, look.opacity, look.shade, look.lines);
    for (const m of this.previews.children) this.setPreview(m as THREE.Mesh, m.userData.preview as PreviewState);
  }

  /** A preview of what would be built, `geometry` (the caller's, with its colours) placed by the mesh returned. */
  addPreview(geometry: THREE.BufferGeometry, state: PreviewState): THREE.Mesh {
    const material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, vertexShader: PREVIEW_VERT, fragmentShader: PREVIEW_FRAG, vertexColors: !!geometry.getAttribute('color'),
      transparent: true, depthWrite: false, depthFunc: THREE.LessEqualDepth, side: THREE.DoubleSide,
      uniforms: {
        uOnTopAux: this.aux, uSunDir: this.sunDir, uPreviewColor: { value: new THREE.Color() }, uPreviewLook: this.lookUniform,
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    this.setPreview(mesh, state);
    this.previews.add(mesh);
    return mesh;
  }

  setPreview(mesh: THREE.Mesh, state: PreviewState) {
    // Laid over the finished picture, which is sRGB: kept as given.
    ((mesh.material as THREE.ShaderMaterial).uniforms.uPreviewColor.value as THREE.Color)
      .setHex(state === 'fits' ? this.look.fits : this.look.blocked, THREE.LinearSRGBColorSpace);
    mesh.userData.preview = state;
  }

  /** Takes a preview out (its geometry stays the caller's). */
  removePreview(mesh: THREE.Mesh) {
    this.previews.remove(mesh);
    (mesh.material as THREE.Material).dispose();
  }

  /** The lines of a group (a group's lines replace its last), or none. */
  setLines(lines: readonly Line[] | null, group: string) {
    const was = this.groups.get(group);
    if (was) { this.lines.remove(was.mesh); was.mesh.geometry.dispose(); this.groups.delete(group); }
    if (!lines?.length) return;
    const g = this.build(lines);
    if (!g) return;
    const mesh = new THREE.Mesh(g, this.lineMaterial);
    mesh.frustumCulled = false;
    this.lines.add(mesh);
    const draped = lines.some((l) => l.points.some((p) => p.y === undefined));
    this.groups.set(group, { lines, mesh, land: draped ? this.landRevision() : null });
  }

  get any() { return this.previews.children.length > 0 || this.lines.children.length > 0; }

  /** Draws it all over the finished picture in `target` (null: the canvas), hidden where `aux`'s depth shows the world nearer. */
  draw(gl: THREE.WebGLRenderer, camera: THREE.Camera, aux: THREE.Texture, target: THREE.WebGLRenderTarget | null, width: number, pixelRatio: number) {
    if (!this.any) return;
    // Lines on the land laid again on it once it's moved (an earthwork swapped in).
    const land = this.landRevision();
    for (const [group, g] of [...this.groups]) if (g.land !== null && g.land !== land) this.setLines(g.lines, group);
    this.aux.value = aux;
    this.screen.value.set(width, pixelRatio);
    gl.setRenderTarget(target);
    if (this.previews.children.some((m) => m.visible)) {
      // Its own depth first, so each preview shows its nearest side only, evenly see-through.
      gl.clear(false, true, false);
      this.previews.overrideMaterial = this.depthOnly;
      gl.render(this.previews, camera);
      this.previews.overrideMaterial = null;
      gl.render(this.previews, camera);
    }
    if (this.lines.children.length) gl.render(this.lines, camera);
  }

  /** The lines' geometry: each piece a band across its way, two vertices a point (or none). */
  private build(lines: readonly Line[]): THREE.BufferGeometry | null {
    const pos: number[] = [], side: number[] = [], minPx: number[] = [], col: number[] = [], index: number[] = [];
    const c = new THREE.Color(), a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(), across = new THREE.Vector3();
    const quad = (p: THREE.Vector3, q: THREE.Vector3, s: THREE.Vector3, half: number, px: number, alpha: number) => {
      const i = pos.length / 3;
      for (const at of [p, q]) for (const sign of [-1, 1]) {
        pos.push(at.x, at.y, at.z);
        side.push(s.x * sign, s.y * sign, s.z * sign, half);
        minPx.push(px);
        col.push(c.r, c.g, c.b, alpha);
      }
      index.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
    };
    for (const line of lines) {
      const pts = line.closed ? [...line.points, line.points[0]] : line.points;
      if (pts.length < 2) continue;
      c.setHex(line.color);
      const half = (line.width ?? WIDTH[line.style]) / 2, px = MIN_PX[line.style], alpha = line.opacity ?? 1;
      // The way along the line, laid on the land (or at its points' heights), point by point.
      const way: THREE.Vector3[] = [];
      for (let k = 0; k + 1 < pts.length; k++) {
        const p = pts[k], q = pts[k + 1], span = Math.hypot(q.x - p.x, q.z - p.z);
        const n = line.style === 'wire' ? 8 : Math.max(1, Math.ceil(span / STEP));
        const sag = line.style === 'wire' ? Math.min(MAX_SAG, span * SAG) : 0;
        for (let i = k === 0 ? 0 : 1; i <= n; i++) {
          const t = i / n, x = p.x + (q.x - p.x) * t, z = p.z + (q.z - p.z) * t;
          const yp = p.y ?? this.land(p.x, p.z) + LIFT, yq = q.y ?? this.land(q.x, q.z) + LIFT;
          // On the land between its points, if they lie on it; else straight between them (a wire sagging).
          const y = p.y === undefined && q.y === undefined ? this.land(x, z) + LIFT : yp + (yq - yp) * t - sag * 4 * t * (1 - t);
          way.push(new THREE.Vector3(x, y, z));
        }
      }
      // Dashes: along the way, by the distance along it.
      let along = 0;
      for (let k = 0; k + 1 < way.length; k++) {
        a.copy(way[k]); b.copy(way[k + 1]);
        const len = d.subVectors(b, a).length();
        if (len < 1e-5) continue;
        d.divideScalar(len);
        if (line.style === 'wire') {
          // A wire: across it level, and up through it, so it shows from any side.
          across.crossVectors(d, UP);
          if (across.lengthSq() < 1e-8) across.set(1, 0, 0);
          across.normalize();
          quad(a, b, across, half, px, alpha);
          quad(a, b, across.crossVectors(d, across).normalize(), half, px, alpha);
          continue;
        }
        across.set(-d.z, 0, d.x);
        if (across.lengthSq() < 1e-8) across.set(1, 0, 0);
        across.normalize();
        if (line.style === 'dashed') {
          const from = along;
          along += len;
          // Each dash (or the part of it) within this piece.
          for (let s = Math.floor(from / (DASH + GAP)) * (DASH + GAP); s < along; s += DASH + GAP) {
            const t0 = Math.max(s, from), t1 = Math.min(s + DASH, along);
            if (t1 <= t0) continue;
            quad(new THREE.Vector3().copy(a).addScaledVector(d, t0 - from), new THREE.Vector3().copy(a).addScaledVector(d, t1 - from), across, half, px, alpha);
          }
          continue;
        }
        quad(a, b, across, half, px, alpha);
      }
    }
    if (!pos.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 4));
    g.setAttribute('aMinPx', new THREE.Float32BufferAttribute(minPx, 1));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
    g.setIndex(index);
    return g;
  }
}
