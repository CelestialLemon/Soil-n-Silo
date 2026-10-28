// The frame-cost benchmark (docs/BENCHMARK.md): bot-built saves loaded into the built game in headless Chromium, scripted
// through a still view, a resting pointer, a pointer path and a camera pan/zoom/turn, with what three.js is asked to draw each
// frame counted (the structural metrics, which do not depend on the machine) and what it costs in JS and GPU ms (which do).
// Compares against a baseline: structural growth over 5% fails, a median more than 10% slower on the same machine is flagged.
//
// Run: npm run bench -- [--structural] [--seconds 30] [--repeats 3] [--fixture name] [--baseline file] [--write-baseline file]
//   --structural   CI's check: the game paused, a few frames of each still fixture, no timings, exit 1 on growth. Software GL is fine.
//   --no-gpu       software GL (SwiftShader) instead of the real GPU through ANGLE/Vulkan; the timings then mean nothing.
//   --vsync        keep the browser's 60 Hz frame cap (default: uncapped, so the frame time is the cost of a frame).
//   --chromium     a Chromium or headless shell binary (or BENCH_CHROMIUM); default is Playwright's own install.
//   --skip-build   reuse out/bench-dist.   --no-lock  don't take /tmp/gpu-bench.lock (flock) first.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { build, preview } from 'vite';
import { chromium, type Page } from 'playwright-core';
import { playLayout } from './bot.ts';
import { RIVER_AT } from './layouts.ts';
import { newGame, type GameState } from '../src/game/state.ts';
import { saveKey, serialize } from '../src/game/save.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { must } from '../src/game/result.ts';

const LOCK = '/tmp/gpu-bench.lock';
const BASELINES = new URL('./bench/baselines/', import.meta.url).pathname;
const DIST = 'out/bench-dist';
/** The window: 1080p, the size the performance targets are set at. The structural check uses a small one, so software GL can draw it in CI. */
const FULL = { width: 1920, height: 1080 }, SMALL = { width: 640, height: 360 };
/** Structural limits (growth in the median, as a share) and the timing one (slower median, as a share). */
const STRUCTURAL_GROWTH = 0.05, TIMING_GROWTH = 0.10;
/** The structural run's sample: frames counted after the warm-up frames. */
const STRUCTURAL_FRAMES = 8, STRUCTURAL_WARMUP_FRAMES = 4;

type Script = 'still' | 'rest' | 'pointer' | 'camera';
/** A fixture: a commission's bot layout run for `minutes` of play (0 is the fresh start), then viewed through `script`. */
interface Fixture { name: string; layout: string; minutes: number; script: Script; /** Where to look (tiles east of the depot), when not at the depot. */ lookEast?: number }
const FIXTURES: Fixture[] = [
  { name: 'c1-fresh', layout: 'c1', minutes: 0, script: 'still' },
  { name: 'c1-farm', layout: 'c1', minutes: 15, script: 'still' },
  { name: 'c4-farm', layout: 'c4', minutes: 20, script: 'still' },
  { name: 'c7-river', layout: 'c7', minutes: 20, script: 'still', lookEast: RIVER_AT.c7 },
  { name: 'c1-farm-rest', layout: 'c1', minutes: 15, script: 'rest' },
  { name: 'c1-farm-pointer', layout: 'c1', minutes: 15, script: 'pointer' },
  { name: 'c1-farm-camera', layout: 'c1', minutes: 15, script: 'camera' },
];

/** One frame as the page's probe (bench/probe.js) records it. Ms are of the JS, and the `gpu` ones of timer queries when the browser has them. */
interface Frame {
  interval: number | null; callback: number; geometry: number; style: number; draws: number; triangles: number; visits: number;
  shadowRedraws: number; passes: number; picks: number; pickMs: number; gpuGeometry?: number; gpuStyle?: number;
}
type Metrics = Record<string, number>;
interface Env { glRenderer: string; glVendor: string; userAgent: string; timerQueries: boolean; viewport: number[]; devicePixelRatio: number; art: number[]; supersample: number; shadowMapSize: number }
interface Report {
  when: string; commit: string; pin: string; browser: string; mode: 'structural' | 'timing'; env: Env;
  /** Per fixture: its metrics' median over the repeats, and each repeat's own. */
  fixtures: Record<string, { script: Script; median: Metrics; repeats: Metrics[] }>;
}

const { values: opt } = parseArgs({ options: {
  structural: { type: 'boolean' }, 'no-gpu': { type: 'boolean' }, vsync: { type: 'boolean' }, 'skip-build': { type: 'boolean' }, 'no-lock': { type: 'boolean' },
  seconds: { type: 'string', default: '30' }, warmup: { type: 'string', default: '5' }, repeats: { type: 'string', default: '3' },
  fixture: { type: 'string', multiple: true }, baseline: { type: 'string' }, 'write-baseline': { type: 'string' }, chromium: { type: 'string' }, out: { type: 'string', default: 'out/bench' },
} });

