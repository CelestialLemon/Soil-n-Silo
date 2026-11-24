// Small shared pieces of the world bridge: adding and dropping meshes (the geometry we hand brush3d stays ours to free),
// converting the game's cell rects to brush3d's land rects and back, and the tags picks give back.
import type * as THREE from 'three';
import type { BrushRenderer, LandArea, LandRect, MeshOptions } from '../../brush3d/src/index.ts';
import type { Grid, Rect } from '../game/index.ts';

type Kind = Parameters<BrushRenderer['add']>[1];

/**
 * Adds a geometry to the renderer and returns its mesh. When brush3d cuts it into tiles (`tile`), the tiles hold their own
 * copies, so ours is freed at once.
 */
export function addMesh(r: BrushRenderer, geometry: THREE.BufferGeometry, kind: Kind, options: MeshOptions = {}): THREE.Mesh {
  const mesh = r.add(geometry, kind, options);
  if (mesh.geometry !== geometry) geometry.dispose();
  return mesh;
}

/** Takes a mesh out of the renderer and frees its geometry (the caller's to free: docs/API.md). */
export function dropMesh(r: BrushRenderer, mesh: THREE.Mesh): void {
  r.remove(mesh);
  mesh.geometry.dispose();
}

/** Drops each mesh in a list, and empties it. */
export function dropAll(r: BrushRenderer, meshes: THREE.Mesh[]): void {
  for (const m of meshes) dropMesh(r, m);
  meshes.length = 0;
}

/** A game rect (inclusive cells) as brush3d's land rect. */
export const landRectOf = (rect: Rect): LandRect => ({ x: rect.x0, y: rect.z0, width: rect.x1 - rect.x0 + 1, height: rect.z1 - rect.z0 + 1 });

/** The cells a brush3d land area (metres) touches, clamped to the grid; undefined if it misses. */
export function rectOfArea(g: Grid, area: LandArea): Rect | undefined {
  const x0 = Math.max(0, Math.floor((area.x0 - g.x0) / g.cell)), z0 = Math.max(0, Math.floor((area.z0 - g.z0) / g.cell));
  const x1 = Math.min(g.nx - 1, Math.ceil((area.x1 - g.x0) / g.cell) - 1), z1 = Math.min(g.nz - 1, Math.ceil((area.z1 - g.z0) / g.cell) - 1);
  return x0 > x1 || z0 > z1 ? undefined : { x0, z0, x1, z1 };
}

/** A tag brush3d carries for a mesh: what it is in the game, and its id. */
export const tagOf = (kind: string, id: number | string) => `${kind}:${id}`;

/** A tag read back from a pick, if it's one of ours. */
export function readTag(tag: unknown): { kind: string; id: string } | null {
  if (typeof tag !== 'string') return null;
  const k = tag.indexOf(':');
  return k > 0 ? { kind: tag.slice(0, k), id: tag.slice(k + 1) } : null;
}
