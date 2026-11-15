// Hitches in a world that changes (#204): a busy commission played on the brush3d path (`?renderer=brush3d`) in headless
// Chromium on the GPU, at 4× speed, while the script changes the world every so often as a player would: buildings placed
// and removed, fields sown, trees cleared, saplings planted, trucks bought. Every frame is timed: the whole frame, each of
// the brush3d world's pieces' sync (sky, land, cover, water, things, wild), the renderer's passes (CPU, and GPU where the
// browser has timer queries). Reports the frame times (median, p99, max, frames over 33 and 50 ms), the worst frame after
// each kind of change, and the worst frames with what they spent their time on.
//
// The bot's farms (tools/bot.ts) stand on a flat, bare map, so the map's free corners are wooded first (tiles more than
// WOOD_GAP from any building, about a third of them), for the trees to be cleared and the saplings to grow.
//
// Run the game's dev server first (`npm run dev`, or as a service: AGENTS.md), then:
//   npm run hitches -- [--layout c4] [--minutes 20] [--seconds 60] [--every 1.5] [--speed 3] [--out out/hitches]
//   GAME_URL picks the server (default http://127.0.0.1:5173). --still makes no changes (the frame cost at rest).
//   --chromium a Chromium binary (default: Playwright's own install), as tools/bench.ts.

import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';
import { playLayout } from './bot.ts';
import { TERRAIN } from '../src/game/map.ts';
import { serialize, saveKey } from '../src/game/save.ts';
import { sizeOf } from '../src/game/state.ts';

const { values: opt } = parseArgs({ options: {
  layout: { type: 'string', default: 'c4' }, minutes: { type: 'string', default: '20' }, seconds: { type: 'string', default: '60' },
  every: { type: 'string', default: '1.5' }, speed: { type: 'string', default: '3' }, warmup: { type: 'string', default: '8' },
  still: { type: 'boolean' }, profile: { type: 'boolean' }, out: { type: 'string', default: 'out/hitches' }, chromium: { type: 'string' },
  width: { type: 'string', default: '1920' }, height: { type: 'string', default: '1080' },
} });
const URL_ = (process.env.GAME_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
/** How far (tiles) the woods keep from the farm's buildings, so no route is blocked. */
const WOOD_GAP = 4;

// ---- The save: the bot's farm, its free corners wooded ----

const state = playLayout(opt.layout, Number(opt.minutes)).state;
{
  const { width: w, height: h } = state.map, near = new Uint8Array(w * h);
  for (const b of state.buildings) {
    const n = sizeOf(b);
    for (let y = b.y - WOOD_GAP; y < b.y + n + WOOD_GAP; y++) for (let x = b.x - WOOD_GAP; x < b.x + n + WOOD_GAP; x++) if (x >= 0 && y >= 0 && x < w && y < h) near[y * w + x] = 1;
  }
  let trees = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, r = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    if (near[i] || state.map.terrain[i] !== TERRAIN.grass) continue;
    if (r < 0.33) { state.map.terrain[i] = TERRAIN.tree; trees++; } else if (r < 0.36) state.map.terrain[i] = TERRAIN.rock;
  }
  console.log(`${opt.layout} after ${opt.minutes} min: ${state.buildings.length} buildings, ${state.trucks.length} trucks, ${trees} trees added`);
}

// ---- In the page ----

/** What the page records for each frame the game draws. */
interface Frame {
  t: number; interval: number; callback: number; sync: Record<string, number>; render: number;
  cpu: Record<string, number>; gpu: Record<string, number> | null; events: string[];
}

/**
 * Installs the timing and the changes in the page (plain JS, run there with the arguments: { every, still, seconds }).
 */
