// The frame rate and the load (#210), over every commission: each map loaded in the game in headless Chromium on the GPU
// at 1080p, and the game's own profile run on it (src/world/brush/profile.ts: the four views, the widest and closest zooms, the hours, the heaviest weathers, the graphics
// presets, the widest view without each kind of mesh), with the level's load timed. Two saves a commission:
//   fresh  the commission as it starts: its own land, river, woods and rocks, nothing built but the depot;
//   farm   the bot's farm after `--minutes` of play (tools/bot.ts), on the bot's flat map, with the commission's own trees
//          and rocks put back wherever they're more than a tile from a building: a busy farm in its woods.
//
// Run the game's dev server first (`npm run dev`, or as a service: AGENTS.md), then:
//   npm run framerate -- [--layouts c1,c4] [--saves fresh,farm] [--minutes 20] [--cases storm] [--out out/framerate]
//   GAME_URL picks the server (default http://127.0.0.1:5173). --cases keeps the cases whose label has any of the words
//   (comma-separated); --labels those with exactly one of the labels (`|`-separated: `--labels "view 1, storm|widest, storm"`).
//   --query adds to the page's address (`--query overcast=a`: a look PR's option, to see what it costs). --chromium a
//   Chromium binary (default: Playwright's own install), as tools/bench.ts.
// It takes /tmp/gpu-bench.lock (flock) as tools/bench.ts does, so two measurements never share the GPU (--no-lock skips it).

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';
import { playLayout } from './bot.ts';
import { LAYOUTS } from './layouts.ts';
import { TERRAIN } from '../src/game/map.ts';
import { must } from '../src/game/result.ts';
import { saveKey, serialize } from '../src/game/save.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { newGame, sizeOf, type GameState } from '../src/game/state.ts';

const { values: opt } = parseArgs({ options: {
  layouts: { type: 'string', default: 'c1,c2,c3,c4,c5,c6,c7,c8' }, saves: { type: 'string', default: 'fresh,farm' },
  minutes: { type: 'string', default: '20' }, cases: { type: 'string' }, out: { type: 'string', default: 'out/framerate' },
  labels: { type: 'string' }, query: { type: 'string' }, chromium: { type: 'string' }, 'no-lock': { type: 'boolean' },
} });
const LOCK = '/tmp/gpu-bench.lock';
if (!opt['no-lock'] && !process.env.BENCH_LOCKED && spawnSync('flock', ['--version']).status === 0) {
  const r = spawnSync('flock', [LOCK, process.execPath, ...process.execArgv, ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, BENCH_LOCKED: '1' } });
  process.exit(r.status ?? 1);
}
const URL_ = (process.env.GAME_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');

/** As brush3d's profile reports a case (src/renderer/profile.ts). */
interface Row { label: string; gpu: Record<string, number> | null; cpu: Record<string, number>; uncapped: number }
interface Load { pieces: Record<string, number>; firstFrame: number; models: number; sinceStart: number }

/** The bot's farm, with the commission's own trees and rocks back on the tiles more than a tile from any building. */
function farm(id: string, minutes: number): GameState {
  const s = playLayout(id, minutes).state, own = newGame(must(scenarioById(id), id)).map, { width: w, height: h } = s.map;
  const near = new Uint8Array(w * h);
  for (const b of s.buildings) {
    const n = sizeOf(b);
    for (let y = b.y - 1; y < b.y + n + 1; y++) for (let x = b.x - 1; x < b.x + n + 1; x++) if (x >= 0 && y >= 0 && x < w && y < h) near[y * w + x] = 1;
  }
  for (let i = 0; i < w * h; i++) {
    const t = own.terrain[i];
    if (!near[i] && s.map.terrain[i] === TERRAIN.grass && (t === TERRAIN.tree || t === TERRAIN.rock)) s.map.terrain[i] = t;
  }
  return s;
}

const browser = await chromium.launch({
  executablePath: opt.chromium ?? process.env.BENCH_CHROMIUM, headless: true,
  args: ['--use-angle=vulkan', '--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE', '--disable-vulkan-surface', '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization', '--disable-frame-rate-limit', '--disable-gpu-vsync', '--hide-scrollbars'],
  env: { ...process.env, VK_ICD_FILENAMES: process.env.VK_ICD_FILENAMES ?? '/usr/share/vulkan/icd.d/radeon_icd.x86_64.json' },
});
const words = opt.cases?.split(',').map((w) => w.trim()).filter(Boolean), labels = opt.labels?.split('|').map((w) => w.trim());
const report: Record<string, { buildings: number; trees: number; load: Load; rows: Row[] }> = {};
try {
  for (const id of opt.layouts.split(',')) for (const save of opt.saves.split(',')) {
    if (save === 'farm' && !LAYOUTS[id]) { console.log(`${id}: no bot layout, no farm`); continue; }
    const state = save === 'farm' ? farm(id, Number(opt.minutes)) : newGame(must(scenarioById(id), id));
    const name = `${id} ${save}`, trees = state.map.terrain.filter((t) => t === TERRAIN.tree).length;
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    try {
      const page = await context.newPage();
      page.on('pageerror', (e) => console.error(`  page error: ${e.message}`));
      await page.addInitScript(`localStorage.setItem(${JSON.stringify(saveKey(new URL(`${URL_}/`).pathname))}, ${JSON.stringify(serialize(state))});`);
      await page.goto(`${URL_}/${opt.query ? `?${opt.query}` : ''}`);
      await page.waitForFunction('window.game?.load?.()?.models > 0', undefined, { timeout: 180_000 });
      // The models swapped in, the shaders for them compiled, the wind's worker up.
      await page.waitForTimeout(3000);
      const load = await page.evaluate<Load>('game.load()');
      const cases = labels ? `game.cases().filter((c) => ${JSON.stringify(labels)}.includes(c.label))`
        : words ? `game.cases().filter((c) => ${JSON.stringify(words)}.some((w) => c.label.includes(w)))` : 'undefined';
      const rows = await page.evaluate<Row[]>(`(async () => game.profile(${cases}))()`);
      report[name] = { buildings: state.buildings.length, trees, load, rows };
      const ms = (n: number) => n.toFixed(1);
      console.log(`\n${name}: ${state.buildings.length} buildings, ${trees} trees on the map · load ${ms(load.sinceStart)} ms (${Object.entries(load.pieces).map(([k, v]) => `${k} ${ms(v)}`).join(', ')}; first frame ${ms(load.firstFrame)}; models ${ms(load.models)})`);
      console.log(`  ${'case'.padEnd(34)} ${'GPU'.padStart(6)} ${'CPU'.padStart(6)} ${'uncap'.padStart(6)}  shadow  reflect  main`);
      for (const r of rows) {
        console.log(`  ${r.label.padEnd(34)} ${(r.gpu ? ms(r.gpu.frame) : '-').padStart(6)} ${ms(r.cpu.frame).padStart(6)} ${ms(r.uncapped).padStart(6)}  ${r.gpu ? [r.gpu.shadow, r.gpu.reflect, r.gpu.main].map((v) => ms(v).padStart(6)).join('  ') : ''}`);
      }
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
}
mkdirSync(opt.out, { recursive: true });
const file = `${opt.out}/${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(file, JSON.stringify({ args: opt, report }, null, 1));
console.log(`\nreport: ${file}`);
