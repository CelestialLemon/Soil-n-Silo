import * as THREE from 'three';
import { cutIntoTiles, grow as grownBound, TILE_REACH } from './tiles';
import { Pools } from './pools';
import { CAMERA_DISTANCE, ViewCamera } from './camera';
import { CloudMap, MIRROR } from './cloudMap';
import { CLOUD_SHAPE, type CloudShape } from './clouds';
import { lookAt, type Look } from './look';
import { dayOf, REFERENCE_DAY, type Day, type SeasonSettings } from './season';
import { LEAF_STORM, seasonLight, seasonTurn, turnColours } from './seasonLook';
import { CLOUD_DEPTH, CLOUD_NIGHT, gapCover, OVERCAST, overcastLook, skyShare, UNDER_CLOUD_FADE } from './overcast';
import {
  createSharedUniforms, depthMaterial, basisBakeMaterial, groundBakeMaterial, prepassMaterial, sceneMaterial, WATER_REACH, type MaterialKind, type SharedUniforms,
} from './materials';
import { fogNoiseTexture, litFog } from './fog';
import { POST_FRAG, POST_VERT } from './post';
import { Lightning, type Flicker, type Strike } from './lightning';
import { Rain } from './rain';
import { Snowfall } from './snowfall';
import { ShelterMap, type Cover } from './shelter';
import type { PassTimer } from './timer';
import type { Quality } from './quality';
import { WeatherState, type Weather } from './weather';
import { airLook, HEAT, heatShare } from './air';
import { GOLDEN, goldenLook, goldenShape, goldenShare } from './golden';
import { STORM, stormGold, stormLook, VIGNETTE } from './storm';
import { colourLeafStorm, leafStorm, WindField, WindState } from './wind';
import { DustField, type DustSource } from './dust';
import { TreeSprings, type TreeSpec } from './trees';
import { Parts } from './parts';
import { NightLights } from './nightLights';
import { WATER_EASE, WaterField, type WaterMap } from './water';
import { WaterMask } from './waterMask';
import { GROUND_EASE, GroundField, HollowMap, type GroundMap } from './ground';
import { SnowPaint } from './snow';
import { SunMemory } from './frost';
import { earthShares } from './wet';
import type { WindSnapshot } from '../wind/sim';
import { LAND_LOOK, PaintedLand, type LandArea, type LandLook } from '../land/paint';
import type { LandMap, LandPatch, LandRect } from '../land/map';
import { TerrainLand } from '../land/terrain';
import type { TerrainMap, TerrainPatch } from '../land/heightfield';
import { GroundTools, OVERLAY_LOOK, type Grid, type Overlay, type OverlayLook } from './overlay';
import { HIGHLIGHT_LOOK, Marks, type HighlightLook, type Mark } from './marks';
import { OnTop, PREVIEW_LOOK, type Line, type PreviewLook, type PreviewState } from './ontop';
import { Picker, type PickHit } from './pick';

// The renderer: the clouds' shade over the land (#8); a sun shadow map; for the water, the bed drawn without it and the
// scene mirrored in it (both at half size, and only round the water on screen); a multisampled G-buffer (colour plus view
// normal, depth and ink), its silhouettes drawn first so the painting runs only where a surface shows; and a post pass
// that inks the lines, hazes the distance and grades. It draws at the screen's own resolution: no art-pixel grid. docs/PERFORMANCE.md has what each pass costs.

// How much the gusts thicken and thin dust ('strong', the developer's pick of two, #9). A stopgap: the gusts are faint in
// a thick storm, and the wind's gusts are to be rebuilt as fronts sweeping the land, dust with them.
const DUST_GUST = 1.6;
/** Fresh dust's colour (sRGB, as the haze's): the tracks' pale earth, a little lighter in the air. */
const FRESH_DUST = new THREE.Color(0xc8a77a);
/**
 * Noon's shadow detail, the cap's 100% (Quality.shadowCap, #251): the following shadow's texels a CSS pixel of the zoom,
 * across the sun's view and up it. Those of c8 (the busiest map) around noon at zoom 8, the game's, at 1080p: its 4096²
 * map over the narrowest of its windows from 11:00 to 13:00 in the four views, 320 m across and 216 up (12.8 and 19.0
 * texels a metre), so midday is drawn as before #251 whichever way the camera looks. A lower sun's window is narrower
 * (48 m up before dawn), and would otherwise take four times the texels a metre, as many leaf cards drawn into each.
 */
const SHADOW_CAP = { across: 4096 / 320 / 8, up: 4096 / 216 / 8 };
/** A shadowCap, at least 0.05 (a twentieth of noon's; Infinity: no cap); anything else is a caller's bug. */
function checkShadowCap(cap: number): number {
  if (!(cap >= 0.05)) throw new Error(`brush3d: shadowCap must be at least 0.05 (Infinity for none), not ${cap}`);
  return cap;
}

export interface RendererOptions {
  /** Shadow-map size in texels. */
  shadowMapSize?: number;
  /** The square of ground (centre and half-size, metres) the sun's shadow covers. */
  shadowCenter?: THREE.Vector3;
  shadowRadius?: number;
  /**
   * The shadow follows the view, for land bigger than one square can cover sharply: it covers just the ground on
   * screen, snapped to its texels so it holds still under a pan (see followView). Off, it stays on shadowCenter's square.
   */
  shadowFollow?: boolean;
  /** MSAA samples for the G-buffer (0 to turn it off). */
  samples?: number;
  /** Device pixels per CSS pixel to draw at; defaults to the screen's, capped at 2. */
  pixelRatio?: number;
  /** The shelter map's size in texels (1024; 512 to save memory). */
  shelterSize?: number;
  /** The most detail the following shadow is drawn with, as a share of noon's (Quality.shadowCap): at least 0.05, 1 by default. */
  shadowCap?: number;
}

export interface Settings {
  lines: boolean; shadows: boolean; grain: number;
  /** Draw the main view's silhouettes before painting it (depth only), so hidden surfaces aren't painted. */
  prepass: boolean;
  /**
   * Draw the meshes (all but the water) from shared buffers, many in one draw call (#250, pools.ts), rather than one call
   * each. On by default; off for comparing: the same picture.
   */
  pools: boolean;
  /** Draw the water's two passes only round the water on screen. */
  waterScissor: boolean;
  /**
   * Draw the water's two passes only where the water can show and what it reads there (#249: a mask of its footprint
   * in their depth), and leave out of them what can't reach it. Off for comparing: the same picture.
   */
  waterMask: boolean;
  /**
   * With the silhouettes drawn first: paint the leaves in the main view, and everything in the reflection, only where its
   * depth is the silhouette's own (rather than at it or nearer). The same picture; it lets the GPU skip hidden leaf pixels
   * before painting them, where it can. Off for comparing, or for a GPU whose depths don't match exactly.
   */
  equalDepth: boolean;
  /**
   * Draw the things in the air (FALLING): off leaves them out, so the stability tools can measure the land under a storm.
   */
  falling: boolean;
  /**
   * The share of the falling strokes drawn (rain's, snow's to come): 1 at full quality, about a third reduced. It cuts how
   * many there are, not their look.
   */
  fallingShare: number;
  /** Show the shelter map over the frame: what's under cover, and the map from above in the corner. */
  shelterDebug: boolean;
  /**
   * Draw the water's two passes: the scene mirrored in it (reflection) and the bed under it (under). Off only to time them
   * (the profile's cases, Soil-n-Silo#210): the water then shows whatever those targets held last.
   */
  reflection: boolean;
  under: boolean;
  /**
   * Copy the main view's multisampled depth out with its colour (three's resolve). Nothing reads it after, so off is the
   * same picture: three then skips the copy (done once per colour target, so twice) and tells the GPU it may drop the depth
   * (invalidateFramebuffer). On the RX 570 that's 0.45 ms less GPU, yet the frame drawn back to back took 1–5 ms longer
   * (Soil-n-Silo#210), so it stays on until the MacBook's numbers (a tile-based GPU, where dropping it should matter
   * most) say otherwise.
   */
  resolveDepth: boolean;
}

/** What the renderer draws, by kind: the scene's materials, and the rain and snow (rain.ts, snowfall.ts), its own. */
export type DrawnKind = MaterialKind | 'rain' | 'snow';

/** The kinds in the air, which settings.falling leaves out: the leaves the wind lifts, the rain with its veil and rings,
 * and the snow with its whiteout and wisps. Dust is drawn in the haze (post.ts), keyed to the world like a fog's
 * patches, so it stays. */
export const FALLING: readonly DrawnKind[] = ['debris', 'rain', 'snow'];

/** How a mesh takes part in the passes. */
export interface MeshOptions {
  /** Casts a shadow from the sun. */
  castShadow?: boolean;
  /** Is seen through the water (the ground, the stones in the stream bed). */
  under?: boolean;
  /** Is mirrored in the water. */
  reflect?: boolean;
  /**
   * For the ground: the square its brush fields are baked over (see setFields), centred at x, z, `side` metres across and
   * turned `turn` radians about the vertical. It should cover the ground, and not much more. The grass's and crops' brush
   * is baked over the same square.
   */
  fields?: { x: number; z: number; side: number; turn: number };
  /**
   * How it shelters what's under it from rain and snow (see ShelterMap): by default the inked things are roofs ('full': the
   * things people make, solar panels among them) and leaves are crowns ('partial'); nothing else is cover. Flowers and the
   * like are leaves, but no cover.
   */
  cover?: Cover;
  /**
   * Cut into tiles this many metres square, each drawn only when it's in a pass's view (see tiles.ts): for the big meshes
   * of a large map (the ground too: its fields are baked from every tile). Not the water. add() then returns the first
   * tile: remove() takes them all out with it, but moving or hiding it moves or hides only that tile.
   */
  tile?: number;
  /**
   * Drawn only when it's in a pass's view, as one piece (its bounding sphere grown as a tile's is), without being cut:
   * for a small mesh that's added and taken out often (a block of the game's grass), which cutting would slow.
   */
  cull?: boolean;
  /**
   * Turned by the season (seasonLook.ts): its greens take the season's colour. By default the ground and the grass (the
   * reeds among it); flowers' and garden plants' leaves opt in. Crops keep their own colour (their stage is the game's), and
   * so do the trees and what people make.
   */
  seasonal?: boolean;
  /**
   * The game's id for what this mesh draws (a building's, a truck's): a pick that lands on it gives the tag back
   * (Soil-n-Silo#206). It's told by the mesh's box as placed, so a tagged mesh should be one thing.
   */
  tag?: unknown;
}

