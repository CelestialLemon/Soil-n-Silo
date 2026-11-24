// The page's input, in plain terms for the controller: presses, drags and clicks on the valley's canvas, the wheel, and
// the keys. The keys are heard before the overlay's own (src/ui/ takes the tool keys, Esc and Delete): a key the controller
// takes is marked `preventDefault`, which the overlay leaves alone, so Esc first drops a stroke or a move under way.
import type { Play } from './controller.ts';

/** Whether a key goes to a text field (the page has none yet, but a key typed there is never a tool's). */
const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || t.closest('input, textarea, select') !== null);

/** Listens on the canvas and the window; returns what stops it. Call it before the overlay is built. */
export function bindInput(canvas: HTMLCanvasElement, play: Play): () => void {
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button > 2) return;
    canvas.setPointerCapture(e.pointerId);
    play.pointerDown(e.button, e.clientX, e.clientY);
    e.preventDefault();
  };
  const onMove = (e: PointerEvent) => play.pointerMove(e.clientX, e.clientY);
  const onUp = (e: PointerEvent) => {
    play.pointerUp(e.button, e.clientX, e.clientY);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  const onCancel = () => play.pointerCancel();
  const onLeave = () => play.pointerLeave();
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Lines and pages (some mice, some systems) as pixels; Shift turns a vertical wheel sideways on some systems.
    const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 600 : 1;
    const delta = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
    play.wheel(delta, e.clientX, e.clientY, e.shiftKey);
  };
  const onMenu = (e: Event) => e.preventDefault();

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
    const key = e.key.toLowerCase();
    const took = key === 'escape' ? play.escape() : play.keyDown(key, e.shiftKey, e.repeat);
    if (took) e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    play.keyUp(e.key.toLowerCase());
    // A space let go over a focused button would press it: the space is the pause.
    if (e.key === ' ' && !typing(e.target)) e.preventDefault();
  };
  const onBlur = () => play.releaseKeys();

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
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
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('contextmenu', onMenu);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
  };
}
