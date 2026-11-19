"""Build the building style study GLBs, separately from the game's model catalog."""
from functools import partial
from math import cos, pi, sin
from pathlib import Path
import sys
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build import OUT, export
from kit import P, archway, circle, lin, rrect, shade


def palette(*colors):
    return tuple(map(lin, colors))


CEDAR, CREAM, RED, RED_LIGHT = palette(0x9b6240, 0xf5dfad, 0xa73042, 0xc24e51)
ADOBE, CLAY, CHALK, INDIGO = palette(0xe7a677, 0xb65e4e, 0xffd6a1, 0x374a82)
COBALT, WHITE, YELLOW, STEEL = palette(0x365a9c, 0xdce7e8, 0xf4ba43, 0x374357)
BASALT, ASH, PATINA, BRONZE = palette(0x535468, 0x818196, 0x479b8e, 0xb77548)
BAMBOO, STRAW, CANVAS, PLUM = palette(0x91622f, 0xd7aa58, 0xffe7b3, 0x714a78)


def block(m, x0, x1, z0, z1, y0, y1, color, mat='plain'):
    m.box((x0, y0, z0), (x1, y1, z1), color, mat)


def apron(m, color):
    m.deck(7.65, 0.18, color)


def roof(m, a, b, c, d, color, mat='plain', thick=0.16):
    """A roof plane from its four corners, in perimeter order."""
    top = [a, b, c, d]
    m.hexa([(x, y - thick, z) for x, y, z in top] + top, color, mat)


def gable(m, x0, ridge, x1, z0, z1, eave, peak, colors):
    for left, right, low, high, color in (
        (x0, ridge, eave, peak, colors[0]), (ridge, x1, peak, eave, colors[1])
    ):
        roof(m, (left, low, z0), (right, high, z0), (right, high, z1), (left, low, z1), color)
    m.beam((ridge, peak, z0), (ridge, peak, z1), (0.19, 0.17), colors[1], 'plain')


def facade_gable(m, left, ridge, right, z, base, peak, color, back=False):
    pts = [(left, base, z), (right, base, z), (ridge, peak, z)]
    m.poly(pts[::-1] if back else pts, color)


def pane(m, x0, x1, y0, y1, z, frame, glass=P.seaglass):
    with m.at(((x0 + x1) / 2, y0, z)):
        m.window(x1 - x0, y1 - y0, frame, glass, bar=0.11)


def oven(m, x, z, outer, trim, foot=0.18):
    """The baking oven and its loaves, readable from the gameplay camera."""
    block(m, x - 1.12, x + 1.12, z - 1.5, z + 0.16, foot, foot + 0.66, trim)
    m.lathe([(1.03, foot + 0.61), (1.04, foot + 1.16), (0.86, foot + 1.7),
             (0.5, foot + 2.02), (0.0, foot + 2.16)], outer, sides=14, centre=(x, z - 0.88))
    with m.at((x, foot + 0.66, z + 0.13)):
        m.fire(1.24, 0.98, trim)
    m.ball((x - 0.77, foot + 0.74, z + 0.1), 0.18, P.straw, sides=8, squash=0.6)


def stack(m, x, z, base, top, color, collar):
    block(m, x - 0.43, x + 0.43, z - 0.39, z + 0.39, base, top - 0.3, color)
    block(m, x - 0.56, x + 0.56, z - 0.51, z + 0.51, top - 0.3, top, collar)
    block(m, x - 0.31, x + 0.31, z - 0.29, z + 0.29, top, top + 0.008, P.dark)
    m.empty('smoke_emitter', (x, top + 0.08, z))