export class BrushRenderer {
  readonly gl: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly view = new ViewCamera();
  readonly shared: SharedUniforms = createSharedUniforms();
  readonly settings: Settings = { lines: true, shadows: true, grain: 0.012, prepass: true, pools: true, waterScissor: true, waterMask: true, equalDepth: true, falling: true, fallingShare: 1, shelterDebug: false,
    reflection: true, under: true, resolveDepth: true };
  width = 1; height = 1;
  /** Device pixels per CSS pixel asked for (see RendererOptions): the screen's pixels, which the zoom counts in. */
  readonly screenRatio: number;
  /** Device pixels per CSS pixel drawn: screenRatio, or less where that would draw more than maxPixels or maxRatio. */
  pixelRatio: number;
  /**
   * The most device pixels a CSS pixel is drawn with (setMaxRatio): 1 on a high-DPI screen draws one pixel per point, a
   * softer picture scaled up to the screen (Soil-n-Silo#210, the MacBook). No limit by default; an ordinary screen (1) is
   * never changed by it.
   */
  maxRatio = Infinity;
  /** The reflection's size, as a share of its usual half of the frame's (setReflectionScale): 1 as drawn, 0.5 a quarter. */
  reflectionScale = 1;
  /**
   * The most pixels to draw: on a high-DPI screen (the MacBook's) the frame is drawn at fewer pixels than the screen's and
   * scaled up to it, so it costs what the budget was set at. Set it before resize. No limit by default.
   */
  maxPixels = Infinity;
  /** Times each pass when set (tools/profile.ts, the demo's ?profile). */
  timer: PassTimer | null = null;
  /**
   * Where the finished frame goes: the canvas (null), or a target. Profiling draws into a target, as the canvas may make
   * each frame wait for the screen's next refresh (on the MacBook it did).
   */
  output: THREE.WebGLRenderTarget | null = null;
  private gbuffer: THREE.WebGLRenderTarget;
  private shadowTarget: THREE.WebGLRenderTarget;
  private sunCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.5, 400);
  private shadowCenter: THREE.Vector3;
  private shadowRadius: number;
  private shadowFollow: boolean;
  /** The most detail the following shadow is drawn with, a share of noon's (Quality.shadowCap, followView). */
  private shadowCap: number;
  private post: THREE.ShaderMaterial;
  private postScene = new THREE.Scene();
  private postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private materials = new Map<MaterialKind, {
    main: THREE.ShaderMaterial; depth: THREE.ShaderMaterial; prepass: THREE.ShaderMaterial; mirrorPrepass: THREE.ShaderMaterial;
  }>();
  /** What casts the sun's shadow (a set: the shadow pass asks it of every mesh in the scene, every frame, #210). */
  private casters = new Set<THREE.Mesh>();
  /**
   * Each mesh's silhouette twin (the same geometry, depth only), drawn in the main view and the reflection just before
   * the painted meshes, in the same render: three resolves a multisampled target after every render, and a full-size
   * resolve costs a millisecond or so on integrated graphics. Hidden in the other passes.
   */
  private silhouettes = new THREE.Group();
  private twins = new Map<THREE.Mesh, THREE.Mesh>();
  /** The meshes' shared buffers, drawn many meshes to a call (#250). */
  private pools = new Pools(() => this.settings.pools);
  private fields = new Map<MaterialKind, THREE.WebGLRenderTarget>();
  /** The sizes setFields was asked for: baked again when the GPU's context comes back, as a bake's texels go with it. */
  private fieldSizes = new Map<'ground' | 'crop' | 'grass', number>();
  private underTarget: THREE.WebGLRenderTarget;
  private reflectTarget: THREE.WebGLRenderTarget;
  private look: Look | null = null;
  private seasonSet: SeasonSettings | null = null;
  /** The leaves in the air (the wind's), which take the season's colours. */
  private debris!: THREE.Mesh;
  private dayNow: Day = REFERENCE_DAY;
  /** The geometries the season turns (MeshOptions.seasonal), and how many meshes in the scene draw each. */
  private seasonal = new Map<THREE.BufferGeometry, number>();
  /** Their colours as the game sent them, by colour attribute (a tile's copy of a geometry has its own), once turned. */
  private ownColours = new WeakMap<THREE.BufferAttribute, Float32Array>();
  /** The season (setSeason's, as set) each turned geometry's colours are turned for, so they're not turned twice. */
  private turnedFor = new WeakMap<THREE.BufferAttribute, SeasonSettings | null>();
  /** The game's water as drawn (#18): its map, eased between updates, and the sheet drawn from it. */
  readonly water = new WaterField();
  private waterMesh: THREE.Mesh | null = null;
  /** The wind as drawn: the game's, as last given (see setWind), and its map on the GPU. Still until it's given. */
  readonly wind = new WindState();
  readonly windField = new WindField();
  /** Every tree's spring (the renderer's own motion: no game logic reads it). */
  readonly trees = new TreeSprings();
  /**
   * The models' parts that move or change with the game (Soil-n-Silo#205): rotors and wheels turning, running looks and
   * charge rings shown or hidden. ModelSet.addTo takes their slots; a handle (ModelParts) says how each is now.
   */
  readonly parts = new Parts();
  /** The farm's lights at night (#205): how much they glow at the hour, and the pools they throw. */
  private readonly nightLights = new NightLights();
  private windNow: [WindSnapshot, WindSnapshot, number] | null = null;
  /** Fresh dust, lifted by the gusts where the game's map says (see setDustSource; the renderer's own motion). */
  readonly dust = new DustField();
  /** The weather as drawn: the cover as the game sent it, the looks easing towards it (see setWeather). */
  readonly weather = new WeatherState();
  /**
   * What's under cover, seen from above (see ShelterMap), for rain and snow to stop at. Drawn only when cover changes:
   * call shelter.changed() after moving cover; adding a mesh or showing or hiding a kind does it already.
   */
  readonly shelter: ShelterMap;
  /** The game's ground (#14): how deep the snow lies and where the frost is, its map eased between updates (see setGround). */
  readonly ground = new GroundField();
  /** The land's hollows and rises, found from the ground's shape: once, when there's first snow or frost to draw. */
  readonly hollows = new HollowMap();
  /** The lying snow's paint in the hour's light (#14), worked out once a frame. */
  private readonly snow = new SnowPaint();
  /** The sun each spot of the ground has had since dawn, for the frost's melt (#14, frost.ts). */
  private readonly sunMemory: SunMemory;
  /** The game's clock hour as setHour last set it (the frost's sun memory adds by it), or null before. */
  private clockHour: number | null = null;
  /** The sun's height as the light was last set (degrees, below the horizon too). */
  private sunElNow = 90;

  /** The falling rain (#11): its strokes, and the uniforms for its veil and the water's rings. */
  readonly rain: Rain;
  /** Lightning (#12): the game says where and when (strike, flicker); the player's flash setting is lightning.setting. */
  readonly lightning = new Lightning();
  /** Whether the rain is shown (setVisible), apart from whether it's raining. */
  private rainShown = true;
  /** The falling snow and the blizzard (#14): its flakes, and the uniforms for its whiteout and the wisps. */
  readonly snowfall: Snowfall;
  /** Whether the snow is shown (setVisible), apart from whether it's snowing. */
  private snowShown = true;
  /** The cloud field's shade over the land, drawn each frame the clouds move (#8). */
  readonly cloudMap: CloudMap;
  /** The cloud field again, coarser and further out: the sky the water and the solar glass mirror (MIRROR). */
  readonly skyMap: CloudMap;
  /** The clouds' shape (clouds.ts): the game's, the same one it reads its solar panels by. */
  cloudShape: CloudShape = CLOUD_SHAPE;

  // The game's tools on the picture (Soil-n-Silo#206, docs/API.md): the overlay and grid painted on the land, the marks
  // (highlights and tints) on things, what's drawn over the finished picture (previews and lines), and picking.
  private readonly groundTools = new GroundTools();
  private readonly marks: Marks;
  private readonly onTop: OnTop;
  private readonly picker: Picker;
  /** The meshes added with a tag, for picking. */
  private readonly tagged = new Set<THREE.Mesh>();
  /** The camera as the last frame was drawn (picking reads that frame), and whether one has been. */
  private readonly drawnCamera = new THREE.OrthographicCamera();
  private drawn = false;
  /** The water map last sent (setWater), for picking its surface. */
  private waterMap: WaterMap | null = null;

  readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, options: RendererOptions = {}) {
    this.canvas = canvas;
    this.view.screen.canvas = canvas;
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
    // After three's own handler (added first) has made the context afresh.
    onRestored(canvas, new WeakRef(this));
    this.gl.autoClear = false;
    this.screenRatio = options.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);
    this.pixelRatio = this.screenRatio;
    this.view.screen.ratio = this.screenRatio;
    const samples = options.samples ?? 4;
    this.gbuffer = new THREE.WebGLRenderTarget(1, 1, {
      count: 2, samples, type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: true,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    const size = options.shadowMapSize ?? 2048;
    this.shadowTarget = new THREE.WebGLRenderTarget(size, size, { depthBuffer: true });
    this.shadowTarget.depthTexture = new THREE.DepthTexture(size, size, THREE.UnsignedIntType);
    this.shared.uShadowMap.value = this.shadowTarget.depthTexture;
    this.shared.uShadowTexel.value.set(1 / size, 1 / size);
    this.shadowCenter = options.shadowCenter?.clone() ?? new THREE.Vector3();
    this.shadowRadius = options.shadowRadius ?? 30;
    this.shadowFollow = options.shadowFollow ?? false;
    this.shadowCap = checkShadowCap(options.shadowCap ?? 1);
    const half = () => new THREE.WebGLRenderTarget(1, 1, {
      count: 2, type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: true,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    this.shelter = new ShelterMap(options.shelterSize ?? 1024);
    // Every material reads the shelter map, the ground's map and the land's hollows, for lying snow (#14) and wet ground
    // (#11).
    Object.assign(this.shared, this.shelter.uniforms, this.ground.uniforms, this.hollows.uniforms, this.snow.uniforms);
    // The ground's paint reads the tools' overlay and grid (overlay.ts).
    Object.assign(this.shared, this.groundTools.uniforms);
    this.marks = new Marks(this.shared);
    this.onTop = new OnTop(this.shared, (x, z) => this.landAt(x, z), () => this.landRevision);
    this.picker = new Picker({
      landHit: (ray, into) => this.landHit(ray, into),
      waterAt: (x, z) => this.waterAt(x, z),
      tagged: () => this.tagged,
      posed: (g, pose) => this.parts.posed(g, pose),
    });
    this.rain = new Rain(this.shared, this.shelter.uniforms);
    this.scene.add(this.rain.mesh);
    this.snowfall = new Snowfall(this.shared, this.shelter.uniforms);
    this.scene.add(this.snowfall.mesh);
    this.cloudMap = new CloudMap(this.shared);
    this.skyMap = new CloudMap({ uCloudMap: this.shared.uSkyMap, uCloudRect: this.shared.uSkyRect }, MIRROR.size);
    this.sunMemory = new SunMemory(this.shared);
    Object.assign(this.shared, this.sunMemory.uniforms);
    this.underTarget = half();
    this.reflectTarget = half();
    this.shared.uUnder.value = this.underTarget.textures[0];
    this.shared.uUnderAux.value = this.underTarget.textures[1];
    this.shared.uReflect.value = this.reflectTarget.textures[0];

    this.post = new THREE.ShaderMaterial({
      vertexShader: POST_VERT, fragmentShader: POST_FRAG, depthTest: false, depthWrite: false,
      uniforms: {
        tColor: { value: this.gbuffer.textures[0] }, tAux: { value: this.gbuffer.textures[1] },
        uResolution: { value: new THREE.Vector2(1, 1) }, uLineWidth: { value: 1.5 }, uLines: { value: 1 },
        uTargetDepth: { value: CAMERA_DISTANCE }, uHazeColor: { value: new THREE.Color() }, uHazeDensity: { value: 0.02 },
        uHazeMax: { value: 0.4 }, uHazeFloor: { value: 0 }, uSkyTop: { value: new THREE.Color() }, uSkyBottom: { value: new THREE.Color() },
        uExposure: { value: 1 }, uSaturation: { value: 1 }, uNightShift: { value: 0 }, uShadeHue: { value: 0 }, uGrain: { value: 0.012 }, uVignette: { value: VIGNETTE },
        uCamPos: { value: new THREE.Vector3() }, uCamRight: { value: new THREE.Vector3() }, uCamUp: { value: new THREE.Vector3() },
        uCamFwd: { value: new THREE.Vector3() }, uFogColor: { value: new THREE.Color() }, uFog: { value: new THREE.Vector4() },
        tFogNoise: { value: fogNoiseTexture() },
        uDust: { value: new THREE.Vector3() }, uFogFrame: { value: new THREE.Vector4(1, 0, 1, 0) },
        uFogNext: { value: new THREE.Vector4(1, 0, 1, 0) }, uFogFade: { value: 0 }, uFogStreak: { value: new THREE.Vector2() },
        uWindSpeed: this.shared.uWindSpeed, uWindDir: this.shared.uWindDir, tWindA: this.shared.tWindA, tWindB: this.shared.tWindB,
        uWindBlend: this.shared.uWindBlend, uWindGrid: this.shared.uWindGrid, uWindOn: this.shared.uWindOn, tWindUsual: this.shared.tWindUsual,
        uShimmer: { value: new THREE.Vector2() },
        tDustA: { value: this.dust.a }, tDustB: { value: this.dust.b }, uDustBlend: { value: 0 },
        uDustGrid: { value: this.dust.grid }, uDustOn: { value: 0 }, uDustColor: { value: new THREE.Color() }, uDustReach: { value: 4.5 },
        ...this.rain.veil,
        // The blizzard's whiteout, and the wisps over the lying snow (which read the ground's map, the land's height and
        // its shelter, from the hollows map).
        ...this.snowfall.veil, ...this.ground.uniforms, ...this.shelter.uniforms, ...this.hollows.uniforms,
        ...this.lightning.post, ...this.nightLights.post, uShadowMap: this.shared.uShadowMap, uShadowMatrix: this.shared.uShadowMatrix,
        uShadowTexel: this.shared.uShadowTexel, uShadowArea: this.shared.uShadowArea,
        ...this.marks.post,
      },
    });
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post));
    this.silhouettes.visible = false;
    this.scene.add(this.silhouettes);
    this.pools.hook(this.scene);
    // Leaves in the air, for strong winds: the renderer's own, round wherever the camera is.
    this.debris = this.add(leafStorm(), 'debris', { castShadow: false });
  }

  /**
   * The game's wind, each frame: its last two ticks' snapshots and how far the frame is between them, 0..1 (the wind
   * client's prev, cur and alpha; see src/wind and docs/WIND.md). Drawn exactly as given. With no game wind,
   * steadyWind gives one: setWind(w, w, 0).
   */
  setWind(prev: WindSnapshot, cur: WindSnapshot, alpha: number) {
    this.wind.set(prev, cur, alpha);
    this.windField.set(prev, cur, alpha);
    // Dust lifts only in a dust storm (a dust haze), a minor one too: half its full strength at a thin haze, none once the
    // haze has thinned away (it keeps its kind as it goes).
    const w = this.weather;
    this.dust.storm = w.dust * THREE.MathUtils.smoothstep(w.haze, 0, 0.1) * Math.min(1, 0.5 + w.haze / 0.5);
    this.dust.set(prev, cur, alpha);
    this.windNow = [prev, cur, alpha];
  }

  /**
   * A new wind, not the last one carried on (a level loading, the demo starting a wind afresh): the drawn wind's own
   * clock, the trees' springs and the fresh dust start again from rest at the next setWind.
   */
  restartWind() { this.wind.restart(); this.trees.restart(); this.dust.restart(); }

  /**
   * Sets the renderer's clock (seconds, render's `time`) without drawing: a map sent next (setWater, setGround) starts its
   * ease from there. render sets it too.
   */
  setTime(time: number) { this.shared.uTime.value = time; }

  /**
   * Where dust can lift (#36): the game's map of bare, dry ground (DustSource), sent again when the ground dries or wets.
   * In a dust storm (the weather's dust haze), a gust lifts dust there, which the wind carries off and which lingers a
   * few seconds. Null: none.
   */
  setDustSource(source: DustSource | null) { this.dust.setSource(source); }

  /**
   * The weather the game wants (see Weather, and WEATHER_PRESETS for shorthands). The cloud cover is drawn exactly as given;
   * the looks (the light, rain and snow, heat, haze) ease towards it over a second or two, hiding the steps between the
   * game's updates; 'immediate' puts them there at once (a level loading, a screenshot).
   */
  setWeather(weather: Weather, immediate = false) { this.weather.set(weather, immediate); }

  /**
   * A lightning strike where the game says, now (#12): a bolt, a flash of the whole picture (within the flash limits,
   * whatever the game asks: see lightning.ts) and a glow where it landed. The land's height unless y is given.
   */
  strike(strike: Strike) {
    const land = (this.land ??= LandHeights.from(this.scene)) ?? LandHeights.FLAT;
    this.lightning.strike(strike, (x, z) => land.at(x, z), this.view.target, this.view.heading);
  }

  /** Distant lightning, now (#12): the scene softly lit, no bolt. The game calls each one. */
  flicker(flicker?: Flicker) { this.lightning.flicker(flicker); }

  /** The shared material of a kind (one per renderer, so meshes of a kind batch their state). */
  material(kind: MaterialKind) {
    let m = this.materials.get(kind);
    if (!m) {
      m = {
        main: sceneMaterial(kind, this.shared), depth: depthMaterial(kind, this.shared),
        prepass: prepassMaterial(kind, this.shared), mirrorPrepass: prepassMaterial(kind, this.shared, true),
      };
      // The rain's rings on the water, fewer under cover.
      if (kind === 'water') Object.assign(m.main.uniforms, this.shelter.uniforms, this.rain.uniforms);
      this.materials.set(kind, m);
    }
    return m.main;
  }

  /** Adds a mesh of a kind. By default it casts a shadow and is mirrored in the water (water itself is neither). */
  add(geometry: THREE.BufferGeometry, kind: MaterialKind, options: MeshOptions = {}): THREE.Mesh {
    if (options.tile && kind !== 'water') {
      // Returns the first tile, standing for them all to remove(). Cut from the game's colours, if the season has turned
      // them (the geometry is drawn already), so each tile keeps its own to turn.
      const colour = geometry.getAttribute('color') as THREE.BufferAttribute | undefined, own = colour && this.ownColours.get(colour);
      const turned = own && Float32Array.from(colour.array as Float32Array);
      if (own) (colour.array as Float32Array).set(own);
      const cut = cutIntoTiles(geometry, options.tile);
      if (turned) colour.array.set(turned);
      const tiles = cut.map((g) => this.addOne(g, kind, options, true));
      tiles[0].userData.tiles = tiles;
      // The tiles cut here are the renderer's own, so remove() frees them; the geometry given stays the caller's.
      for (const t of tiles) t.userData.cut = t.geometry !== geometry;
      return tiles[0];
    }
    if (options.cull && kind !== 'water') return this.addOne(grownBound(geometry), kind, options, true);
    return this.addOne(geometry, kind, options, false);
  }

  private addOne(geometry: THREE.BufferGeometry, kind: MaterialKind, options: MeshOptions, cull: boolean) {
    // Its trees join the springs, numbered across every mesh (the same tree's wood and leaves, the same spring).
    const trees = geometry.userData.trees as TreeSpec[] | undefined, ids = geometry.getAttribute('aTreeId');
    if (trees?.length && ids) {
      const map = this.trees.add(trees), a = ids.array as Float32Array;
      // -1: no tree's (what a builder made outside any).
      for (let i = 0; i < a.length; i++) a[i] = a[i] < 0 ? -1 : map[a[i]];
      geometry.userData.trees = undefined;
      // The springs it holds, let go when it's taken out (remove) or a tree out of it (removeTree).
      geometry.userData.springs = new Set(map);
    }
    // The parts it draws (ModelSet.addTo), held while it is.
    const parts = geometry.userData.parts as Set<number> | undefined;
    if (parts?.size) { this.parts.hold(parts); this.parts.sweep(geometry); this.shared.tPartPose.value = this.parts.texture; }
    const seasonal = options.seasonal ?? (kind === 'ground' || kind === 'grass');
    // Where the ground is earth (#11, wet.ts), from the game's colours, before the season turns them.
    const colour = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (kind === 'ground' && colour && !geometry.getAttribute('aEarth')) {
      geometry.setAttribute('aEarth', new THREE.BufferAttribute(earthShares(this.ownColours.get(colour) ?? colour.array), 1));
    }
    if (seasonal) this.seasonal.set(geometry, (this.seasonal.get(geometry) ?? 0) + 1);
    this.turn(geometry);
    const mesh = new THREE.Mesh(geometry, this.material(kind));
    mesh.userData.seasonal = seasonal;
    mesh.frustumCulled = cull;
    mesh.userData.kind = kind;
    mesh.userData.under = options.under ?? false;
    mesh.userData.reflect = options.reflect ?? kind !== 'water';
    mesh.userData.fields = options.fields;
    mesh.userData.cover = options.cover ?? (kind === 'ink' ? 'full' : kind === 'foliage' ? 'partial' : 'none');
    if (options.tag !== undefined) { mesh.userData.tag = options.tag; this.tagged.add(mesh); }
    // Only where it stands is drawn again in the shelter map (the ground's is found again whole, below).
    const cover = mesh.userData.cover as Cover;
    if (cover !== 'none' && kind !== 'ground') this.shelter.add(mesh, cover);
    this.scene.add(mesh);
    if (kind === 'ground') this.groundMoved(null);
    if (options.castShadow ?? kind !== 'water') this.casters.add(mesh);
    const twin = new THREE.Mesh(geometry, this.materials.get(kind)!.prepass);
    twin.frustumCulled = cull;
    twin.renderOrder = -1;
    twin.matrixAutoUpdate = false;
    twin.matrixWorldAutoUpdate = false;
    this.silhouettes.add(twin);
    this.twins.set(mesh, twin);
    // Its vertices go into the shared buffers, drawn with the others' (its twin's too: the same geometry). Not the water's,
    // one mesh with uniforms of its own.
    if (kind !== 'water') this.pools.add(geometry);
    return mesh;
  }

  /**
   * Takes out a mesh added before (a building removed): from the scene, the sun's shadow, the silhouettes and the shelter.
   * A mesh cut into tiles goes whole, its tiles' geometry freed; a geometry the caller gave is the caller's to dispose.
   */
  remove(mesh: THREE.Mesh) {
    // A mesh cut into tiles goes whole.
    const tiles = mesh.userData.tiles as THREE.Mesh[] | undefined;
    if (tiles) { for (const t of tiles) { t.userData.tiles = undefined; this.remove(t); } return; }
    this.scene.remove(mesh);
    this.tagged.delete(mesh);
    this.marks.forget(mesh);
    const springs = mesh.geometry.userData.springs as Set<number> | undefined;
    if (springs) { this.trees.release(springs); mesh.geometry.userData.springs = undefined; }
    const parts = mesh.geometry.userData.parts as Set<number> | undefined;
    if (parts?.size) this.parts.release(parts);
    this.pools.remove(mesh.geometry, !mesh.userData.cut);
    if (mesh.userData.cut) mesh.geometry.dispose();
    if (mesh.userData.seasonal) this.unseason(mesh.geometry);
    this.casters.delete(mesh);
    const twin = this.twins.get(mesh);
    if (twin) { this.silhouettes.remove(twin); this.twins.delete(mesh); }
    const cover = mesh.userData.cover as Cover;
    if (cover !== 'none' && mesh.userData.kind !== 'ground') this.shelter.remove(mesh, cover);
    if (mesh.userData.kind === 'ground') this.groundMoved(null);
  }

  /**
   * Takes the trees standing at `at` (each [x, z], m) out of meshes added before, without building them again (trees
   * cleared in play, Soil-n-Silo#204): every triangle of each (wood, leaves, the litter a grove lays under it) is folded
   * to one of its corners, so it draws nothing in any pass (a leaf's card too, however the shader spreads it), its spring
   * is let go and the shelter is drawn again where it stood. `meshes` are what add() returned for the trees (a tiled one
   * stands for its tiles). The geometry is changed in place, so give each tree's geometry to one mesh only. Returns how
   * many of them were there.
   */
  removeTrees(meshes: THREE.Mesh[], at: [number, number][]) {
    return this.changeTrees(meshes, at.map(([x, z]) => ({ x, z, dy: 0 })), true);
  }

  /**
   * Raises (or lowers) trees in meshes added before, each whole by its `dy` (m), without building them again: the ground
   * under them moved a little (earthworks near them). As removeTrees, the geometry is changed in place.
   */
  moveTrees(meshes: THREE.Mesh[], moves: { x: number; z: number; dy: number }[]) {
    return this.changeTrees(meshes, moves, false);
  }

  /**
   * Folds (`remove`) or moves by their dy the trees at the points given, in one pass over each of `meshes`, sends up what
   * changed and draws the shelter again over where they stood and stand; folded, the meshes let go of their springs.
   * Returns how many of the trees were found.
   */
  private changeTrees(meshes: THREE.Mesh[], trees: { x: number; z: number; dy: number }[], remove: boolean) {
    const dyOf = new Map<number, number>();
    for (const t of trees) for (const id of this.trees.at(t.x, t.z)) dyOf.set(id, t.dy);
    if (!dyOf.size) return 0;
    const found = new Set<number>(), box = new THREE.Box3(), p = new THREE.Vector3();
    for (const top of meshes) for (const mesh of (top.userData.tiles as THREE.Mesh[] | undefined) ?? [top]) {
      const g = mesh.geometry, held = g.userData.springs as Set<number> | undefined;
      const mine = held ? [...dyOf.keys()].filter((i) => held.has(i)) : [];
      if (!mine.length) continue;
      const pos = g.getAttribute('position') as THREE.BufferAttribute, id = g.getAttribute('aTreeId') as THREE.BufferAttribute;
      let lo = -1, hi = -1;
      box.makeEmpty();
      for (let i = 0; i < id.count; i++) {
        const t = id.getX(i), dy = dyOf.get(t);
        if (dy === undefined) continue;
        box.expandByPoint(p.fromBufferAttribute(pos, i));
        if (!remove) { pos.setY(i, pos.getY(i) + dy); box.expandByPoint(p.fromBufferAttribute(pos, i)); }
        found.add(t);
        if (lo < 0) lo = i;
        hi = i;
      }
      if (remove) { for (const i of mine) held!.delete(i); this.trees.release(mine); }
      if (lo < 0) continue;
      if (remove) {
        // Each of its triangles folded onto its first corner (a builder's triangle is one tree's).
        const index = g.getIndex();
        let t0 = -1, t1 = -1;
        if (index) for (let i = 0; i < index.count; i += 3) {
          const c = index.getX(i);
          if (!dyOf.has(id.getX(c))) continue;
          index.setX(i + 1, c); index.setX(i + 2, c);
          if (t0 < 0) t0 = i;
          t1 = i + 3;
        }
        if (t0 >= 0) { index!.addUpdateRange(t0, t1 - t0); index!.needsUpdate = true; }
      } else {
        // Its vertices lie together (a tree is grown at once), so only their run goes up again; the bounds grow to hold it.
        pos.addUpdateRange(lo * 3, (hi - lo + 1) * 3);
        pos.needsUpdate = true;
        g.boundingBox?.union(box);
        g.boundingSphere?.union(box.getBoundingSphere(new THREE.Sphere()));
      }
      const cover = mesh.userData.cover as Cover;
      if (cover !== 'none') { mesh.updateMatrixWorld(); this.shelter.changedIn(cover, box.applyMatrix4(mesh.matrixWorld)); }
    }
    return found.size;
  }

  /**
   * Runs `change` (ground meshes added and taken out) as one change to the ground, within `area` (the whole world if
   * null): what follows the ground's shape is found again once, after it, and only within `area` where it can be. The
   * land's earthworks swap their chunks this way (land/paint.ts).
   */
  changeGround(area: THREE.Box3 | null, change: () => void) {
    const outer = this.groundChange;
    this.groundChange = outer ?? { area: new THREE.Box3() };
    const was = this.groundChange.area;
    if (was) { if (area) was.union(area); else this.groundChange.area = null; }
    try { change(); } finally {
      if (!outer) { const { area: all } = this.groundChange; this.groundChange = null; this.groundMoved(all, true); }
    }
  }
  /**
   * What add works out from a ground mesh's geometry (where it's earth, its box), worked out ahead, so adding it later
   * costs less: the land's chunks are prepared as they're painted, a few a frame.
   */
  prepare(geometry: THREE.BufferGeometry) {
    const colour = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (colour && !geometry.getAttribute('aEarth')) geometry.setAttribute('aEarth', new THREE.BufferAttribute(earthShares(this.ownColours.get(colour) ?? colour.array), 1));
    // Turned by the season now, a few a frame, not all together as they're swapped in (add turns it again only if the
    // season's changed since).
    if (colour) this.turnColour(colour);
    geometry.computeBoundingBox();
  }
  /**
   * Bakes the ground's fields (setFields) again within `area` (metres; null: all of it): its meshes there drawn flat over
   * the square, only that part of the texture cleared and drawn.
   */
  private bakeGround(area: THREE.Box3 | null) {
    const target = this.fields.get('ground'), main = this.materials.get('ground')?.main;
    if (!target || !main) return;
    const map = main.uniforms.uFieldsMap.value as THREE.Matrix3, size = target.width;
    let rect: THREE.Vector4 | null = null;
    /** Where on the land the cleared texels lie: every mesh there is drawn again (more than the area, for the padding). */
    const reach = new THREE.Box2();
    if (area) {
      // Its corners on the texture (the square may be turned), and a few texels round them for the filtering.
      const uv = new THREE.Box2(), p = new THREE.Vector3();
      for (const x of [area.min.x, area.max.x]) for (const z of [area.min.z, area.max.z]) {
        p.set(x, z, 1).applyMatrix3(map);
        uv.expandByPoint(new THREE.Vector2(p.x, p.y));
      }
      const x0 = Math.max(0, Math.floor(uv.min.x * size) - 2), y0 = Math.max(0, Math.floor(uv.min.y * size) - 2);
      const x1 = Math.min(size, Math.ceil(uv.max.x * size) + 2), y1 = Math.min(size, Math.ceil(uv.max.y * size) + 2);
      if (x1 <= x0 || y1 <= y0) return;
      rect = new THREE.Vector4(x0, y0, x1 - x0, y1 - y0);
      const toLand = map.clone().invert();
      for (const u of [x0, x1]) for (const v of [y0, y1]) {
        p.set(u / size, v / size, 1).applyMatrix3(toLand);
        reach.expandByPoint(new THREE.Vector2(p.x, p.y));
      }
    }
    // (Kept while it's baked: made anew for each earthwork, its shader would be compiled again each time.)
    const material = (this.groundBaker ??= groundBakeMaterial(this.shared, map));
    material.uniforms.uFieldsMap.value = map;
    const scene = new THREE.Scene(), box = new THREE.Box3();
    this.pools.hook(scene);
    // Every piece of it, if it was cut into tiles (those in the area).
    for (const piece of this.scene.children) {
      const mesh = piece as THREE.Mesh;
      if (piece.userData.kind !== 'ground' || !piece.userData.fields || !mesh.isMesh) continue;
      piece.updateMatrixWorld();
      if (area) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        box.copy(mesh.geometry.boundingBox!).applyMatrix4(piece.matrixWorld);
        if (box.max.x < reach.min.x || box.min.x > reach.max.x || box.max.z < reach.min.y || box.min.z > reach.max.y) continue;
      }
      const flat = new THREE.Mesh(mesh.geometry, material);
      flat.frustumCulled = false;
      flat.matrixWorld.copy(piece.matrixWorld);
      flat.matrixAutoUpdate = false;
      flat.matrixWorldAutoUpdate = false;
      scene.add(flat);
    }
    target.scissorTest = rect !== null;
    if (rect) target.scissor.copy(rect);
    this.gl.setRenderTarget(target);
    this.gl.setClearColor(0x808080, 1);
    this.gl.clear(true, false, false);
    this.gl.render(scene, this.postCamera);
    target.scissorTest = false;
    this.gl.setRenderTarget(null);
  }
  private groundBaker: THREE.ShaderMaterial | null = null;

  /** The ground change changeGround is in the middle of (and where), if any. */
  private groundChange: { area: THREE.Box3 | null } | null = null;

  /**
   * The ground's shape changed (within `area`, or anywhere): its lowest and highest points, its shelter map (the rain lands
   * on it), its hollows, the cloud map's square and its heights, found again. Not yet, in the middle of a changeGround.
   */
  private groundMoved(area: THREE.Box3 | null, now = false) {
    if (this.groundChange && !now) return;
    this.measureGround();
    // Within the area changed only, where it's known (an earthwork's chunks).
    if (area) { this.shelter.changedIn('land', area); this.hollows.changedIn(area); } else { this.shelter.changed(); this.hollows.changed(); }
    this.cloudArea = false;
    this.land = area && this.land ? this.land.refresh(this.scene, area) : null;
    // Its brush fields, if baked (setFields), baked again there.
    this.bakeGround(area);
  }

  /**
   * Bakes a kind's brush fields into `size`² textures, so its paint reads them rather than working them out in every pixel
   * every frame (the light and the wind stay live); 0 works them out live again. Call after the scene is built.
   * - 'ground': the ground (added with `fields`) drawn flat over its square. Its steep faces (a cliff's) and whatever lies
   *   past the square stay live. Baked again where the ground changes (changeGround's area, #210), so an earthwork needs
   *   no new bake.
   * - 'grass', 'crop': by place, not by mesh, over the ground's square: the brush on the flat at seven angles, for each
   *   brush scale (up to eight) the kind's meshes use now. So crops can grow, be harvested and be sown anew with no new
   *   bake, unless at a new brush scale. A crop's sides (its edges) stay live.
   * Returns whether it baked.
   */
  /** Bakes again every field asked for (the GPU's context lost and restored took their texels with it). */
  rebakeFields() { for (const [kind, size] of [...this.fieldSizes]) this.setFields(kind, size); }

  setFields(kind: 'ground' | 'crop' | 'grass', size: number): boolean {
    if (size > 0) this.fieldSizes.set(kind, size); else this.fieldSizes.delete(kind);
    const main = this.materials.get(kind)?.main;
    this.fields.get(kind)?.dispose();
    this.fields.delete(kind);
    if (kind === 'ground') { this.groundBaker?.dispose(); this.groundBaker = null; }
    if (!main) return false;
    delete main.defines.FIELDS;
    delete main.defines.BASIS;
    main.needsUpdate = true;
    const meshes = this.scene.children.filter((o): o is THREE.Mesh => o.userData.kind === kind);
    const ground = this.scene.children.find((o) => o.userData.kind === 'ground' && o.userData.fields) as THREE.Mesh | undefined;
    const square = ground?.userData.fields as MeshOptions['fields'];
    if (size <= 0 || !ground || !square) return false;
    // x and z to 0..1 across the square: take the centre off, turn back, scale.
    const c = Math.cos(square.turn) / square.side, sn = Math.sin(square.turn) / square.side;
    const map = new THREE.Matrix3().set(c, -sn, 0.5 - c * square.x + sn * square.z, sn, c, 0.5 - sn * square.x - c * square.z, 0, 0, 1);
    const options = {
      type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false,
    } as const;
    const scene = new THREE.Scene();
    const bake = (target: THREE.WebGLRenderTarget, layer = 0) => {
      this.gl.setRenderTarget(target, layer);
      this.gl.setClearColor(0x808080, 1);
      this.gl.clear(true, false, false);
      this.gl.render(scene, this.postCamera);
    };
    let target: THREE.WebGLRenderTarget;
    if (kind !== 'ground') {
      const scales = [...new Set(meshes.flatMap((m) => {
        const a = m.geometry.getAttribute('aPaint');
        return Array.from({ length: a.count }, (_, i) => a.getY(i));
      }))];
      if (scales.length === 0 || scales.length > 8) return false;
      target = new THREE.WebGLArrayRenderTarget(size, size, scales.length * 7, options);
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
      quad.frustumCulled = false;
      scene.add(quad);
      const unmap = map.clone().invert();
      scales.forEach((scale, i) => {
        for (let layer = 0; layer < 7; layer++) {
          const material = basisBakeMaterial(this.shared, unmap, scale, layer);
          quad.material = material;
          bake(target, i * 7 + layer);
          material.dispose();
        }
      });
      quad.geometry.dispose();
      main.uniforms.uBasis = { value: target.texture };
      main.uniforms.uBasisScales = { value: scales };
      main.defines.BASIS = scales.length;
    } else {
      target = new THREE.WebGLRenderTarget(size, size, options);
      main.uniforms.uFields = { value: target.texture };
      main.defines.FIELDS = 1;
    }
    this.gl.setRenderTarget(null);
    this.fields.set(kind, target);
    main.uniforms.uFieldsMap = { value: map };
    if (kind === 'ground') this.bakeGround(null);
    return true;
  }

  /**
   * Sets how the painting meets the depth: after the silhouettes it only reads it (they wrote it already, and a pass that
   * doesn't write depth lets the GPU throw hidden pixels away before painting them), at equal depth for the kinds `equal`
   * picks; without them, the usual nearer-or-equal test, writing.
   */
  private paintOver(silhouettes: boolean, equal: (kind: MaterialKind) => boolean) {
    for (const [kind, m] of this.materials) {
      m.main.depthWrite = !silhouettes;
      m.main.depthFunc = silhouettes && equal(kind) ? THREE.EqualDepth : THREE.LessEqualDepth;
    }
  }

  /** Shows or hides every mesh of a kind (for A/B comparisons). */
  setVisible(kind: DrawnKind, visible: boolean) {
    if (kind === 'rain') { this.rainShown = visible; return; }
    if (kind === 'snow') { this.snowShown = visible; return; }
    if (kind === 'water') {
      this.waterShown = visible;
      if (this.waterMesh) this.waterMesh.visible = visible && this.water.any;
      return;
    }
    for (const o of this.scene.children) {
      if (o.userData.kind !== kind || o.visible === visible) continue;
      o.visible = visible;
      if (o.userData.cover !== 'none' || kind === 'ground') this.shelter.changed();
    }
  }

  /**
   * The game's water (#18, see WaterMap): its surface, flow and mud over a grid, sent again whenever it changes. A changed
   * map eases in over `ease` seconds (a moment by default, so a rising flood creeps rather than steps; 0 at once, for a
   * level loading or a screenshot). Null: no water.
   */
  setWater(map: WaterMap | null, ease = WATER_EASE) {
    const before = this.water.geometry;
    this.waterMap = map;
    this.water.set(map, this.shared.uTime.value, ease);
    const s = this.shared;
    s.tWaterA.value = this.water.a; s.tWaterB.value = this.water.b; s.uWaterGrid.value.copy(this.water.grid);
    s.tIceA.value = this.water.iceA; s.tIceB.value = this.water.iceB; s.uIceOn.value = this.water.iced ? 1 : 0;
    if (this.water.geometry !== before || !this.waterMesh) {
      if (this.waterMesh) this.remove(this.waterMesh);
      this.waterMesh = this.water.geometry ? this.add(this.water.geometry, 'water') : null;
    }
    if (this.waterMesh) this.waterMesh.visible = this.water.any && this.waterShown;
    this.measureGround();
  }
  /** Whether the water is shown (setVisible), apart from whether there is any. */
  private waterShown = true;

  /**
   * The land from the game's map (Soil-n-Silo#202, docs/LAND.md): its levels, cliffs, the water's beds and the country
   * round it, painted by the renderer. Sent once a level; a second call replaces the first. Earthworks go to updateLand.
   */
  setLand(map: LandMap, look: LandLook = LAND_LOOK) {
    this.painted?.dispose();
    this.painted = new PaintedLand(this, map, look);
    this.painted.onSwap = (area) => { for (const f of this.landChanged) f(area); };
    this.landsSet++;
    // The old land's area and the new one's: whatever lay on either may have to move.
    const was = this.landArea, now = { x0: map.x0, z0: map.z0, x1: map.x0 + map.width * map.tile, z1: map.z0 + map.height * map.tile };
    this.landArea = now;
    const all = was ? { x0: Math.min(was.x0, now.x0), z0: Math.min(was.z0, now.z0), x1: Math.max(was.x1, now.x1), z1: Math.max(was.z1, now.z1) } : now;
    for (const f of this.landChanged) f(all);
  }

  /**
   * The land as continuous terrain (docs/API.md): the game's own heights at the corners of a grid of cells (1 m, say), two
   * triangles a cell, with no levels, cliffs or beds worked out by the renderer (the heights hold them already), painted
   * as setLand's land is, in chunks of about 16 m. Replaces the land setLand or setTerrain sent before; changes to it go to
   * updateTerrain. landAt, landHit, landColourAt, bedAt, countryAt, landAhead and onLandChange answer for it as for setLand's.
   */
  setTerrain(map: TerrainMap, look: LandLook = LAND_LOOK) {
    this.painted?.dispose();
    this.painted = new TerrainLand(this, map, look);
    this.painted.onSwap = (area) => { for (const f of this.landChanged) f(area); };
    this.landsSet++;
    const was = this.landArea, now = { x0: map.x0, z0: map.z0, x1: map.x0 + map.nx * map.cell, z1: map.z0 + map.nz * map.cell };
    this.landArea = now;
    const all = was ? { x0: Math.min(was.x0, now.x0), z0: Math.min(was.z0, now.z0), x1: Math.max(was.x1, now.x1), z1: Math.max(was.z1, now.z1) } : now;
    for (const f of this.landChanged) f(all);
  }

  /**
   * A change to the terrain setTerrain sent (an earthwork, a rill dug, a field worked): the new values over the cells in
   * `rect` (TerrainPatch: the heights of their (width + 1) × (height + 1) corners, the rest per cell). landAt and landHit
   * answer for it at once (landAhead); its chunks (and only those round it) are painted again over the next few frames and
   * swapped in together, when onLandChange is told where. Returns how many cells changed (0 if the land is setLand's).
   */
  updateTerrain(rect: LandRect, patch: TerrainPatch): number { return this.painted instanceof TerrainLand ? this.painted.update(rect, patch) : 0; }

  private landArea: LandArea | null = null;
  private painted: PaintedLand | TerrainLand | null = null;
  private landsSet = 0;
  /** Changes whenever the land as drawn does (a new land, an earthwork swapped in). */
  private get landRevision() { return `${this.landsSet} ${this.painted?.revision ?? 0}`; }
  private readonly landChanged = new Set<(area: LandArea) => void>();

  /**
   * Calls `f` whenever the land as drawn changes (a new land, an earthwork swapped in), with where (metres) its height or
   * paint may have changed, as the frame that first draws it begins: what the game stands on the land (grass) can be
   * hidden or made again there before it's drawn on the old. Returns what stops it.
   */
  onLandChange(f: (area: LandArea) => void): () => void {
    this.landChanged.add(f);
    return () => { this.landChanged.delete(f); };
  }

  /**
   * An earthwork (or anything else that changes the land's tiles): the new values for the tiles in `rect` (LandPatch, each
   * array over the rectangle alone). Only the ground round them is fitted and painted again, over the next few frames
   * (a few milliseconds each): the ground fitted again first (landAt and landHit answer for the new ground from then), then
   * its chunks painted and swapped in together once they're all painted. Earthworks given meanwhile wait their turn.
   * Returns how many tiles changed.
   */
  updateLand(rect: LandRect, patch: LandPatch): number { return this.painted instanceof PaintedLand ? this.painted.update(rect, patch) : 0; }

  /** The land's height (m) at a point of the world, as drawn (setLand's; 0 before there is one). */
  landAt(x: number, z: number): number { return this.painted?.heightAt(x, z) ?? 0; }

  /**
   * Whether landAt and landHit answer for an earthwork's new ground that isn't drawn yet (fitted, its chunks still being
   * painted), and landColourAt for its shores' banks and beds: something set on the land meanwhile would float over or sink
   * into the ground on screen till it's swapped in, or take the new bank's colour.
   */
  get landAhead(): boolean { return this.painted?.ahead ?? false; }

  /**
   * The land's painted colour (linear RGB, before season turning) at a point of the world (m), as drawn (setLand's;
   * meadow green before there is one).
   */
  landColourAt(x: number, z: number, into = new THREE.Color()): THREE.Color {
    return this.painted ? this.painted.landColourAt(x, z, into) : into.setHex(0x5a9848);
  }

  /**
   * How deep the bed of the water's shores lies at a point of the world (m), as drawn (setLand's): 0 to 1 of its deepest,
   * 0 on dry ground; the ground is drawn as dry bank (no shingle, no bed) below `BANK_DRY` (shared.ts). 0 before there's a land.
   * While `landAhead`, the new ground's, as landAt's.
   */
  bedAt(x: number, z: number): number { return this.painted?.bedAt(x, z) ?? 0; }

  /**
   * How far a point of the world (m) is into the duller country round the map, as drawn (setLand's): 0 on the map, 1 out
   * in the country, fading in between along the soft border's wandering curve (Soil-n-Silo#269); 0 before there's a land.
   */
  countryAt(x: number, z: number): number { return this.painted?.countryAt(x, z) ?? 0; }

  /** Where a line of sight (view.rayAt) first meets the land as drawn, or null if it misses or there's no land yet. */
  landHit(ray: THREE.Ray, into?: THREE.Vector3): THREE.Vector3 | null { return this.painted?.hit(ray, into) ?? null; }

  /**
   * The game's ground (#14, #11, see GroundMap and docs/GROUND.md): how deep the snow lies, where the frost is, how wet
   * the land is and how muddy, over a grid as the water's is, sent again whenever it changes. A changed map eases in over
   * `ease` seconds (0 at once). None settles or wets under a roof, and less under a crown: that, and how a thin cover
   * breaks along the land, are the renderer's.
   * Null: bare everywhere.
   */
  setGround(map: GroundMap | null, ease = GROUND_EASE) { this.ground.set(map, this.shared.uTime.value, ease); }



  /**
   * The land's lowest and highest points. A haze on the ground starts just under the lowest land: the ground's lowest
   * point (it's laid in world space, its brush baked by place), or the water's bed if lower. The view sits back far enough
   * to see the highest (ViewCamera.landTop).
   */
  private measureGround() {
    let low = this.water.floor === null ? Infinity : this.water.floor - 1, top = -Infinity;
    for (const o of this.scene.children) {
      if (o.userData.kind !== 'ground') continue;
      const g = (o as THREE.Mesh).geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      low = Math.min(low, g.boundingBox!.min.y);
      top = Math.max(top, g.boundingBox!.max.y);
    }
    if (Number.isFinite(low)) this.weather.setGround(low - 0.5);
    this.view.landTop = top;
  }

  // ---- The game's tools on the picture (Soil-n-Silo#206, docs/API.md) ----

  /**
   * A colour per tile washed over the land (Overlay: the game's fertility, ground, height, water, power, roads or bees), or
   * null for none. Painted in the land's own light, under what stands on it; sent again when it changes.
   */
  setOverlay(overlay: Overlay | null) { this.groundTools.setOverlay(overlay); }
  /** How an overlay is painted (OVERLAY_LOOK, a wash in the land's light, by default; the game's player picks it). */
  setOverlayLook(look: OverlayLook = OVERLAY_LOOK) { this.groundTools.setLook(look); }

  /** The tile grid and the contour lines over the map's tiles while the player builds or does earthworks, or null. */
  setGrid(grid: Grid | null) { this.groundTools.setGrid(grid); }

  /**
   * The lines of a group (`group`: the game's own name for them, say 'routes', 'power', 'frames'), replacing that group's
   * last; null or none clears it. Drawn over the finished picture, hidden behind what stands in front (ontop.ts).
   */
  setLines(lines: readonly Line[] | null, group = 'lines') { this.onTop.setLines(lines, group); }

  /**
   * What the player is about to build: `geometry` (the caller's, with its colours) drawn as a blueprint in the colour for
   * whether it fits (PREVIEW_LOOK). Never picked, casting no shadow; place it by the mesh returned, take it out with removePreview.
   */
  addPreview(geometry: THREE.BufferGeometry, state: PreviewState): THREE.Mesh { return this.onTop.addPreview(geometry, state); }
  /** How previews are drawn (PREVIEW_LOOK, the blueprint, by default). */
  setPreviewLook(look: PreviewLook = PREVIEW_LOOK) { this.onTop.setLook(look); }
  setPreview(mesh: THREE.Mesh, state: PreviewState) { this.onTop.setPreview(mesh, state); }
  removePreview(mesh: THREE.Mesh) { this.onTop.removePreview(mesh); }

  /** A mesh's marks: highlighted (under the pointer, selected), tinted (in focus), or null for none (marks.ts). */
  setMark(mesh: THREE.Mesh, mark: Mark | null) { this.marks.set(mesh, mark); }

  /** How a highlight is drawn (HIGHLIGHT_LOOK, a crisp outline, by default; the game's player picks it). */
  setHighlightLook(look: HighlightLook = HIGHLIGHT_LOOK) { this.marks.setLook(look, this.pixelRatio); }

  /**
   * What's under a point of the page (CSS pixels, as pointer events give it) in the frame last drawn, at once: waits for
   * the GPU, so for a click. Null over the sky or off the picture (pick.ts).
   */
  pick(clientX: number, clientY: number): PickHit | null {
    const at = this.pickAt(clientX, clientY);
    if (!at) return null;
    this.picker.copy(this.gl, this.gbuffer.textures[1], at.x, at.y, this.height);
    return this.picker.hit(this.picker.read(this.gl), this.drawnCamera, at.ndc, at.px);
  }

  /** The same, without stalling: the answer comes a frame or two later, as of the frame last drawn (for hovering). */
  async requestPick(clientX: number, clientY: number): Promise<PickHit | null> {
    const at = this.pickAt(clientX, clientY);
    if (!at) return null;
    this.picker.copy(this.gl, this.gbuffer.textures[1], at.x, at.y, this.height);
    // The camera, the things and their moving parts as the picture was drawn: by the time the pixels come back, they may
    // have moved.
    const camera = this.drawnCamera.clone(), placed = this.picker.snapshot(), pose = this.parts.pose().slice();
    return this.picker.hit(await this.picker.readAsync(this.gl), camera, at.ndc, at.px, placed, pose);
  }

  /** A point of the page as a pixel of the picture drawn and as the camera's -1..1, or null if off it. */
  private pickAt(clientX: number, clientY: number) {
    if (!this.drawn) return null;
    const r = this.canvas.getBoundingClientRect(), u = (clientX - r.left) / r.width, v = (clientY - r.top) / r.height;
    if (!(u >= 0 && u < 1 && v >= 0 && v < 1)) return null;
    // The pixel the pointer is in, and the camera's -1..1 at its middle (where the pick looks along).
    const x = Math.floor(u * this.width), y = Math.floor(v * this.height);
    return { x, y, ndc: new THREE.Vector2((x + 0.5) / this.width * 2 - 1, 1 - (y + 0.5) / this.height * 2), px: new THREE.Vector2(2 / this.width, 2 / this.height) };
  }

  /** The water's surface (m) at a point, from the map last sent, or null where it's dry. */
  private waterAt(x: number, z: number): number | null {
    const m = this.waterMap;
    if (!m) return null;
    const i = Math.floor((x - m.x0) / m.cell), j = Math.floor((z - m.z0) / m.cell);
    if (i < 0 || j < 0 || i >= m.nx || j >= m.nz) return null;
    const level = m.level[j * m.nx + i];
    return Number.isFinite(level) ? level : null;
  }

  resize(cssWidth: number, cssHeight: number) {
    this.pixelRatio = Math.min(this.screenRatio, this.maxRatio, Math.sqrt(this.maxPixels / Math.max(1, cssWidth * cssHeight)));
    this.gl.setPixelRatio(this.pixelRatio);
    this.gl.setSize(cssWidth, cssHeight, false);
    this.view.screen.width = cssWidth; this.view.screen.height = cssHeight;
    // The canvas's own size (three rounds a fractional ratio down).
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.gbuffer.setSize(this.width, this.height);
    const hw = Math.max(1, Math.round(this.width / 2)), hh = Math.max(1, Math.round(this.height / 2));
    this.underTarget.setSize(hw, hh);
    const rs = this.reflectionScale;
    this.reflectTarget.setSize(Math.max(1, Math.round(hw * rs)), Math.max(1, Math.round(hh * rs)));
    this.marks.setSize(this.width, this.height, this.pixelRatio);
    this.onTop.setSize(this.width, this.height);
    this.shared.uScreen.value.set(this.width, this.height);
    (this.post.uniforms.uResolution.value as THREE.Vector2).set(this.width, this.height);
  }

  /** Draws at most `ratio` device pixels a CSS pixel from the next frame (maxRatio; Infinity: no limit). */
  setMaxRatio(ratio: number) {
    if (ratio === this.maxRatio) return;
    this.maxRatio = ratio;
    const { width, height } = this.view.screen;
    if (width > 0 && height > 0) this.resize(width, height);
  }

  /** Draws the reflection at `scale` of its usual size from the next frame (reflectionScale). */
  setReflectionScale(scale: number) {
    if (scale === this.reflectionScale) return;
    this.reflectionScale = scale;
    const { width, height } = this.view.screen;
    if (width > 0 && height > 0) this.resize(width, height);
  }

  /** The quality drawn at (see setQuality). */
  get quality(): Quality {
    return { samples: this.gbuffer.samples, shadowMapSize: this.shadowTarget.width, shadowCap: this.shadowCap, shelterSize: this.shelter.size, maxPixels: this.maxPixels, reflectionScale: this.reflectionScale };
  }

  /**
   * Draws at `q` from the next frame (#209: the game's settings panel, QUALITY's presets), without a reload: only what
   * changed is made again (the frame's buffers, the shadow map, the shelter map, which is then drawn again).
   */
  setQuality(q: Quality) {
    checkShadowCap(q.shadowCap);
    const now = this.quality;
    if (q.samples !== now.samples) { this.gbuffer.samples = q.samples; this.gbuffer.dispose(); }
    if (q.shadowMapSize !== now.shadowMapSize) {
      this.shadowTarget.setSize(q.shadowMapSize, q.shadowMapSize);
      this.shared.uShadowTexel.value.set(1 / q.shadowMapSize, 1 / q.shadowMapSize);
    }
    // A held spacing (followView) was the old map's and cap's.
    if (q.shadowMapSize !== now.shadowMapSize || q.shadowCap !== now.shadowCap) { this.shadowPitch = [0, 0]; this.flashShadowPitch = [0, 0]; }
    this.shadowCap = q.shadowCap;
    this.shelter.resize(q.shelterSize);
    if (q.maxPixels !== now.maxPixels || q.reflectionScale !== now.reflectionScale) {
      this.maxPixels = q.maxPixels; this.reflectionScale = q.reflectionScale;
      const { width, height } = this.view.screen;
      if (width > 0 && height > 0) this.resize(width, height);
    }
  }

  /** The hour's look; the weather is laid over it as each frame is drawn. */
  setLook(look: Look) { this.look = look; }

  /**
   * The level's season (#13), set once per level: its sunrise and sunset (the game's, which its solar power follows), and
   * from them the day the hour's looks follow (season.ts). Until it's set (or set to null), the looks keep the reference
   * day's hours.
   */
  setSeason(season: SeasonSettings | null) {
    this.seasonSet = season && { ...season };
    this.dayNow = season ? dayOf(season) : REFERENCE_DAY;
    // Its colours, turned once here (the season holds all level): from each mesh's own, as the game sent them.
    for (const g of this.seasonal.keys()) this.turn(g);
    colourLeafStorm(this.debris.geometry, season ? LEAF_STORM[season.season] : null);
  }
  /** A seasonal geometry's mesh is taken out: with its last, its colours go back to the game's. */
  private unseason(geometry: THREE.BufferGeometry) {
    const users = this.seasonal.get(geometry);
    if (users === undefined) return;
    if (users > 1) { this.seasonal.set(geometry, users - 1); return; }
    this.seasonal.delete(geometry);
    const colour = geometry.getAttribute('color') as THREE.BufferAttribute | undefined, own = colour && this.ownColours.get(colour);
    if (!colour || !own) return;
    // Not while another seasonal geometry draws the same colours.
    for (const g of this.seasonal.keys()) if (g.getAttribute('color') === colour) return;
    (colour.array as Float32Array).set(own);
    colour.needsUpdate = true;
    this.ownColours.delete(colour);
    this.turnedFor.delete(colour);
  }
  /** Turns a seasonal geometry's colours by the season, from its own (kept the first time). */
  private turn(geometry: THREE.BufferGeometry) {
    if (!this.seasonal.has(geometry)) return;
    const colour = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (colour) this.turnColour(colour);
  }
  /** Turns colours by the season, from their own (kept the first time), unless they're turned for it already. */
  private turnColour(colour: THREE.BufferAttribute) {
    if (this.turnedFor.has(colour) && this.turnedFor.get(colour) === this.seasonSet) return;
    const t = seasonTurn(this.seasonSet);
    let own = this.ownColours.get(colour);
    // Untouched while no season has turned it: no copy kept.
    if (!own && t.shift === 0 && t.chroma === 1 && t.light === 0) return;
    if (!own) this.ownColours.set(colour, own = Float32Array.from(colour.array as Float32Array));
    turnColours(own, colour.array as Float32Array, t);
    colour.needsUpdate = true;
    this.turnedFor.set(colour, this.seasonSet);
  }
  /** The season as set, or null before setSeason. */
  get season(): SeasonSettings | null { return this.seasonSet && { ...this.seasonSet }; }
  /** The day the hour's looks follow: the season's, or the reference day's. */
  get day(): Day { return this.dayNow; }

  /** Sets the look at a clock hour of the season's day (look.ts's lookAt): what the game calls as its clock runs. */
  setHour(hour: number) { this.look = seasonLight(lookAt(hour, this.dayNow), this.seasonSet); this.clockHour = hour; }

  /**
   * Sets the light's uniforms from the hour's look under the weather as drawn. Three looks: the grade's (the post pass's
   * haze, sky and exposure) under the cover as eased; the light in the gaps between the clouds; and the light under a
   * cloud, the overcast look's, which each pixel mixes in by the cloud's shade there (CLOUD_LIGHT). With no cloud the
   * three are the clear look; under full cover all three are the overcast one, as before the clouds (#7).
   */
  private applyLook(clear: Look) {
    const cover = this.weather.overcast, r = OVERCAST;
    // The cloud shadows are as strong as the sun is direct: none before dawn, faint by the moon. Where they're weak the
    // cover lies over the whole picture, as it did before the clouds; where they're strong the gaps are in the sun.
    const dim = THREE.MathUtils.smoothstep(clear.sunEl, -8, 6);
    // The lamps from dusk, and the pools of their light (#205).
    this.nightLights.update(this.shared, this.parts, clear.night, this.shared.uViewTarget.value);
    const strength = dim * THREE.MathUtils.lerp(1, CLOUD_NIGHT, clear.night);
    const gap = THREE.MathUtils.lerp(cover, gapCover(cover), strength);
    // What dust and the heat do to the light (air.ts), laid over each.
    const w = this.weather, air = (l: Look) => airLook(l, w, HEAT);
    // A storm (storm.ts) darkens the light under a cloud, the gaps' as far as they've turned overcast (the sun in a gap is
    // still the sun), and the grade as far as the sky is covered.
    const st = w.storm, stormy = (l: Look, k: number) => stormLook(l, st * k);
    // Golden hour under a deck (golden.ts): the light under the cloud turned back towards the low sun's, and the gaps' as
    // far as they've turned overcast; the grade only in its haze's colour. Under a storm, at any hour of the day, in gold.
    const g = goldenShare(w.sunUnder, clear, cover, st) * strength, breaking = stormGold(clear, st);
    const gold = (l: Look, k: number) => goldenLook(l, breaking, GOLDEN, g * k);
    const graded = stormy(overcastLook(clear, cover, r), cover), grade = air({ ...graded, hazeColor: gold(graded, cover).hazeColor });
    const look = air(gold(stormy(overcastLook(clear, gap, r), gap), gap)), under = air(gold(stormy(overcastLook(clear, 1, r), 1), 1));
    const s = this.shared, rs = goldenShape(r, GOLDEN, g);
    const shape = skyShare(gap), lift = shape * rs.shadowLift;
    s.uOvercast.value.set(shape * rs.sky, shape * rs.shadowFade, shape * rs.shadowBlur);
    s.uCloudOvercast.value.set(rs.sky, THREE.MathUtils.lerp(THREE.MathUtils.lerp(UNDER_CLOUD_FADE, r.shadowFade, lift), rs.shadowFade, g), rs.shadowBlur);
    s.uCloudStrength.value = strength;
    const az = THREE.MathUtils.degToRad(look.sunAz), el = THREE.MathUtils.degToRad(Math.max(look.sunEl, 4));
    this.sunElNow = look.sunEl;
    s.uSunDir.value.set(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el)).normalize();
    // The shadows that are left fall from the sky's brightest part, overhead, the thicker the cloud.
    this.shadowDir.copy(s.uSunDir.value);
    if (lift > 0) this.shadowDir.lerp(new THREE.Vector3(0, 1, 0), lift).normalize();
    // Below the horizon the sun still lights the scene from low down, dimmed: dusk and dawn stay readable.
    s.uSunColor.value.copy(look.sunColor).lerp(look.skyColor, 1 - dim);
    s.uCloudSunColor.value.copy(under.sunColor).lerp(under.skyColor, 1 - dim);
    s.uSkyColor.value.copy(look.skyColor);
    s.uRimColor.value.copy(look.rimColor).multiplyScalar(dim);
    s.uCloudRimColor.value.copy(under.rimColor).multiplyScalar(dim);
    const rad = THREE.MathUtils.degToRad;
    s.uShadeHue.value = rad(look.shadeHue); s.uShadeLean.value = look.shadeLean; s.uShadeDepth.value = look.shadeDepth;
    s.uLitHue.value = rad(look.litHue); s.uLitLean.value = look.litLean;
    // The exposures over the grade's, which the post pass lays over everything.
    s.uLightExposure.value = look.exposure / grade.exposure;
    const deeper = THREE.MathUtils.lerp(CLOUD_DEPTH, 1, gap);
    s.uCloudBands.value.set(rad(((under.shadeHue - look.shadeHue + 540) % 360) - 180), under.shadeDepth, under.litLean, (under.exposure * deeper) / grade.exposure);
    // A storm's lit tint and shade lean under a cloud, from the gaps': only under a storm, so without one every frame is
    // as it was (the gaps' and a cloud's lit hue can differ a little in golden light under part cover; left as it was).
    if (st > 0) s.uCloudTint.value.set(rad(((under.litHue - look.litHue + 540) % 360) - 180), under.shadeLean - look.shadeLean);
    else s.uCloudTint.value.set(0, 0);
    // The lying snow's paint in that light (#14), in the gaps and under a cloud (its lit hue a storm's tint, as the shaders').
    this.snow.update(
      { shadeHue: look.shadeHue, litHue: look.litHue, sky: s.uOvercast.value.x, sunColor: s.uSunColor.value, skyColor: look.skyColor },
      { shadeHue: look.shadeHue + s.uCloudBands.value.x * 180 / Math.PI, litHue: look.litHue + s.uCloudTint.value.x * 180 / Math.PI, sky: s.uCloudOvercast.value.x, sunColor: s.uCloudSunColor.value, skyColor: look.skyColor },
    );
    const u = this.post.uniforms;
    (u.uHazeColor.value as THREE.Color).copy(grade.hazeColor); u.uHazeDensity.value = grade.hazeDensity; u.uHazeMax.value = grade.hazeMax; u.uHazeFloor.value = grade.hazeFloor;
    (u.uSkyTop.value as THREE.Color).copy(grade.skyTop); (u.uSkyBottom.value as THREE.Color).copy(grade.skyBottom);
    s.uSkyTop.value.copy(grade.skyTop); s.uSkyBottom.value.copy(grade.skyBottom);
    // The sky the water and the solar glass mirror: the gaps', and the clouds in it, lit by the hour (dimly by the moon),
    // thickening into the overcast sky as it closes.
    s.uGapSkyTop.value.copy(look.skyTop); s.uGapSkyBottom.value.copy(look.skyBottom);
    s.uCloudBelly.value.copy(under.skyTop).lerp(under.skyBottom, 0.25);
    // The deck stays as grey in the mirror when the low sun lights the land under it: by the gaps' change of light, which
    // is the light under a cloud's once the sky has closed (under part cover, where the gaps are in the sun, it's none).
    if (g > 0) s.uCloudBelly.value.multiplyScalar(air(stormy(overcastLook(clear, gap, r), gap)).exposure / look.exposure);
    const sun = clear.sunColor, warm = new THREE.Color(1, 1, 1).lerp(sun.clone().multiplyScalar(1 / Math.max(sun.r, sun.g, sun.b, 1e-3)), 0.85);
    s.uCloudLit.value.copy(look.skyBottom).lerp(warm, 0.7 * THREE.MathUtils.lerp(0.15, 1, dim));
    s.uSkyClosed.value = gap;
    u.uVignette.value = THREE.MathUtils.lerp(VIGNETTE, STORM.vignette, st * cover);
    u.uExposure.value = grade.exposure; u.uSaturation.value = grade.saturation; u.uNightShift.value = grade.nightShift; u.uShadeHue.value = rad(grade.shadeHue);
    // Lightning, over the hour and the weather (and before the fog takes its colour from the light).
    this.lightning.light(s);
    if (this.lightning.aiming) this.shadowDir.copy(this.lightning.boltLight);
    this.applyFog();
    (u.uShimmer.value as THREE.Vector2).set(heatShare(look, w.heat) * HEAT.shimmer, this.shared.uTime.value);
    this.updateSunCamera();
  }

  /**
   * The fog's uniforms from the weather as drawn and the light just set. Its colour is the game's in noon's clear light,
   * lit by the hour's sun and sky as they are now (pink-gold at dawn, moonlight blue at night, the grey day's light under
   * cloud); the exposure dims it with everything else. Wind thins it and drags it out downwind.
   */
  private applyFog() {
    const w = this.weather, wind = this.wind, u = this.post.uniforms, s = this.shared;
    litFog(u.uFogColor.value as THREE.Color, w.hazeColor, s.uSunColor.value, s.uSkyColor.value);
    // A fog thins in the wind; dust is what the wind lifts.
    const thin = THREE.MathUtils.lerp(1 / (1 + Math.max(0, wind.speed - 5) / 20), 1, w.dust);
    // It thins over most of its depth, measured from its base or else the water (the valley's floor).
    const floor = Math.max(w.hazeBase, this.water.floor ?? w.hazeTop - 4);
    (u.uFog.value as THREE.Vector4).set(w.haze * thin, w.hazeBase, w.hazeTop, Math.max(0.5, 0.7 * (w.hazeTop - floor)));
    // The patches drift downwind and are drawn out along it, dust's faster and further (WindState); dust's streaks blow
    // by faster still, stronger as the wind rises, and the gusts sweep it in in waves.
    const a = wind.haze, b = wind.hazeNext ?? a;
    (u.uFogFrame.value as THREE.Vector4).set(a.hx, a.hz, a.stretch, a.drift);
    (u.uFogNext.value as THREE.Vector4).set(b.hx, b.hz, b.stretch, b.drift);
    u.uFogFade.value = wind.hazeNext ? wind.hazeFade : 0;
    (u.uFogStreak.value as THREE.Vector2).set(a.streak, b.streak);
    (u.uDust.value as THREE.Vector3).set(w.dust, 0.25 + 0.5 * Math.min(wind.speed / 25, 1), DUST_GUST);
    // Fresh dust: the earth's colour, or a dusty air's where there is one, lit as the fog is.
    const f = this.dust;
    u.tDustA.value = f.a; u.tDustB.value = f.b; u.uDustBlend.value = f.blend; u.uDustOn.value = f.any ? 1 : 0;
    u.uDustReach.value = f.look.top + 0.5;
    litFog(u.uDustColor.value as THREE.Color, FRESH_DUST.clone().lerp(w.hazeColor, w.dust), s.uSunColor.value, s.uSkyColor.value);
    this.rain.setVeilColor((out, base) => litFog(out, base, s.uSunColor.value, s.uSkyColor.value));
    this.snowfall.setVeilColor((out, base) => litFog(out, base, s.uSunColor.value, s.uSkyColor.value));
  }

  private updateSunCamera() {
    const c = this.sunCamera, sun = this.shared.uSunDir.value;
    // Up in the shadow map is away from the sun's bearing (the same as the world's up for the sun itself), which holds
    // still while the cloud turns the shadows overhead: switching it near overhead would turn the map's texels at once.
    c.up.set(-sun.x, 0, -sun.z);
    if (c.up.lengthSq() < 1e-6) c.up.set(0, 0, 1);
    c.near = 1; c.far = 300;
    if (this.shadowFollow) {
      // Slid along the sun's own line to beside the view: that moves nothing across the map, so the map's texels stay
      // on the same ground wherever the view is, and only the window onto them (followView) moves.
      const t = this.view.target, d = this.shadowDir;
      c.position.copy(d).multiplyScalar(d.dot(t) + 150);
      c.lookAt(c.position.clone().sub(d));
      c.updateMatrixWorld();
      this.followView();
    } else {
      const r = this.shadowRadius;
      c.left = -r; c.right = r; c.top = r; c.bottom = -r;
      c.position.copy(this.shadowCenter).addScaledVector(this.shadowDir, 150);
      c.lookAt(this.shadowCenter);
      this.drawShadowInto(this.shadowTarget.width, this.shadowTarget.height);
    }
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
    const bias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    this.shared.uShadowMatrix.value.copy(bias).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
    this.shadowDirty = true;
  }
  private shadowDirty = true;

  /**
   * The shadow's window for the view (see shadowFollow): just the ground the camera sees, as the sun sees it. A grid of
   * points across the screen, each traced down to the land and up again by what stands on it, bounds everything on
   * screen; the sun's view of them holds every shadow that can show, whatever off-screen throws it (a shadow and what
   * throws it fall on the same point of the map). Its size in steps of 4 m, so the texels' size changes only now and
   * then (a zoom, a turn, a hill), and its edges on whole texels, so a pan doesn't make the shadows' edges crawl.
   */
  private followView() {
    const c = this.sunCamera, v = this.view.camera;
    v.updateMatrixWorld();
    const land = (this.land ??= LandHeights.from(this.scene)) ?? LandHeights.FLAT;
    const toSun = c.matrixWorldInverse, fwd = new THREE.Vector3(0, 0, -1).transformDirection(v.matrixWorld);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const p = new THREE.Vector3(), edge = new THREE.Vector3();
    const take = () => {
      p.applyMatrix4(toSun);
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    };
    const N = 8;
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
      edge.set(THREE.MathUtils.lerp(v.left, v.right, i / N), THREE.MathUtils.lerp(v.bottom, v.top, j / N), 0).applyMatrix4(v.matrixWorld);
      const hit = land.trace(edge, fwd);
      // Where the land is, and what stands on it up to TALL above.
      p.copy(edge).addScaledVector(fwd, hit); take();
      p.copy(edge).addScaledVector(fwd, hit + LandHeights.TALL / fwd.y); take();
    }
    // A little round it for the shadows' soft edges, and for the land between the points. The size grows at once, in
    // steps of 8 m, but shrinks only when well too big: the land under a pan changes what's needed a little, and every
    // change of size moves every texel, so it mustn't flick back and forth.
    const size = (have: number, need: number) => need > have || need < have - 16 ? Math.ceil(need / 8) * 8 : have;
    // A flash aimed at the bolt keeps its own, so the sun's shadow comes back to exactly where it was.
    const aimed = this.lightning.aiming, held = aimed ? this.flashShadowSize : this.shadowSize;
    const pitch = aimed ? this.flashShadowPitch : this.shadowPitch;
    if (!aimed) { this.flashShadowSize = [0, 0]; this.flashShadowPitch = [0, 0]; }
    const w = (held[0] = size(held[0], x1 - x0 + 6));
    const h = (held[1] = size(held[1], y1 - y0 + 6));
    // The texels: the whole map's across the window, or, where that's finer than the cap (a low sun's narrow window), a
    // corner of it at the cap's (shadowCap). Edges on whole texels either way.
    // While the zoom moves, the capped spacing holds (each change of it moves every texel, a flicker along the shadows'
    // edges) within half a doubling of the zoom's, and settles to the zoom's once it stops: a change every 40% of a zoom
    // and one at its end, rather than one every 4% of it.
    const zoom = this.view.zoom / this.screenRatio, zooming = this.shadowZooming;
    const across = this.shadowTexels(w, this.shadowTarget.width, SHADOW_CAP.across * zoom, zooming ? pitch[0] : 0);
    const up = this.shadowTexels(h, this.shadowTarget.height, SHADOW_CAP.up * zoom, zooming ? pitch[1] : 0);
    pitch[0] = across.capped ? across.pitch : 0; pitch[1] = up.capped ? up.pitch : 0;
    c.left = Math.round(((x0 + x1) / 2 - w / 2) / across.pitch) * across.pitch; c.right = c.left + across.size;
    c.bottom = Math.round(((y0 + y1) / 2 - h / 2) / up.pitch) * up.pitch; c.top = c.bottom + up.size;
    this.drawShadowInto(across.texels, up.texels);
  }

  /**
   * The shadow's texels along one side of its window, `need` metres (followView): the whole map's `full` across it, or
   * fewer where those would be finer than `perMetre` (noon's, shadowCap). The capped spacing is held to one of 16 steps
   * per doubling, rounded to the finer (so up to 4% more detail than the cap: noon's own window keeps the whole map), or
   * `hold`'s while the zoom moves (followView) and it's within half a doubling of that and fits; it holds through the
   * window's own 8 m steps, whose texels stay on the same ground. Its size, which may be a little more than `need`, is a
   * whole number of them.
   */
  private shadowTexels(need: number, full: number, perMetre: number, hold: number) {
    const cap = perMetre * this.shadowCap;
    if (Number.isFinite(cap)) {
      const fresh = 2 ** (Math.floor(Math.log2(1 / cap) * 16) / 16);
      for (const pitch of hold && Math.abs(Math.log2(hold / fresh)) <= 0.5 ? [hold, fresh] : [fresh]) {
        const texels = Math.ceil(need / pitch);
        if (texels < full) return { texels, pitch, size: texels * pitch, capped: true };
      }
    }
    return { texels: full, pitch: need / full, size: need, capped: false };
  }

  /**
   * Draws the shadow map into its corner `texels` across and up (the viewport: nothing is drawn past it), and tells the
   * shaders how much of it that is (uShadowArea). The whole map is still cleared each frame: a part cleared costs more
   * than all of it (the GPU clears a whole surface at once), and nothing reads past the corner.
   */
  private drawShadowInto(across: number, up: number) {
    const t = this.shadowTarget;
    t.viewport.set(0, 0, across, up);
    this.shared.uShadowArea.value.set(across / t.width, up / t.height);
  }
  /** The land's heights, for followView: from the ground mesh, once it's there. */
  private land: LandHeights | null = null;
  /** The shadow window's size across and up the map (metres), held between frames (followView). */
  private shadowSize: [number, number] = [0, 0];
  private flashShadowSize: [number, number] = [0, 0];
  /** The last frame's zoom, whether this frame's differs, and the shadow's capped spacing across and up (0: not capped; followView). */
  private shadowZoom = NaN;
  private shadowZooming = true;
  private shadowPitch: [number, number] = [0, 0];
  private flashShadowPitch: [number, number] = [0, 0];
  /** Where the shadows fall from: the sun, turned towards overhead under cloud. */
  private shadowDir = new THREE.Vector3(0, 1, 0);

  /**
   * Draws only the meshes `keep` picks into a target, from the view camera; only inside `scissor` (pixels) if given. With
   * a mask, only in its squares, leaving out the meshes (and their silhouettes) that can't reach them, as `mirrored` in
   * the water or not (#249).
   */
  private drawOnly(target: THREE.WebGLRenderTarget, keep: (m: THREE.Object3D) => boolean, scissor: THREE.Vector4 | null,
    mask: WaterMask | null = null, mirrored = false) {
    const hidden: THREE.Object3D[] = [];
    for (const o of this.scene.children) {
      if (!o.visible) continue;
      if (!keep(o)) { o.visible = false; hidden.push(o); continue; }
      if (!mask || !(o as THREE.Mesh).isMesh || this.reaches(o as THREE.Mesh, mask, mirrored)) continue;
      o.visible = false; hidden.push(o);
      const twin = this.twins.get(o as THREE.Mesh);
      if (twin?.visible) { twin.visible = false; hidden.push(twin); }
    }
    target.scissorTest = scissor !== null;
    if (scissor) target.scissor.copy(scissor);
    this.gl.setRenderTarget(target);
    if (mask && !mask.full) {
      // Cleared nearer than anything, then far again only in the mask's squares: elsewhere every pixel drawn is dropped.
      const depth = this.gl.state.buffers.depth;
      depth.setClear(0);
      this.gl.clear(true, true, false);
      depth.setClear(1);
      this.gl.render(mask.scene, this.view.camera);
    } else this.gl.clear(true, true, false);
    this.gl.render(this.scene, this.view.camera);
    for (const o of hidden) o.visible = true;
  }

  private reachCentre = new THREE.Vector3();
  /**
   * Whether a mesh can be drawn into a mask's squares: its bounds on screen (mirrored about the water's surface, as the
   * reflection draws it), grown by how far its things move in the wind (TILE_REACH: a tile's bounds hold that already).
   * Always, for the kinds drawn away from where they're built (smoke rising and drifting, leaves blown through the air).
   */
  private reaches(mesh: THREE.Mesh, mask: WaterMask, mirrored: boolean) {
    if (!STAYS_PUT.has(mesh.userData.kind as MaterialKind)) return true;
    const g = mesh.geometry;
    if (!g.boundingSphere) g.computeBoundingSphere();
    const sphere = g.boundingSphere!;
    if (!Number.isFinite(sphere.radius)) return true;
    const c = this.reachCentre.copy(sphere.center).applyMatrix4(mesh.matrixWorld);
    if (mirrored) c.y = 2 * this.water.mirror - c.y;
    // (Never shrunk by a scale: what the shaders add round a point, a leaf's card or the wind's reach, is in metres.)
    const r = sphere.radius * Math.max(1, mesh.matrixWorld.getMaxScaleOnAxis()) + (mesh.frustumCulled ? 0 : TILE_REACH);
    const m = this.maskMatrix.elements;
    const x = m[0] * c.x + m[4] * c.y + m[8] * c.z + m[12], y = m[1] * c.x + m[5] * c.y + m[9] * c.z + m[13];
    return mask.touches(x - r * this.maskScale.x, y - r * this.maskScale.y, x + r * this.maskScale.x, y + r * this.maskScale.y);
  }

  private underMask = new WaterMask();
  private reflectMask = new WaterMask();
  /** The view's world-to-screen matrix as the masks were made, and how far a metre reaches across and up the screen. */
  private maskMatrix = new THREE.Matrix4();
  private maskScale = new THREE.Vector2();
  private maskScissor = [new THREE.Vector4(), new THREE.Vector4()];

  /**
   * The water's two masks (#249) for the view as it is now: its footprint on screen, widened by how far each pass is
   * read round it (the ripples' nudge, `nudge` in screen uv; the reflection's larger one and its blur; and two of the
   * target's texels for the filtering). The reflection is read for water at any height where the scene mirrored about
   * that water's own surface would be (vMirrorShift), so its mask is of the footprint mirrored about the mirror's height.
   */
  private buildMasks(nudge: number) {
    // (The sheet is drawn in the world's own space, as the mirror's height is: the renderer never moves its mesh.)
    const cam = this.view.camera, mesh = this.waterMesh;
    const boxes = mesh?.visible ? this.water.footprint(this.shared.uWaterBlend.value >= 1) : null;
    const m = this.maskMatrix.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    const e = m.elements;
    this.maskScale.set(Math.hypot(e[0], e[4], e[8]), Math.hypot(e[1], e[5], e[9]));
    const empty = new Float32Array(0);
    const pad = (target: THREE.WebGLRenderTarget, reach: number, px: number, mask: WaterMask, mirror: number | null) => {
      const rx = reach + px / this.width + 2 / target.width, ry = reach + px / this.height + 2 / target.height;
      mask.build(boxes ?? empty, e, 2 * rx, 2 * ry, mirror, 1 / target.width, 1 / target.height);
    };
    pad(this.underTarget, nudge, 0, this.underMask, null);
    pad(this.reflectTarget, nudge * WATER_REACH.reflectNudge, WATER_REACH.blurPx * WATER_REACH.coverWide, this.reflectMask, this.water.mirror);
  }

  /**
   * The most the reflection is read off its own pixel for water above or below the surface it's drawn about (WATER_VERT's
   * vMirrorShift), in screen uv.
   */
  private mirrorShift() {
    const f = this.water, dh = 2 * Math.max(f.wetHigh - f.mirror, f.mirror - f.shownLow, 0);
    const cam = this.view.camera, m = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).elements;
    // The y column: where a step up the world moves on screen.
    return new THREE.Vector2(m[4] * dh * 0.5, m[5] * dh * 0.5);
  }

  private waterBox = new THREE.Box2();
  private corner = new THREE.Vector3();
  /** Where the water is on screen (-1 to 1 across and up), or null where none shows. */
  private waterOnScreen() {
    const box = this.waterBox.makeEmpty(), v = this.corner;
    for (const o of this.scene.children) {
      if (!o.visible || o.userData.kind !== 'water') continue;
      const mesh = o as THREE.Mesh;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const b = mesh.geometry.boundingBox!;
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z);
        v.applyMatrix4(mesh.matrixWorld).project(this.view.camera);
        box.expandByPoint(new THREE.Vector2(v.x, v.y));
      }
    }
    return box.isEmpty() || box.max.x < -1 || box.min.x > 1 || box.max.y < -1 || box.min.y > 1 ? null : box;
  }

  /**
   * The rectangle of a water pass's target (pixels) the water can read: where it is on screen, widened by how far its
   * lookups reach, `reach` in screen uv plus `px` screen pixels (see WATER_REACH), with a texel for filtering and one to
   * spare. Null draws the whole target.
   */
  private waterRect(onScreen: THREE.Box2, target: THREE.WebGLRenderTarget, reach: number, px: number, shift = new THREE.Vector2()) {
    if (!this.settings.waterScissor) return null;
    const w = target.width, h = target.height;
    const rx = reach + Math.abs(shift.x) + px / this.width, ry = reach + Math.abs(shift.y) + px / this.height;
    const x0 = Math.max(0, Math.floor(((onScreen.min.x + 1) / 2 - rx) * w) - 2);
    const y0 = Math.max(0, Math.floor(((onScreen.min.y + 1) / 2 - ry) * h) - 2);
    const x1 = Math.min(w, Math.ceil(((onScreen.max.x + 1) / 2 + rx) * w) + 2);
    const y1 = Math.min(h, Math.ceil(((onScreen.max.y + 1) / 2 + ry) * h) + 2);
    return new THREE.Vector4(x0, y0, x1 - x0, y1 - y0);
  }

  /** Draws the shelter map: the cover meshes with their sun-shadow materials, from above, the wind stilled. */
  private drawShelter() {
    // The roofs and crowns, and the land (the ground) for where the rain lands.
    const cover = this.scene.children.filter((o): o is THREE.Mesh => (o as THREE.Mesh).isMesh && o.userData.cover !== undefined)
      .map((mesh) => ({
        mesh, cover: mesh.userData.kind === 'ground' ? 'land' as const : mesh.userData.cover as Cover,
        depth: this.materials.get(mesh.userData.kind as MaterialKind)!.depth,
      }));
    const s = this.shared;
    this.shelter.draw(this.gl, this.scene, cover, this.groundSquare(), () => {
      // Every wind value and the clock set to one rest, whatever the weather, and the flutter kept across the map's own
      // view (straight down), not the camera's: what's left of the sway and the flutter (a little even in a calm) is then
      // the same every draw, so a new building can't nudge a tree's dry patch. Models' parts as modelled, still and shown,
      // for the same reason: the map isn't drawn as a rotor turns (a rotor's few blades shelter little anyway).
      const saved = [s.uTime.value, s.uWindSpeed.value, s.uWindOn.value, s.uWindFlutter.value,
        s.uWindDir.value.clone(), s.uWindDrift.value.clone(), s.uViewBack.value.clone()] as const;
      s.uTime.value = 0; s.uWindSpeed.value = 0; s.uWindOn.value = 0; s.uWindFlutter.value = 0;
      s.uWindDir.value.set(1, 0); s.uWindDrift.value.set(0, 0); s.uViewBack.value.set(0, 1, 0);
      s.uPartsRest.value = 1;
      return () => {
        s.uPartsRest.value = 0;
        [s.uTime.value, s.uWindSpeed.value, s.uWindOn.value, s.uWindFlutter.value] = saved;
        s.uWindDir.value.copy(saved[4]); s.uWindDrift.value.copy(saved[5]); s.uViewBack.value.copy(saved[6]);
      };
    });
  }

  /**
   * The ground's square, for the maps over it (the shelter, the hollows): its brush's, or without one a square round all
   * of the ground (from #11's #50). Null with no ground.
   */
  private groundSquare(): NonNullable<MeshOptions['fields']> | null {
    const grounds = this.scene.children.filter((o): o is THREE.Mesh => (o as THREE.Mesh).isMesh && o.userData.kind === 'ground');
    const square = grounds.find((g) => g.userData.fields)?.userData.fields as MeshOptions['fields'] | undefined;
    if (square || !grounds.length) return square ?? null;
    const box = new THREE.Box3();
    for (const g of grounds) box.expandByObject(g);
    const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    return { x: c.x, z: c.z, side: Math.max(size.x, size.z), turn: 0 };
  }

  /** Finds the land's hollows (HollowMap): every piece of the ground, from above, over its square. */
  private drawHollows() {
    const grounds = this.scene.children.filter((o): o is THREE.Mesh => (o as THREE.Mesh).isMesh && o.userData.kind === 'ground' && o.visible);
    const depth = this.materials.get('ground')?.depth;
    if (depth) this.hollows.draw(this.gl, this.scene, grounds, depth, this.groundSquare(), this.shelter.uniforms);
  }

  /**
   * Draws the cloud map and the sky map (when the clouds or their shape have changed), over the ground's square: found again whenever
   * ground is added or taken out, and each frame until there is some.
   */
  private drawClouds() {
    if (!this.cloudArea) {
      const ground = this.scene.children.find((o) => o.userData.kind === 'ground' && o.userData.fields);
      const f = ground?.userData.fields as MeshOptions['fields'] | undefined;
      // The turned square's bounds, and a little more.
      const half = f ? (f.side / 2) * (Math.abs(Math.cos(f.turn)) + Math.abs(Math.sin(f.turn))) + 2 : 64;
      this.cloudMap.setArea((f?.x ?? 0) - half, (f?.z ?? 0) - half, 2 * half);
      this.shared.uLandSquare.value.set(f?.x ?? 0, f?.z ?? 0, f ? f.side / 2 : 0, f?.turn ?? 0);
      const sky = half + MIRROR.height / MIRROR.rise;
      this.skyMap.setArea((f?.x ?? 0) - sky, (f?.z ?? 0) - sky, 2 * sky);
      this.cloudArea = !!f;
    }
    this.cloudMap.draw(this.gl, this.weather.clouds, this.cloudShape);
    this.skyMap.draw(this.gl, this.weather.clouds, this.cloudShape);
  }
  private cloudArea = false;
  private windNowVector = new THREE.Vector2();
  private lightningCompiled = false;

  render(time: number) {
    if (!this.look) throw new Error('setHour (or setLook) before render');
    // Whether the zoom moved since the last frame (followView holds the shadow's spacing while it does): once a frame,
    // as the shadow is fitted more than once in one.
    const zoom = this.view.zoom / this.screenRatio;
    this.shadowZooming = zoom !== this.shadowZoom; this.shadowZoom = zoom;
    const t = this.timer;
    t?.mark('setup', false);
    const s = this.shared, w = this.wind;
    s.uTime.value = time;
    w.carried = this.weather.dust;
    w.update(time);
    s.uWindDir.value.set(w.dirX, w.dirZ);
    s.uWindSpeed.value = w.speed;
    s.uWindDrift.value.set(w.driftX, w.driftZ);
    const f = this.windField;
    s.tWindA.value = f.a; s.tWindB.value = f.b; s.tWindUsual.value = f.usual; s.uWindBlend.value = f.blend; s.uWindGrid.value.copy(f.grid);
    this.trees.update(time, this.windNow, w.gust);
    s.tTreePose.value = this.trees.texture;
    this.parts.update(time);
    s.tPartPose.value = this.parts.texture;
    s.uWindFlutter.value = w.flutter;
    this.weather.update(time);
    s.uWaterBlend.value = this.water.blend(time);
    if (this.water.settle(time) && this.waterMesh) this.waterMesh.visible = false;
    s.uIceOn.value = this.water.iced ? 1 : 0;
    s.uMirrorY.value = this.water.mirror;
    s.uWaterHigh.value = this.water.any ? this.water.wetHigh : -1e6;
    this.ground.update(time);
    // An earthwork's chunks, painted a few a frame and swapped in together.
    this.painted?.step();
    // The land's height, known before a strike is asked for (see strike): worked out on the first frame, not during one.
    this.land ??= LandHeights.from(this.scene);
    if (!this.lightningCompiled) { this.lightning.precompile(this.gl, this.view.camera); this.lightningCompiled = true; }
    // How far the screen reaches from its middle, on the land (m): across, and up it (foreshortened by the 30° pitch).
    const reach = (this.view.camera.right + this.view.camera.top * 2) / 2;
    this.lightning.update(this.view.target, this.view.zoom, reach, this.width, this.height, this.gbuffer.textures[1]);
    this.applyLook(this.look);
    const grounded: THREE.Object3D[] = [];
    if (!this.settings.falling) {
      for (const o of this.scene.children) if (o.visible && FALLING.includes(o.userData.kind as DrawnKind)) { o.visible = false; grounded.push(o); }
    }
    // Framed by the screen's pixels, not the pixels drawn: drawing fewer (maxPixels) makes the frame softer, not nearer.
    const toScreen = this.screenRatio / this.pixelRatio;
    this.view.apply(this.width * toScreen, this.height * toScreen);
    s.uViewBack.value.copy(this.view.backward());
    s.uViewTarget.value.copy(this.view.target);
    // The haze thickens past the target: as far back as the camera sits now (a wide view sits further).
    this.post.uniforms.uTargetDepth.value = this.view.distance;
    // The shadow's window, for the view as it is now (the look set it for the last).
    if (this.shadowFollow) this.updateSunCamera();
    // Where each pixel is in the world, for the fog: the camera's frame, scaled to half the view.
    const cam = this.view.camera, pu = this.post.uniforms;
    (pu.uCamPos.value as THREE.Vector3).copy(cam.position);
    (pu.uCamRight.value as THREE.Vector3).setFromMatrixColumn(cam.matrixWorld, 0).multiplyScalar(cam.right);
    (pu.uCamUp.value as THREE.Vector3).setFromMatrixColumn(cam.matrixWorld, 1).multiplyScalar(cam.top);
    (pu.uCamFwd.value as THREE.Vector3).setFromMatrixColumn(cam.matrixWorld, 2).negate();
    // The rain, with the weather as drawn and the view as it is now.
    this.rain.update(time, this.weather.rain, this.view.zoom, this.pixelRatio / this.screenRatio, this.settings.fallingShare,
      this.settings.falling && this.rainShown, this.windNowVector.copy(s.uWindDir.value).multiplyScalar(s.uWindSpeed.value),
      cam, this.view.target.y);
    // The snow, the same way (#14).
    this.snowfall.update(time, this.weather.snow, this.view.zoom, this.pixelRatio / this.screenRatio, this.settings.fallingShare,
      this.settings.falling && this.snowShown, this.ground.any, this.windNowVector, cam, this.view.target.y);
    this.scene.updateMatrixWorld();
    for (const [mesh, twin] of this.twins) twin.matrixWorld.copy(mesh.matrixWorld);
    // Placed once for the frame: not again by every pass that draws the scene (three.js walks all of it each time, #210).
    this.scene.matrixWorldAutoUpdate = false;
    const gl = this.gl;

    // The shelter map, only when cover has changed: nothing to do most frames.
    t?.mark('shelter', this.shelter.dirty);
    // The hollows map holds the ground's shelter too: found again with it.
    if (this.shelter.dirty) {
      this.drawShelter();
      const part = this.shelter.lastPart;
      if (part) this.hollows.changedIn(part); else this.hollows.changed();
    }
    // The land's hollows (#14): once there's snow or frost, and again only when the ground or its shelter changes.
    const hollows = this.ground.any && this.hollows.dirty;
    t?.mark('hollows', hollows);
    if (hollows) this.drawHollows();

    // The clouds' shade over the land, as the game has them now.
    t?.mark('clouds');
    this.drawClouds();

    // The sun's shadow map: redrawn every frame, because foliage and grass move in the wind.
    t?.mark('shadow');
    gl.setRenderTarget(this.shadowTarget);
    gl.clear(false, true, false);
    if (this.settings.shadows) {
      const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
      const hidden: THREE.Object3D[] = [];
      for (const o of this.scene.children) if (!this.casters.has(o as THREE.Mesh) && o.visible) { o.visible = false; hidden.push(o); }
      for (const m of this.casters) { saved.set(m, m.material); m.material = this.materials.get(m.userData.kind as MaterialKind)!.depth; }
      gl.render(this.scene, this.sunCamera);
      for (const [m, mat] of saved) m.material = mat;
      for (const o of hidden) o.visible = true;
    }
    this.shadowDirty = false;

    // The frost's memory of the sun since dawn (#14): a few times a second, while there's frost (timed with the shadow's
    // pass: most frames it draws nothing).
    this.sunMemory.update(gl, this.clockHour, this.dayNow.sunrise, this.dayNow.sunset, this.sunElNow, s.uOvercast.value.x,
      this.ground.frost, this.hollows.uniforms.uHollowsMap.value, this.hollows.uniforms.uHollowsOn.value > 0.5);

    // What the water shows: the bed without it, and the scene mirrored in it. Only round the water on screen, and not at
    // all when none shows. The farthest a lookup reaches (snoise peaks a little past 1, hence the tenth more):
    t?.mark('under');
    gl.setClearColor(0x000000, 0);
    const nudge = (WATER_REACH.ripple + WATER_REACH.chop * WATER_REACH.chopMax) * 1.1;
    // Where the passes draw (#249): in the masks' squares (the settings' scissor round them), and not at all with none;
    // or, the masks off, round the water's mesh on screen.
    const masked = this.settings.waterMask && this.view.camera.isOrthographicCamera && (this.settings.under || this.settings.reflection);
    if (masked) this.buildMasks(nudge);
    const water = masked ? null : this.waterOnScreen();
    const scissor = (target: THREE.WebGLRenderTarget, mask: WaterMask, into: THREE.Vector4) =>
      this.settings.waterScissor ? mask.scissor(target, into) : null;
    if ((masked ? this.underMask.filled > 0 : water) && this.settings.under) {
      // The bed under the water takes no snow or frost (#14): 2 tells the materials to leave out what's below the water's
      // top (the banks above it keep theirs, as the ripples' nudge shows them through the water's edge).
      const ground = this.ground.uniforms.uGroundOn, on = ground.value;
      if (on > 0.5) ground.value = 2;
      this.drawOnly(this.underTarget, (m) => m.userData.under as boolean, masked
        ? scissor(this.underTarget, this.underMask, this.maskScissor[0]) : this.waterRect(water!, this.underTarget, nudge, 0),
      masked ? this.underMask : null);
      ground.value = on;
    }
    t?.mark('reflect');
    const pre = this.settings.prepass;
    if ((masked ? this.reflectMask.filled > 0 : water) && this.settings.reflection) {
      this.shared.uMirror.value = 1;
      // Its silhouettes first too, of what the water mirrors.
      this.silhouettes.visible = pre;
      if (pre) {
        for (const [mesh, twin] of this.twins) {
          twin.visible = mesh.visible && (mesh.userData.reflect as boolean);
          twin.material = this.materials.get(mesh.userData.kind as MaterialKind)!.mirrorPrepass;
        }
      }
      // Nearer-or-equal here, not equal: on the laptop's Intel GPU equal depth made this pass slower, 1.9 → 3.1 ms (#6).
      this.paintOver(pre, () => false);
      // Mirroring flips the winding, so one-sided surfaces show their back faces.
      const flipped = [...this.materials.values()].flatMap((m) => [m.main, m.mirrorPrepass]).filter((m) => m.side === THREE.FrontSide);
      for (const m of flipped) m.side = THREE.BackSide;
      const rect = masked ? scissor(this.reflectTarget, this.reflectMask, this.maskScissor[1])
        : this.waterRect(water!, this.reflectTarget, nudge * WATER_REACH.reflectNudge, WATER_REACH.blurPx * WATER_REACH.coverWide, this.mirrorShift());
      this.drawOnly(this.reflectTarget, (m) => (m.userData.reflect as boolean) || m === this.silhouettes, rect,
        masked ? this.reflectMask : null, true);
      for (const m of flipped) m.side = THREE.FrontSide;
      this.shared.uMirror.value = 0;
    }

    // The main view's silhouettes first, depth only: then each pixel is painted once, by the surface that shows there,
    // rather than by every leaf card stacked behind it.
    t?.mark('main');
    this.gbuffer.resolveDepthBuffer = this.settings.resolveDepth;
    gl.setRenderTarget(this.gbuffer);
    gl.clear(true, true, false);
    this.silhouettes.visible = pre;
    if (pre) {
      for (const [mesh, twin] of this.twins) {
        twin.visible = mesh.visible;
        twin.material = this.materials.get(mesh.userData.kind as MaterialKind)!.prepass;
      }
    }
    // The leaves gain most from equal depth; for the rest it made no difference worth the risk of a GPU's depths not
    // matching to the last bit (#6).
    this.paintOver(pre, (kind) => this.settings.equalDepth && kind === 'foliage');
    gl.render(this.scene, this.view.camera);
    this.silhouettes.visible = false;
    this.paintOver(false, () => false);
    // The game's marks on its things, where they show (marks.ts): none most frames but when hovering.
    this.marks.draw(gl, this.view.camera, this.gbuffer.textures[1]);

    t?.mark('post');
    gl.setRenderTarget(this.output);
    const u = this.post.uniforms;
    u.uLines.value = this.settings.lines ? 1 : 0;
    u.uGrain.value = this.settings.grain;
    // Lines thin as the camera zooms out, so a busy farm doesn't turn into a comic.
    u.uLineWidth.value = THREE.MathUtils.clamp(0.6 + this.view.zoom / 48, 0.8, 2.2) * this.pixelRatio * 0.75;
    gl.render(this.postScene, this.postCamera);
    if (this.settings.shelterDebug) this.shelter.drawOverlay(gl, this.gbuffer.textures[1], this.view.camera, this.width, this.height);
    t?.mark('bolt', this.lightning.active);
    this.lightning.draw(gl, cam, u.uHazeColor.value as THREE.Color);
    // The tools' previews and lines, over it all (ontop.ts).
    this.onTop.draw(gl, cam, this.gbuffer.textures[1], this.output, this.width, this.pixelRatio, this.scene);
    this.drawnCamera.copy(cam);
    this.drawn = true;
    for (const o of grounded) o.visible = true;
    this.scene.matrixWorldAutoUpdate = true;
    t?.endFrame();
  }
}

