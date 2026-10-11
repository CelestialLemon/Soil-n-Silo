import { FLAG, motion } from 'pixel3d-renderer';
import type { BuildingId, CropId, ItemId } from '../game/data.ts';
import { ITEMS } from '../game/data.ts';
import { Kit } from './kit.ts';

// Stand-in models built in code: every building, crop, good and marker the game shows, in local space (origin on the
// ground at the footprint centre, front facing +z). Blender models in public/models/
// replace these as they land (models.ts); these keep the game playable without them. Solarpunk palette: timber, white
// ceramic, copper, solar blue, terracotta and living green.

export const C = {
  timber: 0xa07a50, dark: 0x6a4c34, plank: 0xb8925e, ceramic: 0xeee6d6, cream: 0xe0d4b8, copper: 0xc87a4a, brass: 0xd8a84a,
  solar: 0x2c4c80, solarLight: 0x4a74b0, glass: 0x9ad0d8, moss: 0x6a9a48, leaf: 0x4f8a3a, leafLight: 0x7ab050, terracotta: 0xc8704a,
  slate: 0x4b6470, stone: 0x8a8c84, stoneLight: 0xb0aa98, soil: 0x6a4a30, glow: 0xffd68b, fire: 0xff9c39, red: 0xc84a3a,
  white: 0xf6f2ea,
};

type Builder = (k: Kit) => void;

/** Where a silo's drones land, in its local space (x, z), one per drone. */
export const SILO_PADS: [number, number][] = [[0.5, 0.5], [-0.4, 0.55], [0.55, -0.45]];

/** A green roof: a slab with a moss top. */
function mossRoof(k: Kit, x: number, y: number, z: number, w: number, d: number) {
  k.box(x, y, z, w, 0.08, d, C.dark).box(x, y + 0.08, z, w - 0.08, 0.08, d - 0.08, C.moss);
}

/** A small planter with a bush, for life on every building. */
function planter(k: Kit, x: number, z: number, y = 0) {
  k.box(x, y, z, 0.3, 0.18, 0.3, C.terracotta).ball(x, y + 0.28, z, 0.18, C.leafLight);
}

