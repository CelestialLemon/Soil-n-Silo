# The illustrated icon set (goods, buildings, controls), drawn once as SVG shapes and rendered into a sprite sheet plus the
# CSS classes that pick one icon out of it, in Clearday's flat style (muted fills, a soft edge, no outline):
#
#   python3 tools/clearday/icons.py cd src/ui/clearday "#2a3530"
#
# writes src/ui/clearday/icons.svg and icons.css (classes `cd-i cd-i--<name>`, sized by `--s`). The last argument is the
# colour of the control glyphs (pause, play, close…). To add an icon, add an icon(...) line below and rerun.
# Shapes use @a (base), @b (shade), @c (light) colour slots; class "ln" marks stroke-only lines.
import re, sys

P = {  # palettes per icon: base, shade, light
    'gold': ('#e8c35a', '#c49330', '#f6e3a0'), 'green': ('#78a94a', '#4f7d2e', '#b6d98a'), 'red': ('#e0563c', '#a8352a', '#f39a7f'),
    'sun': ('#f5c53d', '#d99a1e', '#fbe48a'), 'blue': ('#7fa6dc', '#4e74b3', '#bcd2f2'), 'cream': ('#f6efdf', '#d6c8a8', '#ffffff'),
    'brown': ('#8a5a3a', '#5e3b24', '#b7835c'), 'honey': ('#f0a428', '#c47812', '#f9cf78'), 'wood': ('#c08a52', '#8c5f34', '#e2b783'),
    'oil': ('#e9c844', '#b8952a', '#f7e59a'), 'soil': ('#5a4232', '#3c2b20', '#8a6a52'), 'lav': ('#c9b8e6', '#9681bd', '#e9e0f7'),
    'linen': ('#ece2c8', '#c7b893', '#faf5e8'), 'bread': ('#d39050', '#a1622c', '#f0c084'), 'steel': ('#9fb1ba', '#6f8590', '#d6e2e8'),
    'panel': ('#3d6fa8', '#284c78', '#8fb8e3'), 'white': ('#f4f4ee', '#c9ccc4', '#ffffff'), 'teal': ('#4aa39b', '#2f746e', '#98d6cf'),
    'clay': ('#c9673f', '#9a4428', '#ec9a76'), 'night': ('#5d6fae', '#3d4d86', '#a9b6e6'),
}

I = {}
def icon(name, pal, *els): I[name] = (pal, els)

# ---- Goods ----
icon('wheat', 'gold',
  '<path class="ln" d="M32 60 V18" stroke-width="3"/>',
  *[f'<ellipse cx="{32 + dx}" cy="{y}" rx="5" ry="8" fill="@a" transform="rotate({ang} {32 + dx} {y})"/>' for y in (22, 32, 42) for dx, ang in ((-6, -25), (6, 25))],
  '<ellipse cx="32" cy="12" rx="4.5" ry="8" fill="@c"/>')
icon('beans', 'green',
  '<path d="M10 40 C 12 18, 40 10, 54 16 C 56 30, 36 50, 10 40 Z" fill="@a"/>',
  '<circle cx="22" cy="34" r="5" fill="@c"/>', '<circle cx="32" cy="28" r="5" fill="@c"/>', '<circle cx="42" cy="22" r="5" fill="@c"/>',
  '<path class="ln" d="M54 16 C 58 12, 58 8, 56 6" stroke-width="2.5"/>')
icon('tomato', 'red',
  '<circle cx="32" cy="36" r="20" fill="@a"/>', '<ellipse cx="24" cy="30" rx="6" ry="4" fill="@c"/>',
  '<path d="M32 16 L36 22 L44 20 L38 26 L42 32 L32 27 L22 32 L26 26 L20 20 L28 22 Z" fill="#5f9a3a"/>')
icon('sunflower', 'sun',
  *[f'<ellipse cx="32" cy="14" rx="6" ry="11" fill="@a" transform="rotate({a} 32 32)"/>' for a in range(0, 360, 45)],
  '<circle cx="32" cy="32" r="11" fill="#6a4426"/>', '<circle cx="29" cy="29" r="3" fill="#8a5c34"/>')
icon('flax', 'blue',
  '<path class="ln" d="M32 60 V34" stroke-width="3"/>',
  *[f'<ellipse cx="32" cy="16" rx="7" ry="10" fill="@a" transform="rotate({a} 32 26)"/>' for a in range(0, 360, 72)],
  '<circle cx="32" cy="26" r="5" fill="@c"/>')
