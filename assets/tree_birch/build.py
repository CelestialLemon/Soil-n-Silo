"""Pale marked trunks and an airy yellow-green crown. Distant canopy: #b5ce76.

Spring fresh sprout green (#91bc61), summer yellow-green, autumn thinning
gold (#e3b43c) through which the pale boughs show, winter bare pale boughs
with purple-brown twig masses (#8c6c66).
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *

LOBES = [((0,0,2.65),(.49,.48,.76)), ((-.48,-.10,2.36),(.39,.40,.53)),
         ((.46,.11,2.51),(.39,.40,.57)), ((.10,-.43,2.19),(.38,.35,.50)),
         ((-.13,.41,2.26),(.39,.36,.48))]


def birch(n, season):
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
    if season in ('autumn','winter'):
        # Pale boughs up into the crown, seen through its thinning leaves.
        top = stems[-1]
        base = (top[0]+top[2]*.6,top[1],1.75)
        for i,((x,y,z),_) in enumerate(LOBES[1:]):
            bough('Birch_pale',base,(x*.8+shift,y*.8,z+.2),.075,'birch_bark')
    if season == 'winter':
        for (x,y,z),(sx,sy,sz) in LOBES:
            twigs('Birch_bare',(x+shift,y,z+.1),(sx*.72,sy*.72,sz*.55),'birch_twig',.17*n)
        return
    lobes = LOBES if season != 'autumn' else [LOBES[i] for i in (0,1,2)]
    for i,(loc,scale) in enumerate(lobes):
        if season == 'autumn':
            # Thinning: fewer, smaller lobes.
            scale = tuple(v*.82 for v in scale)
        colour = {'spring':'sprout','summer':'birch_leaf','autumn':'gold_leaf'}[season]
        crown('Birch_airy_lobe',(loc[0]+shift,loc[1],loc[2]),scale,colour,.17*n)


seasonal('tree_birch',316,birch,[(1,.96,0),(.94,.90,.2),(.96,1.02,-.3)])
