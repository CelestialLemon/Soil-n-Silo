// The gusts (#36): the living wind's sky without the air under it. What the game asks of the wind, how the wind eases
// there, and the recipe: a seeded sequence of gusts laid along the wind and travelling with it, swelling and easing over
// gusty and quiet minutes. WindSim (sim.ts) hands it to the engine each tick, which feeds it down into the ground air.
//
// On its own, WindRecipe is the wind's state with no air: cheap to step (no engine, no grid of cells) and plain data to
// save, for the game's rules (#208). Up from 8 m the wind is the free air alone (windAt's height rule), so the free air is
// all a turbine's rotor feels: `gustAt` works it out at a point, a TypeScript twin of the engine's recipe (sim.c's
// `interval`, `gust` and `force`), in float32 operation for operation, so it gives the engine's free air bit for bit
// (`npm run render:test:wind` checks it at every cell). Change one, change the other.
//
// Deterministic as WindSim is: the same goals and ticks give the same gusts, bit for bit, within one JavaScript engine
// (the turns' sines and cosines aren't specified to the last bit across engines; the rest is exact everywhere).

/** What the game asks of the wind. */
export interface WindGoal {
  /** The average wind at ground level, metres per second: gusts go above it, lulls below, averaging out to it. */
  speed: number;
  /** Where it blows towards, radians in the ground plane from +x towards +z. */
  direction: number;
  /** How gusty, 0 (truly steady) to 1. Defaults to 0.5. */
  gustiness?: number;
  /** How the gusts come, 0 (rare and strong) to 1 (frequent and mild); the average stays the same. Defaults to 0.5. */
  rhythm?: number;
}

/** The world the wind covers: nx by nz cells of `cell` metres, the corner at (x0, z0). The gusts are laid from its centre. */
export interface WindGrid { nx: number; nz: number; cell: number; x0: number; z0: number }

/** How the wind is set up besides its goal: the seed its gusts come from (the same seed, the same gusts). */
export interface WindOptions {
  seed?: number;
  /**
   * Carry on from this state (a WindRecipe's, or a save's) rather than start afresh: the seed and goal are its own. The air
   * under it, for a WindSim, starts steady, blowing as the state does.
   */
  state?: WindState;
}

/** One game tick, seconds: the wind is stepped at this rate whatever the frame rate. */
export const TICK = 0.1;
/** The strongest wind the engine takes, m/s (more is taken as this): beyond it a tick would need more substeps than
 * sim.c's MAXSUB allows. */
export const MAX_SPEED = 60;
/** How much of the gap to a new goal the wind closes each tick: 1 - exp(-TICK / 1.5 s), so it doesn't snap. */
const EASE = 0.06449301496838222;
/** A turn further than 25 degrees from the gusts' heading (this is its cosine) starts a new set of gusts laid along
 * the new heading... */
const NEW_HEADING = 0.9063077870366499;
/** ...which fades in over this many seconds while the old set fades out, so nothing swings round. */
const FADE = 6;
/** A new set of gusts is laid when the wind is asked to go this much faster or slower than the gusts were laid for
 * (their fronts' pace and spacing are fixed per set, so they never stretch)... */
const NEW_PACE = Math.log(1.2);
/** ...or this much more or less frequent. */
const NEW_RHYTHM = 0.1;

/**
 * The gusts' look (#36, the developer's pick of three, 2026-11-02: "gentler", for the game's serene vibe). How far the
 * wind drops in a lull at full gustiness (at rhythm 0; frequent gusts lull less), how fast the gusts travel against the
 * wind, and the share of gusts that hit in 0.3 s rather than building over 1 to 2.
 */
const LULL_FLOOR = 0.38, FRONTS = 0.75, SLAPS = 0.04;

/**
 * A set of gusts laid along a heading (hx, hz), for a wind of `speed` (m/s, at least 2) and a rhythm, which fix how far
 * apart its fronts are and how fast they come; o shifts it across, so sets differ. Interval k + p of the seeded
 * sequence is at the world's centre now (k whole, p in 0..1, so it stays exact however long the game runs).
 */