def charger(m, x, z, color, cap):
    m.lathe([(0.29, 0.18), (0.29, 0.34), (0.2, 0.37), (0.2, 1.29), (0.24, 1.39)],
            sides=8, centre=(x, z), cols=[cap, color, color, cap], cap1=True, cap_col=cap)
    m.pipe([(x - 0.17, 1.05, z), (x - 0.4, 0.8, z), (x - 0.43, 0.29, z),
            (x - 0.57, 0.22, z + 0.21)], 0.045, STEEL, sides=6)
    m.ball((x, 1.16, z + 0.17), 0.105, P.seaglass, sides=8)
    m.part('running_lamp')
    m.ball((x, 1.16, z + 0.2), 0.09, P.glow, sides=8)
    m.part()


def gauge(m, x, z, bottom, top, rim):
    block(m, x - 0.23, x + 0.23, z - 0.03, z + 0.08, bottom, top, rim)
    block(m, x - 0.12, x + 0.12, z + 0.08, z + 0.10, bottom + 0.12, top - 0.12, STEEL)
    block(m, x - 0.12, x + 0.12, z + 0.10, z + 0.11, bottom + 0.12, (bottom + top) / 2, P.gold)


def ladder(m, x, z, top, color):
    for dx in (-0.27, 0.27):
        m.tube((x + dx, 0.66, z), (x + dx, top, z), 0.055, color, sides=6)
    for i in range(1, int(top / 0.43) - 1):
        y = 0.43 * i + 0.42
        m.tube((x - 0.27, y, z), (x + 0.27, y, z), 0.047, color, sides=6)


def timber_bakery(m):
    apron(m, P.stone)
    block(m, -3.3, 3.2, -3.0, 1.15, 0.18, 3.12, CEDAR, 'timber')
    for x in (-3.3, 3.2):
        m.boards((x, 0.45, -3.0), (x, 0.45, 1.15), 2.67, CEDAR, n=8)
    for z, back in ((1.16, False), (-3.01, True)):
        facade_gable(m, -3.3, -0.7, 3.2, z, 3.11, 5.52, CREAM, back)
    gable(m, -3.7, -0.7, 3.67, -3.5, 1.65, 2.85, 5.45, (RED, RED_LIGHT))
    for z in (-3.42, 0, 1.54):
        for x in (-3.65, 3.62):
            m.beam((x, 2.88, z), (-0.7, 5.46, z), (0.09, 0.09), RED, 'plain')
    stack(m, -2.04, -1.36, 2.2, 6.35, P.stone_dark, CREAM)
    with m.at((2.18, 0.18, 1.16)):
        m.door(1.19, 2.22, shade(CEDAR, 0.62), arch=False)
    pane(m, 0.26, 1.27, 1.52, 2.45, 1.16, CREAM)
    pane(m, -1.18, -0.25, 3.55, 4.28, 1.18, CEDAR)
    oven(m, -1.75, 3.36, RED, P.stone_dark)


def timber_garage(m):
    apron(m, P.stone)
    for x in (-2.93, 2.93):
        for z, top in ((-2.94, 2.8), (2.28, 4.16)):
            m.post(x, z, top, 0.31, CEDAR, y0=0.18)
        m.boards((x, 0.49, -3), (x, 0.49, 1.6), 1.35, CEDAR, n=10)
    m.boards((-3, 0.2, -3), (3, 0.2, -3), 2.56, CEDAR, n=14)
    roof(m, (-3.55, 2.82, -3.53), (3.55, 2.82, -3.53),
         (3.55, 4.48, 2.7), (-3.55, 4.48, 2.7), RED, thick=0.25)
    roof(m, (-3.55, 4.48, 2.7), (3.55, 4.48, 2.7),
         (3.55, 3.37, 3.52), (-3.55, 3.37, 3.52), RED_LIGHT, thick=0.25)
    for x in (-2.93, 2.93):
        m.beam((x, 2.56, -3.3), (x, 4.27, 2.55), (0.19, 0.2), CEDAR)
        m.beam((x, 2.62, 2.27), (x, 3.81, 0.65), (0.21, 0.2), CEDAR)
    m.beam((-3.4, 3.63, 2.28), (3.4, 3.63, 2.28), (0.26, 0.26), CEDAR)
    for x in (-2.93, 2.93):
        m.beam((x, 2.4, 2.28), (x * 0.57, 3.63, 2.28), (0.22, 0.2), CEDAR)
    charger(m, 3.39, 3.18, CREAM, RED)


