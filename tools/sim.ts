// Plays a commission's bot layout on the real game rules and prints its progress (tools/bot.ts).
//
// Run: npm run sim -- [layout: a commission id, or id:variant such as c2:next; default c1] [minutes to run, default 60]

import { playLayout } from './bot.ts';

playLayout(process.argv[2] ?? 'c1', Number(process.argv[3] ?? 60), (line) => console.log(line));
