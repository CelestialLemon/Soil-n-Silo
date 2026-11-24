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

**Status: implemented (2026-11-24), ready for PR-preview review (epic #298, issues #304–#309).** Every tool works in the browser and a
headless GPU playtest of the First Preview Gate passes with no console errors, at ~60 fps on the built valley at 18 px/m. Game rules
are in `src/game/` (pure TypeScript, tested in Node); the brush3d bridge is in `src/world/`; input and the tools in hand are in
`src/play/`; the floating UI is in `src/ui/`. What stays open is the developer's judgement on the preview: the feel, and the two
preview choices below.

- **Continuous terrain & close camera:** One seeded ~120 m pocket valley with rolling hills, a curving brook and pond, crags, seasonal trees, meadow grass, wildflowers, and reeds—rendered at `brush3d`'s close zoom (**16–96 px/m**). Generalize `brush3d`'s continuous heightfield land API (drawing from `farm.ts`) so the game works in continuous metres instead of 4 m tiles.
- **Free placement & soft settling:** Place, move, and freely rotate the **Farmhouse** and a starter set of buildings (Silo, Mill, Bakery, Solar Canopy, Wind Turbine, Water Wheel, Lantern, Bench) anywhere on gentle ground, with smooth natural pads beneath them.
- **Painted organic fields:** Brush/outline irregular Wheat and Bean fields onto hillsides, painted seamlessly as `brush3d` crop blankets.
- **Gravity irrigation channels:** Drag narrow hand-dug channels from the brook; paint soft downhill contour hints directly on the living grass while digging; water flows strictly downhill/along contours and visibly wets soil along both banks.
- **Curving tracks, plank bridges, hedgerows & trees:** Spline drawing for dirt tracks, wooden bridges across brooks/channels, hedgerows, and planted trees.
- **Minimal floating UI:** Quiet bottom tool bar, soft floating Move/Rotate/Remove ring on click, zero grid overlays.
- **Gate:** Play and inspect on PR preview. Do *not* layer simulation complexity until moving around, painting fields, placing huts, and carving gravity channels feels effortless and gorgeous.

### Milestone 2 — Core Homestead Loop: *Supplies, Power & First Harvest*
*Goal: a complete, playable 30-minute spring valley with real strategy and zero route spreadsheets.*

- **Capped Supplies economy:** One shared capped **Supplies** pool (100% refundable) with starter parcel + 1–2 milestone drops; nature/land-craft and Farmhouse stay free.
- **One-of-each workshops & first closed loop:** Wheat + Beans + Mill + Coop + Bakery + Composter + Silo + Garage + Depot. Soil fertility drains on harvest and recovers via Beans, Compost, or resting.
- **Day/night & power mix:** Living day/night cycle; Solar Canopies (including **agrivoltaics** placed right over painted fields), Wind Turbines driven by `brush3d`'s live gusts (`WindRecipe`), Water Wheel on stream current, and Batteries—read in-world via glowing lamps, smoke, spinning rotors/wheels, and battery charge rings.
- **Automatic Electric Carts:** Carts automatically haul goods along drawn tracks & plank bridges (slowed by hills, mud, and unbridged water) with zero route menus.
- **Open Homestead Brief:** Top-left 3-seal postcard (Pantry Order, Living Land, Steady Homestead) with no countdown timer.

### Milestone 3 — Microclimates, Ecology & Helper Drones
*Goal: deepen "working with nature" so clever land-craft visibly outperforms brute-force tech.*

- **Microclimates & shelter:** Slope erosion guarded by hedgerows/trees/beans; trees shading the Coop in heat (and casting real shade on Solar Canopies); windbreaks sheltering turbines and hives; agrivoltaic shade cooling heat-sensitive crops.
- **Water craft expanded:** Rain Tanks (buffering dry spells), Water Pumps (lifting water uphill for power + Supply cost, contrasting with free gravity channels), and Sprinklers.
- **Beehives & pollination:** Bees forage nearby flowering crops when calm and warm, boosting yield and producing Honey.
- **Helper Drone:** New Blender model (`brush3d/tools/blender/models/drone.py`) in the ceramic/copper kit; nimble short-hop hauling over slopes and brooks that grounds in gales/storms and drains faster in winter cold.
- **In-world priority pip:** Optional 1-click byproduct preference on a building's floating card when two workshops compete for bran or manure.

### Milestone 4 — Continuous Unpredictable Weather & All Four Seasons
*Goal: bring `brush3d`'s full living weather into gameplay as a continuous, unpredictable partner.*

- **Fresh unpredictable weather per run:** Continuous day-by-day weather simulation for all four seasons (Spring, Summer, Autumn, Winter) and climate characters—shifting clouds, showers, calm spells, morning fog, summer heatwaves/droughts, spring late-frost hollows, autumn gales, spring/storm floods, and winter cold snaps/blizzards.
- **Weather Station:** 1-Supply building that reveals 2–3 tiny upcoming sky icons beside the top-right dial.
- **Flood swales & winter glass:** Overflow swales guiding rising water around low meadows; **Heated Greenhouse** protecting tender crops and hosting foraging bees in winter.
- **Steady Homestead equilibrium check:** Continuous multi-day resilience seal that tests whether power, water, and loops hold cleanly through real weather.

### Milestone 5 — Full Roster, Campaign Valleys & Endless Seeds
*Goal: full 30–60 minute replayable game ready for daily drop-in play.*

- **Remaining crops & workshops:** Tomato + Cannery (Sauce), Sunflower + Oil Press (Oil, Seed Cake), Flax + Spinner + Loom (Yarn, Linen), Honey Cake at the Bakery, and the **Biogas Digester** (turning organic waste into storm-proof power).
- **Curated Campaign Valleys:** 6–8 handcrafted seeded valleys spanning all four seasons and distinct terrains (meadow, terraced hill, river bend, windy ridge, dry summer slope, winter glen).
- **Procedural Valley Generator:** Endless seeded valleys with season/terrain/difficulty controls and auto-balanced Supplies caps, plus Sandbox mode.
- **Save/Load, Settings & Sound:** Clean single-version saves (no legacy migrations), `brush3d` quality/weather accessibility settings, gentle ambient soundscape (wind, brook, rain, turning wheels, humming carts).

---

## Decisions & Preview Choices for Vertical Slice 1

- **Channel flow (decided 2026-11-24):** Gravity-only for v0.2—water obeys downhill/contour flow without thinning the brook's downstream flow when multiple channels tap it.
- **Camera yaw (to judge on PR preview):** Compare four snapped 90° views vs. smooth free orbit around the valley.
- **Power wiring (to judge on PR preview):** Compare slim free wooden pylons along paths/yards vs. local wireless radius around power buildings + relays once buildings stand together.
- **Flipping the preview choices:** Both are buttons in the *Preview choices* card (top right) and URL options: `?yaw=snap|orbit`
  and `?wiring=pylons|wireless`. They combine with `seed`, `season`, `hour`, `weather` and `quality`, e.g.
  `?yaw=orbit&wiring=wireless&seed=77&season=winter&hour=golden&weather=soft-rain`. The option not picked is removed before merge.
- **Weather in Vertical Slice 1 (decided 2026-11-24):** The game's four weathers draw with brush3d presets: Clear → `clear`,
  Breeze → `scattered`, Overcast → `overcast`, Rain (shown as *Showers*) → `soft-rain`. Booting from any other brush3d preset
  maps back to the nearest of the four. Continuous, unpredictable weather comes in Milestone 4.
- **Controls (Vertical Slice 1):** WASD/arrows pan, the wheel zooms, a middle drag (or a left drag with no stroke tool) pans, a
  right drag orbits in free orbit, a right click puts the tool down. Q/E turn the view (a 90° step when snapped, a hold when
  orbiting). R and Shift+R (or Shift+wheel) turn the ghost or the selected building by 15°, and ↻ turns clockwise on screen.
  `[` and `]` resize the field brush (2–5 m). Space pauses. Esc first drops a drag or a move under way, then puts the tool down.