const INSTALL = /* js */ `(async (args) => {
  const w = window, game = w.game;
  const build = await import('/src/game/build.ts');
  const st = await import('/src/game/state.ts');
  const { PassTimer } = await import('/brush3d/src/index.ts');
  const r = game.renderer, pieces = game.pieces;
  const frames = [];
  let current = null, last = null, recording = false, pending = [];
  r.timer = new PassTimer(r.gl.getContext());
  for (const [name, piece] of Object.entries(pieces)) {
    const sync = piece.sync.bind(piece);
    piece.sync = (...a) => { const t = performance.now(); try { sync(...a); } finally { if (current) current.sync[name] = performance.now() - t; } };
  }
  const render = r.render.bind(r);
  r.render = (time) => {
    const t = performance.now();
    try { render(time); } finally {
      if (current) { current.render = performance.now() - t; const tf = r.timer.frames[r.timer.frames.length - 1]; current.cpu = tf.cpu; current.timed = tf; }
    }
  };
  const raf = w.requestAnimationFrame.bind(w);
  w.requestAnimationFrame = (cb) => raf((stamp) => {
    const start = performance.now();
    current = { t: stamp, interval: last === null ? 0 : stamp - last, callback: 0, sync: {}, render: 0, cpu: {}, gpu: null, events: pending };
    pending = [];
    try { cb(stamp); } finally {
      const f = current; current = null;
      if (f.render) { f.callback = performance.now() - start; last = stamp; if (recording) frames.push(f); }
    }
  });

  // The changes, as a player makes them, one every \`every\` seconds.
  const s = () => game.state;
  const placed = [];
  const free = (n) => {
    const { width, height, depot } = s().map;
    for (let k = 0; k < 400; k++) {
      const x = Math.floor(depot.x + (Math.random() - 0.5) * width * 0.9), y = Math.floor(depot.y - Math.random() * height * 0.9);
      if (x < 0 || y < 0 || x + n > width || y + n > height) continue;
      return { x, y };
    }
    return null;
  };
  const tryPlace = (type) => {
    for (let k = 0; k < 200; k++) {
      const at = free(3); if (!at) continue;
      const res = build.place(s(), type, at.x, at.y, Math.floor(Math.random() * 4));
      if (res.ok) { placed.push(res.value.building.id); return \`place \${type}\`; }
    }
    return null;
  };
  const kinds = [
    () => tryPlace(['coop', 'solar', 'composter', 'hive', 'silo', 'turbine', 'battery', 'mill'][Math.floor(Math.random() * 8)]),
    () => {
      const { width, height } = s().map, trees = [];
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (s().map.terrain[y * width + x] === 3) trees.push([x, y]);
      if (!trees.length) return null;
      const [x, y] = trees[Math.floor(Math.random() * trees.length)];
      return build.removeAt(s(), x, y).ok ? 'clear tree' : null;
    },
    () => tryPlace('sapling'),
    () => tryPlace('field'),
    () => {
      const id = placed.shift(), b = id === undefined ? null : st.buildingById(s(), id);
      return b && build.remove(s(), b).ok ? \`remove \${b.type}\` : null;
    },
    // A truck bought, from a garage with room (a garage built first if none has).
    () => {
      for (const g of s().buildings) if (g.type === 'garage' && build.buyTruck(s(), g).ok) return 'buy truck';
      return tryPlace('garage');
    },
  ];
  let n = 0;
  w.__hitches = {
    start() {
      recording = true;
      if (args.still) return;
      const timer = setInterval(() => {
        s().credits = 1e7;
        const what = kinds[n++ % kinds.length]();
        if (what) pending.push(what);
      }, args.every * 1000);
      setTimeout(() => clearInterval(timer), args.seconds * 1000);
    },
    stop() {
      recording = false;
      r.timer.poll();
      return frames.map((f) => ({ ...f, gpu: f.timed?.gpu ?? null, timed: undefined }));
    },
    info: () => ({ gpu: r.timer.gpu, buildings: s().buildings.length, trucks: s().trucks.length, width: r.width, height: r.height }),
  };
})`;

