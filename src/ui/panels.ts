// The two quiet panels that stay hidden until asked for (docs/DESIGN.md, "Minimal HUD and In-World Readability"): the
// Valleys panel beside the postcard (its Valleys button) and the Settings popover under the sky strip (its gear). Each
// closes on Esc, on a click anywhere outside it, or on its own button again. Open, it takes the keyboard's focus (Tab
// and Shift+Tab go round inside it, and the game's shortcuts wait: blocksShortcuts), and gives it back on closing.
//
// The Valleys panel has two tabs: Campaign, the six curated valleys (each its season and landform, one line about it, its
// Supplies cap and Play), and Custom, a fresh procedural valley from a season, a landform, a difficulty and a seed, or a
// Sandbox one (unlimited Supplies and free weather). Its foot holds the saves: Save, Load, Export and Import a `.json`.
// Anything that would clear a homestead with work in it asks first, in one line at the panel's foot.
//
// The Settings popover: sound on or off and its volume, the graphics quality, and the storm flashes (off for players
// sensitive to flashing light).
import {
  CAMPAIGN_VALLEYS, type ClimateCharacter, climatesOf, describeClimate, type Difficulty, DIFFICULTIES, MAX_SAVE_BYTES, SEASONS, type Season, TERRAIN_STYLES, type TerrainStyle,
} from '../game/index.ts';
import { button, el, setFlag, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon } from './icons.ts';
import type { ProceduralRequest, UiCallbacks, UiQuality, UiSettings, UiSnapshot } from './types.ts';

