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
  // A round fruit with its star of a calyx and stalk.
  tomato: 'M12 7.5c4.6 0 7.5 2.8 7.5 6.3S16.4 20.5 12 20.5 4.5 17.3 4.5 13.8 7.4 7.5 12 7.5zM12 7.5V4M12 7.5L8.5 6M12 7.5l3.5-1.5M12 7.5l-2 2.6M12 7.5l2 2.6',
  // A flower head on a tall stalk, with one leaf.
  sunflower: 'M12 7.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M12 2.5v1.2M12 11.3v1.2M7 7.5h1.2M15.8 7.5H17M8.5 4l.9.9M14.6 10.1l.9.9M8.5 11l.9-.9M14.6 4.9l.9-.9M12 12.5V21M12 17c0-2.2 1.7-3.5 4-3.5 0 2.2-1.7 3.5-4 3.5z',
  // Slim stems, each topped with a small five-petalled flower.
  flax: 'M8 21V9M12 21V6M16 21V10M8 9m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M12 6m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M16 10m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M8 15l-2-1.5M16 16l2-1.5',
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
  // A mast with spinning cups on top and a wind vane below them.
  weatherStation: 'M12 21V6M9 21h6M4.5 6h15M4.5 6a2.2 2.2 0 0 0 4.4 0M15.1 6a2.2 2.2 0 0 0 4.4 0M12 6V3.5M12 13.5h6.5M18.5 13.5l-1.8-1.8M18.5 13.5l-1.8 1.8M12 13.5H7.5l-1.5-1.5M7.5 13.5L6 15',
  // A screw press: a frame, its screw and handwheel, and a jar under the spout.
  oilPress: 'M5 20.5V7h14v13.5M3.5 7h17M12 7v6M9 13h6v2.5H9zM8 4h8M12 4v3M15.5 18.5h2.5v2h-2.5zM14 15.5l2 3',
  // A big kettle on its stove, steam curling off its pipe.
  cannery: 'M4.5 20.5h15M6 20.5v-4h12v4M6.5 16.5a5.5 4.5 0 0 1 11 0M12 12V9.5M10 9.5h4M17 13.5l2.5-2V6M19.5 6c-1-1.2 1-2 0-3.2',
  // A great spinning wheel on its stand, with the bobbin beside.
  spinner: 'M10 10m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M10 10m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M10 4v12M4 10h12M10 16l-3 4.5M10 16l3 4.5M5.5 20.5h9M18.5 8v8M17 9.5h3M17 14.5h3',
  // A loom's frame with the warp threads and a shuttle across them.
  loom: 'M4 20.5V4M20 20.5V4M3 4.5h18M4 17h16M7.5 4.5V17M10.5 4.5V17M13.5 4.5V17M16.5 4.5V17M5.5 11h13M9 9.5h6v3H9z',
  // A round tank under a dome, a pipe up to a small flame.
  digester: 'M4 20.5h16M5.5 20.5V13h13v7.5M5.5 13a6.5 5.5 0 0 1 13 0M18.5 15.5h2V8M20.5 8c-1.4-1.2-.6-2.6 0-4 .6 1.4 1.4 2.8 0 4zM9 17h6',
  // An arched glasshouse with its glazing ribs and a door.
  greenhouse: 'M3.5 20V12a8.5 7 0 0 1 17 0v8zM3.5 20h17M8 20v-9.8M16 20v-9.8M12 20V5M3.5 13.5h17M10.2 20v-3.6h3.6V20',
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
  // The sky: the live weather and the Weather Station's days ahead.
  partly: 'M10.5 6.2a3.5 3.5 0 0 1 4.5 2.2M10 2.8v1.4M5.5 4.8l1 1M3.8 9.2h1.4M8.5 19.5a3.5 3.5 0 0 1-.3-7 4.8 4.8 0 0 1 9.2-1.1 4 4 0 0 1-.4 8.1z',
  fog: 'M7 12.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3A4.6 4.6 0 0 1 17 12.5M3.5 15.5h17M5.5 18.5h13M8 21.5h8',
  storm: 'M7 14.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3A4.6 4.6 0 0 1 17 14.5zM12.8 14.5l-2.6 3.6h3.4l-2.4 3.6M7.5 16.5l-.8 2.5M17.2 16.5l-.8 2.5',
  heat: 'M12 9m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M12 2.5v1.5M5.5 9H4M20 9h-1.5M7.4 4.4l1 1M16.6 4.4l-1 1M3.5 16.5q2.1-1.5 4.25 0t4.25 0 4.25 0 4.25 0M3.5 20.5q2.1-1.5 4.25 0t4.25 0 4.25 0 4.25 0',
  gale: 'M3 7.5h10.5a2.5 2.5 0 1 0-2.5-2.5M3 11.5h16a2.5 2.5 0 1 1-2.5 2.5M3 15.5h9a2.5 2.5 0 1 1-2.5 2.5M15 4.5l3 1.5M17 8l3.5-.5',
  frost: 'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.8 3.8 12 6l2.2-2.2M9.8 20.2 12 18l2.2 2.2M4 10.7l3-.8-.8-3M20 13.3l-3 .8.8 3M4 13.3l3 .8-.8 3M20 10.7l-3-.8.8-3',
  snow: 'M7 13.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3A4.6 4.6 0 0 1 17 13.5zM8 17h.01M12 16.5h.01M16 17h.01M10 20.5h.01M14 20.5h.01',
  blizzard: 'M7 11.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3A4.6 4.6 0 0 1 17 11.5zM3 15h11.5a2 2 0 1 1-2 2M3 19h7M17.5 15h.01M19.5 18.5h.01M15 20.5h.01',
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
