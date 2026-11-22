import * as THREE from 'three';
import { addDab, srgb, type MeshBuilder, type Paint } from './builder.ts';
import type { Species } from './plants.ts';
import { CRISP_EDGE, ROOTED_TURN, STIFF_STROKE } from '../renderer/dabs.ts';
import type { Season } from '../renderer/season.ts';

// The far woods (`addCanopy`): the country's woods too far off to tell one tree's limbs from another's, a crown of a few
// broad strokes for each 2 × 2 tiles at a sliver of a tree's cost. Its imports carry their `.ts` and reach no shader, so the
// tests load it in Node.
//
// Soil-n-Silo#268 (the developer's pick on #280, `frosted`): in winter a bare wood is a fan of thin upright twig strokes in
// a light taupe, a third of them darker, the ground showing between them, as the near trees' twigs read from afar; a pine is
// a cone of spruce boughs. Their bare strokes and pine boughs face mostly up, so they're lit as the ground under them is (no
// dark side) and the snow and frost the renderer lays on what faces up whiten them as they do the near trees; their colours
// are the bare wood's own, so they read on a winter's day with no snow lying too. In the other seasons the pines are cones
// and the poplars columns, as the near ones are, with the crowns' dark undersides lifted. The same strokes as before, none
// bigger, in the same one mesh, but for the bare woods in winter: four times the strokes at a little over two fifths the
// size, so less to fill (4 × 0.42² ≈ 0.7 of it).
// Under every crown, its trunk down to the ground, and a bare wood's limbs forking up and out into its twigs: up close,
// where the far woods meet the near, a crown without them read as loose strokes floating over the ground, not a tree. They
// are a few thin strokes standing upright, facing across, so no snow lies on them and they stay dark against it; the limbs
// grow out from the trunk (rooted strokes, ROOTED_TURN), so they fork into a Y from any side.

const smooth = THREE.MathUtils.smoothstep;
/** Each species' crown from afar outside winter. */
const FAR: Record<Species, Record<Exclude<Season, 'winter'>, THREE.Color>> = {
  oak: { spring: srgb(0x76a84e), summer: srgb(0x467348), autumn: srgb(0xd98a32) },
  birch: { spring: srgb(0x91bc61), summer: srgb(0x9cc068), autumn: srgb(0xe3b43c) },
  pine: { spring: srgb(0x28564f), summer: srgb(0x28564f), autumn: srgb(0x28564f) },
  willow: { spring: srgb(0x91bc61), summer: srgb(0x83b390), autumn: srgb(0xcdb04a) },
  poplar: { spring: srgb(0x588650), summer: srgb(0x2e633d), autumn: srgb(0xe3b43c) },
  apple: { spring: srgb(0xe9c3c0), summer: srgb(0x567843), autumn: srgb(0xc0782e) },
  bush: { spring: srgb(0x76a84e), summer: srgb(0x52823c), autumn: srgb(0xa8502f) },
};
/** A bare wood in winter from afar: its twigs' taupe, lighter for the ground between them (willow's twigs stay golden). */
const BARE: Record<Exclude<Species, 'pine'>, THREE.Color> = {
  oak: srgb(0x8e807a), birch: srgb(0x9c908c), willow: srgb(0xa08a62), poplar: srgb(0x8a7c78), apple: srgb(0x927f7a), bush: srgb(0x86766f),
};
/** The darker twigs among a bare wood's strokes. */
const TWIG = srgb(0x76625e);
/** The pines in winter: deep spruce (the snow on them is the renderer's). */
const SPRUCE = srgb(0x336654);
/** A far tree's trunk and limbs: the near trees' bark, a little darker for its shade. */
const BARK = srgb(0x6a5048);

/**
 * A far wood's crown, `radius` across, its foot at (x, y, z), on a thin trunk in the species' shape and colour for the
 * season (#268). For woods too far off to tell one tree's limbs from another's, at a sliver of a tree's cost.
 */
