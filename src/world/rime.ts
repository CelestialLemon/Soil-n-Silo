import * as THREE from 'three';
import type { PixelObject, PixelRenderer } from 'pixel3d-renderer';
import { frostTiles, rimeAt } from '../game/frost.ts';
import { reliefOf, type GameState } from '../game/state.ts';
import { overlayTiles, type Lie } from './ground.ts';

// The rime: white frost on the ground a late frost settles on, which builds through the night, lies at dawn and melts through
// the morning (`rimeAt`). It is a sheet of tiles over the frozen ground, tinted white and faded in and out; it is drawn only
// while there is rime, and drawn again when the ground's levels change which tiles it lies on. The hollows every frost lies on
// and the slopes only a severe one reaches are two sheets, so one frost following another keeps what the first left.

/** The frost's white, a little blue; the most the sheet covers the ground (so the grass still shows through); how far above the ground it lies (m): over a field's soil and furrows. */
const WHITE = new THREE.Color(0xe8f0fa), MOST = 0.85, LIFT = 0.04;
/** How much of its cover is left while a tool overlay is over the ground (it would hide the overlay's tiles otherwise). */
const UNDER_OVERLAY = 0.4;

/** A sheet as drawn for a version of the ground's levels (nothing, where no tile is frozen). */
interface Sheet { drawn: { o: PixelObject; g: THREE.BufferGeometry } | null; relief: number }

export class Rime {
  private readonly sheets: { hollows: Sheet | null; slopes: Sheet | null } = { hollows: null, slopes: null };
  private readonly r: PixelRenderer;
  private readonly lie: Lie;

  constructor(r: PixelRenderer, lie: Lie) { this.r = r; this.lie = lie; }

  /** Shows the rime as it lies now (fainter while an overlay is shown), or none. */
  sync(s: GameState, overlay: boolean) {
    const rime = rimeAt(s.scenario, s.time), k = overlay ? UNDER_OVERLAY : 1;
    this.show(s, 'hollows', rime ? rime.hollows * MOST * k : 0);
    this.show(s, 'slopes', rime ? rime.slopes * MOST * k : 0);
  }

  private show(s: GameState, which: 'hollows' | 'slopes', opacity: number) {
    const now = this.sheets[which], relief = reliefOf(s);
    if (opacity <= 0) { this.drop(which); return; }
    if (now?.relief !== relief) {
      this.drop(which);
      const tiles = which === 'hollows' ? frostTiles(s, 'ordinary') : (() => { const hollow = new Set(frostTiles(s, 'ordinary')); return frostTiles(s, 'severe').filter((i) => !hollow.has(i)); })();
      const g = overlayTiles(this.lie, tiles, s.map.width, LIFT, 0);
      let drawn: Sheet['drawn'] = null;
      if (g.getAttribute('position').count) {
        const o = this.r.addObject(g);
        o.setTransform(new THREE.Vector3(0, 0, 0));
        o.tint = WHITE; o.tintStrength = 1; o.castShadow = false;
        drawn = { o, g };
      } else g.dispose();
      this.sheets[which] = { drawn, relief };
    }
    const drawn = this.sheets[which]?.drawn;
    if (drawn) drawn.o.opacity = opacity;
  }

  private drop(which: 'hollows' | 'slopes') {
    const drawn = this.sheets[which]?.drawn;
    drawn?.o.remove();
    drawn?.g.dispose();
    this.sheets[which] = null;
  }
}
