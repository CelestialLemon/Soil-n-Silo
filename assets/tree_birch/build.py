"""Pale marked trunks and an airy yellow-green crown. Distant canopy: #b5ce76."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *
reset(316)


def birch(n):
    stems = [(0,0,.12,2.65)] if n != 1 else [(-.10,0,-.18,2.5),(.10,.04,.28,2.75)]
    for x,y,lean,h in stems:
        stem('Birch_pale_stem',[(x,y,0,.115),(x+lean*.35,y,.95,.085),
                              (x+lean,y+.05,h,.045)],'birch_bark',6)
        for j,z in enumerate([.43,.78,1.17,1.57]):
            a = j*2.4
            cx = x+lean*min(z/.95,1)*.35
            box('Birch_bark_mark',(cx+.072*math.cos(a),y+.072*math.sin(a),z),
                (.14,.08,.085),'birch_mark',rot=(0,0,a+math.pi/2))
    shift = [-.04,.10,-.16][n]
    for loc,scale in [((shift,0,2.65),(.49,.48,.76)),
                      ((shift-.48,-.10,2.36),(.39,.40,.53)),
                      ((shift+.46,.11,2.51),(.39,.40,.57)),
                      ((shift+.10,-.43,2.19),(.38,.35,.50)),
                      ((shift-.13,.41,2.26),(.39,.36,.48))]:
        crown('Birch_airy_lobe',loc,scale,'birch_leaf',.17*n)


variants('tree_birch',birch,[(1,.96,0),(.94,.90,.2),(.96,1.02,-.3)])
