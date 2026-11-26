# Roadmap (v0.2 — The Cozy Homestead Pivot)

Goal: build the game in [`DESIGN.md`](DESIGN.md)—a grid-free, build-and-watch solarpunk homestead game played in 30–60 minute single-season valleys, designed directly around `brush3d`'s close-up, organic, painterly strengths.

The renderer lives in [`brush3d/`](../brush3d/README.md) (its own roadmap is [`brush3d/docs/ROADMAP.md`](../brush3d/docs/ROADMAP.md)) and stays intact alongside all 28 solarpunk models (`brush3d/docs/MODELS.md`) and the `/brush3d/` demo.

---

## History

- **2026-10-06/07 — The Season MVP:** A Stardew-like 28-day point-and-click farm (hand tools, chickens, mill, oven). Built and playable, then replaced.
- **2026-10-09 — v0.1, the Grid Automation Pivot:** Replaced by a Factorio-inspired timed commission game on a 4 m tile grid (belts → drones → truck routes, 18 goods, 4 seasons, 13 weather events, Clearday HUD).
- **2026-11-16 — The Swap to `brush3d`:** Replaced the pixel-art renderer with `brush3d` and 28 new handcrafted solarpunk Blender models, followed by Wave 1 terrain/meadow polish (curving shores, crags, grass, wildflowers, reeds, frosted winter far woods).
- **2026-11-24 — v0.2, the Cozy Homestead Pivot (current):** Playtesting v0.1 on `brush3d` exposed a core genre-and-scale mismatch: the zoomed-out 4 m tile grid, duplicate-building spam, truck-route tables, and par-time pressure fought the intimate, organic feel of `brush3d`'s farm demo. v0.2 keeps `brush3d/` and all 28 models untouched, archives v0.1 in git history, and rebuilds `src/` around grid-free land-craft, gravity irrigation channels, one-of-each workshops, scarce capped Supplies, continuous unpredictable weather, and minimal menus.

---

## Build Plan (Playable-First)

Each milestone ends in something genuinely playable in the browser on PR preview (`https://celestiallemon.github.io/Soil-n-Silo/pr-<number>/`) so look and game feel are judged firsthand before adding more content.

### Milestone 0 — Clean Slate
**Status: done (2026-11-24, `6d3e1e0`).** v0.1 is tagged `archive/v0.1-grid-automation`; `src/` and `test/` start from a minimal skeleton.

- Preserve v0.1 cleanly in git history (tag `archive/v0.1-grid-automation` before removing old files).
- Replace the old 4 m tile-grid `src/` and `test/` with a clean, minimal skeleton (`src/game/`, `src/world/`, `src/ui/`, `test/`).
- Keep `brush3d/`, its demo at `/brush3d/`, all `render:*` scripts, CI checks, and PR live previews working throughout.

### Milestone 1 — Vertical Slice 1: *The Living Valley* (Prove the Feel First)
*Goal: open a single intimate valley in the browser and immediately feel the magic of `brush3d`'s farm demo—except you are shaping it.*

