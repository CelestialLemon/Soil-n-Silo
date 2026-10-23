import { EVENT_KINDS, EVENTS, eventsOf, type EventKind } from './events.ts';
import { CAMPAIGN, type Scenario } from './scenarios.ts';

// The words a briefing letter uses for the weather events: which ones it names, and how they read in a sentence.

/** An event in a sentence: "a thunderstorm", "fog". */
const anEvent = (k: EventKind) => (k === 'fog' ? 'fog' : `a ${EVENTS[k].name.toLowerCase()}`);
const listOf = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}` : xs[0]);

/**
 * The events a letter names: for a campaign commission, the ones it will bring (placed by hand, so the letter can say; a flood that
 * follows its storm is part of it), else what the season and character can bring, the bad ones first.
 */
function namedEvents(sc: Scenario): EventKind[] {
  if (!CAMPAIGN.some((c) => c.id === sc.id)) return eventsOf(sc.climate);
  const placed = new Set(sc.events.map((e) => e.kind));
  return EVENT_KINDS.filter((k) => placed.has(k) && !sc.events.some((e) => EVENTS[e.kind].then === k)).sort((a, b) => Number(!!EVENTS[a].good) - Number(!!EVENTS[b].good));
}

/** What the season can bring (what a campaign commission will), as sentences: the hard turns, then the kind ones. Empty if it can bring none. */
export function eventWords(sc: Scenario): string[] {
  const kinds = namedEvents(sc), bad = kinds.filter((k) => !EVENTS[k].good).map(anEvent), good = kinds.filter((k) => EVENTS[k].good).map(anEvent);
  return [...(bad.length ? [`Weather to watch for this season: ${listOf(bad)}.`] : []), ...(good.length ? [`Kinder turns it can take: ${listOf(good)}.`] : [])];
}
