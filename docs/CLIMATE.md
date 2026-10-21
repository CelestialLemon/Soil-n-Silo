# Seasons, weather and ground — design draft

Oct 21, 2026 · @Ashutosh Shinde

The design for seasons, weather and ground types, settled question by question on 2026-10-21. Nothing here is implemented
yet.

**This file is temporary. Delete it once the whole feature is implemented.** Each part, as it ships, writes its rules into
[`DESIGN.md`](DESIGN.md), which stays the one design document; this file is not kept up to date with the game afterwards.

## Glossary

| Term | Means |
| --- | --- |
| **Season** | Spring, summer, autumn or winter. A commission happens in one season, from start to finish; it sets the level's normal conditions (sun, wind, warmth, rain, the river) and which weather events can happen. Replaces the commission's current weather settings (sun hours and strength, wind). |
| **Weather event** | Something that happens during a level, lasts a while and passes: a storm, a heat wave, a flood. Seeded, like the map. |
| **Ground type** | A fixed trait of a grass tile (loam, silt, clay, stony, …) with one or two strong rules of its own. It sits on top of fertility, which still wears and recovers. |
| **Crop profile** | A crop's one or two likes and dislikes (warmth, frost, wet ground, a ground type), shown in the guide and stated as facts on the placement card. |
| **Warmth** | The valley's temperature in °C, one number for the whole valley, rising and falling over each day. Rules key off a few thresholds: frost below 0°C, bees in and tender crops stopped below about 10°C, heat above about 30°C. |
| **Season character** | A random commission's twist on its season ("a wet spring", "a hard winter"): it shifts the season's conditions and the odds of each event. |
| **Conditions** | The everyday weather inside a season: cloudy days, showers, calm spells. Small, constant, unannounced. |
| **Weather station** | A powered building that gives a forecast: sharp for tomorrow, rougher further out, refined as the days come. |
| **Greenhouse** | A field under glass, heated: any crop in any season, for power. |
| **Region** | Not in this feature. A later idea: a different land (mountains, desert) with its own seasons and ground. |

## Why

Without them every level runs on the same conditions, so a good layout, once found, works everywhere: four wheat fields into
a mill, a coop beside it, a bakery taking from both, at rates tuned by play. Seasons and weather change what is normal, so
the layout that worked last time no longer fits, and each level wants one at least partly tailored to its conditions. This
matters most for random commissions, the mode players will mostly play once the campaign is done: they should not grow
repetitive after hundreds of games.

**Climate changes what the best layout is; weather tests how well that layout copes.** A weather event tests the
layout's storage, batteries and slack; it should not ask for quick reactions (the farm runs itself, and pausing is free).
Every rule here must change where or what the player builds, or it is cut.

## Decisions

- **Seasons, not regions, for now** (2026-10-21). One temperate valley with four seasons. Regions come later (a
  mountain land where even summer is cold, winters are hard and the ground is rocky; a desert short of water with barren
  ground), so nothing here should assume there is only one valley.
- **Seasons replace the commission's weather settings** (2026-10-21). One mechanic, not two: sun hours and strength and the
  wind come from the season, and tags like "Short days" or "Strong wind" describe a season instead of being modifiers of
  their own.
- **One season per level** (2026-10-21). The season never changes during a commission.
- **Weather is seeded** (2026-10-21). A commission's weather is the same every time it is played, like its map, so it can
  be learnt, a better medal chased, and the bot can play it.
- **Weather disrupts, never destroys** (2026-10-21). It can slow or stop things and ruin a crop still growing in a field
  (the field starts again). It never destroys buildings, harms animals or touches stored goods. Bad weather costs time,
  and so the medal; there is still no failing.
- **Ground type is a trait on top of fertility** (2026-10-21). Fertility stays the number that wears and recovers.
- **Crops have short profiles** (2026-10-21), not a table of multipliers by crop, season and ground. Screens state the
  result as a fact ("Tomato, clay, spring: grows slowly"), never advice.
- **Ground types are designed now, shipped later** (2026-10-21). Both are designed together so they fit, but seasons and
  weather ship first and ground types are a feature of their own after them; a season rule that needs a ground type waits.
- **A season moves five things** (2026-10-21): the sun (hours, strength), the wind (mean, gusts), warmth (crop growth by
  profile, frost), rain (fields count as watered while it rains) and the river (level and current: wheel power, floods),
  and decides which events can happen. Warmth reaches the animals too: hens lay slower in the cold, bees stay in below a
  warmth. Machines are indoors and don't care.