// Several benchmarks on one machine distort each other: take the lock by running again under flock(1).
if (!opt['no-lock'] && !process.env.BENCH_LOCKED && spawnSync('flock', ['--version']).status === 0) {
  const r = spawnSync('flock', [LOCK, process.execPath, ...process.execArgv, ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, BENCH_LOCKED: '1' } });
  process.exit(r.status ?? 1);
}

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : NaN; };
const percentile = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
const round = (n: number) => Math.round(n * 1000) / 1000;

/** The metrics of one run's frames. Counts are medians per frame; times are medians (and the frame interval's percentiles). */
function summarize(frames: Frame[], structural: boolean): Metrics {
  const col = (f: (x: Frame) => number | null | undefined) => frames.map(f).filter((v): v is number => v !== undefined && v !== null && !Number.isNaN(v));
  const m: Metrics = {
    frames: frames.length,
    draws: median(col((f) => f.draws)), visits: median(col((f) => f.visits)), emptyVisits: median(col((f) => f.visits - f.draws)),
    triangles: median(col((f) => f.triangles)), passes: median(col((f) => f.passes)), shadowRedraws: round(col((f) => f.shadowRedraws).reduce((a, b) => a + b, 0) / (frames.length || 1)),
  };
  if (structural) return m;
  const intervals = col((f) => f.interval);
  Object.assign(m, {
    fps: 1000 / median(intervals), frameMs: median(intervals), frameP90: percentile(intervals, 0.9), frameP95: percentile(intervals, 0.95), frameP99: percentile(intervals, 0.99),
    jsFrameMs: median(col((f) => f.callback)), jsGeometryMs: median(col((f) => f.geometry)), jsStyleMs: median(col((f) => f.style)),
    jsRestMs: median(col((f) => f.callback - f.geometry - f.style)), pickMsPerFrame: round(col((f) => f.pickMs).reduce((a, b) => a + b, 0) / (frames.length || 1)),
    picksPerFrame: round(col((f) => f.picks).reduce((a, b) => a + b, 0) / (frames.length || 1)),
  });
  const gg = col((f) => f.gpuGeometry), gs = col((f) => f.gpuStyle);
  if (gg.length) m.gpuGeometryMs = median(gg);
  if (gs.length) m.gpuStyleMs = median(gs);
  for (const k of Object.keys(m)) m[k] = round(m[k]);
  return m;
}

/** The saves, built by the bot on the real rules (tools/bot.ts). */
function savesFor(fixtures: Fixture[]) {
  const saves = new Map<string, { data: string; depot: { x: number; y: number } }>();
  const key = (f: Fixture) => `${f.layout}@${f.minutes}`;
  for (const f of fixtures) {
    if (saves.has(key(f))) continue;
    const state: GameState = f.minutes === 0 ? newGame(must(scenarioById(f.layout), f.layout)) : playLayout(f.layout, f.minutes).state;
    saves.set(key(f), { data: serialize(state), depot: { ...state.map.depot } });
  }
  return (f: Fixture) => must(saves.get(key(f)), key(f));
}

/** Waits for the game's console hook (the page has loaded the models and built the world). */
const ready = (page: Page) => page.waitForFunction('window.__bench.ready()', undefined, { timeout: 180_000 });
/** Runs an expression in the page (tools/bench/probe.js's `window.__bench`, the game's `window.game`). */
const inPage = <T>(page: Page, expr: string): Promise<T> => page.evaluate<T>(expr);