def timber_silo(m):
    apron(m, P.stone)
    body = rrect(4.65, 4.65, 0.16, 1)
    m.prism(body, 0.18, 1.2, P.stone_dark, top=0.95)
    for y0, y1, col in ((1.2, 1.48, CREAM), (1.48, 6.86, CEDAR), (6.86, 7.18, CREAM)):
        m.prism(body, y0, y1, col, 'timber')
    for offset in (-1.92, 1.92):
        for z in (-2.35, 2.35):
            m.beam((offset, 1.15, z), (offset, 7.2, z), (0.26, 0.19), shade(CEDAR, 0.7))
    for z, back in ((2.34, False), (-2.34, True)):
        facade_gable(m, -2.34, 0, 2.34, z, 7.1, 9.0, CREAM, back)
    gable(m, -2.67, 0, 2.67, -2.71, 2.71, 7.02, 9.08, (RED, RED_LIGHT))
    block(m, -0.46, 0.46, -0.44, 0.44, 8.72, 9.58, CREAM)
    gable(m, -0.63, 0, 0.63, -0.59, 0.59, 9.52, 9.96, (RED, RED_LIGHT))
    gauge(m, 1.06, 2.33, 2.55, 6.42, CREAM)
    ladder(m, -1.29, 2.5, 7.04, CREAM)
    with m.at((0, 0.18, 2.33)):
        m.door(1.0, 2.02, shade(CEDAR, 0.7), arch=False)


def adobe_arcade(m, x0, x1, z0, z1, foot, top, opening, color, pillars):
    """Extrude the wall above a real arched opening."""
    span = x1 - x0
    centre = (x0 + x1) / 2
    radius = span * 0.5 - pillars
    spring = opening - radius
    profile = [(x0, foot), (centre - radius, foot), (centre - radius, spring)]
    profile += [(centre + radius * cos(pi * i / 10), spring + radius * sin(pi * i / 10))
                for i in range(9, -1, -1)]
    profile += [(centre + radius, foot), (x1, foot), (x1, top), (x0, top)]
    with m.at(yaw=90):
        m.extrude(profile, -z1, -z0, color)


def adobe_bakery(m):
    apron(m, CHALK)
    m.prism(rrect(7.2, 4.52, 0.55, 3, cz=-1.35), 0.18, 3.08, ADOBE)
    m.prism(rrect(7.35, 4.65, 0.58, 3, cz=-1.35), 3.08, 3.37, CHALK)
    m.prism(rrect(4.55, 3.36, 0.52, 3, cx=-1.1, cz=-1.62), 3.3, 4.16, CLAY)
    m.prism(rrect(4.61, 3.42, 0.56, 3, cx=-1.1, cz=-1.62), 4.16, 4.29, CHALK)
    stack(m, 2.34, -2.42, 2.9, 5.22, CLAY, CHALK)
    adobe_arcade(m, -0.3, 3.45, 2.32, 2.81, 0.18, 2.93, 2.65, CHALK, 0.46)
    roof(m, (-0.2, 3.03, 0.62), (3.5, 3.03, 0.62), (3.5, 3.03, 2.88), (-0.2, 3.03, 2.88), CLAY)
    with m.at((1.57, 0.18, 0.92)):
        m.door(1.46, 2.37, INDIGO)
    with m.at((3.23, 1.69, -1.6), yaw=90):
        m.window(0.95, 1.12, INDIGO, P.sky, arch=True, proud=0.34)
    oven(m, -1.92, 3.24, CLAY, CHALK)


