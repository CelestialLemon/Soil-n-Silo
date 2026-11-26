// The play layer's heart: it holds the game's state, the world that draws it and the overlay, and turns what the player
// does (input.ts gives it presses, drags, clicks, the wheel and keys in plain terms) into the game's actions, the world's
// previews and the overlay's snapshot. Every edit goes through the game's `apply`; the world redraws what its Change says.
//
// Heavy work (a rill's flow, a ghost's fit, a field's paint) runs at most once a frame: input only marks what's dirty.
//
// A field tool lays a field one of two ways (the tool strip's Polygon / Brush pill, or B): by outline, the default (a click
// on the land lays a corner, a click back on the first corner, a double-click or Enter fills it, Backspace takes the last
// corner back, Esc or a right click drops the outline; a drag beyond the click slop still pans), or by the round brush.
// While a field tool is in hand, or a Sprinkler or Rain Tank is placed, moved or picked, the watered ground shows.
//
// It also runs the living homestead (Milestone 2): each frame, while the clock runs, the game's `stepSim` moves it on by
// the frame's game time with the world's sky and wind, the world draws the tick (crops, carts, buildings' parts), and what
// the tick tells (a drop, a seal, a blackout) becomes a warm toast. The world's sky owns the clock; the sim's hour follows
// it (and the day turns as it passes midnight), so the sky strip's Dawn, Noon, Golden and Dusk move both together. While
// the clock is stopped, an edit or a jump of the clock reads the power again at once (refreshPower), so the power view's
// watts and the workshops' lights show it without waiting for the clock to run.
//
// The living weather (Milestone 4) is the game's: stepSim moves it on with the clock, the world draws it, and the sky
// strip reads it out (liveWeatherView) with the Weather Station's days ahead once one stands (stationForecast). A
// `?weather=` lock holds it until the player lets it go (onClearWeatherLock); a jump of the clock reads it again at once.
//
// Milestone 5: the Valleys panel's campaign valleys, procedural and Sandbox valleys, the saved game (one slot in the
// browser, a `.json` file to download or load), the player's settings (applied to the sound and the world at once, and
// remembered), and the soundscape, fed the valley's wind, rain, brook, zoom and work a few times a second.
import { type Soundscape } from '../audio/index.ts';
import {
  type Action, type ByproductMaker, type ByproductTarget, BYPRODUCTS, CROPS, effectivePriority, isByproductMaker, cellIx, cellIz, effectiveMoisture, erosionDrain, GOOD_LABELS, apply, diagnoseIdleCarts, CART_COST, CATALOG, CLOCK_JUMPED, type Change, generateValley, type GameState, heightAt, type Point2,
  type ClimateCharacter, climateFor, climatesOf, deserializeSave, generateProceduralValley, refreshFieldWeather, startCampaignValley, refreshPower, resetSteadyOnClockJump, rollWeatherSeed, type Season, SETUP_CHANGED, type SimEvent, stationForecast, stepSim, stepWeather,
  suggestWaterWheelYaw, type ThingKind, TREE_SPECIES, type WeatherSpell, wrapAngle,
} from '../game/index.ts';
import {
  placedKind, type ProceduralRequest, type SelectedThingView, type Speed, toolDef, type ToolId, type ToolReadout, type UiCallbacks, type UiController,
  type UiQuality, type UiSettings, type UiSnapshot, type ValleyStats, type Weather, type YawMode,
} from '../ui/index.ts';
import { clearUrlParam, type PreviewSpec, type World, writeUrlParam } from '../world/index.ts';
import { mergeSettings, storeSettings } from './settings.ts';
import { cartControls, liveWeatherView, skyWeather, thingDetail, thingStatus, uiWeather, valleyStats } from './status.ts';
import {
  BRUSH, channelReadout, cropOfTool, extend, type FieldMode, hedgeReadout, isFieldTool, isPowerKind, isStrokeTool, placeReadout, placesPower,
  POLYGON_SNAP, polygonReadout, STROKE_STEP, type StrokeTool, trackReadout, treeReadout, TURN_STEP,
} from './tools.ts';
import { downloadSaveFile, loadFromBrowser, savedSlotInfo, saveToBrowser } from './storage.ts';

/** How a byproduct's destination reads on its card's pip ("Bran → Digester"). */
const PRIORITY_LABELS: Record<ByproductTarget, string> = { auto: 'Auto', coop: 'Coop', composter: 'Composter', digester: 'Digester', silo: 'Silo' };