/**
 * The kinds drawn where they're built, give or take how far the wind moves them (TILE_REACH): what the water's passes
 * can leave out when its bounds miss the water (#249). Not the smoke and the blown leaves, which travel far from theirs.
 */
const STAYS_PUT: ReadonlySet<MaterialKind> = new Set(['ground', 'paint', 'crop', 'foliage', 'grass', 'ink']);

/**
 * The land's highest ground in each cell of a coarse grid, from the ground mesh, to trace the view's rays down to it
 * (followView). Off the grid, and without a ground mesh, the land is flat at 0.
 */
const IDENTITY = new THREE.Matrix4();

class LandHeights {
  /** How tall what stands on the land can be and still catch a shadow worth drawing (trees, roofs, the windmill's sails). */
  static readonly TALL = 16;
  static readonly CELL = 2;
  static readonly FLAT = new LandHeights(0, 0, 0, 0, new Float32Array(0), 0, 0);
  readonly x0: number; readonly z0: number; readonly nx: number; readonly nz: number; readonly max: Float32Array;
  readonly lo: number; readonly hi: number;
  constructor(x0: number, z0: number, nx: number, nz: number, max: Float32Array, lo: number, hi: number) {
    this.x0 = x0; this.z0 = z0; this.nx = nx; this.nz = nz; this.max = max; this.lo = lo; this.hi = hi;
  }

