// The play layer's heart: it holds the game's state, the world that draws it and the overlay, and turns what the player
// does (input.ts gives it presses, drags, clicks, the wheel and keys in plain terms) into the game's actions, the world's
// previews and the overlay's snapshot. Every edit goes through the game's `apply`; the world redraws what its Change says.
//
// Heavy work (a rill's flow, a ghost's fit, a field's paint) runs at most once a frame: input only marks what's dirty.
//
// It also runs the living homestead (Milestone 2): each frame, while the clock runs, the game's `stepSim` moves it on by
// the frame's game time with the world's sky and wind, the world draws the tick (crops, carts, buildings' parts), and what
// the tick tells (a drop, a seal, a blackout) becomes a warm toast. The world's sky owns the clock; the sim's hour follows
// it (and the day turns as it passes midnight), so the sky strip's Dawn, Noon, Golden and Dusk move both together.
import {
  type Action, apply, CART_COST, CATALOG, type Change, generateValley, type GameState, heightAt, type Point2, type Season, type SimEvent,
  stepSim, suggestWaterWheelYaw, type ThingKind, TREE_SPECIES, wrapAngle,
} from '../game/index.ts';
import {
  placedKind, type SelectedThingView, type Speed, toolDef, type ToolId, type ToolReadout, type UiCallbacks, type UiController,
  type UiSnapshot, type ValleyStats, type Weather, type YawMode,
} from '../ui/index.ts';
import { type PreviewSpec, type World, writeUrlParam } from '../world/index.ts';
import { cartControls, skyWeather, thingDetail, thingStatus, uiWeather, valleyStats } from './status.ts';
import {
  BRUSH, channelReadout, extend, hedgeReadout, isFieldTool, isPowerKind, isStrokeTool, placeReadout, placesPower, STROKE_STEP,
  type StrokeTool, trackReadout, treeReadout, TURN_STEP,
} from './tools.ts';

/** How far (CSS px) a press may wander and still be a click. */
const CLICK_SLOP = 5;
/** Keyboard panning, in screen pixels a second (so metres a second is this over the zoom). */
const KEY_PAN = 560;
/** A right drag in orbit mode turns the view this much a pixel, rad. */
const ORBIT_PER_PX = 0.008;
/** The wheel's travel (px) for one 15° turn of a ghost with Shift held. */
const WHEEL_TURN = 60;
/** The longest frame the homestead is moved on by, real seconds (a stall doesn't leap the carts along). */
const MAX_SIM_FRAME = 0.25;
/** How often (Hz) the postcard's figures are read again while the homestead runs (they move slowly). */
const STATS_HZ = 4;

/** A pointer press under way. */
interface Press {
  button: number; startX: number; startY: number; lastX: number; lastY: number;
  mode: 'pending' | 'pan' | 'orbit' | 'stroke';
}

/** A stroke being painted or drawn (fields, rills, tracks, hedges, filling). */
interface Stroke { tool: StrokeTool; points: Point2[]; sent: number; dirty: boolean }

/** A placed thing being moved: its kind and the turn it'll be set down with. */
interface Moving { id: number; kind: ThingKind; yaw: number }

export class Play implements UiCallbacks {
  state: GameState;
  readonly world: World;
  private ui: UiController | null = null;

  private tool: ToolId = 'select';
  private selected: number | null = null;
  private moving: Moving | null = null;
  /** The turn a ghost is placed with; `turned`: the player turned it (a water wheel stops facing the brook by itself). */
  private placeYaw = 0;
  private turned = false;
  private brush: number = BRUSH.start;
  private wheelTurn = 0;

  private press: Press | null = null;
  private stroke: Stroke | null = null;
  private pointer: { x: number; y: number } | null = null;
  private hoverDirty = true;
  private cameraSig = '';
  private readout: ToolReadout | null = null;
  private lastSpeed: Speed = 1;
  private readonly held = new Set<string>();
  private orbitKeys: number[] = [];
  private welcomed = false;

