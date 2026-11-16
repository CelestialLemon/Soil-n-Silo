// The frame's cost, pass by pass, for the tools and pages that time it: the demo's (tools/profile.ts headless, and the
// demo's ?profile on any machine) and the game's (its own ?profile on the brush3d path, and tools/framerate.ts over every
// commission, Soil-n-Silo#210). Each case draws the frame at a set size (whatever the window's), showing the same piece of
// the world as the view at 1080p (the zoom scales with the height, as on a high-DPI screen: only the pixel count changes),
// in a set wind, with some kinds of mesh left out if asked, the clock running so the wind moves. It reports each pass's
// median GPU and CPU time (see timer.ts), and the uncapped frame: frames drawn back to back, the time each takes when
// neither vsync nor the display waits on it (the larger of the CPU's and the GPU's share, roughly). It draws into a target
// of the canvas's size, not the canvas: on the MacBook the canvas held every frame to the screen's refresh, so the times
// came out in steps of 16.7 ms.
import * as THREE from 'three';
import type { Quality } from './quality';
import type { BrushRenderer, DrawnKind, Settings } from './renderer';
import { PassTimer } from './timer';
import type { Weather } from './weather';
import { steadyWind } from './wind';

export interface ProfileCase {
  label: string; width: number; height: number; wind: number; hide?: DrawnKind[];
  /** Draw the shelter map every frame, to time it (the game draws it only when cover changes). */
  shelter?: boolean;
  /** The weather, if not the demo's. */
  weather?: Weather;
  /** Hold a strike at its brightest in every frame (#12): the cost of a flash, a bolt and a glow together. */
  lightning?: boolean;
  /** Snow lying this deep (0..1) everywhere (#14): the cost of painting it in the materials. */
  lying?: number;
  /** Frost this hard (0..1) everywhere (#14): the cost of painting it, and of the sun's memory that melts it. */
  frost?: number;
  /** The stream this frozen (0..1, #14): the cost of painting its ice. (Sent by the demo, in `restore`.) */
  ice?: number;
  /** The land this wet and this muddy (0..1) everywhere (#11): the cost of painting it in the materials. */
  wet?: { wet: number; mud: number };
  /** Drawn at this quality (setQuality), not the renderer's own: the game's presets compared in one run. */
  quality?: Quality;
  /** Changes to that quality (the case's or the renderer's own): fewer pixels, no multisampling (Soil-n-Silo#210). */
  tweak?: Partial<Quality>;
  /** Changes to the renderer's settings for this case alone (no prepass, no shadows, no reflection): what each costs. */
  settings?: Partial<Settings>;
  /** The reflection at this share of its usual size (setReflectionScale). */
  reflectionScale?: number;
}
export interface ProfileRow {
  label: string; width: number; height: number;
  /** Median ms per pass and in all ('frame'); null where the browser has no GPU timer. */
  gpu: Record<string, number> | null;
  /** Median ms per pass, and 'frame': the median of whole frames, the look and the renderer's waiting included. */
  cpu: Record<string, number>;
  /** Mean ms a frame, drawn back to back. */
  uncapped: number;
  /**
   * Median ms the CPU takes to issue a frame when the GPU has finished all before it (no timers): the CPU's own work. Where
   * `cpu.frame` is much more than this, the CPU was waiting on the GPU (a queue full of frames, or a pass that syncs), not
   * working.
   */
  cpuAlone: number;
  /** cpuAlone pass by pass (medians, and their sum as 'frame'): the pass a sync waits in takes the GPU's time so far. */
  cpuAlonePasses: Record<string, number>;
  /**
   * Draw calls and triangles in one frame, every pass. Each draw call is work for the browser's GPU process (on a Mac,
   * ANGLE turning it into Metal) as well as for the GPU: where the uncapped frame follows the draw calls and not the
   * pixels, that process is what's slow.
   */
  draws: number;
  triangles: number;
}

export const PASSES = ['setup', 'shelter', 'clouds', 'shadow', 'under', 'reflect', 'main', 'post', 'bolt'];
/** The kinds a case can leave out (`hide`). */
export const PROFILE_KINDS: readonly DrawnKind[] = ['ground', 'paint', 'grass', 'foliage', 'crop', 'ink', 'water', 'debris', 'rain', 'snow'];