icon('egg', 'cream', '<path d="M32 8 C 46 8, 52 30, 52 40 C 52 52, 43 58, 32 58 C 21 58, 12 52, 12 40 C 12 30, 18 8, 32 8 Z" fill="@a"/>',
  '<ellipse cx="24" cy="26" rx="5" ry="8" fill="@c"/>')
icon('manure', 'brown', '<path d="M8 54 H56 C 56 44, 48 40, 42 40 C 44 32, 38 26, 32 26 C 26 26, 20 32, 22 40 C 16 40, 8 44, 8 54 Z" fill="@a"/>',
  '<path d="M28 26 C 28 20, 34 18, 34 12 C 38 16, 38 22, 34 26 Z" fill="@b"/>', '<ellipse cx="22" cy="46" rx="5" ry="2.5" fill="@c"/>')
icon('honey', 'honey', '<path d="M16 22 H48 V52 C 48 56, 44 58, 40 58 H24 C 20 58, 16 56, 16 52 Z" fill="@a"/>',
  '<rect x="13" y="12" width="38" height="10" rx="3" fill="#c08a52"/>', '<path d="M16 30 C 22 34, 26 28, 32 32 C 38 36, 42 28, 48 30 V24 H16 Z" fill="@b"/>',
  '<rect x="21" y="36" width="5" height="14" rx="2.5" fill="@c"/>')
icon('flour', 'cream', '<path d="M18 20 C 14 30, 12 44, 14 56 H50 C 52 44, 50 30, 46 20 Z" fill="@a"/>',
  '<path d="M20 20 C 24 12, 40 12, 44 20 C 38 16, 26 16, 20 20 Z" fill="@b"/>', '<path class="ln" d="M24 14 L32 20 L40 14" stroke-width="2.5"/>',
  '<path class="ln" d="M32 50 V32 M32 36 l-5 -4 M32 36 l5 -4 M32 42 l-5 -4 M32 42 l5 -4" stroke-width="2.2" stroke="#c49330"/>')
icon('bran', 'wood', '<path d="M8 36 H56 C 54 50, 44 56, 32 56 C 20 56, 10 50, 8 36 Z" fill="#9c7a52"/>',
  *[f'<ellipse cx="{x}" cy="{y}" rx="5" ry="3" fill="@{c}" transform="rotate({r} {x} {y})"/>' for x, y, r, c in ((18, 32, 20, 'a'), (28, 30, -15, 'c'), (38, 31, 30, 'a'), (46, 33, -20, 'c'), (24, 26, 10, 'a'), (34, 24, -30, 'a'))])
icon('oil', 'oil', '<path d="M26 8 H38 V18 C 48 22, 50 30, 50 40 V52 C 50 56, 46 58, 42 58 H22 C 18 58, 14 56, 14 52 V40 C 14 30, 16 22, 26 18 Z" fill="@a"/>',
  '<rect x="24" y="4" width="16" height="7" rx="2" fill="#8c5f34"/>', '<rect x="20" y="30" width="5" height="20" rx="2.5" fill="@c"/>')
icon('seedcake', 'wood', '<ellipse cx="32" cy="40" rx="24" ry="12" fill="@b"/>', '<ellipse cx="32" cy="34" rx="24" ry="12" fill="@a"/>',
  *[f'<ellipse cx="{x}" cy="{y}" rx="2" ry="1.3" fill="#5e3b24"/>' for x, y in ((22, 32), (30, 28), (38, 34), (44, 30), (28, 38), (36, 40), (20, 37))])
icon('compost', 'soil', '<path d="M6 56 C 8 40, 22 34, 32 34 C 42 34, 56 40, 58 56 Z" fill="@a"/>',
  '<path class="ln" d="M32 34 V20" stroke="#4f7d2e" stroke-width="3"/>', '<path d="M32 22 C 22 22, 18 14, 20 8 C 28 8, 32 14, 32 22 Z" fill="#78a94a"/>',
  '<path d="M32 26 C 40 26, 46 20, 44 14 C 38 14, 32 18, 32 26 Z" fill="#9ccc6a"/>', '<ellipse cx="22" cy="46" rx="3" ry="2" fill="@c"/>', '<ellipse cx="42" cy="48" rx="3" ry="2" fill="@c"/>')