/** How far (CSS px) a press may wander and still be a click. */
const CLICK_SLOP = 5;
/** Two clicks this close in time (ms) and on screen (CSS px) are a double-click. */
const DOUBLE_CLICK_MS = 350, DOUBLE_CLICK_PX = 8;
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
  readonly sound: Soundscape;
  /** The player's settings as remembered in the browser. */
  private storedSettings: UiSettings;
  /** The address's `?quality=`, which wins over the stored quality until the player picks one in Settings. */
  private urlQuality: UiQuality | undefined;
  /** Whether a saved game is there, and when it was saved (read again on each save). */
  private savedInfo: { hasSavedGame: boolean; savedAtLabel?: string };
  private ui: UiController | null = null;

  private tool: ToolId = 'select';
  private selected: number | null = null;
  private moving: Moving | null = null;
  /** The turn a ghost is placed with; `turned`: the player turned it (a water wheel stops facing the brook by itself). */
  private placeYaw = 0;
  private turned = false;
  private brush: number = BRUSH.start;
  /** How the field tools lay a field, and the outline being drawn (its corners so far). */
  private fieldMode: FieldMode = 'polygon';
  private polygon: Point2[] = [];
  /** The last click on the land with a field outline tool: a second one close by soon after is a double-click. */
  private lastClick: { t: number; x: number; y: number; closed: boolean } | null = null;
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
  /**
   * The climate the player chose (`?climate=`, or kept from the Custom tab), held across valleys: a season pill applies it
   * where the new season has it and keeps it where not, so going back to a season that has it brings it back. A campaign
   * valley drops it (its character is curated); a loaded save brings its own.
   */
  private preferredClimate: ClimateCharacter | undefined;
  private harvestDiagnosis: string | null = null;
  private statsDirty = true;
  private statsClock = 0;
  private soundClock = Infinity;
  /** The tracks the valley came with (the Depot's stub): not the player's work. */
  private starterTracks: ReadonlySet<number>;
  /** A blackout was toasted: the next waits until the power has come back. */
  private harvestHintSaid = false;
  private blackoutSaid = false;
  private shown = { contours: false, moisture: false, power: false };
  /** The power view (P): every wireless field shown, whatever is in hand. Off by default; not remembered. */
  private powerView = false;
  private uiKey = '';

  constructor(state: GameState, world: World, sound: Soundscape, storedSettings: UiSettings, urlQuality?: UiQuality) {
    this.state = state;
    this.world = world;
    this.sound = sound;
    this.storedSettings = { ...storedSettings };
    this.urlQuality = urlQuality;
    this.savedInfo = savedSlotInfo();
    this.starterTracks = new Set(state.tracks.map((t) => t.id));
    // The sky's clock (the address's ?hour=) is the valley's: the homestead starts at its hour.
    state.sim.hour = world.getHour();
    this.preferredClimate = state.climateOverride;
    this.stats = this.valleyStats();
    this.welcomed = state.things.some((t) => t.kind === 'farmhouse');
    world.onFrame((dt) => this.frame(dt));
  }

  /** The settings in force: the stored ones, with the address's quality over them while it stands. */
  private get settings(): UiSettings {
    return this.urlQuality === undefined ? { ...this.storedSettings } : { ...this.storedSettings, quality: this.urlQuality };
  }

  /** The overlay, once it's built (it needs these callbacks first). */
  attach(ui: UiController) { this.ui = ui; this.uiKey = ''; }

  // ---- The frame ----

  private frame(dt: number) {
    this.panByKeys(dt);
    this.stepHomestead(dt);
    this.feedSound(dt);
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
    if (tick.waterChanged) this.hoverDirty = true;
    if (tick.events.length > 0) this.tell(tick.events);
    else if (this.blackoutSaid && !this.state.sim.powerSummary.anyBlackout) this.blackoutSaid = false;
    this.statsClock += dt;
    if (this.statsClock >= 1 / STATS_HZ || tick.events.length > 0) { this.statsClock = 0; this.statsDirty = true; }
  }

  /** The soundscape follows the valley (a few times a second, paused or not: the wind and the brook still sound). */
  private feedSound(dt: number) {
    this.soundClock += dt;
    if (this.soundClock < 1 / STATS_HZ) return;
    this.soundClock = 0;
    const sim = this.state.sim, w = sim.weather;
    let activeWorkshops = 0;
    for (const r of sim.things.values()) if (r.working) activeWorkshops++;
    this.sound.update({
      windSpeed: w.windSpeed, rain: w.rain, snow: w.snow, floodSurge: w.floodSurge, zoom: this.world.getZoom(), activeWorkshops,
      movingCarts: sim.carts.filter((c) => c.state !== 'idle' && c.state !== 'charging').length, paused: this.world.getSpeed() === 0,
    });
  }

  /**
   * What a tick tells, as toasts: a parcel, a seal, the valley Restored, a blackout (once an episode, until the power is
   * back), the Steady Homestead starting over (with why; it says the blackout too, so a blackout with it isn't said twice).
   * The first ripe field with a blocked haul gets a quiet hint.
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
        case 'seal': case 'restored': ui?.showToast(e.message); this.sound.playChime(); break;
        // The weather turning, and the brook flooding or going down: said calmly, the flood as a warning.
        case 'weather': case 'flood': ui?.showToast(e.message, e.type === 'flood' ? 'warn' : 'info'); break;
        case 'steadyReset': ui?.showToast(e.message, 'warn'); this.blackoutSaid ||= this.state.sim.powerSummary.anyBlackout; break;
        case 'blackout':
          if (!this.blackoutSaid && !reset) ui?.showToast(e.message, 'warn');
          this.blackoutSaid = true;
          break;
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
    if (this.statsDirty) {
      this.stats = this.valleyStats();
      this.harvestDiagnosis = diagnoseIdleCarts(this.state);
      if (this.harvestDiagnosis && !this.harvestHintSaid) {
        this.ui?.showToast(this.harvestDiagnosis);
        this.harvestHintSaid = true;
      }
      this.statsDirty = false;
    }
    const hour = this.world.getHour(), selected = this.selectedView(hour);
    const live = liveWeatherView(this.state), forecast = stationForecast(this.state);
    const snapshot: UiSnapshot = {
      activeTool: this.tool, fieldMode: this.fieldMode, yawMode: this.world.getYawMode(), powerView: this.powerView, hour, day: this.state.sim.day,
      speed: this.world.getSpeed(), weather: uiWeather(this.world.getWeather()), liveWeather: live, forecast, stats: this.stats, selected,
      readout: this.currentReadout(), settings: this.settings, hasSavedGame: this.savedInfo.hasSavedGame,
    };
    if (this.savedInfo.savedAtLabel !== undefined) snapshot.savedAtLabel = this.savedInfo.savedAtLabel;
    if (placedKind(this.tool)) snapshot.placingRotationDeg = compassDeg(this.placeYaw);
    // The weather in the key as the strip shows it (the temperature rounded), so it redraws when the sky turns, not each frame.
    const weatherKey = `${live.spell} ${Math.round(live.tempC)} ${live.locked ? 1 : 0} ${live.detail ?? ''}`;
    const key = [
      snapshot.activeTool, snapshot.fieldMode, snapshot.yawMode, snapshot.powerView, snapshot.day, Math.floor(hour * 60), snapshot.speed, snapshot.weather,
      weatherKey, forecast.map((f) => `${f.day}${f.spell}${Math.round(f.minTempC)}/${Math.round(f.maxTempC)}`).join(','),
      JSON.stringify(this.stats), selected ? JSON.stringify({ ...selected, screenX: 0, screenY: 0, visible: 0 }) : '-',
      snapshot.readout ? `${snapshot.readout.text} ${snapshot.readout.tone}` : '-', snapshot.placingRotationDeg,
      JSON.stringify(this.settings), snapshot.hasSavedGame, snapshot.savedAtLabel ?? '-',
    ].join('|');
    if (key !== this.uiKey) { this.uiKey = key; ui.render(snapshot); }
    if (selected) ui.updateRingPosition(selected.screenX, selected.screenY, selected.visible);
  }

  /** The postcard's figures, with the climate the player chose (the Custom tab offers it again). */
  private valleyStats(): ValleyStats {
    const stats = valleyStats(this.state, this.starterTracks);
    return this.preferredClimate === undefined ? stats : { ...stats, preferredClimate: this.preferredClimate };
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
      yawDeg: compassDeg(t.yaw), refund: this.state.sim.supplies.unlimited ? 0 : def.cost,
    };
    if (status.connected !== undefined) view.connected = status.connected;
    if (def.immovable) view.immovable = true;
    const detail = thingDetail(this.state, t, this.harvestDiagnosis);
    if (detail !== undefined) view.detailLine = detail;
    const r = this.state.sim.things.get(t.id);
    if (t.kind === 'bakery' && r) view.preference = `Recipe: ${r.recipe === 'bread' ? 'Bread' : 'Honey Cake'}`;
    if (t.kind === 'greenhouse' && r) view.preference = `Crop: ${GOOD_LABELS[r.greenhouseCrop].label}`;
    // A byproduct's destination is the player's to choose only once two of its destinations stand to choose between.
    if (isByproductMaker(t.kind) && r && this.byproductChoices(t.kind).length > 2)
      view.preference = `${GOOD_LABELS[BYPRODUCTS[t.kind].good].label} → ${PRIORITY_LABELS[effectivePriority(this.state, r)]}`;
    if (t.kind === 'garage') view.cartControls = cartControls(this.state);
    return view;
  }

  // ---- The soft hints over the grass ----

  /**
   * The wireless fields show only in the power view, or while a power building or relay is picked, placed or moved: open
   * play keeps the valley clear of rings. The watered ground shows while a field tool is in hand, or a Sprinkler or Rain
   * Tank is placed, moved or picked.
   */
  private syncSwitches() {
    const tool = this.tool, sel = this.selected === null ? undefined : this.state.things.find((t) => t.id === this.selected);
    const water = (k: ThingKind | null | undefined) => k === 'sprinkler' || k === 'rain_tank';
    const want = {
      contours: tool === 'channel:dig',
      moisture: isFieldTool(tool) || water(placedKind(tool)) || water(this.moving?.kind) || water(sel?.kind),
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
    if (r.value.steadyReset) this.ui?.showToast(SETUP_CHANGED, 'warn');
    this.world.sync(r.value);
    this.statsDirty = true;
    this.hoverDirty = true;
    this.refreshIfPaused();
    return r.value;
  }

  /** While the clock is stopped, reads the power again as the homestead now stands, and draws it (no time passes). */
  private refreshIfPaused() {
    if (this.world.getSpeed() > 0) return;
    const state = this.state, fresh = refreshPower(state, this.world.getSimEnv());
    this.world.syncSim({ fieldStagesChanged: false, events: [], cartsMoved: false, waterChanged: false, groundChanged: false });
    if (fresh.length > 0) this.tell(fresh.map((n): SimEvent => ({ type: 'blackout', message: state.sim.powerSummary.lastBlackoutReason, id: n.id })));
    this.statsDirty = true;
  }

  // ---- The pointer (input.ts) ----

  pointerDown(button: number, x: number, y: number) {
    if (this.press) return;
    this.pointer = { x, y };
    const press: Press = { button, startX: x, startY: y, lastX: x, lastY: y, mode: button === 1 ? 'pan' : 'pending' };
    if (button === 1) this.lastClick = null;
    // An outline tool lays corners by clicks: a press waits to be a click (or, dragged past the slop, a pan).
    if (button === 0 && !this.moving && isStrokeTool(this.tool) && !this.outlining()) {
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
      this.lastClick = null;
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
    if (this.press) return;
    // An outline under way stays drawn (without its rubber band) while the pointer is away.
    this.world.setPreview(this.outlining() && this.polygon.length > 0 ? this.polygonSpec() : null);
    if (!this.moving) this.readout = null;
  }

  /** A lost pointer (another window took it): what was under way is dropped. */
  pointerCancel() {
    if (this.stroke) this.dropStroke();
    this.press = null;
  }

  /** The wheel: zooms at the pointer, or with Shift turns the ghost being placed or moved. */
  wheel(delta: number, x: number, y: number, shift: boolean) {
    this.lastClick = null;
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
      if (this.selected === null) {
        const at = this.world.hitTerrainAt(x, y), g = this.state.grid;
        const field = at && this.state.fields.find(f => f.id === g.fieldOf[cellIz(g, at.z) * g.nx + cellIx(g, at.x)]);
        if (field) {
          const notes = [GOOD_LABELS[field.crop].label, effectiveMoisture(this.state, field, undefined, this.state.sim.weather.spell) >= 0.32 ? 'Well watered' : 'Dry soil'];
          if (field.pollinated) notes.push('Pollinated');
          if (field.frosted) notes.push('Frosted · regrows once thawed');
          if (field.flooded) notes.push('Flooded · paused until water recedes');
          if (erosionDrain(this.state, field) > 0.02) notes.push('Sloping soil · shelter with beans, trees or hedges');
          this.ui?.showToast(notes.join(' · '));
        }
      }
      return;
    }
    if (kind) { this.placeAt(kind, x, y); return; }
    if (this.outlining()) { this.polygonClick(x, y); return; }
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
    this.sound.playPlace();
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

  // ---- Field outlines ----

  /** Whether the tool in hand lays a field by outline. */
  private outlining(): boolean {
    return isFieldTool(this.tool) && this.fieldMode === 'polygon';
  }

  /** The outline being drawn, for the world, with the pointer's spot (where the next corner would go) if given. */
  private polygonSpec(cursor?: Point2): PreviewSpec {
    const pts = this.polygon, first = pts[0];
    const snapStart = cursor !== undefined && pts.length >= 3 && Math.hypot(cursor.x - first.x, cursor.z - first.z) <= POLYGON_SNAP;
    return { kind: 'fieldPolygon', points: [...pts], cursor, snapStart, erase: this.tool === 'field:erase' };
  }

  /**
   * A click with an outline tool: back on the first corner (of three or more), or the second of a double-click, fills the
   * outline; otherwise it lays the next corner (none on top of the last one: a double-click's first click laid it).
   */
  private polygonClick(x: number, y: number) {
    const now = performance.now(), prev = this.lastClick;
    const double = prev !== null && now - prev.t <= DOUBLE_CLICK_MS && Math.hypot(x - prev.x, y - prev.y) <= DOUBLE_CLICK_PX;
    // The second click of a double-click that already closed the outline: nothing more.
    if (double && prev.closed) { this.lastClick = null; return; }
    const pts = this.polygon;
    if (double && pts.length >= 3) {
      this.lastClick = { t: now, x, y, closed: true };
      this.commitPolygon();
      return;
    }
    const at = this.world.hitTerrainAt(x, y);
    if (!at) { this.lastClick = null; return; }
    const first = pts[0], last = pts[pts.length - 1];
    if (pts.length >= 3 && Math.hypot(at.x - first.x, at.z - first.z) <= POLYGON_SNAP) {
      this.lastClick = { t: now, x, y, closed: true };
      this.commitPolygon();
      return;
    }
    if (last && Math.hypot(at.x - last.x, at.z - last.z) < 0.3) return;
    this.lastClick = { t: now, x, y, closed: false };
    pts.push({ x: at.x, z: at.z });
    this.hoverDirty = true;
  }

  /** Fills the outline drawn (with the crop in hand, or clearing the fields in it), and starts afresh. */
  private commitPolygon() {
    const pts = this.polygon, crop = cropOfTool(this.tool);
    if (pts.length < 3) return;
    this.polygon = [];
    if (this.lastClick) this.lastClick.closed = true;
    this.world.setPreview(null);
    const change = this.act(crop === null ? { type: 'eraseFieldPolygon', points: pts } : { type: 'paintFieldPolygon', crop, points: pts });
    if (change) {
      const area = this.state.fields.reduce((sum, f) => sum + f.areaM2, 0);
      this.ui?.showToast(`${crop === null ? 'Fields cleared' : `${GOOD_LABELS[crop].label} field planted`} · fields ${Math.round(area)} m²`);
    }
    this.hoverDirty = true;
  }

  /** Drops the outline under way: whether there was one. */
  private dropPolygon(): boolean {
    const had = this.polygon.length > 0;
    this.polygon = [];
    this.lastClick = null;
    if (had) { this.world.setPreview(null); this.readout = null; this.hoverDirty = true; }
    return had;
  }

  // ---- Strokes ----

  private flushStroke() {
    const st = this.stroke;
    if (!st) return;
    st.dirty = false;
    const last = st.points[st.points.length - 1];
    switch (st.tool) {
      case 'field:wheat': case 'field:beans': case 'field:tomato': case 'field:sunflower': case 'field:flax': case 'field:erase': {
        const crop = cropOfTool(st.tool), erase = crop === null;
        this.world.setPreview({ kind: 'field', x: last.x, z: last.z, radius: this.brush, erase });
        if (st.sent >= st.points.length) return;
        const seg = st.points.slice(Math.max(0, st.sent - 1));
        st.sent = st.points.length;
        const r = apply(this.state, crop === null
          ? { type: 'eraseField', points: seg, radius: this.brush }
          : { type: 'paintField', crop, points: seg, radius: this.brush });
        if (r.ok) {
          this.world.sync(r.value);
          this.statsDirty = true;
          const area = this.state.fields.reduce((sum, f) => sum + f.areaM2, 0);
          this.readout = { text: `${crop === null ? 'Clearing' : `Painting ${GOOD_LABELS[crop].label.toLowerCase()}`} · fields ${Math.round(area)} m²` };
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
      } else if (this.outlining()) {
        spec = this.polygon.length > 0 || at ? this.polygonSpec(at ?? undefined) : null;
        readout = polygonReadout(cropOfTool(tool), this.polygon, at ?? undefined);
      } else if (isFieldTool(tool)) {
        if (at) spec = { kind: 'field', x: at.x, z: at.z, radius: this.brush, erase: tool === 'field:erase' };
        readout = { text: `${toolDef(tool)?.hint ?? ''} · brush ${this.brush.toFixed(1)} m ([ ] to resize) · M for polygon` };
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

  /** A right click: drops the outline under way, or puts the tool down (or stops a move). */
  private putDown() {
    if (this.moving) this.cancelMove();
    else if (this.dropPolygon()) return;
    else if (this.tool !== 'select') this.onSelectTool('select');
    else if (this.selected !== null) this.select(null);
  }

  // ---- Keys (input.ts); each says whether it took the key ----

  /** Esc, before the overlay sees it: drops a stroke, an outline or a move under way (a second Esc puts the tool down). */
  escape(): boolean {
    if (this.stroke || this.press) {
      if (this.stroke) this.dropStroke();
      this.press = null;
      return true;
    }
    if (this.dropPolygon()) return true;
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
      // With a field tool in hand: M flips between outlining and brushing; Enter fills the outline, Backspace takes back a corner.
      case 'm':
        if (!isFieldTool(this.tool)) return false;
        if (!repeat) this.onSetFieldMode(this.fieldMode === 'polygon' ? 'brush' : 'polygon');
        return true;
      case 'enter':
        if (!this.outlining() || this.polygon.length < 3) return false;
        if (!repeat) this.commitPolygon();
        return true;
      case 'backspace':
        if (!this.outlining() || this.polygon.length === 0) return false;
        this.polygon.pop();
        this.lastClick = null;
        this.hoverDirty = true;
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
    this.dropPolygon();
    this.press = null;
    this.moving = null;
    if (this.selected !== null) this.select(null);
    if (tool !== this.tool) { this.turned = false; this.placeYaw = 0; }
    this.tool = tool;
    this.readout = null;
    this.world.setPreview(null);
    this.hoverDirty = true;
  }

  onSetFieldMode(mode: FieldMode) {
    if (mode === this.fieldMode) return;
    if (this.stroke) this.dropStroke();
    this.dropPolygon();
    this.fieldMode = mode;
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
    const cost = CATALOG[t.kind].cost, back = this.state.sim.supplies.unlimited ? 0 : cost + Math.max(0, carts - 1) * CART_COST;
    const gone = carts > 0 ? ` · its ${carts === 1 ? 'cart goes' : `${carts} carts go`} with it` : '';
    this.ui?.showToast(`${CATALOG[t.kind].label} taken down${back > 0 ? ` · +${back} ${back === 1 ? 'Supply' : 'Supplies'} back` : ''}${gone}`);
  }

  onCyclePreference(id: number) {
    const r = this.state.sim.things.get(id);
    if (!r) return;
    if (r.kind === 'bakery') this.act({ type: 'setRecipe', id, recipe: r.recipe === 'bread' ? 'honey_cake' : 'bread' });
    else if (r.kind === 'greenhouse') this.act({ type: 'setGreenhouseCrop', id, crop: CROPS[(CROPS.indexOf(r.greenhouseCrop) + 1) % CROPS.length] });
    else if (isByproductMaker(r.kind)) {
      // A destination taken down since it was chosen reads as 'auto', so the first click moves straight to the first standing target.
      const choices = this.byproductChoices(r.kind);
      const current = effectivePriority(this.state, r);
      const next = choices[(choices.indexOf(current) + 1) % choices.length];
      this.act({ type: 'setByproductPriority', id, target: next });
    }
  }

  /** Where a byproduct may be sent first now: 'auto', then each of its destinations that stands in the valley. */
  private byproductChoices(kind: ByproductMaker): ByproductTarget[] {
    return BYPRODUCTS[kind].targets.filter((p) => p === 'auto' || this.state.things.some((v) => v.kind === p));
  }

  onBuyCart() {
    if (this.act({ type: 'buyCart' })) this.ui?.showToast('New Electric Cart ready at the Garage');
  }

  onRetireCart(id: number) {
    if (!this.act({ type: 'retireCart', id })) return;
    this.ui?.showToast(this.state.sim.supplies.unlimited ? 'Electric Cart retired'
      : `Electric Cart retired · +${CART_COST} ${CART_COST === 1 ? 'Supply' : 'Supplies'} refunded`);
  }

  onDeselect() { this.select(null); }

  onSetYawMode(mode: YawMode) {
    this.releaseKeys();
    this.world.setYawMode(mode);
  }

  onStepYaw(dir: -1 | 1) { this.world.stepYaw(dir); }
  onTogglePowerView() { this.powerView = !this.powerView; }
  /**
   * A jump on the sky strip moves the homestead's hour with the sky's (the day stays: no time is lived through), so an
   * unfinished Steady Homestead starts over: its hours must be lived. The weather is read again at the new hour (a step of
   * no time: nothing builds up), so the air's warmth, the frost hollows and the sky show it at once, even paused.
   */
  onSetHour(hour: number) {
    this.world.setHour(hour);
    this.state.sim.hour = this.world.getHour();
    stepWeather(this.state, 0, this.state.sim.day, this.state.sim.hour);
    refreshFieldWeather(this.state);
    this.world.syncSim();
    this.statsDirty = true;
    if (resetSteadyOnClockJump(this.state)) { this.ui?.showToast(CLOCK_JUMPED); this.statsDirty = true; }
    this.refreshIfPaused();
  }

  onSetSpeed(speed: Speed) {
    if (speed !== 0) this.lastSpeed = speed;
    this.world.setSpeed(speed);
  }

  /** Locks the weather; the fields' frost and flood are read again at once (paused or not). */
  onSetWeather(weather: Weather) {
    this.world.setWeather(skyWeather(weather));
    refreshFieldWeather(this.state);
    this.refreshIfPaused();
    this.statsDirty = true;
  }

  /** Lets the living weather back in after `?weather=` held it. */
  onClearWeatherLock() {
    this.world.setWeatherOverride(null);
    refreshFieldWeather(this.state);
    this.refreshIfPaused();
    this.statsDirty = true;
    this.ui?.showToast('Living weather resumed');
  }

  /**
   * A fresh valley lives in fresh weather of its own (a new weather seed): the address's locks go. A custom (procedural)
   * valley stays one, with its landform, difficulty and Sandbox (a season pill doesn't throw the player out of it);
   * otherwise, the seed's own meadow. A climate the player chose stays, if the new season has it (and is kept for the next
   * season if not).
   */
  onNewValley(seed: number, season: Season) {
    const s = this.state, weatherSeed = rollWeatherSeed(), at = seed >>> 0;
    const climate = this.climateIn(season);
    if (s.custom) {
      this.startValley(generateProceduralValley({
        seed: at, season, terrain: s.terrain, sandbox: s.sandbox, weatherSeed,
        ...(s.difficulty === undefined ? {} : { difficulty: s.difficulty }), ...(climate === undefined ? {} : { climate }),
      }));
      return;
    }
    this.startValley(generateValley(at, season, {
      weatherSeed, climate: climateFor(at, season), ...(climate === undefined ? {} : { climateOverride: climate }),
    }));
  }

  onStartCampaign(id: string) {
    const r = startCampaignValley(id, rollWeatherSeed());
    if (!r.ok) { this.ui?.showToast(r.error, 'warn'); return; }
    this.preferredClimate = undefined;
    this.startValley(r.value);
    this.ui?.showToast(`Welcome to ${r.value.valleyTitle ?? 'the valley'} · place your Farmhouse to begin`);
  }

  onStartProcedural(req: ProceduralRequest) {
    const { climate: preferred, ...rest } = req;
    this.preferredClimate = preferred;
    const climate = this.climateIn(req.season);
    const next = generateProceduralValley({ ...rest, seed: req.seed >>> 0, weatherSeed: rollWeatherSeed(), ...(climate === undefined ? {} : { climate }) });
    this.startValley(next);
    this.ui?.showToast(next.sandbox
      ? `${next.valleyTitle ?? 'A Sandbox valley'} · Sandbox: build freely, pick the sky from the weather chip`
      : `Welcome to ${next.valleyTitle ?? 'a fresh valley'} · place your Farmhouse to begin`);
  }

  /** The climate the player chose, if the season has it. */
  private climateIn(season: Season): ClimateCharacter | undefined {
    const c = this.preferredClimate;
    return c !== undefined && climatesOf(season).includes(c) ? c : undefined;
  }

  /** A fresh homestead: its own Supplies, brief, Depot and stub, on day 1 at the sky's hour. */
  private startValley(next: GameState) {
    next.sim.hour = this.world.getHour();
    stepWeather(next, 0, next.sim.day, next.sim.hour);
    this.swapState(next, new Set(next.tracks.map((t) => t.id)));
    this.welcomed = false;
  }

  /** A saved homestead, as it stood: its own clock (the sky jumps to its hour), weather and work. */
  private loadState(next: GameState) {
    this.preferredClimate = next.climateOverride;
    this.world.setHour(next.sim.hour);
    // No starter tracks: a loaded homestead is the player's work, so clearing it always asks first.
    this.swapState(next, new Set());
    this.welcomed = next.things.some((t) => t.kind === 'farmhouse');
  }

  /** Puts a different valley in play: the world rebuilt for it, the hints reset, and the address saying what it is. */
  private swapState(next: GameState, starterTracks: ReadonlySet<number>) {
    this.onSelectTool('select');
    this.state = next;
    this.starterTracks = starterTracks;
    this.harvestHintSaid = false;
    this.blackoutSaid = false;
    this.world.resetValley(next);
    this.world.syncSim();
    this.writeValleyUrl(next);
    this.statsDirty = true;
    this.hoverDirty = true;
  }

  /**
   * The address names the valley in play, so a reload (or a shared link) opens the same one: a campaign valley by its id,
   * a custom one by its landform, difficulty (and Sandbox), so even a custom meadow reopens with its own Pantry Order, and
   * the seed's own meadow by its seed and season alone. A climate the player chose goes with it.
   */
  private writeValleyUrl(s: GameState) {
    for (const key of ['weather', 'climate', 'wseed', 'campaign', 'terrain', 'difficulty', 'sandbox']) clearUrlParam(key);
    if (s.campaignId !== undefined) writeUrlParam('campaign', s.campaignId);
    else if (s.custom) {
      writeUrlParam('terrain', s.terrain);
      writeUrlParam('difficulty', s.difficulty ?? 'standard');
      if (s.sandbox) writeUrlParam('sandbox', '1');
    }
    writeUrlParam('seed', String(s.seed));
    writeUrlParam('season', s.season);
    if (s.climateOverride !== undefined) writeUrlParam('climate', s.climateOverride);
    if (s.sim.weatherOverride) writeUrlParam('weather', s.sim.weatherOverride);
  }

  onSaveGame() {
    const r = saveToBrowser(this.state);
    this.savedInfo = savedSlotInfo();
    if (r.ok) this.ui?.showToast('Homestead saved');
    else this.ui?.showToast(r.error, 'warn');
  }

  onLoadGame() {
    const r = loadFromBrowser();
    if (!r.ok) { this.ui?.showToast(r.error, 'warn'); return; }
    this.loadState(r.value);
    this.ui?.showToast('Homestead loaded');
  }

  onExportSave() {
    const r = downloadSaveFile(this.state);
    if (r.ok) this.ui?.showToast('Save file downloaded');
    else this.ui?.showToast(r.error, 'warn');
  }

  onImportSave(json: string) {
    const r = deserializeSave(json);
    if (!r.ok) { this.ui?.showToast(r.error, 'warn'); return; }
    this.loadState(r.value);
    this.ui?.showToast('Save imported');
  }

  /**
   * Changes the player's settings: heard and drawn at once, and remembered (quietly not, where storage is blocked). A
   * `?quality=` in the address is never remembered as the player's: only picking a quality here stores one (and lifts the
   * address's, so a reload keeps the pick).
   */
  onUpdateSettings(patch: Partial<UiSettings>) {
    const stored = mergeSettings(this.storedSettings, patch);
    if (patch.quality !== undefined && stored.quality === patch.quality) {
      this.urlQuality = undefined;
      clearUrlParam('quality');
    }
    this.storedSettings = stored;
    const next = this.settings;
    this.sound.setEnabled(next.sound);
    this.sound.setVolume(next.volume);
    this.world.setQuality(next.quality);
    this.world.setFlashes(next.flashes);
    storeSettings(stored);
  }

  /** Sandbox only: holds the sky at a spell, or lets living weather back in. */
  onPickSandboxWeather(spell: WeatherSpell | null) {
    if (!this.state.sandbox) return;
    this.world.setWeatherOverride(spell);
    refreshFieldWeather(this.state);
    this.refreshIfPaused();
    this.statsDirty = true;
  }

  onCenterHomestead() {
    const home = this.state.things.find((t) => t.kind === 'farmhouse') ?? this.state.valley.homestead;
    this.world.focusOn(home.x, home.z);
  }
}

/** A turn as a compass reads it on screen: degrees clockwise (the game's yaw turns anticlockwise). */
const compassDeg = (yaw: number) => Math.round((((-yaw * 180) / Math.PI) % 360 + 360) % 360);
