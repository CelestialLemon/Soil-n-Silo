import { canPlace, priceOf } from '../game/build.ts';
import { BUILDINGS, type BuildingId } from '../game/data.ts';
import { placement } from '../game/forecast.ts';
import { usedBy, type Network } from '../game/power.ts';
import type { GameState, Status } from '../game/state.ts';
import { fill, h, icon, set } from './dom.ts';
import { hex, num, pct, watts } from './format.ts';
import { statusLook, statusPill } from './widgets.ts';

// What the HUD draws over the world, tied to points of it: a marker over each building with a problem (a shape and a tint),
// a label over each power network while you work with power, stop numbers over a route's buildings, tags over a route's
// trucks, the placement card over the building in hand, and the card under the pointer. Positions come in page pixels and
// are divided by the interface's zoom.

export interface Spot { sx: number; sy: number }
export interface MarkerSpot extends Spot { id: number; status: Status }
export interface NetSpot extends Spot { colour: number; net: Network }
export interface StopSpot extends Spot { colour: number; text: string }
export interface TruckSpot extends Spot { id: number; name: string; what: string }
/** The building in hand at the pointer: where its north-west tile is, and how many a drag would place. */
export interface PlaceSpot extends Spot { type: BuildingId; x: number; y: number; count: number }
/** What is under the pointer, for the hover card. */
export interface Hover { title: string; icon?: string; status?: { status: Status; label: string }; text?: string }

/** A pool of elements made as needed and hidden when not, so a list redrawn every frame makes nothing new. */
class Pool {
  private readonly els: HTMLElement[] = [];
  private readonly parent: HTMLElement;
  private readonly make: () => HTMLElement;
  constructor(parent: HTMLElement, make: () => HTMLElement) { this.parent = parent; this.make = make; }
  /** Shows `n` elements, laying out each with `fill`. */
  show<T>(list: T[], z: number, at: (x: T) => Spot, fill: (el: HTMLElement, x: T) => void) {
    while (this.els.length < list.length) { const el = this.make(); this.els.push(el); this.parent.append(el); }
    this.els.forEach((el, i) => {
      const x = list[i];
      el.hidden = !x;
      if (!x) return;
      const p = at(x);
      el.style.left = `${Math.round(p.sx / z)}px`; el.style.top = `${Math.round(p.sy / z)}px`;
      fill(el, x);
    });
  }
}

export class WorldLayer {
  readonly el = h('div', { class: 'ui-world' });
  private z = 1;
  private readonly markers = new Pool(this.el, () => h('span', { class: 'mk' }, h('i')));
  private readonly nets = new Pool(this.el, () => h('span', { class: 'cd-callout net-tag' }, h('i', { class: 'sw' }), h('b'), h('small')));
  private readonly stops = new Pool(this.el, () => h('span', { class: 'stop-disc' }));
  private readonly trucks = new Pool(this.el, () => h('span', { class: 'cd-callout is-ink truck-tag' }, icon('truck', 26), h('b'), h('small')));
  private readonly forecast = h('div', { class: 'cd-card is-ink forecast', hidden: true });
  private forecastKey = '';
  private readonly hover = h('div', { class: 'cd-card hover', hidden: true });
  private hoverKey = '';

  constructor() { this.el.append(this.forecast, this.hover); }

  setZoom(z: number) { this.z = z; }

  setMarkers(list: MarkerSpot[]) {
    this.markers.show(list, this.z, (x) => x, (el, m) => {
      const look = statusLook(m.status), cls = `mk ${look.cls}${look.outline ? ' is-outline' : ''}`;
      if (el.className !== cls) el.className = cls;
      if (look.col) el.style.setProperty('--col', look.col); else el.style.removeProperty('--col');
    });
  }

  setNetLabels(list: NetSpot[]) {
    this.nets.show(list, this.z, (x) => x, (el, l) => {
      const [sw, b, small] = el.children as unknown as HTMLElement[], n = l.net, short = n.share < 1 && n.wanted > 0;
      sw.style.background = hex(l.colour);
      set(b, watts(n.made));
      set(small, `${watts(usedBy(n))} used${n.capacity ? ` · ${pct(n.stored / n.capacity)} stored` : ''}${short ? ` · short, ${pct(n.share)}` : ''}`);
      el.classList.toggle('is-short', short);
    });
  }

  setStopLabels(list: StopSpot[]) {
    this.stops.show(list, this.z, (x) => x, (el, l) => { el.style.background = hex(l.colour); set(el, l.text); });
  }

  setTruckTags(list: TruckSpot[]) {
    this.trucks.show(list, this.z, (x) => x, (el, t) => {
      const [, b, small] = el.children as unknown as HTMLElement[];
      set(b, t.name); set(small, t.what);
    });
  }

  /** The placement card over the building in hand (null hides it): facts about the tile, or why it doesn't fit. */
  setPlacement(s: GameState, spot: PlaceSpot | null) {
    this.forecast.hidden = !spot;
    if (!spot) { this.forecastKey = ''; return; }
    this.forecast.style.left = `${Math.round(spot.sx / this.z)}px`; this.forecast.style.top = `${Math.round(spot.sy / this.z)}px`;
    // Made again when the tile changes, and twice a second of play (the soil and the sun move).
    const key = `${spot.type} ${spot.x} ${spot.y} ${spot.count} ${Math.floor(s.time * 2)} ${s.credits >= priceOf(s, spot.type)}`;
    if (key === this.forecastKey) return;
    this.forecastKey = key;
    const def = BUILDINGS[spot.type], price = priceOf(s, spot.type), fit = canPlace(s, spot.type, spot.x, spot.y);
    const p = fit.ok ? placement(s, spot.type, spot.x, spot.y) : null;
    fill(this.forecast,
      h('div', { class: 'head' }, icon(spot.type), h('b', null, spot.count > 1 ? `${spot.count} × ${def.name.toLowerCase()}` : `A${/^[aeiou]/i.test(def.name) ? 'n' : ''} ${def.name.toLowerCase()} here`),
        h('span', { class: 'cd-small', style: 'margin-left: auto' }, price ? `${num(price * spot.count)} credits` : 'free')),
      p && p.facts.length ? h('div', { class: 'facts' }, ...p.facts.map((f) => h('div', null,
        h('div', { class: 'cd-label' }, f.label),
        h('div', { class: `v${f.tone === 'bad' ? ' is-bad' : ''}` }, f.value, f.then !== undefined ? h('small', null, ` → ${f.then}`) : null),
        h('div', { class: 'cd-small' }, f.sub)))) : null,
      p && p.next.length ? h('div', { class: 'next cd-small' }, ...p.next.map((l) => h('div', null, l))) : null,
      fit.ok ? null : h('div', { class: 'why cd-small' }, fit.message));
  }

  /** The card under the pointer (at page point `at`), or none. */
  setHover(hover: Hover | null, at: { x: number; y: number } | null) {
    this.hover.hidden = !hover || !at;
    if (!hover || !at) return;
    const x = at.x / this.z;
    this.hover.style.left = `${Math.round(x)}px`; this.hover.style.top = `${Math.round(at.y / this.z)}px`;
    // Near the right edge it opens to the left of the pointer.
    this.hover.classList.toggle('is-left', x + 420 > this.el.clientWidth);
    const key = JSON.stringify(hover);
    if (key === this.hoverKey) return;
    this.hoverKey = key;
    fill(this.hover,
      h('div', { class: 'head' }, hover.icon ? icon(hover.icon) : null, hover.title),
      hover.status ? statusPill(hover.status.status, hover.status.label) : null,
      hover.text ? h('p', { class: 'cd-small' }, hover.text) : null);
  }
}
