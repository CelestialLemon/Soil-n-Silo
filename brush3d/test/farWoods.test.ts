import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { addDab, MeshBuilder, rng, srgb } from '../src/kit/builder.ts';
import { addCanopy } from '../src/kit/farWoods.ts';
import type { Species } from '../src/kit/plants.ts';
import { ROOTED_TURN, STIFF_STROKE } from '../src/renderer/dabs.ts';
import { SEASONS, type Season } from '../src/renderer/season.ts';

// The far woods' crowns (brush3d's addCanopy, #268): the picked look's crown strokes cover no more than before, have no
// dark side in winter, and lift the other seasons' dark undersides; and every crown stands on a trunk, its wood thin,
// upright and dark under the snow. (The frame's cost is measured in the game: see #280.)

const SPECIES: readonly Species[] = ['oak', 'birch', 'pine', 'willow', 'poplar', 'apple', 'bush'];

/** A wood of crowns of one species, as the game lays them out (one per 2 × 2 tiles, 3.2 to 4.6 m across). */
function wood(species: Species, season: Season, which: 'now' | 'before' = 'now') {
  const b = new MeshBuilder('foliage'), rand = rng(213), place = rng(7);
  for (let i = 0; i < 40; i++) {
    const x = place() * 200, z = place() * 200, radius = 3.2 + 1.4 * place();
    if (which === 'before') before(b, x, 1, z, radius, species, season, rand);
    else addCanopy(b, x, 1, z, radius, species, season, rand);
  }
  return b.build();
}

/** Where wood() stands its crowns, as each's trunk's key. */
function crowns() {
  const place = rng(7), keys: string[] = [];
  for (let i = 0; i < 40; i++) {
    const x = place() * 200, z = place() * 200;
    place();
    keys.push(`${Math.fround(x).toFixed(3)},${Math.fround(z).toFixed(3)}`);
  }
  return keys;
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

/** Whether a stroke is a far tree's trunk or limb (they alone have no rim light). */
const isWood = (g: THREE.BufferGeometry, i: number) => g.getAttribute('aPaint').getW(i) === 0;

/**
 * What a wood's strokes come to: how many, how much they fill (each card is size² × 4), and how they face and colour. Its
 * crowns' strokes, or (`wood`) its trunks' and limbs'.
 */
function measure(g: THREE.BufferGeometry, wood = false) {
  const nrm = g.getAttribute('normal'), col = g.getAttribute('color'), card = g.getAttribute('aCard'), paint = g.getAttribute('aPaint');
  let fill = 0, biggest = 0, lowest = Infinity, light = 0, stiff = 0, strokes = 0;
  for (let i = 0; i < card.count; i += 4) {
    if (isWood(g, i) !== wood) continue;
    strokes++;
    fill += card.getZ(i) ** 2; biggest = Math.max(biggest, card.getZ(i));
    lowest = Math.min(lowest, nrm.getY(i));
    light += 0.2126 * col.getX(i) + 0.7152 * col.getY(i) + 0.0722 * col.getZ(i);
    if (paint.getX(i) >= STIFF_STROKE) stiff++;
  }
  return { strokes, fill, biggest, lowest, light: light / strokes, stiff: stiff / strokes };
}

test('the crowns cover no more than before, no stroke is bigger, and bare woods in winter have four times as many', () => {
  for (const season of SEASONS) for (const species of SPECIES) {
    const now = measure(wood(species, season)), was = measure(wood(species, season, 'before'));
    assert.ok(now.fill <= was.fill * 1.02, `${species} in ${season}: fills ${(now.fill / was.fill).toFixed(2)} of before`);
    assert.ok(now.biggest <= was.biggest * 1.02, `${species} in ${season}: its biggest stroke`);
    // Bare woods in winter are four times the strokes, smaller; the rest as many as before.
    const more = season === 'winter' && species !== 'pine' ? 4 : 1;
    assert.equal(now.strokes, was.strokes * more, `${species} in ${season}: strokes`);
  }
});

test('every crown stands on its trunk: thin upright strokes from its foot up into it, a bare wood\'s limbs forking', () => {
  for (const season of SEASONS) for (const species of SPECIES) {
    const g = wood(species, season), pos = g.getAttribute('position'), card = g.getAttribute('aCard'), paint = g.getAttribute('aPaint');
    const trunks = new Map<string, { spans: [number, number][]; limbs: number; seconds: number; leans: number[]; top: number; forks: number[] }>();
    for (let i = 0; i < card.count; i += 4) {
      if (!isWood(g, i)) continue;
      const key = `${pos.getX(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
      const t = trunks.get(key) ?? { spans: [], limbs: 0, seconds: 0, leans: [], top: 0, forks: [] };
      // A limb's strokes are rooted (ROOTED_TURN, once for its first, twice for its second); the trunk's aren't.
      const k = Math.floor(paint.getZ(i) / ROOTED_TURN), turn = paint.getZ(i) - k * ROOTED_TURN;
      assert.ok(Math.abs(turn - Math.PI / 2) < 0.85 && paint.getY(i) <= Math.fround(0.2), `${species} in ${season}: a thin, upright stroke`);
      if (k === 0) {
        assert.ok(Math.abs(turn - Math.PI / 2) < 1e-6, `${species} in ${season}: an upright trunk`);
        t.spans.push([pos.getY(i) - card.getZ(i), pos.getY(i) + card.getZ(i)]);
        t.top = Math.max(t.top, pos.getY(i) + card.getZ(i));
      } else {
        assert.ok(k === 1 || k === 2, `${species} in ${season}: a limb's stroke ${k}`);
        if (k === 1) { t.limbs++; t.leans.push(turn - Math.PI / 2); t.forks.push(pos.getY(i)); }
        // A limb's strokes come in pairs, one after the other: the second from the same point, at the same turn, size and
        // seed, so the shader lays it on from where the first ends.
        if (k === 2) {
          t.seconds++;
          const j = i - 4;
          assert.ok(j >= 0 && Math.floor(paint.getZ(j) / ROOTED_TURN) === 1, `${species} in ${season}: a limb's second stroke alone`);
          for (const [a, b] of [[pos.getX(i), pos.getX(j)], [pos.getY(i), pos.getY(j)], [pos.getZ(i), pos.getZ(j)],
            [paint.getZ(i) - ROOTED_TURN, paint.getZ(j)], [card.getZ(i), card.getZ(j)], [card.getW(i), card.getW(j)]]) {
            assert.ok(Math.abs(a - b) < 1e-5, `${species} in ${season}: a limb's strokes apart`);
          }
        }
      }
      trunks.set(key, t);
    }
    // One trunk under each crown, where the crown stands.
    assert.deepEqual([...trunks.keys()].sort(), crowns().sort(), `${species} in ${season}: a trunk under each crown`);
    for (const t of trunks.values()) {
      // Each reaches down into the ground at its foot (1 m up, in wood()), up past its crown's lowest strokes, and unbroken.
      const spans = t.spans.sort((a, b) => a[0] - b[0]), foot = spans[0][0], top = Math.max(...spans.map((s) => s[1]));
      assert.ok(foot <= 1 && top > 3, `${species} in ${season}: a trunk from ${foot.toFixed(2)} to ${top.toFixed(2)}`);
      for (let k = 1; k < spans.length; k++) assert.ok(spans[k][0] < spans[k - 1][1], `${species} in ${season}: a gap in a trunk at ${spans[k][0].toFixed(2)}`);
    }
    const forks = season === 'winter' && species !== 'pine';
    for (const t of trunks.values()) {
      assert.ok(forks ? t.limbs >= 2 : t.limbs === 0, `${species} in ${season}: ${t.limbs} limbs`);
      assert.equal(t.seconds, t.limbs, `${species} in ${season}: each limb two strokes`);
      if (!forks) continue;
      // They fork out both ways from the trunk's upper part (a Y, not an X: Neon's review of #280), each from a point on it.
      assert.ok(Math.min(...t.leans) < -0.2 && Math.max(...t.leans) > 0.2, `${species} in ${season}: limbs leaning ${t.leans.map((l) => l.toFixed(2)).join(", ")}`);
      for (const f of t.forks) assert.ok(f > t.spans[0][0] + 1 && f < t.top, `${species} in ${season}: a limb from ${f.toFixed(2)}`);
    }
    // The wood is a sliver of the crown's cost: its cards fill under half the crowns' (and its marks a fifth of its cards).
    const w = measure(g, true), c = measure(g);
    assert.ok(w.fill < 0.5 * c.fill, `${species} in ${season}: the wood fills ${(w.fill / c.fill).toFixed(2)} of the crowns`);
    // Facing across: no snow lies on it, and it doesn't flutter.
    assert.ok(w.lowest > 0 && measureHighest(g) < 0.1 && w.stiff === 1, `${species} in ${season}: the wood faces across, stiff`);
  }
});

