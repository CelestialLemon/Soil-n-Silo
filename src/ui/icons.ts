import type { ItemId } from '../game/items.ts';

// Item icons for the hotbar and menus: 12 x 12 pixel art drawn from character maps, so the HUD matches the pixel-art farm
// without image files. Each character is one pixel of a colour from PALETTE; '.' is transparent.

const PALETTE: Record<string, string> = {
  k: '#2a1e14', w: '#f6f0e2', W: '#d8cfbc', y: '#f2d060', Y: '#c8962c', g: '#78b84a', G: '#3f7a32', r: '#d8443a', R: '#9a2a26',
  o: '#f08c2c', O: '#b85a1c', b: '#a8744a', B: '#6a4428', t: '#e2c48c', T: '#c8a46a', s: '#c8ccd4', S: '#7a808c', c: '#6ab4e8',
  C: '#3a78b8', m: '#6a4a2a', M: '#4a3020', p: '#f0b8a0',
};

const MAPS: Record<ItemId, string[]> = {
  hoe: [
    '........SSS.', '.......SsSS.', '......SSS...', '.....bB.....', '....bB......', '...bB.......',
    '..bB........', '.bB.........', 'bB..........', 'B...........', '............', '............'],
  can: [
    '............', '...SSSS.....', '..S....S....', '.CCCCCCCC...', 'CccccccccC.c', 'CccccccccCcc',
    'CccccccccCc.', 'CCcccccccC..', '.CccccccC...', '.CCCCCCCC...', '............', '............'],
  hand: [
    '....pk.pk...', '...kpkkpk.k.', '.k.kpkkpkkpk', 'kpkkpkkpkkpk', 'kpkkpppppkpk', 'kppppppppppk',
    '.kpppppppppk', '.kpppppppppk', '..kpppppppk.', '...kppppppk.', '....kpppppk.', '....kkkkkk..'],
  wheat_seed: [
    '............', '...TTTTTT...', '..TttttttT..', '..TtttyttT..', '.TttYttttTT.', '.TtttttYttT.',
    '.TtyttttttT.', '.TttttyttT..', '.TTttttttT..', '..TTTTTTTT..', '............', '............'],
  tomato_seed: [
    '............', '...TTTTTT...', '..TttttttT..', '..TttrRttT..', '.TttrrrRtTT.', '.TtttrRtttT.',
    '.TttgGttttT.', '.TttttttttT.', '.TTttttttT..', '..TTTTTTTT..', '............', '............'],
  pumpkin_seed: [
    '............', '...TTTTTT...', '..TttttttT..', '..TttoOttT..', '.TttoooOtTT.', '.TttoooOttT.',
    '.TtttOOtttT.', '.TttttttttT.', '.TTttttttT..', '..TTTTTTTT..', '............', '............'],
  wheat: [
    '....y..y....', '...yYyyYy...', '....yYyY....', '...yYyyYy...', '....yYyY....', '...yYyyYy...',
    '....yYYy....', '.....gG.....', '....gGgG....', '.....gG.....', '.....gG.....', '.....gG.....'],
  tomato: [
    '............', '.....gG.....', '...gGgGg....', '..rrrGrrr...', '.rrrrrrrrR..', '.rrwrrrrrR..',
    '.rrrrrrrrR..', '.rrrrrrrrR..', '..rrrrrrR...', '...RRRRR....', '............', '............'],
  pumpkin: [
    '.....GB.....', '......B.....', '..ooOooOoo..', '.oooOooOooO.', 'ooyoOooOoooO', 'oooOooooOooO',
    'oooOooooOooO', 'oooOooooOooO', '.oooOooOooO.', '..OOOOOOOO..', '............', '............'],
  scraps: [
    '............', '............', '.....g......', '...gGg.o....', '..gGg.ooO...', '.yY..oOO.gG.',
    '.yyY..O.gGg.', '..Y.bb..Gg..', '...bBBb.....', '............', '............', '............'],
  feed: [
    '....kkkk....', '...kTTTTk...', '....kTTk....', '...TttttT...', '..TttttttT..', '.TttyYytttT.',
    '.TtyYyYyttT.', '.TtttyYtttT.', '.TttttttttT.', '.TTttttttTT.', '..TTTTTTTT..', '............'],
  egg: [
    '............', '.....WW.....', '....WwwW....', '...WwwwwW...', '...WwwwwW...', '..WwwwwwwW..',
    '..WwwwwwwW..', '..WwwwwwwW..', '..WWwwwwWW..', '...WWWWWW...', '............', '............'],
  manure: [
    '............', '............', '.....mM.....', '....mmmM....', '.....mM.....', '...mmmmmM...',
    '..mmMmmmmM..', '..mmmmMmmM..', '.mmmmmmmmmM.', '.MMMMMMMMMM.', '............', '............'],
  flour: [
    '............', '....kkkk....', '...kwwwwk...', '....kwwk....', '...wwwwww...', '..wwwwwwww..',
    '.wwwwBBwwwW.', '.wwwBwwBwwW.', '.wwwwBBwwwW.', '.WwwwwwwwWW.', '..WWWWWWWW..', '............'],
  bread: [
    '............', '............', '....TTTTT...', '..TTtTtTtTT.', '.TtbTtbTtbtT', '.TbbbbbbbbbT',
    'Tbbbbbbbbbbb', 'TbbbbbbbbbbB', '.BbbbbbbbbB.', '..BBBBBBBB..', '............', '............'],
  pie: [
    '............', '............', '....TTTT....', '..TToooOTT..', '.TooooOoooT.', 'TooOooooOooT',
    'TtTtTtTtTtTt', 'tbtbtbtbtbtb', '.bbbbbbbbbb.', '..BBBBBBBB..', '............', '............'],
  mill: [
    '.s....s.....', '..s..s......', '...ss.......', '..ssbs......', '.s.bbbs.....', 's..bbb.s....',
    '...bbbb.....', '..bbbbbb....', '..bbBBbb....', '..bbBBbb....', '.bbbBBbbb...', '............'],
  oven: [
    '........SS..', '........SS..', '...RRRRRSS..', '..RrrrrrrR..', '.RrrrrrrrrR.', '.RrrkkkkrrR.',
    'RrrkoyyokrrR', 'RrrkoyyokrrR', 'RrrkkkkkkrrR', 'SSSSSSSSSSSS', 'SsssssssssSS', '............'],
};

const cache = new Map<ItemId, string>();

/** The icon as a data URL, drawn once. */
export function iconUrl(id: ItemId): string {
  let url = cache.get(id);
  if (url) return url;
  const map = MAPS[id], c = document.createElement('canvas');
  c.width = 12; c.height = 12;
  const g = c.getContext('2d')!;
  map.forEach((line, y) => [...line].forEach((ch, x) => {
    if (ch === '.') return;
    g.fillStyle = PALETTE[ch];
    g.fillRect(x, y, 1, 1);
  }));
  url = c.toDataURL();
  cache.set(id, url);
  return url;
}