export interface Gusts { hx: number; hz: number; o: number; speed: number; rhythm: number; k: number; p: number }

/** The wind's own state besides the air: what it's easing towards and where its gusts are. Plain data, for saves. */
export interface WindState {
  tick: number;
  /** The gusts' seed. */
  seed: number;
  goal: Required<WindGoal>;
  speed: number; dirX: number; dirZ: number; gustiness: number; rhythm: number;
  /** The gusts, and those fading in after a turn (with how far they've faded in, 0..1). */
  gusts: Gusts; next: Gusts | null; fade: number;
  /** How many sets of gusts there have been, so each new one is laid differently. */
  sets: number;
}

/** A set of gusts as the engine is given it (sim.c's Gen): float32, but k (whole, from 0) and the share of slaps. */
export interface Gen { hx: number; hz: number; o: number; L: number; T: number; B: number; H: number; slap: number; k: number; p: number }

/** What the recipe gives the engine for a tick (sim.c's setGusts, setSeed and force). */
export interface Forcing {
  gens: [Gen, Gen]; seed: number;
  speed: number; dirX: number; dirZ: number; gustiness: number;
  /** The spell, -1 quiet to 1 gusty; the gusts' strength in it; how far the second set has faded in, 0..1. */
  swell: number; spell: number; fade: number;
}

const f = Math.fround;
const smooth = (x: number) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

/** A seeded random number in [0, 1) for k, one stream per salt (the same hash as sim.c's). */
export function rnd(k: number, seed: number, salt: number) {
  let a = (((k ^ seed) >>> 0) + Math.imul(salt, 0x9e3779b9)) >>> 0;
  a ^= a >>> 16; a = Math.imul(a, 0x7feb352d); a ^= a >>> 15; a = Math.imul(a, 0x846ca68b); a ^= a >>> 16;
  return (a >>> 8) / 16777216;
}

/**
 * The spell at a moment of the game's clock (seconds): -1 quiet to 1 gusty. Sol's balanced spells: blocks of 120 to
 * 240 s (seeded), each a gusty half and a quiet half (or quiet first), smoothly, so every whole block averages out.
 */
export function spellAt(seconds: number, seed: number) {
  const start = (j: number) => 180 * j + 30 * (2 * rnd(j, seed, 133) - 1);
  let j = Math.floor(seconds / 180);
  if (seconds < start(j)) j--; else if (seconds >= start(j + 1)) j++;
  const a0 = start(j), v = (4 * (seconds - a0)) / (start(j + 1) - a0), i = Math.min(3, Math.floor(v));
  const a = (0.5 + 0.5 * rnd(j, seed, 149)) * (rnd(j, seed, 151) < 0.5 ? -1 : 1), nodes = [0, a, 0, -a, 0];
  return nodes[i] + (nodes[i + 1] - nodes[i]) * smooth(v - i);
}

export function fullGoal(g: WindGoal): Required<WindGoal> {
  return {
    speed: Math.min(MAX_SPEED, Math.max(0, g.speed)), direction: g.direction,
    gustiness: Math.min(1, Math.max(0, g.gustiness ?? 0.5)), rhythm: Math.min(1, Math.max(0, g.rhythm ?? 0.5)),
  };
}

/** A set's usual interval between gusts in seconds (T) and metres (L), its lull floor and peak ceiling. */
function shape(g: Gusts) {
  const T = (108 - 48 * g.rhythm) / (6 * FRONTS);
  return { T, L: FRONTS * g.speed * T, B: LULL_FLOOR + 0.15 * g.rhythm, H: 1.95 - 0.4 * g.rhythm };
}

