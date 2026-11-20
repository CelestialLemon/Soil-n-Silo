import * as THREE from 'three';
import { addDab, srgb, type MeshBuilder, type Paint } from './builder.ts';
import type { Species } from './plants.ts';
import { CRISP_EDGE, STIFF_STROKE } from '../renderer/dabs.ts';
import type { Season } from '../renderer/season.ts';

// The far woods (`addCanopy`): the country's woods too far off to tell one tree's limbs from another's, a crown of a few
// broad strokes for each 2 × 2 tiles at a sliver of a tree's cost. Its imports carry their `.ts` and reach no shader, so the
// tests load it in Node.
//
// Soil-n-Silo#268: in winter the woods were dark chocolate and near-black balls on the white, beside the lacy, snow-dusted
// trees near the map. Two looks for the developer to pick from, and the look before:
//   frosted  a bare wood is a fan of thin upright twig strokes in a light taupe, a third of them darker, the ground showing
//            between them, as the near trees' twigs read from afar; a pine is a cone of spruce boughs.
//   misty    a bare wood is a soft round mass of pale grey, as woods look through cold air; the pines a paler spruce.
//   off      as before #268.
// Their bare strokes and pine boughs face mostly up, so they're lit as the ground under them is (no dark side) and the
// snow and frost the renderer lays on what faces up whiten them as they do the near trees; their colours are the bare
// wood's own, so they read on a winter's day with no snow lying too. In the other seasons both looks shape the pines as
// cones and the poplars as columns, as the near ones are, and lift the crowns' dark undersides; misty also cools and pales
// them a little, as distance does. The same strokes as before, none bigger, in the same one mesh, but for frosted's bare
// woods: four times the strokes at a little over two fifths the size, so less to fill (4 × 0.42² ≈ 0.7 of it).
// Under every crown in both looks, its trunk down to the ground, and a bare wood's limbs forking up into its twigs: up close,
// where the far woods meet the near, a crown without them read as loose strokes floating over the ground, not a tree. They
// are a few thin strokes standing upright, facing across, so no snow lies on them and they stay dark against it.

export const FAR_WOODS_MODES = ['off', 'frosted', 'misty'] as const;
/** How the far woods are painted (#268's comparison; the one not picked goes, then this): see above. */
export type FarWoodsMode = (typeof FAR_WOODS_MODES)[number];

const smooth = THREE.MathUtils.smoothstep;
const FAR_BARE = srgb(0x7a6758);
/** Each species' crown from afar in each season, as before #268. */
const FAR: Record<Species, Record<Season, THREE.Color>> = {
  oak: { spring: srgb(0x76a84e), summer: srgb(0x467348), autumn: srgb(0xd98a32), winter: FAR_BARE },
  birch: { spring: srgb(0x91bc61), summer: srgb(0x9cc068), autumn: srgb(0xe3b43c), winter: srgb(0x8c6c66) },
  pine: { spring: srgb(0x28564f), summer: srgb(0x28564f), autumn: srgb(0x28564f), winter: srgb(0x28564f) },
  willow: { spring: srgb(0x91bc61), summer: srgb(0x83b390), autumn: srgb(0xcdb04a), winter: srgb(0xb48d42) },
  poplar: { spring: srgb(0x588650), summer: srgb(0x2e633d), autumn: srgb(0xe3b43c), winter: FAR_BARE },
  apple: { spring: srgb(0xe9c3c0), summer: srgb(0x567843), autumn: srgb(0xc0782e), winter: FAR_BARE },
  bush: { spring: srgb(0x76a84e), summer: srgb(0x52823c), autumn: srgb(0xa8502f), winter: srgb(0x6d5644) },
};
/** A bare wood in winter from afar: its twigs' taupe, lighter for the ground between them (willow's twigs stay golden). */
const BARE: Record<'frosted' | 'misty', Record<Exclude<Species, 'pine'>, THREE.Color>> = {
  frosted: { oak: srgb(0x8e807a), birch: srgb(0x9c908c), willow: srgb(0xa08a62), poplar: srgb(0x8a7c78), apple: srgb(0x927f7a), bush: srgb(0x86766f) },
  misty: { oak: srgb(0xa29a9a), birch: srgb(0xaca6a6), willow: srgb(0xaca084), poplar: srgb(0x9e9696), apple: srgb(0xa49a99), bush: srgb(0x9a9290) },
};
/** The darker twigs among frosted's strokes. */
const TWIG = srgb(0x76625e);
/** The pines in winter: deep spruce (the snow on them is the renderer's). */
const SPRUCE = { frosted: srgb(0x336654), misty: srgb(0x4a7466) };
/** The cool grey-blue of distance that misty mixes into the other seasons' crowns. */
const HAZE = srgb(0xa3b4bb);
/** A far tree's trunk and limbs: the near trees' bark, a little darker for its shade (misty: paler, through the haze). */
const BARK = { frosted: srgb(0x6a5048), misty: srgb(0x6a5048).lerp(HAZE, 0.3) };