def adobe_garage(m):
    apron(m, CHALK)
    block(m, -3.43, 3.43, -3.28, -2.85, 0.18, 3.36, ADOBE)
    adobe_arcade(m, -3.46, 3.46, 2.55, 3.19, 0.18, 3.6, 3.21, ADOBE, 1.3)
    with m.at(yaw=90):
        adobe_arcade(m, -2.91, 2.61, -3.46, -2.9, 0.18, 3.45, 2.86, ADOBE, 1.1)
        adobe_arcade(m, -2.91, 2.61, 2.9, 3.46, 0.18, 3.45, 2.86, ADOBE, 1.1)
    block(m, -3.59, 3.59, -3.48, 3.35, 3.35, 3.75, CHALK)
    for x in (-3.4, 3.15):
        block(m, x, x + 0.25, -3.34, 3.21, 3.75, 4.02, CLAY)
    for z in (-3.34, 2.97):
        block(m, -3.4, 3.4, z, z + 0.24, 3.75, 4.02, CLAY)
    block(m, -2.01, 2.01, 3.35, 3.38, 3.48, 3.64, INDIGO)
    for x in (-2.76, 2.76):
        block(m, x - 0.48, x + 0.48, 3.19, 3.31, 0.18, 0.58, CLAY)
    charger(m, 2.68, 3.55, INDIGO, CHALK)


def adobe_silo(m):
    apron(m, CHALK)
    for cx, cz, w, top in ((-1.31, -0.66, 4.38, 8.14), (1.88, 0.66, 3.09, 5.88)):
        shape = rrect(w, 4.7, 0.63, 4, cx, cz)
        rings = [[(cx + (x - cx) * taper, y, cz + (z - cz) * taper) for x, z in shape]
                 for y, taper in ((0.18, 1), (0.75, 1), (top - 0.38, 0.84), (top, 0.84))]
        m.loft(rings, cols=[CLAY, ADOBE, CHALK], cap1=True, cap_col=CLAY)
        m.prism(rrect(w * 0.48, 1.94, 0.36, 3, cx, cz - 0.4), top, top + 0.52, CLAY)
        for offset in (-0.26, 0.26):
            block(m, cx + offset * w - 0.14, cx + offset * w + 0.14, cz + 1.35, cz + 2.52,
                  0.18, 2.28, ADOBE)
    gauge(m, -1.3, 1.66, 2.32, 5.88, INDIGO)
    with m.at((1.87, 0.18, 2.99)):
        m.door(1.02, 2.08, INDIGO)
    ladder(m, -0.42, 1.88, 7.95, CEDAR)


def enamel_bakery(m):
    apron(m, STEEL)
    block(m, -3.51, 3.51, -3.12, 0.81, 0.18, 0.61, STEEL)
    block(m, -3.5, 3.5, -3.12, 0.81, 0.61, 3.26, WHITE)
    for x0, x1 in ((-3.61, -0.08), (-0.08, 3.61)):
        roof(m, (x0, 4.68, -3.38), (x1, 3.46, -3.38),
             (x1, 3.46, 1.04), (x0, 4.68, 1.04), COBALT, 'tin')
        facade_gable(m, x0, x0, x1, 0.81, 3.25, 4.54, WHITE)
        facade_gable(m, x0, x0, x1, -3.12, 3.25, 4.54, WHITE, True)
        with m.at((x0 + 0.065, 3.35, -1.27), yaw=-90):
            m.window(3.72, 1.08, STEEL, P.sky)
    stack(m, -2.94, -2.09, 3.2, 5.44, STEEL, YELLOW)
    pane(m, -2.99, -0.55, 1.35, 2.57, 0.82, COBALT)
    block(m, -3.29, 0.25, 0.82, 1.05, 2.69, 2.98, YELLOW)
    for x in (-2.66, -2.0, -1.34):
        m.ball((x, 1.14, 1.77), 0.24, P.straw, sides=8, squash=0.52)
    block(m, -2.99, -1.0, 0.84, 2.03, 0.18, 1.02, STEEL)
    oven(m, 1.94, 3.42, WHITE, COBALT)


