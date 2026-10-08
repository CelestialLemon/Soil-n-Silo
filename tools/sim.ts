// A scripted commission on the real game rules (src/game/): a bot builds a fixed layout as credits allow, then lets it run,
// and reports progress every in-game minute and when the commission completes, against its target time. It checks that
// commissions can be cleared and roughly how long they take (DESIGN.md, "Open questions"). The map is flattened (no
// water, rock or trees, even soil at the scenario's mean), since the layout is the bot's, not the map's.
//
// Run: npm run sim -- [commission id, default c1] [minutes to run, default 60]

import { place, setCrop, setFilter } from '../src/game/build.ts';
import { LAYOUTS } from './layouts.ts';
import { BUILDINGS, ITEMS } from '../src/game/data.ts';
import { TERRAIN } from '../src/game/map.ts';
import { networks } from '../src/game/power.ts';
import { scenarioById } from '../src/game/scenarios.ts';
import { advance, goalDone, medalFor, soilHealth } from '../src/game/sim.ts';
import { newGame, type GameState } from '../src/game/state.ts';

const id = process.argv[2] ?? 'c1';
const minutes = Number(process.argv[3] ?? 60);
const sc = scenarioById(id);
if (!sc) throw new Error(`no commission ${id}`);

const layout = LAYOUTS[id];
if (!layout) throw new Error(`no bot layout for ${id} yet (have: ${Object.keys(LAYOUTS).join(', ')})`);

const s: GameState = newGame(sc);
s.map.terrain.fill(TERRAIN.grass);
s.map.fertility.fill(sc.terrain.soil);
// The depot in the middle of the south edge, so every layout fits (nothing has looked up the layout yet).
s.map.depot.x = Math.floor(s.map.width / 2);
s.buildings[0].x = s.map.depot.x;
const steps = layout(s.map.depot.x, s.map.depot.y);
let next = 0;
const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

for (let t = 0; t < minutes * 60; t += 1) {
  while (next < steps.length && s.credits >= BUILDINGS[steps[next].type].cost) {
    const st = steps[next++];
    const r = place(s, st.type, st.x, st.y, st.rot ?? 1);
    if (!r.ok) { console.log(`  step ${next} ${st.type} at ${st.x},${st.y}: ${r.message}`); continue; }
    if (st.crop) setCrop(r.building!, st.crop);
    if (st.filter) setFilter(r.building!, st.filter);
    if (next === steps.length) console.log(`${fmt(s.time)}  layout complete (${steps.length} pieces)`);
  }
  advance(s, 1);
  if (Math.round(s.time) % 60 === 0) {
    const nets = networks(s).list, made = nets.reduce((n, x) => n + x.made, 0), wanted = nets.reduce((n, x) => n + x.wanted, 0);
    const goals = sc.goals.map((g, i) => (g.kind === 'deliver' ? `${ITEMS[g.item].name} ${s.delivered[g.item] ?? 0}/${g.n}` : g.kind === 'soil' ? `soil ${Math.round(soilHealth(s))}/${g.min}` : `${g.item}/min ${goalDone(s, i) ? 'done' : '…'}`));
    console.log(`${fmt(s.time)}  ${goals.join(' · ')} · credits ${Math.floor(s.credits)} · power ${made.toFixed(0)}/${wanted.toFixed(0)} W · stored ${nets.reduce((n, x) => n + x.stored, 0).toFixed(0)} J`);
  }
  if (s.completedAt !== null) {
    console.log(`\nComplete at ${fmt(s.completedAt)} (target ${fmt(sc.par)}): ${medalFor(sc.par, s.completedAt)}.`);
    break;
  }
}
if (s.completedAt === null) console.log(`\nNot complete after ${minutes} minutes.`);
const stalled = s.buildings.filter((b) => b.status === 'blocked' || b.status === 'input' || b.status === 'power').map((b) => `${b.type}@${b.x},${b.y}: ${b.status}${b.need ? ` (${b.need})` : ''}`);
if (stalled.length) console.log(`Not working at the end: ${stalled.slice(0, 12).join('; ')}`);
