import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { addDab, MeshBuilder, rng, srgb } from '../brush3d/src/kit/builder.ts';
import { addCanopy, FAR_WOODS_MODES, type FarWoodsMode } from '../brush3d/src/kit/farWoods.ts';
import type { Species } from '../brush3d/src/kit/plants.ts';
import { STIFF_STROKE } from '../brush3d/src/renderer/paintFlags.ts';
import { SEASONS, type Season } from '../brush3d/src/renderer/season.ts';

// The far woods' crowns (brush3d's addCanopy, #268): `off` paints them as before, and the new looks cost no more to draw,
// have no dark side in winter, and lift the other seasons' dark undersides.

const SPECIES: readonly Species[] = ['oak', 'birch', 'pine', 'willow', 'poplar', 'apple', 'bush'];

/** A wood of crowns of one species, as the game lays them out (one per 2 × 2 tiles, 3.2 to 4.6 m across). */
function wood(species: Species, season: Season, mode: FarWoodsMode | 'before') {
  const b = new MeshBuilder('foliage'), rand = rng(213), place = rng(7);
  for (let i = 0; i < 40; i++) {
    const x = place() * 200, z = place() * 200, radius = 3.2 + 1.4 * place();
    if (mode === 'before') before(b, x, 1, z, radius, species, season, rand);
    else addCanopy(b, x, 1, z, radius, species, season, rand, mode);
  }
  return b.build();
}

/** addCanopy as it was before #268 (brush3d/src/kit/plants.ts at a2dd65e), to hold `off` to it. */
function before(b: MeshBuilder, x: number, y: number, z: number, radius: number, species: Species, season: Season, rand: () => number) {
  const bare = srgb(0x7a6758);
  const far: Record<Species, Record<Season, THREE.Color>> = {
    oak: { spring: srgb(0x76a84e), summer: srgb(0x467348), autumn: srgb(0xd98a32), winter: bare },
    birch: { spring: srgb(0x91bc61), summer: srgb(0x9cc068), autumn: srgb(0xe3b43c), winter: srgb(0x8c6c66) },
    pine: { spring: srgb(0x28564f), summer: srgb(0x28564f), autumn: srgb(0x28564f), winter: srgb(0x28564f) },
    willow: { spring: srgb(0x91bc61), summer: srgb(0x83b390), autumn: srgb(0xcdb04a), winter: srgb(0xb48d42) },
    poplar: { spring: srgb(0x588650), summer: srgb(0x2e633d), autumn: srgb(0xe3b43c), winter: bare },
    apple: { spring: srgb(0xe9c3c0), summer: srgb(0x567843), autumn: srgb(0xc0782e), winter: bare },
    bush: { spring: srgb(0x76a84e), summer: srgb(0x52823c), autumn: srgb(0xa8502f), winter: srgb(0x6d5644) },
  };
  const smooth = (a: number, e: number, v: number) => { const t = Math.min(Math.max((v - a) / (e - a), 0), 1); return t * t * (3 - 2 * t); };
  const base = far[species][season];
  const cy = y + radius * 1.3, n = Math.round(3 + 1.5 * radius);
  for (let i = 0; i < n; i++) {
    const u = rand() * 2 - 1, phi = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const dir = new THREE.Vector3(s * Math.cos(phi), u < 0 ? u * 0.6 : u, s * Math.sin(phi));
    const p = new THREE.Vector3(x, cy, z).addScaledVector(dir, radius * (0.55 + rand() * 0.4));
    const lit = smooth(-0.2, 0.9, dir.y);
    const c = base.clone().offsetHSL(-0.02 * lit, 0.04 * lit, 0.08 * lit - 0.06).offsetHSL(0, 0, (rand() - 0.5) * 0.05);
    addDab(b, p, dir, c, (0.42 + rand() * 0.14) * radius, rand(), [0.7, 0.5 + rand() * 0.3, -1, 0.6]);
  }
}

/** What a wood's strokes come to: how many, how much they fill (each card is size² × 4), and how they face and colour. */
function measure(g: THREE.BufferGeometry) {
  const nrm = g.getAttribute('normal'), col = g.getAttribute('color'), card = g.getAttribute('aCard'), paint = g.getAttribute('aPaint');
  let fill = 0, biggest = 0, lowest = Infinity, light = 0, stiff = 0;
  for (let i = 0; i < card.count; i += 4) {
    fill += card.getZ(i) ** 2; biggest = Math.max(biggest, card.getZ(i));
    lowest = Math.min(lowest, nrm.getY(i));
    light += 0.2126 * col.getX(i) + 0.7152 * col.getY(i) + 0.0722 * col.getZ(i);
    if (paint.getX(i) >= STIFF_STROKE) stiff++;
  }
  const strokes = card.count / 4;
  return { strokes, fill, biggest, lowest, light: light / strokes, stiff: stiff / strokes };
}

test('off paints the far woods exactly as before #268, in every season', () => {
  for (const season of SEASONS) for (const species of SPECIES) {
    const now = wood(species, season, 'off'), was = wood(species, season, 'before');
    for (const name of ['position', 'normal', 'color', 'aPaint', 'aCard']) {
      assert.deepEqual(now.getAttribute(name).array, was.getAttribute(name).array, `${species} in ${season}: ${name}`);
    }
  }
});

test('the new looks cost no more to fill than before, and no stroke is bigger', () => {
  for (const mode of FAR_WOODS_MODES) for (const season of SEASONS) for (const species of SPECIES) {
    const now = measure(wood(species, season, mode)), was = measure(wood(species, season, 'off'));
    assert.ok(now.fill <= was.fill * 1.02, `${mode} ${species} in ${season}: fills ${(now.fill / was.fill).toFixed(2)} of before`);
    assert.ok(now.biggest <= was.biggest * 1.02, `${mode} ${species} in ${season}: its biggest stroke`);
    // Frosted's bare woods are three times the strokes, smaller; the rest as many as before.
    const more = mode === 'frosted' && season === 'winter' && species !== 'pine' ? 3 : 1;
    assert.equal(now.strokes, was.strokes * more, `${mode} ${species} in ${season}: strokes`);
  }
});

test('in winter the new looks have no dark side: lighter bare woods, every stroke facing up, the bare ones stiff', () => {
  for (const mode of ['frosted', 'misty'] as const) for (const species of SPECIES) {
    const now = measure(wood(species, 'winter', mode)), was = measure(wood(species, 'winter', 'off'));
    assert.ok(now.lowest >= 0.15, `${mode} ${species}: a stroke faces ${now.lowest.toFixed(2)} up`);
    if (species === 'pine') continue;
    // Before, the bare woods' strokes averaged 0.07 to 0.14 in light (willow's golden 0.24): none is that dark now.
    assert.ok(now.light > 0.15, `${mode} ${species}: ${now.light.toFixed(3)} against ${was.light.toFixed(3)} before`);
    assert.equal(now.stiff, 1, `${mode} ${species}: bare wood doesn't flutter`);
  }
});

test('in the other seasons the new looks lift the crowns\' undersides', () => {
  for (const mode of ['frosted', 'misty'] as const) for (const season of ['spring', 'summer', 'autumn'] as const) for (const species of SPECIES) {
    const now = measure(wood(species, season, mode)), was = measure(wood(species, season, 'off'));
    assert.ok(was.lowest < -0.4 && now.lowest > -0.31, `${mode} ${species} in ${season}: ${now.lowest.toFixed(2)} (before ${was.lowest.toFixed(2)})`);
  }
});