icon('yarn', 'lav', '<circle cx="32" cy="34" r="20" fill="@a"/>', '<path class="ln" d="M16 26 C 26 30, 40 28, 50 22 M14 36 C 26 42, 42 40, 52 32 M20 48 C 30 50, 42 48, 48 44" stroke="#9681bd" stroke-width="2.5"/>',
  '<path class="ln" d="M44 50 C 50 56, 56 56, 60 52" stroke="#9681bd" stroke-width="2.5"/>')
icon('linen', 'linen', '<rect x="10" y="38" width="44" height="12" rx="3" fill="@b"/>', '<rect x="12" y="26" width="40" height="12" rx="3" fill="@a"/>',
  '<rect x="14" y="14" width="36" height="12" rx="3" fill="@c"/>', '<path class="ln" d="M20 20 H44" stroke="#c7b893" stroke-width="2"/>')
icon('bread', 'bread', '<path d="M8 42 C 8 24, 22 18, 32 18 C 42 18, 56 24, 56 42 C 56 48, 52 50, 46 50 H18 C 12 50, 8 48, 8 42 Z" fill="@a"/>',
  '<path class="ln" d="M20 30 l6 8 M30 26 l6 8 M40 26 l6 8" stroke="#f0c084" stroke-width="3"/>')
icon('sauce', 'red', '<rect x="16" y="18" width="32" height="40" rx="6" fill="@a"/>', '<rect x="14" y="10" width="36" height="9" rx="3" fill="#9fb1ba"/>',
  '<rect x="16" y="32" width="32" height="14" fill="#f6efdf"/>', '<circle cx="32" cy="39" r="5" fill="@a"/>')
icon('honeycake', 'bread', '<path d="M10 34 H54 V50 C 54 54, 50 56, 46 56 H18 C 14 56, 10 54, 10 50 Z" fill="@a"/>',
  '<ellipse cx="32" cy="34" rx="22" ry="8" fill="#f9cf78"/>', '<path d="M18 36 C 18 42, 22 42, 22 36 Z M38 38 C 38 46, 43 46, 43 38 Z" fill="#f0a428"/>', '<circle cx="32" cy="24" r="5" fill="#e0563c"/>')

# ---- Buildings ----
icon('silo', 'steel', '<rect x="18" y="20" width="28" height="38" fill="@a"/>', '<path d="M18 22 C 18 8, 46 8, 46 22 Z" fill="@c"/>',
  '<path class="ln" d="M18 32 H46 M18 44 H46" stroke="#6f8590" stroke-width="2"/>', '<rect x="27" y="48" width="10" height="10" fill="@b"/>')
icon('garage', 'wood', '<path d="M6 28 L32 10 L58 28 V58 H6 Z" fill="@a"/>', '<rect x="14" y="32" width="36" height="26" fill="@b"/>',
  '<path class="ln" d="M14 40 H50 M14 48 H50" stroke="#e2b783" stroke-width="2"/>', '<path d="M24 20 L32 14 L40 20 Z" fill="#3d6fa8"/>')
icon('field', 'green', '<path d="M4 40 L32 24 L60 40 L32 56 Z" fill="#8a6a52"/>', '<path class="ln" d="M12 42 L36 28 M20 46 L44 32 M28 50 L52 36" stroke="#5a4232" stroke-width="2.5"/>',
  *[f'<path d="M{x} {y} c -3 -6, 0 -10, 0 -12 c 0 2, 3 6, 0 12 Z" fill="@a"/>' for x, y in ((16, 40), (24, 36), (32, 32), (24, 44), (32, 40), (40, 36), (32, 48), (40, 44), (48, 40))])
icon('sprinkler', 'blue', '<rect x="29" y="34" width="6" height="24" rx="2" fill="#9fb1ba"/>', '<rect x="22" y="30" width="20" height="8" rx="4" fill="#6f8590"/>',
  '<path class="ln" d="M24 30 C 16 20, 10 22, 6 30 M40 30 C 48 20, 54 22, 58 30 M32 30 C 32 18, 28 12, 24 8 M32 30 C 32 18, 36 12, 40 8" stroke="@a" stroke-width="3"/>')
