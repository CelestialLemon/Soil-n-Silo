// The valley's sound: a gentle soundscape made on the fly with the Web Audio API, no audio files. Four quiet layers under
// the picture, each eased to where it should be with smooth ramps (never a click or a pop):
// - the wind: soft noise through a warm low-pass (about 220 to 900 Hz), louder and brighter as the wind picks up, with
//   slow gusts;
// - the brook: a bubbling band of noise (about 700 to 1400 Hz) wobbled by slow LFOs, a little nearer and warmer as the
//   camera comes in, and fuller as the flood surges;
// - the rain: a soft high patter (about 2200 to 4500 Hz) with the rain, silent under a trace of it and while it snows;
// - the homestead: a very soft, warm low hum while workshops work or carts drive, gone while the clock is paused.
// And two small cues: a woody tap on placing something (playPlace) and a warm two-note chime for a Seal or a valley
// restored (playChime).
//
// A browser won't play sound before the player has touched the page, so nothing is made until unlock() (the play layer
// calls it on the first pointer or key press). Where there is no Web Audio at all (a headless browser, an old one), or it
// stays locked, every call quietly does nothing: the sound never throws. A hidden tab, or the sound turned off, fades
// to silence and then suspends the audio (no CPU spent on it).
import { FLOOD_MAX } from '../game/index.ts';
import { ZOOM_MAX, ZOOM_MIN } from '../world/index.ts';

/** What the soundscape follows, sent a few times a second by the play layer. */
export interface SoundSample {
  /** The live wind's speed, m/s. */
  windSpeed: number;
  /** How hard it's raining, 0..1. */
  rain: number;
  /** How hard it's snowing, 0..1 (snow falls quietly: no patter); left out, none. */
  snow?: number;
  /** How far the brook stands above its usual level, m (the weather's floodSurge, 0..FLOOD_MAX). */
  floodSurge: number;
  /** The camera's zoom (the world's getZoom, ZOOM_MIN close to ZOOM_MAX far). */
  zoom: number;
  /** How many workshops are working. */
  activeWorkshops: number;
  /** How many carts are driving. */
  movingCarts: number;
  /** Whether the game's clock is paused (speed 0): the homestead falls quiet. */
  paused: boolean;
}

/** The soundscape's volume until the player picks one, 0..1. */
export const DEFAULT_VOLUME = 0.35;

/** How quickly each layer eases to a new level (seconds, the time constant: about three of them to arrive). */
const EASE = { layer: 0.8, master: 0.35, fadeIn: 1.2 };
/** How long after fading out the audio is suspended, ms (past the fade). */
const SUSPEND_AFTER = 1200;
/** Seconds of noise the layers loop over (long enough that its loop is never heard). */
const NOISE_SECONDS = 4;

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

/** The audio graph, made on unlock. */
interface Graph {
  ctx: AudioContext;
  master: GainNode;
  cues: GainNode;
  wind: { gain: GainNode; filter: BiquadFilterNode; gust: GainNode };
  brook: { gain: GainNode; low: BiquadFilterNode; high: BiquadFilterNode };
  rain: { gain: GainNode; filter: BiquadFilterNode };
  hum: { gain: GainNode };
  sources: AudioScheduledSourceNode[];
}

const QUIET: SoundSample = { windSpeed: 0, rain: 0, floodSurge: 0, zoom: ZOOM_MAX, activeWorkshops: 0, movingCarts: 0, paused: true };

export class Soundscape {
  private graph: Graph | null = null;
  /** Whether making the audio failed (no Web Audio here): unlock stops trying. */
  private broken = false;
  private enabled = true;
  private volume = DEFAULT_VOLUME;
  private hidden = typeof document !== 'undefined' && document.hidden;
  private sample: SoundSample = QUIET;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private readonly onVisibility = () => {
    this.hidden = typeof document !== 'undefined' && document.hidden;
    this.applyMaster();
  };

