# Soil n Silo — Design (v0.2, the cozy homestead pivot)

Nov 24, 2026 · @Ashutosh Shinde

## Overview

Soil n Silo is a **build-and-watch, grid-free solarpunk homestead game** set in an intimate, painterly valley. Each round drops you into a compact valley in a single season—no story, no unlock grind, and no countdown timer. Over **30 to 60 minutes**, you read the land (hills, brooks, soil, sun, shade, and wind), settle a personal homestead, paint organic fields, dig gravity irrigation channels, connect your yard with curving tracks and plank bridges, and guide your little farm into thriving, self-sustaining balance against **continuous, unpredictable living weather**.

**Why the pivot (2026-11-24):**
The previous version (v0.1, Oct 9) was a Factorio-style timed automation game built on a 4 m tile grid, later adapted onto **brush3d** (`brush3d/`), our painterly renderer. Even after terrain and visual polish, the grid-factory rules fought what made `brush3d`'s own farm demo feel magical: zoomed-out helicopter views, square bulldozed pads, duplicate-building spam, truck-route spreadsheets, and hiding the meadow to read overlays. v0.2 starts fresh around `brush3d`'s strengths—keeping the entire renderer and all 28 solarpunk models (`brush3d/docs/MODELS.md`)—so that **making a valley look like a living painting is the exact same thing as solving its puzzle**.

**Design pillars:**

1. **Beauty and strategy are the same thing.** Planting hedgerows stops slope erosion and shelters turbines; curving tracks follow gentle grades; solar canopies over wheat shade summer crops while generating power; hand-dug channels follow contour lines to water hillsides for zero watts; old shade trees keep hens cool. You never strip the valley bare to optimize it.
2. **Work with nature, not over it.** Natural hills, streams, and rock outcrops stay sacred—no omnipotent earthworks flattening ridges or raising giant walls. You adapt to the land with human-scale craft: gravity irrigation channels, shallow flood swales, plank bridges, windbreaks, and smart siting.
3. **Personal, "one of each" scale.** You build *a* farmhouse, *a* mill, *a* bakery, *a* coop, *a* greenhouse—never rows of duplicate factories. Every building is a recognisable place in your yard.
4. **Real challenge without time pressure.** No countdown clock, no medals for rushing, and no infinite money-printing by waiting. The bite comes from a **tight, hard-capped Supplies budget** (100% refundable so tinkering is painless), **equilibrium checks** you can't wait out, and **continuous unpredictable weather**.
5. **95% painting, minimal menus.** Zero route tables, zero ledgers, zero 10-minute status graphs. Read how the farm is doing by looking at the world itself—silo gauges, battery rings, flowing rills, glowing ovens, turning millstones, and carts rolling down tracks.

---

## Scale, Camera, and Presentation

- **Valley size:** An intimate pocket valley roughly **100–140 m across** (continuous metres, no coarse 4 m tile grid), framed by soft rising hills and distant woods beyond its playable boundary.
- **Camera:** Orthographic 3/4 view at 30° pitch, smooth panning and zoom right inside `brush3d`'s sweet spot (**16–96 px/m**, starting around **28–36 px/m**) so brush strokes, roof herbs, water reflections, and swaying crops fill the screen. Supports turning around the valley (4 cardinal views or smooth yaw—to test in Vertical Slice 1).
- **Art direction:** `brush3d`'s *"painted world, inked things"* (`brush3d/docs/DIRECTION.md`), using all 28 handcrafted solarpunk models (`brush3d/docs/MODELS.md`)—**including** the `home` set (`farmhouse`, `bench`, `lantern`, `planter`, `rain_tank`, `crates`) that v0.1 left out, plus a new ceramic-and-copper **helper drone** model.
- **Build-and-watch:** Point-and-click / brush-and-drag. No player character and no manual crop clicking. Pause, 1×, 2×, and 4× speed controls; building and tinkering while paused is always free.

### Minimal HUD and In-World Readability

The screen stays almost empty so the valley is what you look at:

1. **Bottom tool strip:** Compact palette for homestead buildings (showing placed / one-of-each state), solarpunk tech, and free land-craft brushes (paint field, dig channel, draw track/bridge, plant hedge/tree, yard props), alongside your single **Supplies** counter (`available / unlocked · cap`).
2. **Top-left Valley Brief:** A quiet postcard of **2–4 visual seals** filling gently as you meet the valley's goals. No timer.
3. **Top-right Sky Strip:** Time-of-day dial and live weather icon. Once you build the **Weather Station**, 2–3 tiny upcoming sky icons appear beside it (sun, cloud, rain, gale, frost, heat, snow)—no popup forecast table needed.

**Everything else lives in the world:**

- **Building state:** Silo gauge window shows fill; battery rings light from the bottom up (`charge_0`..`charge_3`); working ovens glow and puff smoke; millstones, water wheels, and rotors turn at their real pace; unpowered or stalled buildings sit still and dark.
- **Nature & water:** Dug irrigation channels visibly fill and wet the dark soil along their banks; dry crops pale and droop; frost lays visible white rime on hollows; floods swell over low meadows; carts carry visible goods in their beds; drones dock quietly when grounded by wind.
- **Clicking a building:** Opens a tiny floating ring/card right beside the building—**Move**, **Rotate**, **Remove** (instant full refund), a plain one-line status ("Waiting for wheat", "Sheltered from gale"), and at most a single 1-click choice (crop/recipe or byproduct priority when two buildings want the same good).
- **Soft in-world tool hints:** Holding a tool paints gentle, painterly hints *directly onto the living grass*—contour/downhill ripples when digging a channel, soft sun/shade or wind feel when placing power, soft moisture glow when painting a field. **Never hide the meadow to display a grid or spreadsheet overlay.**

---

## Grid-Free Land-Craft (Free & Organic)

Working with the land is always **free (0 Supplies)** and freely editable/erasable so beauty and natural craft never compete with your puzzle budget. Nature's own rules—gravity, soil health, shade, wind, and distance—are the limits.

