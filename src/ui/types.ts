// The UI's contract with the rest of the game: what it shows (a `UiSnapshot` the loop hands it) and what it asks for
// (`UiCallbacks`). The UI never reaches into the world or the renderer; it only reads the snapshot and calls back.
import type { BriefState, DayForecast, ForecastIcon, PowerSummary, Season, ThingKind, WeatherSpell } from '../game/index.ts';

/** Placing one of the catalog's things (src/game/catalog.ts). */
export type PlaceTool = `place:${ThingKind}`;
/** The free land-craft brushes. */
export type LandTool =
  | 'field:wheat' | 'field:beans' | 'field:erase'
  | 'channel:dig' | 'channel:fill'
  | 'track:draw' | 'hedge:draw' | 'tree:plant'
  /** Clears a track, a hedgerow or a planted tree under the pointer. */
  | 'erase:land';
/** What the pointer does on the valley. `select` inspects, picks things up and pans. */
export type ToolId = 'select' | PlaceTool | LandTool;

/** How the camera turns: a free orbit (the default) or snapped 90° views, the player's setting. */
export type YawMode = 'orbit' | 'snap';
export const SPEEDS = [0, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];
export const WEATHERS = ['clear', 'breeze', 'overcast', 'rain'] as const;
export type Weather = (typeof WEATHERS)[number];

/** The thing the player clicked, and where it stands on screen (CSS pixels from the canvas's top-left). */
export interface SelectedThingView {
  id: number; kind: ThingKind;
  /** Its name, e.g. "Farmhouse". */
  label: string;
  /** One plain line on how it's doing, e.g. "Ready on a gentle clearing". */
  statusLine: string;
  screenX: number; screenY: number;
  /** False while it's off screen: the card hides. */
  visible: boolean;
  /** Whether it's on a power network; leave it out for things power doesn't touch. */
  connected?: boolean;
  /** Which way it faces, degrees clockwise on the screen's compass (the game's yaw, negated). */
  yawDeg: number;
  /** Fixed in the valley (the Depot): the card is read-only, with no Move, turns or Remove. */
  immovable?: boolean;
  /** The Supplies Remove gives back, in full (its catalog cost): the button reads "Remove (+2)". 0 or left out: "Remove". */
  refund?: number;
  /** An optional second line under the status, e.g. "Stock: 4 Wheat, 2 Flour" or "Battery 72% · Charging". */
  detailLine?: string;
  /** The Garage's cart row: add or retire an Electric Cart right on its card. Left out for everything else. */
  preference?: string;
  cartControls?: CartControls;
}

/** The Garage card's cart row. */
export interface CartControls {
  /** Carts the homestead runs now, and the most it may. */
  count: number; max: number;
  /** The pool can pay for one more (`CART_COST`). */
  canAfford: boolean;
  /** There's a cart to retire (the Garage's own first one stays). */
  canRetire: boolean;
  /** The cart "Retire" sends back (with `canRetire`). */
  retireId?: number;
}

/** The Supplies counter on the tool strip (`suppliesView` builds it from the game's `SuppliesState`). */
export interface SuppliesView {
  /** Free to spend now: `unlocked - spent`. */
  available: number;
  /** Tied up in placed buildings and extra carts (all refundable). */
  spent: number;
  /** What the valley has given so far (the starter parcel and the drops received). */
  unlocked: number;
  /** The valley's hard ceiling. */
  cap: number;
  /** The next milestone drop, e.g. "+4 · First harvest stored in the Silo or a workshop"; null once every drop has come. */
  nextDropHint: string | null;
}

/** A live line about the tool in hand, e.g. "Flowing 18 m · stops dry at uphill sill". */
export interface ToolReadout { text: string; tone?: 'neutral' | 'wet' | 'warn' }

