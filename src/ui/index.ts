// The HTML over the canvas (docs/DESIGN.md, "Minimal HUD"): the valley postcard and its three seals top left, the sky
// strip (the day and hour, the camera's turns, its orbit or snapped setting and the power view's bolt, with the power pill
// under it while the power view is on or the lights are out) top right, the tool strip with its Supplies counter and its
// readout at the bottom, the building card beside a clicked thing (the Garage's with its carts), and soft toasts. Two quiet
// panels stay hidden until asked for (panels.ts): the Valleys panel beside the postcard and the Settings popover under the
// sky strip; Esc or a click outside closes them. The valley
// is what you look at: the overlay lets every pointer event through except on its own floating pills.
//
// The UI knows nothing of the world or the renderer. The loop hands it a `UiSnapshot` (every frame is fine: it only touches
// what changed) and it answers through `UiCallbacks`. It also takes the tool keys (V; 1–7 the homestead, ⇧1–⇧5 the power;
// F, B, X, C, T, H, G, ⇧C, ⇧X the land), Esc (close the card, else put the tool down) and Delete (remove the selected
// thing, unless it's fixed), unless a key handler that ran first called `preventDefault`.
import './style.css';
import { createBrief } from './brief.ts';
import { el } from './dom.ts';
import { createSettingsPanel, createValleysPanel } from './panels.ts';
import { createRing } from './ring.ts';
import { createSkyStrip } from './skystrip.ts';
import { createToasts } from './toast.ts';
import { createToolStrip } from './toolstrip.ts';
import { keyOf, toolForKey } from './tools.ts';
import type { UiCallbacks, UiController, UiSnapshot } from './types.ts';

export type {
  CartControls, LandTool, LiveWeatherView, PlaceTool, ProceduralRequest, SelectedThingView, Speed, SuppliesView, ToolId, ToolReadout,
  UiCallbacks, UiController, UiQuality, UiSettings, UiSnapshot, ValleyStats, Weather, YawMode,
} from './types.ts';
export { suppliesView } from './supplies.ts';
export { SPEEDS, WEATHERS } from './types.ts';
export { placedKind, placeTool, toolDef } from './tools.ts';
export { valleyName } from './brief.ts';
export { mountLoading, type Loading } from './loading.ts';

export interface UiOptions {
  /** Take the tool keys, Esc and Delete (default true). */
  keyboard?: boolean;
}

/** Builds the overlay in `root` (the page's #ui) and returns its controller. */
export function createUi(root: HTMLElement, callbacks: UiCallbacks, options: UiOptions = {}): UiController {
  let last: UiSnapshot | null = null;

  const toasts = createToasts();
  const strip = createToolStrip(callbacks, (m) => toasts.show(m, 'info'));
  const brief = createBrief(callbacks, () => { settings.close(); valleys.toggle(); });
  const sky = createSkyStrip(callbacks, () => { valleys.close(); settings.toggle(); });
  const valleys = createValleysPanel(callbacks, () => [brief.valleysButton]);
  const settings = createSettingsPanel(callbacks, () => [sky.settingsButton]);
  const ring = createRing(root, callbacks, (m) => toasts.show(m, 'info'));

  const right = el('div', 'ui-corner-right');
  right.append(sky.element, sky.balance, settings.element);
  root.classList.add('ui-root');
  root.replaceChildren(brief.element, valleys.element, right, toasts.element, ring.element, strip.element);

  function onKey(e: KeyboardEvent): void {
    const s = last;
    if (!s || e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select') !== null)) return;
    const key = e.key.toLowerCase();
    if (key === 'escape') {
      if (s.selected) callbacks.onDeselect();
      else if (s.activeTool !== 'select') callbacks.onSelectTool('select');
      else return;
      e.preventDefault();
      return;
    }
    if ((key === 'delete' || key === 'backspace') && s.selected && s.selected.immovable !== true) {
      callbacks.onRemoveSelected(s.selected.id);
      e.preventDefault();
      return;
    }
    const def = toolForKey(keyOf(e), e.shiftKey);
    if (def) {
      strip.choose(def.id);
      e.preventDefault();
    }
  }
  const keyboard = options.keyboard ?? true;
  if (keyboard) window.addEventListener('keydown', onKey);

  return {
    render(snapshot) {
      last = snapshot;
      brief.render(snapshot);
      sky.render(snapshot);
      valleys.render(snapshot);
      settings.render(snapshot);
      strip.render(snapshot);
      ring.render(snapshot.selected);
    },
    updateRingPosition(x, y, visible) { ring.updatePosition(x, y, visible); },
    showToast(message, tone = 'info') { toasts.show(message, tone); },
    dispose() {
      if (keyboard) window.removeEventListener('keydown', onKey);
      valleys.dispose();
      settings.dispose();
      toasts.dispose();
      root.replaceChildren();
      root.classList.remove('ui-root');
    },
  };
}
