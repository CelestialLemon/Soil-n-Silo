// What a frame costs and where it goes, for the report mode of the frame rate readout (perfOverlay.ts): the last 30 seconds of
// frames, and the JSON report of them to send with a bug. JS-side numbers only. No DOM here, so the sums are tested in Node.

import { STATS_WINDOW } from './frameStats.ts';

/** At most this many frames are kept (30 s at 500 frames a second). */
const CAPACITY = 16_384;

/** One frame: the interval since the last frame, the JS time of the renderer's two calls, of picking, and of the rest of the game's frame (ms), and what three.js drew. */
export interface FrameSample { interval: number; geometry: number; style: number; pick: number; rest: number; draws: number; triangles: number }
const FIELDS = ['interval', 'geometry', 'style', 'pick', 'rest', 'draws', 'triangles'] as const satisfies readonly (keyof FrameSample)[];

export interface Quantiles { p50: number; p95: number; p99: number }

/** The value `share` of the way up the sorted values (nearest rank). */
const rank = (sorted: Float64Array, share: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))];

export function quantiles(values: ArrayLike<number>): Quantiles | null {
  if (values.length === 0) return null;
  const sorted = Float64Array.from(values).sort();
  return { p50: rank(sorted, 0.5), p95: rank(sorted, 0.95), p99: rank(sorted, 0.99) };
}

/** The machine and the setup the numbers came from. The player says the power state; it is never guessed from the frame rate. */
export interface Environment {
  glRenderer: string | null; glVendor: string | null; userAgent: string; viewport: [number, number]; devicePixelRatio: number;
  art: [number, number]; supersample: number; shadowMapSize: number; pixelSize: number; power: PowerState; timerQueries: boolean;
}
export const POWER_STATES = ['unset', 'plugged in', 'battery', 'low-power mode'] as const;
export type PowerState = typeof POWER_STATES[number];

const round = (n: number) => Math.round(n * 100) / 100;
const rounded = (q: Quantiles | null) => q && { p50: round(q.p50), p95: round(q.p95), p99: round(q.p99) };

export class Telemetry {
  private readonly at = new Float64Array(CAPACITY);
  private readonly cols = FIELDS.map(() => new Float64Array(CAPACITY));
  private next = 0;
  private count = 0;

  get length() { return this.count; }

  clear() { this.next = 0; this.count = 0; }

  /** Adds a frame drawn at `now` (the animation frame's time stamp, ms). */
  add(now: number, s: FrameSample) {
    this.at[this.next] = now;
    for (let i = 0; i < FIELDS.length; i++) this.cols[i][this.next] = s[FIELDS[i]];
    this.next = (this.next + 1) % CAPACITY;
    this.count = Math.min(this.count + 1, CAPACITY);
  }

  /** The frames of the last 30 seconds up to `now`, one array a field. */
  private recent(now: number) {
    const out = FIELDS.map(() => [] as number[]);
    for (let k = 0; k < this.count; k++) {
      const j = (this.next - this.count + k + CAPACITY) % CAPACITY;
      if (now - this.at[j] > STATS_WINDOW) continue;
      out.forEach((a, i) => a.push(this.cols[i][j]));
    }
    return Object.fromEntries(FIELDS.map((f, i) => [f, out[i]])) as Record<keyof FrameSample, number[]>;
  }

  /** The summary the overlay shows: the frame interval's percentiles and the median of each cost. */
  summary(now: number) {
    const r = this.recent(now);
    return { frames: r.interval.length, span: r.interval.reduce((a, b) => a + b, 0), interval: quantiles(r.interval), geometry: quantiles(r.geometry), style: quantiles(r.style), rest: quantiles(r.rest), pick: quantiles(r.pick), draws: quantiles(r.draws), triangles: quantiles(r.triangles) };
  }

  /** The report of the last 30 seconds, to copy as JSON. */
  report(now: number, env: Environment) {
    const s = this.summary(now);
    return {
      version: 1, when: new Date().toISOString(), windowSeconds: Math.round(s.span / 100) / 10, frames: s.frames, env,
      frameIntervalMs: rounded(s.interval),
      jsMs: { renderGeometry: rounded(s.geometry), renderStyle: rounded(s.style), pick: rounded(s.pick), restOfFrame: rounded(s.rest) },
      draws: rounded(s.draws), triangles: rounded(s.triangles),
    };
  }
}
