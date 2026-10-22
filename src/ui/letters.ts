import type { Scenario } from '../game/scenarios.ts';
import { goalWords } from './widgets.ts';

// The letters each commission arrives with, for the briefing: who writes, from where, and what they hope for. Personal and
// warm; they say what is wanted and why, never how to do it. Random commissions get a short note made from their goals.

export interface Letter { from: string; role: string; place: string; day: string; greeting: string; body: string[]; signoff: string; asks: string }

const LETTERS: Record<string, Letter> = {
  c1: {
    from: 'Tomas Reed', role: 'Miller, Brightwater', place: 'The mill house, Brightwater', day: 'Saturday', greeting: 'Dear friends at the co-op,',
    body: [
      'The old mill wheel gave out in the spring floods, and Brightwater has been buying its flour from the coast ever since. It comes late, it comes dear, and it tastes of the cart.',
      'We would like grain of our own again: a hundred and twenty measures of wheat, and eighty of flour, brought to the depot. That would see the village through to the next harvest.',
      'I am told your valley has good dark soil by the river. I hope it treats you kindly.',
    ],
    signoff: 'With thanks, and every good wish,', asks: 'What he asks',
  },
  c2: {
    from: 'Ada Thorne', role: 'Schoolmistress', place: 'The schoolhouse, Loam Valley', day: 'Monday', greeting: 'Dear friends at the co-op,',
    body: [
      'The schoolhouse opens again next week, and a great many of my pupils arrive with nothing in their stomachs. I would like each of them to start the day with fresh bread. One hundred and fifty loaves, delivered to the depot, would see us through the term.',
      'I am told the chickens will want feeding, and that the mill makes bran along with its flour. I leave the how of it to you.',
      'One thing more. The children will farm this valley after us. Please leave the soil in good heart.',
    ],
    signoff: 'With thanks, and warm regards,', asks: 'What she asks',
  },
  c3: {
    from: 'Marta Vell', role: 'Cook, the Ridge co-op', place: 'The long kitchen, Windy Ridge', day: 'Thursday', greeting: 'To whoever reads this at the co-op,',
    body: [
      'Up here we cook everything in sunflower oil, and we have run out. Ninety flasks would fill the larder, and eighty loaves would fill the people who eat at my tables.',
      'You will find the sun thin on the ridge, and the rock close under the grass. But the wind has not stopped blowing since my grandmother\'s day, and I do not expect it to start now.',
    ],
    signoff: 'Yours, with an empty pan,', asks: 'What she asks',
  },
  c4: {
    from: 'Ines Hollin', role: 'Master weaver', place: 'The weaving hall, Hollin', day: 'Tuesday', greeting: 'Dear co-op,',
    body: [
      'Hollin has woven linen for three hundred years, and our looms have never stood so quiet. We need fifty bolts of linen for the summer fair.',
      'More than that, we need yarn that keeps coming: five skeins a minute, steady, so the young weavers can learn on it without waiting. A loom that waits forgets its rhythm.',
    ],
    signoff: 'In hope, and with the thanks of the hall,', asks: 'What she asks',
  },
  c5: {
    from: 'Old Benna', role: 'Keeper of the midwinter fair', place: 'The green, Longnight', day: 'the first frost', greeting: 'Dear ones,',
    body: [
      'The nights are drawing in. By the fair the sun will barely clear the hills, and folk need something sweet to see them through the dark.',
      'Sixty honey cakes, if you please. The bees grow sleepy as the days shorten, and so do the panels on your roofs. Mind the lamps.',
    ],
    signoff: 'Warmly, from the fireside,', asks: 'What she asks',
  },
  c6: {
    from: 'Jonah Fairweather', role: 'Cannery foreman', place: 'Stillwater cannery', day: 'Wednesday', greeting: 'To the co-op,',
    body: [
      'This valley grew one crop for twenty years until it would grow nothing much at all. The families who farmed it moved to the cannery town, and the cannery needs sauce: fifty jars.',
      'But they would like to go home one day. If you can leave the ground healthier than you found it, at fifty-five or better, I will make sure they hear it was you.',
    ],
    signoff: 'Respectfully,', asks: 'What he asks',
  },
  c7: {
    from: 'The three reeves', role: 'Upriver, Midford and Rushmouth', place: 'Midford landing', day: 'market day', greeting: 'Friends,',
    body: [
      'Three villages, one river, and for once we agree on something: we all want our orders filled, and soon. Upriver wants thirty bolts of linen, Midford thirty jars of sauce, Rushmouth eighty loaves.',
      'The land is narrow between the water and the woods. We are sorry for that; it was narrow when we got here too.',
    ],
    signoff: 'Yours, in rare agreement,', asks: 'What they ask',
  },
  c8: {
    from: 'Wren Ashdown', role: 'For the festival committee', place: 'The festival field', day: 'harvest eve', greeting: 'Dear co-op,',
    body: [
      'Every village in the valley is coming to the harvest festival, and every one of them is bringing an appetite. We need forty honey cakes, thirty jars of sauce and thirty bolts of linen for the prize tables.',
      'And this year the committee has voted that the festival should stand on healthy ground. Soil at sixty or better when the lanterns go up.',
      'Everything, at once. We know. We believe in you.',
    ],
    signoff: 'With love, and a great deal of bunting,', asks: 'What they ask',
  },
};

/** The letter a commission arrives with. */
export function letterFor(sc: Scenario): Letter {
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