def enamel_garage(m):
    apron(m, STEEL)
    block(m, -3.48, 3.48, -3.39, -3.06, 0.18, 3.46, COBALT, 'tin')
    for x in (-3.33, 3.33):
        block(m, x - 0.19, x + 0.19, -3.07, 2.68, 0.18, 2.62, COBALT, 'tin')
        block(m, x - 0.29, x + 0.29, 2.65, 3.06, 0.18, 3.84, YELLOW)
    roof(m, (-3.78, 3.52, -3.62), (3.78, 3.52, -3.62),
         (3.78, 4.21, 0.59), (-3.78, 4.21, 0.59), COBALT, 'tin')
    roof(m, (-3.78, 5.15, 0.59), (3.78, 5.15, 0.59),
         (3.78, 3.66, 3.44), (-3.78, 3.66, 3.44), WHITE, 'tin')
    for x in (-2.87, -1.4, 0.07, 1.54):
        with m.at((x + 0.63, 4.2, 0.59), yaw=180):
            m.window(1.32, 0.77, STEEL, P.sky)
    block(m, -3.73, 3.73, 3.28, 3.43, 3.35, 3.62, YELLOW)
    for x in (-2.68, 2.68):
        block(m, x - 0.07, x + 0.07, 0.2, 3.54, 0.18, 0.21, YELLOW)
    charger(m, 3.23, 3.55, WHITE, YELLOW)


def enamel_silo(m):
    apron(m, STEEL)
    for cx, cz, cap in ((-1.54, -1.15, 8.46), (1.54, 0.43, 7.43)):
        m.lathe([(1.47, 0.18), (1.47, 0.72), (1.43, 0.9), (1.43, cap - 1.29),
                 (1.48, cap - 1.29), (1.48, cap - 0.94), (1.43, cap - 0.94),
                 (1.43, cap - 0.3), (1.11, cap), (0.0, cap + 0.16)],
                sides=18, centre=(cx, cz), cols=[STEEL, STEEL, COBALT, COBALT, YELLOW, YELLOW, COBALT, WHITE, WHITE])
        gauge(m, cx, cz + 1.43, 1.35, cap - 1.62, STEEL)
        m.pipe([(cx + 0.67, 0.18, cz + 1.92), (cx + 0.67, cap - 0.32, cz + 1.92),
                (cx + 0.42, cap + 0.39, cz + 1.38), (cx + 0.1, cap + 0.39, cz),
                (cx + 0.1, cap + 0.13, cz)], 0.11, STEEL, sides=8)
        ladder(m, cx - 0.55, cz + 1.55, cap - 0.35, YELLOW)
    m.beam((-1.74, 6.83, -1.15), (1.66, 6.83, 0.43), (0.37, 0.42), STEEL, 'plain')


def courses(m, outline, low, high):
    levels = [low, low + 0.42]
    while levels[-1] + 0.78 < high:
        levels.append(levels[-1] + 0.78)
    levels.append(high)
    rings = [[(x, y, z) for x, z in outline] for y in levels]
    m.loft(rings, cols=lambda i, j: shade(BASALT, 0.83 + ((i * 13 + j * 7) % 6) * 0.07),
           cap1=True)


def basalt_bakery(m):
    apron(m, ASH)
    courses(m, rrect(7.0, 4.4, 0.5, 2, cz=-1.31), 0.18, 2.87)
    m.loft([[(x, y, z) for x, z in outline] for y, outline in (
        (2.86, rrect(7.56, 4.88, 0.41, 2, cz=-1.31)),
        (3.97, rrect(5.02, 2.84, 0.36, 2, cz=-1.31)),
        (4.66, rrect(2.4, 0.84, 0.19, 2, cz=-1.31)),
    )], cols=[PATINA, shade(PATINA, 0.78)], cap0=True, cap1=True, cap_col=PATINA)
    stack(m, 1.97, -1.86, 2.3, 5.98, BASALT, BRONZE)
    with m.at((-2.18, 0.18, 0.91)):
        m.door(1.37, 2.21, PATINA)
    pane(m, -1.28, -0.31, 1.44, 2.34, 0.91, BRONZE)
    oven(m, 1.55, 3.36, BASALT, BRONZE)
    block(m, 0.08, 3.13, 0.9, 1.23, 2.48, 2.66, BRONZE)