  private stats: ValleyStats;
  private statsDirty = true;
  private statsClock = 0;
  /** The tracks the valley came with (the Depot's stub): not the player's work. */
  private starterTracks: ReadonlySet<number>;
  /** A blackout was toasted: the next waits until the power has come back. */
  private blackoutSaid = false;
  private shown = { contours: false, moisture: false, power: false };
  /** The power view (P): every wireless field shown, whatever is in hand. Off by default; not remembered. */
  private powerView = false;
  private uiKey = '';

  constructor(state: GameState, world: World) {
    this.state = state;
    this.world = world;
    this.starterTracks = new Set(state.tracks.map((t) => t.id));
    // The sky's clock (the address's ?hour=) is the valley's: the homestead starts at its hour.
    state.sim.hour = world.getHour();
    this.stats = valleyStats(state, this.starterTracks);
    this.welcomed = state.things.some((t) => t.kind === 'farmhouse');
    world.onFrame((dt) => this.frame(dt));
  }

  /** The overlay, once it's built (it needs these callbacks first). */
  attach(ui: UiController) { this.ui = ui; this.uiKey = ''; }

  // ---- The frame ----

  private frame(dt: number) {
    this.panByKeys(dt);
    this.stepHomestead(dt);
    if (this.stroke?.dirty) this.flushStroke();
    const sig = this.cameraSignature();
    if (sig !== this.cameraSig) { this.cameraSig = sig; this.hoverDirty = true; }
    if (this.hoverDirty && !this.stroke) { this.hoverDirty = false; this.hover(); }
    this.syncSwitches();
    this.renderUi();
  }

  /** Moves the living homestead on by the frame's game time (the world's sky has already moved its clock on). */
  private stepHomestead(dt: number) {
    const speed = this.world.getSpeed();
    if (speed <= 0) return;
    const tick = stepSim(this.state, Math.min(dt, MAX_SIM_FRAME) * speed, this.world.getSimEnv());
    this.world.syncSim(tick);
    if (tick.events.length > 0) this.tell(tick.events);
    else if (this.blackoutSaid && !this.state.sim.powerSummary.anyBlackout) this.blackoutSaid = false;
    this.statsClock += dt;
    if (this.statsClock >= 1 / STATS_HZ || tick.events.length > 0) { this.statsClock = 0; this.statsDirty = true; }
  }

  /**
   * What a tick tells, as toasts: a parcel, a seal, the valley Restored, a blackout (once an episode, until the power is
   * back), the Steady Homestead starting over (with why; it says the blackout too, so a blackout with it isn't said twice).
   * A field ripening isn't: the field shows it.
   */
  private tell(events: readonly SimEvent[]) {
    const ui = this.ui, reset = events.some((e) => e.type === 'steadyReset');
    for (const e of events) {
      switch (e.type) {
        case 'drop':
          ui?.showToast(e.message);
          // The ghost in hand may be affordable now.
          this.hoverDirty = true;
          break;
        case 'seal': case 'restored': ui?.showToast(e.message); break;
        case 'steadyReset': ui?.showToast(e.message, 'warn'); this.blackoutSaid ||= this.state.sim.powerSummary.anyBlackout; break;
        case 'blackout':
          if (!this.blackoutSaid && !reset) ui?.showToast(e.message, 'warn');
          this.blackoutSaid = true;
          break;
        case 'ripe': break;
      }
    }
    if (!this.state.sim.powerSummary.anyBlackout) this.blackoutSaid = false;
  }

  /** Changes when the view moves, so what's under a still pointer is looked at again. */
  private cameraSignature() {
    const p = this.world.toScreen(0, 0, 0);
    return `${Math.round(p.x)} ${Math.round(p.y)} ${this.world.getZoom().toFixed(2)}`;
  }

