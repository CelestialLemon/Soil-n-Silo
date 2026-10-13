# UI revamp: Clearday

Oct 13, 2026

The HUD and menus in `src/ui/` were built for the proof of concept. This folder holds the agreed design for replacing them:
the screens, standalone mockups, the decisions behind them and the new numbers the game has to compute. The design system
itself lives where the code will use it, in [`src/ui/clearday/`](../../src/ui/clearday/README.md).

**Status:** designed, not built. The game still draws its UI with `src/ui/style.css` and the current `hud.ts`, `menu.ts`,
`guide.ts` and `historyView.ts`.

## Picking up the work

1. Read the principles below and the system's [`README.md`](../../src/ui/clearday/README.md).
2. Open a mockup in a browser (`docs/ui-revamp/mockups/*.html`, straight from disk, no server needed). Each is a static
   1920 × 1080 page built only from the Clearday classes over a real capture of the game; read its markup for the classes a
   screen uses. `screens/*.webp` are the same pages rendered.
3. Build one screen at a time, in roughly this order: load the Clearday CSS beside `style.css`; the play HUD (commission card,
   readouts, dial, panel buttons, view bar, dock, toasts); the inspector; the routes side card; pause and settings; the level
   select, briefing and results; the guide; the ledger; last, the new Power panel. Remove the old styles for each screen as it
   moves over.
4. The new numbers (below) are pure functions in `src/game/`, unit-tested in `test/`, like `history.ts`. Build each with the
   screen that first needs it. A screen can ship without a number it doesn't have yet: leave the block out rather than fake it.