/** How far up the wood's strokes face, at most. */
function measureHighest(g: THREE.BufferGeometry) {
  const nrm = g.getAttribute('normal');
  let most = -Infinity;
  for (let i = 0; i < nrm.count; i += 4) if (isWood(g, i)) most = Math.max(most, nrm.getY(i));
  return most;
}

test('in winter the far woods have no dark side: lighter bare woods, every stroke facing up, the bare ones stiff', () => {
  for (const species of SPECIES) {
    const now = measure(wood(species, 'winter')), was = measure(wood(species, 'winter', 'before'));
    assert.ok(now.lowest >= 0.15, `${species}: a stroke faces ${now.lowest.toFixed(2)} up`);
    if (species === 'pine') continue;
    // Before, the bare woods' strokes averaged 0.07 to 0.14 in light (willow's golden 0.24): none is that dark now.
    assert.ok(now.light > 0.15, `${species}: ${now.light.toFixed(3)} against ${was.light.toFixed(3)} before`);
    assert.equal(now.stiff, 1, `${species}: bare wood doesn't flutter`);
  }
});

test('in the other seasons the far woods lift the crowns\' undersides', () => {
  for (const season of ['spring', 'summer', 'autumn'] as const) for (const species of SPECIES) {
    const now = measure(wood(species, season)), was = measure(wood(species, season, 'before'));
    assert.ok(was.lowest < -0.4 && now.lowest > -0.31, `${species} in ${season}: ${now.lowest.toFixed(2)} (before ${was.lowest.toFixed(2)})`);
  }
});