  private panByKeys(dt: number) {
    const h = this.held, on = (...keys: string[]) => keys.some((k) => h.has(k));
    const dx = (on('d', 'arrowright') ? 1 : 0) - (on('a', 'arrowleft') ? 1 : 0);
    const dz = (on('w', 'arrowup') ? 1 : 0) - (on('s', 'arrowdown') ? 1 : 0);
    if (dx === 0 && dz === 0) return;
    const speed = (KEY_PAN / this.world.getZoom()) * dt, n = Math.hypot(dx, dz);
    this.world.panByWorld((dx / n) * speed, (dz / n) * speed);
  }

  // ---- The overlay ----

  private renderUi() {
    const ui = this.ui;
    if (!ui) return;
    if (this.statsDirty) { this.stats = valleyStats(this.state, this.starterTracks); this.statsDirty = false; }
    const hour = this.world.getHour(), selected = this.selectedView(hour);
    const snapshot: UiSnapshot = {
      activeTool: this.tool, yawMode: this.world.getYawMode(), powerView: this.powerView, hour, day: this.state.sim.day,
      speed: this.world.getSpeed(), weather: uiWeather(this.world.getWeather()), stats: this.stats, selected,
      readout: this.currentReadout(),
    };
    if (placedKind(this.tool)) snapshot.placingRotationDeg = compassDeg(this.placeYaw);
    const key = [
      snapshot.activeTool, snapshot.yawMode, snapshot.powerView, snapshot.day, Math.floor(hour * 60), snapshot.speed, snapshot.weather,
      JSON.stringify(this.stats), selected ? JSON.stringify({ ...selected, screenX: 0, screenY: 0, visible: 0 }) : '-',
      snapshot.readout ? `${snapshot.readout.text} ${snapshot.readout.tone}` : '-', snapshot.placingRotationDeg,
    ].join('|');
    if (key !== this.uiKey) { this.uiKey = key; ui.render(snapshot); }
    if (selected) ui.updateRingPosition(selected.screenX, selected.screenY, selected.visible);
  }

  private currentReadout(): ToolReadout | null {
    if (this.moving) {
      const label = CATALOG[this.moving.kind].label;
      if (this.readout?.tone === 'warn') return this.readout;
      return { text: `Moving the ${label} · click to set it down · R to turn · Esc to cancel` };
    }
    return this.readout;
  }

  private selectedView(hour: number): SelectedThingView | null {
    if (this.selected === null || this.moving) return null;
    const t = this.state.things.find((v) => v.id === this.selected);
    if (!t) { this.selected = null; this.world.setSelectedThing(null); return null; }
    const def = CATALOG[t.kind], status = thingStatus(this.state, t, hour);
    const p = this.world.toScreen(t.x, heightAt(this.state.grid, t.x, t.z) + def.top * 0.55, t.z);
    const view: SelectedThingView = {
      id: t.id, kind: t.kind, label: def.label, statusLine: status.line, screenX: p.x, screenY: p.y, visible: p.visible,
      yawDeg: compassDeg(t.yaw), refund: def.cost,
    };
    if (status.connected !== undefined) view.connected = status.connected;
    if (def.immovable) view.immovable = true;
    const detail = thingDetail(this.state, t);
    if (detail !== undefined) view.detailLine = detail;
    if (t.kind === 'garage') view.cartControls = cartControls(this.state);
    return view;
  }

  // ---- The soft hints over the grass ----

  /**
   * The wireless fields show only in the power view, or while a power building or relay is picked, placed or moved: open
   * play keeps the valley clear of rings.
   */
  private syncSwitches() {
    const tool = this.tool, sel = this.selected === null ? undefined : this.state.things.find((t) => t.id === this.selected);
    const want = {
      contours: tool === 'channel:dig',
      moisture: isFieldTool(tool),
      power: this.powerView || placesPower(tool) || (this.moving !== null && isPowerKind(this.moving.kind)) || (sel !== undefined && isPowerKind(sel.kind)),
    };
    const was = this.shown;
    if (want.contours !== was.contours) this.world.setContourHints(want.contours);
    if (want.moisture !== was.moisture) this.world.setMoistureOverlay(want.moisture);
    if (want.power !== was.power) this.world.setShowPowerPreview(want.power);
    this.shown = want;
  }

