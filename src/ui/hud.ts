import { hourLabel } from 'pixel3d-renderer';
import { remove, rotate, setCrop, setFilter, setPadMode, setRecipe, priceOf } from '../game/build.ts';
import {
  BUILDINGS, CATEGORIES, CROP_IDS, CROPS, FIELD, GROUP_NAMES, GROUPS, HIVE, ITEM_IDS, ITEMS, PAD, POWER, recipesFor,
  type BuildingId, type Ingredient, type ItemId,
} from '../game/data.ts';
import { networkOf, networks } from '../game/power.ts';
import {
  dayAt, describeStatus, exposureOf, fieldFertility, fieldPace, flowersNear, goalDone, goodsFlow, hourAt, isPollinated, makes, medalFor, padDistance,
  padTarget, ratePerMin, receiversOf, recipeOf, shareOf, soilHealth, sunAt, suppliersOf, wants, windAt, type Medal,
} from '../game/sim.ts';
import { buildingById, type Building, type Dir, type GameState } from '../game/state.ts';
import { LINK_IN, LINK_OUT, type Overlay } from '../world/view.ts';
import { h } from './dom.ts';
import { buildingCard, guidePanel, type GuidePage } from './guide.ts';

// The HUD over the canvas: the commission and its clock, power and weather, the goals, the build bar, what's under the
// pointer, the inspector for the selected building, messages, and the modal screens (intro, pause, stats, results, guide). The
// game state belongs to main.ts; the HUD changes it only through the rules in src/game/.

export type Tool =
  | { kind: 'select' }
  | { kind: 'build'; type: BuildingId; rot: Dir }
  | { kind: 'remove' }
  | { kind: 'link'; pad: number };

/** The pixel size setting's choices: screen pixels per art pixel. */
export const PIXEL_SIZES = [1, 2, 3, 4] as const;

export interface HudHost {
  state(): GameState;
  tool(): Tool;
  setTool(t: Tool): void;
  /** 0 when paused. */
  speed(): number;
  setSpeed(n: number): void;
  overlay(): Overlay;
  setOverlay(o: Overlay): void;
  selected(): number | null;
  select(id: number | null): void;
  changed(): void;
  turn(d: 1 | -1): void;
  /** +1 zooms in, -1 out. */
  zoom(d: 1 | -1): void;
  /** Screen pixels per art pixel (a setting). */
  pixelSize(): number;
  setPixelSize(n: number): void;
  menu(): void;
  restart(): void;
}

const fmtTime = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; };
const watts = (w: number) => `${w >= 100 ? Math.round(w) : w.toFixed(1).replace(/\.0$/, '')} W`;
const MEDAL_NAME: Record<Medal, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

/** A good's swatch and name. */
const good = (id: ItemId, n?: number | string) => h('span', { class: 'good' }, h('i', { style: `background:#${ITEMS[id].colour.toString(16).padStart(6, '0')}` }), n !== undefined ? `${n} ` : '', ITEMS[id].name.toLowerCase());
const ingredient = (ing: Ingredient) => ('item' in ing ? good(ing.item, ing.n) : h('span', { class: 'good' }, `${ing.n} `, GROUP_NAMES[ing.group].split(' (')[0]));
const button = (label: string | Node, onclick: () => void, o: { disabled?: boolean; primary?: boolean; title?: string; active?: boolean; cls?: string } = {}) =>
  h('button', { class: [o.primary ? 'primary' : '', o.active ? 'active' : '', o.cls ?? ''].join(' ').trim(), disabled: !!o.disabled, title: o.title, onclick: (e: Event) => { e.stopPropagation(); onclick(); } }, label);
function set(el: HTMLElement, text: string) { if (el.textContent !== text) el.textContent = text; }
const bar = () => { const fill = h('div', { class: 'fill' }); return { el: h('div', { class: 'bar' }, fill), set: (k: number) => { fill.style.width = `${Math.max(0, Math.min(1, k)) * 100}%`; } }; };

interface Modal { name: string; el: HTMLElement; blocking: boolean }

