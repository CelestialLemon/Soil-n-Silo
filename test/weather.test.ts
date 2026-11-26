// The continuous weather (Milestone 4): a deterministic, endless timeline of spells per (season, character, weather seed),
// easing from one into the next, with a truthful forecast and the old fixed-weather tests still honoured.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  absHour, blankState, CLIMATE_DESCRIPTIONS, climateFor, climatesOf, defaultWeatherSeed, describeClimate, describeWeather,
  FLOOD_DEEP, FLOOD_MAX, forecastDay, forecastDays, generateValley, isClimate, liveEnv, rollWeatherSeed, type Season, skyAt, spellTimeline,
  stepSim, stepWeather, toSpell, type WeatherKey, type WeatherSpell, WEATHER_SPELLS, weatherKeyOf,
} from '../src/game/index.ts';
import { groundKey } from '../src/world/weatherKeys.ts';
import { same } from './helpers.ts';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

test('the weather seed is the valley seed\'s own by default, and changing it leaves the land as it was', () => {
  const a = generateValley(1042, 'spring'), b = generateValley(1042, 'spring', { weatherSeed: 5, climate: 'wet' });
  assert.equal(a.weatherSeed, defaultWeatherSeed(1042) >>> 0);
  assert.notEqual(a.weatherSeed, 1042, 'its own seed, not the land\'s');
  assert.equal(a.climate, 'mild');
  assert.deepEqual([b.weatherSeed, b.climate], [5, 'wet']);
  assert.ok(same(a.grid.height, b.grid.height), 'the same land');
  assert.ok(same(a.grid.baseWaterLevel, b.grid.baseWaterLevel), 'the same brook');
  const spells = (key: WeatherKey) => spellTimeline(key.season, key.climate, key.weatherSeed, 24 * 10).map((x) => x.spell).join();
  assert.notEqual(spells(weatherKeyOf(a)), spells({ ...weatherKeyOf(a), weatherSeed: 6 }), 'another seed, other weather');
  const r = rollWeatherSeed();
  assert.ok(Number.isInteger(r) && r >= 0 && r <= 0xffffffff);
});

test('the timeline is the same every time for one key, endless, and its spells last 6 to 16 hours', () => {
  for (const season of SEASONS) for (const climate of climatesOf(season)) {
    const once = spellTimeline(season, climate, 77, 24 * 30).map((x) => ({ ...x }));
    // Read far past the first read: the spans already read stay as they were.
    const later = spellTimeline(season, climate, 77, 24 * 60);
    assert.deepEqual(later.slice(0, once.length), once, `${season} ${climate}: deterministic`);
    assert.ok(later[later.length - 1].end > 24 * 60);
    assert.ok(['clear', 'scattered'].includes(later[0].spell), 'a gentle first morning');
    assert.ok(later[0].end >= 14 && later[0].end <= 19);
    for (let k = 1; k < later.length; k++) {
      const sp = later[k];
      assert.equal(sp.start, later[k - 1].end, 'spells follow on without a gap');
      assert.ok(sp.end - sp.start >= 6 && sp.end - sp.start <= 16, `${sp.spell}: ${(sp.end - sp.start).toFixed(1)} h`);
    }
    // The pure sky reads the same for the same hour, however it was reached.
    const key = { season, climate, weatherSeed: 77 };
    assert.deepEqual(skyAt(key, 200.25), skyAt(key, 200.25));
  }
});

