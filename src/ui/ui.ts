import { hourLabel } from 'pixel3d-renderer';
import { binValue, buy, buyChicken, canSell, collectEggs, collectManure, fillTrough, petChicken, ship, toggleDoor, unship, type Result } from '../game/actions.ts';
import { hourOfDay } from '../game/clock.ts';
import { describeSale, seasonResults, type Summary } from '../game/day.ts';
import { CHICKEN_PRICE, gold, ITEMS, QUALITY_NAMES, sellPrice, SHOP_ITEMS, type ItemId, type Quality } from '../game/items.ts';
import { canStart, collect, isReady, isRunning, MACHINE_NAMES, recipe, recipesFor, startRecipe } from '../game/machines.ts';
import { BACKPACK, countItem, HOTBAR, MAX_CHICKENS, moveSlot, SEASON_DAYS, TARGET, TIERS, type GameState, type Stack } from '../game/state.ts';
import { h } from './dom.ts';
import { iconUrl } from './icons.ts';

// The HUD over the canvas (clock, gold, the season target, the hotbar, what's under the pointer, messages) and the menus
// (shop, shipping bin, coop, machines, backpack, the morning summary, the season's results). The game state belongs to
// main.ts; the menus change it only through the rules in src/game/. Any open menu pauses the clock.

export interface UiHost {
  state(): GameState;
  /** After a menu changed the state. */
  changed(): void;
  endDay(): void;
  newGame(): void;
  turn(dir: 1 | -1): void;
  zoom(): void;
}

interface Panel { name: string; render(): HTMLElement; onClose?: () => void; modal?: boolean }

const qualityBadge = (q: Quality) => (q ? h('span', { class: `q q${q}`, title: QUALITY_NAMES[q] }, '★') : null);
const icon = (id: ItemId, q: Quality = 0) => h('span', { class: 'icon' }, h('img', { src: iconUrl(id), alt: ITEMS[id].name }), qualityBadge(q));
const stackName = (st: { item: ItemId; quality: Quality }) => `${st.quality ? `${QUALITY_NAMES[st.quality]} ` : ''}${ITEMS[st.item].name}`;
const button = (label: string, onclick: () => void, o: { disabled?: boolean; primary?: boolean; title?: string } = {}) =>
  h('button', { class: o.primary ? 'primary' : '', disabled: !!o.disabled, title: o.title, onclick }, label);
const hearts = (n: number) => h('span', { class: 'hearts', title: `Happiness ${n}` }, '♥'.repeat(Math.round(n / 20)), h('span', { class: 'dim' }, '♥'.repeat(5 - Math.round(n / 20))));

export class Ui {
  private readonly hud: HTMLElement;
  private readonly bar = { day: h('b'), clock: h('b'), gold: h('b'), earned: h('b'), fill: h('div', { class: 'fill' }) };
  private readonly hotbar = h('div', { class: 'hotbar' });
  private readonly heldName = h('div', { class: 'held' });
  private readonly info = h('div', { class: 'info' });
  private readonly toasts = h('div', { class: 'toasts' });
  private readonly layer = h('div', { class: 'layer' });
  private panel: Panel | null = null;
  private queue: Panel[] = [];
  private hotbarKey = '';
  private grabbed: number | null = null;
  private readonly host: UiHost;

