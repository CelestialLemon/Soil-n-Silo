// The UI's icons: small hand-drawn line pictures on a 24-unit square, inked in the text's colour (currentColor), so they
// sit with brush3d's inked outlines rather than with a stock icon set.

const WAVE = 'M3 20.5q2.25-1.6 4.5 0t4.5 0 4.5 0 4.5 0';

const PATHS = {
  // Tools.
  select: 'M6.5 3.5l11 7.2-5 1.3 2.8 5.6-2.2 1.1-2.8-5.6-3.8 3.4z',
  farmhouse: 'M3.5 11.5L12 4.5l8.5 7M6 9.8V20h12V9.8M10 20v-5.2h4V20M15.5 6.8V4.5h2.2v4.1',
  silo: 'M7 9.5a5 4.5 0 0 1 10 0V20H7zM7 9.5h10M7 13.2h10M7 16.8h10M12 5v-1.2',
  mill: 'M9 20.5l1.4-10h3.2l1.4 10M12 10.5l-6-6M12 10.5l6-6M12 10.5l-6 6M12 10.5l6 6M7.5 20.5h9',
  bakery: 'M3.5 14a8.5 5.5 0 0 1 17 0v5h-17zM8 11.2l1.2 2.4M12 10.2v2.8M16 11.2l-1.2 2.4',
  // A hen house on stilts with an arched pop-hole and its ramp.
  coop: 'M3.5 10.5L12 4.5l8.5 6M6 9v7h12V9M10.5 16v-2.4a1.5 1.5 0 0 1 3 0V16M7.5 16v4.5M16.5 16v4.5M10.5 16l-3.5 4.5',
  // A tiered skep on its stand with a small entrance.
  beehive: 'M4 20h16M5 17h14l-1-4H6zM6 13l1-4h10l1 4M8 9l1-4h6l1 4M11 17v-2h2v2',
  // A lidded barrel with a water line and a spout.
  rain_tank: 'M5 6c0-3 14-3 14 0s-14 3-14 0zm0 0v12c0 3 14 3 14 0V6M6 13h12M18 16h3v3',
  // A riser with a spray head throwing droplets.
  sprinkler: 'M7 21h10M12 21v-9M8 12h8M4 9l-2-1m4-2L4 4m5 1L8 2m8 3 1-3m1 4 2-2m0 5 2-1',
  // A slatted bin with a sprout coming up out of it.
  composter: 'M4 10h16M5.2 10l1.1 10.5h11.4L18.8 10M9.6 10l-.3 10.5M14.4 10l.3 10.5M12 10V6.8M12 7.2c-1.8 0-3-1-3-2.8 1.8 0 3 1 3 2.8zM12 7.2c1.8 0 3-1 3-2.8-1.8 0-3 1-3 2.8z',
  // A low shed with a slatted roll-up door.
  garage: 'M3 11l9-5.5 9 5.5M5 9.8V20h14V9.8M8 20v-6.5h8V20M8 15.6h8M8 17.8h8',
  solar: 'M3 11.5l13.5-3.5 4.5 6.5-13.5 3.5zM6.8 10.5l4.4 6.4M11.3 9.3l4.4 6.4M5 14.5l13.2-3.4M12 18v3M8.5 21h7',
  turbine: 'M12 10.5V21M9.5 21h5M12 10.5V3M12 10.5l6.5 3.8M12 10.5l-6.5 3.8M12 10.5m-1.2 0a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0',
  waterwheel: `M12 10.5m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M12 4v13M5.5 10.5h13M7.4 5.9l9.2 9.2M16.6 5.9l-9.2 9.2${WAVE}`,
  battery: 'M5 7h14v13H5zM9 7V4.5h6V7M12.8 9.8l-2.6 4h3.6l-2.6 4',
  relay: 'M12 11v10M9 21h6M12 11m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0M8.2 7.2a5.4 5.4 0 0 0 0 7.6M15.8 7.2a5.4 5.4 0 0 1 0 7.6M5.4 4.6a9.2 9.2 0 0 0 0 12.8M18.6 4.6a9.2 9.2 0 0 1 0 12.8',
  wheat: 'M12 21V5M12 8.5L9 6.5M12 8.5l3-2M12 12.5l-3-2M12 12.5l3-2M12 16.5l-3-2M12 16.5l3-2M12 5V3',
  beans: 'M5.5 18.5C5.5 10 11 5 18.5 5.5 19 13 14 18.5 5.5 18.5zM9 15.2h.01M12 12.2h.01M15 9.2h.01M4 20l2-2',
  eraseField: 'M4.5 15.5l8-8 6.5 6.5-6 6H8.5zM9 11l6.5 6.5M14.5 20h5.5',
  dig: `M14.5 3.5l6 6-2.6 2.6-6-6zM11.9 6.1L5 13M4.2 13.8l1.6 1.6${WAVE}`,
  fill: 'M3 19c3-6 15-6 18 0zM12 3.5v8M8.8 8.4l3.2 3.2 3.2-3.2',
  track: 'M6 21c.5-5.5 6-7.5 6.5-11.5S9.5 4.5 10 3M13.5 21c.5-5.5 6-7.5 6.5-11.5S17 4.5 17.5 3M9.8 16l2 .6M12.8 11l2 .3M12.3 6.2l2-.2',
  hedge: 'M3 17.5a3 3 0 0 1 4.6-3.4 3.3 3.3 0 0 1 4.4-2.6 3.3 3.3 0 0 1 4.4 2.6 3 3 0 0 1 4.6 3.4zM3 17.5h18M6 17.5V20M18 17.5V20',
  tree: 'M12 21v-6.5M12 14.5l-2.5-2M12 15.5l2.5-2M12 3.5a5.5 5.5 0 0 1 4.2 9 5 5 0 0 1-8.4 0A5.5 5.5 0 0 1 12 3.5zM8.5 21h7',
  clear: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M6.4 6.4l11.2 11.2',
  bench: 'M4 11.5h16M5 11.5v6.5M19 11.5v6.5M4.5 7.5h15M6.5 7.5v4M17.5 7.5v4M4 14.5h16',
  lantern: 'M9 7.5h6l1 8H8zM12 4.5v3M10.2 4.5h3.6M12 15.5V21M9 21h6M12 10v2.5',
  planter: 'M5.5 13h13l-1.6 7H7.1zM12 13V8.5M12 9.5C9 9.5 8 7.5 8 5.5c3 0 4 2 4 4zM12 10.5c3 0 4-2 4-4-3 0-4 2-4 4z',
  crates: 'M3 12h9v8.5H3zM12 12h9v8.5h-9zM7.5 3.5h9V12h-9zM3 12l9 8.5M12 12l9 8.5M7.5 3.5l9 8.5',
  // Categories.
  homestead: 'M3.5 11.5L12 4.5l8.5 7M6 9.8V20h12V9.8M10 20v-5.2h4V20',
  power: 'M13.5 2.8L5.5 13.5h6l-1 7.7 8-10.7h-6z',
  land: 'M2.5 19.5c3-7 7-9.5 10-9.5s6 3 9 9.5zM12 10V4.5M12 7c-2 0-3-1.2-3-2.8 2 0 3 1.2 3 2.8z',
  yard: 'M4 11.5h16M5 11.5v6.5M19 11.5v6.5M4.5 7.5h15M6.5 7.5v4M17.5 7.5v4',
  // The Supplies pool: a tied crate.
  supplies: 'M4 8.5l8-4 8 4v9l-8 4-8-4zM4 8.5l8 4 8-4M12 12.5v9M8 6.5l8 4',
  // Controls.
  turnLeft: 'M4 8.5h10.5a5.5 5.5 0 0 1 0 11H9M7.5 5L4 8.5 7.5 12',
  turnRight: 'M20 8.5H9.5a5.5 5.5 0 0 0 0 11H15M16.5 5L20 8.5 16.5 12',
  // The camera's setting: a free orbit (a ring round the view with a travelling dot), or four snapped views (ticks).
  orbit: 'M12 12m-8.5 0a8.5 4.2 0 1 0 17 0a8.5 4.2 0 1 0-17 0M12 12m-1.3 0a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0M18.2 8.3l2.4.6-1 2.3',
  snap: 'M12 12m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M12 12m-1.3 0a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0',
  rotateLeft: 'M5 12a7 7 0 1 0 2.1-5M5 4.5V9h4.5',
  rotateRight: 'M19 12a7 7 0 1 1-2.1-5M19 4.5V9h-4.5',
  move: 'M12 3v18M3 12h18M12 3L9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5',
  remove: 'M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 13.5h9l1-13.5M10.2 10v6.5M13.8 10v6.5',
  close: 'M6 6l12 12M18 6L6 18',
  pause: 'M8 5v14M16 5v14',
  home: 'M3.5 11.5L12 4.5l8.5 7M6 9.8V20h12V9.8M10 20v-5.2h4V20',
  dice: 'M4.5 4.5h15v15h-15zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01',
  chevron: 'M6 9.5l6 6 6-6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  sun: 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8',
  breeze: 'M3 8.5h11a2.5 2.5 0 1 0-2.5-2.5M3 12.5h15.5a2.5 2.5 0 1 1-2.5 2.5M3 16.5h8',
  overcast: 'M7 18.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3A4.6 4.6 0 0 1 17 18.5z',
  rain: 'M7 14.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3A4.6 4.6 0 0 1 17 14.5zM8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3',
} as const;

export type IconName = keyof typeof PATHS;

const SVG = 'http://www.w3.org/2000/svg';

/** A fresh icon element: an inline SVG drawn with the text's colour. */
export function icon(name: IconName, cls = 'ui-icon'): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', PATHS[name]);
  svg.append(path);
  return svg;
}

/** Swaps an icon element's picture in place. */
export function setIcon(svg: SVGSVGElement, name: IconName): void {
  const path = svg.firstElementChild;
  if (path && path.getAttribute('d') !== PATHS[name]) path.setAttribute('d', PATHS[name]);
}