test('all four seasons have their characters, words and spells', () => {
  assert.deepEqual(CLIMATE_DESCRIPTIONS, {
    spring: { mild: 'A mild spring', wet: 'A wet spring', highRiver: 'Spring spate', stormy: 'A stormy spring' },
    summer: { mild: 'A warm summer', dry: 'A dry summer', hot: 'A hot summer', stormy: 'Summer storms' },
    autumn: { mild: 'A crisp autumn', gales: 'Autumn, gales', wet: 'A wet autumn', stormy: 'Autumn squalls' },
    winter: { mild: 'A mild winter', hard: 'A hard winter', gales: 'Winter gales', wet: 'A snowy winter' },
  });
  assert.equal(describeClimate('winter', 'hard'), 'A hard winter');
  assert.ok(!isClimate('balmy') && isClimate('highRiver'));
  for (const season of SEASONS) assert.ok(climatesOf(season).includes(climateFor(1042, season)));
  const seen = (season: Season) => {
    const out = new Set<WeatherSpell>();
    for (const climate of climatesOf(season)) for (const seed of [1, 2, 3]) for (const sp of spellTimeline(season, climate, seed, 24 * 40)) out.add(sp.spell);
    return out;
  };
  const spring = seen('spring'), summer = seen('summer'), autumn = seen('autumn'), winter = seen('winter');
  for (const sp of ['clear', 'scattered', 'soft-rain', 'storm', 'frost'] as const) assert.ok(spring.has(sp), `spring: ${sp}`);
  for (const sp of ['clear', 'heat-wave', 'storm'] as const) assert.ok(summer.has(sp), `summer: ${sp}`);
  for (const sp of ['fog', 'gale', 'soft-rain', 'frost'] as const) assert.ok(autumn.has(sp), `autumn: ${sp}`);
  for (const sp of ['snow', 'blizzard', 'frost'] as const) assert.ok(winter.has(sp), `winter: ${sp}`);
  assert.ok(!summer.has('snow') && !summer.has('frost') && !spring.has('blizzard') && !winter.has('heat-wave'), 'out-of-season spells never come');
  assert.ok([...spring, ...summer, ...autumn, ...winter].every((sp) => (WEATHER_SPELLS as readonly string[]).includes(sp)));
});

test('winter freezes, summer warms, and the afternoons are warmer than the small hours', () => {
  const mean = (season: Season, climate: WeatherKey['climate'], hour?: number) => {
    let sum = 0, n = 0;
    for (let d = 0; d < 20; d++) for (let h = 0; h < 24; h += 0.5) {
      if (hour !== undefined && h !== hour) continue;
      sum += skyAt({ season, climate, weatherSeed: 9 }, d * 24 + h).tempC; n++;
    }
    return sum / n;
  };
  assert.ok(mean('winter', 'hard') < mean('winter', 'mild'));
  assert.ok(mean('winter', 'mild') < 2 && mean('winter', 'hard') < -2);
  assert.ok(mean('summer', 'hot') > 22 && mean('summer', 'mild') > mean('spring', 'mild'));
  assert.ok(mean('spring', 'mild', 15) - mean('spring', 'mild', 3) > 6, 'a daily swing');
});

test('spells ease into each other without a jump', () => {
  for (const [season, climate] of [['summer', 'stormy'], ['winter', 'gales'], ['spring', 'highRiver']] as const) {
    const key = { season, climate, weatherSeed: 31 };
    let prev = skyAt(key, 0);
    for (let t = 0.05; t < 24 * 12; t += 0.05) {
      const sky = skyAt(key, t);
      assert.ok(Math.abs(sky.tempC - prev.tempC) < 1, `${season} ${climate} at ${t.toFixed(2)} h: ${prev.tempC} → ${sky.tempC}°C`);
      assert.ok(Math.abs(sky.cloudCover - prev.cloudCover) < 0.06, `cloud at ${t.toFixed(2)} h`);
      assert.ok(Math.abs(sky.rain - prev.rain) < 0.1 && Math.abs(sky.snow - prev.snow) < 0.1, `rain/snow at ${t.toFixed(2)} h`);
      assert.ok(Math.abs(sky.windSpeed - prev.windSpeed) < 1.5, `wind at ${t.toFixed(2)} h`);
      prev = sky;
    }
  }
});