icon('coop', 'wood', '<path d="M6 30 L32 12 L58 30 V58 H6 Z" fill="@a"/>', '<path d="M4 30 L32 10 L60 30" class="ln" stroke="#c9673f" stroke-width="5"/>',
  '<circle cx="32" cy="42" r="10" fill="#f6efdf"/>', '<path d="M30 34 l2 -5 l3 5 Z" fill="#e0563c"/>', '<path d="M41 42 l5 2 l-5 2 Z" fill="#f0a428"/>', '<circle cx="35" cy="40" r="1.6" fill="#2a2a2a"/>')
icon('hive', 'honey', '<path d="M12 54 C 8 34, 18 14, 32 14 C 46 14, 56 34, 52 54 Z" fill="@a"/>',
  '<path class="ln" d="M14 44 H50 M13 34 H51 M18 24 H46" stroke="@b" stroke-width="2.5"/>', '<path d="M28 54 C 28 46, 36 46, 36 54 Z" fill="#5e3b24"/>',
  '<ellipse cx="50" cy="14" rx="5" ry="3.5" fill="#2f3b35"/>', '<ellipse cx="48" cy="10" rx="3" ry="4" fill="#e9f3fb"/>', '<ellipse cx="53" cy="10" rx="3" ry="4" fill="#e9f3fb"/>')
icon('composter', 'wood', '<rect x="10" y="26" width="44" height="32" rx="2" fill="@a"/>', '<path class="ln" d="M10 36 H54 M10 46 H54 M22 26 V58 M42 26 V58" stroke="@b" stroke-width="2.5"/>',
  '<path d="M16 26 C 18 16, 26 14, 30 20 C 34 12, 46 14, 48 26 Z" fill="#78a94a"/>')
icon('mill', 'cream', '<path d="M18 58 V26 L32 16 L46 26 V58 Z" fill="@a"/>', '<rect x="27" y="44" width="10" height="14" rx="4" fill="#8c5f34"/>',
  '<circle cx="32" cy="22" r="3.5" fill="#5e3b24"/>', *[f'<rect x="30" y="0" width="5" height="20" rx="2" fill="#c08a52" transform="rotate({a} 32 22)"/>' for a in (0, 90, 180, 270)])
icon('press', 'oil', '<rect x="12" y="44" width="40" height="14" rx="3" fill="#8c5f34"/>', '<rect x="16" y="10" width="6" height="36" fill="#6f8590"/>', '<rect x="42" y="10" width="6" height="36" fill="#6f8590"/>',
  '<rect x="12" y="8" width="40" height="8" rx="3" fill="#9fb1ba"/>', '<rect x="22" y="26" width="20" height="12" rx="2" fill="@a"/>', '<path class="ln" d="M32 16 V26" stroke-width="4"/>', '<path d="M32 48 C 28 54, 36 54, 32 48 Z" fill="@a"/>')
icon('spinner', 'wood', '<circle cx="36" cy="28" r="18" class="ln" stroke="@a" stroke-width="5"/>', '<path class="ln" d="M36 10 V46 M18 28 H54 M23 15 L49 41 M49 15 L23 41" stroke="@b" stroke-width="2"/>',
  '<circle cx="36" cy="28" r="4" fill="@b"/>', '<path class="ln" d="M36 46 L26 58 M36 46 L46 58 M12 58 H52" stroke="@b" stroke-width="3"/>', '<circle cx="12" cy="44" r="6" fill="#c9b8e6"/>')
icon('loom', 'wood', '<rect x="8" y="10" width="48" height="8" rx="2" fill="@a"/>', '<rect x="8" y="46" width="48" height="8" rx="2" fill="@a"/>', '<rect x="8" y="10" width="6" height="48" fill="@b"/>', '<rect x="50" y="10" width="6" height="48" fill="@b"/>',
  '<path class="ln" d="M20 18 V46 M26 18 V46 M32 18 V46 M38 18 V46 M44 18 V46" stroke="#c7b893" stroke-width="2"/>', '<rect x="16" y="28" width="32" height="10" fill="#ece2c8"/>')
icon('bakery', 'clay', '<path d="M8 58 V36 C 8 18, 56 18, 56 36 V58 Z" fill="@a"/>', '<path d="M20 58 V44 C 20 34, 44 34, 44 44 V58 Z" fill="#3c2b20"/>',
  '<path d="M26 58 C 22 50, 30 46, 32 40 C 34 46, 42 50, 38 58 Z" fill="#f5c53d"/>', '<rect x="40" y="10" width="8" height="14" fill="@b"/>')