/** Plays the fixture's script until `until` says so; the camera's moves are spread over the `seconds` after the `warmup`, the part that is measured. */
async function play(page: Page, script: Script, until: () => Promise<boolean>, seconds: number, warmup: number, { width: W, height: H }: { width: number; height: number }) {
  const t0 = Date.now();
  const elapsed = () => (Date.now() - t0) / 1000;
  if (script === 'still') { while (!(await until())) await page.waitForTimeout(100); return; }
  if (script === 'rest') {
    // The pointer resting over the middle of the map, as while reading a hover card.
    await page.mouse.move(W / 2, H / 2);
    while (!(await until())) await page.waitForTimeout(100);
    return;
  }
  if (script === 'pointer') {
    // A slow Lissajous over the window: the same path whatever the machine, at one move for each 16 ms or so.
    while (!(await until())) {
      const t = elapsed();
      await page.mouse.move(W / 2 + 0.4 * W * Math.sin(2 * Math.PI * t / 7), H / 2 + 0.35 * H * Math.sin(2 * Math.PI * t / 5.3));
      await page.waitForTimeout(16);
    }
    return;
  }
  // The camera: the same sequence of pans (arrow keys held), zooms (wheel at the window's centre) and turns, spread over the run.
  await page.mouse.move(W / 2, H / 2);
  const steps: [number, () => Promise<void>][] = [
    [0.00, () => page.keyboard.down('ArrowRight')], [0.12, () => page.keyboard.up('ArrowRight')],
    [0.15, async () => { for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(80); } }],
    [0.30, () => page.keyboard.press('KeyQ')],
    [0.35, () => page.keyboard.down('ArrowDown')], [0.47, () => page.keyboard.up('ArrowDown')],
    [0.55, async () => { for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(80); } }],
    [0.70, () => page.keyboard.press('KeyE')],
    [0.75, () => page.keyboard.down('ArrowLeft')], [0.87, () => page.keyboard.up('ArrowLeft')],
  ];
  let next = 0;
  while (!(await until())) {
    while (next < steps.length && elapsed() >= warmup + steps[next][0] * seconds) await steps[next++][1]();
    await page.waitForTimeout(20);
  }
  for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft']) await page.keyboard.up(k);
}

