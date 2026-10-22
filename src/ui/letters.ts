import type { Scenario } from '../game/scenarios.ts';
import type { Character, Season } from '../game/seasons.ts';
import { goalWords } from './widgets.ts';

// The letters each commission arrives with, for the briefing: who writes, from where, and what they hope for. Personal and
// warm; they say what is wanted and why, never how to do it. Random commissions get a short note made from their goals.

export interface Letter {
  from: string; role: string; place: string; day: string; greeting: string; body: string[]; signoff: string; asks: string;
  /** The season in the writer's voice: what it is like this year. Words only; the numbers are on the level card and in the guide. */
  season: string[];
  /** Room for the weather events a season can bring (phase 2): empty until then. */
  events: string[];
}

/** What a letter says, before the season and the events are added. */
type Written = Omit<Letter, 'season' | 'events'> & { season?: string[] };

const LETTERS: Record<string, Written> = {
  c1: {
    from: 'Tomas Reed', role: 'Miller, Brightwater', place: 'The mill house, Brightwater', day: 'Saturday', greeting: 'Dear friends at the co-op,',
    body: [
      'The old mill wheel gave out in the spring floods, and Brightwater has been buying its flour from the coast ever since. It comes late, it comes dear, and it tastes of the cart.',
      'We would like grain of our own again: a hundred and twenty measures of wheat, and eighty of flour, brought to the depot. That would see the village through to the next harvest.',
      'I am told your valley has good dark soil by the river. I hope it treats you kindly.',
    ],
    signoff: 'With thanks, and every good wish,', asks: 'What he asks',
    season: ['It is a gentle spring here, soft light and a kind wind, and the river has come down from the hills full.'],
  },
  c2: {
    from: 'Ada Thorne', role: 'Schoolmistress', place: 'The schoolhouse, Loam Valley', day: 'Monday', greeting: 'Dear friends at the co-op,',
    body: [
      'The schoolhouse opens again next week, and a great many of my pupils arrive with nothing in their stomachs. I would like each of them to start the day with fresh bread. One hundred and fifty loaves, delivered to the depot, would see us through the term.',
      'I am told the chickens will want feeding, and that the mill makes bran along with its flour. I leave the how of it to you.',
      'One thing more. The children will farm this valley after us. Please leave the soil in good heart.',
    ],
    signoff: 'With thanks, and warm regards,', asks: 'What she asks',
    season: ['We have had a wet spring: rain most weeks, the lane to the school a ribbon of mud, and the river running full.'],
  },
  c3: {
    from: 'Marta Vell', role: 'Cook, the Ridge co-op', place: 'The long kitchen, Windy Ridge', day: 'Thursday', greeting: 'To whoever reads this at the co-op,',
    body: [
      'Up here we cook everything in sunflower oil, and we have run out. Ninety flasks would fill the larder, and eighty loaves would fill the people who eat at my tables.',
      'You will find the sun thin on the ridge, and the rock close under the grass. But the wind has not stopped blowing since my grandmother\'s day, and I do not expect it to start now.',
    ],
    signoff: 'Yours, with an empty pan,', asks: 'What she asks',
    season: ['Autumn on the ridge means gales. The wind comes early and stays, and the sun is thinner than it was in summer.'],
  },
  c4: {
    from: 'Ines Hollin', role: 'Master weaver', place: 'The weaving hall, Hollin', day: 'Tuesday', greeting: 'Dear co-op,',
    body: [
      'Hollin has woven linen for three hundred years, and our looms have never stood so quiet. We need fifty bolts of linen for the summer fair.',
      'More than that, we need yarn that keeps coming: five skeins a minute, steady, so the young weavers can learn on it without waiting. A loom that waits forgets its rhythm.',
    ],
    signoff: 'In hope, and with the thanks of the hall,', asks: 'What she asks',
    season: ['This summer is hot, the sun strong and the air heavy by afternoon. The river is low and slow, and the wind seldom troubles the looms.'],
  },
  c5: {
    from: 'Old Benna', role: 'Keeper of the midwinter fair', place: 'The green, Longnight', day: 'the first frost', greeting: 'Dear ones,',
    body: [
      'The nights are drawing in. By the fair the sun will barely clear the hills, and folk need something sweet to see them through the dark.',
      'Sixty honey cakes, if you please. The bees grow sleepy as the days shorten, and so do the panels on your roofs. Mind the lamps.',
    ],
    signoff: 'Warmly, from the fireside,', asks: 'What she asks',
    season: ['It is winter. The days are short and cold, with frost at night and snow some days, and the river runs low and slow.'],
  },
  c6: {
    from: 'Jonah Fairweather', role: 'Cannery foreman', place: 'Stillwater cannery', day: 'Wednesday', greeting: 'To the co-op,',
    body: [
      'This valley grew one crop for twenty years until it would grow nothing much at all. The families who farmed it moved to the cannery town, and the cannery needs sauce: fifty jars.',
      'But they would like to go home one day. If you can leave the ground healthier than you found it, at fifty-five or better, I will make sure they hear it was you.',
    ],
    signoff: 'Respectfully,', asks: 'What he asks',
    season: ['A dry summer, the sun high and the showers few. The river has shrunk to a trickle in its bed.'],
  },
  c7: {
    from: 'The three reeves', role: 'Upriver, Midford and Rushmouth', place: 'Midford landing', day: 'market day', greeting: 'Friends,',
    body: [
      'Three villages, one river, and for once we agree on something: we all want our orders filled, and soon. Upriver wants thirty bolts of linen, Midford thirty jars of sauce, Rushmouth eighty loaves.',
      'The land is narrow between the water and the woods. We are sorry for that; it was narrow when we got here too.',
    ],
    signoff: 'Yours, in rare agreement,', asks: 'What they ask',
    season: ['The river is high this spring, higher than any of us remember, and fast. The rain has not finished with us yet.'],
  },
  c8: {
    from: 'Wren Ashdown', role: 'For the festival committee', place: 'The festival field', day: 'harvest eve', greeting: 'Dear co-op,',
    body: [
      'Every village in the valley is coming to the harvest festival, and every one of them is bringing an appetite. We need forty honey cakes, thirty jars of sauce and thirty bolts of linen for the prize tables.',
      'And this year the committee has voted that the festival should stand on healthy ground. Soil at sixty or better when the lanterns go up.',
      'Everything, at once. We know. We believe in you.',
    ],
    signoff: 'With love, and a great deal of bunting,', asks: 'What they ask',
    season: ['The autumn has turned stormy: heavy cloud, hard rain and gusts that take the last leaves in an afternoon.'],
  },
};