icon('cannery', 'steel', '<rect x="8" y="40" width="48" height="8" rx="4" fill="#6f8590"/>', '<rect x="14" y="18" width="16" height="22" rx="3" fill="@a"/>', '<rect x="34" y="18" width="16" height="22" rx="3" fill="@a"/>',
  '<rect x="14" y="24" width="16" height="9" fill="#e0563c"/>', '<rect x="34" y="24" width="16" height="9" fill="#e0563c"/>', '<circle cx="16" cy="52" r="4" fill="#3c2b20"/>', '<circle cx="48" cy="52" r="4" fill="#3c2b20"/>')
icon('solar', 'panel', '<path d="M6 40 L18 16 H58 L46 40 Z" fill="@a"/>', '<path class="ln" d="M19 28 H52 M31 16 L19 40 M45 16 L33 40" stroke="@c" stroke-width="2"/>',
  '<rect x="28" y="40" width="6" height="16" fill="#6f8590"/>', '<rect x="18" y="54" width="26" height="5" rx="2" fill="#6f8590"/>')
icon('turbine', 'white', '<path d="M30 60 L31 26 H33 L34 60 Z" fill="@a"/>', '<circle cx="32" cy="24" r="4" fill="@b"/>',
  *[f'<path d="M32 24 C 30 16, 30 8, 33 2 C 36 10, 35 18, 32 24 Z" fill="@a" transform="rotate({a} 32 24)"/>' for a in (0, 120, 240)])
icon('battery', 'teal', '<rect x="16" y="12" width="32" height="46" rx="6" fill="@b"/>', '<rect x="26" y="6" width="12" height="8" rx="2" fill="#6f8590"/>',
  '<rect x="21" y="40" width="22" height="13" rx="2" fill="@c"/>', '<rect x="21" y="25" width="22" height="13" rx="2" fill="@c"/>', '<rect x="21" y="17" width="22" height="6" rx="2" fill="@a"/>')
icon('digester', 'green', '<path d="M10 56 V36 C 10 18, 54 18, 54 36 V56 Z" fill="@a"/>', '<rect x="8" y="52" width="48" height="6" rx="2" fill="#6f8590"/>',
  '<path d="M32 44 C 26 40, 28 32, 32 28 C 36 32, 38 40, 32 44 Z" fill="#f5c53d"/>', '<rect x="44" y="12" width="6" height="14" fill="#6f8590"/>')
icon('wheel', 'wood', '<path d="M2 50 C 12 46, 20 54, 32 50 C 44 46, 52 54, 62 50 V62 H2 Z" fill="#7fa6dc"/>',
  '<circle class="ln" cx="30" cy="32" r="20" stroke="@b" stroke-width="5"/>', '<circle cx="30" cy="32" r="5" fill="@b"/>',
  *[f'<rect x="27.5" y="9" width="5" height="12" rx="1" fill="@a" transform="rotate({a} 30 32)"/>' for a in range(0, 360, 45)],
  '<rect x="46" y="18" width="16" height="26" rx="2" fill="#9fb1ba"/>', '<path d="M44 20 L54 10 L64 20 Z" fill="#4f7d2e"/>')
icon('earth', 'brown', '<path d="M4 58 V44 H22 V32 H40 V20 H60 V58 Z" fill="@a"/>', '<path d="M4 44 H22 V48 H4 Z M22 32 H40 V36 H22 Z M40 20 H60 V24 H40 Z" fill="#78a94a"/>',
  '<path class="ln" d="M8 14 L22 28" stroke="#8c5f34" stroke-width="3.5"/>', '<path d="M20 24 L30 34 L26 40 L14 30 Z" fill="#9fb1ba"/>')
icon('pylon', 'wood', '<path d="M28 60 L30 10 H34 L36 60 Z" fill="@a"/>', '<rect x="16" y="14" width="32" height="5" rx="2" fill="@b"/>', '<rect x="20" y="26" width="24" height="4" rx="2" fill="@b"/>',
  '<circle cx="18" cy="13" r="2.5" fill="#4aa39b"/>', '<circle cx="46" cy="13" r="2.5" fill="#4aa39b"/>', '<path class="ln" d="M2 18 C 10 22, 14 22, 18 16 M46 16 C 50 22, 54 22, 62 18" stroke="#3c2b20" stroke-width="1.5"/>')
