import * as THREE from 'three';
import { BUILDINGS, type BuildingId } from '../game/data.ts';
import { GROUND_IDS, type GroundId } from '../game/ground.ts';
import { networks, POWERED, type Network } from '../game/power.ts';
import type { Building, GameState, Route } from '../game/state.ts';

// What the tools mark the world with, shared by the HUD (its legends, cards and labels) and the brush3d world's tools
// (brush/tools.ts): the overlays and their colours, the power networks' and routes' colours and labels, the tile cursor's
// marks, and which buildings show a problem's marker.

export type Overlay = 'none' | 'fertility' | 'ground' | 'height' | 'power' | 'roads' | 'water' | 'bees';

/** Overlay colours: soil from poor (red) to rich (green), roads (and buildings trucks can't reach), sprinkler water, bee range. */
export const FERT = [0xb03020, 0xd07020, 0xd8b020, 0x98c030, 0x50a030, 0x207a30].map((c) => new THREE.Color(c));
export const ROADS = new THREE.Color(0xd8d0b0), CUT_OFF = new THREE.Color(0xff5040), WATER = new THREE.Color(0x60a8e8), BEES = new THREE.Color(0xf09030);
/**
 * The Ground view's colour for each kind (the overlay tints the tiles, the legend swatches them): apart in hue and in
 * lightness, and none of them the soil view's red to green.
 */
export const GROUND_TINT: Record<GroundId, number> = { loam: 0x7e5a34, silt: 0x5f88a8, clay: 0xc4603a, sand: 0xe8d37a, stony: 0xa8a8a8 };
/** The same, by the map's index (`GROUND_IDS`). */
export const GROUND_COLOURS = GROUND_IDS.map((id) => new THREE.Color(GROUND_TINT[id]));
/** The tint of the buildings and trucks linked to what is focused: a truck's stops, a garage's trucks. */
export const LINK = 0x7ee060;

/** The height view: tints from low to high, a band every HEIGHT_BAND levels (blended between), steep banks darker. */
const LEVELS = [0x3a8a5a, 0x8ab84a, 0xd8c050, 0xd88a3a, 0xb04a3a].map((c) => new THREE.Color(c));
const HEIGHT_BAND = 3, BANK_SHADE = 0.75;
export const heightTint = (level: number, steep: boolean) => {
  const t = Math.min(LEVELS.length - 1, level / HEIGHT_BAND), k = Math.min(LEVELS.length - 2, Math.floor(t));
  const c = LEVELS[k].clone().lerp(LEVELS[k + 1], t - k);
  return steep ? c.multiplyScalar(BANK_SHADE) : c;
};

/** Each power network's colour, by its place in the list of networks: its reach, wires and label. */
export const NET_COLOURS = [0xf2c94c, 0x5fd3e8, 0xf28ab8, 0xa8e063, 0xb59cf5, 0xf5a15a];
/** Wires a pylon being placed would make. */
export const GHOST_WIRE = 0xd8ffb0;
/** Each route's colour, by its place in the list of routes: its way on the ground and the numbers over its stops. */
export const ROUTE_COLOURS = [0xffe08a, 0x8ad8ff, 0xffa8d0, 0xb8f08a, 0xd0b0ff, 0xffb880];

/** The colour index of a network: its place in the list, wrapping round the palette. */
export const netColour = (s: GameState, net: Network) => networks(s).list.indexOf(net) % NET_COLOURS.length;
/** The colour index of a route: its place in the list, wrapping round the palette. */
export const routeColour = (s: GameState, r: Route) => Math.max(0, s.routes.indexOf(r)) % ROUTE_COLOURS.length;

/** Whether a building takes part in power: a pylon, or something that makes, stores or uses it. */
export const inPower = (b: Building) => BUILDINGS[b.type].grid === 'link' || POWERED(b);

/**
 * The power networks shown, only while the player works with power, so pylons stay in the background otherwise: every
 * network has a colour (NET_COLOURS), its pylons' reach on the ground, the wires joining its pylons and the feed lines to
 * each building it powers; a focused pylon shows its reach and its link range; a pylon being placed shows both, the wires
 * it would make and the feeds to the buildings it would bring power to; a label over each network says what it makes and
 * uses, and how full its batteries are.
 */
export interface PowerFocus {
  /** Every network (the power overlay, or placing something that makes, stores or uses power). */
  all: boolean;
  /** Tint each network's reach on the ground (the power overlay, or placing a pylon). */
  tiles: boolean;
  /** A building whose network to show (selected or under the pointer): a pylon or a powered building. */
  focus: number | null;
  /** Pylons being placed: tile and whether each can be built. */
  ghosts: { x: number; y: number; ok: boolean }[];
}

/** A label over a power network shown, and over a stop of a route shown (its number), at a point of the world. */
export interface NetLabel { x: number; y: number; z: number; colour: number; net: Network }
export interface StopLabel { x: number; y: number; z: number; colour: number; text: string }

/** How many pieces a side a tile's ground is taken as, under the tile cursor's marks. */
export const CURSOR_GRID = 8;

/**
 * The tile cursor's marks on one tile: `heights` is the ground's height (world units) on a CURSOR_GRID × CURSOR_GRID grid
 * across it ((CURSOR_GRID + 1)² points, row by row along z, each row along x); a frame along the sides in `edges` (a bit
 * each: 1 north, 2 east, 4 south, 8 west), and dots at the corners (north-west, north-east, south-east, south-west) listed
 * in `dots`.
 */
export interface CursorPatch { x: number; y: number; heights: readonly number[]; edges: number; dots: number[] }

const QUIET = new Set<BuildingId>(['depot', 'sapling']);

/** Whether a building shows a marker: it has a problem (not working, not just idle). */
export const hasMarker = (b: Building) => !QUIET.has(b.type) && b.status !== 'ok' && b.status !== 'idle';