/** The season in a neutral voice, for commissions without a letter of their own (random ones and the sandbox). */
const SEASON_WORDS: Record<Season, string> = {
  spring: 'It is spring: the river runs high and fast, showers are frequent and the mornings are cool.',
  summer: 'It is summer: long bright days and strong sun, the river low and slow, and little rain.',
  autumn: 'It is autumn: the days are shortening, the wind is up and the river sits in between.',
  winter: 'It is winter: short cold days, frost at night, snow in place of rain, and a slow river.',
};

/** A character's words, in the same voice. */
const CHARACTER_WORDS: Record<Character, string> = {
  mild: 'It has been a mild one, gentler than most.',
  wet: 'It has been wetter than usual, with more cloud and more rain.',
  dry: 'It has been drier than usual, clear and still.',
  hot: 'It has been hotter than usual.',
  gales: 'The gales have come early.',
  stormy: 'It has been stormy, with heavy cloud, hard rain and gusts.',
  hard: 'It has been a hard one, colder than anyone remembers.',
  highRiver: 'The river is higher than it has been for years.',
};

/** The letter a commission arrives with: what is written, with the season and room for the events. */
export function letterFor(sc: Scenario): Letter {
  const l = writtenFor(sc);
  return { ...l, season: l.season ?? [SEASON_WORDS[sc.climate.season], ...(sc.climate.character ? [CHARACTER_WORDS[sc.climate.character]] : [])], events: [] };
}

function writtenFor(sc: Scenario): Written {
  const known = LETTERS[sc.id];
  if (known) return known;
  if (sc.sandbox) {
    return {
      from: 'The valley', role: '', place: 'A big valley', day: 'any day', greeting: 'Welcome,',
      body: ['No one is waiting on an order here. The credits do not run out and nothing is asked of you. Build what you like, and see how it runs.'],
      signoff: '', asks: 'What it asks',
    };
  }
  const wants = sc.goals.map(goalWords);
  const list = wants.length > 1 ? `${wants.slice(0, -1).join(', ')} and ${wants[wants.length - 1]}` : wants[0];
  return {
    from: `The people of ${sc.name}`, role: '', place: sc.name, day: 'this week', greeting: 'Dear co-op,',
    body: [`${sc.name} has sent word: they would like ${list}.`, 'They leave the how of it to you.'],
    signoff: 'With thanks,', asks: 'What they ask',
  };
}
