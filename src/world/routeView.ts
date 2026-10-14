import * as THREE from 'three';
import type { RenderObject, VerdantRenderer } from '../renderer/verdantRenderer.ts';
import { legPath } from '../game/roads.ts';
import { buildingById, layoutOf, sizeOf, type GameState, type Route } from '../game/state.ts';
import type { Models } from './models.ts';
import { ROUTE_COLOURS } from './shapes.ts';

// Shows routes while you work with them: each route's way on the ground in its colour (the shortest way from each stop to
// the next, the way its trucks drive), and labels with the stop numbers over the buildings they stop at.

export interface StopLabel { x: number; y: number; z: number; colour: number; text: string }

/** A route line's width and height above the ground (each route a little higher, so overlapping ones don't flicker). */
const WIDTH = 0.12, Y = 0.05, Y_STEP = 0.004;
const X = new THREE.Vector3(1, 0, 0), dir = new THREE.Vector3(), q = new THREE.Quaternion(), scale = new THREE.Vector3();

/** The colour index of a route: its place in the list, wrapping round the palette. */
export const routeColour = (s: GameState, r: Route) => Math.max(0, s.routes.indexOf(r)) % ROUTE_COLOURS.length;

export class RouteView {
  private objs: RenderObject[] = [];
  private key = '';
  private shownLabels: StopLabel[] = [];
  private readonly r: VerdantRenderer;
  private readonly m: Models;

  constructor(r: VerdantRenderer, m: Models) { this.r = r; this.m = m; }

  /** The labels over the stops of the routes drawn, in world space. */
  labels(): StopLabel[] { return this.shownLabels; }

  /** Draws `routes` (none hides them all); with `numbers`, labels their stops. */
  sync(s: GameState, routes: Route[], numbers: boolean) {
    const key = `${layoutOf(s)} ${numbers} ${routes.map((r) => `${r.id}:${routeColour(s, r)}:${r.stops.map((st) => st.building).join(',')}`).join(';')}`;
    if (key === this.key) return;
    this.key = key;
    for (const o of this.objs) o.remove();
    this.objs = [];
    this.shownLabels = [];
    const w = s.map.width;
    for (const r of routes) {
      const c = routeColour(s, r), y = Y + c * Y_STEP;
      const stops = r.stops.map((st) => buildingById(s, st.building));
      for (let i = 0; i < stops.length && stops.length > 1; i++) {
        const a = stops[i], b = stops[(i + 1) % stops.length];
        if (!a || !b || a === b) continue;
        const p = legPath(s, a, b);
        if (!p) continue;
        // Straight runs as one bar each.
        const at = (k: number) => new THREE.Vector3(p[k] % w + 0.5, y, Math.floor(p[k] / w) + 0.5);
        let from = 0;
        for (let k = 1; k < p.length; k++) {
          const turn = k === p.length - 1 || p[k + 1] - p[k] !== p[k] - p[k - 1];
          if (turn) { this.bar(c, at(from), at(k)); from = k; }
        }
      }
      if (!numbers) continue;
      // One label a building, with every stop number it has.
      const seen = new Map<number, number[]>();
      r.stops.forEach((st, i) => { const l = seen.get(st.building); if (l) l.push(i + 1); else seen.set(st.building, [i + 1]); });
      for (const [id, nums] of seen) {
        const b = buildingById(s, id);
        if (!b) continue;
        const n = sizeOf(b), h = this.m.buildings[b.type].height;
        this.shownLabels.push({ x: b.x + n / 2, y: (b.type === 'field' ? 0.9 : h) + 0.9, z: b.y + n / 2, colour: ROUTE_COLOURS[c], text: nums.join(' · ') });
      }
    }
  }

  private bar(c: number, a: THREE.Vector3, b: THREE.Vector3) {
    const len = dir.subVectors(b, a).length();
    if (len < 1e-4) return;
    q.setFromUnitVectors(X, dir.divideScalar(len));
    // A little past each end, so the corners meet.
    const o = this.r.addObject(this.m.routes[c]);
    o.castShadow = false;
    o.setTransform(a.clone().addScaledVector(dir, -WIDTH / 2), q, scale.set(len + WIDTH, 0.02, WIDTH));
    this.objs.push(o);
  }
}
