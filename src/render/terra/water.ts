import * as THREE from 'three';
import { FLUIDS, type PixelScene } from 'pixel3d-renderer';
import { groundUniforms, NOISE } from './ground.ts';
import { shared } from './material.ts';

// Stylised water for the terra look: teal-blue, deeper away from the banks, lighter and clearer near them, with drifting
// ripple streaks, a few sparkles and a foam line along the banks. Each fragment finds its distance to the nearest bank
// from a one-texel-per-tile mask of where the fluids are (5 × 5 tiles around it), so the foam hugs the tile edges.

/** How far the surface sits below where the PixelScene puts it, so more of the earth bank shows above it. */
const SINK = 0.2;
/** Water's colours (linear), from the deep middle to the shallows by the bank. */
const DEEP = new THREE.Color(0x2a7eaa), SHALLOW = new THREE.Color(0x62c2cf);

/** A tile mask (red 255 where a fluid lies) of the map, from the centres of the fluid surface's triangles. */
function fluidMask(geometry: THREE.BufferGeometry, w: number, h: number): THREE.DataTexture {
  const data = new Uint8Array(w * h), pos = geometry.getAttribute('position'), index = geometry.getIndex();
  const tris = (index ? index.count : pos.count) / 3, vi = (k: number) => (index ? index.getX(k) : k);
  for (let t = 0; t < tris; t++) {
    let x = 0, z = 0;
    for (let k = 0; k < 3; k++) { x += pos.getX(vi(t * 3 + k)); z += pos.getZ(vi(t * 3 + k)); }
    const tx = Math.floor(x / 3), tz = Math.floor(z / 3);
    if (tx >= 0 && tz >= 0 && tx < w && tz < h) data[tz * w + tx] = 255;
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RedFormat, THREE.UnsignedByteType);
  tex.needsUpdate = true;
  return tex;
}

/** The fluids as one surface; water gets the terra palette, other fluids keep their own (deep) colour. */
export function waterMesh(world: PixelScene): THREE.Mesh {
  const { geometry, materials } = world.fluids!;
  const { x: w, y: h } = groundUniforms.uTerraMap.value;
  const ids = geometry.getAttribute('aFluid'), colours = new Float32Array(ids.count * 3), c = new THREE.Color();
  for (let i = 0; i < ids.count; i++) {
    const { deep } = materials[Math.round(ids.getX(i))];
    (deep === FLUIDS.water.deep ? c.copy(DEEP) : c.set(deep)).toArray(colours, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', geometry.getAttribute('position'));
  g.setAttribute('normal', geometry.getAttribute('normal'));
  g.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  if (geometry.index) g.setIndex(geometry.index);

  const mask = fluidMask(geometry, w, h);
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, roughness: 0.35, metalness: 0, depthWrite: false });
  m.customProgramCacheKey = () => 'terra:water';
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uTerraTime: shared.uTerraTime, uTerraMap: groundUniforms.uTerraMap, uTerraMask: { value: mask } });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWaterPos;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWaterPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = `uniform float uTerraTime; uniform vec2 uTerraMap; uniform sampler2D uTerraMask; varying vec3 vWaterPos;
${NOISE}
// Distance (tiles, up to 2.5) from p to the nearest tile without fluid; beyond the map counts as bank.
float waterShore(vec2 p) {
  ivec2 t = ivec2(floor(p)), size = ivec2(uTerraMap);
  float d = 2.5;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    ivec2 q = t + ivec2(i, j);
    bool bank = q.x < 0 || q.y < 0 || q.x >= size.x || q.y >= size.y || texelFetch(uTerraMask, q, 0).r < 0.5;
    if (bank) d = min(d, length(max(max(vec2(q) - p, p - vec2(q + 1)), 0.0)));
  }
  return d;
}
${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', /* glsl */ `#include <color_fragment>
      vec2 wp = vWaterPos.xz;
      float wt = uTerraTime;
      float shore = waterShore(wp);
      float deep = smoothstep(0.05, 1.6, shore);
      vec3 wc = mix(mix(vColor.rgb, vec3(${SHALLOW.toArray().map((v) => v.toFixed(4)).join(', ')}), 0.75), vColor.rgb, deep);
      // Ripples: two drifting noise fields, their crests drawn as soft lighter streaks.
      float r = terraNoise(wp * vec2(1.6, 3.2) + vec2(0.22, 0.08) * wt) + terraNoise(wp * vec2(3.4, 1.9) - vec2(0.12, 0.27) * wt);
      float crest = smoothstep(0.07, 0.0, abs(r - 1.05));
      wc = mix(wc, wc * 1.35 + 0.03, crest * (0.25 + 0.25 * deep));
      wc *= 0.94 + 0.12 * terraNoise(wp * 0.7 + 0.05 * wt);
      // Foam: a wobbly line on the bank, and a fainter one that breathes a little further out.
      float wob = (terraNoise(wp * 5.0 + vec2(0.4, -0.3) * wt) - 0.5) * 0.06;
      float foam = 1.0 - smoothstep(0.035, 0.085, shore + wob);
      float band = smoothstep(0.05, 0.0, abs(shore - 0.17 - 0.03 * sin(wt * 1.3 + wp.x + wp.y) + wob)) * 0.35;
      foam = max(foam, band * step(0.4, terraNoise(wp * 2.5 + 0.1 * wt)));
      diffuseColor.rgb = mix(wc, vec3(0.9, 0.95, 0.95), foam);
      diffuseColor.a = mix(mix(0.72, 0.93, deep), 1.0, foam);
      // Sparkles: where two fast noise fields peak together.
      float sp = terraNoise(wp * 13.0 + vec2(0.9, 0.5) * wt) * terraNoise(wp * 11.0 - vec2(0.4, 0.8) * wt);
      float sparkle = smoothstep(0.72, 0.85, sp) * (1.0 - foam);`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.85, 0.95, 1.0) * sparkle * 0.9;');
  };
  const mesh = new THREE.Mesh(g, m);
  mesh.position.y = -SINK;
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;
  return mesh;
}
