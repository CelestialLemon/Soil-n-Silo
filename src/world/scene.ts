import type { BuildingId, CropId } from '../game/data.ts';
import type { Relief } from '../game/relief.ts';
import type { Dir, GameState, Route, Status } from '../game/state.ts';
import type { ReportSource } from '../ui/perfOverlay.ts';
import type { Camera } from './camera.ts';
import type { NetLabel, PowerFocus } from './powerView.ts';
import type { StopLabel } from './routeView.ts';
import type { CursorPatch } from './tileCursor.ts';
import type { Overlay } from './view.ts';

// What the game draws through: the one seam between the game's loop (main.ts: the state, input, the HUD and the tools'
// logic) and a renderer. Two scenes stand behind it until the swap (epic #212, #211): the pixel world (pixelScene.ts) and
// brush3d's (brush/scene.ts, behind `?renderer=brush3d`). The loop asks a scene, never a renderer.
//
// Everything here is in the game's world units (camera.ts): a tile is 1 across, x along the map's columns and z along its
// rows, heights as the pixel world draws them. A scene converts to its renderer's own (brush3d: metres, 4 m a tile).

/** A point of the page (CSS px, as pointer events give it), and a map tile. */
export interface PagePoint { x: number; y: number }
export interface Tile { x: number; y: number }

/** The ground's height as the scene draws it, in world units: what the tools stand things on and pick tiles against. */
export interface Heights {
  /** At a point of the world. */
  at(x: number, z: number): number;
  /** Nothing on the map stands above this. */
  readonly top: number;
  /** How high a terrain level stands. */
  level(level: number): number;
  /** Where a building `n` tiles a side stands with its north-west tile at (x, y) (ground.ts's standY). */
  stand(relief: Relief, n: number, x: number, y: number): number;
  /** At (u, v) across map tile (x, y), on its own patch (at a cliff, its own side's). */
  tile(x: number, y: number, u: number, v: number): number;
}

/** What stands under the pointer: its tile (a tree's or rock's own, else the ground's) and the building or truck there. */
export interface Under { tile: Tile | null; building: number | null }

/**
 * Finding what is under the pointer. The tile of ground comes from the camera each frame (the loop's); what stands there
 * comes from the scene's last pick, which can be a frame or two old.
 */
export interface Picker {
  /** What stands under the pointer at `at` now, from the last pick; `ground` is the tile of ground under it this frame. */
  under(state: GameState, at: PagePoint, ground: Tile | null): Under;
  /** Picks at once, waiting for the GPU: for a click, which acts on what it lands on. */
  now(at: PagePoint, ground: Tile | null): void;
  /**
   * Picks again as of the frame just drawn, without waiting: the answer comes a frame or two later, if `still` (the
   * pointer is still on the canvas) and no newer pick was asked. Returns false while a pick is still on its way (ask
   * again next frame).
   */
  request(at: PagePoint, ground: Tile | null, still: () => boolean): boolean;
  /** The pointer has left the canvas: forget what was under it. */
  forget(): void;
  /** Whether what is drawn under the pointer may have changed this frame: something shown or taken away, a truck driving under it. */
  moved(state: GameState, at: PagePoint | null): boolean;
}

/** What would be built, shown see-through: cleared each frame, then shown again for the tool in hand. */
export interface Preview {
  clear(): void;
  /** The frame round a footprint `n` tiles a side, green where it fits (`ok`), centred at (x, z) on ground at height y. */
  frame(n: number, ok: boolean, x: number, y: number, z: number): void;
  /** A building, centred at (x, z) on ground at height y, facing `rot`, tinted for whether it fits. */
  building(type: BuildingId, x: number, y: number, z: number, rot: Dir, ok: boolean): void;
  /** One tile of a field's crop, grown enough to tell apart, at (x, z) on ground at height y. */
  crop(crop: CropId, x: number, y: number, z: number, ok: boolean): void;
}

/** A label or marker the HUD puts on the page, at a point of the world. */
export interface WorldLabel { x: number; y: number; z: number }
export interface MarkerAt extends WorldLabel { id: number; status: Status; need?: string }

/** What the loop has worked out for the frame's world before the tools run. */
export interface SyncFrame {
  /** The frame's seconds (screen clock), and the hour of the game's day. */
  dt: number; hour: number;
  /** Whether the grid and the contour lines show (building, or doing earthworks). */
  lines: boolean;
  /** The game's speed the player picked (1, 2, 4…), paused or not. */
  speed: number;
}

/** What the tools show this frame. */
export interface ShowFrame {
  overlay: Overlay;
  /** Whether the small things in the grass show (they stand aside for the lines and the overlays). */
  details: boolean;
  /** The buildings and trucks tinted for what is focused, and those highlighted (selected, under the pointer). */
  links: number[]; highlight: number[];
  /** The routes drawn on the ground, numbered when there is one. */
  routes: { routes: Route[]; numbers: boolean };
  power: PowerFocus;
}

export interface Scene {
  readonly camera: Camera;
  /** While true the game stands still (brush3d's ?profile runs, #210): main.ts doesn't advance it. */
  readonly held?: () => boolean;
  readonly heights: Heights;
  readonly picker: Picker;
  readonly preview: Preview;
  /** How tall a building's model stands (world units), for its card over it. */
  heightOf(type: BuildingId): number;
  /** Each frame, before anything is picked: the hour, the weather, the ground and the world as the state has them. */
  sync(state: GameState, f: SyncFrame): void;
  /** Each frame, once the tools have run: the overlays, routes, power, links and highlights they show. */
  show(state: GameState, f: ShowFrame): void;
  /** Where a truck is drawn (on the ground), if it is. */
  truckAt(id: number): { x: number; z: number } | null;
  /** The stop numbers of the routes shown, the power networks' labels, and the markers over buildings with a problem. */
  stopLabels(): StopLabel[];
  netLabels(): NetLabel[];
  markerSpots(state: GameState): MarkerAt[];
  /**
   * Draws the frame. `pick` runs where the pointer's pick should see this frame's picture; `lap` times the parts for the
   * frame rate readout. `marks` and `refused` are the tile cursor's marks (the tile pointed at, an earthwork's points).
   */
  render(time: number, f: { pick: () => void; lap: (part: 'geometry' | 'style' | 'pick') => void; marks: CursorPatch[]; refused: CursorPatch[] }): void;
  /** The frame rate readout's report: the machine and the renderer's setup. */
  readonly report: ReportSource;
  /** For checks in the browser console and scripted playtests (`window.game`). */
  readonly debug: Record<string, unknown>;
}