def basalt_garage(m):
    apron(m, ASH)
    for x in (-3.02, 3.02):
        courses(m, rrect(1.14, 6.62, 0.2, 2, x, -0.05), 0.18, 3.13)
    block(m, -2.6, 2.6, -3.21, -2.88, 0.18, 2.77, BASALT)
    m.vault(-3.73, 3.73, 3.53, 3.14, 1.03, lambda k: (shade(PATINA, 0.82 + (k % 3) * 0.09), 'plain'),
            n=12, edge=BRONZE, under=BASALT)
    for x in (-2.99, 2.99):
        m.beam((x, 1.95, 3.28), (x * 0.59, 3.18, 3.29), (0.18, 0.2), BRONZE, 'plain')
    m.beam((-3.58, 3.04, 3.28), (3.58, 3.04, 3.28), (0.2, 0.21), BRONZE, 'plain')
    charger(m, 2.86, 3.54, BRONZE, PATINA)


def basalt_silo(m):
    apron(m, ASH)
    phase = pi / 8
    m.lathe([(2.8, 0.18), (2.8, 0.62), (2.58, 0.94), (2.2, 6.59), (2.35, 6.86),
             (2.59, 7.14), (2.59, 7.34)],
            sides=8, phase=phase, cols=[ASH, ASH, BASALT, BASALT, ASH, BRONZE])
    m.lathe([(2.62, 7.34), (1.73, 8.34), (0.81, 9.47), (0.28, 10.25), (0.0, 10.5)],
            sides=8, phase=phase, cols=lambda i, j: shade(PATINA, 0.74 + j % 3 * 0.16))
    for j in range(8):
        a = phase + j * pi / 4
        m.beam((2.73 * cos(a), 0.52, 2.73 * sin(a)), (2.32 * cos(a), 6.9, 2.32 * sin(a)),
               (0.27, 0.23), ASH, 'plain')
    with m.at((0, 0.18, 2.59)):
        m.door(1.17, 2.15, PATINA)
    gauge(m, -0.82, 2.25, 2.49, 6.24, BRONZE)
    m.pipe([(1.53, 0.83, 2.52), (1.53, 6.75, 2.52), (1.02, 7.69, 1.97)], 0.12, BRONZE)


def canopy(m, corners, color, alternate):
    """A twist in a continuous cloth sheet, cut in broad alternating panels."""
    a, b, c, d = corners

    def edge(p, q, t):
        return tuple((1 - t) * v + t * w for v, w in zip(p, q))

    for i in range(5):
        l, r = i / 5, (i + 1) / 5
        p, q, s, t = edge(a, b, l), edge(a, b, r), edge(d, c, r), edge(d, c, l)
        mid = tuple(sum(v) / 4 for v in zip(p, q, s, t))
        mid = (mid[0], mid[1] - 0.27 - 0.14 * sin(pi * (l + r) / 2), mid[2])
        panels = [p, q, s, t]
        for first, second in zip(panels, panels[1:] + panels[:1]):
            m.poly([first, mid, second], alternate if i % 2 else color)
    for p in corners:
        x, y, z = p
        m.tube((x * 0.94, 0.18, z * 0.94), (x, y + 0.18, z), 0.13, BAMBOO, 'timber', sides=8)
        m.ball((x, y + 0.19, z), 0.15, BAMBOO, sides=8)


