// The bridges: a plank bridge (brush3d's addPlankBridge) wherever a track crosses water, as the game's rules place them
// (state.bridges: where, which way, how long and wide, and the deck's height). Built again whenever the bridges change or
// the land under one is swapped in again. The tracks themselves are the land's paint (LAND_COVER.track).
import type * as THREE from 'three';
import { addPlankBridge, type BrushRenderer, type LandArea, MeshBuilder } from '../../brush3d/src/index.ts';
import { type Bridge, type GameState, hash3 } from '../game/index.ts';
import { addMesh, dropAll, tagOf } from './util.ts';

export class Bridges {
  private readonly r: BrushRenderer;
  private state: GameState;
  private meshes: THREE.Mesh[] = [];
  private readonly stopLand: () => void;

  constructor(r: BrushRenderer, state: GameState) {
    this.r = r; this.state = state;
    this.build();
    this.stopLand = r.onLandChange((area) => { if (this.state.bridges.some((b) => near(b, area))) this.build(); });
  }

  reset(state: GameState) { this.state = state; this.build(); }

  /** Builds every bridge again (there are only ever a few). */
  build() {
    dropAll(this.r, this.meshes);
    const heightAt = (x: number, z: number) => this.r.landAt(x, z);
    for (const b of this.state.bridges) {
      const timber = new MeshBuilder('ink');
      // The game's yaw turns local +z (its length) from +z; the kit's turns +x from +x away from +z.
      addPlankBridge(timber, { x: b.x, z: b.z, yaw: b.yaw - Math.PI / 2, length: b.length, width: b.width, deck: b.deckY, heightAt, seed: hash3(this.state.seed, b.trackId, Math.round(b.x * 8)) % 100000 });
      if (timber.vertexCount) this.meshes.push(addMesh(this.r, timber.build(), 'ink', { tag: tagOf('track', b.trackId) }));
    }
  }

  dispose() {
    this.stopLand();
    dropAll(this.r, this.meshes);
  }
}

const near = (b: Bridge, a: LandArea) => {
  const m = b.length / 2 + 1;
  return b.x > a.x0 - m && b.x < a.x1 + m && b.z > a.z0 - m && b.z < a.z1 + m;
};
