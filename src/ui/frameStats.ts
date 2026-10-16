// Frame timing for the frame rate readout (perfOverlay.ts): the recent frame times, and the average frame rate and the lows
// over them. No DOM here, so the sums are tested in Node.

/** How far back the average and the lows look (ms of frames). */
export const STATS_WINDOW = 30_000;
/** At most this many frames are kept (30 s at 500 frames a second). */
const CAPACITY = 16_384;

export interface FrameSummary {
  /** Frames in the window. */
  frames: number;
  /** Frames per second over the window. */
  average: number;
  /** The frame rate of the slowest 1% of frames (their mean frame time), and of the slowest 0.1%. */
  low1: number;
  low01: number;
}

/** The frame rate the slowest `share` of frames ran at: the mean of their times, at least one frame of them. */
function low(sorted: Float64Array, share: number) {
  const n = Math.max(1, Math.ceil(sorted.length * share));
  let sum = 0;
  for (let i = sorted.length - n; i < sorted.length; i++) sum += sorted[i];
  return 1000 / (sum / n);
}

/** The recent frame times (ms), oldest first when read, dropping frames older than the window. */
export class FrameTimes {
  private readonly times = new Float64Array(CAPACITY);
  /** Where the next frame goes, and how many are kept. */
  private next = 0;
  private count = 0;
  /** The kept frames' total time. */
  private total = 0;

  get length() { return this.count; }

  /** The `i`th kept frame, 0 the oldest. */
  at(i: number) { return this.times[(this.next - this.count + i + CAPACITY) % CAPACITY]; }

  /** Adds a frame that took `ms`, then drops the oldest while the rest still fill the window. */
  add(ms: number) {
    if (this.count === CAPACITY) this.total -= this.times[this.next];
    else this.count++;
    this.times[this.next] = ms;
    this.next = (this.next + 1) % CAPACITY;
    this.total += ms;
    while (this.count > 1 && this.total - this.at(0) >= STATS_WINDOW) { this.total -= this.at(0); this.count--; }
  }

  clear() { this.next = 0; this.count = 0; this.total = 0; }

  /** The average and the lows over the kept frames; null before the first frame. */
  summary(): FrameSummary | null {
    if (this.count === 0) return null;
    const sorted = Float64Array.from({ length: this.count }, (_, i) => this.at(i)).sort();
    return { frames: this.count, average: this.count / (this.total / 1000), low1: low(sorted, 0.01), low01: low(sorted, 0.001) };
  }
}
