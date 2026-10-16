# Soil n Silo — Design (v0.1, the solarpunk pivot)

Oct 9, 2026 · @Ashutosh Shinde

## Overview

Soil n Silo is a build-only automation game in a solarpunk valley. Each level is a commission from a nearby settlement: on a
seeded map you lay out fields, machines, power and the trucks' routes, and the farm then runs on its own until the commission's goals
are delivered. A level takes about 30 to 60 minutes.

The game replaced a Stardew-like season (the earlier MVP, decided 2026-10-06, built by 2026-10-07) on 2026-10-09. The reason: the
only player is also the designer, so a reward loop of unlocking new crops, items and machines doesn't work: the designer already knows all of
them. An automation loop does: the fun is in building a layout, finding its bottleneck, fixing it and watching the throughput rise,
and that stays fun when every rule is known. Short, seeded levels are also quick to test, where a full season was hours.

**Core loop:** read the map (soil, water, wind, space) → lay out a chain → power it → watch it run → find the bottleneck → fix it →
deliver the commission faster.

**What makes it not Factorio:** farming. Soil is a resource that wears out and comes back, so fields need compost, resting or beans;
byproducts must go somewhere (feed, compost or the digester), so the closed loops of a real farm are the puzzle; the sun sets every
few minutes and the wind comes and goes, so power needs storage and a mix of sources.

**In v0.1**

- 18 goods, 5 crops, chickens and bees, 6 processing machines, 4 power sources and storage
- Trucks on routes you set, over the open ground between buildings: no belts and no roads to build; silos to store goods
- Buildings next door trade directly: a mill between wheat fields takes their wheat without a truck
- Pylon power networks, each with its own balance
- Soil fertility, sprinklers, compost and pollination
- 8 campaign commissions, random commissions from any seed, a sandbox
- A soft timer: the commission always finishes; gold, silver or bronze by how long it took

**Not in v0.1:** research or unlocks (every building is available from the start), pipes and fluids, weather events, trains,
blueprints and copy-paste, sound, multiple saves per level.

## Camera, presentation and controls

The camera stays as it was: orthographic, a 3/4 view at about 30° pitch, 4 views 90° apart (Q/E), zoom (the wheel, a trackpad pinch,
+/− or Z) and panning (drag, right-drag or the arrow keys). Zoom eases smoothly towards the pointer. Low-poly, flat-colour models drawn as
pixel art by `pixel3d-renderer`. Everything is seen from 4 sides.

Each art pixel is always drawn as a square of the same size on screen (2×2 screen pixels by default; the pixel size is a
setting in the menu, 1×1 to 4×4). Zooming changes how much ground fits on the screen, so models are drawn with more art
pixels close up and fewer far out. Chosen on 2026-10-10 over two other ways, tried side by side in play: magnifying a fixed
picture (art pixels growing from 1×1 to 6×6) and stepping through six fixed detail levels; the free zoom looked and felt best.

![The same mill zoomed in, the three ways tried: magnify, detail steps, free (chosen)](images/zoom-modes.png)

It is build-only and point-and-click. There is no character and no manual farming: you place, rotate, configure and remove.

| Input | Does |
| --- | --- |
| The dock (bottom) or hotkeys (by default F field, L silo, T garage, P pylon, S solar) | Pick a building to place; its placement card says what it would do on the tile under the pointer |
| Click / drag | Place it; a drag places a row (pylons: a power line, spaced so their reaches meet) |
| R | Turn what you're placing (for looks) |
| Click a building with nothing in hand | Select it: the inspector shows its status, buffers, settings and history |
| A garage's inspector | Buy a truck; give each of its trucks a route, or none |
| O, or the Routes button | The routes card: every route with its stops, goods, goods a minute, loop time, the gap between trucks at its slowest stop, and problems; point at one to draw it on the map; click it to open it |
| An open route (from a truck, a building, or the routes card) | Rename it; add a stop by clicking a building; set what it drops and picks up and its wait; reorder or remove stops; add or take away trucks; see what each truck is doing and how much it waited, and dump its cargo; copy or delete the route |
| A truck's inspector | Its route, cargo and battery; dump its cargo (the goods are lost); sell it |
| X, then click or drag | Remove (full refund) |
| Esc / right click | Drop what's in hand, close the inspector |
| Space, 1, 2, 3 | Pause, 1×, 2×, 4× speed. You can build while paused |
| Tab | The ledger: the valley's health, and each good made, used and delivered |
| W | The Power panel: the last day by source, each network, tonight's charge, where the watts go |
| G | The guide: a page for every building (what it does, how to use it, what it takes and gives, its numbers), the goods, and the basics |
| V (or the view bar) | Views: soil fertility, sprinkler water, power reach, roads, bee range |
| Esc | Close what is open; with nothing open, the pause screen (the way to the settings, what the markers mean, every key as set) |