export class Hud {
  private readonly host: HudHost;
  private readonly root: HTMLElement;
  private readonly top = {
    name: h('b'), clock: h('span'), medal: h('span', { class: 'medal-pace' }), credits: h('b'),
    day: h('span'), sun: h('span'), wind: h('span'), power: h('span'), battery: bar(),
  };
  private readonly speedButtons: HTMLButtonElement[] = [];
  private readonly overlayButtons = new Map<Overlay, HTMLButtonElement>();
  private readonly goals = h('div', { class: 'card goals' });
  private goalRows: { el: HTMLElement; text: HTMLElement; bar: ReturnType<typeof bar> }[] = [];
  private readonly buildbar = h('div', { class: 'buildbar card' });
  private category = CATEGORIES[0].id;
  private buildKey = '';
  private readonly buildButtons = new Map<BuildingId, HTMLButtonElement>();
  private readonly info = h('div', { class: 'info' });
  /** The card about the build button under the pointer, shown in place of `info`. */
  private readonly tip = h('div', { class: 'card tip' });
  private tipFor: BuildingId | null = null;
  private readonly inspector = h('div', { class: 'card inspector' });
  private inspectKey = '';
  private inspectUpdate: (() => void) | null = null;
  private readonly toasts = h('div', { class: 'toasts' });
  private readonly layer = h('div', { class: 'layer' });
  private modals: Modal[] = [];
  private statsOpen = false;
  private readonly statsBody = h('div');
  private readonly stats = h('div', { class: 'card stats-panel' }, h('div', { class: 'head' }, h('b', null, 'Production (last minute)'), button('✕', () => this.toggleStats(), { cls: 'close' })), this.statsBody);
  private lastSlow = 0;

  constructor(root: HTMLElement, host: HudHost) {
    this.host = host;
    this.root = root;
    const t = this.top;
    const left = h('div', { class: 'card commission' },
      h('div', null, t.name),
      h('div', { class: 'line' }, '⏱ ', t.clock, ' ', t.medal),
      h('div', { class: 'line' }, '◈ ', t.credits, ' credits'));
    const mid = h('div', { class: 'card weather' },
      h('div', { class: 'line' }, t.day, ' · ☀ ', t.sun, ' · ༄ ', t.wind),
      h('div', { class: 'line' }, '⚡ ', t.power),
      h('div', { class: 'line battery', title: 'Stored power across all batteries' }, '▮ ', t.battery.el));
    const speeds = h('div', { class: 'buttons' }, ...[[0, '⏸', 'Pause (Space)'], [1, '1×', 'Normal speed (1)'], [2, '2×', 'Double speed (2)'], [4, '4×', 'Fast (3)']].map(([n, label, title]) => {
      const b = button(String(label), () => host.setSpeed(Number(n)), { title: String(title) });
      this.speedButtons.push(b);
      return b;
    }));
    const overlays = h('div', { class: 'buttons' }, ...([['fertility', 'Soil'], ['power', 'Power'], ['water', 'Water'], ['bees', 'Bees']] as [Overlay, string][]).map(([o, label]) => {
      const b = button(label, () => host.setOverlay(o), { title: `Show ${label.toLowerCase()} (V cycles)` });
      this.overlayButtons.set(o, b);
      return b;
    }));
    const right = h('div', { class: 'right-col' }, h('div', { class: 'buttons' },
      speeds,
      button('⟲', () => host.turn(-1), { title: 'Turn the view (Q)' }), button('⟳', () => host.turn(1), { title: 'Turn the view (E)' }),
      button('−', () => host.zoom(-1), { title: 'Zoom out (wheel, − or Shift+Z)' }), button('+', () => host.zoom(1), { title: 'Zoom in (wheel, + or Z)' }), button('☰', () => this.openPause(), { title: 'Menu (Esc)' })),
      overlays,
      h('div', { class: 'buttons' }, button('Guide (G)', () => this.openGuide(), { cls: 'small' }), button('Stats (Tab)', () => this.toggleStats(), { cls: 'small' })));
    // Stacked from the bottom up, so the build bar never moves when the line above it changes.
    const bottom = h('div', { class: 'bottom' }, this.toasts, this.info, this.tip, this.buildbar);
    root.append(h('div', { class: 'hud' }, h('div', { class: 'top' }, left, mid, right), this.goals, this.inspector, this.stats, bottom), this.layer);
    this.buildGoals();
    this.refresh();
  }

  get modal() { return this.modals.some((m) => m.blocking); }

  // ---- Every frame ----

