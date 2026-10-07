import * as THREE from 'three';
import { FLAG, GeometryCollector, linearColor as lin, place } from 'pixel3d-renderer';

// Small helpers for building geometry in code.

const BOX = new THREE.BoxGeometry(1, 1, 1);

/** A box with its base centred at (x, y, z). */
export const box = (c: GeometryCollector, x: number, y: number, z: number, w: number, h: number, d: number, hex: number, flag: number = FLAG.NORMAL) =>
  c.add(BOX, place(x, y + h / 2, z, 0, 0, 0, w, h, d), lin(hex), flag);

/** Deterministic noise per tile, so the farm looks the same every load. */
export const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