  constructor(root: HTMLElement, host: UiHost) {
    this.host = host;
    const top = h('div', { class: 'top' },
      h('div', { class: 'card stats' },
        h('div', null, 'Day ', this.bar.day, ' · ', this.bar.clock),
        h('div', null, this.bar.gold),
        h('div', { class: 'target', title: 'Total earned this season (bronze 10,000g, silver 20,000g, gold 35,000g)' },
          h('div', { class: 'track' }, this.bar.fill, ...TIERS.map((t) => h('i', { style: `left:${t.earned / 35_000 * 100}%`, title: t.name }))),
          h('div', { class: 'label' }, this.bar.earned)),
      ),
      h('div', { class: 'buttons' },
        button('⟲', () => host.turn(-1), { title: 'Turn the view (Q)' }),
        button('⟳', () => host.turn(1), { title: 'Turn the view (E)' }),
        button('⌕', () => host.zoom(), { title: 'Zoom (Z or the wheel)' }),
        button('☰', () => this.openMenu(), { title: 'Menu (Esc)' })),
    );
    const bottom = h('div', { class: 'bottom' },
      this.info,
      h('div', { class: 'centre' }, this.heldName, this.hotbar),
      h('div', { class: 'buttons right' },
        button('Backpack', () => this.openBackpack(), { title: 'Backpack (B)' }),
        button('End day', () => this.confirmEndDay(), { title: 'Go to bed (or click the farmhouse)' })),
    );
    this.hud = h('div', { class: 'hud' }, top, bottom, this.toasts);
    root.append(this.hud, this.layer);
  }

  /** A menu is open: the clock stops and the farm ignores clicks. */
  get busy() { return !!this.panel; }
  get panelName() { return this.panel?.name ?? null; }

  /** Updates the HUD from the state; call every frame (it touches the page only when something changed). */
  update() {
    const s = this.host.state();
    set(this.bar.day, s.clock.day > SEASON_DAYS ? `${s.clock.day} (free play)` : `${s.clock.day} / ${SEASON_DAYS}`);
    set(this.bar.clock, hourLabel(hourOfDay(s.clock)));
    set(this.bar.gold, gold(s.gold));
    set(this.bar.earned, `${gold(s.earned).slice(0, -1)} / ${gold(TARGET)} earned`);
    this.bar.fill.style.width = `${Math.min(100, s.earned / 35_000 * 100)}%`;
    const key = JSON.stringify([s.inventory, s.selected, this.grabbed]);
    if (key !== this.hotbarKey) {
      this.hotbarKey = key;
      this.hotbar.replaceChildren(...s.inventory.slice(0, HOTBAR).map((st, i) => this.slot(st, i, () => { s.selected = i; this.hotbarKey = ''; })));
      const held = s.inventory[s.selected];
      set(this.heldName, held ? stackName(held) : 'Empty hand');
    }
  }

  private slot(st: Stack | null, i: number, onclick: () => void) {
    const s = this.host.state();
    return h('button', { class: `slot${i === s.selected && i < HOTBAR ? ' selected' : ''}${i === this.grabbed ? ' grabbed' : ''}`, title: st ? `${stackName(st)}: ${ITEMS[st.item].hint}` : '', onclick },
      i < HOTBAR ? h('span', { class: 'key' }, String((i + 1) % 10)) : null,
      st ? icon(st.item, st.quality) : null,
      st && st.count > 1 ? h('span', { class: 'count' }, String(st.count)) : null);
  }

  /** What is under the pointer, or null. */
  setInfo(text: string | null) {
    set(this.info, text ?? '');
    this.info.style.visibility = text ? 'visible' : 'hidden';
  }

  toast(r: Result | string) {
    const msg = typeof r === 'string' ? r : r.message, good = typeof r === 'string' || r.ok;
    const t = h('div', { class: `toast${good ? '' : ' bad'}` }, msg);
    this.toasts.append(t);
    while (this.toasts.children.length > 4) this.toasts.firstChild!.remove();
    setTimeout(() => t.classList.add('gone'), 1800);
    setTimeout(() => t.remove(), 2400);
  }

  // ---- Menus ----

  private open(p: Panel) {
    if (this.panel?.modal) { this.queue.push(p); return; }
    this.closePanel(false);
    this.panel = p;
    this.refresh();
  }

  /** Redraws the open menu (after the state changed). */
  refresh() {
    if (!this.panel) { this.layer.replaceChildren(); this.layer.classList.remove('open'); return; }
    const p = this.panel;
    const close = p.modal ? null : h('button', { class: 'close', title: 'Close (Esc)', onclick: () => this.close() }, '✕');
    const card = h('div', { class: `panel ${p.name}`, onclick: (e: Event) => e.stopPropagation() }, close, p.render());
    this.layer.replaceChildren(card);
    this.layer.classList.add('open');
    this.layer.onclick = () => { if (!p.modal) this.close(); };
  }