  // ---- Edits ----

  /** Applies an action and redraws what it touched; a refusal is said in a toast (unless `quiet`) and returns null. */
  private act(a: Action, quiet = false): Change | null {
    const r = apply(this.state, a);
    if (!r.ok) { if (!quiet) this.ui?.showToast(r.error, 'warn'); return null; }
    this.world.sync(r.value);
    this.statsDirty = true;
    this.hoverDirty = true;
    return r.value;
  }

  // ---- The pointer (input.ts) ----

  pointerDown(button: number, x: number, y: number) {
    if (this.press) return;
    this.pointer = { x, y };
    const press: Press = { button, startX: x, startY: y, lastX: x, lastY: y, mode: button === 1 ? 'pan' : 'pending' };
    if (button === 0 && !this.moving && isStrokeTool(this.tool)) {
      const hit = this.world.hitTerrainAt(x, y);
      if (hit) {
        press.mode = 'stroke';
        this.stroke = { tool: this.tool, points: [{ x: hit.x, z: hit.z }], sent: 0, dirty: true };
      }
    }
    this.press = press;
  }

  pointerMove(x: number, y: number) {
    this.pointer = { x, y };
    this.hoverDirty = true;
    const p = this.press;
    if (!p) return;
    const dx = x - p.lastX, dy = y - p.lastY;
    p.lastX = x; p.lastY = y;
    if (p.mode === 'pending' && Math.hypot(x - p.startX, y - p.startY) > CLICK_SLOP) {
      p.mode = p.button === 2 && this.world.getYawMode() === 'orbit' ? 'orbit' : 'pan';
      if (p.mode === 'pan') this.world.panByScreen(x - p.startX - dx, y - p.startY - dy);
    }
    if (p.mode === 'pan') this.world.panByScreen(dx, dy);
    else if (p.mode === 'orbit') this.world.orbitBy(-dx * ORBIT_PER_PX);
    else if (p.mode === 'stroke' && this.stroke) {
      const hit = this.world.hitTerrainAt(x, y);
      if (this.stroke.tool === 'channel:fill') this.stroke.dirty = true;
      else if (hit && extend(this.stroke.points, { x: hit.x, z: hit.z }, STROKE_STEP[this.stroke.tool])) this.stroke.dirty = true;
    }
  }

  pointerUp(button: number, x: number, y: number) {
    const p = this.press;
    if (!p || p.button !== button) return;
    this.press = null;
    this.hoverDirty = true;
    if (p.mode === 'stroke') { this.finishStroke(); return; }
    if (p.mode !== 'pending') return;
    if (button === 0) this.click(x, y);
    else if (button === 2) this.putDown();
  }

  pointerLeave() {
    this.pointer = null;
    if (!this.press) { this.world.setPreview(null); if (!this.moving) this.readout = null; }
  }

  /** A lost pointer (another window took it): what was under way is dropped. */
  pointerCancel() {
    if (this.stroke) this.dropStroke();
    this.press = null;
  }

  /** The wheel: zooms at the pointer, or with Shift turns the ghost being placed or moved. */
  wheel(delta: number, x: number, y: number, shift: boolean) {
    if (shift && (this.moving || placedKind(this.tool))) {
      this.wheelTurn += delta;
      if (Math.abs(this.wheelTurn) >= WHEEL_TURN) { this.turnGhost(this.wheelTurn > 0 ? -1 : 1); this.wheelTurn = 0; }
      return;
    }
    this.world.zoomBy(Math.exp(-Math.max(-240, Math.min(240, delta)) * 0.0016), x, y);
  }

  // ---- Clicks ----