const B: Partial<Record<BuildingId, Builder>> = {
  // A field is drawn from its soil and crops (view.ts); this is its look in the build preview.
  field: (k) => {
    for (const x of [-1, 0, 1]) for (const z of [-1, 0, 1]) k.box(x, -0.05, z, 0.98, 0.08, 0.98, 0x8a6a46).box(x, 0.03, z, 0.3, 0.12, 0.3, C.leafLight);
  },
  silo: (k) => {
    k.box(0, 0, 0, 1.9, 0.14, 1.9, C.stoneLight)
      .cyl(-0.35, 0.14, -0.35, 0.5, 1.7, C.ceramic, { seg: 12 })
      .cyl(-0.35, 0.6, -0.35, 0.53, 0.08, C.copper, { seg: 12 }).cyl(-0.35, 1.25, -0.35, 0.53, 0.08, C.copper, { seg: 12 })
      .cone(-0.35, 1.84, -0.35, 0.58, 0.5, C.moss, { seg: 12 }).cyl(-0.35, 2.3, -0.35, 0.05, 0.2, C.brass, { seg: 6 })
      .box(0.15, 0.9, -0.35, 0.3, 0.14, 0.14, C.copper);
    // Three landing pads for its drones, with a light each.
    for (const [x, z] of SILO_PADS) {
      k.cyl(x, 0.14, z, 0.3, 0.06, C.slate, { seg: 10 }).cyl(x, 0.2, z, 0.2, 0.02, C.cream, { seg: 10 })
        .box(x + 0.22, 0.2, z + 0.22, 0.06, 0.06, 0.06, C.glow, { flag: FLAG.EMISSIVE });
    }
    planter(k, 0.62, -0.75, 0.14);
  },
  sprinkler: (k) => {
    k.box(0, 0, 0, 0.36, 0.08, 0.36, C.stone).cyl(0, 0.08, 0, 0.05, 0.55, C.copper, { seg: 6 })
      .box(0, 0.63, 0, 0.6, 0.05, 0.06, C.brass, { mo: motion.spin([0, 0.65, 0], [0, 1, 0], 3) })
      .cyl(0, 0.6, 0, 0.08, 0.1, C.copper, { seg: 6 });
  },
  hive: (k) => {
    for (const [x, z] of [[-0.22, -0.18], [0.22, -0.18], [-0.22, 0.18], [0.22, 0.18]]) k.box(x, 0, z, 0.06, 0.3, 0.06, C.dark);
    k.box(0, 0.3, 0, 0.56, 0.2, 0.46, C.white).box(0, 0.5, 0, 0.56, 0.2, 0.46, C.brass).box(0, 0.7, 0, 0.6, 0.06, 0.5, C.terracotta)
      .box(0, 0.33, 0.23, 0.18, 0.04, 0.02, C.dark);
    for (const [x, z, h] of [[0.4, 0.35, 0xe8507a], [-0.38, 0.38, 0xf0d050], [0.38, -0.38, 0xa070e0]] as const) k.box(x, 0, z, 0.08, 0.25, 0.08, C.leaf).ball(x, 0.3, z, 0.08, h);
  },
  composter: (k) => {
    for (const x of [-0.5, 0.5]) {
      for (let i = 0; i < 4; i++) k.box(x, i * 0.2, -0.65, 0.86, 0.14, 0.08, C.plank).box(x, i * 0.2, 0.65, 0.86, 0.14, 0.08, C.plank);
      k.box(x - 0.43, 0, 0, 0.08, 0.8, 1.38, C.timber).box(x + 0.43, 0, 0, 0.08, 0.8, 1.38, C.timber).box(x, 0, 0, 0.8, 0.62, 1.2, C.soil);
    }
    k.ball(-0.5, 0.62, 0, 0.3, 0x5a3a24, { sy: 0.5 }).ball(0.5, 0.62, 0.1, 0.25, C.leafLight, { sy: 0.5 });
  },
  mill: (k) => {
    k.box(0, 0, 0, 1.7, 0.2, 1.7, C.stoneLight).box(0, 0.2, 0, 1.3, 1.0, 1.3, C.ceramic).box(0, 0.2, 0.66, 0.4, 0.6, 0.02, C.dark);
    mossRoof(k, 0, 1.2, 0, 1.5, 1.5);
    k.cone(0.2, 1.36, -0.2, 0.42, 0.55, C.copper, { seg: 8 }).box(0.2, 1.9, -0.2, 0.5, 0.12, 0.5, C.brass);
    k.cyl(-0.7, 0.55, 0.2, 0.38, 0.1, C.timber, { seg: 10, rz: Math.PI / 2, mo: motion.spin([-0.75, 0.55, 0.2], [1, 0, 0], 2.4) });
    k.box(0.4, 0.6, 0.66, 0.3, 0.26, 0.04, C.glow, { flag: FLAG.EMISSIVE });
    planter(k, 0.7, 0.75, 0.2);
  },
  press: (k) => {
    k.box(0, 0, 0, 1.7, 0.18, 1.7, C.stoneLight).box(-0.3, 0.18, 0, 0.9, 0.7, 1.1, C.timber).box(-0.3, 0.88, 0, 1.0, 0.1, 1.2, C.dark)
      .cyl(-0.3, 0.98, 0, 0.08, 0.4, C.copper, { seg: 6 })
      .cyl(-0.3, 1.38, 0, 0.42, 0.06, C.brass, { seg: 8, mo: motion.spin([-0.3, 1.4, 0], [0, 1, 0], 1.5) })
      .cyl(0.5, 0.18, 0.35, 0.22, 0.45, 0xe8c040, { seg: 8 }).cyl(0.5, 0.63, 0.35, 0.12, 0.1, C.dark, { seg: 6 })
      .box(0.5, 0.18, -0.4, 0.4, 0.3, 0.4, C.plank);
    planter(k, 0.65, -0.05, 0.18);
  },
  spinner: (k) => {
    k.box(0, 0, 0, 1.7, 0.16, 1.7, C.stoneLight).box(-0.55, 0.16, 0, 0.12, 0.9, 0.12, C.timber).box(0.55, 0.16, 0, 0.12, 0.9, 0.12, C.timber)
      .box(0, 0.16, -0.4, 1.4, 0.12, 0.5, C.plank)
      .cyl(0, 0.9, 0, 0.5, 0.08, C.timber, { seg: 12, rz: Math.PI / 2, mo: motion.spin([0, 0.9, 0], [1, 0, 0], 3) })
      .box(0, 0.86, 0, 1.2, 0.08, 0.08, C.dark);
    for (const x of [-0.4, -0.15, 0.1, 0.35]) k.cyl(x, 0.28, -0.4, 0.07, 0.3, 0xd8d0e8, { seg: 6 });
    planter(k, 0.6, 0.6, 0.16);
  },
  loom: (k) => {
    k.box(0, 0, 0, 1.7, 0.16, 1.7, C.stoneLight);
    for (const x of [-0.7, 0.7]) k.box(x, 0.16, -0.5, 0.1, 1.3, 0.1, C.timber).box(x, 0.16, 0.5, 0.1, 1.3, 0.1, C.timber).box(x, 1.4, 0, 0.1, 0.1, 1.1, C.timber);
    k.box(0, 1.4, -0.5, 1.5, 0.1, 0.1, C.dark).box(0, 0.6, 0, 1.3, 0.06, 0.9, 0xece4d0).box(0, 0.5, 0.5, 1.4, 0.1, 0.12, C.dark)
      .box(0, 0.9, 0, 1.3, 0.12, 0.08, C.copper, { mo: motion.swing([0, 1.4, 0], [1, 0, 0], 0.35) });
    planter(k, 0.65, 0.7, 0.16);
  },
  bakery: (k) => {
    k.box(0, 0, 0, 1.7, 0.18, 1.7, C.stoneLight).box(0, 0.18, 0, 1.4, 0.9, 1.3, C.terracotta).ball(0, 1.08, 0, 0.66, C.terracotta, { sy: 0.6 })
      .box(0, 0.3, 0.62, 0.55, 0.45, 0.1, C.dark).box(0, 0.32, 0.66, 0.42, 0.32, 0.04, C.fire, { flag: FLAG.EMISSIVE })
      .box(0.45, 1.0, -0.35, 0.26, 0.9, 0.26, C.stone).box(0.45, 1.9, -0.35, 0.32, 0.08, 0.32, C.dark);
    mossRoof(k, -0.3, 1.45, 0, 0.6, 0.6);
    k.smoke(0.45, 2.0, -0.35, 0.7);
  },
  cannery: (k) => {
    k.box(0, 0, 0, 1.7, 0.18, 1.7, C.stoneLight).cyl(-0.3, 0.18, -0.15, 0.55, 0.75, C.copper, { seg: 10 })
      .ball(-0.3, 0.93, -0.15, 0.55, C.copper, { sy: 0.45 }).cyl(-0.3, 1.1, -0.15, 0.06, 0.4, C.brass, { seg: 6 })
      .box(0.55, 0.18, 0.2, 0.5, 0.7, 0.9, C.timber);
    for (const z of [-0.1, 0.15, 0.4]) for (const y of [0.3, 0.6]) k.cyl(0.55, y + 0.1, z, 0.08, 0.16, C.red, { seg: 6 });
    k.smoke(-0.3, 1.5, -0.15, 0.4, 3);
  },
  solar: (k) => {
    k.box(0, 0, 0, 1.9, 0.06, 1.9, C.moss);
    for (const x of [-0.8, 0.8]) k.box(x, 0, -0.5, 0.1, 0.5, 0.1, C.timber).box(x, 0, 0.5, 0.1, 0.9, 0.1, C.timber);
    // Tilted towards the south-ish front so it reads from the default view.
    k.boxAt(0, 0.75, 0, 1.86, 0.06, 1.5, C.dark, { rx: -0.42 }).boxAt(0, 0.79, 0, 1.76, 0.04, 1.4, C.solar, { rx: -0.42 })
      .boxAt(0, 0.81, 0, 0.04, 0.02, 1.4, C.solarLight, { rx: -0.42 }).boxAt(0, 0.81, 0, 1.76, 0.02, 0.04, C.solarLight, { rx: -0.42 });
  },
  turbine: (k) => {
    k.box(0, 0, 0, 0.6, 0.12, 0.6, C.stone).cyl(0, 0.12, 0, 0.12, 3.0, C.white, { seg: 8, top: 0.6 })
      .box(0, 3.05, -0.05, 0.22, 0.22, 0.5, C.white).cone(0, 3.05, 0.25, 0.09, 0.15, C.copper);
    const hub: [number, number, number] = [0, 3.16, 0.24];
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      k.boxAt(Math.sin(a) * 0.55, 3.16 + Math.cos(a) * 0.55, 0.24, 0.1, 1.1, 0.03, C.white, { rz: -a, mo: motion.spin(hub, [0, 0, 1], 2.2) });
    }
  },
  battery: (k) => {
    k.box(0, 0, 0, 1.8, 0.12, 1.8, C.stoneLight).box(0, 0.12, 0, 1.5, 0.9, 1.1, C.ceramic).box(0, 1.02, 0, 1.6, 0.1, 1.2, C.copper)
      .box(-0.4, 0.3, 0.56, 0.4, 0.5, 0.02, C.glass, { flag: FLAG.EMISSIVE }).box(0.4, 0.3, 0.56, 0.4, 0.5, 0.02, C.glass, { flag: FLAG.EMISSIVE });
    for (const x of [-0.7, 0.7]) k.box(x, 0.12, 0, 0.06, 0.9, 1.14, C.copper);
    mossRoof(k, 0, 1.12, 0, 1.0, 0.8);
  },
  digester: (k) => {
    k.box(0, 0, 0, 1.8, 0.14, 1.8, C.stoneLight).cyl(0, 0.14, 0, 0.78, 0.5, C.cream, { seg: 12 }).ball(0, 0.64, 0, 0.78, C.moss, { sy: 0.7 })
      .cyl(0.6, 0.5, 0.55, 0.05, 0.9, C.copper, { seg: 6 }).cyl(0.6, 1.4, 0.55, 0.09, 0.08, C.brass, { seg: 6 })
      .box(-0.4, 0.14, 0.72, 0.36, 0.36, 0.1, C.dark);
    k.smoke(0.6, 1.5, 0.55, 0.2, 3, 0xd8dcd0);
  },
  pylon: (k) => {
    k.box(0, 0, 0, 0.3, 0.1, 0.3, C.stone).cyl(0, 0.1, 0, 0.07, 1.9, C.timber, { seg: 6 })
      .box(0, 1.75, 0, 0.6, 0.06, 0.08, C.dark).cyl(-0.26, 1.81, 0, 0.05, 0.1, C.copper, { seg: 6 }).cyl(0.26, 1.81, 0, 0.05, 0.1, C.copper, { seg: 6 })
      .box(0, 2.0, 0, 0.18, 0.08, 0.18, C.solar).box(0, 1.92, 0, 0.1, 0.08, 0.1, C.glow, { flag: FLAG.EMISSIVE });
  },
  sapling: (k) => {
    k.box(0, 0, 0, 0.3, 0.04, 0.3, C.soil).cyl(0, 0, 0, 0.03, 0.55, C.dark, { seg: 5 }).ball(0, 0.6, 0, 0.18, C.leafLight).ball(0.08, 0.45, 0.05, 0.12, C.leaf);
  },
  depot: (k) => {
    k.box(0, 0, 0, 2.9, 0.3, 2.9, C.stoneLight).box(0, 0.3, -0.7, 2.6, 0.9, 1.2, C.timber).box(0, 0.3, -0.7, 2.4, 0.7, 1.24, C.plank);
    mossRoof(k, 0, 1.2, -0.7, 2.8, 1.5);
    for (const x of [-1.2, 1.2]) k.box(x, 0.3, 0.8, 0.12, 1.8, 0.12, C.timber);
    k.box(0, 2.1, 0.8, 2.6, 0.12, 0.3, C.dark).box(0, 2.22, 0.8, 1.2, 0.24, 0.06, C.cream);
    for (const [x, z] of [[-0.8, 0.4], [-0.4, 0.5], [0.7, 0.3]]) k.box(x, 0.3, z, 0.36, 0.3, 0.36, C.plank);
    k.box(1.0, 0.3, 0.9, 0.3, 0.3, 0.3, C.plank).cyl(-0.4, 0.6, 0.5, 0.12, 0.2, C.red, { seg: 6 });
    k.box(0.3, 0.42, -0.08, 0.5, 0.36, 0.04, C.glow, { flag: FLAG.EMISSIVE });
  },
};