/**
 * Runs the cases. `draw(time)` draws one frame as the demo does (the look, then the renderer); `restore` puts the demo's
 * size, wind, weather, ground and water back, with the case's water (it's called before each case, and once after them
 * all with none). A scene's own fields on its cases (the game's view and hour) are its `restore`'s to set. `progress` hears each row as it's done.
 */
export async function runProfile<C extends ProfileCase>(
  renderer: BrushRenderer, draw: (time: number) => void, restore: (c?: C) => void, cases: C[],
  progress: (row: ProfileRow, i: number) => void = () => {}, frames = 90,
) {
  const gl = renderer.gl.getContext() as WebGL2RenderingContext;
  const timer = new PassTimer(gl);
  const pixel = new Uint8Array(4);
  const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  const nextFrame = () => new Promise((r) => requestAnimationFrame(r));
  const rows: ProfileRow[] = [];
  let time = 20;
  const view = renderer.view, zoom = view.zoom, quality = renderer.quality, maxRatio = renderer.maxRatio;
  const settings = { ...renderer.settings }, reflectionScale = renderer.reflectionScale;
  // The cases are in drawn pixels: the player's cap on the pixel ratio (a high-DPI screen's) isn't theirs.
  renderer.setMaxRatio(Infinity);
  const screen = { width: view.screen.width, height: view.screen.height };
  const output = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  renderer.output = output;
  try {
    for (const [i, c] of cases.entries()) {
      // A screen of the case's size in the screen's own pixels, which the zoom counts in, so every case frames the same
      // land; the quality sets only how many of them are drawn (maxPixels: fewer, scaled up).
      renderer.setQuality({ ...(c.quality ?? quality), ...c.tweak });
      Object.assign(renderer.settings, settings, c.settings);
      renderer.setReflectionScale(c.reflectionScale ?? reflectionScale);
      renderer.resize(c.width / renderer.screenRatio, c.height / renderer.screenRatio);
      output.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      view.zoom = (zoom * c.height) / 1080;
      view.update(0, true);
      restore(c);
      if (c.weather) renderer.setWeather(c.weather, true);
      // The same depth over all the land: a map of one cell, larger than any scene.
      const one = { nx: 1, nz: 1, cell: 2000, x0: -1000, z0: -1000 };
      if (c.lying !== undefined) renderer.setGround({ ...one, snow: new Float32Array([c.lying]) }, 0);
      if (c.frost !== undefined) renderer.setGround({ ...one, frost: new Float32Array([c.frost]) }, 0);
      // Mud everywhere too, though the game's lies only on the bare earth: the dearest case.
      if (c.wet) renderer.setGround({ ...one, wet: new Float32Array([c.wet.wet]), mud: new Float32Array([c.wet.mud]) }, 0);
      // A steady wind: the gust map's cost is in sampling it, the same for any wind (its upload is a tick's, not a frame's).
      const wind = steadyWind(c.wind, (31 * Math.PI) / 180);
      renderer.setWind(wind, wind, 0);
      for (const k of PROFILE_KINDS) renderer.setVisible(k, !c.hide?.includes(k));
      const clock = renderer.lightning.clock;
      if (c.lightning) {
        // Struck now, then held just after: the flash at its height, the bolt lit and the glow rising.
        const t = clock();
        renderer.lightning.clock = () => t;
        renderer.strike({ x: renderer.view.target.x, z: renderer.view.target.z, seed: 7 });
        renderer.lightning.clock = () => t + 0.03;
      }
      const frame = (t: number) => { if (c.shelter) renderer.shelter.changed(); draw(t); };
      // Warm up: shaders, the new targets' memory, the GPU's clocks.
      for (let f = 0; f < 20; f++) { frame((time += 1 / 60)); if (f % 5 === 4) { sync(); await nextFrame(); } }
      sync();
      renderer.timer = timer;
      timer.reset();
      // In bursts, so the GPU never waits on the page between passes (a query would count the wait).
      const whole: number[] = [];
      for (let f = 0; f < frames; f++) {
        const t0 = performance.now();
        frame((time += 1 / 60));
        whole.push(performance.now() - t0);
        if (f % 6 === 5) await nextFrame();
      }
      renderer.timer = null;
      await timer.settle();
      const timed = timer.frames.filter((t) => t.gpu);
      const gpu = timer.gpu && timed.length ? medians(timed.map((t) => t.gpu!)) : null;
      const cpu = { ...medians(timer.frames.map((t) => t.cpu)), frame: median(whole) };
      // Uncapped: back to back, then wait for the GPU to finish.
      sync();
      const n = 30, start = performance.now();
      for (let f = 0; f < n; f++) frame((time += 1 / 60));
      sync();
      const uncapped = (performance.now() - start) / n;
      // The CPU alone: each frame issued with the GPU idle, so nothing can make it wait but a sync in the frame itself.
      const alone: number[] = [], cpuTimer = new PassTimer(gl, false);
      renderer.timer = cpuTimer;
      for (let f = 0; f < 12; f++) {
        const t0 = performance.now();
        frame((time += 1 / 60));
        alone.push(performance.now() - t0);
        sync();
      }
      renderer.timer = null;
      // One frame's draw calls, every pass (three counts each render's on its own, unless told not to).
      const info = renderer.gl.info, autoReset = info.autoReset;
      info.autoReset = false;
      info.reset();
      frame((time += 1 / 60));
      const draws = info.render.calls, triangles = info.render.triangles;
      info.autoReset = autoReset;
      sync();
      const row: ProfileRow = {
        label: c.label, width: c.width, height: c.height, gpu, cpu, uncapped,
        cpuAlone: median(alone), cpuAlonePasses: medians(cpuTimer.frames.map((t) => t.cpu)), draws, triangles,
      };
      renderer.lightning.clock = clock;
      rows.push(row);
      progress(row, i);
    }
  } finally {
    renderer.output = null;
    output.dispose();
    renderer.timer = null;
    renderer.setQuality(quality);
    Object.assign(renderer.settings, settings);
    renderer.setReflectionScale(reflectionScale);
    renderer.maxRatio = maxRatio;
    renderer.resize(screen.width, screen.height);
    for (const k of PROFILE_KINDS) renderer.setVisible(k, true);
    view.zoom = zoom;
    view.update(0, true);
    restore();
  }
  return rows;
}

