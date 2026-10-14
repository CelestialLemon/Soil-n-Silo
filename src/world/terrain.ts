import * as THREE from 'three';
import { GeometryCollector, linearColor as lin, place } from './geometry.ts';
import { box, hash } from './kit.ts';
import { TERRAIN, type MapData } from '../game/map.ts';

// Static ground for the experimental renderer: vertex-coloured terrain, a glossy animated water surface, softened shores,
// deterministic groundcover, and a wooded edge. Playable terrain remains level and tile-aligned for game-rule clarity.
export interface World {
  scene: THREE.Group;
  geometries: THREE.BufferGeometry[];
}

const GRASS = [0xa9ad70, 0x9eae69, 0x91a95d, 0x85a557, 0x759c50];
const LEAF = [0x557a42, 0x6b9149, 0x7e9f50, 0x9aab5b, 0xb1ad69];
const WATER = [0x378e96, 0x429da2, 0x51a8a9, 0x5daeb0, 0x6ab9b7];
const TOP = new THREE.PlaneGeometry(1, 1);
const TUFT = new THREE.IcosahedronGeometry(1, 0);
const TREE_PICK_MATERIAL = new THREE.MeshBasicMaterial();

function createWaterMaterial() {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, roughness: 0.28, metalness: 0.04, clearcoat: 0.75, clearcoatRoughness: 0.22,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uValleyTime = { value: 0 };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWaterPosition;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWaterPosition = worldPosition.xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uValleyTime;\nvarying vec3 vWaterPosition;')
      .replace('#include <color_fragment>', '#include <color_fragment>\nfloat waveA = sin(vWaterPosition.x * 1.9 + vWaterPosition.z * 1.3 + uValleyTime * 0.55);\nfloat waveB = sin(vWaterPosition.z * 2.8 - vWaterPosition.x * 0.7 - uValleyTime * 0.42);\nfloat glint = smoothstep(0.58, 0.94, waveA * waveB);\ndiffuseColor.rgb *= 0.95 + 0.025 * waveA;\ndiffuseColor.rgb += vec3(0.055, 0.105, 0.085) * glint;');
    material.userData.shader = shader;
  };
  material.customProgramCacheKey = () => 'verdant-river-glint-v1';
  material.userData.update = (time: number) => {
    const shader = material.userData.shader as { uniforms: { uValleyTime: { value: number } } } | undefined;
    if (shader) shader.uniforms.uValleyTime.value = time;
  };
  return material;
}