  update() {
    const s = this.host.state(), now = performance.now();
    this.speedButtons.forEach((b, i) => b.classList.toggle('active', [0, 1, 2, 4][i] === this.host.speed()));
    for (const [o, b] of this.overlayButtons) b.classList.toggle('active', this.host.overlay() === o);
    this.syncBuildbar();
    if (now - this.lastSlow < 150) return;
    this.lastSlow = now;
    const t = this.top, sc = s.scenario;
    set(t.name, sc.name);
    const done = s.completedAt;
    set(t.clock, sc.sandbox ? fmtTime(s.time) : done !== null ? `${fmtTime(done)} · done` : `${fmtTime(s.time)} / ${fmtTime(sc.par)}`);
    const pace = sc.sandbox ? null : medalFor(sc.par, done ?? s.time);
    set(t.medal, pace ? (done !== null ? MEDAL_NAME[pace] : `${MEDAL_NAME[pace]} pace`) : '');
    t.medal.className = `medal-pace ${pace ?? ''}`;
    set(t.credits, sc.sandbox ? '∞' : Math.floor(s.credits).toLocaleString());
    set(t.day, `Day ${dayAt(s.time)}, ${hourLabel(hourAt(s.time))}`);
    set(t.sun, `${Math.round(sunAt(sc, s.time) * 100)}%`);
    set(t.wind, `${Math.round(windAt(sc, s.time) * 100)}%`);
    const nets = networks(s).list;
    const made = nets.reduce((n, x) => n + x.made, 0), wanted = nets.reduce((n, x) => n + x.wanted, 0);
    const stored = nets.reduce((n, x) => n + x.stored, 0), cap = nets.reduce((n, x) => n + x.capacity, 0);
    const worst = nets.reduce((m, x) => Math.min(m, x.share), 1);
    set(t.power, nets.length ? `${watts(made)} made · ${watts(wanted)} used${worst < 1 ? ` · short (${Math.round(worst * 100)}%)` : ''}` : 'No pylons yet');
    t.power.className = worst < 1 ? 'warn' : '';
    t.battery.set(cap ? stored / cap : 0);
    this.updateGoals();
    this.inspect();
    if (this.statsOpen) this.renderStats();
  }

  setHover(text: string | null) {
    set(this.info, text ?? '');
    this.info.style.display = text && this.tipFor === null ? 'block' : 'none';
  }

  private showTip(id: BuildingId | null) {
    this.tipFor = id;
    if (id) this.tip.replaceChildren(buildingCard(id, priceOf(this.host.state(), id)));
    this.tip.style.display = id ? 'block' : 'none';
  }

  toast(msg: string, ok = true) {
    const t = h('div', { class: `toast${ok ? '' : ' bad'}` }, msg);
    this.toasts.append(t);
    while (this.toasts.children.length > 4) this.toasts.firstChild!.remove();
    setTimeout(() => t.classList.add('gone'), 2200);
    setTimeout(() => t.remove(), 2800);
  }

  /** Redraw what depends on the tool and selection right away. */
  refresh() { this.buildKey = ''; this.inspectKey = ''; this.lastSlow = 0; }

  // ---- Goals ----

  private buildGoals() {
    const s = this.host.state();
    this.goals.replaceChildren(h('div', { class: 'title' }, s.scenario.sandbox ? 'Sandbox' : 'Commission'));
    this.goalRows = s.scenario.goals.map(() => {
      const text = h('div'), b = bar(), el = h('div', { class: 'goal' }, text, b.el);
      this.goals.append(el);
      return { el, text, bar: b };
    });
    if (!s.scenario.goals.length) this.goals.append(h('div', { class: 'goal' }, 'No goals: build whatever you like.'));
  }

  private updateGoals() {
    const s = this.host.state();
    s.scenario.goals.forEach((g, i) => {
      const row = this.goalRows[i];
      const done = goalDone(s, i);
      row.el.classList.toggle('done', done);
      if (g.kind === 'deliver') {
        const n = Math.min(g.n, s.delivered[g.item] ?? 0);
        set(row.text, `${done ? '✔' : '○'} Deliver ${ITEMS[g.item].name.toLowerCase()}: ${n} / ${g.n}`);
        row.bar.set(n / g.n);
      } else if (g.kind === 'rate') {
        const r = ratePerMin(s, g.item, 'delivered');
        set(row.text, `${done ? '✔' : '○'} Deliver ${g.perMin} ${ITEMS[g.item].name.toLowerCase()}/min (now ${r.toFixed(1)})`);
        row.bar.set(done ? 1 : r / g.perMin);
      } else {
        const v = soilHealth(s);
        set(row.text, `${done ? '✔' : '○'} Soil health ≥ ${g.min} at the end (now ${Math.round(v)})`);
        row.bar.set(v / g.min);
      }
    });
  }