  /** Closes the menu (Esc, the close button, a click outside). Modal ones (summary, results) close only through their button. */
  close() {
    if (this.grabbed !== null) { this.grabbed = null; this.refresh(); return; }
    if (this.panel?.modal) return;
    this.closePanel(true);
  }

  private closePanel(next: boolean) {
    const p = this.panel;
    this.panel = null;
    this.grabbed = null;
    p?.onClose?.();
    if (next && this.queue.length) { this.open(this.queue.shift()!); return; }
    this.refresh();
  }

  private act(r: Result) {
    this.toast(r);
    this.host.changed();
    this.refresh();
  }

  openShop() {
    this.open({ name: 'shop', render: () => {
      const s = this.host.state();
      const row = (id: ItemId) => {
        const d = ITEMS[id], price = d.buy!, bulk = d.kind === 'seed' || id === 'feed';
        return h('div', { class: 'row' }, icon(id), h('div', { class: 'grow' }, h('b', null, d.name), h('small', null, d.hint)),
          h('span', { class: 'price' }, gold(price)),
          button('Buy', () => this.act(buy(s, id)), { disabled: s.gold < price }),
          bulk ? button('×10', () => this.act(buy(s, id, 10)), { disabled: s.gold < price * 10 }) : null);
      };
      const n = s.coop.chickens.length;
      return h('div', null, h('h2', null, 'Shop'), h('p', { class: 'sub' }, `You have ${gold(s.gold)}.`),
        ...SHOP_ITEMS.map(row),
        h('div', { class: 'row' }, h('span', { class: 'icon emoji' }, '🐔'), h('div', { class: 'grow' }, h('b', null, 'Chicken'), h('small', null, `Lives in the coop (${n}/${MAX_CHICKENS}). Lays an egg a day when fed.`)),
          h('span', { class: 'price' }, gold(CHICKEN_PRICE)),
          button('Buy', () => this.act(buyChicken(s)), { disabled: s.gold < CHICKEN_PRICE || n >= MAX_CHICKENS })));
    } });
  }

  openBin() {
    this.open({ name: 'bin', render: () => {
      const s = this.host.state();
      const sellable = s.inventory.map((st, i) => [st, i] as const).filter(([st]) => st && canSell(st.item)) as [Stack, number][];
      return h('div', null, h('h2', null, 'Shipping bin'),
        h('p', { class: 'sub' }, 'Everything in the bin is sold overnight.'),
        h('h3', null, `In the bin: ${gold(binValue(s.bin))}`),
        s.bin.length ? null : h('p', { class: 'empty' }, 'Empty.'),
        ...s.bin.map((b, i) => h('div', { class: 'row' }, icon(b.item, b.quality), h('div', { class: 'grow' }, `${b.count} × ${stackName(b)}`),
          h('span', { class: 'price' }, gold(sellPrice(b.item, b.quality) * b.count)), button('Take back', () => this.act(unship(s, i))))),
        h('h3', null, 'Your things'),
        sellable.length ? null : h('p', { class: 'empty' }, 'Nothing to sell yet.'),
        ...sellable.map(([st, i]) => h('div', { class: 'row' }, icon(st.item, st.quality), h('div', { class: 'grow' }, `${st.count} × ${stackName(st)}`),
          h('span', { class: 'price' }, `${gold(sellPrice(st.item, st.quality))} each`),
          button('Ship 1', () => this.act(ship(s, i, 1))), button('Ship all', () => this.act(ship(s, i, st.count)), { primary: true }))));
    } });
  }