icon('sapling', 'green', '<path class="ln" d="M32 58 V30" stroke="#8c5f34" stroke-width="4"/>', '<path d="M32 36 C 18 36, 12 24, 14 14 C 26 14, 32 24, 32 36 Z" fill="@a"/>',
  '<path d="M32 30 C 44 30, 52 20, 50 10 C 40 10, 32 18, 32 30 Z" fill="@c"/>', '<ellipse cx="32" cy="58" rx="14" ry="4" fill="#8a6a52"/>')
icon('depot', 'wood', '<rect x="6" y="34" width="24" height="22" fill="@a"/>', '<rect x="30" y="34" width="24" height="22" fill="@b"/>', '<rect x="18" y="14" width="24" height="20" fill="@a"/>',
  '<path class="ln" d="M6 34 L30 56 M30 34 L6 56 M18 14 L42 34 M42 14 L18 34" stroke="@c" stroke-width="2"/>', '<path class="ln" d="M54 34 V6" stroke="#5e3b24" stroke-width="2.5"/>', '<path d="M54 6 H64 L60 11 L64 16 H54 Z" fill="#e0563c"/>')

# ---- Interface ----
icon('sun', 'sun', *[f'<rect x="30" y="2" width="4" height="10" rx="2" fill="@b" transform="rotate({a} 32 32)"/>' for a in range(0, 360, 45)],
  '<circle cx="32" cy="32" r="14" fill="@a"/>', '<circle cx="27" cy="27" r="4" fill="@c"/>')
icon('moon', 'night', '<path d="M40 8 C 24 8, 12 20, 12 34 C 12 48, 24 58, 38 58 C 48 58, 54 52, 56 46 C 40 50, 28 40, 30 26 C 31 18, 36 12, 40 8 Z" fill="@a"/>', '<circle cx="48" cy="16" r="2.5" fill="#f5c53d"/>')
icon('wind', 'blue', '<path class="ln" d="M6 24 H40 C 48 24, 50 14, 44 12 C 40 10, 36 14, 38 18 M6 36 H50 C 58 36, 60 46, 54 48 C 50 50, 46 46, 48 42 M10 48 H32" stroke="@a" stroke-width="4.5"/>')
icon('bolt', 'sun', '<path d="M36 4 L14 36 H30 L26 60 L50 26 H34 Z" fill="@a"/>', '<path d="M34 10 L20 32 H28 Z" fill="@c"/>')
icon('coin', 'gold', '<ellipse cx="32" cy="38" rx="22" ry="16" fill="@b"/>', '<ellipse cx="32" cy="32" rx="22" ry="16" fill="@a"/>',
  '<path d="M32 22 C 24 22, 22 30, 32 32 C 42 34, 40 42, 32 42 M32 18 V46" class="ln" stroke="@b" stroke-width="3"/>')
icon('clock', 'cream', '<circle cx="32" cy="34" r="24" fill="@a"/>', '<circle cx="32" cy="34" r="18" fill="@c"/>', '<path class="ln" d="M32 34 V20 M32 34 L42 40" stroke-width="3.5"/>', '<rect x="27" y="4" width="10" height="7" rx="2" fill="#c08a52"/>')
icon('truck', 'teal', '<rect x="4" y="22" width="34" height="22" rx="3" fill="@a"/>', '<path d="M38 28 H50 L58 36 V44 H38 Z" fill="@b"/>', '<rect x="42" y="30" width="8" height="6" fill="@c"/>',
  '<rect x="8" y="16" width="10" height="8" fill="#e8c35a"/>', '<rect x="20" y="16" width="10" height="8" fill="#e0563c"/>', '<circle cx="16" cy="46" r="6" fill="#3c2b20"/>', '<circle cx="48" cy="46" r="6" fill="#3c2b20"/>')
icon('soil', 'soil', '<path d="M4 52 C 10 40, 22 36, 32 36 C 42 36, 54 40, 60 52 Z" fill="@a"/>', '<path d="M32 38 C 18 36, 12 24, 16 12 C 28 14, 34 24, 32 38 Z" fill="#78a94a"/>',
  '<path d="M32 36 C 42 32, 50 22, 48 12 C 38 14, 32 24, 32 36 Z" fill="#9ccc6a"/>')
