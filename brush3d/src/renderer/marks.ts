import * as THREE from 'three';
import { DEPTH_ORIGIN_GLSL } from './auxDepth.ts';
import { markMaterial, type MaterialKind, type SharedUniforms } from './materials';

// The game's marks on its things (Soil-n-Silo#206): a thing highlighted (under the pointer, or selected) and a thing tinted
// for what's in focus (a truck's stops, the buildings next door that would trade). The marked meshes are drawn once more
// after the main view, into a marks target the size of the G-buffer: per pixel the tint's colour and strength and whether
// it's highlighted, only where the thing shows (its depth is the G-buffer's there). The post pass lays them over the
// finished picture (MARKS_POST_GLSL): the tint, and the highlight's outline round what shows of the thing. Nothing marked,
// nothing is drawn and the post pass skips it.

/** A thing's marks: highlighted, and tinted with a colour (sRGB) at a strength (0..1). */
export interface Mark {
  highlight?: boolean;
  tint?: { color: number; strength: number } | null;
}

/**
 * How a highlight is drawn: its colour (sRGB), how far out it reaches round the thing (CSS pixels), whether it's a crisp
 * outline (glow 0) or a halo fading out (1), and how much brighter the thing itself is drawn (0..1).
 */
export interface HighlightLook { color: number; width: number; glow: number; fill: number }
export const HIGHLIGHT_LOOK: HighlightLook = { color: 0xfff0c0, width: 2, glow: 0, fill: 0.5 };

const MARK_FRAG = /* glsl */ `
uniform sampler2D uMarksAux;
${DEPTH_ORIGIN_GLSL}
uniform vec4 uMarkTint;
uniform float uMarkHi;
varying float vViewDepth;
layout(location = 0) out vec4 gMark;
void main() {
  // Where something nearer shows, the thing doesn't: no mark (the depth is the G-buffer's, resolved and half-float, so
  // allow for its rounding).
  float shown = auxDepth(texelFetch(uMarksAux, ivec2(gl_FragCoord.xy), 0).z);
  if (shown > 0.0 && vViewDepth > shown + 0.15 + shown * 0.004) discard;
  // The tint's colour, and in alpha its strength (0..127) plus 128 if highlighted.
  gMark = vec4(uMarkTint.rgb, (floor(uMarkTint.a * 127.0 + 0.5) + (uMarkHi > 0.5 ? 128.0 : 0.0)) / 255.0);
}
`;

/** The post pass's part: lays the marks over the finished picture (sRGB), at the pixel `uv`. */
export const MARKS_POST_GLSL = /* glsl */ `
uniform sampler2D tMarks;
uniform float uMarksOn;
uniform vec4 uHighlight;
uniform vec2 uHighlightStyle;
float markHi(vec4 m) { return step(127.5, floor(m.a * 255.0 + 0.5)); }
vec3 marksOver(vec3 o, vec2 uv) {
  vec4 m = texture2D(tMarks, uv);
  float a = floor(m.a * 255.0 + 0.5), hi = step(127.5, a);
  o = mix(o, m.rgb, mod(a, 128.0) / 127.0);
  // The highlight round what shows of the thing: looked for its width out in twelve directions, the outline. A halo
  // (glow) takes that faintly and looks nearer too, a third and two thirds of the way out, taking those more, so it fades.
  float glow = uHighlightStyle.x, near = 0.0;
  vec2 px = uHighlight.w / uResolution;
  for (int i = 0; i < 12; i++) {
    float t = float(i) * 0.5235988;
    near = max(near, mix(1.0, 0.15, glow) * markHi(texture2D(tMarks, uv + vec2(cos(t), sin(t)) * px)));
  }
  if (glow > 0.0) {
    for (int k = 1; k <= 2; k++) {
      float r = float(k) / 3.0;
      for (int i = 0; i < 8; i++) {
        float t = (float(i) + float(k) * 0.5) * 0.7853982;
        near = max(near, glow * (1.15 - r) * markHi(texture2D(tMarks, uv + vec2(cos(t), sin(t)) * px * r)));
      }
    }
  }
  o = mix(o, uHighlight.rgb, clamp(near, 0.0, 1.0) * (1.0 - hi) * 0.95);
  // The thing itself a little brighter.
  o = mix(o, o * 1.1 + 0.03, hi * uHighlightStyle.y);
  return o;
}
`;

export function createMarksUniforms() {
  return {
    tMarks: { value: null as THREE.Texture | null },
    uMarksOn: { value: 0 },
    uHighlight: { value: new THREE.Vector4(1, 1, 1, 2) },
    uHighlightStyle: { value: new THREE.Vector2(0, 0.5) },
  };
}