/** The stand-in for a building, still and running. */
export function standIn(type: BuildingId): { idle: ReturnType<Kit['build']>; running: ReturnType<Kit['build']> } {
  const b = B[type] ?? ((k: Kit) => k.box(0, 0, 0, 0.8, 0.8, 0.8, C.red));
  const idle = new Kit(false), running = new Kit(true);
  b(idle); b(running);
  return { idle: idle.build(), running: running.build() };
}

// ---- Crops (one tile each) ----

const CROP: Record<CropId, (k: Kit, stage: number, n: number) => void> = {
  wheat: (k, s, n) => {
    for (let i = 0; i < 5; i++) {
      const x = -0.3 + (i % 3) * 0.3, z = -0.25 + Math.floor(i / 3) * 0.4, h = 0.15 + 0.17 * s;
      k.box(x, 0, z, 0.06, h, 0.06, s === n - 1 ? 0xc8a040 : C.leafLight, { mo: motion.sway(x, z, 0, 0.6) });
      if (s >= 2) k.box(x, h, z, 0.1, 0.16, 0.1, s === n - 1 ? 0xe2c25a : 0xb8c060, { mo: motion.sway(x, z, 0, 0.6) });
    }
  },
  beans: (k, s, n) => {
    k.box(0, 0, 0, 0.05, 0.25 + 0.2 * s, 0.05, C.dark);
    for (let i = 0; i <= s; i++) k.ball(0.05 * (i % 2 ? 1 : -1), 0.15 + 0.18 * i, 0, 0.14, C.leaf, { mo: motion.sway(0, 0, 0, 0.8) });
    if (s === n - 1) for (const [x, y] of [[0.12, 0.3], [-0.1, 0.5], [0.1, 0.6]]) k.box(x, y, 0.08, 0.05, 0.16, 0.05, 0x6a9a3a);
  },
  tomato: (k, s, n) => {
    k.ball(0, 0.12 + 0.1 * s, 0, 0.18 + 0.06 * s, C.leaf, { sy: 1.2, mo: motion.sway(0, 0, 0, 0.6) });
    if (s >= 2) for (const [x, y, z] of [[0.15, 0.25, 0.12], [-0.14, 0.32, 0.1], [0.05, 0.4, -0.15]]) k.ball(x, y + 0.05 * s, z, 0.07, s === n - 1 ? 0xe0503a : 0x9ac050);
  },
  sunflower: (k, s, n) => {
    const h = 0.25 + 0.3 * s;
    k.box(0, 0, 0, 0.06, h, 0.06, C.leaf, { mo: motion.sway(0, 0, 0, h) }).ball(0.08, h * 0.5, 0, 0.1, C.leafLight, { sy: 0.4 });
    if (s >= 2) k.boxAt(0, h + 0.05, 0.05, 0.36, 0.36, 0.06, s === n - 1 ? 0xf2c63a : 0xa8c050, { rx: 0.5, mo: motion.sway(0, 0, 0, h) })
      .boxAt(0, h + 0.05, 0.09, 0.16, 0.16, 0.04, 0x6a4a2a, { rx: 0.5, mo: motion.sway(0, 0, 0, h) });
  },
  flax: (k, s, n) => {
    for (let i = 0; i < 6; i++) {
      const x = -0.3 + (i % 3) * 0.3, z = -0.2 + Math.floor(i / 3) * 0.4, h = 0.12 + 0.14 * s;
      k.box(x, 0, z, 0.04, h, 0.04, 0x7aa050, { mo: motion.sway(x, z, 0, 0.5) });
      if (s === n - 1) k.ball(x, h + 0.03, z, 0.06, 0x8aa8e8, { mo: motion.sway(x, z, 0, 0.5) });
    }
  },
};