export interface ValleyStats {
  seed: number; season: Season; hasFarmhouse: boolean;
  thingCounts: Partial<Record<ThingKind, number>>;
  fieldAreaM2: number; flowingRillM: number; bridgeCount: number;
  /** Everything the player has made: things, fields, rills (wet or dry), tracks, hedgerows and planted trees. */
  landEditCount: number;
  /** The one capped Supplies pool. */
  supplies: SuppliesView;
  /** The Open Homestead Brief: its three seals and whether the valley is Restored. */
  brief: BriefState;
  /** The Electric Carts running, the most a homestead may run, and whether a Garage stands. */
  cartCount: number; maxCarts: number; hasGarage: boolean;
  /** The whole valley's power balance (the sky strip's power pill). */
  powerSummary: PowerSummary;
  /** The valley's climate character this season, in plain words, e.g. "A wet spring" (under the season pills). */
  climateLabel?: string;
}

/** The weather now, as the sky strip reads it out: "Showers · 11°C". */
export interface LiveWeatherView {
  spell: WeatherSpell;
  /** Its plain name, e.g. "Showers". */
  label: string;
  /** The air's temperature, °C (shown rounded). */
  tempC: number;
  icon: ForecastIcon;
  /** Held by `?weather=`: the readout becomes a button that lets living weather back in (`onClearWeatherLock`). */
  locked?: boolean;
  /** A plain-English tooltip, e.g. the wind and any frost or flood note. */
  detail?: string;
}

/** Everything the UI shows, handed to `render` whenever it changes (every frame is fine: unchanged parts cost nothing). */
export interface UiSnapshot {
  activeTool: ToolId;
  yawMode: YawMode;
  /** The power view (P): every wireless power range shown. */
  powerView: boolean;
  /** Time of day, 0 to 24. */
  hour: number;
  /** The game day, from 1. */
  day: number;
  speed: Speed;
  /** The old four-sky weather; the sky strip falls back to it while `liveWeather` is left out. */
  weather: Weather;
  /** The living weather now; when given, the sky strip shows it instead of `weather`'s chip. */
  liveWeather?: LiveWeatherView;
  /** The Weather Station's days ahead (2–3); left out or empty while no Weather Station stands. */
  forecast?: readonly DayForecast[];
  stats: ValleyStats;
  selected: SelectedThingView | null;
  /** The tool's live readout; null shows the tool's own hint (or nothing, for `select`). */
  readout: ToolReadout | null;
  /** While placing: the ghost's turn, degrees. */
  placingRotationDeg?: number;
}

export interface UiCallbacks {
  onSelectTool(tool: ToolId): void;
  onMoveSelected(id: number): void;
  /**
   * Turns the thing by `deltaRad` in the game's yaw, which turns anticlockwise seen from above: the ring's ↺ sends +π/12
   * and its ↻ −π/12 (15°).
   */
  onRotateSelected(id: number, deltaRad: number): void;
  onRemoveSelected(id: number): void;
  onDeselect(): void;
  /** Buys an Electric Cart at the Garage (its card's "+ Cart"). */
  onCyclePreference(id: number): void;
  onBuyCart(): void;
  /** Retires the cart `id` for a full refund (the Garage card's "Retire"). */
  onRetireCart(id: number): void;
  /** The player's camera setting: a free orbit or snapped 90° views. */
  onSetYawMode(mode: YawMode): void;
  /** Turn the camera: −1 the ⟲ button, +1 the ⟳ one. */
  onStepYaw(dir: -1 | 1): void;
  /** The power view on or off (the sky strip's bolt, or P). */
  onTogglePowerView(): void;
  onSetHour(hour: number): void;
  onSetSpeed(speed: Speed): void;
  onSetWeather(weather: Weather): void;
  /** Lets living weather back in after `?weather=` held it (the locked weather readout's click). */
  onClearWeatherLock?: () => void;
  onNewValley(seed: number, season: Season): void;
  onCenterHomestead(): void;
}

export interface UiController {
  render(snapshot: UiSnapshot): void;
  /** Pins the building card to the selected thing as the camera moves, without touching anything else. */
  updateRingPosition(x: number, y: number, visible: boolean): void;
  showToast(message: string, tone?: 'info' | 'warn'): void;
  dispose(): void;
}