/**
 * Each pass's median over the frames, and their sum as 'frame'. Not the median of the frames' totals: now and then one pass
 * of a frame is timed long, the GPU having waited partway through it for the page's next commands, and a median per pass
 * leaves that out.
 */
function medians(frames: Record<string, number>[]) {
  const out: Record<string, number> = {};
  for (const p of PASSES) out[p] = median(frames.map((f) => f[p] ?? 0));
  out.frame = PASSES.reduce((a, p) => a + out[p], 0);
  return out;
}
/** Rows of cells as text: the first column left-aligned, the rest right. */
function columns(all: string[][]) {
  const widths = all[0].map((_, i) => Math.max(...all.map((l) => l[i].length)));
  return all.map((l) => l.map((x, i) => (i ? x.padStart(widths[i]) : x.padEnd(widths[i]))).join('  ')).join('\n');
}
function median(v: number[]) {
  const s = [...v].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
}

/**
 * The rows as a plain-text table: GPU ms per pass, the CPU's ms for the whole frame (frames in bursts, and alone: with the
 * GPU idle), the uncapped frame and its fps.
 */
export function profileTable(rows: ProfileRow[]) {
  const head = ['case', ...PASSES.slice(1).map((p) => `${p}`), 'GPU', 'CPU', 'CPU alone', 'draws', 'uncapped', 'fps'];
  const lines = rows.map((r) => [
    r.label,
    ...PASSES.slice(1).map((p) => (r.gpu ? r.gpu[p].toFixed(2) : '-')),
    r.gpu ? r.gpu.frame.toFixed(2) : '-',
    r.cpu.frame.toFixed(2),
    r.cpuAlone.toFixed(2),
    String(r.draws),
    r.uncapped.toFixed(2),
    (1000 / r.uncapped).toFixed(0),
  ]);
  const text = `${columns([head, ...lines])}\n\nCPU alone, pass by pass (where the CPU waits on the GPU, the pass takes the GPU's time so far):\n${
    columns([['case', ...PASSES], ...rows.map((r) => [r.label, ...PASSES.map((p) => (r.cpuAlonePasses[p] ?? 0).toFixed(2))])])}`;
  // The GPU's own timers can't take longer than the frames drawn back to back: if they do, they're counting waits.
  const off = rows.some((r) => r.gpu && r.gpu.frame > r.uncapped * 1.5);
  return off ? `${text}\n\nThe GPU timers here add up to far more than the uncapped frame: they count waiting, not work. Read the uncapped column.` : text;
}