/** A set as the engine takes it: float32 (k whole, from 0). */
function gen(g: Gusts): Gen {
  const { T, L, B, H } = shape(g);
  return { hx: f(g.hx), hz: f(g.hz), o: f(g.o), L: f(L), T: f(T), B: f(B), H: f(H), slap: f(SLAPS), k: g.k >>> 0, p: f(g.p) };
}

export class WindRecipe {
  state: WindState;
  /** The world's centre, metres: the gusts are laid from it. */
  readonly cx: number; readonly cz: number;
  /** What the engine was given for the last tick stepped (or, before the first, for the state as it starts). */
  private forced: Forcing;

  /** The wind over the grid's world, blowing steadily as `goal` asks (or carrying on from `options.state`). */
  constructor(grid: WindGrid, goal: WindGoal, options: WindOptions = {}) {
    this.cx = grid.x0 + 0.5 * grid.nx * grid.cell; this.cz = grid.z0 + 0.5 * grid.nz * grid.cell;
    if (options.state) this.state = structuredClone(options.state);
    else {
      const g = fullGoal(goal), dirX = Math.cos(g.direction), dirZ = Math.sin(g.direction);
      this.state = {
        tick: 0, seed: (options.seed ?? 1) >>> 0,
        goal: g, speed: g.speed, dirX, dirZ, gustiness: g.gustiness, rhythm: g.rhythm,
        gusts: { hx: dirX, hz: dirZ, o: 0, speed: Math.max(2, g.speed), rhythm: g.rhythm, k: 0, p: 0 }, next: null, fade: 0, sets: 1,
      };
    }
    this.forced = this.forcing();
  }

  /** What the game asks for now; the wind eases towards it over the next ticks. */
  setGoal(goal: WindGoal) { this.state.goal = fullGoal(goal); }

  /** Carries on from a state (a save's), as if it had never stopped. */
  restore(state: WindState) { this.state = structuredClone(state); this.forced = this.forcing(); }

  /**
   * Advances one tick (TICK seconds): the wind eases towards the goal, the gusts travel on, and where they are then makes
   * this tick's forcing (handed to `engine`, for the air under it). The forcing is the state's as the tick ends, so a
   * recipe made from a saved state has the same forcing as the one that saved it (`gustAt` reads the same after a load).
   */
  step(engine?: (forcing: Forcing) => void) {
    this.ease();
    this.travel();
    this.forced = this.forcing();
    engine?.(this.forced);
  }

  /** The first part of a tick: the wind eases towards the goal. */
  private ease() {
    const s = this.state, k = EASE;
    s.speed += (s.goal.speed - s.speed) * k;
    s.gustiness += (s.goal.gustiness - s.gustiness) * k;
    s.rhythm += (s.goal.rhythm - s.rhythm) * k;
    // The direction turns the short way round, a little slower than the speed changes.
    const now = Math.atan2(s.dirZ, s.dirX);
    let turn = (s.goal.direction - now) % (2 * Math.PI);
    if (turn > Math.PI) turn -= 2 * Math.PI; else if (turn <= -Math.PI) turn += 2 * Math.PI;
    const a = now + turn * k * 0.7;
    s.dirX = Math.cos(a); s.dirZ = Math.sin(a);
  }

  /** What the engine is given for the tick just stepped (after `ease` and `travel`): the gusts where they are now. */
  private forcing(): Forcing {
    const s = this.state, swell = spellAt(s.tick * TICK, s.seed);
    return {
      gens: [gen(s.gusts), gen(s.next ?? s.gusts)], seed: s.seed,
      speed: f(s.speed), dirX: f(s.dirX), dirZ: f(s.dirZ), gustiness: f(s.gustiness),
      swell: f(swell), spell: f(0.7 + 0.3 * swell), fade: f(s.next ? smooth(s.fade) : 0),
    };
  }

