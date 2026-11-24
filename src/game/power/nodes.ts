// What each thing is to the power preview, and a union-find for joining networks.
import { CATALOG, type PowerRole } from '../catalog.ts';
import type { Thing } from '../state.ts';

export const roleOf = (t: Thing): PowerRole => CATALOG[t.kind].powerRole;
export const rangeOf = (t: Thing) => CATALOG[t.kind].powerRange;
export const feeds = (r: PowerRole) => r === 'source' || r === 'store';

/** Union-find over indices. */
export class Sets {
  private readonly parent: number[];
  constructor(n: number) { this.parent = Array.from({ length: n }, (_v, i) => i); }
  find(i: number): number {
    let r = i;
    while (this.parent[r] !== r) r = this.parent[r];
    while (this.parent[i] !== r) { const next = this.parent[i]; this.parent[i] = r; i = next; }
    return r;
  }
  /** Joins two sets; false if they were already one. */
  join(a: number, b: number): boolean {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (ra < rb) this.parent[rb] = ra; else this.parent[ra] = rb;
    return true;
  }
}