def canvas_bakery(m):
    apron(m, P.stone)
    outline = circle(2.68, 20, -0.15, -0.71)
    m.prism(outline, 0.18, 0.63, PLUM)
    m.prism(outline, 0.63, 3.24, STRAW, 'timber')
    canopy(m, [(-3.46, 4.77, -3.37), (3.49, 3.48, -3.37),
               (3.49, 5.31, 1.64), (-3.46, 3.52, 1.64)], CANVAS, shade(CANVAS, 0.91))
    stack(m, -1.8, -1.67, 3.18, 5.69, PLUM, STRAW)
    with m.at((1.46, 0.18, 1.61), yaw=28):
        m.door(1.16, 2.2, PLUM)
    with m.at((2.48, 1.4, -0.88), yaw=90):
        m.window(1.1, 1.17, PLUM, P.sky)
    oven(m, -1.25, 3.36, PLUM, STRAW)


def canvas_garage(m):
    apron(m, P.stone)
    canopy(m, [(-3.49, 3.17, -3.4), (3.49, 4.95, -3.4),
               (3.49, 3.2, 3.17), (-3.49, 5.47, 3.17)], CANVAS, PLUM)
    for x in (-3.22, 3.22):
        m.boards((x, 0.2, -3.11), (x, 0.2, 0.14), 1.6, STRAW, n=7)
    m.boards((-3.22, 0.2, -3.11), (3.22, 0.2, -3.11), 2.71, STRAW, n=15)
    for x, high in ((-3.49, 5.47), (3.49, 3.2)):
        m.tube((x * 0.66, 0.18, 3.51), (x, high - 0.4, 3.17), 0.087, BAMBOO, 'timber', sides=7)
    charger(m, 3.34, 3.53, PLUM, CANVAS)


def canvas_silo(m):
    apron(m, P.stone)
    for i in range(6):
        a = i * pi / 3
        x, z = cos(a), sin(a)
        m.tube((2.55 * x, 0.18, 2.55 * z), (2.17 * x, 4.04, 2.17 * z), 0.2, BAMBOO, 'timber', sides=7)
        m.shoe(2.55 * x, 2.55 * z, 0.74, 0.44)
    m.lathe([(0.73, 1.77), (1.38, 2.33), (2.54, 3.32), (2.83, 4.0), (2.78, 6.58),
             (2.63, 7.13), (2.51, 7.31)], sides=18, cap0=True,
            cols=[PLUM, BAMBOO, STRAW, STRAW, BAMBOO, PLUM])
    for y, r in ((3.63, 2.71), (4.66, 2.82), (5.67, 2.8), (6.58, 2.78)):
        m.lathe([(r + 0.025, y), (r + 0.025, y + 0.13)], PLUM, sides=18)
    m.lathe([(2.98, 7.28), (2.65, 7.64), (2.06, 7.96), (1.14, 8.65), (0.14, 9.28)],
            sides=18, cols=lambda i, j: shade(CANVAS, 1 if j % 3 else 0.78), cap0=True, cap1=True)
    m.ball((0, 9.31, 0), 0.2, PLUM, sides=8)
    gauge(m, 0.54, 2.74, 4.18, 6.35, PLUM)
    ladder(m, -0.63, 2.73, 6.99, BAMBOO)


STYLES = {
    'timber': (timber_bakery, timber_garage, timber_silo),
    'adobe': (adobe_bakery, adobe_garage, adobe_silo),
    'enamel': (enamel_bakery, enamel_garage, enamel_silo),
    'basalt': (basalt_bakery, basalt_garage, basalt_silo),
    'canvas': (canvas_bakery, canvas_garage, canvas_silo),
}


if __name__ == '__main__':
    for style, builders in STYLES.items():
        for kind, build in zip(('bakery', 'garage', 'silo'), builders):
            model = SimpleNamespace(TITLE=kind.title(), GROUP='logistics' if kind != 'bakery' else 'processing',
                                    ABOUT='', TILES=(2, 2), build=build)
            export(f'{style}_{kind}', model)
    print(f'Study models written to {OUT}')
