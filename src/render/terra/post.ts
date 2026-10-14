import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// The terra look's post-processing: the scene is drawn into a linear HDR target (multisampled, with a depth texture), then
//   1. GTAO at half resolution, from that depth (normals rebuilt from depth, so GPU-posed and dropped vertices agree with
//      what was drawn): soft contact shade at the feet of trees and buildings;
//   2. at night only, a mild bloom so lamps and lit windows glow;
//   3. one final pass: AO applied, light tilt-shift blur at the top and bottom, ACES tone mapping, a colour grade (warm
//      highlights, slightly cool shadows, more saturation, a gentle S-curve) and a soft vignette, written out as sRGB.

/** GTAO drawn at half the composer's size: AO is soft, so the lost detail doesn't show and it costs a quarter. */
class HalfResGTAOPass extends GTAOPass {
  override setSize(width: number, height: number) {
    super.setSize(Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2)));
  }
}

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tAO: { value: null as THREE.Texture | null },
    // Lighter than a full GTAO: the terra models (public/models/terra/) bake their own AO into their vertex colours.
    uAOStrength: { value: 0.6 },
    uExposure: { value: 1 },
    uNight: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTiltShift: { value: 2.5 },   // blur radius in device pixels at the very top and bottom
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform sampler2D tAO;
    uniform float uAOStrength, uExposure, uNight, uTiltShift;
    uniform vec2 uResolution;
    varying vec2 vUv;

    vec3 sceneAt(vec2 uv) {
      float ao = texture2D(tAO, uv).r;
      return texture2D(tDiffuse, uv).rgb * mix(1.0, ao, uAOStrength);
    }

    // three.js's ACES filmic fit (the same curve the renderer's tone mapping uses).
    vec3 rrtOdtFit(vec3 v) {
      vec3 a = v * (v + 0.0245786) - 0.000090537;
      vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
      return a / b;
    }
    vec3 aces(vec3 color) {
      const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
      const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
      color *= uExposure / 0.6;
      return clamp(outM * rrtOdtFit(inM * color), 0.0, 1.0);
    }
    vec3 toSRGB(vec3 c) {
      return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
    }

    void main() {
      // Tilt-shift: a small disc blur that grows towards the top and bottom edges, none across the middle.
      vec3 hdr = sceneAt(vUv);
      float band = smoothstep(0.28, 0.5, abs(vUv.y - 0.5));
      float r = band * uTiltShift;
      if (r > 0.25) {
        const int N = 8;
        vec2 px = r / uResolution;
        vec3 sum = hdr;
        for (int i = 0; i < N; i++) {
          float a = float(i) * 2.39996 + 0.5;
          float d = sqrt((float(i) + 0.5) / float(N));
          sum += sceneAt(vUv + vec2(cos(a), sin(a)) * d * px);
        }
        hdr = sum / float(N + 1);
      }

      vec3 c = toSRGB(aces(hdr));

      // Grade (display space). Less of it at night, so the dark stays calm.
      float k = 1.0 - 0.6 * uNight;
      float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      // Split toning: cool shadows, warm highlights.
      vec3 shadowTint = vec3(-0.006, 0.004, 0.030), highlightTint = vec3(0.028, 0.010, -0.022);
      c += k * (shadowTint * (1.0 - smoothstep(0.0, 0.45, luma)) + highlightTint * smoothstep(0.45, 1.0, luma));
      // Gentle S-curve about mid grey.
      c = mix(c, c * c * (3.0 - 2.0 * c), 0.12 * k);
      // Saturation, with a vibrance-style push that favours the duller colours.
      luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float sat = max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b);
      c = mix(vec3(luma), c, 1.0 + k * (0.04 + 0.12 * (1.0 - sat)));
      // Lift-gamma-gain: a touch of lift in the blacks, slightly brighter mids.
      c = clamp(c, 0.0, 1.0);
      c = pow(c * 1.02 + 0.012 * (1.0 - c), vec3(1.0 / (1.0 + 0.12 * k)));

      // Night: moonlight is bluer and duller than the scene's lighting gives (the glow of lamps keeps its colour).
      luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 moon = mix(vec3(luma), c, 0.6) * vec3(0.82, 0.94, 1.22);
      c = mix(c, moon, uNight * (1.0 - smoothstep(0.35, 0.8, luma)));

      // Vignette: soft, a little stronger at night.
      vec2 q = vUv - 0.5;
      q.x *= uResolution.x / uResolution.y;
      float v = smoothstep(0.45, 1.05, length(q));
      c *= 1.0 - (0.22 + 0.15 * uNight) * v;

      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

export class TerraPost {
  private readonly composer: EffectComposer;
  private readonly ao: HalfResGTAOPass;
  private readonly bloom: UnrealBloomPass;
  private readonly grade: ShaderPass;
  private readonly target: THREE.WebGLRenderTarget;
  private readonly renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.OrthographicCamera) {
    this.renderer = renderer;
    // Linear HDR, multisampled for smooth edges; the depth texture feeds the AO.
    this.target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    this.target.depthTexture = new THREE.DepthTexture(1, 1);
    this.composer = new EffectComposer(renderer, this.target);   // its second buffer clones this one, depth texture too

    this.composer.addPass(new RenderPass(scene, camera));
    const ao = this.ao = new HalfResGTAOPass(scene, camera, 1, 1);
    // Given a depth texture at construction, GTAOPass (three r180) crashes on its missing normal target; set it after.
    // With no normal texture the AO rebuilds normals from depth.
    ao.setGBuffer(this.target.depthTexture);
    ao.output = GTAOPass.OUTPUT.Off;   // the grade pass applies it
    ao.needsSwap = false;              // it writes nothing to the composer's buffers
    ao.updateGtaoMaterial({ radius: 1.4, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12 });
    ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    this.composer.addPass(ao);

    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.5, 1.6);
    this.bloom.enabled = false;
    this.composer.addPass(this.bloom);

    this.grade = new ShaderPass(GradeShader);
    this.grade.uniforms.tAO.value = ao.gtaoMap;
    this.grade.needsSwap = false;   // it draws to the screen, so the scene stays in the same buffer every frame
    this.composer.addPass(this.grade);
  }

  setLook(expo: number, lampOn: number, night: number) {
    const u = this.grade.uniforms;
    u.uExposure.value = expo;
    u.uNight.value = night;
    this.bloom.enabled = lampOn > 0.05;
    this.bloom.strength = 0.4 * lampOn;
  }

  /** Width and height in CSS pixels; the targets are that times the renderer's pixel ratio. */
  setSize(width: number, height: number) {
    const dpr = this.renderer.getPixelRatio();
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(width, height);
    this.grade.uniforms.uResolution.value.set(Math.floor(width * dpr), Math.floor(height * dpr));
    this.grade.uniforms.uTiltShift.value = 2.5 * dpr;
  }

  render() {
    // The composer swaps its two buffers, so the scene's depth lands in either one; point the AO at this frame's.
    const depth = this.composer.readBuffer.depthTexture;
    const ao = this.ao as unknown as { gtaoMaterial: THREE.ShaderMaterial; pdMaterial: THREE.ShaderMaterial };
    ao.gtaoMaterial.uniforms.tDepth.value = depth;
    ao.pdMaterial.uniforms.tDepth.value = depth;
    this.composer.render();
  }
}