/**
 * A far wood's crown, `radius` across, its foot at (x, y, z), in the species' colour from afar in the season and painted in
 * the look `mode` (#268's comparison). For woods too far off to tell one tree's limbs from another's, at a sliver of a
 * tree's cost.
 */
export function addCanopy(
  b: MeshBuilder, x: number, y: number, z: number, radius: number, species: Species, season: Season, rand: () => number,
  mode: FarWoodsMode = 'frosted',
) {
  const n = Math.round(3 + 1.5 * radius);
  if (mode === 'off') return ball(b, x, y, z, radius, FAR[species][season], n, rand);
  const winter = season === 'winter', misty = mode === 'misty';
  if (species === 'pine') {
    const own = FAR.pine[season], base = winter ? SPRUCE[mode] : misty ? own.clone().lerp(HAZE, 0.18) : own.clone().offsetHSL(0, 0, 0.03);
    cone(b, x, y, z, radius, base, n, winter, rand);
    // A short trunk under its lowest boughs.
    return wood(b, x, y, z, radius * 0.75, radius, 0, BARK[mode], rand);
  }
  // Poplars stand as columns, the rest as balls (willows and bushes too: far off, their shapes are lost in the wood's).
  const tall = species === 'poplar' ? [0.55, 1.35] as const : [1, 1] as const, mid = radius * 1.3 * tall[1];
  if (winter) {
    // Frosted: thin strokes fanning upwards as twigs do, a third of them darker. Misty: round soft dabs, a haze. Neither
    // flutters in the wind: they're wood (STIFF_STROKE), as the near trees' twigs are.
    ball(b, x, y, z, radius, BARE[mode][species], misty ? n : 4 * n, rand, misty
      ? { tall, lift: 0.3, shade: -0.03, up: [0.15, 0.45], reach: [0.45, 0.5], paint: () => [0.4 + STIFF_STROKE, 0.6 + rand() * 0.3, -1, 0.3] }
      : { tall, lift: 0.3, shade: -0.03, up: [0.15, 0.5], reach: [0.3, 0.75], size: 0.42, twig: TWIG,
        paint: () => [0.5 + STIFF_STROKE + CRISP_EDGE, 0.2 + rand() * 0.1, Math.PI / 2 + (rand() - 0.5) * 1.0, 0.3] });
    // Its trunk up into the crown's middle, and limbs forking from there up into the twigs (a poplar's held close).
    return wood(b, x, y, z, mid, radius, species === 'poplar' ? 2 : 3, BARK[mode], rand);
  }
  const base = misty ? FAR[species][season].clone().lerp(HAZE, 0.14) : FAR[species][season];
  ball(b, x, y, z, radius, base, n, rand, { tall, lift: 0.3, shade: misty ? -0.02 : -0.035 });
  // Its trunk up into the leaves (their limbs are hidden in them).
  return wood(b, x, y, z, mid, radius, 0, BARK[mode], rand);
}

/** How far a far tree's trunk and limb strokes face up: hardly, so the snow and frost that lie on what faces up pass them by. */
export const WOOD_FACING = 0.05;

/**
 * A far tree's wood: its trunk, standing from its foot (x, y, z) up to `height` above it, in short upright strokes, and
 * `limbs` strokes forking up from its top, for a crown `radius` across. Thin (as thin as a stroke goes: a fifth of its
 * length), stiff, and turned no more than the fork's lean, so the trunk stands straight from any side.
 */
function wood(b: MeshBuilder, x: number, y: number, z: number, height: number, radius: number, limbs: number, bark: THREE.Color, rand: () => number) {
  // Facing across, each its own way round (the sun lights one side), hardly up.
  const facing = () => { const a = rand() * Math.PI * 2; return new THREE.Vector3(Math.cos(a), WOOD_FACING, Math.sin(a)).normalize(); };
  // A seed of 0.5 and about: the renderer turns a stroke by (seed - 0.5) × 0.7, so these turn by under 0.02.
  const seed = () => 0.5 + (rand() - 0.5) * 0.05;
  const paint = (lean: number): Paint => [0.3 + STIFF_STROKE + CRISP_EDGE, 0.2, Math.PI / 2 + lean, 0];
  // About 0.75 m a stroke: a stroke's mark is a fifth as wide as it's long, and its card (what the GPU fills) as wide, so short
  // ones keep the trunk thin and cheap. Each reaches 0.85 of a stroke either side of its middle, so they overlap, and the
  // lowest reaches into the ground (which hides it) whatever the view's tilt.
  const seg = Math.max(2, Math.round(height / 0.75));
  for (let i = 0; i < seg; i++) {
    const f = (i + 0.5) / seg, c = bark.clone().offsetHSL(0, 0, 0.04 * f + (rand() - 0.5) * 0.03);
    addDab(b, new THREE.Vector3(x, y + height * f, z), facing(), c, height / seg * 0.85, seed(), paint(0));
  }
  for (let i = 0; i < limbs; i++) {
    // Leaning out either way in turn, up from the trunk's top into the crown, lighter as they thin.
    const side = i % 2 ? -1 : 1, lean = side * (0.2 + 0.25 * (i >> 1) + 0.15 * rand()), len = radius * (0.26 + 0.08 * rand());
    const p = new THREE.Vector3(x, y + height * (0.85 + 0.1 * (i >> 1)) + len * 0.8, z);
    const c = bark.clone().offsetHSL(0, 0, 0.05 + (rand() - 0.5) * 0.03);
    addDab(b, p, facing(), c, len, seed(), paint(lean));
  }
}