  /** The second part of a tick: the gusts travel on, a new set fades in, and the clock moves on. */
  private travel() {
    const s = this.state;
    // The gusts travel with the wind, each set along its own heading at its own pace.
    move(s.gusts);
    if (s.next) {
      move(s.next);
      s.fade = Math.min(1, s.fade + TICK / FADE);
      if (s.fade >= 1) { s.gusts = s.next; s.next = null; s.fade = 0; }
    }
    // A turn well away from the gusts' heading, or a wind asked to blow much faster or slower or its gusts to come much
    // more or less often, lays a new set for the wind asked for, fading in. It carries on the same seeded sequence from
    // where the old set is at the world's centre, so the centre sees no jump; the rest of the world fades across.
    if (!s.next && s.gustiness > 0) {
      const gx = Math.cos(s.goal.direction), gz = Math.sin(s.goal.direction), speed = Math.max(2, s.goal.speed);
      if (gx * s.gusts.hx + gz * s.gusts.hz < NEW_HEADING || Math.abs(Math.log(speed / s.gusts.speed)) > NEW_PACE
        || Math.abs(s.goal.rhythm - s.gusts.rhythm) > NEW_RHYTHM) {
        s.next = { hx: gx, hz: gz, o: (s.sets * 13) % 101, speed, rhythm: s.goal.rhythm, k: s.gusts.k, p: s.gusts.p };
        s.sets++; s.fade = 0;
      }
    }
    s.tick++;
  }

  /** What the engine was given for the last tick stepped. */
  get last(): Forcing { return this.forced; }

  /**
   * How hard the free air blows at a point (x, z, metres) in the last tick stepped, as a share of the wind's average
   * (`state.speed`): 1 on average, above it in a gust, below in a lull, exactly 1 when steady. Along the wind's heading.
   * Up from 8 m this is the wind itself (windAt), so it is what a rotor feels. 0 in no wind.
   */
  gustAt(x: number, z: number): number { return factor(this.forced, f(x - this.cx), f(z - this.cz)); }

  /** The free air at ground scale at a point, m/s along x and z, in the last tick stepped: the engine's (fu, fv) there. */
  freeAt(x: number, z: number): [number, number] { return freeAt(this.forced, f(x - this.cx), f(z - this.cz)); }
}

/** The engine's free air (fu, fv) at a point (x, y metres from the world's centre, float32) for a tick's forcing. */
export function freeAt(F: Forcing, x: number, y: number): [number, number] {
  if (F.speed <= 0) return [0, 0];
  const mag = f(F.speed * factor(F, x, y));
  return [f(mag * F.dirX), f(mag * F.dirZ)];
}

/** Moves a set's gusts on by a tick: TICK / T intervals past the centre, the whole intervals kept apart. */
function move(g: Gusts) {
  g.p += TICK / shape(g).T;
  const whole = Math.floor(g.p);
  g.k += whole; g.p -= whole;
}

// ---- The twin of sim.c's recipe: each line is the C's, every operation rounded to float32 as the C does ----

const C003 = f(0.03), C01 = f(0.1), C015 = f(0.15), C016 = f(0.16), C03 = f(0.3), C035 = f(0.35), C04 = f(0.4), C045 = f(0.45);
const C05 = f(0.5), C055 = f(0.55), C06 = f(0.6), C065 = f(0.65), C09 = f(0.9), C097 = f(0.97), C103 = f(1.03), C15 = f(1.5);

/** sim.c's smooth, in float32. */
function smoothF(x: number) { x = x < 0 ? 0 : x > 1 ? 1 : x; return f(f(x * x) * f(3 - f(2 * x))); }
/** sim.c's wave: a smooth rise and fall over each L. */
function wave(y: number, L: number) {
  const m = f(y - f(Math.floor(f(y / L)) * L)), u = f(m / L);
  return u < C05 ? smoothF(f(u * 2)) : f(1 - smoothF(f(f(u - C05) * 2)));
}

/** sim.c's Interval. */
interface Interval { left: number; span: number; d: number; rise: number; fall: number; tilt: number; Q: number; budget: number }