  static from(scene: THREE.Scene): LandHeights | null {
    const box = new THREE.Box3();
    const grounds = scene.children.filter((o): o is THREE.Mesh => o.userData.kind === 'ground' && (o as THREE.Mesh).isMesh);
    for (const o of grounds) box.expandByObject(o);
    if (box.isEmpty()) return null;
    const C = LandHeights.CELL, nx = Math.ceil((box.max.x - box.min.x) / C) + 1, nz = Math.ceil((box.max.z - box.min.z) / C) + 1;
    const max = new Float32Array(nx * nz).fill(box.min.y);
    const p = new THREE.Vector3();
    for (const o of grounds) {
      const pos = o.geometry.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        const k = Math.floor((p.z - box.min.z) / C) * nx + Math.floor((p.x - box.min.x) / C);
        if (p.y > max[k]) max[k] = p.y;
      }
    }
    return new LandHeights(box.min.x, box.min.z, nx, nz, max, box.min.y, box.max.y);
  }

  /**
   * Found again within `area` (metres) from the ground meshes there now, after some changed there; null where that can't
   * be done in place (the change reached past the grid, or below its lowest), to be found again whole.
   */
  refresh(scene: THREE.Scene, area: THREE.Box3): LandHeights | null {
    const C = LandHeights.CELL;
    const i0 = Math.floor((area.min.x - this.x0) / C), i1 = Math.floor((area.max.x - this.x0) / C);
    const j0 = Math.floor((area.min.z - this.z0) / C), j1 = Math.floor((area.max.z - this.z0) / C);
    if (this.nx === 0 || i0 < 0 || j0 < 0 || i1 >= this.nx || j1 >= this.nz) return null;
    for (let j = j0; j <= j1; j++) this.max.fill(this.lo, j * this.nx + i0, j * this.nx + i1 + 1);
    const cells = new THREE.Box3(new THREE.Vector3(this.x0 + i0 * C, -Infinity, this.z0 + j0 * C), new THREE.Vector3(this.x0 + (i1 + 1) * C, Infinity, this.z0 + (j1 + 1) * C));
    const box = new THREE.Box3(), p = new THREE.Vector3();
    let hi = this.hi;
    for (const o of scene.children) {
      const mesh = o as THREE.Mesh;
      if (o.userData.kind !== 'ground' || !mesh.isMesh) continue;
      const g = mesh.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      if (!box.copy(g.boundingBox!).applyMatrix4(o.matrixWorld).intersectsBox(cells)) continue;
      const pos = g.getAttribute('position');
      const moved = !o.matrixWorld.equals(IDENTITY);
      for (let v = 0; v < pos.count; v++) {
        p.fromBufferAttribute(pos, v);
        if (moved) p.applyMatrix4(o.matrixWorld);
        const i = Math.floor((p.x - this.x0) / C), j = Math.floor((p.z - this.z0) / C);
        if (i < i0 || i > i1 || j < j0 || j > j1) continue;
        if (p.y < this.lo) return null;
        const k = j * this.nx + i;
        if (p.y > this.max[k]) this.max[k] = p.y;
        hi = Math.max(hi, p.y);
      }
    }
    return new LandHeights(this.x0, this.z0, this.nx, this.nz, this.max, this.lo, hi);
  }

  /** The ground's highest point in the cell round (x, z), and its neighbours' (a vertex on a cell's edge counts for both). */
  at(x: number, z: number) {
    const C = LandHeights.CELL, i = Math.floor((x - this.x0) / C), j = Math.floor((z - this.z0) / C);
    let m = -Infinity;
    for (let dj = -1; dj <= 0; dj++) for (let di = -1; di <= 0; di++) {
      const a = i + di, b = j + dj;
      if (a >= 0 && b >= 0 && a < this.nx && b < this.nz) m = Math.max(m, this.max[b * this.nx + a]);
    }
    return m === -Infinity ? 0 : m;
  }

  /** How far along the ray (from, dir, pointing down) it reaches the land, to a metre or so. */
  trace(from: THREE.Vector3, dir: THREE.Vector3) {
    if (this.nx === 0) return -from.y / dir.y;
    // From where it comes down past the land's highest to where it passes below its lowest.
    let t = Math.max(0, (this.hi - from.y) / dir.y);
    const end = (this.lo - from.y) / dir.y;
    for (; t < end; t += 1) {
      const x = from.x + dir.x * t, y = from.y + dir.y * t, z = from.z + dir.z * t;
      if (y <= this.at(x, z)) return t;
    }
    return end;
  }
}

/**
 * Bakes the renderer's fields again when the canvas's context is restored. Out here, apart from the constructor, so the
 * listener's closure holds the renderer only weakly (V8 shares a function's closure scope with its sibling closures, and
 * the constructor's capture `this`): a renderer dropped with the canvas kept (a new level) lets go on the next restore.
 */
function onRestored(canvas: HTMLCanvasElement, renderer: WeakRef<BrushRenderer>) {
  const restored = () => {
    const r = renderer.deref();
    if (r) r.rebakeFields(); else canvas.removeEventListener('webglcontextrestored', restored);
  };
  canvas.addEventListener('webglcontextrestored', restored);
}