  private click(x: number, y: number) {
    if (this.moving) { this.setDown(x, y); return; }
    const tool = this.tool, kind = placedKind(tool);
    if (tool === 'select') {
      const hit = this.world.pickAt(x, y);
      this.select(hit?.kind === 'thing' && hit.id !== undefined ? hit.id : null);
      return;
    }
    if (kind) { this.placeAt(kind, x, y); return; }
    if (tool === 'tree:plant') {
      const at = this.world.hitTerrainAt(x, y);
      if (!at) return;
      const species = TREE_SPECIES[Math.abs(Math.round(at.x * 7 + at.z * 13)) % 4];
      this.act({ type: 'plantTree', x: at.x, z: at.z, species });
      return;
    }
    if (tool === 'erase:land') this.clearAt(x, y);
  }

  private placeAt(kind: ThingKind, x: number, y: number) {
    const at = this.world.hitTerrainAt(x, y);
    if (!at) return;
    const yaw = this.ghostYaw(kind, at.x, at.z);
    const change = this.act({ type: 'place', kind, x: at.x, z: at.z, yaw });
    if (!change) return;
    if (kind === 'farmhouse' && !this.welcomed) {
      this.welcomed = true;
      this.ui?.showToast('Welcome home · paint a field, dig a rill from the brook, lay a track');
    }
    if (CATALOG[kind].oneOfEach) this.onSelectTool('select');
  }

  /** Erase: clears the track, hedgerow, planted tree or rill under the pointer. */
  private clearAt(x: number, y: number) {
    const hit = this.world.pickAt(x, y);
    const id = hit?.id;
    if (hit && id !== undefined) {
      switch (hit.kind) {
        case 'track': this.act({ type: 'removeTrack', id }); return;
        case 'hedge': this.act({ type: 'removeHedge', id }); return;
        case 'tree': this.act({ type: 'removeTree', id }); return;
        case 'channel': this.act({ type: 'fillChannel', id }); return;
        default: break;
      }
    }
    this.ui?.showToast('Nothing to clear there · click a track, hedgerow, planted tree or rill');
  }

  // ---- Strokes ----

  private flushStroke() {
    const st = this.stroke;
    if (!st) return;
    st.dirty = false;
    const last = st.points[st.points.length - 1];
    switch (st.tool) {
      case 'field:wheat': case 'field:beans': case 'field:erase': {
        const erase = st.tool === 'field:erase';
        this.world.setPreview({ kind: 'field', x: last.x, z: last.z, radius: this.brush, erase });
        if (st.sent >= st.points.length) return;
        const seg = st.points.slice(Math.max(0, st.sent - 1));
        st.sent = st.points.length;
        const r = apply(this.state, erase
          ? { type: 'eraseField', points: seg, radius: this.brush }
          : { type: 'paintField', crop: st.tool === 'field:wheat' ? 'wheat' : 'beans', points: seg, radius: this.brush });
        if (r.ok) {
          this.world.sync(r.value);
          this.statsDirty = true;
          const area = this.state.fields.reduce((sum, f) => sum + f.areaM2, 0);
          this.readout = { text: `${erase ? 'Clearing' : st.tool === 'field:wheat' ? 'Painting wheat' : 'Painting beans'} · fields ${Math.round(area)} m²` };
        } else if (!erase) this.readout = { text: r.error, tone: 'warn' };
        return;
      }
      case 'channel:dig': {
        // One solve per move: the readout's preview is the one drawn.
        const c = channelReadout(this.state, st.points);
        this.world.setPreview({ kind: 'channel', points: st.points, preview: c.preview });
        this.readout = c.readout;
        return;
      }
      case 'channel:fill': {
        if (!this.pointer) return;
        const hit = this.world.pickAt(this.pointer.x, this.pointer.y);
        if (hit?.kind === 'channel' && hit.id !== undefined) this.act({ type: 'fillChannel', id: hit.id }, true);
        return;
      }
      case 'track:draw': {
        const t = trackReadout(this.state, st.points);
        this.world.setPreview({ kind: 'track', points: st.points, fits: t.fits });
        this.readout = t.readout;
        return;
      }
      case 'hedge:draw':
        this.world.setPreview({ kind: 'hedge', points: st.points });
        this.readout = hedgeReadout(st.points);
        return;
    }
  }