icon('water', 'blue', '<path d="M32 4 C 32 4, 52 28, 52 40 C 52 52, 42 60, 32 60 C 22 60, 12 52, 12 40 C 12 28, 32 4, 32 4 Z" fill="@a"/>', '<ellipse cx="24" cy="40" rx="4" ry="8" fill="@c"/>')
icon('bee', 'honey', '<ellipse cx="32" cy="36" rx="16" ry="12" fill="@a"/>', '<path class="ln" d="M28 25 V47 M37 25 V47" stroke="#2f3b35" stroke-width="4"/>',
  '<ellipse cx="24" cy="20" rx="8" ry="10" fill="#e9f3fb" transform="rotate(-20 24 20)"/>', '<ellipse cx="40" cy="20" rx="8" ry="10" fill="#e9f3fb" transform="rotate(20 40 20)"/>', '<circle cx="16" cy="36" r="5" fill="#2f3b35"/>')
icon('road', 'brown', '<path d="M20 60 L28 4 H36 L44 60 Z" fill="@c"/>', '<path class="ln" d="M32 10 V18 M32 26 V36 M32 44 V56" stroke="#f6efdf" stroke-width="3"/>')
icon('pause', 'ui', '<rect x="16" y="12" width="11" height="40" rx="3" fill="@a"/>', '<rect x="37" y="12" width="11" height="40" rx="3" fill="@a"/>')
icon('play', 'ui', '<path d="M18 10 L52 32 L18 54 Z" fill="@a"/>')
icon('rotate', 'ui', '<path class="ln" d="M50 30 C 50 18, 42 10, 32 10 C 20 10, 12 20, 12 32 C 12 44, 22 54, 32 54 C 40 54, 46 50, 50 42" stroke="@a" stroke-width="5"/>', '<path d="M42 30 H58 L50 18 Z" fill="@a"/>')
icon('close', 'ui', '<path class="ln" d="M16 16 L48 48 M48 16 L16 48" stroke="@a" stroke-width="7"/>')
icon('route', 'clay', '<path class="ln" d="M14 50 C 14 36, 50 40, 50 24" stroke="#6f8590" stroke-width="4" stroke-dasharray="5 5"/>', '<circle cx="14" cy="52" r="7" fill="@b"/>',
  '<path d="M50 4 C 42 4, 38 10, 38 16 C 38 24, 50 34, 50 34 C 50 34, 62 24, 62 16 C 62 10, 58 4, 50 4 Z" fill="@a"/>', '<circle cx="50" cy="16" r="4" fill="@c"/>')
icon('book', 'clay', '<path d="M6 14 C 16 10, 26 12, 32 18 C 38 12, 48 10, 58 14 V54 C 48 50, 38 52, 32 58 C 26 52, 16 50, 6 54 Z" fill="@a"/>',
  '<path d="M10 18 C 18 15, 26 17, 30 22 V52 C 26 48, 18 46, 10 48 Z" fill="#f6efdf"/>', '<path d="M54 18 C 46 15, 38 17, 34 22 V52 C 38 48, 46 46, 54 48 Z" fill="#f6efdf"/>')
icon('chart', 'teal', '<rect x="8" y="34" width="10" height="22" rx="2" fill="@b"/>', '<rect x="24" y="22" width="10" height="34" rx="2" fill="@a"/>', '<rect x="40" y="10" width="10" height="46" rx="2" fill="@c"/>')
icon('warn', 'honey', '<path d="M32 6 L60 56 H4 Z" fill="@a"/>', '<rect x="29" y="22" width="6" height="18" rx="3" fill="#3c2b20"/>', '<circle cx="32" cy="47" r="3.5" fill="#3c2b20"/>')
icon('check', 'green', '<circle cx="32" cy="32" r="26" fill="@a"/>', '<path class="ln" d="M18 32 L28 42 L46 22" stroke="#ffffff" stroke-width="6"/>')
icon('medal', 'gold', '<path d="M20 4 H30 L36 22 H26 Z M44 4 H34 L28 22 H38 Z" fill="#c9673f"/>', '<circle cx="32" cy="40" r="18" fill="@a"/>', '<circle cx="32" cy="40" r="11" fill="@c"/>')
icon('trash', 'clay', '<rect x="14" y="18" width="36" height="40" rx="4" fill="@a"/>', '<rect x="10" y="10" width="44" height="8" rx="3" fill="@b"/>', '<rect x="26" y="4" width="12" height="6" rx="2" fill="@b"/>',
  '<path class="ln" d="M24 26 V50 M32 26 V50 M40 26 V50" stroke="@c" stroke-width="3"/>')
