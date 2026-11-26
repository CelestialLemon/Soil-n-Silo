// The two quiet panels that stay hidden until asked for (docs/DESIGN.md, "Minimal HUD and In-World Readability"): the
// Valleys panel beside the postcard (its Valleys button) and the Settings popover under the sky strip (its gear). Each
// closes on Esc, on a click anywhere outside it, or on its own button again.
//
// The Valleys panel has two tabs: Campaign, the six curated valleys (each its season and landform, one line about it, its
// Supplies cap and Play), and Custom, a fresh procedural valley from a season, a landform, a difficulty and a seed, or a
// Sandbox one (unlimited Supplies and free weather). Its foot holds the saves: Save, Load, Export and Import a `.json`.
// Anything that would clear a homestead with work in it asks first, in one line at the panel's foot.
//
// The Settings popover: sound on or off and its volume, the graphics quality, and the storm flashes (off for players
// sensitive to flashing light).
import {
  CAMPAIGN_VALLEYS, type Difficulty, DIFFICULTIES, SEASONS, type Season, TERRAIN_STYLES, type TerrainStyle,
} from '../game/index.ts';
import { button, el, setFlag, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon } from './icons.ts';
import type { UiCallbacks, UiQuality, UiSettings, UiSnapshot } from './types.ts';

export const SEASON_LABEL: Record<Season, string> = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
export const TERRAIN_LABEL: Record<TerrainStyle, string> = {
  meadow: 'Meadow', terrace: 'Terrace', floodplain: 'Floodplain', ridge: 'Ridge', slope: 'Slope', glen: 'Glen',
};
const DIFFICULTY_LABEL: Record<Difficulty, string> = { relaxed: 'Relaxed', standard: 'Standard', tight: 'Tight' };
const QUALITIES: readonly UiQuality[] = ['low', 'medium', 'high'];
const QUALITY_LABEL: Record<UiQuality, string> = { low: 'Low', medium: 'Medium', high: 'High' };

/** Settings to show while the snapshot leaves them out. */
const DEFAULT_SETTINGS: UiSettings = { sound: true, volume: 0.8, quality: 'high', flashes: true };

/** The largest seed a valley takes. */
const MAX_SEED = 0x7fffffff;
/** A fresh seed for a new valley. */
export const rollSeed = (): number => Math.floor(Math.random() * MAX_SEED);

/** Whether a valley has the player's work in it, so clearing it should ask first. */
export const hasWork = (s: UiSnapshot): boolean => s.stats.landEditCount > 0;

export interface Panel {
  element: HTMLElement;
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
  render(s: UiSnapshot): void;
  dispose(): void;
}

/**
 * The open and close behaviour both panels share: hidden until opened; Esc or a press outside it (and outside its own
 * buttons, `owners`) closes it.
 */
function popover(element: HTMLElement, owners: () => readonly Element[], onChange: (open: boolean) => void) {
  let isOpen = false;
  element.hidden = true;

  function onKey(e: KeyboardEvent): void {
    if (e.key !== 'Escape' || !isOpen) return;
    e.preventDefault();
    e.stopPropagation();
    close();
  }
  function onPointer(e: PointerEvent): void {
    const t = e.target;
    if (!(t instanceof Node) || element.contains(t) || owners().some((o) => o.contains(t))) return;
    close();
  }
  function open(): void {
    if (isOpen) return;
    isOpen = true;
    element.hidden = false;
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onPointer, true);
    onChange(true);
  }
  function close(): void {
    if (!isOpen) return;
    isOpen = false;
    element.hidden = true;
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('pointerdown', onPointer, true);
    onChange(false);
  }
  return { get isOpen() { return isOpen; }, open, close, toggle: () => (isOpen ? close() : open()) };
}

/** A row of pills, one pressed: the Custom tab's season, landform and difficulty, and the popover's choices. */
function pills<T extends string>(cls: string, label: string, values: readonly T[], name: (v: T) => string, onPick: (v: T) => void) {
  const group = el('div', `ui-seg ${cls}`);
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', label);
  const btns = new Map<T, HTMLButtonElement>();
  for (const v of values) {
    const b = button(`ui-seg-btn ui-pill-${v}`, name(v), () => onPick(v));
    b.textContent = name(v);
    btns.set(v, b);
    group.append(b);
  }
  return { element: group, paint(on: T) { for (const [v, b] of btns) setPressed(b, v === on); } };
}

function field(label: string, control: HTMLElement): HTMLElement {
  const row = el('div', 'ui-field');
  row.append(el('span', 'ui-field-label', label), control);
  return row;
}