  private finishStroke() {
    const st = this.stroke;
    if (!st) return;
    if (st.dirty) this.flushStroke();
    this.stroke = null;
    this.world.setPreview(null);
    this.readout = null;
    const pts = st.points;
    switch (st.tool) {
      case 'channel:dig': {
        if (pts.length < 2) return;
        const change = this.act({ type: 'digChannel', points: pts });
        const c = change?.created === undefined ? undefined : this.state.channels.find((v) => v.id === change.created);
        if (c && !c.flow.some((f) => f.wet)) this.ui?.showToast('The rill is dug, but dry · start it at the brook or pond', 'warn');
        return;
      }
      case 'track:draw': {
        if (pts.length < 2) return;
        const before = this.state.bridges.length;
        if (this.act({ type: 'addTrack', points: pts })) {
          const n = this.state.bridges.length - before;
          if (n > 0) this.ui?.showToast(`${n} plank bridge${n === 1 ? '' : 's'} laid where the track crosses water`);
        }
        return;
      }
      case 'hedge:draw':
        if (pts.length >= 2) this.act({ type: 'addHedge', points: pts });
        return;
      default: return;
    }
  }

  private dropStroke() {
    this.stroke = null;
    this.world.setPreview(null);
    this.readout = null;
    this.hoverDirty = true;
  }

  // ---- Hovering: the ghost, the brush, the sapling ----

  private hover() {
    const ptr = this.pointer, tool = this.tool;
    const at = ptr ? this.world.hitTerrainAt(ptr.x, ptr.y) : null;
    let spec: PreviewSpec | null = null, readout: ToolReadout | null = null;
    if (this.moving) {
      if (at) {
        const m = this.moving, r = placeReadout(this.state, m.kind, at.x, at.z, m.yaw, m.id);
        spec = { kind: 'thing', thingKind: m.kind, x: at.x, z: at.z, yaw: m.yaw, fits: r.fits, ignore: m.id };
        readout = r.fits ? null : r.readout;
      }
    } else {
      const kind = placedKind(tool);
      if (kind && at) {
        const yaw = this.ghostYaw(kind, at.x, at.z), r = placeReadout(this.state, kind, at.x, at.z, yaw);
        spec = { kind: 'thing', thingKind: kind, x: at.x, z: at.z, yaw, fits: r.fits };
        readout = r.readout;
      } else if (isFieldTool(tool)) {
        if (at) spec = { kind: 'field', x: at.x, z: at.z, radius: this.brush, erase: tool === 'field:erase' };
        readout = { text: `${toolDef(tool)?.hint ?? ''} · brush ${this.brush.toFixed(1)} m ([ ] to resize)` };
      } else if (tool === 'tree:plant' && at) {
        const r = treeReadout(this.state, at.x, at.z);
        spec = { kind: 'tree', x: at.x, z: at.z, fits: r.fits };
        readout = r.readout;
      }
    }
    this.world.setPreview(spec);
    this.readout = readout;
  }

  /** The turn a ghost takes here: a water wheel faces the nearest brook until the player turns it. */
  private ghostYaw(kind: ThingKind, x: number, z: number): number {
    if (kind === 'waterwheel' && !this.turned) {
      const suggested = suggestWaterWheelYaw(this.state, x, z);
      if (suggested !== undefined) this.placeYaw = suggested;
    }
    return this.placeYaw;
  }