export function buildWorld(map: MapData, trees: THREE.BufferGeometry[]): World {
  const ground = new GeometryCollector(), shore = new GeometryCollector(), water = new GeometryCollector();
  const edgeFlowers = new GeometryCollector(true), forestPick = new THREE.Group();
  const { width: w, height: h } = map;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? TERRAIN.grass : map.terrain[y * w + x]);
  const isWater = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && map.terrain[y * w + x] === TERRAIN.water;

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, cx = x + 0.5, cz = y + 0.5, n = hash(x, y);
    if (map.terrain[i] === TERRAIN.water) {
      // A deep, shaded rim makes water read as a cut into the land rather than a blue grid tile.
      box(ground, cx, -0.64, cz, 1, 0.2, 1, 0x62705e);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (isWater(x + dx, y + dz)) continue;
        box(ground, cx + dx * 0.5, -0.64, cz + dz * 0.5, dz ? 1 : 0.018, 0.64, dx ? 1 : 0.018, 0x788267);
        // Pale, broken highlights soften the blocky bank while preserving the actual tile boundary.
        const along = dx ? 0 : 1, len = 0.42 + hash(x + dz * 13, y + dx * 17) * 0.45;
        const fx = cx + dx * 0.46 + (along ? (n - 0.5) * 0.24 : 0), fz = cz + dz * 0.46 + (along ? 0 : (n - 0.5) * 0.24);
        box(shore, fx, -0.085, fz, dx ? 0.025 : len, 0.025, dz ? 0.025 : len, 0xadd4c0);
      }
      water.add(TOP, place(cx, -0.12, cz, -Math.PI / 2), lin(WATER[Math.floor(n * WATER.length)]));
      continue;
    }

    const fertility = map.fertility[i], band = Math.min(4, Math.floor(fertility / 20));
    const variation = n < 0.5 ? 0 : 1;
    const colour = new THREE.Color(GRASS[band]);
    colour.offsetHSL((n - 0.5) * 0.012, 0, (variation ? 0.012 : -0.006));
    box(ground, cx, -0.5, cz, 1, 0.5, 1, colour.getHex());

    // Small clustered leaf forms break up the broad tile fields. They use the map seed, so positions remain stable.
    if (at(x, y) === TERRAIN.grass && n > 0.22 && n < 0.62) {
      const count = n > 0.43 ? 3 : 2;
      for (let leaf = 0; leaf < count; leaf++) {
        const seed = hash(x * 7.1 + leaf * 2.7, y * 5.3 - leaf * 3.1);
        const lx = x + 0.24 + seed * 0.52, lz = y + 0.22 + hash(y + leaf * 9.4, x - leaf * 7.3) * 0.56;
        const r = 0.085 + seed * 0.055;
        // Keep cover close to the soil plane so fields and buildings don't sink into permanent decoration.
        ground.add(TUFT, place(lx, 0.011, lz, seed, seed * Math.PI * 2, seed * 0.3, r, r * 0.09, r), lin(LEAF[(leaf + Math.floor(seed * 4)) % LEAF.length]));
      }
    }
  }

  // A calm meadow beyond the map stops the camera from revealing a hard world edge.
  const M = 60;
  for (const [x, z, bw, bd] of [[w / 2, -M / 2, w + 2 * M, M], [w / 2, h + M / 2, w + 2 * M, M], [-M / 2, h / 2, M, h], [w + M / 2, h / 2, M, h]]) {
    box(ground, x, -0.5, z, bw, 0.48, bd, 0x708e51);
  }

  const ring = (x: number, z: number, i: number) => {
    const n = hash(x * 3.1, z * 1.7), index = i % trees.length, g = trees[index].clone();
    const yaw = n * Math.PI * 2, scale = 0.9 + 0.32 * n, transform = place(x, -0.02, z, 0, yaw, 0, scale);
    g.applyMatrix4(transform);
    ground.pushPrepared(g);
    // Use the real tree mesh as a click occluder. The render mesh is merged into terrain, but separate meshes keep each
    // ray test bounded to nearby trees instead of traversing the full terrain buffer.
    const blocker = new THREE.Mesh(trees[index], TREE_PICK_MATERIAL);
    blocker.position.set(x, -0.02, z);
    blocker.rotation.y = yaw;
    blocker.scale.setScalar(scale);
    forestPick.add(blocker);
  };
  let i = 0;
  for (let x = -4; x < w + 4; x += 1.55) for (const z of [-1.4, -3.2, h + 1.4, h + 3.2]) ring(x + hash(x, z) * 0.8, z + hash(z, x) * 0.6, i++);
  for (let z = 0; z < h; z += 1.55) for (const x of [-1.4, -3.2, w + 1.4, w + 3.2]) ring(x + hash(x, z) * 0.6, z + hash(z, x) * 0.8, i++);

  // A sparse flower fringe softens the meadow/forest transition without making a competing patterned border.
  const STEM = new THREE.BoxGeometry(1, 1, 1);
  for (let k = 0; k < 150; k++) {
    const side = k % 4, t = hash(k, 7);
    const fx = side < 2 ? -6 + t * (w + 12) : side === 2 ? -0.6 - hash(k, 9) * 0.5 : w + 0.6 + hash(k, 9) * 0.5;
    const fz = side >= 2 ? t * h : side === 0 ? -0.6 - hash(k, 9) * 0.5 : h + 0.6 + hash(k, 9) * 0.5;
    edgeFlowers.add(STEM, place(fx, 0.12, fz, 0, 0, 0, 0.04, 0.26, 0.04), lin(0x547b3b));
    edgeFlowers.add(STEM, place(fx, 0.28, fz, 0, 0, 0, 0.11, 0.08, 0.11), lin([0xd77a78, 0xd8bd63, 0xa188bd, 0xe5e0cc][k % 4]));
  }

  const scene = new THREE.Group();
  const groundGeometry = ground.build(), shoreGeometry = shore.build(), waterGeometry = water.build(), flowerGeometry = edgeFlowers.build();
  const landMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, flatShading: true });
  const waterMaterial = createWaterMaterial();
  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.receiveShadow = true;
  const groundMesh = new THREE.Mesh(groundGeometry, landMaterial);
  groundMesh.castShadow = true;
  groundMesh.receiveShadow = true;
  const shoreMesh = new THREE.Mesh(shoreGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86 }));
  shoreMesh.receiveShadow = true;
  const flowerMesh = new THREE.Mesh(flowerGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, flatShading: true }));
  flowerMesh.castShadow = true;
  flowerMesh.receiveShadow = true;
  scene.add(groundMesh, shoreMesh, waterMesh, flowerMesh);
  scene.userData.update = (time: number) => (waterMaterial.userData.update as (t: number) => void)(time);
  forestPick.updateMatrixWorld(true);
  scene.userData.pickOccluder = forestPick;
  return { scene, geometries: [groundGeometry, shoreGeometry, waterGeometry, flowerGeometry] };
}