test('the forecast is the weather that comes: its spell and its low and high', () => {
  for (const [season, climate, seed] of [['spring', 'wet', 3], ['winter', 'hard', 11], ['summer', 'hot', 5]] as const) {
    const s = blankState(1, season, { climate, weatherSeed: seed });
    s.sim.day = 2;
    const days = forecastDays(s);
    assert.deepEqual(days.map((d) => d.day), [3, 4, 5]);
    for (const f of days) {
      // Live through the forecast day, half-hour by half-hour, as the homestead would.
      const spells = new Set<string>();
      let lo = Infinity, hi = -Infinity;
      for (let k = 0; k < 48; k++) {
        const w = stepWeather(s, 0.5, f.day, (k + 0.5) / 2);
        spells.add(w.spell);
        lo = Math.min(lo, w.tempC); hi = Math.max(hi, w.tempC);
      }
      assert.ok(spells.has(f.spell), `${season} day ${f.day}: ${f.spell} forecast, saw ${[...spells].join(', ')}`);
      // Its low and high are the day's own: never milder than the hours lived, and within 0.1°C of the minute-by-minute air.
      assert.ok(f.minTempC <= Math.round(lo * 10) / 10 && f.maxTempC >= Math.round(hi * 10) / 10);
      const truth = trueRange(weatherKeyOf(s), f.day);
      assert.ok(Math.abs(f.minTempC - truth.lo) < 0.1 && Math.abs(f.maxTempC - truth.hi) < 0.1, `${f.minTempC}..${f.maxTempC} vs ${truth.lo}..${truth.hi}`);
      assert.ok(f.icon && f.label);
    }
  }
});

/** A day's coldest and warmest air, read minute by minute from the timeline. */
function trueRange(key: WeatherKey, day: number): { lo: number; hi: number } {
  let lo = Infinity, hi = -Infinity;
  for (let m = 0; m <= 24 * 60; m++) { const t = skyAt(key, absHour(day, m / 60)).tempC; lo = Math.min(lo, t); hi = Math.max(hi, t); }
  return { lo, hi };
}

test('the forecast\'s low and high catch the day\'s true extremes (a mild winter\'s coldest small hour)', () => {
  const s = blankState(1, 'winter', { climate: 'mild', weatherSeed: 1 });
  const [f] = forecastDays(s, 1), truth = trueRange(weatherKeyOf(s), 2);
  assert.equal(f.day, 2);
  assert.ok(Math.abs(f.minTempC - truth.lo) < 0.1, `low ${f.minTempC} vs the day's ${truth.lo.toFixed(2)}`);
  assert.ok(Math.abs(f.maxTempC - truth.hi) < 0.1, `high ${f.maxTempC} vs the day's ${truth.hi.toFixed(2)}`);
});

test('the live weather line tells today\'s weather, and the days ahead only once a Weather Station stands', () => {
  const s = blankState(1, 'spring');
  const now = describeWeather(s);
  assert.match(now, /^.+, -?\d+°C · wind \d+ m\/s/);
  assert.doesNotMatch(now, /Tomorrow/, 'no forecast without the station');
  const [next] = forecastDays(s, 1);
  assert.ok(!now.toLowerCase().includes(`${Math.round(next.minTempC)} to ${Math.round(next.maxTempC)}°c`));
  s.things.push({ id: s.nextId++, kind: 'weather_station', x: 0, z: 0, yaw: 0, padTargetY: 0 });
  assert.match(describeWeather(s), /^.+, -?\d+°C · wind \d+ m\/s.* · Tomorrow: .+, -?\d+ to -?\d+°C$/);
});

test('lightning flickers only in a strong storm', () => {
  const key: WeatherKey = { season: 'summer', climate: 'stormy', weatherSeed: 4 };
  const storm = spellTimeline(key.season, key.climate, key.weatherSeed, 24 * 20).find((sp) => sp.spell === 'storm');
  assert.ok(storm, 'a stormy summer has its storms');
  const s = blankState(1, 'summer', { climate: 'stormy', weatherSeed: 4 });
  let flickered = false;
  for (let t = 0; t < 24 * 20; t += 0.5) {
    const w = stepWeather(s, 0.5, Math.floor(t / 24) + 1, t % 24);
    assert.equal(w.lightning, w.storm >= 0.6);
    if (w.lightning) { flickered = true; assert.equal(w.spell, 'storm'); }
  }
  assert.ok(flickered);
});