  /** Turns the ghost being placed or moved by 15° (dir 1: anticlockwise seen from above, -1: clockwise). */
  private turnGhost(dir: 1 | -1) {
    if (this.moving) this.moving.yaw = wrapAngle(this.moving.yaw + dir * TURN_STEP);
    else this.placeYaw = wrapAngle(this.placeYaw + dir * TURN_STEP);
    this.turned = true;
    this.hoverDirty = true;
  }

  // ---- Selecting and moving ----

  private select(id: number | null) {
    this.selected = id;
    this.world.setSelectedThing(id);
  }

  private setDown(x: number, y: number) {
    const m = this.moving, at = this.world.hitTerrainAt(x, y);
    if (!m || !at) return;
    if (!this.act({ type: 'move', id: m.id, x: at.x, z: at.z, yaw: m.yaw })) return;
    this.moving = null;
    this.world.setPreview(null);
    this.readout = null;
    this.select(m.id);
  }

  private cancelMove() {
    const m = this.moving;
    if (!m) return;
    this.moving = null;
    this.world.setPreview(null);
    this.readout = null;
    this.select(m.id);
  }

  /** A right click: puts the tool down (or stops a move). */
  private putDown() {
    if (this.moving) this.cancelMove();
    else if (this.tool !== 'select') this.onSelectTool('select');
    else if (this.selected !== null) this.select(null);
  }

  // ---- Keys (input.ts); each says whether it took the key ----

  /** Esc, before the overlay sees it: drops a stroke or a move under way. */
  escape(): boolean {
    if (this.stroke || this.press) {
      if (this.stroke) this.dropStroke();
      this.press = null;
      return true;
    }
    if (this.moving) { this.cancelMove(); return true; }
    return false;
  }

  keyDown(key: string, shift: boolean, repeat: boolean): boolean {
    switch (key) {
      case 'w': case 'a': case 's': case 'd': case 'arrowup': case 'arrowdown': case 'arrowleft': case 'arrowright':
        this.held.add(key);
        return true;
      case 'q': case 'e': {
        if (repeat) return true;
        const dir = key === 'q' ? -1 : 1;
        if (this.world.getYawMode() === 'snap') this.world.stepYaw(dir);
        else { this.orbitKeys = [...this.orbitKeys.filter((d) => d !== dir), dir]; this.world.setOrbitHold(dir); }
        return true;
      }
      case 'r': {
        const dir = shift ? 1 : -1;
        if (this.moving || placedKind(this.tool)) { this.turnGhost(dir); return true; }
        const t = this.selected === null ? undefined : this.state.things.find((v) => v.id === this.selected);
        if (t && !repeat && !CATALOG[t.kind].immovable) this.act({ type: 'rotate', id: t.id, yaw: t.yaw + dir * TURN_STEP });
        return t !== undefined;
      }
      case ' ':
        if (!repeat) {
          const speed = this.world.getSpeed();
          if (speed === 0) this.onSetSpeed(this.lastSpeed);
          else this.onSetSpeed(0);
        }
        return true;
      case 'p':
        if (!repeat) this.onTogglePowerView();
        return true;
      case '[': case ']':
        this.brush = Math.min(BRUSH.max, Math.max(BRUSH.min, this.brush + (key === ']' ? BRUSH.step : -BRUSH.step)));
        this.hoverDirty = true;
        return true;
      default: return false;
    }
  }

  keyUp(key: string) {
    this.held.delete(key);
    if (key === 'q' || key === 'e') {
      const dir = key === 'q' ? -1 : 1;
      this.orbitKeys = this.orbitKeys.filter((d) => d !== dir);
      if (this.world.getYawMode() === 'orbit') this.world.setOrbitHold((this.orbitKeys[this.orbitKeys.length - 1] ?? 0) as -1 | 0 | 1);
    }
  }

  /** The window lost focus: no key stays held. */
  releaseKeys() {
    this.held.clear();
    this.orbitKeys = [];
    this.world.setOrbitHold(0);
  }

  // ---- The overlay's callbacks ----