  openCoop() {
    this.open({ name: 'coop', render: () => {
      const s = this.host.state(), c = s.coop, feed = countItem(s, 'feed'), scraps = countItem(s, 'scraps');
      const n = c.chickens.length;
      return h('div', null, h('h2', null, 'Coop'),
        h('p', { class: 'sub' }, `Each chicken eats one from the trough every night. Fed chickens lay an egg and leave manure.`),
        h('div', { class: 'row' }, icon('feed'), h('div', { class: 'grow' }, h('b', null, `Trough: ${c.trough}`), h('small', null, c.trough >= n ? `Enough for ${Math.floor(c.trough / Math.max(1, n))} night(s).` : `Not enough for tonight: ${n} chickens.`)),
          button(`Feed ×1 (${feed})`, () => this.act(fillTrough(s, 'feed', 1)), { disabled: !feed }),
          button('All feed', () => this.act(fillTrough(s, 'feed', feed)), { disabled: !feed }),
          button(`Scraps (${scraps})`, () => this.act(fillTrough(s, 'scraps', scraps)), { disabled: !scraps })),
        h('div', { class: 'row' }, icon('egg'), h('div', { class: 'grow' }, h('b', null, `Eggs waiting: ${c.eggs.length}`)),
          button('Collect', () => this.act(collectEggs(s)), { disabled: !c.eggs.length, primary: true })),
        h('div', { class: 'row' }, icon('manure'), h('div', { class: 'grow' }, h('b', null, `Manure: ${c.manure}`), h('small', null, 'A clean coop makes happy chickens. Use it on the field: +25 fertility.')),
          button('Collect', () => this.act(collectManure(s)), { disabled: !c.manure })),
        h('div', { class: 'row' }, h('span', { class: 'icon emoji' }, c.doorOpen ? '🚪' : '🔒'), h('div', { class: 'grow' }, h('b', null, `Door: ${c.doorOpen ? 'open' : 'closed'}`), h('small', null, 'Chickens like to go outside each day. It closes at night.')),
          button(c.doorOpen ? 'Close' : 'Open', () => this.act(toggleDoor(s)))),
        h('h3', null, `Chickens (${n}/${MAX_CHICKENS})`),
        ...c.chickens.map((ch) => h('div', { class: 'row' }, h('span', { class: 'icon emoji' }, '🐔'), h('div', { class: 'grow' }, h('b', null, ch.name), ' ', hearts(ch.happiness)),
          button(ch.pettedToday ? 'Petted' : 'Pet', () => this.act(petChicken(s, ch.id)), { disabled: ch.pettedToday }))));
    } });
  }

  openMachine(id: number) {
    this.open({ name: 'machine', render: () => {
      const s = this.host.state(), m = s.machines.find((x) => x.id === id);
      if (!m) return h('div', null, 'Gone.');
      let status: HTMLElement;
      if (m.batch && isReady(m)) {
        const r = recipe(m.batch.recipe);
        status = h('div', { class: 'row ready' }, icon(r.output, m.batch.quality), h('div', { class: 'grow' }, h('b', null, `${stackName({ item: r.output, quality: m.batch.quality })} is ready!`)),
          button('Collect', () => this.act(collect(s, m) ? { ok: true, message: `+1 ${ITEMS[r.output].name.toLowerCase()}` } : { ok: false, message: 'The backpack is full.' }), { primary: true }));
      } else if (m.batch && isRunning(m)) {
        const r = recipe(m.batch.recipe), left = m.batch.hoursLeft;
        status = h('div', { class: 'row' }, icon(r.output, m.batch.quality), h('div', { class: 'grow' }, h('b', null, `Making ${ITEMS[r.output].name.toLowerCase()}`),
          h('small', null, `${left >= 1 ? `${Math.ceil(left)} hour${Math.ceil(left) > 1 ? 's' : ''}` : 'under an hour'} left.`)),
          h('div', { class: 'progress' }, h('div', { style: `width:${(1 - left / r.hours) * 100}%` })));
      } else status = h('p', { class: 'sub' }, 'Idle. Pick a recipe: it uses the best quality you carry. Output quality is the average of the inputs.');
      return h('div', null, h('h2', null, MACHINE_NAMES[m.kind]), status, h('h3', null, 'Recipes'),
        ...recipesFor(m.kind).map((r) => h('div', { class: 'row' },
          h('div', { class: 'recipe' }, ...r.inputs.flatMap((item, i) => [i ? h('span', { class: 'op' }, '+') : null, icon(item)]), h('span', { class: 'op' }, '→'), icon(r.output)),
          h('div', { class: 'grow' }, h('b', null, ITEMS[r.output].name), h('small', null, `${r.hours} hours · you have ${r.inputs.map((i) => `${countItem(s, i)} ${ITEMS[i].name.toLowerCase()}`).join(', ')}`)),
          button('Start', () => this.act(startRecipe(s, m, r) ? { ok: true, message: `The ${MACHINE_NAMES[m.kind].toLowerCase()} is making ${ITEMS[r.output].name.toLowerCase()}.` } : { ok: false, message: 'Missing ingredients.' }),
            { disabled: !canStart(s, m, r), primary: true }))));
    } });
  }

