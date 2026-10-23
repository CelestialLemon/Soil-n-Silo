// Measures what floods cost the bot, to set the spring factor on a random commission's target time (`PAR_FACTOR` in
// src/game/scenarios.ts). The bot's map is flat and has no water, so a flood would never reach it: this puts a two-tile river
// down the map a few tiles from the depot (`river`, tiles east of the depot, negative west) and plays each layout through the
// events a random commission of that climate rolls, once as rolled and once with its floods taken out, on the same seeds.
//
// Run: node tools/floodcost.ts [layouts, comma separated; default c1,c4,c6] [river offsets, default -8,-10] [seeds, default 6]

import { playLayout } from './bot.ts';
import { rollEvents } from '../src/game/events.ts';
import { flooded } from '../src/game/flood.ts';
import { climateOf } from '../src/game/seasons.ts';
import { must } from '../src/game/result.ts';
import { scenarioById } from '../src/game/scenarios.ts';

const ids = (process.argv[2] ?? 'c1,c4,c6').split(','), rivers = (process.argv[3] ?? '-8,-10').split(',').map(Number), seeds = Number(process.argv[4] ?? 6);
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

for (const character of ['mild', 'wet', 'stormy', 'highRiver'] as const) {
  const climate = climateOf('spring', character);
  for (const river of rivers) {
    const ratios: number[] = [], floodedShare: number[] = [];
    for (const id of ids) for (let k = 0; k < seeds; k++) {
      const base = must(scenarioById(id), id), seed = base.seed + 1000 * k;
      const events = rollEvents(seed, 3, climate, base.par);
      if (!events.some((e) => e.kind === 'flood')) continue;
      const dry = playLayout(id, 150, undefined, { climate, seed, events: events.filter((e) => e.kind !== 'flood'), river });
      let seen = 0, n = 0;
      const wet = playLayout(id, 150, undefined, { climate, seed, events, river }, (s) => { if (flooded(s).count) { seen += s.buildings.filter((b) => b.status === 'weather').length; n++; } });
      if (dry.completedAt && wet.completedAt) { ratios.push(wet.completedAt / dry.completedAt); floodedShare.push(n ? seen / n : 0); }
    }
    console.log(`spring ${character.padEnd(10)} river ${String(river).padStart(3)}: ${ratios.length} runs with a flood, mean ${ratios.length ? mean(ratios).toFixed(3) : '-'}, worst ${ratios.length ? Math.max(...ratios).toFixed(3) : '-'}; ${floodedShare.length ? mean(floodedShare).toFixed(1) : '-'} buildings flooded on average while it stands`);
  }
}