- **Each season favours a different power source** (2026-10-21): wheels in spring, solar in summer, wind in autumn and
  winter, so the last level's power layout doesn't carry over. The first sketch, numbers to tune with the bot:

  | | Spring | Summer | Autumn | Winter |
  | --- | --- | --- | --- | --- |
  | Sun | 6–19, a little weaker | 5–21, strong | 7–18, weaker | 8–16, weak |
  | Wind | moderate, gusty | light, calm spells | strong | strong, steady |
  | Warmth | cool, late frosts | hot | mild, then cooling | cold, frosts |
  | Rain | often | rare, dry spells | some | snow (doesn't water fields) |
  | River | high and fast; floods | low and slow | rising | may freeze (wheels stop) |
  | Crops that do well | wheat, beans, flax | tomato, sunflower | wheat, beans | hardy crops, slowly |

- **Winter: hardy crops only outdoors, and a greenhouse** (2026-10-21). Frost-tender crops can't grow in open fields in
  winter; a heated greenhouse grows any crop in any season for power, most of it at night, so winter presses power hardest
  when the sun is weakest. Winter commissions don't start with stock: a level where the raw goods are already gathered and
  only processing is left is worth a playtest some day, but not now.
- **Random commissions roll a season and a character** (2026-10-21), named in the briefing ("A wet spring"). They replace
  the weather modifiers (Short days, Weak sun with Strong wind, Still air); the ground modifiers (Poor soil, Rocky, Wooded,
  Hilly, Flat) stay.
- **Two layers of weather** (2026-10-21): conditions (always, small, unannounced, like today's wind curve) and events (one
  to three a level by difficulty, named, half a day to two days each, about 2–8 minutes of play, then passing).
- **A weather station sells the forecast** (2026-10-21). The forecast isn't free: a powered building gives it, sharp for
  tomorrow and rougher further out, refined as the days come, for events and conditions both, like a real forecast. Once one
  is built, the forecast is a HUD panel like the Power panel, so you needn't click the building. This may change after
  playtesting.
- **Every event has an answer you can build ahead** (2026-10-21), mostly from what the game already has (batteries, a
  digester, silos, sprinklers, trees); a new building only where nothing fits. None is required: preparing saves time.
- **Target times follow the season** (2026-10-21), so every season and character can earn gold: the bot plays the real
  weather for the campaign; the random formula gets a season-and-character factor tuned by the bot.
- **Without a station you see only now** (2026-10-21): the briefing's season, character and the events it can bring; the
  weather now on a chip by the dial; an event in the sky only once it starts. No warning, no length.
- **The forecast is honest ranges** (2026-10-21): it gives a range ("a gale, likely day 6, 10:00–22:00") and what happens
  always falls inside it; far ranges are wide and narrow as the day comes. It is never plainly wrong, so a careful player
  never loses time to luck the forecast hid.
- **The station sees three days** (2026-10-21), 12 minutes of play, updated every game hour: tomorrow sharp (events within
  a couple of hours; sun, wind and rain within a small margin), day two rough (events within about half a day), day three
  only what is likely ("a storm, possible").
- **Station rules** (2026-10-21): 1 × 1, about 80 credits, 3 W. One is enough; a second adds nothing. Unpowered, the panel
  keeps the last forecast, marked out of date, and stops narrowing. Where it stands doesn't matter.
- **The first events** (2026-10-21), to tune in play. Each has one or two strong effects and an answer you can build:

  | Event | Season | Length | Does | Answer you can build |
  | --- | --- | --- | --- | --- |
  | Thunderstorm | spring, summer | ½ day | Heavy rain (fields watered), little sun, gusts | batteries, wheel, digester |
  | Flood | spring (any heavy rain) | 1–2 days | The river spreads over the low floodplain beside it: flooded fields lose their growing crop, buildings there stop, trucks can't drive through water. Drained ground gains a little fertility (silt), never as much as the flood cost | build higher; raise a bank with earthworks |
  | Late frost | spring | 1 night | On a clear, calm night frost settles on the lowest ground round each spot (hollows, the valley floor, relative to what's round them); tomato and sunflower growing there lose their crop; slopes stay clear. Severe (a windy cold night): slopes freeze too | tender crops on slopes, greenhouse |
  | Heat wave | summer | 1–2 days | Unwatered fields nearly stop; hens lay slower | sprinklers, fields on the water, trees by the coop |
  | Dust storm | summer, drought character only | ½–1 day | Solar to about a third; trucks slow; unsheltered fields lose some fertility to the wind | trees as windbreaks, batteries |
  | Gale | autumn | 1 day | Ordinary: strong wind, turbines at full power, bees stay in. Severe: wind above the turbines' limit, so exposed turbines stop; sheltered ones keep turning at reduced, unsteady output | a power mix; turbines with some shelter |
  | Tropical storm | late summer, autumn (rare) | 1–2 days | The rain storm: days of heavy rain and wind, and a flood a day later as the river rises | all of the above |
  | Fog | autumn | a morning | Solar weak, trucks at half speed | batteries, shorter routes |
  | Blizzard | winter, hard character only | 1–2 days | No sun, trucks slowed by snow, snow on panels after it until it melts | batteries, digester, garages near their routes |
  | Cold snap | winter | 1–2 days | The river freezes at its quiet stretches: wheels there stop, wheels beside a fall keep turning. Greenhouses need twice the heat, hens slow | wheels at a fall, power that isn't the river |

  Two old rules get a second purpose: shelter now helps turbines in a gale, and earthworks raise a bank against a flood.
  The flood's silt is why the floodplain is rich: good land because it floods. (Checked against a real-world brief from Sol
  on 2026-10-21: a flood's reach follows height, not distance; silt helps only a little and only over many floods; frost
  pools a few metres down, more than our whole map's 4 m, so it is judged relative to the ground round it; a gale alone
  rarely stops a small turbine; rivers freeze at the margins first, and falls keep running.)
- **Good events too** (2026-10-21), so the forecast isn't only threats; they count towards the one to three a level. Warm
  spell (autumn, winter: crops grow at a mild season's pace, bees fly, greenhouses need less heat); soft rain (spring,
  autumn: a day of gentle rain watering every field, no flood); steady breeze (summer: wind in the calm season).
- **Crop profiles** (2026-10-21):

  | Crop | Likes | Dislikes | Winter outdoors |
  | --- | --- | --- | --- |
  | Wheat | cool (spring, autumn) | heat (slower in summer) | yes, slowly |
  | Beans | mild | — (the easy crop) | yes, slowly |
  | Tomato | warmth (summer) | frost (crop lost) | no |
  | Sunflower | sun and heat; copes when dry | frost (crop lost) | no |
  | Flax | cool and wet (spring) | heat, dry spells | yes, slowly |

  So oil and sauce need greenhouses in winter, and summer is hard on wheat and flax, easy on tomato and sunflower.
- **Hens and bees by season** (2026-10-21). Hens lay at full rate in spring and summer (heat waves aside), slower in autumn,
  about half in winter. Bees stay in below a warmth: not in winter except on a warm spell, but a hive within reach of a
  greenhouse growing a flowering crop works all winter, foraging inside it as growers' bumblebees do.
- **The greenhouse** (2026-10-21): a field under glass, 3 × 3, any of the five crops, about 150 credits. Always warm inside;
  frost, gales, dust and heat waves don't reach it. Rain doesn't either, so it needs a sprinkler or a water edge like a field.
  Heating draws power by season and hour: none in summer, a little on spring and autumn nights, a lot in winter (most at
  night), double in a cold snap. Unpowered it goes cold and tender crops in it stop growing (they don't die). Its soil wears
  and takes compost like a field's.

- **The hurricane** (2026-10-21): the severe tropical storm, the rare wind storm. Only late in summer or in autumn, at most
  once a level, only in a stormy character at difficulty 3. Every turbine stops, sheltered or not; solar is nearly nothing; a
  flood is certain and reaches a level higher; trucks stay in their garages through the worst hours; hens and bees stop.
  Nothing breaks. No calm eye: that needs a cyclone's centre to pass right over, which is not the inland case.
- **Events come in two strengths** (2026-10-21), ordinary and severe, rather than more names; severe ones only at higher
  difficulty or in a harsh character. The hurricane is the severe tropical storm, named because players will remember it.
- **Campaign events are authored** (2026-10-21): placed by hand ("a gale on day 4, from 10:00"), so each commission teaches
  what it means to; random commissions roll theirs from the seed. A first assignment, not important yet and open to change:

  | # | Commission | Season | Events | Teaches |
  | --- | --- | --- | --- | --- |
  | 1 | First Light | mild spring | a soft rain | seasons exist; rain waters fields |
  | 2 | Morning Bread | wet spring | a thunderstorm | a dark, rainy spell for power |
  | 3 | Windy Ridge | autumn, gales | a gale | shelter for turbines |
  | 4 | Linen for the Looms | hot summer | a heat wave | crop profiles: flax dislikes heat |
  | 5 | Long Nights | winter | a cold snap, a warm spell | the greenhouse, with bees inside it |
  | 6 | Tired Soil | dry summer | a dust storm | trees as windbreaks guard the soil |
  | 7 | Riverlands | spring, high river | a flood | the floodplain, banks, silt |
  | 8 | Harvest Festival | stormy autumn | a tropical storm, a fog | everything; the station matters |

  Late frost, the blizzard and the hurricane stay out of the campaign, left for random commissions.
- **Ground follows the land** (2026-10-21), in large patches that hold several fields, not a speckle: silt by the river,
  wet ground in hollows, thin stony ground on hilltops and ridges. Rocks to clear sit mostly on stony ground.
- **Ground is seen** (2026-10-21): each type has its own look on the ground, the view bar gets a Ground view, a field's
  placement card lists its ground ("6 silt, 3 clay"), and each tile counts on its own, like fertility.
- **Ground is fixed** (2026-10-21): no turning sand to loam, no clearing stones. Fertility is the part that changes.
  Revisit after playtesting.
- **A ground type touches crops and at most one other thing** (2026-10-21), where it meets the weather (clay to mud in rain,
  sand drying fast, silt flooding).
- **Weather reads in the world** (2026-10-21): rain, lying snow, fog, dust haze and flood water are drawn. A building weather
  stops or slows gets a marker of its own shape, its card says why ("Turbine: stopped, gale") and its history ribbon keeps
  it, so the layout's problems and the weather's can be told apart. The results screen says what each event cost in time.

- **Five ground types** (2026-10-21). Peat was left out: real wet peat is marsh, not cropland, so it would only be a field
  nobody wants; wet hollows are clay instead. Marsh may come back with a region.

  | Ground | Where | Its trait for crops | Its one other rule |
  | --- | --- | --- | --- |
  | Loam | terraces, gentle slopes, the foot of slopes | balanced: the baseline | none |
  | Silt | the floodplain along the river | rich: the highest starting fertility | it is the ground that floods |
  | Clay | low basins, old river channels, wet hollows | holds water (watered for a day after rain, half watered in a heat wave); cold (slow in spring) | mud: trucks slow on it while it rains and for a while after; frozen clay in winter is firm |
  | Sand | river bars, raised banks, old terraces | warms early (quick in spring); drains (watered only while it rains); poor fertility | firm: trucks never get muddy on it |
  | Stony | hilltops, ridges, eroded slopes | thin: fertility can't rise above about 50, even with compost, and yields are lower | where rocks lie |

  Each changes a decision: clay saves sprinklers in summer but slows spring and muddies routes; sand gives a quick spring
  and wants water; silt is the best land and the land that floods; stony ground suits buildings and turbines, not fields.
- **Ground in the crop profiles** (2026-10-21), at most one like or dislike each: wheat likes clay; beans like clay and are
  poor on sand and stony; tomato dislikes clay (cold, wet roots); sunflower copes on sand and stony (deep roots); flax is
  poor on sand and stony.
- **Season, then ground, then fertility** (2026-10-21). The season decides what is possible (no tomatoes outdoors in
  winter); ground shifts growth by about a quarter either way; fertility still says how good a given field is. Ground
  shapes where each crop goes without ruling any out. Numbers from the bot.
- **Ground sets starting fertility** (2026-10-21), replacing the "richer near water, poorer uphill" rule: each type has a
  range (silt high, loam and clay middle, sand and stony low), with the local noise on top. One mechanic, not two.
- **The mix follows the commission** (2026-10-21). A default valley is about half loam, silt along the river, a few clay
  hollows, sand on the river's bends and stony high ground. Rocky means more stony ground with its rocks; Poor soil more
  sand and stony; Hilly brings more stony ground by itself; ponds or a lake without a river mean little silt and more clay
  round the water. Regions will bring mixes of their own.
- **Ground meets the weather without new rules** (2026-10-21), by where each lies and its trait: floods reach silt first,
  dust storms blow sand worst, late frost settles in clay hollows, heat waves spare clay fields longest.

- **Sprinklers rest in rain** (2026-10-21): while it rains fields are watered anyway, so sprinklers switch off and draw no
  power. A wet spring frees power; a dry summer needs every watt for water.
- **Machines really don't care** (2026-10-21), the digester and batteries included, though real ones suffer in the cold:
  winter already presses power through weak sun, greenhouses and the frozen river, and a fourth cold effect would make it a
  pile of penalties instead of a different puzzle.
- **Erosion is unchanged** (2026-10-21). Rain washing soil downhill stays its own roadmap item; slopes already cost soil per
  harvest and the dust storm adds weather's share.
- **How random commissions choose events** (2026-10-21), from those the season and character allow:

  | Difficulty | Bad events | Good events |
  | --- | --- | --- |
  | 1 | 1, ordinary | 1 |
  | 2 | 2, ordinary | 1 |
  | 3 | 2, one may be severe; the hurricane possible in a stormy character | 0–1 |

  None on day 1, so the farm can get going; none overlap, but a flood follows its storm; at least half a day clear between.
- **Any goal in any season** (2026-10-21). Greenhouses make everything possible all year, so a winter commission can ask for
  tomato sauce: hard but fair, and the season factor on the target pays for it.
- **The sandbox** (2026-10-21) gets a season picker and a weather control that starts any event, either strength, at will,
  for trying a layout against a storm. The station forecasts as usual.
- **Where the season shows** (2026-10-21): the level select's cards (season and character); the briefing letter, in the
  writer's voice ("the river's high this spring…"), with the events the season can bring; a HUD chip by the dial with the
  season and the weather now; the guide, a page for each season and event (facts, no advice), and "Seasons and weather" in
  the basics ("Ground" later).
- **The valley looks like its season** (2026-10-21): spring fresh green with apple blossom; summer grass golden on dry
  ground; autumn leaves orange and gold, birch and poplar thinning; winter bare broadleaves among dark pines, frost-pale
  grass, snow lying only during and after snow and blizzards. Seasonal tree models and grass colours: asset and renderer
  work, but the season should read at a glance.
- **The order it ships in** (2026-10-21), roughly, for the issues: (1) seasons: the levers, crop profiles, hens and bees,
  sprinklers in rain, replacing the weather settings, the HUD chip, the briefing, the look; (2) events: the list, two
  strengths, the weather marker, history and results, authored campaign events and random rolls; (3) the weather station
  and forecast; (4) the greenhouse; (5) ground types. Each is built straight after the one before, so the states in between
  need no support of their own: winter may be unplayable until the greenhouse lands, and that is fine.

- **Warmth is a temperature in °C** (2026-10-21), not bands: everyone knows what 2°C or 30°C feels like, and a number is a
  fact. The rules key off a few thresholds: below 0°C frost (tender crops lose their growing crop); below about 10°C bees
  stay in and tender crops stop growing; above about 30°C heat (unwatered fields nearly stop, hens slow). A °F option may go
  in Settings.
- **Warmth follows the day** (2026-10-21): coldest before dawn, warmest mid-afternoon. The season sets the range (a spring
  day perhaps 4–16°C, a summer day 16–30°C), conditions nudge it, events push it (a heat wave lifts the curve, a cold snap
  drops it). Crops grow by the warmth of each moment, so a cold night costs a little and a warm afternoon makes it up.
- **One temperature for the valley** (2026-10-21), not one per tile. The only place-dependent part is frost, which settles on
  the lowest ground round each spot on clear, calm nights and is drawn there: white rime on low ground at dawn, melting
  through the morning.
- **Where warmth shows** (2026-10-21): the temperature now on the HUD chip by the dial; each day's high and low in the
  station's forecast, as honest ranges ("low −1 to 3°C"); the effect as a fact in a field's inspector, placement and hover
  cards ("Tomato, 12°C: cool for it, grows at about half speed"); inside against outside, and the heating watts, in a
  greenhouse's inspector; greenhouse heating as its own line in the Power panel. Without a station, only the temperature
  now.
- **Crops have a comfortable range** (2026-10-21), where they grow at full speed; slower outside it, and frost-tender crops
  die below 0°C. This is what "likes cool" and "needs warmth" mean. The guide shows each range; the inspector says where
  today falls in it. To tune with the bot:

  | Crop | Comfortable | Notes |
  | --- | --- | --- |
  | Wheat | 10–24°C | hardy |
  | Beans | 8–24°C | hardy |
  | Flax | 10–22°C | hardy |
  | Tomato | 18–30°C | frost-tender |
  | Sunflower | 18–32°C | frost-tender |

## Open

Nothing for now: the design is ready to be broken into issues. Numbers throughout are first sketches to tune with the bot.