export function addCanopy(
  b: MeshBuilder, x: number, y: number, z: number, radius: number, species: Species, season: Season, rand: () => number,
) {
  const n = Math.round(3 + 1.5 * radius), winter = season === 'winter';
  if (species === 'pine') {
    const base = winter ? SPRUCE : FAR.pine[season].clone().offsetHSL(0, 0, 0.03);
    cone(b, x, y, z, radius, base, n, winter, rand);
    // A short trunk under its lowest boughs.
    return wood(b, x, y, z, radius * 0.75, radius, 0, BARK, rand);
  }
  // Poplars stand as columns, the rest as balls (willows and bushes too: far off, their shapes are lost in the wood's).
  const poplar = species === 'poplar', tall = poplar ? [0.55, 1.35] as const : [1, 1] as const, mid = radius * 1.3 * tall[1];
  if (winter) {
    // Thin strokes fanning upwards as twigs do, a third of them darker, the fan a little wider than tall (but a poplar's)
    // and its strokes leaning a little further, as the near trees' crowns spread; stiff wood (STIFF_STROKE), never fluttering.
    ball(b, x, y, z, radius, BARE[species], 4 * n, rand, {
      tall: poplar ? tall : [1.15, 1], lift: 0.3, shade: -0.03, up: [0.15, 0.5], reach: [0.3, 0.75], size: 0.42, twig: TWIG,
      paint: () => [0.5 + STIFF_STROKE + CRISP_EDGE, 0.2 + rand() * 0.1, Math.PI / 2 + (rand() - 0.5) * 1.2, 0.3],
    });
    // Its trunk up into the crown's middle, and limbs forking from there up into the twigs (a poplar's held close).
    return wood(b, x, y, z, mid, radius, poplar ? 2 : 3, BARK, rand, poplar ? 0.45 : 1);
  }
  ball(b, x, y, z, radius, FAR[species][season], n, rand, { tall, lift: 0.3, shade: -0.035 });
  // Its trunk up into the leaves (their limbs are hidden in them).
  return wood(b, x, y, z, mid, radius, 0, BARK, rand);
}

/** How far a far tree's trunk and limb strokes face up: hardly, so the snow and frost that lie on what faces up pass them by. */
export const WOOD_FACING = 0.05;

/**
 * A far tree's wood: its trunk, standing from its foot (x, y, z) up to `height` above it, in short upright strokes, and
 * `limbs` strokes forking up and out from its upper part (leaning `spread` times as far), for a crown `radius` across. Thin
 * (as thin as a stroke goes: a fifth of its length), stiff, and turned no more than the fork's lean, so the trunk stands
 * straight from any side.
 */
function wood(
  b: MeshBuilder, x: number, y: number, z: number, height: number, radius: number, limbs: number, bark: THREE.Color, rand: () => number,
  spread = 1,
) {
  // Facing across, each its own way round (the sun lights one side), hardly up.
  const facing = () => { const a = rand() * Math.PI * 2; return new THREE.Vector3(Math.cos(a), WOOD_FACING, Math.sin(a)).normalize(); };
  // A seed of 0.5 and about: the renderer turns a stroke by (seed - 0.5) × 0.7, so these turn by under 0.02.
  const seed = () => 0.5 + (rand() - 0.5) * 0.05;
  const paint = (lean: number, rooted = 0): Paint => [0.3 + STIFF_STROKE + CRISP_EDGE, 0.2, Math.PI / 2 + lean + rooted, 0];
  // About 0.75 m a stroke: a stroke's mark is a fifth as wide as it's long, and its card (what the GPU fills) as wide, so short
  // ones keep the trunk thin and cheap. Each reaches 0.85 of a stroke either side of its middle, so they overlap, and the
  // lowest reaches into the ground (which hides it) whatever the view's tilt.
  const seg = Math.max(2, Math.round(height / 0.75));
  for (let i = 0; i < seg; i++) {
    const f = (i + 0.5) / seg, c = bark.clone().offsetHSL(0, 0, 0.04 * f + (rand() - 0.5) * 0.03);
    addDab(b, new THREE.Vector3(x, y + height * f, z), facing(), c, height / seg * 0.85, seed(), paint(0));
  }
  for (let i = 0; i < limbs; i++) {
    // Rooted on the trunk's upper part and growing out from it (ROOTED_TURN), leaning out either way in turn, the third
    // closer to upright, so they fork into a Y from any side, as the near trees' limbs do. Centred on the trunk, as they
    // were, they crossed in an X: a broomstick (Gemini 4 Neon's review of #280). Each two strokes end to end, so it's no
    // thicker than the trunk. Lighter as they thin.
    const side = i % 2 ? -1 : 1, lean = side * spread * (i < 2 ? 0.6 + 0.2 * rand() : 0.12 + 0.1 * rand());
    const len = radius * (0.46 + 0.1 * rand()) / 2, p = new THREE.Vector3(x, y + height * (0.62 + 0.1 * i), z);
    const n = facing(), turn = seed(), c = bark.clone().offsetHSL(0, 0, 0.05 + (rand() - 0.5) * 0.03);
    for (let k = 1; k <= 2; k++) addDab(b, p, n, c.clone().offsetHSL(0, 0, 0.02 * (k - 1)), len, turn, paint(lean, k * ROOTED_TURN));
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

/** A loose ball (or twig fan) of `n` strokes, its centre 1.3 × `radius` × height above the foot. */
function ball(b: MeshBuilder, x: number, y: number, z: number, radius: number, base: THREE.Color, n: number, rand: () => number, look: Look) {
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