interface Marked { mesh: THREE.Mesh; mark: Mark; twin: THREE.Mesh | null }

export class Marks {
  readonly post = createMarksUniforms();
  private readonly target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false,
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false,
  });
  private readonly marked = new Map<THREE.Mesh, Marked>();
  private readonly scene = new THREE.Scene();
  private readonly aux: THREE.IUniform<THREE.Texture | null> = { value: null };
  private look = HIGHLIGHT_LOOK;
  private readonly shared: SharedUniforms;

  constructor(shared: SharedUniforms) {
    this.shared = shared;
    this.post.tMarks.value = this.target.texture;
    this.setLook(HIGHLIGHT_LOOK, 1);
  }

  /** Marks a mesh (null, or a mark with nothing in it, takes its marks off). */
  set(mesh: THREE.Mesh, mark: Mark | null) {
    const was = this.marked.get(mesh);
    if (!mark || (!mark.highlight && !(mark.tint && mark.tint.strength > 0))) {
      if (was) { this.drop(was); this.marked.delete(mesh); }
      return;
    }
    const kind = mesh.userData.kind as MaterialKind;
    // Leaves are dabs on cards, which a plain fragment would draw as squares: a thing's planted roof isn't marked.
    if (kind === 'foliage' || kind === 'debris' || kind === 'smoke' || kind === 'water') return;
    if (was) { was.mark = mark; this.style(was); return; }
    const m: Marked = { mesh, mark, twin: null };
    const twin = new THREE.Mesh(mesh.geometry, markMaterial(kind, this.shared, MARK_FRAG, {
      uMarksAux: this.aux, uMarkTint: { value: new THREE.Vector4() }, uMarkHi: { value: 0 },
    }));
    twin.matrixAutoUpdate = false;
    twin.matrixWorldAutoUpdate = false;
    twin.frustumCulled = false;
    m.twin = twin;
    this.scene.add(twin);
    this.style(m);
    this.marked.set(mesh, m);
  }

  /** A mesh taken out of the scene loses its marks. */
  forget(mesh: THREE.Mesh) {
    const m = this.marked.get(mesh);
    if (m) { this.drop(m); this.marked.delete(mesh); }
  }

  get any() { return this.marked.size > 0; }

  /** The highlight's look; `pixelRatio` the device pixels a CSS pixel is drawn with. */
  setLook(look: HighlightLook, pixelRatio: number) {
    this.look = look;
    // Laid over the finished picture, which is sRGB: kept as given.
    const c = new THREE.Color().setHex(look.color, THREE.LinearSRGBColorSpace);
    this.post.uHighlight.value.set(c.r, c.g, c.b, look.width * pixelRatio);
    this.post.uHighlightStyle.value.set(THREE.MathUtils.clamp(look.glow, 0, 1), THREE.MathUtils.clamp(look.fill, 0, 1));
  }

  setSize(width: number, height: number, pixelRatio: number) {
    this.target.setSize(width, height);
    this.setLook(this.look, pixelRatio);
  }

  /** Draws the marks of what shows in the main view (`aux` the G-buffer's view depth), or none. */
  draw(gl: THREE.WebGLRenderer, camera: THREE.Camera, aux: THREE.Texture) {
    let shown = 0;
    for (const m of this.marked.values()) {
      const twin = m.twin!;
      twin.visible = m.mesh.visible && m.mesh.parent !== null;
      twin.matrixWorld.copy(m.mesh.matrixWorld);
      if (twin.visible) shown++;
    }
    this.post.uMarksOn.value = shown > 0 ? 1 : 0;
    if (!shown) return;
    this.aux.value = aux;
    gl.setRenderTarget(this.target);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, false, false);
    gl.render(this.scene, camera);
  }

  private style(m: Marked) {
    const u = (m.twin!.material as THREE.ShaderMaterial).uniforms;
    const t = m.mark.tint, c = new THREE.Color();
    // The tint's colour is laid over the finished picture, which is sRGB: kept as given.
    if (t) c.setHex(t.color, THREE.LinearSRGBColorSpace);
    (u.uMarkTint.value as THREE.Vector4).set(c.r, c.g, c.b, t ? THREE.MathUtils.clamp(t.strength, 0, 1) : 0);
    u.uMarkHi.value = m.mark.highlight ? 1 : 0;
  }

  private drop(m: Marked) {
    if (!m.twin) return;
    this.scene.remove(m.twin);
    (m.twin.material as THREE.Material).dispose();
  }
}
