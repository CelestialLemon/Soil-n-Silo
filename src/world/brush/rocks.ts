import { addRock, addStone, rng, srgb, type Ground, type MeshBuilder } from '../../../brush3d/src/index.ts';
import type { RocksLook } from '../../ui/rocksChoice.ts';
import { hash } from '../trees.ts';
import { planOutcropTile } from './rockPlan.ts';
import { TILE } from './scale.ts';

export { ROCK_BIT, rockMask, rockTileKey } from './rockPlan.ts';

// Emits a planned rock outcrop tile into a brush3d MeshBuilder (#257).

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
    addRock(b, ground, p.x, p.z, {
      rx: p.rx, ry: p.ry, rz: p.rz, yaw: p.yaw, pitch: p.pitch, roll: p.roll,
      sink: p.sink, crag: p.crag, moss: p.moss, detail: p.detail, color: toneColor(p.tone),
    }, rng(p.seed));
  }
}