  constructor() {
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.onVisibility);
  }

  /**
   * Makes the audio, or wakes it, on a player's gesture (a browser plays nothing before one). Safe to call on every
   * press: after the first it only resumes a suspended context.
   */
  unlock(): void {
    if (this.disposed || this.broken) return;
    if (!this.graph) {
      this.graph = this.build();
      if (!this.graph) { this.broken = true; return; }
      this.applyLayers(true);
    }
    this.applyMaster();
  }

  /** Turns the sound on or off (it fades, and suspends once silent). */
  setEnabled(on: boolean): void { this.enabled = on; this.applyMaster(); }

  isEnabled(): boolean { return this.enabled; }

  /** The overall volume, 0..1. */
  setVolume(volume: number): void { this.volume = clamp01(volume); this.applyMaster(); }

  getVolume(): number { return this.volume; }

  /** Follows the valley as it is now (a few times a second): each layer eases to its new level. */
  update(sample: SoundSample): void {
    this.sample = sample;
    this.applyLayers(false);
  }

  /** A soft woody tap: something placed. */
  playPlace(): void {
    const g = this.live();
    if (!g) return;
    const { ctx } = g, t = ctx.currentTime + 0.005;
    const osc = ctx.createOscillator(), env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.065);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.5, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);
    osc.connect(env).connect(g.cues);
    osc.start(t); osc.stop(t + 0.09);
    osc.onended = () => { osc.disconnect(); env.disconnect(); };
  }

  /** A warm two-note bell: a Seal earned, a valley restored. */
  playChime(): void {
    const g = this.live();
    if (!g) return;
    const { ctx } = g, t = ctx.currentTime + 0.01;
    // A fifth, C5 then G5, each a sine with a quieter octave and a soft partial for the bell.
    [{ f: 523.25, at: 0 }, { f: 783.99, at: 0.18 }].forEach(({ f, at }) => {
      const env = ctx.createGain(), start = t + at, end = start + 1.8;
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(0.3, start + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, end);
      env.connect(g.cues);
      const partials = [{ m: 1, a: 1 }, { m: 2, a: 0.28 }, { m: 3.01, a: 0.08 }];
      let left = partials.length;
      for (const { m, a } of partials) {
        const osc = ctx.createOscillator(), level = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = f * m; level.gain.value = a;
        osc.connect(level).connect(env);
        osc.start(start); osc.stop(end + 0.05);
        osc.onended = () => { osc.disconnect(); level.disconnect(); if (--left === 0) env.disconnect(); };
      }
    });
  }

  /** Stops the sound for good: closes the audio and drops the listeners. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.onVisibility);
    if (this.suspendTimer !== null) clearTimeout(this.suspendTimer);
    const g = this.graph;
    this.graph = null;
    if (!g) return;
    for (const s of g.sources) { try { s.stop(); } catch { /* never started */ } }
    g.ctx.close().catch(() => { /* already closed */ });
  }

  // ---- Inside ----

  /** The graph, if it's making sound now (a cue is skipped while muted, hidden or locked). */
  private live(): Graph | null {
    const g = this.graph;
    return g && this.audible() && g.ctx.state === 'running' ? g : null;
  }

  private audible() { return this.enabled && !this.hidden && this.volume > 0; }

  /** Eases the master volume to where it should be, and suspends or resumes the audio to match. */
  private applyMaster() {
    const g = this.graph;
    if (!g) return;
    if (this.suspendTimer !== null) { clearTimeout(this.suspendTimer); this.suspendTimer = null; }
    const on = this.audible();
    if (on && g.ctx.state === 'suspended') g.ctx.resume().catch(() => { /* still locked: the next gesture tries again */ });
    ease(g.ctx, g.master.gain, on ? this.volume : 0, EASE.master);
    if (!on) {
      this.suspendTimer = setTimeout(() => {
        this.suspendTimer = null;
        if (this.graph && !this.audible() && this.graph.ctx.state === 'running') this.graph.ctx.suspend().catch(() => { /* closed */ });
      }, SUSPEND_AFTER);
    }
  }

  /** Eases each layer to the sample's levels (`first`: fading in from silence, a little slower). */
  private applyLayers(first: boolean) {
    const g = this.graph;
    if (!g) return;
    const s = this.sample, ctx = g.ctx, tau = first ? EASE.fadeIn : EASE.layer;

    // The wind: a breath at a calm, fuller and brighter towards a gale (14 m/s and up), its gusts growing with it.
    const w = clamp01(s.windSpeed / 14);
    ease(ctx, g.wind.gain.gain, 0.025 + 0.2 * w ** 1.3, tau);
    ease(ctx, g.wind.filter.frequency, 220 + 680 * w, tau);
    ease(ctx, g.wind.gust.gain, 0.012 + 0.08 * w, tau);

    // The brook: nearer (and warmer, its bubbling lower) as the camera comes in; fuller in flood.
    const near = clamp01((ZOOM_MAX - s.zoom) / (ZOOM_MAX - ZOOM_MIN)), flood = clamp01(s.floodSurge / FLOOD_MAX);
    ease(ctx, g.brook.gain.gain, 0.02 + 0.05 * near + 0.1 * flood, tau);
    ease(ctx, g.brook.low.frequency, 900 - 200 * near, tau);
    ease(ctx, g.brook.high.frequency, 1400 - 250 * near + 100 * flood, tau);

    // The rain: none under a trace of it, nor while it snows.
    const rain = s.rain < 0.02 || (s.snow ?? 0) >= 0.15 ? 0 : clamp01(s.rain);
    ease(ctx, g.rain.gain.gain, rain === 0 ? 0 : 0.03 + 0.17 * rain, tau);
    ease(ctx, g.rain.filter.frequency, 2800 + 900 * rain, tau);

    // The homestead's hum: the workshops' and carts' share, none while paused.
    const work = s.paused ? 0 : 0.6 * clamp01(s.activeWorkshops / 4) + 0.4 * clamp01(s.movingCarts / 3);
    ease(ctx, g.hum.gain.gain, 0.045 * work, tau);
  }

  /** Makes the audio graph and starts its layers, or null where there's no Web Audio (or it won't start). */
  private build(): Graph | null {
    if (typeof AudioContext === 'undefined') return null;
    let ctx: AudioContext;
    try { ctx = new AudioContext(); } catch { return null; }
    try {
      const sources: AudioScheduledSourceNode[] = [];
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      const cues = ctx.createGain();
      cues.gain.value = 0.6;
      cues.connect(master);
      const noise = noiseBuffer(ctx);
      const noiseFrom = (offset: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noise; src.loop = true; src.start(0, offset % NOISE_SECONDS);
        sources.push(src);
        return src;
      };
      const lfo = (hz: number, depth: number, target: AudioParam) => {
        const osc = ctx.createOscillator(), amount = ctx.createGain();
        osc.frequency.value = hz; amount.gain.value = depth;
        osc.connect(amount).connect(target); osc.start();
        sources.push(osc);
        return amount;
      };
      const quiet = () => { const g = ctx.createGain(); g.gain.value = 0; return g; };

      // The wind: noise, a warm low-pass, a level that breathes with slow gusts.
      const windGain = quiet(), windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass'; windFilter.frequency.value = 220; windFilter.Q.value = 0.6;
      noiseFrom(0).connect(windFilter).connect(windGain).connect(master);
      const gust = lfo(0.07, 0, windGain.gain);
      lfo(0.23, 60, windFilter.frequency);

      // The brook: two narrow bands, each wobbled by its own slow LFO, for the bubbling.
      const brookGain = quiet(), low = ctx.createBiquadFilter(), high = ctx.createBiquadFilter();
      low.type = 'bandpass'; low.frequency.value = 900; low.Q.value = 3;
      high.type = 'bandpass'; high.frequency.value = 1300; high.Q.value = 4;
      noiseFrom(1.3).connect(low).connect(brookGain);
      noiseFrom(2.7).connect(high).connect(brookGain);
      lfo(0.31, 140, low.frequency);
      lfo(0.47, 180, high.frequency);
      brookGain.connect(master);

      // The rain: a high-pass and a broad band over 2200 to 4500 Hz, softened at the top.
      const rainGain = quiet(), rainHigh = ctx.createBiquadFilter(), rainBand = ctx.createBiquadFilter(), rainSoft = ctx.createBiquadFilter();
      rainHigh.type = 'highpass'; rainHigh.frequency.value = 2200; rainHigh.Q.value = 0.5;
      rainBand.type = 'bandpass'; rainBand.frequency.value = 3200; rainBand.Q.value = 0.7;
      rainSoft.type = 'lowpass'; rainSoft.frequency.value = 4500; rainSoft.Q.value = 0.5;
      noiseFrom(3.1).connect(rainHigh).connect(rainBand).connect(rainSoft).connect(rainGain).connect(master);

      // The homestead's hum: two low tones a fifth apart, a touch detuned, through a warm low-pass, gently swelling.
      const humGain = quiet(), humFilter = ctx.createBiquadFilter(), humSwell = ctx.createGain();
      humFilter.type = 'lowpass'; humFilter.frequency.value = 380; humFilter.Q.value = 0.5;
      humSwell.gain.value = 0.8;
      for (const [hz, type, level] of [[98, 'sine', 1], [147.3, 'triangle', 0.35]] as const) {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = type; osc.frequency.value = hz; g.gain.value = level;
        osc.connect(g).connect(humFilter); osc.start();
        sources.push(osc);
      }
      humFilter.connect(humSwell).connect(humGain).connect(master);
      lfo(0.11, 0.2, humSwell.gain);

      return {
        ctx, master, cues, sources,
        wind: { gain: windGain, filter: windFilter, gust },
        brook: { gain: brookGain, low, high },
        rain: { gain: rainGain, filter: rainBand },
        hum: { gain: humGain },
      };
    } catch {
      ctx.close().catch(() => { /* already closed */ });
      return null;
    }
  }
}

/** Eases a parameter from where it is now to `value` (time constant `tau`, seconds), dropping any ease still under way. */
function ease(ctx: AudioContext, param: AudioParam, value: number, tau: number) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.setTargetAtTime(value, now, tau);
}

/** A few seconds of soft (pinkish) noise, the layers' raw material. */
function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * NOISE_SECONDS), fade = Math.floor(ctx.sampleRate * 0.05);
  // Paul Kellet's economy pink filter over white noise: softer than white, closer to wind and water. A little extra is made
  // past the end to cross-fade into the start, so the loop joins without a click.
  const raw = new Float32Array(length + fade);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < raw.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    raw[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2;
  }
  // The start eases in from what follows the end, so the last sample runs on into the first.
  for (let i = 0; i < fade; i++) { const k = i / fade; raw[i] = raw[i] * k + raw[length + i] * (1 - k); }
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  buffer.getChannelData(0).set(raw.subarray(0, length));
  return buffer;
}