**Status: done (merged 2026-11-25, PR #310; epic #298, issues #304–#309).** Every tool works in the browser and a
headless GPU playtest of the First Preview Gate passes with no console errors, at ~60 fps on the built valley at 18 px/m. Game rules
are in `src/game/` (pure TypeScript, tested in Node); the brush3d bridge is in `src/world/`; input and the tools in hand are in
`src/play/`; the floating UI is in `src/ui/`. After the first PR-preview playtest (2026-11-25) the two preview choices are
settled (free orbit camera with a snapped setting; wireless relays) and the valley was reshaped so gravity channels flow from
the brook across a meadow terrace (see *Decisions* below). What stays open is the developer's judgement on the feel.

- **Continuous terrain & close camera:** One seeded ~120 m pocket valley with rolling hills, a curving brook and pond, crags, seasonal trees, meadow grass, wildflowers, and reeds—rendered at `brush3d`'s close zoom (**16–96 px/m**). Generalize `brush3d`'s continuous heightfield land API (drawing from `farm.ts`) so the game works in continuous metres instead of 4 m tiles.
- **Free placement & soft settling:** Place, move, and freely rotate the **Farmhouse** and a starter set of buildings (Silo, Mill, Bakery, Solar Canopy, Wind Turbine, Water Wheel, Lantern, Bench) anywhere on gentle ground, with smooth natural pads beneath them.
- **Painted organic fields:** Brush/outline irregular Wheat and Bean fields onto hillsides, painted seamlessly as `brush3d` crop blankets.
- **Gravity irrigation channels:** Drag narrow hand-dug channels from the brook; paint soft downhill contour hints directly on the living grass while digging; water flows strictly downhill/along contours and visibly wets soil along both banks.
- **Curving tracks, plank bridges, hedgerows & trees:** Spline drawing for dirt tracks, wooden bridges across brooks/channels, hedgerows, and planted trees.
- **Minimal floating UI:** Quiet bottom tool bar, soft floating Move/Rotate/Remove ring on click, zero grid overlays.
- **Gate:** Play and inspect on PR preview. Do *not* layer simulation complexity until moving around, painting fields, placing huts, and carving gravity channels feels effortless and gorgeous.

### Milestone 2 — Core Homestead Loop: *Supplies, Power & First Harvest*
*Goal: a complete, playable 30-minute spring valley with real strategy and zero route spreadsheets.*

**Status: implemented (2026-11-25), ready for review (epic #299).** The living homestead runs in `src/game/` (`stepSim`: the
clock, Supplies, goods, crops, workshops, the power mix, the carts and the brief, all pure TypeScript; `test/playthrough.test.ts`
plays the Spring Valley headless from an empty homestead to Restored in about four game-days). The world draws each tick
(crops at their growth step, Electric Carts driving with their cargo in the bed, workshops' parts and lights, the battery's
charge rings), and the play layer steps the sim every frame at the sky's pace (1×/2×/4×, paused at 0), with warm toasts for
the parcels, the seals, a blackout (once an episode) and Restored. A headless GPU playtest of the full loop (build the yard
inside the 12 starter Supplies, both drops, Coop, Bakery and Composter, the Pantry Order, all three seals) runs with no
console errors at ~60 fps.

- **Capped Supplies economy:** One shared capped **Supplies** pool (100% refundable) with starter parcel + 1–2 milestone drops; nature/land-craft and Farmhouse stay free.
- **One-of-each workshops & first closed loop:** Wheat + Beans + Mill + Coop + Bakery + Composter + Silo + Garage + Depot. Soil fertility drains on harvest and recovers via Beans, Compost, or resting.
- **Day/night & power mix:** Living day/night cycle; Solar Canopies (including **agrivoltaics** placed right over painted fields), Wind Turbines driven by `brush3d`'s live gusts (`WindRecipe`), Water Wheel on stream current, and Batteries—read in-world via glowing lamps, smoke, spinning rotors/wheels, and battery charge rings.
- **Automatic Electric Carts:** Carts automatically haul goods along drawn tracks & plank bridges (slowed by hills, mud, and unbridged water) with zero route menus.
- **Open Homestead Brief:** Top-left 3-seal postcard (Pantry Order, Living Land, Steady Homestead) with no countdown timer.

### Milestone 3 — Microclimates, Ecology & Helper Drones
*Goal: deepen "working with nature" so clever land-craft visibly outperforms brute-force tech.*

**Core implemented (#300).** Spring Valley asks for 10 Bread, 6 Flour, 6 Beans and 4 Honey. The one-cart playthrough restores seed 1042 with a gravity channel, Rain Tank and Beehive for 19 of 20 Supplies. The second cart uses the last Supply.

- Rain Tanks buffer fields within 10 m, powered Sprinklers water within 11 m, and Beehives serve a 14 m radius. Each costs 1 Supply. A Sprinkler draws 1 W.
- A field qualifies when a planted cell falls inside the radius. Bee visits last until harvest. The 25% yield bonus rounds to whole cargo units.
- Mill and Coop cards cycle the preferred byproduct destination. Bakery cards choose Bread or Honey Cake for the next batch. The current paid batch finishes first.
- The separate Water Pump remains planned. The Helper Drone model awaits the developer’s art choice.

- **Microclimates & shelter:** Slope erosion guarded by hedgerows/trees/beans; trees shading the Coop in heat (and casting real shade on Solar Canopies); windbreaks sheltering turbines and hives; agrivoltaic shade cooling heat-sensitive crops.
- **Water craft expanded:** Rain Tanks (buffering dry spells), Water Pumps (lifting water uphill for power + Supply cost, contrasting with free gravity channels), and Sprinklers.
- **Beehives & pollination:** Bees forage nearby flowering crops when calm and warm, boosting yield and producing Honey.
- **Helper Drone:** New Blender model (`brush3d/tools/blender/models/drone.py`) in the ceramic/copper kit; nimble short-hop hauling over slopes and brooks that grounds in gales/storms and drains faster in winter cold.
- **In-world priority pip:** Optional 1-click byproduct preference on a building's floating card when two workshops compete for bran or manure.

### Milestone 4 — Continuous Unpredictable Weather & All Four Seasons
*Goal: bring `brush3d`'s full living weather into gameplay as a continuous, unpredictable partner.*

**Implemented, ready for review (#301).** Every run rolls fresh weather (`?wseed=` replays one; `?climate=` picks the
season's character, otherwise the valley's own), lived continuously through all four seasons: the sky, wind, rain, snow,
lightning, floods, ice and rime are drawn from the game's weather; the postcard names the season's character ("A hard
winter"); the sky strip reads out the weather and the air's temperature, and once a Weather Station stands, three days
ahead as small sky icons (day and temperatures on hover). `?weather=` locks the weather until the readout is clicked. The
Heated Greenhouse's card toggles its crop (Beans or Wheat) and shows its draw and whether it's warming nearby bees; a
clicked field says when it's frosted or flooded; jumping the clock reads the weather again at once, even paused. Checked
in GPU Chromium on all four seasons at ~60 fps with no console errors.

**Rules (wave 1: `src/game/`).** The Winter Valley restores
seed 1042 with a Heated Greenhouse, a Beehive, a Weather Station and two Water Wheels for all 20 Supplies; the Spring
Valley still restores in its own living weather (and with a stormy character's wind and clouds).

- Each valley has a weather seed of its own (from the valley seed unless one is rolled) and a character per season
  (`weather.ts`): an endless, deterministic run of 6–16 h spells easing into each other over 1.5 h, with a forecast that
  is exactly the weather to come. A fixed weather passed to `stepSim` still holds (old `'rain'` reads as soft rain).
- Frost hollows run up to 3.5°C colder on still clear nights, rises 0.5°C warmer. Frost sets beans back (never below a
  replant); wheat is hardy to -2°C; snow buries both; 30°C dries fields not under solar canopies.
- Floods: a soaked catchment raises the brook and pond up to 0.38 m; the water spills over the low ground beside them,
  thinning 3 cm per metre
  and never more than some 13 m from the bank (a higher water only ever raises it). Dry or hot summers drain fast (rarely a flood); wet and stormy characters flood more. Deep
  flood water (over 12 cm) cuts unbridged cart routes and shallow water is mud; flooded fields wait. A rill off the brook
  that flows at least 8 m and falls 25 cm is an overflow swale (one dug back into the same water is not): it takes up to
  18 cm off the flood round it.
- The Weather Station (1 Supply) unlocks the 3-day forecast. The Heated Greenhouse (3 Supplies) grows 2 Wheat or Beans
  every 3.2 h whatever the weather, drawing 2 W below 10°C and 0.5 W above, and lets bees within 14 m forage inside it in
  the cold. Outdoors, bees stay in below 10°C.
- Each season has its own Pantry Order (winter: 8 Bread, 6 Flour, 6 Beans, 2 Honey). Steady Homestead counts only while
  something grows: it pauses (without resetting) after 6 h of every growing field parched, while every field stands
  frosted or flooded, or while a full Greenhouse is all there is, unless a warm Greenhouse grows on; it goes on once they
  grow again. Gales slow unsheltered carts,
  frost drains their batteries faster, and soaked ground bogs them down off the tracks.

- **Fresh unpredictable weather per run:** Continuous day-by-day weather simulation for all four seasons (Spring, Summer, Autumn, Winter) and climate characters—shifting clouds, showers, calm spells, morning fog, summer heatwaves/droughts, spring late-frost hollows, autumn gales, spring/storm floods, and winter cold snaps/blizzards.
- **Weather Station:** 1-Supply building that reveals 2–3 tiny upcoming sky icons beside the top-right dial.
- **Flood swales & winter glass:** Overflow swales guiding rising water around low meadows; **Heated Greenhouse** protecting tender crops and hosting foraging bees in winter.
- **Steady Homestead equilibrium check:** Continuous multi-day resilience seal that tests whether power, water, and loops hold cleanly through real weather.

### Milestone 5 — Full Roster, Campaign Valleys & Endless Seeds
*Goal: full 30–60 minute replayable game ready for daily drop-in play.*

**Part 1, the full roster (#302), done and played on the GPU:** Tomato, Sunflower and Flax fields paint beside Wheat and
Beans (Land tools, brush3d's organic crop blanket). The Oil Press, Cannery, Spinner and Loom stand in the Homestead group
(2 Supplies each, one of each), and the Biogas Digester (3 Supplies, Shift+6) in the Power group: it burns manure, bran or
seed cake into 4 W day and night in any weather, its flare lit while it burns, with a 15 m wireless range. The Oil Press's
handwheel and the Spinner's wheel turn and the Cannery steams while they work with power. The Heated Greenhouse's card
cycles all five crops; a Mill's, Coop's or Oil Press's byproduct pip shows once two of its destinations stand, and cycles
Auto and those. The tool trays wrap onto a second row on a laptop screen.

- **Remaining crops & workshops:** Tomato + Cannery (Sauce), Sunflower + Oil Press (Oil, Seed Cake), Flax + Spinner + Loom (Yarn, Linen), Honey Cake at the Bakery, and the **Biogas Digester** (turning organic waste into storm-proof power).
- **Curated Campaign Valleys:** 6–8 handcrafted seeded valleys spanning all four seasons and distinct terrains (meadow, terraced hill, river bend, windy ridge, dry summer slope, winter glen).
- **Procedural Valley Generator:** Endless seeded valleys with season/terrain/difficulty controls and auto-balanced Supplies caps, plus Sandbox mode.
- **Save/Load, Settings & Sound:** Clean single-version saves (no legacy migrations), `brush3d` quality/weather accessibility settings, gentle ambient soundscape (wind, brook, rain, turning wheels, humming carts).

---

## Decisions & Preview Choices for Vertical Slice 1

- **Channel flow (decided 2026-11-24):** Gravity-only for v0.2—water obeys downhill/contour flow without thinning the brook's downstream flow when multiple channels tap it.
- **Camera yaw (decided 2026-11-25: Free Orbit default + Snapped 90° player setting):** The camera turns in a smooth free
  orbit by default. Snapped 90° views stay as a player setting (the small camera toggle beside the ⟲ ⟳ turn buttons in the
  sky strip), remembered in the browser (`soil-n-silo:camera-yaw`); a link's `?yaw=orbit|snap` overrides it. The temporary
  *Preview choices* card is gone.
- **Power wiring (decided 2026-11-25: Wireless Relays; wooden pylons removed):** Each power building projects a soft local
  wireless field, and free **Power Relays** carry it on; a building or lantern inside a fed field is powered. The wooden pylon,
  its overhead wires and `?wiring=` are removed. The fields show as calm thin rings (blue where they carry power,
  sand-coloured dashes where they don't yet) only in the **power view** (the sky strip's bolt, or `P`) or while a power
  building or relay is placed, moved or picked; open play shows none (developer's rule, 2026-11-25).
- **Valley shape for gravity channels (decided 2026-11-25, after the PR #310 playtest):** A plain V-shaped valley left every
  bank climbing away from the brook, so no rill could be dug. Valleys now fall steadily down the brook (~5.4 m across 120 m),
  and on the homestead's side the brook runs along a low natural levee above a broad meadow terrace that lies 0.2–2.5 m below
  the upper and middle brook's water (`src/game/valley/generate.ts`). A rill tapped there and led out across the terrace runs
  20–60 m on gravity; the far bank and the valley's head still climb, so a rill led uphill stops at a dry sill. The pond fills
  to where the brook comes in, held on its downhill side by a low natural bank. Contours show every 20 cm while digging.
- **Weather in Vertical Slice 1 (decided 2026-11-24):** The game's four weathers draw with brush3d presets: Clear → `clear`,
  Breeze → `scattered`, Overcast → `overcast`, Rain (shown as *Showers*) → `soft-rain`. Booting from any other brush3d preset
  maps back to the nearest of the four. Continuous, unpredictable weather comes in Milestone 4.
- **Controls (Vertical Slice 1):** WASD/arrows pan, the wheel zooms, a middle drag (or a left drag with no stroke tool) pans, a
  right drag orbits in free orbit, a right click puts the tool down. Q/E turn the view (a 90° step when snapped, a hold when
  orbiting). R and Shift+R (or Shift+wheel) turn the ghost or the selected building by 15°, and ↻ turns clockwise on screen.
  `[` and `]` resize the field brush (2–5 m). Space pauses. Esc first drops a drag or a move under way, then puts the tool down.

## Decisions for Milestone 2

- **The clock (2026-11-25):** The world's sky owns the hour; the sim's hour follows it each frame and the day turns as it passes
  midnight. The sky strip's Dawn, Noon, Golden and Dusk move both together and keep the day (a jump lives through no time).
- **The Depot (2026-11-25):** Every valley comes with its Depot near the edge on the farming side and a short starter track out of
  its ramp; it can't be moved, turned or removed (its card is read-only), and it and its stub don't count as the player's edits.
- **Solar Lanterns (2026-11-25):** Each has its own little solar cap, so it glows after dusk whether or not it's inside a power
  field; the workshops, Garage, Coop and Farmhouse light only while powered.
- **Open for the developer:** Living Land seals as soon as 100 m² of fields stand on soil at 75% or better, and the valley's loam
  starts at 85%, so it usually seals on the first afternoon; whether it should instead ask the soil to *hold* that for a while
  (DESIGN.md: "reach and hold") is a balance call.
