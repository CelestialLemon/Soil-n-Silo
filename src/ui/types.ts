// The UI's contract with the rest of the game: what it shows (a `UiSnapshot` the loop hands it) and what it asks for
// (`UiCallbacks`). The UI never reaches into the world or the renderer; it only reads the snapshot and calls back.
import type {
  BriefState, ClimateCharacter, DayForecast, Difficulty, ForecastIcon, PowerSummary, Season, TerrainStyle, ThingKind, WeatherSpell,
} from '../game/index.ts';

/** Placing one of the catalog's things (src/game/catalog.ts). */
export type PlaceTool = `place:${ThingKind}`;
/** The free land-craft brushes. */
export type LandTool =
  | 'field:wheat' | 'field:beans' | 'field:tomato' | 'field:sunflower' | 'field:flax' | 'field:erase'
  | 'channel:dig' | 'channel:fill'
  | 'track:draw' | 'hedge:draw' | 'tree:plant'
  /** Clears a track, a hedgerow or a planted tree under the pointer. */
  | 'erase:land';
/** What the pointer does on the valley. `select` inspects, picks things up and pans. */
export type ToolId = 'select' | PlaceTool | LandTool;

/**
 * How a field tool lays a field: outlining it corner by corner (`polygon`, the default: click the corners, then the first
 * again, double-click or Enter to fill it) or painting it with the round brush (`brush`). B flips between them.
 */
export type FieldMode = 'polygon' | 'brush';

/** How the camera turns: a free orbit (the default) or snapped 90° views, the player's setting. */
export type YawMode = 'orbit' | 'snap';
export const SPEEDS = [0, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];
export const WEATHERS = ['clear', 'breeze', 'overcast', 'rain'] as const;
export type Weather = (typeof WEATHERS)[number];

/** The graphics quality setting. */
export type UiQuality = 'low' | 'medium' | 'high';
/** The player's settings, as the Settings popover shows and changes them. */
export interface UiSettings {
  /** Sound on or off (the sky strip's speaker mutes and unmutes it). */
  sound: boolean;
  /** The master volume, 0..1 (the slider shows it as 0–100%). */
  volume: number;
  quality: UiQuality;
  /** Storm flashes on screen (off for players sensitive to flashing light). */
  flashes: boolean;
}

/** A fresh valley from the Valleys panel's Custom tab: a procedural valley, or a Sandbox one. */
export interface ProceduralRequest {
  seed: number;
  season: Season;
  terrain: TerrainStyle;
  difficulty: Difficulty;
  /** Unlimited Supplies and free weather. */
  sandbox: boolean;
  /**
   * The climate the player chose (`?climate=`), kept: the valley takes it if its season has it, else the season's own for
   * its seed (and the choice is still kept for the next valley).
   */
  climate?: ClimateCharacter;
}

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
  /** Sandbox: no limit (the figures above are only kept for the save; show "∞ Sandbox", never "999 free"). */
  unlimited: boolean;
  /** The next milestone drop, e.g. "+4 · First harvest stored in the Silo or a workshop"; null once every drop has come. */
  nextDropHint: string | null;
}

/** A live line about the tool in hand, e.g. "Flowing 18 m · stops dry at uphill sill". */
export interface ToolReadout { text: string; tone?: 'neutral' | 'wet' | 'warn' }

export interface ValleyStats {
  seed: number; season: Season; hasFarmhouse: boolean;
  thingCounts: Partial<Record<ThingKind, number>>;
  fieldAreaM2: number; flowingRillM: number; bridgeCount: number;
  /**
   * Whether the valley holds the player's work or progress (anything built, laid, planted or dug, the starter track
   * taken up, a drop received, goods delivered, a seal begun): clearing it asks first.
   */
  hasProgress: boolean;
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
  /** The valley's own name (a campaign valley's title); left out, the postcard names it from its seed (`valleyName`). */
  valleyTitle?: string;
  /** Its landform, shown beside the climate line ("A wet spring · Terrace"). */
  terrain?: TerrainStyle;
  /** A Sandbox valley: unlimited Supplies and free weather (the sky strip's weather chip picks the sky). */
  sandbox?: boolean;
  /** The campaign valley being played (`CAMPAIGN_VALLEYS`' id); left out for procedural and Sandbox valleys. */
  campaignId?: string;
  /** A custom (procedural) valley, and the difficulty its Supplies were balanced for (the Custom tab opens on them). */
  custom?: boolean;
  difficulty?: Difficulty;
  /**
   * The climate the player chose (`?climate=`), kept across valleys of the seed's meadow and custom ones (a season pill
   * keeps it where the season has it): the Custom tab offers it again. Left out when none was chosen, or in a campaign valley.
   */
  preferredClimate?: ClimateCharacter;
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
  /** How the field tools lay a field (the tool strip's Polygon / Brush pill, shown while a field tool is in hand). */
  fieldMode?: FieldMode;
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
  /** The player's settings; left out, the Settings popover and the speaker stay hidden. */
  settings?: UiSettings;
  /** A saved game is there to load. */
  hasSavedGame?: boolean;
  /** When it was saved, in plain words, e.g. "Saved 10:42" or "Saved yesterday" (beside Load). */
  savedAtLabel?: string;
}

export interface UiCallbacks {
  onSelectTool(tool: ToolId): void;
  /** Lays fields by outline or by brush (the tool strip's Polygon / Brush pill). */
  onSetFieldMode?: (mode: FieldMode) => void;
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
  /** Starts a campaign valley (`CAMPAIGN_VALLEYS`' id); the UI has already asked when it would clear the homestead. */
  onStartCampaign?: (id: string) => void;
  /** Starts a procedural or Sandbox valley; left out, the Custom tab falls back to `onNewValley(seed, season)`. */
  onStartProcedural?: (req: ProceduralRequest) => void;
  /** Saves the game now (the postcard's and the Valleys panel's Save). */
  onSaveGame?: () => void;
  /** Loads the saved game (asked first when it would replace a homestead with work in it). */
  onLoadGame?: () => void;
  /** Downloads the game as a `.json` file. */
  onExportSave?: () => void;
  /** Loads a game from a `.json` file's text (asked first, as Load). A broken file is the caller's to report. */
  onImportSave?: (json: string) => void;
  /** Changes some of the player's settings. */
  onUpdateSettings?: (patch: Partial<UiSettings>) => void;
  /** Sandbox only: holds the sky at a spell, or null to let living weather back in. */
  onPickSandboxWeather?: (spell: WeatherSpell | null) => void;
}

export interface UiController {
  render(snapshot: UiSnapshot): void;
  /** Pins the building card to the selected thing as the camera moves, without touching anything else. */
  updateRingPosition(x: number, y: number, visible: boolean): void;
  showToast(message: string, tone?: 'info' | 'warn'): void;
  dispose(): void;
}