/** The Valleys panel. `owners` are the buttons that open it (outside presses on them don't count as "outside"). */
export function createValleysPanel(cb: UiCallbacks, owners: () => readonly Element[]): Panel {
  let last: UiSnapshot | null = null;
  let tab: 'campaign' | 'custom' = 'campaign';
  /** A choice waiting for a yes, when it would clear a homestead with work in it. */
  let pending: { text: string; yes: string; run: () => void } | null = null;
  const custom = { seed: rollSeed(), season: 'spring' as Season, terrain: 'meadow' as TerrainStyle, difficulty: 'standard' as Difficulty, sandbox: false };

  const panel = el('section', 'ui-panel ui-valleys ui-float');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Valleys');

  const head = el('header', 'ui-panel-head');
  const title = el('h2', 'ui-panel-title', 'Valleys');
  const closeBtn = button('ui-icon-btn', 'Close', () => pop.close());
  closeBtn.append(icon('close'));
  head.append(title, closeBtn);

  // The tabs.
  const tabs = el('div', 'ui-seg ui-panel-tabs');
  tabs.setAttribute('role', 'tablist');
  const campaignTab = button('ui-seg-btn', 'The campaign: six curated valleys', () => { tab = 'campaign'; paint(); });
  campaignTab.textContent = 'Campaign';
  const customTab = button('ui-seg-btn', 'A fresh valley of your own, or a Sandbox', () => { tab = 'custom'; paint(); });
  customTab.textContent = 'Custom & Sandbox';
  for (const t of [campaignTab, customTab]) t.setAttribute('role', 'tab');
  tabs.append(campaignTab, customTab);

  // Campaign: one row per valley.
  const list = el('ol', 'ui-valley-list');
  const rows = CAMPAIGN_VALLEYS.map((v) => {
    const item = el('li', 'ui-valley');
    const text = el('div', 'ui-valley-text');
    const name = el('strong', 'ui-valley-name', v.title);
    const tags = el('div', 'ui-valley-tags');
    const badge = el('span', 'ui-valley-badge', 'Playing');
    tags.append(
      el('span', `ui-tag ui-tag-${v.season}`, SEASON_LABEL[v.season]),
      el('span', 'ui-tag', TERRAIN_LABEL[v.terrain]),
      el('span', 'ui-tag ui-tag-cap', `${v.suppliesCap} Supplies`),
      badge,
    );
    text.append(name, tags, el('p', 'ui-valley-tagline', v.tagline));
    const play = button('ui-chip is-strong ui-valley-play', `Play ${v.title}`, () => {
      ask(`Start ${v.title}? This homestead will be cleared.`, 'Start afresh', () => cb.onStartCampaign?.(v.id));
    });
    play.textContent = 'Play';
    item.append(text, play);
    list.append(item);
    return { id: v.id, item, badge, play };
  });

  // Custom & Sandbox.
  const form = el('div', 'ui-custom');
  const seasonPills = pills('ui-custom-seasons', 'Season', SEASONS, (s) => SEASON_LABEL[s], (s) => { custom.season = s; paint(); });
  const terrainPills = pills('ui-custom-terrain', 'Landform', TERRAIN_STYLES, (t) => TERRAIN_LABEL[t], (t) => { custom.terrain = t; paint(); });
  const difficultyPills = pills('ui-custom-difficulty', 'Difficulty', DIFFICULTIES, (d) => DIFFICULTY_LABEL[d], (d) => { custom.difficulty = d; paint(); });

  const seedRow = el('div', 'ui-seed');
  const seedInput = el('input', 'ui-seed-input');
  seedInput.type = 'text';
  seedInput.inputMode = 'numeric';
  seedInput.autocomplete = 'off';
  seedInput.spellcheck = false;
  seedInput.setAttribute('aria-label', 'Seed');
  seedInput.addEventListener('input', () => paint());
  const reroll = button('ui-icon-btn', 'Roll a fresh seed', () => { seedInput.value = String(rollSeed()); paint(); });
  reroll.append(icon('dice'));
  seedRow.append(seedInput, reroll);
  seedInput.value = String(custom.seed);

  const sandboxRow = el('label', 'ui-check');
  const sandboxBox = el('input');
  sandboxBox.type = 'checkbox';
  sandboxBox.addEventListener('change', () => { custom.sandbox = sandboxBox.checked; paint(); });
  const sandboxText = el('span', 'ui-check-text');
  sandboxText.append(el('strong', '', 'Sandbox mode'), el('span', 'ui-check-hint', 'Unlimited Supplies & free weather'));
  sandboxRow.append(sandboxBox, sandboxText);

  const start = button('ui-chip is-strong ui-custom-start', 'Start a fresh valley', () => {
    const seed = parseSeed(seedInput.value);
    if (seed === null) return;
    const req = { seed, season: custom.season, terrain: custom.terrain, difficulty: custom.difficulty, sandbox: custom.sandbox };
    const what = req.sandbox ? 'a Sandbox valley' : `a ${SEASON_LABEL[req.season].toLowerCase()} ${TERRAIN_LABEL[req.terrain].toLowerCase()}`;
    ask(`Start ${what}? This homestead will be cleared.`, 'Start afresh', () => {
      if (cb.onStartProcedural) cb.onStartProcedural(req);
      else cb.onNewValley(req.seed, req.season);
    });
  });
  start.textContent = 'Start valley';

  form.append(
    field('Season', seasonPills.element),
    field('Landform', terrainPills.element),
    field('Difficulty', difficultyPills.element),
    field('Seed', seedRow),
    sandboxRow,
    start,
  );

  // The saves.
  const saves = el('div', 'ui-saves');
  const save = button('ui-chip', 'Save the game now', () => cb.onSaveGame?.());
  save.append(icon('save'), el('span', '', 'Save'));
  const loadText = el('span', '', 'Load');
  const load = button('ui-chip', 'Load the saved game', () => {
    if (last?.hasSavedGame !== true) return;
    ask('Load the saved game? This homestead will be replaced.', 'Load', () => cb.onLoadGame?.());
  });
  load.append(icon('load'), loadText);
  const exportBtn = button('ui-icon-btn ui-saves-btn', 'Export the game as a .json file', () => cb.onExportSave?.());
  exportBtn.append(icon('download'));
  const file = el('input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.hidden = true;
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    file.value = '';
    if (!f) return;
    void f.text().then((json) => {
      ask(`Load "${f.name}"? This homestead will be replaced.`, 'Load', () => cb.onImportSave?.(json));
    });
  });
  const importBtn = button('ui-icon-btn ui-saves-btn', 'Import a game from a .json file', () => file.click());
  importBtn.append(icon('upload'));
  saves.append(save, load, el('span', 'ui-saves-gap'), exportBtn, importBtn, file);

  const confirm = el('div', 'ui-panel-confirm');
  const confirmText = el('p', 'ui-panel-confirm-text');
  const yes = button('ui-chip is-strong', 'Yes', () => {
    const p = pending;
    pending = null;
    paint();
    if (p) { pop.close(); p.run(); }
  });
  const no = button('ui-chip', 'Keep this valley', () => { pending = null; paint(); });
  no.textContent = 'Keep';
  confirm.append(confirmText, yes, no);

  const body = el('div', 'ui-panel-body');
  body.append(list, form);
  panel.append(head, tabs, body, saves, confirm);

  const pop = popover(panel, owners, (open) => {
    if (open && last) {
      // Open on the valley being played: Custom in a procedural or Sandbox valley, its season and landform to hand.
      if (last.stats.campaignId !== undefined) tab = 'campaign';
      else if (last.stats.sandbox === true) tab = 'custom';
      custom.season = last.stats.season;
      custom.terrain = last.stats.terrain ?? custom.terrain;
      custom.sandbox = last.stats.sandbox === true;
    }
    if (!open) pending = null;
    paint();
  });

  function parseSeed(text: string): number | null {
    const t = text.trim();
    if (!/^\d{1,10}$/.test(t)) return null;
    const n = Number(t);
    return n <= MAX_SEED ? n : null;
  }

  /** Runs a choice that clears the homestead, first asking when it has work in it. */
  function ask(text: string, yesLabel: string, run: () => void): void {
    if (!last || !hasWork(last)) { pop.close(); run(); return; }
    pending = { text, yes: yesLabel, run };
    paint();
  }

  function paint(): void {
    const s = last;
    if (!s || !pop.isOpen) return;
    setPressed(campaignTab, tab === 'campaign');
    setPressed(customTab, tab === 'custom');
    campaignTab.setAttribute('aria-selected', String(tab === 'campaign'));
    customTab.setAttribute('aria-selected', String(tab === 'custom'));
    setHidden(list, tab !== 'campaign');
    setHidden(form, tab !== 'custom');

    const canCampaign = cb.onStartCampaign !== undefined;
    for (const r of rows) {
      const playing = s.stats.campaignId === r.id;
      setFlag(r.item, 'is-active', playing);
      setHidden(r.badge, !playing);
      r.play.disabled = !canCampaign;
      setText(r.play, playing ? 'Restart' : 'Play');
    }

    seasonPills.paint(custom.season);
    terrainPills.paint(custom.terrain);
    difficultyPills.paint(custom.difficulty);
    setFlag(form, 'is-sandbox', custom.sandbox);
    if (sandboxBox.checked !== custom.sandbox) sandboxBox.checked = custom.sandbox;
    const seedOk = parseSeed(seedInput.value) !== null;
    setFlag(seedInput, 'is-bad', !seedOk);
    start.disabled = !seedOk;
    setTitle(start, seedOk ? (custom.sandbox ? 'Start a Sandbox valley' : 'Start a fresh valley') : 'A seed is a whole number');
    setText(start, custom.sandbox ? 'Start sandbox' : 'Start valley');

    setHidden(save, cb.onSaveGame === undefined);
    setHidden(load, cb.onLoadGame === undefined);
    load.disabled = s.hasSavedGame !== true;
    setText(loadText, s.hasSavedGame === true && s.savedAtLabel ? `Load · ${s.savedAtLabel}` : 'Load');
    setTitle(load, s.hasSavedGame === true ? 'Load the saved game' : 'No saved game yet');
    setHidden(exportBtn, cb.onExportSave === undefined);
    setHidden(importBtn, cb.onImportSave === undefined);
    setHidden(saves, pending !== null);
    setHidden(confirm, pending === null);
    if (pending) {
      setText(confirmText, pending.text);
      setText(yes, pending.yes);
      setTitle(yes, pending.yes);
    }
  }

  return {
    element: panel,
    get isOpen() { return pop.isOpen; },
    open: pop.open,
    close: pop.close,
    toggle: pop.toggle,
    render(s) {
      last = s;
      paint();
    },
    dispose: pop.close,
  };
}