  // ---- Build bar ----

  private syncBuildbar() {
    const s = this.host.state(), tool = this.host.tool();
    // The buttons are made again only when the category or tool changes (not while credits tick, which would swallow clicks).
    const key = JSON.stringify([this.category, tool]);
    if (key === this.buildKey) {
      for (const [id, b] of this.buildButtons) b.classList.toggle('poor', s.credits < priceOf(s, id));
      return;
    }
    this.buildKey = key;
    this.buildButtons.clear();
    this.showTip(null);
    const tabs = h('div', { class: 'tabs' }, ...CATEGORIES.map((c) => button(c.name, () => { this.category = c.id; this.buildKey = ''; }, { active: c.id === this.category })),
      button('Remove (X)', () => this.host.setTool(tool.kind === 'remove' ? { kind: 'select' } : { kind: 'remove' }), { active: tool.kind === 'remove', cls: 'danger' }));
    const ids = (Object.keys(BUILDINGS) as BuildingId[]).filter((id) => BUILDINGS[id].category === this.category);
    const items = h('div', { class: 'items' }, ...ids.map((id) => {
      const d = BUILDINGS[id], price = priceOf(s, id), active = tool.kind === 'build' && tool.type === id;
      const b = button(h('span', null, h('b', null, d.name), h('small', null, `${price ? `${price} ◈` : 'free'}${d.power ? ` · ${d.power} W` : ''}${d.key ? ` · ${d.key}` : ''}`)),
        () => this.host.setTool(active ? { kind: 'select' } : { kind: 'build', type: id, rot: tool.kind === 'build' ? tool.rot : 1 }),
        { active, cls: s.credits < price ? 'poor' : '' });
      b.addEventListener('pointerenter', () => this.showTip(id));
      b.addEventListener('pointerleave', () => { if (this.tipFor === id) this.showTip(null); });
      this.buildButtons.set(id, b);
      return b;
    }));
    this.buildbar.replaceChildren(tabs, items);
  }

  // ---- Inspector ----

  private inspect() {
    const s = this.host.state(), id = this.host.selected(), b = id !== null ? buildingById(s, id) : null;
    if (!b) {
      if (this.inspector.style.display !== 'none') { this.inspector.style.display = 'none'; this.inspector.replaceChildren(); }
      this.inspectKey = ''; this.inspectUpdate = null;
      return;
    }
    const key = JSON.stringify([b.id, b.type, b.crop, b.recipe, b.filter, b.mode, b.link, b.rot, this.host.tool().kind]);
    if (key !== this.inspectKey) {
      this.inspectKey = key;
      this.inspector.style.display = 'block';
      const { el, update } = this.renderInspector(s, b);
      this.inspector.replaceChildren(el);
      this.inspectUpdate = update;
    }
    this.inspectUpdate?.();
  }

