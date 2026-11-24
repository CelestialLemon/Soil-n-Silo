// The page's input, in plain terms for the controller: presses, drags and clicks on the valley's canvas, the wheel, and
// the keys. The keys are heard before the overlay's own (src/ui/ takes the tool keys, Esc and Delete): a key the controller
// takes is marked `preventDefault`, which the overlay leaves alone, so Esc first drops a stroke or a move under way.
import type { Play } from './controller.ts';

/** Whether a key goes to a text field (the page has none yet, but a key typed there is never a tool's). */
const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || t.closest('input, textarea, select') !== null);
/** Whether a key goes to a control of the page's own (a focused button's Space presses it, not the pause). */
const onControl = (t: EventTarget | null) =>
  t instanceof Element && t.closest('button, input, select, textarea, a[href], [tabindex], [contenteditable]') !== null;

/** Each button a gesture may start with (`button`: main, middle, secondary) and its bit in a pointer's `buttons`. */
const BUTTON_BIT: Readonly<Record<number, number>> = { 0: 1, 1: 4, 2: 2 };

/** Listens on the canvas and the window; returns what stops it. Call it before the overlay is built. */
export function bindInput(canvas: HTMLCanvasElement, play: Play): () => void {
  // One pointer drives a gesture at a time: a second finger (or pen) pressed while one is down is ignored until it lifts.
  // A mouse is one pointer with several buttons: a second button pressed while one is down (a chord) only moves the
  // pointer, and the pointer lifts only once every button is up, so the gesture follows the button that started it and
  // ends as that one is let go (its bit gone from `buttons`), whichever button the pointer finally lifts with.
  let active: number | null = null, activeButton = 0;
  const other = (e: PointerEvent) => active !== null && e.pointerId !== active;
  const held = (e: PointerEvent) => (e.buttons & BUTTON_BIT[activeButton]) !== 0;
  const finish = (e: PointerEvent) => {
    active = null;
    play.pointerUp(activeButton, e.clientX, e.clientY);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  const onDown = (e: PointerEvent) => {
    if (active !== null || !(e.button in BUTTON_BIT)) return;
    active = e.pointerId; activeButton = e.button;
    canvas.setPointerCapture(e.pointerId);
    play.pointerDown(e.button, e.clientX, e.clientY);
    e.preventDefault();
  };
  const onMove = (e: PointerEvent) => {
    if (other(e)) return;
    play.pointerMove(e.clientX, e.clientY);
    if (e.pointerId === active && !held(e)) finish(e);
  };
  const onUp = (e: PointerEvent) => { if (e.pointerId === active) finish(e); };
  // The gesture's pointer was cancelled, or its capture lost before it lifted: the gesture is dropped.
  const onCancel = (e: PointerEvent) => {
    if (e.pointerId !== active) return;
    active = null;
    play.pointerCancel();
  };
  const onLeave = (e: PointerEvent) => { if (!other(e)) play.pointerLeave(); };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Lines and pages (some mice, some systems) as pixels; Shift turns a vertical wheel sideways on some systems.
    const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 600 : 1;
    const delta = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
    play.wheel(delta, e.clientX, e.clientY, e.shiftKey);
  };
  const onMenu = (e: Event) => e.preventDefault();

  // The keys the controller took on their way down: only their release is kept from the page.
  const took = new Set<string>();
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
    if (e.key === ' ' && e.target !== canvas && onControl(e.target)) return;
    const key = e.key.toLowerCase();
    if (key === 'escape' ? play.escape() : play.keyDown(key, e.shiftKey, e.repeat)) { took.add(key); e.preventDefault(); }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    play.keyUp(key);
    // A space taken as the pause, let go over a focused button, would press it too.
    if (took.delete(key)) e.preventDefault();
  };
  const onBlur = () => { took.clear(); play.releaseKeys(); };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  canvas.addEventListener('lostpointercapture', onCancel);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onMenu);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onCancel);
    canvas.removeEventListener('lostpointercapture', onCancel);
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('contextmenu', onMenu);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
  };
}