export const SEASON_LABEL: Record<Season, string> = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
export const TERRAIN_LABEL: Record<TerrainStyle, string> = {
  meadow: 'Meadow', terrace: 'Terrace', floodplain: 'Floodplain', ridge: 'Ridge', slope: 'Slope', glen: 'Glen',
};
const CLIMATE_LABEL: Record<ClimateCharacter, string> = {
  mild: 'Mild', wet: 'Wet', dry: 'Dry', hot: 'Hot', gales: 'Gales', stormy: 'Stormy', hard: 'Hard', highRiver: 'Spate',
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
export const hasWork = (s: UiSnapshot): boolean => s.stats.hasProgress;

/** Marks the panels that hold the keyboard while open (the building card doesn't: it's beside the game, not over it). */
const MODAL = 'data-ui-modal';

/**
 * Whether the game's keyboard shortcuts should wait: a panel is open, or the key was pressed inside one (Esc still
 * closes the panel: it hears it first).
 */
export function blocksShortcuts(target: EventTarget | null): boolean {
  if (typeof document !== 'undefined' && document.querySelector(`[${MODAL}]:not([hidden])`) !== null) return true;
  return target instanceof Element && target.closest(`[${MODAL}]`) !== null;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** What Tab can reach inside `root`, in order (only what's shown). */
function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((e) => e.getClientRects().length > 0);
}

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
 * buttons, `owners`) closes it. Opening moves the focus in (to its first control) and keeps Tab inside it; closing hands
 * the focus back to what had it before (the button that opened it), if that's still on the page.
 */
function popover(element: HTMLElement, owners: () => readonly Element[], onChange: (open: boolean) => void) {
  let isOpen = false;
  let opener: Element | null = null;
  element.hidden = true;
  element.tabIndex = -1;
  element.setAttribute(MODAL, '');

  function onKey(e: KeyboardEvent): void {
    if (!isOpen) return;
    if (e.key === 'Tab') { trapTab(e); return; }
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    close();
  }
  /** Tab past the last control comes round to the first, and Shift+Tab before the first to the last. */
  function trapTab(e: KeyboardEvent): void {
    const list = focusables(element), first = list[0], last = list[list.length - 1];
    const at = document.activeElement;
    if (!first || !last) { e.preventDefault(); element.focus(); return; }
    const inside = at instanceof Node && element.contains(at);
    if (e.shiftKey ? !inside || at === first || at === element : !inside || at === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }
  function onPointer(e: PointerEvent): void {
    const t = e.target;
    if (!(t instanceof Node) || element.contains(t) || owners().some((o) => o.contains(t))) return;
    close();
  }
  function open(): void {
    if (isOpen) return;
    isOpen = true;
    opener = document.activeElement;
    element.hidden = false;
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onPointer, true);
    onChange(true);
    (focusables(element)[0] ?? element).focus({ preventScroll: true });
  }
  function close(): void {
    if (!isOpen) return;
    isOpen = false;
    const back = opener;
    opener = null;
    // The focus goes back only if it's still in the panel (a press outside may have put it somewhere of the player's own).
    const had = document.activeElement === document.body || (document.activeElement instanceof Node && element.contains(document.activeElement));
    element.hidden = true;
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('pointerdown', onPointer, true);
    onChange(false);
    if (had && back instanceof HTMLElement && back.isConnected) back.focus({ preventScroll: true });
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

/**
 * The Valleys panel. `owners` are the buttons that open it (outside presses on them don't count as "outside"); `onError`
 * says what went wrong with a file picked to import.
 */
export function createValleysPanel(cb: UiCallbacks, owners: () => readonly Element[], onError?: (message: string) => void): Panel {
  let last: UiSnapshot | null = null;
  let tab: 'campaign' | 'custom' = 'campaign';
  /** The valley the Custom tab's choices were last matched to (a new valley or a load matches them again). */
  let valleyKey = '';
  /** A choice waiting for a yes, when it would clear a homestead with work in it. */
  let pending: { text: string; yes: string; run: () => void } | null = null;
  /** `climate`: the climate the player chose (`?climate=`), offered again until cleared; the valley takes it if its season has it. */
  const custom: { seed: number; season: Season; terrain: TerrainStyle; difficulty: Difficulty; sandbox: boolean; climate?: ClimateCharacter } = {
    seed: rollSeed(), season: 'spring', terrain: 'meadow', difficulty: 'standard', sandbox: false,
  };
  /**
   * Counts the file imports begun: a file read that finishes after another began, after the panel closed, or after another
   * valley came into play is let go (it mustn't ask to replace a valley it wasn't picked over).
   */
  let importSeq = 0;

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

  // The climate the player chose, kept (with a way to let it go): the season's own takes over where the season lacks it.
  const climateRow = el('div', 'ui-custom-climate');
  const climateText = el('span', 'ui-check-hint');
  const climateClear = button('ui-icon-btn', "Let the season pick the climate", () => { delete custom.climate; paint(); });
  climateClear.append(icon('close'));
  climateRow.append(climateText, climateClear);
  const climateField = field('Climate', climateRow);

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
    const req: ProceduralRequest = {
      seed, season: custom.season, terrain: custom.terrain, difficulty: custom.difficulty, sandbox: custom.sandbox,
      ...(custom.climate === undefined ? {} : { climate: custom.climate }),
    };
    const what = req.sandbox ? 'a Sandbox valley' : `a ${SEASON_LABEL[req.season].toLowerCase()} ${TERRAIN_LABEL[req.terrain].toLowerCase()}`;
    ask(`Start ${what}? This homestead will be cleared.`, 'Start afresh', () => {
      if (cb.onStartProcedural) cb.onStartProcedural(req);
      else cb.onNewValley(req.seed, req.season);
    });
  });
  start.textContent = 'Start valley';

  form.append(
    field('Season', seasonPills.element),
    climateField,
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
    const seq = ++importSeq;
    if (!f) return;
    // Too big to be a save: said at once, before reading a byte of it.
    if (f.size > MAX_SAVE_BYTES) { onError?.(`"${f.name}" is too large to be a Soil-n-Silo save.`); return; }
    // Read while the panel stays open on the same valley, or not at all.
    const current = () => seq === importSeq && pop.isOpen;
    f.text().then(
      (json) => { if (current()) ask(`Load "${f.name}"? This homestead will be replaced.`, 'Load', () => cb.onImportSave?.(json)); },
      () => { if (current()) onError?.(`"${f.name}" could not be read.`); },
    );
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
      // Open on the valley being played: Custom in a custom (procedural) or Sandbox valley.
      if (last.stats.campaignId !== undefined) tab = 'campaign';
      else if (last.stats.custom === true || last.stats.sandbox === true) tab = 'custom';
    }
    if (!open) { pending = null; importSeq++; }
    paint();
  });

  /**
   * The Custom tab's choices follow the valley in play, each time a different one starts or is loaded: a custom valley's
   * own season, landform, difficulty, Sandbox and seed, so its Start rolls the same kind again; a campaign valley's season
   * and landform; the seed's own meadow its season and seed.
   */
  function matchValley(s: UiSnapshot): void {
    const v = s.stats;
    const key = [v.seed, v.season, v.terrain ?? '', v.sandbox === true, v.custom === true, v.difficulty ?? '', v.campaignId ?? '',
      v.preferredClimate ?? ''].join('|');
    if (key === valleyKey) return;
    valleyKey = key;
    importSeq++;
    if (v.preferredClimate === undefined) delete custom.climate;
    else custom.climate = v.preferredClimate;
    custom.season = v.season;
    custom.terrain = v.terrain ?? 'meadow';
    custom.sandbox = v.sandbox === true;
    if (v.difficulty !== undefined) custom.difficulty = v.difficulty;
    if (v.campaignId === undefined) {
      custom.seed = v.seed;
      seedInput.value = String(v.seed);
    }
  }

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
    const chosen = custom.climate;
    setHidden(climateField, chosen === undefined);
    if (chosen !== undefined) {
      setText(climateText, climatesOf(custom.season).includes(chosen) ? describeClimate(custom.season, chosen)
        : `${CLIMATE_LABEL[chosen]} isn't a ${SEASON_LABEL[custom.season].toLowerCase()} climate: the season picks (kept for another)`);
    }
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
      matchValley(s);
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
