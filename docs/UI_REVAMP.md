# Soil n Silo — UI revamp: requirements and three directions

Oct 13, 2026

The HUD and menus in `src/ui/` were built for the proof of concept. This document lists what the UI has to do today
(gathered from `src/ui/*.ts`, `src/main.ts` and `DESIGN.md`), then points to three complete design directions, each a
design system plus every screen at 1920 × 1080, and a matrix for mixing parts of one into another.

## The designs

| Direction | Design system | Screens (9 artboards) |
| --- | --- | --- |
| **Riso Almanac**: a printed farm almanac. Paper sheets over the valley, four risograph inks, halftones, stamps, pip rows. Playful, tactile, contextual. | [Riso Almanac system](https://claude.ai/artifact/NvDWtHiDetHLUotHRRTXC2) | [Riso Almanac screens](https://claude.ai/artifact/T58paufEN5DqWuVpqTAdvG) |
| **Canopy**: dark leaf-tinted glass with leaf-shaped corners, one warm sun accent, rings and dials. Calm, world-first, panels grow out of what they describe. | [Canopy system](https://claude.ai/artifact/73QsvcF1C9psy5uLuPUdAv) | [Canopy screens](https://claude.ai/artifact/GmkQeYJ6xxUD3M12wsyg35) |
| **Switchboard**: the co-op's control room. Enamel panels, signal lamps with codes, label tape, mono readouts; day and night shift themes. Docked, dense, every number visible. | [Switchboard system](https://claude.ai/artifact/66SfVrSacJW6NgUoTEZcAp) | [Switchboard screens](https://claude.ai/artifact/RCVGuLS3DV4b1TZgHc89Wi) |

Each system holds its tokens (`tokens.json`, compiled `tokens.css`), a brand book (`README.md`), and its components as
plain CSS classes in `components/bundle.css` with a live preview and guidelines per component. No framework: the classes
are meant to be applied by the game's `h()` helper. Each screen canvas has the system installed, so its artboards are
built from those same classes. The world behind every mockup is a real 1920 × 1080 capture of the game (the bot's
Morning Bread layout, `npm run sim -- c2:next`, on the real map), at day, dusk and with the power and roads overlays.

The artifacts are private until shared from their Share menu.

## Requirements gathered from the current UI

### Screens

1. **Level select** (`menu.ts`): continue the commission in progress (name, time played, or "complete, free play");
   the 8 campaign commissions (number, name, blurb, goals, target time, tags, best medal and time); a random commission
   (seed, difficulty 1–3, live preview of its name and goals, Start); the sandbox; a note that starting replaces the
   commission in progress.
2. **Briefing** (`showIntro`): name, blurb, goals in words, gold and silver times, tags, "first steps" tips (or the
   general help when a commission has none), Start. Shown when `time === 0`.
3. **HUD in play** (`Hud`):
   - Commission: name, clock against target (or "done"), medal pace (gold/silver/bronze), credits (∞ in the sandbox).
   - Weather and power: day and hour, sun %, wind %, power made and used (and "short (n%)" when a network is short),
     stored battery charge across all networks.
   - Controls: pause, 1×, 2×, 4×; turn the view either way; zoom out and in; the menu.
   - Overlays: soil fertility, power, roads, water, bees (V cycles).
   - Panels: Routes (O), Guide (G), Stats (Tab).
   - Goals: deliver *n* of a good; reach a rate per minute (with the current rate); soil health at least *n* at the end
     (with the current value). Each with progress and a done state. The sandbox has none.
4. **Build bar**: five categories (Logistics, Farming, Processing, Power, Ecology) and Remove (X). Each building: name,
   price (or free), watts (per truck for the garage), hotkey (F, L, T, P, S), an unaffordable state and an in-hand
   state. Hovering a building shows its guide card in place of the hover line.
5. **Hover line and messages**: a one-line status of what is under the pointer; toasts for results (good or refused),
   at most four, gone after about 2.5 s.
6. **Building inspector**: name, one-line hint, status (11 statuses: working, idle, waiting for input, blocked, no
   route takes its goods, no road, no power, low power with the share, not connected, no flowers near, dry), guide link,
   close. Per type: field (crop choice of five, growth, fertility, growth pace with water and soil factors, harvest per
   cycle, waiting to go, compost), hive (flowering fields, progress, honey waiting), silo (stock per good), garage (its
   trucks with their route and state, buy a truck), battery (charge), solar and turbine (watts, shelter), depot
   (delivered per good, earned). Machines: recipe choice, recipe line with time, batch progress, input and output
   buffers. Power use and share, its network's made/used/stored. History over 1, 5 or 10 minutes: a status strip with a
   pointer readout, the share of time per status, goods made a minute against full speed; generators and batteries
   chart watts or charge instead. Next door: what it takes from and gives to its neighbours. Routes that stop here, and
   adding it to one. Remove (full refund).
7. **Truck inspector**: name, what it is doing, its problems, route choice (none, a route, or a new one), cargo,
   battery and whether it is crawling, go to its garage, edit its route, dump cargo, sell.
8. **Route editor**: rename, colour, trucks − / +, goods moved a minute, each truck's state, cargo, problems and dump;
   up to 8 stops, each with drop and pick-up goods as toggles (silo and depot can show every good), wait 0–60 s, move
   up or down, remove, problems; delete, copy, done. Clicking a building on the map adds a stop.
9. **Routes panel**: count, new route, filter (when more than four), parked-truck warning, and per route: name
   (rename in place), problem count with the list, copy, edit, stops in a few words, goods moved, trucks − / +, goods a
   minute, what its trucks are doing. Pointing at a route draws it on the map.
10. **Stats** (Tab): per good made and delivered a minute and in total; soil health.
11. **Guide** (G): five topics (how to play, trucks and routes, power, soil and water, markers), the goods page, and a
    page per building (what it does, how to use it, tips, takes and gives, recipe table, numbers, Build).
12. **Pause**: the help list, pixel size (1×1–4×4) with its explanation, restart (with a confirmation), level select,
    resume.
13. **Results**: medal, time against target, what the next medal needs, credits earned, soil health; keep playing or
    go to the level select.
14. **Labels in the world**: one per power network (made, used, battery %, short %), and stop numbers over a route's
    buildings.
15. **Markers legend**: red no power, orange blocked or low power, yellow waiting, blue dry, purple unreachable or no
    taker.

### Constraints

- **Display**: designed at 1920 × 1080 on a landscape desktop. It should hold from about 1366 × 768 to 2560 × 1440;
  every direction proposes an *Interface size* setting (90–130%) that scales the UI and not the world. Square, portrait
  and phone viewports are out of scope.
- **Input**: mouse and keyboard; every panel and tool keeps its hotkey and shows it.
- **The world stays readable**: the game is a pixel-art world; panels must not hide the building being worked on.
- **Status never by colour alone**: each direction pairs the marker colours with a second cue (Riso: hatches; Canopy:
  shapes; Switchboard: lamp codes).
- **Architecture**: game rules stay in `src/game/` with no DOM; the UI reads state and calls the rules in
  `build.ts`. Several proposals need new read-only numbers from the simulation (below).

## Mix and match

Every row is independent: a layout, a visualisation or a flow from one column can be built in another column's look.
Screen numbers refer to the artboards (1 menu, 2 briefing, 3 play, 4 inspector, 5 routes, 6 production, 7 guide,
8 pause, 9 results).

| Facet | Riso Almanac | Canopy | Switchboard |
| --- | --- | --- | --- |
| Look | Paper sheets, square, ink border, pink misregistered offset; halftone fills | Dark frosted glass, leaf corners, one sun accent, soft glow | Enamel panels, bevelled keys, recessed wells, label tape; day and night themes |
| Type | Bagel Fat One + Recursive (mono axis for numbers) | Unbounded + Figtree | Barlow Condensed + Barlow + IBM Plex Mono |
| Level select (1) | A trail map across the valley; the chosen stop's flyer on the left | Full-bleed world at dusk, carousel of cards, the focused one's story large | A sortable table with a work card: minimap and conditions as gauges against a normal valley |
| Briefing (2) | A letter with the production chain drawn as a diagram and a checklist | Goal rings, a sky dial for the day, a four-step "first hour" stepper | A work order with a **bill of materials**: rates needed, buildings to build, power and night budget |
| HUD layout (3) | Paper placed where it is needed: ticket, day strip, toolbar | Edge-hugging: commission pill and goal rings, sky dial, dock | A fixed console: instrument strip, left dock, right dock, bottom keypad |
| Goal progress | Pip rows, ten goods a pip | Ring gauges | Counters in wells, rate and ETA |
| Day, sun, wind, power | A printed band from midnight to midnight with a "now" pin; meters | A 24-hour dial with the hand, power as an inner ring, battery chip | A timeline well and a power gauge with a "used" needle |
| Build flow | **Radial wheel at the pointer** (hold B) plus a tray of six recent buildings | **Hotbar dock**, number keys 1–9 within a category; speed moves to `[` `]` | **Keypad panel** always open, category switch on its left |
| Placement feedback | Build card in the wheel hub | Ghost with a "fits · soil · sprinklers" chip and a build card | Ghost with a tape label and the recipe in the ticker |
| Problems | Markers and the hover line | Shape-coded status pills | **Alert log** in the left dock with Go-to keys and acknowledge |
| Inspector (4) | An index card pinned beside the building with a leader line; index tabs | A callout grown out of the building with a tail | Always in the right dock; tables; folds to a rail |
| Recipe and buffers | Goods strip and buffer boxes | Recipe as rings (inputs, batch timer, output) | I/O table with gauges |
| History | Punch strip of hatched 5 s boxes, pointer readout, shares | Rounded status ribbon, output line chart, share donut | Heat strip of cells, share table, output gauge against full speed |
| Next door | Dashed yellow outlines on neighbours with "gives flour" tags | Glowing outlines with good chips | Tape labels on the map, a row in the inspector |
| Routes overview (5) | Tickets in a left drawer | Drawn on the map in colour; slim right drawer with sparklines | Full-screen **line diagram** like a transit map, trucks and queues on it |
| Route editor (5) | Tracing-paper mode: numbered stickers on the map, vertical timetable | Loop timeline along the bottom, stops left to right | A table: stops as rows, goods as toggle columns |
| Production (6) | Ledger spread: halftone bars, ranked hold-ups, power area chart | **Sankey of goods** from fields to depot, with leaks and pile-ups | Full report: goods table with sparklines, utilisation heat strip, power, fields' soil |
| Guide (7) | Almanac with chapter tabs on the edge, a plate per building | Tile grid index, page with recipe as rings | Datasheet: schematic, spec table, procedure, **interlocks** (what stops it) |
| Pause (8) | Field notes: keys and marker legend; settings | **Keyboard map** of every bound key; settings | Key table, lamp legend; settings incl. dock layout and "follow the sun" theme |
| Results (9) | Certificate with a slammed medal stamp and a depot receipt | Glowing medal ringed by time; bread delivered over the run | Report: plaque, ledger, **incident log** of first problems and their fixes |
| Status cue | Hatch per status | Shape per status | Lamp with a code (OK, IN, OUT, LOW, PWR, DRY, ROAD) |
| Motion | Sheets slide from their edge; stamps slam; hover swaps the offset to pink | Panels spring out of their anchor; rings fill; dock magnifies | Keys latch in 90 ms; alarm lamps blink until acknowledged; docks slide |

### Proposals that change behaviour

These appear in the designs and need a decision before they are built:

- **Keys**: Riso adds B (hold) for the build wheel. Canopy uses 1–9 for dock slots and moves speed to `[` and `]`.
  Switchboard uses `[` and `]` to fold the docks and A to acknowledge an alert.
- **Settings**: Interface size (all three); sheet motion or glass clarity (Riso, Canopy); night theme following the sun,
  dock layout and steady alarm lamps (Switchboard).
- **New read-only numbers from the simulation** (pure functions in `src/game/`, no DOM): a route's loop length and time;
  goods a minute per route over time (sparklines); an estimated finish time at the current rate; a ranked list of
  hold-ups (piling outputs, waiting inputs, night power deficit); power made and used across the last day; a flow of
  goods between buildings a minute (Sankey); a building utilisation history for all buildings (the per-building history
  exists already); the first-problem and fix log; the bill of materials for a plan rate.