export function cropStandIn(id: CropId, stage: number, stages: number) {
  const k = new Kit(true);
  CROP[id](k, stage, stages);
  return k.build();
}

// ---- Goods (carried under drones) ----

export function itemShape(id: ItemId) {
  const k = new Kit(false), hex = ITEMS[id].colour;
  switch (id) {
    case 'egg': k.ball(0, 0.1, 0, 0.09, hex, { sy: 1.25 }); break;
    case 'tomato': case 'honey': k.ball(0, 0.1, 0, 0.1, hex); break;
    case 'oil': case 'sauce': k.cyl(0, 0, 0, 0.09, 0.2, hex, { seg: 6 }).cyl(0, 0.2, 0, 0.05, 0.05, C.dark, { seg: 6 }); break;
    case 'bread': k.ball(0, 0.08, 0, 0.14, hex, { sy: 0.6 }); break;
    case 'honeycake': k.cyl(0, 0, 0, 0.13, 0.12, hex, { seg: 8 }).cyl(0, 0.12, 0, 0.13, 0.03, 0xf8e8c8, { seg: 8 }); break;
    case 'linen': case 'yarn': k.cyl(0, 0, 0, 0.1, 0.16, hex, { seg: 8 }); break;
    case 'wheat': case 'flax': k.box(0, 0, 0, 0.12, 0.22, 0.12, hex); break;
    case 'manure': case 'compost': k.ball(0, 0.06, 0, 0.12, hex, { sy: 0.5 }); break;
    default: k.box(0, 0, 0, 0.18, 0.16, 0.18, hex);
  }
  return k.build();
}