### 1. Free Building Placement & Soft Settling
- Place buildings anywhere on gentle, clear ground at **any rotation**.
- Instead of carving boxy cliffs, placing a building gently blends a small organic flat pad into the surrounding slope (just as `brush3d`'s farm demo does in `brush3d/src/demo/scenes/farm.ts`). Steep banks, rocky crags, and streams remain unbuildable (except the Water Wheel notched neatly into a riverbank).
- Your very first act in any valley is placing your **Farmhouse** (0 Supplies)—choosing where to make home before spending a single Supply.

### 2. Painted Organic Fields
- Instead of stamping square tiles, **brush or outline irregular fields** directly onto hills and clearings—curving around boulders, trees, tracks, and bends in the brook.
- **Size & shape matter:** Output scales with field area, but oversized fields demand more irrigation reach, pull harder on soil fertility, and create more hauling work for your carts/drones.
- **Soil & slope:** Every patch reads the real ground beneath it (loam, silt, clay, sand, stony), moisture, sunlight/shade, and slope steepness. Steep patches erode faster per harvest unless guarded by hedgerows, nearby trees, or soil-restoring beans.

### 3. Gravity Irrigation Channels (Star Mechanic)
- Drag a narrow **hand-dug irrigation rill** starting from a brook, pond, or uphill Water Pump / Rain Tank.
- **Gravity rules (v0.2):** Water flows **downhill or gently along a contour**—never uphill without a powered pump—and channel flow is purely gravity-based (tapping channels does not thin the brook's downstream flow in v0.2; downstream flow budgeting is parked for later). Holding the channel tool paints faint contour ripples across the hillside so you can read the fall of the land at a glance.
- **Zero-watt irrigation:** A flowing channel keeps a lush green strip of soil moist on both sides for **0 watts**, letting you reserve scarce Supplies instead of spamming pumps or sprinklers.
- **Flood swales:** Expecting heavy rain or a spring spate? Dig a shallow **overflow swale** to guide rising water around a low meadow into a lower hollow or catch basin.
- **Crossings:** Where a dirt track meets a brook or dug channel, drop a **wooden plank bridge** (free) so carts roll smoothly across.

### 4. Curving Tracks, Hedgerows, Trees & Yard Props
- **Dirt tracks & footpaths:** Drawn as smooth splines. Carts drive fastest and most efficiently on gentle contoured tracks; off-track driving bogs down in mud and drains extra battery.
- **Hedgerows & fences:** Drawn along field borders and slopes. Mechanically real: hedgerows reduce slope erosion and shelter nearby crops, bees, and wind turbines from harsh gales.
- **Planted trees:** Grow from saplings over time (or small groves) to shade the Coop in summer heat and break wind—while casting real shade on nearby Solar Canopies and blocking gentle breezes if sited poorly.
- **Yard props:** Benches, planters, crates, fences, and **solar lanterns** (lanterns softly light tracks and yards after dusk)—all free to place so every homestead feels personal and lived-in.

---

## Homestead Scale & Economy: One-of-Each + Capped Supplies

### One-of-Each Workshops
Every craft and homestead building is singular (**maximum 1 per valley**):
- **Home & Hub:** Farmhouse (free), Depot (valley edge / airship landing), Silo, Garage, Weather Station.
- **Farm & Craft Workshops:** Mill, Bakery, Coop, Composter, Greenhouse, Oil Press, Cannery, Spinner, Loom, Biogas Digester.
- **Modular / Repeatable Pieces:** Painted Fields, Gravity Channels, Tracks, Bridges, Hedgerows, Trees, Yard Props (all free); plus Solar Canopies, Wind Turbines, Water Wheels, Batteries, Water Pumps, Rain Tanks, Sprinklers, Beehives, Electric Carts, and Helper Drones (limited only by your Supplies cap and suitable terrain).

### One Shared Capped Pool: **Supplies**
Both homestead workshops and solarpunk tech draw from **one single capped Supplies pool**:

- **Hard ceiling per valley:** Time never prints extra Supplies—waiting longer can never brute-force a weather or equilibrium puzzle.
- **Starter parcel + milestone drops:** You begin with roughly half the valley's Supplies (enough to get water, first crops, and basic power humming) and receive **1–2 milestone drops** from the settlement as your homestead takes root (e.g., first harvest stored in the Silo, first crafted good shipped to the Depot), up to the valley's hard cap.
- **100% refundable tinkering:** Moving, rotating, or dismantling any building or tech returns its full Supplies cost immediately. Hitting a snag during a storm or cold snap feels like iterating on a clever contraption, never a restart penalty.
- **Why one shared pool works:** Every natural shortcut frees Supplies for *anything* else—digging a gravity channel instead of a Water Pump, rotating beans instead of building a Composter, sighting a Water Wheel instead of extra Solar + Batteries, or laying a smooth track instead of a Drone lets you invest in a Heated Greenhouse, Weather Station, or extra Battery.
- **Procedural balance:** For any random valley seed, the generator computes the minimum Supplies needed for the brief's required workshops, adds a tight difficulty-scaled allowance for power, water, and automation, and splits that cap cleanly between starter parcel and milestone drops.

### Provisional Supplies Costs (Initial v0.2 Tuning)

| Cost | Pieces |
| --- | --- |
| **0 (Free)** | Farmhouse, Painted Fields, Gravity Channels, Tracks, Plank Bridges, Hedgerows, Fences, Planted Trees, Yard Props (bench, lantern, planter, crates), Slim Power Pylons / relays |
| **1 Supply** | Beehive, Rain Tank, Sprinkler, Water Pump, Weather Station, Solar Canopy, Battery, Electric Cart, Helper Drone |
| **2 Supplies** | Silo, Composter, Garage, Mill, Coop, Oil Press, Cannery, Spinner, Loom, Bakery |
| **3 Supplies** | Wind Turbine, Water Wheel, Heated Greenhouse, Biogas Digester |

*(Note: Slim wooden power relays/pylons are free—or power links cleanly along tracks—so players never feel taxed for wiring a scenic homestead. Exact costs and caps will be playtested and tuned from Vertical Slice 2 onward.)*

---

## Zero-Menu Solarpunk Logistics: Carts & Drones

Because workshops are one-of-each, every good has a natural home—there is **no route editor, no stop list, and no truck-queue spreadsheet**.

- **Electric Carts:** Bought at the Garage (or first cart paired with the Garage/Farmhouse). Carts automatically pick up harvests, inputs, byproducts, and finished goods and ferry them along your **drawn dirt tracks and bridges**, prioritizing starved workshops and full fields, and recharging automatically when low.
  - *Spatial puzzle:* Gentle, well-connected tracks keep one cart brisk and power-frugal; steep climbs burn battery; mud slows off-track detours; flooded fords cut off unbridged meadows.
- **Helper Drones:** Small, quiet ceramic-and-copper drones that make nimble short hops over slopes, streams, and yards—ideal for hilltop Beehives, terraced herb/flower plots, or moving Compost without carving a switchback track.
  - *Real tradeoff:* **Drones ground in strong gales and storms**, carry small loads, and lose battery faster in winter cold—so a resilient homestead still relies on thoughtful layout and grounded tracks.
- **Single-click priority (only when needed):** When two placed buildings want the same byproduct (e.g., bran wanted by both Coop and Composter), clicking the producer shows a simple 1-click toggle to prefer one over the other.

---

## Farming, Microclimates, Power, and Closed Loops

### Crops & Goods
Kept crisp and farm-authentic (reusing the proven craft chains from v0.1, introduced gradually across milestones):

- **Crops:** Wheat, Beans (restores soil, flowers), Tomato (warmth-loving, frost-tender, flowers), Sunflower (drought-hardy, frost-tender, flowers), Flax (cool-loving, flowers).
- **Animals & Ecology:** Hens (Coop: feed → Eggs + Manure; shaded by nearby trees in summer heat), Bees (Beehives: nearby flowering crops → Honey + pollination yield boost; stay in below 10°C or in gales, forage in Heated Greenhouses during winter).
- **Closed Loops:** Milling Wheat makes Flour + Bran; pressing Sunflowers makes Oil + Seed Cake; Hens make Eggs + Manure. Bran, Seed Cake, and Manure never go to waste—they cycle into Hen feed, the **Composter** (restoring field fertility), or the **Biogas Digester** (dispatchable power through calm, dark nights).
- **Crafted Pantry Goods:** Flour, Bread (Flour + Egg), Honey Cake (Flour + Egg + Honey), Oil, Tomato Sauce (Tomato + Oil), Yarn, Linen.

### Microclimates & Agrivoltaics
- **Agrivoltaics:** Solar Canopies can be placed **directly over painted fields** (just like `brush3d`'s farm demo). They generate electricity while shading the crop beneath—protecting heat-sensitive crops (wheat, beans, flax) during summer heatwaves, at a mild light reduction on cloudy days.
- **Living Wind & Cloud Shadows (`brush3d/src/shared.ts`):** Turbines feel the exact gusts sweeping across the grass; Solar Canopies dim under passing cloud shadows and nearby tree shade; ridges catch stronger wind (faster power, but exposed to severe gales unless partially sheltered by trees or hedgerows).
- **Water & Gravity:** Fields are watered by rain, proximity to a brook or flowing **gravity channel**, a Rain Tank (buffers dry spells), or a powered Sprinkler / Pump (for high ground water can't reach by gravity).
- **Frost Hollows & Slope Warmth:** Low basins pool cold air on frosty nights (nipping tender crops unless tucked under glass or planted on higher slopes).

---

## Continuous, Unpredictable Living Weather

- **One season per valley:** Spring, Summer, Autumn, or Winter—fixed for the round so `brush3d` builds the valley's seasonal trees, wildflowers, grass, and palette once at load.
- **Climate character:** Each valley's postcard gives a plain sense of the season ("A wet spring", "A dry summer", "Autumn, gales", "A hard winter") so you read the landscape wisely from minute one.
- **Truly unpredictable every run:** While a valley's **terrain** comes from its seed (so you can replay or share a favourite map), its **weather rolls freshly every time you play**. Clouds, showers, calm spells, fog, heatwaves, dry spells, late frosts, gales, floods, cold snaps, and blizzards drift in continuously across days and nights—never saved up as a single scripted finale.
- **Weather Station:** Spending 1 Supply on the Weather Station reveals the next **2–3 days** as tiny sky icons beside the top-right dial, giving you calm time to adapt (dig a flood swale, shift a Supply into a Battery or Rain Tank, tuck hives near the Greenhouse).
- **Disrupts, never destroys:** Bad weather slows carts, grounds drones, freezes tender open crops (they regrow once thawed), swells brooks, or tests your power storage—it never destroys buildings, harms animals, or deletes stored goods.

---

## Valley Goals, Equilibrium, and Replayability

Every valley opens with a **single Open Homestead Brief** from minute one (no artificial phase locks) made of **three interlocking seals**:

1. **The Pantry Order:** Deliver the valley's requested harvest and crafted goods to the Depot (e.g., Bread & Honey, Tomato Sauce, Linen).
2. **Living Land:** Reach and hold healthy valley soil fertility (prevents painting giant un-watered, eroding fields to cheese the order).
3. **Steady Homestead (Equilibrium Check):** Keep the homestead powered, watered, and running smoothly across a continuous stretch of living weather (e.g., **2 full day-night cycles** without a blackout or stalled essential loop). If an unexpected night, drought, or storm breaks your setup, the seal pauses/resets and you see *why* right in the world—letting you pause, tinker (100% refundable), and strengthen your homestead until it truly holds.

When all seals fill, the valley is **Restored**—with no rush to leave. Linger in golden hour, refine your gardens, or step into a new valley.

### Modes
- **Campaign Valleys:** 6–8 curated seeded valleys spanning all four seasons and distinct landforms (gentle spring meadow, terraced hillside, floodplain bend, windy rocky ridge, dry summer slope, hard winter glen), designed as 30–60 minute single-sitting puzzles.
- **Procedural Valleys:** Endless replayability—pick a season, terrain style, and difficulty (or roll random) to generate a fresh pocket valley with its own brief, auto-balanced Supplies cap, and freshly rolled weather.
- **Sandbox:** Unlimited Supplies, free weather controls, pure cozy homestead crafting.

---

## Architecture: What Stays and What Rebuilds

- **Kept untouched (`brush3d/`):** The entire painterly WebGL renderer, shaders, living wind, dynamic water, rain/snow/frost/lightning, cloud shadows, performance pools, `/brush3d/` demo scenes, and all 28 Blender models (`brush3d/src/models/`, `brush3d/tools/blender/`).
- **Pure simulation (`src/game/`):** Rebuilt cleanly in pure TypeScript (no DOM, no Three.js, runs in Node for `npm test`). Operates in **continuous metres**: a fine terrain heightfield (e.g. 1 m grid for elevation, slope, moisture, soil, and channel flow), free-placed `(x, z, yaw)` buildings, painted polygon/mask fields, and spline tracks/channels/hedgerows.
- **World bridge (`src/world/`):** Thin layer feeding continuous terrain, carved channels, painted field blankets, tracks, bridges, and free-placed models into `brush3d` through `brush3d/src/index.ts`.
- **Renderer extensions (`brush3d/`):** Added cleanly via `brush3d/src/index.ts` and documented in `brush3d/docs/API.md` as milestones need them:
  1. Continuous/chunked heightfield land API (generalizing what `farm.ts` already builds, so the game no longer speaks in 4 m tiles).
  2. Organic polygon/mask painted crop blankets and dirt tracks/hedgerow splines.
  3. Narrow carved gravity water channels with wet-bank blending.
  4. A new Blender script & model for the **helper drone** (`brush3d/tools/blender/models/drone.py`).
- **UI (`src/ui/`):** Ultra-light Clearday-inspired overlay—quiet chalk/mineral aesthetic, three tiny screen-edge elements, floating in-world building ring, zero spreadsheets.