interface Look {
  /** The crown's width and height against a ball's. */
  tall: readonly [number, number];
  /** How far the strokes under the crown face down: 0.6 before #268 (the dark undersides), less to lift them. */
  lift: number;
  /** The lightness every stroke is shifted by: -0.06 before #268. */
  shade: number;
  /** How far out from the crown's middle the strokes lie, against its radius: the least, and how much more at most. */
  reach?: readonly [number, number];
  /** The strokes' size against before #268's. */
  size?: number;
  /** A darker colour for about a third of the strokes (the twigs), if any. */
  twig?: THREE.Color;
  /** How far up the strokes face, from the crown's foot to its top (its form's facing, out from its middle, when not given). */
  up?: readonly [number, number];
  /** Each stroke's paint (as before #268 when not given). */
  paint?: () => Paint;
}

const BEFORE: Look = { tall: [1, 1], lift: 0.6, shade: -0.06 };

/** A loose ball of `n` broad strokes, its centre 1.3 × `radius` above the foot: before #268, every far crown. */
function ball(b: MeshBuilder, x: number, y: number, z: number, radius: number, base: THREE.Color, n: number, rand: () => number, look = BEFORE) {
  const cy = y + radius * 1.3 * look.tall[1];
  for (let i = 0; i < n; i++) {
    const u = rand() * 2 - 1, phi = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const dir = new THREE.Vector3(s * Math.cos(phi), u < 0 ? u * look.lift : u, s * Math.sin(phi));
    const reach = radius * ((look.reach?.[0] ?? 0.55) + rand() * (look.reach?.[1] ?? 0.4));
    const p = new THREE.Vector3(x + dir.x * reach * look.tall[0], cy + dir.y * reach * look.tall[1], z + dir.z * reach * look.tall[0]);
    const lit = smooth(dir.y, -0.2, 0.9);
    const c = (look.twig && rand() < 0.35 ? look.twig : base).clone()
      .offsetHSL(-0.02 * lit, 0.04 * lit, 0.08 * lit + look.shade).offsetHSL(0, 0, (rand() - 0.5) * 0.05);
    const size = (0.42 + rand() * 0.14) * radius * (look.size ?? 1), seed = rand();
    let facing = dir;
    if (look.up) {
      const ny = look.up[0] + (look.up[1] - look.up[0]) * (u * 0.5 + 0.5), across = Math.sqrt(1 - ny * ny);
      facing = new THREE.Vector3(Math.cos(phi) * across, ny, Math.sin(phi) * across);
    }
    addDab(b, p, facing, c, size, seed, look.paint?.() ?? [0.7, 0.5 + rand() * 0.3, -1, 0.6]);
  }
}

/** A pine's cone of boughs, wide at its foot and narrowing to a point: layered strokes lying across, lit from above. */
function cone(b: MeshBuilder, x: number, y: number, z: number, radius: number, base: THREE.Color, n: number, winter: boolean, rand: () => number) {
  for (let i = 0; i < n; i++) {
    const f = (i + rand()) / n, phi = rand() * Math.PI * 2;
    const reach = radius * 0.8 * (1 - f) * (0.45 + rand() * 0.55);
    const p = new THREE.Vector3(x + Math.cos(phi) * reach, y + radius * (0.5 + 1.9 * f), z + Math.sin(phi) * reach);
    // Boughs face out and up, more so towards the top: in winter, enough for the snow to lie on most of them.
    const up = winter ? 0.45 + 0.35 * f : 0.15 + 0.4 * f;
    const dir = new THREE.Vector3(Math.cos(phi), up, Math.sin(phi)).normalize();
    const c = base.clone().offsetHSL(0, 0, 0.06 * f - 0.03 + (rand() - 0.5) * 0.05);
    const size = (0.42 + rand() * 0.14) * radius * (1 - 0.45 * f);
    // Turned 0, across (the renderer turns each a little either way; a turn below 0 would be any way).
    addDab(b, p, dir, c, size, rand(), [0.5 + CRISP_EDGE, 0.5 + rand() * 0.2, 0, 0.4]);
  }
}