// ---- Markers and frames ----

/** A diamond floating over a building that isn't working, in the colour of what's wrong. */
export function marker(hex: number) {
  const k = new Kit(false);
  k.boxAt(0, 0, 0, 0.22, 0.22, 0.22, hex, { flag: FLAG.EMISSIVE, rx: Math.PI / 4, rz: Math.PI / 4 });
  return k.build();
}

/** A flat frame round an n × n square, for the hovered tile and placement. */
export function frame(n: number, hex: number, t = 0.06) {
  const k = new Kit(false), h = n / 2 - t / 2;
  for (const [x, z, w, d] of [[0, -h, n, t], [0, h, n, t], [-h, 0, t, n - 2 * t], [h, 0, t, n - 2 * t]]) k.box(x, 0, z, w, 0.02, d, hex, { flag: FLAG.EMISSIVE });
  return k.build();
}

/** Each power network's colour, by its place in the list of networks: its reach, wires and label. */
export const NET_COLOURS = [0xf2c94c, 0x5fd3e8, 0xf28ab8, 0xa8e063, 0xb59cf5, 0xf5a15a];
/** Wires a pylon being placed would make. */
export const GHOST_WIRE = 0xd8ffb0;

/** A glowing unit bar from the origin along +x, scaled and turned into a wire, a feed line or a range mark. */
export function bar(hex: number) {
  const k = new Kit(false);
  k.boxAt(0.5, 0, 0, 1, 1, 1, hex, { flag: FLAG.EMISSIVE });
  return k.build();
}

