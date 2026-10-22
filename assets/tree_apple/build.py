"""Low orchard tree, short trunk and coral fruit dots. Distant canopy: #567843.

Spring in blossom: pale pink and white lobes over fresh green (#e9c3c0 from
afar), summer green with fruit, autumn amber and gold leaves with ripe fruit
(#c0782e), winter bare boughs with grey-brown twig masses (#8a7d6e).
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *

LEAF = {'spring': ('leaf','blossom'), 'summer': ('apple_leaf','apple_leaf'),
        'autumn': ('gold_leaf','amber_leaf')}


def apple(n, season):
    lean = [-.07,.10,0][n]
    stem('Apple_short_trunk',[(0,0,0,.17),(.02,0,.5,.12),(lean,0,1.19,.08)])
    for i in range(3):
        a = i*math.tau/3+.3
        beam('Apple_orchard_fork',(lean,0,.64),(.31*math.cos(a),.31*math.sin(a),1.30),.13,'bark',6)
    if season == 'winter':
        for i in range(3):
            a = i*math.tau/3+.3
            fork = (.31*math.cos(a),.31*math.sin(a),1.30)
            for turn in (-.5,.5):
                tip = (.68*math.cos(a+turn)+lean*.5,.68*math.sin(a+turn),1.62+.1*(turn > 0))
                bough('Apple_bare',fork,tip,.08)
                twigs('Apple_bare',tip,(.2,.2,.16),'twig',a)
        twigs('Apple_bare_top',(lean,0,1.72),(.3,.3,.2),'twig')
        return
    top, lobe = LEAF[season]
    crown('Apple_low_crown',(lean,0,1.53),(.73,.69,.59),top if season != 'spring' else 'blossom')
    for i in range(4):
        a = i*math.tau/4+.24*n
        colour = lobe if season != 'spring' else ('leaf' if i%2 else 'feather')
        crown('Apple_round_lobe',(.42*math.cos(a)+lean,.42*math.sin(a),1.38+.10*(i%2)),
              (.46,.46,.49),colour,a)
    for i in range(6):
        a = i*math.tau/6+.17
        loc = (.73*math.cos(a)+lean,.73*math.sin(a),1.47+.17*(i%2))
        if season == 'spring':
            # Blossom clusters dotted over the crown instead of fruit.
            sphere('Apple_blossom',loc,(.13,.13,.11),'feather' if i%2 else 'blossom',6,3)
        else:
            sphere('Apple_fruit',loc,(.115,.115,.12),
                   'apple_red' if i%3 or season == 'autumn' else 'blossom',6,3)
    if season == 'spring':
        sphere('Apple_blossom',(lean,0,2.1),(.22,.22,.14),'feather',6,3)


seasonal('tree_apple',319,apple,[(1,1,0),(.92,.96,.28),(1.06,1.06,-.2)])
