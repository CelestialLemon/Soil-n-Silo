// Measures how long the bot takes in every season and character, to set the season factor on a random commission's target
// time (`seasonFactor` in src/game/scenarios.ts). It plays bot layouts (tools/layouts.ts) on the real rules in every climate
// and on several seeds (the weather's rolls follow the seed), and prints each layout's time in minutes and, as a ratio to the
// same layout in a mild spring, how much slower or faster the climate makes it.
//
// Run: node tools/seasonfactor.ts [layouts, comma separated; default all] [seeds, default 3] [minutes cap, default 150]
// The layouts a winter can't clear (sauce, oil and honey cake need crops and bees a winter doesn't give) show as "-".

import { playLayout } from './bot.ts';
import { LAYOUTS } from './layouts.ts';
import { CHARACTERS, charactersOf, climateOf, SEASON_IDS } from '../src/game/seasons.ts';
import { scenarioById } from '../src/game/scenarios.ts';

const ids = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : Object.keys(LAYOUTS).filter((id) => id !== 'c2');
const seeds = Number(process.argv[3] ?? 3), cap = Number(process.argv[4] ?? 150);

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const times = new Map<string, number | null>();
const key = (id: string, label: string) => `${id}|${label}`;
const labels: { label: string; season: (typeof SEASON_IDS)[number]; character: keyof typeof CHARACTERS | null }[] = [];
for (const season of SEASON_IDS) for (const character of charactersOf(season)) labels.push({ label: `${season} ${character}`, season, character });

for (const id of ids) {
  const base = scenarioById(id.split(':')[0]);
  if (!base) throw new Error(`no commission ${id}`);
  for (const { label, season, character } of labels) {
    const runs = Array.from({ length: seeds }, (_, k) => playLayout(id, cap, undefined, { climate: climateOf(season, character), seed: base.seed + 1000 * k }).completedAt);
    times.set(key(id, label), runs.some((t) => t === null) ? null : mean(runs as number[]) / 60);
  }
}

const f = (x: number | null | undefined, d = 1) => (x == null ? '-' : x.toFixed(d));
console.log(`minutes (mean of ${seeds} seeds), then the ratio to a mild spring\n`);
/** The suggested factor: halfway between the mean and the worst ratio over the layouts the climate lets the bot clear (a commission's goals decide which
 * layout it is like), rounded up to 0.05. */
const factorOf = (label: string) => {
  const rs = ids.flatMap((id) => { const t = times.get(key(id, label)), ref = times.get(key(id, 'spring mild')); return t && ref ? [t / ref] : []; });
  return rs.length ? Math.ceil((mean(rs) + Math.max(...rs)) / 2 / 0.05 - 1e-9) * 0.05 : null;
};
console.log(['climate'.padEnd(16), ...ids.map((id) => id.padStart(12)), 'factor'.padStart(8)].join(' '));
for (const { label } of labels) {
  console.log([label.padEnd(16), ...ids.map((id) => {
    const t = times.get(key(id, label)), ref = times.get(key(id, 'spring mild'));
    return `${f(t)} (${t && ref ? f(t / ref, 2) : '-'})`.padStart(12);
  }), f(factorOf(label), 2).padStart(8)].join(' '));
}
