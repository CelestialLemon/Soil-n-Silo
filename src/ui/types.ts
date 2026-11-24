// The UI's contract with the rest of the game: what it shows (a `UiSnapshot` the loop hands it) and what it asks for
// (`UiCallbacks`). The UI never reaches into the world or the renderer; it only reads the snapshot and calls back.
import type { Season, ThingKind } from '../game/index.ts';

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
}

/** A live line about the tool in hand, e.g. "Flowing 18 m · stops dry at uphill sill". */
export interface ToolReadout { text: string; tone?: 'neutral' | 'wet' | 'warn' }

export interface ValleyStats {
  seed: number; season: Season; hasFarmhouse: boolean;
  thingCounts: Partial<Record<ThingKind, number>>;
  fieldAreaM2: number; flowingRillM: number; bridgeCount: number;
  /** Everything the player has made: things, fields, rills (wet or dry), tracks, hedgerows and planted trees. */
  landEditCount: number;
}

/** Everything the UI shows, handed to `render` whenever it changes (every frame is fine: unchanged parts cost nothing). */
export interface UiSnapshot {
  activeTool: ToolId;
  yawMode: YawMode;
  /** The power view (P): every wireless power range shown. */
  powerView: boolean;
  /** Time of day, 0 to 24. */
  hour: number;
  speed: Speed;
  weather: Weather;
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
  /** The player's camera setting: a free orbit or snapped 90° views. */
  onSetYawMode(mode: YawMode): void;
  /** Turn the camera: −1 the ⟲ button, +1 the ⟳ one. */
  onStepYaw(dir: -1 | 1): void;
  /** The power view on or off (the sky strip's bolt, or P). */
  onTogglePowerView(): void;
  onSetHour(hour: number): void;
  onSetSpeed(speed: Speed): void;
  onSetWeather(weather: Weather): void;
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