test('the flood surge stays within bounds, and a spring spate lifts the brook', () => {
  for (const [season, climate] of [['spring', 'highRiver'], ['autumn', 'wet'], ['summer', 'dry']] as const) {
    const s = blankState(1, season, { climate, weatherSeed: 8 });
    let top = 0;
    for (let t = 8; t < 24 * 15; t += 0.25) {
      const w = stepWeather(s, 0.25, Math.floor(t / 24) + 1, t % 24);
      assert.ok(w.floodSurge >= 0 && w.floodSurge <= FLOOD_MAX + 1e-9);
      for (const v of [w.groundWet, w.snowDepth, w.frostCover, w.soak]) assert.ok(v >= 0 && v <= 1);
      top = Math.max(top, w.floodSurge);
    }
    if (climate === 'highRiver') assert.ok(top > 0.05, `a spate: ${top.toFixed(3)} m`);
    if (climate === 'dry') assert.ok(top < FLOOD_DEEP, `parched ground drinks a dry summer's storms: ${top.toFixed(3)} m`);
  }
});

test('a fixed weather still holds (old "rain" reads as soft rain); none, or liveEnv, follows the timeline', () => {
  assert.equal(toSpell('rain'), 'soft-rain');
  assert.equal(toSpell('heat-wave'), 'heat-wave');
  const s = blankState(1, 'spring', { weatherSeed: 12 });
  s.sim.hour = 10;
  stepSim(s, 1, { windSpeed: 4, cloudCover: 0.2, weather: 'rain' });
  assert.equal(s.sim.weather.spell, 'soft-rain');
  assert.ok(s.sim.weather.rain > 0.4);
  stepSim(s, 1, { windSpeed: 4, cloudCover: 0.2, weather: 'storm' });
  assert.ok(s.sim.weather.lightning);
  // With no weather given, the valley's own.
  stepSim(s, 1, { windSpeed: 4, cloudCover: 0.2 });
  const t = absHour(s.sim.day, s.sim.hour);
  assert.equal(s.sim.weather.spell, skyAt(weatherKeyOf(s), t).spell);
  // liveEnv carries the weather's wind and clouds, and overrides a fixed spell.
  const env = { ...liveEnv(s), weather: 'blizzard' };
  for (let k = 0; k < 30; k++) stepSim(s, 2, env);
  assert.equal(s.sim.weather.spell, skyAt(weatherKeyOf(s), absHour(s.sim.day, s.sim.hour)).spell);
  assert.deepEqual(liveEnv(s, 9), { windSpeed: s.sim.weather.windSpeed, cloudCover: s.sim.weather.cloudCover, useLiveWeather: true, hour: 9 });
});

test('a locked weather holds the sky and the forecast', () => {
  const s = blankState(1, 'winter', { weatherSeed: 3 });
  s.sim.weatherOverride = 'snow';
  for (let k = 0; k < 60; k++) stepSim(s, 2, { windSpeed: 4, cloudCover: 0.5 });
  assert.equal(s.sim.weather.spell, 'snow');
  assert.ok(s.sim.weather.snowDepth > 0);
  assert.ok(forecastDays(s).every((d) => d.spell === 'snow' && d.icon === 'snow'));
  s.sim.weatherOverride = null;
  assert.deepEqual(forecastDays(s, 1)[0], forecastDay(weatherKeyOf(s), s.sim.day + 1));
});

test('a thin snow or frost layer never shares the bare ground\'s map key', () => {
  const s = blankState(1, 'winter');
  Object.assign(s.sim.weather, { tempC: 8, rain: 0, groundWet: 0, snowDepth: 0, frostCover: 0 });
  const bare = groundKey(s);
  // Both round to step 0 of 20, but each is a layer the ground map draws.
  s.sim.weather.snowDepth = 0.02;
  const snow = groundKey(s);
  assert.notEqual(snow, bare, 'a dusting of snow');
  s.sim.weather.snowDepth = 0;
  s.sim.weather.frostCover = 0.02;
  assert.notEqual(groundKey(s), bare, 'a touch of rime');
  assert.notEqual(groundKey(s), snow);
});
