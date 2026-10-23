// Measures how long the bot takes in every season and character with the weather events a random commission rolls there, to set the
// season-and-character factor on a random commission's target time (`PAR_FACTOR` in src/game/scenarios.ts). One measurement for
// the climate and its events together, so nothing is counted twice: it plays every bot layout (tools/layouts.ts) in every climate,
// on several seeds and at each difficulty (the events are rolled from the seed, the difficulty and the climate, as for a random
// commission, spread over as long as the bot takes in a mild spring: a level is never shorter than 7 days, 28 minutes, so the events a short layout (First
// Light, 15 minutes) outruns are not measured), and compares each run with the same layout and seed in a mild spring with no events.
//
// The bot's map is flat and has no water, so a flood would never reach it: each layout without a river of its own gets one a couple
// of tiles beyond the farm's west edge (the flood reaches about 6 tiles: a flood beside the farm, roughly the fifth of the land near
// the depot that a real map floods). Its farms have no trees but Tired Soil's, so a dust storm takes soil from the others.
//
// Run: node tools/seasonfactor.ts [layouts, comma separated; default all but c2] [seeds, default 4] [minutes cap, default 150] [workers, default 6]
// The layouts a winter can't clear (sauce, oil and honey cake need crops and bees a winter doesn't give) show as "-".
// A run that never finishes is left out of a layout's mean when most of that layout's runs in the climate finish (a rare jam of the bot's trucks, not the weather:
// a truck the flood moves can end up in a pocket it cannot leave); a layout most of whose runs fail (a winter's sauce) shows as "-", and the number left out is printed.
// The raw times go to the file in the 6th argument (default /tmp/seasonfactor.json), and `node tools/seasonfactor.ts --report <file>` prints the table again from it.
// Prints, per climate, each layout's mean ratio over the seeds and difficulties, the mean ratio over the layouts, the 90th percentile
// and the worst of the single runs, and the suggested factor: halfway between the mean over the layouts and the worst layout, up to 0.05.

import { readFileSync, writeFileSync } from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { playLayout } from './bot.ts';
import { LAYOUTS, RIVER_AT } from './layouts.ts';
import { rollEvents } from '../src/game/events.ts';
import { PAR_FACTOR, scenarioById } from '../src/game/scenarios.ts';
import { charactersOf, climateOf, SEASON_IDS, type Character, type Season } from '../src/game/seasons.ts';

interface Job { id: string; season: Season; character: Character | null; seed: number; difficulty: 0 | 1 | 2 | 3; cap: number }

/** The bot's river for a layout: its own, or two tiles beyond the farm's west edge. */
function riverFor(id: string): number {
  if (id.split(':')[0] in RIVER_AT) return RIVER_AT[id.split(':')[0]];
  const xs = LAYOUTS[id](0, 0).flatMap((st) => ('type' in st ? [st.x] : []));
  return Math.min(...xs) - 3;
}

/** How long the bot takes in a mild spring with no events (seconds), kept per layout and seed: the length of run the events are spread over. */
const reference = new Map<string, number | null>();
function referenceTime(id: string, seed: number, cap: number, river: number): number | null {
  const key = `${id}|${seed}`;
  let t = reference.get(key);
  if (t === undefined) {
    t = playLayout(id, cap, undefined, { climate: climateOf('spring', 'mild'), seed, events: [], river }).completedAt;
    reference.set(key, t);
  }
  return t;
}

/** Plays one job: minutes the bot took, or null if it did not finish. Difficulty 0 is the reference (a mild spring, no events). */
function play(j: Job): number | null {
  const base = scenarioById(j.id.split(':')[0]);
  if (!base) throw new Error(`no commission ${j.id}`);
  const seed = base.seed + 1000 * j.seed, river = riverFor(j.id);
  if (j.difficulty === 0) return fin(referenceTime(j.id, seed, j.cap, river));
  const climate = climateOf(j.season, j.character);
  // The events are spread over as long as the bot takes in a mild spring, so it meets every one of them, as a player taking the target time of a
  // random commission (spread over that) would meet its own: events that fall after the bot has finished would not be measured.
  const events = rollEvents(seed, j.difficulty, climate, referenceTime(j.id, seed, j.cap, river) ?? j.cap * 60);
  return fin(playLayout(j.id, j.cap, undefined, { climate, seed, events, river }).completedAt);
}
const fin = (t: number | null) => (t === null ? null : t / 60);

