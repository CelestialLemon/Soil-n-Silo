"""Riverside willow: wide dome and long soft curtains. Distant canopy: #83b390.

Spring fresh sprout green (#91bc61), summer soft silver green, autumn yellow
(#cdb04a: gold and gold_leaf), winter bare arching boughs trailing thin
curtains of golden-ochre twigs (#b48d42).
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *

COLOURS = {'spring': ('sprout','leaf'), 'summer': ('willow_leaf','willow_shade'),
           'autumn': ('gold_leaf','gold')}


def willow(n, season):
    lean = [.10,-.13,.04][n]
    stem('Willow_crooked_trunk',[(0,0,0,.23),(-.10,0,.75,.17),(lean,.03,1.68,.13),(.10,0,2.3,.075)])
    for i in range(3):
        a = i*math.tau/3
        beam('Willow_low_bough',(lean,0,1.43),(.38*math.cos(a),.38*math.sin(a),2.18),.16,'bark',6)
    if season == 'winter':
        # Bare: boughs arch out from the crown and trail curtains of twigs.
        for i in range(8):
            a = i*math.tau/8+.1*n
            rise = 2.62+.08*math.sin(i*2+n)
            crest = (.30*math.cos(a),.30*math.sin(a),rise)
            bough('Willow_arching',(.10,0,2.2),crest,.08)
            bough('Willow_arching',crest,(.70*math.cos(a),.70*math.sin(a),rise-.3),.07)
            twigs('Willow_bare_curtain',(.70*math.cos(a),.70*math.sin(a),1.62+.12*math.sin(i*2+n)),
                  (.13,.13,.72+.06*math.cos(i+n)),'straw' if i%3 else 'twig',a)
        return
    leaf, shade = COLOURS[season]
    crown('Willow_dome',(0,0,2.39),(.94,.94,.59),leaf)
    for i in range(8):
        a = i*math.tau/8+.1*n
        z = 1.48 + .12*math.sin(i*2+n)
        crown('Willow_drooping_curtain',(.74*math.cos(a),.74*math.sin(a),z),
              (.42,.42,1.13+.06*math.cos(i+n)),
              shade if i%3 == 0 else leaf,a)


seasonal('tree_willow',317,willow,[(1,1,0),(.92,.88,.23),(1.04,1.06,-.21)])