/** Where interval k0 + k starts, in intervals from k0: k, moved up to 0.3 either way (sim.c's edge). */
const edge = (G: Gen, k: number, seed: number) => f(k + f(C03 * f(f(2 * rnd((G.k + k) >>> 0, seed, 17)) - 1)));

/** sim.c's interval: interval k0 + k's gust. */
function interval(G: Gen, k: number, seed: number): Interval {
  const n = (G.k + k) >>> 0, r = (salt: number) => rnd(n, seed, salt);
  const left = edge(G, k, seed), span = f(edge(G, k + 1, seed) - left), seconds = f(span * G.T);
  const strength = r(59) < C016 ? f(C01 + f(C015 * r(53))) : f(C055 + f(C045 * r(53)));
  const peak = f(1 + f(f(G.H - C103) * strength)), floor = f(f(G.B + C003) + f(f(f(C097 - G.B) * C03) * r(131)));
  let rise = r(97) < G.slap ? C03 : f(1 + r(71)), fall = f(1 + f(C15 * r(113)));
  const a = f(f(f(f(1 - floor) / f(peak - floor)) * seconds) + f(C05 * f(rise + fall))), b = f(C09 * seconds);
  const length = a < b ? a : b;
  if (f(rise + fall) > length) { const s = f(length / f(rise + fall)); rise = f(rise * s); fall = f(fall * s); }
  const d = f(length / seconds), rs = f(rise / length), fs = f(fall / length);
  const tilt = f(C06 * f(r(157) - C04)), area = f(1 - f(C05 * f(rs + fs)));
  const moment = f(f(f(f(C035 * rs) * rs) + f(C05 * f(f(f(1 - fs) * f(1 - fs)) - f(rs * rs)))) + f(fs * f(C05 - f(C035 * fs))));
  const Q = f(d * (tilt >= 0 ? f(area - f(tilt * moment)) : f(area + f(tilt * f(area - moment)))));
  const u = f(f(1 - floor) / Q), v = f(f(peak - 1) / f(1 - Q));
  return { left, span, d, rise: rs, fall: fs, tilt, Q, budget: u < v ? u : v };
}

/** sim.c's gust: a set's part of the recipe at a point, before gustiness. */
function gust(G: Gen, x: number, y: number, spell: number, seed: number) {
  const along = f(f(x * G.hx) + f(y * G.hz)), across = f(f(f(y * G.hx) - f(x * G.hz)) + G.o);
  const bend = f(f(f(5 * f(wave(across, 40) - C05)) + f(C15 * f(wave(f(across + 7), 17) - C05))) / 108);
  const amp = f(C065 + f(C035 * wave(f(across + 11), 53)));
  const z = f(f(G.p - f(along / G.L)) - bend);
  let k = Math.floor(z), I: Interval;
  for (let pass = 0; ; pass++) {
    I = interval(G, k, seed);
    if (pass) break;
    if (z < I.left) k--; else if (z >= f(I.left + I.span)) k++; else break;
  }
  const u = f(f(f(f(z - I.left) / I.span) - f(C05 * f(1 - I.d))) / I.d);
  const pulse = f(f(smoothF(f(u / I.rise)) * smoothF(f(f(1 - u) / I.fall))) * (I.tilt >= 0 ? f(1 - f(I.tilt * u)) : f(1 + f(I.tilt * f(1 - u)))));
  return f(f(f(amp * spell) * I.budget) * f(pulse - I.Q));
}

/** sim.c's force at one point: the free air's speed there over the wind's (a + (b - a) w). */
function factor(F: Forcing, x: number, y: number) {
  if (F.speed <= 0) return 0;
  const g = F.gustiness;
  if (g === 0) return 1;
  const base = f(1 + f(f(g * C003) * F.swell));
  const a = f(base + f(g * gust(F.gens[0], x, y, F.spell, F.seed)));
  const b = F.fade !== 0 ? f(base + f(g * gust(F.gens[1], x, y, F.spell, F.seed))) : a;
  return f(a + f(f(b - a) * F.fade));
}