  private renderInspector(s: GameState, b: Building): { el: HTMLElement; update: () => void } {
    const def = BUILDINGS[b.type];
    const status = h('div', { class: 'status' });
    const lines: (() => void)[] = [() => { set(status, describeStatus(s, b)); status.className = `status ${b.status}`; }];
    const body: (Node | null)[] = [];
    const wiring = this.wiring(s, b);
    if (wiring) { body.push(wiring.el); lines.push(wiring.update); }
    const stat = (label: string, get: () => string) => {
      const v = h('b'); lines.push(() => set(v, get()));
      body.push(h('div', { class: 'kv' }, h('span', null, label), v));
    };
    const progress = (get: () => number) => { const p = bar(); lines.push(() => p.set(get())); body.push(p.el); };
    const changed = () => { this.inspectKey = ''; this.host.changed(); };

    switch (b.type) {
      case 'field': {
        body.push(h('div', { class: 'choices' }, ...CROP_IDS.map((c) => button(CROPS[c].name, () => { const r = setCrop(b, c); if (r.ok) this.toast(r.message); changed(); }, { active: b.crop === c, title: `${CROPS[c].grow} s · ${CROPS[c].yield} per harvest · soil ${CROPS[c].soil > 0 ? '+' : ''}${CROPS[c].soil}` }))));
        progress(() => b.growth!);
        stat('Soil fertility', () => `${Math.round(fieldFertility(s, b))}`);
        stat('Growth pace', () => { const p = fieldPace(s, b); return `${Math.round(p.pace * 100)}% (water ${Math.round(p.water * 100)}%, soil ×${p.soil.toFixed(2)})`; });
        stat('Harvest', () => `${CROPS[b.crop!].yield}${CROPS[b.crop!].flowers && isPollinated(s, b) ? ' +1 (bees)' : ''} every ~${Math.round(CROPS[b.crop!].grow / Math.max(0.01, fieldPace(s, b).pace))} s`);
        stat('Waiting to go', () => `${b.stored} / ${FIELD.store}`);
        stat('Compost', () => `${b.compost} / ${FIELD.compostStore} (used below soil ${FIELD.compostBelow})`);
        break;
      }
      case 'hive':
        stat('Flowering fields', () => `${flowersNear(s, b)} (up to ${HIVE.maxFlowers})`);
        progress(() => b.growth!);
        stat('Honey waiting', () => `${b.stored} / ${HIVE.store}`);
        break;
      case 'sorter':
        body.push(h('label', { class: 'select' }, 'Straight on: ', h('select', { onchange: (e: Event) => { setFilter(b, ((e.target as HTMLSelectElement).value || null) as ItemId | null); changed(); } },
          h('option', { value: '', selected: !b.filter }, 'everything'), ...ITEM_IDS.map((id) => h('option', { value: id, selected: b.filter === id }, ITEMS[id].name)))));
        body.push(h('p', { class: 'hint' }, 'The chosen good goes straight on; every other good goes out left or right.'));
        break;
      case 'pad': {
        body.push(h('div', { class: 'choices' }, button('Send', () => { this.padMode(b, 'send'); changed(); }, { active: b.mode === 'send' }), button('Receive', () => { this.padMode(b, 'receive'); changed(); }, { active: b.mode === 'receive' })));
        if (b.mode === 'send') {
          const t = padTarget(s, b);
          body.push(h('div', { class: 'kv' }, h('span', null, 'Sends to'), h('b', null, t ? `${BUILDINGS[t.type].name} (${Math.round(padDistance(b, t))} tiles)` : 'nothing yet')));
          body.push(button(this.host.tool().kind === 'link' ? 'Click the target…' : 'Link to a pad or the depot', () => this.host.setTool({ kind: 'link', pad: b.id }), { primary: true }));
          stat('Drone', () => ({ home: 'home', out: 'flying out', hover: 'unloading', back: 'flying back' })[b.drone!.phase]);
          stat('Waiting to send', () => `${b.store!.length} / ${PAD.store}`);
        } else stat('Waiting to go out', () => `${b.store!.length} / ${PAD.receiveStore}`);
        break;
      }
      case 'battery': stat('Charge', () => `${Math.round(b.charge!)} / ${POWER.battery.capacity} J`); progress(() => b.charge! / POWER.battery.capacity); break;
      case 'solar': case 'turbine':
        stat('Making', () => watts(makes(s, b, sunAt(s.scenario, s.time), windAt(s.scenario, s.time))));
        if (b.type === 'turbine') stat('Shelter', () => `${Math.round(exposureOf(s, b) * 100)}% of the wind reaches it`);
        break;
      case 'belt': stat('Goods', () => `${b.items!.length}`); break;
      case 'depot': {
        const list = h('div', { class: 'delivered' });
        lines.push(() => {
          const key = JSON.stringify(s.delivered);
          if (list.dataset.key === key) return;
          list.dataset.key = key;
          const got = (Object.keys(s.delivered) as ItemId[]).filter((i) => s.delivered[i]);
          list.replaceChildren(...(got.length ? got.map((i) => h('div', null, good(i, s.delivered[i]))) : [h('p', { class: 'hint' }, 'Nothing delivered yet. Run belts into the depot, or link drone pads to it.')]));
        });
        stat('Earned', () => `${Math.floor(s.earned).toLocaleString()} credits`);
        body.push(h('h4', null, 'Delivered'), list);
        break;
      }
    }

    const r = recipeOf(b);
    if (r) {
      const rs = recipesFor(b.type);
      if (rs.length > 1) body.unshift(h('div', { class: 'choices' }, ...rs.map((x) => button(ITEMS[x.outputs[0].item].name, () => { const r = setRecipe(b, x.id); if (r.message) this.toast(r.message, r.ok); changed(); }, { active: b.recipe === x.id }))));
      body.push(h('div', { class: 'recipe' }, ...r.inputs.flatMap((ing, i) => [i ? ' + ' : '', ingredient(ing)]), ' → ',
        ...(r.outputs.length ? r.outputs.flatMap((o, i) => [i ? ' + ' : '', good(o.item, o.n)]) : [`${POWER.digester} W`]), h('small', null, ` · ${r.time} s`)));
      progress(() => (b.progress ?? 0) / r.time);
      const ins = h('div', { class: 'buffers' }), outs = h('div', { class: 'buffers' });
      lines.push(() => {
        const inKeys = r.inputs.flatMap((ing) => ('item' in ing ? [ing.item] : [...GROUPS[ing.group]]));
        const k = JSON.stringify([b.inputs, b.outputs]);
        if (ins.dataset.key === k) return;
        ins.dataset.key = k;
        ins.replaceChildren(h('span', null, 'In: '), ...inKeys.map((i) => good(i, b.inputs![i] ?? 0)));
        outs.replaceChildren(h('span', null, 'Out: '), ...(r.outputs.length ? r.outputs.map((o) => good(o.item, b.outputs![o.item] ?? 0)) : ['power']));
      });
      body.push(ins, outs);
    }
    if (def.power) stat('Power', () => { const net = networkOf(s, b), w = wants(s, b); return !net ? 'not connected' : w ? `using ${watts(w)} now · getting ${Math.round(shareOf(s, b) * 100)}%` : 'none right now'; });
    if (def.power || b.type === 'battery' || b.type === 'solar' || b.type === 'turbine' || b.type === 'digester') {
      stat('Network', () => { const net = networkOf(s, b); return net ? `${watts(net.made)} made · ${watts(net.wanted)} used · ${Math.round(net.stored)} J stored` : 'none: no pylon in reach'; });
    }

    const actions = h('div', { class: 'actions' },
      def.directional ? button('Turn (R)', () => { rotate(s, b); changed(); }) : null,
      b.type !== 'depot' ? button('Remove', () => { const res = remove(s, b); this.toast(res.message, res.ok); this.host.select(null); changed(); }, { cls: 'danger' }) : null);
    const el = h('div', null,
      h('div', { class: 'head' }, h('b', null, def.name), h('span', { class: 'head-buttons' },
        button('?', () => this.openGuide({ kind: 'building', id: b.type }), { cls: 'close', title: 'Open its page in the guide (G)' }),
        button('✕', () => { this.host.select(null); this.refresh(); }, { cls: 'close', title: 'Close (Esc)' }))),
      h('p', { class: 'hint' }, def.hint), status, ...body, actions);
    return { el, update: () => { for (const l of lines) l(); } };
  }

