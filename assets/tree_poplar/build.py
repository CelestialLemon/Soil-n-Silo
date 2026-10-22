"""Tall Lombardy poplar with a narrow upright crown. Distant canopy: #2e633d.

Spring fresh green (#588650), summer deep green, autumn a thinning gold column
(#e3b43c) with its upright boughs showing, winter bare upswept boughs with
narrow grey-brown twig spires (#8a7d6e).
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *

COLOURS = {'spring': ('oak_light','leaf'), 'summer': ('poplar_leaf','poplar_light'),
           'autumn': ('gold_leaf','amber_leaf')}


def poplar(n, season):
    lean = [.03,.14,-.11][n]
    stem('Poplar_upright_trunk',[(0,0,0,.16),(0,0,.9,.105),(lean,0,3.15,.05)])
    if season in ('autumn','winter'):
        # Upswept boughs hugging the trunk: a Lombardy poplar's bare outline.
        for i in range(4):
            a = i*math.tau/4+.2
            bough('Poplar_upswept',(lean*.3,0,1.0+.12*i),
                  (.26*math.cos(a)+lean*.8,.26*math.sin(a),3.3-.15*(i%2)),.075)
    if season == 'winter':
        twigs('Poplar_bare_spire',(lean,0,2.75),(.16,.16,.8),'twig')
        for i in range(4):
            a = i*math.tau/4+.2
            twigs('Poplar_bare',(.25*math.cos(a)+lean*.8,.25*math.sin(a),2.6+.15*(i%2)),
                  (.11,.11,.5),'twig',a)
        return
    leaf, light = COLOURS[season]
    if season == 'autumn':
        # Thinning: a slimmer column and two of its four lobes left.
        crown('Poplar_tall_column',(lean,0,2.7),(.40,.40,1.38),leaf)
        for i in (1,3):
            a = i*math.tau/4+.2
            crown('Poplar_upright_lobe',(.28*math.cos(a)+lean*.5,.28*math.sin(a),2.2+.08*n*math.cos(a)),
                  (.34,.34,.82),light,a)
        return
    crown('Poplar_tall_column',(lean,0,2.62),(.51,.51,1.58),leaf)
    for i in range(4):
        a = i*math.tau/4+.2
        crown('Poplar_upright_lobe',(.28*math.cos(a)+lean*.5,.28*math.sin(a),2.05+.13*(i%2)+.08*n*math.cos(a)),
              (.43,.43,.99),light if i%2 else leaf,a)


seasonal('tree_poplar',318,poplar,[(1,1,0),(1.08,.88,.28),(.94,1.06,-.18)])
