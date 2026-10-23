import { DAY_SECONDS, type BuildingId } from './data.ts';
import { endOf, EVENTS, eventName, type WeatherEvent } from './events.ts';
import type { RunLog } from './runlog.ts';
import type { Scenario } from './scenarios.ts';
import { dayAt } from './sim/clock.ts';

// What each weather event cost the run, for the results: an estimate, stated as a fact ("The fog on day 3 cost about 1½ minutes").
//
// The run log keeps the value of everything the valley made over time (`output`, sampled with the goal curve) and the seconds
// the weather held anything, per event. An event that held nothing cost nothing. For one that did, the cost is the work it lost:
// the output gives the rate before the event began and after it was over, the rate the valley was making when it was left
// alone (their mean, or the rate before when the run ended too soon for an after), and the event's cost is how long that rate
// takes to make what was missed over the event and the half minute after it (goods held up arrive late). Output is used, not
// the goal good delivered, because deliveries come in truckloads: measured on bot runs against the run replayed without the
// event, it is about twice as close. It is an estimate, good to about a minute; costs under a minute are not told.

/** How long after an event ends the delivery it lost still shows, in seconds: goods held up arrive late. */
export const LAG = 30;
/** The least an event is told as costing, in seconds; less is "almost nothing". */
export const NOTICEABLE = 60;
/** The most play before and after an event the rates are measured over, in seconds, and the least (below it there is no telling). */
const SPAN_MAX = 240, SPAN_MIN = 30;

export interface EventCost {
  /** The event's index in the scenario. */
  index: number;
  event: WeatherEvent;
  /** The day it began on (1-based). */
  day: number;
  /** What it cost, in seconds of play, to the nearest half minute; 0 when it cost very little; null when the run can't say (it came too early, or the run made too little to measure by). */
  seconds: number | null;
  /** What it held, by building type (`truck`: trucks), in seconds of each. */
  held: Partial<Record<BuildingId | 'truck', number>>;
}

/** The value made by a time, from the output samples (between them, in a line). */
function madeBy(run: RunLog, t: number): number {
  const at = Math.max(0, t) / run.curveStep, i = Math.floor(at);
  if (i >= run.output.length - 1) return run.output[run.output.length - 1] ?? 0;
  return run.output[i] + (run.output[i + 1] - run.output[i]) * (at - i);
}

/** The event's cost in seconds of play, from the output; null when it can't say (too early, or too little made). */
export function lostSeconds(run: RunLog, e: WeatherEvent, end: number): number | null {
  // Over the event and after it: the half minute goods held up arrive late, or the hours its effects linger (snow on the panels).
  const a = e.start, b = Math.min(end, endOf(e) + Math.max(LAG, (EVENTS[e.kind].lingers ?? 0) * DAY_SECONDS / 24));
  if (b <= a) return null;
  const span = Math.min(SPAN_MAX, Math.max(b - a, SPAN_MIN)), before = Math.min(span, a);
  if (before < SPAN_MIN) return null;
  const rates = [(madeBy(run, a) - madeBy(run, a - before)) / before];
  const after = Math.min(span, end - b);
  if (after >= SPAN_MIN) rates.push((madeBy(run, b + after) - madeBy(run, b)) / after);
  const rate = rates.reduce((n, r) => n + r, 0) / rates.length;
  if (rate <= 1e-6) return null;
  const missed = rate * (b - a) - (madeBy(run, b) - madeBy(run, a));
  return Math.max(0, Math.min(b - a, missed / rate));
}

/** Each event that held something, with what it cost, in the order they came. */
export function eventCosts(sc: Pick<Scenario, 'events'>, run: RunLog, end: number): EventCost[] {
  const out: EventCost[] = [];
  sc.events.forEach((event, index) => {
    if (event.start >= end) return;
    const held: EventCost['held'] = {};
    for (const [k, seconds] of Object.entries(run.held)) {
      const [i, what] = k.split('|');
      if (Number(i) === index) held[what as BuildingId | 'truck'] = seconds;
    }
    if (!Object.keys(held).length) return;
    const lost = lostSeconds(run, event, end);
    out.push({ index, event, day: dayAt(event.start), seconds: lost === null ? null : lost < NOTICEABLE ? 0 : Math.round(lost / 30) * 30, held });
  });
  return out;
}

/** "The gale on day 4": an event named for the results. */
export const eventTitle = (c: EventCost) => `The ${eventName(c.event.kind, c.event.strength).toLowerCase()} on day ${c.day}`;