5. Every number in the mockups is from one running example (Morning Bread, day 4, 13:00, from the bot's layout). Treat them
   as placeholders for the real values. Mind the two clocks (below).
6. When the revamp is done, follow the cleanup list at the end.

## Principles

- **Don't play the game for the player.** No plans, bills of materials, "first hour" steps, bottleneck answers or "one more X
  would…" suggestions before or during play. Screens state facts; the player works out what to do. Analysis belongs after the
  game, on the results screen.
- **Find problems in the world.** Problems show as markers over buildings (the game draws these today). A problems strip on
  the right edge exists only as an experimental opt-in setting.
- **Projections are optional.** "Done by" and gold and silver pace ticks appear only with the *Show pace* setting, off by
  default.
- **Keep the HUD quiet; heavy data gets its own place.** Power has its own panel. Production chains and lead times live in the
  guide. Building rates live in the inspector, never as labels over the map.
- **No hotkeys printed in the HUD.** Every key still works. Keys are listed on the pause screen and appear in tooltips.
- **Status never by colour alone.** Each status pairs its tint with a shape (circle working, half circle waiting, square
  blocked, triangle no power, drop dry, ring unreachable) and a word.

## Screens

| Screen | Mockup | Replaces | What it holds |
| --- | --- | --- | --- |
| Level select | [main](mockups/main.html) · [png](screens/main.webp) | `menu.ts` | Continue card; the eight commissions as a path of rings down the valley (best medal, progress, par); the chosen commission's card: goals as big icons with numbers, medal times as chips, sun, wind and soil as plain bars against a normal valley; random commission (seed, difficulty, live preview); sandbox; the replace warning. |
| Briefing | [briefing](mockups/briefing.html) · [png](screens/briefing.webp) | `showIntro` | A personal letter from the settlement, goals as gauges, medal times, starting credits, Begin and Read the guide. No plan, no tips about how to play. |
| Play | [play](mockups/play.html) · [png](screens/play.webp) | `Hud` | Commission card (top left: name, clock, goals as 270° gauges, medal times line). Readout pills (credits with income, power made and used, stored charge). The dial (day and hour, the sun's position, speed control) with sun and wind chips. Panel buttons: Ledger, Routes, Power, Guide (icon and word). View bar bottom left (Off, Soil, Water, Power, Roads, Bees). Dock bottom centre: category segments over building tiles with price and watts, and Remove. The placement forecast: an ink card on the ghost with facts for that tile (output a minute, soil now → in 10 min, water). Toasts above the dock. Markers over buildings for problems. |
| Play, problems strip | [play-problems](mockups/play-problems.html) · [png](screens/play-problems.webp) | — | Play plus the experimental strip: a count and one row per problem on the right edge, each opening a popover (status, building, cause, for how long, click to go there). Only with the setting on. |
| Inspector | [inspect](mockups/inspect.html) · [png](screens/inspect.webp) | inspector in `hud.ts`, `historyView.ts` | A 480 px side card. Header: name, category, size, watts. The recipe as a line of stores (`flour 3/3 + egg 0/3 → bread 2/3`) with the batch timer; status with since when; output a minute. Tabs: **Workings · History · Next door**. History: status ribbon over the last 5 minutes, share of time as a ring, output against full speed, made / delivered / in store, and *What it waits for* ranked as facts. Move, recipe choice, Remove with refund. |
| Routes | [routes](mockups/routes.html) · [png](screens/routes.webp) | routes panel and route editor | Routes drawn on the land in their colours with numbered stops; a side card listing routes; the open route's stops with drop and pick-up as icon toggles per good and a wait slider; loop time, how often a truck reaches each stop, idle share per truck. Truck tags on the map. |
| Power panel | [power](mockups/power.html) · [png](screens/power.webp) | — (new) | A sheet: made, used, stored. Power by source over the last 24 hours as a radial chart (an hour a slice, night shaded, short hours marked). Networks table (made, used, stored, short). Tonight: the charge until sunrise, when it runs dry and how short after. Sources over 24 h, digester included. Where the watts go, by building. Battery health: when the batteries ran dry each night. |
| Ledger | [ledger](mockups/ledger.html) · [png](screens/ledger.webp) | Stats (Tab) | Valley health (soil with trend, trees, pollination cover) and a calm goods table: made, used by your buildings, to the depot, a minute and in all, in stores; credits earned, spent and now. A Power › button opens the Power panel. |
| Guide | [guide](mockups/guide.html) · [png](screens/guide.webp) | `guide.ts` | Search; topics; an index of buildings (outlined: you have one here). A building page: what it does, recipes, cost, power, size, stores; **Where a loaf comes from**: the chain with the time each link takes; **In your valley now**: every building of this type with its status and rate, *Show ›* to go to it; works with; good to know. |
| Pause and settings | [pause](mockups/pause.html) · [png](screens/pause.webp) | pause screen in `hud.ts` | Resume; the commission's state; level select and restart (with what restarting loses). Settings: interface size, pixel size, sound, reduce motion, **Show pace** (off), **Problems strip · experimental** (off). The markers legend (shape and word). The keys, as rows: the one place keys are printed. |
| Results | [results](mockups/results.html) · [png](screens/results.webp) | results screen in `hud.ts` | Medal and time against the medal lines; the depot receipt; the run as a curve of the goal good with milestones on it and short nights shaded; *What made the difference* (the analysis that play leaves out); the valley left behind; keep playing, next commission, level select. |
| Roadmap: weather station | [roadmap-weather](mockups/roadmap-weather.html) · [png](screens/roadmap-weather.webp) | — | Not part of the revamp; see the roadmap. Shows where the weather station's forecast would live. |

`backdrops/` holds the game captures the mockups sit on (Morning Bread from the bot's layout at day, closer, dusk, far, and
with the power and roads overlays).

## New numbers the game must compute

All read-only, from the simulation, as pure functions in `src/game/` (no DOM). Grouped by the screen that first needs them.

**Two clocks, and watts not energy.** A game day lasts `DAY_SECONDS` = 240 s of play, so an in-game hour is 10 s. Anything
measured over minutes of play (building history, rates a minute, idle shares, the commission clock, results milestones) is in
play time and its axes say "5 min ago … now" or `8:00` of play, never a time of day. Times of day (`dusk 20:00`, `dry at
02:40`, the power panel's 24-hour ring) are in-game hours. Energy over a game day is tiny in real units (a battery holds
2,400 J), so screens show average watts and battery percentages, never Wh or kWh.

- **Play · placement forecast.** For the building in hand at the pointer: its output a minute here, the soil under it now and
  in 10 minutes, whether a sprinkler reaches it and the growth factor that gives. Facts about the tile, no advice.
- **Play · readouts.** Credits a minute (income averaged over the last minute or so).
- **Inspector · History.** Already in `history.ts` (status strip, shares, output against full speed). New: since when the
  current status has held (`egg store empty for 0:14`), made, delivered and in store totals, and *What it waits for*: the
  share of the last 5 minutes spent waiting for each input or short of power, ranked, with a one-line fact for each.
- **Routes.** Loop time of a route; per stop, the observed gap between truck arrivals over the last 10 minutes (not loop
  time over trucks: trucks skip unreachable stops, go home to charge, queue and crawl), with "no truck in 10 min" for a stop
  none reached and nothing for a route without trucks; the route card shows its slowest stop's gap. Idle share per truck over
  the last 10 minutes.
- **Power panel.** Per network: made, used, stored, short. Power by source an hour over the last 24 hours (solar, wind,
  digester, from batteries, short: every generator in `makes()`), and the average watts made and used over it. Use by building, averaged over 24 h and now. Each night's lowest charge and when
  the batteries ran dry. Tonight's charge until sunrise, the time it runs dry and the shortfall in W, from the weather curves
  (the game knows tonight's weather; showing it here is the "now" view, the full forecast is the weather station's).
- **Ledger.** Per good a minute (5-minute average) and in all: made, used by buildings, delivered, in stores and trucks;
  soil health (`soilHealth()`, the number the soil goal checks) with its trend, shown with its two parts: the fields' average
  fertility and the trees' nudge (±10 at most); trees grown and planted; flowering fields reached by hives (each harvest of a
  flowering crop on a reached field gives one more good).
- **Guide.** *Where it comes from*: a product's chain with the time each link takes at full speed (static, from `data.ts`).
  Each hop between buildings is "next door or truck": buildings sharing an edge trade directly, otherwise a route carries it;
  the last hop to the depot is always a truck.
  *In your valley now*: each building of that type, its status and rate.
- **Results.** Milestones recorded during the run (first of each good, first night short, a truck bought, a loop closed, a
  second of a building, the goal reached), the goal good's curve, the depot receipt per good, and *What made the difference*:
  the longest waits, nights short and their cost, truck idle share. A "next time" line is allowed here and only here.
- **Level select.** Each commission's sun, wind and soil against a normal valley, from its seed.

## Requirements the new UI must keep

Gathered from the current UI (`src/ui/*.ts`, `src/main.ts`, `DESIGN.md`) before the redesign. Nothing here may be lost.

1. **Level select** (`menu.ts`): continue the commission in progress (name, time played, or "complete, free play"); the 8
   campaign commissions (number, name, blurb, goals, target time, tags, best medal and time); a random commission (seed,
   difficulty 1–3, live preview of its name and goals, Start); the sandbox; a note that starting replaces the commission in
   progress.
2. **Briefing** (`showIntro`): name, blurb, goals in words, gold and silver times, tags, Start. Shown when `time === 0`. (The
   "first steps" tips move to the guide's First steps topic.)
3. **HUD in play** (`Hud`):
   - Commission: name, clock against target (or "done"), credits (∞ in the sandbox). Medal pace only with *Show pace*.
   - Weather and power: day and hour, sun %, wind %, power made and used (and short when a network is short), stored charge.
   - Controls: pause, 1×, 2×, 4×; turn the view either way; zoom out and in; the menu.
   - Overlays: soil fertility, power, roads, water, bees (V cycles).
   - Panels: Routes (O), Guide (G), Ledger (Tab), Power (W, new).
   - Goals: deliver *n* of a good; reach a rate a minute (with the current rate); soil health at least *n* at the end (with
     the current value). Each with progress and a done state. The sandbox has none.
4. **Build bar**: five categories (Logistics, Farming, Processing, Power, Ecology) and Remove (X). Each building: name, price
   (or free), watts (per truck for the garage), an unaffordable state and an in-hand state; its hotkey in the tooltip. Hovering
   a building shows its guide card.
5. **Hover line and messages**: what is under the pointer; toasts for results (good or refused), at most four, gone after
   about 2.5 s.
6. **Building inspector**: name, one-line hint, status (11 statuses: working, idle, waiting for input, blocked, no route takes
   its goods, no road, no power, low power with the share, not connected, no flowers near, dry), guide link, close. Per type:
   field (crop choice of five, growth, fertility, growth pace with water and soil factors, harvest per cycle, waiting to go,
   compost), hive (flowering fields, progress, honey waiting), silo (stock per good), garage (its trucks with their route and
   state, buy a truck), battery (charge), solar and turbine (watts, shelter), depot (delivered per good, earned). Machines:
   recipe choice, recipe line with time, batch progress, input and output stores. Power use and share, its network's made,
   used and stored. History over 1, 5 or 10 minutes (generators and batteries chart watts or charge). Next door: what it
   takes from and gives to its neighbours. Routes that stop here, and adding it to one. Remove (full refund).
7. **Truck inspector**: name, what it is doing, its problems, route choice (none, a route, or a new one), cargo, battery and
   whether it is crawling, go to its garage, edit its route, dump cargo, sell.
8. **Route editor**: rename, colour, trucks − / +, goods moved a minute, each truck's state, cargo, problems and dump; up to 8
   stops, each with drop and pick-up goods as toggles (silo and depot can show every good), wait 0–60 s, move up or down,
   remove, problems; delete, copy, done. Clicking a building on the map adds a stop.
9. **Routes panel**: count, new route, filter (when more than four), parked-truck warning, and per route: name (rename in
   place), problem count with the list, copy, edit, stops in a few words, goods moved, trucks − / +, goods a minute, what its
   trucks are doing. Pointing at a route draws it on the map.
10. **Ledger** (was Stats): per good made and delivered a minute and in total; soil health.
11. **Guide** (G): the topics (how to play, trucks and routes, power, soil and water, markers), the goods page, and a page per
    building (what it does, how to use it, tips, takes and gives, recipe table, numbers, Build).
12. **Pause**: the keys, pixel size (1×1–4×4) with its explanation, restart (with a confirmation), level select, resume.
13. **Results**: medal, time against target, what the next medal needs, credits earned, soil health; keep playing or go to
    the level select.
14. **Labels in the world**: one per power network while working with power (made, used, battery %, short %), and stop
    numbers over a route's buildings.
15. **Markers**: red no power, orange blocked or low power, yellow waiting, blue dry, purple unreachable or no taker, each
    with a shape.

**Constraints.** Designed at 1920 × 1080 on a landscape desktop; it should hold from about 1366 × 768 to 2560 × 1440, with an
*Interface size* setting (90–130%) that scales the UI and not the world. Mouse and keyboard; every key keeps working. The
world stays readable: panels must not hide the building being worked on. Game rules stay in `src/game/`; the UI reads state
and calls the rules in `build.ts`.

## Settings this adds

Interface size (90–130%), Reduce motion, Show pace (off), Problems strip · experimental (off). Sound appears in the mockup
ahead of there being any.

## How it was chosen

Three rounds, each a design system plus every screen, as private claude.ai artifacts (shareable from their Share menu). They
are history; the files here are the result.

- **Round 1** (rejected: read as a website, a dashboard, old software): Riso Almanac
  ([system](https://claude.ai/artifact/NvDWtHiDetHLUotHRRTXC2), [screens](https://claude.ai/artifact/T58paufEN5DqWuVpqTAdvG)),
  Canopy ([system](https://claude.ai/artifact/73QsvcF1C9psy5uLuPUdAv), [screens](https://claude.ai/artifact/GmkQeYJ6xxUD3M12wsyg35)),
  Switchboard ([system](https://claude.ai/artifact/66SfVrSacJW6NgUoTEZcAp), [screens](https://claude.ai/artifact/RCVGuLS3DV4b1TZgHc89Wi)).
  A textured hand-made draft after it read as a children's game.
- **Round 2**, game UI in the spirit of Frostpunk and Terra Nil, no textures: Ironbloom
  ([system](https://claude.ai/artifact/9WNHgDSL7YCRa7eNPp6TPu), [screens](https://claude.ai/artifact/WeZ2PefdWuMGJse5NXQCpC)),
  Clearday ([screens](https://claude.ai/artifact/RpSYfqvNqVviFVAeh3UgFW)), Glasshouse
  ([system](https://claude.ai/artifact/Ca2HGCozUHkYNXzd852vjQ), [screens](https://claude.ai/artifact/UZQ3vULZ54XMEc1KYP34K9)).
  Clearday chosen.
- **Round 3**: every element of all six went through a pick list ([UI picks](https://claude.ai/artifact/UhiGixGR2mjeAaufDU3sgg));
  the result, Clearday v2 ([screens](https://claude.ai/artifact/QbBAEAEFYKUX1ogDgLbHWu)), went through a second
  ([v2 review](https://claude.ai/artifact/4QpDFTEZyw3cNgakCu8NAr)).
- **Final**: the [Clearday system](https://claude.ai/artifact/7BMUHmCvycXaLDhWD1G8BL) and the
  [final screens](https://claude.ai/artifact/6rDc74E49xbF4P4D8wzdTK), copied into this repo.

Decisions along the way: no textures and nothing childish; dial over day bar; problems on the map, the strip opt-in; view
bar with words over a menu; side card for the inspector, its Losses tab dropped in favour of *What it waits for* under
History; radial power chart; the bakery's lineage in the guide; no key badges outside the pause screen; the build wheel was
not taken (the dock stays).

## Set aside for the roadmap

The weather station (a building), the difficulty fingerprint, the soil map and forecast, the route loop diagram. See
[`ROADMAP.md`](../ROADMAP.md), "Later".

## Cleanup when the revamp is done

- Delete `docs/ui-revamp/` (this folder: screens, backdrops, mockups) and its links in `docs/ROADMAP.md` and `README.md`.
  Move anything still worth keeping (the principles) into `DESIGN.md`.
- Delete `src/ui/style.css` and any old class names left in `src/ui/*.ts`.
- Keep `src/ui/clearday/` and `tools/clearday/`. Update the status line in `src/ui/clearday/README.md`.
- Trim `tools/clearday/icons.py` to the `flat` style (the other styles are exploration leftovers) and drop icons the game
  doesn't use.
- Bundle Manrope instead of loading it from Google Fonts.