icon('menu', 'ui', '<rect x="10" y="14" width="44" height="7" rx="3.5" fill="@a"/>', '<rect x="10" y="29" width="44" height="7" rx="3.5" fill="@a"/>', '<rect x="10" y="44" width="44" height="7" rx="3.5" fill="@a"/>')

icon('station', 'white', '<path class="ln" d="M16 50 V60 M38 50 V60" stroke="#8c5f34" stroke-width="4"/>', '<rect x="8" y="28" width="38" height="22" rx="2" fill="@a"/>',
  '<path class="ln" d="M12 35 H42 M12 40 H42 M12 45 H42" stroke="@b" stroke-width="2.5"/>', '<rect x="6" y="23" width="42" height="6" rx="2" fill="#78a94a"/>',
  '<path class="ln" d="M54 60 V18" stroke="#c9673f" stroke-width="3"/>', '<circle cx="54" cy="12" r="3" fill="#c9673f"/>',
  '<ellipse cx="46" cy="12" rx="4.5" ry="3" fill="@a"/>', '<ellipse cx="62" cy="12" rx="4.5" ry="3" fill="@a"/>', '<ellipse cx="54" cy="5" rx="3" ry="3" fill="@b"/>')

ORDER = list(I.keys())
COLS = 10

def darker(hx, k=0.6):
    h = hx.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return '#%02x%02x%02x' % (int(r * k), int(g * k), int(b * k))

UIFILL = None
def mute(hx, k=0.22):
    import colorsys
    h = hx.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    H, L, S = colorsys.rgb_to_hls(r, g, b); S *= (1 - k); L = L * 0.95
    r, g, b = colorsys.hls_to_rgb(H, L, S)
    return '#%02x%02x%02x' % (int(r * 255), int(g * 255), int(b * 255))
def render():
    out = []
    rows = (len(ORDER) + COLS - 1) // COLS
    ui = (UIFILL, UIFILL, UIFILL) if UIFILL else ('#46524c', '#2f3b35', '#7d8a83')
    for i, name in enumerate(ORDER):
        pal, els = I[name]
        a, b, c = ui if pal == 'ui' else (mute(x) for x in P[pal])
        x, y = (i % COLS) * 64, (i // COLS) * 64
        parts = []
        for e in els:
            e = e.replace('@a', a).replace('@b', b).replace('@c', c)
            if 'class="ln"' in e:
                # A line: stroked only, a little darker than the shade.
                if 'stroke="' not in e: e = e.replace('class="ln"', f'class="ln" stroke="{darker(b, 0.85)}"')
                e = e.replace('class="ln"', 'fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"')
            else:
                # A shape: its fill, with a soft edge a shade darker.
                m = re.search(r'fill="(#[0-9a-fA-F]{6})"', e)
                edge = darker(m.group(1), 0.82) if m else b
                e = e.replace('/>', f' stroke="{edge}" stroke-width="1.6" stroke-opacity="0.7"/>', 1)
            parts.append(e)
        out.append(f'<g transform="translate({x} {y})"><g transform="translate(4 4) scale(0.875)">{"".join(parts)}</g></g>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{COLS * 64}" height="{rows * 64}" viewBox="0 0 {COLS * 64} {rows * 64}"><defs></defs>{"".join(out)}</svg>'

def css(prefix):
    lines = [f'.{prefix}-i {{ display: inline-block; flex: none; width: var(--s, 32px); height: var(--s, 32px); background: url("icons.svg") no-repeat; background-size: calc(var(--s, 32px) * {COLS}) auto; vertical-align: middle; }}']
    for i, n in enumerate(ORDER):
        lines.append(f'.{prefix}-i--{n} {{ background-position: calc(var(--s, 32px) * -{i % COLS}) calc(var(--s, 32px) * -{i // COLS}); }}')
    return '\n'.join(lines)

if __name__ == '__main__':
    prefix, outdir = sys.argv[1:3]
    UIFILL = sys.argv[3] if len(sys.argv) > 3 else None
    open(f'{outdir}/icons.svg', 'w').write(render())
    open(f'{outdir}/icons.css', 'w').write(css(prefix))
    print(len(ORDER), 'icons')