The build preview is see-through, green where it fits and red where it doesn't.

**Readability rules**

- A building with a problem shows a marker above it, each kind with its own shape as well as its colour: half circle waiting
  (for input, or flowers), square blocked, triangle no or low power, drop dry, ring unreachable or no route takes its goods.
- Rest the pointer on a building for a card with its status ("Mill: waiting for wheat"). Point at a tile in the dock for a card
  about that building.
- Trucks carry their cargo in an open bed, so the flow of goods is always visible, and trucks queuing at a building show
  where it is stuck.
- Selecting a truck or a route draws the route's way on the ground, its numbered stops and its trucks. Selecting a building
  lists the routes that stop there. The inspector says what each truck is doing ("taking 6 wheat to the mill", "waiting at the
  field for wheat", "2nd in the queue at the mill", "charging at the garage").
- A building trucks can't reach, or whose outputs are full with no route or building next door taking them, shows a purple marker.
- Goods handed to a building next door hop over the edge the two share. Selecting or pointing at a building tints the
  neighbours it trades with, and its inspector lists them ("Takes wheat from 2 fields", "Gives bran to the coop"); a
  building in hand tints the ones it would trade with, and its placement card says so.
- The roads overlay shows the open ground trucks can drive on, and the buildings they can't reach.
- The inspector keeps each building's history over the last 1, 5 or 10 minutes of play (5 by default, the choice kept from
  building to building), so a problem noticed late can be traced: a ribbon of its statuses in time (problems hatched, so they
  don't rely on colour), pointing at it says what happened then and for how long, and below it the share of the time in each
  status as a ring, the goods it made a minute against full speed, and what it waited for, ranked, with a fact for each.
  Solar panels and turbines chart the watts they made and batteries their charge instead. Pylons, silos, the depot and
  saplings have none. The history lives in memory, not in the save: after a reload it fills again.
- The guide (G) has a page for every building, with where its good comes from and, during a commission, every building of
  its kind in the valley now; G with a building in hand or selected, or the book in the inspector, leads to it.
- Soil colour shows fertility under fields. Overlays show fertility everywhere, power coverage and roads.
- Power stays in the background until you work with it: pylons are short, quiet posts and nothing else is drawn. The power
  overlay, placing anything that makes, stores or uses power, selecting a building on a network, or pointing at a power
  building shows the networks, each in its own colour: the ground its pylons reach, wires joining its pylons, a line from a
  pylon to every building it powers, and a label with what it makes and uses and how full its batteries are. A focused or
  placed pylon shows both its ranges: its reach (a square, 3 tiles) and its link range (a dashed circle, 8 tiles).
- A battery's cells light up from the bottom as it fills, one ring a quarter.

![The power buildings before and after the 2026-10-11 redesign, without and with the power overlay](images/power-before-after.png)

![A selected pylon's reach, link range and network; a drag laying a line of pylons](images/power-network.png)

![The guide's page for the mill](images/guide.png)

![A bakery's history over 5 minutes, pointing at the strip; a wind turbine's watts](images/history-bakery.png) ![](images/history-turbine.png)

## The interface

The HUD and menus use the Clearday design system (`src/ui/clearday/`, chosen in October 2026 over five other directions):
frosted chalk cards with big soft corners over the world, gauges that fill as goals approach, muted mineral colours, and a
screen kept nearly empty so the valley is what you look at. Its principles:

- **Don't play the game for the player.** No plans, bills of materials, "first hour" steps, bottleneck answers or "one more X
  would…" suggestions before or during play. Screens state facts; the player works out what to do. Analysis belongs after the
  game, on the results screen, the one place a "next time" line is allowed.
- **Find problems in the world.** Problems show as markers over buildings. A problems strip on the right edge is an
  experimental setting, off by default.
- **Projections are optional.** "Done by" and the gold and silver pace ticks appear only with the *Show pace* setting.
- **Keep the HUD quiet; heavy data gets its own place.** Power has its own panel; production chains and lead times live in the
  guide; building rates live in the inspector, never as labels over the map.
- **No hotkeys printed in the HUD.** Every key still works; keys are listed on the pause screen and appear in tooltips. Every key but Esc can be changed in Settings (Keys tab, from the level select or the pause screen); the panel's Game tab holds the other settings.
- **Status never by colour alone.** Each status pairs its tint with a shape and a word.
- **Two clocks, and watts not energy.** A game day lasts four minutes of play. Anything measured over minutes of play (history,
  rates a minute, idle shares, the commission clock, the results' milestones) is in play time ("5 min ago", `13:00` of play);
  times of day (`dusk 20:00`, `dry at 02:40`, the Power panel's day) are in-game hours. Screens show average watts and battery
  percentages, never watt-hours.

Settings, kept in the browser: interface size (90–130%; the interface also scales with the window, designed at 1920 × 1080 and
held down to about 1366 × 768), pixel size, reduce motion, show pace, and the problems strip.

## Time

The simulation runs in fixed steps of 0.1 s. A day lasts 240 s at 1× (4 minutes); a commission starts at 7 AM, and the sun shines
from 6 AM to 8 PM (scenarios change this), so night is about 40% of a day. The level timer counts simulated time, so speed controls only change
how long you wait, and pausing to plan is free.

The wind follows a smooth seeded curve between about 0.15 and 1.0 of full strength.

## The map

Each level is generated from a seed: a grid of about 48 × 40 one-metre tiles.

| Tile | Notes |
| --- | --- |
| Grass | Buildable. Has a fertility (0–100) from noise, which fields use |
| Water | A river or ponds. Not buildable. Sprinklers near water use less power |
| Rock | Not buildable. Can be cleared for 15 credits |
| Tree | Not buildable. Slows wind turbines next to it. Can be cleared for 5 credits (soil health drops a little) |

A **freight depot** (3 × 3) stands at one edge. Anything a truck drops at it counts towards the goals and pays credits (see Logistics).

## Goods

| Good | From | Used by | Pays |
| --- | --- | --- | --- |
| Wheat | Field | Mill | 2 |
| Beans | Field (restores soil) | Coop (feed) | 2 |
| Tomato | Field | Cannery | 3 |
| Sunflower | Field | Oil press | 3 |
| Flax | Field | Spinner | 3 |
| Egg | Coop | Bakery | 6 |
| Manure | Coop | Composter, digester | 1 |
| Honey | Beehive | Bakery | 10 |
| Flour | Mill | Bakery | 7 |
| Bran | Mill (byproduct) | Coop (feed), composter, digester | 1 |
| Oil | Oil press | Cannery | 12 |
| Seed cake | Oil press (byproduct) | Coop (feed), composter, digester | 2 |
| Compost | Composter | Fields | 4 |
| Yarn | Spinner | Loom | 10 |
| Linen | Loom | (product) | 45 |
| Bread | Bakery | (product) | 22 |
| Tomato sauce | Cannery | (product) | 40 |
| Honey cake | Bakery | (product) | 60 |

Prices and timings are starting values; they live in `src/game/data.ts`.

```mermaid
flowchart LR
  Field -- wheat --> Mill
  Mill -- flour --> Bakery
  Mill -- bran --> Coop
  Field -- beans --> Coop
  Coop -- egg --> Bakery
  Coop -- manure --> Composter
  Composter -- compost --> Field
  Hive -- honey --> Bakery
  Field -- sunflower --> Press[Oil press]
  Press -- oil --> Cannery
  Press -- seed cake --> Coop
  Field -- tomato --> Cannery
  Field -- flax --> Spinner
  Spinner -- yarn --> Loom
  Bakery -- bread, honey cake --> Depot
  Cannery -- sauce --> Depot
  Loom -- linen --> Depot
  Mill -- bran --> Digester
  Digester -- power --> Grid
```

## Buildings

Every building is available from the start. Removing one refunds its full cost, so trying layouts is free.

### Logistics

There are no belts and no roads to build. Goods move by **truck**, along **routes** you set, over the open ground between
buildings. Storing goods is a building of its own, the **silo**, and carrying them is the trucks' job, so you buy each
separately: a slow route wants more trucks, not more storage. (Chosen on 2026-10-12 over silos whose own drones carried every
good: they swarmed the nearest jobs, left far ones waiting, held whatever their drones happened to grab, and the only way to
more drones was more storage. Drones come back later as automatic helpers, see Open questions.)

| Building | Size | Cost | Power | Notes |
| --- | --- | --- | --- | --- |
| Silo | 2 × 2 | 80 | — | Stores up to 30 of each good. Trucks drop goods into it and pick them up |
| Garage | 2 × 2 | 100 | 20 W per truck charging | Home of up to 4 trucks, bought here for 60 each. Charges them |

**Roads are the empty ground.** A truck drives on any grass tile with nothing on it; water, rock, trees and every building
(fields, pylons, sprinklers and saplings too) block it. It goes the shortest way, from tile centre to tile centre in 8
directions (a diagonal only when both tiles beside it are open), at 3 tiles/s. Trucks pass through each other on the road.

To load or unload, a truck parks on an open tile next to the building: the nearest one it can drive to. A building with no
open tile next to it, or only ones walled off from where the truck is, can't be reached: the truck skips that stop and goes on
to the next, and if it can reach none of its stops it waits where it is. Its way is worked out again whenever the layout
changes, so a building placed across its way sends it round, and a truck on a tile you build on moves to the nearest open
tile. Packing buildings tightly saves ground but makes trucks drive further round, or cuts a building off.

**One truck at a time.** A building loads or unloads one truck at a time (the depot two); the others queue beside it in the
order they came. A queue is the sign of a bottleneck: split the route, or put a silo between.

**Routes.** A route is a loop of up to 8 stops. Each stop is a building and what to do there:

- **Drop:** the goods to unload. The building takes only what it uses and has room for; the depot takes everything and buys it.
- **Pick up:** the goods to load: a field's harvest, a machine's outputs, a silo's stock.

A good is either dropped or picked up at a stop, never both.

A stop can do both: drop compost at a field and pick up its wheat. A truck carries 6 goods, of any mix. It drives to stop 1,
2, …, the last, then stop 1 again. At a stop it drops what the building takes, then picks up into the room it has left (goods the building won't take yet stay
aboard), 4 goods a second; picking up several goods, it
takes one of each in turn (in the stop's order, skipping any the building has none of), so a mix comes out even. It is **done** when it carries none of the stop's
drop goods and is full (or the stop picks up nothing), and then leaves at once. Until it is done it waits for room in the
building or for more goods, up to the stop's **wait** (5 s unless you set it, 0 to 60 s) after the last good moved; with a
wait of 0 it moves what it can and leaves. If another truck is queued for the building, a truck with nothing to move right
now leaves at once, so a truck waiting for a full mill to make room never blocks the truck that would empty it. Goods a truck
couldn't drop ride on to the next stops. Picking up fills the truck: a route that picks up tomatoes at a field and then oil
at a silo, both for a cannery, can arrive at the silo already full of tomatoes. Give each ingredient its own route.

A new stop starts out picking up everything the building makes and dropping everything it takes, which suits most stops: a
field, then a mill, then the depot. A silo stop starts out dropping everything and picking up nothing; a good you set it to pick up is no longer dropped there.

**Trucks.** Every truck belongs to a garage and runs one route at a time, or none (it drives home and waits at its garage).
Several trucks can run the same route: adding trucks is how a route goes faster. A truck given another route, or none, leaves
any building or queue at once and keeps its cargo; it drops it at the first stop that takes it. Selling a truck refunds it,
and removing a garage sells its trucks; goods they carry are lost, like goods in any building removed. Removing a building
takes it out of every route that stops there. A truck whose current stop goes away (its building removed, or the stop taken
out of the route) leaves the building or its queue at once and goes on to the next stop; a route left with no stops sends its
trucks home. Two routes that pick up the same good share it by how often
their trucks come, so on First Light one truck taking wheat to the depot and one taking it to the mill split it about half
each. Routes and neighbours decide where every good goes; there is no sell list and no per-building input toggle.

**Power.** A truck has a 300 J battery and uses 1 J a tile. Before it leaves a stop it checks that after the next leg it could
still drive home to its garage; if not, it drives home first, charges full (at 20 W, so 15 s from empty) and then drives
straight to that next stop, without checking again. A truck that runs empty on the way crawls on at 0.5 tiles/s, so a route
too long for its battery is slow but never stuck. A truck that can't drive to its garage (the layout walled it off) can't
charge: it carries on its route without the check, crawling once empty, and shows that it can't reach home. A garage outside every pylon's reach, or on a network out of power, can't
charge: a truck that has charged nothing for 5 s goes on anyway, crawling once empty, so a garage whose power comes from a
digester its own trucks feed never locks up. Trucks are bought fully charged. At night trucks charge from what the batteries hold, like any machine.

**Byproducts stay strict.** A mill whose bran no route picks up fills its own buffer and stops. A silo full of one good takes no
more of it, but still takes every other good, so only that chain stops. Trucks share their room, though: a truck full of bran
that none of its stops takes has no room for anything else, and stops every chain on its route. Give a byproduct somewhere to
go, or a route of its own.

**Problems a route shows** (on the route, on its trucks, in the routes panel, and as a marker on the building): a stop that
can't be reached, a stop with nothing to do (it neither takes nor gives any of its goods), a truck carrying goods none of its
stops takes (or full of compost none of its fields takes now), a truck that can't reach its garage, a route with no trucks,
and a building whose outputs are full with no route or neighbour taking them. A truck stuck with goods no stop takes can **dump** its cargo: the goods are lost.

**Next door.** Buildings that share an edge (touching only at a corner doesn't count) trade without trucks. Each step, every
machine takes up to one of each good its recipe uses from the buildings next door that have it waiting, from whichever has
the most, and a field takes compost the same way. Buildings sharing a giver take turns: the one that took a good longest
ago goes first, so two coops beside one mill both get its bran. Fields, hives and machines give (a harvest, honey, a machine's outputs);
machines and fields take. Silos and the depot don't trade next door: storing and selling stay the trucks' job, so a farm
still needs trucks for the long hops and the last one. Next door comes first: it runs before trucks load, so a mill beside
a field gets its wheat before a truck that stops there. A walled-in building needs no road when no route stops there and it
trades with its neighbours.

So the short, dull hops (fields to the mill, bran to the coop, flour and eggs to the bakery, manure to the composter) can be
built into the layout, and trucks are left for the far and specific ones. Packing buildings together costs open tiles, so
it is a trade: a mill boxed in by fields gets their wheat, but no truck can bring it more. Byproducts stay strict next door
too: a composter whose only taker is one full field stops, and with it the coop that feeds it. (Chosen on 2026-10-12, after
playing trucks: every level needed many trucks, and routes doing a field-to-mill hop were the bulk of them.)

![A garage selected: its trucks, each with its route and what it is doing, and the routes' ways on the ground](images/trucks-garage.png)

![Editing a route: its stops numbered on the map, and what each drops and picks up](images/trucks-route.png)

![The roads overlay: the open ground trucks drive on](images/trucks-roads.png)

![The routes panel (O): every route, renamed in place, with its stops, goods, trucks and problems](images/routes-panel.png)

![A coop selected: it takes bran from the mill next door (tinted), no truck needed](images/next-door.png)

![The route editor: its name, each truck's state with a dump button, and its stops](images/route-editor.png)

### Farming

| Building | Size | Cost | Power | Notes |
| --- | --- | --- | --- | --- |
| Field | 3 × 3 | 30 | — | Grows the chosen crop on its 9 tiles. Takes compost (a truck brings it) |
| Sprinkler | 1 × 1 | 25 | 3 W within 8 tiles of water, else 8 W | Waters fields whose centre is within 3 tiles |
| Coop | 3 × 3 | 150 | — | Four chickens. Every 2 feed (beans, bran or seed cake) give 2 eggs and 1 manure, 16 s |
| Beehive | 1 × 1 | 60 | — | Makes honey from flowering fields (not wheat) within 4 tiles, faster with more of them (up to 3). Pollinates fields within 4 tiles |
| Composter | 2 × 2 | 60 | — | Any 2 of manure, bran and seed cake → 1 compost, 20 s |

**Crops**

| Crop | Grows in | Yield | Soil per harvest |
| --- | --- | --- | --- |
| Wheat | 40 s | 3 | −1 |
| Beans | 50 s | 2 | +2.5 (restores) |
| Tomato | 60 s | 4 | −1.5 |
| Sunflower | 70 s | 3 | −2 |
| Flax | 55 s | 3 | −1.5 |

- Grow times are with water at fertility 60. Growth speed is ×0.4 without water, and from ×0.4 (fertility 0) to ×1.4
  (fertility 100) by the field's average fertility.
- A pollinated field (a hive within 4 tiles) yields 1 more of a flowering crop.
- A harvest waits in the field (up to 6) until a truck picks it up. A full field stops growing.
- A field holds no compost. It takes one (from a truck or a composter next door) only while its average fertility is under
  85, and spreads it at once: +12 on each tile. A truck carries the compost a field won't take on to the next stop, and
  doesn't wait for a field whose soil is good to take it (it still waits for a harvest the stop picks up). Compost no field
  needs has to go somewhere (the depot or a silo), or the composter fills and stops. (Chosen on 2026-10-15: fields used to
  keep up to 4 compost for later, so the first field on a route took every unit and the rest starved.)
- A route whose only compost drops are fields picks up only as much compost as they take now, counting what its trucks
  already carry; a route that also drops compost at the depot or a silo picks it up freely. So a truck never fills up with
  compost its fields won't take and jams: with no room for their harvest the fields would stop growing, and their soil would
  never wear down to take it. A truck that ends up full of it anyway (a composter next door fed the fields first) says so,
  and can dump it. (Chosen on 2026-10-15, after the Morning Bread bot locked up that way.)
- Ground without a field rests: it regains 0.1 fertility a second (6 a minute), up to what it started at. Moving a field
  lets worn ground recover.

### Processing (powered)

| Building | Size | Cost | Power | Recipe |
| --- | --- | --- | --- | --- |
| Mill | 2 × 2 | 200 | 12 W | 2 wheat → flour + bran, 6 s |
| Oil press | 2 × 2 | 220 | 15 W | 2 sunflower → oil + seed cake, 8 s |
| Spinner | 2 × 2 | 200 | 10 W | 2 flax → yarn, 6 s |
| Loom | 2 × 2 | 300 | 20 W | 3 yarn → linen, 10 s |
| Bakery | 2 × 2 | 350 | 25 W | flour + egg → bread, 8 s; or flour + egg + honey → honey cake, 12 s (choose) |
| Cannery | 2 × 2 | 300 | 18 W | 3 tomato + oil → tomato sauce, 10 s |

A machine holds a small buffer of each input and each output. It starts a batch when it has the inputs and room for every output.
**Byproducts are strict:** a mill whose bran has nowhere to go stops, which is the point: route it to chickens, compost or the
digester.

### Power

| Building | Size | Cost | Notes |
| --- | --- | --- | --- |
| Solar panel | 2 × 2 | 70 | 30 W at noon, following the sun; nothing at night |
| Wind turbine | 1 × 1 | 120 | 40 W at full wind; each tree or tall building within 2 tiles costs 10% (down to 40%) |
| Battery | 2 × 2 | 150 | Stores 2.4 kJ, charges and discharges at up to 40 W |
| Digester | 2 × 2 | 180 | Burns one manure, bran or seed cake every 10 s for a steady 30 W |
| Pylon | 1 × 1 | 10 | Powers buildings with any tile within 3 tiles; links to pylons within 8 tiles |

Pylons that link form a network. Each network adds up what its generators make and what its machines want; surplus charges its
batteries, a shortfall drains them, and if that isn't enough every machine on it slows to the share it gets. A building outside
every pylon's reach has no power.

### Ecology

| Building | Size | Cost | Notes |
| --- | --- | --- | --- |
| Sapling | 1 × 1 | 5 | Grows into a tree in 60 s |

**Soil health** is the average fertility of all field tiles (50 before you have a field), plus 0.25 for every tree more than
the map started with (minus for every tree fewer), at most 10 either way. Some commissions need it above a level when the rest
is delivered.

## Commissions (levels)

A commission has goals, a target time and modifiers. It ends when every goal is met.

- **Goals:** deliver *n* of a good; reach a delivery rate of a good (per minute, over the last minute); keep soil health above a
  level at the end.
- **Medals:** gold within the target time, silver within 1.5×, bronze any time after. There is no failing.
- **Modifiers:** sun strength and hours, wind strength, soil richness, how much rock, water and forest the map has, starting credits.

**Campaign** (seeds fixed, so each plays the same every time; goals, credits and target times in `src/game/scenarios.ts`):

| # | Name | Goals | Target | Modifiers |
| --- | --- | --- | --- | --- |
| 1 | First Light | 120 wheat, 80 flour | 20 min | Gentle |
| 2 | Morning Bread | 150 bread; soil health ≥ 40 | 35 min | |
| 3 | Windy Ridge | 90 oil, 80 bread | 40 min | Weak sun, strong wind, rocky |
| 4 | Linen for the Looms | 50 linen; 5 yarn/min | 50 min | |
| 5 | Long Nights | 60 honey cake | 45 min | Short days |
| 6 | Tired Soil | 50 sauce; soil health ≥ 55 | 45 min | Poor soil |
| 7 | Riverlands | 30 linen, 30 sauce, 80 bread | 55 min | Wet and cramped |
| 8 | Harvest Festival | 40 honey cake, 30 sauce, 30 linen; soil health ≥ 60 | 60 min | Everything |

The bot (`npm run sim`) clears First Light in about 14 minutes, Morning Bread in about 30 and Linen for the Looms in about 25 with
trucks (with silos and drones it took about 14, 38 and 45), building as credits allow. Its Morning Bread layout built round
neighbours (`npm run sim -- c2:next`: a mill between two fields, a bakery beside it, a coop under both, a composter beside the
coop) clears it in about 26 minutes with 3 trucks on 2 routes, where the all-truck layout uses 4 on 3; a person needs a few minutes more to plan and
place. Trucks made the later commissions much quicker, so their target times may be too generous now. The other targets are guesses
until they have bot layouts too.

![The level select](images/menu.png)

**Random commission:** any seed and a difficulty (1–3) pick the modifiers and 2–4 goals.
**Sandbox:** a large calm map, unlimited credits, no goals: for trying things.

## Economy

You start with credits (1,100–1,800 by commission). Everything costs credits; every good delivered to the depot pays its price.
Early on, raw goods are the way to afford the first machines; products pay far better per field.

## Saving

The game saves the commission in progress (one at a time) in the browser every 30 s and when the page is hidden, and remembers
each commission's best medal and time. A save from an older version of the game is refused.

## Open questions

- [ ] Tuning: crop times, machine times, prices and target times are first guesses. A scripted bot run per commission
  (`npm run sim`) should check that each one can be cleared and roughly in its target time.
- [ ] Truck numbers (6 goods, 3 tiles/s, 300 J, 5 s wait, 4 per garage) and the silo's 30 of each good are first guesses.
- [ ] Next door: should it reach further (a radius, or through a silo next to both), and should silos or the depot ever take
  from neighbours? Kept to machines and fields for now, so storing and selling stay the trucks' job.
- [ ] Next door: a producer with two hungry neighbours feeds them in turn, one good a step each; a machine boxed in by fields
  can't also get wheat by truck. Is that the right puzzle?
- [ ] Should a stop cover several buildings (say every field in a box, the truck going to whichever has the most waiting),
  so a row of fields isn't one stop each?
- [ ] One truck at a time per building makes a busy silo the bottleneck. A puzzle (build a second silo) or a chore (give
  silos two bays)?
- [ ] Should a pick-up have a limit ("up to 3 oil"), so one route can carry two ingredients without the first filling it?
- [ ] Should buildings load on one side only, the one they face (R)? It would make turning a building matter.
- [ ] Drones, once trucks have been played: automatic helpers from a drone hub that fly straight over water and crowded
  ground, carry little and use more power, and are assigned jobs by the hub as a whole, so none chase the same job.
- [ ] Weather (rain waters fields, storms stop turbines) as a later modifier.
- [ ] Blueprints/copy-paste once layouts grow large.