/** The Settings popover. `owners` are the buttons that open it. */
export function createSettingsPanel(cb: UiCallbacks, owners: () => readonly Element[]): Panel {
  let shown = '';
  let dragging = false;

  const panel = el('section', 'ui-panel ui-settings ui-float');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Settings');
  const head = el('header', 'ui-panel-head');
  const closeBtn = button('ui-icon-btn', 'Close', () => pop.close());
  closeBtn.append(icon('close'));
  head.append(el('h2', 'ui-panel-title', 'Settings'), closeBtn);

  const update = (patch: Partial<UiSettings>) => cb.onUpdateSettings?.(patch);
  const onOff = (cls: string, label: string, key: 'sound' | 'flashes') =>
    pills<'on' | 'off'>(cls, label, ['on', 'off'], (v) => (v === 'on' ? 'On' : 'Off'), (v) => update({ [key]: v === 'on' }));
  const sound = onOff('ui-settings-sound', 'Sound', 'sound');
  const flashes = onOff('ui-settings-flashes', 'Storm flashes', 'flashes');
  const quality = pills('ui-settings-quality', 'Graphics quality', QUALITIES, (q) => QUALITY_LABEL[q], (q) => update({ quality: q }));

  const volumeRow = el('div', 'ui-volume');
  const volume = el('input', 'ui-range');
  volume.type = 'range';
  volume.min = '0';
  volume.max = '100';
  volume.step = '1';
  volume.setAttribute('aria-label', 'Volume');
  const volumeText = el('span', 'ui-volume-text');
  volume.addEventListener('pointerdown', () => { dragging = true; });
  volume.addEventListener('pointerup', () => { dragging = false; });
  volume.addEventListener('pointercancel', () => { dragging = false; });
  volume.addEventListener('input', () => {
    const v = Number(volume.value) / 100;
    setText(volumeText, `${volume.value}%`);
    update({ volume: v, ...(v > 0 ? { sound: true } : {}) });
  });
  volumeRow.append(volume, volumeText);

  const body = el('div', 'ui-panel-body ui-settings-body');
  body.append(
    field('Sound', sound.element),
    field('Volume', volumeRow),
    field('Graphics', quality.element),
    field('Storm flashes', flashes.element),
  );
  panel.append(head, body);

  let last: UiSettings = DEFAULT_SETTINGS;
  const pop = popover(panel, owners, () => { shown = ''; paint(); });

  function paint(): void {
    if (!pop.isOpen) return;
    const s = last;
    const key = `${s.sound}|${s.volume.toFixed(3)}|${s.quality}|${s.flashes}`;
    if (key === shown) return;
    shown = key;
    sound.paint(s.sound ? 'on' : 'off');
    flashes.paint(s.flashes ? 'on' : 'off');
    quality.paint(s.quality);
    const pct = Math.round(Math.max(0, Math.min(1, s.volume)) * 100);
    if (!dragging && volume.value !== String(pct)) volume.value = String(pct);
    if (!dragging) setText(volumeText, `${pct}%`);
    setFlag(volumeRow, 'is-muted', !s.sound);
  }

  return {
    element: panel,
    get isOpen() { return pop.isOpen; },
    open: pop.open,
    close: pop.close,
    toggle: pop.toggle,
    render(s) {
      last = s.settings ?? DEFAULT_SETTINGS;
      paint();
    },
    dispose: pop.close,
  };
}