  openBackpack() {
    if (this.panel?.name === 'backpack') { this.close(); return; }
    this.open({ name: 'backpack', render: () => {
      const s = this.host.state();
      const grid = (from: number, to: number) => h('div', { class: 'grid' }, ...s.inventory.slice(from, to).map((st, j) => this.slot(st, from + j, () => {
        const i = from + j;
        if (this.grabbed === null) { if (st) this.grabbed = i; }
        else { moveSlot(s, this.grabbed, i); this.grabbed = null; this.host.changed(); }
        this.refresh();
      })));
      return h('div', null, h('h2', null, 'Backpack'), h('p', { class: 'sub' }, 'Click a slot, then another, to move or swap. The top row is the hotbar (keys 1-0).'),
        grid(0, HOTBAR), h('div', { class: 'gap' }), grid(HOTBAR, HOTBAR + BACKPACK));
    } });
  }

  confirmEndDay() {
    const s = this.host.state();
    this.open({ name: 'confirm', render: () => h('div', null, h('h2', null, 'End the day?'),
      h('p', { class: 'sub' }, `It's ${hourLabel(hourOfDay(s.clock))}. Overnight: watered crops grow, chickens eat and lay, and the bin pays ${gold(binValue(s.bin))}.`),
      h('div', { class: 'actions' }, button('Not yet', () => this.close()), button('Sleep', () => { this.closePanel(false); this.host.endDay(); }, { primary: true }))) });
  }

  showSummary(sum: Summary) {
    this.open({ name: 'summary', modal: true, render: () => {
      const s = this.host.state(), notes: string[] = [];
      if (sum.passedOut) notes.push('You stayed up past 2 AM and slept in until 9 AM.');
      if (sum.cropsGrown) notes.push(`${sum.cropsGrown} crop${sum.cropsGrown > 1 ? 's' : ''} grew${sum.cropsRipe ? `, ${sum.cropsRipe} ripe` : ''}.`);
      if (sum.eggsLaid) notes.push(`${sum.eggsLaid} egg${sum.eggsLaid > 1 ? 's' : ''} laid.`);
      if (sum.hungry.length) notes.push(`Hungry: ${sum.hungry.join(', ')}. Fill the trough!`);
      const days = SEASON_DAYS - sum.day;
      return h('div', null, h('h2', null, `Day ${sum.day} is over`),
        sum.sales.length ? h('div', { class: 'sales' }, ...sum.sales.map((sale) => h('div', { class: 'row' }, icon(sale.item, sale.quality), h('div', { class: 'grow' }, describeSale(sale)), h('span', { class: 'price' }, gold(sale.gold)))))
          : h('p', { class: 'empty' }, 'Nothing was shipped.'),
        h('div', { class: 'earned' }, 'Earned today ', h('b', null, gold(sum.earned))),
        h('div', { class: 'target big' }, h('div', { class: 'track' }, h('div', { class: 'fill', style: `width:${Math.min(100, s.earned / 35_000 * 100)}%` }), ...TIERS.map((t) => h('i', { style: `left:${t.earned / 35_000 * 100}%` }))),
          h('div', { class: 'label' }, `${gold(s.earned)} of ${gold(TARGET)}${days > 0 ? ` · ${days} day${days > 1 ? 's' : ''} left` : ''}`)),
        notes.length ? h('ul', { class: 'notes' }, ...notes.map((n) => h('li', null, n))) : null,
        h('div', { class: 'actions' }, button(sum.seasonEnded ? 'See the results' : `Good morning, day ${sum.day + 1}`, () => {
          this.panel = null;
          if (sum.seasonEnded) this.showResults(); else this.closePanel(true);
        }, { primary: true })));
    } });
  }