  /**
   * How many belts (or splitters, sorters, crossings) bring the building goods and take its goods away (they are tinted on
   * the map), with a hint when one side isn't wired; null for buildings that don't handle goods.
   */
  private wiring(s: GameState, b: Building): { el: HTMLElement; update: () => void } | null {
    const { takes, gives } = goodsFlow(b);
    if (!takes && !gives) return null;
    // A field's compost is optional, and a depot may be fed by drones alone, so neither is missing anything without a belt.
    const needsIn = () => takes && b.type !== 'field' && !(b.type === 'depot' && s.buildings.some((p) => p.type === 'pad' && p.mode === 'send' && p.link === b.id));
    const dot = (hex: number) => h('i', { class: 'dot', style: `background:#${hex.toString(16).padStart(6, '0')}` });
    const inN = h('b'), outN = h('b'), hint = h('p', { class: 'hint warn-hint' });
    const el = h('div', null,
      h('div', { class: 'kv wiring' }, h('span', null, 'Linked'), h('span', null,
        takes ? h('span', null, dot(LINK_IN), inN, ' in') : null, takes && gives ? ' · ' : '', gives ? h('span', null, dot(LINK_OUT), outN, ' out') : null)),
      hint);
    const update = () => {
      const ins = suppliersOf(s, b).length, outs = receiversOf(s, b).length;
      set(inN, String(ins)); set(outN, String(outs));
      const msg = !ins && needsIn() ? 'No belt brings it goods yet: make a belt point into it.'
        : gives && !outs ? 'Nothing takes its goods yet: run a belt beside it, pointing away.' : '';
      set(hint, msg);
      hint.style.display = msg ? '' : 'none';
    };
    return { el, update };
  }