const browser = await chromium.launch({
  executablePath: opt.chromium ?? process.env.BENCH_CHROMIUM, headless: true,
  args: ['--use-angle=vulkan', '--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE', '--disable-vulkan-surface', '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization', '--disable-frame-rate-limit', '--disable-gpu-vsync', '--hide-scrollbars'],
  env: { ...process.env, VK_ICD_FILENAMES: process.env.VK_ICD_FILENAMES ?? '/usr/share/vulkan/icd.d/radeon_icd.x86_64.json' },
});
try {
  const context = await browser.newContext({ viewport: { width: Number(opt.width), height: Number(opt.height) }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') console.error(`[page] ${m.text()}`); });
  await page.addInitScript(`localStorage.setItem(${JSON.stringify(saveKey('/'))}, ${JSON.stringify(serialize(state))});`);
  await page.goto(`${URL_}/?renderer=brush3d`);
  await page.waitForFunction('window.game?.renderer && window.game.pieces', undefined, { timeout: 180_000 });
  const seconds = Number(opt.seconds), warmup = Number(opt.warmup);
  await page.evaluate(`${INSTALL}(${JSON.stringify({ every: Number(opt.every), still: !!opt.still, seconds })})`);
  // The models load, the shaders compile and the world settles before the measure.
  await page.keyboard.press(`Digit${opt.speed}`);
  await page.waitForTimeout(warmup * 1000);
  const info = await page.evaluate('__hitches.info()');
  // --profile: a CPU profile of the run too (open it in Chrome's DevTools, Performance), for where a hitch's time goes.
  const cdp = opt.profile ? await context.newCDPSession(page) : null;
  if (cdp) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
  await page.evaluate('__hitches.start()');
  await page.waitForTimeout((seconds + 2) * 1000);
  const frames = await page.evaluate<Frame[]>('__hitches.stop()');
  if (cdp) {
    const { profile } = await cdp.send('Profiler.stop');
    mkdirSync(opt.out, { recursive: true });
    writeFileSync(`${opt.out}/profile.cpuprofile`, JSON.stringify(profile));
    console.log(`CPU profile: ${opt.out}/profile.cpuprofile`);
  }
  await context.close();
  report(frames, info as Record<string, unknown>);
} finally {
  await browser.close();
}

function report(frames: Frame[], info: Record<string, unknown>) {
  const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
  const pct = (xs: number[], p: number) => { const s = sorted(xs); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
  const ms = (v: number | undefined) => (v === undefined ? '-' : v.toFixed(1));
  const iv = frames.map((f) => f.interval).filter((v) => v > 0), cb = frames.map((f) => f.callback);
  const summary = {
    frames: frames.length, medianMs: pct(iv, 0.5), p99Ms: pct(iv, 0.99), maxMs: Math.max(...iv),
    over33: iv.filter((v) => v > 33).length, over50: iv.filter((v) => v > 50).length, jsMedianMs: pct(cb, 0.5), jsMaxMs: Math.max(...cb),
  };
  const what = (f: Frame) => [
    ...Object.entries(f.sync).filter(([, v]) => v > 1).map(([k, v]) => `${k} ${ms(v)}`),
    ...Object.entries(f.cpu).filter(([, v]) => v > 1).map(([k, v]) => `cpu:${k} ${ms(v)}`),
    ...Object.entries(f.gpu ?? {}).filter(([, v]) => v > 1).map(([k, v]) => `gpu:${k} ${ms(v)}`),
  ].join(', ');
  console.log(`\n${JSON.stringify(info)}`);
  console.log(`frames ${summary.frames}: median ${ms(summary.medianMs)} ms, p99 ${ms(summary.p99Ms)}, max ${ms(summary.maxMs)}; over 33 ms: ${summary.over33}, over 50 ms: ${summary.over50}; JS median ${ms(summary.jsMedianMs)}, max ${ms(summary.jsMaxMs)}`);
  // The worst of the three frames after each change, by kind: the frame's length, and its main thread's work (the
  // change's own cost, which a busy shared GPU doesn't stretch).
  const byKind = new Map<string, { frame: number[]; js: number[] }>();
  frames.forEach((f, i) => {
    for (const e of f.events) {
      const [verb, type] = e.split(' ');
      const kind = verb === 'place' || verb === 'remove' ? `${verb} ${type === 'sapling' || type === 'field' ? type : 'building'}` : e;
      const next = frames.slice(i, i + 3), k = byKind.get(kind) ?? { frame: [], js: [] };
      k.frame.push(Math.max(...next.map((g) => g.interval))); k.js.push(Math.max(...next.map((g) => g.callback)));
      byKind.set(kind, k);
    }
  });
  console.log('\nthe worst of the three frames after each change (ms): frame median / max, JS median / max');
  for (const [k, v] of byKind) {
    console.log(`  ${k.padEnd(16)} ${String(v.frame.length).padStart(3)}×  ${ms(pct(v.frame, 0.5)).padStart(6)} / ${ms(Math.max(...v.frame)).padStart(6)}   ${ms(pct(v.js, 0.5)).padStart(6)} / ${ms(Math.max(...v.js)).padStart(6)}`);
  }
  console.log('\nthe ten worst frames:');
  for (const f of [...frames].sort((a, b) => b.interval - a.interval).slice(0, 10)) {
    console.log(`  ${ms(f.interval).padStart(6)} ms (JS ${ms(f.callback)})${f.events.length ? ` after [${f.events.join(', ')}]` : ''}: ${what(f)}`);
  }
  mkdirSync(opt.out, { recursive: true });
  const file = `${opt.out}/${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(file, JSON.stringify({ args: opt, info, summary, byKind: Object.fromEntries(byKind), frames }, null, 1));
  console.log(`\nreport: ${file}`);
}