  showResults() {
    this.open({ name: 'results', modal: true, render: () => {
      const s = this.host.state(), r = seasonResults(s);
      const next = TIERS.find((t) => r.earned < t.earned);
      return h('div', null, h('h2', null, 'The season is over'),
        h('div', { class: `medal ${r.tier?.toLowerCase() ?? 'none'}` }, r.tier ? `${r.tier}` : 'No medal'),
        h('p', { class: 'sub' }, `You earned ${gold(r.earned)} in ${SEASON_DAYS} days.${r.earned >= TARGET ? ' You reached the goal!' : ` The goal was ${gold(TARGET)}.`}${next ? ` ${next.name} needs ${gold(next.earned)}.` : ''}`),
        r.bestDay ? h('p', null, `Best day: day ${r.bestDay.day}, ${gold(r.bestDay.earned)}.`) : null,
        h('h3', null, 'Sold'),
        ...r.sold.map((x) => h('div', { class: 'row' }, icon(x.item), h('div', { class: 'grow' }, `${x.count} × ${ITEMS[x.item].name}`), h('span', { class: 'price' }, gold(x.gold)))),
        h('div', { class: 'actions' }, button('New game', () => { this.panel = null; this.host.newGame(); }), button('Keep farming', () => { this.panel = null; this.closePanel(true); }, { primary: true })));
    } });
  }

  openMenu() {
    if (this.panel?.name === 'menu') { this.close(); return; }
    this.open({ name: 'menu', render: () => h('div', null, h('h2', null, 'Soil n Silo'), help(),
      h('div', { class: 'actions' }, button('New game', () => this.confirmNewGame()), button('Resume', () => this.close(), { primary: true }))) });
  }

  showWelcome() {
    this.open({ name: 'menu', render: () => h('div', null, h('h2', null, 'Welcome to Soil n Silo'),
      h('p', { class: 'sub' }, `One season, ${SEASON_DAYS} days: earn ${gold(TARGET)} by growing crops, raising chickens and baking.`), help(),
      h('div', { class: 'actions' }, button('Start farming', () => this.close(), { primary: true }))) });
  }

  private confirmNewGame() {
    this.open({ name: 'confirm', render: () => h('div', null, h('h2', null, 'Start a new game?'), h('p', { class: 'sub' }, 'This farm will be lost.'),
      h('div', { class: 'actions' }, button('Cancel', () => this.close()), button('New game', () => { this.closePanel(false); this.host.newGame(); }, { primary: true }))) });
  }
}

function help() {
  return h('ul', { class: 'help' },
    h('li', null, h('b', null, 'Click'), ' a field tile to use what is in hand: the hoe tills, the can waters, seeds plant, manure fertilizes. Ripe crops are harvested with a click.'),
    h('li', null, h('b', null, 'Click'), ' things to use them: the shop, the shipping bin, the coop and its door, chickens (pet them), eggs, manure, machines, and the farmhouse (sleep).'),
    h('li', null, 'Crops grow one stage per watered day. Richer soil (darker) gives better quality; harvests drain it, manure and rest restore it.'),
    h('li', null, 'Buy a mill and an oven: wheat → flour, flour + egg → bread, flour + egg + pumpkin → pumpkin pie.'),
    h('li', null, h('b', null, 'Drag'), ' to pan · ', h('b', null, 'Q E'), ' turn · ', h('b', null, 'wheel / Z'), ' zoom · ', h('b', null, '1-0'), ' hotbar · ', h('b', null, 'B'), ' backpack · ', h('b', null, 'T'), ' skip an hour · ', h('b', null, 'Esc'), ' menu'),
  );
}

function set(el: HTMLElement, text: string) {
  if (el.textContent !== text) el.textContent = text;
}
