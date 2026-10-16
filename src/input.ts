// Input: turns the canvas's pointer and wheel events and the window's key events into intents the game answers through
// `InputHost`. It owns the pointer, the press (click, pan or paint a drag) and the held keys; what a click does with the tool
// in hand is the game's to decide.

import { canon } from './keybindings.ts';

/** How far (px) a press moves before it is a drag rather than a click. */
const DRAG_THRESHOLD = 4;
const WHEEL_STEP = 100, PINCH_GAIN = 4;

type Tile = { x: number; y: number };

/** A pointer press: a click until it moves, then a pan, or a paint of the tiles from where it started to where it is. */
export type Press = { id: number; x: number; y: number; button: number; mode: 'click' | 'pan' | 'paint' | 'void'; from: Tile | null; to: Tile | null };

/** What the game gives the input: the tile under a page point, the camera moves and the answers to clicks, drags and keys. */
export interface InputHost {
  tileAt(x: number, y: number): Tile | null;
  /** Whether a primary-button drag from a tile paints (build and remove) rather than pans. */
  paints(): boolean;
  pan(dx: number, dy: number): void;
  /** Zooms by `steps` zoom steps (negative zooms out) towards the page point `at`. */
  zoom(steps: number, at: { x: number; y: number }): void;
  /** Something moved that the hover has to look at again. */
  repick(): void;
  /** A primary click at a page point. */
  click(x: number, y: number): void;
  /** A secondary click: backs out of the tool, else deselects. */
  secondary(): void;
  /** A paint drag was let go from one tile to another. */
  drag(from: Tile, to: Tile): void;
  /** A key was pressed (not into a text field, and not with Ctrl, Meta or Alt); the press's own Escape is already dealt with. */
  key(e: KeyboardEvent): void;
}

export class Input {
  /** Where the pointer is on the page, if it is over the canvas. */
  pointer: { x: number; y: number } | null = null;
  /** When the pointer last moved (ms), for the hover card. */
  movedAt = 0;
  press: Press | null = null;
  /** The key codes held down (a numpad key as its main-keyboard twin, see `canon`). */
  readonly keys = new Set<string>();

  private readonly canvas: HTMLCanvasElement;
  private readonly host: InputHost;

  constructor(canvas: HTMLCanvasElement, host: InputHost) {
    this.canvas = canvas; this.host = host;
    canvas.addEventListener('pointerdown', (e) => {
      if (!e.isPrimary || this.press) return;
      this.pointer = { x: e.clientX, y: e.clientY };
      const t = host.tileAt(e.clientX, e.clientY);
      this.press = { id: e.pointerId, x: e.clientX, y: e.clientY, button: e.button, mode: 'click', from: t, to: t };
      canvas.setPointerCapture(e.pointerId);
      host.repick();
    });
    canvas.addEventListener('pointermove', (e) => {
      const press = this.press;
      if (press && e.pointerId === press.id) {
        const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y) >= DRAG_THRESHOLD;
        if (press.mode === 'click' && moved) {
          const paints = press.button === 0 && !e.shiftKey && host.paints() && press.from;
          press.mode = paints ? 'paint' : 'pan';
          if (press.mode === 'pan') { canvas.style.cursor = 'grabbing'; host.pan(e.clientX - press.x, e.clientY - press.y); }
        } else if (press.mode === 'pan' && this.pointer) host.pan(e.clientX - this.pointer.x, e.clientY - this.pointer.y);
        if (press.mode === 'paint') press.to = host.tileAt(e.clientX, e.clientY) ?? press.to;
      }
      if (e.isPrimary) { this.pointer = { x: e.clientX, y: e.clientY }; host.repick(); this.movedAt = performance.now(); }
    });
    const release = (e: PointerEvent) => this.release(e);
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('pointerleave', (e) => { if (!this.press && e.isPrimary) { this.pointer = null; host.repick(); } });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    // Every WHEEL_STEP of wheel is one zoom step (in proportion), towards the pointer. A trackpad pinch arrives as a wheel
    // with ctrlKey and small deltas, so it counts for more.
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY === 0) return;
      const delta = e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaY * (e.ctrlKey ? PINCH_GAIN : 1) : Math.sign(e.deltaY) * WHEEL_STEP;
      host.zoom(-delta / WHEEL_STEP, { x: e.clientX, y: e.clientY });
    }, { passive: false });

    addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT') return;
      this.keys.add(canon(e.code));
      if (e.code === 'Escape' && this.press?.mode === 'paint') { this.press.mode = 'void'; return; }
      host.key(e);
    });
    addEventListener('keyup', (e) => this.keys.delete(canon(e.code)));
    addEventListener('blur', () => this.keys.clear());
  }

  private release(e: PointerEvent) {
    const p = this.press;
    if (!p || e.pointerId !== p.id) return;
    this.press = null;
    this.canvas.style.cursor = '';
    if (e.type !== 'pointerup') return;
    if (p.mode === 'paint') { if (p.from && p.to) this.host.drag(p.from, p.to); }
    else if (p.mode === 'click') {
      if (p.button === 0) this.host.click(e.clientX, e.clientY);
      else if (p.button === 2) this.host.secondary();
    }
    this.host.repick();
  }
}