async function main() {
  const structural = !!opt.structural, viewport = structural ? SMALL : FULL;
  const seconds = Number(opt.seconds), warmup = Number(opt.warmup), repeats = structural ? 1 : Number(opt.repeats);
  const wanted = opt.fixture?.length ? FIXTURES.filter((f) => opt.fixture?.includes(f.name)) : FIXTURES;
  // The structural check counts only the still views: a moving camera or pointer changes what is culled and picked from run to run.
  const fixtures = structural ? wanted.filter((f) => f.script === 'still') : wanted;
  if (!fixtures.length) throw new Error(`no such fixture (have: ${FIXTURES.map((f) => f.name).join(', ')})`);

  console.log('building the saves with the bot…');
  const saveOf = savesFor(fixtures);
  if (!opt['skip-build'] || !existsSync(DIST)) {
    console.log('building the game…');
    await build({ logLevel: 'warn', build: { outDir: DIST, emptyOutDir: true } });
  }
  const server = await preview({ logLevel: 'warn', build: { outDir: DIST }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
  const url = must(server.resolvedUrls?.local[0], 'preview URL');

  const gpuArgs = opt['no-gpu'] ? [] : [
    '--use-angle=vulkan', '--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE', '--disable-vulkan-surface', '--ignore-gpu-blocklist', '--enable-gpu-rasterization',
  ];
  const browser = await chromium.launch({
    executablePath: opt.chromium ?? process.env.BENCH_CHROMIUM, headless: true,
    args: [...gpuArgs, ...(opt.vsync || structural ? [] : ['--disable-frame-rate-limit', '--disable-gpu-vsync']), '--enable-unsafe-webgpu=false', '--hide-scrollbars'],
    env: { ...process.env, ...(opt['no-gpu'] ? {} : { VK_ICD_FILENAMES: process.env.VK_ICD_FILENAMES ?? '/usr/share/vulkan/icd.d/radeon_icd.x86_64.json' }) },
  });
  const probe = readFileSync(new URL('./bench/probe.js', import.meta.url), 'utf8');
  const report: Report = {
    when: new Date().toISOString(), commit: execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim(),
    pin: (JSON.parse(readFileSync('package.json', 'utf8')) as { dependencies: Record<string, string> }).dependencies['pixel3d-renderer'],
    mode: structural ? 'structural' : 'timing', browser: browser.version(), env: undefined as unknown as Env, fixtures: {},
  };

  try {
    for (const f of fixtures) {
      const runs: Metrics[] = [];
      for (let r = 0; r < repeats; r++) {
        const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
        const page = await context.newPage();
        page.on('pageerror', (e) => console.error(`  page error: ${e.message}`));
        const { data, depot } = saveOf(f);
        await page.addInitScript(probe);
        await page.addInitScript(`localStorage.setItem(${JSON.stringify(saveKey('/'))}, ${JSON.stringify(data)});`);
        await page.goto(url);
        await ready(page);
        await inPage(page, `__bench.install(); ${f.lookEast === undefined ? '' : `game.look(${depot.x + f.lookEast}, ${depot.y});`}`);
        if (structural) await page.keyboard.press('Space');
        report.env ??= await inPage<Env>(page, '__bench.env()');

        const frameCount = () => inPage<number>(page, '__bench.count()');
        await inPage(page, '__bench.start()');
        const frames = await (async () => {
          const target = structural ? STRUCTURAL_WARMUP_FRAMES + STRUCTURAL_FRAMES : 0;
          if (structural) { await play(page, f.script, async () => (await frameCount()) >= target, seconds, 0, viewport); }
          else {
            const start = Date.now();
            await play(page, f.script, () => Promise.resolve(Date.now() - start >= (warmup + seconds) * 1000), seconds, warmup, viewport);
          }
          return await inPage<Frame[]>(page, '__bench.stop()');
        })();
        // Drop the warm-up: frames in the first seconds (shader compiles, lazily allocated targets), or the first few in a structural run.
        let t = 0;
        const kept = structural ? frames.slice(STRUCTURAL_WARMUP_FRAMES) : frames.filter((fr) => { t += fr.interval ?? 0; return t >= warmup * 1000; });
        runs.push(summarize(kept, structural));
        console.log(`  ${f.name} #${r + 1}: ${kept.length} frames; ${structural ? line(runs[r], ['draws', 'visits', 'emptyVisits', 'triangles', 'shadowRedraws']) : line(runs[r], ['fps', 'frameMs', 'frameP95', 'jsGeometryMs', 'gpuGeometryMs', 'draws', 'emptyVisits'])}`);
        await context.close();
      }
      const keys = Object.keys(runs[0]);
      report.fixtures[f.name] = { script: f.script, median: Object.fromEntries(keys.map((k) => [k, round(median(runs.map((r) => r[k])))])), repeats: runs };
    }
  } finally {
    await browser.close();
    await server.close();
  }

  mkdirSync(opt.out ?? 'out/bench', { recursive: true });
  const file = `${opt.out}/${report.when.replace(/[:.]/g, '-')}-${report.mode}.json`;
  writeFileSync(file, JSON.stringify(report, null, 2));
  console.log(`\n${report.env.glRenderer} · ${report.env.viewport.join('×')} · art ${report.env.art.join('×')} · SS${report.env.supersample} · pin ${report.pin} · ${report.commit} · Chromium ${report.browser}\nreport: ${file}`);
  if (opt['write-baseline']) { mkdirSync(new URL('.', `file://${process.cwd()}/${opt['write-baseline']}`).pathname, { recursive: true }); writeFileSync(opt['write-baseline'], JSON.stringify(report, null, 2)); console.log(`baseline written: ${opt['write-baseline']}`); }

  const baselinePath = opt.baseline ?? (structural ? `${BASELINES}structural.json` : `${BASELINES}${slug(report.env.glRenderer)}.json`);
  if (!existsSync(baselinePath)) { console.log(`no baseline at ${baselinePath}; nothing to compare`); return; }
  const problems = compare(report, JSON.parse(readFileSync(baselinePath, 'utf8')) as Report);
  console.log(problems.length ? `\nagainst ${baselinePath}:\n${problems.map((p) => `  ${p}`).join('\n')}` : `\nagainst ${baselinePath}: no regressions`);
  if (structural && problems.length) process.exitCode = 1;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const line = (m: Metrics, keys: string[]) => keys.filter((k) => m[k] !== undefined).map((k) => `${k} ${m[k]}`).join(', ');

/** The structural metrics that may not grow (draws, submissions, triangles, shadow redraws), and the timings that may not slow, against a baseline report. */
function compare(now: Report, base: Report): string[] {
  const out: string[] = [];
  // The shadow redraws are a few in a run, so one more or less is not growth.
  const grew = (a: number, b: number, share: number, slack = 0) => a > b * (1 + share) + slack;
  const structuralKeys = ['draws', 'visits', 'emptyVisits', 'triangles', 'passes', 'shadowRedraws'];
  const timingKeys = ['frameMs', 'frameP95', 'jsFrameMs', 'jsGeometryMs', 'gpuGeometryMs', 'gpuStyleMs'];
  for (const [name, f] of Object.entries(now.fixtures)) {
    const b = base.fixtures[name];
    if (!b) { out.push(`${name}: not in the baseline`); continue; }
    if (f.script === 'still') for (const k of structuralKeys) {
      if (b.median[k] !== undefined && f.median[k] !== undefined && grew(f.median[k], b.median[k], STRUCTURAL_GROWTH, k === 'shadowRedraws' ? 0.25 : 0)) out.push(`${name}: ${k} grew ${b.median[k]} → ${f.median[k]} (over ${STRUCTURAL_GROWTH * 100}%; investigate)`);
    }
    if (now.mode === 'timing' && base.mode === 'timing' && now.env.glRenderer === base.env.glRenderer) for (const k of timingKeys) {
      if (b.median[k] !== undefined && f.median[k] !== undefined && f.median[k] > b.median[k] * (1 + TIMING_GROWTH)) out.push(`${name}: ${k} slower ${b.median[k]} → ${f.median[k]} ms (over ${TIMING_GROWTH * 100}%)`);
    }
  }
  return out;
}

await main();