  private padMode(b: Building, mode: 'send' | 'receive') {
    const r = setPadMode(b, mode);
    if (r.message) this.toast(r.message, r.ok);
  }

  // ---- Stats ----

  toggleStats() { this.statsOpen = !this.statsOpen; this.stats.style.display = this.statsOpen ? 'block' : 'none'; if (this.statsOpen) this.renderStats(); }

  private renderStats() {
    const s = this.host.state();
    const rows = ITEM_IDS.filter((i) => s.made[i] || s.delivered[i]).map((i) => h('tr', null,
      h('td', null, good(i)), h('td', null, ratePerMin(s, i, 'made').toFixed(1)), h('td', null, ratePerMin(s, i, 'delivered').toFixed(1)),
      h('td', null, String(s.made[i] ?? 0)), h('td', null, String(s.delivered[i] ?? 0))));
    this.statsBody.replaceChildren(
      rows.length ? h('table', null, h('tr', null, h('th', null, 'Good'), h('th', null, 'Made/min'), h('th', null, 'Delivered/min'), h('th', null, 'Made'), h('th', null, 'Delivered')), ...rows)
        : h('p', { class: 'hint' }, 'Nothing made yet.'),
      h('div', { class: 'kv' }, h('span', null, 'Soil health'), h('b', null, String(Math.round(soilHealth(s))))));
  }

  // ---- Modal screens ----

  private openModal(name: string, el: HTMLElement, blocking: boolean) {
    this.modals = this.modals.filter((m) => m.name !== name);
    this.modals.push({ name, el, blocking });
    this.drawModals();
  }
  private drawModals() {
    const top = this.modals[this.modals.length - 1];
    this.layer.replaceChildren(...(top ? [top.el] : []));
    this.layer.classList.toggle('open', !!top);
  }
  /** Closes the topmost modal or panel; false if none was open. */
  closeTop(): boolean {
    if (this.modals.length) { this.modals.pop(); this.drawModals(); return true; }
    if (this.statsOpen) { this.toggleStats(); return true; }
    return false;
  }
  private close(name: string) { this.modals = this.modals.filter((m) => m.name !== name); this.drawModals(); }

  /** Opens the guide on `page`; by default on what's in hand, selected or hovered in the build bar. G again closes it. */
  openGuide(page?: GuidePage) {
    if (!page && this.modals.some((m) => m.name === 'guide')) { this.close('guide'); return; }
    const tool = this.host.tool(), sel = this.host.selected(), b = sel !== null ? buildingById(this.host.state(), sel) : null;
    const id = this.tipFor ?? (tool.kind === 'build' ? tool.type : b?.type ?? null);
    const start: GuidePage = page ?? (id ? { kind: 'building', id } : { kind: 'topic', id: 'start' });
    this.showTip(null);
    this.openModal('guide', guidePanel(start, { build: (t) => this.host.setTool({ kind: 'build', type: t, rot: tool.kind === 'build' ? tool.rot : 1 }) }, () => this.close('guide')), true);
  }

  showIntro() {
    const s = this.host.state(), sc = s.scenario;
    this.openModal('intro', h('div', { class: 'panel' },
      h('h2', null, sc.name), h('p', null, sc.blurb),
      sc.goals.length ? h('ul', null, ...sc.goals.map((g) => h('li', null, g.kind === 'deliver' ? `Deliver ${g.n} ${ITEMS[g.item].name.toLowerCase()} to the depot` : g.kind === 'rate' ? `Reach ${g.perMin} ${ITEMS[g.item].name.toLowerCase()} per minute delivered` : `Keep soil health at ${g.min} or more`))) : null,
      sc.sandbox ? null : h('p', { class: 'sub' }, `Target time ${fmtTime(sc.par)} for gold, ${fmtTime(sc.par * 1.5)} for silver. You can pause (Space) and build while paused.`),
      sc.tags.length ? h('p', { class: 'tags' }, ...sc.tags.map((t) => h('span', null, t))) : null,
      sc.tips ? h('div', { class: 'tips' }, h('h3', null, 'First steps'), h('ol', null, ...sc.tips.map((t) => h('li', null, t)))) : null,
      sc.tips ? null : help(),
      h('div', { class: 'actions' }, button('Start', () => this.close('intro'), { primary: true }))), true);
  }