/** A flat tinted square filling a tile, for overlays. */
export function tileFill(hex: number) {
  const k = new Kit(false);
  k.box(0, 0, 0, 0.84, 0.015, 0.84, hex, { flag: FLAG.DECOR });
  return k.build();
}

export function drone() {
  const k = new Kit(true);
  k.box(0, 0, 0, 0.32, 0.1, 0.32, C.white).box(0, -0.1, 0, 0.26, 0.1, 0.26, C.plank);
  for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) {
    k.box(x / 2, 0.04, z / 2, Math.abs(x) + 0.04, 0.03, 0.04, C.dark, { ry: Math.atan2(x, z) });
    k.box(x, 0.08, z, 0.3, 0.015, 0.05, C.cream, { mo: motion.spin([x, 0.09, z], [0, 1, 0], 18) });
  }
  k.box(0, 0.1, 0.12, 0.08, 0.03, 0.06, C.glow, { flag: FLAG.EMISSIVE });
  return k.build();
}

export function rock(v: number) {
  const k = new Kit(false);
  const parts = [[[0, 0.18, 0, 0.36], [0.22, 0.1, 0.18, 0.2]], [[0, 0.22, 0.05, 0.42], [-0.24, 0.12, -0.2, 0.22], [0.25, 0.08, -0.15, 0.16]], [[0.05, 0.14, 0, 0.3], [-0.2, 0.1, 0.2, 0.18]]][v % 3];
  for (const [x, y, z, r] of parts) k.ball(x, y, z, r, v % 2 ? C.stone : C.stoneLight, { sy: 0.75 });
  k.ball(0.15, 0.03, 0.3, 0.12, C.moss, { sy: 0.3 });
  return k.build();
}

/** Soil under a field, one tile, by fertility band (pale to dark). */
export const SOIL_BANDS = 6;
const SOIL = [0xb89a6a, 0xa08058, 0x8a6a46, 0x735638, 0x5e442c, 0x4a3422];
export const soilBand = (f: number) => Math.min(SOIL_BANDS - 1, Math.floor(f / (100 / SOIL_BANDS)));
export function soilTile(band: number) {
  const k = new Kit(false);
  k.box(0, -0.05, 0, 0.98, 0.08, 0.98, SOIL[band]);
  for (const z of [-0.3, 0, 0.3]) k.box(0, 0.03, z, 0.9, 0.015, 0.08, SOIL[Math.max(0, band - 1)]);
  return k.build();
}