  onSelectTool(tool: ToolId) {
    if (this.stroke) this.dropStroke();
    this.press = null;
    this.moving = null;
    if (this.selected !== null) this.select(null);
    if (tool !== this.tool) { this.turned = false; this.placeYaw = 0; }
    this.tool = tool;
    this.readout = null;
    this.world.setPreview(null);
    this.hoverDirty = true;
  }

  /** The thing `id`, if it stands and may be moved, turned or taken away (the Depot may not). */
  private movable(id: number) {
    const t = this.state.things.find((v) => v.id === id);
    return t && !CATALOG[t.kind].immovable ? t : undefined;
  }

  onMoveSelected(id: number) {
    const t = this.movable(id);
    if (!t) return;
    this.moving = { id, kind: t.kind, yaw: t.yaw };
    this.readout = null;
    this.hoverDirty = true;
  }

  onRotateSelected(id: number, deltaRad: number) {
    const t = this.movable(id);
    if (t) this.act({ type: 'rotate', id, yaw: t.yaw + deltaRad });
  }

  onRemoveSelected(id: number) {
    const t = this.movable(id);
    if (!t) return;
    const carts = t.kind === 'garage' ? this.state.sim.carts.length : 0;
    if (!this.act({ type: 'remove', id })) return;
    this.select(null);
    const cost = CATALOG[t.kind].cost, back = cost + Math.max(0, carts - 1) * CART_COST;
    const gone = carts > 0 ? ` · its ${carts === 1 ? 'cart goes' : `${carts} carts go`} with it` : '';
    this.ui?.showToast(`${CATALOG[t.kind].label} taken down${back > 0 ? ` · +${back} ${back === 1 ? 'Supply' : 'Supplies'} back` : ''}${gone}`);
  }

  onBuyCart() {
    if (this.act({ type: 'buyCart' })) this.ui?.showToast('New Electric Cart ready at the Garage');
  }

  onRetireCart(id: number) {
    if (this.act({ type: 'retireCart', id })) this.ui?.showToast(`Electric Cart retired · +${CART_COST} ${CART_COST === 1 ? 'Supply' : 'Supplies'} refunded`);
  }

  onDeselect() { this.select(null); }

  onSetYawMode(mode: YawMode) {
    this.releaseKeys();
    this.world.setYawMode(mode);
  }

  onStepYaw(dir: -1 | 1) { this.world.stepYaw(dir); }
  onTogglePowerView() { this.powerView = !this.powerView; }
  /** A jump on the sky strip moves the homestead's hour with the sky's (the day stays: no time is lived through). */
  onSetHour(hour: number) {
    this.world.setHour(hour);
    this.state.sim.hour = this.world.getHour();
  }

  onSetSpeed(speed: Speed) {
    if (speed !== 0) this.lastSpeed = speed;
    this.world.setSpeed(speed);
  }

  onSetWeather(weather: Weather) { this.world.setWeather(skyWeather(weather)); }

  onNewValley(seed: number, season: Season) {
    const next = generateValley(seed >>> 0, season);
    this.onSelectTool('select');
    this.state = next;
    // A fresh homestead: its own Supplies, brief, Depot and stub, on day 1 at the sky's hour.
    next.sim.hour = this.world.getHour();
    this.starterTracks = new Set(next.tracks.map((t) => t.id));
    this.blackoutSaid = false;
    this.world.resetValley(next);
    writeUrlParam('seed', String(next.seed));
    writeUrlParam('season', season);
    this.welcomed = false;
    this.statsDirty = true;
    this.hoverDirty = true;
  }

  onCenterHomestead() {
    const home = this.state.things.find((t) => t.kind === 'farmhouse') ?? this.state.valley.homestead;
    this.world.focusOn(home.x, home.z);
  }
}

/** A turn as a compass reads it on screen: degrees clockwise (the game's yaw turns anticlockwise). */
const compassDeg = (yaw: number) => Math.round((((-yaw * 180) / Math.PI) % 360 + 360) % 360);
