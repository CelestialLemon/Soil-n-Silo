import { addCrag, addStone, groundOf, MeshBuilder, rng, srgb, type Ground } from '../../../brush3d/src/index.ts';
import { hash } from '../trees.ts';
import { cragTops } from './pickTile.ts';
import { planOutcropTile, type RocksLook } from './rockPlan.ts';
import { TILE } from './scale.ts';

export { rockMask, rockTileKey, type RocksLook } from './rockPlan.ts';

// Emits a planned rock outcrop tile into a brush3d MeshBuilder (#257).

const FLAT = groundOf(() => 0);

/** The crags' drawn surfaces, for picking (pickTile.ts): read from the same `addCrag` that draws them. */
export const cragTop = cragTops((p) => {
  const b = new MeshBuilder('paint');
  addCrag(b, FLAT, p.x, p.z, {
    rx: p.rx, ry: p.ry, rz: p.rz, yaw: p.yaw, pitch: p.pitch, roll: p.roll, sink: p.sink, crag: p.crag, moss: p.moss, detail: p.detail,
  }, rng(p.seed));
  const g = b.build(), index = g.getIndex();
  if (!index) throw new Error('a crag is built indexed');
  const crag = { pos: Float32Array.from(g.getAttribute('position').array), idx: Array.from(index.array) };
  g.dispose();
  return crag;
});

const STONE_COOL = srgb(0x84878b);
const STONE_MID = srgb(0x978f83);
const STONE_WARM = srgb(0xa49680);

function toneColor(t: number) {
  return t < 0.5
    ? STONE_COOL.clone().lerp(STONE_MID, t * 2)
    : STONE_MID.clone().lerp(STONE_WARM, (t - 0.5) * 2);
}

/** Emits the rock geometry for rock tile (x, y) into `b` according to the active look (`off`, `soft`, `bold`). */
export function placeOutcropTile(
  b: MeshBuilder, ground: Ground, x: number, y: number, isRock: (tx: number, ty: number) => boolean, look: RocksLook,
) {
  if (look === 'off') {
    const rand = rng(Math.floor(hash(x + 5, y - 5) * 1e9)), cx = (x + 0.5) * TILE, cz = (y + 0.5) * TILE;
    addStone(b, ground, cx, cz, 1.1 + rand() * 0.4, 0.3, rand);
    if (rand() < 0.6) addStone(b, ground, cx + (rand() - 0.5) * 2.2, cz + (rand() - 0.5) * 2.2, 0.5 + rand() * 0.3, 0.3, rand);
    return;
  }
  for (const p of planOutcropTile(x, y, isRock, look)) {
    addCrag(b, ground, p.x, p.z, {
      rx: p.rx, ry: p.ry, rz: p.rz, yaw: p.yaw, pitch: p.pitch, roll: p.roll,
      sink: p.sink, crag: p.crag, moss: p.moss, detail: p.detail, color: toneColor(p.tone),
    }, rng(p.seed));
  }
}