if (!isMainThread) {
  const jobs = workerData as Job[];
  parentPort?.postMessage(jobs.map(play));
} else {
  const reporting = process.argv[2] === '--report';
  const saved = reporting ? JSON.parse(readFileSync(process.argv[3], 'utf8')) as { ids: string[]; seeds: number; jobs: Job[]; result: (number | null)[] } : null;
  const ids = saved ? saved.ids : process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : Object.keys(LAYOUTS).filter((id) => id !== 'c2');
  const seeds = saved ? saved.seeds : Number(process.argv[3] ?? 4), cap = Number(process.argv[4] ?? 150), workers = Number(process.argv[5] ?? 6), rawFile = process.argv[6] ?? '/tmp/seasonfactor.json';
  const climates: { label: string; season: Season; character: Character | null }[] = [];
  for (const season of SEASON_IDS) for (const character of charactersOf(season)) climates.push({ label: `${season} ${character}`, season, character });

  const jobs: Job[] = saved ? saved.jobs : [];
  if (!saved) for (const id of ids) for (let k = 0; k < seeds; k++) {
    jobs.push({ id, season: 'spring', character: 'mild', seed: k, difficulty: 0, cap });
    for (const c of climates) for (const difficulty of [1, 2, 3] as const) jobs.push({ id, season: c.season, character: c.character, seed: k, difficulty, cap });
  }
  // Longest first would be best; a shuffle spreads the slow winter runs over the workers.
  const order = jobs.map((_, i) => i).sort((a, b) => ((a * 2654435761) >>> 0) - ((b * 2654435761) >>> 0));
  const result: (number | null)[] = saved ? saved.result : Array.from({ length: jobs.length }, () => null);
  const chunks = Array.from({ length: workers }, () => [] as number[]);
  order.forEach((ix, n) => chunks[n % workers].push(ix));
  let pending = workers;
  if (saved) report();
  else for (const chunk of chunks) {
    const w = new Worker(new URL(import.meta.url), { workerData: chunk.map((i) => jobs[i]) });
    w.on('message', (out: (number | null)[]) => { out.forEach((t, n) => { result[chunk[n]] = t; }); if (--pending === 0) { writeFileSync(rawFile, JSON.stringify({ ids, seeds, jobs, result })); report(); } });
    w.on('error', (e) => { console.error(e); process.exit(1); });
  }

  function report() {
    const at = new Map<string, number | null>();
    jobs.forEach((j, i) => at.set(`${j.id}|${j.season}|${j.character}|${j.seed}|${j.difficulty}`, result[i]));
    const ref = (id: string, k: number) => at.get(`${id}|spring|mild|${k}|0`) ?? null;
    const f = (x: number | null | undefined, d = 2) => (x == null ? '-' : x.toFixed(d));
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    console.log(`ratio to the same layout and seed in a mild spring with no events, mean over ${seeds} seeds and difficulties 1-3 (minutes of the reference: ${ids.map((id) => `${id} ${f(mean(Array.from({ length: seeds }, (_, k) => ref(id, k) ?? NaN)), 1)}`).join(', ')})\n`);
    console.log(['climate'.padEnd(16), ...ids.map((id) => id.padStart(8)), 'mean'.padStart(6), 'p90'.padStart(6), 'worst'.padStart(6), 'factor'.padStart(7), 'now'.padStart(6)].join(' '));
    for (const c of climates) {
      const perLayout: (number | null)[] = [], singles: number[] = [];
      let left = 0;
      for (const id of ids) {
        const rs: number[] = [];
        let total = 0;
        for (let k = 0; k < seeds; k++) for (const d of [1, 2, 3]) {
          const t = at.get(`${id}|${c.season}|${c.character}|${k}|${d}`), r0 = ref(id, k);
          total++;
          if (t != null && r0 != null) rs.push(t / r0);
        }
        if (rs.length * 2 <= total) { perLayout.push(null); continue; }
        left += total - rs.length;
        perLayout.push(mean(rs));
        singles.push(...rs);
      }
      const ok = perLayout.filter((x): x is number => x !== null), sorted = [...singles].sort((a, b) => a - b);
      const factor = ok.length ? Math.ceil((mean(ok) + Math.max(...ok)) / 2 / 0.05 - 1e-9) * 0.05 : null;
      console.log([c.label.padEnd(16), ...perLayout.map((x) => f(x).padStart(8)), f(ok.length ? mean(ok) : null).padStart(6), f(sorted[Math.floor(sorted.length * 0.9)]).padStart(6), f(sorted[sorted.length - 1]).padStart(6),
        f(factor).padStart(7), f(c.character ? PAR_FACTOR[c.season][c.character] : null).padStart(6), left ? `  (${left} left out)` : ''].join(' '));
    }
  }
}