  openPause() {
    const s = this.host.state();
    this.openModal('pause', h('div', { class: 'panel' },
      h('h2', null, s.scenario.name), help(),
      h('h3', null, 'Settings'),
      h('div', { class: 'setting' }, h('span', null, 'Pixel size'),
        h('span', { class: 'choices' }, ...PIXEL_SIZES.map((n) => button(`${n}×${n}`, () => { this.host.setPixelSize(n); this.openPause(); }, { active: this.host.pixelSize() === n })))),
      h('p', { class: 'sub hint-line' }, 'Screen pixels for each pixel of the art. Smaller pixels show finer detail and cost more to draw.'),
      h('div', { class: 'actions' },
        button('Restart commission', () => this.confirm('Restart this commission?', 'Everything built so far is lost.', () => this.host.restart())),
        button('Level select', () => this.host.menu()),
        button('Resume', () => this.close('pause'), { primary: true }))), true);
  }

  private confirm(title: string, text: string, yes: () => void) {
    this.openModal('confirm', h('div', { class: 'panel' }, h('h2', null, title), h('p', null, text),
      h('div', { class: 'actions' }, button('Cancel', () => this.close('confirm')), button('Yes', yes, { primary: true }))), true);
  }

  showComplete(medal: Medal) {
    const s = this.host.state(), sc = s.scenario, t = s.completedAt ?? s.time;
    this.openModal('done', h('div', { class: 'panel done' },
      h('h2', null, 'Commission complete!'),
      h('div', { class: `medal ${medal}` }, MEDAL_NAME[medal]),
      h('p', null, `${sc.name}, delivered in ${fmtTime(t)} (target ${fmtTime(sc.par)}).`),
      h('p', { class: 'sub' }, medal === 'gold' ? 'Within the target time.' : medal === 'silver' ? `Gold needs ${fmtTime(sc.par)} or less.` : `Silver needs ${fmtTime(sc.par * 1.5)} or less.`),
      h('p', null, `Earned ${Math.floor(s.earned).toLocaleString()} credits · soil health ${Math.round(soilHealth(s))}.`),
      h('div', { class: 'actions' }, button('Keep playing', () => this.close('done')), button('Level select', () => this.host.menu(), { primary: true }))), true);
  }
}

function help() {
  return h('ul', { class: 'help' },
    h('li', null, 'Pick a building in the bar at the bottom, then ', h('b', null, 'click or drag'), ' to place it. Belts follow the drag; ', h('b', null, 'R'), ' turns them.'),
    h('li', null, 'Goods leave a building onto any belt beside it that doesn\'t lead back into it, and enter from any belt that points into it.'),
    h('li', null, 'Machines need power: build solar panels, turbines or a digester, and pylons within 3 tiles of everything. Batteries keep the night going.'),
    h('li', null, 'Fields grow faster with water (sprinklers) and rich soil; harvests drain the soil. Compost, beans and resting fix it.'),
    h('li', null, 'Markers: ', h('span', { class: 'm red' }, '◆'), ' no power ', h('span', { class: 'm orange' }, '◆'), ' blocked/low power ', h('span', { class: 'm yellow' }, '◆'), ' waiting for input ', h('span', { class: 'm blue' }, '◆'), ' dry ', h('span', { class: 'm purple' }, '◆'), ' not linked'),
    h('li', null, h('b', null, 'Click'), ' a building to inspect it · ', h('b', null, 'X'), ' remove (refunds) · ', h('b', null, 'right click / Esc'), ' cancel'),
    h('li', null, h('b', null, 'Drag'), ' (or right-drag, arrows) to pan · ', h('b', null, 'Q E'), ' turn · ', h('b', null, 'wheel / trackpad pinch / + −'), ' zoom · ', h('b', null, 'Space 1 2 3'), ' pause and speed · ', h('b', null, 'V'), ' overlays · ', h('b', null, 'Tab'), ' stats'),
    h('li', null, 'Not sure what something does? ', h('b', null, 'G'), ' opens the guide: every building, how to use it and its numbers.'),
  );
}
